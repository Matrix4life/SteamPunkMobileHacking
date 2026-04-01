import React, { useEffect, useState, useRef } from 'react';
import { COLORS, COMMAND_REGISTRY, DEV_COMMANDS } from '../constants/gameConstants';

const SyntaxText = ({ text }) => {
  if (typeof text !== 'string') return <span>{text}</span>;
  const parts = text.split(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|\b[\w-]+\.(?:txt|zip|sql|db|log|yaml|bak|msg|bin|exe|hashes|eml|tmp)\b|\$\d+(?:,\d+)*|\[.*?\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)) return <span key={i} style={{ color: COLORS.ip }}>{part}</span>;
        if (part.match(/\b[\w-]+\.(?:txt|zip|sql|db|log|yaml|bak|msg|bin|exe|hashes|eml|tmp)\b/)) return <span key={i} style={{ color: COLORS.file }}>{part}</span>;
        if (part.match(/\$\d+(?:,\d+)*/)) return <span key={i} style={{ color: COLORS.warning }}>{part}</span>;
        if (part.startsWith('[') && part.endsWith(']')) {
          if (part.includes('ERROR') || part.includes('!!!') || part.includes('-') || part.includes('LOCKED') || part.includes('FATAL') || part.includes('ALERT') || part.includes('BREACH') || part.includes('DETONATION')) return <span key={i} style={{ color: COLORS.danger }}>{part}</span>;
          if (part.includes('SUCCESS') || part.includes('+') || part.includes('SAFE') || part.includes('COMPLETE') || part.includes('WIN')) return <span key={i} style={{ color: COLORS.secondary }}>{part}</span>;
          return <span key={i} style={{ color: COLORS.primary }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const Typewriter = ({ text, scrollRef, onComplete, customColor }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setDisplayed(text.substring(0, i));
      if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      if (i >= text.length) { clearInterval(timer); if (onComplete) onComplete(); }
    }, 8);
    return () => clearInterval(timer);
  }, [text]); 

  return <span style={{ color: customColor || COLORS.text }}><SyntaxText text={displayed} /></span>;
};

// --- SESSION MEMORY CACHE ---
// These variables live outside the component so they don't get erased when you close the menu
let cachedHelpPos = null;
let cachedHelpSize = null;

const HelpPanel = ({ onClose, devMode }) => {
  const groupedCommands = COMMAND_REGISTRY.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  const panelRef = useRef(null);

  // Load from cache, or use defaults
  const [pos, setPos] = useState(cachedHelpPos || {
    x: window.innerWidth > 800 ? window.innerWidth - 550 : 20,
    y: window.innerHeight > 600 ? (window.innerHeight / 2) - 300 : 50
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Save Position to memory whenever it changes
  useEffect(() => {
    cachedHelpPos = pos;
  }, [pos]);

  // Custom Close function to capture custom sizing before it disappears
  const handleCloseClick = () => {
    if (panelRef.current) {
      cachedHelpSize = {
        width: panelRef.current.style.width,
        height: panelRef.current.style.height
      };
    }
    onClose();
  };

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'absolute', 
        left: `${pos.x}px`,     
        top: `${pos.y}px`,      
        width: cachedHelpSize?.width || '500px',   // Load cached width
        height: cachedHelpSize?.height || 'auto',  // Load cached height
        minWidth: '350px',      
        maxHeight: '80vh',
        background: 'rgba(8,12,18,0.98)', 
        border: `1px solid ${COLORS.primary}80`,
        fontSize: '11px',
        color: COLORS.text,
        zIndex: 9999, 
        backdropFilter: 'blur(15px)',
        boxShadow: `0 0 50px rgba(0,0,0,0.9), 0 0 20px ${COLORS.primary}30`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        resize: 'both',         
        overflow: 'hidden'      
      }}>
      
      {/* DRAG HANDLE */}
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderBottom: `1px solid ${COLORS.borderActive}`, 
          padding: '16px 24px', 
          background: `${COLORS.primary}10`,
          cursor: isDragging ? 'grabbing' : 'grab', 
          userSelect: 'none'
        }}
      >
        <span style={{ color: COLORS.primary, fontWeight: 'bold', letterSpacing: '2px', fontSize: '14px' }}>COMMAND REFERENCE MANUAL</span>
        <span onClick={handleCloseClick} style={{ color: COLORS.textDim, cursor: 'pointer', border: `1px solid ${COLORS.textDim}40`, padding: '2px 8px', borderRadius: '3px' }}>[TAB] CLOSE</span>
      </div>
      
      {/* SCROLLABLE CONTENT */}
      <div style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px', 
        padding: '16px 24px',
        scrollbarWidth: 'thin', 
        scrollbarColor: `${COLORS.primaryDim} transparent`
      }}>
        
        {Object.keys(groupedCommands).map((categoryName) => (
          <div key={categoryName} style={{ marginBottom: '12px' }}>
            <div style={{ 
              color: COLORS.secondary, 
              marginTop: '4px', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              borderBottom: `1px dashed ${COLORS.borderActive}`, 
              paddingBottom: '4px',
              letterSpacing: '1px',
              fontSize: '12px'
            }}>
              [{categoryName.toUpperCase()}]
            </div>
            {groupedCommands[categoryName].map((c, i) => (
              <div key={i} style={{ display: 'flex', marginBottom: '6px', lineHeight: '1.4' }}>
                <span style={{ color: COLORS.primaryDim, width: '160px', flexShrink: 0, fontFamily: 'monospace', fontWeight: 'bold' }}>{c.cmd}</span>
                <span style={{ color: COLORS.textDim }}>- {c.desc}</span>
              </div>
            ))}
          </div>
        ))}
        
        {devMode && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ color: COLORS.danger, marginTop: '8px', borderBottom: `1px dashed ${COLORS.danger}60`, paddingBottom: '4px', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px' }}>
              [DEVELOPER PROTOCOLS]
            </div>
            {DEV_COMMANDS.map((c, i) => (
              <div key={`dev-${i}`} style={{ display: 'flex', marginBottom: '4px' }}>
                <span style={{ color: COLORS.danger, width: '160px', flexShrink: 0 }}>{c.cmd}</span>
                <span style={{ color: COLORS.textDim }}>- {c.desc}</span>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${COLORS.borderActive}`, color: COLORS.textDim, textAlign: 'center', fontSize: '10px', letterSpacing: '1px' }}>
          OPERATOR VERSION 3.0.4 // CORE SYSTEM STABLE
        </div>
      </div>
    </div>
  );
};

export { SyntaxText, Typewriter, HelpPanel };
