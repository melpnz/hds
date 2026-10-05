<script setup lang="ts">
import { fixtureArticles, fixtureCourses, fixtureDirections, fixturePromos, fixtureExpiredPromos } from '~/data/productionPageFixtures'
import { fixturePromoLinks } from '~/data/productionListingBlocks'
import { promocodeSearchFields } from '~/data/promocodeSearchFields'

const page = ref(1)
const searchValues = ref<Record<string, string>>({})
</script>

<template>
  <div class="production-page" data-production-page="promocodes">
    <PageHero title="Промокоды и акции">
      <template #header><SiteHeader family="simple" surface="transparent" /></template>
      <template #title>Промокоды<br>и акции</template>
      <template #search><SearchForm v-model:values="searchValues" :fields="promocodeSearchFields" submit-label="Найти промокоды" /></template>
    </PageHero>
    <main class="production-page__container production-page__stack">
      <div class="production-page__carousel-boundary"><AdSlot /></div>
      <div><CardGrid :tablet-columns="3"><PromoCard v-for="(promo, index) in [...fixturePromos, ...fixtureExpiredPromos]" :key="index" v-bind="promo" /></CardGrid><Pagination v-model="page" class="production-page__pagination" :total="6" /></div>
      <Section title="Популярные курсы со скидкой" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" /></Carousel></Section>
      <Section title="Журнал" space="s"><Carousel variant="article-card" loop><ArticleCard v-for="article in fixtureArticles" :key="article.title" v-bind="article" /></Carousel></Section>
      <Section title="Промокоды школ" space="s"><LinkGrid :items="fixturePromoLinks" promo /></Section>
      <Section title="Скидки по направлениям" space="s"><LinkGrid :items="fixtureDirections.slice().reverse()" /></Section>
    </main>
    <SiteFooter />
  </div>
</template>
