// Коробка поля ввода в продукте: сколько её, все ли содержат <input>, и какие
// у неё вычисленные значения — для сверки с elements/input/* макета.
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const base = "evidence/source/production/pages";
const SEL = "span.border.bg-ui-white.px-3.border-ui-black-100.rounded-xl";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ javaScriptEnabled: false });
const p = await ctx.newPage();
let total = 0, withInput = 0; const pages = new Set(); let html = null, page0 = null;
for (const pg of fs.readdirSync(base)) {
  const f = path.join(base, pg, "dom.html"); if (!fs.existsSync(f)) continue;
  await p.goto("file:///" + path.resolve(f).replaceAll("\\", "/"));
  const r = await p.evaluate((s) => [...document.querySelectorAll(s)].map((n) => ({ hasInput: !!n.querySelector("input"), html: n.outerHTML })), SEL);
  for (const x of r) { total++; pages.add(pg); if (x.hasInput) withInput++; if (!html && x.hasInput) { html = x.html; page0 = pg; } }
}
await b.close();
// Вычисленные значения — из снимка живого прода, как у прочих записей.
const cs = JSON.parse(fs.readFileSync(path.join(base, page0, "computed.json"), "utf8"));
const node = cs.find((n) => ["border", "bg-ui-white", "px-3", "border-ui-black-100", "rounded-xl"].every((c) => (n.classes || "").split(/\s+/).includes(c)) && n.tag === "span");
console.log(`коробок ${SEL}: ${total} на ${pages.size}/10 страниц, из них с <input> внутри: ${withInput}`);
if (node) {
  const s = node.styles;
  console.log(`computed (${page0}): ${node.box.w}×${node.box.h} · фон ${s["background-color"]} · рамка ${s.border} · радиус ${s["border-radius"]} · падинг ${s.padding}`);
}
fs.writeFileSync(".pipeline/R2-bulk/input-box.json", JSON.stringify({ selector: SEL, total, withInput, pages: [...pages].sort(), sample: { page: page0, html }, computed: node || null }, null, 1));
