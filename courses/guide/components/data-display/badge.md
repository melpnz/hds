# Badge

> Устаревшее отдельное имя. Используйте [`Chip`](chip.md) с
> `tone="orange" size="s"`.

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `bg-ui-orange-500` · `rounded-full` · `text-micro` · `text-ui-white` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#badge`](../../../viewer/index.html#badge) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **87 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

акцентный бейдж скидки: bg #ff7e47, px 6, py 2, text-micro 12/16 semibold. Подтверждает правило «оранжевый живёт только в бейдже»: 87 вхождений и ни одной крупной оранжевой плоскости

**Правило.** Используйте для скидки курса («−50%»). В продукте 87 узлов, по одному на карточку, все в `CourseCard`; это единственное место оранжевого в продукте.

## Когда не использовать

- Для нейтральных меток — `Chip`.
- Для оценки — `RatingBadge`.
- Оранжевый не переносите на крупные плоскости: в продукте их нет ни одной.

## Как работает

Статичный `div`: `bg-ui-orange-500`, белый текст `text-micro`, пилюля.

## Управление клавиатурой

Элемент не интерактивен: ни корень `<div>`, ни что-либо внутри в порядок табуляции не входит — ссылок, кнопок, полей и `tabindex` нет ни в одном из 87 экземпляров.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div data-test-id="course-discount" class="text-semibold flex items-center rounded-full bg-ui-orange-500 px-1.5 py-0.5 text-micro text-ui-white"> -50% </div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **9**
- селектор переписи: `div.bg-ui-orange-500.rounded-full.text-micro.text-ui-white`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > div[1] > div[0] > div[0] > div[2] > div[2] > div[0] > div[1]`), коробка **44×20**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `44px` |
| `height` | `20px` |
| `background-color` | `rgb(255, 126, 71)` |
| `color` | `rgb(255, 255, 255)` |
| `font-size` | `12px` |
| `font-weight` | `400` |
| `line-height` | `16px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `9999px` |
| `padding` | `2px 6px` |
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

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `text-semibold`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `tag/color/*` (education-lib, componentKey e962a95d) — tag/color/*: fill #ff7e47, text #fff, padding 2/2

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
