import React, { useMemo, useState, useEffect, useRef } from 'react';
import { COLORS } from '../constants/gameConstants';
import { PARTS_BY_ID } from '../constants/rigParts';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const genMap = { 'GEN2': 1, 'GEN3': 2, 'GEN4': 3, 'GEN5': 3, 'XGEN': 3 };
const toTier = (gen) => genMap[gen] ?? 1;

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

const ANIM_CSS = `
  @keyframes traceFlow    { to { stroke-dashoffset: -20; } }
  @keyframes traceFlowFast{ to { stroke-dashoffset: -12; } }
  @keyframes blinkWarn    { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes pulseBar     { 0%,100%{opacity:0.8} 50%{opacity:0.2} }
  @keyframes spinFan      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes spinFanRev   { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes cpuCorePulse { 0%,100%{opacity:0.15;r:3} 50%{opacity:0.55;r:4.5} }
  @keyframes cpuPinFlash  { 0%,100%{opacity:0.7} 50%{opacity:0.2} }
  @keyframes ramDataFlow  { 0%{opacity:0.1} 40%{opacity:0.8} 100%{opacity:0.1} }
  @keyframes ssdFlash     { 0%,100%{fill-opacity:0.15} 50%{fill-opacity:0.7} }
  @keyframes psuZap       { 0%,100%{opacity:0.25} 30%{opacity:0.9} 60%{opacity:0.4} 80%{opacity:1} }
  @keyframes netPulse     { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }
  @keyframes slotBreath   { 0%,100%{fill-opacity:0.03} 50%{fill-opacity:0.12} }
  @keyframes slotGlowPulse{ 0%,100%{stroke-opacity:0.45} 50%{stroke-opacity:0.9} }
  @keyframes particleMove { 0%{opacity:0;offset-distance:0%} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0;offset-distance:100%} }
  @keyframes heatShimmer  { 0%,100%{filter:drop-shadow(0 0 4px rgba(255,97,136,0.4))} 50%{filter:drop-shadow(0 0 12px rgba(255,97,136,0.9))} }
  @keyframes scanline     { 0%{transform:translateY(-100%)} 100%{transform:translateY(260px)} }
  @keyframes coreRing     { 0%{r:2;opacity:0.7} 100%{r:14;opacity:0} }
  @keyframes ledBlink     { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes dataPacket   { 0%{stroke-dashoffset:40} 100%{stroke-dashoffset:0} }
  @keyframes outerGlow    { 0%,100%{filter:drop-shadow(0 0 3px currentColor)} 50%{filter:drop-shadow(0 0 10px currentColor)} }
  @keyframes wave1        { 0%{stroke-opacity:0.8} 100%{stroke-opacity:0; transform:scale(1.5)} }
  @keyframes wave2        { 0%{stroke-opacity:0.6} 100%{stroke-opacity:0; transform:scale(1.8)} }

  .trace-flow      { animation: traceFlow 1.4s linear infinite; stroke-dasharray: 3 8; }
  .trace-flow-fast { animation: traceFlowFast 0.6s linear infinite; stroke-dasharray: 2 5; }
  .blink-warn      { animation: blinkWarn 0.8s linear infinite; }
  .pulse-bar       { animation: pulseBar 1s ease-in-out infinite; }
  .spin-fan        { animation: spinFan 1.2s linear infinite; transform-box: fill-box; transform-origin: center; }
  .spin-fan-slow   { animation: spinFan 2.5s linear infinite; transform-box: fill-box; transform-origin: center; }
  .spin-fan-rev    { animation: spinFanRev 0.9s linear infinite; transform-box: fill-box; transform-origin: center; }
  .cpu-core        { animation: cpuCorePulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .cpu-pin         { animation: cpuPinFlash 2s ease-in-out infinite; }
  .ram-data        { animation: ramDataFlow 0.8s ease-in-out infinite; }
  .ssd-flash       { animation: ssdFlash 0.6s ease-in-out infinite; }
  .psu-zap         { animation: psuZap 1.8s ease-in-out infinite; }
  .net-wave        { animation: netPulse 1.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  .slot-breath     { animation: slotBreath 2.5s ease-in-out infinite; }
  .slot-glow       { animation: slotGlowPulse 2s ease-in-out infinite; }
  .core-ring       { animation: coreRing 2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  .led-blink       { animation: ledBlink 1s step-end infinite; }
`;

