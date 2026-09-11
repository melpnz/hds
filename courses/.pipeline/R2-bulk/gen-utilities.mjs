// Сборка ui/utilities-components.css: утилитарные классы, которые поднимает
// вёрстка компонентов bulk-прохода. Правила берутся дословно из корпуса
// evidence/source/production/css (22 файла), разобранного postcss.
// Инструмент ничего не сочиняет: у каждого класса — только те объявления,
// которые стоят в продукте, со всеми вариантами и @media-условиями.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");

// Библиотечный слой Swiper в ui/ не поднимается — как и --swiper-theme-color
// (решение R0-02). Компоненты, которые без него не собрать, в этот проход не идут.
const SWIPER = /^(swiper|banner-swiper)/;
const SKIP_COMPONENTS = new Set(["carousel"]);

// Собственный выход из базы «уже объявлено» исключается: иначе повторный
// прогон видит прошлую свою выдачу как чужой слой и не пишет ничего.
const SELF = path.join(pkg, "ui/utilities-components.css");
const declared = new Set();
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { walk(p); continue; }
    if (!f.name.endsWith(".css") || p === SELF) continue;
    postcss.parse(fs.readFileSync(p, "utf8"), { from: p }).walkRules((rule) => {
      try {
        selectorParser((s) => s.walkClasses((c) => declared.add(c.value))).processSync(rule.selector);
      } catch { /* селектор не разбирается — не наш случай */ }
    });
  }
})(path.join(pkg, "ui"));

const byClass = new Map();
const users = new Map();

// Классы образцов состояний (states-markup.json) — такие же классы витрины,
// как классы блоков default, и слой обязан их нести. Первая редакция про них
// забыла, и восемь классов отключённой стрелки карусели и текущего сегмента
// оказались на витрине без правила; поймал validate-classes.
const stateClasses = new Map();
// Классы разметки, собранной вне bulk-выдачи (Button L main у модалки
// промокода, продуктовая пагинация после переклассификации), — их на витрине
// до этого не было; тот же случай: классы витрины, слой обязан их нести.
for (const [file, tag] of [["states-markup.json", ""], ["storybook-only.json", "storybook-only"], ["extra-classes.json", "extra"]]) {
  const fp = path.join(d, file);
  if (!fs.existsSync(fp)) continue;
  for (const [key, v] of Object.entries(JSON.parse(fs.readFileSync(fp, "utf8")))) {
    for (const c of v.classes || []) {
      if (!stateClasses.has(c)) stateClasses.set(c, new Set());
      stateClasses.get(c).add(tag ? `${key} (${tag})` : key);
    }
  }
}

for (const f of fs.readdirSync(path.join(d, "resolved"))) {
  const r = JSON.parse(fs.readFileSync(path.join(d, "resolved", f), "utf8"));
  if (SKIP_COMPONENTS.has(r.id)) continue;
  for (const [c, variants] of Object.entries(r.resolved)) {
    if (SWIPER.test(c) || declared.has(c)) continue;
    if (!byClass.has(c)) { byClass.set(c, new Map()); users.set(c, new Set()); }
    users.get(c).add(r.id);
    for (const rec of variants) byClass.get(c).set(rec.media + "|" + rec.selector + "|" + rec.decls, rec);
  }
}

// Порядок корпуса: позиция первого появления каждого правила и каждого
// условия @media при обходе всех файлов корпуса (инлайновые, затем внешние,
// по имени). По ней слой выстраивает группы и правила внутри групп. Первая
// редакция сортировала правила по имени класса, а группы — по ширине, и
// каскад разошёлся с продуктом дважды: `phone:flex-none` встал после
// `phone:basis-full` и сбросил ему flex-basis (поиск в шапке вылез за край
// на 320), а группа `tablet-only:` встала раньше базовых правил, и
// `grid-cols-4` перебил `tablet-only:grid-cols-3` (сетка на 768 — четыре
// колонки вместо трёх). Оба дефекта нашла сборка страницы /courses (R6-01).
const rulePos = new Map();
const mediaPos = new Map();
let posCounter = 0;

