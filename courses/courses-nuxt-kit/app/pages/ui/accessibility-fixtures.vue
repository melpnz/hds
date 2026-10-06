<script setup lang="ts">
const price = ref(false)
const sort = ref(false)
const mobile = ref(false)
const sortValue = ref('one')
const selected = ref(['js', 'vue'])
const multiError = ref('Проверьте выбор')
const options = [{ label: 'JavaScript', value: 'js' }, { label: 'Vue', value: 'vue' }]
const tab = ref('one')
const tabs = [{ label: 'Первый', value: 'one', id: 'tab-one', panelId: 'panel-one' }, { label: 'Недоступный', value: 'disabled', disabled: true }, { label: 'Второй', value: 'two', id: 'tab-two', panelId: 'panel-two' }]
</script>
<template>
  <main>
    <Button @click="price = true">Открыть цену</Button>
    <Button @click="sort = true">Открыть сортировку</Button>
    <Button @click="mobile = true">Открыть меню</Button>
    <PriceSheet v-model="price" />
    <SortSheet v-model:open="sort" v-model:value="sortValue" :options="[{ label: 'Один', value: 'one' }, { label: 'Два', value: 'two' }]" />
    <output data-testid="sort-value">{{ sortValue }}</output>
    <MobileMenu v-model="mobile"><Button @click="price = true">Вложенная цена</Button></MobileMenu>
    <MultiSelect v-model="selected" label="Языки" :options="options" :error="multiError" />
    <MultiSelect label="Недоступные языки" :options="options" disabled />
    <Button @click="multiError = ''">Снять ошибку</Button>
    <Chip removable>Python</Chip>
    <Chip removable remove-label="Убрать курс">Курс</Chip>
    <ButtonGroup v-model="tab" tabs label="Пример табов" :items="tabs" />
    <section id="panel-one" role="tabpanel" aria-labelledby="tab-one" :hidden="tab !== 'one'">Первое содержимое</section>
    <section id="panel-two" role="tabpanel" aria-labelledby="tab-two" :hidden="tab !== 'two'">Второе содержимое</section>
    <ButtonGroup label="Обычная группа" :items="[{ label: 'Один', value: 'one' }, { label: 'Два', value: 'two' }]" />
    <span id="existing-tip">Существующее описание</span>
    <Tooltip text="Подсказка кнопки" :delay="0"><Button aria-describedby="existing-tip">Кнопка с подсказкой</Button></Tooltip>
    <Tooltip text="Подсказка текста" :delay="0"><span>Текст с подсказкой</span></Tooltip>
    <DemandChart :values="[0, 12, 5]" :labels="['Январь', 'Февраль']" />
  </main>
</template>
