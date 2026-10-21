/**
 * IconButton — round toggle with a Lucide icon and a short label underneath.
 * setOff(true) draws a slash and dims it (for "sound off" / "music off").
 * A tap clicks like a camera shutter unless setSound(false) (the action has its own sound).
 */
class IconButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, size, iconKey, label = '') {
    super(scene, x, y);
    const C = Theme.color;
    const r = size / 2;
    this.r = r;
    this.onClick = null;
    this.sound = true;

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.3).fillCircle(0, 4, r);
    this.bg.fillStyle(C.panel, 1).fillCircle(0, 0, r);
    this.bg.lineStyle(2, C.panelEdge, 1).strokeCircle(0, 0, r);
    this.img = scene.add.image(0, 0, iconKey).setDisplaySize(size * 0.46, size * 0.46);
    this.slash = scene.add.graphics();
    this.slash.lineStyle(4, C.rose, 1).lineBetween(-r * 0.45, -r * 0.45, r * 0.45, r * 0.45);
    this.slash.setVisible(false);
    this.label = scene.add.text(0, r + 16, label, Theme.text(16, { fontStyle: '800', color: Theme.css.muted, letterSpacing: 2 })).setOrigin(0.5);

    this.zone = scene.add.zone(0, 0, size, size).setInteractive({ useHandCursor: true });
    this.zone.on('pointerup', () => {
      if (!this.onClick) return;
      if (this.sound) Sfx.shared.ui();
      this.onClick();
    });

    this.add([this.bg, this.img, this.slash, this.label, this.zone]);
    scene.add.existing(this);
  }

  setOff(off) {
    this.slash.setVisible(off);
    this.img.setAlpha(off ? 0.5 : 1);
    return this;
  }

  setIcon(key) {
    this.img.setTexture(key);
    return this;
  }

  setSound(on) {
    this.sound = on;
    return this;
  }

  setOnClick(fn) {
    this.onClick = fn;
    return this;
  }
}
