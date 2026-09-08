/**
 * Ищет классы, которые есть в разметке, но не определены ни в одном CSS.
 *
 * Зачем. Разметка пакета — снимок продакшена на Tailwind, а `ui/` содержит
 * только те правила, что мы выписали руками. Валидная утилита вроде `gap-5`
 * или `phone:flex` в `ui/` отсутствует, поэтому не применяется — молча, без
 * ошибки в консоли. Верстая новое, на это наступают регулярно.
 *
 * Второе применение — инвариант METHOD §6.2. Своя разметка проверяется только
 * против `ui/`: если класс спецификации нашёлся лишь в `showcase/*.css`,
 * значит оболочка витрины протекла в компонент, и на пустой странице с одним
 * `ui/courses.css` он не сработает (инвариант копируемости METHOD §6.1).
 *
 * Внимание: скрипт ловит классы **без определения**. Обратное направление —
 * селектор витрины, случайно попавший в `ui/`, — он не ловит; это делает
 * префикс `.doc-` в `showcase/*.css` и ревью. См. tools/README.md.
 *
 * Запуск:
 *   node tools/validate-classes.mjs                    # витрины пакета
 *   node tools/validate-classes.mjs путь/к/фиче.html    # своя разметка
 *
 * Перенесён из `career/tools/validate-classes.mjs` (read-only образец).
 * Отличия от образца: витрины ещё нет — скрипт говорит, какой шаг её заводит,
 * и выходит с кодом 2; базовая линия известных пробелов необязательна.
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

const cssFiles = [
  ...walk('ui').filter(file => file.endsWith('.css')),
  ...(own ? [] : walk('showcase').filter(file => file.endsWith('.css'))),
];

// Базовая линия: классы, уже не имеющие правила. Выводятся предупреждением,
// чтобы не мешать поймать новые. Причина у каждого — в самом файле.
// Файла может не быть — тогда базовой линии просто нет.
const baselineFile = 'tools/known-missing-classes.json';
const known = own || !fs.existsSync(baselineFile) ? {} : JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

// Классы, объявленные в CSS. Экранирование Tailwind (`.phone\:flex`,
// `.w-\[52px\]`) снимается, чтобы сравнивать с тем видом, в котором класс
// стоит в разметке.
const SELECTOR = /\.((?:[\w-]|\\.)+)/g;
const UNESCAPE = /\\(.)/g;

const defined = new Set();
for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  for (const match of css.matchAll(SELECTOR)) {
    defined.add(match[1].replace(UNESCAPE, '$1'));
  }
}

// Классы, использованные в разметке.
const used = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  // <style> внутри разметки — тоже определение: так, например, объявляют
  // анимацию внутри встроенного SVG.
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const match of style[1].matchAll(SELECTOR)) defined.add(match[1].replace(UNESCAPE, '$1'));
  }
  for (const match of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const cls of match[1].split(/\s+/)) {
      if (!cls || cls.includes('{')) continue;
      if (!used.has(cls)) used.set(cls, file);
    }
  }
}

const undefinedClasses = [...used].filter(([cls]) => !defined.has(cls));
const missing = undefinedClasses.filter(([cls]) => !(cls in known));
const baseline = undefinedClasses.filter(([cls]) => cls in known);

if (baseline.length) {
  console.warn(`Известные пробелы (${baseline.length}) — см. ${baselineFile}:`);
  for (const [cls] of baseline.sort((a, b) => a[0].localeCompare(b[0]))) {
    console.warn(`  ${cls} — ${known[cls]}`);
  }
  console.warn('');
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
  process.exit(1);
}

console.log(`Checked ${used.size} classes in ${htmlFiles.length} file(s) against ${cssFiles.length} stylesheets.` + (baseline.length ? ` No new undefined classes (${baseline.length} known gaps).` : ' All defined.'));
