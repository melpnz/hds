<script setup lang="ts">withDefaults(defineProps<{title?:string;description?:string;space?:'s'|'m'|'l'}>(),{space:'m'})
</script>
<template><section class="crs-section" :class="`crs-section--${space}`"><header v-if="title||description" class="crs-section__header"><h2 v-if="title">{{title}}</h2><p v-if="description">{{description}}</p></header><slot/></section></template>
<style scoped>.crs-section{display:grid}.crs-section--s{gap:var(--crs-space-16)}.crs-section--m{gap:var(--crs-space-24)}.crs-section--l{gap:var(--crs-space-40)}.crs-section__header{display:grid;gap:var(--crs-space-6)}.crs-section__header h2{margin:0;font:600 var(--crs-font-24)/var(--crs-leading-28) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}.crs-section p{margin:0;color:var(--crs-black-500)}</style>
