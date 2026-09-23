<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  name?: string
  size?: 24 | 32 | 36 | 40 | 48 | 56 | 68 | 100 | 's' | 'm' | 'person' | 'l'
}>(), {
  alt: '',
  name: 'Пользователь',
  size: 'm'
})

const fallback = '/courses/avatar-default-user.svg'
const failed = ref(false)
const resolvedSrc = computed(() => failed.value || !props.src ? fallback : props.src)
const isEmpty = computed(() => failed.value || !props.src)
const pixels = computed(() => typeof props.size === 'number'
  ? props.size
  : ({ s: 24, m: 40, person: 68, l: 100 } as const)[props.size])
const cssSize = computed(() => `${pixels.value / 16}rem`)

watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <img
    class="crs-avatar"
    :class="{ 'crs-avatar--empty': isEmpty }"
    :src="resolvedSrc"
    :alt="alt"
    :title="alt || undefined"
    :style="{ '--avatar-size': cssSize }"
    :data-empty="isEmpty || undefined"
    @error="failed = true"
  >
</template>

<style scoped>
.crs-avatar{display:block;width:var(--avatar-size);height:var(--avatar-size);flex:0 0 var(--avatar-size);overflow:hidden;border:0;border-radius:var(--crs-radius-full);background:var(--crs-black-50);object-fit:cover}.crs-avatar--empty{object-fit:contain}
</style>
