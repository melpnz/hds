<script setup lang="ts">
type Author = { name: string; role?: string; job?: string; bio?: string; avatar?: string; linkedin?: string; href?: string; qualifications?: string[]; expertise?: string[] }
const props = withDefaults(defineProps<{ title?: string; authors: Author[] }>(), { title: 'Больше об авторах' })
const lead = computed(() => props.authors[0])
const contributors = computed(() => props.authors.slice(1))
</script>

<template>
  <section class="crs-authors">
    <h2>{{ title }}</h2>
    <template v-if="lead">
      <div class="crs-authors__lead">
        <Avatar :src="lead.avatar" :name="lead.name" :size="100" />
        <div>
          <span>{{ lead.role || 'Автор' }}</span>
          <h3>{{ lead.name }}</h3>
          <p>{{ lead.job || 'Эксперт образовательного рынка' }}</p>
          <SocialIcon v-if="lead.linkedin" class="crs-authors__social" :href="lead.linkedin" name="linkedin" label="LinkedIn" />
          <Button class="crs-authors__button" :href="lead.href || '#'">Больше об эксперте</Button>
        </div>
      </div>
      <Prose v-if="lead.bio">{{ lead.bio }}</Prose>
      <div class="crs-authors__facts">
        <div><strong>Регалии/Квалификации:</strong><ul><li v-for="item in lead.qualifications || ['Эксперт образовательных продуктов', 'Практический опыт в отрасли']" :key="item">{{ item }}</li></ul></div>
        <div><strong>Экспертиза:</strong><ul><li v-for="item in lead.expertise || ['Разработка и оценка программ', 'Исследование образовательного рынка']" :key="item">{{ item }}</li></ul></div>
      </div>
    </template>
    <template v-if="contributors.length">
      <hr>
      <div class="crs-authors__contributors">
        <Link v-for="author in contributors" :key="author.name" class="crs-authors__contributor" :href="author.href || '#'" tone="inherit" layout="grid" decoration="none">
          <Avatar :src="author.avatar" :name="author.name" :size="48" />
          <span class="crs-authors__contributor-copy"><small>{{ author.role || 'Редактор' }}</small><strong>{{ author.name }}</strong><small v-if="author.job">{{ author.job }}</small></span>
        </Link>
      </div>
    </template>
    <Button href="#" variant="secondary" block>Посмотреть всех экспертов</Button>
  </section>
</template>

<style scoped>
.crs-authors{display:flex;flex-direction:column;gap:var(--crs-space-24);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-authors h2{margin:0;font:600 var(--crs-font-30)/var(--crs-leading-34) var(--crs-font-family)}
.crs-authors__lead{display:flex;gap:var(--crs-space-20)}
.crs-authors__lead>div{display:flex;flex-direction:column;align-items:flex-start}
.crs-authors__lead span,.crs-authors__lead p{margin:0;color:var(--crs-black-500)}
.crs-authors__lead h3{margin:var(--crs-space-4) 0 0;font:600 var(--crs-font-24)/var(--crs-leading-28) var(--crs-font-family)}
.crs-authors__lead .crs-authors__button{margin-top:var(--crs-space-20)}
.crs-authors__social{margin-top:var(--crs-space-8)}
.crs-authors__facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--crs-space-16)}
.crs-authors__facts>div{display:flex;flex-direction:column;gap:var(--crs-space-8)}
.crs-authors__facts ul{margin:0;padding:0;list-style:none}
.crs-authors hr{width:100%;height:var(--crs-border-1);border:0;background:var(--crs-black-100)}
.crs-authors__contributors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--crs-space-16)}
.crs-authors__contributor{display:grid;grid-template-columns:var(--crs-size-48) minmax(0,1fr);gap:var(--crs-space-12);color:var(--crs-black-850)}
.crs-authors__contributor-copy{display:flex;min-width:0;flex-direction:column}
.crs-authors__contributors small{color:var(--crs-black-500);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}
@media(max-width:767px){.crs-authors__lead{flex-direction:column}.crs-authors__facts,.crs-authors__contributors{grid-template-columns:1fr}}
</style>
