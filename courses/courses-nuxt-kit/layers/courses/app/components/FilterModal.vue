<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ apply:[]; reset:[] }>()
const selectedRecommendation = ref(2)
const selectedType = ref(1)
const selectedLevel = ref(1)
const priceFrom = ref('0 ₽')
const priceTo = ref('999 999 ₽')
const bars = [12,18,24,16,30,38,28,44,34,52,40,58,46,62,54,42,32,24]
const recommendations = [
  { image: '/courses/filter-modal/recommendation-career.png', label: 'Карьерные консультации' },
  { image: '/courses/filter-modal/recommendation-certificate.png', label: 'Сертификат после курса' },
  { image: '/courses/filter-modal/recommendation-free.png', label: 'Бесплатная часть' },
  { image: '/courses/filter-modal/recommendation-mentor.png', label: 'Поддержка ментора' }
]
const ui = {
  overlay: '[background:var(--crs-overlay-soft)] !grid !place-items-start !justify-center !p-0',
  content: '!w-[min(var(--crs-size-568),100vw)] !max-w-none h-[var(--crs-size-620)] max-h-[100dvh] overflow-hidden rounded-[var(--crs-radius-24)] bg-[var(--crs-white)] p-0 text-[var(--crs-black-850)] shadow-none ring-0 divide-y-0 max-[767px]:!h-[100dvh] max-[767px]:!w-screen max-[767px]:!rounded-none',
  header: 'relative h-[var(--crs-size-72)] min-h-[var(--crs-size-72)] items-start gap-3 border-b border-[var(--crs-black-100)] px-6 py-6',
  wrapper: 'gap-0',
  title: 'text-xl leading-6 font-semibold tracking-[var(--crs-letter-tight)] text-[var(--crs-black-850)]',
  close: 'size-6 min-h-0 rounded-none p-0 text-[var(--crs-black-400)]',
  body: 'min-h-0 overflow-x-hidden overflow-y-auto px-6 py-0 text-[var(--crs-black-850)]',
  footer: 'h-24 gap-4 border-t border-[var(--crs-black-100)] p-6 max-[479px]:!h-[var(--crs-size-136)] max-[479px]:!min-h-[var(--crs-size-136)] max-[479px]:!py-4'
}
function reset() { selectedRecommendation.value = -1; selectedType.value = -1; emit('reset') }
</script>

<template>
  <UModal v-model:open="open" title="Поиск обучения" :scrollable="true" :transition="false" :ui="ui">
    <slot name="trigger" />
    <template #close><IconButton class="crs-filter-modal__close" label="Закрыть" icon="i-tabler-x" variant="ghost" size="s" :icon-size="24" @click="open = false" /></template>
    <template #body><div class="crs-filter-modal">
      <section><h2>Рекомендуем вам</h2><div class="recommendations"><TileFilter v-for="(item,index) in recommendations" :key="item.label" :title="item.label" :image="item.image" image-fit="cover" :model-value="selectedRecommendation === index" @update:model-value="value => { if (value) selectedRecommendation = index }" /></div></section>
      <section><h2>Тип обучения</h2><div class="chips"><FilterChip v-for="(item,index) in ['Курс','Вебинар','Симулятор']" :key="item" class="crs-filter-modal__chip" :model-value="selectedType === index" @update:model-value="value => { if (value) selectedType = index }">{{ item }}</FilterChip></div></section>
      <section><h2>Цена</h2><div class="price"><div class="chart" aria-hidden="true"><i v-for="(height,index) in bars" :key="index" :style="{height:`${height}px`}" /></div><TextInput v-model="priceFrom" class="crs-filter-modal__price-field" aria-label="Цена от" /><TextInput v-model="priceTo" class="crs-filter-modal__price-field" aria-label="Цена до" /></div></section>
      <section><h2>Тематика/навыки/инструменты</h2><TextInput placeholder="Что изучить?" aria-label="Что изучить?" /><div class="check-list"><Checkbox label="Python разработчик" /><Checkbox label="Аналитик данных" /><Checkbox label="UX/UI-дизайнер" /></div></section>
      <section><h2>Уровень обучения</h2><div class="levels"><TileFilter v-for="(item,index) in [{ title: 'Для начинающих (Intern/Junior)', description: 'С нуля или только начали разбираться в теме', image: '/courses/filter-grade-min.svg' }, { title: 'Средний уровень (Middle)', description: 'Хотите углубиться или прокачать навык', image: '/courses/filter-grade-mid.svg' }, { title: 'Продвинутый (Senior/Lead)', description: 'Развить глубокую экспертизу в работе', image: '/courses/filter-grade-max.svg' }]" :key="item.title" v-bind="item" class="crs-filter-modal__level" variant="level" layout="spacious" :show-arrow="false" :model-value="selectedLevel === index" @update:model-value="value => { if (value) selectedLevel = index }" /></div></section>
      <slot />
    </div></template>
    <template #footer><div class="crs-filter-modal__footer"><Button class="crs-filter-modal__action" variant="secondary" size="l" @click="reset">Очистить всё</Button><Button class="crs-filter-modal__action" size="l" @click="emit('apply');open=false">Показать 30 560 курсов</Button></div></template>
  </UModal>
