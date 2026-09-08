// Съёмка фактов с живой страницы лендинга. Ничего не интерпретирует — только снимает.
//
//   node tools/capture.mjs --url https://technotext.habr.com --selector "header" \
//     --out evidence/source/production/site-header --widths 1440,1600
//     [--state hover] [--channel msedge] [--wait 1500] [--shot-timeout 10000]
//     [--full-page]
//
// -------------------------------------------------------------------------
// TODO: набора ширин по умолчанию у этого пакета нет — ключ --widths обязателен
// -------------------------------------------------------------------------
// Список ширин ждёт двух вещей, и до них он не выдумывается:
//
//   Q-4  какая ширина канонична. В 18 макетах пять разных ширин артборда:
//        1600 — 8 узлов, 1440 — 5, 1400 — 3, 1280 — 1, 1240 — 1. Брейкпоинты
//        Webflow из корпуса в Figma не подтверждаются (находка P2-8,
//        ROADMAP «Вопросы владельцу»);
//   R0-00  есть ли вообще мобильные артборды. В заданных 18 узлах их ноль,
//        все 18 — одиночные десктопные (BRIEF §5 п. 4). Проверку соседних
//        узлов страницы 0:1 ведёт шаг R0-00.
//
// Пока оба открыты, дефолтный набор был бы решением, принятым инструментом
// за владельца, и разъехался бы по evidence всех последующих шагов. Поэтому
// вызов без --widths — ошибка вызова (код 2) с этим текстом, а не тихая
// съёмка «как у соседнего пакета». Набор Курсов (320…1440) здесь неверен:
// он построен на границах их прода, а не на ширинах этих артбордов.
//
// ВНИМАНИЕ. Скилл guide-build §2 предписывает запуск с
// --widths 375,768,1024,1440. Для этого пакета такой набор подтверждён
// частично: совпадает одна ширина из четырёх — 1440, вторая по частоте
// среди артбордов (5 узлов из 18). Три остальные — 375, 768, 1024 —
// не встречаются ни у одного артборда, а четыре ширины, на которых
// нарисованы остальные 13 макетов (1600 — 8, 1400 — 3, 1280 — 1,
// 1240 — 1), в наборе отсутствуют. То есть дефолт скилла снимал бы
// 13 макетов из 18 не на их ширине. Пока Q-4 открыт, ширины называет
// тот, кто снимает, и записывает выбор в .pipeline/<id>/capture.md.
//
// На выходе в --out:
//   dom.html         разметка узла с вычищенными фреймворк-атрибутами
//   computed.json    computed styles по каждому узлу поддерева
//   tokens.json      кастомные свойства :root и подключённые шрифты
//   <width>.png      скриншот узла на каждой ширине
//   meta.json        URL, дата, селектор, состояние, снятые ширины
//
// Отчётность инструмента. meta.json перечисляет в поле widths только те
// ширины, для которых PNG действительно оказался на диске; запрошенный
// список лежит рядом в requestedWidths, несостоявшиеся съёмки — в
// failedWidths с причиной. Если снята не каждая ширина, скрипт выходит
// с кодом 1. Молчаливая потеря ширины означала бы, что evidence врёт
// о своей полноте, — а весь пакет стоит на том, что evidence не врёт.
//
// Коды возврата: 0 — снято всё; 1 — узел не найден или снята не каждая
// ширина; 2 — ошибка вызова (нет обязательного ключа, битое значение).
//
// Перенесён из courses/tools/capture.mjs (read-only образец). Отличия:
// нет набора ширин по умолчанию (см. TODO выше) и нет упоминаний
// брейкпоинтов Курсов.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const argv = process.argv.slice(2);
// Ключ, требующий значения. Если значения нет или следующий токен — сам ключ,
// это ошибка вызова, а не «true»: иначе --widths без значения доезжает
// до Playwright и падает стеком `viewport.width: got float NaN`.
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = argv[i + 1];
  if (value === undefined || value.startsWith('--')) {
    console.error(`Ключу --${name} нужно значение. См. шапку файла.`);
    process.exit(2);
  }
  return value;
};
const flag = (name) => argv.includes(`--${name}`);

const number = (name, raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    console.error(`Ключ --${name}: ожидалось положительное число, получено «${raw}».`);
    process.exit(2);
  }
  return value;
};

