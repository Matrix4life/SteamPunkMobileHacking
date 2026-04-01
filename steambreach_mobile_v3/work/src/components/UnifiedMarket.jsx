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
      <div style={{marginBottom:'5px'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'2px'}}>
          <span style={{color:C.dim}}>POWER</span>
          <span style={{color:pow.stable?C.sec:C.dan}}>{pow.totalDraw}W/{pow.psuWattage||'—'}W</span>
        </div>
        <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:'2px',width:`${Math.min(100,pow.utilPct)}%`,
            background:pow.utilPct>100?C.dan:pow.utilPct>85?C.warn:C.sec,transition:'width .3s'}}/>
        </div>
        {!pow.stable&&<div style={{color:C.dan,fontSize:'13px',marginTop:'2px',letterSpacing:'1px'}}>⚠ OVERLOADED</div>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 10px',fontSize:'13px'}}>
        <div style={{color:C.dim}}>Hash: <span style={{color:C.pri}}>{fx.hashSpeed}x</span></div>
        <div style={{color:C.dim}}>Proxy: <span style={{color:C.pri}}>{fx.maxProxies}</span></div>
      </div>
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
        <span style={{color:C.dim,width:'30px',fontSize:'13px',fontWeight:'bold'}}>{TAB_LABELS[slot]}</span>
        {part?(
          <div style={{display:'flex',alignItems:'center',gap:'5px',flex:1,minWidth:0}}>
            <GenBadge gen={part.gen}/>
            <span style={{color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{part.name}</span>
          </div>
        ):<span style={{color:'#2a3545',flex:1}}>— empty</span>}
      </div>
      {part&&(
        <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
          <button onClick={()=>onRemove(slot)} style={{flex:1,background:'none',border:`1px solid ${C.pri}44`,color:C.pri,fontSize:'11px',padding:'8px',cursor:'pointer',borderRadius:'3px'}}>REMOVE</button>
          <button onClick={()=>onSell(partId)} style={{flex:1,background:'none',border:`1px solid ${C.warn}44`,color:C.warn,fontSize:'11px',padding:'8px',cursor:'pointer',borderRadius:'3px'}}>SELL {formatBTC(sellP)}</button>
        </div>
      )}
    </div>
  );
}

// ─── MARKET ROW ───────────────────────────────────────────
function MarketRow({partId,price,qty,trend,ratio,onBuy,onBuyAndInstall,canAfford,owned}){
  const part=PARTS_BY_ID[partId]; if(!part)return null;
  const isHW=part.type==='hardware';
  const canBuy=canAfford&&qty>0&&(part.repeatable||!owned);
  return(
    <div style={{padding:'10px',marginBottom:'6px',borderRadius:'4px',background:C.bgP,border:`1px solid ${owned?`${C.sec}30`:C.bdr}`}}>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'2px'}}>
            <RarityDot rarity={part.rarity}/>
            {isHW&&<GenBadge gen={part.gen}/>}
            <span style={{color:owned?C.sec:C.text,fontSize:'13px',fontWeight:600}}>{owned?'✓ ':''}{part.name}</span>
          </div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <Trend trend={trend} ratio={ratio}/>
          <span style={{color:C.warn,fontSize:'13px',fontWeight:600,marginLeft:'5px'}}>{formatBTC(price)}</span>
        </div>
      </div>
      <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
        <button onClick={()=>onBuy(partId,price)} disabled={!canBuy} style={{flex:1,background:canBuy?`${C.sec}20`:'transparent',border:`1px solid ${canBuy?C.sec:C.bdr}`,color:canBuy?C.sec:C.dim,fontSize:'12px',padding:'8px',cursor:canBuy?'pointer':'default',borderRadius:'4px'}}>BUY</button>
        {isHW&&<button onClick={()=>onBuyAndInstall(partId,price)} disabled={!canBuy} style={{flex:1,background:canBuy?`${C.pri}20`:'transparent',border:`1px solid ${canBuy?C.pri:C.bdr}`,color:canBuy?C.pri:C.dim,fontSize:'12px',padding:'8px',cursor:canBuy?'pointer':'default',borderRadius:'4px'}}>BUY+INSTALL</button>}
      </div>
    </div>
  );
}

