/**
 * Ambience — the living layer of each theme, behind the UI.
 *
 *   cinema     spinning film reels, dust drifting through the light, popcorn and tickets
 *   holi       gulal puffs rising, bursts of colour, paint and splash emoji
 *   diwali     flickering diyas, swinging lanterns, fireworks
 *   musical    speaker stacks pumping to the beat with LED level meters, music notes floating up
 *   christmas  snowfall, twinkling fairy-light garlands, trees and gifts
 */
class Ambience {
  constructor(scene, themeKey, depth = -12, { hud = false } = {}) {
    this.scene = scene;
    this.depth = depth;
    // Game screens keep the top strip clear for the HUD, so top-corner pieces are skipped.
    this.hud = hud;
    this.calm = Theme.reducedMotion;
    const { W, H } = Layout.current;
    this.W = W;
    this.H = H;
    const build = { cinema: this.cinema, musical: this.musical, holi: this.holi, diwali: this.diwali, christmas: this.christmas }[themeKey] || this.cinema;
    build.call(this);
  }

  emoji(char, x, y, size, depth = this.depth) {
    const key = EmojiCodes.keyFor(char);
    if (!this.scene.textures.exists(key)) return null;
    return this.scene.add.image(x, y, key).setDisplaySize(size, size).setDepth(depth);
  }