</template>

<style scoped>
.crs-filter-modal{display:flex;width:100%;min-width:0;max-width:100%;flex-direction:column;gap:var(--crs-space-32);overflow-x:hidden}.crs-filter-modal section{display:flex;width:100%;min-width:0;max-width:100%;flex-direction:column;gap:var(--crs-space-8)}.crs-filter-modal h2{margin:0;font:600 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family)}.recommendations{display:flex;width:100%;min-width:0;max-width:100%;gap:var(--crs-space-8);overflow-x:auto;overscroll-behavior-inline:contain;padding-bottom:var(--crs-space-4);scrollbar-width:none}.chips{display:flex;flex-wrap:wrap;gap:var(--crs-space-4)}.price{display:grid;width:100%;min-width:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--crs-space-8)}.price>*{min-width:0}.crs-filter-modal__price-field{box-sizing:border-box;width:100%;min-width:0;max-width:100%}.chart{display:flex;height:var(--crs-size-64);grid-column:1/-1;align-items:end;overflow:hidden;border-bottom:var(--crs-border-1) solid var(--crs-black-200);padding:0 var(--crs-space-10) var(--crs-space-8)}.chart i{width:var(--crs-size-4);margin-right:var(--crs-space-2);border-radius:var(--crs-radius-2) var(--crs-radius-2) 0 0;background:var(--crs-blue-400)}.check-list{display:grid;gap:var(--crs-space-4);border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);padding:var(--crs-space-8)}.levels{display:grid;gap:var(--crs-space-4)}.crs-filter-modal__footer{display:flex;width:100%;align-items:center;justify-content:space-between;gap:var(--crs-space-16)}@media(max-width:479px){.crs-filter-modal__footer{flex-direction:column-reverse;align-items:stretch;gap:var(--crs-space-8)}.crs-filter-modal__action{width:100%}}
@media(max-width:767px){.crs-filter-modal{overflow-x:visible}.recommendations{box-sizing:border-box;width:calc(100% + var(--crs-space-48));max-width:none;margin-inline:calc(var(--crs-space-24) * -1);padding-inline:var(--crs-space-24);scroll-padding-inline:var(--crs-space-24)}}
@media(max-width:479px){.chips{flex-wrap:nowrap;gap:calc(var(--crs-unit) * 3)}.crs-filter-modal__chip{padding-right:var(--crs-space-10);padding-left:var(--crs-space-10);font-size:var(--crs-font-14)}}
.crs-filter-modal__close{position:absolute!important;top:var(--crs-space-24)!important;right:var(--crs-space-24)!important;display:grid!important;width:var(--crs-size-24)!important;height:var(--crs-size-24)!important;min-width:0!important;min-height:0!important;appearance:none!important;place-items:center;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;color:var(--crs-black-400);cursor:pointer}.crs-filter-modal__close:focus-visible{outline:var(--crs-border-2) solid var(--crs-blue-400);outline-offset:var(--crs-border-2)}
</style>
