import React, { useEffect, useState } from 'react';
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

const HelpPanel = ({ onClose, devMode }) => {
  // Group the commands by their category tag
  const groupedCommands = COMMAND_REGISTRY.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <div style={{
      position: 'fixed', // Center in viewport
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px', // Slightly wider for readability
      maxHeight: '80vh',
      background: 'rgba(8,12,18,0.98)', // Highly opaque to hide background
      border: `1px solid ${COLORS.primary}80`,
      padding: '24px',
      fontSize: '11px',
      color: COLORS.text,
      zIndex: 9999, // Guarantee front-of-screen priority
      backdropFilter: 'blur(15px)',
      boxShadow: `0 0 50px rgba(0,0,0,0.9), 0 0 20px ${COLORS.primary}30`,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.borderActive}`, paddingBottom: '12px', marginBottom: '16px' }}>
        <span style={{ color: COLORS.primary, fontWeight: 'bold', letterSpacing: '2px', fontSize: '14px' }}>COMMAND REFERENCE MANUAL</span>
        <span onClick={onClose} style={{ color: COLORS.textDim, cursor: 'pointer', border: `1px solid ${COLORS.textDim}40`, padding: '2px 8px', borderRadius: '3px' }}>[TAB] CLOSE</span>
      </div>
      
      <div style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px', 
        paddingRight: '12px',
        scrollbarWidth: 'thin', 
        scrollbarColor: `${COLORS.primaryDim} transparent`
      }}>
        
        {/* Map through the generated categories */}
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
      </div>
      
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${COLORS.borderActive}`, color: COLORS.textDim, textAlign: 'center', fontSize: '10px', letterSpacing: '1px' }}>
        OPERATOR VERSION 3.0.4 // CORE SYSTEM STABLE
      </div>
    </div>
  );
};

export { SyntaxText, Typewriter, HelpPanel };
