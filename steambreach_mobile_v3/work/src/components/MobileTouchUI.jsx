import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants/gameConstants';

const CONSUMABLES = ['decoy.bin', 'burner.ovpn', '0day_poc.sh', 'wallet.dat'];

// ─── STYLES ──────────────────────────────────────────────────
const S = {
  wrap: {
    flexShrink: 0,
    borderTop: `1px solid ${COLORS.border}`,
    background: `${COLORS.bg}f0`,
    padding: '8px 6px 10px',
  },
  row: {
    display: 'flex', gap: '5px', flexWrap: 'wrap',
    marginBottom: '6px',
  },
  scrollRow: {
    display: 'flex', gap: '5px', overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    paddingBottom: '4px',
  },
  label: {
    fontSize: '10px', letterSpacing: '1.5px', color: COLORS.textDim,
    marginBottom: '4px', paddingLeft: '2px', fontWeight: 'bold',
  },
};

const btn = (color, active, big) => ({
  flexShrink: 0,
  padding: big ? '12px 16px' : '10px 12px',
  background: active ? `${color}20` : `${COLORS.bg}`,
  border: `1px solid ${active ? color : COLORS.border}`,
  borderRadius: '5px',
  color: active ? color : COLORS.textDim,
  fontFamily: 'inherit',
  fontSize: big ? '14px' : '12px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  transition: 'background 0.1s, border-color 0.1s',
});

const ipBtn = (color) => ({
  ...btn(color, true, false),
  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
  gap: '2px', padding: '10px 14px', width: '100%',
});

