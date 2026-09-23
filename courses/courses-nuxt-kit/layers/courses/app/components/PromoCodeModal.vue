<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<{ title?: string; code?: string; description?: string; expires?: string }>(), {
  title: 'Промокод',
  code: 'HABR20',
  description: 'Скидка 35% на курсы по дизайну',
  expires: 'Действует до 30 октября 2026'
})
function copy() {
  if (import.meta.client) globalThis.navigator.clipboard?.writeText(props.code)
}
</script>

<template>
  <Modal v-model="open" :title="title">
    <div class="crs-promo-modal"><div class="crs-promo-modal__offer"><strong>{{ description }}</strong><p>Введите промокод на сайте школы или назовите менеджеру при покупке.</p></div><p class="crs-promo-modal__expires"><UIcon class="crs-promo-modal__expires-icon" name="i-tabler-calendar-event" />{{ expires }}</p><div class="crs-promo-modal__code"><code>{{ code }}</code><Button size="l" block @click="copy">Скопировать и перейти</Button></div></div>
    <template #trigger><slot name="trigger" /></template>
    <template #footer><Button variant="secondary" block @click="open = false">Закрыть</Button></template>
  </Modal>
</template>

<style scoped>.crs-promo-modal{display:grid;gap:var(--crs-space-16)}.crs-promo-modal p{margin:0;color:var(--crs-black-500)}.crs-promo-modal__offer{display:grid;gap:var(--crs-space-8);border-radius:var(--crs-radius-12);background:var(--crs-blue-50);padding:var(--crs-space-16)}.crs-promo-modal__offer strong{font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}.crs-promo-modal__expires{display:flex;align-items:center;gap:var(--crs-space-8)}.crs-promo-modal__expires-icon{width:var(--crs-size-24);height:var(--crs-size-24)}.crs-promo-modal__code{display:grid;gap:var(--crs-space-12)}.crs-promo-modal code{display:block;border-radius:var(--crs-radius-12);background:var(--crs-black-50);padding:var(--crs-space-12);font-size:var(--crs-font-18);font-weight:700;letter-spacing:.08em;text-align:center}</style>
