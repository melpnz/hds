<template>
  <main class="diagnostics">
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
  </main>
</template>

<style scoped>
.diagnostics{display:grid;gap:var(--crs-space-24);padding:var(--crs-space-24)}
.diagnostics__link{font:600 var(--crs-font-18)/var(--crs-leading-24) var(--crs-font-family);color:var(--crs-black-850)}
.diagnostics__button{font-size:var(--crs-font-18);padding-inline:var(--crs-space-24)}
.diagnostics__icon{width:var(--crs-size-48);height:var(--crs-size-48)}
</style>
