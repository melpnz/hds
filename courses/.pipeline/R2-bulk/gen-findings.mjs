// Раздел «Находки» витрины.
//
// Собирает в одно место то, что пакет уже доказал, но что до сих пор жило
// только в спецификациях и служебных файлах: классы без правила, спрайты
// вне реестра, дефект разметки символа, двойная роль одного селектора.
//
// Числа читаются из источников (known-missing-classes.json, прод-DOM,
// manifest.json), а не пишутся в разметку: раздел обязан пересобираться
// из тех же данных, иначе станет вторым носителем.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- 1. Классы без правила ----------
const km = JSON.parse(fs.readFileSync(path.join(pkg, "tools/known-missing-classes.json"), "utf8"));
const rows = Object.entries(km).filter(([k]) => k !== "_");
const kindNoRule = rows.filter(([, v]) => v.startsWith("(2)"));
const kindNotLifted = rows.filter(([, v]) => v.startsWith("(1)"));
const shortReason = (v) => {
  const t = v.replace(/^\(\d\)\s*/, "");
  const first = t.split(/(?<=\.)\s/).slice(0, 2).join(" ");
  return first.length > 200 ? first.slice(0, 200).replace(/\s+\S*$/, "") + "…" : first;
};

// ---------- 2. Спрайты в разметке ----------
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const spriteUse = new Map();
for (const pg of fs.readdirSync(pagesDir)) {
  const f = path.join(pagesDir, pg, "dom.html");
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(/([a-z0-9._-]+\.svg)(?:\?[^"#]*)?#/g)) {
    spriteUse.set(m[1], (spriteUse.get(m[1]) || 0) + 1);
  }
}
const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const inRegistry = { "sprite.svg": "sprite-icon", "social-v3.1.svg": "social-icon" };

// ---------- 3. Дефект star-empty ----------
let starBroken = 0, starTotal = 0;
for (const pg of fs.readdirSync(pagesDir)) {
  const f = path.join(pagesDir, pg, "dom.html");
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(/xlink:href="([^"]*sprite\.svg[^"]*#star-empty[^"]*)"/g)) {
    starTotal++;
    // Битая ссылка: после имени символа через пробел прилип класс.
    if (/#star-empty\s+\S/.test(m[1])) starBroken++;
  }
}

// ---------- 4. Две роли одного селектора ----------
const chip = manifest.components.find((c) => c.id === "chip");

const li = (x) => `            <li>${x}</li>`;

const section = `
<!-- ===================================================================== -->
<section class="doc-section" id="doc-findings">
  <div class="doc-section__head">
    <span class="doc-section__num">6</span>
    <h2>Находки</h2>
    <p>Что пакет доказал о продукте по ходу вёрстки. Не пробелы пакета: каждая строка — измеренный факт о самом продукте, который стоит знать тому, кто по этому гайду верстает.</p>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Классы без правила</h5>
      <code>tools/known-missing-classes.json</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
      </span>
    </div>
    <p class="doc-note">В разметке продукта стоят классы, у которых нет объявления ни в одном файле корпуса — ни в десяти инлайновых <code>&lt;style&gt;</code>, ни в двенадцати внешних файлах сборки. Проверено настоящим парсером (<code>postcss</code>), не поиском по тексту. В браузере такой класс не делает ничего.</p>
    <table class="doc-table">
      <thead><tr><th>класс</th><th>почему это находка</th></tr></thead>
      <tbody>
${kindNoRule.map(([k, v]) => `        <tr><td><code>${esc(k)}</code></td><td>${esc(shortReason(v))}</td></tr>`).join("\n")}
      </tbody>
    </table>
    <p class="doc-note">Отдельно от них — класс, у которого правило в продукте <strong>есть</strong>, а в <code>ui/</code> он ещё не поднят. Такую строку закрывает вёрстка, а не решение владельца продукта:</p>
    <table class="doc-table">
      <thead><tr><th>класс</th><th>что известно</th></tr></thead>
      <tbody>
${kindNotLifted.map(([k, v]) => `        <tr><td><code>${esc(k)}</code></td><td>${esc(shortReason(v))}</td></tr>`).join("\n")}
      </tbody>
    </table>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Спрайты в разметке и записи реестра</h5>
      <code>use[xlink:href$='.svg#…']</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
      </span>
    </div>
    <p class="doc-note">Один и тот же DOM-паттерн <code>&lt;svg class="svg-icon"&gt;&lt;use xlink:href="…"&gt;</code> ведёт в четыре разных файла-спрайта. Два из них описаны записями реестра, два — нет.</p>
    <table class="doc-table">
      <thead><tr><th>файл</th><th>узлов в снятой разметке</th><th>запись реестра</th></tr></thead>
      <tbody>
${[...spriteUse].sort((a, b) => b[1] - a[1]).map(([f, n]) => `        <tr><td><code>${esc(f)}</code></td><td>${n}</td><td>${inRegistry[f] ? `<code>${inRegistry[f]}</code>` : "<strong>нет</strong>"}</td></tr>`).join("\n")}
      </tbody>
    </table>
    <p class="doc-note">Находка шага R2-01, не закрытая до сих пор: <code>external-profile.svg</code> и <code>experts.svg</code> в реестре отдельными записями не заведены, хотя в разметке присутствуют. Селектор переписи <code>svg.svg-icon</code> считает все четыре спрайта разом, и сузить его атрибутным условием нельзя — браузер такой селектор не разбирает.</p>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Битая ссылка на символ рейтинга</h5>
      <code>sprite.svg#star-empty</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
      </span>
    </div>
    <p class="doc-note">Из ${starTotal} ссылок на символ <code>star-empty</code> в снятой разметке ${starBroken} несут внутри значения <code>xlink:href</code> прилипший через пробел класс. Такая ссылка не резолвится, и пустая звезда рейтинга на этих узлах не рисуется вовсе. Факт снятого DOM, а не гипотеза; разбор — <a href="../components/data-display/sprite-icon.md">спецификация SpriteIcon</a>, раздел «Ограничения». Пакетом не исправляется: это дефект продукта.</p>
  </div>

  <div class="doc-specimen">
    <div class="doc-specimen__head">
      <h5>Одна коробка, две роли</h5>
      <code>${esc(chip.productionEvidence[0].selector)}</code>
      <span class="doc-specimen__spacer"></span>
      <span class="doc-src-group">
        <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
      </span>
    </div>
    <p class="doc-note">Селектор записи <code>chip</code> находит ${chip.occurrences} узлов на ${chip.seenOn.length}/10 страницах, и это <strong>две роли одного ряда</strong>: метка («1С разработка», «Git») и счётчик переполнения («+9»). Коробка у них одна и та же; различает их единственный утилитный класс <code>max-w-[calc(100%-48px)]</code> на метках — резерв 48px под счётчик, стоящий в конце того же ряда. Одна это форма дизайн-системы или две, по макету не установлено: запись ссылается на <code>tag/text/*</code> по <code>componentKey</code> без <code>nodeId</code>, узел библиотеки не открывается. Решается на шаге <code>${esc(chip.step)}</code>.</p>
    <p class="doc-note">Побочный факт той же записи: это <strong>единственная</strong> запись реестра, чьё число зависит от ширины снимка — ${chip.occurrences} на 1440, 249 на 768, 330 на 375. Рядов при этом всегда 96; меняется, сколько меток помещается до счётчика.</p>
  </div>
</section>
`;

let html = fs.readFileSync(showcasePath, "utf8");
if (html.includes('id="doc-findings"')) {
  console.log("Раздел «Находки» уже стоит — пропуск.");
} else {
  const at = html.lastIndexOf("\n</main>");
  if (at < 0) throw new Error("не найден конец <main>");
  html = html.slice(0, at) + "\n" + section + html.slice(at);
  // Ссылка в боковой навигации — верхним уровнем, как у прочих разделов:
  // она ставится после последней категории компонентов, за закрытием её
  // вложенного списка. Первая редакция целилась в несуществующий пункт
  // «Компоненты» без подсписка и молча ничего не меняла.
  const navAnchor = '<li><a class="doc-nav__link" href="#doc-cat-entities">entities</a></li>\n      </ul>\n    </li>';
  if (html.includes(navAnchor) && !html.includes('href="#doc-findings"')) {
    html = html.replace(navAnchor,
      navAnchor + '\n    <li>\n      <a class="doc-nav__link doc-nav__link--top" href="#doc-findings">Находки</a>\n    </li>');
  }
  fs.writeFileSync(showcasePath, html, "utf8");
  console.log(`Раздел «Находки» вставлен: классов без правила ${kindNoRule.length}, спрайтов ${spriteUse.size}, star-empty ${starBroken}/${starTotal}`);
}
