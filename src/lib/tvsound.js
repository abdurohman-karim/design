// akTvSound — the intro TV film's soundtrack, synthesised in code. The same
// craft as the deep score of the coddle Studio film (v2): every sound is plain
// sample maths written into stereo buffers, only while it sounds; the noise is
// seeded, so the film always sounds the same; one dark hall, a bus
// compressor, a look-ahead limiter. No beats — a CRT that thunks on, a dive
// through the glass that lands like a depth charge, a dark hall inside the
// screen, arcs and sparks, a surge, the tube dying.
//
// Runs as a Web Worker: IntroTV posts the film's clock (AK_T) and gets the two
// channels back, rendered off the main thread in a fraction of a second.
// Under Node it exports render() — to bounce a WAV and listen to it.
(() => {
'use strict';

const SR = 48000;
const TAU = Math.PI * 2;

/* ── Building blocks ─────────────────────────────────────────────────────── */

/** A stereo buffer. */
class Track {
  constructor(n) { this.L = new Float32Array(n); this.R = new Float32Array(n); }
}

/** A seeded random, 0 ≤ x < 1 (mulberry32). */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
/** Seeded white noise, a sample at a time. */
function noise(seed) {
  const r = rng(seed);
  return () => r() * 2 - 1;
}

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const cents = (c) => Math.pow(2, c / 1200);

/** An RBJ biquad; its coefficients can be moved while it runs. `peak` takes a gain in dB. */
class Biquad {
  constructor(type) {
    this.type = type;
    this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0;
    this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0;
  }
  set(freq, q, db = 0) {
    const w = (TAU * Math.min(freq, SR * 0.45)) / SR;
    const cw = Math.cos(w);
    const alpha = Math.sin(w) / (2 * q);
    const A = Math.pow(10, db / 40);
    const a0 = this.type === 'peak' ? 1 + alpha / A : 1 + alpha;
    let b0, b1, b2;
    if (this.type === 'lowpass') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; }
    else if (this.type === 'highpass') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; }
    else if (this.type === 'peak') { b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; }
    else { b0 = alpha; b1 = 0; b2 = -alpha; }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = (-2 * cw) / a0;
    this.a2 = (this.type === 'peak' ? 1 - alpha / A : 1 - alpha) / a0;
    return this;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x;
    this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

/** A band-limited saw / square (PolyBLEP): no whistle from aliasing. */
function blep(p, dt) {
  if (p < dt) { const x = p / dt; return x + x - x * x - 1; }
  if (p > 1 - dt) { const x = (p - 1) / dt; return x * x + x + x + 1; }
  return 0;
}
const saw = (p, dt) => 2 * p - 1 - blep(p, dt);
const square = (p, dt) => (p < 0.5 ? 1 : -1) + blep(p, dt) - blep((p + 0.5) % 1, dt);

/** A struck envelope: up in 4 ms, then an exponential fall to −80 dB over `decay`. */
function strike(s, peak, decay) {
  if (s < 0) return 0;
  if (s < 0.004) return (peak * s) / 0.004;
  return peak * Math.exp((-9.21 * (s - 0.004)) / decay);
}
/** An exponential glide from `a` to `b` over `dur`, held after. */
const glide = (s, a, b, dur) => a * Math.pow(b / a, Math.min(1, Math.max(0, s / dur)));
/** Warmth with an edge: soft saturation, louder parts rounded off. */
const drive = (x, k) => Math.tanh(x * k) / Math.tanh(k);
/** A cut over the last few milliseconds: a sound that stops dead, without a click. */
const stop = (s, dur) => (s > dur - 0.006 ? Math.max(0, (dur - s) / 0.006) : 1);

/** A level over the film's clock from [time, value] points, straight lines between. */
const curve = (pts) => (t) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [b, vb] = pts[i];
    if (t <= b) {
      const [a, va] = pts[i - 1];
      return b === a ? vb : va + ((vb - va) * (t - a)) / (b - a);
    }
  }
  return pts[pts.length - 1][1];
};

/** Equal-power gains for a pan in −1…1. */
function panGains(pan) {
  const a = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
}

/** Write `n` samples of a mono voice, panned, into a bus and its sends. */
function voice(b, start, n, gen, o = {}) {
  const i0 = Math.max(0, Math.round(start * SR));
  const end = Math.min(b.out.L.length, i0 + n);
  const wet = o.wet || 0, echo = o.echo || 0;
  const fixed = typeof o.pan === 'function' ? null : panGains(o.pan || 0);
  const { L, R } = b.out;
  for (let i = i0; i < end; i++) {
    const s = (i - i0) / SR;
    const x = gen(i - i0, s);
    const [gl, gr] = fixed || panGains(o.pan(s));
    const l = x * gl, r = x * gr;
    L[i] += l; R[i] += r;
    if (wet) { b.reverb.L[i] += l * wet; b.reverb.R[i] += r * wet; }
    if (echo) { b.delay.L[i] += l * echo; b.delay.R[i] += r * echo; }
  }
}

/* ── The deep kit (after coddle's film v2) ───────────────────────────────── */

/** When a blast's first aftershock lands (s): the bed holds its breath till then. */
const collapseAt = (size) => 0.24 * size;

/**
 * An explosion: a dull blow — a sine dropping from 95 to 30 Hz, driven hard
 * and low-passed, pressure rather than a bang; a vacuum; the air sucked back
 * in and the aftershocks (a second blow, then a third, smaller); the pressure
 * throbbing in the ears. `size` stretches it: bigger is lower and slower.
 */
function blast(b, at, o = {}) {
  const vel = o.vel == null ? 1 : o.vel;
  const size = o.size || 1;
  const C = collapseAt(size);
  const seed = Math.round(at * 100);

  // the blow
  {
    let p = 0;
    const nz = noise(seed + 1);
    const lp = new Biquad('lowpass').set(240 / Math.sqrt(size), 0.8);
    const crunch = new Biquad('lowpass');
    voice(b, at, Math.round(1.2 * SR), (k, s) => {
      if (k % 32 === 0) crunch.set(glide(s, 1100, 140, 0.35 * size), 1);
      p += glide(s, 95 / size, 30, 0.45 * size) / SR;
      const body = Math.sin(TAU * p) * (s < 0.003 ? s / 0.003 : Math.exp(-s / (0.075 * size)));
      const grit = drive(nz() * 3, 3) * strike(s, 0.5, 0.45 * size);
      return lp.run(drive(body * 2.4, 3)) * 0.95 * vel + crunch.run(grit) * 0.4 * vel;
    }, { wet: 0.25 });
  }
  // the air rushing back in, cut dead by the first aftershock
  {
    const nz = noise(seed + 2);
    const lp = new Biquad('lowpass');
    const len = Math.min(0.11, C * 0.6);
    voice(b, at + C - len, Math.round(len * SR), (k, s) => {
      if (k % 32 === 0) lp.set(glide(s, 240, 800, len), 0.8);
      const x = s / len;
      return lp.run(nz()) * x * x * x * 0.5 * vel * stop(s, len);
    }, { wet: 0.15 });
  }
  // the aftershocks: it falls in on itself, bounces, falls in again
  [[C, 0.75, 1], [C * 1.8, 0.38, 0.75], [C * 2.4, 0.16, 0.6]].forEach(([when, level, len], j) => {
    let p = 0;
    const nz = noise(seed + 3 + j);
    const lp = new Biquad('lowpass').set(220, 0.8);
    const puff = new Biquad('lowpass');
    voice(b, at + when, Math.round(0.9 * len * size * SR), (k, s) => {
      if (k % 32 === 0) puff.set(glide(s, 700, 110, 0.25), 0.9);
      p += glide(s, 78 / Math.sqrt(size), 28, 0.3 * len) / SR;
      const body = Math.sin(TAU * p) * strike(s, 1, 0.55 * len * size);
      return (lp.run(drive(body * 2, 2.6)) * 0.85 + puff.run(nz()) * strike(s, 0.35, 0.3 * len)) * level * vel;
    }, { wet: 0.3 });
  });
  // the pressure in the ears: a deep throb that slows and fades
  {
    let p = 0, q = 0;
    voice(b, at + C, Math.round(1.8 * size * SR), (_k, s) => {
      p += 34 / SR;
      q += glide(s, 7, 2.5, 1.2) / SR;
      const throb = 0.6 + 0.4 * Math.cos(TAU * q);
      const env = s < 0.04 ? s / 0.04 : Math.exp(-(s - 0.04) / (0.55 * size));
      return Math.sin(TAU * p) * throb * env * 0.32 * vel;
    });
  }
}

