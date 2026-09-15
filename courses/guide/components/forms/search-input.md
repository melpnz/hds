# SearchInput

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `courses-filter-search-top-panel-placeholder` |
| **CSS** | `ui/components/forms.css` + утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#search-input`](../../../viewer/index.html#search-input) |
| **Snapshot** | 4 из 4 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узле**, страниц — **1 из 10**: courses-listing.

селектор адресует заглушку до гидрации, но отрисованное поле есть в той же снятой разметке соседним узлом: div.w-full > div.v-popper.v-popper--theme-dropdown > … > div.wrapper.wrapper--with-search с input[placeholder="Искать на Хабр Курсах"] и иконкой #search. Досъёмка не нужна — на R3-08 селектор переписывается на отрисованное поле

**Правило.** Используйте для поиска по всему сервису — одно поле в шапке на страницу, плейсхолдер «Искать на Хабр Курсах».

## Когда не использовать

- Для поля формы с конкретным значением — `TextInput` или `Select`.

## Как работает

В SSR приходит заглушка `courses-filter-search-top-panel-placeholder`, отрисованное поле лежит соседним узлом. На `phone:` поле сжимается до кнопки 40 (`phone:w-10`).

## Управление клавиатурой

Узел записи — заглушка SSR с `aria-hidden` и в фокус не попадает. Фокусируется соседнее отрисованное поле: это `TextInput` шапки, нативный `input type=text` — фокус по Tab, рамка обёртки `focus-within:border-ui-black-850`.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div aria-hidden="true" class="courses-filter-search-top-panel-placeholder mx-5 flex h-10 min-w-0 items-center gap-2 phone:mx-0"><div class="h-10 w-[108px] shrink-0 rounded-xl bg-ui-black-850 phone:w-10"></div><div class="h-10 min-w-0 flex-1 rounded-xl bg-ui-white"></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **15**
- селектор переписи: `.courses-filter-search-top-panel-placeholder`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > header[0] > div[0] > div[0] > div[1] > div[0]`), коробка в снимке **0×0** — узел в момент съёмки не был разложен (скрытый или свёрнутый предок), объявленные размеры — **? × 40px**:

| свойство | значение |
|---|---|
| `flex-direction` | `row` |
| `height` | `40px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `gap` | `8px` |
| `position` | `static` |
| `overflow` | `visible` |
| `text-align` | `left` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-08 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-08 |
| `disabled` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-08 |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:w-10`, `phone:mx-0`. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `15074:258344` (02_Education-NEW, узел 15074:258344) — механика поиска и саджест

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._


## Исправление v0.2 · живой пример

В viewer показан настоящий `input[type="search"]` с плейсхолдером «Искать на Хабр Курсах» и SVG-иконкой `#search`. SSR-заглушка `.courses-filter-search-top-panel-placeholder` сохранена в архиве v0.1 как свидетельство загрузочного состояния, но больше не используется как пример самого компонента.


## Дополнение v0.2 · общее семейство полей

Компонент использует общую оболочку полей Courses: radius 12 px, gap 4 px, SVG-иконки 24×24, текст 16/22 regular и состояния `default`, `hover`, `focus-visible`, `disabled`, `invalid`. Подтверждены размеры `M` 40 px с горизонтальными отступами 12 px и `XL / SearchForm` 56 px с отступом 16 px слева и 12 px справа. Состояния взяты из `education-lib`, canvas node `670:8259`; XL — из живого SearchForm, node `15074:233173`.
