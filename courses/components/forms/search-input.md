# SearchInput

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `courses-filter-search-top-panel-placeholder` |
| **CSS** | `ui/components/forms.css` + утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-search-input`](../../showcase/components.html#c-search-input) |
| **Snapshot** | 4 из 4 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узлах**, страниц — **1 из 10**: courses-listing.

селектор адресует заглушку до гидрации, но отрисованное поле есть в той же снятой разметке соседним узлом: div.w-full > div.v-popper.v-popper--theme-dropdown > … > div.wrapper.wrapper--with-search с input[placeholder="Искать на Хабр Курсах"] и иконкой #search. Досъёмка не нужна — на R3-08 селектор переписывается на отрисованное поле

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R3-08. Всё, что стоит выше, — измерено.

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

## Ограничения

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-08 волны R3.

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
