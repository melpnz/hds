# OptionItem

> Текущая реализация: [API UI Kit 1.4.3](../../../machine/providers/courses-nuxt-kit/option-item.json).
> DOM/CSS, снимки и дроби вхождений ниже — историческое evidence, не исходники кита.
> Для сборки страниц применяйте [принятые правила](../../../docs/guide/production-pages.md).

Публичный примитив Courses Nuxt Kit для одной строки внутри `OptionList`.
Самостоятельно применять его следует только при создании нового списка выбора;
готовые `Select`, `MultiSelect`, `FilterChip` и `SortSheet` уже используют этот
паттерн.

## Состав

Строка поддерживает основной текст, верхнее и нижнее описания, иконку, `Avatar`,
`EntityLogo`, счётчик, метаданные и trailing-контент. Режим выбора бывает
`single`, `multiple` или `action`.

Состояния: `default`, `hover`, `focus-visible`, `selected`, `disabled`.
Отключённая строка не генерирует событие `select`.

Визуальный источник: `courses-nuxt-kit/layers/courses/app/components/OptionItem.vue`.
