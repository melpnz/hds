// Блок «Размеры, радиусы, шрифт и тени макета против продукта» в разделе
// «Расхождения источников».
//
// В продукте такие значения живут не в токенах, а в утилитах (px-4,
// rounded-xl, text-small), поэтому сверка идёт с правилами классов в ui/ —
// они подняты дословно из корпуса прод-CSS. Соответствие «переменная
// макета → класс продукта» задано здесь явно, а сами числа читаются из обоих
// слоёв при каждой сборке: вписанное руками число стало бы вторым носителем.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");

// --- слой макета --------------------------------------------------------
const fig = new Map();
postcss.parse(fs.readFileSync(path.join(pkg, "ui/tokens-figma.css"), "utf8")).walkRules((r) => {
  if (r.selector.trim() !== ":root") return;
  r.each((n) => { if (n.type === "decl") fig.set(n.prop, n.value.trim()); });
});

// --- правила классов продукта: только селекторы из одного класса ----------
const decls = new Map(); // class -> Map(prop -> value)
const files = [
  ...fs.readdirSync(path.join(pkg, "ui")).filter((f) => f.endsWith(".css")).map((f) => path.join(pkg, "ui", f)),
];
for (const f of files) {
  postcss.parse(fs.readFileSync(f, "utf8")).walkRules((r) => {
    if (r.parent?.type === "atrule") return;
    let sels;
    try { sels = selectorParser().astSync(r.selector).nodes; } catch { return; }
    for (const sel of sels) {
      const nodes = sel.nodes.filter((n) => n.type !== "comment");
      if (nodes.length !== 1 || nodes[0].type !== "class") continue;
      const c = nodes[0].value;
      if (!decls.has(c)) decls.set(c, new Map());
      for (const n of r.nodes) if (n.type === "decl") decls.get(c).set(n.prop, n.value.trim());
    }
  });
}

const px = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "0") return 0;
  let m = /^(-?[\d.]+)px$/.exec(s); if (m) return +m[1];
  m = /^(-?[\d.]+)rem$/.exec(s); if (m) return +m[1] * 16;
  return null;
};
const figPx = (name) => px(fig.get(name));
const prodPx = (cls, prop) => px(decls.get(cls)?.get(prop));
const fmt = (n) => (n == null ? "—" : `${n}px`);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const rows = []; // {family, what, figName, figVal, prodCls, prodVal, verdict, note}
const add = (family, what, figName, figVal, prodCls, prodVal, verdict, note = "") =>
  rows.push({ family, what, figName, figVal, prodCls, prodVal, verdict, note });
const cmp = (a, b) => (a != null && b != null && a === b ? "совпадает" : "расходится");

// 1. Шкала отступов: шаг макета xN ↔ шаг Tailwind N продукта.
const STEP_PROPS = [["gap", "gap"], ["px", "padding-left"], ["py", "padding-top"], ["p", "padding"], ["pt", "padding-top"], ["pb", "padding-bottom"]];
for (const step of ["0_5", "1", "1_5", "2", "3", "4", "5", "6", "8", "10"]) {
  const tw = step.replace("_", ".");
  const figName = `--fig-size-spacing-x${step}`;
  const hit = STEP_PROPS.map(([p, prop]) => [`${p}-${tw}`, prop]).find(([c, prop]) => prodPx(c, prop) != null);
  const pv = hit ? prodPx(...hit) : null;
  add("Шкала отступов", `шаг ${tw}`, figName, figPx(figName), hit ? hit[0] : "—", pv, hit ? cmp(figPx(figName), pv) : "в ui/ нет класса этого шага");
}

// 2. Радиусы.
for (const [s, cls] of [["xxs", "rounded-md"], ["xs", "rounded-lg"], ["s", "rounded-xl"], ["m", "rounded-2xl"], ["l", "rounded-3xl"], ["full", "rounded-full"]]) {
  const figName = `--fig-size-radius-${s}`;
  const fv = figPx(figName), pv = prodPx(cls, "border-radius");
  const pill = fv >= 100 && pv >= 100;
  add("Радиусы", s, figName, fv, cls, pv, pill ? "совпадает" : cmp(fv, pv), pill ? "оба больше половины любой высоты — пилюля" : "");
}

