/**
 * Ссылка на несуществующий токен — ошибка. И значение токена в статье
 * обязано совпадать с объявлением в ui/tokens.css.
 *
 * Почему отдельная проверка. Находка 03-2 ревью R0-03: статьи блоков несли
 * прежнюю двенадцатиступенчатую редакцию шкалы. Три значения разошлись
 * с действующими (--core-lead 22/1.2 против 20/1.5, --core-h3 32/1.1 против
 * 24/1.2, --core-h1 56/1 против clamp(32px, 5vw, 64px)/1.1), а два имени
 * не существовали вовсе: --core-h4 и --core-body-l. В браузере такие имена
 * резолвятся в пустую строку — то есть блок, собранный по статье, молча
 * теряет кегль, и увидеть это по CSS нельзя: var(--core-h4) выглядит ровно
 * так же, как var(--core-h3).
 *
 * Ни один сторож пакета этого не ловил:
 *
 *   validate-normative  сторожит МАРКЕР над объявлением, а не то, что имя
 *                       кем-то объявлено;
 *   validate-counts     сторожит числа-утверждения вида «N из M», а таблица
 *                       «Токены» статьи — не утверждение о покрытии;
 *   validate-classes    сторожит классы, а не переменные;
 *   validate-blocks     сторожит реестр, статьи и якоря.
 *
 * -------------------------------------------------------------------------
 * ЧТО ПРОВЕРЯЕТСЯ
 * -------------------------------------------------------------------------
 * 1. СУЩЕСТВОВАНИЕ В CSS. Каждое имя внутри var(--x) в ui/ ** / *.css
 *    и showcase/ *.css объявлено хоть где-нибудь в тех же файлах. Значение
 *    по умолчанию (var(--x, 16px)) от проверки не освобождает: умолчание —
 *    запасной путь, а не объявление, и молча подменять им отсутствующий
 *    токен значит прятать ровно ту ошибку, ради которой проверка написана.
 *
 * 2. СУЩЕСТВОВАНИЕ В СТАТЬЯХ. Каждое имя вида `--core-*`, `--product-*`,
 *    `--concept-*`, написанное в статье в обратных кавычках, объявлено
 *    в ui/ ** / *.css. Именно так в пакет и вернулись --core-h4
 *    и --core-body-l: в CSS их не было, они жили только в таблицах статей.
 *
 * 3. ЗНАЧЕНИЕ В ТАБЛИЦЕ «ТОКЕНЫ». В статьях blocks/ разделы «## Токены» —
 *    таблицы «Переменная | Значение | Статус». Если в первом столбце одно
 *    имя, а во втором стоят значения, они сверяются с объявлениями:
 *
 *      | `--core-h3` | `24px` / `1.2` / `-0.01em` | норматив (шкала) |
 *                       ↓        ↓        ↓
 *                --core-h3  -h3-lh   -h3-ls
 *
 *    Слэш разделяет роль, интерлиньяж и трекинг — так таблицы и написаны.
 *    Сверяется только то, что похоже на значение: «по теме», «по продукту»,
 *    «норматив светлая», «стекло» — проза, и она пропускается. Пробелы
 *    внутри значения не считаются: rgba(6,19,19,0.2) и rgba(6, 19, 19, 0.2)
 *    — одно значение, записанное двумя способами.
 *
 *    Имя может быть объявлено в нескольких областях (темы, продукты).
 *    Достаточно совпадения с ЛЮБЫМ объявлением: статья вправе называть
 *    значение тёмной темы, не повторяя светлое.
 *
 * -------------------------------------------------------------------------
 * ЗАПУСК
 * -------------------------------------------------------------------------
 *   node tools/validate-tokens.mjs
 *
 * Возврат 0 — расхождений нет; 1 — расхождения перечислены построчно.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (file) => path.relative(root, file).split(path.sep).join('/');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const lineAt = (text, index) => text.slice(0, index).split('\n').length;

// Комментарии обнуляются пробелами той же длины: индексы символов остаются
// прежними, и номер строки в сообщении показывает на настоящую строку.
const blankComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

// -------------------------------------------------------------------------
// Что где объявлено
// -------------------------------------------------------------------------
const cssFiles = [...walk(path.join(root, 'ui')), ...walk(path.join(root, 'showcase'))]
  .filter((file) => file.endsWith('.css'));

const declared = new Map(); // имя → Set значений
for (const file of cssFiles) {
  const css = blankComments(fs.readFileSync(file, 'utf8'));
  for (const m of css.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+)/g)) {
    if (!declared.has(m[1])) declared.set(m[1], new Set());
    declared.get(m[1]).add(m[2].trim());
  }
}

const errors = [];
let checkedRefs = 0;
let checkedValues = 0;

// -------------------------------------------------------------------------
// 1. var(--x) в CSS
// -------------------------------------------------------------------------
for (const file of cssFiles) {
  const css = blankComments(fs.readFileSync(file, 'utf8'));
  for (const m of css.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
    checkedRefs++;
    if (declared.has(m[1])) continue;
    errors.push(`${rel(file)}:${lineAt(css, m.index)} — var(${m[1]}) ссылается на необъявленный токен. В браузере он резолвится в пустую строку`);
  }
}

// -------------------------------------------------------------------------
// 2 и 3. Статьи
// -------------------------------------------------------------------------
const articleDirs = ['blocks', 'components', 'docs'].map((dir) => path.join(root, dir));
const articles = [
  ...articleDirs.flatMap(walk).filter((file) => file.endsWith('.md')),
  path.join(root, 'GUIDE.md'),
  path.join(root, 'BRIEF.md'),
].filter((file) => fs.existsSync(file));

// Имя пакета: три слоя и ничего кроме. --doc-* и --ml-* принадлежат
// оболочке витрины, --elements/* и font/* — переменные дизайн-системы Хабра,
// которые статьи цитируют как чужие: требовать их объявления в ui/ неверно.
const PACKAGE_TOKEN = /^--(?:core|product|concept)-[a-z0-9-]+$/;

// Отменённые токены. Список поимённый и с причиной — не послабление,
// а протокол: статья вправе рассказать, что имя было и куда делось
// («--core-glow-hero в ядре больше нет»), и такой рассказ ошибкой не
// является. В таблице «Токены» отменённое имя всё равно ошибка: таблица
// предписывает, из чего собрать блок, а не пересказывает историю.
const RETIRED = new Map([
  ['--core-glow-hero', 'вынесен из ядра на R0-02: роль → --product-glow-hero, снятый оранжевый 20216:120 → модификатор проекта .hero-glow-sanatorium'],
]);

const VALUE_LIKE = /^(?:clamp\([^)]*\)|-?\d+(?:\.\d+)?(?:px|em|rem|vw|vh|%|s|ms)?|#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?)\([^)]*\)|(?:[-\d.]+px\s+){1,3}[-\d.]+(?:px)?\s*(?:rgba?\([^)]*\))?)$/;

// Пробелы внутри значения не считаются, регистр тоже: rgba(6,19,19,0.2)
// и rgba(6, 19, 19, 0.2) — одно значение, записанное двумя способами.
//
// Голое число приравнивается к тем же пикселям: статьи пишут радиусы так,
// как они стоят в Figma, — «радиус 40», без единицы. Послабление узкое
// и на зубы проверки не влияет: 32 против 24 расходятся при любой записи,
// а именно такие расхождения находка 03-2 и назвала.
const norm = (value) => value.replace(/\s+/g, '').toLowerCase();
const same = (a, b) => norm(a) === norm(b) || norm(a) + 'px' === norm(b) || norm(a) === norm(b) + 'px';

const SUFFIX = ['', '-lh', '-ls'];

for (const file of articles) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');

  // 2. существование имени
  for (const m of text.matchAll(/`(--[A-Za-z0-9_-]+)`/g)) {
    const name = m[1];
    if (!PACKAGE_TOKEN.test(name)) continue;
    checkedRefs++;
    if (declared.has(name)) continue;
    if (RETIRED.has(name)) continue;
    errors.push(`${rel(file)}:${lineAt(text, m.index)} — статья ссылается на \`${name}\`, но такого токена в ui/ нет. В браузере имя резолвится в пустую строку`);
  }

  // 3. значения в таблицах «Токены»
  let inTokenTable = false;
  for (const [index, line] of lines.entries()) {
    if (/^#{2,6}\s/.test(line)) {
      inTokenTable = /^#{2,6}\s+Токены\s*$/.test(line.trim());
      continue;
    }
    if (!inTokenTable) continue;
    if (!line.trim().startsWith('|')) continue;

    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 2) continue;

    const names = [...cells[0].matchAll(/`(--[A-Za-z0-9_-]+)`/g)].map((m) => m[1]);
    if (names.length !== 1) continue;         // список имён — значение общее, сверять нечего
    const name = names[0];
    if (!PACKAGE_TOKEN.test(name)) continue;
    if (RETIRED.has(name)) {
      errors.push(`${rel(file)}:${index + 1} — таблица «Токены» предписывает ${name}, а он отменён: ${RETIRED.get(name)}`);
      continue;
    }
    if (!declared.has(name)) continue;        // поймано проверкой 2

    const parts = cells[1].split('/').map((part) => part.replace(/[`*]/g, '').trim());
    for (const [order, part] of parts.entries()) {
      if (!VALUE_LIKE.test(part)) continue;   // проза пропускается
      // Слэш во втором столбце значит две разные вещи, и обе законные:
      // «24px / 1.2 / -0.01em» — роль, интерлиньяж и трекинг (тогда
      // сверять надо с --x, --x-lh, --x-ls), а «#5a6c7c / #acb8bf» —
      // тёмное и светлое значение ОДНОГО токена. Различаются они тем,
      // существует ли --x-lh: если суффиксного токена нет, часть
      // сверяется с самим --x по всем его объявлениям.
      const suffixed = order < SUFFIX.length ? name + SUFFIX[order] : null;
      const target = suffixed && declared.has(suffixed) ? suffixed : name;
      const values = declared.get(target);
      checkedValues++;
      if ([...values].some((value) => same(value, part))) continue;
      errors.push(`${rel(file)}:${index + 1} — ${target} в статье «${part}», в ui/ объявлено «${[...values].join('» / «')}»`);
    }
  }
}

if (errors.length) {
  console.error('Расхождения по токенам:\n');
  for (const error of errors) console.error('  ' + error);
  console.error(`\nВсего: ${errors.length}.`);
  process.exit(1);
}

console.log(`Проверено ссылок на токены: ${checkedRefs} в ${cssFiles.length} файлах CSS и ${articles.length} статьях.`);
console.log(`Сверено значений в таблицах «Токены»: ${checkedValues}. Объявлено имён: ${declared.size}.`);
