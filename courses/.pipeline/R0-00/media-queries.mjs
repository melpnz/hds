// Снимает с продакшена media-запросы подключённых таблиц стилей и проверяет,
// какие из них активны на каждой из шести ширин пакета. Нужен, чтобы граница
// «мобильная / планшетная раскладка» была фактом, а не выводом из скриншотов.
//
//   node .pipeline/R0-00/media-queries.mjs
// Результат: evidence/source/production/media-queries.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const URL = 'https://career.habr.com/courses';
const WIDTHS = [320, 375, 480, 744, 767, 768, 1023, 1024, 1440];

const browser = await chromium.launch({ channel: 'msedge' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
await page.goto(URL, { waitUntil: 'networkidle' }).catch(() => page.goto(URL));
await page.waitForTimeout(1200);

const queries = await page.evaluate(() => {
  const found = new Set();
  const walk = (rules) => {
    for (const rule of rules ?? []) {
      if (rule.media?.mediaText) found.add(rule.media.mediaText);
      if (rule.cssRules) { try { walk(rule.cssRules); } catch { /* пусто */ } }
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* cross-origin */ }
  }
  return [...found];
});

// Активность каждого запроса на каждой ширине — через matchMedia в реальном вьюпорте.
const active = {};
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 1000 });
  await page.waitForTimeout(200);
  active[width] = await page.evaluate((qs) => qs.filter((q) => matchMedia(q).matches), queries);
}

// Пробы утилит Tailwind: на какой ширине включаются phone: / tablet: / tablet-only:
const probes = {};
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 1000 });
  await page.waitForTimeout(200);
  probes[width] = await page.evaluate(() => {
    const pick = (sel, prop) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).getPropertyValue(prop) : null;
    };
    return {
      // .phone:grid-cols-1 на сетке рубрик: 3 колонки → 1, когда phone: активен
      rubricGrid: pick('.grid.grid-cols-4.gap-3.pb-4', 'grid-template-columns'),
      // .phone:hidden на десктопной обложке карточки
      headerHeight: (() => { const h = document.querySelector('header'); return h ? Math.round(h.getBoundingClientRect().height) : null; })(),
      footerHeight: (() => { const f = document.querySelector('footer'); return f ? Math.round(f.getBoundingClientRect().height) : null; })(),
    };
  });
}

const out = { url: URL, capturedAt: new Date().toISOString(), widths: WIDTHS, queries, active, probes };
const dest = path.join(ROOT, 'evidence', 'source', 'production', 'media-queries.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2), 'utf8');
await browser.close();
console.log(`Снято: ${dest} (запросов ${queries.length})`);
