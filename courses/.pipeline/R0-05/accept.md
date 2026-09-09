# Приёмка R0-05 — `components/manifest.json`, `INDEX.md`, `SPEC-TEMPLATE.md`

Дата: 8 сентября 2026.
Вердикт: **ПРИНЯТО**.

Четыре итерации ревью: `review-1.md` (6 major) → `fix-1.md`, `review-2.md`
(2 major) → `fix-2.md`, `review-3.md` (4 major) → `fix-3.md`, `review-4.md` —
«принять с замечаниями», 0 blocker · 1 major · 3 minor · 4 note.

Единственный major четвёртой итерации закрыт **правкой на приёмке**, а не
возвратом: так рекомендовал ревьюер (затронуты две записи в статусе `planned`
и один буллет, новой итерации ревью не требуется), и с этим согласился
пользователь. Что именно исправлено — ниже, раздел «Правка major».

---

## Гейты

Каждый прогнан приёмкой заново, а не принят по отчёту шага. Выдача вставлена
копированием из терминала вместе с кодом возврата (X-41).

| # | Гейт | Результат |
|---|---|---|
| 1 | Валидатор | **зелёный**, код 0 — 55 записей, три «Отложено» и три «Объявлено» названы поимённо |
| 2 | Браузерные проверки | **неприменим**: скрипта `npm test` в пакете нет — снят на R0-01 как ложное обещание, возвращается вместе со smoke-спеком витрины (X-01, зависит от R0-06). `npm test` даёт `Missing script: "test"` |
| 3 | Ревью закрыто | **зелёный**: review-1 — 22 находки, fix-1 закрыл 20 и перенёс 2; review-2 — 13, fix-2 закрыл 12 и перенёс 1; review-3 — 18, fix-3 закрыл 17 и перенёс 1; review-4 — 8, major закрыт этой приёмкой, 3 minor и 4 note ушли строками X-49…X-55 |
| 4 | Реестр сходится | **зелёный по предмету, который есть**: 55 записей, `specPath`, `cssRoots` и `showcaseAnchor` пусты у всех — статус `planned`, спецификаций и витрины пакет ещё не завёл. Валидатор печатает это блоком «Отложено» с именами заводящих шагов (R0-06, R1-01, R2), а не молчит |
| 5 | Evidence на месте | **зелёный**: 44 производственные записи измерены браузером по десяти `evidence/source/production/pages/*/dom.html`; измерение лежит в `components/selector-census.json` с отпечатками разметки и подписью прогона. Записи `figma-only` несут `nodeId` или `componentKey` — правило проверяется валидатором |
| 6 | Копируемость | **неприменим**: спецификаций ноль, `ui/components/*.css` содержат только заголовки секций. Проверять нечего, и валидатор говорит это строкой |
| 7 | Exit criteria волны | **не проверялись** по указанию: волна R0 не закрыта, принято 4 шага из 7, впереди R0-03, R0-04, R0-06 |
| 8 | Честность статуса | **зелёный**: `complete` — 0, `partial` — 0, `planned` — 55. Ни одна запись не заявляет покрытия, которого нет; границы реестра названы отдельным разделом `INDEX.md` |
| 9 | Две проекции | **неприменим**: `machine/` пуст (только `.gitkeep`), `tools/validate-machine.mjs` в пакете нет — машинный слой заводит волна R8. Шаг машинную проекцию не трогал |
| 10 | Правила доказаны | **неприменим**: шаг правил не заводит |
| 11 | Страница из принятого | **неприменим**: шаг страниц не заводит |

### 1 — реестр

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (3) — предмета ещё нет:
- showcase/components.html — витрины ещё нет (R0-06); якорей не проверено: 0 объявлено из 55
- requiredStates — матрицы обязательных состояний ещё нет (R1-01); у 55 записей список пуст
- спецификации — 55 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — инвентаризация записала один ключ и FilterChip, и Tab: либо это один component set, либо ошибка переноса. Разводится на R3-04 и R3-13
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
КОД ВОЗВРАТА: 0
```

### Заявленные числа

```
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
КОД ВОЗВРАТА: 0
```

Прогон сделан **после** всех правок приёмки — правок в `ROADMAP.md`,
`CHANGELOG.md`, `INDEX.md` и `manifest.json`.

### Классы разметки

```
$ node tools/validate-classes.mjs
Витрин ещё нет. Проверять пока нечего.
  showcase/components.html — заводит шаг R0-06
  showcase/pages.html — заводит шаг R6
