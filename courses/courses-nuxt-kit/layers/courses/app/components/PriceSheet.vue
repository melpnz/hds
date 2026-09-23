<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const from = defineModel<string>('from', { default: '' })
const to = defineModel<string>('to', { default: '' })
const props = withDefaults(defineProps<{ title?: string; price?: string; currency?: string }>(), { title: 'Цена', currency: '₽' })
const selectedCurrency = ref(props.currency)
const currencyOptions = [{ label: '₽', value: '₽' }, { label: '$', value: '$' }, { label: '€', value: '€' }]

function reset() {
  from.value = ''
  to.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="crs-price-sheet" @click.self="open = false">
      <section class="crs-price-sheet__panel" role="dialog" aria-modal="true" :aria-label="title">
        <span class="crs-price-sheet__handle" aria-hidden="true" />
        <h2>{{ title }}</h2>
        <div class="crs-price-sheet__body">
          <TextInput v-model="from" class="crs-price-sheet__field" appearance="bare" inputmode="numeric" placeholder="От" aria-label="Цена от" />
          <TextInput v-model="to" class="crs-price-sheet__field" appearance="bare" inputmode="numeric" placeholder="До" aria-label="Цена до" />
          <Select v-model="selectedCurrency" class="crs-price-sheet__currency" appearance="bare" :options="currencyOptions" aria-label="Валюта" />
        </div>
        <footer>
          <Button class="crs-price-sheet__action" variant="secondary" @click="reset">Сбросить</Button>
          <Button class="crs-price-sheet__action" @click="open = false">Готово</Button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.crs-price-sheet{position:fixed;z-index:var(--crs-z-modal);inset:0;display:flex;align-items:flex-start;justify-content:center;background:transparent;padding-top:var(--crs-size-94)}
.crs-price-sheet__panel{position:relative;box-sizing:border-box;width:var(--crs-size-360);overflow:visible;border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-16);box-shadow:var(--crs-shadow-sheet)}
.crs-price-sheet__handle,.crs-price-sheet h2{display:none}
.crs-price-sheet__body{display:grid;min-width:0;grid-template-columns:minmax(0,1fr) minmax(0,1fr) var(--crs-size-68);gap:var(--crs-space-8)}
.crs-price-sheet__body>*{min-width:0}
.crs-price-sheet__field,.crs-price-sheet__currency{box-sizing:border-box;height:var(--crs-size-40);border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:var(--crs-white);padding-inline:var(--crs-space-12)}
.crs-price-sheet__currency{display:flex;align-items:center;justify-content:space-between;padding-inline:var(--crs-space-12);cursor:pointer}
.crs-price-sheet__currency svg{width:var(--crs-size-20);height:var(--crs-size-20)}
.crs-price-sheet footer{display:flex;justify-content:flex-end;gap:var(--crs-space-8);padding-top:var(--crs-space-16)}
@media(max-width:767px){
  .crs-price-sheet{align-items:flex-end;background:var(--crs-overlay);padding-top:var(--crs-space-40)}
  .crs-price-sheet__panel{width:100%;border-radius:var(--crs-radius-24) var(--crs-radius-24) 0 0;padding:var(--crs-space-24) var(--crs-space-24) var(--crs-space-16);box-shadow:none}
  .crs-price-sheet__handle{position:absolute;top:calc(var(--crs-space-12) * -1);left:50%;display:block;width:var(--crs-size-64);height:var(--crs-size-4);border-radius:var(--crs-radius-full);background:var(--crs-white);transform:translateX(-50%)}
  .crs-price-sheet h2{display:block;margin:0 0 var(--crs-space-16);font:600 var(--crs-font-20)/var(--crs-leading-24) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}
  .crs-price-sheet__action{flex:1}
}
</style>
