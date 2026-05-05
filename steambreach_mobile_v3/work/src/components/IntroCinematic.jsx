// HEXOVERRIDE intro cinematic — drop-in React component.
// Self-contained: paste this file into src/components/IntroCinematic.jsx.
// Plays the 22-second 5-beat opening, then calls onComplete().
// Skippable with click / key / tap.
//
// Usage in HEXOVERRIDE.jsx:
//
//   import IntroCinematic from './components/IntroCinematic';
//
//   const [screen, setScreen] = useState(
//     localStorage.getItem('hexoverride_intro_seen') ? 'intro' : 'cinematic'
//   );
//
//   if (screen === 'cinematic') {
//     return (
//       <IntroCinematic
//         portrait={isMobile}
//         onComplete={() => {
//           localStorage.setItem('hexoverride_intro_seen', '1');
//           setScreen('intro');
//         }}
//       />
//     );
//   }

import React, { useEffect, useRef, useState } from 'react';
import { unlockHexAudio, updateHexAudio, muteHexAudio } from './introAudio';

const HX = {
  bg:'#05070a', border:'#1b2430', text:'#d4d8dc',
  dim:'#5a6572', dimmer:'#2f3843',
  pri:'#78dce8', priDim:'#4a8b96',
  sec:'#a9dc76', warn:'#ffd866', dan:'#ff6188',
};
const MONO = "'JetBrains Mono','Fira Code','Consolas',monospace";
const DURATION = 22;

const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const E = {
  outCubic: t => 1 - Math.pow(1-t,3),
  inOutCubic: t => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2,
  outBack: t => { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); },
  outQuad: t => 1-(1-t)*(1-t),
  linear: t => t,
};
const tween = (from, to, start, end, easeFn = E.inOutCubic) => t => {
  if (t<=start) return from;
  if (t>=end) return to;
  return from + (to-from) * easeFn((t-start)/(end-start));
};
const interp = (xs, ys, easeFn = E.inOutCubic) => t => {
  if (t<=xs[0]) return ys[0];
  if (t>=xs[xs.length-1]) return ys[ys.length-1];
  for (let i=0;i<xs.length-1;i++) {
    if (t>=xs[i] && t<=xs[i+1]) {
      const lt = (t-xs[i])/(xs[i+1]-xs[i]);
      return ys[i] + (ys[i+1]-ys[i]) * easeFn(lt);
    }
  }
  return ys[ys.length-1];
};

const ASCII_LOGO = [
  ' ██╗  ██╗███████╗██╗  ██╗',
  ' ██║  ██║██╔════╝╚██╗██╔╝',
  ' ███████║█████╗   ╚███╔╝ ',
  ' ██╔══██║██╔══╝   ██╔██╗ ',
  ' ██║  ██║███████╗██╔╝ ██╗',
  ' ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝',
];
const SCRAMBLE = '▓▒░█▄▀╗╔╝╚║═╠╣╦╩╬┌┐└┘├┤┬┴┼§¶@#%&*';

const BOOT_LINES = [
  { t:'[BOOT] hexoverride-os v3.1.4-operator',                start:0.2, c:HX.dim },
  { t:'[ OK ] initialising tor circuits......... 7 hops',     start:0.7, c:HX.sec },
  { t:'[ OK ] mounting /dev/ghost................ ok',        start:1.1, c:HX.sec },
  { t:'[ OK ] loading ~/ops/contracts............ active',    start:1.5, c:HX.sec },
  { t:'[WARN] last session: high-heat detected',              start:1.9, c:HX.warn },
  { t:'[ OK ] spoofing MAC: 5e:de:ad:be:ef:42.... ok',        start:2.3, c:HX.sec },
  { t:'[ OK ] handshake complete. welcome back, operator.',   start:2.7, c:HX.pri },
];

const BREACH_LINES = [
  { txt:'> targeting node 0xA4:CF:12:8B:3E:01',         start:8.4,  color:HX.dim },
  { txt:'> aireplay-ng --deauth 10 -a <BSSID>',         start:8.9,  color:HX.text },
  { txt:'[ OK ] wpa handshake captured',                start:9.6,  color:HX.sec },
  { txt:'> aircrack-ng -w rockyou.txt capture-01.cap',  start:10.3, color:HX.text },
  { txt:'[CRACKING] 4,827,193 keys/sec ........ 84%',   start:11.0, color:HX.warn },
  { txt:'[ ★★ ] password: ********  → root@target',     start:11.9, color:HX.pri },
];

