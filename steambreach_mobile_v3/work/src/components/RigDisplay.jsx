import React, { useMemo, useState, useEffect } from 'react';
import { COLORS } from '../constants/gameConstants';
import { PARTS_BY_ID } from '../constants/rigParts';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const genMap = { 'GEN2': 1, 'GEN3': 2, 'GEN4': 3, 'GEN5': 3, 'XGEN': 3 };

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
  0: { fill: '#141a22', stroke: 'rgba(120,220,232,0.12)', glow: 'none', text: '#3a4a55' },
  1: { fill: '#162432', stroke: 'rgba(120,220,232,0.6)', glow: '0 0 8px rgba(120,220,232,0.3)', text: COLORS.primary },
  2: { fill: '#1d2e1a', stroke: 'rgba(169,220,118,0.7)', glow: '0 0 12px rgba(169,220,118,0.4)', text: COLORS.secondary },
  3: { fill: '#332914', stroke: 'rgba(255,216,102,0.8)', glow: '0 0 18px rgba(255,216,102,0.5)', text: COLORS.warning },
};

const ANIM_CSS = `
  @keyframes traceFlow      { to { stroke-dashoffset: -20; } }
  @keyframes traceFlowFast  { to { stroke-dashoffset: -12; } }
  @keyframes blinkWarn      { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes pulseBar       { 0%,100%{opacity:0.8} 50%{opacity:0.2} }
  @keyframes cpuCorePulse   { 0%,100%{opacity:0.15;r:3} 50%{opacity:0.55;r:4.5} }
  @keyframes cpuPinFlash    { 0%,100%{opacity:0.7} 50%{opacity:0.2} }
  @keyframes ramDataFlow    { 0%{opacity:0.1} 40%{opacity:0.8} 100%{opacity:0.1} }
  @keyframes ssdFlash       { 0%,100%{fill-opacity:0.15} 50%{fill-opacity:0.7} }
  @keyframes psuZap         { 0%,100%{opacity:0.25} 30%{opacity:0.9} 60%{opacity:0.4} 80%{opacity:1} }
  @keyframes slotBreath     { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.2)} }
  @keyframes scanline       { 0%{transform:translateY(-100%)} 100%{transform:translateY(320px)} }
  @keyframes coreRing       { 0%{r:2;opacity:0.7} 100%{r:14;opacity:0} }
  @keyframes ledBlink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }

  .trace-flow      { animation: traceFlow 1.4s linear infinite; stroke-dasharray: 3 8; }
  .trace-flow-fast { animation: traceFlowFast 0.6s linear infinite; stroke-dasharray: 2 5; }
  .blink-warn      { animation: blinkWarn 0.8s linear infinite; }
  .pulse-bar       { animation: pulseBar 1s ease-in-out infinite; }
  .cpu-core        { animation: cpuCorePulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .cpu-pin         { animation: cpuPinFlash 2s ease-in-out infinite; }
  .ram-data        { animation: ramDataFlow 0.8s ease-in-out infinite; }
  .ssd-flash       { animation: ssdFlash 0.6s ease-in-out infinite; }
  .psu-zap         { animation: psuZap 1.8s ease-in-out infinite; }
  .slot-breath     { animation: slotBreath 2.5s ease-in-out infinite; }
  .core-ring       { animation: coreRing 2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  .led-blink       { animation: ledBlink 1s step-end infinite; }
`;

function Rotator({ cx, cy, active, reverse, slow, children }) {
  if (!active && !slow) return <g>{children}</g>;
  const dur = (slow && !active) ? "2.5s" : reverse ? "0.9s" : "1.2s";
  const from = reverse ? `360 ${cx} ${cy}` : `0 ${cx} ${cy}`;
  const to = reverse ? `0 ${cx} ${cy}` : `360 ${cx} ${cy}`;
  return (
    <g>
      <animateTransform attributeName="transform" type="rotate" from={from} to={to} dur={dur} repeatCount="indefinite" />
      {children}
    </g>
  );
}

