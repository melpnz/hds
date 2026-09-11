// Проверка расхождений, записанных в BRIEF §5, теперь когда оба слоя в пакете.
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const base = "evidence/source/production/pages";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const pad = new Map(), height = new Map();
for (const pg of fs.readdirSync(base)) {
  const f = path.join(base, pg, "dom.html");
  if (!fs.existsSync(f)) continue;
  await p.goto("file:///" + path.resolve(f).replaceAll("\\", "/"));
  const r = await p.evaluate(() => {
    const out = [];
    for (const n of document.querySelectorAll("button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold")) {
      const cls = [...n.classList];
      const px = cls.find((c) => /^px-/.test(c)) || "—";
      const py = cls.find((c) => /^py-/.test(c)) || "—";
      const h = cls.find((c) => /^h-/.test(c)) || "—";
      out.push([px + " " + py, h]);
    }
    return out;
  });
  for (const [k, h] of r) { pad.set(k, (pad.get(k) || 0) + 1); height.set(h, (height.get(h) || 0) + 1); }
}
await b.close();
console.log("паддинги кнопок (px py), по всем узлам:");
for (const [k, n] of [...pad].sort((a, c) => c[1] - a[1])) console.log(`  ${k.padEnd(16)} ${n}`);
console.log("\nвысоты:");
for (const [k, n] of [...height].sort((a, c) => c[1] - a[1])) console.log(`  ${k.padEnd(16)} ${n}`);
fs.writeFileSync(".pipeline/R2-bulk/button-sizes.json", JSON.stringify({ pad: [...pad], height: [...height] }, null, 1), "utf8");
