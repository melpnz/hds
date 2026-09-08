import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Измерение селекторов productionEvidence по снятому DOM десяти страниц.
// Настоящий браузер, JS выключен: querySelectorAll над тем же деревом, из
// которого пакет утверждает occurrences и seenOn.
//
// Инструмент только измеряет. Он пишет перепись в components/selector-census.json
// и не трогает components/manifest.json ни при каких флагах: сверку измеренного
// с заявленным делает другой запуск — node tools/validate-components.mjs.
//
// Так устроено намеренно. Прежний .pipeline/R0-05/check-selectors.mjs сверял
// found с occurrences и тем же прогоном записывал occurrences = found, отчего
// «сошлись 45 из 45» было гарантировано конструкцией и не могло поймать
// неверный селектор (review-2, note 11). Запись измеренного и сверка с
// записанным — разные операции, и расхождение между ними обязано быть
// видимым событием: строкой ошибки в гейте, а не молчаливым выравниванием.
//
//   node tools/measure-selectors.mjs          — перемерить и переписать перепись
//   node tools/measure-selectors.mjs --check  — перемерить и ничего не писать
//
// Код возврата: 0 — измерено и сошлось с манифестом; 1 — измерено, но
// разошлось (или селектор не измеряется); 2 — измерять нечем или не по чему.
// Расхождение печатается построчно и отмечается кодом в обоих режимах.
//
// Прежде код был 0 при любом расхождении: «мой код — про то, удалось ли
// измерить». Из-за этого --check не годился в гейт приёмки, куда его и
// предлагала внести долговая строка: подделка badge 87/7 → 8700/1 печатала
// « ! badge заявлено 8700/1 измерено 87/7» и выходила с нулём (review-3,
// major 3). Гейт судят по коду возврата, и гейт, который не может упасть, —
// это ложный зелёный, а не мягкое предупреждение.
//
// Принять новое измерение в манифест по-прежнему может только человек,
// правкой occurrences и seenOn руками: инструмент числа не выравнивает.

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(toolDir, "..");
const manifestPath = path.join(packageDir, "components/manifest.json");
const censusPath = path.join(packageDir, "components/selector-census.json");
const pagesDir = path.join(packageDir, "evidence/source/production/pages");

if (!fs.existsSync(manifestPath)) {
  console.error("Нет файла components/manifest.json — измерять нечего.");
  process.exit(2);
}
if (!fs.existsSync(pagesDir)) {
  console.error(`Нет снятых страниц (${path.relative(packageDir, pagesDir)}) — измерять не по чему.`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const pages = fs.readdirSync(pagesDir).filter((id) => fs.existsSync(path.join(pagesDir, id, "dom.html")));
if (!pages.length) {
  console.error("Ни одного dom.html в снятых страницах — измерять не по чему.");
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Не установлен playwright — измерение требует настоящего браузера.");
  console.error("  npm install  в папке пакета, затем повторить.");
  process.exit(2);
}

// Отпечаток разметки, по которой снято измерение. Перепись, снятая с другой
// разметки, — это не перепись этого пакета, и валидатор обязан это увидеть.
function fingerprint(page) {
  const bytes = fs.readFileSync(path.join(pagesDir, page, "dom.html"));
  return crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 16);
}

let browser;
try {
  browser = await chromium.launch({ channel: "msedge" });
} catch (error) {
  console.error(`Не удалось запустить браузер: ${error.message}`);
  process.exit(2);
}
const context = await browser.newContext({ javaScriptEnabled: false });
const page = await context.newPage();

const selectors = {};
const failures = [];
for (const component of manifest.components ?? []) {
  for (const evidence of component.productionEvidence ?? []) {
    const selector = evidence.selector;
    let total = 0;
    let error = null;
    const hitPages = [];
    for (const id of pages) {
      await page.goto("file:///" + path.join(pagesDir, id, "dom.html").replaceAll("\\", "/"));
      const count = await page.evaluate((value) => {
        try {
          return document.querySelectorAll(value).length;
        } catch (exception) {
          return `${exception.name}: ${exception.message}`;
        }
      }, selector);
      if (typeof count === "string") {
        error = count;
        break;
      }
      total += count;
      if (count > 0) hitPages.push(id);
    }
    if (error) failures.push(`${component.id}: селектор не разбирается браузером — ${error}`);
    selectors[component.id] ??= [];
    selectors[component.id].push(error ? { selector, error } : { selector, found: total, pages: hitPages });
  }
}
await browser.close();

const census = {
  measuredAt: new Date().toISOString().slice(0, 10),
  measuredBy: "tools/measure-selectors.mjs",
  environment: "chromium (channel msedge), javaScriptEnabled: false, file:// над evidence/source/production/pages/*/dom.html",
  note:
    "Перепись — измерение, а не утверждение пакета. Утверждает манифест (occurrences, seenOn); " +
    "сходятся ли они, говорит node tools/validate-components.mjs. Расхождение чинится разбором селектора " +
    "или явной правкой чисел в манифесте, но никогда не выравниванием одного по другому внутри одного прогона.",
  domFingerprint: Object.fromEntries(pages.map((id) => [id, fingerprint(id)])),
  selectors,
};

// Сверка с заявленным: печатается построчно и отмечается кодом возврата.
let mismatched = 0;
for (const component of manifest.components ?? []) {
  const rows = selectors[component.id];
  if (!rows) continue;
  const broken = rows.filter((row) => row.error);
  const found = rows.reduce((sum, row) => sum + (row.found ?? 0), 0);
  const foundPages = [...new Set(rows.flatMap((row) => row.pages ?? []))].sort();
  const declaredPages = [...(component.seenOn ?? [])].sort().join(",");
  const exact = !broken.length && found === component.occurrences && foundPages.join(",") === declaredPages;
  if (!exact) mismatched += 1;
  const mark = broken.length ? "ERR" : exact ? " = " : " ! ";
  console.log(
    `${mark} ${component.id.padEnd(22)} заявлено ${String(component.occurrences).padStart(4)}/${String((component.seenOn ?? []).length).padStart(2)}` +
      `  измерено ${String(broken.length ? "—" : found).padStart(4)}/${String(foundPages.length).padStart(2)}  ${broken[0]?.error ?? ""}`,
  );
}

console.log(
  `\nИзмерено селекторов ${Object.keys(selectors).length} по ${pages.length} страницам; ` +
    `расходятся с манифестом ${mismatched}.`,
);
if (mismatched) {
  console.log(
    "Расхождение не устраняется этим прогоном. Либо селектор адресует не тот узел — тогда чинится селектор,\n" +
      "либо измерение верно — тогда occurrences и seenOn правятся в манифесте руками, с записью причины.",
  );
  process.exitCode = 1;
}

if (process.argv.includes("--check")) {
  console.log(
    `\n--check: перепись не записана; расхождений с манифестом ${mismatched}, код возврата ${mismatched ? 1 : 0}.`,
  );
} else {
  fs.writeFileSync(censusPath, JSON.stringify(census, null, 2) + "\n");
  console.log(`\nПерепись записана: ${path.relative(packageDir, censusPath)}`);
}

if (failures.length) {
  console.error(`\nНе измерено (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
