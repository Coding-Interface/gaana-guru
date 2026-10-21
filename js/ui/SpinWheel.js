/**
 * SpinWheel — a glossy prize wheel on a stand, ringed with real bulbs.
 *
 * Play:   drag it round with a finger or mouse; flick to spin (a harder flick spins longer).
 *         A tap or Space also spins. Before the first spin it drifts gently and a hand
 *         shows the swipe. A weak flick wobbles back.
 * Result: spin(index, onDone, { power, dir }) always lands on the given segment, so the
 *         scene (and the daily seed) decides the result; the player decides the drama.
 *
 * The face, rim, gloss and hub are painted once into textures (gradients, gold dividers,
 * pegs, era names and modifier icons). The flapper kicks on every peg with a wooden clack,
 * and a rolling sound (ReelRoll) follows the wheel's speed; onSpeed(s) lets the scene slow
 * the music down with it.
 */
class SpinWheel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, radius, segments) {
    super(scene, x, y);
    this.radius = radius;
    this.segments = segments;
    this.count = segments.length;
    this.step = 360 / this.count;
    this.spinning = false;
    this.dragging = false;
    this.locked = false;
    this.idle = true;
    this.lastIndex = 0;
    this.onTap = null;
    this.onFling = null;
    this.onSpeed = null;

    SpinWheel.paint(scene, radius, segments);
    const tk = `-${Theme.key}-${radius}`;
    const r = radius;

    const base = scene.add.graphics();
    this.drawStand(base, r);
    this.rim = scene.add.image(0, 0, `wheel-rim${tk}`).setDisplaySize((r + 40) * 2, (r + 40) * 2);
    this.disc = scene.add.container(0, 0);
    this.face = scene.add.image(0, 0, `wheel-face${tk}`).setDisplaySize(r * 2, r * 2);
    this.glow = scene.add.graphics();
    this.disc.add([this.face, this.glow]);
    this.gloss = scene.add.image(0, 0, `wheel-gloss-${radius}`).setDisplaySize(r * 2, r * 2);
    this.hub = scene.add.image(0, 0, `wheel-hub${tk}`).setDisplaySize(132, 132);
    this.hubIcon = scene.add.image(4, 0, 'ic-play-ink').setDisplaySize(46, 46);
    this.flapper = scene.add.container(0, -r - 26);
    this.drawFlapper();

    this.add([base, this.rim, this.disc, this.gloss, this.hub, this.hubIcon, this.flapper]);
    this.bulbs = new BulbRing(scene, BulbRing.circle(0, 0, r + 20, 24), {
      size: 15,
      colors: (Theme.current || THEMES.cinema).bulbs,
      pattern: 'chase',
      speed: 170,
      parent: this,
      bare: true
    });
    this.bringToTop(this.flapper);

    this.zone = scene.add.zone(0, 0, (r + 30) * 2, (r + 30) * 2);
    this.zone.setInteractive(new Phaser.Geom.Circle(r + 30, r + 30, r + 30), Phaser.Geom.Circle.Contains);
    this.zone.input.cursor = 'grab';
    this.add(this.zone);
    this.bindInput();
    scene.add.existing(this);

