# Figma Library Extraction — Component Inventory

Источник: `habr-lib`, fileKey `XQ7dxSVvUt9mcx9ZZPqcxt`, страницы Preview/
button/calendar/checkbox-radiobutton/chips/dropdown/image/pagination/tabs/
textfileds. Снято через `get_metadata` (структура: component sets, variants,
nested), `get_screenshot` (визуальная проверка) и `get_variable_defs`
(точные значения цвета/геометрии — не на глаз).

`Preview` — служебная страница-обложка, дублирует остальные 9 (композитные
превью), самостоятельных компонентов не содержит — не включена отдельной
строкой.

Статусы: **MATCHED** (найден и совпадает с production/source) ·
**PARTIAL** (частично покрыт) · **FIGMA-ONLY** (нет production, не
реализовано в этом проходе) · **FIGMA-RECONSTRUCTED** (нет production,
реализовано code-first с явной пометкой) · **SOURCE-ONLY** (есть в коде,
Figma не показывает) · **STALE** (устаревшая версия в самой Figma-
библиотеке) · **UNCERTAIN**.

---

## FORMS (приоритет 1)

| Figma component | Page | Variants | States | Nested | Source equivalent | Production | Status |
|---|---|---|---|---|---|---|---|
| Input | textfileds | filled=no/yes | inactive/hover/pressed/disable/error | label-before/after, icon | `.tm-input-text-decorated` | 5/16 (`/search/`, nav-search) | **MATCHED** — geometry инструментально подтверждена (`radius=4`=4px), реализовано в `ui/components/input.css` |
| Textarea | textfileds | filled=no/yes | те же 5 | Title/Counter/Hint | — | нет | **FIGMA-RECONSTRUCTED** — `ui/components/textarea.css`, на токенах Input |
| select (custom) | textfileds | select=no/yes × filled=no/yes | inactive/hover/pressed/disable/error | — | — | нет | **FIGMA-ONLY, DEFERRED** — та же геометрия, что Input, ниже приоритет |
| datepicker | textfileds | select × filled | 5 состояний | построен из select+календарь-иконка | — | нет | **FIGMA-ONLY, DEFERRED** — композиция из select + Calendar, не отдельный примитив |
| timepicker | textfileds | select × filled | 5 состояний | построен из select+часы-иконка | — | нет | **FIGMA-ONLY, DEFERRED** — та же логика, что datepicker |
| Checkbox | checkbox/radiobutton | Checked/Indeterminate | Inactive/Hover/Disable | SVG-галочка инлайн | `.checkbox`/`.indicator` | 1/16 (`/feed/` фильтр) | **PARTIAL→MATCHED** — hover добавлен как FIGMA TARGET (см. `checkbox.css`), остальное production |
| Radiobutton | checkbox/radiobutton | Checked | Inactive/Hover/Disable | — | `.tm-radio__option` (только имя) | имя используется в `votes-lever` | **FIGMA-RECONSTRUCTED** — `ui/components/radio.css`, реальное имя класса + токены Checkbox |
| control-list | checkbox/radiobutton | vert/hor | — | список из Checkbox/Radio | — | — | **NOT REUSABLE** — просто демо-обёртка расположения в Figma, не компонент |

## SELECTION / FILTERS (приоритет 2)

