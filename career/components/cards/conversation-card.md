# ConversationCard · Карточка отклика

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | `conversation-card` |
| **CSS** | `ui/components/conversations.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 6 из 6 |

## Назначение

Строка списка откликов: собеседник, тема, последнее сообщение, время, счётчик непрочитанного, статус. Самый плотный по данным элемент Career.

## Анатомия

```
div.max-w-[320px]
  div.conversation-card.group/conversation-card.relative.max-w-full.overflow-hidden.rounded-xl.transition-colors
    div.absolute.right-[12px].top-1.z-10.transition-all.focus-within:translate-x-0.focus-within:transition-none.group-hover/conversation-card:translate-x-0.phone:translate-x-0.translate-x-12
      div.v-popper.v-popper--theme-dropdown
        button.m-0.flex.size-10.shrink-0.cursor-pointer.items-center.justify-center.rounded-full.border-none.bg-transparent.p-0.text-current.outline-2.outline-offset-2.outline-ui-primary-60.transition-colors.focus-visible:outline.disabled:cursor-default.text-ui-gray-2.hover:bg-ui-gray-3-10.hover:text-ui-gray-1.focus-visible:bg-ui-gray-3-10.h-10.w-10  [type="button"]
          svg.svg-icon
            use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#more"]
    a.conversation-card-link.flex.h-[64px].max-w-full.items-center.gap-2.overflow-hidden.rounded-xl.px-4.py-2.outline-ui-gray-2.hover:no-underline.focus-visible:outline.focus-visible:outline-2.focus-visible:-outline-offset-2  [href="/conversations/ivan-petrov"]
      img.user-avatar.user-avatar--rounded.flex-shrink-0.self-center
      div.w-[calc(100%-48px-8px)].max-w-[calc(100%-48px-8px)]
        div.flex.w-full.max-w-full.items-center.justify-between.gap-2.overflow-hidden.leading-md
          strong.shrink.overflow-hidden.text-ellipsis.whitespace-nowrap.text-body-l.text-font-black
            · «Иван Петров»
          span.phone:opacity-1.shrink-0.text-body-m.transition-opacity.group-focus-within/conversation-card:opacity-0.group-focus-within/conversation-card:transition-none.group-hover/conversation-card:opacity-0.phone:pr-11.phone:group-hover/conversation-card:opacity-100.shrink-0.text-ui-gray-3
            · «16:06»
        div.flex.w-full.max-w-full.items-center.justify-between.gap-2.overflow-hidden.text-body-l
          span.shrink.truncate.text-ui-gray-3
            · «Добрый день! Готов рассмотреть ваше пред…»
```

_Разметка story `conversations-list-conversationcard--with-read-messages`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `:hover`, `:not`.

```css
.conversation-card:not(:has(.conversation-card-link.active)):hover { background-color:var(--color-ui-gray-3-10) }
```

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `conversationOrFriend` | ConversationBrief \| ConversationFriend | — | — | `object` |
| `narrowView` | boolean | — | — | `boolean` |
| `changeSubject` | { subject: ConversationSubject; login: string } | — | — | `object` |
| `deleteConversation` | other | — | — | `object` |
| `updateConversation` | ConversationBrief | — | — | `object` |
| `markUnread` | string | — | — | `object` |
| `markRead` | string | — | — | `object` |
| `selectFriend` | string | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-20` | `color-mix(in srgb,var(--color-ui-primary) 20%,transparent)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#more` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:767px)`, `(min-width:480px) and (max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Карточка объявлена группой (`group/conversation-card`), поэтому действия появляются при наведении на всю строку, а не на отдельную кнопку.
- Раскладка — grid с явными колонками; на `tablet:` (≤1023px) колонок становится меньше, а строк больше.

## Разметка

```html
<div class="max-w-[320px]">
  <div class="conversation-card group/conversation-card relative max-w-full overflow-hidden rounded-xl transition-colors">
    <div class="absolute right-[12px] top-1 z-10 transition-all focus-within:translate-x-0 focus-within:transition-none group-hover/conversation-card:translate-x-0 phone:translate-x-0 translate-x-12">
      <div class="v-popper v-popper--theme-dropdown">
        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
            <use xlink:href="../../ui/assets/icons/sprite.svg#more"/>
          </svg>
        </button>
      </div>
    </div>
    <a href="/conversations/ivan-petrov" class="conversation-card-link flex h-[64px] max-w-full items-center gap-2 overflow-hidden rounded-xl px-4 py-2 outline-ui-gray-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2">
      <img class="user-avatar user-avatar--rounded flex-shrink-0 self-center" src="../../ui/assets/illustrations/avatar-default-user.svg" width="48" height="48" style="width: 48px; height: 48px;">
      <div class="w-[calc(100%-48px-8px)] max-w-[calc(100%-48px-8px)]">
        <div class="flex w-full max-w-full items-center justify-between gap-2 overflow-hidden leading-md">
          <strong class="shrink overflow-hidden text-ellipsis whitespace-nowrap text-body-l text-font-black">Иван Петров</strong>
          <span class="phone:opacity-1 shrink-0 text-body-m transition-opacity group-focus-within/conversation-card:opacity-0 group-focus-within/conversation-card:transition-none group-hover/conversation-card:opacity-0 phone:pr-11 phone:group-hover/conversation-card:opacity-100 shrink-0 text-ui-gray-3">16:06</span>
        </div>
        <div class="flex w-full max-w-full items-center justify-between gap-2 overflow-hidden text-body-l">
          <span class="shrink truncate text-ui-gray-3">Добрый день! Готов рассмотреть ваше предложение.</span>
        </div>
      </div>
    </a>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.conversation-card:not(:has(.conversation-card-link.active)):hover { background-color:var(--color-ui-gray-3-10) }
.conversation-card:has(.conversation-card-link.active) { background-color:var(--color-ui-primary-20) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/conversation-card.stories.ts`
- Storybook `career-web`: `conversations-list-conversationcard--with-read-messages`, `conversations-list-conversationcard--with-unread-messages`, `conversations-list-conversationcard--with-subject`, `conversations-list-conversationcard--with-company`, `conversations-list-conversationcard--friend`, `conversations-list-conversationcard--narrow-view`
- CSS: секция `conversation-card` в `ui/components/conversations.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
