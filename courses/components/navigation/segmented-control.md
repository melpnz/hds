# SegmentedControl

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `bg-ui-black-transparent-120` · `rounded-xl` · `w-max` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-segmented-control`](../../showcase/components.html#c-segmented-control) |
| **Snapshot** | 4 из 4 состояний снято |

## Когда использовать

Компонент стоит в продукте на **4 узлах**, страниц — **4 из 10**: education-centers-listing, rating, reviews, schools-for-children.

переключатель «Взрослым / Детям» на цветном hero: контейнер bg rgba(0,0,0,.12) radius 12, активный сегмент bg #2c2e34, px 16, py 10. На узких растягивается на всю ширину

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R3-05. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="flex w-max rounded-xl bg-ui-black-transparent-120 text-small small-phone:w-full mx-auto mt-6"><!--[--><a aria-current="page" href="/education_centers" class="router-link-active router-link-exact-active rounded-xl px-4 py-2.5 text-ui-white hover:no-underline small-phone:w-full small-phone:text-center bg-ui-black-850">Взрослым</a><a href="/education_centers/shkoly-dlya-detej" class="rounded-xl px-4 py-2.5 text-ui-white hover:no-underline small-phone:w-full small-phone:text-center">Детям</a><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **16**
- селектор переписи: `div.bg-ui-black-transparent-120.rounded-xl.w-max`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-centers-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0] > div[0] > div[0] > div[1]`), коробка **178.89×40**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `178.891px` |
| `height` | `40px` |
| `background-color` | `rgba(0, 0, 0, 0.12)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `14px` |
| `font-weight` | `400` |
| `line-height` | `20px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `12px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-05 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-05 |
| `current` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-05 |

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `router-link-active`, `router-link-exact-active`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-05 волны R3.

## Источники

**Production.** [education-centers-listing](https://career.habr.com/education_centers) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `button group / onheader` (education-lib, componentKey a3b5486b) — button group / onheader: fill #0000001f, text #fff, radius 12

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
