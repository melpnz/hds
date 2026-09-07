# Pagination · BasePagination

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | — собственных классов нет; кнопки — `pagination-button`, корень снимка — `div.grid.gap-0.5.pb-2` |
| **CSS** | `ui/components/buttons.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 3 из 3 |

## Назначение

Постраничная навигация листингов. Собирается из PaginationButton плюс разделители-многоточия.

## Анатомия

```
div.grid.text-font-black.gap-0.5.pb-2
  nav.flex.items-center.justify-between.rounded-3xl.border.border-ui-gray-shadow.bg-ui-white.p-2  [aria-label="Pagination"]
    div.flex.items-center.justify-center
      button.rotate-90.pagination-button.is-status-disable.base-button.inline-flex.appearance-none.size-l.rotate-90.pagination-button.is-status-disable  [type="button" aria-label="Previous page" disabled target="_self"]
        span.base-button__content
          span.pagination-button__content
            svg.svg-icon.fill-current.text-ui-gray-4
              …
    div.grid.auto-cols-min.grid-flow-col.items-end
      button.pagination-button.is-selected.base-button.inline-flex.appearance-none.size-l.pagination-button.is-selected  [type="button" aria-label="Page 1" aria-current="page" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «1»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 2" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «2»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 3" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «3»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 4" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «4»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 5" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «5»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 6" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «6»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 7" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «7»
      button.pagination-button.base-button.inline-flex.appearance-none.size-l.pagination-button  [type="button" aria-label="Page 8" target="_self"]
        span.base-button__content
          span.pagination-button__content
            · «8»
      span.flex.h-10.min-w-10.items-center.justify-center.px-2.py-2.text-body-l.font-semibold.tracking-[0].text-ui-gray-1  [aria-hidden="true"]
        · «...»
    div.flex.items-center.justify-center
      button.-rotate-90.pagination-button.base-button.inline-flex.appearance-none.size-l.-rotate-90.pagination-button  [type="button" aria-label="Next page" target="_self"]
        span.base-button__content
          span.pagination-button__content
            svg.svg-icon.fill-current.text-ui-gray-2
              …
```

_Разметка story `common-navigation-basepagination--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-selected`, `.is-status-disable`, `.is-status-focus`, `.is-status-hover`, `:disabled`, `:focus`, `:hover`.

```css
.pagination-button:hover:before { content:var(--tw-content);opacity:.1 }
.pagination-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.pagination-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.pagination-button:disabled { background-color:transparent;color:var(--color-ui-gray-4) }
```

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `meta` | ListingMeta \| PaginationMeta | — | — | `object` |
| `maxPages` | number | `8` | — | `number` |
| `gap` | number | `0.5` | — | `number` |
| `scrollToTop` | boolean | `true` | — | `boolean` |
| `maxPagesMobile` | number | `3` | — | `number` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-primary-accent` | `#5014f5` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-current="page"`, `aria-hidden="true"`, `aria-label="Next page"`, `aria-label="Page 1"`, `aria-label="Page 10"`, `aria-label="Page 11"`, `aria-label="Page 12"`, `aria-label="Page 13"`, `aria-label="Page 14"`, `aria-label="Page 15"`, `aria-label="Page 2"`, `aria-label="Page 3"`, `aria-label="Page 4"`, `aria-label="Page 5"`, `aria-label="Page 6"`, `aria-label="Page 7"`, `aria-label="Page 8"`, `aria-label="Page 9"`, `aria-label="Pagination"`, `aria-label="Previous page"`.

## Разметка

```html
<div class="grid text-font-black gap-0.5 pb-2">
  <nav class="flex items-center justify-between rounded-3xl border border-ui-gray-shadow bg-ui-white p-2" aria-label="Pagination">
    <div class="flex items-center justify-center">
      <button class="rotate-90 pagination-button is-status-disable base-button inline-flex appearance-none size-l rotate-90 pagination-button is-status-disable" aria-label="Previous page" type="button" disabled target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">
            <svg class="svg-icon fill-current text-ui-gray-4" width="24" height="24" style="width: 24px; height: 24px;">
              <use xlink:href="../../ui/assets/icons/sprite.svg#arrow"/>
            </svg>
          </span>
        </span>
      </button>
    </div>
    <div class="grid auto-cols-min grid-flow-col items-end">
      <button aria-current="page" aria-label="Page 1" class="pagination-button is-selected base-button inline-flex appearance-none size-l pagination-button is-selected" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">1</span>
        </span>
      </button>
      <button aria-label="Page 2" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">2</span>
        </span>
      </button>
      <button aria-label="Page 3" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">3</span>
        </span>
      </button>
      <button aria-label="Page 4" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">4</span>
        </span>
      </button>
      <button aria-label="Page 5" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">5</span>
        </span>
      </button>
      <button aria-label="Page 6" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">6</span>
        </span>
      </button>
      <button aria-label="Page 7" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">7</span>
        </span>
      </button>
      <button aria-label="Page 8" class="pagination-button base-button inline-flex appearance-none size-l pagination-button" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">8</span>
        </span>
      </button>
      <span class="flex h-10 min-w-10 items-center justify-center px-2 py-2 text-body-l font-semibold tracking-[0] text-ui-gray-1" aria-hidden="true">...</span>
    </div>
    <div class="flex items-center justify-center">
      <button rel="next" class="-rotate-90 pagination-button base-button inline-flex appearance-none size-l -rotate-90 pagination-button" aria-label="Next page" type="button" target="_self">
        <span class="base-button__content">
          <span class="pagination-button__content">
            <svg class="svg-icon fill-current text-ui-gray-2" width="24" height="24" style="width: 24px; height: 24px;">
              <use xlink:href="../../ui/assets/icons/sprite.svg#arrow"/>
            </svg>
          </span>
        </span>
      </button>
    </div>
  </nav>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.pagination-button { background-color:transparent;border-radius:9999px;border-style:none;color:var(--color-ui-gray-1);font-size:16px;font-weight:600;height:2.5rem;isolation:isolate;line-height:24px;min-width:2.5rem;padding:.5rem;position:relative }
.pagination-button:before { background-color:var(--color-ui-gray-3);border-radius:9999px;top:0;right:0;bottom:0;left:0;opacity:0;pointer-events:none;position:absolute;transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);z-index:10;--tw-content:"";content:var(--tw-content) }
.pagination-button:hover:before { content:var(--tw-content);opacity:.1 }
.pagination-button:focus-visible { outline:2px solid transparent;outline-offset:2px;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.pagination-button:focus-visible:before { content:var(--tw-content);opacity:.1 }
.pagination-button:disabled { background-color:transparent;color:var(--color-ui-gray-4) }
.pagination-button__content { align-items:center;color:var(--color-ui-gray-2);display:inline-flex;height:1.5rem;justify-content:center;min-width:1.5rem }
.pagination-button .base-button__content { padding-left:0;padding-right:0 }
.pagination-button.is-status-focus:before,.pagination-button.is-status-hover:before { opacity:.1 }
.pagination-button.is-status-focus { --tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);--tw-ring-color:var(--color-ui-primary-60);--tw-ring-offset-width:2px;--tw-ring-offset-color:var(--color-ui-white) }
.pagination-button.is-selected,.pagination-button.is-selected .pagination-button__content { color:var(--color-ui-primary-accent) }
.pagination-button.is-selected:before { background-color:var(--color-ui-primary);opacity:.2 }
.pagination-button.is-status-disable,.pagination-button.is-status-disable .pagination-button__content { color:var(--color-ui-gray-4) }
.pagination-button.is-status-disable:before { opacity:0 }
.pagination-button .base-button__loader { color:var(--color-ui-primary) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-pagination/base-pagination.stories.ts`
- Storybook `career-web`: `common-navigation-basepagination--default`, `common-navigation-basepagination--middle-with-continuations`, `common-navigation-basepagination--short-range`
- CSS: секция `base-pagination-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Обёртка — `nav` с локализованным `aria-label`. Номер текущей страницы имеет `aria-current="page"`; `is-selected` остаётся только совместимым alias.

Состояния: `default`, `hover`, `focus-visible`, `pressed` (`:active`), `current` (`aria-current="page"`) и `disabled`. Кнопки перехода получают осмысленные `aria-label`; многоточие — `aria-hidden="true"`, не кнопка. После смены страницы фокус остаётся на инициировавшей кнопке, если навигация не заменила документ целиком.
