# FilterButton · Кнопка фильтра

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `filter-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Кнопка открытия фильтра со счётчиком выбранных значений. Основной элемент управления в листингах вакансий, резюме и компаний.

## Анатомия

```
button.filter-button.is-panel.base-button.inline-flex.appearance-passive.size-l.has-before.has-after.is-sizeable.filter-button.is-panel  [type="button" target="_self"]
  span.base-button__inner
    span.base-button__before
      svg.svg-icon.filter-button__icon
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#filter"]
    span.base-button__content
      · «Фильтры»
    span.base-button__after
      span.filter-button__badge.filter-button__badge--count
        · «0»
```

_Разметка story `common-buttons-filterbutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Совместимость |
|---|---|---|
| `default` | без state-атрибутов; для chip — `aria-pressed="false"` | `.is-chip-inactive` |
| `hover` | `:hover` | наследуется от Button |
| `focus-visible` | `:focus-visible` | наследуется от Button |
| `pressed` | `:active` | `.is-pressed` только для story |
| `selected` | `aria-pressed="true"` только для chip-варианта | `.is-chip-active` |
| `disabled` | нативный `disabled` | badge получает disabled-представление |
| `loading` | `.is-loading` + `aria-busy="true"` | loader из Button |

Panel-вариант, открывающий фильтры, использует `aria-expanded`, а не selected.
`is-chip-active` остаётся legacy CSS alias и не является названием публичного
состояния.

Подтверждены CSS и разметкой: `.filter-button__badge--disabled`, `.has-after`, `.has-before`, `.is-chip`, `.is-chip-active`, `.is-chip-inactive`, `.is-panel`, `.is-sizeable`, `:focus`, `:hover`.

```css
.filter-button.is-chip:focus-visible { border-radius:9999px!important }
.filter-button.is-chip.is-chip-active,.filter-button.is-chip.is-chip-active:focus,.filter-button.is-chip.is-chip-active:hover { background-color:var(--color-ui-primary-20)!important }
```

## Слоты

- `before`
- `default`
- `after`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `label` | string | — | — | `text` |
| `badge` | string \| number \| null | — | — | `object` |
| `badgeVariant` | BadgeVariant | `'count'` | count · dot | `radio` |
| `disabled` | boolean \| null | — | true · false | `radio` |
| `loading` | boolean | `false` | true · false | `radio` |
| `to` | RouteLocationRaw | — | — | `object` |
| `href` | string | — | — | `text` |
| `type` | ButtonType | `'button'` | — | `object` |
| `target` | "_blank" \| "_self" | `'_self'` | — | `object` |
| `fullWidth` | boolean | `false` | — | `boolean` |
| `variant` | FilterButtonVariant | `'panel'` | — | `object` |
| `active` | boolean | `false` | — | `boolean` |
| `size` | BaseButtonSize | `'l'` | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-20` | `color-mix(in srgb,var(--color-ui-primary) 20%,transparent)` | из `:root` Career |
| `--color-ui-primary-accent` | `#5014f5` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#filter` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Счётчик показывается двумя способами: числом (`__badge--count`) и точкой (`__badge--dot`), когда число не важно.
- Форма чипа включается классами `is-chip` / `is-chip-inactive` — так кнопка встраивается в ряд фильтров.

## Разметка

```html
<button class="filter-button is-panel base-button inline-flex appearance-passive size-l has-before has-after is-sizeable filter-button is-panel" type="button" target="_self">
  <span class="base-button__inner">
    <span class="base-button__before">
      <svg class="svg-icon filter-button__icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#filter"/>
      </svg>
    </span>
    <span class="base-button__content">Фильтры</span>
    <span class="base-button__after">
      <span class="filter-button__badge filter-button__badge--count">0</span>
    </span>
  </span>
</button>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.filter-button { min-height:unset!important }
.filter-button__icon { color:var(--color-ui-gray-2) }
.filter-button.is-chip { border-radius:9999px!important;height:2rem!important;padding:.25rem .5rem!important }
.filter-button.is-chip:focus-visible { border-radius:9999px!important }
.filter-button.is-chip.is-chip-active { border-color:transparent!important;color:var(--color-ui-primary-accent)!important }
.filter-button.is-chip.is-chip-active,.filter-button.is-chip.is-chip-active:focus,.filter-button.is-chip.is-chip-active:hover { background-color:var(--color-ui-primary-20)!important }
.filter-button.is-chip.is-chip-inactive { background-color:transparent!important;border-color:var(--color-ui-gray-5)!important;color:var(--color-ui-gray-1)!important }
.filter-button.is-chip .base-button__content { font-size:14px;font-weight:400;line-height:20px }
.filter-button__badge { align-items:center;background-color:var(--color-ui-primary);border-radius:9999px;color:var(--color-ui-white);display:inline-flex;font-weight:600;justify-content:center;text-align:center }
.filter-button__badge--count { font-size:11px;height:1.25rem;line-height:16px;min-width:1.25rem;padding-left:.25rem;padding-right:.25rem }
.filter-button__badge--dot { height:.75rem;width:.75rem }
.filter-button__badge--disabled { background-color:var(--color-ui-gray-5);color:var(--color-ui-white) }
.filter-button .base-button__loader { color:var(--color-ui-gray-2) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/filter-button/filter-button.stories.ts`
- Storybook `career-web`: `common-buttons-filterbutton--default`, `common-buttons-filterbutton--dot-badge`
- CSS: секция `filter-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
