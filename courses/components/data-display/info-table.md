# InfoTable

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `grid` · `grid-cols-2` · `gap-x-4` · `gap-y-3` · `text-small` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-info-table`](../../showcase/components.html#c-info-table) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узлах**, страниц — **1 из 10**: education-center.

«Общая информация»: пары «лейбл → значение» (лицензия, телефоны, офис). Наблюдение на одной странице

**Правило.** Пары «лейбл → значение» в блоке «Общая информация» школы: лицензия, телефоны, офис. В продукте 1 узел — наблюдение на одной странице, не правило.

## Когда не использовать

- Для сравнительных таблиц — `RatingTable`.

## Как работает

`div.grid` в две колонки, на `phone:` — одна (`phone:grid-cols-1`); значения-ссылки подсвечиваются `hover:text-ui-blue-600`.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. По Tab проходят: 1 ссылка. По корпусу (1 узел): `Link` — 1.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-small phone:grid-cols-1"><div class="flex flex-col gap-1"><span class="font-semibold">Лицензия</span><span>№ Л035‑01298‑77/00185314</span></div><div class="flex flex-col gap-1"><span class="font-semibold">Телефоны</span><span>8 800 700-93-29</span></div><div class="flex flex-col gap-1"><span class="font-semibold">Головной офис</span><span>119021, Россия, г. Москва, ул. Тимура Фрунзе, д. 11, корпус 2</span></div><div class="flex flex-col gap-1"><span class="font-semibold">Официальный сайт</span><a class="text-ui-blue-500 hover:text-ui-blue-600 hover:no-underline" href="https://practicum.yandex.ru">https://practicum.yandex.ru</a></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-center`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **12**
- классов в поддереве: **14**
- селектор переписи: `div.grid.grid-cols-2.gap-x-4.gap-y-3.text-small`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-center/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > section[6] > div[1]`), коробка **1076×100**:

| свойство | значение |
|---|---|
| `display` | `grid` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `100px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `14px` |
| `font-weight` | `400` |
| `line-height` | `20px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `gap` | `12px 16px` |
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

Классы с префиксом ширины в поддереве записи: `phone:grid-cols-1`. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum)

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