/**
 * The air sucked in before a blow: dark noise slowly opening and a pressure
 * rising under it, cut dead at `at + dur` — where the blow lands. Kept low: a
 * hiss would cut the ear just before the hit.
 */
function implode(b, at, dur, vel = 1) {
  const seed = Math.round(at * 100);
  for (const [j, pan] of [[0, -0.5], [1, 0.5]]) {
    const nz = noise(seed + 71 + j);
    const lp = new Biquad('lowpass');
    voice(b, at, Math.round(dur * SR), (k, s) => {
      if (k % 32 === 0) lp.set(glide(s, 110, 850, dur), 0.8);
      const x = s / dur;
      return lp.run(nz()) * x * x * x * 0.3 * vel * stop(s, dur);
    }, { pan, wet: 0.15 });
  }
  let p = 0;
  voice(b, at, Math.round(dur * SR), (_k, s) => {
    p += glide(s, 26, 64, dur) / SR;
    const x = s / dur;
    return Math.sin(TAU * p) * x * x * 0.32 * vel * stop(s, dur);
  });
}

/**
 * The biggest hit, under a blast: a sub that drops from 58 to 26 Hz and rings
 * for seconds; a shock of dark air spreading out left and right; a low D chord
 * (root, fifth, octave) swelling out of it, driven; a rumble that takes its
 * time to die.
 */
function boom(b, at, vel = 1) {
  {
    let p = 0;
    voice(b, at, Math.round(5 * SR), (_k, s) => {
      p += glide(s, 58, 26, 2.6) / SR;
      const env = s < 0.006 ? s / 0.006 : Math.exp(-(s - 0.006) / 1.3);
      return drive(Math.sin(TAU * p) * env * 1.4, 1.6) * 0.55 * vel;
    }, { wet: 0.15 });
  }
  for (const [j, pan] of [[0, -0.75], [1, 0.75]]) {
    const nz = noise(Math.round(at * 100) + 223 + j);
    const lp = new Biquad('lowpass');
    voice(b, at, Math.round(2.4 * SR), (k, s) => {
      if (k % 32 === 0) lp.set(glide(s, 1800, 90, 1.6), 0.7);
      const env = s < 0.01 ? s / 0.01 : Math.exp(-(s - 0.01) / 0.7);
      return lp.run(nz()) * env * 0.5 * vel;
    }, { pan, wet: 0.45 });
  }
  {
    const dur = 4.2;
    const voices = [26, 33, 38, 45].flatMap((m) => [-9, 0, 9].map((c, j) => ({
      f: (hz(m) * cents(c)) / SR, p: (m * 0.17 + j * 0.29) % 1,
    })));
    const lp = new Biquad('lowpass');
    voice(b, at, Math.round(dur * SR), (k, s) => {
      if (k % 32 === 0) lp.set(s < 0.35 ? glide(s, 140, 900, 0.35) : glide(s - 0.35, 900, 160, dur - 0.35), 0.9);
      let x = 0;
      for (const v of voices) { v.p += v.f; if (v.p >= 1) v.p -= 1; x += saw(v.p, v.f); }
      const env = s < 0.08 ? s / 0.08 : Math.pow(Math.max(0, 1 - (s - 0.08) / (dur - 0.08)), 1.8);
      return drive(lp.run(x) * 0.3, 2.2) * env * 0.36 * vel;
    }, { wet: 0.5 });
  }
  {
    const nz = noise(Math.round(at * 100) + 227);
    const lp = new Biquad('lowpass').set(140, 0.7);
    let y = 0;
    voice(b, at + 0.05, Math.round(5 * SR), (_k, s) => {
      y = y * 0.98 + nz() * 0.2;
      const env = (s < 0.2 ? s / 0.2 : 1) * Math.exp(-s / 1.6);
      return lp.run(y) * env * 0.6 * vel;
    }, { wet: 0.3 });
  }
}

/** A deep hit: a sub falling an octave, a dark burst, a long room. */
function impact(b, at, vel = 1) {
  let p = 0;
  const nz = noise(Math.round(at * 10) + 5);
  const lp = new Biquad('lowpass');
  voice(b, at, Math.round(1.8 * SR), (_k, s) => {
    p += glide(s, 72, 34, 1.1) / SR;
    return Math.sin(TAU * p) * strike(s, 0.75 * vel, 1.6);
  }, { wet: 0.15 });
  voice(b, at, Math.round(1.2 * SR), (k, s) => {
    if (k % 32 === 0) lp.set(glide(s, 2400, 200, 1.0), 0.7);
    return lp.run(nz()) * strike(s, 0.28 * vel, 0.9);
  }, { wet: 0.6 });
}

/**
 * A breeze: air moving past, soft — two strands of dark noise, one an ear,
 * leaned towards pink; a low-pass that opens and closes with no resonance; a
 * long smooth swell in and out. No drive: nothing in it to cut the ear.
 */
function breeze(b, at, dur, o = {}) {
  const vel = o.vel == null ? 1 : o.vel;
  const from = o.from == null ? -0.4 : o.from;
  const to = o.to == null ? 0.4 : o.to;
  const open = o.open || 1400;
  const top = dur * (o.peak || 0.45);
  for (const [j, side] of [[0, -0.35], [1, 0.35]]) {
    const nz = noise(Math.round(at * 100) + 211 + j);
    const lp = new Biquad('lowpass');
    const hp = new Biquad('highpass').set(110, 0.6);
    let pink = 0;
    voice(b, at, Math.round(dur * SR), (k, s) => {
      if (k % 32 === 0) lp.set(s < top ? glide(s, 300, open, top) : glide(s - top, open, 360, dur - top), 0.5);
      pink = pink * 0.86 + nz() * 0.14;
      const x = s / dur;
      const env = x < top / dur
        ? Math.pow(Math.sin((Math.PI / 2) * (x * dur / top)), 2)
        : Math.pow(Math.cos((Math.PI / 2) * ((x * dur - top) / (dur - top))), 2);
      return hp.run(lp.run(pink)) * env * 1.5 * vel;
    }, {
      pan: (s) => Math.max(-1, Math.min(1, from + (to - from) * (s / dur) + side)),
      wet: 0.3,
    });
  }
}

/** The dark air of the room: two slow currents left and right, breathing. */
function current(b, at, dur, vel = 1) {
  for (const [j, pan, rate] of [[0, -0.6, 0.11], [1, 0.6, 0.083]]) {
    const nz = noise(Math.round(at * 10) + 89 + j);
    const lp = new Biquad('lowpass');
    let y = 0;
    voice(b, at, Math.round(dur * SR), (k, s) => {
      if (k % 64 === 0) lp.set(260 + 190 * Math.sin(TAU * rate * s + j * 2), 0.9);
      y = y * 0.985 + nz() * 0.15;
      const env = Math.min(1, s / 1.2, (dur - s) / 1.2);
      return lp.run(y) * env * 0.55 * vel;
    }, { pan, wet: 0.2 });
  }
}

