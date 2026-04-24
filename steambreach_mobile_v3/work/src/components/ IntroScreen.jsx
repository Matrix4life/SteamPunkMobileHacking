/**
 * IntroScreen.jsx — HexOverride title / main menu screen.
 * Visual design lifted from the VariationA "Cold Boot" prototype.
 * All game logic (save/load/delete/startGame) passed in as props.
 */

import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants/gameConstants';

// ── palette (mirrors VariationA) ────────────────────────────────
const C = {
  bg:      '#05070a',
  bgPanel: '#0a0d12',
  border:  '#1b2430',
  text:    '#d4d8dc',
  dim:     '#5a6572',
  dimmer:  '#2f3843',
  pri:     COLORS.primary,    // #78dce8
  sec:     COLORS.secondary,  // #a9dc76
  warn:    COLORS.warning,    // #ffd866
  dan:     COLORS.danger,     // #ff6188
  file:    '#fc9867',
};

// ── ASCII wordmark ────────────────────────────────────────────
const ASCII_LOGO = [
  ' ██╗  ██╗███████╗██╗  ██╗',
  ' ██║  ██║██╔════╝╚██╗██╔╝',
  ' ███████║█████╗   ╚███╔╝ ',
  ' ██╔══██║██╔══╝   ██╔██╗ ',
  ' ██║  ██║███████╗██╔╝ ██╗',
  ' ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝',
];

// ── boot lines ────────────────────────────────────────────────
const BOOT_LINES = [
  { t: '[BOOT] hexoverride-os v3.1.4-operator', c: C.dim },
  { t: '[ OK ] initialising tor circuits......... 7 hops', c: C.sec },
  { t: '[ OK ] mounting /dev/ghost................ ok', c: C.sec },
  { t: '[ OK ] loading ~/ops/contracts............ active', c: C.sec },
  { t: '[WARN] last session: high-heat detected', c: C.warn },
  { t: '[ OK ] spoofing MAC: 5e:de:ad:be:ef:42.... ok', c: C.sec },
  { t: '[ OK ] handshake complete. welcome back, operator.', c: C.pri },
];

