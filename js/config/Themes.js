/**
 * THEMES — palettes, lights and decorations for each look.
 *
 *   palette     colours swapped into Theme.color / Theme.css
 *   bulbs       bulb colours for marquees, the wheel rim and fairy lights (they cycle along the string)
 *   spots       one colour per moving stage spotlight (left, centre, right)
 *   ambient     Light2D ambient colour for the backdrop (how dark the room is)
 *   spot        key-light colour over the stage
 *   speakers    true when the theme's ambience already has speaker stacks
 *   emoji       badge used in the Studio
 */
window.THEMES = {
  cinema: {
    name: 'Cinema',
    emoji: '🎬',
    palette: {
      bg: 0x3b0d1c, panel: 0x561428, panelEdge: 0x7a2036, deep: 0x260812,
      marigold: 0xf5b700, marigoldShade: 0xc28f00, bodyBg: '#3B0D1C',
      css: { marigold: '#F5B700', muted: '#D9A9B4' }
    },
    bulbs: [0xffd98a, 0xff5e7a, 0xffd98a, 0x5ec8ff, 0xffd98a, 0x8affa0],
    spots: [0xff6b8a, 0xffe2a8, 0x6bc8ff],
    ambient: 0x5a4850,
    spot: 0xffe2a8
  },
  musical: {
    name: 'Musical',
    emoji: '🎤',
    palette: {
      bg: 0x0e0a26, panel: 0x1f1748, panelEdge: 0x3a2b7a, deep: 0x070518,
      marigold: 0xffd23f, marigoldShade: 0xd4a514, bodyBg: '#0E0A26',
      css: { marigold: '#FFD23F', muted: '#B9B0E8' }
    },
    bulbs: [0xff3df2, 0x3dfcff, 0xfff03d, 0x7dff5a, 0xff7a3d],
    spots: [0xff3df2, 0x3dfcff, 0xfff03d],
    ambient: 0x3a3460,
    spot: 0xc9b8ff,
    speakers: true
  },
  holi: {
    name: 'Holi',
    emoji: '🎨',
    palette: {
      bg: 0x2a0f4a, panel: 0x40196b, panelEdge: 0x5c2a92, deep: 0x190833,
      marigold: 0xffd23f, marigoldShade: 0xd4a514, bodyBg: '#2A0F4A',
      css: { marigold: '#FFD23F', muted: '#CDB8EA' }
    },
    bulbs: [0xff4fa3, 0xffd23f, 0x3ddc84, 0x29c5ff, 0xff8a3d],
    spots: [0xff4fa3, 0xffd23f, 0x29c5ff],
    ambient: 0x5a4a78,
    spot: 0xff9ad5
  },
  diwali: {
    name: 'Diwali',
    emoji: '🪔',
    palette: {
      bg: 0x140f33, panel: 0x231a52, panelEdge: 0x3a2d7a, deep: 0x0a0720,
      marigold: 0xffb703, marigoldShade: 0xcc8a00, bodyBg: '#140F33',
      css: { marigold: '#FFB703', muted: '#BDB2E4' }
    },
    bulbs: [0xffc94a, 0xff5e3a, 0xff3da5, 0x3dd9ff, 0x9dff5a],
    spots: [0xff4fa3, 0xffc46b, 0x7d6bff],
    ambient: 0x403660,
    spot: 0xffc46b
  },
  christmas: {
    name: 'Christmas',
    emoji: '🎄',
    palette: {
      bg: 0x0c2a24, panel: 0x123f35, panelEdge: 0x1d5a4b, deep: 0x061a15,
      marigold: 0xf2c14e, marigoldShade: 0xc29a2e, bodyBg: '#0C2A24',
      css: { marigold: '#F2C14E', muted: '#A9CFC2' }
    },
    bulbs: [0xff4d4d, 0x4ddc6b, 0xf2c14e, 0x5aa9ff, 0xfff6e0],
    spots: [0xff5a5a, 0xd6f0ff, 0x4ddc6b],
    ambient: 0x3c5458,
    spot: 0xd6f0ff
  }
};

/** Background music styles (the music itself lives in js/audio/styles/). */
window.BGM_STYLES = {
  keherwa: { name: 'Keherwa', emoji: '🥁' },
  disco: { name: '80s Disco', emoji: '🪩' },
  bhangra: { name: 'Bhangra', emoji: '🪘' },
  lofi: { name: 'Lo-fi', emoji: '🎧' }
};
