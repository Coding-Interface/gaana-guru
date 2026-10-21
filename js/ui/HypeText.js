/**
 * HypeText — a big poster-style word that slams in, holds and floats away
 * ("Lights!", "Camera!", "Action!", "Zabardast!", "Flop!").
 */
class HypeText {
  static pop(scene, x, y, text, { color = Theme.css.marigold, size = 96, angle = -6, hold = 650, depth = 38 } = {}) {
    const t = scene.add
      .text(x, y, text, Theme.text(size, { fontFamily: Theme.font.display, color, stroke: Theme.css.ink, strokeThickness: 12 }))
      .setOrigin(0.5)
      .setDepth(depth)
      .setAngle(angle);
    t.setShadow(0, 8, '#000000', 0, true, true);
    const fit = Math.min(1, (Layout.current.W - 60) / t.width);

    if (Theme.reducedMotion) {
      t.setScale(fit);
      scene.time.delayedCall(hold + 300, () => t.destroy());
      return t;
    }
    t.setScale(fit * 2.6).setAlpha(0);
    scene.tweens.add({ targets: t, scale: fit, alpha: 1, duration: 220, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: t, scale: fit * 1.08, duration: hold, delay: 220, ease: 'Sine.easeInOut' });
    scene.tweens.add({ targets: t, alpha: 0, y: y - 50, duration: 260, delay: 220 + hold, onComplete: () => t.destroy() });
    return t;
  }

  /** The cheer for a solve, by combo length and speed. */
  static wordFor(combo, fast, clean) {
    if (!clean) return 'Hit!';
    if (combo >= 5) return 'Blockbuster!';
    if (combo === 4) return 'Kamaal!';
    if (combo === 3) return 'Shandaar!';
    if (combo === 2) return 'Zabardast!';
    return fast ? 'Superhit!' : 'Hit!';
  }
}
