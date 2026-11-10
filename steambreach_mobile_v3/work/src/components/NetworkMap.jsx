import React, { useState } from 'react';
import GeoNetworkMap from './GeoNetworkMap';
import LegacyNetworkMap from './LegacyNetworkMap';
import { COLORS } from '../constants/gameConstants';

// Presentation-only wrapper: game world, rival AI and saves are passed through unchanged.
const btn = (active, light) => ({ background: active ? '#147456' : light ? '#fff' : '#22333d',
  color: active ? '#fff' : light ? '#23363e' : '#d9e4e6', border: `1px solid ${active ? '#2fa582' : light ? '#c8d4d5' : '#45616d'}`,
  borderRadius: 5, padding: '7px 9px', fontSize: 10, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' });

export default function NetworkMap(props) {
  const { world = {}, rivals = [], expanded, toggleExpand, isMobile = false, currentRegion = 'us-gov' } = props;
  const [view, setView] = useState('territory');
  const [showNeutral, setShowNeutral] = useState(true);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('hexoverride-map-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } });
  const light = theme === 'light';
  const setMapTheme = next => { setTheme(next); try { localStorage.setItem('hexoverride-map-theme', next); } catch { /* storage optional */ } };
  const hostCount = Object.keys(world).filter(ip => ip !== 'local').length; // Global saved network; regional counts are shown on each map
  const activeRivals = rivals.filter(r => r.status !== 'destroyed').length;
  if (!expanded) return <div role="button" tabIndex={0} onClick={toggleExpand} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); }
  }} style={{ height: isMobile ? 60 : 80, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', background: 'linear-gradient(105deg,#0a1c24,#172c31)', border: `1px solid ${COLORS.border}`,
    color: '#b7eee1', padding: '0 12px', fontSize: 11 }}>
    <strong>⌖ {currentRegion.toUpperCase()} // GEO NETWORK · {hostCount} HOSTS · {activeRivals} RIVALS</strong><span>▼ OPEN MAP</span>
  </div>;
  return <div style={{ flex: 1, minWidth: 0, height: isMobile ? '100%' : 510, position: isMobile ? 'fixed' : 'relative',
    inset: isMobile ? 0 : undefined, zIndex: isMobile ? 200 : undefined, display: 'flex', flexDirection: 'column',
    background: light ? '#f4f7f7' : '#101e26', color: light ? '#1d323d' : '#e5eeee', overflow: 'hidden', border: `1px solid ${light ? '#c8d4d8' : '#2f535c'}` }}>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', padding: '7px 9px',
      background: light ? '#eaf0f1' : '#122730', borderBottom: `1px solid ${light ? '#c8d4d8' : '#375561'}` }}>
      <strong style={{ fontSize: 11, marginRight: 4, color: light ? '#17694f' : '#70e4b8' }}>HEXOVERRIDE / {currentRegion.toUpperCase()}</strong>
      <button style={btn(view === 'territory', light)} onClick={() => setView('territory')}>TERRITORY</button>
      <button style={btn(view === 'network', light)} onClick={() => setView('network')}>NETWORK MAP</button>
      <button style={btn(view === 'technical', light)} onClick={() => setView('technical')}>TECH SCAN</button>
      <button style={btn(false, light)} onClick={() => setMapTheme(light ? 'dark' : 'light')} aria-label="Switch map light and dark mode">
        {light ? '☾ DARK' : '☀ LIGHT'}
      </button>
      <button style={{ ...btn(false, light), marginLeft: 'auto' }} onClick={toggleExpand}>✕ CLOSE</button>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      {view === 'technical' ? <LegacyNetworkMap {...props} expanded toggleExpand={() => setView('network')}/> :
        <GeoNetworkMap {...props} view={view} theme={theme} showNeutral={showNeutral}/>}
      {view !== 'technical' && <div style={{ position: 'absolute', bottom: 7, left: 9, pointerEvents: 'none' }}>
        <span style={{ background: light ? '#ffffffdc' : '#15262de5', color: light ? '#39515c' : '#abc7c9',
          borderRadius: 4, padding: 4, fontSize: 9 }}>Real-world streets · Fictional network locations</span>
      </div>}
      {view === 'network' && <button style={{ ...btn(showNeutral, light), position: 'absolute', top: 9, right: 65 }}
        onClick={() => setShowNeutral(v => !v)}>{showNeutral ? 'ALL HOSTS' : 'OWNED ONLY'}</button>}
    </div>
  </div>;
}
