<script setup lang="ts">
import { Comment, Fragment, cloneVNode, defineComponent, h, type VNode } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'

const track = ref<HTMLElement>()
const canPrev = ref(false)
const canNext = ref(false)
const showControls = ref(false)
const columns = ref(1)
const spaceBetween = ref(12)
const activeIndex = ref(0)
const slots = useSlots()

const props = withDefaults(defineProps<{
  variant?: 'course-card' | 'article-card' | 'review-card' | 'ad-slot'
  loop?: boolean
}>(), { variant: 'course-card', loop: false })
const isAd = computed(() => props.variant === 'ad-slot')
const slideCount = computed(() => flatten(slots.default?.() ?? []).length)

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap(node => node.type === Fragment
    ? flatten(node.children as VNode[])
    : node.type === Comment ? [] : [node])
}

// Ordinary slides stay live; short ad sets repeat VNodes to preserve centered loop geometry.
const slides = defineComponent(() => () => {
  const children = flatten(slots.default?.() ?? [])
  const loop = isAd.value ? children.length > 1 : props.loop && children.length > columns.value
  const renderedChildren = isAd.value && children.length > 1 && children.length < 6
    ? Array.from({ length: 6 }, (_, index) => {
        const child = children[index % children.length]!
        return cloneVNode(child, { key: `${String(child.key ?? index % children.length)}-${index}` })
      })
    : children
  const track = h(Swiper, {
    key: `${props.variant}-${loop}-${columns.value}`,
    class: 'crs-carousel__track',
    modules: [Mousewheel],
    mousewheel: { forceToAxis: true, releaseOnEdges: !loop },
    slidesPerView: isAd.value ? 'auto' : columns.value,
    slidesPerGroup: 1,
    spaceBetween: spaceBetween.value,
    centeredSlides: isAd.value,
    loop,
    loopAddBlankSlides: false,
    watchOverflow: true,
    watchSlidesProgress: true,
    initialSlide: Math.min(activeIndex.value, Math.max(0, children.length - 1)),
    onSwiper: (instance: SwiperInstance) => { activeIndex.value = instance.realIndex % Math.max(1, children.length); update(instance); updateAccessibility(instance) },
    onSlideChange: (instance: SwiperInstance) => { activeIndex.value = instance.realIndex % Math.max(1, children.length); update(instance) },
    onResize: (instance: SwiperInstance) => { update(instance); updateAccessibility(instance) },
    onSetTranslate: updateAccessibility,
    onLock: update,
    onUnlock: update
  }, { default: () => renderedChildren.map((child, index) => h(SwiperSlide, {
    key: child.key ?? index,
    class: ['crs-carousel__item', { 'crs-carousel__item--ad': isAd.value }],
    role: 'group',
    'aria-label': `${index % Math.max(1, children.length) + 1} из ${children.length}`
  }, { default: () => child })) })
  return track
})

function updateAccessibility(instance: SwiperInstance) {
  if (instance.destroyed) return
  for (const slide of instance.slides) {
    const hidden = !instance.visibleSlides.includes(slide)
    slide.inert = hidden
    slide.setAttribute('aria-hidden', String(hidden))
  }
}

watch(() => props.variant, () => nextTick(resize), { flush: 'post' })

function resize() {
  const element = track.value?.querySelector<HTMLElement>('.crs-carousel__track')
  if (!element) return
  const width = window.innerWidth
  columns.value = width < 768 ? 1 : props.variant === 'course-card' ? (width < 1024 ? 3 : 4) : (width < 1024 ? 2 : 3)
  const css = getComputedStyle(element)
  const unit = Number.parseFloat(css.getPropertyValue('--crs-unit')) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  spaceBetween.value = isAd.value ? (width < 768 ? 0 : unit * -26) : Number.parseFloat(css.columnGap) || 0
  update()
}

function update(instance = currentSwiper()) {
  showControls.value = !!instance?.params && !instance.destroyed && !instance.isLocked
  canPrev.value = !!instance?.params && !instance.destroyed && !instance.isLocked && (!!instance.params.loop || !instance.isBeginning)
  canNext.value = !!instance?.params && !instance.destroyed && !instance.isLocked && (!!instance.params.loop || !instance.isEnd)
}

