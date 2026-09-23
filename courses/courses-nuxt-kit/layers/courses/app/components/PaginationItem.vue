<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number
  active?: boolean
  disabled?: boolean
  label?: string
}>(), {
  active: false,
  disabled: false,
  label: undefined
})

const emit = defineEmits<{ select: [page: number] }>()
const accessibleLabel = computed(() => props.label ?? `Страница ${props.page}`)
</script>

<template>
  <button
    class="crs-pagination-item"
    :class="{ 'crs-pagination-item--active': active }"
    type="button"
    :disabled="disabled"
    :aria-label="accessibleLabel"
    :aria-current="active ? 'page' : undefined"
    @click="emit('select', page)"
  >
    {{ page }}
  </button>
</template>

<style scoped>
.crs-pagination-item{display:grid;width:var(--crs-size-36);height:var(--crs-size-36);flex:none;place-items:center;border:0;border-radius:var(--crs-radius-full);background:var(--crs-white);color:var(--crs-black-850);font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);cursor:pointer}.crs-pagination-item:hover:not(:disabled){background:var(--crs-black-50)}.crs-pagination-item--active{border:var(--crs-border-1) solid var(--crs-blue-300);background:var(--crs-blue-50);color:var(--crs-blue-500)}.crs-pagination-item:focus-visible{outline:var(--crs-border-2) solid var(--crs-black-400);outline-offset:var(--crs-border-1)}.crs-pagination-item:disabled{color:var(--crs-black-200);cursor:not-allowed}
</style>
