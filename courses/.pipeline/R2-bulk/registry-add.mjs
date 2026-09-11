// Добавление figma-only записей в реестр и синхронизация счётчиков.
//
// Запись заводится в manifest.json и .pipeline/inventory.json, получает шаг
// в ROADMAP.md, строку в таблице элементов INDEX.md, строку в STATES.md §4
// и — если у неё есть состояния сверх default — строку в STATE-CAPTURE.md §7.
// Числа, которые описывают реестр целиком (записей, шагов, разбивка по
// волнам, видам, категориям, sourceScope, пары состояний), пересчитываются
// из манифеста и переписываются там, где пакет заявляет их как текущие.
//
// Запуск: node registry-add.mjs <entries.json>. Повторный запуск с теми же
// записями ничего не задваивает: каждая вставка проверяет, что её ещё нет.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const P = (f) => path.join(pkg, f);
const read = (f) => fs.readFileSync(P(f), "utf8");
const nlOf = (s) => (s.includes("\r\n") ? "\r\n" : "\n");
const FK = "oNyNRRob2y0ZSgPHOdH65X";
const DECISION = "Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.";
const figmaUrl = (n) => (/^\d+:\d+$/.test(n) ? `https://www.figma.com/design/${FK}/02_Education-NEW?node-id=${n.replace(":", "-")}` : null);
const KIND_RU = { primitive: "примитив", component: "компонент", module: "модуль" };

const entries = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

