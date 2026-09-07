# Roadmap развития компонентов Career

Основание: [`FIGMA-COMPONENT-AUDIT.md`](FIGMA-COMPONENT-AUDIT.md).

Цель roadmap — сначала получить полное и предсказуемое ядро базовых компонентов,
и только затем собирать продуктовые модули. Figma используется только как база
знаний и источник визуальных наблюдений. Никакие задачи этого roadmap не требуют
изменений в Figma.

## Текущий прогресс

| Задача | Статус | Результат |
|---|---|---|
| R0-01 Component manifest | готово для base scope | 63 записи, все реализованы и имеют статус complete |
| R0-02 State contract | готово | Нормативный словарь и матрицы в [`components/STATES.md`](components/STATES.md) |
| R0-03 State evidence | готово для current scope | Validator проверяет state evidence; исправлены ложноотрицательные спецификации |
| R0-04 Шаблон и тесты | готово для current scope | Структура, spec paths, CSS roots, anchors, browser interactions и assets проверяются автоматически |
| R2-A Actions | готово | 11 action-компонентов получили полный state contract, ARIA aliases и живые примеры |
| R2-B Selection controls | готово | Checkbox, RadioButton, Switch и StarRating нормализованы вокруг native inputs |
| R2-C Fields | готово | FormField contract и 7 полей/адаптеров получили полные states и semantics |
| R2-D Navigation, collections, feedback | готово | 12 компонентов нормализованы; Dropdown/DropdownModal оставлены adapters |
| R2-E Non-interactive primitives | готово | 12 primitives получили semantics, loading/disclosure и reduced-motion contracts |
| R2 base-scope tail | готово | SalaryBar, BoosterGradientWrapper, StatusChip, UnreadCounter и StepsSidebar закрыты |
| R3-A Badge | готово | Существующий CSS/showcase поднят до канонической спецификации |
| R3-A Tabs | готово | Production pattern зарегистрирован; добавлены hover/focus-visible/pressed/disabled |
| R3-A Core components | готово | Menu, Popover, Tooltip, Calendar, pickers, upload и Accordion добавлены в UI kit |
| Core Gate | готово для current scope | 63/63 complete; strict validator и browser suite проходят на 375/768/1024/1440 |
| R4-A Frame modules | готово по code/docs | PageHeader, PageFooter, SectionHeader, ContentSection, EmptySection, Sidebar и SidebarSection |
| R4-B Filters | готово по code/docs | FilterPanel и FilterModal используют общую form model; modal имеет focus lifecycle |
| R4 Gate | готово для current scope | Все 9 модулей complete; browser suite и snapshots пройдены на контрольных ширинах |
| R5-A VacancyCard | готово для current scope | Канонизирована карточка листинга; data variants и mobile/desktop composition покрыты browser tests |

Текущий baseline: strict-validator проходит без предупреждений; browser suite
проверяет интерактивные контракты, локальные assets и отсутствие горизонтального
overflow на 375, 768, 1024 и 1440 px. Снимки находятся в
[`evidence/verification/`](evidence/verification/). Все 63 компонента base scope
и R3-A и девять каркасных модулей R4 имеют статус `complete`; записей `partial`
и `planned` нет. Первый entity-модуль R5 — `VacancyCard` — также имеет статус
`complete`; всего в manifest 73 записи.

## 1. Итоговая последовательность

```text
R0. Контракт и словарь
  → R1. Общая модель состояний
  → R2. Доработка существующих базовых компонентов
  → R3. Добавление недостающих базовых компонентов
  → Core Gate
  → R4. Каркасные модули
  → R5. Entity-модули
  → R6. Stateful-продуктовые модули
```

Модули не начинаются до прохождения `Core Gate`. Исключение возможно только для
исследовательского прототипа, который не попадает в нормативный UI kit.

## 2. Иерархия источников

При конфликте источников решение принимается в следующем порядке:

