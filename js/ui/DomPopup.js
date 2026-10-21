/**
 * DomPopup — base for every popup (pause menu, settings, Studio, share sheet).
 *
 * The card is a Phaser DOM element (scene.add.dom), so it lives in the game's DOM layer and
 * is scaled with the canvas by Phaser's Scale.FIT: it is sized in game pixels (the 720×1280
 * or 1280×720 stage) and looks the same size relative to the game on a phone, a tablet or a
 * desktop, instead of a fixed-size page overlay that looks huge on small screens.
 *
 * Behind it a dim shade covers the stage and takes every tap, so nothing underneath can be
 * pressed. Taps on the card never reach the canvas, the scene's keyboard is paused while it
 * is open, and Esc (or tapping the shade) dismisses it. It closes with its scene.
 *
 *   class MyPopup extends DomPopup {
 *     constructor(scene) { super(scene, { className: 'my-popup', html: '<div>…</div>' }); }
 *   }
 */
class DomPopup {
  constructor(scene, { className = '', html = '', width = null, closeOnShade = true, sound = true } = {}) {
    this.scene = scene;
    this.closed = false;
    this.closeOnShade = closeOnShade;
    const L = Layout.current;
    const w = width || 640;

    this.shade = scene.add.rectangle(0, 0, L.W, L.H, 0x040208, 0.74).setOrigin(0).setDepth(900).setScrollFactor(0).setInteractive();
    this.shade.on('pointerup', () => {
      if (this.closeOnShade) this.dismiss();
    });

    const node = document.createElement('div');
    node.className = `popup ${className}${L.portrait ? '' : ' land'}`;
    node.style.width = `${w}px`;
    node.style.maxHeight = `${L.H - 60}px`;
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-modal', 'true');
    node.innerHTML = html;
    // Phaser positions the element it is given (and sets its display), so the card sits in a
    // plain wrapper and keeps its own layout and pop-in animation.
    const wrap = document.createElement('div');
    wrap.className = 'popup-wrap';
    wrap.append(node);
    // Keep taps and keys on the card: Phaser also listens on the window.
    ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'keydown', 'keyup', 'wheel'].forEach((type) => {
      wrap.addEventListener(type, (e) => e.stopPropagation(), { passive: type === 'wheel' || type.startsWith('touch') });
    });
    this.node = node;
    this.dom = scene.add.dom(L.cx, L.cy, wrap).setDepth(901).setScrollFactor(0);

    this.keyboard = scene.input.keyboard;
    this.keyboardWas = this.keyboard ? this.keyboard.enabled : false;
    if (this.keyboard) this.keyboard.enabled = false;
    this.keyHandler = (e) => {
      if (e.key === 'Escape') this.dismiss();
    };
    window.addEventListener('keydown', this.keyHandler);
    this.onShutdown = () => this.close(true);
    scene.events.once('shutdown', this.onShutdown);
    if (sound) Sfx.shared.drape(true);
  }

  /** Find an element inside the card. */
  $(selector) {
    return this.node.querySelector(selector);
  }

  $$(selector) {
    return [...this.node.querySelectorAll(selector)];
  }

  /** Esc or a tap on the shade. Subclasses override to run their own close action. */
  dismiss() {
    this.close();
  }

  close(silent = false) {
    if (this.closed) return;
    this.closed = true;
    window.removeEventListener('keydown', this.keyHandler);
    this.scene.events.off('shutdown', this.onShutdown);
    if (this.dom) this.dom.destroy();
    if (this.shade) this.shade.destroy();
    // Give the keyboard back on the next frame, so the closing key never reaches the game.
    const kb = this.keyboard;
    const was = this.keyboardWas;
    if (kb) setTimeout(() => (kb.enabled = was), 0);
    if (!silent) Sfx.shared.drape(false);
  }
}
