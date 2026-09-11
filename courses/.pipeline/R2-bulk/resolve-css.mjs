// Резолв классов компонента в правила прод-CSS.
// Читает 22 файла корпуса настоящим парсером (postcss), собирает для каждого
// класса все его объявления с указанием media-условия и файла-источника.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(toolDir, "../..");
const cssDir = path.join(pkg, "evidence/source/production/css");

const files = [];
for (const sub of ["inline", "external"]) {
  const d = path.join(cssDir, sub);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".css"))) files.push(path.join(d, f));
}

// class -> [{selector, media, decls, file}]
const index = new Map();
const add = (cls, rec) => {
  if (!index.has(cls)) index.set(cls, []);
  const list = index.get(cls);
  const key = rec.media + "|" + rec.selector + "|" + rec.decls;
  if (!list.some((r) => r.media + "|" + r.selector + "|" + r.decls === key)) list.push(rec);
};

for (const file of files) {
  const root = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /^(keyframes|-webkit-keyframes)$/.test(rule.parent.name)) return;
    let media = "";
    for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) {
      media = `@${p.name} ${p.params}` + (media ? " / " + media : "");
    }
    const decls = rule.nodes.filter((n) => n.type === "decl").map((d) => `${d.prop}:${d.value}${d.important ? " !important" : ""}`).join(";");
    if (!decls) return;
    const classes = new Set();
    try {
      selectorParser((sel) => sel.walkClasses((c) => classes.add(c.value))).processSync(rule.selector);
    } catch { return; }
    for (const c of classes) add(c, { selector: rule.selector, media, decls, file: path.basename(file) });
  });
}

const ids = process.argv.slice(2);
const extractedDir = path.join(toolDir, "extracted");
const outDir = path.join(toolDir, "resolved");
fs.mkdirSync(outDir, { recursive: true });
const targets = ids.length ? ids : fs.readdirSync(extractedDir).map((f) => f.replace(/\.json$/, ""));

let totalMissing = 0;
for (const id of targets) {
  const rec = JSON.parse(fs.readFileSync(path.join(extractedDir, `${id}.json`), "utf8"));
  const inst = rec.instances[0];
  if (!inst) continue;
  const resolved = {}, missing = [];
  for (const c of inst.classes) {
    const hit = index.get(c);
    if (hit && hit.length) resolved[c] = hit; else missing.push(c);
  }
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify({ id, resolved, missing }, null, 1), "utf8");
  totalMissing += missing.length;
  console.log(`${id.padEnd(22)} ${String(Object.keys(resolved).length).padStart(3)} разрешено, ${String(missing.length).padStart(3)} без правила${missing.length ? "  " + missing.slice(0, 6).join(" ") : ""}`);
}
console.log(`\nКорпус: ${files.length} файлов, ${index.size} классов с правилами. Без правила суммарно: ${totalMissing}.`);
