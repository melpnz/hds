// Узлы шире вьюпорта — по computed-<w>.json на всех снятых ширинах.
//
//   node .pipeline/R0-00/overflow.mjs [320,375,479,480,744,768]
//
// ЗАЧЕМ. Ревью, замечание 10: на 320 / 375 / 744 часть узлов выходит за
// вьюпорт, а на 768 таких нет ни на одной странице. Для responsive-правил
// пакета это информативнее числа колонок грида, а шаг признак не рассматривал.
//
// КРИТЕРИЙ: box.w > ширина вьюпорта. Ширина вьюпорта берётся из имени файла,
// то есть из ширины, на которой снимался computed. Полосу прокрутки не
// вычитаем: Playwright снимает без видимой полосы, window.innerWidth равен
// ширине вьюпорта — проверено в sweep-boundary.json полем innerWidth.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAGES = path.resolve(HERE, '..', '..', 'evidence', 'source', 'production', 'pages');
const WIDTHS = (process.argv[2] ?? '320,375,479,480,744,768').split(',').map(Number);

const ids = fs.readdirSync(PAGES).filter((id) => fs.statSync(path.join(PAGES, id)).isDirectory());
const pad = (s, n) => String(s).padStart(n);

console.log(`\nУзлов с box.w > ширины вьюпорта\n`);
console.log(`page                        |${WIDTHS.map((w) => pad(w, 6)).join(' |')} | самый широкий узел`);
const widest = new Map();
for (const id of ids) {
  const cells = []; let note = '';
  for (const w of WIDTHS) {
    const f = path.join(PAGES, id, `computed-${w}.json`);
    if (!fs.existsSync(f)) { cells.push(pad('—', 6)); continue; }
    const list = JSON.parse(fs.readFileSync(f, 'utf8'));
    const over = list.filter((e) => e.box && e.box.w > w);
    cells.push(pad(over.length, 6));
    if (over.length) {
      const top = over.sort((a, b) => b.box.w - a.box.w)[0];
      if (!note) note = `${Math.round(top.box.w)}px ${top.tag}.${(top.classes || '').slice(0, 50)}`;
      widest.set(`${top.tag}.${(top.classes || '').trim().replace(/\s+/g, ' ').slice(0, 70)}`, (widest.get(`${top.tag}.${(top.classes || '').trim().replace(/\s+/g, ' ').slice(0, 70)}`) ?? 0) + 1);
    }
  }
  console.log(`${id.padEnd(27)} |${cells.join(' |')} | ${note}`);
}
console.log('\nСамые широкие узлы, встретившиеся не на одной странице/ширине:');
for (const [sig, n] of [...widest.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${pad(n, 3)} | ${sig}`);
