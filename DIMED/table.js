// Sortable main table (Table 2 of the paper); data in assets/table2.js (generated from analysis/reproduce_main_numbers.py --json).
const COLS = [
  { key: 'model', label: 'Model' },
  { key: 'K', label: 'Intrinsics', fmt: v => (v === 'K' ? 'with K' : 'w/o K') },
  { key: 'metric_d1', label: 'δ₁ ↑', group: 'Metric', fmt: v => v.toFixed(3), dir: -1 },
  { key: 'metric_rel', label: 'Rel ↓', group: 'Metric', fmt: v => v.toFixed(3), dir: 1 },
  { key: 'fail', label: 'Fail. ↓', group: 'Metric', fmt: v => (100 * v).toFixed(1) + '%', dir: 1 },
  { key: 'sa_d1', label: 'δ₁ ↑', group: 'Structure', fmt: v => v.toFixed(3), dir: -1 },
  { key: 'sa_rel', label: 'Rel ↓', group: 'Structure', fmt: v => v.toFixed(3), dir: 1 },
  { key: 'sa_fail', label: 'Fail. ↓', group: 'Structure', fmt: v => (100 * v).toFixed(1) + '%', dir: 1 },
  { key: 'bias', label: 'Bias (→0)', group: 'Scale (s*)', fmt: v => (v >= 0 ? '+' : '') + v.toFixed(3), dir: 1, abs: true },
  { key: 'stability', label: 'Stab. ↓', group: 'Scale (s*)', fmt: v => v.toFixed(3), dir: 1 },
  { key: 'abs_err', label: 'Abs. err. ↓', group: 'Scale (s*)', fmt: v => v.toFixed(3), dir: 1 },
];
let DATA = [], sortKey = 'fail', sortDir = 1, cond = 'all';

function header() {
  const thead = document.querySelector('#t2 thead');
  const groups = [];
  COLS.forEach(c => {
    const g = c.group || '';
    if (groups.length && groups[groups.length - 1].g === g) groups[groups.length - 1].n++;
    else groups.push({ g, n: 1 });
  });
  thead.innerHTML = '<tr class="group">' + groups.map(x => `<th colspan="${x.n}">${x.g}</th>`).join('') + '</tr>' +
    '<tr>' + COLS.map(c => `<th data-k="${c.key}">${c.label}</th>`).join('') + '</tr>';
  thead.querySelectorAll('tr:last-child th').forEach(th => th.onclick = () => {
    const k = th.dataset.k, c = COLS.find(x => x.key === k);
    if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = c.dir || 1; }
    render();
  });
}

function render() {
  const rows = DATA.filter(r => cond === 'all' || r.K === cond);
  const c = COLS.find(x => x.key === sortKey);
  const val = r => (c.abs ? Math.abs(r[sortKey]) : r[sortKey]);
  rows.sort((a, b) => (typeof val(a) === 'string' ? val(a).localeCompare(val(b)) : val(a) - val(b)) * sortDir);
  const best = {};
  COLS.filter(x => x.dir).forEach(x => {
    const v = rows.map(r => (x.abs ? Math.abs(r[x.key]) : r[x.key]));
    best[x.key] = x.dir < 0 ? Math.max(...v) : Math.min(...v);
  });
  document.querySelector('#t2 tbody').innerHTML = rows.map(r => '<tr>' + COLS.map(x => {
    const v = r[x.key], cmp = x.abs ? Math.abs(v) : v;
    const cls = x.dir && cmp === best[x.key] ? ' class="best"' : '';
    return `<td${cls}>${x.fmt ? x.fmt(v) : v}</td>`;
  }).join('') + '</tr>').join('');
  document.querySelectorAll('#t2 thead tr:last-child th').forEach(th => th.classList.toggle('sorted', th.dataset.k === sortKey));
}

document.querySelectorAll('input[name=cond]').forEach(el => el.onchange = () => { cond = el.value; render(); });
// data is embedded with a <script> tag so the page also works when opened from file://
DATA = window.TABLE2 || [];
header();
render();
