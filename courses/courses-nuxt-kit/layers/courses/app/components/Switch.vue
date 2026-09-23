<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
withDefaults(defineProps<{ label?: string; disabled?: boolean; loading?: boolean; state?: 'default' | 'hover' | 'focus' | 'disabled' }>(), { label: 'Переключатель', state: 'default' })
</script>

<template>
  <label class="crs-switch" :data-state="disabled ? 'disabled' : loading ? 'loading' : state" :aria-busy="loading || undefined">
    <input v-model="model" type="checkbox" role="switch" :disabled="disabled || loading">
    <span class="crs-switch__visual"><span class="crs-switch__surface" /><img class="crs-switch__dot" src="/courses/control-dot.svg" alt=""></span>
    <UIcon v-if="loading" class="crs-switch__loader" name="i-tabler-loader-2" />
    <span class="crs-switch__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.crs-switch{position:relative;display:inline-flex;width:max-content;max-width:100%;height:calc(var(--crs-unit) * 26);align-items:flex-start;gap:var(--crs-space-8);color:var(--crs-black-850);font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);cursor:pointer}.crs-switch input{position:absolute;width:var(--crs-border-1);height:var(--crs-border-1);margin:calc(var(--crs-border-1) * -1);overflow:hidden;clip:rect(0 0 0 0)}.crs-switch__visual{position:relative;box-sizing:border-box;width:var(--crs-size-40);height:var(--crs-size-24);flex:0 0 var(--crs-size-40)}.crs-switch__surface{position:absolute;top:var(--crs-border-1);left:var(--crs-border-1);width:calc(var(--crs-unit) * 38);height:var(--crs-size-22);border-radius:var(--crs-radius-full);background:var(--crs-black-150)}.crs-switch__dot{position:absolute;z-index:2;top:0;left:0;display:block;width:var(--crs-size-24);height:var(--crs-size-24);transition:left var(--crs-duration-fast) ease}.crs-switch input:checked+.crs-switch__visual .crs-switch__surface{background:var(--crs-black-850)}.crs-switch input:checked+.crs-switch__visual .crs-switch__dot{left:var(--crs-space-16)}.crs-switch:hover .crs-switch__surface,.crs-switch[data-state="hover"] .crs-switch__surface,.crs-switch[data-state="focus"] .crs-switch__surface{background:var(--crs-black-200)}.crs-switch:hover input:checked+.crs-switch__visual .crs-switch__surface,.crs-switch[data-state="hover"] input:checked+.crs-switch__visual .crs-switch__surface,.crs-switch[data-state="focus"] input:checked+.crs-switch__visual .crs-switch__surface{background:var(--crs-black-850-alpha-80)}.crs-switch input:focus-visible+.crs-switch__visual,.crs-switch[data-state="focus"] .crs-switch__visual{border-radius:var(--crs-radius-full);outline:var(--crs-border-2) solid var(--crs-black-400)}.crs-switch[data-state="disabled"],.crs-switch[data-state="loading"]{color:var(--crs-black-500);cursor:not-allowed}.crs-switch[data-state="disabled"] .crs-switch__surface{background:var(--crs-black-100)}.crs-switch[data-state="disabled"] input:checked+.crs-switch__visual .crs-switch__surface{background:var(--crs-black-200)}.crs-switch[data-state="loading"] .crs-switch__visual{display:none}.crs-switch__loader{width:var(--crs-size-24);height:var(--crs-size-24);color:var(--crs-black-400);animation:crs-switch-spin var(--crs-duration-loader) linear infinite}.crs-switch__label{padding-top:var(--crs-border-1)}@keyframes crs-switch-spin{to{transform:rotate(360deg)}}
</style>
