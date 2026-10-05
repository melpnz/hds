<script setup lang="ts">
import { fixtureCourses, fixtureReviews, fixtureSchools, fixtureSkillboxCourses } from '~/data/productionPageFixtures'

const audience = ref('adult')
const searchValues = ref<Record<string, string>>({})
const searchCourses = [...fixtureCourses, ...fixtureSkillboxCourses].filter((course, index, all) => all.findIndex(item => item.school === course.school && item.title === course.title) === index)
const searchFields = computed(() => [
  { name: 'organization', placeholder: 'Какая школа?', options: [
    { label: 'Все школы', value: '' },
    ...[...new Set(searchCourses.map(course => course.school))].map(school => ({ label: school, value: school }))
  ] },
  { name: 'course', placeholder: 'Какой курс?', options: [
    { label: 'Все курсы', value: '' },
    ...searchCourses.filter(course => !searchValues.value.organization || course.school === searchValues.value.organization).map(course => ({ label: course.title, value: `${course.school}:${course.title}` }))
  ] }
])
watch(() => searchValues.value.organization, () => {
  if (searchValues.value.course && !searchFields.value[1]!.options.some(option => option.value === searchValues.value.course)) {
    searchValues.value = { ...searchValues.value, course: '' }
  }
})
</script>

<template>
  <div class="production-page" data-production-page="reviews">
    <PageHero title="Отзывы об онлайн-школах">
      <template #header><SiteHeader family="simple" surface="transparent" /></template>
      <template #title>Отзывы<br>об онлайн-школах</template>
      <template #switcher><ButtonGroup v-model="audience" variant="hero" :block="false" label="Аудитория" :items="[{ label: 'Взрослым', value: 'adult' }, { label: 'Детям', value: 'child' }]" /></template>
      <template #search><SearchForm v-model:values="searchValues" :fields="searchFields" submit-label="Найти отзывы" /></template>
    </PageHero>
    <main class="production-page__container production-page__stack">
      <Section title="Последние отзывы" space="s">
        <div class="production-page__review-list"><ReviewCard v-for="review in fixtureReviews" :key="review.author" v-bind="review" variant="wide" :rating="5" verified /></div>
        <Button variant="secondary" block>Показать все отзывы</Button>
      </Section>
      <Section title="Популярные курсы" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" /></Carousel></Section>
      <Section title="Лучшие онлайн-школы" space="s"><CardGrid :tablet-columns="3"><SchoolCard v-for="school in fixtureSchools.slice(0, 4)" :key="school.title" v-bind="school" /></CardGrid></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>.production-page__review-list{display:grid;gap:var(--crs-space-12)}</style>