// ── animated background node graph ───────────────────────────
function NetGraph({ width, height }) {
  const seed = (n) => { let x = Math.sin(n) * 10000; return x - Math.floor(x); };
  const nodes = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 28; i++) {
      arr.push({
        x: 20 + seed(i * 7.3) * (width - 40),
        y: 30 + seed(i * 13.7 + 0.1) * (height - 60),
        r: 2 + seed(i * 19.1) * 2.5,
        tier: seed(i * 29.7) > 0.8 ? 2 : seed(i * 29.7) > 0.55 ? 1 : 0,
        key: i,
      });
    }
    return arr;
  }, [width, height]);

  const edges = React.useMemo(() => {
    const e = [];
    for (let i = 0; i < nodes.length; i++) {
      const nearest = nodes
        .map((_, j) => ({ j, d: j === i ? Infinity : Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      nearest.forEach(({ j }) => { if (i < j) e.push([i, j]); });
    }
    return e;
  }, [nodes]);

  const [t, setT] = useState(0);
  useEffect(() => {
    let raf;
    const tick = (ts) => { setT(ts / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="ngGlow">
          <stop offset="0%" stopColor={C.pri} stopOpacity="0.8" />
          <stop offset="100%" stopColor={C.pri} stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        const phase = (t * 0.4 + i * 0.13) % 1;
        return (
          <g key={i}>
            <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={C.dimmer} strokeWidth="0.5" />
            {i % 3 === 0 && (
              <circle
                cx={na.x + (nb.x - na.x) * phase}
                cy={na.y + (nb.y - na.y) * phase}
                r="1.2" fill={C.pri} opacity="0.8"
              />
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const col = n.tier === 2 ? C.warn : n.tier === 1 ? C.sec : C.pri;
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + n.key);
        return (
          <g key={n.key}>
            {n.tier > 0 && <circle cx={n.x} cy={n.y} r={n.r * 3} fill="url(#ngGlow)" opacity={0.3 * tw} />}
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke={col} strokeWidth="1" opacity="0.8" />
            <circle cx={n.x} cy={n.y} r={n.r * 0.4} fill={col} opacity={0.6 + 0.4 * tw} />
          </g>
        );
      })}
    </svg>
  );
}

// ── skull loader (shown briefly at boot) ─────────────────────
function SkullLoader() {
  return (
    <div style={{ width: 80, height: 80, position: 'relative', display: 'grid', placeItems: 'center' }}>
      <style>{`
        @keyframes sk-spin { to { transform: rotate(360deg); } }
        @keyframes sk-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes sk-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.94);opacity:0.88} }
        @keyframes sk-orbit { to { transform: rotate(360deg); } }
      `}</style>
      {/* Outer rings */}
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1px dashed ${C.pri}`, opacity:0.5, animation:'sk-spin 6s linear infinite' }} />
      <div style={{ position:'absolute', inset:8, borderRadius:'50%', border:`1px dotted ${C.pri}`, opacity:0.3, animation:'sk-spin-rev 4s linear infinite' }} />
      <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:`1px solid ${C.pri}22`, animation:'sk-spin 10s linear infinite' }} />
      {/* Arc sweeps */}
      <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'1.5px solid transparent', borderTopColor:C.pri, borderRightColor:C.pri, opacity:0.85, animation:'sk-spin 1.6s cubic-bezier(.6,.1,.4,.9) infinite' }} />
      <div style={{ position:'absolute', inset:16, borderRadius:'50%', border:'1.5px solid transparent', borderBottomColor:C.pri, borderLeftColor:C.pri, opacity:0.6, animation:'sk-spin-rev 2.2s linear infinite' }} />
      {/* Skull SVG */}
      <svg viewBox="0 0 100 100" style={{ width:40, height:40, color:C.pri, animation:'sk-pulse 1.6s ease-in-out infinite', filter:`drop-shadow(0 0 6px ${C.pri}88)` }}>
        <path fill="currentColor" d="M50 8 C30 8 16 22 16 42 C16 52 20 60 26 66 L26 74 C26 77 28 79 31 79 L34 79 L34 84 C34 86 36 88 38 88 L42 88 L42 84 L46 84 L46 88 L54 88 L54 84 L58 84 L58 88 L62 88 C64 88 66 86 66 84 L66 79 L69 79 C72 79 74 77 74 74 L74 66 C80 60 84 52 84 42 C84 22 70 8 50 8 Z"/>
        <ellipse cx="36" cy="44" rx="9" ry="11" fill={C.bg}/>
        <ellipse cx="64" cy="44" rx="9" ry="11" fill={C.bg}/>
        <rect x="39" y="47" width="3" height="3" fill="currentColor"/>
        <rect x="61" y="47" width="3" height="3" fill="currentColor"/>
        <path d="M50 56 L45 68 L55 68 Z" fill={C.bg}/>
        <rect x="36" y="74" width="28" height="2" fill={C.bg}/>
        <rect x="42" y="74" width="1.5" height="10" fill={C.bg}/>
        <rect x="49" y="74" width="1.5" height="10" fill={C.bg}/>
        <rect x="56" y="74" width="1.5" height="10" fill={C.bg}/>
      </svg>
    </div>
  );
}

// ── scanlines overlay ─────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none',
      backgroundImage:'repeating-linear-gradient(0deg,rgba(120,220,232,0.025) 0px,rgba(120,220,232,0.025) 1px,transparent 1px,transparent 3px)',
      mixBlendMode:'overlay', zIndex:2,
    }} />
  );
}

// ── corner chrome brackets ────────────────────────────────────
function Corners() {
  const base = { position:'absolute', width:14, height:14, borderColor:C.pri, borderStyle:'solid', opacity:0.5 };
  return (
    <>
      <div style={{ ...base, top:36, left:10, borderWidth:'1px 0 0 1px' }} />
      <div style={{ ...base, top:36, right:10, borderWidth:'1px 1px 0 0' }} />
      <div style={{ ...base, bottom:10, left:10, borderWidth:'0 0 1px 1px' }} />
      <div style={{ ...base, bottom:10, right:10, borderWidth:'0 1px 1px 0' }} />
    </>
  );
}

// ── main export ───────────────────────────────────────────────
export default function IntroScreen({
  menuMode, setMenuMode,
  menuIndex, setMenuIndex,
  operator, setOperator,
  gameMode, setGameMode,
  deleteTarget, setDeleteTarget,
  getAllSaveSlots,
  loadGame, startNewGame, deleteSave,
  setScreen,
}) {
  const [bootLine, setBootLine] = useState(0);
  const [bootChar, setBootChar] = useState(0);
  const [menuReady, setMenuReady] = useState(false);
  const [blink, setBlink] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const compact = dims.w < 640;

  // Resize observer
  useEffect(() => {
    const ro = new ResizeObserver((es) => {
      const r = es[0].contentRect;
      setDims({ w: r.width, h: r.height });
    });
    const el = document.documentElement;
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Blink cursor
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(id);
  }, []);

  // Boot sequence typewriter
  useEffect(() => {
    if (bootLine >= BOOT_LINES.length) { setMenuReady(true); return; }
    const line = BOOT_LINES[bootLine].t;
    if (bootChar < line.length) {
      const id = setTimeout(() => setBootChar(c => c + 4), 10);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => { setBootLine(l => l + 1); setBootChar(0); }, 160);
    return () => clearTimeout(id);
  }, [bootLine, bootChar]);

  const saves = getAllSaveSlots();

  const formatTime = (ts) => {
    if (!ts) return 'Unknown';
    const d = new Date(ts), now = new Date(), diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  };

  const getSaveInfo = (name) => {
    try {
      const data = JSON.parse(localStorage.getItem(`breach_slot_${name}`));
      if (!data) return null;
      return { operator: data.operator||'Unknown', gameMode: data.gameMode||'arcade', money: data.money||0, reputation: data.reputation||0, botnet: data.botnet?.length||0, nodesLooted: data.looted?.length||0, timestamp: data.timestamp };
    } catch { return null; }
  };

  const modes = [
    { id: 'arcade',   name: 'ARCADE',   mult: '×1', color: C.sec,  desc: 'Learn the tools. Type the name, get the result.', flavor: 'Learn the vibes.' },
    { id: 'field',    name: 'FIELD',    mult: '×2', color: C.warn, desc: 'Key flags required. Balanced reward.',             flavor: 'Recommended.' },
    { id: 'operator', name: 'OPERATOR', mult: '×4', color: C.dan,  desc: 'Full CLI syntax. No hand-holding.',                flavor: 'For the ones who flex.' },
  ];

  return (
    <div style={{
      position:'absolute', inset:0,
      background: C.bg, color: C.text,
      fontFamily:"'JetBrains Mono','Fira Code','Consolas',monospace",
      overflow:'hidden',
    }}>
      {/* Background node graph */}
      <div style={{ position:'absolute', inset:0, opacity:0.3 }}>
        <NetGraph width={dims.w} height={dims.h} />
      </div>

      {/* Vignette */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:`radial-gradient(ellipse at 50% 55%, rgba(120,220,232,0.05) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)`,
        zIndex:1,
      }} />
      <Scanlines />

      {/* Top chrome bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:28,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 14px', fontSize:10, letterSpacing:1.5, color:C.dim,
        borderBottom:`1px solid ${C.border}`, background:'rgba(5,7,10,0.9)',
        zIndex:5,
      }}>
        <span>tty0 · operator@hexoverride · {new Date().toISOString().slice(0,10)}</span>
        <span style={{ display:'flex', gap:12 }}>
          <span style={{ color:C.sec }}>● TOR 7/7</span>
          <span style={{ color:C.warn }}>⚠ TRACE 0%</span>
          {!compact && <span>IP 185.220.101.42</span>}
        </span>
      </div>

      <Corners />

      {/* Content grid */}
      <div style={{
        position:'absolute', top:40, left:20, right:20, bottom:16,
        display:'grid',
        gridTemplateColumns: compact ? '1fr' : '1.15fr 1fr',
        gridTemplateRows: compact ? 'auto auto 1fr auto' : 'auto 1fr auto',
        gap:14, zIndex:4,
      }}>

        {/* ── ASCII WORDMARK (spans full width) ── */}
        <div style={{ gridColumn: compact ? '1' : '1 / span 2' }}>
          <div style={{
            color:C.pri,
            textShadow:`0 0 10px ${C.pri}55`,
            fontSize: compact ? 7 : 11,
            lineHeight:1.06, letterSpacing:0, whiteSpace:'pre', fontWeight:700,
            userSelect:'none',
          }}>
            {ASCII_LOGO.join('\n')}
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginTop:compact?6:8, paddingLeft:2,
            color:C.sec, fontSize: compact?13:20, fontWeight:700,
            letterSpacing: compact?6:10, textShadow:`0 0 10px ${C.sec}55`,
          }}>
            <span style={{ color:C.dim, letterSpacing:0, fontSize:14 }}>┌─</span>
            <span>OVERRIDE</span>
            <span style={{ flex:1, height:1, background:`linear-gradient(90deg,${C.sec}88,transparent)`, letterSpacing:0 }} />
            <span style={{ color:C.dim, fontSize: compact?9:11, letterSpacing:2 }}>v3.1.4</span>
            <span style={{ color:C.dim, letterSpacing:0, fontSize:14 }}>─┐</span>
          </div>
        </div>

        {/* ── LEFT COLUMN: Boot log + menu ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, minWidth:0, overflow:'hidden' }}>

          {/* Boot log */}
          <div style={{
            border:`1px solid ${C.border}`, padding:'10px 12px',
            background:'rgba(10,13,18,0.75)',
            fontSize: compact?9:10, lineHeight:1.75,
            minHeight: compact?100:130,
          }}>
            <div style={{ color:C.dim, fontSize:9, letterSpacing:1.5, marginBottom:6 }}>
              ┌─ /var/log/boot.log ─────────────
            </div>
            {BOOT_LINES.slice(0, bootLine).map((l, i) => (
              <div key={i} style={{ color:l.c }}>{l.t}</div>
            ))}
            {bootLine < BOOT_LINES.length && (
              <div style={{ color:BOOT_LINES[bootLine].c }}>
                {BOOT_LINES[bootLine].t.slice(0, bootChar)}
                <span style={{ color:C.pri, opacity: blink?1:0.15 }}>▌</span>
              </div>
            )}
            {menuReady && (
              <div style={{ color:C.dim, fontSize:9, letterSpacing:1.5, marginTop:6 }}>
                └─────────────────────────────────
              </div>
            )}
          </div>

          {/* ── MAIN MENU ── */}
          {menuMode === 'main' && (
            <div style={{
              border:`1px solid ${menuReady ? C.pri+'55' : C.border}`,
              background:'rgba(10,13,18,0.82)', padding:'10px 0',
              opacity: menuReady ? 1 : 0.15, transition:'all 0.4s ease',
              flex:1,
            }}>
              <div style={{ padding:'0 14px 8px', color:C.dim, fontSize:9, letterSpacing:2, borderBottom:`1px dashed ${C.border}`, marginBottom:6 }}>
                ┌─ SESSION ──── select to continue ─
              </div>
              {[
                { id:'soundmanager', label:'AUDIO MANAGER',      sub:'Sounds, music, uploads',       color:C.pri,  icon:'♪', onClick:() => setScreen('soundmanager') },
                { id:'aisettings',   label:'AI DIRECTOR',         sub:'Tune game AI & difficulty',     color:C.pri,  icon:'◈', onClick:() => setScreen('aisettings') },
                { id:'newgame',      label:'NEW OPERATION',        sub:'Start clean. Fresh handle.',    color:C.sec,  icon:'▸', onClick:() => { setMenuMode('newgame'); setMenuIndex(0); setOperator(''); } },
                { id:'load',         label:'CONTINUE',             sub:`${saves.length} saved session${saves.length!==1?'s':''}`, color:C.pri, icon:'◉', disabled:saves.length===0, onClick:() => { setMenuMode('load'); setMenuIndex(0); } },
                { id:'delete',       label:'DELETE SAVE',          sub:'Purge a session file',          color:C.dan,  icon:'✕', disabled:saves.length===0, onClick:() => { setMenuMode('delete'); setMenuIndex(0); } },
              ].map((item) => {
                const active = hovered === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => !item.disabled && setHovered(item.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => !item.disabled && item.onClick()}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding: compact ? '9px 14px' : '7px 14px',
                      background: active ? `linear-gradient(90deg,${item.color}18,transparent 70%)` : 'transparent',
                      borderLeft:`2px solid ${active ? item.color : 'transparent'}`,
                      cursor: item.disabled ? 'default' : 'pointer',
                      opacity: item.disabled ? 0.3 : 1,
                      transition:'all 0.1s',
                    }}
                  >
                    <span style={{ color: active ? item.color : C.dim, fontSize:11, width:14 }}>
                      {active ? item.icon : ' '}
                    </span>
                    <span style={{ color: active ? C.text : C.dim, fontSize:11, letterSpacing:1.8, fontWeight:700, flex:1 }}>
                      {item.label}
                    </span>
                    <span style={{ color: active ? item.color+'cc' : C.dimmer, fontSize:9.5, textAlign:'right' }}>
                      {item.sub}
                    </span>
                  </div>
                );
              })}
              <div style={{ padding:'8px 14px 0', color:C.dimmer, fontSize:9, letterSpacing:1 }}>
                [UP/DOWN] NAVIGATE · [ENTER] SELECT
              </div>
            </div>
          )}

          {/* ── NEW GAME ── */}
          {menuMode === 'newgame' && (
            <div style={{
              border:`1px solid ${C.pri}55`, padding:'16px 18px',
              background:'rgba(10,13,18,0.9)', flex:1, display:'flex', flexDirection:'column', gap:12,
            }}>
              <div style={{ color:C.dim, fontSize:9, letterSpacing:2 }}>IDENTIFY OPERATOR</div>
              <input
                autoFocus
                style={{
                  background:'transparent', border:'none', borderBottom:`1px solid ${C.pri}`,
                  color:C.pri, textAlign:'left', outline:'none', fontFamily:'inherit',
                  fontSize:14, padding:'4px 2px', width:'100%',
                }}
                placeholder="handle_"
                value={operator}
                onChange={e => setOperator(e.target.value)}
                onKeyDown={e => e.key==='Enter' && operator.length>0 && startNewGame(operator, gameMode)}
              />

              <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginTop:4 }}>SELECT MODE</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {modes.map((m) => {
                  const sel = gameMode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setGameMode(m.id)}
                      style={{
                        border:`1px solid ${sel ? m.color : C.border}`,
                        background: sel ? `${m.color}12` : 'transparent',
                        padding:'8px 12px', cursor:'pointer', transition:'all 0.12s',
                        display:'flex', alignItems:'baseline', gap:8,
                      }}
                    >
                      <span style={{ color: sel ? m.color : C.dim, fontSize:10, width:14 }}>{sel?'▸':' '}</span>
                      <span style={{ color: sel ? C.text : C.dim, fontSize:11, letterSpacing:1.8, fontWeight:700, minWidth:80 }}>{m.name}</span>
                      <span style={{ color:m.color, fontSize:11, fontWeight:700 }}>{m.mult}</span>
                      <span style={{ color:C.dim, fontSize:9, flex:1 }}>{m.desc}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
                <button
                  onClick={() => { setMenuMode('main'); setMenuIndex(0); }}
                  style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${C.border}`, color:C.dim, fontFamily:'inherit', fontSize:11, cursor:'pointer', letterSpacing:1 }}>
                  ← BACK
                </button>
                <button
                  onClick={() => operator.length>0 && startNewGame(operator, gameMode)}
                  disabled={operator.length===0}
                  style={{
                    flex:2, padding:'10px', fontFamily:'inherit', fontSize:12, letterSpacing:2, fontWeight:700, cursor: operator.length>0?'pointer':'default',
                    background: operator.length>0 ? C.pri : C.bgPanel,
                    color: operator.length>0 ? C.bg : C.dim,
                    border:`1px solid ${operator.length>0 ? C.pri : C.border}`,
                    opacity: operator.length>0 ? 1 : 0.4, transition:'all 0.15s',
                  }}>
                  BREACH IN →
                </button>
              </div>
              <div style={{ color:C.dimmer, fontSize:9, textAlign:'center' }}>[ENTER] START · [ESC] CANCEL</div>
            </div>
          )}

          {/* ── LOAD GAME ── */}
          {menuMode === 'load' && (
            <div style={{
              border:`1px solid ${C.pri}55`, padding:'14px 16px',
              background:'rgba(10,13,18,0.9)', flex:1, display:'flex', flexDirection:'column', gap:8,
              overflow:'hidden',
            }}>
              <div style={{ color:C.dim, fontSize:9, letterSpacing:2, borderBottom:`1px dashed ${C.border}`, paddingBottom:8 }}>
                SELECT SAVE FILE
              </div>
              <div style={{ flex:1, overflowY:'auto' }}>
                {saves.slice().reverse().map((name, idx) => {
                  const info = getSaveInfo(name);
                  const isAuto = name.startsWith('auto_');
                  const mColor = info?.gameMode==='operator' ? C.dan : info?.gameMode==='field' ? C.warn : C.sec;
                  const isSel = menuIndex === idx;
                  return (
                    <div
                      key={name}
                      onMouseEnter={() => setMenuIndex(idx)}
                      onClick={() => { loadGame(name); setScreen('game'); }}
                      style={{
                        border:`1px solid ${isSel ? C.pri : C.border}`, padding:'10px 12px', marginBottom:6,
                        background: isSel ? `${C.pri}18` : 'transparent', cursor:'pointer', transition:'all 0.1s',
                      }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                        <span style={{ color: isAuto ? C.dim : C.pri, fontSize:11, fontWeight:700 }}>
                          {isSel?'▸ ':''}{isAuto?'◦ AUTO':'◉'} {info?.operator||name}
                        </span>
                        <span style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <span style={{ color:mColor, fontSize:9, border:`1px solid ${mColor}40`, padding:'1px 5px' }}>
                            {(info?.gameMode||'arcade').toUpperCase()}
                          </span>
                          <span style={{ color:C.dim, fontSize:9 }}>{formatTime(info?.timestamp)}</span>
                        </span>
                      </div>
                      {info && (
                        <div style={{ fontSize:9.5, color:C.dim }}>
                          ₿<span style={{ color:C.warn }}>{info.money.toLocaleString()}</span> · REP {info.reputation} · C2 <span style={{ color:COLORS.infected }}>{info.botnet}</span> · LOOTED {info.nodesLooted}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button
                  onClick={() => { setMenuMode('main'); setMenuIndex(0); }}
                  style={{ flex:1, padding:'9px', background:'transparent', border:`1px solid ${C.border}`, color:C.dim, fontFamily:'inherit', fontSize:11, cursor:'pointer' }}>
                  ← BACK
                </button>
              </div>
              <div style={{ color:C.dimmer, fontSize:9 }}>[UP/DOWN] NAVIGATE · [ENTER] LOAD · [ESC] CANCEL</div>
            </div>
          )}

          {/* ── DELETE: select ── */}
          {menuMode === 'delete' && !deleteTarget && (
            <div style={{
              border:`1px solid ${C.dan}44`, padding:'14px 16px',
              background:'rgba(10,13,18,0.9)', flex:1, display:'flex', flexDirection:'column', gap:8, overflow:'hidden',
            }}>
              <div style={{ color:C.dan, fontSize:9, letterSpacing:2, borderBottom:`1px dashed ${C.border}`, paddingBottom:8 }}>
                SELECT SAVE TO PURGE
              </div>
              <div style={{ flex:1, overflowY:'auto' }}>
                {saves.slice().reverse().map((name, idx) => {
                  const info = getSaveInfo(name);
                  const isAuto = name.startsWith('auto_');
                  const isSel = menuIndex === idx;
                  return (
                    <div
                      key={name}
                      onMouseEnter={() => setMenuIndex(idx)}
                      onClick={() => setDeleteTarget(name)}
                      style={{
                        border:`1px solid ${isSel ? C.dan : C.dan+'30'}`, padding:'10px 12px', marginBottom:6,
                        background: isSel ? `${C.dan}18` : 'transparent', cursor:'pointer',
                      }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:C.text, fontSize:11 }}>
                          {isSel?'▸ ':''}{isAuto?'◦ AUTO':'◉'} {info?.operator||name}
                        </span>
                        <span style={{ color:C.dan, fontSize:9 }}>DELETE</span>
                      </div>
                      {info && <div style={{ fontSize:9.5, color:C.dim, marginTop:3 }}>₿{info.money.toLocaleString()} · REP {info.reputation} · {formatTime(info?.timestamp)}</div>}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => { setMenuMode('main'); setMenuIndex(0); }}
                style={{ padding:'9px', background:'transparent', border:`1px solid ${C.border}`, color:C.dim, fontFamily:'inherit', fontSize:11, cursor:'pointer' }}>
                ← BACK
              </button>
            </div>
          )}

          {/* ── DELETE: confirm ── */}
          {menuMode === 'delete' && deleteTarget && (
            <div style={{
              border:`1px solid ${C.dan}`, padding:'20px 18px',
              background:'rgba(10,13,18,0.92)', flex:1, display:'flex', flexDirection:'column', gap:14,
            }}>
              <div style={{ color:C.dan, fontSize:11, letterSpacing:2 }}>PERMANENTLY PURGE SAVE?</div>
              <div style={{ color:C.text, fontSize:13, border:`1px solid ${C.border}`, padding:'8px 12px' }}>"{deleteTarget}"</div>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  onMouseEnter={() => setMenuIndex(0)}
                  onClick={() => setDeleteTarget(null)}
                  style={{ flex:1, padding:'10px', background: menuIndex===0?`${C.pri}20`:'transparent', border:`1px solid ${menuIndex===0?C.pri:C.border}`, color: menuIndex===0?'#fff':C.dim, fontFamily:'inherit', fontSize:11, cursor:'pointer' }}>
                  {menuIndex===0?'▸ ':''}CANCEL
                </button>
                <button
                  onMouseEnter={() => setMenuIndex(1)}
                  onClick={() => { deleteSave(deleteTarget); setDeleteTarget(null); setMenuIndex(0); }}
                  style={{ flex:1, padding:'10px', background: menuIndex===1?C.dan:`${C.dan}30`, color:'#fff', border:'none', fontFamily:'inherit', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  {menuIndex===1?'▸ ':''}CONFIRM
                </button>
              </div>
              <div style={{ color:C.dimmer, fontSize:9 }}>[LEFT/RIGHT] TOGGLE · [ENTER] SELECT · [ESC] CANCEL</div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: node graph panel + MOTD (desktop only) ── */}
        {!compact && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, minWidth:0 }}>
            <div style={{
              border:`1px solid ${C.border}`, background:'rgba(10,13,18,0.55)',
              position:'relative', flex:1, overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:8, left:10, fontSize:9, letterSpacing:2, color:C.dim, zIndex:2 }}>
                GLOBAL.NET // {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} UTC
              </div>
              <div style={{ position:'absolute', top:8, right:10, fontSize:9, letterSpacing:2, color:C.sec, zIndex:2 }}>● LIVE</div>
              <div style={{ position:'absolute', inset:'28px 8px 28px' }}>
                <NetGraph width={Math.round(dims.w * 0.43)} height={Math.round(dims.h - 280)} />
              </div>
              <div style={{ position:'absolute', bottom:8, left:10, right:10, display:'flex', justifyContent:'space-between', fontSize:9, letterSpacing:1.5, color:C.dim }}>
                <span>NODES <span style={{ color:C.text }}>—</span></span>
                <span>ELITE <span style={{ color:C.warn }}>—</span></span>
                <span>REGIONS <span style={{ color:C.text }}>—</span></span>
              </div>
            </div>

            {/* Boot loader + MOTD */}
            <div style={{ border:`1px solid ${C.border}`, padding:'12px 14px', background:'rgba(10,13,18,0.6)', display:'flex', alignItems:'center', gap:16 }}>
              {!menuReady && <SkullLoader />}
              <div style={{ flex:1 }}>
                {menuReady ? (
                  <>
                    <div style={{ fontSize:9.5, color:C.dim, lineHeight:1.6 }}>
                      <span style={{ color:C.file }}>MOTD:</span> &quot;The network is not a place. It&apos;s a relationship between you and the people trying to find you.&quot;
                    </div>
                    <div style={{ color:C.dimmer, fontSize:8.5, marginTop:4 }}>— fsociety.dat, line 47</div>
                  </>
                ) : (
                  <div style={{ fontSize:9.5, color:C.dim, letterSpacing:1.5 }}>
                    SYSTEM INIT{blink?'▌':' '}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MODE CARDS (bottom, full width) ── */}
        <div style={{ gridColumn: compact?'1':'1 / span 2', display:'grid', gridTemplateColumns: compact?'1fr':'repeat(3,1fr)', gap:8 }}>
          {modes.map((m) => {
            const active = hovered === m.id+'_card';
            return (
              <div
                key={m.id+'_card'}
                onMouseEnter={() => setHovered(m.id+'_card')}
                onMouseLeave={() => setHovered(null)}
                style={{
                  border:`1px solid ${active ? m.color : C.border}`,
                  background: active ? `${m.color}12` : 'rgba(10,13,18,0.65)',
                  padding:'8px 12px', cursor:'default', transition:'all 0.15s',
                }}
              >
                <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:3 }}>
                  <span style={{ color: active?m.color:C.text, fontSize:11, letterSpacing:2, fontWeight:700 }}>{m.name}</span>
                  <span style={{ color:m.color, fontSize:11, fontWeight:700 }}>{m.mult}</span>
                </div>
                <div style={{ color:C.dim, fontSize:9, lineHeight:1.4, marginBottom:2 }}>{m.desc}</div>
                <div style={{ color:m.color, fontSize:8.5, opacity:0.7 }}>// {m.flavor}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:14,
        display:'flex', justifyContent:'space-between', padding:'0 14px',
        fontSize:8.5, letterSpacing:2, color:C.dimmer, zIndex:5,
        borderTop:`1px solid ${C.border}`, background:'rgba(5,7,10,0.95)',
        alignItems:'center',
      }}>
        <span>v3.1.4 · build 7e4a9c</span>
        <span>[F1] HELP · [ESC] QUIT</span>
      </div>
    </div>
  );
}
