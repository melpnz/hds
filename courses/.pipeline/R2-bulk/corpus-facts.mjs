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
// Страница отрисовывается со своим CSS корпуса (inline/<страница>.css и все
// внешние чанки, evidence/source/production/css/) на 1440 без JS. Без CSS
// нельзя сказать ни что скрыто (`hidden` у предка), ни какие переходы на
// самом деле объявлены: первая редакция судила о переходах по двум классам
// разметки и назвала 0.15 с там, где `duration-300` на том же узле даёт
// 0.3 с, и «других переходов нет» там, где их объявляет CSS компонента.
//
// Фокусируемые узлы считаются все, а не только записи реестра: ссылки,
// кнопки без `disabled`, поля, `select`, `textarea`, `[tabindex]`. Первая
// редакция знала только записи и назвала поле ввода неинтерактивным.
//
// Выход: .pipeline/R2-bulk/corpus-facts.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const cssDir = path.join(pkg, "evidence/source/production/css");
const externalCss = fs.readdirSync(path.join(cssDir, "external")).sort().map((f) => fs.readFileSync(path.join(cssDir, "external", f), "utf8")).join("\n");
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8")).selectors;
const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const prodIds = manifest.components.filter((c) => c.sourceScope === "production" && census[c.id]).map((c) => c.id);
const selectorOf = (id) => (Array.isArray(census[id]) ? census[id][0] : census[id]).selector;
const pages = fs.readdirSync(pagesDir).filter((p) => fs.existsSync(path.join(pagesDir, p, "dom.html")));

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined }).catch(() => chromium.launch({ channel: "msedge" }));
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
// Внешние картинки не грузятся: разметка та же, а сеть не нужна.
await page.route(/^https?:/, (r) => r.abort());

const SUMS = ["tags", "href", "target", "region", "contexts", "classes", "aria", "children", "parents", "texts", "focusKinds", "focusSignatures", "focusRecords", "focusOutside", "transitions", "transitionInstances"];
const facts = {};
for (const id of prodIds) facts[id] = { selector: selectorOf(id), nodes: 0, hiddenNodes: 0, pages: {}, focusHidden: 0, ...Object.fromEntries(SUMS.map((k) => [k, {}])), sameParentMax: 0 };

const SELECTORS = Object.fromEntries(prodIds.map((id) => [id, selectorOf(id)]));

for (const p of pages) {
  const body = fs.readFileSync(path.join(pagesDir, p, "dom.html"), "utf8");
  const css = fs.readFileSync(path.join(cssDir, "inline", p + ".css"), "utf8");
  await page.setContent(`<!doctype html><html><head><style>${css}\n${externalCss}</style></head>${body.startsWith("<body") ? body : "<body>" + body + "</body>"}</html>`, { waitUntil: "domcontentloaded" });
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
    const FOCUS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const kindOf = (n) => {
      const t = n.tagName.toLowerCase();
      if (t === "a") return "ссылка";
      if (t === "button") return "кнопка";
      if (t === "input") return `поле ${n.getAttribute("type") || "text"}`;
      if (t === "select" || t === "textarea") return t;
      return "tabindex";
    };
    const visible = (n) => n.checkVisibility({ visibilityProperty: true });
    const short = (n) => n.tagName.toLowerCase() + [...n.classList].slice(0, 4).map((c) => "." + c).join("");
    const secs = (v) => v.split(",").some((x) => parseFloat(x) > 0);
    for (const [id, set] of Object.entries(matchSets)) {
      const r = { nodes: set.size, hiddenNodes: 0, focusHidden: 0, tags: {}, href: {}, target: {}, region: {}, contexts: {}, classes: {}, aria: {}, children: {}, parents: {}, sameParentMax: 0, texts: {}, focusKinds: {}, focusSignatures: {}, focusRecords: {}, focusOutside: {}, transitions: {}, transitionInstances: {} };
      const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
      const perParent = new Map();
      for (const el of set) {
        inc(r.tags, el.tagName.toLowerCase());
        if (!visible(el)) r.hiddenNodes++;
        // Фокусируемые узлы экземпляра: подпись «кнопка×1 · ссылка×1» на
        // экземпляр и приписка каждого узла к самой внутренней записи реестра
        // (поле внутри TextInput внутри Select считается один раз — у TextInput).
        const all = [el, ...el.querySelectorAll("*")];
        const foc = all.filter((n) => n.matches(FOCUS));
        const sig = {};
        for (const n of foc) {
          inc(sig, kindOf(n)); inc(r.focusKinds, kindOf(n));
          if (!visible(n)) r.focusHidden++;
          if (n === el) continue;
          let owner = null;
          for (let a = n; a && a !== el; a = a.parentElement) { const ks = recOf(a).filter((k) => k !== id); if (ks.length) { owner = ks[0]; break; } }
          inc(owner ? r.focusRecords : r.focusOutside, owner || short(n));
        }
        inc(r.focusSignatures, Object.entries(sig).sort().map(([k, n]) => `${k}×${n}`).join(" · ") || "—");
        // Переходы и анимации — из вычисленного стиля, то есть из CSS корпуса.
        const inst = new Set();
        for (const n of all) {
          const cs = getComputedStyle(n);
          const prop = cs.transitionProperty, dur = cs.transitionDuration;
          if (prop !== "none" && (prop !== "all" || secs(dur))) {
            const key = `${short(n)} → ${prop} | ${dur} | ${cs.transitionTimingFunction}${secs(cs.transitionDelay) ? " | задержка " + cs.transitionDelay : ""}`;
            inc(r.transitions, key); inst.add(key);
          }
          if (cs.animationName && cs.animationName !== "none") {
            const key = `${short(n)} → animation ${cs.animationName} | ${cs.animationDuration} | ${cs.animationIterationCount}`;
            inc(r.transitions, key); inst.add(key);
          }
        }
        for (const k of inst) inc(r.transitionInstances, k);
        const href = el.getAttribute("href");
        inc(r.href, href == null ? "нет" : href.startsWith("#") ? "якорь" : /^(mailto|tel):/.test(href) ? "почта или телефон" : /^https?:/.test(href) && !/career\.habr\.com/.test(href) ? "внешняя" : "внутренняя");
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
    f.nodes += r.nodes; f.pages[p] = r.nodes; f.hiddenNodes += r.hiddenNodes; f.focusHidden += r.focusHidden;
    for (const k of SUMS) for (const [a, b] of Object.entries(r[k])) f[k][a] = (f[k][a] || 0) + b;
    f.sameParentMax = Math.max(f.sameParentMax, r.sameParentMax);
  }
}
await browser.close();
const top = (o, n = 8) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
// Классы не обрезаются: ревью выборки нашло, что при обрезке на 40 генератор
// молча не увидел бы класс, стоящий за чертой.
for (const f of Object.values(facts)) { f.contexts = top(f.contexts, 10); f.texts = top(f.texts, 10); f.classes = top(f.classes, 1000); f.focusOutside = top(f.focusOutside, 12); }
fs.writeFileSync(path.join(d, "corpus-facts.json"), JSON.stringify(facts, null, 1) + "\n", "utf8");
console.log(`факты: ${Object.keys(facts).length} записей, ${pages.length} страниц`);
