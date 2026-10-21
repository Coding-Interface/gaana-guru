/**
 * LightRig — real lighting with Phaser's Light2D (WebGL only).
 *
 * The backdrop is set to the Light2D pipeline and a dim ambient colour. Each stage spotlight
 * gets a point light of its own colour riding down its beam, near where it meets the floor,
 * so the backdrop is actually lit in pink, gold, blue … wherever the beams sweep. A soft key
 * light keeps the room from going pitch black, and pulse lights can breathe behind the wheel
 * or a sign. On the Canvas renderer (old browsers) the backdrop is simply dimmed.
 */
class LightRig {
  constructor(scene, backdrop, spots, theme) {
    this.scene = scene;
    this.spots = spots;
    this.lights = [];
    this.enabled = scene.sys.game.renderer.type === Phaser.WEBGL;
    const { W, H } = Layout.current;

    if (!this.enabled) {
      backdrop.image.setAlpha(0.85);
      return;
    }
    scene.lights.enable().setAmbientColor(theme.ambient);
    backdrop.image.setPipeline('Light2D');

    spots.beams.forEach((beam, i) => {
      this.lights.push(scene.lights.addLight(0, 0, Math.max(W, H) * 0.4, spots.colors[i], 2.4));
    });
    spots.onColor = (i, color) => {
      if (this.lights[i]) this.lights[i].setColor(color);
    };
    // A soft key light near the top so the room is never pitch black.
    scene.lights.addLight(W / 2, H * 0.18, Math.max(W, H) * 0.55, theme.spot, 0.7);

    const follow = () => this.follow();
    scene.events.on('update', follow);
    scene.events.once('shutdown', () => scene.events.off('update', follow));
    this.follow();
  }

  follow() {
    this.spots.beams.forEach((beam, i) => {
      const light = this.lights[i];
      if (!light) return;
      const p = this.spots.hitPoint(i, 0.78);
      light.x = p.x;
      light.y = p.y;
      light.intensity = 0.8 + beam.alpha * 10;
    });
  }

  /** A coloured light that breathes behind something (the wheel, a sign). */
  addPulse(x, y, radius, color, intensity = 1.6) {
    if (!this.enabled) return null;
    const light = this.scene.lights.addLight(x, y, radius, color, intensity);
    if (!Theme.reducedMotion) {
      this.scene.tweens.add({ targets: light, intensity: intensity * 0.45, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    return light;
  }

  /** The centre spotlight's colour changes with the landed era (the side lamps keep theirs). */
  setColor(color) {
    this.spots.setColor(color);
  }
}
