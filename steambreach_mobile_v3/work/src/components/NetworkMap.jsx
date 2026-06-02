/* ============================================================
   NetworkMap — enhanced, "more visual" topology view.
   Reads window.GameWorld. Exports window.NetworkMap.
   ============================================================ */
const { useState, useRef, useEffect, useMemo, useCallback } = React;

const REGION_TINT = {
  'us-gov':       MAP_COLORS.danger,
  'eu-central':   MAP_COLORS.primary,
  'ru-darknet':   MAP_COLORS.infected,
  'cn-financial': MAP_COLORS.warning,
  'local':        MAP_COLORS.secondary,
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function hashId(id) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h; }
function hexPoints(r) {
  let p = [];
  for (let k = 0; k < 6; k++) { const a = (Math.PI / 180) * (60 * k - 90); p.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`); }
  return p.join(' ');
}

function NetworkMap({ t }) {
  const W = window.GameWorld;
  const { gateway, nodes, subnets, proxyChain, targetId, bounds } = W;
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 760 });
  const [cam, setCam] = useState(null);          // {x,y,s} screen px + scale
  const [hoverId, setHoverId] = useState(null);
  const [selId, setSelId] = useState(targetId);
  const drag = useRef({ on: false, moved: false, sx: 0, sy: 0, cx: 0, cy: 0 });
  const pinch = useRef({ d: 0, s: 1 });

  const layout = (t.layout || 'organic').toLowerCase();
  const bg = (t.background || 'hex').toLowerCase();
  const motion = (t.motion || 'moderate').toLowerCase();
  const sweepOn = t.sweep && motion !== 'minimal';
  const glow = t.glow ?? 0.6;
  const dur = motion === 'lively' ? 1 : motion === 'minimal' ? 3 : 1.8;
  const rivalsOn = t.rivals !== false;
  const threatsOn = t.threats !== false && motion !== 'minimal';
  const rivals = W.rivals || [];

  const visibleNodes = useMemo(
    () => rivalsOn ? nodes : nodes.filter(n => !n.rivalId), [rivalsOn]);

  // ---- layout: organic (authored) or radar (concentric security rings) ----
  const pos = useMemo(() => {
    const map = {};
    if (layout === 'radar') {
      // concentric security rings: each tier on its own ring, evenly spread
      const tierR = { elite: 145, high: 250, mid: 355, low: 460 };
      const tierOff = { elite: 0.4, high: 1.1, mid: 0.2, low: 0.7 };
      const groups = { elite: [], high: [], mid: [], low: [] };
      nodes.forEach(n => (groups[n.tier] || groups.low).push(n));
      Object.keys(groups).forEach(tier => {
        const g = groups[tier];
        const r = tierR[tier] || 380;
        g.forEach((n, j) => {
          const ang = tierOff[tier] + j * (Math.PI * 2 / Math.max(g.length, 1));
          const h = hashId(n.id);
          const rr = r + ((h % 36) - 18);
          map[n.id] = { x: gateway.x + Math.cos(ang) * rr, y: gateway.y + Math.sin(ang) * rr };
        });
      });
    } else {
      nodes.forEach(n => { map[n.id] = { x: n.x, y: n.y }; });
    }
    map['gateway'] = { x: gateway.x, y: gateway.y };
    return map;
  }, [layout]);

  // ---- fit + camera ----
  const fitCam = useCallback((w, h) => {
    if (!w || !h || w <= 0 || h <= 0) return { x: 0, y: 0, s: 0.5 };
    const fit = Math.min(w / bounds.w, h / bounds.h) * 0.92;
    return { x: (w - bounds.w * fit) / 2, y: (h - bounds.h * fit) / 2, s: fit };
  }, []);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setSize({ w: r.width, h: r.height });
      // (re)fit whenever the camera is unset or degenerate (s<=0)
      setCam(prev => (!prev || !prev.s || prev.s <= 0) ? fitCam(r.width, r.height) : prev);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // wheel zoom about cursor
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setCam(prev => {
        if (!prev) return prev;
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        const factor = Math.exp(-e.deltaY * 0.0016);
        const ns = clamp(prev.s * factor, fitCam(size.w, size.h).s * 0.5, 4);
        const k = ns / prev.s;
        return { s: ns, x: cx - (cx - prev.x) * k, y: cy - (cy - prev.y) * k };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [size.w, size.h]);

  const onDown = (e) => {
    const p = e.touches ? e.touches[0] : e;
    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch.current = { d: Math.hypot(dx, dy), s: cam.s }; return;
    }
    drag.current = { on: true, moved: false, sx: p.clientX, sy: p.clientY, cx: cam.x, cy: cam.y };
  };
  const onMove = (e) => {
    if (e.touches && e.touches.length === 2 && cam) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      setCam(prev => ({ ...prev, s: clamp(pinch.current.s * (d / pinch.current.d), fitCam(size.w, size.h).s * 0.5, 4) }));
      return;
    }
    if (!drag.current.on) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - drag.current.sx, dy = p.clientY - drag.current.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
    setCam(prev => ({ ...prev, x: drag.current.cx + dx, y: drag.current.cy + dy }));
  };
  const onUp = () => { drag.current.on = false; };

  const zoomBtn = (f) => setCam(prev => {
    const cx = size.w / 2, cy = size.h / 2;
    const ns = clamp(prev.s * f, fitCam(size.w, size.h).s * 0.5, 4);
    const k = ns / prev.s;
    return { s: ns, x: cx - (cx - prev.x) * k, y: cy - (cy - prev.y) * k };
  });
  const resetView = () => setCam(fitCam(size.w, size.h));
  const focusOn = (wx, wy, zoom) => setCam(prev => {
    const s = zoom != null ? zoom : (prev ? prev.s : 1);
    return { s, x: size.w / 2 - wx * s, y: size.h / 2 - wy * s };
  });
  const focusRival = (rv) => {
    const core = nodes.find(n => n.rivalId === rv.id && n.rivalCore);
    focusOn(rv.cx, rv.cy, Math.max(fitCam(size.w, size.h).s * 1.5, 0.75));
    if (core) setSelId(core.id);
  };

  const toScreen = (wx, wy) => cam ? { x: cam.x + wx * cam.s, y: cam.y + wy * cam.s } : { x: 0, y: 0 };

  const particles = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i, x: -200 + Math.random() * (bounds.w + 400), y: -150 + Math.random() * (bounds.h + 300),
    r: Math.random() * 1.6 + 0.5, o: Math.random() * 0.4 + 0.08, d: Math.random() * 6,
  })), []);

  const nodeById = useMemo(() => { const m = {}; nodes.forEach(n => m[n.id] = n); return m; }, []);
  const proxyIndex = (id) => proxyChain.indexOf(id);

  const hovered = hoverId && nodeById[hoverId];
  const selected = selId && nodeById[selId];
  const trace = W.stats.trace;
  const gx = gateway.x, gy = gateway.y;
  const transform = cam ? `translate(${cam.x} ${cam.y}) scale(${cam.s})` : '';

  // ---- edge rendering ----
  const renderEdge = (child) => {
    if (child.rivalCore) return null; // core links drawn as threat/ally vectors
    const a = child.parentId === 'gateway' ? { x: gx, y: gy } : pos[child.parentId];
    const b = pos[child.id];
    if (!a || !b) return null;
    const isProxy = child.proxyHop != null;
    const sv = stateVisual(child);
    const active = child.activeTarget;
    let color = MAP_COLORS.border, sw = 1, flow = false, op = 0.5, gl = false;
    if (child.rivalId) { color = nodeColor(child); sw = 1.3; op = child.rivalStatus === 'destroyed' ? 0.18 : 0.4; }
    else if (isProxy) { color = MAP_COLORS.proxy; sw = 2.2; flow = true; gl = true; }
    else if (active) { color = MAP_COLORS.danger; sw = 2; flow = true; gl = true; }
    else if (['infected', 'spreading', 'injecting', 'detected'].includes(child.state)) { color = sv.color; sw = 1.8; flow = true; gl = true; }
    else if (child.owner === 'player') { color = MAP_COLORS.territory; sw = 1.4; op = 0.55; }
    else if (child.owner === 'rival') { color = MAP_COLORS.rival; sw = 1.4; op = 0.5; }
    return (
      <g key={'e' + child.id}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={sw} opacity={op}
          vectorEffect="non-scaling-stroke" />
        {flow && (
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={sw}
            className={isProxy ? 'flow-proxy' : 'flow-data'} vectorEffect="non-scaling-stroke"
            style={{ filter: gl ? `drop-shadow(0 0 4px ${color})` : 'none', animationDuration: dur + 's' }} />
        )}
      </g>
    );
  };

  return (
    <div ref={wrapRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', background: MAP_COLORS.bg,
        cursor: drag.current.on ? 'grabbing' : 'crosshair', touchAction: 'none', userSelect: 'none',
      }}>

      <style>{`
        @keyframes flowDash { to { stroke-dashoffset: -28; } }
        @keyframes flowProxyDash { to { stroke-dashoffset: -28; } }
        .flow-data  { stroke-dasharray: 3 13; animation: flowDash linear infinite; }
        .flow-proxy { stroke-dasharray: 6 10; animation: flowProxyDash linear infinite; }
        @keyframes idlePulse { 0%,100%{opacity:.85;} 50%{opacity:1;} }
        @keyframes statePulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12);} }
        @keyframes huntPulse { 0%{r:8;opacity:.7;} 100%{r:42;opacity:0;} }
        @keyframes ringSpin { to { transform: rotate(360deg); } }
        @keyframes twinkle { 0%,100%{opacity:.15;} 50%{opacity:.7;} }
        @keyframes scan { 0%{background-position:0 0;} 100%{background-position:0 120px;} }
      `}</style>

      {/* scanline overlay (hacking ambiance) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none', opacity: 0.5,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120,220,232,0.02) 2px, rgba(120,220,232,0.02) 4px)',
        animation: motion === 'minimal' ? 'none' : 'scan 9s linear infinite',
      }} />
      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, transparent 42%, ${MAP_COLORS.bg} 100%)` }} />

      <svg width={size.w} height={size.h} style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <defs>
          <pattern id="hexgrid" width="56" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
            <path d="M14 0 L42 0 L56 24 L42 48 L14 48 L0 24 Z" fill="none" stroke={MAP_COLORS.primary} strokeWidth="0.5" opacity="0.06" />
          </pattern>
          <pattern id="sqgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 L0 40" fill="none" stroke={MAP_COLORS.primary} strokeWidth="0.5" opacity="0.05" />
          </pattern>
          <radialGradient id="gwGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor={MAP_COLORS.primary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={MAP_COLORS.primary} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MAP_COLORS.primary} stopOpacity="0.32" />
            <stop offset="100%" stopColor={MAP_COLORS.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={transform}>
          {/* background fills */}
          {bg !== 'void' && (
            <rect x={-400} y={-300} width={bounds.w + 800} height={bounds.h + 600}
              fill={bg === 'hex' ? 'url(#hexgrid)' : 'url(#sqgrid)'} />
          )}

          {/* concentric range / contour rings around gateway */}
          {(bg !== 'void') && [160, 290, 420, 550, 690].map((r, i) => (
            <circle key={'c' + i} cx={gx} cy={gy} r={r} fill="none"
              stroke={MAP_COLORS.primary} strokeWidth="1" opacity={0.05 + (i === 0 ? 0.04 : 0)}
              strokeDasharray="2 10" vectorEffect="non-scaling-stroke" />
          ))}

          {/* radar tier-ring guides */}
          {layout === 'radar' && [['ELITE', 145, MAP_COLORS.danger], ['HIGH', 250, MAP_COLORS.file],
            ['MID', 355, MAP_COLORS.warning], ['LOW', 460, MAP_COLORS.secondary]].map(([lbl, r, c]) => (
            <g key={'tr' + lbl}>
              <circle cx={gx} cy={gy} r={r} fill="none" stroke={c} strokeWidth="1"
                strokeDasharray="3 7" opacity="0.22" vectorEffect="non-scaling-stroke" />
              <text x={gx} y={gy - r - 6} textAnchor="middle" fill={c} fontSize="11" fontFamily="var(--mono)"
                letterSpacing="2" opacity="0.55" style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>{lbl}</text>
            </g>
          ))}

          {/* particles */}
          {t.particles !== false && particles.map(p => (
            <circle key={'p' + p.id} cx={p.x} cy={p.y} r={p.r} fill={MAP_COLORS.primary}
              opacity={p.o} style={{ animation: motion === 'minimal' ? 'none' : `twinkle ${5 + p.d}s ease-in-out ${p.d}s infinite` }} />
          ))}

          {/* subnet auras (organic layout only) */}
          {layout !== 'radar' && subnets.map(s => {
            const tint = REGION_TINT[s.region] || MAP_COLORS.primary;
            return (
              <g key={'sn' + s.key}>
                <circle cx={s.cx} cy={s.cy} r={215} fill={tint} opacity={0.05} />
                <circle cx={s.cx} cy={s.cy} r={215} fill="none" stroke={tint} strokeWidth="1"
                  strokeDasharray="4 8" opacity="0.28" vectorEffect="non-scaling-stroke" />
                <text x={s.cx} y={s.cy - 232} textAnchor="middle" fill={tint} fontSize="15"
                  fontFamily="var(--mono)" letterSpacing="2" opacity="0.85"
                  style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>{s.label}</text>
              </g>
            );
          })}

          {/* rival territory auras */}
          {rivalsOn && layout !== 'radar' && rivals.map(rv => {
            const st = RIVAL_STATUS[rv.status] || RIVAL_STATUS.hostile;
            const dead = rv.status === 'destroyed';
            return (
              <g key={'ra' + rv.id} opacity={dead ? 0.5 : 1}>
                <circle cx={rv.cx} cy={rv.cy} r={138} fill={st.c} opacity={0.06} />
                <circle cx={rv.cx} cy={rv.cy} r={138} fill="none" stroke={st.c} strokeWidth="1.5"
                  strokeDasharray={rv.status === 'hostile' ? '2 6' : '6 6'} opacity="0.4" vectorEffect="non-scaling-stroke"
                  style={{ animation: rv.status === 'hostile' && motion !== 'minimal' ? 'idlePulse 2.2s ease-in-out infinite' : 'none' }} />
                {/* rank pips */}
                <g transform={`translate(${rv.cx} ${rv.cy - 158})`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <polygon key={i} points="0,-4 1.2,-1 4,-1 1.7,1 2.6,4 0,2.2 -2.6,4 -1.7,1 -4,-1 -1.2,-1"
                      transform={`translate(${(i - 2) * 11} 0) scale(1)`}
                      fill={i < rv.rank ? st.c : 'none'} stroke={st.c} strokeWidth="0.7"
                      opacity={i < rv.rank ? 0.9 : 0.25} vectorEffect="non-scaling-stroke" />
                  ))}
                </g>
                <text x={rv.cx} y={rv.cy - 168} textAnchor="middle" fill={st.c} fontSize="17"
                  fontFamily="var(--mono)" fontWeight="700" letterSpacing="1"
                  style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 5 }}>@{rv.handle}</text>
                <text x={rv.cx} y={rv.cy - 150} textAnchor="middle" fill={st.c} fontSize="11"
                  fontFamily="var(--mono)" letterSpacing="2" opacity="0.8"
                  style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>{rv.archName.toUpperCase()} · {st.label}</text>
              </g>
            );
          })}

          {/* edges */}
          {visibleNodes.map(renderEdge)}

          {/* radar sweep */}
          {sweepOn && (
            <g style={{ transformOrigin: `${gx}px ${gy}px` }}>
              <g>
                <animateTransform attributeName="transform" type="rotate"
                  from={`0 ${gx} ${gy}`} to={`360 ${gx} ${gy}`} dur="6s" repeatCount="indefinite" />
                <path d={`M${gx} ${gy} L${gx + 690} ${gy - 150} A 705 705 0 0 1 ${gx + 690} ${gy + 150} Z`}
                  fill="url(#sweepGrad)" opacity="0.8" />
                <line x1={gx} y1={gy} x2={gx + 705} y2={gy} stroke={MAP_COLORS.primary}
                  strokeWidth="1.5" opacity="0.55" vectorEffect="non-scaling-stroke" />
              </g>
            </g>
          )}

          {/* SOC trace beam to active target */}
          {selected && targetId && pos[targetId] && (() => {
            const hx = gx + 320, hy = 70;
            return (
            <g>
              <line x1={hx} y1={hy} x2={pos[targetId].x} y2={pos[targetId].y}
                stroke={MAP_COLORS.danger} strokeWidth="2" strokeDasharray="3 9"
                className="flow-data" opacity={0.4 + trace / 200} vectorEffect="non-scaling-stroke"
                style={{ animationDuration: '0.6s', filter: `drop-shadow(0 0 4px ${MAP_COLORS.danger})` }} />
              <circle cx={hx} cy={hy} fill="none" stroke={MAP_COLORS.danger} strokeWidth="2"
                style={{ animation: 'huntPulse 1.1s ease-out infinite' }} />
              <circle cx={hx} cy={hy} r="8" fill={MAP_COLORS.danger} />
              <circle cx={hx} cy={hy} r="2.5" fill="#fff" />
              <text x={hx} y={hy - 16} textAnchor="middle" fill={MAP_COLORS.danger} fontSize="13"
                fontFamily="var(--mono)" fontWeight="bold" letterSpacing="1"
                style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>[SOC] HUNTER · TRACE {trace}%</text>
            </g>
            );
          })()}

          {/* rival threat / ally vectors to gateway */}
          {rivalsOn && threatsOn && rivals.map(rv => {
            if (rv.status === 'destroyed' || rv.status === 'neutral') return null;
            const core = pos['__none'] || nodes.find(n => n.rivalId === rv.id && n.rivalCore);
            const cp = core && pos[core.id]; if (!cp) return null;
            const st = RIVAL_STATUS[rv.status];
            const hostile = rv.status === 'hostile';
            return (
              <g key={'rv' + rv.id}>
                <line x1={cp.x} y1={cp.y} x2={gx} y2={gy} stroke={st.c} strokeWidth={hostile ? 2 : 1.6}
                  strokeDasharray={hostile ? '4 7' : '8 8'} className="flow-data"
                  opacity={hostile ? 0.6 : 0.5} vectorEffect="non-scaling-stroke"
                  style={{ animationDuration: (hostile ? 0.7 : 1.6) + 's', filter: `drop-shadow(0 0 4px ${st.c})` }} />
                {hostile && (
                  <text textAnchor="middle" fill={st.c} fontSize="11" fontFamily="var(--mono)" fontWeight="700"
                    letterSpacing="1" x={(cp.x + gx) / 2} y={(cp.y + gy) / 2}
                    style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>⚠ INBOUND</text>
                )}
                {!hostile && (
                  <text textAnchor="middle" fill={st.c} fontSize="10" fontFamily="var(--mono)"
                    letterSpacing="1" x={(cp.x + gx) / 2} y={(cp.y + gy) / 2}
                    style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>ALLY FEED</text>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {visibleNodes.map(n => {
            const p = pos[n.id]; if (!p) return null;
            const sv = stateVisual(n);
            const col = nodeColor(n);
            const r = tierRadius(n.tier);
            const rv = n.rivalCore ? rivals.find(x => x.id === n.rivalId) : null;
            const isHover = hoverId === n.id, isSel = selId === n.id;
            const showLabel = t.labels && (cam && cam.s > fitCam(size.w, size.h).s * 0.95 || isHover || isSel);
            return (
              <g key={n.id} transform={`translate(${p.x} ${p.y})`}
                onMouseEnter={() => setHoverId(n.id)} onMouseLeave={() => setHoverId(null)}
                onClick={(e) => { e.stopPropagation(); if (!drag.current.moved) setSelId(n.id); }}
                style={{ cursor: 'pointer' }}>
                <g style={{
                  color: col, transition: 'transform .15s cubic-bezier(.34,1.56,.64,1)',
                  transform: isHover || isSel ? 'scale(1.18)' : 'scale(1)',
                  animation: sv.pulse && motion !== 'minimal' ? `statePulse ${dur}s ease-in-out infinite` : 'none',
                }}>
                  {/* bloom */}
                  <circle r={r * 1.7} fill={col} opacity={glow * (sv.pulse ? 0.22 : 0.12)} />
                  {/* outer rings */}
                  {n.proxyHop != null && <polygon points={hexPoints(r + 7)} fill="none" stroke={MAP_COLORS.proxy}
                    strokeWidth="1.5" strokeDasharray="5 5" opacity="0.7" className="ring-spin" vectorEffect="non-scaling-stroke"
                    style={{ transformOrigin: '0 0', animation: motion === 'minimal' ? 'none' : 'ringSpin 14s linear infinite' }} />}
                  {sv.ring === 'pulse' && <circle r={r + 6} fill="none" stroke={col} strokeWidth="2"
                    style={{ animation: 'huntPulse 1.4s ease-out infinite' }} />}
                  {sv.ring && sv.ring !== 'pulse' && <circle r={r + 6} fill="none" stroke={col}
                    strokeWidth="1.5" strokeDasharray={sv.ring === 'dash' ? '4 5' : 'none'} opacity="0.7"
                    vectorEffect="non-scaling-stroke" />}
                  {n.contract && <circle r={r + 11} fill="none" stroke={MAP_COLORS.warning} strokeWidth="1.5"
                    strokeDasharray="2 4" opacity="0.85" vectorEffect="non-scaling-stroke" />}
                  {n.rivalId ? (n.rivalStatus !== 'destroyed' &&
                    <polygon points={hexPoints(r + 4)} fill="none" stroke={col}
                      strokeWidth={n.fortified ? 2.5 : 1.5} opacity="0.65" vectorEffect="non-scaling-stroke" />)
                  : (<React.Fragment>
                    {n.owner === 'rival' && <polygon points={hexPoints(r + 4)} fill="none" stroke={MAP_COLORS.rival}
                      strokeWidth={n.fortified ? 2.5 : 1.5} opacity="0.6" vectorEffect="non-scaling-stroke" />}
                    {n.owner === 'player' && <polygon points={hexPoints(r + 4)} fill="none" stroke={MAP_COLORS.territory}
                      strokeWidth="1.5" opacity="0.55" vectorEffect="non-scaling-stroke" />}
                  </React.Fragment>)}
                  {/* chassis */}
                  <polygon points={hexPoints(r)} fill={MAP_COLORS.chassis} stroke={col} strokeWidth="2"
                    vectorEffect="non-scaling-stroke" opacity={n.state === 'dead' ? 0.4 : 1}
                    style={{ filter: `drop-shadow(0 0 ${glow * 6}px ${col}80)` }} />
                  {/* glyph */}
                  <g transform={`scale(${r / 13})`} style={{ opacity: n.state === 'dead' ? 0.4 : 0.95 }}>
                    <OrgGlyph type={n.type} />
                  </g>
                  {/* core marker */}
                  {n.core && <polygon points="0,-2 1.5,2.5 -1.5,2.5" fill={col}
                    transform={`translate(0 ${-(r + 16)}) scale(2.2)`} />}
                  {/* rival zero-day vault badge */}
                  {rv && rv.zd > 0 && (
                    <g transform={`translate(${r * 0.78} ${-r * 0.78})`}>
                      <polygon points="0,-8 8,0 0,8 -8,0" fill={MAP_COLORS.bgPanel} stroke={col}
                        strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                      <text x="0" y="3" textAnchor="middle" fill={col} fontSize="9" fontFamily="var(--mono)"
                        fontWeight="700">{rv.zd}</text>
                    </g>
                  )}
                  {/* selection reticle */}
                  {isSel && <polygon points={hexPoints(r + 14)} fill="none" stroke={col} strokeWidth="1"
                    strokeDasharray="2 6" opacity="0.9" vectorEffect="non-scaling-stroke"
                    style={{ transformOrigin: '0 0', animation: motion === 'minimal' ? 'none' : 'ringSpin 20s linear infinite' }} />}
                </g>
                {showLabel && (
                  <text x="0" y={r + 18} textAnchor="middle" fill={MAP_COLORS.text} fontSize="12"
                    fontFamily="var(--mono)" letterSpacing="0.3"
                    style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>
                    {n.name.length > 18 ? n.name.slice(0, 17) + '…' : n.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* gateway / rig */}
          <g>
            <circle cx={gx} cy={gy} r="70" fill="url(#gwGlow)" opacity={0.5 + glow * 0.5} />
            {[40, 56].map((rr, i) => (
              <g key={'gr' + i} style={{ transformOrigin: `${gx}px ${gy}px`,
                animation: motion === 'minimal' ? 'none' : `ringSpin ${(i ? 22 : 16)}s linear infinite ${i ? 'reverse' : ''}` }}>
                <circle cx={gx} cy={gy} r={rr} fill="none" stroke={MAP_COLORS.primary} strokeWidth="1.5"
                  strokeDasharray={i ? '2 8' : '14 8'} opacity="0.5" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            <polygon points={hexPoints(20)} transform={`translate(${gx} ${gy})`} fill={MAP_COLORS.bgPanel}
              stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' }} />
            <circle cx={gx} cy={gy} r="6" fill="#fff" style={{ filter: 'drop-shadow(0 0 6px #fff)' }} />
            <text x={gx} y={gy + 44} textAnchor="middle" fill="#fff" fontSize="13" fontFamily="var(--mono)"
              fontWeight="bold" letterSpacing="2" style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 5 }}>
              KALI-GATEWAY</text>
            {proxyChain.length > 0 && (
              <text x={gx} y={gy + 60} textAnchor="middle" fill={MAP_COLORS.proxy} fontSize="11"
                fontFamily="var(--mono)" letterSpacing="1" style={{ paintOrder: 'stroke', stroke: MAP_COLORS.bg, strokeWidth: 4 }}>
                ◈ {proxyChain.length} HOP TUNNEL</text>
            )}
          </g>
        </g>
      </svg>

      {/* ====== HUD overlays (HTML) ====== */}
      <MapHUD W={W} selected={selected} cam={cam} pos={pos} toScreen={toScreen} gx={gx} gy={gy}
        zoomBtn={zoomBtn} resetView={resetView} hovered={hovered}
        rivalsOn={rivalsOn} rivals={rivals} focusRival={focusRival} selId={selId} />
    </div>
  );
}

/* ---------------- HUD ---------------- */
function Gauge({ value, color, label }) {
  const R = 30, C = 2 * Math.PI * R, off = C * (1 - value / 100);
  return (
    <div style={{ position: 'relative', width: 76, height: 76, textAlign: 'center' }}>
      <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="38" cy="38" r={R} fill="none" stroke={MAP_COLORS.border} strokeWidth="6" />
        <circle cx="38" cy="38" r={R} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset .6s ease', filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{value}<span style={{ fontSize: 10 }}>%</span></div>
        <div style={{ color: MAP_COLORS.textDim, fontSize: 8, letterSpacing: 1.5, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function MapHUD({ W, selected, cam, pos, toScreen, gx, gy, zoomBtn, resetView, hovered, rivalsOn, rivals, focusRival, selId }) {
  const s = W.stats;
  const C = MAP_COLORS;
  const chip = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 1 };
  const tip = hovered || selected;
  const tipPos = tip && cam ? toScreen(pos[tip.id].x, pos[tip.id].y) : null;
  const traceColor = s.trace > 75 ? C.danger : s.trace > 45 ? C.warning : C.secondary;
  const tipRival = tip && tip.rivalCore ? (rivals || []).find(rv => rv.id === tip.rivalId) : null;

  const legend = [
    [C.primary, 'Target / scan'], [C.infected, 'C2 / infected'], [C.territory, 'Your node'],
    [C.rival, 'Rival node'], [C.proxy, 'Proxy hop'], [C.warning, 'Contract'], [C.danger, 'Detected'],
  ];

  return (
    <>
      {/* top-left status */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 12, display: 'flex', gap: 10, flexWrap: 'wrap',
        fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(8,9,13,0.82)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px',
          backdropFilter: 'blur(6px)' }}>
          <div style={{ ...chip, color: C.textDim, marginBottom: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.secondary, boxShadow: `0 0 6px ${C.secondary}` }} />
            SUBNET TOPOLOGY · LIVE
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ ...chip, color: C.text }}>REGION <b style={{ color: C.primary }}>{s.region.toUpperCase()}</b></span>
            <span style={{ ...chip, color: C.text }}>NODES <b style={{ color: C.primary }}>{W.nodes.length}</b></span>
            <span style={{ ...chip, color: C.text }}>C2 <b style={{ color: C.infected }}>{s.botnet}</b></span>
            <span style={{ ...chip, color: C.text }}>HOPS <b style={{ color: C.proxy }}>{W.proxyChain.length}</b></span>
          </div>
        </div>
      </div>

      {/* top-right gauges */}
      <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 12, display: 'flex', gap: 8,
        fontFamily: 'var(--mono)', background: 'rgba(8,9,13,0.82)', border: `1px solid ${C.border}`, borderRadius: 4,
        padding: '8px 10px', backdropFilter: 'blur(6px)' }}>
        <Gauge value={s.trace} color={traceColor} label="TRACE" />
        <Gauge value={s.heat} color={C.file} label="HEAT" />
      </div>

      {/* legend bottom-left */}
      <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 12, fontFamily: 'var(--mono)',
        background: 'rgba(8,9,13,0.82)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '10px 12px',
        backdropFilter: 'blur(6px)', maxWidth: 220 }}>
        <div style={{ color: C.textDim, fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>LEGEND</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          {legend.map(([col, lbl]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: C.text }}>
              <span style={{ width: 9, height: 9, background: col, borderRadius: 2, boxShadow: `0 0 5px ${col}` }} />{lbl}
            </div>
          ))}
        </div>
      </div>

      {/* controls bottom-right */}
      <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['＋', () => zoomBtn(1.3)], ['－', () => zoomBtn(1 / 1.3)], ['⊡', resetView]].map(([t2, fn]) => (
          <button key={t2} onClick={fn} style={{ width: 34, height: 34, background: 'rgba(8,9,13,0.9)',
            border: `1px solid ${C.borderHi}`, color: C.text, borderRadius: 4, cursor: 'pointer', fontSize: 16,
            fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t2}</button>
        ))}
      </div>

      {/* rivals roster (right rail) */}
      {rivalsOn && rivals && rivals.length > 0 && (
        <div style={{ position: 'absolute', top: 110, right: 14, zIndex: 12, width: 212, fontFamily: 'var(--mono)',
          background: 'rgba(8,9,13,0.86)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '10px 10px 8px',
          backdropFilter: 'blur(6px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: C.rival, fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>☠ RIVAL OPERATORS</span>
            <span style={{ color: C.textDim, fontSize: 9 }}>{rivals.filter(r => r.status !== 'destroyed').length} ACTIVE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {rivals.map(rv => {
              const st = RIVAL_STATUS[rv.status] || RIVAL_STATUS.hostile;
              const isSel = selected && selected.rivalId === rv.id;
              return (
                <button key={rv.id} onClick={() => focusRival(rv)} style={{
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--mono)', width: '100%',
                  background: isSel ? st.c + '22' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSel ? st.c : C.border}`, borderRadius: 3, padding: '6px 8px',
                  display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.c, flexShrink: 0,
                        boxShadow: rv.status === 'hostile' ? `0 0 6px ${st.c}` : 'none' }} />
                      <span style={{ color: st.c, fontSize: 11, fontWeight: 700, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{rv.handle}</span>
                    </span>
                    <span style={{ color: st.c, fontSize: 9, letterSpacing: 1 }}>{'★'.repeat(rv.rank)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textDim }}>
                    <span>{rv.archName}</span>
                    <span>{rv.btc > 0 ? '₿' + (rv.btc >= 1000 ? (rv.btc / 1000).toFixed(0) + 'k' : rv.btc) : '—'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* node / rival tooltip */}
      {tip && tipPos && tipRival && (() => {
        const st = RIVAL_STATUS[tipRival.status] || RIVAL_STATUS.hostile;
        const relPct = (tipRival.rel + 100) / 200 * 100;
        const relC = tipRival.rel > 15 ? C.secondary : tipRival.rel < -15 ? C.rival : C.warning;
        const actions = {
          hostile: ['raid @' + tipRival.handle, 'taunt @' + tipRival.handle, tipRival.contract ? 'contract: ' + tipRival.contract : 'dossier'],
          neutral: ['negotiate @' + tipRival.handle, 'raid @' + tipRival.handle, 'dossier'],
          allied: ['request backup', 'negotiate @' + tipRival.handle, 'dismiss'],
          destroyed: ['— infrastructure eliminated —'],
        }[tipRival.status] || [];
        return (
          <div style={{ position: 'absolute', left: clamp(tipPos.x + 26, 8, 9999), top: clamp(tipPos.y - 10, 8, 9999),
            zIndex: 14, pointerEvents: 'none', fontFamily: 'var(--mono)', width: 244,
            background: 'rgba(8,10,16,0.97)', border: `1px solid ${st.c}`, borderRadius: 5, padding: '12px 14px',
            backdropFilter: 'blur(8px)', boxShadow: `0 10px 30px rgba(0,0,0,0.7), 0 0 18px ${st.c}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              borderBottom: `1px solid ${C.border}`, paddingBottom: 7, marginBottom: 8 }}>
              <span style={{ color: st.c, fontWeight: 700, fontSize: 14 }}>@{tipRival.handle}</span>
              <span style={{ color: st.c, fontSize: 10 }}>{'★'.repeat(tipRival.rank)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.text, fontSize: 11 }}>{tipRival.archName}</span>
              <span style={{ color: C.bg, background: st.c, fontSize: 8, fontWeight: 700, padding: '2px 6px',
                borderRadius: 2, letterSpacing: 1 }}>{st.label}</span>
            </div>
            {tipRival.contract && <div style={{ background: C.warning, color: C.bg, fontSize: 9, fontWeight: 700,
              textAlign: 'center', padding: '3px 0', borderRadius: 2, marginBottom: 8, letterSpacing: 1 }}>[!] CONTRACT · {tipRival.contract}</div>}
            <Row k="REP" v={tipRival.rep} vc={C.text} />
            <Row k="BOUNTY" v={tipRival.btc > 0 ? '₿' + tipRival.btc.toLocaleString() : '—'} vc={C.warning} />
            <Row k="0-DAYS" v={tipRival.zd > 0 ? tipRival.zd + ' · ' + tipRival.top : 'none'} vc={tipRival.zd > 0 ? C.chat : C.textDim} />
            <Row k="WEAKNESS" v={tipRival.vuln} vc={C.primary} />
            <div style={{ margin: '8px 0 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textDim, marginBottom: 3 }}>
                <span>RELATIONSHIP</span><span style={{ color: relC }}>{tipRival.rel > 0 ? '+' : ''}{tipRival.rel}</span>
              </div>
              <div style={{ height: 5, background: C.border, borderRadius: 3, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: relPct + '%', background: relC,
                  borderRadius: 3, boxShadow: `0 0 5px ${relC}` }} />
                <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: C.borderHi }} />
              </div>
            </div>
            <div style={{ marginTop: 9, paddingTop: 8, borderTop: `1px solid ${C.border}`, display: 'flex',
              flexWrap: 'wrap', gap: 4 }}>
              {actions.map((a, i) => (
                <span key={i} style={{ fontSize: 9, color: i === 0 && tipRival.status !== 'destroyed' ? st.c : C.textDim,
                  border: `1px solid ${i === 0 && tipRival.status !== 'destroyed' ? st.c + '80' : C.border}`,
                  borderRadius: 2, padding: '3px 6px' }}>{a}</span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* node tooltip */}
      {tip && tipPos && !tipRival && (
        <div style={{
          position: 'absolute', left: clamp(tipPos.x + 26, 8, (cam ? 9999 : 0)), top: clamp(tipPos.y - 10, 8, 9999),
          zIndex: 14, pointerEvents: 'none', fontFamily: 'var(--mono)', minWidth: 210, maxWidth: 260,
          background: 'rgba(8,10,16,0.96)', border: `1px solid ${nodeColor(tip)}80`, borderRadius: 5,
          padding: '12px 14px', backdropFilter: 'blur(8px)', boxShadow: `0 10px 30px rgba(0,0,0,0.7), 0 0 16px ${nodeColor(tip)}30`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            borderBottom: `1px solid ${C.border}`, paddingBottom: 7, marginBottom: 8 }}>
            <span style={{ color: nodeColor(tip), fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>{tip.name}</span>
            <span style={{ color: C.bg, background: nodeColor(tip), fontSize: 8, fontWeight: 700, padding: '2px 5px',
              borderRadius: 2, letterSpacing: 1 }}>{TIER_LABEL[tip.tier]}</span>
          </div>
          {tip.contract && <div style={{ background: C.warning, color: C.bg, fontSize: 9, fontWeight: 700, textAlign: 'center',
            padding: '3px 0', borderRadius: 2, marginBottom: 8, letterSpacing: 1 }}>[!] CONTRACT TARGET</div>}
          <Row k="IP" v={tip.ip} vc={C.primary} />
          <Row k="TYPE" v={tip.type.toUpperCase()} vc={C.text} />
          <Row k="STATE" v={(stateVisual(tip).label || 'IDLE')} vc={stateVisual(tip).color || C.textDim} />
          {tip.owner && <Row k="CONTROL" v={tip.owner === 'player' ? 'YOU' : 'RIVAL'} vc={tip.owner === 'player' ? C.territory : C.rival} />}
          {tip.proxyHop != null && <div style={{ marginTop: 8, background: C.proxy, color: C.bg, fontSize: 9, fontWeight: 700,
            display: 'inline-block', padding: '3px 7px', borderRadius: 2, letterSpacing: 1 }}>PROXY HOP {tip.proxyHop}</div>}
        </div>
      )}
    </>
  );
}
function Row({ k, v, vc }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, margin: '4px 0' }}>
      <span style={{ color: MAP_COLORS.textDim }}>{k}</span><span style={{ color: vc, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

window.NetworkMap = NetworkMap;
