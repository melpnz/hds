// Перевод записей в другой статус: реестр, витрина, сводки.
//
// Запуск: node set-status.mjs <status> <id> [<id> …]
//
// Статус записи — утверждение пакета о собственной работе (INDEX, «Как
// читать реестр»), и держится он в нескольких местах сразу: manifest.json,
// плашки секции витрины (`doc-tag`), сводные строки ROADMAP, README и INDEX.
// Скрипт меняет все, иначе они разойдутся. Статус шага в таблицах ROADMAP
// он не трогает: у шага работа может быть шире записи (R3-08 SearchInput —
// ещё и переписать селектор), и «запись complete» не значит «шаг done».
//
// complete допускается только у записей production и storybook-only с
// пустым uncapturedStates — ровно определение статуса в INDEX.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const P = (f) => path.join(pkg, f);
const [, , status, ...ids] = process.argv;
if (!["complete", "partial"].includes(status) || !ids.length) throw new Error("node set-status.mjs complete|partial <id>…");

const mPath = P("components/manifest.json");
const m = JSON.parse(fs.readFileSync(mPath, "utf8"));
for (const id of ids) {
  const c = m.components.find((x) => x.id === id);
  if (!c) throw new Error(`нет записи ${id}`);
  if (status === "complete") {
    if (!["production", "storybook-only"].includes(c.sourceScope)) throw new Error(`${id}: complete требует production или storybook-only, стоит ${c.sourceScope}`);
    if ((c.uncapturedStates || []).length) throw new Error(`${id}: не сняты ${c.uncapturedStates.join(", ")}`);
  }
  c.status = status;
}
fs.writeFileSync(mPath, JSON.stringify(m, null, 2) + "\n", "utf8");

// Витрина: плашки статуса внутри секции записи.
let h = fs.readFileSync(P("showcase/components.html"), "utf8");
for (const id of ids) {
  const a = h.indexOf(`<section class="doc-section" id="c-${id}">`);
  if (a < 0) throw new Error(`витрина: нет секции c-${id}`);
  const b = h.indexOf("\n    </section>", a);
  const sec = h.slice(a, b).replace(/<span class="doc-tag doc-tag--(?:partial|complete)">(?:partial|complete)<\/span>/g, `<span class="doc-tag doc-tag--${status}">${status}</span>`);
  h = h.slice(0, a) + sec + h.slice(b);
}
fs.writeFileSync(P("showcase/components.html"), h, "utf8");

// Сводки.
const count = (s) => m.components.filter((c) => c.status === s).length;
const complete = count("complete"), partial = count("partial"), figma = count("figma-only"), N = m.components.length;
const rw = (f, fn) => { const s = fs.readFileSync(P(f), "utf8"); const t = fn(s); if (t === s) console.warn(`  ${f}: сводка не найдена или не изменилась`); fs.writeFileSync(P(f), t, "utf8"); };
const completeWord = complete === 1 ? "1 `complete` (`sprite-icon`, R2-01)" : `${complete} \`complete\``;
rw("ROADMAP.md", (s) => s.replace(/\| Компонентов в manifest \| \*\*\d+\*\* записей — [^|]*?\*\*\d+ `partial`\*\* и \*\*\d+ `figma-only`\*\*/,
  `| Компонентов в manifest | **${N}** записей — **${completeWord}**, **${partial} \`partial\`** и **${figma} \`figma-only\`**`));
rw("README.md", (s) => s.replace(/, но\r?\n> доведена по полному циклу одна \(`SpriteIcon`\): \d+ записей — `partial`,\r?\n> собраны bulk-проходом R2-bulk, проза выведена из переписи корпуса,\r?\n> независимое ревью выборки идёт;|:\r?\n> \d+ — `complete` \(`SpriteIcon` — по полному циклу, остальные —\r?\n> bulk-проходом R2-bulk после двух кругов независимого ревью прозы\), \d+ — `partial`;/,
  `:\n> ${complete} — \`complete\` (\`SpriteIcon\` — по полному циклу, остальные —\n> bulk-проходом R2-bulk после двух кругов независимого ревью прозы), ${partial} — \`partial\`;`));
rw("components/INDEX.md", (s) => s.replace(/одна доведённая до `complete` —\n`SpriteIcon` \(R2-01, первый шаг вёрстки волны R2\), \d+ в статусе `partial`|\d+ в статусе `complete` \(`SpriteIcon` — R2-01 по полному циклу, остальные —\nbulk-проходом после двух кругов ревью прозы\), \d+ в статусе `partial`/,
  `${complete} в статусе \`complete\` (\`SpriteIcon\` — R2-01 по полному циклу, остальные —\nbulk-проходом после двух кругов ревью прозы), ${partial} в статусе \`partial\``));
console.log(`статус ${status}: ${ids.length} записей. Итого complete ${complete}, partial ${partial}, figma-only ${figma}.`);
