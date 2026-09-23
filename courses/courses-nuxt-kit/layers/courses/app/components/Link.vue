<script setup lang="ts">
withDefaults(defineProps<{ href?: string; external?: boolean; muted?: boolean; tone?: 'brand' | 'inherit' | 'muted'; layout?: 'inline' | 'block' | 'flex' | 'grid'; decoration?: 'hover' | 'none'; as?: 'a' | 'button'; target?: string; rel?: string }>(), { href: '#', tone: 'brand', layout: 'inline', decoration: 'hover', as: 'a' })
</script>

<template>
  <component :is="as" class="crs-link" :class="[`crs-link--${tone}`, `crs-link--${layout}`, `crs-link--decoration-${decoration}`, { 'crs-link--muted': muted }]" :href="as === 'a' ? href : undefined" :type="as === 'button' ? 'button' : undefined" :target="as === 'a' ? target || (external ? '_blank' : undefined) : undefined" :rel="as === 'a' ? rel || (external ? 'noreferrer' : undefined) : undefined">
    <slot /> <UIcon v-if="external" name="i-tabler-external-link" />
  </component>
</template>

<style scoped>
.crs-link { align-items:center; gap:var(--crs-space-4); border:0; background:transparent; padding:0; color:var(--crs-blue-500); font:inherit; text-decoration:none; cursor:pointer; }
.crs-link--inline { display:inline-flex; }
.crs-link--block { display:block; }
.crs-link--flex { display:flex; }
.crs-link--grid { display:grid; }
.crs-link:hover { color:var(--crs-blue-600); }
.crs-link--decoration-hover:hover { text-decoration:underline; }
.crs-link--decoration-none:hover { color:inherit; text-decoration:none; }
.crs-link:focus-visible { border-radius:var(--crs-radius-4); outline:none; box-shadow:var(--crs-focus); }
.crs-link--muted { color:var(--crs-black-500); }
.crs-link--inherit { color:inherit; }
</style>
