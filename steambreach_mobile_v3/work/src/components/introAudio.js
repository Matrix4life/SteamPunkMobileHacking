// HEXOVERRIDE intro cinematic — procedural WebAudio SFX layer.
// All sounds synthesized on the fly. No external files.
// Exports unlock/update/mute helpers used by IntroCinematic.jsx.

let ctx = null;
let masterGain = null;
let unlocked = false;
let humStop = null;
let fired = new Set();
let prevTime = 0;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq=880, dur=0.05, vol=0.18, type='square') {
  const c = ensureCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(masterGain);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}
const tick = (vol=0.12) => blip(2200, 0.018, vol, 'square');
function bootBeep() {
  blip(660, 0.07, 0.16, 'square');
  setTimeout(() => blip(990, 0.06, 0.12, 'square'), 60);
}
function warnBeep() {
  blip(440, 0.18, 0.22, 'sawtooth');
  setTimeout(() => blip(370, 0.18, 0.18, 'sawtooth'), 90);
}
function whoosh(durSec=1.2, vol=0.35) {
  const c = ensureCtx();
  const bufSize = Math.floor(c.sampleRate * durSec);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0; i<bufSize; i++) data[i] = Math.random()*2-1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass'; filter.Q.value = 4;
  filter.frequency.setValueAtTime(200, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(4800, c.currentTime + durSec*0.7);
  filter.frequency.exponentialRampToValueAtTime(800, c.currentTime + durSec);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.08);
  g.gain.linearRampToValueAtTime(vol*0.9, c.currentTime + durSec*0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durSec);
  src.connect(filter).connect(g).connect(masterGain);
  src.start();
  src.stop(c.currentTime + durSec + 0.05);
}
function thud(vol=0.6) {
  const c = ensureCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(180, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(38, c.currentTime + 0.45);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.7);
  o.connect(g).connect(masterGain);
  o.start();
  o.stop(c.currentTime + 0.75);
  blip(2400, 0.012, 0.18, 'square');
}
function glitch() { whoosh(0.18, 0.28); blip(1800, 0.04, 0.15, 'sawtooth'); }
function crackle(durSec=0.6, vol=0.18) {
  const c = ensureCtx();
  const start = c.currentTime;
  const ticks = Math.floor(durSec * 28);
  for (let i=0; i<ticks; i++) {
    const at = start + (i/ticks)*durSec + Math.random()*0.01;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.value = 1400 + Math.random()*1800;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.015);
    o.connect(g).connect(masterGain);
    o.start(at); o.stop(at + 0.02);
  }
}
function ambientHum() {
  const c = ensureCtx();
  const o = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';  o.frequency.value = 55;
  o2.type = 'sine'; o2.frequency.value = 110.3;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 400;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.06, c.currentTime + 1.5);
  o.connect(filter); o2.connect(filter); filter.connect(g).connect(masterGain);
  o.start(); o2.start();
  return () => {
    g.gain.cancelScheduledValues(c.currentTime);
    g.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
    o.stop(c.currentTime + 0.5); o2.stop(c.currentTime + 0.5);
  };
}

const CUES = [
  { at: 0.20, fn: bootBeep },
  { at: 0.70, fn: tick },
  { at: 1.10, fn: tick },
  { at: 1.50, fn: tick },
  { at: 1.90, fn: warnBeep },
  { at: 2.30, fn: tick },
  { at: 2.70, fn: () => blip(1320, 0.12, 0.2, 'square') },
  { at: 3.20, fn: () => whoosh(1.6, 0.25) },
  { at: 4.00, fn: tick }, { at: 4.40, fn: tick }, { at: 4.80, fn: tick },
  { at: 8.40, fn: () => blip(520, 0.08, 0.18, 'sawtooth') },
  { at: 8.90, fn: () => blip(660, 0.05, 0.14, 'square') },
  { at: 9.60, fn: () => { glitch(); blip(1100, 0.1, 0.2, 'square'); } },
  { at: 10.30, fn: () => crackle(0.5, 0.14) },
  { at: 11.00, fn: () => crackle(0.9, 0.18) },
  { at: 11.90, fn: () => { thud(0.42); blip(1760, 0.18, 0.22, 'square'); } },
  { at: 12.40, fn: glitch },
  { at: 13.00, fn: () => whoosh(0.6, 0.32) },
  { at: 13.40, fn: () => crackle(2.1, 0.10) },
  { at: 15.40, fn: () => thud(0.55) },
  { at: 15.55, fn: () => whoosh(0.7, 0.22) },
  { at: 16.20, fn: tick },
  { at: 17.00, fn: () => blip(880, 0.18, 0.16, 'sine') },
  { at: 18.00, fn: () => blip(660, 0.22, 0.14, 'sine') },
  { at: 18.60, fn: tick },
];

export function unlockHexAudio() {
  if (unlocked) return;
  ensureCtx();
  unlocked = true;
  if (!humStop) humStop = ambientHum();
}

export function updateHexAudio(time) {
  if (!unlocked) return;
  if (time + 0.05 < prevTime) fired = new Set(); // rewind/seek
  for (let i=0; i<CUES.length; i++) {
    const cue = CUES[i];
    if (!fired.has(i) && time >= cue.at && time < cue.at + 0.4) {
      try { cue.fn(); } catch (e) {}
      fired.add(i);
    }
  }
  prevTime = time;
}

export function muteHexAudio(m) {
  if (!masterGain || !ctx) return;
  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(m ? 0 : 0.55, ctx.currentTime + 0.15);
  if (m && humStop) { humStop(); humStop = null; unlocked = false; }
}
