import React, { useState, useMemo, useEffect } from 'react';
import {
  PARTS_BY_ID, PARTS_BY_SLOT, SLOTS, SLOT_LABELS,
  GENS, MAKERS, RARITY_COLORS,
  calculateSynergy, calculatePowerBudget, getRigEffects,
  getSellPrice,
} from '../constants/rigParts';

const COLORS = {
  bg: '#0a0a0f', bgPanel: '#111118', bgDark: '#08080c',
  text: '#fcfcfa', textDim: '#727072',
  primary: '#78dce8', secondary: '#a9dc76',
  danger: '#ff6188', warning: '#ffd866',
  ip: '#78dce8', file: '#fc9867', chat: '#ab9df2',
  border: '#2d2a2e', borderActive: '#403e41',
};

// ─── HELPERS ──────────────────────────────────────────────────
const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${n.toLocaleString()}`;

function TrendArrow({ trend, ratio }) {
  if (trend === 'up')   return <span style={{ color: COLORS.danger, fontSize: '10px' }}>▲ {ratio}%</span>;
  if (trend === 'down') return <span style={{ color: COLORS.secondary, fontSize: '10px' }}>▼ {ratio}%</span>;
  return <span style={{ color: COLORS.textDim, fontSize: '10px' }}>─ {ratio}%</span>;
}

function RarityBadge({ rarity }) {
  return (
    <span style={{
      fontSize: '8px', letterSpacing: '1px', padding: '1px 5px',
      border: `1px solid ${RARITY_COLORS[rarity]}44`,
      color: RARITY_COLORS[rarity],
      borderRadius: '3px', textTransform: 'uppercase',
    }}>{rarity}</span>
  );
}

function GenBadge({ gen }) {
  const g = GENS[gen];
  if (!g) return null;
  return (
    <span style={{
      fontSize: '9px', fontWeight: 700, padding: '1px 6px',
      background: `${g.color}18`, border: `1px solid ${g.color}55`,
      color: g.color, borderRadius: '3px', letterSpacing: '0.5px',
    }}>{g.label}</span>
  );
}

function StatDisplay({ label, value, unit }) {
  return (
    <span style={{ fontSize: '10px', color: COLORS.textDim }}>
      {label}: <span style={{ color: COLORS.text }}>{value}</span>{unit && <span style={{ color: COLORS.textDim }}>{unit}</span>}
    </span>
  );
}

// ─── SYNERGY DISPLAY ──────────────────────────────────────────
function SynergyPanel({ rig }) {
  const syn = calculateSynergy(rig);
  const pow = calculatePowerBudget(rig);
  const effects = getRigEffects(rig);
  const installedCount = SLOTS.filter(s => rig[s]).length;

  return (
    <div style={{
      border: `1px solid ${syn.color}44`,
      borderRadius: '4px', padding: '10px', marginBottom: '8px',
      background: `${syn.color}08`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '2px', color: COLORS.textDim }}>SYNERGY</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: syn.color }}>{syn.rating}</span>
          <span style={{ fontSize: '10px', color: syn.color }}>{syn.multiplier}x</span>
        </div>
      </div>

      {/* Power budget */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '2px' }}>
          <span style={{ color: COLORS.textDim }}>POWER</span>
          <span style={{ color: pow.stable ? COLORS.secondary : COLORS.danger }}>
            {pow.totalDraw}W / {pow.psuWattage || '—'}W
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${Math.min(100, pow.utilizationPct)}%`,
            background: pow.utilizationPct > 100 ? COLORS.danger : pow.utilizationPct > 85 ? COLORS.warning : COLORS.secondary,
            transition: 'width 0.3s',
          }} />
        </div>
        {!pow.stable && (
          <div style={{ color: COLORS.danger, fontSize: '9px', marginTop: '3px', letterSpacing: '1px' }}>
            ⚠ PSU OVERLOADED — {Math.round(effects.failChance * 100)}% INSTABILITY
          </div>
        )}
      </div>

      {/* Rig effects summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontSize: '9px' }}>
        {effects.hashSpeed > 0 && <div style={{ color: COLORS.textDim }}>Hashcat: <span style={{ color: COLORS.primary }}>{effects.hashSpeed}x</span></div>}
        {effects.mineMultiplier > 0 && <div style={{ color: COLORS.textDim }}>Mining: <span style={{ color: COLORS.secondary }}>{effects.mineMultiplier}x</span></div>}
        <div style={{ color: COLORS.textDim }}>Proxies: <span style={{ color: COLORS.primary }}>{effects.maxProxies}</span></div>
        <div style={{ color: COLORS.textDim }}>Trace: <span style={{ color: COLORS.warning }}>{effects.traceMultiplier}x</span></div>
        <div style={{ color: COLORS.textDim }}>Exfil: <span style={{ color: COLORS.file }}>{effects.exfilMultiplier}x</span></div>
        <div style={{ color: COLORS.textDim }}>Scan: <span style={{ color: COLORS.ip }}>{effects.scanCount} nodes</span></div>
        {effects.heatReduction > 0 && <div style={{ color: COLORS.textDim }}>Cool: <span style={{ color: COLORS.primary }}>-{Math.round(effects.heatReduction * 100)}%</span></div>}
        {effects.repBonus > 0 && <div style={{ color: COLORS.textDim }}>REP: <span style={{ color: COLORS.chat }}>+{effects.repBonus}/job</span></div>}
      </div>

      <div style={{ fontSize: '8px', color: COLORS.textDim, marginTop: '6px' }}>{installedCount}/8 SLOTS</div>
    </div>
  );
}

// ─── RIG SLOTS ────────────────────────────────────────────────
function RigSlotRow({ slot, partId, onUninstall }) {
  const part = partId ? PARTS_BY_ID[partId] : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 8px', borderRadius: '3px', fontSize: '10px',
      background: part ? 'rgba(120,220,232,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${part ? COLORS.border : 'rgba(255,255,255,0.04)'}`,
      marginBottom: '3px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
        <span style={{ color: COLORS.textDim, width: '32px', flexShrink: 0, letterSpacing: '1px', fontSize: '8px' }}>
          {SLOT_LABELS[slot]}
        </span>
        {part ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <GenBadge gen={part.gen} />
            <span style={{ color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {part.name}
            </span>
          </div>
        ) : (
          <span style={{ color: '#2a3545' }}>EMPTY</span>
        )}
      </div>
      {part && (
        <button onClick={() => onUninstall(slot)} style={{
          background: 'none', border: `1px solid ${COLORS.danger}44`, color: COLORS.danger,
          fontSize: '8px', padding: '1px 6px', cursor: 'pointer', borderRadius: '2px',
          fontFamily: 'inherit', letterSpacing: '0.5px', flexShrink: 0, marginLeft: '4px',
        }}>REMOVE</button>
      )}
    </div>
  );
}

// ─── MARKET LISTING ROW ───────────────────────────────────────
function MarketRow({ partId, price, qty, trend, ratio, onBuy, canAfford, alreadyOwned }) {
  const part = PARTS_BY_ID[partId];
  if (!part) return null;
  const statKeys = Object.keys(part.stats);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 10px', marginBottom: '4px', borderRadius: '4px',
      background: COLORS.bgPanel,
      border: `1px solid ${alreadyOwned ? `${COLORS.secondary}30` : COLORS.border}`,
      opacity: qty === 0 ? 0.4 : 1,
    }}>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <GenBadge gen={part.gen} />
          <RarityBadge rarity={part.rarity} />
          <span style={{
            color: alreadyOwned ? COLORS.secondary : COLORS.text,
            fontSize: '11px', fontWeight: 600,
          }}>
            {alreadyOwned ? '✓ ' : ''}{part.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {statKeys.map(k => (
            <StatDisplay key={k} label={k} value={part.stats[k]} />
          ))}
          {part.power > 0 && <StatDisplay label="pwr" value={part.power} unit="W" />}
        </div>
        <div style={{ color: '#3a4a55', fontSize: '9px', marginTop: '2px' }}>{part.desc}</div>
      </div>

      {/* Price + buy */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          <TrendArrow trend={trend} ratio={ratio} />
          <span style={{ color: COLORS.warning, fontSize: '12px', fontWeight: 600 }}>{fmt(price)}</span>
        </div>
        <div style={{ color: COLORS.textDim, fontSize: '9px', marginBottom: '4px' }}>×{qty} in stock</div>
        <button
          onClick={() => onBuy(partId, price)}
          disabled={!canAfford || qty === 0}
          style={{
            background: canAfford && qty > 0 ? `${COLORS.secondary}20` : 'transparent',
            border: `1px solid ${canAfford && qty > 0 ? COLORS.secondary : COLORS.border}`,
            color: canAfford && qty > 0 ? COLORS.secondary : COLORS.textDim,
            fontSize: '10px', padding: '3px 12px', cursor: canAfford && qty > 0 ? 'pointer' : 'default',
            borderRadius: '3px', fontFamily: 'inherit', letterSpacing: '1px',
          }}
        >BUY</button>
      </div>
    </div>
  );
}

