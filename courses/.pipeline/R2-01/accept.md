# Приёмка R2-01 — `SpriteIcon`

Дата: 9 сентября 2026.
Вердикт: **ПРИНЯТО**.

Batch из одного элемента: `sprite-icon` (`data-display`, `primitive`).
Вёрстка — `.pipeline/R2-01/capture.md`, три итерации ревью
(`review-1.md` — «вернуть на доработку», 0 blocker · 4 major · 2 minor · 2 note;
`review-2.md` после `fix-1.md` — 0 blocker · 1 major · 2 note;
`review-3.md` после `fix-2.md` — «принять с замечаниями», 0 blocker · 1 major ·
1 minor). Оставшаяся major — хрупкость `extractHtmlFences` к форме текста,
третье проявление одного дефекта — принята долгом роадмапа (**X-81**) по прямой
рекомендации ревью, а не отправлена на четвёртую итерацию фикса.

Гейты прогнаны этой приёмкой заново, не приняты по отчётам `capture.md`,
`review-*.md`, `fix-*.md`. Вывод ниже — дословный, с кодами возврата (X-41).

---

## Блокер приёмки, снятый до вердикта

Первый прогон `node tools/validate-components.mjs --strict` дал **EXIT=1**:

```
Errors (1):
- ..\.claude\guide\METHOD.md: раздел §5 не найден — словари сверить не с чем
```

Причина внешняя и к шагу отношения не имеет: метод отрефакторен из монолитного
`METHOD.md` в маршрутизатор плюс областные документы, и закрытые словари §5
переехали в `.claude/guide/naming-states.md`. Гейт сработал правильно — он
именно для того и заводился, чтобы переезд контракта не прошёл незамеченным.

Сверка перенаправлена на `naming-states.md` (`tools/validate-components.mjs`,
блок `methodPath` / `methodDictHeadings`). Смысл проверки сохранён полностью:
литерал валидатора сверяется с контрактом метода в обе стороны — «шире
контракта» и «не содержит имён контракта» остаются разными ошибками. Разбор
адаптирован к форме нового документа: запрещённые имена состояний стоят там
отдельным абзацем, а не хвостом пункта списка, поэтому блок пункта обрывается
на первой пустой строке — иначе `active`, `focus`, `select`, `inactive` попали
бы в список **разрешённых**.

Словари сошлись с литералом валидатора без единой правки обеих сторон:
**10** категорий, **4** вида, **5** статусов, **20** состояний, **4**
запрещённых слова.

Двусторонность сверки проверена красной пробой на копии контракта (файл
изменён, прогнан, восстановлен побайтово; `git diff --quiet .claude/guide/naming-states.md`
после восстановления — чисто):

```
$ node -e "… добавить draft в «Статусы», убрать dragActive из «Состояний» …"
mutated
$ node tools/validate-components.mjs --strict
Errors (2):
- naming-states.md: список statuses в валидаторе не содержит имён контракта метода: draft
- naming-states.md: список states в валидаторе шире контракта метода: dragActive
EXIT=1
```

Правка лежит в `tools/validate-components.mjs` — файле, принадлежащем этому
шагу, и входит в его коммит. Остальные устаревшие ссылки пакета на «METHOD §N»
не тронуты: их около тридцати в живых файлах и сотни в архивных отчётах
`.pipeline/**`. Заведены строкой **X-87**, а не починены молча.

---

## Автоматические гейты

### `validate-step.mjs` — 11/11

```
$ node .claude/guide/validate-step.mjs --product courses --id sprite-icon --kind component \
    --pipeline courses/.pipeline/R2-01 \
    --json-out courses/.pipeline/R2-01/accept-auto.json \
    --md-out courses/.pipeline/R2-01/accept-auto.md
PASS: 11/11 gates; failed=none; log=.pipeline\R2-01\validate.log
EXIT=0
```

Разбор по гейтам — `accept-auto.md` (manifest · status · spec · index ·
css-roots · showcase · states · production-evidence · figma-evidence · review ·
validator), машинная форма — `accept-auto.json`, полный вывод валидатора —
`validate.log`.

