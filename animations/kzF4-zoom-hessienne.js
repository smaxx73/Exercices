// Exercice kzF4 : f(x,y) = (x²+y²) e^{-x}, points critiques (0,0) et (2,0).
// Près d'un point critique p, f(x,y) − f(p) ≈ ½ hᵀ H_f(p) h avec h = (x,y) − p.
OYMWidgets.define('kzF4-zoom-hessienne', {
  meta: {
    title: 'Près d\'un point critique, f ressemble à sa hessienne',
    description: "On grossit la fenêtre autour d'un point critique de f(x,y) = (x²+y²)e^{-x}. Les lignes de niveau de f − f(p) se superposent peu à peu à celles de la forme quadratique associée à la hessienne : ellipses au minimum, hyperboles au point-selle.",
    concepts: ['hessienne', 'développement limité d\'ordre 2', 'point critique', 'point-selle'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Lignes vertes : niveaux de \\(f-f(p)\\). Pointillés : niveaux de \\(\\tfrac12h^{\\top}H_f(p)\\,h\\),
    avec \\(h=(x,y)-p\\). En rouge : le niveau \\(f(p)\\). Commencer par \\((2,0)\\), sans zoom :
    les deux familles de niveaux ne se ressemblent pas. Zoomer : elles se confondent.`,
  state: { p: 1, z: 0, quad: 1 },

  mount(root, { kit, state }) {
    const fK = (x, y) => (x * x + y * y) * Math.exp(-x);
    const HK = (x, y) => {
      const e = Math.exp(-x);
      return [(x * x + y * y - 4 * x + 2) * e, -2 * y * e, 2 * e];
    };
    const PTS = [[0, 0, '(0,0)', '\\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}'],
                 [2, 0, '(2,0)', '\\begin{pmatrix}-2e^{-2}&0\\\\0&2e^{-2}\\end{pmatrix}']];
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
    const half = (z) => 2.4 * Math.pow(50, -z / 100);
    const st = { p: state.p, z: state.z, quad: Boolean(state.quad) };

    const [left, right] = kit.columns(root, { ratio: [1, 1] });
    const P = kit.plot(left, {
      w: 500, h: 500, x: [-1, 1], y: [-1, 1], margins: { l: 48, r: 12, t: 12, b: 30 },
      labels: ['\\(x\\)', '\\(y\\)'], grid: false, zero: false, maxWidth: 420,
      title: 'Lignes de niveau de f − f(p) et de sa forme quadratique autour du point critique',
    });

    const tick = kit.ticker(45);
    const seg = kit.segmented(kit.controls(right), PTS.map((p, i) => [i, `point \\(${p[2]}\\)`]), (v) => {
      tick.stop();
      st.p = +v;
      st.z = 0;
      draw();
    });
    const ctl = kit.controls(right);
    const sz = kit.slider(ctl, {
      label: 'zoom', min: 0, max: 100, step: 1, value: st.z, show: (z) => `×${kit.fmt(Math.pow(50, z / 100), 1)}`,
      onInput: (v) => {
        tick.stop();
        st.z = v;
        draw();
      },
    });
    kit.button(ctl, 'Zoomer ▸', () => {
      if (st.z >= 100) st.z = 0;
      tick.start(() => {
        st.z = Math.min(100, st.z + 1);
        draw();
        return st.z < 100;
      });
    });
    const bq = kit.button(ctl, 'forme quadratique', () => {
      st.quad = !st.quad;
      draw();
    });
    const out = kit.output(right);

    function draw() {
      const [px, py, name, tex] = PTS[st.p];
      const H = HK(px, py);
      const f0 = fK(px, py);
      const w = half(st.z);
      const [l1, l2] = eig2(...H);
      const kap = Math.max(Math.abs(l1), Math.abs(l2));
      const sc = (kap * w * w) / 2;
      const d = (x, y) => fK(x, y) - f0;
      const q = (x, y) => qf(H, x - px, y - py) / 2;
      P.range([px - w, px + w], [py - w, py + w]);
      P.axes({ xl: '\\(x\\)', yl: '\\(y\\)', grid: false, zero: false });

      const gh = P.layer('fond');
      const vals = [];
      P.heat(gh, (x, y) => {
        const v = d(x, y);
        vals.push(v);
        return 'none';
      }, 40, () => 'none');
      let k = 0;
      for (const r of gh.children) {
        const v = vals[k++];
        r.removeAttribute('fill');
        r.style.fill = v > 0 ? 'var(--oym-accent)' : 'var(--oym-brand)';
        r.style.fillOpacity = 0.06 + 0.28 * Math.min(1, Math.abs(v) / sc);
      }

      const cs = [0.08, 0.2, 0.4, 0.65, 0.9];
      const lv = [...cs.map((c) => -c * sc), ...cs.map((c) => c * sc)];
      const gq = P.layer('quadratique');
      if (st.quad) {
        P.contours(gq, q, lv, 60, 'path');
        gq.setAttribute('stroke-dasharray', '8 6');
      }
      const gf = P.layer('f');
      P.contours(gf, d, lv, 90, 'gr');
      P.contours(gf, d, [0], 90, 'red');
      P.dot(gf, px, py, 6, 'pt k');

      let e = 0;
      let m = 0;
      for (let i = 0; i <= 24; i++) {
        for (let j = 0; j <= 24; j++) {
          const x = px - w + (2 * w * i) / 24;
          const y = py - w + (2 * w * j) / 24;
          e = Math.max(e, Math.abs(d(x, y) - q(x, y)));
          m = Math.max(m, Math.abs(q(x, y)));
        }
      }
      const [r, s, t] = H;
      const nat = monge(H);
      seg.set(st.p);
      sz.set(st.z);
      bq.classList.toggle('on', st.quad);
      kit.put(out, `<p style="margin:2px 0 6px">\\(H_f${name}=${tex}\\)</p>
        <table><tr><td>\\(rt-s^2\\)</td><td class="n">${kit.fmt(r * t - s * s, 3)}</td><td class="n">\\(r=${kit.tn(r, 3)}\\)</td></tr>
        <tr><td>valeurs propres</td><td class="n" colspan="2">${kit.fmt(l1, 3)} et ${kit.fmt(l2, 3)}</td></tr>
        <tr><td>conclusion (Monge)</td><td class="n" colspan="2"><b class="${nat === 'point-selle' ? 'wr' : 'ok'}">${nat}</b></td></tr>
        <tr><td>fenêtre</td><td class="n" colspan="2">demi-largeur ${kit.fmt(w, 3)}</td></tr>
        <tr><td>écart \\(\\bigl|f-f(p)-\\tfrac12h^{\\top}Hh\\bigr|\\)</td><td class="n" colspan="2"><b>${kit.fmt((100 * e) / m, 1)} %</b> de la forme</td></tr></table>`);
    }
    draw();
  },
});
