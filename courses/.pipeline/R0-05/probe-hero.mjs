import fs from "node:fs";
import path from "node:path";

// Проба к записи page-hero: её note объясняет девятый узел тем, что на
// /courses тот же класс несёт RubricationBar. Проверяю это, а не верю.

const packageDir = "d:/work/guides/courses";
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "components/manifest.json"), "utf8"));
const hero = manifest.components.find((c) => c.id === "page-hero").productionEvidence[0].selector;
const bar = manifest.components.find((c) => c.id === "rubrication-bar").productionEvidence[0].selector;

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "msedge" });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
for (const id of fs.readdirSync(pagesDir)) {
  const file = path.join(pagesDir, id, "dom.html");
  if (!fs.existsSync(file)) continue;
  await page.goto("file:///" + file.replaceAll("\\", "/"));
  const out = await page.evaluate(
    ({ heroSelector, barSelector }) => {
      const bars = [...document.querySelectorAll(barSelector)];
      return [...document.querySelectorAll(heroSelector)].map((node) => ({
        text: (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 50),
        containsBar: bars.some((b) => node.contains(b)),
        isBar: bars.includes(node),
        head: node.outerHTML.slice(0, 170),
      }));
    },
    { heroSelector: hero, barSelector: bar },
  );
  if (out.length > 1 || out.some((row) => !row.text)) console.log(id, JSON.stringify(out, null, 2));
  else console.log(`${id}: ${out.length} — «${out[0]?.text ?? ""}»`);
}
await browser.close();
