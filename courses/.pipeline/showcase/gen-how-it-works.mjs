// Блок «Как работает» в секциях записей showcase/components.html.
//
// Текст берётся из раздела «Как работает» спецификации записи
// (components/<категория>/<id>.md) модулем tools/showcase-docs.mjs и стоит
// между маркерами <!-- how:<id>:start --> и <!-- how:<id>:end --> сразу под
// шапкой секции. Блок пересобирается целиком при каждом запуске: в отличие от
// скриптов R2-bulk, которые вставляют блок один раз и потом пропускают
// секцию, здесь витрина обязана следовать за спецификацией. Свежесть
// проверяет tools/validate-showcase-docs.mjs.
//
// Почему блок заведён. Факт о сквозной ссылке, которая накрывает кнопку в
// CourseCard и SchoolCard, был записан в спецификации SchoolCard ещё на R2,
// но до витрины компонентов не дошёл: её секции собирали скрипты, которые
// спецификацию «Как работает» не читали.
import fs from "node:fs";
import path from "node:path";
import { PKG, parseHowItWorks, howBlockHtml } from "../../tools/showcase-docs.mjs";

const file = path.join(PKG, "showcase/components.html");
let html = fs.readFileSync(file, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n";
html = html.replace(/\r\n/g, "\n");

const blocks = parseHowItWorks();
const ids = new Set(blocks.map((b) => b.id));
let replaced = 0, inserted = 0;
const missing = [];

for (const h of blocks) {
  const out = `<!-- how:${h.id}:start — собрано .pipeline/showcase/gen-how-it-works.mjs из ${h.file}, руками не править -->\n        ${howBlockHtml(h)}\n        <!-- how:${h.id}:end -->`;
  const re = new RegExp(`<!-- how:${h.id}:start[\\s\\S]*?<!-- how:${h.id}:end -->`);
  if (re.test(html)) { html = html.replace(re, () => out); replaced++; continue; }
  const start = html.indexOf(`id="${h.anchor}"`);
  if (start < 0) { missing.push(h.id); continue; }
  const head = html.indexOf(`<div class="doc-section__head">`, start);
  const secEnd = html.indexOf("\n    </section>", start);
  const headEnd = head < 0 ? -1 : html.indexOf("\n      </div>", head);
  if (head < 0 || headEnd < 0 || headEnd > secEnd) { missing.push(h.id); continue; }
  const at = headEnd + "\n      </div>".length;
  html = html.slice(0, at) + `\n\n      <div class="doc-specimen">\n        ${out}\n      </div>` + html.slice(at);
  inserted++;
}

// Блок, у которого в спецификации больше нет раздела, удаляется вместе с
// обёрткой: иначе витрина держала бы текст, которого нет в источнике.
let removed = 0;
html = html.replace(/\n\n      <div class="doc-specimen">\n        <!-- how:([a-z0-9-]+):start[\s\S]*?<!-- how:\1:end -->\n      <\/div>/g, (all, id) => {
  if (ids.has(id)) return all;
  removed++;
  return "";
});

if (missing.length) throw new Error(`секции витрины не найдены у записей: ${missing.join(", ")}`);
fs.writeFileSync(file, html.replace(/\n/g, nl), "utf8");
console.log(`блоков «Как работает»: ${blocks.length} (вставлено ${inserted}, пересобрано ${replaced}, удалено ${removed})`);
