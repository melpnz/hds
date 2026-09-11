// Настройки страниц шага R6 — общие для gen-page.mjs (сборка) и
// diff-page.mjs (сверка с продуктом).
//
// trim     — длинные списки: селектор контейнера и сколько детей оставить;
// stubs    — карусели Swiper, которые заменяет заглушка их размера;
// hydrated — узлы, которых в живом продукте не видно, хотя в снятой
//            разметке они есть. Их прячет scoped-правило Vue вида
//            `.x[data-v-…]:not(:only-child){display:none}`, а съёмка срезает
//            атрибуты `data-v-*` (tools/capture.mjs, cleanAttrs), и в пакете
//            правило не срабатывает. Доказательство для каждого — живой снимок
//            computed*.json, где узел 0×0. Сборка убирает их так же, как
//            продукт; сверка убирает их и у продукта, чтобы пути совпали.
export const PAGES = {
  "courses-listing": {
    source: "courses-listing",
    title: "Витрина курсов",
    url: "https://career.habr.com/courses",
    trim: [
      { sel: "div.grid.grid-cols-4.gap-3.pb-4", keep: 8, tail: 0, what: "карточек курсов из 48" },
      { sel: "section div.-mt-2", keep: 3, tail: 0, what: "пунктов ТОП-списка из 10" },
      { sel: "div.overflow-x-auto > div.w-full > div:not([class])", keep: 5, tail: 0, what: "строк рейтинга из 10" },
    ],
    stubs: [
      { sel: "div.banner-swiper", mod: "banner", name: "Carousel · AdSlot", text: "баннеры рекламы, 12 слайдов AdCard" },
      { sel: "section.flex.flex-col.gap-4 > div.relative:has(.swiper)", mod: "reviews", name: "Carousel · ReviewCard", text: "отзывы, 8 слайдов ReviewCard" },
    ],
    // Заглушку поиска SSR живой продукт прячет scoped-правилом
    // `.courses-filter-search-top-panel-placeholder[data-v-2fa9d797]:not(:only-child)`
    // (в computed.json и computed-375.json она 0×0). Первая сборка убирала её
    // из разметки; теперь слой ui/ поднимает правило без атрибута области
    // видимости, и заглушка прячется так же, как в продукте, — разметка
    // остаётся продуктовой, а hydration-diff.mjs её больше не находит.
    hydrated: [],
  },
  // hydration-diff.mjs на 1440 и 375 скрытых гидрацией узлов не нашёл.
  "education-centers-listing": {
    source: "education-centers-listing",
    title: "Витрина организаций",
    url: "https://career.habr.com/education_centers",
    trim: [
      { sel: "div.grid.grid-cols-4.gap-3.pb-4", keep: 8, tail: 0, what: "карточек школ из 20" },
    ],
    stubs: [
      { sel: "div.banner-swiper", mod: "banner", name: "Carousel · AdSlot", text: "баннеры рекламы, 16 слайдов AdCard" },
      { sel: "section.flex.flex-col.gap-4 > div.relative:has(.swiper)", index: 0, mod: "courses", name: "Carousel · CourseCard", text: "популярные курсы, 8 слайдов CourseCard" },
      { sel: "section.flex.flex-col.gap-4 > div.relative:has(.swiper)", index: 1, mod: "journal", name: "Carousel · ArticleCard", text: "журнал, 8 слайдов ArticleCard" },
    ],
    hydrated: [],
  },
  // Таблица не сокращается: 20 строк и кнопка догрузки — это и есть
  // содержание страницы. hydration-diff.mjs на 1440 и 375 — 0 узлов.
  rating: {
    source: "rating",
    title: "Рейтинг школ",
    url: "https://career.habr.com/education_centers/rating",
    trim: [],
    stubs: [
      { sel: "section.flex.flex-col.gap-4 > div.relative:has(.swiper)", mod: "courses", name: "Carousel · CourseCard", text: "«Может быть интересно», 8 слайдов CourseCard" },
    ],
    hydrated: [],
  },
  // Сетка курсов не сокращается: 8 карточек, на телефоне продукт сам
  // оставляет 4 (`phone:[&>*:nth-child(n+5)]:hidden`). hydration-diff — 0.
  "education-center": {
    source: "education-center",
    title: "Страница школы",
    url: "https://career.habr.com/education_centers/35-yandeks-praktikum",
    trim: [],
    stubs: [
      { sel: "section.flex.flex-col.gap-4 > div.relative:has(.swiper)", index: 0, mod: "journal", name: "Carousel · ArticleCard", text: "«Истории успеха», 8 слайдов ArticleCard" },
      { sel: "section.flex.flex-col.gap-4 > div.relative:has(.swiper)", index: 1, mod: "reviews", name: "Carousel · ReviewCard", text: "отзывы, 8 слайдов ReviewCard" },
    ],
    hydrated: [],
  },
  // R6-05: раздел экспертов и профиль автора. Каруселей нет, hydration-diff —
  // 0 на обеих страницах.
  authors: {
    source: "authors",
    title: "Эксперты",
    url: "https://career.habr.com/courses/authors",
    trim: [
      { sel: "section:not(.flex):not(.-mx-6) > div.grid.grid-cols-4", keep: 8, tail: 0, what: "карточек экспертов из 25" },
    ],
    stubs: [],
    hydrated: [],
  },
  author: {
    source: "author",
    title: "Профиль автора",
    url: "https://career.habr.com/courses/authors/23-stepan-voevodin",
    trim: [],
    stubs: [],
    hydrated: [],
  },
};
