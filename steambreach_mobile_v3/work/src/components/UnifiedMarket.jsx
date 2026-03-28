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
function RigSlot({slot,partId,onRemove}){
  const part=partId?PARTS_BY_ID[partId]:null;
  return(
    <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'8px 10px',borderRadius:'2px',fontSize:'12px',
      background:part?'rgba(120,220,232,0.04)':'rgba(255,255,255,0.02)',
      border:`1px solid ${part?C.bdr:'rgba(255,255,255,0.04)'}`,marginBottom:'2px'}}>
      <span style={{color:C.dim,width:'28px',fontSize:'13px',letterSpacing:'1px',flexShrink:0}}>
        {TAB_LABELS[slot]}
      </span>
      {part?(
        <div style={{display:'flex',alignItems:'center',gap:'4px',flex:1,minWidth:0}}>
          <GenBadge gen={part.gen}/>
          <span style={{color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{part.name}</span>
        </div>
      ):<span style={{color:'#2a3545',flex:1}}>—</span>}
      {part&&<button onClick={()=>onRemove(slot)} style={{background:'none',border:`1px solid ${C.dan}33`,color:C.dan,
        fontSize:'13px',padding:'1px 5px',cursor:'pointer',borderRadius:'2px',fontFamily:'inherit',flexShrink:0}}>×</button>}
    </div>
  );
}

// ─── MARKET ROW (Hardware/Software) ───────────────────────────
function MarketRow({partId,price,qty,trend,ratio,onBuy,canAfford,owned}){
  const part=PARTS_BY_ID[partId]; if(!part)return null;
  const isSW=part.type==='software';
  const stats=Object.entries(part.stats).filter(([k])=>k!=='effect'&&k!=='type');
  return(
    <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 8px',marginBottom:'3px',borderRadius:'3px',
      background:C.bgP,border:`1px solid ${owned?`${C.sec}30`:C.bdr}`,opacity:qty===0?.4:1}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'2px',flexWrap:'wrap'}}>
          <RarityDot rarity={part.rarity}/>
          {!isSW&&<GenBadge gen={part.gen}/>}
          {isSW&&<span style={{fontSize:'13px',color:C.chat,letterSpacing:'1px',padding:'0 4px',border:`1px solid ${C.chat}33`,borderRadius:'2px'}}>SW</span>}
          <span style={{color:owned?C.sec:C.text,fontSize:'13px',fontWeight:600}}>{owned?'✓ ':''}{part.name}</span>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {stats.map(([k,v])=><span key={k} style={{fontSize:'12px',color:C.dim}}>{k}:<span style={{color:C.text}}>{v}</span></span>)}
          {part.power>0&&<span style={{fontSize:'12px',color:C.dim}}>pwr:<span style={{color:C.text}}>{part.power}W</span></span>}
        </div>
        <div style={{color:'#3a4a55',fontSize:'13px',marginTop:'1px'}}>{part.desc}</div>
      </div>
      <div style={{textAlign:'right',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'5px',justifyContent:'flex-end'}}>
          <Trend trend={trend} ratio={ratio}/>
          <span style={{color:C.warn,fontSize:'13px',fontWeight:600}}>{formatBTC(price)}</span>
        </div>
        <div style={{color:C.dim,fontSize:'13px',marginBottom:'3px'}}>×{qty===99?'∞':qty}</div>
        <button onClick={()=>onBuy(partId,price)} disabled={!canAfford||qty===0||(!part.repeatable&&owned)}
          style={{background:canAfford&&qty>0&&(part.repeatable||!owned)?`${C.sec}20`:'transparent',
            border:`1px solid ${canAfford&&qty>0&&(part.repeatable||!owned)?C.sec:C.bdr}`,
            color:canAfford&&qty>0&&(part.repeatable||!owned)?C.sec:C.dim,
            fontSize:'12px',padding:'8px 14px',cursor:canAfford&&qty>0?'pointer':'default',
            borderRadius:'2px',fontFamily:'inherit',letterSpacing:'1px'}}>BUY</button>
      </div>
    </div>
  );
}

