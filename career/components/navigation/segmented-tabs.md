# SegmentedTabs · Переключатель-таблетка

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | `overflow-x-auto` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Переключатель между несколькими равнозначными видами одного экрана: списком и картой, вкладками отклика, режимами отображения. В отличие от подчёркнутых вкладок не меняет раздел, а переключает представление.

## Анатомия

```
nav.overflow-x-auto  [aria-label="Вкладки"]
  div.relative.inline-flex.items-center.gap-0.rounded-full.p-1
    div.absolute.inset-0.rounded-full.bg-ui-gray-3.opacity-10
    a.relative.isolate.inline-flex.min-h-8.items-center.justify-center.gap-1.rounded-full.px-2.py-1.text-body-m.font-semibold.no-underline.transition-colors.hover:no-underline.text-ui-white.focus-visible:outline-none.after:pointer-events-none.after:absolute.after:-inset-1.after:z-[3].after:rounded-full.after:border-2.after:border-ui-primary.after:opacity-0.after:transition-opacity.after:content-[''].focus-visible:after:opacity-60  [aria-current="page" href="/tab-1"]
      span.relative.z-[2].inline-flex.min-h-6.items-center.px-1
        · «Tab»
      span.absolute.inset-0.z-[1].rounded-full.bg-ui-primary
    a.relative.isolate.inline-flex.min-h-8.items-center.justify-center.gap-1.rounded-full.px-2.py-1.text-body-m.font-semibold.no-underline.transition-colors.hover:no-underline.text-ui-gray-1.before:pointer-events-none.before:absolute.before:inset-0.before:z-[1].before:rounded-full.before:bg-ui-gray-3.before:opacity-0.before:transition-opacity.before:content-[''].hover:before:opacity-10.focus-visible:before:opacity-10.after:pointer-events-none.after:absolute.after:-inset-1.after:z-[3].after:rounded-full.after:border-2.after:border-ui-primary.after:opacity-0.after:transition-opacity.after:content-[''].focus-visible:after:opacity-60.focus-visible:outline-none.hover:no-underline  [href="/tab-2"]
      span.relative.z-[2].inline-flex.min-h-6.items-center.px-1
        · «Tab»
    a.relative.isolate.inline-flex.min-h-8.items-center.justify-center.gap-1.rounded-full.px-2.py-1.text-body-m.font-semibold.no-underline.transition-colors.hover:no-underline.text-ui-gray-1.before:pointer-events-none.before:absolute.before:inset-0.before:z-[1].before:rounded-full.before:bg-ui-gray-3.before:opacity-0.before:transition-opacity.before:content-[''].hover:before:opacity-10.focus-visible:before:opacity-10.after:pointer-events-none.after:absolute.after:-inset-1.after:z-[3].after:rounded-full.after:border-2.after:border-ui-primary.after:opacity-0.after:transition-opacity.after:content-[''].focus-visible:after:opacity-60.focus-visible:outline-none.hover:no-underline  [href="/tab-3"]
      span.relative.z-[2].inline-flex.min-h-6.items-center.px-1
        · «Tab»
```

_Разметка story `common-navigation-basesegmentedtabs--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Компонент собран utility-классами, поэтому состояния находятся в разметке, а не
в отдельной CSS-секции.

| Каноническое состояние | Подтверждение | Статус |
|---|---|---|
| `default` | обычная ссылка без `aria-current` | подтверждено разметкой |
| `hover` | `hover:before:opacity-10` | подтверждено разметкой |
| `focus-visible` | `focus-visible:after:opacity-60`, `focus-visible:outline-none` | подтверждено разметкой |
| `current` | `aria-current="page"`, белый текст на primary-подложке | подтверждено разметкой |
| `disabled` | `aria-disabled="true"` встречается в snapshot | частично: отдельный визуальный пример не снят |
| `pressed` | — | GAP: не подтверждено |
| `loading` | — | unsupported текущим Storybook API |

В Figma дополнительно встречаются `select`, `disable` и `loading`, но Figma здесь
используется только как evidence. В нормативном словаре это `selected`/`current`,
`disabled` и `loading`; переносить варианты без подтверждения runtime нельзя.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `tabs` | BaseSegmentedTab[] | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-current="page"`, `aria-disabled="true"`, `aria-label="Вкладки"`.

## Разметка

```html
<nav class="overflow-x-auto" aria-label="Вкладки">
  <div class="relative inline-flex items-center gap-0 rounded-full p-1">
    <div class="absolute inset-0 rounded-full bg-ui-gray-3 opacity-10"></div>
    <a aria-current="page" href="/tab-1" class="relative isolate inline-flex min-h-8 items-center justify-center gap-1 rounded-full px-2 py-1 text-body-m font-semibold no-underline transition-colors hover:no-underline text-ui-white focus-visible:outline-none after:pointer-events-none after:absolute after:-inset-1 after:z-[3] after:rounded-full after:border-2 after:border-ui-primary after:opacity-0 after:transition-opacity after:content-[''] focus-visible:after:opacity-60">
      <span class="relative z-[2] inline-flex min-h-6 items-center px-1">Tab</span>
      <span class="absolute inset-0 z-[1] rounded-full bg-ui-primary"></span>
    </a>
    <a href="/tab-2" class="relative isolate inline-flex min-h-8 items-center justify-center gap-1 rounded-full px-2 py-1 text-body-m font-semibold no-underline transition-colors hover:no-underline text-ui-gray-1 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-full before:bg-ui-gray-3 before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-10 focus-visible:before:opacity-10 after:pointer-events-none after:absolute after:-inset-1 after:z-[3] after:rounded-full after:border-2 after:border-ui-primary after:opacity-0 after:transition-opacity after:content-[''] focus-visible:after:opacity-60 focus-visible:outline-none hover:no-underline">
      <span class="relative z-[2] inline-flex min-h-6 items-center px-1">Tab</span>
    </a>
    <a href="/tab-3" class="relative isolate inline-flex min-h-8 items-center justify-center gap-1 rounded-full px-2 py-1 text-body-m font-semibold no-underline transition-colors hover:no-underline text-ui-gray-1 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-full before:bg-ui-gray-3 before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-10 focus-visible:before:opacity-10 after:pointer-events-none after:absolute after:-inset-1 after:z-[3] after:rounded-full after:border-2 after:border-ui-primary after:opacity-0 after:transition-opacity after:content-[''] focus-visible:after:opacity-60 focus-visible:outline-none hover:no-underline">
      <span class="relative z-[2] inline-flex min-h-6 items-center px-1">Tab</span>
    </a>
  </div>
</nav>
```

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами Tailwind.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-segmented-tabs.stories.ts`
- Storybook `career-web`: `common-navigation-basesegmentedtabs--default`, `common-navigation-basesegmentedtabs--with-counters`, `common-navigation-basesegmentedtabs--disabled-state`, `common-navigation-basesegmentedtabs--long-row`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Стабильные классы UI kit: `segmented-tabs` и `segmented-tabs__item`; utility-разметка Storybook остаётся источником визуальных размеров, но не API для нового кода.

Для навигации используйте `nav` + ссылки и `aria-current="page"` (`current`). Для переключения панели без URL используйте tabs pattern: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` и roving `tabindex`. Не смешивайте эти два паттерна.

Состояния: `default`, `hover`, `focus-visible`, `pressed`, `current`/`selected` (в зависимости от семантики) и `disabled`. Ссылка с `aria-disabled="true"` должна блокировать переход в обработчике.
