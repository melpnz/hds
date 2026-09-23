<script setup lang="ts">
import { coursesCategories, coursesRegistry } from '#layers/courses/app/data/coursesRegistry'
import type { CoursesRegistryEntry } from '#layers/courses/app/data/coursesRegistry'

const route = useRoute()
const router = useRouter()
const search = ref('')
const foundationIds = ['colors', 'typography', 'radii', 'spacing', 'responsive-layout', 'icons'] as const
type FoundationId = typeof foundationIds[number]
const routeFoundation = String(route.query.foundation) === 'layout' ? 'responsive-layout' : String(route.query.foundation || '')
const activeCategory = ref<string>(foundationIds.includes(routeFoundation as FoundationId) ? routeFoundation : 'all')
const viewport = ref<'auto' | '320' | '480' | '768' | '1024'>('auto')
const siteHeaderVariant = ref('listing-hero')
const siteHeaderVariantOptions = [
  { label: 'ListingHeader · Hero', value: 'listing-hero' },
  { label: 'ListingHeader · Page', value: 'listing-page' },
  { label: 'ListingHeader · Page Sticky', value: 'listing-page-sticky' },
  { label: 'CoursesHeader · Hero', value: 'courses-hero' },
  { label: 'CoursesHeader · Page', value: 'courses-page' },
  { label: 'CoursesHeader · Page Sticky', value: 'courses-page-sticky' },
  { label: 'SimplePageHeader', value: 'simple-page' }
]
const isFoundation = computed(() => foundationIds.includes(activeCategory.value as FoundationId))
const activeFoundation = computed(() => activeCategory.value === 'responsive-layout' ? 'layout' : activeCategory.value as 'colors' | 'typography' | 'radii' | 'spacing')

const filtered = computed(() => coursesRegistry.filter((item) => {
  const matchesCategory = activeCategory.value === 'all' || item.category === activeCategory.value
  const query = search.value.trim().toLowerCase()
  return matchesCategory && (!query || `${item.id} ${item.name}`.toLowerCase().includes(query))
}))

const defaultEntry = coursesRegistry[0]!
const selectedId = computed(() => String(route.query.component || filtered.value[0]?.id || defaultEntry.id))
const selected = computed<CoursesRegistryEntry>(() => coursesRegistry.find(item => item.id === selectedId.value) || filtered.value[0] || defaultEntry)
const previewUrl = computed(() => {
  const variant = selected.value.id === 'site-header' ? `&variant=${encodeURIComponent(siteHeaderVariant.value)}` : ''
  return `/ui/preview?component=${encodeURIComponent(selected.value.id)}${variant}`
})

function select(id: string) { router.replace({ query: { component: id } }) }
function chooseCategory(category: string) {
  activeCategory.value = category
  if (foundationIds.includes(category as FoundationId)) {
    router.replace({ query: { foundation: category } })
    return
  }
  const first = coursesRegistry.find(item => category === 'all' || item.category === category)
  if (first) select(first.id)
}

watch(() => route.query.foundation, (value) => {
  const foundation = String(value || '') === 'layout' ? 'responsive-layout' : String(value || '')
  if (foundationIds.includes(foundation as FoundationId)) activeCategory.value = foundation
  else if (route.query.component && isFoundation.value) activeCategory.value = 'all'
})

const foundations = [
  { id: 'colors', label: 'Цвета', icon: 'i-tabler-palette' },
  { id: 'typography', label: 'Типографика', icon: 'i-tabler-typography' },
  { id: 'radii', label: 'Скругления', icon: 'i-tabler-border-corners' },
  { id: 'spacing', label: 'Отступы и сетка', icon: 'i-tabler-layout-grid' },
  { id: 'responsive-layout', label: 'Раскладка/Адаптивность', icon: 'i-tabler-devices' },
  { id: 'icons', label: 'Icons', icon: 'i-tabler-icons' }
] as const

const categoryLabels: Record<string, string> = {
  actions: 'Действия', forms: 'Формы', navigation: 'Навигация',
  'data-display': 'Отображение данных', entities: 'Карточки и сущности',
  feedback: 'Обратная связь', collections: 'Коллекции', layout: 'Раскладка',
  'frame-modules': 'Каркас страниц', overlays: 'Оверлеи'
}
</script>

