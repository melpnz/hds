// Измерение инвариантов записи: какие классы стоят на КАЖДОМ её узле.
//
// Правило пакета — не «так красивее», а факт, у которого есть голоса и
// исключения (METHOD, раздел «Правила»; образец — правило цвета звезды
// рейтинга в R2-01: 212/212). Здесь голоса считаются по всем узлам, которые
// находит селектор переписи, на всех страницах сразу.
//
// Инструмент только измеряет. Что из измеренного станет правилом на витрине
// и как оно будет сформулировано — решает отдельный шаг: единогласие ещё
// не делает класс правилом, оно делает его кандидатом.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8"));
const pages = fs.readdirSync(pagesDir).filter((p) => fs.existsSync(path.join(pagesDir, p, "dom.html")));

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const out = {};
for (const [id, raw] of Object.entries(census.selectors)) {
  const entry = (Array.isArray(raw) ? raw : [raw])[0];
  const counts = new Map();
  const pagesWith = new Map();
  let total = 0;
  for (const pg of entry.pages) {
    if (!pages.includes(pg)) continue;
    await page.goto("file:///" + path.join(pagesDir, pg, "dom.html").replaceAll("\\", "/"));
    const r = await page.evaluate(([sel]) => {
      const out = [];
      for (const n of document.querySelectorAll(sel)) out.push([...n.classList]);
      return out;
    }, [entry.selector]);
    for (const cls of r) {
      total++;
      for (const c of new Set(cls)) {
        counts.set(c, (counts.get(c) || 0) + 1);
        if (!pagesWith.has(c)) pagesWith.set(c, new Set());
        pagesWith.get(c).add(pg);
      }
    }
  }
  if (!total) continue;
  // Классы, которых требует сам селектор переписи, из единогласия вычитаются:
  // они стоят на каждом узле по построению выборки, а не по свойству продукта.
  // Без этого вычитания «правилом» становилось бы условие собственного отбора —
  // ровно та подмена, которую пакет ловит у себя в других местах.
  const selectorClasses = new Set(
    [...entry.selector.matchAll(/\.((?:[\w-]|\\.)+)/g)].map((m) => m[1].replaceAll("\\", "")),
  );
  const unanimous = [...counts]
    .filter(([c, n]) => n === total && !selectorClasses.has(c))
    .map(([c]) => c).sort();
  // Почти-единогласные: интереснее единогласных, потому что называют исключение.
  const nearly = [...counts]
    .filter(([c, n]) => n < total && n / total >= 0.8 && !selectorClasses.has(c))
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => ({ cls: c, n, of: total, pages: pagesWith.get(c).size }));
  out[id] = { selector: entry.selector, selectorClasses: [...selectorClasses], total, pages: entry.pages.length, unanimous, nearly };
  console.log(`${id.padEnd(22)} узлов ${String(total).padStart(3)} · единогласных классов ${String(unanimous.length).padStart(2)} · почти ${nearly.length}`);
}
await browser.close();
fs.writeFileSync(path.join(d, "invariants.json"), JSON.stringify(out, null, 1), "utf8");

// Сводка: где голосов много — там кандидат в правило крепче.
const strong = Object.entries(out).filter(([, v]) => v.total >= 20 && v.unanimous.length);
console.log(`\nЗаписей с 20+ узлами и единогласными классами: ${strong.length}`);
for (const [id, v] of strong.sort((a, b) => b[1].total - a[1].total)) {
  console.log(`  ${id.padEnd(22)} ${String(v.total).padStart(3)}/${v.total} · ${v.unanimous.length} классов · исключений-кандидатов ${v.nearly.length}`);
}
