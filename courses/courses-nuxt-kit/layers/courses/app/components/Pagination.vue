<script setup lang="ts">
const page = defineModel<number>({ default: 1 })
const props = withDefaults(defineProps<{ total: number; label?: string }>(), { label: 'Пагинация' })
const visiblePages = computed<(number | 'ellipsis')[]>(() => {
  if (props.total <= 5) return Array.from({ length: Math.max(1, props.total) }, (_, index) => index + 1)
  const values: (number | 'ellipsis')[] = [1]
  if (page.value > 3) values.push('ellipsis')
  for (let value = Math.max(2, page.value - 1); value <= Math.min(props.total - 1, page.value + 1); value++) values.push(value)
  if (page.value < props.total - 2) values.push('ellipsis')
  values.push(props.total)
  return values
})
</script>

<template>
  <nav class="crs-pagination" :aria-label="label">
    <IconButton class="crs-pagination__arrow" label="Назад" icon="i-tabler-chevron-left" variant="ghost" :disabled="page <= 1" @click="page--" />
    <div class="crs-pagination__pages">
      <template v-for="(item, index) in visiblePages" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="crs-pagination__ellipsis">…</span>
        <PaginationItem v-else :page="item" :active="item === page" @select="page = $event" />
      </template>
    </div>
    <IconButton class="crs-pagination__arrow" label="Вперёд" icon="i-tabler-chevron-right" variant="ghost" :disabled="page >= total" @click="page++" />
  </nav>
</template>

<style scoped>
.crs-pagination{display:flex;align-items:center;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-12)}.crs-pagination__pages{display:flex;gap:var(--crs-space-6);margin:auto;overflow:auto;white-space:nowrap}.crs-pagination__ellipsis{display:grid;width:var(--crs-size-36);height:var(--crs-size-36);flex:none;align-items:start;justify-items:center;border-radius:var(--crs-radius-full);padding-top:var(--crs-space-4);color:var(--crs-black-850);font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family)}
</style>
