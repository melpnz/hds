# Toast

Публичный компонент Courses Nuxt Kit для компактного уведомления о результате
действия. `Toast` не заменяет расположенный в потоке страницы `Informer`.

## Публичный API

- `tone`: `info`, `success`, `warning` или `error`;
- `text` или default-слот;
- `closable` и `v-model` видимости;
- событие `close`.

Для `warning` и `error` используется `role="alert"`, для остальных тонов —
`role="status"`. Способ размещения и время жизни определяет приложение.

Визуальный источник: `courses-nuxt-kit/layers/courses/app/components/Toast.vue`.
