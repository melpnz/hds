// Разовая правка по review-2 (major 1, major 2, minor 10) и по собственному
// аудиту 45 «производственных» записей, который эти находки потребовали.
//
// Скрипт меняет только утверждения о селекторе и об источнике: sourceScope,
// selector, note. Числа occurrences/seenOn он не трогает намеренно — их
// правит только явное принятие измерения (tools/measure-selectors.mjs →
// components/selector-census.json → правка руками), иначе получается ровно
// тот дефект, за который review-2 (note 11) вернул check-selectors.mjs:
// инструмент, делающий собственную проверку истинной.
import fs from "node:fs";

const path = "components/manifest.json";
const manifest = JSON.parse(fs.readFileSync(path, "utf8"));
const byId = new Map(manifest.components.map((component) => [component.id, component]));

// --- major 1 -------------------------------------------------------------
// Селектор h1.absolute.bottom-20… находит один узел на одной странице, и это
// <h1> «Онлайн-школа Яндекс Практикум» над карточкой EntityHeader: ни ссылок,
// ни разделителей, ни списка. Крошек в снятой разметке нет — значит запись
// не снята с продакшена, и наружу это должно выходить осью sourceScope,
// а не примечанием, которое печатает только манифест.
{
  const breadcrumbs = byId.get("breadcrumbs");
  breadcrumbs.sourceScope = "figma-only";
  breadcrumbs.occurrences = 0;
  breadcrumbs.seenOn = [];
  breadcrumbs.productionEvidence = [];
  breadcrumbs.notes =
    "В снятой разметке десяти страниц крошек как списка ссылок нет. Проверено: " +
    "селектор h1.absolute.bottom-20.text-small.text-ui-black-500 на " +
    "/education_centers/35-yandeks-praktikum находит один узел, и это <h1> " +
    "«Онлайн-школа Яндекс Практикум» — заголовок страницы, стилизованный как " +
    "подпись 14/20 #909194 и вынесенный абсолютом над карточкой EntityHeader. " +
    "Элемент описывается по макету (node 9902:39188); на R3-15 берётся оттуда.";
}

// --- аудит: вторая запись того же класса ---------------------------------
// article-card объявлял 80 вхождений на 6 страницах. Свой прогон по десяти
// dom.html: из 80 узлов только 32 — карточки «Журнала» («Статья • дата»),
// 40 — CourseCard и 8 — SchoolCard, попавшие под селектор потому, что их
// набор классов надмножество набора статьи. Селектор сужается двумя :not(),
// потому что положительного отличительного класса у статьи нет: её class —
// подмножество class карточки курса.
{
  const articleCard = byId.get("article-card");
  articleCard.productionEvidence[0].selector =
    ".swiper-slide > div.relative.box-border.h-full.overflow-hidden.rounded-3xl.border.border-ui-black-100:not(.flex):not(.cursor-pointer)";
  articleCard.productionEvidence[0].note =
    "клонов слайдов в снятом DOM нет (.swiper-slide-duplicate не встречается) — все найденные узлы настоящие. " +
    "Два :not() обязательны: набор классов карточки статьи — подмножество набора CourseCard (+flex min-w-0 flex-col) " +
    "и SchoolCard (+cursor-pointer), положительного отличительного класса у статьи нет. " +
    "Прежний селектор без них собирал 80 узлов на 6 страницах, из которых 40 были CourseCard и 8 SchoolCard";
}

// --- minor 10 и то же правило у project-icon -----------------------------
// countingRule: где селектор заведомо шире или уже элемента, это сказано
// в productionEvidence[].note, а не спрятано в разнице чисел.
{
  // ProjectIcon стоит и в футере, и в выпадающей панели шапки (4 + 4 на
  // каждой из десяти страниц). Селектор считал только футерные: число
  // измеряло место, а не элемент. Ограничение footer снято.
  const projectIcon = byId.get("project-icon");
  projectIcon.productionEvidence[0].selector = "span.align-center.inline-flex.h-6.w-6.rounded-md";
  projectIcon.productionEvidence[0].note =
    "оба места, где значок стоит: футер (4 на страницу) и выпадающая панель шапки (4 на страницу). " +
    "Прежний селектор был ограничен footer и считал половину — 40 вместо 80";

  const cardGrid = byId.get("card-grid");
  cardGrid.productionEvidence[0].note =
    "селектор уже элемента: считает только сетку карточек 4 колонки × gap 12. " +
    "Сетка ссылок grid-cols-3 gap-x-4 gap-y-2 (5 узлов на 3 страницах) — это отдельная запись link-grid, " +
    "а не непосчитанный вид CardGrid";
  cardGrid.notes =
    "4 колонки по 260 с gap 12 → tablet-only 3 → phone 1. Три варианта хвоста в снятой разметке: " +
    "phone:grid-cols-[minmax(0,1fr)] tablet-only:grid-cols-3 (4 узла), phone:grid-cols-1 tablet-only:grid-cols-2 (2), " +
    "phone:grid-cols-1 tablet-only:grid-cols-3 (2)";

  const section = byId.get("section");
  section.productionEvidence[0].note =
    "селектор уже элемента: <section> в снятой разметке 35 на 9 страницах, с раскладкой flex flex-col gap-4 — " +
    "15 на 7 страницах. Остальные 20 идут без этих утилит, и одной формой Section они не описываются: " +
    "разбирается на R4-07. Прежний селектор считал заголовки h2 внутри секции";
  section.notes =
    "section + h2 24/28 semibold ls −0.5 + слот; внутренний gap 16 у всех 15 узлов, попавших в счёт, — " +
    "по построению селектора (gap-4 стоит в нём самом), а не наблюдение по всем секциям. " +
    "Между секциями 48 на 6/10 страниц и 40 на страницах экспертов, редакции и профиля — " +
    "межсекционный интервал не сквозной";
}

// --- major 2 -------------------------------------------------------------
// «пять префиксов» против таблицы из шести строк. Пять — это про запросы
// («содержимое пяти из девяти медиазапросов сборки не читалось»), и там
// число верное; префиксов шесть.
{
  const prefixCount = Object.keys(manifest.breakpoints.prefixes).length;
  if (prefixCount !== 6) throw new Error(`ожидалось 6 префиксов, в манифесте ${prefixCount}`);
  manifest.breakpoints.production =
    "Границы 480 / 768 / 1024 и шесть префиксов сборки. 480 делит мобильный диапазон надвое, " +
    "а не отделяет мобильное от планшетного: мобильная раскладка держится до 767.";
}

fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
console.log("Правки внесены. Числа occurrences/seenOn не тронуты — их принимает отдельный шаг.");
