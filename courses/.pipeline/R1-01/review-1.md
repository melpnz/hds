# Ревью components/STATES.md, manifest.json → requiredStates — итерация 1

Вердикт: **принять с замечаниями**

Проверено: `.claude/guide/METHOD.md`, `.claude/guide/review-checklist.md`,
`courses/.pipeline/R1-01/capture.md`, `courses/components/STATES.md` (полностью,
348 строк), `courses/components/manifest.json` (программно, все 55 записей),
`courses/BRIEF.md` §9, `courses/ROADMAP.md` (блок R1 и exit criteria).
`career/` не открывался.

Команды: `node tools/validate-components.mjs --strict`,
`node tools/validate-counts.mjs`, `node --check tools/*.mjs` — прогнаны заново,
вывод сверен с `capture.md` построчно. Пересчитаны `grep`/`node`-подсчётами по
`evidence/source/production/pages/*/dom.html` (10 файлов): `hover:` (1182),
`focus-visible` (382 = 191+191 двух разных утилит), `focus-visible:outline`
токеном (191, день-в-день с `manifest.json` → `button.occurrences`),
`disabled=""` (4, все на `rel="prev"` стрелке карусели), `aria-current="page"`
(4, все на `SegmentedControl`), `swiper-slide-active` (16, день-в-день с
`carousel.occurrences`), фолбэки аватара/лого (15+23, 10+4), оверлейные
`z-1`/`z-2 absolute … top-0` (68 и 158). Проверена структурная непротиворечивость
матрицы §3 программно по всем 55 записям (0 нарушений). Проверен `git diff` —
изменения confined к `manifest.json` (только `requiredStates` +
`requiredStatesMatrix`) и новому `STATES.md`.

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | minor | E.19 | Капча (протокол) обещает явное «не включено, потому что…» для `AvatarStack.empty` в одном ряду с `FilterChip.disabled` и `Carousel.empty`, но строка `avatar-stack` в `STATES.md` объясняет только отсутствие N1 («сама не ссылка и не переключатель») и ни словом не упоминает N7/N8 — почему `empty` не открыт, хотя `AvatarStack` рендерит переменную коллекцию аватаров. Структурно матрица §3 и так ставит `component` × `empty` = «—», но этот прочерк не входит в перечень обоснованных структурных прочерков (там объяснены только `primitive`, `component`×expanded/collapsed, `module`, `adapter`) — решение верное по исходу, но не подкреплено текстом, который сам шаг обещал дать | `components/STATES.md:264` (ряд `avatar-stack`), ср. `:268` (`filter-chip`) и `:293` (`carousel`), где такое объяснение есть; обещание — `.pipeline/R1-01/capture.md`, раздел «Метод разметки», п.4 | Прочитать ряд `avatar-stack` в §4.3 — фразы про N7/N8 там нет |
| 2 | minor | E.19 / A.5 | Раздел «Долг, не входящий в объём шага» в `capture.md` утверждает: «в снятом DOM десяти страниц нет ни кнопки раскрытия… рядом с `max-h-[94px]`-блоком» — это неверно. Прямой `grep`/разбор показывает: во всех 5 вхождениях `max-h-[94px]` (courses-listing, education-centers-listing ×2, promocodes ×2) сразу после закрытия сетки идёт `<button type="button" class="mt-4 … text-ui-blue-500 …">Смотреть все</button>` в той же секции (без `</section>` между сеткой и кнопкой). Кнопка раскрытия есть, просто без `aria-expanded` — это не то же самое, что «кнопки нет». На `requiredStates` `LinkGrid` (`expanded`/`collapsed` по N5, через доверие `manifest.json` → `notes`) это не влияет — решение верное, но опорный факт в протоколе шага сформулирован неточно и может увести шаг вёрстки `LinkGrid` (R5) в сторону несуществующего противоречия | `.pipeline/R1-01/capture.md`, раздел «Долг…», пункт про `LinkGrid`; проверяется в `evidence/source/production/pages/{courses-listing,education-centers-listing,promocodes}/dom.html` поиском `max-h-[94px]` → далее `<button` в той же секции | `grep -o 'max-h-\[94px\]' */dom.html` даёт 5 вхождений; для каждого следующий `<button` — «Смотреть все» в той же секции, без `</section>` между |

## Что проверено и претензий нет

- **Словарь (METHOD §5)**: `allowedStates` в манифесте побайтово совпадает со
  списком METHOD.md (порядок и состав идентичны). Запрещённые слова
  (`active`, `focus`, `select`, `inactive`) в `STATES.md` встречаются только
  как цитаты продовых классов (`router-link-active`, `swiper-slide-active`,
  CSS-псевдокласс `:active`) или в самой таблице нормализации — ни разу как
  имя состояния. В `requiredStates` всех 55 записей манифеста — 0 слов вне
  словаря из 20, 0 запрещённых слов. Механическая сверка чистая.
- **`requiredStates` заполнены у всех 55 записей** без исключения (проверено
  программно), `requiredStatesMatrix.status` — `"done"` (было `"pending"`),
  добавлен `ref: "components/STATES.md"` и содержательный `note`.
- **Числа доказательства** — из перепроверенных лично (список выше) все
  совпали точно, включая тонкий случай `focus-visible:outline` (191) —
  наивный `grep -o` с классом символов даёт 382 из-за наложения на
  `focus-visible:outline-ui-black-400`, но при точном совпадении токена
  (границы — кавычка/пробел) получается ровно 191/191, как в `STATES.md`.
