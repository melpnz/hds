// Прозаические разделы спецификаций партии R2-bulk.
//
// Вставляет в спецификацию записи правило применения (на место заглушки
// «Правило применения призывом … не выведено»), «Когда не использовать»,
// «Как работает», «Управление клавиатурой», «Анимация» и «Responsive».
// Первые три — тексты prose-content.mjs; последние три выводятся из
// переписи корпуса corpus-facts.json: тег корня, вложенные интерактивные
// записи, классы фокуса, перехода и адаптива. Раздел пишется, только если
// его есть чем подтвердить (SPEC-TEMPLATE, «Обязательны»), — отсутствие
// классов тоже факт переписи, и он называется прямо.
//
// Повторный запуск ничего не задваивает: раздел, который уже стоит, не
// вставляется.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROSE } from "./prose-content.mjs";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const facts = JSON.parse(fs.readFileSync(path.join(d, "corpus-facts.json"), "utf8"));
const NAME = Object.fromEntries(manifest.components.map((c) => [c.id, c.canonicalName]));

const INTERACTIVE = ["link", "button", "icon-button", "filter-chip", "select", "text-input", "search-input", "segmented-control", "social-icon"];
const RU_COUNT = (n) => `${n}`;

function keyboard(id, f) {
  const lines = [];
  const tags = f.tags;
  const cls = Object.keys(f.classes);
  if (tags.a) lines.push(`Корень — ссылка \`<a href>\`${tags.button ? ` (${tags.a} из ${f.nodes})` : ""}: фокус по Tab, переход — Enter.`);
  if (tags.button) lines.push(`Корень — \`<button>\`${tags.a ? ` (${tags.button} из ${f.nodes})` : ""}: фокус по Tab, действие — Enter или Space.`);
  if (tags.a || tags.button) {
    // Классы переписи считаются по узлам: у записи, которая сливает разные
    // роли (Link — 867 ссылок, среди них ссылки-кнопки), класс может стоять
    // не на всех узлах, и это говорится долей, а не приписывается всем.
    const ring = f.classes["focus-visible:outline"] || 0;
    if (ring >= f.nodes) lines.push("Кольцо фокуса — `focus-visible:outline` цветом `outline-ui-black-400`; обводка по клику погашена `focus:outline-none`.");
    else if (ring) lines.push(`Кольцо \`focus-visible:outline\` стоит у ${ring} узлов из ${f.nodes}; у остальных своего кольца и сброса нет — работает фокус браузера.`);
    else lines.push("Своего кольца фокуса нет, но нет и сброса: работает фокус браузера.");
    if (f.target && f.target._blank) lines.push(`${f.target._blank} из ${f.nodes} открываются в новой вкладке (\`target="_blank"\`).`);
    if (id === "icon-button") lines.push("Отключённая стрелка (`disabled`) выпадает из порядка табуляции — так ведёт себя нативная кнопка.");
    return lines.join(" ");
  }
  const kids = Object.entries(f.children).filter(([k]) => INTERACTIVE.includes(k)).sort((a, b) => b[1] - a[1]);
  if (kids.length) {
    lines.push(`Корень (\`<${Object.keys(tags)[0]}>\`) в фокус не попадает. С клавиатуры доступны вложенные записи: ${kids.map(([k, n]) => `\`${NAME[k] || k}\` ×${n}`).join(", ")} — у каждой свой раздел.`);
    if (cls.includes("focus-within:border-ui-black-850")) lines.push("Фокус внутреннего поля показывает рамка обёртки `focus-within:border-ui-black-850`.");
    return lines.join(" ");
  }
  return `Элемент не интерактивен: корень \`<${Object.keys(tags)[0]}>\` без ссылки и кнопки внутри, в порядке табуляции не участвует.`;
}

