<script setup lang="ts">
type Item={date:string;title:string;description?:string;logo?:string}
const props=defineProps<{items?:Item[];employment?:Item[];education?:Item[]}>()
const workItems=computed(()=>props.employment ?? props.items ?? [])
const studyItems=computed(()=>props.education ?? [])
</script>
<template><section class="crs-profile-history"><div><h2>Опыт работы</h2><ul><li v-for="item in workItems" :key="`${item.date}-${item.title}`"><EntityLogo :src="item.logo" :label="item.title" :alt="`Логотип: ${item.title}`" :size="48"/><div><strong>{{item.title}}</strong><p v-if="item.description">{{item.description}}</p><time>{{item.date}}</time></div></li></ul></div><div><h2>Образование</h2><ul><li v-for="item in studyItems" :key="`${item.date}-${item.title}`"><EntityLogo :src="item.logo" :label="item.title" :alt="`Логотип: ${item.title}`" :size="48"/><div><strong>{{item.title}}</strong><p v-if="item.description">{{item.description}}</p><time>{{item.date}}</time></div></li><li v-if="!studyItems.length" class="crs-profile-history__empty">Сведения об образовании не указаны</li></ul></div></section></template>
<style scoped>
.crs-profile-history{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--crs-space-16)}
.crs-profile-history>div{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-24)}
.crs-profile-history h2{margin:0;font:600 var(--crs-font-24)/var(--crs-leading-28) var(--crs-font-family)}
.crs-profile-history ul{display:grid;gap:var(--crs-space-24);margin:0;padding:0;list-style:none}
.crs-profile-history li{display:grid;grid-template-columns:var(--crs-size-48) minmax(0,1fr);align-items:start;gap:var(--crs-space-12)}
.crs-profile-history li>div{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-4);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-profile-history strong{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow-wrap:anywhere;font:600 var(--crs-font-16)/1.3 var(--crs-font-family)}
.crs-profile-history p,.crs-profile-history time{margin:0;color:var(--crs-black-500)}
.crs-profile-history__empty{display:block!important;color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
@media(max-width:767px){.crs-profile-history{grid-template-columns:1fr;gap:var(--crs-space-40)}}
</style>
