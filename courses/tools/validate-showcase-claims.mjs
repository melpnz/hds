/**
 * Гейт истинности самоутверждений витрины (R0-08).
 *
 * ЗАЧЕМ. Пакет четыре раза подряд опубликовал ложное утверждение витрины
 * о собственном слое `ui/`, и каждый раз это ловил человек, а не гейт:
 *
 *   1. X-73 (R0-03) — два отрицательных утверждения «в корпусе не
 *      встречается» о `desktop:` и `small-phone:text-*` оказались ложными
 *      и прошли вёрстку целиком: отказ от догадки выглядит методологически
 *      безупречно и поэтому не перепроверяется;
 *   2. R2-01 — витрина называла утилиту цвета так, будто она работает
 *      (`text-ui-yellow-500` у звезды рейтинга), а в `ui/` правила нет;
 *      три итерации ревью на одном месте;
 *   3. первая приёмка R0-07 — `showcase/components.html`: «из шести
 *      префиксов `ui/` поднимает только два» при живых
 *      `small-phone:text-center` и `tablet:px-6` с R0-04;
 *   4. вторая приёмка R0-07 — fix-2 починил разметку, но то же
 *      предложение осталось в комментарии `showcase/components.css:705–706`,
 *      в двадцати строках от исправленного места, зелёной строкой того же
 *      диффа. Два ревью и один фикс прошли мимо: ревью-3 смотрело
 *      с 707-й строки.
 *
 * Класс дефекта устойчив ровно потому, что внимание человека направляется
 * на прошлое место ошибки, а следующее проявление садится рядом. Поэтому
 * здесь механизм, а не ещё один пункт чеклиста.
 *
 * ЧТО ПРОВЕРЯЕТСЯ. Утверждения витрины о содержимом `ui/` сверяются
 * с настоящим разбором `ui/`.
 *
 *   носитель 1   showcase/*.html — текст разметки и HTML-комментарии
 *   носитель 2   showcase/*.css  — комментарии CSS
 *   носитель 3   инлайновый <style> витрины — его комментарии
 *
 * Второй носитель обязателен: четвёртое проявление жило именно в нём,
 * и гейт, читающий только разметку, его бы не поймал. Третий добавлен
 * по той же логике на шаг вперёд: на инлайновом `<style>` ровно так же
 * сломался гейт METHOD §6.2 в `validate-classes` (R0-06, review-1).
 *
 * Находка называет строку самой клаузы, а не начало абзаца или
 * комментария. Это не украшение вывода: четвёртое проявление лежало
 * на 705–706, комментарий начинался на 703, ревью смотрело с 707-й —
 * все три числа разные, и гейт, называющий 703, снова отправил бы
 * читателя не туда.
 *
 * КАК РАЗБИРАЕТСЯ `ui/`. `postcss` + `postcss-selector-parser` — тем же
 * механизмом, что `tools/validate-classes.mjs` после R0-06. Регэксп
 * по тексту CSS здесь запрещён по той же причине, по которой он был
 * убран оттуда: пять итераций ревью нашли пять обходов самодельного
 * разбора (инлайновый `<style>`, составной селектор, белый список
 * at-rules, CSS-экранирование, нестабильный кеш). Комментарии CSS витрины
 * достаются `root.walkComments()` — то есть настоящим парсером, а не
 * поиском `/*` по тексту: `/*` внутри строки или `url()` комментарием
 * не является, и разбор это знает по построению.
 *
 * Извлечение текста из HTML сделано построчным сканером тегов
 * (`htmlTokens`), а не регэкспом по форме документа. Это сознательный
 * отказ наследовать X-81: `extractHtmlFences` в `validate-classes.mjs`
 * держится на регэкспе границы блока, три итерации ревью нашли в нём
 * три разные хрупкости к форме текста, и незакрытая граница там до сих
 * пор даёт тихий ноль. Сканер здесь считает строки сам, знает `<script>`
 * и `<style>` как «сырой текст до закрывающего тега», не теряет
 * незакрытый тег молча (текст после него остаётся текстом) и работает
 * одинаково на LF и CRLF.
 *
 * ФОРМА УТВЕРЖДЕНИЯ. Проверяемое утверждение — то, которое называет
 * конкретный класс, префикс, переменную или число из `ui/`. Разбор идёт
 * по клаузам (предложение → части по `;`, ` — `, `:` и запятой перед
 * союзом), потому что все четыре проявления — это одна клауза внутри
 * длинного предложения, а полярность и слой в русском тексте меняются
 * именно на границе клаузы.
 *
 * У каждой клаузы определяются три вещи.
 *
 *   СЛОЙ      `ui` — клауза называет `ui/` (путь `ui/...`, «в слое
 *             пакета», «в подключённом `ui/courses.css`»); `other` —
 *             клауза явно названа о другом слое (сборка, корпус, прод,
 *             разметка страниц, Figma, Tailwind, оболочка витрины,
 *             `docs/`, `career/`); `none` — не сказано. Слой наследуется
 *             слева направо внутри предложения: «Оболочка воспроизводит
 *             их у себя, чтобы… : в `ui/` из шести поднят только
 *             `phone:`» — третья клауза называет `ui/` сама.
 *
 *   ПОЛЯРНОСТЬ  `negative` — отрицание существования: «нет», «ни одного»,
 *             «отсутствует», «ноль», «не объявлен / не определён /
 *             не раскрывается / не встречается / не поднимает /
 *             не протекает». Общие отрицания («не знает», «не имеет»,
 *             «не читаются») сюда намеренно не входят: под ними стоят
 *             утверждения не о содержимом слоя. `exhaustive` — есть
 *             ограничитель (только, лишь, единственный); иначе
 *             `positive`. Полярность, как и слой, наследуется внутри
 *             предложения, но только в клаузу-продолжение перечисления
 *             (начинается союзом или прямо сущностью): «Не раскрываются
 *             … `desktop:`, `tablet-only:`, … и все утилиты `tablet:*`».
 *             Клауза со своим подлежащим и сказуемым начинает новое
 *             утверждение и отрицание не наследует.
 *
 *   СУЩНОСТИ  токены формы класса, префикса и переменной: `--var`,
 *             `.class`, `prefix:utility`, голый `prefix:`, а также любой
 *             токен в `<code>` (HTML) или в обратных кавычках (CSS),
 *             похожий на класс. Токен с хвостом `*` или `…` — шаблон
 *             («все утилиты `tablet:*`», «ни одного селектора `.doc-…`»).
 *
 * Отрицательные утверждения — приоритет задания: именно они ложны во всех
 * четырёх случаях, потому что отрицание проверяется труднее и потому
 * проходит. Поэтому проверка отрицания здесь строгая, а положительное
 * утверждение проверяется мягче: класс, названный положительно, обязан
 * быть в `ui/`, но клауза, у которой слой не назван вовсе, положительным
 * утверждением не считается — иначе гейт начнёт спорить с цитатами прода.
 *
 * ЧТО СЧИТАЕТСЯ НАХОДКОЙ.
 *
 *   claim-negative     клауза о `ui/` отрицает сущность, которая в `ui/` есть
 *   claim-exhaustive   клауза о `ui/` перечисляет «только эти», а в `ui/`
 *                      есть и другие того же вида
 *   claim-positive     клауза о `ui/` называет сущность, которой в `ui/` нет
 *   claim-location     клауза называет файл и строку `ui/`, а правило
 *                      объявлено не там
 *   claim-quantity     число, названное клаузой, не сходится с числом,
 *                      выведенным из разбора `ui/` (таблица QUANTITIES —
 *                      она же закрывает X-90)
 *   claim-unscoped     отрицательное утверждение о названной сущности,
 *                      у которого не назван слой: непроверяемо в принципе,
 *                      и это ровно форма X-73 («в корпусе не встречается»)
 *
 * ЧИСЛА И X-90. Числа раздела «Основания» сторожит этот гейт, а не
 * `validate-counts.mjs`. Обоснование — в `.pipeline/R0-08/capture.md` §5;
 * коротко: `validate-counts` сверяет одно и то же число между текстами
 * («в семи местах написано 51»), а эти числа обязаны сверяться
 * с **разбором `ui/`**, которого у `validate-counts` нет и который туда
 * пришлось бы принести целиком. Разложить один класс дефекта по двум
 * гейтам — воспроизвести ту же ошибку внимания, из-за которой этот шаг
 * и заведён.
 *
 * Число распознаётся двумя способами. Явный — атрибут `data-claim="<id>"`
 * на элементе, чей текст содержит число: точная форма, без разбора прозы,
 * и предпочтительная для нового текста витрины. Неявный — таблица
 * QUANTITIES: у каждой величины есть выражение распознавания, контекст
 * (заголовок раздела витрины) и исключения. Таблица покрывает те числа,
 * которые витрина заявляет сегодня; она перечислена в отчёте `--census`
 * целиком, вместе с выведенным значением, чтобы её можно было прочесть
 * глазами, а не выводить из кода.
 *
 * Запуск:
 *   node tools/validate-showcase-claims.mjs            # проверка
 *   node tools/validate-showcase-claims.mjs --census   # + перепись всего,
 *                                                      # что разобрано
 *
 * Коды возврата: 0 — сошлось; 1 — нашлось расхождение; 2 — проверять
 * нечего (нет витрины или нет `ui/`).
 *
 * Регрессия — `tools/validate-showcase-claims.selftest.mjs`, куда входят
 * все четыре исторических проявления красными пробами на копиях пакета
 * и симметричные зелёные, плюс пробы на форму текста (CRLF, висячий
 * пробел, незакрытый тег, незакрытый комментарий).
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

// В JavaScript `\w` и `\b` — про ASCII, и кириллица для них «не буква»:
// /\bтолько\b/ не находит слово «только» вовсе, а /раскрыва\w*/ обрывается
// на первой же русской букве после стема, из-за чего следующий за ним
// `\s` или граница слова не совпадают. Оба выражения при этом не падают,
// а молча ничего не находят — ровно тот тихий пропуск, против которого
// заведён гейт. Поэтому здесь свои «буква» и «граница слова».
const W = '[A-Za-zА-Яа-яЁё0-9_]';
const BOUND0 = `(?<![A-Za-zА-Яа-яЁё0-9_-])`;
const BOUND1 = `(?![A-Za-zА-Яа-яЁё0-9_-])`;
const ru = (body, flags = 'i') => new RegExp(BOUND0 + '(?:' + body + ')' + BOUND1, flags);

