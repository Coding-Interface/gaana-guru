/**
 * WrapScene — the premiere night: score, the reel of songs, records and sharing,
 * with spotlights, paparazzi flashes and confetti for a good show.
 * Also shows a finished daily reel again from the menu.
 * Portrait stacks everything; landscape puts the song list on the right.
 */
class WrapScene extends BaseScene {
  constructor() {
    super('Wrap');
  }

  init(data) {
    this.replay = data && data.replay ? data.replay : null;
    this.dayNo = (data && data.dayNo) || DailyClock.puzzleNumber();
    this.isBest = !!(data && data.isBest);
    this.restored = !!(data && data.restored);
  }

  create() {
    this.prepare();
    const L = this.L;
    const P = L.portrait;
    const C = Theme.color;
    const store = new SaveStore();

    this.stage = new Stage(this, { spots: 3, spotAlpha: 0.15 });
    this.fx = new CinemaFX(this);
    this.effects = new Effects(this);

    let summary;
    if (this.replay) {
      summary = this.replay;
    } else {
      const run = RunState.current;
      if (!run) {
        this.scene.start('Menu', {});
        return;
      }
      summary = {
        mode: run.mode,
        score: run.score,
        solved: run.solved,
        rounds: run.round,
        bestCombo: run.bestCombo,
        grid: run.grid.slice(),
        songs: run.history.map((h) => ({ s: h.song.s, f: h.song.f, ok: h.solved, p: h.points }))
      };
      if (run.isDaily) store.recordDay(this.dayNo, summary);
      else this.isBest = store.recordEndless(run.score, run.round);
      RunState.current = null;
      RunSaver.clear(run.mode);
    }
    this.summary = summary;
    const daily = summary.mode === 'daily';
    const fresh = !this.replay;
    const bigNight = this.isBest || (daily && summary.solved >= 6) || summary.solved >= 8;

    FilmiScore.shared.stop(0.8);

    const mx = P ? L.cx : 330;
    const sign = new Marquee(this, mx, P ? 170 : 108, P ? 620 : 540, P ? 190 : 150, "That's a wrap!", { size: P ? 70 : 56 });
    this.stage.rig.addPulse(mx, P ? 345 : 300, 420, Theme.current.spot, 1.6);

    const scoreY = P ? 345 : 300;
    const scoreText = this.add.text(mx, scoreY, String(fresh ? 0 : summary.score), Theme.text(P ? 116 : 92, { fontFamily: Theme.font.display, color: Theme.css.marigold })).setOrigin(0.5);
    if (fresh) {
      Sfx.shared.curtain();
      this.fx.letterbox(true, P ? 80 : 50);
      this.time.delayedCall(1400, () => this.fx.letterbox(false, 0, 500));
      if (!Theme.reducedMotion) this.tweens.add({ targets: sign, y: { from: sign.y - 260, to: sign.y }, duration: 600, ease: 'Bounce.easeOut' });
      this.tweens.addCounter({
        from: 0,
        to: summary.score,
        duration: 1100,
        delay: 300,
        ease: 'Cubic.easeOut',
        onUpdate: (tw) => scoreText.setText(String(Math.round(tw.getValue()))),
        onComplete: () => {
          this.fx.flash([255, 241, 214], 200);
          this.fx.punch(1.05, 90);
          this.stage.spots.burst(0.55, 1200);
          sign.flash(4);
          this.effects.paparazzi(bigNight ? 14 : 6, 1.4);
          if (bigNight) {
            this.effects.confettiAt(mx, scoreY, 150);
            HypeText.pop(this, mx, scoreY - (P ? 82 : 80), this.isBest ? 'New record!' : 'Blockbuster!', { size: P ? 72 : 44, hold: 1000, angle: -4 });
          }
        }
      });
    }
    const C2 = Theme.color;
    if (daily) this.drawGrid(mx, P ? 440 : 382, summary.grid, fresh);
    const statsY = P ? (daily ? 516 : 440) : daily ? 450 : 390;
    const chips = [
      { icon: 'circle-check', text: daily ? `${summary.solved}/${summary.rounds}` : String(summary.solved) },
      { icon: 'flame', text: String(summary.bestCombo) },
      daily ? { icon: 'calendar-days', text: String(store.streak) } : { icon: 'trophy', text: this.isBest ? 'NEW' : String(store.bestEndless), color: this.isBest ? Theme.css.mint : Theme.css.cream }
    ];
    Badge.row(this, mx, statsY, chips.map((c) => Object.assign({ fill: C2.panel, edge: C2.panelEdge, size: 22, height: 48 }, c))).forEach((b, i) => {
      if (fresh) b.pop(500 + i * 140);
    });
    if (daily) {
      this.countdown = this.add.text(mx, statsY + 46, '', Theme.text(20, { fontStyle: '700', color: Theme.css.muted })).setOrigin(0.5);
      this.tick();
      this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tick() });
    }

    if (P) this.drawReel(L.cx, statsY + (daily ? 90 : 56), 640, summary.songs, daily ? 8 : 9, fresh);
    else this.drawReel(960, 70, 580, summary.songs, 11, fresh);

    const by = P ? 1120 : 568;
    const bw = P ? 280 : 250;
    new TextButton(this, mx - bw / 2 - 12, by, bw, P ? 88 : 80, 'Share', { fill: C.cream, textColor: Theme.css.ink, size: 28, icon: 'ic-share-2-ink' }).setOnClick(() => this.share());
    const again = new TextButton(this, mx + bw / 2 + 12, by, bw, P ? 88 : 80, daily ? '' : 'Again', { size: 28, icon: daily ? 'ic-infinity-ink' : 'ic-rotate-ccw-ink', iconSize: 36, sound: 'clapper' }).setOnClick(() => {
      RunState.start('endless');
      this.scene.start('Spin', {});
    });
    if (!Theme.reducedMotion) this.tweens.add({ targets: again, scale: 1.04, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1500 });
    new TextButton(this, mx, P ? 1218 : 658, 120, 56, '', { fill: C.panel, textColor: Theme.css.muted, size: 22, icon: 'ic-house-cream', iconSize: 28 })
      .setDepth(47)
      .setOnClick(() => this.scene.start('Menu', {}));
    this.toast = this.add.text(P ? L.cx : 960, P ? 1060 : 680, '', Theme.text(20, { fontStyle: '700', color: Theme.css.mint })).setOrigin(0.5);
  }

  snapshot() {
    return { replay: this.summary, dayNo: this.dayNo, isBest: this.isBest, restored: true };
  }

  tick() {
    this.countdown.setText(`Next daily reel in ${DailyClock.formatCountdown(DailyClock.msToNext())}`);
  }

  drawGrid(cx, y, grid, animate) {
    const C = Theme.color;
    const fill = { '⚡': C.marigold, '🟩': C.mint, '🟨': C.teal, '🟥': C.rose };
    const size = 56;
    const gap = 12;
    const total = RunState.DAILY_ROUNDS;
    const x0 = cx - (total * size + (total - 1) * gap) / 2 + size / 2;
    for (let i = 0; i < total; i++) {
      const mark = grid[i];
      const x = x0 + i * (size + gap);
      const g = this.add.graphics({ x, y });
      g.fillStyle(mark ? fill[mark] : C.panel, 1).fillRoundedRect(-size / 2, -size / 2, size, size, 14);
      if (mark === '⚡') {
        g.fillStyle(C.ink, 1).fillPoints([{ x: 4, y: -16 }, { x: -10, y: 3 }, { x: -1, y: 3 }, { x: -5, y: 16 }, { x: 10, y: -4 }, { x: 1, y: -4 }], true);
      }
      if (animate && !Theme.reducedMotion) {
        g.setScale(0);
        this.tweens.add({ targets: g, scale: 1, duration: 260, delay: 300 + i * 80, ease: 'Back.easeOut' });
      }
    }
  }

  drawReel(cx, top, w, songs, maxRows, animate) {
    const C = Theme.color;
    const rows = songs.slice(-maxRows);
    const rowH = 44;
    const h = 52 + Math.max(1, rows.length) * rowH;
    const g = this.add.graphics();
    g.fillStyle(C.panel, 0.94).fillRoundedRect(cx - w / 2, top, w, h, 22);
    this.add.text(cx - w / 2 + 26, top + 16, songs.length > maxRows ? `TONIGHT'S REEL  ·  LAST ${maxRows}` : "TONIGHT'S REEL", Theme.text(16, { fontStyle: '800', color: Theme.css.marigold, letterSpacing: 3 }));
    rows.forEach((r, i) => {
      const y = top + 66 + i * rowH;
      const dot = this.add.graphics({ x: cx - w / 2 + 38, y });
      dot.fillStyle(r.ok ? C.mint : C.rose, 1).fillCircle(0, 0, 9);
      const name = this.add.text(cx - w / 2 + 60, y, r.s, Theme.text(22, { fontStyle: '700' })).setOrigin(0, 0.5);
      Theme.clip(name, w - 200);
      const pts = this.add.text(cx + w / 2 - 26, y, r.ok ? `+${r.p}` : 'missed', Theme.text(21, { fontStyle: '800', color: r.ok ? Theme.css.marigold : Theme.css.rose })).setOrigin(1, 0.5);
      if (animate && !Theme.reducedMotion) {
        [dot, name, pts].forEach((o) => {
          o.setAlpha(0);
          this.tweens.add({ targets: o, alpha: 1, duration: 220, delay: 600 + i * 120 });
        });
      }
    });
  }

  share() {
    const s = this.summary;
    const text =
      s.mode === 'daily'
        ? `Gaana Guru #${this.dayNo}  ·  ${s.score} pts\n${s.grid.join('')}\nCracked ${s.solved}/${s.rounds} filmi songs`
        : `Gaana Guru endless  ·  ${s.score} pts\nReached round ${s.rounds}, cracked ${s.solved} filmi songs. Beat that!`;
    ShareSheet.copy(text).then((ok) => {
      if (ok) this.toast.setText('Copied. Paste it in your group chat.');
      else ShareSheet.show(this, text);
    });
  }
}
