// Сверка страницы витрины с продуктом по вычисленным стилям.
//
// Продукт — снятый dom.html, отрисованный с CSS корпуса; витрина —
// showcase/pages/<id>.html с одним ui/courses.css. Узлы сопоставляются по
// пути от .app-container (индексы детей); у продукта заранее убираются те
// же script/style/link/iframe/template, что убирает gen-page.mjs, поэтому
// пути совпадают у всех узлов, которые витрина не сократила и не заменила
// заглушкой. Картинки и узлы внутри заглушек не сравниваются, высота — тоже
// (картинки продукта без сети не грузятся, у витрины — локальные заглушки).
//
// Запуск: node .pipeline/pages/diff-page.mjs <id> [ширины через запятую]
// Сервер витрины должен быть поднят: node tools/serve.mjs (порт 4179).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PAGES } from "./pages-config.mjs";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const [, , id = "courses-listing", widths = "1440,1024,768,375,320"] = process.argv;
const PROPS = ["display", "position", "width", "margin", "padding", "font-size", "line-height", "font-weight", "color", "background-color", "grid-template-columns", "flex-basis", "flex-direction", "gap", "border-radius", "border-top-width", "order", "overflow-x", "text-align"];

const cssDir = path.join(pkg, "evidence/source/production/css");
// Область видимости Vue снимается с селекторов корпуса — так же, как это
// делает слой ui/ (gen-utilities.mjs, unscope): съёмка срезала атрибуты
// data-v-* с разметки, и без этого продукт в отрисовке терял бы правила,
// которые в живом продукте работают (заглушка поиска, градиенты обложек).
const unscope = (s) => s.replace(/\[data-v-[0-9a-f]+\]/g, "");
const ext = unscope(fs.readdirSync(path.join(cssDir, "external")).sort().map((f) => fs.readFileSync(path.join(cssDir, "external", f), "utf8")).join("\n"));
const css = unscope(fs.readFileSync(path.join(cssDir, "inline", `${id}.css`), "utf8"));
const body = fs.readFileSync(path.join(pkg, "evidence/source/production/pages", id, "dom.html"), "utf8");

const collect = ({ PROPS, strip, hydrated }) => {
  const app = document.querySelector(".app-container");
  if (strip) {
    app.querySelectorAll("script, noscript, style, link, iframe, template").forEach((n) => n.remove());
    for (const sel of hydrated) app.querySelectorAll(sel).forEach((n) => n.remove());
  }
  const out = {};
  const walk = (el, p) => {
    if (el.classList.contains("doc-page-stub")) return;
    const cs = getComputedStyle(el);
    if (el.tagName !== "IMG" && cs.display !== "none") {
      out[p] = { cls: el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 4).join("."), v: Object.fromEntries(PROPS.map((k) => [k, cs.getPropertyValue(k)])) };
    }
    [...el.children].forEach((c, i) => walk(c, p + "/" + i));
  };
  walk(app, "");
  return out;
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
let bad = 0;
for (const w of widths.split(",").map(Number)) {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: w, height: 900 } });
  const p1 = await ctx.newPage();
  // Шрифт продукта — те же файлы Inter, что лежат в ui/assets/fonts: без
  // них продукт рисуется запасным шрифтом, и ширины текстовых узлов
  // расходятся с витриной не по вёрстке, а по шрифту.
  await p1.route(/^https?:/, (r) => {
    const m = /\/fonts\/inter\/([\w.-]+\.woff2)/.exec(r.request().url());
    const f = m && path.join(pkg, "ui/assets/fonts", m[1]);
    return f && fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: "font/woff2" }) : r.abort();
  });
  await p1.setContent(`<!doctype html><html><head><style>${css}\n${ext}</style></head>${body.startsWith("<body") ? body : "<body>" + body + "</body>"}</html>`, { waitUntil: "networkidle" });
  await p1.evaluate(() => document.fonts.ready);
  const prod = await p1.evaluate(collect, { PROPS, strip: true, hydrated: (PAGES[id].hydrated || []).map((h) => h.sel) });
  const ctx2 = await browser.newContext({ viewport: { width: w, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto(`http://127.0.0.1:4179/showcase/pages/${id}.html`, { waitUntil: "networkidle" });
  const show = await p2.evaluate(collect, { PROPS, strip: false, hydrated: [] });
  const diffs = new Map();
  let compared = 0;
  for (const [k, s] of Object.entries(show)) {
    const pr = prod[k];
    if (!pr || pr.cls !== s.cls) continue;
    compared++;
    for (const prop of PROPS) {
      const a = pr.v[prop], b = s.v[prop];
      if (a === b) continue;
      if (prop === "width" && Math.abs(parseFloat(a) - parseFloat(b)) < 1.5) continue;
      const key = `${s.cls} · ${prop}: продукт ${a} ≠ витрина ${b}`;
      diffs.set(key, (diffs.get(key) || 0) + 1);
    }
  }
  const list = [...diffs.entries()].sort((a, b) => b[1] - a[1]);
  bad += list.length;
  console.log(`\n== ${w}: сравнено узлов ${compared}, расхождений ${list.length}`);
  for (const [k, n] of list.slice(0, 25)) console.log(`  ×${n} ${k}`);
  await ctx.close(); await ctx2.close();
}
await browser.close();
process.exitCode = bad ? 1 : 0;
