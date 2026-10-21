/**
 * Badge — a pill with an icon and a short value, used instead of sentences
 * ("🔥 4", "⏱ ×1.5", "🏆 920").
 */
class Badge extends Phaser.GameObjects.Container {
  constructor(scene, x, y, { icon, text = '', fill = Theme.color.panel, color = Theme.css.cream, tone = 'cream', size = 22, height = 46, edge = null } = {}) {
    super(scene, x, y);
    const iconSize = Math.round(height * 0.5);
    const label = scene.add.text(0, 1, text, Theme.text(size, { fontStyle: '800', color })).setOrigin(0, 0.5);
    const hasIcon = icon && scene.textures.exists(`ic-${icon}-${tone}`);
    const inner = (hasIcon ? iconSize : 0) + (hasIcon && text ? 8 : 0) + label.width;
    const w = Math.max(height, inner + 30);
    this.w = w;

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.25).fillRoundedRect(-w / 2, -height / 2 + 4, w, height, height / 2);
    g.fillStyle(fill, 1).fillRoundedRect(-w / 2, -height / 2, w, height, height / 2);
    if (edge !== null) g.lineStyle(2, edge, 1).strokeRoundedRect(-w / 2 + 1, -height / 2 + 1, w - 2, height - 2, height / 2);
    this.add(g);

    let cx = -inner / 2;
    if (hasIcon) {
      this.icon = scene.add.image(cx + iconSize / 2, 0, `ic-${icon}-${tone}`).setDisplaySize(iconSize, iconSize);
      this.add(this.icon);
      cx += iconSize + (text ? 8 : 0);
    }
    label.setX(cx);
    this.label = label;
    this.add(label);
    scene.add.existing(this);
  }

  /** Lay several badges out in a centred row. */
  static row(scene, cx, y, specs, gap = 12) {
    const badges = specs.map((s) => new Badge(scene, 0, y, s));
    const total = badges.reduce((sum, b) => sum + b.w, 0) + gap * (badges.length - 1);
    let x = cx - total / 2;
    badges.forEach((b) => {
      b.x = x + b.w / 2;
      x += b.w + gap;
    });
    return badges;
  }

  pop(delay = 0) {
    if (Theme.reducedMotion) return this;
    this.setScale(0);
    this.scene.tweens.add({ targets: this, scale: 1, duration: 260, delay, ease: 'Back.easeOut' });
    return this;
  }
}
