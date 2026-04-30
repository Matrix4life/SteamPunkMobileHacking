// soundEngine.js — HEXOVERRIDE Audio Engine v2
// FM synthesis + BiquadFilter + convolution reverb + dynamics compression.
// Fully self-contained. SoundManager pushes custom URLs via setSoundMap()
// only when real files are loaded — synth fallbacks always work otherwise.

let ctx        = null;
let master     = null;
let comp       = null;
let reverbNode = null;
let reverbWet  = null;
let enabled    = true;
let _soundMap  = {};   // { id: { url, name } } — only populated by SoundManager

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

function oscF(type, freq, t0, dur, peak, freqEnd, fType, fHz, fQ = 1) {
  const c = getCtx(), o = c.createOscillator(), f = mkFilt(c, fType, fHz, fQ), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}

function fm(cHz, mRatio, mDepth, t0, dur, peak = 0.35, type = 'sine', fEnd = null) {
  const c = getCtx();
  const car = c.createOscillator(), mod = c.createOscillator();
  const mAmp = c.createGain(), env = c.createGain();
  car.type = type;
  car.frequency.setValueAtTime(cHz, t0);
  if (fEnd) car.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur);
  mod.frequency.setValueAtTime(cHz * mRatio, t0);
  mAmp.gain.setValueAtTime(mDepth, t0);
  mAmp.gain.exponentialRampToValueAtTime(1, t0 + dur * 0.6);
  env.gain.setValueAtTime(0.001, t0);
  env.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  mod.connect(mAmp); mAmp.connect(car.frequency);
  car.connect(env); env.connect(master);
  car.start(t0); mod.start(t0); car.stop(t0 + dur + 0.05); mod.stop(t0 + dur + 0.05);
}

function nf(fType, hz, Q, t0, dur, peak = 0.20, hzEnd = null, gEnd = 0.0001) {
  const c = getCtx();
  const len = Math.floor(c.sampleRate * (dur + 0.15));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), filt = mkFilt(c, fType, hz, Q), g = c.createGain();
  src.buffer = buf;
  if (hzEnd) filt.frequency.exponentialRampToValueAtTime(hzEnd, t0 + dur);
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.003);
  g.gain.exponentialRampToValueAtTime(gEnd, t0 + dur);
  src.connect(filt); filt.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur + 0.15);
}

// Try custom uploaded audio first; always fall back to synth
function play(id, synthFn) {
  if (!enabled) return;
  const e = _soundMap[id];
  if (e?.url) {
    try {
      const a = new Audio(e.url);
      a.volume = master?.gain?.value || 0.7;
      a.play().catch(() => synthFn());
      return;
    } catch { /* fall through */ }
  }
  synthFn();
}

// ════════════════════════════════════════════════════════════════
// SOUNDS — Cyberpunk / Hackers / Matrix aesthetic
// ════════════════════════════════════════════════════════════════

export function playSuccess() {
  play('success', () => {
    const c = getCtx(), t = c.currentTime;
    fm(523,3.0,280,t,       .28,.55); fm(659,3.0,280,t+.06,.25,.50); fm(784,3.1,280,t+.12,.28,.55);
    nf('highpass',4000,1,t+.10,.15,.07); osc('sine',130,t,.20,.16);
  });
}

export function playFailure() {
  play('failure', () => {
    const c = getCtx(), t = c.currentTime;
    fm(80,1.5,600,t,.30,.38); nf('lowpass',300,2,t,.25,.30);
    oscF('sawtooth',180,t,.18,.20,80,'lowpass',900,1); nf('highpass',1000,1,t+.05,.12,.09);
  });
}

export function playRootShell() {
  play('rootShell', () => {
    const c = getCtx(), t = c.currentTime;
    fm(220,2.0,500,t,.65,.38,'sine',880); osc('sine',55,t,.60,.28,110);
    nf('bandpass',400,3,t+.15,.40,.16,2000); fm(880,4.0,80,t+.35,.30,.20); osc('sine',880,t+.38,.18,.18);
  });
}

export function playExfil() {
  play('exfil', () => {
    const c = getCtx(), t = c.currentTime;
    nf('bandpass',800,4,t,.38,.22,3000,.001);
    for(let i=0;i<5;i++) fm(400+i*180,2.5,100,t+i*.055,.06,.16);
    osc('sine',1200,t+.30,.16,.17); osc('sine',80,t,.38,.13);
  });
}