// 3. Типографская шкала: размер и интерлиньяж макета ↔ класс шкалы продукта.
for (const [size, lh, cls] of [
  ["--fig-font-size-body-s", "--fig-font-line-height-body-m", "text-micro"],
  ["--fig-font-size-body-m", "--fig-font-line-height-body-l", "text-small"],
  ["--fig-font-size-body-l", "--fig-font-line-height-display-s", "text-default"],
  ["--fig-font-size-display-s", "--fig-font-line-height-display-s", "text-h4"],
  ["--fig-font-size-display-m", "--fig-font-line-height-display-m", "text-h3"],
  ["--fig-font-size-display-l", "--fig-font-line-height-display-l", "text-h2"],
  ["--fig-font-header-page-size", "--fig-font-header-page-line-height", "text-h1-mobile"],
  ["--fig-font-header-page-size", "--fig-font-header-page-line-height", "text-h1"],
]) {
  const f = `${figPx(size)} / ${figPx(lh)}`;
  const p = `${prodPx(cls, "font-size")} / ${prodPx(cls, "line-height")}`;
  const same = figPx(size) === prodPx(cls, "font-size") && figPx(lh) === prodPx(cls, "line-height");
  add("Шрифт", cls === "text-h1" ? "заголовок страницы, десктоп" : cls === "text-h1-mobile" ? "заголовок страницы" : size.replace("--fig-font-size-", ""), `${size} · ${lh.replace("--fig-font-", "")}`, f, cls, p,
    same ? "совпадает" : "расходится", cls === "text-h1" ? "известно: docs/guide/typography.md — макет держит 30 / 34 и на десктопе, продукт на десктопе даёт 44 / 48" : "");
}
{
  const fv = figPx("--fig-font-letter-spacing-headers"), pv = prodPx("text-h4", "letter-spacing");
  add("Шрифт", "трекинг заголовков", "--fig-font-letter-spacing-headers", fv, "text-h1…text-h4", pv, cmp(fv, pv));
}

// 4. Элементы, у которых есть продуктовый двойник.
const EL = [
  ["Кнопка M", "падинг сверху и снизу", "--fig-elements-button-m-padding-top-bottom", "py-2", "padding-top"],
  ["Кнопка M", "падинг слева и справа", "--fig-elements-button-m-padding-left-right", "px-4", "padding-left"],
  ["Кнопка M", "падинг слева с иконкой", "--fig-elements-button-m-padding-left-icon", "pl-2", "padding-left"],
  ["Кнопка M", "промежуток", "--fig-elements-button-m-gap", "gap-1", "gap"],
  ["Кнопка M", "радиус", "--fig-elements-button-border-radius", "rounded-xl", "border-radius"],
  ["Кнопка L", "падинг слева и справа", "--fig-elements-button-l-padding-left-right", "px-4", "padding-left"],
  ["Поле", "падинг слева и справа", "--fig-elements-input-padding-left-right", "px-3", "padding-left"],
  ["Поле", "промежуток", "--fig-elements-input-gap", "gap-x-1", "column-gap"],
  ["Поле", "радиус", "--fig-elements-input-border-radius", "rounded-xl", "border-radius"],
  ["Чип фильтра", "падинг слева и справа", "--fig-elements-tab-filter-padding-left-right", "px-3", "padding-left"],
  ["Чип фильтра", "падинг сверху и снизу", "--fig-elements-tab-filter-padding-top-bottom", "py-2", "padding-top"],
  ["Тег", "падинг сверху и снизу", "--fig-elements-tag-text-padding-top-bottom", "py-1", "padding-top"],
];
for (const [family, what, figName, cls, prop] of EL) {
  const fv = figPx(figName), pv = prodPx(cls, prop);
  add(family, what, figName, fv, cls, pv, cmp(fv, pv));
}
// Составные: высота = интерлиньяж 24 внутреннего контейнера + два падинга.
{
  const inner = 24;
  const lH = inner + 2 * figPx("--fig-elements-button-l-padding-top-bottom");
  add("Кнопка L", "высота (24 + падинги макета)", "--fig-elements-button-l-padding-top-bottom", lH, "h-12", prodPx("h-12", "height"), cmp(lH, prodPx("h-12", "height")),
    "высота одна; у продукта L падинг 8 / 16 при фиксированной высоте, у макета 12 / 20");
  const iH = inner + 2 * figPx("--fig-elements-input-padding-top-bottom");
  add("Поле", "высота (24 + падинги макета)", "--fig-elements-input-padding-top-bottom", iH, "h-[38px]", prodPx("h-[38px]", "height"), cmp(iH, prodPx("h-[38px]", "height")),
    "в продукте поле 38 в шапке и 54 в форме поиска (запись TextInput)");
  const tagLR = figPx("--fig-elements-tag-text-padding-left-right") + figPx("--fig-elements-tag-text-margin-text");
  add("Тег", "падинг слева и справа (тег + текстовый блок)", "--fig-elements-tag-text-padding-left-right + margin-text", tagLR, "px-2", prodPx("px-2", "padding-left"), cmp(tagLR, prodPx("px-2", "padding-left")));
}
// Тень Dropdown макета ↔ shadow-context-menu-dropdown продукта.
{
  const f = (i) => `0 ${fig.get(`--fig-effect-drop-shadow-${i}-y`)} ${fig.get(`--fig-effect-drop-shadow-${i}-blur`)} ${fig.get(`--fig-effect-drop-shadow-${i}-spread`)}`;
  const figShadow = `${f(2)}, ${f(1)}`;
  const prodShadow = (decls.get("shadow-context-menu-dropdown")?.get("--tw-shadow") || "").replace(/\s*var\([^)]*\)/g, "").replace(/,/g, ", ").replace(/\s+/g, " ").trim();
  const norm = (s) => s.replace(/\s+/g, " ").replace(/ ,/g, ",").trim();
  add("Тень", "эффект Dropdown, геометрия", "--fig-effect-drop-shadow-1…2-*", figShadow, "shadow-context-menu-dropdown", prodShadow,
    norm(figShadow) === norm(prodShadow) ? "совпадает" : "расходится", "цвет обеих теней — rgba(0,0,0,.05), совпал в сверке цветов");
}