### Чеклист приёмки шага пакета — дословно

Логи каждой команды — `.pipeline/R2-01/logs/*.log`.

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
Закрытые словари метода сверены с ../.claude/guide/naming-states.md.
Status counts: {"complete":1,"partial":0,"planned":54,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (1) — предмета ещё нет:
- спецификации — 54 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — инвентаризация записала один ключ и FilterChip, и Tab: либо это один component set, либо ошибка переноса. Разводится на R3-04 и R3-13
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
EXIT=0

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
  specs: 1
  scopeProduction: 44
  scopeStorybookOnly: 5
  scopeFigmaOnly: 6
EXIT=0

$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

Известные пробелы (7) — см. tools/known-missing-classes.json:
  fill-ui-black-850 — то же — fill:var(--color-ui-black-850), пара к text-ui-black-850 на одном узле
  rotate-90 — утилита Tailwind продукта (transform:rotate(90deg)); в ui/ не заведена ни в одном слое — стоит прямо на <svg class="svg-icon rotate-90…"> символа more (кнопка «показать ещё», SpriteIcon#more, R2-01), не на обёртывающей кнопке
  text-ui-black-400 — то же — color:var(--color-ui-black-400)
  text-ui-black-850 — то же — color:var(--color-ui-black-850)
  text-ui-green-500 — то же — color:var(--color-ui-green-500)
  text-ui-white — то же — color:var(--color-ui-white)
  text-ui-yellow-500 — утилита Tailwind продукта (color:var(--color-ui-yellow-500)); токен есть в ui/tokens.css с R0-02, самого класса-утилиты нет ни в ui/utilities.css (его сфера — перенос/обрезка/выравнивание текста, GAP-9 docs/guide/typography.md, не цвет), ни где-либо ещё в ui/ — R2-01, sprite-icon.md, раздел «Ограничения»

Checked 59 classes in 1 showcase file(s) + 5 spec file(s) against 18 stylesheets. No new undefined classes (7 known gaps).
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 17 ui stylesheet(s) free of doc-.
EXIT=0

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
OK   X75-1: неизвестный класс только во фрагменте ```html спецификации — ловится
OK   X75-2: класс из ```html спецификации, объявленный в ui/, — не ложная находка
OK   X75-3: класс из ```html спецификации в базовой линии known-missing-classes.json — предупреждение, не ошибка
OK   X75-4 (контроль): фрагмент ```css внутри спецификации не читается как разметка для копирования
OK   X75-5 (review-2, находка 1): висячий пробел после `html` на строке открывающей метки
OK   X75-6 (review-2, находка 1): висячий таб после `html` на строке открывающей метки
OK   X75-7 (review-2, находка 1): CRLF-перенос строки во всём файле спецификации
OK   X75-8 (контроль): отступ перед тройными бэктиками (блок кода внутри списка) — тоже читается
OK   X75-9 (контроль): CRLF + висячий пробел вместе — обе границы одновременно
OK   PARSE-ERROR: комментарий с преждевременным "*/" внутри (реальный дефект ui/layout.css)

Пройдено 36 из 36 проб.
EXIT=0

$ node tools/validate-showcase-icons.mjs
Проверено 8 ссылок на ассеты в 1 файле(ах) витрины — все ведут в ui/assets/, все существуют.
EXIT=0

$ node tools/validate-showcase-icons.selftest.mjs
OK   R2-01/review-1 находка 2: полный внешний URL — забытая прод-ссылка ловится
OK   находка 2, второй пример из отчёта: сайт-абсолютный прод-путь без хоста тоже ловится
OK   protocol-relative внешний хост (// без схемы) — ловится
OK   контроль: локальная ui/assets/ ссылка на существующий файл — EXIT=0
OK   контроль: ui/assets/ ссылка на несуществующий файл — ловится как раньше
OK   контроль: обычные href без расширения ассета (якорь, doc-ссылка) не матчатся вовсе

Пройдено 6 из 6 проб.
EXIT=0

$ node --check tools/*.mjs (прогнано по одному файлу)
tools/capture.mjs EXIT=0
tools/measure-selectors.mjs EXIT=0
tools/serve.mjs EXIT=0
tools/validate-classes.mjs EXIT=0
tools/validate-classes.selftest.mjs EXIT=0
tools/validate-components.mjs EXIT=0
tools/validate-counts.mjs EXIT=0
tools/validate-showcase-icons.mjs EXIT=0
tools/validate-showcase-icons.selftest.mjs EXIT=0
```

`npm test` не запускался: скрипта `"test"` в пакете нет, X-01 не закрыт.

### Обязательная пара «перемер → сверка»

Шаг трогает селекторы и `occurrences`/`seenOn` записи `sprite-icon`, поэтому
пара прогнана в требуемом порядке, а не одной сверкой.

```
$ node tools/measure-selectors.mjs
 =  person-header          заявлено    1/ 1  измерено    1/ 1
 =  info-table             заявлено    1/ 1  измерено    1/ 1

Измерено селекторов 44 по 10 страницам; расходятся с манифестом 0.

Перепись записана: components\selector-census.json
EXIT=0

$ node tools/validate-components.mjs --strict
Manifest structure is valid.
EXIT=0
```

Полный вывод — `.pipeline/R2-01/logs/measure-selectors.log` и
`.pipeline/R2-01/logs/validate-components-after-measure.log`. Перемер изменил
в `components/selector-census.json` единственное поле — `measuredAt`
`2026-09-08` → `2026-09-09`; ни одно измеренное число не сдвинулось.

---

## Смысловые гейты

| # | Гейт | Результат |
|---|---|---|
| 1 | Браузерные тесты пакета | **неприменим**: скрипта `"test"` в `package.json` пакета по-прежнему нет (X-01 не закрыт) |
| 2 | Копируемость примера (инвариант 1) | **частично, названо явно** — разбор ниже |
| 3 | Exit criteria волны R2 | **неприменим**: волна не закрывается, принят 1 шаг из 12 |
| 4 | `validate-machine.mjs` | **неприменим**: `machine/` пакета пуст, слой заводит волна R8 |
| 5 | Принципы (coverage ≥2, `data-rule`) | **неприменим**: шаг правил не заводит |
| 6 | Страницы (композиция из принятого) | **неприменим**: шаг страниц не заводит |
| 7 | Один id у статьи и машинной проекции | **зелёный**: `sprite-icon` — id манифеста, имя файла спецификации (`components/data-display/sprite-icon.md`) и якорь витрины `c-sprite-icon`; противоречащей машинной записи нет, машинного слоя нет вовсе |
| 8 | Честность статуса | **зелёный**: `complete` объявлен ровно у одной записи, 54 остаются `planned`; ни один пробел не выдан за снятое |
| 9 | Ревью закрыто | **зелёный**: `review-3.md` — «принять с замечаниями»; обе major, признанные по существу, закрыты правкой источника (`fix-1.md`, `fix-2.md`), третья вынесена долгом X-81 по рекомендации самого ревьюера |
| 10 | Изоляция showcase (инвариант 2) | **зелёный** механически: `validate-classes` — 1 таблица витрины с префиксом `doc-`, 17 таблиц `ui/` без `doc-` |
| 11 | Локальные assets (инвариант 3) | **зелёный** механически: `validate-showcase-icons` — 8 ссылок, все ведут в `ui/assets/`, все существуют; регрессия 6/6 |
| 12 | Токены (инвариант 4) | **зелёный**: секция `SpriteIcon` в `ui/components/data-display.css` не несёт литеральных цветов — цвет приходит через `fill:currentColor`, окраска — утилитами продукта, пробел по ним назван (см. гейт 2) |

### 2 — копируемость: что именно не выполняется

Спецификация объявляет пробел прямо: цветовые утилиты `text-*`/`fill-*`,
которыми продакшен красит 383 из 487 узлов, в `ui/` не заведены ни в одном
слое, и копия окрашенного примера рендерит рейтинговую звезду тем же тёмным
унаследованным цветом, что и `building` без утилиты. Витрина подписывает это
у самого примера, `tools/known-missing-classes.json` перечисляет все семь
пробелов поимённо, долг заведён строкой **X-84**.

Приёмка не приняла это утверждение по отчёту, а воспроизвела. Спецификация
называет команду воспроизведения `node tools/validate-classes.mjs .pipeline/R2-01/copy-check.html`,
но файла `copy-check.html` в `.pipeline/R2-01/` нет. Собственная копия разметки
(два `<svg>` из раздела «Разметка» плюс `ui/courses.css`) даёт дословно
заявленный результат:

```
$ node tools/validate-classes.mjs .pipeline/R2-01/copy-check-probe.html
Классы без определения в CSS (2):

  text-ui-black-400  —  .pipeline/R2-01/copy-check-probe.html
  text-ui-yellow-500  —  .pipeline/R2-01/copy-check-probe.html

Если это утилита Tailwind — её нет в ui/, и на странице она не сработает.
Своя разметка проверяется строго: закрывается это правилом в ui/, а не записью
в базовую линию — она для своей разметки не читается. Утилиты продукта, которые
встречаются в разметке спецификаций, несёт ui/utilities.css (заводит R0-04).
EXIT=1
```

Проба создана и удалена в ходе приёмки, в коммит не входит. Итог: утверждение
спецификации верно, битый в ней адрес доказательства — нет; заведён строкой
**X-88**.

Структурная копируемость примитива при этом выполняется: `<use xlink:href>`
ведёт в локальный `ui/assets/icons/sprite.svg`, размеры и `fill:currentColor`
приходят из `ui/components/data-display.css`, подключаемого одним
`ui/courses.css`. Не хватает только цвета — и это названо, а не умолчано.
Инвариант 1 держится частично, с явным адресом пробела; блокером не признан —
так же оценил и ревьюер на всех трёх итерациях.

---

## Границы

- `git status --short` проверен перед коммитом. В рабочем дереве есть чужие
  изменения: `landings/**` (6 файлов) и `landings/.pipeline/R0-08/`, а также
  непринятые `courses/.pipeline/R0-00…R0-05/`. Ни один из них в коммит не
  входит; `git add -A` не использовался — файлы перечислены поимённо.
- Изменения этой приёмки: `tools/validate-components.mjs` (перенаправление
  сверки словарей), `ROADMAP.md`, `CHANGELOG.md`, `components/selector-census.json`
  (`measuredAt`), `.pipeline/R2-01/accept.md`, `.pipeline/R2-01/accept-auto.md`,
  `.pipeline/R2-01/accept-auto.json`, `.pipeline/R2-01/validate.log`,
  `.pipeline/R2-01/logs/`.
- R2-02 и далее не тронуты.
- Объём не расширен: обе находки приёмки (устаревшие ссылки «METHOD §N»,
  битый адрес `copy-check.html`) заведены строками роадмапа, а не починены
  внутри этого шага.

---

## Обновлено

- `ROADMAP.md` — сводная таблица «Волны»: R1 `planned` → `done` (волна закрыта
  9 сентября 2026, оба шага приняты), R2 `planned` → `in-progress · 1/12`;
  X-75 `planned` → `done` (закрыта расширением `validate-classes` на
  ```html-фрагменты спецификаций — как и утверждают `CHANGELOG.md` и раздел
  «Результат R2-01»); заведены X-87 (устаревшие ссылки на разделы монолитного
  `METHOD.md`) и X-88 (битый адрес `copy-check.html` в спецификации);
  в «Результат R2-01» дописано, что приёмка сделала сверх шага.
- `CHANGELOG.md` — в существующую запись `## Unreleased` о R2-01 дописаны два
  абзаца: перенаправление сверки словарей и воспроизведение пробела
  копируемости с битым адресом доказательства.
- `.pipeline/R2-01/accept.md` — этот файл; `accept-auto.md`,
  `accept-auto.json`, `validate.log`, `logs/` — машинные и полные выдачи.

Релиз и тег не предлагаются: в пакете один свёрстанный примитив из 55 записей,
пользоваться пакетом как источником готовой разметки ещё нельзя.
