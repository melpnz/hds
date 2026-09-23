<script setup lang="ts">type Row={label:string;value:string};defineProps<{rows:Row[]}>()
</script>
<template><dl class="crs-info"><div v-for="row in rows" :key="row.label"><dt>{{row.label}}</dt><dd>{{row.value}}</dd></div></dl></template>
<style scoped>.crs-info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--crs-space-12) var(--crs-space-16);margin:var(--crs-space-16) 0 0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-info div{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-4)}.crs-info dt{font-weight:600}.crs-info dd{margin:0;overflow-wrap:anywhere}@media(max-width:479px){.crs-info{grid-template-columns:1fr}}</style>
