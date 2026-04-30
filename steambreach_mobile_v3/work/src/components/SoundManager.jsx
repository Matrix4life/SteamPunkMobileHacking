import React, { useState, useRef, useEffect } from 'react';
import {
  setSoundMap,
  setSoundEnabled,
  setVolume as engineSetVolume,
  playSuccess, playFailure, playRootShell, playExfil, playTraceWarning,
  playHeatSpike, playBlip, playDestroy, playBeacon,
  playNmap, playBreach, playSocial, playTunnel, playDisconnect,
  playStealth, playMiner, playMinerTick, playDump, playWipe,
  playSniff, playAlarm, playZeroDay, playContractDone,
} from '../audio/soundEngine';

// ─────────────────────────────────────────────────────────────────
// SOUND SLOTS — id must match the key used in soundEngine play(id,…)
// ─────────────────────────────────────────────────────────────────
const SOUND_SLOTS = [
  { id: 'nmap',         label: 'NMAP SCAN',            desc: 'nmap, nmap <ip>, wardrive',                   icon: '◎', fn: playNmap },
  { id: 'breach',       label: 'BREACH',               desc: 'hydra, sqlmap, msfconsole, curl',             icon: '⚡', fn: playBreach },
  { id: 'social',       label: 'SOCIAL VECTOR',        desc: 'spearphish connect, ettercap intercept',      icon: '◈', fn: playSocial },
  { id: 'sniff',        label: 'ARP SNIFF',            desc: 'ettercap ARP poison active',                  icon: '〜', fn: playSniff },
  { id: 'success',      label: 'GENERIC SUCCESS',      desc: 'misc successful actions fallback',            icon: '▶', fn: playSuccess },
  { id: 'failure',      label: 'COMMAND FAILURE',      desc: 'wrong vector, bad syntax, unknown command',   icon: '✕', fn: playFailure },
  { id: 'blip',         label: 'UI BLIP',              desc: 'ls, cd, cat, download — nav ticks',           icon: '·', fn: playBlip },
  { id: 'disconnect',   label: 'DISCONNECT',           desc: 'exit — clean node disconnect',               icon: '◌', fn: playDisconnect },
  { id: 'rootShell',    label: 'ROOT SHELL',           desc: 'pwnkit — privilege escalation to root',      icon: '⬆', fn: playRootShell },
  { id: 'beacon',       label: 'C2 BEACON',            desc: 'sliver — botnet node added',                 icon: '◉', fn: playBeacon },
  { id: 'tunnel',       label: 'PROXY TUNNEL',         desc: 'chisel — SOCKS5 proxy chain created',        icon: '⊃', fn: playTunnel },
  { id: 'stealth',      label: 'STEALTH MODE',         desc: 'reptile — kernel rootkit installed',         icon: '◐', fn: playStealth },
  { id: 'miner',        label: 'MINER DEPLOY',         desc: 'xmrig — cryptominer deployed',               icon: '⛏', fn: playMiner },
  { id: 'minerTick',    label: 'PASSIVE INCOME',       desc: 'xmrig — passive income tick (3 min)',        icon: '₿', fn: playMinerTick },
  { id: 'exfil',        label: 'EXFILTRATION',         desc: 'exfil, stash — data transfer',               icon: '⬇', fn: playExfil },
  { id: 'dump',         label: 'CREDENTIAL DUMP',      desc: 'mimikatz, hashcat — credentials cascade',    icon: '⇓', fn: playDump },
  { id: 'wipe',         label: 'LOG WIPE',             desc: 'wipe — logs scrubbed, heat reduced',         icon: '⊘', fn: playWipe },
  { id: 'traceWarning', label: 'TRACE WARNING',        desc: 'trace crosses 75%',                          icon: '⚠', fn: playTraceWarning },
  { id: 'heatSpike',    label: 'HEAT SPIKE',           desc: 'honeypot, eternalblue — global heat jump',   icon: '🔥', fn: playHeatSpike },
  { id: 'alarm',        label: 'ALARM — UNDER ATTACK', desc: 'Blue Team retaliation, rival raid',          icon: '⛨', fn: playAlarm },
  { id: 'destroy',      label: 'DESTRUCTION',          desc: 'shred, openssl, crontab — node destroyed',   icon: '☠', fn: playDestroy },
  { id: 'zeroDay',      label: 'ZERO-DAY DROP',        desc: 'rare exploit drop from node',                icon: '◆', fn: playZeroDay },
  { id: 'contractDone', label: 'CONTRACT COMPLETE',    desc: 'fixer contract objective met',               icon: '✦', fn: playContractDone },
];

