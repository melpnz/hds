// Узлы, которые видны в снятой разметке, а в живом продукте — нет.
//
// Снятый dom.html рисуется с CSS корпуса без скрипта; живой снимок той же
// страницы — computed*.json (снят браузером со скриптом). Узел, который в
// отрисовке имеет размер, а в живом снимке 0×0, продукт прячет чем-то, чего
// в пакете нет: scoped-правилом Vue с атрибутом data-v-*, который съёмка
// срезает, или скриптом. На /courses так нашлась заглушка поля поиска —
// глазами, по скриншоту. Этот проход находит такие узлы сам, до сборки
// страницы: кандидаты в PAGES[id].hydrated (pages-config.mjs).
//
// Узлы сопоставляются по пути computed.json («body > div[0] > …», индексы
// среди детей). Печатаются верхние из найденных — их потомки не повторяются.
//
// Запуск: node .pipeline/pages/hydration-diff.mjs <страница> [ширина]
// Ширина — суффикс computed-<w>.json и dom-<w>.html; без неё — 1440.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const [, , pageId = "courses-listing", w = ""] = process.argv;
const dir = path.join(pkg, "evidence/source/production/pages", pageId);
const live = JSON.parse(fs.readFileSync(path.join(dir, w ? `computed-${w}.json` : "computed.json"), "utf8"));
const liveBox = Object.fromEntries(live.map((n) => [n.path, n.box]));
const cssDir = path.join(pkg, "evidence/source/production/css");
// Область видимости Vue снимается с селекторов корпуса, как в слое ui/
// (gen-utilities.mjs, unscope): тогда находятся только узлы, которые
// продукт прячет скриптом, а не правилом, потерявшим атрибут при съёмке.
const unscope = (s) => s.replace(/\[data-v-[0-9a-f]+\]/g, "");
const ext = unscope(fs.readdirSync(path.join(cssDir, "external")).sort().map((f) => fs.readFileSync(path.join(cssDir, "external", f), "utf8")).join("\n"));
const css = unscope(fs.readFileSync(path.join(cssDir, "inline", `${pageId}.css`), "utf8"));
const body = fs.readFileSync(path.join(dir, w ? `dom-${w}.html` : "dom.html"), "utf8");

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const page = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: Number(w) || 1440, height: 900 } })).newPage();
await page.route(/^https?:/, (r) => r.abort());
await page.setContent(`<!doctype html><html><head><style>${css}\n${ext}</style></head>${body.startsWith("<body") ? body : "<body>" + body + "</body>"}</html>`);
const found = await page.evaluate((liveBox) => {
  const out = [];
  const walk = (el, p, hiddenAbove) => {
    const r = el.getBoundingClientRect();
    const lb = liveBox[p];
    let flagged = false;
    if (!hiddenAbove && lb && r.width > 1 && r.height > 1 && lb.w === 0 && lb.h === 0) {
      out.push({ path: p, node: el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 5).join("."), render: `${Math.round(r.width)}×${Math.round(r.height)}`, text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 50) });
      flagged = true;
    }
    [...el.children].forEach((c) => {
      const same = [...el.children].filter((x) => x.tagName === c.tagName);
      walk(c, `${p} > ${c.tagName.toLowerCase()}[${same.indexOf(c)}]`, hiddenAbove || flagged);
    });
  };
  walk(document.body, "body", false);
  return out;
}, liveBox);
await browser.close();
console.log(`${pageId}${w ? " " + w : ""}: узлов, видимых без скрипта и нулевых в живом снимке, — ${found.length}`);
for (const f of found.slice(0, 40)) console.log(`  ${f.render}  ${f.node}  «${f.text}»\n      ${f.path}`);
