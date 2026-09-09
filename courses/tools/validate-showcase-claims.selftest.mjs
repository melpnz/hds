/**
 * Регрессионные пробы для `tools/validate-showcase-claims.mjs` (R0-08).
 *
 * Каждая проба строит изолированный фиктивный пакет (свои `ui/` и
 * `showcase/`) во временном каталоге и запускает настоящий CLI с этим
 * каталогом как рабочей директорией — не вызывает внутренние функции
 * напрямую. Тот же приём, что в `validate-classes.selftest.mjs`: гейт
 * читает `ui/` и `showcase/` относительно `process.cwd()`, поэтому
 * изоляция через `cwd` равносильна копии пакета в отдельном каталоге.
 *
 * Четыре группы проб.
 *
 *   1. ИСТОРИЯ — все четыре проявления класса дефекта, каждое красной
 *      пробой на копии и симметричной зелёной. Это главное содержание
 *      файла: гейт заведён затем, чтобы эти четыре текста больше никогда
 *      не проходили молча.
 *        H1  X-73 (R0-03)  — отрицание о `desktop:` / `small-phone:text-*`
 *        H2  R2-01         — положительное утверждение об утилите,
 *                            которой в `ui/` нет
 *        H3  R0-07, приёмка 1 — «из шести префиксов поднимает только два»
 *        H4  R0-07, приёмка 2 — то же предложение в комментарии CSS
 *
 *   2. НОСИТЕЛИ — то же ложное предложение в каждом из носителей
 *      по отдельности: текст разметки, HTML-комментарий, комментарий
 *      `showcase/*.css`, комментарий инлайнового `<style>`. Четвёртое
 *      проявление жило ровно в том носителе, которого гейт бы не читал.
 *
 *   3. ФОРМА ТЕКСТА — CRLF, висячие пробелы, незакрытый тег, незакрытый
 *      комментарий, `/*` внутри строки CSS. X-81 и X-75 показали, что
 *      гейт над текстом ломается именно на границе текста, причём молча:
 *      «ничего не нашли» и «нечего искать» выглядят одинаково.
 *
 *   4. ВИДЫ НАХОДОК — по красной и зелёной пробе на каждый вид, включая
 *      числа (X-90) в обеих формах записи: прозой и `data-claim`.
 *
 * Запуск: node tools/validate-showcase-claims.selftest.mjs
 * Код возврата: 0 — все пробы дали ожидаемое; 1 — хотя бы одна разошлась.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(here, 'validate-showcase-claims.mjs');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-showcase-claims-selftest-'));
let fixtureCounter = 0;

// -------------------------------------------------------------------------
// Слой ui/ фикстуры. Воспроизводит ровно то, на чём сломался пакет:
// три поднятых префикса из шести и четыре префиксных класса
// (`phone:text-h1-mobile`, `phone:text-h2`, `small-phone:text-center`,
// `tablet:px-6`), объявленных через CSS-экранирование `\:`, — то есть
// в той же форме, что и в настоящем ui/.
// -------------------------------------------------------------------------
const UI_FOUNDATIONS = `:root {
  --color-a: #000;
  --color-b: #111;  /* [NO MARKUP] */
  --size-x: 1px;  /* [UNREFERENCED] */
  --header-height: 2px;  /* [RUNTIME] */
}
html{font-size:16px}
.text-h1{font-size:44px;line-height:48px}
.text-h2{font-size:24px;line-height:28px}
@media (max-width:767px){
  .phone\\:text-h1-mobile{font-size:30px;line-height:34px}
  .phone\\:text-h2{font-size:20px;line-height:24px}
}
`;
const UI_UTILITIES = `@media (max-width:479px){
  .small-phone\\:text-center{text-align:center}
}
`;
const UI_LAYOUT = `.max-w-\\[1124px\\]{max-width:1124px}
.px-6{padding-left:1.5rem;padding-right:1.5rem}
.gap-12{gap:3rem}
.pt-10{padding-top:2.5rem}
.pb-10{padding-bottom:2.5rem}
@media (max-width:1023px){
  .tablet\\:px-6{padding-left:1.5rem;padding-right:1.5rem}
}
`;

// Три префикса, четыре класса — состояние ui/ после R0-04.
const UI_THREE = {
  'foundations.css': UI_FOUNDATIONS,
  'utilities.css': UI_UTILITIES,
  'layout.css': UI_LAYOUT,
};

// Один префикс — состояние ui/ до R0-04, при котором те же утверждения
// витрины были бы истинными. Нужен для зелёных близнецов.
const UI_ONE = {
  'foundations.css': UI_FOUNDATIONS,
  'layout.css': UI_LAYOUT.replace(/@media \(max-width:1023px\)\{[\s\S]*?\}\n\}\n?/, ''),
};

// Слой, где `desktop:` и `small-phone:text-*` есть, — им опровергается
// исходное отрицание X-73.
const UI_WITH_DESKTOP = {
  ...UI_THREE,
  'extra.css': `@media (min-width:1024px){.desktop\\:hidden{display:none}}\n`,
};

function page(body, { head = '' } = {}) {
  return `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>fixture</title>${head}</head>
