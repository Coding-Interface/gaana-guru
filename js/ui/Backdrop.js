/**
 * Backdrop — a painted background for the active theme, drawn once into a texture.
 *
 *   cinema     velvet curtains, a wall of original abstract film posters, a fringed valance
 *   holi       clouds of gulal and colour splashes
 *   diwali     night sky, a rangoli mandala, a marigold toran along the top
 *   christmas  starry night, snowy hills and pine trees
 *   musical    concert hall: LED wall, lighting truss, glossy stage floor, a crowd with hands up
 *
 * Posters are generated shapes (sunsets, skylines, silhouettes) with no real titles or art.
 * On WebGL the backdrop uses Phaser's Light2D pipeline, so the moving spotlights light it up.
 */
class Backdrop {
  constructor(scene, themeKey, depth = -20) {
    const { W, H, portrait } = Layout.current;
    const key = `bg-${themeKey}-${portrait ? 'p' : 'l'}`;
    if (!scene.textures.exists(key)) Backdrop.paint(scene, key, themeKey, W, H);
    this.image = scene.add.image(0, 0, key).setOrigin(0).setDepth(depth);
  }

  static paint(scene, key, themeKey, W, H) {
    const tex = scene.textures.createCanvas(key, W, H);
    const ctx = tex.getContext();
    const rng = new Rng(4242 + W);
    const fn = { cinema: Backdrop.cinema, musical: Backdrop.musical, holi: Backdrop.holi, diwali: Backdrop.diwali, christmas: Backdrop.christmas }[themeKey] || Backdrop.cinema;
    fn(ctx, W, H, rng);
    tex.refresh();
  }

  static vertical(ctx, W, H, stops) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    stops.forEach(([at, c]) => g.addColorStop(at, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------------- Cinema ---------------- */

  static cinema(ctx, W, H, rng) {
    Backdrop.vertical(ctx, W, H, [[0, '#2A0812'], [0.6, '#3B0D1C'], [1, '#1A050C']]);

    // Poster wall
    const cols = W > H ? 6 : 3;
    const margin = W * 0.1;
    const gap = W > H ? 26 : 22;
    const pw = (W - margin * 2 - gap * (cols - 1)) / cols;
    const ph = pw * 1.45;
    const rows = Math.ceil(H / (ph + gap)) + 1;
    const palettes = [
      ['#E8467C', '#F5B700'], ['#1FB5A6', '#2A0A14'], ['#F5B700', '#B02C5C'], ['#7A3FD0', '#FF8A3D'],
      ['#E5484D', '#1A0B2E'], ['#4FD8C9', '#7A2036'], ['#FF8A3D', '#3B0D1C'], ['#FFD23F', '#1FB5A6']
    ];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = margin + c * (pw + gap) + (r % 2 ? pw * 0.25 : 0) - pw * 0.12;
        const y = 30 + r * (ph + gap) - (c % 2 ? ph * 0.18 : 0);
        Backdrop.poster(ctx, x, y, pw, ph, palettes[rng.int(palettes.length)], rng, (rng.next() - 0.5) * 0.06);
      }
    }
    // Dim the wall so the UI reads; the spotlights bring it back up.
    ctx.fillStyle = 'rgba(26,5,12,0.42)';
    ctx.fillRect(0, 0, W, H);

    Backdrop.curtain(ctx, 0, W * 0.11, H, false);
    Backdrop.curtain(ctx, W - W * 0.11, W * 0.11, H, true);
    Backdrop.valance(ctx, W, W > H ? 46 : 54);
  }

