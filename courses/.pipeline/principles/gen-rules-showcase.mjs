// Разделы «Правила уровня страницы», «Decision Guides» и «Границы и GAP»
// в showcase/pages.html.
//
// Текст разделов не пишется здесь: он разбирается из docs/guide/composition.md,
// decisions.md и coverage.md модулем tools/showcase-docs.mjs. Первая редакция
// держала формулировки массивом в этом файле, и витрина разошлась с
// документом в трёх правилах (C-4, C-5, A-3), пока документ правили по ревью.
// Здесь остаётся только то, чего в документах нет и быть не должно:
// какой узел собранной страницы показать живым образцом и на каких кадрах
// витрины правило видно. Свежесть разделов проверяет
// tools/validate-showcase-docs.mjs.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PKG as pkg, inline, parseComposition, parseDecisions, parseCoverage, badgeOf, ruleParts, decisionParts, coverageRowHtml } from "../../tools/showcase-docs.mjs";

const PAGE = { "courses-listing": "витрина курсов", "education-centers-listing": "витрина организаций", rating: "рейтинг", "education-center": "страница школы", authors: "эксперты", author: "профиль" };
const link = (ids) => ids.map((i) => `<a href="#p-${i}">${PAGE[i]}</a>`).join(", ");

// Где правило видно на витрине и какой узел показать образцом:
// [страница, селектор, индекс] — узел вырезается из собранной страницы.
const SHOWCASE = {
  "SH-1": { pages: ["courses-listing", "education-center", "authors"] },
  "SH-2": { pages: ["courses-listing", "rating"] },
  "SH-3": { pages: ["courses-listing", "education-centers-listing"] },
  "SH-4": { pages: ["rating"] },
  "SH-5": { pages: ["education-centers-listing"] },
  "SH-6": { pages: ["education-centers-listing", "rating", "authors"] },
  "L-1": { pages: ["courses-listing", "rating"] },
  "L-2": { pages: ["courses-listing", "education-centers-listing", "education-center"] },
  "L-3a": { pages: ["courses-listing", "rating", "education-center"] },
  "L-3b": { pages: ["authors"] },
  "L-4": { pages: ["rating", "courses-listing", "authors"] },
  "L-5a": { pages: ["education-centers-listing", "education-center"] },
  "L-5b": { pages: ["authors"] },
  "C-1": { pages: ["courses-listing", "authors"], specimen: [["authors", "div.flex.flex-col.gap-1.rounded-3xl.border.border-solid", 0], ["education-centers-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0]] },
  "C-2": { pages: ["education-center"] },
  "C-3a": { pages: ["courses-listing", "education-centers-listing"], specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]] },
  "C-3b": { pages: ["courses-listing", "education-center"], specimen: [["courses-listing", "div.flex.flex-wrap.items-start.gap-1.self-stretch.text-micro", 0], ["education-center", "div.scrollbar-container.mt-2.flex.gap-1", 0], ["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 div.bg-ui-orange-500", 0]] },
  "C-3c": { pages: ["courses-listing", "authors", "author"], specimen: [["courses-listing", "div.flex.items-center.gap-2.whitespace-nowrap:has(> img.rounded-lg)", 0], ["authors", "div.relative.h-\\[68px\\].w-\\[68px\\]", 0]] },
  "A-1": { pages: ["education-centers-listing", "education-center"], specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]] },
  "A-2": { pages: ["courses-listing"], specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 div.bg-ui-orange-500", 0]] },
  "A-3": { pages: ["rating", "education-center", "author"] },
  "A-5": { pages: ["education-centers-listing", "education-center", "author"] },
  // Образец C-4 и C-5 — карточка целиком: у кнопки внутри неё реакция на
  // курсор объявлена, но сквозная ссылка карточки лежит сверху, и наведение
  // до кнопки не доходит. Кнопка вне карточки показана рядом для сравнения.
  "C-4": { pages: ["courses-listing"], specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0]] },
  "C-5": { pages: ["education-centers-listing", "courses-listing"], specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]] },
  "C-6": { pages: ["rating", "courses-listing"] },
  "R-1": { pages: ["courses-listing", "education-centers-listing"] },
  "R-2": { pages: ["courses-listing", "authors"] },
  "R-3": { pages: ["rating"] },
  "R-4": { pages: ["courses-listing", "education-center"] },
  "R-5": { pages: ["education-centers-listing", "rating"] },
  "CT-1": { pages: ["rating"] },
  "CT-2a": { pages: ["courses-listing"] },
  "CT-2b": { pages: ["education-centers-listing", "education-center"] },
  "CT-3a": { pages: ["courses-listing", "education-centers-listing"] },
  "CT-3b": { pages: ["education-centers-listing", "education-center"] },
};

