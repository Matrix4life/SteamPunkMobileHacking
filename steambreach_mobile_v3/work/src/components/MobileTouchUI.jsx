import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants/gameConstants';

const CONSUMABLES = ['decoy.bin', 'burner.ovpn', '0day_poc.sh', 'wallet.dat'];

// ─── VIBRATION ───────────────────────────────────────────────
const buzz = (pattern = 25) => {
  try { navigator.vibrate?.(pattern); } catch {}
};

// ─── FIELD MODE SUB-OPTIONS ──────────────────────────────────
const FIELD_OPTIONS = {
  shred: [
    { label: 'MBR', cmd: 'shred mbr', desc: 'Boot record' },
    { label: 'FILESYSTEM', cmd: 'shred fs', desc: 'Data gone' },
    { label: 'FULL DISK', cmd: 'shred full', desc: 'Zero all' },
  ],
  openssl: [
    { label: 'STRONG AES-256', cmd: 'openssl strong', desc: '70% pay' },
    { label: 'FAST AES-128', cmd: 'openssl fast', desc: '40% pay' },
  ],
  msfvenom: [
    { label: 'REVERSE SHELL', cmd: 'msfvenom reverse', desc: 'Spread' },
    { label: 'MINER', cmd: 'msfvenom miner', desc: 'Crypto' },
    { label: 'WIPER', cmd: 'msfvenom wiper', desc: 'Destroy' },
  ],
  eternalblue: [
    { label: 'TARGETED', cmd: 'eternalblue targeted', desc: '1 subnet' },
    { label: 'SUBNET WIDE', cmd: 'eternalblue subnet', desc: 'Mass' },
  ],
  reptile: [
    { label: 'KERNEL', cmd: 'reptile kernel', desc: 'Rootkit' },
    { label: 'PRELOAD', cmd: 'reptile preload', desc: 'LD hook' },
    { label: 'FIRMWARE', cmd: 'reptile firmware', desc: 'Persists' },
  ],
  xmrig: [
    { label: 'LOW 25%', cmd: 'xmrig low', desc: 'Stealth' },
    { label: 'MED 50%', cmd: 'xmrig medium', desc: 'Balanced' },
    { label: 'HIGH 75%', cmd: 'xmrig high', desc: 'Loud' },
  ],
  travel: [
    { label: '🇺🇸 US-GOV', cmd: 'travel us-gov', desc: 'Tier 1' },
    { label: '🇪🇺 EU-CENTRAL', cmd: 'travel eu-central', desc: 'Tier 2' },
    { label: '🇨🇳 CN-FINANCIAL', cmd: 'travel cn-financial', desc: 'Tier 3' },
    { label: '🇷🇺 RU-DARKNET', cmd: 'travel ru-darknet', desc: 'Elite' },
  ]
};

// ─── OPERATOR MODE SYNTAX HINTS ──────────────────────────────
const OP_HINTS = {
  shred: 'shred -vfz -n 3 /dev/sda',
  openssl: 'openssl enc -aes-256-cbc -salt -in /data -out /data.enc',
  msfvenom: 'msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=10.0.0.1 LPORT=4444 -f elf -o agent.bin',
  eternalblue: 'eternalblue --target subnet --propagate',
  reptile: 'reptile --install --hide-pid $$ --hide-file /tmp/.r',
  xmrig: 'xmrig --config config.json --background --threads 4 --max-cpu 75',
  crontab: 'crontab -e 5 shred',
};

// ─── STYLES ──────────────────────────────────────────────────
const S = {
  wrap: {
    flexShrink: 0, borderTop: `1px solid ${COLORS.border}`,
    background: `${COLORS.bg}f0`, padding: '8px 6px 10px',
  },
  row: { display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '6px' },
  scrollRow: {
    display: 'flex', gap: '5px', overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingBottom: '4px',
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
  borderRadius: '5px', color: active ? color : COLORS.textDim,
  fontFamily: 'inherit', fontSize: big ? '14px' : '12px',
  fontWeight: 'bold', letterSpacing: '0.5px', cursor: 'pointer',
  whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation', transition: 'background 0.1s',
});

const ipBtn = (color) => ({
  ...btn(color, true, false),
  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
  gap: '2px', padding: '10px 14px', width: '100%',
});

const subBtn = (color) => ({
  ...btn(color, true, true),
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '2px', flex: '1 1 0',
});

