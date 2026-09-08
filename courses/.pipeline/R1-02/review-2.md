# Ревью R1-02 · снятость состояний — итерация 2

Вердикт: **принять**

Проверено: `.pipeline/R1-02/fix-1.md`, `.pipeline/R1-02/review-1.md`,
`.pipeline/R1-02/capture.md`, `components/STATE-CAPTURE.md` (целиком, 443
строки), `components/manifest.json` (запись `checkbox` целиком + программная
проверка партиции всех 55 записей), `.pipeline/R1-02/decisions.json` целиком,
`evidence/source/production/css/external/similar-courses.DqXT-MW0.css` (прямым
чтением, не по цитате), `evidence/source/production/css/{inline,external}/*.css`
(полный `grep -rl 'base-checkbox'` по всем 22 файлам), `_sources/courses/rendered/*.html`
(5 storybook-only story — checkbox, multi-select, switch, tile-filter × 2,
filter-modal × 2), `git status`/`git log` по `courses/` (подтверждение, что
`STATES.md`, `ROADMAP.md`, `CHANGELOG.md` не тронуты). Гейты прогнаны
дословно. Прод и Figma заново не снимались — только уже лежащий evidence.

## Гейты (прогнано самостоятельно)

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}
Manifest structure is valid.
EXIT: 0   -- совпадает дословно с fix-1.md

$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
EXIT: 0   -- совпадает дословно с fix-1.md

