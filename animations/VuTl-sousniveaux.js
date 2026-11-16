// Exercice VuTl : f(x,y) = x⁴ + y⁴ − 2(x−y)², coercive : f ≥ ‖(x,y)‖² − 25/2.
// L'ensemble de sous-niveau K_A = {f ≤ A} est fermé (f continue) et borné : il est contenu
// dans le disque de rayon √(A + 25/2). On fait varier A et l'on voit K_A se resserrer.
OYMWidgets.define('VuTl-sousniveaux', {
  meta: {
    title: 'Ensembles de sous-niveau et minimum global',
    description: "On fait varier A et l'on observe l'ensemble {f ≤ A} pour f(x,y) = x⁴ + y⁴ − 2(x−y)² : il reste dans un disque de rayon √(A + 25/2), se scinde en deux morceaux autour des minimums, puis se réduit aux deux points où f vaut −8.",
    concepts: ['coercivité', 'ensemble de sous-niveau', 'compacité', 'minimum global'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Zone verte : \\(K_A=\\{f\\leq A\\}\\). Cercle orange en pointillés : le disque de rayon
    \\(\\sqrt{A+25/2}\\) qui le contient, d'après \\(f\\geq\\|(x,y)\\|^2-\\frac{25}2\\). Faire baisser
    \\(A\\) jusqu'à \\(-8\\).`,
  state: { A: 12 },

  mount(root, { kit, state }) {
    const R2 = Math.SQRT2;
    const f = (x, y) => x ** 4 + y ** 4 - 2 * (x - y) ** 2;
    const POINTS = [[0, 0, 'O'], [R2, -R2, 'A'], [-R2, R2, 'B']]; // points critiques de l'exercice
    let A = state.A;

    const [left, right] = kit.columns(root, { ratio: [1, 1] });
    const P = kit.plot(left, {
      w: 420, h: 420, x: [-3.5, 3.5], y: [-3.5, 3.5], margins: { l: 36, r: 10, t: 10, b: 28 }, grid: false, maxWidth: 440,
      labels: ['\\(x\\)', '\\(y\\)'], ticks: { x: [-3, -2, -1, 0, 1, 2, 3], y: [-3, -2, -1, 0, 1, 2, 3] },
      title: 'La zone {f ≤ A} dans le plan',
    });
    P.layer('zone');
    P.contours(P.layer('niveaux'), f, [-6, -4, -2, 0, 3, 8, 16, 30], 120, 'lvl');

    const ticker = kit.ticker(50);
    const ctl = kit.controls(right, { column: true });
    const sa = kit.slider(ctl, {
      label: '\\(A\\) =', min: -9, max: 20, step: 0.1, value: A, show: (v) => kit.fmt(v, 1),
      onInput: (v) => { ticker.stop(); A = v; draw(); },
    });
    kit.button(ctl, 'Faire baisser \\(A\\) ▸', () => {
      if (A <= -8) A = 20;
      ticker.start(() => {
        A = Math.max(-8, A - 0.25);
        draw();
        return A > -8;
      });
    });
    const out = kit.output(right);

    function draw() {
      const zone = P.layer('zone');
      zone.style.color = 'var(--oym-brand)';
      zone.setAttribute('opacity', 0.3);
      P.heat(zone, f, 70, (v) => (v <= A ? 'currentColor' : 'none'));
      const g = P.layer('a');
      P.contours(g, f, [A], 140, 'gr');
      if (A > -12.5) {
        const rho = Math.sqrt(A + 12.5);
        kit.svg('circle', { cx: P.X(0), cy: P.Y(0), r: rho * (P.X(1) - P.X(0)), class: 'path', 'stroke-dasharray': '8 6' }, g);
      }
      POINTS.forEach(([x, y, n], i) => {
        P.dot(g, x, y, 5, i ? 'pt' : 'pt k');
        P.math(g, x, y, `\\(${n}\\)`, '', 'start', 8, -14);
      });
      sa.set(A);
      const atMin = Math.abs(A + 8) < 1e-9;
      const desc = A < -8 - 1e-9 ? 'vide : \\(f\\geq-8\\) partout'
        : atMin ? 'réduit aux deux points \\(A\\) et \\(B\\)'
        : A < 0 ? 'deux morceaux, autour de \\(A\\) et de \\(B\\)'
        : 'un seul morceau : les deux se rejoignent par le col \\(O\\)';
      kit.put(out, `<table><tr><td>\\(K_A=\\{f\\leq A\\}\\)</td><td>${desc}</td></tr>
        <tr><td>rayon du disque</td><td class="n">${A > -12.5 ? `\\(\\sqrt{A+25/2}=\\)${kit.fmt(Math.sqrt(A + 12.5), 2)}` : '—'}</td></tr></table>
        ${atMin ? '<div class="oym-status">Le dernier \\(K_A\\) non vide est \\(K_{-8}=\\{A,B\\}\\) : \\(\\min f=-8\\), atteint en \\(A\\) et en \\(B\\).</div>' : ''}`);
    }
    draw();
  },
});
