# Row · BaseRow

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | — |
| **CSS** | `ui/components/cards.css` |
| **Живая реализация** | частичная |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Строка списка внутри карточки: разделитель сверху, отступы, состояние наведения. Своих story не имеет.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

Подтверждены CSS и разметкой: `:focus`, `:hover`.

```css
.base-row:hover { background-color:var(--color-ui-gray-3-10) }
.base-row:focus-visible { background-color:var(--color-ui-gray-3-10);outline-style:solid }
.base-row.hover,.base-row:has(:hover) { background-color:var(--color-ui-gray-3-10) }
```

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-primary-20` | `color-mix(in srgb,var(--color-ui-primary) 20%,transparent)` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.base-row { border-radius:.75rem;color:var(--color-ui-gray-1);cursor:pointer;outline-color:var(--color-ui-gray-2);outline-offset:-2px;outline-width:2px;padding:.5rem 1rem }
.base-row:hover { background-color:var(--color-ui-gray-3-10) }
.base-row:focus-visible { background-color:var(--color-ui-gray-3-10);outline-style:solid }
.base-row.hover,.base-row:has(:hover) { background-color:var(--color-ui-gray-3-10) }
.base-row.disabled { cursor:not-allowed;opacity:.4 }
.base-row.selected { background-color:var(--color-ui-primary-20) }
.base-row.selected svg { fill:var(--color-icon-gray);color:var(--color-icon-gray) }
```

## Ограничения

- Собственных story нет — данные из CSS.

## Источники

- Storybook `career-web`: 
- CSS: секция `base-row` в `ui/components/cards.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Корневой класс — `base-row`. Строка-действие рендерится как `button` или `a`; строка выбора в listbox — как элемент с `role="option"`. Не оборачивайте вложенные ссылки и кнопки в ещё одну кнопку.

| Состояние | Контракт |
|---|---|
| `default` | нейтральная строка |
| `hover` | `:hover` |
| `focus-visible` | `:focus-visible` на корневом действии |
| `pressed` | `:active`; `.is-pressed` только для стенда |
| `selected` | `aria-selected="true"`; `.selected` — legacy alias |
| `disabled` | `disabled` или `aria-disabled="true"`; без событий |

Список отвечает за стрелочную навигацию и управление фокусом, Row — за визуальное состояние.
