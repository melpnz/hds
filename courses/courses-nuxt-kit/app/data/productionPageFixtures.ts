import { productionPeopleContacts } from './productionPeopleContacts'

export const fixtureCourses = [
  { title: 'Python-разработчик + ИИ', school: 'Академия Эдюсон', rating: 5, reviews: 2, duration: '9 месяцев', price: 'от 4 162 ₽/мес', originalPrice: 'или сразу 99 900 ₽', discount: '-60%', tags: ['Python', 'Django', '+26'], image: '/production-assets/9558ee89092139704c45.png', logo: '/production-assets/2c81915b3183d87131d3.png' },
  { title: '1C-программист: расширенный курс', school: 'Нетология', rating: 4.75, reviews: 6, duration: '18 месяцев', price: 'от 4 223 ₽/мес', originalPrice: 'или сразу 129 200 ₽', discount: '-50%', tags: ['1С разработка', 'Git', '+9'], image: '/production-assets/998c9c1377e8fb3054ef.png', logo: '/production-assets/750d7d3d0208f8d37f4f.png' },
  { title: 'Профессия DevOps-инженер + ИИ', school: 'ProductStar × РБК', rating: 5, reviews: 5, duration: '5 месяцев', price: 'от 1 941 ₽/мес', originalPrice: 'или сразу 55 890 ₽', discount: '-76%', tags: ['DevOps', 'Bash', '+18'], image: '/production-assets/310b1b1f92272e6d09da.jpg', logo: '/production-assets/363b3f719b33fd1cadd0.jpg' },
  { title: 'Вайбкодинг', school: 'Яндекс Практикум', duration: '2 месяца', price: 'от 2 245 ₽/мес', originalPrice: 'или сразу 55 000 ₽', discount: '-4%', tags: ['Вайб-кодинг', '+7'], image: '/production-assets/aabe8d7d5df92bc18e94.png', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Профессия Графический дизайнер PRO', school: 'Skillbox', rating: 5, reviews: 1, duration: '12 месяцев', price: 'от 5 392 ₽/мес', originalPrice: 'или сразу 167 161 ₽', discount: '-45%', tags: ['Графический дизайн', '+12'], image: '/production-assets/ea300c4cbd85c2e5eabf.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Бизнес-аналитик + ИИ', school: 'SF Education', rating: 4.8, reviews: 4, duration: '4 месяца', price: 'от 4 389 ₽/мес', originalPrice: 'или сразу 78 995 ₽', discount: '-65%', tags: ['Бизнес аналитика', 'SQL', '+20'], image: '/production-assets/be32aff181047add18f1.png', logo: '/production-assets/39a22027d7ee09ef8826.jpg' },
  { title: 'ИИ-агенты и n8n', school: 'Бруноям', rating: 5, reviews: 1, duration: '2 месяца', price: 'от 1 112 ₽/мес', originalPrice: 'или сразу 26 700 ₽', discount: '-50%', tags: ['ИИ-агенты', 'n8n', '+8'], image: '/production-assets/f051fdbcb2aba22b8b00.webp', logo: '/production-assets/bc636c1b166fbc485b0c.png' },
  { title: 'Искусственный интеллект в бизнесе: от хайпа к реальным результатам', school: 'Московская Бизнес Академия', duration: '3 месяца', price: 'от 5 825 ₽/мес', originalPrice: 'или сразу 69 900 ₽', discount: '-45%', tags: ['Нейронные сети', '+25'], image: '/production-assets/f1f1a727296015c05a6d.png', logo: '/production-assets/91ed78ffa0300d346281.png' }
]

export const fixtureSchools = [
  { title: 'Яндекс Практикум', rating: 4.55, reviews: 1409, students: 18225, image: '/production-assets/78ab71b4e7d2621cb75f.png', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Stepik', rating: 4.84, reviews: 82, students: 9509, logo: '/production-assets/80f17efe20fdfd49eab7.png' },
  { title: 'Skillbox', rating: 4.28, reviews: 264, students: 5403, image: '/production-assets/7f48908832f867a9a5a0.jpg', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Нетология', rating: 4.37, reviews: 261, students: 5372, image: '/production-assets/bb556e7a312fbdbb6aea.png', logo: '/production-assets/750d7d3d0208f8d37f4f.png' },
  { title: 'GB (GeekBrains)', rating: 4.35, reviews: 81, students: 4446, logo: '/production-assets/6b7a9fae7308faf5c854.png' },
  { title: 'Хекслет', rating: 4.98, reviews: 55, students: 2041, logo: '/production-assets/4597693c938a0ceb8d2b.png' },
  { title: 'HTML Academy', students: 1952, logo: '/production-assets/d034c870b1aafe5b3bff.png' },
  { title: 'Skillfactory', rating: 4, reviews: 296, students: 1743, image: '/production-assets/8a046393b43569780141.png', logo: '/production-assets/59a7eb52878028d20d9b.jpg' }
]

export const fixtureSkillboxCourses = [
  fixtureCourses[4]!,
  { title: 'Профессия 1С-программист', school: 'Skillbox', rating: 4.5, reviews: 6, duration: '8 месяцев', price: 'от 4 029 ₽/мес', originalPrice: 'или сразу 145 031 ₽', discount: '-46%', tags: ['1С разработка', '+5'], image: '/production-assets/3c358c1aa99d28c03d96.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Профессия Бухгалтер + ИИ', school: 'Skillbox', rating: 5, reviews: 7, duration: '6 месяцев', price: 'от 3 783 ₽/мес', originalPrice: 'или сразу 83 226 ₽', discount: '-45%', tags: ['Бухгалтер', '+11'], image: '/production-assets/7d3155f91eafa8c622cf.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Менеджер маркетплейсов: продвинутый курс с нуля + ИИ', school: 'Skillbox', rating: 5, reviews: 6, duration: '6 месяцев', price: 'от 2 639 ₽/мес', originalPrice: 'или сразу 81 806 ₽', discount: '-55%', tags: ['Менеджер маркетплейсов', '+9'], image: '/production-assets/0acadd980d261e0e68a7.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Профессия 3D-дженералист', school: 'Skillbox', rating: 5, reviews: 4, duration: '13 месяцев', price: 'от 8 639 ₽/мес', originalPrice: 'или сразу 267 794 ₽', discount: '-45%', tags: ['3D-дженералист', '+19'], image: '/production-assets/ee40c7b943700d194009.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Профессия Data-аналитик', school: 'Skillbox', rating: 5, reviews: 1, duration: '12 месяцев', price: 'от 5 601 ₽/мес', originalPrice: 'или сразу 173 616 ₽', discount: '-45%', tags: ['Аналитика данных', '+22'], image: '/production-assets/9adbd0a9fd83a4fa13e7.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Нейросети. Практический курс', school: 'Skillbox', rating: 3.99, reviews: 14, duration: '3 месяца', price: 'от 6 242 ₽/мес', originalPrice: 'или сразу 74 900 ₽', discount: '-55%', tags: ['Нейронные сети', '+5'], image: '/production-assets/38d74ddfc356c7b1654d.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' },
  { title: 'Профессия Инженер по тестированию + ИИ', school: 'Skillbox', rating: 5, reviews: 5, duration: '10 месяцев', price: 'от 4 346 ₽/мес', originalPrice: 'или сразу 134 712 ₽', discount: '-46%', tags: ['QA', 'Junit', '+23'], image: '/production-assets/03ffd2a32cca077d2893.png', logo: '/production-assets/f8f79cd312eef0bf459f.png' }
]

export const fixtureArticles = [
  { title: 'Как стать UX/UI‑дизайнером и сколько можно зарабатывать', date: '28 сентября', image: '/production-assets/b113b78040ef2b519e35.jpg' },
  { title: 'Кому подходит фриланс в IT и сколько можно зарабатывать', date: '25 сентября', image: '/production-assets/a8141d6b8a099add150d.png' },
  { title: 'Как ребёнок учится на ошибках и почему взрослые этому мешают', date: '23 сентября', image: '/production-assets/e53c3120c92de349fbad.png' }
]

export const fixturePromos = [
  { title: 'Скидка 5%', school: 'НАДПО', description: 'на любой курс', conditions: 'Суммируется со скидками на сайте. Промокод нужно назвать менеджеру по телефону', expires: 'Бессрочная', code: 'HABRCODE', href: 'https://nadpo.ru/do/', logo: '/production-assets/096c5e5395589ea68105.jpg' },
  { title: 'Скидка 13%', school: 'Бруноям', description: 'суммируется со скидкой на сайте', conditions: 'Скидка 13% по промокоду, суммируется со скидкой на сайте', expires: 'Бессрочная', code: 'habrpromo', href: 'https://brunoyam.com/online-kursy', logo: '/production-assets/bc636c1b166fbc485b0c.png' },
  { title: 'Подарок к заказу', school: 'Фоксфорд ИТ-колледж', description: 'ИТ-колледж', conditions: 'Среднее профессиональное образование по востребованным ИТ-профессиям: учитесь онлайн и получите диплом от колледжа-партнёра', expires: 'Бессрочная', code: '', href: 'https://fas.st/bvSA4?erid=2bL9aMPo2e49hMef4rrTrziaJV', actionLabel: 'Посмотреть', logo: '/production-assets/8af6bc42a9adc2646d23.png' },
  { title: 'Гостевой доступ', school: 'ProductStar × РБК', description: 'Нетворкинг для лидеров. Гостевой доступ за 1 ₽', code: '', href: 'https://productstar.ru/', actionLabel: 'Посмотреть', logo: '/production-assets/363b3f719b33fd1cadd0.jpg' },
  { title: 'Скидка 30%', school: 'Русская Школа Управления', description: 'MBA Эксперт: Управление компанией', conditions: 'Скидка 30% на курс MBA Expert — управление компанией', expires: 'Бессрочная', code: 'mbaminus30', href: 'https://uprav.ru/mba/mini-mba-ekspert-upravlenie-kompaniey/', logo: '/production-assets/100a02029963fecddf39.png' },
  { title: 'Скидка 20%', school: 'Русская Школа Управления', description: 'Генеральный директор', code: 'RS20', href: 'https://uprav.ru/rukovoditel/generalnyy-direktor/', logo: '/production-assets/100a02029963fecddf39.png' }
]

export const fixtureYandexPromos = [
  { title: 'Получи скидку 7%', school: 'Яндекс Практикум', description: 'Пройдите бесплатную часть курса за неделю и получите скидку', actionLabel: 'Посмотреть', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка до 20%', school: 'Яндекс Практикум', description: 'Получите скидку до 20% при оплате сразу', actionLabel: 'Посмотреть', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка 20%', school: 'Яндекс Практикум', description: 'Скидка 20% на все курсы до 30 ноября + набор подарков', actionLabel: 'Посмотреть', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка 16%', school: 'Яндекс Практикум', description: 'Просто выберите курс по душе — и скидка ваша!', actionLabel: 'Посмотреть', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка 15% + подарки', school: 'Яндекс Практикум', description: 'Купи курс в апреле и получи скидку 15% + 5 курсов и 5 книг', actionLabel: 'Посмотреть', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка + бонусы', school: 'Яндекс Практикум', description: 'Скидка 15% + 10 бонусов для карьеры', actionLabel: 'Посмотреть', logo: '/production-assets/ade49e2a531e25f80a36.png' }
].filter(promo => promo.title !== 'Скидка 16%').map(promo => ({ ...promo, code: '', href: 'https://practicum.yandex.ru/' }))

// Code offers below are explicit UI examples, not valid production promotions.
export const fixtureYandexCodePromos = [
  { title: 'Скидка 10% — пример', school: 'Яндекс Практикум', description: 'Демонстрационный промокод на обучение', conditions: 'Пример для проверки интерфейса. Код не действует на сайте школы.', code: 'DEMO10', href: 'https://practicum.yandex.ru/', logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка 15% — пример', school: 'Яндекс Практикум', description: 'Демонстрационный промокод на выбранный курс', conditions: 'Пример для проверки интерфейса. Код не действует на сайте школы.', code: 'DEMO15', href: 'https://practicum.yandex.ru/', logo: '/production-assets/ade49e2a531e25f80a36.png' }
]

// Expired offer labels captured from the production archive, page 5.
export const fixtureExpiredPromos = [
  { title: 'Скидка 13%', school: 'Бруноям', description: 'на курсы', code: 'TEST', expired: true, logo: '/production-assets/bc636c1b166fbc485b0c.png' },
  { title: 'Скидка 16%', school: 'Яндекс Практикум', description: 'Просто выберите курс по душе — и скидка ваша!', code: '', expired: true, logo: '/production-assets/ade49e2a531e25f80a36.png' }
]

export const fixtureYandexExpiredPromos = [
  { title: 'Скидка 16%', school: 'Яндекс Практикум', description: 'Просто выберите курс по душе — и скидка ваша!', code: '', expired: true, logo: '/production-assets/ade49e2a531e25f80a36.png' },
  { title: 'Скидка 16%', school: 'Яндекс Практикум Английский', description: 'при оплате курса сразу', code: '', expired: true, logo: '/production-assets/ade49e2a531e25f80a36.png' }
]

export const fixtureExperts = [
  { name: 'Александр Вальцев', role: 'Генеральный директор', description: 'Основатель финансового онлайн-университета SF Education, сооснователь аутсорсингового сервиса Coworkle. Предприниматель, эксперт по корпоративным финансам и образовательным технологиям.', avatar: '/production-assets/3ff3322db2c804ccbc87.png' },
  { name: 'Александр Минаков', role: 'Преподаватель, автор и ведущий программ по искусственному интеллекту и нейросетям', description: 'Эксперт по практическому применению и внедрению искусственного интеллекта в бизнесе и образовании, ai-креатор, преподаватель, исследователь, автор книг и образовательных программ.', avatar: '/production-assets/6d350e3bae354687c38e.png' },
  { name: 'Александр Ульяницкий', role: 'Senior QA Engineer', description: 'Ведущий инженер-тестировщик с глубокой экспертизой в автоматизации и ручном тестировании сложных корпоративных систем. Обучил и адаптировал для реальных проектов более 20 QA-инженеров.', avatar: '/production-assets/d2adc74a18d767283cb7.jpg' },
  { name: 'Алексей Поляков', role: 'Основатель', description: 'Дизайн-лид и продуктовый UI/UX-дизайнер с опытом более 10 лет. С 2024 года полностью ведёт собственную программу подготовки дизайнеров интерфейсов с нуля до трудоустройства.', avatar: '/production-assets/d7902795158310afcad3.png' },
  { name: 'Алёна Меркушева', role: 'Старший программный менеджер', description: 'Менеджер проектов с 9+ годами в сферах Hardware, EdTech, Design, Digital consulting и предпринимательства. Реализовала свыше 60 проектов и помогла более 500 студентам стать проектными менеджерами.', avatar: '/production-assets/d6bf03ade2c12fecc4e9.jpg' },
  { name: 'Валерий Полоцкий', role: 'Директор по персоналу', description: 'Стратегический HR-практик с 12+ годами опыта в быстрорастущих компаниях и компаниях международного уровня с большой филиальной сетью.', avatar: '/production-assets/77b787ac2dfe26abc4d0.jpg' },
  { name: 'Елена Куклина', role: 'Senior IT recruiter', description: 'Эксперт в сфере IT-рекрутинга с общим стажем работы более 8 лет. Ключевая компетенция — закрытие вакансий уровня Middle, Senior, а также executive search.', avatar: '/production-assets/d6bb9720c5023c2737b5.jpg' },
  { name: 'Елена Махова', role: 'Основатель (CEO)', description: 'Founder EdTech-агентства. Разрабатывает образовательные продукты под задачу бизнеса. За почти 10 лет работы запустила более 300 продуктов в разных форматах.', avatar: '/production-assets/ccc82b60512bf7b1bd5a.png' }
].map(person => ({ ...person, ...productionPeopleContacts[person.name] }))

export const fixtureEditors = [
  { name: 'Анна Линская', role: 'Руководитель отдела маркетинга', description: 'Пишет и преподает писательское мастерство в CWS, ведет подкаст про ИТ. Умеет работать с молодыми продуктами, запускать новые проекты и оптимизировать текущие процессы.', avatar: '/production-assets/e736468b5b49da8de4da.png' },
  { name: 'Дарья Гуляева', role: 'Менеджер по персоналу', description: 'HR-эксперт и специалист по внутренним коммуникациям в Хабре. Более 5 лет развивает проекты внутри компании: от коммерческого направления до HR-процессов и профессиональных мероприятий.', avatar: '/production-assets/ba28627c7b0fffed82d5.png' },
  { name: 'Сергей Лобачев', role: 'Ведущий менеджер по развитию бизнеса', description: 'Эксперт по продажам и построению коммуникаций с 15-летним опытом в FinTech, IT, HRTech, EdTech и ритейле.', avatar: '/production-assets/dc49049b4299e5dd2a5b.jpg' },
  { name: 'Степан Воеводин', role: 'Руководитель отдела дизайна', description: 'Руководитель отдела дизайна Хабра и продуктовый дизайнер с более чем 17-летним опытом работы в IT и digital.', avatar: '/production-assets/c6516c822dd28a307b92.png' },
  { name: 'Виктория Гонгина', role: 'Старший редактор-эксперт', description: 'Работает с текстами на Хабре более 15 лет, автор более чем 2500 текстов для блогов компаний.', avatar: '/production-assets/c353ae1379186a087acc.png' },
  { name: 'Анастасия Сичкаренко', description: 'Умеет создавать креативные или просто понятные тексты и делать так, чтобы они работали на цели бизнеса. Большой опыт в рерайтинге и журналистике.', avatar: '/production-assets/c088b5b1a4cf9640505d.png' }
].map(person => ({ ...person, ...productionPeopleContacts[person.name] }))

export const fixtureReviews = [
  { author: 'Елена Пральникова', course: 'Профессия авитолог: специалист по рекламе и продажам на Авито', date: '29 сентября', advantages: 'Когда одно и то же слышишь несколько раз, кажется: «ну я же это знаю». А потом садишься делать сама и понимаешь, насколько важно было всё повторять и разбирать на практике 😄 На обучении очень много информации, но она реально рабочая. Мне особенно помогли разборы объявлений и обратная связь. После внесенных корректировок я получила заказ практически сразу. Спасибо за терпение, поддержку и за то, что заставляете не просто смотреть уроки, а реально делать.', avatar: '/production-assets/d5959bca881633a9087f.svg', courseLogo: '/production-assets/9e1db1952f202ca62a98.png' },
  { author: 'Наталья Ахмедова', course: 'Профессия авитолог: специалист по рекламе и продажам на Авито', date: '28 сентября', advantages: 'Я в начале обучения была в шоке от количества новой информации. Казалось, что я никогда не разберусь во всех таблицах, аналитике, формулах и автозагрузке 😅 Но Ксюша настолько подробно всё объясняет, что постепенно картинка начинает складываться. Очень ценно, что можно задавать вопросы столько раз, сколько нужно, и тебе всё равно спокойно объяснят еще раз. Плюс обучение не только про техническую работу с Авито. Мы много говорили про общение с клиентами, страхи, продажи, возражения и уверенность в себе. Это очень помогает в работе.', avatar: '/production-assets/d5959bca881633a9087f.svg', courseLogo: '/production-assets/9e1db1952f202ca62a98.png' },
  { author: 'Владислав Гавриленко', course: 'Анализ Систем', date: '28 сентября', advantages: 'Честно говоря, я был приятно удивлен насыщенностью и практической ценностью материала. Ожидал получить больше теорию, а в итоге пришел к глубокой, хорошо структурированной программе, которую можно сразу применять в реальной работе.', comment: 'Хоть и не приходилось писать ни строчки кода — заданий на «хорошо подумать» было достаточно. Все рекомендации кураторов курса были актуальны и полезны.', avatar: '/production-assets/d5959bca881633a9087f.svg', courseLogo: '/production-assets/8171b54af36d99238d1b.png' }
]

export const fixtureReviewDetail = {
  author: 'Андрей Куркин',
  course: 'SEO-специалист',
  date: 'июнь 2023',
  advantages: 'Из самых главных плюсов это наверное связь с преподавателями, иногда было трудно освоить какой ни будь урок и приходилось писать преподавателям, отвечали быстро и внятно объясняли. Также хочу отметить обратную связь по домашнему заданию, после сдачи каждого домашнего задания, преподаватели тщательно проверяют домашнее задание, указывают на ошибки, каждую ошибку разжевывают в письменном виде. На домашнее задание ставиться дедлайн, но не всегда получалось вовремя сдавать его, в данном случае можно было продлить дедлайн. Еще один из хороших плюсов это — живые лекции, на лекциях преподаватели на практике показывали как пользоваться тем или иным инструментом, также отвечали на вопросы в режиме реально времени.',
  disadvantages: 'Недостатков пока не нашел, еще проходить 2 блока, дальше видно будет.',
  comment: 'Курс можно брать тем людям которые даже никогда не интересовались данной специальностью. Лентяем данный курс лучше не брать т.к. помимо курса лучше изучать еще какие то моменты, на курсе даются источники на другие сайты с полезной информацией. В общем если есть у человека стремление но у него мало опыты или вообще его нет, то курс однозначно должен подойти.',
  avatar: '/production-assets/a33e66d910a1f223ad30.jpg',
  courseLogo: '/production-assets/750d7d3d0208f8d37f4f.png'
}

export const fixtureNetologyReviews = [
  { author: 'Александр Цупко', course: 'Python-разработчик: расширенный курс', date: '2 сентября', advantages: 'Подача материала, программа курса, профессиональные преподаватели, качество домашних заданий', avatar: '/production-assets/d5959bca881633a9087f.svg', courseLogo: '/production-assets/750d7d3d0208f8d37f4f.png' },
  { author: 'Александр Приходько', course: 'Data Scientist с нуля', date: '27 июля', advantages: 'Я смог определиться с темами для самостоятельного изучения', disadvantages: 'Курс модульный, слеплен из большого количества мелких курсов. По моим ощущениям программа отставала года на 3.', comment: 'Проверьте насколько актуальна их программа.', avatar: '/production-assets/d5959bca881633a9087f.svg', courseLogo: '/production-assets/750d7d3d0208f8d37f4f.png' },
  { author: 'Полина Усманова', course: 'Веб-дизайнер', date: '14 июля', avatar: '/production-assets/d5959bca881633a9087f.svg', courseLogo: '/production-assets/750d7d3d0208f8d37f4f.png' }
]

export const fixtureRating = [
  { position: 1, name: 'Digital Skills Academy', rating: 5, courses: 25, reviews: 10 },
  { position: 2, name: 'АБИУС', rating: 5, courses: 243, reviews: 13, partner: true },
  { position: 3, name: 'Академия EDPRO', rating: 5, courses: 17, reviews: 57 },
  { position: 4, name: 'Академия Эдюсон', rating: 5, courses: 285, reviews: 221, partner: true },
  { position: 5, name: 'Король Говорит', rating: 5, courses: 2, reviews: 22 },
  { position: 6, name: 'МИТУ', rating: 5, courses: 150, reviews: 47, partner: true },
  { position: 7, name: 'ОТЧАЙНЫЙ авитолог', rating: 5, courses: 1, reviews: 5 },
  { position: 8, name: 'Учебный центр МГУТУ', rating: 5, courses: 60, reviews: 31, partner: true },
  { position: 9, name: 'Хекслет', rating: 4.98, courses: 24, reviews: 55 },
  { position: 10, name: 'Институт профессиональных квалификаций', rating: 4.98, courses: 172, reviews: 67, partner: true }
]

export const fixtureDirections = [
  { label: 'Программирование и IT', description: '1410' },
  { label: 'Аналитика и Data Science', description: '647' },
  { label: 'Дизайн и контент', description: '706' },
  { label: 'Бизнес и менеджмент', description: '1393' },
  { label: 'Маркетинг и продажи', description: '429' },
  { label: 'Финансы и бухгалтерия', description: '677' }
]
