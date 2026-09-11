// Link — единственная запись пакета с элементным CSS-корнем.
//
// Решение владельца 10 сентября: признать элементный корень, а не выдумывать
// классовый. Основание измерено: 867 узлов <a>, ни одного без класса, но и
// общего класса нет — самый частый стоит меньше чем на половине. При этом
// правило продукта висит на самом теге и принято на R0-03.
//
// Форма корня — `element:a` (conventions.cssRoot, третья форма). Проверяет её
// tools/validate-components.mjs: тег обязан стоять в позиции селектора в ui/
// и обязан встречаться в снятой разметке.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const manifestPath = path.join(pkg, "components/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const c = manifest.components.find((x) => x.id === "link");
const dist = JSON.parse(fs.readFileSync(path.join(d, "link-classes.json"), "utf8"));
const inv = JSON.parse(fs.readFileSync(path.join(d, "invariants.json"), "utf8")).link;
const captured = JSON.parse(fs.readFileSync(path.join(d, "extracted/link.json"), "utf8")).instances[0];

// Правило продукта на теге — читается из слоя, а не переписывается сюда.
const foundations = fs.readFileSync(path.join(pkg, "ui/foundations.css"), "utf8");
const elementRules = [...foundations.matchAll(/^(a(?::[a-z-]+)?\{[^}]*\})$/gm)].map((m) => m[1]);
if (!elementRules.length) throw new Error("в ui/foundations.css не найдено правил на теге a");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const capturedMarkup = captured.html
  .replace(/\s+data-v-[0-9a-f]+(?:="")?/g, "")
  .replace(/(src\s*=\s*")([^"]*avatars\/logo\.svg[^"]*)(")/gi, "$1../ui/assets/images/logo.svg$3");

const specRel = "navigation/link.md";

