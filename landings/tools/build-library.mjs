import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens, writeTokens } from "./build-tokens.mjs";
import { writeStyleProfile } from "./build-style-profile.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rows = [
  ["typography", "Типографика", "atom", "foundation", "typography/index.html"],
  ["colors", "Цвета", "atom", "foundation", "colors/index.html"],
  ["spacing", "Отступы", "atom", "foundation", "spacing/index.html"],
  ["radii", "Скругления", "atom", "foundation", "radii/index.html"],
  ["breakpoints", "Брейкпоинты", "atom", "foundation", "breakpoints/index.html"],
  ["button", "Кнопка", "element", "controls", "button/variants.html"],
  ["compact-action", "Компактное действие", "element", "controls", "compact-action/variants.html"],
  ["icon-action", "Иконочное действие", "element", "controls", "icon-action/variants.html"],
  ["form-field", "Текстовое поле", "element", "forms", "form-field/states.html"],
  ["textarea", "Многострочное поле", "element", "forms", "textarea/states.html"],
  ["select", "Селект", "element", "forms", "select/states.html"],
  ["checkbox", "Чекбокс", "element", "forms", "checkbox/states.html"],
  ["radio", "Радиокнопка", "element", "forms", "radio/states.html"],
  ["text-link", "Текстовая ссылка", "element", "navigation", "text-link/states.html"],
  ["card", "Контентная карточка", "organism", "content", "organisms/content-card/index.html"],
  ["metric-card", "Карточка метрики", "organism", "content", "organisms/metric-card/index.html"],
  ["offer-card", "Карточка предложения", "organism", "commerce", "organisms/offer-card/index.html"],
  ["contact-form", "Лид-форма", "organism", "forms", "organisms/lead-form/index.html"],
  ["subscription-form", "Форма подписки", "organism", "forms", "organisms/subscription-form/index.html"],
  ["accordion", "Аккордеон FAQ", "organism", "disclosure", "organisms/accordion/index.html"],
  ["case-card", "Карточка кейса", "organism", "content", "organisms/case-card/index.html"],
  ["site-header", "Шапка", "block", "navigation", "blocks/site-header/index.html"],
  ["hero", "Первый экран", "block", "marketing", "blocks/hero/index.html"],
  ["statement", "Смысловой акцент", "block", "marketing", "blocks/statement/index.html"],
  ["metrics-section", "Метрики", "block", "content", "blocks/metrics/index.html"],
  ["tasks-section", "Задачи", "block", "content", "blocks/tasks/index.html"],
  ["formats-section", "Форматы", "block", "content", "blocks/formats/index.html"],
  ["process-section", "Процесс", "block", "content", "blocks/process/index.html"],
  ["pricing-section", "Тарифы", "block", "commerce", "blocks/pricing/index.html"],
  ["lead-section", "Секция заявки", "block", "forms", "blocks/lead-section/index.html"],
  ["team-section", "Команда", "block", "content", "blocks/team/index.html"],
  ["partner-levels", "Уровни партнёрства", "block", "agency", "blocks/partner-levels/index.html"],
  ["testimonials", "Отзывы", "block", "social-proof", "blocks/testimonials/index.html"],
  ["faq", "FAQ", "block", "content", "blocks/faq/index.html"],
  ["card-grid", "Сетка портфолио", "block", "content", "blocks/portfolio-grid/index.html"],
  ["site-footer", "Подвал", "block", "navigation", "blocks/site-footer/index.html"],
  ["company-page", "О компании", "page", "company", "pages/company/index.html"],
  ["advertising-page", "Медийная реклама", "page", "company", "pages/advertising/index.html"],
  ["agency-page", "Партнёрская программа", "page", "company", "pages/agency/index.html"],
  ["career-special-page", "Спецпроекты Хабр Карьеры", "page", "company", "pages/career-special/index.html"],
  ["corporate-blogs-page", "Корпоративные блоги", "page", "company", "pages/corporate-blogs/index.html"],
  ["education-programs-page", "Образовательные программы", "page", "company", "pages/education-programs/index.html"],
  ["hello-startup-page", "Стартапам", "page", "company", "pages/hello-startup/index.html"],
  ["native-special-page", "Нативные спецпроекты", "page", "company", "pages/native-special/index.html"],
  ["newsletter-page", "Хабр для бизнеса", "page", "company", "pages/newsletter/index.html"],
  ["portfolio-page", "Портфолио спецпроектов", "page", "company", "pages/portfolio/index.html"],
  ["promo-page", "Тариф «Промо»", "page", "company", "pages/promo/index.html"]
];

