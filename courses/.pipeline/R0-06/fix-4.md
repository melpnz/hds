# Правки по review-4 — `tools/validate-classes.mjs` (постcss-механизм)

| # находки | Severity | Решение | Что сделано | Где |
|---|---|---|---|---|
| 1 | blocker | исправлено | Ключ кеша `parseCss` для инлайновых `<style>`-блоков дополнен порядковым номером блока в файле (`${file} <style>#${styleIndex}` вместо `${file} <style>`). Второй и следующий `<style>` в одном HTML-файле витрины теперь разбираются отдельно, а не получают закешированный результат первого. Индекс считается одинаково в обоих местах, что зовут `parseCss` для инлайн-стилей (сбор `defined` и поиск `leaks`), так что оба видят один и тот же блок под одним и тем же ярлыком. | `tools/validate-classes.mjs:129-147` (докстринг кеша), `:277-284` (сбор классов, `collectSelectorClasses`), `:315-324` (поиск протечек §6.2, `selectorLeaks`) |
| 2 | note | принято к сведению, без действия | Наблюдение про `.doc-item:not(.is-hidden)` подтверждено ревьюером как осознанное и задокументированное поведение (докстринг `tools/validate-classes.mjs:20-21`), не находка — правка не нужна | — |

## Изменённые файлы

- `tools/validate-classes.mjs` — ключ кеша `parseCss` для инлайновых `<style>` дополнен порядковым номером блока (`styleIndex`); добавлен абзац в комментарий над `parseCache`, объясняющий, почему подпись обязана быть уникальной на блок, а не на файл.
- `tools/validate-classes.selftest.mjs` — `fixture()` расширен параметром `inlineStyles` (массив содержимого нескольких `<style>`-блоков; старый параметр `inlineStyle` не тронут и работает как раньше для всех существующих проб). Добавлена проба `R-k (review-4, находка 1)`: два `<style>`-блока, первый чистый (`doc-first-block`), второй протекает (`second-block-leak-no-prefix`, без `doc-`). Проба живёт сразу после `R-a`, в блоке исторической регрессии.

## Методичный поиск того же класса ошибок (п. 3 задания)

Проверено явно, нет ли в `tools/validate-classes.mjs` других мест, где составной строковый ключ кеша/мемоизации неявно предполагает «один источник на файл»:

- В файле ровно одна структура кеширования — `parseCache` (`new Map()`, строка 134). Других `Map`/`Set`, используемых как мемоизация по составному ключу, нет.
- `parseCss` вызывается для трёх видов источников:
  - `ui/**/*.css` и `showcase/*.css` — реальные файлы на диске, ключ — путь файла (`file`). Один файл — ровно один вызов `parseCss` на файл в каждом из мест вызова (сбор `defined`, поиск leaks по `ui/`, поиск leaks по `showcase/*.css`); коллизий по построению нет, потому что путь файла и есть уникальный идентификатор источника.
  - инлайновые `<style>` в HTML витрины — единственное место, где один файл (`showcase/components.html`) может нести несколько независимых блоков CSS под одним и тем же именем файла. Это и был дефект находки 1 — теперь оба места (сбор `defined` и поиск `leaks`) метят блок номером по порядку.
- `used` (`new Map()`, строка 260) — не кеш разбора, а таблица «класс → файл, где он впервые встретился в разметке», используется только для текста сообщения об ошибке (какой файл назвать при неопределённом классе). Здесь «один файл на класс» — осознанный выбор для отчёта (первое вхождение), а не предположение о числе источников CSS; не тот класс ошибок.
- `defined` (`new Set()`, строка 254) — плоское множество имён классов без привязки к файлу-источнику вовсе, коллизий по конструкции быть не может.
- Проверены заодно (не в границах правки, но по слову «любой другой кеш» из задания) остальные файлы `tools/*.mjs`: `validate-components.mjs` использует несколько `Map` (`roadmapSteps`, `seenSteps`, `seenSelectors`, `aliases`, `pageUrls`, `dependencies`, `cycleState`, `keyOwners`, `stepOf`) — все ключуются по естественно уникальному идентификатору сущности (id шага, id компонента, селектор), а не по составному ярлыку вида `${file} <тип блока>`, который предполагает ровно один блок такого типа на файл. Ни один не воспроизводит инвариант «один на файл» для источника, которых по факту может быть несколько. `capture.mjs`, `measure-selectors.mjs`, `validate-counts.mjs`, `serve.mjs` кеш/мемоизацию не используют вовсе.

Вывод: в `tools/validate-classes.mjs` был ровно один такой инвариант, и он исправлен; других мест с тем же классом обхода в этом файле и в соседних инструментах пакета не найдено.

