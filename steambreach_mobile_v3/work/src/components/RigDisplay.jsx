import React, { useMemo, useState, useEffect } from 'react';
import { COLORS } from '../constants/gameConstants';
import { PARTS_BY_ID } from '../constants/rigParts'; // Ensure this path is correct

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const SLOT_LAYOUT = {
  CPU:  { x: 100, y: 52,  w: 80, h: 42 },
  GPU:  { x: 100, y: 110, w: 80, h: 42 },
  RAM:  { x: 14,  y: 52,  w: 72, h: 42 },
  SSD:  { x: 14,  y: 110, w: 72, h: 42 },
  PSU:  { x: 14,  y: 168, w: 72, h: 42 },
  COOL: { x: 196, y: 52,  w: 80, h: 42 },
  NET:  { x: 196, y: 110, w: 80, h: 42 },
  CASE: { x: 196, y: 168, w: 80, h: 42 },
};

const TRACES = [
  { from: 'PSU', to: 'CPU',  pts: [[50,189],[50,210],[160,210],[160,189],[140,168],[140,94]] },
  { from: 'PSU', to: 'GPU',  pts: [[86,189],[100,189],[140,168],[140,152]] },
  { from: 'CPU', to: 'RAM',  pts: [[100,73],[86,73]] },
  { from: 'CPU', to: 'COOL', pts: [[180,73],[196,73]] },
  { from: 'GPU', to: 'SSD',  pts: [[100,131],[86,131]] },
  { from: 'GPU', to: 'NET',  pts: [[180,131],[196,131]] },
  { from: 'PSU', to: 'CASE', pts: [[86,189],[196,189]] },
];

