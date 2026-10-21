/**
 * FilmiScore — the background music engine. All music is original and synthesised.
 *
 * It keeps time (a 16-step sequencer with look-ahead scheduling) and hands every step to the
 * active style, one of the classes in js/audio/styles/ (Keherwa, 80s Disco, Bhangra, Lo-fi).
 * Styles register themselves in FilmiScore.STYLES.
 *
 *   start('menu' | 'groove')  menu plays lighter
 *   setUrgency(0..1)          speeds up and fills out the groove as the round clock runs down
 *   setStyle(key)             switch style live (Studio, test mode)
 *   spinTempo(s)              while the wheel spins: s = 1 just flicked … 0 about to stop.
 *                             The groove races at the start and slows down with the wheel.
 *   landOnBeat()              the wheel has stopped: back to normal tempo on a fresh downbeat
 *   pulse()                   0..1, peaks on every beat that is sounding right now (speakers,
 *                             equalisers and other things that dance to the music)
 */
class FilmiScore {
  constructor(hub) {
    this.hub = hub;
    this.playing = false;
    this.mode = 'groove';
    this.styleKey = 'keherwa';
    this.style = null;
    this.bpm = 96;
    this.intensity = 0;
    this.step = 0;
    this.bar = 0;
    this.nextTime = 0;
    this.timer = null;
    this.tempoScale = 1;
    this.spinBoost = 0;
    this.beats = [];
  }

  ensureStyle() {
    if (this.style) return;
    const Style = FilmiScore.STYLES[this.styleKey] || FilmiScore.STYLES.keherwa;
    this.style = new Style(this);
  }

  setStyle(key) {
    if (key === this.styleKey && this.style) return;
    const wasPlaying = this.playing;
    const mode = this.mode;
    if (wasPlaying) this.stop(0.25);
    this.styleKey = key;
    this.style = null;
    if (wasPlaying) this.start(mode);
  }

  start(mode = 'groove') {
    this.mode = mode;
    this.intensity = 0;
    if (!this.hub.musicOn) return;
    const ctx = this.hub.ensure();
    if (!ctx) return;
    this.ensureStyle();
    this.bpm = this.style.bpm * (mode === 'menu' ? 0.95 : 1);
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.bar = 0;
    this.tempoScale = 1;
    this.spinBoost = 0;
    this.beats = [];
    this.nextTime = ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.schedule(), 25);
    this.style.startBed(mode);
  }

  stop(fade = 0.5) {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
    if (this.style) this.style.stopBed(fade);
  }

  /** 0 = relaxed, 1 = the clock is about to run out. */
  setUrgency(u) {
    if (!this.style) return;
    const x = Phaser.Math.Clamp(u, 0, 1);
    this.bpm = this.style.bpm * (1 + 0.5 * x * x);
    this.intensity = x > 0.9 ? 2 : x > 0.65 ? 1 : 0;
  }

  calm() {
    this.setUrgency(0);
  }

  /**
   * Follow the wheel. s is its speed (1 = just flicked, 0 = stopped): the groove runs at up to
   * 1.5× while the wheel races and sinks to half speed as it creeps onto the last peg,
   * so the music and the rolling slow down together.
   */
  spinTempo(s) {
    const x = Phaser.Math.Clamp(s, 0, 1);
    this.tempoScale = 0.5 + 1.0 * Math.sqrt(x);
    this.spinBoost = x > 0.45 ? 1 : 0;
  }

  /** The wheel has landed: normal tempo again, starting on a fresh downbeat with the hit. */
  landOnBeat() {
    this.tempoScale = 1;
    this.spinBoost = 0;
    const ctx = this.hub.ctx;
    if (!this.playing || !ctx) return;
    this.step = 0;
    this.bar += 1;
    this.nextTime = ctx.currentTime + 0.03;
  }

  /** 0..1: strongest right on a beat, fading until the next one. */
  pulse() {
    const ctx = this.hub.ctx;
    if (!this.playing || !ctx) return 0;
    const now = ctx.currentTime;
    let last = -1;
    for (let i = this.beats.length - 1; i >= 0; i--) {
      if (this.beats[i] <= now) {
        last = this.beats[i];
        break;
      }
    }
    if (last < 0) return 0;
    return Math.exp(-(now - last) * 7);
  }

  schedule() {
    const ctx = this.hub.ctx;
    if (!ctx || ctx.state !== 'running') return;
    // After the tab was hidden, skip ahead instead of firing a burst of late notes.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.12) {
      const v = this.mode === 'menu' ? 0.75 : 1;
      this.style.step(this.step, this.nextTime, v, Math.max(this.intensity, this.spinBoost), this.bar);
      if (this.step % 4 === 0) {
        this.beats.push(this.nextTime);
        if (this.beats.length > 8) this.beats.shift();
      }
      this.nextTime += 60 / (this.bpm * this.tempoScale) / 4;
      this.step = (this.step + 1) % 16;
      if (this.step === 0) this.bar += 1;
    }
  }

  /* ---------- helpers for styles ---------- */

  get bus() {
    return this.hub.musicBus;
  }

  /** Seconds per bar at the current tempo. */
  get barLength() {
    return (60 / (this.bpm * this.tempoScale)) * 4;
  }

  /** One synth note: oscillator → optional low-pass → envelope → music bus. */
  note(t, freq, dur, { type = 'sine', gain = 0.06, attack = 0.01, cutoff = 0, detune = 0 } = {}) {
    const ctx = this.hub.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    let head = o;
    if (cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cutoff;
      o.connect(f);
      head = f;
    }
    head.connect(g);
    g.connect(this.bus);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.setValueAtTime(gain, t + Math.max(attack, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** A sustained drone/pad; returns a handle for stopDrone(). */
  drone(freqs, { type = 'sawtooth', level = 0.04, cutoff = 760, lfo = 0.22, lfoDepth = 260 } = {}) {
    const ctx = this.hub.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.linearRampToValueAtTime(level, ctx.currentTime + 1.5);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = cutoff;
    lp.connect(out);
    out.connect(this.bus);
    const nodes = freqs.map((f) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.connect(lp);
      o.start();
      return o;
    });
    const l = ctx.createOscillator();
    const lg = ctx.createGain();
    l.frequency.value = lfo;
    lg.gain.value = lfoDepth;
    l.connect(lg);
    lg.connect(lp.frequency);
    l.start();
    nodes.push(l);
    return { out, nodes };
  }

  stopDrone(handle, fade = 0.5) {
    if (!handle || !this.hub.ctx) return;
    const t = this.hub.ctx.currentTime;
    handle.out.gain.cancelScheduledValues(t);
    handle.out.gain.setValueAtTime(handle.out.gain.value, t);
    handle.out.gain.linearRampToValueAtTime(0.0001, t + fade);
    handle.nodes.forEach((o) => o.stop(t + fade + 0.05));
  }
}

FilmiScore.STYLES = {};
FilmiScore.shared = new FilmiScore(AudioHub.shared);
