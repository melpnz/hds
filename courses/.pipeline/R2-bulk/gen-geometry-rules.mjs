// Раздел «Геометрия» в «Основаниях»: правила уровня системы, а не записи.
//
// До этого шага все правила витрины были про один компонент. Эти — про то,
// что общего у всех сразу: сколько значений принимает радиус, какая рамка
// у блока. Считаются по корневым узлам записей из снимка вычисленных стилей
// живого прода (.pipeline/R2-bulk/computed.json), сверяются со слоем макета
// (ui/tokens-figma.css) — и расхождение с макетом называется, а не сглаживается.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const computed = JSON.parse(fs.readFileSync(path.join(d, "computed.json"), "utf8"));

const figVars = new Map();
postcss.parse(fs.readFileSync(path.join(pkg, "ui/tokens-figma.css"), "utf8"), { from: "x" })
  .walkRules((rule) => {
    if (rule.selector.trim() !== ":root") return;
    rule.each((n) => { if (n.type === "decl" && n.prop.startsWith("--")) figVars.set(n.prop, n.value.trim()); });
  });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- радиус ----------
const radius = new Map();
for (const [id, v] of Object.entries(computed)) {
  const r = (v.styles["border-radius"] || "").trim();
  if (!r || r === "0px") continue;
  if (!radius.has(r)) radius.set(r, []);
  radius.get(r).push(id);
}
const radiusTotal = [...radius.values()].reduce((a, b) => a + b.length, 0);
const radiusSorted = [...radius].sort((a, b) => b[1].length - a[1].length);

// ---------- рамка ----------
const border = new Map();
for (const [id, v] of Object.entries(computed)) {
  const b = (v.styles.border || "").trim();
  if (!b || /^0px/.test(b)) continue;
  if (!border.has(b)) border.set(b, []);
  border.get(b).push(id);
}
const borderTotal = [...border.values()].reduce((a, b) => a + b.length, 0);
const borderSorted = [...border].sort((a, b) => b[1].length - a[1].length);
const [mainBorder, mainBorderIds] = borderSorted[0];
const borderExceptions = borderSorted.slice(1);

// ---------- сверка со шкалой макета ----------
const figRadius = [...figVars].filter(([n]) => /^--fig-(size-radius|elements-[a-z-]*border-radius)/.test(n));
const px = (v) => Number(String(v).replace("px", ""));
const prodValues = new Set([...radius.keys()].map(px));
const match = [], onlyFigma = [], onlyProd = [];
for (const [n, v] of figRadius) {
  if (px(v) === 0) continue;
  (prodValues.has(px(v)) ? match : onlyFigma).push([n, v]);
}
for (const r of prodValues) {
  if (!figRadius.some(([, v]) => px(v) === r)) onlyProd.push(r);
}

const rule = (id, votes, denom, title, text, exception) => `
    <div class="doc-rule" data-rule="${esc(id)}">
      <div class="doc-rule__head">
        <h3>Правило</h3>
        <span class="doc-rule__votes">${votes} / ${denom}</span>
      </div>
      <p><strong>${esc(title)}.</strong> ${text}</p>
      <p class="doc-rule__exception">${exception}</p>
    </div>
`;

