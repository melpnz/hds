<script setup lang="ts">
type OptionValue = string | number
type SelectionMode = 'single' | 'multiple' | 'action'
type Option = {
  label: string
  value?: OptionValue
  description?: string
  descriptionTop?: string
  descriptionBottom?: string
  icon?: string
  avatarSrc?: string
  avatarAlt?: string
  logoSrc?: string
  logoAlt?: string
  count?: string | number
  meta?: string
  trailingIcon?: string
  trailingIconSecondary?: string
  disabled?: boolean
  onSelect?: () => void
}

const model = defineModel<OptionValue | OptionValue[] | null>()
const props = withDefaults(defineProps<{
  items?: Option[]
  selectionMode?: SelectionMode
  label?: string
  fluid?: boolean
  embedded?: boolean
  inset?: 'default' | 'none'
}>(), {
  items: () => [],
  selectionMode: 'single',
  label: 'Варианты',
  fluid: false,
  embedded: false,
  inset: 'default'
})
const emit = defineEmits<{
  select: [value: OptionValue, item: Option]
  action: [item: Option]
  escape: []
}>()
const root = ref<HTMLElement>()

function isSelected(value: OptionValue | undefined) {
  if (value === undefined || props.selectionMode === 'action') return false
  return Array.isArray(model.value) ? model.value.includes(value) : model.value === value
}

function selectItem(item: Option) {
  if (item.disabled) return
  if (props.selectionMode === 'action') {
    item.onSelect?.()
    emit('action', item)
    return
  }
  if (item.value === undefined) return
  if (props.selectionMode === 'multiple') {
    const current = Array.isArray(model.value) ? model.value : []
    model.value = current.includes(item.value) ? current.filter(value => value !== item.value) : [...current, item.value]
  } else {
    model.value = item.value
  }
  emit('select', item.value, item)
}

function enabledItems() {
  return [...(root.value?.querySelectorAll<HTMLElement>('[data-option-item]:not([aria-disabled="true"])') ?? [])]
}

function focusFirst() { nextTick(() => enabledItems()[0]?.focus()) }
function focusLast() { nextTick(() => enabledItems().at(-1)?.focus()) }

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); emit('escape'); return }
  const items = enabledItems()
  if (!items.length) return
  const current = items.indexOf(document.activeElement as HTMLElement)
  let target: number | undefined
  if (event.key === 'ArrowDown') target = (current + 1 + items.length) % items.length
  if (event.key === 'ArrowUp') target = (current - 1 + items.length) % items.length
  if (event.key === 'Home') target = 0
  if (event.key === 'End') target = items.length - 1
  if (target === undefined) return
  event.preventDefault()
  items[target]?.focus()
}

defineExpose({ focusFirst, focusLast })
</script>

<template>
  <div
    ref="root"
    class="crs-option-list"
    :class="{ 'crs-option-list--fluid': fluid, 'crs-option-list--embedded': embedded, 'crs-option-list--inset-none': inset === 'none' }"
    :role="selectionMode === 'action' ? 'menu' : 'listbox'"
    :aria-label="label"
    :aria-multiselectable="selectionMode === 'multiple' ? true : undefined"
    @keydown="onKeydown"
  >
    <template v-if="items.length">
      <OptionItem
        v-for="item in items"
        :key="item.value ?? item.label"
        v-bind="item"
        :selection-mode="selectionMode"
        :selected="isSelected(item.value)"
        @select="selectItem(item)"
      >
        <template v-if="$slots.item" #default><slot name="item" :item="item" :selected="isSelected(item.value)" /></template>
      </OptionItem>
    </template>
    <slot v-else :select="selectItem" :is-selected="isSelected" />
  </div>
</template>

<style scoped>
.crs-option-list{box-sizing:border-box;width:calc(var(--crs-unit) * 290);max-width:calc(100vw - var(--crs-space-16));max-height:calc(var(--crs-unit) * 216);overflow-y:auto;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:var(--crs-white);padding:var(--crs-space-8) 0;box-shadow:var(--crs-shadow-dropdown)}
.crs-option-list--fluid{width:100%;max-width:100%}
.crs-option-list--embedded{width:100%;max-width:100%;max-height:none;border:0;border-radius:var(--crs-radius-0);box-shadow:none}
.crs-option-list--inset-none{--crs-option-item-padding-left:0;--crs-option-item-padding-right:0}
</style>
