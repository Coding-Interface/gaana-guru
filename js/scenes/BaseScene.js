/**
 * BaseScene — shared setup for every scene that has a layout.
 *
 * Rotation: when the screen flips between portrait and landscape, main.js records the new
 * layout and emits 'layoutchange'. The active scene then resizes the game and restarts with
 * snapshot(), so it rebuilds in the new layout without losing its state. A scene that is
 * mid-animation (the wheel spinning) returns true from isBusy(); the change waits,
 * game size included, until it calls flushLayout().
 *
 * Pause and save (game scenes call enableRunControls()):
 *   openPause()  freezes the scene (clock, tweens, timers) under the pause menu
 *   persist()    saves the run plus snapshot() through RunSaver, so it can be resumed later
 *   Esc pauses; leaving the tab saves.
 *   Switching calm mode in the pause menu rebuilds the scene from snapshot() on resume, so
 *   every effect, loop and particle is rebuilt calm (or lively) at once.
 *   rebuild() is the shared "rebuild me from my snapshot" used by rotations too.
 *
 * Note: Phaser reserves `this.lights` for its Light2D manager, so scenes keep their
 * spotlights on `this.stage.spots`.
 */
class BaseScene extends Phaser.Scene {
  get L() {
    return Layout.current;
  }

  prepare() {
    // A rotation that happened during loading or a scene change is applied here.
    Layout.apply(this.game);
    const L = this.L;
    this.cameras.main.setSize(L.W, L.H);
    this.cameras.main.setBackgroundColor(Theme.color.bg);
    this.layoutPending = false;
    this.pausedByMenu = false;

    const onChange = () => this.handleLayoutChange();
    this.game.events.on('layoutchange', onChange);
    this.events.once('shutdown', () => this.game.events.off('layoutchange', onChange));
  }

  /** Pause key, and saving when the player leaves the tab or closes it. */
  enableRunControls() {
    if (this.input.keyboard) this.input.keyboard.on('keydown-ESC', () => this.openPause());
    const save = () => this.persist();
    this.game.events.on('hidden', save);
    window.addEventListener('pagehide', save);
    this.events.once('shutdown', () => {
      this.game.events.off('hidden', save);
      window.removeEventListener('pagehide', save);
    });
  }

  persist() {
    if (!this.run || this.isBusy() || (!this.sys.isActive() && !this.pausedByMenu)) return;
    RunSaver.save(this.scene.key, this.snapshot());
  }

  openPause() {
    if (this.pausedByMenu || this.isBusy() || !this.sys.isActive() || !this.run) return;
    this.persist();
    this.pausedByMenu = true;
    this.scene.pause();
    Sfx.shared.projector(false);
    this.calmChanged = false;
    new SettingsPanel(this, {
      mode: 'pause',
      run: this.run,
      onChange: (key) => {
        if (key === 'calm') this.calmChanged = !this.calmChanged;
      },
      onResume: () => this.resumeFromPause(),
      onHome: () => {
        this.persist();
        this.resumeFromPause();
        FilmiScore.shared.calm();
        this.scene.start('Menu', {});
      },
      onNew: () => {
        RunSaver.clear('endless');
        this.resumeFromPause();
        RunState.start('endless');
        FilmiScore.shared.calm();
        this.scene.start('Spin', {});
      }
    });
  }

  resumeFromPause() {
    Sfx.shared.projector(true);
    this.pausedByMenu = false;
    this.scene.resume();
    if (this.calmChanged) {
      // Calm mode was switched: rebuild so every effect follows it (a rotation is folded in).
      this.calmChanged = false;
      this.layoutPending = false;
      Layout.apply(this.game);
      this.rebuild();
      return;
    }
    // A rotation while paused is applied now.
    this.flushLayout();
  }

  handleLayoutChange() {
    if (this.isBusy() || this.pausedByMenu) {
      this.layoutPending = true;
      return;
    }
    Layout.apply(this.game);
    this.rebuild();
  }

  /** Restart this scene from its snapshot (same state, fresh objects). */
  rebuild() {
    this.scene.restart(this.snapshot());
  }

  isBusy() {
    return false;
  }

  snapshot() {
    return {};
  }

  flushLayout() {
    if (!this.layoutPending) return;
    this.layoutPending = false;
    this.handleLayoutChange();
  }

  pick(portraitValue, landscapeValue) {
    return this.L.portrait ? portraitValue : landscapeValue;
  }
}
