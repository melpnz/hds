# OptionList

Публичный компонент Courses Nuxt Kit, который объединяет `OptionItem` в
доступный список. Используется в `Select`, `MultiSelect`, `FilterChip` и
`SortSheet`, поэтому новые выпадающие списки не нужно собирать заново.

## Режимы

- `single` — одно выбранное значение;
- `multiple` — массив значений с Checkbox;
- `action` — меню действий без выбранного значения.

Компонент поддерживает Arrow Up/Down, Home, End и Escape, пропускает отключённые
строки и предоставляет методы `focusFirst` и `focusLast`. Встроенный вариант
`embedded` убирает собственную рамку и тень.

Визуальный источник: `courses-nuxt-kit/layers/courses/app/components/OptionList.vue`.
