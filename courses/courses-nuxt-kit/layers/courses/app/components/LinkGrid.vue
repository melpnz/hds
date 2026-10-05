<script setup lang="ts">
type Item = { label: string; href?: string; description?: string; count?: string | number }
const props = withDefaults(defineProps<{ items: Item[]; collapsed?: boolean; promo?: boolean }>(), { collapsed: true, promo: false })
const expanded = ref(!props.collapsed)
const columns = ref(3)
const visibleItems = computed(() => expanded.value ? props.items : props.items.slice(0, columns.value * 3))
const canExpand = computed(() => props.items.length > columns.value * 3)
function resize() { columns.value = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3 }
onMounted(() => { resize(); window.addEventListener('resize', resize) })
onBeforeUnmount(() => window.removeEventListener('resize', resize))
</script>
<template>
  <div class="crs-link-grid-wrap">
    <div class="crs-link-grid" :data-expanded="expanded" :data-promo="promo">
      <Link v-for="item in visibleItems" :key="item.label" class="crs-link-grid__link" :href="item.href || '#'" tone="inherit" layout="flex" decoration="none">
        <span class="crs-link-grid__label">{{ item.label }}</span>
        <small v-if="promo ? item.description : item.count ?? item.description"><UIcon v-if="promo" name="i-tabler-percentage" aria-hidden="true" />{{ promo ? item.description : item.count ?? item.description }}</small>
      </Link>
    </div>
    <Link v-if="canExpand" as="button" class="crs-link-grid__toggle" decoration="none" :aria-expanded="expanded" @click="expanded = !expanded">{{ expanded ? 'Свернуть' : 'Смотреть все' }}</Link>
  </div>
</template>
<style scoped>
.crs-link-grid-wrap{display:grid;gap:var(--crs-space-16)}
.crs-link-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--crs-space-16);row-gap:var(--crs-space-8)}
.crs-link-grid__link,.crs-link-grid__link:hover{display:flex;min-width:0;align-items:baseline;gap:var(--crs-space-6);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-link-grid__label{min-width:0;max-width:calc(100% - var(--crs-size-36));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crs-link-grid__link:hover .crs-link-grid__label{text-decoration:underline}
.crs-link-grid small{flex:none;color:var(--crs-black-500);font:inherit}
.crs-link-grid[data-promo="true"]{row-gap:var(--crs-space-16)}
.crs-link-grid[data-promo="true"] .crs-link-grid__link{flex-direction:column;align-items:flex-start;gap:var(--crs-space-4)}
.crs-link-grid[data-promo="true"] small{display:flex;align-items:center;gap:var(--crs-space-4);color:var(--crs-violet-500);font-weight:600}
.crs-link-grid[data-promo="true"] small .iconify{width:var(--crs-size-20);height:var(--crs-size-20);flex:none}
.crs-link-grid__toggle,.crs-link-grid__toggle:hover{display:inline-flex;width:max-content;align-items:center;border:0;background:transparent;padding:0;color:var(--crs-blue-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);cursor:pointer}
@media(max-width:1023px){.crs-link-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:767px){.crs-link-grid{grid-template-columns:1fr}}
</style>
