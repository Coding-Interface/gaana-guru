/**
 * ResumeCard — "carry on where you left off" on the menu, for a saved game.
 *
 * Shows the run at a glance (daily/endless icon with the round, ★ score, hearts) and one big
 * Resume button. It replaces the how-to tiles for returning players, in the same spot.
 *
 *   new ResumeCard(scene, x, y, w, entry, onResume)   x, y = top-left
 */
class ResumeCard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, entry, onResume) {
    super(scene, x, y);
    const C = Theme.color;
    const run = entry.run;
    const h = 168;
    const daily = run.mode === 'daily';

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.3).fillRoundedRect(0, 6, w, h, 24);
    g.fillStyle(C.panel, 0.96).fillRoundedRect(0, 0, w, h, 24);
    g.lineStyle(3, C.marigold, 1).strokeRoundedRect(0, 0, w, h, 24);
    this.add(g);

    // Run at a glance: round, score and a pill of hearts, centred in one row.
    const chipY = 40;
    const round = new Badge(scene, 0, chipY, { icon: daily ? 'calendar-days' : 'infinity', text: daily ? `${run.round}/${RunState.DAILY_ROUNDS}` : String(run.round), fill: C.deep, edge: C.panelEdge, size: 22, height: 44 });
    const score = new Badge(scene, 0, chipY, { icon: 'star', text: String(run.score), fill: C.deep, edge: C.panelEdge, color: Theme.css.marigold, size: 22, height: 44 });
    const hearts = this.heartPill(scene, chipY, run.lives);
    const items = [round, score, hearts];
    const gap = 12;
    const total = items.reduce((sum, b) => sum + b.w, 0) + gap * (items.length - 1);
    let cx = w / 2 - total / 2;
    items.forEach((b) => {
      b.x = cx + b.w / 2;
      cx += b.w + gap;
    });
    this.add(items);

    this.btn = new TextButton(scene, w / 2, 116, w - 48, 78, 'Resume', { size: 32, icon: 'ic-play-ink', iconSize: 36, sound: 'clapper' });
    this.btn.setOnClick(onResume);
    this.add(this.btn);
    if (!Theme.reducedMotion) scene.tweens.add({ targets: this.btn, scale: 1.04, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    scene.add.existing(this);
    if (!Theme.reducedMotion) {
      this.setAlpha(0);
      scene.tweens.add({ targets: this, alpha: 1, y: { from: y + 30, to: y }, duration: 420, ease: 'Back.easeOut', delay: 200 });
    }
  }

  /** A dark pill holding one heart per life (full or empty). */
  heartPill(scene, y, lives) {
    const C = Theme.color;
    const n = RunState.LIVES;
    const spacing = 28;
    const pw = n * spacing + 24;
    const ph = 44;
    const pill = scene.add.container(0, y);
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.25).fillRoundedRect(-pw / 2, -ph / 2 + 4, pw, ph, ph / 2);
    g.fillStyle(C.deep, 1).fillRoundedRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
    g.lineStyle(2, C.panelEdge, 1).strokeRoundedRect(-pw / 2 + 1, -ph / 2 + 1, pw - 2, ph - 2, ph / 2);
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * spacing;
      g.fillStyle(i < lives ? C.rose : C.panelEdge, 1);
      g.fillCircle(x - 5, -3, 6.5);
      g.fillCircle(x + 5, -3, 6.5);
      g.fillTriangle(x - 11.5, 0, x + 11.5, 0, x, 12);
    }
    pill.add(g);
    pill.w = pw;
    return pill;
  }
}
