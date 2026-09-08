// Полный диф computed-свойств по сопоставленным узлам двух ширин.
//
//   node .pipeline/R0-00/props-diff.mjs 375 744 [--only <id>] [--top 20]
//
// ЗАЧЕМ. Первая редакция шага написала «между ними меняется только ширина
// колонки контента», измерив три свойства из сорока восьми, которые снимает
// capture.mjs. Слово «только» требует посмотреть на все. Ревью, находка 8.
//
// Ключ сопоставления — path+classes, как в compare-widths.mjs. Считаются
// только пары; непарные узлы к свойствам отношения не имеют и учтены отдельно.
// Свойство считается изменившимся, если строка значения различается —
// включая появление и исчезновение самого свойства (capture.mjs не пишет
// значения normal / none / auto / 0px, поэтому «нет ключа» значимо).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAGES = path.resolve(HERE, '..', '..', 'evidence', 'source', 'production', 'pages');

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const [A, B] = argv.filter((t) => /^\d+$/.test(t)).map(Number);
const TOP = Number(arg('top', 20));
const only = arg('only');

const KEY = (e) => `${e.path} ${e.classes ?? ''}`;
const load = (id, w) => {
  const f = path.join(PAGES, id, `computed-${w}.json`);
  if (!fs.existsSync(f)) return null;
  return new Map(JSON.parse(fs.readFileSync(f, 'utf8')).map((e) => [KEY(e), e]));
};

const ids = (only ? [only] : fs.readdirSync(PAGES)).filter((id) => load(id, A) && load(id, B));
const props = new Map(); // prop -> { nodes, pages:Set }
let matched = 0;
let nodesWithAnyChange = 0;

for (const id of ids) {
  const a = load(id, A); const b = load(id, B);
  for (const [key, ea] of a) {
    const eb = b.get(key);
    if (!eb) continue;
    matched += 1;
    let any = false;
    const names = new Set([...Object.keys(ea.styles ?? {}), ...Object.keys(eb.styles ?? {})]);
    for (const p of names) {
      if ((ea.styles?.[p] ?? '') === (eb.styles?.[p] ?? '')) continue;
      any = true;
      if (!props.has(p)) props.set(p, { nodes: 0, pages: new Set() });
      const s = props.get(p); s.nodes += 1; s.pages.add(id);
    }
    if (any) nodesWithAnyChange += 1;
  }
}

console.log(`\n${A} -> ${B}: сопоставлено ${matched} узлов на ${ids.length} страницах.`);
console.log(`Хотя бы одно computed-свойство изменилось у ${nodesWithAnyChange} из них (${(100 * nodesWithAnyChange / matched).toFixed(1)} %).\n`);
console.log('свойство                  | узлов | страниц');
for (const [p, s] of [...props.entries()].sort((x, y) => y[1].nodes - x[1].nodes).slice(0, TOP)) {
  console.log(`${p.padEnd(25)} |${String(s.nodes).padStart(6)} |${String(s.pages.size).padStart(8)}`);
}
console.log(`\nвсего свойств со сменой значения: ${props.size}`);
