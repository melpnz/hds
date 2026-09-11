// Каркас снятой страницы: отрисовка dom.html с CSS корпуса на ширине W,
// коробки и сетки крупных узлов, высота страницы. Числа статей pages/*.md —
// отсюда.
//
// Отрисовка — как у сверки diff-page.mjs: без скрипта, со снятым с селекторов
// атрибутом области видимости Vue (как в слое ui/) и с тем же шрифтом Inter
// из ui/assets/fonts. Первая редакция мерила без шрифта — запасным, — и
// высоты страниц расходились со скриншотами продакшена до 2,3%; со шрифтом
// они совпадают до пикселя на большинстве ширин (ревью R6).
//
// Запуск: node .pipeline/pages/layout.mjs <страница> <W> [глубина] [мин. ширина узла]
// На 320, 375, 768 берётся dom-<W>.html, если он есть, иначе dom.html.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const [, , pageId = "courses-listing", W = "1440", maxDepth = "9", minW = "250"] = process.argv;
const dir = path.join(pkg, "evidence/source/production/pages", pageId);
const domFile = fs.existsSync(path.join(dir, `dom-${W}.html`)) ? `dom-${W}.html` : "dom.html";
const cssDir = path.join(pkg, "evidence/source/production/css");
const unscope = (s) => s.replace(/\[data-v-[0-9a-f]+\]/g, "");
const ext = unscope(fs.readdirSync(path.join(cssDir, "external")).sort().map((f) => fs.readFileSync(path.join(cssDir, "external", f), "utf8")).join("\n"));
const css = unscope(fs.readFileSync(path.join(cssDir, "inline", `${pageId}.css`), "utf8"));
const body = fs.readFileSync(path.join(dir, domFile), "utf8");

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const page = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: +W, height: 900 } })).newPage();
await page.route(/^https?:/, (r) => {
  const m = /\/fonts\/inter\/([\w.-]+\.woff2)/.exec(r.request().url());
  const f = m && path.join(pkg, "ui/assets/fonts", m[1]);
  return f && fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: "font/woff2" }) : r.abort();
});
await page.setContent(`<!doctype html><html><head><style>${css}\n${ext}</style></head>${body.startsWith("<body") ? body : "<body>" + body + "</body>"}</html>`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const out = await page.evaluate(({ maxDepth, minW }) => {
  const lines = [];
  const walk = (el, depth) => {
    if (depth > maxDepth) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.display === "none") return;
    if (r.width >= minW && r.height > 0) {
      const x = [cs.display, cs.position !== "static" ? cs.position : "", cs.gridTemplateColumns !== "none" ? "cols:" + cs.gridTemplateColumns : "", cs.gap !== "normal" ? "gap:" + cs.gap : "", cs.padding !== "0px" ? "pad:" + cs.padding : "", cs.margin !== "0px" ? "m:" + cs.margin : ""].filter(Boolean).join(" ");
      const h = el.matches("h1,h2") ? " «" + el.textContent.trim().slice(0, 40) + "»" : "";
      lines.push(`${"  ".repeat(depth)}${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 6).join(".")} [${Math.round(r.x)},${Math.round(r.y + scrollY)} ${+r.width.toFixed(2)}×${+r.height.toFixed(2)}] ${x}${h}`);
    }
    for (const c of el.children) walk(c, depth + 1);
  };
  walk(document.body, 0);
  return lines.join("\n") + `\nВЫСОТА ${document.documentElement.scrollHeight}, ширина прокрутки ${document.documentElement.scrollWidth}`;
}, { maxDepth: +maxDepth, minW: +minW });
console.log(`${pageId} ${W} (${domFile})\n${out}`);
await browser.close();
