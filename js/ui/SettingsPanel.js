/**
 * SettingsPanel — the pause menu during a game, and the settings sheet on the menu.
 * A DomPopup, so it is part of the game's own DOM layer and scales with the canvas.
 *
 *   mode 'pause'     run summary chips, sound and comfort options, then
 *                    Resume · Menu (the game is kept, resume it later) · New (endless only,
 *                    tap twice to confirm)
 *   mode 'settings'  just the options and Done
 *
 * Options: music on/off + volume, sounds on/off + volume, calm mode (fewer moving effects),
 * vibration (only shown where the device supports it), fullscreen (where the browser allows it). Every change applies at once and is
 * saved by Settings. Switches click like stage-light switches. Esc or the shade resumes/closes.
 *
 *   new SettingsPanel(scene, { mode, run, onResume, onHome, onNew, onClose, onChange })
 */
class SettingsPanel extends DomPopup {
  constructor(scene, { mode = 'settings', run = null, onResume, onHome, onNew, onClose, onChange } = {}) {
    const pause = mode === 'pause';
    const icon = (name) => `assets/icons/${name}-cream.svg`;
    super(scene, {
      className: 'settings-card',
      // Landscape: two columns (actions left, options right) so it fits the short screen.
      width: Layout.current.portrait ? 640 : 1040,
      html: `
        <header class="popup-head">
          <img src="${icon(pause ? 'pause' : 'settings')}" alt="" width="44" height="44">
          <h2>${pause ? 'Paused' : 'Settings'}</h2>
          <button type="button" class="popup-x" data-act="dismiss" aria-label="${pause ? 'Resume' : 'Close'}">
            <img src="${icon('x')}" alt="" width="34" height="34">
          </button>
        </header>
        ${pause && run ? SettingsPanel.runChips(run) : ''}
        <div class="settings-rows">
          ${SettingsPanel.row('music', 'Music', icon('music'), true)}
          ${SettingsPanel.row('sfx', 'Sounds', icon('volume-2'), true)}
          ${SettingsPanel.row('calm', 'Calm mode', icon('sparkles'), false)}
          ${SettingsPanel.canVibrate ? SettingsPanel.row('haptics', 'Vibration', icon('vibrate'), false) : ''}
          ${Fullscreen.available ? SettingsPanel.row('fullscreen', 'Fullscreen', icon('maximize'), false) : ''}
        </div>
        ${
          pause
            ? `<div class="popup-actions">
                <button type="button" class="popup-btn primary" data-act="resume"><img src="assets/icons/play-ink.svg" alt="" width="38" height="38">Resume</button>
                <div class="popup-pair">
                  <button type="button" class="popup-btn" data-act="home"><img src="${icon('house')}" alt="" width="34" height="34">Menu</button>
                  ${run && !run.isDaily ? `<button type="button" class="popup-btn" data-act="new"><img src="${icon('rotate-ccw')}" alt="" width="34" height="34"><span>New</span></button>` : ''}
                </div>
                <p class="popup-note"><img src="${icon('circle-check')}" alt="" width="24" height="24">Your game is saved</p>
              </div>`
            : `<div class="popup-actions">
                <button type="button" class="popup-btn primary" data-act="close"><img src="assets/icons/check-ink.svg" alt="" width="38" height="38">Done</button>
              </div>`
        }`
    });
    this.mode = mode;
    this.onResume = onResume;
    this.onHome = onHome;
    this.onNew = onNew;
    this.onClose = onClose;
    this.onChange = onChange;
    this.node.setAttribute('aria-label', pause ? 'Paused' : 'Settings');
    this.bind();
    this.refresh();
    // Fullscreen can also change from the browser (Esc, the system back gesture).
    this.onFull = () => this.refresh(false);
    scene.scale.on('enterfullscreen', this.onFull);
    scene.scale.on('leavefullscreen', this.onFull);
    const first = this.$(pause ? '[data-act="resume"]' : '[data-act="close"]');
    if (first) first.focus({ preventScroll: true });
  }

  static get canVibrate() {
    try {
      return typeof navigator.vibrate === 'function' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    } catch (e) {
      return false;
    }
  }

  static row(key, label, iconSrc, slider) {
    const volKey = key === 'music' ? 'musicVol' : 'sfxVol';
    return `
      <div class="settings-row" data-row="${key}">
        <img src="${iconSrc}" alt="" width="40" height="40">
        <span class="settings-label" id="lbl-${key}">${label}</span>
        ${slider ? `<input type="range" min="0" max="100" step="5" class="settings-range" data-vol="${volKey}" aria-label="${label} volume">` : '<span></span>'}
        <button type="button" class="settings-switch" role="switch" data-key="${key}" aria-labelledby="lbl-${key}"><span></span></button>
      </div>`;
  }

