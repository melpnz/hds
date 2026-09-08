// Досъёмка десяти страниц на 479 и 480 — по находке 4 ревью review-1.md.
//
//   node .pipeline/R0-00/run-capture-480.mjs [--only <id>] [--widths 479,480]
//
// ЗАЧЕМ. Первая редакция шага объявила, что `(min-width: 480px)` раскладку
// не меняет, не сняв ни одной страницы между 375 и 744. Обзорный прогон
// sweep-boundary.mjs показал, что ровно на этой границе подменяется реализация
// выпадающего списка фильтра. Здесь снимается полное evidence на обеих
// сторонах границы, чтобы вывод держался на тех же файлах, что и остальные
// ширины пакета, а не на одном счётчике.
//
// Инструмент — tools/capture.mjs в его нынешнем, починенном на R0-01 виде
// (meta.json пишет фактически снятые ширины и падает с кодом 1, если ширина
// не снялась). Побайтовая копия кладётся рядом как capture-480.mjs, sha1
// печатается в конце прогона: съёмка воспроизводима той же версией.
//
// Как и на основном прогоне — ОТДЕЛЬНЫЙ ПРОЦЕСС НА КАЖДУЮ ПАРУ «страница ×
// ширина», одна ширина в --widths. capture.mjs открывает контекст на
// widths.at(-1) и снимает dom/computed/tokens до цикла скриншотов; при одной
// ширине разметка, computed и PNG описывают один и тот же вьюпорт.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PAGES = path.join(ROOT, 'evidence', 'source', 'production', 'pages');
const TMP = path.join(HERE, 'tmp-480');

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

// Пин инструмента: копия tools/capture.mjs на момент прогона.
const TOOL_SRC = path.join(ROOT, 'tools', 'capture.mjs');
const TOOL = path.join(HERE, 'capture-480.mjs');
fs.copyFileSync(TOOL_SRC, TOOL);
const sha1 = crypto.createHash('sha1').update(fs.readFileSync(TOOL)).digest('hex');

const widths = String(arg('widths', '479,480')).split(',').map(Number);
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
      TOOL, '--url', url, '--selector', 'body', '--out', out,
      '--widths', String(width), '--full-page', '--channel', 'msedge',
    ], { cwd: ROOT, encoding: 'utf8', timeout: 240000 });

    const secs = Math.round((Date.now() - started) / 1000);
    if (res.status !== 0) {
      log.push({ id, width, ok: false, secs, error: (res.stderr || res.error?.message || 'unknown').trim().slice(0, 500) });
      console.log(`FAIL ${id} @${width} (${secs}s): ${(res.stderr || res.error?.message || '').trim().slice(0, 200)}`);
      continue;
    }

    const dest = path.join(PAGES, id);
    fs.mkdirSync(dest, { recursive: true });
    const copies = [
      ['dom.html', `dom-${width}.html`], ['computed.json', `computed-${width}.json`],
      ['tokens.json', `tokens-${width}.json`], ['meta.json', `meta-${width}.json`],
      [`${width}.png`, `${width}.png`],
    ];
    const written = [];
    for (const [from, to] of copies) {
      const src = path.join(out, from);
      const dst = path.join(dest, to);
      if (!fs.existsSync(src)) { written.push(`${to}:MISSING`); continue; }
      // Существующий файл не перезаписывается никогда: снимки 7 и 8 сентября
      // остаются нетронутыми, расхождение видно в журнале.
      if (fs.existsSync(dst)) { written.push(`${to}:EXISTS-SKIPPED`); continue; }
      fs.copyFileSync(src, dst);
      written.push(to);
    }
    const meta = JSON.parse(fs.readFileSync(path.join(out, 'meta.json'), 'utf8'));
    const nodes = JSON.parse(fs.readFileSync(path.join(out, 'computed.json'), 'utf8')).length;
    log.push({ id, width, ok: true, secs, nodes, metaWidths: meta.widths, failedWidths: meta.failedWidths, written });
    console.log(`OK   ${id} @${width} (${secs}s) узлов ${nodes}, meta.widths=[${meta.widths}] -> ${written.join(', ')}`);
  }
}

fs.writeFileSync(path.join(HERE, 'run-log-480.json'), JSON.stringify({ tool: 'tools/capture.mjs', sha1, widths, log }, null, 2), 'utf8');
console.log(`\nГотово: ${log.filter((e) => e.ok).length}/${log.length}. Инструмент sha1 ${sha1}`);