| Figma component | Page | Variants | States | Nested | Source equivalent | Production | Status |
|---|---|---|---|---|---|---|---|
| base-chips / tag, hub | chips | Close=yes/no | inactive/hover/select/disable/error | close-icon | — | нет | **STALE** — v1, прямоугольная. Не реализована |
| chips field (v1) | textfileds | type=tag/hub | 5 состояний | — | — | нет | **STALE** — не реализована |
| chips field / v3 | textfileds | — | inactive/pressed | — | — | нет | **STALE** — упрощённая промежуточная версия, не реализована |
| new chips field / tag, hub, common chips | textfileds | — | inactive/pressed/error | Title+Hint+combobox | — | нет | **FIGMA-RECONSTRUCTED** — самая новая, `ui/components/chip.css` |
| chips / common chips | chips | empty=yes/no | inactive/error | — | — | нет | **FIGMA-ONLY** — дублирует new-chips-field на другом уровне вложенности, не реализована отдельно |
| chips / translation, isplanned, istimed | chips | empty/editor/dropdown | inactive/error | — | публикация-специфичные флаги | нет | **FIGMA-ONLY, DEFERRED** — узкие редакторские флаги статьи |
| article-labels / special, system, user, admin-label (v1/v2/v3) | chips | ~45 текстовых значений × editor/dropdown | — | — | `publication-label-D1N8NdVO.css` | **8/16 — РЕАЛЬНЫЙ** | **MATCHED, уже отслежено** — это таксономия из `evidence/conflicts.md` CFL-3, специфицируется вместе с Product Copy (см. `components/INDEX.md`), НЕ дублируется здесь |
| complexity-label (v1/v2) | chips | Простой/Средний/Сложный/Без сложности | editor/no | — | часть той же publication-label системы | да | **MATCHED, тот же CFL-3** |
| user-hubs | chips | Subscribe/Avatar/Blocked | Inactive/Hover/Focus/Disable/Loading | avatar | — | нет | **FIGMA-ONLY, UNCERTAIN** — не найдено соответствие ни в одной просканированной странице; вероятно sidebar-виджет рекомендаций |
| badge (Link) | chips | Link=no/yes | — | — | `badges.css` (achievement) — **другой компонент** | — | **UNCERTAIN** — визуально не проверено, совпадает ли с чем-то реальным или это отдельный неиспользуемый узел |
| fast-filter, fast-sort | chips | Filtered/type | Inactive/Hover/Focus/Disable/Loading | — | — | нет | **FIGMA-ONLY, DEFERRED** — Directory-listing controls, явно вне периметра этого прохода |

## NAVIGATION (приоритет 3)

| Figma component | Page | Variants | States | Nested | Source equivalent | Production | Status |
|---|---|---|---|---|---|---|---|
| tab | tabs | Small/Medium/Large, more=yes/no | inactive/hover/focus/select/disable/loading | — | `.tab-link`/`.tab-item` | 14/16 | **PARTIAL, уже отслежено** — production реализует один размер + `.slim`, три Figma-размера не находят точного соответствия (существующий GAP, не новый) |
| tab-panel | tabs | Small/Medium/Large | — | набор tab | `.tabs` контейнер | 14/16 | **MATCHED** |
| pagination / page | pagination | Inactive/Hover/Pressed/More | — | — | `.tm-pagination__page` | 11/16 | **MATCHED** |
| pagination / page-arrow | pagination | Previous/Next | Inactive/Hover/Disable | — | `.tm-pagination__navigation-link` | 11/16 | **MATCHED** |
| pagination (device) | pagination | desktop/tablet/mobile | — | page+arrow композиция | `@media(min-width:1024px)` переключение текста | 11/16 | **MATCHED** — уже подтверждено через media query |
| Row (dropdown/list) | dropdown | separator/title | inactive/hover/pressed/not-found/loading | icon/desc/counter | — | нет | **FIGMA-RECONSTRUCTED** — `.dropdown-row` в `dropdown.css` |
| Row (menu) | dropdown | separator/title | inactive/hover/pressed | — | — | нет | **FIGMA-RECONSTRUCTED** — `.menu-row` |
| dropdown-menu | dropdown | mobile/desktop | — | список Row | `.body` (контейнер) | Storybook-only | **PARTIAL** — контейнер MATCHED (Storybook), мобильная трансформация — Figma-only, не реализована |
| dropdown-select, list | dropdown | — | — | — | — | нет | **UNCERTAIN** — недостаточно вложенных данных в metadata, не проверено отдельно (низкий приоритет) |
| scroll | dropdown | hover, native | — | — | — | нет | **FIGMA-ONLY, DEFERRED** — кастомный скроллбар, низкая визуальная значимость |
| scroll-top | button | down=no/yes | inactive/hover | — | — | не подтверждено (JS-scroll-triggered) | **UNCERTAIN, уже отслежено** — см. `RULES.md`, попытка верификации на production не нашла элемент ни на одном тестовом viewport |