const url = arg('url');
const selector = arg('selector', 'body');
const out = arg('out');

const widthsRaw = arg('widths');
if (!widthsRaw) {
  console.error('Ключ --widths обязателен: набора ширин по умолчанию у этого пакета нет.');
  console.error('');
  console.error('  Q-4  какая ширина канонична — не отвечен. В 18 макетах пять ширин:');
  console.error('       1600 — 8 узлов, 1440 — 5, 1400 — 3, 1280 — 1, 1240 — 1.');
  console.error('  R0-00 есть ли мобильные артборды — проверяется. В заданных 18 их ноль.');
  console.error('');
  console.error('Назовите ширины явно и запишите выбор в .pipeline/<id>/capture.md.');
  process.exit(2);
}
const widths = [...new Set(
  widthsRaw.split(',').map((raw) => {
    const width = number('widths', raw.trim());
    if (!Number.isInteger(width)) {
      console.error(`Ключ --widths: ширина должна быть целой, получено «${raw.trim()}».`);
      process.exit(2);
    }
    return width;
  }),
)].sort((a, b) => a - b);

const state = arg('state');
const channel = arg('channel');
const wait = number('wait', arg('wait', 1200));
const shotTimeout = number('shot-timeout', arg('shot-timeout', 10000));

if (!url || !out) {
  console.error('Нужны --url и --out. См. шапку файла.');
  process.exit(2);
}

const PROPS = [
  'display', 'position', 'inset', 'box-sizing', 'width', 'height', 'min-height', 'max-width',
  'margin', 'padding', 'gap', 'row-gap', 'column-gap',
  'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'flex', 'order',
  'grid-template-columns', 'grid-template-rows', 'grid-auto-flow', 'grid-column', 'grid-row',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform',
  'text-align', 'text-decoration-line', 'white-space', 'overflow', 'overflow-wrap',
  'color', 'background-color', 'background-image', 'opacity',
  'border', 'border-radius', 'border-color', 'border-width', 'border-style',
  // Тени у лендингов несущие: drop-теней в источниках нет, а inset-подсветки
  // есть — shadow-[inset_0px_0px_57.7px_43px_#d04509,…] в 20216:120.
  // Без box-shadow в снимке это различие не проверить.
  'box-shadow', 'outline', 'outline-offset', 'transition', 'transform', 'cursor', 'z-index',
];