  static runChips(run) {
    const hearts = '♥'.repeat(Math.max(0, run.lives)) + '♡'.repeat(Math.max(0, RunState.LIVES - run.lives));
    const round = run.isDaily ? `${run.round}/${RunState.DAILY_ROUNDS}` : String(run.round);
    const modeIcon = run.isDaily ? 'calendar-days' : 'infinity';
    return `
      <div class="popup-chips" aria-label="Round ${round}, score ${run.score}, ${run.lives} lives">
        <span class="chip"><img src="assets/icons/${modeIcon}-cream.svg" alt="" width="28" height="28">${round}</span>
        <span class="chip"><img src="assets/icons/star-cream.svg" alt="" width="28" height="28">${run.score}</span>
        <span class="chip hearts" aria-hidden="true">${hearts}</span>
      </div>`;
  }

  bind() {
    this.$$('.settings-switch').forEach((sw) => {
      sw.addEventListener('click', () => {
        const key = sw.dataset.key;
        if (key === 'fullscreen') {
          // Not a stored setting: it follows the browser's real state.
          Sfx.shared.lightSwitch(!Fullscreen.active);
          Fullscreen.toggle();
          return;
        }
        const on = !Settings.get(key);
        Settings.set(key, on);
        Sfx.shared.lightSwitch(on);
        if (key === 'haptics' && on) Settings.buzz(30);
        this.refresh();
        if (this.onChange) this.onChange(key);
      });
    });
    this.$$('.settings-range').forEach((r) => {
      r.addEventListener('input', () => {
        const key = r.dataset.vol;
        Settings.set(key, Number(r.value) / 100);
        // Moving a volume slider turns that sound back on.
        const toggle = key === 'musicVol' ? 'music' : 'sfx';
        if (!Settings.get(toggle) && Number(r.value) > 0) Settings.set(toggle, true);
        this.refresh(false);
      });
      r.addEventListener('change', () => {
        if (r.dataset.vol === 'sfxVol') Sfx.shared.ui();
      });
    });
    this.$$('[data-act]').forEach((b) => {
      b.addEventListener('click', () => this.act(b.dataset.act, b));
    });
  }

  dismiss() {
    this.act(this.mode === 'pause' ? 'resume' : 'close');
  }

  act(what, btn) {
    if (what === 'dismiss') return this.dismiss();
    if (what === 'new') {
      // Tap twice: the first tap asks, the second starts a fresh run.
      if (!this.confirming) {
        this.confirming = true;
        Sfx.shared.ui();
        btn.classList.add('warn');
        btn.querySelector('span').textContent = 'Sure?';
        this.confirmTimer = setTimeout(() => {
          this.confirming = false;
          if (btn.isConnected) {
            btn.classList.remove('warn');
            btn.querySelector('span').textContent = 'New';
          }
        }, 3000);
        return undefined;
      }
      clearTimeout(this.confirmTimer);
      Sfx.shared.clapper();
    } else if (what === 'home') {
      Sfx.shared.clapper();
    }
    const cb = { resume: this.onResume, close: this.onClose || this.onResume, home: this.onHome, new: this.onNew }[what];
    this.close(what === 'home' || what === 'new');
    if (cb) cb();
    return undefined;
  }

  refresh(updateRanges = true) {
    if (this.closed) return;
    this.$$('.settings-switch').forEach((sw) => {
      const on = sw.dataset.key === 'fullscreen' ? Fullscreen.active : !!Settings.get(sw.dataset.key);
      sw.setAttribute('aria-checked', String(on));
    });
    this.$$('.settings-range').forEach((r) => {
      if (updateRanges) r.value = String(Math.round(Settings.get(r.dataset.vol) * 100));
      const toggle = r.dataset.vol === 'musicVol' ? 'music' : 'sfx';
      r.classList.toggle('off', !Settings.get(toggle));
      r.style.setProperty('--fill', `${r.value}%`);
    });
  }

  close(silent) {
    clearTimeout(this.confirmTimer);
    if (this.onFull) {
      this.scene.scale.off('enterfullscreen', this.onFull);
      this.scene.scale.off('leavefullscreen', this.onFull);
    }
    super.close(silent);
  }
}
