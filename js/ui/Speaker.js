/**
 * Speaker — a stage speaker cabinet whose cones pump to the music.
 *
 * Every frame it reads FilmiScore.shared.pulse() (strongest on each beat): the woofers punch
 * out, the cabinet shudders and, on a strong beat, a sound ring ripples out of the woofer.
 * With the music off it just breathes gently. Cabinets are painted once per theme and size.
 *
 * meter: true adds an LED level meter on top of the cabinet that bounces with the beat.
 * slot: 0 | 1 makes it playable: a tap plays the instrument chosen for that slot (left or
 * right, saved in Settings), kicks the cones, ripples a ring and pops the instrument's emoji.
 * picker: true adds a round chip on the cabinet showing that instrument; tap it to choose
 * another (InstrumentPicker).
 *
 *   new Speaker(scene, x, y, { w: 120, h: 190, woofers: 2, meter: true, slot: 0, picker: true })
 *
 * (Sizes are kept in spkW / spkH: Phaser's Transform owns `w` and setPosition() resets it.)
 */
class Speaker extends Phaser.GameObjects.Container {
  constructor(scene, x, y, { w = 120, h = 190, woofers = 2, depth = -10, alpha = 1, meter = false, slot = null, picker = false } = {}) {
    super(scene, x, y);
    this.spkW = w;
    this.spkH = h;
    this.fired = false;
    this.seed = Math.random() * 1000;

    const cabKey = Speaker.paintCabinet(scene, w, h, woofers);
    this.cab = scene.add.image(0, 0, cabKey);
    this.add(this.cab);

    // Woofer centres, top to bottom, under a small tweeter.
    const coneSize = Math.min(w * 0.78, (h * 0.78) / woofers);
    const coneKey = Speaker.paintCone(scene, Math.round(coneSize));
    const tweetY = -h / 2 + h * 0.12;
    this.tweeter = scene.add.image(0, tweetY, coneKey).setDisplaySize(coneSize * 0.32, coneSize * 0.32);
    this.add(this.tweeter);
    this.cones = [];
    const top = tweetY + coneSize * 0.26;
    const span = h / 2 - 10 - top;
    for (let i = 0; i < woofers; i++) {
      const cy = top + (span * (i + 0.5)) / woofers;
      const cone = scene.add.image(0, cy, coneKey).setDisplaySize(coneSize, coneSize);
      cone.base = cone.scale;
      this.cones.push(cone);
      this.add(cone);
    }
    this.coneSize = coneSize;
    this.tweeter.base = this.tweeter.scale;

    if (meter) {
      this.meter = scene.add.graphics();
      this.meterLevels = new Array(6).fill(0.2);
      this.add(this.meter);
      this.drawMeter(0, 0.3);
    }

    this.kick = 0;
    this.taps = 0;
    this.slot = slot;
    if (slot !== null) {
      this.zone = scene.add.zone(0, -14, w + 10, h + 40).setInteractive({ useHandCursor: true });
      this.zone.on('pointerdown', () => this.strike());
      this.add(this.zone);
      if (picker) this.addChip();
    }

    this.setDepth(depth).setAlpha(alpha);
    scene.add.existing(this);

    const tick = (time, delta) => this.tick(time, delta);
    scene.events.on('update', tick);
    scene.events.once('shutdown', () => scene.events.off('update', tick));
  }

  get calm() {
    return Theme.reducedMotion;
  }

  /** LED columns on top of the cabinet: green, then yellow, then a red peak. */
  drawMeter(time, p) {
    const g = this.meter.clear();
    const n = this.meterLevels.length;
    const cw = (this.spkW - 24) / n;
    const top = -this.spkH / 2 - 6;
    g.fillStyle(0x07040a, 0.9).fillRoundedRect(-this.spkW / 2 + 6, top - 50, this.spkW - 12, 52, 8);
    for (let i = 0; i < n; i++) {
      const shape = 0.5 + 0.5 * Math.sin(i * 1.1 + time / 230 + this.seed);
      const target = (0.15 + 0.85 * p) * (0.55 + 0.45 * shape);
      this.meterLevels[i] += (target - this.meterLevels[i]) * 0.4;
      const lit = Math.round(this.meterLevels[i] * 7);
      for (let k = 0; k < 7; k++) {
        const color = k >= 6 ? 0xff4d4d : k >= 4 ? 0xffd23f : 0x5fd39a;
        g.fillStyle(color, k < lit ? 1 : 0.12);
        g.fillRect(-this.spkW / 2 + 12 + i * cw, top - 6 - k * 6.4, cw - 4, 4.4);
      }
    }
  }