1. Семантика HTML, доступность и устоявшиеся frontend-паттерны.
2. Реальное поведение и публичный API компонента из Storybook/production.
3. CSS и tokens текущей реализации Career.
4. Визуальное наблюдение из Figma.
5. Названия слоёв, properties и variants в Figma.

Figma подтверждает внешний вид, состав, responsive-варианты и возможные сценарии,
но не определяет API, семантику или каноническое имя компонента.

Правила работы с Figma:

- не редактировать файлы, variables, components и descriptions;
- не копировать ошибочные имена в код и документацию;
- не создавать отдельный компонент для каждого Figma component set;
- фиксировать ссылку/node key как evidence;
- при конфликте создавать запись `GAP`, а не молча выбирать Figma;
- бизнес-варианты отделять от универсальных UI states.

## 3. Канонические имена

### 3.1. Правила

- Компоненты и типы: `PascalCase`.
- Props: `camelCase`.
- Boolean props называются по состоянию: `disabled`, `loading`, `selected`,
  `checked`, `indeterminate`, `open`, `readOnly`, `invalid`.
- События описывают факт: `change`, `select`, `open`, `close`, `dismiss`, `retry`.
- Существующее имя Storybook сохраняется, если оно не вводит в заблуждение.
- Переименование существующего публичного API выполняется только через alias и
  migration note.
- Новое имя выбирается по семантической роли, а не по форме или месту на экране.

### 3.2. Словарь замен для Figma

| В Figma | Каноническое понятие | Комментарий |
|---|---|---|
| `inactive` | `default` | `inactive` ошибочно звучит как выключенное состояние |
| `disable` | `disabled` | Стандартный термин HTML/API |
| `focus` | `focus-visible` | Для визуального keyboard focus; обычный `focus` остаётся DOM-событием |
| `focus_select` | `focus-visible` + `selected` или `open` | Нельзя объединять focus и выбор |
| `select` как state | `selected` | `select` — действие, `selected` — состояние |
| `active` для выбранного элемента | `selected` или `current` | `active` резервируется за моментом нажатия |
| `loading` | `loading` | Сохраняется; поведение блокировки описывается отдельно |
| `error` поля | `invalid` + error message | `invalid` — состояние control, error — feedback |
| `tost` | `Toast` | Исправление опечатки |
| `informer` | `Notification` или `Alert` | Выбор зависит от роли и срочности |
| `row` | `ListItem` или `MenuItem` | `Row` сохраняется только для существующего `BaseRow` |
| `dropdown` | `Select`, `Menu` или `Popover` | Термин без роли не использовать в новом API |
| `chips field` | `TagInput` или `MultiSelect` | Выбор по поведению ввода |
| `textarea WYSIWYG` | `RichTextEditor` | Общепринятое имя для редактора |
| `drag&drop / picture` | `FileUpload` + `Dropzone` | File selection и drop target — разные ответственности |
| `Property 1`, `Variant2` | семантическое имя | Такие имена запрещены в нормативной документации |

### 3.3. Единый словарь состояний

| State | Значение | Не смешивать с |
|---|---|---|
| `default` | Обычное доступное состояние | `disabled`, `empty` |
| `hover` | Указатель находится над interactive target | `focus-visible` |
| `focus-visible` | Видимый keyboard focus | Любой `focus` от мыши |
| `pressed` | Кнопка нажата прямо сейчас | `selected`, `current` |
| `selected` | Выбран один элемент из набора | `pressed`, `checked` |
| `current` | Текущий маршрут, шаг или страница | `selected` формы |
| `checked` | Выбран checkbox/radio/switch | `selected` list item |
| `indeterminate` | Частичный выбор checkbox | `checked` |
| `expanded` / `collapsed` | Состояние раскрываемой секции | `open` overlay |
| `open` / `closed` | Видимость menu, popover, modal | `expanded` content section |
| `disabled` | Недоступно для взаимодействия | `readOnly`, `loading` |
| `readOnly` | Значение можно читать и фокусировать, но нельзя менять | `disabled` |
| `loading` | Выполняется операция | `disabled`; блокировка задаётся контрактом |
| `invalid` | Control не прошёл валидацию | Текст ошибки |
| `error` | Операция завершилась ошибкой | `invalid` конкретного поля |
| `success` | Операция успешно завершена | `selected` |
| `empty` | Данные отсутствуют | Пустое значение поля |
| `dragActive` | Файл находится над drop target | `hover` |

