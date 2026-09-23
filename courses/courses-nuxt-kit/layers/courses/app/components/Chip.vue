<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'neutral' | 'surface' | 'blue' | 'brand' | 'green' | 'orange' | 'red' | 'orange-soft'
  variant?: 'default' | 'counter'
  size?: 'xs' | 's' | 'm'
  removable?: boolean
  truncate?: boolean
}>(), { tone: 'neutral', variant: 'default', size: 'm', truncate: false })
const emit = defineEmits<{ remove: [] }>()
function remove(event: MouseEvent) {
  event.stopPropagation()
  emit('remove')
}
</script>

<template>
  <span class="crs-chip" :class="[`crs-chip--${tone}`, `crs-chip--${variant}`, `crs-chip--${size}`, { 'crs-chip--removable': removable, 'crs-chip--truncate': truncate }]">
    <slot />
    <IconButton v-if="removable" class="crs-chip__remove" label="Удалить" icon="i-tabler-x" variant="ghost" size="s" @click="remove" />
  </span>
</template>

<style scoped>
.crs-chip { display:inline-flex;align-items:center;gap:var(--crs-space-4);border-radius:var(--crs-radius-full);padding:var(--crs-space-4) var(--crs-space-8);font-size:var(--crs-font-12);line-height:var(--crs-leading-16);white-space:nowrap; }
.crs-chip--xs{box-sizing:border-box;min-width:var(--crs-size-16);min-height:var(--crs-size-16);justify-content:center;padding:0 var(--crs-space-4);font-weight:600}
.crs-chip--s{padding:var(--crs-space-2) var(--crs-space-6)}
.crs-chip--counter{box-sizing:border-box;min-width:var(--crs-size-24);height:var(--crs-size-24);justify-content:center;border:var(--crs-border-1) solid var(--crs-white)}
.crs-chip--removable{padding-right:var(--crs-space-4);padding-left:var(--crs-space-12)}
.crs-chip--truncate{box-sizing:border-box;max-width:100%}
.crs-chip--truncate>:slotted(*){display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crs-chip--neutral{background:var(--crs-black-50);color:var(--crs-black-850)}.crs-chip--surface{background:var(--crs-white);color:var(--crs-black-850)}.crs-chip--blue{background:var(--crs-blue-50);color:var(--crs-black-850)}.crs-chip--brand{background:var(--crs-blue-500);color:var(--crs-white)}.crs-chip--green{background:var(--crs-green-chip-bg);color:var(--crs-black-850)}.crs-chip--red{background:var(--crs-red-50);color:var(--crs-black-850)}.crs-chip--orange-soft{background:var(--crs-yellow-50);color:var(--crs-black-850)}.crs-chip--orange{background:var(--crs-orange-500);color:var(--crs-white)}.crs-chip__remove{display:grid;place-items:center;border:0;background:none;padding:0;cursor:pointer}
</style>
