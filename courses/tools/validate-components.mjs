import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Проверка реестра компонентов пакета courses: сходимость manifest.json
// со спецификациями, с CSS в ui/ и с якорями витрины.

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(toolDir, "..");
const componentsDir = path.join(packageDir, "components");
const manifestPath = path.join(componentsDir, "manifest.json");
const showcasePath = path.join(packageDir, "showcase", "components.html");

// Реестр — предмет проверки: без него проверять нечего, и это код 2.
// Витрина — второй потребитель реестра, её заводит следующий шаг. Пока её
// нет, проверка якорей откладывается (см. `deferred` ниже), а всё остальное
// проверяется: иначе манифест, собранный на R0-05, до R0-06 не проверит
// никто, и «нет витрины» будет неотличимо от «реестр сломан».
if (!fs.existsSync(manifestPath)) {
  console.error("Нет файла components/manifest.json — его заводит шаг R0-05. Проверять пока нечего.");
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
// Без списка записей проверять тоже нечего — но это уже сломанный реестр,
// а не «предмета ещё нет». Без этой проверки первое же обращение к
// manifest.components роняет скрипт стеком TypeError вместо сообщения.
if (!Array.isArray(manifest.components)) {
  console.error("components/manifest.json есть, но ключа components в нём нет или это не массив.");
  process.exit(2);
}
const showcaseExists = fs.existsSync(showcasePath);
const showcase = showcaseExists ? fs.readFileSync(showcasePath, "utf8") : "";
// Разметка для поиска якорей: комментарии, <pre> и <code> вырезаны. Без этого
// строка внутри примера кода для копирования (`<pre>…id="c-badge"…</pre>`)
// удовлетворяла бы проверке якоря наравне с настоящим узлом — ревью R0-06,
// находка «дыра 1»: подставленный якорь без живой секции проходил зелёным.
// Сами `<pre>`/`<code>` в разметке экранируют `<` и `>`, но не кавычки, так
// что текст примера мог содержать valid-looking `id="…"` буквально.
const showcaseSearchable = showcaseExists
  ? showcase
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, " ")
      .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, " ")
  : "";
// Комментарии из CSS вырезаются: иначе классом компонента проходит любое имя,
// упомянутое в пояснении, — включая имена витрины (.doc-layout) и пути файлов.
const cssText = fs
  .readdirSync(path.join(packageDir, "ui"), { recursive: true })
  .filter((entry) => entry.endsWith(".css"))
  .map((entry) => fs.readFileSync(path.join(packageDir, "ui", entry), "utf8"))
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, " ");
const errors = [];
const warnings = [];
const deferred = [];
// Объявленное и не закрытое: предмет есть, вопрос известен и назван поимённо.
// От «отложено» отличается тем, что ждёт не следующего шага, а разбора.
const declared = [];

const requiredFields = [
  "id",
  "canonicalName",
  "storybookNames",
  "legacyAliases",
  "category",
  "kind",
  "specPath",
  "cssRoots",
  "showcaseAnchor",
  "figmaEvidence",
  "status",
  "requiredStates",
  // Поля Курсов сверх образца career/: где элемент найден на инвентаризации
  // и на чём он стоит. Оба нужны до всякой вёрстки, поэтому обязательны
  // с R0-05, а не с первой спецификации.
  "sourceScope",
  "dependsOn",
  // Единственное, что связывает числа реестра с разметкой. Пока поля не было
  // в этом списке, запись со статусом production без селектора вовсе давала
  // зелёный код: правила, которого нет, и пропустило breadcrumbs (review-2).
  "productionEvidence",
  // Место записи в роадмапе. Без step запись молча выключала для себя
  // проверку инверсии шагов, а wave не проверялся ничем.
  "wave",
  "step",
];

// Шаги роадмапа: step записи обязан быть одним из них. Роадмап — источник
// порядка работ, и выдуманный шаг в реестре расходится с ним молча.
const roadmapPath = path.join(packageDir, "ROADMAP.md");
const roadmapSteps = new Map();
if (fs.existsSync(roadmapPath)) {
  for (const match of fs.readFileSync(roadmapPath, "utf8").matchAll(/^\|\s*(R\d+-\d+)\s*\|([^|]*)\|/gm)) {
    roadmapSteps.set(match[1], match[2].trim());
  }
}

const seenIds = new Set();
const seenNames = new Set();
const seenSteps = new Map();
const seenSelectors = new Map();
const aliases = new Map();
const manifestSpecPaths = new Set();
const figmaFileKeys = new Set(
  Object.values(manifest.sources?.figma ?? {})
    .map((file) => file?.fileKey)
    .filter(Boolean),
);

// Закрытые словари METHOD §5. Они общий контракт конвейера, а не настройка
// пакета: пакет их использует, но не переопределяет. Пока сверялись одни
// статусы, соседние словари охраняли сами себя — и запрещённое METHOD слово
// active проходило зелёным, стоило добавить его в allowedStates и убрать
// из forbiddenStateNames. Сверка идёт в обе стороны и по каждому словарю:
// «расширяет» и «не содержит» — разные ошибки, и обе называются поимённо.
const METHOD = {
  statuses: ["complete", "partial", "planned", "legacy-only", "figma-only"],
  categories: [
    "actions",
    "forms",
    "navigation",
    "collections",
    "data-display",
    "feedback",
    "overlays",
    "layout",
    "frame-modules",
    "entities",
  ],
  kinds: ["primitive", "component", "module", "adapter"],
  states: [
    "default",
    "hover",
    "focus-visible",
    "pressed",
    "selected",
    "current",
    "checked",
    "indeterminate",
    "expanded",
    "collapsed",
    "open",
    "closed",
    "disabled",
    "readOnly",
    "loading",
    "invalid",
    "error",
    "success",
    "empty",
    "dragActive",
  ],
  forbiddenStateNames: ["active", "focus", "select", "inactive"],
};

