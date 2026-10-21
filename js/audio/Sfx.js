/**
 * Sfx — short sound effects and filmi stings, all synthesised. Every interaction sounds like
 * something on a film set: lights, camera, action.
 *
 *   ui         camera shutter tick — any button tap
 *   clapper    mini clapperboard snap — big "go" buttons (Daily, Endless, Resume, Next)
 *   lightSwitch(on) stage-light switch: a heavy clunk and the lamp humming up (or dying)
 *   key        typewriter key, like a script being typed — on-screen and real keyboard
 *   cut        the director's "Cut!" buzzer — a wrong letter
 *   reel       film-reel rattle through the gate — the film-name hint
 *   spotlight  lamp striking on with a shimmer — the letter hint
 *   applause   an audience clapping — a cracked song (more people for a better solve)
 *   drape(open) velvet curtain swish — popups opening and closing
 *   projector(up) projector motor spinning up (resume) or winding down (pause)
 *   tick       tiny UI tick
 *   clack      wooden peg snapping past the wheel's flapper (harder as the wheel slows)
 *   drumroll   tabla roll that speeds up and lands on a dhol hit
 *   hit / miss correct letter (spotlight ping) / wrong letter ("Cut!" buzzer)
 *   beep       last ten seconds: a 1 kHz film-leader countdown blip
 *   shehnai    reedy flourish for a cracked song
 *   dramatic   "dhan dhan dhaaan" stabs when the reel runs out
 *   curtain    end-of-show fanfare
 *   clap       clapperboard snap on "Action!"
 *   shutter    press-camera click for paparazzi flashes
 *   whoosh     something flying in
 */
class Sfx {
  constructor(hub) {
    this.hub = hub;
  }

  ctx() {
    if (!this.hub.sfxOn) return null;
    return this.hub.ensure();
  }

  tone(freq, dur, { type = 'sine', gain = 0.15, slideTo = 0, delay = 0 } = {}) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.hub.sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  tick() {
    this.tone(2100, 0.03, { type: 'square', gain: 0.035 });
  }

