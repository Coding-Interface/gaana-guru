/**
 * TimerBar — the round clock as a filmstrip-style bar with seconds on the right.
 * w is the full width including the seconds label.
 */
class TimerBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w) {
    super(scene, x, y);
    this.x0 = x;
    this.barW = w - 92;
    this.bar = scene.add.graphics();
    this.secText = scene.add.text(w, 0, '', Theme.text(30, { fontFamily: Theme.font.display, color: Theme.css.cream })).setOrigin(1, 0.5);
    this.add([this.bar, this.secText]);
    scene.add.existing(this);
  }

  set(left, total) {
    const C = Theme.color;
    const frac = Phaser.Math.Clamp(left / total, 0, 1);
    const low = left <= 10;
    const w = this.barW;
    const g = this.bar.clear();
    g.fillStyle(C.deep, 1).fillRoundedRect(0, -14, w, 28, 14);
    if (frac > 0) g.fillStyle(low ? C.rose : C.marigold, 1).fillRoundedRect(0, -14, Math.max(28, w * frac), 28, 14);
    // Filmstrip perforations
    g.fillStyle(C.deep, 0.55);
    for (let x = 18; x < w * frac - 10; x += 26) g.fillRect(x, -4, 10, 8);
    this.secText.setText(`${Math.max(0, Math.ceil(left))}s`).setColor(low ? Theme.css.rose : Theme.css.cream);
  }

  jolt() {
    this.scene.tweens.add({ targets: this, x: { from: this.x0 + 12, to: this.x0 }, duration: 260, ease: 'Elastic.easeOut' });
  }
}
