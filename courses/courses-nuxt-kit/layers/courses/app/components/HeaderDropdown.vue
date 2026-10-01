<script setup lang="ts">
import type { HabrService } from './ServiceLogo.vue'
export type HeaderService = { label: string; service: HabrService; href?: string }
const open = defineModel<boolean>({ default: false })
const anchor = ref<HTMLElement | null>(null)
const panelId = useId()
function close(event?: KeyboardEvent) {
  open.value = false
  if (event?.key === 'Escape') anchor.value?.querySelector<HTMLButtonElement>('button')?.focus()
}
function onPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !anchor.value?.contains(event.target)) close()
}
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); close(event) }
}
function onPanelClick(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest('a')) close()
}
function removeListeners() {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
}
onMounted(() => {
  watch(open, value => {
    removeListeners()
    if (value) {
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('keydown', onKeyDown)
    }
  }, { immediate: true, flush: 'sync' })
})
onBeforeUnmount(() => { if (import.meta.client) removeListeners() })
const props = withDefaults(defineProps<{
  label?: string
  embedded?: boolean
  current?: HabrService | null
  align?: 'trigger' | 'container'
  services?: HeaderService[]
}>(), { label: 'Все сервисы', embedded: false, current: null, align: 'trigger' })
const defaultServices: HeaderService[] = [
  { label: 'Хабр', service: 'habr' as const, href: 'https://habr.com/' },
  { label: 'Q&A', service: 'qna' as const, href: 'https://qna.habr.com/' },
  { label: 'Карьера', service: 'career' as const, href: 'https://career.habr.com/' },
  { label: 'Курсы', service: 'courses', href: 'https://career.habr.com/courses' },
  { label: 'Промокоды', service: 'promo', href: 'https://promo.habr.com/' },
  { label: 'Бизнес', service: 'business', href: 'https://business.habr.com/' },
  { label: 'Оплата', service: 'payment', href: 'https://payment.habr.com' }
]
const services = computed(() => props.services ?? defaultServices)
</script>

<template>
  <div class="crs-header-dropdown" :data-embedded="embedded || undefined" :data-align="align">
    <div ref="anchor" class="crs-header-dropdown__anchor">
      <Button v-if="!embedded" class="crs-header-dropdown__trigger" variant="brand" density="compact" :rotated="open" :aria-expanded="open" :aria-controls="panelId" @click="open = !open"><span>{{ label }}</span><template #trailing><UIcon name="i-tabler-chevron-down" /></template></Button>
      <IconButton v-else class="crs-header-dropdown__trigger" label="Все сервисы Хабра" icon="i-tabler-chevron-down" variant="ghost" size="s" tone="inherit" hover="none" :rotated="open" :aria-expanded="open" :aria-controls="panelId" @click="open = !open" />
      <div v-if="open" :id="panelId" class="crs-header-dropdown__panel" @click="onPanelClick">
        <template v-if="$slots.default"><slot /></template>
        <template v-else>
          <div class="crs-header-dropdown__title">Все сервисы Хабра</div>
          <template v-for="service in services" :key="service.service">
            <Link v-if="service.href" class="crs-header-dropdown__link" :href="service.href" tone="inherit" layout="flex" :rel="service.href.startsWith('/') ? undefined : 'nofollow'" :aria-current="service.service === current ? 'page' : undefined">
              <ServiceLogo :service="service.service" />
              <span>{{ service.label }}</span>
            </Link>
            <span v-else class="crs-header-dropdown__link" aria-disabled="true" :aria-current="service.service === current ? 'page' : undefined">
              <ServiceLogo :service="service.service" />
              <span>{{ service.label }}</span>
            </span>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crs-header-dropdown{display:grid;min-height:calc(var(--crs-unit) * 396);width:var(--crs-size-260);justify-items:end}
.crs-header-dropdown__anchor{position:relative}
.crs-header-dropdown__panel{position:absolute;z-index:var(--crs-z-dropdown);top:calc(var(--crs-unit) * 44);right:0;box-sizing:border-box;width:calc(var(--crs-unit) * 178);overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:var(--crs-white);padding:var(--crs-space-8) var(--crs-space-4);color:var(--crs-black-850);box-shadow:var(--crs-shadow-dropdown)}
.crs-header-dropdown__title{padding:var(--crs-space-8) var(--crs-space-16);font:700 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);white-space:nowrap}
.crs-header-dropdown__link{display:flex;width:100%;box-sizing:border-box;align-items:center;gap:var(--crs-space-12);border-radius:var(--crs-radius-8);padding:var(--crs-space-8) var(--crs-space-24) var(--crs-space-8) var(--crs-space-16);color:inherit;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);text-decoration:none;white-space:nowrap}
.crs-header-dropdown__link:hover,.crs-header-dropdown__link:focus-visible{background:var(--crs-black-50);color:var(--crs-black-850);text-decoration:none;outline:0;box-shadow:none}
.crs-header-dropdown[data-embedded]{display:flex;width:calc(var(--crs-unit) * 28);min-height:0;align-items:center}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__anchor{display:flex;align-items:center;line-height:0}
.crs-header-dropdown__panel{max-height:calc(100dvh - var(--crs-space-64) - var(--crs-space-16));overflow-y:auto;overscroll-behavior:contain}
.crs-header-dropdown__link[aria-disabled]{color:var(--crs-black-500);cursor:default}
.crs-header-dropdown__link[aria-disabled]:hover{background:transparent;color:var(--crs-black-500)}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__trigger{opacity:var(--crs-opacity-muted);transition:opacity var(--crs-duration-fast) var(--crs-ease)}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__trigger:hover,.crs-header-dropdown[data-embedded] .crs-header-dropdown__trigger[aria-expanded="true"]{opacity:1}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__panel{top:var(--crs-space-32);right:var(--crs-header-dropdown-panel-right,0);left:var(--crs-header-dropdown-panel-left,auto);width:var(--crs-header-dropdown-panel-width,calc(var(--crs-unit) * 178))}
.crs-header-dropdown[data-embedded][data-align="container"] .crs-header-dropdown__anchor{position:static}
.crs-header-dropdown[data-embedded][data-align="container"] .crs-header-dropdown__panel{top:calc(100% + var(--crs-space-8));right:auto;left:0}
</style>
