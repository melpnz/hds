<script setup lang="ts">
const open = defineModel<boolean>({ default: true })
withDefaults(defineProps<{ label?: string; embedded?: boolean }>(), { label: 'Все сервисы', embedded: false })
const services = [
  { label: 'Хабр', service: 'habr' as const, href: 'https://habr.com/' },
  { label: 'Q&A', service: 'qna' as const, href: 'https://qna.habr.com/' },
  { label: 'Карьера', service: 'career' as const, href: 'https://career.habr.com/' },
  { label: 'Курсы', service: 'courses' as const, href: 'https://career.habr.com/courses' }
]
</script>

<template>
  <div class="crs-header-dropdown" :data-embedded="embedded || undefined">
    <div class="crs-header-dropdown__anchor">
      <Button v-if="!embedded" class="crs-header-dropdown__trigger" variant="brand" density="compact" :rotated="open" :aria-expanded="open" aria-controls="courses-header-services" @click="open = !open"><span>{{ label }}</span><template #trailing><UIcon name="i-tabler-chevron-down" /></template></Button>
      <IconButton v-else class="crs-header-dropdown__trigger" label="Все сервисы Хабра" icon="i-tabler-chevron-down" variant="ghost" size="s" tone="inherit" hover="none" :rotated="open" :aria-expanded="open" aria-controls="courses-header-services" @click="open = !open" />
      <div v-if="open" id="courses-header-services" class="crs-header-dropdown__panel">
        <template v-if="$slots.default"><slot /></template>
        <template v-else>
          <div class="crs-header-dropdown__title">Все сервисы Хабра</div>
          <Link v-for="service in services" :key="service.label" class="crs-header-dropdown__link" :href="service.href" tone="inherit" layout="flex" rel="nofollow">
            <ServiceLogo :service="service.service" />
            <span>{{ service.label }}</span>
          </Link>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crs-header-dropdown{display:grid;min-height:calc(var(--crs-unit) * 276);width:var(--crs-size-260);justify-items:end}
.crs-header-dropdown__anchor{position:relative}
.crs-header-dropdown__panel{position:absolute;z-index:var(--crs-z-dropdown);top:calc(var(--crs-unit) * 44);right:0;box-sizing:border-box;width:calc(var(--crs-unit) * 178);overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:var(--crs-white);padding:var(--crs-space-8) var(--crs-space-4);color:var(--crs-black-850);box-shadow:var(--crs-shadow-dropdown)}
.crs-header-dropdown__title{padding:var(--crs-space-8) var(--crs-space-16);font:700 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);white-space:nowrap}
.crs-header-dropdown__link{display:flex;width:100%;box-sizing:border-box;align-items:center;gap:var(--crs-space-12);border-radius:var(--crs-radius-8);padding:var(--crs-space-8) var(--crs-space-24) var(--crs-space-8) var(--crs-space-16);color:inherit;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);text-decoration:none;white-space:nowrap}
.crs-header-dropdown__link:hover,.crs-header-dropdown__link:focus-visible{background:var(--crs-black-50);color:var(--crs-black-850);text-decoration:none;outline:0;box-shadow:none}
.crs-header-dropdown[data-embedded]{display:flex;width:calc(var(--crs-unit) * 28);min-height:0;align-items:center}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__anchor{display:flex;align-items:center;line-height:0}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__trigger{opacity:var(--crs-opacity-muted)}
.crs-header-dropdown[data-embedded] .crs-header-dropdown__panel{top:var(--crs-space-32);right:var(--crs-header-dropdown-panel-right,0);left:var(--crs-header-dropdown-panel-left,auto);width:var(--crs-header-dropdown-panel-width,calc(var(--crs-unit) * 178))}
</style>