// ─── COMPONENT ───────────────────────────────────────────────
export default function MobileTouchUI({
  world, isInside, privilege, targetIP, currentDir,
  isChatting, chatTarget, botnet, proxies, inventory,
  heat, trace, mapExpanded, consumables,
  onCommand,
  onToggleKeyboard,
  onToggleMap,
  externalSelectedIP,
  clearExternalSelection,
}) {
  const [panel, setPanel] = useState('actions');
  const [selectedIP, setSelectedIP] = useState(null);

  // React to map node taps — auto-open target detail
  React.useEffect(() => {
    if (externalSelectedIP) {
      setSelectedIP(externalSelectedIP);
      setPanel('target_detail');
      clearExternalSelection?.();
    }
  }, [externalSelectedIP]);

  // ─── DERIVED STATE ────────────────────────────────────────
  const discoveredNodes = useMemo(() => {
    return Object.entries(world)
      .filter(([k, v]) => k !== 'local' && !v.isHidden)
      .map(([ip, node]) => ({
        ip,
        name: node.org?.orgName || node.name || ip,
        exp: node.exp || 'hydra',
        sec: node.sec || 'LOW',
        hacked: node.hacked || false,
        hasSliver: botnet.includes(ip),
        isProxy: proxies.includes(ip),
        employees: node.org?.employees || [],
      }));
  }, [world, botnet, proxies]);

  const currentFiles = useMemo(() => {
    if (!isInside || !targetIP || !world[targetIP]) return [];
    const fs = world[targetIP].files || {};
    return fs[currentDir] || [];
  }, [isInside, targetIP, world, currentDir]);

  const currentDirs = useMemo(() => currentFiles.filter(f => f.endsWith('/')), [currentFiles]);
  const currentDataFiles = useMemo(() => currentFiles.filter(f => !f.endsWith('/')), [currentFiles]);

  const selectedNode = selectedIP ? discoveredNodes.find(n => n.ip === selectedIP) : null;

  // ─── HELPERS ──────────────────────────────────────────────
  const tap = (cmd) => {
    onCommand(cmd);
    if (panel === 'target_detail') setPanel('targets');
  };

  const selectIP = (ip) => {
    setSelectedIP(ip);
    setPanel('target_detail');
  };

  const fileAction = (file) => {
    if (CONSUMABLES.includes(file)) {
      tap(`cat ${file}`);
    } else if (privilege === 'root') {
      tap(`exfil ${file}`);
    } else {
      tap(`cat ${file}`);
    }
  };

  const expLabel = (exp) => ({ hydra: 'HYDRA', sqlmap: 'SQLMAP', msfconsole: 'MSFCONSOLE', curl: 'CURL' }[exp] || exp.toUpperCase());
  const expColor = (exp) => ({ hydra: COLORS.danger, sqlmap: COLORS.warning, msfconsole: '#ff6633', curl: COLORS.file }[exp] || COLORS.primary);

  // ─── TAB BAR ──────────────────────────────────────────────
  const TabBar = ({ tabs, right }) => (
    <div style={{ display: 'flex', gap: '5px', marginBottom: '6px' }}>
      {tabs.map(([id, label, color]) => (
        <button key={id} onClick={() => { setPanel(id); if (id === 'targets') setSelectedIP(null); }}
          style={btn(color || COLORS.primary, panel === id || (id === 'targets' && panel === 'target_detail'), false)}>
          {label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {right}
      <button onClick={onToggleKeyboard} style={btn(COLORS.textDim, false, false)}>⌨</button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // CHAT MODE
  // ═══════════════════════════════════════════════════════════
  if (isChatting) {
    return (
      <div style={S.wrap}>
        <div style={S.label}>SPEARPHISH — {chatTarget}</div>
        <div style={S.row}>
          {[
            "Hi, IT department here",
            "We need to verify your account",
            "Security breach detected",
            "Can you confirm your password?",
            "Urgent, from management",
            "Account will be locked",
          ].map((msg, i) => (
            <button key={i} onClick={() => tap(msg)} style={btn(COLORS.chat, true, false)}>{msg}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => tap('exit')} style={btn(COLORS.danger, true, true)}>✕ EXIT CHAT</button>
          <button onClick={onToggleKeyboard} style={btn(COLORS.textDim, false, true)}>⌨ TYPE CUSTOM</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // INSIDE A NODE
  // ═══════════════════════════════════════════════════════════
  if (isInside) {
    return (
      <div style={S.wrap}>
        <TabBar
          tabs={[
            ['actions', 'ACTIONS', COLORS.primary],
            ['files', `FILES (${currentFiles.length})`, COLORS.file],
          ]}
          right={<button onClick={() => tap('exit')} style={btn(COLORS.danger, true, false)}>✕ EXIT</button>}
        />

        {panel === 'actions' && (
          <>
            {privilege !== 'root' && (
              <div style={S.row}>
                <button onClick={() => tap('pwnkit')} style={btn('#ff4444', true, true)}>⚡ PWNKIT → ROOT</button>
              </div>
            )}
            {privilege === 'root' && (
              <>
                <div style={S.label}>PERSIST</div>
                <div style={S.row}>
                  <button onClick={() => tap('sliver')} style={btn(COLORS.secondary, true, true)}>SLIVER</button>
                  <button onClick={() => tap('chisel')} style={btn(COLORS.primary, true, true)}>CHISEL</button>
                  <button onClick={() => tap('wipe')} style={btn(COLORS.warning, true, true)}>WIPE</button>
                  <button onClick={() => tap('reptile')} style={btn('#aa66ff', true, true)}>REPTILE</button>
                </div>
                <div style={S.label}>ATTACK</div>
                <div style={S.row}>
                  <button onClick={() => tap('shred')} style={btn(COLORS.danger, true, false)}>SHRED</button>
                  <button onClick={() => tap('openssl')} style={btn(COLORS.danger, true, false)}>RANSOM</button>
                  <button onClick={() => tap('msfvenom')} style={btn(COLORS.warning, true, false)}>MSFVENOM</button>
                  <button onClick={() => tap('eternalblue')} style={btn(COLORS.danger, true, false)}>ETERNALBLUE</button>
                  {inventory.includes('DPI') && <button onClick={() => tap('ettercap')} style={btn(COLORS.chat, true, false)}>ETTERCAP</button>}
                  <button onClick={() => tap('xmrig')} style={btn(COLORS.warning, true, false)}>XMRIG</button>
                </div>
              </>
            )}
            <div style={S.label}>NAVIGATE</div>
            <div style={S.row}>
              <button onClick={() => tap('ls')} style={btn(COLORS.textDim, true, false)}>LS</button>
              <button onClick={() => tap('cd ..')} style={btn(COLORS.textDim, true, false)}>CD ..</button>
              <button onClick={() => setPanel('files')} style={btn(COLORS.file, true, false)}>BROWSE FILES →</button>
            </div>
            {(consumables?.decoy > 0 || consumables?.burner > 0 || consumables?.zeroday > 0) && (
              <>
                <div style={S.label}>ITEMS</div>
                <div style={S.row}>
                  {consumables.decoy > 0 && <button onClick={() => tap('use decoy')} style={btn(COLORS.primary, true, false)}>DECOY ×{consumables.decoy}</button>}
                  {consumables.burner > 0 && <button onClick={() => tap('use burner')} style={btn(COLORS.secondary, true, false)}>BURNER ×{consumables.burner}</button>}
                  {consumables.zeroday > 0 && <button onClick={() => tap('use zeroday')} style={btn(COLORS.danger, true, false)}>0DAY ×{consumables.zeroday}</button>}
                </div>
              </>
            )}
          </>
        )}

        {panel === 'files' && (
          <>
            <div style={{ ...S.label, fontSize: '12px', color: COLORS.primary }}>📂 {currentDir}</div>
            {currentDir !== '/' && (
              <button onClick={() => tap('cd ..')} style={{ ...btn(COLORS.textDim, true, false), marginBottom: '6px' }}>⬆ PARENT DIR</button>
            )}
            {currentFiles.length === 0 && (
              <div style={{ color: COLORS.textDim, fontSize: '12px', padding: '10px' }}>Empty directory</div>
            )}
            <div style={S.row}>
              {currentDirs.map((dir, i) => (
                <button key={`d${i}`} onClick={() => tap(`cd ${dir.replace('/', '')}`)} style={btn(COLORS.primary, true, true)}>📁 {dir}</button>
              ))}
            </div>
            {currentDataFiles.length > 0 && (
              <>
                <div style={S.label}>{privilege === 'root' ? 'TAP TO EXFIL / COLLECT' : 'TAP TO READ'}</div>
                <div style={S.row}>
                  {currentDataFiles.map((file, i) => {
                    const isCon = CONSUMABLES.includes(file);
                    return (
                      <button key={`f${i}`} onClick={() => fileAction(file)} style={btn(isCon ? COLORS.secondary : COLORS.warning, true, true)}>
                        {isCon ? '🔧' : '💰'} {file}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // OUTSIDE — MAIN HUB
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={S.wrap}>
      <TabBar tabs={[
        ['actions', 'ACTIONS', COLORS.primary],
        ['targets', `TARGETS (${discoveredNodes.length})`, COLORS.ip],
      ]} />

      {panel === 'actions' && (
        <>
          <div style={S.row}>
            <button onClick={() => tap('nmap')} style={btn(COLORS.primary, true, true)}>📡 NMAP SCAN</button>
            <button onClick={onToggleMap} style={btn(COLORS.secondary, mapExpanded, true)}>🗺 MAP</button>
            <button onClick={() => tap('status')} style={btn(COLORS.textDim, true, true)}>STATUS</button>
          </div>
          <div style={S.row}>
            <button onClick={() => tap('shop')} style={btn(COLORS.warning, true, true)}>🏪 SHOP</button>
            <button onClick={() => tap('contracts')} style={btn(COLORS.chat, true, true)}>📋 CONTRACTS</button>
            <button onClick={() => tap('save')} style={btn(COLORS.textDim, false, true)}>SAVE</button>
          </div>
          {botnet.length > 0 && (
            <>
              <div style={S.label}>BOTNET ({botnet.length})</div>
              <div style={S.scrollRow}>
                {discoveredNodes.filter(n => n.hasSliver).map((n, i) => (
                  <button key={i} onClick={() => selectIP(n.ip)} style={btn(COLORS.secondary, true, false)}>
                    🤖 {n.name} ({n.ip})
                  </button>
                ))}
              </div>
            </>
          )}
          {(consumables?.decoy > 0 || consumables?.burner > 0 || consumables?.zeroday > 0) && (
            <>
              <div style={S.label}>ITEMS</div>
              <div style={S.row}>
                {consumables?.decoy > 0 && <button onClick={() => tap('use decoy')} style={btn(COLORS.primary, true, false)}>DECOY ×{consumables.decoy}</button>}
                {consumables?.burner > 0 && <button onClick={() => tap('use burner')} style={btn(COLORS.secondary, true, false)}>BURNER ×{consumables.burner}</button>}
                {consumables?.zeroday > 0 && <button onClick={() => tap('use zeroday')} style={btn(COLORS.danger, true, false)}>0DAY ×{consumables.zeroday}</button>}
              </div>
            </>
          )}
        </>
      )}

      {panel === 'targets' && (
        <>
          {discoveredNodes.length === 0 ? (
            <button onClick={() => { tap('nmap'); setPanel('actions'); }} style={btn(COLORS.primary, true, true)}>
              NO TARGETS — TAP TO SCAN
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '200px', overflowY: 'auto' }}>
              {discoveredNodes.map((n, i) => (
                <button key={i} onClick={() => selectIP(n.ip)} style={ipBtn(n.hacked ? COLORS.secondary : COLORS.ip)}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ color: n.hacked ? COLORS.secondary : COLORS.ip, fontWeight: 'bold', fontSize: '13px' }}>{n.name}</span>
                    {n.hacked && <span style={{ color: COLORS.secondary, fontSize: '10px' }}>OWNED</span>}
                    {n.hasSliver && <span style={{ fontSize: '12px' }}>🤖</span>}
                    {n.isProxy && <span style={{ fontSize: '12px' }}>🛡</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: COLORS.textDim, fontSize: '11px' }}>{n.ip}</span>
                    <span style={{ color: COLORS.textDim, fontSize: '9px', border: `1px solid ${COLORS.border}`, padding: '1px 4px', borderRadius: '2px' }}>{n.sec}</span>
                    {n.employees.length > 0 && <span style={{ color: COLORS.chat, fontSize: '9px' }}>{n.employees.length} employees</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {panel === 'target_detail' && selectedNode && (
        <>
          <div style={{ ...S.label, fontSize: '12px', color: COLORS.ip }}>{selectedNode.name}</div>
          <div style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '6px', paddingLeft: '2px' }}>{selectedNode.ip} • {selectedNode.sec} SEC</div>

          <div style={S.row}>
            <button onClick={() => tap(`nmap ${selectedNode.ip}`)} style={btn(COLORS.primary, true, true)}>📡 SCAN</button>
            {!selectedNode.hacked && (
              <button onClick={() => tap(`${selectedNode.exp} ${selectedNode.ip}`)} style={btn(expColor(selectedNode.exp), true, true)}>
                ⚡ {expLabel(selectedNode.exp)}
              </button>
            )}
          </div>

          {selectedNode.hacked && (
            <>
              <div style={S.label}>NODE ACTIONS</div>
              <div style={S.row}>
                {!selectedNode.hasSliver && <button onClick={() => tap('sliver')} style={btn(COLORS.secondary, true, true)}>SLIVER</button>}
                {!selectedNode.isProxy && <button onClick={() => tap('chisel')} style={btn(COLORS.primary, true, true)}>CHISEL</button>}
                {selectedNode.hasSliver && <button onClick={() => tap(`mimikatz ${selectedNode.ip}`)} style={btn(COLORS.warning, true, true)}>MIMIKATZ</button>}
                {selectedNode.hasSliver && <button onClick={() => tap(`stash ${selectedNode.ip}`)} style={btn(COLORS.file, true, true)}>STASH</button>}
                <button onClick={() => tap(`hping3 ${selectedNode.ip}`)} style={btn(COLORS.danger, true, false)}>HPING3</button>
                <button onClick={() => tap(`disconnect ${selectedNode.ip}`)} style={btn(COLORS.textDim, false, false)}>DISCONNECT</button>
              </div>
            </>
          )}

          {selectedNode.employees.length > 0 && !selectedNode.hacked && (
            <>
              <div style={S.label}>EMPLOYEES — TAP TO SPEARPHISH</div>
              <div style={S.row}>
                {selectedNode.employees.map((emp, i) => (
                  <button key={i} onClick={() => tap(`spearphish ${emp.email}@${selectedNode.ip}`)} style={btn(COLORS.chat, true, true)}>
                    🎣 {emp.name} — {emp.role}
                  </button>
                ))}
              </div>
            </>
          )}

          <button onClick={() => { setSelectedIP(null); setPanel('targets'); }}
            style={{ ...btn(COLORS.textDim, false, false), marginTop: '4px' }}>
            ← BACK
          </button>
        </>
      )}
    </div>
  );
}
