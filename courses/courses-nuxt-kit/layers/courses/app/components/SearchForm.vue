<script setup lang="ts">
const query = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: [query: string] }>()
</script>

<template>
  <form class="crs-search-form" role="search" @submit.prevent="emit('submit', query)"><SearchInput v-model="query" size="xl" placeholder="Найти курс или школу" /><Button class="crs-search-form__submit" type="submit" size="xl">Найти</Button></form>
</template>

<style scoped>
.crs-search-form{display:grid;grid-template-columns:1fr auto;gap:var(--crs-space-8)}@media(max-width:479px){.crs-search-form{grid-template-columns:1fr}.crs-search-form__submit{width:100%}}
</style>
