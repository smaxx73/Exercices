// Exercice kzF4 : f(x,y) = (x²+y²) e^{-x}, points critiques (0,0) et (2,0).
// Dans la direction u, la courbure uᵀH_f(p)u donne le signe de f(p+τu) − f(p) pour τ petit :
// au point-selle (2,0), elle est négative le long de l'axe des x et positive le long de l'axe des y.
OYMWidgets.define('kzF4-directions-selle', {
  meta: {
    title: 'Un point-selle : ici on monte, là on descend',
    description: "On fait tourner une direction u autour d'un point critique de f(x,y) = (x²+y²)e^{-x}. Le signe de uᵀHu, lu sur un éventail de rayons, dit si f monte ou descend dans cette direction ; le profil de f et sa parabole d'ordre 2 le confirment. Au point (2,0), le signe change : c'est un point-selle.",
    concepts: ['hessienne', 'point-selle', 'forme quadratique', 'dérivée seconde directionnelle'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Rayons : signe de \\(u^{\\top}H_fu\\), orange si \\(f\\) monte, vert d'eau si elle descend.
    Courbe : profil de \\(f\\) sur la droite orange ; pointillés : sa parabole d'ordre 2.
    Faire tourner \\(\\theta\\) en \\((2,0)\\) : la courbure change de signe.`,
  state: { p: 1, deg: 0 },

  mount(root, { kit, state }) {
    const DEG = Math.PI / 180;
    const fK = (x, y) => (x * x + y * y) * Math.exp(-x);
    const HK = (x, y) => {
      const e = Math.exp(-x);
      return [(x * x + y * y - 4 * x + 2) * e, -2 * y * e, 2 * e];
    };
    const PTS = [[0, 0, '(0,0)'], [2, 0, '(2,0)']];
    const T = [1.2, 1.6]; // demi-longueur du profil, pour chaque point
    const FAN = 0.55; // longueur des rayons
    const LEVELS = [0.04, 0.12, 0.25, 0.4, 0.7, 1, 1.5, 2.5, 4];
    const eig2 = (r, s, t) => {
      const m = (r + t) / 2;
      const d = Math.hypot((r - t) / 2, s);
      return [m - d, m + d];
    };
    const qf = ([r, s, t], u, v) => r * u * u + 2 * s * u * v + t * v * v;
    const monge = ([r, s, t]) => {
      const D = r * t - s * s;
      const e = 1e-9;
      return D > e ? (r > 0 ? 'minimum local' : 'maximum local') : D < -e ? 'point-selle' : 'on ne peut pas conclure';
    };
    const st = { p: state.p, deg: state.deg };

    // plage verticale du profil, fixée pour chaque point (sur toutes les directions)
    const ranges = {};
    const range = (k) => {
      if (!ranges[k]) {
        const [px, py] = PTS[k];
        const f0 = fK(px, py);
        let lo = 0;
        let hi = 0;
        for (let a = 0; a < 180; a += 5) {
          for (let i = 0; i <= 60; i++) {
            const tau = -T[k] + (2 * T[k] * i) / 60;
            const v = fK(px + tau * Math.cos(a * DEG), py + tau * Math.sin(a * DEG)) - f0;
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
          }
        }
        const pad = (hi - lo) * 0.08;
        ranges[k] = [lo - pad, hi + pad];
      }
      return ranges[k];
    };

    const [left, right] = kit.columns(root, { ratio: [1, 1] });
    const P = kit.plot(left, {
      w: 470, h: 415, x: [-1.2, 4.2], y: [-2.4, 2.4], margins: { l: 36, r: 10, t: 10, b: 28 },
      labels: ['\\(x\\)', '\\(y\\)'], grid: false, maxWidth: 420,
      title: 'Lignes de niveau de f, points critiques et direction u',
    });
    P.contours(P.layer('niveaux'), fK, LEVELS, 130, 'lvl');
    const gp = P.layer('points');
    for (const [x, y, name] of PTS) {
      P.dot(gp, x, y, 5, 'pt k');
      P.math(gp, x, y, `\\(${name}\\)`, '', 'start', 8, -14);
    }

    const tick = kit.ticker(50);
    const seg = kit.segmented(kit.controls(right), PTS.map((p, i) => [i, `\\(${p[2]}\\)`]), (v) => {
      tick.stop();
      st.p = +v;
      draw();
    });
    const Q = kit.plot(right, {
      w: 600, h: 215, x: [-1, 1], y: [-1, 1], margins: { l: 48, r: 12, t: 12, b: 30 },
      labels: ['\\(\\tau\\)', '\\(f(p+\\tau u)-f(p)\\)'], maxWidth: 560,
      title: 'Profil de f dans la direction u et sa parabole d\'ordre 2',
    });
    const ctl = kit.controls(right);
    const sd = kit.slider(ctl, {
      label: 'direction \\(\\theta\\) =', min: 0, max: 180, step: 1, value: st.deg, show: (v) => `${v}°`,
      onInput: (v) => {
        tick.stop();
        st.deg = v;
        draw();
      },
    });
    kit.button(ctl, 'Balayer ▸', () => {
      if (st.deg >= 180) st.deg = 0;
      tick.start(() => {
        st.deg = Math.min(180, st.deg + 1);
        draw();
        return st.deg < 180;
      });
    });
    const out = kit.output(right);

    function draw() {
      const [px, py, name] = PTS[st.p];
      const H = HK(px, py);
      const f0 = fK(px, py);
      const Tp = T[st.p];
      const th = st.deg * DEG;
      const u = Math.cos(th);
      const v = Math.sin(th);
      const k = qf(H, u, v);
      const [l1, l2] = eig2(...H);
      const eps = 1e-9 * Math.max(1, Math.abs(l1), Math.abs(l2));
      seg.set(st.p);
      sd.set(st.deg);

      // éventail autour du point : orange si uᵀHu > 0, vert d'eau si < 0, noir si nul
      const g = P.layer('direction');
      for (let a = 0; a < 360; a += 5) {
        const c = Math.cos(a * DEG);
        const s = Math.sin(a * DEG);
        const kk = qf(H, c, s);
        const zero = Math.abs(kk) < eps;
        const ray = P.line(g, px, py, px + FAN * c, py + FAN * s, zero ? 'path' : kk > 0 ? 'path' : 'gr');
        ray.setAttribute('opacity', 0.6);
        if (zero) {
          ray.style.stroke = 'var(--oym-ink)';
          ray.style.strokeWidth = 3;
        }
      }
      P.contours(g, fK, [f0], 130, 'red');
      P.line(g, px - Tp * u, py - Tp * v, px + Tp * u, py + Tp * v, 'path');
      P.dot(g, px, py, 7, 'pt');

      // profil τ ↦ f(p+τu) − f(p), et son approximation d'ordre 2
      Q.range([-Tp, Tp], range(st.p));
      Q.axes({ xl: '\\(\\tau\\)', yl: '\\(f(p+\\tau u)-f(p)\\)' });
      const gq = Q.layer('profil');
      Q.fn(gq, (tau) => (k * tau * tau) / 2, -Tp, Tp, 120, 'path').setAttribute('stroke-dasharray', '8 6');
      Q.fn(gq, (tau) => fK(px + tau * u, py + tau * v) - f0, -Tp, Tp, 240, 'curve');
      Q.dot(gq, 0, 0, 6, 'pt k');

      const verdict = Math.abs(k) < eps ? '<b>nul</b> : l\'ordre 2 ne dit rien'
        : k > 0 ? '<b class="wr">positif</b> : \\(f\\) monte' : '<b class="ok">négatif</b> : \\(f\\) descend';
      kit.put(out, `<table><tr><td>\\(u^{\\top}H_f${name}\\,u\\)</td><td class="n"><b>${kit.fmt(Math.abs(k) < eps ? 0 : k, 3)}</b></td><td>${verdict}</td></tr>
        <tr><td>valeurs propres</td><td class="n">${kit.fmt(l1, 3)} et ${kit.fmt(l2, 3)}</td><td>Monge : <b>${monge(H)}</b></td></tr></table>`);
    }
    draw();
  },
});
