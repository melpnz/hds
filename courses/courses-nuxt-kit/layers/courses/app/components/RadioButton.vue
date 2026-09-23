<script setup lang="ts">
const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{ value: string; label?: string; name?: string; disabled?: boolean; loading?: boolean; state?: 'default' | 'hover' | 'focus' | 'disabled' }>(), { label: 'Вариант', name: 'courses-radio', state: 'default' })
</script>

<template>
  <label class="crs-radio" :data-state="disabled ? 'disabled' : loading ? 'loading' : state" :aria-busy="loading || undefined">
    <input v-model="model" type="radio" :name="name" :value="value" :disabled="disabled || loading">
    <span class="crs-radio__visual"><span /></span>
    <UIcon v-if="loading" class="crs-radio__loader" name="i-tabler-loader-2" />
    <span class="crs-radio__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.crs-radio{position:relative;display:inline-flex;width:max-content;max-width:100%;height:calc(var(--crs-unit) * 26);align-items:flex-start;gap:var(--crs-space-8);color:var(--crs-black-850);font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);cursor:pointer}.crs-radio input{position:absolute;width:var(--crs-border-1);height:var(--crs-border-1);margin:calc(var(--crs-border-1) * -1);overflow:hidden;clip:rect(0 0 0 0)}.crs-radio__visual{position:relative;box-sizing:border-box;width:var(--crs-size-24);height:var(--crs-size-24);flex:0 0 var(--crs-size-24)}.crs-radio__visual span{position:absolute;inset:var(--crs-border-1);width:var(--crs-size-22);height:var(--crs-size-22);border-radius:var(--crs-radius-full);background:var(--crs-black-150)}.crs-radio input:checked+.crs-radio__visual span{background:var(--crs-black-850)}.crs-radio input:checked+.crs-radio__visual span:after{position:absolute;inset:calc(var(--crs-unit) * 5);border-radius:var(--crs-radius-full);background:var(--crs-white);content:""}.crs-radio:hover .crs-radio__visual span,.crs-radio[data-state="hover"] .crs-radio__visual span,.crs-radio[data-state="focus"] .crs-radio__visual span{background:var(--crs-black-200)}.crs-radio:hover input:checked+.crs-radio__visual span,.crs-radio[data-state="hover"] input:checked+.crs-radio__visual span,.crs-radio[data-state="focus"] input:checked+.crs-radio__visual span{background:var(--crs-black-850-alpha-80)}.crs-radio input:focus-visible+.crs-radio__visual,.crs-radio[data-state="focus"] .crs-radio__visual{border-radius:var(--crs-radius-full);outline:var(--crs-border-2) solid var(--crs-black-400)}.crs-radio[data-state="disabled"],.crs-radio[data-state="loading"]{color:var(--crs-black-500);cursor:not-allowed}.crs-radio[data-state="disabled"] .crs-radio__visual span{background:var(--crs-black-100)}.crs-radio[data-state="disabled"] input:checked+.crs-radio__visual span{background:var(--crs-black-200)}.crs-radio[data-state="loading"] .crs-radio__visual{display:none}.crs-radio__loader{width:var(--crs-size-24);height:var(--crs-size-24);color:var(--crs-black-400);animation:crs-radio-spin var(--crs-duration-loader) linear infinite}.crs-radio__label{padding-top:var(--crs-border-1)}@keyframes crs-radio-spin{to{transform:rotate(360deg)}}
</style>
