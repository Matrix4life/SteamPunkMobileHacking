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
// All sound slots — id must match the key used in soundEngine play()
// ─────────────────────────────────────────────────────────────────
const SOUND_SLOTS = [
  // ── Recon & Access ───────────────────────────────────────────
  { id: 'nmap',         label: 'NMAP SCAN',          desc: 'nmap, nmap <ip>, wardrive — sonar sweep',           icon: '◎', fn: playNmap },
  { id: 'breach',       label: 'BREACH',             desc: 'hydra, sqlmap, msfconsole, curl — shell gained',    icon: '⚡', fn: playBreach },
  { id: 'social',       label: 'SOCIAL VECTOR',      desc: 'spearphish connect, ettercap intercept result',     icon: '◈', fn: playSocial },
  { id: 'sniff',        label: 'ARP SNIFF',          desc: 'ettercap ARP poison active — passive intercept',    icon: '〜', fn: playSniff },
  // ── System & Nav ─────────────────────────────────────────────
  { id: 'success',      label: 'GENERIC SUCCESS',    desc: 'fallback for misc successful actions',              icon: '▶', fn: playSuccess },
  { id: 'failure',      label: 'COMMAND FAILURE',    desc: 'wrong vector, bad syntax, unknown command',         icon: '✕', fn: playFailure },
  { id: 'blip',         label: 'UI BLIP',            desc: 'ls, cd, cat, download — nav ticks',                icon: '·', fn: playBlip },
  { id: 'disconnect',   label: 'DISCONNECT',         desc: 'exit — clean node disconnect',                     icon: '◌', fn: playDisconnect },
  // ── Persistence & Payloads ───────────────────────────────────
  { id: 'rootShell',    label: 'ROOT SHELL',         desc: 'pwnkit — privilege escalation to root',            icon: '⬆', fn: playRootShell },
  { id: 'beacon',       label: 'C2 BEACON',          desc: 'sliver — botnet node added, C2 heartbeat',         icon: '◉', fn: playBeacon },
  { id: 'tunnel',       label: 'PROXY TUNNEL',       desc: 'chisel — SOCKS5 proxy chain created',              icon: '⊃', fn: playTunnel },
  { id: 'stealth',      label: 'STEALTH MODE',       desc: 'reptile — kernel rootkit, going dark',             icon: '◐', fn: playStealth },
  { id: 'miner',        label: 'MINER DEPLOY',       desc: 'xmrig — cryptominer deployed',                     icon: '⛏', fn: playMiner },
  { id: 'minerTick',    label: 'PASSIVE INCOME',     desc: 'xmrig — passive income tick every 3 min',          icon: '₿', fn: playMinerTick },
  // ── Loot & Cleanup ───────────────────────────────────────────
  { id: 'exfil',        label: 'EXFILTRATION',       desc: 'exfil, stash — data transfer to operator',         icon: '⬇', fn: playExfil },
  { id: 'dump',         label: 'CREDENTIAL DUMP',    desc: 'mimikatz, hashcat — credentials cascade',          icon: '⇓', fn: playDump },
  { id: 'wipe',         label: 'LOG WIPE',           desc: 'wipe — evidence scrubbed, heat reduced',           icon: '⊘', fn: playWipe },
  // ── Events & Alerts ──────────────────────────────────────────
  { id: 'traceWarning', label: 'TRACE WARNING',      desc: 'trace crosses 75% — get out soon',                 icon: '⚠', fn: playTraceWarning },
  { id: 'heatSpike',    label: 'HEAT SPIKE',         desc: 'honeypot, eternalblue — global heat jump',         icon: '🔥', fn: playHeatSpike },
  { id: 'alarm',        label: 'ALARM — UNDER ATTACK', desc: 'Blue Team retaliation, rival raid incoming',     icon: '⛨', fn: playAlarm },
  { id: 'destroy',      label: 'DESTRUCTION',        desc: 'shred, openssl, crontab — node destroyed',         icon: '☠', fn: playDestroy },
  { id: 'zeroDay',      label: 'ZERO-DAY DROP',      desc: 'rare exploit drop from compromised node',          icon: '◆', fn: playZeroDay },
  { id: 'contractDone', label: 'CONTRACT COMPLETE',  desc: 'fixer contract objective met — payday',            icon: '✦', fn: playContractDone },
];

const SECTION_ORDER = [
  { label: 'RECON & ACCESS',        ids: ['nmap','breach','social','sniff'] },
  { label: 'SYSTEM & NAVIGATION',   ids: ['success','failure','blip','disconnect'] },
  { label: 'PERSISTENCE & PAYLOAD', ids: ['rootShell','beacon','tunnel','stealth','miner','minerTick'] },
  { label: 'LOOT & CLEANUP',        ids: ['exfil','dump','wipe'] },
  { label: 'EVENTS & ALERTS',       ids: ['traceWarning','heatSpike','alarm','destroy','zeroDay','contractDone'] },
];