/** A low drone that breathes: detuned saws, a dark filter wandering; `level(t)` on the film's clock. */
function drone(b, at, dur, notes, level, vel = 1) {
  const voices = notes.flatMap((m) => [-6, 6].map((c) => ({ f: (hz(m) * cents(c)) / SR, p: (m * 0.29 + c * 0.01 + 1) % 1 })));
  const lp = new Biquad('lowpass');
  voice(b, at, Math.round(dur * SR), (k, s) => {
    const g = level(at + s);
    if (k % 64 === 0) lp.set(180 + 300 * g + 70 * Math.sin(s * 1.7), 1.1);
    let x = 0;
    for (const v of voices) { v.p += v.f; if (v.p >= 1) v.p -= 1; x += saw(v.p, v.f); }
    return lp.run(x) * g * 0.1 * vel;
  }, { wet: 0.4 });
}

/** A warm chord: three detuned voices a note, spread wide, the filter opening slowly. */
function pad(b, at, dur, notes, o = {}) {
  const vel = o.vel == null ? 1 : o.vel;
  const attack = o.attack == null ? 1.2 : o.attack;
  const release = o.release == null ? 1.6 : o.release;
  const cutoff = o.cutoff || 1600;
  const total = dur + release;
  const n = Math.round(total * SR);
  const peak = (0.11 * vel) / Math.sqrt(notes.length);
  const voices = notes.flatMap((m) => [[-11, -0.55, 'saw', 0.45], [0, 0, 'tri', 0.9], [11, 0.55, 'saw', 0.45]]
    .map(([c, pan, kind, level]) => {
      const [gl, gr] = panGains(pan);
      return { inc: (hz(m) * cents(c)) / SR, p: (((m * 0.37 + c) % 1) + 1) % 1, kind, gl: gl * level, gr: gr * level };
    }));
  const fl = new Biquad('lowpass'), fr = new Biquad('lowpass');
  // the chord leaves the low end to the drone and the hits
  const hl = new Biquad('highpass').set(170, 0.7), hr = new Biquad('highpass').set(170, 0.7);
  const i0 = Math.round(at * SR);
  const end = Math.min(b.out.L.length, i0 + n);
  const open = attack + dur * 0.4;
  for (let i = i0; i < end; i++) {
    const k = i - i0, s = k / SR;
    if (k % 64 === 0) {
      const f = s < open
        ? cutoff * (0.5 + 0.5 * (s / open))
        : cutoff * (1 - 0.4 * Math.min(1, (s - open) / Math.max(0.01, total - open)));
      fl.set(f, 0.7); fr.set(f, 0.7);
    }
    let l = 0, r = 0;
    for (const v of voices) {
      v.p += v.inc;
      if (v.p >= 1) v.p -= 1;
      const x = v.kind === 'saw' ? saw(v.p, v.inc) : (v.p < 0.5 ? 4 * v.p - 1 : 3 - 4 * v.p);
      l += x * v.gl; r += x * v.gr;
    }
    const env = s < attack ? s / attack : s < dur ? 1 : Math.max(0, 1 - (s - dur) / release);
    const yl = hl.run(fl.run(l)) * env * peak, yr = hr.run(fr.run(r)) * env * peak;
    b.out.L[i] += yl; b.out.R[i] += yr;
    b.reverb.L[i] += yl * 0.55; b.reverb.R[i] += yr * 0.55;
    b.delay.L[i] += yl * 0.08; b.delay.R[i] += yr * 0.08;
  }
}

/** Something lands: a dull knock, felt more than heard. */
function knock(b, at, vel = 1, pan = 0) {
  let p = 0;
  const nz = noise(Math.round(at * 1000) + 107);
  const lp = new Biquad('lowpass').set(1100, 0.8);
  voice(b, at, Math.round(0.09 * SR), (_k, s) => {
    p += glide(s, 150, 85, 0.05) / SR;
    return lp.run(nz()) * strike(s, 0.32 * vel, 0.012) + Math.sin(TAU * p) * strike(s, 0.26 * vel, 0.06);
  }, { pan, wet: 0.12, echo: 0.12 });
}

/** It holds: a soft ping from the deep over a low warm fifth. */
function sonar(b, at, root = 62, vel = 1) {
  const fs = [root - 12, root - 5].map((m) => hz(m) / SR);
  const ps = [0, 0];
  voice(b, at, Math.round(1.5 * SR), (_k, s) => {
    let x = 0;
    for (let j = 0; j < 2; j++) { ps[j] += fs[j]; x += Math.sin(TAU * ps[j]); }
    const env = s < 0.015 ? s / 0.015 : Math.exp((-4 * (s - 0.015)) / 1.3);
    return x * env * 0.07 * vel;
  }, { wet: 0.4 });
  let p = 0;
  const f = hz(root + 12);
  voice(b, at, Math.round(1.2 * SR), (_k, s) => {
    p += (f * (1 - 0.01 * Math.min(1, s))) / SR;
    const env = s < 0.006 ? s / 0.006 : Math.exp(-(s - 0.006) / 0.35);
    return Math.sin(TAU * p) * env * 0.05 * vel;
  }, { wet: 0.8, echo: 0.25 });
}

/** A reversed cymbal, kept dark: air drawn in towards a moment at `at + dur`. */
function reverse(b, at, dur, vel = 1) {
  const nz = noise(Math.round(at * 100) + 31);
  const hp = new Biquad('highpass').set(1500, 0.7);
  const lp = new Biquad('lowpass').set(5000, 0.7);
  voice(b, at, Math.round(dur * SR), (_k, s) => lp.run(hp.run(nz())) * Math.pow(s / dur, 3) * 0.2 * vel * stop(s, dur),
    { wet: 0.3 });
}

/** Something breaking: chopped noise and a square stuttering, slowing down. */
function glitch(b, at, dur, vel = 1) {
  const nz = noise(Math.round(at * 100) + 53);
  const bp = new Biquad('bandpass').set(1400, 1.5);
  const f = hz(45) / SR;
  let p = 0;
  voice(b, at, Math.round(dur * SR), (_k, s) => {
    // the chops get longer as it dies
    const rate = 40 - 26 * (s / dur);
    const on = (s * rate) % 1 < 0.5 ? 1 : 0;
    p += f;
    if (p >= 1) p -= 1;
    return (bp.run(nz()) * 0.5 + square(p, f) * 0.25) * on * (1 - s / dur) * 0.3 * vel;
  }, { pan: (s) => Math.sin(s * 40) * 0.4, wet: 0.2 });
}

/* ── The set: a CRT, its power, its faults ───────────────────────────────── */

/** The power switch: a relay clacking shut — the contacts bouncing, the chassis answering low. */
function relay(b, at, vel = 1) {
  const nz = noise(Math.round(at * 1000) + 3);
  const bp = new Biquad('bandpass').set(2300, 1.2);
  const lp = new Biquad('lowpass').set(900, 0.8);
  let p = 0;
  voice(b, at, Math.round(0.25 * SR), (_k, s) => {
    const n = nz();
    p += glide(s, 140, 70, 0.06) / SR;
    const click = bp.run(n) * (strike(s, 0.5, 0.006) + strike(s - 0.011, 0.3, 0.005));
    const body = lp.run(n) * strike(s, 0.4, 0.03) + Math.sin(TAU * p) * strike(s, 0.45, 0.09);
    return (click + body) * vel;
  }, { wet: 0.12 });
}

