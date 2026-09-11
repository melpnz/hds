// Извлечение представителя компонента из снятого прод-DOM.
// Вход  — components/selector-census.json (селекторы уже измерены).
// Выход — .pipeline/R2-bulk/extracted/<id>.json: разметка узла, список классов
//         поддерева, computed корня. Ничего в пакете не трогает.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(toolDir, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8"));
const outDir = path.join(toolDir, "extracted");
fs.mkdirSync(outDir, { recursive: true });

const only = process.argv.slice(2);
const targets = Object.entries(census.selectors).filter(([id]) => !only.length || only.includes(id));

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = {};
for (const [id, entriesRaw] of targets) {
  const entries = Array.isArray(entriesRaw) ? entriesRaw : [entriesRaw];
  const rec = { id, instances: [] };
  for (const e of entries) {
    const pg = (e.pages || [])[0];
    if (!pg) continue;
    await page.goto("file:///" + path.join(pagesDir, pg, "dom.html").replaceAll("\\", "/"));
    const data = await page.evaluate(([sel]) => {
      // Представителем берётся первый узел, в поддереве которого нет классов
      // библиотеки Swiper. Пакет её слой не поднимает (решение R0-02), и
      // образец, которому она нужна, был бы на витрине сломан. Если чистого
      // узла на странице нет — берётся первый и это помечается.
      const all = [...document.querySelectorAll(sel)];
      if (!all.length) return null;
      const swiperFree = (n) => {
        const cls = new Set();
        const w = (x) => { if (x.classList) for (const c of x.classList) cls.add(c); for (const ch of x.children) w(ch); };
        w(n);
        return ![...cls].some((c) => /^(swiper|banner-swiper)/.test(c));
      };
      const clean = all.find(swiperFree);
      const node = clean || all[0];
      const swiperInSubtree = !clean;
      const classes = new Set();
      // Без ограничения глубины: первая редакция обходила шесть уровней,
      // и классы глубже шестого не попадали ни в резолв правил, ни в слой
      // ui/ — витрина ссылалась на классы, которых в пакете нет. Поймал
      // это validate-classes, а не проверка автора.
      const walk = (n) => {
        if (n.classList) for (const c of n.classList) classes.add(c);
        for (const ch of n.children) walk(ch);
      };
      walk(node);
      const cs = getComputedStyle(node);
      const want = ["display","flex-direction","align-items","justify-content","gap","padding","margin",
        "border-radius","border","background-color","color","font-size","font-weight","line-height",
        "width","height","min-width","max-width","overflow","position","box-shadow","text-align"];
      const computed = {};
      for (const p of want) computed[p] = cs.getPropertyValue(p);
      return {
        html: node.outerHTML,
        tag: node.tagName.toLowerCase(),
        classes: [...classes],
        computed,
        descendants: node.querySelectorAll("*").length,
        instanceIndex: all.indexOf(node),
        instancesOnPage: all.length,
        swiperInSubtree,
      };
    }, [e.selector]);
    if (data) rec.instances.push({ selector: e.selector, page: pg, found: e.found, ...data });
  }
  results[id] = rec;
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(rec, null, 1), "utf8");
  const i = rec.instances[0];
  console.log(`${id.padEnd(22)} ${i ? `${String(i.classes.length).padStart(3)} классов, ${String(i.descendants).padStart(3)} узлов, ${i.html.length} б` : "НЕ НАЙДЕН"}`);
}
await browser.close();
console.log(`\nИзвлечено ${Object.keys(results).length} компонентов в .pipeline/R2-bulk/extracted/`);