// Состояния — из того же STATE-CAPTURE.md §3, что и у прочих записей.
// Link не проходит через gen-specs/gen-states: те работают по results.json,
// куда он не попал именно из-за отсутствия классового корня. Таблица собирается
// здесь, разметка та же.
const stateRows = [];
{
  const smd = fs.readFileSync(path.join(pkg, "components/STATE-CAPTURE.md"), "utf8");
  for (const m of smd.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`([a-zA-Z-]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/gm)) {
    if (m[1] !== "link") continue;
    stateRows.push({ state: m[2], outcome: m[3].replace(/\*\*/g, "").trim(), source: m[4].trim() });
  }
  for (const st of c.requiredStates || []) {
    if (stateRows.some((r) => r.state === st)) continue;
    stateRows.push({
      state: st,
      outcome: (c.capturedStates || []).includes(st) ? "снято" : "не снято",
      source: "разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра",
    });
  }
}
// Слово class= из цитат убирается: в прозе это перечисление классов, а в сыром
// тексте страницы — поддельный атрибут (та же правка, что в gen-states.mjs).
const stripClassAttr = (x) => x.replace(/class\s*=\s*"([^"]*)"/g, "$1");
const stateMark = (o) => (o.startsWith("снято") ? "снято" : o.includes("норматив") ? "норматив" : "GAP");
const topRows = dist.top.map((x) => `            <tr><td><code>${esc(x.cls)}</code></td><td>${x.n}</td><td>${x.pct}%</td></tr>`).join("\n");

// ---------- спецификация ----------
const md = `# ${c.canonicalName}

| | |
|---|---|
| **Категория** | Навигация (\`navigation\`) |
| **Корневой класс** | \`element:a\` — корень элементный, а не классовый |
| **CSS** | \`ui/foundations.css\` (правила на теге) + утилиты по месту |
| **Живая реализация** | [\`showcase/components.html#c-link\`](../../showcase/components.html#c-link) |
| **Snapshot** | ${(c.capturedStates || []).length} из ${(c.requiredStates || []).length} состояний снято |

## Когда использовать

Ссылка — самый частый элемент продукта: **${dist.total} узлов \`<a>\`** на 10 из 10
снятых страниц. Отдельного «компонента ссылки» у продукта нет: есть правило
на теге и утилиты, которые накладывает место.

## Почему корень элементный

Это единственная запись пакета с корнем вида \`element:<тег>\`, и основание
измерено, а не выбрано:

- узлов \`<a>\` — **${dist.total}**, из них **без класса вовсе — ${dist.bare}**;
- классов, стоящих на **каждом** узле, — **${inv.unanimous.length}**;
- самый частый класс — \`${dist.top[0].cls}\`, и он стоит на **${dist.top[0].pct}%** узлов.

То есть класса, который был бы у ссылки всегда, не существует. При этом
правило продукта у ссылки есть, и оно висит на теге — принято на R0-03,
лежит в \`ui/foundations.css\`:

\`\`\`css
${elementRules.join("\n")}
\`\`\`

Введённый корень \`crs-link\` пришлось бы наделить объявлениями, и они стали бы
**вторым носителем** тех же значений — ровно тем дефектом, ради которого в
пакете заведён гейт \`tools/validate-showcase-claims.mjs\`. Поэтому решением
владельца от 10 сентября 2026 в \`conventions.cssRoot\` заведена третья форма
корня, а \`tools/validate-components.mjs\` научен её проверять: тег обязан
стоять в позиции селектора в \`ui/\` и обязан встречаться в снятой разметке.

## Разметка

Правило продукта применяется к любому \`<a>\`, поэтому минимальная форма —
без единого класса:

\`\`\`html
<a href="#doc-components">ссылка без единого класса</a>
\`\`\`

Снятый узел для сравнения — ссылка-логотип из шапки:

\`\`\`html
${capturedMarkup}
\`\`\`

## Внешний вид

Собственного вида у ссылки два свойства — цвет и подчёркивание, оба из правила
на теге. Всё остальное приносит место: размер текста, раскладка, обрезка,
поведение при наведении. Распределение классов по ${dist.total} узлам:

| класс | узлов | доля |
|---|---:|---:|
${dist.top.map((x) => `| \`${x.cls}\` | ${x.n} | ${x.pct}% |`).join("\n")}

Четыре класса позиционирования (\`absolute\`, \`inset\`-пара и соседи) идут
вместе и на одной доле — это ссылка-оверлей, растянутая на карточку: она
делает кликабельной всю карточку, а не подпись в ней.

## Состояния

Словарь и требуемость — [\`components/STATES.md\`](../STATES.md) (R1-01), снятость
пар «запись × состояние» — [\`components/STATE-CAPTURE.md\`](../STATE-CAPTURE.md) (R1-02).

| состояние | снято? | чем именно |
|---|---|---|
${stateRows.map((r) => `| \`${r.state}\` | ${stateMark(r.outcome)} | STATE-CAPTURE.md §3 говорит: «${stripClassAttr(r.source)}» |`).join("\n")}

## Ограничения

- **Роли не разведены.** ${dist.total} узлов — это и ссылка в тексте, и пункт подвала,
  и оверлей поверх карточки, и элемент каталога. Одна запись описывает их все,
  потому что общего у них ровно одно — тег. Развести по контекстам — работа
  шага ${c.step}, и она требует разбора корпуса, а не переписи.
- **Прозаические разделы не написаны.** Дописывает шаг ${c.step}.

## Источники

**Production.** ${(c.seenOn || []).join(", ")} — ${dist.total} узлов, 10 из 10 страниц.
Измерение — \`.pipeline/R2-bulk/link-classes.mjs\`, единогласие —
\`.pipeline/R2-bulk/measure-invariants.mjs\`.

**Figma.** Узел для этой записи не сопоставлен.

---

_Собрано bulk-проходом \`.pipeline/R2-bulk/gen-link.mjs\` из снятых доказательств._
`;

fs.mkdirSync(path.join(pkg, "components/navigation"), { recursive: true });
fs.writeFileSync(path.join(pkg, "components", specRel), md, "utf8");

