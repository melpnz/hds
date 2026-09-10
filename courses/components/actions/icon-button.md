# IconButton

| | |
|---|---|
| **Категория** | Действия (`actions`) |
| **Корневой класс** | `swiper-button-shadow` · `h-9` · `w-9` · `rounded-full` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-icon-button`](../../showcase/components.html#c-icon-button) |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **32 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

три варианта: стрелка карусели 36×36 bg #fff border #e9e9ea; синяя 36×36 bg-ui-blue-50 border-ui-blue-300; закрытие рекламы 24×24 bg #fff opacity .7. Наблюдение по макету, снятое инвентаризацией без адреса узла: elements/button/icon — fill #fff, border #e9e9ea, icon #a6a7a9, padding 6, border_radius 200. Строка figmaEvidence убрана (ни nodeId, ни componentKey — не evidence по METHOD §3); узел ищется на R2-05

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R3-02. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<button class="swiper-button-shadow z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-ui-black-100 bg-ui-white text-ui-black-400 hover:text-ui-black-850 absolute -left-4 top-[calc(50%_-_20px)]"><svg class="svg-icon rotate-90" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-large"></use></svg></button>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **19**
- селектор переписи: `button.swiper-button-shadow.h-9.w-9.rounded-full`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[0] > div[0] > button[1]`), коробка **36×36**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `36px` |
| `height` | `36px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(166, 167, 169)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `18.4px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `9999px` |
| `padding` | `1px 6px` |
| `position` | `absolute` |
| `overflow` | `visible` |
| `text-align` | `center` |
| `box-shadow` | `rgba(0, 0, 0, 0.05) 0px 4px 6px -1px, rgba(0, 0, 0, 0.05) 2px 4px 2px 0px` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-02 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-02 |
| `pressed` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `disabled` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-02 |

## Ограничения

- **Не снятые состояния.** `pressed` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-02 волны R3.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `courses-listing.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
