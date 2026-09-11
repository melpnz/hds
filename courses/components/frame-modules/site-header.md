# SiteHeader

| | |
|---|---|
| **Категория** | Модули оболочки (`frame-modules`) |
| **Корневой класс** | `bg-main-gradient-first` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-site-header`](../../showcase/components.html#c-site-header) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **10 узлах**, страниц — **10 из 10**: author, authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

высота 64 на 10/10, фон linear-gradient(180deg,#346ef4,#346ef4). Sticky только на /courses (1/10) — исследование объявляет sticky инвариантом, снимок это опровергает. Токен --header-height в проде 64, в сборке Storybook 112 (мобильный 144): расхождение сборок

**Правило.** Шапка каждой страницы, 10/10: логотип с выпадашкой сервисов, каталог, поиск, ссылки разделов.

## Когда не использовать

- Внутри страницы — для навигации по рубрикам раздела есть `RubricationBar`.

## Как работает

`<header>` с градиентом `bg-main-gradient-first`. На `phone:` ряд переносится (`phone:flex-wrap`), поиск уходит последним (`phone:order-last`). Липкая шапка — только на `/courses`.

## Управление клавиатурой

Корень (`<header>`) в фокус не попадает. На один экземпляр по Tab проходят: 1 кнопка и 4 ссылки — у 9 из 10; 2 кнопки, 1 поле `input type=text` и 4 ссылки — у 1 из 10. По корпусу (92 узла): `Link` — 80, `Button` — 1, внутри `TextInput` — 1; вне записей реестра — `button.font-inherit.inline-flex.h-6.cursor-pointer` — 10. Фокус внутреннего поля показывает рамка обёртки `focus-within:border-ui-black-850`. 40 из 92 фокусируемых узлов на 1440 скрыты и в порядок табуляции не входят, пока их не покажут.

## Анимация

Переходы вычислены по страницам, отрисованным с CSS корпуса на 1440:

- `transform` за 0,15 с, кривая `cubic-bezier(0.4, 0, 0.2, 1)`: `svg.svg-icon.transition-transform.text-ui-white`, `svg.svg-icon.absolute.right-3` — 11 узлов, у 10 экземпляров из 10;
- `opacity, transform` за 0,18 с и 0,22 с, кривая `ease, cubic-bezier(0.2, 0.8, 0.2, 1)`: `svg.svg-icon.header-catalog__icon-item.text-ui-white` — 2 узла, у 1 экземпляра из 10.

Остальные узлы переходов не объявляют: наведение на них сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<header data-anchor-scroll-offset="" class="bg-main-gradient-first" style=""><div class="relative z-[100] w-full"><div class="mx-auto max-w-[1124px] px-6 py-0 tablet:px-6 m-auto flex h-[64px] items-center justify-between gap-1 whitespace-nowrap !px-6 text-left phone:h-auto phone:min-h-[64px] phone:flex-wrap phone:gap-y-3 phone:py-3"><!--[--><div class="relative inline-flex items-center"><!--[--><a href="/courses" class="inline-flex items-center" title="Хабр Курсы" rel="nofollow"><img src="/courses-web/images/avatars/logo.svg" alt="Хабр Курсы" width="97" height="32"></a><span class="ml-3 h-6 border-l border-l-ui-white-transparent-50"></span><!--]--><button type="button" class="font-inherit inline-flex h-6 cursor-pointer items-center rounded-none border-0 bg-transparent p-0 px-1 text-ui-white outline-none"><svg class="svg-icon transition-transform text-ui-white opacity-70" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-large"></use></svg></button><div style="--dropdown-w:178px;" class="hidden absolute -right-10 top-[40px] z-10 w-[var(--dropdown-w)] overflow-hidden whitespace-normal rounded-xl border border-ui-black-100 bg-ui-white px-1 py-2 text-ui-black-850 shadow-context-menu-dropdown"><div class="py-2"><!--[--><div class="ml-4 text-small font-bold text-ui-black-850">Все сервисы Хабра</div><!--]--></div><div class="flex w-full gap-1"><!--[--><div class="flex-1"><!----><!--[--><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://habr.com/?utm_source=habr_career&amp;amp;utm_medium=habr_top_panel"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#629FBC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Хабр</p></a><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://qna.habr.com/?utm_source=habr_career&amp;amp;utm_medium=habr_top_panel"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#434B60;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Q&amp;A</p></a><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://career.habr.com/"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#6274BC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Карьера</p></a><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://career.habr.com/courses"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#346EF4;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Курсы</p></a><!--]--><!----></div><!--]--></div></div></div><div id="courses-filter-search-top-panel" class="min-w-0 flex-1 phone:order-last phone:flex-none phone:basis-full phone:empty:hidden"><!----></div><div class="flex gap-4"><a href="/education_centers" class="flex flex-col items-center text-micro font-semibold text-ui-white hover:no-underline"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#building"></use></svg><span class="tablet:hidden">Школы и Вузы</span></a><a href="/education_centers/otzyvy" class="flex flex-col items-center text-micro font-semibold text-ui-white hover:no-underline"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-empty"></use></svg><span class="tablet:hidden">Отзывы</span></a><a href="/education/promocodes" class="flex flex-col items-center text-micro font-semibold text-ui-white hover:no-underline"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#percents"></use></svg><span class="tablet:hidden">Промокоды</span></a></div><!--]--></div></div></header>
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **48**
- классов в поддереве: **83**
- селектор переписи: `header.bg-main-gradient-first`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > header[0]`), коробка **1440×64**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `1440px` |
| `height` | `64px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `position` | `static` |
| `overflow` | `visible` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Responsive

Классы с префиксом ширины в поддереве записи: `tablet:px-6`, `phone:h-auto`, `phone:min-h-[64px]`, `phone:flex-wrap`, `phone:gap-y-3`, `phone:py-3`, `phone:order-last`, `phone:flex-none`, `phone:basis-full`, `phone:empty:hidden` и другие. Условия префиксов: `phone:` — до 767, `tablet:` — до 1023 (`docs/guide/layout.md`).

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `font-inherit`, `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin) · [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `header/courses` (02_Education-NEW, узел 15065:242662) — header/courses, 9 вариантов device×type×fixed

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