const TIER_GLOW = {
  0: { fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(120,220,232,0.12)', glow: 'none', text: '#3a4a55' },
  1: { fill: 'rgba(120,220,232,0.06)', stroke: 'rgba(120,220,232,0.45)', glow: '0 0 8px rgba(120,220,232,0.25)', text: COLORS.primary },
  2: { fill: 'rgba(169,220,118,0.06)', stroke: 'rgba(169,220,118,0.55)', glow: '0 0 12px rgba(169,220,118,0.3)', text: COLORS.secondary },
  3: { fill: 'rgba(255,216,102,0.08)', stroke: 'rgba(255,216,102,0.65)', glow: '0 0 18px rgba(255,216,102,0.35)', text: COLORS.warning },
};

function SlotIcon({ slot, x, y, tier, color }) {
  const c = tier > 0 ? color : '#2a3545';
  const dim = tier > 0 ? 0.9 : 0.3;
  const cx = x, cy = y;

  switch (slot) {
    case 'CPU': return (
      <g opacity={dim}>
        <rect x={cx-8} y={cy-8} width={16} height={16} rx={2} fill="none" stroke={c} strokeWidth="1.2" />
        {[-6,-2,2,6].map(d => <line key={`t${d}`} x1={cx+d} y1={cy-8} x2={cx+d} y2={cy-12} stroke={c} strokeWidth="0.7" />)}
        {[-6,-2,2,6].map(d => <line key={`b${d}`} x1={cx+d} y1={cy+8} x2={cx+d} y2={cy+12} stroke={c} strokeWidth="0.7" />)}
        {[-6,-2,2,6].map(d => <line key={`l${d}`} x1={cx-8} y1={cy+d} x2={cx-12} y2={cy+d} stroke={c} strokeWidth="0.7" />)}
        {[-6,-2,2,6].map(d => <line key={`r${d}`} x1={cx+8} y1={cy+d} x2={cx+12} y2={cy+d} stroke={c} strokeWidth="0.7" />)}
        <rect x={cx-4} y={cy-4} width={8} height={8} rx={1} fill={tier >= 2 ? c : 'none'} fillOpacity={0.2} stroke={c} strokeWidth="0.5" />
      </g>
    );
    case 'GPU': return (
      <g opacity={dim}>
        <rect x={cx-12} y={cy-7} width={24} height={14} rx={2} fill="none" stroke={c} strokeWidth="1" />
        <circle cx={cx-4} cy={cy} r={4} fill="none" stroke={c} strokeWidth="0.7" />
        <circle cx={cx+6} cy={cy} r={4} fill="none" stroke={c} strokeWidth="0.7" />
        <line x1={cx-4} y1={cy-2} x2={cx-4} y2={cy+2} stroke={c} strokeWidth="0.5" />
        <line x1={cx+6} y1={cy-2} x2={cx+6} y2={cy+2} stroke={c} strokeWidth="0.5" />
        {tier >= 2 && <rect x={cx-11} y={cy+4} width={22} height={2} rx={1} fill={c} fillOpacity={0.3} />}
      </g>
    );
    case 'RAM': return (
      <g opacity={dim}>
        <rect x={cx-10} y={cy-5} width={20} height={10} rx={1} fill="none" stroke={c} strokeWidth="0.9" />
        {[-7,-3,1,5].map(d => <rect key={d} x={cx+d} y={cy-3} width={2.5} height={6} rx={0.5} fill={c} fillOpacity={tier >= 2 ? 0.5 : 0.2} />)}
        <line x1={cx-10} y1={cy+5} x2={cx-10} y2={cy+8} stroke={c} strokeWidth="0.5" />
        <line x1={cx+10} y1={cy+5} x2={cx+10} y2={cy+8} stroke={c} strokeWidth="0.5" />
      </g>
    );
    case 'SSD': return (
      <g opacity={dim}>
        <rect x={cx-10} y={cy-4} width={20} height={8} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <rect x={cx-7} y={cy-2} width={5} height={4} rx={1} fill={c} fillOpacity={0.25} />
        <rect x={cx} y={cy-2} width={3} height={4} rx={0.5} fill={c} fillOpacity={tier >= 2 ? 0.4 : 0.15} />
        <circle cx={cx+7} cy={cy} r={1.5} fill="none" stroke={c} strokeWidth="0.6" />
      </g>
    );
    case 'PSU': return (
      <g opacity={dim}>
        <rect x={cx-8} y={cy-7} width={16} height={14} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <path d={`M${cx-2} ${cy-5} L${cx+1} ${cy-1} L${cx-1} ${cy-1} L${cx+2} ${cy+5} L${cx-1} ${cy+1} L${cx+1} ${cy+1} Z`}
          fill={c} fillOpacity={tier >= 2 ? 0.5 : 0.25} />
        <circle cx={cx+5} cy={cy+4} r={2} fill="none" stroke={c} strokeWidth="0.5" />
      </g>
    );
    case 'COOL': return (
      <g opacity={dim}>
        <circle cx={cx} cy={cy} r={8} fill="none" stroke={c} strokeWidth="0.9" />
        <path d={`M${cx-5} ${cy} Q${cx-2} ${cy-4} ${cx} ${cy} Q${cx+2} ${cy+4} ${cx+5} ${cy}`}
          fill="none" stroke={c} strokeWidth="1" />
        {tier >= 2 && <circle cx={cx} cy={cy} r={4} fill={c} fillOpacity={0.15} />}
      </g>
    );
    case 'NET': return (
      <g opacity={dim}>
        <line x1={cx} y1={cy+6} x2={cx} y2={cy-4} stroke={c} strokeWidth="1" />
        <path d={`M${cx-4} ${cy-2} Q${cx} ${cy-7} ${cx+4} ${cy-2}`} fill="none" stroke={c} strokeWidth="0.7" />
        <path d={`M${cx-7} ${cy} Q${cx} ${cy-10} ${cx+7} ${cy}`} fill="none" stroke={c} strokeWidth="0.7" />
        {tier >= 2 && <circle cx={cx} cy={cy-4} r={1.5} fill={c} fillOpacity={0.6} />}
      </g>
    );
    case 'CASE': return (
      <g opacity={dim}>
        <rect x={cx-9} y={cy-7} width={18} height={14} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <line x1={cx-9} y1={cy-2} x2={cx+9} y2={cy-2} stroke={c} strokeWidth="0.4" />
        <rect x={cx-6} y={cy} width={4} height={4} rx={1} fill={c} fillOpacity={0.2} />
        <rect x={cx+1} y={cy} width={4} height={4} rx={1} fill={c} fillOpacity={tier >= 2 ? 0.3 : 0.1} />
      </g>
    );
    default: return null;
  }
}

function Slot({ slot, pos, tier, selected, onClick, isProcessing, rgbPhase }) {
  const glow = TIER_GLOW[tier] || TIER_GLOW[0];
  const isCase = slot === 'CASE' && tier >= 2;

  const caseStroke = isCase ? `hsl(${rgbPhase % 360}, 70%, 60%)` : glow.stroke;
  const caseGlow = isCase ? `0 0 14px hsla(${rgbPhase % 360}, 70%, 50%, 0.4)` : glow.glow;

  const activeStroke = selected ? COLORS.warning : (isCase ? caseStroke : glow.stroke);
  const activeGlow = selected ? `0 0 10px ${COLORS.warning}44` : (isCase ? caseGlow : glow.glow);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {tier > 0 && (
        <rect
          x={pos.x - 2} y={pos.y - 2}
          width={pos.w + 4} height={pos.h + 4}
          rx={8} fill="none"
          stroke={activeStroke} strokeWidth="0.4" strokeOpacity={0.3}
          style={{ filter: activeGlow !== 'none' ? `drop-shadow(${activeGlow})` : 'none' }}
        />
      )}
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={6} fill={glow.fill} stroke={activeStroke} strokeWidth={selected ? 1.6 : (tier > 0 ? 1 : 0.6)} />
      <text x={pos.x + 6} y={pos.y + 11} fill={glow.text} fontSize="8" style={{ letterSpacing: '1.5px', fontWeight: tier > 0 ? 600 : 400 }}>{slot}</text>
      {tier > 0 && (
        <g>
          <rect x={pos.x + pos.w - 22} y={pos.y + 4} width={18} height={10} rx={3} fill={glow.stroke} fillOpacity={0.15} stroke={glow.stroke} strokeWidth="0.5" />
          <text x={pos.x + pos.w - 13} y={pos.y + 12} fill={glow.text} fontSize="7" textAnchor="middle" style={{ fontWeight: 700 }}>T{tier}</text>
        </g>
      )}
      {tier === 0 && <text x={pos.x + pos.w - 8} y={pos.y + 12} fill="#2a3545" fontSize="7" textAnchor="end">—</text>}
      <SlotIcon slot={slot} x={pos.x + pos.w / 2} y={pos.y + pos.h / 2 + 5} tier={tier} color={(TIER_GLOW[tier] || TIER_GLOW[0]).stroke} />
      {isProcessing && tier > 0 && <rect x={pos.x + 6} y={pos.y + pos.h - 5} width={pos.w - 12} height={1.5} rx={1} fill={glow.stroke} className="pulse-bar" />}
    </g>
  );
}

