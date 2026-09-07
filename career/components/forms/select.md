# Select · BaseSelect

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `base-select` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Нативный выпадающий список в оформлении Career. Применяется там, где важна работа со штатным поведением платформы, особенно на мобильных.

## Анатомия

Обёртка `div.base-select` рисует рамку и стрелку, внутри — настоящий `select.base-select__input`.

```
div.base-select
  select.base-select__input  [name="base-select"]
    option
      · «За последний день»
    option
      · «За неделю»
    option
      · «За месяц»
```

_Разметка story `form-baseselect--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Контракт |
|---|---|
| `default` | нативный select без state-атрибутов |
| `hover` | `:hover` |
| `focus-visible` | `:focus-visible`, border + ring |
| `selected` | нативный `select.value`; соответствующий option имеет `selected` |
| `disabled` | нативный `disabled` |
| `invalid` | `aria-invalid="true"` + error id в `aria-describedby` |

`open`/`closed` не входят в публичный контракт нативного Select: раскрытием
управляет платформа, а CSS/JS не получают надёжного состояния popup. Если нужен
контролируемый popup, используется CustomSelect.

Подтверждены CSS и разметкой: `.base-select--disabled`, `:disabled`, `:focus`, `:hover`.

```css
.base-select__input:hover { border-color:var(--color-ui-gray-4) }
.base-select__input:disabled { background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23A6BDC9' viewBox='0 0 24 24'%3E%3Cpath d='M4.3 8.3a1 1 0 0 1 1.4 0l6.3 6.3 6.3-6.3a1 1 0 1 1 1.4 1.4l-7 7a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 0-1.4'/%3E%3C/svg%3E");color:var(--color-font-gray);cursor:not-allowed }
.base-select__input:disabled,.base-select__input:disabled:hover { border-color:var(--color-ui-gray-6) }
```

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `options` | SelectOption[] | — | — | `object` |
| `modelValue` | unknown | — | — | `object` |
| `disabled` | boolean | — | — | `boolean` |
| `invalid` | boolean | `false` | UI kit contract | `boolean` |
| `name` | string | — | — | `text` |
| `update:modelValue` | undefined | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-6` | `#eaf2f5` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |
| `--font-letter-spacing-0` | — | задаётся компонентом или средой, значения в сборке нет |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Нативному select не нужны `role="combobox"`, `aria-expanded` или ручная keyboard
navigation. Он получает label через `for`/`id`; invalid и error связываются
`aria-invalid` + `aria-describedby`.

## Разметка

```html
<div class="base-select">
  <select name="base-select" class="base-select__input">
    <option value="day">За последний день</option>
    <option selected value="week">За неделю</option>
    <option value="month">За месяц</option>
  </select>
</div>
```

## CSS

```css
.base-select { display:flex;width:100% }
.base-select--disabled { color:var(--color-font-gray) }
.base-select__input { -webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:var(--color-ui-white);background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2355798B' viewBox='0 0 24 24'%3E%3Cpath d='M4.3 8.3a1 1 0 0 1 1.4 0l6.3 6.3 6.3-6.3a1 1 0 1 1 1.4 1.4l-7 7a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 0-1.4'/%3E%3C/svg%3E");background-position:right 12px top 50%;background-repeat:no-repeat;background-size:24px;border:1px solid var(--color-ui-gray-5);border-radius:12px;color:var(--color-font-black);cursor:pointer;flex:1;font-size:16px;height:40px;letter-spacing:var(--font-letter-spacing-0,0);line-height:24px;max-width:100%;min-width:24px;overflow:hidden;padding:8px 44px 8px 16px;width:100% }
.base-select__input:hover { border-color:var(--color-ui-gray-4) }
.base-select__input:focus { border-color:var(--color-ui-gray-2);outline:none }
.base-select__input:disabled { background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23A6BDC9' viewBox='0 0 24 24'%3E%3Cpath d='M4.3 8.3a1 1 0 0 1 1.4 0l6.3 6.3 6.3-6.3a1 1 0 1 1 1.4 1.4l-7 7a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 0-1.4'/%3E%3C/svg%3E");color:var(--color-font-gray);cursor:not-allowed }
.base-select__input:disabled,.base-select__input:disabled:hover { border-color:var(--color-ui-gray-6) }
```

## Ограничения

- Invalid и focus-visible ring добавлены UI kit contract. Open/closed намеренно
  не моделируются: это внутреннее состояние нативного control.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-select.stories.ts`
- Storybook `career-web`: `form-baseselect--default`, `form-baseselect--disabled`
- CSS: секция `base-select` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
