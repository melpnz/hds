/**
 * Разовая сборка `components/manifest.json` из `.pipeline/inventory.json` — шаг R0-05.
 *
 * Зачем скриптом, а не руками. 55 записей × 15 полей — это 800 значений,
 * перенесённых из инвентаризации. Руками такой перенос делается с ошибками,
 * которые потом невозможно отличить от решения. Скрипт переносит факты
 * (id, имя, категория, вид, зависимости, источники, заметки) механически,
 * а всё, чего в инвентаризации нет, задаётся здесь таблицами — и видно,
 * что именно добавлено на этом шаге и почему.
 *
 * Дальше манифест ведётся руками: каждый шаг R2–R5 правит свою запись.
 * Скрипт остаётся протоколом происхождения, а не инструментом пакета,
 * поэтому лежит в `.pipeline/`, а не в `tools/`.
 *
 * Запуск: node .pipeline/R0-05/build-manifest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const inventory = JSON.parse(
  fs.readFileSync(path.join(packageDir, ".pipeline", "inventory.json"), "utf8"),
);

const FIGMA_LIBRARY = { fileKey: "KG36iTkwvKDmrw8XQhk7d6", fileName: "education-lib" };
const FIGMA_LAYOUT = { fileKey: "oNyNRRob2y0ZSgPHOdH65X", fileName: "02_Education-NEW" };

// ---------------------------------------------------------------------------
// Таблица 1. Шаг роадмапа. Перенесена из ROADMAP.md (R2-01…R5-14), сверяется
// на каждый прогон: 55 элементов — 55 шагов, без пропусков и повторов.
// ---------------------------------------------------------------------------
const step = {
  "sprite-icon": "R2-01", "social-icon": "R2-02", "project-icon": "R2-03",
  avatar: "R2-04", "entity-logo": "R2-05", chip: "R2-06", badge: "R2-07",
  "rating-badge": "R2-08", "meta-pill": "R2-09", "counter-pill": "R2-10",
  "avatar-stack": "R2-11", prose: "R2-12",

  button: "R3-01", "icon-button": "R3-02", link: "R3-03", "filter-chip": "R3-04",
  "segmented-control": "R3-05", select: "R3-06", "multi-select": "R3-07",
  "search-input": "R3-08", "text-input": "R3-09", checkbox: "R3-10",
  switch: "R3-11", "tile-filter": "R3-12", tab: "R3-13", pagination: "R3-14",
  breadcrumbs: "R3-15",

  "site-header": "R4-01", "header-dropdown": "R4-02", "rubrication-bar": "R4-03",
  "site-footer": "R4-04", "page-hero": "R4-05", "search-form": "R4-06",
  section: "R4-07", "card-grid": "R4-08", carousel: "R4-09", "link-grid": "R4-10",
  "filter-bar": "R4-11", "filter-modal": "R4-12", "catalog-menu": "R4-13",
  "empty-state": "R4-14",

  "course-card": "R5-01", "school-card": "R5-02", "promo-card": "R5-03",
  "review-card": "R5-04", "article-card": "R5-05", "person-card": "R5-06",
  "step-card": "R5-07", "rating-table": "R5-08", "numbered-course-item": "R5-09",
  "entity-header": "R5-10", "person-header": "R5-11", "info-table": "R5-12",
  "ad-card": "R5-13", "ad-slot": "R5-14",
};

// ---------------------------------------------------------------------------
// Таблица 2. Имена компонентов Storybook. Взяты из
// `_sources/courses/inventory.json` → `components` (18 заголовков вида
// «common/BaseFilter»), сопоставлены с элементами по story id, записанным
// в источниках инвентаризации. Каноническими эти имена не являются
// (METHOD §5): имя даётся по смыслу в интерфейсе.
// ---------------------------------------------------------------------------
const storybookNames = {
  "sprite-icon": ["SpriteIcon"],
  "social-icon": ["SocialIcon"],
  "project-icon": ["ProjectIcon"],
  button: ["BaseButton"],
  "filter-chip": ["BaseFilter"],
  select: ["BaseCustomSelect"],
  "multi-select": ["MultiSelect"],
  checkbox: ["BaseCheckbox"],
  switch: ["BaseSwitch"],
  "tile-filter": ["BaseFilterWithImage"],
  section: ["BaseSection"],
  "header-dropdown": ["HeaderDropdown", "HeaderSection"],
  "filter-modal": ["BaseFilterModalNew", "BaseFilterModal"],
};

// Имя реализации попадает в legacyAliases, когда оно не совпадает
// с каноническим: по нему элемент ищут, но называть его так нельзя.
// Совпадающие имена (MultiSelect, SpriteIcon, SocialIcon, ProjectIcon,
// HeaderDropdown) в алиасы не идут — иначе имя столкнётся само с собой.
const legacyAliases = Object.fromEntries(
  Object.entries(storybookNames).map(([id, names]) => [id, names]),
);

// ---------------------------------------------------------------------------
// Таблица 3. Где элемент найден на инвентаризации (`sourceScope`).
// Значение по умолчанию — production. Здесь перечислены только те десять,
// которых в снятой разметке десяти страниц нет; выбор между storybook-only
// и figma-only — по иерархии источников METHOD §3: поведение и API Storybook
// выше визуального наблюдения из Figma.
// ---------------------------------------------------------------------------
const sourceScope = {
  tab: "figma-only",
  "text-input": "figma-only",
  pagination: "figma-only",
  "catalog-menu": "figma-only",
  "empty-state": "figma-only",
  "multi-select": "storybook-only",
  checkbox: "storybook-only",
  switch: "storybook-only",
  "tile-filter": "storybook-only",
  "filter-modal": "storybook-only",
};

// ---------------------------------------------------------------------------
// Таблица 4. Имя узла Figma там, где инвентаризация его записала.
// Ключ — id элемента и порядковый номер источника figma среди источников
// figma этой записи (0-based).
// `layerName: null` означает, что имя слоя не снято: узел адресуется
// только node id или componentKey. Выдумывать имя слоя нельзя (METHOD §3).
// ---------------------------------------------------------------------------
const figmaLayerNames = {
  "sprite-icon:0": "icon/*",
  "social-icon:0": "Logo brand/*",
  "avatar:0": "avatar/user",
  "entity-logo:0": "avatar/school",
  "chip:0": "tag/text/*",
  "badge:0": "tag/color/*",
  "button:0": "button/M/main",
  "icon-button:0": "elements/button/icon",
  "link:0": "color style/font/link",
  "filter-chip:0": "tab / tab-panel",
  "segmented-control:0": "button group / onheader",
  "tab:0": "tab + tab-panel/2-lvl",
  "select:0": "dropdown/select",
  "text-input:0": "elements/input/*",
  "checkbox:0": "elements/control",
  "pagination:0": "pagination",
  "site-header:0": "header/courses",
  "filter-modal:0": "modal-filter",
  "empty-state:0": "Empty block",
  "empty-state:2": "no_content/*",
  "article-card:0": "Статья",
  "person-card:0": "карточка эксперта",
  "rating-table:0": "Строка (рейтинг)",
};

// ---------------------------------------------------------------------------
// Таблица 5. Конфликты источников BRIEF §5, привязанные к элементу.
// Шесть конфликтов брифа: три из них решаются на уровне элемента, три
// (`--line-height-h2`, шкала H3, брейкпоинты) — на уровне foundations
// и правил, и здесь не повторяются.
// ---------------------------------------------------------------------------
const sourceConflicts = {
  "filter-chip": [
    {
      ref: "BRIEF §5, конфликт 1",
      summary:
        "выбранное состояние: прод bg #2c2e34 + белый текст; Figma и токены --color-chip-inactive #ebf3ff / --color-chip-press #b8d5ff описывают синее. Решать по METHOD §3, расхождение — в «Ограничения»",
    },
  ],
  "site-header": [
    {
      ref: "BRIEF §5, конфликт 2",
      summary:
        "--header-height: прод 64, сборка Storybook 112 (мобильный 144) — расхождение сборок",
    },
  ],
  button: [
    {
      ref: "BRIEF §5, конфликт 4",
      summary:
        "padding размеров L и XL: прод 16/8 и 24/12; Figma elements/button/ 20/12 и 24/16",
    },
  ],
};

// ---------------------------------------------------------------------------
// Таблица 6. Реализации, когда их больше одной. Решение пользователя
// BRIEF §9 п. 5: актуальна BaseFilterModalNew; BaseFilterModal — legacy-only
// и отдельной спецификации не получает.
// ---------------------------------------------------------------------------
const implementations = {
  "filter-modal": [
    {
      storybookName: "BaseFilterModalNew",
      status: "current",
      story: "common-basefiltermodalnew--default",
      decision: "BRIEF §9 п. 5 — актуальная реализация, её и описывает спецификация",
    },
    {
      storybookName: "BaseFilterModal",
      status: "legacy-only",
      story: "common-basefiltermodal--default",
      specPath: null,
      decision:
        "BRIEF §9 п. 5 — уходит в legacyAliases, отдельной спецификации не получает",
    },
  ],
};

// Источники, найденные на этом шаге сверх инвентаризации. Помечаются
// в note, чтобы их было видно как добавленные на R0-05, а не снятые
// на инвентаризации.
const addStorybookEvidence = {
  "header-dropdown": [
    {
      story: "header-headersection--header-section-story",
      file: "_sources/courses/rendered/header-headersection--header-section-story.html",
      renders: true,
      note: "секция панели, снята пустой. Добавлено на R0-05 из _sources/courses/inventory.json — инвентаризация эту story не записала",
    },
  ],
};

// Заметки шага там, где инвентаризация оставила неоднозначность.
const buildNotes = {
  "header-dropdown":
    "Storybook-компонент HeaderSection отнесён сюда как секция панели: снятая разметка — строка .border-b.py-2 внутри той же группы header/, панель и секция перечислены в BRIEF §2 одним списком закрытых оверлеев. Сопоставление сделано на R0-05 и подтверждается или отменяется на R4-02.",
  tab: "componentKey 9668fb89… указан инвентаризацией и у FilterChip, и у Tab. Один ключ на два элемента — либо это один component set, либо ошибка переноса; развести на R3-04 и R3-13.",
  "filter-chip":
    "componentKey 9668fb89… указан инвентаризацией и у FilterChip, и у Tab — см. запись tab.",
};

// ---------------------------------------------------------------------------

function figmaEvidence(element) {
  const out = [];
  let ordinal = 0;
  for (const source of element.sources) {
    if (source.type !== "figma") continue;
    const layerName = figmaLayerNames[`${element.id}:${ordinal}`] ?? null;
    ordinal += 1;
    const both = Boolean(source.node && source.componentKey);

    // Node id принадлежит макету: библиотека через MCP постранично
    // не читается, node id её узлов недоступны (BRIEF §2).
    if (source.node) {
      // Если источник записан и ключом компонента, и узлом макета, снятое
      // имя относится к компоненту библиотеки; узлу макета имя не приписываем.
      const nodeLayerName = both ? null : layerName;
      out.push({
        ...FIGMA_LAYOUT,
        sourceName: nodeLayerName ?? source.node,
        layerName: nodeLayerName,
        nodeId: source.node,
        componentKey: null,
        url: source.url ?? null,
        note: source.note ?? null,
      });
    }
    if (source.componentKey || !source.node) {
      out.push({
        ...FIGMA_LIBRARY,
        sourceName: layerName ?? source.componentKey ?? "имя не снято",
        layerName,
        nodeId: null,
        componentKey: source.componentKey ?? null,
        url: null,
        note: source.note ?? null,
      });
    }
  }
  return out;
}

function productionEvidence(element) {
  return element.sources
    .filter((source) => source.type === "production")
    .map((source) => ({
      url: source.url,
      selector: source.selector,
      note: source.note ?? null,
    }));
}

function storybookEvidence(element) {
  return [
    ...element.sources
      .filter((source) => source.type === "storybook")
      .map((source) => ({
        story: source.story,
        file: source.file ?? null,
        renders: source.readable === false ? false : true,
        note: source.note ?? source.reason ?? null,
      })),
    ...(addStorybookEvidence[element.id] ?? []),
  ];
}

const components = inventory.elements.map((element) => {
  const names = storybookNames[element.id] ?? [];
  const aliases = (legacyAliases[element.id] ?? []).filter(
    (name) => name !== element.canonicalName,
  );
  const record = {
    id: element.id,
    canonicalName: element.canonicalName,
    storybookNames: names,
    legacyAliases: aliases,
    category: element.category,
    kind: element.kind,
    specPath: null,
    cssRoots: [],
    showcaseAnchor: null,
    figmaEvidence: figmaEvidence(element),
    status: "planned",
    requiredStates: [],

    sourceScope: sourceScope[element.id] ?? "production",
    wave: element.wave,
    step: step[element.id],
    dependsOn: element.dependsOn,
    occurrences: element.occurrences,
    seenOn: element.seenOn,
    productionEvidence: productionEvidence(element),
    storybookEvidence: storybookEvidence(element),
    notes: element.notes ?? null,
  };
  if (implementations[element.id]) record.implementations = implementations[element.id];
  if (sourceConflicts[element.id]) record.sourceConflicts = sourceConflicts[element.id];
  if (buildNotes[element.id]) record.buildNotes = buildNotes[element.id];
  return record;
});

// Сверки, которые обязаны сойтись на сборке, — иначе таблицы разъехались
// с инвентаризацией и манифест писать не из чего.
const problems = [];
const steps = new Set();
for (const record of components) {
  if (!record.step) problems.push(`${record.id}: не найден шаг роадмапа`);
  else if (steps.has(record.step)) problems.push(`${record.id}: шаг ${record.step} уже занят`);
  steps.add(record.step);
}
const ids = new Set(components.map((c) => c.id));
for (const record of components) {
  for (const dependency of record.dependsOn) {
    if (!ids.has(dependency)) problems.push(`${record.id}: зависимость ${dependency} не в реестре`);
  }
}
for (const id of Object.keys(sourceScope)) {
  if (!ids.has(id)) problems.push(`sourceScope: ${id} не в реестре`);
}
if (problems.length) {
  console.error("Сборка манифеста не сошлась:");
  for (const problem of problems) console.error("  " + problem);
  process.exit(1);
}

const manifest = {
  schemaVersion: 1,
  scope: "courses-component-library",
  product: inventory.productTitle,
  productKind: inventory.kind,
  generatedAt: "2026-09-08",
  generatedBy: ".pipeline/R0-05/build-manifest.mjs",
  generatedFrom: ".pipeline/inventory.json",
  maintenance:
    "Собран один раз на R0-05 из инвентаризации; дальше ведётся руками — свою запись правит шаг, который верстает элемент.",

  sourcePolicy:
    "Семантика HTML и поведение в продакшене > публичный API Storybook > CSS и токены реализации > визуальное наблюдение Figma > имена слоёв Figma (METHOD §3)",
  coverage:
    "Публичная часть Курсов, снятая гостем на 10 страницах (BRIEF §4). Канон брейкпоинтов пакета — 320 / 744 / 1024 (Figma); прод реализован на 480 / 768 / 1024, расхождение фиксируется, а не приводится к канону (BRIEF §9).",
  accessibilityPolicy:
    "Доступность фиксируется как есть (BRIEF §9 п. 4). В снятой разметке десяти страниц только aria-hidden (31) и aria-current (4); ни одного role, form, label, select. ARIA не дописывается — отсутствие идёт в «Ограничения» спецификации.",

  sources: {
    production: {
      host: inventory.sources.production.host,
      access: inventory.sources.production.access,
      pagesCaptured: inventory.sources.production.pagesCaptured,
      evidence: inventory.sources.production.evidence,
    },
    figma: {
      library: {
        ...FIGMA_LIBRARY,
        url: inventory.sources.figma.library.url,
        readable: inventory.sources.figma.library.readable,
        note: inventory.sources.figma.library.note,
      },
      layout: {
        ...FIGMA_LAYOUT,
        url: inventory.sources.figma.layout.url,
        readable: inventory.sources.figma.layout.readable,
        breakpoints: inventory.sources.figma.layout.breakpoints,
        note: inventory.sources.figma.layout.note,
      },
    },
    storybook: {
      path: inventory.sources.storybook.path,
      readOnly: true,
      components: inventory.sources.storybook.components,
      stories: inventory.sources.storybook.stories,
      broken: inventory.sources.storybook.broken,
    },
  },

  conventions: {
    id: "kebab-case от канонического имени",
    canonicalName: "PascalCase, по смыслу в интерфейсе (METHOD §5)",
    specPath: "<category>/<id>.md — от папки components/",
    showcaseAnchor: "c-<id> — id секции в showcase/components.html",
    cssFile: "ui/components/<category>.css — имя файла равно значению category",
    cssRoot:
      "Собственный класс продукта, если он есть (style-ugc, rubrication-header, svg-icon). Если элемент собран утилитами Tailwind и своего класса не имеет, пакет вводит корневой класс crs-<id> и помечает его в спецификации как новую реализацию имени (METHOD §4): в продукте такого класса нет. Решение принято на R0-05, подтверждается или отменяется на R2-01 — менять его нужно здесь, а не в 55 спецификациях.",
  },

  allowedCategories: {
    actions: "ui/components/actions.css",
    collections: "ui/components/collections.css",
    "data-display": "ui/components/data-display.css",
    entities: "ui/components/entities.css",
    feedback: "ui/components/feedback.css",
    forms: "ui/components/forms.css",
    "frame-modules": "ui/components/frame-modules.css",
    layout: "ui/components/layout.css",
    navigation: "ui/components/navigation.css",
    overlays: "ui/components/overlays.css",
  },
  allowedKinds: ["primitive", "component", "module", "adapter"],

  allowedStatuses: ["complete", "partial", "planned", "legacy-only", "figma-only", "storybook-only"],
  statusDefinitions: {
    planned: "спецификации нет; specPath, showcaseAnchor — null, cssRoots пуст",
    partial: "спецификация есть, обязательные состояния покрыты не все — непокрытые названы",
    complete: "спецификация есть, обязательные состояния покрыты",
    "figma-only": "спецификация есть; в продакшене элемент не найден, описан по макету",
    "storybook-only": "спецификация есть; в продакшене элемент не найден, описан по Storybook",
    "legacy-only": "устаревшая реализация; отдельной спецификации не получает",
  },
  statusRule:
    "status — состояние записи в конвейере, sourceScope — где элемент найден. Пока спецификации нет, статус planned у всех записей, включая те, чей sourceScope не production: обратное означало бы, что пакет уже описал элемент. При написании спецификации запись со sourceScope figma-only получает статус figma-only, storybook-only — storybook-only, production — complete или partial.",

  allowedSourceScopes: {
    production: "найден в снятой разметке продакшена",
    "storybook-only": "в снятой разметке продакшена не найден; описывается по Storybook",
    "figma-only": "в снятой разметке продакшена не найден; описывается по макету Figma",
  },

  allowedStates: [
    "default", "hover", "focus-visible", "pressed", "selected", "current",
    "checked", "indeterminate", "expanded", "collapsed", "open", "closed",
    "disabled", "readOnly", "loading", "invalid", "error", "success",
    "empty", "dragActive",
  ],
  forbiddenStateNames: ["active", "focus", "select", "inactive"],
  requiredStatesMatrix: {
    status: "pending",
    step: "R1-01",
    note: "Матрица обязательных состояний по видам заводится в components/STATES.md на шаге R1-01. До неё requiredStates пуст у всех записей — это не «состояний нет», а «матрицы ещё нет».",
  },

  components,
};

const target = path.join(packageDir, "components", "manifest.json");
fs.writeFileSync(target, JSON.stringify(manifest, null, 2) + "\n", "utf8");

const scopes = {};
for (const record of components) scopes[record.sourceScope] = (scopes[record.sourceScope] ?? 0) + 1;
console.log(`Записей: ${components.length}`);
console.log(`sourceScope: ${JSON.stringify(scopes)}`);
console.log(`Записан ${path.relative(packageDir, target)}`);