// …и сверка самого литерала с METHOD.md, если он доступен. Литерал выше —
// вторая копия закрытого списка, и правилом она не удерживалась: изменение
// METHOD §5 либо прошло бы незамеченным, либо покрасило гейт на верном
// манифесте, не назвав причины (review-3, minor 5). Тот же класс, что «пять
// префиксов против таблицы из шести», только копия лежала в коде.
//
// METHOD.md — контракт конвейера, он живёт над пакетом и в поставку пакета
// не входит. Поэтому его отсутствие — не ошибка, а отложенная проверка:
// пакет остаётся самодостаточным, но там, где контракт рядом, расхождение
// с ним видно.
const methodPath = path.resolve(packageDir, "../.claude/guide/METHOD.md");
const methodSectionHeadings = {
  statuses: /^-\s*Статусы:/,
  categories: /^-\s*Категории:/,
  kinds: /^-\s*Виды:/,
  states: /^-\s*Словарь состояний закрыт:/,
};
let methodChecked = false;
if (fs.existsSync(methodPath)) {
  const text = fs.readFileSync(methodPath, "utf8");
  const section = text.match(/^##\s*5\.[^\n]*$([\s\S]*?)(?=^##\s)/m)?.[1];
  if (!section) {
    errors.push(`${path.relative(packageDir, methodPath)}: раздел §5 не найден — словари сверить не с чем`);
  } else {
    // Каждый словарь §5 — маркированный пункт, значения в обратных кавычках.
    // Состояния и запрещённые имена стоят в одном пункте: всё до слова
    // «Слова» — разрешённые, после — запрещённые.
    const bullets = section.split(/\n(?=-\s)/).map((line) => line.replace(/\s+/g, " ").trim());
    const ticked = (text) => [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    const found = {};
    for (const [key, heading] of Object.entries(methodSectionHeadings)) {
      const bullet = bullets.find((line) => heading.test(line));
      if (!bullet) continue;
      if (key === "states") {
        const [allowed, forbidden] = bullet.split(/Слова\s/);
        found.states = ticked(allowed);
        if (forbidden) found.forbiddenStateNames = ticked(forbidden);
      } else {
        found[key] = ticked(bullet);
      }
    }
    for (const key of ["statuses", "categories", "kinds", "states", "forbiddenStateNames"]) {
      const fromMethod = found[key];
      if (!fromMethod?.length) {
        errors.push(`METHOD §5: словарь ${key} в ${path.relative(packageDir, methodPath)} не прочитан`);
        continue;
      }
      const extra = METHOD[key].filter((name) => !fromMethod.includes(name));
      const absent = fromMethod.filter((name) => !METHOD[key].includes(name));
      if (extra.length) {
        errors.push(`METHOD §5: список ${key} в валидаторе шире METHOD.md: ${extra.join(", ")}`);
      }
      if (absent.length) {
        errors.push(`METHOD §5: список ${key} в валидаторе не содержит имён METHOD.md: ${absent.join(", ")}`);
      }
    }
    methodChecked = true;
  }
} else {
  deferred.push(
    `${path.relative(packageDir, methodPath)} рядом с пакетом нет — списки METHOD §5 в валидаторе сверены только с манифестом, но не с самим контрактом`,
  );
}

function checkDictionary(field, value, expected) {
  if (value === undefined || value === null) {
    errors.push(`manifest: нет ${field} — словарь METHOD §5 обязателен и сверяется с ним`);
    return;
  }
  const actual = Array.isArray(value) ? value : Object.keys(value);
  if (!actual.length) {
    errors.push(`manifest: ${field} пуст — словарь METHOD §5 не может быть пустым`);
  }
  const extra = actual.filter((name) => !expected.includes(name));
  const absent = expected.filter((name) => !actual.includes(name));
  if (extra.length) errors.push(`manifest: ${field} расширяет METHOD §5: ${extra.join(", ")}`);
  if (absent.length) errors.push(`manifest: в ${field} нет имён METHOD §5: ${absent.join(", ")}`);
}

checkDictionary("allowedStatuses", manifest.allowedStatuses, METHOD.statuses);
checkDictionary("allowedCategories", manifest.allowedCategories, METHOD.categories);
checkDictionary("allowedKinds", manifest.allowedKinds, METHOD.kinds);
checkDictionary("allowedStates", manifest.allowedStates, METHOD.states);
checkDictionary("forbiddenStateNames", manifest.forbiddenStateNames, METHOD.forbiddenStateNames);

const allowedStates = new Set(manifest.allowedStates ?? []);
const allowedStatuses = new Set(manifest.allowedStatuses ?? []);
const allowedCategories = manifest.allowedCategories ?? {};
const allowedKinds = new Set(manifest.allowedKinds ?? []);
const allowedSourceScopes = new Set(Object.keys(manifest.allowedSourceScopes ?? {}));
const manifestIds = new Set((manifest.components ?? []).map((component) => component.id));
const forbiddenStateNames = new Set(manifest.forbiddenStateNames ?? []);
// Два словаря не могут пересекаться ни при какой правке: имя, разрешённое
// и запрещённое одновременно, делает обе проверки бессмысленными.
for (const state of allowedStates) {
  if (forbiddenStateNames.has(state)) {
    errors.push(`manifest: имя состояния ${state} стоит и в allowedStates, и в forbiddenStateNames`);
  }
}

// Шапка манифеста. Для записей есть requiredFields, а для самого реестра
// правила не было: countingRule — то, на чём стоят все 44 числа и вся
// аргументация шага, — можно было удалить, и гейт оставался зелёным
// (review-3, minor 9). Подмену текста правилом не поймать, наличие ключа
// и непустоту — можно.
const requiredManifestFields = ["countingRule", "statusRule", "sourcePolicy", "coverage", "conventions"];
for (const field of requiredManifestFields) {
  const value = manifest[field];
  const empty =
    value == null ||
    (typeof value === "string" && !value.trim()) ||
    (typeof value === "object" && !Object.keys(value).length);
  if (empty) errors.push(`manifest: нет ${field} — правило реестра, без которого его записи ничем не держатся`);
}
if (manifest.schemaVersion !== 1) {
  errors.push(`manifest: schemaVersion должен быть 1, получено ${JSON.stringify(manifest.schemaVersion)}`);
}
// allowedSourceScopes METHOD не задаёт — это словарь самого пакета, и до сих
// пор он был единственным, не сверяемым ни с чем: шестой sourceScope ловился
// побочно (числа у не-production записи), а не правилом на словарь.
const packageSourceScopes = ["production", "storybook-only", "figma-only"];
{
  const actual = Object.keys(manifest.allowedSourceScopes ?? {});
  const extra = actual.filter((name) => !packageSourceScopes.includes(name));
  const absent = packageSourceScopes.filter((name) => !actual.includes(name));
  if (extra.length) errors.push(`manifest: allowedSourceScopes расширяет состав пакета: ${extra.join(", ")}`);
  if (absent.length) errors.push(`manifest: в allowedSourceScopes нет значений: ${absent.join(", ")}`);
}

// Страницы, снятые с продакшена: против них проверяются seenOn и cssRoots.
// Снятая страница — это папка, в которой есть dom.html, а не всякая папка:
// пустая zz-fake/ становилась «снятой страницей», на которую можно сослаться
// из seenOn, а переименованный dom.html выводил страницу из проверки, оставляя
// её числа в реестре неподтверждаемыми (review-3, minor 6).
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const pageFolders = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir) : [];
const capturedPages = new Set(pageFolders.filter((id) => fs.existsSync(path.join(pagesDir, id, "dom.html"))));
for (const id of pageFolders) {
  if (!capturedPages.has(id)) {
    errors.push(`evidence/source/production/pages/${id}: папка страницы без dom.html — снятой страницей не является`);
  }
}
// URL снятых страниц: против них проверяется productionEvidence[].url.
const pageUrls = new Map();
for (const id of capturedPages) {
  const metaPath = path.join(pagesDir, id, "meta.json");
  if (!fs.existsSync(metaPath)) continue;
  try {
    const url = JSON.parse(fs.readFileSync(metaPath, "utf8")).url;
    if (typeof url === "string" && url) pageUrls.set(id, url.replace(/\/$/, ""));
  } catch (error) {
    errors.push(`evidence/source/production/pages/${id}/meta.json не разбирается: ${error.message}`);
  }
}
let domClassNames = null;
function classNamesInCapturedDom() {
  if (domClassNames) return domClassNames;
  domClassNames = new Set();
  for (const page of capturedPages) {
    const file = path.join(pagesDir, page, "dom.html");
    if (!fs.existsSync(file)) continue;
    for (const attribute of fs.readFileSync(file, "utf8").matchAll(/class="([^"]*)"/g)) {
      for (const token of attribute[1].split(/\s+/)) if (token) domClassNames.add(token);
    }
  }
  return domClassNames;
}

