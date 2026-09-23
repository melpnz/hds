<script setup lang="ts">
import type { CoursesRegistryEntry } from '#layers/courses/app/data/coursesRegistry'
import { defineAsyncComponent, type Component } from 'vue'

const props = withDefaults(defineProps<{ entry: CoursesRegistryEntry; siteHeaderVariant?: string }>(), {
  siteHeaderVariant: 'listing-hero'
})
const isInitiallyOpen = (id: string) => ['filter-modal', 'catalog-menu', 'header-dropdown', 'modal', 'price-sheet', 'promo-code-modal'].includes(id)
const overlayOpen = ref(isInitiallyOpen(props.entry.id))
const componentModules = import.meta.glob('../../layers/courses/app/components/*.vue') as Record<string, () => Promise<{ default: Component }>>
const componentMap = Object.fromEntries(Object.entries(componentModules).map(([path, loader]) => [
  path.match(/([^/]+)\.vue$/)?.[1], defineAsyncComponent(() => loader().then(module => module.default))
])) as Record<string, Component>
const dynamicComponent = computed(() => componentMap[props.entry.name])
const siteHeaderVariants = {
  'listing-hero': { family: 'listing', level: 'hero', sticky: false },
  'listing-page': { family: 'listing', level: 'page', sticky: false },
  'listing-page-sticky': { family: 'listing', level: 'page', sticky: true },
  'courses-hero': { family: 'courses', level: 'hero', sticky: false },
  'courses-page': { family: 'courses', level: 'page', sticky: false },
  'courses-page-sticky': { family: 'courses', level: 'page', sticky: true },
  'simple-page': { family: 'simple', level: 'page', sticky: false }
} as const
const siteHeaderProps = computed(() => siteHeaderVariants[props.siteHeaderVariant as keyof typeof siteHeaderVariants] || siteHeaderVariants['listing-hero'])
const buttonVariants = ['main','secondary','danger','danger-outline','success','success-outline'] as const
const buttonSizes = ['m', 'l', 'xl'] as const
const filterChipMenuItems = [
  { label: 'Все школы и вузы' },
  { label: 'Рейтинг школ и вузов' },
  { label: 'Отзывы о курсах и программах' },
  { label: 'Промокоды и акции 2026' }
]
const optionListItems = [
  { label: 'Разработка', value: 'development', icon: 'i-tabler-code' },
  { label: 'Дизайн', value: 'design', description: 'UX/UI и графический дизайн', icon: 'i-tabler-palette' },
  { label: 'Аналитика', value: 'analytics', icon: 'i-tabler-chart-bar' },
  { label: 'Недоступный вариант', value: 'disabled', disabled: true }
]
const optionListSingle = ref<string | number | (string | number)[] | null>('development')
const optionListMultiple = ref<string | number | (string | number)[] | null>(['development', 'analytics'])
const optionListRich = ref<string | number | (string | number)[] | null>(['rich'])
const optionListRichItems = [{
  label: 'Продуктовая аналитика',
  value: 'rich',
  descriptionTop: 'Направление',
  descriptionBottom: 'Обновлено сегодня',
  icon: 'i-tabler-help-circle',
  avatarSrc: '/courses/avatar-default-user.svg',
  avatarAlt: 'Автор',
  logoSrc: '/courses/services/courses.svg',
  logoAlt: 'Хабр Курсы',
  count: 8,
  meta: '12 курсов',
  trailingIcon: 'i-tabler-help-circle',
  trailingIconSecondary: 'i-tabler-dots'
}]
const lastOptionAction = ref('Действие ещё не выбрано')
const optionActionItems = optionListItems.slice(0, 3).map(item => ({ ...item, onSelect: () => { lastOptionAction.value = item.label } }))
const buttonGroupValue = ref('list')
const textInputActionValue = ref('Текст с кнопкой')
watch(() => props.entry.id, id => { overlayOpen.value = isInitiallyOpen(id) }, { immediate: true })
onMounted(() => { overlayOpen.value = isInitiallyOpen(props.entry.id) })
</script>

