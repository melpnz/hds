// Ищет ширину, на которой подменяется реализация выпадающего списка фильтра
// (base-modal → v-popper--theme-dropdown) и исчезает аффорданс «показать целиком».
//
//   node .pipeline/R0-00/sweep-boundary.mjs [--only <id>] [--widths 375,479,480,744]
//
// Каждая ширина снимается ХОЛОДНОЙ ЗАГРУЗКОЙ в отдельном контексте браузера:
// ресайз после загрузки на другой ширине даёт другую раскладку у Vue-приложения,
// и именно этого метода шаг избегает.
//
// Условие загрузки: goto(waitUntil:'load') + 1200 мс — то же ожидание, что
// в tools/capture.mjs, но без ожидания networkidle, которое на этом сайте
// не наступает никогда (реклама держит соединения) и стоит 30 с таймаута.
// На счётчики маркеров это не влияет: они проверены на совпадение с
// capture.mjs-снимками на 375 и 744, см. §3.5 отчёта.
//
// Результат: .pipeline/R0-00/sweep-boundary.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const TARGETS = [
  ['courses-listing', 'https://career.habr.com/courses'],
  ['education-centers-listing', 'https://career.habr.com/education_centers'],
  ['education-center', 'https://career.habr.com/education_centers/35-yandeks-praktikum'],
  ['reviews', 'https://career.habr.com/education_centers/otzyvy'],
  ['promocodes', 'https://career.habr.com/education/promocodes'],
  ['schools-for-children', 'https://career.habr.com/education_centers/shkoly-dlya-detej'],
  ['rating', 'https://career.habr.com/education_centers/rating'],
];

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const only = arg('only');
const widths = String(arg('widths', '375,479,480,744')).split(',').map(Number);
const list = only ? TARGETS.filter(([id]) => id === only) : TARGETS;

const probe = () => {
  const q = (sel) => document.querySelectorAll(sel).length;
  // Классы Tailwind с квадратными скобками не экранируются в селекторе надёжно,
  // поэтому считаем по строке class — тем же признаком, каким считает grep по dom-*.html.
  const all = [...document.querySelectorAll('body *')];
  const byClass = (...parts) => all.filter((el) => {
    const c = el.getAttribute('class') ?? '';
    return parts.every((part) => c.split(/\s+/).includes(part));
  }).length;
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const rubric = document.querySelector('.grid.grid-cols-4.gap-3.pb-4');
  return {
    // Маркеры двух реализаций выпадающего списка фильтра
    baseModal: byClass('base-modal'),
    popperDropdown: byClass('v-popper--theme-dropdown'),
    // Аффорданс «показать целиком»: градиентная маска над обрезанным текстом
    gradient: byClass('absolute', 'bottom-[20px]'),
    // Панель фильтров: два поддерева, мобильное и планшетное
    filterPanelPhone: byClass('hidden', 'grid-cols-1', 'gap-[1px]'),
    filterPanelTablet: byClass('grid-cols-3', 'gap-[1px]'),
    // Оболочка
    headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
    footerH: footer ? Math.round(footer.getBoundingClientRect().height) : null,
    rubricCols: rubric ? getComputedStyle(rubric).gridTemplateColumns : null,
    // Активность media-запросов, попадающих в интервал
    mq: {
      max360: matchMedia('only screen and (max-width: 360px)').matches,
      max479: matchMedia('(max-width: 479px)').matches,
      min480: matchMedia('(min-width: 480px)').matches,
      max767: matchMedia('(max-width: 767px)').matches,
      min768: matchMedia('(min-width: 768px)').matches,
    },
    innerWidth: window.innerWidth,
    nodes: document.querySelectorAll('body *').length,
  };
};

const browser = await chromium.launch({ channel: 'msedge' });
const rows = [];

for (const [id, url] of list) {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    const started = Date.now();
    let error = null;
    let data = null;
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(1200);
      data = await page.evaluate(probe);
    } catch (e) {
      error = String(e.message ?? e).split('\n')[0].trim();
    }
    await context.close();
    const secs = Math.round((Date.now() - started) / 1000);
    rows.push({ id, width, secs, error, ...(data ?? {}) });
    console.log(error
      ? `FAIL ${id} @${width} (${secs}s): ${error}`
      : `OK   ${id} @${width} (${secs}s) modal=${data.baseModal} popper=${data.popperDropdown} grad=${data.gradient} panelPhone=${data.filterPanelPhone} panelTablet=${data.filterPanelTablet} hdr=${data.headerH} ftr=${data.footerH}`);
  }
}

await browser.close();
const out = path.join(HERE, 'sweep-boundary.json');
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')).rows ?? [] : [];
const merged = [...prev.filter((p) => !rows.some((r) => r.id === p.id && r.width === p.width)), ...rows]
  .sort((a, b) => a.id.localeCompare(b.id) || a.width - b.width);
fs.writeFileSync(out, JSON.stringify({
  method: 'холодная загрузка, отдельный контекст на каждую ширину, goto(load)+1200мс',
  capturedAt: new Date().toISOString(),
  rows: merged,
}, null, 2), 'utf8');
console.log(`\nГотово: ${rows.filter((r) => !r.error).length}/${rows.length} → ${out}`);
