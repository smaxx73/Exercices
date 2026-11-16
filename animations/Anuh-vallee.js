// Exercice Anuh : f(x,y) = (x−2)² + 4(y+1)², ∇f = (2(x−2), 8(y+1)), hessienne diag(2, 8).
// La descente à pas constant η multiplie x_k − 2 par 1 − 2η et y_k + 1 par 1 − 8η :
// la direction la plus raide (y) impose la borne sur le pas.
OYMWidgets.define('Anuh-vallee', {
  meta: {
    title: 'Un pas de descente trop grand dans une vallée étroite',
    description: "Descente de gradient à pas constant sur f(x,y) = (x−2)² + 4(y+1)². On choisit le pas, par exemple 1/8 ou 1/4, et le point de départ : on voit la trajectoire sur les lignes de niveau, les facteurs de contraction des deux coordonnées et la suite des itérés.",
    concepts: ['descente de gradient', 'pas', 'conditionnement', 'oscillations'],
    author: 'mnguyen',
    kit: 1,
  },
  intro: `Descente \\((x_{k+1},y_{k+1})=(x_k,y_k)-\\eta\\nabla f(x_k,y_k)\\) pour
    \\(f(x,y)=(x-2)^2+4(y+1)^2\\), de minimum \\((2,-1)\\). Choisir le pas \\(\\eta\\)
    (boutons \\(1/8\\) et \\(1/4\\) : ceux de l'exercice) ; cliquer dans le plan pour
    changer le départ.`,
  state: { eta: 0.125, x0: 0, y0: 0 },

  mount(root, { kit, state }) {
    const f = (x, y) => (x - 2) * (x - 2) + 4 * (y + 1) * (y + 1);
    const N = 20;
    let { eta, x0, y0 } = state;
    let shown = N;

    const suite = () => {
      const ps = [[x0, y0]];
      for (let k = 0; k < N; k++) {
        const [x, y] = ps[k];
        ps.push([x - eta * 2 * (x - 2), y - eta * 8 * (y + 1)]);
      }
      return ps;
    };
    const cls = (a) => (Math.abs(a) < 1 - 1e-9 ? 'ok' : Math.abs(Math.abs(a) - 1) < 1e-9 ? 'wr' : 'bad');

    const [left, right] = kit.columns(root, { ratio: [3, 2] });
    const P = kit.plot(left, {
      w: 560, h: 420, x: [-1.5, 4.5], y: [-3.4, 1.1], maxWidth: 560,
      labels: ['\\(x\\)', '\\(y\\)'], ticks: { x: [-1, 0, 1, 2, 3, 4], y: [-3, -2, -1, 0, 1] },
      title: 'Lignes de niveau de f et trajectoire de la descente',
    });
    P.contours(P.layer('niveaux'), f, [0.25, 0.5, 1, 2, 4, 6, 9, 13, 18, 25, 34, 45], 110, 'lvl');
    P.svg.style.cursor = 'crosshair';
    P.svg.addEventListener('click', (ev) => {
      const [x, y] = P.at(ev);
      x0 = Math.round(x * 10) / 10;
      y0 = Math.round(y * 10) / 10;
      ticker.stop();
      shown = N;
      draw();
    });

    const ticker = kit.ticker(380);
    const ctl = kit.controls(right, { column: true });
    const sl = kit.slider(ctl, {
      label: 'pas \\(\\eta\\) =', min: 0.01, max: 0.35, step: 0.005, value: eta,
      show: (v) => kit.fmt(v, 3),
      onInput: (v) => {
        eta = v;
        ticker.stop();
        shown = N;
        draw();
      },
    });
    const setEta = (v) => {
      eta = v;
      sl.set(v);
      ticker.stop();
      shown = N;
      draw();
    };
    const presets = kit.controls(right);
    for (const [v, t] of [[1 / 8, '1/8'], [1 / 5, '1/5'], [1 / 4, '1/4'], [0.3, '0{,}3']]) {
      kit.button(presets, `\\(\\eta=${t}\\)`, () => setEta(v));
    }
    const play = kit.controls(right);
    kit.button(play, '▶ Rejouer', () => {
      shown = 0;
      draw();
      ticker.start(() => {
        shown++;
        draw();
        return shown < N;
      });
    });
    kit.button(play, 'Pas suivant', () => {
      ticker.stop();
      shown = Math.min(N, shown + 1);
      draw();
    });
    const factors = kit.output(right);
    const table = kit.output(right);
    const status = kit.html('div', { class: 'oym-status' }, right);

    function draw() {
      const ps = suite();
      const k = shown;
      const a = 1 - 2 * eta;
      const b = 1 - 8 * eta;
      const g = P.layer('trajectoire');
      P.dot(g, 2, -1, 7, 'pt t');
      P.poly(g, ps.slice(0, k + 1), 'path');
      ps.slice(0, k + 1).forEach((p, i) => P.dot(g, p[0], p[1], i === k ? 7 : 4.2, i === k ? 'pt' : 'pt k'));
      for (let i = 0; i <= Math.min(k, 3); i++) P.text(g, ps[i][0], ps[i][1], String(i), 'o', 'start', 9, -8);

      kit.put(factors, `<table>
        <tr><td>\\(x_k-2=(1-2\\eta)^k(x_0-2)\\)</td><td class="n">facteur <b class="${cls(a)}">${kit.fmt(a, 3)}</b></td></tr>
        <tr><td>\\(y_k+1=(1-8\\eta)^k(y_0+1)\\)</td><td class="n">facteur <b class="${cls(b)}">${kit.fmt(b, 3)}</b></td></tr></table>`);
      const rows = [];
      for (let i = 0; i <= Math.min(k, 3); i++) {
        rows.push(`<tr><td>${i}</td><td class="n">${kit.fmt(ps[i][0], 3)}</td><td class="n">${kit.fmt(ps[i][1], 3)}</td><td class="n">${kit.fmt(f(ps[i][0], ps[i][1]), 3)}</td></tr>`);
      }
      kit.put(table, `<table><tr><th>\\(k\\)</th><th class="n">\\(x_k\\)</th><th class="n">\\(y_k\\)</th><th class="n">\\(f\\)</th></tr>${rows.join('')}</table>`);

      let c = 'oym-status';
      let msg;
      if (Math.abs(Math.abs(b) - 1) < 1e-9) {
        c = 'oym-status o';
        msg = '\\(\\eta=1/4\\) : <b>\\(y_k\\) alterne entre deux valeurs</b>, la suite ne converge pas.';
      } else if (Math.abs(a) < 1 && Math.abs(b) < 1) {
        msg = 'Les deux facteurs sont de module \\(\\lt 1\\) : <b>la suite converge</b>.';
      } else {
        c = 'oym-status r';
        msg = '\\(|1-8\\eta|\\gt 1\\) : <b>la suite diverge</b>, \\(f\\) augmente.';
      }
      status.className = c;
      kit.put(status, msg);
    }

    draw();
  },
});
