# Ревью SpriteIcon — итерация 1

Вердикт: **вернуть на доработку**

Проверено: `.pipeline/R2-01/capture.md`, `components/data-display/sprite-icon.md`,
`components/manifest.json` (запись `sprite-icon`), `components/INDEX.md`,
`components/STATES.md`, `ui/components/data-display.css`,
`showcase/components.html`/`components.css`, `tools/known-missing-classes.json`,
`tools/validate-showcase-icons.mjs`, `ROADMAP.md` (X-06, X-60, X-62, X-67, X-72, X-75).

Пересчитаны своим кодом (не по памяти отчёта) все 10 `dom.html` в
`evidence/source/production/pages/*/dom.html`: узлы `svg.svg-icon` по странице,
разбор по четырём файлам-спрайтам, разбор 487 узлов `sprite.svg` по 13 символам,
битые `xlink:href` у `star-empty`, размеры (16/20/22/24), утилиты цвета
(`text-*`/`fill-*`) по 7 бакетам, `aria-hidden` по символам, идентичность правила
`.svg-icon{fill:currentColor}` во всех 10 инлайн-файлах + внешнем
`entry.Dcg7kqZY.css`, отсутствие `svg-icon` в `@media`, отсутствие `data-v-*`.
Скачанный `ui/assets/icons/sprite.svg` сверен построчно (22 `id`) с argTypes
Storybook (`_sources/courses/metadata/stories/icons-spriteicon--default.json`).
Figma-заявления перепроверены живыми вызовами `mcp__figma__get_metadata` и
`mcp__figma__search_design_system` (не по слову отчёта). Прогнаны все семь
запрошенных гейтов дословно. Витрина открыта в браузере (`tools/serve.mjs` +
Playwright `msedge`) на 320 и 1400 — снят живой скриншот
(`.pipeline/R2-01/witness-sprite-icon-{320,1400}.png`), проверены overflow и
сетевые запросы к `habr.com`.

