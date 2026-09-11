// Факты корпуса для прозаических разделов спецификаций.
//
// Для каждой продуктовой записи — по её селектору переписи на десяти снятых
// страницах (dom.html, 1440): каким тегом рендерится, куда ведёт, в каком
// контексте стоит (ближайший заголовок, шапка/подвал/основное), какие у неё
// классы анимации, адаптива и интерактивных состояний, какие записи реестра
// лежат внутри и рядом. Проза спецификаций пишется по этому файлу — правило
// «раздел без подтверждения не пишется» проверяемо, если подтверждение
// лежит рядом числом.
//
// Выход: .pipeline/R2-bulk/corpus-facts.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8")).selectors;
const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const prodIds = manifest.components.filter((c) => c.sourceScope === "production" && census[c.id]).map((c) => c.id);
const selectorOf = (id) => (Array.isArray(census[id]) ? census[id][0] : census[id]).selector;
const pages = fs.readdirSync(pagesDir).filter((p) => fs.existsSync(path.join(pagesDir, p, "dom.html")));

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined }).catch(() => chromium.launch({ channel: "msedge" }));
const ctx = await browser.newContext({ javaScriptEnabled: false });
const page = await ctx.newPage();

const facts = {};
for (const id of prodIds) facts[id] = { selector: selectorOf(id), nodes: 0, pages: {}, tags: {}, href: {}, target: {}, region: {}, contexts: {}, classes: {}, aria: {}, children: {}, parents: {}, sameParentMax: 0, texts: {} };

const SELECTORS = Object.fromEntries(prodIds.map((id) => [id, selectorOf(id)]));

for (const p of pages) {
  const html = fs.readFileSync(path.join(pagesDir, p, "dom.html"), "utf8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const out = await page.evaluate((SELECTORS) => {
    const res = {};
    const heads = [...document.querySelectorAll("h1,h2,h3")];
    const nearestHeading = (el) => {
      let best = null;
      for (const h of heads) {
        if (h === el || el.contains(h)) continue;
        if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) best = h; else break;
      }
      return best ? best.textContent.replace(/\s+/g, " ").trim().slice(0, 60) : null;
    };
    const matchSets = {};
    for (const [id, sel] of Object.entries(SELECTORS)) {
      try { matchSets[id] = new Set(document.querySelectorAll(sel)); } catch { matchSets[id] = new Set(); }
    }
    const recOf = (el) => Object.keys(matchSets).filter((k) => matchSets[k].has(el));
    for (const [id, set] of Object.entries(matchSets)) {
      const r = { nodes: set.size, tags: {}, href: {}, target: {}, region: {}, contexts: {}, classes: {}, aria: {}, children: {}, parents: {}, sameParentMax: 0, texts: {} };
      const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
      const perParent = new Map();
      for (const el of set) {
        inc(r.tags, el.tagName.toLowerCase());
        const href = el.getAttribute("href");
        inc(r.href, href == null ? "нет" : href.startsWith("#") ? "якорь" : /^https?:/.test(href) && !/career\.habr\.com/.test(href) ? "внешняя" : "внутренняя");
        if (el.getAttribute("target")) inc(r.target, el.getAttribute("target"));
        inc(r.region, el.closest("header") ? "шапка" : el.closest("footer") ? "подвал" : "основное");
        const h = nearestHeading(el); if (h) inc(r.contexts, h);
        const cls = [...el.querySelectorAll("*"), el].flatMap((n) => [...n.classList]);
        for (const c of new Set(cls)) {
          if (/(^|:)(transition|duration|ease|animate|delay)/.test(c) || /^(phone|tablet|desktop|small-phone|tablet-only|laptop):/.test(c) || /^(hover|focus|focus-visible|focus-within|active|disabled|group-hover|peer-[a-z-]+):/.test(c) || /line-clamp|truncate|max-h-/.test(c)) inc(r.classes, c);
        }
        for (const a of el.getAttributeNames()) if (/^(aria-|role$|tabindex$|disabled$|rel$)/.test(a)) inc(r.aria, a + (a === "role" || a === "rel" ? "=" + el.getAttribute(a) : ""));
        for (const k of Object.keys(matchSets)) {
          if (k === id) continue;
          let n = 0; for (const x of matchSets[k]) if (el.contains(x) && x !== el) n++;
          if (n) r.children[k] = (r.children[k] || 0) + n;
        }
        for (let a = el.parentElement; a; a = a.parentElement) { const ks = recOf(a).filter((k) => k !== id); if (ks.length) { for (const k of ks) inc(r.parents, k); break; } }
        const par = el.parentElement; perParent.set(par, (perParent.get(par) || 0) + 1);
        const t = el.textContent.replace(/\s+/g, " ").trim(); if (t && t.length < 50) inc(r.texts, t);
      }
      r.sameParentMax = Math.max(0, ...perParent.values());
      res[id] = r;
    }
    return res;
  }, SELECTORS);
  for (const [id, r] of Object.entries(out)) {
    if (!r.nodes) continue;
    const f = facts[id];
    f.nodes += r.nodes; f.pages[p] = r.nodes;
    for (const k of ["tags", "href", "target", "region", "contexts", "classes", "aria", "children", "parents", "texts"]) for (const [a, b] of Object.entries(r[k])) f[k][a] = (f[k][a] || 0) + b;
    f.sameParentMax = Math.max(f.sameParentMax, r.sameParentMax);
  }
}
await browser.close();
const top = (o, n = 8) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
for (const f of Object.values(facts)) { f.contexts = top(f.contexts, 10); f.texts = top(f.texts, 10); f.classes = top(f.classes, 40); }
fs.writeFileSync(path.join(d, "corpus-facts.json"), JSON.stringify(facts, null, 1) + "\n", "utf8");
console.log(`факты: ${Object.keys(facts).length} записей, ${pages.length} страниц`);