// Правило conventions.cssRoot, проверяемое механически: корень — либо класс,
// который действительно стоит в снятой разметке, либо введённое пакетом имя
// crs-<id>. Подстрочного совпадения мало: `svg` находится внутри `.svg-icon`.
//
// Из текста сборки убираются @import и url(): иначе точка расширения даёт
// «класс» css. Имя, начинающееся с цифры, классом быть не может (CSS такое
// имя без экранирования не допускает) — так из множества уходят хвосты
// десятичных вроде 1.5rem, дававшие «классы» 5, 12, 05.
const cssSelectorNames = new Set();
const cssWithoutImports = cssText
  .replace(/@import[^;]*;/g, " ")
  .replace(/url\([^)]*\)/g, " ");
for (const match of cssWithoutImports.matchAll(/\.((?:[\w-]|\\.)+)/g)) {
  const name = match[1].replaceAll(/\\(.)/g, "$1");
  if (/^-?\d/.test(name)) continue;
  cssSelectorNames.add(name);
}

// Разбор селектора без браузера: проверить, что он вообще селектор, и достать
// из него имена классов. Нужен обеим проверкам productionEvidence — «строка
// разбирается» и «классы в ней есть в снятой разметке».
function parseSelector(selector) {
  if (typeof selector !== "string" || !selector.trim()) {
    return { valid: false, reason: "пустая строка", classes: [] };
  }
  const classes = [];
  let depthBracket = 0;
  let depthParen = 0;
  let quote = null;
  let lastMeaningful = "";
  for (let index = 0; index < selector.length; index += 1) {
    const char = selector[index];
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") depthBracket += 1;
    else if (char === "]") {
      depthBracket -= 1;
      if (depthBracket < 0) return { valid: false, reason: "лишняя ]", classes };
    } else if (char === "(") depthParen += 1;
    else if (char === ")") {
      depthParen -= 1;
      if (depthParen < 0) return { valid: false, reason: "лишняя )", classes };
    } else if ((char === "." || char === "#") && depthBracket === 0) {
      // Имя класса или идентификатора: начинается с буквы, _, - или escape.
      let name = "";
      let cursor = index + 1;
      while (cursor < selector.length) {
        const next = selector[cursor];
        if (next === "\\") {
          name += selector[cursor + 1] ?? "";
          cursor += 2;
          continue;
        }
        if (/[\w-]/.test(next) || next.charCodeAt(0) > 127) {
          name += next;
          cursor += 1;
          continue;
        }
        break;
      }
      if (!name || /^-?\d/.test(name)) {
        return { valid: false, reason: `пустое имя после ${char}`, classes };
      }
      if (char === ".") classes.push(name);
      index = cursor - 1;
      lastMeaningful = "name";
      continue;
    }
    if (!/\s/.test(char)) lastMeaningful = char;
  }
  if (quote) return { valid: false, reason: "незакрытая кавычка", classes };
  if (depthBracket !== 0) return { valid: false, reason: "незакрытая [", classes };
  if (depthParen !== 0) return { valid: false, reason: "незакрытая (", classes };
  if ([">", "+", "~", ",", ".", "#"].includes(lastMeaningful)) {
    return { valid: false, reason: `селектор обрывается на ${lastMeaningful}`, classes };
  }
  return { valid: true, reason: null, classes };
}

// Перепись селекторов: измерение, снятое настоящим браузером по тому же DOM
// (tools/measure-selectors.mjs). Здесь она только читается — валидатор ничего
// не измеряет и ничего не записывает. Числа реестра держатся на ней, а не на
// доверии к автору записи: подмена селектора при сохранённых числах видна как
// расхождение строки селектора, а подмена чисел — как расхождение измерения.
const censusPath = path.join(componentsDir, "selector-census.json");
let census = null;
if (fs.existsSync(censusPath)) {
  try {
    census = JSON.parse(fs.readFileSync(censusPath, "utf8"));
  } catch (error) {
    errors.push(`components/selector-census.json не разбирается: ${error.message}`);
  }
}

function issue(target, message) {
  return `${target}: ${message}`;
}

