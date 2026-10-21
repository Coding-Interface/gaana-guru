/**
 * Fullscreen — one place for going fullscreen, through Phaser's ScaleManager.
 *
 * Browsers only allow it from a tap or key press, so call enter()/toggle() from a button.
 * Where the page cannot go fullscreen (iPhone Safari allows it only for videos), `available`
 * is false and `iosTip` says to use Add to Home Screen instead, which opens the game without
 * the browser bars (index.html carries the web-app meta tags for that).
 */
class Fullscreen {
  static get available() {
    const g = window.game;
    return !!(g && g.scale && g.scale.fullscreen && g.scale.fullscreen.available);
  }

  static get active() {
    const g = window.game;
    return !!(g && g.scale && g.scale.isFullscreen);
  }

  /** iPhone/iPad Safari outside a home-screen web app: suggest Add to Home Screen. */
  static get iosTip() {
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    return ios && !standalone && !Fullscreen.available;
  }

  static enter() {
    if (!Fullscreen.available || Fullscreen.active) return;
    try {
      window.game.scale.startFullscreen({ navigationUI: 'hide' });
    } catch (e) {
      /* the browser said no */
    }
  }

  static exit() {
    if (!Fullscreen.active) return;
    try {
      window.game.scale.stopFullscreen();
    } catch (e) {
      /* ignore */
    }
  }

  static toggle() {
    if (Fullscreen.active) Fullscreen.exit();
    else Fullscreen.enter();
  }
}
