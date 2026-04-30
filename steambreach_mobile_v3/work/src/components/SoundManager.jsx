import React, { useState, useRef, useEffect } from 'react';
import {
  setSoundMap, setSoundEnabled, setVolume as engineSetVolume,
  playSuccess, playFailure, playRootShell, playExfil, playTraceWarning,
  playHeatSpike, playBlip, playDestroy, playBeacon,
  playNmap, playBreach, playSocial, playTunnel, playDisconnect,
  playStealth, playMiner, playMinerTick, playDump, playWipe,
  playSniff, playAlarm, playZeroDay, playContractDone,
  setMusicVolume,
} from '../audio/soundEngine';

// ─── Supabase config ────────────────────────────────────────────
const SB_URL    = 'https://vryxhveadpvhgvhyyary.supabase.co';
const SB_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeXhodmVhZHB2aGd2aHl5YXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDY0MjQsImV4cCI6MjA4NjU4MjQyNH0.oFKmpikruOlEAAUJqQnaQhEwN-J5CHktgyJsnvxJSjw';
const BUCKET    = 'game-sounds';
const HEADERS   = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const sbUpload = async (slotId, file) => {
  const ext  = file.name.split('.').pop();
  const path = `${slotId}.${ext}`;
  // Delete existing file first (ignore errors)
  await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, { method: 'DELETE', headers: HEADERS }).catch(() => {});
  // Upload new file
  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;
};

const sbSaveSlot = async (slotId, fileName, fileUrl) => {
  await fetch(`${SB_URL}/rest/v1/game_sounds`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ slot_id: slotId, file_name: fileName, file_url: fileUrl, updated_at: new Date().toISOString() }),
  });
};

const sbDeleteSlot = async (slotId, fileName) => {
  const ext  = fileName?.split('.').pop() || '';
  const path = `${slotId}.${ext}`;
  await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, { method: 'DELETE', headers: HEADERS }).catch(() => {});
  await fetch(`${SB_URL}/rest/v1/game_sounds?slot_id=eq.${slotId}`, { method: 'DELETE', headers: HEADERS });
};

const sbFetchAll = async () => {
  const res = await fetch(`${SB_URL}/rest/v1/game_sounds?select=*`, { headers: HEADERS });
  if (!res.ok) return [];
  return res.json();
};

