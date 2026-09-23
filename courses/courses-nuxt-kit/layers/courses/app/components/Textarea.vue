<script setup lang="ts">
const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
}>(), { rows: 3 })
</script>

<template>
  <label class="crs-field">
    <span v-if="label" class="crs-field__label">{{ label }}</span>
    <textarea v-model="model" class="crs-control crs-textarea" :rows="rows" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :aria-invalid="Boolean(error)" />
    <span v-if="error" class="crs-field__error">{{ error }}</span>
    <span v-else-if="hint" class="crs-field__hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.crs-textarea{width:100%;height:calc(var(--crs-unit) * 82);resize:vertical;padding:var(--crs-space-10) var(--crs-space-12);line-height:var(--crs-leading-22)}
</style>
