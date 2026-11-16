// Exercice ebva, question 1 : f(x,y) = y²/x si x ≠ 0, f(0,y) = y, f(0,0) = 0.
// Les lignes de niveau f = c sont les paraboles x = y²/c, qui passent toutes par
// l'origine : le long de x = y²/c, f vaut c ; le long d'une droite y = mx, f(x,mx) = m²x → 0.
OYMWidgets.define('ebva-continuite', {
  meta: {
    title: "Continuité en l'origine : tous les chemins",
    description: "Un point approche de l'origine le long d'une parabole x = y²/c ou d'une droite y = mx, pour f(x,y) = y²/x. La valeur de f le long du chemin tend vers c sur la parabole et vers 0 sur la droite : f n'a pas de limite en (0,0), donc n'est pas continue.",
    concepts: ['continuité', 'limite le long d\'un chemin', 'fonction de deux variables'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Fonction de l'exercice : \\(f(x,y)=y^2/x\\) si \\(x\\ne0\\), \\(f(0,y)=y\\). Les lignes de niveau
    \\(f=c\\) sont les paraboles \\(x=y^2/c\\), et toutes passent par \\((0,0)\\). Faire approcher le point
    de l'origine le long d'une parabole, puis d'une droite, et comparer la limite de \\(f\\) à \\(f(0,0)=0\\).`,
  state: { mode: 'parabole', c: 1, m: 1, tau: 1 },

  mount(root, { kit, state }) {
    const fE = (x, y) => (Math.abs(x) < 1e-12 ? y : (y * y) / x);
    const st = { mode: state.mode, c: state.c, m: state.m, tau: state.tau };

    const [left, right] = kit.columns(root, { ratio: [1, 1] });

    // À gauche : le plan, les lignes de niveau de f et le chemin suivi
    const P = kit.plot(left, {
      w: 470, h: 470, x: [-1.2, 1.2], y: [-1.2, 1.2], margins: { l: 36, r: 12, t: 12, b: 30 },
      labels: ['\\(x\\)', '\\(y\\)'], ticks: { x: [-1, -0.5, 0, 0.5, 1], y: [-1, -0.5, 0, 0.5, 1] }, maxWidth: 420,
      title: 'Les lignes de niveau de f et le chemin vers (0,0)',
    });
    P.contours(P.layer('niveaux'), fE, [-3, -2, -1, -0.5, 0.5, 1, 2, 3], 141, 'lvl', (x0, y0, x1) => x0 < 0 && x1 > 0);
    P.text(P.layer('legende'), -1.15, -1.13, 'lignes de niveau de f : des paraboles', 'm');

    // À droite : f le long du chemin, en fonction de τ
    const Q = kit.plot(right, {
      w: 640, h: 215, x: [0, 1], y: [-4, 4], margins: { l: 44, r: 14, t: 12, b: 34 },
      labels: ['\\(\\tau\\)', '\\(f\\) le long du chemin'], maxWidth: 560,
      title: 'La valeur de f le long du chemin en fonction de τ',
    });

    const ctl = kit.controls(right, { column: true });
    const seg = kit.segmented(ctl, [['parabole', 'parabole \\(x=y^2/c\\)'], ['droite', 'droite \\(y=mx\\)']], (v) => {
      st.mode = v;
      draw();
    });
    const sc = kit.slider(ctl, {
      label: '\\(c\\) =', min: -3, max: 3, step: 0.25, value: st.c,
      onInput: (v) => {
        st.c = Math.abs(v) < 0.01 ? 0.25 : v;
        draw();
      },
    });
    const sm = kit.slider(ctl, {
      label: '\\(m\\) =', min: -3, max: 3, step: 0.25, value: st.m,
      onInput: (v) => {
        st.m = v;
        draw();
      },
    });
    const tick = kit.ticker(60);
    const row = kit.controls(ctl);
    kit.button(row, '▶ Approcher \\((0,0)\\)', () => {
      st.tau = 1;
      draw();
      tick.start(() => {
        st.tau = Math.max(0, st.tau - 0.01);
        draw();
        return st.tau > 0;
      });
    });
    const stau = kit.slider(ctl, {
      label: '\\(\\tau\\) =', min: 0, max: 1, step: 0.01, value: st.tau,
      onInput: (v) => {
        tick.stop();
        st.tau = v;
        draw();
      },
    });
    const out = kit.output(right);

    const path = (t) => (st.mode === 'parabole' ? [(t * t) / st.c, t] : [t, st.m * t]);

    function draw() {
      const { mode, c, m, tau } = st;
      seg.set(mode);
      sc.set(c);
      sc.el.style.display = mode === 'parabole' ? '' : 'none';
      sm.el.style.display = mode === 'droite' ? '' : 'none';
      stau.set(tau);

      const g = P.layer('chemin');
      const pts = [];
      for (let i = 0; i <= 100; i++) pts.push(path((i / 100) * 1.15));
      P.poly(g, pts.filter((p) => Math.abs(p[0]) < 1.5 && Math.abs(p[1]) < 1.5), 'path');
      if (mode === 'parabole') {
        const neg = [];
        for (let i = 0; i <= 100; i++) neg.push([((i / 100) * 1.15) ** 2 / c, -(i / 100) * 1.15]);
        P.poly(g, neg.filter((p) => Math.abs(p[0]) < 1.5), 'path');
      }
      const [px, py] = path(tau);
      P.dot(g, px, py, 8, 'pt');
      P.dot(g, 0, 0, 6, 'pt t');

      const fv = mode === 'parabole' ? c : m * m * tau;
      const lim = mode === 'parabole' ? c : 0;
      const gq = Q.layer('valeurs');
      Q.poly(gq, [[0, 0], [1, 0]], 'ref');
      const curve = [];
      for (let i = 1; i <= 100; i++) curve.push([i / 100, mode === 'parabole' ? c : (m * m * i) / 100]);
      Q.poly(gq, curve, 'path');
      Q.dot(gq, 0, lim, 7, 'pt');
      Q.dot(gq, 0, 0, 6, 'pt t');
      Q.dot(gq, tau, fv, 8, 'pt k');

      kit.put(out, `<table>
        <tr><td>point \\((x,y)\\)</td><td class="n">(${kit.fmt(px, 3)} ; ${kit.fmt(py, 3)})</td></tr>
        <tr><td>\\(f(x,y)\\) le long du chemin</td><td class="n"><b class="${Math.abs(lim) > 1e-9 ? 'bad' : 'ok'}">${kit.fmt(fv, 3)}</b></td></tr>
        <tr><td>limite quand \\(\\tau\\to0\\)</td><td class="n"><b>${kit.fmt(lim, 3)}</b></td></tr>
        <tr><td>valeur \\(f(0,0)\\)</td><td class="n"><b>0</b></td></tr></table>
        <div class="oym-status ${Math.abs(lim) > 1e-9 ? 'r' : ''}">${Math.abs(lim) > 1e-9
          ? '<b>Limite différente de \\(f(0,0)\\)</b> : \\(f\\) n\'est pas continue en \\((0,0)\\).'
          : 'Sur ce chemin, la limite vaut \\(f(0,0)\\) : un seul chemin ne suffit pas à conclure.'}</div>`);
    }
    draw();
  },
});
