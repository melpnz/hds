// Принятие измерения в реестр — отдельный шаг, отдельный запуск, поимённый
// список. Измеряет tools/measure-selectors.mjs, а этот скрипт переносит
// измеренное в manifest.json только у тех записей, которые названы здесь,
// и только с записанной причиной. Всё, что измерение изменило помимо
// названного, он не трогает и печатает как оставшееся расхождение.
import fs from "node:fs";

const manifestPath = "components/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const census = JSON.parse(fs.readFileSync("components/selector-census.json", "utf8"));

const adopt = {
  "article-card": "селектор сужен двумя :not() по аудиту review-2: прежние 80/6 включали 40 CourseCard и 8 SchoolCard",
  "project-icon": "селектор расширен со footer на обе позиции значка: прежние 40/10 считали только футерные, шапка не считалась",
};

let adopted = 0;
const remaining = [];
for (const component of manifest.components) {
  const rows = census.selectors[component.id];
  if (!rows || rows.some((row) => row.error)) continue;
  const found = rows.reduce((sum, row) => sum + row.found, 0);
  const pages = [...new Set(rows.flatMap((row) => row.pages))].sort();
  const same =
    found === component.occurrences &&
    pages.join(",") === [...(component.seenOn ?? [])].sort().join(",");
  if (same) continue;
  if (!adopt[component.id]) {
    remaining.push(`${component.id}: заявлено ${component.occurrences}/${(component.seenOn ?? []).length}, измерено ${found}/${pages.length}`);
    continue;
  }
  console.log(
    `${component.id}: ${component.occurrences}/${(component.seenOn ?? []).length} → ${found}/${pages.length} — ${adopt[component.id]}`,
  );
  component.occurrences = found;
  component.seenOn = pages;
  adopted += 1;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nПринято ${adopted} из названных ${Object.keys(adopt).length}.`);
if (remaining.length) {
  console.log(`Осталось расхождений (не названы — не приняты): ${remaining.length}`);
  for (const line of remaining) console.log(`- ${line}`);
}
