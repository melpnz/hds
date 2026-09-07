# Компоненты Career — реестр и устройство спецификаций

Единая точка входа в слой компонентов: **что существует, где это лежит
и как читать спецификацию**. Заменяет прежние `README.md` и `_inventory.md`.

427 записей Storybook сведены в **99 компонентов**. Вместе с нормативными
компонентами UI kit без отдельной Storybook story реестр содержит
**87 спецификаций**.
Записи сведены по смыслу, а не по структуре: `BaseButton/Primary` и
`BaseButton/Affixes` — один компонент с двумя story, `TestItemPassed` и
`TestItemFailed` — исходы одного `TestItem`. Таксономия здесь интерфейсная,
а не сторибучная.

| Задача | Куда идти |
|---|---|
| Увидеть компонент вживую | [`../showcase/components.html`](../showcase/components.html) |
| Понять правила композиции | [`../docs/guide/composition.md`](../docs/guide/composition.md) |
| Понять устройство конкретного компонента | реестр ниже → файл спецификации |
| Найти каноническое имя и статус покрытия | [`manifest.json`](manifest.json) |
| Проверить обязательные состояния | [`STATES.md`](STATES.md) |
| Запустить проверку manifest и state evidence | `node ../tools/validate-components.mjs` |
| Взять переменные | [`../ui/tokens.css`](../ui/tokens.css), разбор — [`../evidence/tokens.md`](../evidence/tokens.md) |
| Понять, чего в пакете нет | [`../evidence/coverage.md`](../evidence/coverage.md) |
| Найти разметку story, не попавшей в витрину | [`../evidence/markup.md`](../evidence/markup.md) |
| Найти иконку или иллюстрацию | [`../ui/assets/README.md`](../ui/assets/README.md) |
| Собрать страницу из компонентов | [`../showcase/pages.html`](../showcase/pages.html) |

---

## Устройство спецификации

Каждый файл построен одинаково, и почти всё в нём — извлечённые факты,
а не пересказ:

| Раздел | Откуда берётся |
|---|---|
| Шапка | корневой класс, файл CSS, наличие живой реализации, покрытие snapshot |
| **Назначение** | написано вручную: Storybook Career не содержит описаний |
| **Анатомия** | дерево DOM из настоящего snapshot, Vue-скоуп снят |
| **Варианты** | классы `appearance-*` / `--variant` и их фон, текст, рамка — из CSS |
| **Размеры** | классы `size-*` и их высота, padding, радиус, кегль — из CSS |
| **Состояния** | псевдоклассы и классы-состояния, объявленные в CSS, с текстом правил |
| **Слоты** | из `argTypes`, категория `slots` |
| **Props** | из `argTypes`: тип, значение по умолчанию, допустимые значения, тип контрола |
| **Токены** | все `var(--…)` в CSS компонента, со значениями |
| **Иконки** | символы спрайтов, на которые ссылается разметка |
| **Responsive** | медиазапросы в CSS плюс брейкпоинт-префиксы в классах разметки |
| **Доступность** | ARIA-атрибуты и `role`, встречающиеся в реальной разметке |
| **Поведение** | написано вручную по CSS и разметке |
| **Разметка** | готовый к переносу HTML |
| **CSS** | текст правил компонента |
| **Ограничения** | что не подтверждено и чего конкретно не хватает |
| **Источники** | id story, секции CSS, узлы Figma, страницы production |

Если раздела нет — значит, подтверждать было нечего. Извлечённые факты явно
отделяются от нормативного UI kit contract. Восстановленные gaps отмечаются как
новая реализация и живут в `../ui/state-contract.css`, поэтому их нельзя принять
за исторический production snapshot.

---

---

## Реестр

Колонки: **Назначение** — что делает компонент; **Story** — сколько story у компонента; **Разметка** — для скольких снят реальный DOM; **Props** — сколько publicly объявленных props и слотов; **CSS** — секции в `../ui/components/`; **Живой** — есть ли компонент в `../showcase/components.html` настоящей вёрсткой.

## Каркасные модули R4

Эти записи — нормативные композиции UI kit, а не извлечённые Storybook stories.
Они собираются только из закрытых базовых компонентов и production layout rules.

