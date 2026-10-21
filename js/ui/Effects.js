/**
 * Effects — particles and cinema textures.
 *
 * makeTextures() draws every effect texture once, in code:
 *   fx-confetti, fx-star     particle frames (coloured, so WebGL and Canvas look the same)
 *   fx-beam                  soft spotlight cone
 *   fx-vignette(-red)        dark / red screen edges
 *   fx-grain                 film grain noise tile
 *   fx-flash                 camera-flash glow
 *   fx-filmstrip             perforated film strip tile
 *   fx-bulb, fx-bulb-on      light bulb off / lit
 *   fx-glow                  soft halo for bulbs, diyas and fireworks
 *   fx-dust, fx-snow         motes in the spotlights, snowflakes
 *   fx-powder                Holi gulal puffs (5 coloured frames)
 *   fx-reel                  metal film reel
 *   fx-pool                  pool of light on the stage floor
 *   fx-shine                 sweeping glint for shiny headers
 *
 * Effects.tinted(scene, key, colour) makes a coloured copy of any white texture.
 *
 * An Effects instance gives a scene sparks, confetti and paparazzi flashes.
 */
class Effects {
  static makeTextures(scene) {
    if (scene.textures.exists('fx-confetti')) return;
    const T = scene.textures;

    const colors = ['#F5B700', '#E8467C', '#1FB5A6', '#FFF1D6', '#5FD39A'];
    const conf = T.createCanvas('fx-confetti', colors.length * 12, 18);
    const cctx = conf.getContext();
    colors.forEach((c, i) => {
      cctx.fillStyle = c;
      cctx.fillRect(i * 12 + 1, 1, 10, 16);
      conf.add(`c${i}`, 0, i * 12, 0, 12, 18);
    });
    conf.refresh();

    const star = T.createCanvas('fx-star', 3 * 28, 28);
    const sctx = star.getContext();
    ['#FFE28A', '#FFF1D6', '#7EE3B0'].forEach((c, i) => {
      const cx = i * 28 + 14;
      sctx.fillStyle = c;
      sctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 === 0 ? 13 : 5;
        const a = (Math.PI / 5) * k - Math.PI / 2;
        sctx[k === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * r, 14 + Math.sin(a) * r);
      }
      sctx.closePath();
      sctx.fill();
      star.add(`s${i}`, 0, i * 28, 0, 28, 28);
    });
    star.refresh();

    // Spotlight cone: bright at the lamp, fading out, soft at the sides.
    const beam = T.createCanvas('fx-beam', 240, 1000);
    const b = beam.getContext();
    const fall = b.createLinearGradient(0, 0, 0, 1000);
    fall.addColorStop(0, 'rgba(255,255,255,0.95)');
    fall.addColorStop(0.45, 'rgba(255,255,255,0.35)');
    fall.addColorStop(1, 'rgba(255,255,255,0)');
    b.fillStyle = fall;
    b.beginPath();
    b.moveTo(108, 0);
    b.lineTo(132, 0);
    b.lineTo(240, 1000);
    b.lineTo(0, 1000);
    b.closePath();
    b.fill();
    b.globalCompositeOperation = 'destination-in';
    const sides = b.createLinearGradient(0, 0, 240, 0);
    sides.addColorStop(0, 'rgba(0,0,0,0)');
    sides.addColorStop(0.3, 'rgba(0,0,0,1)');
    sides.addColorStop(0.7, 'rgba(0,0,0,1)');
    sides.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = sides;
    b.fillRect(0, 0, 240, 1000);
    b.globalCompositeOperation = 'source-over';
    beam.refresh();

    const vignette = (key, rgb, edge) => {
      const v = T.createCanvas(key, 512, 512);
      const vc = v.getContext();
      const g = vc.createRadialGradient(256, 256, 120, 256, 256, 362);
      g.addColorStop(0, `rgba(${rgb},0)`);
      g.addColorStop(1, `rgba(${rgb},${edge})`);
      vc.fillStyle = g;
      vc.fillRect(0, 0, 512, 512);
      v.refresh();
    };
    vignette('fx-vignette', '16,3,8', 0.9);
    vignette('fx-vignette-red', '210,30,45', 0.9);

