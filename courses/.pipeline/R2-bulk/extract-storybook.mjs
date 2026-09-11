// Извлечение разметки storybook-only компонентов и резолв их правил.
//
// Источник — evidence/source/storybook/: снимок Storybook, скопированный
// в пакет из локальной выгрузки _sources/courses/. До этого шага папка
// evidence/source/storybook/ была пустой, и пакет ссылался на снимок,
// которого в нём нет.
//
// Правила ищутся сначала в прод-корпусе (многие утилиты общие и уже подняты
// в ui/), затем в CSS самой сборки Storybook. Откуда взято правило —
// записывается: это разные источники, и смешивать их нельзя.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const sbDir = path.join(pkg, "evidence/source/storybook");

// id реестра → story, из которой берётся разметка
const TARGETS = [
  { id: "checkbox", story: "common-basecheckbox--base-checkbox-story", name: "BaseCheckbox" },
  { id: "switch", story: "common-baseswitch--base-switch-story", name: "BaseSwitch" },
  { id: "tile-filter", story: "common-basefilterwithimage--default", name: "BaseFilterWithImage" },
  { id: "multi-select", story: "forms-multiselect--base-story", name: "MultiSelect" },
];

// ---------- индекс правил ----------
function indexCss(dirs, origin) {
  const index = new Map();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".css"))) {
      const file = path.join(dir, f);
      postcss.parse(fs.readFileSync(file, "utf8"), { from: file }).walkRules((rule) => {
        if (rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
        let media = "";
        for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) {
          media = `@${p.name} ${p.params}` + (media ? " / " + media : "");
        }
        const decls = rule.nodes.filter((n) => n.type === "decl")
          .map((x) => `${x.prop}:${x.value}${x.important ? " !important" : ""}`).join(";");
        if (!decls) return;
        const classes = new Set();
        try { selectorParser((sel) => sel.walkClasses((c) => classes.add(c.value))).processSync(rule.selector); } catch { return; }
        for (const c of classes) {
          if (!index.has(c)) index.set(c, []);
          index.get(c).push({ selector: rule.selector, media, decls, file: f, origin });
        }
      });
    }
  }
  return index;
}
const prodIndex = indexCss([
  path.join(pkg, "evidence/source/production/css/inline"),
  path.join(pkg, "evidence/source/production/css/external"),
], "production");
const sbIndex = indexCss([path.join(sbDir, "css")], "storybook");

// ---------- разметка ----------
const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1200, height: 800 } });
const page = await ctx.newPage();

const out = {};
for (const t of TARGETS) {
  const file = path.join(sbDir, "rendered", `${t.story}.html`);
  if (!fs.existsSync(file)) { console.log(`${t.id}: нет ${t.story}.html`); continue; }
  await page.goto("file:///" + file.replaceAll("\\", "/"));
  const data = await page.evaluate(() => {
    // Обёртка Storybook — <div><div class="p-8 …">…</div><div id="context-menu-target">.
    // Берётся первый значимый узел внутри неё, а не сама обёртка: p-8 и flex
    // на ней принадлежат стенду, а не компоненту.
    const root = document.getElementById("context-menu-target")?.previousElementSibling
      || document.body.firstElementChild;
    // Стенд Storybook всегда несёт p-8 (а иногда и раскладку под несколько
    // образцов: flex flex-col gap-3). Пока класс стенда на узле — спускаемся
    // ниже: иначе в компонент уезжают отступы и раскладка витрины Storybook,
    // как это случилось с BaseSwitch в первой редакции.
    let node = root;
    while (node && node.firstElementChild && node.classList && node.classList.contains("p-8")) {
      node = node.firstElementChild;
    }
    if (node && node.children.length === 1 && !node.className) node = node.firstElementChild;
    if (!node) return null;
    const classes = new Set();
    const walk = (n) => { if (n.classList) for (const c of n.classList) classes.add(c); for (const ch of n.children) walk(ch); };
    walk(node);
    return { html: node.outerHTML, tag: node.tagName.toLowerCase(), classes: [...classes], descendants: node.querySelectorAll("*").length };
  });
  if (!data) { console.log(`${t.id}: узел не найден`); continue; }

  const resolved = {}, missing = [];
  let fromProd = 0, fromSb = 0;
  for (const c of data.classes) {
    const p = prodIndex.get(c), s = sbIndex.get(c);
    if (p) { resolved[c] = p; fromProd++; }
    else if (s) { resolved[c] = s; fromSb++; }
    else missing.push(c);
  }
  out[t.id] = { ...t, ...data, resolved, missing, fromProd, fromSb };
  console.log(`${t.id.padEnd(14)} ${data.tag.padEnd(7)} ${String(data.classes.length).padStart(3)} классов · ${String(data.descendants).padStart(2)} узлов · правила: прод ${fromProd}, storybook ${fromSb}, нет ${missing.length}${missing.length ? " → " + missing.slice(0, 5).join(" ") : ""}`);
}
await browser.close();
fs.writeFileSync(path.join(d, "storybook-only.json"), JSON.stringify(out, null, 1), "utf8");
