# Приёмка R1-01 — `components/STATES.md`, `requiredStates` в `manifest.json`

Дата: 9 сентября 2026.
Вердикт: **ПРИНЯТО**.

Одна итерация ревью: `review-1.md` — «принять с замечаниями», 0 blocker,
0 major, 2 minor, 0 note. Обе minor-находки закрыты точечной правкой текста
на приёмке (решения шага не менялись, только опорные формулировки) —
так и было предписано заданием на приёмку, новой итерации ревью не требовалось.

---

## Гейты

Каждый прогнан заново этой приёмкой, не принят по отчёту `capture.md`
или `review-1.md`.

| # | Гейт | Результат |
|---|---|---|
| 1 | Валидатор | **зелёный**, код 0 |
| 2 | Браузерные проверки | **неприменим**: скрипта `"test"` в `package.json` пакета по-прежнему нет (X-01 не закрыт) |
| 3 | Ревью закрыто | **зелёный**: `review-1.md` — 0 blocker, 0 major, 2 minor; обе minor закрыты правками на приёмке (см. «Закрытие находок» ниже) |
| 4 | Реестр сходится | **зелёный**: `requiredStates` заполнены у всех 55 записей `manifest.json`; `requiredStatesMatrix.status: "done"` с `ref: "components/STATES.md"`; `STATES.md` не входит в `manifest.json` как отдельная запись — это словарь пакета, не компонент, ссылается на реестр, а не наоборот |
| 5 | Evidence на месте | **зелёный**: все утверждения `STATES.md` опираются на уже снятый `evidence/source/production/pages/*/dom.html` (10 файлов, R0-00) — пересъёмки не потребовалось и не делалось |
| 6 | Копируемость | **неприменим**: шаг не добавляет разметку, только словарь и разметку `requiredStates` |
| 7 | Exit criteria волны | **не проверялись по указанию** задания: R1-02 ещё открыт, волна R1 не закрывается этим шагом |
| 8 | Честность статуса | **зелёный**: `STATES.md` явно различает «применимо по природе» и «снято в проде» (вступление + §4.1); GAP-состояния (`Select.open`, `LinkGrid.expanded/collapsed`, `CardGrid.empty`) названы прямым текстом с адресом, не выданы за наблюдение |
| 9 | Две проекции | **неприменим**: `machine/` не заводит этот шаг, `validate-machine.mjs` в пакете ещё нет (волна R8) |
| 10 | Правила доказаны | **неприменим**: шаг правил не заводит |
| 11 | Страница из принятого | **неприменим**: шаг страниц не заводит |

### 1 — валидатор

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (1) — предмета ещё нет:
- спецификации — 55 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — инвентаризация записала один ключ и FilterChip, и Tab: либо это один component set, либо ошибка переноса. Разводится на R3-04 и R3-13
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
КОД ВОЗВРАТА: 0
```

Строка «Отложено» про `requiredStates» пропала по сравнению с состоянием
до шага (была вторая строка «матрицы обязательных состояний ещё нет»,
см. `.pipeline/R0-05/accept.md`) — прямое подтверждение, что поле
действительно заполнено, а не просто не проверяется валидатором.

### 2 — заявленные числа

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

### 3 — синтаксис инструментов

```
$ node --check tools/*.mjs
(без вывода по каждому файлу — capture.mjs, measure-selectors.mjs, serve.mjs,
validate-classes.mjs, validate-classes.selftest.mjs, validate-components.mjs,
validate-counts.mjs — все синтаксически валидны)
КОД ВОЗВРАТА: 0
```

---

## Закрытие находок ревью

| # | Severity | Находка | Закрытие |
|---|---|---|---|
| 1 | minor | `STATES.md:264` (`avatar-stack`) не давал явного «не включено, потому что…» для `empty`, хотя капча это обещала | Строка `avatar-stack` дополнена: `empty` не открыт ни по N7 (состав фиксирован — три аватара + CounterPill по `notes`, не список переменной длины от фильтрации, как у `CardGrid`), ни по N8 (подстановка вместо данных — факт дочерней записи `Avatar`, не самой обёртки). Решение (`requiredStates: ["default"]`) не изменилось |
| 2 | minor | Долг-заметка `capture.md` про `LinkGrid` утверждала «кнопки раскрытия в DOM нет» — неверно | Перепроверено лично по `evidence/source/production/pages/{courses-listing,education-centers-listing,promocodes}/dom.html`: `max-h-[94px]` — 5 вхождений (1+2+2), в каждом сразу следует `<button type="button" class="mt-4 … text-ui-blue-500 …">Смотреть все</button>` в той же секции; `aria-expanded` — 0 вхождений во всех 10 `dom.html`. Текст `capture.md` переписан на точную формулировку («кнопка есть, 5 вхождений, `aria-expanded` не объявлен, 0 вхождений»). Решение шага (`requiredStates` `LinkGrid` включает `expanded`/`collapsed` по доверию `manifest.json` → `notes`) не изменилось |

Оба закрытия — точечная правка текста, объём шага не расширен: `manifest.json`
не тронут находками, `STATES.md` и `capture.md` изменены только в названных
местах.

---

## Проверка по границам задания

- `career/`, `_sources/` не открывались и не менялись на приёмке.
- `git status --short` перед коммитом показывает посторонние незакоммиченные
  изменения в `landings/` — не наши, не тронуты.
- Изменения этой приёмки confined к: `components/STATES.md`,
  `components/manifest.json` (не менялся приёмкой — правки были внесены
  до приёмки, при исполнении шага), `.pipeline/R1-01/`, `ROADMAP.md`,
  `CHANGELOG.md`.

---

## Обновлено

- `ROADMAP.md` — статус R1-01 → `done`, добавлен раздел «Результат R1-01»,
  обновлены «Дата сводки», «Принято шагов», «Компонентов в manifest» в
  таблице «Где пакет сейчас».
- `CHANGELOG.md` — запись в `## Unreleased`.
- `.pipeline/R1-01/accept.md` — этот файл.

Exit criteria волны R1 не проверялись по прямому указанию задания: открыт
ещё один шаг волны, R1-02. Волна R1 **не закрыта**.
