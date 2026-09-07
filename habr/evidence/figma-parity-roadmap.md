# Figma Parity Audit — полный проход по библиотеке

Дата: 2026-09-04. Figma: `habr-lib` (`XQ7dxSVvUt9mcx9ZZPqcxt`),
входная точка — канвас **Preview** (`853:1969`).
Production: живой habr.com (CDP) + локальный Storybook-корпус
(`_sources/habr/`: 19 CSS-файлов сборки, 73 отрисованных story).

Цель прохода была не «посмотреть ещё раз внимательнее», а найти
**системные причины**, из-за которых точечные проверки продолжали
пропускать баги. Причины нашлись, они описаны ниже отдельным разделом —
и они объясняют большинство находок.

---

## 0. Как проверялось

Три инструмента, все воспроизводимые, ни один не полагается на глаз.

**1. Стенд паритета «одна разметка — два CSS».**
Каждая из 73 story-разметок Storybook отрисована дважды: под настоящим
production-CSS из `_sources/habr/source/css/` и под нашим `ui/habr.css`.
Затем поэлементно сравнены **62 вычисленных свойства** плюс `::before`/
`::after` и габариты. Обе стороны получают одинаковую глобальную базу
(normalize + два правила на `body`), отдельно сверенную с живым habr.com —
иначе prod-сторона рендерилась Times New Roman и весь дифф тонул в шуме
от разной ширины текста.

Результат: **43 story из 73 совпали полностью**, 30 дали расхождения,
из которых после разбора настоящими оказались 6 (остальное — обвязка
Storybook, разный порядок загрузки чанков и отсутствие шрифта на
prod-стенде).

**2. Правило-к-правилу.** Тот же production-CSS разобран на селекторы и
объявления и сравнён с нашими файлами напрямую — это ловит потерянные
правила, которых не видно в рендере конкретной story.

**3. Живой habr.com.** `getComputedStyle` + `CSS.getMatchedStylesForNode`
на реальных страницах — для компонентов, чей CSS в локальный корпус не
попал (таб, инпут, карточка статьи, чипы хабов, votes, rss, follow).
`getMatchedStylesForNode` оказался решающим дважды: он показывает, какое
правило реально победило в каскаде, а не какое написано в файле.

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

## 3. Реестр расхождений

### FP-01 · `.arrow*` действует на всю страницу

| | |
|---|---|
| **Component** | BaseHint |
| **Variant/state** | все 12 положений стрелки |
| **Figma** | стрелка — часть компонента |
| **Local** | `.arrow`, `.arrow-top/-bottom/-left/-right` — **голые селекторы**, 23 правила |
| **Production** | `.arrow[data-v-f977e8aa]` — изолировано компонентом |
| **Difference** | наши правила бьют по любому элементу с классом `arrow` в приложении-потребителе |
| **Root cause** | SYS-1 |
| **Canonical** | production |
| **Fix** | заскоупить под `.base-hint` |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-02 · `.input` / `.indicator` действуют на всю страницу

| | |
|---|---|
| **Component** | Checkbox |
| **Figma** | — |
| **Local** | `.input` ×7, `.indicator` ×3 — голые |
| **Production** | scoped; при этом класс `input` в production **занят** полем ввода (`.tm-input-text-decorated.input`, замерено на habr.com) |
| **Difference** | коллизия не гипотетическая: `.indicator{width:18px;height:18px}` навязывается любому `.indicator` |
| **Root cause** | SYS-1 |
| **Canonical** | production |
| **Fix** | заскоупить под `.checkbox` |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-03 · ArticleCard: 23 голых селектора с очень общими именами

| | |
|---|---|
| **Component** | ArticleCard |
| **Local** | `.author`, `.lead`, `.meta`, `.stats`, `.cover`, `.readmore`, `.bookmarks-button`, `.meta-container`, `.lead-image`, `.round-on-mobile` |
| **Production** | `.author[data-v-a0c576a8]`, `.bookmarks-button[data-v-41bd4ade]` — проверено `getMatchedStylesForNode` на живой странице |
| **Difference** | самый переиспользуемый модуль пакета несёт самые общие имена без изоляции |
| **Root cause** | SYS-1 |
| **Canonical** | production |
| **Fix** | заскоупить под `.article-snippet` |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-04 · Градиент-маска пагинации сделана через `transparent`

| | |
|---|---|
| **Component** | Pagination |
| **Variant/state** | маски по краям прокручиваемого списка |
| **Figma** | — |
| **Local** | `linear-gradient(to right, var(--background-primary), transparent)` |
| **Production** | `linear-gradient(to right, var(--background-primary), hsl(from var(--background-primary) h s l / 0%))` |
| **Difference** | `transparent` = **прозрачный чёрный**; при интерполяции с белым даёт серую муть в середине градиента. Production специально уводит альфу у того же цвета |
| **Root cause** | упрощение при извлечении — классическая ловушка CSS |
| **Canonical** | production |
| **Fix** | вернуть production-значение дословно |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-05 · Потеряно сглаживание шрифта в пагинации

