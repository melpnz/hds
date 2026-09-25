# Informer

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
