/**
 * BootScene — applies the theme and music style (from GAME_CONFIG, or the Studio in test
 * mode), restores the player's settings (sound, volumes, calm mode) and waits for the web fonts.
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    Theme.apply(Studio.theme);
    FilmiScore.shared.setStyle(Studio.bgm);

    const L = Layout.current;
    this.cameras.main.setSize(L.W, L.H).setBackgroundColor(Theme.color.bg);
    this.add.text(L.cx, L.cy, 'Lights, camera…', Theme.text(30, { fontFamily: 'sans-serif', color: Theme.css.muted })).setOrigin(0.5);

    Settings.load();

    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load('48px "Rozha One"'),
          document.fonts.load('800 32px "Baloo 2"'),
          document.fonts.load('700 32px "Baloo 2"'),
          document.fonts.load('500 32px "Baloo 2"')
        ]).catch(() => {})
      : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2500));

    Promise.race([fonts, timeout]).then(() => this.scene.start('Preload', {}));
  }
}
