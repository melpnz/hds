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
// .pipeline/inventory.json заводит R0-02. Без него скрипт падал стеком ENOENT
// вместо сообщения (review-3, note 18) — а правила, не зависящие от
// инвентаризации, проверить при этом можно.
const inventoryFile = '.pipeline/inventory.json';
const inventory = fs.existsSync(inventoryFile) ? json(inventoryFile) : null;
const manifestFile = 'components/manifest.json';
const manifest = fs.existsSync(manifestFile) ? json(manifestFile) : null;

// Разбивка реестра по sourceScope: 44 / 5 / 6 написано в components/INDEX.md
// дважды — прозой и таблицей — и не сверялось ни с чем, хотя выводится
// из манифеста одной строкой и ровно того же рода, что 21 число, которое
// этот скрипт уже проверяет (review-3, minor 10). Дыра «INDEX.md против
// manifest.json» этим не закрывается целиком: имя, шаг, категория и вид
// в таблицах INDEX.md по-прежнему ведутся руками и требуют разбора таблиц.
const scopeCount = scope =>
  manifest ? manifest.components.filter(c => c.sourceScope === scope).length : null;

const actual = {
  // Шаг роадмапа — строка таблицы, начинающаяся с идентификатора вида R0-01.
  roadmapSteps: count(roadmap, /^\| R\d-\d{2} \|/gm),
  roadmapR0: count(roadmap, /^\| R0-\d{2} \|/gm),
  elements: inventory ? inventory.elements.length : null,
  pages: inventory ? inventory.pages.length : null,
  unreachable: inventory ? inventory.unreachable.length : null,
  // Категории METHOD §5 в том составе, в каком их использует реестр Курсов:
  // один файл CSS на категорию.
  cssCategories: walk('ui/components').filter(f => f.endsWith('.css')).length,
  // Объявления переменных в слое токенов. Считаются именно объявления
  // во всём файле, а не имена и не блок :root: сегодня это одно и то же
  // (один блок :root, 51 объявление, 51 уникальное имя, повторов нет),
  // но заявление, которое правило сторожит, звучит как «переменные :root».
  // Если следующий шаг заведёт @media-переобъявление, правило не на :root
  // или повтор имени, счёт вырастет при верном числе переменных — тогда
  // считать надо будет уникальные имена внутри :root, а не строки файла.
  // Комментарии срезаются до счёта:
  // в tokens.css протокол снятого приводит объявления продукта внутри
  // комментария (мёртвое `--header-height: 112px`, расхождения шкалы),
  // и без этого они попадали бы в счёт наравне с живыми.
  tokens: count(read('ui/tokens.css').replace(/\/\*[\s\S]*?\*\//g, ''), /^\s*--[\w-]+:/gm),
  manifest: manifest ? manifest.components.length : null,
  specs: walk('components').filter(f => f.endsWith('.md') && path.dirname(f) !== 'components').length,
  scopeProduction: scopeCount('production'),
  scopeStorybookOnly: scopeCount('storybook-only'),
  scopeFigmaOnly: scopeCount('figma-only'),
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
  // Число переменных в слое токенов заявлено семью правилами ниже
  // в шести файлах (в BRIEF.md — дважды: таблица §3 и критерий §6 п. 2).
  // Правила заведены на R0-02 (строка долга X-19): до них валидатор, поставленный
  // против числового дрейфа, именно это число не сторожил — и оно успело
  // разойтись, пока приёмка R0-01 правила его в одном месте из пяти.
  ['ui/courses.css', /переменные :root, снятые с продакшена Курсов \((\d+) шт\.\)/, 'tokens'],
  ['ui/tokens.css', /Всего переменных: (\d+)/, 'tokens'],
  ['ROADMAP.md', /\| R0-02 \| `ui\/tokens\.css` — (\d+) переменн/, 'tokens'],
  ['BRIEF.md', /\| Токены \| \d+ переменная \| \*\*(\d+) переменн/, 'tokens'],
  ['BRIEF.md', /`ui\/tokens\.css` содержит все \*\*(\d+)\*\* снятые переменные/, 'tokens'],
  ['README.md', /tokens\.css\s+(\d+) переменная :root/, 'tokens'],
  ['docs/guide/tokens.md', /\| \*\*Переменных\*\* \| (\d+) \|/, 'tokens'],
  ['components/INDEX.md', /\*\*(\d+)\*\* спецификаци/, 'specs'],
  ['components/INDEX.md', /Записей — (\d+)\./, 'manifest'],
  // 44 / 5 / 6 — прозой и таблицей, оба места.
  ['components/INDEX.md', /(\d+) элемента сняты с продакшена, \d+ есть только в Storybook, \d+ —\s*\nтолько в макете/, 'scopeProduction'],
  ['components/INDEX.md', /\d+ элемента сняты с продакшена, (\d+) есть только в Storybook, \d+ —\s*\nтолько в макете/, 'scopeStorybookOnly'],
  ['components/INDEX.md', /\d+ элемента сняты с продакшена, \d+ есть только в Storybook, (\d+) —\s*\nтолько в макете/, 'scopeFigmaOnly'],
  ['components/INDEX.md', /\| `production` \| (\d+) \|/, 'scopeProduction'],
  ['components/INDEX.md', /\| `storybook-only` \| (\d+) \|/, 'scopeStorybookOnly'],
  ['components/INDEX.md', /\| `figma-only` \| (\d+) \|/, 'scopeFigmaOnly'],
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