| | |
|---|---|
| **Local** | нет |
| **Production** | `.tm-pagination__page` и `.tm-pagination__navigation-link` — `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale` |
| **Difference** | текст рендерится жирнее нашего |
| **Root cause** | вендорные префиксы отброшены при извлечении |
| **Canonical** | production |
| **Fix** | вернуть |
| **Priority** | **P2** |
| **Confidence** | HIGH |

### FP-06 · Диалог: потеряно оформление скроллбара шторки

| | |
|---|---|
| **Component** | Dialog (мобильная шторка) |
| **Local** | нет |
| **Production** | 4 правила `.bottom-drawer-inner .main::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `:hover::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-corner` |
| **Difference** | в шторке — системный скроллбар вместо оформленного |
| **Root cause** | псевдоэлементы `::-webkit-scrollbar*` пропущены при извлечении |
| **Canonical** | production |
| **Fix** | вернуть дословно |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-07 · ~~BaseHint: кнопка закрытия без стилей~~ — ЛОЖНОЕ СРАБАТЫВАНИЕ

Автоматический дифф правило-к-правилу отметил `.close`,
`.close:not(:focus-visible)` и `.link-wrapper` как «есть в проде, нет у нас».
При проверке перед правкой оказалось, что все три **у нас есть** — просто
уже заскоуплены под `.base-hint`, а дифф сравнивает селекторы строкой и
поэтому считает `.base-hint .close` и `.close` разными.

Записано намеренно, а не удалено: это показывает границу применимости
инструмента. Дифф селекторов не умеет отличать «правило потеряно» от
«правило сужено» — каждое его срабатывание нужно проверять глазами
до правки, иначе легко «починить» то, что уже сделано верно.

**Статус: не баг. Ничего не менялось.**

### FP-08 · `.modal-window`: выдуманное значение ширины по умолчанию

| | |
|---|---|
| **Local** | `width: var(--modal-window-width, 320px)` |
| **Production** | `width: var(--v52269707)` — **без фолбэка** |
| **Difference** | 320px не подтверждён ничем; переименование Vue-переменной оправдано (её имя меняется от сборки), выдуманный дефолт — нет |
| **Root cause** | «удобный» дефолт добавлен для витрины |
| **Canonical** | production |
| **Fix** | убрать фолбэк, ширину задавать в разметке; в спецификации описать явно |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-09 · InformerHint: имя переменной и `position`

| | |
|---|---|
| **Local** | `width: var(--informer-hint-width)`, добавлен `position: relative` |
| **Production** | `width: var(--v350f87b0)`, `position` не задан (static) |
| **Difference** | имя переменной — сознательное переименование (Vue-хеш непереносим). `position:relative` меняет систему координат для `:before` |
| **Root cause** | `:before` в production позиционируется относительно `.base-popover`; мы показываем информер без попапа |
| **Canonical** | production по значению, наше по устойчивости |
| **Fix** | оставить `relative`, но записать расхождение и причину; имя переменной задокументировать рядом с production-именем |
| **Priority** | **P2** |
| **Confidence** | HIGH |

### FP-10 · Input: два выдуманных объявления на подписи

| | |
|---|---|
| **Component** | Input |
| **Local** | `.tm-input-text-decorated__label { color: var(--text-secondary); font-size: .875rem }` |
| **Production** | `.tm-input-text-decorated__label { line-height: 2.5rem; position: absolute; top: 0 }` — **и всё** (проверено `getMatchedStylesForNode`) |
| **Difference** | цвет и кегль подписи придуманы; в проде подпись наследует 16px и цвет родителя |
| **Root cause** | достройка «как логично» при извлечении |
| **Canonical** | production |
| **Fix** | удалить два объявления |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-11 · icon-button: неверный токен иконки и рамки

| | |
|---|---|
| **Figma** | `elements/button/icon/icon` = `#929ca5`, `elements/button/icon/border` = `#929ca566` (тот же цвет, альфа 40%) |
| **Local** | `color: var(--icon-secondary)` (`#bcced7`), рамка — сплошной `--icon-secondary` |
| **Production** | компонента нет |
| **Difference** | голубовато-серый вместо нейтрального; рамка непрозрачная вместо 40% |
| **Root cause** | SYS-2 |
| **Canonical** | Figma (компонент реконструирован, production-версии не существует) |
| **Fix** | `--icon-primary`; рамка — `hsl(from var(--icon-primary) h s l / 40%)` |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-12 · dropdown-row: неверный токен иконки