function EnergyTrace({ pts, active, tier, rgbPhase, isCase }) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const color = isCase ? `hsl(${rgbPhase % 360}, 70%, 55%)` : tier >= 3 ? COLORS.warning : tier >= 2 ? COLORS.secondary : tier >= 1 ? COLORS.primary : '#1a2535';
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeOpacity={tier > 0 ? 0.08 : 0.04} strokeWidth="6" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeOpacity={tier > 0 ? 0.35 : 0.08} strokeWidth="1.2" strokeLinecap="round" />
      {active && tier > 0 && <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={tier >= 3 ? '2 6' : tier >= 2 ? '3 8' : '2 10'} strokeLinecap="round" className="trace-flow" />}
    </>
  );
}

function StatBar({ x, y, w, label, value, max, color }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <g>
      <text x={x} y={y + 8} fill={COLORS.textDim} fontSize="8" style={{ letterSpacing: '0.5px' }}>{label}</text>
      <rect x={x + 40} y={y + 2} width={w} height={7} rx={3} fill="rgba(255,255,255,0.05)" />
      <rect x={x + 40} y={y + 2} width={Math.max(3, (w * pct) / 100)} height={7} rx={3} fill={color} style={{ transition: 'width 0.4s ease' }} />
      <text x={x + 40 + w + 6} y={y + 9} fill={COLORS.text} fontSize="7.5">{Math.round(value)}%</text>
    </g>
  );
}

