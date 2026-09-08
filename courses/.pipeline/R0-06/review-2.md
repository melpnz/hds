# Ревью R0-06 — пустая витрина `showcase/components.html` — итерация 2

Вердикт: **вернуть на доработку**
Дата: 8 сентября 2026. Ревьюер ничего не правил.

Находки: **blocker 0 · major 1 (два независимых воспроизведения) · minor 0 · note 0**.

Итог по review-1: находки 1–7 закрыты по существу и подтверждены независимо
(включая обе дыры вне границ шага). Но красный набор ревьюера на **исправленном**
`tools/validate-classes.mjs` нашёл **новый, не входивший в заявленные три обхода**
пробел в том же самом гейте §6.2, обычными, не экзотическими селекторами. Гейт
держит инвариант для 55 будущих компонентов — по правилу «если гейт снова
обходится, не смягчать» вердикт тот же, что и на первой итерации, хотя объём
проблемы меньше на порядок.

---

## Проверено

**Гейты** — прогнаны заново на рабочем дереве, выдача дословно ниже:
`validate-components --strict`, `validate-counts`, `validate-classes`,
`node --check tools/*.mjs`, обязательная пара
`measure-selectors` → `validate-components --strict` → `git status components/`.

**Копия пакета** (`ui/ + showcase/ + tools/ + components/`) в скретчпаде —
независимый красный набор против гейта §6.2, отдельно от пяти проб review-1
и трёх заявленных обходов fix-1.

**`validate-components.mjs`, обе правки** — обе «дыры» review-1 воспроизведены
на копии дословно (якорь в `<pre>`, `complete` без `showcaseAnchor`) и дают
код 1, как заявлено.

**Контраст `--doc-ink-3`** — расчёт WCAG по трём фонам, свой скрипт (не
поверил числам fix-1 на слово), плюс проверка компьютерных стилей в реальном
браузере на элементах, где значение реально используется (11–12.5px).

**Уровни заголовков** — обход `document.querySelectorAll('h1..h6')` в реальном
браузере (Chromium msedge, `node tools/serve.mjs`), не по разметке; отдельно
прочитан шаблон в `<pre>`.

**`manifest.json`** — сверен побайтово с версией, принятой R0-03 (`5f07041`);
дифф `HEAD` vs `5f07041` пуст. Проверено, что коммит R0-06 (`75f8a0b`) этот
файл не трогал.

**Регрессия** — R-d, R-f, R-j и площадка `:not()/:is()/@supports/content:/url()`
перепрогнаны на исправленном коде: без изменений, все ловятся как раньше.

**Витрина в браузере** — 320, 768, 1024, 1400 (`playwright`, chromium msedge):
`scrollWidth === clientWidth` документа на всех четырёх; единственный
элемент шире вьюпорта на 320 — `.doc-code` (`<pre>` с собственным
`overflow-x: auto`), это не переполнение страницы. Консоль пуста. Один новый
скриншот — `review-2-320.png` (320 ширины ещё не было в `.pipeline/R0-06/`);
1400 не переснимал — `showcase-1440.png`/`review-1-1440.png` уже на диске и
макет с фикса не менялся на этой ширине.

**Четыре отклонённые находки** (note 8, 10, 11, 14) — рассмотрены; отказы
обоснованы и записаны кандидатами в `capture.md` §9, не потеряны.

Figma и прод не открывались — у витрины узла в макете и прототипа в проде нет
(так же, как в review-1).

---

