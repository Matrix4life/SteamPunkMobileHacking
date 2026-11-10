import React, { useEffect, useMemo, useRef, useState } from 'react';

// Visual-only projection of fictional game nodes onto worldwide street cartography.
// Never store coordinates in game state: existing saves, targets, links and ownership remain untouched.
const TILE = 256;
// Geographic locations are visual anchors for fictional game assets, not IP geolocation.
// Travel regions are sourced from HEXOVERRIDE's existing `currentRegion` state.
const REGION_MAPS = {
  'us-gov': { title: 'US GOVERNMENT GRID', center: [-96.5, 39.5], zoom: 4, hubs: [
    ['Washington, DC', -77.0369, 38.9072], ['Arlington', -77.1068, 38.8799],
    ['Philadelphia', -75.1652, 39.9526], ['New York', -74.0060, 40.7128],
    ['Boston', -71.0589, 42.3601], ['Chicago', -87.6298, 41.8781],
    ['Atlanta', -84.3880, 33.7490], ['Denver', -104.9903, 39.7392],
    ['Los Angeles', -118.2437, 34.0522], ['San Francisco', -122.4194, 37.7749],
    ['Seattle', -122.3321, 47.6062], ['Dallas', -96.7970, 32.7767]
  ] },
  'ru-darknet': { title: 'RUSSIAN DARKNET MESH', center: [75, 58], zoom: 3, hubs: [
    ['Moscow', 37.6173, 55.7558], ['St. Petersburg', 30.3351, 59.9343],
    ['Kazan', 49.1064, 55.7961], ['Nizhny Novgorod', 44.0020, 56.3269],
    ['Yekaterinburg', 60.5975, 56.8389], ['Novosibirsk', 82.9204, 55.0302],
    ['Omsk', 73.3682, 54.9885], ['Krasnoyarsk', 92.8526, 56.0153],
    ['Irkutsk', 104.2807, 52.2869], ['Vladivostok', 131.8869, 43.1155]
  ] },
  'cn-financial': { title: 'CHINESE FINANCIAL GRID', center: [105, 35], zoom: 4, hubs: [
    ['Beijing', 116.4074, 39.9042], ['Shanghai', 121.4737, 31.2304],
    ['Shenzhen', 114.0579, 22.5431], ['Guangzhou', 113.2644, 23.1291],
    ['Hangzhou', 120.1551, 30.2741], ['Nanjing', 118.7969, 32.0603],
    ['Chengdu', 104.0665, 30.5728], ['Wuhan', 114.3055, 30.5928],
    ['Chongqing', 106.5516, 29.5630], ['Xi’an', 108.9398, 34.3416],
    ['Tianjin', 117.2000, 39.1333], ['Hong Kong', 114.1694, 22.3193]
  ] },
  'eu-central': { title: 'EUROPEAN CENTRAL GRID', center: [11, 50], zoom: 5, hubs: [
    ['Frankfurt', 8.6821, 50.1109], ['Berlin', 13.4050, 52.5200],
    ['Paris', 2.3522, 48.8566], ['Brussels', 4.3517, 50.8503],
    ['Amsterdam', 4.9041, 52.3676], ['Warsaw', 21.0122, 52.2297],
    ['Vienna', 16.3738, 48.2082], ['Prague', 14.4378, 50.0755],
    ['Zurich', 8.5417, 47.3769], ['Milan', 9.1900, 45.4642],
    ['Madrid', -3.7038, 40.4168], ['Stockholm', 18.0632, 59.3293]
  ] },
};
const REGIONS = Object.keys(REGION_MAPS);
const hubsFor = region => (REGION_MAPS[region] || REGION_MAPS['us-gov']).hubs.map(([name, lon, lat]) => ({ name, lon, lat }));
// Rival and legacy nodes can be tagged `rival` or `local`, not a travel region.
// Use their original map positions to choose a presentation-only region.
const regionForNode = n => {
  if (REGIONS.includes(n.region)) return n.region;
  const bySubnet = { fed: 'us-gov', corp: 'eu-central', dark: 'ru-darknet', fin: 'cn-financial' };
  if (bySubnet[n.subnet]) return bySubnet[n.subnet];
  const x = parseFloat(n.x), y = parseFloat(n.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    const centers = [ ['us-gov',360,250], ['ru-darknet',300,770], ['cn-financial',1250,760], ['eu-central',1210,235] ];
    return centers.sort((a,b) => (x-a[1])**2+(y-a[2])**2-( (x-b[1])**2+(y-b[2])**2 ))[0][0];
  }
  return 'us-gov';
};
const PALETTE = ['#ed745d','#d4a14e','#3ca9bd','#a26ac9','#d65d8c','#a88a49','#56a589','#647bc6','#bd7995','#c49f4c'];
const MAX_LAT = 85.05112878;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const colorOf = (id, rivals) => id === 'player' ? '#22ae76' : PALETTE[Math.max(0, rivals.findIndex(r => String(r.id) === String(id))) % PALETTE.length];
const lonX = (lon, zoom) => (lon + 180) / 360 * TILE * (2 ** zoom);
const latY = (lat, zoom) => { const rad = clamp(lat, -MAX_LAT, MAX_LAT) * Math.PI / 180; return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * TILE * (2 ** zoom); };
const xyLon = (x, zoom) => x / (TILE * 2 ** zoom) * 360 - 180;
const xyLat = (y, zoom) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / (TILE * 2 ** zoom)))) * 180 / Math.PI;
const parsePosition = (v, fallback) => {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return clamp(typeof v === 'string' && v.includes('%') ? n / 100 : (n <= 100 ? n / 100 : n / 1000), 0.01, 0.99);
};
const hash = s => String(s).split('').reduce((v, c) => (v * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
const locForNode = (n, ip, hubs) => {
  const x = parsePosition(n.x, (hash(ip) % 1000) / 1000);
  const y = parsePosition(n.y, (hash(ip + ':y') % 1000) / 1000);
  // Stable per-IP city assignment; existing game topology/ownership are never modified.
  const hubIndex = hash(ip + ':hub') % hubs.length;
  const hub = hubs[hubIndex];
  const cosLat = Math.max(0.4, Math.cos(hub.lat * Math.PI / 180));
  return { lon: hub.lon + (x - 0.5) * 0.13 / cosLat,
    lat: hub.lat + (y - 0.5) * 0.10, hubIndex };
};
const styleButton = (active, light) => ({ padding: '7px 10px', cursor: 'pointer', fontSize: 11, borderRadius: 6,
  color: active ? '#fff' : light ? '#284049' : '#c3d2d3', background: active ? '#146c55' : light ? '#fff' : '#23333c',
  border: `1px solid ${active ? '#278a6d' : light ? '#cad6d7' : '#485f68'}`, fontFamily: 'inherit' });

export default function GeoNetworkMap({ world = {}, rivals = [], rivalConflicts = [], botnet = [], targetIP,
  selectNodeFromMap = () => {}, onRivalCommand = () => {}, view = 'territory', theme = 'dark', showNeutral = true,
  isMobile = false, currentRegion = 'us-gov' }) {
  const light = theme === 'light';
  const region = REGION_MAPS[currentRegion] ? currentRegion : 'us-gov';
  const regionConfig = REGION_MAPS[region];
  const hubs = useMemo(() => hubsFor(region), [region]);
  const hostRef = useRef(null);
  const dragRef = useRef(null);
  const [size, setSize] = useState({ w: 720, h: 480 });
  const [camera, setCamera] = useState(() => ({ lon: REGION_MAPS[currentRegion]?.center[0] ?? -96.5, lat: REGION_MAPS[currentRegion]?.center[1] ?? 39.5, zoom: REGION_MAPS[currentRegion]?.zoom ?? 4 }));
  useEffect(() => { setCamera({ lon: regionConfig.center[0], lat: regionConfig.center[1], zoom: regionConfig.zoom }); setSelectedIP(null); setSelectedOwner(null); setSelectedFaction(null); }, [region]);
  const [selectedIP, setSelectedIP] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showLinks, setShowLinks] = useState(false);
  const [tileWarning, setTileWarning] = useState(false);
  const palette = useMemo(() => ({ foreground: light ? '#18323d' : '#e5eff1', panel: light ? '#fffffff2' : '#13232df2', border: light ? '#d1dadd' : '#3a5965' }), [light]);

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const observer = new ResizeObserver(entries => { const rect = entries[0].contentRect; setSize({ w: Math.max(rect.width, 1), h: Math.max(rect.height, 1) }); });
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  const nodes = useMemo(() => Object.entries(world).filter(([ip, n]) => ip !== 'local' && n && !n.isHidden && regionForNode(n) === region)
    .map(([ip, n]) => ({ ...n, ip, ...locForNode(n, ip, hubs) })), [world, region, hubs]);
  const active = nodes.find(n => n.ip === selectedIP);
  const owners = useMemo(() => {
    const data = new Map();
    nodes.forEach(n => { if (!n.owner) return; const id = String(n.owner); if (!data.has(id)) data.set(id, []); data.get(id).push(n); });
    return data;
  }, [nodes]);
  const centerPx = { x: lonX(camera.lon, camera.zoom), y: latY(camera.lat, camera.zoom) };
  const project = (lon, lat) => {
    const worldWidth = TILE * (2 ** camera.zoom);
    const dx = lonX(lon, camera.zoom) - centerPx.x;
    const wrapped = ((dx + worldWidth / 2) % worldWidth + worldWidth) % worldWidth - worldWidth / 2;
    return { x: wrapped + size.w / 2, y: latY(lat, camera.zoom) - centerPx.y + size.h / 2 };
  };
  const moveBy = (dx, dy) => setCamera(prev => {
    const x = lonX(prev.lon, prev.zoom) - dx;
    const y = latY(prev.lat, prev.zoom) - dy;
    return { ...prev, lon: ((xyLon(x, prev.zoom) + 540) % 360) - 180, lat: clamp(xyLat(y, prev.zoom), -80, 80) };
  });
  const zoomTo = next => setCamera(prev => ({ ...prev, zoom: clamp(next, 2, 16) }));
  const visitHub = hub => setCamera({ lon: hub.lon, lat: hub.lat, zoom: 11 });
  const zoomOutRegion = () => setCamera({ lon: regionConfig.center[0], lat: regionConfig.center[1], zoom: regionConfig.zoom });
  const zoomRef = useRef(camera.zoom);
  zoomRef.current = camera.zoom;
  const wheel = e => { e.preventDefault(); zoomTo(zoomRef.current + (e.deltaY < 0 ? 1 : -1)); };
  useEffect(() => {
    const element = hostRef.current;
    if (!element) return undefined;
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, []);
  const pointerDown = e => { if (e.button !== 0 && e.pointerType === 'mouse') return; dragRef.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const pointerMove = e => { if (!dragRef.current) return; const dx = e.clientX - dragRef.current.x, dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY }; moveBy(dx, dy); };
  const pointerUp = e => { dragRef.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); };
  const [selectedFaction, setSelectedFaction] = useState(null);
  const selectNode = n => { setSelectedIP(n.ip); setSelectedOwner(n.owner ? String(n.owner) : null); selectNodeFromMap(n.ip); };
  const tileZoom = camera.zoom;
  const tileMax = 2 ** tileZoom;
  const leftWorld = centerPx.x - size.w / 2;
  const topWorld = centerPx.y - size.h / 2;
  const tiles = [];
  for (let tx = Math.floor(leftWorld / TILE); tx <= Math.floor((leftWorld + size.w) / TILE); tx++) {
    for (let ty = Math.floor(topWorld / TILE); ty <= Math.floor((topWorld + size.h) / TILE); ty++) {
      if (ty < 0 || ty >= tileMax) continue;
      tiles.push({ tx, ty, left: tx * TILE - leftWorld, top: ty * TILE - topWorld });
    }
  }
  const tileKind = light ? 'light_all' : 'dark_all';
  const owned = [...owners.entries()].flatMap(([id, ns]) => hubs.map((hub, hubIndex) => {
    const local = ns.filter(n => n.hubIndex === hubIndex);
    if (!local.length) return null;
    const pos = project(hub.lon, hub.lat);
    return { id, ns: local, x: pos.x, y: pos.y, color: colorOf(id, rivals), rival: rivals.find(r => String(r.id) === id) };
  }).filter(Boolean));
  const cityGroups = hubs.map((hub, i) => ({ ...hub, nodes: nodes.filter(n => n.hubIndex === i) })).filter(hub => hub.nodes.length);
  const globalView = camera.zoom <= Math.max(5, regionConfig.zoom + 1);
  const conflicts = (rivalConflicts || []).map(pair => [owned.find(o => o.id === String(pair[0])), owned.find(o => o.id === String(pair[1]))]).filter(pair => pair[0] && pair[1]);
  const cardStyle = { background: palette.panel, border: `1px solid ${palette.border}`, color: palette.foreground, boxShadow: '0 4px 18px #0003', borderRadius: 7 };
  return <div ref={hostRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 220, overflow: 'hidden',
    background: light ? '#ebe8df' : '#1c272e', color: palette.foreground, userSelect: 'none', touchAction: 'none', fontFamily: 'system-ui,sans-serif' }}
    onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {tiles.map(t => <img key={`${tileKind}-${tileZoom}-${t.tx}-${t.ty}`} alt="" draggable={false}
        src={`https://a.basemaps.cartocdn.com/${tileKind}/${tileZoom}/${((t.tx % tileMax) + tileMax) % tileMax}/${t.ty}.png`}
        onError={() => setTileWarning(true)} onLoad={() => setTileWarning(false)}
        style={{ position: 'absolute', left: t.left, top: t.top, width: TILE + 1, height: TILE + 1, maxWidth: 'none' }} />)}
    </div>
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <defs><filter id="geo-soft"><feGaussianBlur stdDeviation="13"/></filter></defs>
      {view === 'territory' && !globalView && nodes.filter(n => n.owner).map(n => {
        const p = project(n.lon, n.lat); const c = colorOf(n.owner, rivals);
        return <g key={`zone-${n.ip}`}><circle cx={p.x} cy={p.y} r="43" fill={c} opacity={light ? '.16' : '.23'} filter="url(#geo-soft)"/>
          <circle cx={p.x} cy={p.y} r="29" fill={c} opacity=".10" stroke={c} strokeWidth="1.8" strokeOpacity=".6"/></g>;
      })}
      {view === 'network' && !globalView && showLinks && nodes.map(n => {
        const parent = nodes.find(other => other.ip === n.parentIP);
        if (!parent) return null;
        const a = project(n.lon, n.lat), b = project(parent.lon, parent.lat);
        return <line key={`link-${n.ip}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={n.owner ? colorOf(n.owner, rivals) : '#6098ab'} strokeWidth="2.5" opacity=".8" strokeDasharray="6 3"/>;
      })}
      {view === 'territory' && !globalView && conflicts.map(([a, b], i) => <line key={`war-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f04450" strokeWidth="3" strokeDasharray="6 6" opacity=".85"/>)}
    </svg>
    {globalView && cityGroups.map(hub => {
      const p = project(hub.lon, hub.lat);
      if (p.x < -80 || p.x > size.w + 80 || p.y < -50 || p.y > size.h + 50) return null;
      const ownerCounts = new Map();
      hub.nodes.forEach(n => { if(n.owner) ownerCounts.set(n.owner, (ownerCounts.get(n.owner) || 0) + 1); });
      const topOwner = [...ownerCounts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0];
      const c = topOwner ? colorOf(topOwner, rivals) : '#427f91';
      return <button key={`hub-${hub.name}`} title={`Explore ${hub.name} · ${hub.nodes.length} simulated hosts`}
        onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); visitHub(hub); }}
        style={{ position:'absolute', left:p.x, top:p.y, transform:'translate(-50%,-50%)', zIndex:4,
          background:light?'#fffffff0':'#142a35ee', border:`2px solid ${c}`, borderRadius:16,
          boxShadow:'0 2px 9px #0007', cursor:'pointer', color:light?'#1d3038':'#e9f7f5',
          padding:'5px 9px', textAlign:'center', fontSize:10, fontWeight:700, whiteSpace:'nowrap' }}>
        <span style={{ color:c }}>●</span> {hub.name}<br/><small style={{ opacity:.75 }}>{hub.nodes.length} HOSTS</small>
      </button>;
    })}
    {!globalView && nodes.filter(n => view === 'network' ? (showNeutral || n.owner) : Boolean(n.owner) || showNeutral).map(n => {
      const p = project(n.lon, n.lat);
      if (p.x < -60 || p.x > size.w + 60 || p.y < -60 || p.y > size.h + 60) return null;
      const selected = n.ip === selectedIP || n.ip === targetIP;
      const color = n.owner ? colorOf(n.owner, rivals) : '#6b8694';
      return <button key={n.ip} title={`${n.name || n.org?.orgName || 'Host'} · ${n.ip} · simulated location`}
        onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); selectNode(n); }}
        style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-100%)', background: color, color: '#fff',
          width: selected ? 25 : n.isCore ? 22 : 17, height: selected ? 25 : n.isCore ? 22 : 17,
          borderRadius: '50% 50% 50% 2px', rotate: '-45deg', border: `2px solid ${selected ? '#fff0a8' : '#f9fbfbee'}`,
          cursor: 'pointer', boxShadow: selected ? `0 0 0 5px #ffc35555,0 2px 6px #0009` : '0 2px 6px #0008', zIndex: selected ? 6 : 3 }}>
        <span style={{ display: 'block', rotate: '45deg', fontSize: 9, lineHeight: '10px' }}>{botnet.includes(n.ip) ? '◆' : n.isCore ? '★' : '•'}</span>
      </button>;
    })}
    {view === 'territory' && !globalView && owned.map(o => <button key={`owner-${o.id}`} onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); setSelectedFaction(o.id); setSelectedOwner(o.id); }}
      style={{ position: 'absolute', left: o.x, top: o.y - 38, transform: 'translate(-50%,-50%)', border: `1px solid ${o.color}`,
        borderRadius: 5, background: light ? '#ffffffed' : '#10202bea', color: light ? '#21343d' : '#f0f7f8', padding: '3px 7px',
        fontWeight: 800, fontSize: 10, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: '0 2px 6px #0005', zIndex: 5 }}>
      <span style={{ color: o.color }}>●</span> {o.id === 'player' ? 'YOU' : o.rival?.handle || 'RIVAL'} · {o.ns.length}
    </button>)}
    <div style={{ ...cardStyle, position: 'absolute', left: 9, top: 9, padding: '7px 9px', fontSize: 10, pointerEvents: 'none', zIndex: 8 }}>
      <strong>{regionConfig.title} // {view === 'network' ? 'HOSTS' : 'TURF'}</strong>
      <div style={{ opacity: .75 }}>FICTIONAL HOST LOCATIONS · {nodes.length} HOSTS · {globalView ? 'SELECT A CITY' : 'CITY DETAIL'}</div>
    </div>
    <div style={{ ...cardStyle, position: 'absolute', right: 9, top: 9, padding: 5, display: 'grid', gap: 5, zIndex: 9 }}>
      <button aria-label="Zoom in" style={styleButton(false, light)} onPointerDown={e => e.stopPropagation()} onClick={() => zoomTo(camera.zoom + 1)}>＋</button>
      <button aria-label="Zoom out" style={styleButton(false, light)} onPointerDown={e => e.stopPropagation()} onClick={() => zoomTo(camera.zoom - 1)}>－</button>
      <button title="Return to current travel territory" style={styleButton(false, light)} onPointerDown={e => e.stopPropagation()}
        onClick={zoomOutRegion}>⌖</button>
    </div>
    {view === 'network' && !globalView && <div style={{ ...cardStyle, position: 'absolute', left: 9, top: 60, padding: 6, zIndex: 8 }}>
      <button onPointerDown={e => e.stopPropagation()} style={styleButton(showLinks, light)} onClick={() => setShowLinks(v => !v)}>
        {showLinks ? 'HIDE LINKS' : 'SHOW REAL LINKS'}
      </button>
    </div>}
    {!globalView && (active || selectedOwner || selectedFaction) && <div onPointerDown={e => e.stopPropagation()} style={{ ...cardStyle,
      position: 'absolute', left: 9, bottom: 30, maxWidth: isMobile ? '70%' : 285, padding: 10, fontSize: 12, zIndex: 10 }}>
      <button style={{ float: 'right', ...styleButton(false, light), padding: '0 4px' }} onClick={() => { setSelectedIP(null); setSelectedOwner(null); setSelectedFaction(null); }}>×</button>
      {active ? <><strong>{active.name || active.org?.orgName || 'Network host'}</strong>
        <div>IP: {active.ip}</div><div>OWNER: {active.owner === 'player' ? 'YOU' : rivals.find(r => String(r.id) === String(active.owner))?.handle || 'UNCLAIMED'}</div>
        <div style={{ opacity: .7 }}>Virtual target · map position is fictional</div>
        <div style={{ color: '#169d75', fontWeight: 700 }}>TARGET SELECTED</div></> : <><strong>{selectedOwner === 'player' ? 'YOUR TERRITORY' : rivals.find(r => String(r.id) === selectedOwner)?.handle || 'RIVAL TERRITORY'}</strong>
          <div>{owners.get(selectedOwner)?.length || 0} controlled hosts</div>
          {selectedOwner !== 'player' && rivals.find(r => String(r.id) === selectedOwner) && <button
            style={{ ...styleButton(true, light), marginTop: 4 }} onClick={() => onRivalCommand(`dossier ${rivals.find(r => String(r.id) === selectedOwner).handle}`)}>OPEN DOSSIER</button>}</>}
    </div>}
    {tileWarning && <div style={{ ...cardStyle, position: 'absolute', left: 8, bottom: 34, fontSize: 10, padding: 8, zIndex: 12 }}>
      Map tiles unavailable. Check internet connection or tile-provider access.
    </div>}
    <div style={{ position: 'absolute', right: 7, bottom: 5, fontSize: 10, textShadow: '0 1px 2px #fff', zIndex: 7,
      background: light ? '#ffffffcf' : '#172831db', color: light ? '#364a56' : '#d6e5e9', padding: '2px 5px', borderRadius: 3 }}>
      © OpenStreetMap contributors · © CARTO
    </div>
  </div>;
}
