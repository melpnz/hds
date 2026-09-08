// Перепись классов снятой разметки и отбор собственных классов продукта.
// Критерий записан словами в components/INDEX.md, здесь он исполняется:
//   node .pipeline/R0-05/class-census.mjs
//
// Считаются две разные величины:
//   токенов — сколько раз имя написано в атрибутах class;
//   узлов   — на скольких элементах имя стоит (имя, написанное в одном
//             class дважды, даёт два токена и один узел).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const pages = fs.readdirSync(pagesDir);

// Шаг 1. Перепись по десяти снятым dom.html.
const census = new Map();
const touch = (token) => {
  if (!census.has(token)) census.set(token, { tokens: 0, nodes: 0, pages: new Set() });
  return census.get(token);
};
for (const page of pages) {
  const html = fs.readFileSync(path.join(pagesDir, page, "dom.html"), "utf8");
  for (const match of html.matchAll(/class="([^"]*)"/g)) {
    const list = match[1].split(/\s+/).filter(Boolean);
    for (const token of list) {
      const entry = touch(token);
      entry.tokens += 1;
      entry.pages.add(page);
    }
    for (const token of new Set(list)) touch(token).nodes += 1;
  }
}

// Шаг 2. Варианты (phone:, hover:, !) и произвольные значения ([...]) —
// утилиты по построению: имя несёт условие или значение, а не название узла.
const isVariant = (token) => token.includes(":") || token.startsWith("!");
const isArbitrary = (token) => token.includes("[") || token.includes("]");

// Шаг 3. Утилита — имя вида «свойство CSS + значение этого свойства».
// Пространства свойств перечислены закрытым списком: это головы токенов
// до первого «-», снятые с этой же разметки.
const utilityHeads = new Set([
  "", "absolute", "align", "appearance", "aspect", "bg", "block", "border", "bottom", "box",
  "break", "col", "cursor", "duration", "fill", "flex", "font", "from", "gap", "grid", "group",
  "h", "hidden", "inline", "inset", "items", "justify", "leading", "left", "line", "list", "m",
  "max", "mb", "min", "ml", "mr", "mt", "mx", "my", "no", "object", "opacity", "outline",
  "overflow", "p", "pb", "pl", "pointer", "pr", "pt", "px", "py", "relative", "right", "rotate",
  "rounded", "scale", "select", "self", "shadow", "shrink", "sticky", "text", "top",
  "transition", "translate", "truncate", "uppercase", "w", "whitespace", "wrap", "z",
]);
// Исключение из шага 3, названное поимённо: голова утилитная, хвост — не значение
// этого свойства. «separator» не значение display, это название узла.
const utilityHeadExceptions = new Set(["inline-separator"]);

// Шаг 4. Сторонние библиотеки — закрытый список пространств.
const vendorHeads = new Set(["swiper", "v", "router", "adfox"]);
// Ни утилита, ни подтверждённая библиотека: происхождение не установлено.
const unresolved = new Set(["scrollbar-container", "scrollbar-button"]);

const head = (token) => token.split("-")[0];
const kindOf = (token) => {
  if (isVariant(token)) return "вариант";
  if (isArbitrary(token)) return "произвольное значение";
  if (vendorHeads.has(head(token))) return "библиотека";
  if (unresolved.has(token)) return "происхождение не установлено";
  if (utilityHeads.has(head(token)) && !utilityHeadExceptions.has(token)) return "утилита";
  return "собственный класс";
};

const buckets = new Map();
for (const [token, entry] of census) {
  const kind = kindOf(token);
  if (!buckets.has(kind)) buckets.set(kind, []);
  buckets.get(kind).push([token, entry]);
}

console.log(`Уникальных имён классов на десяти страницах: ${census.size}`);
let sum = 0;
for (const [kind, list] of [...buckets].sort((a, b) => b[1].length - a[1].length)) {
  sum += list.length;
  console.log(`  ${kind}: ${list.length}`);
}
console.log(`  сумма: ${sum}`);

for (const kind of ["собственный класс", "происхождение не установлено"]) {
  const list = (buckets.get(kind) ?? []).sort((a, b) => b[1].tokens - a[1].tokens);
  console.log(`\n${kind} — ${list.length}:`);
  for (const [token, entry] of list) {
    const nodes = entry.nodes === entry.tokens ? "" : ` (узлов ${entry.nodes})`;
    console.log(`| \`${token}\` | ${entry.tokens}${nodes} | ${entry.pages.size}/10 |`);
  }
}
