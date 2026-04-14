import React, { useState } from 'react';
import { COLORS } from '../constants/gameConstants';

// Context-aware quick actions — buttons change based on game state
const getQuickActions = ({ isInside, privilege, isChatting, targetIP, botnet }) => {
  if (isChatting) {
    return [
      { label: 'YES', cmd: 'yes' },
      { label: 'NO', cmd: 'no' },
      { label: 'TRUST ME', cmd: 'trust me, this is routine maintenance' },
      { label: 'EXIT CHAT', cmd: 'bye' },
    ];
  }

  if (isInside && privilege === 'root') {
    return [
      { label: 'LS', cmd: 'ls' },
      { label: 'EXFIL', cmd: 'exfil ', partial: true },
      { label: 'SLIVER', cmd: 'sliver' },
      { label: 'CHISEL', cmd: 'chisel' },
      { label: 'WIPE', cmd: 'wipe' },
      { label: 'REPTILE', cmd: 'reptile' },
      { label: 'EXIT', cmd: 'exit' },
    ];
  }

  if (isInside && privilege === 'www-data') {
    return [
      { label: 'PWNKIT', cmd: 'pwnkit' },
      { label: 'LS', cmd: 'ls' },
      { label: 'CD', cmd: 'cd ', partial: true },
      { label: 'CAT', cmd: 'cat ', partial: true },
      { label: 'EXIT', cmd: 'exit' },
    ];
  }

  // Outside — recon/access phase
  return [
    { label: 'NMAP', cmd: 'nmap' },
    { label: 'HYDRA', cmd: 'hydra ', partial: true },
    { label: 'SQLMAP', cmd: 'sqlmap ', partial: true },
    { label: 'MARKET', cmd: 'market' },
    { label: 'CONTRACTS', cmd: 'contracts' },
    { label: 'STATUS', cmd: 'status' },
  ];
};

// Secondary row for less common actions
const getSecondaryActions = ({ isInside, privilege, botnet }) => {
  if (!isInside) {
    return [
      { label: 'MSFCONSOLE', cmd: 'msfconsole ', partial: true },
      { label: 'CURL', cmd: 'curl ', partial: true },
      { label: 'SPEARPHISH', cmd: 'spearphish ', partial: true },
      { label: 'HPING3', cmd: 'hping3 ', partial: true },
      { label: 'HELP', cmd: 'help' },
    ];
  }
  if (privilege === 'root') {
    return [
      { label: 'ETTERCAP', cmd: 'ettercap' },
      { label: 'SHRED', cmd: 'shred' },
      { label: 'OPENSSL', cmd: 'openssl' },
      { label: 'MSFVENOM', cmd: 'msfvenom' },
      { label: 'XMRIG', cmd: 'xmrig' },
      { label: 'DOWNLOAD', cmd: 'download ', partial: true },
    ];
  }
  return [];
};

export default function MobileQuickBar({ isInside, privilege, isChatting, targetIP, botnet, onCommand, onPartial, inputRef }) {
  const [showSecondary, setShowSecondary] = useState(false);

  const state = { isInside, privilege, isChatting, targetIP, botnet };
  const primary = getQuickActions(state);
  const secondary = getSecondaryActions(state);

  const handleTap = (action) => {
    if (action.partial) {
      // Fill input with partial command so user can add the argument
      onPartial(action.cmd);
      if (inputRef?.current) inputRef.current.focus();
    } else {
      onCommand(action.cmd);
    }
  };

  const barStyle = {
    display: 'flex',
    gap: '4px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    padding: '6px 0',
    flexShrink: 0,
  };

  const btnStyle = (isPartial) => ({
    flexShrink: 0,
    padding: '8px 12px',
    background: isPartial ? `${COLORS.primary}15` : `${COLORS.primary}20`,
    border: `1px solid ${isPartial ? COLORS.primary + '40' : COLORS.border}`,
    borderRadius: '4px',
    color: isPartial ? COLORS.primary : COLORS.text,
    fontFamily: 'inherit',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  });

  const toggleStyle = {
    ...btnStyle(false),
    background: showSecondary ? `${COLORS.secondary}30` : 'transparent',
    color: COLORS.secondary,
    border: `1px solid ${COLORS.secondary}40`,
    fontSize: '10px',
    padding: '8px 8px',
  };

  return (
    <div style={{ flexShrink: 0, borderTop: `1px solid ${COLORS.border}`, marginTop: '4px' }}>
      <div style={barStyle}>
        {primary.map((a, i) => (
          <button key={i} onClick={() => handleTap(a)} style={btnStyle(a.partial)}>
            {a.label}{a.partial ? '…' : ''}
          </button>
        ))}
        {secondary.length > 0 && (
          <button onClick={() => setShowSecondary(s => !s)} style={toggleStyle}>
            {showSecondary ? '▲' : '▼'} MORE
          </button>
        )}
      </div>
      {showSecondary && secondary.length > 0 && (
        <div style={barStyle}>
          {secondary.map((a, i) => (
            <button key={i} onClick={() => handleTap(a)} style={btnStyle(a.partial)}>
              {a.label}{a.partial ? '…' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
