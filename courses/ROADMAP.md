# Courses — роадмап

Волны и шаги сборки пакета знаний «Хабр Курсы». ТЗ и границы — [`BRIEF.md`](BRIEF.md),
реестр найденного — [`.pipeline/inventory.json`](.pipeline/inventory.json).

Статусы шагов: `planned` → `in-progress` → `review` → `done`. Статус `done`
ставит только приёмка (`guide-accept`); `blocked` пишется вместе с причиной.
Всё, что найдено по ходу и не входило в шаг, попадает сюда строкой, а не чинится
молча.

Дата сводки: **8 сентября 2026**.

---

## Где пакет сейчас

| | |
|---|---|
| Режим | новый пакет, инвентаризация закрыта |
| Элементов в реестре | **55** — R2 12 · R3 15 · R4 14 · R5 14 |
| Страниц снято | **10** на шести ширинах (320 · 375 · 744 · 768 · 1024 · 1440), гостем; 6 отмечены ключевыми примерами |
| Семейств страниц | 5: листинг, таблица, сущность, промо-раздел, профиль |
| Шагов в роадмапе | **76** |
| Принято шагов | 1 — R0-01, 8 сентября 2026 |
| Компонентов в manifest | 0 — вёрстка не начата |
| Проверки | `validate-components` · `validate-classes` · `validate-counts` заведены и запускаются; `validate-components` зелёным станет с реестром (R0-05) |

---

## Волны

| Волна | Что закрывает | Шагов | Статус |
|---|---|---|---|
| **R0** | каркас пакета: структура, токены, foundations, manifest, проверки, пустая витрина | 7 | in-progress |
| **R1** | словарь состояний и матрица обязательных | 2 | planned |
| **R2** | примитивы: иконки, аватары, чипы, бейджи, текстовый блок | 12 | planned |
| **R3** | базовые компоненты: кнопки, поля, фильтры, навигация — **Core Gate** | 15 | planned |
| **R4** | каркасные модули: шапка, футер, hero, секции, сетки, фильтры — **R4 Gate** | 14 | planned |
| **R5** | entity-модули: карточки сущностей продукта | 14 | planned |
| **R6** | ключевые страницы: по одной на семейство | 5 | planned |
| **R7** | принципы: правила композиции и Decision Guides | 3 | planned |
| **R8** | машинный слой и контракт для модели-потребителя | 4 | planned |

Волны не смешиваются: R4 не начинается до Core Gate, R6 — до закрытия R5.

Черновой слой правил каркаса и сетки допускается сразу после R0 — без него
не собрать модули. Он помечается черновиком и пересматривается в R7.

---

## R0 — каркас пакета

