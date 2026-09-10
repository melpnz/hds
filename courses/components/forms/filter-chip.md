# FilterChip · BaseFilter

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `h-9` · `rounded-full` · `border` · `border-ui-black-100` · `bg-ui-white` · `px-3` · `py-2` · `text-small` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-filter-chip`](../../showcase/components.html#c-filter-chip) |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **107 узлах**, страниц — **5 из 10**: education-center, education-centers-listing, promocodes, reviews, schools-for-children.

прод: default bg #fff border #e9e9ea, selected bg #2c2e34 text #fff, h36 px12 py8 radius 9999. Figma и токены --color-chip-inactive #ebf3ff / --color-chip-press #b8d5ff описывают СИНЕЕ выбранное состояние, которого в снятом проде нет. Конфликт источников → завести GAP

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R3-04. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<button class="bg-ui-white border-ui-black-100 py-2 text-ui-black-850 relative z-10 flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full border border-solid px-3 text-small"><!--[-->HR и рекрутинг<!--]--></button>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-center`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **16**
- селектор переписи: `button.h-9.rounded-full.border.border-ui-black-100.bg-ui-white.px-3.py-2.text-small`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-center/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > section[2] > div[1] > div[0] > div[1] > button[0]`), коробка **131.63×36**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `131.625px` |
| `height` | `36px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `14px` |
| `font-weight` | `400` |
| `line-height` | `20px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `9999px` |
| `padding` | `8px 12px` |
| `position` | `relative` |
| `overflow` | `visible` |
| `text-align` | `center` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-04 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-04 |
| `pressed` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `selected` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-04 |

## Ограничения

- **Не снятые состояния.** `pressed` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-04 волны R3.

## Источники

**Production.** [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `tab / tab-panel` (education-lib, componentKey 9668fb89) — tab / tab-panel; elements/tab/filter/*: fill_select #eff5ff, border_select #94bdfc, text_icon_select #346ef4

**Storybook.** [{"story":"common-basefilter--base-filter-story","file":null,"renders":true,"note":null}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
