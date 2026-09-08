/**
 * Две проверки над CSS и разметкой пакета.
 *
 * 1. Классы без правила. Разметка пакета — снимок продакшена на Tailwind,
 *    а `ui/` содержит только те правила, что мы выписали руками. Валидная
 *    утилита вроде `gap-5` или `phone:flex` в `ui/` отсутствует, поэтому не
 *    применяется — молча, без ошибки в консоли. Верстая новое, на это
 *    наступают регулярно.
 *
 *    Своя разметка (аргументом) проверяется **только против `ui/`**: если
 *    класс спецификации нашёлся лишь в `showcase/*.css`, оболочка витрины
 *    протекла в компонент, и на пустой странице с одним `ui/courses.css` он
 *    не сработает — инвариант копируемости METHOD §6.1.
 *
 * 2. Отделённость витрины, METHOD §6.2. Обратное направление того же
 *    правила, которое до R0-06 не проверял никто: оболочка витрины обязана
 *    целиком лежать под своим префиксом, а `ui/` — не знать о ней ничего.
 *
 *      showcase/*.css   каждый класс в селекторе начинается с `doc-`
 *      ui/**\/*.css      ни одного класса `doc-*`, ни одного `--doc-*`
 *
 *    Проверка нужна именно механическая. Образец
 *    `career/showcase/components.css` держит префикс только у переменных:
 *    100 селекторов там без префикса, среди них `.layout`, `.main`, `.nav`,
 *    `.callout`, `.hint`, `.legend`. Внимание автора этот инвариант не
 *    удержало ни разу, и вторая проверка стоит здесь, чтобы не удерживать
 *    его внимание и в Курсах.
 *
 * Запуск:
 *   node tools/validate-classes.mjs                    # витрины пакета
 *   node tools/validate-classes.mjs путь/к/фиче.html    # своя разметка
 *
 * Коды возврата: 0 — сошлось; 1 — нашлось расхождение; 2 — проверять нечего
 * (нет ни одной витрины) или названного файла не существует.
 *
 * Перенесён из `career/tools/validate-classes.mjs` (read-only образец).
 * Отличия от образца: инвариант §6.2 проверяется, а не оставляется ревью;
 * имена классов берутся из селекторов, а не из всего текста CSS; базовая
 * линия известных пробелов необязательна.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const own = args.length > 0;
const showcaseFiles = ['showcase/components.html', 'showcase/pages.html'];
const showcaseSteps = { 'showcase/components.html': 'R0-06', 'showcase/pages.html': 'R6' };

const htmlFiles = own ? args : showcaseFiles.filter(file => fs.existsSync(file));

if (own) {
  const absent = args.filter(file => !fs.existsSync(file));
  if (absent.length) {
    console.error(`Нет файлов: ${absent.join(', ')}`);
    process.exit(2);
  }
} else if (htmlFiles.length === 0) {
  console.error('Витрин ещё нет. Проверять пока нечего.');
  for (const file of showcaseFiles) console.error(`  ${file} — заводит шаг ${showcaseSteps[file]}`);
  process.exit(2);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const uiCssFiles = walk('ui').filter(file => file.endsWith('.css'));
const showcaseCssFiles = walk('showcase').filter(file => file.endsWith('.css'));
const cssFiles = [...uiCssFiles, ...(own ? [] : showcaseCssFiles)];

// Комментарии срезаются до всякого разбора. Иначе определением класса
// становится любое имя, упомянутое в пояснении: `ui/courses.css` называет
// в комментарии и `.doc-layout`, и `.nav`, и путь файла. Тот же приём и по
// той же причине стоит в tools/validate-components.mjs.
const withoutComments = css => css.replace(/\/\*[\s\S]*?\*\//g, ' ');

// Селекторы, а не весь текст. Один проход снимает самые внутренние блоки
// объявлений — вложенных фигурных скобок в них не бывает, — и остаётся
// то, что стояло перед каждым блоком: селекторы и преамбулы @media.
// Без этого шага `padding: 0 .5em` объявляло класс `5em`, а `font: 400
// 12.5px/1.5` — класс `5px`: имена из значений свойств попадали в набор
// определённых наравне с настоящими.
const selectorText = css => withoutComments(css).replace(/\{[^{}]*\}/g, ' ');

// Имя класса не начинается с цифры — этим отсеиваются остатки чисел
// из преамбул вида `@media (min-width: 37.5em)`.
const SELECTOR = /\.((?:[\w-]|\\.)+)/g;
const UNESCAPE = /\\(.)/g;

function classNames(text) {
  const names = new Set();
  for (const match of text.matchAll(SELECTOR)) {
    const name = match[1].replace(UNESCAPE, '$1');
    if (!/^\d/.test(name)) names.add(name);
  }
  return names;
}

// -------------------------------------------------------------------------
// Разбор правил CSS в пары (список селекторов, тело объявлений), с рекурсией
// по @media/@supports/@layer. Нужен там, где недостаточно знать, какие имена
// классов встретились где-то в файле (`classNames`/`selectorText` выше), а
// нужно проверить каждый селектор в отдельности — METHOD §6.2 ниже.
// -------------------------------------------------------------------------
function forEachRule(css, visit) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const preamble = css.slice(i, open);
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    const atRule = preamble.trim().match(/^@([\w-]+)/);
    if (atRule && ['media', 'supports', 'layer'].includes(atRule[1].toLowerCase())) {
      // У этих @-правил внутри лежат обычные правила с обычными селекторами —
      // разбираем тело рекурсивно. Остальные @-правила (@font-face,
      // @keyframes, @page…) селекторов в нашем смысле не несут — пропускаем.
      forEachRule(body, visit);
    } else if (!atRule) {
      visit(preamble, body);
    }
    i = j;
  }
}

// Разбивает список селекторов по запятым верхнего уровня — то есть не внутри
// () или []: `:not(.a, .b)` и `[data-x="a,b"]` остаются одним селектором.
function splitSelectorList(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let k = 0; k < text.length; k++) {
    const ch = text[k];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(text.slice(start, k));
      start = k + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map(part => part.trim()).filter(Boolean);
}

// Селекторы, которым не нужен класс doc-: `:root` несёт только переменные
// оболочки (--doc-*), а не правило, применяющееся к элементу.
const SELECTOR_EXEMPT_FROM_PREFIX = new Set([':root']);

// Каждый отдельный селектор оболочки витрины обязан содержать класс doc-* —
// а не файл в целом. Раньше проверка смотрела на набор имён классов файла
// целиком (`classNames(selectorText(...))`), и от неё ускользали ровно два
// случая: селектор вовсе без класса (`body`, `button, input, a`) — классов
// там нет, значит и упрекнуть нечем, — и класс, который есть, но объявлен
// не в showcase/*.css, а в инлайновом `<style>` витрины (эта функция такие
// файлы не читала). Ревью R0-06, находка 1 (обходы а/б/в).
function selectorLeaks(css, label) {
  const found = [];
  forEachRule(withoutComments(css), (preamble) => {
    for (const selector of splitSelectorList(preamble)) {
      if (SELECTOR_EXEMPT_FROM_PREFIX.has(selector)) continue;
      const hasDocClass = [...classNames(selector)].some(name => name.startsWith('doc-'));
      if (!hasDocClass) {
        found.push(`${label}: селектор без класса витрины doc- — ${selector}`);
      }
    }
  });
  return found;
}

// Базовая линия: классы, уже не имеющие правила. Выводятся предупреждением,
// чтобы не мешать поймать новые. Причина у каждого — в самом файле.
// Файла может не быть — тогда базовой линии просто нет.
const baselineFile = 'tools/known-missing-classes.json';
const known = own || !fs.existsSync(baselineFile) ? {} : JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

const defined = new Set();
for (const file of cssFiles) {
  for (const name of classNames(selectorText(fs.readFileSync(file, 'utf8')))) defined.add(name);
}

// Классы, использованные в разметке.
const used = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  // <style> внутри разметки — тоже определение: так, например, объявляют
  // анимацию внутри встроенного SVG.
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const name of classNames(selectorText(style[1]))) defined.add(name);
  }
  // Значение атрибута class бывает в двойных кавычках, в одинарных и вовсе
  // без кавычек — валидный HTML допускает все три формы. Регулярка на одни
  // двойные кавычки такую разметку не находила вообще: «Checked 0 classes»
  // молча означало «эту форму записи мы не читаем», а не «классов нет».
  for (const match of html.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    const value = match[1] ?? match[2] ?? match[3] ?? '';
    for (const cls of value.split(/\s+/)) {
      if (!cls || cls.includes('{')) continue;
      if (!used.has(cls)) used.set(cls, file);
    }
  }
}

// -------------------------------------------------------------------------
// Инвариант METHOD §6.2 — отделённость витрины.
// Проверяется всегда, в том числе при разборе своей разметки: он говорит
// о CSS пакета, а не о переданном файле.
// -------------------------------------------------------------------------
const leaks = [];

// showcase/*.css — каждый селектор разбирается и обязан нести класс doc-*
// (кроме :root — см. SELECTOR_EXEMPT_FROM_PREFIX).
for (const file of showcaseCssFiles) {
  leaks.push(...selectorLeaks(fs.readFileSync(file, 'utf8'), file));
}

// Инлайновый <style> внутри самой витрины — та же оболочка, только не в
// showcase/*.css. Проверяется по реальным файлам витрины всегда, независимо
// от `own`: своя разметка (аргументом) к этому инварианту отношения не
// имеет, он про CSS пакета. До этой правки такой <style> участвовал только
// в проверке «класс без правила» (объявление) и не участвовал в проверке
// префикса — класс оболочки, объявленный только там, проходил §6.2 кодом 0.
for (const file of showcaseFiles.filter(f => fs.existsSync(f))) {
  const html = fs.readFileSync(file, 'utf8');
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    leaks.push(...selectorLeaks(style[1], `${file} <style>`));
  }
}

for (const file of uiCssFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const css = withoutComments(raw);
  for (const name of classNames(css.replace(/\{[^{}]*\}/g, ' '))) {
    if (name.startsWith('doc-')) {
      leaks.push(`${file}: класс оболочки витрины в продуктовом слое — .${name}`);
    }
  }
  for (const match of css.matchAll(/--doc-[\w-]*/g)) {
    leaks.push(`${file}: переменная оболочки витрины в продуктовом слое — ${match[0]}`);
  }
}