const SECTIONS = [
  { label: 'RECON & ACCESS',        ids: ['nmap','breach','social','sniff'] },
  { label: 'SYSTEM & NAVIGATION',   ids: ['success','failure','blip','disconnect'] },
  { label: 'PERSISTENCE & PAYLOAD', ids: ['rootShell','beacon','tunnel','stealth','miner','minerTick'] },
  { label: 'LOOT & CLEANUP',        ids: ['exfil','dump','wipe'] },
  { label: 'EVENTS & ALERTS',       ids: ['traceWarning','heatSpike','alarm','destroy','zeroDay','contractDone'] },
];

const STORAGE_KEY = 'hexoverride_sounds_v2';
const slotMap = Object.fromEntries(SOUND_SLOTS.map(s => [s.id, s]));

const loadMeta = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};
const saveMeta = map => {
  const meta = {};
  Object.entries(map).forEach(([k, v]) => { if (v?.name) meta[k] = { name: v.name }; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
};

// Push only real loaded URLs to the engine — never push empty/stale entries.
// This means the synth fallbacks always work; custom audio only overrides when
// a real blob URL exists.
const syncEngine = map => {
  const live = {};
  Object.entries(map).forEach(([k, v]) => {
    if (v?.url && !v.stale) live[k] = v;
  });
  setSoundMap(live);
};

// ─────────────────────────────────────────────────────────────────
const SoundManager = ({ returnToGame }) => {
  // NOTE: onSoundMapChange prop intentionally ignored — engine is wired
  // directly here. HEXOVERRIDE does not need to be in the audio loop.

  const [fileMap, setFileMap] = useState({});   // local UI state only
  const [volume, setVolVol]   = useState(0.7);
  const [audioOn, setAudioOn] = useState(true);
  const [dragging, setDrag]   = useState(null);
  const [feedback, setFb]     = useState('');
  const [testing, setTest]    = useState(null);
  const fileRef   = useRef(null);
  const slotPend  = useRef(null);

  // Restore stale metadata on mount for display only — do NOT push to engine
  useEffect(() => {
    const meta = loadMeta();
    const restored = {};
    Object.entries(meta).forEach(([k, v]) => {
      if (v?.name) restored[k] = { url: null, name: v.name, stale: true };
    });
    setFileMap(restored);
    // Do not call syncEngine here — no real URLs to push
  }, []);

  // Volume & enabled sync — safe to do immediately
  useEffect(() => { engineSetVolume(volume); }, [volume]);
  useEffect(() => { setSoundEnabled(audioOn); }, [audioOn]);

  const fb = (msg, ms = 2800) => { setFb(msg); setTimeout(() => setFb(''), ms); };

  const loadFile = (id, file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) { fb(`✕ ${file.name} — not an audio file`); return; }
    const url = URL.createObjectURL(file);
    setFileMap(prev => {
      const next = { ...prev, [id]: { url, name: file.name, stale: false } };
      saveMeta(next);
      syncEngine(next);   // push real URL immediately
      return next;
    });
    fb(`✓ "${file.name}" → ${slotMap[id]?.label}`);
  };

  const handleDrop = (e, id) => {
    e.preventDefault(); setDrag(null);
    loadFile(id, e.dataTransfer.files[0]);
  };

  const previewFile = id => {
    const e = fileMap[id];
    if (!e?.url) { fb('No custom audio loaded for this slot'); return; }
    setTest(id);
    const a = new Audio(e.url);
    a.volume = volume;
    a.play()
      .then(() => setTimeout(() => setTest(null), 1500))
      .catch(() => { fb('Preview failed — check browser audio permissions'); setTest(null); });
  };

  const previewSynth = id => {
    const slot = slotMap[id];
    if (!slot?.fn) return;
    setTest(id + '_s');
    slot.fn();
    setTimeout(() => setTest(null), 1400);
  };

  const clearSlot = id => {
    setFileMap(prev => {
      const next = { ...prev };
      if (next[id]?.url) URL.revokeObjectURL(next[id].url);
      delete next[id];
      saveMeta(next);
      syncEngine(next);
      return next;
    });
    fb('Slot cleared — synth fallback now active');
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (slotPend.current === '__bulk__') {
      let matched = 0;
      const updates = {};
      files.forEach(file => {
        const base = file.name.replace(/\.[^.]+$/, '').toLowerCase();
        const slot = SOUND_SLOTS.find(s =>
          base === s.id.toLowerCase() || base.includes(s.id.toLowerCase())
        );
        if (slot) {
          updates[slot.id] = { url: URL.createObjectURL(file), name: file.name, stale: false };
          matched++;
        }
      });
      if (matched) {
        setFileMap(prev => {
          const next = { ...prev, ...updates };
          saveMeta(next); syncEngine(next); return next;
        });
        fb(`✓ Auto-matched ${matched} of ${files.length} files`);
      } else {
        fb(`✕ No filenames matched slot IDs — upload individually`);
      }
    } else {
      loadFile(slotPend.current, files[0]);
    }
    slotPend.current = null;
    e.target.value = '';
  };

  const C = {
    bg:'#070710', panel:'#0c0c18', border:'#1a1a30',
    primary:'#00ff88', dim:'#2a2a44', text:'#c8c8e8', textDim:'#4a4a6a',
    danger:'#ff3366', warning:'#ffaa00',
  };

  const loadedCount = Object.values(fileMap).filter(v => v?.url && !v.stale).length;
  const staleCount  = Object.values(fileMap).filter(v => v?.stale).length;

  const btn = (label, onClick, style = {}) => (
    <button onClick={onClick} style={{
      background:'transparent', border:`1px solid ${C.dim}`, color:C.textDim,
      padding:'5px 10px', cursor:'pointer', fontFamily:'inherit',
      fontSize:'10px', letterSpacing:'1px', borderRadius:'2px', ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = style.borderColor || C.dim; e.currentTarget.style.color = style.color || C.textDim; }}
    >{label}</button>
  );

  return (
    <div style={{
      background:C.bg, color:C.text, position:'absolute', inset:0,
      fontFamily:"'Consolas','Fira Code','JetBrains Mono',monospace", fontSize:'13px',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* scanlines */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:50,
        background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />

      <input ref={fileRef} type="file" accept="audio/*" style={{display:'none'}} onChange={handleFileChange} />

      {/* ── HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:`1px solid ${C.border}`, background:C.panel, flexShrink:0, zIndex:10 }}>
        <div>
          <div style={{ color:C.primary, fontSize:'11px', letterSpacing:'4px', fontWeight:'bold' }}>HEXOVERRIDE</div>
          <div style={{ color:C.textDim, fontSize:'10px', letterSpacing:'2px' }}>AUDIO MANAGER — {SOUND_SLOTS.length} SLOTS</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          {/* Audio on/off */}
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>AUDIO</span>
            <div onClick={() => setAudioOn(v => !v)} style={{
              width:'36px', height:'18px', borderRadius:'9px', cursor:'pointer', position:'relative',
              background: audioOn ? `${C.primary}30` : C.border,
              border:`1px solid ${audioOn ? C.primary : C.dim}`, transition:'all 0.2s',
            }}>
              <div style={{
                position:'absolute', top:'2px', width:'12px', height:'12px', borderRadius:'50%',
                left: audioOn ? '18px' : '2px',
                background: audioOn ? C.primary : C.dim, transition:'left 0.2s',
              }} />
            </div>
          </div>
          {/* Volume */}
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>VOL</span>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolVol(parseFloat(e.target.value))}
              style={{ width:'80px', accentColor:C.primary, cursor:'pointer' }} />
            <span style={{ color:C.primary, fontSize:'10px', width:'30px' }}>{Math.round(volume*100)}%</span>
          </div>
          {/* Bulk */}
          {btn('BULK IMPORT', () => {
            fileRef.current.multiple = true; slotPend.current = '__bulk__'; fileRef.current.click();
          })}
          {/* Back */}
          <button onClick={returnToGame} style={{
            background:`${C.primary}15`, border:`1px solid ${C.primary}`, color:C.primary,
            padding:'6px 16px', cursor:'pointer', fontFamily:'inherit',
            fontSize:'11px', letterSpacing:'2px', borderRadius:'2px', fontWeight:'bold',
          }}>← BACK</button>
        </div>
      </div>

      {/* ── FEEDBACK ── */}
      <div style={{ height:'28px', display:'flex', alignItems:'center', padding:'0 20px', flexShrink:0,
        background: feedback ? `${C.primary}08` : 'transparent',
        borderBottom:`1px solid ${feedback ? C.primary+'30' : 'transparent'}`, transition:'all 0.2s' }}>
        <span style={{ color:C.primary, fontSize:'11px', letterSpacing:'1px' }}>{feedback}</span>
      </div>

      {/* ── TIP ── */}
      <div style={{ padding:'7px 20px', background:`${C.warning}07`, borderBottom:`1px solid ${C.warning}18`, flexShrink:0 }}>
        <span style={{ color:C.warning, fontSize:'10px', letterSpacing:'1px' }}>
          BULK IMPORT — name files after slot IDs (e.g.{' '}
          <span style={{color:'#fff'}}>nmap.mp3</span>,{' '}
          <span style={{color:'#fff'}}>breach.wav</span>,{' '}
          <span style={{color:'#fff'}}>zeroDay.ogg</span>). SYNTH button previews built-in fallback.
        </span>
      </div>

      {/* ── SLOTS ── */}
      <div style={{ flexGrow:1, overflowY:'auto', padding:'14px 20px' }}>
        {SECTIONS.map(sec => (
          <div key={sec.label} style={{ marginBottom:'20px' }}>
            <div style={{ fontSize:'9px', letterSpacing:'3px', color:C.textDim, fontWeight:'bold',
              marginBottom:'8px', paddingBottom:'6px', borderBottom:`1px solid ${C.border}` }}>
              {sec.label}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'7px' }}>
              {sec.ids.map(id => {
                const slot    = slotMap[id];
                const entry   = fileMap[id];
                const hasUrl  = !!entry?.url;
                const isStale = !!entry?.stale;
                const isDrag  = dragging === id;

                return (
                  <div key={id}
                    onDragOver={e => { e.preventDefault(); setDrag(id); }}
                    onDragLeave={() => setDrag(null)}
                    onDrop={e => handleDrop(e, id)}
                    style={{
                      border:`1px solid ${isDrag ? C.primary : hasUrl ? C.primary+'35' : C.border}`,
                      background: isDrag ? `${C.primary}08` : hasUrl ? `${C.primary}03` : C.panel,
                      borderRadius:'3px', padding:'11px', transition:'all 0.12s',
                    }}
                  >
                    {/* top row */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                        <span style={{ color: hasUrl ? C.primary : C.dim, fontSize:'14px', width:'18px', textAlign:'center' }}>
                          {slot.icon}
                        </span>
                        <div>
                          <div style={{ color: hasUrl ? C.text : C.textDim, fontSize:'11px', fontWeight:'bold', letterSpacing:'1px' }}>
                            {slot.label}
                          </div>
                          <div style={{ color:C.textDim, fontSize:'10px', marginTop:'1px' }}>{slot.desc}</div>
                        </div>
                      </div>
                      <div style={{
                        fontSize:'9px', letterSpacing:'1px', padding:'2px 6px', borderRadius:'2px',
                        whiteSpace:'nowrap', flexShrink:0, marginLeft:'8px',
                        color:  hasUrl ? (isStale ? C.warning : C.primary) : C.textDim,
                        border: `1px solid ${hasUrl ? (isStale ? C.warning+'44' : C.primary+'44') : C.dim}`,
                        background: hasUrl ? (isStale ? `${C.warning}10` : `${C.primary}10`) : 'transparent',
                      }}>
                        {hasUrl ? (isStale ? '⚠ RE-UPLOAD' : '● CUSTOM') : '○ SYNTH'}
                      </div>
                    </div>

                    {/* filename */}
                    {entry?.name && (
                      <div style={{
                        fontSize:'10px', color: isStale ? C.warning : C.primary, marginBottom:'7px',
                        padding:'3px 7px', background:`${isStale ? C.warning : C.primary}08`,
                        border:`1px solid ${isStale ? C.warning : C.primary}20`, borderRadius:'2px',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>{isStale ? '⚠ ' : '♪ '}{entry.name}</div>
                    )}

                    {isDrag && (
                      <div style={{ fontSize:'10px', color:C.primary, textAlign:'center',
                        padding:'3px 0', marginBottom:'7px', letterSpacing:'2px' }}>DROP TO LOAD</div>
                    )}

                    {/* buttons */}
                    <div style={{ display:'flex', gap:'5px' }}>
                      {/* upload */}
                      {btn(hasUrl && !isStale ? 'REPLACE' : 'UPLOAD', () => {
                        slotPend.current = id;
                        fileRef.current.multiple = false;
                        fileRef.current.click();
                      }, { flex:1 })}

                      {/* test uploaded */}
                      {hasUrl && !isStale && (
                        <button onClick={() => previewFile(id)} style={{
                          background: testing === id ? `${C.primary}30` : `${C.primary}12`,
                          border:`1px solid ${C.primary}55`, color:C.primary,
                          padding:'5px 10px', cursor:'pointer', fontFamily:'inherit',
                          fontSize:'10px', letterSpacing:'1px', borderRadius:'2px',
                        }}>▶ TEST</button>
                      )}

                      {/* test synth — always available */}
                      <button onClick={() => previewSynth(id)} style={{
                        background: testing === id+'_s' ? `${C.dim}80` : 'transparent',
                        border:`1px solid ${C.dim}`, color:C.textDim,
                        padding:'5px 9px', cursor:'pointer', fontFamily:'inherit',
                        fontSize:'10px', letterSpacing:'1px', borderRadius:'2px',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.textDim; e.currentTarget.style.color = C.text; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.dim; e.currentTarget.style.color = C.textDim; }}
                        title="Preview synthesized fallback"
                      >SYNTH</button>

                      {/* clear */}
                      {entry && (
                        <button onClick={() => clearSlot(id)} style={{
                          background:'transparent', border:`1px solid ${C.danger}40`,
                          color:C.danger, padding:'5px 8px', cursor:'pointer',
                          fontFamily:'inherit', fontSize:'10px', borderRadius:'2px',
                        }}>✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding:'7px 20px', borderTop:`1px solid ${C.border}`, background:C.panel,
        display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>
          {loadedCount} / {SOUND_SLOTS.length} CUSTOM LOADED
          {staleCount > 0 && (
            <span style={{ color:C.warning, marginLeft:'12px' }}>
              ⚠ {staleCount} STALE — re-upload needed
            </span>
          )}
        </span>
        <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>
          DRAG & DROP · MP3 · WAV · OGG · FLAC
        </span>
      </div>
    </div>
  );
};

export default SoundManager;
