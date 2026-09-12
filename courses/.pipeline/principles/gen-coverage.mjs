// Опись доказательной базы: evidence/coverage.md (шаг R7-03).
//
// Числа берутся с диска и из components/manifest.json, руками в таблицах
// ничего не пишется. Человеческая часть покрытия — docs/guide/coverage.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const ev = path.join(pkg, "evidence");
const walk = (p) => fs.readdirSync(p, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)]));
const size = (files) => { const b = files.reduce((n, f) => n + fs.statSync(f).size, 0); return b > 10 * 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} МБ` : `${Math.round(b / 1024)} КБ`; };
const plural = (n, one, few, many) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many}`;
const table = (head, rows) => `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;

const all = walk(ev);
const prodDir = path.join(ev, "source/production");
const pagesDir = path.join(prodDir, "pages");
const pages = fs.readdirSync(pagesDir).sort();
const man = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const recs = man.components || man.records || [];
const has = (x, k) => (Array.isArray(x[k]) ? x[k].length > 0 : !!x[k]);
const count = (f) => recs.reduce((o, x) => ((o[f(x)] = (o[f(x)] || 0) + 1), o), {});
const list = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} — ${n}`).join("; ");

// ширины съёмки: по именам файлов dom*.html одной страницы
const widths = (p) => fs.readdirSync(path.join(pagesDir, p)).filter((f) => /^dom(-\d+)?\.html$/.test(f)).map((f) => (f === "dom.html" ? "1440" : f.match(/\d+/)[0])).sort((a, b) => a - b);

let md = `# Опись доказательной базы · Курсы

Что снято, когда и сколько этого на диске. Файл собирается
\`.pipeline/principles/gen-coverage.mjs\` из самой папки \`evidence/\` и
\`components/manifest.json\` — числа не пишутся руками. Что пакет из этого
выводит и где знание кончается — [\`docs/guide/coverage.md\`](../docs/guide/coverage.md).

Всего файлов доказательной базы: **${all.length}**, ${size(all)}, из них ${plural(all.filter((f) => f.endsWith(".png")).length, "скриншот", "скриншота", "скриншотов")}.

## Продакшен — снято гостем

Каждая страница снята в нескольких окнах: \`dom*.html\` — разметка,
\`computed*.json\` — вычисленные стили, \`tokens*.json\` — переменные \`:root\`,
\`meta*.json\` — условия съёмки, \`*.png\` — скриншот.

`;
md += table(["страница", "ширины `dom`", "файлов", "объём"], pages.map((p) => {
  const files = walk(path.join(pagesDir, p));
  return [`\`${p}\``, widths(p).join(", "), files.length, size(files)];
}));

const cssIn = walk(path.join(prodDir, "css/inline"));
const cssEx = walk(path.join(prodDir, "css/external"));
md += `\nКорпус CSS — ${plural(cssIn.length, "инлайновый файл", "инлайновых файла", "инлайновых файлов")} (по одному на страницу, ${size(cssIn)}) и ${cssEx.length} внешних (${size(cssEx)}). Правила в них написаны с атрибутом области видимости Vue (\`[data-v-…]\`); все инструменты пакета снимают его перед разбором.\n`;
md += `\nОтдельно лежит \`evidence/curated/\` — материал, собранный пакетом, а не снятый с продукта: сейчас это контрольная раскладка спрайта значков (\`sprite-icon/copy-check-400x200.png\`).\n`;
md += `\nЗамеры границ: \`media-queries.json\` и \`media-queries-cold.json\` — холодная проверка ширин, на которых меняется раскладка.\n`;