export function playTraceWarning() {
  play('traceWarning', () => {
    const c = getCtx(), t = c.currentTime;
    for(let i=0;i<3;i++){
      fm(880,2.0,200,t+i*.24,.08,.32); fm(660,2.0,200,t+i*.24+.11,.07,.26);
      nf('highpass',1500,1,t+i*.24,.08,.11);
    }
    osc('sine',55,t,.70,.13);
  });
}

export function playHeatSpike() {
  play('heatSpike', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1400,1.5,400,t,.28,.30,'sawtooth',200); nf('highpass',2000,1,t,.14,.18,500); osc('sine',55,t,.22,.20);
  });
}

export function playBlip() {
  play('blip', () => {
    const c = getCtx(), t = c.currentTime;
    fm(600,2.0,60,t,.09,.10); nf('highpass',3000,1,t,.05,.04);
  });
}

export function playDestroy() {
  play('destroy', () => {
    const c = getCtx(), t = c.currentTime;
    fm(50,1.2,800,t,.55,.70); nf('lowpass',200,2,t,.50,.38);
    nf('bandpass',600,2,t+.05,.40,.20,100); nf('highpass',800,1,t,.12,.14);
  });
}

export function playBeacon() {
  play('beacon', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1200,4.0,300,t,      .04,.28); fm(900,4.0,300,t+.06,.04,.24); fm(1500,4.0,300,t+.12,.04,.26);
    osc('sine',60,t,.30,.15); nf('bandpass',1200,3,t+.14,.10,.09);
  });
}

export function playNmap() {
  play('nmap', () => {
    const c = getCtx(), t = c.currentTime;
    fm(400,2.0,150,t,      .09,.22); fm(620,2.0,150,t+.14,.09,.22); fm(940,2.0,150,t+.28,.10,.22);
    nf('bandpass',600,5,t+.10,.06,.07); nf('bandpass',900,5,t+.24,.06,.07);
    nf('highpass',2000,1,t+.30,.12,.05); osc('sine',80,t,.44,.07);
  });
}

export function playBreach() {
  play('breach', () => {
    const c = getCtx(), t = c.currentTime;
    [440,700,520,800,360,640,480,740].forEach((f,i)=>fm(f,2.0,80,t+i*.042,.04,.12));
    nf('bandpass',800,2,t,.34,.13);
    fm(80,1.3,900,t+.36,.55,.40); nf('lowpass',250,3,t+.36,.30,.34);
    nf('highpass',1800,1,t+.36,.10,.13); osc('sine',40,t+.36,.40,.26);
  });
}

export function playSocial() {
  play('social', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1320,2.1,120,t,     .09,.22); fm(880,2.0,80,t+.08,.06,.16);
    osc('sine',110,t,.20,.07); nf('highpass',5000,1,t+.05,.08,.04);
  });
}

export function playTunnel() {
  play('tunnel', () => {
    const c = getCtx(), t = c.currentTime;
    nf('bandpass',300,3,t,.50,.26,100,.001); nf('highpass',3000,1,t+.10,.30,.09,500);
    osc('sine',800,t,.38,.15,180); osc('sine',160,t+.15,.25,.11,80);
  });
}

export function playDisconnect() {
  play('disconnect', () => {
    const c = getCtx(), t = c.currentTime;
    fm(300,2.0,60,t,.12,.15,'sine',700); nf('highpass',2000,1,t,.06,.05);
  });
}

export function playStealth() {
  play('stealth', () => {
    const c = getCtx(), t = c.currentTime;
    const o = c.createOscillator(), lp = mkFilt(c,'lowpass',120,2), g = c.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(55,t); o.frequency.linearRampToValueAtTime(40,t+1.2);
    g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.0001,t+1.2);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t+1.3);
    nf('bandpass',4500,8,t+.01,.018,.08);
  });
}

export function playMiner() {
  play('miner', () => {
    const c = getCtx(), t = c.currentTime;
    oscF('sawtooth',42,t,1.30,.17,null,'lowpass',120,2);
    for(let i=0;i<5;i++){ fm(160,3.0,80,t+i*.22,.10,.10); nf('bandpass',400,3,t+i*.22,.06,.06); }
    fm(1260,8.0,40,t+.10,1.00,.04);
  });
}

