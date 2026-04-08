import React, { useState, useRef } from 'react';
import { COLORS } from '../constants/gameConstants';

const RadialMenu = ({
  onCommand,
  onFillInput,
  onToggleMap,
  discoveredNodes = [],
  botnet = [],
  consumables = {},
  mapExpanded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subMenu, setSubMenu] = useState(null);
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  const buzz = (ms = 25) => {
    try { navigator.vibrate?.(ms); } catch {}
  };

  const tap = (cmd) => {
    buzz(30);
    onCommand(cmd);
    setIsOpen(false);
    setSubMenu(null);
  };

  const openSub = (menu) => {
    buzz(20);
    setSubMenu(subMenu === menu ? null : menu);
  };

  // Drag handlers
  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
    dragMoved.current = false;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;
    
    // Check if moved more than 5px (to distinguish drag from tap)
    if (Math.abs(newX - position.x) > 10 || Math.abs(newY - position.y) > 10) {
      dragMoved.current = true;
    }
    
    // Keep within bounds
    const boundedX = Math.max(60, Math.min(window.innerWidth - 60, newX));
    const boundedY = Math.max(100, Math.min(window.innerHeight - 60, newY));
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Only toggle menu if we didn't drag
    if (!dragMoved.current) {
      buzz(40);
      setIsOpen(!isOpen);
      setSubMenu(null);
    }
  };

  // Main menu items
  const mainItems = [
    { id: 'nmap', icon: '📡', label: 'NMAP', color: COLORS.primary, action: () => tap('nmap') },
    { id: 'map', icon: '🗺', label: 'MAP', color: COLORS.secondary, action: () => { buzz(25); onToggleMap(); setIsOpen(false); } },
    { id: 'exploit', icon: '⚡', label: 'EXPLOIT', color: COLORS.danger, action: () => openSub('exploit'), hasSub: true },
    { id: 'shop', icon: '🏪', label: 'SHOP', color: COLORS.warning, action: () => tap('shop') },
    { id: 'contracts', icon: '📋', label: 'JOBS', color: COLORS.chat, action: () => tap('contracts') },
    { id: 'botnet', icon: '🤖', label: 'BOTNET', color: COLORS.secondary, action: () => openSub('botnet'), hasSub: true, show: botnet.length > 0 },
    { id: 'travel', icon: '✈️', label: 'TRAVEL', color: COLORS.ip, action: () => tap('travel') },
    { id: 'save', icon: '💾', label: 'SAVE', color: COLORS.textDim, action: () => tap('save') },
  ].filter(item => item.show !== false);

  const unhackedTargets = discoveredNodes.filter(n => !n.hacked);
  const botnetNodes = discoveredNodes.filter(n => n.hasSliver);

  const getPosition = (index, total, radius = 85) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const styles = {
    trigger: {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: `translate(-50%, -50%) ${isOpen ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg)'}`,
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: isOpen ? COLORS.danger : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
      border: `2px solid ${isOpen ? COLORS.danger : COLORS.primary}`,
      boxShadow: `0 0 20px ${isOpen ? COLORS.danger : COLORS.primary}50, inset 0 0 15px rgba(0,0,0,0.3)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: 1000,
      transition: isDragging ? 'none' : 'all 0.3s ease',
      touchAction: 'none',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 998,
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'opacity 0.3s ease',
    },
    wheelCenter: {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translate(-50%, -50%)',
      width: '0',
      height: '0',
      zIndex: 999,
    },
    menuItem: (pos, color, delay) => ({
      position: 'absolute',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      transform: `translate(-50%, -50%) scale(${isOpen && !subMenu ? 1 : 0})`,
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: `${color}20`,
      border: `2px solid ${color}`,
      boxShadow: `0 0 15px ${color}40`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: `all 0.3s ease ${delay}ms`,
      opacity: isOpen && !subMenu ? 1 : 0,
    }),
    menuIcon: { fontSize: '20px', lineHeight: 1 },
    menuLabel: { fontSize: '8px', fontWeight: 'bold', color: COLORS.text, marginTop: '2px', letterSpacing: '0.5px' },
    subItem: (pos, color, delay) => ({
      position: 'absolute',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      transform: `translate(-50%, -50%) scale(${subMenu ? 1 : 0})`,
      minWidth: '70px',
      padding: '8px 10px',
      borderRadius: '8px',
      background: `${color}25`,
      border: `1px solid ${color}`,
      boxShadow: `0 0 10px ${color}30`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: `all 0.25s ease ${delay}ms`,
      opacity: subMenu ? 1 : 0,
    }),
    subLabel: { fontSize: '9px', fontWeight: 'bold', color: COLORS.text, textAlign: 'center', whiteSpace: 'nowrap' },
    subDetail: { fontSize: '8px', color: COLORS.textDim, marginTop: '2px' },
    backBtn: {
      position: 'absolute',
      left: '0px',
      top: '0px',
      transform: 'translate(-50%, -50%)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: `${COLORS.textDim}20`,
      border: `1px solid ${COLORS.textDim}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      cursor: 'pointer',
      opacity: subMenu ? 1 : 0,
      transition: 'all 0.2s ease',
    },
    centerLabel: {
      position: 'absolute',
      left: '50%',
      top: '-140px',
      transform: 'translateX(-50%)',
      fontSize: '11px',
      fontWeight: 'bold',
      color: COLORS.primary,
      letterSpacing: '2px',
      textShadow: `0 0 10px ${COLORS.primary}`,
      opacity: subMenu ? 1 : 0,
      transition: 'opacity 0.2s ease',
      whiteSpace: 'nowrap',
    },
  };

  const expColor = (exp) => ({
    hydra: COLORS.danger,
    sqlmap: COLORS.warning,
    msfconsole: '#ff6633',
    curl: COLORS.file
  }[exp] || COLORS.primary);

  return (
    <>
      <div style={styles.overlay} onClick={() => { setIsOpen(false); setSubMenu(null); }} />
      
      {isOpen && (
        <div style={styles.wheelCenter}>
          <div style={styles.centerLabel}>
            {subMenu === 'exploit' && '⚡ SELECT TARGET'}
            {subMenu === 'botnet' && '🤖 BOTNET NODES'}
          </div>
          
          {subMenu && (
            <div style={styles.backBtn} onClick={() => setSubMenu(null)}>←</div>
          )}
          
          {!subMenu && mainItems.map((item, i) => {
            const pos = getPosition(i, mainItems.length, 110);
            return (
              <div key={item.id} style={styles.menuItem(pos, item.color, i * 30)} onClick={item.action}>
                <span style={styles.menuIcon}>{item.icon}</span>
                <span style={styles.menuLabel}>{item.label}</span>
              </div>
            );
          })}
          
          {subMenu === 'exploit' && (
            <>
              {unhackedTargets.length === 0 ? (
                <div style={{ ...styles.subItem({ x: 0, y: -60 }, COLORS.textDim, 0), opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }}>
                  <span style={styles.subLabel}>NO TARGETS</span>
                  <span style={styles.subDetail}>Run NMAP first</span>
                </div>
              ) : (
                unhackedTargets.slice(0, 6).map((node, i) => {
                  const pos = getPosition(i, Math.min(unhackedTargets.length, 6), 105);
                  return (
                    <div key={node.ip} style={styles.subItem(pos, expColor(node.exp), i * 40)} onClick={() => tap(`${node.exp} ${node.ip}`)}>
                      <span style={{ ...styles.subLabel, color: expColor(node.exp) }}>⚡ {node.exp.toUpperCase()}</span>
                      <span style={styles.subDetail}>{node.name.slice(0, 12)}</span>
                    </div>
                  );
                })
              )}
            </>
          )}
          
         {subMenu === 'botnet' && (
  <>
    {botnetNodes.length === 0 ? (
      <div style={{ ...styles.subItem({ x: 0, y: -60 }, COLORS.textDim, 0), opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }}>
        <span style={styles.subLabel}>NO BOTS</span>
        <span style={styles.subDetail}>Deploy SLIVER first</span>
      </div>
    ) : (
      <>
        <div style={styles.subItem({ x: -80, y: -120 }, COLORS.danger, 0)} onClick={() => { onFillInput('hping3 '); setIsOpen(false); setSubMenu(null); }}>
          <span style={styles.subLabel}>⚡ HPING3</span>
        </div>
        <div style={styles.subItem({ x: 80, y: -120 }, COLORS.warning, 50)} onClick={() => { onFillInput('mimikatz '); setIsOpen(false); setSubMenu(null); }}>
          <span style={styles.subLabel}>🔑 MIMIKATZ</span>
        </div>
        {botnetNodes.slice(0, 6).map((node, i) => {
          const pos = getPosition(i, Math.min(botnetNodes.length, 6), 100);
          return (
            <div key={node.ip} style={styles.subItem(pos, COLORS.secondary, i * 40 + 100)} onClick={() => tap(`nmap ${node.ip}`)}>
              <span style={styles.subLabel}>🤖 {node.name.slice(0, 8)}</span>
              <span style={styles.subDetail}>{node.ip.slice(-8)}</span>
            </div>
          );
        })}
      </>
    )}
  </>
)}
        </div>
      )}
      
      <div
        style={styles.trigger}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => isDragging && handleDragEnd()}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {isOpen ? '✕' : '⚡'}
      </div>
    </>
  );
};

export default RadialMenu;
