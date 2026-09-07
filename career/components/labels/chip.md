# Chip · BaseChip

| | |
|---|---|
| **Категория** | Метки и статусы |
| **Корневой класс** | `base-chip` |
| **CSS** | `ui/components/chips.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Компактная метка: навык, тег, выбранное значение фильтра, статус. Может быть статичной, кликабельной и удаляемой; тег корня меняется props (`button`, `span`, `a`) под роль.

## Анатомия

```
div.flex.flex-wrap.gap-3
  button.base-chip.base-chip--default.base-chip--clickable.base-chip--interactive  [type="button"]
    span.base-chip__content
      span.px-1
        · «Default»
  button.base-chip.base-chip--approved.base-chip--clickable.base-chip--interactive  [type="button"]
    span.base-chip__content
      span.px-1
        · «Approved»
  button.base-chip.base-chip--ghost.base-chip--clickable.base-chip--interactive  [type="button"]
    span.base-chip__content
      span.px-1
        · «Ghost»
```

_Разметка story `common-chips-basechip--variants`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Варианты

Три варианта заливки: `--default`, `--approved` (подтверждённый навык), `--ghost` (только рамка). Интерактивность добавляется отдельными классами `--clickable` и `--interactive`, а не вариантом.

| Класс | Фон | Текст | Рамка |
|---|---|---|---|
| `base-chip--clickable` | transparent | — | — |
| `base-chip--disabled` | var(--color-ui-green-10) | var(--color-ui-gray-4) | — |
| `base-chip--default` | var(--color-ui-gray-4-20) | — | — |
| `base-chip--approved` | var(--color-ui-green-10) | — | — |
| `base-chip--ghost` | transparent | — | — |
| `base-chip--blue` | var(--color-ui-turquoise-10) | — | — |

## Состояния

Подтверждены CSS и разметкой: `.base-chip--disabled`, `:active`, `:focus`, `:hover`, `:not`.

```css
.base-chip--interactive.base-chip--default:focus-visible,.base-chip:not(.base-chip--disabled).base-chip--default:active,.base-chip:not(.base-chip--disabled).base-chip--default:hover { background-color:var(--color-ui-gray-4-30) }
.base-chip--interactive.base-chip--approved:focus-visible,.base-chip:not(.base-chip--disabled).base-chip--approved:active,.base-chip:not(.base-chip--disabled).base-chip--approved:hover { background-color:var(--color-ui-green-20) }
.base-chip--interactive.base-chip--ghost:focus-visible,.base-chip:not(.base-chip--disabled).base-chip--ghost:active,.base-chip:not(.base-chip--disabled).base-chip--ghost:hover { background-color:var(--color-ui-gray-4-20) }
.base-chip--interactive:focus-visible { outline:2px solid var(--color-ui-gray-2-60);outline-offset:2px }
.base-chip:not(.base-chip--clickable).base-chip--disabled:hover { color:var(--color-ui-gray-4);cursor:default }
.base-chip:not(.base-chip--clickable).base-chip--default:hover { background-color:var(--color-ui-gray-4-20) }
.base-chip:not(.base-chip--clickable).base-chip--approved:hover { background-color:var(--color-ui-green-10) }
.base-chip:not(.base-chip--clickable).base-chip--ghost:hover { background-color:transparent }
.base-chip:not(.base-chip--clickable).base-chip--blue:hover { background-color:var(--color-ui-turquoise-10) }
```

## Слоты

- `default`
- `append`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `tag` | ChipTag | `'span'` | button · span · a | `radio` |
| `variant` | ChipVariant | `'default'` | default · approved · ghost | `radio` |
| `clickable` | boolean | `true` | — | `boolean` |
| `disabled` | boolean | `false` | — | `boolean` |
| `target` | "_blank" \| "_self" | `'_self'` | _self · _blank | `radio` |
| `text` | string | — | — | `text` |
| `href` | string | — | — | `text` |
| `click` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2-60` | `color-mix(in srgb,var(--color-ui-gray-2) 60%,transparent)` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-4-20` | `color-mix(in srgb,var(--color-ui-gray-4) 20%,transparent)` | из `:root` Career |
| `--color-ui-gray-4-30` | `color-mix(in srgb,var(--color-ui-gray-4) 30%,transparent)` | из `:root` Career |
| `--color-ui-gray-7` | `#f8fbfc` | из `:root` Career |
| `--color-ui-green-10` | `color-mix(in srgb,var(--color-ui-green) 10%,transparent)` | из `:root` Career |
| `--color-ui-green-20` | `color-mix(in srgb,var(--color-ui-green) 20%,transparent)` | из `:root` Career |
| `--color-ui-turquoise-10` | `color-mix(in srgb,var(--color-ui-turquoise) 10%,transparent)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-label="Удалить"`, `tabindex="-1"`.

## Поведение

- Статичный чип получает `tabindex="-1"`, кликабельный — реальный `button` с `type="button"`.
- Кнопка удаления — вложенный `button` с `aria-label="Удалить"`, а не иконка на самом чипе.

## Разметка