rows.push(
  ["landing-hero", "Первый экран лендинга", "block", "marketing", "blocks/landing-hero/index.html"],
  ["section-heading", "Заголовок секции", "block", "content", "blocks/section-heading/index.html"],
  ["content-grid", "Контентная сетка", "block", "content", "blocks/content-grid/index.html"],
  ["metrics-section", "Секция метрик", "block", "content", "blocks/metrics-section/index.html"],
  ["contact-section", "Секция контактов", "block", "content", "blocks/contact-section/index.html"],
  ["project-card", "Карточка проекта", "organism", "content", "organisms/project-card/index.html"],
  ["feature-layout", "Feature-композиция", "block", "content", "blocks/feature-layout/index.html"],
  ["case-layout", "Case-композиция", "block", "content", "blocks/case-layout/index.html"],
  ["phase-stack", "Группа этапов", "block", "content", "blocks/phase-stack/index.html"],
  ["mosaic-grid", "Мозаичная сетка", "block", "content", "blocks/mosaic-grid/index.html"]
);

// The viewer is organised around working collections. Individual implementation
// specs remain in machine/specs, while close variants are reviewed together.
const groupedIds = new Set([
  "button", "compact-action", "icon-action", "form-field", "textarea", "select", "checkbox", "radio", "text-link",
  "card", "metric-card", "offer-card", "case-card", "project-card",
  "contact-form", "subscription-form", "lead-section",
  "site-header", "site-footer", "hero", "landing-hero", "statement",
  "section-heading", "content-grid", "metrics-section", "feature-layout", "case-layout", "phase-stack", "mosaic-grid",
  "tasks-section", "formats-section", "process-section", "team-section", "partner-levels", "testimonials", "faq", "card-grid", "pricing-section"
]);
const collectionRows = [
  ["buttons", "Кнопки", "element", "controls", "collections/buttons/index.html", "Основная · компактная · иконочная · текстовая ссылка"],
  ["input-fields", "Поля ввода", "element", "forms", "collections/input-fields/index.html", "Текстовое · многострочное"],
  ["choice-controls", "Выбор", "element", "forms", "collections/choice-controls/index.html", "Чекбокс · радиокнопка · селект"],
  ["cards", "Карточки", "organism", "content", "collections/cards/index.html", "19 Webflow-вариантов: контент · сервис · форматы · курсы · предложения · этапы · кейсы · проекты"],
  ["forms", "Формы", "block", "forms", "collections/forms/index.html", "Лид-форма · подписка · секция заявки"],
  ["navigation", "Навигация", "block", "navigation", "collections/navigation/index.html", "Шапка · подвал"],
  ["intro", "Первый экран", "block", "marketing", "collections/intro/index.html", "Hero · banner · statement"],
  ["content-layouts", "Контентные раскладки", "block", "content", "collections/content-layouts/index.html", "Заголовок · сетка · метрики · feature · case · этапы"],
  ["landing-content", "Контент лендинга", "block", "content", "collections/landing-content/index.html", "Задачи · форматы · процесс · команда · FAQ · тарифы"]
];

const collectionMembers = Object.freeze({
  buttons: ["button", "compact-action", "icon-action", "text-link"],
  "input-fields": ["form-field", "textarea"],
  "choice-controls": ["select", "checkbox", "radio"],
  cards: ["card", "metric-card", "offer-card", "case-card", "project-card"],
  forms: ["contact-form", "subscription-form", "lead-section"],
  navigation: ["site-header", "site-footer"],
  intro: ["hero", "landing-hero", "statement"],
  "content-layouts": ["section-heading", "content-grid", "metrics-section", "feature-layout", "case-layout", "phase-stack", "mosaic-grid"],
  "landing-content": ["tasks-section", "formats-section", "process-section", "team-section", "partner-levels", "testimonials", "faq", "card-grid", "pricing-section"]
});

