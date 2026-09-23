<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const inputId = useId()
const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  type?: string
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  size?: 'm' | 'xl'
  state?: 'default' | 'hover' | 'focus' | 'error' | 'disabled' | 'readonly'
  ariaLabel?: string
  leadingIcon?: string
  trailingIcon?: string
  leadingActionLabel?: string
  trailingActionLabel?: string
  appearance?: 'default' | 'bare'
}>(), { type: 'text', size: 'm', state: 'default', appearance: 'default' })
const emit = defineEmits<{ leadingAction: []; trailingAction: [] }>()
</script>

<template>
  <div class="crs-field" :class="`crs-field--${appearance}`">
    <label v-if="label" class="crs-field__label" :for="inputId">{{ label }}</label>
    <span
      class="crs-input-wrap crs-control"
      :class="`crs-input-wrap--${size}`"
      :data-disabled="disabled || undefined"
      :data-readonly="readonly || undefined"
      :data-invalid="Boolean(error) || undefined"
      :data-state="state"
    >
      <span v-if="$slots.leading || leadingIcon" class="crs-input-wrap__icon"><slot name="leading"><IconButton v-if="leadingIcon && leadingActionLabel" :label="leadingActionLabel" :icon="leadingIcon" variant="ghost" size="s" :icon-size="24" tone="muted" hover="none" :disabled="disabled" @click="emit('leadingAction')" /><UIcon v-else-if="leadingIcon" class="crs-input-wrap__icon-glyph" :name="leadingIcon" aria-hidden="true" /></slot></span>
      <input :id="inputId" v-model="model" class="crs-input" :type="type" :inputmode="inputmode" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :aria-label="ariaLabel" :aria-invalid="Boolean(error)">
      <span v-if="$slots.trailing || trailingIcon" class="crs-input-wrap__icon"><slot name="trailing"><IconButton v-if="trailingIcon && trailingActionLabel" :label="trailingActionLabel" :icon="trailingIcon" variant="ghost" size="s" :icon-size="24" tone="muted" hover="none" :disabled="disabled" @click="emit('trailingAction')" /><UIcon v-else-if="trailingIcon" class="crs-input-wrap__icon-glyph" :name="trailingIcon" aria-hidden="true" /></slot></span>
    </span>
    <span v-if="error" class="crs-field__error">{{ error }}</span>
    <span v-else-if="hint" class="crs-field__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.crs-input-wrap{display:flex;width:100%;min-width:0;max-width:100%;align-items:center;gap:var(--crs-space-4);padding:var(--crs-space-8) var(--crs-space-12)}
.crs-input-wrap--xl{height:var(--crs-size-56);padding-right:var(--crs-space-12);padding-left:var(--crs-space-16)}
.crs-input-wrap:focus-within{border-color:var(--crs-black-850)}
.crs-input-wrap[data-state="hover"]{border-color:var(--crs-black-150)}
.crs-input-wrap[data-state="focus"]{border-color:var(--crs-black-850)}
.crs-input-wrap[data-invalid],.crs-input-wrap[data-state="error"]{border-color:var(--crs-red)}
.crs-input-wrap[data-readonly]{background:var(--crs-black-50)}
.crs-input-wrap[data-disabled]{color:var(--crs-black-200)}
.crs-input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:inherit;font:inherit;line-height:var(--crs-leading-22);padding:0}
.crs-input::placeholder{color:var(--crs-black-500);opacity:1}.crs-input:disabled::placeholder{color:var(--crs-black-200)}
.crs-input-wrap__icon{display:grid;width:var(--crs-size-24);height:var(--crs-size-24);flex:none;place-items:center;color:var(--crs-black-500)}
.crs-input-wrap__icon-glyph{width:100%;height:100%}
.crs-input-wrap__icon>:slotted(*){width:100%;height:100%}
.crs-field--bare{width:100%;min-width:0;max-width:100%;height:var(--crs-size-40);gap:0}
.crs-field--bare .crs-input-wrap{box-sizing:border-box;width:100%;min-width:0;max-width:100%;height:var(--crs-size-40);overflow:hidden;border:0;background:transparent;padding:0}
.crs-field--bare .crs-input{box-sizing:border-box;width:100%;min-width:0;max-width:100%}
</style>