КОД ВОЗВРАТА: 2
```

Код 2 — объявленная ветка «предмета нет» (`tools/validate-classes.mjs:40,45`),
а не падение. До R0-06 это ожидаемое поведение; ветка этим шагом не менялась.

### Инструменты разбираются

```
$ for f in tools/*.mjs; do node --check "$f"; done
-- tools/capture.mjs rc=0
-- tools/measure-selectors.mjs rc=0
-- tools/serve.mjs rc=0
-- tools/validate-classes.mjs rc=0
-- tools/validate-components.mjs rc=0
-- tools/validate-counts.mjs rc=0
КОД ВОЗВРАТА: 0
```

### Обязательная пара: перемер, затем сверка

Шаг трогал селекторы, `occurrences` и `seenOn`, поэтому гоняется пара —
сначала перемер **без флага**, затем сверка.

```
$ node tools/measure-selectors.mjs
 =  sprite-icon            заявлено  611/10  измерено  611/10
 =  social-icon            заявлено   60/10  измерено   60/10
 =  project-icon           заявлено   80/10  измерено   80/10
 =  avatar                 заявлено   54/ 6  измерено   54/ 6
 =  entity-logo            заявлено   48/ 3  измерено   48/ 3
 =  chip                   заявлено  239/ 7  измерено  239/ 7
 =  badge                  заявлено   87/ 7  измерено   87/ 7
 =  rating-badge           заявлено   62/ 7  измерено   62/ 7
 =  meta-pill              заявлено   96/ 7  измерено   96/ 7
 =  counter-pill           заявлено   28/ 2  измерено   28/ 2
 =  avatar-stack           заявлено   28/ 2  измерено   28/ 2
 =  prose                  заявлено   46/ 4  измерено   46/ 4
 =  button                 заявлено  191/ 9  измерено  191/ 9
 =  icon-button            заявлено   32/ 7  измерено   32/ 7
 =  link                   заявлено  867/10  измерено  867/10
 =  filter-chip            заявлено  107/ 5  измерено  107/ 5
 =  segmented-control      заявлено    4/ 4  измерено    4/ 4
 =  select                 заявлено   28/ 5  измерено   28/ 5
 =  search-input           заявлено    1/ 1  измерено    1/ 1
 =  site-header            заявлено   10/10  измерено   10/10
 =  header-dropdown        заявлено   10/10  измерено   10/10
 =  rubrication-bar        заявлено    1/ 1  измерено    1/ 1
 =  site-footer            заявлено   10/10  измерено   10/10
 =  page-hero              заявлено    9/ 8  измерено    9/ 8
 =  search-form            заявлено    5/ 5  измерено    5/ 5
 =  section                заявлено   15/ 7  измерено   15/ 7
 =  card-grid              заявлено    8/ 6  измерено    8/ 6
 =  carousel               заявлено   16/ 7  измерено   16/ 7
 =  link-grid              заявлено    5/ 3  измерено    5/ 3
 =  filter-bar             заявлено    5/ 5  измерено    5/ 5
 =  ad-slot                заявлено    5/ 4  измерено    5/ 4
 =  course-card            заявлено   96/ 7  измерено   96/ 7
 =  school-card            заявлено   48/ 3  измерено   48/ 3
 =  promo-card             заявлено   20/ 1  измерено   20/ 1
 =  review-card            заявлено   20/ 3  измерено   20/ 3
 =  article-card           заявлено   32/ 4  измерено   32/ 4
 =  person-card            заявлено   30/ 2  измерено   30/ 2
 =  step-card              заявлено    8/ 2  измерено    8/ 2
 =  ad-card                заявлено   52/ 4  измерено   52/ 4
 =  rating-table           заявлено    2/ 2  измерено    2/ 2
 =  numbered-course-item   заявлено    9/ 1  измерено    9/ 1
 =  entity-header          заявлено    1/ 1  измерено    1/ 1
 =  person-header          заявлено    1/ 1  измерено    1/ 1
 =  info-table             заявлено    1/ 1  измерено    1/ 1

Измерено селекторов 44 по 10 страницам; расходятся с манифестом 0.

Перепись записана: components\selector-census.json
КОД ВОЗВРАТА: 0

$ node tools/validate-components.mjs --strict
Manifest structure is valid.
КОД ВОЗВРАТА: 0
```

**Почему эта пара, а не `--check`.** Приёмка не поверила отчёту и прогнала
`.pipeline/R0-05/red-3-pair.mjs` — красный тест на копии пакета:

```
Согласованная подделка: manifest badge occurrences 87 → 8700, перепись переписана в ту же сторону, seenOn не тронут.

1. validate-components --strict в одиночку: код 0 (НЕ поймал — согласованность подделки)
2. measure-selectors без флага: код 1
   !  badge                  заявлено 8700/ 7  измерено   87/ 7
   =  rating-badge           заявлено   62/ 7  измерено   62/ 7
   Измерено селекторов 44 по 10 страницам; расходятся с манифестом 1
3. validate-components --strict после перемера: код 1
   - badge: occurrences 8700 ≠ measured 87

Пакет не изменён: sha256 манифеста и переписи совпали.
```

Валидатор в одиночку сверяет реестр с **переписью**, а не с разметкой:
согласованная правка числа в обоих файлах проходит у него зелёным. Настоящим
число делает только запись нового измерения в браузере. Последовательность
внесена в `ROADMAP.md` разделом **«Чеклист приёмки шага»**, чтобы следующие
шаги её прогоняли, и уже была описана в `INDEX.md` → «Проверки»
и `tools/README.md`.

Приёмка проверила и обратное направление — что защита не держится на одном
типе подделки: собственная подделка `button.occurrences` 191 → 177,
внесённая одинаково в манифест и в перепись, ловится и одиночным `--check`
(код 1), потому что он перемеряет по разметке. Не ловится ею именно
`validate-components` без перемера — это и закрывает пара. Файлы пакета
после теста восстановлены из копии, md5 сошлись.

---

## Правка major на приёмке

**Находка 1 review-4.** Утверждение «поля поиска в шапке в снятой разметке
нет» неверно.

Проверено своим счётом, не чтением отчёта:

```
$ for d in evidence/source/production/pages/*/; do grep -o 'v-popper--theme-dropdown' "$d/dom.html" | wc -l; done
author: 0 · authors: 0 · courses-listing: 1 · editors: 0 · education-center: 0
education-centers-listing: 6 · promocodes: 6 · rating: 6 · reviews: 4 · schools-for-children: 6
```

Всего **29**. Из них 28 — улов `select` на пяти страницах
(`education-centers-listing` 6 + `promocodes` 6 + `rating` 6 + `reviews` 4 +
`schools-for-children` 6), и это ровно `select.occurrences` и `select.seenOn`.
Двадцать девятый — на `courses-listing`, и его не считает никто.

```
$ grep -c 'wrapper--with-search' evidence/source/production/pages/courses-listing/dom.html      → 1
$ grep -o 'placeholder="Искать на Хабр Курсах"' …/courses-listing/dom.html | wc -l             → 1
$ grep -rlo 'Искать на Хабр Курсах' evidence/source/production/pages/*/dom.html                 → только courses-listing
```

Разметка вскрыта поимённо. Внутри `#courses-filter-search-top-panel` лежат
**два** соседних узла: заглушка
`div.courses-filter-search-top-panel-placeholder[aria-hidden="true"]` с двумя
блоками `h-10 rounded-xl` — и рядом `div.mx-5 flex …` с отрисованным полем:

```
DIV#courses-filter-search-top-panel
  DIV.courses-filter-search-top-panel-placeholder[aria-hidden]   ← сюда смотрит селектор записи
  DIV.mx-5.flex.min-w-0.items-center.gap-2
    DIV.min-w-0.flex-1 > DIV.w-full
      DIV.v-popper.v-popper--theme-dropdown
        DIV.relative > DIV > DIV.wrapper.relative.wrapper--with-search
          SPAN.align-center.flex.gap-x-1.border.bg-ui-white.px-3…
            INPUT[placeholder="Искать на Хабр Курсах"].min-h-[38px].h-[38px]
          SVG.svg-icon … #search
```

То есть поле **снято**, и досъёмка с увеличенным `--wait` для R3-08 не нужна —
нужен другой селектор. Метод дал ровно одного кандидата, и его отвергли фразой
«селектами не являются» без единого числа; при этом `INDEX.md` строкой 135 сам
регистрирует `wrapper--with-search` как собственный класс продукта — «модификатор
обёртки шапки на `/courses`, 1 вхождение». Разметка была посчитана, и рядом
сказано, что её нет.

Исправлено в трёх местах, где стояло утверждение, плюс в четвёртом, где оно
стояло другими словами:

| Где | Было | Стало |
|---|---|---|
| `components/INDEX.md`, «Границы реестра» | «селектор адресует заглушку … самого поля в снятой разметке нет» | селектор адресует заглушку, поле лежит соседним узлом; приведено дерево, приведён счёт 29 = 28 + 1 |
| `components/manifest.json` → `search-input.notes` | «приходит заглушкой и гидрируется JS. Снимать отдельным capture с увеличенным `--wait`, иначе элемент останется GAP» | поле есть в снятой разметке соседним узлом; досъёмка не нужна, на R3-08 переписывается селектор |
| `components/manifest.json` → `search-input.productionEvidence[0].note` | «в SSR-разметке только заглушка» — то же утверждение другими словами | селектор адресует заглушку (`aria-hidden`), отрисованное поле лежит рядом и селектором не покрыто |
| `.pipeline/R0-05/capture.md`, «Аудит-3», проба 3 | «Селектами не являются; запись не недобирает» | две обёртки таблицы рейтинга — действительно не селекты, 28 остаётся верным; третий узел — отрисованное поле шапки, прежний вывод сделан без счёта и в части «не является» неверен |

Что **не** менялось: `select.occurrences` = 28 и `select.seenOn` из пяти
страниц остаются верными — двадцать девятый узел не `Select`, а `SearchInput`.
Ни одно число реестра правкой не тронуто, что подтверждено перемером выше
(расходятся с манифестом 0).

Строка `ROADMAP.md` шага R3-08 переписана с «снять интерактивно» на
«переписать селектор» — иначе следующий шаг пошёл бы делать досъёмку.

**Процессная строка X-48.** Это четвёртое за сессию ложное утверждение вида
«в источнике этого нет». Заведено правилом: отрицательное утверждение об
источнике попадает в пакет только с числом — счётом узлов по evidence,
а не рассуждением. Адресаты — `guide-build`, `guide-fix`, `guide-review`.

---

## Остальные находки review-4 — строками долга

| Находка | Severity | Строка |
|---|---|---|
| 2 — класс `chip` записан без `_`, на 768/375 часть меток несёт `max-w-full` | minor | X-49, чинится на R2-06 |
| 3 — правило `figmaEvidence` оставило три строки того же вида (`chip`, `text-input`, `tab`) | minor | X-50, чинится на R2-06, R3-09, R3-13 |
| 4 — `INDEX.md:471` и `:156` написаны мимо якорей `validate-counts` | minor | X-51 |
| 5 — «19 строк» вместо 31 в `fix-3.md` | note | X-52 |
| 6 — `validate-components` падает стеком `ENOENT` без `ui/` | note | X-53 |
| 7 — правило шапки не закрывает пять полей и описание `allowedSourceScopes` | note | X-54 |
| 8 — имя `Badge` шире измеренного (`course-discount`, 87/87) | note | X-55 |

Ни одна из семи не меняет утверждений пакета о продукте и не размножается
на 55 записей — поэтому строка, а не возврат.

Строки долга самого шага (`capture.md` → «Строки долга для `ROADMAP.md`»)
внесены как X-56…X-70; зачёркнутые в `capture.md` — то, что шаг закрыл сам, —
не вносились. Приёмка добавила X-71: таблицы шагов `ROADMAP.md` держат числа
вхождений из инвентаризации, а реестр — измеренные, и они разошлись (`R3-04`:
«112 вхождений» против измеренных 107/5).

---

## Что обновлено

- `courses/ROADMAP.md` — R0-05 → `done`; раздел «Результат R0-05»; сводка
  «Где пакет сейчас» (принято 4 шага; «Компонентов в manifest — 0» заменено
  на 55 записей и 0 спецификаций; `validate-counts` сторожит 28 чисел, а не 21);
  новый раздел «Чеклист приёмки шага» с обязательной парой; строка R3-08;
  24 строки долга X-48…X-71.
- `courses/CHANGELOG.md` — записи о шаге в `## Unreleased`, «Добавлено»
  и «Исправлено».
- `courses/components/INDEX.md`, `courses/components/manifest.json`,
  `courses/.pipeline/R0-05/capture.md` — правка major.
- `courses/.pipeline/R0-05/accept.md` — этот файл.

## Состав коммита

Параллельно шёл шаг R0-03, и его пути в индекс не брались: `ui/foundations.css`,
`ui/fonts.css`, `ui/courses.css`, `ui/assets/fonts/`, `docs/guide/typography.md`,
`docs/guide/tokens.md`, `README.md`, `evidence/source/production/css/`,
`.pipeline/R0-03/`.

`tools/README.md` правили оба шага, поэтому он сверялся содержимым, а не именем:
весь его незакоммиченный дифф (24 вставки, 7 удалений) лежит в разделе
«Измерение селекторов» и описывает `measure-selectors.mjs`,
`selector-census.json` и коды возврата — работа R0-05. Строк про типографику,
шрифты и `foundations.css` в диффе нет. Файл взят.

Взято в коммит:

- `courses/components/` — `manifest.json`, `INDEX.md`, `SPEC-TEMPLATE.md`,
  `selector-census.json`
- `courses/tools/` — `measure-selectors.mjs`, `validate-components.mjs`,
  `validate-counts.mjs`, `validate-classes.mjs`, `README.md`
- `courses/package.json` — скрипт `measure:selectors`
- `courses/.pipeline/R0-05/`
- `courses/ROADMAP.md`, `courses/CHANGELOG.md`

`career/` и `_sources/` не трогались.

## Волна R0

Не закрыта: принято 4 шага из 7 — R0-00, R0-01, R0-02, R0-05. Открыты R0-03
(на доработке), R0-04, R0-06. Exit criteria волны по указанию не проверялись.
Релиз пакета не предлагается: пакет ещё не пригоден к работе — ни одного
свёрстанного элемента, витрины нет.
