<script setup lang="ts">
const selected = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{
  title: string
  description?: string
  image?: string
  imageFit?: 'contain' | 'cover'
  icon?: string
  variant?: 'image' | 'level' | 'catalog'
  behavior?: 'toggle' | 'action'
  href?: string
  disabled?: boolean
  showArrow?: boolean
  layout?: 'default' | 'spacious'
}>(), {
  icon: 'i-tabler-school',
  imageFit: 'contain',
  variant: 'image',
  behavior: 'toggle',
  showArrow: true,
  layout: 'default'
})

const emit = defineEmits<{ activate: [] }>()
const componentTag = computed(() => props.href ? 'a' : 'button')

function activate(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  if (!props.href && props.behavior === 'toggle') selected.value = !selected.value
  emit('activate')
}
</script>

<template>
  <component
    :is="componentTag"
    :type="href ? undefined : 'button'"
    :href="disabled ? undefined : href"
    class="crs-tile"
    :class="[`crs-tile--${variant}`, `crs-tile--image-${imageFit}`, `crs-tile--layout-${layout}`, { 'crs-tile--selected': selected, 'crs-tile--without-arrow': !showArrow }]"
    :disabled="href ? undefined : disabled"
    :aria-disabled="href && disabled ? 'true' : undefined"
    :tabindex="href && disabled ? -1 : undefined"
    :aria-pressed="!href && behavior === 'toggle' ? selected : undefined"
    @click="activate"
  >
    <template v-if="variant === 'image'">
      <span class="crs-tile__surface"><img :src="image || '/courses/catalog/development.png'" alt="" class="crs-tile__image"></span>
      <span class="crs-tile__label">{{ title }}</span>
    </template>
    <template v-else-if="variant === 'level'">
      <img v-if="image" :src="image" alt="" class="crs-tile__level-icon">
      <UIcon v-else :name="icon" class="crs-tile__level-icon" />
      <span class="crs-tile__copy"><strong>{{ title }}</strong><small v-if="description">{{ description }}</small></span>
      <UIcon v-if="showArrow" name="i-tabler-arrow-right" class="crs-tile__arrow" />
    </template>
    <template v-else>
      <span class="crs-tile__surface"><img :src="image || '/courses/catalog/development.png'" alt="" class="crs-tile__image"></span>
      <span class="crs-tile__label">{{ title }}</span>
    </template>
  </component>
</template>

<style scoped>
.crs-tile{margin:0;border:0;background:transparent;color:var(--crs-black-850);cursor:pointer}
.crs-tile:focus-visible{outline:none}
.crs-tile:disabled{color:var(--crs-black-400);cursor:not-allowed}

.crs-tile--image{display:flex;width:calc(var(--crs-unit) * 122);flex:0 0 calc(var(--crs-unit) * 122);flex-direction:column;align-items:center;gap:var(--crs-space-8);padding:0;font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}
.crs-tile__surface{box-sizing:border-box;display:grid;width:calc(var(--crs-unit) * 122);height:calc(var(--crs-unit) * 122);place-items:center;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-16);background:var(--crs-white);padding:var(--crs-space-20)}
.crs-tile__image{display:block;width:calc(var(--crs-unit) * 80);height:calc(var(--crs-unit) * 80);object-fit:cover}
.crs-tile--image-cover .crs-tile__surface{padding:0}
.crs-tile--image-cover .crs-tile__image{width:100%;height:100%}
.crs-tile__label{width:100%;overflow-wrap:anywhere;text-align:center}
.crs-tile--image:hover .crs-tile__surface{border-color:var(--crs-black-200)}
.crs-tile--image:focus-visible .crs-tile__surface{box-shadow:var(--crs-focus)}
.crs-tile--image.crs-tile--selected{color:var(--crs-blue-500)}
.crs-tile--image.crs-tile--selected .crs-tile__surface{border-color:var(--crs-blue-300);background:var(--crs-blue-50)}
.crs-tile--image:disabled .crs-tile__surface{border-color:var(--crs-black-50);background:var(--crs-black-50)}
.crs-tile--image:disabled .crs-tile__image{opacity:var(--crs-opacity-disabled-image)}

.crs-tile--level{display:grid;width:100%;min-height:var(--crs-size-64);grid-template-columns:var(--crs-size-24) minmax(0,1fr) auto;align-items:start;gap:var(--crs-space-4);border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:var(--crs-white);padding:calc(var(--crs-unit) * 11) var(--crs-space-12);text-align:left}
.crs-tile--level.crs-tile--without-arrow{grid-template-columns:var(--crs-size-24) minmax(0,1fr)}
.crs-tile--level.crs-tile--layout-spacious{grid-template-columns:var(--crs-size-32) minmax(0,1fr);gap:var(--crs-space-12)}
.crs-tile--level:hover{border-color:var(--crs-black-200)}
.crs-tile--level:focus-visible{box-shadow:var(--crs-focus)}
.crs-tile--level.crs-tile--selected{border-color:var(--crs-blue-300);background:var(--crs-blue-50);color:var(--crs-blue-500)}
.crs-tile__level-icon{display:block;width:var(--crs-size-24);height:var(--crs-size-24)}
.crs-tile__copy{display:grid;min-width:0;gap:var(--crs-space-2);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-tile__copy strong{font:inherit;overflow-wrap:anywhere}
.crs-tile__copy small{color:var(--crs-black-500);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family);overflow-wrap:anywhere}
.crs-tile__arrow{width:var(--crs-size-24);height:var(--crs-size-24)}

.crs-tile--catalog{position:relative;display:block;width:100%;overflow:hidden;aspect-ratio:1;border-radius:var(--crs-radius-8);background:var(--crs-black-50);padding:0;text-align:left;text-decoration:none}
.crs-tile--catalog .crs-tile__surface{position:absolute;z-index:1;inset:0;width:100%;height:100%;border:0;border-radius:inherit;background:transparent;padding:0}
.crs-tile--catalog .crs-tile__image{width:100%;height:100%;object-fit:cover;object-position:center}
.crs-tile--catalog .crs-tile__label{position:absolute;z-index:2;top:var(--crs-space-8);left:var(--crs-space-12);width:auto;max-width:80%;color:var(--crs-black-850);font:600 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family);text-align:left}
.crs-tile--catalog:hover{color:inherit;text-decoration:none}
.crs-tile--catalog:focus-visible{box-shadow:inset 0 0 0 var(--crs-border-2) var(--crs-black-400)}
.crs-tile--catalog[aria-disabled="true"]{opacity:var(--crs-opacity-disabled-image);cursor:not-allowed}

@media(max-width:479px){
  .crs-tile--image{width:calc(var(--crs-unit) * 84);flex-basis:calc(var(--crs-unit) * 84)}
  .crs-tile__surface{width:calc(var(--crs-unit) * 84)}
  .crs-tile__surface{height:calc(var(--crs-unit) * 84);padding:var(--crs-space-12)}
  .crs-tile__image{width:var(--crs-size-60);height:var(--crs-size-60)}
  .crs-tile--image-cover .crs-tile__surface{padding:0}
  .crs-tile--image-cover .crs-tile__image{width:100%;height:100%}
}
</style>
