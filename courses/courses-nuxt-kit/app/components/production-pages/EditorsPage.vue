<script setup lang="ts">
import { fixtureEditors } from '~/data/productionPageFixtures'

const steps = [
  { title: 'Подготовка страницы', description: 'Редакция Хабра отправляет материалы на проверку экспертам, которые работают в нужной профессии.' },
  { title: 'Экспертная оценка', description: 'Эксперты смотрят материал, предлагают изменения или исправления — если они нужны.' },
  { title: 'Обновление контента', description: 'Редакция Хабра вносит изменения по комментариям от экспертов.' },
  { title: 'Публикация', description: 'Согласовываем контент после внесения правок и публикуем на сайте.' }
]
</script>

<template>
  <div class="production-page production-page--experts" data-production-page="editors">
    <PageHero title="Редакция Хабра" description="Познакомьтесь с нашей командой редакторов, которая проверяет каждый курс после экспертной оценки. Смотрит на описание, программу, отзывы — и делает финальный фактчекинг перед публикацией на витрине.">
      <template #header><SiteHeader family="simple" surface="transparent" /></template>
      <template #actions><Button href="#editors">Познакомиться с редакцией</Button><Button variant="secondary" href="/ui/pages/authors">Перейти к экспертам</Button></template>
    </PageHero>
    <main class="production-page__container production-page__stack production-page__stack--compact">
      <section class="production-page__panel production-page__panel--wide production-page__expert-panel">
        <div class="production-page__expert-intro">
          <div><h2 class="production-page__section-title">Проверено теми, кто разбирается</h2><p>Хабр существует с 2006 года, и всё это время мы следим за тем, чтобы сообщество оставалось источником точной и актуальной информации в сферах технологий и IT.</p><p>Сегодня у нас есть команда отраслевых специалистов с глубокой экспертизой, которые проверяют контент, добавляя дополнительный уровень доверия.</p></div>
          <div class="production-page__expert-illustration"><img class="production-page__expert-shield" src="/production-assets/89138b4e0bb3d4a3d268.svg" alt="Редакция Хабра"></div>
        </div>
        <Section title="Как работает редакция" space="m"><CardGrid :columns="4" :tablet-columns="2"><StepCard v-for="step in steps" :key="step.title" v-bind="step" /></CardGrid></Section>
      </section>
      <Section id="editors" title="Редакторы Хабра" space="m"><CardGrid :tablet-columns="3"><PersonCard v-for="person in fixtureEditors" :key="person.name" v-bind="person" /></CardGrid></Section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.production-page--experts{background:var(--crs-white)}
</style>