- **Оверлейная ссылка карточек** — прямой разбор `dom.html` подтвердил
  утверждение дословно: `CourseCard`/`ArticleCard`/`PersonCard` —
  `<a class="z-2 absolute bottom-0 left-0 right-0 top-0" href="…">` (внешние
  courses для CourseCard/ArticleCard, `/courses/authors/…` для PersonCard);
  `SchoolCard` — тот же паттерн с `z-1` и `href="/education_centers/…"`.
  `PromoCard` — внутри только `<button target="_self">Открыть код</button>`,
  оверлея на корне нет. `AdCard` — внутри только два `<img>` и вложенная
  кнопка закрытия `24×24`, оверлея на корне нет. Разница подтверждена как
  факт по каждой записи, не усреднена.
- **Три конфликта источников** — все обоснованы фактом, не сглажены:
  `Select` — `<input class="… focus:outline-none …">` внутри
  `<span class="… focus-within:border-ui-black-850 …">` (подтверждено
  прямой выпиской), решение зафиксировать иную механику фокуса верное;
  `SegmentedControl` — `aria-current="page"` буквально на всех 4 вхождениях,
  выбор слова `current` обоснован METHOD §3; `PromoCard`/`AdCard` против
  четырёх карточек — разница держится по записи, факт подтверждён (см. выше).
- **Матрица по видам (§3)** — программно проверена на всех 55 записях:
  ни одна `primitive`-запись не несёт состояния, объявленного «—» для вида
  (`selected`/`current`/`checked`/`indeterminate`/`expanded`/`collapsed`/
  `open`/`closed`/`disabled`/`readOnly`/`loading`/`invalid`/`error`/`success`/
  `dragActive`), ни один `component` не несёт `expanded`/`collapsed`, ни один
  `module` не несёт `selected`/`checked`/`indeterminate`/`disabled`/
  `readOnly`/`invalid` — 0 нарушений. Счёт по видам — 11/16/28/0
  (`primitive`/`component`/`module`/`adapter`), совпадает с заявленным.
  Строка `adapter` — действительно 0 из 55 записей `kind: adapter`
  (проверено), контракт на будущее размечен честно.
- **Восемь сигналов (N1–N8)** — проверены на выборке из 10 записей разных
  категорий (`sprite-icon`, `link`, `avatar`, `button`, `filter-chip`,
  `segmented-control`, `select`, `card-grid`, `carousel`, `link-grid`,
  плюс шесть карточек-модулей): в каждом случае сигнал применён к тому факту,
  который он реально открывает, и `requiredStates` записи ему соответствует.
  `RatingTable` и `ReviewCard` — отдельно проверены выпиской: у RatingTable
  строка — настоящий `<a class="grid … hover:cursor-pointer
  hover:bg-ui-black-50 …">` без выделенной `focus-visible:`-утилиты (что и
  утверждает ряд §4.4); у ReviewCard плашка — `<div class="…
  hover:bg-ui-black-100">`, не `<a>`/`<button>` (ослабленный `hover`
  корректен).
- **Три признанных пробела** — `Select`/`MultiSelect`/`HeaderDropdown`/
  `FilterModal`/`CatalogMenu.open` по природе оверлея (N5) — законно, съёмка
  раскладки явно оставлена R1-02/шагам вёрстки, не выдана за наблюдение.
  `LinkGrid.expanded`/`collapsed` через доверие принятому `manifest.json` →
  `notes` — законное доверие принятому факту (доверие подтвердилось: кнопка
  «Смотреть все» действительно существует во всех 5 случаях, см. находку 2 —
  дело не в решении, а в неточной формулировке debt-заметки).
  `CardGrid.empty` — явно помечено выводом по структурной природе и
  косвенным Figma-модулем `EmptyState`, не выдано за наблюдение прода;
  `EmptyState.figmaEvidence` в манифесте существует и подтверждает
  косвенную связь.
- **Гейты** — все три команды прогнаны заново и дают вывод, дословно
  совпадающий с зафиксированным в `capture.md`: `validate-components.mjs
  --strict` (55 записей, блок «Отложено» сократился до 1 строки — про
  55 planned-спецификаций, строка про `requiredStates` действительно исчезла),
  `validate-counts.mjs` (28/28 совпадений), `node --check` по семи файлам
  инструментов — синтаксис валиден.
- **Разграничение «требуется по природе» vs «снято в проде»** — выдержано:
  вступление и §4.1 `STATES.md` explicitly различают применимость и съёмку;
  `ROADMAP.md` R1-02 отдельно назначена задача «разметить, какие состояния
  не сняты» — шаг R1-01 в это не лезет, конфликта с exit criteria R1 нет.
- **Объём изменений** — `git diff` подтверждает: правки confined к
  `manifest.json` (`requiredStates` + `requiredStatesMatrix` полей) и новому
  файлу `STATES.md`; ничего лишнего не задето (`occurrences`, `notes`,
  `productionEvidence` и т.д. не тронуты).

## Не проверено

- Полные 55×8 сочетаний сигнал↔запись не прогонялись построчно — проверена
  осознанная выборка (10 записей + отдельная сверка 6 карточек), остальные
  45 записей проверены только программно на структурное соответствие матрице
  §3 (0 нарушений), не на смысловую точность обоснования в колонке
  «Обоснование». Если у следующей итерации будет время — стоит выборочно
  добрать ещё 5–10 записей другой категории (например, оставшиеся
  `module`-записи с `default`-only, чтобы убедиться, что там действительно
  нет пропущенного N1/N7).
- Спецификации компонентов (`components/<category>/<id>.md`) не существуют
  ни у одной записи (`status: planned` у всех 55, `specs: 0` в
  `validate-counts.mjs`) — соответственно раздел «Состояния» спецификации
  сверить не с чем; это ожидаемо по объёму шага (спецификации — предмет
  волн R2–R5), не находка этого шага.
