# CustomSelect · BaseCustomSelect

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `custom-select`; trigger — `base-custom-select-button` |
| **CSS** | `ui/components/forms.css`, `ui/components/navigation.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html#fo-select` |
| **Snapshot Storybook** | 3 из 3 |

## Назначение

Выпадающий список с собственным оформлением опций: подзаголовки, изображения, произвольная разметка. Применяется, когда нативный select не может показать нужное.

## Анатомия

```
p
  · «В данном компоненте не реализован вывод …»
p
  · «Может использоваться с разными компонент…»
div.v-popper.v-popper--theme-dropdown
  div.relative
    div
      button.base-custom-select-button.base-custom-select-button--default  [type="button" role="combobox" aria-label="Выберите опцию" aria-expanded="false"]
        span.block.h-6.min-w-0.flex-1.overflow-hidden.truncate.px-1.pr-8
          span.text-ui-gray-3
            · «Выберите опцию»
        svg.svg-icon.pointer-events-none.absolute.right-3.top-1/2.h-6.w-6.-translate-y-1/2.fill-current.transition-transform.text-icon-gray  [aria-hidden="true"]
          use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#arrow-down-small"]
```

_Разметка story `form-basecustomselect--base-story`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

CustomSelect — select-only combobox: пользователь выбирает готовое значение, но
не вводит поисковый запрос.

| Состояние | Контракт |
|---|---|
| `default` | trigger с `role="combobox"` |
| `hover` | `:hover` |
| `focus-visible` | `:focus-visible`, видимый ring |
| `closed` | `aria-expanded="false"`, listbox не рендерится |
| `open` | `aria-expanded="true"`, trigger связан с listbox через `aria-controls` |
| `selected` | option получает `aria-selected="true"`, trigger показывает значение |
| `disabled` | нативный `disabled` на trigger |
| `invalid` | `aria-invalid="true"` + `aria-describedby` на trigger |

`base-custom-select-button--shown` сохраняется как legacy visual alias открытого
состояния, но источником истины является `aria-expanded`.

Подтверждены CSS и разметкой: `.base-custom-select-button--disabled`, `:disabled`, `:focus`, `:hover`, `:not`.

```css
.base-custom-select-button:disabled { cursor:not-allowed }
.base-custom-select-button--default:hover { border-color:var(--color-ui-gray-4) }
```

## Слоты

- `content`
- `option`
- `beforeOptions`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `options` | T[] | — | — | `object` |
| `placeholder` | string | — | — | `text` |
| `disabled` | boolean | — | — | `boolean` |
| `invalid` | boolean | `false` | UI kit contract | `boolean` |
| `modelValue` | string \| number \| null | — | — | `object` |
| `placement` | "bottom-start" \| "bottom" | — | — | `object` |
| `update:modelValue` | union | — | — | `object` |
| `close` | other | — | — | `object` |
| `openDropdown` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-6` | `#eaf2f5` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow-down-small` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Trigger использует `role="combobox"`, `aria-haspopup="listbox"`,
`aria-expanded` и `aria-controls`. Popup имеет `role="listbox"`, элементы —
`role="option"` и `aria-selected`. Фокус остаётся на trigger; активная опция
передаётся через `aria-activedescendant`.

## Поведение

- Кнопка открытия имеет `role="combobox"` и `aria-expanded`; сам список позиционируется библиотекой `v-popper`.
- Компонент не реализует поиск по опциям — для этого есть MultiSelect.
- `Enter`/`Space`/`ArrowDown` открывают список; стрелки меняют active option;
  `Enter` выбирает; `Escape` закрывает; `Tab` закрывает и продолжает tab order.

## Разметка

```html
<div class="custom-select">
  <button id="specialization-trigger" type="button"
          class="base-custom-select-button base-custom-select-button--shown"
          role="combobox" aria-haspopup="listbox" aria-expanded="true"
          aria-controls="specialization-list"
          aria-activedescendant="specialization-option-2">
    Frontend
  </button>
  <div id="specialization-list" class="custom-select__listbox"
       role="listbox" aria-labelledby="specialization-trigger">
    <div class="custom-select__option" role="option"
         aria-selected="true">Frontend</div>
    <div id="specialization-option-2" class="custom-select__option"
         role="option" aria-selected="false" data-active="true">Backend</div>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.base-custom-select-button { align-items:center;background-color:var(--color-ui-white);border-radius:.75rem;border-style:solid;border-width:1px;display:flex;font-size:16px;font-weight:400;gap:.25rem;height:2.5rem;line-height:24px;max-width:100%;overflow:hidden;padding-left:.75rem;padding-right:.75rem;position:relative;text-align:left;width:100% }
.base-custom-select-button:focus { outline:2px solid transparent;outline-offset:2px }
.base-custom-select-button:disabled { cursor:not-allowed }
.base-custom-select-button--default { border-color:var(--color-ui-gray-5) }
.base-custom-select-button--default:hover { border-color:var(--color-ui-gray-4) }
.base-custom-select-button--shown { border-color:var(--color-ui-gray-2) }
.base-custom-select-button--disabled { border-color:var(--color-ui-gray-6) }
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

- Раскрытый production popup в snapshot не попал. Показанный в showcase listbox
  — нормативная UI kit reconstruction на базе существующих trigger/dropdown
  styles, а не снимок исторического Vue DOM.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/base-custom-select/base-custom-select.stories.ts`
- Storybook `career-web`: `form-basecustomselect--base-story`, `form-basecustomselect--base-story-subtitles`, `form-basecustomselect--base-story-images`
- CSS: секция `base-custom-select-option` в `ui/components/forms.css`, секция `base-dropdown` в `ui/components/navigation.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
