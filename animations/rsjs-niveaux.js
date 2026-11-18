// Exercice rsjs : lignes de niveau de l'erreur E(α, β, γ) = Σ (x_i − α t_i² − β t_i − γ)²
// dans le plan (α, β), γ étant choisi au mieux pour chaque (α, β).
// Avec des données centrées (ũ_i = t_i² − moyenne, t̃_i = t_i − moyenne) :
// min_γ E = E* + δᵀ B δ, δ = (α − α*, β − β*), B = [[Σũ², Σũt̃], [Σũt̃, Σt̃²]].
// La forme des lignes de niveau ne dépend que des t_i. Nuage : quatre points en
// a = −1, quatre en b = 3/2, un point d'abscisse c. Quand c rejoint a ou b, B devient
// singulière (noyau dirigé par (1, −(u+v))) : les ellipses s'allongent en droites.
OYMWidgets.define('rsjs-niveaux', {
  meta: {
    title: "Lignes de niveau de l'erreur : des ellipses à la vallée",
    description: "Lignes de niveau de l'erreur des moindres carrés en fonction des coefficients α et β de la parabole. On déplace l'abscisse c d'un point du nuage : quand elle rejoint l'une des deux autres abscisses, les ellipses s'allongent en droites parallèles et le minimum n'est plus unique.",
    concepts: ['moindres carrés', 'forme quadratique', 'matrice définie positive', 'lignes de niveau', 'unicité du minimum'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Nuage : quatre points d'abscisse \\(u=-1\\), quatre d'abscisse \\(v=1{,}5\\)
    et un point d'abscisse \\(c\\). À gauche, les lignes de niveau de l'erreur en
    fonction de \\((\\alpha,\\beta)\\), autour de l'optimum (\\(\\gamma\\) est choisi au
    mieux pour chaque couple). Déplacer \\(c\\) jusqu'à \\(u\\) ou \\(v\\).`,
  state: { c: 0.25 },

  mount(root, { kit, state }) {
    const a = -1;
    const b = 1.5;
    const fixes = [[a, 0.6], [a, 1.4], [a, 1.0], [a, 1.8], [b, 2.0], [b, 3.1], [b, 2.4], [b, 2.9]];
    const xc = 0.4; // ordonnée du point mobile
    let c = Number(state.c);
    if (!Number.isFinite(c)) c = 0.25;

    const det3 = (m) =>
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

    // Matrice A = MᵀM, matrice B de la forme réduite, optimum (α*, β*, γ*) et erreur minimale.
    function analyse(pts) {
      const n = pts.length;
      const S = (k) => pts.reduce((acc, [t]) => acc + t ** k, 0);
      const A = [[S(4), S(3), S(2)], [S(3), S(2), S(1)], [S(2), S(1), n]];
      const mu = S(2) / n;
      const mt = S(1) / n;
      const mx = pts.reduce((acc, [, x]) => acc + x, 0) / n;
      let buu = 0, but = 0, btt = 0, bux = 0, btx = 0;
      for (const [t, x] of pts) {
        const u = t * t - mu;
        const v = t - mt;
        const w = x - mx;
        buu += u * u; but += u * v; btt += v * v; bux += u * w; btx += v * w;
      }
      const B = [[buu, but], [but, btt]];
      const d = buu * btt - but * but;
      let al, be;
      if (Math.abs(d) > 1e-9 * (buu * btt + 1)) {
        al = (btt * bux - but * btx) / d;
        be = (buu * btx - but * bux) / d;
      } else {
        al = 0; // une solution parmi d'autres : la droite des moyennes
        be = btx / btt;
      }
      const ga = mx - al * mu - be * mt;
      const E = pts.reduce((acc, [t, x]) => acc + (x - al * t * t - be * t - ga) ** 2, 0);
      return { A, B, X: [al, be, ga], E, singuliere: Math.abs(det3(A)) < 1e-6 };
    }

    const [left, right] = kit.columns(root, { ratio: [1, 1] });
    const R = 1.6;
    const P = kit.plot(left, {
      w: 420, h: 420, x: [-R, R], y: [-R, R], maxWidth: 440,
      labels: ['\\(\\alpha-\\alpha^*\\)', '\\(\\beta-\\beta^*\\)'], ticks: { x: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], y: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5] },
      title: "Lignes de niveau de l'erreur dans le plan (α, β)",
    });

    const ctl = kit.controls(right, { column: true });
    const sl = kit.slider(ctl, {
      label: 'abscisse \\(c\\) =', min: -1.5, max: 2, step: 0.05, value: c,
      onInput: (v) => {
        c = v;
        draw();
      },
    });
    const presets = kit.controls(right);
    for (const [v, t] of [[a, '\\(c=u\\)'], [0.25, '\\(c=0{,}25\\)'], [b, '\\(c=v\\)']]) {
      kit.button(presets, t, () => {
        c = v;
        sl.set(v);
        draw();
      });
    }
    const PN = kit.plot(right, {
      w: 320, h: 220, x: [-1.8, 2.3], y: [-0.5, 4], maxWidth: 360,
      margins: { l: 34, b: 30 }, labels: ['\\(t\\)', '\\(x\\)'], ticks: { x: [-1, 0, 1, 2], y: [0, 1, 2, 3, 4] },
      title: 'Nuage et parabole optimale',
    });
    const out = kit.output(right);
    const status = kit.html('div', { class: 'oym-status' }, right);

    function draw() {
      const pts = [...fixes, [c, xc]];
      const { A, B, X, E } = analyse(pts);
      const dA = det3(A);
      const plat = Math.abs(c - a) < 1e-6 || Math.abs(c - b) < 1e-6;
      const q = (u, v) => B[0][0] * u * u + 2 * B[0][1] * u * v + B[1][1] * v * v;

      P.contours(P.layer('niveaux'), q, [0.15, 0.4, 0.8, 1.4, 2.2, 3.2, 4.5, 6], 110, 'lvl');
      const g = P.layer('minimum');
      if (plat) {
        // Droite des minimiseurs : direction (1, −(a + b)).
        const k = -(a + b);
        P.line(g, -R, -k * R, R, k * R, 'path');
      } else {
        P.dot(g, 0, 0, 6, 'pt');
      }

      const h = PN.layer('nuage');
      PN.graph(h, (t) => X[0] * t * t + X[1] * t + X[2], -1.8, 2.3, { cls: 'curve' });
      for (const [t, x] of fixes) PN.dot(h, t, x, 4, 'pt k');
      PN.dot(h, c, xc, 6, 'pt');
      PN.math(h, c, xc, '\\(c\\)', 'o', 'start', 7, 12);

      kit.put(out, `<table>
        <tr><td>\\(\\det A\\)</td><td class="n"><b>${kit.fmt(Math.abs(dA) < 1e-9 ? 0 : dA, 2)}</b></td></tr>
        <tr><td>\\((\\alpha^*,\\beta^*,\\gamma^*)\\)</td><td class="n">(${kit.fmt(X[0], 2)} ; ${kit.fmt(X[1], 2)} ; ${kit.fmt(X[2], 2)})</td></tr>
        <tr><td>erreur minimale</td><td class="n">${kit.fmt(E, 3)}</td></tr></table>`);
      if (plat) {
        status.className = 'oym-status o';
        kit.put(status, "Deux abscisses distinctes seulement : \\(\\det A = 0\\), les lignes de niveau sont des <b>droites parallèles</b>. Tout point de la droite orange est un minimum, la parabole affichée n'est que l'une des solutions.");
      } else {
        status.className = 'oym-status';
        kit.put(status, "Trois abscisses distinctes : \\(A\\) est définie positive, les lignes de niveau sont des <b>ellipses</b> autour d'un minimum unique. Elles s'allongent quand \\(c\\) s'approche de \\(u\\) ou de \\(v\\).");
      }
    }

    draw();
  },
});
