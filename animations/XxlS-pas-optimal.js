// Exercice XxlS : J(v) = ½⟨Av,v⟩ avec A = diag(1, κ) (λ₁ = 1, λ_p = κ, b = 0, minimum u = 0).
// Pas optimal ϱ_k = ‖w_k‖² / ⟨Aw_k,w_k⟩ : deux gradients successifs sont orthogonaux,
// d'où le zigzag quand κ est grand. Comparaison avec le pas fixe 1/λ_p.
// Départ par défaut u₀ = (4 ; 4/κ) : composantes du gradient égales, cas le plus défavorable.
OYMWidgets.define('XxlS-pas-optimal', {
  meta: {
    title: 'Gradient à pas optimal : le zigzag',
    description: "Sur J(v) = ½(x² + κy²), on suit les itérations du gradient à pas optimal et à pas fixe 1/λ_p. On règle le conditionnement κ et le point de départ : les gradients successifs du pas optimal sont orthogonaux, et la convergence ralentit quand κ grandit.",
    concepts: ['méthode de gradient', 'pas optimal', 'conditionnement', 'fonctionnelle quadratique'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Ici \\(A=\\operatorname{diag}(1,\\kappa)\\), donc \\(\\lambda_1=1\\) et \\(\\lambda_p=\\kappa\\).
    Les flèches vertes sont les directions \\(-w_k\\) aux cinq premiers points du pas optimal :
    deux flèches successives sont orthogonales (le pas minimise \\(\\varrho\\mapsto J(u_k-\\varrho w_k)\\)).
    Cliquer dans le plan pour changer le point de départ \\(u_0\\).`,
  state: { kappa: 10, method: 'opt' },

  mount(root, { kit, state }) {
    const KMAX = 40;
    let kappa = state.kappa;
    let method = state.method === 'fixe' ? 'fixe' : 'opt';
    let start = null; // null : départ défavorable (4 ; 4/κ)
    const names = { opt: 'pas optimal', fixe: 'pas fixe \\(1/\\lambda_p\\)' };
    const cls = { opt: 'gr', fixe: 'red' };

    const J = (v) => 0.5 * (v[0] * v[0] + kappa * v[1] * v[1]);
    function simulate(m, v0, n) {
      const us = [v0.slice()];
      for (let i = 0; i < n; i++) {
        const u = us[i];
        const w = [u[0], kappa * u[1]];
        let rho = 1 / kappa;
        if (m === 'opt') {
          const den = w[0] * w[0] + kappa * w[1] * w[1];
          rho = den > 0 ? (w[0] * w[0] + w[1] * w[1]) / den : 0;
        }
        us.push([u[0] - rho * w[0], u[1] - rho * w[1]]);
      }
      return us;
    }
    function iterations(m, v0, cap = 4000) {
      const us = simulate(m, v0, cap);
      const J0 = J(v0);
      for (let i = 0; i < us.length; i++) if (J(us[i]) < 1e-6 * J0) return i;
      return Infinity;
    }

    const [left, right] = kit.columns(root, { ratio: [3, 2] });
    const P = kit.plot(left, {
      w: 480, h: 380, x: [-1.5, 4.5], y: [-2.25, 2.25], margins: { l: 34, r: 10, t: 10, b: 28 },
      labels: ['\\(x\\)', '\\(y\\)'], ticks: { x: [-1, 0, 1, 2, 3, 4], y: [-2, -1, 0, 1, 2] }, maxWidth: 520,
      title: 'Lignes de niveau de J et itérations du gradient',
    });
    P.svg.style.cursor = 'crosshair';
    P.svg.addEventListener('click', (ev) => {
      const [x, y] = P.at(ev);
      start = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      draw();
    });

    kit.html('p', { class: 'oym-legend' }, right,
      '\\(\\log_{10}\\bigl(J(u_k)/J(u_0)\\bigr)\\) selon le nombre d’itérations \\(k\\)');
    const Q = kit.plot(right, {
      w: 400, h: 200, x: [0, 40], y: [-8, 0.4], margins: { l: 36, r: 10, t: 10, b: 30 },
      labels: ['\\(k\\)'], ticks: { x: [0, 10, 20, 30, 40], y: [-8, -4, 0] }, maxWidth: 440,
      title: 'Décroissance de J selon le nombre d’itérations',
    });

    const ctl = kit.controls(right, { column: true });
    const row = kit.controls(ctl);
    const sk = kit.slider(row, {
      label: '\\(\\kappa\\) =', min: 1, max: KMAX, step: 1, value: kappa, show: (v) => String(v),
      onInput: (v) => { kappa = v; draw(); },
    });
    kit.button(row, 'Départ défavorable', () => { start = null; draw(); });
    const seg = kit.segmented(ctl, Object.entries(names), (m) => { method = m; draw(); });
    const out = kit.output(right);

    function draw() {
      const v0 = start || [4, 4 / kappa];
      const J0 = J(v0);
      const levels = Array.from({ length: 9 }, (_, i) => J0 * Math.pow(0.5, i));
      P.contours(P.layer('niveaux'), (x, y) => J([x, y]), levels, 100, 'lvl');

      const us = simulate(method, v0, 60);
      const g = P.layer('suite');
      const shown = us.slice(0, method === 'opt' ? 40 : 60);
      P.poly(g, shown, 'path');
      if (method === 'opt') {
        for (let i = 0; i < 5; i++) {
          const u = us[i];
          const gx = u[0];
          const gy = kappa * u[1];
          const n = Math.hypot(gx, gy) || 1;
          P.arrow(g, u[0], u[1], u[0] - (0.55 * gx) / n, u[1] - (0.55 * gy) / n, 'gr', 'aht');
        }
      }
      shown.forEach((p, i) => P.dot(g, p[0], p[1], i === 0 ? 7 : 3.6, i === 0 ? 'pt' : 'pt k'));
      P.dot(g, 0, 0, 6, 'pt t');

      const gq = Q.layer('courbes');
      for (const m of ['opt', 'fixe']) {
        const pts = simulate(m, v0, 40).map((v, i) => [i, Math.max(-12, Math.log10(Math.max(1e-16, J(v) / J0)))]);
        const p = Q.poly(gq, pts, cls[m] + (m === method ? '' : ' soft'));
        if (m !== method) p.setAttribute('stroke-width', 1.8);
      }

      const rows = ['opt', 'fixe'].map((m) => {
        const n = iterations(m, v0);
        return `<tr${m === method ? ' style="font-weight:650"' : ''}><td>${names[m]}</td><td class="n">${isFinite(n) ? n : '> 4000'}</td></tr>`;
      }).join('');
      kit.put(out, `<p class="oym-legend" style="margin:0">itérations pour \\(J(u_k)\\lt 10^{-6}J(u_0)\\) · \\((\\kappa-1)/(\\kappa+1)=${kit.tn((kappa - 1) / (kappa + 1), 3)}\\)</p><table>${rows}</table>`);
      seg.set(method);
      sk.set(kappa);
    }
    draw();
  },
});
