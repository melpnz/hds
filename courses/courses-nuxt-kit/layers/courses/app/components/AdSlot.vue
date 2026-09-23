<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'РЕКЛАМА' })
const track = ref<HTMLElement>()
function centerCurrent() {
  const element = track.value
  const current = element?.children[1] as HTMLElement | undefined
  if (element && current) element.scrollLeft = current.offsetLeft - (element.clientWidth - current.offsetWidth) / 2
}
onMounted(() => requestAnimationFrame(centerCurrent))
</script>
<template><section class="crs-ad-slot" aria-label="Рекламные предложения"><div ref="track" class="crs-ad-slot__track"><slot><AdCard title="Скидки до 60% на обучение в онлайн-школах" image="/courses/carousel/ad-promo.png" mobile-image="/courses/carousel/ad-promo-mobile.png" :label="label"/><AdCard title="Курсы дешевле, чем у школ" image="/courses/carousel/ad-previous.png" mobile-image="/courses/carousel/ad-previous-mobile.png" :label="label"/><AdCard title="Обучение работе с искусственным интеллектом" image="/courses/carousel/ad-ai.png" mobile-image="/courses/carousel/ad-ai.png" :label="label"/></slot></div><div class="crs-ad-slot__pagination" aria-hidden="true"><i/><i class="current"/><i/></div></section></template>
<style scoped>.crs-ad-slot{display:grid;width:100%;gap:var(--crs-space-12);overflow:hidden}.crs-ad-slot__track{display:flex;gap:var(--crs-space-16);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.crs-ad-slot__track::-webkit-scrollbar{display:none}.crs-ad-slot__pagination{display:flex;justify-content:center;gap:var(--crs-space-6)}.crs-ad-slot__pagination i{width:var(--crs-size-6);height:var(--crs-size-6);border-radius:var(--crs-radius-full);background:var(--crs-black-150)}.crs-ad-slot__pagination i.current{background:var(--crs-black-500)}</style>
