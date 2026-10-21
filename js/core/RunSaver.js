/**
 * RunSaver — keeps the game in progress on the device, so a player can leave for the menu
 * (or close the tab) and later resume exactly where they were: same round, song, letters,
 * hints and clock.
 *
 * What is saved: the run (RunState.toJSON) plus the scene it was in and that scene's
 * snapshot(), the same snapshot used to rebuild a scene after a screen rotation.
 * Daily and endless runs have a slot each, so one never overwrites the other.
 * A daily run only resumes on the day it was started.
 */
class RunSaver {
  static save(sceneKey, data) {
    const run = RunState.current;
    if (!run) return;
    const entry = { v: 1, day: DailyClock.puzzleNumber(), savedAt: Date.now(), run: run.toJSON(), scene: sceneKey, data: data || {} };
    try {
      window.localStorage.setItem(RunSaver.key(run.mode), JSON.stringify(entry));
    } catch (e) {
      /* storage unavailable */
    }
  }

  static key(mode) {
    return `${RunSaver.KEY}.${mode === 'daily' ? 'daily' : 'endless'}`;
  }

  /** The saved game for a mode, or null (none, or a daily from another day). */
  static load(mode) {
    let entry = null;
    try {
      const raw = window.localStorage.getItem(RunSaver.key(mode));
      entry = raw ? JSON.parse(raw) : null;
    } catch (e) {
      entry = null;
    }
    if (!entry || entry.v !== 1 || !entry.run || !entry.scene) return null;
    if (entry.run.mode === 'daily' && entry.day !== DailyClock.puzzleNumber()) {
      RunSaver.clear('daily');
      return null;
    }
    return entry;
  }

  static clear(mode) {
    try {
      window.localStorage.removeItem(RunSaver.key(mode));
    } catch (e) {
      /* storage unavailable */
    }
  }

  /** Restore a saved run and jump back into its scene. Returns false if nothing to resume. */
  static resume(scene, mode) {
    const entry = RunSaver.load(mode);
    if (!entry) return false;
    RunState.current = RunState.fromJSON(entry.run);
    scene.scene.start(entry.scene, entry.data || {});
    return true;
  }
}

RunSaver.KEY = 'dhun-decoder.run.v1';