  /**
   * A wooden peg snapping past the flapper. v (0..1) is how hard: fast pegs are bright and
   * light, the last slow ones are fuller and louder, like a real prize wheel.
   */
  clack(v = 0.5) {
    const ctx = this.ctx();
    if (!ctx) return;
    const hub = this.hub;
    const t = ctx.currentTime + 0.002;
    const slow = 1 - Phaser.Math.Clamp(v, 0, 1);
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 1700 + 1200 * (1 - slow), q: 2.2, peak: 0.16 + 0.22 * slow, decay: 0.035 });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'triangle', from: 1100 - 300 * slow, to: 520, peak: 0.08 + 0.14 * slow, decay: 0.05 });
  }

  /** A correct letter: the spotlight finds it — bright bell ping over a soft shutter. */
  hit() {
    this.tone(1318.5, 0.22, { type: 'sine', gain: 0.12 });
    this.tone(1975.5, 0.26, { type: 'triangle', gain: 0.06, delay: 0.045 });
    const ctx = this.ctx();
    if (ctx) Percussion.noiseHit(this.hub, this.hub.sfxBus, ctx.currentTime + 0.002, { freq: 4800, q: 1, peak: 0.06, decay: 0.016, type: 'highpass' });
  }

  /** A wrong letter: "Cut!" */
  miss() {
    this.cut();
  }

  beep() {
    // The classic "3, 2, 1" film-leader blip.
    this.tone(1000, 0.09, { type: 'sine', gain: 0.16 });
  }

  /* ---------------- Film-set interaction sounds ---------------- */

  /** Camera shutter tick: the tap sound for every button. */
  ui() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.002;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 4200, q: 1.2, peak: 0.13, decay: 0.018, type: 'highpass' });
    Percussion.noiseHit(hub, hub.sfxBus, t + 0.038, { freq: 2800, q: 1.4, peak: 0.08, decay: 0.022 });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'triangle', from: 1800, to: 900, peak: 0.04, decay: 0.03 });
  }

  /** A small clapperboard snap: wood on wood with a body thump. */
  clapper() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.004;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 1900, q: 1.1, peak: 0.42, decay: 0.045 });
    Percussion.noiseHit(hub, hub.sfxBus, t + 0.004, { freq: 5200, q: 0.8, peak: 0.16, decay: 0.03, type: 'highpass' });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'triangle', from: 420, to: 160, peak: 0.28, decay: 0.08 });
  }

  /** Stage-light switch: a heavy clunk, then the lamp humming up (or dying away). */
  lightSwitch(on = true) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.003;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 900, q: 1.6, peak: 0.3, decay: 0.05 });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'square', from: 140, to: 70, peak: 0.08, decay: 0.06 });
    const o = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(on ? 60 : 120, t + 0.04);
    o.frequency.exponentialRampToValueAtTime(on ? 120 : 50, t + 0.4);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(on ? 300 : 1400, t + 0.04);
    f.frequency.exponentialRampToValueAtTime(on ? 1400 : 200, t + 0.4);
    g.gain.setValueAtTime(0.0001, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(f);
    f.connect(g);
    g.connect(hub.sfxBus);
    o.start(t + 0.04);
    o.stop(t + 0.5);
  }

  /** Typewriter key, like a script being typed. */
  key() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.002;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 3200 + Math.random() * 600, q: 2.5, peak: 0.2, decay: 0.022 });
    Percussion.osc(hub, hub.sfxBus, t + 0.006, { type: 'triangle', from: 260, to: 120, peak: 0.12, decay: 0.04 });
  }

  /** The director's "Cut!" buzzer. */
  cut() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'square';
    o2.type = 'sawtooth';
    o.frequency.value = 112;
    o2.frequency.value = 117;
    f.type = 'lowpass';
    f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.012);
    g.gain.setValueAtTime(0.09, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    o.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(this.hub.sfxBus);
    o.start(t);
    o2.start(t);
    o.stop(t + 0.3);
    o2.stop(t + 0.3);
  }

  /** A strip of film rattling through the projector gate. */
  reel(seconds = 0.5) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.005;
    const hub = this.hub;
    const n = Math.round(seconds * 42);
    for (let i = 0; i < n; i++) {
      const t = t0 + i / 42;
      const v = 1 - i / n;
      Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 2400, q: 1.8, peak: 0.08 + 0.07 * v, decay: 0.012 });
    }
    Percussion.osc(hub, hub.sfxBus, t0, { type: 'triangle', from: 90, to: 60, peak: 0.1, decay: seconds });
  }

  /** A follow-spot striking on: arc crackle, rising hum and a bright shimmer. */
  spotlight() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.003;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 6000, q: 0.7, peak: 0.12, decay: 0.08, type: 'highpass' });
    this.lightSwitch(true);
    [1568, 2093, 2637].forEach((f, i) => this.tone(f, 0.5, { type: 'sine', gain: 0.05, delay: 0.08 + i * 0.05 }));
  }

  /** An audience clapping. crowd ~ 6 (polite) … 30 (standing ovation). */
  applause(crowd = 14, seconds = 1.6) {
    const ctx = this.ctx();
    if (!ctx) return;
    const hub = this.hub;
    const t0 = ctx.currentTime + 0.02;
    const claps = Math.round(crowd * seconds * 4);
    for (let i = 0; i < claps; i++) {
      const at = t0 + Math.random() * seconds;
      const fade = 1 - (at - t0) / (seconds * 1.15);
      Percussion.noiseHit(hub, hub.sfxBus, at, {
        freq: 1100 + Math.random() * 1600,
        q: 1.1,
        peak: (0.05 + Math.random() * 0.06) * Math.max(0.15, fade),
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }

  /** Velvet curtain swish: open (rising) or closed (falling). */
  drape(open = true) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const src = this.hub.noiseSource();
    const bp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    bp.type = 'bandpass';
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(open ? 500 : 1600, t);
    bp.frequency.exponentialRampToValueAtTime(open ? 1600 : 420, t + 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.14, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.hub.sfxBus);
    src.start(t, Math.random() * 0.5, 0.38);
  }

  /** Projector motor spinning up (resume) or winding down (pause), with its shutter flutter. */
  projector(up = true) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const d = 0.55;
    const src = this.hub.noiseSource();
    const bp = ctx.createBiquadFilter();
    const chop = ctx.createGain();
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    const g = ctx.createGain();
    bp.type = 'bandpass';
    bp.Q.value = 1.3;
    bp.frequency.setValueAtTime(up ? 400 : 1500, t);
    bp.frequency.exponentialRampToValueAtTime(up ? 1500 : 300, t + d);
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(up ? 6 : 24, t);
    lfo.frequency.exponentialRampToValueAtTime(up ? 24 : 4, t + d);
    depth.gain.value = 0.5;
    chop.gain.value = 0.5;
    lfo.connect(depth);
    depth.connect(chop.gain);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.08);
    g.gain.setValueAtTime(0.16, t + d - 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(bp);
    bp.connect(chop);
    chop.connect(g);
    g.connect(this.hub.sfxBus);
    src.start(t, Math.random() * 0.3, d + 0.05);
    lfo.start(t);
    lfo.stop(t + d + 0.05);
  }

  drumroll(seconds) {
    const ctx = this.ctx();
    if (!ctx) return;
    const hub = this.hub;
    const bus = hub.sfxBus;
    hub.duck(seconds, 0.25);
    let t = ctx.currentTime + 0.02;
    const end = t + seconds;
    let gap = 0.14;
    let v = 0.25;
    while (t < end - 0.04) {
      Percussion.na(hub, bus, t, v);
      t += gap;
      gap = Math.max(0.034, gap * 0.94);
      v = Math.min(0.9, v + 0.025);
    }
    Percussion.dha(hub, bus, end, 1);
    Percussion.ting(hub, bus, end, 1.4);
    Percussion.dha(hub, bus, end + 0.16, 0.7);
  }

  land() {
    const ctx = this.ctx();
    if (!ctx) return;
    Percussion.dha(this.hub, this.hub.sfxBus, ctx.currentTime + 0.01, 1);
    Percussion.ting(this.hub, this.hub.sfxBus, ctx.currentTime + 0.01, 1.4);
  }

  /** Reed voice with vibrato, played through a list of [frequency, seconds] notes. */
  reed(t, notes, { gain = 0.11, glideLast = 0 } = {}) {
    const ctx = this.hub.ctx;
    const o = ctx.createOscillator();
    const bp = ctx.createBiquadFilter();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    o.type = 'sawtooth';
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 1.6;
    lp.type = 'lowpass';
    lp.frequency.value = 3600;
    vib.frequency.value = 5.8;
    vibGain.gain.value = 0;
    vib.connect(vibGain);
    vibGain.connect(o.frequency);
    o.connect(bp);
    bp.connect(lp);
    lp.connect(g);
    g.connect(this.hub.sfxBus);

    let at = t;
    g.gain.setValueAtTime(0.0001, at);
    notes.forEach(([f, d], k) => {
      o.frequency.setValueAtTime(f, at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(gain, at + 0.025);
      if (k === notes.length - 1) {
        vibGain.gain.setValueAtTime(0, at);
        vibGain.gain.linearRampToValueAtTime(f * 0.012, at + 0.15);
        if (glideLast) o.frequency.exponentialRampToValueAtTime(glideLast, at + d * 0.5);
        g.gain.setValueAtTime(gain, at + d * 0.75);
        g.gain.exponentialRampToValueAtTime(0.0001, at + d);
      } else {
        g.gain.setValueAtTime(gain, at + d * 0.85);
        g.gain.linearRampToValueAtTime(gain * 0.4, at + d);
      }
      at += d;
    });
    o.start(t);
    vib.start(t);
    o.stop(at + 0.05);
    vib.stop(at + 0.05);
    return at;
  }

  shehnai() {
    const ctx = this.ctx();
    if (!ctx) return;
    this.hub.duck(1.6, 0.15);
    const t = ctx.currentTime + 0.02;
    const SA = 587.33;
    const r = (semi) => SA * Math.pow(2, semi / 12);
    this.reed(t, [[r(0), 0.08], [r(2), 0.08], [r(4), 0.08], [r(5), 0.08], [r(7), 0.1], [r(9), 0.1], [r(11), 0.62]], { glideLast: r(12) });
    Percussion.dha(this.hub, this.hub.sfxBus, t, 0.8);
    Percussion.ting(this.hub, this.hub.sfxBus, t + 0.62, 1.2);
    Percussion.dha(this.hub, this.hub.sfxBus, t + 0.62, 0.9);
  }

  /** Three heavy stabs: dhan … dhan … dhaaan. */
  dramatic() {
    const ctx = this.ctx();
    if (!ctx) return;
    this.hub.duck(2.6, 0.05);
    const t0 = ctx.currentTime + 0.02;
    const chords = [
      [196.0, 233.08, 293.66],
      [185.0, 220.0, 277.18],
      [146.83, 174.61, 220.0]
    ];
    const times = [0, 0.36, 0.78];
    chords.forEach((freqs, k) => {
      const t = t0 + times[k];
      const long = k === chords.length - 1;
      const dur = long ? 1.7 : 0.26;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2200, t);
      lp.frequency.exponentialRampToValueAtTime(500, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      lp.connect(g);
      g.connect(this.hub.sfxBus);
      if (long) {
        const trem = ctx.createOscillator();
        const tremGain = ctx.createGain();
        trem.frequency.value = 9;
        tremGain.gain.value = 0.05;
        trem.connect(tremGain);
        tremGain.connect(g.gain);
        trem.start(t + 0.2);
        trem.stop(t + dur);
      }
      freqs.forEach((f) => {
        [-6, 6].forEach((cents) => {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = f;
          o.detune.value = cents;
          o.connect(lp);
          o.start(t);
          o.stop(t + dur + 0.05);
        });
      });
      // Timpani under each stab
      Percussion.osc(this.hub, this.hub.sfxBus, t, { from: long ? 82 : 98, to: long ? 55 : 70, peak: 0.7, decay: long ? 1.1 : 0.4 });
      if (long) Percussion.noiseHit(this.hub, this.hub.sfxBus, t, { freq: 300, q: 0.5, peak: 0.12, decay: 1.2, type: 'lowpass' });
    });
  }

  clap() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 2200, q: 0.7, peak: 0.7, decay: 0.05, type: 'highpass' });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'triangle', from: 1100, to: 320, peak: 0.25, decay: 0.07 });
    Percussion.dha(hub, hub.sfxBus, t + 0.01, 1);
    Percussion.ting(hub, hub.sfxBus, t + 0.01, 1.2);
  }

  shutter() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 3800, q: 0.8, peak: 0.16, decay: 0.022, type: 'highpass' });
    Percussion.noiseHit(hub, hub.sfxBus, t + 0.055, { freq: 2600, q: 0.8, peak: 0.1, decay: 0.03, type: 'highpass' });
  }

  whoosh() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const src = this.hub.noiseSource();
    const bp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(350, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + 0.32);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.hub.sfxBus);
    src.start(t, Math.random() * 0.5, 0.42);
  }

  curtain() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;
    const hub = this.hub;
    [0, 0.18, 0.36, 0.5, 0.64].forEach((d, k) => Percussion.dha(hub, hub.sfxBus, t + d, k === 4 ? 1 : 0.7));
    const SA = 587.33;
    const r = (semi) => SA * Math.pow(2, semi / 12);
    this.reed(t + 0.7, [[r(7), 0.14], [r(9), 0.14], [r(7), 0.14], [r(5), 0.14], [r(4), 0.14], [r(2), 0.14], [r(0), 0.9]], { gain: 0.1 });
    Percussion.ting(hub, hub.sfxBus, t + 1.54, 1.4);
  }
}

Sfx.shared = new Sfx(AudioHub.shared);
