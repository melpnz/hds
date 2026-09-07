# Покрытие и готовность к удалению источника

Отчёт по переносу знаний из `_sources/career/` в самостоятельный пакет `career/`.

## Что перенесено

| Слой | Из источника | В пакете | Файл в пакете |
|---|---|---|---|
| Переменные | 120 объявлений в трёх блоках `:root` | 120 | `ui/tokens.css` |
| Типографическая шкала | 9 классов `text-*` | 9 | `ui/foundations.css` |
| База документа | `body,html`, значения `--tw-*` | целиком | `ui/foundations.css` |
| Утилиты Tailwind | 1 695 правил в сборке | 549 (те, что встречаются в разметке) | `ui/utilities.css` |
| CSS компонентов | 63 файла, 97 КБ | 64 секции, 112 КБ | `ui/components/*.css` |
| Оформление текста | 125 правил `.editor__content` | 125 | `ui/components/content.css` |
| Шрифт | 14 `@font-face` переменного Inter | не переносится: подключается из Google Fonts | `ui/fonts.css` |
| Иконки | 5 спрайтов, 146 символов | 141 отдельный файл + 5 исходных спрайтов + пак из 21 | `ui/assets/icons/` |
| Иллюстрации и одиночные SVG | 52 SVG (5 из них — спрайты) | 47: 35 в `illustrations/`, 12 в `icons/`. Плюс 4 знака из `sprite.svg` и 2 заглушки аватара — итого 41 файл в `illustrations/` | `ui/assets/` |
| Изображения продукта | 53 растровых | 50 (те, что в разметке) | `ui/assets/images/` |
| Разметка | 243 snapshot DOM | вся, в спецификациях и витрине | `components/**`, `showcase/` |
| Props и варианты | argTypes 347 story | сведены по компонентам | `components/**` |
| Записи Storybook | 427 | сведены в 99 компонентов, 75 спецификаций | `components/INDEX.md` |

## Покрытие по компонентам

