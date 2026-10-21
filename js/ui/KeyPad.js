/**
 * KeyPad — on-screen QWERTY letters, centred on cx.
 * Used keys turn green (in the title) or dark (not in it).
 */
class KeyPad extends Phaser.GameObjects.Container {
  constructor(scene, cx, y, onKey, { kw = 60, kh = 82, gap = 6 } = {}) {
    super(scene, 0, y);
    this.onKey = onKey;
    this.keys = {};
    this.enabled = true;

    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    rows.forEach((row, ri) => {
      const rowW = row.length * kw + (row.length - 1) * gap;
      const x0 = cx - rowW / 2 + kw / 2;
      [...row].forEach((letter, i) => {
        const x = x0 + i * (kw + gap);
        const ky = ri * (kh + 10);
        const g = scene.add.graphics({ x, y: ky });
        const t = scene.add.text(x, ky + 1, letter, Theme.text(Math.round(kh * 0.4), { fontStyle: '800', color: Theme.css.ink })).setOrigin(0.5);
        const zone = scene.add.zone(x, ky, kw, kh).setInteractive({ useHandCursor: true });
        const key = { letter, g, t, zone, state: 'idle', w: kw, h: kh, ky };
        zone.on('pointerdown', () => {
          if (!this.enabled || key.state !== 'idle') return;
          g.y = ky + 3;
          t.y = ky + 4;
        });
        zone.on('pointerout', () => {
          g.y = ky;
          t.y = ky + 1;
        });
        zone.on('pointerup', () => {
          g.y = ky;
          t.y = ky + 1;
          this.press(letter);
        });
        this.draw(key);
        this.keys[letter] = key;
        this.add([g, t, zone]);
      });
    });
    scene.add.existing(this);
  }

  draw(key) {
    const C = Theme.color;
    const { w, h } = key;
    const fill = { idle: [C.cream, C.creamShade], hit: [C.mint, C.mintShade], miss: [C.panelEdge, C.deep] }[key.state];
    const g = key.g.clear();
    g.fillStyle(fill[1], 1).fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 12);
    g.fillStyle(fill[0], 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    key.t.setColor(key.state === 'miss' ? Theme.css.muted : Theme.css.ink);
  }

  press(letter) {
    const key = this.keys[letter];
    if (!this.enabled || !key || key.state !== 'idle') return;
    if (this.onKey) this.onKey(letter);
  }

  isUsed(letter) {
    const key = this.keys[letter];
    return !key || key.state !== 'idle';
  }

  mark(letter, state, animate = true) {
    const key = this.keys[letter];
    if (!key) return;
    key.state = state;
    this.draw(key);
    if (animate && state === 'miss' && !Theme.reducedMotion) {
      this.scene.tweens.add({ targets: [key.g, key.t], angle: { from: -8, to: 0 }, duration: 260, ease: 'Elastic.easeOut' });
    }
  }

  /** Letter → state for every used key, used to rebuild after a rotation. */
  states() {
    const out = {};
    Object.values(this.keys).forEach((k) => {
      if (k.state !== 'idle') out[k.letter] = k.state;
    });
    return out;
  }

  setEnabled(on) {
    this.enabled = on;
    return this;
  }
}
