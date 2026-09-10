# MetaPill

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `bg-ui-white` · `rounded-3xl` · `px-2` · `py-1` · `text-micro` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-meta-pill`](../../showcase/components.html#c-meta-pill) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **96 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

белая плашка уровня и длительности на обложке карточки курса. От Chip отличается фоном и радиусом (rounded-3xl вместо rounded-full)

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R2-09. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="rounded-3xl bg-ui-white px-2 py-1 text-micro">18 мес</div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **5**
- селектор переписи: `div.bg-ui-white.rounded-3xl.px-2.py-1.text-micro`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > div[1] > div[0] > div[0] > div[2] > div[0] > div[1]`), коробка **54.78×24**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `54.7812px` |
| `height` | `24px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `12px` |
| `font-weight` | `400` |
| `line-height` | `16px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `24px` |
| `padding` | `4px 8px` |
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

## Ограничения

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R2-09 волны R2.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

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
