<script setup lang="ts">
import { fixtureCourses, fixtureRating, fixtureReviews } from '~/data/productionPageFixtures'

import { fixturePromoLinks, fixtureDirections, fixtureTopCourses } from '~/data/productionListingBlocks'

const page = ref(1)

const authors = [
  { name: 'Николай Ширинкин', role: 'Автор', job: 'Менеджер продукта', avatar: '/production-assets/ded056a9123e36c96699.jpg', linkedin: '#linkedin', href: '#author', bio: 'Менеджер продукта в Edtech/HR-tech. За более чем 7 лет работы создал и масштабировал цифровые продукты.', qualifications: ['Product owner', 'Менеджмент, управление персоналом'], expertise: ['Разработка и запуск продукта', 'Продуктовая аналитика'] },
  { name: 'Анастасия Сичкаренко', role: 'Редактор', job: 'Редактор Хабра', avatar: '/production-assets/c088b5b1a4cf9640505d.png' },
  { name: 'Елена Лучина', role: 'Аудитор', job: 'Старший аккаунт-менеджер Хабр Образования', avatar: '/production-assets/92d18fe9d00323fbc01f.png' }
]



</script>

<template>
  <div class="production-page" data-production-page="courses-listing">
    <SiteHeader family="courses" level="hero" />

    <main class="production-page__container production-page__stack">
      <AdSlot class="production-page__ad" />

      <div>
        <CardGrid :tablet-columns="3">
          <CourseCard v-for="course in fixtureCourses" :key="course.title" v-bind="course" />
        </CardGrid>
        <Pagination v-model="page" class="production-page__pagination" :total="5" />
      </div>

      <AuthorsBlock :authors="authors" />
      <hr class="production-page__separator">

      <Section title="Отзывы об онлайн-школах" space="s">
        <Carousel variant="review-card" loop>
          <ReviewCard
            v-for="review in fixtureReviews"
            :key="review.author"
            v-bind="review"
            :rating="5"
            verified
          />
        </Carousel>
      </Section>

      <Section title="Промокоды и акции" space="s">
        <LinkGrid :items="fixturePromoLinks" promo />
      </Section>

      <Section title="Популярные направления" space="s">
        <LinkGrid :items="fixtureDirections" />
      </Section>

      <Section title="ТОП онлайн-курсов" space="s">
        <div class="production-page__ranked">
          <NumberedCourseItem v-for="(course, index) in fixtureTopCourses" :key="course.title" v-bind="course" :number="index + 1" />
        </div>
      </Section>

      <Section title="Рейтинг лучших школ 2026" space="s">
        <RatingTable :rows="fixtureRating" />
      </Section>
    </main>

    <SiteFooter />
  </div>
</template>