    const grain = T.createCanvas('fx-grain', 256, 256);
    const gctx = grain.getContext();
    const img = gctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = Math.random() < 0.5 ? Math.random() * 90 : 0;
    }
    gctx.putImageData(img, 0, 0);
    grain.refresh();

    const flash = T.createCanvas('fx-flash', 128, 128);
    const fctx = flash.getContext();
    const fg = fctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    fg.addColorStop(0, 'rgba(255,255,255,1)');
    fg.addColorStop(0.25, 'rgba(255,248,220,0.8)');
    fg.addColorStop(1, 'rgba(255,240,200,0)');
    fctx.fillStyle = fg;
    fctx.fillRect(0, 0, 128, 128);
    flash.refresh();

    const strip = T.createCanvas('fx-filmstrip', 80, 44);
    const st = strip.getContext();
    st.fillStyle = '#160409';
    st.fillRect(0, 0, 80, 44);
    st.fillStyle = '#2E0A16';
    st.fillRect(2, 12, 76, 20);
    st.fillStyle = 'rgba(255,226,138,0.22)';
    [10, 50].forEach((x) => {
      st.fillRect(x, 3, 18, 6);
      st.fillRect(x, 35, 18, 6);
    });
    strip.refresh();

    // Light bulb: dark glass with a filament and a highlight (shown when off).
    const bulb = T.createCanvas('fx-bulb', 40, 40);
    const bc = bulb.getContext();
    let bg = bc.createRadialGradient(15, 14, 2, 20, 20, 18);
    bg.addColorStop(0, 'rgba(255,255,255,0.55)');
    bg.addColorStop(0.35, 'rgba(120,100,90,0.55)');
    bg.addColorStop(1, 'rgba(40,24,24,0.9)');
    bc.fillStyle = bg;
    bc.beginPath();
    bc.arc(20, 20, 17, 0, Math.PI * 2);
    bc.fill();
    bc.strokeStyle = 'rgba(255,220,160,0.5)';
    bc.lineWidth = 1.5;
    bc.beginPath();
    bc.moveTo(14, 26);
    bc.lineTo(17, 17);
    bc.lineTo(20, 24);
    bc.lineTo(23, 17);
    bc.lineTo(26, 26);
    bc.stroke();
    bulb.refresh();

    // Lit bulb: white-hot core fading to the glass edge (tinted per bulb colour).
    const lit = T.createCanvas('fx-bulb-on', 40, 40);
    const lc = lit.getContext();
    bg = lc.createRadialGradient(17, 16, 1, 20, 20, 18);
    bg.addColorStop(0, 'rgba(255,255,255,1)');
    bg.addColorStop(0.45, 'rgba(255,250,235,0.95)');
    bg.addColorStop(1, 'rgba(255,230,190,0.85)');
    lc.fillStyle = bg;
    lc.beginPath();
    lc.arc(20, 20, 17, 0, Math.PI * 2);
    lc.fill();
    lit.refresh();

    // Soft halo for glowing things (bulbs, diyas, fireworks).
    const glow = T.createCanvas('fx-glow', 128, 128);
    const gc = glow.getContext();
    const gg = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
    gg.addColorStop(0, 'rgba(255,255,255,0.95)');
    gg.addColorStop(0.2, 'rgba(255,255,255,0.55)');
    gg.addColorStop(0.55, 'rgba(255,255,255,0.12)');
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    gc.fillStyle = gg;
    gc.fillRect(0, 0, 128, 128);
    glow.refresh();

    const soft = (key, size, rgba) => {
      const c = T.createCanvas(key, size, size);
      const x = c.getContext();
      const g2 = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g2.addColorStop(0, rgba);
      g2.addColorStop(1, rgba.replace(/[\d.]+\)$/, '0)'));
      x.fillStyle = g2;
      x.fillRect(0, 0, size, size);
      c.refresh();
    };
    soft('fx-dust', 12, 'rgba(255,240,200,0.9)');
    soft('fx-snow', 16, 'rgba(255,255,255,0.95)');

    // Holi powder puffs, one coloured frame each.
    const puffColors = ['255,79,163', '255,210,63', '61,220,132', '41,197,255', '255,138,61'];
    const puff = T.createCanvas('fx-powder', puffColors.length * 96, 96);
    const pc = puff.getContext();
    puffColors.forEach((rgb, i) => {
      const g3 = pc.createRadialGradient(i * 96 + 48, 48, 0, i * 96 + 48, 48, 48);
      g3.addColorStop(0, `rgba(${rgb},0.85)`);
      g3.addColorStop(0.6, `rgba(${rgb},0.35)`);
      g3.addColorStop(1, `rgba(${rgb},0)`);
      pc.fillStyle = g3;
      pc.fillRect(i * 96, 0, 96, 96);
      puff.add(`p${i}`, 0, i * 96, 0, 96, 96);
    });
    puff.refresh();

    // Film reel: metal disc with six windows.
    const reel = T.createCanvas('fx-reel', 220, 220);
    const rc = reel.getContext();
    const rg = rc.createRadialGradient(80, 70, 10, 110, 110, 110);
    rg.addColorStop(0, '#E8E2DA');
    rg.addColorStop(0.6, '#9C948C');
    rg.addColorStop(1, '#4A4440');
    rc.fillStyle = rg;
    rc.beginPath();
    rc.arc(110, 110, 106, 0, Math.PI * 2);
    rc.fill();
    rc.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k;
      rc.beginPath();
      rc.arc(110 + Math.cos(a) * 60, 110 + Math.sin(a) * 60, 26, 0, Math.PI * 2);
      rc.fill();
    }
    rc.beginPath();
    rc.arc(110, 110, 9, 0, Math.PI * 2);
    rc.fill();
    rc.globalCompositeOperation = 'source-over';
    rc.strokeStyle = 'rgba(40,30,28,0.8)';
    rc.lineWidth = 4;
    rc.beginPath();
    rc.arc(110, 110, 104, 0, Math.PI * 2);
    rc.stroke();
    rc.beginPath();
    rc.arc(110, 110, 22, 0, Math.PI * 2);
    rc.stroke();
    reel.refresh();

    // Pool of light where a spotlight hits the stage floor (stretched into an ellipse).
    const pool = T.createCanvas('fx-pool', 256, 256);
    const plc = pool.getContext();
    const plg = plc.createRadialGradient(128, 128, 0, 128, 128, 128);
    plg.addColorStop(0, 'rgba(255,255,255,0.95)');
    plg.addColorStop(0.35, 'rgba(255,255,255,0.6)');
    plg.addColorStop(0.7, 'rgba(255,255,255,0.18)');
    plg.addColorStop(1, 'rgba(255,255,255,0)');
    plc.fillStyle = plg;
    plc.fillRect(0, 0, 256, 256);
    pool.refresh();

    // Diagonal glint that sweeps across shiny headers (tiled, mostly transparent).
    const shine = T.createCanvas('fx-shine', 512, 64);
    const shc = shine.getContext();
    const shg = shc.createLinearGradient(0, 0, 512, 0);
    shg.addColorStop(0, 'rgba(255,255,255,0)');
    shg.addColorStop(0.42, 'rgba(255,255,255,0)');
    shg.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    shg.addColorStop(0.58, 'rgba(255,255,255,0)');
    shg.addColorStop(1, 'rgba(255,255,255,0)');
    shc.fillStyle = shg;
    shc.save();
    shc.transform(1, 0, -0.5, 1, 16, 0);
    shc.fillRect(0, 0, 560, 64);
    shc.restore();
    shine.refresh();
  }

  /**
   * A coloured copy of a white texture (bulb core, halo, beam, floor pool), cached by colour.
   * Colouring the pixels works on both renderers; tint is WebGL-only.
   */
  static tinted(scene, baseKey, color) {
    const key = `${baseKey}-${color.toString(16).padStart(6, '0')}`;
    if (scene.textures.exists(key)) return key;
    const src = scene.textures.get(baseKey).getSourceImage();
    const w = src.width;
    const h = src.height;
    const tex = scene.textures.createCanvas(key, w, h);
    const c = tex.getContext();
    c.drawImage(src, 0, 0);
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'destination-in';
    c.drawImage(src, 0, 0);
    c.globalCompositeOperation = 'source-over';
    tex.refresh();
    return key;
  }

  constructor(scene) {
    this.scene = scene;
    this.sparks = scene.add
      .particles(0, 0, 'fx-star', {
        frame: ['s0', 's1', 's2'],
        speed: { min: 90, max: 240 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        rotate: { min: 0, max: 360 },
        gravityY: 260,
        lifespan: 650,
        emitting: false
      })
      .setDepth(30);
    this.confetti = scene.add
      .particles(0, 0, 'fx-confetti', {
        frame: ['c0', 'c1', 'c2', 'c3', 'c4'],
        speedX: { min: -260, max: 260 },
        speedY: { min: -820, max: -380 },
        gravityY: 820,
        rotate: { start: 0, end: 540 },
        scale: { min: 0.7, max: 1.3 },
        lifespan: 2600,
        emitting: false
      })
      .setDepth(30);
  }

  /** Read live, so switching calm mode mid-game takes effect straight away. */
  get off() {
    return Theme.reducedMotion;
  }

  sparkAt(x, y, count = 9) {
    if (!this.off) this.sparks.explode(count, x, y);
  }

  confettiAt(x, y, count = 90) {
    if (!this.off) this.confetti.explode(count, x, y);
  }

  /** A burst of press-camera flashes around the screen, with shutter clicks. */
  paparazzi(count = 8, spread = 1) {
    if (this.off) return;
    const { W, H } = Layout.current;
    for (let i = 0; i < count; i++) {
      const delay = Phaser.Math.Between(0, 700 * spread);
      this.scene.time.delayedCall(delay, () => {
        const x = Phaser.Math.Between(40, W - 40);
        const y = Phaser.Math.Between(80, H - 80);
        const f = this.scene.add.image(x, y, 'fx-flash').setDepth(31).setBlendMode(Phaser.BlendModes.ADD).setScale(0.3);
        this.scene.tweens.add({ targets: f, scale: Phaser.Math.FloatBetween(1.4, 2.4), alpha: { from: 1, to: 0 }, duration: 260, ease: 'Quad.easeOut', onComplete: () => f.destroy() });
        if (i % 2 === 0) Sfx.shared.shutter();
      });
    }
  }
}