const argv = process.argv.slice(2);
const CENSUS = argv.includes('--census');

// =========================================================================
// 0. Файлы
// =========================================================================

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name).split(path.sep).join('/');
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const uiCssFiles = walk('ui').filter(f => f.endsWith('.css')).sort();
const showcaseHtmlFiles = walk('showcase').filter(f => f.endsWith('.html')).sort();
const showcaseCssFiles = walk('showcase').filter(f => f.endsWith('.css')).sort();

if (uiCssFiles.length === 0) {
  console.error('Продуктового слоя ui/ нет — сверять утверждения не с чем.');
  process.exit(2);
}
if (showcaseHtmlFiles.length === 0 && showcaseCssFiles.length === 0) {
  console.error('Витрины ещё нет. Проверять пока нечего.');
  process.exit(2);
}

// =========================================================================
// 1. Разбор ui/ настоящим парсером
// =========================================================================

const parseErrors = [];

function parseCss(css, from) {
  try {
    return postcss.parse(css, { from });
  } catch (err) {
    parseErrors.push(`${from}: CSS не разобран настоящим парсером — ${err.message}`);
    return null;
  }
}

function isInsideKeyframes(rule) {
  let node = rule.parent;
  while (node && node.type !== 'root') {
    if (node.type === 'atrule' && /^(?:-[\w]+-)?keyframes$/i.test(node.name)) return true;
    node = node.parent;
  }
  return false;
}

const sp = selectorParser();

function selectorClasses(selectorList) {
  let root;
  try {
    root = sp.astSync(selectorList);
  } catch {
    return [];
  }
  const names = [];
  root.walkClasses(node => names.push(node.value));
  return names;
}

function mediaChain(rule) {
  const chain = [];
  let node = rule.parent;
  while (node && node.type === 'atrule') {
    chain.unshift(`@${node.name} ${(node.params || '').trim()}`.trim());
    node = node.parent;
  }
  return chain;
}

// classes: имя → [{ file, line, media }]
// vars:    имя → { file, line, marker }  (объявленные в :root)
// decls:   плоский список объявлений — для числовых величин
const ui = {
  files: uiCssFiles,
  classes: new Map(),
  vars: new Map(),
  decls: [],
};

for (const file of uiCssFiles) {
  const root = parseCss(fs.readFileSync(file, 'utf8'), file);
  if (!root) continue;

  root.walkRules(rule => {
    if (isInsideKeyframes(rule)) return;
    const media = mediaChain(rule);
    const line = rule.source && rule.source.start ? rule.source.start.line : 0;
    for (const name of selectorClasses(rule.selector)) {
      if (!ui.classes.has(name)) ui.classes.set(name, []);
      ui.classes.get(name).push({ file, line, media });
    }
    // Объявления правила — для величин (.gap-12 → gap, .px-6 → padding-left).
    rule.walkDecls(decl => {
      ui.decls.push({
        file,
        line: decl.source && decl.source.start ? decl.source.start.line : 0,
        selector: rule.selector,
        prop: decl.prop,
        value: decl.value,
      });
    });
  });

  // Переменные :root вместе с пометкой в хвостовом комментарии.
  // Продукт помечает каждую переменную одной из трёх пометок либо не
  // помечает вовсе; пометка стоит комментарием после `;`, то есть
  // отдельным узлом Comment сразу за узлом Declaration.
  root.walkRules(rule => {
    if (rule.selector.trim() !== ':root') return;
    rule.each(node => {
      if (node.type !== 'decl' || !node.prop.startsWith('--')) return;
      let marker = null;
      const next = node.next();
      if (next && next.type === 'comment') {
        const sameLine = next.source && node.source
          && next.source.start.line === node.source.start.line;
        const m = /\[([A-Z ]+)\]/.exec(next.text || '');
        if (sameLine && m) marker = m[1].trim();
      }
      ui.vars.set(node.prop, {
        file,
        line: node.source && node.source.start ? node.source.start.line : 0,
        marker,
      });
    });
  });
}

if (parseErrors.length) {
  console.error(`CSS слоя ui/ не разобран настоящим парсером (${parseErrors.length}):\n`);
  for (const e of parseErrors.sort()) console.error(`  ${e}`);
  console.error('\nПока ui/ не разбирается, ни одно утверждение витрины о нём');
  console.error('ни подтвердить, ни опровергнуть нельзя.');
  process.exit(1);
}

// =========================================================================
// 2. Величины, выведенные из разбора ui/ (закрывают X-90)
// =========================================================================

const BP_PREFIXES = ['small-phone', 'phone', 'phablet-and-tablet', 'tablet-only', 'tablet', 'desktop'];

