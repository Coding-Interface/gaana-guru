/**
 * ReelRoll — the sound of a heavy wheel rolling on its axle, synthesised and steered by speed.
 *
 *   start()    begins the roll (call once when the wheel is launched)
 *   set(s)     s = wheel speed, 1 = just flicked … 0 = stopped
 *   stop()     a soft thunk and silence
 *
 * Three layers move together with the speed:
 *   whirr   band-passed noise whose pitch and loudness follow the speed (air and bearings)
 *   rumble  a low hum from the axle, dropping in pitch as the wheel slows
 *   rattle  a sprocket chatter (noise chopped by a square wave) whose rate follows the speed,
 *           like a film reel clattering through a projector
 * The pegs hitting the flapper are separate clacks (Sfx.clack), fired by the wheel itself,
 * so they naturally space out as it slows down.
 */
class ReelRoll {
  constructor(hub) {
    this.hub = hub;
    this.nodes = null;
  }

  start() {
    if (!this.hub.sfxOn) return;
    const ctx = this.hub.ensure();
    if (!ctx || this.nodes) return;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(0.9, t + 0.08);
    out.connect(this.hub.sfxBus);

    // Whirr
    const noise = this.hub.noiseSource();
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.value = 900;
    const whirr = ctx.createGain();
    whirr.gain.value = 0.0001;
    noise.connect(bp);
    bp.connect(whirr);
    whirr.connect(out);

    // Rumble
    const hum = ctx.createOscillator();
    hum.type = 'triangle';
    hum.frequency.value = 70;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.0001;
    hum.connect(humGain);
    humGain.connect(out);

    // Rattle: noise × square-wave chopper
    const noise2 = this.hub.noiseSource();
    noise2.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 2600;
    hp.Q.value = 0.9;
    const chop = ctx.createGain();
    chop.gain.value = 0;
    const chopper = ctx.createOscillator();
    chopper.type = 'square';
    chopper.frequency.value = 30;
    const chopDepth = ctx.createGain();
    chopDepth.gain.value = 0.5;
    chopper.connect(chopDepth);
    chopDepth.connect(chop.gain);
    const rattle = ctx.createGain();
    rattle.gain.value = 0.0001;
    noise2.connect(hp);
    hp.connect(chop);
    chop.connect(rattle);
    rattle.connect(out);

    noise.start(t, Math.random() * 0.5);
    noise2.start(t, Math.random() * 0.5);
    hum.start(t);
    chopper.start(t);
    this.nodes = { out, bp, whirr, hum, humGain, chopper, rattle, sources: [noise, noise2, hum, chopper] };
    this.set(1);
  }

  set(s) {
    const n = this.nodes;
    const ctx = this.hub.ctx;
    if (!n || !ctx) return;
    const x = Phaser.Math.Clamp(s, 0, 1);
    const t = ctx.currentTime;
    const k = 0.04;
    n.bp.frequency.setTargetAtTime(300 + 1500 * x, t, k);
    n.whirr.gain.setTargetAtTime(0.02 + 0.16 * x, t, k);
    n.hum.frequency.setTargetAtTime(42 + 70 * x, t, k);
    n.humGain.gain.setTargetAtTime(0.03 + 0.09 * x, t, k);
    n.chopper.frequency.setTargetAtTime(6 + 44 * x, t, k);
    n.rattle.gain.setTargetAtTime(0.02 + 0.1 * x, t, k);
  }

  stop() {
    const n = this.nodes;
    const ctx = this.hub.ctx;
    if (!n || !ctx) return;
    this.nodes = null;
    const t = ctx.currentTime;
    n.out.gain.cancelScheduledValues(t);
    n.out.gain.setValueAtTime(n.out.gain.value, t);
    n.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    n.sources.forEach((src) => src.stop(t + 0.22));
    // The wheel settling against the flapper.
    Percussion.osc(this.hub, this.hub.sfxBus, t, { type: 'triangle', from: 180, to: 90, peak: 0.35, decay: 0.16 });
  }
}

ReelRoll.shared = new ReelRoll(AudioHub.shared);
