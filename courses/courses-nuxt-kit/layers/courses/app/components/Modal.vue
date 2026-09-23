<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  scrollable?: boolean
}>(), {
  title: 'Диалог',
  imageAlt: '',
  scrollable: false
})

const bodyContent = ref<HTMLElement | null>(null)
const bodyOverflowing = ref(false)
let resizeObserver: ResizeObserver | undefined

const ui = computed(() => ({
  overlay: '[background:var(--crs-overlay)]',
  content: 'crs-modal-content w-[var(--crs-size-320)] max-w-[calc(100vw-var(--crs-size-48))] max-h-[var(--crs-size-800)] rounded-[var(--crs-radius-24)] bg-[var(--crs-white)] p-0 text-[var(--crs-black-850)] shadow-xl ring-0 divide-y-0',
  header: `crs-modal-header shrink-0 min-h-18 items-start gap-3 p-6 ${bodyOverflowing.value ? 'border-b border-[var(--crs-black-100)]' : ''}`,
  wrapper: 'gap-1',
  title: 'text-xl leading-6 font-semibold tracking-[var(--crs-letter-tight)] text-[var(--crs-black-850)]',
  description: 'text-sm leading-5 text-[var(--crs-black-500)]',
  body: `crs-modal-body-slot min-h-0 overflow-y-auto px-6 text-[var(--crs-black-850)] ${bodyOverflowing.value ? 'crs-modal-body-slot--overflowing' : ''}`,
  footer: `crs-modal-footer-slot shrink-0 gap-2 p-6 ${bodyOverflowing.value ? 'border-t border-[var(--crs-black-100)]' : ''}`
}))

function updateOverflow() {
  const body = bodyContent.value?.parentElement
  if (!body) return
  bodyOverflowing.value = props.scrollable || body.scrollHeight > body.clientHeight + 1
}

async function observeOverflow() {
  await nextTick()
  const body = bodyContent.value?.parentElement
  if (!body) return
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(updateOverflow)
  resizeObserver.observe(body)
  if (bodyContent.value) resizeObserver.observe(bodyContent.value)
  updateOverflow()
}

function stopObservingOverflow() {
  resizeObserver?.disconnect()
  resizeObserver = undefined
  bodyOverflowing.value = false
}

watch(() => props.scrollable, updateOverflow)
onBeforeUnmount(stopObservingOverflow)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :close="false"
    :scrollable="false"
    :ui="ui"
    @after:enter="observeOverflow"
    @after:leave="stopObservingOverflow"
  >
    <slot name="trigger" />
    <template #body>
      <span class="crs-modal-handle" aria-hidden="true" />
      <div ref="bodyContent" class="crs-modal-body">
        <img v-if="image" class="crs-modal-image" :src="image" :alt="imageAlt">
        <slot />
      </div>
    </template>
    <template v-if="$slots.footer" #footer>
      <div class="crs-modal-actions"><slot name="footer" /></div>
    </template>
  </UModal>
</template>

<style scoped>
.crs-modal-handle{display:none}
.crs-modal-image{display:block;width:100%;height:calc(var(--crs-unit) * 140);object-fit:cover}
.crs-modal-body{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-16);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-modal-actions{display:flex;width:100%;gap:var(--crs-space-8)}
.crs-modal-actions>:slotted(*){min-width:0;flex:1 1 0;width:100%}
</style>

<style>
.crs-modal-content{overflow:visible!important}
.crs-modal-content .crs-modal-body-slot{padding-block:0!important}
.crs-modal-content .crs-modal-body-slot--overflowing{padding-block:var(--crs-space-16)!important}
@media(max-width:767px){
  .crs-modal-content{top:auto!important;right:0!important;bottom:0!important;left:0!important;width:100vw!important;max-width:none!important;max-height:min(calc(var(--crs-unit) * 700),calc(100dvh - var(--crs-space-40)))!important;border-radius:var(--crs-radius-24) var(--crs-radius-24) 0 0!important;translate:none!important;transform:none!important}
  .crs-modal-content .crs-modal-handle{position:absolute;top:calc(var(--crs-space-12) * -1);left:50%;display:block;width:var(--crs-size-64);height:var(--crs-size-4);border-radius:var(--crs-radius-full);background:var(--crs-white);transform:translateX(-50%)}
}
</style>
