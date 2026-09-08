import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Точечные пробы к находкам аудита-3: chip (роли в одном ряду), select
// (29-й узел той же сигнатуры), ad-card и link (формы содержимого).

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, "../..");
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const domName = process.argv[2] ?? "dom.html";
const pages = fs.readdirSync(pagesDir).filter((id) => fs.existsSync(path.join(pagesDir, id, domName)));

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "msedge" });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();

const totals = {
  chips: 0,
  labels: 0,
  counters: 0,
  rows: 0,
  rowsWithCounter: 0,
  counterIsLastChild: 0,
  counterSiblingOfLabel: 0,
  labelRowsOnly: 0,
  counterOutsideRow: 0,
  selectOutside: [],
};

for (const id of pages) {
  await page.goto("file:///" + path.join(pagesDir, id, domName).replaceAll("\\", "/"));
  const result = await page.evaluate(() => {
    const selector = "div.bg-ui-black-50.flex.items-center.px-2.py-1.rounded-full";
    const chips = [...document.querySelectorAll(selector)];
    const isCounter = (node) => !node.className.includes("max-w-");
    const rows = new Map();
    for (const chip of chips) {
      const parent = chip.parentElement;
      if (!rows.has(parent)) rows.set(parent, []);
      rows.get(parent).push(chip);
    }
    let counterIsLastChild = 0;
    let counterSiblingOfLabel = 0;
    let counterOutsideRow = 0;
    let rowsWithCounter = 0;
    let labelRowsOnly = 0;
    for (const [parent, group] of rows) {
      const counters = group.filter(isCounter);
      const labels = group.filter((chip) => !isCounter(chip));
      if (counters.length) rowsWithCounter += 1;
      else labelRowsOnly += 1;
      for (const counter of counters) {
        if (parent.lastElementChild === counter) counterIsLastChild += 1;
        if (labels.length) counterSiblingOfLabel += 1;
        else counterOutsideRow += 1;
      }
    }
    // 29-й div.w-full против селектора записи select
    const declared = new Set(document.querySelectorAll(".gap-\\[1px\\] > div.w-full"));
    const wide = [...document.querySelectorAll("div.w-full")].filter((node) => !declared.has(node));
    return {
      chips: chips.length,
      labels: chips.filter((chip) => !isCounter(chip)).length,
      counters: chips.filter(isCounter).length,
      rows: rows.size,
      rowsWithCounter,
      labelRowsOnly,
      counterIsLastChild,
      counterSiblingOfLabel,
      counterOutsideRow,
      selectOutside: wide.map((node) => ({
        parent: node.parentElement?.tagName.toLowerCase() + "." + [...(node.parentElement?.classList ?? [])].join("."),
        text: (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 70),
        html: node.innerHTML.slice(0, 120),
      })),
    };
  });
  for (const key of Object.keys(totals)) {
    if (key === "selectOutside") {
      for (const row of result.selectOutside) totals.selectOutside.push({ page: id, ...row });
    } else totals[key] += result[key] ?? 0;
  }
}
await browser.close();
console.log(JSON.stringify(totals, null, 2));
