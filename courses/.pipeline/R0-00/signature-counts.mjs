// Структурная разница между ширинами: сколько узлов каждой сигнатуры классов
// занимает место на ширине A и сколько на ширине B.
//
//   node .pipeline/R0-00/signature-counts.mjs 375 744 [--min-pages 2] [--only <id>]
//
// ЗАЧЕМ. Сопоставление по `path + classes` ломается, когда узел переезжает
// в другое место дерева: одна и та же сигнатура попадает разом и в «появилось»,
// и в «исчезло». Счёт по сигнатуре от пути не зависит и меряет именно то,
// что интересно: есть ли на этой ширине такой узел и сколько их.
//
// СИГНАТУРА: `tag` + '.' + строка классов, пробелы схлопнуты. Берётся из
// computed-<w>.json как есть.
// СЧИТАЮТСЯ только узлы, ЗАНИМАЮЩИЕ МЕСТО: box.w > 0 && box.h > 0 — тот же
// критерий, что в compare-widths.mjs. Узел в разметке, но с нулевым боксом,
// раскладку не образует и в счёт не идёт.
//
// ДВА КЛАССА РАЗЛИЧИЙ, и смешивать их нельзя:
//
//   ПОДМЕНА (presence flip) — счёт сигнатуры равен НУЛЮ на одной ширине и
//     больше нуля на другой. Узла такого вида на этой ширине в раскладке нет
//     вообще. Это структура: разметка отдаёт другую реализацию.
//   КОЛИЧЕСТВО (magnitude) — счёт больше нуля на обеих, но разный.
//     На листингах с каруселями и ленивой подгрузкой так пляшет контент
//     (`chip+maxw` на `rating`: 14 / 16 / 48 / 12 по ширинам — это клоны слайдов,
//     а не раскладка). Структурным выводом служить не может.
//
// ПРАВИЛО (METHOD §8) — подмена, повторившаяся на 2+ страницах в одну сторону.
// Разовая — наблюдение, идёт в «Ограничения» страницы.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PAGES = path.join(ROOT, 'evidence', 'source', 'production', 'pages');

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const [A, B] = argv.filter((t) => /^\d+$/.test(t)).map(Number);
const MIN_PAGES = Number(arg('min-pages', 2));
const only = arg('only');

const OCCUPIES = (e) => Boolean(e.box) && e.box.w > 0 && e.box.h > 0;
const SIG = (e) => `${e.tag}.${(e.classes ?? '').trim().replace(/\s+/g, ' ')}`;

const counts = (id, w) => {
  const file = path.join(PAGES, id, `computed-${w}.json`);
  if (!fs.existsSync(file)) return null;
  const m = new Map();
  for (const e of JSON.parse(fs.readFileSync(file, 'utf8'))) if (OCCUPIES(e)) m.set(SIG(e), (m.get(SIG(e)) ?? 0) + 1);
  return m;
};

const ids = (only ? [only] : fs.readdirSync(PAGES)).filter((id) => counts(id, A) && counts(id, B));

// sig -> { pages: Map<id, [a, b]>, up: Set<id>, down: Set<id> }
const sigs = new Map();
const perPage = [];

for (const id of ids) {
  const a = counts(id, A); const b = counts(id, B);
  let changed = 0; let deltaAbs = 0;
  for (const sig of new Set([...a.keys(), ...b.keys()])) {
    const na = a.get(sig) ?? 0; const nb = b.get(sig) ?? 0;
    if (na === nb) continue;
    changed += 1; deltaAbs += Math.abs(nb - na);
    if (!sigs.has(sig)) sigs.set(sig, { pages: new Map(), up: new Set(), down: new Set() });
    const s = sigs.get(sig);
    s.pages.set(id, [na, nb]);
    (nb > na ? s.up : s.down).add(id);
  }
  perPage.push({ id, sigsA: a.size, sigsB: b.size, changedSigs: changed, deltaAbs });
}

const pad = (s, n) => String(s).padStart(n);
console.log(`\n${A} -> ${B}   сигнатура: tag+classes   считаются узлы с box.w>0 && box.h>0\n`);
console.log('page                        | sigs A | sigs B | changed sigs | sum |delta| nodes');
for (const r of perPage) console.log(`${r.id.padEnd(27)} |${pad(r.sigsA, 7)} |${pad(r.sigsB, 7)} |${pad(r.changedSigs, 13)} |${pad(r.deltaAbs, 12)}`);

// Подмена: на странице счёт 0 на одной ширине и >0 на другой.
const classify = (pages, dir) => [...pages.entries()].filter(([, [na, nb]]) => (dir === 'gainA2B' ? na === 0 && nb > 0 : nb === 0 && na > 0)).map(([id]) => id);

const flips = [...sigs.entries()]
  .map(([sig, v]) => ({ sig, gained: classify(v.pages, 'gainA2B'), lost: classify(v.pages, 'lostA2B'), pages: v.pages }))
  .filter((x) => Math.max(x.gained.length, x.lost.length) >= MIN_PAGES && Math.min(x.gained.length, x.lost.length) === 0)
  .sort((x, y) => Math.max(y.gained.length, y.lost.length) - Math.max(x.gained.length, x.lost.length));

const magnitude = [...sigs.entries()]
  .map(([sig, v]) => ({ sig, both: [...v.pages.entries()].filter(([, [na, nb]]) => na > 0 && nb > 0) }))
  .filter((x) => x.both.length >= MIN_PAGES)
  .sort((x, y) => y.both.length - x.both.length);

console.log(`\n=== ПОДМЕНА: счёт 0 на одной ширине и >0 на другой, ${MIN_PAGES}+ страниц ===`);
console.log('(структурный признак: узла такого вида на этой ширине в раскладке нет вообще)\n');
if (!flips.length) console.log('  нет\n');
for (const x of flips) {
  const gain = x.gained.length >= x.lost.length;
  console.log(`${pad(gain ? x.gained.length : x.lost.length, 2)} стр · ${gain ? `нет на ${A} -> есть на ${B}` : `есть на ${A} -> нет на ${B}`}`);
  console.log(`     ${x.sig.slice(0, 160)}`);
  console.log(`     ${(gain ? x.gained : x.lost).map((id) => `${id} ${x.pages.get(id)[0]}->${x.pages.get(id)[1]}`).join(' · ')}`);
}

console.log(`\n=== КОЛИЧЕСТВО: счёт >0 на обеих ширинах, но разный, ${MIN_PAGES}+ страниц ===`);
console.log('(НЕ структурный признак: так ведёт себя контент — клоны слайдов каруселей, ленивая подгрузка, реклама)\n');
for (const x of magnitude) {
  console.log(`${pad(x.both.length, 2)} стр | ${x.sig.slice(0, 130)}`);
  console.log(`     ${x.both.map(([id, [na, nb]]) => `${id} ${na}->${nb}`).join(' · ')}`);
}

console.log(`\nвсего сигнатур со сменой счёта: ${sigs.size}; подмен на ${MIN_PAGES}+ страницах: ${flips.length}; количественных: ${magnitude.length}`);

fs.writeFileSync(path.join(HERE, `signatures-${A}-${B}.json`), JSON.stringify({
  a: A, b: B, signature: 'tag+classes', counted: 'box.w>0 && box.h>0', perPage,
  flips: flips.map((x) => ({ sig: x.sig, gained: x.gained, lost: x.lost, pages: Object.fromEntries(x.pages) })),
  magnitude: magnitude.map((x) => ({ sig: x.sig, pages: Object.fromEntries(x.both) })),
}, null, 2), 'utf8');
