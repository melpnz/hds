# Правки по review-1 — `components/manifest.json`, `INDEX.md`, `SPEC-TEMPLATE.md`

Итерация 1. Находок в отчёте: blocker 0 · major 6 · minor 10 · note 6 — всего 22.
Исправлено 20, отклонено 0, перенесено 2 (обе — в чужие файлы, вносит приёмка).

Подтверждённое ревью не переделывалось: разведение `status` / `sourceScope`,
иерархия METHOD §3 у `Checkbox`, `TileFilter`, `FilterModal`, замысел правила
`cssRoot`, сходимость `INDEX.md` ↔ `manifest.json` по 55 строкам, числа
доступности, порядок 22 разделов, закрытый словарь состояний, формулировка
раздела доступности, тон, границы шага.

## Находки

| # | Sev | Решение | Что сделано | Где |
|---|---|---|---|---|
| 1 | major | исправлено | Критерий «утилита против собственного класса» записан пятью шагами и исполняется скриптом; счёт закрыт целиком (111 + 72 + 16 + 283 + 16 + 2 = 500). `inline-separator` внесён в перечень: 66 токенов на 33 узлах, 4/10. Имён в таблице стало 16 — число и перечень сошлись. `align-center`, `text-semibold`, `font-inherit`, `z-1`/`z-2` названы поимённо как утилиты конфигурации продукта, `height-[11px]` отсекается шагом 2. `scrollbar-*` вынесены отдельной таблицей «происхождение не установлено» | `components/INDEX.md:69–145`, `.pipeline/R0-05/class-census.mjs` |
| 2 | major | исправлено | `storybook-only` убран из `allowedStatuses` и `statusDefinitions`; статусов пять, как в METHOD §5. `statusRule` переписан: `figma-only` — терминальный статус своей оси, `production` и `storybook-only` идут в `complete`/`partial`. Правило «`complete` требует `production`» снято — оно навсегда закрывало десяти записям путь к `complete`. Добавлено правило валидатора: `allowedStatuses` сверяется с METHOD §5 в обе стороны. Расширение контракта названо в `capture.md` разделом | `components/manifest.json`, `components/INDEX.md:20–50`, `tools/validate-components.mjs:74–86`, `.pipeline/R0-05/capture.md` |
| 3 | major | исправлено | `sprite-icon`: селектор `svg.svg-icon` — 611 узлов на 10/10 (прежний не разбирался браузером; 164 было счётом одной страницы при `seenOn` из десяти) | `components/manifest.json`, запись `sprite-icon` |
| 4 | major | исправлено | `filter-bar` → `div.flex.gap-1.overflow-x-auto.whitespace-nowrap` (5 узлов на тех же 5 страницах); `info-table` → `div.grid.grid-cols-2.gap-x-4.gap-y-3.text-small` (1/1). Тем же дефектом оказались ещё четыре селектора, адресовавших потомка или половину элемента: `segmented-control`, `section`, `button`, `select` — исправлены. Все 45 прогнаны в настоящем браузере по снятому DOM: **сходятся 45 из 45** | `components/manifest.json`, `.pipeline/R0-05/check-selectors.mjs` |
| 5 | major | исправлено | Легенда брейкпоинтов заменена таблицей из шести префиксов с их запросами и с пометкой, извлечено это из CSS сборки или выведено. `tablet:` и `desktop:` названы с прямым «запрос сборки не прочитан» — догадка по имени не пишется. Та же таблица в `manifest.json` → `breakpoints`, `coverage` на неё ссылается | `components/SPEC-TEMPLATE.md:233–259`, `components/manifest.json` → `breakpoints` |
| 6 | major | исправлено | Решение принято на форме: «Разметка» сохраняет утилиты продукта, копируемость несёт `ui/utilities.css` — правила ровно тех утилит, что встречаются в разметке спецификаций. Записано в `conventions.markupUtilities`, процитировано в `INDEX.md` и в разделе «Разметка» шаблона. Ложный совет про `known-missing-classes.json` убран и из шаблона, и из самого `validate-classes.mjs`: для своей разметки базовая линия не читается по замыслу, и советовать её — советовать обойти инвариант §6.1. Файл `ui/utilities.css` заводит R0-04 — строка долга | `components/manifest.json` → `conventions`, `components/INDEX.md:147–162`, `components/SPEC-TEMPLATE.md:275–297`, `tools/validate-classes.mjs:110–121` |
| 7 | minor | исправлено | `cssRoots` проверяется по замыслу правила: значение обязано либо равняться `crs-<id>`, либо стоять в `class="…"` снятого DOM, и в обоих случаях быть селектором в `ui/`. Комментарии из CSS вырезаются перед сверкой. `pipeline`, `doc-layout`, `svg` теперь красные | `tools/validate-components.mjs:34–41, 115–121, 373–390` |
| 8 | minor | исправлено | Обоснование в `capture.md` исправлено: валидатор self-alias не ловил, это было приписанное свойство инструмента. Заодно заведено правило — `legacy alias repeats canonicalName` | `.pipeline/R0-05/capture.md`, решение 3; `tools/validate-components.mjs:169–173` |
| 9 | minor | исправлено | `legacy-only` сделан достижимым: это единственный не-`planned` статус без `specPath`, и `specPath` при нём запрещён | `tools/validate-components.mjs:294–304`, `components/manifest.json` → `statusDefinitions` |
| 10 | minor | исправлено | Сверяется вся матрица `status` × `sourceScope`, а не два угла | `tools/validate-components.mjs:204–228` |
| 11 | minor | исправлено | Циклы зависимостей любой длины (обход в глубину), каждый цикл сообщается один раз | `tools/validate-components.mjs:404–428` |
| 12 | minor | исправлено | Зависимость с более поздним шагом — ошибка, если не объявлена в `manifest.knownStepInversions`; две существующие объявлены поимённо и печатаются в новом блоке «Объявлено» | `tools/validate-components.mjs:462–478`, `components/manifest.json` → `knownStepInversions` |
| 13 | minor | исправлено | `notes` записи `filter-modal` переписаны: они больше не спорят с `implementations` и с BRIEF §9 п. 5 | `components/manifest.json`, запись `filter-modal` |
| 14 | minor | исправлено | `occurrences` и `seenOn` определены как измерение записанного селектора по снятому DOM (`countingRule`) и пересчитаны прогоном. Расхождение `prose` 13 против 46 снято — теперь 46 в обоих файлах. Там, где селектор шире или уже элемента, это сказано в `productionEvidence[].note`, а не спрятано в разнице чисел. Заведены правила: целое ≥ 0; страница обязана существовать в `evidence/`; дублей нет; число и список страниц не противоречат друг другу; у не найденного в проде вхождений нет, у найденного — есть | `components/manifest.json` (все записи), `tools/validate-components.mjs:246–290` |
| 15 | minor | исправлено | Словарь запрещённых имён состояний читается из манифеста; второго списка нет. `disable` и `focus_select` потерь не дают — их нет в `allowedStates`, и они ловятся как unknown state | `tools/validate-components.mjs:91–96` |
| 16 | minor | исправлено | `componentKey` проверяется на уникальность; известное столкновение `9668fb89…` объявлено в `knownComponentKeyCollisions` и печатается в блоке «Объявлено», необъявленное — ошибка | `tools/validate-components.mjs:430–460`, `components/manifest.json` |
| 17 | note | исправлено | Манифест без ключа `components` даёт сообщение и код 2 вместо `TypeError` со стеком | `tools/validate-components.mjs:25–31` |
| 18 | note | исправлено | «Шестнадцать собственных классов» и «три годятся корневым классом» разведены как разные числа во всех трёх местах | `.pipeline/R0-05/capture.md`, решение 4 и «Что перепроверено» |
| 19 | note | исправлено | Формулировка «печатается всегда» приведена к коду: печатается при непустом списке | `.pipeline/R0-05/capture.md` |
| 20 | note | перенесено | `README.md` и `ROADMAP.md` устарели после шага. Файлы правит другой агент; обе строки уже лежат в «Строках долга» `capture.md`, вносит приёмка | — |
| 21 | note | исправлено | В раздел «Название и текст» добавлена оговорка об источнике: пишется только то, что видно в снятом; правила именования, которых из снимка не извлечь, идут в «Ограничения» | `components/SPEC-TEMPLATE.md:162–167` |
| 22 | note | исправлено | Пакетные числа доступности (31 · 4 · 368 · 29) убраны из скелета: раздел говорит про свой элемент, пакетный фон — в `manifest.accessibilityPolicy` и `INDEX.md` | `components/SPEC-TEMPLATE.md:261–274` |