// Animated slot icons
function SlotIcon({ slot, x, y, tier, color, isProcessing }) {
  const c = tier > 0 ? color : '#2a3545';
  const dim = tier > 0 ? 1.0 : 0.3;
  const cx = x, cy = y;
  const active = tier > 0 && isProcessing;

  switch (slot) {
    case 'CPU': return (
      <g opacity={dim}>
        {/* Outer casing */}
        <rect x={cx-9} y={cy-9} width={18} height={18} rx={2} fill="none" stroke={c} strokeWidth="1.2" className={active ? 'slot-glow' : ''} />
        {/* Pins - top/bottom/left/right */}
        {[-6,-2,2,6].map((d,i) => <line key={`t${d}`} x1={cx+d} y1={cy-9} x2={cx+d} y2={cy-13} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15}s`}:{}} />)}
        {[-6,-2,2,6].map((d,i) => <line key={`b${d}`} x1={cx+d} y1={cy+9} x2={cx+d} y2={cy+13} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15+0.6}s`}:{}} />)}
        {[-6,-2,2,6].map((d,i) => <line key={`l${d}`} x1={cx-9} y1={cy+d} x2={cx-13} y2={cy+d} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15+0.3}s`}:{}} />)}
        {[-6,-2,2,6].map((d,i) => <line key={`r${d}`} x1={cx+9} y1={cy+d} x2={cx+13} y2={cy+d} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15+0.9}s`}:{}} />)}
        {/* Die grid */}
        <rect x={cx-5} y={cy-5} width={10} height={10} rx={1} fill={c} fillOpacity={0.1} stroke={c} strokeWidth="0.5" />
        <line x1={cx-5} y1={cy} x2={cx+5} y2={cy} stroke={c} strokeWidth="0.4" strokeOpacity="0.5" />
        <line x1={cx} y1={cy-5} x2={cx} y2={cy+5} stroke={c} strokeWidth="0.4" strokeOpacity="0.5" />
        {/* Core pulse */}
        {tier > 0 && <circle cx={cx} cy={cy} r={2.5} fill={c} fillOpacity={0.3} className={active ? 'cpu-core' : ''} />}
        {/* Expanding ring on processing */}
        {active && <circle cx={cx} cy={cy} r={3} fill="none" stroke={c} strokeWidth="0.6" className="core-ring" />}
      </g>
    );

    case 'GPU': return (
      <g opacity={dim}>
        <rect x={cx-13} y={cy-8} width={26} height={16} rx={2} fill="none" stroke={c} strokeWidth="1" />
        {/* Fan 1 - spins */}
        <g style={{transformOrigin:`${cx-4}px ${cy}px`}} className={active ? 'spin-fan' : (tier > 0 ? 'spin-fan-slow' : '')}>
          <circle cx={cx-4} cy={cy} r={4.5} fill="none" stroke={c} strokeWidth="0.6" strokeOpacity="0.4" />
          {[0,60,120,180,240,300].map(a => {
            const rad = a * Math.PI/180;
            return <line key={a} x1={cx-4} y1={cy} x2={cx-4+Math.cos(rad)*4} y2={cy+Math.sin(rad)*4} stroke={c} strokeWidth="0.8" strokeOpacity="0.7" />;
          })}
          <circle cx={cx-4} cy={cy} r={1.2} fill={c} fillOpacity="0.6" />
        </g>
        {/* Fan 2 - counter-spins */}
        <g style={{transformOrigin:`${cx+5}px ${cy}px`}} className={active ? 'spin-fan-rev' : (tier > 0 ? 'spin-fan-slow' : '')}>
          <circle cx={cx+5} cy={cy} r={4.5} fill="none" stroke={c} strokeWidth="0.6" strokeOpacity="0.4" />
          {[30,90,150,210,270,330].map(a => {
            const rad = a * Math.PI/180;
            return <line key={a} x1={cx+5} y1={cy} x2={cx+5+Math.cos(rad)*4} y2={cy+Math.sin(rad)*4} stroke={c} strokeWidth="0.8" strokeOpacity="0.7" />;
          })}
          <circle cx={cx+5} cy={cy} r={1.2} fill={c} fillOpacity="0.6" />
        </g>
        {/* VRAM strip */}
        {tier >= 2 && <rect x={cx-12} y={cy+5} width={24} height={2} rx={1} fill={c} fillOpacity={active ? 0.5 : 0.2} className={active ? 'ssd-flash' : ''} />}
      </g>
    );

    case 'RAM': return (
      <g opacity={dim}>
        <rect x={cx-11} y={cy-6} width={22} height={12} rx={1} fill="none" stroke={c} strokeWidth="0.9" />
        {/* Chips with data animation */}
        {[-7,-3,1,5].map((d,i) => (
          <rect key={d} x={cx+d} y={cy-4} width={2.5} height={8} rx={0.5}
            fill={c} fillOpacity={active ? 0.6 : 0.2}
            className={active ? 'ram-data' : ''}
            style={active ? {animationDelay:`${i*0.15}s`} : {}}
          />
        ))}
        {/* Notch */}
        <rect x={cx-4} y={cy+6} width={8} height={3} rx={0} fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1={cx-11} y1={cy+5} x2={cx-11} y2={cy+9} stroke={c} strokeWidth="0.5" />
        <line x1={cx+11} y1={cy+5} x2={cx+11} y2={cy+9} stroke={c} strokeWidth="0.5" />
        {/* LED */}
        {tier > 0 && <circle cx={cx-9} cy={cy-4} r={1} fill={c} fillOpacity={0.8} className={active ? 'led-blink' : ''} />}
      </g>
    );

    case 'SSD': return (
      <g opacity={dim}>
        <rect x={cx-11} y={cy-5} width={22} height={10} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        {/* NAND chips */}
        <rect x={cx-8} y={cy-3} width={6} height={6} rx={1} fill={c} fillOpacity={0.2} stroke={c} strokeWidth="0.4" />
        <rect x={cx-1} y={cy-3} width={4} height={6} rx={1} fill={c}
          fillOpacity={active ? 0.5 : 0.15}
          className={active ? 'ssd-flash' : ''}
        />
        <rect x={cx+4} y={cy-3} width={4} height={6} rx={1} fill={c}
          fillOpacity={active ? 0.5 : 0.15}
          className={active ? 'ssd-flash' : ''}
          style={active ? {animationDelay:'0.3s'} : {}}
        />
        {/* Activity LED */}
        <circle cx={cx+9} cy={cy} r={1.5} fill="none" stroke={c} strokeWidth="0.6" />
        {tier > 0 && <circle cx={cx+9} cy={cy} r={0.8} fill={c} fillOpacity={0.8} className={active ? 'led-blink' : ''} style={active?{animationDelay:'0.1s'}:{}} />}
        {/* Data stripe */}
        {tier >= 2 && <rect x={cx-10} y={cy+4} width={20} height={1} rx={0.5} fill={c} fillOpacity={active ? 0.7 : 0.2} className={active ? 'ssd-flash' : ''} style={active?{animationDelay:'0.2s'}:{}} />}
      </g>
    );

    case 'PSU': return (
      <g opacity={dim}>
        <rect x={cx-9} y={cy-8} width={18} height={16} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        {/* Lightning bolt - animated */}
        <path d={`M${cx-1} ${cy-7} L${cx+2} ${cy-1} L${cx-0} ${cy-1} L${cx+3} ${cy+7} L${cx+0} ${cy+1} L${cx+2} ${cy+1} Z`}
          fill={c} fillOpacity={active ? 0.8 : 0.3}
          className={active ? 'psu-zap' : ''}
        />
        {/* Fan vent */}
        <circle cx={cx+6} cy={cy+4} r={2.5} fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.5" />
        {tier > 0 && (
          <g style={{transformOrigin:`${cx+6}px ${cy+4}px`}} className={tier > 0 ? 'spin-fan-slow' : ''}>
            {[0,90,180,270].map(a => {
              const rad = a*Math.PI/180;
              return <line key={a} x1={cx+6} y1={cy+4} x2={cx+6+Math.cos(rad)*2} y2={cy+4+Math.sin(rad)*2} stroke={c} strokeWidth="0.6" strokeOpacity="0.6" />;
            })}
          </g>
        )}
        {/* Power LED */}
        {tier > 0 && <circle cx={cx-7} cy={cy-6} r={1} fill={c} fillOpacity={0.9} className={active ? 'led-blink' : ''} style={active?{animationDelay:'0.5s'}:{}} />}
      </g>
    );

    case 'COOL': return (
      <g opacity={dim}>
        <circle cx={cx} cy={cy} r={9} fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
        {/* Main fan - always spins if installed */}
        <g style={{transformOrigin:`${cx}px ${cy}px`}} className={tier > 0 ? (active ? 'spin-fan' : 'spin-fan-slow') : ''}>
          {[0,45,90,135,180,225,270,315].map(a => {
            const rad = a*Math.PI/180;
            const r1 = 2, r2 = 7.5;
            const spread = 0.35;
            return (
              <path key={a}
                d={`M${cx+Math.cos(rad-spread)*r1} ${cy+Math.sin(rad-spread)*r1} Q${cx+Math.cos(rad)*r2*0.7} ${cy+Math.sin(rad)*r2*0.7} ${cx+Math.cos(rad+spread)*r2} ${cy+Math.sin(rad+spread)*r2} L${cx+Math.cos(rad+spread)*r1} ${cy+Math.sin(rad+spread)*r1} Z`}
                fill={c} fillOpacity={0.35} stroke={c} strokeWidth="0.3"
              />
            );
          })}
          <circle cx={cx} cy={cy} r={2} fill={c} fillOpacity={0.5} />
        </g>
        {/* Hub */}
        <circle cx={cx} cy={cy} r={1.5} fill={c} fillOpacity={0.8} />
        {/* Liquid cooling tubes on high tier */}
        {tier >= 2 && <rect x={cx-9} y={cy+7} width={18} height={2} rx={1} fill={c} fillOpacity={0.2} className={active ? 'ssd-flash' : ''} style={active?{animationDelay:'0.4s'}:{}} />}
      </g>
    );

    case 'NET': return (
      <g opacity={dim}>
        {/* Antenna */}
        <line x1={cx} y1={cy+7} x2={cx} y2={cy-5} stroke={c} strokeWidth="1.2" />
        <circle cx={cx} cy={cy-5} r={1} fill={c} fillOpacity={0.8} />
        {/* Signal waves - animated outward */}
        <path d={`M${cx-4} ${cy-1} Q${cx} ${cy-7} ${cx+4} ${cy-1}`} fill="none" stroke={c} strokeWidth="0.8" strokeOpacity={active ? 0.9 : 0.5} className={active ? 'net-wave' : ''} />
        <path d={`M${cx-7} ${cy+1} Q${cx} ${cy-11} ${cx+7} ${cy+1}`} fill="none" stroke={c} strokeWidth="0.7" strokeOpacity={active ? 0.6 : 0.35} className={active ? 'net-wave' : ''} style={active?{animationDelay:'0.4s'}:{}} />
        {tier >= 2 && <path d={`M${cx-10} ${cy+3} Q${cx} ${cy-15} ${cx+10} ${cy+3}`} fill="none" stroke={c} strokeWidth="0.5" strokeOpacity={active ? 0.4 : 0.2} className={active ? 'net-wave' : ''} style={active?{animationDelay:'0.8s'}:{}} />}
        {/* Signal dot */}
        {active && <circle cx={cx} cy={cy-5} r={1.5} fill={c} fillOpacity={0.6} className="core-ring" />}
      </g>
    );

    case 'CASE': return (
      <g opacity={dim}>
        <rect x={cx-10} y={cy-8} width={20} height={16} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <line x1={cx-10} y1={cy-3} x2={cx+10} y2={cy-3} stroke={c} strokeWidth="0.4" strokeOpacity="0.5" />
        {/* Drive bays */}
        <rect x={cx-7} y={cy-1} width={5} height={5} rx={1} fill={c} fillOpacity={0.15} />
        <rect x={cx+1} y={cy-1} width={5} height={5} rx={1} fill={c} fillOpacity={tier >= 2 ? 0.3 : 0.1} />
        {/* Window panel */}
        {tier >= 2 && <rect x={cx-7} y={cy-7} width={14} height={4} rx={1} fill={c} fillOpacity={0.1} stroke={c} strokeWidth="0.4" />}
        {/* Power LED */}
        {tier > 0 && <circle cx={cx-8} cy={cy+5} r={1} fill={c} fillOpacity={0.9} className="led-blink" style={{animationDelay:'0.2s'}} />}
      </g>
    );
    default: return null;
  }
}

