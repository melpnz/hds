// Съёмка фактов с живой страницы Курсов. Ничего не интерпретирует — только снимает.
//
//   node tools/capture.mjs --url https://career.habr.com/courses --selector ".course-card" \
//     --out evidence/source/production/course-card [--widths 320,375,744,768,1024,1440]
//     [--state hover] [--channel msedge] [--wait 1500] [--shot-timeout 10000]
//     [--full-page]
//
// Ширины по умолчанию — полный набор пакета: 320 · 375 · 744 · 768 · 1024 · 1440.
// Первая, третья и пятая — канонические брейкпоинты пакета (схема Figma
// 320 / 744 / 1024, ROADMAP «Решения пользователя» п. 2); 375, 768 и 1440
// показывают поведение реализации, которая построена на 480 / 768 / 1024.
// Снимать меньше — значит остаться без одной из двух схем.
//
// ВНИМАНИЕ. Скилл `guide-build` §2 предписывает шагам R2–R5 запуск с
// `--widths 375,768,1024,1440`. Этот набор для Курсов неверен: из трёх
// канонических ширин в нём есть только 1024. Запускайте без `--widths` —
// дефолт покрывает обе схемы. Конфликт записан строкой X-04 в ROADMAP.
//
// На выходе в --out:
//   dom.html         разметка узла, снятая с очищенными фреймворк-атрибутами
//   computed.json    computed styles по каждому узлу поддерева
//   tokens.json      кастомные свойства :root и подключённые шрифты
//   <width>.png      скриншот узла на каждой ширине
//   meta.json        URL, дата, селектор, состояние
//
// Отчётность инструмента. `meta.json` перечисляет в поле `widths` только те
// ширины, для которых PNG действительно оказался на диске; запрошенный список
// лежит рядом в `requestedWidths`, а несостоявшиеся съёмки — в `failedWidths`
// с причиной. Если хоть одна ширина не снята, скрипт выходит с кодом 1 и
// печатает это в stderr. Раньше ошибка съёмки глушилась, а в `meta.json`
// писался запрошенный список — evidence врало о своей полноте.
//
// Ключ `--shot-timeout` (по умолчанию 10000 мс) ограничивает ожидание узла на
// каждой ширине: без него скрытый на мобильных узел давал 30 секунд тишины
// на ширину. Прогресс печатается по каждой ширине до попытки съёмки.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const argv = process.argv.slice(2);
// Ключ, требующий значения. Если значения нет или следующий токен — сам ключ,
// это ошибка вызова, а не «true»: раньше `--widths` без значения доезжал до
// Playwright и падал стек-трейсом `viewport.width: got float NaN`.
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
const DEFAULT_WIDTHS = '320,375,744,768,1024,1440';
const widths = [...new Set(
  arg('widths', DEFAULT_WIDTHS).split(',').map((raw) => {
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
  'box-shadow', 'outline', 'outline-offset', 'transition', 'transform', 'cursor', 'z-index',
];

const cleanAttrs = /^(data-v-[0-9a-f]+|data-testid|data-reactroot|nonce)$/;

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch(channel ? { channel } : {}).catch(async (error) => {
  if (channel) throw error;
  return chromium.launch({ channel: 'msedge' });
});
const context = await browser.newContext({ viewport: { width: widths.at(-1), height: 1000 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
await page.waitForTimeout(wait);
await page.waitForSelector(selector, { timeout: 15000 });

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

fs.writeFileSync(path.join(out, 'dom.html'), snapshot.html, 'utf8');
fs.writeFileSync(path.join(out, 'computed.json'), JSON.stringify(snapshot.computed, null, 2), 'utf8');
fs.writeFileSync(path.join(out, 'tokens.json'), JSON.stringify({ custom: snapshot.tokens, fonts: snapshot.fonts }, null, 2), 'utf8');

// Снятые ширины считаются по факту: попытка съёмки, затем проверка файла на
// диске. В meta.json уезжает этот список, а не запрошенный.
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

fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({
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
  // Это про вьюпорт контекста, а не про PNG, поэтому значение берётся из
  // запрошенного списка и не зависит от успеха съёмки.
  computedAtWidth: widths.at(-1),
  title: snapshot.title,
  capturedAt: new Date().toISOString(),
}, null, 2), 'utf8');

await browser.close();
console.log(`Снято: ${out} (узлов ${snapshot.computed.length}, токенов ${Object.keys(snapshot.tokens).length}, ширин ${captured.length} из ${widths.length}: ${captured.join(' · ') || '—'})`);

if (failed.length) {
  console.error(`\nНе снято ширин: ${failed.length} из ${widths.length} — ${failed.map((f) => f.width).join(', ')}.`);
  console.error('meta.json перечисляет только снятые; evidence неполон, и это не пропускается молча.');
  process.exit(1);
}
