# GhostButton · Кнопка без фона

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `ghost-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Кнопка без фона и рамки для второстепенных действий рядом с основной кнопкой или внутри карточки. Собрана поверх BaseButton с `appearance-none`.

## Анатомия

```
button.ghost-button.base-button.inline-flex.appearance-none.size-m.is-sizeable.ghost-button  [type="button" target="_self"]
  span.base-button__inner
    span.base-button__content
      · «Button»
```

_Разметка story `common-buttons-ghostbutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Нормативные состояния: `default`, `hover`, `focus-visible`, `pressed`,
`disabled`, `loading`. Первые четыре задаются псевдоклассами; `.is-pressed`
разрешён только для story и визуальных тестов. Loading оформляется через
`.is-loading` + `aria-busy="true"` и использует `.base-button__loader`.
`ui/state-contract.css` добавляет недостающий pressed overlay.

Подтверждены CSS и разметкой: `.has-before`, `.is-sizeable`, `:disabled`, `:focus`, `:hover`.

```css
.ghost-button:hover { color:var(--color-ui-gray-1) }
.ghost-button:hover:before { content:var(--tw-content);opacity:.1 }
.ghost-button:focus-visible { outline-color:var(--color-ui-gray-2-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.ghost-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.ghost-button:disabled { color:var(--color-ui-gray-4) }
```

## Слоты

- `before`
- `default`
- `after`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `label` | string | `'Button'` | — | `text` |
| `disabled` | boolean \| null | — | true · false | `radio` |
| `loading` | boolean | `false` | true · false | `radio` |
| `to` | RouteLocationRaw | — | — | `object` |
| `href` | string | — | — | `text` |
| `type` | ButtonType | `'button'` | — | `object` |
| `target` | "_blank" \| "_self" | `'_self'` | — | `object` |
| `fullWidth` | boolean | `false` | — | `boolean` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-2-60` | `color-mix(in srgb,var(--color-ui-gray-2) 60%,transparent)` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#question-circle` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<button class="ghost-button base-button inline-flex appearance-none size-m is-sizeable ghost-button" type="button" target="_self">
  <span class="base-button__inner">
    <span class="base-button__content">Button</span>
  </span>
</button>
```

## CSS

```css
.ghost-button { background-color:transparent;border-style:none;color:var(--color-ui-gray-2);isolation:isolate;overflow:hidden;padding:0 }
.ghost-button:before { background-color:var(--color-ui-gray-3);border-radius:.5rem;top:0;right:0;bottom:0;left:0;opacity:0;pointer-events:none;position:absolute;transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);z-index:10;--tw-content:"";content:var(--tw-content) }
.ghost-button:hover { color:var(--color-ui-gray-1) }
.ghost-button:hover:before { content:var(--tw-content);opacity:.1 }
.ghost-button:focus { color:var(--color-ui-gray-1) }
.ghost-button:focus:before { content:var(--tw-content);opacity:.1 }
.ghost-button:focus-visible { outline-color:var(--color-ui-gray-2-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.ghost-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.ghost-button:disabled { color:var(--color-ui-gray-4) }
.ghost-button .base-button__content { padding-left:0;padding-right:0 }
.ghost-button .base-button__loader { color:var(--color-ui-gray-2) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/ghost-button/ghost-button.stories.ts`
- Storybook `career-web`: `common-buttons-ghostbutton--default`, `common-buttons-ghostbutton--with-icon`
- CSS: секция `ghost-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
