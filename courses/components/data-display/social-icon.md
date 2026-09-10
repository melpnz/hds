# SocialIcon

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `block` · `rounded-full` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-social-icon`](../../showcase/components.html#c-social-icon) |
| **Snapshot** | 3 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **60 узлах**, страниц — **10 из 10**: author, authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

6 значков: vk, twitter, telegram, telegram-bot, facebook, instagram; instagram — градиентная заливка класса .instagram-gradient. Строка figmaEvidence «Logo brand/* в education-lib, токены logo/*» убрана: она не адресовала ни узла, ни ключа, и вдобавок называла не тот файл — семейство Logo brand/* лежит в библиотеках «Логотипы брендов» и «UI kit», а не в education-lib (поиск по библиотекам, 2026-09-08). Сопоставить значки конкретным компонентам — на R2-02

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R2-02. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<a class="block rounded-full hover:opacity-80" href="https://twitter.com/habr_career" title="Мы в Twitter"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#twitter"></use></svg></a>
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **4**
- селектор переписи: `footer a.block.rounded-full`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > footer[1] > div[0] > div[0] > div[4] > ul[0] > li[0] > a[0]`), коробка **24×24**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `24px` |
| `height` | `24px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(52, 110, 244)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `9999px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R2-02 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R2-02 |

## Ограничения

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R2-02 волны R2.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin) · [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** [{"story":"icons-socialicon--all-variants","file":null,"renders":true,"note":null}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
