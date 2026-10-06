# Informer

> Текущая реализация: [API UI Kit 1.4.1](../../../machine/providers/courses-nuxt-kit/informer.json).
> DOM/CSS, снимки и дроби вхождений ниже — историческое evidence, не исходники кита.
> Для сборки страниц применяйте [принятые правила](../../../docs/guide/production-pages.md).

Публичный компонент Courses Nuxt Kit для постоянного контекстного сообщения.
В отличие от `Toast`, информер занимает место в потоке страницы и может
содержать заголовок, описание и набор ссылок.

## Публичный API

- `tone`: `info`, `success`, `warning` или `error`;
- `title`, `description`, `links`;
- `closable` и `v-model` видимости;
- слоты `title`, default и `links`;
- событие `close`.

Для `warning` и `error` используется `role="alert"`, для остальных тонов —
`role="status"`. Кнопка закрытия должна иметь доступное имя.

Визуальный источник: `courses-nuxt-kit/layers/courses/app/components/Informer.vue`.
