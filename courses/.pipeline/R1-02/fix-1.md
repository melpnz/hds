# Правки по review-1 — снятость состояний (R1-02)

Отчёт: `.pipeline/R1-02/review-1.md`, вердикт «вернуть на доработку»,
0 blocker, 3 major, 2 minor (1 явно помечена, 1 выделена из общей
доп.-находки — см. ниже), 1 note. Трактовка exit criteria волны R1
(147 пар поимённо адресованы, не буквальное бинарное «снято или
дописано») ревьюером подтверждена и не пересматривается — правки ниже
касаются только содержательных ошибок в разметке и числах.

| # | Severity | Пункт | Решение | Что сделано | Где |
|---|---|---|---|---|---|
| 1 | major | A.1/C.11 — `Checkbox` неверно классифицирован | исправлено | Найдены и процитированы правила `.base-checkbox__input:checked+.base-checkbox__button{…}`, `.base-checkbox--disabled{opacity:.5}`, `.base-checkbox__wrapper--disabled{cursor:not-allowed}`, `.base-checkbox__input:focus+.base-checkbox__button{border-color:var(--color-ui-black-400)}` в `evidence/source/production/css/external/similar-courses.DqXT-MW0.css`. `checkbox.checked`/`checkbox.disabled` переведены `gap`→`captured-style`, `checkbox.focus-visible` — `gap`→`captured-mechanism` (реальный `:focus`, не `:focus-visible`, тот же приём смягчения, что у `select`/`multi-select`/`search-input` через `focus-within`). `checkbox.hover` и `checkbox.indeterminate` остаются `gap` — в этом чанке и во всём корпусе `evidence/source/production/css/` нет ни одного `:hover`/`:indeterminate`-правила для `.base-checkbox*`, проверено по всем 10 `inline/*.css` + 12 `external/*.css`. Проверено, не пропущен ли этот же чанк для других записей манифеста: `base-checkbox` встречается только в `similar-courses.DqXT-MW0.css`, и BEM-классы (`base-[a-z]+__`) в `storybookEvidence[].note` есть только у `checkbox` (собственная заметка и называет его «единственным BEM-компонентом» среди storybook-only записей) — пропуска по аналогии у других записей не найдено. При этом в том же чанке найдены классы `.header-catalog__icon-item--hidden` и Vue-переходы `.header-catalog-menu-*`, похожие на механику `CatalogMenu.open` (сейчас `gap`, `sourceScope: figma-only`) — не переклассифицировано (вне объёма находки 1, `CatalogMenu` не редактировался), задокументировано долгом. | `.pipeline/R1-02/decisions.json` (`checkbox`); `components/manifest.json` (`checkbox.capturedStates/uncapturedStates/notes`); `components/STATE-CAPTURE.md` §3.1 (5 строк checkbox переписаны на 5 отдельных решений), §4 (таблица нормативов — `Checkbox.*`→`Checkbox.indeterminate`), §6 (долг перезаписан: снят ложный пункт про Checkbox, добавлен пункт про `CatalogMenu`-долг); `.pipeline/R1-02/capture.md` (аналогичные правки в «Не удалось снять» и «Долг») |
| 2 | major | E.19 — headline-цифра арифметически неверна | исправлено | `24+20+3+3+1` действительно даёт 51, не 71 — арифметика была неверна независимо от находки 1. После применения находки 1 бакеты сами изменились (`captured-style` 24→26, `captured-mechanism` 3→4, `gap` 39→36), поэтому пересчитано заново по актуальным данным: `node -e "console.log(26+20+4+3+1)"` → **54**. Headline переписан на «54 из 92 пар (26+20+4+3+1) снято, 2 дописаны нормативом, 36 — явный GAP». Проверено `grep`-ом по обоим файлам — других мест с цифрой 71 не найдено (единственное оставшееся упоминание «71» — в новом пояснении о том, что раньше здесь была ошибка). | `components/STATE-CAPTURE.md:315→322` (§5, headline и разбор бакетов); `.pipeline/R1-02/capture.md:86-103` (код-блок и вывод «Метод разметки» п.3) |
| 3 | major | E.19 — противоречие 30 vs 32 узлов `outline-none` | исправлено | Ревьюер пересчитал независимо: 30 узлов (20 inline-компенсация `focus-visible:*` + 9 `focus-within:*` + 1 без компенсации, `HeaderDropdown`) — подтверждено повторно той же командой. Оба места с «32» (закрывающая фраза §2.1, разбор `HeaderDropdown` в §3.2) исправлены на 30, у обоих добавлено явное указание «пересчитано и исправлено по находке 3 review-1.md», ложная формулировка «проверено дважды разными командами… сходится» (`capture.md`, «Решения при конфликте источников») заменена на честное описание расхождения и его исправления. | `components/STATE-CAPTURE.md` §2.1 (стр. ~109), §3.2 (строка `header-dropdown.focus-visible`); `.pipeline/R1-02/capture.md` («Решения при конфликте источников», абзац про `outline-none`) |
| 4 | minor | доп. находка — команда `outline-none` этого шага не воспроизводится буквально (64 вместо 30 без `-h`) | исправлено | Обе копии команды (`§1` и `§2.1` `STATE-CAPTURE.md`) переведены с `grep -oE …/*/dom.html` на `grep -hoE …/*/dom.html` — с несколькими файлами-аргументами `grep` без `-h` печатает имя файла перед совпадением, и `sort -u` перестаёт схлопывать одинаковый узел с разных страниц (64 вместо 30). Число 30 не менялось — оно было верным и раньше, чинилась только воспроизводимость команды. | `components/STATE-CAPTURE.md` §1 (строка с `grep -hoE`), §2.1 (строка с `grep -hoE … \| sort -u \| wc -l`) |
| 5 | minor | доп. находка — та же проблема унаследована в `STATES.md:225` (`focus-visible:outline` 382 вместо 191, счёт подстроки без границы токена) | отклонено (не в объёме этого шага) + долг | `STATES.md` — файл R1-01, уже принят (`4fe1bf5`), read-only для этого шага по границам задания. Число 191, процитированное этим шагом как факт (§2.1), само по себе верно (совпадает с `occurrences` Button день в день) — правки числа не требуется, требуется только правка чужой команды, что не предмет R1-02. Зафиксировано отдельной строкой долга в обоих документах шага, не в `ROADMAP.md`. | `components/STATE-CAPTURE.md` §6 (новая строка долга); `.pipeline/R1-02/capture.md` («Долг», новая строка) |
| 6 | note | доп. находка — `components/INDEX.md` изменён, но не упомянут в «Файлы» `capture.md` | исправлено | Добавлена строка в раздел «Файлы» `capture.md`, описывающая шесть добавленных строк `INDEX.md` (документируют новые поля манифеста `capturedStates`/`normativeStates`/`uncapturedStates`), с явной пометкой, что пропуск был note-находкой review-1.md. | `.pipeline/R1-02/capture.md` («Файлы») |

