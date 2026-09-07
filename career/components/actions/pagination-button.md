# PaginationButton · BasePaginationButton

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `pagination-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Отдельная кнопка страницы. Строительный блок компонента Pagination, но применяется и самостоятельно — например, «показать ещё».

## Анатомия

```
button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" target="_self"]
  span.base-button__content
    span.pagination-button__content
      · «00»
```

_Разметка story `common-buttons-basepaginationbutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Legacy/story alias |
|---|---|---|
| `default` | без state-атрибутов | без modifier |
| `hover` | `:hover` | `.is-status-hover` |
| `focus-visible` | `:focus-visible` | `.is-status-focus` |
| `pressed` | `:active` | `.is-pressed` только для визуальных тестов |
| `current` | `aria-current="page"` | `.is-selected` |
| `disabled` | нативный `disabled`; у ссылки — удалить `href` и добавить `aria-disabled="true"` | `.is-status-disable` |

Публичное состояние называется `current`, а не selected: кнопка обозначает
текущую страницу, а не элемент множественного выбора.

Подтверждены CSS и разметкой: `.is-selected`, `.is-status-disable`, `.is-status-focus`, `.is-status-hover`, `:disabled`, `:focus`, `:hover`.

```css
.pagination-button:hover:before { content:var(--tw-content);opacity:.1 }
.pagination-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.pagination-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.pagination-button:disabled { background-color:transparent;color:var(--color-ui-gray-4) }
```

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `status` | PaginationButtonStatus | `'inactive'` | inactive · hover · focus · selected · disable · loading | `radio` |
| `label` | string | `'00'` | — | `text` |
| `to` | RouteLocationRaw | — | — | `object` |
| `href` | string | — | — | `text` |
| `type` | ButtonType | `'button'` | — | `object` |
| `target` | "_blank" \| "_self" | `'_self'` | — | `object` |
| `disabled` | boolean \| null | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-primary-accent` | `#5014f5` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<button class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
  <span class="base-button__content">
    <span class="pagination-button__content">00</span>
  </span>
</button>
```

## CSS

```css
.pagination-button { background-color:transparent;border-radius:9999px;border-style:none;color:var(--color-ui-gray-1);font-size:16px;font-weight:600;height:2.5rem;isolation:isolate;line-height:24px;min-width:2.5rem;padding:.5rem;position:relative }
.pagination-button:before { background-color:var(--color-ui-gray-3);border-radius:9999px;top:0;right:0;bottom:0;left:0;opacity:0;pointer-events:none;position:absolute;transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);z-index:10;--tw-content:"";content:var(--tw-content) }
.pagination-button:hover:before { content:var(--tw-content);opacity:.1 }
.pagination-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.pagination-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.pagination-button:disabled { background-color:transparent;color:var(--color-ui-gray-4) }
.pagination-button__content { align-items:center;color:var(--color-ui-gray-2);display:inline-flex;height:1.5rem;justify-content:center;min-width:1.5rem }
.pagination-button .base-button__content { padding-left:0;padding-right:0 }
.pagination-button.is-status-focus:before,.pagination-button.is-status-hover:before { opacity:.1 }
.pagination-button.is-status-focus { --tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.pagination-button.is-selected,.pagination-button.is-selected .pagination-button__content { color:var(--color-ui-primary-accent) }
.pagination-button.is-selected:before { background-color:var(--color-ui-primary);opacity:.2 }
.pagination-button.is-status-disable,.pagination-button.is-status-disable .pagination-button__content { color:var(--color-ui-gray-4) }
.pagination-button.is-status-disable:before { opacity:0 }
.pagination-button .base-button__loader { color:var(--color-ui-primary) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-pagination-button/base-pagination-button.stories.ts`
- Storybook `career-web`: `common-buttons-basepaginationbutton--default`
- CSS: секция `base-pagination-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
