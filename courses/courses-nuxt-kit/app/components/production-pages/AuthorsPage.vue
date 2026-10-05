<script setup lang="ts">
import { fixtureExperts } from '~/data/productionPageFixtures'

const steps = [
  { title: 'Подготовка страницы', description: 'Редакция Хабра отправляет материалы на проверку экспертам, которые работают в нужной профессии.' },
  { title: 'Экспертная оценка', description: 'Эксперты смотрят материал, предлагают изменения или исправления — если они нужны.' },
  { title: 'Обновление контента', description: 'Редакция Хабра вносит изменения по комментариям от экспертов.' },
  { title: 'Публикация', description: 'Согласовываем контент после внесения правок и публикуем на сайте.' }
]
</script>

<template>
  <div class="production-page production-page--experts" data-production-page="authors">
    <PageHero title="Эксперты по оценке обучения" description="В Хабре мы серьёзно относимся к качеству контента. Курсы, которые вы видите на наших страницах, проверяют профессионалы из отрасли — они оценивают актуальность материала и честно говорят, если курс не стоит рекомендовать.">
      <template #header><SiteHeader family="simple" surface="transparent" /></template>
      <template #title>Эксперты<br>по оценке обучения</template>
      <template #actions><Button href="#experts">Посмотреть экспертов</Button><Button variant="secondary" href="/ui/pages/editors">Перейти к редакции</Button></template>
    </PageHero>
    <main class="production-page__container production-page__stack production-page__stack--compact">
      <section class="production-page__panel production-page__panel--wide production-page__expert-panel">
        <div class="production-page__expert-intro">
          <div><h2 class="production-page__section-title">Как работает экспертная проверка</h2><p>Мы позаботились, чтобы обучение на нашей витрине оценивали одни из самых крутых ребят в своём деле. Каждый эксперт разбирает курсы по своей сфере и отбирает лучшие — те, что дают качественные знания и актуальный навык.</p><p>Наши эксперты — специалисты уровня middle+ и senior с опытом от 5 лет. Они решают, заслуживает ли курс рекомендации.</p>
            <ul class="production-page__expert-features"><li><span class="production-page__expert-feature-icon"><UIcon name="i-tabler-school" aria-hidden="true" /></span>Эксперты в своей области</li><li><span class="production-page__expert-feature-icon"><UIcon name="i-tabler-user-check" aria-hidden="true" /></span>Принцип честности</li><li><span class="production-page__expert-feature-icon"><UIcon name="i-tabler-circle-check" aria-hidden="true" /></span>Надёжность и точность</li></ul>
          </div>
          <div class="production-page__expert-illustration"><img class="production-page__expert-shield" src="/production-assets/44e315c22ed7f222de49.svg" alt="Эксперты в образовании"></div>
        </div>
        <Section title="Как работают эксперты" space="m"><CardGrid :columns="4" :tablet-columns="2"><StepCard v-for="step in steps" :key="step.title" v-bind="step" /></CardGrid></Section>
      </section>
      <Section id="experts" title="Крутые ребята, которые оценивают обучение" description="Мы внимательно проверяем квалификацию, опыт и репутацию каждого эксперта — чтобы в комиссию попадали только те, кто действительно разбирается в теме." space="m"><CardGrid :tablet-columns="3"><PersonCard v-for="person in fixtureExperts" :key="person.name" v-bind="person" /></CardGrid></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.production-page--experts{background:var(--crs-white)}
</style>