$ for f in tools/*.mjs; do node --check "$f" || echo FAIL; done
-- без вывода, все синтаксически валидны
```

## Проверка находок review-1 по пунктам задания

**1. `Checkbox` — пересчитано самостоятельно.** Прямым чтением
`evidence/source/production/css/external/similar-courses.DqXT-MW0.css`
подтверждены все четыре правила буквально: `.base-checkbox__input:checked+.base-checkbox__button{background-color:…;border-color:var(--color-ui-black-850)}`,
`.base-checkbox--disabled{opacity:.5}`, `.base-checkbox__wrapper--disabled{cursor:not-allowed}`,
`.base-checkbox__input:focus+.base-checkbox__button{border-color:var(--color-ui-black-400)}`.
`checked`/`disabled` — реально сняты, реклассификация верна. `focus-visible`-
как-`:focus`: проверил рендер story (`common-basecheckbox--base-checkbox-story.html`)
— `<input type="checkbox" class="base-checkbox__input visually-hidden">` —
нативный инпут визуально скрыт, а видимый прокси-элемент (`.base-checkbox__button`)
получает изменение цвета рамки по соседнему `:focus`. Это структурно другой
механизм, чем `:focus-within` на обёртке у `select`/`multi-select`/`search-input`
(там — предок реагирует на фокус потомка; здесь — сосед реагирует на фокус
через `+`-комбинатор), но по существу та же роль: скрытый инпут теряет
видимый браузерный контур, видимый прокси его замещает. Обе группы
классифицированы одним и тем же bucket `captured-mechanism` в
`decisions.json` (`select.focus-visible`, `multi-select.focus-visible`,
`search-input.focus-visible`, `checkbox.focus-visible` — все четыре), так что
аналогия не просто заявлена текстом, а проведена и в машиночитаемом слое
одинаково. `hover`/`indeterminate` — отрицательное утверждение проверено
собственным полным `grep`: ни в `similar-courses.DqXT-MW0.css`, ни в
любом из 10 `inline/*.css` + 12 `external/*.css` (все 22 файла корпуса,
не выборка) нет ни одного правила `:hover`/`:indeterminate`/`aria-checked="mixed"`
для `.base-checkbox*`. Претензий нет.

**2. «Чанк не пропущен для других записей» — перепроверено независимо
и более полно, чем в самом fix-1.** Список storybook-only записей (5:
`multi-select`, `checkbox`, `switch`, `tile-filter`, `filter-modal`)
получен из `manifest.json` программно. Прямым чтением рендеров
(`forms-multiselect--base-story.html`, `common-baseswitch--base-switch-story.html`,
`common-basefilterwithimage--default.html`, `common-basefiltermodal(new)--default.html`)
подтверждено: все четыре — сплошные Tailwind-утилиты (`focus-within:*`,
`peer-focus-visible:*`, `enabled:group-hover:*`, `disabled:*`), ни одного
класса вида `word__word` (проверено `grep -oE '[a-z0-9-]+__[a-z0-9-]+'` —
0 совпадений во всех четырёх файлах). Кроме того, независимо проверено
шире, чем просило задание: `grep` по **сериализованному целиком**
`manifest.json` (все 55 записей, не только 5 storybook-only) на паттерн
`base-[a-z]+__` — совпадение только у `checkbox`. И отдельно — сам чанк
`similar-courses.DqXT-MW0.css` содержит ровно два BEM-семейства классов
(`base-checkbox__*` и `header-catalog__*`/`header-catalog-menu-*`), второе —
уже задокументированная побочная находка про `CatalogMenu`, не пропущенная
третья запись. Логика билдера подтверждается полностью и без исключений.

**3. Арифметика 54 — пересчитано и сверено с партицией.** `26+20+4+3+1=54`
арифметически верно. Прогнан подсчёт полноты по `decisions.json` — бакеты
совпадают дословно с `capture.md`/`STATE-CAPTURE.md`
(`captured-style:26, captured-default:20, captured-mechanism:4,
captured-weak:3, captured-trivial:1, normative:2, gap:36`, сумма 92,
`missing: []`). Дополнительно прогнана партиция по всем 55 записям
манифеста программно: `capturedStates ∪ normativeStates ∪ uncapturedStates`
покрывает `requiredStates` каждой записи без пропуска и без постороннего
значения, пересечений нет, `default` есть в `capturedStates` каждой
записи. Суммарно 109 captured (55 default + 54 non-default) + 2 normative +
36 uncaptured = **147**, без дыр. Правка `Checkbox` партицию не сломала.

**4. 30 узлов outline-none — согласовано, «32» больше нет как живое
утверждение.** Оба документа проверены `grep -n '\b32\b'` — единственные
два оставшихся упоминания «32» явно описывают прошлую ошибку («здесь
ошибочно стояло 32», «по ошибке стояло 32/31»), не текущий вывод. Команда
`grep -hoE … | sort -u | wc -l` (с `-h`) действительно даёт 30 при
самостоятельном запуске.

**5. Отказ трогать `STATES.md:225` (R1-01) — решение верное.** `git log`/
`git status` подтверждают: `STATES.md` в рабочем дереве не изменён,
последний коммит по нему — `ed8d69f` (принятая R1-01). Файл не в объёме
R1-02, и METHOD не требует чинить чужой принятый файл ради находки,
обнаруженной в другом шаге — долг зафиксирован в двух местах (`capture.md`,
`STATE-CAPTURE.md` §6) с адресом. Число `382 vs 191` воспроизведено
самостоятельно второй раз независимо: буквальный `grep -o 'focus-visible:outline'`
без учёта границы токена даёт 382 (двойной счёт из-за подстроки
`focus-visible:outline-ui-black-400`), с учётом границы — 191. Совпадает
с обоими предыдущими замерами (review-1 и это ревью) — число устойчиво
воспроизводится, это не случайность запуска.

**6. Побочная находка `CatalogMenu.open` — решение верное.** Проверено
прямым чтением CSS: чанк действительно содержит
`.header-catalog__icon-item--hidden` и Vue-переходы
`.header-catalog-menu-enter-active/-leave-active/…` — по имени похоже на
механику открытия каталога. Запись `catalog-menu` в `manifest.json`
проверена — не тронута (`sourceScope: figma-only`, `open` всё ещё `gap`),
как и заявлено. Решение задокументировать, но не переклассифицировать,
верно: у находки нет второго независимого источника (DOM-узел ни разу не
пойман раскрытым), а переклассификация по одному лишь совпадению имён
классов была бы новой недоказанной догадкой — ровно тот класс ошибки,
который правился в этой же итерации (находка 1 review-1). Правильно
оставлено долгом на шаг вёрстки `CatalogMenu` (R4-13).

**7. Партиция `manifest.json` — подтверждена программно, не сломана.**
См. пункт 3 выше — 0 ошибок партиции на всех 55 записях после правки
`Checkbox`.

## Что проверено и претензий нет

- Все 3 major и обе выделенные minor из review-1 закрыты по существу,
  не подгонкой текста — проверено прямым чтением источника, а не по цитате
  из fix-1.md.
- Гейты (`validate-components --strict`, `validate-counts`, `node --check`)
  проходят дословно, числа не изменились относительно капчи (`roadmapSteps:76`,
  `elements:55`, `tokens:51`, `manifest:55`, `scopeProduction:44` и т.д.) —
  ожидаемо, шаг не трогал `ROADMAP.md`/`ui/tokens.css`/инвентаризацию.
- `STATES.md`, `ROADMAP.md`, `CHANGELOG.md` не изменены рабочим деревом
  (git status чист по этим файлам) — правки не вышли за пределы объёма шага.
- `ui/state-contract.css`, `ui/courses.css` (импорт `state-contract.css`
  подключён между `utilities.css` и `components/*.css`) — не тронуты этой
  итерацией, оба норматива (`HeaderDropdown.focus-visible`,
  `LinkGrid.expanded`) остаются в силе без изменений.
- Классификация `captured-mechanism` для `checkbox.focus-visible` не только
  заявлена текстом как аналогия, но и фактически совпадает по bucket'у с
  `select`/`multi-select`/`search-input.focus-visible` в машиночитаемом
  `decisions.json` — согласованность подтверждена на уровне данных, не
  только прозы.
- Note-находка (`components/INDEX.md` не упомянут в «Файлы») закрыта.

## Не проверено

- Полный построчный обход всех 147 пар заново (не входит в объём этой
  итерации — задание просило целевую проверку конкретных находок review-1,
  не повторную сплошную ревизию; метод сбора и репрезентативная выборка
  пар подтверждены в review-1 и не пересматриваются).
- Гипотетическое наличие других BEM-CSS-чанков в корпусе, которые могли бы
  относиться к каким-то из 55 записей помимо `checkbox`/`catalog-menu`, —
  за пределами объёма находки 1 (она была именно про `Checkbox`); не
  проверял весь корпус на предмет новых пропусков за рамками того, что уже
  нашёл и задокументировал долгом сам шаг.

## Ответ по exit criteria волны R1 (для исправленных данных)

Трактовка подтверждена на review-1 и не переоткрывается. Применительно
к исправленным числам вывод не меняется и становится чище: 147 пар — 109
captured (55 default + 54 non-default, было ошибочно 71) + 2 normative +
36 явных GAP с адресом (было ошибочно посчитано 39 из-за неверной
классификации `Checkbox`). Ни одна пара не осталась безымянным пробелом —
критерий закрыт **в духе, не по букве**, и это правильный выбор: требовать
дописать CSS для всех 36 (открытые раскладки `Select`/`MultiSelect`/
`FilterModal`/`CatalogMenu`, содержимое `CardGrid.empty` и пр.) означало бы
придумывать структуру, которую ни один источник не показывает — прямое
нарушение METHOD §4. С устранением находок 1–3 review-1 у этого вывода
больше нет опоры на неверную арифметику: пропорция снято/GAP (109+2 из 147,
36 явных GAP) теперь фактически точна, а не завышена на 20 пар, как было
до правки. **Волну R1 (2/2 шага) можно закрывать** — предмет
приёмки, не этого отчёта.

ОТЧЁТ: `courses/.pipeline/R1-02/review-2.md`
