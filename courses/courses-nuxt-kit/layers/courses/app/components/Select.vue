<script setup lang="ts">
type Option = { label: string; value: string }
const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  label?: string
  options?: Option[]
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  ariaLabel?: string
  size?: 'm' | 'xl'
  appearance?: 'default' | 'bare'
}>(), { options: () => [], placeholder: 'Выберите', size: 'm', appearance: 'default' })
const open = ref(false)
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const menu = ref<{ focusFirst: () => void; focusLast: () => void }>()
const selectedLabel = computed(() => props.options.find(option => option.value === model.value)?.label)
function close(event: PointerEvent) { if (!root.value?.contains(event.target as Node)) open.value = false }
function onTriggerKeydown(event: KeyboardEvent) { if (!['ArrowDown','ArrowUp'].includes(event.key)) return; event.preventDefault(); open.value = true; nextTick(() => event.key === 'ArrowDown' ? menu.value?.focusFirst() : menu.value?.focusLast()) }
function finishSelection() { open.value = false; nextTick(() => trigger.value?.focus()) }
function closeFromKeyboard() { open.value = false; nextTick(() => trigger.value?.focus()) }
onMounted(() => document.addEventListener('pointerdown', close))
onBeforeUnmount(() => document.removeEventListener('pointerdown', close))
</script>

<template>
  <div ref="root" class="crs-field crs-select" :class="`crs-select--${appearance}`">
    <span v-if="label" class="crs-field__label">{{ label }}</span>
    <button ref="trigger" class="crs-select__trigger crs-control" :class="`crs-select__trigger--${size}`" type="button" :disabled="disabled" :aria-label="ariaLabel" :aria-expanded="open" :aria-invalid="Boolean(error)" @click="open = !open" @keydown="onTriggerKeydown">
      <span :class="{ placeholder: !selectedLabel }">{{ selectedLabel || placeholder }}</span>
      <UIcon class="crs-select__chevron" name="i-tabler-chevron-down" />
    </button>
    <OptionList v-if="open" ref="menu" v-model="model" class="crs-select__menu" :items="options" selection-mode="single" fluid :label="label || ariaLabel || 'Варианты'" @select="finishSelection" @escape="closeFromKeyboard" />
    <span v-if="error" class="crs-field__error">{{ error }}</span>
    <span v-else-if="hint" class="crs-field__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.crs-select{position:relative}
.crs-select__trigger{display:flex;width:100%;align-items:center;justify-content:space-between;gap:var(--crs-space-4);border-width:var(--crs-select-border-width,var(--crs-border-1));border-radius:var(--crs-select-radius,var(--crs-radius-12));background:var(--crs-select-background,var(--crs-white));padding:var(--crs-space-8) var(--crs-space-12);color:var(--crs-select-color,var(--crs-black-850));text-align:left}
.crs-select__trigger--xl{height:var(--crs-size-56);padding-right:var(--crs-space-12);padding-left:var(--crs-space-16)}
.crs-select__trigger .placeholder{color:var(--crs-black-500)}
.crs-select__chevron{width:var(--crs-size-20);height:var(--crs-size-20);margin-left:auto;flex:none;color:var(--crs-black-500);transition:transform var(--crs-duration-fast)}
.crs-select__trigger[aria-expanded="true"]{border-color:var(--crs-black-850)}
.crs-select__trigger[aria-expanded="true"]>.crs-select__chevron{transform:rotate(180deg)}
.crs-select__menu{position:absolute;z-index:var(--crs-z-dropdown);top:calc(100% + var(--crs-space-4));left:0}
.crs-select--bare{width:100%;min-width:0;max-width:100%;height:var(--crs-size-40);gap:0}
.crs-select--bare .crs-select__trigger{box-sizing:border-box;width:100%;min-width:0;max-width:100%;height:var(--crs-size-40);overflow:hidden;border:0;background:transparent;padding:0}
</style>
