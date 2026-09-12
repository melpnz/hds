// Гейт машинной проекции: machine/*.json против источников (шаг R8-03).
//
// Падает, если:
//   1. id есть в JSON и нет в markdown или наоборот (правила, решения, записи);
//   2. токен проекции не объявлен в ui/tokens.css или значение разошлось;
//   3. правило ссылается на несуществующий якорь витрины или страницу;
//   4. разметка записи (markup) не отрисовывается на пустой странице
//      с одним ui/courses.css;
//   5. предикат правила не выполняется на собранной странице витрины.
//
// Предикаты с типом manual не проверяются машиной и печатаются отдельным
// списком: правило без исполнимого предиката — честный факт, а не дефект.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(pkg, p), "utf8");
const readJson = (p) => JSON.parse(read(p));
const errors = [];
const manual = [];
const stats = { rules: 0, checked: 0, components: 0, markup: 0, tokens: 0 };
const fail = (where, what) => errors.push(`${where} — ${what}`);

const index = readJson("machine/index.json");
const tokens = readJson("machine/tokens.json");
const components = readJson("machine/components.json");
const rules = readJson("machine/rules.json");
const patterns = readJson("machine/patterns.json");
const content = readJson("machine/content.json");
const composition = read("docs/guide/composition.md");
const decisions = read("docs/guide/decisions.md");
const manifest = readJson("components/manifest.json").components;
const pagesHtml = read("showcase/pages.html");
const componentsHtml = read("showcase/components.html");