  /** The round instrument chip on the cabinet's foot; tap it to pick another instrument. */
  addChip() {
    const sc = this.scene;
    const y = this.spkH / 2 + 6;
    const g = sc.add.graphics();
    g.fillStyle(0x000000, 0.35).fillCircle(0, y + 4, 34);
    g.fillStyle(Theme.color.panel, 1).fillCircle(0, y, 34);
    g.lineStyle(3, Theme.color.marigold, 1).strokeCircle(0, y, 34);
    // A small swap badge says "change me".
    g.fillStyle(Theme.color.marigold, 1).fillCircle(24, y + 22, 13);
    this.chipIcon = sc.add.image(0, y - 1, '__DEFAULT').setDisplaySize(44, 44);
    const swap = sc.add.image(24, y + 22, 'ic-rotate-ccw-ink').setDisplaySize(18, 18);
    const zone = sc.add.zone(0, y, 76, 76).setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => {
      Sfx.shared.ui();
      InstrumentPicker.open(sc, this.slot, this.y, () => this.refreshChip());
    });
    this.add([g, this.chipIcon, swap, zone]);
    this.refreshChip();
  }

  refreshChip() {
    if (!this.chipIcon || !this.chipIcon.active) return;
    const key = EmojiCodes.keyFor(Instruments.find(Settings.instrument(this.slot)).emoji);
    if (this.scene.textures.exists(key)) this.chipIcon.setTexture(key).setDisplaySize(44, 44);
  }

  /** Tapped: play this speaker's instrument and make the cabinet jump. */
  strike() {
    const pick = Instruments.find(Settings.instrument(this.slot));
    Instruments.play(pick.kind, this.taps);
    this.taps += 1;
    this.kick = 1;
    this.ring();
    if (this.calm) return;
    this.scene.tweens.add({ targets: this, scaleX: { from: 1.08, to: 1 }, scaleY: { from: 0.94, to: 1 }, duration: 220, ease: 'Back.easeOut' });
    const key = EmojiCodes.keyFor(pick.emoji);
    if (this.scene.textures.exists(key)) {
      const e = this.scene.add.image(this.x, this.y - this.spkH / 2 - 40, key).setDisplaySize(56, 56).setDepth(this.depth + 1);
      this.scene.tweens.add({
        targets: e,
        y: e.y - 90,
        angle: Phaser.Math.Between(-25, 25),
        alpha: { from: 1, to: 0 },
        scale: e.scale * 1.3,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => e.destroy()
      });
    }
  }

  tick(time, delta) {
    this.kick = Math.max(0, this.kick - (delta || 16) / 260);
    if (this.calm) return;
    const p = Math.max(FilmiScore.shared.pulse(), this.kick);
    if (this.meter) this.drawMeter(time, p);
    const idle = FilmiScore.shared.playing ? 0 : 0.12 * (0.5 + 0.5 * Math.sin((time + this.seed) / 260));
    const v = Math.max(p, idle);
    this.cones.forEach((c) => c.setScale(c.base * (1 + 0.11 * v)));
    this.tweeter.setScale(this.tweeter.base * (1 + 0.18 * v));
    this.cab.x = (Math.random() - 0.5) * 3.2 * v;
    this.cab.y = (Math.random() - 0.5) * 2 * v;
    this.cones.forEach((c) => {
      c.x = this.cab.x;
    });
    if (p > 0.8 && !this.fired) {
      this.fired = true;
      this.ring();
    } else if (p < 0.3) {
      this.fired = false;
    }
  }

  /** A ring of sound rippling out of the bottom woofer. */
  ring() {
    const cone = this.cones[this.cones.length - 1];
    const g = this.scene.add.graphics();
    g.lineStyle(4, Theme.color.marigold, 0.8).strokeCircle(0, 0, this.coneSize * 0.45);
    g.setPosition(cone.x, cone.y);
    this.add(g);
    this.scene.tweens.add({
      targets: g,
      scale: 2.3,
      alpha: 0,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => g.destroy()
    });
  }

  /** Rounded-rectangle path (CanvasRenderingContext2D.roundRect is not in older browsers). */
  static rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  /** Cabinet: dark wood box, marigold trim, grille cloth texture, little feet. */
  static paintCabinet(scene, w, h, woofers) {
    const key = `spk-cab-${Theme.key}-${w}x${h}-${woofers}`;
    if (scene.textures.exists(key)) return key;
    const tex = scene.textures.createCanvas(key, w + 8, h + 12);
    const c = tex.getContext();
    const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
    const C = Theme.color;
    c.translate(4, 4);
    c.fillStyle = 'rgba(0,0,0,0.45)';
    Speaker.rr(c, 3, 6, w, h, 12);
    c.fill();
    const wood = c.createLinearGradient(0, 0, w, 0);
    wood.addColorStop(0, '#120c10');
    wood.addColorStop(0.5, '#2a2126');
    wood.addColorStop(1, '#0d080b');
    c.fillStyle = wood;
    Speaker.rr(c, 0, 0, w, h, 12);
    c.fill();
    c.strokeStyle = hex(C.marigoldShade);
    c.lineWidth = 3;
    Speaker.rr(c, 4, 4, w - 8, h - 8, 9);
    c.stroke();
    // Grille cloth: fine dots
    c.fillStyle = 'rgba(255,255,255,0.05)';
    for (let yy = 12; yy < h - 10; yy += 5) {
      for (let xx = 12; xx < w - 10; xx += 5) c.fillRect(xx, yy, 1.5, 1.5);
    }
    // Feet
    c.fillStyle = '#050304';
    c.fillRect(10, h, 18, 6);
    c.fillRect(w - 28, h, 18, 6);
    // Badge
    c.fillStyle = hex(C.marigold);
    Speaker.rr(c, w / 2 - 14, h - 16, 28, 7, 3);
    c.fill();
    tex.refresh();
    return key;
  }

  /** Cone: rubber surround, ribbed paper cone, shiny dust cap. */
  static paintCone(scene, size) {
    const key = `spk-cone-${size}`;
    if (scene.textures.exists(key)) return key;
    const tex = scene.textures.createCanvas(key, size, size);
    const c = tex.getContext();
    const r = size / 2;
    const surround = c.createRadialGradient(r, r, r * 0.7, r, r, r);
    surround.addColorStop(0, '#1b1518');
    surround.addColorStop(0.6, '#3a3036');
    surround.addColorStop(1, '#0a0608');
    c.fillStyle = surround;
    c.beginPath();
    c.arc(r, r, r, 0, Math.PI * 2);
    c.fill();
    const cone = c.createRadialGradient(r * 0.8, r * 0.75, r * 0.05, r, r, r * 0.8);
    cone.addColorStop(0, '#4a4046');
    cone.addColorStop(0.7, '#1e181b');
    cone.addColorStop(1, '#141013');
    c.fillStyle = cone;
    c.beginPath();
    c.arc(r, r, r * 0.8, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.07)';
    c.lineWidth = 1.2;
    [0.35, 0.5, 0.65].forEach((f) => {
      c.beginPath();
      c.arc(r, r, r * f, 0, Math.PI * 2);
      c.stroke();
    });
    const cap = c.createRadialGradient(r * 0.85, r * 0.8, 1, r, r, r * 0.26);
    cap.addColorStop(0, '#d8d0d4');
    cap.addColorStop(0.4, '#6a6066');
    cap.addColorStop(1, '#231c20');
    c.fillStyle = cap;
    c.beginPath();
    c.arc(r, r, r * 0.26, 0, Math.PI * 2);
    c.fill();
    tex.refresh();
    return key;
  }
}
