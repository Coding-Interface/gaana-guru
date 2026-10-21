/**
 * RunState — one play session: lives, score, combo, rounds and the share grid.
 *
 * Modes:
 *   daily   — 8 seeded rounds, the same wheel results and songs for everyone. Round 8 is a Showstopper.
 *   endless — keep going until 3 lives are gone. Every 5th round is a Showstopper and the clock tightens.
 *
 * Scoring per solved song:
 *   100 base + up to 200 for speed − 40 per revealed letter, × 0.75 if the film was shown,
 *   × the round modifier, × the combo (clean solves in a row: ×1, ×1.25, ×1.5 … up to ×2).
 */
class RunState {
  constructor(mode, seed) {
    this.mode = mode;
    this.seed = seed;
    this.rng = new Rng(seed);
    this.picker = new SongPicker(this.rng);
    this.lives = RunState.LIVES;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.round = 0;
    this.solved = 0;
    this.grid = [];
    this.segment = null;
    this.history = [];
  }

  get isDaily() {
    return this.mode === 'daily';
  }

  get isBoss() {
    return this.isDaily ? this.round === RunState.DAILY_ROUNDS : this.round % RunState.BOSS_EVERY === 0;
  }

  get over() {
    return this.lives <= 0 || (this.isDaily && this.round >= RunState.DAILY_ROUNDS);
  }

  get comboMult() {
    return 1 + 0.25 * Math.min(Math.max(this.combo - 1, 0), 4);
  }

  beginRound() {
    this.round += 1;
    this.segment = null;
  }

  pickSong() {
    const seg = this.segment;
    return this.picker.pick(seg.era, { minLetters: seg.mod === 'boss' ? 14 : 0 });
  }

  /** Seconds on the clock for this song. */
  timeFor(song, mod) {
    const letters = SongPicker.letters(song.s);
    let t = Phaser.Math.Clamp(38 + letters * 1.5, 45, 80);
    if (!this.isDaily) t *= Math.max(0.7, 1 - 0.025 * (this.round - 1));
    return Math.round(t * mod.time);
  }

  recordSolve({ left, total, mod, letterHints, filmShown, song }) {
    const frac = Math.max(0, left) / total;
    const speed = Math.round(200 * frac);
    let base = Math.max(20, 100 + speed - 40 * letterHints);
    if (filmShown) base = Math.round(base * 0.75);

    const clean = letterHints === 0 && !filmShown;
    this.combo = clean ? this.combo + 1 : 0;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const comboMult = clean ? this.comboMult : 1;
    const points = Math.round(base * mod.mult * comboMult);

    const fast = frac >= 0.5;
    this.score += points;
    this.solved += 1;
    this.grid.push(clean ? (fast ? '⚡' : '🟩') : '🟨');
    this.history.push({ song, solved: true, points });
    return { points, speed, comboMult, mult: mod.mult, clean, fast, letterHints, filmShown };
  }

  recordMiss(song) {
    this.lives -= 1;
    this.combo = 0;
    this.grid.push('🟥');
    this.history.push({ song, solved: false, points: 0 });
  }

  /** Everything needed to carry on later, including the random generator's position. */
  toJSON() {
    return {
      mode: this.mode,
      seed: this.seed,
      rng: this.rng.state,
      used: [...this.picker.used],
      lives: this.lives,
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      round: this.round,
      solved: this.solved,
      grid: this.grid.slice(),
      segment: this.segment,
      history: this.history.slice()
    };
  }

  static fromJSON(o) {
    const run = new RunState(o.mode, o.seed);
    run.rng.state = o.rng >>> 0;
    run.picker.used = new Set(o.used || []);
    ['lives', 'score', 'combo', 'bestCombo', 'round', 'solved', 'grid', 'segment', 'history'].forEach((k) => {
      if (o[k] !== undefined) run[k] = o[k];
    });
    return run;
  }

  static start(mode) {
    const seed = mode === 'daily' ? 777 + DailyClock.dayIndex() * 101 : Date.now() & 0x7fffffff;
    RunState.current = new RunState(mode, seed);
    return RunState.current;
  }
}

RunState.LIVES = 3;
RunState.DAILY_ROUNDS = 8;
RunState.BOSS_EVERY = 5;
RunState.current = null;
