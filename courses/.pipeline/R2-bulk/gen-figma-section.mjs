// Раздел «Токены макета» в «Основаниях» витрины.
//
// Показывает слой ui/tokens-figma.css — элементные переменные макета
// 02_Education-NEW — и сверку её цветов с продуктовыми токенами ui/tokens.css.
// Значения читаются из самого слоя парсером, а не из выгрузки: если слой
// пересобран, раздел обязан пересобраться из него же, иначе на витрине
// появится второй носитель тех же чисел.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normColor } from "../../tools/color-value.mjs";
import postcss from "postcss";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");

function rootVars(file) {
  const out = new Map();
  const root = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  root.walkRules((rule) => {
    if (rule.selector.trim() !== ":root") return;
    rule.each((n) => {
      if (n.type === "decl" && n.prop.startsWith("--")) out.set(n.prop, n.value.trim());
    });
  });
  return out;
}

const fig = rootVars(path.join(pkg, "ui/tokens-figma.css"));
const prod = rootVars(path.join(pkg, "ui/tokens.css"));
const prodByValue = new Map();
for (const [k, v] of prod) {
  // Ключ — приведённое значение: #fff и #ffffff, rgba(0,0,0,.3) и #0000004d —
  // один цвет (tools/color-value.mjs). Нецветовые значения — как были.
  const norm = normColor(v) || v.toLowerCase().replace(/\s+/g, "");
  if (!prodByValue.has(norm)) prodByValue.set(norm, []);
  prodByValue.get(norm).push(k);
}

// Цвет, которого нет в токенах, может жить в ассете продукта: фирменные
// цвета сервисов лежат заливками в спрайтах соцсетей, а не переменными.
// Ищется по заливкам fill/stop-color файлов ui/assets/icons/*.svg.
const assetByValue = new Map();
const iconsDir = path.join(pkg, "ui/assets/icons");
for (const f of fs.readdirSync(iconsDir).filter((x) => x.endsWith(".svg"))) {
  const txt = fs.readFileSync(path.join(iconsDir, f), "utf8");
  for (const m of txt.matchAll(/(?:fill|stop-color)="(#[0-9a-fA-F]{3,8})"/g)) {
    const k = normColor(m[1]);
    if (!assetByValue.has(k)) assetByValue.set(k, new Set());
    assetByValue.get(k).add(f);
  }
}
const isColor = (v) => /^#[0-9a-f]{3,8}$/i.test(v);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Группировка — по тому же первому сегменту имени, что и в самом слое.
const GROUPS = [
  ["--fig-elements-button-group", "Группа кнопок"],
  ["--fig-elements-button", "Кнопка"],
  ["--fig-elements-input", "Поле ввода"],
  ["--fig-elements-tab", "Вкладка и фильтр"],
  ["--fig-elements-tag", "Тег и чип"],
  ["--fig-elements-chips", "Чипы"],
  ["--fig-elements-control", "Контрол"],
  ["--fig-elements-modal", "Модалка"],
  ["--fig-elements-dropdown", "Дропдаун"],
  ["--fig-elements-scroll", "Скролл"],
  ["--fig-elements-pagination", "Пагинация"],
  ["--fig-elements-tooltip", "Тултип"],
  ["--fig-elements-informators", "Информаторы"],
  ["--fig-size-spacing", "Шкала отступов"],
  ["--fig-size-radius", "Шкала радиусов"],
  ["--fig-font-header", "Заголовочная шкала"],
  ["--fig-font", "Шрифт"],
  ["--fig-color-style", "Цветовые стили библиотеки"],
  ["--fig-logo", "Фирменные цвета сервисов"],
  ["--fig-blue", "Синяя шкала"],
  ["--fig-red", "Красная шкала"],
  ["--fig-yellow", "Жёлтая шкала"],
  ["--fig-effect", "Тени"],
  ["--fig-color", "Отдельные цвета"],
];
const groupOf = (name) => (GROUPS.find(([p]) => name.startsWith(p)) || [null, "Прочее"])[1];

const grouped = new Map();
for (const [name, value] of fig) {
  const g = groupOf(name);
  if (!grouped.has(g)) grouped.set(g, []);
  grouped.get(g).push([name, value]);
}

let colorsTotal = 0, colorsMatched = 0, colorsInAsset = 0;
const swatchBlocks = [];
const tableBlocks = [];