| Компонент | Назначение | Источник | CSS | Живой | Спецификация |
|---|---|---|---|---|---|
| **PageHeader** | глобальная навигация, user/guest panel, mobile menu | production 1440/375 | `page-header` | да | [modules/page-header.md](modules/page-header.md) |
| **PageFooter** | группы продуктовых и социальных ссылок | production 404 page | `page-footer` | да | [modules/page-footer.md](modules/page-footer.md) |
| **SectionHeader** | title, description и actions для listing/detail/profile | production pages | `section-header` | да | [modules/section-header.md](modules/section-header.md) |
| **ContentSection** | Section + SectionHeader + body/footer | production composition | `content-section` | да | [modules/content-section.md](modules/content-section.md) |
| **EmptySection** | пустой результат внутри контентной секции | production empty block | `empty-section` | да | [modules/empty-section.md](modules/empty-section.md) |
| **Sidebar** | 300px complementary column, sticky/stack/hidden | production layout | `sidebar` | да | [modules/sidebar.md](modules/sidebar.md) |
| **SidebarSection** | компактная секция внутри Sidebar | production sidebar box | `sidebar-section` | да | [modules/sidebar-section.md](modules/sidebar-section.md) |
| **FilterPanel** | форма фильтров из готовых form primitives | production vacancy listing | `filter-panel` | да | [modules/filter-panel.md](modules/filter-panel.md) |
| **FilterModal** | modal adapter FilterPanel для узкой ширины | production responsive + Modal contract | `filter-modal` | да | [modules/filter-modal.md](modules/filter-modal.md) |

## Баннеры

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **HHImportProfileStatusBanner** | состояние фоновой операции | `Banners/HHImportProfileStatusBanner` | 3 | 3 | 0 / 0 | _утилиты_ | да | [banners/hh-import-banner.md](banners/hh-import-banner.md) |
| **HrNewsletterSubscription** | подписка на рассылку | `Banners/HrNewsletterSubscription` | 1 | 1 | 0 / 0 | _утилиты_ | да | [banners/hr-newsletter.md](banners/hr-newsletter.md) |
| **InnerProjectBanner** | баннер проекта Хабра | `Banners/InnerProjectBanner` | 2 | 2 | 1 / 0 | _утилиты_ | да | [banners/inner-project-banner.md](banners/inner-project-banner.md) |
| **JournalBlockSidebar** | блок Журнала | `Banners/JournalBlockSidebar` | 1 | 0 _(сломано 1)_ | 0 / 0 | _утилиты_ | нет | [banners/journal-block-sidebar.md](banners/journal-block-sidebar.md) |
| **NewNotice** | подсказка о новой возможности | `Banners/NewNotice` | 3 | 3 | 3 / 0 | _утилиты_ | да | [banners/new-notice.md](banners/new-notice.md) |
| **PromotionCard** | карточка продвижения | `Banners/PromotionCard` | 1 | 0 _(сломано 1)_ | 0 / 0 | `promotion-card` | нет | [banners/promotion-card.md](banners/promotion-card.md) |
| **ResumesGuideCard** | промо-карточка гайда | `Banners/ResumesGuideCard` | 1 | 1 | 0 / 0 | `resumes-guide-card` | да | [banners/resumes-guide-card.md](banners/resumes-guide-card.md) |
| **SidebarAdCompany** | реклама компании | `Banners/SidebarAdCompany` | 1 | 1 | 1 / 0 | _утилиты_ | да | [banners/sidebar-ad-company.md](banners/sidebar-ad-company.md) |
| **TrackBanner** | баннер трека | `Banners/TrackBanner` | 2 | 2 | 0 / 0 | _утилиты_ | да | [banners/track-banner.md](banners/track-banner.md) |