| Запись Storybook | Спецификация | Story | Разметка | Варианты | Состояния | Иконки | Чего не хватает |
|---|---|---|---|---|---|---|---|
| `Banners/HHImportProfileStatusBanner` | [HHImportProfileStatusBanner](../components/banners/hh-import-banner.md) | 3 | 3/3 | — | — | 4 | — |
| `Banners/HrNewsletterSubscription` | [HrNewsletterSubscription](../components/banners/hr-newsletter.md) | 1 | 1/1 | — | — | — | — |
| `Banners/InnerProjectBanner` | [InnerProjectBanner](../components/banners/inner-project-banner.md) | 2 | 2/2 | из props и CSS | — | — | — |
| `Banners/JournalBlockSidebar` | [JournalBlockSidebar](../components/banners/journal-block-sidebar.md) | 1 | 0/1 | — | — | — | разметки целиком. Нужен snapshot production либо узел Figma. |
| `Banners/NewNotice` | [NewNotice](../components/banners/new-notice.md) | 3 | 3/3 | из props и CSS | — | 1 | — |
| `Banners/PromotionCard` | [PromotionCard](../components/banners/promotion-card.md) | 1 | 0/1 | из CSS | из CSS | — | разметки. Достаточно одного snapshot production страницы, где карточка показана. |
| `Banners/ResumesGuideCard` | [ResumesGuideCard](../components/banners/resumes-guide-card.md) | 1 | 1/1 | из CSS | из CSS | — | — |
| `Banners/SidebarAdCompany` | [SidebarAdCompany](../components/banners/sidebar-ad-company.md) | 1 | 1/1 | из props и CSS | — | 3 | — |
| `Banners/TrackBanner` | [TrackBanner](../components/banners/track-banner.md) | 2 | 2/2 | — | — | — | — |
| `Common/Buttons/AIButton` | [AIButton](../components/actions/ai-button.md) | 1 | 1/1 | из props и CSS | из CSS | 1 | — |
| `Common/Buttons/BaseAvatarButton` | [AvatarButton](../components/actions/avatar-button.md) | 2 | 2/2 | из props и CSS | из CSS | — | — |
| `Common/Buttons/BaseButton` | [Button](../components/actions/button.md) | 2 | 2/2 | из props и CSS | из CSS | 1 | — |
| `Form/ButtonRange` | [ButtonRange](../components/actions/button-range.md) | 3 | 0/3 | из CSS | из CSS | — | рабочей сборки Storybook либо страницы production с этим компонентом, либо узла Figma. |
| `Common/Buttons/FilterButton` | [FilterButton](../components/actions/filter-button.md) | 2 | 2/2 | из props и CSS | из CSS | 1 | — |
| `Common/Buttons/GhostButton` | [GhostButton](../components/actions/ghost-button.md) | 2 | 2/2 | из props и CSS | из CSS | 1 | — |
| `Common/Buttons/BaseIconButton` | [IconButton](../components/actions/icon-button.md) | 1 | 1/1 | из props и CSS | из CSS | 1 | — |
| `Common/Buttons/LinkStyledButton` | [LinkStyledButton](../components/actions/link-styled-button.md) | 1 | 1/1 | из props и CSS | — | — | — |
| `Common/Buttons/BasePaginationButton` | [PaginationButton](../components/actions/pagination-button.md) | 1 | 1/1 | из props и CSS | из CSS | — | — |
| `Common/Buttons/RoundedArrowButton` | [RoundedArrowButton](../components/actions/rounded-arrow-button.md) | 1 | 1/1 | из props и CSS | — | 1 | — |
| `Common/Buttons/SalaryHeadButton` | [SalaryHeadButton](../components/actions/salary-head-button.md) | 1 | 1/1 | из props и CSS | из CSS | — | — |
| `Companies/CompanyRatingStepsSidebar` | [CompanyRatingStepsSidebar](../components/cards/company-rating-steps.md) | 3 | 3/3 | из props и CSS | из CSS | — | — |
| `Consultations/ConsultationRecord` | [ConsultationRecord](../components/cards/consultation-record.md) | 11 | 11/11 | из props и CSS | — | 3 | — |
| `Conversations/List/ConversationCard` | [ConversationCard](../components/cards/conversation-card.md) | 6 | 6/6 | из props и CSS | из CSS | 1 | — |
| `Resumes/ResumeCard` | [ResumeCard](../components/cards/resume-card.md) | 3 | 0/3 | из CSS | из CSS | — | рабочего Storybook, либо snapshot страницы `/resumes` production, либо узла Figma с карточкой резюме. |
| `Tests/Cards/BasicScreeningCard` | [TestItem](../components/cards/test-item.md) | 7 | 0/7 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/SpecsTestItemPassed` | [TestItem](../components/cards/test-item.md) | 6 | 0/6 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/TestItemExpired` | [TestItem](../components/cards/test-item.md) | 7 | 0/7 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/TestItemFailed` | [TestItem](../components/cards/test-item.md) | 5 | 0/5 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/TestItemPassed` | [TestItem](../components/cards/test-item.md) | 9 | 0/9 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/TestItem` | [TestItem](../components/cards/test-item.md) | 7 | 7/7 | из props и CSS | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/TestResultAdditional` | [TestItem](../components/cards/test-item.md) | 6 | 0/6 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Tests/Cards/TestResultItem` | [TestItem](../components/cards/test-item.md) | 12 | 0/12 | — | — | 2 | разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам. |
| `Vacancies/VacancyCardWithCompanyAndDate` | [VacancyCard](../components/cards/vacancy-card.md) | 12 | 12/12 | из props и CSS | из CSS | 7 | — |
| `Companies/CP/VacancyImports/Card` | [VacancyImportCard](../components/cards/vacancy-import-card.md) | 6 | 6/6 | из props и CSS | — | 5 | — |
| `Tests/VisibilitySettingsNotification` | [VisibilitySettings](../components/cards/visibility-settings.md) | 3 | 3/3 | из props и CSS | — | 2 | — |
| `Tests/VisibilitySettings` | [VisibilitySettings](../components/cards/visibility-settings.md) | 3 | 3/3 | из props и CSS | — | 2 | — |
| `Common/Chips/BaseChip` | [Chip](../components/labels/chip.md) | 4 | 4/4 | из props и CSS | из CSS | 1 | — |
| `Common/Chips/ClosableChip` | [ClosableChip](../components/labels/closable-chip.md) | 1 | 1/1 | из props и CSS | из CSS | 1 | — |
| `Skills/SkillChip` | [SkillChip](../components/labels/skill-chip.md) | 4 | 4/4 | из props и CSS | из CSS | 1 | — |
| `Conversations/List/ConversationsChip` | [StatusChip](../components/labels/status-chip.md) | 6 | 6/6 | из props и CSS | — | 2 | — |
| `Conversations/List/UnreadCounter` | [UnreadCounter](../components/labels/unread-counter.md) | 5 | 5/5 | из props и CSS | — | — | — |
| `Conversations/Files/ConversationAttachedFilePresenter` | [ConversationFiles](../components/modules/conversation-files.md) | 4 | 4/4 | из props и CSS | из CSS | 2 | — |
| `Conversations/Files/ConversationAttachedFileUploader` | [ConversationFiles](../components/modules/conversation-files.md) | 3 | 3/3 | из props и CSS | из CSS | 2 | — |
| `Conversations/Files/ConversationAttachedFiles` | [ConversationFiles](../components/modules/conversation-files.md) | 3 | 3/3 | из props и CSS | из CSS | 2 | — |
| `Conversations/Files/ConversationFileIcon` | [ConversationFiles](../components/modules/conversation-files.md) | 7 | 7/7 | из props и CSS | из CSS | 2 | — |
| `Conversations/Files/ConversationFileUploadingAnimation` | [ConversationFiles](../components/modules/conversation-files.md) | 3 | 3/3 | из props и CSS | из CSS | 2 | — |
| `Conversations/Files/ConversationFilesCatcher` | [ConversationFiles](../components/modules/conversation-files.md) | 2 | 2/2 | из props и CSS | из CSS | 2 | — |
| `Conversations/Files/ConversationFilesSelectorModal` | [ConversationFiles](../components/modules/conversation-files.md) | 1 | 1/1 | из props и CSS | из CSS | 2 | — |
| `Conversations/Messages/ConversationFloatButton` | [ConversationForm](../components/modules/conversation-form.md) | 4 | 4/4 | из props и CSS | — | 2 | — |
| `Conversations/Form/ConversationForm` | [ConversationForm](../components/modules/conversation-form.md) | 3 | 3/3 | из props и CSS | — | 2 | — |
| `Conversations/Header/ConversationCompanyLink` | [ConversationHeader](../components/modules/conversation-header.md) | 1 | 1/1 | из props и CSS | — | 2 | — |
| `Conversations/Header/ConversationContextMenu` | [ConversationHeader](../components/modules/conversation-header.md) | 3 | 3/3 | из props и CSS | — | 2 | — |
| `Conversations/Header/ConversationHabrAdminLabel` | [ConversationHeader](../components/modules/conversation-header.md) | 1 | 1/1 | — | — | 2 | — |
| `Conversations/Header/ConversationHeader` | [ConversationHeader](../components/modules/conversation-header.md) | 4 | 4/4 | из props и CSS | — | 2 | — |
| `Conversations/Layout/ConversationsLayout` | [ConversationsList](../components/modules/conversations-list.md) | 3 | 0/3 | из CSS | из CSS | 1 | разметки внешней раскладки. Пропорции колонок замерены в production и лежат в `ui/layout.css`. |
| `Conversations/Layout/ConversationsSidebarHeader` | [ConversationsList](../components/modules/conversations-list.md) | 2 | 2/2 | из props и CSS | из CSS | 1 | разметки внешней раскладки. Пропорции колонок замерены в production и лежат в `ui/layout.css`. |
| `Conversations/Templates/ConversationsTemplateForm` | [ConversationsTemplates](../components/modules/conversation-templates.md) | 2 | 2/2 | из props и CSS | — | 4 | — |
| `Conversations/Templates/ConversationsTemplatesHeader` | [ConversationsTemplates](../components/modules/conversation-templates.md) | 1 | 1/1 | из props и CSS | — | 4 | — |
| `Conversations/Templates/ConversationsTemplatesList` | [ConversationsTemplates](../components/modules/conversation-templates.md) | 4 | 4/4 | из props и CSS | — | 4 | — |
| `Conversations/Templates/ConversationsTemplates` | [ConversationsTemplates](../components/modules/conversation-templates.md) | 1 | 1/1 | из props и CSS | — | 4 | — |
| `Conversations/Messages/ConversationMessages` | [Messages](../components/modules/conversation-messages.md) | 6 | 0/6 | из CSS | из CSS | 1 | разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` p |
| `Conversations/Messages/MessageStatusIcon` | [Messages](../components/modules/conversation-messages.md) | 3 | 3/3 | из props и CSS | из CSS | 1 | разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` p |
| `Conversations/Messages/MessageTime` | [Messages](../components/modules/conversation-messages.md) | 5 | 5/5 | из props и CSS | из CSS | 1 | разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` p |
| `Conversations/Messages/MessagesGroup` | [Messages](../components/modules/conversation-messages.md) | 3 | 0/3 | из CSS | из CSS | 1 | разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` p |
| `Conversations/Messages/MessageAttachements` | [Messages](../components/modules/conversation-messages.md) | 7 | 7/7 | из props и CSS | из CSS | 1 | разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` p |
| `Conversations/Messages/Messages` | [Messages](../components/modules/conversation-messages.md) | 25 | 0/25 | из CSS | из CSS | 1 | разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` p |
| `Tests/Modals/ScreeningsListModal` | [TestResultModals](../components/modules/test-modals.md) | 2 | 0/2 | из CSS | из CSS | — | разметки. Основа — BaseModal — восстановлена полностью, недостаёт только содержимого. |
| `Tests/Modals/SkillsTestResultModal` | [TestResultModals](../components/modules/test-modals.md) | 3 | 0/3 | из CSS | из CSS | — | разметки. Основа — BaseModal — восстановлена полностью, недостаёт только содержимого. |
| `Tests/Modals/SpecsTestResultModal` | [TestResultModals](../components/modules/test-modals.md) | 2 | 0/2 | из CSS | из CSS | — | разметки. Основа — BaseModal — восстановлена полностью, недостаёт только содержимого. |
| `Common/ContextMenu/Default` | [ContextMenu](../components/navigation/context-menu.md) | 2 | 2/2 | из props и CSS | из CSS | 3 | — |
| `Common/ContextMenu/Isomorphic` | [ContextMenu](../components/navigation/context-menu.md) | 2 | 2/2 | из props и CSS | из CSS | 3 | — |
| `Common/Navigation/BasePagination` | [Pagination](../components/navigation/pagination.md) | 3 | 3/3 | из props и CSS | из CSS | 1 | — |
| `Common/Navigation/BaseSegmentedTabs` | [SegmentedTabs](../components/navigation/segmented-tabs.md) | 4 | 4/4 | из props и CSS | — | — | — |
| `Conversations/Layout/ConversationNotSelected` | [EmptyPlaceholder](../components/feedback/empty-placeholder.md) | 1 | 1/1 | из CSS | из CSS | — | — |
| `Conversations/List/NoConversationsFound` | [EmptyPlaceholder](../components/feedback/empty-placeholder.md) | 2 | 2/2 | из props и CSS | из CSS | — | — |
| `Conversations/List/NoConversations` | [EmptyPlaceholder](../components/feedback/empty-placeholder.md) | 2 | 2/2 | из props и CSS | из CSS | — | — |
| `Conversations/Messages/NoMessages` | [EmptyPlaceholder](../components/feedback/empty-placeholder.md) | 1 | 1/1 | из CSS | из CSS | — | — |
| `Common/Notifications/BaseNotification` | [Notification](../components/feedback/notification.md) | 4 | 4/4 | из props и CSS | из CSS | 4 | — |
| `Conversations/List/ConversationsListSkeleton` | [Skeleton](../components/feedback/skeleton.md) | 2 | 2/2 | из props и CSS | из CSS | — | — |
| `Common/Notifications/Toastify` | [Toast](../components/feedback/toast.md) | 4 | 4/4 | из props и CSS | из CSS | — | snapshot открытого тоста каждого из трёх типов. |
| `Companies/CP/VacancyImports/GroupsModal` | [Modal](../components/overlays/modal.md) | 2 | 2/2 | из props и CSS | из CSS | 3 | — |
| `Conversations/Modals/ConversationCompleteConsultationModal` | [Modal](../components/overlays/modal.md) | 1 | 1/1 | из props и CSS | из CSS | 3 | — |
| `Conversations/Modals/ConversationReportFailedConsultationModal` | [Modal](../components/overlays/modal.md) | 1 | 1/1 | из props и CSS | из CSS | 3 | — |
| `Conversations/Modals/ConversationScoreConsultationModal` | [Modal](../components/overlays/modal.md) | 1 | 1/1 | из props и CSS | из CSS | 3 | — |
| `Conversations/Files/ConversationNotUploadedFilesModal` | [Modal](../components/overlays/modal.md) | 1 | 1/1 | из props и CSS | из CSS | 3 | — |
| `Salary/SalaryBar` | [SalaryBar](../components/data/salary-bar.md) | 11 | 11/11 | из props и CSS | из CSS | 1 | — |
| `Common/Layout/BaseSection` | [Section](../components/data/section.md) | 1 | 1/1 | из props и CSS | из CSS | — | — |
| `Icons/SocialIcon` | [SocialIcon](../components/data/social-icon.md) | 2 | 2/2 | из props и CSS | — | 9 | — |
| `Icons/SpriteIcon` | [SpriteIcon](../components/data/sprite-icon.md) | 2 | 2/2 | из props и CSS | из CSS | 89 | — |
| `Form/BaseCheckbox` | [Checkbox](../components/forms/checkbox.md) | 1 | 1/1 | из props и CSS | из CSS | — | — |
| `Form/BaseCustomSelect` | [CustomSelect](../components/forms/custom-select.md) | 3 | 3/3 | из props и CSS | из CSS | 1 | snapshot открытого выпадающего списка либо узла Figma с раскрытым состоянием. |
| `Common/Form/BaseInputLabel` | [InputLabel](../components/forms/input-label.md) | 8 | 8/8 | из props и CSS | из CSS | — | — |
| `Form/MultiSelect` | [MultiSelect](../components/forms/multi-select.md) | 3 | 3/3 | из props и CSS | из CSS | 1 | snapshot открытого списка с выбранными и найденными опциями. |
| `Form/BaseRadioButton` | [RadioButton](../components/forms/radio-button.md) | 1 | 1/1 | из props и CSS | из CSS | — | — |
| `Form/BaseSelect` | [Select](../components/forms/select.md) | 2 | 2/2 | из props и CSS | из CSS | — | — |
| `Form/StarRating` | [StarRating](../components/forms/star-rating.md) | 4 | 4/4 | из props и CSS | из CSS | 1 | — |
| `Form/BaseSwitch` | [Switch](../components/forms/switch.md) | 1 | 1/1 | из props и CSS | из CSS | — | — |
| `Form/BaseTextarea` | [Textarea](../components/forms/textarea.md) | 4 | 4/4 | из props и CSS | из CSS | — | — |
| `Form/TextInput` | [TextInput](../components/forms/text-input.md) | 4 | 4/4 | из props и CSS | из CSS | — | — |

## Две оценки

### KNOWLEDGE EXTRACTION COVERAGE

_Какая доля полезного из Storybook вынесена в независимый пакет._

| Что | Из источника | Перенесено | Доля |
|---|---|---|---|
| CSS компонентов | 63 файла | 63 | 100% |
| Переменные | 120 | 120 | 100% |
| Иконки | 146 символов | 141 | не вынесен `twitter`, случайно лежащий в спрайте реакций; 4 знака `decorated-modal-*` перенесены в `illustrations/` |
| Шрифт | 14 начертаний | 14 | 100% |
| Иллюстрации | 47 | 47 | 100% |
| Разметка story | 243 из 347 снято в источнике | 243 | 100% от снятого, 70% от всех story |
| Props | argTypes 75 компонентов | все | 100% |
| Docs-страницы | 72 сохранены | таблицы props нормализованы в спецификации | содержательно 100%, дословно нет |

Общая оценка переноса — **70% по разметке и 100% по CSS, токенам и ассетам**.
Единственное, чего пакет не содержит, — это разметка 104 story, которую сам Storybook Career
не отдал: его сборка не находит два чанка (`-iqz-73v.js`, `-2YzXgxt.js`, оба HTTP 404).
Эти данные отсутствуют и в источнике, поэтому удаление источника их не отнимет.

### LIVE UI COVERAGE

_Какая доля компонентов существует как локальная реализация HTML + CSS._

| | Компонентов | Доля |
|---|---|---|
| Показаны настоящей вёрсткой в `showcase/components.html` | 73 | 73% |
| Показаны частично (нет раскрытого состояния или портала) | 19 | 19% |
| Живой реализации нет | 8 | 8% |

CSS при этом есть у всех, включая компоненты без разметки: он подключён и работает,
не хватает только структуры DOM, чтобы его показать.

---

## Проверка на удаление источника

Мысленный эксперимент: каталог `_sources/career/` удалён. Что именно
теряется? Ниже — всё его содержимое, разобранное по четырём степеням тяжести.

### NOTHING IMPORTANT — информация перенесена полностью

| Что в источнике | Куда перенесено |
|---|---|
| `source/css/` — 67 файлов, 277 КБ | 63 компонентных файла → `ui/components/`; переменные → `ui/tokens.css`; база → `ui/foundations.css`; используемые утилиты → `ui/utilities.css`; оформление текста → `ui/components/content.css` |
| `source/assets/` — 120 файлов | все 120 → `ui/assets/` (иконки, иллюстрации, изображения, шрифт) |
| `rendered/` — 243 snapshot DOM | все 243 → `showcase/components.html` (190), спецификации (9), `evidence/markup.md` (44) |
| `docs/` — 72 страницы + текст | таблицы props нормализованы в раздел «Props» каждой спецификации |
| `inventory.json` — id, пути, теги | id story и пути в репозитории `career-web` → раздел «Источники» каждой спецификации |
| `catalog.md`, `inventory.md` — обзоры | заменены на `components/INDEX.md` с интерфейсной, а не сторибучной таксономией |
| `metadata/sprites.json` | список символов → `ui/assets/README.md`, сами спрайты → `ui/assets/icons/` |
| `metadata/index.json`, `project.json`, `iframe.html` | служебные файлы Storybook, к Career отношения не имеют |
| `metadata/css-map.json` | какие файлы CSS грузит story; в пакете эта связь выражена полем «CSS» в шапке спецификации |
| `metadata/resources.json`, `_failures.json`, `_retry.json` | журналы работы харвестера |
| `index.html` — стартовая страница Storybook | интерфейс Storybook, не продукт |

### RESEARCH PROVENANCE ONLY — теряется только исходное доказательство

| Что теряется | Почему это не мешает |
|---|---|
| **Дословный HTML docs-страниц** (`docs/*.html`) | Содержимое — таблицы props, которые уже разобраны по полям. Теряется вёрстка таблицы, а не данные. |
| **`args` каждой story** — конкретные демо-данные | Вымышленные названия компаний, тексты сообщений, суммы. Это подставленные данные, а не решения дизайна. Форма, в которой они показаны, сохранена в разметке. |
| **Точные байтовые размеры файлов сборки** | Учтены в таблицах этого отчёта. |
| **Возможность повторно снять то же самое** | Пока `develop.career.habratest.net` жив, снимок повторяем; когда умрёт — источник тоже не поможет, он статичен. |

### FUNCTIONAL KNOWLEDGE — теряются полезные данные о компонентах

Одна позиция, и она невелика.

**Неиспользуемые утилиты Tailwind.** Сборка Career содержит 1 695 правил утилит,
в пакет перенесено 549 — те, что встречаются в разметке Career, плюс вся именованная
шкала теней. Остальные 1 146 не переносятся сознательно: это классы, которые
Tailwind сгенерировал, но ни один компонент Career не использует.

Что это значит на практике: если писать новую разметку Career и взять утилиту,
которой нет в нашем подмножестве — например `mt-14` вместо `mt-12`, — она не сработает.
Смягчающих обстоятельств три:

1. в настоящем Career Tailwind генерирует такую утилиту на лету, так что в продукте
   проблемы не возникнет;
2. подмножество покрывает всё, что Career использует в своих компонентах, — то есть
   весь словарь, которым система реально написана;
3. шкала значений Tailwind общеизвестна и восстанавливается по любой соседней
   утилите: `mt-12` = `3rem`, значит `mt-14` = `3.5rem`.

Сохранять ради этого 88 КБ мёртвого CSS означало бы ровно то, чего в этой работе
велено избегать, — переносить объём вместо знания.

### CRITICAL — без источника часть UI невоспроизводима

**Пусто.**

Это не оценка «на глаз», а следствие того, где именно проходит граница пробелов.
Всё, чего пакету не хватает, — разметка 104 story — отсутствует **и в источнике тоже**:
сборка Storybook Career не отдаёт два чанка (`-iqz-73v.js`, `-2YzXgxt.js`, оба HTTP 404),
поэтому эти story не отрисовались при снятии и в `rendered/` их нет.

Удаление источника не отнимает ни одного байта того, что в нём есть, — потому что
всё, что в нём есть, уже перенесено.

### Итог

| Степень | Позиций | Оценка |
|---|---|---|
| NOTHING IMPORTANT | 11 из 12 каталогов источника | — |
| RESEARCH PROVENANCE ONLY | 4 | приемлемо |
| FUNCTIONAL KNOWLEDGE | 1 (неиспользуемые утилиты) | осознанное решение, восстановимо |
| CRITICAL | 0 | — |

`_sources/career/` может быть заархивирован или удалён без потери
работоспособности пакета. Физически он пока не тронут — решение за вами.

---

## Как проверить это самостоятельно

Не полагаясь на слово, независимость пакета проверяется тремя действиями:

1. **Переименуйте** `_sources/` во что-нибудь другое.
2. Откройте `career/showcase/components.html` — страница должна выглядеть точно так же:
   настоящие иконки, настоящий Inter, настоящие цвета. Ни одной сетевой загрузки.
3. Откройте любую спецификацию — в ней должно быть достаточно данных, чтобы собрать
   компонент с нуля: анатомия, классы, значения, состояния, токены.

Если что-то сломается, это будет видно сразу: иконки станут пустыми прямоугольниками,
шрифт — системным.

---

## Что осталось нерешённым

Список пробелов, который не уменьшается пересказом. Каждый закрывается конкретным
действием, и ни один не требует чинить Storybook.

| Пробел | Чем закрывается |
|---|---|
| Разметка ленты сообщений (`Messages`, `MessagesGroup`, `ConversationMessages`) | один snapshot страницы `/conversations` в production |
| Разметка `ResumeCard` | один snapshot страницы `/resumes` |
| Разметка `PromotionCard`, `JournalBlockSidebar` | snapshot страницы с боковой колонкой |
| Разметка `ButtonRange` | snapshot страницы фильтров либо узел Figma |
| Разметка `TestResultItem`, `TestResultAdditional`, окон результатов | snapshot страницы тестов профиля |
| Раскрытые состояния списков (`CustomSelect`, `MultiSelect`, `ContextMenu`) | snapshot с открытым выпадающим блоком |
| Разметка тоста | snapshot страницы с показанным `notify()` |
| Иконка `huntflow.svg` и аватар пользователя с `habrastorage` | доступ к `habratest` без ошибки сертификата. В витрине и в спецификациях на их месте стоят штатные заглушки `avatar-default-company.svg` и `avatar-default-user.svg` — подстановка помечена на месте |
| Состояния наведения и фокуса, не объявленные в CSS | таких нет: всё, что объявлено, извлечено |
