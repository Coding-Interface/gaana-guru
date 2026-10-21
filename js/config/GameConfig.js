/**
 * GAME_CONFIG — the one place to decide how the game ships.
 *
 *   mode: 'test'   A Studio button on the menu lets you try every theme and music style live.
 *                  Choices made there are remembered on this device only.
 *   mode: 'final'  No Studio. The game always uses the theme and bgm below.
 *
 *   theme: 'cinema' | 'musical' | 'holi' | 'diwali' | 'christmas'
 *   bgm:   'keherwa' | 'disco' | 'bhangra' | 'lofi'
 *
 * The Studio shows the exact line to paste here once you have picked a combination.
 */
window.GAME_CONFIG = {
  mode: 'test',
  theme: 'cinema',
  bgm: 'keherwa'
};