function currentSwiper() {
  const mounted = (track.value?.querySelector<HTMLElement & { swiper?: SwiperInstance }>('.crs-carousel__track'))?.swiper
  return mounted && !mounted.destroyed ? mounted : undefined
}

function move(direction: number) {
  const instance = currentSwiper()
  if (direction < 0) instance?.slidePrev()
  else instance?.slideNext()
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <section ref="track" class="crs-carousel" :data-variant="variant" :data-loop="variant === 'ad-slot' || loop" tabindex="0" :aria-label="variant === 'ad-slot' ? 'Рекламные предложения' : 'Лента карточек'" @keydown.left.self.prevent="move(-1)" @keydown.right.self.prevent="move(1)">
    <div class="crs-carousel__body">
      <component :is="slides" />
      <div v-if="showControls" class="crs-carousel__controls">
        <IconButton class="crs-carousel__control crs-carousel__control--prev" label="Назад" icon="i-tabler-chevron-left" :disabled="!canPrev" @click="move(-1)" />
        <IconButton class="crs-carousel__control crs-carousel__control--next" label="Вперёд" icon="i-tabler-chevron-right" :disabled="!canNext" @click="move(1)" />
      </div>
    </div>
    <div v-if="isAd && slideCount > 1" class="crs-carousel__pagination" aria-hidden="true"><i v-for="index in slideCount" :key="index" :class="{ current: index - 1 === activeIndex }" /></div>
  </section>
</template>

<style scoped>
.crs-carousel{container-type:inline-size;display:grid;width:100%;min-width:0;gap:var(--crs-space-16)}
.crs-carousel__body{position:relative;min-width:0}
.crs-carousel__controls{position:absolute;z-index:2;inset:50% 0 auto;display:flex;align-items:center;justify-content:space-between;pointer-events:none;transform:translateY(-50%)}
.crs-carousel__control{pointer-events:auto}
.crs-carousel__control--prev{transform:translateX(-50%)}
.crs-carousel__control--next{transform:translateX(50%)}

</style>

<style>
/* These elements belong to the internal Swiper adapter, not to slot cards. */
.crs-carousel .swiper.crs-carousel__track{width:100%;min-width:0;overflow:hidden;column-gap:var(--crs-space-12);padding:var(--crs-border-1)}
.crs-carousel[data-variant="ad-slot"]{gap:var(--crs-space-12)}
.crs-carousel .crs-carousel__item{box-sizing:border-box;height:auto;min-width:0}
.crs-carousel .crs-carousel__item > *{box-sizing:border-box;width:100%;max-width:none;min-width:0;height:100%}
.crs-carousel[data-variant="review-card"] .crs-carousel__item > *, .crs-carousel[data-variant="article-card"] .crs-carousel__item > *{width:100%;max-width:none}
.crs-carousel[data-variant="ad-slot"] .swiper.crs-carousel__track{height:var(--crs-size-232);padding:0}
.crs-carousel[data-variant="ad-slot"] .crs-carousel__item--ad{width:var(--crs-size-568);height:var(--crs-size-232);opacity:var(--crs-opacity-carousel-neighbor);transform:scale(.87);transition:transform var(--crs-duration-normal) var(--crs-ease),opacity var(--crs-duration-normal) var(--crs-ease)}
.crs-carousel[data-variant="ad-slot"] .crs-carousel__item--ad.swiper-slide-active{opacity:1;transform:scale(1)}
.crs-carousel .crs-carousel__pagination{display:flex;justify-content:center;gap:var(--crs-space-6)}
.crs-carousel .crs-carousel__pagination i{width:var(--crs-size-6);height:var(--crs-size-6);border-radius:var(--crs-radius-full);background:var(--crs-black-150)}
.crs-carousel .crs-carousel__pagination i.current{background:var(--crs-black-500)}
@media(max-width:767px){
  .crs-carousel[data-variant="ad-slot"] .swiper.crs-carousel__track{height:auto;aspect-ratio:272/280}
  .crs-carousel[data-variant="ad-slot"] .crs-carousel__item--ad{width:100%;height:auto;aspect-ratio:272/280}
}
</style>
