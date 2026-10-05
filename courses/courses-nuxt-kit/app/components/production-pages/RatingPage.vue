<script setup lang="ts">
import { fixtureCourses, fixtureRating } from '~/data/productionPageFixtures'
import { childEducationSchools } from '~/data/educationSearchFixtures'

const audience = ref('adult')
const searchValues = ref<Record<string, string>>({})
const appliedValues = ref<Record<string, string>>({})
// Demo search taxonomy. These associations are not production backend metadata.
const topicOptions = [
  { label: 'Программирование', value: 'programming', direction: 'it' },
  { label: 'Дизайн', value: 'design', direction: 'it' },
  { label: 'Аналитика данных', value: 'analytics', direction: 'it' },
  { label: 'Менеджмент', value: 'management', direction: 'business' },
  { label: 'Маркетинг', value: 'marketing', direction: 'business' },
  { label: 'Английский язык', value: 'english', direction: 'languages' },
  { label: 'Школьные предметы', value: 'school', direction: 'school' }
]
const adultTopics = [
  ['programming', 'analytics'], ['management'], ['management'],
  ['programming', 'design', 'analytics', 'management'], ['english'],
  ['management', 'design'], ['marketing'], ['management', 'programming'],
  ['programming'], ['management']
]
const rows = computed(() => audience.value === 'adult'
  ? fixtureRating.map((row, index) => ({ row, topics: adultTopics[index]!, goals: index === 4 ? ['hobby', 'upskill'] : ['profession', 'upskill'] }))
  : childEducationSchools.filter(school => school.card.rating > 0).sort((a, b) => b.card.rating - a.card.rating).map((school, index) => ({
    row: { position: index + 1, name: school.card.title, rating: school.card.rating, reviews: school.card.reviews, href: school.card.href },
    topics: school.topics, goals: ['hobby', 'upskill']
  })))
const searchFields = computed(() => [
  { name: 'direction', placeholder: 'Какое направление?', options: [
    { label: 'Все направления', value: '' }, { label: 'Программирование и IT', value: 'it' },
    { label: 'Бизнес и менеджмент', value: 'business' }, { label: 'Языки', value: 'languages' },
    { label: 'Школьное образование', value: 'school' }
  ] },
  { name: 'topic', placeholder: 'Что изучить?', options: [{ label: 'Все темы', value: '' }, ...topicOptions.filter(topic => !searchValues.value.direction || topic.direction === searchValues.value.direction)] },
  { name: 'goal', placeholder: 'Какая цель?', options: [
    { label: 'Любая цель', value: '' }, { label: 'Освоить профессию', value: 'profession' },
    { label: 'Повысить квалификацию', value: 'upskill' }, { label: 'Для себя', value: 'hobby' }
  ] }
])
const filteredRows = computed(() => rows.value.filter(item =>
  (!appliedValues.value.direction || item.topics.some(topic => topicOptions.find(option => option.value === topic)?.direction === appliedValues.value.direction)) &&
  (!appliedValues.value.topic || item.topics.includes(appliedValues.value.topic)) &&
  (!appliedValues.value.goal || item.goals.includes(appliedValues.value.goal))
).map((item, index) => ({ ...item.row, position: index + 1 })))
const hasFilters = computed(() => Object.values(appliedValues.value).some(Boolean))
function search() { appliedValues.value = { ...searchValues.value } }
function resetSearch() { searchValues.value = {}; appliedValues.value = {} }
watch(audience, resetSearch)
watch(() => searchValues.value.direction, () => {
  if (searchValues.value.topic && !topicOptions.some(topic => topic.value === searchValues.value.topic && (!searchValues.value.direction || topic.direction === searchValues.value.direction))) {
    searchValues.value = { ...searchValues.value, topic: '' }
  }
})
</script>

<template>
  <div class="production-page" data-production-page="rating">
    <PageHero title="Рейтинг онлайн-школ">
      <template #header><SiteHeader family="simple" surface="transparent" /></template>
      <template #title>Рейтинг<br>онлайн-школ</template>
      <template #switcher><ButtonGroup v-model="audience" variant="hero" :block="false" label="Аудитория" :items="[{ label: 'Взрослым', value: 'adult' }, { label: 'Детям', value: 'child' }]" /></template>
      <template #search><SearchForm v-model:values="searchValues" :fields="searchFields" submit-label="Найти школы" @submit="search" /></template>
    </PageHero>
    <main class="production-page__container production-page__stack">
      <Section title="Лучшие онлайн-школы 2026" space="s">
        <div v-if="hasFilters" class="production-page__rating-search-status"><span role="status">Найдено школ: {{ filteredRows.length }}</span><Link as="button" @click="resetSearch">Сбросить фильтры</Link></div>
        <RatingTable v-if="filteredRows.length" :rows="filteredRows" />
        <EmptyState v-else><Button variant="secondary" @click="resetSearch">Сбросить фильтры</Button></EmptyState>
      </Section>
      <Section title="Популярные курсы" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" /></Carousel></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.production-page__rating-search-status{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--crs-space-12);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
</style>