const purposeById = Object.freeze({
  typography: "Шкала шрифта Inter для заголовков, основного и вспомогательного текста лендингов.",
  colors: "Семантические цвета темы лендинга: фон, поверхности, текст, действия и статусы.",
  spacing: "Базовая шкала отступов, внешние поля контейнера и вертикальный ритм секций.",
  radii: "Радиусы интерактивных элементов, полей и контентных карточек.",
  breakpoints: "Диапазоны адаптивной раскладки и изменения типографики и полей страницы.",
  buttons: "Группа действий: основная, компактная и иконочная кнопки, а также текстовая ссылка.",
  "input-fields": "Однострочное и многострочное поля с общей геометрией и состояниями ввода.",
  "choice-controls": "Элементы выбора: select, checkbox и radio с сопоставимыми состояниями.",
  cards: "Карточки для контента, метрик, предложений, кейсов и проектов.",
  forms: "Формы заявки и подписки, а также секция страницы, в которую они встраиваются.",
  navigation: "Навигационные границы страницы: шапка и подвал лендинга.",
  intro: "Варианты первого экрана и смыслового акцента в начале лендинга.",
  "content-layouts": "Переиспользуемые раскладки заголовков, сеток, метрик, кейсов и этапов.",
  "landing-content": "Содержательные секции лендинга: задачи, форматы, процесс, команда, отзывы, FAQ и тарифы."
});

function purposeFor(entity) {
  if (purposeById[entity.id]) return purposeById[entity.id];
  if (entity.kind === "page") return `Реконструкция страницы «${entity.title}» для проверки состава блоков и адаптивного поведения.`;
  if (entity.kind === "element") return `${entity.title}: самостоятельный элемент управления с зафиксированными состояниями.`;
  if (entity.kind === "organism") return `${entity.title}: составной компонент для повторного использования в блоках лендинга.`;
  return `${entity.title}: самостоятельный блок страницы с адаптивной раскладкой.`;
}

const tokens = buildTokens();
function visualFor(entity) {
  const base = tokens.base;
  const theme = tokens.themes.company;
  if (entity.id === "typography") return {
    family: { text: base["--hds-font-text"], heading: base["--hds-font-heading"] },
    weights: { medium: base["--hds-weight-medium"], semibold: base["--hds-weight-semibold"] },
    scale: Object.fromEntries(Object.entries(base).filter(([name]) => name.startsWith("--hds-text-"))),
    responsive: tokens.responsive
  };
  if (entity.id === "colors") return { theme: "company", roles: theme };
  if (entity.id === "spacing") return {
    scale: Object.fromEntries(Object.entries(base).filter(([name]) => name.startsWith("--hds-space-"))),
    pageGutter: base["--hds-page-gutter"], sectionSpace: base["--hds-section-space"], responsive: tokens.responsive
  };
  if (entity.id === "radii") return { control: base["--hds-radius-control"], field: base["--hds-radius-field"], card: base["--hds-radius-card"] };
  if (entity.id === "breakpoints") return { responsive: tokens.responsive };
  if (entity.id === "buttons") return {
    radius: base["--hds-radius-control"],
    font: base["--hds-font-text"],
    weight: base["--hds-weight-semibold"],
    colors: { action: theme["--hds-color-action"], hover: theme["--hds-color-action-hover"], focus: theme["--hds-color-focus"] },
    motion: { duration: base["--hds-duration"], easing: base["--hds-ease"] }
  };
  if (["button", "compact-action", "icon-action", "text-link"].includes(entity.id)) return {
    radius: base["--hds-radius-control"], font: base["--hds-font-text"], weight: base["--hds-weight-semibold"],
    colors: { action: theme["--hds-color-action"], hover: theme["--hds-color-action-hover"], focus: theme["--hds-color-focus"] }
  };
  if (["form-field", "textarea", "select"].includes(entity.id)) return {
    radius: base["--hds-radius-field"], paddingInline: base["--hds-field-padding-inline"], font: base["--hds-font-text"],
    colors: { surface: theme["--hds-color-control"], focus: theme["--hds-color-focus"], text: theme["--hds-color-text"] }
  };
  if (entity.id === "input-fields") return {
    radius: base["--hds-radius-field"], paddingInline: base["--hds-field-padding-inline"],
    colors: { surface: theme["--hds-color-control"], focus: theme["--hds-color-focus"], text: theme["--hds-color-text"] }
  };
  if (["checkbox", "radio"].includes(entity.id)) return {
    font: base["--hds-font-text"], colors: { control: theme["--hds-color-control"], action: theme["--hds-color-action"], focus: theme["--hds-color-focus"] }
  };
  if (entity.id === "choice-controls") return {
    fieldRadius: base["--hds-radius-field"], font: base["--hds-font-text"],
    colors: { control: theme["--hds-color-control"], action: theme["--hds-color-action"], focus: theme["--hds-color-focus"] }
  };
  if (entity.id === "intro") return {
    heading: { h1: base["--hds-text-h1"], h2: base["--hds-text-h2"], family: base["--hds-font-heading"] },
    layout: { container: base["--hds-container"], gutter: base["--hds-page-gutter"], sectionSpace: base["--hds-section-space"] },
    colors: { background: theme["--hds-color-bg"], text: theme["--hds-color-text"], accent: theme["--hds-color-link"] },
    responsive: tokens.responsive
  };
  return null;
}

