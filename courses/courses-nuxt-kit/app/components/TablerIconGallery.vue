<script setup lang="ts">
interface IconItem {
  name: string
  icon: string
  body: string
  width: number
  height: number
}

interface IconResponse {
  collection: string
  style: string
  total: number
  available: number
  items: IconItem[]
}

const search = ref('')
const query = ref('')
const visibleCount = ref(200)
const copied = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
let copiedTimer: ReturnType<typeof setTimeout> | undefined

watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    query.value = value.trim()
    visibleCount.value = 200
  }, 180)
})

const { data, status } = await useFetch<IconResponse>('/api/tabler-icons', {
  query: { q: query, limit: visibleCount }
})

const icons = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)
const hasMore = computed(() => icons.value.length < total.value)

function showMore() {
  visibleCount.value += 200
}

async function copyIcon(icon: string) {
  await navigator.clipboard.writeText(icon)
  copied.value = icon
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copied.value = '' }, 1600)
}

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  clearTimeout(copiedTimer)
})
</script>

<template>
  <section class="icons-page">
    <header class="icons-header">
      <div>
        <h1>Icons</h1>
        <p>Tabler Icons · Outline · MIT · локальная коллекция</p>
      </div>
      <a href="https://tabler.io/icons" target="_blank" rel="noreferrer">
        Официальный каталог
        <UIcon name="i-tabler-external-link" />
      </a>
    </header>

    <section class="icons-toolbar" aria-label="Поиск иконок">
      <label class="icons-search">
        <UIcon name="i-tabler-search" />
        <span class="sr-only">Найти иконку</span>
        <input v-model="search" type="search" placeholder="Поиск по названию, например settings">
        <button v-if="search" type="button" aria-label="Очистить поиск" @click="search = ''">
          <UIcon name="i-tabler-x" />
        </button>
      </label>
      <p><strong>{{ total.toLocaleString('ru-RU') }}</strong> {{ query ? 'найдено' : 'доступно' }}</p>
    </section>

    <p v-if="status === 'pending' && !icons.length" class="icons-state">Загружаем иконки…</p>
    <p v-else-if="!icons.length" class="icons-state">По запросу «{{ query }}» ничего не найдено</p>

    <section v-else class="icons-grid" aria-label="Иконки Tabler Outline">
      <button
        v-for="item in icons"
        :key="item.name"
        type="button"
        class="icon-card"
        :aria-label="`Скопировать ${item.icon}`"
        @click="copyIcon(item.icon)"
      >
        <svg
          aria-hidden="true"
          :viewBox="`0 0 ${item.width} ${item.height}`"
          v-html="item.body"
        />
        <span>{{ item.name }}</span>
        <small>{{ copied === item.icon ? 'Скопировано' : item.icon }}</small>
      </button>
    </section>

    <footer v-if="icons.length" class="icons-footer">
      <p>Показано {{ icons.length.toLocaleString('ru-RU') }} из {{ total.toLocaleString('ru-RU') }}</p>
      <Button v-if="hasMore" variant="secondary" :loading="status === 'pending'" @click="showMore">
        Показать ещё 200
      </Button>
    </footer>
  </section>
</template>

<style scoped>
.icons-page{min-width:0;min-height:calc(100vh - 4.5rem);background:#f7f7f8;padding:2rem clamp(1rem,4vw,4rem);color:var(--crs-black-850)}
.icons-header{display:flex;max-width:90rem;margin:0 auto 2rem;align-items:flex-end;justify-content:space-between;gap:2rem}.icons-header h1{margin:0 0 .25rem;font-size:clamp(2rem,5vw,3.5rem);line-height:1}.icons-header p{margin:0;color:var(--crs-black-500)}.icons-header>a{display:inline-flex;align-items:center;gap:.375rem;color:var(--crs-blue-600);font-size:.875rem;text-decoration:none}
.icons-toolbar{position:sticky;z-index:10;top:0;display:flex;max-width:90rem;margin:0 auto 1rem;align-items:center;justify-content:space-between;gap:1rem;border:1px solid var(--crs-black-100);border-radius:1rem;background:rgba(255,255,255,.94);padding:.75rem;backdrop-filter:blur(12px)}.icons-toolbar p{margin:0 .5rem 0 0;color:var(--crs-black-500);font-size:.8125rem;white-space:nowrap}.icons-search{display:flex;width:min(32rem,100%);height:2.75rem;align-items:center;gap:.625rem;border:1px solid var(--crs-black-200);border-radius:.75rem;background:#fff;padding:0 .75rem}.icons-search:focus-within{border-color:var(--crs-blue-500);box-shadow:var(--crs-focus)}.icons-search input{width:100%;border:0;outline:0;background:transparent;color:inherit}.icons-search button{display:grid;border:0;background:transparent;padding:.25rem;place-items:center;cursor:pointer}
.icons-grid{display:grid;max-width:90rem;margin:auto;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr));gap:.75rem}.icon-card{display:flex;min-width:0;min-height:9rem;align-items:center;justify-content:center;flex-direction:column;gap:.75rem;border:1px solid var(--crs-black-100);border-radius:1rem;background:#fff;padding:1rem;color:inherit;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}.icon-card:hover{border-color:var(--crs-blue-500);box-shadow:0 .5rem 1.5rem rgba(31,45,74,.08);transform:translateY(-2px)}.icon-card:focus-visible{outline:none;box-shadow:var(--crs-focus)}.icon-card svg{display:block;width:2rem;height:2rem;flex:none}.icon-card span,.icon-card small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.icon-card span{font-size:.8125rem;font-weight:600}.icon-card small{color:var(--crs-black-400);font-size:.625rem}.icons-state{max-width:90rem;margin:4rem auto;text-align:center;color:var(--crs-black-500)}.icons-footer{display:grid;max-width:90rem;margin:2rem auto 0;place-items:center;gap:.75rem}.icons-footer p{margin:0;color:var(--crs-black-500);font-size:.75rem}
@media(max-width:767px){.icons-page{padding:1rem}.icons-header{align-items:flex-start;flex-direction:column;gap:1rem}.icons-toolbar{align-items:stretch;flex-direction:column}.icons-toolbar p{margin:0 .25rem}.icons-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.icon-card{min-height:8rem}}
</style>
