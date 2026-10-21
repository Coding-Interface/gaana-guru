/**
 * CinemaFX — the "lights, camera, action" layer for a scene:
 * film grain, a dark vignette, letterbox bars and camera moves
 * (flash, zoom punch, shake, the classic triple dramatic zoom, heartbeat pulses, and the spin
 * camera that eases in on the needle as the wheel slows down).
 * Camera moves and flicker are skipped when the player prefers reduced motion.
 */
class CinemaFX {
  constructor(scene, { grain = 0.06, vignette = 0.6 } = {}) {
    this.scene = scene;
    this.cam = scene.cameras.main;
    const { W, H } = Layout.current;
    this.W = W;
    this.H = H;

    // Overlays are larger than the screen so zoom punches never show their edges.
    this.vignette = scene.add.image(W / 2, H / 2, 'fx-vignette').setDisplaySize(W * 1.4, H * 1.4).setDepth(44).setAlpha(vignette);
    this.red = scene.add.image(W / 2, H / 2, 'fx-vignette-red').setDisplaySize(W * 1.4, H * 1.4).setDepth(44).setAlpha(0);
    this.grain = scene.add.tileSprite(W / 2, H / 2, W * 1.4, H * 1.4, 'fx-grain').setDepth(45).setAlpha(grain);

    const barH = 400;
    this.barH = barH;
    this.topBar = scene.add.rectangle(W / 2, -barH / 2, W * 1.6, barH, 0x000000).setDepth(46);
    this.bottomBar = scene.add.rectangle(W / 2, H + barH / 2, W * 1.6, barH, 0x000000).setDepth(46);

    {
      const flicker = () => {
        if (!this.off) this.grain.setTilePosition(Math.random() * 256, Math.random() * 256);
      };
      scene.events.on('update', flicker);
      scene.events.once('shutdown', () => scene.events.off('update', flicker));
    }
  }

  /** Calm mode (or the device's reduce-motion), read live so a change applies at once. */
  get off() {
    return Theme.reducedMotion;
  }

  /** Slide the black letterbox bars in (h px each) or out. */
  letterbox(on, h = 64, duration = 280) {
    const { H, barH } = this;
    this.scene.tweens.add({ targets: this.topBar, y: on ? -barH / 2 + h : -barH / 2, duration, ease: 'Cubic.easeOut' });
    this.scene.tweens.add({ targets: this.bottomBar, y: on ? H + barH / 2 - h : H + barH / 2, duration, ease: 'Cubic.easeOut' });
  }

  /** A see-through flash of light that fades out (softer than a full-screen camera flash). */
  flash(rgb = [255, 241, 214], duration = 220, peak = 0.55) {
    if (this.off) return;
    const color = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    const f = this.scene.add.rectangle(this.W / 2, this.H / 2, this.W * 1.6, this.H * 1.6, color).setDepth(43).setAlpha(peak);
    this.scene.tweens.add({ targets: f, alpha: 0, duration: duration + 120, ease: 'Quad.easeOut', onComplete: () => f.destroy() });
  }

  /**
   * Quick push-in and back, like a punch on the beat. Done with a tween chain: starting the
   * way back from inside Phaser's zoomTo callback gets cancelled, which left the camera
   * zoomed in (score and pause button cut off).
   */
  punch(zoom = 1.06, duration = 90) {
    if (this.off || this.focused) return;
    this.stopZoom();
    this.zoomTween = this.scene.tweens.chain({
      targets: this.cam,
      tweens: [
        { zoom, duration, ease: 'Quad.easeOut' },
        { zoom: 1, duration: 240, ease: 'Quad.easeInOut' }
      ]
    });
  }

  stopZoom() {
    if (this.zoomTween) this.zoomTween.stop();
    this.zoomTween = null;
  }

  shake(duration = 140, intensity = 0.005) {
    if (this.off) return;
    this.cam.shake(duration, intensity);
  }

