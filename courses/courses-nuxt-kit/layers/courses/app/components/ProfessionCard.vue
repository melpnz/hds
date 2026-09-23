<script setup lang="ts">
withDefaults(defineProps<{ title: string; salary?: string; image?: string; tags?: string[]; salaryLabel?: string }>(), { salary: 'от 120 000 ₽', image: '/courses/content-placeholder.svg', tags: () => ['Разработка', 'Аналитика'], salaryLabel: 'Средняя зарплата' })
</script>

<template>
  <article class="crs-profession-card">
    <img class="crs-profession-card__cover" :src="image" :alt="`Профессия ${title}`">
    <div class="crs-profession-card__body"><div><h3>{{ title }}</h3><div class="crs-profession-card__tags"><Chip v-for="tag in tags" :key="tag">{{ tag }}</Chip></div></div><div class="crs-profession-card__salary"><span>{{ salaryLabel }}</span><strong>{{ salary }}</strong></div></div>
  </article>
</template>

<style scoped>
.crs-profession-card{box-sizing:border-box;display:flex;width:100%;max-width:calc(var(--crs-unit) * 235);min-height:calc(var(--crs-unit) * 342);flex-direction:column;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-150);border-radius:var(--crs-radius-24);background:var(--crs-white)}.crs-profession-card__cover{display:block;width:100%;height:calc(var(--crs-unit) * 148);flex:none;margin-bottom:calc(var(--crs-unit) * -20);object-fit:cover}.crs-profession-card__body{position:relative;display:flex;flex:1;flex-direction:column;gap:var(--crs-space-16);border-radius:var(--crs-radius-24) var(--crs-radius-24) 0 0;background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850)}.crs-profession-card h3{display:-webkit-box;overflow:hidden;margin:0;font:600 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);-webkit-box-orient:vertical;-webkit-line-clamp:2}.crs-profession-card__tags{display:flex;flex-wrap:wrap;gap:var(--crs-space-4);margin-top:var(--crs-space-8)}.crs-profession-card__salary{display:flex;flex:1;flex-direction:column;justify-content:flex-end;gap:var(--crs-space-4)}.crs-profession-card__salary span{color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-profession-card__salary strong{font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}@media(max-width:479px){.crs-profession-card{max-width:none}}
</style>
<style scoped>@media(max-width:767px){.crs-profession-card{max-width:none}}</style>
