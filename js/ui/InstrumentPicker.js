/**
 * InstrumentPicker — choose what a speaker plays.
 *
 * A small stage panel of eight instrument buttons (dhol, tabla, dholak, ghungroo, sitar,
 * bansuri, shehnai, harmonium), each with its emoji and name; the current one is ringed.
 * Tapping one plays a taste of it, saves it for that speaker and closes the panel.
 * Tapping outside closes it. Drawn in Phaser, so it scales with the game like everything else.
 *
 *   InstrumentPicker.open(scene, slot, nearY, onPick)
 */
class InstrumentPicker extends Phaser.GameObjects.Container {
  static open(scene, slot, nearY, onPick) {
    if (InstrumentPicker.current && InstrumentPicker.current.active) InstrumentPicker.current.close();
    InstrumentPicker.current = new InstrumentPicker(scene, slot, nearY, onPick);
    return InstrumentPicker.current;
  }

  constructor(scene, slot, nearY, onPick) {
    const L = Layout.current;
    const cols = 4;
    const cell = 132;
    const gap = 12;
    const pad = 22;
    const head = 56;
    const w = cols * cell + (cols - 1) * gap + pad * 2;
    const rows = Math.ceil(Instruments.ALL.length / cols);
    const h = head + rows * cell + (rows - 1) * gap + pad;
    const x = L.cx;
    const y = Phaser.Math.Clamp(nearY - h / 2 - 40, h / 2 + 20, L.H - h / 2 - 20);
    super(scene, x, y);
    this.onPick = onPick;
    this.slot = slot;
    const C = Theme.color;
    const current = Settings.instrument(slot);

    // Tap anywhere outside to close.
    this.shade = scene.add.rectangle(L.cx, L.cy, L.W, L.H, 0x000000, 0.45).setInteractive().setDepth(949);
    this.shade.on('pointerup', () => this.close());

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 28);
    g.fillStyle(C.panel, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 28);
    g.lineStyle(4, C.marigold, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 28);
    this.add(g);
    const title = scene.add.text(-w / 2 + pad, -h / 2 + head / 2 + 4, slot === 0 ? 'Left speaker' : 'Right speaker', Theme.text(26, { fontStyle: '800', color: Theme.css.marigold })).setOrigin(0, 0.5);
    this.add(title);

    Instruments.ALL.forEach((inst, i) => {
      const cx = -w / 2 + pad + cell / 2 + (i % cols) * (cell + gap);
      const cy = -h / 2 + head + cell / 2 + Math.floor(i / cols) * (cell + gap);
      const on = inst.kind === current;
      const tile = scene.add.graphics();
      tile.fillStyle(on ? C.marigold : C.deep, on ? 0.28 : 1).fillRoundedRect(cx - cell / 2, cy - cell / 2, cell, cell, 22);
      tile.lineStyle(on ? 4 : 2, on ? C.marigold : C.panelEdge, 1).strokeRoundedRect(cx - cell / 2, cy - cell / 2, cell, cell, 22);
      this.add(tile);
      const key = EmojiCodes.keyFor(inst.emoji);
      if (scene.textures.exists(key)) this.add(scene.add.image(cx, cy - 14, key).setDisplaySize(64, 64));
      this.add(scene.add.text(cx, cy + 44, inst.name, Theme.text(20, { fontStyle: '800' })).setOrigin(0.5));
      const zone = scene.add.zone(cx, cy, cell, cell).setInteractive({ useHandCursor: true });
      zone.on('pointerup', () => this.pick(inst.kind));
      this.add(zone);
    });

    this.setDepth(950);
    scene.add.existing(this);
    Sfx.shared.drape(true);
    if (!Theme.reducedMotion) {
      this.setScale(0.85).setAlpha(0);
      scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
    }
    scene.events.once('shutdown', () => this.close(true));
  }

  pick(kind) {
    Settings.setInstrument(this.slot, kind);
    Instruments.play(kind, 2);
    if (this.onPick) this.onPick(kind);
    this.close(true);
  }

  close(silent = false) {
    if (!this.active) return;
    if (!silent) Sfx.shared.drape(false);
    if (this.shade) this.shade.destroy();
    this.destroy();
  }
}

InstrumentPicker.current = null;
