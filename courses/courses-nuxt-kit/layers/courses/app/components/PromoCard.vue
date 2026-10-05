<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  conditions?: string
  code?: string
  expires?: string
  school?: string
  logo?: string
  href?: string
  expired?: boolean
  actionLabel?: string
}>(), {
  code: 'HABR20',
  expires: '',
  school: 'НАДПО',
  href: '#',
  expired: false
})

const emit = defineEmits<{ 'open-code': [code: string] }>()
const hasCode = computed(() => Boolean(props.code))
const modalOpen = ref(false)
const resolvedActionLabel = computed(() => props.actionLabel || (hasCode.value ? 'Открыть код' : 'Посмотреть'))
function openCode() {
  if (!props.expired) {
    modalOpen.value = true
    if (props.code) emit('open-code', props.code)
  }
}
</script>

<template>
  <article class="crs-promo" :class="{ 'crs-promo--expired': expired }">
    <div v-if="expired" class="crs-promo__status"><UIcon name="i-tabler-calendar" /><span>Завершено</span></div>
    <div class="crs-promo__content">
      <div class="crs-promo__school">
        <EntityLogo class="crs-promo__logo" :src="logo" :alt="`Логотип ${school}`" :label="school" :size="24" />
        <strong>{{ school }}</strong>
      </div>
      <div class="crs-promo__offer">{{ title }}</div>
      <p>{{ description || 'на любой курс' }}</p>
    </div>
    <Button v-if="hasCode" class="crs-promo__action crs-promo__code-button" block :disabled="expired" @click="openCode">
      {{ resolvedActionLabel }}
      <span class="crs-promo__code-tail" aria-hidden="true">
        <span class="crs-promo__code-preview">{{ code.slice(-3) }}</span>
        <img class="crs-promo__code-fold" :src="expired ? '/courses/promo-code-fold-expired.svg' : '/courses/promo-code-fold.svg'" alt="" width="32" height="40">
      </span>
    </Button>
    <Button
      v-else
      class="crs-promo__action"
      block
      :disabled="expired"
      @click="openCode"
    >{{ resolvedActionLabel }}</Button>
    <PromoCodeModal v-model="modalOpen" :title="school" :description="description || title" :conditions="conditions" :code="code" :expires="expires" :href="href" />
  </article>
</template>

<style scoped>
.crs-promo{position:relative;box-sizing:border-box;display:flex;width:min(100%,var(--crs-size-260));min-width:0;height:calc(var(--crs-unit) * 268);flex-direction:column;overflow:visible;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850)}
.crs-promo__content{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-16)}
.crs-promo__school{display:flex;min-width:0;align-items:center;gap:var(--crs-space-8);white-space:nowrap}
.crs-promo__school strong{overflow:hidden;text-overflow:ellipsis;font:600 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-promo__offer{overflow:hidden;max-width:100%;border-radius:var(--crs-radius-12);background:var(--crs-blue-50);padding:var(--crs-space-16) var(--crs-space-20);color:var(--crs-blue-500);font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family);text-align:center;text-overflow:ellipsis;white-space:nowrap}
.crs-promo p{margin:0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-promo__action{margin-top:auto}
.crs-promo__code-tail{position:absolute;right:0;top:0;display:flex;width:calc(var(--crs-space-40) + var(--crs-space-4));height:100%;align-items:center;border-radius:0 calc(var(--crs-radius-12) - var(--crs-border-1)) calc(var(--crs-radius-12) - var(--crs-border-1)) 0;background:var(--crs-white);color:var(--crs-black-850)}
.crs-promo__code-preview{box-sizing:border-box;width:100%;overflow:hidden;padding-right:var(--crs-space-8);text-align:right;text-transform:uppercase}
.crs-promo__code-fold{position:absolute;left:calc(-1 * var(--crs-border-1));top:50%;width:var(--crs-size-32);height:var(--crs-size-40);transform:translateY(-50%)}
.crs-promo__code-button{--button-hover:var(--crs-black-850);overflow:hidden}
.crs-promo__code-button:hover:not(:disabled){opacity:.9}
.crs-promo__code-button:disabled .crs-promo__code-tail{color:var(--crs-black-500)}
.crs-promo__status{position:absolute;z-index:2;top:calc(var(--crs-space-8) * -1);right:0;display:flex;align-items:center;border-radius:var(--crs-radius-8) var(--crs-radius-8) 0 var(--crs-radius-8);background:var(--crs-black-400);padding:var(--crs-space-4);color:var(--crs-white);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}
.crs-promo__status .iconify{width:var(--crs-size-20);height:var(--crs-size-20)}
.crs-promo__status span{padding:0 var(--crs-space-4)}
.crs-promo--expired{color:var(--crs-black-500)}
.crs-promo--expired .crs-promo__logo{opacity:var(--crs-opacity-disabled-image)}
.crs-promo--expired .crs-promo__offer{background:var(--crs-black-50);color:var(--crs-black-500)}
@media(max-width:767px){.crs-promo{width:100%}}
</style>
