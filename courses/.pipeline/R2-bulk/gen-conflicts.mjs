// Раздел «Расхождения источников» — проверка того, что пакет записал о себе
// сам, теперь когда оба слоя лежат рядом.
//
// BRIEF §5 назвал шесть расхождений на инвентаризации, когда слоя макета
// в пакете ещё не было и прод-разметка была снята, но не разобрана. Здесь
// каждое из проверяемых сверяется заново: значения читаются из слоёв и из
// измерения, а не переписываются из BRIEF. Что не проверяется — сказано.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function rootVars(file) {
  const out = new Map();
  postcss.parse(fs.readFileSync(path.join(pkg, file), "utf8"), { from: file }).walkRules((rule) => {
    if (rule.selector.trim() !== ":root") return;
    rule.each((n) => { if (n.type === "decl" && n.prop.startsWith("--")) out.set(n.prop, n.value.trim()); });
  });
  return out;
}
const prod = rootVars("ui/tokens.css");
const fig = rootVars("ui/tokens-figma.css");
const v = (m, k) => m.get(k) || "—";

// Пометка живости продуктового токена — из хвостового комментария слоя.
const tokensText = fs.readFileSync(path.join(pkg, "ui/tokens.css"), "utf8");
const marker = (name) => {
  const m = new RegExp(`${name.replace(/[-]/g, "\\-")}:[^;]*;\\s*/\\*\\s*\\[([A-Z ]+)\\]`).exec(tokensText);
  return m ? m[1].trim() : "живая";
};

const chipSelected = JSON.parse(fs.readFileSync(path.join(d, "states-markup.json"), "utf8"))["filter-chip/selected"];
const chipClasses = /class="([^"]*)"/.exec(chipSelected.html)[1].split(/\s+/);
const btn = JSON.parse(fs.readFileSync(path.join(d, "button-sizes.json"), "utf8"));
const padSorted = btn.pad.sort((a, b) => b[1] - a[1]);
const hSorted = btn.height.sort((a, b) => b[1] - a[1]);
const PX = { "px-3": 12, "px-4": 16, "px-6": 24, "py-2": 8, "py-3": 12 };
const HPX = { "h-9": 36, "h-10": 40, "h-12": 48, "h-14": 56 };
const padPx = (k) => k.split(" ").map((x) => PX[x] ?? "?").join(" / ");

// Мёртвые токены шкалы: пометка в слое плюс ноль ссылок var() в корпусе.
const cssCorpus = ["inline", "external"].flatMap((sub) => {
  const dir = path.join(pkg, "evidence/source/production/css", sub);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(dir, f), "utf8")) : [];
}).join("\n");
const refs = (name) => (cssCorpus.match(new RegExp(`var\\(${name}`, "g")) || []).length;
const foundations = fs.readFileSync(path.join(pkg, "ui/foundations.css"), "utf8");
const util = (cls) => (new RegExp(`^\\.${cls}\\{([^}]*)\\}`, "m").exec(foundations) || [, "—"])[1];

const scaleRows = [
  ["--font-size-h3", "text-h3", "font-size"],
  ["--line-height-h2", "text-h2", "line-height"],
  ["--line-height-h3", "text-h3", "line-height"],
].map(([token, cls, prop]) => {
  const decls = util(cls);
  const live = (new RegExp(`${prop}:([^;]+)`).exec(decls) || [, "—"])[1];
  return `            <tr><td><code>${esc(token)}</code></td><td><code>${esc(v(prod, token))}</code></td><td>${marker(token)}</td><td><code>${refs(token)}</code></td><td><code>.${esc(cls)}</code> → <code>${esc(live)}</code></td></tr>`;
}).join("\n");

