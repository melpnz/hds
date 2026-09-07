# Switch · BaseSwitch

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `switch` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Тумблер для настроек, применяющихся сразу, без кнопки сохранения: видимость профиля, подписки, уведомления.

## Анатомия

Внутри три вложенных узла: `switch-track` — дорожка, `switch-thumb` — бегунок, `switch-dot` — точка внутри бегунка, которая и показывает загрузку.

```
label.switch
  span.switch-field
    input.switch-input.visually-hidden  [type="checkbox" name="base-switch-story"]
    span.switch-control
      span.switch-track
      span.switch-thumb
        span.switch-dot
  span.switch-label
    · «Text»
```

_Разметка story `form-baseswitch--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Совместимость |
|---|---|---|
| `default` | нативный checkbox без `checked` | — |
| `hover` | `.switch:hover`, только если input доступен | production CSS |
| `focus-visible` | `input:focus-visible`; ring рисуется на `.switch-control` | production CSS + state contract |
| `checked` | нативный `input.checked = true` | `.switch.is-checked` |
| `disabled` | нативный `disabled` | `.switch.is-disabled` |
| `loading` | `.switch.is-loading` + `aria-busy="true"`; input disabled | `.switch-loading` branch |

`is-checked` и `is-disabled` остаются aliases существующей Vue-реализации.
Новая разметка может получать визуальное состояние напрямую из нативного input;
оно описано в `ui/state-contract.css`.

Подтверждены CSS и разметкой: `.has-before`, `.is-checked`, `.is-disabled`, `:focus`, `:hover`, `:not`.

```css
.switch:not(.is-disabled):hover .switch-track { border-color:var(--color-ui-gray-4) }
.switch.is-checked:not(.is-disabled):hover .switch-track { opacity:.8 }
```

## Слоты

- `before`
- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | boolean \| null \| string | — | — | `boolean` |
| `name` | string | — | — | `text` |
| `disabled` | boolean | — | — | `boolean` |
| `isLoading` | boolean | — | — | `boolean` |
| `trueValue` | boolean \| null \| string | `true` | — | `object` |
| `falseValue` | boolean \| null | `false` | — | `object` |
| `update:modelValue` | union | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-2-60` | `color-mix(in srgb,var(--color-ui-gray-2) 60%,transparent)` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-6` | `#eaf2f5` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Switch реализуется нативным `input[type="checkbox"]` с видимой подписью внутри
`label`; отдельные `role="switch"` и `aria-checked` не обязательны. Если продукт
решает озвучивать именно «переключатель», допустимо добавить `role="switch"` на
input — checked по-прежнему остаётся нативным источником истины.

## Поведение

- Вращение spinner задаётся в `ui/state-contract.css` и требует двух оговорок,
  обе — из-за того, что `.switch-spinner` центрируется через `transform`
  (`top:50%` плюс Tailwind `--tw-translate-y:-50%`). Первая: анимация задаёт
  свой `transform` и это центрирование затирает, поэтому оно перенесено
  в отдельное свойство `translate`. Вторая: кейфрейм обязан задавать оба конца
  одной функцией (`from{rotate(0turn)} to{rotate(1turn)}`) — с одним только
  `to` начальным значением становится составной `transform` элемента, списки
  функций не совпадают, браузер переходит на интерполяцию матриц, а
  `rotate(1turn)` как матрица равна `rotate(0)`, и вращения не происходит вовсе.
- `isLoading` заменяет control на spinner, ставит `aria-busy="true"` и блокирует
  input до завершения операции. Checked-значение при этом не сбрасывается.
- Switch применяется для настройки с немедленным эффектом. Если изменение
  требует отдельного Submit, нужен Checkbox, а не Switch.

## Разметка

```html
<label class="switch">
  <span class="switch-field">
    <input type="checkbox" true-value="true" false-value="false" name="base-switch-story" class="switch-input visually-hidden">
    <span class="switch-control">
      <span class="switch-track"></span>
      <span class="switch-thumb">
        <span class="switch-dot"></span>
      </span>
    </span>
  </span>
  <span class="switch-label">Text</span>
</label>
```

## CSS

```css
.switch { align-items:flex-start;cursor:pointer;display:grid;gap:.5rem;grid-template-columns:40px 1fr;max-width:100% }
.switch.has-before { display:flex }
.switch.is-disabled { cursor:default }
.switch-label { color:var(--color-font-black);font-size:16px;line-height:24px;transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);-webkit-user-select:none;-moz-user-select:none;user-select:none }
.switch.is-disabled .switch-label { color:var(--color-font-gray) }
.switch-loading { align-items:center;color:var(--color-ui-gray-2);display:flex;height:1.5rem;justify-content:center;position:relative;width:2.5rem }
.switch-loading-ghost { height:1.5rem;opacity:0;width:2.5rem }
.switch-spinner { left:.5rem;position:absolute;top:50%;--tw-translate-y:-50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) }
.switch-field { align-items:center;display:flex;height:1.5rem;justify-content:center;width:2.5rem }
.switch-control { border-radius:9999px;height:1.5rem;position:relative;width:2.5rem }
.switch-track { background-color:var(--color-ui-white);border-color:var(--color-ui-gray-5);border-radius:9999px;border-width:1px;height:1.25rem;left:.125rem;position:absolute;top:.125rem;transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);width:2.25rem }
.switch-thumb { height:1.5rem;left:0;top:0;transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);width:1.5rem }
.switch-dot,.switch-thumb { border-radius:9999px;position:absolute;transition-duration:.15s }
.switch-dot { height:.75rem;left:50%;top:50%;width:.75rem;--tw-translate-x:-50%;--tw-translate-y:-50%;background-color:var(--color-ui-gray-2);transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1) }
.switch:not(.is-disabled):hover .switch-track { border-color:var(--color-ui-gray-4) }
.switch.is-checked .switch-track { background-color:var(--color-ui-primary);border-color:transparent }
.switch.is-checked:not(.is-disabled):hover .switch-track { opacity:.8 }
.switch.is-checked .switch-thumb { transform:translate(16px) }
.switch.is-checked .switch-dot,.switch.is-disabled .switch-track { background-color:var(--color-ui-white) }
.switch.is-disabled .switch-track { border-color:var(--color-ui-gray-6) }
.switch.is-disabled .switch-dot { background-color:var(--color-ui-gray-4) }
.switch.is-disabled.is-checked .switch-track { background-color:var(--color-ui-gray-5);border-color:transparent }
.switch.is-disabled.is-checked .switch-dot { background-color:var(--color-ui-white) }
.switch-field:focus-within .switch-control { --tw-shadow:0 0 0 2px var(--color-ui-gray-2-60);--tw-shadow-colored:0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.switch.is-checked .switch-field:focus-within .switch-control { --tw-shadow:0 0 0 2px var(--color-ui-primary-60);--tw-shadow-colored:0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
```

## Ограничения

- Production Vue синхронизирует `.is-checked`/`.is-disabled` с input. Прямая
  связь через `:has(input:checked)` и подавление pointer-only focus ring —
  нормативные дополнения UI kit.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/base-switch.stories.ts`
- Storybook `career-web`: `form-baseswitch--default`
- CSS: секция `base-switch` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
