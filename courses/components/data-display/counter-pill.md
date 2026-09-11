# CounterPill

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `bg-ui-black-50` · `rounded-full` · `text-micro` · `text-ui-black-500` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-counter-pill`](../../showcase/components.html#c-counter-pill) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **28 узлах**, страниц — **2 из 10**: education-centers-listing, reviews.

хвост стопки аватаров: «+18070». Высота 24, белая рамка 1px, px 8

**Правило.** Используйте как хвост стопки аватаров — число людей сверх показанных («+18070»). В продукте 28 узлов, все внутри `AvatarStack` в `SchoolCard`.

## Когда не использовать

- Как самостоятельный счётчик вне `AvatarStack`.
- Для переполнения меток в карточке курса продукт берёт `Chip` «+N».

## Как работает

`div` высотой 24 с белой рамкой 1px и падингом 8 по бокам; не кликабелен.

## Управление клавиатурой

Элемент не интерактивен: корень `<div>` без ссылки и кнопки внутри, в порядке табуляции не участвует.

## Анимация

Классов перехода и анимации в разметке нет: наведение и другие состояния сменяются мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="flex h-[24px] items-center rounded-full border border-solid border-ui-white bg-ui-black-50 px-2 text-micro text-ui-black-500"> +18070</div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **11**
- селектор переписи: `div.bg-ui-black-50.rounded-full.text-micro.text-ui-black-500`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-centers-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > div[1] > div[0] > div[0] > div[1] > div[3] > div[3]`), коробка **59.77×24**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `59.7656px` |
| `height` | `24px` |
| `background-color` | `rgb(241, 241, 241)` |
| `color` | `rgb(144, 145, 148)` |
| `font-size` | `12px` |
| `font-weight` | `400` |
| `line-height` | `16px` |
| `border` | `1px solid rgb(255, 255, 255)` |
| `border-radius` | `9999px` |
| `padding` | `0px 8px` |
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

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

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
