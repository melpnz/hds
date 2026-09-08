// Что именно появляется и исчезает между двумя ширинами — по классам узлов.
//
//   node .pipeline/R0-00/diff-signatures.mjs 375 744 [--top 25]
//
// ЗАЧЕМ. Голое число «появилось N узлов» ничего не доказывает: на листингах
// с рекламой и ленивой подгрузкой набор узлов пляшет и между двумя съёмками
// одной ширины. Нужен признак, отделяющий подмену раскладки от шума контента:
//
//   структурная подмена повторяется на РАЗНЫХ страницах с одной и той же
//   сигнатурой классов; шум контента — нет.
//
// Скрипт группирует непарные и переключившиеся узлы по строке классов и
// печатает сигнатуры, встретившиеся более чем на одной странице. Порог «2+
// страницы» — тот же, что METHOD §8 требует от правила.
//
// Ключ и критерий «занимает место» — те же, что в compare-widths.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PAGES = path.join(ROOT, 'evidence', 'source', 'production', 'pages');

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const [A, B] = argv.filter((t) => /^\d+$/.test(t)).map(Number);
const TOP = Number(arg('top', 25));

const KEY = (e) => `${e.path} ${e.classes ?? ''}`;
const OCCUPIES = (e) => Boolean(e.box) && e.box.w > 0 && e.box.h > 0;
const SIG = (e) => `${e.tag}.${(e.classes ?? '').trim().replace(/\s+/g, ' ')}`;

const load = (id, w) => {
  const file = path.join(PAGES, id, `computed-${w}.json`);
  if (!fs.existsSync(file)) return null;
  const map = new Map();
  for (const e of JSON.parse(fs.readFileSync(file, 'utf8'))) map.set(KEY(e), e);
  return map;
};

const ids = fs.readdirSync(PAGES).filter((id) => load(id, A) && load(id, B));
const sigs = new Map(); // sig -> { appeared:{pages:Set,n}, disappeared:{...}, toggled:{...} }

const bump = (sig, kind, id) => {
  if (!sigs.has(sig)) sigs.set(sig, { appeared: { pages: new Set(), n: 0 }, disappeared: { pages: new Set(), n: 0 }, toggled: { pages: new Set(), n: 0 } });
  const s = sigs.get(sig)[kind];
  s.pages.add(id); s.n += 1;
};

for (const id of ids) {
  const a = load(id, A); const b = load(id, B);
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const ea = a.get(key); const eb = b.get(key);
    if (ea && eb) { if (OCCUPIES(ea) !== OCCUPIES(eb)) bump(SIG(ea), 'toggled', id); } else if (ea) { if (OCCUPIES(ea)) bump(SIG(ea), 'disappeared', id); } else if (OCCUPIES(eb)) bump(SIG(eb), 'appeared', id);
  }
}

const report = (kind, title) => {
  const list = [...sigs.entries()]
    .filter(([, v]) => v[kind].pages.size >= 2)
    .sort((x, y) => y[1][kind].pages.size - x[1][kind].pages.size || y[1][kind].n - x[1][kind].n)
    .slice(0, TOP);
  console.log(`\n=== ${title} (сигнатуры на 2+ страницах) ===`);
  if (!list.length) { console.log('  нет'); return; }
  for (const [sig, v] of list) {
    console.log(`  ${String(v[kind].pages.size).padStart(2)} стр · ${String(v[kind].n).padStart(4)} узлов | ${sig.slice(0, 150)}`);
  }
};

console.log(`\n${A} -> ${B}, страниц ${ids.length}`);
report('appeared', `ЕСТЬ на ${B}, НЕТ на ${A}`);
report('disappeared', `ЕСТЬ на ${A}, НЕТ на ${B}`);
report('toggled', 'ЕСТЬ на обеих, занимает место ровно на одной');
