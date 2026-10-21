/**
 * Studio — decides which theme and music style are active.
 *
 * Final mode: always GAME_CONFIG.theme and GAME_CONFIG.bgm.
 * Test mode:  the Studio panel's last choice on this device, falling back to GAME_CONFIG.
 */
class Studio {
  static get testMode() {
    return window.GAME_CONFIG && GAME_CONFIG.mode === 'test';
  }

  static read(key) {
    try {
      return window.localStorage.getItem(`dhun-decoder.studio.${key}`);
    } catch (e) {
      return null;
    }
  }

  static get theme() {
    const pick = Studio.testMode ? Studio.read('theme') : null;
    const key = pick || GAME_CONFIG.theme;
    return THEMES[key] ? key : 'cinema';
  }

  static get bgm() {
    const pick = Studio.testMode ? Studio.read('bgm') : null;
    const key = pick || GAME_CONFIG.bgm;
    return BGM_STYLES[key] ? key : 'keherwa';
  }

  static set(key, value) {
    if (!Studio.testMode) return;
    try {
      window.localStorage.setItem(`dhun-decoder.studio.${key}`, value);
    } catch (e) {
      /* storage blocked: the choice lasts for this visit */
    }
  }

  /** The line to paste into GameConfig.js to ship the current choice. */
  static get finalSnippet() {
    return `window.GAME_CONFIG = { mode: 'final', theme: '${Studio.theme}', bgm: '${Studio.bgm}' };`;
  }
}
