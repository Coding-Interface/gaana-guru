/**
 * Marquee — a cinema sign: maroon board, metal frame and a ring of real light bulbs
 * that chase around it in the theme's bulb colours.
 */
class Marquee extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, title, { size = 96, sub = '' } = {}) {
    super(scene, x, y);
    const C = Theme.color;
    this.w = w;
    this.h = h;

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.4).fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 26);
    g.fillStyle(C.marigoldShade, 1).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 26);
    g.fillStyle(C.marigold, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 26);
    g.fillStyle(0xffffff, 0.18).fillRoundedRect(-w / 2 + 6, -h / 2 + 4, w - 12, 10, 6);
    g.fillStyle(C.deep, 1).fillRoundedRect(-w / 2 + 36, -h / 2 + 36, w - 72, h - 72, 14);
    g.lineStyle(3, 0x000000, 0.35).strokeRoundedRect(-w / 2 + 36, -h / 2 + 36, w - 72, h - 72, 14);
    this.add(g);

    const inset = 18;
    this.lights = new BulbRing(scene, BulbRing.rect(-w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, 38), {
      size: 17,
      colors: (Theme.current || THEMES.cinema).bulbs,
      pattern: 'chase',
      speed: 150,
      parent: this
    });

    this.title = scene.add
      .text(0, sub ? -12 : 4, title, Theme.text(size, { fontFamily: Theme.font.display, color: Theme.css.cream }))
      .setOrigin(0.5);
    this.title.setShadow(0, 6, '#B02C5C', 0, false, true);
    while (this.title.width > w - 110 && size > 28) {
      size -= 4;
      this.title.setFontSize(size);
    }
    this.add(this.title);

    if (sub) {
      this.sub = scene.add
        .text(0, h / 2 - 56, sub, Theme.text(20, { fontStyle: '800', color: Theme.css.marigold, letterSpacing: 4 }))
        .setOrigin(0.5);
      this.add(this.sub);
    }
    scene.add.existing(this);
  }

  flash(times = 3) {
    this.lights.flash(times);
  }
}
