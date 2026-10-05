<script setup lang="ts">
import { fixtureArticles, fixtureCourses } from '~/data/productionPageFixtures'
import { fixtureEducationCities, fixtureEducationTopics } from '~/data/productionEducationLinks'
import { adultEducationSchools, childEducationSchools, educationTopicOptions, educationTypeOptions } from '~/data/educationSearchFixtures'

const audience = ref('adult')
const page = ref(1)
const searchValues = ref<Record<string, string>>({})
const appliedValues = ref<Record<string, string>>({})
const resultsElement = ref<HTMLElement>()
const schools = computed(() => audience.value === 'child' ? childEducationSchools : adultEducationSchools)
const searchFields = computed(() => [
  { name: 'organization', placeholder: 'Организация', options: [{ label: 'Все организации', value: '' }, ...schools.value.map(school => ({ label: school.card.title, value: school.card.title }))] },
  { name: 'topic', placeholder: 'Что изучить?', options: [{ label: 'Все темы', value: '' }, ...educationTopicOptions] },
  { name: 'type', placeholder: 'Тип', options: [{ label: 'Все типы', value: '' }, ...educationTypeOptions] }
])
const filteredSchools = computed(() => schools.value.filter(school =>
  (!appliedValues.value.organization || school.card.title === appliedValues.value.organization) &&
  (!appliedValues.value.topic || school.topics.includes(appliedValues.value.topic)) &&
  (!appliedValues.value.type || school.type === appliedValues.value.type)
))
const totalPages = computed(() => Math.ceil(filteredSchools.value.length / 8))
const visibleSchools = computed(() => filteredSchools.value.slice((page.value - 1) * 8, page.value * 8))
const hasFilters = computed(() => Object.values(appliedValues.value).some(Boolean))
function search() { appliedValues.value = { ...searchValues.value }; page.value = 1; nextTick(() => resultsElement.value?.scrollIntoView({ block: 'start' })) }
function resetSearch() { searchValues.value = {}; appliedValues.value = {}; page.value = 1 }
watch(audience, resetSearch)
watch(page, () => nextTick(() => resultsElement.value?.scrollIntoView({ block: 'start' })))
</script>

<template>
  <div class="production-page" data-production-page="education-centers-listing">
    <PageHero title="Образовательные организации в России">
      <template #header><SiteHeader family="simple" surface="transparent" /></template>
      <template #title>Образовательные<br>организации в России</template>
      <template #switcher><ButtonGroup v-model="audience" variant="hero" :block="false" label="Аудитория" :items="[{ label: 'Взрослым', value: 'adult' }, { label: 'Детям', value: 'child' }]" /></template>
      <template #search><SearchForm v-model:values="searchValues" :fields="searchFields" submit-label="Найти организации" @submit="search" /></template>
    </PageHero>
    <main class="production-page__container production-page__stack">
      <div class="production-page__carousel-boundary"><AdSlot /></div>
      <div ref="resultsElement" class="production-page__school-results">
        <div v-if="hasFilters" class="production-page__search-status">
          <span role="status">Найдено организаций: {{ filteredSchools.length }}</span>
          <Link as="button" @click="resetSearch">Сбросить фильтры</Link>
        </div>
        <CardGrid v-if="visibleSchools.length" :tablet-columns="3"><SchoolCard v-for="school in visibleSchools" :key="school.card.title" v-bind="school.card" /></CardGrid>
        <EmptyState v-else><Button variant="secondary" @click="resetSearch">Сбросить фильтры</Button></EmptyState>
        <Pagination v-if="totalPages > 1" v-model="page" class="production-page__pagination" :total="totalPages" />
      </div>
      <Section title="Популярные курсы" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" /></Carousel></Section>
      <Section title="Журнал" space="s"><Carousel variant="article-card" loop><ArticleCard v-for="article in fixtureArticles" :key="article.title" v-bind="article" /></Carousel></Section>
      <Section title="Образовательные организации в городах" space="s"><LinkGrid :items="fixtureEducationCities" /></Section>
      <Section title="Ещё онлайн-школы" space="s"><LinkGrid :items="fixtureEducationTopics" /></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.production-page__school-results{scroll-margin-top:var(--crs-space-24)}
.production-page__search-status{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--crs-space-12);margin-bottom:var(--crs-space-16);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
</style>
