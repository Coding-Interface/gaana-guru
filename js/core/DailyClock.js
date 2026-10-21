/**
 * DailyClock — turns the player's local date into a puzzle number.
 * Puzzle #1 is 19 Oct 2026. A new puzzle unlocks at local midnight.
 */
class DailyClock {
  static dayKey(d) {
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }

  static dayIndex(now = new Date()) {
    const diff = DailyClock.dayKey(now) - DailyClock.dayKey(DailyClock.EPOCH);
    return Math.max(0, Math.round(diff / 86400000));
  }

  static puzzleNumber(now = new Date()) {
    return DailyClock.dayIndex(now) + 1;
  }

  static msToNext(now = new Date()) {
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return next - now;
  }

  static formatCountdown(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
    return parts.map((v) => String(v).padStart(2, '0')).join(':');
  }
}

DailyClock.EPOCH = new Date(2026, 9, 19);