## Что не менялось (подтверждено ревьюером, вне объёма правок)

Метод сбора (`measure-states.mjs`, реальные `productionEvidence[].selector`,
44/44 покрытие), единственный blocking-случай `focus-visible`
(`HeaderDropdown`), оба норматива `ui/state-contract.css`, конфликт
`Select` (прод `<input>` vs Storybook `<button role="combobox">`), долг
`filter-chip` (занижен `occurrences`, принят в R1-01), копируемость
METHOD §6.1, партиция `manifest.json` по всем 55 записям — не тронуты,
как и было указано в задании на правку.

## Изменённые файлы

- `components/STATE-CAPTURE.md` — переразметка `checkbox.*` в §3.1 (5
  строк вместо 1), правка таблицы нормативов §4, правка headline и
  бакетов §5 (71→54, разбивка 24+20+3+3+1→26+20+4+3+1), правка 32→30 в
  §2.1 и §3.2 с пояснением находки, воспроизводимость команд `grep -hoE`
  в §1 и §2.1, переписан пункт долга про Checkbox/TileFilter/Switch в
  §6, добавлены два новых пункта долга (CatalogMenu-CSS, унаследованная
  команда `focus-visible:outline`).
- `components/manifest.json` — запись `checkbox`: `capturedStates`
  (`default`+`focus-visible`+`checked`+`disabled`), `uncapturedStates`
  (`hover`+`indeterminate`), `notes` дополнен точным источником
  (файл+селекторы). Другие записи не тронуты.
- `.pipeline/R1-02/decisions.json` — `checkbox.checked`/`checkbox.disabled`
  `gap`→`captured-style`, `checkbox.focus-visible` `gap`→`captured-mechanism`.
- `.pipeline/R1-02/capture.md` — синхронные правки: код-блок и headline
  §«Метод разметки» п.3, список «Не удалось снять» (39→36, Checkbox
  вынесен из group «5 пар» в group «Checkbox.hover/indeterminate»),
  «Решения при конфликте источников» (30 vs 32, честная формулировка),
  «Долг» (переписан пункт Checkbox/TileFilter/Switch, добавлены пункты
  про CatalogMenu-CSS и унаследованную команду STATES.md), «Файлы»
  (добавлен `components/INDEX.md`).
- `.pipeline/R1-02/fix-1.md` — этот отчёт.

`ui/state-contract.css`, `ui/courses.css`, `ROADMAP.md`, `career/`,
`_sources/` не трогались.

## Результат валидатора

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

$ for f in tools/*.mjs; do node --check "$f" || echo "FAIL $f"; done
(без вывода — все файлы синтаксически валидны)
```

Числа и объявленное/отложенное в гейтах не изменились относительно
`capture.md` (ожидаемо: правки этой итерации не трогали `ROADMAP.md`,
`ui/tokens.css` и инвентаризацию, а `manifest.json` менялся только в
пределах уже существующих полей одной записи).

## Что ушло в roadmap отдельными строками

Ничего — по границам задания строки долга остаются в `capture.md` и
`STATE-CAPTURE.md` §6, не в `ROADMAP.md`. Обнаруженный новый долг
(CSS `CatalogMenu` в `similar-courses.DqXT-MW0.css`, невоспроизводимая
команда `STATES.md:225`) записан там же, адресован будущим шагам
(R4-13, R1-01/долг) — не блокирует эту итерацию.

## Готово к повторному ревью

Да. Все 3 major и обе выделенные minor-находки закрыты правкой
источника (не подгонкой чисел вручную — бакеты и суммы пересчитаны
скриптом `node -e` после каждой правки), note закрыта. Гейты проходят
дословно как в `capture.md`. Трактовка exit criteria не менялась.