function DataPacket({ pathData, color, duration = 1.2, delay = 0, reverse = false }) {
  return (
    <g opacity="0">
      <circle r={2} fill={color} />
      <circle r={4} fill={color} fillOpacity={0.4} />
      
      <animateMotion 
        path={pathData}
        dur={`${duration}s`} 
        begin={`${delay}s`} 
        repeatCount="1"          
        fill="freeze"            
        calcMode="linear"
        keyPoints={reverse ? "1;0" : "0;1"}
        keyTimes="0;1"
      />
      <animate 
        attributeName="opacity" 
        values="0;1;1;0" 
        keyTimes="0; 0.1; 0.9; 1" 
        dur={`${duration}s`} 
        begin={`${delay}s`} 
        fill="freeze"
      />
    </g>
  );
}

function SlotIcon({ slot, x, y, tier, color, isProcessing }) {
  const c = tier > 0 ? color : '#3a4a55';
  const dim = tier > 0 ? 1.0 : 0.4;
  const cx = x, cy = y;
  const active = tier > 0 && isProcessing;

  switch (slot) {
    case 'CPU': return (
      <g opacity={dim}>
        <rect x={cx-9} y={cy-9} width={18} height={18} rx={2} fill="none" stroke={c} strokeWidth="1.2" />
        {[-6,-2,2,6].map((d,i) => <line key={`t${d}`} x1={cx+d} y1={cy-9} x2={cx+d} y2={cy-13} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15}s`}:{}} />)}
        {[-6,-2,2,6].map((d,i) => <line key={`b${d}`} x1={cx+d} y1={cy+9} x2={cx+d} y2={cy+13} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15+0.6}s`}:{}} />)}
        {[-6,-2,2,6].map((d,i) => <line key={`l${d}`} x1={cx-9} y1={cy+d} x2={cx-13} y2={cy+d} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15+0.3}s`}:{}} />)}
        {[-6,-2,2,6].map((d,i) => <line key={`r${d}`} x1={cx+9} y1={cy+d} x2={cx+13} y2={cy+d} stroke={c} strokeWidth="0.8" className={active ? 'cpu-pin' : ''} style={active?{animationDelay:`${i*0.15+0.9}s`}:{}} />)}
        <rect x={cx-5} y={cy-5} width={10} height={10} rx={1} fill={c} fillOpacity={0.1} stroke={c} strokeWidth="0.5" />
        <line x1={cx-5} y1={cy} x2={cx+5} y2={cy} stroke={c} strokeWidth="0.4" strokeOpacity="0.5" />
        <line x1={cx} y1={cy-5} x2={cx} y2={cy+5} stroke={c} strokeWidth="0.4" strokeOpacity="0.5" />
        {tier > 0 && <circle cx={cx} cy={cy} r={2.5} fill={c} fillOpacity={0.3} className={active ? 'cpu-core' : ''} />}
        {active && <circle cx={cx} cy={cy} r={3} fill="none" stroke={c} strokeWidth="0.6" className="core-ring" />}
      </g>
    );
    case 'GPU': {
      const clipId = `gpu-clip-${cx}-${cy}`;
      return (
        <g opacity={dim}>
          <clipPath id={clipId}><rect x={cx-13} y={cy-8} width={26} height={16} rx={2} /></clipPath>
          <rect x={cx-13} y={cy-8} width={26} height={16} rx={2} fill="none" stroke={c} strokeWidth="1" />
          <g clipPath={`url(#${clipId})`}>
            <Rotator cx={cx-4} cy={cy} active={active} slow={tier > 0}>
              <circle cx={cx-4} cy={cy} r={4.5} fill="none" stroke={c} strokeWidth="0.6" strokeOpacity="0.4" />
              {[0,60,120,180,240,300].map(a => <line key={a} x1={cx-4} y1={cy} x2={cx-4+Math.cos(a*Math.PI/180)*4} y2={cy+Math.sin(a*Math.PI/180)*4} stroke={c} strokeWidth="0.8" strokeOpacity="0.7" />)}
              <circle cx={cx-4} cy={cy} r={1.2} fill={c} fillOpacity="0.6" />
            </Rotator>
            <Rotator cx={cx+5} cy={cy} active={active} reverse slow={tier > 0}>
              <circle cx={cx+5} cy={cy} r={4.5} fill="none" stroke={c} strokeWidth="0.6" strokeOpacity="0.4" />
              {[30,90,150,210,270,330].map(a => <line key={a} x1={cx+5} y1={cy} x2={cx+5+Math.cos(a*Math.PI/180)*4} y2={cy+Math.sin(a*Math.PI/180)*4} stroke={c} strokeWidth="0.8" strokeOpacity="0.7" />)}
              <circle cx={cx+5} cy={cy} r={1.2} fill={c} fillOpacity="0.6" />
            </Rotator>
          </g>
          {tier >= 2 && <rect x={cx-12} y={cy+5} width={24} height={2} rx={1} fill={c} fillOpacity={active ? 0.5 : 0.2} className={active ? 'ssd-flash' : ''} />}
        </g>
      );
    }
    case 'RAM': return (
      <g opacity={dim}>
        <rect x={cx-11} y={cy-6} width={22} height={12} rx={1} fill="none" stroke={c} strokeWidth="0.9" />
        {[-7,-3,1,5].map((d,i) => <rect key={d} x={cx+d} y={cy-4} width={2.5} height={8} rx={0.5} fill={c} fillOpacity={active ? 0.6 : 0.2} className={active ? 'ram-data' : ''} style={active ? {animationDelay:`${i*0.15}s`} : {}} />)}
        <rect x={cx-4} y={cy+6} width={8} height={3} rx={0} fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1={cx-11} y1={cy+5} x2={cx-11} y2={cy+9} stroke={c} strokeWidth="0.5" />
        <line x1={cx+11} y1={cy+5} x2={cx+11} y2={cy+9} stroke={c} strokeWidth="0.5" />
        {tier > 0 && <circle cx={cx-9} cy={cy-4} r={1} fill={c} fillOpacity={0.8} className={active ? 'led-blink' : ''} />}
      </g>
    );
    case 'SSD': return (
      <g opacity={dim}>
        <rect x={cx-11} y={cy-5} width={22} height={10} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <rect x={cx-8} y={cy-3} width={6} height={6} rx={1} fill={c} fillOpacity={0.2} stroke={c} strokeWidth="0.4" />
        <rect x={cx-1} y={cy-3} width={4} height={6} rx={1} fill={c} fillOpacity={active ? 0.5 : 0.15} className={active ? 'ssd-flash' : ''} />
        <rect x={cx+4} y={cy-3} width={4} height={6} rx={1} fill={c} fillOpacity={active ? 0.5 : 0.15} className={active ? 'ssd-flash' : ''} style={active ? {animationDelay:'0.3s'} : {}} />
        <circle cx={cx+9} cy={cy} r={1.5} fill="none" stroke={c} strokeWidth="0.6" />
        {tier > 0 && <circle cx={cx+9} cy={cy} r={0.8} fill={c} fillOpacity={0.8} className={active ? 'led-blink' : ''} style={active?{animationDelay:'0.1s'}:{}} />}
        {tier >= 2 && <rect x={cx-10} y={cy+4} width={20} height={1} rx={0.5} fill={c} fillOpacity={active ? 0.7 : 0.2} className={active ? 'ssd-flash' : ''} style={active?{animationDelay:'0.2s'}:{}} />}
      </g>
    );
    case 'PSU': return (
      <g opacity={dim}>
        <rect x={cx-9} y={cy-8} width={18} height={16} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <path d={`M${cx-1} ${cy-7} L${cx+2} ${cy-1} L${cx-0} ${cy-1} L${cx+3} ${cy+7} L${cx+0} ${cy+1} L${cx+2} ${cy+1} Z`} fill={c} fillOpacity={active ? 0.8 : 0.3} className={active ? 'psu-zap' : ''} />
        <circle cx={cx+6} cy={cy+4} r={2.5} fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.5" />
        {tier > 0 && (
          <Rotator cx={cx+6} cy={cy+4} active={false} slow={true}>
            {[0,90,180,270].map(a => <line key={a} x1={cx+6} y1={cy+4} x2={cx+6+Math.cos(a*Math.PI/180)*2} y2={cy+4+Math.sin(a*Math.PI/180)*2} stroke={c} strokeWidth="0.6" strokeOpacity="0.6" />)}
          </Rotator>
        )}
        {tier > 0 && <circle cx={cx-7} cy={cy-6} r={1} fill={c} fillOpacity={0.9} className={active ? 'led-blink' : ''} style={active?{animationDelay:'0.5s'}:{}} />}
      </g>
    );
    case 'COOL': {
      const clipId = `cool-clip-${cx}-${cy}`;
      return (
        <g opacity={dim}>
          <clipPath id={clipId}><circle cx={cx} cy={cy} r={9} /></clipPath>
          <circle cx={cx} cy={cy} r={9} fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          <g clipPath={`url(#${clipId})`}>
            <Rotator cx={cx} cy={cy} active={active} slow={tier > 0}>
              {[0,45,90,135,180,225,270,315].map(a => {
                const rad = a * Math.PI/180;
                return <path key={a} d={`M${cx+Math.cos(rad-0.35)*2} ${cy+Math.sin(rad-0.35)*2} Q${cx+Math.cos(rad)*6} ${cy+Math.sin(rad)*6} ${cx+Math.cos(rad+0.35)*8.5} ${cy+Math.sin(rad+0.35)*8.5} L${cx+Math.cos(rad+0.35)*2} ${cy+Math.sin(rad+0.35)*2} Z`} fill={c} fillOpacity={0.35} stroke={c} strokeWidth="0.3" />
              })}
              <circle cx={cx} cy={cy} r={2} fill={c} fillOpacity={0.5} />
            </Rotator>
          </g>
          <circle cx={cx} cy={cy} r={1.5} fill={c} fillOpacity={0.8} />
          {tier >= 2 && <rect x={cx-9} y={cy+7} width={18} height={2} rx={1} fill={c} fillOpacity={0.2} className={active ? 'ssd-flash' : ''} style={active?{animationDelay:'0.4s'}:{}} />}
        </g>
      );
    }
    case 'NET': return (
      <g opacity={dim}>
        <line x1={cx} y1={cy+7} x2={cx} y2={cy-5} stroke={c} strokeWidth="1.2" />
        <circle cx={cx} cy={cy-5} r={1} fill={c} fillOpacity={0.8} />
        {active && <circle cx={cx} cy={cy-5} r={1.5} fill={c} fillOpacity={0.6} className="core-ring" />}
      </g>
    );
    case 'CASE': return (
      <g opacity={dim}>
        <rect x={cx-10} y={cy-8} width={20} height={16} rx={2} fill="none" stroke={c} strokeWidth="0.9" />
        <line x1={cx-10} y1={cy-3} x2={cx+10} y2={cy-3} stroke={c} strokeWidth="0.4" strokeOpacity="0.5" />
        <rect x={cx-7} y={cy-1} width={5} height={5} rx={1} fill={c} fillOpacity={0.15} />
        <rect x={cx+1} y={cy-1} width={5} height={5} rx={1} fill={c} fillOpacity={tier >= 2 ? 0.3 : 0.1} />
        {tier >= 2 && <rect x={cx-7} y={cy-7} width={14} height={4} rx={1} fill={c} fillOpacity={0.1} stroke={c} strokeWidth="0.4" />}
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
  const activeStroke = selected ? COLORS.warning : (isCase ? caseStroke : glow.stroke);

  const lift = selected ? 'translate(-10px, -10px)' : 'translate(0px, 0px)';
  const shadowOffset = selected ? '16px' : '4px';
  const shadowOpacity = selected ? 0.8 : 0.4;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <g style={{ transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={6} fill="black" 
          style={{ 
            transform: `translate(${shadowOffset}, ${shadowOffset})`,
            opacity: shadowOpacity,
            filter: 'blur(4px)',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }} 
        />
        
        <g style={{ transform: lift, transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
          <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={6} fill={glow.fill} 
            stroke={activeStroke} strokeWidth={selected ? 2 : (tier > 0 ? 1 : 0.5)} 
            className={tier > 0 && !selected ? 'slot-breath' : ''} 
          />
          
          <text x={pos.x+6} y={pos.y+11} fill={glow.text} fontSize="9" fontWeight={tier > 0 ? "700" : "500"} style={{ letterSpacing: '1px' }}>{slot}</text>
          
          {tier > 0 && (
            <g>
              <rect x={pos.x+pos.w-22} y={pos.y+4} width={18} height={10} rx={2} fill={glow.stroke} fillOpacity={0.2} stroke={glow.stroke} strokeWidth="0.5" />
              <text x={pos.x+pos.w-13} y={pos.y+12} fill={glow.text} fontSize="7" textAnchor="middle" fontWeight="bold">T{tier}</text>
            </g>
          )}
          
          <SlotIcon slot={slot} x={pos.x+pos.w/2} y={pos.y+pos.h/2+5} tier={tier} color={glow.stroke} isProcessing={isProcessing} />
          
          {isProcessing && tier > 0 && <rect x={pos.x+6} y={pos.y+pos.h-5} width={pos.w-12} height={1.5} rx={1} fill={glow.stroke} className="pulse-bar" />}
        </g>
      </g>
    </g>
  );
}

function EnergyTrace({ pts, active, tier, rgbPhase, isCase, isHacking }) {
  const d = pts.map((p,i) => `${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
  const color = isCase ? `hsl(${rgbPhase%360}, 70%, 55%)` : tier >= 3 ? COLORS.warning : tier >= 2 ? COLORS.secondary : tier >= 1 ? COLORS.primary : '#2a3545';
  
  const isReverse = pts[0][0] > pts[pts.length-1][0]; 
  const burstArray = [0, 1, 2, 3, 4]; 

  return (
    <>
      <path d={d} fill="none" stroke={color} strokeOpacity={tier>0?0.15:0.05} strokeWidth={6} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeOpacity={tier>0?0.5:0.1} strokeWidth={1.5} strokeLinecap="round" />
      
      {active && tier > 0 && <path d={d} fill="none" stroke={color} strokeWidth={tier>=3?2.5:1.5} className={tier>=2 ? 'trace-flow-fast' : 'trace-flow'} />}

      {isHacking && tier > 0 && burstArray.map((index) => (
        <DataPacket 
          key={`${isHacking}-${index}`}
          pathData={d} 
          color={color} 
          duration={1.2} 
          delay={index * 0.2}
          reverse={isReverse} 
        />
      ))}
    </>
  );
}

// ------------------------------------------
// MAIN COMPONENT EXPORT
// ------------------------------------------

export default function RigDisplay({ rig = {}, inventory = [], heat = 0, isProcessing = false, isHacking = false, expanded = false, toggleExpand, isMobile = false }) {
  if (isMobile) return null;

  const [selected, setSelected] = useState('CPU');
  const [rgbPhase, setRgbPhase] = useState(0);
  const [isHacking, setIsHacking] = useState(false);

  const safeHeat = clamp(heat, 0, 100);
  const isHot = safeHeat >= 78;
  const hasRGB = inventory.includes('RGB');

  // Trigger function for the hack event
  const triggerHack = () => {
    console.log("Hack Initiated!"); // Check your browser console to verify the button works!
    if (isHacking) return;
    setIsHacking(true);
    setTimeout(() => {
      setIsHacking(false);
    }, 2200); 
  };

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
  const selPartId = rig[selected.toLowerCase()];
  const selPart = PARTS_BY_ID && selPartId ? PARTS_BY_ID[selPartId] : null;
  const selTier = selPart ? (genMap[selPart.gen] ?? 1) : 0;
  const selGlow = TIER_GLOW[selTier] || TIER_GLOW[0];

  const width  = expanded ? 560 : 220;
  const height = expanded ? 320 : 56;

  return (
    <div style={{
      width, height, flexShrink:0,
      border:`1px solid ${isHot ? `${COLORS.danger}55` : COLORS.border}`,
      position:'relative', background: '#0a0d14', overflow:'hidden', borderRadius:'6px',
      transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      cursor: expanded ? 'default' : 'pointer',
      boxShadow: `inset 0 0 40px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)`,
      zIndex: 100,
    }} onClick={!expanded ? toggleExpand : undefined}>
      
      <style>{ANIM_CSS}</style>

      {/* Grid Background */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`linear-gradient(rgba(120,220,232,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(120,220,232,0.03) 1px, transparent 1px)`, backgroundSize:'20px 20px' }} />

      {/* Top Header */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:22, background:'rgba(5,8,12,0.8)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px', zIndex:10, borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ display:'flex', gap:12, fontSize:'8px', letterSpacing:'1.5px', fontWeight:'bold' }}>
          <span style={{ color:COLORS.textDim }}>DECK STATUS</span>
          <span style={{ color:statusColor }}>{safeHeat}°C</span>
          {expanded && <span style={{ color:COLORS.proxy }}>SYS.PWR: {rig.power||0}W</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); toggleExpand(); }} style={{ background:'none', border:'none', color:COLORS.textDim, fontSize:'10px', cursor:'pointer', zIndex: 200, position: 'relative' }}>
          {expanded ? '✕' : '⇲'}
        </button>
      </div>

      {expanded ? (
        <>
          {/* Centered Left value to 30 */}
          <div style={{ position: 'absolute', top: 30, left: 30, width: 340, height: 300, perspective: '1200px', pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="-20 -20 340 300" style={{ transform: 'rotateX(55deg) rotateZ(-45deg)', transformStyle: 'preserve-3d', overflow: 'visible', pointerEvents: 'auto' }}>
              <g>
                <path d="M0,220 L12,232 L302,232 L302,12 L290,0 Z" fill="#05080c" />
                <rect x={0} y={0} width={290} height={220} rx={8} fill="#0d131c" stroke={hasRGB ? `hsla(${rgbPhase%360}, 60%, 50%, 0.4)` : 'rgba(120,220,232,0.15)'} strokeWidth="1.5" />
              </g>

              {TRACES.map((t,i) => (
                <EnergyTrace key={i} pts={t.pts} active={isProcessing} tier={Math.max(tiers[t.from]||0, tiers[t.to]||0)} rgbPhase={rgbPhase} isCase={t.to==='CASE' && tiers.CASE>=2} isHacking={isHacking} />
              ))}

              {Object.entries(SLOT_LAYOUT).map(([slot, pos]) => (
                <Slot key={slot} slot={slot} pos={pos} tier={tiers[slot]} selected={selected===slot} isProcessing={isProcessing} rgbPhase={rgbPhase} onClick={() => setSelected(slot)} />
              ))}
            </svg>
          </div>

          <div style={{ position: 'absolute', right: 12, top: 34, width: 200, height: 270 }}>
            <svg width="100%" height="100%">
              <rect x={0} y={0} width={200} height={270} rx={8} fill="rgba(8,12,18,0.7)" stroke={selTier > 0 ? selGlow.stroke : 'rgba(120,220,232,0.15)'} strokeWidth="1" style={{ filter: 'backdrop-filter(blur(4px))' }} />
              
              <path d="M0,8 L0,0 L8,0 M192,0 L200,0 L200,8 M200,262 L200,270 L192,270 M8,270 L0,270 L0,262" fill="none" stroke={selTier > 0 ? selGlow.stroke : COLORS.textDim} strokeWidth="2" opacity="0.5" />

              <text x={16} y={26} fill={selGlow.text} fontSize="14" fontWeight="bold" letterSpacing="2px">{selected}</text>
              
              {selTier > 0 && (
                <g>
                  <rect x={16+selected.length*10+10} y={14} width={26} height={14} rx={3} fill={selGlow.stroke} fillOpacity={0.15} stroke={selGlow.stroke} strokeWidth="0.5" />
                  <text x={16+selected.length*10+23} y={24} fill={selGlow.text} fontSize="9" textAnchor="middle" fontWeight="bold">T{selTier}</text>
                </g>
              )}

              <line x1={16} y1={36} x2={184} y2={36} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={16} y={54} fill={selTier > 0 ? COLORS.text : '#3a4a55'} fontSize="11" fontWeight="bold">{selPart ? selPart.name : `EMPTY SLOT`}</text>
              
              <rect x={16} y={64} width={168} height={80} rx={6} fill="#05080c" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <g transform="translate(100 104) scale(3.5)">
                {isProcessing && selTier>0 && <circle cx={0} cy={0} r={12} fill="none" stroke={selGlow.stroke} strokeWidth="0.5" strokeOpacity="0.3" className="core-ring" />}
                <SlotIcon slot={selected} x={0} y={0} tier={selTier} color={selGlow.stroke} isProcessing={isProcessing} />
              </g>

              <text x={16} y={166} fill={selTier > 0 ? COLORS.secondary : '#2a3545'} fontSize="9" width="168">
                {selTier > 0 ? `► ${selPart.desc}` : 'No hardware detected.'}
              </text>
              
              <line x1={16} y1={180} x2={184} y2={180} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              
              <g transform="translate(16 194)">
                <text x={0} y={6} fill={COLORS.textDim} fontSize="8" letterSpacing="1px">TEMP</text>
                <rect x={40} y={0} width={90} height={6} rx={3} fill="#0d131c" />
                <rect x={40} y={0} width={Math.max(3,(90*safeHeat)/100)} height={6} rx={3} fill={statusColor} style={{ transition:'width 0.5s' }} />
                <text x={136} y={6} fill={COLORS.text} fontSize="8">{Math.round(safeHeat)}%</text>

                <text x={0} y={22} fill={COLORS.textDim} fontSize="8" letterSpacing="1px">CPU</text>
                <rect x={40} y={16} width={90} height={6} rx={3} fill="#0d131c" />
                <rect x={40} y={16} width={Math.max(3,(90*cpuPct)/100)} height={6} rx={3} fill={COLORS.primary} style={{ transition:'width 0.5s' }} />
                <text x={136} y={22} fill={COLORS.text} fontSize="8">{cpuPct}%</text>

                <text x={0} y={38} fill={COLORS.textDim} fontSize="8" letterSpacing="1px">GPU</text>
                <rect x={40} y={32} width={90} height={6} rx={3} fill="#0d131c" />
                <rect x={40} y={32} width={Math.max(3,(90*gpuPct)/100)} height={6} rx={3} fill={COLORS.proxy || COLORS.warning} style={{ transition:'width 0.5s' }} />
                <text x={136} y={38} fill={COLORS.text} fontSize="8">{gpuPct}%</text>
              </g>

              <text x={16} y={256} fill={statusColor} fontSize="9" fontWeight="bold" letterSpacing="2px" className={heat>=78 ? 'blink-warn' : ''}>
                {heat >= 78 ? 'CRITICAL' : heat >= 45 ? 'ELEVATED' : 'NOMINAL'}
              </text>
              <text x={184} y={256} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" letterSpacing="1px">
                {isProcessing ? '● ONLINE' : '○ IDLE'}
              </text>
            </svg>
          </div>

        
        </>
      ) : (
        <div style={{ padding: '28px 12px 6px', display:'flex', gap:6, alignItems:'center' }}>
          <div style={{ display:'flex', gap:4, flex:1 }}>
            {Object.entries(tiers).map(([s, t]) => {
              const g = TIER_GLOW[t] || TIER_GLOW[0];
              return (
                <div key={s} style={{ width:22, height:22, borderRadius:4, background:g.fill, border:`1px solid ${t>0 ? g.stroke : '#1a222c'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'7px', color:g.text, fontWeight:'bold' }}>
                  {s.slice(0,2)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
