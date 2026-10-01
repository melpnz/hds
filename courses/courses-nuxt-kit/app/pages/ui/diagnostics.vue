<script setup lang="ts">
const filtersCount = ref(2)
const filtersOpened = ref(0)
const sortOpened = ref(0)
const sortOpen = ref(false)
const sortValue = ref('popular')
const actionItems = [{ label: 'Один', onSelect: () => {} }]
</script>
<template>
  <main class="diagnostics">
    <SiteHeader family="simple" />
    <section class="diagnostics__filter-controls">
      <SiteHeader family="courses" level="page" sticky :filters-count="filtersCount" @open-filters="filtersOpened++" @open-sort="sortOpened++; sortOpen = true" />
      <output data-testid="filters-opened">{{ filtersOpened }}</output>
      <output data-testid="sort-opened">{{ sortOpened }}</output>
      <output data-testid="sort-value">{{ sortValue }}</output>
      <Button @click="filtersCount = filtersCount === 0 ? 2 : 0">Переключить счётчик</Button>
      <SortSheet v-model:open="sortOpen" v-model:value="sortValue" />
    </section>
    <section class="diagnostics__chip-controls">
      <FilterChip dropdown icon="i-tabler-arrows-sort" aria-label="Действия сортировки" :dropdown-items="actionItems" />
      <FilterChip dropdown disabled icon="i-tabler-arrows-sort" aria-label="Недоступная сортировка" />
      <FilterChip :count="2">Фильтры</FilterChip>
      <FilterChip dropdown :count="2" aria-label="Счётчик действий" :dropdown-items="actionItems" />
      <FilterChip :count="0">Без фильтров</FilterChip>
      <FilterChip :count="3" count-label="найдено">Курсы</FilterChip>
      <OptionList class="diagnostics__options-default" :items="actionItems" selection-mode="action" />
      <OptionList class="diagnostics__options-fit" :items="actionItems" selection-mode="action" fit />
    </section>
    <HeaderDropdown />
    <Link class="diagnostics__link" href="/ui?component=button">Внутренняя ссылка</Link>
    <Button class="diagnostics__button" href="/ui?component=link">Внутренняя кнопка</Button>
    <IconButton class="diagnostics__icon" label="Проверка размера" />
    <FaqItem question="Можно нажать на всю плашку?">
      <p>Ответ не должен сворачивать вопрос при клике.</p>
      <Link href="#answer">Ссылка в ответе</Link>
    </FaqItem>
    <EmptyState />
    <Checkbox loading label="Загрузка выбора" />
    <ButtonGroup loading label="Загрузка группы" :items="[{ label: 'Курсы', value: 'courses' }, { label: 'Школы', value: 'schools' }]" />
    <SearchInput error label="Поиск с ошибкой" />
    <div class="diagnostics__services-container">
      <ServiceLogo service="courses" variant="brand" :size="32" />
      <HeaderDropdown embedded align="container" current="payment" :services="[{ service: 'courses', label: 'Курсы', href: '/ui' }, { service: 'payment', label: 'Оплата', href: '/ui?component=header-dropdown' }]" />
    </div>
  </main>
</template>

<style scoped>
.diagnostics{display:grid;gap:var(--crs-space-24);padding:var(--crs-space-24)}
.diagnostics__filter-controls,.diagnostics__chip-controls{min-width:0}
.diagnostics__link{font:600 var(--crs-font-18)/var(--crs-leading-24) var(--crs-font-family);color:var(--crs-black-850)}
.diagnostics__button{font-size:var(--crs-font-18);padding-inline:var(--crs-space-24)}
.diagnostics__icon{width:var(--crs-size-48);height:var(--crs-size-48)}
.diagnostics__services-container{position:relative;display:flex;align-items:center;gap:var(--crs-space-8)}
</style>
