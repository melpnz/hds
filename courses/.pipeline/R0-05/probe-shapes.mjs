import fs from "node:fs";
import path from "node:path";

// Проба 2 подробно: записи, у которых улов распался на две формы содержимого.
// Вопрос один — разные это элементы или один элемент в двух положениях.

const packageDir = "d:/work/guides/courses";
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "components/manifest.json"), "utf8"));
const pages = fs.readdirSync(pagesDir).filter((id) => fs.existsSync(path.join(pagesDir, id, "dom.html")));
const targets = process.argv.slice(2);

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "msedge" });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();

for (const id of pages) {
  await page.goto("file:///" + path.join(pagesDir, id, "dom.html").replaceAll("\\", "/"));
  for (const record of manifest.components.filter((c) => targets.includes(c.id))) {
    for (const evidence of record.productionEvidence) {
      const rows = await page.evaluate((selector) =>
        [...document.querySelectorAll(selector)].map((node) => ({
          empty: !(node.textContent ?? "").trim(),
          parent: node.parentElement.tagName.toLowerCase() + "." + [...node.parentElement.classList].join("."),
          children: [...node.children].map((child) => child.tagName.toLowerCase()).join(","),
          childClasses: [...node.children].map((child) => child.className).join(" | ").slice(0, 110),
        })), evidence.selector);
      for (const row of rows.filter((row) => row.empty)) {
        console.log(`${record.id} · ${id} · пусто · дети [${row.children}] · ${row.childClasses}`);
      }
      const filled = rows.filter((row) => !row.empty);
      if (filled.length && record.id === "ad-card") {
        console.log(`${record.id} · ${id} · с текстом ${filled.length} · дети [${filled[0].children}]`);
      }
    }
  }
}
await browser.close();