## Действия

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **AIButton** | действие с участием AI, градиентная рамка | `Common/Buttons/AIButton` | 1 | 1 | 5 / 2 | `ai-button` | да | [actions/ai-button.md](actions/ai-button.md) |
| **AvatarButton** | круглая кнопка с аватаром | `Common/Buttons/BaseAvatarButton` | 2 | 2 | 6 / 1 | `base-avatar-button` | да | [actions/avatar-button.md](actions/avatar-button.md) |
| **Button** | основная кнопка, база для всех остальных | `Common/Buttons/BaseButton` | 2 | 2 | 10 / 3 | `base-button` | да | [actions/button.md](actions/button.md) |
| **ButtonRange** | выбор диапазона рядом кнопок | `Form/ButtonRange` | 3 | 0 _(сломано 3)_ | 0 / 0 | `button-range` | да, UI kit pattern | [actions/button-range.md](actions/button-range.md) |
| **FilterButton** | кнопка фильтра со счётчиком | `Common/Buttons/FilterButton` | 2 | 2 | 13 / 3 | `filter-button` | да | [actions/filter-button.md](actions/filter-button.md) |
| **GhostButton** | действие без фона | `Common/Buttons/GhostButton` | 2 | 2 | 8 / 3 | `ghost-button` | да | [actions/ghost-button.md](actions/ghost-button.md) |
| **IconButton** | круглая кнопка с иконкой | `Common/Buttons/BaseIconButton` | 1 | 1 | 6 / 1 | `base-icon-button` | да | [actions/icon-button.md](actions/icon-button.md) |
| **LinkStyledButton** | кнопка в виде ссылки | `Common/Buttons/LinkStyledButton` | 1 | 1 | 1 / 1 | `link-styled-button` | да | [actions/link-styled-button.md](actions/link-styled-button.md) |
| **PaginationButton** | кнопка страницы | `Common/Buttons/BasePaginationButton` | 1 | 1 | 7 / 1 | `base-pagination-button` | да | [actions/pagination-button.md](actions/pagination-button.md) |
| **RoundedArrowButton** | кнопка-стрелка с подписью | `Common/Buttons/RoundedArrowButton` | 1 | 1 | 5 / 0 | `rounded-arrow-button` | да | [actions/rounded-arrow-button.md](actions/rounded-arrow-button.md) |
| **SalaryHeadButton** | составная кнопка раздела зарплат | `Common/Buttons/SalaryHeadButton` | 1 | 1 | 3 / 0 | `salary-head-button` | да | [actions/salary-head-button.md](actions/salary-head-button.md) |

