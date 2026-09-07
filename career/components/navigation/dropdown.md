# Dropdown · BaseDropdown

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | — |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | частичная |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Обвязка выпадающего блока: триггер плюс содержимое с выравниванием влево или вправо. Базис для ContextMenu и CustomSelect; собственных story не имеет.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

Подтверждены CSS и разметкой: `:not`.

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.base-dropdown { position:relative }
.base-dropdown__toggle { min-height:32px }
.base-dropdown__toggle>* { cursor:pointer }
.base-dropdown__content { background:var(--color-ui-white);border-radius:16px;box-shadow:0 1px 4px 1px var(--color-ui-gray-shadow,rgba(24,46,57,.1)),0 4px 8px 2px var(--color-ui-gray-shadow,rgba(24,46,57,.1));position:absolute;transform:translateZ(0);visibility:hidden;z-index:1000 }
.base-dropdown__content--open { visibility:visible }
.base-dropdown__content--alignment-right { right:0 }
.base-dropdown__content--alignment-top-left { bottom:28px;right:12px }
.base-dropdown__content--alignment-left { left:-8px }
.base-dropdown__content--fullWidth { width:100% }
.base-dropdown__content--select { background:inherit;border-radius:inherit;box-shadow:inherit;position:relative }
.base-dropdown__content--select:not(.base-dropdown__content--open) { display:none }
```

## Ограничения

- Собственных story нет — данные из CSS и из разметки компонентов, которые его используют.

## Источники

- Storybook `career-web`: 
- CSS: секция `base-dropdown` в `ui/components/navigation.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Dropdown — только adapter геометрии, позиционирования и состояний `closed`/`open`. Он не назначает `role`: потребитель выбирает `menu`, `listbox` или немодальный dialog pattern.

Триггер всегда хранит `aria-expanded` и `aria-controls`. Закрытый контент имеет `hidden` (предпочтительно) либо `aria-hidden="true"`; открытый — `.base-dropdown__content--open` и не должен оставаться `aria-hidden`. Escape закрывает попап и возвращает фокус триггеру; клик снаружи закрывает без переноса фокуса.
