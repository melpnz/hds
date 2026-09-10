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

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R4-08. Всё, что стоит выше, — измерено.

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

## Ограничения

- **Не снятые состояния.** `empty` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R4-08 волны R4.

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
