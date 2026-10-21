/**
 * TextButton — rounded button with a pressed state and an optional Lucide icon.
 * Fires onClick on release. The label shrinks to fit the button.
 * Taps make a film-set sound: opts.sound = 'ui' (camera shutter, default), 'clapper'
 * (clapperboard snap, for big "go" buttons) or null when the action plays its own sound.
 */
class TextButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, label, opts = {}) {
    super(scene, x, y);
    // Not this.w / this.h: Phaser's Transform owns `w`, and setPosition() resets it to 0,
    // which used to shrink the label of any button that was moved.
    this.btnW = w;
    this.btnH = h;
    this.opts = Object.assign(
      { fill: Theme.color.marigold, textColor: Theme.css.ink, size: 30, weight: '800', radius: 20, icon: null, iconSize: 0, sound: 'ui' },
      opts
    );
    this.enabled = true;
    this.pressed = false;
    this.onClick = null;

    this.shadow = scene.add.graphics();
    this.bg = scene.add.graphics();
    this.caption = scene.add
      .text(0, 0, label, Theme.text(this.opts.size, { fontStyle: this.opts.weight, color: this.opts.textColor, align: 'center' }))
      .setOrigin(0.5);
    this.icon = null;
    if (this.opts.icon && scene.textures.exists(this.opts.icon)) {
      const s = this.opts.iconSize || Math.round(this.opts.size * 1.05);
      this.icon = scene.add.image(0, 0, this.opts.icon).setDisplaySize(s, s);
    }
    this.zone = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });

    this.add([this.shadow, this.bg, ...(this.icon ? [this.icon] : []), this.caption, this.zone]);
    this.paint(this.opts.fill);
    this.fit();
    this.arrange(0);

    this.zone.on('pointerdown', () => {
      if (!this.enabled) return;
      this.pressed = true;
      this.setPressOffset(4);
    });
    this.zone.on('pointerout', () => {
      this.pressed = false;
      this.setPressOffset(0);
    });
    this.zone.on('pointerup', () => {
      if (!this.pressed) return;
      this.pressed = false;
      this.setPressOffset(0);
      if (!this.enabled || !this.onClick) return;
      if (this.opts.sound === 'clapper') Sfx.shared.clapper();
      else if (this.opts.sound === 'ui') Sfx.shared.ui();
      this.onClick();
    });

    scene.add.existing(this);
  }

  get iconSpace() {
    return this.icon ? this.icon.displayWidth + 12 : 0;
  }

  fit() {
    let size = this.opts.size;
    this.caption.setFontSize(size);
    while (this.caption.width > this.btnW - 40 - this.iconSpace && size > 14) {
      size -= 2;
      this.caption.setFontSize(size);
    }
  }

  arrange(dy) {
    if (this.icon) {
      const total = this.iconSpace + this.caption.width;
      const left = -total / 2;
      this.icon.setPosition(left + this.icon.displayWidth / 2, dy);
      this.caption.setPosition(left + this.iconSpace + this.caption.width / 2, dy);
    } else {
      this.caption.setPosition(0, dy);
    }
  }

  paint(fill) {
    const w = this.btnW;
    const h = this.btnH;
    const r = this.opts.radius;
    this.shadow.clear().fillStyle(0x000000, 0.3).fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);
    this.bg.clear().fillStyle(fill, 1).fillRoundedRect(-w / 2, -h / 2, w, h, r);
    return this;
  }

  setPressOffset(dy) {
    this.bg.y = dy;
    this.arrange(dy);
  }

  setLabel(label) {
    this.caption.setText(label);
    this.fit();
    this.arrange(this.bg.y);
    return this;
  }

  setIcon(key) {
    if (this.icon && this.scene.textures.exists(key)) this.icon.setTexture(key);
    return this;
  }

  setEnabled(on) {
    this.enabled = on;
    this.setAlpha(on ? 1 : 0.45);
    return this;
  }

  setOnClick(fn) {
    this.onClick = fn;
    return this;
  }
}
