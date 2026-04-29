// soundEngine.js — HEXOVERRIDE Audio Engine v2
// FM synthesis + BiquadFilter + convolution reverb + dynamics compression
// Checks SoundManager map for uploaded audio first, falls back to Web Audio synth.

let ctx        = null;
let master     = null;
let comp       = null;
let reverbNode = null;
let reverbWet  = null;
let enabled    = true;
let _soundMap  = {};

export function setSoundMap(map)     { _soundMap = map; }
export function setSoundEnabled(val) { enabled = val; }

export function setVolume(val) {
  if (master) master.gain.setValueAtTime(Math.max(0, Math.min(1, val)), getCtx().currentTime);
}

function buildReverb(c) {
  const conv = c.createConvolver();
  const len  = Math.floor(c.sampleRate * 1.4);
  const buf  = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  }
  conv.buffer = buf;
  return conv;
}

function getCtx() {
  if (!ctx) {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.setValueAtTime(0.72, ctx.currentTime);

    comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-16,  ctx.currentTime);
    comp.knee.setValueAtTime(8,         ctx.currentTime);
    comp.ratio.setValueAtTime(5,        ctx.currentTime);
    comp.attack.setValueAtTime(0.002,   ctx.currentTime);
    comp.release.setValueAtTime(0.12,   ctx.currentTime);

    reverbNode = buildReverb(ctx);
    reverbWet  = ctx.createGain();
    reverbWet.gain.setValueAtTime(0.12, ctx.currentTime);

    master.connect(comp);
    master.connect(reverbNode);
    reverbNode.connect(reverbWet);
    reverbWet.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function mkFilt(c, type, hz, Q = 1) {
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(hz, c.currentTime);
  f.Q.setValueAtTime(Q, c.currentTime);
  return f;
}

function osc(type, freq, t0, dur, peak = 0.30, freqEnd = null) {
  const c = getCtx(), o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}

function oscF(type, freq, t0, dur, peak, freqEnd, filtType, filtHz, filtQ = 1) {
  const c = getCtx(), o = c.createOscillator(), f = mkFilt(c, filtType, filtHz, filtQ), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}

function fm(carrierHz, modRatio, modDepth, t0, dur, peak = 0.35, type = 'sine', freqEnd = null) {
  const c = getCtx();
  const carrier = c.createOscillator(), mod = c.createOscillator();
  const modAmp = c.createGain(), ampEnv = c.createGain();
  carrier.type = type;
  carrier.frequency.setValueAtTime(carrierHz, t0);
  if (freqEnd) carrier.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  mod.frequency.setValueAtTime(carrierHz * modRatio, t0);
  modAmp.gain.setValueAtTime(modDepth, t0);
  modAmp.gain.exponentialRampToValueAtTime(1, t0 + dur * 0.6);
  ampEnv.gain.setValueAtTime(0.001, t0);
  ampEnv.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  ampEnv.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  mod.connect(modAmp); modAmp.connect(carrier.frequency);
  carrier.connect(ampEnv); ampEnv.connect(master);
  carrier.start(t0); mod.start(t0);
  carrier.stop(t0 + dur + 0.05); mod.stop(t0 + dur + 0.05);
}

function nf(filtType, hz, Q, t0, dur, peak = 0.20, hzEnd = null, gainEnd = 0.0001) {
  const c = getCtx();
  const len = Math.floor(c.sampleRate * (dur + 0.15));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), filt = mkFilt(c, filtType, hz, Q), g = c.createGain();
  src.buffer = buf;
  if (hzEnd) filt.frequency.exponentialRampToValueAtTime(hzEnd, t0 + dur);
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.003);
  g.gain.exponentialRampToValueAtTime(gainEnd, t0 + dur);
  src.connect(filt); filt.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur + 0.15);
}

function play(id, synthFn) {
  if (!enabled) return;
  const entry = _soundMap[id];
  if (entry?.url) {
    try {
      const audio = new Audio(entry.url);
      audio.volume = master?.gain?.value || 0.7;
      audio.play().catch(() => synthFn());
      return;
    } catch { /* fall through */ }
  }
  synthFn();
}

// ════════════════════════════════════════════════════════════════
// SOUNDS
// ════════════════════════════════════════════════════════════════

export function playSuccess() {
  play('success', () => {
    const c = getCtx(), t = c.currentTime;
    fm(523, 3.0, 280, t,        0.28, 0.55);
    fm(659, 3.0, 280, t + 0.06, 0.25, 0.50);
    fm(784, 3.1, 280, t + 0.12, 0.28, 0.55);
    nf('highpass', 4000, 1, t + 0.10, 0.15, 0.07);
    osc('sine', 130, t, 0.20, 0.16);
  });
}

