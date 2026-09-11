# RubricationBar

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `rubrication-header` |
| **CSS** | `ui/components/navigation.css` + утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-rubrication-bar`](../../showcase/components.html#c-rubrication-bar) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узлах**, страниц — **1 из 10**: courses-listing.

полоса 40px с градиентом #346ef4 → #6bacfd, ряд ссылок text-micro белым, gap 16, padding 8/0/16, overflow-x auto. Есть только на /courses (1/10) — не сквозной элемент оболочки, как утверждает §9.2 исследования. Текст text-micro 12/16, а не 14/20

**Правило.** Полоса ссылок на рубрики под hero. В продукте — только на `/courses`, 1 из 10 страниц.

## Когда не использовать

- Как сквозную навигацию: вне `/courses` её нет.

## Как работает

`div` с градиентом и рядом ссылок `text-micro` белым. На `phone:` полоса выходит в край (`phone:-mx-6`) и прокручивается по горизонтали.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. По Tab проходят: 4 ссылки. По корпусу (4 узла): `Link` — 4.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="rubrication-header flex items-center gap-4 overflow-x-auto whitespace-nowrap pb-4 pt-2 text-micro text-ui-white phone:-mx-6 phone:gap-2 phone:px-6"><!--[--><a href="/courses/programmirovanie" class="shrink-0 text-ui-white hover:no-underline">Программирование</a><a href="/courses/analitika/neural-networks" class="shrink-0 text-ui-white hover:no-underline">Нейросети и AI</a><a href="/courses-dlya-detej" class="shrink-0 text-ui-white hover:no-underline">Курсы для детей</a><a href="/courses/besplatnye" class="shrink-0 text-ui-white hover:no-underline">Бесплатные курсы</a><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **4**
- классов в поддереве: **15**
- селектор переписи: `.rubrication-header`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > div[0]`), коробка **1076×40**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `40px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(255, 255, 255)` |
| `font-size` | `12px` |
| `font-weight` | `400` |
| `line-height` | `16px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `padding` | `8px 0px 16px` |
| `gap` | `16px` |
| `position` | `static` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:-mx-6`, `phone:gap-2`, `phone:px-6`. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses)

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
