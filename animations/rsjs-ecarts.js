// Exercice rsjs : parabole des moindres carrés P*(t) = α t² + β t + γ d'un nuage
// (t_i, x_i), erreur E = Σ (x_i − P(t_i))². On écarte la parabole de l'optimum
// dans la direction Q(t) = (t − u)(t − v), u = a = −1, v = b = 3/2 (variables a, b) :
// E(P* + sQ) = E(P*) + s² Σ Q(t_i)² (le terme croisé est nul à l'optimum).
// Nuage à abscisses variées : E augmente dès que s ≠ 0, la solution est unique.
// Nuage à deux abscisses a et b : Q(t_i) = 0, E ne bouge pas, infinité de solutions.
OYMWidgets.define('rsjs-ecarts', {
  meta: {
    title: 'Parabole des moindres carrés : écarts verticaux et unicité',
    description: "Nuage de points, parabole des moindres carrés et écarts verticaux, dessinés en segments ou en carrés. Un curseur écarte la parabole de l'optimum : l'erreur augmente quand les abscisses prennent au moins trois valeurs, elle reste constante quand il n'y en a que deux.",
    concepts: ['moindres carrés', 'régression polynomiale', 'équations normales', 'unicité du minimum', 'noyau'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `On cherche la parabole \\(P(t)=\\alpha t^2+\\beta t+\\gamma\\) qui minimise
    \\(E=\\sum_i \\big(x_i-P(t_i)\\big)^2\\), la somme des carrés des écarts verticaux.
    Le curseur \\(s\\) remplace la parabole optimale \\(P^*\\) par
    \\(P^*+s\\,(t-u)(t-v)\\), avec \\(u=-1\\) et \\(v=1{,}5\\). Comparer les deux nuages.`,
  state: { nuage: 'varie', s: 0, vue: 'ecarts' },

  mount(root, { kit, state }) {
    const a = -1;
    const b = 1.5;
    const Q = (t) => (t - a) * (t - b);
    const NUAGES = {
      varie: [[-2, 2.8], [-1.4, 1.1], [-0.8, 1.6], [-0.2, 0.7], [0.4, 1.2], [1, 0.8], [1.6, 2.0], [2.2, 2.3]],
      deux: [[a, 0.6], [a, 1.4], [a, 1.0], [a, 1.8], [b, 2.0], [b, 3.1], [b, 2.4], [b, 2.9]],
    };
    let { nuage, s, vue } = state;
    if (!NUAGES[nuage]) nuage = 'varie';

    // Équations normales A X = b, résolues par élimination de Gauss (null si A singulière).
    function moindresCarres(pts) {
      const S = (k) => pts.reduce((acc, [t]) => acc + t ** k, 0);
      const T = (k) => pts.reduce((acc, [t, x]) => acc + t ** k * x, 0);
      const m = [[S(4), S(3), S(2), T(2)], [S(3), S(2), S(1), T(1)], [S(2), S(1), pts.length, T(0)]];
      for (let c = 0; c < 3; c++) {
        let p = c;
        for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
        [m[c], m[p]] = [m[p], m[c]];
        if (Math.abs(m[c][c]) < 1e-9) return null;
        for (let r = 0; r < 3; r++) {
          if (r === c) continue;
          const f = m[r][c] / m[c][c];
          for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k];
        }
      }
      return m.map((r, i) => r[3] / r[i]);
    }
    // Deux abscisses : une solution est la droite qui passe par les deux moyennes.
    function optimum(pts) {
      const X = moindresCarres(pts);
      if (X) return X;
      const moy = (u) => {
        const q = pts.filter(([t]) => t === u);
        return q.reduce((acc, [, x]) => acc + x, 0) / q.length;
      };
      const pente = (moy(b) - moy(a)) / (b - a);
      return [0, pente, moy(a) - pente * a];
    }
    const ev = (X, t) => X[0] * t * t + X[1] * t + X[2];
    const erreur = (pts, P) => pts.reduce((acc, [t, x]) => acc + (x - P(t)) ** 2, 0);

    const [left, right] = kit.columns(root, { ratio: [3, 2] });
    const P = kit.plot(left, {
      w: 560, h: 400, x: [-2.5, 2.7], y: [-0.5, 4.5], maxWidth: 560,
      labels: ['\\(t\\)', '\\(x\\)'], ticks: { x: [-2, -1, 0, 1, 2], y: [0, 1, 2, 3, 4] },
      title: 'Nuage de points, parabole et écarts verticaux',
    });

    const ctl = kit.controls(right, { column: true });
    const segNuage = kit.segmented(ctl, [['varie', 'Abscisses variées'], ['deux', 'Deux abscisses']], (v) => {
      nuage = v;
      draw();
    });
    const segVue = kit.segmented(ctl, [['ecarts', 'Écarts'], ['carres', 'Carrés des écarts']], (v) => {
      vue = v;
      draw();
    });
    const sl = kit.slider(ctl, {
      label: '\\(s\\) =', min: -1, max: 1, step: 0.05, value: s,
      onInput: (v) => {
        s = v;
        draw();
      },
    });
    kit.button(kit.controls(right), '\\(s=0\\) : parabole optimale', () => {
      s = 0;
      sl.set(0);
      draw();
    });
    const PE = kit.plot(right, {
      w: 320, h: 200, x: [-1, 1], y: [0, 1], maxWidth: 360,
      margins: { l: 40, b: 30 }, labels: ['\\(s\\)', '\\(E\\)'], ticks: { x: [-1, -0.5, 0, 0.5, 1] },
      title: "Erreur E en fonction de s",
    });
    const out = kit.output(right);
    const status = kit.html('div', { class: 'oym-status' }, right);
    segNuage.set(nuage);
    segVue.set(vue);

    function draw() {
      const pts = NUAGES[nuage];
      const X = optimum(pts);
      const Ps = (t) => ev(X, t) + s * Q(t);
      const E0 = erreur(pts, (t) => ev(X, t));
      const Es = erreur(pts, Ps);
      const q2 = pts.reduce((acc, [t]) => acc + Q(t) ** 2, 0);

      const g = P.layer('dessin');
      const unite = (P.Y(0) - P.Y(1)) / (P.X(1) - P.X(0)); // carrés vrais à l'écran
      for (const [t, x] of pts) {
        const y = Ps(t);
        if (vue === 'carres') {
          const c = Math.abs(x - y);
          P.poly(g, [[t, x], [t + c * unite, x], [t + c * unite, y], [t, y], [t, x]], 'path');
        } else {
          P.line(g, t, x, t, y, 'path');
        }
      }
      if (s !== 0) P.graph(g, (t) => ev(X, t), -2.5, 2.7, { cls: 'ref' });
      P.graph(g, Ps, -2.5, 2.7, { cls: 'curve' });
      for (const [t, x] of pts) P.dot(g, t, x, 5, 'pt k');
      if (nuage === 'deux') {
        P.line(g, a, -0.5, a, 4.5, 'ref');
        P.line(g, b, -0.5, b, 4.5, 'ref');
        P.math(g, a, 4.25, '\\(u\\)', '', 'start', 6, 0);
        P.math(g, b, 4.25, '\\(v\\)', '', 'start', 6, 0);
      }

      const Emax = E0 + q2 + 0.5;
      PE.range([-1, 1], [0, Emax]);
      PE.axes({ xt: [-1, -0.5, 0, 0.5, 1], xl: '\\(s\\)', yl: '\\(E\\)' });
      const h = PE.layer('courbe');
      PE.fn(h, (u) => E0 + u * u * q2, -1, 1, 100, 'curve');
      PE.dot(h, s, Es, 6, 'pt');

      kit.put(out, `<table>
        <tr><td>\\(E(P^*)\\)</td><td class="n">${kit.fmt(E0, 3)}</td></tr>
        <tr><td>\\(E\\big(P^*+s\\,(t-u)(t-v)\\big)\\)</td><td class="n"><b>${kit.fmt(Es, 3)}</b></td></tr>
        <tr><td>\\(\\sum_i (t_i-a)^2(t_i-b)^2\\)</td><td class="n">${kit.fmt(q2, 3)}</td></tr></table>`);
      if (nuage === 'deux') {
        status.className = 'oym-status o';
        kit.put(status, "Les \\(t_i\\) ne prennent que deux valeurs : \\((t-u)(t-v)\\) s'annule en chaque \\(t_i\\), <b>l'erreur ne dépend pas de \\(s\\)</b>. Toutes ces paraboles sont solutions.");
      } else {
        status.className = 'oym-status';
        kit.put(status, 'Au moins trois abscisses distinctes : \\(E = E(P^*) + s^2\\sum_i (t_i-a)^2(t_i-b)^2\\) <b>augmente dès que \\(s\\neq 0\\)</b>. La solution est unique.');
      }
    }

    draw();
  },
});
