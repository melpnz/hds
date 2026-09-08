// Сравнение раскладки двух ширин по computed-<w>.json — с учётом непарных узлов.
//
//   node .pipeline/R0-00/compare-widths.mjs 375 744 [--only <id>] [--dump <id>]
//
// ЗАЧЕМ. Первая редакция шага сопоставляла узлы по ключу и считала признаки
// только на парах. Узел, которого на одной из ширин в DOM нет, пары не получает
// и «сменить видимость» не может по построению — на границе 375 ↔ 744 так молча
// выпали 1488 ключей из 10 877 (13,7 %), и среди них была подмена реализации
// фильтра. Ревью .pipeline/R0-00/review-1.md, находка 1.
//
// КЛЮЧ СОПОСТАВЛЕНИЯ: `path` + ' ' + `classes`, оба поля из computed-<w>.json
// как есть. `path` — цепочка `tag[индекс среди детей]` от body, поэтому внутри
// одной ширины ключ уникален; дубли считаются и печатаются отдельной строкой.
//
// КРИТЕРИЙ «УЗЕЛ ЗАНИМАЕТ МЕСТО»: box.w > 0 И box.h > 0, где box —
// getBoundingClientRect на момент съёмки. Ноль по любому измерению — узел
// не занимает места в раскладке: display:none, схлопнутый или пустой.
// Других признаков (display, visibility, opacity) не берём: узел с display:none
// даёт нулевой бокс, и обратное тоже верно.
//
// СОБЫТИЯ РАСКЛАДКИ — три непересекающихся класса, их сумма и есть «изменений»:
//   toggled     ключ есть на обеих ширинах, занимает место ровно на одной
//   appeared    ключа нет на левой ширине, на правой есть и занимает место
//   disappeared ключ есть на левой и занимает место, на правой ключа нет
// Непарные узлы с нулевым боксом в события не попадают, но считаются отдельно:
// это скрытый резерв разметки, он раскладку не меняет.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PAGES = path.join(ROOT, 'evidence', 'source', 'production', 'pages');

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const [A, B] = argv.filter((t) => /^\d+$/.test(t)).map(Number);
if (!A || !B) { console.error('Нужны две ширины: node compare-widths.mjs 375 744'); process.exit(2); }
const only = arg('only');
const dump = arg('dump');

const KEY = (e) => `${e.path} ${e.classes ?? ''}`;
const OCCUPIES = (e) => Boolean(e.box) && e.box.w > 0 && e.box.h > 0;

const load = (id, w) => {
  const file = path.join(PAGES, id, `computed-${w}.json`);
  if (!fs.existsSync(file)) return null;
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  const map = new Map();
  let dupes = 0;
  for (const e of list) { if (map.has(KEY(e))) dupes += 1; map.set(KEY(e), e); }
  return { list, map, dupes };
};

const ids = (only ? [only] : fs.readdirSync(PAGES)).filter((id) =>
  fs.existsSync(path.join(PAGES, id, `computed-${A}.json`))
  && fs.existsSync(path.join(PAGES, id, `computed-${B}.json`)));

const rows = [];
for (const id of ids) {
  const a = load(id, A); const b = load(id, B);
  const union = new Set([...a.map.keys(), ...b.map.keys()]);

  const r = {
    id, nodesA: a.list.length, nodesB: b.list.length, dupesA: a.dupes, dupesB: b.dupes,
    union: union.size, matched: 0,
    onlyA: 0, onlyAOccupying: 0, onlyB: 0, onlyBOccupying: 0,
    toggled: 0, appeared: 0, disappeared: 0,
    flexDir: 0, gridCols: 0,
    samples: { appeared: [], disappeared: [], toggled: [] },
  };

  for (const key of union) {
    const ea = a.map.get(key); const eb = b.map.get(key);
    if (ea && eb) {
      r.matched += 1;
      if (OCCUPIES(ea) !== OCCUPIES(eb)) {
        r.toggled += 1;
        if (r.samples.toggled.length < 8) r.samples.toggled.push(`${OCCUPIES(ea) ? 'gone' : 'shown'} ${ea.tag}.${(ea.classes || '').slice(0, 90)}`);
      }
      if ((ea.styles?.['flex-direction'] ?? '') !== (eb.styles?.['flex-direction'] ?? '')) r.flexDir += 1;
      const ca = (ea.styles?.['grid-template-columns'] ?? '').trim();
      const cb = (eb.styles?.['grid-template-columns'] ?? '').trim();
      if (ca && cb && ca.split(/\s+/).length !== cb.split(/\s+/).length) r.gridCols += 1;
    } else if (ea) {
      r.onlyA += 1;
      if (OCCUPIES(ea)) {
        r.onlyAOccupying += 1; r.disappeared += 1;
        if (r.samples.disappeared.length < 8) r.samples.disappeared.push(`${ea.tag}.${(ea.classes || '').slice(0, 90)}`);
      }
    } else {
      r.onlyB += 1;
      if (OCCUPIES(eb)) {
        r.onlyBOccupying += 1; r.appeared += 1;
        if (r.samples.appeared.length < 8) r.samples.appeared.push(`${eb.tag}.${(eb.classes || '').slice(0, 90)}`);
      }
    }
  }
  r.layoutEvents = r.toggled + r.appeared + r.disappeared;
  rows.push(r);
}

const total = rows.reduce((acc, r) => {
  for (const k of ['union', 'matched', 'onlyA', 'onlyB', 'onlyAOccupying', 'onlyBOccupying', 'toggled', 'appeared', 'disappeared', 'layoutEvents', 'flexDir', 'gridCols', 'dupesA', 'dupesB']) acc[k] = (acc[k] ?? 0) + r[k];
  return acc;
}, {});

const pad = (s, n) => String(s).padStart(n);
console.log(`\n${A} -> ${B}   key: path+classes   occupies: box.w>0 && box.h>0\n`);
console.log('page                        |  keys | pairs | unpaired A/B | of them boxed | toggl | appear | disapp | TOTAL | flexDir | gridCols');
const line = (name, r) => console.log(`${String(name).padEnd(27)} |${pad(r.union, 6)} |${pad(r.matched, 6)} |${pad(`${r.onlyA}/${r.onlyB}`, 13)} |${pad(`${r.onlyAOccupying}/${r.onlyBOccupying}`, 14)} |${pad(r.toggled, 6)} |${pad(r.appeared, 7)} |${pad(r.disappeared, 7)} |${pad(r.layoutEvents, 6)} |${pad(r.flexDir, 8)} |${pad(r.gridCols, 9)}`);
for (const r of rows) line(r.id, r);
line('TOTAL', total);
console.log(`\nduplicate keys within a width: ${A} = ${total.dupesA}, ${B} = ${total.dupesB}`);
console.log(`unpaired: ${total.onlyA + total.onlyB} of ${total.union} keys (${(100 * (total.onlyA + total.onlyB) / total.union).toFixed(1)} %)`);

if (dump) {
  const r = rows.find((x) => x.id === dump);
  if (r) {
    console.log(`\n-- samples for ${dump} --`);
    for (const k of ['appeared', 'disappeared', 'toggled']) {
      console.log(` ${k}:`);
      r.samples[k].forEach((s) => console.log(`   ${s}`));
    }
  }
}

fs.writeFileSync(path.join(HERE, `compare-${A}-${B}.json`), JSON.stringify({
  a: A, b: B, key: 'path+classes', occupies: 'box.w>0 && box.h>0', rows, total,
}, null, 2), 'utf8');
