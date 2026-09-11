// Спецификации и секции витрины для записей sourceScope: storybook-only.
//
// Разметка — из снятого Storybook (evidence/source/storybook/rendered),
// правила — из корпуса, который назвал extract-storybook.mjs. Отличие от
// прод-записей одно и важное: в снятой разметке десяти прод-страниц этих
// компонентов нет вовсе, и на витрине это сказано значком S и словами,
// а не подразумевается статусом в реестре.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const manifestPath = path.join(pkg, "components/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const byId = new Map(manifest.components.map((c) => [c.id, c]));
const data = JSON.parse(fs.readFileSync(path.join(d, "storybook-only.json"), "utf8"));

// Разметка состояний — из того же STATE-CAPTURE.md §3, что и у прод-записей.
const stateTable = new Map();
{
  const md = fs.readFileSync(path.join(pkg, "components/STATE-CAPTURE.md"), "utf8");
  for (const m of md.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`([a-zA-Z-]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/gm)) {
    const [, id, state, outcomeRaw, source] = m;
    if (!stateTable.has(id)) stateTable.set(id, []);
    stateTable.get(id).push({ state, outcome: outcomeRaw.replace(/\*\*/g, "").trim(), source: source.trim() });
  }
}
// Слово class= из цитат убирается: в прозе это перечисление классов, а в сыром
// тексте страницы — поддельный атрибут (та же правка, что в gen-states.mjs).
const stripClassAttr = (x) => x.replace(/class\s*=\s*"([^"]*)"/g, "$1");
const statesSection = (c) => {
  const rows = stateTable.get(c.id) || [];
  const known = new Set(rows.map((r) => r.state));
  const extra = (c.requiredStates || []).filter((x) => !known.has(x))
    .map((state) => ({
      state,
      outcome: (c.capturedStates || []).includes(state) ? "снято"
        : (c.normativeStates || []).includes(state) ? "не снято — норматив" : "не снято",
      source: "разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра",
    }));
  const all = [...rows, ...extra];
  if (!all.length) return "";
  const body = all.map((r) => {
    const mark = r.outcome.startsWith("снято") ? "снято" : r.outcome.includes("норматив") ? "норматив" : "GAP";
    return `| \`${r.state}\` | ${mark} | STATE-CAPTURE.md §3 говорит: «${stripClassAttr(r.source)}» |`;
  }).join("\n");
  return `## Состояния

Словарь и требуемость — [\`components/STATES.md\`](../STATES.md) (R1-01), снятость
пар «запись × состояние» — [\`components/STATE-CAPTURE.md\`](../STATE-CAPTURE.md) (R1-02).

| состояние | снято? | чем именно |
|---|---|---|
${body}

`;
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const stripScope = (h) => h.replace(/\s+data-v-[0-9a-f]+(?:="")?/g, "");