## Находки

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | **major** | B.8 | **Гейт §6.2 после переписи по-прежнему обходится — не тремя закрытыми способами, а двумя новыми, притом обычным CSS, без экранирований и хаков.** Функция `selectorLeaks` (`tools/validate-classes.mjs:166-178`) считает селектор безопасным, если **хотя бы один** класс в нём начинается с `doc-` (`[...classNames(selector)].some(...)`). Собственный докстринг файла (строки 15-20) обещает другое: «showcase/\*.css — **каждый** класс в селекторе начинается с `doc-`». (а) Составной селектор `.doc-badge.leaked-name { background: lime }` — класс `leaked-name` без префикса проходит, потому что рядом стоит `doc-badge`: `EXIT=0`, «Checked 47 classes… All defined». (б) Селектор с потомком `.doc-specimen .card { border: 4px solid magenta !important }` — то есть ровно тот сценарий из review-1 (майор-1б, «просто у файла уже есть одно правило без префикса»), только замаскированный под доk-namespace: любой будущий продуктовый класс, случайно названный так же, как что-то внутри `.doc-specimen`/`.doc-stage` (а там при R2+ будут рендериться настоящие компоненты), получит стиль витрины молча. `EXIT=0`. Кроме того, `forEachRule` рекурсирует только в `@media`/`@supports`/`@layer` (`tools/validate-classes.mjs:124`); (в) любой другой оборачивающий at-rule, например `@container (min-width: 100px) { button, input, a { border: 4px solid magenta !important } }` — тот самый bare-селектор из майор-1б review-1 — целиком выпадает из разбора: тело `@container` не передаётся ни в `visit`, ни в рекурсию, `EXIT=0`. Все три пробы дают «Checked N classes… All defined» и «1 showcase stylesheet(s) prefixed doc-» — то самое ложное зелёное, о котором предупреждала постановка задачи | `tools/validate-classes.mjs:124, 166-178` | вставить любую из трёх строк в `showcase/components.css` копии пакета и прогнать `node tools/validate-classes.mjs` — код 0 вместо ожидаемого 1; воспроизведено на независимой копии, не на рабочем дереве |

---

## Что проверено и претензий нет

- **Три заявленных обхода майор-1 (инлайновый `<style>`, bare-селектор `button, input, a`, атрибутный `[class~=...]`)** — все три независимо воспроизведены на своей копии после правки и дают `EXIT=1`, ровно как заявлено в `fix-1.md`. Реальное нарушение `body{...}` в `showcase/components.css` переименовано в `.doc-body`, класс стоит на `<body>` (подтверждено и чтением файла, и `document.body.className` в браузере — `doc-body`).
- **Обе «дыры» вне границ шага (`validate-components.mjs`)** — воспроизведены дословно на копии: якорь `c-badge`, оставленный только текстом внутри `<pre>` (ровно строка 218 текущего `components.html`, `c-&lt;id&gt;` → `c-badge`), даёт `showcase anchor not found: c-badge`; запись `complete` + `showcaseAnchor: null` даёт `non-planned component must have showcaseAnchor`. Обе — код 1.
- **Одинарные кавычки и `class=` без кавычек** — отдельно не перепроверял регрессией (проверено в review-1 и подтверждено выводом `fix-1.md`); код гейта (`tools/validate-classes.mjs:204-210`) читается корректно на всех трёх формах.
- **Контраст `--doc-ink-3` (`#666d73`)** — свой расчёт WCAG: 5.250 на `#ffffff`, 5.067 на `#fafbfc`, 4.729 на `#f2f3f5` — все три числа сошлись с `fix-1.md` до третьего знака. Подтверждено и в браузере: `getComputedStyle` на `.doc-nav__foot` (12px), `.doc-section__num` (12px), `.doc-variant__label` (11px), `.doc-slot` (12px), `.doc-empty` (12.5px) — везде `rgb(102, 109, 115)` = `#666d73`, размеры шрифта совпадают с заявленными в находке review-1.
- **Уровни заголовков** — обходом DOM в реальном браузере (не по разметке): `h1→h2→h3→h3→h2→h2→h3→h3→h2→h3×9`, пропусков нет (`SKIPS: []`). Шаблон в `<pre>` (строки 218-238): категория `h3` → секция компонента `h4` → имя варианта `h5` — тоже без пропуска, консистентно с реальной иерархией категорий.
- **`.doc-src-group` и `aria-label="production"`** — живой пример (строки 190-191) и шаблон в `<pre>` (строки 229-230) теперь идентичны; легенда (151-153) сознательно не тронута — рядом уже есть текстовая расшифровка.
- **Число объявлений `.doc-stage`** — реально пять (`background`, `color`, `font-family`, `font-size`, `line-height`), совпадает с продуктовым `body,html` до значения; замерено в браузере: `font-size: 16px`, `line-height: 20.8px`, `color: rgb(44, 46, 52)`, `background: rgb(255, 255, 255)`.
- **Побочный эффект на `manifest.json`** — файл в рабочем дереве побайтово идентичен версии, принятой R0-03 (`git diff 5f07041 -- components/manifest.json` пуст); коммит R0-06 (`75f8a0b`) этот файл не затрагивал (в его дифф-стате `components/manifest.json` не значится); `validate-components.mjs --strict` проходит по нему кодом 0.
- **Четыре отклонённые находки review-1** (note 8 — `.doc-stage` перечислением; note 10 — ложная тревога `--doc-` внутри `content:`; note 11 — побуквенная проверка префикса/hex-экранирование; note 14 — без действия) — отказы обоснованы, записаны кандидатами в `capture.md` §9 пп. 8-10, не потеряны и не выданы за закрытые.
- **Регрессия** — R-d (`@media` в `ui/`), R-f (`var(--doc-bg)` в `ui/`), R-j (`.hover\:leak` без префикса в showcase) — все три по-прежнему `EXIT=1`, без изменений в поведении.
- **Responsive 320/768/1024/1400** — `scrollWidth === clientWidth` документа на всех четырёх; единственное расхождение — внутренний скролл `.doc-code` (`overflow-x: auto` по дизайну), не переполнение страницы; консоль браузера пуста на всех четырёх.
- **Гейты дословно** (полный вывод — ниже) — все дают тот же результат, что в `fix-1.md`, слово в слово, включая счётчики (47 классов, 55 записей, 28 чисел).
- **Границы шага** — `git status --short courses/` чист; коммит R0-06 не касается `components/manifest.json`, `docs/`, `ROADMAP.md` статуса записей вне отчётности.
- **Сервер** — `/showcase/components.html` и `/showcase/components.css` отдают `200`; после проверки сервер погашен, порт 4179 свободен (в отличие от инцидента, описанного в `capture.md` §9 п. 6).

