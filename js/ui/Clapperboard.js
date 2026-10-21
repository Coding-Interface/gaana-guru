/**
 * Clapperboard — film slate that drops in before each round, snaps shut on "Action!"
 * and flies away. play() calls onClap at the snap and onDone when it has gone.
 */
class Clapperboard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, { sceneNo, take, title, sub }) {
    super(scene, x, y);
    const w = 440;
    const h = 250;
    const top = -h / 2 + 44;
    this.w = w;

    const body = scene.add.graphics();
    body.fillStyle(0x000000, 0.4).fillRoundedRect(-w / 2 + 6, top + 10, w, h - 44, 16);
    body.fillStyle(0x1b1316, 1).fillRoundedRect(-w / 2, top, w, h - 44, 16);
    this.stripes(body, -w / 2, top, w, 34, 0);
    body.lineStyle(2, 0xfff1d6, 0.7);
    body.lineBetween(-w / 2 + 16, top + 90, w / 2 - 16, top + 90);
    body.lineBetween(0, top + 44, 0, top + 90);

    const label = (tx, ty, text, size = 15) => scene.add.text(tx, ty, text, Theme.text(size, { fontStyle: '800', color: '#D9A9B4', letterSpacing: 3 }));
    const value = (tx, ty, text, size = 30) => scene.add.text(tx, ty, text, Theme.text(size, { fontFamily: Theme.font.display, color: Theme.css.cream }));
    const items = [
      label(-w / 2 + 22, top + 46, 'SCENE'),
      value(-w / 2 + 22, top + 58, sceneNo),
      label(16, top + 46, 'TAKE'),
      value(16, top + 58, take),
      scene.add.text(0, top + 128, title, Theme.text(38, { fontFamily: Theme.font.display, color: Theme.css.marigold })).setOrigin(0.5),
      scene.add.text(0, top + 172, sub, Theme.text(20, { fontStyle: '800', color: Theme.css.cream, letterSpacing: 2 })).setOrigin(0.5)
    ];
    const titleText = items[4];
    if (titleText.width > w - 40) titleText.setScale((w - 40) / titleText.width);

    // Hinged stick, pivoting at its left end.
    this.stick = scene.add.container(-w / 2, top);
    const sg = scene.add.graphics();
    this.stripes(sg, 0, -38, w, 34, 26);
    this.stick.add(sg);
    this.stick.setAngle(-28);

    this.add([body, ...items, this.stick]);
    this.setDepth(40);
    scene.add.existing(this);
  }

  stripes(g, x, y, w, h, shift) {
    g.fillStyle(0x161012, 1).fillRoundedRect(x, y, w, h, 6);
    g.fillStyle(0xfff1d6, 1);
    for (let sx = x - 40 + shift; sx < x + w; sx += 56) {
      const a = Math.max(x, sx);
      const b = Math.min(x + w, sx + 28);
      if (b <= a) continue;
      g.fillPoints([{ x: a, y: y + h }, { x: Math.min(x + w, a + 18), y }, { x: Math.min(x + w, b + 18), y }, { x: b, y: y + h }], true);
    }
  }

  play({ onClap, onDone }) {
    const sc = this.scene;
    const { H } = Layout.current;
    const y0 = this.y;
    if (Theme.reducedMotion) {
      this.stick.setAngle(0);
      if (onClap) onClap();
      sc.time.delayedCall(700, () => {
        this.destroy();
        if (onDone) onDone();
      });
      return;
    }
    this.y = y0 - H * 0.75;
    Sfx.shared.whoosh();
    sc.tweens.add({ targets: this, y: y0, angle: { from: -6, to: 0 }, duration: 360, ease: 'Back.easeOut' });
    sc.time.delayedCall(560, () => {
      sc.tweens.add({
        targets: this.stick,
        angle: 0,
        duration: 70,
        ease: 'Quad.easeIn',
        onComplete: () => {
          Sfx.shared.clap();
          if (onClap) onClap();
        }
      });
    });
    sc.time.delayedCall(1120, () => {
      sc.tweens.add({
        targets: this,
        y: y0 + H * 0.8,
        angle: 10,
        alpha: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.destroy();
          if (onDone) onDone();
        }
      });
    });
  }
}
