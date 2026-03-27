import React, { useEffect, useState } from 'react';
import { COLORS, COMMODITIES } from '../constants/gameConstants';

const MarketBoard = ({ money, stash, marketPrices, currentRegion, handleTrade, returnToGame }) => {
  const commodityKeys = Object.keys(COMMODITIES);
  const [selectedId, setSelectedId] = useState(commodityKeys[0]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { returnToGame(); return; }
      const currentIndex = commodityKeys.indexOf(selectedId);
      if (e.key === 'ArrowDown') {
        setSelectedId(commodityKeys[(currentIndex + 1) % commodityKeys.length]);
      } else if (e.key === 'ArrowUp') {
        setSelectedId(commodityKeys[(currentIndex - 1 + commodityKeys.length) % commodityKeys.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, commodityKeys, returnToGame]);

  const selectedComm = COMMODITIES[selectedId];
  const price = marketPrices[selectedId];
  const owned = stash[selectedId] || 0;
  
  let priceColor = COLORS.text;
  if (price > selectedComm.base * 1.2) priceColor = COLORS.danger; 
  if (price < selectedComm.base * 0.8) priceColor = COLORS.secondary; 

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", zIndex: 20
    }}>
      <h2 style={{ color: COLORS.file, letterSpacing: '2px', fontWeight: 'normal', fontSize: '16px' }}>
        ─── BLACK MARKET: {currentRegion.toUpperCase()} ───
      </h2>
      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', marginBottom: '16px' }}>
        <span>WALLET: <span style={{ color: COLORS.warning }}>${money.toLocaleString()}</span></span>
        <span style={{ color: COLORS.textDim }}>|</span>
        <span style={{ color: COLORS.textDim }}>Use arrows to navigate, click to trade.</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', width: '650px', height: '320px' }}>
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {commodityKeys.map(key => {
            const isSelected = selectedId === key;
            const commPrice = marketPrices[key];
            const base = COMMODITIES[key].base;
            let pColor = COLORS.textDim;
            if (commPrice > base * 1.2) pColor = COLORS.danger;
            if (commPrice < base * 0.8) pColor = COLORS.secondary;
            
            return (
              <div key={key} 
                onMouseEnter={() => setSelectedId(key)}
                style={{
                  border: `1px solid ${isSelected ? COLORS.file : COLORS.border}`,
                  padding: '16px', borderRadius: '4px',
                  background: isSelected ? `${COLORS.file}12` : COLORS.bgPanel,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div>
                  <div style={{ color: isSelected ? COLORS.file : COLORS.text, fontWeight: isSelected ? 'bold' : 'normal', marginBottom: '4px' }}>{COMMODITIES[key].name}</div>
                  <div style={{ fontSize: '10px', color: COLORS.textDim }}>OWNED: {stash[key] || 0}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: pColor, fontSize: '14px' }}>${commPrice.toLocaleString()}</div>
                  <div style={{ fontSize: '9px', color: COLORS.textDim, marginTop: '4px' }}>AVG: ${base.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          flex: '1 1 50%', border: `1px solid ${COLORS.border}`, borderRadius: '4px',
          background: COLORS.bgPanel, padding: '20px', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ color: COLORS.file, fontSize: '14px', letterSpacing: '1px', marginBottom: '8px' }}>{selectedComm.name.toUpperCase()}</div>
          <div style={{ fontSize: '24px', color: priceColor, marginBottom: '20px' }}>${price.toLocaleString()} <span style={{fontSize: '10px', color: COLORS.textDim}}>per unit</span></div>
          
          <div style={{ background: COLORS.bgDark, padding: '12px', borderRadius: '4px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: COLORS.textDim }}>YOUR STASH:</span>
              <span style={{ color: COLORS.text }}>{owned} UNITS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textDim }}>STASH VALUE:</span>
              <span style={{ color: COLORS.warning }}>${(owned * price).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
            <button 
              onClick={() => handleTrade('buy', selectedId, 1)}
              disabled={money < price}
              style={{ background: `${COLORS.danger}20`, color: COLORS.danger, border: `1px solid ${COLORS.danger}60`, padding: '10px', cursor: money >= price ? 'pointer' : 'not-allowed', opacity: money >= price ? 1 : 0.3, borderRadius: '4px', fontFamily: 'inherit' }}>
              BUY 1
            </button>
            <button 
              onClick={() => handleTrade('buy', selectedId, Math.floor(money / price))}
              disabled={money < price}
              style={{ background: `${COLORS.danger}40`, color: COLORS.danger, border: `1px solid ${COLORS.danger}`, padding: '10px', cursor: money >= price ? 'pointer' : 'not-allowed', opacity: money >= price ? 1 : 0.3, borderRadius: '4px', fontFamily: 'inherit', fontWeight: 'bold' }}>
              BUY MAX
            </button>
            <button 
              onClick={() => handleTrade('sell', selectedId, 1)}
              disabled={owned < 1}
              style={{ background: `${COLORS.secondary}20`, color: COLORS.secondary, border: `1px solid ${COLORS.secondary}60`, padding: '10px', cursor: owned >= 1 ? 'pointer' : 'not-allowed', opacity: owned >= 1 ? 1 : 0.3, borderRadius: '4px', fontFamily: 'inherit', marginTop: '8px' }}>
              SELL 1
            </button>
            <button 
              onClick={() => handleTrade('sell', selectedId, owned)}
              disabled={owned < 1}
              style={{ background: `${COLORS.secondary}40`, color: COLORS.secondary, border: `1px solid ${COLORS.secondary}`, padding: '10px', cursor: owned >= 1 ? 'pointer' : 'not-allowed', opacity: owned >= 1 ? 1 : 0.3, borderRadius: '4px', fontFamily: 'inherit', marginTop: '8px', fontWeight: 'bold' }}>
              SELL ALL
            </button>
          </div>
        </div>
      </div>

      <button onClick={returnToGame} style={{
        background: 'transparent', color: COLORS.textDim, border: `1px solid ${COLORS.textDim}`,
        padding: '8px 24px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '24px',
        borderRadius: '4px', fontSize: '12px', letterSpacing: '1px'
      }}>
        [ESC] EXIT MARKET
      </button>
    </div>
  );
};

export default MarketBoard;
