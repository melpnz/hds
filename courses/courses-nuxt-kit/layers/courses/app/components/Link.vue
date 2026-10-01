<script setup lang="ts">
const props = withDefaults(defineProps<{ href?: string; external?: boolean; muted?: boolean; tone?: 'brand' | 'inherit' | 'muted'; layout?: 'inline' | 'block' | 'flex' | 'grid'; decoration?: 'hover' | 'none'; as?: 'a' | 'button'; target?: string; rel?: string }>(), { href: '#', tone: 'brand', layout: 'inline', decoration: 'hover', as: 'a' })
const NuxtLink = resolveComponent('NuxtLink')
const internal = computed(() => props.as === 'a' && !props.external && !props.target && props.href.startsWith('/') && !props.href.startsWith('//'))
</script>

<template>
  <component :is="internal ? NuxtLink : as" class="crs-link" :class="[`crs-link--${tone}`, `crs-link--${layout}`, `crs-link--decoration-${decoration}`, { 'crs-link--muted': muted }]" :to="internal ? href : undefined" :href="!internal && as === 'a' ? href : undefined" :type="as === 'button' ? 'button' : undefined" :target="as === 'a' ? target || (external ? '_blank' : undefined) : undefined" :rel="as === 'a' ? rel || (external ? 'noreferrer' : undefined) : undefined">
    <slot /> <UIcon v-if="external" name="i-tabler-external-link" />
  </component>
</template>

<style scoped>
:where(.crs-link) { align-items:center; gap:var(--crs-space-4); border:0; background:transparent; padding:0; color:var(--crs-blue-500); font:inherit; text-decoration:none; cursor:pointer; }
:where(.crs-link--inline) { display:inline-flex; }
:where(.crs-link--block) { display:block; }
:where(.crs-link--flex) { display:flex; }
:where(.crs-link--grid) { display:grid; }
:where(.crs-link--muted) { color:var(--crs-black-500); }
:where(.crs-link--inherit) { color:inherit; }
:where(.crs-link:hover) { color:var(--crs-blue-600); }
:where(.crs-link--decoration-hover:hover) { text-decoration:underline; }
:where(.crs-link--decoration-none:hover) { color:inherit; text-decoration:none; }
:where(.crs-link:focus-visible) { border-radius:var(--crs-radius-4); outline:none; box-shadow:var(--crs-focus); }
</style>
