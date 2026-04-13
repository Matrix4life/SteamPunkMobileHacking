import React, { useEffect, useState } from 'react';
import { COLORS, COMMODITIES } from '../constants/gameConstants';

const BASE_DEMAND = {
  cc_dumps: 0.78,
  botnets:  0.52,
  exploits: 0.34,
  zerodays: 0.14,
};

function calcDemand(key, priceMult, heat) {
  const base = BASE_DEMAND[key] ?? 0.5;
  const d = base * (1 / priceMult) * (1 - Math.min(heat, 90) / 150);
  return Math.max(0, Math.min(1, d));
}

function DemandBar({ demand }) {
  const pct = Math.round(demand * 100);
  const color = demand > 0.6 ? COLORS.secondary : demand > 0.3 ? COLORS.warning : COLORS.danger;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: COLORS.textDim, marginBottom: '3px' }}>
        <span>BUYER DEMAND</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: '4px', background: COLORS.bgDark, borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

const MarketBoard = ({
  money, stash, marketPrices, currentRegion, heat = 0,
  handleTrade, empireListings, onUpdateListing, returnToGame
}) => {
  const commodityKeys = Object.keys(COMMODITIES);
  const [selectedId, setSelectedId] = useState(commodityKeys[0]);

  // Local price mult per commodity — synced from empireListings prop
  const [priceMultipliers, setPriceMultipliers] = useState(() => {
    const init = {};
    commodityKeys.forEach(k => { init[k] = empireListings?.[k]?.priceMult ?? 1.0; });
    return init;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { returnToGame(); return; }
      const currentIndex = commodityKeys.indexOf(selectedId);
      if (e.key === 'ArrowDown') setSelectedId(commodityKeys[(currentIndex + 1) % commodityKeys.length]);
      else if (e.key === 'ArrowUp') setSelectedId(commodityKeys[(currentIndex - 1 + commodityKeys.length) % commodityKeys.length]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, commodityKeys, returnToGame]);

  const selectedComm = COMMODITIES[selectedId];
  const marketPrice = marketPrices[selectedId];
  const owned = stash[selectedId] || 0;
  const listed = empireListings?.[selectedId]?.listed ?? 0;
  const priceMult = priceMultipliers[selectedId] ?? 1.0;
  const listPrice = Math.round(marketPrice * priceMult);
  const demand = calcDemand(selectedId, priceMult, heat);

  let priceColor = COLORS.text;
  if (marketPrice > selectedComm.base * 1.2) priceColor = COLORS.danger;
  if (marketPrice < selectedComm.base * 0.8) priceColor = COLORS.secondary;

  const handleSetMult = (key, val) => {
    const m = parseFloat(val);
    setPriceMultipliers(prev => ({ ...prev, [key]: m }));
    if (onUpdateListing) onUpdateListing(key, { priceMult: m });
  };

  const handleList = (key, qty) => {
    if (!onUpdateListing) return;
    const availQty = Math.min(qty, (stash[key] || 0));
    if (availQty <= 0) return;
    onUpdateListing(key, { listQty: availQty });
  };

  const handleDelist = (key) => {
    if (!onUpdateListing) return;
    onUpdateListing(key, { delistAll: true });
  };

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", zIndex: 20,
    }}>
      <h2 style={{ color: COLORS.file, letterSpacing: '2px', fontWeight: 'normal', fontSize: '16px' }}>
        ─── BLACK MARKET: {currentRegion.toUpperCase()} ───
      </h2>
      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', marginBottom: '16px' }}>
        <span>WALLET: <span style={{ color: COLORS.warning }}>₿{money.toLocaleString()}</span></span>
        <span style={{ color: COLORS.textDim }}>|</span>
        <span style={{ color: COLORS.textDim }}>HEAT: <span style={{ color: heat > 60 ? COLORS.danger : heat > 35 ? COLORS.warning : COLORS.textDim }}>{Math.round(heat)}%</span></span>
        <span style={{ color: COLORS.textDim }}>|</span>
        <span style={{ color: COLORS.textDim }}>↑↓ navigate • [ESC] exit</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', width: '680px', minHeight: '360px' }}>
        {/* LEFT — commodity list */}
        <div style={{ flex: '1 1 48%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {commodityKeys.map(key => {
            const isSelected = selectedId === key;
            const cp = marketPrices[key];
            const base = COMMODITIES[key].base;
            const mult = priceMultipliers[key] ?? 1.0;
            const dem = calcDemand(key, mult, heat);
            const lst = empireListings?.[key]?.listed ?? 0;
            let pColor = COLORS.textDim;
            if (cp > base * 1.2) pColor = COLORS.danger;
            if (cp < base * 0.8) pColor = COLORS.secondary;

            return (
              <div
                key={key}
                onMouseEnter={() => setSelectedId(key)}
                onClick={() => setSelectedId(key)}
                style={{
                  border: `1px solid ${isSelected ? COLORS.file : COLORS.border}`,
                  padding: '12px 14px', borderRadius: '4px',
                  background: isSelected ? `${COLORS.file}12` : COLORS.bgPanel,
                  cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <div style={{ color: isSelected ? COLORS.file : COLORS.text, fontWeight: isSelected ? 'bold' : 'normal', marginBottom: '2px', fontSize: '13px' }}>
                      {COMMODITIES[key].name}
                    </div>
                    <div style={{ fontSize: '10px', color: COLORS.textDim }}>
                      STASH: {stash[key] || 0}{lst > 0 ? <span style={{ color: COLORS.warning }}> │ LISTED: {lst}</span> : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: pColor, fontSize: '13px' }}>₿{cp.toLocaleString()}</div>
                    <div style={{ fontSize: '9px', color: COLORS.textDim, marginTop: '2px' }}>AVG ₿{base.toLocaleString()}</div>
                  </div>
                </div>
                <DemandBar demand={dem} />
              </div>
            );
          })}
        </div>

        {/* RIGHT — detail + actions */}
        <div style={{
          flex: '1 1 52%', border: `1px solid ${COLORS.border}`, borderRadius: '4px',
          background: COLORS.bgPanel, padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ color: COLORS.file, fontSize: '14px', letterSpacing: '1px' }}>
            {selectedComm.name.toUpperCase()}
          </div>

          {/* Market price row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: COLORS.textDim }}>MARKET PRICE</span>
            <span style={{ color: priceColor, fontSize: '20px' }}>₿{marketPrice.toLocaleString()}</span>
          </div>

          {/* Stash info */}
          <div style={{ background: COLORS.bgDark, padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: COLORS.textDim }}>STASH</span>
              <span>{owned} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: COLORS.textDim }}>INSTANT VALUE</span>
              <span style={{ color: COLORS.warning }}>₿{(owned * marketPrice).toLocaleString()}</span>
            </div>
            {listed > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${COLORS.border}`, paddingTop: '4px', marginTop: '4px' }}>
                <span style={{ color: COLORS.textDim }}>LISTED</span>
                <span style={{ color: COLORS.warning }}>{listed} units @ ₿{Math.round(marketPrice * (empireListings?.[selectedId]?.priceMult ?? 1.0)).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── TYCOON SECTION: LIST FOR AUTO-SELL ── */}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '10px' }}>
            <div style={{ fontSize: '10px', color: COLORS.textDim, letterSpacing: '1px', marginBottom: '8px' }}>
              AUTO-LIST — SET PRICE & WALK AWAY
            </div>

            {/* Price multiplier slider */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: COLORS.textDim, marginBottom: '4px' }}>
                <span>LIST PRICE</span>
                <span style={{ color: COLORS.text }}>
                  ₿{listPrice.toLocaleString()}
                  <span style={{ color: priceMult > 1 ? COLORS.danger : COLORS.secondary, marginLeft: '6px' }}>
                    ({priceMult.toFixed(1)}×)
                  </span>
                </span>
              </div>
              <input
                type="range" min="0.5" max="2.5" step="0.1"
                value={priceMult}
                onChange={e => handleSetMult(selectedId, e.target.value)}
                style={{ width: '100%', accentColor: COLORS.file, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: COLORS.textDim }}>
                <span>0.5× undercut</span>
                <span>2.5× premium</span>
              </div>
            </div>

            {/* Demand bar at current list price */}
            <div style={{ marginBottom: '10px' }}>
              <DemandBar demand={demand} />
              <div style={{ fontSize: '10px', color: COLORS.textDim, marginTop: '3px' }}>
                est. ₿{Math.round(listPrice * demand * 3).toLocaleString()}/hr at current demand
              </div>
            </div>

            {/* List / Delist buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleList(selectedId, 1)}
                disabled={owned < 1}
                style={{ background: 'transparent', color: COLORS.warning, border: `1px solid ${COLORS.warning}60`, padding: '8px 0', cursor: owned >= 1 ? 'pointer' : 'not-allowed', opacity: owned >= 1 ? 1 : 0.3, borderRadius: '3px', fontFamily: 'inherit', fontSize: '11px' }}>
                LIST 1
              </button>
              <button
                onClick={() => handleList(selectedId, owned)}
                disabled={owned < 1}
                style={{ background: `${COLORS.warning}20`, color: COLORS.warning, border: `1px solid ${COLORS.warning}`, padding: '8px 0', cursor: owned >= 1 ? 'pointer' : 'not-allowed', opacity: owned >= 1 ? 1 : 0.3, borderRadius: '3px', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
                LIST ALL
              </button>
              <button
                onClick={() => handleDelist(selectedId)}
                disabled={listed < 1}
                style={{ background: 'transparent', color: COLORS.textDim, border: `1px solid ${COLORS.border}`, padding: '8px 0', cursor: listed >= 1 ? 'pointer' : 'not-allowed', opacity: listed >= 1 ? 1 : 0.3, borderRadius: '3px', fontFamily: 'inherit', fontSize: '11px' }}>
                DELIST
              </button>
            </div>
          </div>

          {/* ── INSTANT SELL (existing) ── */}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '10px', marginTop: 'auto' }}>
            <div style={{ fontSize: '10px', color: COLORS.textDim, letterSpacing: '1px', marginBottom: '8px' }}>
              INSTANT SELL — MARKET PRICE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleTrade('sell', selectedId, 1)}
                disabled={owned < 1}
                style={{ background: `${COLORS.secondary}20`, color: COLORS.secondary, border: `1px solid ${COLORS.secondary}60`, padding: '8px', cursor: owned >= 1 ? 'pointer' : 'not-allowed', opacity: owned >= 1 ? 1 : 0.3, borderRadius: '3px', fontFamily: 'inherit', fontSize: '11px' }}>
                SELL 1
              </button>
              <button
                onClick={() => handleTrade('sell', selectedId, owned)}
                disabled={owned < 1}
                style={{ background: `${COLORS.secondary}40`, color: COLORS.secondary, border: `1px solid ${COLORS.secondary}`, padding: '8px', cursor: owned >= 1 ? 'pointer' : 'not-allowed', opacity: owned >= 1 ? 1 : 0.3, borderRadius: '3px', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
                SELL ALL
              </button>
            </div>
          </div>
        </div>
      </div>

      <button onClick={returnToGame} style={{
        background: 'transparent', color: COLORS.textDim, border: `1px solid ${COLORS.textDim}`,
        padding: '8px 24px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '20px',
        borderRadius: '4px', fontSize: '12px', letterSpacing: '1px',
      }}>
        [ESC] EXIT MARKET
      </button>
    </div>
  );
};

export default MarketBoard;
