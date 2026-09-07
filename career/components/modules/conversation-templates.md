# ConversationsTemplates · Шаблоны ответов

| | |
|---|---|
| **Категория** | Модуль: переписка |
| **Корневой класс** | `size-10`, `shrink-0`, `cursor-pointer` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 8 из 8 |

## Назначение

Шаблоны ответов работодателя: список, шапка со счётчиком, форма создания и редактирования.

## Анатомия

```
button.m-0.flex.size-10.shrink-0.cursor-pointer.items-center.justify-center.rounded-full.border-none.bg-transparent.p-0.text-current.outline-2.outline-offset-2.outline-ui-primary-60.transition-colors.focus-visible:outline.disabled:cursor-default.text-ui-gray-2.hover:bg-ui-gray-3-10.hover:text-ui-gray-1.focus-visible:bg-ui-gray-3-10  [type="button"]
  svg.h-6.w-6
    rect
    rect
    rect
    rect
```

_Разметка story `conversations-templates-conversationstemplates--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `templates` | ConversationsTemplate[] | — | — | `object` |
| `noTemplates` | boolean | — | — | `boolean` |
| `isLoading` | boolean | — | — | `boolean` |
| `loadMore` | other | — | — | `object` |
| `selectTemplate` | ConversationsTemplate | — | — | `object` |
| `editTemplate` | ConversationsTemplate | — | — | `object` |
| `deleteTemplate` | ConversationsTemplate | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#edit_new` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#more` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#plus` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#trash` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-disabled="false"`, `aria-label="scrollable content"`, `role="region"`, `tabindex="0"`, `tabindex="1"`.

## Разметка

```html
<button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="h-6 w-6">
    <rect x="6" y="7" width="8" height="2" fill="currentColor"/>
    <rect x="6" y="11" width="12" height="2" fill="currentColor"/>
    <rect x="6" y="15" width="12" height="2" fill="currentColor"/>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>
```

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: собраны утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/templates/conversations-templates.stories.ts`, `./src/components/conversations/templates/conversations-templates-list.stories.ts`, `./src/components/conversations/templates/conversations-templates-header.stories.ts`, `./src/components/conversations/templates/conversations-template-form.stories.ts`
- Storybook `career-web`: `conversations-templates-conversationstemplates--default`, `conversations-templates-conversationstemplateslist--with-templates`, `conversations-templates-conversationstemplateslist--loading`, `conversations-templates-conversationstemplateslist--empty`, `conversations-templates-conversationstemplateslist--loading-more`, `conversations-templates-conversationstemplatesheader--default`, `conversations-templates-conversationstemplateform--create-form`, `conversations-templates-conversationstemplateform--edit-form`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
