# Правки по review-1 — SpriteIcon

| # находки | Severity | Решение | Что сделано | Где |
|---|---|---|---|---|
| 1 | major | исправлено | Спецификация утверждала «жёлтую звезду»; собственная evidence шага (`computed.fill` `star-rounded`/`building` идентичны — `rgb(44,46,52)`) и живой скриншот (`witness-fix1-1400.png`) показывают три одинаково тёмных значка. Проверено заново: реальный источник цвета — `.text-ui-yellow-500{color:var(--color-ui-yellow-500)}`/`.text-ui-black-400{color:var(--color-ui-black-400)}` побайтово одинаковы во всех 10 файлов `evidence/source/production/css/inline/*.css` — утилиты настоящие, просто не перенесены в `ui/`. Переписан абзац «Разметка» и раздел «Ограничения» спецификации на факт (тёмные значки в копии, жёлтый/серый — в проде), исправлена перепутанная нумерация «второй и третий пример» → «первый и третий». Добавлены пояснения к четырём меткам витрины (`star-rounded`, `star-rounded-small`, `comment`, `accreditation`), аналогичные уже существовавшей у `catalog`/`cross-large`. Дополнен вступительный блок `known-missing-classes.json` цитатой прод-CSS. | `components/data-display/sprite-icon.md` (разделы «Разметка», «Ограничения», «Источники»); `showcase/components.html:294,302,310,318`; `tools/known-missing-classes.json` (блок `_`) |
| 2 | major | исправлено | `REF_PATTERN` требовал, чтобы `ui/assets/` уже стояла в значении атрибута, — забытая внешняя/прод-ссылка не матчилась вовсе и тихо выпадала из проверки. Переписан на матчинг по расширению файла ассета (`.svg`/`.png`/…, с необязательным `?query`/`#fragment` после), локальность (`ui/assets/`) и внешний хост проверяются отдельным шагом после матчинга, не как условие самого матчинга. Регэксп ревьюера (`https://career.habr.com/…/sprite.svg?v=1.29.0#star-rounded`) теперь даёт находку. Новый регрессионный набор `tools/validate-showcase-icons.selftest.mjs` — 6 проб, включая ровно строку ревьюера и второй пример из отчёта (сайт-абсолютный путь без хоста). | `tools/validate-showcase-icons.mjs`; `tools/validate-showcase-icons.selftest.mjs` (новый файл) |
| 3 | major | исправлено | `rotate-90` в спецификации, витрине и `known-missing-classes.json` был приписан «кнопке-родителю»; в снятом DOM (`evidence/source/production/pages/courses-listing/dom.html`) класс стоит прямо на `<svg class="svg-icon rotate-90 fill-ui-black-850 text-ui-black-850">`, у обёртывающего `<div>` его нет. Исправлена атрибуция во всех трёх местах, добавлено уточнение «поворот статичный, не переключается» в противовес соседнему `arrow-large`. | `components/data-display/sprite-icon.md` (раздел «Примеры»); `showcase/components.html:345`; `tools/known-missing-classes.json` (`rotate-90`) |
| 4 | major | исправлено | X-75 (`ROADMAP.md`) предсказывал сценарий и требовал добавить проверку до приёмки первой спецификации; `known-missing-classes.json` честен (перепроверено — все 7 записей реальные), реальный пробел — сам гейт: `node tools/validate-classes.mjs` в дефолтном прогоне читал только `showcase/*.html`, ни разу не открывал `components/*.md`. Расширен: дефолтный прогон теперь разбирает фрагменты ```html внутри `components/**/*.md` тем же механизмом (class= в трёх формах кавычек, `<style>` с индексом блока), с той же базовой линией известных пробелов. ```css-фрагменты не читаются — это правило `ui/`, не разметка для копирования. Добавлены 4 регрессионные пробы (X75-1…4) в `tools/validate-classes.selftest.mjs`. Внесён addendum в `capture.md` — задним числом, без переписывания исходного списка «Осталось». | `tools/validate-classes.mjs`; `tools/validate-classes.selftest.mjs`; `.pipeline/R2-01/capture.md` (раздел «Дополнение (fix-1)») |
| 5 | minor | исправлено (явным решением, не пересъёмкой) | Именного кропа `SpriteIcon` с прода нет и не создаётся этим fix-раундом (граница `guide-fix`: не ходить на прод за новыми снимками). Вместо этого в «Ограничения» добавлена явная запись: отсутствие кропа — осознанный компромисс для точечного 16–24px монохромного символа с единственным CSS-правилом (`fill:currentColor`), не тихое умолчание. Тройка «прод ↔ Figma ↔ пример» для конкретных символов подтверждается токеном `ui/tokens.css` + подсчётом классов DOM, а не прямым сравнением пикселей — тоже сказано текстом. | `components/data-display/sprite-icon.md` (раздел «Ограничения») |
| 6 | note | отложено (roadmap-кандидат, не решается на этом шаге) | Плотность комментариев `ui/components/data-display.css` (56:1) — валидное наблюдение о форме, но применимо к будущим компонентам (`SocialIcon`/`Chip`), не к предмету этой записи задним числом. Занесено кандидатом в `capture.md` §«Осталось», не в `ROADMAP.md` напрямую (граница шага). | `.pipeline/R2-01/capture.md` (пункт 7 списка «Осталось») |
| 7 | note | исправлено | Локальный Storybook-CSS `_sources/courses/source/css/svg-icon.6YnsMLG3.css` сверен построчно с прод-правилом — побайтовое совпадение (`.svg-icon{fill:currentColor}`) подтверждено. Добавлена ссылка на файл в раздел «Источники» спецификации как второе прямое подтверждение уровня Storybook API (METHOD §3). | `components/data-display/sprite-icon.md` (раздел «Источники») |

