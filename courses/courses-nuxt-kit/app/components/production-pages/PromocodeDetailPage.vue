<script setup lang="ts">
import { fixtureArticles, fixtureCourses, fixtureDirections, fixtureYandexPromos, fixtureYandexCodePromos, fixtureYandexExpiredPromos } from '~/data/productionPageFixtures'
import { fixturePromoLinks } from '~/data/productionListingBlocks'
import { promocodeSearchFields } from '~/data/promocodeSearchFields'

const searchValues = ref<Record<string, string>>({ organization: 'yandex' })
const searchOpen = ref(false)
const searchSummary = computed(() => ({
  title: promocodeSearchFields[0]!.options.find(option => option.value === (searchValues.value.organization || ''))!.label,
  details: promocodeSearchFields.slice(1).map(field => field.options.find(option => option.value === (searchValues.value[field.name] || ''))!.label)
}))
</script>

<template>
  <div class="production-page" data-production-page="promocode-detail">
    <div class="production-page__promo-search-header">
    <SiteHeader family="simple" surface="transparent" />
    <section class="production-page__compact-search">
      <div class="production-page__container">
        <SearchForm v-model:values="searchValues" :fields="promocodeSearchFields" submit-label="Найти промокоды" :summary="searchOpen ? undefined : searchSummary" @open-summary="searchOpen = true" @submit="searchOpen = false" />
      </div>
    </section>
    </div>
    <main class="production-page__container production-page__stack">
      <Section title="Яндекс Практикум: промокоды и акции" space="s"><CardGrid :tablet-columns="3"><PromoCard v-for="(promo, index) in [...fixtureYandexPromos, ...fixtureYandexCodePromos, ...fixtureYandexExpiredPromos]" :key="index" v-bind="promo" /></CardGrid></Section>
      <Section title="Популярные курсы школы" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" school="Яндекс Практикум" /></Carousel></Section>
      <Section title="Журнал" space="s"><Carousel variant="article-card" loop><ArticleCard v-for="article in fixtureArticles" :key="article.title" v-bind="article" /></Carousel></Section>
      <Section title="Промокоды других школ" space="s"><LinkGrid :items="fixturePromoLinks" promo /></Section>
      <Section title="Скидки по направлениям" space="s"><LinkGrid :items="fixtureDirections.slice().reverse()" /></Section>
      <Section title="Промокоды и скидки Яндекс Практикума" space="s"><Prose>Актуальные предложения школы, условия применения кодов и сроки действия акций собраны на одной странице.</Prose></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.production-page__promo-search-header{background:var(--crs-gradient-second)}
.production-page__promo-search-header .production-page__compact-search{background:transparent}
</style>
