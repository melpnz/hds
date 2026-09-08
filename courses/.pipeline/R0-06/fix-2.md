# Правки по review-2 — витрина `showcase/components.html` (R0-06)

Единственная находка review-2 (major, B.8) — гейт §6.2 в `tools/validate-classes.mjs`
обходился новым способом, обычным CSS без экранирований. Разбор по находке —
в порядке её двух частей.

| # | Severity | Пункт | Решение | Что сделано | Где |
|---|---|---|---|---|---|
| 1а/1б | major | B.8 | исправлено | `selectorLeaks` требовала «хотя бы один» класс `doc-*` в селекторе (`.some(...)`) вместо «каждый», как обещал докстринг. Критерий заменён на `.every(...)`: каждый класс, найденный где угодно в отдельном селекторе (по обе стороны любого комбинатора и в любом составном `classname.classname` на одном элементе), обязан нести `doc-`. У `.every()` нет отдельного случая «классов не нашлось» (на пустом множестве JS возвращает `true`), поэтому явно добавлено условие `names.length > 0` — иначе `button, input, a` (находка 1б review-1) снова проходил бы молча. Тег, `:pseudo`, `[атрибут]`, `*` не извлекаются как классы регэкспом `SELECTOR` и поэтому к ним требование по-прежнему не относится | `tools/validate-classes.mjs:225-236` (было `:166-178`) |
| 1в | major | B.8 | исправлено | `forEachRule` рекурсировала только в `@media`/`@supports`/`@layer` — белый список из трёх имён, и `@container` (как и любой будущий at-rule с тем же устройством тела) выпадал из разбора целиком. Список инвертирован: рекурсия в тело любого at-rule с блочным телом — по умолчанию, кроме короткого перечня at-rules, чьё тело **структурно** не содержит селекторов элементов (`@font-face`/`@property` — плоские объявления; `@page` — плоские объявления и вложенные at-rules того же рода; `@keyframes` — проценты/`from`/`to`). Новый `@container`, будущие `@scope`/`@starting-style` и что угодно ещё с обычными правилами внутри разбираются без правок кода | `tools/validate-classes.mjs:123-133` (список `AT_RULE_WITHOUT_ELEMENT_SELECTORS`), `:142-177` (сама функция; было `:109-134`) |
| — | — | — | попутно исправлено (тот же участок, не отдельная находка) | При переписи рекурсии по at-rules обнаружилось, что at-rule без тела (`@import ...;`, `@charset ...;`) не имеет `{...}` вовсе и склеивался с преамбулой следующего настоящего правила в одну строку, начинающуюся с `@` — из-за этого следующий реальный блок целиком выпадал из разбора (ни `visit`, ни рекурсия). Добавлена проверка: если `;` встречается раньше следующего `{`, это самостоятельное заявление — пропускается до `;`, разбор продолжается с чистого места. Без этой правки проба T5 (`at-rule без блока`, ниже) показала бы EXIT=0 на утечке сразу после `@import`/`@charset`; в отчёте review-2 такой пробы не было, она добавлена при подготовке красного набора для проверки исправления 1в | `tools/validate-classes.mjs:150-156` |
| — | — | — | докстринг | Строки 15-27 (было 15-20) переписаны в соответствие с реализацией: явно описан критерий «каждый класс, а не файл целиком», исключение `:root`, требование «классы есть и все doc-» для голых селекторов, и структурный (а не пофамильный) принцип рекурсии по at-rules с перечислением короткого списка исключений и явной оговоркой про at-rules без тела | `tools/validate-classes.mjs:15-40` |

## Изменённые файлы

- `tools/validate-classes.mjs` — единственный тронутый файл: критерий `selectorLeaks`
  («каждый», не «хотя бы один», с явным требованием непустого множества классов);
  список at-rules для рекурсии инвертирован (по умолчанию — разбирать, короткое
  исключение вместо белого списка); разбор at-rules без тела (`@import`/`@charset`)
  больше не глотает следующий реальный блок; докстринг файла приведён в соответствие
  коду.
- `.pipeline/R0-06/fix-2.md` — этот файл.

Других файлов правка не касается: находка была единственной, и она целиком
локализована в одном инструменте. `showcase/components.css`,
`showcase/components.html`, `components/manifest.json` не менялись.

## Результат валидатора

Гейты на исправленном коде, рабочее дерево, дословно:

```
$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
код возврата: 0

$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (2) — предмета ещё нет:
- requiredStates — матрицы обязательных состояний ещё нет (R1-01); у 55 записей список пуст
- спецификации — 55 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — инвентаризация записала один ключ и FilterChip, и Tab: либо это один component set, либо ошибка переноса. Разводится на R3-04 и R3-13
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
код возврата: 0

$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
  roadmapSteps: 76
  roadmapR0: 7
  elements: 55
  pages: 10
  unreachable: 8
  cssCategories: 10
  tokens: 51
  manifest: 55
  specs: 0
  scopeProduction: 44
  scopeStorybookOnly: 5
  scopeFigmaOnly: 6
код возврата: 0

$ node --check tools/*.mjs   (все шесть файлов по отдельности)
OK tools/capture.mjs
OK tools/measure-selectors.mjs
OK tools/serve.mjs
OK tools/validate-classes.mjs
OK tools/validate-components.mjs
OK tools/validate-counts.mjs
код возврата: 0

Обязательная пара против подделки реестра:
$ node tools/measure-selectors.mjs
Измерено селекторов 44 по 10 страницам; расходятся с манифестом 0.
Перепись записана: components\selector-census.json
код возврата: 0
$ node tools/validate-components.mjs --strict
Manifest structure is valid.
код возврата: 0
$ git status --short components/
(пусто)
```

