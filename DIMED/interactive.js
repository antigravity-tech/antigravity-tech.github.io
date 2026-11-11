// Interactive parts of the project page: the "guess the distance" quiz, the model x dataset heatmap,
// and the per-model viewer of images that all 11 architectures fail (data in assets/wall/wall.json via assets/wall/wall.js).
(function () {
  // ---------------- quiz: guess the median distance of the empty table, then reveal ----------------
  const q = window.QUIZ;
  const qs = document.getElementById('quiz');
  if (q && qs) {
    const slider = qs.querySelector('input[type=range]');
    const val = qs.querySelector('.guess');
    const btn = qs.querySelector('button');
    const out = qs.querySelector('.reveal');
    const toM = v => Math.pow(10, v);                       // slider is log10(metres)
    const show = () => { val.textContent = toM(+slider.value).toFixed(2) + ' m'; };
    slider.oninput = show; show();
    btn.onclick = () => {
      const g = toM(+slider.value), e = q.empty, o = q.objects;
      const you = g / e.gt;
      out.innerHTML =
        `<p>True median distance: <b>${e.gt.toFixed(2)} m</b>. You were off by <b>${(you >= 1 ? you : 1 / you).toFixed(1)}×</b>. ` +
        `MoGe-2 said <b>${e.pred.toFixed(2)} m</b> (${(e.pred / e.gt).toFixed(1)}× too far, δ<sub>1</sub> ${e.d1.toFixed(2)}).</p>` +
        `<p>With a few objects on the same table, MoGe-2 says <b>${o.pred.toFixed(2)} m</b> for a true ${o.gt.toFixed(2)} m (δ<sub>1</sub> ${o.d1.toFixed(2)}).` +
        ` Without anything of known size in view, the absolute distance is hard to tell, for people and for models.</p>`;
      qs.classList.add('revealed');
    };
  }

  // ---------------- side-by-side slider (drag to compare two layers) ----------------
  document.querySelectorAll('.compare').forEach(c => {
    const top = c.querySelector('.top'), handle = c.querySelector('.handle');
    const set = x => {
      const r = c.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (x - r.left) / r.width));
      top.style.clipPath = `inset(0 ${100 - 100 * p}% 0 0)`;
      handle.style.left = (100 * p) + '%';
    };
    let drag = false;
    c.addEventListener('pointerdown', e => { drag = true; c.setPointerCapture(e.pointerId); set(e.clientX); });
    c.addEventListener('pointermove', e => { if (drag) set(e.clientX); });
    c.addEventListener('pointerup', () => { drag = false; });
    const r0 = c.getBoundingClientRect(); set(r0.left + r0.width / 2);
  });
  document.querySelectorAll('.compare-switch button').forEach(b => b.onclick = () => {
    const box = document.getElementById(b.dataset.target);
    box.querySelectorAll('img.layer').forEach(im => { im.src = im.dataset[b.dataset.set]; });
    b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const cap = document.getElementById(b.dataset.target + '-cap');
    if (cap) cap.innerHTML = b.dataset.cap;
    const cb = document.getElementById(b.dataset.target + '-cbar');
    if (cb && b.dataset.cbar) cb.src = b.dataset.cbar;
  });

  // ---------------- heatmap: failure rate (or bias) per model x dataset ----------------
  const H = window.HEAT, hm = document.getElementById('heat');
  if (H && hm) {
    let metric = 'fail', cond = 'K';
    const col = (v, m) => {
      if (m === 'fail') {                       // 0 -> white, >= 0.5 -> deep red
        const t = Math.min(1, v / 0.5);
        return `rgb(${255},${Math.round(255 - 190 * t)},${Math.round(255 - 200 * t)})`;
      }
      const t = Math.max(-1, Math.min(1, v / 0.4));   // bias: blue = underestimated, red = overestimated
      return t >= 0 ? `rgb(255,${Math.round(255 - 170 * t)},${Math.round(255 - 170 * t)})`
                    : `rgb(${Math.round(255 + 170 * t)},${Math.round(255 + 120 * t)},255)`;
    };
    const fmt = (v, m) => (m === 'fail' ? (100 * v).toFixed(1) + '%' : (v >= 0 ? '+' : '') + v.toFixed(2));
    const draw = () => {
      const rows = H.rows.filter(r => r.K === cond);
      hm.innerHTML = '<thead><tr><th></th>' + H.datasets.map(d => `<th>${d}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => `<tr><th>${r.model}</th>` + r[metric].map(v => `<td style="background:${col(v, metric)}" title="${r.model} · ${fmt(v, metric)}">${fmt(v, metric)}</td>`).join('') + '</tr>').join('') +
        '</tbody>';
      document.getElementById('heat-legend').innerHTML = metric === 'fail'
        ? 'Share of images with metric δ<sub>1</sub> &lt; 0.5. White = 0%, red = 50% or more.'
        : 'Bias = mean ln(1/s*). <span style="color:#c0392b">Red</span>: depth overestimated; <span style="color:#2e5fa8">blue</span>: underestimated. 0.4 ≈ 1.5× off.';
    };
    document.querySelectorAll('#heat-controls input').forEach(el => el.onchange = () => {
      if (el.name === 'hmetric') metric = el.value; else cond = el.value; draw();
    });
    draw();
  }

  // ---------------- shared-failure viewer: pick a group, an image and a model ----------------
  const W = window.WALL, wv = document.getElementById('wallviewer');
  if (W && wv) {
    const NOTE = {
      no_cue: 'Empty tables, blank walls, sky and trees: nothing of known size is in view, and every model gets the scale wrong.',
      with_cue: 'Furniture, cans, monitors, buildings: the scale is visible to a person, yet most models still miss it, usually in the same direction.'
    };
    let group = 'no_cue', img = 0, model = 0;
    const thumbs = wv.querySelector('.thumbs'), chips = wv.querySelector('.models');
    const list = () => W.filter(e => (e.group || 'no_cue') === group);
    const draw = () => {
      const L = list(), e = L[img], m = e.models[model], base = 'assets/wall/img' + e.i;
      wv.querySelector('.v-rgb').src = base + '_rgb.jpg';
      wv.querySelector('.v-gt').src = base + '_gt.jpg';
      wv.querySelector('.v-pred').src = base + '_' + m.run + '.jpg';
      wv.querySelector('.v-cbar').src = base + '_colorbar.png';
      const k = e.k !== undefined ? e.k : e.models.filter(x => x.fail).length;
      wv.querySelector('.cap-img').innerHTML = `${e.label} · <b>${k} / 11 fail</b>`;
      wv.querySelector('.cap-gt').innerHTML = `Ground truth · median ${e.gt_median.toFixed(2)} m`;
      const off = Math.abs(Math.log(m.factor)) < Math.log(1.1) ? 'scale about right' : m.factor >= 1 ? `${m.factor.toFixed(1)}× too far` : `${(1 / m.factor).toFixed(1)}× too near`;
      wv.querySelector('.cap-pred').innerHTML = `${m.name} · median ${m.pred_median.toFixed(2)} m · ${off} · δ<sub>1</sub> ${m.delta1.toFixed(2)} ` +
        (m.fail ? '<span class="bad">fail</span>' : '<span class="good">pass</span>');
      thumbs.querySelectorAll('img').forEach((t, q) => t.classList.toggle('on', q === img));
      chips.querySelectorAll('button').forEach((b, q) => { b.classList.toggle('on', q === model); b.classList.toggle('fail', e.models[q].fail); });
    };
    const build = () => {
      const L = list();
      wv.querySelector('.group-note').textContent = NOTE[group];
      thumbs.innerHTML = L.map(e => `<img src="assets/wall/img${e.i}_rgb.jpg" alt="${e.label}" title="${e.label}">`).join('');
      chips.innerHTML = L[0].models.map(m => `<button>${m.name}</button>`).join('');
      thumbs.querySelectorAll('img').forEach((t, q) => t.onclick = () => { img = q; draw(); });
      chips.querySelectorAll('button').forEach((b, q) => b.onclick = () => { model = q; draw(); });
      wv.querySelectorAll('.groups button').forEach(b => b.classList.toggle('on', b.dataset.g === group));
      img = 0; draw();
    };
    wv.querySelectorAll('.groups button').forEach(b => b.onclick = () => {
      if (!W.some(e => (e.group || 'no_cue') === b.dataset.g)) return;
      group = b.dataset.g; build();
    });
    build();
  }
})();
