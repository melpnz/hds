// Вставка секций компонентов в showcase/components.html и правка реестра.
// Секции собираются из results.json (gen-specs.mjs) — из тех же снятых
// доказательств, что и спецификации. Оболочка секции — существующая форма
// витрины (doc-section / doc-specimen / doc-spec / doc-note), новых классов
// оболочки не заводится: METHOD §6.2 держит префикс doc-.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const results = JSON.parse(fs.readFileSync(path.join(d, "results.json"), "utf8")).filter((r) => !r.skipped);
const computedRoots = JSON.parse(fs.readFileSync(path.join(d, "computed.json"), "utf8"));
const manifestPath = path.join(pkg, "components/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const byId = new Map((manifest.components || manifest.entries).map((c) => [c.id, c]));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function section(r) {
  const c = byId.get(r.id);
  const cr = computedRoots[r.id];
  const spec = [];
  if (cr) {
    spec.push(["коробка", cr.box?.w && cr.box?.h
      ? `${cr.box.w}×${cr.box.h} на 1440`
      : `в снимке ${cr.box?.w}×${cr.box?.h} — узел в момент съёмки не был разложен; объявлено ${cr.styles.width || "?"} × ${cr.styles.height || "?"}`]);
    if (cr.styles["background-color"] && cr.styles["background-color"] !== "rgba(0, 0, 0, 0)") spec.push(["фон", cr.styles["background-color"]]);
    if (cr.styles["border-radius"] && cr.styles["border-radius"] !== "0px") spec.push(["радиус", cr.styles["border-radius"]]);
    if (cr.styles.padding && cr.styles.padding !== "0px") spec.push(["падинг", cr.styles.padding]);
    if (cr.styles.gap && cr.styles.gap !== "normal") spec.push(["gap", cr.styles.gap]);
  }
  spec.push(["вхождений", `${r.found} на ${r.pages.length}/10 страниц`]);
  spec.push(["корневые классы", r.cssRoots.join(" ")]);

  const placehold = r.placeheld.length
    ? `<p class="doc-note"><strong>Заглушки.</strong> ${r.placeheld.length} ссыл${r.placeheld.length === 1 ? "ка" : "ок"} на пользовательское и партнёрское содержимое заменены локальной заглушкой <code>ui/assets/images/content-placeholder.svg</code>: чужие файлы в пакет не копируются. Геометрию это не меняет — размер задаёт компонент. Продовые пути сохранены в <a href="../components/${r.specRel}">спецификации</a>, раздел «Анатомия».</p>`
    : "";

  return `
    <section class="doc-section" id="c-${r.id}">
      <div class="doc-section__head">
        <h4>${esc(r.name)}</h4>
        <p>${esc(r.notes || "Заметки инвентаризации по этой записи нет.")}</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>default</h5>
          <code>${esc(r.selector)}</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
          <span class="doc-tag doc-tag--partial">partial</span>
        </div>
        <div class="doc-stage">
          <div class="doc-variant">
            <span class="doc-variant__label">разметка со страницы <code>${esc(r.pages[0])}</code>, ${r.descendants} узл${r.descendants === 1 ? "а" : "ов"} внутри корня, ${r.classes} классов в поддереве</span>
            <div class="doc-variant__row">
${r.showcaseHtml.split("\n").map((l) => "              " + l).join("\n")}
            </div>
          </div>
        </div>
        <dl class="doc-spec">
${spec.map(([k, v]) => `          <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("\n")}
        </dl>
        ${placehold}
        <p class="doc-note">
          <strong>Что здесь есть и чего нет.</strong> Разметка и числа сняты:
          селектор измерен браузером по десяти <code>dom.html</code>
          (<code>components/selector-census.json</code>), вычисленные значения
          взяты из снимка живого прода${cr ? ` (<code>computed.json</code>, узел <code>${esc((cr.path || "").slice(-60))}</code>)` : ""},
          правила класса подняты из корпуса прод-CSS парсером в
          <code>ui/utilities-components.css</code>. Прозаический разбор —
          поведение, клавиатура, правила — не написан: запись стоит в статусе
          <code>partial</code>, дописывает шаг <code>${esc(c.step)}</code>.
          Полностью — <a href="../components/${r.specRel}">спецификация</a>.
        </p>
      </div>
    </section>
`;
}

let html = fs.readFileSync(path.join(pkg, "showcase/components.html"), "utf8");

// Уже стоящие на витрине секции пропускаются: инструмент дописывает новые
// записи, а не пересобирает страницу. Иначе повторный прогон дублировал бы
// всё, что после первой вставки правилось руками или другими генераторами
// (каталоги вариантов, блоки состояний, предупреждение о HTTP).
const already = new Set();
for (const m of html.matchAll(/id="c-([a-z0-9-]+)"/g)) already.add(m[1]);

const byCategory = new Map();
for (const r of results) {
  if (already.has(r.id)) continue;
  if (!byCategory.has(r.category)) byCategory.set(r.category, []);
  byCategory.get(r.category).push(r);
}
if (![...byCategory.values()].flat().length) console.log("Новых записей для витрины нет — все уже стоят.");

let inserted = 0;
for (const [cat, list] of byCategory) {
  const body = list.sort((a, b) => b.found - a.found).map(section).join("");
  const catOpen = `<section class="doc-category" id="doc-cat-${cat}">`;
  const idx = html.indexOf(catOpen);
  if (idx < 0) { console.warn(`категория ${cat} не найдена на витрине`); continue; }
  const end = html.indexOf("\n  </section>", idx);
  const block = html.slice(idx, end);
  const emptyRe = /\n\s*<p class="doc-empty">[^<]*<\/p>/;
  const newBlock = emptyRe.test(block) ? block.replace(emptyRe, "\n" + body) : block + body;
  html = html.slice(0, idx) + newBlock + html.slice(end);
  inserted += list.length;
}
fs.writeFileSync(path.join(pkg, "showcase/components.html"), html, "utf8");
console.log(`Секций вставлено: ${inserted}`);

// ---------- реестр ----------
let touched = 0;
for (const r of results) {
  const c = byId.get(r.id);
  c.status = "partial";
  c.specPath = r.specRel;
  c.showcaseAnchor = `c-${r.id}`;
  c.cssRoots = r.cssRoots;
  touched++;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Записей реестра обновлено: ${touched}`);
