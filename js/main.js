/**
 * Entry point — creates the game in the layout that fits the screen, centred both ways,
 * and switches layout live when the device is rotated or the window is resized.
 */
window.addEventListener('load', () => {
  const start = Layout.detect();
  Layout.current = start;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#3B0D1C',
    dom: { createContainer: true },
    // The game makes all its sound itself (AudioHub); Phaser's own sound system would open
    // a second audio context and pause it on blur, so it stays off.
    audio: { noAudio: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: start.W,
      height: start.H,
      // Fullscreen the whole #game box. Without this Phaser wraps only the canvas, which leaves
      // the DOM layer (popups, the YouTube link) outside the fullscreen view and untappable.
      fullscreenTarget: 'game'
    },
    scene: [BootScene, PreloadScene, EntryScene, MenuScene, SpinScene, PuzzleScene, WrapScene]
  });
  window.game = game;

  let pending = null;
  const checkLayout = () => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      const next = Layout.detect();
      if (next === Layout.current) {
        Layout.request(null);
        return;
      }
      Layout.request(next);
      game.events.emit('layoutchange', next);
    }, 180);
  };
  window.addEventListener('resize', checkLayout);
  window.addEventListener('orientationchange', checkLayout);

  // Sound pauses in the background and comes back on return, on every device.
  AudioHub.shared.install();
});
