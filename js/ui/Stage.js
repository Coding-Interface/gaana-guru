/**
 * Stage — everything behind the UI for one scene, for the active theme:
 * painted backdrop, coloured stage spotlights with pools of light on the floor,
 * Light2D lighting and the living ambience.
 *
 *   const stage = new Stage(this, { spots: 3, hud: true });  // hud: keep the top strip clear
 *   stage.spots.burst();          // flare the beams
 *   stage.rig.addPulse(x, y, r, color);
 */
class Stage {
  constructor(scene, { spots = 3, spotAlpha = 0.14, ambience = true, hud = false } = {}) {
    const theme = Theme.current || THEMES.cinema;
    this.backdrop = new Backdrop(scene, Theme.key);
    this.spots = new Spotlights(scene, { count: spots, alpha: spotAlpha });
    this.rig = new LightRig(scene, this.backdrop, this.spots, theme);
    if (ambience) this.ambience = new Ambience(scene, Theme.key, -12, { hud });
  }
}