// --- разметка -------------------------------------------------------------
const verdictCell = (v) => (v === "совпадает" ? "совпадает" : `<strong>${esc(v)}</strong>`);
const families = [...new Set(rows.map((r) => r.family))];
const same = rows.filter((r) => r.verdict === "совпадает").length;
const diff = rows.filter((r) => r.verdict === "расходится");
const table = families.map((fam) => rows.filter((r) => r.family === fam).map((r, i) => `        <tr>${i === 0 ? `<td rowspan="${rows.filter((x) => x.family === fam).length}">${esc(fam)}</td>` : ""}<td class="doc-table__wrap">${esc(r.what)}</td><td class="doc-table__wrap"><code>${esc(typeof r.figVal === "number" ? fmt(r.figVal) : r.figVal)}</code></td><td class="doc-table__wrap"><code>${esc(r.prodCls)}</code> <code>${esc(typeof r.prodVal === "number" ? fmt(r.prodVal) : r.prodVal ?? "—")}</code></td><td class="doc-table__wrap">${verdictCell(r.verdict)}${r.note ? `<br><small>${esc(r.note)}</small>` : ""}</td></tr>`).join("\n")).join("\n");

const block = `<!-- nonchroma:start -->
  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Размеры, радиусы, шрифт и тени макета против продукта</h5>
      <code>--fig-* против утилит ui/</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
        <span class="doc-src doc-src--figma" title="figma" aria-label="figma">F</span>
      </span>
    </div>
    <p class="doc-note"><strong>Разбор 11 сентября 2026.</strong> В продукте размеры живут не в
      токенах, а в утилитах, поэтому сверка идёт с правилами классов, поднятыми
      дословно из корпуса прод-CSS. Соответствие «переменная макета → класс
      продукта» задано в генераторе <code>.pipeline/R2-bulk/gen-nonchroma.mjs</code>,
      числа читаются из обоих слоёв при сборке. Сверено позиций — ${rows.length};
      совпали ${same}, разошлись ${diff.length}.</p>
    <p class="doc-note"><strong>Что это значит.</strong> Шкала отступов макета —
      это шкала Tailwind продукта шаг в шаг (x1 = 4px = <code>*-1</code>), радиусы
      xxs…l — ступени <code>rounded-md</code>…<code>rounded-3xl</code>, типографская
      шкала совпадает класс в класс, тень <code>Dropdown</code> — продуктовая
      <code>shadow-context-menu-dropdown</code> до пикселя. Макет и продукт
      построены на одной системе; расхождения — точечные, в размерах двух элементов
      и в заголовке страницы на десктопе.</p>
    <div style="overflow-x:auto">
    <table class="doc-table" style="width:100%">
      <thead><tr><th>семейство</th><th>что</th><th>макет</th><th>продукт</th><th>вердикт</th></tr></thead>
      <tbody>
${table}
      </tbody>
    </table>
    </div>
    <p class="doc-note"><strong>Расхождения и что с ними.</strong> ${diff.map((r) => `${esc(r.family)}, ${esc(r.what)}: макет <code>${esc(typeof r.figVal === "number" ? fmt(r.figVal) : r.figVal)}</code>, продукт <code>${esc(typeof r.prodVal === "number" ? fmt(r.prodVal) : r.prodVal)}</code>`).join("; ")}. Пакет описывает продукт: в вёрстке продуктовых записей стоят продуктовые значения, макетные — справочно в <code>ui/tokens-figma.css</code>. Figma-only записи свёрстаны по макету, и у них действуют макетные значения — например, поля шторки цены высотой 40, а не 38.</p>
  </div>
<!-- nonchroma:end -->`;

let html = fs.readFileSync(showcasePath, "utf8");
const s = html.indexOf("<!-- nonchroma:start -->");
if (s >= 0) {
  const e = html.indexOf("<!-- nonchroma:end -->", s) + "<!-- nonchroma:end -->".length;
  html = html.slice(0, s) + block + html.slice(e);
} else {
  // Сразу после блока о цветах.
  const anchor = html.indexOf("<h5>Цвета макета против продукта");
  if (anchor < 0) throw new Error("нет блока о цветах в разделе расхождений");
  const specEnd = html.indexOf("\n  </div>\n", anchor) >= 0 ? html.indexOf("\n  </div>\n", anchor) + "\n  </div>\n".length : html.indexOf("\n  </div>\r\n", anchor) + "\n  </div>\r\n".length;
  html = html.slice(0, specEnd) + block + "\n" + html.slice(specEnd);
}
fs.writeFileSync(showcasePath, html, "utf8");
console.log(`сверено ${rows.length}: совпали ${same}, разошлись ${diff.length}`);
for (const r of diff) console.log("  ≠", r.family, "·", r.what, ":", r.figVal, "vs", r.prodCls, r.prodVal);
for (const r of rows.filter((x) => x.verdict !== "совпадает" && x.verdict !== "расходится")) console.log("  ?", r.family, r.what, r.verdict);
