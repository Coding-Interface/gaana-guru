/**
 * SaveStore — best scores, daily results, streak, sound and music settings, in localStorage.
 * Every read and write is guarded, so the game runs even when storage is blocked.
 */
class SaveStore {
  constructor(key = 'dhun-decoder.v1') {
    this.key = key;
    this.data = this.load();
  }

  load() {
    const empty = { days: {}, streak: 0, lastDay: null, bestEndless: 0, bestRound: 0, sound: true, music: true };
    try {
      const raw = window.localStorage.getItem(this.key);
      return raw ? Object.assign(empty, JSON.parse(raw)) : empty;
    } catch (e) {
      return empty;
    }
  }

  save() {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) {
      /* storage unavailable: results last for this visit only */
    }
  }

  getDay(n) {
    return this.data.days[n] || null;
  }

  recordDay(n, entry) {
    if (this.data.days[n]) return this.data.days[n];
    this.data.days[n] = entry;
    this.data.streak = this.data.lastDay === n - 1 ? this.data.streak + 1 : 1;
    this.data.lastDay = n;
    this.save();
    return entry;
  }

  /** Returns true when this is a new best. */
  recordEndless(score, round) {
    const isBest = score > this.data.bestEndless;
    if (isBest) this.data.bestEndless = score;
    this.data.bestRound = Math.max(this.data.bestRound, round);
    this.save();
    return isBest;
  }

  get streak() {
    const today = DailyClock.puzzleNumber();
    const last = this.data.lastDay;
    return last === today || last === today - 1 ? this.data.streak : 0;
  }

  get bestEndless() {
    return this.data.bestEndless;
  }

  get bestRound() {
    return this.data.bestRound;
  }

  get sound() {
    return this.data.sound !== false;
  }

  set sound(on) {
    this.data.sound = on;
    this.save();
  }

  get music() {
    return this.data.music !== false;
  }

  set music(on) {
    this.data.music = on;
    this.save();
  }
}
