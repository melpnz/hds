<script setup lang="ts">
import Chip from '#layers/courses/app/components/Chip.vue'
import MultiSelect from '#layers/courses/app/components/MultiSelect.vue'
import ButtonGroup from '#layers/courses/app/components/ButtonGroup.vue'
import Tooltip from '#layers/courses/app/components/Tooltip.vue'
import DemandChart from '#layers/courses/app/components/DemandChart.vue'
import PriceSheet from '#layers/courses/app/components/PriceSheet.vue'
import SortSheet from '#layers/courses/app/components/SortSheet.vue'
import MobileMenu from '#layers/courses/app/components/MobileMenu.vue'
const route = useRoute()
const pairs = { Chip, MultiSelect, ButtonGroup, Tooltip, DemandChart, PriceSheet, SortSheet, MobileMenu }
const kind = computed(() => {
  const requested = String(route.query.kind || 'Chip')
  return Object.hasOwn(pairs, requested) ? requested as keyof typeof pairs : 'Chip'
})
const component = computed(() => pairs[kind.value])
const open = ref(route.query.ssr === 'true')
const values = ref(['js', 'vue'])
const props = computed(() => kind.value === 'MultiSelect' ? { label: 'Навыки', error: 'Проверьте выбор', options: [{ label: 'JavaScript', value: 'js' }, { label: 'Vue', value: 'vue' }], modelValue: values.value } : kind.value === 'ButtonGroup' ? { items: [{ label: 'Первый', value: 'one' }, { label: 'Второй', value: 'two' }], modelValue: 'one', tabs: true } : kind.value === 'Tooltip' ? { text: 'Подсказка', delay: 0 } : kind.value === 'Chip' ? { removable: true } : {})
</script>
<template>
  <main>
    <Button @click="open = true">Открыть</Button>
    <component :is="component" v-if="kind === 'SortSheet'" v-model:open="open" />
    <component :is="component" v-else-if="['PriceSheet', 'MobileMenu'].includes(kind)" v-model="open" />
    <div v-else class="visual-target"><component :is="component" v-bind="props"><Button v-if="kind === 'Tooltip'">Подсказка кнопки</Button><template v-else-if="kind === 'Chip'">Python</template></component></div>
  </main>
</template>
<style scoped>
main{padding:var(--crs-space-24)}.visual-target{margin-top:var(--crs-space-24)}
</style>
