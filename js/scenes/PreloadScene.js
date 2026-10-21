/**
 * PreloadScene — loads the Twemoji images (clues and theme decorations) and the Lucide
 * icons with a reel-style progress bar, draws the effect textures, then hands over to the
 * Entry scene (fullscreen offer and the tap that unlocks sound).
 */
class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const L = Layout.current;
    const C = Theme.color;
    this.cameras.main.setSize(L.W, L.H).setBackgroundColor(C.bg);

    const w = Math.min(520, L.W - 120);
    const x = L.cx - w / 2;
    const y = L.cy + 40;
    this.add.text(L.cx, L.cy - 30, 'Loading the reels…', Theme.text(34, { fontFamily: Theme.font.display })).setOrigin(0.5);
    const bar = this.add.graphics();
    this.load.on('progress', (p) => {
      bar.clear();
      bar.fillStyle(C.deep, 1).fillRoundedRect(x, y, w, 24, 12);
      bar.fillStyle(C.marigold, 1).fillRoundedRect(x, y, Math.max(24, w * p), 24, 12);
    });
    // A missing file only means that emoji falls back to the system font.
    this.load.on('loaderror', (file) => console.warn('Could not load', file.src));

    const codes = new Set(EmojiCodes.filesInDeck());
    EmojiCodes.split(PreloadScene.EXTRA_EMOJI).forEach((e) => codes.add(EmojiCodes.fileFor(e)));
    codes.forEach((code) => {
      this.load.svg(`emo-${code}`, `assets/emoji/${code}.svg`, { width: 128, height: 128 });
    });
    PreloadScene.ICONS.forEach((name) => {
      ['cream', 'ink'].forEach((tone) => {
        this.load.svg(`ic-${name}-${tone}`, `assets/icons/${name}-${tone}.svg`, { width: 64, height: 64 });
      });
    });
  }

  create() {
    Effects.makeTextures(this);
    this.scene.start('Entry', {});
  }
}

PreloadScene.ICONS = [
  'volume-2', 'volume-x', 'music', 'share-2', 'external-link', 'rotate-ccw', 'house', 'film', 'lightbulb', 'play', 'sparkles',
  'calendar-days', 'infinity', 'flame', 'trophy', 'timer', 'heart', 'zap', 'settings', 'palette', 'check', 'x', 'hand',
  'eye-off', 'type', 'disc-3', 'lock', 'star', 'circle-check', 'clapperboard', 'pause', 'vibrate', 'audio-lines', 'speaker', 'maximize', 'minimize'
];

/** Decorations used by themes, the Studio and the how-to tiles. */
PreloadScene.EXTRA_EMOJI = '🎬🎞️📽️🍿🎟️🎨💦🌈🪔🏮🎆✨🎄❄️🎁⭐🔔🥁🪩🪘🎧🔥🌼💐🪅🎵🎶🎤🎸🎹🎺🔊🪕🪈🪗';