function DetailPanel({ slot, partId, heat, cpuPct, gpuPct, isProcessing }) {
  const part = PARTS_BY_ID[partId];
  const tier = part ? part.gen : 0;
  const glow = TIER_GLOW[tier] || TIER_GLOW[0];
  const name = part ? part.name : `EMPTY — ${slot}`;
  const effect = part ? part.desc : 'No module installed';
  const statusText = heat >= 78 ? 'OVERHEAT' : heat >= 45 ? 'ELEVATED' : 'NOMINAL';
  const statusColor = heat >= 78 ? COLORS.danger : heat >= 45 ? COLORS.warning : COLORS.secondary;

  return (
    <g transform="translate(302 30)">
      <rect x={0} y={0} width={175} height={210} rx={10} fill="rgba(8,12,18,0.85)" stroke={tier > 0 ? glow.stroke : 'rgba(120,220,232,0.12)'} strokeWidth={tier > 0 ? 0.8 : 0.5} style={tier > 0 ? { filter: `drop-shadow(${glow.glow})` } : {}} />
      <text x={14} y={22} fill={glow.text} fontSize="11" style={{ letterSpacing: '2px', fontWeight: 600 }}>{slot}</text>
      {tier > 0 && <rect x={14 + slot.length * 8 + 8} y={12} width={22} height={13} rx={4} fill={glow.stroke} fillOpacity={0.15} stroke={glow.stroke} strokeWidth="0.5" />}
      {tier > 0 && <text x={14 + slot.length * 8 + 19} y={22} fill={glow.text} fontSize="8" textAnchor="middle" style={{ fontWeight: 700 }}>T{tier}</text>}
      <line x1={14} y1={30} x2={161} y2={30} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <text x={14} y={48} fill={tier > 0 ? COLORS.text : '#3a4a55'} fontSize="10">{name}</text>
      <rect x={14} y={56} width={147} height={60} rx={8} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <g transform="translate(87.5 86) scale(2.5)"><SlotIcon slot={slot} x={0} y={0} tier={tier} color={glow.stroke} /></g>
      <text x={14} y={134} fill={tier > 0 ? COLORS.secondary : '#2a3545'} fontSize="8">{tier > 0 ? `► ${effect}` : effect}</text>
      <line x1={14} y1={144} x2={161} y2={144} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <StatBar x={14} y={152} w={80} label="TEMP" value={heat} max={100} color={statusColor} />
      <StatBar x={14} y={168} w={80} label="CPU" value={cpuPct} max={100} color={COLORS.primary} />
      <StatBar x={14} y={184} w={80} label="GPU" value={gpuPct} max={100} color={COLORS.proxy} />
      <text x={14} y={208} fill={statusColor} fontSize="8" className={heat >= 78 ? 'blink-warn' : ''} style={{ letterSpacing: '1.5px' }}>{statusText}</text>
      <text x={161} y={208} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="end">{isProcessing ? '● ACTIVE' : '○ IDLE'}</text>
    </g>
  );
}

