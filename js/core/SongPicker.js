/**
 * SongPicker — draws songs for a run without repeats.
 * Showstopper rounds draw a long title from any era.
 */
class SongPicker {
  constructor(rng, deck = window.SONG_DECK) {
    this.rng = rng;
    this.deck = deck;
    this.used = new Set();
  }

  static letters(title) {
    return title.replace(/[^A-Za-z]/g, '').length;
  }

  pick(era, { minLetters = 0 } = {}) {
    const eras = era === 'any' ? Object.keys(this.deck) : [era];
    let pool = [];
    eras.forEach((k) => {
      this.deck[k].forEach((song) => pool.push(Object.assign({ era: k }, song)));
    });
    if (minLetters) {
      const long = pool.filter((x) => SongPicker.letters(x.s) >= minLetters);
      if (long.length) pool = long;
    }
    let fresh = pool.filter((x) => !this.used.has(x.s));
    if (!fresh.length) fresh = pool;
    const song = fresh[this.rng.int(fresh.length)];
    this.used.add(song.s);
    return song;
  }
}