/**
 * The degauss: the coil round the tube kicks in — a big 50 Hz hum, two
 * windings a little apart so it beats, buzzing and rattling the shadow mask,
 * dying away over a second and a half. The CRT's signature «thunk-hummm».
 */
function degauss(b, at, vel = 1) {
  const dur = 2.0;
  const nz = noise(Math.round(at * 1000) + 5);
  const rattle = new Biquad('bandpass').set(700, 1.1);
  const lp = new Biquad('lowpass').set(520, 0.9);
  let p = 0, q = 0;
  voice(b, at, Math.round(dur * SR), (_k, s) => {
    p += 50 / SR; q += 50.6 / SR;
    if (p >= 1) p -= 1;
    if (q >= 1) q -= 1;
    const env = s < 0.006 ? s / 0.006 : Math.exp(-(s - 0.006) / 0.42) * 0.8 + Math.exp(-s / 0.12) * 0.2;
    const tone = Math.sin(TAU * p) + 0.6 * Math.sin(TAU * 2 * q) + 0.35 * Math.sin(TAU * 3 * p);
    const buzz = lp.run(square(p, 50 / SR));
    // the mask rattles twice a cycle
    const mask = rattle.run(nz()) * Math.pow(Math.abs(Math.sin(TAU * p)), 6);
    return (drive((tone * 0.8 + buzz * 0.5) * env, 2.2) * 0.5 + mask * env * 0.9) * vel;
  }, { wet: 0.3 });
}

/* Real sparks. An electric discharge is a train of tiny cracks, each a
   broadband impulse well under a millisecond long; an arc on the mains
   restrikes every half-cycle, and that is where the «bzzzt» comes from — so
   there is no oscillator in any of this. Every crack is an event
   { t, amp, tau, pan }: the generators below place them, sparkVoice() plays
   them through the chassis and a short room — not the hall, nothing muffles
   them — with the top rounded off and a dip where the ear is touchiest, so
   they snap without cutting. */

/** The first crack of a spark: a cluster inside a few milliseconds, the first the hardest, a ragged sputter after. */
function snapEvents(r, t0, vel, pan, spread) {
  const ev = [];
  const n = 3 + Math.floor(r() * 5);
  for (let j = 0; j < n; j++) {
    ev.push({
      t: t0 + (j ? Math.pow(r(), 1.5) * 0.006 : 0),
      amp: vel * (j ? 0.25 + 0.5 * r() : 1),
      tau: 0.0004 + 0.001 * r(),
      pan: pan + (r() * 2 - 1) * spread * 0.3,
    });
  }
  const m = 10 + Math.floor(r() * 8);
  for (let j = 0; j < m; j++) {
    ev.push({
      t: t0 + 0.006 + Math.pow(r(), 1.6) * 0.07,
      amp: vel * (0.15 + 0.45 * r()),
      tau: 0.0003 + 0.0012 * r(),
      pan: pan + (r() * 2 - 1) * spread,
    });
  }
  return ev;
}

/**
 * An arc on the mains: it restrikes every half-cycle (10 ms at 50 Hz), a
 * little early or late, now and then not at all, a cluster of cracks each
 * time; its heat wanders. `gate(s)` 0…1 lights and darkens it.
 */
function arcEvents(r, t0, dur, vel, pan, spread, gate) {
  const ev = [];
  let heat = 0.7 + 0.3 * r();
  for (let k = 0; k * 0.01 < dur; k++) {
    const s = k * 0.01;
    heat = Math.min(1, Math.max(0.15, heat + (r() - 0.5) * 0.35));
    const g = gate ? gate(s) : 1;
    if (g <= 0 || r() > 0.85) continue;
    const base = t0 + s + (r() - 0.5) * 0.003;
    const c = 2 + Math.floor(r() * 3);
    for (let j = 0; j < c; j++) {
      ev.push({
        t: base + j * (0.0004 + 0.001 * r()),
        amp: vel * heat * g * (0.35 + 0.65 * r()) * (j ? 0.6 : 1),
        tau: 0.0004 + 0.0012 * r(),
        pan: pan + (r() * 2 - 1) * spread,
      });
    }
  }
  return ev;
}

/** Embers flying off: single cracks and doublets, mostly small, thinning out (`thin` > 1) or gathering (`thin` < 1). */
function emberEvents(r, t0, dur, count, vel, thin, pan, spread) {
  const ev = [];
  for (let j = 0; j < count; j++) {
    const x = Math.pow(r(), thin);
    const fade = thin >= 1 ? Math.pow(1 - x, 0.6) : 0.4 + 0.6 * x;
    const amp = vel * fade * (0.15 + 0.85 * r() * r());
    const p = pan + (r() * 2 - 1) * spread;
    const t = t0 + x * dur;
    ev.push({ t, amp, tau: 0.00015 + 0.0005 * r(), pan: p });
    if (r() < 0.3) ev.push({ t: t + 0.001 + 0.004 * r(), amp: amp * (0.3 + 0.4 * r()), tau: 0.0002 + 0.0004 * r(), pan: p });
  }
  return ev;
}

/**
 * Plays crack events (times relative to `at`): seeded noise under a
 * per-crack envelope, each crack panned on its own; a body in the low mids
 * and the chassis ringing faintly under it; saturated against a ceiling, so a crack is loud without
 * a peak that would make the limiter pump; the top rounded off above `top`
 * and dipped around 3.3 kHz; one early reflection, crossed, a touch of hall.
 */
function sparkVoice(b, at, events, o = {}) {
  if (!events.length) return;
  events.sort((x, y) => x.t - y.t);
  const top = o.top || 5600;
  const wet = o.wet == null ? 0.06 : o.wet;
  const i0 = Math.max(0, Math.round(at * SR));
  const end = Math.min(b.out.L.length, i0 + Math.round((events[events.length - 1].t + 0.06) * SR));
  const nz = noise(o.seed || i0 + 907);
  const chain = () => ({
    e: 0, k: 0,
    hp: new Biquad('highpass').set(o.low || 260, 0.7),
    body: new Biquad('peak').set(850, 0.8, 5),
    ring1: new Biquad('bandpass').set(1150, 4),
    ring2: new Biquad('bandpass').set(2650, 5),
    dip: new Biquad('peak').set(3300, 1, -5),
    lp1: new Biquad('lowpass').set(top, 0.6),
    lp2: new Biquad('lowpass').set(top * 1.1, 0.6),
  });
  const ch = [chain(), chain()];
  const refl = Math.round(0.011 * SR);
  const back = [new Float32Array(refl), new Float32Array(refl)];
  const y = [0, 0];
  let ri = 0, next = 0;
  for (let i = i0; i < end; i++) {
    const s = (i - i0) / SR;
    while (next < events.length && events[next].t <= s) {
      const ev = events[next++];
      const g = panGains(ev.pan);
      const k = Math.exp(-1 / (ev.tau * SR));
      for (let c = 0; c < 2; c++) {
        if (ev.amp * g[c] > ch[c].e) { ch[c].e = ev.amp * g[c]; ch[c].k = k; }
      }
    }
    const x = nz();
    for (let c = 0; c < 2; c++) {
      const C = ch[c];
      let v = C.body.run(C.hp.run(x * C.e));
      C.e *= C.k;
      v += C.ring1.run(v) * 0.5 + C.ring2.run(v) * 0.3;
      v = C.lp1.run(C.dip.run(v));
      // close-miked: the loud cracks saturate against a ceiling, the small ones
      // come up; the second low-pass takes the edge off what that adds
      y[c] = C.lp2.run(0.5 * Math.tanh(v * 8));
    }
    const l = y[0] + back[1][ri] * 0.3, r = y[1] + back[0][ri] * 0.3;
    back[0][ri] = y[0]; back[1][ri] = y[1];
    if (++ri >= refl) ri = 0;
    b.out.L[i] += l; b.out.R[i] += r;
    b.reverb.L[i] += l * wet; b.reverb.R[i] += r * wet;
  }
}

