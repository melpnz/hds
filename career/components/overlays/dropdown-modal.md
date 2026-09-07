# DropdownModal · Меню как модальное окно

| | |
|---|---|
| **Категория** | Оверлеи |
| **Корневой класс** | — |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Выпадающий блок, который на узком экране показывается как модальное окно снизу. Механизм, на котором построено «изоморфное» контекстное меню.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-shadow-overlay-60` | `hsla(207,9%,81%,.6)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.dropdown-modal-popper.v-popper--theme-dropdown .v-popper__inner { background-color:var(--color-ui-white);border-radius:1rem;border-style:none;color:inherit;overflow-y:hidden }
.dropdown-modal-popper.v-popper--theme-dropdown .v-popper__inner [role=listbox] { box-shadow:0 1px 2px 0 var(--color-shadow-overlay-60),0 2px 6px 2px var(--color-shadow-overlay-60) }
.v-popper__popper[aria-hidden=false] [role=listbox] { min-width:190px }
.dropdown-modal-popper.v-popper--theme-dropdown .v-popper__arrow-container { display:none }
```

## Ограничения

- Собственных story нет — данные из CSS и из разметки ContextMenu.

## Источники

- Storybook `career-web`: 
- CSS: секция `dropdown-modal` в `ui/components/overlays.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

DropdownModal — responsive adapter: на широком экране это немодальный popover, на узком — dialog/bottom sheet. Состояния `closed` и `open` синхронизируются между `aria-expanded` триггера и `aria-hidden` попапа.

В dialog-режиме обязательны `role="dialog"`, `aria-modal="true"`, доступное имя, focus trap, Escape и возврат фокуса. В popover-режиме ловушки фокуса нет. Смена брейкпоинта при открытом состоянии не должна терять активный элемент.
