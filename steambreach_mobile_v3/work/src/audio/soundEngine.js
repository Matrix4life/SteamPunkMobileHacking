// soundEngine.js — HEXOVERRIDE Audio Engine
// Checks SoundManager for uploaded audio first, falls back to Web Audio synth.

let ctx = null;
let masterGain = null;
let enabled = true;
let _soundMap = {}; // populated by SoundManager via setSoundMap()

export function setSoundMap(map) { _soundMap = map; }
export function setSoundEnabled(val) { enabled = val; }

export function setVolume(val) {
  if (masterGain) masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), getCtx().currentTime);
}

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function osc(type, freq, startTime, duration, gainVal = 0.3) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(gainVal, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  o.connect(g);
  g.connect(masterGain);
  o.start(startTime);
  o.stop(startTime + duration);
}

// Try uploaded file first, run synth fallback if none loaded
function playWithFallback(id, synthFn) {
  if (!enabled) return;
  const entry = _soundMap[id];
  if (entry?.url) {
    try {
      const audio = new Audio(entry.url);
      audio.volume = masterGain?.gain?.value || 0.7;
      audio.play().catch(() => synthFn());
      return;
    } catch { /* fall through to synth */ }
  }
  synthFn();
}

export function playSuccess() {
  playWithFallback('success', () => {
    const c = getCtx(); const t = c.currentTime;
    osc('sine', 440, t,        0.12, 0.25);
    osc('sine', 550, t + 0.08, 0.12, 0.25);
    osc('sine', 660, t + 0.16, 0.18, 0.3);
  });
}

export function playFailure() {
  playWithFallback('failure', () => {
    const c = getCtx(); const t = c.currentTime;
    osc('sawtooth', 180, t,        0.1,  0.3);
    osc('sawtooth', 140, t + 0.07, 0.14, 0.25);
    osc('square',   100, t + 0.14, 0.1,  0.15);
  });
}

export function playRootShell() {
  playWithFallback('rootShell', () => {
    const c = getCtx(); const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 0.4);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.6);
    osc('triangle', 440, t + 0.2, 0.3, 0.15);
  });
}

export function playExfil() {
  playWithFallback('exfil', () => {
    const c = getCtx(); const t = c.currentTime;
    for (let i = 0; i < 6; i++) osc('square', 300 + Math.random() * 400, t + i * 0.06, 0.05, 0.12);
    osc('sine', 800, t + 0.36, 0.15, 0.2);
  });
}

export function playTraceWarning() {
  playWithFallback('traceWarning', () => {
    const c = getCtx(); const t = c.currentTime;
    for (let i = 0; i < 3; i++) {
      osc('square', 880, t + i * 0.22,       0.1,  0.2);
      osc('square', 660, t + i * 0.22 + 0.1, 0.08, 0.15);
    }
  });
}

export function playHeatSpike() {
  playWithFallback('heatSpike', () => {
    const c = getCtx(); const t = c.currentTime;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(1200, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.25);
  });
}

export function playBlip() {
  playWithFallback('blip', () => {
    const c = getCtx();
    osc('sine', 600, c.currentTime, 0.07, 0.15);
  });
}

export function playDestroy() {
  playWithFallback('destroy', () => {
    const c = getCtx(); const t = c.currentTime;
    osc('sawtooth', 80, t,        0.3, 0.4);
    osc('square',   60, t + 0.05, 0.3, 0.3);
    osc('sine',     40, t + 0.1,  0.4, 0.35);
  });
}

export function playBeacon() {
  playWithFallback('beacon', () => {
    const c = getCtx(); const t = c.currentTime;
    osc('square', 1200, t,        0.04, 0.2);
    osc('square', 900,  t + 0.05, 0.04, 0.2);
    osc('square', 1500, t + 0.1,  0.04, 0.2);
    osc('sine',   600,  t + 0.18, 0.12, 0.15);
  });
}
