/**
 * Регрессионные пробы для `tools/validate-classes.mjs` (METHOD §6.1/§6.2),
 * после переписывания механизма разбора с ручного регэкспа на настоящий
 * CSS-парсер (`postcss` + `postcss-selector-parser`), R0-06.
 *
 * Каждая проба строит изолированный фиктивный пакет (свои `ui/` и
 * `showcase/`) во временном каталоге и запускает настоящий CLI
 * (`node tools/validate-classes.mjs`) с этим каталогом как рабочей
 * директорией — не вызывает внутренние функции напрямую. Разбор рабочей
 * директории у самого инструмента не меняется: `ui`/`showcase` читаются
 * относительно `process.cwd()`, поэтому изоляция через `cwd` эквивалентна
 * копии пакета в отдельном каталоге, которую строили ревьюеры вручную —
 * только автоматизированная и воспроизводимая при каждом запуске.
 *
 * Три группы проб:
 *   1. Регрессия — все четыре обхода гейта §6.2, найденные за три итерации
 *      ревью R0-06 (review-1, review-2, review-3), плюс контрольные пробы,
 *      которые обязаны оставаться зелёными.
 *   2. Новые пробы на углы именно парсерного подхода (не то, что ловил
 *      старый регэксп, — то, что мог сломать новый механизм: строки со
 *      скобками внутри селекторов, @keyframes, @custom-media, ::part/
 *      ::slotted, комментарий со скобкой внутри правила).
 *   3. Проверка, что сам инструмент не падает необработанно на CSS, который
 *      не разбирается настоящим парсером, а честно об этом сообщает
 *      (найдено на реальном `ui/layout.css` в процессе этой работы).
 *
 * Запуск: node tools/validate-classes.selftest.mjs
 * Код возврата: 0 — все пробы дали ожидаемый результат; 1 — хотя бы одна
 * проба разошлась с ожиданием (значит регрессия или новый обход).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(here, 'validate-classes.mjs');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-classes-selftest-'));
let fixtureCounter = 0;

function html(styleBlock = '') {
  return `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>fixture</title>
<link rel="stylesheet" href="../ui/courses.css">
<link rel="stylesheet" href="components.css">
${styleBlock}
</head>
<body class="doc-body">
<div class="doc-layout"></div>
</body>
</html>
`;
}

// Строит изолированный фиктивный пакет: ui/<uiFiles> + showcase/components.css
// (BASE_DOC_CSS + extraCss) + showcase/components.html (с опциональным
// инлайновым <style>). Возвращает путь к каталогу пакета.
const BASE_DOC_CSS = '.doc-body { margin: 0; }\n.doc-layout { display: block; }\n';

function fixture({ uiFiles = {}, showcaseCss = '', inlineStyle = '', inlineStyles = null } = {}) {
  fixtureCounter += 1;
  const root = path.join(tmpRoot, String(fixtureCounter));
  fs.mkdirSync(path.join(root, 'ui'), { recursive: true });
  fs.mkdirSync(path.join(root, 'showcase'), { recursive: true });
  for (const [name, content] of Object.entries(uiFiles)) {
    const full = path.join(root, 'ui', name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  if (Object.keys(uiFiles).length === 0) {
    // walk('ui') должен найти хоть один файл, иначе uiCssFiles = [] и §6.2
    // по ui/ ничего не проверяет — не то, что нужно пробам на showcase.
    fs.writeFileSync(path.join(root, 'ui', 'courses.css'), '.product { color: black; }\n');
  }
  // `inlineStyles` — массив содержимого нескольких отдельных <style>-блоков
  // (review-4, находка 1: второй и следующий блок нельзя было отличить от
  // первого). `inlineStyle` — прежний путь с ровно одним блоком, оставлен
  // для всех существующих проб как есть.
  const blocks = inlineStyles ?? (inlineStyle ? [inlineStyle] : []);
  const styleTag = blocks.map(css => `<style>\n${css}\n</style>`).join('\n');
  fs.writeFileSync(path.join(root, 'showcase', 'components.css'), BASE_DOC_CSS + showcaseCss);
  fs.writeFileSync(path.join(root, 'showcase', 'components.html'), html(styleTag));
  return root;
}

function run(root) {
  const result = spawnSync('node', [scriptPath], { cwd: root, encoding: 'utf8' });
  return { code: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

const results = [];

function probe(name, { fixtureOpts, expectCode, expectContains = [], expectNotContains = [] }) {
  const root = fixture(fixtureOpts);
  const { code, stdout, stderr } = run(root);
  const output = stdout + stderr;
  const problems = [];
  if (code !== expectCode) {
    problems.push(`код возврата ${code}, ожидался ${expectCode}`);
  }
  for (const needle of expectContains) {
    if (!output.includes(needle)) problems.push(`в выводе нет: ${JSON.stringify(needle)}`);
  }
  for (const needle of expectNotContains) {
    if (output.includes(needle)) problems.push(`в выводе есть (не должно): ${JSON.stringify(needle)}`);
  }
  results.push({ name, ok: problems.length === 0, problems, output });
}

// =========================================================================
// 1. Регрессия — обходы review-1, review-2, review-3 и контрольные пробы
// =========================================================================

probe('R-a: инлайновый <style> витрины с протечкой', {
  fixtureOpts: { inlineStyle: '.leaked-shell { color: red; }' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .leaked-shell'],
});

probe('R-k (review-4, находка 1): второй <style> в файле не теряется в кеше первого', {
  // До review-4 R0-06 оба места, что зовут parseCss для инлайновых <style>,
  // помечали каждый блок одинаковым ярлыком `${file} <style>» независимо от
  // порядкового номера — второй и следующий блок получали закешированный
  // результат первого вместо разбора своего содержимого, и протечка в них
  // не проверялась вовсе (EXIT=0 вместо ожидаемого EXIT=1). Первый блок —
  // чистый (несёт doc-), второй — протекает обычным классом без doc-.
  fixtureOpts: {
    inlineStyles: [
      '.doc-first-block { color: red; }',
      '.second-block-leak-no-prefix { color: blue; }',
    ],
  },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .second-block-leak-no-prefix'],
  expectNotContains: ['селектор без класса витрины doc- — .doc-first-block'],
});

probe('R-j: символьное экранирование внутри селектора без doc- (\\:)', {
  fixtureOpts: { showcaseCss: '.hover\\:leak { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .hover\\:leak (классы после разбора: hover:leak)'],
});

probe('bare-selector control: button, input, a', {
  fixtureOpts: { showcaseCss: 'button, input, a { color: red; }\n' },
  expectCode: 1,
  expectContains: [
    'селектор без класса витрины doc- — button',
    'селектор без класса витрины doc- — input',
    'селектор без класса витрины doc- — a',
  ],
});

probe('атрибутный селектор без класса — протечка', {
  fixtureOpts: { showcaseCss: '[class~="leaked-shell"] { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — [class~="leaked-shell"]'],
});

probe('R-x1 (review-2): потомок .doc-specimen .card — не все классы doc-', {
  fixtureOpts: { showcaseCss: '.doc-specimen .card { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .doc-specimen .card'],
});

probe('R-x2 (review-2): составной .doc-badge.leaked-name — не все классы doc-', {
  fixtureOpts: { showcaseCss: '.doc-badge.leaked-name { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .doc-badge.leaked-name'],
});

probe('R-x5 (review-2): @container с bare-селекторами внутри', {
  fixtureOpts: { showcaseCss: '@container (min-width: 1px) {\n  button, input, a { color: red; }\n}\n' },
  expectCode: 1,
  expectContains: [
    'селектор без класса витрины doc- — button',
    'селектор без класса витрины doc- — input',
    'селектор без класса витрины doc- — a',
  ],
});

probe('T1 (fix-2): тройной составной .doc-badge.leaked-mid.doc-other', {
  fixtureOpts: { showcaseCss: '.doc-badge.leaked-mid.doc-other { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .doc-badge.leaked-mid.doc-other'],
});

probe('T3 (fix-2): тройная вложенность @container > @media', {
  fixtureOpts: {
    showcaseCss: '@container (min-width: 1px) {\n  @media (min-width: 1px) {\n    .leaked-nested-a { color: red; }\n  }\n}\n',
  },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .leaked-nested-a'],
});

probe('T5/контроль (fix-2): @import/@charset без тела не глотают следующий блок', {
  fixtureOpts: {
    showcaseCss: '@charset "UTF-8";\n@import url("other.css");\n.leaked-after-import { color: red; }\n',
  },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .leaked-after-import'],
});

probe('R-d: класс doc- в продуктовом слое (ui/)', {
  fixtureOpts: {
    uiFiles: { 'tokens.css': '@media (min-width: 1px) {\n  .doc-leak { color: red; }\n}\n' },
  },
  expectCode: 1,
  expectContains: ['класс оболочки витрины в продуктовом слое — .doc-leak'],
});

probe('R-f: переменная --doc- используется в продуктовом слое (ui/)', {
  fixtureOpts: {
    uiFiles: { 'tokens.css': '.product { background: var(--doc-bg); }\n' },
  },
  expectCode: 1,
  expectContains: ['переменная оболочки витрины в продуктовом слое — --doc-bg'],
});

// --- Финальный, ранее непобеждённый обход (review-3, находка 1) --------

probe('ESC-1 (review-3, находка 1а): hex-escape маскирует непрефиксованный класс в showcase', {
  fixtureOpts: { showcaseCss: '.doc-badge.\\6c eaked-hidden { background: lime; }\n' },
  expectCode: 1,
  // Реальный класс, который видит браузер, — "leaked-hidden" (без doc-);
  // postcss-selector-parser декодирует hex-escape так же, как браузер.
  expectContains: ['селектор без класса витрины doc- — .doc-badge.\\6c eaked-hidden (классы после разбора: doc-badge, leaked-hidden)'],
});

probe('ESC-2 (review-3, находка 1б): hex-escape маскирует doc-* класс в ui/', {
  fixtureOpts: {
    uiFiles: { 'tokens.css': '.\\64 oc-injected-hack { color: red; }\n' },
  },
  expectCode: 1,
  expectContains: ['класс оболочки витрины в продуктовом слое — .doc-injected-hack'],
});

probe('ESC-3: hex-escape без пробела-разделителя перед не-hex символом', {
  // \70 = 'p', следующий символ 'r' не hex-цифра — разделитель не нужен.
  // ".doc-badge.\70roduct-leak" декодируется в ".doc-badge.product-leak".
  fixtureOpts: { showcaseCss: '.doc-badge.\\70roduct-leak { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .doc-badge.\\70roduct-leak (классы после разбора: doc-badge, product-leak)'],
});

probe('ESC-4: символьное экранирование точки — класс несёт "doc", но не "doc-"', {
  // ".doc\.dot" декодируется в класс "doc.dot" — начинается с "doc", но не
  // с "doc-" (четвёртый символ "." — не "-"), поэтому это протечка, а не
  // легитимный класс оболочки. Проверяет, что критерий — точный префикс
  // "doc-", а не подстрока "doc".
  fixtureOpts: { showcaseCss: '.doc\\.dot { color: red; }\n' },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .doc\\.dot (классы после разбора: doc.dot)'],
});

probe('ESC-5 (review-3, находка-note 3): легитимный doc-* класс через hex-escape — НЕ протечка', {
  // Обратная сторона ESC-2: класс легитимен (доc-legit-name), просто
  // записан через hex-escape — например, скопирован из инструмента вроде
  // PostCSS, который экранирует спецсимволы в именах классов. Правильный
  // разбор не должен путать его с протечкой.
  fixtureOpts: { showcaseCss: '.\\64 oc-legit-name { color: green; }\n' },
  expectCode: 0,
  expectNotContains: ['селектор без класса витрины doc-'],
});

probe('Регрессия-контроль: чистый showcase (только doc-*) и чистый ui/', {
  fixtureOpts: {
    showcaseCss: '.doc-extra { color: blue; }\n',
    uiFiles: { 'tokens.css': '.product { color: black; }\n:root { --brand: red; }\n' },
  },
  expectCode: 0,
  expectContains: ['All defined.'],
});

// =========================================================================
// 2. Новые пробы — углы именно парсерного подхода
// =========================================================================

probe('NEW-1: строка со скобкой внутри значения атрибутного селектора', {
  // Ручной разбор скобок ("посчитать { и }, не глядя на содержимое строк")
  // спутал бы { внутри строки атрибута с открытием следующего блока.
  // Настоящий парсер обязан правильно разделить оба правила.
  fixtureOpts: {
    showcaseCss: '[data-foo="a{b}"] { color: red; }\n.leaked-after-attr-brace { color: blue; }\n',
  },
  expectCode: 1,
  expectContains: [
    'селектор без класса витрины doc- — [data-foo="a{b}"]',
    'селектор без класса витрины doc- — .leaked-after-attr-brace',
  ],
});

probe('NEW-2: @custom-media с именем --doc- в продуктовом слое', {
  fixtureOpts: {
    uiFiles: { 'tokens.css': '@custom-media --doc-narrow (width < 600px);\n.product { color: black; }\n' },
  },
  expectCode: 1,
  expectContains: ['переменная оболочки витрины в продуктовом слое — --doc-narrow'],
});

probe('NEW-3: ::part()/::slotted() без класса — протечка (bare-селектор)', {
  fixtureOpts: {
    showcaseCss: 'my-widget::part(header) { color: red; }\n::slotted(span) { color: blue; }\n',
  },
  expectCode: 1,
  expectContains: [
    'селектор без класса витрины doc- — my-widget::part(header)',
    'селектор без класса витрины doc- — ::slotted(span)',
  ],
});

probe('NEW-4: комментарий со скобкой внутри правила не путает границы блоков', {
  fixtureOpts: {
    showcaseCss: '.doc-comment {\n  /* } не настоящая закрывающая скобка { */\n  color: red;\n}\n.leaked-after-comment { color: blue; }\n',
  },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .leaked-after-comment'],
  expectNotContains: ['селектор без класса витрины doc- — .doc-comment'],
});

