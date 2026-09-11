// Сборка ui/tokens-figma.css — слоя элементных переменных макета.
// Источник — figma-vars.json: выгрузка get_variable_defs по четырём узлам
// файла 02_Education-NEW. Слой отдельный и помеченный: по BRIEF §2 Figma
// в этом пакете — источник состава и вариантов, а структуру и значения
// текущего продукта даёт продакшен. Смешивать их в одном :root нельзя.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normColor } from "../../tools/color-value.mjs";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const dump = JSON.parse(fs.readFileSync(path.join(d, "figma-vars.json"), "utf8"));

// Продуктовые токены — для сверки значений, а не для слияния.
const prodCss = fs.readFileSync(path.join(pkg, "ui/tokens.css"), "utf8");
const prod = new Map();
for (const m of prodCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) prod.set(m[1], m[2].trim());
const prodByValue = new Map();
for (const [k, v] of prod) {
  // Ключ — приведённое значение: #fff и #ffffff, rgba(0,0,0,.3) и #0000004d —
  // один цвет (tools/color-value.mjs). Нецветовые значения — как были.
  const norm = normColor(v) || v.toLowerCase().replace(/\s+/g, "");
  if (!prodByValue.has(norm)) prodByValue.set(norm, []);
  prodByValue.get(norm).push(k);
}

const varName = (figmaPath) => "--fig-" + figmaPath
  .toLowerCase()
  .replace(/[/_]/g, "-")
  .replace(/,/g, "_")
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-_]/g, "")
  .replace(/-+/g, "-");

// Значение: цвет остаётся цветом, число — числом. Единицы Figma не хранит,
// поэтому размеры выписываются в px, а безразмерные (вес шрифта, коэффициент)
// остаются как есть. Что именно безразмерно — решает имя переменной, и это
// решение здесь названо, а не спрятано.
const UNITLESS = /(weight|paragraph-spacing\/0|letter-spacing\/Text|spacing_0|nopadding)/i;
const isColor = (v) => /^#[0-9a-f]{3,8}$/i.test(v);

const collected = new Map(); // name -> {value, figmaPath, nodes:Set}
for (const [nodeId, block] of Object.entries(dump)) {
  // Служебные ключи (`_`, `_styles`) узлами не являются и переменных не несут.
  if (nodeId.startsWith("_")) continue;
  for (const [figmaPath, raw] of Object.entries(block.vars)) {
    if (typeof raw !== "string" || raw === "" || raw === ",") continue;
    if (raw.startsWith("Font(") || raw.startsWith("Effect(")) continue; // композиты, не значения
    const name = varName(figmaPath);
    let value = raw;
    if (!isColor(raw)) {
      const num = Number(raw);
      if (Number.isFinite(num)) value = UNITLESS.test(figmaPath) || num === 0 ? String(num) : `${num}px`;
    }
    if (!collected.has(name)) collected.set(name, { value, figmaPath, nodes: new Set() });
    collected.get(name).nodes.add(`${nodeId} ${block._node}`);
    if (collected.get(name).value !== value) collected.get(name).conflict = raw;
  }
}

// Группировка по первому сегменту пути Figma.
const groups = new Map();
for (const [name, rec] of collected) {
  const g = rec.figmaPath.split("/")[0];
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push([name, rec]);
}

const matched = [], unmatched = [];
for (const [name, rec] of collected) {
  if (!isColor(rec.value)) continue;
  const hit = prodByValue.get(normColor(rec.value) || rec.value.toLowerCase());
  (hit ? matched : unmatched).push([name, rec, hit]);
}

const GROUP_TITLE = {
  elements: "Элементы: кнопка, поле, вкладка, чип, тег, контрол, модалка, дропдаун",
  size: "Шкала отступов и радиусов",
  font: "Шрифт: размеры, интерлиньяж, насыщенность, трекинг",
  "font-header": "Заголовочная шкала",
  "color style": "Цветовые стили библиотеки",
  logo: "Фирменные цвета внешних сервисов",
  blue: "Синяя шкала",
  color: "Отдельные цвета",
  effect: "Тени",
};

