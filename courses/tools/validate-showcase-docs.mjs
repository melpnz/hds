// Гейт свежести витрины страниц: разделы правил, Decision Guides и границ
// в showcase/pages.html обязаны совпадать с docs/guide/composition.md,
// decisions.md и coverage.md дословно.
//
// Зачем. validate-showcase-claims сверяет витрину только с ui/. Витрина
// правил держала формулировки отдельно от документа и отстала от него в
// трёх правилах, пока документ правили по ревью: C-5 обещал «173 из 173,
// нарушителей нет», хотя кнопку в карточке накрывает сквозная ссылка. Этот
// гейт рендерит тексты тем же модулем, что и генератор, и ищет их на витрине.
//
// Падает, если: у правила, решения или строки таблицы нет блока на витрине;
// текст блока разошёлся с документом; на витрине есть блок, которого в
// документе нет.
import fs from "node:fs";
import path from "node:path";
import { PKG, inline, parseComposition, parseDecisions, parseCoverage, ruleParts, decisionParts, coverageRowHtml } from "./showcase-docs.mjs";

const html = fs.readFileSync(path.join(PKG, "showcase/pages.html"), "utf8").replace(/\r\n/g, "\n");
const errors = [];
const fail = (where, what) => errors.push(`${where} — ${what}`);

const region = (name) => {
  const m = html.match(new RegExp(`<!-- ${name}:start[\\s\\S]*?<!-- ${name}:end -->`));
  if (!m) fail("showcase/pages.html", `нет раздела между маркерами ${name}:start и ${name}:end`);
  return m ? m[0] : "";
};
// Блок витрины — от открывающего div до закрывающего на том же отступе.
const blockOf = (text, attr, id) => {
  const m = text.match(new RegExp(`<div class="doc-rule" ${attr}="${id}"[\\s\\S]*?\\n  </div>\\n`));
  return m ? m[0] : null;
};

// --- Правила ---
const rules = region("rules");
const { areas, tail } = parseComposition();
const docRuleIds = new Set();
let checked = 0;
for (const area of areas) {
  if (!rules.includes(`<h3 class="doc-subhead">${inline(area.title)}</h3>`)) fail(`раздел «${area.title}»`, "на витрине нет заголовка области");
  for (const r of area.rules) {
    docRuleIds.add(r.id);
    const block = blockOf(rules, "data-rule", r.id);
    if (!block) { fail(r.id, "на витрине нет блока правила"); continue; }
    for (const [part, text] of Object.entries(ruleParts(r))) {
      checked++;
      if (!block.includes(text)) fail(r.id, `${part} на витрине разошёлся с composition.md`);
    }
  }
  for (const p of [...area.notes, area.apply, area.examples].filter(Boolean)) {
    checked++;
    if (!rules.includes(`<p class="doc-note">${inline(p)}</p>`)) fail(`раздел «${area.title}»`, `на витрине нет абзаца «${p.slice(0, 50)}…»`);
  }
}
for (const t of tail) for (const item of t.items) {
  checked++;
  if (!rules.includes(`<li>${inline(item)}</li>`)) fail(`«${t.title}»`, `на витрине нет пункта «${item.slice(0, 50)}…»`);
}
for (const m of rules.matchAll(/data-rule="([^"]+)"/g)) if (!docRuleIds.has(m[1])) fail(m[1], "блок на витрине есть, а правила в composition.md нет");

// --- Decision Guides ---
const dgRegion = region("decisions");
const decisions = parseDecisions();
const dgIds = new Set(decisions.map((d) => d.id));
for (const dg of decisions) {
  const block = blockOf(dgRegion, "data-decision", dg.id);
  if (!block) { fail(dg.id, "на витрине нет блока решения"); continue; }
  for (const text of [`<p><strong>${inline(dg.title)}</strong></p>`, ...decisionParts(dg)]) {
    checked++;
    if (!block.includes(text)) fail(dg.id, `абзац «${text.replace(/<[^>]+>/g, "").slice(0, 40)}…» разошёлся с decisions.md`);
  }
  if (!block.includes(`<span class="doc-rule__votes">${dg.confidence || "—"}</span>`)) fail(dg.id, "метка Confidence разошлась с decisions.md");
}
for (const m of dgRegion.matchAll(/data-decision="([^"]+)"/g)) if (!dgIds.has(m[1])) fail(m[1], "блок на витрине есть, а решения в decisions.md нет");

// --- Границы и GAP ---
const cov = region("coverage");
const coverage = parseCoverage();
const rowsFor = [[coverage.notCovered, 1, "Чего в пакете нет"], [coverage.conflicts, 1, "Конфликты"], [coverage.gaps, 2, "Реестр GAP"]];
for (const [rows, wrapFrom, name] of rowsFor) for (const cells of rows) {
  checked++;
  if (!cov.includes(coverageRowHtml(cells, wrapFrom))) fail(name, `на витрине нет строки «${cells.join(" · ").slice(0, 60)}…»`);
}
if (coverage.showcaseCaveat) {
  checked++;
  if (!cov.includes(inline(coverage.showcaseCaveat))) fail("coverage.md", "абзац «Витрина — не продукт» на витрине разошёлся с документом");
}

if (errors.length) {
  console.error(`Витрина разошлась с документами (${errors.length}):\n`);
  for (const e of errors) console.error("  " + e);
  console.error("\nТекст этих разделов собирается из docs/guide/*.md. Правьте документ,\nа витрину пересоберите: node .pipeline/principles/gen-rules-showcase.mjs");
  process.exit(1);
}
console.log(`Витрина сходится с документами: правил ${docRuleIds.size}, решений ${decisions.length}, строк границ и GAP ${coverage.notCovered.length + coverage.conflicts.length + coverage.gaps.length}; сверено фрагментов ${checked}.`);
