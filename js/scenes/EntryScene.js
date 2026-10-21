/**
 * EntryScene — the doors of the cinema, between loading and the menu.
 *
 * It does two jobs with one tap:
 *   - asks the player to play fullscreen ("Play fullscreen" is the big button; "Play" stays
 *     in the window). Where the browser cannot go fullscreen (iPhone Safari) it shows a tip
 *     to Add to Home Screen instead, and only the Play button.
 *   - unlocks sound. Browsers only start audio from a tap, so the tap creates and resumes the
 *     audio context, primes it, and the menu opens only once sound is really running (or after
 *     a short wait, so a stubborn device never blocks the game). The music starts here, so it
 *     is already playing when the menu appears, and every scene after it has working audio.
 */
class EntryScene extends BaseScene {
  constructor() {
    super('Entry');
  }

  create() {
    this.prepare();
    const L = this.L;
    const P = L.portrait;
    const C = Theme.color;
    this.going = false;

    new Backdrop(this, Theme.key).image.setAlpha(0.55);
    this.spots = new Spotlights(this, { count: 3, alpha: 0.12 });
    const title = this.add
      .text(L.cx, P ? L.cy - 300 : L.cy - 220, 'Gaana Guru', Theme.text(P ? 100 : 92, { fontFamily: Theme.font.display, color: Theme.css.cream }))
      .setOrigin(0.5)
      .setShadow(0, 6, '#B02C5C', 0, false, true);
    const ticket = this.add.image(L.cx, P ? L.cy - 110 : L.cy - 70, EmojiCodes.keyFor('🎟️')).setDisplaySize(150, 150);

    const canFull = Fullscreen.available && !Fullscreen.active;
    const by = P ? L.cy + 90 : L.cy + 90;
    if (canFull) {
      this.fullBtn = new TextButton(this, L.cx, by, P ? 520 : 480, 108, 'Play fullscreen', { size: 36, icon: 'ic-maximize-ink', iconSize: 40, sound: null }).setOnClick(() => this.go(true));
      this.playBtn = new TextButton(this, L.cx, by + 124, P ? 360 : 320, 84, 'Play', { size: 30, icon: 'ic-play-cream', iconSize: 32, fill: C.panelEdge, textColor: Theme.css.cream, sound: null }).setOnClick(() => this.go(false));
      this.add.text(L.cx, by + 206, 'Best in fullscreen', Theme.text(22, { fontStyle: '700', color: Theme.css.muted })).setOrigin(0.5);
    } else {
      this.playBtn = new TextButton(this, L.cx, by, P ? 460 : 420, 108, 'Tap to play', { size: 36, icon: 'ic-play-ink', iconSize: 40, sound: null }).setOnClick(() => this.go(false));
      if (Fullscreen.iosTip) {
        this.add
          .text(L.cx, by + 110, 'For fullscreen: Share → Add to Home Screen', Theme.text(22, { fontStyle: '700', color: Theme.css.muted, align: 'center', wordWrap: { width: L.W - 120 } }))
          .setOrigin(0.5);
      }
    }

    if (!Theme.reducedMotion) {
      this.tweens.add({ targets: this.fullBtn || this.playBtn, scale: 1.05, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: ticket, angle: { from: -8, to: 8 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      title.setAlpha(0);
      this.tweens.add({ targets: title, alpha: 1, y: { from: title.y - 30, to: title.y }, duration: 500, ease: 'Back.easeOut' });
    }
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ENTER', () => this.go(canFull));
      this.input.keyboard.once('keydown-SPACE', () => this.go(false));
    }
  }

  /** Going fullscreen changes the screen shape; the menu picks the new layout up itself. */
  handleLayoutChange() {
    if (this.going) return;
    super.handleLayoutChange();
  }

  /** The one tap: fullscreen (if asked), unlock sound, start the music, open the menu. */
  go(full) {
    if (this.going) return;
    this.going = true;
    // All of this runs inside the tap, which is what browsers require for both.
    if (full) Fullscreen.enter();
    const hub = AudioHub.shared;
    hub.unlock();
    Sfx.shared.clapper();
    this.spots.burst(0.5, 700);
    hub.whenRunning(1200).then(() => {
      FilmiScore.shared.start('menu');
      this.cameras.main.fadeOut(260, 0, 0, 0);
      this.time.delayedCall(280, () => this.scene.start('Menu', {}));
    });
  }
}