## DATE / TIME (приоритет 4)

| Figma component | Page | Variants | States | Nested | Source equivalent | Production | Status |
|---|---|---|---|---|---|---|---|
| cell-date-time | calendar | type=date/time | inactive/hover/pressed/another month/disable | — | — | нет | **FIGMA-RECONSTRUCTED** — `ui/components/calendar.css` |
| cell-arrow | calendar | left/right | inactive/hover/disable | — | — | нет | **FIGMA-RECONSTRUCTED** |
| date+time, date, time (композиты) | calendar | — | — | cell-date-time+cell-arrow | — | нет | **NOT REUSABLE отдельно** — готовые сборки из двух примитивов выше, не самостоятельные компоненты |

## MEDIA (приоритет 5, низкий)

| Figma component | Page | Variants | States | Nested | Source equivalent | Production | Status |
|---|---|---|---|---|---|---|---|
| avatar/user, /company, /hub | image | size=20…60px (7 размеров) | — | — | `.tm-user-info__userpic` (24×24, radius 3px) | да, но только 1 размер подтверждён | **PARTIAL** — Figma даёт полную шкалу размеров (20/24/32/36/40/48/60), production подтверждает только 24px; шкала зафиксирована как FIGMA TARGET, не реализована отдельным компонентом (см. Ограничения ниже) |
| icon/wysiwyg/*, markdown, wysiwyg, career, experts и т.д. | image | ~2500 nested frames | — | — | `ui/assets/icons/megazord.svg` — **другой набор** | — | **NOT REUSABLE для DESIGN MODE** — это иконки редактора статьи (WYSIWYG-тулбар) и служебных экранов (career/experts), не публичный UI habr.com; вне периметра пакета |

## BUTTONS (приоритет 6)

| Figma component | Page | Variants | States | Nested | Source equivalent | Production | Status |
|---|---|---|---|---|---|---|---|
| Primary-fill/-line, Success-fill/-line | button | Close=yes/no (только fill) | inactive/hover/focus/disable/loading | — | `.btn_solid`/`.btn_transparent` + `.tm-button_color-christi` | 15/16 | **MATCHED, уже отслежено** (`button.md`) |
| Danger, Minor | button | — | 5 состояний | — | `.tm-button_color-fuzzy-wuzzy-brown`/`-desert-storm`, только line | 15/16 (частично) | **PARTIAL, уже отслежено** — fill-варианты не подтверждены |
| icon-button | button | border, near-textfield | 5 состояний | — | не найден отдельный класс | нет | **FIGMA-ONLY, уже отслежено** — `near-textfield=yes` (40×40) вероятно относится к иконкам внутри Input/Field, не проверено на practice |

---

## Итоговый счёт по инвентарю

| Статус | Примерное число компонентов |
|---|---|
| MATCHED | 12 |
| PARTIAL | 5 |
| FIGMA-RECONSTRUCTED (реализовано в этом проходе) | 7 |
| FIGMA-ONLY / DEFERRED (задокументировано, не реализовано) | 11 |
| STALE (устаревшие версии внутри самой Figma-библиотеки) | 3 |
| UNCERTAIN | 5 |
| NOT REUSABLE (не компонент для DESIGN MODE) | 3 |

Итого — **46 отдельных Figma component sets/frames** прослежено (без учёта
~45 текстовых значений публикационной таксономии, которые считаются одним
уже покрытым компонентом, и без ~2500 вложенных icon-фреймов страницы
`image`, отнесённых к NOT REUSABLE одним блоком). Ни один компонент не
потерян без классификации.
