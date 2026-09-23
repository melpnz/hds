<script setup lang="ts">withDefaults(defineProps<{columns?:2|3|4}>(),{columns:4})
</script>
<template><div class="crs-grid" :style="{ '--crs-columns': columns }"><slot/></div></template>
<style scoped>.crs-grid{display:grid;grid-template-columns:repeat(var(--crs-columns),minmax(0,1fr));gap:var(--crs-space-12)}@media(max-width:1023px){.crs-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:767px){.crs-grid{grid-template-columns:1fr}}</style>