let out = `/* =========================================================================
   COURSES · TOKENS / FIGMA
   =========================================================================
   Элементные переменные макета — отдельный слой, намеренно не слитый
   с ui/tokens.css.

   Почему отдельно. BRIEF §2: «Figma в этом пакете — источник состава и
   вариантов, а не источник текущей структуры страниц». Макет описывает
   другую версию продукта: своя схема URL, свои брейкпоинты (320/744/1024
   против 480/768/1024 в проде), раздел профессий, которого в проде нет.
   Значения макета и значения прода в одних местах совпадают до байта,
   в других расходятся, и расхождение — это факт для разбора, а не повод
   выбрать одно из двух молча. Слитый :root такой разбор делает невозможным:
   после слияния уже не видно, чьё значение победило.

   Поэтому здесь ${collected.size} переменных с префиксом --fig-, и ни одна
   из них не участвует в вёрстке компонентов. Компоненты собраны из
   продакшена и ссылаются на --color-ui-* из ui/tokens.css. Слой Figma
   существует, чтобы контракт дизайна был виден рядом и сверяем.

   Источник: mcp__figma__get_variable_defs по четырём узлам файла
   02_Education-NEW (oNyNRRob2y0ZSgPHOdH65X) — шапка 15065:242774,
   CourseCard 9785:45731, SiteFooter 10049:51115, FilterModal 14613:211399,
   EmptyState 12135:122618 (добавлен, когда по нему верстался figma-only
   компонент: у него нашлись три переменные, которых прежние узлы не давали —
   font/size/display-l, font/line-height/display-l, elements/button/secondary/fill_hover),
   Pagination 9909:29791 (добавлен так же — принёс elements/pagination/* и
   цвета отключённой иконочной кнопки).
   get_variable_defs отдаёт переменные, использованные поддеревом узла,
   а не весь файл; узлы взяты разных семейств ради охвата. Выгрузка —
   .pipeline/R2-bulk/figma-vars.json.

   Чего здесь нет. Композитные переменные Figma — типографические стили
   (Font(...)) и эффекты (Effect(...)) — не разворачиваются в CSS одной
   переменной: это наборы. Их составляющие ниже есть по отдельности
   (font/size, effect/drop shadow 1 и 2), а сборка — дело компонента.
   Библиотека education-lib (KG36iTkwvKDmrw8XQhk7d6) не читается: узлы её
   страниц компонентов через get_metadata недоступны, есть только
   componentKey (см. sprite-icon.md, «Источники»).

   Единицы. Figma хранит числа без единиц. Размеры выписаны в px,
   безразмерными оставлены насыщенность шрифта, трекинг Text и нули.

   Сверка с продакшеном: из ${matched.length + unmatched.length} цветов макета
   ${matched.length} совпали по значению с продуктовым токеном ui/tokens.css,
   ${unmatched.length} — своего продуктового двойника не имеют. Таблица
   совпадений — в конце файла комментарием.
   ========================================================================= */

:root {
`;

for (const [g, list] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
  out += `\n  /* ${GROUP_TITLE[g] || g} */\n`;
  for (const [name, rec] of list.sort((a, b) => a[0].localeCompare(b[0]))) {
    out += `  ${name}: ${rec.value};${rec.conflict ? ` /* в другом узле: ${rec.conflict} */` : ""}\n`;
  }
}
out += `}\n`;

out += `
/* -------------------------------------------------------------------------
   Сверка цветов макета с продуктовыми токенами
   -------------------------------------------------------------------------
   Совпало по значению (${matched.length}) — то же число в макете и в проде:

${matched.sort((a, b) => a[0].localeCompare(b[0])).map(([n, r, hit]) => `     ${n.padEnd(42)} ${r.value.padEnd(10)} = ${hit.join(", ")}`).join("\n")}

   Продуктового двойника нет (${unmatched.length}) — цвет объявлен в макете,
   а среди 51 переменной ui/tokens.css значения нет ни у одной. Это не
   ошибка ни той, ни другой стороны: часть из них — фирменные цвета внешних
   сервисов (logo/*), часть — состояния, до которых вёрстка ещё не дошла.
   Разбирается по мере появления соответствующих компонентов.

${unmatched.sort((a, b) => a[0].localeCompare(b[0])).map(([n, r]) => `     ${n.padEnd(42)} ${r.value}`).join("\n")}
   ------------------------------------------------------------------------- */
`;

fs.writeFileSync(path.join(pkg, "ui/tokens-figma.css"), out, "utf8");
console.log(`ui/tokens-figma.css: ${collected.size} переменных, ${groups.size} групп; цветов сверено ${matched.length + unmatched.length} (совпало ${matched.length})`);
