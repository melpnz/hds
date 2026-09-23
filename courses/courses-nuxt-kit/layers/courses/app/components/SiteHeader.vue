<script setup lang="ts">
const menu = ref(false)
const servicesOpen = ref(false)
const listingFilters = reactive<Record<string, string>>({ direction: '', school: '', price: '' })
const listingFields = [
  { key: 'direction', label: 'Направление', options: [{ label: 'Программирование', value: 'development' }, { label: 'Дизайн', value: 'design' }] },
  { key: 'school', label: 'Школа', options: [{ label: 'Нетология', value: 'netology' }, { label: 'Хекслет', value: 'hexlet' }] },
  { key: 'price', label: 'Стоимость', options: [{ label: 'До 50 000 ₽', value: 'under-50000' }, { label: 'От 50 000 ₽', value: 'over-50000' }] }
]
withDefaults(defineProps<{
  product?: string
  family?: 'listing' | 'courses' | 'simple'
  level?: 'hero' | 'page'
  sticky?: boolean
  title?: string
  description?: string
}>(), { product: 'Курсы', family: 'listing', level: 'hero', sticky: false, title: 'Найдите подходящий курс', description: 'Сравнивайте программы, школы и стоимость обучения' })
</script>

<template>
  <header class="crs-site-header" :data-family="family" :data-level="level" :data-sticky="sticky">
    <div class="crs-site-header__blue">
      <div class="crs-site-header__topbar">
        <div class="crs-site-header__logo-area">
          <Link class="crs-site-header__brand" href="https://career.habr.com/courses" tone="inherit" layout="flex"><ServiceLogo service="courses" variant="brand" :size="32" label="Хабр Курсы" /></Link><i /><HeaderDropdown v-model="servicesOpen" embedded />
        </div>
        <div v-if="family === 'courses'" class="crs-site-header__course-tools">
          <Button class="crs-site-header__catalog"><template #leading><UIcon class="crs-site-header__catalog-icon" name="i-tabler-layout-grid" /></template><span>Каталог</span></Button>
          <SearchInput class="crs-site-header__course-search" placeholder="Искать на Хабр Курсах" label="Поиск по Хабр Курсам" />
        </div>
        <nav aria-label="Разделы сервиса">
          <slot name="navigation">
            <Link class="crs-site-header__nav-link" href="https://career.habr.com/education_centers" tone="inherit" layout="grid"><UIcon name="i-tabler-building" /><span class="crs-site-header__nav-label">Школы и Вузы</span></Link>
            <Link class="crs-site-header__nav-link" href="https://career.habr.com/education_centers/otzyvy" tone="inherit" layout="grid"><UIcon name="i-tabler-star" /><span class="crs-site-header__nav-label">Отзывы</span></Link>
            <Link class="crs-site-header__nav-link" href="https://career.habr.com/education/promocodes" tone="inherit" layout="grid"><UIcon name="i-tabler-percentage" /><span class="crs-site-header__nav-label">Промокоды</span></Link>
          </slot>
        </nav>
        <IconButton class="crs-site-header__mobile-menu" label="Меню" icon="i-tabler-menu-2" variant="ghost" @click="menu = true" />
      </div>

      <section v-if="family === 'listing' && level === 'hero'" class="crs-site-header__hero">
        <div><h1>{{ title }}</h1><p>{{ description }}</p></div>
        <div class="crs-site-header__hero-controls"><ButtonGroup model-value="all" variant="hero" :block="false" tabs label="Формат обучения" :items="[{ label: 'Все', value: 'all' }, { label: 'Онлайн', value: 'online' }]" /><Button class="crs-site-header__hero-action">Подобрать курс</Button><Button class="crs-site-header__hero-action" variant="secondary">Смотреть рейтинг</Button></div>
        <div class="crs-site-header__listing-form"><div><Select v-for="(field, index) in listingFields" :key="field.key" v-model="listingFilters[field.key]" class="crs-site-header__select" :class="`crs-site-header__select--${index + 1}`" :placeholder="field.label" :options="field.options" size="xl" /></div><Button class="crs-site-header__listing-action" size="xl">Найти курсы</Button></div>
      </section>

      <section v-if="family === 'listing' && level === 'page'" class="crs-site-header__listing-page">
        <div class="crs-site-header__listing-form"><div><Select v-for="(field, index) in listingFields" :key="field.key" v-model="listingFilters[field.key]" class="crs-site-header__select" :class="`crs-site-header__select--${index + 1}`" :placeholder="field.label" :options="field.options" size="xl" /></div><Button class="crs-site-header__listing-action" size="xl">Найти курсы</Button></div>
        <div class="crs-site-header__listing-pill"><strong>Все курсы</strong><small>Каталог · направления</small></div>
      </section>

      <nav v-if="family === 'courses' && level === 'hero'" class="crs-site-header__topmenu"><Chip class="crs-site-header__sale" tone="brand">РАСПРОДАЖА</Chip><Link href="#" tone="inherit" decoration="none">Разместить свой курс</Link><Link href="#" tone="inherit" decoration="none">Программирование</Link><Link href="#" tone="inherit" decoration="none">Нейросети и AI</Link><Link href="#" tone="inherit" decoration="none">Курсы для детей</Link><Link href="#" tone="inherit" decoration="none">Бесплатные курсы</Link></nav>
      <section v-if="family === 'courses' && level === 'page' && !sticky" class="crs-site-header__course-seo"><small>Каталог › Программирование</small><h2>{{ title }}</h2><p>Авторы · Проверено экспертами · Обновлено сегодня</p></section>
    </div>
    <div v-if="family === 'listing' || (family === 'courses' && level === 'page')" class="crs-site-header__filters"><div><FilterChip class="crs-site-header__filter" aria-label="Сортировка" icon="i-tabler-arrows-sort" /><FilterChip class="crs-site-header__filter" aria-label="Открыть фильтры" icon="i-tabler-adjustments-horizontal" /><FilterChip class="crs-site-header__filter">Со скидкой</FilterChip><FilterChip class="crs-site-header__filter">Направление</FilterChip><FilterChip class="crs-site-header__filter">Школа</FilterChip></div></div>
    <MobileMenu v-model="menu" :title="product"><slot name="mobile-navigation" /></MobileMenu>
  </header>
