/**
 * Сверяет числа, заявленные в документации, с тем, что реально в пакете.
 *
 * Зачем. Счётчики — узлов, блоков, записей реестра, шагов, находок, покрытий —
 * записаны прозой в четырёх файлах и правятся руками. После любой правки они
 * расходятся молча: документ продолжает утверждать старое число, и по нему
 * судят о покрытии. Инвариант И-7 (BRIEF §10) требует обратного: 15/18 значит
 * измерено 15 из 18, а не «примерно все».
 *
 * Запуск:
 *   node tools/validate-counts.mjs
 *   node tools/validate-counts.mjs --explain    # что где написано и чем измерено
 *
 * Коды возврата: 0 — сошлось; 1 — расхождение или устаревшее правило.
 *
 * Устройство. Слева — измерение: значение и то, чем оно получено. Справа —
 * таблица «файл · регулярка · ключ»: где это число написано словами. Правило,
 * чей файл ещё не заведён, пропускается с пометкой, а не роняет проверку:
 * пакет собирается волнами. Правило, чей файл есть, а формулировка не нашлась,
 * — ошибка: значит, текст переписали, а сторож остался сторожить исчезнувшее.
 *
 * Портирован с courses/tools/validate-counts.mjs (read-only образец).
 * Отличия: источник истины здесь один — .pipeline/inventory.json, потому что
 * ui/ и blocks/ пустые до R0-02 и R0-05; добавлены покрытия блоков дробью
 * (И-7) и сверка самой инвентаризации на внутреннюю сходимость.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const explain = process.argv.includes('--explain');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (file) => path.join(root, file);
const read = (file) => fs.readFileSync(rel(file), 'utf8');
const exists = (file) => fs.existsSync(rel(file));

const inventoryFile = '.pipeline/inventory.json';
if (!exists(inventoryFile)) {
  console.error(`Нет ${inventoryFile} — считать не из чего. Инвентаризацию ведёт guide-spec.`);
  process.exit(1);
}
let inventory;
try {
  inventory = JSON.parse(read(inventoryFile));
} catch (error) {
  console.error(`${inventoryFile} не разбирается как JSON: ${error.message}`);
  console.error('Считать не из чего — почините синтаксис инвентаризации и запустите снова.');
  process.exit(1);
}

const roadmap = exists('ROADMAP.md') ? read('ROADMAP.md') : '';

// Разбор состава секций: 18 узлов Figma, разложенных на члены стопки.
// Числа берутся из самого разбора, а не из строки в статье: иначе сторож
// сверял бы прозу с прозой. Файла может не быть — тогда правила о нём
// пропускаются, как и все прочие правила о ненаписанных файлах.
const sectionsFile = '.pipeline/section-map/sections.json';
let sections = null;
if (exists(sectionsFile)) {
  try {
    sections = Object.values(JSON.parse(read(sectionsFile)));
  } catch (error) {
    console.error(`${sectionsFile} не разбирается как JSON: ${error.message}`);
    process.exit(1);
  }
}
const stacks = sections ? sections.filter((page) => page.stack) : null;
const stackMembers = stacks ? stacks.reduce((sum, page) => sum + page.members, 0) : null;
const typedMembers = stacks
  ? stacks.reduce((sum, page) => sum + page.sections.filter((s) => s.type !== '?').length, 0)
  : null;
const countMatches = (text, re) => (text.match(re) || []).length;

// Покрытие блока — то же число, что дробь в тексте, и берётся оно из длины
// списка узлов, а не из строки coverage: иначе сторож сверял бы строку
// с самой собой. Так дробь ловит и вычеркнутый узел.
const blockNodes = (id) => {
  const block = inventory.blocks.find((candidate) => candidate.id === id);
  return block ? block.nodes.length : null;
};

// Покрытие узла 14871:1319 — 83 %. Число живёт в шести местах документации
// и до правки не сторожилось нигде: подмена 83 → 61 проходила зелёной.
// Процент считается, а не читается: числитель берётся из строки
// renderCovered, знаменатель — из отдельного поля height того же узла.
const partialNode = inventory.nodes.find((node) => node.render === 'partial') ?? null;
const partialPx = partialNode?.renderCovered?.match(/(\d[\d\s ]*)\s*из/);
const renderCoveredPx = partialPx ? Number(partialPx[1].replace(/[\s ]/g, '')) : null;
const renderPercent = renderCoveredPx && partialNode?.height
  ? Math.round((renderCoveredPx / partialNode.height) * 100)
  : null;

// Пар «один макет в двух темах» — 0. Пара измерима: это проект, у которого
// среди снятых узлов есть и тёмный, и светлый. На этом нуле стоит решение
// Р-2 (светлая тема целиком — норматив), и до правки он не сторожился.
const themesByProject = new Map();
for (const node of inventory.nodes) {
  if (!node.project || !node.theme) continue;
  if (!themesByProject.has(node.project)) themesByProject.set(node.project, new Set());
  themesByProject.get(node.project).add(node.theme);
}
const themePairs = [...themesByProject.values()]
  .filter((themes) => themes.has('dark') && themes.has('light')).length;

// -------------------------------------------------------------------------
// Четыре числа о типографике живут не в inventory.json, а в самом CSS блоков,
// и до этой правки их не сторожил никто. Гайд успел утверждать про них
// «такой блок один» при семи литеральных кеглях и предписывать литералам
// @normative, которого не нёс ни один из семи (находка 03-17,
// .pipeline/R0-03/review-3.md), а пробел ALS Hauss записать по четырём
// правилам при восьми затронутых (находка 03-20). Ни один из шести сторожей
// такого не ловит: validate-normative разбирает наличие маркера, а не
// правдивость счёта, а здесь считалось только записанное в инвентаризации.
// Инвентаризация о содержимом ui/ ничего не знает — она снята до вёрстки.
const blocksDir = 'ui/blocks';
const blockCssFiles = exists(blocksDir)
  ? fs.readdirSync(rel(blocksDir)).filter((name) => name.endsWith('.css')).map((name) => `${blocksDir}/${name}`)
  : [];
// Комментарии заменяются пробелами той же длины: иначе кегль из маркера
// («ALS Hauss Medium 15/1.5») считается объявлением, а номера строк едут.
const blankCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (chunk) => chunk.replace(/[^\n]/g, ' '));
let literalFontSizes = 0;   // снятый абсолютный кегль вместо роли шкалы
let mobileFontSizes = 0;    // тот же литерал, но внутри @media — мобильная ступень
let roleSubstitutions = 0;  // роль шкалы вместо снятого числа, помеченная @normative
let alsHaussRules = 0;      // правила, чей @snapshot называет ALS Hauss
for (const file of blockCssFiles) {
  const raw = read(file);
  roleSubstitutions += countMatches(raw, /@normative подстановка роли/g);
  // Регистр не важен: часть маркеров называет гарнитуру снятым начертанием
  // («ALS Hauss Medium 15/1.5»), часть — ссылкой на блок-пробел в конце
  // core.css, который написан капителью. Затронуто правило в обоих случаях.
  alsHaussRules += countMatches(raw, /@snapshot[^*]*ALS Hauss/gi);
  // Глубина @media считается вручную: font-size внутри медиазапроса — это
  // мобильная ступень, снаружи — обычное объявление. Значение с var(--core*)
  // литералом не считается: это и есть роль шкалы.
  const css = blankCssComments(raw);
  const mediaAt = [];
  let depth = 0;
  for (const token of css.matchAll(/@media|[{}]|font-size\s*:\s*([^;}]+)/g)) {
    if (token[0] === '@media') { mediaAt.push(depth); continue; }
    if (token[0] === '{') { depth += 1; continue; }
    if (token[0] === '}') {
      depth -= 1;
      if (mediaAt.length && mediaAt.at(-1) >= depth) mediaAt.pop();
      continue;
    }
    if (/var\(/.test(token[1])) continue;
    if (mediaAt.length) mobileFontSizes += 1; else literalFontSizes += 1;
  }
}

// -------------------------------------------------------------------------
// Границы покрытия живут в двух местах: разделами в evidence/coverage.md
// и записями coverageLimits в инвентаризации. До этого правила пара
// расходилась молча — файл нёс 17 границ, реестр 12, — и подмена любого числа
// самого файла проходила зелёной: ни один регэксп сторожа не смотрел
// в evidence/ вовсе (находка 1 ревью R0-07). Число берётся из структуры файла,
// заголовков вида «## 7.», а не из его же прозы: иначе сторож сверял бы
// документ с самим собой. Заголовки 8а/8б/8в буквой не считаются — это
// подпункты одной границы, и в реестре им отвечает одна запись CL-8.
const coverageFile = 'evidence/coverage.md';
const coverageSections = exists(coverageFile)
  ? countMatches(read(coverageFile), /^## \d+\. /gm)
  : null;

// -------------------------------------------------------------------------
// Измерения: значение и то, чем оно получено.
// -------------------------------------------------------------------------
const actual = {
  landingNodes: [inventory.nodes.length, 'длина inventory.nodes'],
  brandBoards: [inventory.brandBoards.length, 'длина inventory.brandBoards'],
  banners: [inventory.sources.figmaBrand.banners, 'inventory.sources.figmaBrand.banners'],
  measuredCss: [inventory.sources.figmaLandings.capturedCss, 'inventory.sources.figmaLandings.capturedCss'],
  blockTypes: [inventory.blocks.length, 'длина inventory.blocks'],
  primitives: [inventory.elements.length, 'длина inventory.elements'],
  registryTotal: [inventory.blocks.length + inventory.elements.length, 'blocks + elements'],
  patterns: [inventory.patterns.length, 'длина inventory.patterns'],
  productionLines: [inventory.productionLines.lines.length, 'длина inventory.productionLines.lines'],
  findings: [inventory.findings.total, 'inventory.findings.total'],
  openQuestions: [inventory.openQuestions.length, 'длина inventory.openQuestions'],
  coverageLimits: [inventory.coverageLimits.length, 'длина inventory.coverageLimits'],
  coverageSections: [coverageSections, 'разделы вида «## N.» в evidence/coverage.md'],
  // Шаги считаются по строкам таблиц роадмапа, а не по числу в его же сводке.
  roadmapSteps: [countMatches(roadmap, /^\| R\d-\d{2} \|/gm), 'строки таблиц ROADMAP.md вида | R0-01 |'],
  roadmapR0: [countMatches(roadmap, /^\| R0-\d{2} \|/gm), 'строки таблицы R0 в ROADMAP.md'],
  // Просмотренная доля частично снятого узла и пары тем. Оба числа стоят
  // в сводке роадмапа и в чеклисте приёмки; до правки не сторожилось ни одно.
  renderPercent: [renderPercent, `${renderCoveredPx} из ${partialNode?.height} px у ${partialNode?.id}`],
  renderCoveredPx: [renderCoveredPx, `числитель renderCovered у ${partialNode?.id}`],
  renderNodeHeight: [partialNode?.height ?? null, `высота узла ${partialNode?.id}`],
  themePairs: [themePairs, 'проекты, у которых среди nodes есть и тёмный, и светлый узел'],
  stacks: [stacks?.length ?? null, 'страницы со stack: true в sections.json'],
  stackMembers: [stackMembers, 'сумма members по стопкам в sections.json'],
  typedMembers: [typedMembers, 'члены стопок с типом, отличным от «?»'],
  untypedMembers: [stackMembers === null ? null : stackMembers - typedMembers, 'члены стопок с типом «?»'],
  // Четыре числа о типографике — из самого ui/blocks/*.css, а не из документа.
  literalFontSizes: [blockCssFiles.length ? literalFontSizes : null, 'объявления font-size без var(--core*) вне @media в ui/blocks/*.css'],
  mobileFontSizes: [blockCssFiles.length ? mobileFontSizes : null, 'те же объявления внутри @media'],
  roleSubstitutions: [blockCssFiles.length ? roleSubstitutions : null, 'маркеры «@normative подстановка роли» в ui/blocks/*.css'],
  alsHaussRules: [blockCssFiles.length ? alsHaussRules : null, 'маркеры @snapshot, называющие ALS Hauss, в ui/blocks/*.css'],
};

// Покрытия блоков — дробью, числитель из списка узлов (И-7). Ключ заводится
// на каждый блок инвентаризации, а не на шесть избранных: сторожились
// шесть из девятнадцати, и подмена 2/18 → 9/18 у FAQ проходила зелёной,
// хотя она переключает rule: false в rule: true (METHOD §8).
for (const block of inventory.blocks) {
  actual[`cover:${block.id}`] = [blockNodes(block.id), `длина nodes у блока ${block.id}`];
}

// -------------------------------------------------------------------------
// Что где заявлено. Регулярка обязана иметь ровно одну группу — число.
// -------------------------------------------------------------------------
const claims = [
  // --- README.md
  ['README.md', /Пакет собирается обратной разработкой: (\d+) макетов лендингов/, 'landingNodes'],
  ['README.md', /(\d+) макетов лендингов и \d+ бренд-доски/, 'landingNodes'],
  ['README.md', /\d+ макетов лендингов и (\d+) бренд-доски/, 'brandBoards'],
  // Формулировки в README переписывались, и правила отстали: сторож искал
  // «собран реестр из N записей» и «составлен роадмап на N шагов», которых
  // в тексте больше нет, и молча падал, ничего при этом не стерегя.
  // Привязка перенесена на нынешние места — строку таблицы и строку карты
  // пакета. Числа те же, адрес другой.
  ['README.md', /Записей в реестре \| \*\*(\d+)\*\*/, 'registryTotal'],
  ['README.md', /ROADMAP\.md\s+(\d+) шагов/, 'roadmapSteps'],
  ['README.md', /и (\d+) бренд-доски\nс \d+ баннерами/, 'brandBoards'],
  ['README.md', /и \d+ бренд-доски\nс (\d+) баннерами/, 'banners'],
  ['README.md', /\| Типов блоков \| \*\*(\d+)\*\*/, 'blockTypes'],
  ['README.md', /\| Записей в реестре \| \*\*(\d+)\*\*/, 'registryTotal'],
  ['README.md', /\| Записей в реестре \| \*\*\d+\*\* — (\d+) типов блоков/, 'blockTypes'],
  ['README.md', /\| Записей в реестре \| \*\*\d+\*\* — \d+ типов блоков \+ (\d+) примитив/, 'primitives'],
  ['README.md', /\| Бренд-материал \| (\d+) баннера/, 'banners'],
  ['README.md', /ROADMAP\.md\s+(\d+) шагов по шести волнам/, 'roadmapSteps'],
  ['README.md', /ROADMAP\.md\s+\d+ шагов по шести волнам, (\d+) находок/, 'findings'],
  ['README.md', /ROADMAP\.md\s+\d+ шагов по шести волнам, \d+ находок, (\d+) вопроса владельцу/, 'openQuestions'],
  ['README.md', /inventory\.json\s+реестр: (\d+) узлов/, 'landingNodes'],
  ['README.md', /inventory\.json\s+реестр: \d+ узлов, (\d+) доски/, 'brandBoards'],
  ['README.md', /inventory\.json\s+реестр: \d+ узлов, \d+ доски, (\d+) типов блоков/, 'blockTypes'],
  ['README.md', /inventory\.json\s+реестр: \d+ узлов, \d+ доски, \d+ типов блоков, (\d+) примитивов/, 'primitives'],
  ['README.md', /inventory\.json\s+реестр: \d+ узлов, \d+ доски, \d+ типов блоков, \d+ примитивов, (\d+) рецепта/, 'patterns'],

  // --- ROADMAP.md, сводка «Где пакет сейчас»
  ['ROADMAP.md', /\| Макетов лендингов \| \*\*(\d+)\*\*/, 'landingNodes'],
  ['ROADMAP.md', /\| Снято CSS \| \*\*(\d+) узлов из \d+\*\*/, 'measuredCss'],
  ['ROADMAP.md', /\| Снято CSS \| \*\*\d+ узлов из (\d+)\*\*/, 'landingNodes'],
  ['ROADMAP.md', /\| Производственных линий \| \*\*(\d+)\*\*/, 'productionLines'],
  ['ROADMAP.md', /\| Типов блоков \| \*\*(\d+)\*\*/, 'blockTypes'],
  ['ROADMAP.md', /\| Записей в реестре \| \*\*(\d+)\*\*/, 'registryTotal'],
  ['ROADMAP.md', /\| Записей в реестре \| \*\*\d+\*\* — (\d+) типов блоков/, 'blockTypes'],
  ['ROADMAP.md', /\| Записей в реестре \| \*\*\d+\*\* — \d+ типов блоков \+ (\d+) примитив/, 'primitives'],
  ['ROADMAP.md', /\| Шагов в роадмапе \| \*\*(\d+)\*\*/, 'roadmapSteps'],
  ['ROADMAP.md', /\| Шагов в роадмапе \| \*\*\d+\*\* — R0 (\d+)/, 'roadmapR0'],
  ['ROADMAP.md', /\| Рецептов страниц \| \*\*(\d+)\*\*/, 'patterns'],
  ['ROADMAP.md', /\| Бренд-материал \| (\d+) концепт-доски/, 'brandBoards'],
  ['ROADMAP.md', /\| Бренд-материал \| \d+ концепт-доски, \*\*(\d+) баннера\*\*/, 'banners'],
  ['ROADMAP.md', /\| Находок аудитов \| \*\*(\d+)\*\*/, 'findings'],
  ['ROADMAP.md', /\| Открытых вопросов \| \*\*(\d+)\*\*/, 'openQuestions'],
  // Перечень чисел, которые сторожит этот скрипт, — в самом чеклисте приёмки.
  ['ROADMAP.md', /(\d+) узлов, \d+ измеренных CSS, 83 %, \d+ типов блоков/, 'landingNodes'],
  ['ROADMAP.md', /\d+ узлов, (\d+) измеренных CSS, 83 %, \d+ типов блоков/, 'measuredCss'],
  ['ROADMAP.md', /\d+ узлов, \d+ измеренных CSS, 83 %, (\d+) типов блоков/, 'blockTypes'],
  ['ROADMAP.md', /83 %, \d+ типов блоков, (\d+) записи реестра/, 'registryTotal'],
  ['ROADMAP.md', /83 %, \d+ типов блоков, \d+ записи реестра, (\d+) шагов/, 'roadmapSteps'],
  ['ROADMAP.md', /^(\d+) находок, \d+ баннера, 0 веб-форматов/m, 'findings'],
  ['ROADMAP.md', /^\d+ находок, (\d+) баннера, 0 веб-форматов/m, 'banners'],
  // Покрытия в строках шагов R2. Дробь стоит отдельной колонкой таблицы.
  ['ROADMAP.md', /\| R2-03 \|[^|]*\| (\d+)\/18 \|/, 'cover:footer-social'],
  ['ROADMAP.md', /\| R2-04 \|[^|]*\| \*\*(\d+)\/18\*\* \|/, 'cover:hero'],
  ['ROADMAP.md', /\| R2-05 \|[^|]*\| (\d+)\/18 \|/, 'cover:site-header'],
  ['ROADMAP.md', /\| R2-06 \|[^|]*\| (\d+)\/18 \|/, 'cover:form'],
  ['ROADMAP.md', /\| R2-07 \|[^|]*\| (\d+)\/18 \|/, 'cover:program-schedule'],
  ['ROADMAP.md', /покрытие от \*\*(\d+)\/18\*\* \(hero\)/, 'cover:hero'],
  ['ROADMAP.md', /до \*\*(\d+)\/18\*\* \(отзывы\)/, 'cover:testimonials'],
  // Остальные тринадцать покрытий. Сторожились шесть из девятнадцати,
  // и незамеченными проходили обе подмены из ревью-1: R2-08 9/18 → 3/18
  // и R3-04 2/18 → 9/18. Вторая переключает наблюдение в правило.
  ['ROADMAP.md', /\| R2-01 \|[^|]*\| (\d+)\/18 \|/, 'cover:footer-corporate-b2b'],
  ['ROADMAP.md', /\| R2-02 \|[^|]*\| (\d+)\/18 \|/, 'cover:footer-community'],
  ['ROADMAP.md', /\| R2-08 \|[^|]*\| (\d+)\/18 \|/, 'cover:partners'],
  ['ROADMAP.md', /\| R2-09 \|[^|]*\| (\d+)\/18 \|/, 'cover:speakers'],
  ['ROADMAP.md', /\| R2-10 \|[^|]*\| (\d+)\/18 \|/, 'cover:numbered-benefits'],
  ['ROADMAP.md', /\| R3-01 \|[^|]*\| (\d+)\/18 \|/, 'cover:stats'],
  ['ROADMAP.md', /\| R3-02 \|[^|]*\| (\d+)\/18 \|/, 'cover:interactive'],
  ['ROADMAP.md', /\| R3-03 \|[^|]*\| (\d+)\/18 \|/, 'cover:nominations-grid'],
  ['ROADMAP.md', /\| R3-04 \|[^|]*\| (\d+)\/18 \|/, 'cover:faq'],
  ['ROADMAP.md', /\| R3-05 \|[^|]*\| (\d+)\/18 \|/, 'cover:timeline'],
  ['ROADMAP.md', /\| R3-06 \|[^|]*\| (\d+)\/18 \|/, 'cover:gallery'],
  ['ROADMAP.md', /\*\*Бегущая строка\*\* — (\d+)\/18/, 'cover:marquee'],
  ['ROADMAP.md', /соцсети (\d+)\/18/, 'cover:footer-social'],
  ['ROADMAP.md', /«Сделано в Хабре» (\d+)\/18/, 'cover:footer-copyright'],
  // Тот же перечень прозой перед таблицей R3: он и объявляет, какие блоки
  // остаются наблюдением по METHOD §8.
  ['ROADMAP.md', /FAQ (\d+)\/18/, 'cover:faq'],
  ['ROADMAP.md', /таймлайн (\d+)\/18/, 'cover:timeline'],
  ['ROADMAP.md', /галерея (\d+)\/18/, 'cover:gallery'],
  ['ROADMAP.md', /корпоративный B2B-футер (\d+)\/18/, 'cover:footer-corporate-b2b'],
  ['ROADMAP.md', /отзывы (\d+)\/18/, 'cover:testimonials'],
  // 83 % и пары тем — оба числа названы чеклистом приёмки поимённо.
  ['ROADMAP.md', /`14871:1319` на \*\*(\d+) %\*\*/, 'renderPercent'],
  ['ROADMAP.md', /на \*\*83 %\*\* \(([\d  ]+) из [\d  ]+ px\)/, 'renderCoveredPx'],
  ['ROADMAP.md', /на \*\*83 %\*\* \([\d  ]+ из ([\d  ]+) px\)/, 'renderNodeHeight'],
  ['ROADMAP.md', /\d+ измеренных CSS, (\d+) %, \d+ типов блоков/, 'renderPercent'],
  ['ROADMAP.md', /0 веб-форматов, (\d+) пар тем/, 'themePairs'],
  ['ROADMAP.md', /Пар «один макет в двух темах» — \*\*(\d+)\*\* из 22 узлов/, 'themePairs'],
  ['ROADMAP.md', /(\d+) пар из 22 узлов/, 'themePairs'],
  ['ROADMAP.md', /(\d+) % у `14871:1319`/, 'renderPercent'],
  // Строка шага R0-07 переписана самим шагом: «0 мобильных артбордов» ушло —
  // число ничем не измерялось (граница 4 evidence/coverage.md), — а привязка
  // осталась на том же месте и на том же числе.
  ['ROADMAP.md', /83 % у `14871:1319`, мобильные раскладки не установлены, (\d+) пар тем/, 'themePairs'],
  // --- Границы покрытия: реестр против самого файла и против прозы
  ['ROADMAP.md', /называет все (\d+) границ/, 'coverageLimits'],
  ['evidence/coverage.md', /Границ в файле\s+\*\*(\d+)\*\*/, 'coverageLimits'],
  ['README.md', /\(evidence\/coverage\.md\), \*\*(\d+) границ\*\*/, 'coverageLimits'],
  ['README.md', /coverage\.md — (\d+) границ покрытия/, 'coverageLimits'],
  ['BRIEF.md', /\*\*(\d+) границ\*\*: эти двенадцать/, 'coverageLimits'],
  ['tools/README.md', /(\d+) границ\s+покрытия/, 'coverageLimits'],
  ['tools/README.md', /(\d+) измеренных CSS/, 'measuredCss'],
  // Граница 16 называет число ключей семейства cover:* — по ключу на запись
  // реестра блоков. Оно и есть blockTypes: цикл заводит ключ на каждый блок
  // инвентаризации. Итог прогона («N утверждений в M файлах») в границе не
  // пишется — он меняется от собственных правок сторожа и ключом не берётся:
  // правило на это число само стало бы строкой прогона (находка 11 review-2).
  ['evidence/coverage.md', /ключ на каждый из \*\*(\d+) типов блоков\*\*/, 'blockTypes'],
  ['ROADMAP.md', /`14871:1319` просмотрен на (\d+) %/, 'renderPercent'],

  // --- BRIEF.md
  ['BRIEF.md', /— (\d+) узлов Figma `02_Landings` против корпуса/, 'landingNodes'],
  ['BRIEF.md', /— (\d+) бренд-доски `04_Brand`/, 'brandBoards'],
  ['BRIEF.md', /`04_Brand`, (\d+) баннера нового стиля/, 'banners'],
  ['BRIEF.md', /\| Hero как обязательный первый экран \| \*\*(\d+)\/18\*\* \|/, 'cover:hero'],
  ['BRIEF.md', /форма с полем ввода — \*\*(\d+)\/18\*\*/, 'cover:form'],
  ['BRIEF.md', /Открылись \*\*(\d+) узлов из \d+\*\*/, 'landingNodes'],
  ['BRIEF.md', /\| `nodes` \| (\d+) узлов лендингов/, 'landingNodes'],
  ['BRIEF.md', /\| `blocks` \| (\d+) типов блоков/, 'blockTypes'],
  ['BRIEF.md', /\| `elements` \| (\d+) примитив/, 'primitives'],
  ['BRIEF.md', /\| `patterns` \| (\d+) рецепта страниц/, 'patterns'],
  ['BRIEF.md', /\| `findings` \| (\d+) находок/, 'findings'],
  ['BRIEF.md', /\| `coverageLimits` \| (\d+) границ покрытия/, 'coverageLimits'],
  ['BRIEF.md', /\*\*(\d+) %\*\* — 12 000 из 14 462 px/, 'renderPercent'],
  ['BRIEF.md', /`14871:1319` просмотрен на (\d+) %/, 'renderPercent'],

  // --- CHANGELOG.md
  ['CHANGELOG.md', /— (\d+) записи: \d+ типов блоков/, 'registryTotal'],
  ['CHANGELOG.md', /— \d+ записи: (\d+) типов блоков/, 'blockTypes'],
  ['CHANGELOG.md', /Роадмап на (\d+) шагов/, 'roadmapSteps'],
  ['CHANGELOG.md', /на (\d+) % \(12 000 из 14 462 px\)/, 'renderPercent'],

  // --- Покрытие формы и бегущей строки. Разбор состава секций
  // (evidence/section-map.md) поменял оба: форма 11 → 14, бегущая строка
  // осталась 4, но состав другой. Числа стояли в семи местах прозой,
  // и сторожилось из них два — строка R2-06 в роадмапе и строка брифа.
  // Подмена 14 → 11 в GUIDE, в статьях блоков и в самой таблице разбора
  // проходила зелёной.
  ['GUIDE.md', /\| Форма с полем ввода \| (\d+)\/18 \|/, 'cover:form'],
  ['GUIDE.md', /\*\*Форма — (\d+)\/18\.\*\*/, 'cover:form'],
  ['GUIDE.md', /\| \*\*Бегущая строка\*\* \| (\d+)\/18 \|/, 'cover:marquee'],
  ['ROADMAP.md', /\| R2-06 \| \*\*Форма\*\* — (\d+) узлов/, 'cover:form'],
  ['BRIEF.md', /форма с полем ввода — \*\*(\d+)\/18\*\*/, 'cover:form'],
  ['tools/README.md', /`(\d+)\/18` форма/, 'cover:form'],
  ['docs/guide/composition.md', /форма — (\d+)\/18\.\*\*/, 'cover:form'],
  ['docs/guide/composition.md', /\+ 4 = \*\*(\d+)\/18\*\*/, 'cover:form'],
  ['docs/guide/composition.md', /\+ 1 = \*\*(\d+)\/18\*\*/, 'cover:marquee'],
  ['evidence/section-map.md', /### Форма: \d+\/18 → \*\*(\d+)\/18\*\*/, 'cover:form'],
  ['evidence/section-map.md', /\+ 4 = \*\*(\d+)\/18\*\*/, 'cover:form'],
  ['evidence/section-map.md', /### Бегущая строка: \d+\/18 → \*\*(\d+)\/18\*\*/, 'cover:marquee'],
  ['evidence/section-map.md', /\+ 1 = \*\*(\d+)\/18\*\*/, 'cover:marquee'],
  ['blocks/form-field.md', /уточнено до (\d+)\/18/, 'cover:form'],
  ['blocks/form-section.md', /уточнено до (\d+)\/18/, 'cover:form'],
  ['blocks/marquee.md', /\+ 1 = \*\*(\d+)\/18\*\*/, 'cover:marquee'],

  // --- Разбор состава секций: сколько узлов, стопок, членов и типов.
  // Числа стоят и в статье композиции, и в таблице разбора, и правятся
  // руками в обоих местах.
  ['docs/guide/composition.md', /\| — из них построены стопкой секций \| \*\*(\d+)\/18\*\*/, 'stacks'],
  ['docs/guide/composition.md', /\| Тип члена стопки установлен \| \*\*(\d+)\/168\*\* членов/, 'typedMembers'],
  ['evidence/section-map.md', /\| Из них построены стопкой секций \| \*\*(\d+)\/18\*\* \|/, 'stacks'],
  ['evidence/section-map.md', /\| Членов стопки всего \| \*\*(\d+)\*\* \|/, 'stackMembers'],
  ['evidence/section-map.md', /\| Тип установлен \| \*\*(\d+)\/168\*\* \|/, 'typedMembers'],
  ['evidence/section-map.md', /\| Тип не определён \| \*\*(\d+)\/168\*\* \|/, 'untypedMembers'],

  // --- Типографика: литералы, мобильные ступени, подстановки роли и пробел
  // ALS Hauss. Числа стоят в шести местах прозой — в гайде, в маркере шкалы
  // ui/tokens.css, в записи CHANGELOG и на трёх страницах витрины, — и до
  // находок 03-17 и 03-20 не сторожились нигде. Считаются они по CSS блоков,
  // а не по другому документу: иначе сторож сверял бы прозу с прозой.
  ['GUIDE.md', /Правил с такой пометкой \*\*(\d+)\*\*/, 'roleSubstitutions'],
  ['GUIDE.md', /Литеральных кеглей в `ui\/blocks\/` \*\*(\d+)\*\*/, 'literalFontSizes'],
  ['GUIDE.md', /Мобильных ступеней кегля в пакете \*\*(\d+)\*\*/, 'mobileFontSizes'],
  ['GUIDE.md', /\*\*Затронуто (\d+) правил\*\*/, 'alsHaussRules'],
  ['ui/tokens.css', /Литеральных кеглей в ui\/blocks\/ (\d+)/, 'literalFontSizes'],
  ['ui/tokens.css', /мобильную ступень из них имеет ровно (\d+)/, 'mobileFontSizes'],
  ['ui/tokens.css', /мобильную ступень имеет ровно\s+(\d+) блок из \d+/, 'mobileFontSizes'],
  ['ui/tokens.css', /мобильную ступень имеет ровно\s+\d+ блок из (\d+)/, 'literalFontSizes'],
  ['ui/blocks/core.css', /всего по пакету (\d+)/, 'alsHaussRules'],
  ['ui/blocks/core.css', /переопределены 3 из (\d+) затронутых/, 'alsHaussRules'],
  ['CHANGELOG.md', /Литеральных кеглей в `ui\/blocks\/` \*\*(\d+)\*\*/, 'literalFontSizes'],
  ['CHANGELOG.md', /мобильную ступень из них\n  имеет ровно \*\*(\d+)\*\*/, 'mobileFontSizes'],
  ['showcase/blocks.html', /Литеральных кеглей в <span class="doc-src">ui\/blocks\/<\/span> (\d+)/, 'literalFontSizes'],
  ['showcase/blocks.html', /мобильную ступень из них имеет ровно (\d+)/, 'mobileFontSizes'],
  ['showcase/core.html', /Затронуто (\d+) правил пакета/, 'alsHaussRules'],
  ['showcase/primitives.html', /Затронуто (\d+) правил пакета/, 'alsHaussRules'],
  ['evidence/coverage-notes.md', /\*\*Сколько правил затронуто — (\d+)\.\*\*/, 'alsHaussRules'],

  // --- README.md, продолжение: 83 % и пары тем
  ['README.md', /`14871:1319` — на \*\*(\d+) %\*\*/, 'renderPercent'],
  ['README.md', /`14871:1319` просмотрен на (\d+) %\*\*/, 'renderPercent'],
  ['README.md', /Пар «одна страница в двух темах» — (\d+) из 22 узлов/, 'themePairs'],
];

// -------------------------------------------------------------------------
// Инвентаризация против самой себя. Её собственные итоги написаны там же,
// где данные, и точно так же правятся руками.
// -------------------------------------------------------------------------
const selfChecks = [
  ['inventory.registryTotals.total', inventory.registryTotals.total, actual.registryTotal[0]],
  ['inventory.registryTotals.blocks', inventory.registryTotals.blocks, actual.blockTypes[0]],
  ['inventory.registryTotals.primitives', inventory.registryTotals.primitives, actual.primitives[0]],
  ['inventory.roadmapTotals.steps', inventory.roadmapTotals.steps, actual.roadmapSteps[0]],
  ['inventory.roadmapTotals.byWave.R0', inventory.roadmapTotals.byWave.R0, actual.roadmapR0[0]],
  ['inventory.findings.total', inventory.findings.total,
    ['landings', 'brand'].reduce((sum, side) => sum + ['p0', 'p1', 'p2']
      .reduce((inner, level) => inner + (inventory.findings[side][level]?.length ?? 0), 0), 0)],
];

// Реестр границ против самого evidence/coverage.md: длина coverageLimits
// должна равняться числу разделов файла. Пара сверяется структурой,
// а не прозой, поэтому стоит здесь, среди самопроверок.
if (coverageSections !== null) {
  selfChecks.push([
    'inventory.coverageLimits — длина против разделов evidence/coverage.md',
    inventory.coverageLimits.length,
    coverageSections,
  ]);
}

// Строка coverage у самого блока с длиной его же списка узлов. Сторож ловил
// расхождение документа с инвентаризацией, но не расхождение инвентаризации
// с самой собой: вычеркнутый узел оставлял «18/18» при 17 узлах, и ни одна
// строка об этом не говорила. Это источник, из которого R0-05 заполнит реестр.
for (const block of inventory.blocks) {
  const fraction = typeof block.coverage === 'string' ? block.coverage.match(/^(\d+)\/(\d+)$/) : null;
  if (!fraction) {
    selfChecks.push([`inventory.blocks[${block.id}].coverage — дробь вида 15/18`, block.coverage, `${block.nodes.length}/${block.coverageBase}`]);
    continue;
  }
  selfChecks.push([`inventory.blocks[${block.id}].coverage числитель`, Number(fraction[1]), block.nodes.length]);
  selfChecks.push([`inventory.blocks[${block.id}].coverageBase`, block.coverageBase, Number(fraction[2])]);
}

// Инвентаризация о самой себе: строка renderCovered несёт и пиксели,
// и процент, и они правятся одной рукой.
if (partialNode) {
  const statedPercent = partialNode.renderCovered?.match(/(\d+)\s*%/);
  selfChecks.push([
    `inventory.nodes[${partialNode.id}].renderCovered — процент`,
    statedPercent ? Number(statedPercent[1]) : partialNode.renderCovered,
    renderPercent,
  ]);
}

const problems = [];
const skipped = [];
const rows = [];

// Число в тексте пишется с разделителем разрядов: «12 000 из 14 462 px».
const asNumber = (text) => Number(String(text).replace(/[\s ]/g, ''));

for (const [file, re, key] of claims) {
  if (!exists(file)) { skipped.push(`${file} — файла ещё нет`); continue; }
  // Все вхождения, а не первое: одна и та же формулировка, повторённая
  // в файле дважды, сторожилась в одном месте из двух, и вторая копия
  // молча расходилась с первой.
  const all = [...read(file).matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`))];
  if (!all.length) {
    problems.push(`${file}: не найдено утверждение для «${key}» — правило проверки устарело (${re})`);
    continue;
  }
  const [value, source] = actual[key] ?? [];
  if (value === null || value === undefined) { skipped.push(`${file} → ${key} — считать пока не из чего`); continue; }
  for (const [order, match] of all.entries()) {
    const where = all.length > 1 ? `${file} (вхождение ${order + 1} из ${all.length})` : file;
    const stated = asNumber(match[1]);
    rows.push([where, key, stated, value, source]);
    if (stated !== value) problems.push(`${where}: заявлено ${stated}, на самом деле ${value} (${key} — ${source})`);
  }
}

for (const [what, stated, value] of selfChecks) {
  rows.push([inventoryFile, what, stated, value, 'пересчёт по самой инвентаризации']);
  if (stated !== value) problems.push(`${inventoryFile}: ${what} = ${stated}, пересчёт даёт ${value}`);
}

if (explain) {
  const width = Math.max(...rows.map(([file]) => file.length));
  console.log('Что где написано и чем измерено:\n');
  for (const [file, key, stated, value, source] of rows) {
    console.log(`  ${file.padEnd(width)}  ${key} = ${stated}  ${stated === value ? '==' : '!='} ${value}  ← ${source}`);
  }
  console.log('');
}

if (skipped.length) {
  console.warn(`Пропущено (${skipped.length}) — появится по мере сборки:`);
  for (const line of skipped) console.warn(`  ${line}`);
  console.warn('');
}

if (problems.length) {
  console.error(`Счётчики разошлись (${problems.length}):\n`);
  for (const line of problems) console.error(`  ${line}`);
  console.error('\nПравьте документацию — или правило в tools/validate-counts.mjs,');
  console.error('если изменилась формулировка. Инвариант И-7: числа не округляются.');
  process.exit(1);
}

console.log(`Проверено утверждений: ${rows.length} в ${new Set(rows.map(([file]) => file)).size} файлах. Все сходятся.`);
// Перечень измерений — под --explain, вместе с таблицей «что где написано».
// Зелёный прогон в чеклисте приёмки — одна строка: сорок строк значений
// на каждой из четырёх проверок приучают пролистывать вывод не читая.
if (explain) console.log(Object.entries(actual).map(([key, [value]]) => `  ${key}: ${value ?? '—'}`).join('\n'));
