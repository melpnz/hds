# Аудит библиотеки компонентов Career

Дата аудита: 4 сентября 2026 года.

План выполнения по результатам аудита:
[`COMPONENT-ROADMAP.md`](COMPONENT-ROADMAP.md).

Статус: аудит только для чтения. Файлы Figma, CSS, документация и витрины не
изменялись.

## 1. Что проверялось

Сопоставлены три источника:

1. Figma-библиотека
   [`new-career-lib`](https://www.figma.com/design/e3XSMS635aYngCzY7VQaXY/)
   — примитивы, элементы форм и ассеты.
2. Figma-библиотека
   [`new-career-modules`](https://www.figma.com/design/tlV2zBiLdc2HPkIwR5haGE/)
   — составные продуктовые модули.
3. Локальный пакет `career/`: реестр из 75 спецификаций, CSS в `ui/` и живая
   витрина `showcase/components.html`.

Под «есть» ниже понимается не визуально похожий фрейм, а опубликованный Figma
component/component set либо отдельная локальная спецификация с реализацией.
Схожие, но не взаимозаменяемые компоненты помечены как частичное покрытие.

## 2. Сводка

| Слой | Объём | Основной вывод |
|---|---:|---|
| `new-career-lib` | 18 страниц, 111 component sets, 244 standalone components | Хорошо покрывает примитивы, но почти не документирован текстом |
| `new-career-modules` | 28 страниц, 84 component sets, 41 standalone component | Покрывает много продуктовых модулей, которых нет в локальном реестре |
| Локальные спецификации | 75 файлов | Подробно описывают извлечённый Storybook/CSS, но не являются полным отражением Figma |
| Локальный реестр | 99 логических компонентов из 427 stories | Хороший источник по существующему фронтенду, но не инвентарь дизайн-библиотеки |

У всех 195 Figma component sets и у всех 285 standalone components обнаружены
непустые component keys. При этом описания заполнены только у 1 из 111 наборов
`new-career-lib` и ни у одного из 84 наборов `new-career-modules`.

Главное узкое место подтверждено: локальная библиотека компонентов хорошо
воспроизводит доступный Storybook, но пропускает значительную часть Figma. Кроме
того, разделы про состояния неполны даже для уже описанных компонентов.

## 3. Что уже сделано хорошо

### 3.1. В Figma

- Сильное базовое покрытие: кнопки, controls, chips, поля, строки, tabs,
  pagination, modal, tooltip, calendar, upload и feedback.
- У примитивов последовательно применены размеры и состояния через variants.
- Кнопки почти во всех видах имеют `inactive`, `hover`, `focus`, `disable`,
  `loading`; icon/avatar/pagination button также имеют `selected`.
- Поля имеют `inactive`, `hover`, `focus_select`, `disable`, `error` и признак
  заполненности.
- Checkbox содержит отдельные оси `check` и `indeterminate`; radio и switch —
  ось `check`.
- Большая часть модулей имеет варианты `desktop`, `tablet`, `mobile`.
- Есть 248 базовых переменных в коллекции `new-career-ui`, отдельные коллекции
  `device` и `role`.
- Большой набор иконок, аватаров, empty-state иллюстраций и служебной графики уже
  оформлен компонентами, а не случайными слоями.

### 3.2. В локальной документации и UI kit

- 75 спецификаций имеют единый шаблон: анатомия, props, варианты, states,
  tokens, responsive, accessibility и источники.
- Базовые Button, IconButton, AvatarButton, PaginationButton, Checkbox,
  RadioButton, Switch, поля и Chip имеют реальные CSS, разметку и focus styles.
- Состояния `hover`, `focus-visible`, `disabled` и `checked` действительно
  реализованы в CSS, а не только перечислены в тексте.
- Витрина использует настоящие классы и ассеты продукта; её можно применять для
  визуальной сверки.
- Документация честно отмечает неподтверждённые места и не выдумывает отсутствующие
  правила.

## 4. Инвентарь базовых элементов

| Семейство | Figma | Локальная документация/UI kit | Результат |
|---|---|---|---|
| Text buttons | Полная матрица размеров и appearance | Button, AIButton, GhostButton, LinkStyledButton и специальные кнопки | Есть, но варианты и states разнесены по нескольким спецификациям |
| Icon/avatar/pagination button | Есть, включая selected и loading | Все три имеют спецификации и CSS | Частично: loading/selected описаны не везде |
| Badge/counter | Отдельный `badge` | Встроен в FilterButton и UnreadCounter | Нет отдельного базового компонента |
| Chips/tags | 12 наборов: обычные, social, reaction, filter, grade, tag | 5 спецификаций | Частичное покрытие |
| Checkbox/radio/switch | Все три + control-list | Все три описаны | Хорошее покрытие, но неполная state matrix |
| Input/select/textarea | 12 наборов | TextInput, Textarea, Select, CustomSelect, MultiSelect, InputLabel | Основное есть; часть специализированных полей отсутствует |
| Calendar/date/time | 3 набора + date-picker и time-picker | Нет спецификаций и базового CSS-компонента | Отсутствует |
| Accordion | Есть | Нет отдельной спецификации | Отсутствует |
| Color picker/select | Есть | Нет | Отсутствует |
| WYSIWYG textarea/panel | Есть | Есть только обычный Textarea и доменный ConversationForm | Отсутствует как переиспользуемый компонент |
| Row/list/dropdown | 10 наборов | Row, Dropdown, ContextMenu, PrettyScroll | Частичное покрытие |
| Tabs | 4 набора | Только SegmentedTabs | Существенно неполно |
| Pagination | Есть | Pagination + PaginationButton | Есть |
| Modal | Есть | Modal + DropdownModal | Есть, но состояния поведения не описаны |
| Tooltip | Есть | Нет | Отсутствует |
| Informer/toast | 6 наборов | Notification, Toast, EmptyPlaceholder | Основное есть; hotspot/bullet/voting form отсутствуют |
| Upload/drag-and-drop | 6 наборов | Только доменный ConversationFiles | Нет универсального компонента |
| Voting/rating/reactions | Emoji, stars, voting, reaction chips | StarRating и часть ассетов | Частичное покрытие |
| Avatar/icons/images | Большая опубликованная библиотека | Avatar, SpriteIcon, SocialIcon и локальные assets | Хорошее покрытие, но нет единого cross-reference |
| Loader | 3 размера | Loader и skeletons | Есть |
| reCAPTCHA | Responsive component | Нет | Нет; оформить как интеграционный паттерн, не как core component |

## 5. Модули Figma, которых нет или недостаточно в локальном реестре

### P0 — нужны для сборки типовых новых экранов

- Page header: menu item, user panel, guest/user варианты, адаптивная шапка.
- Page footer в трёх viewport-вариантах.
- Section headers для списков вакансий, специалистов, экспертов, компаний и
  рейтинга компаний.
- Карточка компании и карточка компании в рейтинге.
- Карточки специалиста: обычная, эксперт, отклик, отклик без регистрации,
  бесплатная вакансия, Habr user и Q&A user.
- Универсальные профильные блоки: заголовок секции, опыт, образование,
  профсообщества и рекомендательное письмо.
- Sidebar blocks и их композиция.
- Saved filters, filter modal и двухуровневая рубрикация.

### P1 — важные продуктовые сценарии

- Быстрый отклик и его до/после/неинтересно состояния.
- Расширенная vacancy card из Figma: branding, archive, owner, favorite,
  reaction, skeleton и иные кейсы. Локальный VacancyCard покрывает только часть.
- Company review, official response и редактирование ответа.
- Pricing row, balance row и pricing card.
- Course card и salary-report card.
- Полный комплект test cards и owner/guest action blocks.
- Диалоги: compact/full row, header, input, ordinary message, files, unread marker,
  приглашение, консультация и test message.

### P2 — контент и продвижение

- Journal article card.
- Бренд-профиль, сквозная вакансия, booster subscription и discovery banners.
- Content-area ad и sidebar ad как системные модули.
- Admin sidebars и contact/profile blocks компаний и пользователей.

### Что не считать отсутствующим без дополнительной проверки

Некоторые названия соответствуют друг другу только приблизительно:

- Figma specialist card и локальный ResumeCard;
- Figma dialog modules и локальная группа Conversation*;
- Figma content block и локальный Section;
- Figma informer и локальный Notification;
- Figma upload и локальный ConversationFiles.

Перед реализацией нужно определить каноническую модель каждого такого семейства,
а не создавать второй почти одинаковый компонент.

## 6. Аудит состояний

### 6.1. Фактическое покрытие

В `new-career-lib` состояния оформлены системно:

- `hover` и `focus` встречаются в 57 component sets;
- `disable` — в 55;
- `loading` — в 45;
- `error` — в 15;
- selected/select — в кнопках, rows, calendar и tabs.

В `new-career-modules` ни один из 84 наборов не имеет variant-оси `hover`,
`focus`, `disable`, `loading` или `error`. Там описаны прежде всего responsive и
бизнес-состояния. Это допустимо для статичных контейнеров, но недостаточно для
интерактивных карточек, menu items, filters, dialog rows и profile actions.

В локальных 75 спецификациях:

- у 34 прямо написано, что состояния не объявлены;
- только у 25 раздел «Состояния» фиксирует хотя бы одно распознаваемое
  пользовательское состояние;
- 50 не фиксируют ни одного такого состояния в этом разделе. В это число входят
  и корректно статичные компоненты, поэтому оно не равно числу дефектов.

### 6.2. Ошибка извлечения документации

Раздел «Состояния» анализирует компонентный CSS, но не всегда учитывает utility
classes, props и ARIA в той же спецификации. Например, `SegmentedTabs` сообщает,
что состояний нет, хотя его HTML содержит `hover`, `focus-visible`,
`aria-current="page"` и `aria-disabled="true"`.

Сигналы состояний вне раздела «Состояния» обнаружены ещё в LinkStyledButton,
RoundedArrowButton, VacancyCard, VisibilitySettings, ConversationForm,
ConversationsTemplates и других файлах. Значит, текущая state matrix даёт
ложноотрицательные результаты.

### 6.3. Проверка обязательных состояний

Обозначения: **есть** — подтверждено; **частично** — состояние есть только в одном
источнике или не описано как контракт; **нет** — не найдено.

| Семейство | Необходимый минимум | Figma | Локальный слой | Вывод |
|---|---|---|---|---|
| Обычная кнопка | default, hover, focus-visible, pressed, disabled, loading | Всё кроме pressed | Всё кроме pressed; loading есть не у всех типов | Добавить pressed и унифицировать loading |
| Link/Rounded/Salary button | hover, focus-visible, pressed, disabled | Частично через базовые button variants | В state-разделах почти пусто | P0 gap для клавиатуры и disabled |
| Icon/avatar button | hover, focus-visible, selected при необходимости, disabled, loading | Есть | Hover/focus/disabled есть; selected/loading описаны непоследовательно | Синхронизировать контракт с props/Figma |
| Checkbox | unchecked, checked, indeterminate, hover, focus-visible, disabled; комбинации checked/disabled | Есть, плюс loading | Есть checked/disabled/focus; `.is-minus` не объяснён как indeterminate, loading только prop | Формализовать indeterminate и loading |
| Radio | unchecked, checked, hover, focus-visible, disabled | Есть, плюс loading | Основное есть | Добавить демонстрацию комбинаций |
| Switch | off/on, hover, focus-visible, disabled | Есть, плюс loading | Основное есть; loading только prop | Добавить loading и state examples |
| Text field/textarea | empty, filled, hover, focus, disabled, error, optional read-only | Всё кроме read-only | Hover/focus/disabled/invalid есть; filled не оформлен как state | Добавить filled/read-only contract |
| Select/custom select | empty, filled, hover, focus/open, selected, disabled, error | Есть в Figma | Разнесено между Select, CustomSelect и MultiSelect | Собрать единую матрицу и закрыть error для BaseSelect |
| Tabs | default, hover, focus-visible, selected/current, disabled, loading | Есть | Разметка содержит часть, state-раздел говорит «нет» | Исправить документацию; добавить variants/examples |
| Row/menu item | default, hover, focus-visible, selected, disabled, loading/empty при необходимости | Есть в Figma | Row описывает только hover/focus | Не хватает selected/disabled/loading/empty contract |
| Clickable card | default, hover, focus-visible, selected/visited при сценарии, disabled при сценарии | В modules почти не оформлено | Обычно default; иногда hover | P0 accessibility gap для карточек |
| Dropdown/context menu | closed/open, trigger hover/focus, item hover/focus/selected/disabled, loading/empty | Частично через row components | Open/close и keyboard states не собраны в контракт | Нужна составная state matrix |
| Modal | closed/open, loading, success/error при сценарии, focus trap, disabled submit | Только viewport variants | Props есть, state-раздел пуст | Поведение и focus management не документированы |
| Tooltip | hidden/shown, hover/focus trigger, placements, touch-dismiss | Только custom yes/no | Компонента нет | Добавить отдельный компонент и поведение |
| Upload | idle, hover, focus, active/drag-over, disabled, loading, error, success | Есть всё, кроме отдельного success | Только доменные file states | Добавить универсальный upload contract |
| Star rating | empty/value, hover preview, focus, checked, disabled, read-only | Частично | Только hover описан, хотя есть `disabled` prop | P0 accessibility gap |

### 6.4. Интерактивность прототипов Figma

Наличие variant не означает, что интерактивный переход настроен. Prototype
reactions обнаружены только у пяти наборов `new-career-lib`: checkbox, radio,
switch, bullet и hotspot-dot. У кнопок, полей, rows, tabs и chips статические
state variants не связаны реакциями. В `new-career-modules` реакций нет вообще.

Это не мешает использовать библиотеку как визуальную спецификацию, но не позволяет
агенту или дизайнеру проверять поведение кликом без ручного переключения variants.

## 7. Проблемы самой Figma-библиотеки

1. Почти отсутствуют descriptions: 1/111 в base library и 0/84 в modules.
2. Смешаны языки и словари: `inactive`, `disable`, `select`, `focus_select`,
   `Иные кейсы`, `Заглушка`, `Property 1`.
3. Есть опечатки и нестабильные имена: `tost`, `informators`, `textfileds`,
   `vacansy`, `comfirmed`, `pined`.
4. Есть несемантичные варианты `Default`, `Variant2`, `Property 1`, которые агент
   не может надёжно интерпретировать.
5. Размер, appearance и state кнопки закодированы в имени нескольких отдельных
   component sets. Это создаёт дублирование и усложняет поиск канонического button.
6. `focus_select` объединяет два разных состояния: keyboard focus и выбранное/
   открытое значение.
7. Не выделен `pressed/active` для action components.
8. В modules responsive variants сделаны хорошо, но состояния интерактивных
   вложенных элементов не видны на уровне контракта модуля.

## 8. Рекомендуемый порядок исправлений

### P0. Сделать инвентарь и states надёжными

1. Создать машинно-читаемый `COMPONENT-MAP`: Figma node key → каноническое имя →
   локальная спецификация → CSS root → showcase example → статус покрытия.
2. Исправить генерацию раздела «Состояния»: учитывать component CSS, utility
   classes в HTML, props, ARIA и Figma variant properties.
3. Ввести единый словарь: `default`, `hover`, `focus-visible`, `pressed`,
   `selected`, `disabled`, `loading`, `error`, `success`, `empty`, `open`.
4. Добавить отдельную state matrix для интерактивных примитивов и не требовать
   hover/disabled у статичных элементов.
5. Закрыть Calendar, Tooltip, Tabs, generic Upload, Badge и generic Menu/Row — это
   самые заметные базовые пробелы.
6. Добавить focus-visible для clickable cards и StarRating.

### P1. Перенести канонические продуктовые модули

1. Header/footer/menu/user panel.
2. Company и specialist cards.
3. Section headers и profile sections.
4. Filters и sidebar blocks.
5. Полную vacancy card и быстрый отклик.
6. Dialog primitives и business-message variants.

### P2. Нормализовать Figma

1. Заполнить descriptions: назначение, когда использовать, slots, forbidden
   combinations и ссылка на код/спецификацию.
2. Исправить опечатки и заменить `Property 1`/`Variant2` семантическими именами.
3. Объединить дублирующиеся button sets либо явно назначить один entry component.
4. Разделить `focus_select` на независимые axes/state values.
5. Добавить prototype reactions хотя бы для Button, Input, Select, Tabs, Chips,
   Row/Menu и Upload.

## 9. Definition of Done для компонента

Компонент можно считать перенесённым из Figma в документацию/UI kit, только если:

- есть каноническое имя и ссылка на Figma node key;
- описаны назначение и границы использования;
- перечислены anatomy, slots и responsive rules;
- реализованы применимые состояния из state matrix;
- есть `focus-visible` для каждого keyboard-interactive элемента;
- disabled работает визуально и семантически;
- loading не допускает повторное действие;
- error/success имеют понятное сообщение, если применимы;
- есть живая демонстрация default и всех нетривиальных states;
- есть примеры desktop/tablet/mobile для responsive modules;
- спецификация не противоречит props, utility classes и ARIA в своей же разметке;
- указан статус: `complete`, `partial`, `legacy-only` или `figma-only`.

## 10. Итог

Не стоит начинать с массового копирования всех 195 component sets. Сначала нужно
починить карту соответствий и модель states; иначе новые элементы увеличат число
дублей и противоречий. После этого оптимальная первая партия — Calendar, Tooltip,
Tabs, Upload, Badge и Menu/Row, затем Header/Footer, карточки компаний и
специалистов, profile/filters/sidebar modules.