// ─── Sound slots ────────────────────────────────────────────────
const SOUND_SLOTS = [
  { id:'bgMusic',       label:'BACKGROUND MUSIC',     desc:'Loops during gameplay — any audio file',        icon:'♫', fn:null },
  { id:'nmap',          label:'NMAP SCAN',             desc:'nmap, nmap <ip>, wardrive',                    icon:'◎', fn:playNmap },
  { id:'breach',        label:'BREACH',                desc:'hydra, sqlmap, msfconsole, curl',              icon:'⚡', fn:playBreach },
  { id:'social',        label:'SOCIAL VECTOR',         desc:'spearphish connect, ettercap intercept',       icon:'◈', fn:playSocial },
  { id:'sniff',         label:'ARP SNIFF',             desc:'ettercap ARP poison active',                   icon:'〜', fn:playSniff },
  { id:'success',       label:'GENERIC SUCCESS',       desc:'misc successful actions fallback',             icon:'▶', fn:playSuccess },
  { id:'failure',       label:'COMMAND FAILURE',       desc:'wrong vector, bad syntax, unknown command',    icon:'✕', fn:playFailure },
  { id:'blip',          label:'UI BLIP',               desc:'ls, cd, cat, download — nav ticks',           icon:'·', fn:playBlip },
  { id:'disconnect',    label:'DISCONNECT',            desc:'exit — clean node disconnect',                icon:'◌', fn:playDisconnect },
  { id:'rootShell',     label:'ROOT SHELL',            desc:'pwnkit — privilege escalation to root',       icon:'⬆', fn:playRootShell },
  { id:'beacon',        label:'C2 BEACON',             desc:'sliver — botnet node added',                  icon:'◉', fn:playBeacon },
  { id:'tunnel',        label:'PROXY TUNNEL',          desc:'chisel — SOCKS5 proxy chain created',         icon:'⊃', fn:playTunnel },
  { id:'stealth',       label:'STEALTH MODE',          desc:'reptile — kernel rootkit installed',          icon:'◐', fn:playStealth },
  { id:'miner',         label:'MINER DEPLOY',          desc:'xmrig — cryptominer deployed',                icon:'⛏', fn:playMiner },
  { id:'minerTick',     label:'PASSIVE INCOME',        desc:'xmrig — passive income tick (3 min)',         icon:'₿', fn:playMinerTick },
  { id:'exfil',         label:'EXFILTRATION',          desc:'exfil, stash — data transfer',                icon:'⬇', fn:playExfil },
  { id:'dump',          label:'CREDENTIAL DUMP',       desc:'mimikatz, hashcat — credentials cascade',     icon:'⇓', fn:playDump },
  { id:'wipe',          label:'LOG WIPE',              desc:'wipe — logs scrubbed, heat reduced',          icon:'⊘', fn:playWipe },
  { id:'traceWarning',  label:'TRACE WARNING',         desc:'trace crosses 75%',                           icon:'⚠', fn:playTraceWarning },
  { id:'heatSpike',     label:'HEAT SPIKE',            desc:'honeypot, eternalblue — global heat jump',    icon:'🔥', fn:playHeatSpike },
  { id:'alarm',         label:'ALARM — UNDER ATTACK',  desc:'Blue Team retaliation, rival raid',           icon:'⛨', fn:playAlarm },
  { id:'destroy',       label:'DESTRUCTION',           desc:'shred, openssl, crontab — node destroyed',    icon:'☠', fn:playDestroy },
  { id:'zeroDay',       label:'ZERO-DAY DROP',         desc:'rare exploit drop from node',                 icon:'◆', fn:playZeroDay },
  { id:'contractDone',  label:'CONTRACT COMPLETE',     desc:'fixer contract objective met',                icon:'✦', fn:playContractDone },
];

const SECTIONS = [
  { label:'BACKGROUND MUSIC',       ids:['bgMusic'] },
  { label:'RECON & ACCESS',         ids:['nmap','breach','social','sniff'] },
  { label:'SYSTEM & NAVIGATION',    ids:['success','failure','blip','disconnect'] },
  { label:'PERSISTENCE & PAYLOAD',  ids:['rootShell','beacon','tunnel','stealth','miner','minerTick'] },
  { label:'LOOT & CLEANUP',         ids:['exfil','dump','wipe'] },
  { label:'EVENTS & ALERTS',        ids:['traceWarning','heatSpike','alarm','destroy','zeroDay','contractDone'] },
];

const slotMap = Object.fromEntries(SOUND_SLOTS.map(s => [s.id, s]));

const syncEngine = map => {
  const live = {};
  Object.entries(map).forEach(([k, v]) => { if (v?.url) live[k] = v; });
  setSoundMap(live);
};

