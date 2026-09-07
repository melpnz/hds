# RadioButton · BaseRadioButton

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `radio` |
| **CSS** | `ui/components/forms.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Переключатель одного значения из группы. Анатомия повторяет Checkbox, отличается формой и разметкой точки.

## Анатомия

```
div.grid.gap-2
  label.radio
    span.radio-icon
      input.radio-input.visually-hidden  [type="radio" name="base-radio-story"]
      span.radio-button
    span.radio-text
      · «Text»
  label.radio
    span.radio-icon
      input.radio-input.visually-hidden  [type="radio" name="base-radio-story"]
      span.radio-button
    span.radio-text
      · «Text 2»
```

_Разметка story `form-baseradiobutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Контракт |
|---|---|
| `default` | radio input без `checked` и `disabled` |
| `hover` | `input:not(:disabled):hover + .radio-button` |
| `focus-visible` | `input:focus-visible + .radio-button` |
| `checked` | один нативный input с общим `name` получает `checked` |
| `disabled` | нативный `disabled`, отдельно проверяются checked и unchecked |

Loading не входит в контракт RadioButton: у компонента нет такого prop, а
ожидание относится к форме или секции целиком. Не следует заменять radio на
индивидуальный spinner.

Подтверждены CSS и разметкой: `.is-disabled`, `:checked`, `:disabled`, `:focus`, `:hover`, `:not`.

```css
.radio-input:focus+.radio-button,.radio-input:not(:disabled):hover+.radio-button { border-color:var(--color-ui-gray-4) }
.radio-input:focus-visible+.radio-button { --tw-shadow:0 0 0 2px var(--color-ui-gray-2-60);--tw-shadow-colored:0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.radio-input:checked+.radio-button { background-color:var(--color-ui-primary);border-color:transparent }
.radio-input:checked+.radio-button:after { background-color:var(--color-ui-white) }
.radio-input:not(:disabled):checked:hover+.radio-button { opacity:.8 }
.radio-input:checked:focus-visible+.radio-button { --tw-shadow:0 0 0 2px var(--color-ui-primary-60);--tw-shadow-colored:0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.radio-input:disabled+.radio-button { border-color:var(--color-ui-gray-6) }
.radio-input:disabled:checked+.radio-button { background-color:var(--color-ui-gray-5);border-color:transparent }
.radio-input:disabled:checked+.radio-button:after { background-color:var(--color-ui-white) }
```

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | null | — | — | `object` |
| `value` | null | — | — | `object` |
| `name` | string | — | — | `text` |
| `disabled` | boolean | — | — | `boolean` |
| `change` | other | — | — | `object` |
| `update:modelValue` | undefined | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
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

Все варианты одной группы используют одинаковый `name`. Если у группы есть
вопрос или заголовок, варианты помещаются в `<fieldset>` с `<legend>`. Нативные
radio уже поддерживают Tab и перемещение стрелками; дополнительные role и
`aria-checked` не нужны.

## Разметка

```html
<div class="grid gap-2">
  <label class="radio">
    <span class="radio-icon">
      <input class="radio-input visually-hidden" type="radio" name="base-radio-story" value="option-1">
      <span class="radio-button"></span>
    </span>
    <span class="radio-text">Text</span>
  </label>
  <label class="radio">
    <span class="radio-icon">
      <input class="radio-input visually-hidden" type="radio" name="base-radio-story" value="option-2">
      <span class="radio-button"></span>
    </span>
    <span class="radio-text">Text 2</span>
  </label>
</div>
```

## CSS

```css
.radio { align-items:flex-start;cursor:pointer;display:inline-flex;gap:.5rem }
.radio.is-disabled { cursor:not-allowed }
.radio-icon { align-items:center;display:inline-flex;flex-shrink:0;height:1.5rem;justify-content:center;width:1.5rem }
.radio-button { background-color:var(--color-ui-white);border-color:var(--color-ui-gray-5);border-radius:9999px;border-width:1px;height:22px;position:relative;transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);width:22px }
.radio-button:after { content:"";height:.75rem;left:50%;position:absolute;top:50%;width:.75rem;--tw-translate-x:-50%;--tw-translate-y:-50%;background-color:transparent;border-radius:9999px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1) }
.radio-text { color:var(--color-font-black);font-size:16px;line-height:24px }
.radio.is-disabled .radio-text { color:var(--color-font-gray) }
.radio-input:focus+.radio-button,.radio-input:not(:disabled):hover+.radio-button { border-color:var(--color-ui-gray-4) }
.radio-input:focus-visible+.radio-button { --tw-shadow:0 0 0 2px var(--color-ui-gray-2-60);--tw-shadow-colored:0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.radio-input:checked+.radio-button { background-color:var(--color-ui-primary);border-color:transparent }
.radio-input:checked+.radio-button:after { background-color:var(--color-ui-white) }
.radio-input:not(:disabled):checked:hover+.radio-button { opacity:.8 }
.radio-input:checked:focus-visible+.radio-button { --tw-shadow:0 0 0 2px var(--color-ui-primary-60);--tw-shadow-colored:0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.radio-input:disabled+.radio-button { border-color:var(--color-ui-gray-6) }
.radio-input:disabled:checked+.radio-button { background-color:var(--color-ui-gray-5);border-color:transparent }
.radio-input:disabled:checked+.radio-button:after { background-color:var(--color-ui-white) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/base-radio-button.stories.ts`
- Storybook `career-web`: `form-baseradiobutton--default`
- CSS: секция `base-radio-button` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
