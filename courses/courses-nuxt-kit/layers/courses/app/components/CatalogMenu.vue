<script setup lang="ts">
type CatalogMode = 'adult' | 'child'
type Direction = { label: string; icon: string; image?: string }
type Group = { title: string; items: string[] }

const open = defineModel<boolean>({ default: false })
const mode = ref<CatalogMode>('adult')
const mobileDirection = ref<number | null>(null)

const adultDirections: Direction[] = [
  { label: 'Нейросети и AI', icon: 'i-tabler-sparkles' },
  { label: 'Разработка и IT', icon: 'i-tabler-code' },
  { label: 'Аналитика и Data Science', icon: 'i-tabler-chart-histogram' },
  { label: 'Дизайн и контент', icon: 'i-tabler-palette' },
  { label: 'Маркетинг и продажи', icon: 'i-tabler-speakerphone' },
  { label: 'Бизнес и менеджмент', icon: 'i-tabler-briefcase' },
  { label: 'Языки', icon: 'i-tabler-language' },
  { label: 'Саморазвитие и soft skills', icon: 'i-tabler-plant' },
  { label: 'Красота и здоровье', icon: 'i-tabler-heart' },
  { label: 'Хобби и творчество', icon: 'i-tabler-brush' },
  { label: 'Психология', icon: 'i-tabler-brain' },
  { label: 'Кулинария', icon: 'i-tabler-chef-hat' },
  { label: 'Педагогика', icon: 'i-tabler-school' },
  { label: 'Прикладные программы', icon: 'i-tabler-apps' },
  { label: 'Повышение квалификации', icon: 'i-tabler-certificate' }
]

const childDirections: Direction[] = [
  { label: 'Подготовка к ЕГЭ', icon: 'i-tabler-notes' },
  { label: 'Подготовка к ОГЭ', icon: 'i-tabler-pencil' },
  { label: 'Экзамены и аттестация', icon: 'i-tabler-checkup-list' },
  { label: 'Подготовка к ДВИ', icon: 'i-tabler-file-certificate' },
  { label: 'Подготовиться к ВПР', icon: 'i-tabler-clipboard-check' },
  { label: 'Подготовка к олимпиадам', icon: 'i-tabler-trophy' },
  { label: 'Подготовка к школе', icon: 'i-tabler-backpack' },
  { label: 'Домашнее обучение', icon: 'i-tabler-home' },
  { label: 'Найти хобби', icon: 'i-tabler-balloon' },
  { label: 'Иностранные языки', icon: 'i-tabler-language' },
  { label: 'Расширить кругозор', icon: 'i-tabler-world' },
  { label: 'Поступить в колледж', icon: 'i-tabler-building-community' }
]

