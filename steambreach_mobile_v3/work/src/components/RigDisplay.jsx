import React, { useMemo, useState, useEffect } from 'react';
import { COLORS } from '../constants/gameConstants';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// ─────────────────────────────────────────────────────────────
// LAYOUT — motherboard positions (expanded SVG coords)
// ─────────────────────────────────────────────────────────────
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

// Traces — energy paths between components (from → to waypoints)
const TRACES = [
  { from: 'PSU', to: 'CPU',  pts: [[50,189],[50,210],[160,210],[160,189],[140,168],[140,94]] },
  { from: 'PSU', to: 'GPU',  pts: [[86,189],[100,189],[140,168],[140,152]] },
  { from: 'CPU', to: 'RAM',  pts: [[100,73],[86,73]] },
  { from: 'CPU', to: 'COOL', pts: [[180,73],[196,73]] },
  { from: 'GPU', to: 'SSD',  pts: [[100,131],[86,131]] },
  { from: 'GPU', to: 'NET',  pts: [[180,131],[196,131]] },
  { from: 'PSU', to: 'CASE', pts: [[86,189],[196,189]] },
];

// ─────────────────────────────────────────────────────────────
// TIER SYSTEM — maps shop item IDs → tier per slot
// ─────────────────────────────────────────────────────────────
const TIERS = {
  CPU:  ['CPU', 'CPU_MK2', 'CPU_MK3'],
  GPU:  ['GPU', 'GPU_MK2', 'GPU_MK3'],
  RAM:  ['RAM', 'RAM_MK2', 'RAM_MK3'],
  SSD:  ['Storage', 'Storage_MK2', 'Storage_MK3'],
  PSU:  ['PSU', 'PSU_MK2', 'PSU_MK3'],
  COOL: ['Cooling', 'Cooling_MK2'],
  NET:  ['NetCard', 'NetCard_MK2'],
  CASE: ['ATXCase', 'RGB'],
};

const SLOT_NAMES = {
  CPU:  ['—', 'Quantum Thread Ripper', 'Dual-QTR Array', 'Tricore Entangler'],
  GPU:  ['—', 'Neural Net Accelerator', 'Tensor Forge MK2', 'Singularity Core'],
  RAM:  ['—', '64GB DDR6 ECC', '128GB DDR6 OC', '256GB Photonic'],
  SSD:  ['—', '4TB NVMe Gen5', '8TB RAID-0 Gen5', '16TB Crystal Lattice'],
  PSU:  ['—', '1200W Platinum', '1600W Titanium', '2000W Fusion Cell'],
  COOL: ['—', 'Liquid Immersion Loop', 'Cryo-Cascade MK2'],
  NET:  ['—', 'Fiber-Optic Backbone', '10G Quantum Link'],
  CASE: ['—', 'Tempered Glass Chassis', 'ARGB Reactive Shell'],
};

const SLOT_EFFECTS = {
  CPU:  ['', 'hashcat +50% speed', 'hashcat +100% speed', 'hashcat instant'],
  GPU:  ['', 'hashcat instant crack', 'xmrig +50% income', 'xmrig +100% income'],
  RAM:  ['', '+2 max proxies', '+3 max proxies', '+5 max proxies'],
  SSD:  ['', 'exfil +25% faster', 'exfil +50% faster', 'exfil instant'],
  PSU:  ['', 'trace -10% slower', 'trace -20% slower', 'trace -30% slower'],
  COOL: ['', 'xmrig -50% heat', 'xmrig -80% heat'],
  NET:  ['', 'nmap finds 2 nodes', 'nmap finds 3 nodes'],
  CASE: ['', 'Aesthetic upgrade', 'RGB reactive lighting'],
};

function getTier(inventory, slot) {
  const ids = TIERS[slot] || [];
  let tier = 0;
  ids.forEach((id, i) => { if (inventory.includes(id)) tier = i + 1; });
  return tier;
}