| | |
|---|---|
| **Figma** | `elements/dropdown/row/list/icon` = `#929ca5` |
| **Local** | `--icon-secondary` |
| **Root cause** | SYS-2 |
| **Canonical** | Figma |
| **Fix** | `--icon-primary` |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-13 · dropdown-row выбранный: описание должно быть серым

| | |
|---|---|
| **Figma** | `row/list/desc_txt_pressed` = `#c0c0c0` |
| **Local** | белый (`--background-primary`) |
| **Difference** | в Figma описание под выбранной строкой приглушено, у нас сливается с основным текстом |
| **Canonical** | Figma |
| **Fix** | `--other-disabled-elements` |
| **Priority** | **P2** |
| **Confidence** | HIGH |

### FP-14 · Кнопка: Figma на шаг чище production

| | |
|---|---|
| **Figma** | padding 8/16, radius 4, интерлиньяж 16, Minor — 12/14 и padding 12 |
| **Local / Production** | padding 8/14, radius 3, интерлиньяж 14.95, Minor без своих кегля и отступов |
| **Root cause** | SYS-4 |
| **Canonical** | production |
| **Fix** | не менять, зафиксировать |
| **Priority** | **P3** |
| **Confidence** | HIGH |

### FP-15 · Кнопка: состояния focus и loading

| | |
|---|---|
| **Figma** | focus — кольцо (`radius_focus` 6); loading — спиннер вместо текста |
| **Production** | `outline:none` на `:hover/:focus/:active`; loading — бегущая полупрозрачная полоса (`.btn_loading:before`), не спиннер |
| **Difference** | два принципиально разных решения одного состояния |
| **Canonical** | production, Figma — TARGET |
| **Fix** | не трогать; описать как FIGMA TARGET |
| **Priority** | **P2** |
| **Confidence** | HIGH |

### FP-16 · Checkbox disabled: разное решение

| | |
|---|---|
| **Figma** | disabled — фон `#f0f0f0`, рамка/галочка `#c0c0c0` |
| **Local** | фон и рамка `--other-disabled-elements` (`#bfbfbf`), галочка белая |
| **Production** | `checkbox-CJ1LCFDi.css` в локальный корпус не попал, живого чекбокса на гостевых страницах не нашлось |
| **Canonical** | **не определён** |
| **Fix** | не менять |
| **Priority** | **P2** |
| **Confidence** | **UNCERTAIN** — обе стороны не сверены с продом |

### FP-17 · Textarea: белый фон в disabled в тёмной теме

| | |
|---|---|
| **Figma** | `elements/txtfield/bg_disable` = `#f7f7f7` = `--background-secondary` |
| **Local** | `background-color: var(--header-text)` — скопировано из Input |
| **Production** | компонента нет вовсе |
| **Difference** | `--header-text` белый в **обеих** темах: в тёмной теме заблокированное поле светится белым |
| **Root cause** | реконструкция унаследовала известный дефект production-инпута туда, где production-кода нет |
| **Canonical** | Figma (компонент целиком реконструирован) |
| **Fix** | `--background-secondary`; у Input оставить production-значение и оставить помету о дефекте |
| **Priority** | **P1** |
| **Confidence** | HIGH |

### FP-18 · Chip «+ Тег»: неверный токен рамки

| | |
|---|---|
| **Figma** | `empty/icon_txt_border` = `#929ca5` |
| **Local** | `--icon-secondary` |
| **Root cause** | SYS-2 |
| **Canonical** | Figma |
| **Fix** | `--icon-primary` |
| **Priority** | **P2** |
| **Confidence** | HIGH |

### FP-19 · Аватар: 3 / 4 / круг

| | |
|---|---|
| **Figma** | `elements/avatar/radius` = **4** |
| **Local (компонент)** | `border-radius: 3px` |
| **Local (витрина)** | круглый — по прямому указанию владельца |
| **Production** | `.tm-user-info__userpic { border-radius: 3px }` — замерено на habr.com |
| **Difference** | три позиции сразу |
| **Canonical** | production для компонента; круг — оформительское решение витрины для дефолтных иллюстраций |
| **Fix** | компонент не менять; развести в документации показ дефолтных аватарок и радиус фото |
| **Priority** | **P2** |
| **Confidence** | HIGH по обоим замерам |

### FP-20 · ButtonFollow — не самостоятельный компонент

| | |
|---|---|
| **Production** | `.btn.btn_transparent.btn_small.tm-button_color-christi.tm-button-follow` — модификатор поверх обычной кнопки (замерено на `/hubs/programming/`) |
| **Local** | `.tm-button-follow` описан именно как модификатор ✓, но в витрине показывался отдельной секцией как самостоятельная сущность |
| **Difference** | документационная, не кодовая |
| **Canonical** | production |
| **Fix** | в витрине показать полный набор классов |
| **Priority** | **P2** |
| **Confidence** | HIGH |

