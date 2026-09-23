<script setup lang="ts">
const track = ref<HTMLElement>()
const canPrev = ref(false)
const canNext = ref(true)

withDefaults(defineProps<{
  variant?: 'course-card' | 'article-card' | 'review-card' | 'ad-slot'
}>(), { variant: 'course-card' })

function update() {
  const element = track.value
  if (!element) return
  canPrev.value = element.scrollLeft > 1
  canNext.value = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
}

function move(direction: number) {
  const element = track.value
  if (!element) return
  const slide = element.querySelector<HTMLElement>('.crs-carousel__slide > *')
  const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 16
  element.scrollBy({ left: direction * ((slide?.offsetWidth ?? 260) + gap), behavior: 'smooth' })
}

onMounted(() => {
  update()
  track.value?.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
})

onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
})
</script>

<template>
  <section class="crs-carousel" :data-variant="variant">
    <div class="crs-carousel__body">
      <div ref="track" class="crs-carousel__track">
        <div class="crs-carousel__slide"><slot /></div>
      </div>
      <div class="crs-carousel__controls">
        <IconButton class="crs-carousel__control crs-carousel__control--prev" label="Назад" icon="i-tabler-chevron-left" :disabled="!canPrev" @click="move(-1)" />
        <IconButton class="crs-carousel__control crs-carousel__control--next" label="Вперёд" icon="i-tabler-chevron-right" :disabled="!canNext" @click="move(1)" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.crs-carousel{container-type:inline-size;display:grid;width:100%;min-width:0;gap:var(--crs-space-16)}
.crs-carousel__body{position:relative;min-width:0}
.crs-carousel__track{display:grid;max-width:100%;min-width:0;grid-auto-columns:100%;grid-auto-flow:column;gap:var(--crs-space-16);overflow-x:auto;overscroll-behavior-inline:contain;padding:var(--crs-border-1);scroll-behavior:smooth;scroll-snap-type:x mandatory;scrollbar-width:none}
.crs-carousel__track::-webkit-scrollbar{display:none}
.crs-carousel__slide{display:contents}
.crs-carousel__slide>:slotted(*){box-sizing:border-box;width:100%;max-width:none;min-width:0;scroll-snap-align:start}
.crs-carousel__controls{position:absolute;z-index:2;inset:50% 0 auto;display:flex;align-items:center;justify-content:space-between;pointer-events:none;transform:translateY(-50%)}
.crs-carousel__control{pointer-events:auto}
.crs-carousel__control--prev{transform:translateX(-50%)}
.crs-carousel__control--next{transform:translateX(50%)}

@media(min-width:768px) and (max-width:1023px){
  .crs-carousel[data-variant="course-card"] .crs-carousel__track{grid-auto-columns:calc((100% - var(--crs-space-32)) / 3)}
  .crs-carousel[data-variant="article-card"] .crs-carousel__track,
  .crs-carousel[data-variant="review-card"] .crs-carousel__track{grid-auto-columns:calc((100% - var(--crs-space-16)) / 2)}
}
@media(min-width:1024px){
  .crs-carousel[data-variant="course-card"] .crs-carousel__track{grid-auto-columns:calc((100% - var(--crs-space-48)) / 4)}
  .crs-carousel[data-variant="article-card"] .crs-carousel__track,
  .crs-carousel[data-variant="review-card"] .crs-carousel__track{grid-auto-columns:calc((100% - var(--crs-space-32)) / 3)}
}
</style>
