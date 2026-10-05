import { fixtureSchools } from './productionPageFixtures'

// School identities: saved production snapshots. Filter taxonomy: demo-only, not backend data.
export const educationTopicOptions = [
  { label: 'Программирование', value: 'programming' },
  { label: 'Дизайн', value: 'design' },
  { label: 'Аналитика данных', value: 'analytics' },
  { label: 'Английский язык', value: 'english' },
  { label: 'Школьные предметы', value: 'school' }
]
export const educationTypeOptions = [
  { label: 'Онлайн-школа', value: 'online-school' },
  { label: 'Образовательная платформа', value: 'platform' }
]
const adultTopics = [
  ['programming', 'analytics'], ['programming', 'analytics', 'english'],
  ['programming', 'design', 'analytics'], ['programming', 'design', 'analytics'],
  ['programming', 'design'], ['programming'], ['programming', 'design'], ['programming', 'analytics']
]
export const adultEducationSchools = fixtureSchools.map((card, index) => ({
  card, topics: adultTopics[index]!, type: card.title === 'Stepik' ? 'platform' : 'online-school'
}))
const childrenCards = [
  {
    "title": "Компьютерная академия «TOP»",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/75-kompyuternaya-akademiya-top"
  },
  {
    "title": "Академия Эдюсон",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/271-akademiya-edyuson"
  },
  {
    "title": "Skyeng",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/332-skyeng"
  },
  {
    "title": "НАДПО",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/383-nadpo"
  },
  {
    "title": "Алгоритмика",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/227-algoritmika"
  },
  {
    "title": "Инглекс",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/333-ingleks"
  },
  {
    "title": "Фоксфорд",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/374-foksford"
  },
  {
    "title": "Skillbox английский",
    "rating": 4.8,
    "reviews": 5,
    "students": 0,
    "href": "https://career.habr.com/education_centers/368-skillbox-angliyskiy"
  },
  {
    "title": "Coddyschool",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/369-coddyschool"
  },
  {
    "title": "Hello World",
    "rating": 4.54,
    "reviews": 33,
    "students": 0,
    "href": "https://career.habr.com/education_centers/394-hello-world"
  },
  {
    "title": "Альфа-школа",
    "rating": 4.73,
    "reviews": 11,
    "students": 0,
    "href": "https://career.habr.com/education_centers/462-alfa-shkola"
  },
  {
    "title": "Цифрофой колледж Skillbox",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/781-cifrofoy-kolledzh-skillbox"
  },
  {
    "title": "Anecole",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/452-anecole"
  },
  {
    "title": "100балльный репетитор",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/753-100ballnyy-repetitor"
  },
  {
    "title": "99 Баллов",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/777-99-ballov"
  },
  {
    "title": "EasyCode",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/428-easycode"
  },
  {
    "title": "ЕГЭLAND",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/455-egeland"
  },
  {
    "title": "Фоксфорд ИТ-колледж",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/757-foksford-it-kolledzh"
  },
  {
    "title": "Котокод",
    "rating": 0,
    "reviews": 0,
    "students": 0,
    "href": "https://career.habr.com/education_centers/457-kotokod"
  },
  {
    "title": "Пиксель",
    "rating": 4.94,
    "reviews": 27,
    "students": 0,
    "href": "https://career.habr.com/education_centers/380-piksel"
  }
]
export const childEducationSchools = childrenCards.map(card => ({
  card,
  topics: /Skyeng|Инглекс|английский/.test(card.title) ? ['english'] : /Фоксфорд/.test(card.title) ? ['school'] : ['programming'],
  type: 'online-school'
}))
