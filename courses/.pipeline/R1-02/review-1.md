# Ревью R1-02 · снятость состояний — итерация 1

Вердикт: **вернуть на доработку**

Проверено: `.pipeline/R1-02/capture.md`, `components/STATE-CAPTURE.md`,
`ui/state-contract.css`, `components/manifest.json` (диф и партиция всех 55
записей), `.pipeline/R1-02/measure-states.mjs`, `.pipeline/R1-02/dom-dump.json`,
`.pipeline/R1-02/decisions.json`, `components/STATES.md`, `ROADMAP.md`
(Exit criteria R1, R1-01/R1-02 строки), `evidence/source/production/pages/*/dom.html`
(все 10, включая полный поиск `outline-none` по корпусу), `evidence/source/production/css/{inline,external}/*.css`,
`_sources/courses/rendered/*.html` (выборочно — checkbox, switch, select,
tile-filter × 2 story), `git diff` по изменённым файлам. Гейты прогнаны
дословно (см. ниже). Копируемость METHOD §6.1 воспроизведена независимо
настоящим Playwright/Edge на файле вне пакета. Прод и Figma заново не снимались —
только уже лежащий evidence.

## Гейты (прогнано самостоятельно)

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
...
Manifest structure is valid.
EXIT: 0   -- совпадает дословно с capture.md

$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
EXIT: 0   -- совпадает дословно с capture.md

$ for f in tools/*.mjs; do node --check "$f" || echo FAIL; done
$ node --check .pipeline/R1-02/measure-states.mjs
-- без вывода, все синтаксически валидны, как заявлено
```

## Находки

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | major | A.1 / C.11 | `Checkbox` помечен `не снято`/GAP для `checked` и `disabled` (и спорно для `focus-visible`) с явным утверждением «чанк `base-checkbox__*`, которого нет ни в `evidence/source/production/css/`… чанк не загружался ни на одной из 10 страниц». Утверждение ложно: чанк лежит в самом этом каталоге и содержит рабочие правила именно для этих состояний | `components/STATE-CAPTURE.md:188`; факт — `evidence/source/production/css/external/similar-courses.DqXT-MW0.css` | `grep -o '\.base-checkbox[a-zA-Z_-]*{[^}]*}' evidence/source/production/css/external/similar-courses.DqXT-MW0.css` → `.base-checkbox--disabled{opacity:.5}`, `.base-checkbox__wrapper--disabled{cursor:not-allowed}`, `.base-checkbox__input:checked+.base-checkbox__button{background-color:var(--color-ui-black-850);background-image:url(...);border-color:var(--color-ui-black-850)}`, `.base-checkbox__input:focus+.base-checkbox__button{border-color:var(--color-ui-black-400)}`. README самого каталога (`evidence/source/production/css/README.md`) прямо говорит, что `external/` — 12 чанков, снятых вместе с теми же 10 страницами, — значит и довод «не загружался ни на одной из 10» тоже не подтверждён. `checkbox.checked` и `checkbox.disabled` — это `снято — продуктовый стиль`, не GAP; `checkbox.focus-visible` как минимум спорно (реальный `:focus`, не `:focus-visible`, но визуальное изменение есть — тот же приём смягчения, что принят для `select`/`multi-select` через `focus-within`) |
| 2 | major | E.19 | Арифметическая ошибка в headline-цифре: `24 + 20 + 3 + 3 + 1` названо равным **71**, реальная сумма — **51**. Ошибка не единична — повторена дословно в двух документах | `.pipeline/R1-02/capture.md:99` («71 пара снята»); `components/STATE-CAPTURE.md:315` («71 из 92 пар (24 + 20 + 3 + 3 + 1) снято») | `node -e "console.log(24+20+3+3+1)"` → `51`. Собственный скрипт шага (capture.md, тот же раздел, строкой выше) печатает корректные bucket-числа: `captured-style:24, captured-default:20, gap:39, captured-mechanism:3, normative:2, captured-trivial:1, captured-weak:3` — сумма `captured-*` там же **51**, не 71. Ошибка меняет headline-долю «снято» с фактических 51/92 (~55%) до заявленных 71/92 (~77%) — а именно эта доля использована в §5 STATE-CAPTURE.md как опора для аргумента «в духе критерия R1 закрыто» |
| 3 | major | E.19 | Внутреннее противоречие: число уникальных узлов с `outline-none`/`focus:outline-none` названо **30** в трёх местах (`STATE-CAPTURE.md:59,67,101`, включая явную воспроизводимую команду) и **32** в двух других местах того же документа (`STATE-CAPTURE.md:109,205`), оба раза со ссылкой на «§2.1» как источник. Числа не сведены и не объяснены | `components/STATE-CAPTURE.md:59/67/100-101` против `:108-109` и `:205` | Команда из самого документа: `cat evidence/source/production/pages/*/dom.html \| grep -oE '<[a-zA-Z]+[^>]*class="[^*]*outline-none[^"]*"[^>]*>' \| sort -u \| wc -l` → **30**, воспроизведено independently. Ни один альтернативный метод подсчёта, дающий 32, в документе не показан и не назван. Вывод по существу (единственный некомпенсированный узел — `HeaderDropdown`) я перепроверил и подтверждаю независимо от того, 30 это или 32 — но сам факт, что шаг утверждает «проверено дважды разными командами — сходится» (капча капture.md, раздел «Решения при конфликте источников»), а на деле не сходится, — часть находки |

## Что перепроверено и подтвердилось точно (претензий нет)

- **Метод сбора (п.1 задания).** `.pipeline/R1-02/measure-states.mjs` действительно
  читает `component.productionEvidence[].selector` из `manifest.json` (не
  выдуманные селекторы), для каждой записи `sourceScope: production`, тем же
  Playwright-конфигом (`chromium`, канал `msedge`, `javaScriptEnabled: false`),
  что и `tools/measure-selectors.mjs`. `dom-dump.json` содержит все 44/44
  production-записи, сверено программно.
- **Единственный blocking-случай `focus-visible` (п.2).** Полностью
  реконструирован независимо: `cat *.dom.html | grep -oE '<[a-zA-Z]+[^>]*class="[^"]*outline-none[^"]*"[^>]*>' | sort -u`
  даёт ровно **30** строк (при условии убрать префикс имени файла — без
  этого условия та же команда, набранная буквально как в документе, даёт 64,
  см. находку по реплицируемости ниже). Из этих 30: 20 несут в том же классе
  `focus-visible:outline focus-visible:outline-ui-black-400`, 9 — это девять
  разных `<input>` (разные `placeholder`), у каждого проверена родительская
  обёртка на `focus-within:border-ui-black-850` — есть у всех девяти
  (проверено на 3 из 9 вручную, паттерн идентичен), и ровно 1 узел —
  `<button type="button" class="font-inherit … text-ui-white outline-none">`
  — без какой-либо компенсации. По контексту в `dom.html` (соседний `<span
  class="ml-3 …">`, сразу за логотипом, следом `<div class="hidden absolute
  -right-10 top-[40px] …">`) это действительно триггер `HeaderDropdown`.
  Вывод «единственный blocking-случай» подтверждаю.