function stateSection(markdown) {
  const match = markdown.match(/^## Состояния\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m);
  return match?.[1] ?? "";
}

function hasStateSignalOutsideClaim(markdown) {
  return /(?:hover:|focus-visible:|disabled:|:hover\b|:focus-visible\b|:disabled\b|aria-current=|aria-disabled=|aria-selected=|aria-expanded=|aria-invalid=|\.is-loading\b|\.is-selected\b|--invalid\b)/i.test(
    markdown,
  );
}

for (const component of manifest.components ?? []) {
  const target = component.id || component.canonicalName || "<unknown>";

  for (const field of requiredFields) {
    if (!(field in component)) errors.push(issue(target, `missing field ${field}`));
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id ?? "")) {
    errors.push(issue(target, "id must be kebab-case"));
  }
  if (!/^[A-Z][A-Za-z0-9]*$/.test(component.canonicalName ?? "")) {
    errors.push(issue(target, "canonicalName must be PascalCase"));
  }
  // METHOD §5: id — kebab-case от канонического имени. Проверялись обе формы
  // по отдельности, а связь между ними — нет: пара id chip / canonicalName
  // Badge проходила зелёным и разводила запись на два разных элемента.
  if (/^[A-Z][A-Za-z0-9]*$/.test(component.canonicalName ?? "")) {
    const expectedId = component.canonicalName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    if (component.id !== expectedId) {
      errors.push(issue(target, `id must be kebab-case of canonicalName (${expectedId}), got ${component.id}`));
    }
  }
  if (seenIds.has(component.id)) errors.push(issue(target, "duplicate id"));
  if (seenNames.has(component.canonicalName)) {
    errors.push(issue(target, "duplicate canonicalName"));
  }
  seenIds.add(component.id);
  seenNames.add(component.canonicalName);

  for (const name of component.storybookNames ?? []) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      errors.push(issue(target, `storybook name must be PascalCase: ${name}`));
    }
  }

  const seenAliases = new Set();
  for (const alias of component.legacyAliases ?? []) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(alias)) {
      errors.push(issue(target, `legacy alias must be PascalCase: ${alias}`));
    }
    // Запись, ссылающаяся сама на себя: алиас говорит «каноническим это имя
    // не является», а оно и есть каноническое.
    if (alias === component.canonicalName) {
      errors.push(issue(target, `legacy alias repeats canonicalName: ${alias}`));
    }
    if (seenAliases.has(alias)) {
      errors.push(issue(target, `duplicate legacy alias: ${alias}`));
    }
    seenAliases.add(alias);
    if (aliases.has(alias)) {
      errors.push(issue(target, `legacy alias is already owned by ${aliases.get(alias)}: ${alias}`));
    }
    aliases.set(alias, target);
  }

  // Категория — закрытый список METHOD §5, и он же список файлов
  // ui/components/*.css: имя файла равно значению category. Опечатка
  // в категории иначе уводит спецификацию в папку, которую никто не читает.
  if (!(component.category in allowedCategories)) {
    errors.push(issue(target, `unknown category ${component.category}`));
  } else {
    const cssFile = path.join(packageDir, allowedCategories[component.category]);
    if (!fs.existsSync(cssFile)) {
      errors.push(
        issue(target, `category ${component.category} has no CSS file: ${allowedCategories[component.category]}`),
      );
    }
  }
  if (!allowedKinds.has(component.kind)) {
    errors.push(issue(target, `unknown kind ${component.kind}`));
  }

  if (!allowedStatuses.has(component.status)) {
    errors.push(issue(target, `unknown status ${component.status}`));
  }
  if (!allowedSourceScopes.has(component.sourceScope)) {
    errors.push(issue(target, `unknown sourceScope ${component.sourceScope}`));
  }
  // status и sourceScope — разные оси (см. statusRule манифеста), но
  // сойтись обязаны, и сойтись в обе стороны. Проверяется вся матрица,
  // а не два её угла: иначе partial при figma-only проходит молча.
  if (component.status === "figma-only" && component.sourceScope !== "figma-only") {
    errors.push(
      issue(target, `status figma-only requires sourceScope figma-only, got ${component.sourceScope}`),
    );
  }
  if (component.sourceScope === "figma-only" && ["complete", "partial"].includes(component.status)) {
    errors.push(
      issue(target, `sourceScope figma-only cannot reach status ${component.status}; terminal status is figma-only`),
    );
  }
  if (component.status === "complete" && !["production", "storybook-only"].includes(component.sourceScope)) {
    errors.push(
      issue(target, `status complete requires sourceScope production or storybook-only, got ${component.sourceScope}`),
    );
  }
  if (component.status === "partial" && !["production", "storybook-only"].includes(component.sourceScope)) {
    errors.push(
      issue(target, `status partial requires sourceScope production or storybook-only, got ${component.sourceScope}`),
    );
  }

  if (!Array.isArray(component.dependsOn)) {
    errors.push(issue(target, "dependsOn must be an array"));
  } else {
    const seenDependencies = new Set();
    for (const dependency of component.dependsOn) {
      if (dependency === component.id) errors.push(issue(target, "depends on itself"));
      else if (!manifestIds.has(dependency)) {
        errors.push(issue(target, `dependency is not in the manifest: ${dependency}`));
      }
      if (seenDependencies.has(dependency)) {
        errors.push(issue(target, `duplicate dependency: ${dependency}`));
      }
      seenDependencies.add(dependency);
    }
  }

  // occurrences и seenOn — измерение селектора productionEvidence по снятому
  // DOM (см. countingRule манифеста), а не заметка инвентаризации. Мусор
  // в них проходил молча: страница, которой в evidence нет; число при пустом
  // списке страниц; вхождения у элемента, которого в проде не нашли.
  if (!Number.isInteger(component.occurrences) || component.occurrences < 0) {
    errors.push(issue(target, `occurrences must be a non-negative integer, got ${JSON.stringify(component.occurrences)}`));
  }
  if (!Array.isArray(component.seenOn)) {
    errors.push(issue(target, "seenOn must be an array"));
  } else {
    const seenPages = new Set();
    for (const page of component.seenOn) {
      if (capturedPages.size && !capturedPages.has(page)) {
        errors.push(issue(target, `seenOn names a page absent from evidence: ${page}`));
      }
      if (seenPages.has(page)) errors.push(issue(target, `duplicate page in seenOn: ${page}`));
      seenPages.add(page);
    }
    if ((component.occurrences > 0) !== (component.seenOn.length > 0)) {
      errors.push(
        issue(target, `occurrences ${component.occurrences} contradicts seenOn (${component.seenOn.length} pages)`),
      );
    }
    // Узлов не может быть меньше страниц, на которых они найдены: seenOn —
    // страницы, где селектор нашёл хотя бы один узел. Прежняя проверка
    // смотрела только «оба нули или оба не нули», и 3 вхождения на десяти
    // страницах проходили зелёным.
    if (component.occurrences < component.seenOn.length) {
      errors.push(
        issue(target, `occurrences ${component.occurrences} is less than seenOn pages (${component.seenOn.length})`),
      );
    }
    if (component.sourceScope !== "production" && (component.occurrences > 0 || component.seenOn.length)) {
      errors.push(
        issue(target, `sourceScope ${component.sourceScope} means the element was not found in production, but occurrences/seenOn are non-empty`),
      );
    }
    if (component.sourceScope === "production" && component.occurrences === 0) {
      errors.push(issue(target, "sourceScope production requires a non-zero occurrences count"));
    }
  }
  // productionEvidence — то, чем измеряются occurrences и seenOn
  // (countingRule манифеста). Пока поле не проверялось, «снято с продакшена»
  // держалось на честном слове записи: селектор мог отсутствовать, быть
  // пустым, не разбираться браузером или адресовать не тот узел.
  if (!Array.isArray(component.productionEvidence)) {
    errors.push(issue(target, "productionEvidence must be an array"));
  } else {
    if (component.sourceScope === "production" && !component.productionEvidence.length) {
      errors.push(
        issue(target, "sourceScope production requires at least one productionEvidence entry with a selector"),
      );
    }
    if (component.sourceScope !== "production" && component.productionEvidence.length) {
      errors.push(
        issue(
          target,
          `sourceScope ${component.sourceScope} means the element was not found in production, but productionEvidence is non-empty`,
        ),
      );
    }
    for (const [index, evidence] of component.productionEvidence.entries()) {
      const at = `productionEvidence[${index}]`;
      if (!evidence || typeof evidence !== "object") {
        errors.push(issue(target, `${at} must be an object`));
        continue;
      }
      // Ключи строки закрыты: реестр правится руками и скриптами .pipeline/,
      // и опечатка в имени ключа даёт запись, которая читается глазами как
      // исправленная, а работает по старому значению (review-3, minor 8).
      const allowedEvidenceKeys = ["url", "selector", "note"];
      for (const key of Object.keys(evidence)) {
        if (!allowedEvidenceKeys.includes(key)) {
          errors.push(issue(target, `${at} has an unknown key ${key} (allowed: ${allowedEvidenceKeys.join(", ")})`));
        }
      }
      // url не был привязан ни к продукту, ни к seenOn: проходил любой
      // https://example.com и любая чужая страница (review-3, minor 7).
      // Привязка — к URL страниц, снятых в evidence, и к списку страниц
      // самой записи.
      if (typeof evidence.url !== "string" || !/^https?:\/\/\S+$/.test(evidence.url)) {
        errors.push(issue(target, `${at}.url must be a production URL, got ${JSON.stringify(evidence.url)}`));
      } else if (pageUrls.size) {
        const url = evidence.url.replace(/\/$/, "");
        const owner = [...pageUrls].find(([, pageUrl]) => pageUrl === url)?.[0];
        if (!owner) {
          errors.push(
            issue(target, `${at}.url is not the URL of any captured page: ${evidence.url}`),
          );
        } else if (Array.isArray(component.seenOn) && component.seenOn.length && !component.seenOn.includes(owner)) {
          errors.push(
            issue(target, `${at}.url points at page ${owner}, which is not in seenOn: ${evidence.url}`),
          );
        }
      }
      if (typeof evidence.selector !== "string" || !evidence.selector.trim()) {
        errors.push(issue(target, `${at}.selector must be a non-empty selector, got ${JSON.stringify(evidence.selector)}`));
      } else {
        const parsed = parseSelector(evidence.selector);
        if (!parsed.valid) {
          errors.push(issue(target, `${at}.selector is not a selector (${parsed.reason}): ${evidence.selector}`));
        }
        // Класс, которого в снятой разметке нет, не может быть селектором
        // снятого элемента — что бы ни было записано в occurrences.
        for (const className of parsed.classes) {
          if (capturedPages.size && !classNamesInCapturedDom().has(className)) {
            errors.push(
              issue(target, `${at}.selector uses a class absent from the captured DOM: .${className}`),
            );
          }
        }
      }
      // note может быть null — «оговорки не требуется», но ключ обязан быть:
      // countingRule требует именно здесь объяснять селектор шире или уже
      // элемента, и молчаливое отсутствие ключа неотличимо от «нечего сказать».
      if (!("note" in evidence)) {
        errors.push(issue(target, `${at}.note is required (null means "no caveat needed")`));
      } else if (evidence.note !== null && (typeof evidence.note !== "string" || !evidence.note.trim())) {
        // Пустая строка неотличима от null, то есть от «оговорки не
        // требуется», хотя означает противоположное — оговорку забыли
        // дописать (review-3, minor 8).
        errors.push(
          issue(target, `${at}.note must be null or a non-empty string, got ${JSON.stringify(evidence.note)}`),
        );
      }
      // Один селектор на две записи означает, что два элемента реестра
      // измеряются одним и тем же множеством узлов. Именно так filter-bar
      // и filter-chip считали одни и те же 139 чипов (review-1, major 4).
      if (typeof evidence.selector === "string" && evidence.selector.trim()) {
        if (seenSelectors.has(evidence.selector)) {
          errors.push(
            issue(target, `productionEvidence selector is already used by ${seenSelectors.get(evidence.selector)}: ${evidence.selector}`),
          );
        } else seenSelectors.set(evidence.selector, target);
      }
    }
  }

  if (!Array.isArray(component.requiredStates)) {
    errors.push(issue(target, "requiredStates must be an array"));
  } else {
    for (const state of component.requiredStates) {
      if (!allowedStates.has(state)) {
        errors.push(issue(target, `unknown required state ${state}`));
      }
      if (forbiddenStateNames.has(state)) {
        errors.push(issue(target, `forbidden non-canonical state ${state}`));
      }
    }
  }

  // wave и step — место записи в роадмапе. step участвует в проверке инверсии
  // шагов, и запись без него эту проверку для себя выключала. Форма и наличие
  // в роадмапе проверяются, чтобы выдуманный шаг не разошёлся с планом молча.
  if (typeof component.step !== "string" || !/^R\d+-\d{2}$/.test(component.step)) {
    errors.push(issue(target, `step must look like R<wave>-<NN>, got ${JSON.stringify(component.step)}`));
  } else if (roadmapSteps.size && !roadmapSteps.has(component.step)) {
    errors.push(issue(target, `step is absent from ROADMAP.md: ${component.step}`));
  } else if (roadmapSteps.size && component.canonicalName) {
    // Существования шага мало: запись может сесть на чужой, но настоящий шаг.
    // Строка роадмапа называет элемент, который этот шаг верстает, — имя
    // записи обязано в ней стоять.
    const cell = roadmapSteps.get(component.step);
    const named = new RegExp(`(^|[^A-Za-z0-9])${component.canonicalName}([^A-Za-z0-9]|$)`).test(cell);
    if (!named) {
      errors.push(
        issue(target, `ROADMAP.md step ${component.step} does not name ${component.canonicalName}: ${cell.slice(0, 60)}`),
      );
    }
  }
  // Один шаг роадмапа верстает один элемент. Две записи на одном шаге —
  // либо опечатка, либо шаг, который на самом деле верстает два элемента:
  // и то и другое ломает порядок работ, и находить это задним числом поздно.
  if (typeof component.step === "string") {
    if (seenSteps.has(component.step)) {
      errors.push(issue(target, `step ${component.step} is already taken by ${seenSteps.get(component.step)}`));
    } else seenSteps.set(component.step, target);
  }
  if (typeof component.wave !== "string" || !/^R\d+$/.test(component.wave)) {
    errors.push(issue(target, `wave must look like R<N>, got ${JSON.stringify(component.wave)}`));
  } else if (typeof component.step === "string" && !component.step.startsWith(`${component.wave}-`)) {
    errors.push(issue(target, `wave ${component.wave} does not match step ${component.step}`));
  }

  // statusDefinitions манифеста — не пояснение, а правило: planned значит,
  // что спецификации нет, и всё, что на неё ссылается, пусто. Проверялся из
  // этого один specPath, и то предупреждением.
  if (component.status === "planned") {
    if (component.specPath !== null) {
      errors.push(issue(target, "planned component must have specPath null (statusDefinitions)"));
    }
    if (component.showcaseAnchor !== null) {
      errors.push(issue(target, "planned component must have showcaseAnchor null (statusDefinitions)"));
    }
    if ((component.cssRoots ?? []).length) {
      errors.push(issue(target, "planned component must have empty cssRoots (statusDefinitions)"));
    }
  }
  // Обратная сторона того же правила и инвариант METHOD §6.5: у записи,
  // которая дошла до спецификации, CSS-корень обязан существовать. Пустой
  // список проходил молча — то есть «существующий CSS root» не проверялся
  // ровно там, где проверять и надо.
  if (["complete", "partial", "figma-only"].includes(component.status) && !(component.cssRoots ?? []).length) {
    errors.push(issue(target, `status ${component.status} requires at least one cssRoot (METHOD §6.5)`));
  }
  // legacy-only по определению манифеста отдельной спецификации не получает.
  // Прежнее правило «любая не-planned запись обязана иметь specPath» делало
  // этот статус недостижимым: запись с ним была ошибкой в любом виде.
  if (component.status === "legacy-only" && component.specPath) {
    errors.push(issue(target, "legacy-only component must not have specPath"));
  }
  if (!["planned", "legacy-only"].includes(component.status) && !component.specPath) {
    errors.push(issue(target, "non-planned component must have specPath"));
  }
  // Зеркало того же правила для showcaseAnchor — METHOD §6.5. До этой строки
  // запись могла дойти до complete/partial с showcaseAnchor: null и пройти
  // --strict кодом 0: обязательным был только якорь, который сам себя уже
  // объявил (см. проверку соответствия c-<id> ниже и поиск узла дальше).
  // Ревью R0-06, находка «дыра 2»: без зеркального правила отказ расставлять
  // якоря заранее (см. planned-ветку выше) ничего не покупал.
  if (!["planned", "legacy-only"].includes(component.status) && !component.showcaseAnchor) {
    errors.push(issue(target, "non-planned component must have showcaseAnchor"));
  }
  // Соглашения манифеста (conventions): путь спецификации и якорь витрины
  // выводятся из category и id. Проверяются, когда значение уже проставлено,
  // — так соглашение держится механически, а не 55 раз вниманием автора.
  if (component.specPath && component.specPath !== `${component.category}/${component.id}.md`) {
    errors.push(
      issue(target, `specPath must be ${component.category}/${component.id}.md, got ${component.specPath}`),
    );
  }
  if (component.showcaseAnchor && component.showcaseAnchor !== `c-${component.id}`) {
    errors.push(
      issue(target, `showcaseAnchor must be c-${component.id}, got ${component.showcaseAnchor}`),
    );
  }

  if (component.specPath) {
    manifestSpecPaths.add(component.specPath.replaceAll("\\", "/"));
    const specFile = path.join(componentsDir, component.specPath);
    if (!fs.existsSync(specFile)) {
      errors.push(issue(target, `spec does not exist: ${component.specPath}`));
    } else {
      const markdown = fs.readFileSync(specFile, "utf8");
      const section = stateSection(markdown);
      if (
        /состояний не объявлено/i.test(section) &&
        hasStateSignalOutsideClaim(markdown)
      ) {
        warnings.push(
          issue(
            target,
            "state section says no states, but utility/ARIA/state signals exist elsewhere",
          ),
        );
      }

      for (const state of component.requiredStates ?? []) {
        const stateAliases = {
          default: [],
          "focus-visible": ["focus-visible"],
          readOnly: ["readonly", "readOnly"],
          dragActive: ["dragActive", "drag-active"],
          invalid: ["invalid", "error"],
          selected: ["selected", "aria-selected", "is-selected"],
          current: ["current", "aria-current", "is-selected"],
          checked: ["checked", "is-checked"],
          indeterminate: ["indeterminate", "is-minus", "mixed"],
          open: ["open", "expanded"],
          closed: ["closed", "collapsed"],
          expanded: ["expanded", "aria-expanded"],
          collapsed: ["collapsed", "aria-expanded"],
          disabled: ["disabled", "disable", "is-disabled"],
          loading: ["loading", "is-loading", "isLoading"],
        };
        const probes = stateAliases[state] ?? [state];
        if (probes.length && !probes.some((probe) => markdown.includes(probe))) {
          warnings.push(issue(target, `required state not evidenced in spec: ${state}`));
        }
      }
    }
  }

  if (component.showcaseAnchor && showcaseExists) {
    // Ищем id настоящего узла (`showcaseSearchable` — без комментариев,
    // <pre> и <code>), а не подстроку по всему файлу: иначе заполнитель
    // `c-<id>` в примере кода для копирования, как только его заменят
    // реальным именем, удовлетворял бы проверке навсегда, независимо от
    // того, поставлена секция или нет (ревью R0-06, «дыра 1»).
    const anchorId = component.showcaseAnchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const anchorTag = new RegExp(`<[a-zA-Z][^>]*\\sid=["']${anchorId}["'][^>]*>`);
    if (!anchorTag.test(showcaseSearchable)) {
      errors.push(issue(target, `showcase anchor not found: ${component.showcaseAnchor}`));
    }
  }

  for (const cssRoot of component.cssRoots ?? []) {
    // Единственное соглашение пакета, которое несёт решение, а не выводится
    // из id: корень — либо снятое имя, либо помеченное новое. Без этой
    // проверки корнем проходило что угодно, включая имена витрины.
    const introduced = cssRoot === `crs-${component.id}`;
    const captured = classNamesInCapturedDom().has(cssRoot);
    if (!introduced && !captured) {
      errors.push(
        issue(
          target,
          `CSS root is neither a class from the captured DOM nor crs-${component.id}: ${cssRoot}`,
        ),
      );
    }
    // Селектор, а не подстрока: `.svg-icon` не делает корнем `svg`,
    // а текст комментария не делает корнем ничего.
    if (!cssSelectorNames.has(cssRoot)) {
      errors.push(issue(target, `CSS root not found in ui/: ${cssRoot}`));
    }
  }

  // Симметрия трёх видов источника. Для production требуется хотя бы одна
  // строка productionEvidence, для storybook-only — storybookEvidence,
  // а для figma-only правила не было вовсе: запись могла объявить «в проде
  // не найдено, описано по макету» и не назвать макета (review-3, major 2).
  // Это ровно та дыра, за которую шаг вернули на второй итерации, только
  // на той оси, куда на второй итерации перевели breadcrumbs.
  if (!Array.isArray(component.figmaEvidence)) {
    errors.push(issue(target, "figmaEvidence must be an array"));
  } else if (component.sourceScope === "figma-only") {
    if (!component.figmaEvidence.length) {
      errors.push(
        issue(target, "sourceScope figma-only requires at least one figmaEvidence entry addressing a node"),
      );
    } else if (!component.figmaEvidence.some((evidence) => evidence.nodeId || evidence.componentKey)) {
      errors.push(
        issue(
          target,
          "sourceScope figma-only requires at least one figmaEvidence entry with nodeId or componentKey; none of the entries addresses anything",
        ),
      );
    }
  }
  for (const [index, evidence] of (component.figmaEvidence ?? []).entries()) {
    if (!evidence.fileKey || !evidence.sourceName) {
      errors.push(issue(target, "Figma evidence needs fileKey and sourceName"));
    }
    // METHOD §3: ссылка и node key фиксируются как evidence. Строка без
    // nodeId и без componentKey не адресует ничего и evidence не является —
    // такая уже лежала в реестре у empty-state (review-3, major 2).
    if (!evidence.nodeId && !evidence.componentKey) {
      errors.push(
        issue(
          target,
          `figmaEvidence[${index}] addresses nothing: nodeId and componentKey are both null (METHOD §3)`,
        ),
      );
    }
    // Файл макета — один из двух объявленных в sources.figma. Чужой ключ
    // означает ссылку на файл, к которому пакет доступа не заявлял.
    if (evidence.fileKey && figmaFileKeys.size && !figmaFileKeys.has(evidence.fileKey)) {
      errors.push(issue(target, `Figma fileKey is not declared in sources.figma: ${evidence.fileKey}`));
    }
    if (evidence.nodeId != null && !/^\d+[:-]\d+$/.test(evidence.nodeId)) {
      errors.push(issue(target, `Figma nodeId must look like 9902:39188, got ${JSON.stringify(evidence.nodeId)}`));
    }
  }

  // Симметрично productionEvidence: запись, объявленная снятой со Storybook,
  // обязана назвать story. Без этого правила storybook-only держался ровно
  // на том же честном слове, что и production до review-2.
  if (!Array.isArray(component.storybookEvidence)) {
    errors.push(issue(target, "storybookEvidence must be an array"));
  } else if (component.sourceScope === "storybook-only" && !component.storybookEvidence.length) {
    errors.push(issue(target, "sourceScope storybook-only requires at least one storybookEvidence entry"));
  }
}

