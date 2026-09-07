# AvatarButton · BaseAvatarButton

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `avatar-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Кнопка-аватар: круглая область с изображением пользователя или компании, реагирующая на наведение и фокус. Открывает меню профиля в шапке и карточку пользователя в списках.

## Анатомия

```
button.avatar-button.base-button.inline-flex.appearance-avatar.size-l.avatar-button  [type="button" target="_self"]
  span.base-button__content.base-button__content--appearance-avatar
    img.size-full.object-cover
```

_Разметка story `common-buttons-baseavatarbutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Legacy/story alias |
|---|---|---|
| `default` | без state-атрибутов | `status="inactive"` |
| `hover` | `:hover` | `.is-status-hover` |
| `focus-visible` | `:focus-visible` | `.is-status-focus` |
| `pressed` | `:active` | `.is-pressed` только для визуальных тестов |
| `selected` | `aria-pressed="true"` для toggle-кнопки | `.is-selected` |
| `disabled` | нативный `disabled` | `.is-disabled`, `.is-status-disable` |
| `loading` | `.is-loading` + `aria-busy="true"` | `status="loading"` |

Значения Storybook `inactive`, `focus` и `disable` не переносятся в новый API:
это legacy vocabulary. Если кнопка только открывает меню, вместо `selected`
следует применять `aria-expanded`, а не `aria-pressed`.

Подтверждены CSS и разметкой: `.is-disabled`, `.is-status-disable`, `.is-status-focus`, `.is-status-hover`, `:focus`, `:hover`.

```css
.avatar-button:hover:after { content:var(--tw-content);opacity:.1 }
.avatar-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.avatar-button:focus-visible:after { content:var(--tw-content);opacity:.1 }
```

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `status` | AvatarButtonStatus | `'inactive'` | inactive · hover · focus · selected · disable · loading | `radio` |
| `to` | RouteLocationRaw | — | — | `object` |
| `href` | string | — | — | `text` |
| `type` | ButtonType | `'button'` | — | `object` |
| `target` | "_blank" \| "_self" | `'_self'` | — | `object` |
| `disabled` | boolean \| null | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Наведение и фокус показываются не сменой фона, а двумя псевдоэлементами: `::before` — серая подложка `opacity: .1`, `::after` — кольцо 2px цвета `--color-ui-primary`, `opacity: .6` при `:focus-visible`.
- Изображение обрезается по кругу самой кнопкой (`overflow: hidden`), а не радиусом на `img`.

## Разметка

```html
<button class="avatar-button base-button inline-flex appearance-avatar size-l avatar-button" type="button" target="_self">
  <span class="base-button__content base-button__content--appearance-avatar">
    <img src="../../ui/assets/illustrations/avatar-default-user.svg" alt="Аватар пользователя" class="size-full object-cover">
  </span>
</button>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.avatar-button { display:flex }
.avatar-button:before { z-index:0 }
.avatar-button:after,.avatar-button:before { border-radius:9999px;top:0;right:0;bottom:0;left:0;pointer-events:none;position:absolute;--tw-content:"";content:var(--tw-content) }
.avatar-button:after { background-color:var(--color-ui-gray-3);opacity:0;transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);z-index:10 }
.avatar-button:hover:after { content:var(--tw-content);opacity:.1 }
.avatar-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.avatar-button:focus-visible:after { content:var(--tw-content);opacity:.1 }
.avatar-button.is-status-focus:after,.avatar-button.is-status-hover:after { opacity:.1 }
.avatar-button.is-status-focus { --tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.avatar-button.is-disabled,.avatar-button.is-status-disable { opacity:.4 }
.avatar-button .base-button__loader { color:var(--color-ui-primary) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-avatar-button/base-avatar-button.stories.ts`
- Storybook `career-web`: `common-buttons-baseavatarbutton--default`, `common-buttons-baseavatarbutton--default-image`
- CSS: секция `base-avatar-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