// Ассеты — в локальные копии ui/assets/, как и у прод-записей: витрина
// наружу не ходит (METHOD §6.3, гейт validate-showcase-icons).
const DIRECT = {
  "/courses-web/images/filters/star.png": "../ui/assets/images/star.png",
  "/courses-web/images/avatars/logo.svg": "../ui/assets/images/logo.svg",
};
const localizeAssets = (h) => h.replace(
  /((?:xlink:href|href|src)\s*=\s*")([^"]*\.(?:svg|png|jpe?g|gif|webp|ico)[^"]*)(")/gi,
  (m, pre, ref, post) => {
    if (DIRECT[ref]) return pre + DIRECT[ref] + post;
    if (/sprite\.svg/.test(ref)) return pre + ref.replace(/^.*sprite\.svg(?:\?[^#]*)?/, "../ui/assets/icons/sprite.svg") + post;
    if (/social-v3\.1\.svg/.test(ref)) return pre + ref.replace(/^.*social-v3\.1\.svg(?:\?[^#]*)?/, "../ui/assets/icons/social-v3.1.svg") + post;
    return pre + "../ui/assets/images/content-placeholder.svg" + post;
  });

const CATEGORY_TITLE = {
  "data-display": "Отображение данных", actions: "Действия", forms: "Формы",
  navigation: "Навигация", collections: "Коллекции", layout: "Раскладка",
  feedback: "Обратная связь", overlays: "Оверлеи", "frame-modules": "Модули оболочки",
  entities: "Сущности",
};

let html = fs.readFileSync(showcasePath, "utf8");
let specs = 0, sections = 0;

for (const [id, v] of Object.entries(data)) {
  const c = byId.get(id);
  if (!c) { console.warn(`нет записи реестра: ${id}`); continue; }
  const markup = localizeAssets(stripScope(v.html));
  const rootClasses = (/^<[a-z]+[^>]*class="([^"]*)"/.exec(markup) || [, ""])[1].split(/\s+/).filter(Boolean);
  // Корень — первый класс корневого узла, у которого есть правило. Классов
  // без правила в корне быть не должно: METHOD §6.5 требует существующего.
  const cssRoots = [...new Set(rootClasses)].filter((x) => v.resolved[x]).slice(0, 1);
  if (!cssRoots.length) { console.warn(`${id}: у корня нет класса с правилом`); continue; }

  const files = [...new Set(Object.values(v.resolved).flat().map((r) => `${r.origin}/${r.file}`))].sort();
  const prodFiles = files.filter((f) => f.startsWith("production/")).length;
  const sbFiles = files.filter((f) => f.startsWith("storybook/")).length;

  // ---------- спецификация ----------
  const specRel = `${c.category}/${id}.md`;
  const md = `# ${c.canonicalName}${c.legacyAliases?.length ? " · " + c.legacyAliases.join(" · ") : ""}

| | |
|---|---|
| **Категория** | ${CATEGORY_TITLE[c.category] || c.category} (\`${c.category}\`) |
| **Корневой класс** | \`${cssRoots[0]}\` |
| **CSS** | утилиты \`ui/utilities-components.css\` |
| **Живая реализация** | [\`showcase/components.html#c-${id}\`](../../showcase/components.html#c-${id}) |
| **Источник** | Storybook \`${v.name}\`, story \`${v.story}\` |
| **Snapshot** | ${(c.capturedStates || []).length} из ${(c.requiredStates || []).length} состояний снято |

## Когда использовать

**Компонента нет в снятой разметке продукта.** Ни одного узла на десяти снятых
страницах: класс корня \`${cssRoots[0]}\` в \`evidence/source/production/pages/*/dom.html\`
не встречается. Он существует как компонент реализации — story \`${v.story}\`
снимка Storybook (\`evidence/source/storybook/\`) — и как правила в сборке.

${c.notes ? c.notes : "_Заметки инвентаризации по этой записи нет._"}

> Правило применения здесь не выведено: вывести его не из чего, пока компонент
> не найден в продукте. Шаг ${c.step} решает, остаётся ли запись \`storybook-only\`
> или у неё находится прод-адрес.

## Разметка

Фрагмент вставляется на пустую страницу с одним \`ui/courses.css\` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

\`\`\`html
${markup}
\`\`\`

## Анатомия

Дерево из снятой story \`${v.story}\`, фреймворк-скоуп (\`data-v-*\`) снят,
обёртка стенда Storybook (\`p-8\` и раскладка под несколько образцов) отброшена —
она принадлежит стенду, а не компоненту.

- корневой тег: \`${v.tag}\`
- узлов внутри корня: **${v.descendants}**
- классов в поддереве: **${v.classes.length}**

## Откуда правила

Из **${v.fromProd}** классов поддерева правило нашлось в корпусе продакшена,
из **${v.fromSb}** — только в CSS сборки Storybook, у **${v.missing.length}**
правила нет нигде.

Это и есть главный факт записи: компонент **не найден в разметке** продукта,
но его правила продуктовая сборка **уже несёт**. То есть \`storybook-only\`
здесь значит «нет в снятой разметке», а не «нет в продукте вовсе».

Файлы-источники: ${files.map((f) => "`" + f + "`").join(", ")} (${prodFiles} из корпуса продакшена${sbFiles ? `, ${sbFiles} из сборки Storybook` : ""}).

${statesSection(c)}## Ограничения

${v.missing.length ? `- **Классы без правила.** ${v.missing.map((x) => "`" + x + "`").join(", ")} — объявления нет ни в 22 файлах прод-корпуса, ни в 13 файлах CSS снимка Storybook. См. раздел «Находки» витрины.\n` : ""}- **Прод-адреса нет.** Пока компонент не найден в продукте, ни \`occurrences\`, ни \`seenOn\` у записи не заполняются: измерять нечего. Числа в реестре остаются нулями осознанно.
- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса. Запись стоит в статусе \`partial\`: вёрстка и факты есть, статья — нет. Дописывает шаг ${c.step}.

## Источники

**Storybook.** \`${v.name}\` → story \`${v.story}\`, снимок в
\`evidence/source/storybook/rendered/${v.story}.html\`; сборка Storybook 8.4.7,
снята 2 сентября 2026 (\`evidence/source/storybook/inventory.md\`).

**Production.** Разметки нет. Правила классов — корпус
\`evidence/source/production/css\`.

${(c.figmaEvidence || []).length ? `**Figma.** ${c.figmaEvidence.map((f) => `\`${f.sourceName}\`${f.nodeId ? ", узел " + f.nodeId : f.componentKey ? ", componentKey " + String(f.componentKey).slice(0, 8) : ""}`).join("; ")}` : "**Figma.** Узел для этой записи не сопоставлен."}

---

_Собрано bulk-проходом \`.pipeline/R2-bulk/gen-storybook-sections.mjs\` из снятого
Storybook и корпуса прод-CSS. Ни одно значение здесь не написано от руки._
`;
  fs.mkdirSync(path.join(pkg, "components", c.category), { recursive: true });
  fs.writeFileSync(path.join(pkg, "components", specRel), md, "utf8");
  specs++;

  // ---------- секция витрины ----------
  if (!html.includes(`id="c-${id}"`)) {
    const section = `
    <section class="doc-section" id="c-${id}">
      <div class="doc-section__head">
        <h4>${esc(c.canonicalName)}</h4>
        <p>${esc(c.notes || "Заметки инвентаризации по этой записи нет.")}</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>default</h5>
          <code>${esc(v.tag)}.${esc(cssRoots[0])}</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--storybook" title="storybook-only" aria-label="storybook-only">S</span>
          </span>
          <span class="doc-tag doc-tag--partial">partial</span>
        </div>
        <p class="doc-note"><strong>Этого компонента нет в снятой разметке продукта.</strong>
          Ни одного узла на десяти снятых страницах: класса <code>${esc(cssRoots[0])}</code>
          в их <code>dom.html</code> не встречается. Разметка ниже — из story
          <code>${esc(v.story)}</code> снимка Storybook
          (<code>evidence/source/storybook/</code>), обёртка стенда отброшена.</p>
        <div class="doc-stage">
          <div class="doc-variant">
            <span class="doc-variant__label">story <code>${esc(v.story)}</code>, ${v.descendants} узл${v.descendants === 1 ? "ёл" : v.descendants < 5 ? "а" : "ов"} внутри корня, ${v.classes.length} классов в поддереве</span>
            <div class="doc-variant__row">
              ${markup}
            </div>
          </div>
        </div>
        <dl class="doc-spec">
          <div><dt>корневой класс</dt><dd><code>${esc(cssRoots[0])}</code></dd></div>
          <div><dt>вхождений в проде</dt><dd>нет — компонент в снятой разметке не найден</dd></div>
          <div><dt>правила из корпуса прода</dt><dd>${v.fromProd} класс${v.fromProd % 10 === 1 && v.fromProd % 100 !== 11 ? "" : v.fromProd % 10 >= 2 && v.fromProd % 10 <= 4 ? "а" : "ов"}</dd></div>
          <div><dt>правила только из Storybook</dt><dd>${v.fromSb}</dd></div>
          <div><dt>классов без правила</dt><dd>${v.missing.length}${v.missing.length ? " — " + v.missing.map((x) => `<code>${esc(x)}</code>`).join(", ") : ""}</dd></div>
        </dl>
        <p class="doc-note"><strong>Главный факт записи.</strong> Разметки компонента
          в продукте нет, а правила его классов продуктовая сборка уже несёт:
          ${v.fromProd} из ${v.classes.length} классов поддерева нашлись в корпусе
          прод-CSS. То есть <code>storybook-only</code> здесь значит «нет в снятой
          разметке», а не «нет в продукте вовсе». Разбор — <a href="../components/${specRel}">спецификация</a>.</p>
      </div>
    </section>
`;
    const catOpen = `<section class="doc-category" id="doc-cat-${c.category}">`;
    const idx = html.indexOf(catOpen);
    if (idx < 0) { console.warn(`категория ${c.category} не найдена`); continue; }
    const end = html.indexOf("\n  </section>", idx);
    const block = html.slice(idx, end);
    const emptyRe = /\n\s*<p class="doc-empty">[^<]*<\/p>/;
    html = html.slice(0, idx) + (emptyRe.test(block) ? block.replace(emptyRe, "\n" + section) : block + section) + html.slice(end);
    sections++;
  }

  // ---------- реестр ----------
  c.status = "partial";
  c.specPath = specRel;
  c.showcaseAnchor = `c-${id}`;
  c.cssRoots = cssRoots;
}

fs.writeFileSync(showcasePath, html, "utf8");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Спецификаций: ${specs}, секций витрины: ${sections}`);
