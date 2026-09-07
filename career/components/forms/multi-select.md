# MultiSelect · Множественный выбор

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `multi-select`; production snapshot использует generic `wrapper` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html#fo-multi` |
| **Snapshot Storybook** | 3 из 3 |

## Назначение

Выбор нескольких значений с поиском и подсказками: навыки, города, специализации. Главный компонент фильтров Career.

## Анатомия

```
div.wrapper
  div.v-popper.v-popper--theme-dropdown
    div.relative
      div
        div.wrapper.relative
          span.text-input.text-input
            input.cursor-pointer.text-input__input  [placeholder]
          span.pointer-events-none.absolute.bottom-0.left-0.right-0.top-0.flex.items-center.justify-between.bg-transparent.px-3
            span.block.max-w-[calc(100%-24px)].shrink-0.grow.truncate.px-1
              …
            svg.svg-icon.h-6.w-6.shrink-0.fill-icon-gray.text-icon-gray.transition-transform  [aria-hidden="true"]
              …
```

_Разметка story `form-multiselect--base-story`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

MultiSelect — editable combobox с multiselect listbox.

| Состояние | Контракт |
|---|---|
| `default` | combobox input, `aria-expanded="false"` |
| `hover` | hover wrapper/options | production CSS |
| `focus-visible` | input `:focus-visible`, ring на wrapper | state contract |
| `closed` | listbox не рендерится |
| `open` | `aria-expanded="true"`, `aria-controls` указывает на listbox |
| `selected` | option `aria-selected="true"`; выбранные значения показываются chips |
| `disabled` | нативный `disabled` на input, root `.is-disabled` |
| `loading` | root `aria-busy="true"`; listbox показывает status |
| `invalid` | input `aria-invalid="true"` + error в `aria-describedby` |
| `empty` | вместо listbox показывается `role="status"` с `noResultsMessage` |

`.suggestion-item--active` означает keyboard highlight, а не selected. Active
option задаётся `aria-activedescendant`; выбранность — только `aria-selected`.

Подтверждены CSS и разметкой: `.has-after`, `.is-chip`, `.is-chip-inactive`, `.is-sizeable`, `.suggestion-item--active`, `.text-input--disabled`, `.text-input--invalid`, `:focus`, `:hover`.

```css
.suggestion-item--active,.suggestion-item:focus-within,.suggestion-item:hover { background-color:var(--color-ui-gray-3-10) }
.suggestion-item--withSeparator:hover { background-color:var(--color-ui-gray-3-10) }
.suggestions-picker__wrapper--with-tags:hover { border-color:var(--color-ui-gray-4) }
```

## Слоты

- `content`
- `footer-button`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | MultiSelectOptionValue[] | — | — | `object` |
| `defaultLabel` | string | `''` | — | `text` |
| `searchPlaceholder` | string | — | — | `text` |
| `action` | MultiSelectSearchAction | — | — | `object` |
| `noResultsMessage` | string | — | — | `text` |
| `withBaseFilter` | boolean | `false` | — | `boolean` |
| `label` | string | — | — | `text` |
| `termMinLength` | number | `0` | — | `number` |
| `cacheKey` | string | — | — | `text` |
| `preCachedOptions` | MultiselectOption[] | — | — | `object` |
| `textInputId` | string | — | — | `text` |
| `showInsertMessage` | boolean | `true` | — | `boolean` |
| `hasAppliedOptions` | boolean | `false` | — | `boolean` |
| `placement` | "bottom-start" \| "bottom" | `'bottom'` | — | `object` |
| `selectionControl` | "checkbox" \| "none" | `'checkbox'` | — | `object` |
| `disabled` | boolean | `false` | — | `boolean` |
| `invalid` | boolean | `false` | UI kit contract | `boolean` |
| `loading` | boolean | `false` | UI kit contract | `boolean` |
| `update:modelValue` | Array | — | — | `object` |
| `insertToSearch` | string | — | — | `object` |
| `close` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-6` | `#eaf2f5` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow-down-small` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Input использует `role="combobox"`, `aria-autocomplete="list"`,
`aria-expanded`, `aria-controls` и при навигации `aria-activedescendant`.
Popup — `role="listbox" aria-multiselectable="true"`; options используют
`aria-selected`. Remove-action каждого выбранного chip имеет доступное имя.

## Поведение

- Умеет жить в двух обвязках: обычной (`div.wrapper`) и внутри кнопки фильтра (`with-base-filter` + FilterButton как триггер).
- Кеширует список опций по `cacheKey` и умеет показывать предзагруженные значения до первого запроса.
- `ArrowDown` открывает список и двигает active option, `Enter`/`Space` меняют
  выбранность, `Escape` закрывает, Backspace удаляет последний chip только при
  пустом поисковом запросе.

## Разметка