## Результат валидатора

```
$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

CSS не разобран настоящим парсером (1):

  ui\layout.css: CSS не разобран настоящим парсером — D:\work\guides\courses\ui\layout.css:193:23: Unknown word education-center

Это настоящий CSS-парсер (postcss), а не регэксп по тексту: файл, который
он не разбирает, дальше не проверяется вовсе — по нему нельзя ни подтвердить,
ни опровергнуть METHOD §6.1/§6.2, притворяться, что он «чист», нельзя.

EXIT=1
```

Совпадает дословно с `fix-3.md`/`review-4.md`: это X-80 (дефект в `ui/layout.css`,
разведён отдельной строкой роадмапа ещё на review-4, не в границах этого шага
и не в границах этой находки — файл не редактировался).

```
$ node tools/validate-classes.selftest.mjs
OK   R-a: инлайновый <style> витрины с протечкой
OK   R-k (review-4, находка 1): второй <style> в файле не теряется в кеше первого
OK   R-j: символьное экранирование внутри селектора без doc- (\:)
OK   bare-selector control: button, input, a
OK   атрибутный селектор без класса — протечка
OK   R-x1 (review-2): потомок .doc-specimen .card — не все классы doc-
OK   R-x2 (review-2): составной .doc-badge.leaked-name — не все классы doc-
OK   R-x5 (review-2): @container с bare-селекторами внутри
OK   T1 (fix-2): тройной составной .doc-badge.leaked-mid.doc-other
OK   T3 (fix-2): тройная вложенность @container > @media
OK   T5/контроль (fix-2): @import/@charset без тела не глотают следующий блок
OK   R-d: класс doc- в продуктовом слое (ui/)
OK   R-f: переменная --doc- используется в продуктовом слое (ui/)
OK   ESC-1 (review-3, находка 1а): hex-escape маскирует непрефиксованный класс в showcase
OK   ESC-2 (review-3, находка 1б): hex-escape маскирует doc-* класс в ui/
OK   ESC-3: hex-escape без пробела-разделителя перед не-hex символом
OK   ESC-4: символьное экранирование точки — класс несёт "doc", но не "doc-"
OK   ESC-5 (review-3, находка-note 3): легитимный doc-* класс через hex-escape — НЕ протечка
OK   Регрессия-контроль: чистый showcase (только doc-*) и чистый ui/
OK   NEW-1: строка со скобкой внутри значения атрибутного селектора
OK   NEW-2: @custom-media с именем --doc- в продуктовом слое
OK   NEW-3: ::part()/::slotted() без класса — протечка (bare-селектор)
OK   NEW-4: комментарий со скобкой внутри правила не путает границы блоков
OK   NEW-5: @import с параметром, похожим на блок ({ и ; внутри url-строки)
OK   NEW-6 (контроль): @keyframes с процентными селекторами — не ложная протечка
OK   NEW-7: @property с именем --doc- в продуктовом слое
OK   PARSE-ERROR: комментарий с преждевременным "*/" внутри (реальный дефект ui/layout.css)

Пройдено 27 из 27 проб.
EXIT=0
```

Перед фиксом (проверено на изолированной временной копии `tools/validate-classes.mjs`
с намеренно откаченным только этим фрагментом — без индекса блока в ключе —
запущено вне рабочего дерева, само рабочее дерево не изменялось): проба
`R-k` проваливалась ожидаемо — `код возврата 0, ожидался 1`, в выводе
`Checked 2 classes in 1 file(s) against 2 stylesheets. All defined.` вместо
находки про `.second-block-leak-no-prefix`. После фикса та же проба проходит.

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
EXIT=0
```

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
EXIT=0
```

```
$ node --check tools/*.mjs
OK tools/capture.mjs
OK tools/measure-selectors.mjs
OK tools/serve.mjs
OK tools/validate-classes.mjs
OK tools/validate-classes.selftest.mjs
OK tools/validate-components.mjs
OK tools/validate-counts.mjs
```

## Что ушло в roadmap отдельными строками

Ничего нового. X-80 (`ui/layout.css`) уже разведён отдельной строкой роадмапа
на предыдущей итерации (review-4/fix-3), эта правка его не касается и файл
`ui/layout.css` не редактирует.

## Границы

`git status --short .` в `courses/` после правки: изменён только
`tools/validate-classes.mjs` (плюс уже бывшие до этой итерации изменения
`ROADMAP.md`/`package.json`/`package-lock.json`, не тронутые этим шагом),
добавлен новый `tools/validate-classes.selftest.mjs`. `ui/`, `showcase/`,
`components/manifest.json` не задеты. `career/` и `_sources/` не открывались.
