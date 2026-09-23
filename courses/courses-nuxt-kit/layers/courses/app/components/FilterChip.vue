<script setup lang="ts">
const selected = defineModel<boolean>({ default: false })

type DropdownItem = {
  label: string
  icon?: string
  disabled?: boolean
  onSelect?: () => void
}

const props = withDefaults(defineProps<{
  disabled?: boolean
  count?: number
  loading?: boolean
  icon?: string
  dropdown?: boolean
  dropdownItems?: DropdownItem[]
  state?: 'default' | 'hover' | 'focus' | 'pressed'
}>(), {
  disabled: false,
  dropdown: false,
  dropdownItems: () => [],
  state: 'default'
})

function select() {
  if (!props.dropdown) selected.value = !selected.value
}
</script>

<template>
  <UPopover
    v-if="dropdown"
    v-model:open="selected"
    :content="{ align: 'start', sideOffset: 3 }"
    :ui="{ content: 'p-0 bg-transparent ring-0 shadow-none' }"
  >
    <button
      type="button"
      class="crs-filter-chip crs-filter-chip--dropdown"
      :data-state="selected ? 'open' : loading ? 'loading' : state"
      :disabled="disabled || loading"
      aria-pressed="false"
      :aria-busy="loading || undefined"
    >
      <UIcon v-if="icon" class="crs-filter-chip__icon" :name="icon" aria-hidden="true" />
      <span v-if="$slots.default" class="crs-filter-chip__label"><slot /></span>
      <UIcon class="crs-filter-chip__chevron" name="i-tabler-chevron-down" aria-hidden="true" />
      <span v-if="count !== undefined" class="crs-filter-chip__badge">{{ count }}</span>
      <UIcon v-if="loading" class="crs-filter-chip__loader" name="i-tabler-loader-2" />
    </button>
    <template #content>
      <OptionList :items="dropdownItems" selection-mode="action" label="Действия" @action="selected = false" @escape="selected = false" />
    </template>
  </UPopover>
  <button
    v-else
    type="button"
    class="crs-filter-chip"
    :data-state="selected ? 'pressed' : loading ? 'loading' : state"
    :disabled="disabled || loading"
    :aria-pressed="selected"
    :aria-busy="loading || undefined"
    @click="select"
  >
    <UIcon v-if="icon" class="crs-filter-chip__icon" :name="icon" aria-hidden="true" />
    <span v-if="$slots.default" class="crs-filter-chip__label"><slot /></span>
    <span v-if="count !== undefined" class="crs-filter-chip__badge">{{ count }}</span>
    <UIcon v-if="loading" class="crs-filter-chip__loader" name="i-tabler-loader-2" />
  </button>
</template>

<style scoped>
.crs-filter-chip{position:relative;box-sizing:border-box;display:inline-flex;width:max-content;height:var(--crs-size-36);align-items:center;justify-content:center;gap:var(--crs-space-4);padding:var(--crs-space-8) var(--crs-space-12);border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-full);background:var(--crs-white);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);white-space:nowrap;cursor:pointer}
.crs-filter-chip:hover:not(:disabled),.crs-filter-chip[data-state="hover"],.crs-filter-chip[data-state="focus"]{border-color:var(--crs-black-150)}
.crs-filter-chip:focus-visible,.crs-filter-chip[data-state="focus"]{outline:0;box-shadow:0 0 0 var(--crs-space-2) var(--crs-white),0 0 0 var(--crs-space-4) var(--crs-black-400)}
.crs-filter-chip[data-state="pressed"]{border-color:var(--crs-blue-300);background:var(--crs-blue-50);color:var(--crs-blue-500)}
.crs-filter-chip[data-state="open"]{border-color:var(--crs-black-150);background:var(--crs-black-50);color:var(--crs-black-850)}
.crs-filter-chip:disabled{color:var(--crs-black-500);cursor:not-allowed}
.crs-filter-chip__icon{display:block;width:var(--crs-size-24);height:var(--crs-size-24);flex:none;color:var(--crs-black-400)}
.crs-filter-chip--dropdown{padding-right:var(--crs-space-8)}
.crs-filter-chip__chevron{display:block;width:var(--crs-size-20);height:var(--crs-size-20);flex:none;color:currentColor;transition:transform var(--crs-duration-fast) var(--crs-ease)}
.crs-filter-chip--dropdown[aria-expanded="true"] .crs-filter-chip__chevron{transform:rotate(180deg)}
.crs-filter-chip[data-state="pressed"] .crs-filter-chip__icon{color:var(--crs-blue-500)}
.crs-filter-chip:disabled .crs-filter-chip__icon{color:var(--crs-black-300)}
.crs-filter-chip__label{display:flex;height:var(--crs-size-24);align-items:center}
.crs-filter-chip__badge{position:absolute;top:calc(var(--crs-unit) * -5);right:calc(var(--crs-unit) * -5);box-sizing:border-box;min-width:var(--crs-size-16);height:var(--crs-size-16);border-radius:var(--crs-radius-full);background:var(--crs-blue-500);padding:0 var(--crs-space-4);color:var(--crs-white);font:600 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family);text-align:center}
.crs-filter-chip[data-state="loading"]{min-width:calc(var(--crs-unit) * 53);color:transparent;cursor:wait}
.crs-filter-chip__loader{position:absolute;top:50%;left:50%;width:var(--crs-size-24);height:var(--crs-size-24);color:var(--crs-black-400);transform:translate(-50%,-50%);animation:crs-chip-spin var(--crs-duration-loader) linear infinite}
@keyframes crs-chip-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
</style>