## Карточки

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **CompanyRatingStepsSidebar** | шаги оценки компании | `Companies/CompanyRatingStepsSidebar` | 3 | 3 | 3 / 0 | `steps-sidebar` | да | [cards/company-rating-steps.md](cards/company-rating-steps.md) |
| **ConsultationRecord** | строка консультации | `Consultations/ConsultationRecord` | 11 | 11 | 6 / 0 | _утилиты_ | да | [cards/consultation-record.md](cards/consultation-record.md) |
| **ConversationCard** | строка списка откликов | `Conversations/List/ConversationCard` | 6 | 6 | 8 / 0 | `conversation-card` | да | [cards/conversation-card.md](cards/conversation-card.md) |
| **ResumeCard** | карточка резюме | `Resumes/ResumeCard` | 3 | 0 _(сломано 3)_ | 0 / 0 | `resume-card` | нет | [cards/resume-card.md](cards/resume-card.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/BasicScreeningCard` | 7 | 0 _(сломано 7)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/SpecsTestItemPassed` | 6 | 0 _(сломано 6)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/TestItemExpired` | 7 | 0 _(сломано 7)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/TestItemFailed` | 5 | 0 _(сломано 5)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/TestItemPassed` | 9 | 0 _(сломано 9)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/TestItem` | 7 | 7 | 5 / 2 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/TestResultAdditional` | 6 | 0 _(сломано 6)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **TestItem** | карточка теста, все исходы | `Tests/Cards/TestResultItem` | 12 | 0 _(сломано 12)_ | 0 / 0 | _утилиты_ | частично | [cards/test-item.md](cards/test-item.md) |
| **VacancyCard** | карточка вакансии в листинге; `VacancyCardWithCompanyAndDate` — legacy evidence | `Vacancies/VacancyCardWithCompanyAndDate` | 12 | 12 | 4 / 0 | `vacancy-card` | да | [cards/vacancy-card.md](cards/vacancy-card.md) |
| **VacancyImportCard** | карточка импорта вакансии | `Companies/CP/VacancyImports/Card` | 6 | 6 | 4 / 0 | _утилиты_ | да | [cards/vacancy-import-card.md](cards/vacancy-import-card.md) |
| **VisibilitySettings** | переключатель видимости блока | `Tests/VisibilitySettingsNotification` | 3 | 3 | 3 / 0 | _утилиты_ | да | [cards/visibility-settings.md](cards/visibility-settings.md) |
| **VisibilitySettings** | переключатель видимости блока | `Tests/VisibilitySettings` | 3 | 3 | 3 / 0 | _утилиты_ | да | [cards/visibility-settings.md](cards/visibility-settings.md) |

## Метки и статусы

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **Chip** | базовая метка | `Common/Chips/BaseChip` | 4 | 4 | 8 / 2 | `base-chip` | да | [labels/chip.md](labels/chip.md) |
| **Badge** | числовой или точечный индикатор | — | 0 | 0 | 0 / 0 | `base-badge` | да | [labels/badge.md](labels/badge.md) |
| **ClosableChip** | метка с удалением | `Common/Chips/ClosableChip` | 1 | 1 | 2 / 1 | `closable-chip` | да | [labels/closable-chip.md](labels/closable-chip.md) |
| **SkillChip** | навык с подтверждением и грейдом | `Skills/SkillChip` | 4 | 4 | 6 / 0 | `skill-chip` | да | [labels/skill-chip.md](labels/skill-chip.md) |
| **StatusChip** | цветная метка состояния | `Conversations/List/ConversationsChip` | 6 | 6 | 1 / 2 | _утилиты_ | да | [labels/status-chip.md](labels/status-chip.md) |
| **UnreadCounter** | счётчик непрочитанного | `Conversations/List/UnreadCounter` | 5 | 5 | 1 / 1 | _утилиты_ | да | [labels/unread-counter.md](labels/unread-counter.md) |

## Модуль: переписка

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **ConversationFiles** | вложения | `Conversations/Files/ConversationAttachedFilePresenter` | 4 | 4 | 6 / 0 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationFiles** | вложения | `Conversations/Files/ConversationAttachedFileUploader` | 3 | 3 | 4 / 0 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationFiles** | вложения | `Conversations/Files/ConversationAttachedFiles` | 3 | 3 | 4 / 0 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationFiles** | вложения | `Conversations/Files/ConversationFileIcon` | 7 | 7 | 5 / 0 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationFiles** | вложения | `Conversations/Files/ConversationFileUploadingAnimation` | 3 | 3 | 5 / 1 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationFiles** | вложения | `Conversations/Files/ConversationFilesCatcher` | 2 | 2 | 1 / 1 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationFiles** | вложения | `Conversations/Files/ConversationFilesSelectorModal` | 1 | 1 | 5 / 0 | `conversation-attached-files` `conversation-attached-file-presenter` `conversation-file-uploading-animation` `conversation-files-selector-modal` | да | [modules/conversation-files.md](modules/conversation-files.md) |
| **ConversationForm** | форма ответа | `Conversations/Messages/ConversationFloatButton` | 4 | 4 | 5 / 0 | `conversation-float-button` | да | [modules/conversation-form.md](modules/conversation-form.md) |
| **ConversationForm** | форма ответа | `Conversations/Form/ConversationForm` | 3 | 3 | 6 / 1 | `conversation-float-button` | да | [modules/conversation-form.md](modules/conversation-form.md) |
| **ConversationHeader** | шапка переписки | `Conversations/Header/ConversationCompanyLink` | 1 | 1 | 3 / 0 | _утилиты_ | да | [modules/conversation-header.md](modules/conversation-header.md) |
| **ConversationHeader** | шапка переписки | `Conversations/Header/ConversationContextMenu` | 3 | 3 | 11 / 0 | _утилиты_ | да | [modules/conversation-header.md](modules/conversation-header.md) |
| **ConversationHeader** | шапка переписки | `Conversations/Header/ConversationHabrAdminLabel` | 1 | 1 | 0 / 0 | _утилиты_ | да | [modules/conversation-header.md](modules/conversation-header.md) |
| **ConversationHeader** | шапка переписки | `Conversations/Header/ConversationHeader` | 4 | 4 | 1 / 1 | _утилиты_ | да | [modules/conversation-header.md](modules/conversation-header.md) |
| **ConversationsList** | список откликов | `Conversations/Layout/ConversationsLayout` | 3 | 0 _(сломано 3)_ | 0 / 0 | `conversations-sidebar` | частично | [modules/conversations-list.md](modules/conversations-list.md) |
| **ConversationsList** | список откликов | `Conversations/Layout/ConversationsSidebarHeader` | 2 | 2 | 2 / 1 | `conversations-sidebar` | частично | [modules/conversations-list.md](modules/conversations-list.md) |
| **ConversationsTemplates** | шаблоны ответов | `Conversations/Templates/ConversationsTemplateForm` | 2 | 2 | 5 / 0 | _утилиты_ | да | [modules/conversation-templates.md](modules/conversation-templates.md) |
| **ConversationsTemplates** | шаблоны ответов | `Conversations/Templates/ConversationsTemplatesHeader` | 1 | 1 | 1 / 0 | _утилиты_ | да | [modules/conversation-templates.md](modules/conversation-templates.md) |
| **ConversationsTemplates** | шаблоны ответов | `Conversations/Templates/ConversationsTemplatesList` | 4 | 4 | 7 / 0 | _утилиты_ | да | [modules/conversation-templates.md](modules/conversation-templates.md) |
| **ConversationsTemplates** | шаблоны ответов | `Conversations/Templates/ConversationsTemplates` | 1 | 1 | 1 / 1 | _утилиты_ | да | [modules/conversation-templates.md](modules/conversation-templates.md) |
| **Messages** | лента сообщений | `Conversations/Messages/ConversationMessages` | 6 | 0 _(сломано 6)_ | 0 / 0 | `conversation-messages` `messages-group` | частично | [modules/conversation-messages.md](modules/conversation-messages.md) |
| **Messages** | лента сообщений | `Conversations/Messages/MessageStatusIcon` | 3 | 3 | 1 / 0 | `conversation-messages` `messages-group` | частично | [modules/conversation-messages.md](modules/conversation-messages.md) |
| **Messages** | лента сообщений | `Conversations/Messages/MessageTime` | 5 | 5 | 2 / 0 | `conversation-messages` `messages-group` | частично | [modules/conversation-messages.md](modules/conversation-messages.md) |
| **Messages** | лента сообщений | `Conversations/Messages/MessagesGroup` | 3 | 0 _(сломано 3)_ | 0 / 0 | `conversation-messages` `messages-group` | частично | [modules/conversation-messages.md](modules/conversation-messages.md) |
| **Messages** | лента сообщений | `Conversations/Messages/MessageAttachements` | 7 | 7 | 5 / 0 | `conversation-messages` `messages-group` | частично | [modules/conversation-messages.md](modules/conversation-messages.md) |
| **Messages** | лента сообщений | `Conversations/Messages/Messages` | 25 | 0 _(сломано 25)_ | 0 / 0 | `conversation-messages` `messages-group` | частично | [modules/conversation-messages.md](modules/conversation-messages.md) |

## Модуль: тесты

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **TestResultModals** | окна результатов тестов | `Tests/Modals/ScreeningsListModal` | 2 | 0 _(сломано 2)_ | 0 / 0 | `skills-test-result-modal` `specs-test-result-modal` | нет | [modules/test-modals.md](modules/test-modals.md) |
| **TestResultModals** | окна результатов тестов | `Tests/Modals/SkillsTestResultModal` | 3 | 0 _(сломано 3)_ | 0 / 0 | `skills-test-result-modal` `specs-test-result-modal` | нет | [modules/test-modals.md](modules/test-modals.md) |
| **TestResultModals** | окна результатов тестов | `Tests/Modals/SpecsTestResultModal` | 2 | 0 _(сломано 2)_ | 0 / 0 | `skills-test-result-modal` `specs-test-result-modal` | нет | [modules/test-modals.md](modules/test-modals.md) |

## Навигация

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **ContextMenu** | меню действий, обычное и изоморфное | `Common/ContextMenu/Default` | 2 | 2 | 3 / 2 | `context-menu-item` `isomorphic-context-menu` | да | [navigation/context-menu.md](navigation/context-menu.md) |
| **ContextMenu** | меню действий, обычное и изоморфное | `Common/ContextMenu/Isomorphic` | 2 | 2 | 6 / 2 | `context-menu-item` `isomorphic-context-menu` | да | [navigation/context-menu.md](navigation/context-menu.md) |
| **Menu** | меню команд | — | 0 | 0 | normative API | `menu` | да, UI kit pattern | [navigation/menu.md](navigation/menu.md) |
| **MenuItem** | команда меню | — | 0 | 0 | normative API | `menu-item` | да, UI kit pattern | [navigation/menu-item.md](navigation/menu-item.md) |
| **Pagination** | постраничная навигация | `Common/Navigation/BasePagination` | 3 | 3 | 5 / 1 | `base-pagination-button` | да | [navigation/pagination.md](navigation/pagination.md) |
| **SegmentedTabs** | переключатель представления | `Common/Navigation/BaseSegmentedTabs` | 4 | 4 | 1 / 0 | _утилиты_ | да | [navigation/segmented-tabs.md](navigation/segmented-tabs.md) |

## Обратная связь

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **EmptyPlaceholder** | пустое состояние | `Conversations/Layout/ConversationNotSelected` | 1 | 1 | 0 / 0 | `empty-placeholder` | да | [feedback/empty-placeholder.md](feedback/empty-placeholder.md) |
| **EmptyPlaceholder** | пустое состояние | `Conversations/List/NoConversationsFound` | 2 | 2 | 1 / 0 | `empty-placeholder` | да | [feedback/empty-placeholder.md](feedback/empty-placeholder.md) |
| **EmptyPlaceholder** | пустое состояние | `Conversations/List/NoConversations` | 2 | 2 | 1 / 0 | `empty-placeholder` | да | [feedback/empty-placeholder.md](feedback/empty-placeholder.md) |
| **EmptyPlaceholder** | пустое состояние | `Conversations/Messages/NoMessages` | 1 | 1 | 0 / 0 | `empty-placeholder` | да | [feedback/empty-placeholder.md](feedback/empty-placeholder.md) |
| **Notification** | врезка в потоке страницы | `Common/Notifications/BaseNotification` | 4 | 4 | 10 / 2 | `base-notification` | да | [feedback/notification.md](feedback/notification.md) |
| **Skeleton** | каркас загрузки | `Conversations/List/ConversationsListSkeleton` | 2 | 2 | 2 / 0 | `skeleton-pulse` `skeleton-shape` | да | [feedback/skeleton.md](feedback/skeleton.md) |
| **Toast** | всплывающее сообщение | `Common/Notifications/Toastify` | 4 | 4 | 3 / 0 | `notify` | частично | [feedback/toast.md](feedback/toast.md) |

## Оверлеи

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **Modal** | модальное окно | `Companies/CP/VacancyImports/GroupsModal` | 2 | 2 | 6 / 0 | `base-modal` `modal-overlay` | да | [overlays/modal.md](overlays/modal.md) |
| **Modal** | модальное окно | `Conversations/Modals/ConversationCompleteConsultationModal` | 1 | 1 | 6 / 0 | `base-modal` `modal-overlay` | да | [overlays/modal.md](overlays/modal.md) |
| **Modal** | модальное окно | `Conversations/Modals/ConversationReportFailedConsultationModal` | 1 | 1 | 6 / 0 | `base-modal` `modal-overlay` | да | [overlays/modal.md](overlays/modal.md) |
| **Modal** | модальное окно | `Conversations/Modals/ConversationScoreConsultationModal` | 1 | 1 | 6 / 0 | `base-modal` `modal-overlay` | да | [overlays/modal.md](overlays/modal.md) |
| **Modal** | модальное окно | `Conversations/Files/ConversationNotUploadedFilesModal` | 1 | 1 | 3 / 0 | `base-modal` `modal-overlay` | да | [overlays/modal.md](overlays/modal.md) |
| **Popover** | позиционируемый немодальный слой | — | 0 | 0 | normative API | `popover` | да, UI kit pattern | [overlays/popover.md](overlays/popover.md) |
| **Tooltip** | контекстная текстовая подсказка | — | 0 | 0 | normative API | `tooltip` | да, UI kit pattern | [overlays/tooltip.md](overlays/tooltip.md) |

## Отображение данных

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **SalaryBar** | зарплатная шкала | `Salary/SalaryBar` | 11 | 11 | 3 / 0 | `salary-bar` | да | [data/salary-bar.md](data/salary-bar.md) |
| **Accordion** | группа раскрывающихся секций | — | 0 | 0 | normative API | `accordion` | да, UI kit pattern | [data/accordion.md](data/accordion.md) |
| **Section** | основная карточка Career | `Common/Layout/BaseSection` | 1 | 1 | 12 / 3 | `base-section` | да | [data/section.md](data/section.md) |
| **SocialIcon** | иконки внешних сервисов | `Icons/SocialIcon` | 2 | 2 | 2 / 0 | _утилиты_ | да | [data/social-icon.md](data/social-icon.md) |
| **Icon** | отдельная inline SVG-иконка; `SpriteIcon` — legacy alias | `Icons/SpriteIcon` | 2 | 2 | 2 / 0 | `icon-inline` `icon-image` | да | [data/sprite-icon.md](data/sprite-icon.md) |


## Формы

| Компонент | Назначение | Storybook | Story | Разметка | Props / слоты | CSS | Живой | Спецификация |
|---|---|---|---|---|---|---|---|---|
| **Checkbox** | флажок | `Form/BaseCheckbox` | 1 | 1 | 11 / 1 | `base-checkbox` | да | [forms/checkbox.md](forms/checkbox.md) |
| **Calendar** | календарная сетка выбора даты | — | 0 | 0 | normative API | `calendar` | да, UI kit pattern | [forms/calendar.md](forms/calendar.md) |
| **CustomSelect** | select-only combobox | `Form/BaseCustomSelect` | 3 | 3 | 8 / 3 | `custom-select` `base-custom-select-button` | да, UI kit pattern | [forms/custom-select.md](forms/custom-select.md) |
| **DatePicker** | поле и календарь выбора даты | — | 0 | 0 | normative API | `date-picker` | да, UI kit pattern | [forms/date-picker.md](forms/date-picker.md) |
| **Dropzone** | drag-and-drop trigger загрузки | — | 0 | 0 | normative API | `dropzone` | да, UI kit pattern | [forms/dropzone.md](forms/dropzone.md) |
| **FileUpload** | выбор и очередь загрузки файлов | — | 0 | 0 | normative API | `file-upload` | да, UI kit pattern | [forms/file-upload.md](forms/file-upload.md) |
| **InputLabel** | метка, обязательность, подпись, ошибка | `Common/Form/BaseInputLabel` | 8 | 8 | 12 / 2 | `base-input-label` | да | [forms/input-label.md](forms/input-label.md) |
| **MultiSelect** | editable combobox с множественным выбором | `Form/MultiSelect` | 3 | 3 | 19 / 2 | `multi-select` `suggestions-picker` | да, UI kit pattern | [forms/multi-select.md](forms/multi-select.md) |
| **RadioButton** | переключатель | `Form/BaseRadioButton` | 1 | 1 | 6 / 1 | `base-radio-button` | да | [forms/radio-button.md](forms/radio-button.md) |
| **Select** | нативный список | `Form/BaseSelect` | 2 | 2 | 5 / 0 | `base-select` | да | [forms/select.md](forms/select.md) |
| **StarRating** | оценка звёздами | `Form/StarRating` | 4 | 4 | 7 / 0 | `star-rating` | да | [forms/star-rating.md](forms/star-rating.md) |
| **Switch** | тумблер | `Form/BaseSwitch` | 1 | 1 | 7 / 2 | `base-switch` | да | [forms/switch.md](forms/switch.md) |
| **Textarea** | многострочное поле с автовысотой | `Form/BaseTextarea` | 4 | 4 | 12 / 1 | `base-textarea` `text-length` | да | [forms/textarea.md](forms/textarea.md) |
| **TextInput** | однострочное поле | `Form/TextInput` | 4 | 4 | 12 / 3 | `text-input` | да | [forms/text-input.md](forms/text-input.md) |
| **TimePicker** | поле и список выбора времени | — | 0 | 0 | normative API | `time-picker` | да, UI kit pattern | [forms/time-picker.md](forms/time-picker.md) |

## Компоненты без собственных story

Существуют в CSS Career и видны внутри других компонентов, но отдельных записей
в Storybook не имеют. `StepsSidebar` делит запись с `CompanyRatingStepsSidebar`:
один и тот же блок описан с двух сторон — как навигация и как карточка.

| Компонент | Назначение | Категория | CSS | Спецификация |
|---|---|---|---|---|
| **TextLength** | счётчик символов | Формы | `text-length` | [forms/text-length.md](forms/text-length.md) |
| **Dropdown** | обвязка выпадающего блока | Навигация | `base-dropdown` | [navigation/dropdown.md](navigation/dropdown.md) |
| **StepsSidebar** | шаги многоэтапной формы | Навигация | `steps-sidebar` | [navigation/steps-sidebar.md](navigation/steps-sidebar.md) |
| **Row** | строка списка внутри карточки | Отображение данных | `base-row` | [data/row.md](data/row.md) |
| **Avatar** | аватар пользователя и компании | Отображение данных | `base-avatar` `user-avatar` | [data/avatar.md](data/avatar.md) |
| **InlineSeparator** | точка между фрагментами метаданных | Отображение данных | `inline-separator` | [data/inline-separator.md](data/inline-separator.md) |
| **CollapsedContent** | свёрнутый длинный текст | Отображение данных | `collapsed-content` | [data/collapsed-content.md](data/collapsed-content.md) |
| **PrettyScroll** | оформленная прокрутка | Отображение данных | `pretty-scroll` | [data/pretty-scroll.md](data/pretty-scroll.md) |
| **Content** | оформление произвольного HTML | Отображение данных | `editor__content` | [data/content.md](data/content.md) |
| **Loader** | круговой индикатор | Обратная связь | `base-loader` | [feedback/loader.md](feedback/loader.md) |
| **TransitionFade** | переход появления | Обратная связь | `transition-fade` | [feedback/transition-fade.md](feedback/transition-fade.md) |
| **BoosterGradientWrapper** | градиентная рамка платных возможностей | Обратная связь | `booster-gradient-wrapper` | [feedback/booster-gradient.md](feedback/booster-gradient.md) |
| **DropdownModal** | выпадающий блок как окно на телефоне | Оверлеи | `dropdown-modal` | [overlays/dropdown-modal.md](overlays/dropdown-modal.md) |

---

## Две системы имён

Career живёт в двух реализациях сразу, и это отражено в спецификациях.

**Новая (Nuxt, `career-web`)** — имена вида `base-button`, `checkbox-label`,
`notification`, `text-input__input`. Именно её CSS лежит в `ui/components/`.

**Старая (Rails, production)** — имена вида `basic-section`, `checkbox__wrapper`,
`checkbox__box`. Её решения собраны в `ui/components.css` и помечены источником.

Оба набора действующие: страницы Career переписываются постепенно.
Где имена расходятся, спецификация говорит об этом прямо — например,
[`forms/checkbox.md`](forms/checkbox.md).

Отдельно стоит помнить: **имя компонента в Storybook и имя класса в разметке
не всегда совпадают.** `BaseNotification` рендерит `.notification`,
`BaseIconButton` — `.icon-button`, `BasePaginationButton` — `.pagination-button`.

---

---

## Разметка Career смешанная

Career верстает BEM-классами и утилитами Tailwind **одновременно**,
в одном атрибуте `class`:

```html
<button class="base-button inline-flex appearance-main-border size-l has-before is-sizeable">
```

Здесь `base-button`, `appearance-main-border`, `size-l`, `has-before`,
`is-sizeable` — компонентные классы, `inline-flex` — утилита.

Это не небрежность, а устройство системы, и переносить разметку нужно целиком.
Нужные утилиты лежат в [`../ui/utilities.css`](../ui/utilities.css) —
549 правил, ровно те, что встречаются в разметке Career.

Часть компонентов не имеет собственного CSS вообще: `StatusChip`,
`SegmentedTabs`, `InnerProjectBanner` и ещё десяток собраны утилитами целиком.
В их спецификациях так и написано.

---

---

## Провенанс

Каждая спецификация заканчивается разделом «Источники»: id story Storybook,
секции CSS, при наличии — узлы Figma и страницы production. Это нужно, чтобы
любое утверждение можно было проверить, но в самой витрине провенанс не показан:
`showcase/components.html` показывает решение, а не его происхождение.

Первоисточник — `_sources/career/` — архивный. Пакет от него не зависит:
см. проверку на удаление в [`../evidence/coverage.md`](../evidence/coverage.md).
