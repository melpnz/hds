<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const fieldId = useId()
const errorId = `${fieldId}-error`
const hintId = `${fieldId}-hint`
const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
}>(), { rows: 3 })
const describedBy = computed(() => props.error ? errorId : props.hint ? hintId : undefined)
</script>

<template>
  <div class="crs-field">
    <label v-if="label" :for="fieldId" class="crs-field__label">{{ label }}</label>
    <textarea :id="fieldId" v-model="model" class="crs-control crs-textarea" :rows="rows" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :aria-invalid="Boolean(error)" :aria-describedby="describedBy" />
    <span v-if="error" :id="errorId" class="crs-field__error">{{ error }}</span>
    <span v-else-if="hint" :id="hintId" class="crs-field__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.crs-textarea{width:100%;height:calc(var(--crs-unit) * 82);resize:vertical;padding:var(--crs-space-10) var(--crs-space-12);line-height:var(--crs-leading-22)}
</style>
