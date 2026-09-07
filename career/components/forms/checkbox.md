# Checkbox · BaseCheckbox

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `checkbox` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Флажок. Основной множественный выбор в фильтрах и настройках.

## Анатомия

Настоящий `input` скрыт классом `visually-hidden`, видимый квадрат — `span.checkbox-button`. Так состояние берётся из `:checked`/`:disabled` настоящего поля, а рисуется соседним элементом.

Имена классов в новой реализации — `checkbox`, `checkbox-label`, `checkbox-icon`, `checkbox-input`, `checkbox-button`, `checkbox-text`. Это не то же самое, что `checkbox__wrapper`/`checkbox__box` в старой реализации Career на Rails; оба варианта живые, см. `ui/components.css`.

```
span.checkbox
  label.checkbox-label
    span.checkbox-icon
      input.checkbox-input.visually-hidden  [type="checkbox"]
      span.checkbox-button
    span.checkbox-text
      · «Text»
```

_Разметка story `form-basecheckbox--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Совместимость |
|---|---|---|
| `default` | нативный input без state properties | — |
| `hover` | `input:not(:disabled):hover + .checkbox-button` | production CSS |
| `focus-visible` | `input:focus-visible + .checkbox-button` | production CSS |
| `checked` | `input.checked = true` / атрибут `checked` | `:checked` |
| `indeterminate` | `input.indeterminate = true` после создания DOM | `.checkbox-button.is-minus` |
| `disabled` | нативный `disabled` | `.is-disabled` только визуальный alias на label/button |
| `loading` | `.checkbox.is-loading` + `aria-busy="true"`; input обязательно disabled | state contract |

`minusWhenNotChecked` — legacy API. В новом API это состояние называется
`indeterminate`; оно не означает unchecked и не передаётся HTML-атрибутом.

Подтверждены CSS и разметкой: `.is-disabled`, `.is-minus`, `:checked`, `:disabled`, `:focus`, `:hover`, `:not`.

```css
.checkbox-input:not(:disabled):hover+.checkbox-button { border-color:var(--color-ui-gray-4) }
.checkbox-input:focus-visible+.checkbox-button { border-color:var(--color-ui-gray-4);outline-color:var(--color-ui-gray-2-60);outline-offset:1px;outline-style:solid;outline-width:2px }
.checkbox-input:checked+.checkbox-button { background-color:var(--color-ui-primary);background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 20 20'%3E%3Cpath d='M5.77 9.92a1 1 0 1 0-1.54 1.27zM8.64 15l-.78.63a1 1 0 0 0 1.62-.1zm7.2-9.46a1 1 0 0 0-1.68-1.08zM4.23 11.19l3.63 4.44 1.55-1.26-3.64-4.45zm5.25 4.35 6.36-10-1.68-1.08-6.37 10z'/%3E%3C/svg%3E");border-color:var(--color-ui-primary) }
.checkbox-input:not(:disabled):checked:hover+.checkbox-button { opacity:.8 }
.checkbox-input:focus-visible:checked+.checkbox-button { outline-color:var(--color-ui-primary-60) }
.checkbox-input:checked:disabled+.checkbox-button { background-color:var(--color-ui-gray-5);border-color:var(--color-ui-gray-5) }
```

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | unknown | — | — | `boolean` |
| `disabled` | boolean | — | — | `boolean` |
| `minusWhenNotChecked` | boolean | — | — | `boolean` |
| `alignItems` | "center" \| "start" | — | start · center | `radio` |
| `value` | unknown | — | — | `object` |
| `trueValue` | unknown | — | — | `object` |
| `falseValue` | unknown | — | — | `object` |
| `name` | string | — | — | `text` |
| `fullWidth` | boolean | — | — | `boolean` |
| `isLoading` | boolean | — | — | `boolean` |
| `update:modelValue` | unknown | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
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

Нативный `input[type="checkbox"]` обеспечивает role, keyboard interaction и
объявление checked/disabled. У indeterminate-состояния нужно установить DOM
property `input.indeterminate = true`; браузер сам передаст mixed-state
accessibility tree. Видимая подпись находится внутри `<label>`.

## Поведение

- `indeterminate` рисует минус вместо галочки и обозначает частично выбранную
  группу. После пользовательского выбора приложение должно явно пересчитать
  `checked` и `indeterminate`.
- При `loading` input блокируется, корень получает `aria-busy="true"`, а квадрат
  показывает spinner. Loading не является третьим значением checkbox.
- **Квадрат выравнивается по первой строке подписи.** Это состояние по умолчанию
  и в извлечённом CSS (`.checkbox-label{align-items:flex-start}`), и в UI kit:
  коробка значка ровно 24px, как и `line-height` текста, поэтому квадрат
  совпадает с первой строкой при любом числе строк. Так же устроены
  [RadioButton](radio-button.md) и [Switch](switch.md).
- `alignItems` (класс `align-center`) центрирует квадрат по всей высоте подписи.
  Это опция для заведомо однострочных подписей; на многострочной она отрывает
  квадрат от первой строки, поэтому в витрине не используется.

## Разметка

```html
<span class="checkbox">
  <label class="checkbox-label">
    <span class="checkbox-icon">
      <input type="checkbox" class="checkbox-input visually-hidden">
      <span class="checkbox-button"></span>
    </span>
    <span class="checkbox-text">Text</span>
  </label>
</span>
```

## CSS

```css
.checkbox { display:inline-flex;vertical-align:top }
.checkbox-label { align-items:flex-start;cursor:pointer;display:inline-flex }
.checkbox-label.align-center { align-items:center }
.checkbox-label.is-disabled { cursor:not-allowed }
.checkbox-icon { align-items:center;display:inline-flex;flex-shrink:0;height:1.5rem;justify-content:center;margin-right:.5rem;width:1.5rem }
.checkbox-button { background-color:var(--color-ui-white);background-position:50%;background-repeat:no-repeat;border-color:var(--color-ui-gray-5);border-radius:.375rem;border-width:1px;height:22px;transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);width:22px }
.checkbox-text { color:var(--color-font-black);font-size:16px;line-height:24px }
.checkbox-input:not(:disabled):hover+.checkbox-button { border-color:var(--color-ui-gray-4) }
.checkbox-button.is-disabled { border-color:var(--color-ui-gray-6) }
.checkbox-label.is-disabled .checkbox-text { color:var(--color-ui-gray-4) }
.checkbox-input:focus-visible+.checkbox-button { border-color:var(--color-ui-gray-4);outline-color:var(--color-ui-gray-2-60);outline-offset:1px;outline-style:solid;outline-width:2px }
.checkbox-input:checked+.checkbox-button { background-color:var(--color-ui-primary);background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 20 20'%3E%3Cpath d='M5.77 9.92a1 1 0 1 0-1.54 1.27zM8.64 15l-.78.63a1 1 0 0 0 1.62-.1zm7.2-9.46a1 1 0 0 0-1.68-1.08zM4.23 11.19l3.63 4.44 1.55-1.26-3.64-4.45zm5.25 4.35 6.36-10-1.68-1.08-6.37 10z'/%3E%3C/svg%3E");border-color:var(--color-ui-primary) }
.checkbox-input:not(:disabled):checked:hover+.checkbox-button { opacity:.8 }
.checkbox-input:focus-visible:checked+.checkbox-button { outline-color:var(--color-ui-primary-60) }
.checkbox-input:checked:disabled+.checkbox-button { background-color:var(--color-ui-gray-5);border-color:var(--color-ui-gray-5) }
.checkbox-button.is-minus { background-color:var(--color-ui-primary);background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 20 20'%3E%3Cpath fill='%23fff' d='M5 9a1 1 0 0 0 0 2zm10 2a1 1 0 0 0 0-2zM5 11h10V9H5z'/%3E%3C/svg%3E");border-color:var(--color-ui-primary) }
```

## Ограничения

- Production snapshot не показывал `isLoading`, хотя prop объявлен. Loading и
  нативный `:indeterminate` оформлены как нормативные дополнения UI kit в
  `ui/state-contract.css`.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/base-checkbox.stories.ts`
- Storybook `career-web`: `form-basecheckbox--default`
- CSS: секция `base-checkbox` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
