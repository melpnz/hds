import fs from "node:fs";
import path from "node:path";

// Проба к находке аудита-3: ослабление селектора записи select до div.w-full
// находит узлы той же сигнатуры сверх улова. Сколько их и что это.

const packageDir = "d:/work/guides/courses";
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "components/manifest.json"), "utf8"));
const selector = manifest.components.find((c) => c.id === "select").productionEvidence[0].selector;
const pages = fs.readdirSync(pagesDir).filter((id) => fs.existsSync(path.join(pagesDir, id, "dom.html")));

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "msedge" });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
let declaredTotal = 0;
let signatureTotal = 0;
for (const id of pages) {
  await page.goto("file:///" + path.join(pagesDir, id, "dom.html").replaceAll("\\", "/"));
  const out = await page.evaluate((value) => {
    const declared = new Set(document.querySelectorAll(value));
    const sameSignature = [...document.querySelectorAll("div.w-full")].filter(
      (node) => [...node.classList].join(".") === "w-full",
    );
    return {
      declared: declared.size,
      sameSignature: sameSignature.length,
      extra: sameSignature
        .filter((node) => !declared.has(node))
        .map((node) => ({
          parent: node.parentElement.tagName.toLowerCase() + "." + [...node.parentElement.classList].join("."),
          firstChild: node.firstElementChild?.className ?? null,
        })),
    };
  }, selector);
  declaredTotal += out.declared;
  signatureTotal += out.sameSignature;
  if (out.extra.length) console.log(id, JSON.stringify(out.extra, null, 2));
}
console.log(`declared ${declaredTotal}, same-signature ${signatureTotal}`);
await browser.close();
