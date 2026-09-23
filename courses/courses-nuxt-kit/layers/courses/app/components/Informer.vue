<script setup lang="ts">
type InformerTone = 'info' | 'success' | 'warning' | 'error'
type InformerLink = { label: string; href?: string; external?: boolean }

const visible = defineModel<boolean>({ default: true })
const props = withDefaults(defineProps<{
  tone?: InformerTone
  title?: string
  description?: string
  links?: InformerLink[]
  closable?: boolean
}>(), { tone: 'info', title: 'Информация', description: '', links: () => [], closable: true })
const emit = defineEmits<{ close: [] }>()
const slots = useSlots()

const icon = computed(() => ({
  info: 'i-tabler-info-circle',
  success: 'i-tabler-circle-check',
  warning: 'i-tabler-alert-triangle',
  error: 'i-tabler-circle-x'
})[props.tone])
const hasTitle = computed(() => Boolean(props.title || slots.title))
const hasDescription = computed(() => Boolean(props.description || slots.default))
const live = computed(() => props.tone === 'warning' || props.tone === 'error' ? 'assertive' : 'polite')
const role = computed(() => props.tone === 'warning' || props.tone === 'error' ? 'alert' : 'status')

function close() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <section v-if="visible" class="crs-informer" :class="`crs-informer--${tone}`" :role="role" :aria-live="live">
    <UIcon class="crs-informer__status" :name="icon" aria-hidden="true" />
    <div class="crs-informer__content">
      <strong v-if="hasTitle" class="crs-informer__title"><slot name="title">{{ title }}</slot></strong>
      <div v-if="hasDescription" class="crs-informer__description"><slot>{{ description }}</slot></div>
      <div v-if="links.length || $slots.links" class="crs-informer__links">
        <slot name="links">
          <Link v-for="item in links" :key="`${item.label}-${item.href}`" :href="item.href || '#'" :external="item.external">{{ item.label }}</Link>
        </slot>
      </div>
    </div>
    <IconButton v-if="closable" class="crs-informer__close" label="Закрыть информатор" icon="i-tabler-x" variant="ghost" size="s" :icon-size="24" tone="inherit" hover="none" @click="close" />
  </section>
</template>

<style scoped>
.crs-informer{box-sizing:border-box;display:flex;width:var(--crs-size-280);max-width:100%;align-items:flex-start;gap:var(--crs-space-12);border:var(--crs-border-1) solid var(--informer-accent);border-radius:var(--crs-radius-12);background:var(--informer-surface);padding:var(--crs-space-16);color:var(--crs-black-850)}
.crs-informer--info{--informer-accent:var(--crs-blue-500);--informer-surface:var(--crs-blue-50)}
.crs-informer--success{--informer-accent:var(--crs-green-500);--informer-surface:var(--crs-green-50)}
.crs-informer--warning{--informer-accent:var(--crs-yellow-500);--informer-surface:var(--crs-yellow-50)}
.crs-informer--error{--informer-accent:var(--crs-red-500);--informer-surface:var(--crs-red-50)}
.crs-informer__status{width:var(--crs-size-24);height:var(--crs-size-24);flex:none;color:var(--informer-accent)}
.crs-informer__content{display:flex;min-width:0;flex:1;flex-direction:column;gap:var(--crs-space-4);padding-block:var(--crs-space-2)}
.crs-informer__title{font:600 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);overflow-wrap:anywhere}
.crs-informer__description,.crs-informer__links{font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-informer__description{overflow-wrap:anywhere}
.crs-informer__links{display:flex;flex-wrap:wrap;gap:var(--crs-space-8);padding-top:var(--crs-space-4)}
.crs-informer__close{flex:none;color:var(--informer-accent);opacity:var(--crs-opacity-60)}
</style>