export function playFailure() {
  play('failure', () => {
    const c = getCtx(), t = c.currentTime;
    fm(80, 1.5, 600, t, 0.30, 0.38);
    nf('lowpass', 300, 2, t, 0.25, 0.30);
    oscF('sawtooth', 180, t, 0.18, 0.20, 80, 'lowpass', 900, 1);
    nf('highpass', 1000, 1, t + 0.05, 0.12, 0.09);
  });
}

export function playRootShell() {
  play('rootShell', () => {
    const c = getCtx(), t = c.currentTime;
    fm(220, 2.0, 500, t, 0.65, 0.38, 'sine', 880);
    osc('sine', 55, t, 0.60, 0.28, 110);
    nf('bandpass', 400, 3, t + 0.15, 0.40, 0.16, 2000);
    fm(880, 4.0, 80, t + 0.35, 0.30, 0.20);
    osc('sine', 880, t + 0.38, 0.18, 0.18);
  });
}

export function playExfil() {
  play('exfil', () => {
    const c = getCtx(), t = c.currentTime;
    nf('bandpass', 800, 4, t, 0.38, 0.22, 3000, 0.001);
    for (let i = 0; i < 5; i++) fm(400 + i * 180, 2.5, 100, t + i * 0.055, 0.06, 0.16);
    osc('sine', 1200, t + 0.30, 0.16, 0.17);
    osc('sine', 80,   t,        0.38, 0.13);
  });
}

export function playTraceWarning() {
  play('traceWarning', () => {
    const c = getCtx(), t = c.currentTime;
    for (let i = 0; i < 3; i++) {
      fm(880, 2.0, 200, t + i * 0.24,        0.08, 0.32);
      fm(660, 2.0, 200, t + i * 0.24 + 0.11, 0.07, 0.26);
      nf('highpass', 1500, 1, t + i * 0.24, 0.08, 0.11);
    }
    osc('sine', 55, t, 0.70, 0.13);
  });
}

export function playHeatSpike() {
  play('heatSpike', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1400, 1.5, 400, t, 0.28, 0.30, 'sawtooth', 200);
    nf('highpass', 2000, 1, t, 0.14, 0.18, 500);
    osc('sine', 55, t, 0.22, 0.20);
  });
}

export function playBlip() {
  play('blip', () => {
    const c = getCtx(), t = c.currentTime;
    fm(600, 2.0, 60, t, 0.09, 0.10);
    nf('highpass', 3000, 1, t, 0.05, 0.04);
  });
}

export function playDestroy() {
  play('destroy', () => {
    const c = getCtx(), t = c.currentTime;
    fm(50, 1.2, 800, t, 0.55, 0.70);
    nf('lowpass', 200, 2, t, 0.50, 0.38);
    nf('bandpass', 600, 2, t + 0.05, 0.40, 0.20, 100);
    nf('highpass', 800, 1, t, 0.12, 0.14);
  });
}

export function playBeacon() {
  play('beacon', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1200, 4.0, 300, t,        0.04, 0.28);
    fm(900,  4.0, 300, t + 0.06, 0.04, 0.24);
    fm(1500, 4.0, 300, t + 0.12, 0.04, 0.26);
    osc('sine', 60, t, 0.30, 0.15);
    nf('bandpass', 1200, 3, t + 0.14, 0.10, 0.09);
  });
}

export function playNmap() {
  play('nmap', () => {
    const c = getCtx(), t = c.currentTime;
    fm(400, 2.0, 150, t,        0.09, 0.22);
    fm(620, 2.0, 150, t + 0.14, 0.09, 0.22);
    fm(940, 2.0, 150, t + 0.28, 0.10, 0.22);
    nf('bandpass', 600, 5, t + 0.10, 0.06, 0.07);
    nf('bandpass', 900, 5, t + 0.24, 0.06, 0.07);
    nf('highpass', 2000, 1, t + 0.30, 0.12, 0.05);
    osc('sine', 80, t, 0.44, 0.07);
  });
}

export function playBreach() {
  play('breach', () => {
    const c = getCtx(), t = c.currentTime;
    [440, 700, 520, 800, 360, 640, 480, 740].forEach((f, i) =>
      fm(f, 2.0, 80, t + i * 0.042, 0.04, 0.12));
    nf('bandpass', 800, 2, t, 0.34, 0.13);
    fm(80, 1.3, 900, t + 0.36, 0.55, 0.40);
    nf('lowpass', 250, 3, t + 0.36, 0.30, 0.34);
    nf('highpass', 1800, 1, t + 0.36, 0.10, 0.13);
    osc('sine', 40, t + 0.36, 0.40, 0.26);
  });
}

export function playSocial() {
  play('social', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1320, 2.1, 120, t,        0.09, 0.22);
    fm(880,  2.0, 80,  t + 0.08, 0.06, 0.16);
    osc('sine', 110, t, 0.20, 0.07);
    nf('highpass', 5000, 1, t + 0.05, 0.08, 0.04);
  });
}