// ---------- секция витрины ----------
let html = fs.readFileSync(showcasePath, "utf8");
if (!html.includes('id="c-link"')) {
  const section = `
    <section class="doc-section" id="c-link">
      <div class="doc-section__head">
        <h4>${esc(c.canonicalName)}</h4>
        <p>${esc(c.notes || "")}</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>default</h5>
          <code>element:a</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
          <span class="doc-tag doc-tag--partial">partial</span>
        </div>
        <p class="doc-note"><strong>Единственная запись пакета с элементным корнем.</strong>
          У ссылки нет своего класса: узлов <code>&lt;a&gt;</code> — ${dist.total},
          без класса вовсе — ${dist.bare}, а класса, стоящего на каждом, — ${inv.unanimous.length}.
          Самый частый (<code>${esc(dist.top[0].cls)}</code>) стоит на ${dist.top[0].pct}% узлов.
          Правило же у ссылки есть и висит на теге — принято на R0-03,
          лежит в <code>ui/foundations.css</code>. Вводить <code>crs-link</code>
          было не с чем: объявления на нём стали бы вторым носителем тех же
          значений. Форма корня <code>element:a</code> заведена решением владельца
          и проверяется гейтом реестра.</p>
        <div class="doc-stage doc-stage--rows">
          <div class="doc-variant">
            <span class="doc-variant__label">минимальная форма — ни одного класса, весь вид от правила на теге</span>
            <div class="doc-variant__row">
              <a href="#doc-components">ссылка без единого класса</a>
            </div>
          </div>
          <div class="doc-variant">
            <span class="doc-variant__label">снятый узел для сравнения — ссылка-логотип из шапки, страница <code>${esc(captured.page || "author")}</code></span>
            <div class="doc-variant__row">
              ${capturedMarkup}
            </div>
          </div>
        </div>
        <table class="doc-table">
          <thead><tr><th>класс на &lt;a&gt;</th><th>узлов</th><th>доля</th></tr></thead>
          <tbody>
${topRows}
          </tbody>
        </table>
        <p class="doc-note"><strong>Что говорит эта таблица.</strong> Собственного вида
          у ссылки два свойства — цвет и подчёркивание, оба из правила на теге.
          Всё остальное приносит место. Четыре класса позиционирования идут вместе
          и на одной доле — это ссылка-оверлей, растянутая на карточку: она делает
          кликабельной всю карточку, а не подпись в ней. Роли по контекстам одна
          запись не разводит — это работа шага <code>${esc(c.step)}</code>.
          Полностью — <a href="../components/${specRel}">спецификация</a>.</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>состояния</h5>
          <code>${stateRows.filter((r) => r.outcome.startsWith("снято")).length} снято · ${stateRows.filter((r) => !r.outcome.startsWith("снято")).length} без снятия</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
          <span class="doc-tag doc-tag--partial">partial</span>
        </div>
        <p class="doc-note">Разметка пар «запись × состояние» — из
          <a href="../components/STATE-CAPTURE.md">STATE-CAPTURE.md</a> §3 (шаг R1-02).
          <code>hover</code> и <code>focus-visible</code> смотрятся на живом элементе:
          подчёркивание при наведении даёт правило на теге, а контур фокуса —
          браузер, и ничто его не отменяет.</p>
        <table class="doc-table">
          <thead><tr><th>состояние</th><th>снято?</th><th>чем именно</th></tr></thead>
          <tbody>
${stateRows.map((r) => `            <tr><td><code>${esc(r.state)}</code></td><td>${stateMark(r.outcome)}</td><td>STATE-CAPTURE.md §3 говорит: «${esc(stripClassAttr(r.source))}»</td></tr>`).join("\n")}
          </tbody>
        </table>
      </div>
    </section>
`;
  const catOpen = '<section class="doc-category" id="doc-cat-navigation">';
  const idx = html.indexOf(catOpen);
  if (idx < 0) throw new Error("категория navigation не найдена");
  const end = html.indexOf("\n  </section>", idx);
  const block = html.slice(idx, end);
  const emptyRe = /\n\s*<p class="doc-empty">[^<]*<\/p>/;
  html = html.slice(0, idx) + (emptyRe.test(block) ? block.replace(emptyRe, "\n" + section) : block + section) + html.slice(end);
  fs.writeFileSync(showcasePath, html, "utf8");
}

c.status = "partial";
c.specPath = specRel;
c.showcaseAnchor = "c-link";
c.cssRoots = ["element:a"];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Link: спецификация ${specRel}, корень element:a, ${dist.total} узлов, ${inv.unanimous.length} единогласных классов`);