// ─── COMMODITY ROW ────────────────────────────────────────────
function CommodityRow({id,data,price,qty,onBuy,onSell,money}){
  const canBuy=money>=price;
  const prevRatio=Math.round(price/data.base*100);
  const trend=prevRatio>130?'up':prevRatio<70?'down':'flat';
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
      <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
        <button onClick={()=>onBuy(id,1)} disabled={!canBuy}
          style={{background:canBuy?`${C.sec}20`:'transparent',border:`1px solid ${canBuy?C.sec:C.bdr}`,
            color:canBuy?C.sec:C.dim,fontSize:'13px',padding:'8px 14px',cursor:canBuy?'pointer':'default',
            borderRadius:'2px',fontFamily:'inherit'}}>BUY</button>
        <button onClick={()=>onSell(id,1)} disabled={qty<1}
          style={{background:qty>0?`${C.warn}20`:'transparent',border:`1px solid ${qty>0?C.warn:C.bdr}`,
            color:qty>0?C.warn:C.dim,fontSize:'13px',padding:'8px 14px',cursor:qty>0?'pointer':'default',
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
  return(
    <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'8px 10px',marginBottom:'2px',borderRadius:'2px',
      fontSize:'12px',background:isInstalled?`${C.sec}08`:C.bgP,border:`1px solid ${isInstalled?`${C.sec}30`:C.bdr}`}}>
      <span style={{color:C.dim,width:'24px',fontSize:'13px',letterSpacing:'1px'}}>{TAB_LABELS[part.slot]?.slice(0,3)||'SW'}</span>
      {part.gen&&<GenBadge gen={part.gen}/>}
      <span style={{color:C.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{part.name}</span>
      {isHW&&!isInstalled&&<button onClick={()=>onInstall(partId)} style={{background:`${C.pri}20`,border:`1px solid ${C.pri}55`,
        color:C.pri,fontSize:'13px',padding:'1px 6px',cursor:'pointer',borderRadius:'2px',fontFamily:'inherit'}}>
        {slotTaken?'SWAP':'SET'}</button>}
      {isInstalled&&<span style={{color:C.sec,fontSize:'13px',letterSpacing:'1px'}}>●</span>}
      <button onClick={()=>onSell(partId)} style={{background:'none',border:`1px solid ${C.warn}33`,
        color:C.warn,fontSize:'13px',padding:'1px 6px',cursor:'pointer',borderRadius:'2px',fontFamily:'inherit'}}>
        {formatBTC(sellPrice)}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function UnifiedMarket({
  money, rig, partsBag, softwareOwned, marketData,
  commodityStash, currentRegion,
  onBuyHW, onSellHW, onInstall, onUninstall,
  onBuySW, onBuyCommodity, onSellCommodity,
  returnToGame,
}){
  const [tab,setTab]=useState('cpu');
  const [sort,setSort]=useState('price');

  useEffect(()=>{
    const h=e=>{if(e.key==='Escape')returnToGame();};
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  },[returnToGame]);

  const btc=marketData?.btcIndex||1;
  const trend=btcTrend(btc);

  // Filter + sort stock
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
          <span style={{color:C.warn,letterSpacing:'2px',fontSize:'13px'}}>₿ MARKET</span>
          <span style={{color:C.dim,fontSize:'12px'}}>{currentRegion?.toUpperCase().replace('-',' ')}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          {/* BTC ticker */}
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
        {/* LEFT: LISTINGS — full width on mobile */}
        {(!isMobile || mobileView==='shop') && (
        <div style={{flex:1,overflow:'auto',padding:'8px 10px',scrollbarWidth:'thin',scrollbarColor:`${C.bdr} transparent`}}>
          {tab==='commodities'?(
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
                  canAfford={money>=item.price}
                  owned={ownedIds.has(item.partId)}/>
              ))}
            </div>
          )}
        </div>
        )}

        {/* RIGHT: RIG + BAG — full width on mobile when toggled */}
        {(!isMobile || mobileView==='rig') && (
        <div style={{width:isMobile?'100%':'250px',borderLeft:isMobile?'none':`1px solid ${C.bdr}`,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'8px',borderBottom:`1px solid ${C.bdr}`,overflow:'auto',scrollbarWidth:'thin',scrollbarColor:`${C.bdr} transparent`}}>
            <SynergyPanel rig={rig}/>
            {HW_SLOTS.map(s=><RigSlot key={s} slot={s} partId={rig[s]} onRemove={onUninstall}/>)}
          </div>
          <div style={{flex:1,overflow:'auto',padding:'6px',scrollbarWidth:'thin',scrollbarColor:`${C.bdr} transparent`}}>
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
