# Figma Parity Audit — полный проход по библиотеке

Дата: 2026-09-04. Figma: `habr-lib` (`XQ7dxSVvUt9mcx9ZZPqcxt`),
входная точка — канвас **Preview** (`853:1969`).
Production: живой habr.com (CDP) + локальный Storybook-корпус
(`_sources/habr/`: 19 CSS-файлов сборки, 73 отрисованных story).

Ценность этого документа — не в списке находок (они давно в коде), а в
**системных причинах** из §1: они объясняют целые классы багов и
продолжают работать как правила. Постоянная сверка с продом теперь
автоматическая — `check/parity.js`.

---

## 1. Системные причины

Это ответ на вопрос «почему точечные проверки не помогали».

### SYS-1 · Срезанный `data-v` расширяет КАЖДЫЙ селектор

Production — это Vue со scoped-стилями: `.arrow[data-v-f977e8aa]`,
`.author[data-v-a0c576a8]`, `.bookmarks-button[data-v-41bd4ade]`.
При извлечении атрибут снимается, и правило начинает действовать на всю
страницу.

Раньше это ловилось поштучно и только когда что-то ломалось: сначала
`.body` в `dropdown.css` (перехватывал `.body` диалога), потом `.head`.
Оба раза чинилось локально, причина как класс не разбиралась.

Сплошной проход по `ui/` даёт **109 таких селекторов в 9 файлах**:

| Файл | Протекающие селекторы |
|---|---|
| `article-card.css` | `.bookmarks-button` ×8, `.author` ×3, `.lead` ×3, `.cover` ×2, `.readmore` ×2, `.round-on-mobile` ×2, `.meta`, `.meta-container`, `.stats`, `.lead-image` |
| `hint.css` | `.arrow` ×5, `.arrow-top` ×5, `.arrow-left` ×5, `.arrow-right` ×5, `.arrow-bottom` ×3 |
| `checkbox.css` | `.input` ×7, `.indicator` ×3 |
| `dropdown.css` | `.menu-row` ×3 |
| `dialog.css` | `.wysiwyg-fade-*` ×4, `.cover-image` |
| `patterns.css` | `.stat-link` ×2, `.stats-container`, `.stat` |
| `primitives.css` | `.inline-separator` ×2 |

`.input` — не гипотетический риск: на живом habr.com поле поиска имеет
класс `input` (`.tm-input-text-decorated.input`), то есть наши
чекбоксовые правила `.input:checked + .indicator` встретили бы настоящий
production-класс.

**Проверено, что это именно scoped-правила:** `getMatchedStylesForNode`
на habr.com показал `[data-v-...]` у `.bookmarks-button` и `.author`.

### SYS-2 · Один hex сопоставлен не с тем токеном, и ошибка размножилась

`#929ca5` — это `--icon-primary` (`hsl(208,10%,61%)`), а `--icon-secondary`
это `#bcced7`. В трёх реконструированных файлах `#929ca5` был записан как
`≈--icon-secondary` — и в комментарии, и в коде. Разница видимая: нейтрально-
серый против голубовато-серого.

Ошибка не была бы поймана сверкой «CSS совпадает с CSS» — оба токена
существуют, оба валидны, компонент рендерится. Ловится только сверкой
hex-значения Figma с разрешённым значением токена.

### SYS-3 · Порядок загрузки чанков в Storybook и в production РАЗНЫЙ

`.tm-pagination__arrow{fill:var(--icon-primary)}` и
`.tm-svg-img{fill:currentColor}` имеют одинаковую специфичность — решает
порядок файлов. В Storybook `svg-img` грузится **шестым**, pagination —
**шестнадцатым**, побеждает pagination (серая стрелка). На живом habr.com
порядок обратный, побеждает `currentColor` (акцентная стрелка).

Практический вывод: **Storybook нельзя использовать как визуальный
эталон для каскадных вопросов.** Он верен по значениям и не верен по
приоритетам. Живой прод — единственный арбитр.

### SYS-4 · Figma систематически на один шаг «чище» production

