/**
 * Rng — small seeded random generator (mulberry32).
 * The same seed always gives the same sequence, so every player
 * gets identical scrambles and option orders for the daily puzzle.
 */
class Rng {
  constructor(seed) {
    this.state = seed >>> 0 || 1;
  }

  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(max) {
    return Math.floor(this.next() * max);
  }

  shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Shuffle a word's letters, making sure the result differs from the word. */
  scramble(word) {
    if (new Set(word).size < 2) return word;
    let out = word;
    let guard = 0;
    while (out === word && guard < 25) {
      out = this.shuffle(word.split('')).join('');
      guard++;
    }
    return out;
  }
}
