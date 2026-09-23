<script setup lang="ts">
withDefaults(defineProps<{ author:string; text:string; rating?:number; date?:string; course?:string; href?:string }>(), {
  rating: 5, date: '4 сентября', course: 'Профессия авитолог: специалист по рекламе и продажам на Авито', href: '#'
})
</script>

<template>
  <article class="crs-review-card">
    <header><Avatar class="crs-review-card__avatar" src="/courses/avatar-default-user.svg" :name="author" size="m" /><div><strong>{{ author }}</strong><small>Пользователь <span class="crs-review-card__verified">Хабра <img src="/courses/green-partner-icon.svg" alt="Проверенный пользователь"></span></small></div></header>
    <div class="crs-review-card__rating"><RatingBadge :value="rating" variant="stars" /><time>{{ date }}</time></div>
    <Link class="crs-review-card__course" href="#" tone="inherit" layout="block"><Chip class="crs-review-card__chip" tone="neutral" truncate><span>{{ course }}</span></Chip></Link>
    <div class="crs-review-card__text"><p><strong>Достоинства:</strong> {{ text }}</p><span aria-hidden="true" /><Link class="crs-review-card__more" as="button">Читать полностью</Link></div>
    <Link class="crs-review-card__link" :href="href" :aria-label="`Отзыв ${author}`" tone="inherit" layout="block" />
  </article>
</template>

<style scoped>
.crs-review-card{display:flex;flex-direction:column}
.crs-review-card__text{flex:1}
.crs-review-card__text>span{height:var(--crs-size-100)!important;background:linear-gradient(180deg,transparent 0%,color-mix(in srgb,var(--crs-white) 35%,transparent) 32%,color-mix(in srgb,var(--crs-white) 78%,transparent) 66%,var(--crs-white) 100%)!important}
</style>

<style scoped>
.crs-review-card{position:relative;box-sizing:border-box;width:var(--crs-size-260);min-height:calc(var(--crs-unit) * 503);overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850)}.crs-review-card header{display:grid;grid-template-columns:var(--crs-space-48) 1fr;align-items:start;gap:var(--crs-space-12)}.crs-review-card__avatar{width:var(--crs-size-48);height:var(--crs-size-48)}.crs-review-card header>div{display:grid;gap:var(--crs-space-4)}.crs-review-card header strong{font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}.crs-review-card header small{color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-review-card header small svg{display:inline;width:var(--crs-size-20);height:var(--crs-size-20);color:var(--crs-green-500);vertical-align:middle}.crs-review-card__rating{display:flex;align-items:center;gap:var(--crs-space-8);margin-top:var(--crs-space-16)}.crs-review-card__rating>span{display:flex}.crs-review-card__rating svg{width:var(--crs-size-24);height:var(--crs-size-24);color:var(--crs-yellow-500)}.crs-review-card__rating time{color:var(--crs-black-500);font-size:var(--crs-font-12)}.crs-review-card__course{position:relative;z-index:2;display:block;width:max-content;max-width:100%;margin-top:var(--crs-space-16);color:var(--crs-black-850);text-decoration:none}.crs-review-card__course:hover{text-decoration:none}.crs-review-card__chip{box-sizing:border-box;max-width:100%}.crs-review-card__course:hover .crs-review-card__chip{background:var(--crs-black-100)}.crs-review-card__text{position:relative;margin-top:var(--crs-space-16);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-review-card__text p{max-height:calc(var(--crs-unit) * 258);overflow:hidden;margin:0}.crs-review-card__text>span{position:absolute;right:0;bottom:var(--crs-space-20);left:0;height:var(--crs-size-60);background:linear-gradient(180deg,transparent,var(--crs-white))}.crs-review-card__more{position:absolute;z-index:2;bottom:0;left:0;width:100%;border:0;background:var(--crs-white);padding:var(--crs-space-8) 0 0;color:var(--crs-blue-500);text-align:left;cursor:pointer}.crs-review-card__link{position:absolute;inset:0}.crs-review-card:hover{border-color:var(--crs-black-300)}
.crs-review-card__rating>span,.crs-review-card__rating .iconify{color:var(--crs-yellow-500)}.crs-review-card header small{color:var(--crs-black-500)}.crs-review-card header small .iconify{color:var(--crs-green-500)}
.crs-review-card__verified{display:inline-flex;align-items:center;gap:var(--crs-space-2);white-space:nowrap}.crs-review-card header small img{display:block;width:calc(var(--crs-unit) * 18);height:calc(var(--crs-unit) * 18)}@media(max-width:479px){.crs-review-card{width:100%}}
</style>
<style scoped>@media(max-width:767px){.crs-review-card{width:100%}}</style>
