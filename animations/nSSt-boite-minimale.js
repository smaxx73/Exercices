// Exercice nSSt : boîte sans couvercle de volume 1/2 m³, aire g(x,y) = xy + 1/x + 1/y
// après élimination de z = 1/(2xy). On choisit (x, y) : la boîte se déforme, les trois
// termes de l'aire se comparent et la descente de gradient mène au minimum g(1,1) = 3.
OYMWidgets.define('nSSt-boite-minimale', {
  meta: {
    title: 'La boîte de matière minimale',
    description: "On choisit les dimensions x et y d'une boîte sans couvercle de volume 0,5 m³ : la boîte se déforme, on compare les trois termes de son aire g(x,y) = xy + 1/x + 1/y, et une descente de gradient mène au minimum (1, 1) où ils sont égaux.",
    concepts: ['optimisation', 'point critique', 'inégalité arithmético-géométrique', 'descente de gradient'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `La boîte a pour fond \\(x\\times y\\) et pour hauteur \\(z=1/(2xy)\\), pour que
    le volume reste \\(\\tfrac12\\). Choisir \\((x,y)\\) en cliquant dans la carte (lignes de niveau
    de \\(g\\)) ou avec les curseurs, et regarder comment l'aire se répartit entre le fond et les faces.`,
  state: { x: 2, y: 0.6 },

  mount(root, { kit, state }) {
    const BOX = [0.5, 2.2]; // domaine affiché pour x et y (en m)
    const g = (x, y) => x * y + 1 / x + 1 / y;
    const clamp = (v) => Math.max(BOX[0], Math.min(BOX[1], v));
    let x = clamp(state.x);
    let y = clamp(state.y);
    let trail = [];

    const [left, right] = kit.columns(root, { ratio: [1, 1] });

    // Carte de g : on clique pour choisir (x, y)
    const P = kit.plot(left, {
      w: 340, h: 340, x: BOX, y: BOX, margins: { l: 36, r: 10, t: 10, b: 28 }, grid: false, maxWidth: 400,
      labels: ['\\(x\\)', '\\(y\\)'], ticks: { x: [0.5, 1, 1.5, 2], y: [0.5, 1, 1.5, 2] },
      title: 'Lignes de niveau de g ; un clic choisit (x, y)',
    });
    P.contours(P.layer('niveaux'), g, [3.05, 3.2, 3.5, 4, 4.5, 5, 6, 7, 8], 110, 'lvl');
    P.svg.style.cursor = 'crosshair';

    const ctl = kit.controls(left, { column: true });
    const sx = kit.slider(ctl, {
      label: '\\(x\\) =', min: BOX[0], max: BOX[1], step: 0.01, value: x, show: (v) => `${kit.fmt(v, 2)} m`,
      onInput: (v) => { ticker.stop(); x = v; trail = []; draw(); },
    });
    const sy = kit.slider(ctl, {
      label: '\\(y\\) =', min: BOX[0], max: BOX[1], step: 0.01, value: y, show: (v) => `${kit.fmt(v, 2)} m`,
      onInput: (v) => { ticker.stop(); y = v; trail = []; draw(); },
    });
    const ticker = kit.ticker(90);
    const row = kit.controls(ctl);
    // Descente de gradient à pas fixe, pour aller vers le minimum
    kit.button(row, 'Descente de gradient ▸', () => {
      trail = [[x, y]];
      let n = 0;
      ticker.start(() => {
        const gx = y - 1 / (x * x);
        const gy = x - 1 / (y * y);
        x = clamp(x - 0.15 * gx);
        y = clamp(y - 0.15 * gy);
        trail.push([x, y]);
        draw();
        return ++n < 60 && Math.hypot(gx, gy) > 1e-3;
      });
    });
    kit.button(row, 'Minimum \\((1\\,;1)\\)', () => { ticker.stop(); x = 1; y = 1; trail = []; draw(); });
    P.svg.addEventListener('click', (ev) => {
      ticker.stop();
      const [cx, cy] = P.at(ev);
      x = clamp(cx);
      y = clamp(cy);
      trail = [];
      draw();
    });

    // À droite : la boîte (échelle fixe, pour voir les proportions changer), les trois termes, la lecture
    const W = 360;
    const H = 240;
    const S = kit.svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', role: 'img', 'aria-label': 'La boîte de dimensions x, y, z' }, right);
    S.style.maxWidth = '400px';
    const bars = kit.html('div', { style: 'margin:6px 0 4px' }, right);
    const out = kit.output(right);

    function drawBox(layer, X, Y, Z) {
      // échelle ajustée à chaque boîte : elle remplit le cadre, seules ses proportions changent
      const c = Math.cos(Math.PI / 6) / 2, s = Math.sin(Math.PI / 6) / 2;
      const wBox = X + c * Y, hBox = Z + s * Y;
      const k = Math.min((W - 180) / wBox, (H - 60) / hBox);
      const ox = 90 + (W - 130 - k * wBox) / 2, oy = H - 34 - (H - 60 - k * hBox) / 2;
      const pr = (a, b, d) => [ox + k * (a + c * b), oy - k * (d + s * b)];
      const face = (pts, fill, op) => kit.svg('polygon', {
        points: pts.map((p) => pr(...p).map((v) => v.toFixed(1)).join(',')).join(' '),
        style: `fill:var(${fill});fill-opacity:${op};stroke:var(--oym-ink);stroke-width:1.4;stroke-linejoin:round`,
      }, layer);
      // la boîte est ouverte : faces du fond d'abord (vues de l'intérieur), puis faces avant translucides
      face([[0, 0, 0], [0, Y, 0], [0, Y, Z], [0, 0, Z]], '--oym-muted', 0.32);
      face([[0, Y, 0], [X, Y, 0], [X, Y, Z], [0, Y, Z]], '--oym-accent', 0.32);
      face([[0, 0, 0], [X, 0, 0], [X, Y, 0], [0, Y, 0]], '--oym-brand', 0.38);
      face([[X, 0, 0], [X, Y, 0], [X, Y, Z], [X, 0, Z]], '--oym-muted', 0.16);
      face([[0, 0, 0], [X, 0, 0], [X, 0, Z], [0, 0, Z]], '--oym-accent', 0.16);
      const lab = (p, dx, dy, str, anchor) => {
        const [a, b] = pr(...p);
        kit.svg('text', { x: a + dx, y: b + dy, 'text-anchor': anchor, 'font-size': 15 }, layer).textContent = str;
      };
      lab([X / 2, 0, 0], 0, 22, `x = ${kit.fmt(X, 2)} m`, 'middle');
      lab([X, Y / 2, 0], 10, 12, `y = ${kit.fmt(Y, 2)} m`, 'start');
      lab([0, 0, Z / 2], -8, 5, `z = ${kit.fmt(Z, 2)} m`, 'end');
    }

    function draw() {
      const z = 1 / (2 * x * y);
      const t1 = x * y;
      const t2 = 1 / y;
      const t3 = 1 / x;
      const G = t1 + t2 + t3;

      const layer = kit.svg('g', {});
      S.replaceChildren(layer);
      drawBox(layer, x, y, z);

      const gl = P.layer('a');
      if (trail.length > 1) P.poly(gl, trail, 'path');
      P.dot(gl, 1, 1, 5, 'pt k');
      P.dot(gl, x, y, 7, 'pt');
      sx.set(x);
      sy.set(y);

      const line = (lab, v, color) => `<div style="display:grid;grid-template-columns:7.5em 1fr 3em;gap:8px;align-items:center;margin:3px 0">
        <span>${lab}</span>
        <span style="display:block;height:12px;background:var(--oym-line);border-radius:3px"><i style="display:block;height:100%;border-radius:3px;width:${Math.min(100, (v / 4) * 100).toFixed(1)}%;background:var(${color})"></i></span>
        <span style="text-align:right">${kit.fmt(v, 2)}</span></div>`;
      kit.put(bars, line('fond \\(xy\\)', t1, '--oym-brand') + line('\\(2xz=1/y\\)', t2, '--oym-accent') + line('\\(2yz=1/x\\)', t3, '--oym-muted'));
      const best = Math.abs(G - 3) < 2e-3;
      kit.put(out, `<table><tr><td>hauteur \\(z=\\dfrac1{2xy}\\)</td><td class="n">${kit.fmt(z, 3)} m</td></tr>
        <tr><td>aire \\(g(x,y)\\)</td><td class="n"><b>${kit.fmt(G, 3)}</b> m²</td></tr></table>
        <div class="oym-status${best ? '' : ' o'}">${best
          ? 'Les trois termes valent \\(1\\) : \\(g=3\\), le minimum.'
          : 'Moyenne arithmético-géométrique : \\(g\\geq3\\sqrt[3]{xy\\cdot\\frac1x\\cdot\\frac1y}=3\\).'}</div>`);
    }
    draw();
  },
});
