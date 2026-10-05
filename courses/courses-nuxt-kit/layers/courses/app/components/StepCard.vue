<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="crs-step-card">
    <strong>{{ title }}</strong>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.crs-step-card{box-sizing:border-box;display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-4);border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850);font-family:var(--crs-font-family)}
.crs-step-card strong{font-size:var(--crs-font-16);font-weight:600;line-height:1.3}
.crs-step-card p{margin:0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
</style>