const cleanAttrs = /^(data-v-[0-9a-f]+|data-testid|data-reactroot|data-w-id|nonce)$/;

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch(channel ? { channel } : {}).catch(async (error) => {
  if (channel) throw error;
  return chromium.launch({ channel: 'msedge' });
});
const context = await browser.newContext({ viewport: { width: widths.at(-1), height: 1000 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
await page.waitForTimeout(wait);
// Ненайденный селектор — рядовой исход съёмки, а не отказ инструмента:
// на живом лендинге узел переезжает или переименовывается. Без перехвата
// первым падал waitForSelector стеком Playwright, браузер оставался
// незакрытым, а внятная ветка ниже была недостижима.
try {
  await page.waitForSelector(selector, { timeout: 15000 });
} catch {
  console.error(`Узел ${selector} не найден на ${url} за 15 с.`);
  console.error('Проверьте селектор и --wait: страница могла ещё не отрисовать узел.');
  await browser.close();
  process.exit(1);
}

const target = page.locator(selector).first();
if (state === 'hover') await target.hover();
if (state === 'focus-visible') await target.focus();

const snapshot = await page.evaluate(({ selector, PROPS, cleanAttrsSource }) => {
  const cleanAttrs = new RegExp(cleanAttrsSource);
  const root = document.querySelector(selector);
  if (!root) return null;

  const computed = [];
  const walk = (node, pathParts) => {
    if (node.nodeType !== 1) return;
    const style = getComputedStyle(node);
    const entry = { path: pathParts.join(' > '), tag: node.tagName.toLowerCase(), classes: node.className?.toString?.() ?? '', styles: {} };
    for (const prop of PROPS) {
      const value = style.getPropertyValue(prop);
      if (value && value !== 'normal' && value !== 'none' && value !== 'auto' && value !== '0px') entry.styles[prop] = value;
    }
    const box = node.getBoundingClientRect();
    entry.box = { w: Math.round(box.width * 100) / 100, h: Math.round(box.height * 100) / 100 };
    computed.push(entry);
    [...node.children].forEach((child, index) => walk(child, [...pathParts, `${child.tagName.toLowerCase()}[${index}]`]));
  };
  walk(root, [root.tagName.toLowerCase()]);

  const clone = root.cloneNode(true);
  const strip = (node) => {
    if (node.nodeType === 1) {
      for (const attr of [...node.attributes]) if (cleanAttrs.test(attr.name)) node.removeAttribute(attr.name);
      [...node.children].forEach(strip);
    }
  };
  strip(clone);

  const rootStyle = getComputedStyle(document.documentElement);
  const custom = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules ?? []) {
      if (rule.style && /^:root\b|^html\b/.test(rule.selectorText ?? '')) {
        for (const name of rule.style) if (name.startsWith('--')) custom[name] = rootStyle.getPropertyValue(name).trim();
      }
    }
  }

  return {
    html: clone.outerHTML,
    computed,
    tokens: custom,
    fonts: [...new Set([...document.fonts].map((font) => `${font.family} ${font.weight} ${font.style}`))],
    title: document.title,
  };
}, { selector, PROPS, cleanAttrsSource: cleanAttrs.source });

if (!snapshot) {
  console.error(`Узел ${selector} не найден на ${url}`);
  await browser.close();
  process.exit(1);
}

// Все текстовые артефакты пишутся с LF. Разметка страницы может приехать
// с CRLF, и тогда файл на диске и файл в индексе git расходятся: снимок,
// который меняется при индексации, перестаёт быть байт-в-байт протоколом.
const lf = (text) => text.replace(/\r\n/g, '\n');
const writeText = (name, text) => fs.writeFileSync(path.join(out, name), lf(text), 'utf8');

writeText('dom.html', snapshot.html);
writeText('computed.json', JSON.stringify(snapshot.computed, null, 2));
writeText('tokens.json', JSON.stringify({ custom: snapshot.tokens, fonts: snapshot.fonts }, null, 2));

// Снятые ширины считаются по факту: попытка съёмки, затем проверка файла
// на диске. В meta.json уезжает этот список, а не запрошенный.
const captured = [];
const failed = [];

for (const width of widths) {
  const file = path.join(out, `${width}.png`);
  process.stdout.write(`  ${width}px … `);
  try {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(300);
    const shot = flag('full-page') ? page : page.locator(selector).first();
    await shot.screenshot({
      path: file,
      timeout: shotTimeout,
      ...(flag('full-page') ? { fullPage: true } : {}),
    });
    // Успешный вызов — ещё не файл на диске. Проверяем то, на что сошлётся пакет.
    const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
    if (size === 0) throw new Error('скриншот вернулся без ошибки, но файла на диске нет');
    captured.push(width);
    console.log(size >= 1024 ? `${Math.round(size / 1024)} КБ` : `${size} Б`);
  } catch (error) {
    const reason = String(error.message ?? error).split('\n')[0].trim();
    failed.push({ width, reason });
    console.log('не снято');
    console.error(`    ${width}px не снято: ${reason}`);
  }
}

writeText('meta.json', JSON.stringify({
  url,
  selector,
  state: state ?? 'default',
  // widths — фактически снятые ширины, проверенные по диску.
  // requestedWidths — что просили; расхождение видно по failedWidths.
  widths: captured,
  requestedWidths: widths,
  failedWidths: failed,
  // dom.html, computed.json и tokens.json сняты на самой широкой из --widths:
  // контекст открывается один раз, скриншоты делаются после на каждой ширине.
  computedAtWidth: widths.at(-1),
  title: snapshot.title,
  capturedAt: new Date().toISOString(),
}, null, 2));

await browser.close();
console.log(`Снято: ${out} (узлов ${snapshot.computed.length}, токенов ${Object.keys(snapshot.tokens).length}, ширин ${captured.length} из ${widths.length}: ${captured.join(' · ') || '—'})`);

if (failed.length) {
  console.error(`\nНе снято ширин: ${failed.length} из ${widths.length} — ${failed.map((f) => f.width).join(', ')}.`);
  console.error('meta.json перечисляет только снятые; evidence неполон, и это не пропускается молча.');
  process.exit(1);
}
