

const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [
  [50, 53, 57, 62],
  [46, 50, 53, 60],
  [41, 48, 53, 57],
  [48, 52, 55, 62],
];
const SLAMS = [1.0, 1.5, 2.0, 2.5, 2.75, 3.0];
const IMPACTS = [[3.6, true], [13.7], [21], [29], [37], [45], [52.3, true]];
const RISERS = [[11.8, 13.7], [19.6, 21], [27.6, 29], [35.4, 37], [43.4, 45], [48.6, 50], [50.2, 52.3], [3.05, 3.45]];
const WHOOSH = [12.4, 20.6, 22.9, 24.9, 26.9, 28.85, 36.85, 44.85, 49.85];
const CLICKS = [13.8, 14.6, 15.6, 16.6, 17.6, 18.6, 19.6];

export class Score {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "playback" });
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    this.master.connect(comp);
    comp.connect(c.destination);
    this.recDest = c.createMediaStreamDestination();
    comp.connect(this.recDest);
    this.noise = this.makeNoise();
    this.verbIR = this.makeIR(3.2);
    this.vo = [];
    this.voGain = 1;
    this.nodes = [];
    this.T0 = 0;
    this.running = false;
  }

  makeNoise() {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  makeIR(sec) {
    const sr = this.ctx.sampleRate;
    const b = this.ctx.createBuffer(2, sr * sec, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6);
    }
    return b;
  }

  async loadVO(lines, base) {
    this.vo = await Promise.all(
      lines.map(async (l) => {
        const r = await fetch(`${base}${l.url}`);
        if (!r.ok) throw new Error(`VO ${l.i} failed`);
        const buf = await this.ctx.decodeAudioData(await r.arrayBuffer());
        return { t: l.t, buf };
      })
    );
  }

  clearVO() { this.vo = []; }

  time() { return this.ctx.currentTime - this.T0; }

  track(n) { this.nodes.push(n); return n; }

  env(g, at, a, peak, rel, sustain = 0) {
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + a);
    if (sustain) g.gain.setValueAtTime(peak, at + a + sustain);
    g.gain.exponentialRampToValueAtTime(0.0001, at + a + sustain + rel);
  }

  noiseSrc(at, dur) {
    const s = this.track(this.ctx.createBufferSource());
    s.buffer = this.noise;
    s.loop = true;
    s.start(at, Math.random());
    s.stop(at + dur + 0.05);
    return s;
  }

  kick(at, v = 1) {
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    const g = c.createGain();
    o.frequency.setValueAtTime(130, at);
    o.frequency.exponentialRampToValueAtTime(42, at + 0.14);
    this.env(g, at, 0.003, 0.9 * v, 0.42);
    o.connect(g).connect(this.bus);
    o.start(at);
    o.stop(at + 0.5);
  }

  hat(at, v = 1, len = 0.05) {
    const c = this.ctx;
    const s = this.noiseSrc(at, len + 0.02);
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7500;
    const g = c.createGain();
    this.env(g, at, 0.001, 0.16 * v, len);
    s.connect(f).connect(g).connect(this.bus);
  }

  clap(at, v = 1) {
    const c = this.ctx;
    const s = this.noiseSrc(at, 0.3);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1700;
    f.Q.value = 0.9;
    const g = c.createGain();
    this.env(g, at, 0.002, 0.32 * v, 0.22);
    s.connect(f).connect(g);
    g.connect(this.bus);
    g.connect(this.verbSend);
  }

  tick(at) {
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    o.type = "square";
    o.frequency.value = 2400;
    const g = c.createGain();
    this.env(g, at, 0.001, 0.05, 0.03);
    o.connect(g).connect(this.bus);
    o.start(at);
    o.stop(at + 0.06);
  }

  impact(at, big = false) {
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    o.frequency.setValueAtTime(big ? 75 : 62, at);
    o.frequency.exponentialRampToValueAtTime(26, at + (big ? 2.2 : 1.1));
    const g = c.createGain();
    this.env(g, at, 0.004, big ? 1.1 : 0.85, big ? 3.6 : 1.8);
    o.connect(g).connect(this.bus);
    o.start(at);
    o.stop(at + 4);
    const s = this.noiseSrc(at, 1.5);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(5000, at);
    f.frequency.exponentialRampToValueAtTime(200, at + 1.2);
    const g2 = c.createGain();
    this.env(g2, at, 0.002, big ? 0.5 : 0.32, 1.1);
    s.connect(f).connect(g2);
    g2.connect(this.bus);
    g2.connect(this.verbSend);
  }

  whoosh(at, dur = 0.45, v = 1) {
    const c = this.ctx;
    const s = this.noiseSrc(at, dur);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(350, at);
    f.frequency.exponentialRampToValueAtTime(4200, at + dur * 0.6);
    f.frequency.exponentialRampToValueAtTime(600, at + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.35 * v, at + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(f).connect(g);
    g.connect(this.bus);
    g.connect(this.verbSend);
  }

  riser(at, end) {
    const c = this.ctx;
    const dur = end - at;
    const s = this.noiseSrc(at, dur);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 2;
    f.frequency.setValueAtTime(220, at);
    f.frequency.exponentialRampToValueAtTime(7000, end);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.22, end - 0.02);
    g.gain.linearRampToValueAtTime(0.0001, end);
    s.connect(f).connect(g);
    g.connect(this.bus);
    g.connect(this.verbSend);
  }

  pad(at, dur, notes, v, cutoff) {
    const c = this.ctx;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = cutoff;
    f.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(v, at + Math.min(1.2, dur * 0.4));
    g.gain.setValueAtTime(v, at + dur - 0.6);
    g.gain.linearRampToValueAtTime(0.0001, at + dur + 1.2);
    f.connect(g);
    g.connect(this.bus);
    g.connect(this.verbSend);
    notes.forEach((n) => [-7, 7].forEach((det) => {
      const o = this.track(c.createOscillator());
      o.type = "sawtooth";
      o.frequency.value = NOTE(n);
      o.detune.value = det;
      o.connect(f);
      o.start(at);
      o.stop(at + dur + 1.4);
    }));
  }

  sub(at, note, v = 1) {
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    o.type = "triangle";
    o.frequency.value = NOTE(note);
    const g = c.createGain();
    this.env(g, at, 0.01, 0.34 * v, 0.2);
    o.connect(g).connect(this.bus);
    o.start(at);
    o.stop(at + 0.3);
  }

  pluck(at, note, v = 1) {
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    o.type = "triangle";
    o.frequency.value = NOTE(note);
    const g = c.createGain();
    this.env(g, at, 0.003, 0.09 * v, 0.22);
    o.connect(g);
    g.connect(this.delay);
    g.connect(this.bus);
    o.start(at);
    o.stop(at + 0.3);
  }

  glitch(at, v = 1) {
    const c = this.ctx;
    const s = this.noiseSrc(at, 0.16);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2600;
    f.Q.value = 3;
    const g = c.createGain();
    g.gain.setValueAtTime(0, at);
    for (let i = 0; i < 9; i++) g.gain.setValueAtTime(i % 2 ? 0 : 0.22 * v, at + i * 0.016);
    g.gain.setValueAtTime(0, at + 0.15);
    s.connect(f).connect(g).connect(this.bus);
  }

  slam(at, v = 1) {
    this.kick(at, 1.1 * v);
    this.clap(at, 0.9 * v);
    this.glitch(at + 0.01, 0.8 * v);
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    o.frequency.setValueAtTime(55, at);
    o.frequency.exponentialRampToValueAtTime(30, at + 0.6);
    const g = c.createGain();
    this.env(g, at, 0.003, 0.7 * v, 0.7);
    o.connect(g);
    g.connect(this.bus);
    g.connect(this.verbSend);
    o.start(at);
    o.stop(at + 1);
  }

  rumble(at, end) {
    const c = this.ctx;
    const o = this.track(c.createOscillator());
    o.frequency.value = 36;
    const s = this.noiseSrc(at, end - at);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 140;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.55, end - 0.05);
    g.gain.linearRampToValueAtTime(0.0001, end);
    o.connect(g);
    s.connect(f).connect(g);
    g.connect(this.bus);
    o.start(at);
    o.stop(end + 0.05);
  }

  start(offset = 0) {
    this.stop();
    const c = this.ctx;
    this.T0 = c.currentTime + 0.06 - offset;
    const at = (t) => this.T0 + t;
    const ok = (t) => t >= offset - 0.001;
    this.bus = c.createGain();
    this.bus.connect(this.master);
    this.verbSend = c.createGain();
    this.verbSend.gain.value = 0.35;
    const verb = c.createConvolver();
    verb.buffer = this.verbIR;
    this.verbSend.connect(verb).connect(this.master);
    this.delay = c.createDelay(1);
    this.delay.delayTime.value = 0.375;
    const fb = c.createGain();
    fb.gain.value = 0.38;
    this.delay.connect(fb).connect(this.delay);
    this.delay.connect(this.bus);
    this.extra = [this.bus, this.verbSend, verb, this.delay, fb];
    const now = Math.max(offset, 0);

    if (now < 3.45) this.rumble(at(now), at(3.45));
    [0.45, 0.72].forEach((t) => ok(t) && this.kick(at(t), 0.55));
    SLAMS.forEach((t) => ok(t) && this.slam(at(t), t === 2.0 ? 1.2 : 0.9));
    for (let t = 3.6; t < 50; t += 4) {
      const ch = CHORDS[Math.round((t - 3.6) / 4) % 4];
      const end = Math.min(t + 4, 50);
      const v = t < 13 ? 0.03 : 0.034;
      const cut = t < 13 ? 900 : t < 21 ? 1300 : t < 37 ? 1800 : 2300;
      if (end > now) this.pad(at(Math.max(t, now)), end - Math.max(t, now), ch, v, cut);
    }
    if (60 > now) this.pad(at(Math.max(52.3, now)), 60 - Math.max(52.3, now) - 0.5, [38, 50, 57, 62, 64, 69], 0.042, 1500);
    IMPACTS.forEach(([t, big]) => ok(t) && this.impact(at(t), !!big));
    RISERS.forEach(([a, b]) => ok(a) && this.riser(at(a), at(b)));
    WHOOSH.forEach((t) => ok(t) && this.whoosh(at(t), 0.42));
    CLICKS.forEach((t) => { if (ok(t)) { this.tick(at(t)); this.tick(at(t + 0.06)); } });
    for (let i = 0; i < 9; i++) { const t = 29 + (i + 0.15) * 0.89; if (ok(t)) this.whoosh(at(t), 0.5, 0.45); }
    if (ok(50.2)) this.whoosh(at(50.2), 2.0, 0.8);

    for (let b = 0; b < 60 / 0.25; b++) {
      const t = b * 0.25;
      if (!ok(t)) continue;
      const beat = b % 4 === 0;
      const half = b % 8 === 0;
      const ch = CHORDS[Math.floor(Math.max(0, t - 3.6) / 4) % 4];
      if (t >= 4 && t < 13.7) { if (beat) this.sub(at(t), ch[0] - 12, 0.4); if (b % 2 === 0) this.pluck(at(t), ch[(b / 2) % 4] + 24, 0.35); }
      if (t >= 13.7 && t < 21) { if (beat) this.kick(at(t), 0.8); if (b % 4 === 2) this.hat(at(t), 0.6); if (b % 2 === 0) this.sub(at(t), ch[0] - 12, 0.6); }
      if (t >= 21 && t < 29) { if (half || b % 16 === 6 || beat) this.kick(at(t), 0.95); if (b % 8 === 4) this.clap(at(t), 0.8); if (b % 4 === 2) this.hat(at(t), 0.8); if (b % 2 === 0) this.sub(at(t), ch[0] - 12, 0.6); }
      if (t >= 29 && t < 37) { if (beat) this.kick(at(t)); this.hat(at(t), b % 2 ? 0.5 : 0.9); if (b % 8 === 4) this.clap(at(t)); if (b % 2 === 0) this.sub(at(t), ch[0] - 12, 0.7); this.pluck(at(t), ch[b % 4] + 12, 0.8); }
      if (t >= 37 && t < 45) { if (beat) this.kick(at(t), 1.05); this.hat(at(t), b % 2 ? 0.6 : 1); if (b % 8 === 4) this.clap(at(t), 1.1); if (b % 2 === 0) this.tick(at(t)); if (b % 10 === 0) this.glitch(at(t), 0.7); this.sub(at(t), ch[0] - 12, 0.8); this.pluck(at(t), ch[(b * 3) % 4] + 12, 0.9); }
      if (t >= 45 && t < 49.6) { if (half) this.kick(at(t), 0.75); if (b % 4 === 2) this.hat(at(t), 0.5, 0.08); if (b % 2 === 0) this.pluck(at(t), ch[b % 4] + 24, 0.5); }
      if (t >= 53 && t < 59 && b % 4 === 0) this.pluck(at(t), [74, 69, 76, 72][(b / 4) % 4], 0.45);
    }

    this.bus.gain.setValueAtTime(1, c.currentTime);
    this.vo.forEach(({ t, buf }) => {
      const end = t + buf.duration;
      if (end < offset) return;
      const src = this.track(c.createBufferSource());
      src.buffer = buf;
      const g = c.createGain();
      g.gain.value = 1.35 * this.voGain;
      src.connect(g).connect(this.master);
      if (t >= offset) src.start(at(t));
      else src.start(c.currentTime + 0.06, offset - t);
      const da = Math.max(c.currentTime + 0.07, at(t - 0.15));
      this.bus.gain.setTargetAtTime(0.5, da, 0.06);
      this.bus.gain.setTargetAtTime(1, Math.max(da + 0.1, at(end + 0.1)), 0.25);
    });
    this.running = true;
  }

  stop() {
    this.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } });
    this.nodes = [];
    (this.extra || []).forEach((n) => n.disconnect());
    this.extra = [];
    this.running = false;
  }
}

