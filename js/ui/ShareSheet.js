/**
 * ShareSheet — copies the result text, or shows a popup with the text selected for copying
 * when the browser refuses clipboard access. The popup is a DomPopup, so it scales with the game.
 *
 *   ShareSheet.copy(text)          → Promise<boolean>
 *   ShareSheet.show(scene, text)   fallback popup
 */
class ShareSheet extends DomPopup {
  static copy(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(
          () => true,
          () => false
        );
      }
    } catch (e) {
      /* fall through to the sheet */
    }
    return Promise.resolve(false);
  }

  static show(scene, text) {
    return new ShareSheet(scene, text);
  }

  constructor(scene, text) {
    super(scene, {
      className: 'share-card',
      html: `
        <header class="popup-head">
          <img src="assets/icons/share-2-cream.svg" alt="" width="44" height="44">
          <h2>Share</h2>
          <button type="button" class="popup-x" data-act="close" aria-label="Close">
            <img src="assets/icons/x-cream.svg" alt="" width="34" height="34">
          </button>
        </header>
        <p class="popup-note">Select the text and copy it</p>
        <textarea class="share-text" readonly></textarea>
        <div class="popup-actions">
          <button type="button" class="popup-btn primary" data-act="close"><img src="assets/icons/check-ink.svg" alt="" width="38" height="38">Done</button>
        </div>`
    });
    this.node.setAttribute('aria-label', 'Share your result');
    const box = this.$('.share-text');
    box.value = text;
    this.$$('[data-act="close"]').forEach((b) => b.addEventListener('click', () => this.close()));
    setTimeout(() => {
      box.focus({ preventScroll: true });
      box.select();
    }, 30);
  }
}