Бизнес-состояния вроде `archived`, `applied`, `unread`, `rejected` и `expired`
не входят в общий UI-словарь. Они описываются в конкретном модуле.

## 4. Scope базовой библиотеки

### 4.1. Primitives

- Icon и Avatar.
- Typography и визуально скрытый текст.
- Spinner/Loader и Skeleton.
- Divider и ScrollArea/PrettyScroll.
- FocusRing как правило, а не отдельный визуальный компонент.

### 4.2. Actions

- Button.
- IconButton.
- AvatarButton.
- LinkStyledButton.
- PaginationButton.
- FilterButton.

`AIButton`, `GhostButton`, `RoundedArrowButton` и `SalaryHeadButton` сохраняют
публичные Storybook-имена, но должны переиспользовать общую action-state модель.
Не нужно заранее объединять их в один API без проверки production.

### 4.3. Form controls

- InputLabel/FormField.
- TextInput.
- Textarea.
- Select.
- CustomSelect; в новом API уточнить роль: `Combobox` либо legacy adapter.
- MultiSelect.
- Checkbox.
- RadioButton.
- Switch.
- StarRating.

### 4.4. Navigation and collections

- Chip, ClosableChip, SkillChip, StatusChip.
- Row/BaseRow.
- Pagination.
- SegmentedTabs.
- Dropdown и ContextMenu как существующие adapters.

### 4.5. Feedback and overlays

- Notification.
- Toast.
- EmptyPlaceholder.
- Modal.
- DropdownModal как существующий responsive adapter.
- TransitionFade.

Карточки сущностей, headers, sidebars, диалоги, фильтры страниц и баннеры не
считаются базовыми компонентами, даже если сейчас лежат рядом с ними.

## 5. R0 — контракт и инфраструктура

Цель: исключить дубли и разночтения до изменения компонентов.

### R0-01. Component manifest

Создать машиночитаемую карту со следующими полями:

```text
id
canonicalName
storybookName
legacyAliases
category
specPath
cssRoot
showcaseAnchor
figmaEvidence[]
status
requiredStates[]
```

Figma name хранить только в `figmaEvidence`, но не использовать как
`canonicalName` автоматически.

### R0-02. State contract

- Зафиксировать словарь из раздела 3 отдельным нормативным файлом.
- Для каждого семейства определить required, conditional и unsupported states.
- Разделить visual state, DOM semantics и business state.
- Описать допустимые комбинации, например `checked + disabled`.

### R0-03. Починить сбор state evidence

Генератор спецификаций должен учитывать:

- псевдоклассы компонентного CSS;
- utility classes в реальном HTML;
- state classes;
- props и допустимые значения;
- `aria-current`, `aria-selected`, `aria-expanded`, `aria-invalid` и
  `aria-disabled`;
- Figma variants только как дополнительное evidence.

Первый регрессионный кейс — `SegmentedTabs`: нельзя одновременно писать
«состояний нет» и показывать `hover`, `focus-visible`, current и disabled ниже.

### R0-04. Шаблон спецификации и тестов

Для каждого базового компонента обязательны:

- anatomy и семантический HTML;
- публичный API;
- state matrix;
- keyboard behavior;
- responsive behavior, если оно есть;
- живая story/showcase для каждого нетривиального состояния;
- ссылка на Figma evidence и отметка, что оно не нормативно;
- ограничения и unsupported combinations.

### Exit criteria R0

