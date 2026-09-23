<script setup lang="ts">
type OptionValue = string | number
type SelectionMode = 'single' | 'multiple' | 'action'

const props = withDefaults(defineProps<{
  value?: OptionValue
  label?: string
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
  selected?: boolean
  disabled?: boolean
  selectionMode?: SelectionMode
}>(), {
  selectionMode: 'single',
  selected: false,
  disabled: false
})

const emit = defineEmits<{ select: [value: OptionValue | undefined] }>()
const resolvedDescriptionBottom = computed(() => props.descriptionBottom ?? props.description)
function select() {
  if (!props.disabled) emit('select', props.value)
}
</script>

<template>
  <div
    class="crs-option-item"
    data-option-item
    :data-selection-mode="selectionMode"
    :data-selected="selected || undefined"
    :role="selectionMode === 'action' ? 'menuitem' : 'option'"
    :aria-selected="selectionMode === 'action' ? undefined : selected"
    :aria-disabled="disabled || undefined"
    tabindex="-1"
    @click="select"
    @keydown.enter.prevent="select"
    @keydown.space.prevent="select"
  >
    <Checkbox v-if="selectionMode === 'multiple'" class="crs-option-item__checkbox" :model-value="selected" :disabled="disabled" :aria-label="label" visual-only @click.stop @update:model-value="select" />
    <UIcon v-if="icon" class="crs-option-item__leading" :name="icon" aria-hidden="true" />
    <Avatar v-if="avatarSrc" class="crs-option-item__avatar" :src="avatarSrc" :alt="avatarAlt || ''" :size="24" />
    <span v-if="logoSrc" class="crs-option-item__logo-wrap"><EntityLogo class="crs-option-item__logo" :src="logoSrc" :alt="logoAlt || ''" :label="logoAlt || label" :size="40" /></span>
    <span class="crs-option-item__copy">
      <small v-if="descriptionTop" class="crs-option-item__description">{{ descriptionTop }}</small>
      <span class="crs-option-item__main"><slot><span class="crs-option-item__label">{{ label }}</span></slot><Chip v-if="count !== undefined" class="crs-option-item__count" tone="brand" size="xs">{{ count }}</Chip></span>
      <small v-if="resolvedDescriptionBottom" class="crs-option-item__description">{{ resolvedDescriptionBottom }}</small>
    </span>
    <span v-if="meta" class="crs-option-item__meta">{{ meta }}</span>
    <UIcon v-if="trailingIcon" class="crs-option-item__trailing-icon" :name="trailingIcon" aria-hidden="true" />
    <UIcon v-if="trailingIconSecondary" class="crs-option-item__trailing-icon" :name="trailingIconSecondary" aria-hidden="true" />
    <slot name="trailing">
    </slot>
  </div>
</template>

<style scoped>
.crs-option-item{box-sizing:border-box;display:flex;width:100%;min-height:var(--crs-size-40);align-items:center;gap:var(--crs-space-12);border:0;border-radius:var(--crs-radius-0);background:transparent;padding:var(--crs-space-8) var(--crs-option-item-padding-right,var(--crs-space-24)) var(--crs-space-8) var(--crs-option-item-padding-left,var(--crs-space-16));color:var(--crs-black-850);font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);text-align:left;cursor:pointer}
.crs-option-item:hover:not([aria-disabled="true"]),.crs-option-item:focus-visible,.crs-option-item[data-selection-mode="single"][data-selected]{background:var(--crs-black-50);outline:0}
.crs-option-item[aria-disabled="true"]{color:var(--crs-black-300);cursor:not-allowed}
.crs-option-item__leading{width:var(--crs-size-24);height:var(--crs-size-24);flex:none}
.crs-option-item__leading{color:var(--crs-black-400)}
.crs-option-item__avatar{flex:none}
.crs-option-item__logo-wrap{display:flex;flex:none;align-items:center;padding-block:var(--crs-space-2)}
.crs-option-item__copy{display:flex;min-width:0;flex:1;flex-direction:column}
.crs-option-item__main{display:flex;min-width:0;align-items:center;gap:var(--crs-space-8);padding-block:var(--crs-space-2)}
.crs-option-item__label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crs-option-item__description,.crs-option-item__meta{overflow:hidden;color:var(--crs-black-500);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family);text-overflow:ellipsis;white-space:nowrap}
.crs-option-item__meta{flex:none;padding-block:var(--crs-space-2);text-align:right}
.crs-option-item__trailing-icon{width:var(--crs-size-24);height:var(--crs-size-24);flex:none;color:var(--crs-black-400)}
.crs-option-item__checkbox{flex:none}
</style>