for (const component of manifest.components ?? []) {
  const owner = aliases.get(component.canonicalName);
  if (owner && owner !== component.id) {
    errors.push(
      issue(component.id, `canonicalName collides with legacy alias owned by ${owner}`),
    );
  }
}

// Перепись селекторов против реестра. Здесь проверяется то, что до сих пор
// не проверялось ничем: числа occurrences и seenOn — измерение записанного
// селектора, а не заметка автора записи. Проверка держится на разделении:
// измеряет браузером один инструмент (tools/measure-selectors.mjs), сверяет
// другой, и ни один из них не выравнивает одно по другому.
const productionRecords = (manifest.components ?? []).filter(
  (component) => component.sourceScope === "production",
);
if (productionRecords.length && !census) {
  errors.push(
    "components/selector-census.json отсутствует — числа occurrences и seenOn ничем не подтверждены; снять: node tools/measure-selectors.mjs",
  );
} else if (census) {
  // Подпись прогона. Валидатор читал из переписи два ключа — domFingerprint
  // и selectors, — а те четыре, которыми файл заявляет, что он измерение,
  // а не запись, не читал вовсе: measuredBy «вписано руками, браузер не
  // запускался», environment «javaScriptEnabled: true», measuredAt 1999-01-01
  // и удаление всех трёх давали код 0 (review-3, major 4). Числа безбраузерным
  // правилом действительно не проверить — подпись проверить можно, и заявление
  // шага «подлинность переписи безбраузерным правилом не проверяется» было
  // верно только для одной её половины.
  if (census.measuredBy !== "tools/measure-selectors.mjs") {
    errors.push(
      `selector-census: measuredBy должен быть tools/measure-selectors.mjs — перепись снимает он, и только он; получено ${JSON.stringify(census.measuredBy)}`,
    );
  }
  if (typeof census.environment !== "string" || !census.environment.includes("javaScriptEnabled: false")) {
    errors.push(
      `selector-census: environment должен называть javaScriptEnabled: false — перепись, снятая с включённым JS, это другие числа по построению; получено ${JSON.stringify(census.environment)}`,
    );
  }
  if (typeof census.note !== "string" || !census.note.trim()) {
    errors.push("selector-census: note обязателен и непуст — им перепись отличает измерение от утверждения пакета");
  }
  if (typeof census.measuredAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(census.measuredAt)) {
    errors.push(`selector-census: measuredAt должен быть датой ISO YYYY-MM-DD, получено ${JSON.stringify(census.measuredAt)}`);
  } else {
    // Не раньше самой ранней съёмки страниц: перепись не может быть старше
    // разметки, по которой снята. Опорой служит capturedAt из meta.json —
    // это содержимое репозитория, а не mtime файла, который переживает
    // клонирование как время checkout и давал бы ложную красноту.
    const capturedAt = [];
    for (const id of capturedPages) {
      const metaPath = path.join(pagesDir, id, "meta.json");
      if (!fs.existsSync(metaPath)) continue;
      try {
        const value = JSON.parse(fs.readFileSync(metaPath, "utf8")).capturedAt;
        if (typeof value === "string") capturedAt.push(value.slice(0, 10));
      } catch {
        // Нечитаемый meta.json уже названа ошибкой выше.
      }
    }
    const earliest = capturedAt.sort()[0];
    if (earliest && census.measuredAt < earliest) {
      errors.push(
        `selector-census: measuredAt ${census.measuredAt} раньше самой ранней съёмки страниц (${earliest}) — перепись не может быть старше разметки, по которой снята`,
      );
    }
    const today = new Date().toISOString().slice(0, 10);
    if (census.measuredAt > today) {
      errors.push(`selector-census: measuredAt ${census.measuredAt} в будущем`);
    }
  }

  // Перепись, снятая с другой разметки, — не перепись этого пакета.
  const fingerprint = census.domFingerprint ?? {};
  for (const page of capturedPages) {
    const domFile = path.join(pagesDir, page, "dom.html");
    if (!fs.existsSync(domFile)) continue;
    const actual = crypto.createHash("sha256").update(fs.readFileSync(domFile)).digest("hex").slice(0, 16);
    if (!(page in fingerprint)) {
      errors.push(`selector-census: страница ${page} снята позже переписи — перепись устарела`);
    } else if (fingerprint[page] !== actual) {
      errors.push(`selector-census: разметка страницы ${page} изменилась после переписи (${fingerprint[page]} ≠ ${actual})`);
    }
  }
  for (const page of Object.keys(fingerprint)) {
    if (!capturedPages.has(page)) {
      errors.push(`selector-census: в переписи есть страница ${page}, которой нет в evidence`);
    }
  }

  const censusIds = new Set(Object.keys(census.selectors ?? {}));
  for (const component of manifest.components ?? []) {
    const rows = census.selectors?.[component.id];
    censusIds.delete(component.id);
    if (component.sourceScope !== "production") {
      if (rows) errors.push(issue(component.id, `sourceScope ${component.sourceScope} but selector-census measures it`));
      continue;
    }
    if (!Array.isArray(rows) || !rows.length) {
      errors.push(issue(component.id, "selector-census has no measurement for this record"));
      continue;
    }
    const declaredSelectors = (component.productionEvidence ?? []).map((evidence) => evidence.selector);
    const measuredSelectors = rows.map((row) => row.selector);
    if (declaredSelectors.join("\0") !== measuredSelectors.join("\0")) {
      // Подмена селектора при сохранённых числах — ровно тот случай, ради
      // которого перепись отделена от реестра.
      errors.push(
        issue(
          component.id,
          `selector in the manifest differs from the measured one: ${JSON.stringify(declaredSelectors)} ≠ ${JSON.stringify(measuredSelectors)}`,
        ),
      );
      continue;
    }
    const broken = rows.filter((row) => row.error);
    if (broken.length) {
      errors.push(issue(component.id, `selector could not be measured: ${broken[0].error}`));
      continue;
    }
    const found = rows.reduce((sum, row) => sum + (row.found ?? 0), 0);
    const foundPages = [...new Set(rows.flatMap((row) => row.pages ?? []))].sort();
    if (found !== component.occurrences) {
      errors.push(issue(component.id, `occurrences ${component.occurrences} ≠ measured ${found}`));
    }
    if (foundPages.join(",") !== [...(component.seenOn ?? [])].sort().join(",")) {
      errors.push(
        issue(component.id, `seenOn ${JSON.stringify([...(component.seenOn ?? [])].sort())} ≠ measured ${JSON.stringify(foundPages)}`),
      );
    }
  }
  for (const id of censusIds) {
    errors.push(`selector-census: измерена запись ${id}, которой нет в реестре`);
  }
}

