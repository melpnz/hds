<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'main' | 'secondary' | 'danger' | 'danger-outline' | 'success' | 'success-outline' | 'ghost' | 'brand'
  size?: 's' | 'm' | 'l' | 'xl'
  density?: 'default' | 'compact'
  block?: boolean
  loading?: boolean
  disabled?: boolean
  state?: 'default' | 'hover' | 'focus' | 'pressed'
  type?: 'button' | 'submit' | 'reset'
  href?: string
  target?: string
  rel?: string
  rotated?: boolean
}>(), { variant: 'main', size: 'm', density: 'default', state: 'default', type: 'button', rotated: false })

const tone = computed(() => props.variant === 'primary' ? 'main' : props.variant)
const resolvedSize = computed(() => props.size === 's' ? 'm' : props.size)
function onClick(event: MouseEvent) { if (props.href && (props.disabled || props.loading)) event.preventDefault() }
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :type="href ? undefined : type"
    :href="href && !disabled && !loading ? href : undefined"
    :target="href ? target : undefined"
    :rel="href ? rel : undefined"
    class="crs-button"
    :class="[`crs-button--${tone}`, `crs-button--${resolvedSize}`, `crs-button--${density}`, {
      'crs-button--block': block,
      'crs-button--leading': $slots.leading,
      'crs-button--trailing': $slots.trailing,
      'crs-button--rotated': rotated,
    }]"
    :data-state="loading ? 'loading' : state"
    :disabled="href ? undefined : disabled || loading"
    :aria-disabled="href && (disabled || loading) || undefined"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <UIcon v-if="loading" name="i-tabler-loader-2" class="crs-button__loader" />
    <span v-if="$slots.leading" class="crs-button__icon"><slot name="leading" /></span>
    <span v-if="$slots.default" class="crs-button__label"><slot /></span>
    <span v-if="$slots.trailing" class="crs-button__icon"><slot name="trailing" /></span>
  </component>
</template>

<style scoped>
.crs-button{--button-fill:var(--crs-black-850);--button-hover:var(--crs-brand-hover);--button-border:var(--button-fill);--button-text:var(--crs-white);--button-focus:var(--crs-black-500);position:relative;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:var(--button-gap);height:var(--button-height);padding:0 var(--button-padding);border:var(--crs-border-1) solid var(--button-border);border-radius:var(--crs-radius-12);background:var(--button-fill);color:var(--button-text);font:600 var(--button-font-size)/var(--button-line-height) var(--crs-font-family);white-space:nowrap;cursor:pointer;transition:background-color var(--crs-duration-fast) ease,border-color var(--crs-duration-fast) ease,box-shadow var(--crs-duration-fast) ease}
.crs-button--m{--button-height:var(--crs-size-40);--button-padding:var(--crs-space-16);--button-icon-padding:var(--crs-space-8);--button-gap:var(--crs-space-4);--button-font-size:var(--crs-font-14);--button-line-height:var(--crs-leading-20)}
.crs-button--l{--button-height:var(--crs-size-48);--button-padding:var(--crs-space-20);--button-icon-padding:var(--crs-space-12);--button-gap:var(--crs-space-6);--button-font-size:var(--crs-font-16);--button-line-height:var(--crs-leading-24)}
.crs-button--xl{--button-height:var(--crs-size-56);--button-padding:var(--crs-space-24);--button-icon-padding:var(--crs-space-16);--button-gap:var(--crs-space-8);--button-font-size:var(--crs-font-16);--button-line-height:var(--crs-leading-24)}
.crs-button--compact{--button-padding:var(--crs-space-12);--button-icon-padding:var(--crs-space-8);--button-gap:var(--crs-space-6);--button-icon-size:var(--crs-size-20)}
.crs-button--leading{padding-left:var(--button-icon-padding)}
.crs-button--trailing{padding-right:var(--button-icon-padding)}
.crs-button--secondary{--button-fill:var(--crs-black-50);--button-hover:var(--crs-black-100);--button-border:var(--button-fill);--button-text:var(--crs-black-850);--button-focus:var(--crs-black-400)}
.crs-button--danger{--button-fill:var(--crs-red);--button-hover:var(--crs-red-hover);--button-border:var(--button-fill);--button-focus:var(--crs-red-hover)}
.crs-button--danger-outline{--button-fill:var(--crs-white);--button-hover:var(--crs-red-50);--button-border:var(--crs-red-hover);--button-text:var(--crs-red);--button-focus:var(--crs-red-hover)}
.crs-button--success{--button-fill:var(--crs-green);--button-hover:var(--crs-green-hover);--button-border:var(--button-fill);--button-focus:var(--crs-green-hover)}
.crs-button--success-outline{--button-fill:var(--crs-white);--button-hover:var(--crs-green-50);--button-border:var(--crs-green-hover);--button-text:var(--crs-green);--button-focus:var(--crs-green-hover)}
.crs-button--ghost{--button-fill:transparent;--button-hover:var(--crs-black-50);--button-border:transparent;--button-text:var(--crs-black-850);--button-focus:var(--crs-black-400)}
.crs-button--brand{--button-fill:var(--crs-blue-500);--button-hover:var(--crs-blue-600);--button-border:var(--button-fill);--button-text:var(--crs-white);--button-focus:var(--crs-blue-300)}
.crs-button:hover:not(:disabled),.crs-button[data-state="hover"],.crs-button[data-state="pressed"],.crs-button:active:not(:disabled){background:var(--button-hover);border-color:var(--button-hover)}
.crs-button--danger-outline:hover:not(:disabled),.crs-button--success-outline:hover:not(:disabled){border-color:var(--button-focus)}
.crs-button:focus-visible,.crs-button[data-state="focus"]{outline:none;box-shadow:0 0 0 var(--crs-space-2) var(--crs-white),0 0 0 calc(var(--crs-unit) * 3) var(--button-focus)}
.crs-button:disabled,.crs-button[aria-disabled="true"]{border-color:var(--crs-black-150);background:var(--crs-black-150);color:var(--crs-white);cursor:not-allowed}
.crs-button--secondary:disabled,.crs-button--danger-outline:disabled,.crs-button--success-outline:disabled,.crs-button--ghost:disabled,.crs-button--secondary[aria-disabled="true"],.crs-button--danger-outline[aria-disabled="true"],.crs-button--success-outline[aria-disabled="true"],.crs-button--ghost[aria-disabled="true"]{border-color:var(--crs-black-50);background:var(--crs-white);color:var(--crs-black-200)}
.crs-button--block { width:100%; }
.crs-button__icon{display:grid;width:var(--button-icon-size,var(--crs-size-24));height:var(--button-icon-size,var(--crs-size-24));flex:none;place-items:center;transition:transform var(--crs-duration-fast) var(--crs-ease)}
.crs-button__icon>:slotted(*){width:100%;height:100%}
.crs-button__label{display:var(--button-label-display,block)}
.crs-button--rotated .crs-button__icon{transform:rotate(180deg)}
.crs-button__loader{width:var(--crs-size-16)!important;height:var(--crs-size-16)!important;animation:crs-spin var(--crs-duration-loader) linear infinite}
@keyframes crs-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.crs-button__loader{animation:none}}
</style>
