# Avatar

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `rounded-full` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-avatar`](../../showcase/components.html#c-avatar) |
| **Snapshot** | 2 из 2 состояний снято |

## Когда использовать

Компонент стоит в продукте на **54 узлах**, страниц — **6 из 10**: author, authors, courses-listing, editors, education-center, reviews.

аватар человека КРУГЛЫЙ (rounded-full) — опровергает §11 исследования, где утверждается, что в Курсах все аватары квадратные. Размер задаётся локальной --avatar-size (68 в карточке эксперта, 100 в шапке профиля). Поверх — бейдж организации 28×28 rounded-[8px] или 40×40 rounded-[14px] с белой рамкой 2px

**Правило.** Используйте для фото человека — эксперта, редактора, автора отзыва. В продукте 54 узла на 6 страницах: в `PersonCard` (30), `ReviewCard` (20) и шапке профиля. Аватар всегда круглый.

## Когда не использовать

- Для организаций — логотип школы это `EntityLogo`: скругление 12 и белая рамка.
- Как ссылку сам по себе: кликабельна карточка или шапка вокруг него.

## Как работает

`<img>` с размером через переменную `--avatar-size`. Если фото нет, продукт подставляет заглушку `user_avatar_2.svg` — это состояние `empty`.

## Управление клавиатурой

Элемент не интерактивен: ни корень `<img>`, ни что-либо внутри в порядок табуляции не входит — ссылок, кнопок, полей и `tabindex` нет ни в одном из 54 экземпляров.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<img src="https://habrastorage.org/getpro/courses/8fc/9b4/f93/8fc9b4f930dd9f9a7681acbdc1c2e919.png" alt="" style="--avatar-size:100px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain">
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **6**
- селектор переписи: `img.rounded-full[class*='--avatar-size']`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0] > div[0] > img[0]`), коробка **100×100**:

| свойство | значение |
|---|---|
| `display` | `inline` |
| `flex-direction` | `row` |
| `width` | `100px` |
| `height` | `100px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px none rgb(255, 255, 255)` |
| `border-radius` | `9999px` |
| `position` | `static` |
| `overflow` | `hidden` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `empty` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R2-04 |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Заглушки содержимого.** 1 ссылка на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin) · [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [reviews](https://career.habr.com/education_centers/otzyvy)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `avatar/user` (education-lib, componentKey 02b81a65) — avatar/user, 305 инстансов

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