- **Норматив 1 — фокус `HeaderDropdown` (п.3).** `outline-style: solid` и
  `outline-color: var(--color-ui-black-400)` — буквально те же объявления,
  что несёт продовое правило `.focus-visible\:outline:focus-visible{outline-style:solid}`
  / `.focus-visible\:outline-ui-black-400:focus-visible{outline-color:var(--color-ui-black-400)}`
  (проверено по всем 10 файлам `evidence/source/production/css/inline/*.css`,
  правило есть в каждом). Новых значений не внесено.
- **Норматив 2 — снятие зажима `LinkGrid` (п.3).** Правило `.crs-link-grid[data-state="expanded"]{max-height:none}`
  — единственное объявление в блоке, ничего кроме `max-height` не трогает;
  собственный факт-источник (`overflow-hidden.max-h-[94px]`, 5/5 вхождений
  на трёх страницах) проверен и совпадает.
- **Конфликт `Select` (п.4).** Прод: `<input class="cursor-pointer …">`
  внутри `.v-popper--theme-dropdown`, подтверждено прямой выпиской из
  `evidence/source/production/pages/rating/dom.html`. Storybook: `<button
  role="combobox" aria-expanded="false" … disabled:ring-1 disabled:ring-inset
  disabled:ring-ui-black-500>`, подтверждено прямой выпиской из
  `_sources/courses/rendered/forms-basecustomselect--base-story.html`. Два
  разных узла не смешаны в одну запись без пометки: `select.disabled` явно
  подписан как источник Storybook, семантика/API — прод. Претензий нет.
