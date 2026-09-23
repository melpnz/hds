<script setup lang="ts">
const props=withDefaults(defineProps<{href?:string;name?:string;label?:string}>(),{href:'#',name:'telegram',label:'Социальная сеть'})
const brand=computed(()=>props.name.includes('linkedin')?'linkedin':props.name.includes('facebook')?'facebook':props.name.includes('instagram')?'instagram':props.name.includes('vk')?'vk':props.name.includes('twitter')||props.name.includes('brand-x')?'twitter':props.name.includes('robot')||props.name.includes('telegram-bot')?'telegram-bot':'telegram')
const source=computed(()=>brand.value==='linkedin'?'/courses/linkedin.svg':`/courses/social/${brand.value}.svg`)
</script>
<template><a class="crs-social" :href="href" :aria-label="label"><img :src="source" alt=""></a></template>
<style scoped>.crs-social{display:block;width:var(--crs-size-24);height:var(--crs-size-24);overflow:hidden;border-radius:var(--crs-radius-full)}.crs-social img{display:block;width:100%;height:100%}.crs-social:hover{opacity:var(--crs-opacity-hover)}.crs-social:focus-visible{outline:var(--crs-border-2) solid var(--crs-black-400);outline-offset:var(--crs-border-2)}</style>