// Циклы зависимостей любой длины. Прежняя проверка ловила только петлю
// на себя, а badge ↔ chip проходили молча — и это ровно тот случай, из-за
// которого порядок сборки перестаёт существовать.
const dependencies = new Map(
  (manifest.components ?? []).map((component) => [component.id, component.dependsOn ?? []]),
);
const cycleState = new Map();
const reportedCycles = new Set();
function findCycle(id, stack) {
  if (cycleState.get(id) === "done") return;
  if (cycleState.get(id) === "open") {
    const cycle = stack.slice(stack.indexOf(id)).concat(id);
    const key = [...cycle].sort().join(" ");
    if (!reportedCycles.has(key)) {
      reportedCycles.add(key);
      errors.push(issue(cycle[0], `dependency cycle: ${cycle.join(" → ")}`));
    }
    return;
  }
  cycleState.set(id, "open");
  stack.push(id);
  for (const dependency of dependencies.get(id) ?? []) {
    if (dependency !== id && dependencies.has(dependency)) findCycle(dependency, stack);
  }
  stack.pop();
  cycleState.set(id, "done");
}
for (const id of dependencies.keys()) findCycle(id, []);

// Один componentKey на две записи — либо общий component set, либо ошибка
// переноса. Молчать об этом реестр не должен; объявленные столкновения
// перечислены в манифесте поимённо и уходят в «Отложено».
const declaredKeyCollisions = new Set(
  Object.keys(manifest.knownComponentKeyCollisions ?? {}),
);
const keyOwners = new Map();
for (const component of manifest.components ?? []) {
  for (const evidence of component.figmaEvidence ?? []) {
    if (!evidence.componentKey) continue;
    if (!keyOwners.has(evidence.componentKey)) keyOwners.set(evidence.componentKey, new Set());
    keyOwners.get(evidence.componentKey).add(component.id);
  }
}
const collidingKeys = [...keyOwners].filter(([, owners]) => owners.size > 1);
for (const [key, owners] of collidingKeys) {
  if (!declaredKeyCollisions.has(key)) {
    errors.push(
      issue([...owners].join(" / "), `componentKey is shared by several records: ${key}`),
    );
  }
}

