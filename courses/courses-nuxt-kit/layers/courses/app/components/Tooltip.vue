<script setup lang="ts">
type Placement = 'top' | 'right' | 'bottom' | 'left'
const props = withDefaults(defineProps<{ text: string; delay?: number }>(), { delay: 250 })
const id = useId()
const root = ref<HTMLElement>()
const trigger = ref<HTMLElement>()
const hasInteractiveChild = ref(false)
let describedElement: HTMLElement | undefined
const bubble = ref<HTMLElement>()
const open = ref(false)
const placement = ref<Placement>('top')
let timer: ReturnType<typeof setTimeout> | undefined

function choosePlacement() {
  if (!import.meta.client || !root.value || !bubble.value) return
  const rect = root.value.getBoundingClientRect()
  const spaces: Record<Placement, number> = { top: rect.top, right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.bottom, left: rect.left }
  placement.value = (Object.entries(spaces) as [Placement, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'top'
}
function show() {
  clearTimeout(timer)
  timer = setTimeout(() => { open.value = true; nextTick(() => { choosePlacement(); describeTrigger() }) }, props.delay)
}
function clearDescription() {
  if (!describedElement) return
  const ids = (describedElement.getAttribute('aria-describedby') || '').split(/\s+/).filter(value => value && value !== id)
  if (ids.length) describedElement.setAttribute('aria-describedby', ids.join(' '))
  else describedElement.removeAttribute('aria-describedby')
  describedElement = undefined
}
function describeTrigger() {
  clearDescription()
  const focused = document.activeElement instanceof HTMLElement && trigger.value?.contains(document.activeElement) ? document.activeElement : undefined
  describedElement = focused || trigger.value?.querySelector<HTMLElement>('button,a[href],input,textarea,select,[tabindex]') || trigger.value
  if (describedElement) {
    const ids = new Set((describedElement.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean))
    ids.add(id)
    describedElement.setAttribute('aria-describedby', [...ids].join(' '))
  }
}
function hide() { clearTimeout(timer); open.value = false; clearDescription() }
function dismiss(event: KeyboardEvent) { if (open.value && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); hide() } }
function updateTrigger() { hasInteractiveChild.value = Boolean(trigger.value?.querySelector('button,a[href],input,textarea,select,[tabindex]')) }
onMounted(() => { updateTrigger(); nextTick(choosePlacement); document.addEventListener('keydown', dismiss, true) })
onUpdated(() => { updateTrigger(); if (open.value) describeTrigger() })
onBeforeUnmount(() => { hide(); document.removeEventListener('keydown', dismiss, true) })
</script>

<template><span ref="root" class="crs-tooltip" :data-placement="placement" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide"><span ref="trigger" class="crs-tooltip__trigger" :tabindex="hasInteractiveChild ? undefined : 0"><slot/></span><span v-show="open" :id="id" ref="bubble" role="tooltip">{{text}}</span></span></template>
<style scoped>.crs-tooltip{position:relative;display:inline-flex}.crs-tooltip__trigger{display:inline-flex}.crs-tooltip>span[role="tooltip"]{position:absolute;z-index:var(--crs-z-tooltip);width:max-content;max-width:min(var(--crs-size-300),calc(100vw - var(--crs-space-16)));border-radius:var(--crs-radius-12);background:var(--crs-black-850);padding:var(--crs-space-8) var(--crs-space-12);color:var(--crs-white);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);pointer-events:none}.crs-tooltip>span[role="tooltip"]:after{position:absolute;border:var(--crs-space-6) solid transparent;content:""}.crs-tooltip[data-placement="top"]>span[role="tooltip"]{bottom:calc(100% + var(--crs-space-8));left:50%;transform:translateX(-50%)}.crs-tooltip[data-placement="top"]>span[role="tooltip"]:after{top:100%;left:50%;border-top-color:var(--crs-black-850);transform:translateX(-50%)}.crs-tooltip[data-placement="bottom"]>span[role="tooltip"]{top:calc(100% + var(--crs-space-8));left:50%;transform:translateX(-50%)}.crs-tooltip[data-placement="bottom"]>span[role="tooltip"]:after{bottom:100%;left:50%;border-bottom-color:var(--crs-black-850);transform:translateX(-50%)}.crs-tooltip[data-placement="left"]>span[role="tooltip"]{top:50%;right:calc(100% + var(--crs-space-8));transform:translateY(-50%)}.crs-tooltip[data-placement="left"]>span[role="tooltip"]:after{top:50%;left:100%;border-left-color:var(--crs-black-850);transform:translateY(-50%)}.crs-tooltip[data-placement="right"]>span[role="tooltip"]{top:50%;left:calc(100% + var(--crs-space-8));transform:translateY(-50%)}.crs-tooltip[data-placement="right"]>span[role="tooltip"]:after{top:50%;right:100%;border-right-color:var(--crs-black-850);transform:translateY(-50%)}</style>