Не разовое расхождение, а сдвиг: радиус 4 против 3, интерлиньяж 20
против 18/14.95, отступ 16 против 14, иконка 24 против 16. Так у кнопки,
пагинации, аватара. Похоже, библиотека собрана на общей токен-шкале
(`spacing/N = N×4` — подтверждено: `spacing/4`=16, `spacing/6`=24),
до которой реализация не доведена.

Это НЕ баг и не чинится: канон — production. Но каждый такой случай надо
классифицировать явно, иначе он каждый раз всплывает заново как «новое
расхождение».

---

## 2. Полный scope: 9 семейств, 44 элемента

Ни одного «просто не посмотрели».

| # | Component | Figma page | Варианты / состояния | Local | Production | Статус |
|---|---|---|---|---|---|---|
| 1 | button / Primary-fill | button | 5 состояний × 2 ширины + с крестиком | `.btn_solid` + `horizon` | 15/16 | **EXACT** (по проду) |
| 2 | button / Primary-line | button | 5 состояний | `.btn_transparent` | 15/16 | **EXACT** |
| 3 | button / Success-fill | button | 5 состояний | `+ christi` | 15/16 | **EXACT** |
| 4 | button / Success-line | button | 5 состояний | `.btn_transparent + christi` | 15/16 | **EXACT** |
| 5 | button / Danger | button | 5 состояний | `+ fuzzy-wuzzy-brown` | 15/16 | **EXACT** |
| 6 | button / Minor | button | 5 состояний | `+ desert-storm` | 15/16 | **MINOR_DIFF** (FP-14) |
| 7 | button / icon-button | button | 3 размера × 5 состояний | `.tm-icon-button` | нет | **MAJOR_DIFF → FIXED** (FP-11) |
| 8 | dropdown / Row | dropdown | 8 инстансов | `.dropdown-row` | нет | **MINOR_DIFF → FIXED** (FP-12, FP-13) |
| 9 | dropdown / dropdown-menu | dropdown | 23 инстанса | `.menu-row` | нет | MINOR_DIFF |
| 10 | dropdown / list | dropdown | 22 инстанса | `.dropdown-row` | нет | MINOR_DIFF |
| 11 | dropdown / dropdown-select | dropdown | 22 инстанса | — | нет | **MISSING_LOCAL** (отложено владельцем) |
| 12 | checkbox / Checkbox | checkbox/radiobutton | 9 инстансов | `.checkbox` | 1/16 | **MINOR_DIFF → FIXED** (FP-02) |
| 13 | checkbox / Radiobutton | checkbox/radiobutton | 6 инстансов | `.tm-radio` | GAP | RECONSTRUCTED, подтверждён |
| 14 | control-list / vertical | checkbox/radiobutton | 12 инстансов | — | нет | **FIGMA_ONLY** (раскладка, не компонент) |
| 15 | control-list / horizontal | checkbox/radiobutton | 12 инстансов | — | нет | **FIGMA_ONLY** |
| 16 | calendar / cell-date-time | calendar | 10 инстансов | `.tm-calendar-cell` | нет | RECONSTRUCTED |
| 17 | calendar / cell-arrow | calendar | 6 инстансов | `.tm-calendar-arrow` | нет | RECONSTRUCTED |
| 18 | calendar / date + time | calendar | сборка | — | нет | **DEFERRED** (запрет владельца) |
| 19 | calendar / date | calendar | сборка | — | нет | **DEFERRED** |
| 20 | calendar / time | calendar | сборка | — | нет | **DEFERRED** |
| 21 | pagination / page | pagination | 4 состояния | `.tm-pagination__page` | 11/16 | **EXACT** |
| 22 | pagination / page-arrow | pagination | 6 состояний | `.tm-pagination__arrow` | 11/16 | **FIXED** (SYS-3) |
| 23 | pagination / pagination | pagination | desktop + tablet/mobile | `.tm-pagination` | 11/16 | **FIXED → EXACT** (FP-04, FP-05) |
| 24 | tabs / tab | tabs | 3 размера × 6 состояний | `.tab-link` | 14/16 | **EXACT** (Large), RECONSTRUCTED (S/M) |
| 25 | tabs / tab-panel | tabs | 3 размера | `.tabs` | 14/16 | **FIXED** (прошлый проход) |
| 26 | chips / badge | chips | 2 | `.tm-badge` | есть | MINOR_DIFF |
| 27 | chips / base-chips hub | chips | 10 состояний | — | не найден | **FIGMA_ONLY** |
| 28 | chips / base-chips tag | chips | 10 состояний | — | не найден | **FIGMA_ONLY** |
| 29 | chips / article-labels v1 | chips | — | — | — | **FIGMA_STALE** |
| 30 | chips / article-labels v2 | chips | — | `.publication-type-label` | есть | MINOR_DIFF |
| 31 | chips / complexity-label v1 | chips | 3 | — | — | **FIGMA_STALE** |
| 32 | chips / complexity-label v2 | chips | 7 | `.tm-article-complexity` | есть | **EXACT** |
| 33 | chips / translation | chips | 3 | — | — | **DEFERRED** (taxonomy, запрет) |
| 34 | chips / isplanned | chips | 2 | — | — | **DEFERRED** |
| 35 | chips / istimed | chips | 2 | — | — | **DEFERRED** |
| 36 | chips / hub | chips | 6 | `.tm-publication-hub__link` | есть | **EXACT** |
| 37 | chips / tag | chips | 5 | `.tm-publication-hub__link` | есть | MINOR_DIFF |
| 38 | chips / common chips | chips | 2 | `.tm-chip` | нет | RECONSTRUCTED |
| 39 | chips / user-hubs | chips | 25 | — | есть | **DEFERRED** |
| 40 | chips / article-labels event | chips | 40 | — | — | **DEFERRED** (taxonomy) |
| 41 | textfields / Input | textfileds | 10 состояний | `.tm-input-text-decorated` | 5/16 | **MINOR_DIFF → FIXED** (FP-10) |
| 42 | textfields / Textarea | textfileds | 10 состояний | `.tm-textarea-reconstructed` | нет | RECONSTRUCTED, **FIXED** (FP-20) |
| 43 | textfields / select | textfileds | 74 инстанса | — | нет | **MISSING_LOCAL** (запрет владельца) |
| 44 | textfields / datepicker | textfileds | 10 | — | нет | **MISSING_LOCAL** (запрет) |
| 45 | textfields / timepicker | textfileds | 10 | — | нет | **MISSING_LOCAL** (запрет) |
| 46 | textfields / chips field | textfileds | 87 | — | нет | **FIGMA_STALE** (v1) |
| 47 | textfields / new chips field | textfileds | 161 | `.tm-chip` частично | нет | RECONSTRUCTED |
| 48 | textfields / new chips list | textfileds | 39 | — | нет | **DEFERRED** |
| 49 | image / avatar user | image | 7 размеров | `.tm-user-info__userpic` | есть | **MINOR_DIFF** (FP-19) |
| 50 | image / avatar company | image | 7 размеров | тот же | есть | MINOR_DIFF |
| 51 | image / avatar hub | image | 7 размеров | тот же | есть | MINOR_DIFF |

