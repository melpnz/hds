<script setup lang="ts">
type FooterLinkId = 'habr' | 'qna' | 'career' | 'courses' | 'schools' | 'rating' | 'promocodes' | 'agreement' | 'terms' | 'sitemap' | 'twitter' | 'facebook' | 'vk' | 'instagram' | 'telegram' | 'telegramBot' | 'copyright'
const props = withDefaults(defineProps<{product?:string;year?:number;linkHrefs?:Partial<Record<FooterLinkId,string>>}>(),{product:'Курсы',year:new Date().getFullYear(),linkHrefs:()=>({})})
const href = (id: FooterLinkId) => props.linkHrefs[id] ?? '#'
const projects=[{label:'Хабр',service:'habr'},{label:'Q&A',service:'qna'},{label:'Карьера',service:'career'},{label:'Курсы',service:'courses'}] as const
const primary=[{id:'schools',label:'Список онлайн-школ'},{id:'rating',label:'Рейтинг онлайн-школ'},{id:'promocodes',label:'Промокоды и скидки'},{id:'agreement',label:'Соглашение с пользователем'}] as const
const legal=[{id:'terms',label:'Правила оказания услуг'},{id:'sitemap',label:'Карта сайта'}] as const
const socials=[{id:'twitter',name:'i-tabler-brand-x',label:'Twitter'},{id:'facebook',name:'i-tabler-brand-facebook',label:'Facebook'},{id:'vk',name:'i-tabler-brand-vk',label:'ВКонтакте'},{id:'instagram',name:'i-tabler-brand-instagram',label:'Instagram'},{id:'telegram',name:'i-tabler-brand-telegram',label:'Telegram'},{id:'telegramBot',name:'i-tabler-robot',label:'Telegram-бот'}] as const
</script>
<template><footer class="crs-footer"><div class="crs-container crs-footer__grid"><ul class="crs-footer__projects"><li v-for="item in projects" :key="item.service"><ServiceLogo :service="item.service" /><Link class="crs-footer__link" :href="href(item.service)" tone="inherit">{{item.label}}</Link></li></ul><ul><li v-for="item in primary" :key="item.id"><Link class="crs-footer__link" :href="href(item.id)" tone="inherit">{{item.label}}</Link></li></ul><ul><li v-for="item in legal" :key="item.id"><Link class="crs-footer__link" :href="href(item.id)" tone="inherit">{{item.label}}</Link></li></ul><div class="crs-footer__end"><div class="crs-footer__socials"><SocialIcon v-for="item in socials" :key="item.id" :name="item.name" :label="item.label" :href="href(item.id)"/></div><Link class="crs-footer__copyright" :href="href('copyright')" muted>© Habr, {{year}}</Link></div><slot/></div></footer></template>
<style scoped>
.crs-footer{background:var(--crs-black-50);padding:var(--crs-space-32,var(--crs-size-32)) 0 var(--crs-space-40);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-footer__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--crs-space-16)}
.crs-footer ul{display:flex;flex-direction:column;gap:var(--crs-space-8);margin:0;padding:0;list-style:none}
.crs-footer li{display:flex;align-items:center;gap:var(--crs-space-8)}
.crs-footer__link:hover{text-decoration:underline}
.crs-footer__projects span{display:grid;width:var(--crs-size-24);height:var(--crs-size-24);place-items:center;border-radius:var(--crs-radius-6);color:var(--crs-white);font-size:var(--crs-font-12);font-weight:600}
.crs-footer__end{display:flex;flex-direction:column;align-items:flex-end}
.crs-footer__copyright{margin-top:auto;color:var(--crs-black-500)}
.crs-footer__socials{display:flex;flex-wrap:wrap;justify-content:flex-end;max-width:100%;gap:var(--crs-space-8)}
@media(max-width:1023px) and (min-width:480px){.crs-footer__grid{grid-template-columns:repeat(3,minmax(0,1fr))}.crs-footer__grid>ul:nth-of-type(2),.crs-footer__grid>ul:nth-of-type(3){grid-column:2}.crs-footer__end{grid-column:3;grid-row:1}}
@media(max-width:479px){.crs-footer{padding-block:var(--crs-space-24)}.crs-footer__grid{grid-template-columns:1fr;gap:var(--crs-space-24)}.crs-footer ul{gap:var(--crs-space-12)}.crs-footer__end{align-items:flex-start;gap:var(--crs-space-24)}.crs-footer__copyright{margin-top:0}.crs-footer__socials{justify-content:flex-start;gap:var(--crs-space-12)}}
</style>