<template>
  <div class="ui-catalog">
    <header class="catalog-header">
      <div class="catalog-brand"><span class="catalog-logo">H</span><div><strong>Courses UI</strong><small>Nuxt component library · {{ coursesRegistry.length }} элементов</small></div></div>
      <SearchInput v-if="!isFoundation" v-model="search" class="catalog-search" placeholder="Найти компонент" />
      <div v-else />
      <div class="catalog-actions">
        <button class="catalog-source catalog-source--icons" type="button" @click="chooseCategory(isFoundation ? 'all' : 'colors')">
          {{ isFoundation ? 'Компоненты' : 'Основы' }} <UIcon :name="isFoundation ? 'i-tabler-components' : 'i-tabler-palette'" />
        </button>
        <a class="catalog-source" href="https://github.com/melpnz/hds/tree/main/courses" target="_blank" rel="noreferrer">HDS v1.0 <UIcon name="i-tabler-external-link" /></a>
      </div>
    </header>

    <aside class="catalog-sidebar">
      <p>Основы</p>
      <button v-for="item in foundations" :key="item.id" :class="{ active: activeCategory === item.id }" @click="chooseCategory(item.id)"><span class="sidebar-label"><UIcon :name="item.icon" />{{ item.label }}</span><small>{{ item.id === 'icons' ? '5 161' : '' }}</small></button>
      <p>Компоненты</p>
      <button :class="{ active: activeCategory === 'all' }" @click="chooseCategory('all')"><span>Все элементы</span><small>{{ coursesRegistry.length }}</small></button>
      <button v-for="category in coursesCategories" :key="category" :class="{ active: activeCategory === category }" @click="chooseCategory(category)"><span>{{ categoryLabels[category] }}</span><small>{{ coursesRegistry.filter(item => item.category === category).length }}</small></button>
    </aside>

    <nav v-if="!isFoundation" class="catalog-list" aria-label="Компоненты">
      <button v-for="item in filtered" :key="item.id" :class="{ active: selected.id === item.id }" @click="select(item.id)"><span>{{ item.name.replace('Courses','') }}</span><small v-if="item.status === 'in-progress'" class="status--in-progress">В разработке</small></button>
      <EmptyState v-if="!filtered.length" title="Компоненты не найдены" description="Измените поисковый запрос" />
    </nav>

    <main v-if="!isFoundation" class="catalog-main">
      <header class="component-header">
        <div><div class="component-kicker"><span>{{ categoryLabels[selected.category] }}</span><span>·</span><span>{{ selected.kind }}</span></div><h1>{{ selected.name }}</h1></div>
        <span v-if="selected.status === 'in-progress'" class="source-status status--in-progress">В разработке</span>
      </header>

      <section class="preview-panel">
        <header><strong>Preview</strong><div class="preview-tools"><Select v-if="selected.id === 'site-header'" v-model="siteHeaderVariant" aria-label="Вариант SiteHeader" :options="siteHeaderVariantOptions" /><ButtonGroup v-model="viewport" :block="false" tabs label="Ширина предпросмотра" :items="[{label:'Auto',value:'auto'},{label:'320',value:'320'},{label:'480',value:'480'},{label:'768',value:'768'},{label:'1024',value:'1024'}]" /></div></header>
        <div class="preview-stage">
          <div v-if="viewport === 'auto'" class="preview-frame"><CoursesCatalogDemo :entry="selected" :site-header-variant="siteHeaderVariant" /></div>
          <iframe v-else :key="`${selected.id}-${viewport}`" class="preview-frame preview-frame--iframe" :src="previewUrl" :style="{ width: `${viewport}px` }" :title="`${selected.name}, ширина ${viewport}px`" />
        </div>
      </section>

      <section class="details-grid">
        <article><h2>Использование</h2><pre><code>&lt;{{ selected.name }} /&gt;</code></pre></article>
      </section>
    </main>

    <CoursesFoundationsGallery v-else-if="activeCategory !== 'icons'" class="catalog-foundations" :foundation="activeFoundation" />
    <TablerIconGallery v-else class="catalog-icons" />
  </div>
</template>

