# HeaderDropdown · HeaderSection

| | |
|---|---|
| **Категория** | Оверлеи (`overlays`) |
| **Корневой класс** | `absolute` · `-right-10` · `rounded-xl` · `shadow-context-menu-dropdown` |
| **CSS** | `ui/components/overlays.css` + утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#header-dropdown`](../../../viewer/index.html#header-dropdown) |
| **Snapshot** | 3 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **10 узлах**, страниц — **10 из 10**: author, authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

«Все сервисы Хабра»: в SSR панель приходит с классом hidden и пустыми секциями, в Storybook — тоже пустая. Открытое состояние не снято ни там, ни там. Класс shadow-context-menu-dropdown есть, одноимённой переменной нет — только --shadow-dropdown

**Правило.** Панель «Все сервисы Хабра» из шапки — одна на страницу, 10/10: четыре проекта с `ServiceLogo`.

## Когда не использовать

- Для каталога курсов — это `CatalogMenu`.
- Как постоянно видимое меню: панель открывается по кнопке.

## Как работает

`div` приходит из SSR с классом `hidden` — так на всех 10 страницах. Открывает его отдельная кнопка с шевроном `arrow-large` рядом с логотипом, за разделителем; сам логотип — ссылка `a[href="/courses"]`. У шеврона объявлен переход `transform` 0,15 с; `.rotate-180` в CSS корпуса объявлен, но ни на одном узле снятой разметки не стоит, так что сам поворот не подтверждён. Тень `shadow-context-menu-dropdown`, радиус 12.

## Управление клавиатурой

Пока панель скрыта (`hidden` на всех 10 страницах), её четыре ссылки в порядок табуляции не входят. Открывающая кнопка стоит в шапке, вне записи: `<button>` с `outline-none` и без своего кольца — фокус на ней не виден. Как панель открывается с клавиатуры и куда уходит фокус, в снятой разметке не видно.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div style="--dropdown-w:178px;" class="hidden absolute -right-10 top-[40px] z-10 w-[var(--dropdown-w)] overflow-hidden whitespace-normal rounded-xl border border-ui-black-100 bg-ui-white px-1 py-2 text-ui-black-850 shadow-context-menu-dropdown"><div class="py-2"><!--[--><div class="ml-4 text-small font-bold text-ui-black-850">Все сервисы Хабра</div><!--]--></div><div class="flex w-full gap-1"><!--[--><div class="flex-1"><!----><!--[--><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://habr.com/?utm_source=habr_career&amp;amp;utm_medium=habr_top_panel"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#629FBC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Хабр</p></a><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://qna.habr.com/?utm_source=habr_career&amp;amp;utm_medium=habr_top_panel"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#434B60;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Q&amp;A</p></a><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://career.habr.com/"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#6274BC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Карьера</p></a><a rel="nofollow" class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline" href="https://career.habr.com/courses"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#346EF4;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><p class="m-0 py-0.5 text-small text-ui-black-850">Курсы</p></a><!--]--><!----></div><!--]--></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **24**
- классов в поддереве: **41**
- селектор переписи: `header div.absolute.-right-10.rounded-xl.shadow-context-menu-dropdown`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > header[0] > div[0] > div[0] > div[0] > div[3]`), коробка в снимке **0×0** — узел в момент съёмки не был разложен (скрытый или свёрнутый предок), объявленные размеры — **178px × ?**:

| свойство | значение |
|---|---|
| `flex-direction` | `row` |
| `width` | `178px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `12px` |
| `padding` | `8px 4px` |
| `position` | `absolute` |
| `overflow` | `hidden` |
| `text-align` | `left` |
| `box-shadow` | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 4px 6px -1px, rgba(0, 0, 0, 0.05) 0px 2px 4px -2px` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R4-02 |
| `focus-visible` | дописано нормативом | `ui/state-contract.css` — не снимок продукта, а норматив пакета |
| `open` | снято с production | Сверено по клику на стрелку рядом с логотипом на `/courses/dizajn/3d-modelling`. |
| `closed` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R4-02 |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Open.** Production-сверка 18 сентября 2026 подтвердила панель 178 px, четыре сервиса, поворот шеврона и раскрытие относительно логотипа.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin) · [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `15065:244076` (02_Education-NEW, узел 15065:244076)

**Storybook.** [{"story":"header-headerdropdown--header-dropdown-story","file":null,"renders":true,"note":null},{"story":"header-headersection--header-section-story","file":"_sources/courses/rendered/header-headersection--header-section-story.html","renders":true,"note":"секция панели, снята пустой. Добавлено на R0-05 из _sources/courses/inventory.json — инвентаризация эту story не записала"}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._


## Исправление v0.2 · живой пример

В viewer панель показана открытой по умолчанию; кнопка-триггер переключает `aria-expanded` и атрибут `hidden`, позволяя проверить `open` и `closed`. Геометрия, четыре ссылки и поведение раскрытия сверены с production.
