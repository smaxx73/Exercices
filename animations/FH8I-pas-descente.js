// Exercice FH8I : x_{n+1} = x_n − γ f'(x_n) pour f(x) = x²/2 − 0,2 cos 2x.
// Alors f'(x) = x + 0,4 sin 2x et 0,2 ≤ f''(x) = 1 + 0,8 cos 2x ≤ 1,8 : c = 0,2, K = 1,8.
// Deux lectures de la même suite : la courbe de f (f décroît si γ < 2/K) et la
// toile d'araignée de g(x) = x − γ f'(x) (|g'| ≤ M, contractante si M < 1).
OYMWidgets.define('FH8I-pas-descente', {
  meta: {
    title: 'Descente de gradient : choisir le pas en dimension 1',
    description: "On fait varier le pas γ d'une descente de gradient pour f(x) = x²/2 − 0,2 cos 2x. Deux vues de la même suite : la courbe de f, qui décroît tant que γ < 2/K, et la toile d'araignée de g(x) = x − γ f'(x), dont la pente est bornée par M.",
    concepts: ['descente de gradient', 'pas', 'fonction contractante', 'point fixe', 'majoration de la hessienne'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Suite \\(x_{n+1}=x_n-\\gamma f'(x_n)\\) pour \\(f(x)=x^2/2-0{,}2\\cos 2x\\), avec
    \\(0{,}2\\le f''\\le K=1{,}8\\). Faire varier le pas \\(\\gamma\\) et regarder la suite,
    d'abord sur la courbe de \\(f\\), puis sur la toile d'araignée de
    \\(g(x)=x-\\gamma f'(x)\\).`,
  state: { gamma: 0.3, x0: 2.6, view: 'f' },

  mount(root, { kit, state }) {
    const f = (x) => (x * x) / 2 - 0.2 * Math.cos(2 * x);
    const fp = (x) => x + 0.4 * Math.sin(2 * x);
    const c = 0.2;
    const K = 1.8;
    const N = 12;
    let { gamma, x0, view } = state;
    let shown = N;

    const suite = () => {
      const xs = [x0];
      for (let k = 0; k < N; k++) xs.push(xs[k] - gamma * fp(xs[k]));
      return xs;
    };

    const [left, right] = kit.columns(root, { ratio: [3, 2] });
    const tabs = kit.controls(left);
    const seg = kit.segmented(tabs, [['f', 'courbe de \\(f\\)'], ['g', 'toile d\'araignée de \\(g\\)']], (v) => {
      view = v;
      show();
      draw();
    });
    const boxF = kit.html('div', {}, left);
    const boxG = kit.html('div', {}, left);
    const PF = kit.plot(boxF, {
      w: 560, h: 400, x: [-3.2, 3.2], y: [-0.5, 5.2], maxWidth: 560,
      labels: ['\\(x\\)', '\\(f(x)\\)'], ticks: { x: [-3, -2, -1, 0, 1, 2, 3], y: [0, 1, 2, 3, 4, 5] },
      title: 'La suite des itérés sur la courbe de f',
    });
    const PG = kit.plot(boxG, {
      w: 460, h: 400, x: [-3, 3], y: [-3, 3], maxWidth: 460, margins: { l: 40 },
      labels: ['\\(x\\)', '\\(g(x)\\)'], ticks: { x: [-3, -2, -1, 0, 1, 2, 3], y: [-3, -2, -1, 0, 1, 2, 3] },
      title: "Toile d'araignée de g",
    });
    const show = () => {
      boxF.hidden = view !== 'f';
      boxG.hidden = view !== 'g';
      seg.set(view);
    };

    const ticker = kit.ticker(420);
    const ctl = kit.controls(right, { column: true });
    const sg = kit.slider(ctl, {
      label: 'pas \\(\\gamma\\) =', min: 0.05, max: 1.4, step: 0.01, value: gamma,
      show: (v) => kit.fmt(v, 2),
      onInput: (v) => {
        gamma = v;
        ticker.stop();
        shown = N;
        draw();
      },
    });
    const sx = kit.slider(ctl, {
      label: 'départ \\(x_0\\) =', min: -3, max: 3, step: 0.1, value: x0,
      show: (v) => kit.fmt(v, 1),
      onInput: (v) => {
        x0 = v;
        ticker.stop();
        shown = N;
        draw();
      },
    });
    const row = kit.controls(right);
    kit.button(row, '▶ Rejouer', () => {
      shown = 0;
      draw();
      ticker.start(() => {
        shown++;
        draw();
        return shown < N;
      });
    });
    kit.button(row, 'Pas suivant', () => {
      ticker.stop();
      shown = Math.min(N, shown + 1);
      draw();
    });
    const setGamma = (v) => {
      gamma = v;
      sg.set(v);
      ticker.stop();
      shown = N;
      draw();
    };
    kit.button(row, '\\(\\gamma=1/K\\)', () => setGamma(1 / K));
    kit.button(row, '\\(\\gamma=2/K\\)', () => setGamma(2 / K));
    const out = kit.output(right);
    const status = kit.html('div', { class: 'oym-status' }, right);

    function draw() {
      const xs = suite();
      const k = shown;
      const lim = 2 / K;
      const M = Math.max(Math.abs(1 - gamma * c), Math.abs(1 - gamma * K));

      if (view === 'f') {
        const g = PF.layer('suite');
        PF.fn(g, f, -3.2, 3.2, 240, 'curve');
        PF.dot(g, 0, f(0), 7, 'pt t');
        PF.text(g, 0.12, f(0) - 0.05, 'minimum', 'm', 'start', 4, 16);
        const pts = xs.slice(0, k + 1).map((x) => [x, f(x)]);
        if (pts.length > 1) PF.poly(g, pts, 'path soft');
        const xc = xs[k];
        const sl = fp(xc);
        PF.line(g, xc - 0.9, f(xc) - 0.9 * sl, xc + 0.9, f(xc) + 0.9 * sl, 'ref');
        pts.forEach((p, i) => PF.dot(g, p[0], p[1], i === k ? 8 : 4.5, i === k ? 'pt' : 'pt soft'));
        if (k < N) {
          const xn = xs[k + 1];
          PF.arrow(g, xc, -0.3, xn, -0.3, 'path', 'ah');
          PF.math(g, xn, -0.3, `\\(x_{${k + 1}}\\)`, 'o', 'middle', 0, -18);
        }
      } else {
        const g = PG.layer('toile');
        PG.line(g, -3, -3 * M, 3, 3 * M, 'ref');
        PG.line(g, -3, 3 * M, 3, -3 * M, 'ref');
        PG.line(g, -3, -3, 3, 3, 'cob soft');
        PG.fn(g, (x) => x - gamma * fp(x), -3, 3, 240, 'curve');
        const pts = [[xs[0], 0]];
        for (let i = 0; i < k; i++) {
          pts.push([xs[i], xs[i + 1]]);
          pts.push([xs[i + 1], xs[i + 1]]);
        }
        PG.poly(g, pts, 'cob');
        PG.dot(g, xs[0], 0, 5, 'pt');
        if (k > 0) PG.dot(g, xs[k], xs[k], 7, 'pt');
        PG.math(g, 2.9, 2.55, '\\(y=x\\)', 'm', 'end');
      }

      const rows = [];
      for (let i = Math.max(0, k - 3); i <= k; i++) {
        rows.push(`<tr><td>${i}</td><td class="n">${kit.fmt(xs[i], 4)}</td><td class="n">${kit.fmt(f(xs[i]), 4)}</td></tr>`);
      }
      kit.put(out, view === 'f'
        ? `<table><tr><th>\\(n\\)</th><th class="n">\\(x_n\\)</th><th class="n">\\(f(x_n)\\)</th></tr>${rows.join('')}</table>`
        : `<p style="margin:0 0 6px">\\(M\\le\\max(|1-\\gamma c|,\\ |1-\\gamma K|)\\) = <b class="${M < 1 ? 'ok' : 'bad'}">${kit.fmt(M, 3)}</b></p>
          <p style="margin:0">avec \\(c=0{,}2\\) et \\(K=1{,}8\\) (bornes de \\(f''\\))</p>`);

      const dec = xs.slice(0, k + 1).every((x, i) => i === 0 || f(x) <= f(xs[i - 1]) + 1e-12);
      const ok = gamma < lim;
      status.className = ok ? 'oym-status' : 'oym-status o';
      kit.put(status, ok
        ? (view === 'f'
          ? `\\(\\gamma=${kit.tn(gamma, 2)}\\lt 2/K\\approx ${kit.tn(lim, 2)}\\) : <b>\\(f\\) décroît à chaque pas</b>, comme le montre la question 1.`
          : '\\(\\gamma\\lt 2/K\\) : \\(M\\lt 1\\), <b>\\(g\\) est contractante</b> et \\(x_n\\) converge (question 2).')
        : (view === 'f'
          ? `\\(\\gamma\\ge 2/K\\approx ${kit.tn(lim, 2)}\\) : <b>plus de garantie</b>. ${dec ? 'Ici \\(f\\) décroît encore, mais rien ne l\'assure.' : 'Ici \\(f\\) remonte : la suite oscille.'}`
          : '\\(\\gamma\\ge 2/K\\) : \\(M\\ge 1\\), la majoration ne prouve plus rien. Le point fixe peut cesser d\'attirer.'));
    }

    show();
    draw();
  },
});