## Красный набор — три пробы ревьюера (review-2), независимая копия пакета в скретчпаде

Копия `ui/ + showcase/ + tools/ + components/`, отдельно от рабочего дерева.

```
=== R-x1: descendant combinator, doc- ancestor + unprefixed descendant class ===
вставка: .doc-specimen .card { border: 4px solid magenta !important; }
Оболочка витрины и продуктовый слой смешались (1):
  showcase\components.css: селектор без класса витрины doc- — .doc-specimen .card
EXIT=1

=== R-x2: compound selector — doc- class + unprefixed class ===
вставка: .doc-badge.leaked-name { background: lime; }
Оболочка витрины и продуктовый слой смешались (1):
  showcase\components.css: селектор без класса витрины doc- — .doc-badge.leaked-name
EXIT=1

=== R-x5: @container оборачивает голый bare-селектор в showcase ===
вставка: @container (min-width: 100px) { button, input, a { border: 4px solid magenta !important; } }
Оболочка витрины и продуктовый слой смешались (3):
  showcase\components.css: селектор без класса витрины doc- — a
  showcase\components.css: селектор без класса витрины doc- — button
  showcase\components.css: селектор без класса витрины doc- — input
EXIT=1
```

Все три — раньше EXIT=0, теперь EXIT=1, как требовало ревью.

## Новый красный набор — другие стороны той же дыры (задание fix-2)

```
=== T1: составной селектор из трёх классов, чужой в середине ===
вставка: .doc-badge.leaked-mid.doc-other { background: lime; }
  селектор без класса витрины doc- — .doc-badge.leaked-mid.doc-other
EXIT=1

=== T2: составной селектор из трёх классов, чужой в конце ===
вставка: .doc-badge.doc-other.leaked-end { background: lime; }
  селектор без класса витрины doc- — .doc-badge.doc-other.leaked-end
EXIT=1

=== T3: @media внутри @container ===
вставка:
  @container (min-width: 100px) {
    @media (min-width: 200px) { .leaked-nested-a { color: red; } }
  }
  селектор без класса витрины doc- — .leaked-nested-a
EXIT=1

=== T4: @container внутри @media ===
вставка:
  @media (min-width: 200px) {
    @container (min-width: 100px) { .leaked-nested-b { color: red; } }
  }
  селектор без класса витрины doc- — .leaked-nested-b
EXIT=1

=== T5: at-rule без блока (@import, @charset) не должен ломать разбор ===
вставка в начало файла:
  @charset "UTF-8";
  @import url("other.css");
  ...дальше исходный components.css без изменений...
  плюс в конец: .leaked-after-import { color: red; }
  селектор без класса витрины doc- — .leaked-after-import
EXIT=1

=== T5-контроль: те же @charset/@import БЕЗ утечки после них ===
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
EXIT=0
```

T5 — не отдельная требуемая проба, а проверка побочной правки: без фикса
парсинга at-rules без тела утечка сразу после `@import`/`@charset` целиком
выпадала бы из разбора (преамбула следующего блока склеивалась с
`@charset...;@import...;` в одну строку, начинающуюся с `@`, и не проходила
ни в `visit`, ни в рекурсию). T5-контроль показывает, что сам `@charset`/
`@import` не порождает ложных срабатываний.

## Регрессия — контрольные пробы review-1 и bare-selector, копия после правки

```
R-d: .doc-leak в ui/tokens.css внутри @media
  ui\tokens.css: класс оболочки витрины в продуктовом слое — .doc-leak
EXIT=1 (как и было)

R-f: var(--doc-bg) в ui/tokens.css
  ui\tokens.css: переменная оболочки витрины в продуктовом слое — --doc-bg
EXIT=1 (как и было)

R-j: .hover\:leak без префикса в showcase/components.css
  showcase\components.css: селектор без класса витрины doc- — .hover\:leak
EXIT=1 (как и было)

R-a: инлайновый <style> витрины, класс без doc- (.leaked-shell)
  showcase/components.html <style>: селектор без класса витрины doc- — .leaked-shell
EXIT=1 (как и было)

R-b/R-c control: button, input, a {...} и [data-leak="1"] без класса
  a / button / input / [data-leak="1"] — все EXIT=1 (как и было)

Контроль: копия без единой правки
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
EXIT=0
```

Все прежние пробы (три обхода fix-1, две дыры вне границ шага в
`validate-components.mjs`, контраст, уровни заголовков) не перепроверялись
заново в этой итерации — они не задеты правкой (изменения ограничены
`selectorLeaks` и `forEachRule`), и review-2 сам подтвердил их независимо
(«Что проверено и претензий нет» в `review-2.md`).

## Что ушло в roadmap отдельными строками

Ничего новое. Правка не вскрыла новых долгов сверх уже записанных в
`capture.md` §9 (пп. 1-10) на предыдущих итерациях — `capture.md` не менялся.
