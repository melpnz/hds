<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  school?: string
  description?: string
  price?: string
  originalPrice?: string
  discount?: string
  rating?: number
  reviews?: number
  duration?: string
  tags?: string[]
  href?: string
  image?: string
  logo?: string
}>(), {
  school: 'Нетология',
  price: 'от 4 223 ₽/мес',
  originalPrice: 'или сразу 129 200 ₽',
  discount: '-50%',
  rating: 4.75,
  reviews: 6,
  duration: '18 мес',
  tags: () => ['1С разработка', 'Git', 'Microsoft Excel'],
  href: '#',
  image: '/courses/catalog/development.png'
})
</script>

<template>
  <article class="crs-course-card">
    <div class="crs-course-card__cover">
      <img :src="image" :alt="`Обложка курса ${title}`">
    </div>
    <div class="crs-course-card__body">
      <div class="crs-course-card__floating">
        <RatingBadge :value="rating" :reviews="reviews" />
        <Chip tone="surface">{{ duration }}</Chip>
      </div>
      <div class="crs-course-card__school">
        <EntityLogo :src="logo" :label="school" size="s" />
        <strong>{{ school }}</strong>
      </div>
      <h3><Link class="crs-course-card__title-link" :href="href" tone="inherit">{{ title }}</Link></h3>
      <div class="crs-course-card__tags">
        <Chip v-for="tag in tags" :key="tag" class="crs-course-card__tag">{{ tag }}</Chip>
        <Chip v-if="tags.length > 2" class="crs-course-card__more">+{{ tags.length + 6 }}</Chip>
      </div>
      <div class="crs-course-card__price">
        <div><strong>{{ price }}</strong><Chip v-if="discount" tone="orange" size="s">{{ discount }}</Chip></div>
        <small v-if="originalPrice">{{ originalPrice }}</small>
      </div>
      <Button class="crs-course-card__action" block>Далее</Button>
    </div>
  </article>
</template>

<style scoped>
.crs-course-card{position:relative;container-type:inline-size;box-sizing:border-box;display:flex;width:100%;max-width:var(--crs-size-260);min-height:calc(var(--crs-unit) * 418);flex-direction:column;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);color:var(--crs-black-850)}.crs-course-card__cover{position:relative;height:calc(var(--crs-unit) * 148);flex:none;background:var(--crs-white)}.crs-course-card__cover:after{position:absolute;inset:0;background:var(--crs-overlay-subtle);content:""}.crs-course-card__cover img{display:block;width:100%;height:100%;object-fit:cover}.crs-course-card__body{position:relative;display:flex;flex:1;flex-direction:column;margin-top:calc(var(--crs-unit) * -20);border-radius:var(--crs-radius-24) var(--crs-radius-24) 0 0;background:var(--crs-white);padding:var(--crs-space-24)}.crs-course-card__floating{position:absolute;top:calc(var(--crs-unit) * -34);left:var(--crs-space-10);display:flex;gap:var(--crs-space-4)}.crs-course-card__school{display:flex;min-width:0;align-items:center;gap:var(--crs-space-8);white-space:nowrap}.crs-course-card__school strong{overflow:hidden;text-overflow:ellipsis;font:600 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-course-card h3{display:-webkit-box;overflow:hidden;margin:var(--crs-space-12) 0 0;font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);-webkit-box-orient:vertical;-webkit-line-clamp:2}.crs-course-card__title-link:focus-visible{border-radius:var(--crs-radius-4);outline:var(--crs-border-2) solid var(--crs-black-400)}.crs-course-card__tags{display:flex;flex-wrap:wrap;gap:var(--crs-space-4);margin-top:var(--crs-space-12)}.crs-course-card__tag{max-width:calc(100% - var(--crs-space-48));overflow:hidden;text-overflow:ellipsis}.crs-course-card__tag:nth-child(n+3){display:none}.crs-course-card__price{display:flex;flex-direction:column;gap:var(--crs-space-2);margin-top:auto;padding-top:var(--crs-space-20)}.crs-course-card__price>div{display:flex;flex-wrap:wrap;align-items:center;gap:var(--crs-space-8)}.crs-course-card__price strong{font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}.crs-course-card__price small{color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-course-card__action{margin-top:var(--crs-space-16)}@container(min-width:360px){.crs-course-card__tag:nth-child(3){display:inline-flex}}
</style>
<style scoped>
.crs-course-card__cover{height:calc(100cqw * 148 / 260);aspect-ratio:auto}
@media(max-width:767px){.crs-course-card{max-width:none}}
</style>
