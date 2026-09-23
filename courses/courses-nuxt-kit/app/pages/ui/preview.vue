<script setup lang="ts">
import { coursesRegistry } from '#layers/courses/app/data/coursesRegistry'

const route = useRoute()
const entry = computed(() => coursesRegistry.find(item => item.id === String(route.query.component)) || coursesRegistry[0]!)
const siteHeaderVariant = computed(() => String(route.query.variant || 'listing-hero'))
</script>

<template>
  <main class="isolated-preview">
    <CoursesCatalogDemo :entry="entry" :site-header-variant="siteHeaderVariant" />
  </main>
</template>

<style scoped>
.isolated-preview{box-sizing:border-box;min-height:100vh;background:#fff;padding:1.5rem}
.isolated-preview :deep(.demo-wide){margin:-1.5rem}
@media(max-width:479px){.isolated-preview{padding:1.5rem}.isolated-preview :deep(.demo-wide){margin:-1.5rem}}
</style>
