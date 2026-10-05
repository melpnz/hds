<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  label?: string
  shape?: 'rounded' | 'circle'
  size?: 20 | 24 | 32 | 36 | 40 | 48 | 56 | 68 | 100 | 's' | 'm' | 'l'
}>(), { alt: '', label: 'Школа', size: 'm', shape: 'rounded' })

const pixels = computed(() => typeof props.size === 'number'
  ? props.size
  : ({ s: 32, m: 40, l: 68 } as const)[props.size])
</script>

<template>
  <span v-if="shape === 'circle'" class="crs-logo" :data-size="size" data-shape="circle"><img :src="src || '/courses/avatar-default-company.svg'" :alt="alt" :width="pixels" :height="pixels"></span>
  <img v-else class="crs-logo" :src="src || '/courses/avatar-default-company.svg'" :alt="alt" :width="pixels" :height="pixels" :data-empty="!src || undefined" :data-size="size" :data-shape="shape">
</template>
<style scoped>
.crs-logo{display:block;width:var(--crs-size-40);height:var(--crs-size-40);flex:none;overflow:hidden;border:0;border-radius:var(--crs-radius-12);background:var(--crs-black-50);object-fit:contain}.crs-logo[data-size="s"],.crs-logo[data-size="32"]{width:var(--crs-size-32);height:var(--crs-size-32);border-radius:var(--crs-radius-8)}.crs-logo[data-size="24"]{width:var(--crs-size-24);height:var(--crs-size-24);border-radius:var(--crs-radius-6)}.crs-logo[data-size="36"]{width:var(--crs-size-36);height:var(--crs-size-36)}.crs-logo[data-size="40"],.crs-logo[data-size="m"]{width:var(--crs-size-40);height:var(--crs-size-40)}.crs-logo[data-size="48"]{width:var(--crs-size-48);height:var(--crs-size-48)}.crs-logo[data-size="56"]{width:var(--crs-size-56);height:var(--crs-size-56)}.crs-logo[data-size="68"],.crs-logo[data-size="l"]{width:var(--crs-size-68);height:var(--crs-size-68);border-radius:var(--crs-radius-16)}.crs-logo[data-size="100"]{width:var(--crs-size-100);height:var(--crs-size-100);border-radius:var(--crs-radius-24)}
.crs-logo[data-shape="circle"][data-size]{border-radius:var(--crs-radius-full)}
.crs-logo[data-size="20"]{width:var(--crs-size-20);height:var(--crs-size-20)}
.crs-logo[data-shape="circle"] img{display:block;width:calc(100% + var(--crs-space-4));height:calc(100% + var(--crs-space-4));max-width:none;margin:calc(var(--crs-space-2) * -1);object-fit:cover}
</style>
