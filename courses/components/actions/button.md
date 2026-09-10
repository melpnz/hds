# Button · BaseButton

| | |
|---|---|
| **Категория** | Действия (`actions`) |
| **Корневой класс** | `inline-flex` · `rounded-xl` · `font-semibold` · `inline-flex` · `rounded-xl` · `font-semibold` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-button`](../../showcase/components.html#c-button) |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **191 узлах**, страниц — **9 из 10**: authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

снятая матрица: M h40 px16 py8 text-small (166 вхождений), L h48 px16 py8 text-default (17), XL h56 px24 py12 text-default (5). Тона: main bg #2c2e34 white, secondary bg #f1f1f1 #2c2e34. Радиус 12, border того же цвета, что и фон. Рендерится и как button, и как a. Figma даёт elements/button/L padding 20/12 и XL 24/16 — расходится с продом (16/8 и 24/12): сверить на шаге

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R3-01. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<a href="#experts-authors" target="_self" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white"><!--[--> Посмотреть экспертов <!--]--></a>
```

## Анатомия

Дерево из снятого `dom.html` страницы `authors`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **24**
- селектор переписи: `button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/authors/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0] > div[0] > div[0] > div[2] > a[0]`), коробка **196.23×40**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `196.234px` |
| `height` | `40px` |
| `background-color` | `rgb(44, 46, 52)` |
| `color` | `rgb(255, 255, 255)` |
| `font-size` | `14px` |
| `font-weight` | `600` |
| `line-height` | `20px` |
| `border` | `1px solid rgb(44, 46, 52)` |
| `border-radius` | `12px` |
| `padding` | `8px 16px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-01 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-01 |
| `pressed` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `disabled` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-01 |

## Ограничения

- **Не снятые состояния.** `pressed` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-01 волны R3.

## Источники

**Production.** [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `button/M/main` (education-lib, componentKey ce9e337b) — button/M/main; в библиотеке разложен на 15 component set по осям размер×тон

**Storybook.** [{"story":"common-basebutton--primary-button","file":null,"renders":false,"note":"[nuxt] instance unavailable — разметки нет"}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
