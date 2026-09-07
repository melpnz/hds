# Section · BaseSection

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | `base-section` |
| **CSS** | `ui/components/cards.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Основная карточка Career. Ею обёрнуто почти всё содержимое страниц: блоки профиля, карточки листингов, боковые модули. Геометрия карточки — самый устойчивый факт системы: она одинакова в обеих реализациях Career.

## Анатомия

```
div.bg-ui-gray.p-8
  section.base-section.base-section--background-white.base-section--padding-medium.rounded-3xl
    h1.base-section__title.base-section__title--size-s.base-section__title--padding-medium
      · «Заголовок секции»
    · «Контент секции»
```

_Разметка story `common-layout-basesection--base-section-story`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Варианты

| Класс | Фон | Текст | Рамка |
|---|---|---|---|
| `base-section--background-white` | var(--color-ui-white) | — | — |
| `base-section--background-opacity-white` | #ffffffb3 | — | — |
| `base-section--padding-medium` | transparent | — | — |
| `base-section--padding-big` | transparent | — | — |
| `base-section--padding-modal-content` | transparent | — | — |
| `base-section--padding-list-section` | transparent | — | — |
| `base-section--padding-none` | transparent | — | — |

## Состояния

У статической Section собственных состояний нет. Опциональное сворачивание использует disclosure-контракт управляющей кнопки, а не состояние контейнера-карточки.

## Слоты

- `button`
- `subtitle`
- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `title` | string | — | — | `text` |
| `padding` | BaseSectionPadding | — | medium · none · modal-content · big · list-section | `select` |
| `titlePadding` | BaseSectionPadding | — | medium · none · modal-content · big · list-section | `select` |
| `background` | BaseSectionBackgroundStyle | `'white'` | white · opacity-white | `select` |
| `tag` | "h1" \| "h2" \| "h3" | `'h2'` | h1 · h2 · h3 | `select` |
| `titleSize` | BaseSectionTitleSize | — | — | `object` |
| `underlinedTitle` | boolean | — | — | `boolean` |
| `collapsable` | boolean | — | — | `boolean` |
| `isCollapsed` | boolean | `false` | — | `boolean` |
| `squareTop` | boolean | — | — | `boolean` |
| `borderless` | boolean | — | — | `boolean` |
| `toggle` | boolean | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray` | `#ccc` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Заголовок — часть компонента (`base-section__title`), а не свободная разметка внутри.
- Модификатор `--background-white` существует, потому что фон карточки не всегда белый.

## Разметка

```html
<div class="bg-ui-gray p-8">
  <section class="base-section base-section--background-white base-section--padding-medium rounded-3xl">
    <h1 class="base-section__title base-section__title--size-s base-section__title--padding-medium">Заголовок секции</h1>
    Контент секции
  </section>
</div>
```

## CSS

```css
.base-section { box-sizing:border-box }
:where(.base-section) { border-color:#182e391a;border-style:solid;border-width:1px;padding:1.5rem }
.base-section--background-white { background-color:var(--color-ui-white) }
.base-section--background-opacity-white { background-color:#ffffffb3 }
:where(.base-section--padding-medium) { padding:1rem }
:where(.base-section--padding-big) { padding:1.5rem }
:where(.base-section--padding-modal-content) { padding:14px }
:where(.base-section--padding-list-section) { padding-bottom:.75rem }
:where(.base-section--padding-none) { padding:0 }
.base-section__title { font-size:24px;font-weight:600;line-height:28px;margin:0 }
.base-section__title--size-l { font-size:28px;line-height:32px }
.base-section__title--size-s,.base-section__title--size-small { font-size:20px;line-height:24px }
.base-section__title--size-xs { font-size:18px;line-height:24px }
.base-section__title--size-title { font-size:16px;line-height:24px }
.base-section__title--collapsable { align-items:center;display:flex;justify-content:space-between }
.base-section__title--collapsable.base-section__title--padding-none { padding-left:0;padding-right:0 }
.base-section__title--underlined { border-bottom-width:1px;border-color:var(--color-ui-gray-bg);margin-bottom:1.5rem;padding-bottom:.75rem }
.base-section--padding-medium .base-section__title--underlined { margin-bottom:1rem }
.base-section__title--padding-none { padding:0 }
.base-section--padding-none .base-section__title--padding-big { padding:1rem }
.base-section__header { align-items:flex-start;display:flex;gap:1.25rem;justify-content:space-between;width:100% }
.base-section__arrow { flex-shrink:0;--tw-rotate:180deg;color:var(--color-icon-gray);cursor:pointer }
.base-section__arrow,.base-section__arrow--collapsed { transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) }
.base-section__arrow--collapsed { --tw-rotate:0deg }
@media (max-width:767px) {
  .base-section__header { flex-wrap:wrap;gap:.5rem }
}
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-section/base-section.stories.ts`
- Storybook `career-web`: `common-layout-basesection--base-section-story`
- CSS: секция `base-section` в `ui/components/cards.css`
- Production: замерено на 12 страницах в обеих реализациях (`../../../03-habr-career.md` §10)
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

Section — layout component: `section` используйте только когда есть доступный заголовок; иначе предпочтителен `div`. Уровень `h1`–`h3` выбирается по иерархии страницы, `titleSize` не должен определять semantic level.

При `collapsable=true` заголовок содержит реальный `button` с `aria-expanded` и `aria-controls`; тело следует контракту CollapsedContent. Клик по свободной области заголовка не заменяет доступную кнопку. Padding/background/title size — variants, не states.