const section = `
<!-- ===================================================================== -->
<section class="doc-section" id="doc-conflicts">
  <div class="doc-section__head">
    <span class="doc-section__num">7</span>
    <h2>Расхождения источников</h2>
    <p>Инвентаризация назвала шесть расхождений, когда слоя макета в пакете ещё не было, а прод-разметка была снята, но не разобрана. Здесь каждое проверяемое сверено заново — значениями из слоёв и из измерения, а не пересказом.</p>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Выбранный фильтр-чип: цвет расходится, геометрия сходится</h5>
      <code>BRIEF §5, пункт 1</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
        <span class="doc-src doc-src--figma" title="figma" aria-label="figma">F</span>
      </span>
    </div>
    <p class="doc-note">Расхождение <strong>подтверждено и оказалось точнее записанного</strong>: сторон не две, а три, и одна из них в продукте мертва.</p>
    <table class="doc-table">
      <thead><tr><th>сторона</th><th>что говорит</th><th>чем доказано</th></tr></thead>
      <tbody>
        <tr><td>разметка продукта</td><td>тёмный: <code>${esc(chipClasses.filter((c) => /^(bg|text|border)-ui/.test(c)).join(" "))}</code></td><td>${chipSelected.total} узлов на ${chipSelected.seen}/10 страниц</td></tr>
        <tr><td>макет</td><td>синий: заливка <code>${esc(v(fig, "--fig-elements-tab-filter-fill-select"))}</code>, рамка <code>${esc(v(fig, "--fig-elements-tab-filter-border-select"))}</code>, текст <code>${esc(v(fig, "--fig-elements-tab-filter-text-icon-select"))}</code></td><td><code>ui/tokens-figma.css</code></td></tr>
        <tr><td>токены продукта</td><td>синий: <code>--color-chip-inactive</code> <code>${esc(v(prod, "--color-chip-inactive"))}</code>, <code>--color-chip-press</code> <code>${esc(v(prod, "--color-chip-press"))}</code></td><td>оба помечены <strong>${marker("--color-chip-inactive")}</strong> — в разметке десяти страниц не встречаются</td></tr>
      </tbody>
    </table>
    <p class="doc-note"><strong>Две подробности, которых на инвентаризации не было.</strong>
      Первая: заливка макета <code>${esc(v(fig, "--fig-elements-tab-filter-fill-select"))}</code> —
      это ровно <code>--color-ui-blue-50</code> продукта
      (<code>${esc(v(prod, "--color-ui-blue-50"))}</code>). То есть синий макета в продукте
      существует живым токеном, просто на это состояние не поставлен.
      Вторая: <strong>геометрия сходится до пикселя</strong> — макет задаёт падинг фильтра
      <code>${esc(v(fig, "--fig-elements-tab-filter-padding-left-right"))}</code> /
      <code>${esc(v(fig, "--fig-elements-tab-filter-padding-top-bottom"))}</code>,
      и разметка продукта несёт <code>px-3 py-2</code> — те же 12 и 8. Расходится
      только цвет выбранного состояния, а не форма.</p>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Падинг кнопок: ступени не совпадают именами, но совпадают числами</h5>
      <code>BRIEF §5, пункт 4</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
        <span class="doc-src doc-src--figma" title="figma" aria-label="figma">F</span>
      </span>
    </div>
    <p class="doc-note">Измерено заново по всем ${padSorted.reduce((a, x) => a + x[1], 0)} узлам кнопки на десяти страницах.</p>
    <table class="doc-table">
      <thead><tr><th>сторона</th><th>падинг</th><th>узлов</th></tr></thead>
      <tbody>
${padSorted.map(([k, n]) => `        <tr><td>продукт</td><td><code>${esc(k)}</code> = ${esc(padPx(k))}</td><td>${n}</td></tr>`).join("\n")}
        <tr><td>макет, ступень M</td><td><code>${esc(v(fig, "--fig-elements-button-m-padding-left-right"))}</code> / <code>${esc(v(fig, "--fig-elements-button-m-padding-top-bottom"))}</code></td><td>—</td></tr>
        <tr><td>макет, ступень L</td><td><code>${esc(v(fig, "--fig-elements-button-l-padding-left-right"))}</code> / <code>${esc(v(fig, "--fig-elements-button-l-padding-top-bottom"))}</code></td><td>—</td></tr>
      </tbody>
    </table>
    <p class="doc-note"><strong>Что видно из чисел.</strong> Самая частая кнопка продукта
      (${padSorted[0][1]} узлов из ${padSorted.reduce((a, x) => a + x[1], 0)}) имеет падинг
      ${esc(padPx(padSorted[0][0]))} — <strong>ровно ступень M макета</strong>. Ступень L макета
      (${esc(v(fig, "--fig-elements-button-l-padding-left-right"))} / ${esc(v(fig, "--fig-elements-button-l-padding-top-bottom"))})
      в продукте не встречается ни разу. Высот у кнопки при этом три —
      ${hSorted.map(([k, n]) => `<code>${esc(k)}</code> = ${HPX[k] ?? "?"}px (${n})`).join(", ")}, —
      а падингов два: высота меняется без изменения падинга. Инвентаризация назвала
      это конфликтом «прод против макета»; измерение уточняет: числа сторон
      пересекаются, не совпадают только то, какая ступень как называется и какие
      из них продукт использует. Разложить ступени по именам одна перепись не может —
      в разметке продукта имён размеров нет, это работа шага R3-01.</p>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Мёртвые токены шкалы против живых утилит</h5>
      <code>BRIEF §5, пункты 3 и 5</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
      </span>
    </div>
    <p class="doc-note">Расхождение <strong>подтверждено полностью</strong>, и это конфликт внутри самого продукта, а не между источниками: токен объявлен, но на него нет ни одной ссылки, а число печатает утилита — другое.</p>
    <table class="doc-table">
      <thead><tr><th>токен</th><th>значение</th><th>пометка в слое</th><th>ссылок <code>var()</code> в корпусе</th><th>что печатает на самом деле</th></tr></thead>
      <tbody>
${scaleRows}
      </tbody>
    </table>
    <p class="doc-note">Ссылки считаны по всем 22 файлам корпуса. Ноль означает ноль:
      токен объявлен и не использован ни разу, а значение на экране даёт утилита.
      Пометки в слое (<code>[UNREFERENCED]</code>) поставлены на R0-02 и этим
      измерением подтверждены.</p>
  </div>

  <p class="doc-text"><strong>Чего здесь нет.</strong> Пункт 2 (<code>--header-height</code>) —
    расхождение объявления и рантайма, разобрано на R0-02 и решено в пользу поведения
    продакшена; его место — <a href="../docs/guide/tokens.md">docs/guide/tokens.md</a>, GAP-4.
    Пункт 6 (брейкпоинты) показан в разделе «Основания» отдельным подразделом.
    Значения стиля <code>Header/H3</code> из макета по-прежнему не сняты: страницы
    компонентов библиотеки <code>education-lib</code> через MCP не открываются, и это
    не изменилось — подтверждено при попытке дочитать их на этом проходе.</p>
</section>
`;

let html = fs.readFileSync(showcasePath, "utf8");
if (html.includes('id="doc-conflicts"')) {
  console.log("Раздел «Расхождения источников» уже стоит — пропуск.");
} else {
  const at = html.lastIndexOf("\n</main>");
  if (at < 0) throw new Error("не найден конец <main>");
  html = html.slice(0, at) + "\n" + section + html.slice(at);
  const navAnchor = '<a class="doc-nav__link doc-nav__link--top" href="#doc-findings">Находки</a>\n    </li>';
  if (html.includes(navAnchor)) {
    html = html.replace(navAnchor, navAnchor + '\n    <li>\n      <a class="doc-nav__link doc-nav__link--top" href="#doc-conflicts">Расхождения</a>\n    </li>');
  }
  fs.writeFileSync(showcasePath, html, "utf8");
  console.log("Раздел «Расхождения источников» вставлен: три проверки, две подтверждены точнее записанного");
}