const { areas, tail } = parseComposition();
const decisions = parseDecisions();
const coverage = parseCoverage();

// Каждое правило документа обязано иметь запись о витрине, и наоборот:
// правило без кадра или кадр без правила — ошибка сборки, а не пропуск.
const docIds = areas.flatMap((a) => a.rules.map((r) => r.id));
for (const id of docIds) if (!SHOWCASE[id]) throw new Error(`${id}: правило есть в composition.md, а кадров витрины для него не названо`);
for (const id of Object.keys(SHOWCASE)) if (!docIds.includes(id)) throw new Error(`${id}: кадры витрины названы, а правила в composition.md нет`);

// Живые образцы — из собранных страниц
const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const pg = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
const cache = {};
const specimens = {};
for (const [id, cfg] of Object.entries(SHOWCASE)) {
  if (!cfg.specimen) continue;
  specimens[id] = [];
  for (const [page, sel, idx] of cfg.specimen) {
    if (!cache[page]) cache[page] = fs.readFileSync(path.join(pkg, "showcase/pages", `${page}.html`), "utf8");
    await pg.setContent(cache[page]);
    const h = await pg.evaluate(({ sel, idx }) => { const n = document.querySelectorAll(sel)[idx]; return n ? n.outerHTML : null; }, { sel, idx });
    if (!h) throw new Error(`${id}: нет образца ${page} ${sel} #${idx}`);
    specimens[id].push(h.replace(/\.\.\/\.\.\/ui\//g, "../ui/"));
  }
}
await browser.close();

// --- Правила ---------------------------------------------------------------
let rulesOut = `<!-- rules:start — собрано .pipeline/principles/gen-rules-showcase.mjs из docs/guide/composition.md, руками не править -->
<section class="doc-section" id="doc-rules">
  <div class="doc-section__head">
    <span class="doc-section__num">3</span>
    <h2>Правила уровня страницы</h2>
    <p>Выведены голосованием по десяти снятым страницам (шаг R7). Текст раздела собран из <a href="../docs/guide/composition.md">docs/guide/composition.md</a> и совпадает с ним дословно — это проверяет <code>tools/validate-showcase-docs.mjs</code>. Решения для нового экрана — <a href="#doc-decisions">Decision Guides</a>, где знание кончается — <a href="#doc-coverage">границы и GAP</a>, замеры — <code>.pipeline/principles-evidence.md</code>.</p>
  </div>
`;
for (const area of areas) {
  rulesOut += `\n  <h3 class="doc-subhead">${inline(area.title)}</h3>\n`;
  for (const r of area.rules) {
    const parts = ruleParts(r);
    const html = specimens[r.id];
    rulesOut += `
  <div class="doc-rule" data-rule="${r.id}" id="rule-${r.id}">
    <div class="doc-rule__head">
      <h3>${r.id}</h3>
      <span class="doc-rule__votes">${inline(badgeOf(r.coverage))}</span>
    </div>
    ${parts.statement}
    ${parts.coverage}
    ${parts.exception}${html ? `
    <div class="doc-stage doc-stage--grid">
${html.map((h) => `      <div class="doc-variant"><div class="doc-variant__row" style="max-width:320px;display:block">${h}</div></div>`).join("\n")}
    </div>` : ""}
    <p class="doc-note">Видно на страницах: ${link(SHOWCASE[r.id].pages)}.</p>
  </div>
`;
  }
  for (const note of area.notes) rulesOut += `  <p class="doc-note">${inline(note)}</p>\n`;
  if (area.apply) rulesOut += `  <p class="doc-note">${inline(area.apply)}</p>\n`;
  if (area.examples) rulesOut += `  <p class="doc-note">${inline(area.examples)}</p>\n`;
}
for (const t of tail) {
  rulesOut += `\n  <h3 class="doc-subhead">${inline(t.title)}</h3>\n  <ul class="doc-note">\n${t.items.map((i) => `    <li>${inline(i)}</li>`).join("\n")}\n  </ul>\n`;
}
rulesOut += `</section>\n<!-- rules:end -->`;

// --- Decision Guides -------------------------------------------------------
let dgOut = `<!-- decisions:start — собрано .pipeline/principles/gen-rules-showcase.mjs из docs/guide/decisions.md, руками не править -->
<section class="doc-section" id="doc-decisions">
  <div class="doc-section__head">
    <span class="doc-section__num">4</span>
    <h2>Decision Guides</h2>
    <p>Как проектировать то, чего в продукте ещё нет: что измерено, когда применимо, что предпочесть и чего избегать, на чём стоит и где знание кончается. Текст собран из <a href="../docs/guide/decisions.md">docs/guide/decisions.md</a>; метка у решения — Confidence рекомендации, а не точность замера.</p>
  </div>
`;
for (const dg of decisions) {
  dgOut += `
  <div class="doc-rule" data-decision="${dg.id}" id="dg-${dg.id}">
    <div class="doc-rule__head">
      <h3>${dg.id}</h3>
      <span class="doc-rule__votes">${dg.confidence || "—"}</span>
    </div>
    <p><strong>${inline(dg.title)}</strong></p>
    ${decisionParts(dg).join("\n    ")}
  </div>
`;
}
dgOut += `</section>\n<!-- decisions:end -->`;

// --- Границы и GAP ---------------------------------------------------------
const table = (head, rows, wrapFrom) => `  <div class="doc-scroll">
    <table class="doc-table">
      <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>
${rows.map((cells) => `        ${coverageRowHtml(cells, wrapFrom)}`).join("\n")}
      </tbody>
    </table>
  </div>
`;
let covOut = `<!-- coverage:start — собрано .pipeline/principles/gen-rules-showcase.mjs из docs/guide/coverage.md, руками не править -->
<section class="doc-section" id="doc-coverage">
  <div class="doc-section__head">
    <span class="doc-section__num">5</span>
    <h2>Границы и GAP</h2>
    <p>Чего в пакете нет, какие конфликты источников остались открытыми и где знание кончается. Текст собран из <a href="../docs/guide/coverage.md">docs/guide/coverage.md</a>; опись снимков — <code>evidence/coverage.md</code>.</p>
  </div>
`;
if (coverage.showcaseCaveat) covOut += `  <p class="doc-note" data-caveat="showcase">${inline(coverage.showcaseCaveat)}</p>\n`;
covOut += `\n  <h3 class="doc-subhead">Чего в пакете нет</h3>\n` + table(["Не покрыто", "Почему"], coverage.notCovered, 1);
covOut += `\n  <h3 class="doc-subhead">Конфликты источников</h3>\n` + coverage.conflictsIntro.map((p) => `  <p class="doc-note">${inline(p)}</p>\n`).join("") + table(["№ BRIEF §5", "О чём", "Чем кончилось"], coverage.conflicts, 1);
covOut += `\n  <h3 class="doc-subhead">Реестр GAP</h3>\n  <p class="doc-note">${inline(coverage.gapIntro)}</p>\n` + table(["Документ", "GAP", "О чём"], coverage.gaps, 2);
covOut += `</section>\n<!-- coverage:end -->`;

// --- Запись ----------------------------------------------------------------
const file = path.join(pkg, "showcase/pages.html");
let html = fs.readFileSync(file, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n";
html = html.replace(/\r\n/g, "\n");
const place = (name, out, after) => {
  const re = new RegExp(`<!-- ${name}:start[\\s\\S]*?<!-- ${name}:end -->`);
  if (re.test(html)) html = html.replace(re, () => out);
  else if (after && html.includes(`<!-- ${after}:end -->`)) html = html.replace(`<!-- ${after}:end -->`, () => `<!-- ${after}:end -->\n\n${out}`);
  else html = html.replace("\n</main>", () => "\n" + out + "\n\n</main>");
};
place("rules", rulesOut);
place("decisions", dgOut, "rules");
place("coverage", covOut, "decisions");
const navRules = '    <li><a class="doc-nav__link doc-nav__link--top" href="#doc-rules">Правила уровня страницы</a></li>';
// Проверяется сама навигация: ссылка «#doc-decisions» есть и в тексте шапки
// раздела правил, и по всему файлу вставка пропускалась бы.
if (!html.includes('doc-nav__link--top" href="#doc-decisions"')) html = html.replace(navRules, () => `${navRules}\n    <li><a class="doc-nav__link doc-nav__link--top" href="#doc-decisions">Decision Guides</a></li>\n    <li><a class="doc-nav__link doc-nav__link--top" href="#doc-coverage">Границы и GAP</a></li>`);
fs.writeFileSync(file, html.replace(/\n/g, nl), "utf8");
console.log(`правил: ${docIds.length}, с живым образцом: ${Object.keys(specimens).length}; решений: ${decisions.length}; строк границ: ${coverage.notCovered.length}, конфликтов: ${coverage.conflicts.length}, GAP: ${coverage.gaps.length}`);
