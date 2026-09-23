<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  logo?: string
  cover?: string
  rating?: number
  reviews?: number
  graduates?: number
}>(), {
  cover: '/courses/content-placeholder.svg',
  rating: 4.55,
  reviews: 1419,
  graduates: 18073
})

const expanded = ref(false)
const hasLongDescription = computed(() => (props.description?.length ?? 0) > 180)
</script>

<template>
  <header class="crs-entity-header">
    <img class="crs-entity-header__cover" :src="cover" alt="Обложка образовательной организации">
    <div class="crs-entity-header__body">
      <EntityLogo class="crs-entity-header__logo" :src="logo" :label="title" :size="100" />
      <div class="crs-entity-header__content">
        <h1>{{ title }}</h1>
        <div class="crs-entity-header__meta">
          <RatingBadge class="crs-entity-header__rating" :value="rating" :reviews="reviews" size="m" />
          <i aria-hidden="true">•</i><span>{{ graduates }} выпускников</span>
        </div>
        <div v-if="description" class="crs-entity-header__description">
          <p :data-expanded="expanded">{{ description }}</p>
          <Link v-if="hasLongDescription" class="crs-entity-header__more" as="button" @click="expanded = !expanded">{{ expanded ? 'Свернуть' : 'Подробнее' }}</Link>
        </div>
        <slot />
      </div>
    </div>
  </header>
</template>

<style scoped>
.crs-entity-header{display:grid;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white)}
.crs-entity-header__cover{display:block;width:100%;height:var(--crs-size-208);background:var(--crs-white);object-fit:cover}
.crs-entity-header__body{position:relative;display:flex;align-items:center;gap:var(--crs-space-20);padding:var(--crs-space-24)}
.crs-entity-header__logo{width:var(--crs-size-100)!important;height:var(--crs-size-100)!important;border-radius:var(--crs-radius-24)!important}
.crs-entity-header__content{display:flex;min-width:0;flex:1;flex-direction:column;gap:var(--crs-space-8)}
.crs-entity-header h1{margin:0;font:600 var(--crs-font-30)/var(--crs-leading-34) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}
.crs-entity-header__meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--crs-space-8);color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-entity-header__meta i{font-style:normal}
.crs-entity-header__description{display:flex;align-items:flex-end;gap:var(--crs-space-8);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-entity-header__description p{display:-webkit-box;min-width:0;max-width:calc(100% - var(--crs-size-70));overflow:hidden;margin:0;overflow-wrap:anywhere;-webkit-box-orient:vertical;-webkit-line-clamp:1}.crs-entity-header__description p[data-expanded="true"]{display:block;max-width:none}.crs-entity-header__more{flex:none;border:0;background:transparent;padding:0;color:var(--crs-blue-500);font:inherit;cursor:pointer}.crs-entity-header__more:hover{color:var(--crs-blue-600)}
@media(max-width:767px){.crs-entity-header{margin-inline:calc(var(--crs-gutter) * -1);border:0;border-radius:var(--crs-radius-0)}.crs-entity-header__cover{height:var(--crs-size-150)}.crs-entity-header__body{align-items:flex-start;padding:var(--crs-space-40) var(--crs-space-24) 0}.crs-entity-header__logo{position:absolute;top:calc(var(--crs-size-70) * -.657);width:var(--crs-size-70)!important;height:var(--crs-size-70)!important;border:var(--crs-border-2) solid var(--crs-white)!important;border-radius:var(--crs-radius-16)!important}.crs-entity-header__description{align-items:flex-start;flex-direction:column;gap:var(--crs-space-4)}.crs-entity-header__description p{max-width:100%;-webkit-line-clamp:4}.crs-entity-header__more{width:100%;padding-top:0;line-height:var(--crs-leading-16);text-align:left}}
</style>
