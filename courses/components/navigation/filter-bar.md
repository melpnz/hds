# FilterBar

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `flex` · `gap-1` · `overflow-x-auto` · `whitespace-nowrap` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-filter-bar`](../../showcase/components.html#c-filter-bar) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **5 узлах**, страниц — **5 из 10**: education-center, education-centers-listing, promocodes, reviews, schools-for-children.

ряд FilterChip с одним выбранным («Все»). На phone получает горизонтальный скролл

**Правило.** Используйте для ряда `FilterChip` над сеткой курсов в секции. В продукте 5 узлов на 5 страницах.

## Когда не использовать

- Для фильтров с несколькими значениями — в ряду выбран один чип.

## Как работает

`div` с чипами; на `phone:` ряд прокручивается по горизонтали.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. С клавиатуры доступны вложенные записи: `FilterChip` ×107 — у каждой свой раздел.

## Анимация

Классов перехода и анимации в разметке нет: наведение и другие состояния сменяются мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="scrollbar-container mt-2 flex gap-1 overflow-x-auto whitespace-nowrap px-px pt-2"><!--[--><div class="relative"><button class="bg-ui-black-850 text-ui-white border-ui-black-850 py-2 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Все<!--]--></button><!----></div><!--[--><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->HR и рекрутинг<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Аналитика и Data Science<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Бизнес и менеджмент<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Дизайн и контент<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Маркетинг и продажи<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Прикладные программы<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Программирование и IT<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Финансы и бухгалтерия<!--]--></button><!----></div><div class="relative"><button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->Языки<!--]--></button><!----></div><!--]--><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-center`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **20**
- классов в поддереве: **25**
- селектор переписи: `div.flex.gap-1.overflow-x-auto.whitespace-nowrap`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-center/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > section[2] > div[1] > div[0]`), коробка **1076×44**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `44px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `padding` | `8px 1px 0px` |
| `gap` | `4px` |
| `position` | `static` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `education-center.css`).

**Figma.** `9187:92170` (02_Education-NEW, узел 9187:92170) — секция «быстрые фильтры», около 28 фреймов

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
