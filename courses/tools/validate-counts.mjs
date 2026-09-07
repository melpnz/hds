/**
 * Сверяет числа, заявленные в документации, с тем, что реально в пакете.
 *
 * Зачем. Счётчики — шагов, элементов, страниц, переменных, компонентов —
 * записаны в прозе в десятке мест и правятся руками. После любой правки
 * пакета они расходятся молча: документация продолжает утверждать старое
 * число, и по нему судят о покрытии. На ревью R0-01 это уже случилось:
 * роадмап заявлял 75 шагов при 76 и «R0 — 6» при семи, а README подавал
 * пустой `tokens.css` как «52 переменные, снятые с продакшена».
 *
 * Запуск: node tools/validate-counts.mjs
 *
 * Перенесён из `career/tools/validate-counts.mjs` (read-only образец).
 * Механика та же — таблица «файл · регулярка · ключ». Отличия: свой набор
 * счётчиков (у Курсов ещё нет ни манифеста, ни иконок), и правила для
 * файлов, которых пока нет, пропускаются с пометкой, а не роняют скрипт.
 */
import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const read = file => fs.readFileSync(file, 'utf8');
const count = (text, re) => (text.match(re) || []).length;
const json = file => JSON.parse(read(file));

const roadmap = read('ROADMAP.md');
const inventory = json('.pipeline/inventory.json');
const manifestFile = 'components/manifest.json';

const actual = {
  // Шаг роадмапа — строка таблицы, начинающаяся с идентификатора вида R0-01.
  roadmapSteps: count(roadmap, /^\| R\d-\d{2} \|/gm),
  roadmapR0: count(roadmap, /^\| R0-\d{2} \|/gm),
  elements: inventory.elements.length,
  pages: inventory.pages.length,
  unreachable: inventory.unreachable.length,
  // Категории METHOD §5 в том составе, в каком их использует реестр Курсов:
  // один файл CSS на категорию.
  cssCategories: walk('ui/components').filter(f => f.endsWith('.css')).length,
  tokens: count(read('ui/tokens.css'), /^\s*--[\w-]+:/gm),
  manifest: fs.existsSync(manifestFile) ? json(manifestFile).components.length : null,
  specs: walk('components').filter(f => f.endsWith('.md') && path.dirname(f) !== 'components').length,
};

// Что где заявлено. Регулярное выражение обязано иметь одну группу — число.
// Правило для ещё не существующего файла пропускается: пакет собирается
// волнами, и проверка не должна требовать того, чего шаг ещё не завёл.
const claims = [
  ['README.md', /роадмап на (\d+) шагов/, 'roadmapSteps'],
  ['README.md', /реестр из (\d+) элементов/, 'elements'],
  ['README.md', /инвентаризация: снято (\d+) страниц/, 'pages'],
  ['README.md', /реестр: (\d+) элементов, \d+ страниц, \d+ недостижимых мест/, 'elements'],
  ['README.md', /реестр: \d+ элементов, (\d+) страниц, \d+ недостижимых мест/, 'pages'],
  ['README.md', /реестр: \d+ элементов, \d+ страниц, (\d+) недостижимых мест/, 'unreachable'],
  ['ROADMAP.md', /\| Элементов в реестре \| \*\*(\d+)\*\*/, 'elements'],
  ['ROADMAP.md', /\| Страниц снято \| \*\*(\d+)\*\*/, 'pages'],
  ['ROADMAP.md', /\| Шагов в роадмапе \| \*\*(\d+)\*\* \|/, 'roadmapSteps'],
  ['ROADMAP.md', /\| \*\*R0\*\* \|[^|]*\| (\d+) \|/, 'roadmapR0'],
  ['CHANGELOG.md', /9 волн, (\d+) шагов/, 'roadmapSteps'],
  ['CHANGELOG.md', /реестр: (\d+) элементов по волнам/, 'elements'],
  ['ui/courses.css', /по файлу на категорию METHOD §5/, null], // якорь формулировки, без числа
  ['components/INDEX.md', /\*\*(\d+)\*\* спецификаци/, 'specs'],
];

const problems = [];
const skipped = [];

for (const [file, re, key] of claims) {
  if (!fs.existsSync(file)) { skipped.push(`${file} — файла ещё нет`); continue; }
  const match = read(file).match(re);
  if (!match) { problems.push(`${file}: не найдено утверждение для «${key ?? 'формулировки'}» — правило проверки устарело`); continue; }
  if (key === null) continue;
  if (actual[key] === null) { skipped.push(`${file} → ${key} — считать пока не из чего`); continue; }
  const stated = Number(match[1]);
  if (stated !== actual[key]) problems.push(`${file}: заявлено ${stated}, на самом деле ${actual[key]} (${key})`);
}

if (skipped.length) {
  console.warn(`Пропущено (${skipped.length}) — появится по мере сборки:`);
  for (const s of skipped) console.warn('  ' + s);
  console.warn('');
}

if (problems.length) {
  console.error(`Счётчики разошлись (${problems.length}):\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nПравьте документацию — или правило в tools/validate-counts.mjs,');
  console.error('если изменилась формулировка.');
  process.exit(1);
}

console.log(`Checked ${claims.length - skipped.length} documented counts against the package. All match.`);
console.log(Object.entries(actual).map(([k, v]) => `  ${k}: ${v ?? '—'}`).join('\n'));