// Ступени типографической шкалы — те `.text-*`, что объявляют и font-size,
// и line-height одним правилом (это и есть определение ступени в
// docs/guide/typography.md); утилиты вроде .text-center сюда не попадают,
// потому что кегля не задают.
function scaleSteps() {
  const steps = new Set();
  for (const d of ui.decls) {
    if (d.prop !== 'font-size') continue;
    for (const name of selectorClasses(d.selector)) {
      if (!/^text-/.test(name)) continue;
      const hasLh = ui.decls.some(x => x.selector === d.selector && x.prop === 'line-height');
      if (hasLh) steps.add(name);
    }
  }
  return steps;
}

function prefixedUiClasses() {
  const out = [];
  for (const [name, places] of ui.classes) {
    const prefix = BP_PREFIXES.find(p => name.startsWith(p + ':'));
    if (prefix) out.push({ name, prefix, places });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// rem → px. Продукт задаёт html{font-size:16px} (ui/foundations.css); если
// слой перестанет это делать или скажет другое, величины в rem перестают
// быть выводимыми, и это находка, а не молчаливое допущение 16.
function remBase() {
  const hits = ui.decls.filter(d => d.prop === 'font-size' && /(^|,)\s*(html|:root)\s*($|,)/.test(d.selector));
  const px = hits.map(d => /^([\d.]+)px$/.exec(d.value.trim())).filter(Boolean).map(m => Number(m[1]));
  const uniq = [...new Set(px)];
  return uniq.length === 1 ? uniq[0] : null;
}

const REM = remBase();

function lengthOf(className, prop) {
  const places = ui.decls.filter(d => selectorClasses(d.selector).includes(className) && d.prop === prop);
  if (places.length === 0) return null;
  const values = [...new Set(places.map(p => p.value.trim()))];
  if (values.length !== 1) return null;
  const v = values[0];
  let m = /^([\d.]+)px$/.exec(v);
  if (m) return Number(m[1]);
  m = /^([\d.]+)rem$/.exec(v);
  if (m && REM !== null) return Number(m[1]) * REM;
  return null;
}

function manifestPrefixCount() {
  const file = 'components/manifest.json';
  if (!fs.existsSync(file)) return null;
  try {
    const m = JSON.parse(fs.readFileSync(file, 'utf8'));
    const p = m && m.breakpoints && m.breakpoints.prefixes;
    return p ? Object.keys(p).length : null;
  } catch {
    return null;
  }
}

const prefClasses = prefixedUiClasses();
const steps = scaleSteps();
const vars = [...ui.vars.entries()];
const uiRulePlaces = new Set();
const uiMedia = new Set();
for (const c of prefClasses) {
  for (const pl of c.places) {
    uiRulePlaces.add(`${pl.file}:${pl.line}`);
    uiMedia.add(pl.media.join(' / '));
  }
}

const DERIVED = {
  'vars.total': vars.length,
  'vars.color': vars.filter(([n]) => n.startsWith('--color-')).length,
  'vars.noncolor': vars.filter(([n]) => !n.startsWith('--color-')).length,
  'vars.live': vars.filter(([, v]) => v.marker === null).length,
  'vars.noMarkup': vars.filter(([, v]) => v.marker === 'NO MARKUP').length,
  'vars.unreferenced': vars.filter(([, v]) => v.marker === 'UNREFERENCED').length,
  'vars.runtime': vars.filter(([, v]) => v.marker === 'RUNTIME').length,
  'scale.steps': steps.size,
  'bp.prefixes.total': manifestPrefixCount(),
  'bp.prefixes.ui': new Set(prefClasses.map(c => c.prefix)).size,
  'bp.classes.ui': prefClasses.length,
  'bp.rules.ui': uiRulePlaces.size,
  'bp.media.ui': uiMedia.size,
  'container.maxWidth': lengthOf('max-w-[1124px]', 'max-width'),
  'container.padding': lengthOf('px-6', 'padding-left'),
  'grid.gap': lengthOf('gap-12', 'gap'),
  'grid.paddingTop': lengthOf('pt-10', 'padding-top'),
  'grid.paddingBottom': lengthOf('pb-10', 'padding-bottom'),
};
DERIVED['container.zone'] =
  DERIVED['container.maxWidth'] !== null && DERIVED['container.padding'] !== null
    ? DERIVED['container.maxWidth'] - 2 * DERIVED['container.padding']
    : null;

// Числительные словами — витрина пишет числа и цифрами, и словами
// («Сорок одна цветовая переменная», «Двадцать шесть живых»), и вторая
// форма встречается ровно там, где стоят проверяемые числа.
const NUM_WORDS = new Map(Object.entries({
  ноль: 0, один: 1, одна: 1, одно: 1, одного: 1, одну: 1, одной: 1, одним: 1,
  два: 2, две: 2, двух: 2, двум: 2, двумя: 2,
  три: 3, трёх: 3, трех: 3, трём: 3, трем: 3, тремя: 3,
  четыре: 4, четырёх: 4, четырёх: 4, четырех: 4, четырьмя: 4,
  пять: 5, пяти: 5, пятью: 5,
  шесть: 6, шести: 6, шестью: 6,
  семь: 7, семи: 7, семью: 7,
  восемь: 8, восьми: 8, восемью: 8, восьмью: 8,
  девять: 9, девяти: 9, девятью: 9,
  десять: 10, десяти: 10, десятью: 10,
  одиннадцать: 11, одиннадцати: 11,
  двенадцать: 12, двенадцати: 12,
  тринадцать: 13, тринадцати: 13,
  четырнадцать: 14, четырнадцати: 14,
  пятнадцать: 15, пятнадцати: 15,
  шестнадцать: 16, шестнадцати: 16,
  семнадцать: 17, семнадцати: 17,
  восемнадцать: 18, восемнадцати: 18,
  девятнадцать: 19, девятнадцати: 19,
  двадцать: 20, двадцати: 20,
  тридцать: 30, тридцати: 30,
  сорок: 40, сорока: 40,
  пятьдесят: 50, пятидесяти: 50,
  шестьдесят: 60, шестидесяти: 60,
  семьдесят: 70, семидесяти: 70,
  восемьдесят: 80, восьмидесяти: 80,
  девяносто: 90, девяноста: 90,
}));

const TENS = new Set([20, 30, 40, 50, 60, 70, 80, 90]);

// «сорок одна» → 41, «двадцать шесть» → 26, «пятьдесят одна» → 51.
function readNumber(text) {
  const digits = /^\d+$/.exec(text.trim());
  if (digits) return Number(digits[0]);
  const words = text.toLowerCase().trim().split(/\s+/).map(w => NUM_WORDS.get(w));
  if (words.some(w => w === undefined)) return null;
  if (words.length === 1) return words[0];
  if (words.length === 2 && TENS.has(words[0]) && words[1] < 10) return words[0] + words[1];
  return null;
}

// Выражение, которым число ищется в тексте: цифры либо одно-два слова.
const NUM_RE_SRC = '(\\d+|(?:[А-Яа-яЁё]+(?:\\s+[А-Яа-яЁё]+)?))';

/**
 * Таблица величин. У каждой строки:
 *   id       — ключ DERIVED
 *   re       — выражение по тексту клаузы; группа 1 — число
 *   context  — (необязательно) выражение по «заголовок + текст клаузы»;
 *              без совпадения строка не применяется
 *   unless   — (необязательно) выражение-исключение по тому же контексту
 *
 * Строки перебираются сверху вниз, применяется первая подошедшая: более
 * узкие («цветовых», «живых») стоят выше общей («переменных»).
 */
const QUANTITIES = [
  {
    id: 'vars.color',
    re: new RegExp(NUM_RE_SRC + `\\s+цветов${W}*(?:\\s+переменн${W}*)?`, 'i'),
  },
  {
    // Обратный порядок — пара <dt>из них цветовых</dt><dd>41</dd>.
    id: 'vars.color',
    re: new RegExp(`цветов${W}*\\s*` + NUM_RE_SRC, 'i'),
    context: /переменн|:root|tokens\.css|палитр/i,
  },
  {
    id: 'vars.unreferenced',
    re: new RegExp('unreferenced\\s*' + NUM_RE_SRC, 'i'),
  },
  {
    id: 'vars.runtime',
    re: new RegExp('runtime\\s*' + NUM_RE_SRC, 'i'),
  },
  {
    id: 'vars.live',
    re: new RegExp(NUM_RE_SRC + `\\s+живы${W}*(?:\\s+переменн${W}*)?`, 'i'),
    context: /переменн|:root|tokens\.css|палитр/i,
    unless: /ступен|шкал/i,
  },
  {
    id: 'vars.noMarkup',
    re: new RegExp(NUM_RE_SRC + `\\s+объявлен${W}*\\s+в\\s+сборке`, 'i'),
  },
  {
    id: 'vars.noncolor',
    re: new RegExp(NUM_RE_SRC + `\\s+(?:остальны|нецветов)${W}*`, 'i'),
    context: /переменн|:root|tokens\.css/i,
  },
  {
    id: 'vars.total',
    re: new RegExp(NUM_RE_SRC + `\\s+переменн${W}*\\s*(?::root|в\\s*:root)`, 'i'),
    unless: /поздний блок|семантическ/i,
  },
  {
    id: 'vars.total',
    re: new RegExp(`переменн${W}*\\s*:root\\s*` + NUM_RE_SRC, 'i'),
  },
  {
    id: 'scale.steps',
    re: new RegExp(NUM_RE_SRC + `\\s+(?:живых\\s+)?ступен${W}*`, 'i'),
    context: /шкал|типографи|foundations\.css/i,
    unless: /цвет|палитр|син[а-яё]+\s+шкал|нейтральн|статусн|оттенк|прозрачн/i,
  },
  {
    id: 'scale.steps',
    re: new RegExp(`ступен${W}*\\s*` + NUM_RE_SRC + '\\s*$', 'i'),
    context: /шкал|типографи|foundations\.css/i,
    unless: /цвет|палитр|нейтральн|статусн|оттенк/i,
  },
  {
    id: 'bp.prefixes.total',
    re: new RegExp('(?:из\\s+)?' + NUM_RE_SRC + `\\s+(?:условий|префикс${W}*)\\s*(?:сборк${W}*)?`, 'i'),
    context: /префикс|брейкпоинт|условий сборки/i,
  },
  {
    id: 'bp.prefixes.ui',
    re: new RegExp(`поднима${W}*\\s+(?:только\\s+|лишь\\s+)?` + NUM_RE_SRC, 'i'),
  },
  {
    id: 'bp.classes.ui',
    re: new RegExp('всего\\s+' + NUM_RE_SRC + `\\s+класс${W}*`, 'i'),
  },
  {
    id: 'bp.rules.ui',
    re: new RegExp(NUM_RE_SRC + `\\s+различн${W}*\\s+правил${W}*`, 'i'),
  },
  {
    id: 'bp.media.ui',
    re: new RegExp(NUM_RE_SRC + `\\s+медиазапрос${W}*`, 'i'),
    context: /ui\/|префикс/i,
  },
  {
    id: 'grid.gap',
    re: /gap-12\s*(?:=|—|-)\s*(\d+)\s*px/i,
  },
  {
    id: 'grid.paddingTop',
    re: /pt-10\s*(?:\/|·|,)?\s*pb-10\s*(?:=|—|-)\s*(\d+)\s*px/i,
  },
  {
    id: 'container.maxWidth',
    re: /max-width\s*[:—-]?\s*(\d+)\s*px/i,
    context: /контейнер|max-w-\[|1124|зона\s+содержимого/i,
    unless: /@media|min-width|медиазапрос/i,
  },
  {
    id: 'container.zone',
    re: new RegExp(`зон${W}*\\s+содержимого\\s*[—:-]?\\s*(?:\\d+\\s*[−-]\\s*\\d+\\s*=\\s*)?(\\d+)\\s*px`, 'i'),
  },
  {
    id: 'container.padding',
    re: /padding\s*:\s*0\s+(\d+)\s*px/i,
    context: /контейнер|max-w-\[|1124/i,
  },
];

// =========================================================================
// 3. Извлечение текста витрины
// =========================================================================

// Построчный сканер HTML. Возвращает поток событий с номером строки.
// Не регэксп по форме документа: незакрытый тег не съедает остаток файла
// молча, `<script>`/`<style>` читаются как сырой текст до своего
// закрывающего тега, CRLF и LF считаются одинаково.
function* htmlTokens(src) {
  let i = 0;
  let line = 1;
  const advance = to => {
    for (let k = i; k < to; k++) if (src[k] === '\n') line++;
    i = to;
  };
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    if (lt === -1) {
      yield { type: 'text', text: src.slice(i), line };
      advance(src.length);
      return;
    }
    if (lt > i) {
      const start = line;
      const text = src.slice(i, lt);
      yield { type: 'text', text, line: start };
      advance(lt);
    }
    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i + 4);
      const stop = end === -1 ? src.length : end + 3;
      yield { type: 'comment', text: src.slice(i + 4, end === -1 ? src.length : end), line };
      advance(stop);
      continue;
    }
    // Тег: до `>` вне кавычек значения атрибута.
    let j = i + 1;
    let quote = null;
    while (j < src.length) {
      const ch = src[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === '>') {
        break;
      }
      j++;
    }
    if (j >= src.length) {
      // Незакрытый тег до конца файла — не молчаливый проглот остатка:
      // хвост отдаётся текстом, и утверждения в нём продолжают читаться.
      yield { type: 'text', text: src.slice(i + 1), line };
      advance(src.length);
      return;
    }
    const raw = src.slice(i + 1, j);
    const nameMatch = /^\/?\s*([a-zA-Z][\w-]*)/.exec(raw);
    const name = nameMatch ? nameMatch[1].toLowerCase() : '';
    const closing = raw.trimStart().startsWith('/');
    const tagLine = line;
    advance(j + 1);
    yield { type: 'tag', name, closing, raw, line: tagLine };
    if (!closing && (name === 'script' || name === 'style')) {
      const close = new RegExp(`</\\s*${name}\\b`, 'i');
      const rest = src.slice(i);
      const m = close.exec(rest);
      const stop = m ? i + m.index : src.length;
      // Тело <style> — такой же носитель утверждений, как showcase/*.css:
      // комментарий внутри инлайнового блока ничем не отличается от
      // комментария в файле. Ровно на инлайновом <style> сломался гейт
      // §6.2 в validate-classes (R0-06, review-1), и повторять эту дыру
      // здесь нельзя. Тело отдаётся отдельным событием вместе с номером
      // строки, с которой оно начинается.
      if (name === 'style') {
        yield { type: 'rawtext', name, text: src.slice(i, stop), line };
      }
      advance(stop);
    }
  }
}

// -------------------------------------------------------------------------
// Накопитель текста с картой «смещение → строка исходника».
//
// Без него находка указывает на начало абзаца или комментария, а не на
// само предложение. Именно эта разница и стоила пакету четвёртого
// проявления: ложное предложение лежало на 705–706, ревью смотрело
// с 707-й, а комментарий начинался на 703 — двадцать строк отделяли
// исправленное место от неисправленного. Гейт обязан называть строку
// самого утверждения.
// -------------------------------------------------------------------------
function newBuffer() {
  return { text: '', map: [], pendingSpace: false };
}

function pushText(buf, raw, startLine) {
  let line = startLine;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '\n') { line++; buf.pendingSpace = true; continue; }
    if (ch === '\r' || ch === ' ' || ch === '\t' || ch === '\f' || ch === '\v') { buf.pendingSpace = true; continue; }
    if (buf.pendingSpace && buf.text) buf.text += ' ';
    buf.pendingSpace = false;
    const last = buf.map[buf.map.length - 1];
    if (!last || last.line !== line) buf.map.push({ at: buf.text.length, line });
    buf.text += ch;
  }
}