const undefinedClasses = [...used].filter(([cls]) => !defined.has(cls));
const missing = undefinedClasses.filter(([cls]) => !(cls in known));
const baseline = undefinedClasses.filter(([cls]) => cls in known);

// Витрина, которой ещё нет, — не молчание, а названный шаг. Прежде
// отсутствующий файл просто выпадал из фильтра, и «проверено» звучало
// одинаково для одной витрины и для двух.
const deferred = own ? [] : showcaseFiles.filter(file => !fs.existsSync(file));

if (deferred.length) {
  console.log(`Отложено (${deferred.length}) — витрины ещё нет:`);
  for (const file of deferred) console.log(`  ${file} — заводит шаг ${showcaseSteps[file]}`);
  console.log('');
}

if (baseline.length) {
  console.warn(`Известные пробелы (${baseline.length}) — см. ${baselineFile}:`);
  for (const [cls] of baseline.sort((a, b) => a[0].localeCompare(b[0]))) {
    console.warn(`  ${cls} — ${known[cls]}`);
  }
  console.warn('');
}

let failed = false;

if (leaks.length) {
  console.error(`Оболочка витрины и продуктовый слой смешались (${leaks.length}) — METHOD §6.2:\n`);
  for (const leak of leaks.sort()) console.error(`  ${leak}`);
  console.error('\nОболочка витрины живёт в showcase/*.css под префиксом doc- у классов');
  console.error('и --doc- у переменных. В ui/ её быть не должно: продукт подключают');
  console.error('одним ui/courses.css, без витрины, и правило оболочки там либо не');
  console.error('сработает, либо сработает не там.\n');
  failed = true;
}

