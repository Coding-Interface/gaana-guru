/**
 * BgmBhangra — a bouncing dhol chaal with chimta jingles and a plucky tumbi riff
 * every other bar.
 */
class BgmBhangra {
  constructor(score) {
    this.score = score;
    this.bed = null;
  }

  get bpm() {
    return 112;
  }

  startBed() {
    this.bed = this.score.drone([73.42, 110], { type: 'square', level: 0.018, cutoff: 420, lfo: 0.15, lfoDepth: 120 });
  }

  stopBed(fade) {
    this.score.stopDrone(this.bed, fade);
    this.bed = null;
  }

  step(i, t, v, intensity, bar) {
    const S = this.score;
    const P = Percussion;
    const hub = S.hub;
    const bus = S.bus;
    // Chaal: DHA . ka DHA . tin DHA . | DHA . ka dha . tin DHA dha
    const big = [0, 3, 6, 8, 14];
    const small = [11, 15];
    if (big.includes(i)) P.dha(hub, bus, t, (i === 0 || i === 8 ? 1 : 0.75) * v);
    if (small.includes(i)) P.dha(hub, bus, t, 0.45 * v);
    if (i === 2 || i === 10) P.ka(hub, bus, t, 0.8 * v);
    if (i === 5 || i === 13) P.tin(hub, bus, t, 0.7 * v);
    if (i % 4 === 0) P.ting(hub, bus, t, 0.5 * v);
    if (intensity >= 1 && i % 2 === 1) P.ting(hub, bus, t, 0.25);
    if (intensity >= 2 && (i === 1 || i === 9)) P.dha(hub, bus, t, 0.5);

    // Tumbi: short plucked high notes
    if (bar % 2 === 0 && i % 2 === 0) {
      const f = BgmBhangra.TUMBI[(i / 2) % BgmBhangra.TUMBI.length];
      S.note(t, f, 0.12, { type: 'triangle', gain: 0.07 * v, attack: 0.002 });
      S.note(t, f * 2, 0.06, { type: 'square', gain: 0.018 * v, attack: 0.002, cutoff: 3200 });
    }
  }
}

BgmBhangra.TUMBI = [587.33, 698.46, 783.99, 880, 783.99, 698.46, 587.33, 523.25];

FilmiScore.STYLES.bhangra = BgmBhangra;
