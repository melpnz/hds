// Раздел «Правила уровня страницы» в showcase/pages.html (шаг R7).
//
// Каждое правило docs/guide/composition.md получает блок doc-rule с тем же
// id в data-rule, счётом голосов и ссылками на страницы витрины, где его
// видно. У правил уровня компонента рядом стоит живой образец — вырезанный
// из собранных страниц showcase/pages/<id>.html (та же разметка продукта,
// тот же ui/courses.css), а не свёрстанный заново. Раздел пересобирается
// целиком между маркерами <!-- rules:start --> и <!-- rules:end -->.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const PAGE = { "courses-listing": "витрина курсов", "education-centers-listing": "витрина организаций", rating: "рейтинг", "education-center": "страница школы", authors: "эксперты", author: "профиль" };
const link = (ids) => ids.map((i) => `<a href="#p-${i}">${PAGE[i]}</a>`).join(", ");

// specimen: [страница, селектор, индекс] — узел вырезается из собранной страницы.
const RULES = [
  { group: "Оболочка" },
  { id: "SH-1", votes: "10 / 10", title: "Контейнер 1124 с полями 24, колонка на 1440 — 1076.", text: "Связка <code>mx-auto max-w-[1124px] px-6</code> на каждой странице; шире колонки не выходит ни один блок, панель экспертов раздвигается на 24 отрицательным полем.", pages: ["courses-listing", "education-center", "author"] },
  { id: "SH-2", votes: "10 / 10 на 1440", title: "Шапка — 64 на градиенте <code>bg-main-gradient-first</code>.", text: "На 375 — 64 у 9 страниц из 10.", exception: "Витрина курсов на телефоне — 108: поле поиска уходит второй строкой.", pages: ["courses-listing", "rating"] },
  { id: "SH-3", votes: "9 / 10", title: "Шапка не липкая.", exception: "Витрина курсов — <code>sticky top-0</code>.", pages: ["courses-listing", "education-centers-listing"] },
  { id: "SH-4", votes: "10 / 10", title: "Подвал на <code>#f1f1f1</code>: 192 от 1024, 256 на 768, 476 на 375.", pages: ["rating"] },
  { id: "SH-5", votes: "10 / 10", title: "Фон страницы белый.", pages: ["education-centers-listing"] },
  { id: "SH-6", votes: "7 / 10", title: "Раздел с выдачей открывается hero с <code>h1</code> 44/48 по центру.", exception: "Без hero — витрина курсов, страница школы, профиль.", pages: ["education-centers-listing", "rating", "authors"] },
  { group: "Сетка и ритм" },
  { id: "L-1", votes: "10 / 10", title: "Одна колонка во всю ширину контейнера, без сайдбара.", pages: ["courses-listing", "rating"] },
  { id: "L-2", votes: "8 / 9 сеток", title: "Сетка карточек — 4 × 260 с промежутком 12.", exception: "Сетка курсов страницы школы — 4 × 257 с промежутком 16.", pages: ["courses-listing", "education-centers-listing", "education-center"] },
  { id: "L-3a", votes: "7 / 7", title: "Выдача, таблица и сущность: блоки через 48 (<code>gap-12</code>).", pages: ["courses-listing", "rating", "education-center"] },
  { id: "L-3b", votes: "3 / 3", title: "Промо-раздел и профиль: блоки через 40 (<code>gap-10</code>).", pages: ["authors", "author"] },
  { id: "L-4", votes: "8 / 10", title: "Колонка начинается с 40 под hero и с 24 без hero.", exception: "Эксперты и редакция — 0: панель наезжает на hero.", pages: ["rating", "courses-listing", "authors"] },
  { id: "L-5", votes: "15 секций", title: "Заголовок секции отстоит от содержимого на 16.", pages: ["education-centers-listing"] },
  { group: "Поверхности и форма" },
  { id: "C-1", votes: "254 / 254", title: "Карточка — рамка 1px и радиус 24, без заливки и без тени.", text: "Семь типов карточек на девяти страницах.", exception: "<code>AdCard</code> — без рамки; <code>NumberedCourseItem</code> — не карточка.", specimen: [["authors", "div.flex.flex-col.gap-1.rounded-3xl.border.border-solid", 0], ["education-centers-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0]], pages: ["courses-listing", "authors"] },
  { id: "C-2", votes: "32 узла", title: "Тень есть только у стрелок карусели и всплывающих слоёв.", text: "Все 32 узла с тенью — <code>swiper-button-shadow</code>; у плоскостей страницы тени нет.", pages: ["education-center"] },
  { id: "C-3", votes: "1 207 узлов", title: "Радиус по роли: 24 — плоскость, 12 — управляющий элемент, пилюля — метка.", text: "Правило витрины компонентов <code>radius-four-steps</code> даёт те же значения по корням записей.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["courses-listing", "div.bg-ui-black-50.flex.items-center.px-2.py-1.rounded-full", 1], ["education-center", "button.h-9.rounded-full", 1]], pages: ["courses-listing"] },
  { group: "Акценты и текст" },
  { id: "A-1", votes: "191 / 191", title: "Кнопок два цвета: тёмная (173) и светлая (18).", text: "Синих и оранжевых кнопок нет. То же правило по записи — <code>button-dark-default</code> на витрине компонентов.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]], pages: ["education-centers-listing", "education-center"] },
  { id: "A-2", votes: "87 / 87", title: "Оранжевый — только бейдж скидки.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 div.bg-ui-orange-500", 0]], pages: ["courses-listing"] },
  { id: "A-3", votes: "10 / 10 · 9 / 9", title: "Основной текст 14/400, заголовок секции 24/28, 600.", pages: ["rating", "education-center"] },
  { id: "A-4", votes: "7 / 10", title: "<code>h1</code> 44/48 стоит только в hero.", exception: "Витрина курсов — без <code>h1</code>; страница школы — <code>h1</code> 14 внизу колонки; профиль — без заголовков.", pages: ["authors", "education-center", "author"] },
  { group: "Реакция на курсор" },
  { id: "C-4", votes: "0 / 315", title: "Корень карточки на наведение не реагирует.", text: "Наведите на карточку: меняется только кнопка и подчёркивание ссылок.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0]], pages: ["courses-listing"] },
  { id: "C-5", votes: "173 / 173 · 18 / 18", title: "Тёмная кнопка — <code>opacity-90</code>, светлая — фон <code>bg-ui-black-100</code>.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]], pages: ["education-centers-listing"] },
  { id: "C-6", votes: "37 ссылок", title: "Строка таблицы и номер листания — фон <code>bg-ui-black-50</code>.", pages: ["rating", "courses-listing"] },
  { group: "Адаптив" },
  { id: "R-1", votes: "9 / 9", title: "До 767 каждая сетка карточек — одна колонка.", pages: ["courses-listing", "education-centers-listing"] },
  { id: "R-2", votes: "7 / 9", title: "На 768–1023 сетка карточек — 3 колонки.", exception: "Шаги экспертов и редакции — 2 колонки.", pages: ["courses-listing", "authors"] },
  { id: "R-3", votes: "10 / 10", title: "Подвал: 4 колонки от 1024, 3 на 768–1023, 1 до 767.", pages: ["rating"] },
  { id: "R-4", votes: "10 / 10", title: "Порядок блоков на всех ширинах один.", pages: ["courses-listing", "education-center"] },
  { id: "R-5", votes: "5 / 5", title: "Форма поиска на телефоне показывает дубль полей в одну колонку, а ряд прячет.", pages: ["education-centers-listing", "rating"] },
  { group: "Тексты" },
  { id: "CT-1", votes: "7 / 7", title: "Дробная часть — через точку: «4.55».", pages: ["rating"] },
  { id: "CT-2", votes: "7 / 7", title: "Разряды — пробелом, рубль — после числа: «от 4 223 ₽/мес».", pages: ["courses-listing"] },
  { id: "CT-3", votes: "18 / 22 подписей", title: "Подпись кнопки перехода и поиска — инфинитив: «Найти школы», «Посмотреть все курсы».", exception: "«Далее», «Подробнее» — наречия в карточке; «Каталог», «Больше об эксперте».", pages: ["education-centers-listing", "education-center"] },
];

// Живые образцы — из собранных страниц
const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const pg = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
const cache = {};
for (const r of RULES) {
  if (!r.specimen) continue;
  r.html = [];
  for (const [page, sel, idx] of r.specimen) {
    if (!cache[page]) cache[page] = fs.readFileSync(path.join(pkg, "showcase/pages", `${page}.html`), "utf8");
    await pg.setContent(cache[page]);
    const h = await pg.evaluate(({ sel, idx }) => { const n = document.querySelectorAll(sel)[idx]; return n ? n.outerHTML : null; }, { sel, idx });
    if (!h) throw new Error(`${r.id}: нет образца ${page} ${sel} #${idx}`);
    r.html.push(h.replace(/\.\.\/\.\.\/ui\//g, "../ui/"));
  }
}
await browser.close();

const esc = (s) => s;
let out = `<!-- rules:start — собрано .pipeline/principles/gen-rules-showcase.mjs, руками не править -->
<section class="doc-section" id="doc-rules">
  <div class="doc-section__head">
    <span class="doc-section__num">3</span>
    <h2>Правила уровня страницы</h2>
    <p>Выведены голосованием по десяти снятым страницам (шаг R7). Формулировки, покрытие и исключения — <a href="../docs/guide/composition.md">docs/guide/composition.md</a>, решения для нового экрана — <a href="../docs/guide/decisions.md">decisions.md</a>, замеры — <code>.pipeline/principles-evidence.md</code>.</p>
  </div>
`;
for (const r of RULES) {
  if (r.group) { out += `\n  <h3 class="doc-subhead">${r.group}</h3>\n`; continue; }
  out += `
  <div class="doc-rule" data-rule="${r.id}" id="rule-${r.id}">
    <div class="doc-rule__head">
      <h3>${r.id}</h3>
      <span class="doc-rule__votes">${r.votes}</span>
    </div>
    <p><strong>${esc(r.title)}</strong>${r.text ? " " + r.text : ""}</p>${r.exception ? `\n    <p class="doc-rule__exception">${r.exception}</p>` : ""}${r.html ? `
    <div class="doc-stage doc-stage--grid">
${r.html.map((h) => `      <div class="doc-variant"><div class="doc-variant__row" style="max-width:320px;display:block">${h}</div></div>`).join("\n")}
    </div>` : ""}
    <p class="doc-note">Видно на страницах: ${link(r.pages)}.</p>
  </div>
`;
}
out += `</section>\n<!-- rules:end -->`;

const file = path.join(pkg, "showcase/pages.html");
let html = fs.readFileSync(file, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n";
html = html.replace(/\r\n/g, "\n");
if (html.includes("<!-- rules:start")) html = html.replace(/<!-- rules:start[\s\S]*?<!-- rules:end -->/, out);
else html = html.replace("\n</main>", "\n" + out + "\n\n</main>");
if (!html.includes('href="#doc-rules"')) html = html.replace('    <li>\n      <a class="doc-nav__link doc-nav__link--top" href="#doc-pages">Страницы</a>', '    <li><a class="doc-nav__link doc-nav__link--top" href="#doc-rules">Правила уровня страницы</a></li>\n    <li>\n      <a class="doc-nav__link doc-nav__link--top" href="#doc-pages">Страницы</a>');
fs.writeFileSync(file, html.replace(/\n/g, nl), "utf8");
console.log(`правил: ${RULES.filter((r) => r.id).length}, с живым образцом: ${RULES.filter((r) => r.html).length}`);
