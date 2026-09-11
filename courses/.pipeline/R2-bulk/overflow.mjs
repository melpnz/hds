import { chromium } from "playwright";
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({ viewport: { width: 320, height: 800 } });
await p.goto("http://127.0.0.1:4179/showcase/components.html");
await p.waitForTimeout(900);
const bad = await p.evaluate(() => {
  const w = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.right > w + 1 && r.width > 0) {
      out.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 40), text: (el.textContent || "").trim().slice(0, 60), right: Math.round(r.right), w: Math.round(r.width), id: el.closest("section[id]")?.id || "" });
    }
  }
  return out.slice(0, 12);
});
console.log("ширина окна 320, вылезают за неё:", bad.length);
for (const x of bad) console.log(`  ${x.tag}.${x.cls} → ${x.w}px (${x.id}) «${x.text}»`);
await b.close();
