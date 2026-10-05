<script setup lang="ts">
type Detail = { label: string; value: string; href?: string }
const props = withDefaults(defineProps<{ number: number; title: string; school?: string; price?: string; href?: string; description?: string; details?: Detail[] }>(), { href: '#', details: () => [] })
const characteristics = computed<Detail[]>(() => props.details.length ? props.details : [
  ...(props.school ? [{ label: 'Школа', value: props.school }] : []),
  ...(props.price ? [{ label: 'Стоимость курса', value: props.price }] : [])
])
</script>
<template>
  <article class="crs-numbered">
    <h3><Link :href="href" target="_blank" rel="noopener noreferrer nofollow">{{ number }}. {{ title }}</Link></h3>
    <p v-if="description" class="crs-numbered__description">{{ description }}</p>
    <div v-if="characteristics.length" class="crs-numbered__details">
      <div v-for="detail in characteristics" :key="detail.label"><strong>{{ detail.label }}: </strong><Link v-if="detail.href" :href="detail.href" tone="inherit" target="_blank">{{ detail.value }}</Link><span v-else>{{ detail.value }}</span></div>
    </div>
  </article>
</template>
<style scoped>
.crs-numbered{min-width:0;border-bottom:var(--crs-border-1) solid var(--crs-black-100);padding:var(--crs-space-24) 0;color:var(--crs-black-850)}
.crs-numbered:last-child{border-bottom:0}
.crs-numbered h3{margin:0;font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}
.crs-numbered__description{margin:var(--crs-space-6) 0 0;white-space:pre-line;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-numbered__details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--crs-space-12);row-gap:var(--crs-space-2);margin-top:var(--crs-space-12);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-numbered__details strong{font-weight:600}
@media(max-width:1023px){.crs-numbered__details{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:767px){.crs-numbered__details{grid-template-columns:1fr}}
</style>
