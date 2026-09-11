// Блок «адаптив» в секциях записей, у которых есть классы с брейкпоинт-префиксом.
//
// Показывает две вещи и честно их разделяет:
//   1. Таблицу классов записи с их условием и объявлением — это факт,
//      снятый из корпуса и поднятый в ui/utilities-components.css.
//   2. Тот же образец в контейнере 320px — это геометрия компонента в узкой
//      коробке, и только она. Префиксы сборки Курсов смотрят на ширину ОКНА
//      (@media), а не контейнера, и внутри узкого блока при широком окне
//      не срабатывают. Написать «вот мобильный вид» здесь было бы неправдой.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const results = JSON.parse(fs.readFileSync(path.join(d, "results.json"), "utf8")).filter((r) => !r.skipped);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PREFIX_RE = /^(small-phone|phone|phablet-and-tablet|tablet-only|tablet|desktop):/;
const CONDITION = {
  "small-phone": "(max-width: 479px)",
  phone: "(max-width: 767px)",
  "phablet-and-tablet": "(min-width: 480px) and (max-width: 1023px)",
  "tablet-only": "(min-width: 768px) and (max-width: 1023px)",
  tablet: "(max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

let html = fs.readFileSync(showcasePath, "utf8");
let added = 0, classesShown = 0;

for (const r of results) {
  const resolvedPath = path.join(d, "resolved", `${r.id}.json`);
  if (!fs.existsSync(resolvedPath)) continue;
  const resolved = JSON.parse(fs.readFileSync(resolvedPath, "utf8")).resolved;
  const responsive = Object.entries(resolved)
    .filter(([c]) => PREFIX_RE.test(c))
    .sort((a, b) => a[0].localeCompare(b[0]));
  if (!responsive.length) continue;

  const start = html.indexOf(`id="c-${r.id}"`);
  if (start < 0) continue;
  const secEnd = html.indexOf("\n    </section>", start);
  if (html.slice(start, secEnd).includes(">адаптив<")) continue;

  const rows = responsive.map(([cls, variants]) => {
    const prefix = PREFIX_RE.exec(cls)[1];
    const decls = [...new Set(variants.map((v) => v.decls))].join(" · ");
    return `            <tr><td><code>${esc(cls)}</code></td><td><code>${esc(CONDITION[prefix] || "?")}</code></td><td><code>${esc(decls.length > 110 ? decls.slice(0, 110) + "…" : decls)}</code></td></tr>`;
  }).join("\n");
  classesShown += responsive.length;

  const prefixes = [...new Set(responsive.map(([c]) => PREFIX_RE.exec(c)[1]))];

  const block = `
      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>адаптив</h5>
          <code>${prefixes.map((p) => p + ":").join(" · ")}</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
        </div>
        <table class="doc-table">
          <thead><tr><th>класс</th><th>условие</th><th>объявление</th></tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
        <div class="doc-stage">
          <div class="doc-variant">
            <span class="doc-variant__label">тот же образец в контейнере 320px</span>
            <div class="doc-variant__row">
              <div class="doc-narrow">
${r.showcaseHtml.split("\n").map((l) => "                " + l).join("\n")}
              </div>
            </div>
          </div>
        </div>
        <p class="doc-note"><strong>Что показывает узкий контейнер, а что нет.</strong>
          Он показывает геометрию компонента в коробке 320px — как переносится
          содержимое, что обрезается, где ломается сетка. Он <strong>не</strong>
          показывает срабатывание префиксов: условия сборки Курсов — обычные
          <code>@media</code>, они смотрят на ширину окна, а не контейнера,
          и внутри узкого блока при широком окне не включаются. Чтобы увидеть
          сами префиксы, сузьте окно — границы размечены в разделе «Основания»,
          подраздел «Брейкпоинты».</p>
      </div>
`;
  html = html.slice(0, secEnd) + "\n" + block + html.slice(secEnd);
  added++;
}

fs.writeFileSync(showcasePath, html, "utf8");
console.log(`Блоков «адаптив» вставлено: ${added}, классов показано: ${classesShown}`);