// Зависимость, которую верстают позже зависящего от неё элемента. Порядком
// сборки dependsOn не является, но расхождение обязано быть названным,
// а не найденным задним числом.
const stepOf = new Map((manifest.components ?? []).map((component) => [component.id, component.step]));
const declaredInversions = new Set(manifest.knownStepInversions ?? []);
const inversions = [];
for (const component of manifest.components ?? []) {
  for (const dependency of component.dependsOn ?? []) {
    const dependencyStep = stepOf.get(dependency);
    if (!dependencyStep || !component.step) continue;
    if (dependencyStep > component.step) {
      const line = `${component.id} (${component.step}) → ${dependency} (${dependencyStep})`;
      inversions.push(line);
      if (!declaredInversions.has(line)) {
        errors.push(issue(component.id, `depends on a later step: ${line}`));
      }
    }
  }
}

// Категории METHOD §5 в том составе, в каком их использует реестр Курсов
// (.pipeline/inventory.json). Папка заводится вместе с первой спецификацией:
// отсутствие папки — не ошибка, спецификация в папке мимо манифеста — ошибка.
const baseSpecFolders = [
  "actions",
  "collections",
  "data-display",
  "entities",
  "feedback",
  "forms",
  "frame-modules",
  "layout",
  "navigation",
  "overlays",
];