// ─────────────────────────────────────────────────────────────
// TIER COLORS — visual escalation per tier
// ─────────────────────────────────────────────────────────────
const TIER_GLOW = {
  0: { fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(120,220,232,0.12)', glow: 'none', text: '#3a4a55' },
  1: { fill: 'rgba(120,220,232,0.06)', stroke: 'rgba(120,220,232,0.45)', glow: '0 0 8px rgba(120,220,232,0.25)', text: COLORS.primary },
  2: { fill: 'rgba(169,220,118,0.06)', stroke: 'rgba(169,220,118,0.55)', glow: '0 0 12px rgba(169,220,118,0.3)', text: COLORS.secondary },
  3: { fill: 'rgba(255,216,102,0.08)', stroke: 'rgba(255,216,102,0.65)', glow: '0 0 18px rgba(255,216,102,0.35)', text: COLORS.warning },
};

// ─────────────────────────────────────────────────────────────
// COMPONENT ICONS — unique SVG per slot type
// ─────────────────────────────────────────────────────────────
function SlotIcon({ slot, x, y, tier, color }) {
  const c = tier > 0 ? color : '#2a3545';
  const dim = tier > 0 ? 0.9 : 0.3;
  const cx = x, cy = y;

  switch (slot) {
    case 'CPU': return (
      <g opacity={dim}>
        <rect x={cx-8} y={cy-8} width={16} height={16} rx={2} fill="none" stroke={c} strokeWidth="1.2" />
        {/* pins */}
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
        {/* fans */}
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
        {/* lightning bolt */}
        <path d={`M${cx-2} ${cy-5} L${cx+1} ${cy-1} L${cx-1} ${cy-1} L${cx+2} ${cy+5} L${cx-1} ${cy+1} L${cx+1} ${cy+1} Z`}
          fill={c} fillOpacity={tier >= 2 ? 0.5 : 0.25} />
        <circle cx={cx+5} cy={cy+4} r={2} fill="none" stroke={c} strokeWidth="0.5" />
      </g>
    );
    case 'COOL': return (
      <g opacity={dim}>
        <circle cx={cx} cy={cy} r={8} fill="none" stroke={c} strokeWidth="0.9" />
        {/* coolant flow */}
        <path d={`M${cx-5} ${cy} Q${cx-2} ${cy-4} ${cx} ${cy} Q${cx+2} ${cy+4} ${cx+5} ${cy}`}
          fill="none" stroke={c} strokeWidth="1" />
        {tier >= 2 && <circle cx={cx} cy={cy} r={4} fill={c} fillOpacity={0.15} />}
      </g>
    );
    case 'NET': return (
      <g opacity={dim}>
        {/* antenna / signal */}
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

// ─────────────────────────────────────────────────────────────
// SLOT COMPONENT — clickable card with icon + glow
// ─────────────────────────────────────────────────────────────
function Slot({ slot, pos, tier, selected, onClick, isProcessing, rgbPhase }) {
  const glow = TIER_GLOW[tier] || TIER_GLOW[0];
  const isCase = slot === 'CASE' && tier >= 2;

  // RGB case gets cycling hue
  const caseStroke = isCase
    ? `hsl(${rgbPhase % 360}, 70%, 60%)`
    : glow.stroke;
  const caseGlow = isCase
    ? `0 0 14px hsla(${rgbPhase % 360}, 70%, 50%, 0.4)`
    : glow.glow;

  const activeStroke = selected ? COLORS.warning : (isCase ? caseStroke : glow.stroke);
  const activeGlow = selected ? `0 0 10px ${COLORS.warning}44` : (isCase ? caseGlow : glow.glow);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Glow backdrop for installed components */}
      {tier > 0 && (
        <rect
          x={pos.x - 2} y={pos.y - 2}
          width={pos.w + 4} height={pos.h + 4}
          rx={8} fill="none"
          stroke={activeStroke} strokeWidth="0.4" strokeOpacity={0.3}
          style={{ filter: activeGlow !== 'none' ? `drop-shadow(${activeGlow})` : 'none' }}
        />
      )}
      {/* Main card */}
      <rect
        x={pos.x} y={pos.y}
        width={pos.w} height={pos.h}
        rx={6}
        fill={glow.fill}
        stroke={activeStroke}
        strokeWidth={selected ? 1.6 : (tier > 0 ? 1 : 0.6)}
      />
      {/* Slot label */}
      <text
        x={pos.x + 6} y={pos.y + 11}
        fill={glow.text} fontSize="8"
        style={{ letterSpacing: '1.5px', fontWeight: tier > 0 ? 600 : 400 }}
      >
        {slot}
      </text>
      {/* Tier badge */}
      {tier > 0 && (
        <g>
          <rect
            x={pos.x + pos.w - 22} y={pos.y + 4}
            width={18} height={10} rx={3}
            fill={glow.stroke} fillOpacity={0.15}
            stroke={glow.stroke} strokeWidth="0.5"
          />
          <text
            x={pos.x + pos.w - 13} y={pos.y + 12}
            fill={glow.text} fontSize="7" textAnchor="middle" style={{ fontWeight: 700 }}
          >
            T{tier}
          </text>
        </g>
      )}
      {tier === 0 && (
        <text
          x={pos.x + pos.w - 8} y={pos.y + 12}
          fill="#2a3545" fontSize="7" textAnchor="end"
        >
          —
        </text>
      )}
      {/* Component icon centered in lower portion */}
      <SlotIcon
        slot={slot}
        x={pos.x + pos.w / 2}
        y={pos.y + pos.h / 2 + 5}
        tier={tier}
        color={(TIER_GLOW[tier] || TIER_GLOW[0]).stroke}
      />
      {/* Processing activity indicator */}
      {isProcessing && tier > 0 && (
        <rect
          x={pos.x + 6} y={pos.y + pos.h - 5}
          width={pos.w - 12} height={1.5} rx={1}
          fill={glow.stroke}
          className="pulse-bar"
        />
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// ENERGY TRACE — animated flowing lines between components
// ─────────────────────────────────────────────────────────────
function EnergyTrace({ pts, active, tier, rgbPhase, isCase }) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const color = isCase
    ? `hsl(${rgbPhase % 360}, 70%, 55%)`
    : tier >= 3 ? COLORS.warning : tier >= 2 ? COLORS.secondary : tier >= 1 ? COLORS.primary : '#1a2535';

  return (
    <>
      {/* Base dim line */}
      <path d={d} fill="none" stroke={color} strokeOpacity={tier > 0 ? 0.08 : 0.04} strokeWidth="6" strokeLinecap="round" />
      {/* Core trace */}
      <path d={d} fill="none" stroke={color} strokeOpacity={tier > 0 ? 0.35 : 0.08} strokeWidth="1.2" strokeLinecap="round" />
      {/* Animated dash overlay */}
      {active && tier > 0 && (
        <path
          d={d} fill="none"
          stroke={color} strokeWidth="1.5"
          strokeDasharray={tier >= 3 ? '2 6' : tier >= 2 ? '3 8' : '2 10'}
          strokeLinecap="round"
          className="trace-flow"
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MINI STAT BAR
// ─────────────────────────────────────────────────────────────
function StatBar({ x, y, w, label, value, max, color }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <g>
      <text x={x} y={y + 8} fill={COLORS.textDim} fontSize="8" style={{ letterSpacing: '0.5px' }}>{label}</text>
      <rect x={x + 40} y={y + 2} width={w} height={7} rx={3} fill="rgba(255,255,255,0.05)" />
      <rect x={x + 40} y={y + 2} width={Math.max(3, (w * pct) / 100)} height={7} rx={3} fill={color}
        style={{ transition: 'width 0.4s ease' }} />
      <text x={x + 40 + w + 6} y={y + 9} fill={COLORS.text} fontSize="7.5">{Math.round(value)}%</text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL PANEL — right side info card
// ─────────────────────────────────────────────────────────────
function DetailPanel({ slot, tier, heat, cpuPct, gpuPct, isProcessing }) {
  const glow = TIER_GLOW[tier] || TIER_GLOW[0];
  const name = (SLOT_NAMES[slot] || [])[tier] || '—';
  const effect = (SLOT_EFFECTS[slot] || [])[tier] || '';
  const statusText = heat >= 78 ? 'OVERHEAT' : heat >= 45 ? 'ELEVATED' : 'NOMINAL';
  const statusColor = heat >= 78 ? COLORS.danger : heat >= 45 ? COLORS.warning : COLORS.secondary;

  return (
    <g transform="translate(302 30)">
      {/* Panel background */}
      <rect x={0} y={0} width={175} height={210} rx={10}
        fill="rgba(8,12,18,0.85)"
        stroke={tier > 0 ? glow.stroke : 'rgba(120,220,232,0.12)'}
        strokeWidth={tier > 0 ? 0.8 : 0.5}
        style={tier > 0 ? { filter: `drop-shadow(${glow.glow})` } : {}}
      />

      {/* Header */}
      <text x={14} y={22} fill={glow.text} fontSize="11" style={{ letterSpacing: '2px', fontWeight: 600 }}>
        {slot}
      </text>
      {tier > 0 && (
        <rect x={14 + slot.length * 8 + 8} y={12} width={22} height={13} rx={4}
          fill={glow.stroke} fillOpacity={0.15} stroke={glow.stroke} strokeWidth="0.5" />
      )}
      {tier > 0 && (
        <text x={14 + slot.length * 8 + 19} y={22} fill={glow.text} fontSize="8" textAnchor="middle" style={{ fontWeight: 700 }}>
          T{tier}
        </text>
      )}

      {/* Divider */}
      <line x1={14} y1={30} x2={161} y2={30} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

      {/* Component name */}
      <text x={14} y={48} fill={tier > 0 ? COLORS.text : '#3a4a55'} fontSize="10">
        {tier > 0 ? name : `EMPTY — ${slot}`}
      </text>

      {/* Large icon preview */}
      <rect x={14} y={56} width={147} height={60} rx={8}
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <g transform="translate(87.5 86) scale(2.5)">
        <SlotIcon slot={slot} x={0} y={0} tier={tier} color={glow.stroke} />
      </g>

      {/* Effect description */}
      <text x={14} y={134} fill={tier > 0 ? COLORS.secondary : '#2a3545'} fontSize="8">
        {tier > 0 ? `► ${effect}` : 'No module installed'}
      </text>

      {/* Stats */}
      <line x1={14} y1={144} x2={161} y2={144} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

      <StatBar x={14} y={152} w={80} label="TEMP" value={heat} max={100} color={statusColor} />
      <StatBar x={14} y={168} w={80} label="CPU" value={cpuPct} max={100} color={COLORS.primary} />
      <StatBar x={14} y={184} w={80} label="GPU" value={gpuPct} max={100} color={COLORS.proxy} />

      {/* Status */}
      <text x={14} y={208} fill={statusColor} fontSize="8"
        className={heat >= 78 ? 'blink-warn' : ''}
        style={{ letterSpacing: '1.5px' }}>
        {statusText}
      </text>
      <text x={161} y={208} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="end">
        {isProcessing ? '● ACTIVE' : '○ IDLE'}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// COLLAPSED VIEW — compact status strip
// ─────────────────────────────────────────────────────────────
function CollapsedView({ tiers, heat, isProcessing }) {
  const statusColor = heat >= 78 ? COLORS.danger : heat >= 45 ? COLORS.warning : COLORS.secondary;
  const installedCount = Object.values(tiers).filter(t => t > 0).length;
  const totalSlots = Object.keys(tiers).length;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center',
      padding: '22px 10px 6px',
      gap: 6,
    }}>
      {/* Mini slot indicators */}
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {Object.entries(tiers).map(([slot, tier]) => {
          const g = TIER_GLOW[tier] || TIER_GLOW[0];
          return (
            <div key={slot} style={{
              width: 20, height: 20, borderRadius: 4,
              border: `1px solid ${tier > 0 ? g.stroke : 'rgba(255,255,255,0.08)'}`,
              background: g.fill,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '6px', color: g.text, letterSpacing: '0.5px',
              boxShadow: tier > 0 ? g.glow : 'none',
            }}>
              {slot.slice(0,2)}
            </div>
          );
        })}
      </div>
      {/* Status */}
      <div style={{ fontSize: '8px', color: statusColor, letterSpacing: '1px', whiteSpace: 'nowrap' }}>
        {installedCount}/{totalSlots}
      </div>
      <div style={{
        width: 4, height: 4, borderRadius: '50%',
        background: isProcessing ? COLORS.secondary : 'rgba(255,255,255,0.15)',
        boxShadow: isProcessing ? `0 0 6px ${COLORS.secondary}` : 'none',
      }} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════════
export default function RigDisplay({
  inventory = [],
  heat = 0,
  isProcessing = false,
  expanded = false,
  toggleExpand,
  isMobile = false,
}) {
  // Hide on mobile — screen space is too precious
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

  const tiers = useMemo(() => {
    const obj = {};
    Object.keys(SLOT_LAYOUT).forEach(s => obj[s] = getTier(inventory, s));
    return obj;
  }, [inventory]);

  const cpuPct = tiers.CPU > 0 ? clamp(Math.round(safeHeat * 0.72 + (isProcessing ? 10 : 0)), 8, 100) : 0;
  const gpuPct = tiers.GPU > 0 ? clamp(Math.round(safeHeat * 0.9 + (isProcessing ? 12 : 0)), 10, 100) : 0;

  const statusColor = isHot ? COLORS.danger : safeHeat >= 45 ? COLORS.warning : COLORS.secondary;

  const width = expanded ? 500 : 220;
  const height = expanded ? 260 : 56;

  return (
    <div
      style={{
        width, height, flexShrink: 0,
        border: `1px solid ${isHot ? `${COLORS.danger}55` : COLORS.border}`,
        position: 'relative',
        background: COLORS.bgDark,
        overflow: 'hidden',
        borderRadius: '4px',
        transition: 'width 0.25s ease, height 0.25s ease',
        cursor: expanded ? 'default' : 'pointer',
        boxShadow: isHot
          ? `0 0 16px ${COLORS.danger}18, inset 0 0 24px ${COLORS.danger}08`
          : 'inset 0 0 20px rgba(0,0,0,0.4)',
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

      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(120,220,232,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(120,220,232,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '18px 18px',
      }} />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 18,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 8px', zIndex: 4,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: 'flex', gap: 8, fontSize: '7.5px', letterSpacing: '1px' }}>
          <span style={{ color: COLORS.textDim }}>RIG</span>
          <span style={{ color: statusColor }}>{safeHeat}°</span>
          {expanded && <span style={{ color: COLORS.proxy }}>{gpuPct}% GPU</span>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleExpand?.(); }}
          style={{
            background: 'none', border: 'none', color: COLORS.textDim,
            fontSize: '9px', cursor: 'pointer', fontFamily: 'inherit',
            padding: 0,
          }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded ? (
        <svg width="500" height="260" viewBox="0 0 500 260" style={{ marginTop: 0 }}>
          <g transform="translate(8 18)">
            {/* Motherboard outline */}
            <rect x={4} y={20} width={286} height={210} rx={12}
              fill="rgba(8,12,18,0.3)"
              stroke={hasRGB ? `hsla(${rgbPhase % 360}, 60%, 50%, 0.2)` : 'rgba(120,220,232,0.1)'}
              strokeWidth="0.8"
            />
            {/* Corner accents */}
            <path d="M 4 36 L 4 24 Q 4 20 8 20 L 20 20" fill="none" stroke={COLORS.primary} strokeWidth="1.2" strokeOpacity="0.3" />
            <path d="M 274 20 L 286 20 Q 290 20 290 24 L 290 36" fill="none" stroke={COLORS.primary} strokeWidth="1.2" strokeOpacity="0.3" />
            <path d="M 4 214 L 4 226 Q 4 230 8 230 L 20 230" fill="none" stroke={COLORS.primary} strokeWidth="1.2" strokeOpacity="0.3" />
            <path d="M 274 230 L 286 230 Q 290 230 290 226 L 290 214" fill="none" stroke={COLORS.primary} strokeWidth="1.2" strokeOpacity="0.3" />

            {/* Energy traces */}
            {TRACES.map((t, i) => {
              const maxTier = Math.max(tiers[t.from] || 0, tiers[t.to] || 0);
              const isCaseLine = t.to === 'CASE' && tiers.CASE >= 2;
              return (
                <EnergyTrace
                  key={i} pts={t.pts} active={isProcessing}
                  tier={maxTier} rgbPhase={rgbPhase} isCase={isCaseLine}
                />
              );
            })}

            {/* Slot cards */}
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

          {/* Detail panel */}
          <DetailPanel
            slot={selected} tier={tiers[selected]}
            heat={safeHeat} cpuPct={cpuPct} gpuPct={gpuPct}
            isProcessing={isProcessing}
          />
        </svg>
      ) : (
        <CollapsedView tiers={tiers} heat={safeHeat} isProcessing={isProcessing} />
      )}
    </div>
  );
}
