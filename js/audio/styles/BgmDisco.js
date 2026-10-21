/**
 * BgmDisco — 80s filmi disco: four-on-the-floor kick, claps, open hats, an octave-jumping
 * synth bass and bright chord stabs over a Dm – B♭ – C – A progression.
 */
class BgmDisco {
  constructor(score) {
    this.score = score;
  }

  get bpm() {
    return 118;
  }

  startBed() {}

  stopBed() {}

  step(i, t, v, intensity, bar) {
    const S = this.score;
    const P = Percussion;
    const hub = S.hub;
    const bus = S.bus;
    const chord = BgmDisco.CHORDS[bar % 4];

    if (i % 4 === 0) P.osc(hub, bus, t, { from: 150, to: 46, peak: 0.85 * v, decay: 0.28 });
    if (i === 4 || i === 12) {
      P.noiseHit(hub, bus, t, { freq: 1500, q: 0.9, peak: 0.32 * v, decay: 0.12 });
      P.noiseHit(hub, bus, t + 0.012, { freq: 1100, q: 0.9, peak: 0.22 * v, decay: 0.1 });
    }
    if (i % 4 === 2) P.noiseHit(hub, bus, t, { freq: 7200, q: 0.7, peak: 0.12 * v, decay: 0.13, type: 'highpass' });
    if (intensity >= 1 && i % 2 === 1) P.noiseHit(hub, bus, t, { freq: 9000, q: 0.7, peak: 0.06, decay: 0.03, type: 'highpass' });

    // Octave bass on every eighth
    if (i % 2 === 0) {
      const f = chord.root * (i % 4 === 0 ? 1 : 2);
      S.note(t, f, 0.17, { type: 'sawtooth', gain: 0.11 * v, attack: 0.005, cutoff: 520 });
    }
    // Chord stabs
    if (i === 0 || i === 6 || i === 10) {
      chord.notes.forEach((f) => {
        S.note(t, f, 0.16, { type: 'square', gain: 0.026 * v, attack: 0.004, cutoff: 2400, detune: -7 });
        S.note(t, f, 0.16, { type: 'square', gain: 0.02 * v, attack: 0.004, cutoff: 2400, detune: 7 });
      });
    }
    // Tom fill at the end of every 4th bar when the clock is low
    if (intensity >= 2 && bar % 4 === 3 && i >= 12) P.osc(hub, bus, t, { from: 220 - (i - 12) * 30, to: 90, peak: 0.4, decay: 0.18 });
  }
}

BgmDisco.CHORDS = [
  { root: 73.42, notes: [293.66, 349.23, 440] },
  { root: 58.27, notes: [233.08, 293.66, 349.23] },
  { root: 65.41, notes: [261.63, 329.63, 392] },
  { root: 55.0, notes: [220, 277.18, 329.63] }
];

FilmiScore.STYLES.disco = BgmDisco;
