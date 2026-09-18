import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { buildTokens } from "./tools/build-tokens.mjs";
import { buildStyleProfile } from "./tools/build-style-profile.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const errors = [];
const schema = readJson("machine/schema.json");
const catalog = readJson("machine/catalog.json");
const breakpoints = readJson("machine/breakpoints.json");
const validate = new Ajv2020({ allErrors: true }).compile(schema);

function resolveTypedReference(reference, owner) {
  if (typeof reference !== "string" || !reference.trim()) {
    errors.push(`${owner}: пустая ссылка`);
    return null;
  }
  if (/^https?:\/\//.test(reference)) return null;
  if (reference.startsWith("archive:")) return path.resolve(root, "..", "archive", reference.slice("archive:".length));
  if (reference.startsWith("local:")) return path.resolve(root, reference.slice("local:".length));
  return path.resolve(root, reference.split("#")[0]);
}

function requireReference(reference, owner) {
  const target = resolveTypedReference(reference, owner);
  if (target && !fs.existsSync(target)) errors.push(`${owner}: нет файла ${reference}`);
}

const largestBreakpoint = breakpoints.ranges.at(-1);
if (largestBreakpoint.id !== "large" || largestBreakpoint.min !== 1440 || largestBreakpoint.max !== null) {
  errors.push("Последний HDS-диапазон должен быть Large 1440+");
}

function validateSpec(spec, specName) {
  if (!validate(spec)) errors.push(`${specName}: ${JSON.stringify(validate.errors)}`);
  for (const example of spec.examples) requireReference(example, `${spec.id}/example`);
  for (const css of spec.implementation.css) requireReference(css, `${spec.id}/css`);
  requireReference(spec.implementation.markup, `${spec.id}/markup`);
  for (const evidence of spec.evidence) requireReference(evidence, `${spec.id}/evidence`);
}

for (const item of catalog.items) {
  const specPath = path.join(root, "machine", item.spec);
  if (!fs.existsSync(specPath)) { errors.push(`Нет спецификации: ${item.spec}`); continue; }
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  if (spec.id !== item.id) errors.push(`${item.spec}: id не совпадает с каталогом`);
}

const specIds = fs.readdirSync(path.join(root, "machine", "specs"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.slice(0, -5));
const catalogIds = new Set(catalog.items.map((item) => item.id));
const memberOwners = new Map();
for (const id of specIds) validateSpec(readJson(`machine/specs/${id}.json`), `specs/${id}.json`);
for (const item of catalog.items) {
  const spec = readJson(path.join("machine", item.spec));
  if (JSON.stringify(item.members || []) !== JSON.stringify(spec.members || [])) errors.push(`${item.id}: members расходятся между каталогом и spec`);
  for (const member of item.members || []) {
    if (catalogIds.has(member)) errors.push(`${item.id}: member ${member} уже является самостоятельной записью каталога`);
    if (memberOwners.has(member)) errors.push(`${member}: входит сразу в ${memberOwners.get(member)} и ${item.id}`);
    memberOwners.set(member, item.id);
  }
}
for (const id of specIds) {
  if (!catalogIds.has(id) && !memberOwners.has(id)) errors.push(`${id}: spec не представлен в каталоге и не входит в группу`);
}
for (const id of memberOwners.keys()) {
  if (!specIds.includes(id)) errors.push(`${id}: группа ссылается на отсутствующий spec`);
}

const tokens = readJson("machine/tokens.json");
if (JSON.stringify(tokens) !== JSON.stringify(buildTokens())) errors.push("machine/tokens.json расходится с CSS-источниками; запустите npm run build:tokens");
if (Object.keys(tokens.themes.company || {}).length < 10) errors.push("tokens: тема company потеряла семантические цвета");
const dimensionTokens = readJson("machine/dimension-tokens.json");
const dimensionTokenNames = new Set(Object.values(dimensionTokens.tokens)
  .flatMap((category) => Object.values(category).map((token) => token.cssVariable)));
function validateVisualTokenRefs(value, owner) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateVisualTokenRefs(item, `${owner}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  if (typeof value.token === "string" && value.token.startsWith("--landings-") && !dimensionTokenNames.has(value.token)) {
    errors.push(`${owner}: неизвестный размерный токен ${value.token}`);
  }
  for (const [key, nested] of Object.entries(value)) validateVisualTokenRefs(nested, `${owner}.${key}`);
}
for (const id of specIds) {
  const spec = readJson(`machine/specs/${id}.json`);
  if (!spec.visual || !Object.keys(spec.visual).length || JSON.stringify(spec.visual).includes("undefined")) {
    errors.push(`${id}: visual contract is missing or invalid`);
  }
  validateVisualTokenRefs(spec.visual, `${id}.visual`);
}
const styleProfile = readJson("machine/style-profile.json");
if (JSON.stringify(styleProfile) !== JSON.stringify(buildStyleProfile())) errors.push("machine/style-profile.json расходится с источниками");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "viewer/data.js"), "utf8"), sandbox);
const viewerItems = sandbox.window.HDS_CATALOG || [];
if (JSON.stringify(viewerItems.map(({id, example}) => ({id, example}))) !== JSON.stringify(catalog.items.map(({id, example}) => ({id, example})))) {
  errors.push("viewer/data.js расходится с machine/catalog.json");
}

const kinds = ["atom", "element", "organism", "block", "page"];
const catalogKinds = [...new Set(catalog.items.map((item) => item.kind))];
if (JSON.stringify(catalogKinds) !== JSON.stringify(kinds)) errors.push(`Неверный порядок разделов каталога: ${catalogKinds.join(", ")}`);
const standaloneItems = catalog.items.filter((item) => item.kind === "organism" || item.kind === "block");
if (standaloneItems.some((item) => item.example.includes("#"))) errors.push("Организмы и блоки должны иметь отдельные HTML-страницы без якорей");
if (new Set(standaloneItems.map((item) => item.example)).size !== standaloneItems.length) errors.push("У каждого организма и блока должна быть уникальная HTML-страница");
for (const item of standaloneItems) {
  const expectedGroup = item.kind === "organism" ? "/organisms/" : "/blocks/";
  const isCollection = item.example.includes("/collections/");
  if ((!isCollection && !item.example.includes(expectedGroup)) || !item.example.endsWith("/index.html")) errors.push(`${item.id}: неверный путь самостоятельного стенда ${item.example}`);
}
const sourcePages = readJson("machine/source-pages.json");
if (sourcePages.count !== 11 || sourcePages.pages.length !== 11) errors.push("В RU-аудите и библиотеке должно быть 11 страниц");
if (sourcePages.status !== "source-driven-draft") errors.push("Страницы должны быть честно помечены как source-driven-draft до полной визуальной сверки");
const expectedPageBlocks = { company: 6, advertising: 7, agency: 12, "career-special": 6, "corporate-blogs": 9, "education-programs": 6, "hello-startup": 4, "native-special": 6, newsletter: 6, portfolio: 3, promo: 8 };
const pageBlockMarkers = {
  "brand-strip": "hds-brand-strip",
  "case-layout": "hds-case-layout",
  "contact-section": "hds-contact-section",
  "content-grid": "hds-content-grid",
  "feature-layout": "hds-feature-layout",
  "landing-hero": "hds-landing-hero",
  "lead-section": "hds-lead-section",
  "metrics-section": "hds-metrics-section",
  "phase-stack": "hds-phase-stack",
  "portfolio-grid": "hds-portfolio-grid",
  "section-heading": "hds-section-heading",
  "subscription-form": "hds-subscription",
  testimonials: "hds-quote",
  faq: "hds-accordion",
};
const compositionSignatures = new Set();
for (const page of sourcePages.pages) {
  const reconstructionPath = path.join(root, page.reconstruction);
  if (!fs.existsSync(reconstructionPath)) {
    errors.push(`Нет реконструкции ${page.reconstruction}`);
  } else {
    const reconstruction = fs.readFileSync(reconstructionPath, "utf8");
    for (const block of new Set(page.blocks)) {
      const marker = pageBlockMarkers[block];
      if (!marker) errors.push(`${page.slug}: для блока ${block} не задан канонический component marker`);
      else if (!reconstruction.includes(marker)) errors.push(`${page.slug}: страница заявляет ${block}, но не использует компонент ${marker}`);
    }
    for (const marker of ["hds-header", "hds-footer"]) {
      if (!reconstruction.includes(marker)) errors.push(`${page.slug}: отсутствует общий компонент ${marker}`);
    }
  }
  if (!fs.existsSync(path.resolve(root, "..", page.source))) errors.push(`Нет Webflow-источника ${page.source}`);
  if (page.blocks.length !== expectedPageBlocks[page.slug]) errors.push(`${page.slug}: ожидается ${expectedPageBlocks[page.slug]} блоков по постраничной схеме, найдено ${page.blocks.length}`);
  compositionSignatures.add(page.blocks.join("|"));
}
if (compositionSignatures.size < 8) errors.push("Постраничные схемы слишком однообразны и снова похожи на общий шаблон");

for (const item of catalog.items.filter((candidate) => candidate.kind === "element")) {
  const html = fs.readFileSync(path.join(root, "machine", item.example.split("#")[0]), "utf8");
  if (!html.includes("demo-playground") || !html.includes("demo-states")) errors.push(`${item.id}: нужны интерактивный пример и матрица состояний`);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

for (const base of ["examples", "viewer", "showcase"]) {
  for (const file of walk(path.join(root, base)).filter((candidate) => candidate.endsWith(".html"))) {
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      if (/^(?:#|mailto:|tel:|data:|https?:)/.test(reference)) continue;
      const target = path.resolve(path.dirname(file), reference.split("#")[0]);
      if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)}: битая ссылка ${reference}`);
    }
  }
}

for (const base of ["ui", "examples", "viewer"]) {
  for (const file of walk(path.join(root, base)).filter((candidate) => /\.(?:html|css|js)$/.test(candidate) && !candidate.includes(`${path.sep}vendor${path.sep}`))) {
    const content = fs.readFileSync(file, "utf8");
    const externalUrls = content.match(/https?:\/\/[^\s"')]+/g) || [];
    const disallowed = externalUrls.filter((url) => !url.startsWith("https://fonts.googleapis.com/"));
    if (disallowed.length) errors.push(`${path.relative(root, file)}: внешний runtime URL запрещён (${disallowed.join(", ")})`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${catalog.items.length} сущностей, schema, примеры и относительные ссылки валидны.`);
