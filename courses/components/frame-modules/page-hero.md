# PageHero

| | |
|---|---|
| **Категория** | Модули оболочки (`frame-modules`) |
| **Корневой класс** | `w-full` · `bg-main-gradient-second` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-page-hero`](../../showcase/components.html#c-page-hero) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **9 узлах**, страниц — **8 из 10**: authors, courses-listing, editors, education-centers-listing, promocodes, rating, reviews, schools-for-children.

тот же градиент, что у RubricationBar, но как крупный блок 288–388px: H1 44/48 semibold ls −0.5 белым, max-w 652, по центру, pt 64 (phone 40, text-h1-mobile). Три состава: SegmentedControl + SearchForm (4 страницы), только SearchForm (1), лид + два CTA (2). На /courses и страницах сущностей hero отсутствует

**Правило.** Используйте для первого экрана листинга и промо-раздела: заголовок раздела и главный инструмент — поиск или переключатель аудитории. В продукте 9 узлов на 8 страницах, три состава.

## Когда не использовать

- На странице сущности и на `/courses` — там hero нет.
- Для второстепенных блоков страницы — `Section`.

## Как работает

Градиентный блок 288–388 с заголовком 44 / 48 (на `phone:` — `text-h1-mobile` 30 / 34). Внутри — `SegmentedControl`, `SearchForm` или два CTA.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. С клавиатуры доступны вложенные записи: `Select` ×28, `TextInput` ×28, `Link` ×16, `Button` ×9, `SegmentedControl` ×4 — у каждой свой раздел. Фокус внутреннего поля показывает рамка обёртки `focus-within:border-ui-black-850`.

## Анимация

В поддереве записи — `transition-transform` — переход по `transform` 0.15 с с кривой `cubic-bezier(.4,0,.2,1)`. Других переходов нет: наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="w-full bg-main-gradient-second"><div class="m-auto max-w-[1124px] px-6"><!--[--><h1 class="m-0 mx-auto max-w-[652px] whitespace-normal break-keep pt-[64px] text-center text-h1 font-semibold text-ui-white phone:pt-[40px] phone:text-h1-mobile">Эксперты<br>по оценке обучения</h1><!--]--><!--[--><div class="py-6 text-center text-small text-ui-white"> В&nbsp;Хабре мы&nbsp;серьёзно относимся к&nbsp;качеству контента. Курсы, которые вы&nbsp;видите на&nbsp;наших страницах, проверяют профессионалы из&nbsp;отрасли&nbsp;— они оценивают актуальность материала и&nbsp;честно говорят, если курс не&nbsp;стоит рекомендовать. Всё для того, чтобы вы&nbsp;получали только тот образовательный контент, которому можно доверять. </div><div class="flex justify-center gap-2 pb-20 phone:flex-col"><a href="#experts-authors" target="_self" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white"><!--[--> Посмотреть экспертов <!--]--></a><a href="/courses/editors" target="_self" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300"><!--[--> Перейти к редакции <!--]--></a></div><!--]--><!--[--><!--]--></div><!----></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `authors`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **7**
- классов в поддереве: **49**
- селектор переписи: `div.w-full.bg-main-gradient-second`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/authors/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0] > div[0]`), коробка **1440×388**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `1440px` |
| `height` | `388px` |
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

Классы с префиксом ширины в поддереве записи: `phone:pt-[40px]`, `phone:text-h1-mobile`, `phone:grid-cols-[1fr]`, `phone:gap-4`, `phone:pb-6`, `phone:pt-6`, `phone:hidden`, `phone:grid`, `small-phone:w-full`, `small-phone:text-center` и другие. Условия префиксов: `small-phone:` — до 479, `phone:` — до 767, `tablet-only:` — 768–1023, `tablet:` — до 1023 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