function Slot({ slot, pos, tier, selected, onClick, isProcessing, rgbPhase }) {
  const glow = TIER_GLOW[tier] || TIER_GLOW[0];
  const isCase = slot === 'CASE' && tier >= 2;

  const caseStroke = isCase ? `hsl(${rgbPhase % 360}, 70%, 60%)` : glow.stroke;
  const caseGlow   = isCase ? `0 0 14px hsla(${rgbPhase % 360}, 70%, 50%, 0.4)` : glow.glow;
  const activeStroke = selected ? COLORS.warning : (isCase ? caseStroke : glow.stroke);
  const activeGlow   = selected ? `0 0 10px ${COLORS.warning}44` : (isCase ? caseGlow : glow.glow);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Outer ambient glow halo */}
      {tier > 0 && (
        <rect x={pos.x-2} y={pos.y-2} width={pos.w+4} height={pos.h+4}
          rx={8} fill="none" stroke={activeStroke} strokeWidth="0.4" strokeOpacity={0.3}
          style={{ filter: activeGlow !== 'none' ? `drop-shadow(${activeGlow})` : 'none' }}
          className={tier > 0 && !selected ? 'slot-glow' : ''}
        />
      )}
      {/* Main body */}
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h}
        rx={6} fill={glow.fill} stroke={activeStroke}
        strokeWidth={selected ? 1.8 : (tier > 0 ? 1 : 0.6)}
        className={tier > 0 ? 'slot-breath' : ''}
      />
      {/* Label */}
      <text x={pos.x+6} y={pos.y+11} fill={glow.text} fontSize="8"
        style={{ letterSpacing: '1.5px', fontWeight: tier > 0 ? 600 : 400 }}>{slot}</text>
      {/* Tier badge */}
      {tier > 0 && (
        <g>
          <rect x={pos.x+pos.w-22} y={pos.y+4} width={18} height={10} rx={3}
            fill={glow.stroke} fillOpacity={0.15} stroke={glow.stroke} strokeWidth="0.5" />
          <text x={pos.x+pos.w-13} y={pos.y+12} fill={glow.text} fontSize="7"
            textAnchor="middle" style={{ fontWeight: 700 }}>T{tier}</text>
        </g>
      )}
      {tier === 0 && <text x={pos.x+pos.w-8} y={pos.y+12} fill="#2a3545" fontSize="7" textAnchor="end">—</text>}
      {/* Animated icon */}
      <SlotIcon slot={slot} x={pos.x+pos.w/2} y={pos.y+pos.h/2+5}
        tier={tier} color={(TIER_GLOW[tier]||TIER_GLOW[0]).stroke}
        isProcessing={isProcessing} />
      {/* Processing bar */}
      {isProcessing && tier > 0 &&
        <rect x={pos.x+6} y={pos.y+pos.h-5} width={pos.w-12} height={1.5}
          rx={1} fill={glow.stroke} className="pulse-bar" />}
    </g>
  );
}

