# Chip

> `Badge`, `MetaPill`, `CounterPill` и `SpecializationTag` больше не являются
> отдельными компонентами. Это контекстные варианты публичного `Chip` из
> Courses Nuxt Kit: соответственно `tone="orange"`, `tone="surface"`,
> `variant="counter"` и семантическая комбинация тонов страницы профессии.

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `bg-ui-black-50` · `flex` · `items-center` · `px-2` · `py-1` · `rounded-full` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#chip`](../../../viewer/index.html#chip) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **239 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

нейтральный pill: bg #f1f1f1, px 8, py 4, radius 9999. Две роли в одном ряду — метка и счётчик переполнения «+N»; отличает их только max-w-[calc(100%-48px)] на метках, резерв под счётчик (см. productionEvidence[].note). Единственная запись реестра, чьё число зависит от ширины снимка: 239 на dom.html (1440), 249 на dom-768, 330 на dom-375 — остальные 43 дают одно и то же на всех трёх. Причина измерена: рядов всегда 96, а сколько меток показать до счётчика, решает раскладка — меток 143 / 155 / 238 на 1440 / 768 / 375, счётчиков 96 / 94 / 92, рядов, уместившихся целиком и оставшихся без счётчика, — 0 / 2 / 4. Число реестра снято на dom.html, то есть на 1440. GAP: одна это форма дизайн-системы или две, по макету не установлено — запись ссылается на tag/text/* по componentKey без nodeId, узел библиотеки не открывается. Решается на R2-06.

**Правило.** Используйте для нейтральной метки темы в карточке курса — навыка или направления («Python», «Git»). В продукте 239 узлов, все внутри `CourseCard`, до четырёх в ряд; последняя метка ряда — счётчик переполнения («+18»): на 1440 так во всех 96 рядах.

## Когда не использовать

- Для выбора — это `FilterChip`, кнопка.
- Для скидки — `tone="orange" size="s"`.
- Для длительности на обложке — `tone="surface"`.

## Как работает

Статичный `div`-пилюля: фон `#f1f1f1`, падинг 8 / 4. Метки ряда держат `max-w-[calc(100%_-48px)]` — резерв под счётчик «+N».

## Управление клавиатурой

Элемент не интерактивен: ни корень `<div>`, ни что-либо внутри в порядок табуляции не входит — ссылок, кнопок, полей и `tabindex` нет ни в одном из 239 экземпляров.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1 max-w-[calc(100%_-48px)]"><div class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">1С разработка</div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **1**
- классов в поддереве: **12**
- селектор переписи: `div.bg-ui-black-50.flex.items-center.px-2.py-1.rounded-full`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > div[1] > div[0] > div[0] > div[2] > div[1] > div[2] > div[0]`), коробка **100.7×24**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `100.703px` |
| `height` | `24px` |
| `background-color` | `rgb(241, 241, 241)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `12px` |
| `font-weight` | `400` |
| `line-height` | `16px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `9999px` |
| `padding` | `4px 8px` |
| `gap` | `2px` |
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

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `tag/text/*` (education-lib, componentKey e636266b) — tag/text/*: fill #f1f1f1, text #2c2e34, padding 4/4, border_radius 200

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
