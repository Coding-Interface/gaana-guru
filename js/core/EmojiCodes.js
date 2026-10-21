/**
 * EmojiCodes — splits an emoji clue into single emoji and maps each one to its
 * Twemoji file name (code points in hex joined by "-"; the FE0F variation selector
 * is dropped unless the emoji is a ZWJ sequence, which is Twemoji's own rule).
 */
class EmojiCodes {
  static split(str) {
    if (window.Intl && Intl.Segmenter) {
      return [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(str)].map((s) => s.segment);
    }
    return Array.from(str);
  }

  static fileFor(emoji) {
    let cps = [...emoji].map((c) => c.codePointAt(0).toString(16));
    if (!cps.includes('200d')) cps = cps.filter((c) => c !== 'fe0f');
    return cps.join('-');
  }

  static keyFor(emoji) {
    return `emo-${EmojiCodes.fileFor(emoji)}`;
  }

  /** Every Twemoji file the deck needs. */
  static filesInDeck(deck = window.SONG_DECK) {
    const files = new Set();
    Object.values(deck).forEach((songs) => {
      songs.forEach((song) => EmojiCodes.split(song.e).forEach((e) => files.add(EmojiCodes.fileFor(e))));
    });
    return [...files];
  }
}
