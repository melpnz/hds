// Состав страницы по областям: порядок блоков верхнего уровня снятой
// страницы и записи реестра внутри каждого.
//
// Запуск: node page-structure.mjs <страница> [ширина]
// Страница — папка evidence/source/production/pages/<страница>; ширина —
// суффикс dom-<w>.html (по умолчанию dom.html, 1440).
// Выход: .pipeline/R2-bulk/page-<страница>.json и сводка в консоль.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const [, , pageId = "courses-listing", width = ""] = process.argv;
const file = path.join(pkg, "evidence/source/production/pages", pageId, width ? `dom-${width}.html` : "dom.html");
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8")).selectors;
const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const SEL = Object.fromEntries(manifest.components.filter((c) => census[c.id]).map((c) => [c.id, (Array.isArray(census[c.id]) ? census[c.id][0] : census[c.id]).selector]));

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
await page.setContent(fs.readFileSync(file, "utf8"), { waitUntil: "domcontentloaded" });
const out = await page.evaluate((SEL) => {
  const sets = {};
  for (const [id, s] of Object.entries(SEL)) { try { sets[id] = [...document.querySelectorAll(s)]; } catch { sets[id] = []; } }
  // Блоки верхнего уровня: прямые дети самого глубокого общего контейнера
  // основного содержимого — ищется элемент, у которого больше всего детей
  // с заголовком h1/h2 или записью реестра внутри.
  const body = document.body;
  const pick = (el) => [...el.children].filter((c) => c.offsetParent !== null || true);
  let root = body;
  for (let i = 0; i < 12; i++) {
    const kids = pick(root);
    if (kids.length === 1) { root = kids[0]; continue; }
    const big = kids.map((k) => [k, k.querySelectorAll("h1,h2,section,header,footer").length]).sort((a, b) => b[1] - a[1]);
    if (big.length > 1 && big[1][1] === 0 && big[0][1] > 0 && !big[0][0].matches("header,footer")) { root = big[0][0]; continue; }
    break;
  }
  const blocks = [];
  const walk = (container, depth) => {
    for (const el of container.children) {
      const recs = Object.entries(sets).filter(([, arr]) => arr.includes(el)).map(([k]) => k);
      const inside = {};
      for (const [id, arr] of Object.entries(sets)) { const n = arr.filter((x) => el.contains(x) && x !== el).length; if (n) inside[id] = n; }
      const h = el.querySelector("h1,h2");
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute("class") || "").split(/\s+/).slice(0, 8).join(" ");
      if (!Object.keys(inside).length && !recs.length && !h) continue;
      // Обёртку без собственной записи и с одним содержательным ребёнком
      // раскрываем глубже — иначе вся страница окажется одним блоком.
      const meaningful = [...el.children].filter((c) => c.querySelector("h1,h2,section") || Object.values(sets).some((arr) => arr.some((x) => c === x || c.contains(x))));
      if (!recs.length && meaningful.length > 1 && depth < 4 && !["header", "footer", "section"].includes(tag)) { walk(el, depth + 1); continue; }
      blocks.push({ depth, tag, cls, recs, heading: h ? h.textContent.replace(/\s+/g, " ").trim().slice(0, 70) : null, inside });
    }
  };
  walk(root, 0);
  return { root: root.tagName.toLowerCase() + "." + (root.getAttribute("class") || "").split(/\s+/).slice(0, 6).join("."), blocks };
}, SEL);
await browser.close();
fs.writeFileSync(path.join(d, `page-${pageId}${width ? "-" + width : ""}.json`), JSON.stringify(out, null, 1) + "\n", "utf8");
console.log("корень:", out.root);
out.blocks.forEach((b, i) => console.log(`${String(i + 1).padStart(2)}. <${b.tag}> ${b.recs.join(",") || "—"} | «${b.heading || ""}» | ${Object.entries(b.inside).sort((a, c) => c[1] - a[1]).slice(0, 6).map(([k, n]) => k + "×" + n).join(" ")}\n     ${b.cls}`));
