/**
 * ClueCard — the emoji clue on a cream card, drawn with Twemoji images so it looks
 * the same on every phone. Falls back to system emoji if an image is missing.
 *
 * The header is a little show of its own: a glossy band blending the era colour into
 * magenta, violet and teal, a glint sweeping across it, chasing mini bulbs along its edge,
 * the era name in the poster font, and an equaliser with a dancing note that bounce to the
 * music (that is the "decode the song" sign, no words needed).
 * Shows the film name at the bottom when the film hint is used.
 */
class ClueCard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, song, eraKey, animate = true) {
    super(scene, x, y);
    const C = Theme.color;
    const era = ERAS[eraKey];
    const calm = Theme.reducedMotion;

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.3).fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 24);
    g.fillStyle(C.cream, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 24);
    this.add(g);

    // Header band
    const hw = w - 20;
    const hh = 52;
    const hx = -w / 2 + 10;
    const hy = -h / 2 + 10;
    const band = scene.add.image(hx, hy, ClueCard.paintHeader(scene, eraKey, hw, hh)).setOrigin(0);
    this.add(band);
    if (scene.textures.exists('fx-shine')) {
      this.shine = scene.add.tileSprite(hx + 6, hy + 2, hw - 12, hh - 8, 'fx-shine').setOrigin(0).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.9);
      this.add(this.shine);
    }
    this.bulbs = new BulbRing(scene, BulbRing.line(hx + 18, hy + hh + 1, hx + hw - 18, hy + hh + 1, Math.max(8, Math.round(hw / 34))), {
      size: 9,
      colors: (Theme.current || THEMES.cinema).bulbs,
      pattern: 'chase',
      speed: 130,
      parent: this,
      bare: true
    });
    this.once('destroy', () => this.bulbs.destroy());

    const name = scene.add.text(hx + 20, hy + hh / 2, era.name, Theme.text(w >= 600 ? 34 : 30, { fontFamily: Theme.font.display, color: Theme.css.cream, stroke: '#2A0A14', strokeThickness: 5 }));
    name.setOrigin(0, 0.5).setShadow(0, 3, '#000000', 2, true, true);
    const years = scene.add.text(name.x + name.width + 12, hy + hh / 2 + 2, era.years, Theme.text(17, { fontStyle: '800', color: Theme.css.marigold, letterSpacing: 1, stroke: '#2A0A14', strokeThickness: 4 }));
    years.setOrigin(0, 0.5);
    this.add([name, years]);

    // Equaliser + dancing note on the right
    const eqRight = hx + hw - 18;
    this.eq = scene.add.graphics();
    this.eqBars = 5;
    this.eqLevels = new Array(this.eqBars).fill(0.3);
    this.eqColors = [0x7ee3b0, 0xfff1d6, 0xffd23f, 0xff7ba6, 0x4fd8c9];
    this.eqBox = { x: eqRight - this.eqBars * 11, y: hy + hh - 10, h: hh - 18 };
    this.add(this.eq);
    const noteKey = EmojiCodes.keyFor('🎵');
    if (scene.textures.exists(noteKey)) {
      this.note = scene.add.image(this.eqBox.x - 26, hy + hh / 2, noteKey).setDisplaySize(38, 38);
      this.note.base = this.note.scale;
      this.add(this.note);
    }
    this.drawEq(0, calm);

    if (!calm) {
      const tick = (time, delta) => {
        if (!this.active) return;
        if (this.shine) this.shine.tilePositionX -= delta * 0.25;
        this.drawEq(time, false);
      };
      scene.events.on('update', tick);
      this.once('destroy', () => scene.events.off('update', tick));
    }

    // Emoji clue
    const chars = EmojiCodes.split(song.e);
    const n = chars.length;
    const gap = 16;
    const size = Math.floor(Math.min(112, h - 128, (w - 60 - gap * (n - 1)) / n));
    const x0 = -(n * size + (n - 1) * gap) / 2 + size / 2;
    const ey = 14;
    chars.forEach((ch, i) => {
      const key = EmojiCodes.keyFor(ch);
      const px = x0 + i * (size + gap);
      let obj;
      if (scene.textures.exists(key)) {
        obj = scene.add.image(px, ey, key).setDisplaySize(size, size);
      } else {
        obj = scene.add.text(px, ey, ch, { fontFamily: Theme.font.emoji, fontSize: `${Math.round(size * 0.85)}px`, resolution: 2 }).setOrigin(0.5);
      }
      this.add(obj);
      if (animate && !calm) {
        const sx = obj.scaleX;
        const sy = obj.scaleY;
        obj.setScale(0);
        scene.tweens.add({ targets: obj, scaleX: sx, scaleY: sy, duration: 380, delay: 120 + i * 110, ease: 'Back.easeOut' });
      }
    });

    this.filmName = song.f;
    this.film = scene.add.text(0, h / 2 - 26, '', Theme.text(22, { fontStyle: '700', color: Theme.css.inkSoft, align: 'center' })).setOrigin(0.5);
    this.maxFilmW = w - 40;
    this.add(this.film);
    scene.add.existing(this);
  }

  drawEq(time, still) {
    const p = still ? 0.4 : FilmiScore.shared.pulse();
    const idle = FilmiScore.shared.playing ? 0 : 0.25 + 0.2 * Math.sin(time / 300);
    const g = this.eq.clear();
    const { x, y, h } = this.eqBox;
    for (let i = 0; i < this.eqBars; i++) {
      const shape = 0.55 + 0.45 * Math.sin(i * 1.3 + time / 210);
      const target = Math.max(idle, (0.2 + 0.8 * p) * shape);
      this.eqLevels[i] += (target - this.eqLevels[i]) * 0.4;
      const bh = 4 + this.eqLevels[i] * h;
      g.fillStyle(0x2a0a14, 0.45).fillRoundedRect(x + i * 11 + 1, y - bh + 2, 8, bh, 2);
      g.fillStyle(this.eqColors[i % this.eqColors.length], 1).fillRoundedRect(x + i * 11, y - bh, 8, bh, 2);
    }
    if (this.note) {
      this.note.setScale(this.note.base * (1 + 0.22 * p));
      this.note.angle = Math.sin(time / 260) * 10;
    }
  }

  showFilm(animate = true) {
    this.film.setText(`from the film  ${this.filmName}`);
    Theme.clip(this.film, this.maxFilmW);
    if (animate) this.scene.tweens.add({ targets: this.film, alpha: { from: 0, to: 1 }, duration: 240 });
  }

  /** Glossy header band: era colour → magenta → violet → teal, with a top highlight. */
  static paintHeader(scene, eraKey, w, h) {
    const key = `clue-head-${Theme.key}-${eraKey}-${w}`;
    if (scene.textures.exists(key)) return key;
    const C = Theme.color;
    const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
    const tex = scene.textures.createCanvas(key, w, h);
    const c = tex.getContext();
    const r = 14;
    const path = () => {
      c.beginPath();
      c.moveTo(r, 0);
      c.arcTo(w, 0, w, h, r);
      c.arcTo(w, h, 0, h, r);
      c.arcTo(0, h, 0, 0, r);
      c.arcTo(0, 0, w, 0, r);
      c.closePath();
    };
    const era = C[ERAS[eraKey].fill];
    const grad = c.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, hex(SpinWheel.shade(era, -0.45)));
    grad.addColorStop(0.3, hex(SpinWheel.shade(era, -0.15)));
    grad.addColorStop(0.58, hex(C.magentaShade));
    grad.addColorStop(0.8, '#6A2FC0');
    grad.addColorStop(1, hex(C.tealShade));
    path();
    c.fillStyle = grad;
    c.fill();
    c.save();
    path();
    c.clip();
    const gloss = c.createLinearGradient(0, 0, 0, h);
    gloss.addColorStop(0, 'rgba(255,255,255,0.22)');
    gloss.addColorStop(0.46, 'rgba(255,255,255,0.04)');
    gloss.addColorStop(0.5, 'rgba(0,0,0,0.08)');
    gloss.addColorStop(1, 'rgba(0,0,0,0.3)');
    c.fillStyle = gloss;
    c.fillRect(0, 0, w, h);
    // Sparkle dots
    for (let i = 0; i < 26; i++) {
      c.fillStyle = `rgba(255,255,255,${0.15 + (i % 4) * 0.08})`;
      c.beginPath();
      c.arc(((i * 97) % w), 6 + ((i * 53) % (h - 12)), 1 + (i % 3) * 0.6, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    path();
    c.strokeStyle = 'rgba(42,10,20,0.35)';
    c.lineWidth = 2;
    c.stroke();
    tex.refresh();
    return key;
  }
}
