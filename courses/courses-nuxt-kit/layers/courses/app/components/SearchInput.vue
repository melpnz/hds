<script setup lang="ts">
const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{ placeholder?: string; label?: string; disabled?: boolean; size?: 'm' | 'xl' }>(), { placeholder: 'Поиск', size: 'm' })
</script>

<template>
  <label class="crs-search crs-control" :class="`crs-search--${size}`" :data-disabled="disabled || undefined">
    <span class="crs-visually-hidden">{{ label || placeholder }}</span>
    <input v-model="model" class="crs-search__input" :placeholder="placeholder" :disabled="disabled">
    <IconButton v-if="model" class="crs-search__clear" label="Очистить" icon="i-tabler-x" variant="ghost" size="s" :icon-size="24" @click="model = ''" />
  </label>
</template>

<style scoped>
.crs-search{display:flex;width:100%;align-items:center;gap:var(--crs-space-4);padding:var(--crs-space-8) var(--crs-space-12);color:var(--crs-black-500)}
.crs-search--xl{height:var(--crs-size-56);padding-right:var(--crs-space-12);padding-left:var(--crs-space-16)}
.crs-search:focus-within{border-color:var(--crs-black-850)}
.crs-search[data-disabled]{color:var(--crs-black-200)}
.crs-search__input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:var(--crs-black-850);font:inherit;padding:0}
.crs-search__input::placeholder{color:var(--crs-black-500);opacity:1}
.crs-search__clear{display:grid;border:0;background:none;padding:0;color:inherit;cursor:pointer}
</style>
