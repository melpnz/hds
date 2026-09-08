// Съёмка фактов с живой страницы лендинга. Ничего не интерпретирует — только снимает.
//
//   node tools/capture.mjs --url https://technotext.habr.com --selector "header" //     --out evidence/source/production/site-header
//     [--widths 1600] [--state hover] [--channel msedge] [--wait 1500]
//     [--shot-timeout 10000] [--full-page]
//
// -------------------------------------------------------------------------
// Ширины: канон METHOD §3 — 320 · 768 · 1024 · 1400
// -------------------------------------------------------------------------
// Ключ --widths необязателен: без него снимаются четыре канонические ширины.
// До 8 сентября 2026 он был обязательным, и обоснование было верным для того
// дня: канона не существовало, а дефолт, выдуманный инструментом, разъехался
// бы по evidence всех последующих шагов. Теперь набор задан METHOD §3, раздел
// «Ширины съёмки», а METHOD — контракт над пакетом. Требовать после этого
// перечислять канон руками на каждом вызове — не защита владельца, а способ
// получить четыре разных набора в четырёх шагах.
//
// Расхождение канона с артбордами этого пакета — прямо, без сглаживания.
// В 18 макетах пять ширин артборда: 1600 — 8 узлов, 1440 — 5, 1400 — 3,
// 1280 — 1, 1240 — 1. С каноном совпадает одна — 1400, и она третья
// по частоте (3 узла из 18). Самая частая ширина артборда, 1600, в канон
// не входит вовсе; 320, 768 и 1024 не встречаются ни у одного артборда —
// мобильных артбордов в заданных 18 узлах ноль (BRIEF §5 п. 4). То есть
// 15 макетов из 18 снимаются не на той ширине, на которой нарисованы.
//
// Набор от этого не меняется. С прода снимается поведение вёрстки, а не
// воспроизведение артборда: 320, 768 и 1024 — ровно те точки, где поведение
// и надо видеть, а ширина артборда остаётся у figma-снимка узла, который
// лежит рядом в evidence. Если конкретный узел нужно снять и на его ширине —
// это исключение METHOD §3 «отдельный артборд или медиазапрос»: --widths 1600
// и запись исключением в .pipeline/<id>/capture.md. Неканоническую ширину
// скрипт снимает, но печатает предупреждение с требованием этой записи.
//
// 375 и 1440 METHOD §3 называет поимённо как ширины, которые снимать не надо.
// Прежний набор скилла guide-build (375,768,1024,1440) отменён этим каноном;
// у 1440 в этом пакете есть основание для исключения — 5 артбордов из 18, —
// у 375 в источниках нет ничего.
//
// Q-4 (какая ширина канонична для продукта) остаётся открытым и этим не
// закрывается: он про ширину контейнера, которую будут воспроизводить блоки
// в ui/, а не про ширины съёмки. Ширины съёмки назвал METHOD §3.
//
// На выходе в --out:
//   dom.html         разметка узла с вычищенными фреймворк-атрибутами
//   computed.json    computed styles по каждому узлу поддерева
//   tokens.json      кастомные свойства :root и подключённые шрифты
//   <width>.png      скриншот узла на каждой ширине
//   meta.json        URL, дата, селектор, состояние, снятые ширины
//
// Отчётность инструмента. meta.json называет в widthsSource, откуда взялся
// набор: канон METHOD §3 или названные руками ширины. В поле widths стоят
// только те, для которых PNG действительно оказался на диске; запрошенный
// список лежит рядом в requestedWidths, несостоявшиеся съёмки — в
// failedWidths с причиной. Если снята не каждая ширина, скрипт выходит
// с кодом 1. Молчаливая потеря ширины означала бы, что evidence врёт
// о своей полноте, — а весь пакет стоит на том, что evidence не врёт.
//
// Коды возврата: 0 — снято всё; 1 — узел не найден или снята не каждая
// ширина; 2 — ошибка вызова (нет обязательного ключа, битое значение).
//
// Перенесён из courses/tools/capture.mjs (read-only образец). Отличия:
// набор ширин по умолчанию — канон METHOD §3 (320 · 768 · 1024 · 1400),
// а не восемь границ прода Курсов (320,375,479,480,744,768,1024,1440),
// и нет упоминаний брейкпоинтов Курсов.

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

// Канон METHOD §3. Меняется только вместе с METHOD, не решением шага.
const CANONICAL_WIDTHS = [320, 768, 1024, 1400];
// Названы в METHOD §3 поимённо как ширины, которые снимать не надо.
const DISCOURAGED_WIDTHS = [375, 1440];

const widthsRaw = arg('widths');
const widths = widthsRaw === null
  ? [...CANONICAL_WIDTHS]
  : [...new Set(
    widthsRaw.split(',').map((raw) => {
      const width = number('widths', raw.trim());
      if (!Number.isInteger(width)) {
        console.error(`Ключ --widths: ширина должна быть целой, получено «${raw.trim()}».`);
        process.exit(2);
      }
      return width;
    }),
  )].sort((a, b) => a - b);

// Своя ширина разрешена, но молча не проходит: у неё обязано быть основание
// и запись, иначе набор ширин расползётся по шагам ровно так, как расползся
// бы от выдуманного дефолта.
if (widthsRaw !== null) {
  const offCanon = widths.filter((width) => !CANONICAL_WIDTHS.includes(width));
  if (offCanon.length) {
    console.warn(`Ширины вне канона METHOD §3 (${offCanon.join(' · ')}). Канон: ${CANONICAL_WIDTHS.join(' · ')}.`);
    console.warn('Своя ширина допустима, только если под неё есть отдельный артборд Figma');
    console.warn('или медиазапрос в CSS. Запишите это исключением в .pipeline/<id>/capture.md.');
    const named = offCanon.filter((width) => DISCOURAGED_WIDTHS.includes(width));
    if (named.length) {
      console.warn(`METHOD §3 называет ${named.join(' и ')} поимённо: эти ширины не снимаются.`);
      if (named.includes(375)) console.warn('  375 — в источниках этого пакета не встречается ни разу: основания нет.');
      if (named.includes(1440)) console.warn('  1440 — ширина 5 артбордов из 18 в этом пакете: основание для исключения есть, назовите его.');
    }
    console.warn('');
  }
}

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
  // Откуда взялся набор: канон METHOD §3 или названные руками ширины.
  // По evidence должно быть видно, снято ли по канону, не сверяясь с датой
  // и памятью того, кто снимал.
  widthsSource: widthsRaw === null ? 'METHOD §3: 320,768,1024,1400' : `--widths ${widthsRaw}`,
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
