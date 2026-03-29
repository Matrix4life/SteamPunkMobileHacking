import React from 'react';
import { COLORS } from '../constants/gameConstants';

const WANTED_COLORS = {
  COLD: COLORS.textDim,
  WARM: COLORS.warning,
  HOT: '#ff9944',
  CRITICAL: COLORS.danger,
  MANHUNT: '#ff0040',
};

const Header = ({ operator, privilege, money, heat, reputation, isInside, targetIP, trace, isChatting, activeContract, world, gameMode, wantedTier, walletFrozen, onSave, onMenu, onHelp, isMobile }) => {
  const traceColor = trace > 75 ? COLORS.danger : trace > 40 ? COLORS.warning : COLORS.primary;
  const heatColor = heat > 70 ? COLORS.danger : heat > 40 ? COLORS.warning : COLORS.textDim;
  const orgName = isInside && targetIP && world[targetIP]?.org?.orgName;
  const modeColor = gameMode === 'operator' ? COLORS.danger : gameMode === 'field' ? COLORS.warning : COLORS.secondary;

  // API status light
  let aiConnected = false;
  try {
    const cfg = JSON.parse(localStorage.getItem('steambreach_ai_config') || '{}');
    aiConnected = !!(cfg.apiKey && cfg.apiKey.length > 5);
  } catch {}
  const aiDot = { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: aiConnected ? '#00ff88' : '#ff3366', boxShadow: aiConnected ? '0 0 6px #00ff8880' : '0 0 6px #ff336680', marginRight: '4px', flexShrink: 0 };
  const modeLabel = (gameMode || 'arcade').toUpperCase();
  const wantedColor = WANTED_COLORS[wantedTier] || COLORS.textDim;
  const showWanted = wantedTier && wantedTier !== 'COLD';

  const btnStyle = {
    background: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.textDim,
    padding: isMobile ? '6px 10px' : '2px 8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? '10px' : '9px',
    borderRadius: '2px', letterSpacing: '1px', transition: 'border-color 0.15s, color 0.15s',
    WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
  };

  // MOBILE: Two-row compact layout
  if (isMobile) {
    return (
      <div style={{
        flexShrink: 0, borderBottom: `1px solid ${wantedTier === 'MANHUNT' ? COLORS.danger : (trace > 75 ? COLORS.danger + '60' : COLORS.border)}`,
        paddingBottom: '6px', fontSize: '13px',
        background: wantedTier === 'MANHUNT' ? `${COLORS.danger}08` : 'transparent',
      }}>
        {/* Row 1: Identity + Money + Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px' }}>
            <span style={{ color: COLORS.textDim }}>
              {isChatting ? 'SPEARPHISH' : (isInside ? privilege.toUpperCase() : 'OP')}
            </span>
            <span style={{ color: COLORS.textDim }}>@</span>
            {isInside ? <span style={{ color: COLORS.ip }}>{targetIP}</span> : <span style={{ color: COLORS.textDim }}>kali</span>}
          </span>

          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={aiDot} title={aiConnected ? 'AI Connected' : 'AI Offline — set API key in menu'} />
            <span style={{ color: modeColor, fontSize: '8px', border: `1px solid ${modeColor}40`, padding: '1px 4px', borderRadius: '2px', letterSpacing: '1px' }}>{modeLabel}</span>
            <button onClick={onHelp} style={btnStyle}>?</button>
            <button onClick={onSave} style={btnStyle}>SAVE</button>
            <button onClick={onMenu} disabled={isInside} style={{ ...btnStyle, opacity: isInside ? 0.3 : 1, cursor: isInside ? 'default' : 'pointer' }}>MENU</button>
          </span>
        </div>

        {/* Row 2: Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ color: walletFrozen ? COLORS.danger : COLORS.warning }}>
            {walletFrozen ? '\u{1F512}' : '₿'}{money.toLocaleString()}
          </span>

          <span>
            <span style={{ color: heatColor }}>H:{heat}%</span>
            {showWanted && (
              <span style={{ color: wantedColor, fontSize: '8px', border: `1px solid ${wantedColor}60`, padding: '0px 3px', borderRadius: '2px', marginLeft: '4px', fontWeight: wantedTier === 'MANHUNT' ? 'bold' : 'normal' }}>
                {wantedTier}
              </span>
            )}
          </span>

          <span style={{ color: COLORS.textDim }}>R:{reputation}</span>

          <span style={{
            color: traceColor,
            fontWeight: trace > 40 ? 'bold' : 'normal',
            fontSize: trace > 60 ? '16px' : trace > 30 ? '14px' : '12px',
            padding: trace > 50 ? '2px 8px' : '0',
            background: trace > 75 ? `${COLORS.danger}25` : trace > 50 ? `${COLORS.warning}15` : 'transparent',
            borderRadius: '3px',
            border: trace > 60 ? `1px solid ${traceColor}50` : 'none',
            transition: 'all 0.3s ease',
            animation: trace > 75 ? 'tracePulse 0.8s ease-in-out infinite' : 'none',
          }}>
            TRACE {trace}%{trace > 75 && ' \u25C9'}
          </span>
        </div>
        {trace > 20 && <style>{`@keyframes tracePulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>}
      </div>
    );
  }

  // DESKTOP: Original layout
  return (
    <div style={{
      flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: `1px solid ${wantedTier === 'MANHUNT' ? COLORS.danger : (trace > 75 ? COLORS.danger + '60' : COLORS.border)}`,
      paddingBottom: '8px', fontSize: '12px', gap: '12px', flexWrap: 'wrap',
      background: wantedTier === 'MANHUNT' ? `${COLORS.danger}08` : 'transparent',
    }}>
      <span>
        <span style={{ color: COLORS.textDim }}>
          {isChatting ? 'SPEARPHISH' : (isInside ? privilege.toUpperCase() : 'OP')}
        </span>
        <span style={{ color: COLORS.textDim }}>@</span>
        {isInside ? <span style={{ color: COLORS.ip }}>{targetIP}</span> : <span style={{ color: COLORS.textDim }}>kali</span>}
        {orgName && <span style={{ color: COLORS.textDim }}> [{orgName}]</span>}
      </span>

      <span style={{ color: walletFrozen ? COLORS.danger : COLORS.warning }}>
        {walletFrozen ? '\u{1F512} ' : ''}₿{money.toLocaleString()}
      </span>

      {activeContract && (
        <span style={{ color: COLORS.chat }}>
          CONTRACT: {activeContract.id}
        </span>
      )}

      <span>
        <span style={{ color: heatColor }}>HEAT {heat}%</span>
        {showWanted && (
          <span style={{ 
            color: wantedColor, fontSize: '9px', border: `1px solid ${wantedColor}60`, 
            padding: '1px 5px', borderRadius: '2px', marginLeft: '6px', letterSpacing: '1px',
            fontWeight: wantedTier === 'MANHUNT' || wantedTier === 'CRITICAL' ? 'bold' : 'normal',
          }}>
            {wantedTier}
          </span>
        )}
        <span style={{ color: COLORS.textDim }}> | </span>
        <span style={{ color: COLORS.textDim }}>REP {reputation}</span>
      </span>

      <span style={{ color: traceColor, fontWeight: trace > 75 ? 'bold' : 'normal' }}>
        TRACE {trace}%
        {trace > 75 && ' \u25C9'}
      </span>

      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span style={aiDot} title={aiConnected ? 'AI Connected' : 'AI Offline — set API key in menu'} />
        <span style={{ color: modeColor, fontSize: '9px', border: `1px solid ${modeColor}40`, padding: '1px 6px', borderRadius: '2px', letterSpacing: '1px' }}>{modeLabel}</span>
        <button onClick={onHelp} style={btnStyle}>[TAB] HELP</button>
        <button onClick={onSave} style={btnStyle}>SAVE</button>
        <button onClick={onMenu} disabled={isInside} style={{ ...btnStyle, opacity: isInside ? 0.3 : 1, cursor: isInside ? 'default' : 'pointer' }}>MENU</button>
      </span>
    </div>
  );
};

export default Header;