Плюс production-компоненты вне Figma-библиотеки, проверенные отдельно
живым замером: Popover (**EXACT**, дифф правило-к-правилу дал полное
совпадение), Dialog (**FIXED**, FP-06), Hints (**FIXED**, FP-07, FP-09),
Block (**EXACT**), Notice, Title, VotesMeter/VotesLever (**EXACT**),
RssButton (**EXACT**), ButtonFollow (**MINOR_DIFF**, FP-21),
SectionName, UserInfo (**EXACT**), ArticleCard (**FIXED**, FP-03).

---

## 3. Что было исправлено

Полные разборы каждого расхождения удалены: результат живёт в коде и
в спецификациях компонентов, а урок — в системных причинах выше.
Здесь остаётся след, чтобы по номеру можно было понять, о чём речь.

| # | Компонент | Что было не так | Причина | Как решено |
|---|---|---|---|---|
| FP-01 | BaseHint | `.arrow*` действует на всю страницу | SYS-1 | заскоупить под `.base-hint` |
| FP-02 | Checkbox | `.input` / `.indicator` действуют на всю страницу | SYS-1 | заскоупить под `.checkbox` |
| FP-03 | ArticleCard | ArticleCard: 23 голых селектора с очень общими именами | SYS-1 | заскоупить под `.article-snippet` |
| FP-04 | Pagination | Градиент-маска пагинации сделана через `transparent` | упрощение при извлечении — классическая ловушка CSS | вернуть production-значение дословно |
| FP-05 | — | Потеряно сглаживание шрифта в пагинации | вендорные префиксы отброшены при извлечении | вернуть |
| FP-06 | Dialog (мобильная шторка) | Диалог: потеряно оформление скроллбара шторки | псевдоэлементы `::-webkit-scrollbar*` пропущены при извлечении | вернуть дословно |
| FP-07 | — | ~~BaseHint: кнопка закрытия без стилей~~ — ЛОЖНОЕ СРАБАТЫВАНИЕ | — | — |
| FP-08 | — | `.modal-window`: выдуманное значение ширины по умолчанию | «удобный» дефолт добавлен для витрины | убрать фолбэк, ширину задавать в разметке; в спецификации описать явно |
| FP-09 | — | InformerHint: имя переменной и `position` | `:before` в production позиционируется относительно `.base-popover`; мы показываем информер без попапа | оставить `relative`, но записать расхождение и причину; имя переменной задокументировать рядом с production-именем |
| FP-10 | Input | Input: два выдуманных объявления на подписи | достройка «как логично» при извлечении | удалить два объявления |
| FP-11 | — | icon-button: неверный токен иконки и рамки | SYS-2 | `--icon-primary`; рамка — `hsl(from var(--icon-primary) h s l / 40%)` |
| FP-12 | — | dropdown-row: неверный токен иконки | SYS-2 | `--icon-primary` |
| FP-13 | — | dropdown-row выбранный: описание должно быть серым | — | `--other-disabled-elements` |
| FP-14 | — | Кнопка: Figma на шаг чище production | SYS-4 | не менять, зафиксировать |
| FP-15 | — | Кнопка: состояния focus и loading | — | не трогать; описать как FIGMA TARGET |
| FP-16 | — | Checkbox disabled: разное решение | — | не менять |
| FP-17 | — | Textarea: белый фон в disabled в тёмной теме | реконструкция унаследовала известный дефект production-инпута туда, где production-кода нет | `--background-secondary`; у Input оставить production-значение и оставить помету о дефекте |
| FP-18 | — | Chip «+ Тег»: неверный токен рамки | SYS-2 | `--icon-primary` |
| FP-19 | — | Аватар: 3 / 4 / круг | — | компонент не менять; развести в документации показ дефолтных аватарок и радиус фото |
| FP-20 | — | ButtonFollow — не самостоятельный компонент | — | в витрине показать полный набор классов |
| FP-21 | — | `.tm-svg-icon` / `.tm-svg-icon__wrapper` не извлечены | — | перенести и уточнить формулировку GAP |
## 4. Чего проход не закрыл

* **FP-16 (checkbox disabled)** — канон не определён: `checkbox-CJ1LCFDi.css`
  в локальный корпус не попал, живого чекбокса на гостевых страницах
  habr.com не нашлось. Обе стороны расхождения не сверены с продом,
  поэтому ничего не менялось.
* **Тёмная тема** проверена только на уровне токенов (все 43 разрешаются
  в обеих темах, известный дефект `--header-text` описан). Порендерного
  сравнения светлой и тёмной версии каждого компонента в этом проходе
  не делалось.
* **Figma-состояния hover/focus/loading** сверялись по токенам и
  скриншотам матрицы Preview, но не наведением курсора на живой
  production-элемент — интерактивные состояния замерены не были.