- У каждого существующего базового компонента есть manifest entry.
- Ни одно Figma-имя не стало API без нормализации.
- Словарь состояний принят и используется в новых задачах.
- `SegmentedTabs` и остальные известные ложноотрицательные state-разделы
  корректно извлекаются.

## 6. R1 — общая модель состояний

Цель: реализовать состояния один раз и применять их ко всем базовым компонентам.

### R1-01. Action states

Минимум для всех доступных actions:

```text
default → hover → pressed
default → focus-visible
default → disabled
default → loading
```

Требования:

- `pressed` не используется как синоним `selected`;
- keyboard focus не скрывается;
- loading предотвращает повторную отправку;
- disabled не остаётся кликабельным и не получает pointer events;
- link-like action сохраняет корректную семантику ссылки или кнопки.

### R1-02. Selection-control states

Для Checkbox проверить матрицу:

```text
unchecked / checked / indeterminate
× default / hover / focus-visible / disabled / loading
```

Для RadioButton и Switch:

```text
off / on
× default / hover / focus-visible / disabled / loading
```

Не обязательно создавать визуально уникальный вариант для каждой комбинации,
но поведение и результат должны быть проверены.

### R1-03. Field states

Для TextInput, Textarea, Select, CustomSelect и MultiSelect:

```text
empty / filled
× default / hover / focus-visible / disabled / readOnly / invalid
```

Для Select/Combobox дополнительно: `closed`, `open`, `option-highlighted`,
`option-selected`, `no-results`, `loading`.

### R1-04. Collection and navigation states

Для Row, MenuItem, Chip, Tabs и PaginationButton:

```text
default / hover / focus-visible / pressed / selected / disabled
```

`current` используется для route/page/step. `selected` — для пользовательского
выбора. У неинтерактивных Chip/StatusChip hover и focus не требуются.

### R1-05. Overlay and feedback states

- Modal: closed/open, entering/leaving, loading, error/success composition.
- Menu/Popover: closed/open и keyboard navigation.
- Toast: entering, visible, dismissing; info/success/warning/error.
- Notification/Alert: info/success/warning/error и optional dismiss.
- EmptyPlaceholder: empty, no-results и first-use различаются по copy/purpose.

### Exit criteria R1

- У каждого интерактивного primitive есть `focus-visible`.
- Required states представлены в CSS и story/showcase.
- State names совпадают в API, документации и примерах.
- Нет `inactive`, `disable`, `focus_select` или выбранного `active` в новом API.

## 7. R2 — доработка существующих базовых компонентов

Работы выполняются волнами. Следующая волна начинается после завершения предыдущей.

### Wave R2-A. Actions

Статус: **готово, 4 сентября 2026**. Извлечённый production CSS оставлен без
изменений. Недостающие нормативные состояния находятся в
[`ui/state-contract.css`](ui/state-contract.css); legacy modifiers поддерживаются
как aliases, а новый API использует нативные атрибуты и ARIA semantics.

| Компонент | Основная работа |
|---|---|
| Button | Добавить pressed; проверить loading во всех appearance и size |
| IconButton | Синхронизировать selected/loading с props и документацией |
| AvatarButton | Добавить явные selected/loading examples |
| PaginationButton | Отделить current/selected от pressed; описать loading либо признать unsupported |
| AIButton | Добавить hover, focus-visible, pressed и loading |
| GhostButton | Добавить pressed; унифицировать disabled/loading |
| LinkStyledButton | Описать hover, focus-visible, pressed и disabled |
| FilterButton | Разделить selected filter и pressed; проверить badge disabled |
| RoundedArrowButton | Добавить keyboard focus и pressed |
| SalaryHeadButton | Определить семантику, hover, focus-visible и disabled |

### Wave R2-B. Selection controls

Статус: **готово, 4 сентября 2026**. Checked/disabled берутся из нативных
inputs; `.is-minus`, `.is-checked` и `.wrapper` оставлены как legacy aliases.
RadioButton не получил искусственный loading, потому что в его API и поведении
такого состояния нет. StarRating разделён на интерактивный и readOnly modes.

