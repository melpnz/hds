<script setup lang="ts">
import { fixtureCourses, fixtureNetologyReviews, fixtureReviewDetail } from '~/data/productionPageFixtures'
</script>

<template>
  <div class="production-page" data-production-page="review-detail">
    <SiteHeader family="simple" />
    <main class="production-page__container">
      <Link class="production-page__back-link" href="/ui/pages/reviews" tone="muted" layout="flex" decoration="none"><UIcon class="production-page__back-icon" name="i-tabler-chevron-left" aria-hidden="true" /><span>К списку отзывов</span></Link>
      <div class="production-page__review-body">
      <ReviewCard v-bind="fixtureReviewDetail" variant="full" :rating="5" verified />
      <Section title="Интересные курсы по направлению «Маркетинг и продажи»" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" /></Carousel></Section>
      <Section title="Другие отзывы о школе «Нетология»" space="s"><Carousel variant="review-card" loop><ReviewCard v-for="review in fixtureNetologyReviews" :key="review.author" v-bind="review" :rating="5" /></Carousel></Section>
      <h1 class="production-page__review-title">Отзывы о курсе «SEO-специалист» в Нетология</h1>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.production-page__back-link{height:var(--crs-size-32);margin-block:var(--crs-space-24);gap:var(--crs-space-2);color:var(--crs-black-400);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.production-page__back-icon{width:var(--crs-size-24);height:var(--crs-size-24);flex:none;color:var(--crs-black-500)}
.production-page__review-body{position:relative;display:grid;grid-template-columns:minmax(0,1fr);gap:var(--crs-space-48);padding-bottom:calc(var(--crs-space-24) * 4 + var(--crs-space-16))}
.production-page__review-title{position:absolute;bottom:calc(var(--crs-space-40) * 2);left:0;transform:translateY(100%);margin:0;color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
</style>
