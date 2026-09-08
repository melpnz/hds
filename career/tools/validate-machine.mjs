/**
 * Проверяет, что машинный слой не разошёлся с текстом и с CSS.
 *
 * Машинный слой и markdown — две проекции одного пакета. Расходятся они только
 * по ошибке, и заметить это глазами нельзя: оба выглядят правдоподобно.
 *
 * Запуск: node tools/validate-machine.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const EOL = new RegExp(String.fromCharCode(13) + String.fromCharCode(10), 'g');
const read = f => fs.readFileSync(f, 'utf8').replace(EOL, String.fromCharCode(10));
const readJson = f => JSON.parse(read(f));

const problems = [];
const fail = message => problems.push(message);

if (!fs.existsSync('machine/index.json')) {
  console.error('machine/ не собран. Запустите: node tools/build-machine.mjs');
  process.exit(1);
}

const index = readJson('machine/index.json');
const tokens = readJson('machine/tokens.json');
const components = readJson('machine/components.json');
const rules = readJson('machine/rules.json');
const manifest = readJson('components/manifest.json');

/* 1. Компоненты: id в JSON и в manifest совпадают до единого */

const jsonIds = new Set(components.map(c => c.id));
const manifestIds = new Set(manifest.components.map(c => c.id));
for (const id of manifestIds) if (!jsonIds.has(id)) fail(`components.json: нет записи ${id}, а в manifest.json есть`);
for (const id of jsonIds) if (!manifestIds.has(id)) fail(`manifest.json: нет записи ${id}, а в components.json есть`);

/* 2. Каждая запись ссылается на существующие спецификацию и якорь */

const showcase = read('showcase/components.html');
for (const c of components) {
  if (!fs.existsSync(c.spec)) fail(`${c.id}: спецификация ${c.spec} не существует`);
  if (c.anchor) {
    const anchor = c.anchor.split('#')[1];
    if (!showcase.includes(`id="${anchor}"`)) fail(`${c.id}: якоря #${anchor} нет в витрине`);
  }
}

/* 3. Токены: значение в JSON совпадает с CSS */

const css = read('ui/tokens.css');
let tokenCount = 0;
for (const group of Object.values(tokens)) {
  for (const token of Object.values(group)) {
    tokenCount += 1;
    const cssVar = token.$extensions?.guide?.cssVar;
    if (!cssVar) { fail(`токен без cssVar: ${JSON.stringify(token).slice(0, 60)}`); continue; }
    const declared = css.match(new RegExp(`^\\s*${cssVar}:\\s*([^;]+);`, 'm'));
    if (!declared) { fail(`токен ${cssVar} не найден в ui/tokens.css`); continue; }
    const value = declared[1].trim();
    const stated = String(token.$value);
    // Ссылка записана как {group.name} — сверяем с var(--group-name)
    const expected = stated.startsWith('{')
      ? `var(--${stated.slice(1, -1).replace('.', '-')})`
      : stated;
    if (value !== expected) fail(`токен ${cssVar}: в JSON «${expected}», в CSS «${value}»`);
  }
}

/* 4. Правила: каждый id действительно есть в markdown */

const composition = read('docs/guide/composition.md');
const decisions = read('docs/guide/decisions.md');
for (const rule of rules) {
  const source = rule.kind === 'decision-guide' ? decisions : composition;
  if (!source.includes(rule.id)) fail(`правило ${rule.id} есть в rules.json, но не найдено в markdown`);
  if (rule.kind === 'decision-guide' && !rule.confidence) fail(`${rule.id}: не разобрана оценка уверенности`);
  if (rule.kind === 'rule' && !rule.statement) fail(`${rule.id}: пустая формулировка`);
}

/* 5. Разметка ссылается только на классы, определённые в CSS пакета */

const walk = dir => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

const defined = new Set();
const SELECTOR = /\.((?:[\w-]|\\.)+)/g;
const UNESCAPE = /\\(.)/g;
for (const file of walk('ui').filter(f => f.endsWith('.css'))) {
  for (const m of read(file).matchAll(SELECTOR)) defined.add(m[1].replace(UNESCAPE, '$1'));
}
const known = readJson('tools/known-missing-classes.json');

for (const c of components) {
  if (!c.markup) continue;
  for (const m of c.markup.html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (!cls || defined.has(cls) || cls in known) continue;
      fail(`${c.id}: в markup класс «${cls}» не определён ни в одном CSS слоя ui/`);
    }
  }
}

/* 6. Счётчики в index.json не разошлись с содержимым */

const actual = {
  componentsTotal: components.length,
  componentsComplete: components.filter(c => c.status === 'complete').length,
  rules: rules.filter(r => r.kind === 'rule').length,
  decisionGuides: rules.filter(r => r.kind === 'decision-guide').length,
  tokens: tokenCount,
};
for (const [key, value] of Object.entries(actual)) {
  if (index.coverage[key] !== value) fail(`index.json: coverage.${key} = ${index.coverage[key]}, на самом деле ${value}`);
}

/* ------------------------------------------------------------------ итог */

if (problems.length) {
  console.error(`Машинный слой разошёлся с источниками (${problems.length}):\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nПересоберите: node tools/build-machine.mjs — или исправьте источник.');
  process.exit(1);
}

console.log('Machine layer is consistent with sources.');
console.log(`  components ${actual.componentsTotal} (${components.filter(c => c.markup).length} с разметкой)`);
console.log(`  rules ${actual.rules} + ${actual.decisionGuides} decision guides`);
console.log(`  tokens ${actual.tokens}`);
