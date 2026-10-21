/**
 * StudioPanel — test-mode popup for trying themes and music live, and the GameConfig line to
 * paste when you are ready to ship. A DomPopup, so it scales with the game. Never shown in
 * final mode.
 *
 *   new StudioPanel(scene, { onTheme, onBgm, onClose })
 */
class StudioPanel extends DomPopup {
  constructor(scene, { onTheme, onBgm, onClose, sound = true } = {}) {
    super(scene, {
      sound,
      className: 'studio-card',
      width: Layout.current.portrait ? 640 : 900,
      html: `
        <header class="popup-head">
          <img src="assets/icons/palette-cream.svg" alt="" width="44" height="44">
          <h2>Studio</h2>
          <span class="studio-badge">TEST MODE</span>
          <button type="button" class="popup-x" data-act="close" aria-label="Close studio">
            <img src="assets/icons/x-cream.svg" alt="" width="34" height="34">
          </button>
        </header>
        <h3 class="studio-label">Theme</h3>
        <div class="studio-grid" data-grid="themes" role="group" aria-label="Theme"></div>
        <h3 class="studio-label">Music</h3>
        <div class="studio-grid" data-grid="bgm" role="group" aria-label="Music"></div>
        <h3 class="studio-label">Ship it</h3>
        <p class="studio-note">Paste into <code>js/config/GameConfig.js</code></p>
        <div class="studio-ship">
          <code class="studio-snippet"></code>
          <button type="button" class="studio-copy">Copy</button>
        </div>`
    });
    this.onTheme = onTheme;
    this.onBgm = onBgm;
    this.onClose = onClose;
    this.node.setAttribute('aria-label', 'Studio');
    this.grids = {};

    this.fill('themes', THEMES, () => Studio.theme, (key) => {
      Studio.set('theme', key);
      this.refresh();
      if (this.onTheme) this.onTheme(key);
    });
    this.fill('bgm', BGM_STYLES, () => Studio.bgm, (key) => {
      Studio.set('bgm', key);
      this.refresh();
      if (this.onBgm) this.onBgm(key);
    });

    this.$('[data-act="close"]').addEventListener('click', () => this.dismiss());
    this.$('.studio-copy').addEventListener('click', () => {
      const btn = this.$('.studio-copy');
      Sfx.shared.ui();
      ShareSheet.copy(Studio.finalSnippet).then((ok) => {
        btn.textContent = ok ? 'Copied' : 'Select it';
      });
    });
    this.refresh();
  }

  fill(name, items, current, pick) {
    const grid = this.$(`[data-grid="${name}"]`);
    this.grids[name] = { current };
    Object.entries(items).forEach(([key, item]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'studio-option';
      b.dataset.key = key;
      b.innerHTML = `<img src="assets/emoji/${EmojiCodes.fileFor(item.emoji)}.svg" alt="" width="64" height="64"><span>${item.name}</span>`;
      b.addEventListener('click', () => {
        Sfx.shared.ui();
        pick(key);
      });
      grid.append(b);
    });
  }

  refresh() {
    if (this.closed) return;
    Object.entries(this.grids).forEach(([name, { current }]) => {
      this.$$(`[data-grid="${name}"] .studio-option`).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.key === current()));
      });
    });
    this.$('.studio-snippet').textContent = Studio.finalSnippet;
    this.$('.studio-copy').textContent = 'Copy';
  }

  dismiss() {
    this.close();
    if (this.onClose) this.onClose();
  }
}
