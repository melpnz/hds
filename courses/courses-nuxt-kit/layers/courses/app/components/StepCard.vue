<script setup lang="ts">
withDefaults(defineProps<{ number: number; title: string; description?: string; open?: boolean }>(), { open: true })
</script>

<template>
  <LearningStep :number="number" :title="title" :open="open">
    <p v-if="description" class="crs-step-card__description">{{ description }}</p>
    <slot />
  </LearningStep>
</template>

<style scoped>
.crs-step-card__description{margin:0;color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
</style>
