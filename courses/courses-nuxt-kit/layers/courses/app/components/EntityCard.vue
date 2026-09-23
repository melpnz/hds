<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  image?: string
  href?: string
  price?: string
  rating?: number
  logo?: string
  action?: string
}>(), { href: '#', action: 'Подробнее' })
</script>

<template>
  <article class="crs-entity-card">
    <img v-if="image" class="crs-entity-card__image" :src="image" alt="">
    <div class="crs-entity-card__body">
      <div class="crs-entity-card__top"><EntityLogo v-if="logo" :src="logo" :label="title" size="s" /><span v-if="eyebrow">{{ eyebrow }}</span><RatingBadge v-if="rating" class="crs-entity-card__rating" :value="rating" /></div>
      <h3><Link class="crs-entity-card__title-link" :href="href" tone="inherit">{{ title }}</Link></h3>
      <p v-if="description">{{ description }}</p>
      <div class="crs-entity-card__meta"><slot name="meta" /></div>
      <div class="crs-entity-card__footer"><strong v-if="price">{{ price }}</strong><Button block>{{ action }}</Button></div>
    </div>
  </article>
</template>

<style scoped>.crs-entity-card{box-sizing:border-box;display:flex;width:100%;max-width:var(--crs-size-260);min-height:var(--crs-size-320);flex-direction:column;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);transition:border-color var(--crs-duration-fast)}.crs-entity-card:hover{border-color:var(--crs-black-150)}.crs-entity-card__image{display:block;width:100%;height:calc(var(--crs-unit) * 148);object-fit:cover}.crs-entity-card__body{display:flex;flex:1;flex-direction:column;gap:var(--crs-space-12);padding:var(--crs-space-24)}.crs-entity-card__top{display:flex;align-items:center;gap:var(--crs-space-8);color:var(--crs-black-500);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}.crs-entity-card__rating{margin-left:auto}.crs-entity-card h3{margin:0;font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}.crs-entity-card__title-link:focus-visible{border-radius:var(--crs-radius-4);outline:var(--crs-border-2) solid var(--crs-black-400)}.crs-entity-card p{margin:0;color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-entity-card__meta{display:flex;flex-wrap:wrap;gap:var(--crs-space-4)}.crs-entity-card__footer{display:grid;gap:var(--crs-space-12);margin-top:auto;padding-top:var(--crs-space-8)}.crs-entity-card__footer strong{font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}</style>
