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
import { runPredicate } from "./machine-predicates.mjs";

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
  // Правило, которое ссылается на несуществующий паттерн, тихо исполнялось
  // на меньшем числе страниц, чем обещает (ревью R8, M10).
  const patternIds = new Set(patterns.map((p) => p.id));
  for (const r of rules.filter((x) => x.kind === "rule")) {
    for (const id of r.appliesTo || []) if (id !== "all" && !patternIds.has(id)) fail(`rules.json ${r.id}`, `appliesTo называет паттерн ${id}, которого нет`);
  }
  for (const f of Object.values(index.files)) if (!fs.existsSync(path.join(pkg, f))) fail("index.json", `файла ${f} нет`);
  for (const d of index.humanDocs) if (!fs.existsSync(path.join(pkg, d))) fail("index.json", `документа ${d} нет`);
}

// 2. Токены ---------------------------------------------------------------
{
  // Комментарии снимаются: в разборе ui/tokens.css цитируются объявления
  // сборки Storybook, и они не значения слоя.
  const css = read("ui/tokens.css").replace(/\/\*[\s\S]*?\*\//g, "");
  // Паритет в обе стороны: переменная, выпавшая из проекции, иначе прошла бы
  // молча — в сводке просто стало бы меньше токенов (ревью R8, M2).
  const inCss = [...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]);
  const inJson = new Set(Object.values(tokens).flatMap((g) => Object.values(g).map((t) => t.$extensions.guide.cssVar)));
  for (const v of inCss) if (!inJson.has(v)) fail("tokens.json", `переменная ${v} объявлена в ui/tokens.css и потеряна в проекции`);
  if (inCss.length !== inJson.size) fail("tokens.json", `переменных в ui/tokens.css ${inCss.length}, в проекции ${inJson.size}`);
  for (const [group, items] of Object.entries(tokens)) {
    for (const [name, t] of Object.entries(items)) {
      stats.tokens++;
      const cssVar = t.$extensions.guide.cssVar;
      const m = new RegExp(`^\\s*${cssVar.replace(/[-]/g, "\\-")}\\s*:\\s*([^;]+);`, "m").exec(css);
      if (!m) { fail(`tokens.json ${group}.${name}`, `переменной ${cssVar} в ui/tokens.css нет`); continue; }
      const raw = m[1].trim();
      const expected = raw.replace(/var\((--[\w-]+)\)/g, "").trim();
      if (!/^\{/.test(t.$value) && !raw.includes("var(") && String(t.$value) !== raw) fail(`tokens.json ${group}.${name}`, `значение ${t.$value} против ${raw} в ui/tokens.css`);
      if (expected === "" && !/\{/.test(String(t.$value))) fail(`tokens.json ${group}.${name}`, "ссылка var() потеряна при переносе");
      // Ссылка {группа.имя} обязана указывать на существующий токен: без
      // этого «{color.takogo-net}» проходил молча (ревью R8, M13).
      for (const m2 of String(t.$value).matchAll(/\{([\w-]+)\.([\w-]+)\}/g)) {
        if (!tokens[m2[1]] || !tokens[m2[1]][m2[2]]) fail(`tokens.json ${group}.${name}`, `ссылка {${m2[1]}.${m2[2]}} никуда не ведёт`);
      }
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

// Сначала снимаем вычисленные стили образцов на самой витрине: разметка
// проекции обязана давать те же значения на пустой странице. Проверка
// отрисовки «узел не нулевой» ловит только пустоту, а подменённый или
// сломанный класс — нет (ревью R8, M1).
// Сверять вычисленные стили с витриной нельзя: её собственный CSS делает
// образец флекс-элементом (`.doc-variant__row{display:flex}`), и значения
// display и min-height у одного и того же узла на витрине и на пустой
// странице законно разные. Поэтому содержание разметки проверяется иначе:
// каждый её класс обязан быть объявлен в ui/, а корень — совпадать с
// селектором записи из переписи.
const uiFiles = (dir) => fs.readdirSync(path.join(pkg, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? uiFiles(`${dir}/${e.name}`) : e.name.endsWith(".css") ? [`${dir}/${e.name}`] : []));
const uiCss = uiFiles("ui").map((f) => read(f)).join("\n");
const knownGaps = new Set(Object.keys(readJson("tools/known-missing-classes.json")).filter((k) => k !== "_"));
const escapeClass = (c) => c.replace(/[^A-Za-z0-9_-]/g, (ch) => "\\" + ch);
// Подстрока «.items-cente» нашлась бы внутри «.items-center»: класс ищется
// целиком — за ним обязан идти конец селектора, а не буква (ревью R8, M11).
const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const declared = (cls) => knownGaps.has(cls) || new RegExp("\\." + rx(escapeClass(cls)) + "(?![A-Za-z0-9_-])").test(uiCss);

// Текст образцов на самой витрине: с ним сверяется текст разметки проекции.
const showcaseText = await (async () => {
  await page.goto("file:///" + path.join(pkg, "showcase/components.html").replace(/\\/g, "/"), { waitUntil: "networkidle" });
  return page.evaluate((anchorSel) => {
    const out = {};
    for (const s of document.querySelectorAll("section.doc-section[id^='c-']")) {
      const sel = anchorSel[s.id];
      let n = null;
      if (sel) { try { n = s.querySelector(sel); } catch { n = null; } }
      if (!n) n = s.querySelector(".doc-variant__row > *, .doc-stage > *:not(.doc-variant)");
      if (n) out[s.id] = (n.innerText || n.textContent || "").replace(/\s+/g, " ").trim();
    }
    return out;
  }, Object.fromEntries(components.filter((c) => c.anchor).map((c) => {
    const full = c.evidence && c.evidence.production ? c.evidence.production.selector : null;
    return [c.anchor.split("#")[1], full ? full.split(",").map((s) => s.trim().split(/\s*>\s*|\s+/).pop()).filter(Boolean).join(", ") : null];
  })));
})();

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
  // Селектор переписи бывает контекстным («footer a.block.rounded-full»,
  // «.swiper-slide > div.relative»): образец стоит вне этого контекста,
  // поэтому корень сверяется с последней частью селектора — той, что
  // описывает саму запись.
  const fullSel = c.evidence && c.evidence.production ? c.evidence.production.selector : null;
  const sel = fullSel ? fullSel.split(",").map((s) => s.trim().split(/\s*>\s*|\s+/).pop()).filter(Boolean).join(", ") : null;
  const ok = await page.evaluate(({ expectHidden, sel }) => {
    const n = document.body.firstElementChild;
    if (!n) return { ok: false, why: "разметка пуста" };
    const r = n.getBoundingClientRect();
    const s = getComputedStyle(n);
    const hidden = s.display === "none" || s.visibility === "hidden";
    const classes = [...document.querySelectorAll("*")].flatMap((e) => [...e.classList]);
    let rootMatches = null;
    if (sel) { try { rootMatches = n.matches(sel); } catch { rootMatches = null; } }
    if (expectHidden) return hidden ? { ok: true, classes, rootMatches } : { ok: false, why: "объявлена скрытой, а отрисовалась" };
    if (hidden) return { ok: false, why: "узел скрыт" };
    if (r.width === 0 && r.height === 0) return { ok: false, why: "узел нулевого размера" };
    return { ok: true, classes, rootMatches, text: (n.innerText || n.textContent || "").replace(/\s+/g, " ").trim() };
  }, { expectHidden: c.markupState === "hidden", sel });
  if (!ok.ok) { fail(`components.json ${c.id}`, `markup не отрисовывается: ${ok.why}`); continue; }
  // содержание: классы разметки объявлены в ui/, корень — это запись
  const unknown = [...new Set(ok.classes)].filter((cl) => !declared(cl));
  if (unknown.length) fail(`components.json ${c.id}`, `в markup классы, которых нет в ui/: ${unknown.slice(0, 4).join(", ")}`);
  if (sel && ok.rootMatches === false) fail(`components.json ${c.id}`, `корень markup не совпадает с селектором записи ${sel.slice(0, 60)}`);
  // Текст образца: выброс подписи из разметки иначе проходил молча
  // (ревью R8, M12). Сверяется с тем же узлом на витрине.
  const anchorId = c.anchor && c.anchor.split("#")[1];
  const wantText = anchorId && showcaseText[anchorId];
  if (wantText != null && ok.text != null && wantText !== ok.text) {
    fail(`components.json ${c.id}`, `текст markup разошёлся с витриной: «${ok.text.slice(0, 40)}» против «${wantText.slice(0, 40)}»`);
  }
}

if (fs.existsSync(probe)) fs.unlinkSync(probe);

// Селекторы записей нужны предикатам, которые отбирают узлы по роли:
// «корень карточки» и «форма поиска» — это записи реестра, а не классы.
const census = readJson("components/selector-census.json").selectors;
const selOf = (id) => { const v = census[id]; return v ? (Array.isArray(v) ? v[0] : v).selector : null; };
const CARDS = ["course-card", "school-card", "person-card", "review-card", "article-card", "promo-card", "step-card", "ad-card"].map(selOf).filter(Boolean);
const SEARCH = selOf("search-form") || "form";

const pageFile = (id) => "file:///" + path.join(pkg, "showcase/pages", `${id}.html`).replace(/\\/g, "/");
const scope = (r) => {
  const list = (r.appliesTo && r.appliesTo[0] === "all") || !r.appliesTo || !r.appliesTo.length ? patterns.map((p) => p.id) : r.appliesTo;
  return list.filter((id) => patterns.some((p) => p.id === id));
};

// Наведение проверяется не по объявлению утилиты в ui/, а курсором на
// собранной странице: правило `.hover\:opacity-90:hover{opacity:.9}` печатает
// компилятор, и его наличие ничего не говорит о том, стоит ли класс хоть на
// одной кнопке (ревью R8, B2).
const ROLES = {
  "button-dark": { selector: "button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold", bg: "rgb(44, 46, 52)" },
  "button-light": { selector: "button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold", bg: "rgb(241, 241, 241)" },
  card: { selector: "div.relative.box-border.rounded-3xl.border, div.relative.box-border.overflow-hidden.rounded-3xl.border" },
  "table-row": { selector: "a.grid.w-full.items-center" },
};
const HOVER_PROPS = ["opacity", "background-color", "box-shadow", "transform", "border-top-color", "color"];
async function hoverCheck(r, pageId, w) {
  const p = r.predicate;
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(pageFile(pageId), { waitUntil: "networkidle" });
  for (const target of p.targets) {
    const role = ROLES[target.role];
    if (!role) { fail(`${r.id} · ${pageId}`, `роль ${target.role} не описана`); continue; }
    const handles = await page.$$(role.selector);
    let picked = null;
    for (const h of handles) {
      const okNode = await h.evaluate((n, bg) => {
        const s = getComputedStyle(n);
        const box = n.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        return bg ? s.backgroundColor === bg : true;
      }, role.bg || null);
      if (okNode) { picked = h; break; }
    }
    if (!picked) { fail(`${r.id} · ${pageId} · ${w}`, `узлов роли ${target.role} на странице нет`); continue; }
    const before = await picked.evaluate((n, props) => Object.fromEntries(props.map((x) => [x, getComputedStyle(n).getPropertyValue(x).trim()])), HOVER_PROPS);
    await picked.hover({ force: true });
    await page.waitForTimeout(120);
    const after = await picked.evaluate((n, props) => Object.fromEntries(props.map((x) => [x, getComputedStyle(n).getPropertyValue(x).trim()])), HOVER_PROPS);
    await page.mouse.move(0, 0);
    const changed = HOVER_PROPS.filter((x) => before[x] !== after[x]);
    if (target.expectUnchanged) {
      if (changed.length) fail(`${r.id} · ${pageId} · ${w}`, `${target.role} реагирует на наведение: ${changed.map((x) => `${x} ${before[x]} → ${after[x]}`).join("; ")}`);
      continue;
    }
    for (const [prop, val] of Object.entries(target.expect || {})) {
      if (after[prop] !== val) fail(`${r.id} · ${pageId} · ${w}`, `${target.role} при наведении ${prop} ${after[prop]}, ожидалось ${val}`);
    }
  }
}

for (const r of rules.filter((x) => x.kind === "rule")) {
  const p = r.predicate;
  if (!p || p.type === "manual") { manual.push(`${r.id} — ${(p && p.check) || r.statement}`); continue; }
  stats.checked++;
  if (p.type === "hoverEffect") {
    for (const pageId of scope(r)) for (const w of p.viewports || [1440]) await hoverCheck(r, pageId, w);
    continue;
  }
  for (const pageId of scope(r)) {
    for (const w of p.viewports || [1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(pageFile(pageId), { waitUntil: "networkidle" });
      const res = await page.evaluate(runPredicate, { p, CARDS, SEARCH });
      if (res.bad) fail(`${r.id} · ${pageId} · ${w}`, res.bad);
      if (res.skip) fail(`${r.id} · ${pageId} · ${w}`, `предикат не проверен: ${res.skip}`);
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
const ruleCount = rules.filter((r) => r.kind === "rule").length;
console.log(`Проекция сходится с источниками: правил ${ruleCount} и решений ${stats.rules - ruleCount}, предикатов исполнено ${stats.checked}; записей ${stats.components}, разметок отрисовано ${stats.markup}; токенов ${stats.tokens}.`);
if (manual.length) {
  console.log(`\nПроверяет человек (${manual.length}):`);
  for (const m of manual) console.log("  " + m);
}