// 1. Паритет id -----------------------------------------------------------
{
  const mdRules = new Set([...composition.matchAll(/^\|\s*\*\*([A-Z]+-[0-9a-z]+)\*\*/gm)].map((m) => m[1]));
  const mdDg = new Set([...decisions.matchAll(/^### (DG-\d+)/gm)].map((m) => m[1]));
  for (const r of rules) {
    stats.rules++;
    const src = r.kind === "rule" ? mdRules : mdDg;
    if (!src.has(r.id)) fail(`rules.json ${r.id}`, "в markdown такого id нет");
  }
  const jsonIds = new Set(rules.map((r) => r.id));
  for (const id of [...mdRules, ...mdDg]) if (!jsonIds.has(id)) fail(`markdown ${id}`, "в machine/rules.json такого id нет");

  const manIds = new Set(manifest.map((r) => r.id));
  for (const c of components) {
    stats.components++;
    if (!manIds.has(c.id)) fail(`components.json ${c.id}`, "в manifest.json такой записи нет");
    if (!fs.existsSync(path.join(pkg, c.spec))) fail(`components.json ${c.id}`, `спецификации ${c.spec} нет`);
    for (const rid of c.rules) if (!jsonIds.has(rid)) fail(`components.json ${c.id}`, `ссылается на правило ${rid}, которого нет`);
  }
  for (const id of manIds) if (!components.some((c) => c.id === id)) fail(`manifest ${id}`, "в machine/components.json такой записи нет");

  for (const p of patterns) {
    if (!fs.existsSync(path.join(pkg, p.spec))) fail(`patterns.json ${p.id}`, `страницы ${p.spec} нет`);
    if (!fs.existsSync(path.join(pkg, p.standalone))) fail(`patterns.json ${p.id}`, `собранной страницы ${p.standalone} нет`);
    for (const rid of p.rules || []) if (!jsonIds.has(rid)) fail(`patterns.json ${p.id}`, `ссылается на правило ${rid}, которого нет`);
  }
  for (const f of Object.values(index.files)) if (!fs.existsSync(path.join(pkg, f))) fail("index.json", `файла ${f} нет`);
  for (const d of index.humanDocs) if (!fs.existsSync(path.join(pkg, d))) fail("index.json", `документа ${d} нет`);
}

// 2. Токены ---------------------------------------------------------------
{
  // Комментарии снимаются: в разборе ui/tokens.css цитируются объявления
  // сборки Storybook, и они не значения слоя.
  const css = read("ui/tokens.css").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [group, items] of Object.entries(tokens)) {
    for (const [name, t] of Object.entries(items)) {
      stats.tokens++;
      const cssVar = t.$extensions.guide.cssVar;
      const m = new RegExp(`^\\s*${cssVar.replace(/[-]/g, "\\-")}\\s*:\\s*([^;]+);`, "m").exec(css);
      if (!m) { fail(`tokens.json ${group}.${name}`, `переменной ${cssVar} в ui/tokens.css нет`); continue; }
      const raw = m[1].trim();
      const expected = raw.replace(/var\((--[\w-]+)\)/g, "").trim();
      if (!/^\{/.test(t.$value) && !raw.includes("var(") && t.$value !== raw) fail(`tokens.json ${group}.${name}`, `значение ${t.$value} против ${raw} в ui/tokens.css`);
      if (expected === "" && !/\{/.test(t.$value)) fail(`tokens.json ${group}.${name}`, "ссылка var() потеряна при переносе");
    }
  }
}

// 3. Якоря витрины --------------------------------------------------------
{
  for (const r of rules.filter((x) => x.kind === "rule")) {
    const anchor = r.showcase.split("#")[1];
    if (!pagesHtml.includes(`id="${anchor}"`)) fail(`rules.json ${r.id}`, `на витрине нет якоря #${anchor}`);
    if (!pagesHtml.includes(`data-rule="${r.id}"`)) fail(`rules.json ${r.id}`, "на витрине нет блока data-rule");
  }
  for (const c of components.filter((x) => x.anchor)) {
    const anchor = c.anchor.split("#")[1];
    if (!componentsHtml.includes(`id="${anchor}"`)) fail(`components.json ${c.id}`, `на витрине компонентов нет якоря #${anchor}`);
  }
  for (const p of patterns) {
    const anchor = p.showcase.split("#")[1];
    if (!pagesHtml.includes(`id="${anchor}"`)) fail(`patterns.json ${p.id}`, `на витрине нет якоря #${anchor}`);
  }
}

// 4. Разметка записей и 5. предикаты правил -------------------------------
const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const probe = path.join(pkg, ".markup-probe.html");
const probeUrl = "file:///" + probe.replace(/\\/g, "/");

for (const c of components.filter((x) => x.markup)) {
  stats.markup++;
  // Страница пишется файлом в сам пакет и открывается по file://: при
  // setContent документ остаётся about:blank, и @import внутри
  // ui/courses.css не загружается — проверка стала бы ложной.
  fs.writeFileSync(probe, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="ui/courses.css"></head><body>${c.markup.html}</body></html>`, "utf8");
  await page.goto(probeUrl, { waitUntil: "networkidle" });
  // markupState: hidden — запись, у которой состояние по умолчанию скрытое
  // (панель сервисов приходит с классом hidden). Такой случай объявляется
  // в components.overrides.json с причиной, а не молча пропускается.
  const ok = await page.evaluate((expectHidden) => {
    const n = document.body.firstElementChild;
    if (!n) return { ok: false, why: "разметка пуста" };
    const r = n.getBoundingClientRect();
    const s = getComputedStyle(n);
    const hidden = s.display === "none" || s.visibility === "hidden";
    if (expectHidden) return hidden ? { ok: true } : { ok: false, why: "объявлена скрытой, а отрисовалась" };
    if (hidden) return { ok: false, why: "узел скрыт" };
    if (r.width === 0 && r.height === 0) return { ok: false, why: "узел нулевого размера" };
    return { ok: true };
  }, c.markupState === "hidden");
  if (!ok.ok) fail(`components.json ${c.id}`, `markup не отрисовывается: ${ok.why}`);
}

if (fs.existsSync(probe)) fs.unlinkSync(probe);

const pageFile = (id) => "file:///" + path.join(pkg, "showcase/pages", `${id}.html`).replace(/\\/g, "/");
const scope = (r) => {
  const list = (r.appliesTo && r.appliesTo[0] === "all") || !r.appliesTo || !r.appliesTo.length ? patterns.map((p) => p.id) : r.appliesTo;
  return list.filter((id) => patterns.some((p) => p.id === id));
};

for (const r of rules.filter((x) => x.kind === "rule")) {
  const p = r.predicate;
  if (!p || p.type === "manual") { manual.push(`${r.id} — ${(p && p.check) || r.statement}`); continue; }
  if (p.type === "cssRule") continue; // проверяется ниже, по собранному ui/
  stats.checked++;
  for (const pageId of scope(r)) {
    for (const w of p.viewports || [1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(pageFile(pageId), { waitUntil: "networkidle" });
      const res = await page.evaluate(({ p }) => {
        const vis = (e) => e.checkVisibility && e.checkVisibility({ visibilityProperty: true }) && e.getBoundingClientRect().width > 0;
        const q = (sel) => { try { return [...document.querySelectorAll(sel)].filter(vis); } catch (e) { return { error: String(e.message || e) }; } };
        const eq = (actual, expected) => (Array.isArray(expected) ? expected.includes(actual) : actual === expected);
        if (p.type === "style") {
          const nodes = q(p.selector);
          if (nodes.error) return { bad: `селектор не разобран: ${nodes.error}` };
          if (!nodes.length) return { skip: "узлов нет" };
          const check = (n) => {
            const s = getComputedStyle(n);
            for (const [prop, val] of Object.entries(p.expect)) {
              let actual = s.getPropertyValue(prop).trim();
              if (val === "one-column") { if (actual.split(" ").length !== 1) return `${prop}: ${actual}`; continue; }
              if (prop === "border-top-left-radius" && val === "9999px") { const r = parseFloat(actual); const h = n.getBoundingClientRect().height; if (r < Math.min(h, n.getBoundingClientRect().width) / 2 - 0.5) return `${prop}: ${actual} при высоте ${Math.round(h)}`; continue; }
              if (!eq(actual, val)) return `${prop}: ${actual}, ожидалось ${Array.isArray(val) ? val.join(" или ") : val}`;
            }
            return null;
          };
          if (p.match === "any") return nodes.some((n) => !check(n)) ? { ok: true } : { bad: check(nodes[0]) };
          for (const n of nodes) { const why = check(n); if (why) return { bad: `${why} (узлов ${nodes.length})` }; }
          return { ok: true, n: nodes.length };
        }
        if (p.type === "absent") {
          const nodes = q(p.selector);
          if (nodes.error) return { bad: `селектор не разобран: ${nodes.error}` };
          return nodes.length ? { bad: `найдено ${nodes.length} узлов` } : { ok: true };
        }
        if (p.type === "columns") {
          const nodes = q(p.selector);
          if (!nodes.length) return { skip: "узлов нет" };
          const want = typeof p.columns === "object" ? p.columns[String(innerWidth)] : p.columns;
          if (want == null) return { skip: "ширина не задана" };
          for (const n of nodes) {
            const cols = getComputedStyle(n).gridTemplateColumns.split(" ").length;
            if (cols !== want) return { bad: `колонок ${cols}, ожидалось ${want}` };
          }
          return { ok: true, n: nodes.length };
        }
        if (p.type === "order") {
          const cands = [...document.querySelectorAll("div")].filter((d) => String(d.className).includes("max-w-[1124px]") && !d.closest("header") && !d.closest("footer"));
          const main = cands.flatMap((c) => [...c.children]).filter((e) => e.tagName === "DIV").sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
          if (!main) return { skip: "колонка не найдена" };
          return { ok: true, value: [...main.children].map((k) => k.tagName + "." + String(k.className).split(" ").slice(0, 2).join(".")).join(" | ") };
        }
        if (p.type === "text") {
          const t = document.body.innerText;
          const re = new RegExp(p.forbid, "g");
          const hit = t.match(re);
          return hit ? { bad: `запрещённая форма: ${[...new Set(hit)].slice(0, 3).join(", ")}` } : { ok: true };
        }
        if (p.type === "fontScale") {
          const bad = [];
          for (const e of document.querySelectorAll("body *")) {
            if (!vis(e) || e.closest("header") || e.closest("footer")) continue;
            const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (!own) continue;
            const fs = getComputedStyle(e).fontSize;
            if (parseFloat(fs) > p.min && !p.allowed.includes(fs)) bad.push(`${fs} «${e.textContent.trim().slice(0, 20)}»`);
          }
          return bad.length ? { bad: `кегль вне шкалы: ${[...new Set(bad)].slice(0, 3).join("; ")}` } : { ok: true };
        }
        if (p.type === "buttonLabels") {
          const cards = [...document.querySelectorAll("div.relative.box-border.rounded-3xl.border, div.relative.box-border.overflow-hidden.rounded-3xl.border")];
          const labels = new Set();
          for (const c of cards) for (const b of c.querySelectorAll("button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold")) labels.add(b.textContent.replace(/\s+/g, " ").trim().replace(/^Открыть код.*/, "Открыть код"));
          const bad = [...labels].filter((l) => l && !p.allowed.includes(l));
          return bad.length ? { bad: `подписи вне списка: ${bad.slice(0, 3).join(", ")}` } : { ok: true, n: labels.size };
        }
        return { skip: `тип ${p.type} не исполняется` };
      }, { p });
      if (res.bad) fail(`${r.id} · ${pageId} · ${w}`, res.bad);
      if (res.skip && p.type !== "cssRule") fail(`${r.id} · ${pageId} · ${w}`, `предикат не проверен: ${res.skip}`);
      if (p.type === "order" && res.value) {
        r._orders = r._orders || {};
        (r._orders[pageId] = r._orders[pageId] || []).push(res.value);
      }
    }
  }
  if (p.type === "order") {
    for (const [pageId, list] of Object.entries(r._orders || {})) if (new Set(list).size !== 1) fail(`${r.id} · ${pageId}`, "порядок блоков колонки разный на разных ширинах");
    delete r._orders;
  }
}

// cssRule: правило ищется в собранном ui/, а не в отрисовке
for (const r of rules.filter((x) => x.kind === "rule" && x.predicate && x.predicate.type === "cssRule")) {
  stats.checked++;
  const all = fs.readdirSync(path.join(pkg, "ui")).filter((f) => f.endsWith(".css")).map((f) => read(`ui/${f}`)).join("\n");
  const sel = r.predicate.selector;
  if (!all.includes(sel)) { fail(`${r.id}`, `правила ${sel} в ui/ нет`); continue; }
  const block = new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(all);
  if (!block) { fail(`${r.id}`, `блок ${sel} не разобран`); continue; }
  for (const [prop, val] of Object.entries(r.predicate.expect)) {
    if (!new RegExp(`${prop}\\s*:\\s*${val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(block[1])) fail(`${r.id}`, `в правиле ${sel} нет ${prop}: ${val}`);
  }
}

await browser.close();

// Итог --------------------------------------------------------------------
const dgWithoutConfidence = rules.filter((r) => r.kind === "decision-guide" && !r.confidence).map((r) => r.id);
if (dgWithoutConfidence.length) fail("rules.json", `у решений нет Confidence: ${dgWithoutConfidence.join(", ")}`);
if (!content.rules.length) fail("content.json", "правил текста нет");

if (errors.length) {
  console.error(`Машинная проекция расходится с источниками (${errors.length}):\n`);
  for (const e of errors) console.error("  " + e);
  console.error("\nПроекция — тот же пакет в другом виде. Расхождение значит, что\nкто-то правил JSON руками или источник изменился без пересборки:\nзапустите node tools/build-machine.mjs и проверьте снова.");
  process.exit(1);
}
console.log(`Проекция сходится с источниками: правил ${stats.rules}, из них с исполнимым предикатом ${stats.checked}; записей ${stats.components}, разметок отрисовано ${stats.markup}; токенов ${stats.tokens}.`);
if (manual.length) {
  console.log(`\nПроверяет человек (${manual.length}):`);
  for (const m of manual) console.log("  " + m);
}
