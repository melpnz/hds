/**
 * Сходимость реестра блоков и примитивов — инвариант METHOD §6.5.
 *
 * У каждой записи blocks/manifest.json обязаны существовать статья, CSS root
 * в ui/ и якорь в витрине. Реестр — единственное место, где сходятся статьи,
 * CSS и витрина; если он расходится с диском, расходятся и все три ответа
 * на один вопрос «что в пакете есть».
 *
 * Запуск:
 *   node tools/validate-blocks.mjs
 *   node tools/validate-blocks.mjs --strict     # предупреждения тоже валят
 *
 * Коды возврата:
 *   0  сошлось
 *   1  расхождение (в --strict — ещё и предупреждение)
 *   2  проверять нечего: реестра ещё нет (его заводит R0-05) либо он сломан
 *      настолько, что разбирать в нём нечего
 *
 * Отложенное от ошибки отличается намеренно. Витрину заводит R0-06, и до неё
 * якорь проверить не по чему. Такая запись печатается строкой «отложено»
 * с именем шага, а не зелёным молчанием: «нет витрины» и «якорь не найден»
 * — разные новости.
 *
 * Портирован с courses/tools/validate-components.mjs (read-only образец).
 * Отличия, вызванные видом продукта (METHOD §1 — лендинг, а не интерфейс):
 *   - единица реестра блок, а не компонент; ключ manifest.entries, статьи
 *     лежат в blocks/, примитивы — в components/, пути пишутся от корня
 *     пакета, а не от папки реестра;
 *   - нет поля storybookNames: Storybook у лендингов не существует
 *     ни в одном из источников. Вместо него coverage и nodes — покрытие
 *     дробью и список узлов, из которых оно посчитано (BRIEF §8);
 *   - проверяется инвариант И-4: один набор блоков на три продукта.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const strict = process.argv.includes('--strict');

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolDir, '..');
const rel = (...parts) => path.join(root, ...parts);

const manifestPath = rel('blocks', 'manifest.json');
const showcasePath = rel('showcase', 'blocks.html');
const roadmapPath = rel('ROADMAP.md');
const inventoryPath = rel('.pipeline', 'inventory.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Нет файла blocks/manifest.json — его заводит шаг R0-05. Проверять пока нечего.');
  console.error('');
  console.error('Что появится: 24 записи — 19 типов блоков и 5 примитивов');
  console.error('(.pipeline/inventory.json, registryTotals). Контракт записи — tools/README.md.');
  console.error('');
  console.error('Верхний уровень файла: schemaVersion (число, обязателен — по нему');
  console.error('потребитель узнаёт о смене схемы), entries (список записей),');
  console.error('и необязательные allowedStatuses, allowedStates, allowedKinds,');
  console.error('allowedCategories — словари METHOD §5, сверяемые в обе стороны.');
  console.error('Минимальный реестр, проходящий --strict: {"schemaVersion": 1, "entries": []}.');
  process.exit(2);
}

// Разбор в try: шапка обещает код 2 на реестре, «сломанном настолько, что
// разбирать в нём нечего». Без перехвата JSON.parse ронял скрипт стеком
// SyntaxError с кодом 1 — то есть контракт кодов расходился с поведением
// ровно там, где на него смотрят.
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`blocks/manifest.json не разбирается как JSON: ${error.message}`);
  console.error('Разбирать в реестре нечего — почините синтаксис и запустите снова.');
  process.exit(2);
}
// Без списка записей проверять тоже нечего — но это уже сломанный реестр,
// а не «предмета ещё нет». Без этой проверки первое же обращение к entries
// роняет скрипт стеком TypeError вместо сообщения.
if (!Array.isArray(manifest.entries)) {
  console.error('blocks/manifest.json есть, но ключа entries в нём нет или это не массив.');
  process.exit(2);
}

const errors = [];
const warnings = [];
const deferred = [];
const notes = [];

// -------------------------------------------------------------------------
// Закрытые словари METHOD §5. Это общий контракт конвейера, а не настройка
// пакета: пакет их использует, но не переопределяет. Сверка идёт в обе
// стороны — «реестр расширяет словарь» и «реестр не знает значения словаря»
// это разные ошибки, и обе называются поимённо.
// -------------------------------------------------------------------------
const METHOD = {
  statuses: ['complete', 'partial', 'planned', 'legacy-only', 'figma-only'],
  categories: [
    'actions', 'forms', 'navigation', 'collections', 'data-display',
    'feedback', 'overlays', 'layout', 'frame-modules', 'entities',
  ],
  kinds: ['primitive', 'component', 'module', 'adapter'],
  states: [
    'default', 'hover', 'focus-visible', 'pressed', 'selected', 'current',
    'checked', 'indeterminate', 'expanded', 'collapsed', 'open', 'closed',
    'disabled', 'readOnly', 'loading', 'invalid', 'error', 'success',
    'empty', 'dragActive',
  ],
  // METHOD §5 запрещает их как неоднозначные.
  forbiddenStates: ['active', 'focus', 'select', 'inactive'],
};

// Реестр вправе объявить свои словари — но не разойтись с METHOD.
// Пока сверялись одни статусы, соседние словари охраняли сами себя.
const compareDictionary = (name, declared, canonical) => {
  if (!Array.isArray(declared)) {
    // Незаявленный словарь — не ошибка (пустой реестр обязан проходить
    // --strict, Exit criteria R0 п. 6), но и не «сошлось»: сверка в обе
    // стороны по нему просто не работает, и это говорится вслух.
    notes.push(`manifest.${name} не объявлен — сверка с METHOD §5 по этому словарю не выполняется`);
    return;
  }
  for (const value of declared) {
    if (!canonical.includes(value)) errors.push(`manifest.${name}: значение «${value}» расширяет словарь METHOD §5`);
  }
  for (const value of canonical) {
    if (!declared.includes(value)) errors.push(`manifest.${name}: значение METHOD §5 «${value}» пропущено`);
  }
};
compareDictionary('allowedStatuses', manifest.allowedStatuses, METHOD.statuses);
compareDictionary('allowedStates', manifest.allowedStates, METHOD.states);
compareDictionary('allowedKinds', manifest.allowedKinds, METHOD.kinds);
compareDictionary('allowedCategories', manifest.allowedCategories, METHOD.categories);

if (!manifest.schemaVersion) warnings.push('manifest: нет поля schemaVersion — по нему потребитель узнаёт, что схема сменилась');

// -------------------------------------------------------------------------
// Витрина. Её заводит R0-06; до неё якоря откладываются, а не молчат.
// Из разметки вырезаны комментарии, <pre> и <code>: строка внутри примера
// для копирования не должна удовлетворять проверке якоря наравне с живой
// секцией витрины.
// -------------------------------------------------------------------------
const showcaseExists = fs.existsSync(showcasePath);
const showcase = showcaseExists
  ? fs.readFileSync(showcasePath, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, ' ')
      .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, ' ')
  : '';
const showcaseIds = new Set(
  [...showcase.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
    .map((m) => m[1] ?? m[2] ?? m[3]),
);
if (!showcaseExists) deferred.push('showcase/blocks.html — витрину заводит R0-06, якоря проверить не по чему');

// -------------------------------------------------------------------------
// CSS. Комментарии вырезаются до разбора: иначе классом блока проходит любое
// имя, упомянутое в пояснении, — включая имена витрины и пути файлов. Дальше
// снимаются самые внутренние блоки объявлений, и остаются только селекторы:
// без этого шага `padding: 0 .5em` объявляет класс `5em`.
// -------------------------------------------------------------------------
const walk = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    })
  : []);

const uiCssFiles = walk(rel('ui')).filter((file) => file.endsWith('.css'));
const cssClasses = new Set();
for (const file of uiCssFiles) {
  const selectors = fs.readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{[^{}]*\}/g, ' ');
  for (const match of selectors.matchAll(/\.((?:[\w-]|\\.)+)/g)) {
    const name = match[1].replace(/\\(.)/g, '$1');
    if (!/^\d/.test(name)) cssClasses.add(name);
  }
}
if (cssClasses.size === 0) deferred.push('ui/**/*.css — правил ещё нет: блоки верстают волны R2 и R3');

