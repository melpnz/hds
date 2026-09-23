<script setup lang="ts">
withDefaults(defineProps<{ label: string; icon?: string; variant?: 'default' | 'ghost'; size?: 's' | 'm'; iconSize?: 16 | 20 | 24; tone?: 'default' | 'muted' | 'inherit'; hover?: 'background' | 'none'; disabled?: boolean; loading?: boolean; rotated?: boolean; state?: 'default' | 'hover' | 'focus' }>(), { icon: 'i-tabler-dots', variant: 'default', size: 'm', tone: 'default', hover: 'background', state: 'default' })
</script>

<template>
  <button class="crs-icon-button" :class="[`crs-icon-button--${variant}`, `crs-icon-button--${size}`, `crs-icon-button--${tone}`, `crs-icon-button--hover-${hover}`, iconSize ? `crs-icon-button--icon-${iconSize}` : undefined, { 'crs-icon-button--rotated': rotated }]" type="button" :disabled="disabled || loading" :aria-label="label" :aria-busy="loading || undefined" :data-state="state">
    <UIcon class="crs-icon-button__icon" :name="loading ? 'i-tabler-loader-2' : icon" aria-hidden="true" />
  </button>
</template>

<style scoped>
.crs-icon-button{box-sizing:border-box;display:inline-flex;width:var(--icon-button-size);height:var(--icon-button-size);align-items:center;justify-content:center;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-full);background:var(--crs-white);padding:var(--icon-button-padding);color:var(--crs-black-400);box-shadow:var(--crs-shadow-control);cursor:pointer}
.crs-icon-button--m{--icon-button-size:var(--crs-size-36);--icon-button-icon-size:var(--crs-size-24);--icon-button-padding:calc(var(--crs-unit) * 5)}
.crs-icon-button--s{--icon-button-size:var(--crs-size-24);--icon-button-icon-size:var(--crs-size-20);--icon-button-padding:var(--crs-space-2)}
.crs-icon-button--icon-16{--icon-button-icon-size:var(--crs-size-16)}
.crs-icon-button--icon-20{--icon-button-icon-size:var(--crs-size-20)}
.crs-icon-button--icon-24{--icon-button-icon-size:var(--crs-size-24);--icon-button-padding:0}
.crs-icon-button--muted{color:var(--crs-black-500)}
.crs-icon-button--inherit{color:inherit}
.crs-icon-button--ghost{border:0;background:transparent;box-shadow:none}
.crs-icon-button__icon{display:block;width:var(--icon-button-icon-size);height:var(--icon-button-icon-size);flex:none;transition:transform var(--crs-duration-fast) var(--crs-ease)}
.crs-icon-button--rotated .crs-icon-button__icon{transform:rotate(180deg)}
.crs-icon-button:hover:not(:disabled),.crs-icon-button[data-state="hover"]{color:var(--crs-black-850)}
.crs-icon-button--inherit:hover:not(:disabled),.crs-icon-button--inherit[data-state="hover"],.crs-icon-button--inherit:focus-visible,.crs-icon-button--inherit[data-state="focus"]{color:inherit}
.crs-icon-button--ghost:hover:not(:disabled),.crs-icon-button--ghost[data-state="hover"]{background:var(--crs-black-50)}
.crs-icon-button--hover-none:hover:not(:disabled),.crs-icon-button--hover-none[data-state="hover"]{background:transparent}
.crs-icon-button:focus-visible,.crs-icon-button[data-state="focus"]{color:var(--crs-black-850);outline:0;box-shadow:var(--crs-focus),var(--crs-shadow-control)}
.crs-icon-button--ghost:focus-visible,.crs-icon-button--ghost[data-state="focus"]{background:var(--crs-black-50);box-shadow:var(--crs-focus)}
.crs-icon-button--ghost.crs-icon-button--hover-none:focus-visible,.crs-icon-button--ghost.crs-icon-button--hover-none[data-state="focus"]{background:transparent}
.crs-icon-button:disabled{border-color:var(--crs-black-50);color:var(--crs-black-200);cursor:not-allowed}
.crs-icon-button--ghost:disabled{background:transparent}
.crs-icon-button[aria-busy="true"] .crs-icon-button__icon{animation:crs-icon-spin var(--crs-duration-loader) linear infinite}
@keyframes crs-icon-spin{to{transform:rotate(360deg)}}
</style>