## Изменённые файлы

- `components/data-display/sprite-icon.md` — находки 1, 3, 5, 7
- `showcase/components.html` — находки 1, 3
- `tools/known-missing-classes.json` — находки 1, 3
- `tools/validate-showcase-icons.mjs` — находка 2
- `tools/validate-showcase-icons.selftest.mjs` (новый) — находка 2
- `tools/validate-classes.mjs` — находка 4
- `tools/validate-classes.selftest.mjs` — находка 4
- `.pipeline/R2-01/capture.md` — находки 4, 6 (addendum, не переписывание)
- `.pipeline/R2-01/witness-fix1-{320,1400}.png` — свежий скриншот витрины после правок (Playwright/msedge, `tools/serve.mjs`, тот же метод, что и в review-1)

Манифест (`components/manifest.json`, запись `sprite-icon`) не менялся: правки —
текстовая точность и гейты, ни одна не меняет `requiredStates`/`capturedStates`
(`["default"]`) или сходимость реестра. Статус `complete` пересмотрен по факту
находки 1 и оставлен как есть — сам реviewer уже независимо подтвердил, что
METHOD §5 не требует реализации смежного, явно вынесенного за периметр шага
слоя (цветовые утилиты) для статуса `complete`; факты изменились только в
формулировках, не в объёме покрытых состояний.

## Результат валидатора

```
$ node tools/measure-selectors.mjs
Измерено селекторов 44 по 10 страницам; расходятся с манифестом 0.
Перепись записана: components\selector-census.json
EXIT=0

$ node tools/validate-components.mjs --strict
Validated 55 component records.
Status counts: {"complete":1,"partial":0,"planned":54,"legacy-only":0,"figma-only":0}
Manifest structure is valid.
EXIT=0

$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
EXIT=0

$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет: showcase/pages.html — заводит шаг R6
Известные пробелы (7) — см. tools/known-missing-classes.json:
  fill-ui-black-850, rotate-90, text-ui-black-400, text-ui-black-850,
  text-ui-green-500, text-ui-white, text-ui-yellow-500
Checked 59 classes in 1 showcase file(s) + 5 spec file(s) against 18 stylesheets.
No new undefined classes (7 known gaps).
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 17 ui stylesheet(s) free of doc-.
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

$ node --check tools/*.mjs
(без вывода на каждый файл — все 9 разобраны без ошибок: capture.mjs,
measure-selectors.mjs, serve.mjs, validate-classes.mjs,
validate-classes.selftest.mjs, validate-components.mjs, validate-counts.mjs,
validate-showcase-icons.mjs, validate-showcase-icons.selftest.mjs)
EXIT=0 (каждый)

$ node tools/validate-classes.selftest.mjs
[... 27 прежних проб OK ...]
OK   X75-1: неизвестный класс только во фрагменте ```html спецификации — ловится
OK   X75-2: класс из ```html спецификации, объявленный в ui/, — не ложная находка
OK   X75-3: класс из ```html спецификации в базовой линии known-missing-classes.json — предупреждение, не ошибка
OK   X75-4 (контроль): фрагмент ```css внутри спецификации не читается как разметка для копирования
Пройдено 31 из 31 проб.
EXIT=0
```

Дополнительно (не входит в обязательный список гейтов, но проверяет закрытие
находок 1/2/3 копируемостью и визуалом): живой прогон витрины на 320/1400
(`tools/serve.mjs` + Playwright `msedge`) — overflow 0 на обеих ширинах,
0 запросов к `habr.com`, 0 failed requests; `computed.fill` всех восьми узлов
секции `SpriteIcon` — `rgb(44, 46, 52)` (подтверждает исправленный текст:
«три/восемь одинаково тёмных значка», не «жёлтая звезда»); класс
`svg-icon rotate-90 fill-ui-black-850 text-ui-black-850` на узле `more`
подтверждён тем же вызовом (`witness-fix1-1400.png`).

## Что ушло в roadmap отдельными строками

Не вношу строки в `ROADMAP.md` сам — кандидаты уже перечислены в
`.pipeline/R2-01/capture.md`, раздел «Осталось» (пункты 1–7, включая новый
пункт 7 — находка 6 этого отчёта) и в новом разделе «Дополнение (fix-1)»
(уточнение к X-75: закрыта этим fix-раундом, не требует дальнейшего решения
по существу, — гейт добавлен и держится регрессией).

## Отклонённые находки

Нет. Все 7 находок отчёта закрыты — 6 правкой по существу (1, 2, 3, 4, 5, 7)
и 1 отложена явным решением с указанием, где она всплывёт (6).

## Итог

7/7 находок закрыты (0 отклонено, 0 пропущено). Все восемь дословно
запрошенных гейтов (включая новый регрессионный `validate-showcase-icons.selftest.mjs`)
дают EXIT=0. Готово к повторному ревью.
