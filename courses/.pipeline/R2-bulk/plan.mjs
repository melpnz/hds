import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
import postcss from "postcss"; import selectorParser from "postcss-selector-parser";
const d = path.dirname(fileURLToPath(import.meta.url)); const pkg = path.resolve(d, "../..");
// что уже объявлено в ui/
const declared = new Set();
const walkUi = (dir) => { for (const f of fs.readdirSync(dir, {withFileTypes:true})) {
  const p = path.join(dir, f.name);
  if (f.isDirectory()) { walkUi(p); continue; }
  if (!f.name.endsWith(".css")) continue;
  postcss.parse(fs.readFileSync(p, "utf8"), {from:p}).walkRules((r) => {
    try { selectorParser((s)=>s.walkClasses((c)=>declared.add(c.value))).processSync(r.selector); } catch {}
  });
}};
walkUi(path.join(pkg, "ui"));
const resDir = path.join(d, "resolved");
const all = new Map(); // class -> Set(components)
const perComp = {};
for (const f of fs.readdirSync(resDir)) {
  const r = JSON.parse(fs.readFileSync(path.join(resDir, f), "utf8"));
  perComp[r.id] = r;
  for (const c of Object.keys(r.resolved)) { if (!all.has(c)) all.set(c, new Set()); all.get(c).add(r.id); }
}
const need = [...all.keys()].filter((c) => !declared.has(c));
const shared = need.filter((c) => all.get(c).size > 1);
const unique = need.filter((c) => all.get(c).size === 1);
const product = need.filter((c) => !/^(sm|md|lg|xl)?:?[a-z-]*[-[]/.test(c) === false ? false : true);
console.log(`Уже объявлено в ui/: ${declared.size} классов`);
console.log(`Нужно добавить: ${need.length} (общих между компонентами ${shared.length}, уникальных ${unique.length})`);
const byMedia = new Map();
for (const c of need) for (const id of all.get(c)) { for (const rec of perComp[id].resolved[c]) byMedia.set(rec.media||"(без @media)", (byMedia.get(rec.media||"(без @media)")||0)+0); }
console.log(`\nТоп-20 самых общих классов:`);
for (const c of shared.sort((a,b)=>all.get(b).size-all.get(a).size).slice(0,20)) console.log(`  ${c.padEnd(28)} ${all.get(c).size} компонентов`);
fs.writeFileSync(path.join(d,"plan.json"), JSON.stringify({declared:[...declared], need, shared, unique}, null, 1));
