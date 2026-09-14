import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const visibleRows = [...rows.filter((row) => !groupedIds.has(row[0])), ...collectionRows]
  .sort((left, right) => kindOrder.get(left[2]) - kindOrder.get(right[2]));
const uniqueRows = [...new Map(visibleRows.map((row) => [row[0], row])).values()];
const entities = uniqueRows.map(([id, title, kind, category, pathName, summary]) => ({
  id, title, kind, category,
  maturity: kind === "atom" || kind === "element" ? "candidate" : "draft",
  spec: `specs/${id}.json`,
  example: `../examples/${pathName}`,
  ...(summary ? { summary } : {}),
  ...(changeMarkers[id] ? { change: changeMarkers[id] } : {})
}));

await import("./build-standalone-examples.mjs");
await import("./build-faithful-pages.mjs");
await import("./build-collections.mjs");

fs.writeFileSync(path.join(root, "machine", "catalog.json"), `${JSON.stringify({ version: "0.2.0", status: "in-development", taxonomy: ["atom", "element", "organism", "block", "page"], items: entities }, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(root, "viewer", "data.js"), `window.HDS_CATALOG = ${JSON.stringify(entities, null, 2)};\n`, "utf8");

for (const entity of entities) {
  const example = entity.example.replace(/^\.\.\//, "");
  const spec = {
    id: entity.id, title: entity.title, kind: entity.kind, category: entity.category, maturity: entity.maturity,
    knowledge: entity.kind === "atom" || entity.kind === "element" ? "snapshot" : "assumption",
    purpose: `${entity.title}: переиспользуемая сущность общей архитектуры лендингов.`,
    implementation: { css: ["ui/hds.css"], markup: example },
    states: entity.kind === "element" ? ["default", "hover", "focus", "filled", "disabled", "error-when-applicable"] : ["responsive"],
    examples: [example], evidence: ["temp/from-webflow/index.html", "temp/from-webflow/ru", "docs/source-audit.md"],
    unknowns: [entity.kind === "page" ? "Source-driven draft: состав блоков восстановлен, но точная визуальная сверка и часть исходных материалов ещё не завершены." : "Требуется дизайн-ревью перед переводом в stable."]
  };
  fs.writeFileSync(path.join(root, "machine", entity.spec), `${JSON.stringify(spec, null, 2)}\n`, "utf8");
}

const composition = JSON.parse(fs.readFileSync(path.join(root, "machine", "page-composition.json"), "utf8"));
const sourcePages = composition.pages.map((page) => ({ slug: page.slug, source: `temp/from-webflow/${page.source}`, reconstruction: `examples/pages/${page.slug}/index.html`, blocks: page.blocks }));
fs.writeFileSync(path.join(root, "machine", "source-pages.json"), `${JSON.stringify({ scope: "RU only", status: "source-driven-draft", count: sourcePages.length, pages: sourcePages }, null, 2)}\n`, "utf8");
console.log(`Built ${entities.length} catalog entities.`);
