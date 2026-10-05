<script setup lang="ts">
import { productionPages } from '~/data/productionPages'

const route = useRoute()
const page = computed(() => productionPages.find(item => item.id === String(route.params.id)))

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Страница не найдена' })
}

</script>

<template>
  <ProductionPagesCoursesListingPage v-if="page?.id === 'courses-listing'" />
  <ProductionPagesCourseCategoryPage v-else-if="page?.id === 'course-category'" />
  <ProductionPagesEducationCentersListingPage v-else-if="page?.id === 'education-centers-listing'" />
  <ProductionPagesRatingPage v-else-if="page?.id === 'rating'" />
  <ProductionPagesEducationCenterPage v-else-if="page?.id === 'education-center'" />
  <ProductionPagesReviewsPage v-else-if="page?.id === 'reviews'" />
  <ProductionPagesReviewDetailPage v-else-if="page?.id === 'review-detail'" />
  <ProductionPagesPromocodesPage v-else-if="page?.id === 'promocodes'" />
  <ProductionPagesPromocodeDetailPage v-else-if="page?.id === 'promocode-detail'" />
  <ProductionPagesAuthorsPage v-else-if="page?.id === 'authors'" />
  <ProductionPagesEditorsPage v-else-if="page?.id === 'editors'" />
  <ProductionPagesAuthorPage v-else-if="page?.id === 'author'" />
</template>
