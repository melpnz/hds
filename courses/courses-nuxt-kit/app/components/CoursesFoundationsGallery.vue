<script setup lang="ts">
import { courseFoundationTokens, unusedCourseFoundationTokens } from '~/data/courseTokenUsage.generated'

type FoundationId = 'colors' | 'typography' | 'radii' | 'spacing' | 'layout'

const props = defineProps<{ foundation: FoundationId }>()
const storageKey = 'courses-ui-token-overrides'

const colorGroups = [
  { title: 'Синие и интерактивные', tokens: ['blue-50', 'blue-300', 'blue-400', 'blue-500', 'blue-600'] },
  { title: 'Нейтральные', tokens: ['black-50', 'black-100', 'black-150', 'black-200', 'black-300', 'black-400', 'black-500', 'black-850', 'black-transparent-120', 'black-850-alpha-80', 'white', 'white-transparent-50'] },
  { title: 'Статусы и акценты', tokens: ['yellow-50', 'yellow-400', 'yellow-500', 'yellow', 'red-50', 'red-400', 'red-500', 'red', 'red-hover', 'green-50', 'green-400', 'green-500', 'green', 'green-hover', 'orange-50', 'orange-500', 'orange', 'violet-50', 'violet-500', 'brand-hover'] },
  { title: 'Карточки и иллюстрации', tokens: ['green-chip-bg', 'placeholder-soft-start', 'placeholder-soft-end', 'success-art-end'] },
  { title: 'Поверхности и служебные цвета', tokens: ['overlay', 'overlay-soft', 'overlay-subtle', 'gradient-second'] }
]

const typeRoles = [
  { name: 'H1', size: 'font-44', leading: 'leading-48', weight: 600, sample: 'Заголовок H1' },
  { name: 'H1 mobile', size: 'font-30', leading: 'leading-34', weight: 600, sample: 'Мобильный H1' },
  { name: 'H2', size: 'font-24', leading: 'leading-28', weight: 600, sample: 'Заголовок H2' },
  { name: 'H3', size: 'font-20', leading: 'leading-24', weight: 600, sample: 'Заголовок H3' },
  { name: 'H4', size: 'font-18', leading: 'leading-22', weight: 600, sample: 'Заголовок H4' },
  { name: 'Body', size: 'font-16', leading: 'leading-22', weight: 400, sample: 'Основной текст интерфейса' },
  { name: 'Small', size: 'font-14', leading: 'leading-20', weight: 400, sample: 'Вспомогательный текст' },
  { name: 'Micro', size: 'font-12', leading: 'leading-16', weight: 400, sample: 'Подпись и метаданные' }
]

const radii = [
  { name: 'none', token: 'radius-0' }, { name: '2 px', token: 'radius-2' },
  { name: '4 px', token: 'radius-4' }, { name: 'xxs', token: 'radius-6' },
  { name: 'xs', token: 'radius-8' }, { name: 'control', token: 'radius-12' },
  { name: '2xl', token: 'radius-16' },
  { name: 'card', token: 'radius-24' }, { name: 'full', token: 'radius-full' }
]

