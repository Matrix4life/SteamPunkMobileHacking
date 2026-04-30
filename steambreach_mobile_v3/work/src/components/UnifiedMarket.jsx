import React, { useState, useMemo, useEffect } from 'react';
import {
  PARTS_BY_ID, PARTS_BY_SLOT, HW_SLOTS, ALL_TABS, TAB_LABELS,
  GENS, RARITY_COLORS, COMMODITIES,
  calculateSynergy, calculatePowerBudget, getRigEffects,
  getSellPrice, formatBTC, btcTrend,
} from '../constants/rigParts';

const C = {
  bg:'#0a0a0f',bgP:'#111118',bgD:'#08080c',
  text:'#fcfcfa',dim:'#727072',
  pri:'#78dce8',sec:'#a9dc76',
  dan:'#ff6188',warn:'#ffd866',
  file:'#fc9867',chat:'#ab9df2',
  bdr:'#2d2a2e',
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────
function GenBadge({gen}){
  const g=GENS[gen]; if(!g)return null;
  return <span style={{fontSize:'12px',fontWeight:700,padding:'1px 5px',background:`${g.color}18`,border:`1px solid ${g.color}55`,color:g.color,borderRadius:'3px',letterSpacing:'.5px'}}>{g.label}</span>;
}
function RarityDot({rarity}){
  return <span style={{width:6,height:6,borderRadius:'50%',background:RARITY_COLORS[rarity],display:'inline-block',flexShrink:0}} title={rarity}/>;
}
function Trend({trend,ratio}){
  const col=trend==='up'?C.dan:trend==='down'?C.sec:C.dim;
  const icon=trend==='up'?'▲':trend==='down'?'▼':'─';
  return <span style={{color:col,fontSize:'12px'}}>{icon}{ratio}%</span>;
}

// ─── SYNERGY PANEL ────────────────────────────────────────────
function SynergyPanel({rig}){
  const syn=calculateSynergy(rig),pow=calculatePowerBudget(rig),fx=getRigEffects(rig);
  const installed=HW_SLOTS.filter(s=>rig[s]).length;
  return(
    <div style={{border:`1px solid ${syn.color}44`,borderRadius:'4px',padding:'8px',marginBottom:'6px',background:`${syn.color}06`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
        <span style={{fontSize:'13px',letterSpacing:'1.5px',color:C.dim}}>SYNERGY</span>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <span style={{fontSize:'18px',fontWeight:700,color:syn.color}}>{syn.rating}</span>
          <span style={{fontSize:'12px',color:syn.color}}>{syn.multiplier}x</span>
        </div>
      </div>
      {/* Power bar */}
      <div style={{marginBottom:'5px'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'2px'}}>
          <span style={{color:C.dim}}>POWER</span>
          <span style={{color:pow.stable?C.sec:C.dan}}>{pow.totalDraw}W/{pow.psuWattage||'—'}W</span>
        </div>
        <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:'2px',width:`${Math.min(100,pow.utilPct)}%`,
            background:pow.utilPct>100?C.dan:pow.utilPct>85?C.warn:C.sec,transition:'width .3s'}}/>
        </div>
        {!pow.stable&&<div style={{color:C.dan,fontSize:'13px',marginTop:'2px',letterSpacing:'1px'}}>⚠ OVERLOADED — {Math.round(fx.failChance*100)}% INSTABILITY</div>}
      </div>
      {/* Stats grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 10px',fontSize:'13px'}}>
        {fx.hashSpeed>0&&<div style={{color:C.dim}}>Hash: <span style={{color:C.pri}}>{fx.hashSpeed}x</span></div>}
        {fx.mineMultiplier>0&&<div style={{color:C.dim}}>Mine: <span style={{color:C.sec}}>{fx.mineMultiplier}x</span></div>}
        <div style={{color:C.dim}}>Proxy: <span style={{color:C.pri}}>{fx.maxProxies}</span></div>
        <div style={{color:C.dim}}>Trace: <span style={{color:C.warn}}>{fx.traceMultiplier}x</span></div>
        <div style={{color:C.dim}}>Exfil: <span style={{color:C.file}}>{fx.exfilMultiplier}x</span></div>
        <div style={{color:C.dim}}>Scan: <span style={{color:C.pri}}>{fx.scanCount}</span></div>
      </div>
      {/* Compat details */}
      {syn.details.filter(d=>d.slotA!=='case').length>0&&(
        <div style={{marginTop:'4px',display:'flex',gap:'4px',flexWrap:'wrap'}}>
          {syn.details.filter(d=>d.slotA!=='case').map((d,i)=>{
            const col=d.label==='PERFECT'?C.warn:d.label==='MATCHED'?C.sec:d.label==='XGEN'?C.chat:
              d.label==='NEUTRAL'?C.dim:d.label==='BOTTLENECK'?C.file:C.dan;
            return <span key={i} style={{fontSize:'13px',color:col,padding:'1px 4px',border:`1px solid ${col}33`,borderRadius:'2px'}}>
              {d.slotA.toUpperCase()}↔{d.slotB.toUpperCase()} {d.label}
            </span>;
          })}
        </div>
      )}
      <div style={{fontSize:'13px',color:C.dim,marginTop:'4px'}}>{installed}/8 SLOTS</div>
    </div>
  );
}

// ─── RIG SLOT ROW ─────────────────────────────────────────────
function RigSlot({slot,partId,onRemove,onSell}){
  const part=partId?PARTS_BY_ID[partId]:null;
  const sellP=part?getSellPrice(partId,[]):0;
  return(
    <div style={{padding:'10px 12px',borderRadius:'4px',fontSize:'13px',
      background:part?'rgba(120,220,232,0.04)':'rgba(255,255,255,0.02)',
      border:`1px solid ${part?C.bdr:'rgba(255,255,255,0.04)'}`,marginBottom:'4px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        <span style={{color:C.dim,width:'30px',fontSize:'13px',letterSpacing:'1px',flexShrink:0,fontWeight:'bold'}}>
          {TAB_LABELS[slot]}
        </span>
        {part?(
          <div style={{display:'flex',alignItems:'center',gap:'5px',flex:1,minWidth:0}}>
            <GenBadge gen={part.gen}/>
            <span style={{color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{part.name}</span>
          </div>
        ):<span style={{color:'#2a3545',flex:1}}>— empty</span>}
      </div>
      {part&&(
        <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
          <button onClick={()=>onRemove(slot)} style={{flex:1,background:'none',border:`1px solid ${C.pri}44`,color:C.pri,
            fontSize:'11px',padding:'8px',cursor:'pointer',borderRadius:'3px',fontFamily:'inherit',fontWeight:'bold',letterSpacing:'0.5px'}}>REMOVE</button>
          {onSell&&<button onClick={()=>onSell(partId)} style={{flex:1,background:'none',border:`1px solid ${C.warn}44`,color:C.warn,
            fontSize:'11px',padding:'8px',cursor:'pointer',borderRadius:'3px',fontFamily:'inherit',fontWeight:'bold'}}>SELL {formatBTC(sellP)}</button>}
        </div>
      )}
    </div>
  );
}

// ─── MARKET ROW (Hardware/Software) ───────────────────────────
function MarketRow({partId,price,qty,trend,ratio,onBuy,onBuyAndInstall,canAfford,owned}){
  const part=PARTS_BY_ID[partId]; if(!part)return null;
  const isSW=part.type==='software';
  const isHW=part.type==='hardware';
  const stats=Object.entries(part.stats).filter(([k])=>k!=='effect'&&k!=='type');
  const canBuy=canAfford&&qty>0&&(part.repeatable||!owned);
  return(
    <div style={{padding:'10px',marginBottom:'6px',borderRadius:'4px',
      background:C.bgP,border:`1px solid ${owned?`${C.sec}30`:C.bdr}`,opacity:qty===0?.4:1}}>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'2px',flexWrap:'wrap'}}>
            <RarityDot rarity={part.rarity}/>
            {!isSW&&<GenBadge gen={part.gen}/>}
            {isSW&&<span style={{fontSize:'12px',color:C.chat,letterSpacing:'1px',padding:'0 4px',border:`1px solid ${C.chat}33`,borderRadius:'2px'}}>SW</span>}
            <span style={{color:owned?C.sec:C.text,fontSize:'13px',fontWeight:600}}>{owned?'✓ ':''}{part.name}</span>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {stats.map(([k,v])=><span key={k} style={{fontSize:'12px',color:C.dim}}>{k}:<span style={{color:C.text}}>{v}</span></span>)}
            {part.power>0&&<span style={{fontSize:'12px',color:C.dim}}>pwr:<span style={{color:C.text}}>{part.power}W</span></span>}
          </div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'5px',justifyContent:'flex-end'}}>
            <Trend trend={trend} ratio={ratio}/>
            <span style={{color:C.warn,fontSize:'13px',fontWeight:600}}>{formatBTC(price)}</span>
          </div>
          <div style={{color:C.dim,fontSize:'12px'}}>×{qty===99?'∞':qty}</div>
        </div>
      </div>
      <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
        <button onClick={()=>onBuy(partId,price)} disabled={!canBuy}
          style={{flex:1,background:canBuy?`${C.sec}20`:'transparent',
            border:`1px solid ${canBuy?C.sec:C.bdr}`,
            color:canBuy?C.sec:C.dim,
            fontSize:'12px',padding:'8px 14px',cursor:canBuy?'pointer':'default',
            borderRadius:'4px',fontFamily:'inherit',letterSpacing:'1px',fontWeight:'bold'}}>BUY</button>
        {isHW&&onBuyAndInstall&&(
          <button onClick={()=>onBuyAndInstall(partId,price)} disabled={!canBuy}
            style={{flex:1,background:canBuy?`${C.pri}20`:'transparent',
              border:`1px solid ${canBuy?C.pri:C.bdr}`,
              color:canBuy?C.pri:C.dim,
              fontSize:'12px',padding:'8px 14px',cursor:canBuy?'pointer':'default',
              borderRadius:'4px',fontFamily:'inherit',letterSpacing:'1px',fontWeight:'bold'}}>BUY+INSTALL</button>
        )}
      </div>
    </div>
  );
}

// ─── COMMODITY ROW ────────────────────────────────────────────
function CommodityRow({id,data,price,qty,onBuy,onSell,money}){
  const [amount, setAmount] = React.useState(1);
  const canBuy = money >= price * amount;
  const canSell = qty >= amount;
  const prevRatio = Math.round(price/data.base*100);
  const trend = prevRatio>130?'up':prevRatio<70?'down':'flat';
  const maxSell = qty;

  return(
    <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px',marginBottom:'3px',borderRadius:'3px',
      background:C.bgP,border:`1px solid ${C.bdr}`}}>
      <div style={{flex:1}}>
        <div style={{color:C.text,fontSize:'13px',fontWeight:600}}>{data.name}</div>
        <div style={{color:'#3a4a55',fontSize:'13px'}}>{data.desc}</div>
      </div>
      <div style={{textAlign:'center',minWidth:'50px'}}>
        <div style={{color:C.warn,fontSize:'13px'}}>{formatBTC(price)}</div>
        <Trend trend={trend} ratio={prevRatio}/>
      </div>
      <div style={{textAlign:'center',minWidth:'40px'}}>
        <div style={{color:C.dim,fontSize:'13px'}}>STASH</div>
        <div style={{color:C.text,fontSize:'12px'}}>{qty}</div>
      </div>
      {/* Quantity input */}
      <div style={{display:'flex',flexDirection:'column',gap:'3px',alignItems:'center'}}>
        <div style={{color:C.dim,fontSize:'10px',letterSpacing:'1px'}}>QTY</div>
        <input
          type="number" min="1" max={Math.max(qty,999)} value={amount}
          onChange={e=>{
            const v=parseInt(e.target.value)||1;
            setAmount(Math.max(1,v));
          }}
          style={{width:'52px',background:'#0a0d12',border:`1px solid ${C.bdr}`,
            color:C.text,fontFamily:'inherit',fontSize:'13px',padding:'4px 6px',
            borderRadius:'2px',textAlign:'center',outline:'none'}}
        />
        {qty>0&&(
          <button onClick={()=>setAmount(qty)}
            style={{background:'transparent',border:`1px solid ${C.bdr}`,color:C.dim,
              fontSize:'9px',padding:'2px 6px',cursor:'pointer',borderRadius:'2px',
              fontFamily:'inherit',letterSpacing:'1px',width:'52px'}}>ALL</button>
        )}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
        <button onClick={()=>onBuy(id,amount)} disabled={!canBuy}
          style={{background:canBuy?`${C.sec}20`:'transparent',border:`1px solid ${canBuy?C.sec:C.bdr}`,
            color:canBuy?C.sec:C.dim,fontSize:'13px',padding:'8px 14px',cursor:canBuy?'pointer':'default',
            borderRadius:'2px',fontFamily:'inherit'}}>BUY</button>
        <button onClick={()=>onSell(id,amount)} disabled={!canSell}
          style={{background:canSell?`${C.warn}20`:'transparent',border:`1px solid ${canSell?C.warn:C.bdr}`,
            color:canSell?C.warn:C.dim,fontSize:'13px',padding:'8px 14px',cursor:canSell?'pointer':'default',
            borderRadius:'2px',fontFamily:'inherit'}}>SELL</button>
      </div>
    </div>
  );
}

