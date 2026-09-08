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
 *    правила: оболочка витрины обязана целиком лежать под своим префиксом,
 *    а `ui/` — не знать о ней ничего.
 *
 *      showcase/*.css   в каждом отдельном селекторе (по обе стороны любого
 *                        комбинатора — потомок, `>`, `+`, `~` — и в любом
 *                        составном classname.classname на одном элементе)
 *                        каждый класс несёт `doc-`; тег, `:pseudo`,
 *                        `[атрибут]`, `*` классом не считаются и это
 *                        требование к ним не относится, но селектор без
 *                        единого класса (`body`, `button, input, a`) —
 *                        тоже протечка: упрекнуть некого, но и подтвердить
 *                        нечем, кроме исключения `:root`
 *      ui/**\/*.css      ни одного класса `doc-*`, ни одного `--doc-*`
 *                        (объявленного или использованного — в значении
 *                        свойства, в `@property`, в параметрах любого
 *                        at-rule вроде `@custom-media`)
 *
 * Механизм — настоящий CSS-парсер (`postcss`), а не ручной регексп/разбор
 * скобок. Три независимых итерации ревью R0-06 нашли четыре обхода именно
 * механизма самодельного разбора: инлайновый `<style>` не проверялся;
 * составной селектор засчитывался по «хотя бы один» класс вместо «каждого»;
 * белый список at-rules пропускал `@container`; CSS-экранирование
 * (`\6c`, `\64` — hex/unicode-escape) обходило разбор в обе стороны. Ручной
 * разбор скобок вдобавок структурно не может отличить `{`/`}`/`;` внутри
 * строки (`[data-x="a{b}"]`, `@import url("a;b.css")`) от настоящих границ
 * правила — это разбирает `postcss` по построению, а не как побочный
 * эффект регулярного выражения. Списки классов внутри селектора разбирает
 * `postcss-selector-parser` — он же снимает CSS-экранирование как часть
 * своей обычной работы, без отдельного `UNESCAPE`.
 *
 * `root.walkRules()` у `postcss` рекурсивно обходит тело любого at-rule
 * произвольной вложенности (`@media`, `@supports`, `@layer`, `@container`,
 * `@scope`, `@starting-style` и любой будущий at-rule с таким же телом) —
 * специального списка/исключения для рекурсии не нужно вовсе. Единственное
 * настоящее исключение — правила внутри `@keyframes`: `postcss` создаёт для
 * `0%`/`50%`/`from`/`to` такие же узлы Rule, но это не селекторы элементов
 * и в них никогда не бывает классов; такие узлы пропускаются по признаку
 * «есть предок at-rule с именем `keyframes`», а не по имени текущего
 * at-rule. `@font-face`, `@page`, `@property` вообще не порождают узлов
 * Rule (их тело — плоские объявления или, у `@page`, служебные селекторы
 * вида `:first`/`@top-left`, которые `postcss` не считает Rule), поэтому
 * им не нужно никакое отдельное исключение.
 *
 * Проверка нужна именно механическая. Образец
 * `career/showcase/components.css` держит префикс только у переменных:
 * 100 селекторов там без префикса, среди них `.layout`, `.main`, `.nav`,
 * `.callout`, `.hint`, `.legend`. Внимание автора этот инвариант не
 * удержало ни разу, и вторая проверка стоит здесь, чтобы не удерживать
 * его внимание и в Курсах.
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
 * имена классов берутся из селекторов настоящим CSS-парсером, а не из
 * всего текста регулярным выражением; базовая линия известных пробелов
 * необязательна.
 *
 * Регрессионные пробы на все четыре обхода трёх итераций ревью R0-06 и на
 * новые углы парсерного подхода — `tools/validate-classes.selftest.mjs`
 * (`node tools/validate-classes.selftest.mjs`).
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

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

// -------------------------------------------------------------------------
// Разбор CSS настоящим парсером. `parseCss` не глотает ошибку молча и не
// прерывает работу всего инструмента ради одного файла: сломанный CSS —
// это находка (`parseErrors`, ниже), а не тихий пропуск проверки. Файл,
// который не разобрался, дальше не участвует ни в одной из проверок этого
// файла — по нему нельзя ни подтвердить, ни опровергнуть METHOD §6.1/§6.2,
// и притворяться, что он «чист», нельзя.
// -------------------------------------------------------------------------
const parseErrors = [];

// Один и тот же CSS-блок (файл `ui/`, файл `showcase/`, инлайновый `<style>`
// конкретной витрины) разбирается несколькими проверками подряд —
// построение набора «класс объявлен где-то» и поиск протечек §6.2 читают
// один и тот же текст. Кеш по подписи (`from`) разбирает каждый блок один
// раз и не печатает одну и ту же ошибку разбора дважды.
//
// Подпись обязана быть уникальной на блок, а не на файл: файла с реальным
// путём (`ui/tokens.css`, `showcase/components.css`) одна на файл — вызывается
// один раз, коллизий нет. Но инлайновых `<style>` в одном HTML-файле может
// быть несколько, и до review-4 R0-06 оба места ниже, что зовут `parseCss`
// для инлайновых блоков, помечали их одинаковым ярлыком `${file} <style>`
// независимо от того, какой это блок по счёту — второй и следующие блоки
// получали закешированный результат первого вместо разбора своего содержимого,
// и протечка в них (METHOD §6.2) не проверялась вовсе. Ярлык инлайнового
// блока обязан включать его порядковый номер в файле (`parseCss` ключуется
// строкой `from`, а не содержимым `css`, — см. ниже).
const parseCache = new Map();

function parseCss(css, from) {
  const key = from ?? css;
  if (parseCache.has(key)) return parseCache.get(key);
  let result;
  try {
    result = postcss.parse(css, from ? { from } : undefined);
  } catch (err) {
    parseErrors.push(`${from ?? 'без имени'}: CSS не разобран настоящим парсером — ${err.message}`);
    result = null;
  }
  parseCache.set(key, result);
  return result;
}

// Узел Rule — потомок at-rule с именем keyframes (с любым вендорным
// префиксом)? Единственное настоящее исключение из «каждый Rule — это
// селектор элемента»: тело @keyframes порождает узлы Rule для `0%`/`50%`/
// `from`/`to`, но это не селекторы, классов там не бывает и требование
// doc-* к ним не относится. Проверяется по предку, а не по имени текущего
// at-rule — так это исключение не может случайно накрыть селектор внутри
// @container/@layer/@supports, вложенного куда угодно.
function isInsideKeyframes(rule) {
  let node = rule.parent;
  while (node && node.type !== 'root') {
    if (node.type === 'atrule' && /^(?:-[\w]+-)?keyframes$/i.test(node.name)) return true;
    node = node.parent;
  }
  return false;
}

const sp = selectorParser();

// Список селекторов (то, что стоит перед `{`, включая запятые верхнего
// уровня) разбирается на отдельные простые селекторы, и для каждого —
// список имён классов, которые встречаются в нём где угодно (по обе
// стороны любого комбинатора, внутри составного classname.classname, внутри
// аргумента функционального псевдокласса вроде :not()/::slotted()).
// postcss-selector-parser снимает CSS-экранирование как часть обычного
// разбора идентификатора — `\6c` и `\64` (hex/unicode-escape) декодируются
// в реальное имя класса той же функцией, что разбирает `\.`/`\:`, а не
// отдельным механизмом, который можно забыть обновить.
function selectorParts(selectorList) {
  let root;
  try {
    root = sp.astSync(selectorList);
  } catch (err) {
    return [{ selector: selectorList.trim(), classes: [], parseError: err.message }];
  }
  return root.nodes.map(selectorNode => {
    const classes = [];
    selectorNode.walkClasses(node => classes.push(node.value));
    return { selector: selectorNode.toString().trim(), classes };
  });
}

// Все имена классов, встречающиеся в селекторах правил файла — для набора
// «класс объявлен где-то в CSS пакета» (METHOD §6.1). Узлы Rule внутри
// @keyframes пропускаются: `0%`/`50%` никогда не несут классов, но это
// не имеет значения для этого набора (пустой вклад в любом случае).
function collectSelectorClasses(css, from) {
  const root = parseCss(css, from);
  const names = new Set();
  if (!root) return names;
  root.walkRules(rule => {
    if (isInsideKeyframes(rule)) return;
    for (const part of selectorParts(rule.selector)) {
      for (const name of part.classes) names.add(name);
    }
  });
  return names;
}

// Селекторы, которым не нужен класс doc-: `:root` несёт только переменные
// оболочки (--doc-*), а не правило, применяющееся к элементу.
const SELECTOR_EXEMPT_FROM_PREFIX = new Set([':root']);

// Каждый отдельный селектор оболочки витрины обязан содержать класс doc-* —
// а не файл в целом и не «хотя бы один класс из тех, что нашлись». Критерий:
// «классы в этом селекторе есть, и каждый из них несёт doc-» — селектор без
// единого класса (`button, input, a`) значит «упрекнуть некого, но и
// подтвердить нечем», и тоже считается протечкой (кроме :root).
function selectorLeaks(css, label) {
  const found = [];
  const root = parseCss(css, label);
  if (!root) return found;
  root.walkRules(rule => {
    if (isInsideKeyframes(rule)) return;
    for (const part of selectorParts(rule.selector)) {
      if (part.parseError) {
        found.push(`${label}: селектор не разобран (${part.parseError}) — ${part.selector}`);
        continue;
      }
      if (SELECTOR_EXEMPT_FROM_PREFIX.has(part.selector)) continue;
      const hasDocClass = part.classes.length > 0 && part.classes.every(name => name.startsWith('doc-'));
      if (!hasDocClass) {
        // Селектор с CSS-экранированием (\6c, \64, \.) печатается как в
        // исходнике, но рядом — уже раскрытые имена классов: то, что
        // сохраняется в исходнике под экранированием, не должно требовать
        // от читателя отчёта самому раскрывать hex/unicode-escape в уме,
        // чтобы увидеть, какой класс реально не несёт doc- (review-3,
        // находка 1 — обход держался именно на том, что это раскрытие
        // никто не делал).
        const decoded = part.selector.includes('\\') && part.classes.length
          ? ` (классы после разбора: ${part.classes.join(', ')})`
          : '';
        found.push(`${label}: селектор без класса витрины doc- — ${part.selector}${decoded}`);
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
  for (const name of collectSelectorClasses(fs.readFileSync(file, 'utf8'), file)) defined.add(name);
}

// Классы, использованные в разметке.
const used = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  // <style> внутри разметки — тоже определение: так, например, объявляют
  // анимацию внутри встроенного SVG.
  //
  // Ярлык несёт порядковый номер блока (`#1`, `#2`, …): двух и более <style>
  // в одном файле с одинаковым ярлыком `parseCss` закешировал бы под одним
  // ключом и разобрал только первый (review-4, находка 1).
  let styleIndex = 0;
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    styleIndex += 1;
    for (const name of collectSelectorClasses(style[1], `${file} <style>#${styleIndex}`)) defined.add(name);
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
// имеет, он про CSS пакета.
for (const file of showcaseFiles.filter(f => fs.existsSync(f))) {
  const html = fs.readFileSync(file, 'utf8');
  // Тот же порядковый номер блока, что и выше в сборе `defined` — обе
  // проверки должны видеть каждый инлайновый <style> как отдельный блок,
  // а не разделять один и тот же кеш-ярлык на несколько разных блоков.
  let styleIndex = 0;
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    styleIndex += 1;
    leaks.push(...selectorLeaks(style[1], `${file} <style>#${styleIndex}`));
  }
}

// ui/**/*.css — ни одного класса doc-*, ни одной переменной --doc-*, ни
// объявленной, ни использованной (в значении свойства через var(), в имени
// @property, в параметрах любого другого at-rule вроде @custom-media).
for (const file of uiCssFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const root = parseCss(raw, file);
  if (!root) continue;

  root.walkRules(rule => {
    for (const part of selectorParts(rule.selector)) {
      for (const name of part.classes) {
        if (name.startsWith('doc-')) {
          leaks.push(`${file}: класс оболочки витрины в продуктовом слое — .${name}`);
        }
      }
    }
  });

  const DOC_VARIABLE = /--doc-[\w-]*/gi;
  root.walkDecls(decl => {
    if (/^--doc-/i.test(decl.prop)) {
      leaks.push(`${file}: переменная оболочки витрины в продуктовом слое — ${decl.prop}`);
    }
    for (const match of decl.value.matchAll(DOC_VARIABLE)) {
      leaks.push(`${file}: переменная оболочки витрины в продуктовом слое — ${match[0]}`);
    }
  });
  root.walkAtRules(atRule => {
    for (const match of (atRule.params || '').matchAll(DOC_VARIABLE)) {
      leaks.push(`${file}: переменная оболочки витрины в продуктовом слое — ${match[0]}`);
    }
  });
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

if (parseErrors.length) {
  console.error(`CSS не разобран настоящим парсером (${parseErrors.length}):\n`);
  for (const err of parseErrors.sort()) console.error(`  ${err}`);
  console.error('\nЭто настоящий CSS-парсер (postcss), а не регэксп по тексту: файл, который');
  console.error('он не разбирает, дальше не проверяется вовсе — по нему нельзя ни подтвердить,');
  console.error('ни опровергнуть METHOD §6.1/§6.2, притворяться, что он «чист», нельзя.\n');
  failed = true;
}

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
