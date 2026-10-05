<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<{ title?: string; code?: string; description?: string; conditions?: string; expires?: string; href?: string }>(), {
  title: 'Промокод',
  code: 'HABR20',
  description: 'Скидка 35% на курсы по дизайну',
  expires: 'Действует до 30 октября 2026',
  href: ''
})
const destination = computed(() => props.href && props.href !== '#' ? props.href : undefined)
const copyFailed = ref(false)
watch(open, () => { copyFailed.value = false })
async function copy() {
  if (!props.code) return
  try {
    await globalThis.navigator.clipboard.writeText(props.code)
  } catch {
    copyFailed.value = true
  }
}
</script>

<template>
  <Modal v-model="open" :title="title">
    <div class="crs-promo-modal">
      <div class="crs-promo-modal__offer"><strong>{{ description }}</strong><p v-if="conditions">{{ conditions }}</p></div>
      <p v-if="expires" class="crs-promo-modal__expires"><UIcon class="crs-promo-modal__expires-icon" name="i-tabler-calendar-event" />{{ expires }}</p>
      <div v-if="code" class="crs-promo-modal__code">
        <code>{{ code }}</code>
        <Button size="l" block :href="destination" :target="destination ? '_blank' : undefined" :rel="destination ? 'noopener noreferrer' : undefined" @click="copy">{{ destination ? 'Скопировать и перейти' : 'Скопировать' }}</Button>
      </div>
      <Button v-else size="l" block :href="destination" :target="destination ? '_blank' : undefined" :rel="destination ? 'noopener noreferrer' : undefined" :disabled="!destination">Перейти на сайт</Button>
      <p v-if="copyFailed" role="status">Не удалось скопировать автоматически. Выделите код и скопируйте вручную.</p>
    </div>
    <template #trigger><slot name="trigger" /></template>
    <template #footer><Button variant="secondary" block @click="open = false">Закрыть</Button></template>
  </Modal>
</template>

<style scoped>
.crs-promo-modal{display:grid;gap:var(--crs-space-24)}
.crs-promo-modal p{margin:0}
.crs-promo-modal__offer{display:grid;gap:var(--crs-space-4)}
.crs-promo-modal__offer strong{font:600 var(--crs-font-16)/var(--crs-leading-20) var(--crs-font-family)}
.crs-promo-modal__expires{display:flex;align-items:center;gap:var(--crs-space-8)}
.crs-promo-modal__expires-icon{width:var(--crs-size-24);height:var(--crs-size-24);color:var(--crs-black-400)}
.crs-promo-modal__code{display:grid;border-radius:var(--crs-radius-12);background:var(--crs-blue-50)}
.crs-promo-modal code{display:block;padding:var(--crs-space-16);color:var(--crs-blue-500);font:600 var(--crs-font-24)/var(--crs-leading-28) var(--crs-font-family);text-align:center;overflow-wrap:anywhere;user-select:text}
</style>