    if (!Theme.reducedMotion) {
      scene.tweens.add({ targets: [this.hub, this.hubIcon], scale: '*=1.06', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    const drift = (time, delta) => {
      if (this.idle && !this.spinning && !this.dragging && !Theme.reducedMotion) this.disc.angle += delta * 0.006;
    };
    scene.events.on('update', drift);
    scene.events.once('shutdown', () => scene.events.off('update', drift));
  }

  /* ---------------- Painting ---------------- */

  static hex(c) {
    return `#${c.toString(16).padStart(6, '0')}`;
  }

  static shade(c, f) {
    const ch = (v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
    return (ch((c >> 16) & 255) << 16) | (ch((c >> 8) & 255) << 8) | ch(c & 255);
  }

  static paint(scene, radius, segments) {
    const tk = `-${Theme.key}-${radius}`;
    if (scene.textures.exists(`wheel-face${tk}`)) return;
    const k = 2;
    const R = radius * k;
    const step = (Math.PI * 2) / segments.length;
    const rad = Phaser.Math.DegToRad;

    // Face
    const face = scene.textures.createCanvas(`wheel-face${tk}`, R * 2, R * 2);
    const c = face.getContext();
    segments.forEach((seg, i) => {
      const era = ERAS[seg.era];
      const col = Theme.color[era.fill];
      const mid = rad(-90) + i * step;
      c.beginPath();
      c.moveTo(R, R);
      c.arc(R, R, R, mid - step / 2, mid + step / 2);
      c.closePath();
      const g = c.createRadialGradient(R, R, R * 0.12, R, R, R);
      g.addColorStop(0, SpinWheel.hex(SpinWheel.shade(col, 0.45)));
      g.addColorStop(0.62, SpinWheel.hex(col));
      g.addColorStop(1, SpinWheel.hex(SpinWheel.shade(col, -0.3)));
      c.fillStyle = g;
      c.fill();
    });
    // Gold dividers and pegs
    for (let i = 0; i < segments.length; i++) {
      const a = rad(-90) + i * step - step / 2;
      c.strokeStyle = 'rgba(40,20,10,0.55)';
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(R, R);
      c.lineTo(R + Math.cos(a) * R, R + Math.sin(a) * R);
      c.stroke();
      c.strokeStyle = '#F1CF73';
      c.lineWidth = 5;
      c.stroke();
      const px = R + Math.cos(a) * R * 0.94;
      const py = R + Math.sin(a) * R * 0.94;
      const pg = c.createRadialGradient(px - 4, py - 4, 1, px, py, 11);
      pg.addColorStop(0, '#FFF6D8');
      pg.addColorStop(1, '#A87B1E');
      c.fillStyle = pg;
      c.beginPath();
      c.arc(px, py, 10, 0, Math.PI * 2);
      c.fill();
    }
    // Labels: era name and modifier icon
    segments.forEach((seg, i) => {
      const era = ERAS[seg.era];
      const mod = MODIFIERS[seg.mod];
      const dark = Theme.onFill(era.fill) === Theme.css.ink;
      const mid = rad(-90) + i * step;
      c.save();
      c.translate(R + Math.cos(mid) * R * 0.74, R + Math.sin(mid) * R * 0.74);
      c.rotate(mid + Math.PI / 2);
      c.fillStyle = dark ? Theme.css.ink : Theme.css.cream;
      // Sizes follow the wheel, and the name shrinks until it fits inside its slice.
      const scale = Math.min(1, radius / 220);
      const room = 2 * R * 0.74 * Math.sin(step / 2) * 0.82;
      let fs = 32 * k * scale;
      c.font = `${fs}px "Rozha One", Georgia, serif`;
      while (c.measureText(era.short).width > room && fs > 12) {
        fs -= 1;
        c.font = `${fs}px "Rozha One", Georgia, serif`;
      }
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(era.short, 0, 0);
      c.restore();

      c.save();
      c.translate(R + Math.cos(mid) * R * 0.5, R + Math.sin(mid) * R * 0.5);
      c.rotate(mid + Math.PI / 2);
      const s = 34 * k * scale;
      if (seg.mod === 'double') {
        c.fillStyle = dark ? Theme.css.ink : Theme.css.cream;
        c.font = `800 ${28 * k * scale}px "Baloo 2", sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('×2', 0, 0);
      } else {
        const key = `ic-${mod.icon}-${dark ? 'ink' : 'cream'}`;
        if (scene.textures.exists(key)) c.drawImage(scene.textures.get(key).getSourceImage(), -s / 2, -s / 2, s, s);
      }
      c.restore();
    });
    // Centre well
    const well = c.createRadialGradient(R, R, R * 0.05, R, R, R * 0.3);
    well.addColorStop(0, 'rgba(0,0,0,0.0)');
    well.addColorStop(1, 'rgba(0,0,0,0.35)');
    c.fillStyle = well;
    c.beginPath();
    c.arc(R, R, R * 0.3, 0, Math.PI * 2);
    c.fill();
    face.refresh();

    // Metal rim
    const RR = (radius + 40) * k;
    const rim = scene.textures.createCanvas(`wheel-rim${tk}`, RR * 2, RR * 2);
    const m = rim.getContext();
    const metal = m.createLinearGradient(0, 0, 0, RR * 2);
    metal.addColorStop(0, '#FFF0B8');
    metal.addColorStop(0.35, SpinWheel.hex(Theme.color.marigold));
    metal.addColorStop(0.7, SpinWheel.hex(Theme.color.marigoldShade));
    metal.addColorStop(1, '#5A3A08');
    m.fillStyle = 'rgba(0,0,0,0.45)';
    m.beginPath();
    m.arc(RR, RR + 10, RR - 2, 0, Math.PI * 2);
    m.fill();
    m.fillStyle = metal;
    m.beginPath();
    m.arc(RR, RR, RR - 6, 0, Math.PI * 2);
    m.fill();
    // The groove the bulbs sit in: polished gold, darker towards the face, no black band.
    const grooveIn = radius * k;
    const outer = (radius + 30) * k;
    const groove = m.createRadialGradient(RR, RR, grooveIn, RR, RR, outer);
    groove.addColorStop(0, SpinWheel.hex(SpinWheel.shade(Theme.color.marigoldShade, -0.35)));
    groove.addColorStop(0.45, SpinWheel.hex(Theme.color.marigoldShade));
    groove.addColorStop(0.8, SpinWheel.hex(Theme.color.marigold));
    groove.addColorStop(1, SpinWheel.hex(SpinWheel.shade(Theme.color.marigold, 0.3)));
    m.fillStyle = groove;
    m.beginPath();
    m.arc(RR, RR, outer, 0, Math.PI * 2);
    m.fill();
    m.strokeStyle = 'rgba(255,255,255,0.35)';
    m.lineWidth = 3;
    m.beginPath();
    m.arc(RR, RR, RR - 9, Math.PI * 1.1, Math.PI * 1.9);
    m.stroke();
    rim.refresh();

    // Hub button
    const H = 66 * k;
    const hub = scene.textures.createCanvas(`wheel-hub${tk}`, H * 2, H * 2);
    const h = hub.getContext();
    const hg = h.createRadialGradient(H * 0.7, H * 0.6, H * 0.1, H, H, H);
    hg.addColorStop(0, '#FFF6D8');
    hg.addColorStop(0.5, SpinWheel.hex(Theme.color.marigold));
    hg.addColorStop(1, SpinWheel.hex(SpinWheel.shade(Theme.color.marigoldShade, -0.35)));
    h.fillStyle = hg;
    h.beginPath();
    h.arc(H, H, H - 2, 0, Math.PI * 2);
    h.fill();
    const inner = h.createRadialGradient(H * 0.8, H * 0.75, 2, H, H, H * 0.72);
    inner.addColorStop(0, '#FFFFFF');
    inner.addColorStop(1, '#F1E2C0');
    h.fillStyle = inner;
    h.beginPath();
    h.arc(H, H, H * 0.72, 0, Math.PI * 2);
    h.fill();
    hub.refresh();

    // Gloss (theme independent)
    const glossKey = `wheel-gloss-${radius}`;
    if (!scene.textures.exists(glossKey)) {
      const gl = scene.textures.createCanvas(glossKey, R * 2, R * 2);
      const q = gl.getContext();
      q.save();
      q.beginPath();
      q.arc(R, R, R, 0, Math.PI * 2);
      q.clip();
      const sheen = q.createLinearGradient(0, 0, 0, R * 1.2);
      sheen.addColorStop(0, 'rgba(255,255,255,0.32)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      q.fillStyle = sheen;
      q.beginPath();
      q.ellipse(R, R * 0.45, R * 0.95, R * 0.62, 0, 0, Math.PI * 2);
      q.fill();
      q.fillStyle = 'rgba(255,255,255,0.4)';
      q.beginPath();
      q.ellipse(R * 0.55, R * 0.42, R * 0.16, R * 0.07, -0.6, 0, Math.PI * 2);
      q.fill();
      q.restore();
      gl.refresh();
    }
  }

  drawStand(g, r) {
    const C = Theme.color;
    g.fillStyle(0x000000, 0.35).fillEllipse(0, r + 66, r * 1.4, 34);
    g.fillStyle(C.marigoldShade, 1);
    g.fillPoints([{ x: -r * 0.22, y: r * 0.6 }, { x: r * 0.22, y: r * 0.6 }, { x: r * 0.42, y: r + 58 }, { x: -r * 0.42, y: r + 58 }], true);
    g.fillStyle(C.marigold, 1);
    g.fillPoints([{ x: -r * 0.16, y: r * 0.6 }, { x: r * 0.06, y: r * 0.6 }, { x: r * 0.12, y: r + 58 }, { x: -r * 0.32, y: r + 58 }], true);
    g.fillStyle(C.deep, 1).fillRoundedRect(-r * 0.55, r + 50, r * 1.1, 22, 10);
    g.fillStyle(C.marigold, 1).fillRoundedRect(-r * 0.55, r + 50, r * 1.1, 6, 3);
  }

  drawFlapper() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35).fillTriangle(-20, 4, 20, 4, 0, 62);
    g.fillStyle(0xf1cf73, 1).fillTriangle(-20, -2, 20, -2, 0, 56);
    g.fillStyle(0xffffff, 0.45).fillTriangle(-14, 0, -2, 0, -2, 40);
    g.fillStyle(0xf1cf73, 1).fillCircle(0, -4, 17);
    g.fillStyle(0xe5484d, 1).fillCircle(0, -4, 10);
    g.fillStyle(0xffffff, 0.75).fillCircle(-3, -8, 3.5);
    this.flapper.add(g);
  }

  /* ---------------- Input ---------------- */

  angleTo(p) {
    // pointer.worldX/Y is only refreshed once per frame; convert the live position instead,
    // so every move event in a fast flick counts even when frames are slow.
    const w = this.scene.cameras.main.getWorldPoint(p.x, p.y);
    return Phaser.Math.RadToDeg(Math.atan2(w.y - this.y, w.x - this.x));
  }

  bindInput() {
    const sc = this.scene;
    this.zone.on('pointerover', () => {
      if (!this.spinning) this.bulbs.setSpeed(80);
    });
    this.zone.on('pointerout', () => {
      if (!this.spinning) this.bulbs.setSpeed(170);
    });
    this.zone.on('pointerdown', (p) => {
      if (this.spinning || this.locked) return;
      this.hideHint();
      this.dragging = true;
      this.dragStart = { t: p.downTime, angle: this.disc.angle };
      this.lastAngle = this.angleTo(p);
      this.samples = [];
      this.zone.input.cursor = 'grabbing';
    });
    const move = (p) => {
      if (!this.dragging) return;
      const a = this.angleTo(p);
      const d = Phaser.Math.Angle.WrapDegrees(a - this.lastAngle);
      this.lastAngle = a;
      this.disc.angle += d;
      // Real event timestamps, not the frame clock: on a slow frame several moves share one
      // frame time, which would make a fast flick read as a slow drag.
      this.samples.push({ t: p.moveTime || performance.now(), d });
      if (this.samples.length > 12) this.samples.shift();
      this.pegCheck(Math.abs(d) / 6);
    };
    const up = (p) => {
      if (!this.dragging) return;
      this.dragging = false;
      this.zone.input.cursor = 'grab';
      const now = (p && p.upTime) || performance.now();
      const recent = this.samples.filter((s) => now - s.t < 120);
      const sum = recent.reduce((acc, s) => acc + s.d, 0);
      const span = recent.length ? Math.max(16, now - recent[0].t) : 1;
      const v = sum / span; // degrees per ms
      const moved = Math.abs(Phaser.Math.Angle.WrapDegrees(this.disc.angle - this.dragStart.angle));
      if (Math.abs(v) >= 0.3) {
        if (this.onFling) this.onFling(Math.min(1, Math.abs(v) / 2.2), Math.sign(v));
      } else if (moved < 4) {
        if (this.onTap) this.onTap();
      } else {
        this.wobble();
      }
    };
    sc.input.on('pointermove', move);
    sc.input.on('pointerup', up);
    sc.input.on('pointerupoutside', up);
    sc.events.once('shutdown', () => {
      sc.input.off('pointermove', move);
      sc.input.off('pointerup', up);
      sc.input.off('pointerupoutside', up);
    });
  }

  /** A flick too weak to spin: settle back with a shake. */
  wobble() {
    if (Theme.reducedMotion) return;
    this.scene.tweens.add({ targets: this.disc, angle: this.disc.angle + 6, duration: 90, yoyo: true, repeat: 1 });
    this.showHint(true);
  }

  showHint(once = false) {
    if (Theme.reducedMotion || this.locked) return;
    if (!this.hand) {
      this.hand = this.scene.add.image(0, 0, 'ic-hand-cream').setDisplaySize(64, 64).setDepth(20).setAlpha(0);
      this.add(this.hand);
    }
    const r = this.radius;
    const run = () => {
      if (!this.hand) return;
      this.hand.setPosition(r * 0.45, r * 0.2).setAlpha(0);
      this.scene.tweens.add({
        targets: this.hand,
        alpha: { from: 0, to: 1 },
        x: -r * 0.35,
        y: r * 0.55,
        duration: 900,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (this.hand) this.scene.tweens.add({ targets: this.hand, alpha: 0, duration: 250 });
        }
      });
    };
    run();
    if (!once) this.hintTimer = this.scene.time.addEvent({ delay: 2400, loop: true, callback: run });
  }

  hideHint() {
    if (this.hintTimer) this.hintTimer.remove();
    this.hintTimer = null;
    if (this.hand) {
      this.scene.tweens.killTweensOf(this.hand);
      this.hand.destroy();
      this.hand = null;
    }
  }

  /* ---------------- Spinning ---------------- */

  indexAt(angle) {
    const v = (((-angle) % 360) + 360) % 360;
    return Math.round(v / this.step) % this.count;
  }

  pegCheck(kick) {
    const idx = this.indexAt(this.disc.angle);
    if (idx === this.lastIndex) return;
    this.lastIndex = idx;
    Sfx.shared.clack(kick);
    const k = Phaser.Math.Clamp(kick, 0.4, 1);
    this.scene.tweens.add({ targets: this.flapper, angle: { from: -26 * k, to: 0 }, duration: 110, ease: 'Back.easeOut' });
  }

  setHubIcon(key) {
    if (this.scene.textures.exists(key)) this.hubIcon.setTexture(key).setDisplaySize(46, 46);
  }

  spin(target, onDone, { power = 0.6, dir = 1 } = {}) {
    if (this.spinning) return;
    this.spinning = true;
    this.idle = false;
    this.locked = true;
    this.hideHint();
    this.glow.clear();
    this.bulbs.setSpeed(45);

    const quick = Theme.reducedMotion;
    const turns = quick ? 1 : 3 + Math.round(power * 5);
    const duration = quick ? 1100 : 2600 + power * 2600;
    const jitter = Phaser.Math.FloatBetween(-this.step * 0.3, this.step * 0.3);
    const base = -target * this.step + jitter;
    const start = this.disc.angle;
    const mod = (v) => ((v % 360) + 360) % 360;
    const end = dir >= 0 ? start + turns * 360 + mod(base - start) : start - turns * 360 - mod(start - base);
    const proxy = { a: start };
    ReelRoll.shared.start();

    this.scene.tweens.add({
      targets: proxy,
      a: end,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        // Speed of a Cubic.easeOut, 1 at launch and 0 at rest: the roll, the bulbs and
        // (through onSpeed) the music all follow it, so everything slows down together.
        const s = Math.pow(1 - tween.progress, 2);
        this.disc.angle = proxy.a;
        ReelRoll.shared.set(s);
        this.bulbs.setSpeed(40 + (1 - s) * 160);
        if (this.onSpeed) this.onSpeed(s);
        this.pegCheck(s);
      },
      onComplete: () => {
        ReelRoll.shared.stop();
        this.spinning = false;
        this.bulbs.setSpeed(170);
        this.bulbs.flash(3);
        this.highlight(target);
        if (onDone) onDone(this.segments[target], target);
      }
    });
  }

  /** Show the wheel already stopped on a segment (used after a rotation). */
  setLanded(i) {
    if (i < 0) return;
    this.idle = false;
    this.locked = true;
    this.disc.angle = -i * this.step;
    this.lastIndex = i;
    this.highlight(i);
  }

  highlight(i) {
    const rad = Phaser.Math.DegToRad;
    const center = -90 + i * this.step;
    const g = this.glow.clear();
    g.lineStyle(10, 0xffffff, 0.9);
    g.beginPath();
    g.arc(0, 0, this.radius - 6, rad(center - this.step / 2), rad(center + this.step / 2), false);
    g.strokePath();
    g.fillStyle(0xffffff, 0.14);
    g.slice(0, 0, this.radius - 4, rad(center - this.step / 2), rad(center + this.step / 2), false);
    g.fillPath();
    if (!Theme.reducedMotion) this.scene.tweens.add({ targets: this.glow, alpha: { from: 0.3, to: 1 }, duration: 260, yoyo: true, repeat: 2 });
  }
}