- **Спот-проверка пар (п.5), 14 пар вместо требуемых 10–12, из них 4 GAP:**
  `social-icon.hover` (captured, `hover:opacity-80` — подтверждено на 3
  страницах), `filter-chip.selected` (captured, но см. долг ниже),
  `select.disabled` (captured via Storybook — подтверждено), `switch.hover`/
  `switch.focus-visible`/`switch.checked` (captured — все три класса
  `enabled:group-hover:bg-ui-black-50`, `peer-focus-visible:outline`,
  `peer-checked:bg-ui-black-850 …` подтверждены прямой выпиской из story),
  `avatar.empty` (captured — фактическое число фолбэков `user_avatar_2.svg`
  пересчитано: 23, совпадает), `carousel.current` (captured —
  `swiper-slide-active` пересчитано: 16, совпадает), `tile-filter.selected`
  (captured — сравнение двух story подтверждено дословно), `tile-filter.hover`/
  `tile-filter.focus-visible` (GAP — подтверждено: ни один класс `hover:*`/
  `focus-visible:*` не найден ни в одной из двух story), `header-dropdown.focus-visible`
  (норматив — см. выше), `checkbox.*` (GAP — **не подтверждено**, находка 1).
- **Долг R1-01 по `filter-chip` (п.6).** Пересчитан независимо и подтверждён
  точно: у пяти страниц (`education-center`, `education-centers-listing`,
  `promocodes`, `reviews`, `schools-for-children`) ровно по одному
  «выбранному» чипу (`bg-ui-black-850`), который заявленный
  `productionEvidence[0].selector` (требует `.bg-ui-white.border-ui-black-100`)
  не находит; заявленный `occurrences: 107` действительно занижен на 5
  (истинное число — 112). Шаг корректно не полез чинить принятую запись
  R1-01 (`ed8d69f`) и оставил строку долга в `capture.md`, а не в
  `ROADMAP.md` — это разумно на границе одного шага, доводить до строки
  `X-*` в роадмапе — дело приёмки, не блокирует эту итерацию.
- **Копируемость METHOD §6.1 (п.7).** Воспроизведено независимо, файл вне
  пакета, реальный Playwright/Edge, реальная клавиатурная фокусировка (не
  программный `.focus()`, чтобы честно взвести `:focus-visible`): 1
  подключённый `stylesheet` (`ui/courses.css`), 0 `pageerror`/`console.error`,
  после `Tab` на триггер `document.activeElement.matches(':focus-visible')
  === true`, `outlineStyle: 'solid'`, `outlineColor: 'rgb(166, 167, 169)'`
  — точное совпадение с `--color-ui-black-400: #a6a7a9`. `LinkGrid`:
  `max-height` вычисляется как `none` при `data-state="expanded"`,
  контент реально не обрезается.
- **Партиция `manifest.json` (программно, все 55 записей).** Каждая пара
  (запись, состояние из `requiredStates`) попадает ровно в один из трёх
  массивов `capturedStates`/`normativeStates`/`uncapturedStates`, ни одного
  пропуска, ни одного постороннего значения, `default` всегда в
  `capturedStates`. Суммарно 55 default + 51 captured (не 71, см. находку 2)
  + 2 normative + 39 uncaptured = 147. Гейты `validate-components --strict` и
  `validate-counts` подтверждают структуру и числа реестра дословно, как
  указано в `capture.md`.
- **Диф вне заявленного.** `git diff --numstat` по `manifest.json` — 391
  чистых добавлений, 0 удалений (три новых массива на каждой записи + один
  top-level ключ, без порчи существующих полей). `ui/courses.css` — 5/3
  (импорт + правка комментария), совпадает с `capture.md`.

## Найдено дополнительно (не блокирует, но стоит отметить)