const section = `
  <section class="doc-category" id="f-geometry">
    <div class="doc-category__head">
      <h3>Геометрия</h3>
      <code>border-radius · border</code>
      <p>Правила уровня системы, а не отдельной записи: сколько значений принимает радиус во всём продукте и какая рамка у блока. Голоса считаются по корневым узлам ${Object.keys(computed).length} записей — вычисленные значения из снимка живого прода, не из разметки.</p>
    </div>

    <section class="doc-section" id="f-geometry-radius">
      <div class="doc-section__head">
        <h4>Радиус</h4>
        <p>Из ${Object.keys(computed).length} корневых узлов ненулевой радиус у ${radiusTotal}. Разных значений среди них — ${radius.size}.</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>Ступени</h5>
          <code>border-radius</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
        </div>
        <table class="doc-table">
          <thead><tr><th>значение</th><th>записей</th><th>какие</th></tr></thead>
          <tbody>
${radiusSorted.map(([r, ids]) => `            <tr><td><code>${esc(r)}</code></td><td>${ids.length}</td><td><code>${esc(ids.join(" "))}</code></td></tr>`).join("\n")}
          </tbody>
        </table>
      </div>
${rule(
  "radius-four-steps",
  radiusTotal, radiusTotal,
  `Радиус в продукте принимает ровно ${radius.size} значения`,
  `${radiusSorted.map(([r, ids]) => `<code>${esc(r)}</code> (${ids.length})`).join(", ")} — и больше никаких.
      Промежуточных значений нет: блок в продукте либо крупный (24), либо
      управляющий (12), либо пилюля, либо мелкий значок (6). Это шкала,
      а не набор случайных чисел.`,
  `Исключений в выборке нет: все ${radiusTotal} узлов с ненулевым радиусом попадают
      в ${radius.size} перечисленных значения. Выборка — корневые узлы записей;
      про вложенные элементы правило ничего не говорит.`,
)}
      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>Сверка со шкалой макета</h5>
          <code>--fig-size-radius-* · --fig-elements-*-border-radius</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--figma" title="figma" aria-label="figma">F</span>
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
        </div>
        <p class="doc-note"><strong>Совпадают (${match.length}).</strong>
          ${match.map(([n, v]) => `<code>${esc(n)}</code> = ${esc(v)}`).join(", ")} — эти ступени
          макета продукт использует на корнях как есть.</p>
        <p class="doc-note"><strong>Есть в макете, на корнях не встречены (${onlyFigma.length}).</strong>
          ${onlyFigma.map(([n, v]) => `<code>${esc(n)}</code> = ${esc(v)}`).join(", ")}. Это не значит,
          что их нет в продукте вовсе: выборка — только корневые узлы записей.</p>
        <p class="doc-note"><strong>Есть в продукте, в макете нет (${onlyProd.length}).</strong>
          ${onlyProd.map((r) => `<code>${r}px</code>`).join(", ")} — и это настоящее расхождение,
          а не пробел выборки. Полную скруглённость макет задаёт числом
          <code>${esc(figVars.get("--fig-size-radius-full") || "?")}</code>
          (<code>--fig-size-radius-full</code>), продукт пишет <code>9999px</code>.
          Оба значения дают одно и то же — пилюлю: любое число больше половины
          высоты скругляет торцы полностью. Расхождение безвредное, но оно есть,
          и здесь оно названо, а не сглажено выбором «одного из двух».</p>
      </div>
    </section>

    <section class="doc-section" id="f-geometry-border">
      <div class="doc-section__head">
        <h4>Рамка</h4>
        <p>Ненулевая рамка у ${borderTotal} корневых узлов из ${Object.keys(computed).length}.</p>
      </div>
${rule(
  "border-one-hairline",
  mainBorderIds.length, borderTotal,
  "Рамка блока — всегда волосяная и всегда одного цвета",
  `<code>${esc(mainBorder)}</code> — рамка карточек, таблицы рейтинга, шапок сущности
      и персоны, иконочной кнопки, фильтра и дропдауна. Толще одного пикселя
      рамка не бывает нигде, кроме одного названного случая.`,
  `Исключений ${borderExceptions.reduce((a, b) => a + b[1].length, 0)} из ${borderTotal}:
      ${borderExceptions.map(([b, ids]) => `<code>${esc(b)}</code> — ${ids.map((x) => `<code>${esc(x)}</code>`).join(", ")}`).join("; ")}.
      Первые два — белая рамка-разделитель поверх изображения и поверх соседа
      в стопке: она не очерчивает блок, а отделяет его от того, на чём лежит.
      Третий — тёмная кнопка, у которой рамка совпадает с заливкой.`,
)}
    </section>
  </section>
`;

let html = fs.readFileSync(showcasePath, "utf8");
if (html.includes('id="f-geometry"')) {
  console.log("Раздел «Геометрия» уже стоит — пропуск.");
} else {
  const at = html.search(/\n<\/section>\s*\n\s*(?:<!--[^\n]*-->\s*\n\s*)?<section class="doc-section" id="doc-components">/);
  if (at < 0) throw new Error("не найден конец раздела «Основания»");
  html = html.slice(0, at) + "\n" + section + html.slice(at);
  fs.writeFileSync(showcasePath, html, "utf8");
  console.log(`Раздел «Геометрия» вставлен: радиусов ${radius.size} на ${radiusTotal} узлах, рамка ${mainBorderIds.length}/${borderTotal}, сверка с макетом ${match.length} совпало / ${onlyFigma.length} только макет / ${onlyProd.length} только прод`);
}