// -------------------------------------------------------------------------
// Роадмап — источник порядка работ. Выдуманный шаг в реестре расходится
// с ним молча, поэтому step обязан быть строкой существующей таблицы.
// -------------------------------------------------------------------------
const roadmapSteps = new Set(
  fs.existsSync(roadmapPath)
    ? [...fs.readFileSync(roadmapPath, 'utf8').matchAll(/^\|\s*(R\d+-\d+)\s*\|/gm)].map((m) => m[1])
    : [],
);

// Узлы, известные инвентаризации. Совпадение — не требование: баннеры внутри
// бренд-досок отдельными записями не перечислены, и node id баннера в реестре
// законен. Поэтому расхождение идёт строкой «к проверке руками», а не ошибкой.
// Отсутствие инвентаризации выключает три сверки сразу — fileKey, node id
// и ожидаемый размер реестра. Молча выключенная проверка выглядит как
// пройденная, поэтому об этом говорится строкой, а не подразумевается.
let inventory = null;
if (!fs.existsSync(inventoryPath)) {
  warnings.push('.pipeline/inventory.json не найден — сверки fileKey, node id и ожидаемого размера реестра выключены');
} else {
  try {
    inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  } catch (error) {
    warnings.push(`.pipeline/inventory.json не разбирается как JSON (${error.message}) — сверки fileKey, node id и размера реестра выключены`);
  }
}
const knownNodes = new Set([
  ...(inventory?.nodes ?? []).map((node) => node.id),
  ...(inventory?.brandBoards ?? []).map((board) => board.id),
].filter(Boolean));
const knownFileKeys = new Set(
  Object.values(inventory?.sources ?? {}).map((source) => source?.fileKey).filter(Boolean),
);

