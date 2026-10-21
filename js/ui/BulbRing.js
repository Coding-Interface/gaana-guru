/**
 * BulbRing — a string of real-looking light bulbs: socket, glass bulb, lit core and halo.
 * Bulbs follow any list of points (a circle, a rectangle, a sagging garland).
 *
 * With several colours, the colours travel along the string as it chases, so a marquee
 * glows gold, ruby, sapphire and emerald in turn instead of one flat colour.
 *
 * Patterns:  'chase'    every third bulb dark, marching along
 *            'alternate' odd/even swap
 *            'twinkle'  random bulbs fade in and out (fairy lights)
 *            'all'      everything on
 *
 * bare: true draws just the glowing bulbs, with no dark socket or glass: an unlit bulb
 * stays a dim coloured bead (the wheel rim and the clue header use this).
 *
 * Coloured bulb textures come from Effects.tinted, so they work on WebGL and Canvas.
 */
class BulbRing {
  constructor(scene, points, { size = 18, colors = [0xffd98a], pattern = 'chase', speed = 160, depth = 5, parent = null, cycle = true, bare = false } = {}) {
    this.scene = scene;
    this.bare = bare;
    this.offAlpha = bare ? 0.32 : 0.08;
    this.pattern = pattern;
    this.colors = colors;
    this.cycle = cycle && colors.length > 1 && pattern !== 'twinkle';
    this.bulbs = [];
    this.offset = 0;
    this.items = [];
    this.coreKeys = colors.map((c) => Effects.tinted(scene, 'fx-bulb-on', BulbRing.lighten(c)));
    this.haloKeys = colors.map((c) => Effects.tinted(scene, 'fx-glow', c));
    const glowSize = size * 3.2;

    points.forEach(([x, y], i) => {
      const k = i % colors.length;
      const core = scene.add.image(x, y, this.coreKeys[k]).setDisplaySize(size, size);
      const halo = scene.add.image(x, y, this.haloKeys[k]).setDisplaySize(glowSize, glowSize).setBlendMode(Phaser.BlendModes.ADD);
      const bulb = { core, halo, on: true, k };
      this.bulbs.push(bulb);
      if (bare) {
        this.items.push(halo, core);
      } else {
        const socket = scene.add.circle(x, y + size * 0.45, size * 0.32, 0x1a1012);
        const glass = scene.add.image(x, y, 'fx-bulb').setDisplaySize(size, size);
        this.items.push(halo, socket, glass, core);
      }
    });
    if (parent) parent.add(this.items);
    else this.items.forEach((o) => o.setDepth(depth));

    this.apply();
    if (!Theme.reducedMotion) {
      this.timer = scene.time.addEvent({ delay: speed, loop: true, callback: () => this.step() });
    }
  }

  static lighten(color) {
    const r = Math.min(255, ((color >> 16) & 255) + 90);
    const g = Math.min(255, ((color >> 8) & 255) + 90);
    const b = Math.min(255, (color & 255) + 90);
    return (r << 16) | (g << 8) | b;
  }

  /** Points around a circle. */
  static circle(cx, cy, r, n) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
  }

  /** Points around a rectangle (clockwise from the top-left). */
  static rect(x, y, w, h, step) {
    const pts = [];
    const nx = Math.max(2, Math.round(w / step));
    const ny = Math.max(2, Math.round(h / step));
    for (let i = 0; i < nx; i++) pts.push([x + (w * i) / nx, y]);
    for (let i = 0; i < ny; i++) pts.push([x + w, y + (h * i) / ny]);
    for (let i = 0; i < nx; i++) pts.push([x + w - (w * i) / nx, y + h]);
    for (let i = 0; i < ny; i++) pts.push([x, y + h - (h * i) / ny]);
    return pts;
  }

  /** Points along a straight line. */
  static line(x1, y1, x2, y2, n) {
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    });
  }

  /** Points along a sagging garland between two anchors. */
  static garland(x1, y1, x2, y2, sag, n) {
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag];
    });
  }

  isOn(i) {
    switch (this.pattern) {
      case 'alternate':
        return (i + this.offset) % 2 === 0;
      case 'all':
        return true;
      case 'off':
        return false;
      case 'twinkle':
        return this.bulbs[i].on;
      default:
        return (i + this.offset) % 3 !== 0;
    }
  }

  step() {
    // The bulbs went away with their container: stop the timer.
    if (!this.bulbs.length || !this.bulbs[0].core.active) {
      this.destroy();
      return;
    }
    this.offset += 1;
    if (this.pattern === 'twinkle') {
      const b = this.bulbs[Math.floor(Math.random() * this.bulbs.length)];
      b.on = !b.on;
    }
    this.apply();
  }

  /** Colours march one bulb every other step. */
  recolor() {
    if (!this.cycle) return;
    const n = this.colors.length;
    const shift = Math.floor(this.offset / 2);
    this.bulbs.forEach((b, i) => {
      const k = (((i - shift) % n) + n) % n;
      if (k === b.k) return;
      b.k = k;
      b.core.setTexture(this.coreKeys[k]);
      b.halo.setTexture(this.haloKeys[k]);
    });
  }

  apply() {
    this.recolor();
    this.bulbs.forEach((b, i) => {
      const on = this.isOn(i);
      if (this.pattern === 'twinkle') {
        this.scene.tweens.add({ targets: [b.core, b.halo], alpha: on ? 1 : 0.1, duration: 300 });
      } else {
        b.core.setAlpha(on ? 1 : this.offAlpha);
        b.halo.setAlpha(on ? 0.9 : 0);
      }
    });
  }

  destroy() {
    if (this.timer) this.timer.remove();
    this.timer = null;
  }

  setPattern(pattern, speed) {
    this.pattern = pattern;
    if (speed && this.timer) this.timer.delay = speed;
    this.apply();
  }

  setSpeed(ms) {
    if (this.timer) this.timer.delay = ms;
  }

  /** Every bulb flashes on and off a few times (a big moment). */
  flash(times = 3) {
    if (Theme.reducedMotion) return;
    const prev = this.pattern;
    let n = 0;
    const tick = () => {
      if (!this.scene || !this.scene.sys.isActive()) return;
      const on = n % 2 === 0;
      this.bulbs.forEach((b) => {
        b.core.setAlpha(on ? 1 : this.offAlpha);
        b.halo.setAlpha(on ? 1 : 0);
      });
      n += 1;
      if (n < times * 2) this.scene.time.delayedCall(110, tick);
      else {
        this.pattern = prev;
        this.apply();
      }
    };
    tick();
  }
}
