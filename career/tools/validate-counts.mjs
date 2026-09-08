/**
 * Сверяет числа, заявленные в документации, с тем, что реально в пакете.
 *
 * Зачем. Счётчики — компонентов, спецификаций, переменных, иконок — записаны
 * в прозе в десятке мест и правятся руками. После любой правки пакета они
 * расходятся молча: документация продолжает утверждать старое число, и по нему
 * судят о покрытии.
 *
 * Запуск: node tools/validate-counts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const read = file => fs.readFileSync(file, 'utf8');
const count = (text, re) => (text.match(re) || []).length;

const utilities = read('ui/utilities.css');
const componentCss = walk('ui/components').filter(f => f.endsWith('.css')).map(read).join('\n');

const actual = {
  manifest: JSON.parse(read('components/manifest.json')).components.length,
  specs: walk('components').filter(f => f.endsWith('.md') && path.dirname(f) !== 'components').length,
  tokens: count(read('ui/tokens.css'), /^\s*--[\w-]+:/gm),
  utilities: count(utilities, /\{/g) - count(utilities, /@[a-z-]+[^{]*\{/g),
  cssSections: count(componentCss, /источник:/g),
  iconsSprite: fs.readdirSync('ui/assets/icons/single/sprite').length,
  iconsSingle: walk('ui/assets/icons/single').filter(f => f.endsWith('.svg')).length,
  iconsPack: fs.readdirSync('ui/assets/icons/pack').filter(f => f.endsWith('.svg')).length,
  illustrations: fs.readdirSync('ui/assets/illustrations').filter(f => f.endsWith('.svg')).length,
};

// Что где заявлено. Регулярное выражение обязано иметь одну группу — число.
const claims = [
  ['components/INDEX.md', /\*\*(\d+) спецификаци/, 'specs'],
  ['docs/development/installation.md', /(\d+) переменная `:root`/, 'tokens'],
  ['docs/development/installation.md', /(\d+) правил Tailwind/, 'utilities'],
  ['docs/development/installation.md', /(\d+) секции настоящего CSS/, 'cssSections'],
  ['docs/guide/design.md', /\*\*Цвет\*\* \| (\d+) переменная/, 'tokens'],
  ['README.md', /машиночитаемый реестр, (\d+) записи/, 'manifest'],
  ['README.md', /(\d+) переменная :root/, 'tokens'],
  ['README.md', /(\d+) правил Tailwind/, 'utilities'],
  ['ROADMAP.md', /\*\*(\d+)\*\*, все `complete`/, 'manifest'],
  ['ui/assets/README.md', /### `sprite\.svg` — \d+ символов, набор пакета — (\d+)/, 'iconsSprite'],
  ['ui/assets/README.md', /отдельными файлами лежит (\d+)/, 'iconsSingle'],
  ['ui/assets/README.md', /### `pack\/` — объединённый набор, (\d+) иконок/, 'iconsPack'],
];

const problems = [];
for (const [file, re, key] of claims) {
  const match = read(file).match(re);
  if (!match) { problems.push(`${file}: не найдено утверждение для «${key}» — правило проверки устарело`); continue; }
  const stated = Number(match[1]);
  if (stated !== actual[key]) problems.push(`${file}: заявлено ${stated}, на самом деле ${actual[key]} (${key})`);
}

if (problems.length) {
  console.error(`Счётчики разошлись (${problems.length}):\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nПравьте документацию — или правило в tools/validate-counts.mjs,');
  console.error('если изменилась формулировка.');
  process.exit(1);
}

console.log(`Checked ${claims.length} documented counts against the package. All match.`);
console.log(Object.entries(actual).map(([k, v]) => `  ${k}: ${v}`).join('\n'));
