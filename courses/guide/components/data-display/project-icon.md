# ProjectIcon

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `inline-flex` · `h-6` · `w-6` · `rounded-md` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#project-icon`](../../../viewer/index.html#project-icon) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **80 узлах**, страниц — **10 из 10**: author, authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

4 варианта: habr #629fbc, qna #434b60, career #6274bc, courses #346ef4. Переменной --color-courses в CSS нет — цвет берётся из --color-ui-blue-500

**Правило.** Используйте как метку проекта Хабра рядом с его названием — Хабр, Q&A, Карьера, Курсы. В продукте 80 узлов: 40 в панели «Все сервисы Хабра» шапки и 40 в колонке сервисов подвала.

## Когда не использовать

- Как самостоятельную ссылку: переход несёт соседняя ссылка — в панели сервисов метка лежит внутри неё, в подвале стоит рядом с ней в одном `li`.
- Для сервисов вне Хабра — это `SocialIcon`.

## Как работает

`<span>` 24×24 со скруглением 6 и цветной подложкой. Глиф один на все четыре проекта, различается только цвет подложки. Он задан inline-стилем `style="background-color:#629FBC"` и ещё тремя такими же; значения совпадают с переменными `--color-habr`, `--color-qna`, `--color-career`, `--color-ui-blue-500`, но разметка на них не ссылается.

## Управление клавиатурой

Элемент не интерактивен: ни корень `<span>`, ни что-либо внутри в порядок табуляции не входит — ссылок, кнопок, полей и `tabindex` нет ни в одном из 80 экземпляров.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#629FBC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span>
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **5**
- селектор переписи: `span.align-center.inline-flex.h-6.w-6.rounded-md`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > header[0] > div[0] > div[0] > div[0] > div[3] > div[1] > div[0] > a[0] > span[0]`), коробка в снимке **0×0** — узел в момент съёмки не был разложен (скрытый или свёрнутый предок), объявленные размеры — **24px × 24px**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `24px` |
| `height` | `24px` |
| `background-color` | `rgb(98, 159, 188)` |
| `color` | `rgb(52, 110, 244)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `16px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `6px` |
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

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin) · [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** [{"story":"icons-projecticon--all-variants","file":null,"renders":true,"note":null}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
