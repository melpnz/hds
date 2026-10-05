<script setup lang="ts">
type SearchOption = { label: string; value: string }
type SearchField = {
  name: string
  placeholder: string
  ariaLabel?: string
  options?: SearchOption[]
}
type SearchSummary = {
  title: string
  details?: string[]
  ariaLabel?: string
}

const query = defineModel<string>({ default: '' })
const values = defineModel<Record<string, string>>('values', { default: () => ({}) })
const props = withDefaults(defineProps<{
  mode?: 'fields' | 'query'
  fields?: SearchField[]
  submitLabel?: string
  queryPlaceholder?: string
  summary?: SearchSummary
}>(), {
  mode: 'fields',
  fields: () => [
    { name: 'organization', placeholder: 'Организация', options: [] },
    { name: 'topic', placeholder: 'Что изучить?', options: [] },
    { name: 'type', placeholder: 'Тип', options: [] }
  ],
  submitLabel: 'Найти',
  queryPlaceholder: 'Найти курс или школу'
})
const emit = defineEmits<{
  submit: [payload: Record<string, string> | string]
  openSummary: []
}>()

function updateField(name: string, value: string) {
  values.value = { ...values.value, [name]: value }
}

function submit() {
  emit('submit', props.mode === 'query' ? query.value : values.value)
}

function fieldPosition(index: number) {
  if (props.fields.length === 1) return 'only'
  if (index === 0) return 'first'
  if (index === props.fields.length - 1) return 'last'
  return 'middle'
}
</script>

<template>
  <div class="crs-search-module" :data-summary="Boolean(summary) || undefined">
    <form class="crs-search-form" role="search" @submit.prevent="submit">
      <template v-if="mode === 'fields'">
        <div v-if="$slots.fields" class="crs-search-form__fields crs-search-form__fields--custom"><slot name="fields" /></div>
        <div v-else class="crs-search-form__fields" :data-count="fields.length">
          <Select
            v-for="(field, index) in fields"
            :key="field.name"
            class="crs-search-form__field"
            :data-position="fieldPosition(index)"
            :model-value="values[field.name] || ''"
            :options="field.options || []"
            :placeholder="field.placeholder"
            :aria-label="field.ariaLabel || field.placeholder"
            size="xl"
            @update:model-value="updateField(field.name, $event)"
          />
        </div>
      </template>
      <SearchInput v-else v-model="query" size="xl" :placeholder="queryPlaceholder" />
      <Button class="crs-search-form__submit" type="submit" size="xl">{{ submitLabel }}</Button>
    </form>

    <Button
      v-if="summary"
      class="crs-search-form__summary"
      type="button"
      variant="secondary"
      size="xl"
      :aria-label="summary.ariaLabel || `Изменить параметры поиска: ${summary.title}`"
      @click="emit('openSummary')"
    >
      <slot name="summary" :summary="summary">
        <strong>{{ summary.title }}</strong>
        <span v-if="summary.details?.length" class="crs-search-form__summary-details">
          <template v-for="(detail, index) in summary.details" :key="`${detail}-${index}`">
            <span>{{ detail }}</span><i v-if="index < summary.details.length - 1">•</i>
          </template>
        </span>
      </slot>
    </Button>
  </div>
</template>

<style scoped>
.crs-search-form{display:grid;grid-template-columns:minmax(0,1fr) max-content;gap:var(--crs-space-8)}
.crs-search-form__fields{display:grid;min-width:0;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--crs-border-1)}
.crs-search-form__fields[data-count="1"]{grid-template-columns:minmax(0,1fr)}
.crs-search-form__fields[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.crs-search-form__field{min-width:0;--crs-select-radius:0}
.crs-search-form__field[data-position="first"]{--crs-select-radius:var(--crs-radius-12) 0 0 var(--crs-radius-12)}
.crs-search-form__field[data-position="last"]{--crs-select-radius:0 var(--crs-radius-12) var(--crs-radius-12) 0}
.crs-search-form__field[data-position="only"]{--crs-select-radius:var(--crs-radius-12)}
.crs-search-form__summary{display:none}
@media(max-width:767px){
  .crs-search-form{grid-template-columns:minmax(0,1fr);gap:var(--crs-space-16)}
  .crs-search-form__fields,.crs-search-form__fields[data-count]{grid-template-columns:minmax(0,1fr)}
  .crs-search-form__field[data-position="first"]{--crs-select-radius:var(--crs-radius-12) var(--crs-radius-12) 0 0}
  .crs-search-form__field[data-position="last"]{--crs-select-radius:0 0 var(--crs-radius-12) var(--crs-radius-12)}
  .crs-search-form__field[data-position="only"]{--crs-select-radius:var(--crs-radius-12)}
  .crs-search-form__submit{width:100%}
  .crs-search-module[data-summary] .crs-search-form{display:none}
  .crs-search-form__summary{--button-fill:var(--crs-white);--button-hover:var(--crs-white);--button-border:var(--crs-white);--button-text:var(--crs-black-850);--button-label-display:contents;box-sizing:border-box;display:flex;width:100%;min-width:0;height:auto;flex-direction:column;align-items:center;justify-content:center;gap:0;margin:var(--crs-space-16) 0;border:0;border-radius:var(--crs-radius-full);background:var(--crs-white);padding:var(--crs-space-12) var(--crs-space-24);color:var(--crs-black-850);font-family:var(--crs-font-family);font-size:var(--crs-font-16);font-weight:400;line-height:1.3;cursor:pointer}
  .crs-search-form__summary strong{display:block;max-width:100%;overflow:hidden;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
  .crs-search-form__summary-details{display:flex;width:100%;align-items:center;justify-content:center;gap:var(--crs-space-6);color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);white-space:nowrap}
  .crs-search-form__summary-details>span{max-width:50%;overflow:hidden;text-overflow:ellipsis}
  .crs-search-form__summary-details>i{flex:none;font-style:normal}
}
</style>
