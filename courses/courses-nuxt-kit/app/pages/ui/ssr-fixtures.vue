<script setup lang="ts">
const priceOpen = ref(true)
const from = ref('100')
const to = ref('500')
</script>

<template>
  <main>
    <h1>SSR regression fixtures</h1>
    <PriceSheet v-model="priceOpen" v-model:from="from" v-model:to="to" />
  </main>
</template>