// Navigation markers cover the meaningful changes made in the current v0.2 cycle.
const changeMarkers = Object.freeze({
  "subscription-form": "updated",
  "tasks-section": "updated",
  "process-section": "updated",
  "testimonials": "updated",
  "landing-hero": "new",
  "section-heading": "new",
  "content-grid": "new",
  "metrics-section": "updated",
  "contact-section": "new",
  "project-card": "new",
  "feature-layout": "new",
  "case-layout": "new",
  "phase-stack": "new",
  "mosaic-grid": "new"
});

const kindOrder = new Map(["atom", "element", "organism", "block", "page"].map((kind, index) => [kind, index]));
const rowToEntity = ([id, title, kind, category, pathName, summary]) => ({
  id, title, kind, category,
  maturity: kind === "atom" || kind === "element" ? "candidate" : "draft",
  spec: `specs/${id}.json`,
  example: `../examples/${pathName}`,
  ...(collectionMembers[id] ? { members: collectionMembers[id] } : {}),
  ...(summary ? { summary } : {}),
  ...(changeMarkers[id] ? { change: changeMarkers[id] } : {})
});
const visibleRows = [...rows.filter((row) => !groupedIds.has(row[0])), ...collectionRows]
  .sort((left, right) => kindOrder.get(left[2]) - kindOrder.get(right[2]));
const uniqueRows = [...new Map(visibleRows.map((row) => [row[0], row])).values()];
const entities = uniqueRows.map(rowToEntity);
const specEntities = [...new Map([...rows, ...collectionRows].map((row) => [row[0], row])).values()].map(rowToEntity);

await import("./build-standalone-examples.mjs");
await import("./build-faithful-pages.mjs");
await import("./build-collections.mjs");
writeTokens();
writeStyleProfile();

fs.writeFileSync(path.join(root, "machine", "catalog.json"), `${JSON.stringify({ version: "0.2.0", status: "in-development", taxonomy: ["atom", "element", "organism", "block", "page"], items: entities }, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(root, "viewer", "data.js"), `window.HDS_CATALOG = ${JSON.stringify(entities, null, 2)};\n`, "utf8");

for (const entity of specEntities) {
  const example = entity.example.replace(/^\.\.\//, "");
  const spec = {
    id: entity.id, title: entity.title, kind: entity.kind, category: entity.category, maturity: entity.maturity,
    knowledge: entity.kind === "atom" || entity.kind === "element" ? "snapshot" : "assumption",
    purpose: purposeFor(entity),
    ...(visualFor(entity) ? { visual: visualFor(entity) } : {}),
    ...(collectionMembers[entity.id] ? { members: collectionMembers[entity.id] } : {}),
    implementation: { css: ["ui/hds.css"], markup: example },
    states: entity.kind === "element" ? ["default", "hover", "focus", "filled", "disabled", "error-when-applicable"] : ["responsive"],
    examples: [example], evidence: ["local:../temp/from-webflow/index.html", "local:../temp/from-webflow/ru", "docs/source-audit.md"],
    unknowns: [entity.kind === "page" ? "Source-driven draft: состав блоков восстановлен, но точная визуальная сверка и часть исходных материалов ещё не завершены." : "Требуется дизайн-ревью перед переводом в stable."]
  };
  fs.writeFileSync(path.join(root, "machine", entity.spec), `${JSON.stringify(spec, null, 2)}\n`, "utf8");
}

const composition = JSON.parse(fs.readFileSync(path.join(root, "machine", "page-composition.json"), "utf8"));
const sourcePages = composition.pages.map((page) => ({ slug: page.slug, source: `temp/from-webflow/${page.source}`, reconstruction: `examples/pages/${page.slug}/index.html`, blocks: page.blocks }));
fs.writeFileSync(path.join(root, "machine", "source-pages.json"), `${JSON.stringify({ scope: "RU only", status: "source-driven-draft", count: sourcePages.length, pages: sourcePages }, null, 2)}\n`, "utf8");
console.log(`Built ${entities.length} catalog entities.`);