```html
<div class="multi-select suggestions-picker">
  <div class="suggestions-picker__wrapper--with-tags">
    <span class="base-chip base-chip--default">JavaScript</span>
    <span class="text-input text-input--with-tags">
      <input id="skills-combobox" class="text-input__input" role="combobox"
             aria-label="Навыки" aria-autocomplete="list"
             aria-expanded="true" aria-controls="skills-listbox"
             aria-activedescendant="skills-option-2">
    </span>
  </div>
  <div id="skills-listbox" class="suggestions-picker__results"
       role="listbox" aria-label="Варианты навыков"
       aria-multiselectable="true">
    <div class="suggestion-item" role="option"
         aria-selected="true">JavaScript</div>
    <div id="skills-option-2" class="suggestion-item suggestion-item--active"
         role="option" aria-selected="false">React</div>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.label .base-checkbox__icon-wrapper { margin:0 }
.wrapper input { padding-right:1.5rem }
.divider { background-color:var(--color-ui-gray-bg);height:1px;margin:.5rem 1rem }
.with-base-filter .v-popper { width:-moz-max-content;width:max-content }
.filter-item { display:block;line-height:24px;max-width:100% }
.filter-item__title { margin-right:4px;min-width:0;word-break:break-word }
.filter-item--staticView .filter-item__title { margin-right:0 }
.filter-item--nowrap { align-items:center;display:flex;justify-content:space-between }
.filter-item--nowrap .filter-item__title { overflow:hidden;text-overflow:ellipsis;white-space:nowrap }
.filter-item__remove { align-items:center;background-color:transparent;border-radius:9999px;border-style:none;color:var(--color-icon-gray);cursor:pointer;display:inline-flex;flex:none;height:22px;justify-content:center;padding:0;width:22px }
.filter-item__remove:focus { outline:2px solid transparent;outline-offset:2px }
.empty-suggest-item { color:var(--color-font-gray);padding:28px 4px }
.empty-suggest-item__title { font-weight:700 }
.empty-suggest-item--centered { text-align:center }
.suggestion-item { background-color:var(--color-ui-white);border-radius:12px;cursor:pointer;margin:0;min-height:40px;overflow:hidden;padding:8px 16px }
.suggestion-item--active,.suggestion-item:focus-within,.suggestion-item:hover { background-color:var(--color-ui-gray-3-10) }
.suggestion-item--withSeparator+.suggestion-item--withSeparator { border-top:1px solid var(--color-ui-gray-bg) }
.suggestion-item--withSeparator:hover { background-color:var(--color-ui-gray-3-10) }
.suggestion-item__button { background-color:transparent;border:none;cursor:pointer;display:block;padding:0;text-align:left;width:100% }
.suggestion-item__button:focus { outline:none }
.search-input__icon { align-items:center;background-color:transparent;border:none;color:var(--color-ui-gray-2);display:flex;height:24px;justify-content:center;padding:0;width:24px }
.search-input__icon--filled { cursor:pointer }
.suggestions-picker { position:relative }
.suggestions-picker--hidden,.suggestions-picker__wrapper--hidden { display:contents }
.suggestions-picker__wrapper--with-tags { align-items:center;background-color:var(--color-ui-white);border:1px solid var(--color-ui-gray-5);border-radius:12px;display:inline-flex;flex-wrap:wrap;gap:6px;min-height:40px;padding:7px;transition:border-color .2s ease;width:100% }
.suggestions-picker__wrapper--with-tags:hover { border-color:var(--color-ui-gray-4) }
.suggestions-picker__wrapper--with-tags:focus-within { border-color:var(--color-ui-gray-2) }
.suggestions-picker__wrapper--with-tags:has(.text-input--disabled) { border-color:var(--color-ui-gray-6) }
.suggestions-picker__wrapper--with-tags:has(.text-input--invalid) { border-color:var(--color-ui-red) }
.suggestions-picker__results { background-color:var(--color-ui-white);border:none;border-radius:16px;box-shadow:0 1px 4px 1px var(--color-ui-gray-shadow),0 4px 8px 2px var(--color-ui-gray-shadow);display:flex;flex-direction:column;gap:4px;max-height:445px;overflow:auto;padding:4px;position:absolute;top:100%;width:100%;z-index:11 }
.suggestions-picker__results--compact { max-height:200px }
.suggestions-picker__icon { cursor:pointer;fill:var(--color-ui-gray-2) }
.base-suggest-picker { display:grid;gap:8px }
```

## Ограничения

- Раскрытый production popup не попал в snapshot. Showcase содержит нормативный
  listbox, собранный на существующих `suggestions-picker` и `suggestion-item`
  styles; это UI kit reconstruction, не исторический Vue DOM.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/multi-select/multi-select.stories.ts`
- Storybook `career-web`: `form-multiselect--base-story`, `form-multiselect--with-base-filters-story`, `form-multiselect--with-images-story`
- CSS: секция `multi-select` в `ui/components/forms.css`, секция `base-suggest-picker` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
