export const productionPages = [
  {
    id: 'courses-listing',
    title: 'Каталог курсов',
    path: '/courses',
    sourceUrl: 'https://career.habr.com/courses'
  },
  {
    id: 'course-category',
    title: 'Курсы по ChatGPT',
    path: '/courses/nejronnye-seti/gpt',
    sourceUrl: 'https://career.habr.com/courses/nejronnye-seti/gpt'
  },
  {
    id: 'education-centers-listing',
    title: 'Образовательные организации',
    path: '/education_centers',
    sourceUrl: 'https://career.habr.com/education_centers'
  },
  {
    id: 'rating',
    title: 'Рейтинг онлайн-школ',
    path: '/education_centers/rating',
    sourceUrl: 'https://career.habr.com/education_centers/rating'
  },
  {
    id: 'education-center',
    title: 'Школа Skillbox',
    path: '/education_centers/36-skillbox',
    sourceUrl: 'https://career.habr.com/education_centers/36-skillbox'
  },
  {
    id: 'reviews',
    title: 'Отзывы об онлайн-школах',
    path: '/education_centers/otzyvy',
    sourceUrl: 'https://career.habr.com/education_centers/otzyvy'
  },
  {
    id: 'review-detail',
    title: 'Отзыв о курсе',
    path: '/education_centers/otzyvy/…/15229',
    sourceUrl: 'https://career.habr.com/education_centers/otzyvy/10-netologiya/162-seo-specialist/15229'
  },
  {
    id: 'promocodes',
    title: 'Промокоды и акции',
    path: '/education/promocodes',
    sourceUrl: 'https://career.habr.com/education/promocodes'
  },
  {
    id: 'promocode-detail',
    title: 'Промокоды Яндекс Практикума',
    path: '/education/promocodes/35-yandeks-praktikum',
    sourceUrl: 'https://career.habr.com/education/promocodes/35-yandeks-praktikum'
  },
  {
    id: 'authors',
    title: 'Эксперты по оценке обучения',
    path: '/courses/authors',
    sourceUrl: 'https://career.habr.com/courses/authors'
  },
  {
    id: 'editors',
    title: 'Редакция Хабра',
    path: '/courses/editors',
    sourceUrl: 'https://career.habr.com/courses/editors'
  },
  {
    id: 'author',
    title: 'Николай Ширинкин',
    path: '/courses/authors/11-nikolay-shirinkin',
    sourceUrl: 'https://career.habr.com/courses/authors/11-nikolay-shirinkin'
  }
] as const

export type ProductionPageId = typeof productionPages[number]['id']