function lineAt(map, offset) {
  if (!map || !map.length) return 0;
  let line = map[0].line;
  for (const m of map) {
    if (m.at <= offset) line = m.line;
    else break;
  }
  return line;
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;|&thinsp;|&#8201;|&#160;/g, ' ')
    .replace(/&mdash;|&#8212;/g, '—')
    .replace(/&ndash;|&#8211;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&hellip;/g, '…')
    .replace(/&times;/g, '×')
    .replace(/&middot;/g, '·')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

// Блочные элементы обрывают текстовую единицу; строчные — нет. `<span>`
// в этой витрине несёт подпись образца целиком (`doc-variant__label`),
// поэтому он блочный здесь, а `<code>`, `<b>`, `<a>` — строчные.
const BLOCK = new Set([
  'p', 'li', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'tr',
  'div', 'section', 'article', 'figure', 'figcaption', 'blockquote', 'pre',
  'span', 'label', 'summary', 'details', 'ul', 'ol', 'dl', 'table', 'thead',
  'tbody', 'header', 'footer', 'main', 'nav', 'aside', 'br', 'hr', 'body',
  'head', 'html', 'title', 'button',
]);

function attr(raw, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\`]+))`, 'i');
  const m = re.exec(raw);
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
}

// Единица текста: {file, line, text, codes:[], heading, dataClaim, kind}
function htmlUnits(file) {
  const src = fs.readFileSync(file, 'utf8');
  const units = [];
  let buf = newBuffer();
  let codes = [];
  let inCode = 0;
  let codeBuf = '';
  let heading = '';
  let headingTag = null;
  let pendingClaim = null;
  let claimTag = null;
  let depth = 0;
  let lastDt = null;
  let styleIndex = 0;

  const flush = kind => {
    const text = buf.text.trimEnd();
    const map = buf.map;
    const unitCodes = codes;
    buf = newBuffer();
    codes = [];
    if (!text) return null;
    const unit = {
      file,
      line: map.length ? map[0].line : 0,
      text,
      map,
      codes: unitCodes,
      heading,
      dataClaim: pendingClaim,
      kind: kind || 'text',
    };
    units.push(unit);
    return unit;
  };

  for (const tok of htmlTokens(src)) {
    if (tok.type === 'text') {
      const text = decodeEntities(tok.text);
      pushText(buf, text, tok.line);
      if (inCode > 0) codeBuf += text;
      continue;
    }
    if (tok.type === 'rawtext') {
      flush();
      styleIndex += 1;
      for (const u of cssCommentUnits(tok.text, `${file} <style>#${styleIndex}`, tok.line - 1)) {
        units.push({ ...u, file, heading, kind: 'style-comment' });
      }
      continue;
    }
    if (tok.type === 'comment') {
      flush();
      const cbuf = newBuffer();
      pushText(cbuf, decodeEntities(tok.text), tok.line);
      const text = cbuf.text.trimEnd();
      if (text) {
        units.push({
          file,
          line: cbuf.map.length ? cbuf.map[0].line : tok.line,
          text,
          map: cbuf.map,
          codes: [...text.matchAll(/`([^`]+)`/g)].map(m => m[1]),
          heading,
          dataClaim: null,
          kind: 'html-comment',
        });
      }
      continue;
    }
    // tok.type === 'tag'
    // `data-claim` может стоять на любом элементе, в том числе строчном
    // (`<b data-claim="vars.total">51</b>`). Такой элемент — сам себе
    // единица: текст до него и после него в утверждение не входит, иначе
    // число в единице будет не одно и привязка перестанет быть точной.
    if (!tok.closing) {
      const claim = attr(tok.raw, 'data-claim');
      if (claim) {
        flush();
        pendingClaim = claim;
        claimTag = tok.name;
        continue;
      }
    } else if (pendingClaim && claimTag === tok.name) {
      flush('claim');
      pendingClaim = null;
      claimTag = null;
      continue;
    }
    if (tok.name === 'code') {
      if (!tok.closing) {
        inCode++;
        codeBuf = '';
      } else if (inCode > 0) {
        inCode--;
        const c = codeBuf.replace(/\s+/g, ' ').trim();
        if (c) codes.push(c);
        codeBuf = '';
      }
      continue;
    }
    if (BLOCK.has(tok.name)) {
      const unit = flush(headingTag && !tok.closing ? 'text' : undefined);
      if (unit && headingTag) {
        heading = unit.text;
        unit.kind = 'heading';
      }
      if (unit && lastDt && tok.closing && tok.name === 'dd') {
        unit.kind = 'pair';
        unit.label = lastDt;
        lastDt = null;
      }
      if (unit && tok.closing && tok.name === 'dt') lastDt = unit.text;
      if (!tok.closing && /^h[1-6]$/.test(tok.name)) headingTag = tok.name;
      if (tok.closing && headingTag === tok.name) headingTag = null;
      if (!tok.closing) depth++;
      else depth--;
    }
  }
  flush();
  return units;
}

// Комментарии CSS — настоящим парсером, а не поиском `/*` по тексту:
// `/*` внутри строки или url() комментарием не является, и разбор это
// знает по построению. Один и тот же разбор обслуживает и showcase/*.css,
// и тело инлайнового <style> витрины (lineOffset — номер строки, с которой
// это тело начинается в HTML-файле).
function cssCommentUnits(src, label, lineOffset = 0) {
  const root = parseCss(src, label);
  if (!root) return [];
  const units = [];
  root.walkComments(comment => {
    const line = (comment.source && comment.source.start ? comment.source.start.line : 0) + lineOffset;
    const buf = newBuffer();
    pushText(buf, comment.text || '', line);
    const text = buf.text.trimEnd();
    if (!text) return;
    units.push({
      file: label,
      line: buf.map.length ? buf.map[0].line : line,
      text,
      map: buf.map,
      codes: [...text.matchAll(/`([^`]+)`/g)].map(m => m[1]),
      heading: '',
      dataClaim: null,
      kind: 'css-comment',
    });
  });
  return units;
}

function cssUnits(file) {
  return cssCommentUnits(fs.readFileSync(file, 'utf8'), file, 0);
}

// =========================================================================
// 4. Предложения и клаузы
// =========================================================================

const ABBREV = /(?:^|\s)(?:см|т|е|д|др|стр|рис|напр|мс|шт|г|в|ср)$/i;

function splitSentences(text) {
  const out = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== '…') continue;
    let j = i;
    while (j + 1 < text.length && '.!?…'.includes(text[j + 1])) j++;
    const next = text[j + 1];
    if (next !== undefined && !/\s/.test(next)) continue; // ui/foundations.css
    if (ABBREV.test(text.slice(start, i))) { i = j; continue; }
    const piece = text.slice(start, j + 1);
    out.push({ at: start + (piece.length - piece.trimStart().length), text: piece.trim() });
    start = j + 1;
    i = j;
  }
  if (start < text.length && text.slice(start).trim()) {
    const piece = text.slice(start);
    out.push({ at: start + (piece.length - piece.trimStart().length), text: piece.trim() });
  }
  return out.filter(s => s.text.length > 0);
}

// Двоеточие — граница клаузы («…видно перетаскиванием окна: в ui/ из шести
// поднят только phone:»), но двоеточие после латинского идентификатора —
// часть самого токена («phone: и tablet:», «max-width: 1124px»), и резать
// по нему нельзя: перечисление префиксов разваливается ровно посередине,
// и «только phone:, small-phone: и tablet:» читается как «только phone:».
const CLAUSE_SPLIT = /\s+—\s+|;\s+|(?<![A-Za-z0-9_\]-]):\s+|,\s+(?=(?:и|а|но|причём|причем|при этом|тогда как|зато)\s)/g;

function splitClauses(sentence) {
  const out = [];
  let last = 0;
  CLAUSE_SPLIT.lastIndex = 0;
  let m;
  const push = (from, to) => {
    const piece = sentence.slice(from, to);
    out.push({ at: from + (piece.length - piece.trimStart().length), text: piece.trim() });
  };
  while ((m = CLAUSE_SPLIT.exec(sentence))) {
    push(last, m.index);
    last = m.index + m[0].length;
  }
  push(last, sentence.length);
  return out.filter(c => c.text.length > 0);
}

// =========================================================================
// 5. Слой, полярность, сущности
// =========================================================================

const RE_UI_LAYER = new RegExp(
  `(?:^|[^\\w/])ui\\/|подключённ${W}*\\s+ui\\/|` +
  // «в слое нет намеренно» — слой пакета, названный без пути. Слово взято
  // точной формой: `сло${W}*` поймало бы «слово в слово» в образце разметки.
  `в\\s+(?:наш${W}*\\s+|собственн${W}*\\s+)?слое${BOUND1}`, 'i');
const RE_OTHER_LAYER = ru(
  `сборк${W}*|корпус${W}*|продакш${W}*|figma|tailwind|оболочк${W}*|витрин${W}*|storybook|браузер${W}*|msedge|` +
  `в\\s+проде|в\\s+разметке|разметк${W}*|десяти\\s+страниц${W}*|снятых\\s+страниц${W}*|на\\s+\\d+\\s+страниц${W}*|` +
  `docs\\/[\\w.-]*|career\\/[\\w.-]*|showcase\\/[\\w.-]*|методе|METHOD`);

// Отрицание существования — единственная форма отрицания, которую этот
// гейт берётся проверять: «в ui/ этого нет», «не раскрывается»,
// «ни одного», «не объявлен», «не протекает». Прочие отрицания («не от
// чего считать», «страницы не читаются») к содержимому слоя отношения
// не имеют, и считать их утверждением о существовании — прямой путь
// к шуму, который перестают читать. Отрицание существования — форма всех
// четырёх исторических проявлений, и здесь она проверяется строго.
const RE_NEG_EXISTS = ru(
  `нет|ноль|нигде|никак${W}*|отсутств${W}*|` +
  `ни\\s+одн${W}*|ни\\s+разу|` +
  // Глаголы — только те, что говорят о существовании в слое. Общие
  // («не знает», «не имеет», «не читаются») сюда не входят намеренно:
  // под ними стоят утверждения не о содержимом слоя, и втягивать их
  // в проверку — производить шум, который перестают читать.
  `не\\s+(?:объявл|определ|раскрыва|встреча|содерж|поднима|реализ|существ|найд|протека)${W}*`);
const RE_EXHAUSTIVE = ru(`только|лишь|единственн${W}*`);
const RE_EXCEPT = ru(`кроме|за\\s+исключением|исключая`);

// Клауза продолжает отрицание предыдущей, если она — продолжение
// перечисления, а не новое утверждение со своим сказуемым: начинается
// союзом, местоимением перечисления или прямо сущностью.
const RE_CONTINUES = new RegExp(`^(?:и|а|ни|или|либо|все|всех|всеми|всё|включая|в\\s+том\\s+числе)${BOUND1}|^[.\\-]?[a-z-]+[:.]|^--`, 'i');

const WILDCARD = /[*…]$/;

// `--` внутри имени класса (`doc-src--production`, BEM-модификатор) —
// не переменная: перед двумя дефисами не должно быть буквы или цифры.
const RE_VAR = /(?<![\w-])--[a-z][\w-]*[*…]?/gi;
const RE_PREFIXED = new RegExp(
  '(?<![\\w-])(?:' + BP_PREFIXES.join('|') + ')\\\\?:[a-z0-9-]*[*…]?',
  'gi');
const RE_DOTCLASS = /(?<![\w/\\.-])\.[a-z][a-z0-9-]*(?:\\:[a-z0-9-]+)?[*…]?/gi;
const FILE_EXT = /^\.(?:css|html|htm|json|md|mjs|js|svg|png|jpg|webp|woff2?|txt|log)$/i;
const CODE_LOOKS_LIKE_CLASS = /^\.?[a-z][a-z0-9-]*(?:\\?:[a-z0-9-]+)?[*…]?$/i;

function normEntity(raw) {
  let t = raw.trim();
  const wildcard = WILDCARD.test(t);
  if (wildcard) t = t.slice(0, -1);
  t = t.replace(/\\:/g, ':');
  let kind = 'class';
  if (t.startsWith('--')) kind = 'var';
  else if (t.startsWith('.')) { kind = 'class'; t = t.slice(1); }
  else if (/:$/.test(t)) kind = 'prefix';
  return { name: t, kind, wildcard: wildcard || kind === 'prefix' };
}

function entitiesOf(text, codes) {
  const found = new Map();
  const add = raw => {
    const e = normEntity(raw);
    if (!e.name) return;
    // Оборванное имя (`.crs-<id>` в образце разметки) сущностью не является:
    // это шаблон с подстановкой, а не класс, о котором что-то утверждается.
    if (!e.wildcard && /-$/.test(e.name)) return;
    if (e.kind === 'class' && FILE_EXT.test('.' + e.name)) return;
    const key = `${e.kind}:${e.name}:${e.wildcard}`;
    if (!found.has(key)) found.set(key, { ...e, raw: raw.trim() });
  };
  for (const m of text.matchAll(RE_VAR)) add(m[0]);
  for (const m of text.matchAll(RE_PREFIXED)) add(m[0]);
  for (const m of text.matchAll(RE_DOTCLASS)) add(m[0]);
  for (const c of codes || []) {
    if (!CODE_LOOKS_LIKE_CLASS.test(c)) continue;
    if (!/[-:]/.test(c)) continue;               // одиночное слово классом не считается
    if (FILE_EXT.test(c.startsWith('.') ? c : '.' + c)) continue;
    if (text.includes(c)) add(c);
  }
  return [...found.values()];
}

// «кроме px-6,» — исключения из отрицания и из «только».
function exceptionsOf(text) {
  const m = RE_EXCEPT.exec(text);
  if (!m) return new Set();
  const tail = text.slice(m.index + m[0].length);
  const seg = tail.split(/,|\sи\sв\sтом\sчисле|\bв\s+том\s+числе\b/)[0];
  const out = new Set();
  for (const e of entitiesOf(seg, [])) {
    out.add(e.name);
    if (e.name.includes(':')) out.add(e.name.split(':').pop());
  }
  for (const w of seg.match(/[a-z][a-z0-9-]*(?:-[a-z0-9]+)+/gi) || []) out.add(w);
  return out;
}

// =========================================================================
// 6. Проверка
// =========================================================================

const findings = [];
const census = [];

function has(entity) {
  if (entity.kind === 'var') {
    if (entity.wildcard) return [...ui.vars.keys()].filter(n => n.startsWith(entity.name));
    return ui.vars.has(entity.name) ? [entity.name] : [];
  }
  if (entity.kind === 'prefix' || entity.wildcard) {
    return [...ui.classes.keys()].filter(n => n.startsWith(entity.name));
  }
  return ui.classes.has(entity.name) ? [entity.name] : [];
}

function where(name, kind) {
  if (kind === 'var') {
    const v = ui.vars.get(name);
    return v ? `${v.file}:${v.line}` : '?';
  }
  const places = ui.classes.get(name) || [];
  return places.map(p => `${p.file}:${p.line}`).join(', ') || '?';
}

// Строка находки — строка самой клаузы, а не начало абзаца или
// комментария (см. комментарий к newBuffer выше).
function report(type, unit, clause, message) {
  const offset = (clause.absAt !== undefined ? clause.absAt : 0);
  findings.push({
    type,
    file: unit.file,
    line: unit.map ? lineAt(unit.map, offset) : unit.line,
    message,
    clause: clause.text,
  });
}

// Клауза называет файл и строку ui/ — «(ui/utilities.css, строка 78)».
const RE_LOCATION = /(ui\/[\w./-]+\.css)\s*[,)]?\s*(?:строк[аи]|строки|:)\s*(\d+)(?:\s*[–—-]\s*(\d+))?/gi;

// Адрес привязывается к ближайшей сущности СЛЕВА от него, а не ко всем
// сущностям клаузы: «small-phone:text-center (ui/utilities.css, строка 78)
// и tablet:px-6 (ui/layout.css, строка 163)» — два адреса и две сущности,
// и перекрёстная сверка каждой с каждым даёт две ложные находки.
function checkLocation(unit, clause, entities) {
  const locs = [...clause.text.matchAll(RE_LOCATION)];
  if (!locs.length) return;
  const positions = [];
  for (const e of entities) {
    let from = 0;
    for (;;) {
      const at = clause.text.indexOf(e.raw, from);
      if (at === -1) break;
      positions.push({ at, entity: e });
      from = at + 1;
    }
  }
  positions.sort((a, b) => a.at - b.at);
  let prevEnd = 0;
  for (const loc of locs) {
    const file = loc[1];
    const from = Number(loc[2]);
    const to = loc[3] ? Number(loc[3]) : from;
    const bound = positions.filter(p => p.at >= prevEnd && p.at < loc.index).pop();
    prevEnd = loc.index + loc[0].length;
    if (!bound) continue;
    const e = bound.entity;
    if (e.wildcard) continue;
    const places = e.kind === 'var'
      ? (ui.vars.has(e.name) ? [ui.vars.get(e.name)] : [])
      : (ui.classes.get(e.name) || []);
    if (!places.length) continue;
    const ok = places.some(p => p.file === file && p.line >= from - 2 && p.line <= to + 2);
    if (!ok) {
      report('claim-location', unit, clause,
        `названо место ${file}:${loc[2]}${loc[3] ? '–' + loc[3] : ''}, а ${e.kind === 'var' ? e.name : '.' + e.name} объявлен в ${where(e.name, e.kind)}`);
    }
  }
}

const qline = (unit, clause) => (unit.map ? lineAt(unit.map, clause.absAt || 0) : unit.line);

function checkQuantities(unit, clause, negAt) {
  // Отрицание в русском тексте действует вперёд, и число под ним меняет
  // смысл на противоположный: «Не раскрываются три префикса» — это «три
  // из шести НЕ подняты», а выведенная величина отвечает на обратный
  // вопрос. Поэтому пропускается не всякая отрицательная клауза, а
  // только число, стоящее ПОСЛЕ отрицания: «пятнадцать объявлены
  // в сборке и в разметке не встречаются» — число стоит до отрицания
  // и проверяется как обычно. `negAt === null` — отрицания нет вовсе,
  // `negAt === -1` — отрицание унаследовано от предыдущей клаузы, то есть
  // стоит левее всего текста этой.
  // Явная форма: data-claim="<id>" на элементе с числом.
  if (unit.dataClaim && DERIVED[unit.dataClaim] !== undefined) {
    const m = new RegExp(NUM_RE_SRC).exec(clause.text);
    const claimed = m ? readNumber(m[1]) : null;
    if (claimed !== null && DERIVED[unit.dataClaim] !== null && claimed !== DERIVED[unit.dataClaim]) {
      report('claim-quantity', unit, clause,
        `data-claim="${unit.dataClaim}": заявлено ${claimed}, разбор ui/ даёт ${DERIVED[unit.dataClaim]}`);
    }
    return;
  }
  // Контекст — заголовок раздела витрины, ярлык пары <dt>/<dd> и ВЕСЬ
  // текст единицы, а не одна клауза: «Двадцать шесть живых» стоит
  // отдельной клаузой, а слово «переменная», по которому величина
  // опознаётся, — в соседнем предложении того же абзаца.
  const ctx = `${unit.heading} ${unit.label || ''} ${unit.text}`;
  // Одна клауза может нести несколько чисел о разных величинах —
  // «из шести префиксов поднимает три». Поэтому перебираются все строки
  // таблицы, а не первая подошедшая; повторный счёт одного и того же
  // куска текста отсекается по пересечению совпадений. Порядок строк
  // задаёт приоритет: узкие («цветовых», «живых») стоят выше общих.
  const taken = [];
  for (const q of QUANTITIES) {
    if (q.context && !q.context.test(ctx)) continue;
    if (q.unless && q.unless.test(ctx)) continue;
    const probe = unit.kind === 'pair' ? `${unit.label} ${clause.text}` : clause.text;
    const m = q.re.exec(probe);
    if (!m) continue;
    const span = [m.index, m.index + m[0].length];
    if (negAt !== null && negAt < span[0]) continue;
    if (taken.some(([a, b]) => span[0] < b && a < span[1])) continue;
    const claimed = readNumber(m[1]);
    if (claimed === null) continue;
    taken.push(span);
    const actual = DERIVED[q.id];
    if (actual === null || actual === undefined) {
      census.push({ kind: 'quantity-underivable', unit, clause, id: q.id, claimed, line: qline(unit, clause) });
      continue;
    }
    census.push({ kind: 'quantity', unit, clause, id: q.id, claimed, actual, line: qline(unit, clause) });
    if (claimed !== actual) {
      report('claim-quantity', unit, clause,
        `«${m[0].trim()}» — величина ${q.id}: заявлено ${claimed}, разбор ui/ даёт ${actual}`);
    }
  }
}

// Образец разметки внутри комментария («так выглядит секция витрины»)
// утверждением не является: это шаблон для копирования, а не высказывание
// о содержимом слоя. Признак — теги внутри самого текста единицы.
const RE_LOOKS_LIKE_MARKUP = /<\/?[a-z][\w-]*(?:\s[^<>]*)?>/i;

function checkUnit(unit) {
  if (RE_LOOKS_LIKE_MARKUP.test(unit.text)) return;
  for (const sentence of splitSentences(unit.text)) {
    let layer = 'none';
    // Полярность, как и слой, наследуется слева направо внутри
    // предложения: «Не раскрываются … три префикса — desktop:,
    // tablet-only:, phablet-and-tablet:, … и все утилиты tablet:*» —
    // отрицание стоит один раз, а относится ко всем перечислениям после
    // него. Без наследования вторая половина такого предложения читается
    // как положительное утверждение и даёт ложную находку.
    let negative = false;
    let inherited = false;
    const clauses = splitClauses(sentence.text);
    for (const clause of clauses) {
      clause.absAt = sentence.at + clause.at;
      if (RE_UI_LAYER.test(clause.text)) layer = 'ui';
      else if (RE_OTHER_LAYER.test(clause.text)) layer = 'other';

      const entities = entitiesOf(clause.text, unit.codes);
      const ownNeg = RE_NEG_EXISTS.exec(clause.text);
      const ownNegative = ownNeg !== null;
      if (ownNegative) {
        negative = true;
        inherited = false;
      } else if (negative && RE_CONTINUES.test(clause.text)) {
        inherited = true;
      } else {
        // Клауза со своим подлежащим и сказуемым начинает новое
        // утверждение: «Плашка не знает значения палитры: фон ей задаёт
        // var(--color-…) из ui/tokens.css» — вторая половина
        // положительная, и наследовать в неё отрицание нельзя.
        negative = false;
        inherited = false;
      }
      const exhaustive = RE_EXHAUSTIVE.test(clause.text);
      const except = exceptionsOf(clause.text);

      checkQuantities(unit, clause, !negative ? null : (ownNegative ? ownNeg.index : -1));

      if (!entities.length) continue;

      census.push({
        kind: 'clause', unit, clause, layer,
        line: unit.map ? lineAt(unit.map, clause.absAt) : unit.line,
        polarity: negative ? (inherited ? 'negative(наследовано)' : 'negative') : exhaustive ? 'exhaustive' : 'positive',
        entities: entities.map(e => e.raw),
      });

      if (layer === 'other') continue;

      if (layer === 'none') {
        if (negative) {
          report('claim-unscoped', unit, { text: clause.text },
            `отрицание о ${entities.map(e => e.raw).join(', ')} без названного слоя — проверить нечем`);
        }
        continue;
      }

      // layer === 'ui'
      if (negative) {
        for (const e of entities) {
          const hits = has(e).filter(n => !except.has(n) && !except.has(n.split(':').pop()));
          if (hits.length) {
            report('claim-negative', unit, clause,
              `сказано, что в ui/ нет ${e.raw}, а в ui/ есть: ${hits.map(n => `${n} (${where(n, e.kind)})`).join('; ')}`);
          }
        }
        continue;
      }

      if (exhaustive) {
        // «только phone:» — перечисление обязано быть полным для своего вида.
        const named = entities.filter(e => !e.wildcard || e.kind === 'prefix');
        const prefixes = named.filter(e => e.kind === 'prefix' || (e.kind === 'class' && e.name.includes(':')));
        if (prefixes.length) {
          const namedPrefixes = new Set(prefixes.map(e => e.name.split(':')[0]));
          const actual = new Set(prefClasses.map(c => c.prefix));
          const extra = [...actual].filter(p => !namedPrefixes.has(p) && !except.has(p) && !except.has(p + ':'));
          if (extra.length) {
            report('claim-exhaustive', unit, clause,
              `сказано «только ${[...namedPrefixes].map(p => p + ':').join(', ')}», а в ui/ подняты и ${extra.map(p => `${p}: (${prefClasses.filter(c => c.prefix === p).map(c => c.name).join(', ')})`).join('; ')}`);
          }
          continue;
        }
      }

      // positive
      for (const e of entities) {
        if (!has(e).length) {
          report('claim-positive', unit, clause,
            `названо ${e.raw} как содержимое ui/, а в ui/ такого нет`);
        }
      }
      checkLocation(unit, clause, entities);
    }
  }
}

const allUnits = [
  ...showcaseHtmlFiles.flatMap(htmlUnits),
  ...showcaseCssFiles.flatMap(cssUnits),
];

// CSS витрины, который не разобрался, — это находка, а не тихий пропуск:
// комментарии такого файла (носитель № 2, где жило четвёртое проявление)
// не прочитаны вовсе, и «расхождений нет» о нём сказать нельзя.
if (parseErrors.length) {
  console.error(`CSS витрины не разобран настоящим парсером (${parseErrors.length}):\n`);
  for (const e of parseErrors.sort()) console.error(`  ${e}`);
  console.error('\nКомментарии такого файла не прочитаны — утверждения в них не проверены.');
  process.exit(1);
}

for (const unit of allUnits) checkUnit(unit);

// =========================================================================
// 7. Отчёт
// =========================================================================

if (CENSUS) {
  console.log('=== Величины, выведенные из разбора ui/ ===');
  for (const [id, value] of Object.entries(DERIVED)) {
    console.log(`  ${id.padEnd(22)} ${value === null ? '— не выводится' : value}`);
  }
  console.log(`  (rem = ${REM === null ? 'не выводится' : REM + 'px'}, файлов ui/ ${ui.files.length}, классов ${ui.classes.size}, переменных ${ui.vars.size})`);
  console.log('');
  console.log('=== Префиксные классы ui/ ===');
  for (const c of prefClasses) {
    for (const p of c.places) console.log(`  ${c.name.padEnd(24)} ${p.file}:${p.line}  ${p.media.join(' / ')}`);
  }
  console.log('');
  console.log(`=== Разобранные клаузы с сущностями (${census.filter(c => c.kind === 'clause').length}) ===`);
  for (const c of census.filter(x => x.kind === 'clause')) {
    console.log(`  [${c.unit.file}:${c.line}] слой=${c.layer} полярность=${c.polarity} сущности=${c.entities.join(', ')}`);
    console.log(`      ${c.clause.text}`);
  }
  console.log('');
  console.log(`=== Числовые утверждения (${census.filter(c => c.kind.startsWith('quantity')).length}) ===`);
  for (const c of census.filter(x => x.kind.startsWith('quantity'))) {
    console.log(`  [${c.unit.file}:${c.line}] ${c.id}: заявлено ${c.claimed}${c.kind === 'quantity' ? `, ui/ даёт ${c.actual}` : ' — величина не выводится'}`);
    console.log(`      ${c.clause.text}`);
  }
  console.log('');
}

const byType = new Map();
for (const f of findings) {
  if (!byType.has(f.type)) byType.set(f.type, []);
  byType.get(f.type).push(f);
}

const TYPE_TITLE = {
  'claim-negative': 'Отрицание о ui/, опровергнутое разбором ui/',
  'claim-exhaustive': 'Перечисление «только …», неполное по разбору ui/',
  'claim-positive': 'Названо как содержимое ui/, но в ui/ этого нет',
  'claim-location': 'Названы файл и строка ui/, а объявление в другом месте',
  'claim-quantity': 'Число разошлось с разбором ui/',
  'claim-unscoped': 'Отрицание без названного слоя — непроверяемо',
};

if (findings.length) {
  console.error(`Витрина утверждает о ui/ то, что разбором ui/ не подтверждается (${findings.length}):\n`);
  for (const [type, list] of byType) {
    console.error(`  ${TYPE_TITLE[type] || type} (${list.length}):`);
    for (const f of list.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
      console.error(`    ${f.file}:${f.line} — ${f.message}`);
      console.error(`      клауза: «${f.clause}»`);
    }
    console.error('');
  }
  console.error('Утверждение витрины о собственном слое — такой же факт, как значение,');
  console.error('и требует такого же источника. Либо исправьте утверждение, либо');
  console.error('назовите слой, о котором оно на самом деле (сборка, корпус, разметка).');
  process.exit(1);
}

console.log(`Проверено ${allUnits.length} единиц текста витрины (${showcaseHtmlFiles.length} html + ${showcaseCssFiles.length} css) против разбора ${ui.files.length} файлов ui/.`);
console.log(`Клауз с сущностями ${census.filter(c => c.kind === 'clause').length}, из них о ui/ ${census.filter(c => c.kind === 'clause' && c.layer === 'ui').length}; числовых утверждений ${census.filter(c => c.kind.startsWith('quantity')).length}. Расхождений нет.`);