// Storybook и Figma
const sbCss = walk(path.join(ev, "source/storybook/css"));
const sbRen = walk(path.join(ev, "source/storybook/rendered"));
md += `\n## Storybook — локальный снимок

${plural(sbCss.length, "файл", "файла", "файлов")} CSS сборки (${size(sbCss)}) и ${plural(sbRen.length, "снятая story", "снятых story", "снятых story")} (${size(sbRen)}), опись — \`evidence/source/storybook/inventory.md\`. Снимок read-only: пакет из него берёт только то, чего нет в продакшене, и помечает \`storybook-only\`.

## Figma — файлов нет

Папка \`evidence/source/figma\` пуста: макет читается через MCP, а не выгружается. Адрес каждого узла лежит в записи реестра, поле \`figmaEvidence\`: файл, имя слоя, \`nodeId\` или \`componentKey\`. Записей с адресом в Figma — ${recs.filter((x) => has(x, "figmaEvidence")).length} из ${recs.length}. Страницы компонентов библиотеки \`education-lib\` через MCP не открываются (\`docs/guide/tokens.md\`, GAP-6), поэтому часть узлов адресуется только ключом компонента.

## Записи реестра

`;
md += table(["разрез", "значения"], [
  ["всего записей", recs.length],
  ["источник (`sourceScope`)", list(count((x) => x.sourceScope))],
  ["статус", list(count((x) => x.status))],
  ["с адресом в продакшене", recs.filter((x) => has(x, "productionEvidence")).length],
  ["с адресом в Storybook", recs.filter((x) => has(x, "storybookEvidence")).length],
  ["с адресом в Figma", recs.filter((x) => has(x, "figmaEvidence")).length],
  ["с записанным конфликтом источников", recs.filter((x) => has(x, "sourceConflicts")).length],
]);

const st = recs.reduce((o, x) => ({ req: o.req + (x.requiredStates || []).length, cap: o.cap + (x.capturedStates || []).length, unc: o.unc + (x.uncapturedStates || []).length }), { req: 0, cap: 0, unc: 0 });
md += `\nСостояния: требуется ${st.req}, снято ${st.cap}, не снято ${st.unc}. Какие именно не сняты — в поле \`uncapturedStates\` каждой записи.\n`;

const conf = recs.filter((x) => has(x, "sourceConflicts"));
md += `\nЗаписи с конфликтом источников:\n\n` + table(["запись", "ссылка", "о чём"], conf.flatMap((x) => x.sourceConflicts.map((c) => [`\`${x.id}\``, c.ref || "—", c.summary || "—"])));

// покрытие правил R7
const axes = path.join(d, "axes.json");
if (fs.existsSync(axes)) {
  const A = JSON.parse(fs.readFileSync(axes, "utf8"));
  const P = Object.keys(A);
  const W = Object.keys(A[P[0]]);
  md += `\n## Замеры принципов (R7)

Правила уровня страницы стоят на \`.pipeline/principles/axes.json\`: ${plural(P.length, "страница", "страницы", "страниц")} × ${plural(W.length, "ширина", "ширины", "ширин")} (${W.join(", ")}), по 17 осям. Файл пересобирается одним запуском \`measure-axes.mjs\`, таблицы — \`gen-evidence.mjs\` → \`.pipeline/principles-evidence.md\`. Страницы рисуются из того же \`dom*.html\` и корпуса CSS, что описаны выше, со шрифтом Inter из \`ui/assets/fonts\` и без скрипта.
`;
}

md += `\n## Что снято не было

- Прод ради принципов и ради страниц повторно не открывается: шаги R6 и R7
  работают на снимках инвентаризации (METHOD, skills \`guide-pages\` и
  \`guide-principles\`).
- Ассеты раздела экспертов (спрайт \`experts.svg\`, иллюстрация и заглушка
  логотипа) в \`ui/assets/\` не лежат — строка X-102 роадмапа; на витрине
  страницы они стоят заглушкой.
- Ширина 1024 у токенов и у замеров шкалы отсутствует (\`tokens.md\` GAP-8,
  \`typography.md\` GAP-4); у принципов 1024 снята.
`;

fs.writeFileSync(path.join(ev, "coverage.md"), md, "utf8");
console.log("evidence/coverage.md:", md.length, "символов");