## Находки

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | major | A.3 / E.19 | Спецификация утверждает, что `copy-check.html` «показывает жёлтую звезду», но это противоречит её же приведённой evidence: computed `fill` у первого узла (`star-rounded`, класс `text-ui-yellow-500`) и второго (`building`, без утилиты) в `capture.md` **одинаковы** — `rgb(44,46,52)` у обоих. `text-ui-yellow-500` в `ui/` не определена (тот же документ, «Ограничения»), поэтому утилита не применяется и звезда красится в тот же наследуемый тёмный цвет, что и здание — не в жёлтый. Живой скриншот витрины подтверждает это визуально: `star-rounded`/`star-rounded-small`/`accreditation` (утилиты `text-ui-yellow-500`/`text-ui-green-500`) рендерятся чёрными, а не жёлтыми/зелёными. | `components/data-display/sprite-icon.md:237-239` («экран показывает жёлтую звезду, чёрное здание...») | Сверить с `capture.md` §5 (`computed: [{fill:"rgb(44,46,52)"...}, {fill:"rgb(44,46,52)"...}]`) и с `.pipeline/R2-01/witness-sprite-icon-1400.png` (звезда рейтинга и галочка аккредитации — чёрные, не жёлтые/зелёные) |
| 2 | major | B.9 | `tools/validate-showcase-icons.mjs` — новый гейт для следующих 11 примитивов волны — не ловит реалистичный регресс, который сам описывает как цель защиты («продовый путь... в этой копии — забытая правка»). Экстракция `REF_PATTERN = /(?:xlink:href\|href\|src)\s*=\s*"([^"]*ui\/assets\/[^"]*)"/g` требует, чтобы подстрока `ui/assets/` **уже была** в значении атрибута. Полностью незалокализованная прод-ссылка (ровно то, что лежит в разделе «Анатомия» той же спецификации — `/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded`, или полный `https://career.habr.com/...`) вообще не матчится регекспом и тихо пропускается как «нечего проверять» — не засчитывается ни в `checked`, ни в `externalRefs`. Инструмент ловит только искусственный случай, где внешний хост или отсутствующий файл упомянуты вместе с `ui/assets/` в одной строке — маловероятная комбинация. | `tools/validate-showcase-icons.mjs` (REF_PATTERN, регэксп) | `node -e "console.log([...'<use xlink:href=\"https://career.habr.com/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded\">'.matchAll(/(?:xlink:href\|href\|src)\s*=\s*\"([^\"]*ui\/assets\/[^\"]*)\"/g)])"` — 0 совпадений, а должна быть находка |
| 3 | major | E.19 | Пример «показать ещё» (`more`) описан как «повёрнут на 90° утилитой `rotate-90` на самой кнопке (сам SpriteIcon вращения не объявляет)» — но в снятом DOM `rotate-90` стоит классом прямо на `<svg class="svg-icon rotate-90 fill-ui-black-850 text-ui-black-850">`, а не на обёртке (`<div class="absolute right-3 top-3 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-ui-white p-0 opacity-70">`, где `rotate-90` нет). Та же неверная атрибуция продублирована в подписи витрины («rotate-90 задаёт кнопка-родитель») и в `tools/known-missing-classes.json` — три места одной и той же ошибки. Отличается от `arrow-large`, где `transition-transform` действительно объявлен на самом `svg-icon`, но переключает состояние снаружи (эта пара примеров описана верно и, похоже, спутана местами). | `components/data-display/sprite-icon.md` (раздел «Примеры», строка про `more`); `showcase/components.html:345`; `tools/known-missing-classes.json` (`rotate-90`) | `grep -o '.\{60\}rotate-90 fill-ui-black-850.\{60\}' evidence/source/production/pages/courses-listing/dom.html` — `rotate-90` внутри `class` самого `<svg>`, не родителя |
| 4 | major | B (инварианты) | Долг `X-75` (`ROADMAP.md`) прямо предсказывал этот сценарий: «Первая спецификация R2-01 может сослаться на несуществующую утилиту, и поймать это будет нечем... Добавить проверку до первой принятой спецификации». Сценарий произошёл буквально (`text-ui-yellow-500` и другие пять — несуществующие утилиты, на которые ссылается спецификация), но автоматический дефолтный гейт (`node tools/validate-classes.mjs` без аргумента) по-прежнему проверяет только `showcase/*.html`, не `components/*.md`. Единственная проверка спецификации — ручной разовый прогон на временном `copy-check.html`, который уже удалён; без него регресс в следующей спецификации снова нечем поймать. `capture.md` перечисляет пять открытых долгов (X-06 решён, X-60/X-62/X-67/X-72/6 непроверенных Figma-имён), но не называет `X-75` вообще — притом что именно этот шаг был условием его закрытия. | `ROADMAP.md` (запись `X-75`, статус `planned`); `capture.md` (раздел «Осталось») | `git status --short courses/tools/validate-classes.mjs` — файл не менялся на этом шаге; `node tools/validate-classes.mjs` не принимает путь к `components/*.md` |
| 5 | minor | A.3 | Для `SpriteIcon` не сделано ни одного именного кропа с прода (`evidence/source/production/sprite-icon/<Name>.<width>.png`) — только полностраничные снимки страниц и DOM/computed. Сравнение «прод ↔ Figma ↔ наш пример» тройкой скриншотов по чеклисту A.3 в результате нечем закрыть для конкретных символов (например, реального жёлтого цвета `star-rounded` в проде) — приходится верить процентовке DOM, а не видеть цвет напрямую. Для точечного 16-24px символа это, возможно, оправданный компромисс, но explicit не оговорён как решение. | `evidence/source/production/` (папки `sprite-icon/` нет) | `find evidence/source/production -maxdepth 1 -type d` — только `css`, `pages` |
| 6 | note | B (форма CSS) | Секция `SpriteIcon` в `ui/components/data-display.css` — 56 строк комментария на 1 строку правила (56:1). Структура (заголовок категории → блок-комментарий на компонент → правило) читаема и её легко повторить для следующей секции, но такая плотность как форма-по-умолчанию может не масштабироваться на компоненты с 5-10 реальными правилами — стоит присмотреться на `SocialIcon`/`Chip`. | `ui/components/data-display.css:20-59` | — |
| 7 | note | E.19 (источники) | Локальный кэш Storybook хранит `_sources/courses/source/css/svg-icon.6YnsMLG3.css` — отдельный CSS-файл, подключённый именно к story `SpriteIcon` (`__sheets` в `icons-catalogicon--default.json` и аналоге). Содержимое байт-в-байт совпадает с прод-правилом (`.svg-icon{fill:currentColor}`), расхождений нет, но источник не упомянут и не процитирован в спецификации/`capture.md`, хотя лежит на диске и годится как второе прямое подтверждение Storybook-API (источник уровня 2 в иерархии METHOD §3). | `_sources/courses/source/css/svg-icon.6YnsMLG3.css` | `cat _sources/courses/source/css/svg-icon.6YnsMLG3.css` |