// ── Main component ──────────────────────────────────────────────────────────

export default function IntroCinematic({ onComplete, portrait = true, audio = true }) {
  const [t, setT] = useState(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [audioOn, setAudioOn] = useState(false);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const tick = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      if (elapsed >= DURATION) {
        setT(DURATION);
        if (!completedRef.current) { completedRef.current = true; onComplete && onComplete(); }
        return;
      }
      setT(elapsed);
      if (audio && audioOn) updateHexAudio(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onComplete, audio, audioOn]);

  const skip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audio) muteHexAudio(true);
    onComplete && onComplete();
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    if (!audioOn) { unlockHexAudio(); muteHexAudio(false); setAudioOn(true); }
    else { muteHexAudio(true); setAudioOn(false); }
  };

  useEffect(() => {
    const onKey = () => skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const STAGE_W = portrait ? 1080 : 1920;
  const STAGE_H = portrait ? 1920 : 1080;
  const scale = Math.min(dims.w / STAGE_W, dims.h / STAGE_H);

  return (
    <div onClick={skip} style={{
      position:'fixed', inset:0, background:'#000', overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex: 99999, cursor:'pointer',
    }}>
      <div style={{
        width: STAGE_W, height: STAGE_H,
        transform: `scale(${scale})`, transformOrigin:'center',
        position:'relative', flexShrink:0, background: HX.bg,
      }}>
        <Background t={t}/>
        <NetworkGraph t={t} portrait={portrait} stageW={STAGE_W} stageH={STAGE_H}/>
        <BootLines t={t} portrait={portrait}/>
        <ChromeBar t={t} stageW={STAGE_W} portrait={portrait}/>
        <BottomChrome t={t}/>
        <BreachOverlay t={t} portrait={portrait}/>
        <GlitchFlash t={t}/>
        <ScrambledLogo t={t} portrait={portrait}/>
        <OverrideWordmark t={t} portrait={portrait}/>
        <Subtitle t={t} portrait={portrait}/>
        <PressAnyKey t={t}/>
        <CornerBrackets t={t}/>
      </div>
      {audio && (
        <button onClick={toggleAudio} style={{
          position:'absolute', top:18, right:18, zIndex:100000,
          background:'rgba(10,13,18,0.92)',
          border:`1px solid ${audioOn ? HX.pri : HX.border}`,
          color: audioOn ? HX.pri : HX.dim,
          fontFamily: MONO, fontSize:11, letterSpacing:1.5,
          padding:'8px 12px', cursor:'pointer',
          textShadow: audioOn ? `0 0 8px ${HX.pri}55` : 'none',
        }}>{audioOn ? '♪ AUDIO ON' : '♪ AUDIO OFF'}</button>
      )}
      <div style={{
        position:'absolute', bottom: 18, right: 18, zIndex: 100000,
        color: HX.dim, fontFamily: MONO, fontSize: 11, letterSpacing: 2,
        opacity: t > 1.5 && t < DURATION - 0.5 ? 0.7 : 0,
        transition: 'opacity 0.4s', pointerEvents:'none',
      }}>[ TAP TO SKIP ]</div>
    </div>
  );
}

// ── Scene components (each takes `t` prop) ──────────────────────────────────

function Background({ t }) {
  return (
    <>
      <div style={{position:'absolute',inset:0,background:HX.bg}}/>
      <div style={{
        position:'absolute',inset:0,pointerEvents:'none',
        background:`radial-gradient(ellipse at 50% 55%,rgba(120,220,232,0.08) 0%,transparent 55%),radial-gradient(ellipse at 50% 50%,transparent 50%,rgba(0,0,0,0.85) 100%)`,
        opacity: tween(0,1,1.5,4)(t),
      }}/>
      <div style={{
        position:'absolute',inset:0,pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(0deg,rgba(120,220,232,0.04) 0px,rgba(120,220,232,0.04) 1px,transparent 1px,transparent 4px)',
        mixBlendMode:'overlay', opacity: tween(0,1,2,5,E.outCubic)(t),
      }}/>
    </>
  );
}

function ChromeBar({ t, stageW, portrait }) {
  if (t < 5.5) return null;
  const op = tween(0,1,5.5,6.4,E.outCubic)(t);
  const trace = Math.floor(tween(0,74,8.5,12.5,E.outQuad)(t));
  const traceColor = trace > 60 ? HX.dan : trace > 30 ? HX.warn : HX.sec;
  return (
    <div style={{
      position:'absolute',top:0,left:0,right:0,height:portrait?48:44,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 24px', fontSize: portrait?18:16, letterSpacing:1.5, color:HX.dim,
      borderBottom:`1px solid ${HX.border}`, background:'rgba(5,7,10,0.92)',
      fontFamily: MONO, opacity: op, zIndex:10,
    }}>
      <span>tty0 · operator@hexoverride</span>
      <span style={{display:'flex',gap:18}}>
        <span style={{color:HX.sec}}>● TOR 7/7</span>
        <span style={{color:traceColor}}>⚠ TRACE {trace}%</span>
      </span>
    </div>
  );
}

function BottomChrome({ t }) {
  if (t < 5.8) return null;
  const op = tween(0,1,5.8,6.6,E.outCubic)(t);
  return (
    <div style={{
      position:'absolute',bottom:0,left:0,right:0,height:44,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 24px', fontSize:14, letterSpacing:1.5, color:HX.dim,
      borderTop:`1px solid ${HX.border}`, background:'rgba(5,7,10,0.92)',
      fontFamily: MONO, opacity: op, zIndex:10,
    }}>
      <span>IP 185.220.101.42 → exit-node-de07</span>
      <span style={{color:HX.priDim}}>{((t*1.7)%999).toFixed(0)} pkt/s</span>
    </div>
  );
}

function CornerBrackets({ t }) {
  if (t < 18) return null;
  const op = tween(0,0.7,18,18.6,E.outBack)(t);
  const sz = tween(60,48,18,18.6,E.outBack)(t);
  const positions = [
    {top:60,    left:24,  borderWidth:'2px 0 0 2px'},
    {top:60,    right:24, borderWidth:'2px 2px 0 0'},
    {bottom:60, left:24,  borderWidth:'0 0 2px 2px'},
    {bottom:60, right:24, borderWidth:'0 2px 2px 0'},
  ];
  return positions.map((s,i)=>(
    <div key={i} style={{
      position:'absolute',...s,width:sz,height:sz,
      borderColor:HX.pri,borderStyle:'solid',opacity:op,zIndex:8,
    }}/>
  ));
}

function TypedLine({ text, startTime, color, t, charsPerSec=80, fontSize=26 }) {
  if (t < startTime) return null;
  const elapsed = t - startTime;
  const len = Math.min(text.length, Math.floor(elapsed * charsPerSec));
  const showCursor = len < text.length;
  return (
    <div style={{
      color, fontFamily: MONO, fontSize, letterSpacing:0.5, lineHeight:1.7,
      whiteSpace:'pre',
    }}>
      {text.slice(0,len)}
      {showCursor && <span style={{
        display:'inline-block', width:'0.6em', background:color,
        opacity:(Math.sin(t*12)*0.5+0.5)>0.5?0.85:0,
        marginLeft:1, height:'1em', verticalAlign:'-0.15em',
      }}/>}
    </div>
  );
}

function BootLines({ t, portrait }) {
  // Camera: starts centered. After beat 1, scales down + slides up (portrait)
  // or up-left (landscape) to make room for the network graph.
  const scale = interp([0,3,5],[1,1, portrait?0.55:0.7])(t);
  const tx = interp([0,3,5],[0,0, portrait?0:-560])(t);
  const ty = interp([0,3,5],[0,0, portrait?-560:-220])(t);
  const opacity = interp([0,5,7,13,14],[1,1,0.55,0.55,0])(t);
  const fontSize = portrait ? 26 : 22;
  return (
    <div style={{
      position:'absolute', left:'50%', top:'50%',
      transform:`translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`,
      transformOrigin:'center', width: portrait?920:880, opacity, zIndex:4,
    }}>
      {BOOT_LINES.map((l,i)=>(
        <TypedLine key={i} text={l.t} startTime={l.start} color={l.c} t={t} fontSize={fontSize}/>
      ))}
    </div>
  );
}

function NetworkGraph({ t, portrait, stageW, stageH }) {
  const opacity = interp([3,5,8,13,14],[0,0.55,0.85,0.85,0])(t);
  if (opacity <= 0.001) return null;
  const seed = (n) => { let x = Math.sin(n)*10000; return x-Math.floor(x); };

  // Portrait: graph fills lower-center area. Landscape: right 60%.
  const W = portrait ? stageW : 1200;
  const H = portrait ? 1300 : stageH;
  const left = portrait ? 0 : null;
  const top = portrait ? 380 : 0;
  const right = portrait ? null : 0;

  const NODE_COUNT = portrait ? 42 : 48;
  const focusIdx = portrait ? 17 : 19;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: 60 + seed(i*7.3) * (W-120),
      y: 80 + seed(i*13.7+0.1) * (H-160),
      r: 3 + seed(i*19.1)*4,
      tier: seed(i*29.7) > 0.85 ? 2 : seed(i*29.7) > 0.55 ? 1 : 0,
      bornAt: 3.2 + seed(i*41.7)*1.8,
      key: i,
    });
  }
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    const sorted = nodes
      .map((_, j) => ({ j, d: j===i ? Infinity : Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y) }))
      .sort((a,b)=>a.d-b.d).slice(0,2);
    sorted.forEach(({j}) => { if (i < j) edges.push([i, j]); });
  }
  const focusNode = nodes[focusIdx];
  const breachIntensity = interp([8,9,11,12.5,13],[0,0.6,1,1,0])(t);

  const pos = portrait
    ? { left:0, top: 380 }
    : { right:0, top: 0 };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{position:'absolute', ...pos, opacity, zIndex:2}}>
      <defs>
        <radialGradient id="ngc-cyan">
          <stop offset="0%" stopColor={HX.pri} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={HX.pri} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="ngc-dan">
          <stop offset="0%" stopColor={HX.dan} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={HX.dan} stopOpacity="0"/>
        </radialGradient>
      </defs>
      {edges.map(([a,b],i)=>{
        const na=nodes[a], nb=nodes[b];
        const aBorn = Math.max(na.bornAt, nb.bornAt);
        if (t < aBorn) return null;
        const eOp = clamp((t-aBorn)/0.6, 0, 1);
        const phase = ((t*0.35 + i*0.13)%1);
        const isFocusEdge = a===focusIdx || b===focusIdx;
        const dim = breachIntensity>0.2 && !isFocusEdge ? 1-breachIntensity*0.7 : 1;
        return (
          <g key={i} opacity={eOp*dim}>
            <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={isFocusEdge && breachIntensity>0.2 ? HX.dan : HX.dimmer}
              strokeWidth={isFocusEdge && breachIntensity>0.2 ? 1.4 : 0.8}/>
            {i%4===0 && (
              <circle cx={na.x+(nb.x-na.x)*phase} cy={na.y+(nb.y-na.y)*phase}
                r="2.4" fill={isFocusEdge && breachIntensity>0.2 ? HX.dan : HX.pri} opacity="0.9"/>
            )}
          </g>
        );
      })}
      {breachIntensity > 0.15 && (() => {
        const pulses = [];
        for (let i=0; i<3; i++) {
          const pT = ((t-8.8 + i*0.7)%2.2)/2.2;
          if (pT<0||pT>1) continue;
          pulses.push(
            <circle key={'p'+i} cx={focusNode.x} cy={focusNode.y}
              r={20 + pT*280} fill="none" stroke={HX.dan}
              strokeWidth={2.5 - pT*2} opacity={(1-pT)*breachIntensity}/>
          );
        }
        return pulses;
      })()}
      {nodes.map(n=>{
        if (t < n.bornAt) return null;
        const nOp = clamp((t-n.bornAt)/0.6, 0, 1);
        const tw = 0.5 + 0.5*Math.sin(t*2.4 + n.key);
        const isFocus = n.key === focusIdx;
        let col = n.tier===2 ? HX.warn : n.tier===1 ? HX.sec : HX.pri;
        if (isFocus && breachIntensity > 0.2) col = HX.dan;
        const dim = breachIntensity>0.2 && !isFocus ? 1-breachIntensity*0.6 : 1;
        const fs = isFocus ? (1+breachIntensity*0.6) : 1;
        return (
          <g key={n.key} opacity={nOp*dim}>
            {(n.tier>0 || isFocus) && (
              <circle cx={n.x} cy={n.y} r={n.r*4*fs}
                fill={isFocus && breachIntensity>0.2 ? "url(#ngc-dan)" : "url(#ngc-cyan)"}
                opacity={0.4*tw + 0.2}/>
            )}
            <circle cx={n.x} cy={n.y} r={n.r*fs} fill="none" stroke={col} strokeWidth="1.5" opacity="0.9"/>
            <circle cx={n.x} cy={n.y} r={n.r*0.4*fs} fill={col} opacity={0.6+0.4*tw}/>
            {isFocus && breachIntensity > 0.5 && (
              <circle cx={n.x} cy={n.y} r={n.r*2.2}
                fill="none" stroke={HX.dan} strokeWidth="1" strokeDasharray="3 3"
                opacity={breachIntensity*0.8}
                style={{transformOrigin:`${n.x}px ${n.y}px`,transform:`rotate(${(t*60)%360}deg)`}}/>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function BreachOverlay({ t, portrait }) {
  if (t < 8.2 || t > 13.5) return null;
  const op = interp([8.2,9,12.8,13.5],[0,1,1,0])(t);
  const left = portrait ? 80 : 80;
  const bottom = portrait ? 160 : 120;
  const width = portrait ? 920 : 720;
  return (
    <div style={{position:'absolute',left,bottom,width,opacity:op,zIndex:6,fontFamily:MONO}}>
      {BREACH_LINES.map((l,i)=>(
        <TypedLine key={i} text={l.txt} startTime={l.start} color={l.color} t={t}
          charsPerSec={70} fontSize={portrait?22:20}/>
      ))}
    </div>
  );
}

function GlitchFlash({ t }) {
  const flashTimes = [9.6, 11.9, 12.4];
  let s = 0;
  for (const ft of flashTimes) {
    if (t >= ft && t < ft + 0.18) s = Math.max(s, 1 - (t-ft)/0.18);
  }
  if (s <= 0.001) return null;
  return (
    <div style={{
      position:'absolute',inset:0,pointerEvents:'none',
      background:`radial-gradient(ellipse at 50% 50%,rgba(255,97,136,${0.18*s}) 0%,transparent 60%)`,
      mixBlendMode:'screen',zIndex:9,
    }}/>
  );
}

function ScrambledLogo({ t, portrait }) {
  if (t < 13) return null;
  const COL = ASCII_LOGO[0].length;
  const RS = 13.4, RPC = 0.07, RD = 0.3;
  const opacity = interp([13,13.4,18.5],[0,1,1],E.outCubic)(t);
  const allDone = RS + COL*RPC + RD;
  const aberration = interp([13,13.4,allDone,allDone+0.6],[0,8,4,0])(t);
  const fontSize = portrait ? 56 : 60;

  const renderLayer = (color, dx, dy, key) => {
    const rows = ASCII_LOGO.map((row, rIdx) => {
      let out = '';
      for (let c=0; c<row.length; c++) {
        const at = RS + c*RPC;
        if (t < at) {
          const sd = Math.floor(t*18 + c*3.7 + rIdx*1.3);
          out += SCRAMBLE[sd % SCRAMBLE.length];
        } else if (t < at + RD) {
          const lt = (t - at)/RD;
          if (Math.random() < lt) out += row[c];
          else { const sd = Math.floor(t*24 + c*3.7 + rIdx*1.3); out += SCRAMBLE[sd % SCRAMBLE.length]; }
        } else out += row[c];
      }
      return out;
    });
    return (
      <div key={key} style={{
        position:'absolute',left:dx,top:dy,
        color, fontFamily:MONO, fontSize, lineHeight:1.05, fontWeight:700,
        whiteSpace:'pre', textShadow:`0 0 12px ${color}66`,
        mixBlendMode: dx===0&&dy===0 ? 'normal' : 'screen',
      }}>{rows.join('\n')}</div>
    );
  };

  const pos = portrait
    ? { left:'50%', top: 720, transform:'translateX(-50%)' }
    : { left:'50%', top:'50%', transform:'translate(-50%, calc(-50% - 60px))' };

  return (
    <div style={{position:'absolute', ...pos, opacity, zIndex:7}}>
      <div style={{position:'relative', width: portrait?720:780, height: portrait?360:380}}>
        {aberration > 0.5 && renderLayer(HX.dan, -aberration, 0, 'r')}
        {aberration > 0.5 && renderLayer(HX.sec, aberration, 0, 'g')}
        {renderLayer(HX.pri, 0, 0, 'main')}
      </div>
    </div>
  );
}

function OverrideWordmark({ t, portrait }) {
  if (t < 15.4) return null;
  const op = tween(0,1,15.4,16,E.outCubic)(t);
  const tx = tween(60,0,15.4,16,E.outCubic)(t);
  const verText = 'v3.1.4';
  const verLen = Math.min(verText.length, Math.floor(Math.max(0, t-16.2) * 18));

  const containerStyle = portrait
    ? { left:80, top: 1130, width: 920, transform:`translateX(${tx}px)` }
    : { left:'50%', top:'50%', width: 1100,
        transform:`translate(calc(-50% + ${tx}px), calc(-50% + 200px))` };

  return (
    <div style={{
      position:'absolute', ...containerStyle, opacity: op,
      display:'flex', alignItems:'center', gap: portrait?16:18,
      color: HX.sec, fontFamily: MONO, fontSize: portrait?52:54, fontWeight: 700,
      letterSpacing: 14, textShadow:`0 0 14px ${HX.sec}66`, zIndex:7,
    }}>
      <span style={{color:HX.dim, letterSpacing:0, fontSize:portrait?40:42}}>┌─</span>
      <span>OVERRIDE</span>
      <span style={{flex:1, height:2,
        background:`linear-gradient(90deg, ${HX.sec}aa, transparent)`,
        letterSpacing:0, alignSelf:'center'}}/>
      <span style={{color:HX.dim, fontSize: portrait?24:22, letterSpacing:4, minWidth:110}}>
        {verText.slice(0, verLen)}{verLen < verText.length && t > 16.2 ? '_' : ''}
      </span>
      <span style={{color:HX.dim, letterSpacing:0, fontSize:portrait?40:42}}>─┐</span>
    </div>
  );
}

function Subtitle({ t, portrait }) {
  if (t < 17) return null;
  const op = tween(0,1,17,17.6,E.outCubic)(t);
  const style = portrait
    ? { top: 1240 }
    : { top:'50%', transform:'translateY(280px)' };
  return (
    <div style={{
      position:'absolute', left:0, right:0, ...style,
      textAlign:'center', opacity: op, color: HX.dim,
      fontFamily: MONO, fontSize: portrait?22:20, letterSpacing:6, zIndex:7,
    }}>
      OPERATOR TERMINAL · TOR-ROUTED · OFFLINE-CAPABLE
    </div>
  );
}

function PressAnyKey({ t }) {
  if (t < 18.6) return null;
  const op = tween(0,1,18.6,19.4,E.outCubic)(t);
  const cursorOn = (Math.sin((t-18.6)*5.5)*0.5 + 0.5) > 0.5;
  return (
    <div style={{
      position:'absolute', left:0, right:0, bottom: 380,
      textAlign:'center', opacity: op,
      color: HX.pri, fontFamily: MONO, fontSize:32, letterSpacing:2, zIndex:7,
      textShadow: `0 0 12px ${HX.pri}55`,
    }}>
      <span style={{color: HX.dim}}>{'>'}</span>{' '}tap to breach in
      <span style={{
        display:'inline-block', width:'0.55em', height:'1em', background:HX.pri,
        marginLeft:4, verticalAlign:'-0.18em', opacity: cursorOn ? 0.95 : 0,
      }}/>
    </div>
  );
}
