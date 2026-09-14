import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const errors = [];
const schema = readJson("machine/schema.json");
const catalog = readJson("machine/catalog.json");
const breakpoints = readJson("machine/breakpoints.json");
const validate = new Ajv2020({ allErrors: true }).compile(schema);

const largestBreakpoint = breakpoints.ranges.at(-1);
if (largestBreakpoint.id !== "large" || largestBreakpoint.min !== 1440 || largestBreakpoint.max !== null) {
  errors.push("Последний HDS-диапазон должен быть Large 1440+");
}

for (const item of catalog.items) {
  const specPath = path.join(root, "machine", item.spec);
  if (!fs.existsSync(specPath)) { errors.push(`Нет спецификации: ${item.spec}`); continue; }
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  if (!validate(spec)) errors.push(`${item.spec}: ${JSON.stringify(validate.errors)}`);
  if (spec.id !== item.id) errors.push(`${item.spec}: id не совпадает с каталогом`);
  for (const example of spec.examples) if (!fs.existsSync(path.join(root, example.split("#")[0]))) errors.push(`${item.id}: нет примера ${example}`);
  for (const css of spec.implementation.css) if (!fs.existsSync(path.join(root, css))) errors.push(`${item.id}: нет CSS ${css}`);
}

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
const compositionSignatures = new Set();
for (const page of sourcePages.pages) {
  if (!fs.existsSync(path.join(root, page.reconstruction))) errors.push(`Нет реконструкции ${page.reconstruction}`);
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
