// Сколько в снятой разметке настоящих полей ввода и как выглядит поле поиска.
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const base = "evidence/source/production/pages";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ javaScriptEnabled: false });
const p = await ctx.newPage();
let inputs = 0; const types = {}; const placeholders = {}; let sample = null; const seen = new Set();
for (const pg of fs.readdirSync(base)) {
  const f = path.join(base, pg, "dom.html"); if (!fs.existsSync(f)) continue;
  await p.goto("file:///" + path.resolve(f).replaceAll("\\", "/"));
  const r = await p.evaluate(() => [...document.querySelectorAll("input")].map((i) => ({
    type: i.getAttribute("type") || "text", ph: i.getAttribute("placeholder") || "",
    hidden: i.classList.contains("visually-hidden") || i.type === "hidden",
    wrapper: i.closest("div[class*='wrapper']")?.className || "",
    html: i.closest("div[class*='wrapper--with-search']")?.outerHTML?.slice(0, 700) || "",
  })));
  for (const x of r) {
    if (x.hidden) continue;
    inputs++; seen.add(pg);
    types[x.type] = (types[x.type] || 0) + 1;
    if (x.ph) placeholders[x.ph] = (placeholders[x.ph] || 0) + 1;
    if (!sample && x.html) sample = { page: pg, html: x.html };
  }
}
await b.close();
console.log(`видимых <input>: ${inputs} на ${seen.size}/10 страниц`);
console.log("типы:", JSON.stringify(types));
console.log("плейсхолдеры:", JSON.stringify(placeholders));
if (sample) console.log(`\nобразец (${sample.page}):\n${sample.html}`);