function animation(f) {
  const cls = Object.keys(f.classes);
  const out = [];
  if (cls.includes("transition-transform")) out.push("`transition-transform` — переход по `transform` 0.15 с с кривой `cubic-bezier(.4,0,.2,1)`");
  if (cls.includes("duration-300")) out.push("`duration-300` — 0.3 с у слайдов Swiper");
  if (!out.length) return "Классов перехода и анимации в разметке нет: наведение и другие состояния сменяются мгновенно.";
  return `В поддереве записи — ${out.join("; ")}. Других переходов нет: наведение сменяется мгновенно.`;
}

function responsive(f) {
  const cls = Object.keys(f.classes).filter((c) => /^(phone|tablet|desktop|small-phone|tablet-only|laptop|phablet-and-tablet):/.test(c));
  if (!cls.length) return "Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.";
  const shown = cls.slice(0, 10).map((c) => `\`${c}\``).join(", ");
  return `Классы с префиксом ширины в поддереве записи: ${shown}${cls.length > 10 ? " и другие" : ""}. Условия префиксов: \`small-phone:\` — до 479, \`phone:\` — до 767, \`tablet-only:\` — 768–1023, \`tablet:\` — до 1023 (\`docs/guide/layout.md\`).`;
}

const PLACEHOLDER = /\n> Правило применения призывом[^\n]*\n(?:>[^\n]*\n)*/;
const OLD_GAP = /\n- \*\*Прозаические разделы не написаны\.\*\*[^\n]*\n/;
const NEW_GAP = "\n- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.\n";

let done = 0;
const targets = manifest.components.filter((c) => PROSE[c.id] && c.specPath);
for (const c of targets) {
  const p = path.join(pkg, "components", c.specPath);
  let s = fs.readFileSync(p, "utf8");
  const nl = s.includes("\r\n") ? "\r\n" : "\n";
  s = s.replace(/\r\n/g, "\n");
  const pr = PROSE[c.id];
  const f = facts[c.id];

  // 1. Правило на место заглушки (или в конец раздела, если заглушки нет).
  const rule = `\n**Правило.** ${pr.use}\n`;
  if (!s.includes("**Правило.**")) {
    if (PLACEHOLDER.test(s)) s = s.replace(PLACEHOLDER, rule);
    else {
      const i = s.indexOf("## Когда использовать");
      const j = s.indexOf("\n## ", i + 5);
      s = s.slice(0, j) + "\n" + rule + s.slice(j);
    }
  }

  // 2. Разделы после «Когда использовать».
  const blocks = [];
  const has = (h) => s.includes(`\n## ${h}\n`);
  if (!has("Когда не использовать")) blocks.push(`## Когда не использовать\n\n${pr.avoid.map((x) => `- ${x}`).join("\n")}\n`);
  if (!has("Как работает")) blocks.push(`## Как работает\n\n${pr.how}\n`);
  const kb = pr.keyboard || (f && keyboard(c.id, f));
  if (kb && !has("Управление клавиатурой")) blocks.push(`## Управление клавиатурой\n\n${kb}\n`);
  const an = pr.animation || (f && animation(f));
  if (an && !has("Анимация")) blocks.push(`## Анимация\n\n${an}\n`);
  if (blocks.length) {
    const i = s.indexOf("## Когда использовать");
    const j = s.indexOf("\n## ", i + 5);
    s = s.slice(0, j) + "\n\n" + blocks.join("\n") + s.slice(j);
  }

  // 3. Responsive перед «Ограничениями».
  const rs = pr.responsive || (f && responsive(f));
  if (rs && !has("Responsive")) {
    const k = s.indexOf("\n## Ограничения");
    s = s.slice(0, k) + `\n\n## Responsive\n\n${rs}\n` + s.slice(k);
  }

  // 4. Пометка в «Ограничениях».
  if (OLD_GAP.test(s)) s = s.replace(OLD_GAP, NEW_GAP);
  else if (!s.includes("**Проза выведена из переписи корпуса.**")) {
    const k = s.indexOf("\n## Ограничения");
    const k2 = s.indexOf("\n## ", k + 5);
    s = s.slice(0, k2) + NEW_GAP + s.slice(k2);
  }
  s = s.replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(p, s.replace(/\n/g, nl), "utf8");
  done++;
}
console.log(`проза вставлена: ${done} спецификаций`);
