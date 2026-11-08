// Exercice ebva : f(x,y) = y²/x si x ≠ 0, f(0,y) = y.
// En (0,0), les dérivées partielles existent et ∇f(0,0) = (0,1), mais la formule
// ∂_u f(0,0) = ∇f(0,0)·u est fausse : dans la direction u = (cos θ, sin θ), la
// vraie dérivée vaut lim f(tu)/t = u₂²/u₁ (et sin θ sur l'axe x = 0).
OYMWidgets.define('ebva-directionnelle', {
  title: "Dérivée directionnelle en l'origine",
  intro: `On fait tourner la direction \\(u=(\\cos\\theta,\\sin\\theta)\\). En vert, la valeur
    que prédit la formule \\(\\nabla f(0,0)\\cdot u\\) ; en orange, la vraie dérivée
    \\(\\lim_{t\\to0} f(tu)/t\\). Pour \\(u\\propto(1,2)\\), elle vaut le double.`,
  state: { deg: 63.4349 }, // u ∝ (1,2)

  mount(root, { kit, state }) {
    const rad = (deg) => (deg * Math.PI) / 180;
    const formule = (deg) => Math.sin(rad(deg));
    const reelle = (deg) => {
      const u1 = Math.cos(rad(deg));
      const u2 = Math.sin(rad(deg));
      return Math.abs(u1) < 1e-9 ? u2 : (u2 * u2) / u1;
    };
    let deg = state.deg;

    const [left, right] = kit.columns(root, { ratio: [2, 3] });

    // À gauche : le cercle unité, le gradient et la direction u
    const P = kit.plot(left, {
      w: 420, h: 420, x: [-1.4, 1.4], y: [-1.4, 1.4], margins: { l: 30, r: 10, t: 10, b: 26 },
      labels: ['\\(x\\)', '\\(y\\)'], ticks: { x: [-1, 0, 1], y: [-1, 0, 1] }, maxWidth: 360,
      title: 'Le gradient et la direction u dans le plan',
    });
    P.poly(P.layer('cercle'), Array.from({ length: 181 }, (_, i) => [Math.cos((i * Math.PI) / 90), Math.sin((i * Math.PI) / 90)]), 'ref');

    // À droite : les deux valeurs en fonction de θ
    kit.html('p', { class: 'oym-legend' }, right,
      '<b class="t">▬</b> \\(\\nabla f(0,0)\\cdot u=\\sin\\theta\\) (formule) &nbsp; <b class="o">▬</b> \\(\\lim_{t\\to0}f(tu)/t=u_2^2/u_1\\) (réalité)');
    const Q = kit.plot(right, {
      w: 560, h: 250, x: [0, 360], y: [-3, 3],
      labels: ['\\(\\theta\\) (degrés)', '\\(\\partial_u f(0,0)\\)'],
      ticks: { x: [0, 90, 180, 270, 360], y: [-3, -2, -1, 0, 1, 2, 3] },
      title: 'La formule et la vraie dérivée en fonction de θ',
    });
    const courbes = Q.layer('courbes');
    Q.graph(courbes, formule, 0, 360, { cls: 'gr' });
    Q.graph(courbes, reelle, 0, 360, { n: 720, cls: 'path' });
    // Sur l'axe x = 0, f(0,t) = t : la vraie dérivée vaut aussi sin θ
    for (const d of [90, 270]) Q.dot(courbes, d, formule(d), 5, 'pt');

    // Commandes
    const ctl = kit.controls(right, { column: true });
    const theta = kit.slider(ctl, {
      label: 'direction \\(\\theta\\) =', min: 0, max: 360, step: 1, value: deg,
      show: (v) => `${v}°`,
      onInput: (v) => {
        deg = v;
        draw();
      },
    });
    const presets = kit.controls(ctl);
    for (const [label, d] of [['\\(u\\propto(1,0)\\)', 0], ['\\(u\\propto(1,1)\\)', 45], ['\\(u\\propto(1,2)\\)', (Math.atan2(2, 1) * 180) / Math.PI]]) {
      kit.button(presets, label, () => {
        deg = d;
        draw();
      });
    }
    const out = kit.output(right);

    function draw() {
      const u1 = Math.cos(rad(deg));
      const u2 = Math.sin(rad(deg));
      const pred = formule(deg);
      const real = reelle(deg);
      const same = Math.abs(real - pred) < 0.02;

      const g = P.layer('direction');
      P.arrow(g, 0, 0, 0, 1, 'gr', 'aht');
      P.math(g, 0, 1, '\\(\\nabla f(0,0)\\)', 't', 'start', 8, -6);
      P.arrow(g, 0, 0, u1, u2, 'path', 'ah');
      P.math(g, u1, u2, '\\(u\\)', 'o', 'start', 8, -8);

      const m = Q.layer('direction');
      Q.line(m, deg, -3, deg, 3, 'ref');
      Q.dot(m, deg, pred, 7, 'pt t');
      if (Math.abs(real) <= 3) Q.dot(m, deg, real, 7, 'pt');

      kit.put(out, `<table>
        <tr><td>\\(u=(\\cos\\theta,\\sin\\theta)\\)</td><td class="n">(${kit.fmt(u1, 3)} ; ${kit.fmt(u2, 3)})</td></tr>
        <tr><td>\\(\\lim_{t\\to0}\\dfrac{f(tu)-f(0,0)}{t}\\)</td><td class="n"><b class="${same ? 'ok' : 'bad'}">${kit.fmt(real, 3)}</b></td></tr>
        <tr><td>\\(\\nabla f(0,0)\\cdot u\\)</td><td class="n"><b>${kit.fmt(pred, 3)}</b></td></tr></table>
        <div class="oym-status ${same ? '' : 'r'}">${same
          ? 'Les deux valeurs coïncident : seulement pour \\(\\theta=0\\), \\(\\pi/4\\), \\(\\pi\\), … et les directions des axes.'
          : '<b>La formule \\(\\nabla f\\cdot u\\) est fausse ici</b>, bien que \\(\\partial_xf\\) et \\(\\partial_yf\\) existent.'}</div>`);
      theta.set(deg);
    }
    draw();
  },
});