function EnergyTrace({ pts, active, tier, rgbPhase, isCase }) {
  const d = pts.map((p,i) => `${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
  const color = isCase
    ? `hsl(${rgbPhase%360}, 70%, 55%)`
    : tier >= 3 ? COLORS.warning : tier >= 2 ? COLORS.secondary : tier >= 1 ? COLORS.primary : '#1a2535';
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeOpacity={tier>0?0.08:0.04} strokeWidth={8} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeOpacity={tier>0?0.35:0.08} strokeWidth={1.2} strokeLinecap="round" />
      {active && tier > 0 && (
        <path d={d} fill="none" stroke={color} strokeWidth={tier>=3?2:1.5}
          className={tier>=2 ? 'trace-flow-fast' : 'trace-flow'} />
      )}
    </>
  );
}

function StatBar({ x, y, w, label, value, max, color }) {
  const pct = clamp((value/max)*100, 0, 100);
  return (
    <g>
      <text x={x} y={y+8} fill={COLORS.textDim} fontSize="8" style={{ letterSpacing: '0.5px' }}>{label}</text>
      <rect x={x+40} y={y+2} width={w} height={7} rx={3} fill="rgba(255,255,255,0.05)" />
      <rect x={x+40} y={y+2} width={Math.max(3,(w*pct)/100)} height={7} rx={3} fill={color}
        style={{ transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={x+40+w+6} y={y+9} fill={COLORS.text} fontSize="7.5">{Math.round(value)}%</text>
    </g>
  );
}

function DetailPanel({ slot, partId, heat, cpuPct, gpuPct, isProcessing }) {
  const part = PARTS_BY_ID[partId];
  const tier = part ? (genMap[part.gen] ?? 1) : 0;
  const glow = TIER_GLOW[tier] || TIER_GLOW[0];
  const name   = part ? part.name : `EMPTY — ${slot}`;
  const effect = part ? part.desc : 'No module installed';
  const statusText  = heat >= 78 ? 'OVERHEAT' : heat >= 45 ? 'ELEVATED' : 'NOMINAL';
  const statusColor = heat >= 78 ? COLORS.danger : heat >= 45 ? COLORS.warning : COLORS.secondary;
  return (
    <g transform="translate(302 30)">
      <rect x={0} y={0} width={175} height={210} rx={10}
        fill="rgba(8,12,18,0.88)"
        stroke={tier>0 ? glow.stroke : 'rgba(120,220,232,0.12)'}
        strokeWidth={tier>0 ? 0.8 : 0.5}
        className={tier>0 ? 'slot-glow' : ''}
        style={tier>0 ? { filter:`drop-shadow(${glow.glow})` } : {}} />
      <text x={14} y={22} fill={glow.text} fontSize="11" style={{ letterSpacing:'2px', fontWeight:600 }}>{slot}</text>
      {tier>0 && <rect x={14+slot.length*8+8} y={12} width={22} height={13} rx={4} fill={glow.stroke} fillOpacity={0.15} stroke={glow.stroke} strokeWidth="0.5" />}
      {tier>0 && <text x={14+slot.length*8+19} y={22} fill={glow.text} fontSize="8" textAnchor="middle" style={{ fontWeight:700 }}>T{tier}</text>}
      <line x1={14} y1={30} x2={161} y2={30} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <text x={14} y={48} fill={tier>0 ? COLORS.text : '#3a4a55'} fontSize="10">{name}</text>
      {/* Icon display box */}
      <rect x={14} y={56} width={147} height={60} rx={8}
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      {/* Processing ring behind icon */}
      {isProcessing && tier>0 && (
        <circle cx={87.5} cy={86} r={20} fill="none" stroke={glow.stroke} strokeWidth="0.5"
          strokeOpacity="0.3" className="core-ring" />
      )}
      <g transform="translate(87.5 86) scale(2.8)">
        <SlotIcon slot={slot} x={0} y={0} tier={tier} color={glow.stroke} isProcessing={isProcessing} />
      </g>
      <text x={14} y={134} fill={tier>0 ? COLORS.secondary : '#2a3545'} fontSize="8">
        {tier>0 ? `► ${effect}` : effect}
      </text>
      <line x1={14} y1={144} x2={161} y2={144} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <StatBar x={14} y={152} w={80} label="TEMP" value={heat}    max={100} color={statusColor} />
      <StatBar x={14} y={168} w={80} label="CPU"  value={cpuPct}  max={100} color={COLORS.primary} />
      <StatBar x={14} y={184} w={80} label="GPU"  value={gpuPct}  max={100} color={COLORS.proxy} />
      <text x={14} y={208} fill={statusColor} fontSize="8"
        className={heat>=78 ? 'blink-warn' : ''} style={{ letterSpacing:'1.5px' }}>{statusText}</text>
      <text x={161} y={208} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="end">
        {isProcessing ? '● ACTIVE' : '○ IDLE'}
      </text>
    </g>
  );
}

function CollapsedView({ tiers, heat, isProcessing }) {
  const statusColor = heat >= 78 ? COLORS.danger : heat >= 45 ? COLORS.warning : COLORS.secondary;
  const installedCount = Object.values(tiers).filter(t => t > 0).length;
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:'22px 10px 6px', gap:6 }}>
      <div style={{ display:'flex', gap:3, flex:1 }}>
        {Object.entries(tiers).map(([slot, tier]) => {
          const g = TIER_GLOW[tier] || TIER_GLOW[0];
          return (
            <div key={slot} style={{
              width:20, height:20, borderRadius:4,
              border:`1px solid ${tier>0 ? g.stroke : 'rgba(255,255,255,0.08)'}`,
              background:g.fill, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'6px', color:g.text, boxShadow: tier>0 ? g.glow : 'none',
              animation: tier>0 && isProcessing ? 'slotBreath 2s ease-in-out infinite' : 'none',
            }}>
              {slot.slice(0,2)}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:'8px', color:statusColor, letterSpacing:'1px' }}>{installedCount}/8</div>
      <div style={{
        width:4, height:4, borderRadius:'50%',
        background: isProcessing ? COLORS.secondary : 'rgba(255,255,255,0.15)',
        boxShadow: isProcessing ? `0 0 6px ${COLORS.secondary}` : 'none',
        animation: isProcessing ? 'pulseBar 1s ease-in-out infinite' : 'none',
      }} />
    </div>
  );
}

export default function RigDisplay({
  rig = {},
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
  const hasRGB = inventory.includes('RGB');

  useEffect(() => {
    if (!hasRGB) return;
    const id = setInterval(() => setRgbPhase(p => p + 3), 50);
    return () => clearInterval(id);
  }, [hasRGB]);

  const tiers = useMemo(() => {
    const obj = {};
    const slots = ['CPU','GPU','RAM','SSD','PSU','COOL','NET','CASE'];
    slots.forEach(s => {
      const partId = rig[s.toLowerCase()];
      const part = PARTS_BY_ID && partId ? PARTS_BY_ID[partId] : null;
      obj[s] = part ? (genMap[part.gen] ?? 1) : 0;
    });
    return obj;
  }, [rig]);

  const cpuPct = tiers.CPU > 0 ? clamp(Math.round(safeHeat*0.72 + (isProcessing?10:0)), 8, 100) : 0;
  const gpuPct = tiers.GPU > 0 ? clamp(Math.round(safeHeat*0.9  + (isProcessing?12:0)), 10, 100) : 0;
  const statusColor = isHot ? COLORS.danger : safeHeat >= 45 ? COLORS.warning : COLORS.secondary;

  const width  = expanded ? 480 : 220;
  const height = expanded ? 260 : 56;

  return (
    <div style={{
      width, height, flexShrink:0,
      border:`1px solid ${isHot ? `${COLORS.danger}55` : COLORS.border}`,
      position:'relative', background:COLORS.bgDark, overflow:'hidden', borderRadius:'4px',
      transition:'width 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1)',
      cursor: expanded ? 'default' : 'pointer',
      boxShadow: isHot ? `0 0 16px ${COLORS.danger}18` : 'inset 0 0 20px rgba(0,0,0,0.4)',
      zIndex: 100,
    }}
      onClick={!expanded ? toggleExpand : undefined}
    >
      <style>{ANIM_CSS}</style>

      {/* Scanline sweep */}
      {isProcessing && (
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'2px', pointerEvents:'none', zIndex:5,
          background:`linear-gradient(transparent, ${COLORS.primary}40, transparent)`,
          animation:'scanline 2s linear infinite',
        }} />
      )}

      {/* Grid */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`linear-gradient(rgba(120,220,232,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(120,220,232,0.03) 1px, transparent 1px)`,
        backgroundSize:'18px 18px',
      }} />

      {/* Header bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:18,
        background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 8px', zIndex:4,
        borderBottom:`1px solid ${COLORS.border}`,
      }}>
        <div style={{ display:'flex', gap:8, fontSize:'7.5px', letterSpacing:'1px' }}>
          <span style={{ color:COLORS.textDim }}>RIG STATUS</span>
          <span style={{ color:statusColor }}>{safeHeat}°C</span>
          {expanded && <span style={{ color:COLORS.proxy }}>POWER: {rig.power||0}W</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); toggleExpand(); }}
          style={{ background:'none', border:'none', color:COLORS.textDim, fontSize:'10px', cursor:'pointer' }}>
          {expanded ? '✕' : '⇲'}
        </button>
      </div>

      {expanded ? (
        <svg width="480" height="260" viewBox="0 0 480 260">
          <g transform="translate(8 22)">
            {/* Motherboard base */}
            <rect x={4} y={20} width={286} height={210} rx={12}
              fill="rgba(15,20,30,0.5)"
              stroke={hasRGB ? `hsla(${rgbPhase%360}, 60%, 50%, 0.3)` : 'rgba(120,220,232,0.1)'}
              strokeWidth="1" />

            {/* Traces */}
            {TRACES.map((t,i) => (
              <EnergyTrace key={i} pts={t.pts} active={isProcessing}
                tier={Math.max(tiers[t.from]||0, tiers[t.to]||0)}
                rgbPhase={rgbPhase} isCase={t.to==='CASE' && tiers.CASE>=2} />
            ))}

            {/* Slots */}
            {Object.entries(SLOT_LAYOUT).map(([slot, pos]) => (
              <Slot key={slot} slot={slot} pos={pos}
                tier={tiers[slot]} selected={selected===slot}
                isProcessing={isProcessing} rgbPhase={rgbPhase}
                onClick={() => setSelected(slot)} />
            ))}
          </g>

          {/* Detail panel */}
          <DetailPanel slot={selected} partId={rig[selected.toLowerCase()]}
            heat={safeHeat} cpuPct={cpuPct} gpuPct={gpuPct} isProcessing={isProcessing} />
        </svg>
      ) : (
        <CollapsedView tiers={tiers} heat={safeHeat} isProcessing={isProcessing} />
      )}
    </div>
  );
}
