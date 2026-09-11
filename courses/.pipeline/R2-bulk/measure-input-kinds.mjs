// Какими обёртками окружены 29 полей ввода: сигнатура — классы ближайшего
// предка, несущего рамку или фон. Одна сигнатура = один вид поля.
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const base = "evidence/source/production/pages";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ javaScriptEnabled: false });
const p = await ctx.newPage();
const kinds = new Map();
for (const pg of fs.readdirSync(base)) {
  const f = path.join(base, pg, "dom.html"); if (!fs.existsSync(f)) continue;
  await p.goto("file:///" + path.resolve(f).replaceAll("\\", "/"));
  const r = await p.evaluate(() => [...document.querySelectorAll("input")].filter((i) => !i.classList.contains("visually-hidden") && i.type !== "hidden").map((i) => {
    let n = i.parentElement, sig = "(нет рамки выше)", hops = 0;
    while (n && hops < 5) {
      const c = [...n.classList];
      if (c.some((x) => /^(border|bg-ui-white|rounded)/.test(x))) { sig = n.tagName.toLowerCase() + "." + c.filter((x) => /^(border|bg-|rounded|px-|py-|h-)/.test(x)).sort().join("."); break; }
      n = n.parentElement; hops++;
    }
    return { sig, ph: i.getAttribute("placeholder") || "", inputCls: [...i.classList].filter((x) => /^(h-|min-h|text-|placeholder)/.test(x)).join(" ") };
  }));
  for (const x of r) {
    if (!kinds.has(x.sig)) kinds.set(x.sig, { n: 0, pages: new Set(), ph: new Set(), inputCls: x.inputCls });
    const k = kinds.get(x.sig); k.n++; k.pages.add(pg); if (x.ph) k.ph.add(x.ph);
  }
}
await b.close();
for (const [sig, k] of [...kinds].sort((a, b2) => b2[1].n - a[1].n)) {
  console.log(`${String(k.n).padStart(3)} на ${k.pages.size}/10 · ${sig}`);
  console.log(`      плейсхолдеры: ${[...k.ph].join(" · ")}`);
  console.log(`      классы поля: ${k.inputCls}`);
}
