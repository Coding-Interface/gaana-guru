/**
 * HudBar — icons instead of labels: ★ score on the left, hearts in the middle,
 * 🔥 combo (or 🎬 round) on the right, and a pause button in the corner.
 * Spans the current layout's width. setOnPause(fn) wires the pause button.
 */
class HudBar extends Phaser.GameObjects.Container {
  constructor(scene, run, y = 54) {
    super(scene, 0, y);
    this.run = run;
    const W = Layout.current.W;
    this.mid = W / 2;

    this.starIcon = scene.add.image(56, 0, 'ic-star-cream').setDisplaySize(30, 30).setTint(Theme.color.marigold);
    this.scoreText = scene.add.text(80, 2, '0', Theme.text(44, { fontFamily: Theme.font.display, color: Theme.css.marigold })).setOrigin(0, 0.5);
    this.hearts = scene.add.graphics();
    this.rightIcon = scene.add.image(W - 96, 0, 'ic-clapperboard-cream').setDisplaySize(30, 30).setOrigin(1, 0.5);
    this.rightText = scene.add.text(W - 136, 2, '', Theme.text(30, { fontStyle: '800', color: Theme.css.teal })).setOrigin(1, 0.5);
    this.pauseBtn = new IconButton(scene, W - 44, 0, 54, 'ic-pause-cream');

    this.add([this.starIcon, this.scoreText, this.hearts, this.rightIcon, this.rightText, this.pauseBtn]);
    this.refresh();
    scene.add.existing(this);
  }

  setOnPause(fn) {
    this.pauseBtn.setOnClick(fn);
    return this;
  }

  drawHeart(g, x, y, full) {
    const C = Theme.color;
    g.fillStyle(full ? C.rose : C.panelEdge, 1);
    g.fillCircle(x - 8, y - 4, 10);
    g.fillCircle(x + 8, y - 4, 10);
    g.fillTriangle(x - 17.5, y + 1, x + 17.5, y + 1, x, y + 20);
    if (full) g.fillStyle(0xffffff, 0.5).fillCircle(x - 10, y - 7, 3);
  }

  refresh() {
    const run = this.run;
    this.scoreText.setText(String(run.score));
    const g = this.hearts.clear();
    const n = RunState.LIVES;
    for (let i = 0; i < n; i++) this.drawHeart(g, this.mid + (i - (n - 1) / 2) * 48, 4, i < run.lives);
    if (run.combo >= 2) {
      this.rightIcon.setTexture('ic-flame-cream').setDisplaySize(32, 32).setTint(Theme.color.marigold);
      this.rightText.setText(`×${+run.comboMult.toFixed(2)}`).setColor(Theme.css.marigold);
    } else {
      this.rightIcon.setTexture('ic-clapperboard-cream').setDisplaySize(30, 30).clearTint();
      this.rightText.setText(run.isDaily ? `${run.round}/${RunState.DAILY_ROUNDS}` : String(run.round)).setColor(Theme.css.teal);
    }
  }

  popScore() {
    this.refresh();
    this.scene.tweens.add({ targets: this.scoreText, scale: { from: 1.35, to: 1 }, duration: 320, ease: 'Back.easeOut' });
  }

  loseHeart() {
    this.refresh();
    this.scene.cameras.main.shake(220, 0.006);
  }
}