probe('NEW-5: @import с параметром, похожим на блок ({ и ; внутри url-строки)', {
  fixtureOpts: {
    showcaseCss: '@import url("a{b};c.css");\n.leaked-after-import-brace { color: red; }\n',
  },
  expectCode: 1,
  expectContains: ['селектор без класса витрины doc- — .leaked-after-import-brace'],
});

probe('NEW-6 (контроль): @keyframes с процентными селекторами — не ложная протечка', {
  fixtureOpts: {
    showcaseCss: '@keyframes doc-spin {\n  0% { opacity: 0; }\n  50% { opacity: .5; }\n  to { opacity: 1; }\n}\n.doc-spinner { animation: doc-spin 1s; }\n',
  },
  expectCode: 0,
  expectContains: ['All defined.'],
});

probe('NEW-7: @property с именем --doc- в продуктовом слое', {
  fixtureOpts: {
    uiFiles: {
      'tokens.css': '@property --doc-x {\n  syntax: "<color>";\n  inherits: false;\n  initial-value: red;\n}\n.product { color: black; }\n',
    },
  },
  expectCode: 1,
  expectContains: ['переменная оболочки витрины в продуктовом слое — --doc-x'],
});

// =========================================================================
// 3. CSS, который не разбирается настоящим парсером, — честный отказ,
//    а не молчаливое "чисто" и не необработанное падение процесса.
// =========================================================================

