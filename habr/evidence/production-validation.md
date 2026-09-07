# Production visual validation

Часть Visual Foundations pass: не считаем CSS declaration достаточным
доказательством того, как элемент выглядит в реальной композиции —
каждая строка ниже проверена `getComputedStyle`/`getBoundingClientRect`
на живом `habr.com`, не только вычитана из исходника.

Это снимок одного прохода. **Постоянная сверка автоматизирована** —
`check/parity.js` сравнивает выигравшие правила production с нашими
объявлениями при каждом запуске `python check/run.py`. Таблица ниже
осталась потому, что колонка «Cause» объясняет, *почему* расхождение
возникло, — этого автоматика не даёт.

| Component/pattern | Local (наш CSS) | Production (computed) | Match/Difference | Cause | Action |
|---|---|---|---|---|---|
| **Button** — `.btn.btn_solid` | `background:var(--accent-primary)` | `rgb(84,142,171)` = `--accent-primary` | **MATCH** | — | — |
| **Tabs** — `.tab-link.active` | `color:var(--accent-primary)`, `height:44px`, `.875rem/500` | `rgb(84,142,171)`, `44px`, `14px w500` | **MATCH точно** | — | — |
| **Pagination** — `.tm-pagination` / `.page_current` | `height:49px`, `box-shadow:inset 0 0 0 1px` | `49px`, `rgb(84,142,171) 0 0 0 1px inset` | **MATCH точно** | — | — |
| **UserInfo** — `.tm-user-info__userpic` | `border-radius:3px` | `3px`, `24×24` | **MATCH** | — | — |
| **ArticleCard / Title (H1)** | `.tm-title_h1{font-size:1.5rem}` → **24px** | `32px/40px`, Fira Sans, w500 | **DIFFERENCE** | Модификатор `.article-snippet.full-article .tm-title_h1{font-size:2rem;line-height:2.5rem}` существовал в исходнике, но выпал при первой выборке «публичных» частей файла | **FIX** — добавлен в `ui/components/article-card.css`, спеки обновлены (см. `RULES.md` CD-5) |
| **Grid / Container** — `.tm-page-width` | `max-width:1096px` — трактовалось как внешняя ширина | `content-box`, реальный внешний потолок **1144px**, достигается только с viewport ≈1160 | **DIFFERENCE** (в интерпретации, не в коде) | `box-sizing:content-box` не был учтён при первом чтении декларации | **FIX** — `RULES.md` SH-2/SH-2a переписаны, grid-overlay в showcase показывает оба числа |
| **Header** — `.tm-header` высота | `56px` / `48px` (≤767) | На мобильном полный блок — до **80px** | **DIFFERENCE**, но не в продуктовом CSS | Рекламный слот `.tm-header__feature` (effect.habr.com) добавляет ~32px, инвентарь-зависим | **DOCUMENTED GAP** — `RULES.md` SH-1a, не исправлялось (это не баг компонента) |
| **Identity card** — `.tm-hub-card` расположение | Утверждали: «в главной колонке, не в сайдбаре» (по DOM source-order) | `main.contains(card) === true`, `sidebar.contains(card) === false` | **MATCH**, метод усилен | Первая проверка (сравнение индекса в HTML-строке) была валидным, но более слабым доказательством, чем прямой `contains()` | — подтверждено более строгим методом, правило (EN-1) не менялось |

## Итог прохода

8 представительных элементов проверено. **5 точных совпадений, 2 реальных
расхождения (оба исправлены), 1 задокументированный, но не устранённый
нюанс** (рекламный слот — не баг компонента, а внешний фактор).

Соотношение важно само по себе: **2 из 8 (25%) проверок вскрыли реальную
ошибку** — это выше, чем можно было ожидать от «просто перепроверки».
Оба случая — не опечатки при переписывании CSS, а **пропуск модификатора
при первой выборке** (взяли базовое правило, не заметили more specific
override) и **неучтённый `box-sizing`** соответственно. Оба — системные
ошибки метода извлечения, не единичная случайность, поэтому исправление
зафиксировано и в `RULES.md`, и здесь, чтобы не повторить на следующем
компоненте.

## Не проверено в этом проходе

Popover/Dropdown/Hint/Dialog — требуют клика/взаимодействия, не
рендерятся в статичном DOM гостя; их проверка потребовала бы либо
триггера через реальный клик в headless-браузере (не делали), либо
осталась бы Storybook-only, как и раньше. Profile/entity полностью
(кроме identity-карточки) и Admin — не проверялись (admin недоступен
production в принципе, см. `RULES.md` §9).
