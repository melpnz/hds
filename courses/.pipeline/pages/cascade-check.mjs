// Пары классов, чей каскад в ui/ разошёлся с продуктом.
//
// Внутри ui/utilities-components.css правила стоят в порядке корпуса
// (gen-utilities.mjs), но слой разложен по нескольким файлам, и между
// файлами порядок задаёт ui/courses.css. Если на одном узле стоят класс из
// раннего файла и класс из позднего, оба задают одно свойство при одном
// условии, а в корпусе продукта они идут в обратном порядке, — победитель в
// пакете не тот, что в продукте. Так нашлось `m-0 mx-auto` у заголовка hero:
// `.mx-auto` в ui/layout.css, `.m-0` — в utilities-components.css.
//
// Узлы берутся из всей разметки витрины (showcase/*.html и showcase/pages/*.html),
// правила — из ui/ по порядку @import в courses.css, порядок продукта — первое
// появление правила класса в корпусе evidence/source/production/css.
//
// Запуск: node .pipeline/pages/cascade-check.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const ui = path.join(pkg, "ui");
// Только строки @import: в комментариях courses.css те же имена встречаются
// ещё раз, и первая редакция считала ui/layout.css подключённым дважды.
const order = [...fs.readFileSync(path.join(ui, "courses.css"), "utf8").matchAll(/^@import url\("([^"]+)"\)/gm)].map((m) => m[1]);

// Правила, у которых селектор — один класс (с псевдоклассом варианта или без):
// именно такие утилиты сталкиваются на узле.
const single = (sel) => {
  let cls = null, ok = true;
  try {
    selectorParser((s) => {
      if (s.nodes.length !== 1) { ok = false; return; }
      s.nodes[0].each((n) => { if (n.type === "class") { if (cls) ok = false; cls = n.value; } else if (n.type !== "pseudo") ok = false; });
    }).processSync(sel);
  } catch { ok = false; }
  return ok ? cls : null;
};
const propsOf = (rule) => rule.nodes.filter((n) => n.type === "decl").map((n) => n.prop.replace(/^margin$/, "margin-*").replace(/^padding$/, "padding-*"));
const mediaOf = (rule) => { let m = ""; for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) m = `@${p.name} ${p.params}` + m; return m; };
const expand = (p) => (p === "margin-*" ? ["margin-top", "margin-right", "margin-bottom", "margin-left"] : p === "padding-*" ? ["padding-top", "padding-right", "padding-bottom", "padding-left"] : p === "margin-left" || p === "margin-right" || p === "margin-top" || p === "margin-bottom" || p.startsWith("padding-") ? [p] : [p]);

const pkgRules = new Map(); // class -> [{file, idx, media, props}]
let idx = 0;
order.forEach((f, fi) => {
  const p = path.join(ui, f);
  if (!fs.existsSync(p)) return;
  postcss.parse(fs.readFileSync(p, "utf8")).walkRules((r) => {
    const c = single(r.selector);
    idx++;
    if (!c) return;
    if (!pkgRules.has(c)) pkgRules.set(c, []);
    const pseudo = (r.selector.match(/:(?!:)[a-z-]+/g) || []).length;
    const important = r.nodes.filter((n) => n.type === "decl").every((n) => n.important);
    pkgRules.get(c).push({ file: f, fi, idx, media: mediaOf(r), props: propsOf(r).flatMap(expand), vals: Object.fromEntries(r.nodes.filter((n) => n.type === "decl").flatMap((n) => expand(n.prop.replace(/^margin$/, "margin-*").replace(/^padding$/, "padding-*")).map((k) => [k, n.value]))), rank: (important ? 100 : 0) + pseudo });
  });
});

// Действует последнее объявление класса при том же условии и той же
// специфичности — ранние (например, .mx-auto в ui/layout.css, повторённый
// в utilities-components.css ради каскада) в сравнение не идут.
for (const [c, rules] of pkgRules) {
  const last = new Map();
  for (const r of rules) last.set(r.media + "|" + r.rank, r);
  pkgRules.set(c, [...last.values()]);
}

const corpusPos = new Map();
let cp = 0;
for (const sub of ["inline", "external"]) {
  const dir = path.join(pkg, "evidence/source/production/css", sub);
  for (const f of fs.readdirSync(dir).sort()) {
    postcss.parse(fs.readFileSync(path.join(dir, f), "utf8")).walkRules((r) => {
      cp++;
      const c = single(r.selector.replace(/\[data-v-[0-9a-f]+\]/g, ""));
      if (c && !corpusPos.has(c + "|" + mediaOf(r))) corpusPos.set(c + "|" + mediaOf(r), cp);
    });
  }
}

const files = ["showcase/components.html", "showcase/pages.html", ...fs.readdirSync(path.join(pkg, "showcase/pages")).filter((f) => f.endsWith(".html")).map((f) => "showcase/pages/" + f)];
const conflicts = new Map();
for (const f of files) {
  const html = fs.readFileSync(path.join(pkg, f), "utf8");
  for (const m of html.matchAll(/\sclass="([^"]+)"/g)) {
    const cls = [...new Set(m[1].replace(/&amp;/g, "&").split(/\s+/))].filter((c) => pkgRules.has(c));
    for (let i = 0; i < cls.length; i++) for (let j = i + 1; j < cls.length; j++) {
      for (const a of pkgRules.get(cls[i])) for (const b of pkgRules.get(cls[j])) {
        // Специфичность и !important решают раньше порядка: пары, где они
        // различаются, от порядка файлов не зависят.
        if (a.media !== b.media || a.fi === b.fi || a.rank !== b.rank) continue;
        // Одинаковое значение (m-auto и mx-auto — оба auto): победитель неважен.
        const shared = a.props.filter((x) => b.props.includes(x) && a.vals[x] !== b.vals[x]);
        if (!shared.length) continue;
        const pa = corpusPos.get(cls[i] + "|" + a.media), pb = corpusPos.get(cls[j] + "|" + b.media);
        if (pa == null || pb == null) continue;
        const pkgWinner = a.idx > b.idx ? cls[i] : cls[j];
        const prodWinner = pa > pb ? cls[i] : cls[j];
        if (pkgWinner === prodWinner) continue;
        const key = `${prodWinner} должен побеждать ${pkgWinner === cls[i] ? cls[i] : cls[j]} (${shared.join(", ")}${a.media ? " · " + a.media : ""}) — в пакете ${pkgWinner} из ${pkgWinner === cls[i] ? a.file : b.file} позже ${prodWinner} из ${prodWinner === cls[i] ? a.file : b.file}`;
        conflicts.set(key, (conflicts.get(key) || 0) + 1);
      }
    }
  }
}
console.log(`пар классов с обратным каскадом: ${conflicts.size}`);
for (const [k, n] of [...conflicts].sort((x, y) => y[1] - x[1])) console.log(`  ×${n} ${k}`);
