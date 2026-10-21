/**
 * Theme — colours, fonts and text helpers.
 * Look: a single-screen cinema hall — deep maroon velvet, marquee bulbs,
 * marigold, magenta and teal like hand-painted film posters.
 * Screen sizes live in Layout; festival palettes live in THEMES and are swapped in by apply().
 */
class Theme {
  /** Phaser text style with crisp rendering and theme defaults. */
  static text(size, overrides = {}) {
    return Object.assign(
      {
        fontFamily: Theme.font.ui,
        fontSize: `${size}px`,
        color: Theme.css.cream,
        resolution: 2
      },
      overrides
    );
  }

  /** Readable text colour on a filled shape of the named colour. */
  static onFill(name) {
    return name === 'magenta' || name === 'rose' ? Theme.css.cream : Theme.css.ink;
  }

  /** Trim a text object with an ellipsis until it fits maxW. */
  static clip(t, maxW) {
    let s = t.text;
    while (t.width > maxW && s.length > 1) {
      s = s.slice(0, -1);
      t.setText(`${s.trimEnd()}…`);
    }
    return t;
  }

  /** Switch the palette to a theme from THEMES (call before scenes build their objects). */
  static apply(key) {
    const theme = THEMES[key] || THEMES.cinema;
    const P = theme.palette;
    ['bg', 'panel', 'panelEdge', 'deep', 'marigold', 'marigoldShade'].forEach((k) => {
      Theme.color[k] = P[k];
    });
    Object.assign(Theme.css, P.css);
    Theme.key = THEMES[key] ? key : 'cinema';
    Theme.current = theme;
    try {
      document.body.style.background = P.bodyBg;
      // Panels drawn in HTML (pause menu, Studio) pick up the theme from these.
      const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
      const root = document.documentElement.style;
      root.setProperty('--bg', P.bodyBg);
      root.setProperty('--panel', hex(P.panel));
      root.setProperty('--edge', hex(P.panelEdge));
      root.setProperty('--marigold', P.css.marigold);
      root.setProperty('--muted', P.css.muted);
    } catch (e) {
      /* no document (tests) */
    }
  }

  /** Calm mode from Settings, or the device's own "reduce motion" preference. */
  static get reducedMotion() {
    if (typeof Settings !== 'undefined' && Settings.data.calm) return true;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }
}

Theme.color = {
  bg: 0x3b0d1c,
  panel: 0x561428,
  panelEdge: 0x7a2036,
  deep: 0x260812,
  cream: 0xfff1d6,
  creamShade: 0xe2cfa8,
  ink: 0x2a0a14,
  marigold: 0xf5b700,
  marigoldShade: 0xc28f00,
  magenta: 0xe8467c,
  magentaShade: 0xb02c5c,
  teal: 0x1fb5a6,
  tealShade: 0x13867b,
  silver: 0xe9e1d3,
  silverShade: 0xb9ad98,
  rose: 0xe5484d,
  roseShade: 0xa82e33,
  mint: 0x5fd39a,
  mintShade: 0x35a06e,
  bulb: 0xffe28a,
  bulbOff: 0x7a3a1a
};

Theme.css = {
  cream: '#FFF1D6',
  ink: '#2A0A14',
  inkSoft: '#7A4A55',
  marigold: '#F5B700',
  magenta: '#FF7BA6',
  teal: '#4FD8C9',
  silver: '#F1E9DA',
  rose: '#FF8A8A',
  mint: '#7EE3B0',
  muted: '#D9A9B4'
};

Theme.font = {
  display: '"Rozha One", Georgia, serif',
  ui: '"Baloo 2", "Segoe UI", sans-serif',
  emoji: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
};

Theme.key = 'cinema';
Theme.current = null;