for (const folder of baseSpecFolders) {
  const folderPath = path.join(componentsDir, folder);
  if (!fs.existsSync(folderPath)) continue;
  for (const filename of fs.readdirSync(folderPath)) {
    if (!filename.endsWith(".md")) continue;
    const specPath = `${folder}/${filename}`;
    if (!manifestSpecPaths.has(specPath)) {
      errors.push(issue(specPath, "base-scope specification is absent from manifest"));
    }
  }
}

// Отложенные проверки. Не ошибка и не предупреждение: предмета ещё нет,
// его заводит названный шаг. Печатаются всегда, чтобы зелёный вывод не
// читался как «проверено всё» — образец формулировки взят из
// tools/validate-counts.mjs.
const plannedWithoutSpec = manifest.components.filter(
  (component) => component.status === "planned",
).length;
const declaredAnchors = manifest.components.filter((component) => component.showcaseAnchor).length;

if (!showcaseExists) {
  deferred.push(
    `showcase/components.html — витрины ещё нет (R0-06); якорей не проверено: ${declaredAnchors} объявлено из ${manifest.components.length}`,
  );
}
if (manifest.requiredStatesMatrix?.status === "pending") {
  deferred.push(
    `requiredStates — матрицы обязательных состояний ещё нет (${manifest.requiredStatesMatrix.step}); у ${manifest.components.length} записей список пуст`,
  );
}
if (plannedWithoutSpec) {
  deferred.push(
    `спецификации — ${plannedWithoutSpec} записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью`,
  );
}
for (const [key, owners] of collidingKeys) {
  if (!declaredKeyCollisions.has(key)) continue;
  declared.push(
    `componentKey ${key} у записей ${[...owners].join(", ")} — ${manifest.knownComponentKeyCollisions[key]}`,
  );
}
for (const line of inversions) {
  if (declaredInversions.has(line)) declared.push(`зависимость верстается позже: ${line}`);
}

const statusCounts = Object.fromEntries(
  [...allowedStatuses].map((status) => [
    status,
    manifest.components.filter((component) => component.status === status).length,
  ]),
);
const scopeCounts = Object.fromEntries(
  [...allowedSourceScopes].map((scope) => [
    scope,
    manifest.components.filter((component) => component.sourceScope === scope).length,
  ]),
);

console.log(`Validated ${manifest.components.length} component records.`);
console.log(
  methodChecked
    ? `Словари METHOD §5 сверены с ${path.relative(packageDir, methodPath).replaceAll("\\", "/")}.`
    : "Словари METHOD §5 с самим METHOD.md не сверены — см. «Отложено».",
);
console.log(`Status counts: ${JSON.stringify(statusCounts)}`);
console.log(`Source scope counts: ${JSON.stringify(scopeCounts)}`);

if (deferred.length) {
  console.log(`\nОтложено (${deferred.length}) — предмета ещё нет:`);
  for (const item of deferred) console.log(`- ${item}`);
}

if (declared.length) {
  console.log(`\nОбъявлено (${declared.length}) — известно, названо в манифесте, не закрыто:`);
  for (const item of declared) console.log(`- ${item}`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\nManifest structure is valid.");
}

if (process.argv.includes("--strict") && warnings.length) process.exitCode = 1;