// ─── BAG ROW ──────────────────────────────────────────────────
function BagRow({partId,onInstall,onSell,sellPrice,rig}){
  const part=PARTS_BY_ID[partId]; if(!part)return null;
  const isHW=part.type==='hardware';
  const slotKey = part.slot.toLowerCase();
  const isInstalled=isHW&&rig[slotKey]===partId;
  return(
    <div style={{padding:'10px 12px',marginBottom:'6px',borderRadius:'4px',fontSize:'13px',background:isInstalled?`${C.sec}08`:C.bgP,border:`1px solid ${isInstalled?`${C.sec}30`:C.bdr}`}}>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        <span style={{color:C.dim,width:'28px',fontSize:'13px',fontWeight:'bold'}}>{TAB_LABELS[part.slot]?.slice(0,3)||'SW'}</span>
        <span style={{color:C.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{part.name}</span>
        {isInstalled&&<span style={{color:C.sec,fontSize:'12px',fontWeight:'bold'}}>INSTALLED</span>}
      </div>
      <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
        {isHW&&!isInstalled&&<button onClick={()=>onInstall(partId)} style={{flex:1,background:`${C.pri}20`,border:`1px solid ${C.pri}`,color:C.pri,fontSize:'12px',padding:'8px',cursor:'pointer',borderRadius:'4px'}}>INSTALL</button>}
        <button onClick={()=>onSell(partId)} style={{flex:isInstalled?1:0,background:`${C.warn}15`,border:`1px solid ${C.warn}55`,color:C.warn,fontSize:'12px',padding:'8px',cursor:'pointer',borderRadius:'4px'}}>SELL {formatBTC(sellPrice)}</button>
      </div>
    </div>
  );
}

export default function UnifiedMarket({
  money, rig, partsBag, softwareOwned, marketData,
  commodityStash, currentRegion,
  onBuyHW, onSellHW, onInstall, onUninstall, onBuyAndInstall,
  onBuySW, onBuyCommodity, onSellCommodity,
  returnToGame,
}){
  const [tab,setTab]=useState('cpu');
  const [sort,setSort]=useState('price');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [mobileView, setMobileView] = useState('shop');

  const btc=marketData?.btcIndex||1;
  const trend=btcTrend(btc);

  const filtered=useMemo(()=>{
    let items=marketData?.stock||[];
    if(tab!=='commodities'){
      items=items.filter(s=>{const p=PARTS_BY_ID[s.partId]; return p&&(tab==='software'?p.type==='software':p.slot===tab);});
    }
    return[...items].sort((a,b)=>a.price-b.price);
  },[marketData,tab]);

  const ownedIds=useMemo(()=>{
    const s=new Set([...partsBag,...softwareOwned]);
    Object.values(rig).forEach(id=>{if(id)s.add(id);});
    return s;
  },[rig,partsBag,softwareOwned]);

  return(
    <div style={{background:C.bg,color:C.text,position:'absolute',inset:0,zIndex:20,display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:"monospace"}}>
      <div style={{padding:'8px 14px',borderBottom:`1px solid ${C.bdr}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{color:C.warn,letterSpacing:'2px'}}>BLACK MARKET</span>
          <span style={{color:C.dim}}>{currentRegion?.toUpperCase()}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <span style={{color:C.warn}}>BAL: {formatBTC(money)}</span>
          <button onClick={returnToGame} style={{background:'transparent',color:C.warn,border:`1px solid ${C.warn}55`,padding:'8px 14px',cursor:'pointer'}}>[ESC]</button>
        </div>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* LEFT LISTINGS */}
        <div style={{flex:1,overflowY:'auto',padding:'10px'}}>
           {filtered.map(item=>(
             <MarketRow key={item.partId} {...item} onBuy={item.partId.startsWith('sw_')?onBuySW:onBuyHW} onBuyAndInstall={onBuyAndInstall} canAfford={money>=item.price} owned={ownedIds.has(item.partId)}/>
           ))}
        </div>

        {/* RIGHT SIDEBAR (Fixed overflow) */}
        <div style={{ width: isMobile ? '100%' : '300px', borderLeft: `1px solid ${C.bdr}`, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* RIG SECTION */}
          <div style={{ flex: '0 1 auto', maxHeight: '50%', overflowY: 'auto', padding: '10px', borderBottom: `1px solid ${C.bdr}` }}>
            <SynergyPanel rig={rig}/>
            {HW_SLOTS.map(s => <RigSlot key={s} slot={s} partId={rig[s.toLowerCase()]} onRemove={onUninstall} onSell={onSellHW}/>)}
          </div>
          
          {/* INVENTORY SECTION */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{color:C.dim, marginBottom:'10px', fontSize:'12px'}}>INVENTORY ({partsBag.length})</div>
            {partsBag.map((pid,i)=><BagRow key={`${pid}-${i}`} partId={pid} onInstall={onInstall} onSell={onSellHW} sellPrice={getSellPrice(pid,[])} rig={rig}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}
