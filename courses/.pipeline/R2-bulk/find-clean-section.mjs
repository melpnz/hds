import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const base = "evidence/source/production/pages";
const sel = "section.flex.flex-col.gap-4";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const found = [];
for (const pg of fs.readdirSync(base)) {
  const f = path.join(base, pg, "dom.html");
  if (!fs.existsSync(f)) continue;
  await p.goto("file:///" + path.resolve(f).replaceAll("\\", "/"));
  const r = await p.evaluate(([s]) => {
    const out = [];
    document.querySelectorAll(s).forEach((n, i) => {
      const cls = new Set();
      const walk = (x) => { if (x.classList) for (const c of x.classList) cls.add(c); for (const ch of x.children) walk(ch); };
      walk(n);
      const swiper = [...cls].filter((c) => /^(swiper|banner-swiper)/.test(c));
      out.push({ i, nodes: n.querySelectorAll("*").length, classes: cls.size, swiper: swiper.length, bytes: n.outerHTML.length });
    });
    return out;
  }, [sel]);
  for (const x of r) if (!x.swiper) found.push({ page: pg, ...x });
}
await b.close();
found.sort((a, b2) => a.bytes - b2.bytes);
console.log(`экземпляров section без swiper: ${found.length}`);
for (const x of found.slice(0, 6)) console.log(`  ${x.page.padEnd(26)} #${x.i}  ${String(x.nodes).padStart(3)} узлов, ${String(x.classes).padStart(3)} классов, ${x.bytes} б`);
