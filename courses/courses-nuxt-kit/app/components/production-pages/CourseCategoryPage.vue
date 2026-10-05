<script setup lang="ts">
import { fixtureCourses, fixtureRating, fixtureReviews } from '~/data/productionPageFixtures'
import { fixturePromoLinks } from '~/data/productionListingBlocks'
import { fixtureCategoryDirections } from '~/data/productionCategoryDirections'

const page = ref(1)
const contributorsOpen = ref(false)
const verificationOpen = ref(false)
const contributors = [
  { name: 'Николай Ширинкин', role: 'Автор', job: 'Менеджер продукта', avatar: '/production-assets/ded056a9123e36c96699.jpg' },
  { name: 'Виктория Гонгина', role: 'Редактор', job: 'Старший редактор-эксперт', avatar: '/production-assets/c353ae1379186a087acc.png' },
  { name: 'Елена Лучина', role: 'Аудитор', job: 'Старший Аккаунт-менеджер Хабр Образования', avatar: '/production-assets/92d18fe9d00323fbc01f.png' }
]
const authors = contributors.map((person, index) => ({ ...person, bio: index ? undefined : 'Эксперт по образовательным и карьерным продуктам.', href: '#author' }))
</script>

<template>
  <div class="production-page" data-production-page="course-category">
    <SiteHeader
      family="courses"
      level="page"
      title="Курсы по ChatGPT"
      :breadcrumbs="[{ label: 'Все курсы', href: '#' }, { label: 'Курсы по направлению Нейросети и AI', href: '#' }, { label: 'Курсы по ChatGPT' }]"
      :contributors="contributors"
      verified
      updated-at="30.09.2026"
      updated-date-time="2026-09-30"
      @open-contributors="contributorsOpen = true"
      @open-verification="verificationOpen = true"
    />
    <main class="production-page__container production-page__stack production-page__stack--listing">
      <div>
        <CardGrid :tablet-columns="3"><CourseCard v-for="course in fixtureCourses" :key="course.title" v-bind="course" /></CardGrid>
        <Pagination v-model="page" class="production-page__pagination" :total="5" />
      </div>
      <AuthorsBlock :authors="authors" />
      <hr class="production-page__separator">
      <Section title="Отзывы об онлайн-школах" space="s">
        <Carousel variant="review-card" loop><ReviewCard v-for="review in fixtureReviews" :key="review.author" v-bind="review" :rating="5" verified /></Carousel>
      </Section>
      <Section title="Промокоды и акции" space="s"><LinkGrid :items="fixturePromoLinks" promo /></Section>
      <Section title="Другие направления нейросетей" space="s"><LinkGrid :items="fixtureCategoryDirections" /></Section>
      <Section title="Популярные курсы по нейросетям" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(0, 5)" :key="course.title" v-bind="course" /></Carousel></Section>
      <Section title="Бесплатные курсы" space="s"><Carousel variant="course-card" loop><CourseCard v-for="course in fixtureCourses.slice(2, 7)" :key="course.title" v-bind="course" price="Бесплатно" /></Carousel></Section>
      <Section title="ТОП онлайн-курсов" space="s"><div class="production-page__ranked"><NumberedCourseItem v-for="(course, index) in fixtureCourses.slice(0, 3)" :key="course.title" :number="index + 1" :title="course.title" :school="course.school" :price="course.price" /></div></Section>
      <Section title="Рейтинг лучших школ 2026" space="s"><RatingTable :rows="fixtureRating" /></Section>
    </main>
    <SiteFooter />
    <Modal v-model="contributorsOpen" title="Кто работал над этой страницей?">
      <p class="production-page__dialog-intro">Эксперты, которые создали и проверили контент на этой странице.</p>
      <div v-for="person in contributors" :key="person.name" class="production-page__contributor-dialog-row">
        <Avatar :src="person.avatar" :name="person.name" :size="48" />
        <div class="production-page__contributor-dialog-info"><small>{{ person.role }}</small><div>{{ person.name }}</div><span>{{ person.job }}</span></div>
      </div>
      <template #footer>
        <div class="production-page__dialog-actions">
          <Button href="/ui/pages/authors" block>Узнать больше про экспертов</Button>
          <Button variant="secondary" block @click="contributorsOpen = false">Закрыть</Button>
        </div>
      </template>
    </Modal>
    <Modal v-model="verificationOpen" title="Что значит «Проверено»?">
      <div class="production-page__verification-copy">
        <p>Эксперт с опытом в соответствующей сфере проверил актуальность программы и содержание обучения.</p>
        <p>Затем редакторы Хабра сверили название, программу, цену и условия с информацией онлайн-школы.</p>
        <p>Отметка «Проверено» появляется после обеих проверок.</p>
      </div>
      <template #footer>
        <div class="production-page__dialog-actions">
          <Button href="/ui/pages/authors" block>Узнать больше про экспертов</Button>
          <Button variant="secondary" block @click="verificationOpen = false">Закрыть</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.production-page__contributor-dialog-row{display:flex;align-items:center;gap:var(--crs-space-12)}
.production-page__contributor-dialog-row small{color:var(--crs-black-500)}
.production-page__contributor-dialog-info{display:grid;gap:var(--crs-space-2);min-width:0}
.production-page__contributor-dialog-info>span{color:var(--crs-black-500)}
.production-page__dialog-intro{margin:0;color:var(--crs-black-850)}
.production-page__verification-copy{display:grid;gap:var(--crs-space-12);font-size:var(--crs-font-16);line-height:1.625}
.production-page__verification-copy p{margin:0}
.production-page__dialog-actions{display:flex;flex-direction:column;gap:var(--crs-space-8)}
</style>