const STORAGE_KEY = 'breach_sounds_v2';

const loadMeta = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};
const saveMeta = (map) => {
  const meta = {};
  Object.entries(map).forEach(([k, v]) => { if (v?.name) meta[k] = { name: v.name }; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
const SoundManager = ({ returnToGame, onSoundMapChange }) => {
  const [soundMap, _setSoundMap]  = useState({});
  const [volume, setVolume]       = useState(0.7);
  const [audioEnabled, setAudio]  = useState(true);
  const [dragging, setDragging]   = useState(null);
  const [feedback, setFeedback]   = useState('');
  const [testing, setTesting]     = useState(null); // slot id being previewed
  const fileInputRef   = useRef(null);
  const pendingSlotRef = useRef(null);

  // Build slot lookup
  const slotMap = Object.fromEntries(SOUND_SLOTS.map(s => [s.id, s]));

  // Restore persisted metadata on mount
  useEffect(() => {
    const meta = loadMeta();
    const restored = {};
    Object.entries(meta).forEach(([k, v]) => {
      if (v?.name) restored[k] = { url: null, name: v.name, stale: true };
    });
    _setSoundMap(restored);
  }, []);

  // Push changes to engine + parent whenever soundMap or volume/enabled changes
  useEffect(() => {
    setSoundMap(soundMap);
    if (onSoundMapChange) onSoundMapChange(soundMap);
    saveMeta(soundMap);
  }, [soundMap]);

  useEffect(() => { engineSetVolume(volume); }, [volume]);
  useEffect(() => { setSoundEnabled(audioEnabled); }, [audioEnabled]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2800);
  };

  const loadFile = (slotId, file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      showFeedback(`✕ ${file.name} — not an audio file`);
      return;
    }
    const url = URL.createObjectURL(file);
    _setSoundMap(prev => ({ ...prev, [slotId]: { url, name: file.name, stale: false } }));
    showFeedback(`✓ "${file.name}" → ${slotMap[slotId]?.label}`);
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    setDragging(null);
    loadFile(slotId, e.dataTransfer.files[0]);
  };

  const previewUploaded = (slotId) => {
    const entry = soundMap[slotId];
    if (!entry?.url) { showFeedback('No audio uploaded for this slot'); return; }
    setTesting(slotId);
    const audio = new Audio(entry.url);
    audio.volume = volume;
    audio.play()
      .then(() => setTimeout(() => setTesting(null), 1500))
      .catch(() => { showFeedback('Preview failed — check browser audio permissions'); setTesting(null); });
  };

  const previewSynth = (slotId) => {
    const slot = slotMap[slotId];
    if (!slot?.fn) return;
    setTesting(slotId + '_synth');
    slot.fn();
    setTimeout(() => setTesting(null), 1200);
  };

  const clearSlot = (slotId) => {
    _setSoundMap(prev => {
      const next = { ...prev };
      if (next[slotId]?.url) URL.revokeObjectURL(next[slotId].url);
      delete next[slotId];
      return next;
    });
    showFeedback('Slot cleared — synth fallback active');
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (pendingSlotRef.current === '__bulk__') {
      let matched = 0;
      files.forEach(file => {
        const base = file.name.replace(/\.[^.]+$/, '').toLowerCase();
        const slot = SOUND_SLOTS.find(s =>
          base === s.id.toLowerCase() ||
          base === s.label.toLowerCase().replace(/[\s\-&]+/g, '_') ||
          base.includes(s.id.toLowerCase())
        );
        if (slot) {
          const url = URL.createObjectURL(file);
          _setSoundMap(prev => ({ ...prev, [slot.id]: { url, name: file.name, stale: false } }));
          matched++;
        }
      });
      showFeedback(matched > 0
        ? `✓ Auto-matched ${matched} of ${files.length} files`
        : `✕ No filenames matched slot IDs — upload individually`
      );
    } else {
      loadFile(pendingSlotRef.current, files[0]);
    }

    pendingSlotRef.current = null;
    e.target.value = '';
  };

  const C = {
    bg: '#070710', panel: '#0c0c18', border: '#1a1a30',
    primary: '#00ff88', dim: '#2a2a44', text: '#c8c8e8', textDim: '#4a4a6a',
    danger: '#ff3366', warning: '#ffaa00',
  };

  const loadedCount  = Object.values(soundMap).filter(v => v?.url).length;
  const staleCount   = Object.values(soundMap).filter(v => v?.stale).length;

  return (
    <div style={{
      background: C.bg, color: C.text, position: 'absolute', inset: 0,
      fontFamily: "'Consolas','Fira Code','JetBrains Mono',monospace", fontSize: '13px',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />

      <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

      {/* ── HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px',
        borderBottom:`1px solid ${C.border}`, background: C.panel, flexShrink: 0, zIndex: 10 }}>
        <div>
          <div style={{ color: C.primary, fontSize:'11px', letterSpacing:'4px', fontWeight:'bold' }}>HEXOVERRIDE</div>
          <div style={{ color: C.textDim, fontSize:'10px', letterSpacing:'2px' }}>AUDIO MANAGER v2.0 — {SOUND_SLOTS.length} SLOTS</div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          {/* Enable toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color: C.textDim, fontSize:'10px', letterSpacing:'1px' }}>AUDIO</span>
            <div onClick={() => setAudio(e => !e)} style={{
              width:'36px', height:'18px', borderRadius:'9px', cursor:'pointer', position:'relative',
              background: audioEnabled ? `${C.primary}30` : C.border,
              border: `1px solid ${audioEnabled ? C.primary : C.dim}`, transition:'all 0.2s',
            }}>
              <div style={{
                position:'absolute', top:'2px', width:'12px', height:'12px', borderRadius:'50%',
                left: audioEnabled ? '18px' : '2px',
                background: audioEnabled ? C.primary : C.dim, transition:'left 0.2s',
              }} />
            </div>
          </div>

          {/* Volume */}
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ color: C.textDim, fontSize:'10px', letterSpacing:'1px' }}>VOL</span>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width:'80px', accentColor: C.primary, cursor:'pointer' }} />
            <span style={{ color: C.primary, fontSize:'10px', width:'30px' }}>{Math.round(volume * 100)}%</span>
          </div>

          {/* Bulk import */}
          <button onClick={() => {
            fileInputRef.current.multiple = true;
            pendingSlotRef.current = '__bulk__';
            fileInputRef.current.click();
          }} style={{
            background:'transparent', border:`1px solid ${C.dim}`, color: C.textDim,
            padding:'6px 12px', cursor:'pointer', fontFamily:'inherit', fontSize:'10px',
            letterSpacing:'1px', borderRadius:'2px',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.dim; e.currentTarget.style.color = C.textDim; }}
          >BULK IMPORT</button>

          <button onClick={returnToGame} style={{
            background:`${C.primary}15`, border:`1px solid ${C.primary}`, color: C.primary,
            padding:'6px 16px', cursor:'pointer', fontFamily:'inherit', fontSize:'11px',
            letterSpacing:'2px', borderRadius:'2px', fontWeight:'bold',
          }}>← BACK</button>
        </div>
      </div>

      {/* ── FEEDBACK ── */}
      <div style={{
        height:'28px', display:'flex', alignItems:'center', padding:'0 20px', flexShrink: 0,
        background: feedback ? `${C.primary}08` : 'transparent',
        borderBottom: `1px solid ${feedback ? C.primary + '30' : 'transparent'}`, transition:'all 0.2s',
      }}>
        <span style={{ color: C.primary, fontSize:'11px', letterSpacing:'1px' }}>{feedback}</span>
      </div>

      {/* ── INSTRUCTIONS ── */}
      <div style={{ padding:'8px 20px', background:`${C.warning}07`, borderBottom:`1px solid ${C.warning}18`, flexShrink:0 }}>
        <span style={{ color: C.warning, fontSize:'10px', letterSpacing:'1px' }}>
          BULK IMPORT — name files after slot IDs (e.g. <span style={{color:'#fff'}}>nmap.mp3</span>, <span style={{color:'#fff'}}>breach.wav</span>, <span style={{color:'#fff'}}>zeroDay.ogg</span>).
          Custom audio overrides synth. TEST SYNTH previews the built-in fallback.
        </span>
      </div>

      {/* ── SLOTS ── */}
      <div style={{ flexGrow:1, overflowY:'auto', padding:'14px 20px' }}>
        {SECTION_ORDER.map(section => (
          <div key={section.label} style={{ marginBottom:'20px' }}>
            {/* Section header */}
            <div style={{
              fontSize:'9px', letterSpacing:'3px', color: C.textDim, fontWeight:'bold',
              marginBottom:'8px', paddingBottom:'6px', borderBottom:`1px solid ${C.border}`,
            }}>{section.label}</div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:'8px' }}>
              {section.ids.map(id => {
                const slot  = slotMap[id];
                const entry = soundMap[id];
                const hasUrl   = !!entry?.url;
                const isStale  = !!entry?.stale;
                const isDragOn = dragging === id;
                const isTesting = testing === id || testing === id + '_synth';

                return (
                  <div key={id}
                    onDragOver={e => { e.preventDefault(); setDragging(id); }}
                    onDragLeave={() => setDragging(null)}
                    onDrop={e => handleDrop(e, id)}
                    style={{
                      border:`1px solid ${isDragOn ? C.primary : hasUrl ? (isStale ? C.warning+'55' : C.primary+'35') : C.border}`,
                      background: isDragOn ? `${C.primary}08` : hasUrl ? `${C.primary}03` : C.panel,
                      borderRadius:'3px', padding:'12px', transition:'all 0.15s',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                        <span style={{ color: hasUrl ? C.primary : C.dim, fontSize:'15px', width:'18px', textAlign:'center' }}>
                          {slot.icon}
                        </span>
                        <div>
                          <div style={{ color: hasUrl ? C.text : C.textDim, fontSize:'11px', fontWeight:'bold', letterSpacing:'1px' }}>
                            {slot.label}
                          </div>
                          <div style={{ color: C.textDim, fontSize:'10px', marginTop:'2px' }}>{slot.desc}</div>
                        </div>
                      </div>

                      {/* Status badge */}
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

                    {/* Loaded filename */}
                    {entry?.name && (
                      <div style={{
                        fontSize:'10px', color: isStale ? C.warning : C.primary, marginBottom:'8px',
                        padding:'3px 8px', background:`${isStale ? C.warning : C.primary}08`,
                        border:`1px solid ${isStale ? C.warning : C.primary}20`, borderRadius:'2px',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>
                        {isStale ? '⚠ ' : '♪ '}{entry.name}
                      </div>
                    )}

                    {isDragOn && (
                      <div style={{ fontSize:'10px', color: C.primary, textAlign:'center', padding:'4px 0', marginBottom:'8px', letterSpacing:'2px' }}>
                        DROP TO LOAD
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display:'flex', gap:'5px' }}>
                      {/* Upload / Replace */}
                      <button onClick={() => {
                        pendingSlotRef.current = id;
                        fileInputRef.current.multiple = false;
                        fileInputRef.current.click();
                      }} style={{
                        flex:1, background:'transparent', border:`1px solid ${C.dim}`,
                        color: C.textDim, padding:'5px 0', cursor:'pointer',
                        fontFamily:'inherit', fontSize:'10px', letterSpacing:'1px', borderRadius:'2px',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.dim; e.currentTarget.style.color = C.textDim; }}
                      >{hasUrl && !isStale ? 'REPLACE' : 'UPLOAD'}</button>

                      {/* Test uploaded */}
                      {hasUrl && !isStale && (
                        <button onClick={() => previewUploaded(id)} style={{
                          background: testing === id ? `${C.primary}30` : `${C.primary}12`,
                          border:`1px solid ${C.primary}50`, color: C.primary,
                          padding:'5px 10px', cursor:'pointer', fontFamily:'inherit',
                          fontSize:'10px', letterSpacing:'1px', borderRadius:'2px',
                        }}>▶ TEST</button>
                      )}

                      {/* Test synth fallback — always available */}
                      <button onClick={() => previewSynth(id)} style={{
                        background: testing === id + '_synth' ? `${C.dim}80` : 'transparent',
                        border:`1px solid ${C.dim}`, color: C.textDim,
                        padding:'5px 10px', cursor:'pointer', fontFamily:'inherit',
                        fontSize:'10px', letterSpacing:'1px', borderRadius:'2px',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.textDim; e.currentTarget.style.color = C.text; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.dim; e.currentTarget.style.color = C.textDim; }}
                        title="Preview synthesized fallback sound"
                      >SYNTH</button>

                      {/* Clear */}
                      {entry && (
                        <button onClick={() => clearSlot(id)} style={{
                          background:'transparent', border:`1px solid ${C.danger}40`,
                          color: C.danger, padding:'5px 9px', cursor:'pointer',
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
      <div style={{
        padding:'8px 20px', borderTop:`1px solid ${C.border}`, background: C.panel,
        display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0,
      }}>
        <span style={{ color: C.textDim, fontSize:'10px', letterSpacing:'1px' }}>
          {loadedCount} / {SOUND_SLOTS.length} SLOTS CUSTOM
          {staleCount > 0 && (
            <span style={{ color: C.warning, marginLeft:'12px' }}>
              ⚠ {staleCount} STALE — re-upload needed (browser can't persist audio blobs)
            </span>
          )}
        </span>
        <span style={{ color: C.textDim, fontSize:'10px', letterSpacing:'1px' }}>
          DRAG & DROP · MP3 · WAV · OGG · FLAC · SYNTH BUTTON PREVIEWS BUILT-IN FALLBACK
        </span>
      </div>
    </div>
  );
};

export default SoundManager;
