/**
 * Spotlights — stage lamps hanging from the lighting rig, each a different colour, shining
 * down and sweeping across the stage. Where a beam hits the floor it throws a pool of light
 * that slides along with it, like a real stage or a film set.
 *
 *   burst()        flare every beam for a big moment
 *   setPace(k)     sweep faster (wheel spinning) or calmer
 *   setColor(c)    the centre lamp takes a colour (the landed era); the others keep the theme's
 *   hitPoint(i, f) a point along beam i (f = 1 is the floor), used by LightRig for Light2D lights
 *
 * Coloured copies of the beam and pool textures come from Effects.tinted, so the colours show
 * on both WebGL and Canvas.
 */
class Spotlights {
  constructor(scene, { count = 3, alpha = 0.16, depth = -5, colors = null } = {}) {
    this.scene = scene;
    this.alpha = alpha;
    this.beams = [];
    this.pools = [];
    this.lamps = [];
    this.tweens = [];
    this.colors = [];
    const { W, H } = Layout.current;
    this.W = W;
    this.H = H;
    this.lampY = -6;
    this.floorY = H * 0.94;
    const theme = Theme.current || THEMES.cinema;
    const palette = colors || theme.spots || [theme.spot];
    const xs = count === 2 ? [0.2, 0.8] : [0.14, 0.5, 0.86];
    const big = Math.max(W, H);

    xs.slice(0, count).forEach((fx, i) => {
      const color = palette[i % palette.length];
      this.colors.push(color);
      const x = W * fx;
      // Lean the side lamps towards the middle; local +y runs down the beam.
      const lean = fx < 0.5 ? -14 : fx > 0.5 ? 14 : 0;
      const beam = scene.add
        .image(x, this.lampY, Effects.tinted(scene, 'fx-beam', color))
        .setOrigin(0.5, 0)
        .setDisplaySize(big * 0.4, H * 1.12)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(alpha)
        .setAngle(lean)
        .setDepth(depth);
      const pool = scene.add
        .image(x, this.floorY, Effects.tinted(scene, 'fx-pool', color))
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(depth)
        .setAlpha(alpha * 2.4);
      const lamp = this.drawLamp(x, color, depth + 1);
      this.beams.push(beam);
      this.pools.push(pool);
      this.lamps.push(lamp);
      if (!Theme.reducedMotion) {
        this.tweens.push(
          scene.tweens.add({
            targets: beam,
            angle: { from: lean - 20, to: lean + 20 },
            duration: 2600 + i * 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: i * 300
          })
        );
      }
    });

    const update = () => this.update();
    scene.events.on('update', update);
    scene.events.once('shutdown', () => scene.events.off('update', update));
    this.update();
  }

  /** A small lamp housing with a glowing lens, peeking from the top edge. */
  drawLamp(x, color, depth) {
    const sc = this.scene;
    const g = sc.add.graphics().setDepth(depth);
    g.fillStyle(0x0b0709, 0.95).fillRoundedRect(x - 22, -16, 44, 26, 7);
    g.fillStyle(0x2a2226, 1).fillRect(x - 26, -18, 52, 6);
    const lens = sc.add
      .image(x, 9, Effects.tinted(sc, 'fx-glow', color))
      .setDisplaySize(46, 46)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(depth);
    return { g, lens };
  }

  /** Where beam i points, at fraction f of the way from the lamp to the floor. */
  hitPoint(i, f = 1) {
    const beam = this.beams[i];
    const a = Phaser.Math.DegToRad(beam.angle);
    const t = ((this.floorY - this.lampY) / Math.max(0.2, Math.cos(a))) * f;
    return { x: beam.x - Math.sin(a) * t, y: this.lampY + Math.cos(a) * t };
  }

  update() {
    this.beams.forEach((beam, i) => {
      const pool = this.pools[i];
      const p = this.hitPoint(i, 1);
      const w = this.W * 0.36 * (1 + Math.abs(Math.sin(Phaser.Math.DegToRad(beam.angle))) * 0.6);
      pool.setPosition(p.x, this.floorY).setDisplaySize(w, w * 0.26);
      pool.setAlpha(Math.min(1, beam.alpha * 2.4));
      this.lamps[i].lens.setAlpha(Math.min(1, 0.45 + beam.alpha * 2.5));
    });
  }

  burst(peak = 0.55, duration = 700) {
    this.beams.forEach((b) => {
      this.scene.tweens.add({ targets: b, alpha: { from: peak, to: this.alpha }, duration, ease: 'Quad.easeOut' });
    });
  }

  setPace(scale) {
    this.tweens.forEach((t) => {
      t.timeScale = scale;
    });
  }

  /** The centre lamp (or the first of two) takes this colour. */
  setColor(color) {
    const i = this.beams.length === 3 ? 1 : 0;
    this.setLampColor(i, color);
  }

  setLampColor(i, color) {
    if (!this.beams[i]) return;
    this.colors[i] = color;
    this.beams[i].setTexture(Effects.tinted(this.scene, 'fx-beam', color));
    this.pools[i].setTexture(Effects.tinted(this.scene, 'fx-pool', color));
    this.lamps[i].lens.setTexture(Effects.tinted(this.scene, 'fx-glow', color));
    if (this.onColor) this.onColor(i, color);
  }
}
