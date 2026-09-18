# Button · BaseButton

| | |
|---|---|
| **Категория** | Действия (`actions`) |
| **Корневой класс** | `inline-flex` · `rounded-xl` · `font-semibold` · `inline-flex` · `rounded-xl` · `font-semibold` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#button`](../../../viewer/index.html#button) |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **191 узлах**, страниц — **9 из 10**: authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

снятая матрица: M h40 px16 py8 text-small (166 вхождений), L h48 px16 py8 text-default (17), XL h56 px24 py12 text-default (5). Тона: main bg #2c2e34 white, secondary bg #f1f1f1 #2c2e34. Радиус 12, border того же цвета, что и фон. Рендерится и как button, и как a. Сравнение L и XL с одинаковым текстом подтвердило: шрифт и line-height совпадают, различается только канонический горизонтальный padding — 16 px у L и 24 px у XL. Витрина следует production-геометрии.

**Правило.** Используйте для действия с подписью: перехода к подробностям в карточке («Далее» ×96 в `CourseCard`, «Подробнее» ×48 в `SchoolCard`, «Открыть код» ×16 и «Посмотреть» ×4 в `PromoCard`), отправки формы поиска («Найти организации») и перехода ко всему разделу в конце секции («Перейти ко всем курсам»). В продукте 191 узел на 9 страницах.

## Когда не использовать

- Для перехода внутри текста или списка ссылок — это `Link`.
- Без подписи — для стрелок карусели есть `IconButton`.
- Для выбора из набора — `FilterChip` или `SegmentedControl`.

## Как работает

Рендерится двумя тегами: `<button>` (172) и `<a href>` (19 — переходы к разделу). 11 ссылок открываются в новой вкладке. У 144 `<button>` стоит `rel="nofollow noreferrer"` — на кнопке атрибут ничего не делает. Размер M/L/XL и тон main/secondary — утилиты на корне.

## Управление клавиатурой

Корень — ссылка `<a href>` (19 из 191): фокус по Tab, переход — Enter. Корень — `<button>` (172 из 191): фокус по Tab, действие — Enter или Space. Кольцо фокуса — `focus-visible:outline` цветом `outline-ui-black-400`; обводка по клику погашена `focus:outline-none`. 11 из 191 открываются в новой вкладке (`target="_blank"`).

## Анимация

Переходы вычислены по страницам, отрисованным с CSS корпуса на 1440:

- `opacity, transform` за 0,18 с и 0,22 с, кривая `ease, cubic-bezier(0.2, 0.8, 0.2, 1)`: `svg.svg-icon.header-catalog__icon-item.text-ui-white` — 2 узла, у 1 экземпляра из 191.

Остальные узлы переходов не объявляют: наведение на них сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<a href="#experts-authors" target="_self" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white"><!--[--> Посмотреть экспертов <!--]--></a>
```

## Анатомия

Дерево из снятого `dom.html` страницы `authors`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **24**
- селектор переписи: `button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/authors/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0] > div[0] > div[0] > div[2] > a[0]`), коробка **196.23×40**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `196.234px` |
| `height` | `40px` |
| `background-color` | `rgb(44, 46, 52)` |
| `color` | `rgb(255, 255, 255)` |
| `font-size` | `14px` |
| `font-weight` | `600` |
| `line-height` | `20px` |
| `border` | `1px solid rgb(44, 46, 52)` |
| `border-radius` | `12px` |
| `padding` | `8px 16px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-01 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-01 |
| `pressed` | принято владельцем | Использует те же стили, что `hover`; при появлении отдельного production-варианта контракт можно уточнить. |
| `disabled` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-01 |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:-mr-2`, `phone:hidden`. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Pressed.** По решению review-квиза от 18 сентября 2026 визуально совпадает с `hover` и доступен в playground.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `button/M/main` (education-lib, componentKey ce9e337b) — button/M/main; в библиотеке разложен на 15 component set по осям размер×тон

**Storybook.** [{"story":"common-basebutton--primary-button","file":null,"renders":false,"note":"[nuxt] instance unavailable — разметки нет"}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