<style scoped>
.ui-catalog{display:grid;min-height:100vh;grid-template-columns:14rem 16rem minmax(0,1fr);grid-template-rows:4.5rem 1fr;background:#f7f7f8}.catalog-header{position:sticky;z-index:50;top:0;display:grid;grid-column:1/-1;grid-template-columns:14rem minmax(16rem,32rem) 1fr;align-items:center;gap:1.5rem;border-bottom:1px solid var(--crs-black-100);background:#fff;padding:0 1.25rem}.catalog-brand{display:flex;align-items:center;gap:.75rem}.catalog-brand>div{display:grid}.catalog-brand small{color:var(--crs-black-500);font-size:.6875rem}.catalog-logo{display:grid;width:2rem;height:2rem;place-items:center;border-radius:.625rem;background:var(--crs-blue-500);color:#fff;font-weight:800}.catalog-actions{display:flex;align-items:center;justify-content:flex-end;gap:1rem}.catalog-source{display:flex;align-items:center;gap:.375rem;color:var(--crs-black-500);font-size:.75rem}.catalog-source--icons{display:none;border:0;border-radius:.625rem;background:var(--crs-blue-50);padding:.5rem .75rem;color:var(--crs-blue-600);font:inherit;font-size:.75rem;font-weight:600;cursor:pointer}.catalog-source--icons:hover{background:#e3ebff}.catalog-sidebar,.catalog-list{position:sticky;top:4.5rem;height:calc(100vh - 4.5rem);overflow-y:auto;border-right:1px solid var(--crs-black-100);background:#fff;padding:1rem .75rem}.catalog-sidebar button,.catalog-list button{display:flex;width:100%;align-items:center;justify-content:space-between;border:0;border-radius:.625rem;background:transparent;padding:.625rem .75rem;text-align:left;cursor:pointer}.catalog-sidebar button:hover,.catalog-list button:hover{background:var(--crs-black-50)}.catalog-sidebar button.active,.catalog-list button.active{background:var(--crs-blue-50);color:var(--crs-blue-600)}.sidebar-label{display:flex;align-items:center;gap:.5rem}.sidebar-label svg{width:1rem;height:1rem}.catalog-sidebar p{margin:1.25rem .75rem .5rem;color:var(--crs-black-500);font-size:.6875rem;font-weight:700;text-transform:uppercase}.catalog-sidebar p:first-child{margin-top:.25rem}.catalog-sidebar small{color:var(--crs-black-400)}.catalog-list{background:#fcfcfc}.catalog-list button{display:grid;gap:.25rem}.catalog-list button>small{font-size:.625rem}.status--in-progress{color:#a85d00}.catalog-main{min-width:0;padding:2rem}.catalog-icons,.catalog-foundations{grid-column:2/-1}.component-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.5rem}.component-header h1{margin:.25rem 0 0;font-size:2rem}.component-kicker{display:flex;gap:.375rem;color:var(--crs-black-500);font-size:.75rem}.source-status{border-radius:999px;background:#fff;padding:.375rem .625rem;font-size:.6875rem;font-weight:600}.preview-panel,.details-grid article{overflow:hidden;border:1px solid var(--crs-black-100);border-radius:1rem;background:#fff}.preview-panel>header{display:flex;min-height:3.5rem;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--crs-black-100);padding:.5rem 1rem}.preview-stage{overflow:auto;padding:1.5rem;background:linear-gradient(45deg,#f8f8f8 25%,transparent 25%),linear-gradient(-45deg,#f8f8f8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f8f8f8 75%),linear-gradient(-45deg,transparent 75%,#f8f8f8 75%);background-position:0 0,0 8px,8px -8px,-8px 0;background-size:16px 16px}.preview-frame{box-sizing:border-box;max-width:100%;min-height:16rem;margin:auto;border-radius:.75rem;background:#fff;padding:1.5rem;box-shadow:0 .25rem 1.5rem rgba(0,0,0,.05)}.preview-frame--iframe{display:block;width:auto;max-width:none;height:50rem;flex:none;border:0;padding:0}.details-grid{display:grid;grid-template-columns:1fr;gap:1rem;margin-top:1rem}.details-grid article{padding:1.25rem}.details-grid h2{margin:0 0 1rem;font-size:1rem}.details-grid pre{overflow:auto;margin:0;border-radius:.5rem;background:var(--crs-black-850);padding:1rem;color:#fff;font-size:.75rem}
@media(max-width:1023px){.ui-catalog{grid-template-columns:13rem minmax(0,1fr)}.catalog-sidebar{display:none}.catalog-list{grid-column:1}.catalog-main{grid-column:2}.catalog-icons,.catalog-foundations{grid-column:1/-1}.catalog-header{grid-template-columns:12rem 1fr auto}}
@media(max-width:767px){.ui-catalog{display:block}.catalog-header{position:sticky;display:flex;height:auto;flex-wrap:wrap;padding:.75rem}.catalog-brand{flex:1}.catalog-brand small,.catalog-actions>a:not(.catalog-source--icons){display:none}.catalog-actions{gap:0}.catalog-source--icons{display:flex}.catalog-search{order:3;width:100%}.catalog-list{position:static;display:flex;height:auto;gap:.375rem;overflow-x:auto;border-right:0;border-bottom:1px solid var(--crs-black-100);padding:.5rem}.catalog-list button{width:auto;min-width:max-content}.catalog-main{padding:1rem}.component-header h1{font-size:1.5rem}.preview-panel>header{align-items:flex-start;flex-direction:column}.preview-stage{padding:1rem}.details-grid{grid-template-columns:1fr}}
.preview-tools{display:flex;min-width:0;align-items:center;gap:var(--crs-space-12)}
.preview-tools>.crs-select{width:14rem}
@media(max-width:767px){.preview-tools{width:100%;align-items:stretch;flex-direction:column}.preview-tools>.crs-select{width:100%}}
</style>
