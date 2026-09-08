import fs from "node:fs";
import path from "node:path";

// Проба 5: устойчивость чисел реестра к ширине снимка. dom.html снят на
// самой широкой из --widths (1440); рядом лежат dom-375.html и dom-768.html.
// Запись, чьё число меняется с шириной, обязана это объяснять.

const packageDir = "d:/work/guides/courses";
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "components/manifest.json"), "utf8"));
const records = manifest.components.filter((c) => c.sourceScope === "production");
const variants = ["dom.html", "dom-375.html", "dom-768.html"];

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "msedge" });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();

const totals = {};
for (const record of records) totals[record.id] = {};
for (const domName of variants) {
  const pages = fs.readdirSync(pagesDir).filter((id) => fs.existsSync(path.join(pagesDir, id, domName)));
  for (const id of pages) {
    await page.goto("file:///" + path.join(pagesDir, id, domName).replaceAll("\\", "/"));
    for (const record of records) {
      for (const evidence of record.productionEvidence) {
        const count = await page.evaluate((selector) => {
          try {
            return document.querySelectorAll(selector).length;
          } catch {
            return null;
          }
        }, evidence.selector);
        totals[record.id][domName] = (totals[record.id][domName] ?? 0) + (count ?? 0);
      }
    }
  }
  console.error(`${domName}: ${pages.length} страниц`);
}
await browser.close();

console.log("| Запись | dom.html (1440) | dom-375 | dom-768 | устойчиво |");
console.log("|---|---|---|---|---|");
for (const record of records) {
  const row = totals[record.id];
  const values = variants.map((v) => row[v] ?? 0);
  const stable = new Set(values).size === 1;
  console.log(`| ${record.id} | ${values[0]} | ${values[1]} | ${values[2]} | ${stable ? "да" : "**нет**"} |`);
}