## Что проверено и претензий нет

- **Счётчики узлов (пункт 1 задания).** 611 узлов `svg.svg-icon` по 10 `dom.html`
  (12/60/164/21/78/85/37/48/67/39) — пересчитано независимо, совпадает
  с манифестом и `selector-census.json`. Разбивка на 4 спрайта (487/60/61/3)
  и разбивка `external-profile.svg` (linkedin.com 25, career.habr.com 12,
  email 16, other 8) — пересчитаны посимвольно, совпадают с точностью до узла.
  13 символов `sprite.svg` и их счёт (119/93/92/47/36/28/20/21/18/10/1/1/1=487) —
  пересчитаны, совпадают.
- **Дефект `star-empty` (пункт 2).** 11 из 21 узлов (4 на `courses-listing`,
  7 на `education-center`) буквально несут `xlink:href="...#star-empty
  text-ui-black-200"` — сверено посимвольно по сырому `dom.html`, счёт по
  странице совпадает с отчётом день в день. Сплошным проходом по всем 10
  файлов (`xlink:href` с пробелом внутри значения) проверено, что «прилипший
  класс» — дефект ровно одного символа: других 462 узлов `sprite.svg` он не
  касается.
- **Спрайт и версии (пункт 3).** Локальный `ui/assets/icons/sprite.svg` содержит
  ровно 22 `id`, совпадающих с 22 `options` в `argTypes` Storybook
  (`icons-spriteicon--default.json`) и с рендером `v1.28.0`
  (`_sources/courses/rendered/icons-spriteicon--all-variants.html` содержит
  `sprite.svg?v=1.28.0`) — расхождение версий подтверждено, расхождения
  состава нет.
- **Figma (пункт 4).** Живыми вызовами MCP подтверждено: `get_metadata` без
  `nodeId` отдаёт только `33:15585 «colors»`; `componentKey` `74adfe6b...`
  резолвится в `icon/check` (не `icon/*`); `icon/search`
  (`cd8ad75ae4fe81f35ce1c71d7283f9a85f9c6003`) и `icon/catalog`
  (`117b08b047bdad224da76813f004280af2699500`) — точные совпадения; для
  `star-rounded` ближайшее — `icon/star` (component set), для `arrow-large`
  совпадений нет вовсе — оба отрицательных результата подтверждены заново.
- **`validate-showcase-icons.mjs` на самой витрине.** 8 ссылок, все локальные,
  все существуют — код 0, соответствует отчёту. Логика инструмента при этом
  имеет дыру (находка 2) — на *текущей* витрине она не проявляется, потому что
  разметка там уже корректно локализована.
- **`known-missing-classes.json`.** Все 7 записей — реальные Tailwind-классы,
  подтверждённые в снятом DOM (`fill-ui-black-850`, `text-ui-black-850`,
  `text-ui-black-400`, `text-ui-green-500`, `text-ui-white`,
  `text-ui-yellow-500`, `rotate-90`); ни один не маскирует случайно нужную
  утилиту — файл честно указывает на будущий слой `ui/color-utilities.css`
  (роадмап-пункт 1 в «Осталось» отчёта), не выдаёт временное решение за
  постоянное.
- **Таблица «Внешний вид» (утилиты цвета) и `aria-hidden`.** Пересчитаны с нуля
  по классам `<svg>` во всех 10 `dom.html`: 104/212/63/30/28/20/18/12 — все
  восемь чисел сошлись точно, включая распределение 11 «битых» `star-empty`
  в бакет «наследуется». `aria-hidden`: 29/487 общий счёт, `search` 1/1,
  `arrow-small` 28/36, у прочих 11 символов — 0/451 — пересчитано, совпадает.
  Правило `star-rounded`/`star-rounded-small` → `text-ui-yellow-500` (212/212
  без исключений) — пересчитано отдельно, подтверждено.
- **CSS-правило `.svg-icon{fill:currentColor}`.** Побайтово идентично во всех
  10 инлайн-файлах и во внешнем `entry.Dcg7kqZY.css` — сверено `grep`;
  `@media` с `svg-icon` не встречается ни в одном из 22 CSS-файлов корпуса;
  `data-v-*` на узлах `svg.svg-icon` не встречается ни разу — все три
  утверждения подтверждены.
