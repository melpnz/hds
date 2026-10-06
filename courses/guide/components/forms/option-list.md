# OptionList

> Текущая реализация: [API UI Kit 1.4.1](../../../machine/providers/courses-nuxt-kit/option-list.json).
> DOM/CSS, снимки и дроби вхождений ниже — историческое evidence, не исходники кита.
> Для сборки страниц применяйте [принятые правила](../../../docs/guide/production-pages.md).

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

`fit` включает ширину по содержимому с ограничением по viewport. Без него
сохраняется стандартная ширина. `fluid` и `embedded` имеют приоритет над `fit`.

Визуальный источник: `courses-nuxt-kit/layers/courses/app/components/OptionList.vue`.
