/**
 * Ищет классы, которые есть в разметке, но не определены ни в одном CSS.
 *
 * Зачем. `ui/utilities.css` — не весь Tailwind, а только те правила, что
 * встретились в разметке Career. Валидная утилита вроде `gap-5` или `md:flex`
 * в нём отсутствует, поэтому не применяется — молча, без ошибки в консоли.
 * Верстая новое, на это наступают регулярно.
 *
 * Запуск:
 *   node tools/validate-classes.mjs                    # витрины пакета
 *   node tools/validate-classes.mjs путь/к/фиче.html    # своя разметка
 *
 * Своя разметка проверяется только против `ui/`: если класс не нашёлся там,
 * на странице с одним `career.css` он не сработает.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const own = args.length > 0;
const htmlFiles = own ? args : ['showcase/components.html', 'showcase/pages.html'];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const cssFiles = [
  ...walk('ui').filter(file => file.endsWith('.css')),
  ...(own ? [] : ['showcase/components.css', 'showcase/pages.css']),
];

// Базовая линия: классы, уже не имеющие правила. Выводятся предупреждением,
// чтобы не мешать поймать новые. Причина у каждого — в самом файле.
const known = own ? {} : JSON.parse(fs.readFileSync('tools/known-missing-classes.json', 'utf8'));

// Классы, объявленные в CSS. Экранирование Tailwind (`.md\:flex`, `.w-\[52px\]`)
// снимается, чтобы сравнивать с тем видом, в котором класс стоит в разметке.
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
  // <style> внутри разметки — тоже определение: так, например, объявлен spinner
  // внутри встроенного SVG.
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
  console.warn(`Известные пробелы (${baseline.length}) — см. tools/known-missing-classes.json:`);
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
  console.error('\nЕсли это утилита Tailwind — её нет в ui/utilities.css, и на странице');
  console.error('она не сработает. Допишите правило или обойдитесь имеющимися.');
  process.exit(1);
}

console.log(`Checked ${used.size} classes in ${htmlFiles.length} file(s) against ${cssFiles.length} stylesheets.` + (baseline.length ? ` No new undefined classes (${baseline.length} known gaps).` : ' All defined.'));
