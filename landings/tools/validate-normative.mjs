/**
 * Норматив не выдан за факт — инварианты И-1 и И-2 (BRIEF §10), METHOD §4.
 *
 * Проверка специфична для этого пакета. Причина в источниках: собственных
 * переменных Figma у лендингов нет, и слой токенов выводится из сырых
 * литералов. Точнее, чем прежняя формулировка «переменных Figma нет»,
 * которая была шире факта:
 *
 *   бренд-доски   get_variable_defs → {} на 4 узлах из 4;
 *   артборды      get_variable_defs → только logo/* (18085:3890, 17473:826);
 *   инстансы      get_variable_defs на 20319:366 (button / XL / main внутри
 *   дизайн-       шапки 20216:120) → 11 переменных font/*, elements/button/
 *   системы       XL/*, size/spacing/x0 и текстовый стиль text bold. Они
 *   Хабра         приезжают вместе с вставленным компонентом и описывают
 *                 его, а не продуктовый слой лендинга.
 *
 * Механика маркеров от этого не меняется: продуктовых переменных лендинг
 * не заводит, и слой токенов всё равно собран из литералов. Как только литерал переехал в переменную, снятое и
 * спроектированное становятся неразличимы на вид: «#0f0f0f» одинаково
 * выглядит и когда его сняли с узла, и когда его придумали. Различить их
 * может только пометка, а пометку может сторожить только скрипт.
 *
 * Три области пакета — норматив целиком, и это решения владельца, а не вывод
 * из материала:
 *
 *   светлая тема       Р-2. Пар «один макет в двух темах» среди 22 узлов —
 *                      ноль (BRIEF §5 п. 5). Снять её было не с чего
 *   ось игривости      Р-3. Опоры в источнике есть (вес дисплея 13/13,
 *                      кислотный акцент, леттеринг 7/18), самой шкалы нет
 *   перенос на веб     BRIEF §5 п. 6. Все 23 баннера — пост 1080 × 1350,
 *                      веб-форматов в новом стиле ноль. Перенос — проектная
 *                      работа, а не снятие
 *
 * -------------------------------------------------------------------------
 * МЕХАНИКА
 * -------------------------------------------------------------------------
 * 1. Маркер в CSS. Каждое объявление в ui/ ** / *.css стоит под ближайшим
 *    маркером-комментарием выше. Маркер действует до следующего маркера
 *    или до конца файла:
 *
 *      /* @snapshot 02_Landings 20097:8612 — фон hero *\/
 *      /* @normative светлая тема: 0 пар тем (BRIEF §5 п. 5) *\/
 *
 *    @snapshot требует имя файла Figma и node id вида 20216:120 — строка
 *    «снято с макета» источником не является. @normative требует причину
 *    словами: маркер без причины — пожатие плечами, а не пометка.
 *    Объявление, над которым маркера нет вовсе, — ошибка.
 *
 * 2. Нормативные области под @snapshot — ошибка (И-2). Селектор светлой
 *    темы или переменная светлой темы под маркером @snapshot утверждает,
 *    что светлую тему сняли с узла. Снять её было не с чего.
 *
 * 3. Маркер в статьях. Раздел статьи, где упомянута нормативная область,
 *    обязан назвать её нормативом словами: «норматив», «спроектировано»,
 *    «спроектирована». Разделом считается кусок от заголовка до следующего
 *    заголовка того же или высшего уровня.
 *
 * Чего проверка не умеет и не притворяется, что умеет: она не судит, верно ли
 * снято значение, и не сверяет число с узлом Figma — это работа ревью
 * (guide-review). Она отвечает ровно на один вопрос: у каждого ли значения
 * названо происхождение и не подписано ли спроектированное как снятое.
 *
 * Запуск: node tools/validate-normative.mjs
 *
 * Коды возврата: 0 — сошлось; 1 — нарушение; 2 — проверять нечего: в ui/
 * нет ни одного объявления, статей нет. Каркас заводит R0-01, значения —
 * R0-02 и R0-03, статьи — волны R2–R3, и до них проверять действительно
 * нечего. Зелёный ноль на пустом месте был бы неотличим от зелёного нуля
 * на проверенном пакете.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relPath = (file) => path.relative(root, file).replace(/\\/g, '/');

const walk = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    })
  : []);

// Имена файлов Figma, на которые вправе ссылаться @snapshot. Берутся
// из инвентаризации, а не из головы: ссылка на несуществующий файл —
// такой же вымысел, как выдуманное значение.
const inventoryPath = path.join(root, '.pipeline', 'inventory.json');
const warnings = [];
let inventory = null;
if (!fs.existsSync(inventoryPath)) {
  warnings.push('.pipeline/inventory.json не найден — имя файла Figma в @snapshot не сверяется ни с чем');
} else {
  try {
    inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  } catch (error) {
    warnings.push(`.pipeline/inventory.json не разбирается как JSON (${error.message}) — имя файла Figma в @snapshot не сверяется`);
  }
}
const figmaFiles = new Set(
  Object.values(inventory?.sources ?? {}).map((source) => source?.name).filter(Boolean),
);

// -------------------------------------------------------------------------
// Нормативные области. triggerCss — по чему область узнаётся в CSS (селектор,
// преамбула @media, имя свойства); triggerText — по чему в статье.
// -------------------------------------------------------------------------
const AREAS = [
  {
    id: 'light-theme',
    title: 'светлая тема',
    why: 'решение Р-2: 0 пар «один макет в двух темах» среди 22 узлов (BRIEF §5 п. 5)',
    // «light» ловится сегментом имени, а не подстрокой: иначе под светлую
    // тему попадает --highlight-color, у которого с темой общего только
    // пять букв. Форм объявления темы много, и область обязана узнаваться
    // в каждой — селектором, атрибутом, классом, медиазапросом (находка 4
    // ревью-1): .theme-light и .light-theme проходили мимо.
    triggerCss: /(?:theme\s*[~|^$*]?=\s*["']?light\b|prefers-color-scheme:\s*light|\.(?:\w+-)*light(?:-\w+)*\b|--(?:[a-z0-9]+-)*light(?:-[a-z0-9]+)*\b)/i,
    triggerText: /светл(?:ая|ой|ую|ые|ых)\s+тем/i,
  },
  {
    id: 'playfulness',
    title: 'ось игривости',
    why: 'решение Р-3: опоры в источнике есть (вес дисплея 13/13, кислотный акцент, леттеринг 7/18), самой шкалы нет',
    // Форм записи оси в пакете две, и триггер обязан узнавать обе.
    // Прежде он ловил только имя переменной с сегментом play
    // (--concept-play-step) и класс .play*. Сама ось при этом записана
    // АТРИБУТНЫМИ СЕЛЕКТОРАМИ — [data-play="1"] … [data-play="4"], —
    // и под триггер не подпадали ни селектор, ни имена свойств, которые
    // ступень переключает (--core-font-heading, --core-weight-display).
    // Подмена маркера над этим блоком на @snapshot давала exit=0 и тишину:
    // решение владельца о четырёх ступенях можно было молча выдать
    // за снятое. Находка 02-5 ревью R0-02.
    //
    // Атрибут ловится в любой форме записи значения: [data-play],
    // [data-play="3"], [data-play='3'], [data-play~="3"].
    triggerCss: /(?:--(?:[a-z0-9]+-)*play(?:ful)?(?:-[a-z0-9]+)*\b|\.play(?:ful)?[\w-]*|\[\s*data-play(?:ful)?(?:ness)?\s*[~|^$*]?=?)/i,
    triggerText: /(?:ось|шкал\w*)\s+игривост/i,
  },
  {
    id: 'web-format',
    title: 'перенос брендового стиля на веб-формат',
    why: 'BRIEF §5 п. 6: 23 из 23 баннеров — пост 1080 × 1350, веб-форматов в новом стиле ноль',
    triggerCss: /(?:^|[^\w-])(?:--[\w-]*web-format[\w-]*|\.web-format[\w-]*)/i,
    triggerText: /веб-формат/i,
  },
];

const NORMATIVE_WORD = /норматив|спроектирован/i;

// -------------------------------------------------------------------------
// Контракт тем в ui/. Закрывает находку 4 ревью-1: светлая тема, написанная
// дефолтом в :root, проходила проверку зелёной, хотя это самая вероятная
// форма записи — ровно так устроен прецедент, на который пакет ссылается
// (Хабр light-v2.css / dark-v2.css: светлая база, тёмная оверрайдом).
//
// Тем в пакете две и обе названы: измеренная тёмная и нормативная светлая
// (ROADMAP, строка «Тем»; решение Р-2). Отсюда механика:
//
//   1. Область узнаётся по селектору и преамбуле: [data-theme="light"],
//      .theme-light, .light-theme, @media (prefers-color-scheme: light)
//      и те же формы для dark.
//   2. Если в самом блоке стоит color-scheme: light|dark, тема названа им.
//      Это не выдуманный маркер, а штатное свойство CSS, которое и означает
//      «эта область такой темы».
//   3. Безымянная корневая область (:root, html, body) — тоже тема. Какая
//      именно, выводится исключением: если ту же переменную перекрывает
//      тёмная тема, база — светлая, и наоборот. Тем две, третьей нет.
//   4. Переменная, которую не перекрывает никакая тема, темой не считается:
//      --brand-acid одинаков в обеих, и требовать от него имени темы незачем.
//
// Светлая область под @snapshot — ошибка И-2 в любой из этих форм.
// -------------------------------------------------------------------------
const LIGHT_SCOPE = /(?:theme\s*[~|^$*]?=\s*["']?light\b|prefers-color-scheme:\s*light|\.(?:\w+-)*light(?:-\w+)*\b)/i;
const DARK_SCOPE = /(?:theme\s*[~|^$*]?=\s*["']?dark\b|prefers-color-scheme:\s*dark|\.(?:\w+-)*dark(?:-\w+)*\b)/i;

const themeOfSelector = (context) => {
  const light = LIGHT_SCOPE.test(context);
  const dark = DARK_SCOPE.test(context);
  if (light && !dark) return 'light';
  if (dark && !light) return 'dark';
  return null;
};

// Корневая область — та, к которой цепляют слой токенов. Правило про
// безымянную тему касается только её: .card { --card-bg: #fff } — это
// компонент, а не тема, и имени темы с него требовать не за что.
const isRootScope = (selector) => selector.split(',')
  .map((part) => part.trim())
  .filter(Boolean)
  .every((part) => /^(?::root|html|body)$/.test(part));

// Цветом считается явный цветовой синтаксис. Ключевые слова (transparent,
// currentColor) намеренно не считаются: они одинаковы в любой теме.
const COLOUR_VALUE = /(?:#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\()/i;

const errors = [];
const notes = [];

// -------------------------------------------------------------------------
// 1–2. CSS: маркеры и нормативные области.
// -------------------------------------------------------------------------
// Комментарии заменяются пробелами той же длины, а не вырезаются: индексы
// объявлений обязаны остаться теми же, что в исходном файле, — иначе
// «ближайший маркер выше» и номер строки в сообщении указывают не туда.
const blankComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => ' '.repeat(comment.length));

const lineAt = (text, index) => text.slice(0, index).split('\n').length;

const readMarkers = (css, file) => {
  const markers = [];
  for (const match of css.matchAll(/\/\*([\s\S]*?)\*\//g)) {
    const body = match[1];
    // Маркер — отдельный комментарий, начинающийся с собаки. Иначе маркером
    // считалось бы любое упоминание слова @normative в пояснении, а шапка
    // ui/landings.css объясняет механику маркеров прозой — и объявляла бы
    // себя сломанным маркером при каждом запуске.
    if (!body.trim().startsWith('@')) continue;
    const snapshot = body.match(/^\s*@snapshot\s+(\S+)\s+(\S+)/);
    const normative = body.match(/^\s*@normative\s+([^\n*]*)/);
    if (snapshot) {
      const [, figmaFile, node] = snapshot;
      // Figma отдаёт два вида адреса: узел канвы «20216:120» и узел внутри
      // инстанса компонента «I1324:8108;1311:6801» — путь через слои инстанса.
      // Второй вид встречается там, где элемент пришёл из библиотеки: поле
      // формы и чекбокс узла 1324:7793 адресуются только так.
      if (!/^I?\d+:\d+(;\d+:\d+)*$/.test(node)) {
        errors.push(`${file}:${lineAt(css, match.index)} — @snapshot ${figmaFile} ${node}: ожидался node id вида 20216:120 или I1324:8108;1311:6801`);
      }
      if (figmaFiles.size && !figmaFiles.has(figmaFile)) {
        errors.push(`${file}:${lineAt(css, match.index)} — @snapshot ссылается на файл «${figmaFile}», которого нет среди источников (${[...figmaFiles].join(', ')})`);
      }
      markers.push({ index: match.index, kind: 'snapshot', text: `@snapshot ${figmaFile} ${node}`, line: lineAt(css, match.index) });
    } else if (normative) {
      const reason = normative[1].trim();
      if (reason.length < 12) {
        errors.push(`${file}:${lineAt(css, match.index)} — @normative без причины. Маркер называет, почему значение спроектировано, а не снято`);
      }
      markers.push({ index: match.index, kind: 'normative', text: `@normative ${reason}`, line: lineAt(css, match.index) });
    } else if (/@snapshot|@normative/.test(body)) {
      errors.push(`${file}:${lineAt(css, match.index)} — маркер написан не по форме. Ожидается «@snapshot <файл> <node>» или «@normative <причина>»`);
    }
  }
  return markers;
};

// Скан объявлений с учётом вложенности: возвращает индекс объявления, имя
// свойства, значение, стек преамбул (селектор и охватывающие @media),
// собственный селектор и индекс открывающей скобки своего блока — по нему
// объявления одного блока сходятся вместе (нужно для color-scheme).
const declarations = (css) => {
  const found = [];
  const stack = [];
  const blocks = [];
  let preambleStart = 0;
  let chunkStart = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      stack.push(css.slice(preambleStart, i).trim());
      blocks.push(i);
      preambleStart = i + 1;
      chunkStart = i + 1;
    } else if (ch === '}' || ch === ';') {
      if (stack.length) {
        const chunk = css.slice(chunkStart, i);
        const property = chunk.match(/^\s*(--[\w-]+|[a-zA-Z-]+)\s*:/);
        if (property) {
          found.push({
            index: chunkStart + chunk.indexOf(property[1]),
            property: property[1],
            value: chunk.slice(chunk.indexOf(property[0]) + property[0].length).trim(),
            context: stack.join(' '),
            selector: stack.at(-1) ?? '',
            block: blocks.at(-1) ?? -1,
          });
        }
      }
      if (ch === '}') { stack.pop(); blocks.pop(); }
      preambleStart = i + 1;
      chunkStart = i + 1;
    }
  }
  return found;
};

const cssFiles = walk(path.join(root, 'ui')).filter((file) => file.endsWith('.css'));
let declarationCount = 0;

// Первый проход: собрать объявления всех файлов и узнать тему каждого блока.
// Второй проход не обойтись одним: тема безымянной базовой области выводится
// из того, кто перекрывает её переменные, а перекрытие может стоять
// в другом файле.
const scanned = [];
for (const fullPath of cssFiles) {
  const file = relPath(fullPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const markers = readMarkers(raw, file);
  const blanked = blankComments(raw);
  const decls = declarations(blanked);
  declarationCount += decls.length;

  // Тема, названная свойством color-scheme внутри самого блока.
  const declaredByBlock = new Map();
  for (const decl of decls) {
    if (decl.property !== 'color-scheme') continue;
    const keyword = decl.value.match(/\b(light|dark)\b/i);
    if (keyword) declaredByBlock.set(decl.block, keyword[1].toLowerCase());
  }

  scanned.push({ file, raw, markers, decls, declaredByBlock });
}

// Какие названные темы объявляют каждую переменную. Из этой карты
// выводится тема безымянной базовой области.
const themesByProperty = new Map();
for (const { decls, declaredByBlock } of scanned) {
  for (const decl of decls) {
    if (!decl.property.startsWith('--')) continue;
    const theme = themeOfSelector(decl.context) ?? declaredByBlock.get(decl.block) ?? null;
    if (!theme) continue;
    if (!themesByProperty.has(decl.property)) themesByProperty.set(decl.property, new Set());
    themesByProperty.get(decl.property).add(theme);
  }
}

const lightArea = AREAS.find((area) => area.id === 'light-theme');

for (const { file, raw, markers, decls, declaredByBlock } of scanned) {
  // На файл сообщается не больше трёх непокрытых объявлений: длинный файл
  // без маркеров даёт сотни строк, из которых первые три и так называют
  // причину. Остальные считаются числом.
  let uncovered = 0;
  for (const decl of decls) {
    const marker = [...markers].reverse().find((candidate) => candidate.index < decl.index);
    const where = `${file}:${lineAt(raw, decl.index)}`;
    if (!marker) {
      uncovered++;
      if (uncovered <= 3) errors.push(`${where} — «${decl.property}» без маркера происхождения. Поставьте выше @snapshot <файл> <node> или @normative <причина>`);
      continue;
    }

    // Тема области: селектор → color-scheme → вывод исключением.
    let theme = themeOfSelector(decl.context) ?? declaredByBlock.get(decl.block) ?? null;
    let themeWhy = theme ? 'область названа темой явно' : null;
    if (!theme && decl.property.startsWith('--') && COLOUR_VALUE.test(decl.value) && isRootScope(decl.selector)) {
      const overriding = themesByProperty.get(decl.property) ?? new Set();
      if (overriding.size === 1) {
        const other = overriding.has('dark') ? 'light' : 'dark';
        theme = other;
        themeWhy = `область «${decl.selector}» темой не названа, но ту же переменную перекрывает ${overriding.has('dark') ? 'тёмная' : 'светлая'} тема — значит база ${other === 'light' ? 'светлая' : 'тёмная'}`;
      } else if (overriding.size > 1) {
        errors.push(`${where} — «${decl.property}» объявлена в безымянной области «${decl.selector}» и перекрыта обеими темами. Назовите тему базы: color-scheme: dark|light в том же блоке`);
      }
    }

    // Нарушитель называется по имени. Две светлые переменные в одном блоке
    // стоят на одной строке файла, и без имени свойства обе давали одно
    // и то же сообщение дважды: читателю оставалось гадать, какая из них
    // сломала И-2.
    //
    // Само color-scheme не значение темы, а её объявление: сообщать
    // о нём отдельной строкой — повторять то же самое дважды на строке.
    if (theme === 'light' && marker.kind === 'snapshot' && decl.property !== 'color-scheme') {
      errors.push(`${where} «${decl.property}» — ${lightArea.title} под маркером ${marker.text} (строка ${marker.line}): ${themeWhy}. Это норматив: ${lightArea.why}. Инвариант И-2`);
      continue;
    }

    const haystack = `${decl.context} ${decl.property}`;
    for (const area of AREAS) {
      if (!area.triggerCss.test(haystack)) continue;
      if (marker.kind === 'snapshot') {
        errors.push(`${where} «${decl.property}» — ${area.title} под маркером ${marker.text} (строка ${marker.line}). Это норматив: ${area.why}. Инвариант И-2`);
      }
    }
  }
  if (uncovered > 3) errors.push(`${file} — и ещё ${uncovered - 3} объявлений без маркера происхождения`);
}

// -------------------------------------------------------------------------
// 3. Статьи: упомянутая нормативная область названа нормативом в том же
//    разделе. Раздел — от заголовка до следующего заголовка того же или
//    высшего уровня.
// -------------------------------------------------------------------------
// evidence/ сюда намеренно не входит, и это не забывчивость. Там лежат
// протоколы снятых узлов, а среди 18 макетов светлых шесть: протокол вправе
// сказать «макет в светлой теме» как факт об артборде, и требовать от него
// слова «норматив» неверно — нормативна светлая тема продукта, а не тема
// снятого узла. Чтобы разобрать evidence/coverage.md (R0-07), триггер
// сначала обязан различать эти два смысла. Строка X-11 роадмапа.
const articleDirs = ['blocks', 'components', 'docs'].map((dir) => path.join(root, dir));
const articles = articleDirs
  .flatMap(walk)
  .filter((file) => file.endsWith('.md') && path.basename(file) !== 'README.md');

const sections = (text) => {
  const heads = [...text.matchAll(/^(#{1,6})\s+(.*)$/gm)];
  const result = [{ title: '(начало файла)', start: 0, end: heads.length ? heads[0].index : text.length }];
  for (const [order, head] of heads.entries()) {
    const level = head[1].length;
    let end = text.length;
    for (const next of heads.slice(order + 1)) {
      if (next[1].length <= level) { end = next.index; break; }
    }
    result.push({ title: head[2].trim(), start: head.index, end });
  }
  return result;
};

for (const fullPath of articles) {
  const file = relPath(fullPath);
  const text = fs.readFileSync(fullPath, 'utf8');
  for (const section of sections(text)) {
    const body = text.slice(section.start, section.end);
    for (const area of AREAS) {
      if (!area.triggerText.test(body)) continue;
      if (NORMATIVE_WORD.test(body)) continue;
      errors.push(`${file}:${lineAt(text, section.start)} «${section.title}» — упомянута ${area.title}, но раздел не называет её нормативом. ${area.why}`);
    }
  }
}

// -------------------------------------------------------------------------
// Итог.
// -------------------------------------------------------------------------
if (warnings.length) {
  console.warn(`Проверки выключены (${warnings.length}):`);
  for (const warning of warnings) console.warn(`  ${warning}`);
  console.warn('');
}

if (notes.length) {
  console.log(`К сведению (${notes.length}):`);
  for (const note of notes) console.log(`  ${note}`);
  console.log('');
}

// Ошибки печатаются раньше ветки «проверять нечего». Прежний порядок
// глушил сломанный маркер в файле без объявлений: ошибки собирались
// и не показывались, а пакет до R0-02 состоит ровно из таких файлов.
if (errors.length) {
  console.error(`Норматив и снятое смешаны (${errors.length}) — И-1, И-2, METHOD §4:\n`);
  for (const line of errors) console.error(`  ${line}`);
  console.error('\nУ снятого есть node id, у спроектированного — причина словами.');
  console.error('Механика маркеров описана в tools/README.md.');
  process.exit(1);
}

if (declarationCount === 0 && articles.length === 0) {
  console.error('Проверять нечего: в ui/**/*.css ни одного объявления, статей нет.');
  console.error('');
  console.error('  ui/tokens.css       значения выводит R0-02');
  console.error('  ui/foundations.css  шкалу выводит R0-03');
  console.error('  blocks/*.md         статьи о блоках пишут волны R2 и R3');
  console.error('');
  console.error('Маркеры при этом разобраны: ошибок в них нет.');
  console.error('Зелёный код на пустом пакете был бы неотличим от зелёного на проверенном.');
  process.exit(2);
}

console.log(`Проверено: объявлений ${declarationCount} в ${cssFiles.length} файле(ах) CSS, статей ${articles.length}.`);
console.log(`Нормативных областей ${AREAS.length}: ${AREAS.map((area) => area.title).join(' · ')}.`);