<template>
  <div class="catalog-demo">
    <template v-if="entry.id === 'button'">
      <div class="button-guide">
        <div class="button-grid button-grid--variants">
          <span />
          <strong v-for="size in buttonSizes" :key="`${size}-plain`">{{ size.toUpperCase() }}</strong>
          <strong v-for="size in buttonSizes" :key="`${size}-icon`">{{ size.toUpperCase() }} · icon</strong>
          <template v-for="variant in buttonVariants" :key="variant">
            <strong>{{ variant }}</strong>
            <Button v-for="size in buttonSizes" :key="`${variant}-${size}`" :size="size" :variant="variant">Кнопка</Button>
            <Button v-for="size in buttonSizes" :key="`${variant}-${size}-icon`" :size="size" :variant="variant">
              <template #leading><UIcon name="i-tabler-plus" /></template>
              Кнопка
            </Button>
          </template>
        </div>
        <div class="button-context-variant"><small>brand · compact · контекстный триггер</small><Button variant="brand" density="compact"><span>Все сервисы</span><template #trailing><UIcon name="i-tabler-chevron-down" /></template></Button></div>
      </div>
    </template>
    <template v-else-if="entry.id === 'icon-button'">
      <div class="variant-guide"><h2>Варианты</h2><div class="icon-button-variants"><div><small>default</small><IconButton label="Назад" icon="i-tabler-chevron-left" /><IconButton label="Вперёд" icon="i-tabler-chevron-right" /><IconButton label="Настройки" icon="i-tabler-settings" /></div><div><small>ghost</small><IconButton variant="ghost" label="Назад без обводки" icon="i-tabler-chevron-left" /><IconButton variant="ghost" label="Вперёд без обводки" icon="i-tabler-chevron-right" /><IconButton variant="ghost" label="Настройки без обводки" icon="i-tabler-settings" /></div><div><small>без фона</small><IconButton variant="ghost" hover="none" label="Без фоновой подсветки" icon="i-tabler-x" /></div></div></div>
    </template>
    <template v-else-if="entry.id === 'button-group'">
      <div class="variant-guide">
        <h2>Варианты</h2>
        <ButtonGroup v-model="buttonGroupValue" label="Светлая группа на всю ширину" :items="[{ label: 'Список', value: 'list' }, { label: 'Плитка', value: 'grid' }]" />
        <ButtonGroup v-model="buttonGroupValue" :block="false" label="Компактная светлая группа" :items="[{ label: 'Список', value: 'list' }, { label: 'Плитка', value: 'grid' }]" />
        <div class="button-group-hero"><ButtonGroup v-model="buttonGroupValue" variant="hero" label="Синяя группа на всю ширину" :items="[{ label: 'Список', value: 'list' }, { label: 'Плитка', value: 'grid' }]" /><ButtonGroup v-model="buttonGroupValue" variant="hero" :block="false" label="Компактная синяя группа" :items="[{ label: 'Список', value: 'list' }, { label: 'Плитка', value: 'grid' }]" /></div>
      </div>
    </template>
    <template v-else-if="entry.id === 'text-input'">
      <div class="field-guide">
        <section><h2>Размеры</h2><div class="field-sizes"><label><small>M · 40 px</small><TextInput placeholder="Введите значение" aria-label="M" /></label><label><small>XL · 56 px</small><TextInput size="xl" placeholder="Введите значение" aria-label="XL" /></label></div></section>
        <section><h2>Варианты</h2><div class="field-sizes"><TextInput label="С подписью" placeholder="Введите значение" hint="Необязательное поле" /><TextInput label="Иконка слева" placeholder="Поиск" leading-icon="i-tabler-search" /><TextInput label="Иконка справа" model-value="Текст" trailing-icon="i-tabler-circle-check" /><TextInput label="Иконки с двух сторон" placeholder="Найти" leading-icon="i-tabler-search" trailing-icon="i-tabler-x" /><TextInput v-model="textInputActionValue" label="Кликабельная иконка" trailing-icon="i-tabler-x" trailing-action-label="Очистить поле" @trailing-action="textInputActionValue = ''" /><TextInput label="С ошибкой" model-value="Некорректный текст" error="Проверьте значение" /><TextInput label="Только чтение" model-value="Готовое значение" readonly /></div></section>
      </div>
    </template>
    <template v-else-if="entry.id === 'checkbox'">
      <div class="control-guide"><h2>Варианты</h2><div class="control-variants"><Checkbox label="Не выбрано" /><Checkbox :model-value="true" label="Выбрано" /><Checkbox indeterminate label="Выбрана часть" /><Checkbox label="С описанием" description="Дополнительное пояснение" /><Checkbox disabled label="Недоступно" /></div></div>
    </template>
    <template v-else-if="entry.id === 'radio-button'">
      <div class="control-guide"><h2>Варианты</h2><div class="control-variants"><RadioButton name="demo" value="a" label="Не выбрано" /><RadioButton name="demo-selected" model-value="b" value="b" label="Выбрано" /><RadioButton name="demo-long" value="c" label="Вариант с длинной подписью" /><RadioButton name="demo-disabled" value="d" disabled label="Недоступно" /><RadioButton name="demo-loading" value="e" loading label="Загрузка" /></div></div>
    </template>
    <template v-else-if="entry.id === 'switch'">
      <div class="control-guide"><h2>Варианты</h2><div class="control-variants"><Switch label="Выключен" /><Switch :model-value="true" label="Включён" /><Switch label="" aria-label="Без подписи" /><Switch disabled label="Недоступно" /><Switch loading label="Загрузка" /></div></div>
    </template>
    <template v-else-if="entry.id === 'filter-chip'">
      <div class="control-guide filter-chip-guide">
        <section><h2>Фильтры</h2><div class="chip-matrix">
          <FilterChip>Обычный</FilterChip>
          <FilterChip :model-value="true">Выбранный</FilterChip>
          <FilterChip :count="12">Со счётчиком</FilterChip>
          <FilterChip disabled>Недоступный</FilterChip>
          <FilterChip loading>Загрузка</FilterChip>
        </div></section>
        <section><h2>Варианты с иконками</h2><div class="chip-matrix">
          <FilterChip icon="i-tabler-arrows-sort" aria-label="Сортировка" />
          <FilterChip icon="i-tabler-adjustments-horizontal">С иконкой</FilterChip>
          <FilterChip icon="i-tabler-category" :model-value="true">Выбранный пункт</FilterChip>
          <FilterChip dropdown :dropdown-items="filterChipMenuItems">Школа</FilterChip>
        </div></section>
      </div>
    </template>
    <template v-else-if="entry.id === 'option-list'">
      <div class="field-guide option-list-guide">
        <section><h2>Одиночный выбор</h2><OptionList v-model="optionListSingle" :items="optionListItems" selection-mode="single" /></section>
        <section><h2>Множественный выбор</h2><OptionList v-model="optionListMultiple" :items="optionListItems" selection-mode="multiple" /></section>
        <section><h2>Действия</h2><OptionList :items="optionActionItems" selection-mode="action" /><small>{{ lastOptionAction }}</small></section>
        <section><h2>Полный состав строки</h2><OptionList v-model="optionListRich" class="option-list-rich" :items="optionListRichItems" selection-mode="multiple" fluid /></section>
      </div>
    </template>
    <template v-else-if="entry.id === 'option-item'">
      <OptionList embedded>
        <OptionItem label="Обычный пункт" value="default" />
        <OptionItem label="Выбранный пункт" description="С дополнительным описанием" value="selected" selected />
        <OptionItem label="Недоступный пункт" value="disabled" disabled />
      </OptionList>
    </template>
    <template v-else-if="entry.id === 'textarea'">
      <div class="field-guide"><section><h2>Варианты</h2><div class="field-sizes"><Textarea label="Пустое" placeholder="Введите текст" hint="Подсказка" /><Textarea label="Заполненное" model-value="Текст в несколько строк" /><Textarea label="С ошибкой" error="Проверьте значение" model-value="Некорректный текст" /><Textarea label="Только чтение" readonly model-value="Готовый текст" /></div></section></div>
    </template>
    <template v-else-if="entry.id === 'chip'">
      <div class="variant-guide"><h2>Варианты Chip</h2><div class="demo-row"><Chip tone="neutral">Нейтральный</Chip><Chip tone="surface">На поверхности</Chip><Chip tone="blue">Информация</Chip><Chip tone="green">Успешно</Chip><Chip tone="orange-soft">Средний уровень</Chip><Chip tone="red">Сложный уровень</Chip><Chip tone="orange">Партнёрский</Chip><Chip tone="orange" size="s">Компактный</Chip><Chip variant="counter">+12</Chip><Chip removable>С удалением</Chip></div></div>
    </template>
    <template v-else-if="entry.id === 'rating-badge'">
      <div class="variant-guide"><h2>Варианты RatingBadge</h2><div class="rating-badge-guide">
        <figure><RatingBadge :value="4.9" :reviews="120" /><figcaption><strong>summary · S</strong><span>Компактный рейтинг в CourseCard</span></figcaption></figure>
        <figure><RatingBadge :value="4.9" :reviews="120" size="m" /><figcaption><strong>summary · M</strong><span>Без подложки и полей в SchoolCard и EntityHeader</span></figcaption></figure>
        <figure><RatingBadge :value="4.9" variant="stars" /><figcaption><strong>stars</strong><span>Набор звёзд в ReviewCard</span></figcaption></figure>
      </div></div>
    </template>
    <template v-else-if="entry.id === 'social-icon'">
      <div class="variant-guide"><h2>Социальные сети</h2><div class="demo-row"><SocialIcon name="i-tabler-brand-telegram" label="Telegram" /><SocialIcon name="i-tabler-brand-vk" label="ВКонтакте" /><SocialIcon name="i-tabler-brand-x" label="X" /><SocialIcon name="i-tabler-brand-facebook" label="Facebook" /><SocialIcon name="i-tabler-brand-instagram" label="Instagram" /></div></div>
    </template>
    <template v-else-if="entry.id === 'toast'">
      <div class="feedback-guide"><h2>Варианты</h2><div class="toast-guide"><Toast tone="info">Информационное сообщение</Toast><Toast tone="success">Действие выполнено</Toast><Toast tone="warning">Обратите внимание</Toast><Toast tone="error">Произошла ошибка</Toast></div></div>
    </template>
    <template v-else-if="entry.id === 'informer'">
      <div class="feedback-guide"><h2>Варианты</h2><div class="informer-guide">
        <Informer tone="info" title="Информация" description="Рассказывает о доступных опциях или объясняет функциональность." :links="[{ label: 'Подробнее', href: '#' }, { label: 'Настройки', href: '#' }]" />
        <Informer tone="success" title="Готово" description="Процесс успешно завершён." :links="[{ label: 'Посмотреть результат', href: '#' }]" />
        <Informer tone="warning" title="Обратите внимание" description="Проверьте ограничения перед продолжением." :links="[{ label: 'Как исправить', href: '#' }]" />
        <Informer tone="error" title="Действие недоступно" description="Устраните ошибку, чтобы продолжить." :links="[{ label: 'Что делать', href: '#' }]" />
      </div></div>
    </template>
    <template v-else-if="entry.id === 'link'">
      <div class="variant-guide"><h2>Варианты</h2><div class="demo-row"><Link href="#">Обычная ссылка</Link><Link href="#" external>Внешняя ссылка</Link><Link href="#" muted>Второстепенная ссылка</Link></div></div>
    </template>
    <template v-else-if="entry.id === 'avatar'">
      <div class="avatar-guide"><h2>Дефолт · все размеры</h2><div class="avatar-scale">
        <figure v-for="size in [100, 68, 56, 48, 40, 36, 32, 24] as const" :key="size"><Avatar :size="size" /><figcaption>{{ size }}×{{ size }}</figcaption></figure>
      </div></div>
    </template>
    <template v-else-if="entry.id === 'entity-logo'">
      <div class="avatar-guide"><h2>По умолчанию · все размеры</h2><div class="avatar-scale">
        <figure v-for="size in [100, 68, 56, 48, 40, 36, 32, 24] as const" :key="size"><EntityLogo :size="size" label="Компания" /><figcaption>{{ size }}×{{ size }}</figcaption></figure>
      </div></div>
    </template>
    <template v-else-if="entry.id === 'filter-bar'">
      <FilterBar><FilterChip>Все</FilterChip><FilterChip>Разработка</FilterChip><FilterChip>Дизайн</FilterChip><FilterChip>Аналитика</FilterChip></FilterBar>
    </template>
    <template v-else-if="entry.id === 'tile-filter'">
      <div class="variant-guide"><h2>Варианты</h2><div class="tile-filter-guide"><TileFilter title="С внутренними отступами" image="/courses/catalog/development.png" /><TileFilter title="Изображение в край" image="/courses/filter-modal/recommendation-career.png" image-fit="cover" /><TileFilter title="Средний уровень" description="Хотите углубиться или прокачать навык" image="/courses/filter-grade-mid.svg" variant="level" :show-arrow="false" /><div class="tile-filter-catalog-demo"><TileFilter title="Разработка и IT" image="/courses/catalog/development.png" variant="catalog" behavior="action" /></div><div class="tile-filter-catalog-demo"><TileFilter title="Отзывы о курсах" image="/courses/catalog/reviews.png" variant="catalog" behavior="action" href="#" /></div></div></div>
    </template>
    <template v-else-if="entry.id === 'card-grid'">
      <CardGrid><div v-for="item in 4" :key="item" class="demo-card">Карточка {{ item }}</div></CardGrid>
    </template>
    <template v-else-if="entry.id === 'section'">
      <Section v-bind="entry.props"><div class="demo-surface">Содержимое секции</div></Section>
    </template>
    <template v-else-if="entry.id === 'carousel'">
      <Carousel variant="course-card"><CourseCard v-for="item in 4" :key="item" :title="`Курс ${item}`" /></Carousel>
    </template>
    <template v-else-if="entry.id === 'ad-slot'">
      <AdSlot />
    </template>
    <template v-else-if="entry.id === 'faq-block'">
      <FaqBlock title="Часто задаваемые вопросы"><FaqItem question="Как проходит обучение?" open>Онлайн-занятия, практика и поддержка наставника.</FaqItem><FaqItem question="Останутся ли материалы?">Да, доступ сохраняется после окончания.</FaqItem></FaqBlock>
    </template>
    <template v-else-if="entry.id === 'modal'">
      <Button @click="overlayOpen=true">Открыть Modal</Button><Modal v-model="overlayOpen" title="Информация"><p>Содержимое модального окна с поясняющим текстом и доступными действиями.</p><template #footer><Button variant="secondary" @click="overlayOpen=false">Отмена</Button><Button @click="overlayOpen=false">Готово</Button></template></Modal>
    </template>
    <template v-else-if="entry.id === 'catalog-menu'">
      <div class="demo-wide"><CatalogMenu v-model="overlayOpen" /></div>
    </template>
    <template v-else-if="entry.id === 'filter-modal'">
      <Button @click="overlayOpen=true">Открыть фильтры</Button><FilterModal v-model="overlayOpen" />
    </template>
    <template v-else-if="entry.id === 'mobile-menu'">
      <Button @click="overlayOpen=true">Открыть меню</Button><MobileMenu v-model="overlayOpen" />
    </template>
    <template v-else-if="entry.id === 'price-sheet'">
      <Button @click="overlayOpen=true">Показать стоимость</Button><PriceSheet v-model="overlayOpen" />
    </template>
    <template v-else-if="entry.id === 'promo-code-modal'">
      <Button @click="overlayOpen=true">Открыть промокод</Button><PromoCodeModal v-model="overlayOpen" />
    </template>
    <template v-else-if="entry.id === 'sort-sheet'">
      <Button @click="overlayOpen=true">Открыть сортировку</Button><SortSheet v-model:open="overlayOpen" />
    </template>
    <template v-else-if="entry.id === 'header-dropdown'">
      <HeaderDropdown v-model="overlayOpen" v-bind="entry.props" />
    </template>
    <template v-else-if="entry.id === 'tooltip'">
      <Tooltip text="Подсказка к элементу"><Button variant="secondary">Наведите курсор</Button></Tooltip>
    </template>
    <template v-else-if="entry.id === 'site-header'">
      <div class="demo-wide"><SiteHeader v-bind="siteHeaderProps" /></div>
    </template>
    <template v-else-if="entry.id === 'site-footer'">
      <div class="demo-wide"><SiteFooter /></div>
    </template>
    <template v-else-if="entry.id === 'page-hero'">
      <div class="demo-wide"><PageHero title="Эксперты по оценке обучения" description="В Хабре мы серьёзно относимся к качеству контента. Курсы, которые вы видите на наших страницах, проверяют профессионалы из отрасли — они оценивают актуальность материала и честно говорят, если курс не стоит рекомендовать. Всё для того, чтобы вы получали только тот образовательный контент, которому можно доверять."><template #actions><Button>Посмотреть экспертов</Button><Button variant="secondary">Перейти к редакции</Button></template></PageHero></div>
    </template>
    <component :is="dynamicComponent" v-else v-bind="entry.props">{{ entry.label }}</component>
  </div>