## Что проверить не смог

- **Копируемость METHOD §6.1 на разметке пакета** — по-прежнему нечего проверять: спецификаций 0. Не пропуск шага, состояние пакета (согласовано ещё review-1).
- **Сверка с Figma и продакшеном** — у витрины нет узла в макете и нет прототипа в проде; сравнивать тройкой нечего.
- **`npm test` / `webServer` целиком** — `tests/` по-прежнему пуст (`.gitkeep`), это X-01, вне границ шага; URL для `webServer` существует и отдаёт 200 (перепроверено).

---

## Гейты — дословно (рабочее дерево, не копия)

```
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

$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
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

## Красный набор ревьюера — новая проба против гейта §6.2 (копия пакета, скретчпад)

```
=== R-x1: descendant combinator, doc- ancestor + unprefixed descendant class ===
вставка в showcase/components.css:
  .doc-specimen .card { border: 4px solid magenta !important; }
вставка в showcase/components.html:
  <div class="doc-specimen"><div class="card">probe</div></div>
Checked 48 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
EXIT=0

=== R-x2: compound selector — doc- class + unprefixed class ===
вставка в showcase/components.css:
  .doc-badge.leaked-name { background: lime; }
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
EXIT=0

=== R-x5: @container оборачивает голый bare-селектор в showcase ===
вставка в showcase/components.css:
  @container (min-width: 100px) {
    button, input, a { border: 4px solid magenta !important; }
  }
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
EXIT=0
```

Контроль — тот же bare-селектор без `@container` ловится как раньше:

```
=== контроль: button, input, a {...} напрямую в showcase/components.css ===
Оболочка витрины и продуктовый слой смешались (3) — METHOD §6.2:
  showcase\components.css: селектор без класса витрины doc- — a
  showcase\components.css: селектор без класса витрины doc- — button
  showcase\components.css: селектор без класса витрины doc- — input
EXIT=1
```

Разница между двумя пробами показывает, что дыра — не в разборе селекторов
(он работает верно, что доказывает контроль), а в двух местах: (1) критерий
«хотя бы один класс с `doc-`» вместо «каждый класс с `doc-`» в `selectorLeaks`
и (2) список at-rules для рекурсии в `forEachRule` конечный и без `@container`
(и любого будущего at-rule) целиком пропускает вложенное содержимое.

## Регрессия — контрольные пробы review-1 (копия, после правки)

```
R-d: .doc-leak в ui/tokens.css внутри @media — EXIT=1 (как и было)
R-f: var(--doc-bg) в ui/tokens.css — EXIT=1 (как и было)
R-j: .hover\:leak без префикса в showcase/components.css — EXIT=1 (как и было)
[data-leak="1"] без класса в showcase/components.css — EXIT=1 (как и было)
```

## Дословное воспроизведение обеих «дыр» validate-components.mjs (копия)

```
Сценарий A (дыра 1) — id="c-badge" только текстом внутри <pre>,
живой секции нет (badge: status=complete, showcaseAnchor="c-badge"):
- badge: showcase anchor not found: c-badge
код возврата (среди прочих ошибок записи, не связанных с этой правкой): 1