- **Реестр сходится (инвариант 5).** `specPath` → файл существует;
  `cssRoots: ["svg-icon"]` → правило `.svg-icon{...}` есть в
  `ui/components/data-display.css`; `showcaseAnchor: "c-sprite-icon"` → секция
  существует в `showcase/components.html`. `manifest.notes`,
  `figmaEvidence[1..2]` (`icon/search`, `icon/catalog`) — сверены с MCP заново,
  совпадают дословно, включая `componentKey`.
- **Статус `complete` (пункт 9).** `requiredStates`/`capturedStates` = `["default"]`
  корректно следует из `STATES.md` (N1 не выполнен, `<svg>` не `<a>`/`<button>`
  ни разу за 611 вхождений) — единственное обязательное состояние покрыто.
  Само определение «complete» по METHOD §5 не требует, чтобы смежный, явно
  вынесенный за периметр шага слой (цветовые утилиты) был реализован — статус
  формально корректен, хотя находка 1 показывает, что живой пример при этом
  не воспроизводит цвет продукта для самого частого варианта символа.
- **Гейты — дословно.** Все семь команд прогнаны:
  `measure-selectors.mjs` (0 расхождений, 44 селектора), `validate-components.mjs
  --strict` (55 записей, `complete: 1`, `EXIT=0`), `validate-counts.mjs`
  (28/28 совпадений), `validate-classes.mjs` (7 известных пробелов, `EXIT=0`),
  `validate-showcase-icons.mjs` (8/8 локальных, `EXIT=0`), `node --check
  tools/*.mjs` (без ошибок), `validate-classes.selftest.mjs` (27/27) —
  вывод совпадает с приведённым в `capture.md` дословно, без расхождений.
- **Копируемость и сеть (пункт 8, METHOD §6.1).** Открыл витрину живьём
  (`tools/serve.mjs` + Playwright `msedge`) на 320 и 1400: горизонтального
  overflow нет ни на одной ширине, сетевых запросов к `habr.com`/
  `assets.habr.com` — 0. Подтверждает заявление отчёта, кроме визуального
  результата цвета (см. находку 1).
- **X-60 (`CatalogIcon`).** `componentPath: "./src/components/icons/
  catalog-icon.vue"`, `__htmlLen: 0`, ошибка `instance unavailable` — сверено
  напрямую по `_sources/courses/metadata/stories/icons-catalogicon--
  default.json` и рендеру, совпадает с описанием решения «не сопоставлять».
- **Конфликты источников** (версия спрайта, `componentKey` реестра, CatalogIcon
  vs `sprite.svg#catalog`) — решения обоснованы и подтверждены отдельно по
  каждому пункту выше; ни один не выбирает Figma поверх DOM без записи GAP.
- **Признанные пробелы** (7 из 13 символов не проверены индивидуально в Figma,
  узел рейтинга не найден в макете, клавиатура неприменима) — все три
  зафиксированы честно как GAP, а не как «не найдено» или замалчивание;
  проверка STATES.md подтверждает корректность аргумента N1 для клавиатуры.

## Не проверено

- Точный цвет `#ff960c` (`--color-ui-yellow-500`) в самом продакшене «глазами» —
  не сравнивался напрямую с production-скриншотом символа, потому что
  именных кропов иконки с прода нет (находка 5); полагался на значения токена
  в `ui/tokens.css`, снятые на более раннем шаге (R0-02), не переснятые заново.
- Побайтовое содержимое `sprite.svg` версии `v1.28.0` (Storybook) — сам файл
  этой версии недоступен в архиве `_sources/`, сверялись только имена `id`
  (совпадают), не геометрия/пути символов внутри. Отчёт сам называет это
  ограничением, я его не снял.
- 7 непроверенных индивидуальным запросом имён Figma (`arrow-small`,
  `building`, `cross-large`, `more`, `percents`, `star-rounded-small`,
  `star-empty`) — не проверял сам, потому что отчёт уже честно фиксирует это
  как GAP, а не как факт; довыполнение этих 7 запросов не входит в объём
  ревью (это работа шага, не сверка его утверждений).
(Пункт про сплошную проверку «прилипших» классов вне `star-empty` снят —
см. ниже, дозакрыт сплошным `grep` по всем 10 файлам: пробел внутри
`xlink:href` встречается ровно 11 раз, все — `star-empty`.)
