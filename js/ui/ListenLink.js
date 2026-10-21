/**
 * ListenLink — a real "Listen on YouTube" link placed over the canvas with Phaser's DOM layer.
 * It opens a YouTube search for the song in a new tab: the game links to the official
 * music instead of hosting any of it.
 */
class ListenLink {
  static url(song) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.s} ${song.f} song`)}`;
  }

  /** label: 'Listen on YouTube' or a short 'Listen'; originX 1 right-aligns it at x. */
  static create(scene, x, y, song, { label: text = 'Listen on YouTube', originX = 0.5 } = {}) {
    const a = document.createElement('a');
    a.className = 'listen-link';
    a.href = ListenLink.url(song);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `Listen to ${song.s} on YouTube (opens a new tab)`);

    const label = document.createElement('span');
    label.textContent = text;
    const icon = document.createElement('img');
    icon.src = 'assets/icons/external-link-ink.svg';
    icon.alt = '';
    icon.width = 22;
    icon.height = 22;
    a.append(label, icon);

    // Phaser positions (and sets display on) the element it is given, so the link
    // sits inside a wrapper and keeps its own layout and fade-in.
    const wrap = document.createElement('div');
    wrap.className = 'listen-wrap';
    wrap.append(a);
    // Keep the tap from also reaching the game canvas.
    wrap.addEventListener('pointerdown', (e) => e.stopPropagation());
    return scene.add.dom(x, y, wrap).setOrigin(originX, 0.5).setDepth(40);
  }
}

/** Approximate width of the short 'Listen' link in game pixels (for laying out around it). */
ListenLink.SHORT_W = 140;