  /** Dhan … dhan … dhaaan: three hard zooms onto a point, synced with Sfx.dramatic(). */
  tripleZoom(x, y, hold = 1500) {
    if (this.off) return;
    this.stopZoom();
    this.cam.pan(x, y, 200, 'Quad.easeOut', true);
    [[0, 1.08], [360, 1.16], [780, 1.26]].forEach(([at, z]) => {
      this.scene.time.delayedCall(at, () => {
        this.stopZoom();
        this.zoomTween = this.scene.tweens.add({ targets: this.cam, zoom: z, duration: 70, ease: 'Quad.easeOut' });
        this.shake(90, 0.004);
      });
    });
    this.scene.time.delayedCall(hold, () => this.reset(450));
  }

  reset(duration = 300) {
    this.stopZoom();
    this.cam.pan(this.W / 2, this.H / 2, duration, 'Quad.easeInOut', true);
    this.zoomTween = this.scene.tweens.add({ targets: this.cam, zoom: 1, duration, ease: 'Quad.easeInOut' });
  }

  /**
   * Spin camera: while the wheel turns, ease in towards the needle. s is the wheel's speed
   * (1 just flicked … 0 stopped); the push-in builds mostly in the last, slow turns, so the
   * camera arrives on the slice under the needle as the wheel settles on it.
   */
  followWheel(wheel, s, limit = 1.75) {
    if (this.off) return;
    this.focused = true;
    this.stopZoom();
    const t = Phaser.Math.Easing.Sine.InOut(1 - Phaser.Math.Clamp(s, 0, 1));
    const fx = wheel.x;
    const fy = wheel.y - wheel.radius * 0.62;
    const maxZoom = Math.min(limit, (this.H * 0.42) / (wheel.radius * 1.05));
    const z = 1 + (Math.max(1.05, maxZoom) - 1) * t;
    // Keep the view inside the stage, so no empty edge shows when the wheel is off-centre.
    const hw = this.W / (2 * z);
    const hh = this.H / (2 * z);
    const cx = Phaser.Math.Clamp(this.W / 2 + (fx - this.W / 2) * t, hw, this.W - hw);
    const cy = Phaser.Math.Clamp(this.H / 2 + (fy - this.H / 2) * t, hh, this.H - hh);
    this.cam.setZoom(z);
    this.cam.centerOn(cx, cy);
  }

  /** After the landing: a little push on the hit, a beat to read the slice, then back out. */
  releaseWheel(hold = 450, duration = 650) {
    if (this.off || !this.focused) {
      this.focused = false;
      return;
    }
    const cam = this.cam;
    const from = { z: cam.zoom, x: cam.midPoint.x, y: cam.midPoint.y };
    const p = { k: 0 };
    this.stopZoom();
    this.zoomTween = this.scene.tweens.chain({
      targets: cam,
      tweens: [
        { zoom: cam.zoom * 1.06, duration: 90, ease: 'Quad.easeOut' },
        { zoom: cam.zoom, duration: 160, ease: 'Quad.easeIn' }
      ]
    });
    this.scene.time.delayedCall(250 + hold, () => {
      this.stopZoom();
      this.zoomTween = this.scene.tweens.add({
        targets: p,
        k: 1,
        duration,
        ease: 'Cubic.easeInOut',
        onUpdate: () => {
          cam.setZoom(from.z + (1 - from.z) * p.k);
          cam.centerOn(from.x + (this.W / 2 - from.x) * p.k, from.y + (this.H / 2 - from.y) * p.k);
        },
        onComplete: () => {
          cam.setZoom(1);
          cam.centerOn(this.W / 2, this.H / 2);
          this.focused = false;
        }
      });
    });
  }

  /** Red edges pulse once (time pressure). */
  redPulse(peak = 0.55) {
    this.scene.tweens.killTweensOf(this.red);
    this.red.setAlpha(peak);
    this.scene.tweens.add({ targets: this.red, alpha: 0, duration: 520, ease: 'Quad.easeOut' });
  }

  heartbeat() {
    this.punch(1.018, 70);
    this.redPulse(0.45);
  }
}
