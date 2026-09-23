export type CoursesComponentStatus = 'complete' | 'in-progress'
export type CoursesComponentKind = 'primitive' | 'component' | 'module'

export interface CoursesRegistryEntry {
  id: string
  name: string
  category: string
  kind: CoursesComponentKind
  status: CoursesComponentStatus
  states: string[]
  props?: Record<string, unknown>
  label?: string
}

const entry = (
  id: string,
  name: string,
  category: string,
  kind: CoursesComponentKind,
  status: CoursesComponentStatus,
  states: string[],
  props: Record<string, unknown> = {},
  label?: string
): CoursesRegistryEntry => ({
  id,
  name,
  category,
  kind,
  status,
  states,
  props,
  label
})

export const coursesRegistry: CoursesRegistryEntry[] = [
  entry('button', 'Button', 'actions', 'component', 'complete', ['main', 'secondary', 'danger', 'danger-outline', 'success', 'success-outline', 'brand', 'compact', 'hover', 'focus-visible', 'pressed', 'disabled', 'loading'], {}, 'Кнопка'),
  entry('icon-button', 'IconButton', 'actions', 'component', 'complete', ['default', 'ghost', 'ghost-no-background', 'muted', 'hover', 'focus-visible', 'pressed', 'disabled', 'loading'], { label: 'Настройки', icon: 'i-tabler-settings' }),
  entry('avatar-stack', 'AvatarStack', 'collections', 'component', 'complete', ['default'], { items: [{ name: 'Анна' }, { name: 'Иван' }, { name: 'Мария' }, { name: 'Олег' }, { name: 'Елена' }] }),
  entry('carousel', 'Carousel', 'collections', 'module', 'complete', ['default', 'current']),
  entry('link-grid', 'LinkGrid', 'collections', 'module', 'complete', ['default', 'expanded', 'collapsed'], { items: [{ label: 'Разработка', description: '420 курсов' }, { label: 'Дизайн', description: '180 курсов' }] }),
  entry('rating-table', 'RatingTable', 'collections', 'module', 'complete', ['default', 'hover', 'focus-visible'], { rows: [
    { position: 1, name: 'Digital Skills Academy', rating: 5, courses: 25, reviews: 10 },
    { position: 2, name: 'АБИУС', rating: 5, courses: 278, reviews: 36, partner: true },
    { position: 3, name: 'Академия EDPRO', rating: 5, courses: 17, reviews: 57 },
    { position: 4, name: 'Академия Эдюсон', rating: 5, courses: 239, reviews: 200, partner: true },
    { position: 5, name: 'Король Говорит', rating: 5, courses: 2, reviews: 22 },
    { position: 6, name: 'МИТУ', rating: 5, courses: 150, reviews: 47, partner: true },
    { position: 7, name: 'Учебный центр МГУТУ', rating: 5, courses: 54, reviews: 31, partner: true },
    { position: 8, name: 'Хекслет', rating: 4.98, courses: 24, reviews: 55 },
    { position: 9, name: 'Институт профессиональных квалификаций', rating: 4.98, courses: 172, reviews: 67, partner: true },
    { position: 10, name: 'Институт бизнес-аналитики', rating: 4.96, courses: 19, reviews: 34, partner: true }
  ] }),
  entry('avatar', 'Avatar', 'data-display', 'primitive', 'complete', ['default', 'empty'], { name: 'Анна Петрова' }),
  entry('chip', 'Chip', 'data-display', 'primitive', 'complete', ['size-s', 'size-m', 'counter', 'removable', 'partner'], {}, 'Python'),
  entry('demand-chart', 'DemandChart', 'data-display', 'component', 'complete', ['default']),
  entry('entity-logo', 'EntityLogo', 'data-display', 'primitive', 'complete', ['default', 'empty'], { label: 'Skillbox' }),
  entry('faq-block', 'FaqBlock', 'data-display', 'module', 'complete', ['default'], { title: 'Часто задаваемые вопросы' }),
  entry('faq-item', 'FaqItem', 'data-display', 'module', 'complete', ['default', 'hover', 'focus-visible', 'expanded', 'collapsed'], { question: 'Как проходит обучение?', open: true }, 'Занятия проходят онлайн, материалы остаются доступны после окончания курса.'),
  entry('info-table', 'InfoTable', 'data-display', 'module', 'complete', ['default'], { rows: [{ label: 'Формат', value: 'Онлайн' }, { label: 'Длительность', value: '8 месяцев' }] }),
  entry('learning-step', 'LearningStep', 'data-display', 'module', 'complete', ['default', 'hover', 'focus-visible', 'expanded', 'collapsed'], { number: 1, title: 'Основы профессии', duration: '4 недели', open: true }, 'Знакомство с инструментами и первая практическая работа.'),
  entry('prose', 'Prose', 'data-display', 'component', 'complete', ['default'], {}, 'Хабр Курсы помогают сравнивать образовательные программы по понятным критериям.'),
  entry('rating-badge', 'RatingBadge', 'data-display', 'primitive', 'complete', ['summary-s', 'summary-m', 'stars'], { value: 4.9 }),
  entry('social-icon', 'SocialIcon', 'data-display', 'primitive', 'complete', ['default', 'hover', 'focus-visible'], { label: 'Telegram' }),
  entry('ad-card', 'AdCard', 'entities', 'module', 'complete', ['default', 'hover'], { title: 'Освойте новую профессию', description: 'Практический курс с поддержкой наставника' }),
  entry('article-card', 'ArticleCard', 'entities', 'module', 'complete', ['default', 'hover', 'focus-visible'], { title: 'Как выбрать онлайн-курс', description: 'Разбираем ключевые критерии выбора программы' }),
  entry('authors-block', 'AuthorsBlock', 'entities', 'module', 'complete', ['default'], { authors: [{ name: 'Анна Петрова', role: 'Автор', job: 'Менеджер продукта', bio: 'Эксперт в онлайн-образовании и автор образовательных программ. Помогает командам запускать и улучшать продукты, которыми удобно пользоваться студентам и преподавателям.', linkedin: '#', qualifications: ['Product owner', 'Практический опыт в EdTech'], expertise: ['Разработка и запуск продукта', 'Продуктовая аналитика', 'Образовательные программы'] }, { name: 'Иван Смирнов', role: 'Редактор', job: 'Редактор Хабра' }, { name: 'Елена Лучина', role: 'Аудитор', job: 'Старший аккаунт-менеджер' }] }),
  entry('course-card', 'CourseCard', 'entities', 'module', 'complete', ['default', 'hover', 'focus-visible'], { title: 'Frontend-разработчик', description: 'От основ HTML до современных Vue-приложений' }),
  entry('entity-header', 'EntityHeader', 'entities', 'module', 'complete', ['default'], { title: 'Яндекс Практикум', description: 'Яндекс Практикум — сервис онлайн-образования, где учат на практике цифровым профессиям и навыкам. Обучение проходит в интерактивном тренажёре, а наставники и ревьюеры дают обратную связь и помогают на протяжении всего образовательного процесса.' }),
  entry('numbered-course-item', 'NumberedCourseItem', 'entities', 'module', 'complete', ['default'], { number: 1, title: 'Python-разработчик', school: 'Хекслет' }),
  entry('person-card', 'PersonCard', 'entities', 'module', 'complete', ['default', 'hover', 'focus-visible'], { name: 'Александр Ульяницкий', role: 'Senior QA Engineer', description: 'Ведущий инженер-тестировщик (Senior QA / QA Automation Engineer) с глубокой экспертизой в автоматизации и ручном тестировании сложных корпоративных систем. Специализируется на создании стабильных тестовых фреймворков с нуля, оптимизации процессов обеспечения качества и развитии инженерной культуры в команде.' }),
  entry('person-header', 'PersonHeader', 'entities', 'module', 'complete', ['default', 'social-link'], { name: 'Анна Петрова', role: 'Автор и эксперт', bio: 'Помогает выбирать качественные образовательные программы.', linkedin: '#' }),
  entry('profession-card', 'ProfessionCard', 'entities', 'module', 'complete', ['default'], { title: 'Data Scientist', salary: 'от 180 000 ₽' }),
  entry('profile-history', 'ProfileHistory', 'entities', 'module', 'complete', ['default'], { employment: [{ date: '2024 — сейчас', title: 'Редактор Хабр Курсов', description: 'Исследование образовательного рынка' }, { date: '2021 — 2024', title: 'Автор образовательных программ' }], education: [{ date: '2017 — 2021', title: 'Высшая школа экономики', description: 'Медиакоммуникации' }] }),
  entry('promo-card', 'PromoCard', 'entities', 'module', 'complete', ['default', 'hover'], { title: 'Скидка 20% на обучение', description: 'Для новых студентов' }),
  entry('review-card', 'ReviewCard', 'entities', 'module', 'complete', ['default', 'hover'], { author: 'Кристина Савельева', text: 'До курса я знала Авито только как обычный пользователь и вообще не понимала, чем конкретно занимается Авитолог. Хотелось освоить удаленную профессию, поэтому решила попробовать. Обучение понравилось тем, что здесь не просто показывают, куда нажимать в кабинете. Разбирают анализ ниши и конкурентов, объявления, фотографии, продвижение, статистику и работу с клиентами.' }),
  entry('school-card', 'SchoolCard', 'entities', 'module', 'complete', ['default', 'hover', 'focus-visible'], { title: 'Нетология', description: 'Обучение современным digital-профессиям' }),
  entry('step-card', 'StepCard', 'entities', 'module', 'complete', ['default'], { number: 1, title: 'Выберите программу', description: 'Сравните содержание, стоимость и отзывы' }),
  entry('vacancy-card', 'VacancyCard', 'entities', 'module', 'complete', ['default'], { title: 'Frontend-разработчик', company: 'Технологическая компания' }),
  entry('empty-state', 'EmptyState', 'feedback', 'module', 'complete', ['default']),
  entry('informer', 'Informer', 'feedback', 'component', 'complete', ['info', 'success', 'warning', 'error', 'closable', 'with-links'], { title: 'Информация', description: 'Описание важного сообщения для пользователя.' }),
  entry('loader', 'Loader', 'feedback', 'component', 'complete', ['default']),
  entry('toast', 'Toast', 'feedback', 'component', 'complete', ['info', 'success', 'warning', 'error', 'closable'], { text: 'Сообщение' }),
  entry('checkbox', 'Checkbox', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'checked', 'indeterminate', 'disabled'], { label: 'С сертификатом', description: 'Выдаётся после обучения' }),
  entry('feedback-form', 'FeedbackForm', 'forms', 'module', 'complete', ['default', 'telegram', 'phone', 'success']),
  entry('filter-chip', 'FilterChip', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'pressed', 'selected'], { count: 24 }, 'Программирование'),
  entry('multi-select', 'MultiSelect', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'checked', 'open', 'closed', 'disabled', 'invalid'], { label: 'Навыки', options: [{ label: 'JavaScript', value: 'js' }, { label: 'Vue', value: 'vue' }] }),
  entry('option-item', 'OptionItem', 'forms', 'primitive', 'complete', ['default', 'hover', 'focus-visible', 'selected', 'disabled'], { label: 'Разработка', value: 'development', selected: true }),
  entry('option-list', 'OptionList', 'forms', 'component', 'complete', ['single', 'multiple', 'action'], { items: [{ label: 'Разработка', value: 'development' }, { label: 'Дизайн', value: 'design' }, { label: 'Аналитика', value: 'analytics' }], modelValue: 'development' }),
  entry('radio-button', 'RadioButton', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'checked', 'disabled', 'loading'], { label: 'Онлайн', value: 'online' }),
  entry('search-form', 'SearchForm', 'forms', 'module', 'complete', ['default']),
  entry('search-input', 'SearchInput', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'disabled']),
  entry('select', 'Select', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'open', 'closed', 'disabled', 'invalid'], { label: 'Направление', options: [{ label: 'Разработка', value: 'dev' }, { label: 'Дизайн', value: 'design' }] }),
  entry('switch', 'Switch', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'checked', 'disabled'], { label: 'Только со скидкой' }),
  entry('text-input', 'TextInput', 'forms', 'component', 'complete', ['default', 'leading-icon', 'trailing-icon', 'both-icons', 'hover', 'focus-visible', 'disabled', 'readOnly', 'invalid'], { label: 'Название', placeholder: 'Введите значение', hint: 'Необязательное поле' }),
  entry('textarea', 'Textarea', 'forms', 'component', 'complete', ['default', 'hover', 'focus-visible', 'disabled', 'readOnly', 'invalid'], { label: 'Комментарий', placeholder: 'Введите текст' }),
  entry('tile-filter', 'TileFilter', 'forms', 'component', 'complete', ['image-contain', 'image-cover', 'level', 'catalog-action', 'catalog-link', 'hover', 'focus-visible', 'pressed', 'selected', 'disabled'], { title: 'Разработка', description: '420 курсов' }),
  entry('page-hero', 'PageHero', 'frame-modules', 'module', 'complete', ['default'], { title: 'Онлайн-курсы', description: 'Сравнивайте программы и выбирайте подходящее обучение' }),
  entry('site-footer', 'SiteFooter', 'frame-modules', 'module', 'complete', ['default']),
  entry('site-header', 'SiteHeader', 'frame-modules', 'module', 'complete', ['listing-hero', 'listing-page', 'listing-page-sticky', 'courses-hero', 'courses-page', 'courses-page-sticky', 'simple-page']),
  entry('ad-slot', 'AdSlot', 'layout', 'module', 'complete', ['default']),
  entry('card-grid', 'CardGrid', 'layout', 'module', 'complete', ['default', 'empty']),
  entry('section', 'Section', 'layout', 'module', 'complete', ['default'], { title: 'Популярные курсы', description: 'Программы с высоким рейтингом' }),
  entry('breadcrumbs', 'Breadcrumbs', 'navigation', 'component', 'complete', ['default', 'hover', 'focus-visible', 'current'], { items: [{ label: 'Главная', href: '#' }, { label: 'Курсы', href: '#' }, { label: 'Разработка' }] }),
  entry('button-group', 'ButtonGroup', 'navigation', 'component', 'complete', ['light', 'hero', 'compact', 'block', 'hover', 'focus-visible', 'selected']),
  entry('filter-bar', 'FilterBar', 'navigation', 'module', 'complete', ['default']),
  entry('link', 'Link', 'navigation', 'primitive', 'complete', ['default', 'hover', 'focus-visible'], { external: true }, 'Открыть программу'),
  entry('page-toc', 'PageToc', 'navigation', 'component', 'complete', ['default', 'hover', 'focus-visible'], { items: [{ label: 'О профессии', href: '#about' }, { label: 'Программа', href: '#program' }, { label: 'Отзывы', href: '#reviews' }] }),
  entry('pagination', 'Pagination', 'navigation', 'component', 'complete', ['default', 'hover', 'focus-visible', 'current', 'disabled'], { total: 5 }),
  entry('catalog-menu', 'CatalogMenu', 'overlays', 'module', 'complete', ['default', 'open', 'closed', 'adult', 'child']),
  entry('filter-modal', 'FilterModal', 'overlays', 'module', 'complete', ['default', 'open', 'closed']),
  entry('header-dropdown', 'HeaderDropdown', 'overlays', 'module', 'complete', ['default', 'hover', 'focus-visible', 'open', 'closed'], { label: 'Все сервисы' }),
  entry('mobile-menu', 'MobileMenu', 'overlays', 'module', 'complete', ['default', 'open', 'closed']),
  entry('modal', 'Modal', 'overlays', 'module', 'complete', ['default', 'open', 'closed', 'scroll'], { title: 'Информация' }),
  entry('price-sheet', 'PriceSheet', 'overlays', 'module', 'complete', ['default', 'open', 'closed']),
  entry('promo-code-modal', 'PromoCodeModal', 'overlays', 'module', 'complete', ['default', 'open', 'closed']),
  entry('sort-sheet', 'SortSheet', 'overlays', 'module', 'complete', ['default', 'open', 'closed']),
  entry('tooltip', 'Tooltip', 'overlays', 'component', 'complete', ['default', 'open', 'closed'], { text: 'Подсказка к элементу' }, 'Наведите на текст')
]

export const coursesCategories = [
  'actions', 'forms', 'navigation', 'data-display', 'entities',
  'feedback', 'collections', 'layout', 'frame-modules', 'overlays'
] as const