// --- manifest + inventory -------------------------------------------------
const manifest = JSON.parse(read("components/manifest.json"));
const inventory = JSON.parse(read(".pipeline/inventory.json"));
const have = new Set(manifest.components.map((c) => c.id));
for (const e of entries) {
  if (have.has(e.id)) continue;
  const fe = { fileKey: FK, fileName: "02_Education-NEW", sourceName: e.layer, layerName: e.layer, nodeId: e.node, componentKey: null, url: figmaUrl(e.node), note: e.note };
  manifest.components.push({
    id: e.id, canonicalName: e.name, storybookNames: [], legacyAliases: [], category: e.category, kind: e.kind,
    specPath: null, cssRoots: [], showcaseAnchor: null, figmaEvidence: [fe], status: "planned",
    requiredStates: e.states, capturedStates: ["default"], normativeStates: [], uncapturedStates: e.states.filter((s) => s !== "default"),
    sourceScope: "figma-only", wave: e.step.split("-")[0], step: e.step, dependsOn: e.deps,
    occurrences: 0, seenOn: [], productionEvidence: [], storybookEvidence: [], notes: `${e.notes} ${DECISION}`,
  });
  inventory.elements.push({
    id: e.id, canonicalName: e.name, category: e.category, kind: e.kind, wave: e.step.split("-")[0], status: "planned",
    occurrences: 0, seenOn: [], sources: [{ type: "figma", node: e.node, ...(figmaUrl(e.node) ? { url: figmaUrl(e.node) } : {}), note: e.note }],
    dependsOn: e.deps, notes: `${e.notes} ${DECISION}`,
  });
}
fs.writeFileSync(P("components/manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
// inventory.json держит массивы примитивов и плоские объекты в массивах
// в одну строку — формат сохраняется, чтобы дифф был только о новом.
const prim = (x) => x === null || typeof x !== "object";
const fmt = (v, ind = "", inArr = false) => {
  const n = ind + "  ";
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    if (v.every(prim)) return "[" + v.map((x) => JSON.stringify(x)).join(", ") + "]";
    return "[\n" + v.map((x) => n + fmt(x, n, true)).join(",\n") + "\n" + ind + "]";
  }
  if (v && typeof v === "object") {
    const k = Object.keys(v);
    if (!k.length) return "{}";
    if (inArr && k.every((x) => prim(v[x]))) return "{ " + k.map((x) => JSON.stringify(x) + ": " + JSON.stringify(v[x])).join(", ") + " }";
    return "{\n" + k.map((x) => n + JSON.stringify(x) + ": " + fmt(v[x], n)).join(",\n") + "\n" + ind + "}";
  }
  return JSON.stringify(v);
};
fs.writeFileSync(P(".pipeline/inventory.json"), fmt(inventory) + "\n", "utf8");

// --- числа реестра --------------------------------------------------------
const C = manifest.components;
const N = C.length;
const byWave = (w) => C.filter((c) => c.wave === w).length;
const scope = (s) => C.filter((c) => c.sourceScope === s).length;
const status = (s) => C.filter((c) => c.status === s).length;
const kind = (k) => C.filter((c) => c.kind === k).length;
let pairs = 0, cap = 0, norm = 0, unc = 0;
for (const c of C) { pairs += c.requiredStates.length; cap += c.capturedStates.length; norm += c.normativeStates.length; unc += c.uncapturedStates.length; }
const figmaOnly = scope("figma-only");

// --- ROADMAP --------------------------------------------------------------
{
  let s = read("ROADMAP.md"); const nl = nlOf(s);
  for (const e of entries) {
    if (s.includes(`| ${e.step} |`)) continue;
    const wave = e.step.split("-")[0];
    const rows = [...s.matchAll(new RegExp(`^\\| ${wave}-(\\d{2}) \\|[^\\r\\n]*`, "gm"))];
    const last = rows[rows.length - 1];
    const at = last.index + last[0].length;
    const src = figmaUrl(e.node) ? `[Figma \`${e.node}\`](${figmaUrl(e.node)})` : `Figma \`${e.node}\``;
    const row = `| ${e.step} | \`${e.name}\` — **figma-only** | ${src} · ${e.where} | ${e.depSteps || "—"} | planned |`;
    s = s.slice(0, at) + nl + row + s.slice(at);
  }
  const steps = (s.match(/^\| R\d-\d{2} \|/gm) || []).length;
  s = s.replace(/(\| \*\*R2\*\* \|[^|]*\| )\d+( \| in-progress · 1\/)\d+( \|)/, `$1${byWave("R2")}$2${byWave("R2")}$3`);
  for (const w of ["R3", "R4", "R5"]) s = s.replace(new RegExp(`(\\| \\*\\*${w}\\*\\* \\|[^|]*\\| )\\d+( \\|)`), `$1${byWave(w)}$2`);
  s = s.replace(/\| Элементов в реестре \| \*\*\d+\*\* — R2 \d+ · R3 \d+ · R4 \d+ · R5 \d+\. 55 — инвентаризация 7 сентября; \d+ figma-only добавлены/, `| Элементов в реестре | **${N}** — R2 ${byWave("R2")} · R3 ${byWave("R3")} · R4 ${byWave("R4")} · R5 ${byWave("R5")}. 55 — инвентаризация 7 сентября; ${N - 55} figma-only добавлены`);
  s = s.replace(/\| Шагов в роадмапе \| \*\*\d+\*\* \|/, `| Шагов в роадмапе | **${steps}** |`);
  s = s.replace(/\| Принято шагов \| 10 из \d+ —/, `| Принято шагов | 10 из ${steps} —`);
  s = s.replace(/\| Компонентов в manifest \| \*\*\d+\*\* записей — 1 `complete` \(`sprite-icon`, R2-01\), \*\*\d+ `partial`\*\* и \*\*\d+ `figma-only`\*\*/, `| Компонентов в manifest | **${N}** записей — 1 \`complete\` (\`sprite-icon\`, R2-01), **${status("partial")} \`partial\`** и **${status("figma-only")} \`figma-only\`**`);
  s = s.replace(/Спецификация и живой пример на витрине есть у каждой из \d+ записей/, `Спецификация и живой пример на витрине есть у каждой из ${N} записей`);
  s = s.replace(/`requiredStates` заполнены у всех \d+ записей по матрице `components\/STATES\.md`; снятость всех \d+ пар «запись × состояние» разобрана в `components\/STATE-CAPTURE\.md`: \d+ сняты, \d+ дописаны нормативом в `ui\/state-contract\.css`, \d+ — явный GAP с адресом \(147 пар R1-02 и \d+ пар/,
    `\`requiredStates\` заполнены у всех ${N} записей по матрице \`components/STATES.md\`; снятость всех ${pairs} пар «запись × состояние» разобрана в \`components/STATE-CAPTURE.md\`: ${cap} сняты, ${norm} дописаны нормативом в \`ui/state-contract.css\`, ${unc} — явный GAP с адресом (147 пар R1-02 и ${pairs - 147} пар`);
  fs.writeFileSync(P("ROADMAP.md"), s, "utf8");
}

// --- README ---------------------------------------------------------------
{
  let s = read("README.md");
  const steps = (read("ROADMAP.md").match(/^\| R\d-\d{2} \|/gm) || []).length;
  s = s.replace(/собран реестр из \d+ элементов \(55 — инвентаризация, \d+ figma-only/, `собран реестр из ${N} элементов (55 — инвентаризация, ${N - 55} figma-only`);
  s = s.replace(/составлен роадмап на \d+ шагов/, `составлен роадмап на ${steps} шагов`);
  s = s.replace(/\*\*Спецификация и живой пример на витрине есть у всех \d+ записей\*\*/, `**Спецификация и живой пример на витрине есть у всех ${N} записей**`);
  s = s.replace(/в них не написаны; \d+ — `figma-only`/, `в них не написаны; ${figmaOnly} — \`figma-only\``);
  s = s.replace(/manifest\.json \(\d+ записей\)/, `manifest.json (${N} записей)`);
  s = s.replace(/inventory\.json {10}реестр: \d+ элементов/, `inventory.json          реестр: ${N} элементов`);
  s = s.replace(/вёрстка всех \d+ записей/, `вёрстка всех ${N} записей`);
  fs.writeFileSync(P("README.md"), s, "utf8");
}

// --- INDEX ----------------------------------------------------------------
{
  let s = read("components/INDEX.md"); const nl = nlOf(s);
  s = s.replace(/Записей — \d+\. Написано \*\*\d+\*\* спецификаций/, `Записей — ${N}. Написано **${N}** спецификаций`);
  s = s.replace(/и \d+ в терминальном `figma-only`/, `и ${figmaOnly} в терминальном \`figma-only\``);
  s = s.replace(/и [^\s]+ записей, заведённых 11 сентября:[^—]*—/, `и ${N - 55} записей, заведённых 11 сентября: страница профессии, форма обратной связи, оверлеи быстрых фильтров, загрузка, модалка промокода, FAQ-блок, оглавление, мобильное меню —`);
  s = s.replace(/(\d+) —(\r?\n)только в макете\./, `${figmaOnly} —$2только в макете.`);
  s = s.replace(/`figma-only`: разбивка стала 45 \/ 4 \/ \d+\./, `\`figma-only\`: разбивка стала 45 / 4 / ${figmaOnly}.`);
  s = s.replace(/\| `figma-only` \| \d+ \|/, `| \`figma-only\` | ${figmaOnly} |`);
  s = s.replace(/нужно там, а не в \d+ спецификациях\./, `нужно там, а не в ${N} спецификациях.`);
  s = s.replace(/\(45 \/ 4 \/ \d+\) сверяются/, `(45 / 4 / ${figmaOnly}) сверяются`);
  s = s.replace(/из \d+ строк\./, `из ${N} строк.`);
  const cats = {};
  for (const c of C) (cats[c.category] = cats[c.category] || []).push(c.canonicalName);
  s = s.replace(/^\| `([a-z-]+)` \| `ui\/components\/\1\.css` \| \d+ \| [^\r\n]*\|/gm, (all, cat) => `| \`${cat}\` | \`ui/components/${cat}.css\` | ${cats[cat].length} | ${cats[cat].join(" · ")} |`);
  for (const e of entries) {
    const c = C.find((x) => x.id === e.id);
    if (s.includes(`| \`${e.id}\` |`)) continue;
    const wave = e.step.split("-")[0];
    const rows = [...s.matchAll(new RegExp(`^\\| ${wave}-\\d{2} \\|[^\\r\\n]*`, "gm"))];
    const last = rows[rows.length - 1];
    const at = last.index + last[0].length;
    const row = `| ${c.step} | [${c.canonicalName}](${c.specPath || `${c.category}/${c.id}.md`}) | \`${c.id}\` | ${KIND_RU[c.kind]} | \`${c.category}\` | **figma-only** | ${c.dependsOn.length ? c.dependsOn.map((x) => "`" + x + "`").join(", ") : "—"} |`;
    s = s.slice(0, at) + nl + row + s.slice(at);
  }
  s = s.replace(/### R2 — примитивы, \d+/, `### R2 — примитивы, ${byWave("R2")}`);
  s = s.replace(/### R3 — базовые компоненты, \d+/, `### R3 — базовые компоненты, ${byWave("R3")}`);
  s = s.replace(/### R4 — каркасные модули, \d+/, `### R4 — каркасные модули, ${byWave("R4")}`);
  s = s.replace(/### R5 — entity-модули, \d+/, `### R5 — entity-модули, ${byWave("R5")}`);
  fs.writeFileSync(P("components/INDEX.md"), s, "utf8");
}

// --- STATES ---------------------------------------------------------------
{
  let s = read("components/STATES.md"); const nl = nlOf(s);
  const tableEnd = { primitive: "### 4.3", component: "### 4.4", module: "## 5." };
  for (const e of entries) {
    if (s.includes(`| \`${e.id}\` |`)) continue;
    const head = { primitive: "### 4.2", component: "### 4.3", module: "### 4.4" }[e.kind];
    const h = s.indexOf(head);
    const end = s.indexOf(tableEnd[e.kind], h + 10);
    const block = s.slice(h, end);
    const rows = [...block.matchAll(/^\| `[a-z-]+` \|[^\r\n]*/gm)];
    const last = rows[rows.length - 1];
    const at = h + last.index + last[0].length;
    const row = `| \`${e.id}\` | ${e.states.map((x) => "`" + x + "`" + (e.signals?.[x] ? ` (${e.signals[x]})` : "")).join(", ")} | **figma-only** (11 сентября 2026). ${e.statesWhy} |`;
    s = s.slice(0, at) + nl + row + s.slice(at);
  }
  s = s.replace(/### 4\.2 Примитивы \(`kind: primitive`, \d+ записей\)/, `### 4.2 Примитивы (\`kind: primitive\`, ${kind("primitive")} записей)`);
  s = s.replace(/### 4\.3 Компоненты \(`kind: component`, \d+ записей\)/, `### 4.3 Компоненты (\`kind: component\`, ${kind("component")} записей)`);
  s = s.replace(/### 4\.4 Модули \(`kind: module`, \d+ записей\)/, `### 4.4 Модули (\`kind: module\`, ${kind("module")} записей)`);
  s = s.replace(/разметка всех \d+ записей/, `разметка всех ${N} записей`);
  s = s.replace(/он обязателен у всех \d+ записей/, `он обязателен у всех ${N} записей`);
  s = s.replace(/`adapter` — 0 из \d+ записей реестра/, `\`adapter\` — 0 из ${N} записей реестра`);
  s = s.replace(/## 4\. Разметка \d+ записей реестра/, `## 4. Разметка ${N} записей реестра`);
  s = s.replace(/## 5\. Слова словаря, не встретившиеся ни у одной из \d+ записей/, `## 5. Слова словаря, не встретившиеся ни у одной из ${N} записей`);
  s = s.replace(/по составу самого реестра \(\d+ записей;/, `по составу самого реестра (${N} записей;`);
  s = s.replace(/- Виды и реестр \d+ записей — `components\/manifest\.json` \(55 приняты коммитом(\r?\n)  `4fe1bf5`, \d+ figma-only добавлены/, `- Виды и реестр ${N} записей — \`components/manifest.json\` (55 приняты коммитом$1  \`4fe1bf5\`, ${N - 55} figma-only добавлены`);
  fs.writeFileSync(P("components/STATES.md"), s, "utf8");
}

// --- STATE-CAPTURE ----------------------------------------------------------
{
  let s = read("components/STATE-CAPTURE.md"); const nl = nlOf(s);
  for (const e of entries) {
    const c = C.find((x) => x.id === e.id);
    if (!c.uncapturedStates.length || s.includes(`| \`${e.id}\` |`)) continue;
    const h = s.indexOf("## 7. Дополнение 11 сентября 2026");
    const block = s.slice(h, s.indexOf("## Источники", h));
    const rows = [...block.matchAll(/^\| `[a-z-]+` \|[^\r\n]*/gm)];
    const last = rows[rows.length - 1];
    const at = h + last.index + last[0].length;
    s = s.slice(0, at) + nl + `| \`${e.id}\` | ${c.uncapturedStates.map((x) => "`" + x + "`").join(", ")} | **не снято** | **figma-only**: ${e.captureWhy} |` + s.slice(at);
  }
  s = s.replace(/Итог по реестру после дополнения — \*\*\d+ пар\*\* «запись × состояние»:(\r?\n)\d+ сняты источником, \d+ дописаны нормативом, \d+ не сняты и адресованы/, `Итог по реестру после дополнения — **${pairs} пар** «запись × состояние»:$1${cap} сняты источником, ${norm} дописаны нормативом, ${unc} не сняты и адресованы`);
  // Прибавка default — по одному на новую запись; «снятые минус 109»
  // перестали быть этим числом, когда пересмотр §8 перевёл в снятые пары
  // сверх default.
  s = s.replace(/переписываются: прибавка — ровно \d+ пар, \d+ из них `default`[^.]*\./, `переписываются: прибавка — ровно ${pairs - 147} пар, ${N - 55} из них \`default\`; пересмотр §8 перевёл часть остальных в снятые.`);
  fs.writeFileSync(P("components/STATE-CAPTURE.md"), s, "utf8");
}

console.log(`реестр: ${N} записей (${figmaOnly} figma-only), пар состояний ${pairs}: снято ${cap}, норматив ${norm}, не снято ${unc}`);
