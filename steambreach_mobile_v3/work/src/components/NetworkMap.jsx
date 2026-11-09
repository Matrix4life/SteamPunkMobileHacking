import React, { useMemo, useState } from 'react';
import LegacyNetworkMap from './LegacyNetworkMap';
import { COLORS } from '../constants/gameConstants';

// Strategic overview uses the real world/node ownership data; no artificial turf is saved.
const W = 1000;
const H = 580;
const PALETTE = ['#f17e65','#f6b96b','#8dcecf','#c190f2','#d56aa4','#e6b97b','#79c4a4','#88a2e9','#d896b4','#f0d086'];
const PLAYER = '#4ae5ab';
const NEUTRAL = '#324650';
const nCoord = (v, max, fallback) => {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max - 15, Math.max(15, typeof v === 'string' && v.includes('%') ? n * max / 100 : n <= 100 ? n * max / 100 : n));
};
const safeOwner = (node) => node.owner || null;
const hexPath = (x, y, radius) => Array.from({ length: 6 }, (_, i) => {
  const a = Math.PI / 3 * i + Math.PI / 6;
  return `${i ? 'L' : 'M'}${(x + radius * Math.cos(a)).toFixed(1)},${(y + radius * Math.sin(a)).toFixed(1)}`;
}).join(' ') + 'Z';
const buttonStyle = (active) => ({
  border: `1px solid ${active ? PLAYER : '#37555d'}`, borderRadius: 3,
  background: active ? '#143c35' : '#0b191e', color: active ? '#b6ffe2' : '#8baab1',
  padding: '8px 11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
  fontSize: 11, letterSpacing: 1, touchAction: 'manipulation'
});

