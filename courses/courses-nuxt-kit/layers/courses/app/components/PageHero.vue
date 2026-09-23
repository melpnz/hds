<script setup lang="ts">
withDefaults(defineProps<{ title: string; description?: string; tone?: 'blue' | 'neutral'; align?: 'center' | 'split' }>(), { tone: 'blue', align: 'center' })
</script>

<template>
  <section class="crs-hero" :class="[`crs-hero--${tone}`, `crs-hero--${align}`]">
    <div class="crs-container crs-hero__inner">
      <div class="crs-hero__copy"><slot name="eyebrow" /><h1>{{ title }}</h1><p v-if="description">{{ description }}</p><div v-if="$slots.actions" class="crs-hero__actions"><slot name="actions" /></div></div>
      <div v-if="$slots.media" class="crs-hero__media"><slot name="media" /></div>
    </div>
  </section>
</template>

<style scoped>
.crs-hero{width:100%}.crs-hero--blue{background:var(--crs-gradient-second);color:var(--crs-white)}.crs-hero--neutral{background:var(--crs-black-50);color:var(--crs-black-850)}.crs-hero__inner{display:flex;box-sizing:border-box;min-height:calc(var(--crs-unit) * 388);align-items:center;justify-content:center}.crs-hero__copy{display:flex;width:100%;max-width:calc(var(--crs-unit) * 652);flex-direction:column;align-items:center;text-align:center}.crs-hero h1{margin:0;padding-top:var(--crs-size-64);font:600 var(--crs-font-44)/var(--crs-leading-48) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}.crs-hero p{margin:0;padding:var(--crs-space-24) 0;color:inherit;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-hero__actions{display:flex;justify-content:center;gap:var(--crs-space-8);padding-bottom:calc(var(--crs-unit) * 80)}.crs-hero--split .crs-hero__inner{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(calc(var(--crs-unit) * 240),1fr);gap:var(--crs-space-32)}.crs-hero--split .crs-hero__copy{align-items:flex-start;text-align:left}.crs-hero__media{min-width:0}@media(max-width:767px){.crs-hero__inner{min-height:auto}.crs-hero h1{padding-top:var(--crs-space-40);font-size:var(--crs-font-30);line-height:var(--crs-leading-34)}.crs-hero__actions{width:100%;flex-direction:column;padding-bottom:var(--crs-space-40)}.crs-hero__actions>:slotted(*){width:100%}.crs-hero--split .crs-hero__inner{grid-template-columns:1fr}}
@media(max-width:767px){.crs-hero h1{max-width:calc(var(--crs-unit) * 176)}.crs-hero p{padding-bottom:var(--crs-space-48)}.crs-hero__actions{padding-bottom:calc(var(--crs-unit) * 80)}}
</style>
