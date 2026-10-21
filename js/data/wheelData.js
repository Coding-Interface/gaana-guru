/**
 * Wheel data — eras, round modifiers and the eight wheel segments.
 */
window.ERAS = {
  bw: { name: 'Black & White', short: 'B&W', years: '1950s–60s', fill: 'silver' },
  retro: { name: 'Retro Masala', short: 'RETRO', years: '1970s–80s', fill: 'magenta' },
  nineties: { name: 'Nineties', short: "90s", years: '1990s', fill: 'teal' },
  newwave: { name: 'New Wave', short: 'NEW', years: '2000s–now', fill: 'marigold' },
  any: { name: 'Any Era', short: 'ANY', years: '1950s–now', fill: 'rose' }
};

window.MODIFIERS = {
  classic: { icon: 'clapperboard', name: 'Classic', label: 'CLASSIC', rule: 'A standard round.', mult: 1, time: 1 },
  double: { icon: 'zap', name: 'Double', label: 'DOUBLE ×2', rule: 'Every point counts twice.', mult: 2, time: 1 },
  blitz: { icon: 'timer', name: 'Blitz', label: 'BLITZ', rule: 'Half the clock. Points ×1.5.', mult: 1.5, time: 0.55 },
  nohints: { icon: 'eye-off', name: 'No hints', label: 'NO HINTS', rule: 'Hints are locked. Points ×1.5.', mult: 1.5, time: 1, noHints: true },
  vowels: { icon: 'type', name: 'Vowels free', label: 'VOWELS', rule: 'A E I O U start filled in. Points ×0.75.', mult: 0.75, time: 1, vowels: true },
  boss: { icon: 'flame', name: 'Showstopper', label: 'SHOWSTOPPER', rule: 'Any era, a long title, a short clock and no hints. Points ×3.', mult: 3, time: 0.6, noHints: true }
};

window.WHEEL_SEGMENTS = [
  { era: 'bw', mod: 'classic' },
  { era: 'retro', mod: 'double' },
  { era: 'nineties', mod: 'blitz' },
  { era: 'newwave', mod: 'nohints' },
  { era: 'bw', mod: 'vowels' },
  { era: 'retro', mod: 'blitz' },
  { era: 'nineties', mod: 'double' },
  { era: 'newwave', mod: 'classic' }
];
