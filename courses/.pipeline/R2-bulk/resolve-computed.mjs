// Настоящие computed-значения корня каждого компонента.
// Источник — evidence/source/production/pages/<страница>/computed.json:
// снимок вычисленных стилей живого продакшена. Открытый локально dom.html
// стилей не несёт (внешние ссылки не резолвятся), и getComputedStyle над ним
// возвращает значения по умолчанию браузера — bulk-проход на этом уже
// один раз обжёгся, поэтому измерение берётся из снимка, а не пересчитывается.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8"));

const cache = new Map();
const load = (page) => {
  if (!cache.has(page)) {
    const p = path.join(pagesDir, page, "computed.json");
    cache.set(page, fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
  }
  return cache.get(page);
};

const out = {};
let hit = 0, miss = 0;
for (const [id, raw] of Object.entries(census.selectors)) {
  const entry = (Array.isArray(raw) ? raw : [raw])[0];
  // Псевдоклассы с аргументом (`:has(> input)`) снимаются до разбора: иначе
  // разбиение по пробелам и `>` принимает содержимое скобок за последний узел
  // селектора, и тегом корня становится `input)`. Так и было у text-input.
  const bare = entry.selector.replace(/:[a-z-]+\([^)]*\)/g, "");
  const tag = /^([a-z]+)/.exec(bare.trim().split(/[\s>]+/).pop())?.[1] || null;
  const want = [...bare.matchAll(/\.((?:[\w-]|\\.)+)/g)].map((m) => m[1].replace(/\\/g, ""));
  let found = null, foundPage = null;
  for (const page of entry.pages) {
    const nodes = load(page);
    if (!nodes) continue;
    for (const n of nodes) {
      const cls = (n.classes || "").split(/\s+/).filter(Boolean);
      if (tag && n.tag !== tag) continue;
      if (!want.every((w) => cls.includes(w))) continue;
      found = n; foundPage = page; break;
    }
    if (found) break;
  }
  if (found) { out[id] = { page: foundPage, path: found.path, tag: found.tag, classes: found.classes, styles: found.styles, box: found.box }; hit++; }
  else { miss++; }
}
fs.writeFileSync(path.join(d, "computed.json"), JSON.stringify(out, null, 1), "utf8");
console.log(`computed корней найдено: ${hit}, не найдено: ${miss}`);
for (const [id, v] of Object.entries(out).slice(0, 6)) {
  console.log(`  ${id.padEnd(20)} ${v.page} ${String(v.box?.w)}×${v.box?.h} ${v.styles.display} bg=${v.styles["background-color"]}`);
}
