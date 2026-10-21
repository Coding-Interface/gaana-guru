/**
 * SpinScene — "Lights!" (spin) and "Camera!" (landing) before each round.
 * Drag or flick the wheel (or tap / press Space). Showstopper rounds skip the wheel for a
 * dramatic boss card. Portrait: wheel in the middle; landscape: wheel left, result right.
 *
 * While the wheel turns, the music follows it: it races when flicked and slows down with the
 * wheel, together with the rolling sound, then drops back onto a fresh downbeat as it lands.
 * The pause button (or Esc) opens the pause menu; the run is saved for resuming later.
 */
class SpinScene extends BaseScene {
  constructor() {
    super('Spin');
  }

  init(data) {
    this.restored = !!(data && data.restored);
  }

  create() {
    this.prepare();
    const L = this.L;
    const P = L.portrait;

    this.run = RunState.current;
    if (!this.run) {
      this.scene.start('Menu', {});
      return;
    }
    if (!this.restored) this.run.beginRound();
    this.spun = false;
    this.ready = false;
    this.col = P ? L.cx : 1000;

    this.stage = new Stage(this, { spots: 3, spotAlpha: 0.14, hud: true });
    this.fx = new CinemaFX(this);
    this.effects = new Effects(this);
    this.hud = new HudBar(this, this.run).setOnPause(() => this.openPause());
    this.enableRunControls();
    this.events.once('shutdown', () => {
      if (this.wheel && this.wheel.spinning) {
        ReelRoll.shared.stop();
        FilmiScore.shared.landOnBeat();
      }
    });

    this.btn = new TextButton(this, this.col, P ? 1150 : 600, P ? 520 : 440, P ? 100 : 92, 'Spin', { size: 34, icon: 'ic-play-ink', iconSize: 36, sound: null });

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => this.primary());
      this.input.keyboard.on('keydown-ENTER', () => this.primary());
    }

    FilmiScore.shared.start('groove');

    if (this.run.isBoss) {
      this.showBoss();
      this.persist();
      return;
    }

    const r = P ? 228 : 214;
    this.wheel = new SpinWheel(this, P ? L.cx : 400, P ? 520 : 380, r, WHEEL_SEGMENTS);
    this.wheel.onTap = () => this.spin(0.55, 1);
    this.wheel.onFling = (power, dir) => this.spin(power, dir);
    this.wheel.onSpeed = (s) => {
      FilmiScore.shared.spinTempo(s);
      this.stage.spots.setPace(1 + 4 * s);
      this.fx.followWheel(this.wheel, s);
    };
    this.btn.setOnClick(() => this.spin(0.6, 1));
    this.pulse = this.stage.rig.addPulse(this.wheel.x, this.wheel.y, r * 2.4, Theme.current.spot, 1.6);

    if (!this.restored && !Theme.reducedMotion) {
      this.wheel.setScale(0.7).setAlpha(0);
      this.tweens.add({ targets: this.wheel, scale: 1, alpha: 1, duration: 420, ease: 'Back.easeOut' });
      this.time.delayedCall(700, () => this.wheel.showHint());
    }

    // Rebuilt after a rotation: show the wheel already landed.
    if (this.run.segment) {
      const seg = this.run.segment;
      const idx = WHEEL_SEGMENTS.findIndex((s) => s.era === seg.era && s.mod === seg.mod);
      this.wheel.setLanded(idx);
      this.afterLand(seg, false);
    }
    this.persist();
  }

  isBusy() {
    return !!(this.wheel && this.wheel.spinning);
  }

  snapshot() {
    return { restored: true };
  }

  primary() {
    if (this.ready) this.startRound();
    else if (!this.run.isBoss) this.spin(0.6, 1);
  }

  spin(power, dir) {
    if (this.spun || this.ready || !this.wheel) return;
    this.spun = true;
    this.btn.setEnabled(false).setLabel('…');

    // LIGHTS!
    HypeText.pop(this, this.wheel.x, this.wheel.y - 30, 'Lights!', { size: 88, color: Theme.css.cream, hold: 450 });
    this.stage.spots.burst(0.5, 900);

    const idx = this.run.rng.int(WHEEL_SEGMENTS.length);
    this.wheel.spin(
      idx,
      (seg) => {
        this.run.segment = seg;
        this.stage.spots.setPace(1);
        FilmiScore.shared.landOnBeat();
        this.fx.releaseWheel();
        this.afterLand(seg, true);
        this.persist();
        this.flushLayout();
      },
      { power, dir }
    );
  }

  afterLand(seg, fresh) {
    const tint = Theme.color[ERAS[seg.era].fill];
    this.stage.spots.setColor(tint);
    this.stage.rig.setColor(tint);
    if (this.pulse) this.pulse.setColor(tint);
    if (fresh) {
      // CAMERA!
      Sfx.shared.land();
      Sfx.shared.shutter();
      this.fx.flash([255, 255, 255], 260, 0.5);
      this.fx.punch(1.07, 90);
      this.stage.spots.burst(0.6, 1000);
      this.effects.paparazzi(4, 0.6);
      HypeText.pop(this, this.wheel.x, this.wheel.y, 'Camera!', { size: 88, color: Theme.css.marigold, angle: 5, hold: 500 });
    }
    this.wheel.setHubIcon('ic-check-ink');
    this.showPanel(seg, fresh);
    this.ready = true;
    this.btn.setEnabled(true).setLabel('Action!').setIcon('ic-clapperboard-ink').setOnClick(() => {
      Sfx.shared.clapper();
      this.startRound();
    });
    if (fresh && !Theme.reducedMotion) this.tweens.add({ targets: this.btn, scale: 1.05, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 500 });
    // ACTION! follows by itself a moment later (or straight away with the button).
    if (fresh) this.time.delayedCall(1500, () => this.startRound());
  }

  showPanel(seg, animate) {
    const C = Theme.color;
    const P = this.L.portrait;
    const era = ERAS[seg.era];
    const mod = MODIFIERS[seg.mod];
    const w = P ? 600 : 440;
    const h = P ? 120 : 190;
    const panel = this.add.container(this.col, P ? 960 : 380);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3).fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 24);
    g.fillStyle(C.panel, 0.96).fillRoundedRect(-w / 2, -h / 2, w, h, 24);
    g.fillStyle(C[era.fill], 1).fillRoundedRect(-w / 2, -h / 2, 16, h, { tl: 24, bl: 24, tr: 0, br: 0 });
    panel.add(g);

    const name = this.add.text(P ? -w / 2 + 40 : 0, P ? -18 : -50, era.name, Theme.text(40, { fontFamily: Theme.font.display, color: Theme.css[era.fill] })).setOrigin(P ? 0 : 0.5, 0.5);
    const years = this.add.text(P ? -w / 2 + 42 : 0, P ? 26 : -8, era.years, Theme.text(20, { fontStyle: '700', color: Theme.css.muted })).setOrigin(P ? 0 : 0.5, 0.5);
    const badge = new Badge(this, P ? w / 2 - 110 : 0, P ? 0 : 52, {
      icon: mod.icon,
      text: mod.mult !== 1 ? `×${mod.mult}` : mod.name,
      fill: C.deep,
      color: Theme.css.marigold,
      edge: C.marigold,
      size: 24,
      height: 54
    });
    if (P) badge.x = w / 2 - badge.w / 2 - 24;
    panel.add([name, years, badge]);
    if (animate && !Theme.reducedMotion) {
      this.tweens.add({ targets: panel, scale: { from: 0.85, to: 1 }, alpha: { from: 0, to: 1 }, duration: 340, ease: 'Back.easeOut', delay: 150 });
    }
  }

  showBoss() {
    const L = this.L;
    const P = L.portrait;
    const C = Theme.color;
    this.run.segment = { era: 'any', mod: 'boss' };
    this.stage.spots.setColor(C.rose);
    this.stage.rig.setColor(C.rose);

    const sign = new Marquee(this, L.cx, P ? 470 : 260, 640, P ? 240 : 210, 'Showstopper', { size: 84 });
    this.stage.rig.addPulse(sign.x, sign.y, 520, C.rose, 2);
    Badge.row(this, L.cx, P ? 680 : 430, [
      { icon: 'eye-off', fill: C.deep, edge: C.rose, height: 58 },
      { icon: 'timer', text: '½', fill: C.deep, edge: C.rose, height: 58, size: 26 },
      { icon: 'zap', text: '×3', fill: C.deep, edge: C.marigold, color: Theme.css.marigold, height: 58, size: 26 }
    ]).forEach((b, i) => b.pop(200 + i * 140));

    if (!this.restored) {
      // Dhan … dhan … dhaaan on the sign.
      this.fx.letterbox(true, 70);
      Sfx.shared.dramatic();
      this.fx.tripleZoom(sign.x, sign.y, 1500);
      this.fx.flash([229, 72, 77], 200);
      this.stage.spots.burst(0.6, 1600);
      sign.flash(5);
      if (!Theme.reducedMotion) this.tweens.add({ targets: sign, scale: { from: 0.7, to: 1 }, duration: 500, ease: 'Back.easeOut' });
      this.time.delayedCall(1900, () => this.fx.letterbox(false));
      this.time.delayedCall(3200, () => this.startRound());
    }
    this.ready = true;
    this.btn.setPosition(L.cx, P ? 1130 : 600).setLabel('Action!').setIcon('ic-clapperboard-ink').setOnClick(() => {
      Sfx.shared.clapper();
      this.startRound();
    });
  }

  startRound() {
    if (!this.run.segment || !this.ready) return;
    this.ready = false;
    this.scene.start('Puzzle', {});
  }
}