export function playMinerTick() {
  play('minerTick', () => {
    const c = getCtx(), t = c.currentTime;
    fm(1047,2.0,120,t,.07,.12); osc('sine',523,t,.10,.05); nf('highpass',4000,1,t,.04,.03);
  });
}

export function playDump() {
  play('dump', () => {
    const c = getCtx(), t = c.currentTime;
    [880,740,620,520,415,330,220].forEach((f,i)=>fm(f,2.5,80,t+i*.065,.07,.14));
    nf('bandpass',1000,2,t,.42,.15,200); osc('sine',80,t,.46,.11);
    fm(480,2.0,40,t+.50,.04,.08); fm(480,2.0,40,t+.57,.04,.08);
  });
}

export function playWipe() {
  play('wipe', () => {
    const c = getCtx(), t = c.currentTime;
    nf('lowpass',2500,1,t,.70,.17,60); osc('sine',680,t,.70,.13,80); nf('highpass',400,1,t+.55,.20,.07,80);
  });
}

export function playSniff() {
  play('sniff', () => {
    const c = getCtx(), t = c.currentTime;
    nf('bandpass',80,4,t,.90,.04,180,.17);
    const o = c.createOscillator(), lp = mkFilt(c,'lowpass',150,2), g = c.createGain();
    o.type='square'; o.frequency.setValueAtTime(70,t); o.frequency.linearRampToValueAtTime(115,t+.9);
    g.gain.setValueAtTime(.03,t); g.gain.linearRampToValueAtTime(.15,t+.7); g.gain.exponentialRampToValueAtTime(.0001,t+.9);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t+.95);
    fm(440,2.0,60,t+.46,.04,.09);
  });
}

export function playAlarm() {
  play('alarm', () => {
    const c = getCtx(), t = c.currentTime;
    for(let i=0;i<4;i++){
      fm(1100,2.0,200,t+i*.26,.12,.28); fm(740,2.0,200,t+i*.26+.13,.12,.24);
      osc('sine',55,t+i*.26,.24,.17); nf('bandpass',1200,3,t+i*.26,.12,.09);
    }
  });
}

export function playZeroDay() {
  play('zeroDay', () => {
    const c = getCtx(), t = c.currentTime;
    [330,415,494,659,880,1047].forEach((f,i)=>fm(f,3.5,180,t+i*.085,.08,.20));
    nf('highpass',5000,1,t+.40,.16,.07); osc('sine',165,t,.55,.09); fm(1047,6.0,60,t+.50,.20,.13);
  });
}

export function playContractDone() {
  play('contractDone', () => {
    const c = getCtx(), t = c.currentTime;
    fm(523,3.0,260,t,      .15,.35); fm(659,3.0,260,t+.13,.15,.30); fm(784,3.0,260,t+.26,.22,.38);
    oscF('sawtooth',523,t,      .14,.06,null,'lowpass',800, 1);
    oscF('sawtooth',784,t+.26,.20,.06,null,'lowpass',1000,1);
    osc('sine',65,t+.26,.28,.19); nf('highpass',3000,1,t+.26,.16,.09);
  });
}

// ── Background music player ─────────────────────────────────────
// Reads bgMusic URL from _soundMap — set by SoundManager after upload.
// playMusic() silently does nothing if no track has been uploaded yet.

let _musicAudio  = null;
let _musicVolume = 0.35;

export function playMusic() {
  const url = _soundMap['bgMusic']?.url;
  if (!url || !enabled) return;
  stopMusic();
  _musicAudio          = new Audio(url);
  _musicAudio.loop     = true;
  _musicAudio.volume   = _musicVolume;
  _musicAudio.play().catch(() => {});
}

export function stopMusic() {
  if (_musicAudio) {
    _musicAudio.pause();
    _musicAudio.currentTime = 0;
    _musicAudio = null;
  }
}

export function setMusicVolume(val) {
  _musicVolume = Math.max(0, Math.min(1, val));
  if (_musicAudio) _musicAudio.volume = _musicVolume;
}

export function isMusicPlaying() {
  return !!_musicAudio && !_musicAudio.paused;
}
