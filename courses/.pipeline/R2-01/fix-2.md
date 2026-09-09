# Правки по review-2 — SpriteIcon

| # находки | Severity | Решение | Что сделано | Где |
|---|---|---|---|---|
| 1 | major | исправлено | `extractHtmlFences` требовала буквально `` ```html\n `` без единого лишнего символа — висячий пробел/таб после `html` на строке открывающей метки или `\r\n` вместо `\n` (CRLF) заставляли парсер тихо не найти блок вовсе (0 блоков извлечено, класс внутри не идёт ни в `used`, ни в находку — «All defined», EXIT=0), воспроизводя тот же класс тихого пропуска, ради которого заводился X-75. Переписана граница блока: `/^[ \t]*```html[ \t]*\r?\n([\s\S]*?)^[ \t]*```[ \t]*\r?$/gm` — `^`/`$` с флагом `m` привязывают метку к началу строки вместо буквального текста, `[ \t]*` терпит пробелы/табы после `html` и перед закрывающими бэктиками на обеих границах, `\r?` терпит CRLF наравне с LF. Отступ перед тройными бэктиками (код внутри списка/цитаты) закрыт тем же изменением, хотя ни одна спецификация пакета сегодня так не пишет (проверено `grep` по `components/**/*.md` — 2 вхождения ```` ```html ````, оба ровно `sprite-icon.md`, оба без отступа). Добавлено 5 регрессионных проб `X75-5…9` в `tools/validate-classes.selftest.mjs`: висячий пробел, висячий таб, CRLF, отступ (контроль), CRLF+пробел вместе. Три из пяти (5, 6, 7) целенаправленно воспроизводят находку и подтверждены на изолированной копии `validate-classes.mjs` с откатом только `extractHtmlFences` к прежнему виду (регэксп `/```html\n([\s\S]*?)```/`, остальной файл — включая чтение `components/*.md` — оставлен как есть): все три дают FAIL на этой копии (код возврата 0 вместо ожидаемого 1, класс не найден) и OK на исправленном коде; оставшиеся 32 пробы набора не затронуты откатом (индентация уже терпелась старым нeзаякоренным регэкспом — X75-8 прошла и на откате). | `tools/validate-classes.mjs:341-357` (`extractHtmlFences`); `tools/validate-classes.selftest.mjs:454-510` (пробы X75-5…9) |
| 2 | minor | исправлено частично (комментарий), поведение — роадмап-кандидат | `extractHtmlFences` читает все ```html-блоки файла спецификации без разбора по разделу — «Анатомия» (иллюстративная цитата снятого DOM, не разметка для копирования) наравне с «Разметкой» (нормативный пример). Изменение поведения (разбор по заголовку раздела) расширило бы объём находки 1 за пределы парсинга границы fence-блока — не сделано в этом fix-раунде. Сделано то, что находка называет прямой претензией: комментарий-обоснование правки X-75 (блок над `specFiles`) раньше говорил только о «Разметке», не упоминая, что «Анатомия» разбирается тем же путём — дополнен абзацем, называющим смешение явно, со ссылкой на review-2/находка 2. Кандидат «разбор по разделу спецификации» занесён в `capture.md`, не решается на этом шаге. | `tools/validate-classes.mjs:15-33` (комментарий); `.pipeline/R2-01/capture.md` (раздел «Дополнение (fix-2, ревью review-2)») |
| 3 | note | отклонено (роадмап-кандидат) | `EXTERNAL_HOST` в `tools/validate-showcase-icons.mjs` не заякорен к началу строки у `career\.habr\.com`/`assets\.habr\.com` — подстрока в query легитимной локальной ссылки классифицируется как внешний хост. Направление ошибки безопасное (ложный отказ, не тихий пропуск), сценарий сам ревьюер называет надуманным для сегодняшней витрины (0 таких ссылок в `showcase/*.html` — проверено), а файл и предмет находки не относятся к major этой итерации (`validate-classes.mjs`, граница fence-блока в другом файле) — правка в нём расширила бы объём фикса на не связанную с находкой 1 часть кода. Не исправляется в этом раунде; занесено кандидатом в `capture.md` с точным местом якоря на будущее. | `tools/validate-showcase-icons.mjs` (`EXTERNAL_HOST`); `.pipeline/R2-01/capture.md` |

## Изменённые файлы

- `tools/validate-classes.mjs` — находки 1 (функция `extractHtmlFences`), 2 (уточнение комментария над `specFiles`)
- `tools/validate-classes.selftest.mjs` — находка 1 (5 новых проб X75-5…9)
- `.pipeline/R2-01/capture.md` — находки 1, 2, 3 (addendum «Дополнение (fix-2, ревью review-2)», не переписывание существующих разделов)

Не менялись: `components/data-display/sprite-icon.md`, `components/manifest.json`,
`showcase/components.html`, `tools/known-missing-classes.json`,
`tools/validate-showcase-icons.mjs` — ни одна находка review-2 не адресована
к этим файлам решением «исправить». Подтверждённые находки review-1 (звезда,
гейт внешних ссылок, `rotate-90`, статус `complete`) не тронуты.

## Результат валидатора

```
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
[... 31 прежних проб OK ...]
OK   X75-5 (review-2, находка 1): висячий пробел после `html` на строке открывающей метки
OK   X75-6 (review-2, находка 1): висячий таб после `html` на строке открывающей метки
OK   X75-7 (review-2, находка 1): CRLF-перенос строки во всём файле спецификации
OK   X75-8 (контроль): отступ перед тройными бэктиками (блок кода внутри списка) — тоже читается
OK   X75-9 (контроль): CRLF + висячий пробел вместе — обе границы одновременно
Пройдено 36 из 36 проб.
EXIT=0

$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
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

$ node --check tools/*.mjs
OK tools/capture.mjs
OK tools/measure-selectors.mjs
OK tools/serve.mjs
OK tools/validate-classes.mjs
OK tools/validate-classes.selftest.mjs
OK tools/validate-components.mjs
OK tools/validate-counts.mjs
OK tools/validate-showcase-icons.mjs
OK tools/validate-showcase-icons.selftest.mjs
(каждый разбирается без ошибок, EXIT=0)
```

Дополнительно (не входит в обязательный список гейтов этой итерации, но
подтверждает отсутствие регрессии в соседнем гейте, не тронутом этим fix-раундом):

```
$ node tools/validate-showcase-icons.mjs
Проверено 8 ссылок на ассеты в 1 файле(ах) витрины — все ведут в ui/assets/, все существуют.
EXIT=0

$ node tools/validate-showcase-icons.selftest.mjs
Пройдено 6 из 6 проб.
EXIT=0
```

## Проверка регрессии находки 1 отдельно от полного набора

Изолированная копия `tools/validate-classes.mjs` с откатом только
`extractHtmlFences` к виду до этой правки (`/```html\n([\s\S]*?)```/`, весь
остальной файл — включая чтение `components/*.md`, введённое fix-1, — оставлен
как в исправленном коде) прогнана через новый набор `tools/
validate-classes.selftest.mjs` (36 проб):

```
FAIL X75-5 (review-2, находка 1): висячий пробел после `html` на строке открывающей метки
FAIL X75-6 (review-2, находка 1): висячий таб после `html` на строке открывающей метки
FAIL X75-7 (review-2, находка 1): CRLF-перенос строки во всём файле спецификации
FAIL X75-9 (контроль): CRLF + висячий пробел вместе — обе границы одновременно
Пройдено 32 из 36 проб.
```

Ровно четыре пробы, привязанные к находке 1 (висячий пробел/таб, CRLF,
CRLF+пробел), проваливаются на откате и проходят на исправленном коде;
X75-8 (отступ) проходит на обеих версиях — старый нeзаякоренный регэксп не
требовал начала строки и уже терпел отступ случайно, поэтому не является
регрессионным маркером находки 1, а лишь контролем на будущее. Остальные 32
пробы не затронуты откатом одной функции — подтверждает, что правка
локальна и не меняет поведение вне границы fence-блока.

## Что ушло в roadmap отдельными строками

Не вношу строки в `ROADMAP.md` сам (граница шага) — кандидаты перечислены
в `.pipeline/R2-01/capture.md`, раздел «Дополнение (fix-2, ревью review-2)»:

1. Разбор ```html-блоков спецификации по разделу (`## Анатомия` /
   `## Разметка`), а не всех блоков файла без разбора — находка 2.
2. Якорь начала строки/хоста у `career\.habr\.com`/`assets\.habr\.com` в
   `EXTERNAL_HOST` (`tools/validate-showcase-icons.mjs`) — находка 3.

## Отклонённые находки

Находка 3 (note) — не исправляется в этом fix-раунде: файл (`validate-
showcase-icons.mjs`) и предмет не относятся к major этой итерации (граница
fence-блока в `validate-classes.mjs`), направление ошибки безопасное (ложный
отказ), сценарий сам ревьюер называет надуманным для сегодняшней витрины.
Не «отклонено по существу» — претензия верна, решение перенесено в roadmap-
кандидат, чтобы не расширять объём правки на не связанную с находкой 1 часть
кода (граница `guide-fix`).

## Итог

Находка 1 (major, единственная) исправлена и подтверждена регрессией на
5 новых пробах, 3 из которых воспроизводят находку напрямую на изолированном
откате кода (FAIL → OK). Находка 2 (minor) закрыта частично — комментарий
исправлен на месте, поведенческая часть вынесена в roadmap-кандидат явным
решением, не молча. Находка 3 (note) вынесена в roadmap-кандидат без правки
кода — вне границ major-находки. Все три подтверждённые находки review-1
(звезда, гейт внешних ссылок, `rotate-90`) и статус `complete` в манифесте —
не тронуты. Все пять дословно запрошенных гейтов (`validate-classes.mjs`,
`validate-classes.selftest.mjs` — 36/36, `validate-components.mjs --strict`,
`validate-counts.mjs`, `node --check tools/*.mjs`) дают EXIT=0. Готово к
повторному ревью.
