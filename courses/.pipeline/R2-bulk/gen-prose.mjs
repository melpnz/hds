// Прозаические разделы спецификаций партии R2-bulk.
//
// Вставляет в спецификацию записи правило применения (на место заглушки
// «Правило применения призывом … не выведено»), «Когда не использовать»,
// «Как работает», «Управление клавиатурой», «Анимация» и «Responsive».
// Первые три — тексты prose-content.mjs; последние три выводятся из
// переписи корпуса corpus-facts.json: тег корня, все фокусируемые узлы на
// один экземпляр и их хозяева, скрытые на 1440 узлы, переходы из
// вычисленного стиля, классы адаптива. Раздел пишется, только если его есть
// чем подтвердить (SPEC-TEMPLATE, «Обязательны»), — отсутствие переходов
// или фокусируемых узлов тоже факт переписи, и он называется прямо.
//
// Повторный запуск переписывает разделы по текущим фактам и текстам —
// ничего не задваивает и ничего не оставляет от прошлой редакции.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROSE } from "./prose-content.mjs";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const facts = JSON.parse(fs.readFileSync(path.join(d, "corpus-facts.json"), "utf8"));
const NAME = Object.fromEntries(manifest.components.map((c) => [c.id, c.canonicalName]));

// Корень, который сам ссылка или кнопка: такие записи называются в списке
// фокусируемых узлов по имени («`Link` ×2»), остальные — «внутри `AdCard`».
const FOCUSABLE_ROOT = new Set(Object.entries(facts).filter(([, f]) => (f.tags.a || 0) + (f.tags.button || 0) === f.nodes).map(([k]) => k));