/** A spark: the crack, a short sputter of arc, embers flying off. */
function spark(b, at, o = {}) {
  const vel = o.vel == null ? 1 : o.vel;
  const pan = o.pan || 0;
  const spread = o.spread == null ? 0.4 : o.spread;
  const r = rng(Math.round(at * 1000) + 911 + (o.seed || 0));
  sparkVoice(b, at, [
    ...snapEvents(r, 0, 0.9 * vel, pan, spread),
    ...arcEvents(r, 0.004, o.sputter || 0.2, 0.55 * vel, pan, spread),
    ...emberEvents(r, 0.03, o.embers || 0.9, o.count || 20, 0.4 * vel, 1.6, pan, spread + 0.3),
  ], { seed: Math.round(at * 1000) + 913 + (o.seed || 0) });
}

/** Sparks crackling on their own: embers, thick at first and thinning (`thin` > 1), or gathering (`thin` < 1). */
function crackle(b, at, dur, o = {}) {
  const r = rng(o.seed || Math.round(at * 1000) + 401);
  const vel = o.vel == null ? 1 : o.vel;
  sparkVoice(b, at, emberEvents(r, 0, dur, o.count || 20, 0.4 * vel, o.thin || 1.8, o.pan || 0,
    o.spread == null ? 0.8 : o.spread), { top: 5000, low: 320 });
}

/**
 * Mains hum off the tube: 50 Hz and its family, a little buzz, a slow beat.
 * `level(t)` shapes it on the film's clock: it swells, gets sucked out, dies.
 */
function hum(b, at, dur, level, vel = 1) {
  let p = 0;
  const lp = new Biquad('lowpass').set(700, 0.7);
  voice(b, at, Math.round(dur * SR), (_k, s) => {
    p += 50 / SR;
    if (p >= 1) p -= 1;
    const x = Math.sin(TAU * p) * 0.5 + Math.sin(TAU * 2 * p) * 0.8 + Math.sin(TAU * 3 * p) * 0.3
      + Math.sin(TAU * 4 * p) * 0.15 + lp.run(saw(p, 50 / SR)) * 0.25;
    return x * level(at + s) * (0.85 + 0.15 * Math.sin(TAU * 0.7 * s)) * 0.05 * vel;
  });
}

/** TV snow: hiss, darkened so it never cuts, crackling now and then; `level(t)` on the film's clock. */
function snow(b, at, dur, level, vel = 1) {
  for (const [j, pan] of [[0, -0.45], [1, 0.45]]) {
    const nz = noise(Math.round(at * 100) + 301 + j);
    const r = rng(311 + j);
    const hp = new Biquad('highpass').set(380, 0.7);
    const lp = new Biquad('lowpass').set(5200, 0.7);
    voice(b, at, Math.round(dur * SR), (_k, s) => {
      const g = level(at + s);
      if (g <= 0) return 0;
      const tick = r() < 0.0012 ? (r() * 2 - 1) * 5 : 0;
      return lp.run(hp.run(nz() + tick)) * g * 0.07 * vel;
    }, { pan, wet: 0.06 });
  }
}

/** The tube charging: a soft whine climbing as the line opens, crackle gathering on the glass. */
function charge(b, at, dur, vel = 1) {
  let p = 0;
  voice(b, at, Math.round((dur + 0.5) * SR), (_k, s) => {
    p += glide(s, 220, 3400, dur) / SR;
    if (p >= 1) p -= 1;
    const env = s < dur ? Math.pow(s / dur, 1.5) : Math.exp(-(s - dur) / 0.12);
    return Math.sin(TAU * p) * env * 0.03 * vel;
  }, { wet: 0.3 });
  crackle(b, at, dur + 0.15, { count: 16, vel: 0.45 * vel, thin: 0.6 });
}

/** A falling «pew»: a sine diving from `from` to `to` Hz — a picture collapsing. */
function pew(b, at, dur, from, to, vel = 1) {
  let p = 0;
  const tail = dur + 0.12;
  voice(b, at, Math.round(tail * SR), (_k, s) => {
    p += glide(s, from, to, dur) / SR;
    if (p >= 1) p -= 1;
    const env = s < 0.004 ? s / 0.004 : Math.pow(Math.max(0, 1 - s / tail), 1.4);
    return drive(Math.sin(TAU * p) * 1.3, 1.5) * env * 0.12 * vel;
  }, { wet: 0.35, echo: 0.1 });
}

/** An electric arc across the glass: the mains arc, lit and dark in the film's 45 ms steps (zap() in IntroTV). */
function arc(b, at, steps, o = {}) {
  const vel = o.vel == null ? 1 : o.vel;
  const r = rng(Math.round(at * 1000) + 501 + (o.seed || 0));
  const gates = Array.from({ length: steps }, () => (r() > 0.12 ? 0.55 + 0.45 * r() : 0));
  const gate = (s) => gates[Math.min(steps - 1, Math.floor(s / 0.045))];
  sparkVoice(b, at, arcEvents(r, 0, steps * 0.045, 0.5 * vel, o.pan || 0, 0.35, gate),
    { seed: Math.round(at * 1000) + 503 + (o.seed || 0) });
}

/** The bang under a fault: a thump through the chassis and a short burst of air (the spark makes the crack). */
function pop(b, at, vel = 1) {
  const nz = noise(Math.round(at * 1000) + 601);
  const lp = new Biquad('lowpass');
  let p = 0;
  voice(b, at, Math.round(0.5 * SR), (k, s) => {
    if (k % 16 === 0) lp.set(glide(s, 2600, 260, 0.08), 0.7);
    p += glide(s, 130, 42, 0.12) / SR;
    const air = lp.run(nz()) * strike(s, 0.45, 0.09);
    const body = Math.sin(TAU * p) * strike(s, 0.7, 0.32);
    return drive(air + body, 1.6) * vel;
  }, { wet: 0.2 });
}

/** The vertical hold slipping: the picture jerks back in five steps — a low stutter, stepping down. */
function slip(b, at, dur, vel = 1) {
  let p = 0;
  const lp = new Biquad('lowpass').set(900, 1);
  voice(b, at, Math.round(dur * SR), (_k, s) => {
    const x = (s / dur) * 5;
    const f = 90 * Math.pow(0.82, Math.floor(x));
    const w = x % 1;
    const gate = w < 0.7 ? Math.min(1, w / 0.03, (0.7 - w) / 0.03) : 0;
    p += f / SR;
    if (p >= 1) p -= 1;
    return lp.run(square(p, f / SR)) * gate * (1 - (s / dur) * 0.5) * 0.18 * vel;
  }, { wet: 0.15 });
}

/**
 * The surge building: the hum climbing in pitch and going rough, a whine
 * rising over it, cut dead on the blow at `at + dur`.
 */
function surge(b, at, dur, vel = 1) {
  let p = 0, q = 0;
  const lp = new Biquad('lowpass');
  voice(b, at, Math.round(dur * SR), (k, s) => {
    const x = s / dur;
    if (k % 32 === 0) lp.set(400 + 2400 * x * x, 0.9);
    const f = glide(s, 100, 190, dur);
    p += f / SR;
    if (p >= 1) p -= 1;
    q += glide(s, 900, 2600, dur) / SR;
    if (q >= 1) q -= 1;
    return (lp.run(drive(saw(p, f / SR) * (1 + 2 * x), 2.5)) * 0.16 + Math.sin(TAU * q) * 0.02 * x)
      * x * x * vel * stop(s, dur);
  }, { wet: 0.2 });
}

