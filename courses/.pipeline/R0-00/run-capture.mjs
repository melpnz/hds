// Гоняет .pipeline/R0-00/capture.mjs (побайтовая копия tools/capture.mjs на момент шага)
// по 10 страницам на четырёх ширинах и раскладывает результат в evidence
// с суффиксом ширины, не трогая уже снятые файлы.
//
//   node .pipeline/R0-00/run-capture.mjs [--only <id>] [--widths 320,744]

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PAGES = path.join(ROOT, 'evidence', 'source', 'production', 'pages');
const TMP = path.join(HERE, 'tmp');

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };

const TARGETS = [
  ['courses-listing', 'https://career.habr.com/courses'],
  ['education-centers-listing', 'https://career.habr.com/education_centers'],
  ['education-center', 'https://career.habr.com/education_centers/35-yandeks-praktikum'],
  ['reviews', 'https://career.habr.com/education_centers/otzyvy'],
  ['promocodes', 'https://career.habr.com/education/promocodes'],
  ['schools-for-children', 'https://career.habr.com/education_centers/shkoly-dlya-detej'],
  ['rating', 'https://career.habr.com/education_centers/rating'],
  ['authors', 'https://career.habr.com/courses/authors'],
  ['editors', 'https://career.habr.com/courses/editors'],
  ['author', 'https://career.habr.com/courses/authors/23-stepan-voevodin'],
];

// 320 и 744 — канонические ширины пакета, снимаются полным набором.
// 375 и 768 — базовые ширины реализации; снимаются заново computed+meta,
// потому что png от 7 сентября сделаны ресайзом окна после загрузки на 1440,
// и сравнивать раскладку с ними некорректно.
const FULL = new Set([320, 744]);

const widths = String(arg('widths', '320,375,744,768')).split(',').map(Number);
const only = arg('only');
const list = only ? TARGETS.filter(([id]) => id === only) : TARGETS;

fs.mkdirSync(TMP, { recursive: true });
const log = [];

for (const [id, url] of list) {
  for (const width of widths) {
    const out = path.join(TMP, `${id}-${width}`);
    fs.rmSync(out, { recursive: true, force: true });
    const started = Date.now();
    const res = spawnSync(process.execPath, [
      path.join(HERE, 'capture.mjs'),
      '--url', url,
      '--selector', 'body',
      '--out', out,
      '--widths', String(width),
      '--full-page',
      '--channel', 'msedge',
    ], { cwd: ROOT, encoding: 'utf8', timeout: 180000 });

    const ok = res.status === 0;
    const secs = Math.round((Date.now() - started) / 1000);
    if (!ok) {
      log.push({ id, width, ok: false, secs, error: (res.stderr || res.error?.message || 'unknown').trim().slice(0, 400) });
      console.log(`FAIL ${id} @${width} (${secs}s): ${(res.stderr || res.error?.message || '').trim().slice(0, 200)}`);
      continue;
    }

    const dest = path.join(PAGES, id);
    fs.mkdirSync(dest, { recursive: true });
    const copies = FULL.has(width)
      ? [['dom.html', `dom-${width}.html`], ['computed.json', `computed-${width}.json`],
         ['tokens.json', `tokens-${width}.json`], ['meta.json', `meta-${width}.json`],
         [`${width}.png`, `${width}.png`]]
      : [['computed.json', `computed-${width}.json`], ['meta.json', `meta-${width}.json`]];

    const written = [];
    for (const [from, to] of copies) {
      const src = path.join(out, from);
      const dst = path.join(dest, to);
      if (!fs.existsSync(src)) { written.push(`${to}:MISSING`); continue; }
      if (fs.existsSync(dst)) { written.push(`${to}:EXISTS-SKIPPED`); continue; }
      fs.copyFileSync(src, dst);
      written.push(to);
    }
    const nodes = JSON.parse(fs.readFileSync(path.join(out, 'computed.json'), 'utf8')).length;
    const tokens = Object.keys(JSON.parse(fs.readFileSync(path.join(out, 'tokens.json'), 'utf8')).custom).length;
    log.push({ id, width, ok: true, secs, nodes, tokens, written });
    console.log(`OK   ${id} @${width} (${secs}s) узлов ${nodes}, токенов ${tokens} -> ${written.join(', ')}`);
  }
}

fs.writeFileSync(path.join(HERE, 'run-log.json'), JSON.stringify(log, null, 2), 'utf8');
console.log(`\nГотово: ${log.filter((e) => e.ok).length}/${log.length}`);