## Красный прогон — заново, против замысла

Прежний набор бил по правилам, написанным в том же коммите, и потому ничего
не значил. Новый набор — 24 дефекта, каждый нацелен в свойство, которое реестр
обязан гарантировать, а не в написанный код. Прогон на копии пакета в служебной
папке (`components/`, `tools/`, `ui/`, снятые `dom.html`); сам пакет не менялся.

Включены все семь случаев из задачи на правки и все 14 дефектов ревьюера.

```
ловится   код 1  цикл зависимостей из двух узлов
            - chip: dependency cycle: chip → badge → chip
ловится   код 1  цикл зависимостей из трёх узлов
            - avatar: dependency cycle: avatar → chip → badge → avatar
ловится   код 1  partial при sourceScope figma-only
            - text-input: sourceScope figma-only cannot reach status partial; terminal status is figma-only
ловится   код 1  complete при sourceScope figma-only
            - text-input: sourceScope figma-only cannot reach status complete; terminal status is figma-only
ловится   код 1  figma-only при sourceScope production
            - chip: status figma-only requires sourceScope figma-only, got production
ловится   код 1  self-alias: запись ссылается на саму себя
            - multi-select: legacy alias repeats canonicalName: MultiSelect
ловится   код 1  дубль componentKey, не объявленный в манифесте
            - avatar / chip: componentKey is shared by several records: e636266b29599856efba14bfea791e254746381f
ловится   код 1  storybookNames не в PascalCase
            - button: storybook name must be PascalCase: base-button
ловится   код 1  мусор в occurrences: строка вместо числа
            - chip: occurrences must be a non-negative integer, got "много"
ловится   код 1  мусор в occurrences: отрицательное число
            - chip: occurrences must be a non-negative integer, got -5
ловится   код 1  мусор в seenOn: несуществующая страница
            - chip: seenOn names a page absent from evidence: vacancies
ловится   код 1  мусор в seenOn: дубль страницы
            - chip: duplicate page in seenOn: courses-listing
ловится   код 1  occurrences против пустого seenOn
            - chip: occurrences 239 contradicts seenOn (0 pages)
ловится   код 1  вхождения у элемента, не найденного в проде
            - checkbox: sourceScope storybook-only means the element was not found in production, but occurrences/seenOn are non-empty
ловится   код 1  cssRoots принимает текст комментария
            - chip: CSS root is neither a class from the captured DOM nor crs-chip: pipeline
ловится   код 1  cssRoots принимает класс витрины
            - chip: CSS root is neither a class from the captured DOM nor crs-chip: doc-layout
ловится   код 1  cssRoots принимает подстроку чужого класса
            - chip: CSS root is neither a class from the captured DOM nor crs-chip: svg
ловится   код 1  cssRoots принимает имя, которого нет ни в DOM, ни как crs-<id>
            - chip: CSS root is neither a class from the captured DOM nor crs-chip: crs-badge
ловится   код 1  зависимость на более поздний шаг, не объявленная
            - avatar: depends on a later step: avatar (R2-04) → filter-modal (R4-12)
ловится   код 1  дубль зависимости
            - filter-modal: duplicate dependency: button
ловится   код 1  legacy-only со спецификацией — против собственного определения
            - switch: legacy-only component must not have specPath
ловится   код 2  манифест без ключа components
ловится   код 1  манифест без словаря forbiddenStateNames
            - manifest: нет forbiddenStateNames — словарь запрещённых имён состояний обязателен
ловится   код 1  статус вне METHOD §5 — шестой статус вернулся
            - manifest: allowedStatuses расширяет METHOD §5: storybook-only

Дефектов 24; поймано 24, пропущено 0.
```

