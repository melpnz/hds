<script setup lang="ts">
type Item = { label: string; value: string; disabled?: boolean }
const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  items?: Item[]
  label?: string
  variant?: 'light' | 'hero'
  block?: boolean
  tabs?: boolean
  density?: 'default' | 'compact'
}>(), { items: () => [], variant: 'light', block: true, tabs: false, density: 'default' })
const isTabs = computed(() => props.tabs)
</script>

<template>
  <div class="crs-button-group" :class="[`crs-button-group--${variant}`, `crs-button-group--${density}`, { 'crs-button-group--block': block }]" :role="isTabs ? 'tablist' : 'group'" :aria-label="label">
    <button v-for="item in items" :key="item.value" class="crs-button-group__item" :class="{ selected: model === item.value }" type="button" :role="isTabs ? 'tab' : undefined" :disabled="item.disabled" :aria-selected="isTabs ? model === item.value : undefined" :aria-pressed="isTabs ? undefined : model === item.value" @click="model = item.value">{{ item.label }}</button>
    <slot v-if="!items.length" />
  </div>
</template>

<style scoped>
.crs-button-group{box-sizing:border-box;display:flex;width:max-content;max-width:100%;min-height:var(--crs-size-48);border-radius:var(--crs-radius-16);background:var(--crs-black-50);padding:var(--crs-space-4)}
.crs-button-group--block{width:100%}
.crs-button-group--hero{--group-hover:var(--crs-black-transparent-120);--group-focus:var(--crs-white);--group-selected:var(--crs-black-850);min-height:0;border-radius:var(--crs-radius-12);background:var(--crs-black-transparent-120);padding:0;color:var(--crs-white)}
.crs-button-group__item{min-width:0;flex:1;border:0;border-radius:var(--crs-radius-12);background:transparent;padding:var(--crs-space-10) var(--crs-space-16);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);text-align:center;cursor:pointer}
.crs-button-group:not(.crs-button-group--block) .crs-button-group__item{flex:none;white-space:nowrap}
.crs-button-group--hero .crs-button-group__item{height:var(--crs-size-40);padding:var(--crs-space-8) var(--crs-space-16);color:inherit;white-space:nowrap}
.crs-button-group--hero .crs-button-group__item:hover{background:var(--group-hover)}
.crs-button-group__item.selected{background:var(--crs-white);box-shadow:var(--crs-shadow-control)}
.crs-button-group--hero .crs-button-group__item.selected{background:var(--group-selected);box-shadow:none}
.crs-button-group__item:focus-visible{outline:var(--crs-border-2) solid var(--group-focus,var(--crs-black-400));outline-offset:var(--crs-border-1)}
.crs-button-group__item:disabled{color:var(--crs-black-500);opacity:var(--crs-opacity-muted);cursor:not-allowed}
.crs-button-group--compact{min-height:var(--crs-size-48);border-radius:var(--crs-radius-12)}
.crs-button-group--compact .crs-button-group__item{height:var(--crs-size-32);border-radius:var(--crs-radius-8);padding:var(--crs-space-8) var(--crs-space-12);color:var(--crs-black-500);font:600 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}
.crs-button-group--compact .crs-button-group__item.selected{color:var(--crs-black-850)}
.crs-button-group>.crs-button{height:var(--crs-size-40);min-width:0;flex:1;border:0;border-radius:var(--crs-radius-12);background:transparent;color:var(--crs-black-850);box-shadow:none}
.crs-button-group>.crs-button:first-child{background:var(--crs-white);box-shadow:var(--crs-shadow-control)}
</style>
