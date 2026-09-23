<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  rating?: number
  reviews?: number
  students?: number
  href?: string
  logo?: string
  image?: string
}>(), { rating: 4.55, reviews: 1419, students: 18070, href: '#', image: '/courses/content-placeholder.svg' })
</script>

<template>
  <article class="crs-school-card">
    <div class="crs-school-card__cover">
      <img :src="image" :alt="`Обложка ${title}`">
    </div>
    <div class="crs-school-card__body">
      <EntityLogo class="crs-school-card__logo" :src="logo" :label="title" size="m" />
      <RatingBadge class="crs-school-card__rating" :value="rating" :reviews="reviews" size="m" />
      <h3><Link class="crs-school-card__title-link" :href="href" tone="inherit">{{ title }}</Link></h3>
      <div class="crs-school-card__people"><AvatarStack :items="[{ name: 'Анна' }, { name: 'Иван' }, { name: 'Мария' }]" :limit="3" /><Chip class="crs-school-card__students" variant="counter">+{{ students }}</Chip></div>
      <Button class="crs-school-card__action" block>Подробнее</Button>
    </div>
  </article>
</template>

<style scoped>
.crs-school-card{box-sizing:border-box;width:100%;max-width:var(--crs-size-260);min-height:calc(var(--crs-unit) * 318);overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);color:var(--crs-black-850)}.crs-school-card__cover{height:var(--crs-size-112);background:var(--crs-white)}.crs-school-card__cover>img{display:block;width:100%;height:100%;object-fit:cover}.crs-school-card__cover>div{display:grid;width:100%;height:100%;place-items:center;background:linear-gradient(135deg,var(--crs-placeholder-soft-start),var(--crs-placeholder-soft-end));color:var(--crs-blue-500)}.crs-school-card__cover svg{width:var(--crs-size-56);height:var(--crs-size-56)}.crs-school-card__body{position:relative;display:flex;min-height:calc(calc(var(--crs-unit) * 316) - var(--crs-size-112));flex-direction:column;align-items:flex-start;padding:var(--crs-space-32) var(--crs-space-24) var(--crs-space-24)}.crs-school-card__logo{position:absolute;z-index:2;top:calc(var(--crs-unit) * -20);border:var(--crs-border-2) solid var(--crs-white);background:var(--crs-white)}.crs-school-card__rating{margin-bottom:var(--crs-space-8)}.crs-school-card h3{display:-webkit-box;overflow:hidden;margin:0 0 var(--crs-space-16);font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family);-webkit-box-orient:vertical;-webkit-line-clamp:3}.crs-school-card__title-link:focus-visible{border-radius:var(--crs-radius-4);outline:var(--crs-border-2) solid var(--crs-black-400)}.crs-school-card__people{display:flex;align-items:center;margin-bottom:var(--crs-space-16)}.crs-school-card__students{margin-left:calc(var(--crs-space-6) * -1);color:var(--crs-black-500)}.crs-school-card__action{margin-top:auto}
</style>
<style scoped>.crs-school-card__body{min-height:calc(calc(var(--crs-unit) * 312) - var(--crs-size-112))}@media(max-width:479px){.crs-school-card{max-width:none}}</style>
<style scoped>@media(max-width:767px){.crs-school-card{max-width:none}}</style>
