<script setup lang="ts">
withDefaults(defineProps<{ title: string; company?: string; salary?: string; logo?: string; tags?: string[] }>(), { company: 'Компания', salary: 'Зарплата не указана', tags: () => ['Удалённо', 'Middle'] })
</script>

<template>
  <article class="crs-vacancy-card">
    <div class="crs-vacancy-card__main"><div class="crs-vacancy-card__school"><EntityLogo :src="logo" :label="company" :size="32" /><strong>{{ company }}</strong></div><h3>{{ title }}</h3><div class="crs-vacancy-card__tags"><Chip v-for="tag in tags" :key="tag">{{ tag }}</Chip></div></div>
    <strong class="crs-vacancy-card__salary">{{ salary }}</strong>
    <Button block>Откликнуться</Button>
  </article>
</template>

<style scoped>
.crs-vacancy-card{box-sizing:border-box;display:flex;width:100%;max-width:calc(var(--crs-unit) * 207);min-height:calc(var(--crs-unit) * 354);flex-direction:column;gap:var(--crs-space-16);border:var(--crs-border-1) solid var(--crs-black-150);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850)}.crs-vacancy-card__main{display:flex;flex-direction:column;gap:var(--crs-space-12)}.crs-vacancy-card__school{display:flex;min-width:0;align-items:center;gap:var(--crs-space-8)}.crs-vacancy-card__school strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-vacancy-card h3{margin:0;font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family)}.crs-vacancy-card__tags{display:flex;flex-wrap:wrap;gap:var(--crs-space-4)}.crs-vacancy-card__salary{display:flex;flex:1;align-items:flex-end;color:var(--crs-black-500);font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}@media(max-width:479px){.crs-vacancy-card{max-width:none}}
</style>
<style scoped>@media(max-width:767px){.crs-vacancy-card{max-width:none}}</style>