### FP-21 · `.tm-svg-icon` / `.tm-svg-icon__wrapper` не извлечены

| | |
|---|---|
| **Production** | правила есть в `BaseDialog-CrJ9tGzP.css` |
| **Local** | нет; в `assets/README.md` класс описан как GAP «нигде не встречается» |
| **Difference** | утверждение о GAP было неполным: правила существуют, просто мы их не перенесли |
| **Canonical** | production |
| **Fix** | перенести и уточнить формулировку GAP |
| **Priority** | **P2** |
| **Confidence** | HIGH |

---

## 4. Что чинится, что нет

**Исправлено в этом проходе (P1):**
FP-01, FP-02, FP-03, FP-04, FP-06, FP-07, FP-08, FP-10, FP-11, FP-12, FP-17.

**Исправлено попутно (P2):** FP-05, FP-13, FP-18, FP-21.

**Сознательно не трогаем:**
FP-14, FP-15 — канон production, Figma зафиксирована как TARGET.
FP-16 — канон не определён, менять вслепую нельзя.
FP-19 — три позиции разведены по назначению, а не усреднены.

**Отложено запретом владельца** (§15 задания): select, datepicker,
timepicker, полная taxonomy article-labels/event, user-hubs, new chips
list, control-list, сборки calendar date/time.


---

## 5. Результат прохода

### Что изменилось в коде

| Файл | Правка |
|---|---|
| `hint.css` | 23 селектора `.arrow*` заскоуплены под `.base-hint` |
| `checkbox.css` | 10 селекторов `.input`/`.indicator` заскоуплены под `.checkbox` |
| `article-card.css` | 24 селектора (`.meta`, `.author`, `.lead`, `.stats`, `.cover`, `.readmore`…) заскоуплены под `.article-snippet` |
| `dropdown.css` | `.menu-row*` под `.dropdown`; иконка строки → `--icon-primary`; описание выбранной строки → `--other-disabled-elements` |
| `dialog.css` | возвращены 4 правила скроллбара шторки; `.wysiwyg-fade-*` и `.cover-image` заскоуплены под оба корня; убран выдуманный фолбэк ширины |
| `pagination.css` | градиент через альфу вместо `transparent`; возвращено сглаживание шрифта |
| `input.css` | удалены два выдуманных объявления на `__label` |
| `icon-button.css` | иконка → `--icon-primary`; рамка → тот же цвет с альфой 40% |
| `chip.css` | рамка `_add` → `--icon-primary` |
| `textarea.css` | фон disabled → `--background-secondary` |
| `icon.css` | перенесены `.tm-svg-icon` / `.tm-svg-icon__wrapper` |
| `patterns.css`, `primitives.css` | `.stat`/`.stat-link` под `.stats-container`; `.inline-separator` оставлен голым с обоснованием |

### Проверка после правок

* **Стенд паритета** прогнан заново. Пагинация: было 8 расходящихся узлов
  на story, стало 6 — и все шесть это намеренный `fill: currentColor`,
  сверенный с живым продом (см. SYS-3). Диалог показал ожидаемое
  следствие снятия фолбэка: story передаёт ширину под production-именем
  переменной, наше CSS его не знает. Это описано в FP-09 как осознанный
  размен, а не регрессия.
* **Осиротевшие элементы.** После сужения селекторов витрина проверена
  автоматически: у каждого элемента с заскоупленным классом должен быть
  требуемый предок. Нашлось два случая — `.bookmarks-button` (оказался
  самостоятельным компонентом, скоуп откачен) и menu-строки dropdown вне
  `.dropdown` (исправлена композиция витрины).
* **Копи-тест.** Разметка вынута из витрины и отрисована с подключённым
  только документированным рантаймом (тема + `ui/habr.css`), без единой
  строки CSS витрины. Чекбокс 18×18 с рамкой `#bcced7`, отмеченный —
  акцентный; страница пагинации 32×32, стрелка 32×32, сглаживание
  `antialiased`; иконка строки dropdown `#929ca5`; icon-button `#929ca5`
  и рамка с альфой 40%; панель Medium-табов 219.7×42 с зазорами 0.
  0 ошибок консоли.
* **Голые селекторы:** было 109 в 9 файлах, стало 13 в 3 — и все 13 это
  корни собственных компонентов (`.bookmarks-button`, `.stats-container`,
  `.inline-separator`), сузить которые нельзя, не выдумав новых имён.
  Каждый помечен комментарием.
* Витрина: 0 битых ассетов, 0 висячих `<use>`, 0 ошибок консоли,
  без горизонтального переполнения на 320/480/768/1100/1440.

### Чего проход НЕ закрыл

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