// Правила для классов образцов состояний берутся из того же корпуса.
{
  const index = new Map();
  for (const sub of ["inline", "external"]) {
    const dir = path.join(pkg, "evidence/source/production/css", sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".css")).sort()) {
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
        posCounter++;
        const rk = media + "|" + rule.selector;
        if (!rulePos.has(rk)) rulePos.set(rk, posCounter);
        if (!mediaPos.has(media)) mediaPos.set(media, posCounter);
        const classes = new Set();
        try { selectorParser((sel) => sel.walkClasses((c) => classes.add(c.value))).processSync(rule.selector); } catch { return; }
        for (const c of classes) {
          if (!index.has(c)) index.set(c, []);
          index.get(c).push({ selector: rule.selector, media, decls, file: f });
        }
      });
    }
  }
  for (const [c, keys] of stateClasses) {
    if (SWIPER.test(c) || declared.has(c)) continue;
    const hit = index.get(c);
    if (!hit) continue;
    if (!byClass.has(c)) { byClass.set(c, new Map()); users.set(c, new Set()); }
    for (const k of keys) users.get(c).add(k);
    for (const rec of hit) byClass.get(c).set(rec.media + "|" + rec.selector + "|" + rec.decls, rec);
  }
}

const groups = new Map();
for (const [cls, variants] of byClass) {
  for (const rec of variants.values()) {
    const key = rec.media || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ cls, ...rec });
  }
}
// Базовые правила — первыми, условия @media — в порядке первого появления в
// корпусе; правила внутри группы — в порядке корпуса. Правило, которого в
// обходе нет (не должно случаться), встаёт в конец группы по имени класса.
const mediaOrder = (m) => (!m ? -1 : mediaPos.get(m) ?? Infinity);
const posOf = (r) => rulePos.get((r.media || "") + "|" + r.selector) ?? Infinity;

const total = byClass.size;
const mediaKeys = [...groups.keys()].sort((a, b) => mediaOrder(a) - mediaOrder(b));
let out = `/* =========================================================================
   COURSES · UTILITIES / COMPONENTS
   =========================================================================
   Утилитарные классы, которые поднимает вёрстка компонентов. Слой отделён от
   ui/utilities.css намеренно: тот принят на R0-04 и держит десять текстовых
   утилит из GAP-9 typography.md, его состав и число сторожит validate-counts.
   Этот файл заводит bulk-проход по компонентам и растёт вместе с ними.

   Правила взяты дословно из корпуса evidence/source/production/css —
   10 инлайновых <style> и 12 внешних файлов сборки, разобранных postcss
   (.pipeline/R2-bulk/gen-utilities.mjs). Ни одно объявление здесь не написано
   от руки: если класс объявлен в продукте несколько раз, ниже стоят все его
   объявления в порядке корпуса, включая вендорные дубли и @media.

   Классов: ${total}. Условий @media: ${mediaKeys.filter(Boolean).length}.

   Чего здесь нет:
   - библиотечный слой Swiper (.swiper*, .banner-swiper) — он объявлен чанком
     библиотеки, а не продуктом, как и --swiper-theme-color (решение R0-02);
   - классы, уже объявленные в ui/tokens.css, foundations.css, layout.css,
     utilities.css, state-contract.css — дублей слой не заводит;
   - переменные --tw-* — их объявляют сами правила Tailwind ниже, продуктовыми
     токенами они не являются.
   ========================================================================= */
`;

for (const mk of mediaKeys) {
  const rules = groups.get(mk).sort((a, b) => posOf(a) - posOf(b) || a.cls.localeCompare(b.cls));
  if (mk) out += `\n${mk.split(" / ")[0]} {\n`;
  const ind = mk ? "  " : "";
  let lastCls = null;
  for (const r of rules) {
    if (r.cls !== lastCls) {
      out += `${mk ? "" : "\n"}${ind}/* ${r.cls} — ${users.get(r.cls).size} комп. */\n`;
      lastCls = r.cls;
    }
    out += `${ind}${r.selector}{${r.decls}}\n`;
  }
  if (mk) out += `}\n`;
}

fs.writeFileSync(path.join(pkg, "ui/utilities-components.css"), out, "utf8");
console.log(`ui/utilities-components.css: ${total} классов, ${mediaKeys.length} групп, ${out.length} байт`);