| Компонент | Основная работа |
|---|---|
| Checkbox | Переименовать/описать `.is-minus` как indeterminate; реализовать loading contract |
| RadioButton | Проверить все checked + disabled + focus combinations |
| Switch | Документировать on/off, disabled и loading; проверить semantics |
| StarRating | Добавить focus-visible, checked/value, disabled и readOnly |

### Wave R2-C. Fields

Статус: **готово, 4 сентября 2026**. InputLabel задаёт общий FormField contract;
TextInput/Textarea разделяют disabled и readOnly; нативный Select не обещает
управляемые open/closed states. CustomSelect определён как select-only combobox,
MultiSelect — как editable combobox с multiselect listbox.

| Компонент | Основная работа |
|---|---|
| InputLabel | Сформировать FormField contract: label, hint, required, error |
| TextInput | Описать empty/filled/readOnly; проверить invalid semantics |
| Textarea | То же, плюс resize и character count composition |
| Select | Добавить invalid/error; open/closed оставить платформе как неподконтрольные states |
| CustomSelect | Определить: Combobox или legacy Select adapter |
| MultiSelect | Описать selected tags, keyboard navigation, loading/no-results |
| TextLength | Определить normal/warning/limit-exceeded states |

### Wave R2-D. Navigation, collections and feedback

Статус: **готово, 4 сентября 2026**. Интерактивные коллекции разделены по
семантике на static, action и toggle; для навигации канонизированы `current`,
open/closed и keyboard contracts. Dropdown и DropdownModal оставлены adapters,
Modal получил dialog/focus/loading contract, а feedback-варианты приведены к
`info/success/warning/error`. Row не получил искусственные loading/empty:
эти состояния принадлежат контейнеру списка.

| Компонент | Основная работа |
|---|---|
| SegmentedTabs | Исправить state extraction; оформить hover/focus/current/disabled |
| Row | Добавить selected, disabled, loading и empty при применимости |
| Chip | Согласовать interactive и static modes; решить loading |
| ClosableChip | Добавить hover/focus/disabled для remove action |
| SkillChip | Согласовать `clickable` и `disabled` с реальными states |
| Pagination | Проверить current page, disabled prev/next и focus order |
| ContextMenu | Описать trigger, open/closed и keyboard behavior |
| Dropdown | Оставить как adapter; определить Menu/Popover внутри |
| Modal | Описать open/closed, focus trap, Escape, focus return и loading |
| Notification | Нормализовать info/success/warning/error |
| Toast | Нормализовать type, dismiss и duration behavior |

### Wave R2-E. Non-interactive primitives

Статус: **готово, 4 сентября 2026**. Неинтерактивным primitives не добавлялись
искусственные hover/selected states. Loader и Skeleton используют `aria-busy`
на загружаемой области; CollapsedContent получил disclosure-контракт; Avatar,
иконки, separator, Content, PrettyScroll и motion получили accessibility rules.

Проверить, но не добавлять искусственные hover/focus states:

- Avatar;
- SpriteIcon и SocialIcon;
- Loader и Skeleton;
- Section и InlineSeparator;
- Content и CollapsedContent;
- PrettyScroll;
- EmptyPlaceholder;
- TransitionFade.

Для CollapsedContent всё же нужны `expanded/collapsed` и доступность управляющего
элемента, если trigger входит в публичный компонент.

После R2-E закрыт оставшийся base-scope tail: SalaryBar,
BoosterGradientWrapper, StatusChip, UnreadCounter и StepsSidebar. Для
utility-only StatusChip/UnreadCounter введены стабильные root-классы.

### Exit criteria R2

- Все существующие базовые компоненты имеют полный или явно `unsupported` state
  contract.
- Для каждого состояния есть воспроизводимый пример.
- Нет противоречий между state section, props, CSS, HTML и ARIA.
- Специализированные components используют общие primitives и tokens.