// Точная копия фрагмента, на котором споткнулся настоящий парсер в реальном
// `ui/layout.css` этого пакета (строки ~166–206): комментарий-пояснение
// содержит запись `phone:gap-*/tablet:gap-*`, и подстрока `*/` в середине —
// валидный, но не предполагавшийся автором конец CSS-комментария (комментарии
// CSS не бывают вложенными: первый `*/` всегда закрывает их, без исключений).
// Всё, что дальше и до настоящего `*/` в конце блока, — не текст комментария,
// а невалидные CSS-токены верхнего уровня. Старый регэксп-разбор этого не
// замечал (сам был нестрогим и не проверял синтаксис), поэтому дефект был
// неразличим три итерации подряд. Строка НЕ входит в границы этого шага
// (`ui/layout.css` принят на R0-04 и не редактируется здесь) — проба лишь
// проверяет, что инструмент не падает необработанно и не молчит об этом.
const REAL_LAYOUT_CSS_COMMENT_BUG = `/* -------------------------------------------------------------------------
   3. Сетка секций
   -------------------------------------------------------------------------
   Внутри контейнера страницы складывают секции в одну колонку через
   grid, не flex — правило подтверждено на 7/7 страниц, где вообще есть
   более одной секции верхнего уровня (author, authors и editors —
   персональные/редакционные страницы, у них другая, более простая
   структура, см. «Ограничения» docs/guide/layout.md):

     relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 (+ pt/pb)

   grid-cols-[minmax(0,1fr)] — одна колонка, растянутая на всю ширину;
   grid здесь используется ради gap, а не ради многоколоночной раскладки.
   gap-12 = 48px — межсекционный интервал, одинаковый на всех 7 страницах
   и на всех измеренных ширинах (нет ни одного phone:gap-*/tablet:gap-*
   рядом с этой связкой в разметке — 0 вхождений).

   Вертикальный отступ секции (pt/pb) варьируется по страницам и в это
   правило не входит — победитель и проигравшие с адресами:

     pt-10 pb-10 (40px/40px)   5/7 — education-centers-listing, promocodes,
                                     rating, reviews, schools-for-children
     pt-6  pb-6  (24px/24px)   1/7 — courses-listing
     pt-6  pb-28 + phone:pt-0  1/7 — education-center (единственная страница
                                     с responsive-исключением у этой сетки)

   pt-10/pb-10 — победитель по частоте (5/7), включён в этот файл;
   pt-6/pb-6 и связка education-center — не сверстаны, это меньшинство
   (METHOD §8: редкое не приводит к альтернативному канону).

   Восьмое вхождение gap-12 — на education-centers-listing, класс
   \`grid gap-12\` без grid-cols-[minmax(0,1fr)], px-0 и relative: другой,
   более простой узел (вложенный список, не секция страницы). В счёт
   правила «сетка секций» не входит — GAP в docs/guide/layout.md.

   Источник: dom.html десяти страниц, точное совпадение полного набора
   токенов класса; правила — corpus 22 файла, побайтово совпадают;
   geometry (grid-template-columns:1076px на 1440, gap:48px) —
   computed.json курса courses-listing, узел с классом
   relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pb-6 pt-6.
   ------------------------------------------------------------------------- */
.relative{position:relative}
`;

probe('PARSE-ERROR: комментарий с преждевременным "*/" внутри (реальный дефект ui/layout.css)', {
  fixtureOpts: {
    uiFiles: { 'broken.css': REAL_LAYOUT_CSS_COMMENT_BUG },
  },
  expectCode: 1,
  expectContains: ['CSS не разобран настоящим парсером', 'broken.css'],
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