```html
<div class="flex flex-wrap gap-3">
  <button type="button" class="base-chip base-chip--default base-chip--clickable base-chip--interactive">
    <span class="base-chip__content">
      <span class="px-1">Default</span>
    </span>
  </button>
  <button type="button" class="base-chip base-chip--approved base-chip--clickable base-chip--interactive">
    <span class="base-chip__content">
      <span class="px-1">Approved</span>
    </span>
  </button>
  <button type="button" class="base-chip base-chip--ghost base-chip--clickable base-chip--interactive">
    <span class="base-chip__content">
      <span class="px-1">Ghost</span>
    </span>
  </button>
</div>
```

## CSS

```css
.base-chip { align-items:center;border-radius:.5rem;color:var(--color-ui-gray-1);display:inline-flex;font-size:14px;font-weight:400;line-height:20px;min-height:2rem;padding:.25rem;text-decoration-line:none }
.base-chip--clickable { cursor:pointer }
.base-chip--disabled { color:var(--color-ui-gray-4);cursor:default }
.base-chip--default { background-color:var(--color-ui-gray-4-20) }
.base-chip--approved { background-color:var(--color-ui-green-10) }
.base-chip--ghost { background-color:transparent }
.base-chip--blue { background-color:var(--color-ui-turquoise-10) }
.base-chip--interactive.base-chip--default:focus-visible,.base-chip:not(.base-chip--disabled).base-chip--default:active,.base-chip:not(.base-chip--disabled).base-chip--default:hover { background-color:var(--color-ui-gray-4-30) }
.base-chip--interactive.base-chip--approved:focus-visible,.base-chip:not(.base-chip--disabled).base-chip--approved:active,.base-chip:not(.base-chip--disabled).base-chip--approved:hover { background-color:var(--color-ui-green-20) }
.base-chip--interactive.base-chip--ghost:focus-visible,.base-chip:not(.base-chip--disabled).base-chip--ghost:active,.base-chip:not(.base-chip--disabled).base-chip--ghost:hover { background-color:var(--color-ui-gray-4-20) }
.base-chip--interactive:focus-visible { outline:2px solid var(--color-ui-gray-2-60);outline-offset:2px }
.base-chip--disabled.base-chip--default { background-color:var(--color-ui-gray-7) }
.base-chip--disabled.base-chip--approved { background-color:var(--color-ui-green-10);opacity:.5 }
.base-chip__content { align-items:center;display:inline-flex }
.base-chip__text { margin-left:.25rem;margin-right:.25rem }
.base-chip:not(.base-chip--clickable).base-chip--disabled:hover { color:var(--color-ui-gray-4);cursor:default }
.base-chip:not(.base-chip--clickable).base-chip--default:hover { background-color:var(--color-ui-gray-4-20) }
.base-chip:not(.base-chip--clickable).base-chip--approved:hover { background-color:var(--color-ui-green-10) }
.base-chip:not(.base-chip--clickable).base-chip--ghost:hover { background-color:transparent }
.base-chip:not(.base-chip--clickable).base-chip--blue:hover { background-color:var(--color-ui-turquoise-10) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-chip.stories.ts`
- Storybook `career-web`: `common-chips-basechip--playground`, `common-chips-basechip--variants`, `common-chips-basechip--interactive-and-disabled`, `common-chips-basechip--closable`
- CSS: секция `base-chip` в `ui/components/chips.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Сначала выберите семантику: статическая метка — `span` без `tabindex`; действие — `button` или `a`; переключатель фильтра — `button` с `aria-pressed`. Не делайте статическую метку фокусируемой и не вкладывайте кнопку в кнопку.

| Состояние | Контракт |
|---|---|
| `default` | базовый вариант оформления |
| `hover` | только для интерактивного chip |
| `focus-visible` | только для интерактивного chip |
| `pressed` | нативный `:active`; `.is-pressed` только для стенда |
| `selected` | `aria-pressed="true"`, только для toggle |
| `disabled` | `disabled` у `button`; `aria-disabled="true"` у ссылки |

Нормативные дополнения лежат в `ui/state-contract.css`.

**Выбранный чип держит свой фон под курсором.** `aria-pressed="true"` красит чип
в `--color-ui-primary-20`, и на ховере цвет не меняется — так же ведёт себя
выбранный чип-фильтр в самом Career (`.filter-button.is-chip.is-chip-active:hover`).
Отклик на нажатие даёт `.base-chip--interactive:active`, а не смена фона.

Правилу пришлось повторить форму извлечённого селектора
(`.base-chip:not(.base-chip--disabled)[aria-pressed="true"]:hover`): ховер из
сборки объявлен как `.base-chip:not(.base-chip--disabled).base-chip--default:hover`
и по специфичности (0,4,0) перебивал бы короткое `.base-chip[aria-pressed="true"]`
(0,2,0). Учтите это, если добавляете свои цветовые варианты чипа.

Цвет варианта (`--approved`, `--blue`, `--ghost`) выбранное состояние
перекрывает: `aria-pressed` сильнее по специфичности. Один чип не должен
одновременно нести вариант-данные и `aria-pressed` — это две разные оси.
