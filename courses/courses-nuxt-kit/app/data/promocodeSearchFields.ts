import { fixtureDirections, fixturePromos, fixtureYandexPromos } from './productionPageFixtures'
import { fixturePromoLinks } from './productionListingBlocks'

// Local preview options from the captured page fixtures; no backend search.
export const promocodeSearchFields = [
  { name: 'organization', placeholder: 'Организация', options: [
    { label: 'Все организации', value: '' },
    { label: 'Яндекс Практикум', value: 'yandex' },
    ...[...new Set([...fixturePromoLinks.map(item => item.label), ...fixturePromos.map(item => item.school), ...fixtureYandexPromos.map(item => item.school)])]
      .filter(school => school !== 'Яндекс Практикум')
      .map(school => ({ label: school, value: school }))
  ] },
  { name: 'topic', placeholder: 'Что изучить?', options: [
    { label: 'Все темы', value: '' },
    ...fixtureDirections.map(item => ({ label: item.label, value: item.label }))
  ] },
  { name: 'type', placeholder: 'Тип', options: [
    { label: 'Все типы', value: '' },
    { label: 'Промокоды', value: 'promocode' },
    { label: 'Акции', value: 'sale' }
  ] }
]
