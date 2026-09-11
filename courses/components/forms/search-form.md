# SearchForm

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `grid` · `grid-cols-[1fr_max-content]` · `gap-2` · `rounded-md` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-search-form`](../../showcase/components.html#c-search-form) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **5 узлах**, страниц — **5 из 10**: education-centers-listing, promocodes, rating, reviews, schools-for-children.

grid [1fr max-content] gap 8; внутри 2–3 поля через grid-cols-2|3 gap-[1px] (стык в 1px даёт слитную группу) и кнопка XL. На phone — одна колонка, дублирующая раскладка через hidden/phone:grid

**Правило.** Используйте для поиска с параметрами в hero: поля `Select` и кнопка «Найти …» с именем раздела. В продукте 5 узлов на 5 страницах.

## Когда не использовать

- Для глобального поиска — `SearchInput` в шапке.

## Как работает

Сетка из `Select` и `Button`; на `phone:` раскладка переключается на одну колонку (`phone:grid-cols-[1fr]`).

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. С клавиатуры доступны вложенные записи: `Select` ×28, `TextInput` ×28, `Button` ×5 — у каждой свой раздел. Фокус внутреннего поля показывает рамка обёртки `focus-within:border-ui-black-850`.

## Анимация

В поддереве записи — `transition-transform` — переход по `transform` 0.15 с с кривой `cubic-bezier(.4,0,.2,1)`. Других переходов нет: наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="grid grid-cols-[1fr_max-content] gap-2 rounded-md phone:grid-cols-[1fr] phone:gap-4 pb-10 pt-8 phone:pb-6 phone:pt-6"><div class="grid grid-cols-3 gap-[1px] phone:hidden"><!--[--><!--[--><div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-l-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Организация"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div><div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-none"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Что изучить?"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div><div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-r-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Тип"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div><!--]--><!--]--></div><div class="hidden grid-cols-1 gap-[1px] phone:grid"><!--[--><!--[--><div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-t-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Организация"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div><div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-none"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Что изучить?"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div><div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-b-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Тип"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div><!--]--><!--]--></div><!--[--><!--[--><button target="_self" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-14 px-6 py-3 text-default border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white"><!--[--> Найти организации <!--]--></button><!--]--><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **63**
- классов в поддереве: **82**
- селектор переписи: `div.grid.grid-cols-\[1fr_max-content\].gap-2.rounded-md`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-centers-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0] > div[0] > div[0] > div[2]`), коробка **1076×128**:

| свойство | значение |
|---|---|
| `display` | `grid` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `128px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `6px` |
| `padding` | `32px 0px 40px` |
| `gap` | `8px` |
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

Классы с префиксом ширины в поддереве записи: `phone:hidden`, `phone:grid`, `phone:grid-cols-[1fr]`, `phone:gap-4`, `phone:pb-6`, `phone:pt-6`. Условия префиксов: `small-phone:` — до 479, `phone:` — до 767, `tablet-only:` — 768–1023, `tablet:` — до 1023 (`docs/guide/layout.md`).

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(4 файла: `author.css`, `base-custom-select-with-input-list.DYeSdhXo.css`, `education-centers-listing.css`, `similar-courses.DqXT-MW0.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