export function playTunnel() {
  play('tunnel', () => {
    const c = getCtx(), t = c.currentTime;
    nf('bandpass', 300, 3, t, 0.50, 0.26, 100, 0.001);
    nf('highpass', 3000, 1, t + 0.10, 0.30, 0.09, 500);
    osc('sine', 800, t,        0.38, 0.15, 180);
    osc('sine', 160, t + 0.15, 0.25, 0.11, 80);
  });
}

export function playDisconnect() {
  play('disconnect', () => {
    const c = getCtx(), t = c.currentTime;
    fm(300, 2.0, 60, t, 0.12, 0.15, 'sine', 700);
    nf('highpass', 2000, 1, t, 0.06, 0.05);
  });
}

export function playStealth() {
  play('stealth', () => {
    const c = getCtx(), t = c.currentTime;
    const o = c.createOscillator(), lp = mkFilt(c, 'lowpass', 120, 2), g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(40, t + 1.2);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 1.3);
    nf('bandpass', 4500, 8, t + 0.01, 0.018, 0.08);
  });
}

export function playMiner() {
  play('miner', () => {
    const c = getCtx(), t = c.currentTime;
    oscF('sawtooth', 42, t, 1.30, 0.17, null, 'lowpass', 120, 2);
    for (let i = 0; i < 5; i++) {
      fm(160, 3.0, 80, t + i * 0.22, 0.10, 0.10);
      nf('bandpass', 400, 3, t + i * 0.22, 0.06, 0.06);
    }
    fm(1260, 8.0, 40, t + 0.10, 1.00, 0.04);
  });
}

export function playMinerTick() {
  play('minerTick', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1047, 2.0, 120, t, 0.07, 0.12);
    osc('sine', 523, t, 0.10, 0.05);
    nf('highpass', 4000, 1, t, 0.04, 0.03);
  });
}

export function playDump() {
  play('dump', () => {
    const c = getCtx(), t = c.currentTime;
    [880, 740, 620, 520, 415, 330, 220].forEach((f, i) =>
      fm(f, 2.5, 80, t + i * 0.065, 0.07, 0.14));
    nf('bandpass', 1000, 2, t, 0.42, 0.15, 200);
    osc('sine', 80, t, 0.46, 0.11);
    fm(480, 2.0, 40, t + 0.50, 0.04, 0.08);
    fm(480, 2.0, 40, t + 0.57, 0.04, 0.08);
  });
}

export function playWipe() {
  play('wipe', () => {
    const c = getCtx(), t = c.currentTime;
    nf('lowpass', 2500, 1, t, 0.70, 0.17, 60);
    osc('sine', 680, t, 0.70, 0.13, 80);
    nf('highpass', 400, 1, t + 0.55, 0.20, 0.07, 80);
  });
}

export function playSniff() {
  play('sniff', () => {
    const c = getCtx(), t = c.currentTime;
    nf('bandpass', 80, 4, t, 0.90, 0.04, 180, 0.17);
    const o = c.createOscillator(), lp = mkFilt(c, 'lowpass', 150, 2), g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(115, t + 0.9);
    g.gain.setValueAtTime(0.03, t); g.gain.linearRampToValueAtTime(0.15, t + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 0.95);
    fm(440, 2.0, 60, t + 0.46, 0.04, 0.09);
  });
}

export function playAlarm() {
  play('alarm', () => {
    const c = getCtx(), t = c.currentTime;
    for (let i = 0; i < 4; i++) {
      fm(1100, 2.0, 200, t + i * 0.26,        0.12, 0.28);
      fm(740,  2.0, 200, t + i * 0.26 + 0.13, 0.12, 0.24);
      osc('sine', 55, t + i * 0.26, 0.24, 0.17);
      nf('bandpass', 1200, 3, t + i * 0.26, 0.12, 0.09);
    }
  });
}

export function playZeroDay() {
  play('zeroDay', () => {
    const c = getCtx(), t = c.currentTime;
    [330, 415, 494, 659, 880, 1047].forEach((f, i) =>
      fm(f, 3.5, 180, t + i * 0.085, 0.08, 0.20));
    nf('highpass', 5000, 1, t + 0.40, 0.16, 0.07);
    osc('sine', 165, t, 0.55, 0.09);
    fm(1047, 6.0, 60, t + 0.50, 0.20, 0.13);
  });
}

export function playContractDone() {
  play('contractDone', () => {
    const c = getCtx(), t = c.currentTime;
    fm(523, 3.0, 260, t,        0.15, 0.35);
    fm(659, 3.0, 260, t + 0.13, 0.15, 0.30);
    fm(784, 3.0, 260, t + 0.26, 0.22, 0.38);
    oscF('sawtooth', 523, t,        0.14, 0.06, null, 'lowpass', 800,  1);
    oscF('sawtooth', 784, t + 0.26, 0.20, 0.06, null, 'lowpass', 1000, 1);
    osc('sine', 65, t + 0.26, 0.28, 0.19);
    nf('highpass', 3000, 1, t + 0.26, 0.16, 0.09);
  });
}