| Шаг | Что делаем | Источники | Зависит от | Статус |
|---|---|---|---|---|
| R0-00 | Досъёмка 10 страниц на канонических 320 и 744: dom, computed, tokens, png. Обоснование — раздел «R0-00» ниже | 10 URL из §2 BRIEF | — | review |
| R0-01 | Структура папок по METHOD §2, `package.json`, `tools/{capture,serve,validate-components,validate-classes,validate-counts}.mjs` | образец `career/` | — | done |
| R0-02 | `ui/tokens.css` — 52 переменные `:root` | [`/courses`](https://career.habr.com/courses) `tokens.json` · [education-lib colors](https://www.figma.com/design/KG36iTkwvKDmrw8XQhk7d6/education-lib?node-id=33-15585) | R0-01 | planned |
| R0-03 | `ui/foundations.css` — типографическая шкала `text-h1 · h1-mobile · h2 · h3 · h4 · default · small · micro · caps`, база документа, Inter | `computed.json` 10 страниц · Storybook `common-typography--typography` | R0-02 | planned |
| R0-04 | `ui/layout.css` — контейнер 1124 + 24, `grid gap-12`, брейкпоинты `phone` / `tablet` / `tablet-only` | 10/10 страниц | R0-03 | planned |
| R0-05 | `components/manifest.json`, `components/INDEX.md`, шаблон спецификации | `.claude/guide/spec-template.md` | R0-01 | planned |
| R0-06 | Пустая витрина `showcase/components.html`; вся оболочка витрины — под префиксом `doc-` (классы) и `--doc-` (переменные); `tools/serve.mjs` | образец `career/showcase/` — **кроме именования**, см. ниже | R0-05 | planned |

**Результат R0-01** (принят 8 сентября 2026). Каркас пакета по METHOD §2 стоит
и переживает коммит: точка подключения `ui/courses.css` с 13 `@import` открывается
в браузере без единого 404, пять инструментов в `tools/` запускаются, свой порт
4179 разводит локальный сервер с `career/`. `capture.mjs` перестал скрывать
непроснятые ширины — неполный evidence теперь даёт код 1, а не «Снято».
Первый коммит пакета: до него ни один файл `courses/` не был в git.

**Exit criteria R0.** `ui/courses.css` подключается одной строкой и отдаёт
токены и шкалу; витрина открывается по `npm run serve`; валидатор запускается
и проходит на пустом реестре; CSS витрины не пересекается с `ui/` — ни одним
селектором, а не только переменной.

Инвариант METHOD §6.2 требует собственного префикса для **всей**
документационной оболочки, то есть прежде всего для имён классов. Образец
`career/showcase/components.css` его нарушает: 100 селекторов без префикса,
среди них `.layout`, `.main`, `.nav`, `.callout`, `.hint`, `.legend`. Курсам
это копировать нельзя — там классы вида `.doc-layout`, `.doc-nav`. `career/`
read-only, поэтому исправление возможно только на своей стороне.

---

## R1 — словарь состояний

| Шаг | Что делаем | Источники | Зависит от | Статус |
|---|---|---|---|---|
| R1-01 | `components/STATES.md` — закрытый словарь METHOD §5 и матрица обязательных по видам | METHOD.md · `career/components/STATES.md` | R0-05 | planned |
| R1-02 | Разметить, какие состояния в проде не сняты, и зафиксировать их как нормативные в `ui/state-contract.css` | снимки 10 страниц: `hover:` есть в разметке, `focus-visible` объявлен утилитами, `disabled:` объявлен на кнопках | R1-01 | planned |

**Exit criteria R1.** Ни одно состояние не называется словами `active`, `focus`,
`select`, `inactive`. Для каждого состояния сказано, снято оно или дописано.

---

## R2 — примитивы

| Шаг | Элемент | Источники | Зависит от | Статус |
|---|---|---|---|---|
| R2-01 | `SpriteIcon` | [`/courses`](https://career.habr.com/courses) `svg.svg-icon` ×164 · Storybook `icons-spriteicon--all-variants` | R0 | planned |
| R2-02 | `SocialIcon` | футер 10/10 · Storybook `icons-socialicon--all-variants` | R2-01 | planned |
| R2-03 | `ProjectIcon` | футер 10/10 · Storybook `icons-projecticon--all-variants` | — | planned |
| R2-04 | `Avatar` | [`/courses/authors`](https://career.habr.com/courses/authors) ×25 · Figma `avatar/user` | — | planned |
| R2-05 | `EntityLogo` | [`/education_centers`](https://career.habr.com/education_centers) ×20 · Figma `avatar/school` | — | planned |
| R2-06 | `Chip` | 7 страниц, 239 вхождений · Figma `tag/text/*` | — | planned |
| R2-07 | `Badge` | 7 страниц, 87 вхождений · Figma `tag/color/*` | — | planned |
| R2-08 | `RatingBadge` | 7 страниц, 62 вхождения | R2-01 | planned |
| R2-09 | `MetaPill` | 7 страниц, 96 вхождений | — | planned |
| R2-10 | `CounterPill` | `/education_centers`, `/education_centers/otzyvy`, 28 вхождений | — | planned |
| R2-11 | `AvatarStack` | `/education_centers` ×60, `/otzyvy` ×24 | R2-04, R2-10 | planned |
| R2-12 | `Prose` (`.style-ugc`) | 5 страниц | R0-03 | planned |

**Exit criteria R2.** Иконки лежат локально в `ui/assets/`, спрайт зафиксирован
версией. У каждого примитива токенизированы цвет, радиус и отступы. Все 12
записей `complete` в manifest, strict-валидатор зелёный.

---

## R3 — базовые компоненты · Core Gate

| Шаг | Элемент | Источники | Зависит от | Статус |
|---|---|---|---|---|
| R3-01 | `Button` — M 40 / L 48 / XL 56 × main / secondary | 9 страниц, 190 вхождений · Figma `button/*` (15 сетов) · Storybook **не рендерится** | R2-01 | planned |
| R3-02 | `IconButton` — 3 варианта | 7 страниц, 43 вхождения · Figma `elements/button/icon` | R2-01 | planned |
| R3-03 | `Link` — разобрать, где чёрная, где синяя | 10/10 · Figma `color style/font/link` | R0-03 | planned |
| R3-04 | `FilterChip` | 5 страниц, 112 вхождений · Storybook `common-basefilter` · Figma `tab` | R2-01 | planned |
| R3-05 | `SegmentedControl` | 4 страницы · Figma `button group / onheader` | — | planned |
| R3-06 | `Select` — закрытое из Storybook, открытое из Figma | Storybook `forms-basecustomselect` · Figma `dropdown/select` | R2-01 | planned |
| R3-07 | `MultiSelect` | Storybook `forms-multiselect--base-story` | R3-06 | planned |
| R3-08 | `SearchInput` — снять интерактивно | [`/courses`](https://career.habr.com/courses) заглушка · Figma `15074:258344` | R2-01 | planned |
| R3-09 | `TextInput` — **figma-only** | Figma `elements/input/*` | — | planned |
| R3-10 | `Checkbox` | Storybook `common-basecheckbox` · Figma `elements/control` | — | planned |
| R3-11 | `Switch` | Storybook `common-baseswitch` | — | planned |
| R3-12 | `TileFilter` — **storybook-only** | Storybook `common-basefilterwithimage` · Figma `10540:60335` | — | planned |
| R3-13 | `Tab` — **figma-only** | Figma `tab` + `tab-panel/2-lvl`, 594 инстанса | — | planned |
| R3-14 | `Pagination` — **figma-only** | Figma `pagination` | R3-02 | planned |
| R3-15 | `Breadcrumbs` | `/education_centers/35-yandeks-praktikum` · Figma `9902:39188` | R3-03 | planned |

**Core Gate.** Все базовые компоненты `complete` или явно помечены
`figma-only` / `storybook-only`. Каждый элемент, снятый только из макета,
имеет запись «в продакшене не найден» в разделе «Ограничения». Закрыты шесть
конфликтов источников из BRIEF §5 — по каждому либо решение по иерархии
METHOD §3, либо GAP. Strict-валидатор и браузерные проверки на 375 / 768 /
1024 / 1440 зелёные.

---

## R4 — каркасные модули · R4 Gate

| Шаг | Элемент | Источники | Зависит от | Статус |
|---|---|---|---|---|
| R4-01 | `SiteHeader` — 64px, sticky только на `/courses` | 10/10 · [Figma `header/courses`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=15065-242662) | Core Gate | planned |
| R4-02 | `HeaderDropdown` — открытое состояние снять или пометить GAP | 10/10 (скрыт) · Storybook `header-headerdropdown` | R4-01, R2-03 | planned |
| R4-03 | `RubricationBar` — 1/10, не сквозной | [`/courses`](https://career.habr.com/courses) `.rubrication-header` | R4-01, R3-03 | planned |
| R4-04 | `SiteFooter` | 10/10 · [Figma `10049:51115`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=10049-51115) | R2-02, R2-03, R3-03 | planned |
| R4-05 | `PageHero` — три состава, 7/10 | `/education_centers`, `/otzyvy`, `/promocodes`, `/rating`, `/shkoly-dlya-detej`, `/authors`, `/editors` | R3-05, R4-06 | planned |
| R4-06 | `SearchForm` | 5 страниц | R3-06, R3-01 | planned |
| R4-07 | `Section` | 9 страниц, 28 вхождений · Storybook `common-basesection` | R0-03 | planned |
| R4-08 | `CardGrid` | 7 страниц | R0-04 | planned |
| R4-09 | `Carousel` (Swiper) | 7 страниц, 12 вхождений | R3-02 | planned |
| R4-10 | `LinkGrid` — со свёрткой `max-h-[94px]` | 3 страницы | R3-03 | planned |
| R4-11 | `FilterBar` | 5 страниц · Figma `9187:92170` | R3-04 | planned |
| R4-12 | `FilterModal` — решить, `BaseFilterModal` или `New` | Storybook (закрыта) · [Figma `14613:211399`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=14613-211399) | R3-01, R3-06, R3-10 | planned |
| R4-13 | `CatalogMenu` — **figma-only** | [Figma `14644:221758`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=14644-221758) | R3-03 | planned |
| R4-14 | `EmptyState` — **figma-only** | [Figma `12135:122610`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=12135-122610) · `no_content/*` | R3-01 | planned |

**R4 Gate.** Оболочка воспроизводится целиком: шапка, футер, контейнер, секция,
сетка — на четырёх ширинах и без зависимостей от витрины. Зафиксировано
покрытие дробью для каждого модуля: `10/10`, `7/10`, `1/10`. Модули, снятые
только из Figma, не участвуют в правилах уровня страницы.

---

## R5 — entity-модули

| Шаг | Элемент | Источники | Зависит от | Статус |
|---|---|---|---|---|
| R5-01 | `CourseCard` | 7 страниц, 96 вхождений · [Figma `9785:45731`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=9785-45731), 793 инстанса | R4 Gate | planned |
| R5-02 | `SchoolCard` | 3 страницы, 48 вхождений | R5-01 | planned |
| R5-03 | `PromoCard` | [`/education/promocodes`](https://career.habr.com/education/promocodes) ×20 · [Figma `10991:111811`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=10991-111811) | R2-05, R3-01 | planned |
| R5-04 | `ReviewCard` | 3 страницы, 20 вхождений · [Figma `11065:78841`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=11065-78841) | R2-04, R2-08, R2-12 | planned |
| R5-05 | `ArticleCard` | 4 страницы, 32 вхождения · Figma `10947:108334` | R4-09 | planned |
| R5-06 | `PersonCard` | `/courses/authors` ×25, `/courses/editors` ×5 · [Figma `13221:152104`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=13221-152104) | R2-04, R2-02 | planned |
| R5-07 | `StepCard` | `/authors`, `/editors`, 8 вхождений | R0-03 | planned |
| R5-08 | `RatingTable` + строка | [`/rating`](https://career.habr.com/education_centers/rating) ×20, `/courses` ×10 · Figma `9987:36309` | R2-05, R3-03 | planned |
| R5-09 | `NumberedCourseItem` | [`/courses`](https://career.habr.com/courses) ×10 | R2-12 | planned |
| R5-10 | `EntityHeader` | [`/education_centers/35-yandeks-praktikum`](https://career.habr.com/education_centers/35-yandeks-praktikum) · [Figma `10983:72700`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=10983-72700) | R2-05, R2-08 | planned |
| R5-11 | `PersonHeader` | [`/courses/authors/23-stepan-voevodin`](https://career.habr.com/courses/authors/23-stepan-voevodin) · [Figma `13246:159568`](https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=13246-159568) | R2-04, R2-02 | planned |
| R5-12 | `InfoTable` | `/education_centers/35-yandeks-praktikum` | R0-03 | planned |
| R5-13 | `AdCard` | 4 страницы, 52 вхождения | R3-02 | planned |
| R5-14 | `AdSlot` | 4 страницы | R5-13, R4-09 | planned |

**Exit criteria R5.** Каждая карточка собирается только из закрытых примитивов
R2 и компонентов R3, без собственных значений цвета и радиуса. У каждой описано
поведение сквозной ссылки-оверлея и обрезки текста (`line-clamp`, `max-h` +
градиентная вуаль). Наблюдения на одной странице (`InfoTable`, `EntityHeader`,
`PersonHeader`) помечены как наблюдения, а не правила.

---

## R6 — ключевые страницы

По одной на семейство. Разбор — скиллом `guide-pages`.

| Шаг | Страница | Семейство | Источник | Зависит от | Статус |
|---|---|---|---|---|---|
| R6-01 | Витрина курсов | листинг | [`/courses`](https://career.habr.com/courses) | R5 | planned |
| R6-02 | Витрина организаций | листинг | [`/education_centers`](https://career.habr.com/education_centers) | R5 | planned |
| R6-03 | Рейтинг школ | таблица | [`/education_centers/rating`](https://career.habr.com/education_centers/rating) | R5-08 | planned |
| R6-04 | Страница школы | сущность | [`/education_centers/35-yandeks-praktikum`](https://career.habr.com/education_centers/35-yandeks-praktikum) | R5-10 | planned |
| R6-05 | Эксперты и профиль автора | промо-раздел + профиль | [`/courses/authors`](https://career.habr.com/courses/authors) · [`/courses/authors/23-stepan-voevodin`](https://career.habr.com/courses/authors/23-stepan-voevodin) | R5-06, R5-11 | planned |

Не разбираются отдельно: `/courses/editors` (клон `/courses/authors`),
`/education_centers/shkoly-dlya-detej` (вкладка «Детям» витрины организаций),
`/education/promocodes` и `/education_centers/otzyvy` (та же витрина с другой
карточкой) — вместо разбора идут строкой «варианты семейства».

**Exit criteria R6.** Каждая страница воспроизводится в `showcase/pages.html`
композицией из закрытых модулей на 375 / 768 / 1024 / 1440. Для каждой описано,
чего в снимке нет: пустая выдача, ошибка, загрузка.

---

## R7 — принципы

| Шаг | Что делаем | Зависит от | Статус |
|---|---|---|---|
| R7-01 | `docs/guide/composition.md` — правила с идентификаторами и покрытием дробью | R6 | planned |
| R7-02 | `docs/guide/decisions.md` — Decision Guides в формате OBSERVED · Когда · Предпочитай · Избегай · Evidence + Confidence · GAP | R7-01 | planned |
| R7-03 | `docs/guide/coverage.md` и `evidence/coverage.md` — границы, источники, разбор конфликтов из BRIEF §5 | R7-01 | planned |

Правила-кандидаты, у которых покрытие уже посчитано на инвентаризации:
контейнер 1124 + 24 (`10/10`), шапка 64 (`10/10`), футер `#f1f1f1` 32/0/40
(`10/10`), h2 24/28 ls −0.5 (`9/9`), межсекционный интервал 48 (`6/10`, на трёх
страницах 40), sticky-шапка (`1/10`), полоса рубрикатора (`1/10`),
hero-градиент (`7/10`).

**Exit criteria R7.** В правилах нет оценочных прилагательных. У каждого правила
указано покрытие дробью и можно назвать страницу, которая его нарушит.
Наблюдения на одной странице в правила не попали.

---

## R8 — машинный слой

| Шаг | Что делаем | Зависит от | Статус |
|---|---|---|---|
| R8-01 | `tools/build-machine.mjs` — сборка `machine/*.json` из источников | R7 | planned |
| R8-02 | `machine/{tokens,components,rules,patterns,content}.json` и `*.overrides.json` | R8-01 | planned |
| R8-03 | `tools/validate-machine.mjs` — проверка, что markdown и JSON не расходятся | R8-02 | planned |
| R8-04 | `AGENTS.md` — контракт для модели-потребителя: что читать, как собирать, где граница | R8-03 | planned |

**Exit criteria R8.** По машинному слою можно выбрать паттерн, подставить
компоненты и проверить результат правилами, не читая markdown. Валидатор
проекций зелёный.

---

## Чего в пакете не будет

Перечислено с причиной в [`BRIEF.md`](BRIEF.md) §4. Кратко: страницы отдельного
курса (её нет в продукте), форм ввода, пустых состояний и ошибок из прода,
открытых оверлеев, личного кабинета, тёмной темы, системной доступности.

## Решения пользователя, 2026-09-08

Пять открытых вопросов инвентаризации закрыты. Решения обязательны для всех
последующих шагов.

1. **Пакет описывает текущий прод**; Figma даёт состав, варианты и целевой
   контракт. При конфликте — METHOD §3, но см. п. 2.
2. **Канонические брейкпоинты — Figma: 320 / 744 / 1024.** Прод реализован
   на 480 / 768 / 1024; расхождение фиксируется как факт в `evidence/coverage.md`
   и в responsive-разделе каждой спецификации, а не замалчивается. Правила
   пакета формулируются в терминах канонической схемы.
3. **Доступность фиксируется как есть.** Нормативный слой не дописывается;
   отсутствие `role`, `form`, `label`, `select` в снятой разметке идёт
   в «Ограничения» спецификаций и в `coverage.md`. `ui/state-contract.css`
   остаётся только для визуальных состояний, не снятых с прода.
4. **`BaseFilterModalNew` — актуальная реализация.** `BaseFilterModal` уходит
   в `legacyAliases` со статусом `legacy-only`.
5. **Гидрируемые узлы снимаются интерактивно** — поиск в шапке, поля hero-формы,
   панель сервисов, открытый `Select`, открытая модалка фильтров. GAP остаётся
   только там, где узел не удалось открыть.

## R0-00 — досъёмка на канонических ширинах

Следствие решения 2: снимки инвентаризации сделаны на 375 / 768 / 1024 / 1440,
канон — 320 / 744 / 1024. Без досъёмки любое responsive-правило пакета —
догадка. Шаг стоит строкой в таблице R0 выше.

Итоговый набор ширин evidence: **320 · 375 · 744 · 768 · 1024 · 1440** —
канонические три плюс три, показывающие поведение реализации.

> **Вывод шага R0-00 опровергнут ревью и здесь не приводится.** Первая
> редакция этого раздела утверждала со ссылкой на замер, что единственная
> граница раскладки ниже 1024 — 768, а `(min-width: 480px)` раскладку
> не меняет. Ревью
> [`.pipeline/R0-00/review-1.md`](.pipeline/R0-00/review-1.md) (2 blocker,
> вердикт «вернуть на доработку») показало, что метод сравнения был слеп
> по построению: узел, отсутствующий на одной из ширин, пары не получает
> и «сменить видимость» не может — на границе 375 ↔ 744 без пары остались
> 1488 ключей из 10 877, 13,7 %. Сам счёт «0 изменений, 10/10» верен, вывод
> из него — нет.
>
> Фактически между 375 и 744 **подменяется реализация фильтра**:
> `base-modal` → `v-popper v-popper--theme-dropdown`, 6/10 страниц. По
> METHOD §8 это правило, а не наблюдение. Значит `(min-width: 480px)`
> evidence скорее подтверждает: подмена лежит в интервале 375–744, где 480 —
> единственная CSS-граница. Замера на 479/480 в evidence нет вообще —
> строка **X-15**.
>
> Пока R0-00 не доработан, брейкпоинты прода в пакете — те, что записаны
> в [`BRIEF.md`](BRIEF.md) §5.6 и §9: **480 / 768 / 1024**. Шагу R0-04
> (`ui/layout.css`) опираться на замер R0-00 нельзя.

---

## Найдено по ходу

Строки заводятся шагами конвейера, когда рядом обнаруживается проблема,
не входящая в объём шага. Чинятся отдельно, а не молча.

| Шаг | Что | Нашёл | Статус |
|---|---|---|---|
| X-01 | Скрипта `npm test` сейчас нет — он снят на доработке R0-01 как ложное обещание. Вернуть его вместе со smoke-спеком витрины (страница открывается, `ui/courses.css` подключается, консоль чистая). Зависимости: R0-05 (без `components/manifest.json` первое звено `validate-components` даёт код 2) и R0-06 (без `showcase/components.html` не поднимается `webServer.url` из `playwright.config.mjs`). Раньше R0-06 строка неисполнима | R0-01 | planned |
| X-02 | `README.md`, `BRIEF.md` §2 и `.pipeline/capture-log.md` говорят «10 страниц × 4 ширины». После R0-00 набор — шесть: 320 · 375 · 744 · 768 · 1024 · 1440. Освежить три места одним проходом | R0-01 | planned |
| X-03 | Слой шрифта не решён: у `career/` есть `ui/fonts.css`, у Курсов его нет и точка подключения его не ждёт. Решить на R0-03 — Google Fonts или локальные файлы в `ui/assets/fonts/`; при локальных добавить `@import` перед `tokens.css` | R0-01 | planned |
| X-04 | **Конфликт процедуры со съёмкой.** `guide-build` §2 предписывает шагам R2–R5 `--widths 375,768,1024,1440` — набор, где из трёх канонических ширин пакета есть только 1024. Дефолт `capture.mjs` в Курсах — шесть ширин, и он верен по решению пользователя 2. Верстальщик, следующий скиллу дословно, воспроизведёт дыру в evidence, ради закрытия которой заведён R0-00. **До правки скилла: на R2–R5 запускать `capture.mjs` без `--widths`.** Оговорка продублирована в [`tools/README.md`](tools/README.md) | R0-01 | planned |
| X-05 | `tools/check-evidence-age.mjs` из `career/` не перенесён. Причина: он обходит **плоские** `evidence/source/production/*.json`, а у Курсов снимки лежат в `pages/<id>/meta*.json` — нужен не копипаст, а переписанный обход; плюс на снимках возрастом сутки порог 90 дней ничего не показывает. Перенести с адаптацией под вложенную раскладку, когда evidence начнёт стареть | R0-01 | planned |
| X-06 | `validate-showcase-icons.mjs` и `sync-showcase-icons.mjs` из `career/` не перенесены: обе проверяют локальность иконок в витрине (инвариант METHOD §6.3), а витрины и иконок у Курсов пока нет. Перенести на R2-01 вместе со спрайтом — раньше проверять нечего, позже проверять поздно | R0-01 | planned |
| X-07 | METHOD §2 держит в корне пакета `RULES.md` («появляется, когда набрано ≥15 элементов»), а роадмап заводит вместо него `docs/guide/composition.md` (R7-01). В реестре 55 элементов, `RULES.md` не заводит ни один шаг. Развести два файла или явно объявить `composition.md` его заменой — решить на R7-01 | R0-01 | planned |
| X-08 | Поправить `BRIEF.md` §2 и §7 п. 3 в части «4 ширины»: снято шесть. Пересечение с X-02, но это другие места файла | R0-01 | planned |
| X-09 | Доснять `computed` на канонической ширине 1024: сейчас для неё есть только PNG, computed снят на 1440 (контекст инвентаризации открывался на 1440) | R0-00 | planned |
| X-10 | Извлечь правила внутри `only screen and (max-width: 360px)` и `(min-width: 480px)`: запросы в сборке активны, а какие правила в них лежат — не читалось. Для 480 это тем более нужно: подмена реализации фильтра между 375 и 744 указывает именно на эту границу | R0-00 | planned |
| X-11 | Сравнить `375.png` с `375-reload.png` и `768.png` с `768-reload.png`: не измерено, расходится ли раскладка после ресайза с холодной загрузкой | R0-00 | planned |
| X-12 | Фильтр описывать как **две реализации** одного модуля, а не одну адаптивную: в разметке лежат два поддерева, и на узкой ширине это `base-modal`, на широкой — `v-popper--theme-dropdown` (6/10 страниц, подтверждено ревью R0-00 по `dom-*.html`). Плюс подмена панели `hidden … phone:grid` против `grid-cols-3 … phone:hidden`, 5/10. **На какой ширине проходит граница — не установлено** (X-15). Учесть на R4-11 и R4-12 | R0-00 | planned |
| X-13 | Обложка карточки устроена так же двумя узлами (`img … phone:hidden` и `img … hidden … phone:!block`), 3/10 страниц. Граница — та же нерешённая (X-15). Учесть на R5-01 | R0-00 | planned |
| X-14 | Гидрируемые узлы по-прежнему сняты только в состоянии `default`: поиск в шапке, поля hero-формы, `HeaderDropdown`, открытый `Select`, открытая модалка фильтров. Решение пользователя 5 требует интерактивной съёмки — делается на шагах соответствующих элементов | R0-00 | planned |
| X-15 | **Досъёмка на 479 и 480.** Между 375 и 744 подменяется реализация фильтра (`base-modal` → `v-popper--theme-dropdown`, 6/10 страниц), и 480 — единственная CSS-граница в этом интервале. Замера на 479/480 в evidence нет вообще, поэтому граница подмены не установлена, а `(min-width: 480px)` нельзя ни подтвердить, ни снять. Без этого responsive-правила пакета недоказуемы — упирается R0-04 и все `figma-only` / адаптивные разделы спецификаций | R0-01, по ревью R0-00 | planned |
| X-16 | Опровергнутый вывод R0-00 всё ещё стоит в `.pipeline/capture-log.md` (раздел «Главное: канонические 744 — это мобильная раскладка», строки 75–96): «единственная граница ниже 1024 — 768», «`(min-width: 480px)` раскладку не меняет». Файл — продукт шага R0-00, который сейчас на ревью, поэтому эта доработка его не правила. Снять при доработке R0-00 | R0-01 | planned |
| X-17 | **Оговорка X-04 не лежит на пути верстальщика.** `guide-build` ведёт его в `.pipeline/inventory.json` и в строку шага, а команду даёт в §2 дословно; ни в преамбуле волны R2, ни в exit criteria R2, ни в одной строке шагов R2–R5 оговорки «запускать `capture.mjs` без `--widths`» нет. Механической защиты тоже нет: `capture.mjs` молчит, когда переданный `--widths` не содержит канонических 320 и 744. Продублировать оговорку в преамбулу R2 и добавить предупреждение в разбор `--widths` | ревью R0-01, находка 20 | planned |
| X-18 | Две строки карты пакета в `README.md` описывают содержимое, которого нет: `README.md:96` «`docs/development/` — заметки по работе с пакетом» (в папке один `.gitkeep`, шаг не назван) и `README.md:99` «`evidence/` — снимки продакшена, Figma, Storybook, покрытие» (из четырёх есть только `source/production/`; `source/figma/`, `source/storybook/`, `curated/`, `verification/` пусты, а `evidence/coverage.md` заводит R7-03). Привести к правилу остальной карты: «пусто» + наполняющий шаг | ревью R0-01, находка 21 | planned |
| X-19 | **У `validate-counts.mjs` нет правила для числа токенов** — валидатор, заведённый против числового дрейфа, именно это число не сторожит (в массиве `claims` ключа `tokens` нет). Само число исправлено приёмкой только в `BRIEF.md:182` (`52 (7/10)`, на `author`, `authors`, `editors` — 51, нет `--swiper-theme-color`); в `ui/courses.css:10` и в строке R0-02 (`ROADMAP.md`) по-прежнему стоит «52» без оговорки. Решить на R0-02, когда `tokens.css` наполнится: что именно попадает в слой — 51 общая или 52 с `--swiper-theme-color`, — и завести на это число правило в `claims` | ревью R0-01, находка 22 | planned |
| X-20 | Строка X-02 называет три адресата, но в `README.md` формулировки «10 страниц × 4 ширины» больше нет — её сняли на доработке R0-01. Осталось два: `BRIEF.md` (строки 51, 137, 218) и `.pipeline/capture-log.md`. Поправить адресатов X-02, чтобы следующий шаг не правил уже исправленное | ревью R0-01, находка 23 | planned |
| X-21 | Из `CHANGELOG.md` сняты обе записи про evidence — досъёмка R0-00 и снимки инвентаризации. Причины: R0-00 не принят (на доработке с 2 blocker), а раздел «Добавлено» подавал его результат как состоявшийся, тогда как сам файл в шапке говорит, что записи делает приёмка; запись инвентаризации при этом называла «375 / 768 / 1024 / 1440», хотя после досъёмки на диске шесть ширин. Коммит R0-01 папку `evidence/` не трогает вовсе — она целиком в объёме R0-00. Обе записи вернуть одной, верной по числу ширин, при приёмке R0-00 и её же коммитом | ревью R0-01, находка 24 | planned |
