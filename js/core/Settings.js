/**
 * Settings — the player's sound and comfort options, saved on the device.
 *
 *   music, sfx          on / off
 *   musicVol, sfxVol    0..1 sliders
 *   calm                fewer moving effects (no shakes, zooms or flashes), on top of the
 *                       device's own "reduce motion" setting
 *   haptics             short vibrations on a miss or a solve (phones that support it)
 *   instruments         what the left and right speakers play when tapped
 *
 * Settings.load() runs once at boot and pushes everything into AudioHub; Settings.set()
 * changes one option live. Stored under its own key so it never clashes with SaveStore.
 */
class Settings {
  static load() {
    const defaults = { music: true, sfx: true, musicVol: 0.7, sfxVol: 0.8, calm: false, haptics: true, instruments: ['dhol', 'sitar'] };
    let data = null;
    try {
      const raw = window.localStorage.getItem(Settings.KEY);
      data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      data = null;
    }
    if (!data) {
      // First run with this version: carry over the old sound / music toggles.
      const old = new SaveStore();
      data = { music: old.music, sfx: old.sound };
    }
    Settings.data = Object.assign(defaults, data);
    Settings.apply();
  }

  static save() {
    try {
      window.localStorage.setItem(Settings.KEY, JSON.stringify(Settings.data));
    } catch (e) {
      /* storage unavailable: settings last for this visit */
    }
  }

  static apply() {
    const hub = AudioHub.shared;
    const d = Settings.data;
    hub.musicOn = d.music;
    hub.sfxOn = d.sfx;
    hub.setMusicVolume(d.musicVol);
    hub.setSfxVolume(d.sfxVol);
  }

  static get(key) {
    return Settings.data[key];
  }

  static set(key, value) {
    const d = Settings.data;
    d[key] = value;
    const hub = AudioHub.shared;
    const score = FilmiScore.shared;
    switch (key) {
      case 'music':
        hub.musicOn = value;
        if (value) score.start(score.mode);
        else score.stop(0.3);
        break;
      case 'sfx':
        hub.sfxOn = value;
        if (!value) ReelRoll.shared.stop();
        break;
      case 'musicVol':
        hub.setMusicVolume(value);
        break;
      case 'sfxVol':
        hub.setSfxVolume(value);
        break;
      default:
        break;
    }
    Settings.save();
  }

  /** True when anything is audible. */
  static get audible() {
    return Settings.data.music || Settings.data.sfx;
  }

  /** One-tap mute / unmute for everything. */
  static toggleMute() {
    const on = !Settings.audible;
    Settings.set('music', on);
    Settings.set('sfx', on);
    return on;
  }

  /** A short buzz on phones that support it, when the player allows it. */
  static buzz(pattern) {
    if (!Settings.data.haptics) return;
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {
      /* not supported */
    }
  }
}

Settings.KEY = 'dhun-decoder.settings.v1';
Settings.data = { music: true, sfx: true, musicVol: 0.7, sfxVol: 0.8, calm: false, haptics: true, instruments: ['dhol', 'sitar'] };

/** The instrument a speaker slot (0 left, 1 right) plays. */
Settings.instrument = (slot) => {
  const list = Settings.data.instruments || Instruments.DEFAULTS;
  return list[slot] || Instruments.DEFAULTS[slot] || 'dhol';
};

Settings.setInstrument = (slot, kind) => {
  const list = (Settings.data.instruments || Instruments.DEFAULTS).slice();
  list[slot] = kind;
  Settings.set('instruments', list);
};
