/**
 * LetterBoard — the song title as hidden letter tiles, word by word.
 * Punctuation shows from the start; only A–Z are guessed.
 * reveal() returns the world positions of the tiles it opened, for sparks.
 */
class LetterBoard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, maxW, title, maxH = 230) {
    super(scene, x, y);
    this.title = title;
    this.slots = [];

    const words = title.split(' ');
    let size = 50;
    let lines;
    for (;;) {
      lines = this.layout(words, size, maxW);
      const height = lines.length * (size + 14) - 14;
      const widest = Math.max(...lines.map((l) => l.width));
      if ((height <= maxH && widest <= maxW) || size <= 28) break;
      size -= 4;
    }
    this.size = size;

    const lineH = size + 14;
    const totalH = lines.length * lineH - 14;
    lines.forEach((line, li) => {
      let cx = -line.width / 2;
      const cy = -totalH / 2 + li * lineH + size / 2;
      line.words.forEach((word, wi) => {
        if (wi > 0) cx += this.wordGap;
        [...word].forEach((ch) => {
          const isLetter = /[A-Za-z]/.test(ch);
          const w = isLetter ? size : Math.round(size * 0.42);
          this.addChar(ch, cx + w / 2, cy, isLetter);
          cx += w + this.gap;
        });
        cx -= this.gap;
      });
    });
    scene.add.existing(this);
  }

  layout(words, size, maxW) {
    this.gap = Math.max(4, Math.round(size * 0.1));
    this.wordGap = Math.round(size * 0.55);
    const widthOf = (word) => [...word].reduce((sum, ch) => sum + (/[A-Za-z]/.test(ch) ? size : Math.round(size * 0.42)) + this.gap, -this.gap);
    const lines = [];
    let cur = { words: [], width: 0 };
    words.forEach((word) => {
      const ww = widthOf(word);
      const add = cur.words.length ? this.wordGap + ww : ww;
      if (cur.words.length && cur.width + add > maxW) {
        lines.push(cur);
        cur = { words: [word], width: ww };
      } else {
        cur.words.push(word);
        cur.width += add;
      }
    });
    if (cur.words.length) lines.push(cur);
    return lines;
  }

  addChar(ch, x, y, isLetter) {
    const size = this.size;
    if (!isLetter) {
      this.add(this.scene.add.text(x, y, ch, Theme.text(Math.round(size * 0.8), { fontStyle: '800', color: Theme.css.cream })).setOrigin(0.5));
      return;
    }
    const g = this.scene.add.graphics({ x, y });
    const t = this.scene.add
      .text(x, y + 2, ch.toUpperCase(), Theme.text(Math.round(size * 0.62), { fontStyle: '800', color: Theme.css.ink }))
      .setOrigin(0.5)
      .setVisible(false);
    const slot = { letter: ch.toUpperCase(), g, t, shown: false, look: 'hidden' };
    this.draw(slot, 'hidden');
    this.slots.push(slot);
    this.add([g, t]);
  }

  draw(slot, look) {
    const C = Theme.color;
    const s = this.size;
    const h = s / 2;
    const r = Math.round(s * 0.18);
    const g = slot.g.clear();
    slot.look = look;
    if (look === 'hidden') {
      g.fillStyle(C.deep, 1).fillRoundedRect(-h, -h, s, s, r);
      g.fillStyle(C.marigold, 1).fillRect(-h + 6, h - 8, s - 12, 4);
      return;
    }
    const fill = { shown: [C.cream, C.creamShade], hint: [C.teal, C.tealShade], missed: [C.rose, C.roseShade], solved: [C.mint, C.mintShade] }[look];
    g.fillStyle(fill[1], 1).fillRoundedRect(-h, -h + 4, s, s, r);
    g.fillStyle(fill[0], 1).fillRoundedRect(-h, -h, s, s, r);
    slot.t.setColor(look === 'missed' ? Theme.css.cream : Theme.css.ink);
  }

  /** Reveal every copy of a letter. Returns world positions of the opened tiles. */
  reveal(letter, look = 'shown', animate = true) {
    const opened = [];
    this.slots.forEach((slot, i) => {
      if (slot.shown || slot.letter !== letter) return;
      slot.shown = true;
      this.draw(slot, look);
      slot.t.setVisible(true);
      opened.push({ x: this.x + slot.g.x, y: this.y + slot.g.y });
      if (animate && !Theme.reducedMotion) {
        slot.g.scaleY = 0;
        slot.t.scaleY = 0;
        this.scene.tweens.add({ targets: [slot.g, slot.t], scaleY: 1, duration: 200, delay: i * 18, ease: 'Back.easeOut' });
      }
    });
    return opened;
  }

  get isComplete() {
    return this.slots.every((s) => s.shown);
  }

  /** Letters still hidden, most frequent first. */
  hiddenLetters() {
    const counts = {};
    this.slots.forEach((s) => {
      if (!s.shown) counts[s.letter] = (counts[s.letter] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  }

  /** Letter → look for every revealed letter, used to rebuild after a rotation. */
  revealedLooks() {
    const out = {};
    this.slots.forEach((s) => {
      if (s.shown) out[s.letter] = s.look;
    });
    return out;
  }

  celebrate(animate = true) {
    this.slots.forEach((slot, i) => {
      slot.shown = true;
      slot.t.setVisible(true);
      this.draw(slot, 'solved');
      if (animate && !Theme.reducedMotion) this.scene.tweens.add({ targets: [slot.g, slot.t], y: '-=10', duration: 140, yoyo: true, delay: i * 30 });
    });
  }

  revealAllMissed() {
    this.slots.forEach((slot) => {
      if (slot.shown) return;
      slot.shown = true;
      this.draw(slot, 'missed');
      slot.t.setVisible(true);
    });
  }
}