const adultGroups: Group[] = [
  { title: 'Профессии и специализации', items: ['Веб-разработка', 'Frontend-разработка', 'Backend-разработка', 'Fullstack-разработка', '1С-разработка'] },
  { title: 'Мобильная разработка', items: ['Мобильная разработка', 'Android', 'iOS', 'Swift', 'Kotlin'] },
  { title: 'DevOps и администрирование', items: ['DevOps', 'Linux', 'Windows', 'Docker', 'Kubernetes'] },
  { title: 'Профессии-аналитики', items: ['Data-аналитика', 'Бизнес-аналитика', 'Системная аналитика', 'Продуктовая аналитика', 'Маркетинговая аналитика'] },
  { title: 'BI и визуализация', items: ['Power BI', 'Tableau', 'Yandex DataLens', 'Дашборды', 'Визуализация данных'] },
  { title: 'Языки программирования', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C#'] },
  { title: 'Разработка игр', items: ['GameDev', 'Unity', 'Unreal Engine', 'Геймдизайн'] },
  { title: 'Информационная безопасность', items: ['Кибербезопасность', 'Этичный хакинг', 'Защита данных', 'Сетевая безопасность'] },
  { title: 'Data Science и машинное обучение', items: ['Data Science', 'Machine Learning', 'Нейронные сети', 'Computer Vision'] }
]

const childGroups: Group[] = [
  { title: 'По предметам', items: ['Математика', 'Русский язык', 'Обществознание', 'Информатика', 'Биология', 'Физика', 'История', 'Английский язык', 'Химия', 'Литература'] },
  { title: 'По возрасту', items: ['1 класс', '2 класс', '3 класс', '4 класс', '5 класс', '6 класс', '7 класс', '8 класс', '9 класс', '10 класс', '11 класс'] }
]

const suggestions: Direction[] = [
  { label: 'Подборки профессий', icon: 'i-tabler-briefcase', image: '/courses/catalog/profession-collections.png' },
  { label: 'Отзывы о курсах', icon: 'i-tabler-message-star', image: '/courses/catalog/reviews.png' },
  { label: 'Промокоды', icon: 'i-tabler-ticket', image: '/courses/catalog/promo.png' },
  { label: 'Рейтинг онлайн-школ', icon: 'i-tabler-chart-bar', image: '/courses/catalog/rating.png' }
]

const adultImages = ['neural-ai','development','analytics','design','marketing','business','languages','soft-skills','wellness','hobby','psychology','cooking','pedagogy','software','continuing-education']
const childImages = ['child-ege','child-oge','child-exam','child-dvi','child-vpr','child-olympiad','child-school','child-home-school','child-hobby','child-languages','child-horizon','child-college']
const directions = computed(() => {
  const source = mode.value === 'adult' ? adultDirections : childDirections
  const images = mode.value === 'adult' ? adultImages : childImages
  return source.map((item,index)=>({...item,image:`/courses/catalog/${images[index]}.png`}))
})
const groups = computed(() => mode.value === 'adult' ? adultGroups : childGroups)
const mobileTitle = computed(() => directions.value[mobileDirection.value ?? 0]?.label ?? directions.value[0]?.label)

function setMode(value: CatalogMode) {
  mode.value = value
  mobileDirection.value = null
}
function goBack() {
  if (mobileDirection.value === null) open.value = false
  else mobileDirection.value = null
}
</script>

<template>
  <div v-if="open" class="crs-catalog-menu" :data-mobile-level="mobileDirection === null ? 'root' : 'detail'">
    <div class="crs-catalog-menu__search">
      <IconButton class="crs-catalog-menu__back" label="Назад" icon="i-tabler-arrow-left" variant="ghost" size="s" @click="goBack" />
      <SearchInput class="crs-catalog-menu__search-field" placeholder="Искать на Хабр Курсах" label="Поиск" />
    </div>

    <div class="crs-catalog-menu__side">
      <ButtonGroup v-model="mode" class="crs-catalog-menu__modes" label="Тип каталога" :items="[{ label: 'Для взрослых', value: 'adult' }, { label: 'Для детей', value: 'child' }]" />
      <nav class="crs-catalog-menu__list" aria-label="Направления">
        <Link v-for="(item, index) in directions" :key="item.label" class="crs-catalog-menu__row" :class="{ 'crs-catalog-menu__row--current': index === 0 }" href="#" tone="inherit" layout="flex" :aria-current="index === 0 ? 'page' : undefined">
          <img :src="item.image" alt="" class="crs-catalog-menu__row-icon"><span class="crs-catalog-menu__row-label">{{ item.label }}</span>
        </Link>
      </nav>
      <nav class="crs-catalog-menu__tiles" aria-label="Направления">
        <TileFilter v-for="(item, index) in directions" :key="item.label" :title="item.label" :image="item.image" variant="catalog" behavior="action" @activate="mobileDirection = index" />
      </nav>
      <section class="crs-catalog-menu__suggestions" aria-labelledby="catalog-suggestions-title">
        <h2 id="catalog-suggestions-title" class="crs-catalog-menu__suggestions-title">Может быть интересно</h2>
        <nav class="crs-catalog-menu__tiles" aria-label="Полезные разделы">
          <TileFilter v-for="item in suggestions" :key="item.label" :title="item.label" :image="item.image" variant="catalog" behavior="action" href="#" />
        </nav>
      </section>
    </div>

    <div class="crs-catalog-menu__mobile-detail" aria-live="polite">
      <h2 class="crs-catalog-menu__mobile-title">{{ mobileTitle }}</h2>
      <section v-for="group in groups" :key="group.title" class="crs-catalog-menu__group">
        <h3 class="crs-catalog-menu__group-title">{{ group.title }}</h3>
        <div class="crs-catalog-menu__column"><Link v-for="item in group.items" :key="item" class="crs-catalog-menu__course" href="#" tone="inherit">{{ item }}</Link><Link class="crs-catalog-menu__more" href="#">Смотреть все</Link></div>
      </section>
    </div>

    <div class="crs-catalog-menu__divider" aria-hidden="true" />
    <div class="crs-catalog-menu__groups">
      <section v-for="group in groups" :key="group.title" class="crs-catalog-menu__group">
        <h2 class="crs-catalog-menu__group-title">{{ group.title }}</h2>
        <div class="crs-catalog-menu__column"><Link v-for="item in group.items" :key="item" class="crs-catalog-menu__course" href="#" tone="inherit">{{ item }}</Link><Link class="crs-catalog-menu__more" href="#">Смотреть все</Link></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.crs-catalog-menu{box-sizing:border-box;display:grid;width:100%;grid-template-columns:var(--crs-size-272) var(--crs-border-1) minmax(0,1fr);column-gap:var(--crs-space-24);background:var(--crs-white);padding:var(--crs-space-24) var(--crs-space-40) var(--crs-space-24) var(--crs-space-24);color:var(--crs-black-850)}
.crs-catalog-menu__side{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-12)}.crs-catalog-menu__modes{display:grid;grid-template-columns:1fr 1fr;border-radius:var(--crs-radius-12);background:var(--crs-black-50);padding:var(--crs-space-4)}
.crs-catalog-menu__list{display:flex;flex-direction:column;padding:var(--crs-space-8) var(--crs-space-4)}.crs-catalog-menu__row{display:flex;align-items:center;gap:var(--crs-space-12);border-radius:var(--crs-radius-8);padding:var(--crs-space-8) var(--crs-space-12);color:inherit;text-decoration:none}.crs-catalog-menu__row:hover,.crs-catalog-menu__row--current{background:var(--crs-black-50);color:inherit;text-decoration:none}.crs-catalog-menu__row-icon{width:var(--crs-size-24);height:var(--crs-size-24);flex:none;object-fit:contain}.crs-catalog-menu__row-label{min-width:0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-catalog-menu__divider{width:var(--crs-border-1);background:var(--crs-black-100)}.crs-catalog-menu__groups{display:grid;min-width:0;grid-column:3;grid-template-columns:repeat(3,minmax(0,1fr));align-content:start;gap:var(--crs-space-32) var(--crs-space-24);padding-top:var(--crs-space-12)}.crs-catalog-menu__group{display:flex;flex-direction:column;gap:var(--crs-space-12)}.crs-catalog-menu__group-title,.crs-catalog-menu__mobile-title{margin:0;font:600 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family);letter-spacing:-.01em}.crs-catalog-menu__column{display:flex;min-width:0;flex-direction:column;gap:var(--crs-space-12)}.crs-catalog-menu__course,.crs-catalog-menu__more{color:inherit;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family);text-decoration:none}.crs-catalog-menu__course:hover,.crs-catalog-menu__more:hover{text-decoration:underline}.crs-catalog-menu__more{color:var(--crs-blue-500)}
.crs-catalog-menu__search,.crs-catalog-menu__tiles,.crs-catalog-menu__suggestions,.crs-catalog-menu__mobile-detail{display:none}
@media(max-width:1023px){.crs-catalog-menu__groups{grid-template-columns:minmax(0,1fr)}}
@media(max-width:767px){.crs-catalog-menu{display:block;padding:0}.crs-catalog-menu__side{padding:var(--crs-space-24)}.crs-catalog-menu__divider,.crs-catalog-menu__list,.crs-catalog-menu__groups{display:none}.crs-catalog-menu__search{display:flex;align-items:center;gap:var(--crs-space-10);border-bottom:var(--crs-border-1) solid var(--crs-black-100);padding:var(--crs-space-12) var(--crs-space-24)}.crs-catalog-menu__back{display:grid;width:var(--crs-size-24);height:var(--crs-size-24);flex:none;place-items:center;border:0;background:transparent;padding:0;color:var(--crs-black-850);cursor:pointer}.crs-catalog-menu__search-field{display:flex;height:var(--crs-size-40);min-width:0;flex:1;align-items:center;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);background:var(--crs-white);padding:0 var(--crs-space-12)}.crs-catalog-menu__search-input{width:100%;min-width:0;border:0;outline:0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-catalog-menu__tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--crs-space-8)}.crs-catalog-menu__suggestions{display:flex;flex-direction:column;gap:var(--crs-space-12)}.crs-catalog-menu__suggestions-title{margin:0;font:600 var(--crs-font-16)/var(--crs-leading-22) var(--crs-font-family)}.crs-catalog-menu[data-mobile-level=detail] .crs-catalog-menu__side{display:none}.crs-catalog-menu[data-mobile-level=detail] .crs-catalog-menu__mobile-detail{display:flex;flex-direction:column;gap:var(--crs-space-24);padding:var(--crs-space-24)}}
@media(max-width:479px){.crs-catalog-menu__tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