  static poster(ctx, x, y, w, h, [a, b], rng, tilt) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(tilt);
    ctx.translate(-w / 2, -h / 2);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(6, 8, w, h);
    ctx.fillStyle = '#C9A24A';
    ctx.fillRect(-5, -5, w + 10, h + 10);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const art = rng.int(4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h * 0.78);
    ctx.clip();
    if (art === 0) {
      // Sunset over hills
      ctx.fillStyle = 'rgba(255,241,214,0.85)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, w * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(26,6,14,0.85)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w * 0.3, h * 0.5);
      ctx.lineTo(w * 0.55, h * 0.66);
      ctx.lineTo(w * 0.8, h * 0.46);
      ctx.lineTo(w, h * 0.6);
      ctx.lineTo(w, h * 0.78);
      ctx.fill();
    } else if (art === 1) {
      // Two silhouettes facing each other
      ctx.fillStyle = 'rgba(255,241,214,0.25)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.3, w * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(26,6,14,0.9)';
      [[0.34, 1], [0.66, -1]].forEach(([fx, dir]) => {
        const cx = w * fx;
        ctx.beginPath();
        ctx.arc(cx, h * 0.36, w * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.12, h * 0.78);
        ctx.quadraticCurveTo(cx - w * 0.1 * dir, h * 0.46, cx, h * 0.45);
        ctx.quadraticCurveTo(cx + w * 0.12 * dir, h * 0.5, cx + w * 0.12, h * 0.78);
        ctx.fill();
      });
    } else if (art === 2) {
      // Starburst
      ctx.save();
      ctx.translate(w * 0.5, h * 0.4);
      ctx.fillStyle = 'rgba(255,241,214,0.3)';
      for (let k = 0; k < 12; k++) {
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w * 0.06, -h);
        ctx.lineTo(w * 0.06, -h);
        ctx.fill();
      }
      ctx.restore();
      Backdrop.star(ctx, w * 0.5, h * 0.4, w * 0.2, 'rgba(255,241,214,0.9)');
    } else {
      // City skyline under a moon
      ctx.fillStyle = 'rgba(255,241,214,0.8)';
      ctx.beginPath();
      ctx.arc(w * 0.72, h * 0.22, w * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(26,6,14,0.85)';
      let bx = 0;
      while (bx < w) {
        const bw = w * (0.1 + rng.next() * 0.12);
        const bh = h * (0.18 + rng.next() * 0.3);
        ctx.fillRect(bx, h * 0.78 - bh, bw - 2, bh);
        bx += bw;
      }
    }
    ctx.restore();

    // Title band with placeholder "lettering" (no real titles)
    ctx.fillStyle = 'rgba(16,4,10,0.75)';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    ctx.fillStyle = 'rgba(255,241,214,0.85)';
    Backdrop.pill(ctx, w * 0.12, h * 0.82, w * 0.76, h * 0.045);
    ctx.fillStyle = 'rgba(255,241,214,0.45)';
    Backdrop.pill(ctx, w * 0.24, h * 0.9, w * 0.52, h * 0.025);
    ctx.restore();
  }

  static pill(ctx, x, y, w, h) {
    const r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();
  }

  static star(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 === 0 ? r : r * 0.42;
      const a = (Math.PI / 5) * k - Math.PI / 2;
      ctx[k === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }

  static curtain(ctx, x, w, H, flip) {
    const folds = 5;
    for (let k = 0; k < folds; k++) {
      const fx = x + (w / folds) * k;
      const g = ctx.createLinearGradient(fx, 0, fx + w / folds, 0);
      g.addColorStop(0, '#5A0E22');
      g.addColorStop(0.5, '#A3203F');
      g.addColorStop(1, '#4A0A1C');
      ctx.fillStyle = g;
      ctx.fillRect(fx, 0, w / folds + 1, H);
    }
    const edge = ctx.createLinearGradient(flip ? x : x + w, 0, flip ? x - 30 : x + w + 30, 0);
    edge.addColorStop(0, 'rgba(0,0,0,0.55)');
    edge.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = edge;
    ctx.fillRect(flip ? x - 30 : x + w, 0, 30, H);
  }

  static valance(ctx, W, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6A1028');
    g.addColorStop(1, '#8E1C38');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, h * 0.6);
    const n = Math.round(W / 90);
    for (let k = n; k >= 0; k--) {
      const x = (W / n) * k;
      ctx.quadraticCurveTo(x + W / n / 2, h * 1.25, x, h * 0.6);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#E2B24A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let k = 0; k <= n; k++) {
      const x = (W / n) * k;
      if (k === 0) ctx.moveTo(x, h * 0.6);
      else ctx.quadraticCurveTo(x - W / n / 2, h * 1.25, x, h * 0.6);
    }
    ctx.stroke();
  }

  /* ---------------- Holi ---------------- */

  static holi(ctx, W, H, rng) {
    Backdrop.vertical(ctx, W, H, [[0, '#1C0A35'], [0.5, '#2A0F4A'], [1, '#43125E']]);
    const colors = ['255,79,163', '255,210,63', '61,220,132', '41,197,255', '255,138,61', '170,90,255'];
    for (let k = 0; k < 22; k++) {
      const x = rng.next() * W;
      const y = rng.next() * H;
      const r = (0.12 + rng.next() * 0.22) * Math.max(W, H);
      const c = colors[k % colors.length];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${c},0.38)`);
      g.addColorStop(0.55, `rgba(${c},0.14)`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // Splashes
    for (let k = 0; k < 26; k++) {
      const x = rng.next() * W;
      const y = rng.next() * H;
      const c = colors[rng.int(colors.length)];
      ctx.fillStyle = `rgba(${c},0.55)`;
      for (let d = 0; d < 9; d++) {
        const a = rng.next() * Math.PI * 2;
        const dist = rng.next() * 46;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * dist, y + Math.sin(a) * dist, 2 + rng.next() * 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(16,6,30,0.25)';
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------------- Diwali ---------------- */

  static diwali(ctx, W, H, rng) {
    Backdrop.vertical(ctx, W, H, [[0, '#07051A'], [0.55, '#140F33'], [1, '#2A1A52']]);
    for (let k = 0; k < 90; k++) {
      ctx.fillStyle = `rgba(255,236,190,${0.2 + rng.next() * 0.6})`;
      ctx.beginPath();
      ctx.arc(rng.next() * W, rng.next() * H * 0.7, rng.next() * 1.8 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Rangoli mandala
    const cx = W / 2;
    const cy = H * (W > H ? 0.55 : 0.45);
    const R = Math.min(W, H) * 0.46;
    const ring = (radius, petals, len, color, wid) => {
      ctx.fillStyle = color;
      for (let k = 0; k < petals; k++) {
        const a = ((Math.PI * 2) / petals) * k;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        ctx.rotate(a + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, wid, len, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    ring(R * 0.95, 32, R * 0.07, 'rgba(255,183,3,0.16)', R * 0.025);
    ring(R * 0.78, 24, R * 0.11, 'rgba(232,70,124,0.16)', R * 0.04);
    ring(R * 0.58, 16, R * 0.12, 'rgba(31,181,166,0.16)', R * 0.05);
    ring(R * 0.38, 12, R * 0.1, 'rgba(255,183,3,0.2)', R * 0.05);
    ring(R * 0.18, 8, R * 0.08, 'rgba(255,241,214,0.18)', R * 0.04);
    // Toran: marigolds and mango leaves along the top
    const n = Math.round(W / 34);
    ctx.strokeStyle = 'rgba(80,140,60,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(W, 18);
    ctx.stroke();
    for (let k = 0; k <= n; k++) {
      const x = (W / n) * k;
      ctx.fillStyle = k % 2 ? '#FFB703' : '#FF7A1A';
      ctx.beginPath();
      ctx.arc(x, 20, 11, 0, Math.PI * 2);
      ctx.fill();
      if (k % 3 === 1) {
        ctx.fillStyle = '#3E8E3A';
        ctx.beginPath();
        ctx.moveTo(x - 7, 26);
        ctx.quadraticCurveTo(x, 66, x + 7, 26);
        ctx.fill();
      }
    }
  }

  /* ---------------- Christmas ---------------- */

  static christmas(ctx, W, H, rng) {
    Backdrop.vertical(ctx, W, H, [[0, '#04120F'], [0.5, '#0C2A24'], [1, '#123F35']]);
    for (let k = 0; k < 110; k++) {
      ctx.fillStyle = `rgba(230,250,255,${0.2 + rng.next() * 0.6})`;
      ctx.beginPath();
      ctx.arc(rng.next() * W, rng.next() * H * 0.75, rng.next() * 1.8 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    Backdrop.star(ctx, W * 0.82, H * 0.12, 16, 'rgba(255,246,224,0.7)');
    // Snowy hills
    const hill = (base, amp, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, base);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, base - Math.sin(x / W * Math.PI * 2 + amp) * 26 - amp * 6);
      ctx.lineTo(W, H);
      ctx.fill();
    };
    hill(H * 0.86, 1.3, 'rgba(210,235,240,0.55)');
    hill(H * 0.92, 2.6, 'rgba(240,250,252,0.85)');
    // Pine trees
    const tree = (x, base, s) => {
      ctx.fillStyle = '#0A2E22';
      for (let k = 0; k < 3; k++) {
        const w = s * (1 - k * 0.22);
        const top = base - s * 0.55 * (k + 1);
        ctx.beginPath();
        ctx.moveTo(x, top - s * 0.4);
        ctx.lineTo(x - w / 2, top + s * 0.35);
        ctx.lineTo(x + w / 2, top + s * 0.35);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(240,250,252,0.8)';
      ctx.beginPath();
      ctx.moveTo(x, base - s * 2.05);
      ctx.lineTo(x - s * 0.12, base - s * 1.85);
      ctx.lineTo(x + s * 0.12, base - s * 1.85);
      ctx.fill();
    };
    const s = Math.min(W, H) * 0.12;
    [0.06, 0.16, 0.86, 0.95].forEach((fx, i) => tree(W * fx, H * 0.95, s * (i % 2 ? 0.8 : 1)));
  }

  /* ---------------- Musical ---------------- */

  static musical(ctx, W, H, rng) {
    Backdrop.vertical(ctx, W, H, [[0, '#05030F'], [0.55, '#120C2E'], [1, '#07051A']]);

    // LED wall: a grid of dots glowing in a soft diagonal wave of colour.
    const cols = ['255,61,242', '61,252,255', '255,240,61', '125,255,90'];
    const step = W > H ? 22 : 20;
    const top = H * 0.08;
    const bottom = H * 0.74;
    for (let y = top; y < bottom; y += step) {
      for (let x = step / 2; x < W; x += step) {
        const wave = 0.5 + 0.5 * Math.sin(x / W * 5 + y / H * 7);
        const col = cols[Math.floor(((x / W) * 2 + (y / H) * 3) % cols.length)];
        ctx.fillStyle = `rgba(${col},${0.06 + wave * 0.22})`;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Lighting truss along the top
    const ty = H * 0.035;
    ctx.strokeStyle = '#3a3346';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(W, ty);
    ctx.moveTo(0, ty + 24);
    ctx.lineTo(W, ty + 24);
    ctx.stroke();
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x + 24, ty + 24);
      ctx.stroke();
    }
    // Glossy stage floor with coloured reflections
    const fy = H * 0.8;
    const floor = ctx.createLinearGradient(0, fy, 0, H);
    floor.addColorStop(0, '#1d1640');
    floor.addColorStop(1, '#05030f');
    ctx.fillStyle = floor;
    ctx.fillRect(0, fy, W, H - fy);
    ctx.fillStyle = 'rgba(255,210,63,0.6)';
    ctx.fillRect(0, fy, W, 3);
    [0.2, 0.5, 0.8].forEach((fx, i) => {
      const g = ctx.createRadialGradient(W * fx, fy + 30, 0, W * fx, fy + 30, W * 0.22);
      g.addColorStop(0, `rgba(${cols[i]},0.16)`);
      g.addColorStop(1, `rgba(${cols[i]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, fy, W, H - fy);
    });
    // Crowd: heads and raised hands in silhouette along the bottom edge
    ctx.fillStyle = '#020108';
    const n = Math.round(W / 46);
    for (let i = 0; i <= n; i++) {
      const x = (W / n) * i + (rng.next() - 0.5) * 18;
      const hy = H - 26 + rng.next() * 14;
      ctx.beginPath();
      ctx.arc(x, hy, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 24, hy + 10, 48, 40);
      if (rng.next() < 0.45) {
        const dir = rng.next() < 0.5 ? -1 : 1;
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#020108';
        ctx.beginPath();
        ctx.moveTo(x + dir * 14, hy + 8);
        ctx.lineTo(x + dir * 26, hy - 42);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + dir * 27, hy - 46, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
