# Реестр элементов · Курсы

Что в пакете есть, где это лежит и как читать спецификацию. Канонический
машинный маршрут — [`machine/catalog.json`](../../machine/catalog.json);
`manifest.json` сохранён как подробный реестр v0.1. Форма спецификации —
[`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md); текущие задачи — [`../../ROADMAP.md`](../../ROADMAP.md).

Реестр перенесён в [`machine/migration-map.json`](../../machine/migration-map.json);
исходный `.pipeline/inventory.json` сохранён в локальном архиве v0.1. Реестр
собран на шаге R0-05 и дополнен 11 сентября 2026. Записей — 72. Написано **72** спецификаций, по одной на каждую: 39 в статусе `complete` (`SpriteIcon` — R2-01 по полному циклу, остальные —
bulk-проходом после двух кругов ревью прозы), 11 в статусе `partial`
и 21 в терминальном `figma-only` (`Breadcrumbs`, `EmptyState`, `Tab`, `FilterModal`, `CatalogMenu` и 16 записей, заведённых 11 сентября: страница профессии, форма обратной связи, оверлеи быстрых фильтров, загрузка, модалка промокода, FAQ-блок, оглавление, мобильное меню — `ROADMAP.md`, «Решения пользователя, 2026-09-11») — их разметка
единственная в пакете написана по узлу макета, а не снята с продукта, потому
что в продукте этих компонентов нет вовсе. Всё собрано bulk-проходом R2-bulk.

`Section` и `ArticleCard` вошли последними: их сперва исключили заодно
с `Carousel` и `AdSlot` как «не собирающиеся без Swiper», а при проверке
оказалось, что у `ArticleCard` swiper-классов в поддереве нет вовсе
(библиотека упомянута только в предке селектора переписи), а у `Section`
есть экземпляры без карусели — представитель берётся из них. Из них четыре — записи `storybook-only`
(`BaseCheckbox`, `BaseSwitch`, `BaseFilterWithImage`, `MultiSelect`): их разметка
снята не с продакшена, а из локального снимка Storybook, положенного в
`evidence/source/storybook/`. Последними в него вошли `SiteHeader` и
`SiteFooter`: их селекторы переписи сужены с голого тега до продуктового
класса (`header.bg-main-gradient-first`, `footer.bg-ui-black-50`), потому что
METHOD §6.5 требует существующего CSS-корня, а у тега класса нет. Числа
`occurrences` от сужения не изменились — 10/10 и там, и там.

Статусы здесь значат ровно то, что сказано в таблице ниже, и стоит прочесть
их буквально. У всех записей bulk-прохода разметка снята с продакшена (или
Storybook), числа измерены браузером, правила подняты из корпуса прод-CSS
парсером, живой пример стоит на витрине, а прозаические разделы — когда
использовать и когда нет, как работает, клавиатура, анимация, адаптив —
выведены из переписи корпуса (`.pipeline/R2-bulk/capture.md` §3.18, §3.20).
`complete` получили записи, у которых сняты все обязательные состояния и
проза прошла независимое ревью: 12 записей первой выборки, ещё 12 второй и
проверка генератора целиком; найденное оба раза исправлено по всем 48.
`partial` — у записи есть неснятое обязательное состояние (оно названо в
таблице состояний спецификации) — таких 11 — или проза записи ещё не
прошла ревью: `AuthorsBlock`, заведённый после него при сборке страницы
`/courses`. У всех остальных продуктовых и storybook-only записей статус
`complete`.

---

## Как читать реестр

У каждой записи два разных признака, и путать их нельзя.

**`status` — до чего дошёл конвейер.** Пока спецификации нет, статус `planned`
у всех записей без исключения. Статус — утверждение пакета о собственной работе,
и завышать его нельзя даже там, где про элемент уже всё понятно.

| `status` | Что значит |
|---|---|
| `planned` | спецификации нет; `specPath`, `showcaseAnchor` — `null`, `cssRoots` пуст |
| `partial` | спецификация есть, обязательные состояния покрыты не все — непокрытые названы |
| `complete` | спецификация есть, обязательные состояния покрыты |
| `figma-only` | спецификация есть; в продакшене элемент не найден, описан по макету |
| `legacy-only` | устаревшая реализация; отдельной спецификации не получает, `specPath` — `null` |

Статусов пять — ровно те, что перечисляет METHOD §5. Пакет общий контракт
конвейера не расширяет: шестого статуса под Storybook здесь нет, потому что
«где элемент найден» уже сказано осью `sourceScope`, а `status: complete`
при `sourceScope: storybook-only` говорит то же самое и не разводит два
словаря по одному вопросу. Список сверяется с METHOD валидатором.

**`sourceScope` — где элемент найден.** Это факт инвентаризации, и он известен
уже сейчас: 47 элементов сняты с продакшена, 4 есть только в Storybook, 21 —
только в макете.

Инвентаризация записала 44 / 5 / 6. Одна запись переехала 11 сентября 2026:
`text-input` стоял как `figma-only` с формулировкой «форм ввода в продукте нет»,
но в снятой разметке 29 видимых полей `<input>` на 6 страницах — инвентаризация
проверяла `label`, `form`, `select`, `textarea` и не посчитала сам `input`.
Разбор — `components/forms/text-input.md` и `manifest.json`, запись `text-input`.
Вторая переехала в тот же день решением владельца: `filter-modal` из
`storybook-only` в `figma-only` — Storybook снял модалку только закрытой,
и открытое состояние свёрстано по макету, а источник вёрстки определяет scope.
В тот же день решением владельца добавлены двенадцать новых записей, все
`figma-only`: разбивка стала 45 / 4 / 22. Ещё одна запись переехала при сборке страницы `/courses` (R6-01): `pagination` из `figma-only` в `production` — «вместо листания кнопка «Показать еще 20»» верно только для рейтинга школ, а на четырёх листингах с карточками листание есть. И одна новая production-запись со страницы `/courses`: блок «Больше об авторах» — `authors-block`. Разбивка — 47 / 4 / 21.

| `sourceScope` | Элементов | Что значит |
|---|---|---|
| `production` | 47 | найден в снятой разметке продакшена |
| `storybook-only` | 4 | в снятой разметке продакшена не найден; описывается по Storybook |
| `figma-only` | 21 | в снятой разметке продакшена не найден; описывается по макету |

Значение `production` держится не на слове записи: у каждой такой записи есть
селектор, и её `occurrences` и `seenOn` — измерение этого селектора по снятому
DOM, записанное в [`selector-census.json`](selector-census.json). Расхождение
реестра с переписью — ошибка гейта, а не разница во мнениях. См. «Проверки».

Когда спецификация написана, запись со `sourceScope` `figma-only` получает
терминальный статус `figma-only`; записи со `sourceScope` `production`
и `storybook-only` идут в `complete` или `partial` — покрытие обязательных
состояний не зависит от того, снято оно с прода или со Storybook, а откуда оно
снято, говорит `sourceScope`. До этого момента любой из этих статусов был бы
обещанием, а не фактом: элемент, про который пакет ещё ничего не написал,
не может быть «описан по макету».

## Соглашения

Все выводятся из `id` и `category` — придумывать по месту нечего.
Проверяются `node tools/validate-components.mjs`.

| Что | Форма | Пример |
|---|---|---|
| `id` | kebab-case от канонического имени | `course-card` |
| Каноническое имя | PascalCase, по смыслу в интерфейсе | `CourseCard` |
| Спецификация | `components/<category>/<id>.md` | `components/entities/course-card.md` |
| CSS | `ui/components/<category>.css` — имя файла равно категории | `ui/components/entities.css` |
| Якорь витрины | `c-<id>` | `viewer/index.html#course-card` |
| Корневой класс | класс продукта, если он есть; иначе `crs-<id>` — **новая реализация имени** | `style-ugc`, `crs-course-card` |

Про корневой класс подробнее. В проде Курсы собраны утилитами Tailwind: в снятой
разметке десяти страниц 500 уникальных имён классов, и почти все они утилиты.

### Как отличается собственный класс от утилиты

Число «собственных классов» ничего не стоит, пока не сказано, по какому правилу
одно отделяется от другого. Правило исполняется скриптом
`node .pipeline/R0-05/class-census.mjs` и разбирает каждое из 500 имён:

1. **Вариант — утилита.** В имени есть `:` (`phone:hidden`, `hover:no-underline`)
   или ведущий `!`: имя несёт условие, а не название узла. — 111 имён.
   Механически: `token.includes(":") || token.startsWith("!")`.
2. **Произвольное значение — утилита.** В имени есть `[` или `]`
   (`height-[11px]`, `max-w-[1124px]`): значение вписано прямо в имя. — 72 имени.
3. **Сторонняя библиотека — не наша.** Первый сегмент имени входит в список
   пространств `swiper`, `v`, `router`, `adfox`. — 16 имён.
4. **Голова из списка пространств свойств — утилита.** — 283 имени. Сюда
   попадают и утилиты не из Tailwind core, а из конфигурации продукта:
   `align-center` (109 вхождений, 10/10), `text-semibold` (87), `font-inherit`
   (10), `z-1` и `z-2`. Они собственные для продукта, но корневым классом
   элемента быть не могут: имя называет свойство.
5. **Остальное — собственный класс продукта:** имя называет узел интерфейса. —
   16 имён.

**Чем шаг 4 является и чем не является.** Смысл шага — «свойство CSS плюс его
значение», но исполняется он не так: скрипт смотрит только голову имени до
первого `-` и сверяет её с закрытым списком из 73 пространств, снятым руками
с этой же разметки. Хвост не проверяется никогда, и в списке есть головы,
свойствами CSS не являющиеся (`no`, `truncate`, `uppercase`, `hidden`, `group`,
`from`, `wrap`) и пустая строка — из-за неё утилитой становится любое имя,
начинающееся с `-`. Три из пяти шагов — списки, подогнанные под этот снимок:
пространства свойств, пространства библиотек и одно исключение
(`inline-separator`: голова `inline` утилитная, но `separator` не значение
`display`, это имя узла). Сам факт исключения показывает, что механически
правило вопрос не решает.

Поэтому счёт 500 проверяем и воспроизводим, а разбиение — снимок решения,
принятого на R0-05 глазами, а не выведенного из свойства имени. Пересматривается
он на R2-01, когда `ui/utilities.css` выпишет утилиты из сборки: тогда
принадлежность к утилитам станет фактом сборки, а не списком голов.

Проверка происхождения `scrollbar-container` и `scrollbar-button` (по 5
вхождений) не сошлась ни к утилите, ни к подтверждённой библиотеке; они вынесены
отдельно и в счёт 16 не входят.

111 + 72 + 16 + 283 + 16 + 2 = 500, счёт закрыт целиком.

### Собственные классы продукта — шестнадцать

| Класс | Вхождений | Страниц | Где |
|---|---|---|---|
| `svg-icon` | 611 | 10/10 | обёртка `<svg>` у SpriteIcon |
| `inline-separator` | 66 · 33 узла | 4/10 | точка-разделитель « • » между мета-полями; имя написано в `class` дважды, поэтому токенов вдвое больше узлов |
| `style-ugc` | 46 | 4/10 | Prose — блок редакционного текста |
| `wrapper` | 29 | 6/10 | обёртка внутри шапки |
| `base-modal` | 21 | 2/10 | оболочка модалки и выпадающих панелей |
| `app-container` | 10 | 10/10 | оболочка страницы |
| `app-content` | 10 | 10/10 | оболочка страницы |
| `instagram-gradient` | 10 | 10/10 | градиентная заливка одного значка в SocialIcon |
| `banner-swiper` | 4 | 4/10 | обёртка рекламной карусели |
| `color-ui-blue-500` | 4 | 4/10 | класс, названный по токену |
| `header-catalog__icon-item` | 2 | 1/10 | единственный BEM-узел в снятой разметке |
| `header-catalog__icon` | 1 | 1/10 | там же |
| `header-catalog__icon-item--hidden` | 1 | 1/10 | там же |
| `wrapper--with-search` | 1 | 1/10 | модификатор обёртки шапки на `/courses` |
| `rubrication-header` | 1 | 1/10 | RubricationBar, есть только на `/courses` |
| `courses-filter-search-top-panel-placeholder` | 1 | 1/10 | заглушка поля поиска до гидрации |

| Происхождение не установлено | Вхождений | Страниц | Где |
|---|---|---|---|
| `scrollbar-container` | 5 | 5/10 | скроллящаяся полоса FilterBar |
| `scrollbar-button` | 5 | 5/10 | там же |

Готовый корневой класс есть, таким образом, у двух элементов реестра —
`SpriteIcon` (`svg-icon`) и `Prose` (`style-ugc`) — и ещё у `RubricationBar`
(`rubrication-header`, одно вхождение). У `SearchInput` собственное имя носит
не сам элемент, а его заглушка до гидрации; кому принадлежит `base-modal`,
из снятой разметки не следует — это выясняется на R3-06, R4-02 и R4-12.
`inline-separator` — узел внутри карточек и шапок сущностей, отдельной записи
реестра ему пока не сопоставлено: разбирается на R2-01 вместе с мета-строкой.
У остальных элементов реестра своего класса нет.

Поэтому пакет вводит свой класс `crs-<id>` и помечает его в спецификации как
новую реализацию имени: в продукте такого класса нет. Решение принято на R0-05
и записано одной строкой в `manifest.json` → `conventions.cssRoot` — менять его
нужно там, а не в 72 спецификациях.

Правило держится механически, а не вниманием автора: значение `cssRoots` обязано
либо равняться `crs-<id>`, либо стоять в `class="…"` снятого DOM, и в обоих
случаях быть селектором в `ui/` — не подстрокой в нём и не словом из
комментария. Проверяет `node tools/validate-components.mjs`.

### Утилиты в разделе «Разметка»

Продукт собран утилитами, и «Разметка» их сохраняет: заменить утилиты потомками
`crs-` значило бы переписать продукт, а не описать его — и «Анатомия»
с «Разметкой» перестали бы быть одним и тем же деревом. Копируемость
(инвариант METHOD §6.1) обеспечивается с другой стороны: `ui/courses.css` несёт
правила ровно тех утилит, которые встречаются в разметке спецификаций, —
файл `ui/utilities.css`, выписанный из сборки продукта. Заводит его R0-04,
окончательно закрывает R2-01.

Пока файла нет, `node tools/validate-classes.mjs` на фрагменте разметки покажет
недостающие утилиты списком. Это состояние `ui/`, а не форма разметки, и
закрывается оно правилом в `ui/`, а не записью в базовую линию известных
пробелов: для своей разметки базовая линия не читается по замыслу — иначе
инвариант §6.1 перестанет проверяться там, где он и нужен.

## Как читать спецификацию

Порядок разделов один и тот же у всех: сначала «когда и как применять», потом
«как устроено». Полностью — в [`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md).

Обязательные разделы: «Когда использовать», «Состояния», «Разметка»,
«Ограничения», «Источники». Раздел, которому нечем подтвердиться, не пишется —
то, что смотрели и не нашли, идёт в «Ограничения» словами, чего именно
не хватает.

Читая, обращайте внимание на пометки источника: **figma-only** и
**storybook-only** значат, что в снятом проде этого нет; **новая реализация** —
что это дописано пакетом; строка в «Ограничениях» — что это не подтверждено
ничем. Без пометки — снятый факт.

Словарь состояний закрыт (двадцать имён, `manifest.json` → `allowedStates`).
Слова `active`, `focus`, `select`, `inactive` запрещаются: каждое значит в
интерфейсе два разных состояния сразу. Матрица обязательных состояний по видам
заводится в `components/STATES.md` на шаге R1-01; до неё `requiredStates` пуст
у всех записей, и это значит «матрицы ещё нет», а не «состояний нет».

Снятость каждого требуемого состояния — снято источником, дописано нормативом
в `ui/state-contract.css` или явно адресовано на будущий шаг — заводится в
`components/STATE-CAPTURE.md` на шаге R1-02: поля `capturedStates`/
`normativeStates`/`uncapturedStates` каждой записи манифеста — партиция её
`requiredStates`, машиночитаемое зеркало того же разбора.

---

## Категории

Десять категорий METHOD §5 — они же десять файлов `ui/components/*.css`:
имя файла равно значению `category`.

| Категория | CSS | Элементов | Что там лежит |
|---|---|---|---|
| `data-display` | `ui/components/data-display.css` | 17 | SpriteIcon · SocialIcon · ProjectIcon · Avatar · EntityLogo · Chip · Badge · RatingBadge · MetaPill · CounterPill · Prose · InfoTable · SpecializationTag · DemandChart · FaqItem · LearningStep · FaqBlock |
| `entities` | `ui/components/entities.css` | 14 | CourseCard · SchoolCard · PromoCard · ReviewCard · ArticleCard · PersonCard · StepCard · AdCard · NumberedCourseItem · EntityHeader · PersonHeader · ProfessionCard · VacancyCard · AuthorsBlock |
| `forms` | `ui/components/forms.css` | 10 | FilterChip · Select · MultiSelect · SearchInput · TextInput · Checkbox · Switch · TileFilter · SearchForm · FeedbackForm |
| `navigation` | `ui/components/navigation.css` | 9 | Link · SegmentedControl · Tab · Pagination · Breadcrumbs · RubricationBar · FilterBar · ButtonGroup · PageToc |
| `collections` | `ui/components/collections.css` | 4 | AvatarStack · Carousel · LinkGrid · RatingTable |
| `frame-modules` | `ui/components/frame-modules.css` | 3 | SiteHeader · SiteFooter · PageHero |
| `layout` | `ui/components/layout.css` | 3 | Section · CardGrid · AdSlot |
| `overlays` | `ui/components/overlays.css` | 8 | HeaderDropdown · FilterModal · CatalogMenu · Tooltip · SortSheet · PriceSheet · MobileMenu · PromoCodeModal |
| `actions` | `ui/components/actions.css` | 2 | Button · IconButton |
| `feedback` | `ui/components/feedback.css` | 2 | EmptyState · Loader |

`layout` в этой таблице — модули раскладки внутри страницы (Section, CardGrid,
AdSlot). Оболочка страницы — контейнер 1124 + 24 и брейкпоинты — живёт
не здесь, а в `ui/layout.css`.

---

## Элементы

Порядок — рабочий: волна и шаг роадмапа. Спецификация написана у каждой
записи — имя элемента ведёт на неё. «Где найден» — `sourceScope` записи.

### R2 — примитивы, 13

| Шаг | Элемент | id | Вид | Категория | Где найден | Зависит от |
|---|---|---|---|---|---|---|
| R2-01 | [SpriteIcon](data-display/sprite-icon.md) | `sprite-icon` | примитив | `data-display` | прод | — |
| R2-02 | [SocialIcon](data-display/social-icon.md) | `social-icon` | примитив | `data-display` | прод | — |
| R2-03 | [ProjectIcon](data-display/project-icon.md) | `project-icon` | примитив | `data-display` | прод | — |
| R2-04 | [Avatar](data-display/avatar.md) | `avatar` | примитив | `data-display` | прод | — |
| R2-05 | [EntityLogo](data-display/entity-logo.md) | `entity-logo` | примитив | `data-display` | прод | — |
| R2-06 | [Chip](data-display/chip.md) | `chip` | примитив | `data-display` | прод | — |
| R2-07 | [Badge](data-display/badge.md) | `badge` | примитив | `data-display` | прод | — |
| R2-08 | [RatingBadge](data-display/rating-badge.md) | `rating-badge` | примитив | `data-display` | прод | `sprite-icon` |
| R2-09 | [MetaPill](data-display/meta-pill.md) | `meta-pill` | примитив | `data-display` | прод | — |
| R2-10 | [CounterPill](data-display/counter-pill.md) | `counter-pill` | примитив | `data-display` | прод | — |
| R2-11 | [AvatarStack](collections/avatar-stack.md) | `avatar-stack` | компонент | `collections` | прод | `avatar`, `counter-pill` |
| R2-12 | [Prose](data-display/prose.md) | `prose` | компонент | `data-display` | прод | — |
| R2-13 | [SpecializationTag](data-display/specialization-tag.md) | `specialization-tag` | примитив | `data-display` | **figma-only** | — |

### R3 — базовые компоненты, 19 · Core Gate

| Шаг | Элемент | id | Вид | Категория | Где найден | Зависит от |
|---|---|---|---|---|---|---|
| R3-01 | [Button](actions/button.md) | `button` | компонент | `actions` | прод | `sprite-icon` |
| R3-02 | [IconButton](actions/icon-button.md) | `icon-button` | компонент | `actions` | прод | `sprite-icon` |
| R3-03 | [Link](navigation/link.md) | `link` | примитив | `navigation` | прод | — |
| R3-04 | [FilterChip](forms/filter-chip.md) | `filter-chip` | компонент | `forms` | прод | `sprite-icon` |
| R3-05 | [SegmentedControl](navigation/segmented-control.md) | `segmented-control` | компонент | `navigation` | прод | — |
| R3-06 | [Select](forms/select.md) | `select` | компонент | `forms` | прод | `sprite-icon` |
| R3-07 | [MultiSelect](forms/multi-select.md) | `multi-select` | компонент | `forms` | **storybook-only** | `sprite-icon`, `select` |
| R3-08 | [SearchInput](forms/search-input.md) | `search-input` | компонент | `forms` | прод | `sprite-icon` |
| R3-09 | [TextInput](forms/text-input.md) | `text-input` | компонент | `forms` | прод | — |
| R3-10 | [Checkbox](forms/checkbox.md) | `checkbox` | компонент | `forms` | **storybook-only** | — |
| R3-11 | [Switch](forms/switch.md) | `switch` | компонент | `forms` | **storybook-only** | — |
| R3-12 | [TileFilter](forms/tile-filter.md) | `tile-filter` | компонент | `forms` | **storybook-only** | — |
| R3-13 | [Tab](navigation/tab.md) | `tab` | компонент | `navigation` | **figma-only** | — |
| R3-14 | [Pagination](navigation/pagination.md) | `pagination` | компонент | `navigation` | прод | `sprite-icon`, `link` |
| R3-15 | [Breadcrumbs](navigation/breadcrumbs.md) | `breadcrumbs` | компонент | `navigation` | **figma-only** | — |
| R3-16 | [ButtonGroup](navigation/button-group.md) | `button-group` | компонент | `navigation` | **figma-only** | — |
| R3-17 | [DemandChart](data-display/demand-chart.md) | `demand-chart` | компонент | `data-display` | **figma-only** | — |
| R3-18 | [Tooltip](overlays/tooltip.md) | `tooltip` | компонент | `overlays` | **figma-only** | — |
| R3-19 | [PageToc](navigation/page-toc.md) | `page-toc` | компонент | `navigation` | **figma-only** | — |

### R4 — каркасные модули, 22 · R4 Gate

| Шаг | Элемент | id | Вид | Категория | Где найден | Зависит от |
|---|---|---|---|---|---|---|
| R4-01 | [SiteHeader](frame-modules/site-header.md) | `site-header` | модуль | `frame-modules` | прод | `header-dropdown`, `search-input`, `sprite-icon` |
| R4-02 | [HeaderDropdown](overlays/header-dropdown.md) | `header-dropdown` | модуль | `overlays` | прод | `project-icon` |
| R4-03 | [RubricationBar](navigation/rubrication-bar.md) | `rubrication-bar` | модуль | `navigation` | прод | `link` |
| R4-04 | [SiteFooter](frame-modules/site-footer.md) | `site-footer` | модуль | `frame-modules` | прод | `project-icon`, `social-icon`, `link` |
| R4-05 | [PageHero](frame-modules/page-hero.md) | `page-hero` | модуль | `frame-modules` | прод | `segmented-control`, `search-form`, `button` |
| R4-06 | [SearchForm](forms/search-form.md) | `search-form` | модуль | `forms` | прод | `select`, `button` |
| R4-07 | [Section](layout/section.md) | `section` | модуль | `layout` | прод | — |
| R4-08 | [CardGrid](layout/card-grid.md) | `card-grid` | модуль | `layout` | прод | — |
| R4-09 | [Carousel](collections/carousel.md) | `carousel` | модуль | `collections` | прод | `icon-button` |
| R4-10 | [LinkGrid](collections/link-grid.md) | `link-grid` | модуль | `collections` | прод | `link` |
| R4-11 | [FilterBar](navigation/filter-bar.md) | `filter-bar` | модуль | `navigation` | прод | `filter-chip` |
| R4-12 | [FilterModal](overlays/filter-modal.md) | `filter-modal` | модуль | `overlays` | **figma-only** | `button`, `checkbox`, `select` |
| R4-13 | [CatalogMenu](overlays/catalog-menu.md) | `catalog-menu` | модуль | `overlays` | **figma-only** | `link`, `sprite-icon` |
| R4-14 | [EmptyState](feedback/empty-state.md) | `empty-state` | модуль | `feedback` | **figma-only** | `button` |
| R4-15 | [Loader](feedback/loader.md) | `loader` | компонент | `feedback` | **figma-only** | `sprite-icon` |
| R4-16 | [FeedbackForm](forms/feedback-form.md) | `feedback-form` | модуль | `forms` | **figma-only** | `button-group`, `button`, `text-input` |
| R4-17 | [SortSheet](overlays/sort-sheet.md) | `sort-sheet` | модуль | `overlays` | **figma-only** | — |
| R4-18 | [PriceSheet](overlays/price-sheet.md) | `price-sheet` | модуль | `overlays` | **figma-only** | `button` |
| R4-19 | [FaqItem](data-display/faq-item.md) | `faq-item` | модуль | `data-display` | **figma-only** | `sprite-icon` |
| R4-20 | [LearningStep](data-display/learning-step.md) | `learning-step` | модуль | `data-display` | **figma-only** | `chip`, `sprite-icon` |
| R4-21 | [FaqBlock](data-display/faq-block.md) | `faq-block` | модуль | `data-display` | **figma-only** | `faq-item` |
| R4-22 | [MobileMenu](overlays/mobile-menu.md) | `mobile-menu` | модуль | `overlays` | **figma-only** | `project-icon`, `sprite-icon` |

### R5 — entity-модули, 18

| Шаг | Элемент | id | Вид | Категория | Где найден | Зависит от |
|---|---|---|---|---|---|---|
| R5-01 | [CourseCard](entities/course-card.md) | `course-card` | модуль | `entities` | прод | `rating-badge`, `meta-pill`, `badge`, `chip`, `button`, `entity-logo` |
| R5-02 | [SchoolCard](entities/school-card.md) | `school-card` | модуль | `entities` | прод | `entity-logo`, `rating-badge`, `avatar-stack`, `counter-pill`, `button` |
| R5-03 | [PromoCard](entities/promo-card.md) | `promo-card` | модуль | `entities` | прод | `entity-logo`, `button` |
| R5-04 | [ReviewCard](entities/review-card.md) | `review-card` | модуль | `entities` | прод | `avatar`, `rating-badge`, `prose` |
| R5-05 | [ArticleCard](entities/article-card.md) | `article-card` | модуль | `entities` | прод | `chip` |
| R5-06 | [PersonCard](entities/person-card.md) | `person-card` | модуль | `entities` | прод | `avatar`, `social-icon`, `prose` |
| R5-07 | [StepCard](entities/step-card.md) | `step-card` | модуль | `entities` | прод | — |
| R5-08 | [RatingTable](collections/rating-table.md) | `rating-table` | модуль | `collections` | прод | `entity-logo`, `link` |
| R5-09 | [NumberedCourseItem](entities/numbered-course-item.md) | `numbered-course-item` | модуль | `entities` | прод | `prose`, `link` |
| R5-10 | [EntityHeader](entities/entity-header.md) | `entity-header` | модуль | `entities` | прод | `entity-logo`, `rating-badge`, `button`, `prose` |
| R5-11 | [PersonHeader](entities/person-header.md) | `person-header` | модуль | `entities` | прод | `avatar`, `social-icon` |
| R5-12 | [InfoTable](data-display/info-table.md) | `info-table` | модуль | `data-display` | прод | — |
| R5-13 | [AdCard](entities/ad-card.md) | `ad-card` | модуль | `entities` | прод | `icon-button` |
| R5-14 | [AdSlot](layout/ad-slot.md) | `ad-slot` | модуль | `layout` | прод | `carousel`, `ad-card` |
| R5-15 | [ProfessionCard](entities/profession-card.md) | `profession-card` | модуль | `entities` | **figma-only** | `specialization-tag` |
| R5-16 | [VacancyCard](entities/vacancy-card.md) | `vacancy-card` | модуль | `entities` | **figma-only** | `entity-logo`, `specialization-tag`, `chip`, `button` |
| R5-17 | [PromoCodeModal](overlays/promo-code-modal.md) | `promo-code-modal` | модуль | `overlays` | **figma-only** | `promo-card`, `button`, `sprite-icon` |
| R5-18 | [AuthorsBlock](entities/authors-block.md) | `authors-block` | модуль | `entities` | прод | `avatar`, `prose`, `button`, `link`, `sprite-icon` |

---

## Имена реализаций

Каноническое имя даётся по смыслу в интерфейсе, а не по имени слоя в Figma и
не по пути story (METHOD §5). Имена реализаций Storybook хранятся отдельно:
по ним элемент ищут, но называть его так нельзя.

| Каноническое имя | Storybook | Не каноническое имя |
|---|---|---|
| Button | `BaseButton` | BaseButton |
| FilterChip | `BaseFilter` | BaseFilter |
| Select | `BaseCustomSelect` | BaseCustomSelect |
| Checkbox | `BaseCheckbox` | BaseCheckbox |
| Switch | `BaseSwitch` | BaseSwitch |
| TileFilter | `BaseFilterWithImage` | BaseFilterWithImage |
| Section | `BaseSection` | BaseSection |
| FilterModal | `BaseFilterModalNew`, `BaseFilterModal` | BaseFilterModalNew, BaseFilterModal |
| HeaderDropdown | `HeaderDropdown`, `HeaderSection` | HeaderSection |
| MultiSelect · SpriteIcon · SocialIcon · ProjectIcon | совпадают с каноническим | — |

**FilterModal — две реализации.** Актуальная — `BaseFilterModalNew`
(решение пользователя, BRIEF §9 п. 5); её и описывает спецификация.
`BaseFilterModal` помечен `legacy-only` и отдельной спецификации не получает —
запись `filter-modal` → `implementations` в манифесте держит оба имени
с их статусами.

---

## Границы реестра

Реестр описывает публичную часть Курсов, снятую гостем на десяти страницах
(BRIEF §4). Что в него не вошло и почему:

- **Формы ввода как система.** В снятой разметке десяти страниц ни одного
  `<form>`, `<label>`, `<select>`, `<textarea>` — при 29 `<input>`, ни один
  из которых не подписан. TextInput есть только в макете, Checkbox и Switch —
  только в Storybook.
- **Открытые состояния оверлеев.** Список Select, панель HeaderDropdown, модалка
  фильтров, поле поиска в шапке приходят заглушками и гидрируются JS; в Storybook
  сняты закрытыми. Снимаются интерактивно (BRIEF §9 п. 3), пока не сняты — GAP.
- **Доступность как система.** Во всей снятой разметке только `aria-hidden` (31)
  и `aria-current` (4). Ни одного `role`, `aria-label`, `aria-expanded`,
  `tabindex` — при 368 `<button>` и 29 `<input>`. Пакет фиксирует это как факт
  и ARIA не дописывает (BRIEF §9 п. 4). Пересчитано на R0-05 по всем десяти
  `dom.html`.
- **Storybook-компоненты без записи в реестре.** `Icons/CatalogIcon` — обе story
  падают с `[nuxt] instance unavailable`, разметки и argTypes нет, сопоставить
  не с чем. `common/Colors` и `common/Typography` — не компоненты, а страницы
  документации; относятся к `ui/tokens.css` и `ui/foundations.css`.
- **Реклама.** AdCard и AdSlot в реестре есть, хотя частью дизайн-системы
  не являются: они занимают верх каждой витрины, и без них композиция страницы
  не сходится (BRIEF §7 п. 5). Описываются как граница продукта.
- **Одна из 45 «производственных» записей находит не сам элемент.** Это
  `SearchInput`: селектор адресует заглушку `.courses-filter-search-top-panel-placeholder`,
  а отрисованное поле лежит соседним узлом в той же снятой разметке —
  `div.w-full > div.v-popper.v-popper--theme-dropdown > … > div.wrapper.wrapper--with-search`
  с `input[placeholder="Искать на Хабр Курсах"]` и иконкой `#search`, внутри того же
  `#courses-filter-search-top-panel`, что и заглушка (`aria-hidden="true"`).
  Досъёмка с увеличенным `--wait` не нужна: на R3-08 переписывается селектор.
  Считается так: узлов `div.v-popper.v-popper--theme-dropdown` по десяти `dom.html` — 29,
  из них 28 — улов `Select` на пяти страницах, двадцать девятый — это поле шапки
  на `/courses`; `wrapper--with-search` и `placeholder="Искать на Хабр Курсах"` дают
  по 1 вхождению на `courses-listing/dom.html`. Число названо здесь, а не
  оставлено в примечании записи. `Breadcrumbs` был второй такой записью и на
  R0-05 переведён в `figma-only`: селектор находил `<h1>` «Онлайн-школа Яндекс
  Практикум» — заголовок страницы, а не список ссылок. `ArticleCard` был
  третьей: селектор собирал 80 узлов, из которых 40 — CourseCard и 8 —
  SchoolCard; сужен, стало 32 на 4 страницах.
- **Одна запись собирает две роли одного ряда.** `Chip`: из 239 узлов 143 —
  метки («1С разработка», «Git»), 96 — счётчики переполнения «+9». Разделение
  полное и в обе стороны, но это не два элемента: коробка у ролей одна и та же,
  счётчик в 96 случаях из 96 стоит последним ребёнком того же ряда и вне ряда
  меток не встречается ни разу. Числом это разобрано в
  `productionEvidence[].note` записи; одна это форма дизайн-системы или две —
  по макету не установлено и решается на R2-06. Самостоятельный счётчик «+N»
  в реестре есть отдельной записью `CounterPill` — другая коробка, другие узлы.
- **Одна запись зависит от ширины снимка.** Та же `Chip`: 239 на `dom.html`
  (1440), 249 на `dom-768`, 330 на `dom-375`. Остальные 43 производственные
  записи дают одно и то же число на всех трёх ширинах. Причина измерена
  и записана в `notes`: рядов всегда 96, а сколько меток показать до счётчика,
  решает раскладка.

---

## Проверки

```
node tools/validate-components.mjs --strict
```

Сверяет реестр сам с собой и с пакетом: обязательные поля, форму `id` и имён
и их связь (`id` — kebab от канонического имени), уникальность имён, алиасов,
шагов роадмапа и селекторов, категорию против файлов `ui/components/*.css`, вид,
статус против `sourceScope` и против `statusDefinitions`, существование
зависимостей, соответствие `specPath` и якоря соглашениям, существование
спецификации, CSS-корня и якоря витрины, место записи в `ROADMAP.md` (шаг
существует и назван тем же именем).

Четыре словаря — `allowedStatuses`, `allowedCategories`, `allowedKinds`,
`allowedStates` — и словарь `forbiddenStateNames` сверяются с METHOD §5 в обе
стороны: и «расширяет», и «не содержит». Пакет их использует, но не
переопределяет, поэтому запрещённое METHOD слово `active` не может быть внесено
в разрешённые состояния правкой манифеста.

Сверка идёт в две ступени, и это важно различать. Манифест сверяется со списком
в самом валидаторе, а список валидатора — с `.claude/guide/METHOD.md`, если файл
лежит рядом с пакетом. До третьей итерации второй ступени не было: словарь
внутри `validate-components.mjs` был второй копией закрытого списка, и правкой
METHOD §5 её было не догнать. Пакет остаётся самодостаточным — без `METHOD.md`
проверка не краснеет, а печатается строкой «Отложено»: контракт живёт над
пакетом и в поставку не входит.

Шестой словарь, `allowedSourceScopes`, METHOD не задаёт — это словарь самого
пакета. Его состав из трёх значений закреплён в валидаторе рядом с проверкой
шапки манифеста: `countingRule`, `statusRule`, `sourcePolicy`, `coverage`,
`conventions` и `schemaVersion` обязаны существовать и быть непустыми. Подмену
текста правила гейтом не поймать — исчезновение ключа, на котором стоят все
44 числа, поймать можно.

**Числа реестра против разметки.**

```
node tools/measure-selectors.mjs
```

Измеряет селекторы `productionEvidence` настоящим браузером по снятому DOM
и пишет [`selector-census.json`](selector-census.json). Инструмент только
измеряет: манифест он не трогает ни при каких флагах, а сверку измеренного
с заявленным делает `validate-components`. Разделение существенное — прежний
инструмент сверял и тем же прогоном подгонял `occurrences` под найденное,
отчего «сошлись 45 из 45» было гарантировано конструкцией и не могло поймать
неверный селектор. Перепись привязана к разметке отпечатками `dom.html`:
пересъёмка страниц делает её устаревшей, и это видно ошибкой.

Подпись прогона — `measuredBy`, `environment`, `measuredAt` — проверяется
правилом: перепись обязана называть себя снятой `tools/measure-selectors.mjs`
с `javaScriptEnabled: false` и датой не раньше самой ранней съёмки страниц.
До третьей итерации валидатор читал из переписи только отпечатки и селекторы,
и подпись «вписано руками, браузер не запускался» проходила зелёным.

Чего эта пара не ловит: перепись — файл в репозитории, и согласованная правка
**чисел** в обоих файлах сразу проходит зелёным. Безбраузерное правило отличит
подделанную подпись от настоящей, но не подделанное число от измеренного:
настоящим число делает только прогон в браузере.

Поэтому на приёмке любого шага, который трогал селекторы, `occurrences`
или `seenOn`, идёт **пара команд**:

```
node tools/measure-selectors.mjs          # перемерить и переписать перепись
node tools/validate-components.mjs --strict
```

Первая перезаписывает перепись измерением, вторая сверяет с ней реестр и падает
кодом 1, если числа разошлись. Прогон `--check` для этого не годится и раньше
предлагался здесь ошибочно: он ничего не пишет, поэтому подделанная перепись
остаётся на месте и сходится сама с собой. Собственный код возврата у `--check`
теперь есть — 1 при любом расхождении с манифестом, — но проверяет он реестр
против переписи, а не против разметки. Против разметки проверяет только запись
нового измерения.

Проверки, предмета которых ещё нет, печатаются отдельным блоком «Отложено»
с названием заводящего шага — чтобы зелёный вывод не читался как «проверено
всё». Сейчас отложены три: якоря витрины (R0-06), матрица обязательных
состояний (R1-01) и сходимость реестра по спецификациям (R2 и далее).

Гейтом **не** проверяется сходимость этого файла с `manifest.json` целиком:
таблицы «Элементы» и категории здесь ведутся руками, и расхождение имени, шага,
категории или вида ловится только сверкой глазами. Строка долга заведена.

Половина этой дыры закрыта: числа, выводимые из манифеста одной строкой, ушли
в `node tools/validate-counts.mjs` — число записей и разбивка по `sourceScope`
(47 / 4 / 21) сверяются в обоих местах, где написаны, прозой и таблицей.
Остаётся то, что требует разбора таблиц: имя, шаг, категория и вид у каждой
из 72 строк.

**Копируемость до R0-06.** Шаблон спецификации велит прогнать
`node tools/validate-classes.mjs .pipeline/<id>/copy-check.html`, но ни один
гейт этого не делает: безаргументный прогон читает витрину, а её заводит R0-06.
До тех пор инвариант METHOD §6.1 проверяется руками. Порядок обязателен:
`ui/utilities.css` заводится на **R0-04**, спецификации начинаются с **R2**.
Нарушение порядка означает первые спецификации с красной проверкой
копируемости и без средства её закрыть.
