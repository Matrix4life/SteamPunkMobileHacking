import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants/gameConstants';

// ─── STYLES ──────────────────────────────────────────────────
const S = {
  wrap: {
    flexShrink: 0,
    borderTop: `1px solid ${COLORS.border}`,
    background: `${COLORS.bg}f0`,
    padding: '6px 4px 8px',
  },
  row: {
    display: 'flex', gap: '4px', flexWrap: 'wrap',
    marginBottom: '4px',
  },
  scrollRow: {
    display: 'flex', gap: '4px', overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    paddingBottom: '2px',
  },
  label: {
    fontSize: '8px', letterSpacing: '1.5px', color: COLORS.textDim,
    marginBottom: '2px', paddingLeft: '2px',
  },
};

const btn = (color, active, big) => ({
  flexShrink: 0,
  padding: big ? '10px 14px' : '8px 10px',
  background: active ? `${color}25` : `${COLORS.bg}`,
  border: `1px solid ${active ? color : COLORS.border}`,
  borderRadius: '4px',
  color: active ? color : COLORS.textDim,
  fontFamily: 'inherit',
  fontSize: big ? '12px' : '10px',
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
  gap: '1px', padding: '6px 10px',
});

// ─── COMPONENT ───────────────────────────────────────────────
export default function MobileTouchUI({
  // Game state
  world, isInside, privilege, targetIP, currentDir,
  isChatting, chatTarget, botnet, proxies, inventory,
  heat, trace, mapExpanded, consumables,
  // Handlers
  onCommand, // (cmd: string) => void — executes full command
  onToggleKeyboard, // () => void — show text input
  onToggleMap, // () => void — expand/collapse map
}) {
  const [panel, setPanel] = useState('actions'); // 'actions' | 'targets' | 'files' | 'target_detail'
  const [selectedIP, setSelectedIP] = useState(null);

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

  const currentDirs = useMemo(() => {
    if (!isInside || !targetIP || !world[targetIP]) return [];
    const fs = world[targetIP].files || {};
    const entries = fs[currentDir] || [];
    return entries.filter(f => f.endsWith('/'));
  }, [isInside, targetIP, world, currentDir]);

  const currentDataFiles = useMemo(() => {
    return currentFiles.filter(f => !f.endsWith('/'));
  }, [currentFiles]);

  const selectedNode = selectedIP ? discoveredNodes.find(n => n.ip === selectedIP) : null;

  // ─── TAP HANDLERS ─────────────────────────────────────────
  const tap = (cmd) => {
    onCommand(cmd);
    // Auto-navigate back to actions after executing
    if (panel === 'target_detail') setPanel('targets');
  };

  const selectIP = (ip) => {
    setSelectedIP(ip);
    setPanel('target_detail');
  };

  // ─── EXPLOIT LABEL ─────────────────────────────────────────
  const expLabel = (exp) => {
    const map = { hydra: 'HYDRA (SSH)', sqlmap: 'SQLMAP (SQL)', msfconsole: 'MSFCONSOLE (SMB)', curl: 'CURL (LFI)' };
    return map[exp] || exp.toUpperCase();
  };
  const expColor = (exp) => {
    const map = { hydra: COLORS.danger, sqlmap: COLORS.warning, msfconsole: '#ff6633', curl: COLORS.file };
    return map[exp] || COLORS.primary;
  };

  // ─── RENDER: CHAT MODE ─────────────────────────────────────
  if (isChatting) {
    return (
      <div style={S.wrap}>
        <div style={S.label}>SPEARPHISH — {chatTarget}</div>
        <div style={S.row}>
          {[
            "Hi, IT department here",
            "We need to verify your account",
            "There's been a security breach",
            "Can you confirm your password?",
            "This is urgent, from management",
            "Your account will be locked",
          ].map((msg, i) => (
            <button key={i} onClick={() => tap(msg)} style={btn(COLORS.chat, true, false)}>
              {msg.length > 28 ? msg.slice(0, 26) + '…' : msg}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => tap('bye')} style={btn(COLORS.danger, true, true)}>EXIT CHAT</button>
          <button onClick={onToggleKeyboard} style={btn(COLORS.textDim, false, true)}>⌨ TYPE</button>
        </div>
      </div>
    );
  }

  // ─── RENDER: INSIDE A NODE ─────────────────────────────────
  if (isInside) {
    return (
      <div style={S.wrap}>
        {/* Nav tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          <button onClick={() => setPanel('actions')} style={btn(COLORS.primary, panel === 'actions', false)}>ACTIONS</button>
          <button onClick={() => setPanel('files')} style={btn(COLORS.file, panel === 'files', false)}>FILES ({currentFiles.length})</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => tap('exit')} style={btn(COLORS.danger, true, false)}>EXIT ✕</button>
          <button onClick={onToggleKeyboard} style={btn(COLORS.textDim, false, false)}>⌨</button>
        </div>

        {panel === 'actions' && (
          <>
            {privilege !== 'root' && (
              <div style={S.row}>
                <button onClick={() => tap('pwnkit')} style={btn(COLORS.danger, true, true)}>⚡ PWNKIT → ROOT</button>
              </div>
            )}
            {privilege === 'root' && (
              <>
                <div style={S.label}>PERSIST & LOOT</div>
                <div style={S.row}>
                  <button onClick={() => tap('sliver')} style={btn(COLORS.secondary, true, true)}>SLIVER (C2)</button>
                  <button onClick={() => tap('chisel')} style={btn(COLORS.primary, true, true)}>CHISEL (PROXY)</button>
                  <button onClick={() => tap('wipe')} style={btn(COLORS.warning, true, true)}>WIPE LOGS</button>
                  <button onClick={() => tap('reptile')} style={btn('#aa66ff', true, true)}>REPTILE</button>
                </div>
                <div style={S.label}>DESTRUCTIVE</div>
                <div style={S.row}>
                  <button onClick={() => tap('shred')} style={btn(COLORS.danger, true, false)}>SHRED</button>
                  <button onClick={() => tap('openssl')} style={btn(COLORS.danger, true, false)}>RANSOM</button>
                  <button onClick={() => tap('msfvenom')} style={btn(COLORS.warning, true, false)}>MSFVENOM</button>
                  <button onClick={() => tap('eternalblue')} style={btn(COLORS.danger, true, false)}>ETERNALBLUE</button>
                  {inventory.includes('DPI') && (
                    <button onClick={() => tap('ettercap')} style={btn(COLORS.chat, true, false)}>ETTERCAP</button>
                  )}
                  <button onClick={() => tap('xmrig')} style={btn(COLORS.warning, true, false)}>XMRIG</button>
                </div>
              </>
            )}
            {/* Consumables */}
            {(consumables?.decoy > 0 || consumables?.burner > 0 || consumables?.zeroday > 0) && (
              <>
                <div style={S.label}>USE ITEMS</div>
                <div style={S.row}>
                  {consumables.decoy > 0 && <button onClick={() => tap('use decoy')} style={btn(COLORS.primary, true, false)}>DECOY ({consumables.decoy})</button>}
                  {consumables.burner > 0 && <button onClick={() => tap('use burner')} style={btn(COLORS.secondary, true, false)}>BURNER ({consumables.burner})</button>}
                  {consumables.zeroday > 0 && <button onClick={() => tap('use zeroday')} style={btn(COLORS.danger, true, false)}>0DAY ({consumables.zeroday})</button>}
                </div>
              </>
            )}
          </>
        )}

        {panel === 'files' && (
          <>
            <div style={S.label}>📂 {currentDir}</div>
            {currentDir !== '/' && (
              <button onClick={() => tap('cd ..')} style={{ ...btn(COLORS.textDim, false, false), marginBottom: '4px' }}>↩ cd ..</button>
            )}
            <div style={S.row}>
              {currentDirs.map((dir, i) => (
                <button key={i} onClick={() => tap(`cd ${dir.replace('/', '')}`)} style={btn(COLORS.primary, true, false)}>
                  📁 {dir}
                </button>
              ))}
              {currentDataFiles.map((file, i) => (
                <button key={i} onClick={() => tap(privilege === 'root' ? `exfil ${file}` : `cat ${file}`)} style={btn(privilege === 'root' ? COLORS.warning : COLORS.file, true, false)}>
                  {privilege === 'root' ? '💰' : '📄'} {file}
                </button>
              ))}
            </div>
            {currentDataFiles.length > 0 && privilege === 'root' && (
              <div style={{ fontSize: '8px', color: COLORS.textDim, marginTop: '2px' }}>TAP FILE = EXFIL  •  LONG-PRESS = CAT</div>
            )}
          </>
        )}
      </div>
    );
  }

  // ─── RENDER: OUTSIDE — MAIN HUB ───────────────────────────
  return (
    <div style={S.wrap}>
      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        <button onClick={() => setPanel('actions')} style={btn(COLORS.primary, panel === 'actions', false)}>ACTIONS</button>
        <button onClick={() => { setPanel('targets'); setSelectedIP(null); }} style={btn(COLORS.ip, panel === 'targets' || panel === 'target_detail', false)}>
          TARGETS ({discoveredNodes.length})
        </button>
        <button onClick={onToggleMap} style={btn(COLORS.secondary, mapExpanded, false)}>MAP</button>
        <div style={{ flex: 1 }} />
        <button onClick={onToggleKeyboard} style={btn(COLORS.textDim, false, false)}>⌨</button>
      </div>

      {panel === 'actions' && (
        <>
          <div style={S.label}>RECON & INTEL</div>
          <div style={S.row}>
            <button onClick={() => tap('nmap')} style={btn(COLORS.primary, true, true)}>📡 NMAP SCAN</button>
            <button onClick={() => tap('status')} style={btn(COLORS.textDim, false, true)}>STATUS</button>
            <button onClick={() => tap('help')} style={btn(COLORS.textDim, false, true)}>HELP</button>
          </div>
          <div style={S.label}>OPERATIONS</div>
          <div style={S.row}>
            <button onClick={() => tap('shop')} style={btn(COLORS.warning, true, true)}>🏪 SHOP</button>
            <button onClick={() => tap('contracts')} style={btn(COLORS.chat, true, true)}>📋 CONTRACTS</button>
            <button onClick={() => tap('save')} style={btn(COLORS.textDim, false, true)}>SAVE</button>
            <button onClick={() => tap('menu')} style={btn(COLORS.textDim, false, true)}>MENU</button>
          </div>
          {botnet.length > 0 && (
            <>
              <div style={S.label}>BOTNET ({botnet.length} NODES)</div>
              <div style={S.scrollRow}>
                {discoveredNodes.filter(n => n.hasSliver).map((n, i) => (
                  <button key={i} onClick={() => tap(`mimikatz ${n.ip}`)} style={btn(COLORS.secondary, true, false)}>
                    🤖 {n.ip}
                  </button>
                ))}
              </div>
            </>
          )}
          {/* Consumables */}
          {(consumables?.decoy > 0 || consumables?.burner > 0 || consumables?.zeroday > 0) && (
            <>
              <div style={S.label}>USE ITEMS</div>
              <div style={S.row}>
                {consumables?.decoy > 0 && <button onClick={() => tap('use decoy')} style={btn(COLORS.primary, true, false)}>DECOY ({consumables.decoy})</button>}
                {consumables?.burner > 0 && <button onClick={() => tap('use burner')} style={btn(COLORS.secondary, true, false)}>BURNER ({consumables.burner})</button>}
                {consumables?.zeroday > 0 && <button onClick={() => tap('use zeroday')} style={btn(COLORS.danger, true, false)}>0DAY ({consumables.zeroday})</button>}
              </div>
            </>
          )}
        </>
      )}

      {panel === 'targets' && (
        <>
          <div style={S.label}>DISCOVERED NODES — TAP TO ACT</div>
          {discoveredNodes.length === 0 ? (
            <button onClick={() => { tap('nmap'); setPanel('actions'); }} style={btn(COLORS.primary, true, true)}>
              NO TARGETS — TAP TO SCAN
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
              {discoveredNodes.map((n, i) => (
                <button key={i} onClick={() => selectIP(n.ip)} style={ipBtn(n.hacked ? COLORS.secondary : COLORS.ip)}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
                    <span style={{ color: n.hacked ? COLORS.secondary : COLORS.ip, fontWeight: 'bold' }}>{n.ip}</span>
                    <span style={{ color: COLORS.textDim, fontSize: '8px' }}>{n.sec}</span>
                    {n.hacked && <span style={{ color: COLORS.secondary, fontSize: '8px' }}>✓ OWNED</span>}
                    {n.hasSliver && <span style={{ color: COLORS.warning, fontSize: '8px' }}>🤖</span>}
                    {n.isProxy && <span style={{ color: COLORS.primary, fontSize: '8px' }}>🛡</span>}
                  </div>
                  <span style={{ color: COLORS.textDim, fontSize: '9px' }}>{n.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {panel === 'target_detail' && selectedNode && (
        <>
          <div style={S.label}>{selectedNode.ip} — {selectedNode.name}</div>
          <div style={S.row}>
            <button onClick={() => { tap(`nmap ${selectedNode.ip}`); }} style={btn(COLORS.primary, true, true)}>📡 SCAN</button>
            {!selectedNode.hacked && (
              <button onClick={() => tap(`${selectedNode.exp} ${selectedNode.ip}`)} style={btn(expColor(selectedNode.exp), true, true)}>
                ⚡ {expLabel(selectedNode.exp)}
              </button>
            )}
            {selectedNode.hacked && (
              <button onClick={() => tap(`connect ${selectedNode.ip}`)} style={btn(COLORS.secondary, true, true)}>🔗 CONNECT</button>
            )}
          </div>

          {/* Botnet actions if hacked */}
          {selectedNode.hacked && (
            <div style={S.row}>
              {!selectedNode.hasSliver && <button onClick={() => tap(`sliver ${selectedNode.ip}`)} style={btn(COLORS.secondary, true, false)}>SLIVER</button>}
              {!selectedNode.isProxy && <button onClick={() => tap(`chisel ${selectedNode.ip}`)} style={btn(COLORS.primary, true, false)}>CHISEL</button>}
              {selectedNode.hasSliver && <button onClick={() => tap(`mimikatz ${selectedNode.ip}`)} style={btn(COLORS.warning, true, false)}>MIMIKATZ</button>}
              <button onClick={() => tap(`stash ${selectedNode.ip}`)} style={btn(COLORS.file, true, false)}>STASH</button>
              <button onClick={() => tap(`disconnect ${selectedNode.ip}`)} style={btn(COLORS.danger, false, false)}>DISCONNECT</button>
            </div>
          )}

          {/* Offensive actions */}
          {!selectedNode.hacked && (
            <div style={S.row}>
              <button onClick={() => tap(`hping3 ${selectedNode.ip}`)} style={btn(COLORS.danger, true, false)}>HPING3 (DDoS)</button>
            </div>
          )}

          {/* Spearphish if employees exist */}
          {selectedNode.employees.length > 0 && (
            <>
              <div style={S.label}>EMPLOYEES — TAP TO SPEARPHISH</div>
              <div style={S.scrollRow}>
                {selectedNode.employees.map((emp, i) => (
                  <button key={i} onClick={() => tap(`spearphish ${emp.email}@${selectedNode.ip}`)} style={btn(COLORS.chat, true, false)}>
                    🎣 {emp.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <button onClick={() => { setSelectedIP(null); setPanel('targets'); }} style={{ ...btn(COLORS.textDim, false, false), marginTop: '4px' }}>
            ← BACK TO TARGETS
          </button>
        </>
      )}
    </div>
  );
}