// Переменная, не попавшая ни в одну из перечисленных групп, уходит в «Прочее»
// и выводится последней. Прежде этот остаток молча выпадал: когда слой вырос
// на elements/pagination/*, семь новых цветов пропали с витрины, а число в
// сверке разошлось с разбором слоя. Поймал validate-showcase-claims.
const ORDER = [...GROUPS.map(([, t]) => t), "Прочее"];
for (const title of ORDER) {
  const list = grouped.get(title);
  if (!list) continue;
  const colors = list.filter(([, v]) => isColor(v));
  const rest = list.filter(([, v]) => !isColor(v));
  if (colors.length) {
    const chips = colors.sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => {
      colorsTotal++;
      const hit = prodByValue.get(normColor(value) || value.toLowerCase());
      if (hit) colorsMatched++;
      else if (assetByValue.has(normColor(value))) colorsInAsset++;
      const mark = hit
        ? `<span class="doc-mark doc-mark--live">= ${esc(hit.join(", "))}</span>`
        : assetByValue.has(normColor(value))
        ? `<span class="doc-mark">в токенах нет — заливка ассета ${esc([...assetByValue.get(normColor(value))].join(", "))}</span>`
        : `<span class="doc-mark">двойника в продукте нет</span>`;
      return `      <div class="doc-swatch">
        <div class="doc-swatch__chip" style="background: ${esc(value)}"></div>
        <div class="doc-swatch__body">
          <p class="doc-swatch__name">${esc(name)}</p>
          <p class="doc-swatch__value">${esc(value)}</p>
          ${mark}
        </div>
      </div>`;
    }).join("\n");
    swatchBlocks.push(`    <div class="doc-variant">
      <span class="doc-variant__label">${esc(title)} — цвета макета</span>
    </div>
    <div class="doc-swatches">
${chips}
    </div>`);
  }
  if (rest.length) {
    const trs = rest.sort((a, b) => a[0].localeCompare(b[0]))
      .map(([n, v]) => `              <tr><td><code>${esc(n)}</code></td><td><code>${esc(v)}</code></td></tr>`).join("\n");
    // Число в подписи группы не пишется: разбивка на группы — читательское
    // соглашение витрины, вывести его из ui/ нечем, а непроверяемое число
    // на витрине быть не должно. Плашки и строки таблицы считаются глазами.
    tableBlocks.push(`          <p class="doc-note"><strong>${esc(title)}</strong></p>
          <table class="doc-table">
            <thead><tr><th>переменная</th><th>значение</th></tr></thead>
            <tbody>
${trs}
            </tbody>
          </table>`);
  }
}

const section = `
  <section class="doc-category" id="f-figma">
    <div class="doc-category__head">
      <h3>Токены макета</h3>
      <code>ui/tokens-figma.css</code>
      <p>Элементные переменные Figma-макета <code>02_Education-NEW</code> — отдельный слой с префиксом <code>--fig-</code>. Вёрстка компонентов на него не ссылается: она собрана из продакшена. Слой существует, чтобы контракт дизайна был виден рядом и сверяем.</p>
    </div>

    <section class="doc-section" id="f-figma-why">
      <div class="doc-section__head">
        <h4>Почему отдельным слоем</h4>
        <p>Макет описывает другую версию продукта: своя схема URL, свои брейкпоинты (320 / 744 / 1024 против 480 / 768 / 1024 в проде), раздел профессий, которого в проде нет. Значения где-то совпадают до байта, где-то расходятся — и расхождение это факт для разбора, а не повод молча выбрать одно из двух. В слитом <code>:root</code> такой разбор невозможен: после слияния уже не видно, чьё значение победило.</p>
      </div>
      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>Сверка цветов с продуктовыми токенами</h5>
          <code>--fig-* против --color-*</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--figma" title="figma" aria-label="figma">F</span>
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
        </div>
        <p class="doc-note">Из ${colorsTotal} цветов макета ${colorsMatched} совпали по значению с переменной <code>ui/tokens.css</code> — под плашкой стоит имя продуктового двойника. В токенах нет двойника у ${colorsTotal - colorsMatched}: ${colorsInAsset} — фирменные цвета внешних сервисов (<code>--fig-logo-*</code>), они лежат заливками в спрайтах продукта, и под плашкой назван файл; ${colorsTotal - colorsMatched - colorsInAsset} в продукте не найден ни в какой записи — разбор в разделе «Расхождения источников». Сверка идёт по приведённому значению (<code>#fff</code> и <code>#ffffff</code>, <code>rgba(0,0,0,.3)</code> и <code>#0000004d</code> — один цвет) и пересчитывается из самих слоёв при каждой пересборке раздела.</p>
        <div class="doc-stage doc-stage--rows">
${swatchBlocks.join("\n")}
        </div>
      </div>
    </section>

    <section class="doc-section" id="f-figma-scales">
      <div class="doc-section__head">
        <h4>Размеры, радиусы, шрифт</h4>
        <p>Нецветовые переменные слоя. Figma хранит числа без единиц: размеры выписаны в <code>px</code>, безразмерными оставлены насыщенность шрифта, трекинг и нули.</p>
      </div>
      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>Значения</h5>
          <code>--fig-size-*, --fig-font-*, --fig-elements-*</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--figma" title="figma" aria-label="figma">F</span>
          </span>
        </div>
${tableBlocks.join("\n")}
        <p class="doc-note"><strong>Чего в слое нет.</strong> Композитные переменные Figma — типографические стили и эффекты — одной переменной CSS не разворачиваются: это наборы. Их составляющие выше есть по отдельности, а сборка — дело компонента. Библиотека <code>education-lib</code> не читается вовсе: узлы её страниц компонентов недоступны, есть только <code>componentKey</code>.</p>
      </div>
    </section>
  </section>
`;

let html = fs.readFileSync(showcasePath, "utf8");
if (html.includes('id="f-figma"')) {
  console.log("Раздел «Токены макета» уже стоит — пропуск.");
} else {
  // Ставится последней категорией «Оснований», перед закрытием раздела.
  // Конец раздела «Основания» — закрывающий тег непосредственно перед
  // разделом «Компоненты». Между ними в файле стоит комментарий-разделитель.
  const at = html.search(/\n<\/section>\s*\n\s*(?:<!--[^\n]*-->\s*\n\s*)?<section class="doc-section" id="doc-components">/);
  if (at < 0) throw new Error("не найдено место вставки: конец раздела «Основания»");
  html = html.slice(0, at) + "\n" + section + html.slice(at);
  fs.writeFileSync(showcasePath, html, "utf8");
  console.log(`Раздел «Токены макета» вставлен: ${fig.size} переменных, цветов ${colorsTotal} (совпало ${colorsMatched})`);
}