## 8. R3 — недостающие базовые компоненты

Новые компоненты называются по frontend-роли. Figma names остаются aliases в
evidence map.

### Wave R3-A. Обязательное ядро

Статус: **готово по code/docs, 4 сентября 2026**. Все компоненты ниже имеют
canonical specs, token-based CSS и живые state-примеры. Browser snapshots
остаются отдельной проверкой: в текущем окружении нет browser surface.

| Новый компонент | Что покрывает из Figma | Обязательные states |
|---|---|---|
| Badge | `badge`, counters | default; semantic variants; optional max value |
| Tabs | 1/2-level tabs и icon/counter tabs | default, hover, focus-visible, selected/current, disabled |
| Menu + MenuItem | menu rows и action dropdown | closed/open; item hover/focus/pressed/disabled/selected |
| Popover | Позиционируемый overlay для Menu/Tooltip/Select | closed/open, placement, dismiss |
| Tooltip | `Tooltip` | hidden/shown, hover/focus trigger, touch dismiss |
| Calendar | date elements | default, today, hover, focus-visible, selected, range, disabled, outside-month |
| DatePicker | date picker и date field | field states + calendar states + open/closed |
| TimePicker | time picker/time elements | field states + selected option + open/closed |
| FileUpload | generic files/upload | idle, loading/uploading, error, success, disabled |
| Dropzone | drag-and-drop picture variants | idle, hover, focus-visible, dragActive, disabled, error |
| Accordion | Figma accordion | collapsed, expanded, hover, focus-visible, disabled |

### Wave R3-B. Расширенные controls

| Новый компонент | Решение |
|---|---|
| Combobox | Добавлять только если CustomSelect действительно поддерживает search/typeahead |
| TagInput | Добавлять только если chips field допускает свободный ввод, а не выбор из списка |
| RichTextEditor | Отделить editor shell, toolbar actions и Textarea fallback |
| ColorPicker | Отделить picker от ColorSelect; проверить реальный product use case |
| ScrollArea | Нормализовать PrettyScroll, только если нужен публичный API |
| List/ListItem | Добавить поверх BaseRow, если есть общий collection contract |

### Wave R3-C. Optional and integration patterns

- ReactionPicker/Voting — после проверки пересечения со StarRating.
- HorizontalList и ControlList — только как layout primitives при повторном
  использовании минимум в трёх местах.
- reCAPTCHA — документировать как integration pattern, не переносить в core.
- Hotspot и Bullet — только при подтверждённом onboarding/coachmark use case.

### Exit criteria R3 — Core Gate

Переход к модулям разрешён, когда одновременно выполнено следующее:

- manifest покрывает 100% базового scope;
- у 100% интерактивных компонентов есть keyboard focus;
- у 100% components заполнена применимая state matrix;
- required states имеют живые examples и visual snapshots;
- новые компоненты используют только нормативные tokens;
- нет двух компонентов с одной семантической ролью без documented migration;
- нет публичных API с Figma-именами `inactive`, `disable`, `focus_select`,
  `Property 1` или `Variant2`;
- Tooltip, Tabs, Menu, Calendar/DatePicker, FileUpload/Dropzone и Badge готовы к
  повторному использованию;
- тесты и документация запускаются воспроизводимой командой.

## 9. R4 — каркасные модули

Начинаются только после `Core Gate`.

Приоритет:

1. PageHeader: navigation, user/guest panel, mobile menu.
2. PageFooter.
3. SectionHeader для listing/detail/profile.
4. ContentSection и EmptySection.
5. Sidebar и SidebarSection.
6. FilterPanel и FilterModal.

Пункты 1–5 закрыты в R4-A. FilterPanel и FilterModal закрыты в R4-B: они
используют общий form contract, modal focus management и одну модель параметров
фильтрации. Browser suite подтверждает responsive-варианты на контрольных ширинах.

Ограничения:

- модуль только композирует primitives;
- локальный интерактивный элемент внутри модуля запрещён, если он может быть
  базовым компонентом;
- responsive state не смешивается с interaction state;
- device variants описываются layout rules, а не тремя копиями markup.

### Exit criteria R4

- Shell listing/detail/profile собирается без новых ad-hoc controls.
- Есть примеры 375, 768, 1024 и 1440.
- Header и filters полностью доступны с клавиатуры.

## 10. R5 — entity-модули

Готовность к первой задаче зафиксирована в
[`R5-READINESS.md`](R5-READINESS.md). `VacancyCard` закрыта для current scope;
`QuickApply` и остальные бизнес-сценарии не входят в её UI-контракт без отдельного
evidence.

Приоритет:

1. VacancyCard и QuickApply.
2. SpecialistCard/ResumeCard — сначала решить, это одно семейство или разные.
3. CompanyCard и CompanyRatingCard.
4. TestCard.
5. SalaryReportCard и CourseCard.
6. JournalArticleCard.

Для каждой entity card обязательны:

- default, hover и focus-visible, если карточка кликабельна;
- skeleton и empty/fallback content;
- responsive composition;
- бизнес-состояния отдельной осью: archived, applied, hidden, promoted и т. п.;
- действия внутри карточки не создают вложенные конфликтующие click targets.

### Exit criteria R5

- Каждое семейство имеет один канонический component API.
- Figma business flags сопоставлены с понятными domain props.
- Все карточки собираются только из готовых primitives R2–R3.

## 11. R6 — stateful-продуктовые модули

Последняя очередь:

1. Profile sections и social/community connections.
2. Company reviews и official responses.
3. Conversation list, header, composer, attachments и message types.
4. Saved filters и двухуровневая рубрикация.
5. Test owner/guest flows.
6. Pricing/balance modules.
7. Product banners, branded areas и ads.

Для этих модулей нужны отдельные business-state diagrams. Общий UI-state
словарь не заменяет статусы `unread`, `sent`, `failed`, `expired`, `rejected`,
`archived` или `paymentFailed`.

### Exit criteria R6

- Описаны loading, empty, error, success и unauthorized на уровне сценария.
- Retry и destructive actions имеют явные правила.
- Business states тестируются отдельно от visual interaction states.
- Модуль не вводит новый primitive незаметно для core library.

## 12. Definition of Done одной задачи

Задача по компоненту закрывается только при наличии:

1. Canonical name и manifest entry.
2. Решения по legacy/Storybook aliases.
3. Семантической разметки и публичного API.
4. Заполненной state matrix с `required`, `conditional`, `unsupported`.
5. CSS на нормативных tokens.
6. Keyboard и pointer behavior.
7. ARIA только там, где нативной семантики недостаточно.
8. Живых examples для вариантов и состояний.
9. Visual snapshots минимум default, focus-visible, disabled и error/loading,
   когда они применимы.
10. Responsive examples для компонентов, меняющих композицию.
11. Ссылок на Storybook/production и Figma evidence.
12. Явных gaps без догадок.

## 13. Рекомендуемый первый backlog

Первые задачи, строго по порядку:

1. `R0-01` — manifest и source policy.
2. `R0-02` — нормативный state vocabulary.
3. `R0-03` — исправление извлечения states.
4. `R1-01` — общие action states.
5. `R2-A` — все существующие buttons.
6. `R1-02` + `R2-B` — Checkbox, RadioButton, Switch, StarRating.
7. `R1-03` + `R2-C` — поля и selects.
8. `R1-04` + `R2-D` — chips, rows, navigation, overlays, feedback.
9. `R3-A` — недостающие обязательные primitives.
10. Проведение `Core Gate`.
11. Только после него — `R4`, `R5`, `R6`.

Этот порядок сначала стабилизирует язык и поведение системы, затем закрывает
функциональные пробелы и не позволяет модулям закрепить ошибки Figma или legacy.