Чего этот набор всё ещё не проверяет и чем это закрывается: сходимость с
витриной (её нет — R0-06), покрытие обязательных состояний (матрицы нет —
R1-01), совпадение текста спецификации с реестром (спецификаций нет — R2-01),
и правильность самих селекторов как утверждений об элементе — её держит
не валидатор, а прогон `check-selectors.mjs` в браузере, который сегодня
живёт в `.pipeline/`, а не в `tools/`. Последнее — строка долга.

## Прогон селекторов

Все 45 `productionEvidence` — настоящий браузер (playwright, канал msedge),
`querySelectorAll` по десяти `evidence/source/production/pages/*/dom.html`.

До правок: сошлись точно 26 из 45, один селектор не разбирался браузером.
После правок: **сошлись точно 45 из 45**, ошибок разбора нет.

## Изменённые файлы

- `components/manifest.json`
- `components/INDEX.md`
- `components/SPEC-TEMPLATE.md`
- `tools/validate-components.mjs`
- `tools/validate-classes.mjs`
- `.pipeline/R0-05/capture.md`
- `.pipeline/R0-05/check-selectors.mjs` — заведён
- `.pipeline/R0-05/class-census.mjs` — заведён
- `.pipeline/R0-05/fix-selectors.mjs` — заведён
- `.pipeline/R0-05/selectors.json` — заведён (вывод прогона)
- `.pipeline/R0-05/fix-1.md` — этот файл

