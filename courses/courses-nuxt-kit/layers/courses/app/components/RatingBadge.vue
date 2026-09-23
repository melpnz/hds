<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  reviews?: number
  variant?: 'summary' | 'stars'
  size?: 's' | 'm'
}>(), {
  reviews: 6,
  variant: 'summary',
  size: 's'
})

const formattedValue = computed(() => props.value.toFixed(2))
</script>

<template>
  <span class="crs-rating" :data-variant="variant" :data-size="size">
    <template v-if="variant === 'stars'">
      <UIcon v-for="star in Math.round(value)" :key="star" name="i-tabler-star-filled" />
    </template>
    <template v-else>
      <span><UIcon name="i-tabler-star-filled" /><span>{{ formattedValue }}</span></span>
      <span><UIcon name="i-tabler-message-circle-filled" />{{ reviews }}</span>
    </template>
  </span>
</template>

<style scoped>
.crs-rating{display:inline-flex;align-items:center;gap:var(--crs-space-8);border-radius:var(--crs-radius-full);background:var(--crs-white);padding:var(--crs-space-4) var(--crs-space-8) var(--crs-space-4) var(--crs-space-6);color:var(--crs-black-850);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}
.crs-rating>span{display:inline-flex;align-items:center;gap:var(--crs-space-4)}
.crs-rating>span:last-child{gap:var(--crs-space-2)}
.crs-rating .iconify{width:var(--crs-size-16);height:var(--crs-size-16);flex:none}
.crs-rating>span:first-child .iconify{color:var(--crs-yellow-500)}
.crs-rating>span:last-child .iconify{color:var(--crs-black-400)}
.crs-rating[data-size="m"]{background:transparent;padding:0;font-size:var(--crs-font-14);line-height:var(--crs-leading-20)}
.crs-rating[data-variant="stars"]{gap:0;background:transparent;padding:0;color:var(--crs-yellow-500)}
.crs-rating[data-variant="stars"] .iconify{width:var(--crs-size-24);height:var(--crs-size-24)}
</style>