const spaces = ['2', '4', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48']
const layoutTokens = [
  { token: 'container', value: '1124 px', description: 'Максимальный контейнер' },
  { token: 'content', value: '976–1076 px', description: 'Полезная ширина в desktop-режиме' },
  { token: 'gutter', value: '24 px', description: 'Gutter с каждой стороны' },
  { token: 'unit', value: 'Базовая единица', description: 'Редкие размеры компонентов вычисляются от неё' }
]

const unusedSets = Object.fromEntries(
  Object.entries(unusedCourseFoundationTokens).map(([category, tokens]) => [category, new Set<string>(tokens)])
) as Record<FoundationId, Set<string>>
const usedColorGroups = colorGroups
  .map(group => ({ ...group, unused: false, tokens: group.tokens.filter(token => !unusedSets.colors.has(token)) }))
  .filter(group => group.tokens.length)
const unusedColors = [...unusedCourseFoundationTokens.colors]
const displayedColorGroups = [
  ...usedColorGroups,
  ...(unusedColors.length ? [{ title: 'Пока не используются', unused: true, tokens: unusedColors }] : [])
]
const usedRadii = radii.filter(item => !unusedSets.radii.has(item.token))
const unusedRadii = radii.filter(item => unusedSets.radii.has(item.token))
const usedSpaces = spaces.filter(value => !unusedSets.spacing.has(`space-${value}`))
const unusedSpaces = spaces.filter(value => unusedSets.spacing.has(`space-${value}`))
const usedLayoutTokens = layoutTokens.filter(item => !unusedSets.layout.has(item.token))
const unusedLayoutTokens = layoutTokens.filter(item => unusedSets.layout.has(item.token))
const unusedTypography = [...unusedCourseFoundationTokens.typography]
const resolved = ref<Record<string, string>>({})
const copied = ref('')
const modified = ref<Set<string>>(new Set())

const titles: Record<FoundationId, { title: string; description: string }> = {
  colors: { title: 'Цвета', description: 'Палитра, статусы, сервисные цвета и градиенты HDS Courses.' },
  typography: { title: 'Типографика', description: 'Inter, два начертания и единая шкала интерфейсных ролей.' },
  radii: { title: 'Скругления и границы', description: 'Рабочая шкала радиусов и базовая граница 1 px.' },
  spacing: { title: 'Отступы и сетка', description: 'Наблюдаемая шкала отступов, контейнер и gutter страницы.' },
  layout: { title: 'Раскладка/Адаптивность', description: 'Контрольные ширины preview и продуктовые брейкпоинты.' }
}

function cssVar(token: string) { return `--crs-${token}` }
function updateValues() {
  if (!import.meta.client) return
  const styles = getComputedStyle(document.documentElement)
  const names = [...new Set([...Object.values(courseFoundationTokens).flat(), 'border-1', 'border-2'])]
  resolved.value = Object.fromEntries(names.map(name => [name, styles.getPropertyValue(cssVar(name)).trim()]))
}

async function copyToken(token: string) {
  const value = resolved.value[token]
  await navigator.clipboard.writeText(`${cssVar(token)}: ${value};`)
  copied.value = token
  setTimeout(() => { if (copied.value === token) copied.value = '' }, 1400)
}

function applyToken(token: string, event: Event) {
  const value = (event.target as HTMLInputElement).value.trim()
  if (!value || !import.meta.client) return
  document.documentElement.style.setProperty(cssVar(token), value)
  modified.value = new Set([...modified.value, token])
  const overrides = Object.fromEntries([...modified.value].map(name => [cssVar(name), name === token ? value : resolved.value[name]]))
  localStorage.setItem(storageKey, JSON.stringify(overrides))
  updateValues()
}

function resetChanges() {
  if (!import.meta.client) return
  for (const token of modified.value) document.documentElement.style.removeProperty(cssVar(token))
  localStorage.removeItem(storageKey)
  modified.value = new Set()
  updateValues()
}

async function copyChanges() {
  const css = [...modified.value].map(token => `  ${cssVar(token)}: ${resolved.value[token]};`).join('\n')
  await navigator.clipboard.writeText(`:root {\n${css}\n}`)
  copied.value = 'all'
}

onMounted(() => {
  try {
    const overrides = JSON.parse(localStorage.getItem(storageKey) || '{}') as Record<string, string>
    modified.value = new Set(Object.keys(overrides).map(name => name.replace(/^--crs-/, '')))
  } catch {
    modified.value = new Set()
  }
  updateValues()
})
watch(() => props.foundation, () => nextTick(updateValues))
</script>

<template>
  <section class="foundations-page">
    <header class="foundations-header">
      <div><p>Основы · HDS Courses</p><h1>{{ titles[foundation].title }}</h1><span>{{ titles[foundation].description }}</span></div>
      <div class="header-actions">
        <button v-if="modified.size" type="button" @click="copyChanges"><UIcon name="i-tabler-copy" /> {{ copied === 'all' ? 'CSS скопирован' : 'Скопировать CSS' }}</button>
        <button v-if="modified.size" type="button" @click="resetChanges"><UIcon name="i-tabler-restore" /> Сбросить правки</button>
        <button type="button" @click="updateValues"><UIcon name="i-tabler-refresh" /> Обновить значения</button>
      </div>
    </header>

    <p v-if="foundation !== 'colors'" class="foundations-source"><UIcon name="i-tabler-code" /> Единый источник: <code>layers/courses/app/assets/css/courses.css</code></p>

    <div v-if="foundation === 'colors'" class="foundation-sections">
      <section v-for="group in displayedColorGroups" :key="group.title" :class="{ 'unused-section': group.unused }"><h2>{{ group.title }}</h2><div class="color-grid">
        <article v-for="token in group.tokens" :key="token" class="token-card color-card" :class="{ modified: modified.has(token) }" :data-token="token" :data-unused="group.unused || undefined">
          <span class="color-swatch" :style="{ background: `var(${cssVar(token)})` }" />
          <strong>{{ token }}</strong>
          <div class="token-controls"><input v-if="resolved[token]?.startsWith('#')" type="color" :value="resolved[token]" :aria-label="`Цвет ${token}`" @input="applyToken(token, $event)"><input class="token-editor" :value="resolved[token]" :aria-label="`Значение ${token}`" @change="applyToken(token, $event)"><button class="copy-token" type="button" :aria-label="`Скопировать ${token}`" @click="copyToken(token)"><UIcon :name="copied === token ? 'i-tabler-check' : 'i-tabler-copy'" /></button></div>
          <small>{{ copied === token ? 'Скопировано' : cssVar(token) }}</small>
        </article>
      </div></section>
    </div>

    <div v-else-if="foundation === 'typography'" class="type-list">
      <article class="font-rule"><strong>Inter — единый шрифт Courses</strong><span>Regular 400 · Semibold 600 · fallback sans-serif</span></article>
      <article v-for="role in typeRoles" :key="role.name" class="type-row" :class="{ modified: modified.has(role.size) || modified.has(role.leading) }">
        <span><strong>{{ role.name }}</strong><span class="type-editors"><label>Размер<input :value="resolved[role.size]" @change="applyToken(role.size, $event)"></label><label>Высота строки<input :value="resolved[role.leading]" @change="applyToken(role.leading, $event)"></label></span><small>{{ cssVar(role.size) }} · {{ cssVar(role.leading) }} · {{ role.weight }}</small></span>
        <span class="type-sample" :style="{ fontSize: `var(${cssVar(role.size)})`, lineHeight: `var(${cssVar(role.leading)})`, fontWeight: role.weight }">{{ role.sample }}</span>
      </article>
      <section class="unused-section"><h2>Пока не используются</h2><div v-if="unusedTypography.length" class="unused-token-grid">
        <article v-for="token in unusedTypography" :key="token" class="token-card" :data-token="token" data-unused="true"><strong>{{ token }}</strong><div class="token-controls"><input class="token-editor" :value="resolved[token]" :aria-label="`Значение ${token}`" @change="applyToken(token, $event)"><button class="copy-token" type="button" :aria-label="`Скопировать ${token}`" @click="copyToken(token)"><UIcon :name="copied === token ? 'i-tabler-check' : 'i-tabler-copy'" /></button></div><small>{{ cssVar(token) }}</small></article>
      </div><p v-else class="unused-empty">Все токены типографики используются.</p></section>
    </div>

    <div v-else-if="foundation === 'radii'" class="radius-page">
      <div class="radius-grid"><article v-for="item in usedRadii" :key="item.token" class="token-card" :class="{ modified: modified.has(item.token) }" :data-token="item.token">
        <span class="radius-sample" :style="{ borderRadius: `var(${cssVar(item.token)})` }" />
        <strong>{{ item.name }}</strong><div class="token-controls"><input class="token-editor" :value="resolved[item.token]" :aria-label="`Значение ${item.token}`" @change="applyToken(item.token, $event)"><button class="copy-token" type="button" :aria-label="`Скопировать ${item.token}`" @click="copyToken(item.token)"><UIcon :name="copied === item.token ? 'i-tabler-check' : 'i-tabler-copy'" /></button></div><small>{{ cssVar(item.token) }}</small>
      </article>
      <article class="border-sample"><span /><div><strong>Базовая граница</strong><label>Толщина<input class="token-editor" :value="resolved['border-1']" @change="applyToken('border-1', $event)"></label><code>var(--crs-border-1) solid var(--crs-black-100)</code></div></article>
      </div>
      <section class="unused-section"><h2>Пока не используются</h2><div v-if="unusedRadii.length" class="radius-grid">
        <article v-for="item in unusedRadii" :key="item.token" class="token-card" :class="{ modified: modified.has(item.token) }" :data-token="item.token" data-unused="true"><span class="radius-sample" :style="{ borderRadius: `var(${cssVar(item.token)})` }" /><strong>{{ item.name }}</strong><div class="token-controls"><input class="token-editor" :value="resolved[item.token]" :aria-label="`Значение ${item.token}`" @change="applyToken(item.token, $event)"><button class="copy-token" type="button" :aria-label="`Скопировать ${item.token}`" @click="copyToken(item.token)"><UIcon :name="copied === item.token ? 'i-tabler-check' : 'i-tabler-copy'" /></button></div><small>{{ cssVar(item.token) }}</small></article>
      </div><p v-else class="unused-empty">Все токены скруглений используются.</p></section>
    </div>

    <div v-else-if="foundation === 'spacing'" class="spacing-page">
      <div class="spacing-list"><article v-for="value in usedSpaces" :key="value" :data-token="`space-${value}`"><strong>{{ value }} px</strong><span :style="{ width: `min(calc(var(${cssVar(`space-${value}`)}) * 4), 100%)` }" /><input :value="resolved[`space-${value}`]" :aria-label="`Значение space-${value}`" @change="applyToken(`space-${value}`, $event)"><code>{{ cssVar(`space-${value}`) }}</code></article></div>
      <section class="layout-values"><article v-for="item in usedLayoutTokens" :key="item.token" :data-token="item.token"><strong>{{ item.value }}</strong><span>{{ item.description }}</span><input v-if="item.token === 'unit'" class="token-editor" :value="resolved.unit" @change="applyToken('unit', $event)"><code>{{ cssVar(item.token) }}</code></article></section>
      <section class="unused-section"><h2>Пока не используются</h2><div v-if="unusedSpaces.length" class="spacing-list"><article v-for="value in unusedSpaces" :key="value" :data-token="`space-${value}`" data-unused="true"><strong>{{ value }} px</strong><span :style="{ width: `min(calc(var(${cssVar(`space-${value}`)}) * 4), 100%)` }" /><input :value="resolved[`space-${value}`]" :aria-label="`Значение space-${value}`" @change="applyToken(`space-${value}`, $event)"><code>{{ cssVar(`space-${value}`) }}</code></article></div><div v-if="unusedLayoutTokens.length" class="layout-values"><article v-for="item in unusedLayoutTokens" :key="item.token" :data-token="item.token" data-unused="true"><strong>{{ item.value }}</strong><span>{{ item.description }}</span><code>{{ cssVar(item.token) }}</code></article></div><p v-if="!unusedSpaces.length && !unusedLayoutTokens.length" class="unused-empty">Все токены отступов и сетки используются.</p></section>
    </div>

    <div v-else class="layout-page">
      <section class="breakpoint-grid"><article><strong>≤ 479 px</strong><span>Маленький телефон</span></article><article><strong>≤ 767 px</strong><span>Телефон</span></article><article><strong>≤ 1023 px</strong><span>Планшет</span></article><article><strong>≥ 1024 px</strong><span>Desktop</span></article></section>
      <section class="viewport-scale"><h2>Контрольные кадры</h2><div v-for="width in [320, 480, 768, 1024]" :key="width"><strong>{{ width }} px</strong><span :style="{ width: `${width / 10.24}%` }" /></div></section>
      <section class="container-diagram"><span>1024–1124 px container</span><div><span>24</span><strong>976–1076 px content</strong><span>24</span></div></section>
    </div>
  </section>
</template>

<style scoped>
.foundations-page{min-width:0;padding:2rem;color:var(--crs-black-850)}.foundations-header{display:flex;align-items:flex-start;justify-content:space-between;gap:2rem}.foundations-header p{margin:0 0 .25rem;color:var(--crs-black-500);font-size:.75rem}.foundations-header h1{margin:0;font:600 2rem/2.5rem Inter,sans-serif}.foundations-header span{display:block;margin-top:.375rem;color:var(--crs-black-500)}.header-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.5rem}.foundations-header button{display:inline-flex;height:2.5rem;align-items:center;gap:.5rem;border:1px solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:#fff;padding:0 1rem;cursor:pointer}.foundations-source{display:flex;align-items:center;gap:.5rem;margin:1.5rem 0;border:1px solid var(--crs-blue-300);border-radius:var(--crs-radius-12);background:var(--crs-blue-50);padding:1rem;color:var(--crs-black-500);font-size:.8125rem}.foundations-source svg{color:var(--crs-blue-600)}.foundations-source code{color:var(--crs-blue-600)}.foundation-sections,.radius-page{display:grid;gap:2rem}.foundation-sections h2,.viewport-scale h2,.unused-section h2{margin:0 0 .75rem;font-size:1rem}.unused-section{border-top:1px solid var(--crs-black-100);padding-top:2rem}.color-grid,.radius-grid,.unused-token-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:.75rem}.token-card{min-width:0;border:1px solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:#fff;padding:.75rem;text-align:left}.token-card[data-unused="true"]{background:var(--crs-black-50)}.token-card:hover{border-color:var(--crs-black-300)}.token-card.modified,.type-row.modified{border-color:var(--crs-blue-400);box-shadow:inset 0 0 0 1px var(--crs-blue-400)}.token-card strong,.token-card code,.token-card small{display:block;overflow-wrap:anywhere}.token-card strong{font-size:.8125rem;line-height:1.125rem}.token-card small{margin-top:.375rem;color:var(--crs-black-500);font-size:.6875rem}.color-swatch{display:block;height:4.5rem;margin:-.25rem -.25rem .75rem;border:1px solid rgb(0 0 0 / 8%);border-radius:var(--crs-radius-8)}.token-controls{display:flex;align-items:center;gap:.375rem;margin-top:.5rem}.token-controls input[type="color"]{width:1.75rem;height:1.75rem;flex:0 0 auto;border:1px solid var(--crs-black-150);border-radius:var(--crs-radius-8);background:#fff;padding:.125rem}.token-editor,.type-editors input,.spacing-list input{box-sizing:border-box;min-width:0;height:1.875rem;border:1px solid var(--crs-black-150);border-radius:var(--crs-radius-8);background:#fff;padding:0 .5rem;color:var(--crs-black-850);font:400 .6875rem/1rem ui-monospace,monospace}.token-editor{width:100%}.copy-token{display:grid;width:1.875rem;height:1.875rem;flex:0 0 auto;place-items:center;border:1px solid var(--crs-black-150);border-radius:var(--crs-radius-8);background:#fff;cursor:pointer}.copy-token:hover{background:var(--crs-blue-50);color:var(--crs-blue-600)}.type-list{display:grid;max-width:60rem;gap:0}.type-list>.unused-section{margin-top:2rem}.font-rule{display:grid;gap:.25rem;margin-bottom:1rem;border:1px solid var(--crs-blue-300);border-radius:var(--crs-radius-12);background:var(--crs-blue-50);padding:1rem}.font-rule strong{font:600 var(--crs-font-20)/var(--crs-leading-24) Inter,sans-serif}.font-rule span{color:var(--crs-black-500);font-size:.8125rem}.type-row{display:grid;grid-template-columns:15rem minmax(0,1fr);align-items:center;gap:1.5rem;border-bottom:1px solid var(--crs-black-100);padding:1rem;text-align:left}.type-row>span:first-child{display:grid;gap:.375rem}.type-row small{color:var(--crs-black-500);font-size:.6875rem}.type-editors{display:flex;gap:.375rem}.type-editors label{display:grid;gap:.125rem;color:var(--crs-black-500);font-size:.625rem}.type-editors input{width:7rem}.type-sample{letter-spacing:-.02em}.radius-sample{display:block;height:5rem;margin-bottom:.75rem;border:2px solid var(--crs-blue-500);background:var(--crs-blue-50)}.border-sample{display:flex;grid-column:1/-1;align-items:center;gap:1rem;border:1px solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:#fff;padding:1rem}.border-sample>span{width:5rem;border-top:1px solid var(--crs-black-850)}.border-sample div{display:grid}.border-sample code{color:var(--crs-black-500);font-size:.75rem}.spacing-page{display:grid;gap:2rem}.spacing-list{display:grid;max-width:52rem;gap:.625rem}.spacing-list article{display:grid;grid-template-columns:5rem minmax(0,1fr) 6rem 13rem;align-items:center;gap:.75rem}.spacing-list article>span{height:.75rem;min-width:.125rem;border-radius:.1875rem;background:var(--crs-blue-500)}.spacing-list code{color:var(--crs-black-500);font-size:.6875rem}.layout-values,.breakpoint-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:.75rem}.layout-values article,.breakpoint-grid article{display:grid;gap:.25rem;border:1px solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:#fff;padding:1rem}.layout-values strong,.breakpoint-grid strong{font-size:1.25rem}.layout-values span,.breakpoint-grid span{color:var(--crs-black-500);font-size:.8125rem}.layout-values code{font-size:.6875rem}.layout-page{display:grid;gap:2rem}.breakpoint-grid article:first-child{border-color:var(--crs-blue-300);background:var(--crs-blue-50)}.viewport-scale{display:grid;gap:.75rem}.viewport-scale>div{display:grid;grid-template-columns:5rem 1fr;align-items:center;gap:1rem}.viewport-scale>div span{display:block;height:2rem;border-radius:var(--crs-radius-8);background:linear-gradient(90deg,var(--crs-blue-500),var(--crs-blue-300))}.container-diagram{display:grid;gap:.5rem;border:2px solid var(--crs-blue-500);border-radius:var(--crs-radius-12);padding:.75rem;text-align:center}.container-diagram>div{display:grid;grid-template-columns:3rem 1fr 3rem;gap:.5rem}.container-diagram>div>*{border-radius:var(--crs-radius-8);background:var(--crs-blue-50);padding:1.5rem .5rem}.container-diagram strong{background:var(--crs-blue-500)!important;color:#fff}@media(max-width:767px){.foundations-page{padding:1rem}.foundations-header{display:grid}.header-actions{justify-content:flex-start}.type-row{grid-template-columns:1fr;gap:.75rem}.spacing-list article{grid-template-columns:4rem minmax(0,1fr) 5rem}.spacing-list code{display:none}.container-diagram>div{grid-template-columns:2rem 1fr 2rem}}
.unused-empty{margin:0;color:var(--crs-black-500);font-size:.8125rem}
</style>
