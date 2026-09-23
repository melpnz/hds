<script setup lang="ts">
type ToastTone = 'info' | 'success' | 'warning' | 'error'

const visible = defineModel<boolean>({ default: true })
const props = withDefaults(defineProps<{
  tone?: ToastTone
  text?: string
  closable?: boolean
}>(), { tone: 'info', text: 'Сообщение', closable: true })
const emit = defineEmits<{ close: [] }>()

const live = computed(() => props.tone === 'warning' || props.tone === 'error' ? 'assertive' : 'polite')
const role = computed(() => props.tone === 'warning' || props.tone === 'error' ? 'alert' : 'status')

function close() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="crs-toast" :class="`crs-toast--${tone}`" :role="role" :aria-live="live">
    <span class="crs-toast__text"><slot>{{ text }}</slot></span>
    <IconButton v-if="closable" class="crs-toast__close" label="Закрыть уведомление" icon="i-tabler-x" variant="ghost" size="s" :icon-size="24" tone="inherit" hover="none" @click="close" />
  </div>
</template>

<style scoped>
.crs-toast{box-sizing:border-box;display:flex;width:max-content;max-width:100%;align-items:flex-start;gap:var(--crs-space-8);border-radius:var(--crs-radius-12);padding:var(--crs-space-12) var(--crs-space-16);color:var(--crs-white)}
.crs-toast--info{background:var(--crs-blue-500)}
.crs-toast--success{background:var(--crs-green-500)}
.crs-toast--warning{background:var(--crs-yellow-500)}
.crs-toast--error{background:var(--crs-red-500)}
.crs-toast__text{min-width:0;font:400 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);overflow-wrap:anywhere}
.crs-toast__close{flex:none;opacity:var(--crs-opacity-muted)}
</style>