// ─── COMPONENT ───────────────────────────────────────────────
export default function MobileTouchUI({
  world, isInside, privilege, targetIP, currentDir,
  isChatting, chatTarget, botnet, proxies, inventory,
  heat, trace, mapExpanded, consumables, gameMode,
  currentRegion, 
  onCommand, onToggleKeyboard, onToggleMap,
  onFillInput,
  externalSelectedIP, clearExternalSelection,
  activeStory, alignment, pendingInteraction,
}) {
  const [panel, setPanel] = useState('actions');
  const [selectedIP, setSelectedIP] = useState(null);
  const [subMenu, setSubMenu] = useState(null);
  const [showEmployees, setShowEmployees] = useState(false); 
  const isField = gameMode === 'field';
  const isOperator = gameMode === 'operator';

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
      .filter(([k, v]) => k !== 'local' && !v.isHidden && v.region === currentRegion) 
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
  }, [world, botnet, proxies, currentRegion]);

  const currentFiles = useMemo(() => {
    if (!isInside || !targetIP || !world[targetIP]) return [];
    return (world[targetIP].files || {})[currentDir] || [];
  }, [isInside, targetIP, world, currentDir]);
  const currentDirs = useMemo(() => currentFiles.filter(f => f.endsWith('/')), [currentFiles]);
  const currentDataFiles = useMemo(() => currentFiles.filter(f => !f.endsWith('/')), [currentFiles]);
  const selectedNode = selectedIP ? discoveredNodes.find(n => n.ip === selectedIP) : null;

  // ─── HANDLERS ─────────────────────────────────────────────
  const tap = (cmd) => {
    buzz(30); setSubMenu(null);
    onCommand(cmd);
    if (panel === 'target_detail') setPanel('targets');
  };

  const smartCmd = (cmd) => {
    if (isOperator && OP_HINTS[cmd]) {
      buzz(40);
      onFillInput?.(OP_HINTS[cmd]);
      return;
    }
    if (FIELD_OPTIONS[cmd] && (isField || cmd === 'travel')) {
      buzz(20);
      setSubMenu(subMenu === cmd ? null : cmd);
      return;
    }
    tap(cmd);
  };

  const selectIP = (ip) => { buzz(40); setSelectedIP(ip); setPanel('target_detail'); setShowEmployees(false); };
  const switchPanel = (id) => { buzz(15); setPanel(id); setSubMenu(null); if (id === 'targets') { setSelectedIP(null); setShowEmployees(false); } };

  const expLabel = (exp) => ({ hydra: 'HYDRA', sqlmap: 'SQLMAP', msfconsole: 'MSFCONSOLE', curl: 'CURL' }[exp] || exp.toUpperCase());
  const expColor = (exp) => ({ hydra: COLORS.danger, sqlmap: COLORS.warning, msfconsole: '#ff6633', curl: COLORS.file }[exp] || COLORS.primary);

  // ─── SUB-MENU RENDERER ────────────────────────────────────
  const SubMenu = ({ cmd }) => {
    const opts = FIELD_OPTIONS[cmd];
    if (!opts) return null;
    return (
      <div style={{ ...S.row, background: `${COLORS.warning}08`, border: `1px solid ${COLORS.warning}30`, borderRadius: '4px', padding: '8px', marginBottom: '6px' }}>
        <div style={{ width: '100%', ...S.label, color: COLORS.warning, marginBottom: '6px' }}>
          {cmd.toUpperCase()} — SELECT OPTION
        </div>
        {opts.map((opt, i) => (
          <button key={i} onClick={() => tap(opt.cmd)} style={subBtn(COLORS.warning)}>
            <span>{opt.label}</span>
            <span style={{ fontSize: '9px', color: COLORS.textDim, fontWeight: 'normal' }}>{opt.desc}</span>
          </button>
        ))}
        <button onClick={() => setSubMenu(null)} style={btn(COLORS.textDim, false, false)}>✕</button>
      </div>
    );
  };

  // ─── TAB BAR ──────────────────────────────────────────────
  const TabBar = ({ tabs, right }) => (
    <div style={{ display: 'flex', gap: '5px', marginBottom: '6px', alignItems: 'center' }}>
      {tabs.map(([id, label, color]) => (
        <button key={id} onClick={() => switchPanel(id)}
          style={btn(color || COLORS.primary, panel === id || (id === 'targets' && panel === 'target_detail'), false)}>
          {label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {right}
      <button onClick={() => { buzz(15); onToggleKeyboard(); }} style={btn(COLORS.textDim, false, false)}>⌨</button>
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
            "Hey, quick question about your system access",
            "IT here — we're seeing unusual activity on your account",
            "Hi, I'm new on the security team. Need to verify something",
            "Your manager asked me to reach out about a login issue",
            "We're rolling out a mandatory password reset today",
            "I noticed your credentials flagged in our last audit",
            "Sorry to bother you — compliance needs your help real quick",
            "This is from the help desk, can you verify something for me?",
          ].map((msg, i) => (
            <button key={i} onClick={() => tap(msg)} style={btn(COLORS.chat, true, false)}>{msg}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => tap('exit')} style={btn(COLORS.danger, true, true)}>✕ EXIT CHAT</button>
          <button onClick={() => { buzz(15); onToggleKeyboard(); }} style={btn(COLORS.textDim, false, true)}>⌨ TYPE CUSTOM</button>
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
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '0 4px 8px 4px', marginBottom: '8px', borderBottom: `1px dashed ${COLORS.danger}50` 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>💻</span>
            <span style={{ color: COLORS.danger, fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
              CONNECTED: {targetIP}
            </span>
          </div>
          <div style={{ color: COLORS.primaryDim, fontSize: '10px', fontWeight: 'bold' }}>
            🌐 {currentRegion ? currentRegion.toUpperCase() : 'UNKNOWN'}
          </div>
        </div>

        <TabBar
          tabs={[['actions', 'ACTIONS', COLORS.primary], ['files', `FILES (${currentFiles.length})`, COLORS.file]]}
          right={<button onClick={() => tap('exit')} style={btn(COLORS.danger, true, false)}>✕ EXIT</button>}
        />

        {subMenu && <SubMenu cmd={subMenu} />}

        {activeStory && isInside && targetIP === activeStory.ip && (
          <div style={{
            background: `${COLORS.chat}10`, border: `1px solid ${COLORS.chat}40`,
            borderRadius: '5px', padding: '12px', marginBottom: '8px',
          }}>
            <div style={{ ...S.label, color: COLORS.chat, fontSize: '11px', marginBottom: '8px' }}>
              ⚡ MORAL CROSSROADS — CHOOSE YOUR PATH
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => tap('resolve 1')} style={{
                ...btn('#00ff88', true, true), flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ fontSize: '14px' }}>PARAGON</span>
                <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#00ff8899' }}>
                  {activeStory.good_action?.slice(0, 40)}{activeStory.good_action?.length > 40 ? '…' : ''}
                </span>
                <span style={{ fontSize: '11px' }}>₿{(activeStory.good_payout || 5000).toLocaleString()}</span>
              </button>
              <button onClick={() => tap('resolve 2')} style={{
                ...btn('#ff3366', true, true), flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ fontSize: '14px' }}>SYNDICATE</span>
                <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#ff336699' }}>
                  {activeStory.evil_action?.slice(0, 40)}{activeStory.evil_action?.length > 40 ? '…' : ''}
                </span>
                <span style={{ fontSize: '11px' }}>₿{(activeStory.evil_payout || 25000).toLocaleString()}</span>
              </button>
            </div>
          </div>
        )}

        {panel === 'actions' && !subMenu && (
  <>
    {/* PENDING INTERACTION - Civilian choices */}
{pendingInteraction && isInside && targetIP === pendingInteraction.id?.split(':')[0] && (
  <div style={{
    background: `${COLORS.warning}10`, border: `1px solid ${COLORS.warning}40`,
    borderRadius: '5px', padding: '12px', marginBottom: '8px',
  }}>
    <div style={{ ...S.label, color: COLORS.warning, fontSize: '11px', marginBottom: '8px' }}>
      ⚡ OPPORTUNITY DETECTED
    </div>
    <div style={{ display: 'flex', gap: '6px' }}>
      {pendingInteraction.kind === 'assist' && (
        <button onClick={() => tap('assist')} style={{
          ...btn('#00ff88', true, true), flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '14px' }}>🛠 ASSIST</span>
          <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#00ff8899' }}>Help the user</span>
          <span style={{ fontSize: '11px' }}>SIGNAL +{pendingInteraction.signal || 5}</span>
        </button>
      )}
      {pendingInteraction.kind === 'crash' && (
        <button onClick={() => tap('crashpc')} style={{
          ...btn('#ff3366', true, true), flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '14px' }}>💀 CRASH</span>
          <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#ff336699' }}>Brick the machine</span>
          <span style={{ fontSize: '11px' }}>CHAOS +{pendingInteraction.chaos || 5}</span>
        </button>
      )}
      {pendingInteraction.kind === 'salvage' && (
        <button onClick={() => tap('salvage')} style={{
          ...btn('#ffaa00', true, true), flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '14px' }}>🔍 SALVAGE</span>
          <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#ffaa0099' }}>Extract hidden data</span>
        </button>
      )}
    </div>
  </div>
)}
    {/* PWNKIT - only show if not root */}
    {privilege !== 'root' && (
      <div style={S.row}>
        <button onClick={() => smartCmd('pwnkit')} style={btn('#ff4444', true, true)}>⚡ PWNKIT → ROOT</button>
      </div>
    )}

    {/* NO ROOT REQUIRED */}
    <div style={S.label}>RECON</div>
    <div style={S.row}>
      <button onClick={() => tap('ettercap')} style={btn(COLORS.chat, true, false)}>📡 ETTERCAP</button>
      <button onClick={() => tap('download')} style={btn(COLORS.file, true, false)}>💾 DOWNLOAD</button>
    </div>

    {/* PERSIST - requires root */}
    <div style={S.label}>
      PERSIST {privilege !== 'root' && <span style={{ color: COLORS.danger, fontSize: '9px' }}>(ROOT)</span>}
    </div>
    <div style={S.row}>
      <button onClick={() => privilege === 'root' ? tap('sliver') : null} style={btn(COLORS.secondary, privilege === 'root', false)}>🤖 SLIVER</button>
      <button onClick={() => privilege === 'root' ? tap('chisel') : null} style={btn(COLORS.primary, privilege === 'root', false)}>🛡 CHISEL</button>
      <button onClick={() => privilege === 'root' ? tap('wipe') : null} style={btn(COLORS.warning, privilege === 'root', false)}>🧹 WIPE</button>
      <button onClick={() => privilege === 'root' ? smartCmd('reptile') : null} style={btn('#aa66ff', privilege === 'root', false)}>👻 REPTILE{isField ? ' ▾' : ''}</button>
    </div>

    {/* ATTACK - requires root */}
    <div style={S.label}>
      ATTACK {privilege !== 'root' && <span style={{ color: COLORS.danger, fontSize: '9px' }}>(ROOT)</span>}
    </div>
    <div style={S.row}>
      <button onClick={() => privilege === 'root' ? smartCmd('shred') : null} style={btn(COLORS.danger, privilege === 'root', false)}>💀 SHRED{isField ? ' ▾' : ''}</button>
      <button onClick={() => privilege === 'root' ? smartCmd('openssl') : null} style={btn(COLORS.danger, privilege === 'root', false)}>🔐 RANSOM{isField ? ' ▾' : ''}</button>
      <button onClick={() => privilege === 'root' ? smartCmd('msfvenom') : null} style={btn(COLORS.warning, privilege === 'root', false)}>🦠 MSFVENOM{isField ? ' ▾' : ''}</button>
      <button onClick={() => privilege === 'root' ? smartCmd('eternalblue') : null} style={btn(COLORS.danger, privilege === 'root', false)}>💥 ETERNALBLUE{isField ? ' ▾' : ''}</button>
    </div>
    <div style={S.row}>
      <button onClick={() => privilege === 'root' ? smartCmd('xmrig') : null} style={btn(COLORS.secondary, privilege === 'root', false)}>⛏ XMRIG{isField ? ' ▾' : ''}</button>
      <button onClick={() => privilege === 'root' ? tap('crontab') : null} style={btn(COLORS.warning, privilege === 'root', false)}>⏰ CRONTAB</button>
    </div>

    {/* NAVIGATE */}
    <div style={S.label}>NAVIGATE</div>
    <div style={S.row}>
      <button onClick={() => tap('ls')} style={btn(COLORS.textDim, true, false)}>📂 LS</button>
      <button onClick={() => tap('cd ..')} style={btn(COLORS.textDim, true, false)}>⬆ CD ..</button>
      <button onClick={() => switchPanel('files')} style={btn(COLORS.file, true, false)}>📁 FILES →</button>
    </div>

    {/* ITEMS */}
    {(consumables?.decoy > 0 || consumables?.burner > 0 || consumables?.zeroday > 0) && (
      <>
        <div style={S.label}>ITEMS</div>
        <div style={S.row}>
          {consumables.decoy > 0 && <button onClick={() => tap('use decoy')} style={btn(COLORS.primary, true, false)}>🎭 DECOY ×{consumables.decoy}</button>}
          {consumables.burner > 0 && <button onClick={() => tap('use burner')} style={btn(COLORS.secondary, true, false)}>📱 BURNER ×{consumables.burner}</button>}
          {consumables.zeroday > 0 && <button onClick={() => tap('use zeroday')} style={btn(COLORS.danger, true, false)}>💀 0DAY ×{consumables.zeroday}</button>}
        </div>
      </>
    )}
  </>
)}

        {panel === 'files' && (
          <>
            <div style={{ ...S.label, fontSize: '12px', color: COLORS.primary }}>📂 {currentDir}</div>
            {currentDir !== '/' && <button onClick={() => tap('cd ..')} style={{ ...btn(COLORS.textDim, true, false), marginBottom: '6px' }}>⬆ PARENT DIR</button>}
            {currentFiles.length === 0 && <div style={{ color: COLORS.textDim, fontSize: '12px', padding: '10px' }}>Empty directory</div>}
            <div style={S.row}>
              {currentDirs.map((dir, i) => (
                <button key={`d${i}`} onClick={() => tap(`cd ${dir.replace('/', '')}`)} style={btn(COLORS.primary, true, true)}>📁 {dir}</button>
              ))}
            </div>
            {currentDataFiles.length > 0 && (
              <>
                <div style={{ ...S.label, marginTop: '8px' }}>TARGET FILES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentDataFiles.map((file, i) => {
                    const isCon = CONSUMABLES.includes(file);
                    return (
                      <div key={`f${i}`} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: `${COLORS.bg}50`, border: `1px solid ${COLORS.border}`, 
                        padding: '6px 8px', borderRadius: '4px' 
                      }}>
                        <span style={{ color: isCon ? COLORS.secondary : COLORS.text, fontWeight: 'bold', fontSize: '12px', wordBreak: 'break-all', paddingRight: '4px' }}>
                          {isCon ? '🔧 ' : '📄 '}{file}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button 
                            onClick={() => { buzz(20); onCommand(`cat ${file}`); }} 
                            style={{ ...btn(COLORS.primary, false, false), padding: '6px 8px', fontSize: '10px' }}
                          >
                            {isCon ? 'COLLECT' : 'READ'}
                          </button>
                          
                       {!isCon && (
  <>
    <button 
      onClick={() => { buzz(20); onCommand(`download ${file}`); }} 
      style={{ ...btn(COLORS.secondary, true, false), padding: '6px 8px', fontSize: '10px' }}
    >
      DL
    </button>
    <button 
      onClick={() => { buzz(30); onCommand(`exfil ${file}`); }} 
      style={{ ...btn(COLORS.warning, true, false), padding: '6px 8px', fontSize: '10px' }}
    >
      EXFIL
    </button>
    {botnet && botnet.length > 0 && (
      <button 
        onClick={() => { buzz(30); onCommand(`stash ${file}`); }} 
        style={{ ...btn(COLORS.file, true, false), padding: '6px 8px', fontSize: '10px' }}
      >
        STASH
      </button>
    )}
  </>
)}
                        </div>
                      </div>
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
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '0 4px 8px 4px', marginBottom: '8px', borderBottom: `1px dashed ${COLORS.borderActive}` 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🌐</span>
          <span style={{ color: COLORS.primary, fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
            SUBNET: {currentRegion ? currentRegion.toUpperCase() : 'UNKNOWN'}
          </span>
        </div>
        <div style={{ color: COLORS.secondary, fontSize: '10px', fontWeight: 'bold' }}>
          🤖 GLOBAL BOTS: {botnet?.length || 0}
        </div>
      </div>

      <TabBar tabs={[['actions', 'ACTIONS', COLORS.primary], ['targets', `TARGETS (${discoveredNodes.length})`, COLORS.ip]]} />

      {subMenu && <SubMenu cmd={subMenu} />}

      {panel === 'actions' && !subMenu && (
  <>
    {/* RECON */}
    <div style={S.label}>RECON</div>
    <div style={S.row}>
      <button onClick={() => tap('nmap')} style={btn(COLORS.primary, true, true)}>📡 NMAP SCAN</button>
      <button onClick={() => { buzz(25); onToggleMap(); }} style={btn(COLORS.secondary, mapExpanded, true)}>🗺 MAP</button>
    </div>

    {/* BOTNET OPS - only show if player has botnet nodes */}
    {botnet?.length > 0 && (
      <>
        <div style={S.label}>BOTNET OPS ({botnet.length} nodes)</div>
        <div style={S.row}>
          <button onClick={() => tap('hping3')} style={btn(COLORS.danger, true, false)}>⚡ HPING3</button>
          <button onClick={() => tap('mimikatz')} style={btn(COLORS.warning, true, false)}>🔑 MIMIKATZ</button>
          <button onClick={() => tap('disconnect')} style={btn(COLORS.textDim, true, false)}>🔌 DISCONNECT</button>
        </div>
        <div style={S.scrollRow}>
          {discoveredNodes.filter(n => n.hasSliver).map((n, i) => (
            <button key={i} onClick={() => selectIP(n.ip)} style={btn(COLORS.secondary, true, false)}>
              🤖 {n.name.slice(0, 12)}{n.name.length > 12 ? '…' : ''}
            </button>
          ))}
        </div>
      </>
    )}

    {/* LOCAL OPS - only show if player has downloaded files */}
    {world?.local?.files?.['/home/operator'] && 
     world.local.files['/home/operator'].filter(f => !f.endsWith('/') && f !== 'readme.txt' && f !== 'contracts/').length > 0 && (
      <>
        <div style={S.label}>LOCAL FILES</div>
        <div style={S.row}>
          <button onClick={() => tap('hashcat')} style={btn(COLORS.warning, true, false)}>🔓 HASHCAT</button>
          <button onClick={() => tap('john')} style={btn(COLORS.warning, true, false)}>🔓 JOHN</button>
          <button onClick={() => tap('ls /home/operator')} style={btn(COLORS.textDim, true, false)}>📂 VIEW</button>
        </div>
      </>
    )}

    {/* ITEMS - consumables */}
    {(consumables?.decoy > 0 || consumables?.burner > 0 || consumables?.zeroday > 0) && (
      <>
        <div style={S.label}>ITEMS</div>
        <div style={S.row}>
          {consumables?.decoy > 0 && <button onClick={() => tap('use decoy')} style={btn(COLORS.primary, true, false)}>🎭 DECOY ×{consumables.decoy}</button>}
          {consumables?.burner > 0 && <button onClick={() => tap('use burner')} style={btn(COLORS.secondary, true, false)}>📱 BURNER ×{consumables.burner}</button>}
          {consumables?.zeroday > 0 && <button onClick={() => tap('use zeroday')} style={btn(COLORS.danger, true, false)}>💀 0DAY ×{consumables.zeroday}</button>}
        </div>
      </>
    )}

    {/* NAV */}
    <div style={S.label}>NAV</div>
    <div style={S.row}>
      <button onClick={() => tap('shop')} style={btn(COLORS.warning, true, false)}>🏪 SHOP</button>
      <button onClick={() => tap('contracts')} style={btn(COLORS.chat, true, false)}>📋 CONTRACTS</button>
      <button onClick={() => smartCmd('travel')} style={btn(COLORS.ip, subMenu === 'travel', false)}>✈️ TRAVEL ▾</button>
      <button onClick={() => tap('save')} style={btn(COLORS.textDim, false, false)}>💾 SAVE</button>
    </div>
  </>
)}
      {panel === 'targets' && (
        <>
          {discoveredNodes.length === 0 ? (
            <button onClick={() => { tap('nmap'); setPanel('actions'); }} style={btn(COLORS.primary, true, true)}>NO TARGETS — TAP TO SCAN</button>
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
          <div style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '6px', paddingLeft: '2px' }}>
  {selectedNode.ip} • {selectedNode.sec} SEC • {selectedNode.exp?.toUpperCase()}
</div>
        {selectedNode.hasSliver && (
  <div style={{ color: COLORS.secondary, fontSize: '10px', fontWeight: 'bold', marginBottom: '8px', padding: '4px 8px', background: `${COLORS.secondary}20`, borderRadius: '4px', display: 'inline-block' }}>
    🤖 SLIVER C2 ACTIVE
  </div>
)}
{selectedNode.isProxy && (
  <div style={{ color: COLORS.primary, fontSize: '10px', fontWeight: 'bold', marginBottom: '8px', marginLeft: '6px', padding: '4px 8px', background: `${COLORS.primary}20`, borderRadius: '4px', display: 'inline-block' }}>
    🛡 PROXY NODE
  </div>
)}  
          <div style={S.row}>
  <button onClick={() => tap(`nmap ${selectedNode.ip}`)} style={btn(COLORS.primary, true, true)}>📡 SCAN</button>
  <button 
    onClick={() => !selectedNode.hacked && tap(`${selectedNode.exp} ${selectedNode.ip}`)} 
    style={btn(expColor(selectedNode.exp), !selectedNode.hacked, true)}
  >
    ⚡ {expLabel(selectedNode.exp)} {selectedNode.hacked && '✓'}
  </button>
</div>
          {selectedNode.hacked && (
            <>
              <div style={S.label}>NODE ACTIONS</div>
              <div style={S.row}>
                {!selectedNode.hasSliver && <button onClick={() => tap('sliver')} style={btn(COLORS.secondary, true, true)}>SLIVER</button>}
                {!selectedNode.isProxy && <button onClick={() => tap('chisel')} style={btn(COLORS.primary, true, true)}>CHISEL</button>}
                {selectedNode.hasSliver && <button onClick={() => tap(`mimikatz ${selectedNode.ip}`)} style={btn(COLORS.warning, true, true)}>MIMIKATZ</button>}
                <button onClick={() => tap(`hping3 ${selectedNode.ip}`)} style={btn(COLORS.danger, true, false)}>HPING3</button>
                <button onClick={() => tap(`disconnect ${selectedNode.ip}`)} style={btn(COLORS.textDim, false, false)}>DISCONNECT</button>
              </div>
            </>
          )}
          {selectedNode.employees.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <button 
                onClick={() => { buzz(15); setShowEmployees(!showEmployees); }}
                style={{
                  ...btn(COLORS.chat, false, false),
                  width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px 14px'
                }}
              >
                <span>👥 EMPLOYEES / OSINT ({selectedNode.employees.length})</span>
                <span>{showEmployees ? '▼' : '▶'}</span>
              </button>

              {showEmployees && (
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: '8px', 
                  marginTop: '8px', maxHeight: '200px', overflowY: 'auto', 
                  scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' 
                }}>
                  {selectedNode.employees.map((emp, i) => (
                    <div key={i} style={{ background: `${COLORS.bgPanel}`, border: `1px solid ${COLORS.border}`, borderRadius: '4px', padding: '8px' }}>
                      <div style={{ color: COLORS.text, fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{emp.name}</div>
                      <div style={{ color: COLORS.textDim, fontSize: '10px', marginBottom: '8px' }}>{emp.role} • {emp.email}</div>
                      
                      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {!isInside && (
                          <>
                            <button onClick={() => tap(`spearphish ${emp.email}@${selectedNode.ip}`)} style={{ ...btn(COLORS.chat, true, false), padding: '6px 10px', flexShrink: 0 }}>
                              🎣 PHISH
                            </button>
                            <button onClick={() => { 
                              buzz(40); 
                              onFillInput?.(`ssh ${emp.email}@${selectedNode.ip} `); 
                            }} style={{ ...btn(COLORS.primary, true, false), padding: '6px 10px', flexShrink: 0 }}>
                              🔑 SSH
                            </button>
                          </>
                        )}
                        
                        {isInside && (
                          <button onClick={() => { 
                            buzz(40); 
                            onFillInput?.(`sendmail -to ${emp.email} -attach payload.bin`); 
                          }} style={{ ...btn(COLORS.warning, true, false), padding: '6px 10px', flexShrink: 0 }}>
                            ✉️ SPOOF
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={() => { buzz(15); setSelectedIP(null); setPanel('targets'); }} style={{ ...btn(COLORS.textDim, false, false), marginTop: '8px' }}>← BACK</button>
        </>
      )}
    </div>
  );
}