  bob(obj, dy = 10, duration = 2200, delay = 0) {
    if (!obj || this.calm) return;
    this.scene.tweens.add({ targets: obj, y: obj.y - dy, angle: { from: -4, to: 4 }, duration, delay, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  every(ms, fn) {
    if (this.calm) return;
    // Skips its beat if calm mode was switched on since (the scene rebuilds calm on resume).
    this.scene.time.addEvent({ delay: ms, loop: true, callback: () => !Theme.reducedMotion && fn() });
  }

  /* ---------------- Cinema ---------------- */

  cinema() {
    const { W, H, scene } = this;
    const s = Math.min(W, H) * 0.2;
    (this.hud ? [] : [[W * 0.04, H * 0.08, 1], [W * 0.96, H * 0.08, -1]]).forEach(([x, y, dir]) => {
      const reel = scene.add.image(x, y, 'fx-reel').setDisplaySize(s, s).setDepth(this.depth).setAlpha(0.85);
      if (!this.calm) scene.tweens.add({ targets: reel, angle: 360 * dir, duration: 9000, repeat: -1 });
    });
    this.bob(this.emoji('🍿', W * 0.08, H * 0.94, 54), 8, 2400);
    this.bob(this.emoji('🎟️', W * 0.92, H * 0.94, 50), 8, 2700, 300);
    if (!this.calm) {
      scene.add
        .particles(0, 0, 'fx-dust', {
          x: { min: 0, max: W },
          y: { min: H * 0.2, max: H },
          speedY: { min: -14, max: -4 },
          speedX: { min: -8, max: 8 },
          scale: { min: 0.3, max: 1 },
          alpha: { start: 0.7, end: 0 },
          lifespan: 6000,
          frequency: 160,
          blendMode: 'ADD'
        })
        .setDepth(this.depth);
    }
  }

  /* ---------------- Musical ---------------- */

  musical() {
    const { W, H, scene } = this;
    const P = H > W;
    const big = P ? { w: 118, h: 180 } : { w: 112, h: 172 };
    const small = P ? { w: 96, h: 120 } : { w: 92, h: 112 };
    // Leave room under the cabinets for their instrument chips when they are playable.
    const floor = this.hud ? H * 0.97 : H - 56;
    // Off the game screens (menu, wrap) the stacks are playable, each with its chosen instrument.
    [big.w / 2 + 6, W - big.w / 2 - 6].forEach((x, i) => {
      const slot = this.hud ? null : i;
      new Speaker(scene, x, floor - big.h / 2, { w: big.w, h: big.h, woofers: 2, depth: this.depth, meter: this.hud, slot, picker: !this.hud });
      if (!this.hud) new Speaker(scene, x, floor - big.h - small.h / 2 - 4, { w: small.w, h: small.h, woofers: 1, depth: this.depth, meter: true, slot });
    });

    if (this.calm) return;
    // Notes drifting up out of the speakers.
    const notes = ['🎵', '🎶'];
    this.every(1300, () => {
      const left = Math.random() < 0.5;
      const x = left ? big.w * 0.6 : W - big.w * 0.6;
      const n = this.emoji(notes[Math.floor(Math.random() * 2)], x, floor - big.h * 0.6, Phaser.Math.Between(30, 44));
      if (!n) return;
      n.setAlpha(0);
      scene.tweens.add({
        targets: n,
        y: n.y - H * 0.32,
        x: x + (left ? 1 : -1) * Phaser.Math.Between(30, 110),
        angle: Phaser.Math.Between(-30, 30),
        alpha: { from: 0.95, to: 0 },
        duration: 3200,
        ease: 'Sine.easeOut',
        onComplete: () => n.destroy()
      });
    });
  }

  /* ---------------- Holi ---------------- */

  holi() {
    const { W, H, scene } = this;
    this.bob(this.emoji('🎨', W * 0.08, H * 0.93, 58), 10, 2300);
    this.bob(this.emoji('💦', W * 0.92, H * 0.92, 50), 12, 2000, 400);
    if (!this.hud) this.bob(this.emoji('🌈', W * 0.9, H * 0.07, 54), 6, 3000);
    if (this.calm) return;
    const puffs = scene.add
      .particles(0, 0, 'fx-powder', {
        frame: ['p0', 'p1', 'p2', 'p3', 'p4'],
        x: { min: -40, max: W + 40 },
        y: H + 60,
        speedY: { min: -60, max: -25 },
        speedX: { min: -15, max: 15 },
        scale: { start: 0.8, end: 3.2 },
        alpha: { start: 0.45, end: 0 },
        lifespan: 9000,
        frequency: 420
      })
      .setDepth(this.depth);
    const burst = scene.add
      .particles(0, 0, 'fx-powder', {
        frame: ['p0', 'p1', 'p2', 'p3', 'p4'],
        speed: { min: 60, max: 260 },
        scale: { start: 0.5, end: 2.2 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 1600,
        emitting: false
      })
      .setDepth(this.depth);
    this.every(2600, () => burst.explode(16, Phaser.Math.Between(60, W - 60), Phaser.Math.Between(80, H * 0.6)));
    this.puffs = puffs;
  }

  /* ---------------- Diwali ---------------- */

  diwali() {
    const { W, H, scene } = this;
    const n = W > H ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const x = (W / n) * (i + 0.5);
      const y = H - 30;
      const halo = scene.add.image(x, y - 16, Effects.tinted(scene, 'fx-glow', 0xffa63d)).setDisplaySize(110, 110).setBlendMode(Phaser.BlendModes.ADD).setDepth(this.depth).setAlpha(0.8);
      this.emoji('🪔', x, y, 50);
      if (!this.calm) scene.tweens.add({ targets: halo, alpha: { from: 0.5, to: 0.95 }, scale: halo.scale * 1.15, duration: Phaser.Math.Between(180, 320), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    (this.hud ? [] : [[W * 0.1, 0.9], [W * 0.9, 1.1]]).forEach(([x, speed]) => {
      const line = scene.add.rectangle(x, 0, 2, 70, 0xc9a24a).setOrigin(0.5, 0).setDepth(this.depth);
      const lantern = this.emoji('🏮', x, 96, 60);
      if (lantern && !this.calm) {
        lantern.setOrigin(0.5, 0.1);
        lantern.y = 66;
        scene.tweens.add({ targets: [lantern, line], angle: { from: -7, to: 7 }, duration: 1800 * speed, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });
    if (this.calm) return;
    const sparks = scene.add
      .particles(0, 0, 'fx-star', {
        frame: ['s0', 's1', 's2'],
        speed: { min: 120, max: 300 },
        angle: { min: 0, max: 360 },
        gravityY: 120,
        scale: { start: 0.7, end: 0 },
        lifespan: 1300,
        emitting: false,
        blendMode: 'ADD'
      })
      .setDepth(this.depth);
    this.every(1900, () => {
      const x = Phaser.Math.Between(80, W - 80);
      const y = Phaser.Math.Between(H * 0.08, H * 0.32);
      sparks.explode(36, x, y);
      const flash = scene.add.image(x, y, Effects.tinted(scene, 'fx-glow', Phaser.Utils.Array.GetRandom([0xffb703, 0xff4fa3, 0x4fd8c9]))).setDepth(this.depth).setBlendMode(Phaser.BlendModes.ADD).setScale(0.6);
      scene.tweens.add({ targets: flash, scale: 3, alpha: 0, duration: 700, onComplete: () => flash.destroy() });
    });
  }

  /* ---------------- Christmas ---------------- */

  christmas() {
    const { W, H, scene } = this;
    const colors = THEMES.christmas.bulbs;
    new BulbRing(scene, BulbRing.garland(-20, 8, W / 2, 8, 46, Math.round(W / 70)), { size: 16, colors, pattern: 'twinkle', speed: 120, depth: this.depth });
    new BulbRing(scene, BulbRing.garland(W / 2, 8, W + 20, 8, 46, Math.round(W / 70)), { size: 16, colors: colors.slice().reverse(), pattern: 'twinkle', speed: 140, depth: this.depth });
    this.bob(this.emoji('🎁', W * 0.1, H * 0.95, 52), 4, 2600);
    this.bob(this.emoji('🎁', W * 0.9, H * 0.95, 46), 4, 2900, 300);
    const star = this.emoji('⭐', W * 0.82, H * 0.12, 34);
    if (star && !this.calm) scene.tweens.add({ targets: star, alpha: { from: 1, to: 0.4 }, scale: star.scale * 1.2, duration: 900, yoyo: true, repeat: -1 });
    if (this.calm) return;
    scene.add
      .particles(0, 0, 'fx-snow', {
        x: { min: -20, max: W + 20 },
        y: -20,
        speedY: { min: 35, max: 90 },
        speedX: { min: -25, max: 25 },
        scale: { min: 0.3, max: 1.1 },
        alpha: { min: 0.5, max: 0.95 },
        lifespan: 16000,
        frequency: 90,
        rotate: { min: 0, max: 360 }
      })
      .setDepth(this.depth + 40);
  }
}