</template>

<style scoped>
.catalog-demo { width: 100%; }
.button-group-hero{display:grid;gap:var(--crs-space-12);border-radius:var(--crs-radius-16);background:var(--crs-blue-500);padding:var(--crs-space-16)}
.button-guide{display:grid;gap:var(--crs-space-24)}.button-grid{display:grid;grid-template-columns:7rem repeat(6,max-content);align-items:center;gap:var(--crs-space-12);overflow-x:auto;padding-bottom:var(--crs-space-8)}.button-grid>strong{font:400 var(--crs-font-12)/var(--crs-leading-16) Inter,sans-serif;color:var(--crs-black-500)}.button-grid--variants>strong:nth-child(-n+7){font-weight:600;color:var(--crs-black-850)}
.button-context-variant{display:flex;align-items:center;gap:var(--crs-space-12)}.button-context-variant small{color:var(--crs-black-500);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}
.demo-card,.demo-surface { border:1px solid var(--crs-black-100);border-radius:1rem;background:#fff;padding:1.5rem; }
.demo-wide{margin:-1.5rem}.demo-row{display:flex;flex-wrap:wrap;align-items:center;gap:1rem}.demo-matrix{display:grid;gap:1rem}.demo-matrix>div{display:flex;align-items:center;gap:.75rem}.demo-matrix small{width:2rem;color:var(--crs-black-500);font-size:.6875rem}.icon-button-variants{display:grid;gap:.75rem}.icon-button-variants>div{display:flex;align-items:center;gap:.75rem}.icon-button-variants small{width:4rem;color:var(--crs-black-500);font-size:.6875rem}
.tile-filter-guide{display:flex;max-width:36rem;flex-wrap:wrap;align-items:start;gap:var(--crs-space-16)}.tile-filter-guide .crs-tile--level{flex:1 1 18rem}.tile-filter-catalog-demo{width:var(--crs-size-136)}
.rating-badge-guide{display:grid;max-width:42rem;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--crs-space-12)}.rating-badge-guide figure{display:flex;min-width:0;align-items:center;gap:var(--crs-space-16);margin:0;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-12);padding:var(--crs-space-12)}.rating-badge-guide figcaption{display:grid;min-width:0;gap:var(--crs-space-2);font:400 var(--crs-font-12)/var(--crs-leading-16) var(--crs-font-family)}.rating-badge-guide figcaption strong{font-weight:600}.rating-badge-guide figcaption span{color:var(--crs-black-500)}
.feedback-guide{display:grid;gap:var(--crs-space-12)}.feedback-guide h2{margin:0;font:600 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.toast-guide{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--crs-space-12)}.informer-guide{display:grid;grid-template-columns:repeat(2,minmax(0,var(--crs-size-280)));align-items:start;gap:var(--crs-space-16)}
.field-guide{display:grid;max-width:45rem;gap:1.5rem}.field-guide section,.variant-guide{display:grid;gap:.625rem}.field-guide h2,.variant-guide h2{margin:0;font-size:.875rem;font-weight:600}.field-sizes{display:grid;grid-template-columns:1fr 1fr;align-items:start;gap:.75rem}.field-sizes label{display:grid;gap:.375rem}.field-sizes small{color:var(--crs-black-500);font-size:.6875rem}.control-guide,.avatar-guide{display:grid;gap:.75rem}.control-guide h2,.avatar-guide h2{margin:0;font-size:.875rem;font-weight:600}.filter-chip-guide{gap:var(--crs-space-24)}.filter-chip-guide section{display:grid;gap:var(--crs-space-12)}.control-variants{display:grid;max-width:42rem;grid-template-columns:repeat(2,minmax(12rem,1fr));align-items:start;gap:1rem}.chip-matrix{display:flex;flex-wrap:wrap;align-items:center;gap:1rem}.avatar-scale{display:flex;flex-wrap:wrap;align-items:flex-end;gap:1.25rem;padding:.25rem}.avatar-scale figure{display:grid;justify-items:center;gap:.5rem;margin:0;color:#697386;font-size:.6875rem;line-height:1rem}@media(max-width:767px){.field-sizes,.control-variants,.rating-badge-guide{grid-template-columns:1fr}}
</style>
<style scoped>
@media(max-width:767px){.informer-guide{grid-template-columns:1fr}}
</style>
