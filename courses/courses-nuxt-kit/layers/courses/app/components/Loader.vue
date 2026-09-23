<script setup lang="ts">withDefaults(defineProps<{label?:string}>(),{label:'Загрузка'})
</script>
<template><span class="crs-loader" role="status"><UIcon class="crs-loader__icon" name="i-tabler-loader-2"/><span class="sr-only">{{label}}</span></span></template>
<style scoped>.crs-loader{display:flex;width:100%;min-height:var(--crs-size-112);align-items:center;justify-content:center;color:var(--crs-blue-500)}.crs-loader__icon{display:block;width:var(--crs-size-48);height:var(--crs-size-48);transform-origin:center;animation:crs-loader-spin var(--crs-duration-loader) linear infinite}@keyframes crs-loader-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.crs-loader__icon{animation-duration:var(--crs-duration-loader-reduced)}}</style>