Не трогалось: `ui/`, `docs/guide/tokens.md`, `tools/validate-counts.mjs`
(там идёт R0-02), `evidence/`, `.pipeline/R0-00/`, `.pipeline/capture-log.md`
(финальное ревью R0-00), `README.md`, `ROADMAP.md`, `career/`, `_sources/`.
Статус `done` не ставился. Figma не открывалась.

## Результат валидатора

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":45,"storybook-only":5,"figma-only":5}

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

```
$ node tools/validate-counts.mjs
Checked 21 documented counts against the package. All match.
  roadmapSteps: 76
  roadmapR0: 7
  elements: 55
  pages: 10
  unreachable: 8
  cssCategories: 10
  tokens: 51
  manifest: 55
  specs: 0
КОД ВОЗВРАТА: 0
```

```
$ node --check tools/capture.mjs tools/serve.mjs tools/validate-components.mjs \
        tools/validate-classes.mjs tools/validate-counts.mjs
КОД ВОЗВРАТА: 0
```

```
$ node .pipeline/R0-05/check-selectors.mjs
Селекторов 45; сошлись точно 45, разошлись 0.
КОД ВОЗВРАТА: 0
```

```
$ node .pipeline/R0-05/class-census.mjs
Уникальных имён классов на десяти страницах: 500
  утилита: 283
  вариант: 111
  произвольное значение: 72
  собственный класс: 16
  библиотека: 16
  происхождение не установлено: 2
  сумма: 500
КОД ВОЗВРАТА: 0
```

`node tools/validate-classes.mjs` без аргументов по-прежнему даёт код 2:
витрины нет до R0-06. На фрагменте разметки он красный и будет красным, пока
R0-04 не заведёт `ui/utilities.css`, — это состояние `ui/`, и так теперь
и сказано в шаблоне и в самом сообщении инструмента.

## Что ушло строками долга

Роадмап шаг не правит — строки лежат в `capture.md`, вносит приёмка. К десяти
прежним добавлено пять:

| Что |
|---|
| `ui/utilities.css` — правила утилит, встречающихся в разметке спецификаций; без него инвариант METHOD §6.1 не держится. Решение принято здесь, файл заводит R0-04, закрывает R2-01 |
| `inline-separator` (66 токенов на 33 узлах, 4/10) — третье по частоте собственное имя продукта, ни одной записи реестра не сопоставлено. Разобрать на R2-01 |
| `check-selectors.mjs` — сделать инструментом пакета и гейтом приёмки: сейчас числа реестра держатся протоколом шага, а не проверкой |
| `class-census.mjs` — перенести туда же вместе с критерием отбора классов |
| Запросы сборки для `tablet:` и `desktop:` не прочитаны (R0-00 читал четыре медиазапроса из девяти), при `desktop:hidden` на 10/10 и 95 вхождениях `tablet:`. Дочитать на R0-04 |

Уточнено в существующей строке: `scrollbar-container` стоит ровно на полосе
`FilterBar` — 5 узлов на тех же 5 страницах, что и сам FilterBar.
