# ConversationsList · Список откликов

| | |
|---|---|
| **Категория** | Модуль: переписка |
| **Корневой класс** | `small-phone:pl-5`, `small-phone:pr-2`, `phablet-only:hidden` |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | частичная |
| **Snapshot Storybook** | 2 из 5 |

## Назначение

Левая колонка раздела откликов: шапка с поиском и фильтром, список карточек, пустые состояния.

## Анатомия

```
div.relative.flex.items-center.py-3.pl-6.pr-4.small-phone:pl-5.small-phone:pr-2.phablet-only:hidden
  div.m-0.flex-auto.text-display-xl.font-semibold  [aria-hidden="true"]
    · «Диалоги»
div.relative.hidden.items-center.gap-2.px-4.py-3.small-phone:hidden.phablet-only:flex.phablet-only:!border-0.phone:px-2
  button.hidden.h-10.w-10.items-center.justify-center.bg-transparent.p-0.text-icon-gray.phablet-only:flex.rotate-90.translate-x-0  [type="button"]
    span.visually-hidden
      · «Скрыть боковую панель»
    svg.svg-icon
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#arrow"]
  div.m-0.flex-auto.text-display-l.font-semibold  [aria-hidden="true"]
    · «Диалоги»
```

_Разметка story `conversations-layout-conversationssidebarheader--panel-open`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Слоты

- `search`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `sidebarIsOpen` | boolean | — | — | `boolean` |
| `update:sidebarIsOpen` | boolean | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:479px)`, `(min-width:480px) and (max-width:767px)`, `(max-width:767px)`.

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-hidden="true"`.

## Разметка

```html
<div class="relative flex items-center py-3 pl-6 pr-4 small-phone:pl-5 small-phone:pr-2 phablet-only:hidden">
  <div class="m-0 flex-auto text-display-xl font-semibold" aria-hidden="true">Диалоги</div>
</div>
<div class="relative hidden items-center gap-2 px-4 py-3 small-phone:hidden phablet-only:flex phablet-only:!border-0 phone:px-2">
  <button type="button" class="hidden h-10 w-10 items-center justify-center bg-transparent p-0 text-icon-gray phablet-only:flex rotate-90 translate-x-0">
    <span class="visually-hidden">Скрыть боковую панель</span>
    <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#arrow"/>
    </svg>
  </button>
  <div class="m-0 flex-auto text-display-l font-semibold" aria-hidden="true">Диалоги</div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.simplebar-content { padding:8px!important }
```

## Ограничения

- `ConversationsLayout` (3 story) сломан в самом Storybook — общая раскладка двух колонок не снята.
- Отдельные части (шапка, карточка, пустые состояния, каркас загрузки) сняты полностью.
- ЧЕГО НЕ ХВАТАЕТ: разметки внешней раскладки. Пропорции колонок замерены в production и лежат в `ui/layout.css`.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/conversations-sidebar-header.stories.ts`, `./src/components/conversations/conversations-layout.stories.ts`
- Storybook `career-web`: `conversations-layout-conversationssidebarheader--panel-open`, `conversations-layout-conversationssidebarheader--panel-collapsed`, `conversations-layout-conversationslayout--full-layout-no-conversation`, `conversations-layout-conversationslayout--full-layout-with-conversation`, `conversations-layout-conversationslayout--full-layout-narrow-sidebar`
- CSS: секция `conversations-sidebar` в `ui/components/navigation.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