// ─── PARTS BAG ROW ────────────────────────────────────────────
function BagRow({ partId, onInstall, onSell, sellPrice, rig }) {
  const part = PARTS_BY_ID[partId];
  if (!part) return null;
  const isInstalled = rig[part.slot] === partId;
  const slotOccupied = rig[part.slot] && rig[part.slot] !== partId;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 8px', marginBottom: '3px', borderRadius: '3px',
      background: isInstalled ? `${COLORS.secondary}08` : COLORS.bgPanel,
      border: `1px solid ${isInstalled ? `${COLORS.secondary}30` : COLORS.border}`,
      fontSize: '10px',
    }}>
      <span style={{ color: COLORS.textDim, width: '28px', fontSize: '8px', letterSpacing: '1px' }}>
        {SLOT_LABELS[part.slot]}
      </span>
      <GenBadge gen={part.gen} />
      <span style={{ color: COLORS.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {part.name}
      </span>

      {!isInstalled && (
        <button onClick={() => onInstall(partId)} style={{
          background: `${COLORS.primary}20`, border: `1px solid ${COLORS.primary}55`,
          color: COLORS.primary, fontSize: '8px', padding: '2px 8px',
          cursor: 'pointer', borderRadius: '2px', fontFamily: 'inherit',
        }}>{slotOccupied ? 'SWAP' : 'INSTALL'}</button>
      )}
      {isInstalled && (
        <span style={{ color: COLORS.secondary, fontSize: '8px', letterSpacing: '1px' }}>ACTIVE</span>
      )}
      <button onClick={() => onSell(partId)} style={{
        background: 'none', border: `1px solid ${COLORS.warning}33`,
        color: COLORS.warning, fontSize: '8px', padding: '2px 8px',
        cursor: 'pointer', borderRadius: '2px', fontFamily: 'inherit',
      }}>SELL {fmt(sellPrice)}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HardwareMarket({
  money, rig, partsBag, marketData,
  onBuy, onSell, onInstall, onUninstall, onRefresh,
  returnToGame, currentRegion,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('price'); // price | gen | rarity

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') returnToGame();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [returnToGame]);

  // Filter market stock by tab
  const filteredStock = useMemo(() => {
    let items = marketData?.stock || [];
    if (activeTab !== 'all') {
      items = items.filter(s => {
        const part = PARTS_BY_ID[s.partId];
        return part && part.slot === activeTab;
      });
    }
    // Sort
    items = [...items].sort((a, b) => {
      const pa = PARTS_BY_ID[a.partId], pb = PARTS_BY_ID[b.partId];
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'gen') return (GENS[pb?.gen]?.tier || 0) - (GENS[pa?.gen]?.tier || 0);
      if (sortBy === 'rarity') {
        const r = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
        return (r[pb?.rarity] || 0) - (r[pa?.rarity] || 0);
      }
      return 0;
    });
    return items;
  }, [marketData, activeTab, sortBy]);

  // Owned part IDs (installed + bag)
  const ownedIds = useMemo(() => {
    const ids = new Set(partsBag);
    SLOTS.forEach(s => { if (rig[s]) ids.add(rig[s]); });
    return ids;
  }, [rig, partsBag]);

  const tabs = [{ id: 'all', label: 'ALL' }, ...SLOTS.map(s => ({ id: s, label: SLOT_LABELS[s] }))];

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      fontFamily: "'Consolas','Fira Code','JetBrains Mono',monospace",
      zIndex: 20, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{
        padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div>
          <span style={{ color: COLORS.warning, letterSpacing: '2px', fontSize: '14px' }}>
            ─── HARDWARE MARKET ───
          </span>
          <span style={{ color: COLORS.textDim, fontSize: '10px', marginLeft: '12px' }}>
            {currentRegion?.toUpperCase().replace('-', ' ')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: COLORS.textDim, fontSize: '11px' }}>
            WALLET: <span style={{ color: COLORS.warning }}>{fmt(money)}</span>
          </span>
          <button onClick={returnToGame} style={{
            background: 'transparent', color: COLORS.warning,
            border: `1px solid ${COLORS.warning}55`, padding: '4px 12px',
            cursor: 'pointer', fontFamily: 'inherit', borderRadius: '3px',
            fontSize: '10px', letterSpacing: '1px',
          }}>[ESC] EXIT</button>
        </div>
      </div>

      {/* EVENT TICKER */}
      {marketData?.events?.length > 0 && (
        <div style={{
          padding: '6px 16px', background: 'rgba(255,216,102,0.06)',
          borderBottom: `1px solid ${COLORS.warning}22`,
          display: 'flex', gap: '24px', overflow: 'hidden',
        }}>
          {marketData.events.map((e, i) => (
            <span key={i} style={{ color: COLORS.warning, fontSize: '10px', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>
              ▸ {e}
            </span>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={{
        display: 'flex', gap: '2px', padding: '8px 16px 0',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? `${COLORS.primary}18` : 'transparent',
            border: 'none', borderBottom: activeTab === t.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
            color: activeTab === t.id ? COLORS.primary : COLORS.textDim,
            padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '9px', letterSpacing: '1px',
          }}>{t.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '6px' }}>
          <span style={{ color: COLORS.textDim, fontSize: '8px' }}>SORT:</span>
          {['price', 'gen', 'rarity'].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              background: sortBy === s ? `${COLORS.primary}18` : 'transparent',
              border: `1px solid ${sortBy === s ? COLORS.primary + '44' : 'transparent'}`,
              color: sortBy === s ? COLORS.primary : COLORS.textDim,
              padding: '2px 6px', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '8px', borderRadius: '2px', letterSpacing: '0.5px',
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: MARKET LISTINGS */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '10px 12px',
          scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent`,
        }}>
          {filteredStock.length === 0 && (
            <div style={{ color: COLORS.textDim, textAlign: 'center', padding: '40px', fontSize: '12px' }}>
              No parts available in this category for {currentRegion}
            </div>
          )}
          {filteredStock.map(item => (
            <MarketRow
              key={item.partId}
              {...item}
              onBuy={onBuy}
              canAfford={money >= item.price}
              alreadyOwned={ownedIds.has(item.partId)}
            />
          ))}
        </div>

        {/* RIGHT: RIG + BAG */}
        <div style={{
          width: '280px', borderLeft: `1px solid ${COLORS.border}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Rig synergy */}
          <div style={{ padding: '10px', borderBottom: `1px solid ${COLORS.border}` }}>
            <SynergyPanel rig={rig} />
            {/* Installed slots */}
            {SLOTS.map(s => (
              <RigSlotRow key={s} slot={s} partId={rig[s]} onUninstall={onUninstall} />
            ))}
          </div>

          {/* Parts bag */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px', scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
            <div style={{
              fontSize: '9px', letterSpacing: '2px', color: COLORS.textDim,
              marginBottom: '6px', display: 'flex', justifyContent: 'space-between',
            }}>
              <span>INVENTORY ({partsBag.length})</span>
            </div>
            {partsBag.length === 0 && (
              <div style={{ color: '#2a3545', fontSize: '10px', textAlign: 'center', padding: '16px' }}>
                No spare parts
              </div>
            )}
            {partsBag.map((pid, i) => (
              <BagRow
                key={`${pid}-${i}`}
                partId={pid}
                onInstall={onInstall}
                onSell={onSell}
                sellPrice={getSellPrice(pid, marketData?.stock || [])}
                rig={rig}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
