// Media-запросы сборки, их активность и пробы раскладки — ХОЛОДНОЙ ЗАГРУЗКОЙ.
//
//   node .pipeline/R0-00/media-queries-cold.mjs
// Результат: evidence/source/production/media-queries-cold.json
//
// ЗАЧЕМ. Первая редакция шага сняла ту же таблицу скриптом media-queries.mjs,
// который открывал страницу один раз на 1440 и дальше гонял setViewportSize
// с паузой 200 мс. §1 того же отчёта объявляет ресайз негодным методом и ради
// ухода от него шаг сделал сорок отдельных запусков capture.mjs — а таблица,
// несущая вывод о границе 767/768, осталась на ресайзе. Ревью, находка 5.
//
// Здесь на каждую ширину открывается ОТДЕЛЬНЫЙ КОНТЕКСТ БРАУЗЕРА и страница
// грузится заново. Ожидание — goto(load) + 1200 мс, столько же, сколько ждёт
// tools/capture.mjs после навигации.
//
// Дополнительно вынимаются САМИ ПРАВИЛА внутри (max-width: 360px) и
// (min-width: 480px): без них нельзя сказать, что эти запросы делают.
// Это закрывает пробел, записанный строкой X-10 роадмапа, в части двух
// запросов, на которых стоит вывод шага.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const URL = 'https://career.habr.com/courses';
const WIDTHS = [320, 360, 361, 375, 479, 480, 481, 744, 767, 768, 1023, 1024, 1440];

const browser = await chromium.launch({ channel: 'msedge' });

const probeFn = () => {
  const found = new Set();
  const walk = (rules) => {
    for (const rule of rules ?? []) {
      if (rule.media?.mediaText) found.add(rule.media.mediaText);
      if (rule.cssRules) { try { walk(rule.cssRules); } catch { /* пусто */ } }
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* cross-origin */ } }
  const queries = [...found];

  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const rubric = document.querySelector('.grid.grid-cols-4.gap-3.pb-4');
  const appContent = document.querySelector('.app-content');
  const container = document.querySelector('.mx-auto.max-w-\\[1124px\\]');

  return {
    innerWidth: window.innerWidth,
    active: queries.filter((q) => matchMedia(q).matches),
    queriesTotal: queries.length,
    rubricCols: rubric ? getComputedStyle(rubric).gridTemplateColumns : null,
    headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
    footerH: footer ? Math.round(footer.getBoundingClientRect().height) : null,
    appContentH: appContent ? Math.round(appContent.getBoundingClientRect().height) : null,
    containerW: container ? Math.round(container.getBoundingClientRect().width) : null,
    docH: Math.round(document.documentElement.scrollHeight),
  };
};

// Правила внутри интересующих нас запросов — снимаются один раз, они от
// вьюпорта не зависят.
const rulesFn = () => {
  const want = [/max-width:\s*360px/, /min-width:\s*480px/, /max-width:\s*479px/];
  const out = {};
  const walk = (rules) => {
    for (const rule of rules ?? []) {
      const mt = rule.media?.mediaText;
      if (mt && want.some((re) => re.test(mt))) {
        (out[mt] ??= []).push(...[...(rule.cssRules ?? [])].map((r) => r.cssText));
      }
      if (rule.cssRules) { try { walk(rule.cssRules); } catch { /* пусто */ } }
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* cross-origin */ } }
  return out;
};

const byWidth = {};
let rules = null;

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  byWidth[width] = await page.evaluate(probeFn);
  if (!rules) rules = await page.evaluate(rulesFn);
  await context.close();
  const p = byWidth[width];
  console.log(`${String(width).padStart(4)} | rubric ${String(p.rubricCols).slice(0, 40).padEnd(40)} | hdr ${String(p.headerH).padStart(3)} | ftr ${String(p.footerH).padStart(3)} | container ${String(p.containerW).padStart(4)} | app ${p.appContentH} | doc ${p.docH}`);
}

await browser.close();

const dest = path.join(ROOT, 'evidence', 'source', 'production', 'media-queries-cold.json');
fs.writeFileSync(dest, JSON.stringify({
  url: URL,
  method: 'холодная загрузка: отдельный контекст браузера на каждую ширину, goto(load) + 1200 мс',
  supersedes: 'media-queries.json — та же таблица, снятая setViewportSize после одной загрузки на 1440 (ревью review-1.md, находка 5)',
  capturedAt: new Date().toISOString(),
  widths: WIDTHS,
  byWidth,
  rulesInsideQueries: rules,
}, null, 2), 'utf8');
console.log(`\nСнято: ${dest}`);
for (const [q, list] of Object.entries(rules ?? {})) console.log(`  ${q}: правил ${list.length}`);