- **Реплицируемость двух документированных команд, не связанная с найденными
  major.** Команда `grep -oE '<[a-zA-Z]+[^>]*class="[^"]*outline-none[^"]*"[^>]*>'
  evidence/.../pages/*/dom.html | sort -u | wc -l`, набранная **буквально**
  как в `STATE-CAPTURE.md:55-57` (несколько файлов через `*`, без `-h`),
  даёт **64** на этой системе (по умолчанию `grep` добавляет имя файла перед
  совпадением при нескольких файлах, и `sort -u` тогда не схлопывает
  одинаковый текст между страницами) — совпадает с 30 только через
  `cat *.html | grep …` или `grep -h`. Аналогично `grep -o
  'focus-visible:outline' evidence/.../pages/*/dom.html | wc -l` (`STATES.md:225`,
  принято R1-01, процитировано этим шагом как факт) даёт **382**, не 191, —
  подстрока `focus-visible:outline` совпадает и как самостоятельный класс, и
  как префикс `focus-visible:outline-ui-black-400`, поэтому считается дважды
  без учёта границы слова. Оба итоговых **числа фактически верны** (я
  перепроверил через границу токена: 30 и 191 воспроизводятся точно), но
  команды, приведённые как «воспроизводимый замер», без модификации не
  воспроизводят собственный результат. Второе унаследовано от принятого
  R1-01 и не входит в объём этого шага — фиксирую как долг, не как находку
  против R1-02, но так как `STATE-CAPTURE.md` (продукт этого шага) заново
  ссылается на «191» как на опору вывода, стоит поправить хотя бы
  собственную команду (первую) в этом шаге.
  → **minor**, в roadmap как долг по обеим командам, если вердикт когда-нибудь
  станет «принять с замечаниями».
- `components/INDEX.md` изменён (шесть строк, документирует новые поля
  манифеста), но не упомянут в разделе «Файлы» `capture.md`. Само изменение
  уместное и безвредное. → **note**.

## Ответ по exit criteria волны R1 (отдельный раздел, как просили)

Текст `ROADMAP.md`: «Для каждого состояния сказано, снято оно или дописано» —
грамматически бинарный. Проверено программно: буквально бинарному прочтению
удовлетворяют 53 из 147 пар (51 captured + 2 normative), остальные 39 явно
поименованы как GAP с адресом, а не молчанием.

**Прямой ответ: разметка удовлетворяет духу критерия, но не его буквальному
тексту — и это правильный выбор, а не обход.** Ни одна из 147 пар не осталась
безымянным пробелом: каждая либо снята источником, либо дописана нормативом,
либо явно адресована именем состояния + записи + будущим шагом. Требование
буквально дописать CSS для всех 39 (в частности, для открытых раскладок
`Select`/`MultiSelect`/`FilterModal`/`CatalogMenu` и содержимого пустого
`CardGrid`) означало бы придумывать структуру, которую ни прод, ни Storybook,
ни Figma нигде не показывают, — то есть напрямую нарушить METHOD §4 ради
формального попадания в два слова роадмапа. Из двух документов пакета METHOD
имеет приоритет как контракт более высокого уровня.

Это означает: **интерпретацию шага я принимаю**, но **саму волну R1
закрывать пока рано** — не из-за трактовки критерия, а из-за конкретных
дефектов найденных 1–3: минимум два состояния (`checkbox.checked`,
`checkbox.disabled`) промаркированы GAP при том, что реальный продуктовый CSS
для них лежит прямо в `evidence/source/production/css/external/`, и headline-
число «снято» в обоих документах шага (71) не совпадает с фактическим (51) —
на минус 20 пар, что искажает ту самую пропорцию, на которую опирается
аргумент «в духе критерия закрыто». После исправления находок 1–3 (правка
трёх строк в `STATE-CAPTURE.md`, пересчёт `manifest.json` для двух пар и
исправление арифметики в двух местах) трактовка и общий вывод «критерий
закрыт в духе, не по букве» останутся в силе без изменений — это не повод
переделывать шаг с нуля.

## Не проверено

- Все 9 узлов `focus-within`-компенсации (Select/MultiSelect/SearchInput) —
  проверено выборочно 3 из 9 (courses-listing, rating × 2 filter), остальные
  6 не пройдены построчно; паттерн класса идентичен на всех 30 строках
  дампа, поэтому расхождение маловероятно, но не исключено на 100%.
- Полный построчный обход всех 147 пар (55 default + 92 прочих) —
  проверено 14 репрезентативных пар из разных категорий (примитивы, поля
  форм, модули; captured/normative/GAP), не все 147 построчно — тайминг
  ревью не рассчитан на построчную сверку каждой пары, метод и подозрительные
  места (checkbox, headline-числа) проверены прицельно.
- `_sources/courses/rendered/*.html` — прочитаны выборочно 4 из 27
  (checkbox, switch, select, tile-filter ×2), не все 27 заново; для
  остальных 23 доверяю утверждению шага, что они прочитаны полностью
  (250–1800 байт каждый — правдоподобно для такого метода), но не
  перепроверял каждый файл лично.

ОТЧЁТ: `courses/.pipeline/R1-02/review-1.md`
