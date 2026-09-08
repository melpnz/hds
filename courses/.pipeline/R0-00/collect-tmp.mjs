// Добирает из .pipeline/R0-00/tmp то, что съёмка уже сделала, но раскладка
// первого прохода не копировала: dom/tokens для 375 и 768 и png свежей загрузки.
// Существующие файлы не трогает.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const TMP = path.join(HERE, 'tmp');
const PAGES = path.join(ROOT, 'evidence', 'source', 'production', 'pages');

const report = [];
for (const dir of fs.readdirSync(TMP)) {
  const m = dir.match(/^(.+)-(\d+)$/);
  if (!m) continue;
  const [, id, w] = m;
  const src = path.join(TMP, dir);
  const dest = path.join(PAGES, id);
  if (!fs.existsSync(dest)) continue;

  // Для 320 и 744 всё уже разложено первым проходом.
  const map = (w === '375' || w === '768')
    ? [['dom.html', `dom-${w}.html`], ['tokens.json', `tokens-${w}.json`], [`${w}.png`, `${w}-reload.png`]]
    : [];
  for (const [from, to] of map) {
    const a = path.join(src, from), b = path.join(dest, to);
    if (!fs.existsSync(a)) { report.push(`${id} ${to}: нет в tmp`); continue; }
    if (fs.existsSync(b)) { report.push(`${id} ${to}: уже есть, пропуск`); continue; }
    fs.copyFileSync(a, b);
    report.push(`${id} ${to}: скопирован`);
  }
}
console.log(report.join('\n'));
console.log(`\nвсего записей ${report.length}, скопировано ${report.filter((r) => r.endsWith('скопирован')).length}`);