Сценарий B (дыра 2 / находка 2) — badge: status=complete, showcaseAnchor=null:
- badge: non-planned component must have showcaseAnchor
код возврата: 1
```

## Контраст `--doc-ink-3` — независимый расчёт WCAG

```
#666d73 на #ffffff (canvas) : 5.250
#666d73 на #fafbfc (panel)  : 5.067
#666d73 на #f2f3f5 (bg)     : 4.729
```

Все три ≥ 4.5:1 (порог для текста мельче 18px/24px normal). Подтверждено и
`getComputedStyle` в браузере на реальных элементах 11–12.5px
(`.doc-nav__foot`, `.doc-section__num`, `.doc-variant__label`, `.doc-slot`,
`.doc-empty`) — везде `rgb(102, 109, 115)`.

## Побочный эффект на `manifest.json`

```
$ git diff 5f07041 -- components/manifest.json
(пусто — файл идентичен версии, принятой R0-03)

$ git show --stat 75f8a0b | grep manifest
(нет строки — коммит R0-06 файл не трогал)
```

## Уровни заголовков — обход DOM в браузере (chromium msedge, 1440)

```
H1  Витрина компонентов Хабр Курсов
H2  О витрине
H3  Оболочка отделена от продукта
H3  Чего эта витрина сегодня не проверяет
H2  Условные обозначения
H2  Форма секции компонента
H3  Имя варианта
H3  Что делает шаг, который кладёт сюда компонент
H2  Компоненты
H3  Показ данных / Действия / Формы / Навигация / Наборы / Раскладка внутри
    страницы / Обратная связь / Поверх страницы / Оболочка страницы /
    Сущности продукта (девять h3-категорий)
SKIPS: []
```

Шаблон в `<pre>` (текстом, строки 218-238): `.doc-category` → `<h3>` (уже на
странице) → `<h4>CanonicalName</h4>` секции → `<h5>Имя варианта</h5>`
специмена — без пропуска.

## Responsive — 320 / 768 / 1024 / 1400 (playwright, chromium msedge)

```
width=320   scrollWidth=320  clientWidth=320  overflow: только .doc-code (overflow-x:auto по дизайну)
width=768   scrollWidth=768  clientWidth=768  overflow: нет
width=1024  scrollWidth=1024 clientWidth=1024 overflow: нет
width=1400  scrollWidth=1400 clientWidth=1400 overflow: нет
консоль на всех четырёх: пусто
```

Новый скриншот — `.pipeline/R0-06/review-2-320.png` (320 не было на диске;
1400/1440 не переснимал — `showcase-1440.png` уже есть и актуален, вёрстка на
этой ширине фиксом не менялась).

---

## Что делать дальше

Находка 1 — одна правка в `tools/validate-classes.mjs`: `selectorLeaks` должен
требовать, чтобы **все** классы в отдельном компонентном селекторе (не
файле, не всём списке через запятую — это уже устранено, а именно в
элементе селектора между `>`/`+`/`~`/пробелом и в компаунде через точку)
несли `doc-`, а не «хотя бы один», плюс `forEachRule` должен рекурсировать в
любое `@`-правило с телом-набором обычных правил, а не в статический список
трёх имён (например, разбирать тело всегда, кроме явно исключённых
`@font-face`/`@keyframes`/`@page`/`@property`, а не наоборот). Обе точки —
рядом, `tools/validate-classes.mjs:124` и `:166-178`.

Остальное (майор 1-2, минор 3-7 review-1, обе дыры вне границ) закрыто по
существу и не требует повторной работы — следующая итерация может опираться
на раздел «Что проверено и претензий нет» выше и не перепроверять их заново.
