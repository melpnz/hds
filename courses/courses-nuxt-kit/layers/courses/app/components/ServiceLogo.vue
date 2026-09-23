<script setup lang="ts">
const props = withDefaults(defineProps<{
  service: 'habr' | 'qna' | 'career' | 'courses'
  size?: 16 | 24 | 32
  label?: string
  variant?: 'icon' | 'brand'
}>(), { size: 24, label: '', variant: 'icon' })

const isCoursesBrand = computed(() => props.service === 'courses' && props.variant === 'brand')
const source = computed(() => isCoursesBrand.value ? '/courses/brand/courses-logo.svg' : `/courses/services/${props.service}.svg`)
const width = computed(() => isCoursesBrand.value ? Math.round(props.size * 97 / 32) : props.size)
const cssWidth = computed(() => `${width.value / 16}rem`)
const cssHeight = computed(() => `${props.size / 16}rem`)
</script>

<template>
  <img class="crs-service-logo" :src="source" :width="width" :height="size" :alt="label" :data-variant="variant" :style="{ '--crs-service-logo-width': cssWidth, '--crs-service-logo-height': cssHeight }">
</template>

<style scoped>
.crs-service-logo{display:block;width:var(--crs-service-logo-width);height:var(--crs-service-logo-height);flex:none;border-radius:calc(var(--crs-service-logo-height) / 8)}
.crs-service-logo[data-variant="brand"]{border-radius:0}
</style>
