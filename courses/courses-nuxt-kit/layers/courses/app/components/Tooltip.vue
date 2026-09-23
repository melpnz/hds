<script setup lang="ts">
type Placement = 'top' | 'right' | 'bottom' | 'left'
const props = withDefaults(defineProps<{ text: string; delay?: number }>(), { delay: 250 })
const id = useId()
const root = ref<HTMLElement>()
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
  timer = setTimeout(() => { open.value = true; nextTick(choosePlacement) }, props.delay)
}
function hide() { clearTimeout(timer); open.value = false }
onMounted(() => nextTick(choosePlacement))
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template><span ref="root" class="crs-tooltip" :data-placement="placement" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide"><span class="crs-tooltip__trigger" tabindex="0" :aria-describedby="open ? id : undefined"><slot/></span><span v-show="open" :id="id" ref="bubble" role="tooltip">{{text}}</span></span></template>
<style scoped>.crs-tooltip{position:relative;display:inline-flex}.crs-tooltip__trigger{display:inline-flex}.crs-tooltip>span[role="tooltip"]{position:absolute;z-index:var(--crs-z-tooltip);width:max-content;max-width:min(var(--crs-size-300),calc(100vw - var(--crs-space-16)));border-radius:var(--crs-radius-12);background:var(--crs-black-850);padding:var(--crs-space-8) var(--crs-space-12);color:var(--crs-white);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);pointer-events:none}.crs-tooltip>span[role="tooltip"]:after{position:absolute;border:var(--crs-space-6) solid transparent;content:""}.crs-tooltip[data-placement="top"]>span[role="tooltip"]{bottom:calc(100% + var(--crs-space-8));left:50%;transform:translateX(-50%)}.crs-tooltip[data-placement="top"]>span[role="tooltip"]:after{top:100%;left:50%;border-top-color:var(--crs-black-850);transform:translateX(-50%)}.crs-tooltip[data-placement="bottom"]>span[role="tooltip"]{top:calc(100% + var(--crs-space-8));left:50%;transform:translateX(-50%)}.crs-tooltip[data-placement="bottom"]>span[role="tooltip"]:after{bottom:100%;left:50%;border-bottom-color:var(--crs-black-850);transform:translateX(-50%)}.crs-tooltip[data-placement="left"]>span[role="tooltip"]{top:50%;right:calc(100% + var(--crs-space-8));transform:translateY(-50%)}.crs-tooltip[data-placement="left"]>span[role="tooltip"]:after{top:50%;left:100%;border-left-color:var(--crs-black-850);transform:translateY(-50%)}.crs-tooltip[data-placement="right"]>span[role="tooltip"]{top:50%;left:calc(100% + var(--crs-space-8));transform:translateY(-50%)}.crs-tooltip[data-placement="right"]>span[role="tooltip"]:after{top:50%;right:100%;border-right-color:var(--crs-black-850);transform:translateY(-50%)}</style>
