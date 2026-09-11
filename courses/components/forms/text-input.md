# TextInput

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `bg-ui-white` · `border` · `border-ui-black-100` · `px-3` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-text-input`](../../showcase/components.html#c-text-input) |
| **Snapshot** | 1 из 6 состояний снято |

## Когда использовать

Компонент стоит в продукте на **29 узлах**, страниц — **6 из 10**: courses-listing, education-centers-listing, promocodes, rating, reviews, schools-for-children.

Поле ввода. Макетный компонент elements/input/* в продукте есть — 29 полей на 6 страницах: поиск в шапке и поля формы поиска («Что изучить?», «Организация», «Тип» и др.). С макетом совпадает фон, рамка #e9e9ea, радиус 12, отступ 12, цвет плейсхолдера #909194; расходится размер плейсхолдера — в макете 16/22 (к тому же вписан числом, а не переменной), в продукте 14/20 (text-small). Пересекается с записями search-input (поле в шапке, 1 из 29) и search-form (поля формы, 28 из 29) — те описывают место, эта — само поле.

**Правило.** Используйте для однострочного ввода. В продукте поле встречается в двух ролях: триггер `Select` в форме поиска (28) и поле поиска в шапке (1) — 29 узлов на 6 страницах.

## Когда не использовать

- Для выбора из заданного списка — `Select`: поле тогда только его триггер.

## Как работает

Обёртка `span` с рамкой и `input` без собственной обводки. Фокус показывает рамка обёртки `focus-within:border-ui-black-850`. Высота 38 в шапке и 54 в форме поиска.

## Управление клавиатурой

Элемент не интерактивен: корень `<span>` без ссылки и кнопки внутри, в порядке табуляции не участвует.

## Анимация

Классов перехода и анимации в разметке нет: наведение и другие состояния сменяются мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[38px]" data-allow-mismatch="" placeholder="Искать на Хабр Курсах"><!----></span>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **1**
- классов в поддереве: **23**
- селектор переписи: `span.bg-ui-white.border.border-ui-black-100.px-3:has(> input)`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > header[0] > div[0] > div[0] > div[1] > div[1] > div[1] > div[0] > div[0] > div[0] > div[0] > div[0] > span[0]`), коробка **536×40**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `536px` |
| `height` | `40px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `12px` |
| `padding` | `0px 12px` |
| `gap` | `normal 4px` |
| `position` | `static` |
| `overflow` | `visible` |
| `text-align` | `left` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `focus-visible` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `disabled` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `readOnly` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `invalid` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Не снятые состояния.** `hover`, `focus-visible`, `disabled`, `readOnly`, `invalid` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `elements/input/*` (education-lib, componentKey 18357b74) — elements/input/*: fill #fff, border #e9e9ea, radius 12, padding 12/8, placeholder #909194, icon #a6a7a9; `select_level3 / select (Search Bar в шапке)` (02_Education-NEW, узел I15089:302657;15065:243728) — поле поиска в шапке страницы «Нулевая выдача»: белый, рамка #e9e9ea, радиус 12, падинг 12/8, плейсхолдер 16/22 #909194, лупа 24×24 справа

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