// ─── BAG ROW ──────────────────────────────────────────────────
function BagRow({partId,onInstall,onSell,sellPrice,rig}){
  const part=PARTS_BY_ID[partId]; if(!part)return null;
  const isHW=part.type==='hardware';
  const isInstalled=isHW&&rig[part.slot]===partId;
  const slotTaken=isHW&&rig[part.slot]&&rig[part.slot]!==partId;
  const replaceName=slotTaken?PARTS_BY_ID[rig[part.slot]]?.name:'';
  return(
    <div style={{padding:'10px 12px',marginBottom:'6px',borderRadius:'4px',
      fontSize:'13px',background:isInstalled?`${C.sec}08`:C.bgP,border:`1px solid ${isInstalled?`${C.sec}30`:C.bdr}`}}>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        <span style={{color:C.dim,width:'28px',fontSize:'13px',letterSpacing:'1px',fontWeight:'bold'}}>{TAB_LABELS[part.slot]?.slice(0,3)||'SW'}</span>
        {part.gen&&<GenBadge gen={part.gen}/>}
        <span style={{color:C.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{part.name}</span>
        {isInstalled&&<span style={{color:C.sec,fontSize:'12px',fontWeight:'bold'}}>INSTALLED</span>}
      </div>
      <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
        {isHW&&!isInstalled&&(
          <button onClick={()=>onInstall(partId)} style={{flex:1,background:`${C.pri}20`,border:`1px solid ${C.pri}`,
            color:C.pri,fontSize:'12px',padding:'8px 12px',cursor:'pointer',borderRadius:'4px',fontFamily:'inherit',fontWeight:'bold',letterSpacing:'0.5px'}}>
            {slotTaken?`SWAP (replaces ${replaceName?.slice(0,18)||'current'})`:'INSTALL'}</button>
        )}
        <button onClick={()=>onSell(partId)} style={{flex:isInstalled?1:0,background:`${C.warn}15`,border:`1px solid ${C.warn}55`,
          color:C.warn,fontSize:'12px',padding:'8px 12px',cursor:'pointer',borderRadius:'4px',fontFamily:'inherit',fontWeight:'bold'}}>
          SELL {formatBTC(sellPrice)}</button>
      </div>
    </div>
  );
}

// ─── VIRUS LAB PANEL ──────────────────────────────────────────
const ROLES = ['entry','hit','spread','hide','trigger','stay'];
const ROLE_COLORS = {
  entry:   '#78dce8',
  hit:     '#ff6188',
  spread:  '#fc9867',
  hide:    '#ab9df2',
  trigger: '#ffd866',
  stay:    '#a9dc76',
};
const TIER_COLORS = { common:'#727072', uncommon:'#a9dc76', rare:'#78dce8', ghost:'#ab9df2' };

function VirusLabPanel({ virusFragments, virusInventory, onCraftVirus, onDeployVirus, onRaidVirus, money }) {
  const [build, setBuild] = useState({ entry:null, hit:null, spread:null, hide:null, trigger:null, stay:null });
  const [selectedVirus, setSelectedVirus] = useState(null);
  const [virusName, setVirusName] = useState('');

  const frags = virusFragments || { entry:[], hit:[], spread:[], hide:[], trigger:[], stay:[] };

  const calcStats = () => {
    const parts = Object.values(build).filter(Boolean);
    const power = parts.reduce((s,p) => s + (p.power||0), 0);
    const noise = parts.reduce((s,p) => s + (p.noise||0), 0);
    const stability = power - noise;
    const successChance = Math.max(20, Math.min(95, 50 + stability * 5));
    return { power, noise, stability, successChance };
  };

  const getType = () => {
    const hit = build.hit?.key;
    const spread = build.spread?.key;
    if (hit === 'lock') return spread ? 'ransom worm' : 'ransomware';
    if (hit === 'burn') return spread ? 'wiper worm' : 'wiper';
    if (['drain','scrape','tap'].includes(hit)) return spread ? 'stealer worm' : 'stealer';
    if (spread) return 'worm';
    return 'virus';
  };

  const canCraft = build.entry && build.hit;
  const stats = calcStats();
  const virusType = getType();

  const slotFrag = (role, frag) => {
    setBuild(prev => ({ ...prev, [role]: prev[role]?.key === frag.key ? null : frag }));
  };

  const clearBuild = () => setBuild({ entry:null, hit:null, spread:null, hide:null, trigger:null, stay:null });

  const handleCraft = () => {
    if (!canCraft) return;
    onCraftVirus(build, virusName.trim());
    setVirusName('');
    clearBuild();
  };

  const successColor = stats.successChance >= 75 ? C.sec : stats.successChance >= 50 ? C.warn : C.dan;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'10px', height:'100%', overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:`${C.bdr} transparent` }}>

      {/* FRAGMENT INVENTORY */}
      <div style={{ border:`1px solid ${C.bdr}`, borderRadius:'4px', padding:'10px' }}>
        <div style={{ color:C.dim, fontSize:'11px', letterSpacing:'2px', marginBottom:'8px' }}>FRAGMENT INVENTORY — click to slot</div>
        {ROLES.map(role => {
          const list = frags[role] || [];
          return (
            <div key={role} style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'6px', minHeight:'28px' }}>
              <span style={{ color:ROLE_COLORS[role], fontSize:'11px', letterSpacing:'1px', minWidth:'52px', paddingTop:'4px' }}>{role.toUpperCase()}</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', flex:1 }}>
                {list.length === 0 && <span style={{ color:C.bdr, fontSize:'11px', paddingTop:'4px' }}>—</span>}
                {list.map((frag, i) => {
                  const isSlotted = build[role]?.key === frag.key;
                  return (
                    <button key={i} onClick={() => slotFrag(role, frag)}
                      style={{
                        background: isSlotted ? `${ROLE_COLORS[role]}30` : `${C.bgP}`,
                        border: `1px solid ${isSlotted ? ROLE_COLORS[role] : TIER_COLORS[frag.tier] || C.bdr}`,
                        color: isSlotted ? ROLE_COLORS[role] : C.text,
                        padding:'3px 8px', cursor:'pointer', borderRadius:'3px',
                        fontFamily:'inherit', fontSize:'12px', letterSpacing:'0.5px',
                        display:'flex', alignItems:'center', gap:'4px'
                      }}>
                      <span style={{ color: TIER_COLORS[frag.tier], fontSize:'9px' }}>●</span>
                      {frag.key}
                      <span style={{ color:C.dim, fontSize:'10px' }}>p{frag.power}/n{frag.noise}</span>
                    </button>
                  );
                })}
              </div>
              {/* Slotted indicator */}
              {build[role] && (
                <div style={{ display:'flex', alignItems:'center', gap:'4px', border:`1px solid ${ROLE_COLORS[role]}`, padding:'2px 8px', borderRadius:'3px', background:`${ROLE_COLORS[role]}15`, whiteSpace:'nowrap' }}>
                  <span style={{ color:ROLE_COLORS[role], fontSize:'11px' }}>✓ {build[role].key}</span>
                  <button onClick={() => setBuild(prev => ({...prev, [role]:null}))}
                    style={{ background:'transparent', border:'none', color:C.dim, cursor:'pointer', padding:'0 0 0 4px', fontSize:'12px', fontFamily:'inherit' }}>✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BUILD PREVIEW */}
      <div style={{ border:`1px solid ${canCraft ? C.pri+'44' : C.bdr}`, borderRadius:'4px', padding:'10px', background: canCraft ? `${C.pri}06` : 'transparent' }}>
        <div style={{ color:C.dim, fontSize:'11px', letterSpacing:'2px', marginBottom:'10px' }}>BUILD PREVIEW</div>
        {!canCraft && (
          <div style={{ color:C.bdr, fontSize:'12px', textAlign:'center', padding:'10px 0' }}>
            Requires at minimum: <span style={{ color:ROLE_COLORS.entry }}>entry</span> + <span style={{ color:ROLE_COLORS.hit }}>hit</span>
          </div>
        )}
        {canCraft && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <div>
                <div style={{ color:C.text, fontSize:'13px', fontWeight:700, letterSpacing:'1px' }}>{virusType.toUpperCase()}</div>
                <div style={{ color:C.dim, fontSize:'11px', marginTop:'2px' }}>
                  {Object.entries(build).filter(([,v])=>v).map(([role,frag]) => (
                    <span key={role} style={{ marginRight:'8px' }}>
                      <span style={{ color:ROLE_COLORS[role] }}>{role}</span>:{frag.key}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'6px', marginBottom:'12px' }}>
              {[
                { label:'POWER', value:stats.power, color:C.pri },
                { label:'NOISE', value:stats.noise, color:C.dan },
                { label:'STABILITY', value:stats.stability, color:stats.stability>=0?C.sec:C.dan },
                { label:'SUCCESS', value:`${stats.successChance}%`, color:successColor },
              ].map(s => (
                <div key={s.label} style={{ background:C.bgP, border:`1px solid ${C.bdr}`, borderRadius:'3px', padding:'6px', textAlign:'center' }}>
                  <div style={{ color:C.dim, fontSize:'10px', letterSpacing:'1px' }}>{s.label}</div>
                  <div style={{ color:s.color, fontSize:'16px', fontWeight:700 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:'8px' }}>
              <div style={{ color:C.dim, fontSize:'11px', letterSpacing:'2px', marginBottom:'4px' }}>VIRUS NAME (optional)</div>
              <input
                value={virusName}
                onChange={e => setVirusName(e.target.value)}
                placeholder={`${virusType.toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`}
                maxLength={24}
                style={{
                  width:'100%', background:C.bgP, border:`1px solid ${C.bdr}`,
                  color:C.dan, fontFamily:'inherit', fontSize:'13px', padding:'6px 10px',
                  outline:'none', borderRadius:'3px', letterSpacing:'1px', boxSizing:'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.dan}
                onBlur={e => e.target.style.borderColor = C.bdr}
              />
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              <button onClick={handleCraft} disabled={!canCraft}
                style={{ flex:2, padding:'10px', background:`${C.pri}20`, border:`1px solid ${C.pri}`, color:C.pri,
                  fontFamily:'inherit', fontSize:'13px', fontWeight:700, letterSpacing:'1.5px', cursor:'pointer', borderRadius:'3px' }}>
                COMPILE VIRUS
              </button>
              <button onClick={clearBuild}
                style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${C.bdr}`, color:C.dim,
                  fontFamily:'inherit', fontSize:'13px', cursor:'pointer', borderRadius:'3px' }}>
                CLEAR
              </button>
            </div>
          </>
        )}
      </div>

      {/* VIRUS INVENTORY */}
      <div style={{ border:`1px solid ${C.bdr}`, borderRadius:'4px', padding:'10px' }}>
        <div style={{ color:C.dim, fontSize:'11px', letterSpacing:'2px', marginBottom:'8px' }}>
          COMPILED VIRUSES ({(virusInventory||[]).length})
        </div>
        {(virusInventory||[]).length === 0 && (
          <div style={{ color:C.bdr, fontSize:'12px', textAlign:'center', padding:'10px 0' }}>No compiled viruses. Build one above.</div>
        )}
        {(virusInventory||[]).map((virus, i) => {
          const successCol = virus.successChance >= 75 ? C.sec : virus.successChance >= 50 ? C.warn : C.dan;
          const isSelected = selectedVirus === i;
          return (
            <div key={virus.id} onClick={() => setSelectedVirus(isSelected ? null : i)}
              style={{ border:`1px solid ${isSelected ? C.warn : C.bdr}`, borderRadius:'3px', padding:'8px 10px',
                marginBottom:'6px', cursor:'pointer', background: isSelected ? `${C.warn}08` : C.bgP,
                transition:'all 0.1s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <span style={{ color:C.warn, fontSize:'12px', fontWeight:700, letterSpacing:'1px' }}>{virus.code}</span>
                  <span style={{ color:C.dim, fontSize:'11px', marginLeft:'8px' }}>{virus.name}</span>
                  {virus.discoveredNamed && <span style={{ color:C.chat, fontSize:'10px', marginLeft:'6px' }}>★ NAMED</span>}
                </div>
                <span style={{ color:C.dim, fontSize:'11px' }}>{virus.type?.toUpperCase()}</span>
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'5px', fontSize:'11px' }}>
                <span style={{ color:C.pri }}>PWR {virus.power}</span>
                <span style={{ color:C.dan }}>NSE {virus.noise}</span>
                <span style={{ color:successCol }}>SUC {virus.successChance}%</span>
              </div>
              {isSelected && (
               <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); onDeployVirus(virus.id); setSelectedVirus(null); }}
                    style={{ flex:1, padding:'7px', background:`${C.dan}20`, border:`1px solid ${C.dan}`,
                      color:C.dan, fontFamily:'inherit', fontSize:'12px', cursor:'pointer', borderRadius:'3px',
                      fontWeight:700, letterSpacing:'1px' }}>
                    ⚡ DEPLOY
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onRaidVirus(virus.id); setSelectedVirus(null); }}
                    style={{ flex:1, padding:'7px', background:`${C.warn}20`, border:`1px solid ${C.warn}`,
                      color:C.warn, fontFamily:'inherit', fontSize:'12px', cursor:'pointer', borderRadius:'3px',
                      fontWeight:700, letterSpacing:'1px' }}>
                    ⚔ RAID RIVAL
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedVirus(null); }}
                    style={{ padding:'7px 12px', background:'transparent', border:`1px solid ${C.bdr}`,
                      color:C.dim, fontFamily:'inherit', fontSize:'12px', cursor:'pointer', borderRadius:'3px' }}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function UnifiedMarket({
  money, rig, partsBag, softwareOwned, marketData,
  commodityStash, currentRegion,
  onBuyHW, onSellHW, onInstall, onUninstall, onBuyAndInstall,
  onBuySW, onBuyCommodity, onSellCommodity,
  returnToGame,
  virusFragments, virusInventory, onCraftVirus, onDeployVirus, onRaidVirus,
}){
  const [tab,setTab]=useState('cpu');
  const [sort,setSort]=useState('price');

  useEffect(()=>{
    const h=e=>{if(e.key==='Escape')returnToGame();};
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  },[returnToGame]);

  const btc=marketData?.btcIndex||1;
  const trend=btcTrend(btc);

  const filtered=useMemo(()=>{
    let items=marketData?.stock||[];
    if(tab!=='commodities'){
      items=items.filter(s=>{const p=PARTS_BY_ID[s.partId]; return p&&(tab==='software'?p.type==='software':p.slot===tab);});
    }
    return[...items].sort((a,b)=>{
      const pa=PARTS_BY_ID[a.partId],pb=PARTS_BY_ID[b.partId];
      if(sort==='price')return a.price-b.price;
      if(sort==='gen')return(GENS[pb?.gen]?.tier||0)-(GENS[pa?.gen]?.tier||0);
      if(sort==='rarity'){const r={common:0,uncommon:1,rare:2,legendary:3};return(r[pb?.rarity]||0)-(r[pa?.rarity]||0);}
      return 0;
    });
  },[marketData,tab,sort]);

  const ownedIds=useMemo(()=>{
    const s=new Set([...partsBag,...softwareOwned]);
    HW_SLOTS.forEach(sl=>{if(rig[sl])s.add(rig[sl]);});
    return s;
  },[rig,partsBag,softwareOwned]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [mobileView, setMobileView] = useState('shop'); // 'shop' | 'rig'

  return(
    <div style={{background:C.bg,color:C.text,position:'absolute',inset:0,
      fontFamily:"'Consolas','Fira Code','JetBrains Mono',monospace",
      zIndex:20,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* HEADER */}
      <div style={{padding:'8px 14px',borderBottom:`1px solid ${C.bdr}`,
        display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{color:C.warn,letterSpacing:'2px',fontSize:'13px'}}>BLACK MARKET</span>
          <span style={{color:C.dim,fontSize:'12px'}}>{currentRegion?.toUpperCase().replace('-',' ')}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{color:trend.color,fontSize:'12px'}}>{trend.icon}</span>
            <span style={{color:trend.color,fontSize:'12px'}}>{trend.text}</span>
            <span style={{color:C.warn,fontSize:'13px',fontWeight:600}}>×{btc}</span>
          </div>
          <span style={{color:C.dim,fontSize:'13px'}}>
            BAL: <span style={{color:C.warn,fontWeight:600}}>{formatBTC(money)}</span>
          </span>
          <button onClick={returnToGame} style={{background:'transparent',color:C.warn,border:`1px solid ${C.warn}55`,
            padding:'8px 14px',cursor:'pointer',fontFamily:'inherit',borderRadius:'2px',fontSize:'12px',letterSpacing:'1px'}}>
            [ESC]</button>
        </div>
      </div>

      {/* EVENT TICKER */}
      {marketData?.events?.length>0&&(
        <div style={{padding:'4px 14px',background:'rgba(255,216,102,.04)',borderBottom:`1px solid ${C.warn}18`,
          display:'flex',gap:'20px',overflow:'hidden'}}>
          {marketData.events.map((e,i)=>
            <span key={i} style={{color:C.warn,fontSize:'12px',whiteSpace:'nowrap'}}>▸ {e}</span>
          )}
        </div>
      )}

      {/* TABS */}
      <div style={{display:'flex',gap:'1px',padding:'6px 14px 0',borderBottom:`1px solid ${C.bdr}`,
        overflowX:isMobile?'auto':'visible',WebkitOverflowScrolling:'touch',scrollbarWidth:'none',flexWrap:isMobile?'nowrap':'wrap'}}>
        {ALL_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            background:tab===t?`${C.pri}18`:'transparent',border:'none',
            borderBottom:tab===t?`2px solid ${C.pri}`:'2px solid transparent',
            color:tab===t?C.pri:C.dim,padding:isMobile?'10px 12px':'5px 8px',cursor:'pointer',
            fontFamily:'inherit',fontSize:isMobile?'14px':'13px',letterSpacing:'1px',whiteSpace:'nowrap',flexShrink:0}}>{TAB_LABELS[t]}</button>
        ))}
        {!isMobile && <div style={{flex:1}}/>}
        {tab!=='commodities'&&!isMobile&&(
          <div style={{display:'flex',alignItems:'center',gap:'3px',paddingBottom:'4px'}}>
            {['price','gen','rarity'].map(s=>(
              <button key={s} onClick={()=>setSort(s)} style={{
                background:sort===s?`${C.pri}18`:'transparent',border:`1px solid ${sort===s?`${C.pri}44`:'transparent'}`,
                color:sort===s?C.pri:C.dim,padding:'1px 5px',cursor:'pointer',fontFamily:'inherit',
                fontSize:'13px',borderRadius:'2px'}}>{s.toUpperCase()}</button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE SHOP/RIG TOGGLE */}
      {isMobile && (
        <div style={{display:'flex',gap:'4px',padding:'8px 14px',borderBottom:`1px solid ${C.bdr}`}}>
          <button onClick={()=>setMobileView('shop')} style={{
            flex:1,padding:'10px',background:mobileView==='shop'?`${C.pri}18`:'transparent',
            border:`1px solid ${mobileView==='shop'?C.pri:C.bdr}`,borderRadius:'4px',
            color:mobileView==='shop'?C.pri:C.dim,fontFamily:'inherit',fontSize:'14px',
            fontWeight:'bold',cursor:'pointer',letterSpacing:'1px'}}>🏪 SHOP</button>
          <button onClick={()=>setMobileView('rig')} style={{
            flex:1,padding:'10px',background:mobileView==='rig'?`${C.sec}18`:'transparent',
            border:`1px solid ${mobileView==='rig'?C.sec:C.bdr}`,borderRadius:'4px',
            color:mobileView==='rig'?C.sec:C.dim,fontFamily:'inherit',fontSize:'14px',
            fontWeight:'bold',cursor:'pointer',letterSpacing:'1px'}}>🖥 RIG ({HW_SLOTS.filter(s=>rig[s]).length}/8)</button>
        </div>
      )}

      {/* BODY */}
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* LEFT: LISTINGS */}
        {(!isMobile || mobileView==='shop') && (
        <div style={{flex:1,overflow:'auto',padding:'8px 10px',scrollbarWidth:'thin',scrollbarColor:`${C.bdr} transparent`}}>
         {tab==='viruslab'?(
            <VirusLabPanel
              virusFragments={virusFragments}
              virusInventory={virusInventory}
              onCraftVirus={onCraftVirus}
              onDeployVirus={onDeployVirus}
              onRaidVirus={onRaidVirus}
              money={money}
            />
          ):tab==='commodities'?(
            <div>
              {Object.entries(COMMODITIES).map(([id,data])=>(
                <CommodityRow key={id} id={id} data={data}
                  price={marketData?.commodityPrices?.[id]||data.base}
                  qty={commodityStash[id]||0}
                  onBuy={onBuyCommodity} onSell={onSellCommodity} money={money}/>
              ))}
            </div>
          ):(
            <div>
              {filtered.length===0&&<div style={{color:C.dim,textAlign:'center',padding:'30px',fontSize:'13px'}}>No stock in {currentRegion}</div>}
              {filtered.map(item=>(
                <MarketRow key={item.partId} {...item}
                  onBuy={item.partId.startsWith('sw_')?onBuySW:onBuyHW}
                  onBuyAndInstall={!item.partId.startsWith('sw_')?onBuyAndInstall:null}
                  canAfford={money>=item.price}
                  owned={ownedIds.has(item.partId)}/>
              ))}
            </div>
          )}
        </div>
        )}

        {/* RIGHT: RIG + BAG — Overflow fix applied below */}
        {(!isMobile || mobileView==='rig') && (
        <div style={{
          width:isMobile?'100%':'250px',
          borderLeft:isMobile?'none':`1px solid ${C.bdr}`,
          display:'flex',
          flexDirection:'column',
          height:'100%', // Fixed height container
          overflow:'hidden'
        }}>
          {/* Top half: Installed rig (Scrollable) */}
          <div style={{
            flex: '0 1 auto', 
            maxHeight: '60%', 
            padding:'8px',
            borderBottom:`1px solid ${C.bdr}`,
            overflowY:'auto',
            scrollbarWidth:'thin',
            scrollbarColor:`${C.bdr} transparent`
          }}>
            <SynergyPanel rig={rig}/>
            {HW_SLOTS.map(s=><RigSlot key={s} slot={s} partId={rig[s]} onRemove={onUninstall} onSell={onSellHW}/>)}
          </div>
          
          {/* Bottom half: Inventory Bag (Independent Scroll) */}
          <div style={{
            flex:1,
            overflowY:'auto',
            padding:'6px',
            scrollbarWidth:'thin',
            scrollbarColor:`${C.bdr} transparent`
          }}>
            <div style={{fontSize:'13px',letterSpacing:'1.5px',color:C.dim,marginBottom:'4px'}}>
              INVENTORY ({partsBag.length+softwareOwned.length})
            </div>
            {partsBag.length===0&&softwareOwned.length===0&&
              <div style={{color:'#2a3545',fontSize:'12px',textAlign:'center',padding:'12px'}}>Empty</div>}
            {partsBag.map((pid,i)=>
              <BagRow key={`${pid}-${i}`} partId={pid} onInstall={onInstall} onSell={onSellHW}
                sellPrice={getSellPrice(pid,marketData?.stock||[])} rig={rig}/>
            )}
            {softwareOwned.map((sid,i)=>{
              const sw=PARTS_BY_ID[sid]; if(!sw)return null;
              return <div key={`sw-${sid}-${i}`} style={{display:'flex',alignItems:'center',gap:'4px',
                padding:'8px 10px',marginBottom:'2px',borderRadius:'2px',fontSize:'12px',
                background:`${C.chat}08`,border:`1px solid ${C.chat}22`}}>
                <span style={{color:C.chat,fontSize:'13px',letterSpacing:'1px',width:'20px'}}>SW</span>
                <span style={{color:C.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sw.name}</span>
                <span style={{color:C.sec,fontSize:'13px'}}>✓</span>
              </div>;
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
