# CardGrid

| | |
|---|---|
| **Категория** | Раскладка (`layout`) |
| **Корневой класс** | `grid` · `grid-cols-4` · `gap-3` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-card-grid`](../../showcase/components.html#c-card-grid) |
| **Snapshot** | 1 из 2 состояний снято |

## Когда использовать

Компонент стоит в продукте на **8 узлах**, страниц — **6 из 10**: authors, courses-listing, editors, education-centers-listing, promocodes, schools-for-children.

4 колонки по 260 с gap 12 → tablet-only 3 → phone 1. Три варианта хвоста в снятой разметке: phone:grid-cols-[minmax(0,1fr)] tablet-only:grid-cols-3 (4 узла), phone:grid-cols-1 tablet-only:grid-cols-2 (2), phone:grid-cols-1 tablet-only:grid-cols-3 (2)

**Правило.** Используйте для сетки однотипных карточек в секции, когда видны все: 4 колонки на десктопе, 3 (иногда 2) на `tablet-only:`, 1 на `phone:`. В продукте 8 узлов на 6 страницах.

## Когда не использовать

- Когда карточки листают — `Carousel`.

## Как работает

`div.grid` из колонок по 260 с промежутком 12. Хвост адаптива встречается в трёх вариантах (notes реестра).

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. На один экземпляр по Tab проходят: ничего — у 2 из 8; 20 кнопок и 20 ссылок — у 2 из 8; 72 ссылки — у 1 из 8; у остальных 3 — другой состав. По корпусу (284 узла): `Link` — 176, `Button` — 108.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="grid grid-cols-4 gap-3 phone:grid-cols-1 tablet-only:grid-cols-2"><div class="flex flex-col gap-1 rounded-3xl border border-solid border-ui-black-100 p-6"><div class="font-semibold">Подготовка страницы</div><div class="text-small"> Редакция Хабра отправляет материалы на&nbsp;проверку экспертам, которые работают в&nbsp;нужной профессии. </div></div><div class="flex flex-col gap-1 rounded-3xl border border-solid border-ui-black-100 p-6"><div class="font-semibold">Экспертная оценка</div><div class="text-small"> Эксперты смотрят материал, предлагают изменения или исправления&nbsp;— если они нужны. </div></div><div class="flex flex-col gap-1 rounded-3xl border border-solid border-ui-black-100 p-6"><div class="font-semibold">Обновление контента</div><div class="text-small"> Редакция Хабра вносит изменения по&nbsp;комментариям от&nbsp;экспертов. </div></div><div class="flex flex-col gap-1 rounded-3xl border border-solid border-ui-black-100 p-6"><div class="font-semibold">Публикация</div><div class="text-small"> Согласовываем контент после внесения правок и&nbsp;публикуем на&nbsp;сайте. </div></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `authors`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **12**
- классов в поддереве: **15**
- селектор переписи: `div.grid.grid-cols-4.gap-3`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/authors/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > section[0] > section[1] > div[1]`), коробка **1076×154.8**:

| свойство | значение |
|---|---|
| `display` | `grid` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `154.797px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `gap` | `12px` |
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
| `empty` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |

## Responsive

Классы с префиксом ширины в поддереве записи: `tablet-only:grid-cols-3`, `phone:grid-cols-1`, `phone:grid-cols-[minmax(0,1fr)]`, `tablet-only:grid-cols-2`. Условия префиксов: `phone:` — до 767, `tablet-only:` — 768–1023 (`docs/guide/layout.md`).

## Ограничения

- **Не снятые состояния.** `empty` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

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
