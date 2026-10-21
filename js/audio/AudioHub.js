/**
 * AudioHub — the one Web Audio context, with separate buses for sound effects and music,
 * and everything needed to keep it playing on every kind of device.
 *
 * Unlocking: browsers only allow sound after a tap, click or key press. unlock() is called
 * from the "tap to start" screen and from a global gesture listener, and it also plays a
 * one-sample silent buffer (needed by older iOS Safari before anything can be heard).
 *
 * Lifecycle (install() once at start-up):
 *   tab hidden / app minimised / page frozen  → suspend the context (saves battery)
 *   tab visible / page shown again / focus    → resume it
 *   any tap or key while it should be playing → resume it (iOS leaves the context
 *                                               "interrupted" after a call or app switch,
 *                                               and only a gesture can wake it)
 *   statechange                               → retry resuming when it was stopped by the system
 * On iOS 17+ the audio session is set to "playback", so the game is heard even with the
 * ring/silent switch on silent, like a video.
 */
class AudioHub {
  constructor() {
    this.ctx = null;
    this.sfxOn = true;
    this.musicOn = true;
    this.musicLevel = 0.5;
    this.sfxLevel = 0.9;
    this.background = false;
    this.primed = false;
  }

  /** Music volume 0..1 (the slider); the bus runs at up to 0.7 so effects stay on top. */
  setMusicVolume(v) {
    this.musicLevel = Phaser.Math.Clamp(v, 0, 1) * 0.7;
    if (this.ctx) this.musicBus.gain.setTargetAtTime(this.musicLevel, this.ctx.currentTime, 0.05);
  }

  setSfxVolume(v) {
    this.sfxLevel = Phaser.Math.Clamp(v, 0, 1) * 1.1;
    if (this.ctx) this.sfxBus.gain.setTargetAtTime(this.sfxLevel, this.ctx.currentTime, 0.05);
  }

  /** Create the context if needed (safe to call any time; it may start suspended). */
  create() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      this.ctx = new AC({ latencyHint: 'interactive' });
    } catch (e) {
      try {
        this.ctx = new AC();
      } catch (e2) {
        return null;
      }
    }
    const ctx = this.ctx;
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (e) {
      /* not supported */
    }
    this.master = ctx.createDynamicsCompressor();
    this.master.threshold.value = -14;
    this.master.ratio.value = 4;
    this.master.connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxLevel;
    this.sfxBus.connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicLevel;
    this.musicBus.connect(this.master);

    // One second of white noise, reused for drum slaps, shakers, shutters and claps.
    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    ctx.onstatechange = () => {
      if (ctx.state !== 'running' && !this.background && !document.hidden) this.tryResume();
    };
    return ctx;
  }

  /** Called by anything about to make a sound. */
  ensure() {
    const ctx = this.create();
    if (ctx && ctx.state !== 'running' && !this.background) this.tryResume();
    return ctx;
  }

  /** From a user gesture: wake the context and prime it with a silent sample. */
  unlock() {
    const ctx = this.create();
    if (!ctx) return;
    this.background = false;
    this.tryResume();
    if (!this.primed) {
      this.primed = true;
      try {
        const src = ctx.createBufferSource();
        src.buffer = ctx.createBuffer(1, 1, 22050);
        src.connect(ctx.destination);
        src.start(0);
      } catch (e) {
        /* nothing to prime */
      }
    }
  }

  tryResume() {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'running' || ctx.state === 'closed') return;
    try {
      const p = ctx.resume();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {
      /* will retry on the next gesture */
    }
  }

  get running() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  /** Resolves once the context is actually running (true), or after `timeout` ms (false). */
  whenRunning(timeout = 1000) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const check = () => {
        if (this.running) resolve(true);
        else if (Date.now() - t0 > timeout) resolve(false);
        else {
          this.tryResume();
          setTimeout(check, 40);
        }
      };
      check();
    });
  }

  noiseSource() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    return src;
  }

  /** Dip the music so a sting can be heard, then bring it back. */
  duck(seconds = 1.5, floor = 0.12) {
    if (!this.ctx) return;
    const g = this.musicBus.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(this.musicLevel * floor, t + 0.08);
    g.setValueAtTime(this.musicLevel * floor, t + seconds);
    g.linearRampToValueAtTime(this.musicLevel, t + seconds + 0.6);
  }

  /** The app went to the background: go quiet. */
  goBackground() {
    this.background = true;
    if (this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend();
      } catch (e) {
        /* ignore */
      }
    }
  }

  /** Back in front: play again (a gesture will finish the job where the system insists). */
  goForeground() {
    this.background = false;
    this.tryResume();
  }

  /** Wire the page lifecycle once. */
  install() {
    if (this.installed) return;
    this.installed = true;
    const gesture = () => {
      if (!this.ctx) return;
      if (!this.running) this.unlock();
    };
    ['pointerdown', 'pointerup', 'touchend', 'mousedown', 'keydown', 'click'].forEach((type) => {
      window.addEventListener(type, gesture, { capture: true, passive: true });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.goBackground();
      else this.goForeground();
    });
    window.addEventListener('pagehide', () => this.goBackground());
    window.addEventListener('pageshow', () => {
      if (!document.hidden) this.goForeground();
    });
    document.addEventListener('freeze', () => this.goBackground());
    document.addEventListener('resume', () => this.goForeground());
    window.addEventListener('focus', () => {
      if (!document.hidden) this.goForeground();
    });
  }
}

AudioHub.shared = new AudioHub();
