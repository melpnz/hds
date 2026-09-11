// Сборка спецификаций components/<category>/<id>.md и секций витрины
// из уже снятых доказательств: перепись селекторов, прод-DOM, корпус CSS,
// notes реестра. Инструмент ничего не сочиняет — он перекладывает измеренное
// в форму шаблона .claude/guide/spec-template.md и явно называет то, чего
// в bulk-проходе нет (прозаические разделы, правила, состояния).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const SKIP = new Set(["carousel"]);

const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const components = manifest.components || manifest.entries;
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8"));
const pagesDir = path.join(pkg, "evidence/source/production/pages");
// Настоящие computed — из снимка живого прода, не из локального dom.html.
const computedRoots = JSON.parse(fs.readFileSync(path.join(d, "computed.json"), "utf8"));
const SHOW_STYLES = ["display", "flex-direction", "width", "height", "background-color", "color",
  "font-size", "font-weight", "line-height", "border", "border-radius", "padding", "gap",
  "position", "overflow", "text-align", "box-shadow"];

const pageUrl = (id) => {
  const p = path.join(pagesDir, id, "meta.json");
  try { return JSON.parse(fs.readFileSync(p, "utf8")).url; } catch { return null; }
};

// Локализация ссылок на ассеты: спрайты и продуктовые SVG — в ui/assets/,
// пользовательское и партнёрское содержимое — в заглушку витрины.
const ASSET_MAP = [
  [/(?:\/courses-web\/images\/sprites\/)?sprite\.svg(?:\?[^"#]*)?#/g, "../ui/assets/icons/sprite.svg#"],
  [/(?:\/courses-web\/images\/sprites\/)?social-v3\.1\.svg(?:\?[^"#]*)?#/g, "../ui/assets/icons/social-v3.1.svg#"],
  [/(?:\/courses-web\/images\/sprites\/)?external-profile\.svg(?:\?[^"#]*)?#/g, "../ui/assets/icons/external-profile.svg#"],
];
const DIRECT = {
  "/courses-web/images/avatars/logo.svg": "../ui/assets/images/logo.svg",
  "https://assets.habr.com/courses-web/courses-web/images/avatars/user_avatar_2.svg": "../ui/assets/images/user_avatar_2.svg",
  "https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg": "../ui/assets/icons/green-partner-icon.svg",
  "https://assets.habr.com/courses-web/courses-web/images/courses/code_2.svg": "../ui/assets/images/code_2.svg",
};
const ASSET_RE = /((?:xlink:href|href|src)\s*=\s*")([^"]*\.(?:svg|png|jpe?g|gif|webp|ico)[^"]*)(")/gi;

function localizeAssets(html) {
  const placeheld = new Set();
  const out = html.replace(ASSET_RE, (m, pre, ref, post) => {
    if (DIRECT[ref]) return pre + DIRECT[ref] + post;
    let v = ref;
    for (const [re, to] of ASSET_MAP) v = v.replace(re, to);
    if (v !== ref && v.startsWith("../ui/assets/")) return pre + v + post;
    placeheld.add(ref);
    return pre + "../ui/assets/images/content-placeholder.svg" + post;
  });
  return { html: out, placeheld: [...placeheld] };
}

const stripScope = (h) => h.replace(/\s+data-v-[0-9a-f]+(?:="")?/g, "");

function indent(html, pad) {
  // Мягкий перенос длинной строки разметки по границам тегов, чтобы витрина
  // читалась. Содержимое не меняется — только пробелы между тегами верхнего
  // уровня, которые для inline-контекста незначимы внутри блочных узлов.
  return html.split("\n").map((l) => pad + l).join("\n");
}

const first = (s, n = 260) => {
  if (!s) return null;
  const cut = s.split(/(?<=[.;])\s/)[0];
  return (cut.length > n ? cut.slice(0, n).replace(/\s+\S*$/, "") + "…" : cut);
};

const CATEGORY_TITLE = {
  "data-display": "Отображение данных", actions: "Действия", forms: "Формы",
  navigation: "Навигация", collections: "Коллекции", layout: "Раскладка",
  feedback: "Обратная связь", overlays: "Оверлеи", "frame-modules": "Модули оболочки",
  entities: "Сущности",
};

// node gen-specs.mjs [id …] — только эти записи. Без аргументов проход
// переписывает спецификации всех production-записей не в complete, и прозу
// (gen-prose.mjs) у них пришлось бы собирать заново; с аргументами
// results.json дополняется, а не переписывается.
const only = process.argv.slice(2);
const results = [];
for (const c of components) {
  if (only.length && !only.includes(c.id)) continue;
  if (SKIP.has(c.id) || c.status === "complete" || c.sourceScope !== "production") continue;
  const exPath = path.join(d, "extracted", `${c.id}.json`);
  const rsPath = path.join(d, "resolved", `${c.id}.json`);
  if (!fs.existsSync(exPath) || !fs.existsSync(rsPath)) continue;
  const ex = JSON.parse(fs.readFileSync(exPath, "utf8")).instances[0];
  const rs = JSON.parse(fs.readFileSync(rsPath, "utf8"));
  if (!ex) continue;

  const censusEntry = (Array.isArray(census.selectors[c.id]) ? census.selectors[c.id] : [census.selectors[c.id]])[0];
  const rootClasses = [...(censusEntry.selector.matchAll(/\.((?:[\w-]|\\.)+)/g))].map((m) => m[1].replace(/\\/g, ""));
  // Корнем может быть только класс, у которого есть правило: METHOD §6.5
  // требует существующего CSS root, а классы без объявления (их в разметке
  // продукта хватает — см. «Ограничения» спецификаций) корнем не являются.
  const cssRoots = rootClasses.filter((x) => ex.classes.includes(x) && !rs.missing.includes(x));
  if (!cssRoots.length) { results.push({ id: c.id, skipped: "нет корневого класса в снятом DOM" }); continue; }

  const cleaned = stripScope(ex.html);
  const { html: showcaseHtml, placeheld } = localizeAssets(cleaned);
  const cssFiles = [...new Set(Object.values(rs.resolved).flat().map((r) => r.file))].sort();

  results.push({ c, ex, rs, censusEntry, cssRoots, cleaned, showcaseHtml, placeheld, cssFiles });
}

// ---------- спецификации ----------
let written = 0;
for (const r of results) {
  if (r.skipped) continue;
  const { c, ex, rs, censusEntry, cssRoots, cleaned, placeheld, cssFiles } = r;
  const dir = path.join(pkg, "components", c.category);
  fs.mkdirSync(dir, { recursive: true });
  const specRel = `${c.category}/${c.id}.md`;

  const limits = [];
  if (rs.missing.length) {
    limits.push(`**Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: ${rs.missing.map((x) => "`" + x + "`").join(", ")}. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В \`ui/\` они не заводятся.`);
  }
  if (placeheld.length) {
    limits.push(`**Заглушки содержимого.** ${placeheld.length} ссыл${placeheld.length === 1 ? "ка" : "ок"} на пользовательское и партнёрское содержимое (\`habrastorage.org\`, баннеры \`assets.habr.com\`) на витрине заменены локальной заглушкой \`ui/assets/images/content-placeholder.svg\`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.`);
  }
  if ((c.uncapturedStates || []).length) {
    limits.push(`**Не снятые состояния.** ${c.uncapturedStates.map((x) => "`" + x + "`").join(", ")} — разбор в [\`components/STATE-CAPTURE.md\`](../STATE-CAPTURE.md).`);
  }
  limits.push(`**Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе \`partial\`: вёрстка и факты есть, статья — нет. Дописывает шаг ${c.step} волны ${c.wave}.`);

  const md = `# ${c.canonicalName}${c.legacyAliases?.length ? " · " + c.legacyAliases.join(" · ") : ""}

| | |
|---|---|
| **Категория** | ${CATEGORY_TITLE[c.category] || c.category} (\`${c.category}\`) |
| **Корневой класс** | ${cssRoots.map((x) => "`" + x + "`").join(" · ")} |
| **CSS** | ${["prose", "rubrication-bar", "search-input", "select", "header-dropdown", "site-footer"].includes(c.id) ? `\`ui/components/${c.category}.css\` + утилиты \`ui/utilities-components.css\`` : "утилиты `ui/utilities-components.css`"} |
| **Живая реализация** | [\`showcase/components.html#c-${c.id}\`](../../showcase/components.html#c-${c.id}) |
| **Snapshot** | ${(c.capturedStates || []).length} из ${(c.requiredStates || []).length} состояний снято |

## Когда использовать

Компонент стоит в продукте на **${censusEntry.found} ${censusEntry.found % 10 === 1 && censusEntry.found % 100 !== 11 ? "узле" : "узлах"}**, страниц — **${censusEntry.pages.length} из 10**: ${censusEntry.pages.join(", ")}.

${c.notes ? c.notes : "_Заметки инвентаризации по этой записи нет._"}

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу ${c.step}. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним \`ui/courses.css\` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

\`\`\`html
${cleaned}
\`\`\`

## Анатомия

Дерево из снятого \`dom.html\` страницы \`${censusEntry.pages[0]}\`, фреймворк-скоуп
(\`data-v-*\`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **${ex.descendants}**
- классов в поддереве: **${ex.classes.length}**
- селектор переписи: \`${censusEntry.selector}\`

${(() => {
  const cr = computedRoots[c.id];
  if (!cr) return "Корень этой записи в снимке `computed.json` не сопоставлен — вычисленные значения\nне приводятся. Сопоставление ведётся по совпадению тега и всех классов селектора\nпереписи; здесь оно не сошлось, и подставлять вместо него значения браузера\nпо умолчанию нельзя.";
  const rows = SHOW_STYLES.filter((k) => cr.styles[k] !== undefined && cr.styles[k] !== "")
    .map((k) => `| \`${k}\` | \`${cr.styles[k]}\` |`).join("\n");
  return `Вычисленные значения корня — из снимка живого продакшена
(\`evidence/source/production/pages/${cr.page}/computed.json\`, ширина 1440,
узел \`${cr.path}\`), ${cr.box?.w && cr.box?.h ? `коробка **${cr.box.w}×${cr.box.h}**` : `коробка в снимке **${cr.box?.w}×${cr.box?.h}** — узел в момент съёмки не был разложен (скрытый или свёрнутый предок), объявленные размеры — **${cr.styles.width || "?"} × ${cr.styles.height || "?"}**`}:

| свойство | значение |
|---|---|
${rows}`;
})()}

## Состояния

Словарь и требуемость — [\`components/STATES.md\`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [\`components/STATE-CAPTURE.md\`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
${(c.requiredStates || []).map((st) => {
  if ((c.capturedStates || []).includes(st)) return `| \`${st}\` | снято с продакшена (R1-02) | снятость доказана в \`STATE-CAPTURE.md\`; ${st === "default" ? "разметка и правила — в разделах выше" : "отдельного примера в этой спецификации нет — его ставит шаг " + c.step} |`;
  if ((c.normativeStates || []).includes(st)) return `| \`${st}\` | дописано нормативом | \`ui/state-contract.css\` — не снимок продукта, а норматив пакета |`;
  return `| \`${st}\` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — \`STATE-CAPTURE.md\` |`;
}).join("\n") || "| — | — | у записи нет требуемых состояний |"}

## Ограничения

${limits.map((x) => "- " + x).join("\n\n")}

## Источники

**Production.** ${censusEntry.pages.map((p) => { const u = pageUrl(p); return u ? `[${p}](${u})` : p; }).join(" · ")}

Снятые файлы — \`evidence/source/production/pages/<страница>/dom.html\` и
\`computed.json\`; правила класса — корпус \`evidence/source/production/css\`
(${cssFiles.length} файл${cssFiles.length === 1 ? "" : cssFiles.length < 5 ? "а" : "ов"}: ${cssFiles.map((f) => "`" + f + "`").join(", ")}).

${(c.figmaEvidence || []).length ? `**Figma.** ${c.figmaEvidence.map((f) => `\`${f.sourceName}\` (${f.fileName}${f.nodeId ? ", узел " + f.nodeId : ", componentKey " + (f.componentKey || "").slice(0, 8)})${f.note ? " — " + f.note : ""}`).join("; ")}` : "**Figma.** Узел для этой записи не сопоставлен."}

${(c.storybookEvidence || []).length ? `**Storybook.** ${JSON.stringify(c.storybookEvidence)}` : "**Storybook.** Story для этой записи в снимке `_sources/courses/` нет."}

---

_Собрано bulk-проходом \`.pipeline/R2-bulk/gen-specs.mjs\` из снятых доказательств.
Числа — из \`components/selector-census.json\` (измерение браузером), правила —
из корпуса прод-CSS парсером \`postcss\`. Ни одно значение здесь не написано
от руки._
`;
  fs.writeFileSync(path.join(dir, `${c.id}.md`), md, "utf8");
  r.specRel = specRel;
  written++;
}
console.log(`Спецификаций записано: ${written}`);
const prevResults = only.length && fs.existsSync(path.join(d, "results.json"))
  ? JSON.parse(fs.readFileSync(path.join(d, "results.json"), "utf8")).filter((r) => !only.includes(r.id))
  : [];
fs.writeFileSync(path.join(d, "results.json"), JSON.stringify([...prevResults, ...results.map((r) => r.skipped ? r : ({
  id: r.c.id, category: r.c.category, name: r.c.canonicalName, specRel: r.specRel,
  cssRoots: r.cssRoots, showcaseHtml: r.showcaseHtml, placeheld: r.placeheld,
  found: r.censusEntry.found, pages: r.censusEntry.pages, selector: r.censusEntry.selector,
  notes: first(r.c.notes), descendants: r.ex.descendants, classes: r.ex.classes.length,
}))], null, 1), "utf8");