</template>

<style scoped>
.crs-site-header{position:relative;box-sizing:border-box;width:100%;overflow:hidden;background:var(--crs-white);color:var(--crs-black-850)}.crs-site-header[data-family="listing"][data-level="hero"]{height:calc(var(--crs-unit) * 472)}.crs-site-header[data-family="listing"][data-level="page"]{height:var(--crs-size-208)}.crs-site-header[data-family="listing"][data-level="page"][data-sticky="true"]{position:sticky;z-index:var(--crs-z-sticky);top:0;height:calc(var(--crs-unit) * 156);box-shadow:var(--crs-shadow-control)}.crs-site-header[data-family="courses"][data-level="hero"]{height:calc(var(--crs-unit) * 110)}.crs-site-header[data-family="courses"][data-level="page"]{height:calc(var(--crs-unit) * 266)}.crs-site-header[data-family="courses"][data-level="page"][data-sticky="true"]{position:sticky;z-index:var(--crs-z-sticky);top:0;height:calc(var(--crs-unit) * 124);box-shadow:var(--crs-shadow-control)}.crs-site-header[data-family="simple"]{height:var(--crs-size-64)}.crs-site-header__blue{position:relative;box-sizing:border-box;height:calc(100% - var(--crs-size-60));overflow:hidden;background:var(--crs-gradient-second);color:var(--crs-white);padding:0 var(--crs-space-24)}.crs-site-header[data-family="courses"][data-level="hero"] .crs-site-header__blue,.crs-site-header[data-family="simple"] .crs-site-header__blue{height:100%}.crs-site-header__topbar{position:relative;z-index:2;box-sizing:border-box;display:flex;width:100%;max-width:var(--crs-content);min-height:var(--crs-size-64);align-items:center;justify-content:space-between;gap:var(--crs-space-24);margin:auto}.crs-site-header[data-family="listing"][data-sticky="true"] .crs-site-header__topbar{display:none}.crs-site-header__logo-area{display:flex;align-items:center;gap:var(--crs-space-8);flex:none;color:var(--crs-white)}.crs-site-header__logo-area strong{font-size:var(--crs-font-20)}.crs-site-header__logo-area span{font-size:var(--crs-font-14)}.crs-site-header__logo-area i{width:var(--crs-border-1);height:var(--crs-size-24);background:var(--crs-white-transparent-50)}.crs-site-header nav{display:flex;align-items:flex-start;gap:var(--crs-space-16)}.crs-site-header__nav-link{display:grid;justify-items:center;color:var(--crs-white);font:600 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}.crs-site-header__topbar nav svg{width:var(--crs-size-24);height:var(--crs-size-24)}.crs-site-header__mobile-menu{display:none;border:0;background:transparent;color:var(--crs-white);padding:var(--crs-space-8)}.crs-site-header__mobile-menu svg{width:var(--crs-size-24);height:var(--crs-size-24)}.crs-site-header__course-tools{display:flex;min-width:0;flex:1;align-items:center;gap:var(--crs-space-8)}.crs-site-header__catalog,.crs-site-header__course-search{box-sizing:border-box;display:flex;height:var(--crs-size-40);align-items:center;border-radius:var(--crs-radius-12);font:600 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-site-header__catalog{gap:var(--crs-space-4);border:0;background:var(--crs-black-850);padding:var(--crs-space-8) var(--crs-space-16) var(--crs-space-8) var(--crs-space-8);color:var(--crs-white)}.crs-site-header__course-search{min-width:calc(var(--crs-unit) * 80);flex:1;justify-content:space-between;border:var(--crs-border-1) solid var(--crs-black-100);background:var(--crs-white);padding:var(--crs-space-8) var(--crs-space-12);color:var(--crs-black-500);font-weight:400}.crs-site-header__catalog svg,.crs-site-header__course-search svg{width:var(--crs-size-24);height:var(--crs-size-24)}.crs-site-header__hero{position:relative;z-index:2;display:flex;height:calc(100% - var(--crs-size-64));flex-direction:column;align-items:center;justify-content:center;gap:var(--crs-space-24);padding:var(--crs-space-40) 0 var(--crs-size-56);text-align:center}.crs-site-header__hero h1{margin:0;font:600 var(--crs-font-44)/var(--crs-leading-48) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}.crs-site-header__hero p{margin:var(--crs-space-8) 0 0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-site-header__hero-controls{display:flex;align-items:center;justify-content:center;gap:var(--crs-space-8)}.crs-site-header__listing-form{display:flex;width:100%;max-width:var(--crs-content);align-items:stretch;gap:var(--crs-space-8)}.crs-site-header__listing-form>div:first-child{display:grid;height:var(--crs-size-56);min-width:0;flex:1;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--crs-border-1);overflow:hidden;border-radius:var(--crs-radius-12)}.crs-site-header__listing-form svg{width:var(--crs-size-24);height:var(--crs-size-24)}.crs-site-header__listing-page{position:relative;z-index:2;display:flex;height:calc(100% - var(--crs-size-64));align-items:center;justify-content:center;padding:var(--crs-space-8) 0 var(--crs-space-20)}.crs-site-header[data-family="listing"][data-sticky="true"] .crs-site-header__listing-page{height:100%;padding:var(--crs-space-20) 0}.crs-site-header__listing-pill{display:none;width:var(--crs-size-272);flex-direction:column;border-radius:var(--crs-radius-full);background:var(--crs-white);padding:var(--crs-space-16) var(--crs-space-24);color:var(--crs-black-850);text-align:center}.crs-site-header__listing-pill small{margin-top:var(--crs-space-2);color:var(--crs-black-500);font-size:var(--crs-font-12)}.crs-site-header__topmenu{position:relative;z-index:2;box-sizing:border-box;display:flex;width:100%;max-width:var(--crs-content);height:calc(var(--crs-unit) * 46);align-items:center;overflow-x:auto;margin:auto;white-space:nowrap;font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family);scrollbar-width:none}.crs-site-header__topmenu>span{border-radius:var(--crs-radius-full);background:var(--crs-blue-600);padding:var(--crs-space-4) var(--crs-space-8);font-size:var(--crs-font-10);font-weight:600}.crs-site-header__course-seo{position:relative;z-index:2;display:grid;width:100%;max-width:var(--crs-content);height:calc(var(--crs-unit) * 142);align-content:center;gap:var(--crs-space-8);margin:auto}.crs-site-header__course-seo h2{margin:0;font:600 var(--crs-font-30)/var(--crs-leading-34) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}.crs-site-header__course-seo p,.crs-site-header__course-seo small{margin:0;font-size:var(--crs-font-12);line-height:var(--crs-leading-16)}.crs-site-header__filters{box-sizing:border-box;height:var(--crs-size-60);background:var(--crs-white)}.crs-site-header__filters>div{box-sizing:border-box;display:flex;width:100%;max-width:var(--crs-container);height:var(--crs-size-60);align-items:center;gap:var(--crs-space-4);overflow-x:auto;margin:auto;padding:var(--crs-space-12) var(--crs-gutter);scrollbar-width:none}.crs-site-header__filter{flex:none}
@media(max-width:1023px){.crs-site-header[data-family="listing"][data-level="hero"]{height:calc(var(--crs-unit) * 464)}.crs-site-header[data-family="simple"]{height:var(--crs-size-56)}.crs-site-header__topbar{min-height:var(--crs-size-56)}.crs-site-header[data-family="courses"] .crs-site-header__topbar{min-height:var(--crs-size-64)}.crs-site-header__nav-label{display:none}.crs-site-header__hero{height:calc(100% - var(--crs-size-56))}.crs-site-header__filters>div{overscroll-behavior-inline:contain;touch-action:pan-x}}
.crs-site-header__logo-area strong{font-weight:400}.crs-site-header__dropdown{width:var(--crs-size-24)!important;height:var(--crs-size-24)!important}.crs-site-header__topbar nav .iconify{display:block;width:var(--crs-size-24);height:var(--crs-size-24)}
.crs-site-header{overflow:visible}
.crs-site-header__blue{z-index:2;overflow:visible}
.crs-site-header__filters{position:relative;z-index:1}
.crs-site-header .crs-site-header__topmenu{align-items:center;gap:var(--crs-space-16);overflow-y:hidden}
.crs-site-header__topmenu>.crs-site-header__sale{border-radius:var(--crs-radius-full);background:var(--crs-blue-600);padding:var(--crs-space-4) var(--crs-space-8);font-size:var(--crs-font-10);font-weight:600;line-height:var(--crs-leading-14)}
.crs-site-header__topmenu>.crs-link,.crs-site-header__topmenu>.crs-site-header__sale{flex:none}
.crs-site-header__topmenu{overscroll-behavior-inline:contain}
.crs-site-header__brand{display:flex;align-items:center;gap:var(--crs-space-8);color:inherit}
.crs-site-header__topbar{z-index:3}
.crs-site-header__brand img{display:block;width:calc(var(--crs-unit) * 97);height:var(--crs-size-32)}
.crs-site-header__logo-area{--crs-header-dropdown-panel-right:auto;--crs-header-dropdown-panel-left:calc(var(--crs-unit) * -110);--crs-header-dropdown-panel-width:min(calc(var(--crs-unit) * 200),calc(100vw - var(--crs-space-48)));gap:0}
.crs-site-header__logo-area>i{margin-left:var(--crs-space-12)}
.crs-site-header__nav-link{display:flex;flex-direction:column;gap:0}
.crs-site-header__nav-link:hover{color:inherit;text-decoration:none}
.crs-site-header__select{--crs-select-border-width:0;--crs-select-radius:0;--crs-select-background:var(--crs-white);--crs-select-color:var(--crs-black-500);min-width:0}
.crs-site-header__listing-form>div:first-child{overflow:visible}
.crs-site-header__select--1{--crs-select-radius:var(--crs-radius-12) 0 0 var(--crs-radius-12)}
.crs-site-header__select--3{--crs-select-radius:0 var(--crs-radius-12) var(--crs-radius-12) 0}
@media(max-width:767px){
  .crs-site-header[data-family="listing"][data-level="hero"]{height:calc(var(--crs-unit) * 744)}
  .crs-site-header[data-family="listing"][data-level="page"]{height:calc(var(--crs-unit) * 216)}
  .crs-site-header[data-family="courses"][data-level="hero"]{height:calc(var(--crs-unit) * 142)}
  .crs-site-header[data-family="courses"][data-level="page"]{height:auto}
  .crs-site-header[data-family="courses"][data-level="page"][data-sticky="true"]{height:calc(var(--crs-unit) * 168)}
  .crs-site-header[data-family="simple"]{height:var(--crs-size-56)}
  .crs-site-header__topbar{gap:var(--crs-space-8)}
  .crs-site-header__topbar nav{display:flex}
  .crs-site-header__mobile-menu{display:none}
  .crs-site-header__hero{height:calc(100% - var(--crs-size-56));padding:var(--crs-space-40) 0}
  .crs-site-header__hero h1{font-size:var(--crs-font-30);line-height:var(--crs-leading-34)}
  .crs-site-header__hero-controls{width:100%;flex-direction:column}
  .crs-site-header__hero-action{width:100%}
  .crs-site-header__listing-form{flex-direction:column}
  .crs-site-header__listing-form>div:first-child{height:auto;flex:none;grid-template-columns:1fr;gap:var(--crs-border-1);overflow:visible}
  .crs-site-header__listing-action{width:100%}
  .crs-site-header__listing-page .crs-site-header__listing-form{display:none}
  .crs-site-header__listing-pill{box-sizing:border-box;display:flex;width:100%}
  .crs-site-header__course-tools{order:3;flex-basis:100%}
  .crs-site-header__catalog{--button-gap:0;--button-label-display:none;padding-right:var(--crs-space-8)}
  .crs-site-header__catalog .crs-site-header__catalog-icon{display:inline-block}
  .crs-site-header[data-family="courses"][data-level="hero"] .crs-site-header__blue{padding-bottom:var(--crs-space-16)}
  .crs-site-header__topbar:has(.crs-site-header__course-tools){min-height:calc(var(--crs-unit) * 96);align-content:start;flex-wrap:wrap;column-gap:var(--crs-space-8);row-gap:var(--crs-space-12);padding-top:var(--crs-space-12)}
  .crs-site-header[data-family="courses"][data-level="page"] .crs-site-header__blue{height:auto}
  .crs-site-header[data-family="courses"][data-level="page"][data-sticky="true"] .crs-site-header__blue{padding-bottom:var(--crs-space-12)}
  .crs-site-header__course-seo{height:auto;align-content:start;padding:var(--crs-space-12) 0 var(--crs-space-24)}
  .crs-site-header__course-seo h2{font-size:var(--crs-font-24);line-height:var(--crs-leading-28)}
  .crs-site-header__topmenu{width:calc(100% + var(--crs-space-48));max-width:none;height:var(--crs-size-30);margin-left:calc(-1 * var(--crs-space-24));margin-right:calc(-1 * var(--crs-space-24));padding-top:var(--crs-space-8);padding-left:var(--crs-space-24);scrollbar-width:auto;touch-action:pan-x}
  .crs-site-header__select--1{--crs-select-radius:var(--crs-radius-12) var(--crs-radius-12) 0 0}
  .crs-site-header__select--2{--crs-select-radius:0}
  .crs-site-header__select--3{--crs-select-radius:0 0 var(--crs-radius-12) var(--crs-radius-12)}
}
</style>
