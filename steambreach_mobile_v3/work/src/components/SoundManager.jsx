import React, { useState, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────
// HEXOVERRIDE SOUND MANAGER
// Drop into src/components/SoundManager.jsx
// Import and render inside HEXOVERRIDE.jsx when screen === 'soundmanager'
// ─────────────────────────────────────────────────────────────────

const SOUND_SLOTS = [
  { id: 'success',       label: 'EXPLOIT SUCCESS',     desc: 'hydra, sqlmap, ssh — shell established',       icon: '▶' },
  { id: 'failure',       label: 'COMMAND FAILURE',      desc: 'wrong vector, bad syntax, unknown command',    icon: '✕' },
  { id: 'rootShell',     label: 'ROOT SHELL',           desc: 'pwnkit, 0day — privilege escalation',          icon: '⬆' },
  { id: 'exfil',         label: 'EXFILTRATION',         desc: 'exfil, stash, rclone, download complete',      icon: '⬇' },
  { id: 'traceWarning',  label: 'TRACE WARNING',        desc: 'trace crosses 75% — alarm',                   icon: '⚠' },
  { id: 'heatSpike',     label: 'HEAT SPIKE',           desc: 'honeypot, eternalblue, tier escalation',       icon: '🔥' },
  { id: 'beacon',        label: 'C2 BEACON',            desc: 'sliver, msfvenom — botnet node added',         icon: '◉' },
  { id: 'destroy',       label: 'DESTRUCTION',          desc: 'shred, wipe — node destroyed / logs wiped',   icon: '☠' },
  { id: 'blip',          label: 'UI BLIP',              desc: 'menu navigation, minor interactions',          icon: '·' },
];

const STORAGE_KEY = 'breach_sounds_v1';

// Load/save sound URLs from localStorage
const loadSoundMap = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};
const saveSoundMap = (map) => {
  // Only save keys that have object URLs — we can't persist blob: URLs across sessions
  // Instead we store the filename so user knows what was loaded last session
  const meta = {};
  Object.entries(map).forEach(([k, v]) => { if (v?.name) meta[k] = { name: v.name }; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
};

// ─────────────────────────────────────────────────────────────────
// The actual audio playback engine — exported for use in soundEngine.js
// ─────────────────────────────────────────────────────────────────
let _soundMap = {}; // { id: { url: string, name: string } }
let _enabled = true;

export function setSoundMapExternal(map) { _soundMap = map; }
export function setSoundEnabledExternal(val) { _enabled = val; }

export function playManagedSound(id) {
  if (!_enabled) return;
  const entry = _soundMap[id];
  if (!entry?.url) return;
  try {
    const audio = new Audio(entry.url);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}
}

// ─────────────────────────────────────────────────────────────────
// UI COMPONENT
// ─────────────────────────────────────────────────────────────────
const SoundManager = ({ returnToGame, onSoundMapChange }) => {
  const [soundMap, setSoundMap] = useState({});
  const [activeSlot, setActiveSlot] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [enabled, setEnabled] = useState(true);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);
  const pendingSlotRef = useRef(null);

  // Load persisted metadata on mount
  useEffect(() => {
    const meta = loadSoundMap();
    // We can only restore names, not the actual blobs — user needs to re-upload
    const restored = {};
    Object.entries(meta).forEach(([k, v]) => {
      if (v?.name) restored[k] = { url: null, name: v.name, stale: true };
    });
    setSoundMap(restored);
  }, []);

  // Push changes up to parent + external engine
  useEffect(() => {
    setSoundMapExternal(soundMap);
    if (onSoundMapChange) onSoundMapChange(soundMap);
    saveSoundMap(soundMap);
  }, [soundMap]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleFileSelect = (slotId, file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      showFeedback(`✕ ${file.name} is not an audio file`);
      return;
    }
    const url = URL.createObjectURL(file);
    setSoundMap(prev => ({ ...prev, [slotId]: { url, name: file.name, stale: false } }));
    showFeedback(`✓ "${file.name}" loaded into ${SOUND_SLOTS.find(s => s.id === slotId)?.label}`);
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files[0];
    handleFileSelect(slotId, file);
  };

  const previewSound = (slotId) => {
    const entry = soundMap[slotId];
    if (!entry?.url) { showFeedback('No audio loaded for this slot'); return; }
    const audio = new Audio(entry.url);
    audio.volume = volume;
    audio.play().catch(() => showFeedback('Preview failed — check browser permissions'));
  };

  const clearSlot = (slotId) => {
    setSoundMap(prev => {
      const next = { ...prev };
      if (next[slotId]?.url) URL.revokeObjectURL(next[slotId].url);
      delete next[slotId];
      return next;
    });
    showFeedback('Slot cleared — synthesized fallback will be used');
  };

  const loadAll = () => {
    fileInputRef.current.multiple = true;
    pendingSlotRef.current = '__bulk__';
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (pendingSlotRef.current === '__bulk__') {
      // Try to match filenames to slot IDs
      let matched = 0;
      files.forEach(file => {
        const base = file.name.replace(/\.[^.]+$/, '').toLowerCase();
        const slot = SOUND_SLOTS.find(s =>
          base === s.id.toLowerCase() ||
          base === s.label.toLowerCase().replace(/\s+/g, '_') ||
          base.includes(s.id.toLowerCase())
        );
        if (slot) {
          const url = URL.createObjectURL(file);
          setSoundMap(prev => ({ ...prev, [slot.id]: { url, name: file.name, stale: false } }));
          matched++;
        }
      });
      showFeedback(matched > 0 ? `✓ Matched ${matched} of ${files.length} files to slots` : `✕ No filenames matched slot IDs — upload individually`);
    } else {
      handleFileSelect(pendingSlotRef.current, files[0]);
    }

    pendingSlotRef.current = null;
    e.target.value = '';
  };

  const C = {
    bg: '#0a0a0f',
    panel: '#0f0f1a',
    border: '#1a1a2e',
    primary: '#00ff88',
    dim: '#3a3a5c',
    text: '#c8c8e8',
    textDim: '#5a5a7a',
    danger: '#ff3366',
    warning: '#ffaa00',
    loaded: '#00ff88',
    stale: '#ffaa00',
  };

  return (
    <div style={{
      background: C.bg, color: C.text, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
      fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", fontSize: '13px',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Scanline overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)', pointerEvents: 'none', zIndex: 50 }} />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.panel, flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ color: C.primary, fontSize: '11px', letterSpacing: '4px', fontWeight: 'bold' }}>HEXOVERRIDE</div>
            <div style={{ color: C.textDim, fontSize: '10px', letterSpacing: '2px' }}>AUDIO MANAGER v1.0</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Master enable toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: C.textDim, fontSize: '10px', letterSpacing: '1px' }}>AUDIO</span>
            <div
              onClick={() => setEnabled(e => !e)}
              style={{
                width: '36px', height: '18px', borderRadius: '9px', cursor: 'pointer', position: 'relative',
                background: enabled ? `${C.primary}30` : C.border, border: `1px solid ${enabled ? C.primary : C.dim}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: '2px', left: enabled ? '18px' : '2px', width: '12px', height: '12px',
                borderRadius: '50%', background: enabled ? C.primary : C.dim, transition: 'left 0.2s',
              }} />
            </div>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: C.textDim, fontSize: '10px', letterSpacing: '1px' }}>VOL</span>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width: '80px', accentColor: C.primary, cursor: 'pointer' }}
            />
            <span style={{ color: C.primary, fontSize: '10px', width: '30px' }}>{Math.round(volume * 100)}%</span>
          </div>

          {/* Bulk load */}
          <button onClick={loadAll} style={{
            background: 'transparent', border: `1px solid ${C.dim}`, color: C.textDim,
            padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '10px',
            letterSpacing: '1px', borderRadius: '2px', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; }}
            onMouseLeave={e => { e.target.style.borderColor = C.dim; e.target.style.color = C.textDim; }}
          >BULK IMPORT</button>

          {/* Back */}
          <button onClick={returnToGame} style={{
            background: `${C.primary}15`, border: `1px solid ${C.primary}`, color: C.primary,
            padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px',
            letterSpacing: '2px', borderRadius: '2px', fontWeight: 'bold',
          }}>← BACK</button>
        </div>
      </div>

      {/* FEEDBACK BAR */}
      <div style={{
        height: '28px', display: 'flex', alignItems: 'center', padding: '0 20px',
        background: feedback ? `${C.primary}08` : 'transparent',
        borderBottom: `1px solid ${feedback ? C.primary + '30' : 'transparent'}`,
        transition: 'all 0.2s', flexShrink: 0,
      }}>
        <span style={{ color: C.primary, fontSize: '11px', letterSpacing: '1px' }}>{feedback}</span>
      </div>

      {/* INSTRUCTIONS */}
      <div style={{ padding: '10px 20px', background: `${C.warning}08`, borderBottom: `1px solid ${C.warning}20`, flexShrink: 0 }}>
        <span style={{ color: C.warning, fontSize: '10px', letterSpacing: '1px' }}>
          [BULK IMPORT] — name your files after slot IDs (e.g. <span style={{color:'#fff'}}>success.mp3</span>, <span style={{color:'#fff'}}>rootShell.wav</span>) and import all at once.
          Supports MP3, WAV, OGG, FLAC. Custom sounds override synthesized fallbacks.
        </span>
      </div>

      {/* SOUND SLOTS GRID */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '10px', alignContent: 'start' }}>
        {SOUND_SLOTS.map(slot => {
          const entry = soundMap[slot.id];
          const hasSound = !!entry?.url;
          const isStale = entry?.stale;
          const isDraggingOver = dragging === slot.id;

          return (
            <div
              key={slot.id}
              onDragOver={e => { e.preventDefault(); setDragging(slot.id); }}
              onDragLeave={() => setDragging(null)}
              onDrop={e => handleDrop(e, slot.id)}
              style={{
                border: `1px solid ${isDraggingOver ? C.primary : hasSound ? (isStale ? C.warning + '60' : C.primary + '40') : C.border}`,
                background: isDraggingOver ? `${C.primary}08` : hasSound ? `${C.primary}04` : C.panel,
                borderRadius: '3px', padding: '14px', transition: 'all 0.15s', cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: hasSound ? C.primary : C.dim, fontSize: '16px', width: '20px', textAlign: 'center' }}>{slot.icon}</span>
                  <div>
                    <div style={{ color: hasSound ? C.text : C.textDim, fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>{slot.label}</div>
                    <div style={{ color: C.textDim, fontSize: '10px', marginTop: '2px' }}>{slot.desc}</div>
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  fontSize: '9px', letterSpacing: '1px', padding: '2px 6px', borderRadius: '2px',
                  color: hasSound ? (isStale ? C.warning : C.primary) : C.textDim,
                  border: `1px solid ${hasSound ? (isStale ? C.warning + '40' : C.primary + '40') : C.dim}`,
                  background: hasSound ? (isStale ? `${C.warning}10` : `${C.primary}10`) : 'transparent',
                  whiteSpace: 'nowrap',
                }}>
                  {hasSound ? (isStale ? '⚠ RE-UPLOAD' : '● LOADED') : '○ SYNTH'}
                </div>
              </div>

              {/* File name display */}
              {entry?.name && (
                <div style={{
                  fontSize: '10px', color: isStale ? C.warning : C.primary, marginBottom: '10px',
                  padding: '4px 8px', background: `${isStale ? C.warning : C.primary}08`,
                  border: `1px solid ${isStale ? C.warning : C.primary}20`, borderRadius: '2px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {isStale ? '⚠ ' : '♪ '}{entry.name}
                </div>
              )}

              {/* Drop zone hint */}
              {isDraggingOver && (
                <div style={{
                  fontSize: '10px', color: C.primary, textAlign: 'center', padding: '4px 0',
                  marginBottom: '10px', letterSpacing: '2px',
                }}>DROP TO LOAD</div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    pendingSlotRef.current = slot.id;
                    fileInputRef.current.multiple = false;
                    fileInputRef.current.click();
                  }}
                  style={{
                    flex: 1, background: 'transparent', border: `1px solid ${C.dim}`,
                    color: C.textDim, padding: '6px 0', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '10px', letterSpacing: '1px', borderRadius: '2px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; }}
                  onMouseLeave={e => { e.target.style.borderColor = C.dim; e.target.style.color = C.textDim; }}
                >
                  {hasSound ? 'REPLACE' : 'UPLOAD'}
                </button>

                {hasSound && !isStale && (
                  <button
                    onClick={() => previewSound(slot.id)}
                    style={{
                      background: `${C.primary}15`, border: `1px solid ${C.primary}40`,
                      color: C.primary, padding: '6px 12px', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '10px', letterSpacing: '1px', borderRadius: '2px',
                    }}
                  >▶ TEST</button>
                )}

                {entry && (
                  <button
                    onClick={() => clearSlot(slot.id)}
                    style={{
                      background: 'transparent', border: `1px solid ${C.danger}40`,
                      color: C.danger, padding: '6px 10px', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '10px', borderRadius: '2px',
                      transition: 'all 0.15s',
                    }}
                  >✕</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '8px 20px', borderTop: `1px solid ${C.border}`, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: C.textDim, fontSize: '10px', letterSpacing: '1px' }}>
          {Object.values(soundMap).filter(v => v?.url).length} / {SOUND_SLOTS.length} SLOTS LOADED
          {Object.values(soundMap).filter(v => v?.stale).length > 0 && (
            <span style={{ color: C.warning, marginLeft: '12px' }}>
              ⚠ {Object.values(soundMap).filter(v => v?.stale).length} STALE (re-upload required — browser can't persist audio blobs)
            </span>
          )}
        </span>
        <span style={{ color: C.textDim, fontSize: '10px', letterSpacing: '1px' }}>DRAG & DROP SUPPORTED · MP3 · WAV · OGG · FLAC</span>
      </div>
    </div>
  );
};

export default SoundManager;
