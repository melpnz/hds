/**
 * Правило Ф-3 (решение владельца Р-8): радиус поля ввода не может быть
 * больше радиуса кнопки. Одинаковыми быть могут.
 *
 * Зачем отдельный скрипт. Правило межэлементное: оно ничего не утверждает
 * о кнопке и ничего — о поле, оно утверждает про их пару. Ни одна из
 * существующих проверок пакета такую пару не видит: validate-classes
 * сверяет разметку витрин со стилями, validate-normative — происхождение
 * значения, validate-blocks — реестр блоков против CSS и статей. Соотношение
 * двух чисел из двух разных правил не проверяет никто, а нарушить его проще
 * всего: достаточно поправить один модификатор и не вспомнить про второй.
 *
 * Правило в источнике не измерялось. Оно РЕШЕНИЕ, а не наблюдение: в 18
 * макетах встречаются и поле с радиусом 40 при кнопке 0, и кнопка 90 при
 * поле 16 — источник соотношения не держит. Поэтому скрипт сторожит канон
 * пакета (GUIDE §9, Ф-3), а не факт источника, и говорит об этом вслух.
 *
 * -------------------------------------------------------------------------
 * МЕХАНИКА
 * -------------------------------------------------------------------------
 * 1. Ступени лестницы Р-7 (0 · 6 · 16 · пилюля) читаются из ui/tokens.css
 *    как --core-radius-step-*. Нет хотя бы одной — падение: сравнивать
 *    не с чем, и молчаливый зелёный ноль на пустой лестнице был бы враньём.
 *
 * 2. Из ui/blocks/ * .css берутся правила, чей селектор — ровно один класс
 *    вида `.button…` или `.form-field…`, и у которых объявлен border-radius.
 *    Значение раскрывается через var() по токенам; пилюля (999px и выше)
 *    сравнивается как самая верхняя ступень.
 *
 * 3. Пара ищется по суффиксу имени класса:
 *
 *      .form-field-input   → .button          базовая пара
 *      .form-field-r16     → .button-r16      одинаковый суффикс
 *      .form-field-r8      → .button          пары нет, сравнивается с базой
 *
 *    Кнопка базового правила — верхняя граница для любого поля, у которого
 *    именованной пары нет. Это не смягчение: базовая кнопка стоит на верхней
 *    ступени лестницы, и поле, которое её перерастает, нарушает правило
 *    при любом прочтении.
 *
 * Чего скрипт не умеет: он не судит, красив ли радиус, и не сверяет его
 * с узлом Figma. Он отвечает на один вопрос — не переросло ли поле кнопку.
 *
 * Запуск: node tools/validate-radius.mjs
 *
 * Коды возврата: 0 — сошлось; 1 — правило Ф-3 нарушено или лестница
 * неполна; 2 — проверять нечего: ни одного правила с border-radius
 * у кнопки и поля.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, ' ');

const PILL = 999;

// -------------------------------------------------------------------------
// Токены. Значение переменной считается числовым, если разворачивается
// в px или в 0; всё остальное в счёт не идёт.
// -------------------------------------------------------------------------
const tokensFile = path.join(root, 'ui', 'tokens.css');
if (!fs.existsSync(tokensFile)) {
  console.error('Нет ui/tokens.css — лестницу Р-7 читать не из чего.');
  process.exit(1);
}
const tokenSource = strip(fs.readFileSync(tokensFile, 'utf8'));
const tokens = new Map();
for (const match of tokenSource.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
  // Первое объявление — тёмная тема, она же контракт имён. Светлая тема
  // перекрывает цвета, но не радиусы, и в счёт здесь не идёт.
  if (!tokens.has(match[1])) tokens.set(match[1], match[2].trim());
}

const resolve = (raw, depth = 0) => {
  if (depth > 8) return null;
  const value = String(raw).trim();
  const varMatch = value.match(/^var\(\s*(--[\w-]+)\s*(?:,([^)]*))?\)$/);
  if (varMatch) {
    const next = tokens.get(varMatch[1]) ?? (varMatch[2] ?? null);
    return next === null ? null : resolve(next, depth + 1);
  }
  if (/^0$/.test(value)) return 0;
  const px = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (px) return Number(px[1]);
  const pct = value.match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) return Number(pct[1]) >= 50 ? PILL : null;
  return null;
};

const ladder = [
  ['--core-radius-step-0', '0'],
  ['--core-radius-step-6', '6 — импорт из дизайн-системы Хабра'],
  ['--core-radius-step-16', '16'],
  ['--core-radius-step-pill', 'пилюля'],
];
const missing = ladder.filter(([name]) => resolve(`var(${name})`) === null);
if (missing.length > 0) {
  console.error('Каноническая лестница Р-7 неполна. Не читаются ступени:');
  for (const [name, label] of missing) console.error(`  ${name} (${label})`);
  console.error('');
  console.error('Лестница объявляется в ui/tokens.css, слой ядра. GUIDE §9, Ф-2.');
  process.exit(1);
}

// -------------------------------------------------------------------------
// Правила. Берётся только селектор из одного класса: `.button-r16` — да,
// `.hero .button` — нет. Составной селектор задаёт геометрию блока,
// а не ступень примитива.
// -------------------------------------------------------------------------
const cssDir = path.join(root, 'ui', 'blocks');
const cssFiles = fs.existsSync(cssDir)
  ? fs.readdirSync(cssDir).filter((name) => name.endsWith('.css')).map((name) => path.join(cssDir, name))
  : [];

const buttons = new Map(); // суффикс имени класса → запись правила
const fields = new Map();
let seen = 0;

for (const file of cssFiles) {
  const css = strip(fs.readFileSync(file, 'utf8'));
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const radii = [...rule[2].matchAll(/(?:^|;)\s*border-radius\s*:\s*([^;]+)/g)];
    if (radii.length === 0) continue;
    const raw = radii[radii.length - 1][1].trim();
    // Запись из четырёх углов сравнивать одним числом нельзя.
    if (/\s/.test(raw) && !/^var\(/.test(raw)) continue;
    for (const selector of rule[1].split(',').map((part) => part.trim())) {
      const button = selector.match(/^\.button([\w-]*)$/);
      const field = selector.match(/^\.form-field([\w-]*)$/);
      if (!button && !field) continue;
      const value = resolve(raw);
      if (value === null) continue;
      seen += 1;
      const entry = { value, raw, selector, file: rel(file) };
      if (button) buttons.set(button[1], entry);
      else fields.set(field[1], entry);
    }
  }
}

if (seen === 0) {
  console.error('Ни одного правила с border-radius у .button и .form-field — проверять нечего.');
  console.error('Примитивы заводит волна R1, ui/blocks/primitives.css.');
  process.exit(2);
}

const base = buttons.get('');
if (!base) {
  console.error('Нет базового правила .button с border-radius: не с чем сравнивать поля,');
  console.error('у которых именованной пары среди кнопок нет.');
  process.exit(1);
}

const name = (value) => (value >= PILL ? 'пилюля' : String(value));
const show = (entry) => `${entry.selector} = ${entry.raw} → ${name(entry.value)}`;

const violations = [];
const checked = [];
for (const [suffix, field] of [...fields].sort((a, b) => a[0].localeCompare(b[0]))) {
  const pairSuffix = suffix === '-input' ? '' : suffix;
  const button = buttons.get(pairSuffix) ?? base;
  const pairedBy = suffix === '-input'
    ? 'база'
    : (buttons.has(pairSuffix) ? 'суффикс' : 'пары нет, база');
  checked.push({ field, button, pairedBy });
  if (field.value > button.value) violations.push({ field, button });
}

for (const { field, button, pairedBy } of checked) {
  const mark = field.value > button.value
    ? 'НАРУШЕНИЕ'
    : (field.value === button.value ? 'равно    ' : 'ок       ');
  console.log(`${mark}  ${show(field).padEnd(56)} против ${show(button).padEnd(50)} (${pairedBy})`);
}

if (violations.length > 0) {
  console.error('');
  console.error(`Правило Ф-3 нарушено: ${violations.length}.`);
  for (const { field, button } of violations) {
    console.error(`  ${field.selector} (${name(field.value)}) > ${button.selector} (${name(button.value)}) — ${field.file}`);
  }
  console.error('');
  console.error('Радиус поля ввода не может быть больше радиуса кнопки; одинаковыми');
  console.error('быть могут. Решение владельца Р-8, GUIDE §9 Ф-3, blocks/form-field.md.');
  console.error('Чинится ступенью лестницы Р-7 у поля, а не расширением правила.');
  process.exit(1);
}

console.log('');
console.log(`Правило Ф-3 (Р-8): проверено пар ${checked.length}, нарушений 0.`);
console.log('Лестница Р-7: 0 · 6 · 16 · пилюля, ступени читаются из ui/tokens.css.');
process.exit(0);
