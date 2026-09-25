# FilterChip

> Историческая запись `Tab · Menu / Switch` объединена с `FilterChip`.
> Канонические варианты кита — Basic, Menu и Switch.

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `h-9` · `rounded-full` · `border` · `border-ui-black-100` · `bg-ui-white` · `px-3` · `py-2` · `text-small` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#filter-chip`](../../../viewer/index.html#filter-chip) |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **107 узлах**, страниц — **5 из 10**: education-center, education-centers-listing, promocodes, reviews, schools-for-children.

прод: default bg #fff border #e9e9ea text #2c2e34, selected bg #2c2e34 text #fff, h36 px12 py8 radius 9999. Выбранный — всегда «Все» (5/5), невыбранные — названия категорий: это ряд категорий, а не фильтры. С макетом совпадает полностью, если сравнивать с его вариантом `tab categories` (tab-panel / 2-lvl, выбранный тёмный). Прежняя запись о конфликте цвета («Figma описывает синее выбранное состояние») сравнивала прод с другим вариантом — фильтром-выпадашкой `tab` + elements/tab/filter/*, которого в снятом продукте нет. Разобрано 11 сентября 2026, см. resolvedComponentKeyCollisions и раздел «Расхождения источников» витрины. Переменные --color-chip-inactive / --color-chip-press синего варианта помечены NO MARKUP — с этим сходится.

**Правило.** Используйте для выбора категории, которая сужает выдачу на месте: ряд из «Все» и направлений. В продукте 112 чипов в пяти рядах `FilterBar` секций «Популярные курсы»: 107 невыбранных и 5 выбранных «Все». Селектор переписи держится за `bg-ui-white` и ловит только невыбранные — отсюда 107 в счётчиках записи.

## Когда не использовать

- Для взаимоисключающего выбора внутри группы — `ButtonGroup`.
- Для статичной метки — `Chip`.
- Для нескольких значений одновременно — в ряду выбран всегда один.

## Как работает

`<button>`-пилюля. Выбранный — `bg-ui-black-850 text-ui-white`, один на ряд: во всех пяти рядах это «Все».

## Управление клавиатурой

Корень — `<button>`: фокус по Tab, действие — Enter или Space. Своего кольца фокуса нет, но нет и сброса: работает фокус браузера.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

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
| `pressed` | принято владельцем | Единое имя выбранного состояния семейства FilterChip; прежнее `selected` больше не используется. |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Нейминг.** В review-квизе 18 сентября 2026 `selected` переименован в `pressed` у Basic, Menu и Switch.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

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


## Уточнение v0.2 · семейство Filter Chip

Этот компонент — базовый `FilterChip`. Расширенные варианты `FilterChipMenu` и `FilterChipSwitch` документированы на историческом адресе [`tab`](../navigation/tab.md); в viewer все записи собраны в одной группе `Filter Chips`. Старые id сохранены для совместимости.