export default function NetworkMap(props) {
  const { world = {}, rivals = [], rivalConflicts = [], expanded, toggleExpand,
    isMobile = false, onRivalCommand = () => {}, selectNodeFromMap = () => {},
    currentRegion = 'UNKNOWN', trace = 0, targetIP, botnet = [] } = props;
  const [view, setView] = useState('territory');
  const [selected, setSelected] = useState(null);
  const [showNeutral, setShowNeutral] = useState(true);

  const map = useMemo(() => {
    const nodes = Object.entries(world).filter(([ip, n]) => ip !== 'local' && n && !n.isHidden)
      .map(([ip, n]) => ({ ip, ...n, xMap: nCoord(n.x, W, W / 2), yMap: nCoord(n.y, H, H / 2) }));
    const rIndex = new Map(rivals.map((r, i) => [String(r.id), { ...r, color: PALETTE[i % PALETTE.length] }]));
    const owned = nodes.filter(n => safeOwner(n));
    // Color only hexes within the influence of actual claimed nodes. Remaining hexes are unclaimed.
    const cols = 19, rows = 12, radius = 29;
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = 29 + col * 52 + (row % 2) * 26;
        const y = 28 + row * 48;
        let best = null, distance = Infinity;
        for (const node of owned) {
          const d = Math.hypot(x - node.xMap, y - node.yMap);
          if (d < distance) { best = node; distance = d; }
        }
        const owner = distance < 94 && best ? String(best.owner) : null;
        cells.push({ id: `${row}-${col}`, x, y, owner, path: hexPath(x, y, radius - 1.5) });
      }
    }
    const counts = new Map();
    for (const n of nodes) if (n.owner) counts.set(String(n.owner), (counts.get(String(n.owner)) || 0) + 1);
    const anchors = new Map();
    for (const [owner] of counts) {
      const core = nodes.find(n => String(n.owner) === owner && n.isCore);
      const own = nodes.filter(n => String(n.owner) === owner);
      anchors.set(owner, core ? { x: core.xMap, y: core.yMap } : {
        x: own.reduce((s, n) => s + n.xMap, 0) / own.length,
        y: own.reduce((s, n) => s + n.yMap, 0) / own.length
      });
    }
    return { nodes, cells, counts, anchors, rIndex };
  }, [world, rivals]);
  const colorFor = owner => owner === 'player' ? PLAYER : map.rIndex.get(String(owner))?.color || '#7f8c9b';
  const chosen = selected === 'player' ? { handle: 'YOU', archetypeName: 'YOUR NETWORK', relationship: 100 } : map.rIndex.get(String(selected));
  const chosenNodes = map.nodes.filter(n => String(n.owner) === String(selected));
  const activeRivals = rivals.filter(r => r.status !== 'destroyed').length;

  const selectSector = owner => { setSelected(owner); };
  const openNetwork = () => setView('network');
  const runDossier = (r) => {
    if (isMobile) toggleExpand();
    onRivalCommand(`dossier ${r.handle}`);
  };

  // Keep the original compact expand/collapse behavior, without stacking both map engines.
  if (!expanded) return (
    <div onClick={toggleExpand} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); } }}
      style={{ height: isMobile ? 60 : 80, flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        background: 'linear-gradient(110deg,#071418,#0e2227)', border: `1px solid ${COLORS.border}`, padding: '0 15px', color: '#9dccc4', fontFamily: 'inherit' }}>
      <span style={{ fontSize: 11, letterSpacing: 1 }}>⬡ HEXOVERRIDE / TURF CONTROL <span style={{ color: PLAYER }}>● {map.counts.get('player') || 0} YOUR NODES</span> · {activeRivals} RIVALS</span>
      <span style={{ fontSize: 10, color: '#6e9da5' }}>▼ OPEN MAP</span>
    </div>
  );

  return <div style={{ flex: 1, minWidth: 0, height: isMobile ? '100%' : 510, position: isMobile ? 'fixed' : 'relative',
    inset: isMobile ? 0 : undefined, zIndex: isMobile ? 200 : undefined,
    display: 'flex', flexDirection: 'column', background: '#071015', border: `1px solid ${trace > 75 ? '#e86965' : '#31545b'}`,
    boxShadow: 'inset 0 0 38px #0009', fontFamily: 'inherit', overflow: 'hidden', color: '#c7dedb' }}>
    <style>{`@keyframes turfSignal{to{stroke-dashoffset:-32}} @keyframes turfPing{50%{opacity:.24;transform:scale(1.7)}} .turf-conflict{stroke-dasharray:7 7;animation:turfSignal 1.5s linear infinite}.turf-node{cursor:pointer}.turf-node:hover{filter:brightness(1.5)} .turf-list-item:hover{background:#203239!important}`}</style>
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
      padding: '9px 10px', borderBottom: '1px solid #26454b', background: '#0b1d23', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: PLAYER, fontSize: 11, fontWeight: 800, letterSpacing: 1, paddingRight: 6 }}>⬡ NETSPACE</span>
        <button onClick={() => setView('territory')} style={buttonStyle(view === 'territory')}>TERRITORY</button>
        <button onClick={openNetwork} style={buttonStyle(view === 'network')}>NETWORK / SCAN</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 9, color: '#90acb0' }}>{String(currentRegion).toUpperCase()} · {map.nodes.length} HOSTS</span>
        <button onClick={toggleExpand} style={buttonStyle(false)}>✕ CLOSE</button>
      </div>
    </header>
    {view === 'network' ? <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
      {/* The full original technical network map retains Wi-Fi, proxy, scan, contract, trace and rival commands. */}
      <LegacyNetworkMap {...props} isMobile={isMobile} expanded={true} toggleExpand={() => setView('territory')} />
      <div style={{ position: 'absolute', bottom: 5, left: 8, fontSize: 9, color: '#87aaa9', pointerEvents: 'none' }}>DETAILED VIEW · CLICK NODES TO TARGET · USE TOP TAB FOR TURF</div>
    </div> : <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: 0, minHeight: isMobile ? 240 : 0,
        background: 'radial-gradient(circle at 50% 45%,#102b30,#071218 75%)', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: 'block' }} aria-label="Sector territory map based on actual node ownership">
          <defs><pattern id="turf-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" fill="none" stroke="#31535a" strokeWidth=".6" opacity=".45"/></pattern>
            <filter id="turf-glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
          <rect width={W} height={H} fill="url(#turf-grid)"/>
          {map.cells.map(c => <path key={c.id} d={c.path} fill={c.owner ? colorFor(c.owner) : '#12262d'}
            fillOpacity={c.owner ? selected === c.owner ? .43 : .23 : .28}
            stroke={c.owner ? colorFor(c.owner) : '#2c4b51'} strokeOpacity={c.owner ? .65 : .28} strokeWidth={c.owner ? 1.5 : .8}
            onClick={() => c.owner && selectSector(c.owner)} style={{ cursor: c.owner ? 'pointer' : 'default' }}/>) }
          {map.nodes.filter(n => showNeutral || n.owner).map(n => {
            const c = n.owner ? colorFor(String(n.owner)) : NEUTRAL;
            const isTarget = targetIP === n.ip;
            const active = botnet.includes(n.ip);
            return <g key={n.ip} className="turf-node" onClick={() => { setSelected(n.owner ? String(n.owner) : null); selectNodeFromMap(n.ip); }}>
              {(n.isCore || isTarget) && <circle cx={n.xMap} cy={n.yMap} r="16" fill="none" stroke={c} strokeWidth="2" opacity=".7"/>}
              <circle cx={n.xMap} cy={n.yMap} r={n.isCore ? 7 : 4.2} fill="#07161a" stroke={isTarget ? '#fff5a3' : c} strokeWidth={n.isCore ? 3 : 1.6}/>
              {active && <circle cx={n.xMap} cy={n.yMap} r="2.8" fill={PLAYER}/>}
              <title>{n.ip} · {n.name || n.org?.orgName || 'host'} · {n.owner ? n.owner === 'player' ? 'Your territory' : map.rIndex.get(String(n.owner))?.handle || 'Rival' : 'Unclaimed'}</title>
            </g>;
          })}
          {(rivalConflicts || []).map((pair, i) => {
            const a = map.anchors.get(String(pair[0])); const b = map.anchors.get(String(pair[1]));
            if (!a || !b) return null;
            return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ff7977" strokeWidth="3" className="turf-conflict"/>
              <circle cx={(a.x+b.x)/2} cy={(a.y+b.y)/2} r="12" fill="#471a25" stroke="#ff7977" strokeWidth="2"/>
              <text x={(a.x+b.x)/2} y={(a.y+b.y)/2 + 4} fill="#ffd3c9" fontSize="12" textAnchor="middle">!</text></g>;
          })}
          {[...map.anchors.entries()].map(([owner, a]) => {
            const r = owner === 'player' ? null : map.rIndex.get(owner);
            const label = owner === 'player' ? 'YOU' : (r?.handle || 'UNKNOWN');
            return <g key={owner} style={{ cursor: 'pointer' }} onClick={() => selectSector(owner)}>
              <rect x={a.x - 47} y={a.y - 41} width="94" height="24" rx="3" fill="#07161b" stroke={colorFor(owner)} strokeOpacity=".8"/>
              <text x={a.x} y={a.y - 25} textAnchor="middle" fontSize="11" fontWeight="bold" fill={colorFor(owner)}>{label.slice(0, 13)}</text>
            </g>;
          })}
          <text x="20" y="565" fill="#719199" fontSize="12" letterSpacing="2">TACTICAL OVERVIEW // SECTORS FOLLOW CLAIMED NODES</text>
        </svg>
        <div style={{ position: 'absolute', top: 9, left: 9, background: '#07161ce8', border: '1px solid #31545b', padding: 8,
          fontSize: 10, lineHeight: 1.7, pointerEvents: 'none' }}>
          <div style={{ color: PLAYER, letterSpacing: 1 }}>⬡ TURF CONTROL</div>
          <div>YOUR NODES <b style={{ color: PLAYER }}>{map.counts.get('player') || 0}</b></div>
          <div>RIVAL NODES <b style={{ color: '#eab98e' }}>{map.nodes.filter(n => n.owner && n.owner !== 'player').length}</b></div>
          <div>CONFLICTS <b style={{ color: '#ff8980' }}>{rivalConflicts.length}</b></div>
        </div>
        <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 5 }}>
          <button style={buttonStyle(showNeutral)} onClick={() => setShowNeutral(v => !v)}>{showNeutral ? 'ALL HOSTS' : 'OWNED ONLY'}</button>
        </div>
      </div>
      <aside style={{ width: isMobile ? '100%' : 213, maxHeight: isMobile ? '40%' : undefined, overflowY: 'auto', flexShrink: 0,
        background: '#0c1b21', borderLeft: isMobile ? 'none' : '1px solid #294a50', borderTop: isMobile ? '1px solid #294a50' : 'none', padding: 9 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#8be4c7', letterSpacing: 1, marginBottom: 8 }}>FACTION INTELLIGENCE</div>
        <button className="turf-list-item" onClick={() => setSelected('player')} style={{ ...buttonStyle(selected === 'player'), width: '100%', textAlign: 'left', marginBottom: 4, borderColor: PLAYER }}>● YOU <span style={{ float: 'right' }}>{map.counts.get('player') || 0}</span></button>
        {rivals.map((r, i) => {
          const color = PALETTE[i % PALETTE.length]; const active = selected === String(r.id);
          return <button key={r.id} className="turf-list-item" onClick={() => selectSector(String(r.id))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '6px', marginBottom: 3,
              background: active ? '#203239' : '#10232a', color: '#d2e5e2', border: `1px solid ${active ? color : '#234148'}`, fontFamily: 'inherit', cursor: 'pointer', fontSize: 10 }}>
            <span><span style={{ color, marginRight: 6 }}>◆</span>{r.handle}{r.status === 'destroyed' ? ' ✕' : ''}</span>
            <span style={{ color }}>{map.counts.get(String(r.id)) || 0}</span>
          </button>;
        })}
        <div style={{ borderTop: '1px solid #31545b', marginTop: 10, paddingTop: 9, fontSize: 10, lineHeight: 1.7 }}>
          {selected && chosen ? <>
            <div style={{ color: colorFor(selected), fontWeight: 800, letterSpacing: 1 }}>@{chosen.handle}</div>
            <div style={{ color: '#abc8c9' }}>{chosen.archetypeName || chosen.archetype || 'OPERATOR'}</div>
            <div>OWNED NODES: <b>{chosenNodes.length}</b></div>
            {selected !== 'player' && <><div>REP: {chosen.rep ?? '—'}</div><div>RELATIONSHIP: {chosen.relationship ?? '—'}</div>
              {chosen.npc?.currentActivity && <div>ACTIVITY: {chosen.npc.currentActivity}</div>}
              <button style={{ ...buttonStyle(true), marginTop: 6, width: '100%' }} onClick={() => runDossier(chosen)}>OPEN DOSSIER</button></>}
            <button style={{ ...buttonStyle(false), marginTop: 5, width: '100%' }} onClick={openNetwork}>DETAILED NETWORK →</button>
          </> : <span style={{ color: '#7f9ca3' }}>SELECT A FACTION OR COLORED SECTOR TO INSPECT. NEUTRAL HOSTS REMAIN UNCLAIMED.</span>}
        </div>
      </aside>
    </div>}
  </div>;
}