// -------------------------------------------------------------------------
// Контракт записи. storybookNames в списке нет намеренно: Storybook
// у лендингов не существует ни в одном источнике, и обязательное пустое поле
// приучало бы заполнять реестр формально.
// -------------------------------------------------------------------------
const requiredFields = [
  'id', 'canonicalName', 'legacyAliases', 'category', 'kind',
  'specPath', 'cssRoots', 'showcaseAnchor', 'figmaEvidence',
  'status', 'requiredStates', 'wave', 'step', 'dependsOn',
];
// Только у блоков: покрытие дробью и узлы, из которых оно посчитано.
// У примитива покрытие считается от 23 баннеров или вовсе не считается,
// поэтому поля необязательны — но если coverage есть, он проверяется весь.
const blockFields = ['coverage', 'coverageBase', 'nodes', 'keyExample', 'measuredBy', 'rule'];

// kebab-case от канонического имени (METHOD §5). Три границы слова:
//
//   строчная → заглавная         FooterSocial  → footer-social
//   цифра → начало слова         Grid2Col      → grid2-col
//   хвост аббревиатуры → слово   HTMLParser    → html-parser
//
// Цифра сама по себе границей не считается — этим правило и отличается
// от прежнего ([a-z0-9])([A-Z]), которое разрывало аббревиатуру «B2B»
// на «b2-b»: FooterCorporateB2B, первый блок волны R2 (шаг R2-01),
// получал в сообщении предложение id, само незаконное для поля id.
// Заглавная считается началом слова, только если за ней идёт строчная:
// в «B2B» последняя B — хвост аббревиатуры, а в «Grid2Col» C начинает
// слово. Прогон по 24 каноническим именам инвентаризации — 24 из 24.
const kebab = (name) => name
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([0-9])([A-Z][a-z])/g, '$1-$2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .toLowerCase();

// PascalCase по METHOD §5. Проверяется до kebab: у имени с пробелом
// («Site Header») kebab отдаёт «site header», и сообщение предлагало бы
// в качестве id строку, которая сама не проходит проверку id.
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;