// «кнопка×1 · ссылка×1» → «1 кнопка и 1 ссылка»
const FORMS = { "ссылка": ["ссылка", "ссылки", "ссылок"], "кнопка": ["кнопка", "кнопки", "кнопок"] };
const NODE = ["узел", "узла", "узлов"];
const plural = (n, [one, few, many]) => (n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
const sigText = (sig) => {
  const parts = sig.split(" · ").map((x) => {
    const [k, n] = x.split("×");
    if (FORMS[k]) return `${n} ${plural(+n, FORMS[k])}`;
    if (k.startsWith("поле ")) return `${n} ${plural(+n, ["поле", "поля", "полей"])} \`input type=${k.slice(5)}\``;
    return `\`${k}\` ×${n}`;
  });
  return parts.length > 1 ? parts.slice(0, -1).join(", ") + " и " + parts.at(-1) : parts[0];
};

function keyboard(id, f) {
  const lines = [];
  const tags = f.tags;
  const cls = Object.keys(f.classes);
  const hiddenNote = () => {
    if (f.hiddenNodes === f.nodes) lines.push(`Все ${f.nodes} экземпляров на 1440 скрыты (\`display:none\`) — пока их не покажут, в порядок табуляции не входит ничего.`);
    else if (f.hiddenNodes) lines.push(`${f.hiddenNodes} из ${f.nodes} экземпляров на 1440 скрыты (\`display:none\` у предка) и в порядок табуляции не входят.`);
  };
  if (tags.a || tags.button) {
    if (tags.a) lines.push(`Корень — ссылка \`<a href>\`${tags.button ? ` (${tags.a} из ${f.nodes})` : ""}: фокус по Tab, переход — Enter.`);
    if (tags.button) lines.push(`Корень — \`<button>\`${tags.a ? ` (${tags.button} из ${f.nodes})` : ""}: фокус по Tab, действие — Enter или Space.`);
    // Классы переписи считаются по узлам: у записи, которая сливает разные
    // роли (Link — 867 ссылок, среди них ссылки-кнопки), класс может стоять
    // не на всех узлах, и это говорится долей, а не приписывается всем.
    const ring = f.classes["focus-visible:outline"] || 0;
    if (ring >= f.nodes) lines.push("Кольцо фокуса — `focus-visible:outline` цветом `outline-ui-black-400`; обводка по клику погашена `focus:outline-none`.");
    else if (ring) lines.push(`Кольцо \`focus-visible:outline\` стоит у ${ring} узлов из ${f.nodes}; у остальных своего кольца и сброса нет — работает фокус браузера.`);
    else lines.push("Своего кольца фокуса нет, но нет и сброса: работает фокус браузера.");
    if (f.target && f.target._blank) lines.push(`${f.target._blank} из ${f.nodes} открываются в новой вкладке (\`target="_blank"\`).`);
    hiddenNote();
    return lines.join(" ");
  }
  const total = Object.values(f.focusKinds).reduce((a, b) => a + b, 0);
  const root = `\`<${Object.keys(tags)[0]}>\``;
  if (!total) return `Элемент не интерактивен: ни корень ${root}, ни что-либо внутри в порядок табуляции не входит — ссылок, кнопок, полей и \`tabindex\` нет ни в одном из ${f.nodes} экземпляров.`;
  // Состав на один экземпляр: самые частые подписи, остальное — одной фразой.
  const sigs = Object.entries(f.focusSignatures).sort((a, b) => b[1] - a[1]);
  const shown = sigs.length <= 4 ? sigs : sigs.slice(0, 3);
  const rest = sigs.slice(shown.length).reduce((a, [, n]) => a + n, 0);
  const one = f.nodes === 1;
  const sigLine = (s) => (s === "—" ? "ничего" : sigText(s));
  if (one) lines.push(`Корень (${root}) в фокус не попадает. По Tab проходят: ${sigLine(shown[0][0])}.`);
  else if (sigs.length === 1) lines.push(`Корень (${root}) в фокус не попадает. На один экземпляр по Tab проходят: ${sigLine(shown[0][0])} — так у всех ${f.nodes}.`);
  else lines.push(`Корень (${root}) в фокус не попадает. На один экземпляр по Tab проходят: ${shown.map(([s, n]) => `${sigLine(s)} — у ${n} из ${f.nodes}`).join("; ")}${rest ? `; у остальных ${rest} — другой состав` : ""}.`);
  // Кому принадлежат фокусируемые узлы — по корпусу, каждый узел один раз.
  const owners = Object.entries(f.focusRecords).sort((a, b) => b[1] - a[1]);
  const self = owners.filter(([k]) => FOCUSABLE_ROOT.has(k)).map(([k, n]) => `\`${NAME[k] || k}\` — ${n}`);
  const inner = owners.filter(([k]) => !FOCUSABLE_ROOT.has(k)).map(([k, n]) => `внутри \`${NAME[k] || k}\` — ${n}`);
  const outside = Object.entries(f.focusOutside).map(([k, n]) => `\`${k}\` — ${n}`);
  const parts = [...self, ...inner];
  if (parts.length || outside.length) lines.push(`По корпусу (${total} ${plural(total, NODE)})${parts.length ? `: ${parts.join(", ")}` : ""}${outside.length ? `${parts.length ? "; " : ": "}вне записей реестра — ${outside.join(", ")}` : ""}.`);
  if (cls.includes("focus-within:border-ui-black-850")) lines.push("Фокус внутреннего поля показывает рамка обёртки `focus-within:border-ui-black-850`.");
  hiddenNote();
  // Скрытые экземпляры уже названы; отдельно — только скрытое внутри видимых.
  if (f.focusHidden && !f.hiddenNodes) lines.push(`${f.focusHidden} из ${total} фокусируемых узлов на 1440 скрыты и в порядок табуляции не входят, пока их не покажут.`);
  return lines.join(" ");
}

// Переходы — из вычисленного стиля страниц, отрисованных с CSS корпуса.
// Рантайм-классы Swiper (`swiper-slide-active` и соседи) из ключа убираются:
// это один и тот же слайд в разных положениях.
const sec = (v) => v.split(", ").map((x) => `${String(parseFloat(x)).replace(".", ",")} с`).join(" и ");
function animation(f) {
  const groups = new Map();
  for (const [key, n] of Object.entries(f.transitions)) {
    const inst = f.transitionInstances[key] || 0;
    const [el, val] = key.split(" → ");
    const node = el.split(".").filter((c) => !/^swiper-slide-(active|next|prev)$/.test(c)).slice(0, 4).join(".");
    const g = groups.get(val) || { val, nodes: 0, inst: 0, els: new Set() };
    g.nodes += n; g.inst = Math.max(g.inst, inst); g.els.add(node);
    groups.set(val, g);
  }
  // Наведение, которое что-то меняет: `hover:no-underline` на узле без
  // подчёркивания ничего не делает, и фраза «наведение сменяется мгновенно»
  // у такой записи вводила бы в заблуждение (повторное ревью, note 1).
  const hasHover = Object.keys(f.classes).some((c) => /(^|:)hover:/.test(c) && !/hover:no-underline$/.test(c));
  const out = [];
  let runtime = false;
  for (const g of [...groups.values()].sort((a, b) => b.nodes - a.nodes)) {
    const els = [...g.els].slice(0, 2).map((e) => `\`${e}\``).join(", ");
    const where = `${els} — ${g.nodes} ${plural(g.nodes, NODE)}${f.nodes > 1 ? `, у ${g.inst} экземпляр${g.inst % 10 === 1 && g.inst % 100 !== 11 ? "а" : "ов"} из ${f.nodes}` : ""}`;
    if (g.val.startsWith("animation ")) { const [name, d, it] = g.val.slice(10).split(" | "); out.push(`анимация \`${name}\`, ${sec(d)}, повторов ${it === "infinite" ? "без конца" : it}: ${where}`); continue; }
    const [prop, dur, timing, delay] = g.val.split(" | ");
    if (!dur.split(", ").some((x) => parseFloat(x) > 0)) {
      const swiper = [...g.els].every((e) => e.includes("swiper"));
      runtime ||= swiper;
      out.push(`\`transition-property: ${prop}\` без длительности${swiper ? "" : " — переход не срабатывает"}: ${where}`);
      continue;
    }
    out.push(`\`${prop}\` за ${sec(dur)}, кривая \`${timing}\`${delay ? `, ${delay}` : ""}: ${where}`);
  }
  if (!out.length) return hasHover
    ? "Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно."
    : "Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).";
  const tail = [];
  if (runtime) tail.push("Нулевая длительность у узлов Swiper — это CSS самой библиотеки: длительность перелистывания она ставит из скрипта, а снимок сделан без него, так что её значение в пакете не снято.");
  if (hasHover) tail.push("Остальные узлы переходов не объявляют: наведение на них сменяется мгновенно.");
  return `Переходы вычислены по страницам, отрисованным с CSS корпуса на 1440:\n\n${out.map((x) => `- ${x};`).join("\n").replace(/;$/, ".")}\n\n${tail.join(" ")}`.trim();
}

// Шесть префиксов сборки и их условия — docs/guide/layout.md. В легенде
// называются только те, что стоят у записи: первая редакция печатала одну
// легенду на всех и не называла `desktop:` у подвала (повторное ревью).
const PREFIX = [
  ["small-phone", "до 479"], ["phone", "до 767"], ["phablet-and-tablet", "480–1023"],
  ["tablet-only", "768–1023"], ["tablet", "до 1023"], ["desktop", "от 1024"],
];
function responsive(f) {
  const cls = Object.keys(f.classes).filter((c) => PREFIX.some(([p]) => c.startsWith(p + ":")));
  if (!cls.length) return "Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.";
  const shown = cls.slice(0, 10).map((c) => `\`${c}\``).join(", ");
  const used = PREFIX.filter(([p]) => cls.some((c) => c.startsWith(p + ":"))).map(([p, w]) => `\`${p}:\` — ${w}`);
  return `Классы с префиксом ширины в поддереве записи: ${shown}${cls.length > 10 ? " и другие" : ""}. Условия префиксов: ${used.join(", ")} (\`docs/guide/layout.md\`).`;
}

// Заглушки прошлых редакций: «Правило применения призывом … не выведено»
// у продуктовых записей и «Правило применения здесь не выведено» у
// storybook-only. Первая редакция знала только первую, и у четырёх
// storybook-only записей заглушка осталась рядом с правилом.
const PLACEHOLDER = /\n> Правило применения[^\n]*\n(?:>[^\n]*\n)*/;
const OLD_GAP = /\n- \*\*Прозаические разделы не написаны\.\*\*[^\n]*\n/;
const GAP_LINE = /\n- \*\*Проза выведена из (?:переписи корпуса|story и CSS Storybook)\.\*\*[^\n]*\n/;
const NEW_GAP = "\n- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.\n";
const NEW_GAP_SB = "\n- **Проза выведена из story и CSS Storybook.** Записи нет в разметке снятых страниц, и в переписи корпуса её нет. Правило применения, «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по снятой story и CSS Storybook (`evidence/source/storybook/`); «Когда не использовать» — по тому, чем снятые страницы решают ту же задачу. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их нечем.\n";

// Раздел «## name» ставится или переписывается: повторный прогон после
// правки фактов или текстов обновляет написанное, а не пропускает его.
function setSection(s, name, body, anchor) {
  const head = `\n## ${name}\n`;
  const i = s.indexOf(head);
  if (i >= 0) {
    const j = s.indexOf("\n## ", i + head.length);
    return s.slice(0, i) + `${head}\n${body}\n` + s.slice(j < 0 ? s.length : j);
  }
  const a = s.indexOf(`\n## ${anchor}\n`);
  const k = a >= 0 ? s.indexOf("\n## ", a + 5) : s.indexOf("\n## Ограничения");
  return s.slice(0, k) + `\n${head}\n${body}\n` + s.slice(k);
}

let done = 0;
const targets = manifest.components.filter((c) => PROSE[c.id] && c.specPath);
for (const c of targets) {
  const p = path.join(pkg, "components", c.specPath);
  let s = fs.readFileSync(p, "utf8");
  const nl = s.includes("\r\n") ? "\r\n" : "\n";
  s = s.replace(/\r\n/g, "\n");
  const pr = PROSE[c.id];
  const f = facts[c.id];
  const sb = c.sourceScope === "storybook-only";

  // 1. Правило: на место заглушки, поверх прошлой редакции или в конец раздела.
  s = s.replace(PLACEHOLDER, "\n");
  // Строка, в которую у storybook-only вылился голый sourceScope из notes.
  s = s.replace(/\n\nstorybook-only\n/, "\n");
  const rule = `**Правило.** ${pr.use}`;
  if (s.includes("**Правило.**")) s = s.replace(/\*\*Правило\.\*\*[^\n]*/, () => rule);
  else {
    const i = s.indexOf("## Когда использовать");
    const j = s.indexOf("\n## ", i + 5);
    s = s.slice(0, j) + "\n\n" + rule + "\n" + s.slice(j);
  }

  // 2. Разделы после «Когда использовать» — по порядку шаблона.
  s = setSection(s, "Когда не использовать", pr.avoid.map((x) => `- ${x}`).join("\n"), "Когда использовать");
  s = setSection(s, "Как работает", pr.how, "Когда не использовать");
  // keyboardExtra — факт, которого перепись не видит (фокус на узле,
  // обрезанном свёрткой), дописывается к выведенному тексту.
  const kb = [pr.keyboard || (f && keyboard(c.id, f)), pr.keyboardExtra].filter(Boolean).join(" ");
  if (kb) s = setSection(s, "Управление клавиатурой", kb, "Как работает");
  const an = pr.animation || (f && animation(f));
  if (an) s = setSection(s, "Анимация", an, "Управление клавиатурой");

  // 3. Responsive перед «Ограничениями».
  const rs = pr.responsive || (f && responsive(f));
  if (rs) {
    if (s.includes("\n## Responsive\n")) s = setSection(s, "Responsive", rs);
    else { const k = s.indexOf("\n## Ограничения"); s = s.slice(0, k) + `\n\n## Responsive\n\n${rs}\n` + s.slice(k); }
  }

  // 4. Пометка в «Ограничениях» — своя у storybook-only.
  const gap = sb ? NEW_GAP_SB : NEW_GAP;
  if (OLD_GAP.test(s)) s = s.replace(OLD_GAP, gap);
  else if (GAP_LINE.test(s)) s = s.replace(GAP_LINE, gap);
  else {
    const k = s.indexOf("\n## Ограничения");
    const k2 = s.indexOf("\n## ", k + 5);
    s = s.slice(0, k2) + gap + s.slice(k2);
  }
  s = s.replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(p, s.replace(/\n/g, nl), "utf8");
  done++;
}
console.log(`проза вставлена: ${done} спецификаций`);
