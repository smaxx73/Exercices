// Exercice rsjs, question 3 : A définie positive, X* = A⁻¹b est l'unique minimiseur de
// J(X) = ½⟨AX, X⟩ − ⟨b, X⟩, car J(X* + H) = J(X*) + ½⟨AH, H⟩ > J(X*) pour H ≠ 0.
// Nuage à abscisses variées (huit abscisses distinctes), donc A = MᵀM définie positive.
// À gauche, lignes de niveau de J dans la coupe γ = γ* : H = (h₁, h₂, 0),
// ½⟨AH, H⟩ = ½(S₄h₁² + 2S₃h₁h₂ + S₂h₂²), des ellipses centrées en X*.
// On déplace X* + H à la souris, ou on le place à 0,3 selon α (écart 2,31) ou selon β
// (écart 0,68) ; le profil s ↦ J(X* + sH) − J(X*) = s²·½⟨AH, H⟩
// est une parabole de minimum 0 atteint seulement en s = 0, tracée à échelle fixe. La parabole du nuage
// associée à X* + H s'éloigne des points.
OYMWidgets.define('rsjs-niveaux', {
  meta: {
    title: "Unicité du minimum quand A est définie positive",
    description: "Lignes de niveau de J autour de X* = A⁻¹b : des ellipses centrées en X*. On déplace un point X* + H : l'écart J(X* + H) − J(X*) vaut ½⟨AH, H⟩, strictement positif dès que H ≠ 0, et la parabole correspondante s'éloigne du nuage.",
    concepts: ['moindres carrés', 'forme quadratique', 'matrice définie positive', 'lignes de niveau', 'unicité du minimum'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Nuage à huit abscisses distinctes : \\(A=M^TM\\) est définie positive et
    \\(X^*=A^{-1}b\\). À gauche, les lignes de niveau de \\(J\\) dans le plan
    \\(\\gamma=\\gamma^*\\), centrées en \\(X^*\\). Cliquer ou glisser pour placer le point
    \\(X^*+H\\), puis comparer \\(J(X^*+H)-J(X^*)\\) et \\(\\tfrac12\\langle AH,H\\rangle\\).
    Les deux boutons comparent un même déplacement de \\(0{,}3\\) selon \\(\\alpha\\) et selon \\(\\beta\\).`,
  state: { h1: 0.3, h2: 0.25 },

  mount(root, { kit, state }) {
    const pts = [[-2, 2.8], [-1.4, 1.1], [-0.8, 1.6], [-0.2, 0.7], [0.4, 1.2], [1, 0.8], [1.6, 2.0], [2.2, 2.3]];
    const S = (k) => pts.reduce((acc, [t]) => acc + t ** k, 0);
    const T = (k) => pts.reduce((acc, [t, x]) => acc + t ** k * x, 0);
    const A = [[S(4), S(3), S(2)], [S(3), S(2), S(1)], [S(2), S(1), pts.length]];
    const bv = [T(2), T(1), T(0)];
    const Av = (X) => A.map((r) => r[0] * X[0] + r[1] * X[1] + r[2] * X[2]);
    const dot = (U, V) => U[0] * V[0] + U[1] * V[1] + U[2] * V[2];
    const J = (X) => 0.5 * dot(Av(X), X) - dot(bv, X);

    // X* = A⁻¹ b par élimination de Gauss.
    const m = A.map((r, i) => [...r, bv[i]]);
    for (let c = 0; c < 3; c++) {
      let p = c;
      for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
      [m[c], m[p]] = [m[p], m[c]];
      for (let r = 0; r < 3; r++) {
        if (r === c) continue;
        const f = m[r][c] / m[c][c];
        for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k];
      }
    }
    const Xs = m.map((r, i) => r[3] / r[i]);
    const Js = J(Xs);
    const q = (h1, h2) => 0.5 * (A[0][0] * h1 * h1 + 2 * A[0][1] * h1 * h2 + A[1][1] * h2 * h2);

    let h1 = Number(state.h1);
    let h2 = Number(state.h2);
    if (!Number.isFinite(h1)) h1 = 0.3;
    if (!Number.isFinite(h2)) h2 = 0.25;

    const R = 0.5;
    const YMAX = 8;
    const [left, right] = kit.columns(root, { ratio: [1, 1] });
    const P = kit.plot(left, {
      w: 420, h: 420, x: [-R, R], y: [-R, R], maxWidth: 440,
      labels: ['\\(\\alpha-\\alpha^*\\)', '\\(\\beta-\\beta^*\\)'],
      ticks: { x: [-0.4, -0.2, 0, 0.2, 0.4], y: [-0.4, -0.2, 0, 0.2, 0.4] },
      title: 'Lignes de niveau de J dans le plan γ = γ*',
    });
    P.contours(P.layer('niveaux'), q, [0.1, 0.3, 0.6, 1, 1.5, 2.2, 3, 4, 5.5], 110, 'lvl');
    const g0 = P.layer('centre');
    P.dot(g0, 0, 0, 6, 'pt k');
    P.math(g0, 0, 0, '\\(X^*\\)', '', 'start', 8, 14);

    const place = (ev) => {
      const [x, y] = P.at(ev);
      h1 = Math.max(-R, Math.min(R, Math.round(x * 100) / 100));
      h2 = Math.max(-R, Math.min(R, Math.round(y * 100) / 100));
      draw();
    };
    let drag = false;
    P.svg.style.cursor = 'crosshair';
    P.svg.style.touchAction = 'none';
    P.svg.addEventListener('pointerdown', (ev) => {
      drag = true;
      P.svg.setPointerCapture(ev.pointerId);
      place(ev);
    });
    P.svg.addEventListener('pointermove', (ev) => {
      if (drag) place(ev);
    });
    P.svg.addEventListener('pointerup', () => {
      drag = false;
    });

    const ctl = kit.controls(right);
    kit.button(ctl, '\\(H=0\\)', () => {
      h1 = 0;
      h2 = 0;
      draw();
    });
    const preset = (a, b) => {
      h1 = a;
      h2 = b;
      draw();
    };
    kit.button(ctl, '\\(H\\) : \\(0{,}3\\) selon \\(\\alpha\\)', () => preset(0.3, 0));
    kit.button(ctl, '\\(H\\) : \\(0{,}3\\) selon \\(\\beta\\)', () => preset(0, 0.3));

    const PS = kit.plot(right, {
      w: 320, h: 170, x: [-1.5, 1.5], y: [0, 1], maxWidth: 360,
      margins: { l: 40, b: 30 }, labels: ['\\(s\\)', ''], ticks: { x: [-1, 0, 1] },
      title: 'Profil de J sur la droite passant par X* dans la direction H',
    });
    const PN = kit.plot(right, {
      w: 320, h: 200, x: [-2.5, 2.7], y: [-0.5, 4.5], maxWidth: 360,
      margins: { l: 34, b: 30 }, labels: ['\\(t\\)', '\\(x\\)'], ticks: { x: [-2, -1, 0, 1, 2], y: [0, 2, 4] },
      title: 'Nuage, parabole optimale et parabole associée à X* + H',
    });
    const out = kit.output(right);
    const status = kit.html('div', { class: 'oym-status' }, right);

    function draw() {
      const H = [h1, h2, 0];
      const X = [Xs[0] + h1, Xs[1] + h2, Xs[2]];
      const dJ = J(X) - Js;
      const qH = q(h1, h2);
      const nul = Math.hypot(h1, h2) < 1e-9;

      const g = P.layer('point');
      if (!nul) {
        P.line(g, -10 * h1, -10 * h2, 10 * h1, 10 * h2, 'ref');
        P.arrow(g, 0, 0, h1, h2, 'gr', 'aht');
        P.dot(g, h1, h2, 6, 'pt');
        P.math(g, h1, h2, '\\(X^*+H\\)', 'o', 'start', 8, -12);
      }

      // Échelle fixe : les profils de directions différentes restent comparables.
      PS.range([-1.5, 1.5], [0, YMAX]);
      PS.axes({ xt: [-1, 0, 1], yt: [0, 2, 4, 6, 8], xl: '\\(s\\)', yl: '\\(J(X^*+sH)-J(X^*)\\)' });
      const hs = PS.layer('profil');
      PS.fn(hs, (s) => s * s * qH, -1.5, 1.5, 100, 'curve');
      PS.dot(hs, 0, 0, 5, 'pt k');
      if (!nul) PS.dot(hs, 1, qH, 6, 'pt');

      const hn = PN.layer('nuage');
      const ev = (Y, t) => Y[0] * t * t + Y[1] * t + Y[2];
      if (!nul) {
        for (const [t, x] of pts) PN.line(hn, t, x, t, ev(X, t), 'path');
        PN.graph(hn, (t) => ev(Xs, t), -2.5, 2.7, { cls: 'ref' });
      }
      PN.graph(hn, (t) => ev(X, t), -2.5, 2.7, { cls: 'curve' });
      for (const [t, x] of pts) PN.dot(hn, t, x, 4, 'pt k');

      kit.put(out, `<table>
        <tr><td>\\(H\\)</td><td class="n">(${kit.fmt(H[0], 2)} ; ${kit.fmt(H[1], 2)} ; 0)</td></tr>
        <tr><td>\\(J(X^*+H)-J(X^*)\\)</td><td class="n"><b>${kit.fmt(dJ, 3)}</b></td></tr>
        <tr><td>\\(\\tfrac12\\langle AH,H\\rangle\\)</td><td class="n"><b>${kit.fmt(qH, 3)}</b></td></tr></table>`);
      if (nul) {
        status.className = 'oym-status';
        kit.put(status, "\\(H=0\\) : on est en \\(X^*\\), où \\(AX^*-b=0\\). C'est le centre commun de toutes les ellipses.");
      } else {
        status.className = 'oym-status';
        kit.put(status, "\\(H\\neq 0\\) et \\(A\\) définie positive : \\(\\tfrac12\\langle AH,H\\rangle>0\\), donc <b>\\(J(X^*+H)>J(X^*)\\)</b>. Sur chaque droite passant par \\(X^*\\), le profil est une parabole de minimum atteint seulement en \\(s=0\\) : \\(X^*\\) est l'unique minimiseur.");
      }
    }

    draw();
  },
});