/** The ears ringing after a blow: a faint high tone, beating slowly, swelling in and dying away. */
function ring(b, at, dur, f, vel = 1) {
  let p = 0, q = 0;
  voice(b, at, Math.round(dur * SR), (_k, s) => {
    p += f / SR; q += (f * 1.0016) / SR;
    if (p >= 1) p -= 1;
    if (q >= 1) q -= 1;
    const env = Math.min(1, s / 0.25) * Math.pow(1 - s / dur, 2);
    return (Math.sin(TAU * p) + Math.sin(TAU * q)) * env * 0.01 * vel;
  }, { wet: 0.3 });
}

/** A readout decrypting: tiny dry ticks, never quite even, firmer as it settles. */
function ticks(b, from, to, n, o = {}) {
  const r = rng(o.seed || Math.round(from * 1000) + 701);
  const vel = o.vel == null ? 1 : o.vel;
  for (let i = 0; i < n; i++) {
    const at = from + ((to - from) * (i + r() * 0.6)) / n;
    const nz = noise(Math.floor(r() * 1e6));
    const bp = new Biquad('bandpass').set(1100 + 1300 * r(), 3);
    const pitch = (380 + 260 * r()) / SR;
    const pan = (r() * 2 - 1) * 0.5;
    const v = vel * (0.6 + 0.4 * (i / n));
    let p = 0;
    voice(b, at, Math.round(0.03 * SR), (_k, s) => {
      p += pitch;
      return (bp.run(nz()) * strike(s, 0.9, 0.012) + Math.sin(TAU * p) * strike(s, 0.06, 0.02)) * v;
    }, { pan, wet: 0.08, echo: 0.1 });
  }
}

/** A blip: a soft sine note with its octave, struck — a line landing in place. */
function blip(b, at, midi, vel = 1, pan = 0) {
  const f = hz(midi) / SR;
  let p = 0;
  voice(b, at, Math.round(0.9 * SR), (_k, s) => {
    p += f;
    if (p >= 1) p -= 1;
    const env = s < 0.004 ? s / 0.004 : Math.exp(-(s - 0.004) / 0.16);
    return (Math.sin(TAU * p) + 0.3 * Math.sin(TAU * 2 * p)) * env * 0.06 * vel;
  }, { pan, wet: 0.35, echo: 0.3 });
}

/** Backing out: a deep swell rising and falling away — a boom heard backwards. */
function pull(b, at, dur, vel = 1) {
  let p = 0;
  const nz = noise(Math.round(at * 100) + 801);
  const lp = new Biquad('lowpass');
  voice(b, at, Math.round(dur * SR), (k, s) => {
    const x = s / dur;
    if (k % 32 === 0) lp.set(120 + 700 * Math.sin(Math.PI * x), 0.7);
    p += glide(s, 30, 62, dur * 0.5) / SR;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(x, 0.6)), 2);
    return (drive(Math.sin(TAU * p) * 1.6, 1.8) * 0.45 + lp.run(nz()) * 0.35) * env * vel;
  }, { wet: 0.4 });
}

/**
 * The tube dies: the falling «pew» as the picture collapses to a line and a
 * point, the discharge crackling off the glass, a thump as the beam lets go
 * (`dot` s later) and the phosphor dot ringing faintly as it fades.
 */
function powerOff(b, at, dot, vel = 1) {
  pew(b, at, 0.4, 2400, 55, vel);
  crackle(b, at + 0.03, 0.6, { count: 14, vel: 0.6 * vel, thin: 2.2 });
  impact(b, at + dot, 0.55 * vel);
  ring(b, at + dot, 0.95, 1880, 1.6 * vel);
}

/** Smoke off the hot chassis: a soft hiss swelling and thinning, a crackle now and then. */
function smoke(b, at, dur, vel = 1) {
  breeze(b, at, dur, { vel: 0.3 * vel, from: -0.1, to: 0.1, open: 2600, peak: 0.25 });
  crackle(b, at + 0.2, dur - 0.2, { count: 10, vel: 0.35 * vel, thin: 1.5 });
}

/* ── The score: every sound on the film's clock (IntroTV's AK_T) ─────────── */

const CHORD = {
  Dm: [50, 57, 60, 64, 65],
  Bb: [46, 53, 57, 62, 65],
  F: [53, 57, 60, 64, 67],
  A7: [57, 61, 64, 67],
};

/**
 * `B` the bed (room, hum, snow, the drone and chords inside) — the mix sucks
 * it out before a big blast and muffles it after (the ears closing);
 * `H` the hits — blasts, power, faults; `S` the sounds under the picture;
 * `K` the sparks of the short circuit (their own level: cracks are all peak).
 * Returns the bed's vacuum and muffle moments.
 */
