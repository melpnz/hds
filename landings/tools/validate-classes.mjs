/**
 * Две проверки над CSS и разметкой пакета.
 *
 * 1. Классы без правила. Класс, у которого нет правила в CSS, не применяется
 *    молча — без ошибки в консоли и без визуального следа, отличимого от
 *    «правило есть, но слабое». Верстая новое, на это наступают регулярно.
 *
 *    Своя разметка (аргументом) проверяется **только против ui/**: если класс
 *    статьи нашёлся лишь в showcase/*.css, оболочка витрины протекла в блок,
 *    и на пустой странице с одним ui/landings.css он не сработает — инвариант
 *    копируемости METHOD §6.1.
 *
 * 2. Отделённость витрины, METHOD §6.2:
 *
 *      showcase/*.css   каждый селектор несёт класс doc-*
 *      ui/ ** / *.css    ни одного класса doc-*, ни одной переменной --doc-*
 *
 *    Проверка нужна именно механическая. Образец career/showcase/
 *    components.css держит префикс только у переменных: класса doc- нет
 *    ни у одного селектора — 189 из 189, 103 уникальных имени, среди них
 *    .layout, .main, .nav, .callout, .hint, .legend. Рядом pages.css — ещё
 *    63 селектора и 25 имён. Замерено этим же разбором (см. «без класса
 *    витрины doc-» ниже). Внимание автора этот инвариант не удержало
 *    ни разу — строка R0-06 роадмапа прямо запрещает повторять именование
 *    образца.
 *
 * Запуск:
 *   node tools/validate-classes.mjs                  # витрины пакета
 *   node tools/validate-classes.mjs путь/к/блоку.html # своя разметка
 *
 * Коды возврата: 0 — сошлось; 1 — расхождение; 2 — проверять нечего (витрины
 * ещё нет, её заводит R0-06) или названного файла не существует.
 *
 * Портирован с courses/tools/validate-classes.mjs (read-only образец).
 * Отличия: витрина у лендингов одна и называется blocks.html — единица
 * пакета блок, а не компонент; базовая линия известных пробелов не заводится
 * (у Курсов она хранит утилиты Tailwind со снятого прода, здесь разметка
 * не снимается с прода вовсе).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (file) => path.join(root, file);
// Пути в сообщениях всегда через прямой слэш: на Windows path.relative
// отдаёт обратные, и один и тот же файл выглядит в выдаче двумя способами.
// Файл вне корня пакета (своя разметка аргументом) печатается как есть:
// относительный путь для него выглядит как ../../../../../copy-check.html
// и адресом не работает.
const shortPath = (file) => {
  const relative = path.relative(root, file).split(path.sep).join('/');
  return relative.startsWith('../') ? file.split(path.sep).join('/') : relative;
};

const args = process.argv.slice(2);
const own = args.length > 0;
// METHOD §6.2 требует, чтобы оболочка витрины жила под собственным префиксом
// и не протекала в ui/. Префикс не обязан быть один: страницы-таблицы пакета
// написаны под doc-, перенесённый из design/landing-lab конструктор лендингов —
// под ml-. Оба проверяются одинаково и в обе стороны: селектор витрины обязан
// нести один из них, а ui/ не должен нести ни одного.
const SHELL_PREFIXES = ['doc-', 'ml-'];

const showcaseFiles = ['showcase/index.html', 'showcase/blocks.html', 'showcase/primitives.html', 'showcase/core.html'];
const showcaseSteps = {
  'showcase/index.html': 'перенос конструктора лендингов',
  'showcase/blocks.html': 'R0-06',
  'showcase/primitives.html': 'R1',
  'showcase/core.html': 'R2',
};

const htmlFiles = own ? args : showcaseFiles.filter((file) => fs.existsSync(rel(file))).map(rel);

if (own) {
  const absent = args.filter((file) => !fs.existsSync(file));
  if (absent.length) {
    console.error(`Нет файлов: ${absent.join(', ')}`);
    process.exit(2);
  }
}

// Отсутствие витрины гасит только первую проверку — классы разметки.
// Вторая, §6.2, говорит о CSS пакета, и её предмет — ui/ — существует
// с самого R0-01. Ранний выход по «витрины нет» усыплял её ровно
// на промежутке R0-02 и R0-03, то есть на тех двух шагах, которые в ui/
// и пишут. Поэтому выход перенесён в самый конец: сначала ui/ сканируется,
// и код 2 отдаётся только тогда, когда протечек нет.
const noShowcase = !own && htmlFiles.length === 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const uiCssFiles = walk(rel('ui')).filter((file) => file.endsWith('.css'));
const showcaseCssFiles = walk(rel('showcase')).filter((file) => file.endsWith('.css'));
const cssFiles = [...uiCssFiles, ...(own ? [] : showcaseCssFiles)];

// Комментарии срезаются до всякого разбора. Иначе определением класса
// становится любое имя, упомянутое в пояснении: ui/landings.css называет
// в комментарии и .doc-layout, и .nav, и пути файлов.
const withoutComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, ' ');

// Селекторы, а не весь текст. Один проход снимает самые внутренние блоки
// объявлений — вложенных фигурных скобок в них не бывает, — и остаётся то,
// что стояло перед каждым блоком. Без этого шага `padding: 0 .5em` объявляет
// класс `5em`, а `font: 400 12.5px/1.5` — класс `5px`.
const selectorText = (css) => withoutComments(css).replace(/\{[^{}]*\}/g, ' ');

// Имя класса не начинается с цифры — этим отсеиваются остатки чисел
// из преамбул вида @media (min-width: 37.5em).
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

// Разбор правил CSS в пары (селекторы, тело) с рекурсией по @media/@supports/
// @layer. Нужен там, где мало знать, что имя класса встретилось где-то
// в файле, а нужно проверить каждый селектор в отдельности — §6.2 ниже.
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
      // Внутри этих @-правил лежат обычные правила с обычными селекторами.
      // Остальные (@font-face, @keyframes, @page) селекторов не несут.
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
  return parts.map((part) => part.trim()).filter(Boolean);
}

// :root у витрины несёт только переменные оболочки (--doc-*), а не правило,
// применяющееся к элементу, — класса doc- ему требовать не за что.
const SELECTOR_EXEMPT_FROM_PREFIX = new Set([':root']);

// Каждый отдельный селектор оболочки обязан содержать класс doc-*, а не файл
// в целом. Набор имён по файлу пропускал два случая: селектор вовсе без
// класса (body, `button, input, a`) и класс, объявленный не в showcase/*.css,
// а в инлайновом <style> витрины.
// Две витрины устроены по-разному, и правило §6.2 применяется к ним по-разному.
//
// Страницы-таблицы (blocks / primitives / core) — документационная оболочка
// ВОКРУГ продуктовой разметки: они подключают ui/blocks/*.css и показывают
// настоящие примитивы. Голый селектор вроде `button` там задел бы продуктовую
// кнопку в демонстрации, и разницу между «так выглядит компонент» и «так его
// подкрасила витрина» стало бы не видно. Поэтому каждый селектор обязан нести
// класс оболочки.
//
// Конструктор лендингов раньше был исключением целиком: он не подключал
// продуктовый CSS пакета, задевать в нём было нечего, и showcase/lab.css,
// showcase/hds.css и showcase/index.html освобождались от требования целыми
// файлами. ЭТО БОЛЬШЕ НЕ ТАК. С этапа 2 showcase/index.html подключает
// ui/landings.css, и вся продуктовая разметка живёт внутри конструктора:
// голый `button` теперь красит .button пакета, голый `input` — .form-field-input.
// Прежнее послабление молча разрешало ровно тот случай, ради которого правило
// и написано.
//
// Что вместо него. showcase/hds.css и showcase/index.html послабления больше
// не получают вовсе: после перевода на классы пакета голых селекторов там нет
// (кроме :root, он освобождён отдельно и несёт только переменные --ml-*).
//
// У showcase/lab.css остаётся ровно одна причина держать голые селекторы:
// он приносит БАЗУ ДОКУМЕНТА для страницы стенда — сброс полей, фон и шрифт
// body, кольцо фокуса, наследование шрифта контролами, поведение картинок,
// диалог. Класс оболочки на них не навесить: они говорят про html, body, *
// и про элементы, у которых в разметке нет своего класса. Пакет эту базу
// сегодня не даёт — ui/foundations.css пустой каркас до шага R0-03.
//
// Поэтому послабление сузилось с «файла целиком» до ПОИМЕННОГО СПИСКА.
// Список — не украшение: любой НОВЫЙ голый селектор в lab.css теперь роняет
// проверку, потому что новый голый селектор — это новая молчаливая перекраска
// продуктовой разметки, а не база документа. Когда R0-03 наполнит
// ui/foundations.css, список должен схлопнуться до пустого, а не переписаться
// длиннее.
const SHOWCASE_DOCUMENT_BASE = new Map([
  ['showcase/lab.css', new Set([
    // сброс и база страницы стенда
    '*', 'html', 'body', 'main', 'img', '[hidden]',
    // типографика документа: пакетные блоки задают свою классами,
    // и класс всегда сильнее элемента
    'h1', 'h2', 'h3', 'p', 'p+p',
    // наследование шрифта контролами и указатель
    'button', 'input', 'textarea', 'select', 'a', 'summary',
    // Кольца фокуса и выключенной кнопки в этом списке БОЛЬШЕ НЕТ, и это
    // не забывчивость. Шесть селекторов :focus-visible и button:disabled
    // ушли в ui/state-contract.css: состояние даёт пакет, а не стенд.
    // Прежняя строка списка объясняла их так — «пакет его не даёт, стенд
    // обязан дать сам, иначе клавиатурой не пройти», — и ровно это ломало
    // инвариант копируемости METHOD §6.1: разметка, вынесенная из стенда
    // на пустую страницу, теряла фокус вместе с оболочкой. Возвращать их
    // сюда нельзя; правило состояния живёт в пакете под маркером @normative.
    // окно статьи стенда
    'dialog', 'dialog h2', 'dialog::backdrop',
  ])],
]);

function selectorLeaks(css, label) {
  const documentBase = SHOWCASE_DOCUMENT_BASE.get(label) ?? new Set();
  const found = [];
  forEachRule(withoutComments(css), (preamble) => {
    for (const selector of splitSelectorList(preamble)) {
      if (SELECTOR_EXEMPT_FROM_PREFIX.has(selector)) continue;
      const hasShellClass = [...classNames(selector)].some((name) => SHELL_PREFIXES.some((p) => name.startsWith(p)));
      if (hasShellClass) continue;
      // Пробелы внутри селектора приводятся к одному: `dialog  h2` и
      // `dialog h2` — один и тот же селектор, и список не должен зависеть
      // от того, как его набрали.
      if (documentBase.has(selector.replace(/\s+/g, ' '))) continue;
      found.push(`${label}: селектор без класса оболочки витрины (${SHELL_PREFIXES.join(' / ')}) — ${selector}`);
    }
  });
  return found;
}

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
  // двойные кавычки такую разметку не находит вовсе, и «проверено 0 классов»
  // означает «эту форму записи мы не читаем», а не «классов нет».
  for (const match of html.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    const value = match[1] ?? match[2] ?? match[3] ?? '';
    for (const cls of value.split(/\s+/)) {
      if (!cls || cls.includes('{')) continue;
      if (!used.has(cls)) used.set(cls, file);
    }
  }
}

// -------------------------------------------------------------------------
// Инвариант METHOD §6.2 — отделённость витрины. Проверяется всегда, в том
// числе при разборе своей разметки: он говорит о CSS пакета, а не о файле,
// переданном аргументом.
// -------------------------------------------------------------------------
const leaks = [];

for (const file of showcaseCssFiles) {
  leaks.push(...selectorLeaks(fs.readFileSync(file, 'utf8'), shortPath(file)));
}

// Инлайновый <style> самой витрины — та же оболочка, только не в
// showcase/*.css. До этой проверки класс оболочки, объявленный только там,
// проходил §6.2 зелёным.
for (const file of showcaseFiles.filter((f) => fs.existsSync(rel(f)))) {
  const html = fs.readFileSync(rel(file), 'utf8');
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    leaks.push(...selectorLeaks(style[1], `${file} <style>`));
  }
}

for (const file of uiCssFiles) {
  const css = withoutComments(fs.readFileSync(file, 'utf8'));
  const name = shortPath(file);
  for (const cls of classNames(css.replace(/\{[^{}]*\}/g, ' '))) {
    if (SHELL_PREFIXES.some((p) => cls.startsWith(p))) leaks.push(`${name}: класс оболочки витрины в продуктовом слое — .${cls}`);
  }
  for (const match of css.matchAll(/--doc-[\w-]*/g)) {
    leaks.push(`${name}: переменная оболочки витрины в продуктовом слое — ${match[0]}`);
  }
}

