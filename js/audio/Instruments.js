/**
 * Instruments — synthesised Indian instruments the player can play by tapping a speaker.
 *
 *   rhythm   dhol · tabla · ghungroo · dholak
 *   melody   sitar · bansuri · shehnai · harmonium
 *
 * The player picks each speaker's instrument (InstrumentPicker); the choice is saved in Settings.
 * Melody notes walk up and down Raag Bhupali (Sa Re Ga Pa Dha, a five-note scale), so any
 * sequence of taps sounds like music rather than noise. Everything plays on the effects bus,
 * so the Sounds switch and volume apply.
 */
class Instruments {
  static ctx() {
    if (!AudioHub.shared.sfxOn) return null;
    return AudioHub.shared.ensure();
  }

  /** Frequency of scale degree n (0 = Sa) in Bhupali, rooted on D. */
  static note(n) {
    const steps = [0, 2, 4, 7, 9];
    const oct = Math.floor(n / steps.length);
    const semi = steps[((n % steps.length) + steps.length) % steps.length] + 12 * oct;
    return 293.66 * Math.pow(2, semi / 12);
  }

  /** Bounce up and down the scale: 0 1 2 3 4 5 6 7 6 5 4 3 2 1 0 … */
  static walk(i) {
    const span = 7;
    const k = i % (span * 2);
    return k <= span ? k : span * 2 - k;
  }

  static play(kind, i = 0) {
    const ctx = Instruments.ctx();
    if (!ctx) return;
    const fn = Instruments[kind];
    if (fn) fn.call(Instruments, ctx, ctx.currentTime + 0.005, i);
  }

  /* ---------------- Rhythm ---------------- */

  static dhol(ctx, t) {
    const hub = AudioHub.shared;
    Percussion.dha(hub, hub.sfxBus, t, 1);
    Percussion.ka(hub, hub.sfxBus, t + 0.16, 0.7);
    Percussion.dha(hub, hub.sfxBus, t + 0.24, 0.8);
  }

  static tabla(ctx, t, i) {
    const hub = AudioHub.shared;
    // Two quick bols: na-tin, then a dha to land on.
    Percussion.na(hub, hub.sfxBus, t, 0.9);
    Percussion.tin(hub, hub.sfxBus, t + 0.09, 0.8);
    Percussion.na(hub, hub.sfxBus, t + 0.18, 0.8);
    Percussion.osc(hub, hub.sfxBus, t + 0.27, { from: 120 + (i % 3) * 14, to: 70, peak: 0.6, decay: 0.32 });
  }

  static ghungroo(ctx, t) {
    const hub = AudioHub.shared;
    // A shake of ankle bells: many tiny high jingles.
    for (let k = 0; k < 14; k++) {
      const at = t + Math.random() * 0.22;
      Percussion.osc(hub, hub.sfxBus, at, { type: 'triangle', from: 5200 + Math.random() * 2200, peak: 0.02 + Math.random() * 0.02, decay: 0.09 });
    }
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 8000, q: 0.6, peak: 0.08, decay: 0.25, type: 'highpass' });
  }

  static dholak(ctx, t) {
    const hub = AudioHub.shared;
    Percussion.osc(hub, hub.sfxBus, t, { from: 220, to: 150, peak: 0.45, decay: 0.16 });
    Percussion.ka(hub, hub.sfxBus, t + 0.12, 0.5);
    Percussion.osc(hub, hub.sfxBus, t + 0.18, { from: 230, to: 160, peak: 0.4, decay: 0.14 });
    Percussion.dha(hub, hub.sfxBus, t + 0.3, 0.7);
  }

  /* ---------------- Melody ---------------- */

  /** Plucked string with a quick upward bend (meend) and the sitar's buzzy brightness. */
  static sitar(ctx, t, i) {
    const hub = AudioHub.shared;
    const f = Instruments.note(Instruments.walk(i) + 3);
    const o = ctx.createOscillator();
    const bp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 0.97, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(f * 4, t);
    bp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.8);
    bp.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(bp);
    bp.connect(g);
    g.connect(hub.sfxBus);
    o.start(t);
    o.stop(t + 1.15);
    // Sympathetic string shimmer
    Percussion.osc(hub, hub.sfxBus, t + 0.02, { type: 'triangle', from: f * 2, peak: 0.025, decay: 0.9 });
  }

  /** Breathy bamboo flute with a little vibrato. */
  static bansuri(ctx, t, i) {
    const hub = AudioHub.shared;
    const f = Instruments.note(Instruments.walk(i) + 5);
    const o = ctx.createOscillator();
    const vib = ctx.createOscillator();
    const vg = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    vib.frequency.value = 5.2;
    vg.gain.setValueAtTime(0, t);
    vg.gain.linearRampToValueAtTime(f * 0.012, t + 0.25);
    vib.connect(vg);
    vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.13, t + 0.07);
    g.gain.setValueAtTime(0.13, t + 0.42);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g);
    g.connect(hub.sfxBus);
    o.start(t);
    vib.start(t);
    o.stop(t + 0.75);
    vib.stop(t + 0.75);
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: f * 2, q: 2, peak: 0.04, decay: 0.3 });
  }

  static shehnai(ctx, t, i) {
    const n = Instruments.walk(i) + 2;
    Sfx.shared.reed(t, [[Instruments.note(n), 0.14], [Instruments.note(n + 1), 0.4]], { gain: 0.09 });
  }

  /** Harmonium: a reedy chord on the note, Sa–Ga–Pa shape. */
  static harmonium(ctx, t, i) {
    const hub = AudioHub.shared;
    const base = Instruments.walk(i);
    [0, 2, 3].forEach((d) => {
      const f = Instruments.note(base + d);
      [-5, 5].forEach((cents) => {
        const o = ctx.createOscillator();
        const lp = ctx.createBiquadFilter();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = f;
        o.detune.value = cents;
        lp.type = 'lowpass';
        lp.frequency.value = 1800;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.022, t + 0.05);
        g.gain.setValueAtTime(0.022, t + 0.45);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        o.connect(lp);
        lp.connect(g);
        g.connect(hub.sfxBus);
        o.start(t);
        o.stop(t + 0.75);
      });
    });
  }
}

/** Every playable instrument, in the order the picker shows them. */
Instruments.ALL = [
  { kind: 'dhol', emoji: '🥁', name: 'Dhol' },
  { kind: 'tabla', emoji: '🪘', name: 'Tabla' },
  { kind: 'dholak', emoji: '🥁', name: 'Dholak' },
  { kind: 'ghungroo', emoji: '🔔', name: 'Ghungroo' },
  { kind: 'sitar', emoji: '🪕', name: 'Sitar' },
  { kind: 'bansuri', emoji: '🪈', name: 'Bansuri' },
  { kind: 'shehnai', emoji: '🎺', name: 'Shehnai' },
  { kind: 'harmonium', emoji: '🪗', name: 'Harmonium' }
];

Instruments.find = (kind) => Instruments.ALL.find((i) => i.kind === kind) || Instruments.ALL[0];

/** What the left and right speakers start with, before the player picks. */
Instruments.DEFAULTS = ['dhol', 'sitar'];