function CollapsedView({ tiers, heat, isProcessing }) {
  const statusColor = heat >= 78 ? COLORS.danger : heat >= 45 ? COLORS.warning : COLORS.secondary;
  const installedCount = Object.values(tiers).filter(t => t > 0).length;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '22px 10px 6px', gap: 6 }}>
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {Object.entries(tiers).map(([slot, tier]) => {
          const g = TIER_GLOW[tier] || TIER_GLOW[0];
          return (
            <div key={slot} style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${tier > 0 ? g.stroke : 'rgba(255,255,255,0.08)'}`, background: g.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', color: g.text, boxShadow: tier > 0 ? g.glow : 'none' }}>
              {slot.slice(0,2)}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '8px', color: statusColor, letterSpacing: '1px' }}>{installedCount}/8</div>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: isProcessing ? COLORS.secondary : 'rgba(255,255,255,0.15)', boxShadow: isProcessing ? `0 0 6px ${COLORS.secondary}` : 'none' }} />
    </div>
  );
}

export default function RigDisplay({
 rig={} 
  inventory = [], 
  heat = 0,
  isProcessing = false,
  expanded = false,
  toggleExpand,
  isMobile = false,
}) {
  if (isMobile) return null;

  const [selected, setSelected] = useState('CPU');
  const [rgbPhase, setRgbPhase] = useState(0);

  const safeHeat = clamp(heat, 0, 100);
  const isHot = safeHeat >= 78;

  // RGB color cycling
  const hasRGB = inventory.includes('RGB');
  useEffect(() => {
    if (!hasRGB) return;
    const id = setInterval(() => setRgbPhase(p => p + 3), 50);
    return () => clearInterval(id);
  }, [hasRGB]);

  // Sync tiers based on the 'rig' object
  const tiers = useMemo(() => {
    const obj = {};
    const slots = ['CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'COOL', 'NET', 'CASE'];
    
    slots.forEach(s => {
      const slotKey = s.toLowerCase(); // Fixes the lowercase/uppercase mismatch
      const partId = rig[slotKey];
      const part = (PARTS_BY_ID && partId) ? PARTS_BY_ID[partId] : null;
      obj[s] = part ? (part.gen || 1) : 0;
    });
    return obj;
  }, [rig]);

  const cpuPct = tiers.CPU > 0 ? clamp(Math.round(safeHeat * 0.72 + (isProcessing ? 10 : 0)), 8, 100) : 0;
  const gpuPct = tiers.GPU > 0 ? clamp(Math.round(safeHeat * 0.9 + (isProcessing ? 12 : 0)), 10, 100) : 0;

  const statusColor = isHot ? COLORS.danger : safeHeat >= 45 ? COLORS.warning : COLORS.secondary;

  // ADJUSTED WIDTHS: 450 is plenty for the expanded view
  const width = expanded ? 480 : 220; 
  const height = expanded ? 260 : 56;

  return (
    <div
      style={{
        width, height, flexShrink: 0,
        border: `1px solid ${isHot ? `${COLORS.danger}55` : COLORS.border}`,
        position: 'relative', background: COLORS.bgDark, overflow: 'hidden', borderRadius: '4px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: expanded ? 'default' : 'pointer',
        boxShadow: isHot ? `0 0 16px ${COLORS.danger}18` : 'inset 0 0 20px rgba(0,0,0,0.4)',
        zIndex: 100 // Ensure it stays above other elements
      }}
      onClick={!expanded ? toggleExpand : undefined}
    >
      <style>{`
        @keyframes traceFlow { to { stroke-dashoffset: -20; } }
        @keyframes blinkWarn { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pulseBar { 0%,100%{opacity:0.8} 50%{opacity:0.2} }
        .trace-flow { animation: traceFlow 0.7s linear infinite; }
        .blink-warn { animation: blinkWarn 0.8s linear infinite; }
        .pulse-bar { animation: pulseBar 1s ease-in-out infinite; }
      `}</style>

      {/* Grid and Scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(120,220,232,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(120,220,232,0.03) 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 18, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', zIndex: 4, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', gap: 8, fontSize: '7.5px', letterSpacing: '1px' }}>
          <span style={{ color: COLORS.textDim }}>RIG STATUS</span>
          <span style={{ color: statusColor }}>{safeHeat}°C</span>
          {expanded && <span style={{ color: COLORS.proxy }}>POWER: {rig.power || 0}W</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleExpand(); }} style={{ background: 'none', border: 'none', color: COLORS.textDim, fontSize: '10px', cursor: 'pointer' }}>
          {expanded ? '✕' : '⇲'}
        </button>
      </div>

      {expanded ? (
        <svg width="480" height="260" viewBox="0 0 480 260">
          <g transform="translate(8 22)">
             {/* Motherboard Base */}
            <rect x={4} y={20} width={286} height={210} rx={12} fill="rgba(15,20,30,0.5)" stroke={hasRGB ? `hsla(${rgbPhase % 360}, 60%, 50%, 0.3)` : 'rgba(120,220,232,0.1)'} strokeWidth="1" />
            
            {/* Traces */}
            {TRACES.map((t, i) => (
              <EnergyTrace key={i} pts={t.pts} active={isProcessing} tier={Math.max(tiers[t.from] || 0, tiers[t.to] || 0)} rgbPhase={rgbPhase} isCase={t.to === 'CASE' && tiers.CASE >= 2} />
            ))}

            {/* Slots */}
            {Object.entries(SLOT_LAYOUT).map(([slot, pos]) => (
              <Slot 
                key={slot} slot={slot} pos={pos} 
                tier={tiers[slot]} 
                selected={selected === slot} 
                isProcessing={isProcessing} 
                rgbPhase={rgbPhase} 
                onClick={() => setSelected(slot)} 
              />
            ))}
          </g>

          {/* Right side detail panel */}
          <DetailPanel 
            slot={selected} 
            partId={rig[selected.toLowerCase()]} 
            heat={safeHeat} 
            cpuPct={cpuPct} 
            gpuPct={gpuPct} 
            isProcessing={isProcessing} 
          />
        </svg>
      ) : (
        <CollapsedView tiers={tiers} heat={safeHeat} isProcessing={isProcessing} />
      )}
    </div>
  );
}