function score(T, B, H, S, K) {
  const [f1, f2, f3] = T.faults;
  const HIT = T.plunge + 0.55;      // through the glass: the bloom at its peak, the corridor at full speed
  const BACK = T.back - 0.35;       // the reel hands the picture back to the tube
  const DOT = 0.36;                 // the collapse reaches the phosphor dot
  // the reel's own staggers (see the timeline in IntroTV)
  const word = (i) => T.b1 + 0.12 + i * 0.085;
  const item = (i) => T.b2 + 0.1 + i * 0.58;

  // ── the room: near silence, a dark air that is always there
  current(B, 0, T.end, 0.1);

  // ── 1 power on: the relay, the degauss thunk, the tube charging, the picture slamming on
  relay(H, T.on - 0.03, 0.8);
  degauss(H, T.on, 0.7);
  charge(S, T.on, 0.33, 1);
  impact(H, T.on + 0.33, 0.5);
  hum(B, T.on, f3 + 0.15 - T.on, curve([
    [T.on, 0], [T.on + 0.25, 1], [T.dolly, 0.75], [T.fill, 1], [HIT, 1], [HIT + 0.01, 0],
    [BACK - 0.05, 0], [BACK, 0.8], [T.back, 0.9], [f1, 1.1], [f2, 1.3], [f3, 1.5], [f3 + 0.05, 0],
  ]), 1);
  snow(B, T.on, T.off + 0.06 - T.on, curve([
    [T.on + 0.25, 0], [T.on + 0.36, 1], [T.logo, 0.45], [T.glitch + 0.2, 0.45], [T.glitch + 0.8, 1.05],
    [HIT, 1.2], [HIT + 0.01, 0],
    [BACK - 0.01, 0], [BACK, 0.45], [f1, 0.5], [f1 + 0.02, 1.1], [f2, 0.7], [f2 + 0.02, 1.4],
    [f2 + 0.4, 0.75], [f3, 0.8], [f3 + 0.02, 1.6], [T.off + 0.05, 1.4], [T.off + 0.06, 0],
  ]), 1);
  knock(S, T.logo, 0.45);

  // ── 2 dolly in: air building, the logo breaking up, the long suck into the glass
  breeze(S, T.dolly, T.fill - T.dolly + 0.3, { vel: 0.45, from: 0, to: 0, open: 900, peak: 0.85 });
  glitch(S, T.glitch, 0.17, 0.7);
  glitch(S, T.glitch + 0.3, 0.3, 1);
  pew(S, T.glitch + 0.36, 0.22, 1300, 140, 0.45);
  implode(H, T.glitch, HIT - T.glitch, 0.95);
  reverse(S, HIT - 0.9, 0.9, 0.45);

  // ── through the glass: the biggest blow of the film, the ears ringing after
  boom(H, HIT, 1.2);
  blast(H, HIT, { size: 1.5, vel: 1.25 });
  breeze(S, T.plunge + 0.15, 1.9, { vel: 0.6, from: 0, to: 0, open: 1300, peak: 0.3 });
  ring(S, HIT + 0.2, 2.6, 3150, 1);

  // ── 3 inside: a dark hall of screens, chords moving under the reel (no beat)
  drone(B, HIT, T.back - HIT, [38, 45, 50], curve([
    [HIT, 0], [HIT + 0.6, 1], [T.exit, 1], [T.exit + 1.2, 0.5], [T.back - 0.3, 0],
  ]), 0.35);
  pad(B, HIT, T.b2 - HIT, CHORD.Dm, { vel: 0.8, cutoff: 900, attack: 1.0, release: 0.6 });
  pad(B, T.b2, T.b3 - T.b2, CHORD.Bb, { vel: 0.8, cutoff: 1000, attack: 0.5, release: 0.6 });
  pad(B, T.b3, T.exit - T.b3, CHORD.F, { vel: 0.95, cutoff: 1500, attack: 0.06, release: 0.9 });
  pad(B, T.exit, T.back - T.exit - 0.4, CHORD.A7, { vel: 0.7, cutoff: 800, attack: 0.4, release: 0.8 });

  // beat 1: the kicker draws in, the words land one by one, the last one rings
  breeze(S, T.b1, 0.9, { vel: 0.2, from: -0.5, to: 0.5, open: 1800 });
  for (let i = 0; i < 6; i++) knock(S, word(i), 0.4 + 0.06 * i, (i - 2.5) * 0.12);
  sonar(S, word(5) + 0.1, 62, 0.75);

  // the camera pushes through the copy: air, a short suck, a deep blow
  breeze(S, T.b2 - 0.35, 0.85, { vel: 0.6, from: 0, to: 0, open: 1200 });
  implode(H, T.b2 - 0.45, 0.45, 0.6);
  blast(H, T.b2, { size: 0.8, vel: 0.55 });

  // beat 2: three lines, a rising note each; the stack decrypts
  [62, 65, 69].forEach((m, i) => {
    knock(S, item(i), 0.55);
    blip(S, item(i) + 0.02, m, 0.8, (i - 1) * 0.3);
    if (i < 2) breeze(S, item(i) + 0.45, 0.45, { vel: 0.15, from: 0, to: 0, open: 1600 });
  });
  ticks(S, T.b2 + 0.3, T.b2 + 1.2, 18, { vel: 0.5 });

  // into the lockup: the title lands like a depth charge
  breeze(S, T.b3 - 0.35, 0.85, { vel: 0.7, from: 0, to: 0, open: 1300 });
  implode(H, T.b3 - 0.9, 0.9, 0.9);
  blast(H, T.b3, { size: 1.2, vel: 0.75 });
  knock(S, T.b3 + 0.55, 0.4);
  ticks(S, T.b3 + 0.7, T.b3 + 1.5, 14, { vel: 0.45 });
  // the logo flares: air drawn in, a high ping
  reverse(S, T.b3 + 0.7, 0.5, 0.5);
  sonar(S, T.b3 + 1.2, 74, 0.7);

  // ── 4 pull out: the world inside falls away backwards, the picture snaps back on the tube
  pull(H, T.exit - 0.05, 1.9, 0.5);
  breeze(S, T.exit, 1.8, { vel: 0.5, from: 0, to: 0, open: 1000, peak: 0.25 });
  knock(S, BACK, 0.55);

  // ── 5 short circuit: crackle gathering, then three faults — each shakes the
  // camera, and each is a blast and a real spark, dry: nothing muffles them.
  // The sparks fly where the film throws its embers: the control panel
  // (right) and the top of the corpus (centre).
  const PANEL = 0.45, TOP = -0.05;
  const BANG = 0.02;   // the crack first, the pressure a beat behind — and the limiter leaves the crack alone
  crackle(K, T.back, f1 - T.back, { count: 8, vel: 0.35, thin: 0.6, pan: PANEL, spread: 0.3 });
  blast(H, f1 + BANG, { size: 0.6, vel: 0.55 });
  pop(H, f1 + BANG, 0.4);
  spark(K, f1, { vel: 0.8, pan: PANEL, count: 14 });
  arc(K, f1 + 0.03, 5, { vel: 0.7, pan: 0.15 });

  blast(H, f2 + BANG, { size: 0.85, vel: 0.75 });
  pop(H, f2 + BANG, 0.5);
  spark(K, f2, { vel: 0.9, pan: PANEL, count: 10 });
  spark(K, f2 + 0.012, { vel: 0.85, pan: TOP, count: 18, seed: 3 });
  arc(K, f2 + 0.03, 6, { vel: 0.8, pan: -0.3 });
  arc(K, f2 + 0.04, 6, { vel: 0.6, pan: 0.35, seed: 9 });
  slip(S, f2, 0.28, 0.8);
  smoke(S, f2 + 0.1, T.end - f2 - 0.1, 0.8);

  surge(H, f2 + 0.12, f3 - f2 - 0.12, 0.9);
  blast(H, f3 + BANG, { size: 1.3, vel: 1.05 });
  pop(H, f3 + BANG, 0.65);
  spark(K, f3, { vel: 1.1, pan: PANEL, count: 16, embers: 1.2 });
  spark(K, f3 + 0.01, { vel: 1, pan: TOP, count: 28, embers: 1.4, seed: 5 });
  arc(K, f3 + 0.03, 3, { vel: 1 });

  powerOff(H, T.off, DOT, 0.9);
  boom(H, T.off + DOT, 0.5);

  return {
    // the faults are left out of both: the short circuit plays dry
    vacuum: [[HIT, HIT + collapseAt(1.5)], [T.b3, T.b3 + collapseAt(1.2)]],
    // [at, low (Hz), hold (s), back over (s)]
    muffle: [
      [HIT, 200, 0.25, 2.6],
      [T.b2, 420, 0.05, 1.0],
      [T.b3, 260, 0.1, 1.6],
    ],
  };
}

/* ── The mix ─────────────────────────────────────────────────────────────── */

/** The levels: the blows land around −1 dBFS, the quiet stays quiet. */
const MIX = { bed: 1, hits: 1.1, sfx: 1.7, sparks: 1.6, echo: 0.4, hall: 1.3, drive: 1.5 };

/**
 * The bed gasps around a big blast: sucked down to a third over the 0.3 s
 * before it, to a tenth on it, held till the first aftershock, back over 0.7 s.
 */
function vacuumAt(list, s) {
  let g = 1;
  for (const [a, b] of list) {
    if (s < a - 0.3 || s > b + 0.7) continue;
    const v = s < a ? 1 - 0.65 * Math.pow((s - a + 0.3) / 0.3, 2)
      : s < a + 0.03 ? 0.35 - 0.25 * ((s - a) / 0.03)
        : s < b ? 0.1
          : 0.1 + 0.9 * Math.pow((s - b) / 0.7, 1.5);
    g = Math.min(g, v);
  }
  return g;
}

/** The ears closing over the bed: two low-passes whose cutoff falls on a blast and clears slowly. */
function muffle(t, list) {
  const open = 20000;
  const cutoff = (s) => {
    let f = open;
    for (const [at, low, hold, back] of list) {
      if (s < at) continue;
      const x = s < at + 0.02 ? open * Math.pow(low / open, (s - at) / 0.02)
        : s < at + 0.02 + hold ? low
          : low * Math.pow(open / low, Math.min(1, (s - at - 0.02 - hold) / back));
      f = Math.min(f, x);
    }
    return f;
  };
  for (const ch of [t.L, t.R]) {
    const a = new Biquad('lowpass'), b = new Biquad('lowpass');
    for (let i = 0; i < ch.length; i++) {
      if (i % 32 === 0) { const f = cutoff(i / SR); a.set(f, 0.75); b.set(f, 0.75); }
      ch[i] = b.run(a.run(ch[i]));
    }
  }
}

