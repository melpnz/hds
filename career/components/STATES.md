# Состояния компонентов Career

Нормативный словарь для API, CSS, спецификаций и showcase. Он применяется к
локальному UI kit. Названия вариантов в Figma считаются только evidence и не
переносятся сюда автоматически.

## Правила

- У компонента бывают только применимые состояния. Статичной иконке не нужны
  искусственные `hover`, `disabled` или `loading`.
- DOM-состояние, визуальное состояние и бизнес-статус описываются отдельно.
- В публичном API используются существующие Storybook-имена. Новое имя выбирается
  по семантической роли и общепринятому frontend-термину.
- Для boolean props используются `disabled`, `loading`, `selected`, `checked`,
  `indeterminate`, `open`, `readOnly`, `invalid`.
- Комбинации состояний проверяются отдельно. Наличие `checked` и `disabled` ещё не
  доказывает корректность `checked + disabled`.

## Канонический словарь

| State | Когда используется | DOM/API | Запрещённая подмена |
|---|---|---|---|
| `default` | Обычное доступное состояние | отсутствие state prop | `inactive` |
| `hover` | Указатель над interactive target | `:hover` | `focus-visible` |
| `focus-visible` | Видимый keyboard focus | `:focus-visible` | общий `focus` |

> У текстовых полей `:focus-visible` срабатывает и при фокусе указателем — так
> устроена спецификация: поле принимает клавиатурный ввод независимо от того,
> как в него попали. Поэтому одним селектором Tab от клика там не отличить;
> пакет отмечает режим атрибутом `data-focus-modality` (`ui/focus-modality.js`)
> и гасит по нему кольцо в `ui/state-contract.css`. Для кнопок, вкладок, чипов
> и переключателей `:focus-visible` работает как ожидается и надстройки не требует.
| `pressed` | Action нажат прямо сейчас | `:active`, `aria-pressed` для toggle button | `selected`, `current` |
| `selected` | Элемент выбран из набора | `aria-selected`, state prop | `pressed`, `checked` |
| `current` | Текущий route, page или step | `aria-current` | `selected` формы |
| `checked` | Выбран checkbox, radio или switch | `checked`, `aria-checked` | `selected` |
| `indeterminate` | Частично выбран checkbox | DOM `indeterminate`, `aria-checked="mixed"` | `checked` |
| `expanded` | Раскрыта секция контента | `aria-expanded="true"` | `open` overlay |
| `collapsed` | Секция контента свёрнута | `aria-expanded="false"` | `closed` overlay |
| `open` | Menu, popover, select или modal открыт | `open`, `aria-expanded`, dialog state | `expanded` section |
| `closed` | Overlay закрыт | отсутствие/open=false | `collapsed` section |
| `disabled` | Элемент недоступен | native `disabled` предпочтителен | `readOnly`, `loading` |
| `readOnly` | Значение доступно для чтения и focus, но не для изменения | `readonly` | `disabled` |
| `loading` | Выполняется операция | `loading`; часто `aria-busy` | `disabled` без progress |
| `invalid` | Form control не прошёл валидацию | `aria-invalid="true"`, `:invalid` при уместности | operation `error` |
| `error` | Операция или data request завершились ошибкой | domain state + feedback | field `invalid` |
| `success` | Операция успешно завершена | domain state + feedback | `selected` |
| `empty` | Коллекция или результат не содержит данных | data state | пустая строка input |
| `dragActive` | Перетаскиваемый файл находится над Dropzone | drag events | `hover` |

## Нормализация Figma evidence

| В источнике | В документации и коде |
|---|---|
| `inactive` | `default` |
| `disable` | `disabled` |
| `focus` как нарисованное кольцо | `focus-visible` |
| `focus_select` | два состояния: `focus-visible` и `selected` либо `open` |
| `select` как состояние | `selected` |
| `active` как постоянный выбор | `selected` или `current` |
| `error` у отдельного поля | `invalid` |
| `user-choice` | `selected` |
| `another month` | `outside-month` в Calendar, не глобальный state |

`Property 1`, `Default`, `Variant2` и опечатки из Figma не являются допустимыми
API-именами.

## Матрицы по семействам

Обозначения:

- **R** — required;
- **C** — conditional, только если сценарий поддерживается;
- **—** — не требуется.

### Actions

| State | Button | IconButton | Link action | Toggle action |
|---|---:|---:|---:|---:|
| default | R | R | R | R |
| hover | R | R | R | R |
| focus-visible | R | R | R | R |
| pressed | R | R | R | R |
| selected | — | C | — | R |
| disabled | R | R | C | R |
| loading | R | C | C | C |

### Selection controls

| State | Checkbox | RadioButton | Switch | StarRating |
|---|---:|---:|---:|---:|
| default | R | R | R | R |
| hover | R | R | R | R |
| focus-visible | R | R | R | R |
| checked/value | R | R | R | R |
| indeterminate | R | — | — | — |
| disabled | R | R | R | R |
| readOnly | — | — | C | C |
| loading | C | C | C | — |

### Fields

| State | TextInput/Textarea | Select | Combobox/MultiSelect |
|---|---:|---:|---:|
| default empty | R | R | R |
| filled | R | R | R |
| hover | R | R | R |
| focus-visible | R | R | R |
| disabled | R | R | R |
| readOnly | R | C | C |
| invalid | R | R | R |
| open/closed | — | R | R |
| option highlighted | — | R | R |
| option selected | — | R | R |
| loading | — | C | R |
| empty/no-results | — | C | R |

### Navigation and collections

| State | SegmentedTabs | Pagination | MenuItem | Interactive Row/Chip |
|---|---:|---:|---:|---:|
| default | R | R | R | R |
| hover | R | R | R | R |
| focus-visible | R | R | R | R |
| pressed | R | R | R | R |
| selected | R | — | C | C |
| current | C | R | C | C |
| disabled | R | R | R | C |
| loading | C | C | C | C |
| empty | — | — | C | C |

### Overlays and asynchronous feedback

| Component | Required states/behavior |
|---|---|
| Modal | closed, open, entering/leaving, focus trap, Escape, focus return |
| Menu/Popover | closed, open, trigger focus, keyboard navigation, dismiss |
| Tooltip | hidden/shown, hover and focus trigger, Escape/touch dismiss |
| Toast | entering, visible, dismissing; info/success/warning/error |
| Notification | info/success/warning/error; optional dismiss |
| FileUpload | default, loading, error, success, disabled |
| Dropzone | default, hover, focus-visible, dragActive, disabled, invalid |

## Бизнес-состояния

`archived`, `applied`, `unread`, `sent`, `rejected`, `expired`, `promoted`,
`paymentFailed` и похожие значения не добавляются в глобальный список. Они
принадлежат модулю и сопоставляются с общими feedback states только визуально.

## Definition of Done для states

- Все required states реализованы или явно отмечены `unsupported` с причиной.
- Для keyboard-interactive элемента есть видимый `focus-visible`.
- Для state есть не только CSS, но и воспроизводимый story/showcase example.
- Нативная семантика используется раньше ARIA.
- Disabled, loading и readOnly не смешаны.
- Selected/current/checked/pressed не используются как синонимы.
- В state section учтены component CSS, utility classes, props и ARIA.
