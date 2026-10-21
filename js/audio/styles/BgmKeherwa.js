/**
 * BgmKeherwa — classic filmi groove: keherwa dhol and tabla over a tanpura drone,
 * with a harmonium phrase in raag Khamaj on the menu.
 */
class BgmKeherwa {
  constructor(score) {
    this.score = score;
    this.bed = null;
  }

  get bpm() {
    return 96;
  }

  startBed(mode) {
    this.mode = mode;
    this.bed = this.score.drone([110, 146.83, 220.5, 293.4], { level: mode === 'menu' ? 0.05 : 0.035 });
  }

  stopBed(fade) {
    this.score.stopDrone(this.bed, fade);
    this.bed = null;
  }

  step(i, t, v, intensity, bar) {
    const P = Percussion;
    const hub = this.score.hub;
    const bus = this.score.bus;
    // dha ge na ti | na ka dhi na
    if (i === 0) {
      P.dha(hub, bus, t, v);
      P.ting(hub, bus, t, 0.8 * v);
    }
    if (i === 3) P.na(hub, bus, t, 0.45 * v);
    if (i === 4) P.na(hub, bus, t, 0.7 * v);
    if (i === 6) P.dha(hub, bus, t, 0.55 * v);
    if (i === 8) P.na(hub, bus, t, 0.8 * v);
    if (i === 10) P.ka(hub, bus, t, 0.7 * v);
    if (i === 11) P.na(hub, bus, t, 0.4 * v);
    if (i === 12) P.dha(hub, bus, t, 0.85 * v);
    if (i === 14) P.tin(hub, bus, t, 0.6 * v);
    if (i % 4 === 2) P.ting(hub, bus, t, 0.22 * v);
    if (intensity >= 1 && i % 2 === 1) P.ka(hub, bus, t, 0.22);
    if (intensity >= 2 && (i === 2 || i === 7 || i === 13 || i === 15)) P.dha(hub, bus, t, 0.45);
    if (this.mode === 'menu' && i === 0 && bar % 4 === 1) this.motif(t);
  }

  motif(t) {
    const SA = 293.66;
    const eighth = 60 / this.score.bpm / 2;
    [7, 9, 7, 5, 4, 2, 4, 0, 2, 4, 5, 4].forEach((semi, k, all) => {
      const f = SA * Math.pow(2, semi / 12);
      const len = k === all.length - 1 ? eighth * 3 : eighth * 0.95;
      this.score.note(t + k * eighth, f, len, { type: 'square', gain: 0.04, attack: 0.03, cutoff: 1700 });
      this.score.note(t + k * eighth, f * 2.003, len, { type: 'sawtooth', gain: 0.015, attack: 0.03, cutoff: 1700 });
    });
  }
}

FilmiScore.STYLES.keherwa = BgmKeherwa;