const seen = { id: new Map(), canonicalName: new Map(), showcaseAnchor: new Map(), specPath: new Map() };
const ids = new Set(manifest.entries.map((entry) => entry?.id).filter(Boolean));
const PRODUCT_SUFFIX = /-(career|habr|courses|kursy)$/;

for (const [index, entry] of manifest.entries.entries()) {
  const label = entry?.id ? `entries[${index}] ${entry.id}` : `entries[${index}]`;

  if (!entry || typeof entry !== 'object') {
    errors.push(`${label}: запись не объект`);
    continue;
  }

  for (const field of requiredFields) {
    if (!(field in entry)) errors.push(`${label}: нет обязательного поля ${field}`);
  }
  for (const field of ['legacyAliases', 'cssRoots', 'figmaEvidence', 'requiredStates', 'dependsOn']) {
    if (field in entry && !Array.isArray(entry[field])) errors.push(`${label}: поле ${field} обязано быть списком`);
  }

  // Уникальность. Реестр — точка сходимости; два одинаковых id означают,
  // что один из них молча выигрывает у другого при любом обращении.
  for (const key of Object.keys(seen)) {
    const value = entry[key];
    if (typeof value !== 'string' || !value) continue;
    if (seen[key].has(value)) errors.push(`${label}: ${key} «${value}» уже занят записью ${seen[key].get(value)}`);
    else seen[key].set(value, entry.id ?? `entries[${index}]`);
  }

  // METHOD §5: каноническое имя — PascalCase, id — kebab-case от него.
  if (typeof entry.canonicalName === 'string' && !PASCAL_CASE.test(entry.canonicalName)) {
    errors.push(`${label}: canonicalName «${entry.canonicalName}» не PascalCase — METHOD §5. Из такого имени id не выводится`);
  } else if (typeof entry.id === 'string' && typeof entry.canonicalName === 'string') {
    const expected = kebab(entry.canonicalName);
    if (entry.id !== expected) errors.push(`${label}: id не kebab-case от canonicalName «${entry.canonicalName}» — ожидалось ${expected}`);
  }

  // Инвариант И-4 (BRIEF §10): один набор блоков на три продукта.
  // Различие продуктов живёт в токенах, а не в размноженных записях.
  if (typeof entry.id === 'string' && PRODUCT_SUFFIX.test(entry.id)) {
    errors.push(`${label}: запись размножена по продукту — инвариант И-4. Различие продуктов живёт в токенах`);
  }

  if (entry.status !== undefined && !METHOD.statuses.includes(entry.status)) {
    errors.push(`${label}: status «${entry.status}» вне словаря METHOD §5`);
  }
  if (entry.category !== undefined && !METHOD.categories.includes(entry.category)) {
    errors.push(`${label}: category «${entry.category}» вне словаря METHOD §5`);
  }
  if (entry.kind !== undefined && !METHOD.kinds.includes(entry.kind)) {
    errors.push(`${label}: kind «${entry.kind}» вне словаря METHOD §5 (${METHOD.kinds.join(', ')})`);
  }
  for (const state of entry.requiredStates ?? []) {
    if (METHOD.forbiddenStates.includes(state)) errors.push(`${label}: состояние «${state}» запрещено METHOD §5 как неоднозначное`);
    else if (!METHOD.states.includes(state)) errors.push(`${label}: состояние «${state}» вне закрытого словаря METHOD §5`);
  }
  // Статус complete при непокрытых состояниях — ровно то, что METHOD
  // запрещает ставить: «complete только если покрыты все обязательные».
  if (entry.status === 'complete' && Array.isArray(entry.requiredStates) && entry.requiredStates.length === 0) {
    warnings.push(`${label}: status complete при пустом requiredStates — покрывать нечего или список не заполнен?`);
  }

  // Статья. Путь пишется от корня пакета: статьи блоков лежат в blocks/,
  // примитивов — в components/, и относительный путь от папки реестра
  // читался бы как ../components/… при каждом примитиве.
  if (typeof entry.specPath === 'string') {
    if (entry.specPath.startsWith('/') || entry.specPath.includes('..')) {
      errors.push(`${label}: specPath «${entry.specPath}» пишется от корня пакета, без .. и ведущего слэша`);
    } else if (!fs.existsSync(rel(entry.specPath))) {
      errors.push(`${label}: статьи ${entry.specPath} на диске нет`);
    }
  }

  // CSS root. Пока в ui/ нет ни одного правила, это отложено целиком —
  // иначе R0-05 не сможет завести реестр до вёрстки блоков.
  for (const cssRoot of entry.cssRoots ?? []) {
    if (typeof cssRoot !== 'string' || cssRoot.startsWith('.')) {
      errors.push(`${label}: cssRoots хранит имя класса без точки, получено «${cssRoot}»`);
      continue;
    }
    if (cssClasses.size === 0) continue;
    if (!cssClasses.has(cssRoot)) errors.push(`${label}: класса .${cssRoot} нет ни в одном файле ui/**/*.css`);
  }

  // Якорь витрины.
  if (typeof entry.showcaseAnchor === 'string') {
    if (!/^[a-z0-9-]+$/.test(entry.showcaseAnchor)) {
      errors.push(`${label}: showcaseAnchor «${entry.showcaseAnchor}» — ожидались строчные латинские, цифры и дефис`);
    } else if (typeof entry.id === 'string' && !entry.showcaseAnchor.includes(entry.id)) {
      errors.push(`${label}: showcaseAnchor «${entry.showcaseAnchor}» не содержит id записи — по такому якорю запись не найти`);
    }
    if (showcaseExists && !showcaseIds.has(entry.showcaseAnchor)) {
      errors.push(`${label}: якоря #${entry.showcaseAnchor} в showcase/blocks.html нет`);
    }
  }

  // Evidence из Figma. Формат node id жёсткий: 20216:120. Строка вида
  // «hero второго макета» здесь означала бы утверждение без источника.
  for (const evidence of entry.figmaEvidence ?? []) {
    const nodeId = typeof evidence === 'string' ? evidence : evidence?.node;
    const fileKey = typeof evidence === 'string' ? null : evidence?.fileKey;
    if (typeof nodeId !== 'string' || !/^\d+:\d+$/.test(nodeId)) {
      errors.push(`${label}: figmaEvidence «${JSON.stringify(evidence)}» — ожидался node id вида 20216:120`);
      continue;
    }
    if (fileKey && knownFileKeys.size && !knownFileKeys.has(fileKey)) {
      errors.push(`${label}: fileKey «${fileKey}» не совпадает ни с одним из файлов инвентаризации`);
    }
    if (knownNodes.size && !knownNodes.has(nodeId)) {
      notes.push(`${label}: узел ${nodeId} не перечислен в inventory.nodes/brandBoards — проверьте руками (баннеры внутри досок там не перечислены)`);
    }
  }

  // Место в роадмапе.
  if (typeof entry.step === 'string' && roadmapSteps.size && !roadmapSteps.has(entry.step)) {
    errors.push(`${label}: шага ${entry.step} в ROADMAP.md нет`);
  }
  if (typeof entry.step === 'string' && typeof entry.wave === 'string' && !entry.step.startsWith(`${entry.wave}-`)) {
    errors.push(`${label}: wave ${entry.wave} и step ${entry.step} расходятся`);
  }

  // Зависимости.
  for (const dependency of entry.dependsOn ?? []) {
    if (dependency === entry.id) errors.push(`${label}: запись зависит от себя`);
    else if (!ids.has(dependency)) errors.push(`${label}: dependsOn «${dependency}» — такой записи в реестре нет`);
  }

  // -----------------------------------------------------------------------
  // Покрытие. Инвариант И-7: 15/18 значит измерено 15 из 18, а не
  // «примерно все». Числитель обязан сойтись с длиной списка узлов —
  // иначе дробь остаётся верной на вид при вычеркнутом узле.
  // -----------------------------------------------------------------------
  const hasCoverage = blockFields.some((field) => field in entry);
  if (hasCoverage) {
    for (const field of blockFields) {
      if (!(field in entry)) errors.push(`${label}: есть покрытие, но нет поля ${field}`);
    }
    const match = typeof entry.coverage === 'string' ? entry.coverage.match(/^(\d+)\/(\d+)$/) : null;
    if (!match) {
      errors.push(`${label}: coverage «${entry.coverage}» — ожидалась дробь вида 15/18`);
    } else {
      const [, numerator, denominator] = match.map(Number);
      if (numerator > denominator) errors.push(`${label}: coverage ${entry.coverage} — числитель больше знаменателя`);
      if (entry.coverageBase !== undefined && entry.coverageBase !== denominator) {
        errors.push(`${label}: coverageBase ${entry.coverageBase} не равен знаменателю ${denominator}`);
      }
      if (Array.isArray(entry.nodes) && entry.nodes.length !== numerator) {
        errors.push(`${label}: coverage ${entry.coverage}, а узлов перечислено ${entry.nodes.length} — И-7`);
      }
      // METHOD §8: покрытие 1 — наблюдение, а не правило.
      if (entry.rule !== undefined && entry.rule !== (numerator >= 2)) {
        errors.push(`${label}: rule ${entry.rule} при покрытии ${entry.coverage} — METHOD §8: правило требует ≥2 подтверждений`);
      }
    }
    for (const nodeId of entry.nodes ?? []) {
      if (typeof nodeId !== 'string' || !/^\d+:\d+$/.test(nodeId)) {
        errors.push(`${label}: nodes содержит «${nodeId}» — ожидался node id вида 20216:120`);
      }
    }
    if (typeof entry.keyExample === 'string' && Array.isArray(entry.nodes) && !entry.nodes.includes(entry.keyExample)) {
      errors.push(`${label}: keyExample ${entry.keyExample} не входит в собственный список узлов`);
    }
  }
}

