# ConversationHeader · Шапка переписки

| | |
|---|---|
| **Категория** | Модуль: переписка |
| **Корневой класс** | `max-w-full`, `small-phone:grid-cols-[24px_40px_1fr_40px]`, `phone:pl-4` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 9 из 9 |

## Назначение

Верхняя строка открытой переписки: собеседник, ссылка на компанию, отметка администратора, меню действий. Собрана из четырёх мелких компонентов.

## Анатомия

```
header.grid.max-w-full.grid-cols-[40px_minmax(0px,_1fr)_40px].items-center.gap-3.py-2.pl-6.pr-4.small-phone:grid-cols-[24px_40px_1fr_40px].phone:pl-4.phone:pr-2
  a.hidden.h-6.items-center.justify-center.bg-transparent.small-phone:flex  [href="/conversations"]
    svg.svg-icon.text-icon-gray
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#arrow-left-rounded"]
  a.h-10.w-10.shrink-0  [href="/ivan-petrov"]
    img.user-avatar.user-avatar--rounded
  div.grid.grid-cols-1.grid-rows-[24px_min-content].items-center.text-body-l
    div.flex.max-w-full.items-center.gap-x-2
      a.block.shrink.grow-0.overflow-hidden.text-ellipsis.whitespace-nowrap.font-semibold.text-font-black  [href="/ivan-petrov"]
        · «Иван Петров»
      div.flex.gap-x-1
    span.col-start-1.col-end-3.row-start-2.block.max-w-full.shrink.overflow-hidden.text-ellipsis.whitespace-nowrap.text-ui-gray-3
      · «Добрый день! Готов рассмотреть ваше пред…»
  div.h-10.w-10
```

_Разметка story `conversations-header-conversationheader--without-subject`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `conversation` | ConversationBrief | — | — | `object` |
| `showMarkUnread` | boolean | `false` | — | `boolean` |
| `triggerSize` | string \| undefined | — | — | `object` |
| `isOnDark` | boolean | — | — | `boolean` |
| `hide` | other | — | — | `object` |
| `show` | other | — | — | `object` |
| `updateConversation` | ConversationBrief | — | — | `object` |
| `changeSubject` | { login: string; subject: ConversationSubject } | — | — | `object` |
| `deleteConversation` | other | — | — | `object` |
| `markUnread` | string | — | — | `object` |
| `markRead` | string | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-purple-20` | `color-mix(in srgb,var(--color-ui-purple) 20%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow-left-rounded` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#more` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:479px)`, `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<header class="grid max-w-full grid-cols-[40px_minmax(0px,_1fr)_40px] items-center gap-3 py-2 pl-6 pr-4 small-phone:grid-cols-[24px_40px_1fr_40px] phone:pl-4 phone:pr-2">
  <a href="/conversations" class="hidden h-6 items-center justify-center bg-transparent small-phone:flex">
    <svg class="svg-icon text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#arrow-left-rounded"/>
    </svg>
  </a>
  <a class="h-10 w-10 shrink-0" href="/ivan-petrov">
    <img class="user-avatar user-avatar--rounded" src="../../ui/assets/illustrations/avatar-default-user.svg" width="40" height="40" style="width: 40px; height: 40px;">
  </a>
  <div class="grid grid-cols-1 grid-rows-[24px_min-content] items-center text-body-l">
    <div class="flex max-w-full items-center gap-x-2">
      <a class="block shrink grow-0 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-font-black" href="/ivan-petrov">Иван Петров</a>
      <div class="flex gap-x-1"></div>
    </div>
    <span class="col-start-1 col-end-3 row-start-2 block max-w-full shrink overflow-hidden text-ellipsis whitespace-nowrap text-ui-gray-3">Добрый день! Готов рассмотреть ваше предложение.</span>
  </div>
  <div class="h-10 w-10"></div>
</header>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: собрана утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/conversation-header.stories.ts`, `./src/components/conversations/conversation-company-link.stories.ts`, `./src/components/conversations/conversation-habr-admin-label.stories.ts`, `./src/components/conversations/conversation-context-menu.stories.ts`
- Storybook `career-web`: `conversations-header-conversationheader--without-subject`, `conversations-header-conversationheader--with-subject-link`, `conversations-header-conversationheader--with-company`, `conversations-header-conversationheader--career-staff`, `conversations-header-conversationcompanylink--default`, `conversations-header-conversationhabradminlabel--default`, `conversations-header-conversationcontextmenu--mark-as-unread`, `conversations-header-conversationcontextmenu--mark-as-read`, `conversations-header-conversationcontextmenu--with-complaint`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
