import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const base = "evidence/source/production/pages";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ javaScriptEnabled: false });
const p = await ctx.newPage();
const counts = new Map(); let total = 0, bare = 0;
for (const pg of fs.readdirSync(base)) {
  const f = path.join(base, pg, "dom.html");
  if (!fs.existsSync(f)) continue;
  await p.goto("file:///" + path.resolve(f).replaceAll("\\", "/"));
  const r = await p.evaluate(() => {
    const out = {}; let n = 0, empty = 0;
    for (const a of document.querySelectorAll("a")) {
      n++;
      if (!a.className || !String(a.className).trim()) { empty++; continue; }
      for (const c of a.classList) out[c] = (out[c] || 0) + 1;
    }
    return { out, n, empty };
  });
  total += r.n; bare += r.empty;
  for (const [k, v] of Object.entries(r.out)) counts.set(k, (counts.get(k) || 0) + v);
}
await b.close();
fs.writeFileSync("/dev/null".replace("/dev/null", new URL(".", import.meta.url).pathname.replace(/^\//, "") + "link-classes.json"), JSON.stringify({ total, bare, top: [...counts].sort((a, b2) => b2[1] - a[1]).slice(0, 12).map(([c, n]) => ({ cls: c, n, pct: +(n / total * 100).toFixed(1) })) }, null, 1), "utf8");
console.log(`узлов <a>: ${total}, из них вовсе без класса: ${bare} (${(bare / total * 100).toFixed(1)}%)`);
console.log("самые частые классы на <a>:");
for (const [k, v] of [...counts].sort((a, b2) => b2[1] - a[1]).slice(0, 10)) {
  console.log(`  ${k.padEnd(28)} ${String(v).padStart(4)}  ${(v / total * 100).toFixed(1)}%`);
}
