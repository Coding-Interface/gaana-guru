/**
 * MenuScene — the lobby: themed stage, marquee title flanked by pumping speakers, how-to tiles
 * (or a Resume card when a game is saved), Daily and Endless buttons, stat badges and icon
 * buttons: one-tap mute, settings, fullscreen (where available) and in test mode the Studio.
 *
 * Resume or start new:
 *   - a saved endless game shows the Resume card, and the Endless button becomes "New"
 *     (tap twice to confirm, so a saved game is never lost by accident)
 *   - a saved daily game is resumed by the Daily button itself (and the card if no endless save)
 */
class MenuScene extends BaseScene {
  constructor() {
    super('Menu');
  }

  init(data) {
    // After a theme change in the Studio the menu rebuilds; the Studio comes back open.
    this.reopenStudio = !!(data && data.studio);
  }

  create() {
    this.prepare();
    const L = this.L;
    const P = L.portrait;
    const C = Theme.color;
    this.store = new SaveStore();
    const dayNo = DailyClock.puzzleNumber();
    const done = this.store.getDay(dayNo);
    const mx = P ? L.cx : 330;
    const savedEndless = RunSaver.load('endless');
    const savedDaily = done ? null : RunSaver.load('daily');
    const saved = savedEndless || savedDaily;

    this.stage = new Stage(this, { spots: 3, spotAlpha: 0.15 });
    this.fx = new CinemaFX(this);

    const sign = new Marquee(this, mx, P ? 250 : 165, P ? 640 : 580, P ? 220 : 200, 'Gaana Guru', { size: P ? 92 : 84 });
    this.stage.rig.addPulse(mx, P ? 250 : 165, 420, Theme.current.spot, 1.4);
    if (!MenuScene.introPlayed && !Theme.reducedMotion) {
      MenuScene.introPlayed = true;
      sign.setScale(0.6).setAlpha(0);
      this.tweens.add({ targets: sign, scale: 1, alpha: 1, duration: 520, ease: 'Back.easeOut', delay: 150 });
      this.time.delayedCall(420, () => {
        this.fx.flash([255, 236, 170], 260, 0.4);
        this.stage.spots.burst(0.5, 900);
        sign.flash(3);
      });
    }

    // Speakers pumping to the music (the Musical theme brings its own stacks).
    if (!Theme.current.speakers) {
      const spots = P ? [[74, 1080], [L.W - 74, 1080]] : [[800, 545], [1120, 545]];
      // Tap a speaker to play its instrument; tap its round chip to choose the instrument.
      spots.forEach(([x, y], i) => new Speaker(this, x, y, { w: 112, h: 164, woofers: 2, depth: 2, meter: true, slot: i, picker: true }));
    }

    // Returning player with a saved game: Resume card in place of the how-to tiles.
    const cardX = P ? 40 : 700;
    const cardY = P ? 430 : 112;
    const cardW = P ? 640 : 520;
    if (saved) {
      new ResumeCard(this, cardX, cardY, cardW, saved, () => RunSaver.resume(this, saved.run.mode));
    } else {
      new HowToStrip(this, cardX, cardY, cardW);
    }

    const dailyLabel = done ? `#${dayNo}` : `Daily #${dayNo}`;
    const dailyIcon = done ? 'ic-circle-check-ink' : savedDaily ? 'ic-play-ink' : 'ic-calendar-days-ink';
    const daily = new TextButton(this, mx, P ? 750 : 380, P ? 580 : 500, P ? 104 : 92, dailyLabel, { size: 34, icon: dailyIcon, iconSize: 38, sound: 'clapper' }).setOnClick(() => {
      if (done) {
        this.scene.start('Wrap', { replay: done, dayNo });
        return;
      }
      if (savedDaily && RunSaver.resume(this, 'daily')) return;
      RunState.start('daily');
      this.scene.start('Spin', {});
    });
    if (!Theme.reducedMotion && !saved) this.tweens.add({ targets: daily, scale: 1.03, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.endlessBtn = new TextButton(this, mx, P ? 872 : 492, P ? 580 : 500, P ? 92 : 84, savedEndless ? 'New' : 'Endless', {
      fill: C.teal,
      textColor: Theme.css.ink,
      size: 32,
      icon: savedEndless ? 'ic-rotate-ccw-ink' : 'ic-infinity-ink',
      iconSize: 38,
      sound: 'clapper'
    }).setOnClick(() => this.startEndless(!!savedEndless));

    const best = this.store.bestEndless;
    Badge.row(this, P ? L.cx : 960, P ? 980 : 345, [
      { icon: 'flame', text: String(this.store.streak), edge: C.panelEdge },
      { icon: 'trophy', text: String(best), edge: C.panelEdge }
    ]).forEach((b, i) => b.pop(300 + i * 120));

    const ty = P ? 1090 : 610;
    const toggles = [];
    this.muteBtn = new IconButton(this, 0, ty, 64, 'ic-volume-2-cream').setSound(false).setOnClick(() => this.toggleMute());
    toggles.push(this.muteBtn);
    toggles.push(new IconButton(this, 0, ty, 64, 'ic-settings-cream').setOnClick(() => this.openSettings()));
    if (Fullscreen.available) {
      this.fullBtn = new IconButton(this, 0, ty, 64, 'ic-maximize-cream').setSound(false).setOnClick(() => {
        Sfx.shared.lightSwitch(!Fullscreen.active);
        Fullscreen.toggle();
      });
      toggles.push(this.fullBtn);
      const sync = () => this.refreshToggles();
      this.scale.on('enterfullscreen', sync);
      this.scale.on('leavefullscreen', sync);
      this.events.once('shutdown', () => {
        this.scale.off('enterfullscreen', sync);
        this.scale.off('leavefullscreen', sync);
      });
    }
    if (Studio.testMode) {
      toggles.push(new IconButton(this, 0, ty, 64, 'ic-palette-cream').setOnClick(() => this.openStudio()));
      new Badge(this, L.W - 70, P ? 1236 : 690, { text: 'TEST', fill: C.rose, size: 16, height: 30 }).setDepth(47);
    }
    toggles.forEach((b, i) => {
      b.x = mx + (i - (toggles.length - 1) / 2) * 90;
    });
    this.refreshToggles();

    this.add
      .text(P ? L.cx : 960, P ? 1252 : 700, 'Emoji: Twemoji (CC BY 4.0)  ·  Icons: Lucide (ISC)  ·  Music: original', Theme.text(14, { fontStyle: '600', color: '#9E6A78' }))
      .setOrigin(0.5)
      .setDepth(47);

    this.startMusicOnGesture();
    if (this.reopenStudio && Studio.testMode) this.openStudio(false);
  }

  /** New endless run. With a saved one, the first tap asks ("Sure?") and the second starts. */
  startEndless(hasSave) {
    if (hasSave && !this.confirmNew) {
      this.confirmNew = true;
      this.endlessBtn.setLabel('Sure?').paint(Theme.color.rose);
      this.time.delayedCall(3000, () => {
        if (!this.confirmNew) return;
        this.confirmNew = false;
        this.endlessBtn.setLabel('New').paint(Theme.color.teal);
      });
      return;
    }
    this.confirmNew = false;
    RunSaver.clear('endless');
    RunState.start('endless');
    this.scene.start('Spin', {});
  }

  /** Browsers only allow audio after a tap or key press. */
  startMusicOnGesture() {
    const kick = () => FilmiScore.shared.start('menu');
    if (AudioHub.shared.running) {
      kick();
      return;
    }
    this.input.once('pointerdown', kick);
    if (this.input.keyboard) this.input.keyboard.once('keydown', kick);
  }

  openSettings() {
    FilmiScore.shared.start('menu');
    let calmChanged = false;
    new SettingsPanel(this, {
      mode: 'settings',
      onClose: () => {
        // Calm mode changes what gets built, so rebuild the lobby with it.
        if (calmChanged) this.scene.restart({});
        else this.refreshToggles();
      },
      onChange: (key) => {
        if (key === 'calm') calmChanged = !calmChanged;
        this.refreshToggles();
      }
    });
  }

  openStudio(sound = true) {
    FilmiScore.shared.start('menu');
    new StudioPanel(this, {
      sound,
      onTheme: (key) => {
        Theme.apply(key);
        this.scene.restart({ studio: true });
      },
      onBgm: (key) => {
        FilmiScore.shared.setStyle(key);
        if (!FilmiScore.shared.playing) FilmiScore.shared.start('menu');
      }
    });
  }

  toggleMute() {
    const on = Settings.toggleMute();
    if (on) {
      Sfx.shared.lightSwitch(true);
      FilmiScore.shared.start('menu');
    }
    this.refreshToggles();
  }

  refreshToggles() {
    const on = Settings.audible;
    this.muteBtn.setIcon(on ? 'ic-volume-2-cream' : 'ic-volume-x-cream').setOff(!on);
    if (this.fullBtn && this.fullBtn.active) this.fullBtn.setIcon(Fullscreen.active ? 'ic-minimize-cream' : 'ic-maximize-cream');
  }
}

MenuScene.introPlayed = false;
