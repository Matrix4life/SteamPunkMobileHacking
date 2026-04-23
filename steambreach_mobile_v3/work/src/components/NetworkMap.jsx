import React, { useState, useRef, useEffect, useMemo } from 'react';
import { COLORS } from '../constants/gameConstants';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function NetworkMap({ 
  world = {}, botnet = [], proxies = [], looted = [], 
  targetIP, trace = 0, inventory = [], selectNodeFromMap, 
  expanded, toggleExpand, currentRegion = 'UNKNOWN',
  consumables = { decoy: 0, burner: 0, zeroday: 0 },
  money = 0,
  isMobile = false,
  contracts = [],
  activeContract = null,
  // WiFi Integration
  wifiState = {},
  wifiNetworks = [],
  onWifiNetworkSelect = null
}) {
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showWifiLayer, setShowWifiLayer] = useState(false);
  const [hoveredWifi, setHoveredWifi] = useState(null);
  
  // --- CAMERA & INTERACTION STATE ---
  const [cam, setCam] = useState({ x: 0, y: 0, z: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const isHacking = Boolean(targetIP);

  const getInfectionVisual = (node = {}) => {
    const state = node?.infection?.state || 'idle';
    switch (state) {
      case 'injecting':
        return { color: COLORS.warning, pulse: true, ring: COLORS.warning, label: 'INJECTING' };
      case 'infected':
        return { color: COLORS.infected, pulse: true, ring: COLORS.infected, label: 'INFECTED' };
      case 'spreading':
        return { color: COLORS.primary, pulse: true, ring: COLORS.primary, label: 'SPREADING' };
      case 'detected':
        return { color: COLORS.danger, pulse: true, ring: COLORS.danger, label: 'DETECTED' };
      case 'quarantined':
        return { color: '#9aa6ff', pulse: false, ring: '#9aa6ff', label: 'QUARANTINED' };
      case 'dead':
        return { color: COLORS.textDim, pulse: false, ring: COLORS.textDim, label: 'DEAD' };
      default:
        return { color: null, pulse: false, ring: null, label: null };
    }
  };

  // --- Helper to check if an IP is a contract target ---
  const isContractTarget = (ip) => {
    if (activeContract) {
      const objs = activeContract.objectives || [{ ip: activeContract.targetIP }];
      return objs.some(o => o.ip === ip && !o.completed);
    }
    // Also check available contracts on the board
    return contracts.some(c => {
      const objs = c.objectives || [{ ip: c.targetIP }];
      return objs.some(o => o.ip === ip && !o.completed);
    });
  };

  // --- LOOT ANIMATION STATE ---
  const [lootNotifs, setLootNotifs] = useState([]);
  const prevConsumables = useRef(consumables);
  const prevMoney = useRef(money);

  // Trigger animation when items/money increase
  useEffect(() => {
    const newNotifs = [];
    if (consumables.decoy > prevConsumables.current.decoy) newNotifs.push({ text: 'TRACE DECOY EXTRACTED', color: COLORS.secondary });
    if (consumables.burner > prevConsumables.current.burner) newNotifs.push({ text: 'BURNER VPN EXTRACTED', color: COLORS.secondary });
    if (consumables.zeroday > prevConsumables.current.zeroday) newNotifs.push({ text: 'ZERO-DAY WEAPONIZED', color: COLORS.danger });
    
    const moneyDiff = money - prevMoney.current;
    if (moneyDiff > 0) newNotifs.push({ text: `$${moneyDiff.toLocaleString()} XMR ACQUIRED`, color: COLORS.warning });

    if (newNotifs.length > 0) {
      const timestampedNotifs = newNotifs.map(n => ({ ...n, id: Math.random().toString() }));
      setLootNotifs(prev => [...prev, ...timestampedNotifs]);
      
      // Auto-remove the notification after 2.5 seconds
      setTimeout(() => {
        setLootNotifs(prev => prev.filter(p => !timestampedNotifs.find(t => t.id === p.id)));
      }, 2500);
    }

    prevConsumables.current = consumables;
    prevMoney.current = money;
  }, [consumables, money]);

  useEffect(() => {
    if (!expanded) setCam({ x: 0, y: 0, z: 1 });
  }, [expanded]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const handleNativeWheel = (e) => {
      if (!expanded) return;
      e.preventDefault();
      const zoomFactor = Math.exp(-e.deltaY * 0.002);
      
      setCam(prev => {
        const newZ = clamp(prev.z * zoomFactor, 0.2, 5); 
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleRatio = newZ / prev.z;
        
        return {
          x: mouseX - (mouseX - prev.x) * scaleRatio,
          y: mouseY - (mouseY - prev.y) * scaleRatio,
          z: newZ
        };
      });
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [expanded]);

  const handleMouseDown = (e) => {
    if (!expanded) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({ x: e.clientX - cam.x, y: e.clientY - cam.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !expanded) return;
    setHasDragged(true);
    setCam(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // ─── TOUCH HANDLERS (mobile pan + pinch zoom) ─────────────
  const touchRef = useRef({ startX: 0, startY: 0, camStartX: 0, camStartY: 0, pinchDist: 0, pinchZoom: 1 });

  const getTouchDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (!expanded) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setHasDragged(false);
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
      touchRef.current.camStartX = cam.x;
      touchRef.current.camStartY = cam.y;
    } else if (e.touches.length === 2) {
      e.preventDefault();
      touchRef.current.pinchDist = getTouchDist(e.touches);
      touchRef.current.pinchZoom = cam.z;
    }
  };

  const handleTouchMove = (e) => {
    if (!expanded) return;
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - touchRef.current.startX;
      const dy = e.touches[0].clientY - touchRef.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) setHasDragged(true);
      setCam(prev => ({
        ...prev,
        x: touchRef.current.camStartX + dx,
        y: touchRef.current.camStartY + dy,
      }));
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const scale = newDist / touchRef.current.pinchDist;
      const newZ = clamp(touchRef.current.pinchZoom * scale, 0.3, 5);
      setCam(prev => ({ ...prev, z: newZ }));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  const handleNodeClick = (e, ip) => {
    e.stopPropagation();
    if (hasDragged || !expanded) return;
    if (isMobile) {
      if (hoveredNode === ip) {
        selectNodeFromMap(ip);
        setHoveredNode(null);
      } else {
        setHoveredNode(ip);
      }
    } else {
      selectNodeFromMap(ip);
    }
  };

  const dustParticles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      cx: `${Math.random() * 200 - 50}%`,
      cy: `${Math.random() * 200 - 50}%`,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    }));
  }, []);

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = -100; i <= 200; i += 10) {
      lines.push(<line key={`v${i}`} x1={`${i}%`} y1="-100%" x2={`${i}%`} y2="200%" stroke={COLORS.primary} strokeWidth="0.5" opacity="0.05" />);
      lines.push(<line key={`h${i}`} x1="-100%" y1={`${i}%`} x2="200%" y2={`${i}%`} stroke={COLORS.primary} strokeWidth="0.5" opacity="0.05" />);
    }
    return lines;
  }, []);

  const proxyChain = proxies.filter(ip => world[ip] && !world[ip].isHidden);
  const mapHeight = isMobile ? (expanded ? '100%' : '60px') : (expanded ? '350px' : '80px');
  const nodeCount = Object.keys(world).filter(k => k !== 'local' && !world[k].isHidden).length;

  const mobileOverlayStyle = isMobile && expanded ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
    height: '100%', width: '100%', borderRadius: 0, border: 'none',
  } : {};

  return (
    <div 
      style={{
        flex: 1, height: mapHeight,
        border: `1px solid ${trace > 75 ? COLORS.danger + '80' : COLORS.border}`,
        position: 'relative',
        background: isHacking ? '#02040a' : COLORS.bgDark, 
        overflow: 'hidden', borderRadius: '3px',
        transition: isMobile ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease',
        cursor: expanded ? (isDragging ? 'grabbing' : 'crosshair') : 'pointer',
        boxShadow: trace > 75 ? `0 0 12px ${COLORS.danger}20, inset 0 0 20px ${COLORS.danger}08` : `inset 0 0 30px rgba(0,0,0,0.5)`,
        userSelect: 'none',
        touchAction: 'none',
        ...mobileOverlayStyle,
      }}
      onClick={!expanded ? toggleExpand : undefined}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes stream { to { stroke-dashoffset: -40; } }
        @keyframes streamFast { to { stroke-dashoffset: -40; } }
        @keyframes scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 100px; }
}
        
        @keyframes nodeIdlePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
        }
        @keyframes infectPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.18); opacity: 1; }
        }
        @keyframes quarantinePulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.8; }
        }

        /* --- LOOT ANIMATION --- */
        @keyframes floatUpLoot {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          15% { opacity: 1; transform: translateY(0) scale(1.1); filter: brightness(1.5); }
          30% { transform: translateY(-5px) scale(1); filter: brightness(1); }
          80% { opacity: 1; transform: translateY(-15px) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.9); }
        }
        .loot-notif { 
          animation: floatUpLoot 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; 
        }

        /* --- SOC HUNTER ANIMATIONS --- */
        @keyframes pulse-danger {
          0% { r: 6px; opacity: 0.8; }
          100% { r: 35px; opacity: 0; }
        }
        .hunter-pulse { animation: pulse-danger 1s ease-out infinite; }
        
        @keyframes traceBeam { to { stroke-dashoffset: -32; } }
        .trace-beam { animation: traceBeam 0.5s linear infinite; }
        
        .data-stream { stroke-dasharray: 4, 12; animation: stream 1s linear infinite; }
        .proxy-stream { stroke-dasharray: 6, 8; animation: streamFast 0.8s linear infinite; }
        
        .map-vignette { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at center, transparent 30%, ${COLORS.bgDark} 100%); pointer-events: none; z-index: 10; transition: opacity 0.5s ease; }
        .is-hacking .map-vignette { opacity: 0.6; }
      `}</style>

      {/* --- FLOATING LOOT OVERLAY --- */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        {lootNotifs.map(notif => (
          <div key={notif.id} className="loot-notif" style={{ 
            color: notif.color, 
            fontSize: expanded ? '16px' : '10px', 
            fontWeight: 'bold', 
            letterSpacing: '2px', 
            background: 'rgba(0,0,0,0.85)', 
            padding: '8px 16px', 
            border: `1px solid ${notif.color}`, 
            borderRadius: '4px', 
            marginBottom: '8px', 
            boxShadow: `0 0 15px ${notif.color}40`, 
            textShadow: `0 0 5px ${notif.color}` 
          }}>
            [+] {notif.text}
          </div>
        ))}
      </div>

     <div style={{
  position: 'absolute', inset: 0, zIndex: 1,
  background: isHacking
    ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.03) 2px, rgba(0,255,136,0.03) 4px)'
    : 'none',
  opacity: isHacking ? 1 : 0,
  transition: 'opacity 0.5s ease',
  pointerEvents: 'none',
  animation: isHacking ? 'scanlines 8s linear infinite' : 'none',
}} />

      <div className={`map-vignette ${isHacking ? 'is-hacking' : ''}`} />

      <svg ref={svgRef} width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}>
        <g style={{ transform: `translate(${cam.x * 0.2}px, ${cam.y * 0.2}px) scale(${cam.z * 0.6})`, transformOrigin: '0 0', opacity: isHacking ? 0.2 : 1, transition: 'opacity 0.5s ease' }}>
          {dustParticles.map(p => (
             <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill={COLORS.primary} opacity={p.opacity} />
          ))}
        </g>

        <g style={{ transform: `translate(${cam.x * 0.5}px, ${cam.y * 0.5}px) scale(${cam.z * 0.8})`, transformOrigin: '0 0', opacity: isHacking ? 0.3 : 1, transition: 'opacity 0.5s ease' }}>
          {gridLines}
        </g>

        <g style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})`, transformOrigin: '0 0', transition: isDragging ? 'none' : 'transform 0.05s linear' }}>
          {expanded && Array.from({ length: 4 }).map((_, i) => (
            <line key={`base-${i}`} x1="50%" y1={expanded ? "90%" : "85%"} x2={`${20 + i*20}%`} y2="200%" stroke={COLORS.primary} strokeWidth="1" opacity={isHacking ? 0.05 : 0.1} strokeDasharray="10 10" />
          ))}

          {/* --- ACTIVE BLUE TEAM TRACE VISUAL --- */}
          {isHacking && trace > 0 && world[targetIP] && (
            <g>
              <line
                x1="85%" y1="15%"
                x2={world[targetIP].x} y2={world[targetIP].y}
                stroke={COLORS.danger}
                strokeWidth={expanded ? 2 : 1.5}
                strokeDasharray="4 8"
                opacity={0.4 + (trace / 150)}
                className="trace-beam"
              />
              <circle cx="85%" cy="15%" fill="none" stroke={COLORS.danger} strokeWidth="2" className="hunter-pulse" />
              <circle cx="85%" cy="15%" r={expanded ? 8 : 5} fill={COLORS.danger} />
              <circle cx="85%" cy="15%" r="2" fill="#fff" />
              {expanded && (
                <text x="85%" y="15%" dy="-20" fill={COLORS.danger} fontSize="10px" textAnchor="middle" fontWeight="bold" letterSpacing="1px" style={{ filter: `drop-shadow(0 0 4px ${COLORS.danger})` }}>
                  [SOC] TRACE: {trace}%
                </text>
              )}
            </g>
          )}

          {Object.keys(world).filter(k => k !== 'local' && !world[k].isHidden && !proxies.includes(k)).map(ip => {
            const node = world[ip];
            const startX = node.parentIP && world[node.parentIP] ? world[node.parentIP].x : "50%";
            const startY = node.parentIP && world[node.parentIP] ? world[node.parentIP].y : (expanded ? "90%" : "85%");
            const isActive = targetIP === ip;
            const isInfected = botnet.includes(ip);
            const infectionState = node?.infection?.state || 'idle';
            const linkHot = infectionState !== 'idle';
            let lineColor = `${COLORS.border}60`;
            if (linkHot) lineColor = getInfectionVisual(node).color || COLORS.primary;
            else if (isActive) lineColor = COLORS.primary;
            else if (isInfected) lineColor = `${COLORS.infected}80`;
            
            return (
              <g key={`ln-${ip}`}>
                <line x1={startX} y1={startY} x2={node.x} y2={node.y} stroke={lineColor} strokeWidth="0.5" opacity={isHacking && !isActive && !isInfected && !linkHot ? 0.1 : 0.3} style={{ transition: 'opacity 0.5s ease' }} />
                {(isActive || isInfected || linkHot) && (
                  <line x1={startX} y1={startY} x2={node.x} y2={node.y} stroke={lineColor} strokeWidth={linkHot ? 1.8 : (isActive ? 1.5 : 1)} className={infectionState === 'quarantined' ? 'proxy-stream' : 'data-stream'} opacity={infectionState === 'dead' ? 0.35 : 1} style={{ filter: linkHot ? `drop-shadow(0 0 5px ${lineColor})` : undefined }} />
                )}
              </g>
            );
          })}

          {proxyChain.length > 0 && (() => {
            const gy = expanded ? "90%" : "85%";
            const chainPoints = [
              { x: "50%", y: gy },
              ...proxyChain.map(ip => ({ x: world[ip].x, y: world[ip].y })),
              { x: "50%", y: gy }
            ];
            const segments = [];
            for (let i = 0; i < chainPoints.length - 1; i++) {
              segments.push(
                <g key={`pc-${i}`}>
                   <line x1={chainPoints[i].x} y1={chainPoints[i].y} x2={chainPoints[i + 1].x} y2={chainPoints[i + 1].y} stroke={COLORS.proxy} strokeWidth="2" opacity="0.2" />
                   <line x1={chainPoints[i].x} y1={chainPoints[i].y} x2={chainPoints[i + 1].x} y2={chainPoints[i + 1].y} stroke={COLORS.proxy} strokeWidth="2" className="proxy-stream" style={{ filter: `drop-shadow(0 0 4px ${COLORS.proxy})` }} />
                </g>
              );
            }
            return segments;
          })()}

          <circle cx="50%" cy={expanded ? "90%" : "85%"} r={proxyChain.length > 0 ? 8 : 6} fill="#ffffff" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
          {expanded && (
             <g transform="translate(0, 18)">
                <text x="50%" y="90%" fill="#ffffff" fontSize="9px" textAnchor="middle" fontFamily="inherit" opacity="0.9" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
                  KALI-GATEWAY
                </text>
                {proxyChain.length > 0 && (
                  <text x="50%" y="90%" dy="12" fill={COLORS.proxy} fontSize="7px" textAnchor="middle" fontFamily="inherit" opacity="0.9">
                    [{proxyChain.length} HOPS ACTIVE]
                  </text>
                )}
             </g>
          )}

          {Object.keys(world).filter(k => k !== 'local' && !world[k].isHidden).map(ip => {
            const node = world[ip];
            const isProxy = proxies.includes(ip);
            const isTarget = isContractTarget(ip); // <-- Check if it's a target
            const infectionVisual = getInfectionVisual(node);
            let nodeColor = node.sec === 'high' ? COLORS.danger : COLORS.mapNode;
            
            // Color override logic
            if (infectionVisual.color) nodeColor = infectionVisual.color;
            else if (isTarget) nodeColor = COLORS.warning; // Highlight target in yellow
            else if (isProxy) nodeColor = COLORS.proxy;
            else if (botnet.includes(ip)) nodeColor = COLORS.infected;
            else if (looted.includes(ip)) nodeColor = COLORS.looted;
            
            const isActive = targetIP === ip;
            const isHovered = hoveredNode === ip;
            
            let r = expanded ? (isMobile ? (isProxy ? 10 : 8) : (isProxy ? 6 : 5)) : (isProxy ? 4 : 3);
            if (isTarget && expanded) r += 2; // Make target nodes slightly bigger
            const dimInactive = isHacking && !isActive && !isProxy && !botnet.includes(ip) && !infectionVisual.color;
            
            return (
              <g key={`nd-${ip}`} 
                style={{ cursor: 'crosshair', pointerEvents: 'all' }} 
                onClick={(e) => handleNodeClick(e, ip)} 
                onMouseEnter={() => expanded && setHoveredNode(ip)} 
                onMouseLeave={() => setHoveredNode(null)}
              >
                <svg x={node.x} y={node.y} style={{ overflow: 'visible' }}>
                  <g 
                    style={{ 
                      color: nodeColor,
                      opacity: dimInactive ? 0.3 : 1, 
                      transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease', 
                      transform: isHovered ? 'scale(1.8)' : 'scale(1)',
                      animation: infectionVisual.pulse ? 'infectPulse 0.9s ease-in-out infinite' : (!isHovered && !isActive ? 'nodeIdlePulse 4s infinite alternate' : 'none')
                    }}
                  >
                    {isActive && expanded && <circle cx="0" cy="0" r="12" fill="none" stroke={COLORS.primary} strokeWidth="1" className="data-stream" />}
                    {isProxy && <circle cx="0" cy="0" r={r + 4} fill="none" stroke={COLORS.proxy} strokeWidth="1.5" opacity="0.4" className="proxy-stream" />}
                    {infectionVisual.ring && <circle cx="0" cy="0" r={r + 5} fill="none" stroke={infectionVisual.ring} strokeWidth="1.5" opacity={node?.infection?.state === 'quarantined' ? 0.8 : 0.55} strokeDasharray={node?.infection?.state === 'quarantined' ? '3 3' : '4 6'} style={{ animation: node?.infection?.state === 'quarantined' ? 'quarantinePulse 1.1s ease-in-out infinite' : undefined }} />}
                    
                    {/* Extra target ring */}
                    {isTarget && !isProxy && !infectionVisual.ring && <circle cx="0" cy="0" r={r + 3} fill="none" stroke={COLORS.warning} strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />}
                    
                    <circle cx="0" cy="0" r={r} fill={nodeColor} opacity={node?.infection?.state === 'dead' ? 0.35 : 1} />
                    
                    {expanded && r >= 5 && <circle cx="0" cy="0" r={r/2} fill="#111" opacity={node?.infection?.state === 'dead' ? 0.35 : 0.8} />}
                    {expanded && infectionVisual.label && !isMobile && <text x="0" y={-12 - r} fill={nodeColor} fontSize="6px" textAnchor="middle" fontFamily="inherit" opacity="0.95" style={{ fontWeight: 'bold', letterSpacing: '1px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}>{infectionVisual.label}</text>}
                    {expanded && isProxy && (
                      <text x="0" y={isMobile ? -16 : -12} fill="#fff" fontSize={isMobile ? '9px' : '6px'} textAnchor="middle" fontFamily="inherit" style={{ fontWeight: 'bold', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }}>
                          HOP {proxyChain.indexOf(ip) + 1}
                      </text>
                    )}
                    {expanded && isMobile && !isProxy && (
                      <text x="0" y={r + 14} fill={nodeColor} fontSize="8px" textAnchor="middle" fontFamily="inherit" opacity="0.9" style={{ fontWeight: 'bold', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))', letterSpacing: '0.5px' }}>
                        {(node.org?.orgName || node.name || ip).slice(0, 16)}
                      </text>
                    )}
                  </g>
                </svg>
              </g>
            );
          })}
        </g>
      </svg>

      {!expanded && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', zIndex: 12, pointerEvents: 'none' }}>
          <span style={{ fontSize: '9px', color: COLORS.textDim, letterSpacing: '1px' }}>
            SUBNET: <span style={{ color: COLORS.primary }}>{currentRegion.toUpperCase()}</span> ▸ <span style={{ color: COLORS.primary }}>{nodeCount}</span> NODES
            {proxyChain.length > 0 && <> | <span style={{ color: COLORS.proxy }}>{proxyChain.length}</span> HOPS</>}
            {botnet.length > 0 && <> | <span style={{ color: COLORS.infected }}>{botnet.length}</span> C2</>}
          </span>
          <span style={{ fontSize: '8px', color: COLORS.textDim, opacity: 0.6 }}>CLICK TO EXPAND</span>
        </div>
      )}

      <button onClick={(e) => { e.stopPropagation(); toggleExpand(); }} style={{
        position: 'absolute', top: isMobile ? '12px' : '6px', right: isMobile ? '12px' : '8px', background: 'rgba(0,0,0,0.8)', border: `1px solid ${COLORS.borderActive}`,
        color: COLORS.textDim, fontSize: isMobile ? '13px' : '10px', cursor: 'pointer', fontFamily: 'inherit', zIndex: 15, padding: isMobile ? '10px 16px' : '4px 8px', borderRadius: '3px', fontWeight: 'bold', letterSpacing: '1px',
        WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
      }}>
        {expanded ? 'X CLOSE MAP' : '▼ OPEN MAP'}
      </button>

      {/* WiFi Layer Toggle */}
      {expanded && wifiNetworks.length > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setShowWifiLayer(!showWifiLayer); }} style={{
          position: 'absolute', top: isMobile ? '12px' : '6px', left: isMobile ? '12px' : '8px', 
          background: showWifiLayer ? `${COLORS.secondary}30` : 'rgba(0,0,0,0.8)', 
          border: `1px solid ${showWifiLayer ? COLORS.secondary : COLORS.borderActive}`,
          color: showWifiLayer ? COLORS.secondary : COLORS.textDim, 
          fontSize: isMobile ? '13px' : '10px', cursor: 'pointer', fontFamily: 'inherit', zIndex: 15, 
          padding: isMobile ? '10px 16px' : '4px 8px', borderRadius: '3px', fontWeight: 'bold', letterSpacing: '1px',
          WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
        }}>
          📶 {showWifiLayer ? 'NODES' : 'WIFI'}
        </button>
      )}

      {/* WiFi Networks Overlay */}
      {expanded && showWifiLayer && wifiNetworks.length > 0 && (
        <div style={{ position: 'absolute', top: isMobile ? '60px' : '40px', left: '10px', right: '10px', zIndex: 13, pointerEvents: 'auto' }}>
          <div style={{ 
            background: 'rgba(0,0,0,0.9)', 
            border: `1px solid ${COLORS.secondary}40`, 
            borderRadius: '4px', 
            padding: '12px',
            maxHeight: isMobile ? '60vh' : '250px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '10px', color: COLORS.secondary, letterSpacing: '2px', marginBottom: '10px', borderBottom: `1px solid ${COLORS.secondary}30`, paddingBottom: '6px' }}>
              📶 WIRELESS NETWORKS IN RANGE ({wifiNetworks.length})
            </div>
            {wifiNetworks.map((net, idx) => (
              <div 
                key={idx}
                onClick={() => onWifiNetworkSelect && onWifiNetworkSelect(net)}
                onMouseEnter={() => setHoveredWifi(idx)}
                onMouseLeave={() => setHoveredWifi(null)}
                style={{
                  padding: '8px 10px',
                  marginBottom: '6px',
                  background: hoveredWifi === idx ? `${COLORS.secondary}15` : 'transparent',
                  border: `1px solid ${net.breached ? COLORS.secondary : wifiState.targetBssid === net.bssid ? COLORS.warning : COLORS.border}40`,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: net.breached ? COLORS.secondary : COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>
                    {net.breached ? '✓ ' : ''}{net.essid}
                  </span>
                  <span style={{ 
                    color: net.enc === 'OPEN' ? COLORS.secondary : net.enc === 'WEP' ? COLORS.warning : COLORS.text, 
                    fontSize: '10px' 
                  }}>
                    {net.enc}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: COLORS.textDim, marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>BSSID: {net.bssid}</span>
                  <span>CH:{net.ch} | {net.pwr}dBm</span>
                </div>
                {net.target && (
                  <div style={{ 
                    marginTop: '6px', 
                    padding: '3px 6px', 
                    background: COLORS.danger, 
                    color: COLORS.bgDark, 
                    fontSize: '9px', 
                    fontWeight: 'bold',
                    display: 'inline-block',
                    borderRadius: '2px'
                  }}>
                    HIGH VALUE TARGET
                  </div>
                )}
                {wifiState.connected && net.bssid === wifiState.targetBssid && (
                  <div style={{ 
                    marginTop: '6px', 
                    padding: '3px 6px', 
                    background: COLORS.secondary, 
                    color: COLORS.bgDark, 
                    fontSize: '9px', 
                    fontWeight: 'bold',
                    display: 'inline-block',
                    borderRadius: '2px'
                  }}>
                    CONNECTED - INTERNAL ACCESS
                  </div>
                )}
              </div>
            ))}
            {wifiState.connected && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: `${COLORS.secondary}10`, 
                border: `1px solid ${COLORS.secondary}40`,
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '10px', color: COLORS.secondary, letterSpacing: '1px', marginBottom: '6px' }}>
                  ⚡ INTERNAL NETWORK ACCESS
                </div>
                <div style={{ fontSize: '11px', color: COLORS.text }}>
                  You're inside the corporate network via WiFi. Internal nodes are now visible on the main map.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {expanded && hoveredNode && world[hoveredNode] && (
        <div style={{
          position: 'absolute', top: isMobile ? '50px' : '16px', left: isMobile ? '10px' : '16px', right: isMobile ? '10px' : 'auto',
          background: 'rgba(8,12,18,0.95)', border: `1px solid ${isContractTarget(hoveredNode) ? COLORS.warning : COLORS.primary}60`,
          padding: isMobile ? '14px 16px' : '12px 14px', fontSize: isMobile ? '13px' : '10px', pointerEvents: isMobile ? 'auto' : 'none',
          color: COLORS.text, minWidth: '180px', borderRadius: '4px',
          zIndex: 14, backdropFilter: 'blur(6px)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 15px ${isContractTarget(hoveredNode) ? COLORS.warning : COLORS.primary}20`,
          opacity: isHacking ? 0.3 : 1, 
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ color: isContractTarget(hoveredNode) ? COLORS.warning : COLORS.primary, fontWeight: 'bold', marginBottom: '6px', fontSize: isMobile ? '15px' : '12px', letterSpacing: '1px', borderBottom: `1px solid ${COLORS.borderActive}`, paddingBottom: '4px' }}>
            {world[hoveredNode].name || world[hoveredNode].org?.orgName || 'Unknown'}
          </div>
          
          {/* Target Warning */}
          {isContractTarget(hoveredNode) && (
            <div style={{ color: COLORS.bgDark, background: COLORS.warning, padding: '4px 6px', borderRadius: '2px', display: 'block', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px', textAlign: 'center' }}>
              [!] CONTRACT TARGET
            </div>
          )}

          <div style={{ margin: '4px 0' }}><span style={{ color: COLORS.textDim }}>IP:</span> <span style={{ color: COLORS.ip }}>{hoveredNode}</span></div>
          <div style={{ margin: '4px 0' }}><span style={{ color: COLORS.textDim }}>SEC:</span> {inventory.includes('Scanner') ? world[hoveredNode].sec?.toUpperCase() : '[ENCRYPTED]'}</div>
          {world[hoveredNode].org && <div style={{ margin: '4px 0' }}><span style={{ color: COLORS.textDim }}>TYPE:</span> {world[hoveredNode].org.type?.toUpperCase()}</div>}
          {world[hoveredNode].infection?.state && world[hoveredNode].infection.state !== 'idle' && (
            <div style={{ margin: '6px 0 4px 0' }}>
              <span style={{ color: COLORS.textDim }}>STATE:</span> <span style={{ color: getInfectionVisual(world[hoveredNode]).color || COLORS.text }}>{getInfectionVisual(world[hoveredNode]).label}</span>
            </div>
          )}
          
          {botnet.includes(hoveredNode) && <div style={{ color: COLORS.bgDark, background: COLORS.infected, padding: '2px 4px', borderRadius: '2px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>SLIVER C2 ACTIVE</div>}
          {proxies.includes(hoveredNode) && <div style={{ color: COLORS.bgDark, background: COLORS.proxy, padding: '2px 4px', borderRadius: '2px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>PROXY TUNNEL ACTIVE</div>}
          
          {isMobile && (
            <button onClick={(e) => { e.stopPropagation(); selectNodeFromMap(hoveredNode); setHoveredNode(null); }} style={{
              display: 'block', width: '100%', marginTop: '10px', padding: '12px',
              background: `${COLORS.primary}20`, border: `1px solid ${COLORS.primary}`,
              color: COLORS.primary, fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold',
              borderRadius: '4px', cursor: 'pointer', letterSpacing: '1px',
              WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            }}>📡 NMAP SCAN</button>
          )}
        </div>
      )}
      
      {expanded && !isHacking && (
         <div style={{ position: 'absolute', bottom: '12px', right: '12px', color: COLORS.textDim, fontSize: '9px', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '4px', letterSpacing: '1px', zIndex: 12 }}>
            {isMobile ? 'DRAG TO PAN • PINCH TO ZOOM • TAP NODE FOR INFO' : 'SCROLL TO ZOOM • DRAG TO PAN'}
         </div>
      )}
    </div>
  );
}
