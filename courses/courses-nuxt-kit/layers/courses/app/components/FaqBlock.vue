<script setup lang="ts">defineProps<{title?:string}>()
</script>
<template><section class="crs-faq-block"><h2>{{title||'Часто задаваемые вопросы'}}</h2><div class="crs-faq-block__list"><slot/></div></section></template>
<style scoped>.crs-faq-block{display:grid;gap:var(--crs-space-16)}.crs-faq-block__list{display:flex;flex-direction:column;gap:var(--crs-space-12)}.crs-faq-block h2{margin:0;font-size:calc(var(--crs-unit) * 28)}</style>
