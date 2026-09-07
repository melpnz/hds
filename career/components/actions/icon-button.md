# IconButton · BaseIconButton

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `icon-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Круглая кнопка только с иконкой. Применяется там, где действие очевидно из иконки и нет места под подпись: закрыть, меню, лайк, вложение. Строится поверх BaseButton — `appearance-none` плюс собственный класс `icon-button`.

## Анатомия

```
button.icon-button.base-button.inline-flex.appearance-none.size-l.icon-button  [type="button" target="_self"]
  span.base-button__content
    svg.svg-icon
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#bell"]
```

_Разметка story `common-buttons-baseiconbutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Legacy/story alias |
|---|---|---|
| `default` | `aria-pressed="false"` для toggle-кнопки | без modifier |
| `hover` | `:hover` | `.is-status-hover` |
| `focus-visible` | `:focus-visible` | `.is-status-focus` |
| `pressed` | `:active` | `.is-pressed` только для визуальных тестов |
| `selected` | `aria-pressed="true"` | `.is-selected` |
| `disabled` | нативный `disabled` | `.is-status-disable` |
| `loading` | `.is-loading` + `aria-busy="true"` | loader из Button |

У кнопки без видимого текста обязателен доступный name через `aria-label`.
Если действие не toggle, `aria-pressed` и selected не задаются.

Подтверждены CSS и разметкой: `.is-selected`, `.is-status-disable`, `.is-status-focus`, `.is-status-hover`, `:disabled`, `:focus`, `:hover`.

```css
.icon-button:hover:before { content:var(--tw-content);opacity:.1 }
.icon-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.icon-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.icon-button:disabled { color:var(--color-ui-gray-4) }
```

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `status` | IconButtonStatus | `'inactive'` | inactive · hover · focus · selected · disable · loading | `radio` |
| `to` | RouteLocationRaw | — | — | `object` |
| `href` | string | — | — | `text` |
| `type` | ButtonType | `'button'` | — | `object` |
| `target` | "_blank" \| "_self" | `'_self'` | — | `object` |
| `disabled` | boolean \| null | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#bell` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Прямоугольник события больше видимой кнопки: псевдоэлемент `::before` расширяет зону нажатия на 8px во все стороны.
- Prop `status` задаёт состояние вручную (`inactive | hover | focus | selected | disable | loading`) — так Storybook показывает состояния статически. В продукте состояния приходят из CSS-псевдоклассов.

## Разметка

```html
<button class="icon-button base-button inline-flex appearance-none size-l icon-button" type="button" target="_self">
  <span class="base-button__content">
    <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#bell"/>
    </svg>
  </span>
</button>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.icon-button { background-color:transparent;border-radius:9999px;border-style:none;color:var(--color-ui-gray-2);flex-shrink:0;height:2.5rem;isolation:isolate;overflow:hidden;padding:.5rem;position:relative;width:2.5rem }
.icon-button:before { background-color:var(--color-ui-gray-3);border-radius:9999px;top:0;right:0;bottom:0;left:0;opacity:0;pointer-events:none;position:absolute;transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);z-index:10;--tw-content:"";content:var(--tw-content) }
.icon-button:hover:before { content:var(--tw-content);opacity:.1 }
.icon-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.icon-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.icon-button:disabled { color:var(--color-ui-gray-4) }
.icon-button.is-status-focus:before,.icon-button.is-status-hover:before { opacity:.1 }
.icon-button.is-status-focus { --tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.icon-button.is-selected { color:var(--color-ui-primary) }
.icon-button.is-selected:before { background-color:var(--color-ui-primary);opacity:.2 }
.icon-button.is-status-disable { color:var(--color-ui-gray-4) }
.icon-button.is-status-disable:before { opacity:0 }
.icon-button .base-button__loader { color:var(--color-ui-primary) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-icon-button/base-icon-button.stories.ts`
- Storybook `career-web`: `common-buttons-baseiconbutton--default`
- CSS: секция `base-icon-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
