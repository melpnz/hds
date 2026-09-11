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
  { id: "SH-1", votes: "10 / 10 × 4 ширины", title: "Контейнер 1124 с полями 24, колонка на 1440 — 1076.", text: "Связка <code>mx-auto max-w-[1124px] px-6</code> на каждой странице; за контейнер не выходит ни один узел ни на одной из четырёх ширин.", exception: "В поле 24 за колонку уходят: панель экспертов (<code>-mx-6</code>, все ширины); до 767 — таблица рейтинга и шапка школы (<code>phone:-mx-6 phone:rounded-none</code>); стрелки карусели — половиной.", pages: ["courses-listing", "education-center", "authors"] },
  { id: "SH-2", votes: "10 / 10 на 1440, 1024, 768", title: "Шапка — 64 на градиенте <code>bg-main-gradient-first</code>.", text: "На 375 — 64 у 9 страниц из 10.", exception: "Витрина курсов на телефоне — 108: поле поиска уходит второй строкой.", pages: ["courses-listing", "rating"] },
  { id: "SH-3", votes: "9 / 10", title: "Шапка не липкая.", exception: "Нарушитель — витрина курсов: <code>sticky top-0</code>.", pages: ["courses-listing", "education-centers-listing"] },
  { id: "SH-4", votes: "10 / 10 × 4 ширины", title: "Подвал на <code>#f1f1f1</code>: 192 на 1440 и 1024, 256 на 768, 476 на 375.", exception: "В корпусе нарушителей нет.", pages: ["rating"] },
  { id: "SH-5", votes: "10 / 10", title: "Фон страницы белый.", exception: "В корпусе нарушителей нет.", pages: ["education-centers-listing"] },
  { id: "SH-6", votes: "7 / 10", title: "Раздел с выдачей открывается hero с <code>h1</code> 44/48 по центру; вне hero <code>h1</code> 44/48 не бывает.", exception: "Нарушитель — витрина курсов: выдача без hero и без <code>h1</code>. Страница школы и профиль открываются шапкой сущности и шапкой профиля.", pages: ["education-centers-listing", "rating", "authors"] },
  { group: "Сетка и ритм" },
  { id: "L-1", votes: "10 / 10 × 4 ширины", title: "Одна колонка во всю ширину контейнера, без сайдбара.", exception: "В корпусе нарушителей нет.", pages: ["courses-listing", "rating"] },
  { id: "L-2", votes: "8 / 9 сеток", title: "Сетка карточек — 4 × 260 с промежутком 12.", exception: "Нарушитель — сетка курсов страницы школы: 4 × 257 с промежутком 16.", pages: ["courses-listing", "education-centers-listing", "education-center"] },
  { id: "L-3a", votes: "7 / 10", title: "Блоки главной колонки идут через 48 (<code>gap-12</code>).", text: "Листинги 5 из 5, рейтинг, страница школы.", exception: "Нарушитель — профиль автора: 40. Промо-раздел — по L-3b.", pages: ["courses-listing", "rating", "education-center"] },
  { id: "L-3b", votes: "2 / 2", title: "Промо-раздел: блоки через 40 (<code>gap-10</code>).", text: "Эксперты и редакция; редакция — клон экспертов.", exception: "В корпусе нарушителей нет.", pages: ["authors"] },
  { id: "L-4", votes: "8 / 10", title: "Колонка начинается с 40 под hero и с 24 без hero.", exception: "Эксперты и редакция — 0: панель наезжает на hero.", pages: ["rating", "courses-listing", "authors"] },
  { id: "L-5a", votes: "23 / 24 секции", title: "Содержимое секции начинается в 16 под <code>h2</code>.", text: "Счёт по тегу: все видимые секции с <code>h2</code> вне промо-раздела.", exception: "Нарушитель — «Больше об авторах» на витрине курсов: 24.", pages: ["education-centers-listing", "education-center"] },
  { id: "L-5b", votes: "3 / 4 секции", title: "Промо-раздел: содержимое секции начинается в 24 под <code>h2</code>.", exception: "«Крутые ребята, которые оценивают» — под <code>h2</code> подзаголовок через 12.", pages: ["authors"] },
  { group: "Поверхности и форма" },
  { id: "C-1", votes: "254 / 306", title: "Карточка — рамка 1px и радиус 24, без заливки и без тени.", text: "Семь типов карточек; по всем 690 плоскостям от 200×60 тени нет ни у одной.", exception: "<code>AdCard</code> (52) — без рамки: картинка во всю карточку. <code>NumberedCourseItem</code> — не карточка.", specimen: [["authors", "div.flex.flex-col.gap-1.rounded-3xl.border.border-solid", 0], ["education-centers-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0]], pages: ["courses-listing", "authors"] },
  { id: "C-2", votes: "32 / 32 узла", title: "Тень есть только у стрелок карусели и всплывающих слоёв.", text: "Все 32 узла с тенью — <code>swiper-button-shadow</code>.", exception: "В корпусе нарушителей нет.", pages: ["education-center"] },
  { id: "C-3a", votes: "223 / 232", title: "Кнопка и поле высотой 40–56 — радиус 12.", exception: "Поля формы поиска — 0: стыкуются в общей обёртке.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]], pages: ["courses-listing", "education-centers-listing"] },
  { id: "C-3b", votes: "787 / 807", title: "Элемент до 36 в высоту — пилюля или круг.", text: "Чипы, фильтры, бейджи, метки на обложке, стрелки; радиус 24 у метки высотой 24 глазу равен 9999.", exception: "Плашка школы в <code>ReviewCard</code> — 32 в высоту, радиус 6.", specimen: [["courses-listing", "div.flex.flex-wrap.items-start.gap-1.self-stretch.text-micro", 0], ["education-center", "div.scrollbar-container.mt-2.flex.gap-1", 0], ["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 div.bg-ui-orange-500", 0]], pages: ["courses-listing", "education-center"] },
  { id: "C-3c", votes: "138 / 138 · 267 / 268", title: "Фото человека — круг; логотип организации — квадрат со скруглением в четверть стороны.", text: "24 → 6, 32 → 8, 48 → 12, 100 → 24.", exception: "Значок школы на аватаре профиля: 40 → 14.", specimen: [["courses-listing", "div.flex.items-center.gap-2.whitespace-nowrap:has(> img.rounded-lg)", 0], ["authors", "div.relative.h-\\[68px\\].w-\\[68px\\]", 0]], pages: ["courses-listing", "authors", "author"] },
  { group: "Акценты и текст" },
  { id: "A-1", votes: "191 / 191", title: "Фон <code>Button</code> в корпусе — тёмный (173) или светлый (18), третьего нет.", text: "Синий в продукте — градиент шапки и hero и текст ссылок, фоном <code>Button</code> не бывает. Остальные <code>&lt;button&gt;</code> белые или прозрачные.", exception: "Вне области правила: выбранный <code>FilterChip</code> «Все» тёмный — это состояние выбора.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]], pages: ["education-centers-listing", "education-center"] },
  { id: "A-2", votes: "87 / 87", title: "Оранжевый <code>ui-orange-500</code> — только фон бейджа скидки.", text: "Оранжевого текста нет; звёзды рейтинга — другой токен, <code>ui-yellow-500</code>.", exception: "В корпусе нарушителей нет.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 div.bg-ui-orange-500", 0]], pages: ["courses-listing"] },
  { id: "A-3", votes: "10 / 10 · 28 / 28", title: "Основной текст 14/400, заголовок секции 24/28, 600.", exception: "Профиль — заголовки разделов <code>div.text-h2</code> того же размера.", pages: ["rating", "education-center", "author"] },
  { id: "A-5", votes: "41 / 42 узла", title: "Крупнее 18 — только заголовки: <code>h1</code> 44, заголовок раздела 24, имя в шапке 30.", exception: "Нарушитель — имя эксперта в «Больше об авторах»: 20/600.", pages: ["education-centers-listing", "education-center", "author"] },
  { group: "Реакция на курсор" },
  { id: "C-4", votes: "0 / 315", title: "Корень карточки на наведение не реагирует.", text: "Наведите на карточку: меняется только кнопка и подчёркивание ссылок.", exception: "В корпусе нарушителей нет.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 > div", 0]], pages: ["courses-listing"] },
  { id: "C-5", votes: "173 / 173 · 18 / 18", title: "Тёмная кнопка — <code>opacity-90</code>, светлая — фон <code>bg-ui-black-100</code>.", exception: "В корпусе нарушителей нет.", specimen: [["courses-listing", "div.grid.grid-cols-4.gap-3.pb-4 button.rounded-xl", 0], ["education-centers-listing", "section a.inline-flex.w-full.rounded-xl", 0]], pages: ["education-centers-listing"] },
  { id: "C-6", votes: "37 ссылок", title: "Строка таблицы и номер листания — фон <code>bg-ui-black-50</code>.", exception: "В корпусе нарушителей нет; класс <code>phone:hover:bg-none</code> у строк таблицы в CSS не скомпилирован.", pages: ["rating", "courses-listing"] },
  { group: "Адаптив" },
  { id: "R-1", votes: "9 / 9", title: "До 767 каждая сетка карточек — одна колонка.", exception: "В корпусе нарушителей нет.", pages: ["courses-listing", "education-centers-listing"] },
  { id: "R-2", votes: "7 / 9 на 768", title: "На 768–1023 сетка карточек — 3 колонки, на 1024 — уже 4.", exception: "Нарушитель — шаги экспертов и редакции: 2 колонки.", pages: ["courses-listing", "authors"] },
  { id: "R-3", votes: "10 / 10 × 4 ширины", title: "Подвал: 4 колонки от 1024, 3 на 768–1023, 1 до 767.", exception: "В корпусе нарушителей нет.", pages: ["rating"] },
  { id: "R-4", votes: "10 / 10 × 4 ширины", title: "Порядок блоков на всех ширинах один.", exception: "Внутри шапки витрины курсов поиск уходит последним — перестановка внутри блока.", pages: ["courses-listing", "education-center"] },
  { id: "R-5", votes: "5 / 5", title: "Форма поиска на телефоне показывает дубль полей в одну колонку, а ряд прячет.", exception: "В корпусе нарушителей нет.", pages: ["education-centers-listing", "rating"] },
  { group: "Тексты" },
  { id: "CT-1", votes: "7 / 7", title: "Дробная часть — через точку: «4.55».", exception: "В корпусе нарушителей нет; «3,500+» у эксперта — разряды в тексте автора.", pages: ["rating"] },
  { id: "CT-2a", votes: "209 / 210", title: "Цена: разряды через пробел, рубль после числа — «от 4 223 ₽/мес».", exception: "Нарушитель — «Скидка 1000 ₽» в карточке промокода.", pages: ["courses-listing"] },
  { id: "CT-2b", votes: "23 / 23", title: "Счётчик пишется слитно: «1419 отзывов», «+18070».", exception: "В корпусе нарушителей нет; числа в тексте автора идут вразнобой — правило их не задаёт.", pages: ["education-centers-listing", "education-center"] },
  { id: "CT-3a", votes: "144 / 144", title: "Кнопка перехода в карточке курса и школы — «Далее» или «Подробнее».", exception: "Нарушитель — карточка промокода: «Посмотреть», «Открыть код».", pages: ["courses-listing", "education-centers-listing"] },
  { id: "CT-3b", votes: "25 / 27", title: "Кнопка вне карточки начинается с инфинитива: «Найти школы», «Перейти ко всем курсам».", exception: "«Каталог» в шапке; «Больше об эксперте».", pages: ["education-centers-listing", "education-center"] },
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
