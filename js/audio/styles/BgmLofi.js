/**
 * BgmLofi — slow and soft: dusty kick and rim, swung hats, warm electric-piano chords
 * (Dm9 – G13) and a little vinyl crackle.
 */
class BgmLofi {
  constructor(score) {
    this.score = score;
    this.crackle = null;
  }

  get bpm() {
    return 78;
  }

  startBed() {
    const ctx = this.score.hub.ctx;
    const src = this.score.hub.noiseSource();
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2400;
    const g = ctx.createGain();
    g.gain.value = 0.012;
    src.connect(hp);
    hp.connect(g);
    g.connect(this.score.bus);
    src.start();
    this.crackle = { src, g };
  }

  stopBed(fade) {
    if (!this.crackle) return;
    const t = this.score.hub.ctx.currentTime;
    this.crackle.g.gain.linearRampToValueAtTime(0.0001, t + fade);
    this.crackle.src.stop(t + fade + 0.05);
    this.crackle = null;
  }

  step(i, t, v, intensity, bar) {
    const S = this.score;
    const P = Percussion;
    const hub = S.hub;
    const bus = S.bus;
    const swing = (60 / S.bpm / 4) * 0.28;

    if (i === 0 || i === 7 || i === 10) P.osc(hub, bus, t, { from: 110, to: 48, peak: 0.6 * v, decay: 0.32 });
    if (i === 8) {
      P.noiseHit(hub, bus, t, { freq: 1300, q: 1, peak: 0.14 * v, decay: 0.12 });
      P.osc(hub, bus, t, { type: 'triangle', from: 190, to: 160, peak: 0.08 * v, decay: 0.08 });
    }
    if (i % 2 === 0) {
      const at = i % 4 === 2 ? t + swing : t;
      P.noiseHit(hub, bus, at, { freq: 8000, q: 0.7, peak: 0.045 * v, decay: 0.035, type: 'highpass' });
    }
    if (intensity >= 1 && i % 2 === 1) P.noiseHit(hub, bus, t, { freq: 8000, q: 0.7, peak: 0.03, decay: 0.03, type: 'highpass' });
    if (intensity >= 2 && (i === 4 || i === 12)) P.osc(hub, bus, t, { from: 110, to: 48, peak: 0.4, decay: 0.25 });

    // Electric-piano chord at the top of each bar
    if (i === 0) {
      const chord = bar % 2 === 0 ? [146.83, 174.61, 220, 261.63, 329.63] : [98, 174.61, 246.94, 329.63];
      const len = S.barLength * 0.95;
      chord.forEach((f, k) => {
        S.note(t + k * 0.012, f, len, { type: 'sine', gain: 0.03 * v, attack: 0.04 });
        S.note(t + k * 0.012, f * 2, len * 0.6, { type: 'triangle', gain: 0.008 * v, attack: 0.04 });
      });
    }
    // A few pentatonic notes on odd bars
    if (bar % 2 === 1 && (i === 6 || i === 12)) {
      const f = [587.33, 659.25, 880, 783.99][(bar + i) % 4];
      S.note(t, f, 0.45, { type: 'sine', gain: 0.03 * v, attack: 0.02 });
    }
    // Vinyl pops
    if (Math.random() < 0.05) P.noiseHit(hub, bus, t, { freq: 3000, q: 2, peak: 0.05, decay: 0.008 });
  }
}

FilmiScore.STYLES.lofi = BgmLofi;
