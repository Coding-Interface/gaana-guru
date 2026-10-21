/**
 * Percussion — synthesised dhol, tabla and manjira strokes, shared by the music and the effects.
 * Every stroke takes the hub, an output bus, a start time and a velocity (0–1).
 *
 *   dha — dhol bass with a skin slap
 *   na  — ringing tabla stroke
 *   tin — higher, lighter tabla stroke
 *   ka  — dry slap
 *   ting — small manjira cymbal
 */
class Percussion {
  static env(ctx, g, t, peak, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }

  static osc(hub, bus, t, { type = 'sine', from, to = 0, peak, decay }) {
    const ctx = hub.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + decay * 0.7);
    Percussion.env(ctx, g, t, peak, decay);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + decay + 0.03);
  }

  static noiseHit(hub, bus, t, { freq, q = 1, peak, decay, type = 'bandpass' }) {
    const ctx = hub.ctx;
    const src = hub.noiseSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    Percussion.env(ctx, g, t, peak, decay);
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    src.start(t, Math.random() * 0.8, decay + 0.05);
  }

  static dha(hub, bus, t, v = 1) {
    Percussion.osc(hub, bus, t, { from: 96, to: 46, peak: 0.85 * v, decay: 0.42 });
    Percussion.noiseHit(hub, bus, t, { freq: 850, q: 0.9, peak: 0.16 * v, decay: 0.05 });
  }

  static na(hub, bus, t, v = 1) {
    Percussion.osc(hub, bus, t, { from: 560, to: 530, peak: 0.3 * v, decay: 0.3 });
    Percussion.osc(hub, bus, t, { from: 1660, peak: 0.07 * v, decay: 0.12 });
    Percussion.noiseHit(hub, bus, t, { freq: 3200, q: 2, peak: 0.08 * v, decay: 0.02 });
  }

  static tin(hub, bus, t, v = 1) {
    Percussion.osc(hub, bus, t, { from: 780, to: 750, peak: 0.22 * v, decay: 0.2 });
    Percussion.noiseHit(hub, bus, t, { freq: 4200, q: 2, peak: 0.06 * v, decay: 0.015 });
  }

  static ka(hub, bus, t, v = 1) {
    Percussion.noiseHit(hub, bus, t, { freq: 1900, q: 1.3, peak: 0.32 * v, decay: 0.06 });
  }

  static ting(hub, bus, t, v = 1) {
    Percussion.osc(hub, bus, t, { type: 'triangle', from: 2480, peak: 0.05 * v, decay: 0.34 });
    Percussion.osc(hub, bus, t, { from: 3720, peak: 0.03 * v, decay: 0.28 });
  }
}
