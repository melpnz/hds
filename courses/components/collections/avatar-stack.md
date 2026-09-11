# AvatarStack

| | |
|---|---|
| **Категория** | Коллекции (`collections`) |
| **Корневой класс** | `flex` · `-space-x-1.5` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-avatar-stack`](../../showcase/components.html#c-avatar-stack) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **28 узлах**, страниц — **2 из 10**: education-centers-listing, reviews.

три аватара 24×24 rounded-full с белой рамкой 1px, перекрытие -6px, замыкает CounterPill

**Правило.** Используйте для стопки выпускников с хвостом-счётчиком в карточке школы. В продукте 28 узлов, все в `SchoolCard`: листинг организаций (20) и блок «Популярные онлайн-школы» на странице отзывов (8). На детской витрине карточки школ идут без стопки.

## Когда не использовать

- Для одного человека — `Avatar`.
- Для списка людей с подписями — `PersonCard`.

## Как работает

`div.flex.-space-x-1.5`: аватары с наложением и `CounterPill` в конце. Состав фиксирован — три аватара и счётчик.

## Управление клавиатурой

Элемент не интерактивен: ни корень `<div>`, ни что-либо внутри в порядок табуляции не входит — ссылок, кнопок, полей и `tabindex` нет ни в одном из 28 экземпляров.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="flex -space-x-1.5 mb-4"><!--[--><div class=""><img src="https://assets.habr.com/courses-web/courses-web/images/avatars/user_avatar_2.svg" class="block h-[24px] w-[24px] rounded-full border border-solid border-ui-white"></div><div class=""><img src="https://habrastorage.org/getpro/moikrug/uploads/user/100/097/340/2/avatar/medium_b51734be81ebe10c814e9f3ba4fd8c1b.jpeg" class="block h-[24px] w-[24px] rounded-full border border-solid border-ui-white"></div><div class=""><img src="https://assets.habr.com/courses-web/courses-web/images/avatars/user_avatar_2.svg" class="block h-[24px] w-[24px] rounded-full border border-solid border-ui-white"></div><!--]--><div class="flex h-[24px] items-center rounded-full border border-solid border-ui-white bg-ui-black-50 px-2 text-micro text-ui-black-500"> +18070</div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **7**
- классов в поддереве: **15**
- селектор переписи: `div.flex.-space-x-1\.5`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-centers-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > div[1] > div[0] > div[0] > div[1] > div[3]`), коробка **113.77×24**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `113.766px` |
| `height` | `24px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
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

- **Заглушки содержимого.** 1 ссылка на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [education-centers-listing](https://career.habr.com/education_centers) · [reviews](https://career.habr.com/education_centers/otzyvy)

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