// ─── Component ─────────────────────────────────────────────────
const SoundManager = ({ returnToGame }) => {
  const [fileMap,  setFileMap]  = useState({});
  const [volume,   setVol]      = useState(0.7);
  const [audioOn,  setAudioOn]  = useState(true);
  const [dragging, setDrag]     = useState(null);
  const [feedback, setFb]       = useState('');
  const [loading,  setLoading]  = useState(true);
  const [testing,  setTest]     = useState(null);
  const [uploading,setUploading]= useState({});
  const fileRef  = useRef(null);
  const slotPend = useRef(null);

  const fb = (msg, ms = 3000) => { setFb(msg); setTimeout(() => setFb(''), ms); };

  // ── Load saved sounds from Supabase on mount ──
  useEffect(() => {
    setLoading(true);
    sbFetchAll().then(rows => {
      const restored = {};
      rows.forEach(r => { restored[r.slot_id] = { url: r.file_url, name: r.file_name }; });
      setFileMap(restored);
      syncEngine(restored);
    }).catch(() => fb('⚠ Could not reach Supabase — check connection')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { engineSetVolume(volume); }, [volume]);
  useEffect(() => { setSoundEnabled(audioOn); }, [audioOn]);

  const uploadFile = async (id, file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) { fb(`✕ ${file.name} — not an audio file`); return; }
    if (file.size > 20 * 1024 * 1024) { fb(`✕ ${file.name} — max 20MB`); return; }

    setUploading(u => ({ ...u, [id]: true }));
    fb(`↑ Uploading "${file.name}"...`);
    try {
      const url = await sbUpload(id, file);
      await sbSaveSlot(id, file.name, url);
      const entry = { url, name: file.name };
      setFileMap(prev => {
        const next = { ...prev, [id]: entry };
        syncEngine(next);
        return next;
      });
      fb(`✓ "${file.name}" → ${slotMap[id]?.label} — saved to cloud`);
    } catch (err) {
      fb(`✕ Upload failed: ${err.message}`);
    } finally {
      setUploading(u => ({ ...u, [id]: false }));
    }
  };

  const clearSlot = async (id) => {
    const entry = fileMap[id];
    try {
      await sbDeleteSlot(id, entry?.name);
      setFileMap(prev => {
        const next = { ...prev };
        delete next[id];
        syncEngine(next);
        return next;
      });
      fb('Slot cleared — synth fallback now active');
    } catch { fb('⚠ Could not delete from cloud'); }
  };

  const handleDrop = (e, id) => {
    e.preventDefault(); setDrag(null);
    uploadFile(id, e.dataTransfer.files[0]);
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (slotPend.current === '__bulk__') {
      let matched = 0;
      files.forEach(file => {
        const base = file.name.replace(/\.[^.]+$/, '').toLowerCase();
        const slot = SOUND_SLOTS.find(s => base === s.id.toLowerCase() || base.includes(s.id.toLowerCase()));
        if (slot) { uploadFile(slot.id, file); matched++; }
      });
      if (!matched) fb('✕ No filenames matched slot IDs — upload individually');
    } else {
      uploadFile(slotPend.current, files[0]);
    }
    slotPend.current = null;
    e.target.value = '';
  };

  const previewFile = id => {
    const e = fileMap[id];
    if (!e?.url) { fb('No custom audio loaded for this slot'); return; }
    setTest(id);
    const a = new Audio(e.url);
    a.volume = volume;
    a.play().then(() => setTimeout(() => setTest(null), 1500)).catch(() => { fb('Preview failed'); setTest(null); });
  };

  const previewSynth = id => {
    const slot = slotMap[id];
    if (!slot?.fn) { fb('No synth for this slot — upload a file'); return; }
    setTest(id + '_s'); slot.fn();
    setTimeout(() => setTest(null), 1400);
  };

  const C = {
    bg:'#070710', panel:'#0c0c18', border:'#1a1a30',
    primary:'#00ff88', dim:'#2a2a44', text:'#c8c8e8', textDim:'#4a4a6a',
    danger:'#ff3366', warning:'#ffaa00', info:'#00aaff',
  };

  const loadedCount  = Object.values(fileMap).filter(v => v?.url).length;
  const isUploading  = Object.values(uploading).some(Boolean);

  return (
    <div style={{ background:C.bg, color:C.text, position:'absolute', inset:0,
      fontFamily:"'Consolas','Fira Code','JetBrains Mono',monospace", fontSize:'13px',
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* scanlines */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:50,
        background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />

      <input ref={fileRef} type="file" accept="audio/*" style={{display:'none'}} onChange={handleFileChange} />

      {/* ── HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:`1px solid ${C.border}`, background:C.panel, flexShrink:0, zIndex:10 }}>
        <div>
          <div style={{ color:C.primary, fontSize:'11px', letterSpacing:'4px', fontWeight:'bold' }}>HEXOVERRIDE</div>
          <div style={{ color:C.textDim, fontSize:'10px', letterSpacing:'2px' }}>
            AUDIO MANAGER — CLOUD STORAGE
            {isUploading && <span style={{color:C.info, marginLeft:'10px'}}>↑ UPLOADING...</span>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          {/* Enable toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>AUDIO</span>
            <div onClick={() => setAudioOn(v => !v)} style={{
              width:'36px', height:'18px', borderRadius:'9px', cursor:'pointer', position:'relative',
              background: audioOn ? `${C.primary}30` : C.border,
              border:`1px solid ${audioOn ? C.primary : C.dim}`, transition:'all 0.2s' }}>
              <div style={{ position:'absolute', top:'2px', width:'12px', height:'12px', borderRadius:'50%',
                left: audioOn ? '18px' : '2px',
                background: audioOn ? C.primary : C.dim, transition:'left 0.2s' }} />
            </div>
          </div>
          {/* Volume */}
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>SFX VOL</span>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVol(parseFloat(e.target.value))}
              style={{ width:'70px', accentColor:C.primary, cursor:'pointer' }} />
            <span style={{ color:C.primary, fontSize:'10px', width:'28px' }}>{Math.round(volume*100)}%</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>MUSIC VOL</span>
            <input type="range" min="0" max="1" step="0.05" defaultValue="0.35"
              onChange={e => setMusicVolume(parseFloat(e.target.value))}
              style={{ width:'70px', accentColor:C.primary, cursor:'pointer' }} />
          </div>
          {/* Bulk */}
          <button onClick={() => { fileRef.current.multiple = true; slotPend.current = '__bulk__'; fileRef.current.click(); }}
            style={{ background:'transparent', border:`1px solid ${C.dim}`, color:C.textDim,
              padding:'6px 12px', cursor:'pointer', fontFamily:'inherit', fontSize:'10px',
              letterSpacing:'1px', borderRadius:'2px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.dim; e.currentTarget.style.color=C.textDim; }}>
            BULK IMPORT
          </button>
          <button onClick={returnToGame} style={{
            background:`${C.primary}15`, border:`1px solid ${C.primary}`, color:C.primary,
            padding:'6px 16px', cursor:'pointer', fontFamily:'inherit',
            fontSize:'11px', letterSpacing:'2px', borderRadius:'2px', fontWeight:'bold' }}>← BACK</button>
        </div>
      </div>

      {/* ── FEEDBACK ── */}
      <div style={{ height:'28px', display:'flex', alignItems:'center', padding:'0 20px', flexShrink:0,
        background: feedback ? `${C.primary}08` : 'transparent',
        borderBottom:`1px solid ${feedback ? C.primary+'30' : 'transparent'}`, transition:'all 0.2s' }}>
        <span style={{ color:C.primary, fontSize:'11px', letterSpacing:'1px' }}>{feedback}</span>
      </div>

      {/* ── TIP ── */}
      <div style={{ padding:'7px 20px', background:`${C.info}07`, borderBottom:`1px solid ${C.info}18`, flexShrink:0 }}>
        <span style={{ color:C.info, fontSize:'10px', letterSpacing:'1px' }}>
          ☁ Files upload to Supabase cloud — persist on any device. BULK IMPORT: name files after slot IDs (e.g. <span style={{color:'#fff'}}>nmap.mp3</span>, <span style={{color:'#fff'}}>bgMusic.ogg</span>). Max 20MB each.
        </span>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1,
          color:C.textDim, fontSize:'12px', letterSpacing:'2px' }}>
          LOADING FROM CLOUD...
        </div>
      )}

      {/* ── SLOTS ── */}
      {!loading && (
        <div style={{ flexGrow:1, overflowY:'auto', padding:'14px 20px' }}>
          {SECTIONS.map(sec => (
            <div key={sec.label} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'9px', letterSpacing:'3px', color:C.textDim, fontWeight:'bold',
                marginBottom:'8px', paddingBottom:'6px', borderBottom:`1px solid ${C.border}` }}>
                {sec.label}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'7px' }}>
                {sec.ids.map(id => {
                  const slot   = slotMap[id];
                  const entry  = fileMap[id];
                  const hasUrl = !!entry?.url;
                  const isDrag = dragging === id;
                  const isBusy = !!uploading[id];

                  return (
                    <div key={id}
                      onDragOver={e => { e.preventDefault(); setDrag(id); }}
                      onDragLeave={() => setDrag(null)}
                      onDrop={e => handleDrop(e, id)}
                      style={{
                        border:`1px solid ${isDrag ? C.primary : hasUrl ? C.primary+'35' : C.border}`,
                        background: isDrag ? `${C.primary}08` : hasUrl ? `${C.primary}03` : C.panel,
                        borderRadius:'3px', padding:'11px', transition:'all 0.12s',
                        opacity: isBusy ? 0.6 : 1,
                      }}>
                      {/* top row */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                          <span style={{ color: hasUrl ? C.primary : C.dim, fontSize:'14px', width:'18px', textAlign:'center' }}>
                            {isBusy ? '↑' : slot.icon}
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
                          color:  isBusy ? C.info : hasUrl ? C.primary : C.textDim,
                          border: `1px solid ${isBusy ? C.info+'44' : hasUrl ? C.primary+'44' : C.dim}`,
                          background: isBusy ? `${C.info}10` : hasUrl ? `${C.primary}10` : 'transparent',
                        }}>
                          {isBusy ? '↑ UPLOADING' : hasUrl ? '☁ CLOUD' : '○ SYNTH'}
                        </div>
                      </div>

                      {/* filename */}
                      {entry?.name && !isBusy && (
                        <div style={{ fontSize:'10px', color:C.primary, marginBottom:'7px',
                          padding:'3px 7px', background:`${C.primary}08`,
                          border:`1px solid ${C.primary}20`, borderRadius:'2px',
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          ☁ {entry.name}
                        </div>
                      )}

                      {isDrag && (
                        <div style={{ fontSize:'10px', color:C.primary, textAlign:'center',
                          padding:'3px 0', marginBottom:'7px', letterSpacing:'2px' }}>DROP TO UPLOAD</div>
                      )}

                      {/* buttons */}
                      <div style={{ display:'flex', gap:'5px' }}>
                        <button disabled={isBusy} onClick={() => {
                          slotPend.current = id;
                          fileRef.current.multiple = false;
                          fileRef.current.click();
                        }} style={{
                          flex:1, background:'transparent', border:`1px solid ${C.dim}`, color:C.textDim,
                          padding:'5px 0', cursor: isBusy ? 'default' : 'pointer',
                          fontFamily:'inherit', fontSize:'10px', letterSpacing:'1px', borderRadius:'2px' }}
                          onMouseEnter={e => { if(!isBusy){e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary;} }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor=C.dim; e.currentTarget.style.color=C.textDim; }}>
                          {isBusy ? 'UPLOADING...' : hasUrl ? 'REPLACE' : 'UPLOAD'}
                        </button>

                        {hasUrl && !isBusy && (
                          <button onClick={() => previewFile(id)} style={{
                            background: testing === id ? `${C.primary}30` : `${C.primary}12`,
                            border:`1px solid ${C.primary}55`, color:C.primary,
                            padding:'5px 10px', cursor:'pointer', fontFamily:'inherit',
                            fontSize:'10px', letterSpacing:'1px', borderRadius:'2px' }}>▶ TEST</button>
                        )}

                        {slot.fn && !isBusy && (
                          <button onClick={() => previewSynth(id)} style={{
                            background: testing === id+'_s' ? `${C.dim}80` : 'transparent',
                            border:`1px solid ${C.dim}`, color:C.textDim,
                            padding:'5px 9px', cursor:'pointer', fontFamily:'inherit',
                            fontSize:'10px', letterSpacing:'1px', borderRadius:'2px' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor=C.textDim; e.currentTarget.style.color=C.text; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor=C.dim; e.currentTarget.style.color=C.textDim; }}
                            title="Preview built-in synth fallback">SYNTH</button>
                        )}

                        {entry && !isBusy && (
                          <button onClick={() => clearSlot(id)} style={{
                            background:'transparent', border:`1px solid ${C.danger}40`,
                            color:C.danger, padding:'5px 8px', cursor:'pointer',
                            fontFamily:'inherit', fontSize:'10px', borderRadius:'2px' }}>✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ padding:'7px 20px', borderTop:`1px solid ${C.border}`, background:C.panel,
        display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>
          {loadedCount} / {SOUND_SLOTS.length} SLOTS LOADED FROM CLOUD
        </span>
        <span style={{ color:C.textDim, fontSize:'10px', letterSpacing:'1px' }}>
          DRAG & DROP · MP3 · WAV · OGG · FLAC · MAX 20MB
        </span>
      </div>
    </div>
  );
};

export default SoundManager;