/** An echo bouncing left and right, each repeat darker: the corridor answering. */
function delay(send, out, time, level) {
  const d = Math.round(time * SR);
  const n = send.L.length;
  const bl = new Float32Array(n), br = new Float32Array(n);
  const tone = new Biquad('lowpass').set(3200, 0.7);
  for (let i = 0; i < n; i++) {
    const yl = i >= d ? bl[i - d] : 0;
    const yr = i >= d ? br[i - d] : 0;
    bl[i] = (send.L[i] + send.R[i]) * 0.5 + tone.run(yr) * 0.38;
    br[i] = yl;
    out.L[i] += (yl * 0.85 + yr * 0.15) * level;
    out.R[i] += (yr * 0.85 + yl * 0.15) * level;
  }
}

/** A hall: Freeverb's eight damped combs and four all-passes a side; `tone` low-passes what comes back. */
function reverb(send, out, level, shape = {}) {
  const k = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const passes = [556, 441, 341, 225];
  const fb = (shape.room == null ? 0.86 : shape.room) * 0.28 + 0.7;
  const damp = shape.damp == null ? 0.32 : shape.damp;
  const pre = Math.round(0.018 * SR);
  for (const [ch, spread] of [['L', 0], ['R', 23]]) {
    const input = send[ch], dst = out[ch];
    const tone = shape.tone ? new Biquad('lowpass').set(shape.tone, 0.7) : null;
    const cs = combs.map((c) => ({ buf: new Float32Array(Math.round((c + spread) * k)), i: 0, store: 0 }));
    const as = passes.map((a) => ({ buf: new Float32Array(Math.round((a + spread) * k)), i: 0 }));
    for (let i = 0; i < input.length; i++) {
      const x = (i >= pre ? (send.L[i - pre] + send.R[i - pre]) * 0.3 + input[i - pre] * 0.4 : 0) * 0.015;
      let y = 0;
      for (const c of cs) {
        const o = c.buf[c.i];
        c.store = o * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * fb;
        if (++c.i >= c.buf.length) c.i = 0;
        y += o;
      }
      for (const a of as) {
        const o = a.buf[a.i];
        a.buf[a.i] = y + o * 0.5;
        if (++a.i >= a.buf.length) a.i = 0;
        y = o - y;
      }
      dst[i] += (tone ? tone.run(y) : y) * level;
    }
  }
}

/** Nothing under 30 Hz: no speaker plays it, and it eats the headroom. */
function rumble(t) {
  for (const ch of [t.L, t.R]) {
    const hp = new Biquad('highpass').set(30, 0.7);
    for (let i = 0; i < ch.length; i++) ch[i] = hp.run(ch[i]);
  }
}

/** A gentle bus compressor with a soft knee: the parts sit together. */
function glue(t, thr, ratio) {
  const knee = 8;
  const att = Math.exp(-1 / (0.012 * SR)), rel = Math.exp(-1 / (0.22 * SR));
  let env = 0;
  for (let i = 0; i < t.L.length; i++) {
    const x = Math.max(Math.abs(t.L[i]), Math.abs(t.R[i]));
    env = x > env ? att * env + (1 - att) * x : rel * env + (1 - rel) * x;
    const over = 20 * Math.log10(env + 1e-9) - thr;
    let cut = 0;
    if (over > knee / 2) cut = over * (1 - 1 / ratio);
    else if (over > -knee / 2) cut = ((over + knee / 2) ** 2 / (2 * knee)) * (1 - 1 / ratio);
    const g = Math.pow(10, -cut / 20);
    t.L[i] *= g; t.R[i] *= g;
  }
}

/** A look-ahead peak limiter: driven by `drive`, never above `ceiling`. */
function limit(t, drv, ceiling) {
  const n = t.L.length;
  const look = Math.round(0.003 * SR);
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = Math.max(Math.abs(t.L[i]), Math.abs(t.R[i])) * drv;
    need[i] = x > ceiling ? ceiling / x : 1;
  }
  // the smallest gain needed over the next few milliseconds (a monotonic queue)
  const q = new Int32Array(n);
  let head = 0, tail = 0, g = 1;
  const rel = Math.exp(-1 / (0.08 * SR));
  const L = new Float32Array(t.L), R = new Float32Array(t.R);
  for (let i = 0; i < n + look; i++) {
    if (i < n) {
      while (tail > head && need[q[tail - 1]] >= need[i]) tail--;
      q[tail++] = i;
    }
    const j = i - look;
    if (j < 0) continue;
    while (q[head] < j) head++;
    const want = need[q[head]];
    g = want < g ? want : rel * g + (1 - rel) * want;
    t.L[j] = L[j] * drv * g;
    t.R[j] = R[j] * drv * g;
  }
}

/** The last stretch fades with the picture (the overlay's own fade-out). */
function fade(t, from, to) {
  const f0 = Math.round(from * SR), f1 = Math.round(to * SR);
  for (let i = f0; i < t.L.length; i++) {
    const g = i >= f1 ? 0 : Math.pow(1 - (i - f0) / (f1 - f0), 1.5);
    t.L[i] *= g; t.R[i] *= g;
  }
}

/** The whole track for a film clock `T` (IntroTV's AK_T): { L, R } at SR. */
function render(T) {
  const n = Math.ceil(T.end * SR);
  const bed = new Track(n), hits = new Track(n), sfx = new Track(n), sparks = new Track(n);
  const bedSend = { rev: new Track(n), del: new Track(n) };
  const fxSend = { rev: new Track(n), del: new Track(n) };
  const bus = (out, send) => ({ out, reverb: send.rev, delay: send.del });
  const { vacuum, muffle: closes } = score(T, bus(bed, bedSend), bus(hits, fxSend), bus(sfx, fxSend), bus(sparks, fxSend));

  // the bed: sucked out around the big blasts, its sends with it, then the ears closing over it
  for (let i = 0; i < n; i++) {
    const g = vacuumAt(vacuum, i / SR) * MIX.bed;
    bed.L[i] *= g; bed.R[i] *= g;
    bedSend.rev.L[i] *= g; bedSend.rev.R[i] *= g;
    bedSend.del.L[i] *= g; bedSend.del.R[i] *= g;
  }
  muffle(bed, closes);
  muffle(bedSend.rev, closes);

  const out = bed;
  for (let i = 0; i < n; i++) {
    out.L[i] += hits.L[i] * MIX.hits + sfx.L[i] * MIX.sfx + sparks.L[i] * MIX.sparks;
    out.R[i] += hits.R[i] * MIX.hits + sfx.R[i] * MIX.sfx + sparks.R[i] * MIX.sparks;
    fxSend.rev.L[i] += bedSend.rev.L[i]; fxSend.rev.R[i] += bedSend.rev.R[i];
    fxSend.del.L[i] += bedSend.del.L[i]; fxSend.del.R[i] += bedSend.del.R[i];
  }
  delay(fxSend.del, out, 0.33, MIX.echo);
  // one hall for all of it: long and dark
  reverb(fxSend.rev, out, MIX.hall, { room: 0.88, damp: 0.5, tone: 3400 });
  rumble(out);
  glue(out, -20, 2.5);
  limit(out, MIX.drive, Math.pow(10, -1.6 / 20));
  fade(out, T.end - 0.6, T.end);
  return { L: out.L, R: out.R };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { render, SR };
} else if (typeof importScripts === 'function') {
  self.onmessage = (e) => {
    const { L, R } = render(e.data.T);
    self.postMessage({ L, R, sr: SR }, [L.buffer, R.buffer]);
  };
}
})();