if (missing.length) {
  console.error(`Классы без определения в CSS (${missing.length}):\n`);
  for (const [cls, file] of missing.sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`  ${cls}  —  ${file}`);
  }
  console.error('\nЕсли это утилита Tailwind — её нет в ui/, и на странице она не сработает.');
  if (own) {
    // Базовая линия для своей разметки не читается по замыслу (см. выше):
    // с ней инвариант METHOD §6.1 перестал бы проверяться там, где он и нужен.
    // Советовать её здесь — советовать обойти проверку.
    console.error('Своя разметка проверяется строго: закрывается это правилом в ui/, а не записью');
    console.error('в базовую линию — она для своей разметки не читается. Утилиты продукта, которые');
    console.error('встречаются в разметке спецификаций, несёт ui/utilities.css (заводит R0-04).');
  } else {
    console.error('Допишите правило, обойдитесь имеющимися или занесите в ' + baselineFile + ' с причиной.');
  }
  failed = true;
}

if (failed) process.exit(1);

console.log(`Checked ${used.size} classes in ${htmlFiles.length} file(s) against ${cssFiles.length} stylesheets.` + (baseline.length ? ` No new undefined classes (${baseline.length} known gaps).` : ' All defined.'));
console.log(`METHOD §6.2: ${showcaseCssFiles.length} showcase stylesheet(s) prefixed doc-, ${uiCssFiles.length} ui stylesheet(s) free of doc-.`);