const missing = [...used].filter(([cls]) => !defined.has(cls));

// Витрина, которой ещё нет, — не молчание, а названный шаг.
const deferred = own ? [] : showcaseFiles.filter((file) => !fs.existsSync(rel(file)));

if (deferred.length) {
  console.log(`Отложено (${deferred.length}) — витрины ещё нет:`);
  for (const file of deferred) console.log(`  ${file} — заводит шаг ${showcaseSteps[file]}`);
  console.log('');
}

let failed = false;

if (leaks.length) {
  console.error(`Оболочка витрины и продуктовый слой смешались (${leaks.length}) — METHOD §6.2:\n`);
  for (const leak of leaks.sort()) console.error(`  ${leak}`);
  console.error('\nОболочка витрины живёт в showcase/*.css под префиксом doc- у классов');
  console.error('и --doc- у переменных. В ui/ её быть не должно: пакет подключают одним');
  console.error('ui/landings.css, без витрины, и правило оболочки там либо не сработает,');
  console.error('либо сработает не там.\n');
  failed = true;
}

if (missing.length) {
  console.error(`Классы без определения в CSS (${missing.length}):\n`);
  for (const [cls, file] of missing.sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`  ${cls}  —  ${shortPath(file)}`);
  }
  if (own) {
    console.error('\nСвоя разметка проверяется только против ui/: класс, который есть лишь');
    console.error('в showcase/*.css, на пустой странице не сработает — METHOD §6.1.');
  } else {
    console.error('\nДопишите правило в ui/ или обойдитесь имеющимися классами.');
  }
  failed = true;
}

if (failed) process.exit(1);

// Витрины нет — значит первая проверка без предмета. Но вторая уже
// отработала: ui/ просканирован выше, и её результат называется числом,
// а не подразумевается.
if (noShowcase) {
  console.error('Витрины ещё нет — классы разметки проверять не по чему (см. «Отложено» выше).');
  console.error(`METHOD §6.2 при этом проверен: ui/**/*.css — ${uiCssFiles.length} файл(ов), протечек оболочки нет.`);
  process.exit(2);
}

console.log(`Проверено классов: ${used.size} в ${htmlFiles.length} файле(ах) против ${cssFiles.length} таблиц стилей.`);
console.log(`METHOD §6.2: витрин ${showcaseCssFiles.length} с префиксом doc-, файлов ui/ без doc- — ${uiCssFiles.length}.`);
