/**
 * HowToStrip — how to play as three animated tiles with one word each:
 * a spinning mini wheel ("Spin"), emoji turning into letters ("Decode"), a flame ×2 ("Combo").
 */
class HowToStrip extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w) {
    super(scene, x, y);
    const C = Theme.color;
    const gap = 16;
    const tw = (w - gap * 2) / 3;
    const th = 168;
    this.calm = Theme.reducedMotion;

    [['Spin', (cx, cy) => this.wheel(cx, cy)], ['Decode', (cx, cy) => this.decode(cx, cy)], ['Combo', (cx, cy) => this.combo(cx, cy)]].forEach(([word, art], i) => {
      const left = i * (tw + gap);
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.3).fillRoundedRect(left, 6, tw, th, 22);
      g.fillStyle(C.panel, 0.94).fillRoundedRect(left, 0, tw, th, 22);
      g.lineStyle(2, C.panelEdge, 1).strokeRoundedRect(left, 0, tw, th, 22);
      g.fillStyle(C.marigold, 1).fillCircle(left + 22, 22, 13);
      this.add(g);
      this.add(scene.add.text(left + 22, 23, String(i + 1), Theme.text(16, { fontStyle: '800', color: Theme.css.ink })).setOrigin(0.5));
      art(left + tw / 2, 70);
      this.add(scene.add.text(left + tw / 2, th - 26, word, Theme.text(22, { fontStyle: '800' })).setOrigin(0.5));
    });
    scene.add.existing(this);
  }

  wheel(cx, cy) {
    const sc = this.scene;
    const disc = sc.add.container(cx, cy);
    const g = sc.add.graphics();
    const fills = ['silver', 'magenta', 'teal', 'marigold'];
    for (let k = 0; k < 8; k++) {
      g.fillStyle(Theme.color[fills[k % 4]], 1);
      g.slice(0, 0, 40, Phaser.Math.DegToRad(k * 45), Phaser.Math.DegToRad(k * 45 + 45), false);
      g.fillPath();
    }
    g.lineStyle(4, Theme.color.marigold, 1).strokeCircle(0, 0, 41);
    g.fillStyle(Theme.color.cream, 1).fillCircle(0, 0, 10);
    disc.add(g);
    const pin = sc.add.triangle(cx, cy - 46, 0, 0, 16, 0, 8, 14, Theme.color.cream);
    this.add([disc, pin]);
    if (!this.calm) sc.tweens.add({ targets: disc, angle: 360, duration: 2600, repeat: -1, ease: 'Cubic.easeInOut' });
  }

  decode(cx, cy) {
    const sc = this.scene;
    const key = EmojiCodes.keyFor('🎬');
    const em = sc.textures.exists(key) ? sc.add.image(cx, cy - 18, key).setDisplaySize(42, 42) : sc.add.text(cx, cy - 18, '🎬', { fontSize: '36px' }).setOrigin(0.5);
    this.add(em);
    const letters = ['H', 'I', 'T'];
    letters.forEach((ch, k) => {
      const x = cx + (k - 1) * 30;
      const tile = sc.add.rectangle(x, cy + 30, 26, 26, Theme.color.deep).setStrokeStyle(2, Theme.color.marigold);
      const t = sc.add.text(x, cy + 31, ch, Theme.text(18, { fontStyle: '800', color: Theme.css.ink })).setOrigin(0.5).setAlpha(0);
      this.add([tile, t]);
      if (this.calm) {
        tile.setFillStyle(Theme.color.cream);
        t.setAlpha(1);
        return;
      }
      sc.time.addEvent({
        delay: 2400,
        loop: true,
        startAt: 2400 - 400 - k * 350,
        callback: () => {
          tile.setFillStyle(Theme.color.cream);
          sc.tweens.add({ targets: t, alpha: 1, scale: { from: 1.6, to: 1 }, duration: 220, ease: 'Back.easeOut' });
          sc.time.delayedCall(1500 - k * 200, () => {
            tile.setFillStyle(Theme.color.deep);
            t.setAlpha(0);
          });
        }
      });
    });
  }

  combo(cx, cy) {
    const sc = this.scene;
    const flame = sc.add.image(cx - 22, cy, 'ic-flame-cream').setDisplaySize(52, 52).setTint(Theme.color.marigold);
    const mult = sc.add.text(cx + 26, cy + 2, '×2', Theme.text(34, { fontFamily: Theme.font.display, color: Theme.css.marigold })).setOrigin(0.5);
    this.add([flame, mult]);
    if (!this.calm) {
      sc.tweens.add({ targets: flame, scale: flame.scale * 1.18, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      sc.tweens.add({ targets: mult, scale: 1.25, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 210 });
    }
  }
}
