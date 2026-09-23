<script setup lang="ts">
type Option = { label: string; value: string }
const model = defineModel<string[]>({ default: () => [] })
const props = withDefaults(defineProps<{ label?: string; options?: Option[]; placeholder?: string; disabled?: boolean; error?: string; size?: 'm' | 'xl' }>(), { options: () => [], placeholder: 'Выберите', size: 'm' })
const open = ref(false)
const root = ref<HTMLElement>()
const trigger = ref<HTMLElement>()
const menu = ref<{ focusFirst: () => void; focusLast: () => void }>()
const selected = computed(() => props.options.filter(option => model.value.includes(option.value)))
function close(event: PointerEvent) { if (!root.value?.contains(event.target as Node)) open.value = false }
function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (['Enter', ' '].includes(event.key)) { event.preventDefault(); open.value = !open.value; return }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  event.preventDefault()
  open.value = true
  nextTick(() => event.key === 'ArrowDown' ? menu.value?.focusFirst() : menu.value?.focusLast())
}
function toggle() { if (!props.disabled) open.value = !open.value }
function removeOption(value: string) { if (!props.disabled) model.value = model.value.filter(item => item !== value) }
function closeFromKeyboard() { open.value=false;nextTick(()=>trigger.value?.focus()) }
onMounted(() => document.addEventListener('pointerdown', close))
onBeforeUnmount(() => document.removeEventListener('pointerdown', close))
</script>

<template>
  <div ref="root" class="crs-field crs-multi">
    <span v-if="label" class="crs-field__label">{{ label }}</span>
    <div ref="trigger" class="crs-control crs-multi__trigger" :class="`crs-multi__trigger--${size}`" role="combobox" :tabindex="disabled ? -1 : 0" :aria-disabled="disabled || undefined" :aria-expanded="open" :aria-invalid="Boolean(error)" @click="toggle" @keydown="onTriggerKeydown">
      <span v-if="!selected.length" class="crs-multi__placeholder">{{ placeholder }}</span>
      <Chip v-for="option in selected" :key="option.value" class="crs-multi__chip" :removable="!disabled" @remove="removeOption(option.value)">{{ option.label }}</Chip>
      <UIcon class="crs-multi__chevron" name="i-tabler-chevron-down" />
    </div>
    <OptionList v-if="open" ref="menu" v-model="model" class="crs-multi__menu" :items="options" selection-mode="multiple" fluid :label="label || 'Варианты'" @escape="closeFromKeyboard" />
    <span v-if="error" class="crs-field__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.crs-multi{position:relative}.crs-multi__trigger{display:flex;width:100%;align-items:center;gap:var(--crs-space-4);padding:calc(var(--crs-unit) * 3) var(--crs-space-12) calc(var(--crs-unit) * 3) var(--crs-space-4);text-align:left;cursor:pointer}.crs-multi__trigger--xl{height:var(--crs-size-56);padding:calc(var(--crs-unit) * 11) var(--crs-space-12) calc(var(--crs-unit) * 11) var(--crs-space-8)}.crs-multi__trigger[aria-disabled="true"]{color:var(--crs-black-200);cursor:not-allowed}.crs-multi__placeholder{padding-left:var(--crs-space-8);color:var(--crs-black-500)}.crs-multi__chip{min-height:var(--crs-size-32)}.crs-multi__chevron{width:var(--crs-size-20);height:var(--crs-size-20);margin-left:auto;flex:none;color:var(--crs-black-500);transition:transform var(--crs-duration-fast)}.crs-multi__trigger[aria-expanded="true"]{border-color:var(--crs-black-850)}.crs-multi__trigger[aria-expanded="true"]>.crs-multi__chevron{transform:rotate(180deg)}.crs-multi__menu{position:absolute;z-index:var(--crs-z-dropdown);top:calc(100% + var(--crs-space-4));left:0}
</style>