<body>
${body}
</body>
</html>
`;
}

function fixture({ ui = UI_THREE, html = null, css = null, manifest = null, files = null } = {}) {
  fixtureCounter += 1;
  const root = path.join(tmpRoot, String(fixtureCounter));
  fs.mkdirSync(path.join(root, 'ui'), { recursive: true });
  fs.mkdirSync(path.join(root, 'showcase'), { recursive: true });
  for (const [name, content] of Object.entries(ui)) {
    fs.writeFileSync(path.join(root, 'ui', name), content);
  }
  if (html !== null) fs.writeFileSync(path.join(root, 'showcase', 'components.html'), html);
  if (css !== null) fs.writeFileSync(path.join(root, 'showcase', 'components.css'), css);
  if (manifest) {
    fs.mkdirSync(path.join(root, 'components'), { recursive: true });
    fs.writeFileSync(path.join(root, 'components', 'manifest.json'), JSON.stringify(manifest, null, 2));
  }
  for (const [rel, content] of Object.entries(files || {})) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

function run(root) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  return { code: result.status, output: `${result.stdout || ''}${result.stderr || ''}` };
}

const results = [];

function probe(name, { fixtureOpts, expectCode, expectContains = [], expectNotContains = [] }) {
  const root = fixture(fixtureOpts);
  const { code, output } = run(root);
  const problems = [];
  if (code !== expectCode) problems.push(`код возврата ${code}, ожидался ${expectCode}`);
  for (const needle of expectContains) {
    if (!output.includes(needle)) problems.push(`в выводе нет «${needle}»`);
  }
  for (const needle of expectNotContains) {
    if (output.includes(needle)) problems.push(`в выводе есть лишнее «${needle}»`);
  }
  results.push({ name, ok: problems.length === 0, problems, output });
}

// =========================================================================
// 1. ИСТОРИЯ — четыре проявления класса дефекта
// =========================================================================

// -- H1. X-73 (R0-03) ------------------------------------------------------
// Дословная форма: два отрицательных утверждения о собственном незнании,
// оба ложные. Здесь они адресованы слою ui/, потому что именно утверждения
// о ui/ этот гейт умеет проверять; форма отрицания та же.
const H1_TEXT = `<p>В <code>ui/</code> префикс <code>desktop:</code>
  не встречается ни разу, и утилиты <code>small-phone:text-*</code>
  не объявлены.</p>`;

probe('H1 (X-73, R0-03): отрицание о desktop: и small-phone:text-*, опровергнутое ui/', {
  fixtureOpts: { ui: UI_WITH_DESKTOP, html: page(H1_TEXT), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['Отрицание о ui/', 'desktop:hidden', 'small-phone:text-center'],
});

probe('H1-green: то же отрицание при слое, где этих классов действительно нет', {
  fixtureOpts: { ui: UI_ONE, html: page(H1_TEXT), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

// -- H2. R2-01 -------------------------------------------------------------
// Витрина утверждала работающую утилиту цвета, которой в ui/ нет.
const H2_FALSE = `<p>Звезду рейтинга красит жёлтым утилита
  <code>text-ui-yellow-500</code> из <code>ui/</code>.</p>`;
const H2_TRUE = `<p>Утилита <code>text-ui-yellow-500</code> в <code>ui/</code>
  не определена — значок ниже тёмный, унаследованный.</p>`;

probe('H2 (R2-01): положительное утверждение об утилите, которой в ui/ нет', {
  fixtureOpts: { html: page(H2_FALSE), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['но в ui/ этого нет', 'text-ui-yellow-500'],
});

probe('H2-green: та же утилита, названная отсутствующей', {
  fixtureOpts: { html: page(H2_TRUE), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

// -- H3. R0-07, первая приёмка --------------------------------------------
const H3_FALSE = `<p>Сам <code>ui/</code> из шести префиксов поднимает только два.</p>`;
const H3_TRUE = `<p>Сам <code>ui/</code> из шести префиксов поднимает три.</p>`;

probe('H3 (R0-07, приёмка 1): «из шести префиксов ui/ поднимает только два»', {
  fixtureOpts: { html: page(H3_FALSE), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['bp.prefixes.ui', 'заявлено 2', 'разбор ui/ даёт 3'],
});

probe('H3-green: «поднимает три» при трёх поднятых префиксах', {
  fixtureOpts: { html: page(H3_TRUE), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

// -- H4. R0-07, вторая приёмка --------------------------------------------
// Дословный текст `showcase/components.css:703–706`.
const H4_FALSE_CSS = `.doc-bp__lamp { color: #000; }

/* Условия ниже — копия шести условий сборки Курсов, снятых брейс-сканом
   (docs/guide/layout.md, «Брейкпоинты»). Оболочка воспроизводит их у себя,
   чтобы границы было видно перетаскиванием окна: в ui/ из шести поднят
   только phone:, и только для двух ступеней шкалы. */
@media (max-width: 479px) {
  .doc-bp__lamp--small-phone { color: #1a5b2e; }
}
`;
const H4_TRUE_CSS = H4_FALSE_CSS.replace(
  'в ui/ из шести поднят\n   только phone:, и только для двух ступеней шкалы.',
  'в ui/ из шести подняты\n   только phone:, small-phone: и tablet:.');

probe('H4 (R0-07, приёмка 2): то же предложение в комментарии showcase/*.css', {
  fixtureOpts: { html: page('<p>Раздел брейкпоинтов.</p>'), css: H4_FALSE_CSS },
  expectCode: 1,
  expectContains: ['Перечисление «только', 'components.css:5', 'small-phone:', 'tablet:'],
});

probe('H4-green: то же место с перечислением всех трёх поднятых префиксов', {
  fixtureOpts: { html: page('<p>Раздел брейкпоинтов.</p>'), css: H4_TRUE_CSS },
  expectCode: 0,
});

probe('H4-контроль: разметка починена, комментарий CSS — нет (вторая приёмка дословно)', {
  fixtureOpts: {
    html: page(`<p>Сам <code>ui/</code> из шести префиксов поднимает три, и всего
      четырьмя классами: <code>phone:text-h1-mobile</code>,
      <code>phone:text-h2</code>, <code>small-phone:text-center</code>
      и <code>tablet:px-6</code>.</p>`),
    css: H4_FALSE_CSS,
  },
  expectCode: 1,
  expectContains: ['components.css:5'],
});

// =========================================================================
// 2. НОСИТЕЛИ
// =========================================================================

const FALSE_SENTENCE = 'В ui/ из шести поднят только phone:.';

probe('Носитель: текст разметки', {
  fixtureOpts: { html: page(`<p>${FALSE_SENTENCE}</p>`), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Носитель: HTML-комментарий', {
  fixtureOpts: { html: page(`<!-- ${FALSE_SENTENCE} -->`), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Носитель: комментарий showcase/*.css', {
  fixtureOpts: { html: page('<p>чисто</p>'), css: `/* ${FALSE_SENTENCE} */\n.doc-x{color:#000}\n` },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Носитель: комментарий инлайнового <style> витрины', {
  fixtureOpts: {
    html: page('<p>чисто</p>', { head: `<style>\n/* ${FALSE_SENTENCE} */\n.doc-x{color:#000}\n</style>` }),
    css: '.doc-y{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только', 'components.html:4'],
});

probe('Носитель: комментарий внутри @media в showcase/*.css', {
  fixtureOpts: {
    html: page('<p>чисто</p>'),
    css: `@media (max-width: 479px) {\n  /* ${FALSE_SENTENCE} */\n  .doc-x{color:#000}\n}\n`,
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

// =========================================================================
// 3. ФОРМА ТЕКСТА
// =========================================================================

probe('Форма: CRLF в комментарии CSS', {
  fixtureOpts: {
    html: page('<p>чисто</p>'),
    css: `/* Оболочка воспроизводит условия у себя:\r\n   в ui/ из шести поднят только phone:. */\r\n.doc-x{color:#000}\r\n`,
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Форма: CRLF в разметке', {
  fixtureOpts: {
    html: page(`<p>${FALSE_SENTENCE}</p>`).split('\n').join('\r\n'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Форма: висячие пробелы и табы вокруг утверждения', {
  fixtureOpts: {
    html: page(`<p>   \t\n  В ui/ из шести поднят   только\t phone:.  \t\n  </p>   `),
    css: '.doc-x{color:#000}\t\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Форма: незакрытый тег ПЕРЕД утверждением не съедает его молча', {
  fixtureOpts: {
    html: `<!doctype html><html><body><div class="a"\n<p>${FALSE_SENTENCE}</p>\n</body></html>`,
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Форма: незакрытый тег ПОСЛЕ утверждения', {
  fixtureOpts: {
    html: `<!doctype html><html><body><p>${FALSE_SENTENCE}</p>\n<div class="b"`,
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('Форма: незакрытый HTML-комментарий до конца файла читается, а не теряется', {
  fixtureOpts: {
    html: `<!doctype html><html><body><p>чисто</p>\n<!-- ${FALSE_SENTENCE}`,
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

// Незакрытый комментарий CSS — единственное место, где текст утверждения
// прочитать нельзя в принципе. Важно не то, какая именно диагностика
// выводится, а то, что гейт об этом говорит и падает: «комментарии этого
// файла не прочитаны» — не то же самое, что «расхождений нет». Ровно
// в этом состоит X-81: тихий ноль неотличим от чистого результата.
probe('Форма: незакрытый комментарий CSS — явная находка, а не тихий ноль', {
  fixtureOpts: {
    html: page('<p>чисто</p>'),
    css: `.doc-x{color:#000}\n/* ${FALSE_SENTENCE}\n`,
  },
  expectCode: 1,
  expectContains: ['не разобран настоящим парсером', 'Unclosed comment', 'не прочитаны'],
});

probe('Форма: `/*` внутри строки CSS комментарием не считается', {
  fixtureOpts: {
    html: page('<p>чисто</p>'),
    css: `.doc-x{background:url("a/*b.png")}\n.doc-y[data-t="/* в ui/ только phone: */"]{color:#000}\n`,
  },
  expectCode: 0,
});

probe('Форма: тело <script> прозой не читается', {
  fixtureOpts: {
    html: page('<p>чисто</p>', { head: `<script>var s = "В ui/ из шести поднят только phone:.";</script>` }),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('Форма: точка внутри пути не рвёт предложение', {
  fixtureOpts: {
    html: page(`<p>Правило живёт в <code>ui/foundations.css</code>, и в ui/ из шести
      поднят только <code>phone:</code>.</p>`),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

// =========================================================================
// 4. ВИДЫ НАХОДОК
// =========================================================================

probe('claim-negative: «в ui/ нет .text-h1» при объявленном .text-h1', {
  fixtureOpts: { html: page('<p>В <code>ui/</code> правила <code>.text-h1</code> нет.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['Отрицание о ui/', 'text-h1'],
});

probe('claim-negative через экранирование: ui/ объявляет .small-phone\\:text-center', {
  fixtureOpts: {
    html: page('<p>В <code>ui/</code> утилиты <code>small-phone:text-center</code> нет.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['small-phone:text-center'],
});

probe('claim-negative green: «в ui/ нет .tablet:flex» — и правда нет', {
  fixtureOpts: { html: page('<p>В <code>ui/</code> утилиты <code>tablet:flex</code> нет.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

probe('claim-positive green: названный класс в ui/ есть', {
  fixtureOpts: { html: page('<p>Ступень <code>.text-h2</code> живёт в <code>ui/foundations.css</code>.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

probe('claim-exhaustive green: перечислены все три поднятых префикса', {
  fixtureOpts: {
    html: page('<p>В <code>ui/</code> подняты только <code>phone:</code>, <code>small-phone:</code> и <code>tablet:</code>.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('claim-exhaustive: «лишь» распознаётся так же, как «только» (кириллическая граница слова)', {
  fixtureOpts: { html: page('<p>В <code>ui/</code> поднят лишь <code>phone:</code>.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['Перечисление «только'],
});

probe('claim-location: назван не тот файл и не та строка', {
  fixtureOpts: {
    html: page('<p>Утилита <code>small-phone:text-center</code> живёт в ui/foundations.css, строка 999.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['Названы файл и строка ui/'],
});

probe('claim-location green: файл и строка названы верно', {
  fixtureOpts: {
    html: page('<p>Утилита <code>small-phone:text-center</code> живёт в ui/utilities.css, строка 2.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('claim-location green: два адреса и две сущности не сверяются перекрёстно', {
  fixtureOpts: {
    html: page(`<p><code>small-phone:text-center</code> (ui/utilities.css, строка 2)
      и <code>tablet:px-6</code> (ui/layout.css, строка 7).</p>`),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('claim-unscoped: отрицание о сущности без названного слоя', {
  fixtureOpts: { html: page('<p>Класса <code>.text-card-title</code> нигде нет.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['без названного слоя'],
});

probe('Слой назван чужим: «в сборке .text-h1 нет» — не наше утверждение', {
  fixtureOpts: { html: page('<p>В сборке класса <code>.text-h1</code> нет.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

probe('Наследование отрицания: перечисление после одного «не раскрываются»', {
  fixtureOpts: {
    html: page(`<p>Не раскрываются в подключённом <code>ui/courses.css</code> три префикса
      целиком — <code>desktop:</code>, <code>tablet-only:</code>,
      <code>phablet-and-tablet:</code>, — и все утилиты <code>tablet:*</code>,
      кроме <code>px-6</code>, в том числе <code>tablet:flex</code>.</p>`),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('Наследование отрицания не перетекает в клаузу со своим сказуемым', {
  fixtureOpts: {
    html: page('<p>Плашка не знает значения палитры: фон ей задаёт var(--color-…) из <code>ui/foundations.css</code>.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

// -- числа, X-90 -----------------------------------------------------------

probe('claim-quantity: число переменных :root разошлось с разбором ui/', {
  fixtureOpts: { html: page('<p>99 переменных :root.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['vars.total', 'заявлено 99', 'разбор ui/ даёт 4'],
});

probe('claim-quantity green: то же число, посчитанное верно', {
  fixtureOpts: { html: page('<p>4 переменные :root.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 0,
});

probe('claim-quantity: пометки переменных ([NO MARKUP] / [UNREFERENCED] / [RUNTIME])', {
  fixtureOpts: {
    html: page(`<dl><div><dt>unreferenced</dt><dd>7</dd></div>
      <div><dt>runtime</dt><dd>1</dd></div></dl>`),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['vars.unreferenced', 'заявлено 7', 'разбор ui/ даёт 1'],
  expectNotContains: ['vars.runtime'],
});

probe('claim-quantity: числительное словами читается наравне с цифрой', {
  fixtureOpts: { html: page('<p>Сорок одна цветовая переменная :root.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 1,
  expectContains: ['vars.color', 'заявлено 41', 'разбор ui/ даёт 2'],
});

probe('claim-quantity: геометрия контейнера и сетки выводится из ui/', {
  fixtureOpts: {
    html: page(`<p>Контейнер: <code>max-width: 900px</code>; зона содержимого 700px;
      это gap-12 = 40px.</p>`),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['container.maxWidth', 'container.zone', 'grid.gap'],
});

probe('claim-quantity green: та же геометрия с настоящими числами ui/', {
  fixtureOpts: {
    html: page(`<p>Контейнер: <code>max-width: 1124px</code>; зона содержимого 1076px;
      это gap-12 = 48px.</p>`),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('claim-quantity: явная форма data-claim', {
  fixtureOpts: {
    html: page('<p><b data-claim="scale.steps">17</b> ступеней шкалы.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['data-claim="scale.steps"', 'заявлено 17', 'разбор ui/ даёт 2'],
});

probe('claim-quantity green: data-claim с верным числом', {
  fixtureOpts: {
    html: page('<p><b data-claim="scale.steps">2</b> ступени шкалы.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

probe('claim-quantity: число из manifest (шесть префиксов сборки) сверяется, когда реестр есть', {
  fixtureOpts: {
    html: page('<p>Пять префиксов сборки, каждый — ровно одно условие.</p>'),
    css: '.doc-x{color:#000}\n',
    manifest: { breakpoints: { prefixes: { 'a:': 1, 'b:': 2, 'c:': 3, 'd:': 4, 'e:': 5, 'f:': 6 } } },
  },
  expectCode: 1,
  expectContains: ['bp.prefixes.total', 'заявлено 5', 'разбор ui/ даёт 6'],
});

probe('claim-quantity green: невыводимая величина не даёт находки, а попадает в перепись', {
  fixtureOpts: {
    html: page('<p>Пять префиксов сборки, каждый — ровно одно условие.</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 0,
});

// -- вырожденные случаи ----------------------------------------------------

probe('Витрины нет — код 2, а не зелёный ноль', {
  fixtureOpts: { html: null, css: null },
  expectCode: 2,
  expectContains: ['Витрины ещё нет'],
});

probe('Слоя ui/ нет — код 2, а не зелёный ноль', {
  fixtureOpts: { ui: {}, html: page('<p>В ui/ из шести поднят только phone:.</p>'), css: '.doc-x{color:#000}\n' },
  expectCode: 2,
  expectContains: ['Продуктового слоя ui/ нет'],
});

probe('ui/ не разбирается парсером — явная находка, а не «чисто»', {
  fixtureOpts: {
    ui: { ...UI_THREE, 'broken.css': '.a{color:red;\n' },
    html: page('<p>чисто</p>'),
    css: '.doc-x{color:#000}\n',
  },
  expectCode: 1,
  expectContains: ['не разобран настоящим парсером'],
});

probe('Чистая витрина — зелёный ноль с внятным итогом', {
  fixtureOpts: {
    html: page(`<p>Раздел показывает <code>.text-h1</code> и <code>.text-h2</code>
      из <code>ui/foundations.css</code>. В <code>ui/</code> подняты только
      <code>phone:</code>, <code>small-phone:</code> и <code>tablet:</code>.</p>`),
    css: `/* Оболочка витрины воспроизводит условия сборки у себя. */\n.doc-x{color:#000}\n`,
  },
  expectCode: 0,
  expectContains: ['Расхождений нет'],
});

// =========================================================================
// Итог
// =========================================================================

const failed = results.filter(r => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.name}`);
  if (!r.ok) {
    for (const problem of r.problems) console.log(`     ${problem}`);
    console.log('     --- вывод инструмента ---');
    for (const line of r.output.split('\n')) console.log(`     ${line}`);
    console.log('     -------------------------');
  }
}

console.log('');
console.log(`Пройдено ${results.length - failed.length} из ${results.length} проб.`);

fs.rmSync(tmpRoot, { recursive: true, force: true });

if (failed.length) {
  console.error(`Провалено проб: ${failed.length} — см. FAIL выше.`);
  process.exit(1);
}