// Цикл зависимостей: собрать блок, стоящий на себе через соседа, нельзя,
// а на глаз в реестре из 24 записей это не видно.
const colour = new Map();
const cycleAt = (id, trail) => {
  if (colour.get(id) === 'done') return null;
  if (colour.get(id) === 'walking') return [...trail, id];
  colour.set(id, 'walking');
  const entry = manifest.entries.find((candidate) => candidate?.id === id);
  for (const dependency of entry?.dependsOn ?? []) {
    if (!ids.has(dependency)) continue;
    const found = cycleAt(dependency, [...trail, id]);
    if (found) return found;
  }
  colour.set(id, 'done');
  return null;
};
for (const id of ids) {
  const cycle = cycleAt(id, []);
  if (cycle) {
    errors.push(`Цикл зависимостей: ${cycle.join(' → ')}`);
    break;
  }
}

// Реестр против инвентаризации: сколько записей ожидалось. Это строка
// к сведению, а не предупреждение. Реестр наполняется волнами, и
// R0 требует, чтобы --strict проходил на пустом реестре (Exit criteria R0
// п. 6): полнота реестра — предмет приёмки волны, а не этого скрипта.
const expected = inventory?.registryTotals?.total;
if (expected && manifest.entries.length !== expected) {
  notes.push(`Записей в реестре ${manifest.entries.length}, инвентаризация ожидает ${expected} (registryTotals.total) — реестр наполняется волнами`);
}

const print = (title, list, stream = console.error) => {
  if (!list.length) return;
  stream(`${title} (${list.length}):\n`);
  for (const line of list) stream(`  ${line}`);
  stream('');
};

print('Отложено — предмета ещё нет', deferred, console.log);
print('К проверке руками', notes, console.log);
print('Предупреждения', warnings, console.warn);
print('Реестр не сходится', errors);

if (errors.length || (strict && warnings.length)) {
  if (strict && warnings.length && !errors.length) console.error('Запуск с --strict: предупреждения считаются ошибками.');
  process.exit(1);
}

console.log(`Записей ${manifest.entries.length}: статьи на месте, cssRoots ${cssClasses.size ? 'сошлись' : 'отложены'}, якоря ${showcaseExists ? 'сошлись' : 'отложены'}.`);
