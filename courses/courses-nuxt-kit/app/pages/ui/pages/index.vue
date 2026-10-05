<script setup lang="ts">
import { productionPages } from '~/data/productionPages'

const viewport = ref<'auto' | '320' | '480' | '768' | '1024'>('auto')
const selectedId = ref<string>(productionPages[0]!.id)
const selected = computed(() => productionPages.find(page => page.id === selectedId.value) || productionPages[0]!)
const previewUrl = computed(() => `/ui/pages/${selected.value.id}`)
</script>

<template>
  <div class="page-catalog">
    <header class="page-catalog__header">
      <div>
        <NuxtLink to="/ui">← Компоненты</NuxtLink>
        <h1>Страницы production</h1>
        <p>Живые Vue/Nuxt-композиции из публичных компонентов Courses UI Kit.</p>
      </div>
      <a :href="selected.sourceUrl" target="_blank" rel="noreferrer">Открыть production ↗</a>
    </header>

    <nav class="page-catalog__nav" aria-label="Страницы production">
      <button v-for="page in productionPages" :key="page.id" type="button" :class="{ active: page.id === selected.id }" @click="selectedId = page.id">
        <strong>{{ page.title }}</strong><small>{{ page.path }}</small>
      </button>
    </nav>

    <main class="page-catalog__main">
      <header class="page-catalog__toolbar">
        <div class="page-catalog__selection"><strong>{{ selected.title }}</strong><small>{{ selected.path }}</small></div>
        <ButtonGroup v-model="viewport" :block="false" tabs label="Ширина предпросмотра" :items="[{label:'Auto',value:'auto'},{label:'320',value:'320'},{label:'480',value:'480'},{label:'768',value:'768'},{label:'1024',value:'1024'}]" />
      </header>
      <div class="page-catalog__stage">
        <iframe :key="`${selected.id}-${viewport}`" :src="previewUrl" :style="viewport === 'auto' ? undefined : { width: `${viewport}px` }" :title="`${selected.title}, ширина ${viewport}`" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-catalog{display:grid;min-height:100vh;grid-template-columns:16rem minmax(0,1fr);grid-template-rows:auto 1fr;background:var(--crs-black-50)}
.page-catalog__header{display:flex;grid-column:1/-1;align-items:flex-end;justify-content:space-between;gap:var(--crs-space-24);border-bottom:var(--crs-border-1) solid var(--crs-black-100);background:var(--crs-white);padding:var(--crs-space-24)}
.page-catalog__header h1{margin:var(--crs-space-8) 0 var(--crs-space-4);font-size:var(--crs-font-30);line-height:var(--crs-leading-34)}
.page-catalog__header p{margin:0;color:var(--crs-black-500)}
.page-catalog__header a{color:var(--crs-blue-500)}
.page-catalog__nav{display:flex;flex-direction:column;gap:var(--crs-space-4);border-right:var(--crs-border-1) solid var(--crs-black-100);background:var(--crs-white);padding:var(--crs-space-12)}
.page-catalog__nav button{display:grid;gap:var(--crs-space-2);border:0;border-radius:var(--crs-radius-12);background:transparent;padding:var(--crs-space-12);color:var(--crs-black-850);text-align:left;cursor:pointer}
.page-catalog__nav button:hover{background:var(--crs-black-50)}
.page-catalog__nav button.active{background:var(--crs-blue-50);color:var(--crs-blue-600)}
.page-catalog__nav small{color:var(--crs-black-500)}
.page-catalog__main{min-width:0;padding:var(--crs-space-24)}
.page-catalog__toolbar{display:flex;align-items:center;justify-content:space-between;gap:var(--crs-space-16);border:var(--crs-border-1) solid var(--crs-black-100);border-bottom:0;border-radius:var(--crs-radius-16) var(--crs-radius-16) 0 0;background:var(--crs-white);padding:var(--crs-space-12) var(--crs-space-16)}
.page-catalog__selection{display:grid}.page-catalog__toolbar small{color:var(--crs-black-500)}
.page-catalog__stage{min-width:0;overflow:auto;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:0 0 var(--crs-radius-16) var(--crs-radius-16);background:var(--crs-black-100);padding:var(--crs-space-24)}
.page-catalog__stage iframe{display:block;width:100%;min-width:var(--crs-size-320);height:calc(var(--crs-unit) * 900);margin:0 auto;border:0;background:var(--crs-white);box-shadow:var(--crs-shadow-card)}
@media(max-width:767px){.page-catalog{display:block}.page-catalog__header{align-items:flex-start;flex-direction:column}.page-catalog__nav{overflow-x:auto;flex-direction:row;border-right:0;border-bottom:var(--crs-border-1) solid var(--crs-black-100)}.page-catalog__nav button{min-width:max-content}.page-catalog__main{padding:var(--crs-space-12)}.page-catalog__toolbar{align-items:stretch;flex-direction:column}.page-catalog__stage{padding:var(--crs-space-12)}}
</style>
