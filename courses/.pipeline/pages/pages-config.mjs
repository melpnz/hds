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
    hydrated: [
      {
        sel: "header .courses-filter-search-top-panel-placeholder:not(:only-child)",
        why: "заглушка поиска SSR: в computed-375.json и computed.json 0×0, прячет её .courses-filter-search-top-panel-placeholder[data-v-2fa9d797]:not(:only-child){display:none}",
      },
    ],
  },
};
