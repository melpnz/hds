<script setup lang="ts">
import { fixtureArticles, fixtureReviews, fixtureSkillboxCourses } from '~/data/productionPageFixtures'
</script>

<template>
  <div class="production-page" data-production-page="education-center">
    <SiteHeader family="simple" />
    <main class="production-page__container production-page__stack production-page__stack--listing production-page__school-stack">
      <EntityHeader
        title="Skillbox"
        description="Skillbox — это онлайн-университет. У нас прикладные курсы и программы от главных экспертов рынка, актуальные подходы к обучению, работа над реальными проектами, стажировки и трудоустройство в крупнейшие компании страны."
        :rating="4.28"
        :reviews="264"
        :graduates="5406"
        cover="/production-assets/7f48908832f867a9a5a0.jpg"
        logo="/production-assets/f8f79cd312eef0bf459f.png"
      />
      <Section title="Курсы Skillbox" space="s">
        <FilterBar><FilterChip>Все направления</FilterChip><FilterChip>Со скидкой</FilterChip><FilterChip>С трудоустройством</FilterChip></FilterBar>
        <CardGrid :tablet-columns="3"><CourseCard v-for="course in fixtureSkillboxCourses" :key="course.title" v-bind="course" /></CardGrid>
        <Button variant="secondary" block>Показать все курсы</Button>
      </Section>
      <div class="production-page__carousel-boundary"><AdSlot /></div>
      <Section title="Истории успеха выпускников" space="s"><Carousel variant="article-card" loop><ArticleCard v-for="article in fixtureArticles" :key="article.title" v-bind="article" /></Carousel></Section>
      <Section title="Отзывы о Skillbox" space="s"><Carousel variant="review-card" loop><ReviewCard v-for="review in fixtureReviews" :key="review.author" v-bind="review" :rating="5" verified /></Carousel></Section>
      <Section title="Об организации" space="s"><InfoTable :rows="[{ label: 'Год основания', value: '2016' }, { label: 'Формат обучения', value: 'Онлайн' }, { label: 'Направления', value: 'Программирование, дизайн, маркетинг, управление' }, { label: 'Документы', value: 'Лицензия на образовательную деятельность' }]" /></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
@media(min-width:768px){.production-page__school-stack{padding-bottom:calc(var(--crs-unit) * 112)}}
</style>
