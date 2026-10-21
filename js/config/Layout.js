/**
 * Layout — picks portrait or landscape from the screen shape.
 *
 * Phones held upright get the 720×1280 portrait layout. Desktops, laptops,
 * rotated phones and landscape tablets get the 1280×720 landscape layout.
 * Phaser's FIT scaling with CENTER_BOTH then keeps it centred at any size.
 */
class Layout {
  static detect() {
    const w = window.innerWidth || 720;
    const h = window.innerHeight || 1280;
    return h >= w ? Layout.PORTRAIT : Layout.LANDSCAPE;
  }

  static get current() {
    return Layout._current || (Layout._current = Layout.detect());
  }

  static set current(value) {
    Layout._current = value;
  }

  /** Remember a new layout; the active scene applies it when it is safe to rebuild. */
  static request(next) {
    Layout.pending = next;
  }

  /** Switch the game to the pending layout. Returns true if anything changed. */
  static apply(game) {
    const next = Layout.pending;
    if (!next || next === Layout.current) return false;
    Layout.current = next;
    Layout.pending = null;
    game.scale.setGameSize(next.W, next.H);
    return true;
  }
}

Layout.PORTRAIT = { portrait: true, W: 720, H: 1280, cx: 360, cy: 640 };
Layout.LANDSCAPE = { portrait: false, W: 1280, H: 720, cx: 640, cy: 360 };
Layout.pending = null;
