# Messages · Лента сообщений

| | |
|---|---|
| **Категория** | Модуль: переписка |
| **Корневой класс** | `block`, `last:mb-0`, `notification` |
| **CSS** | `ui/components/conversations.css` |
| **Живая реализация** | частичная |
| **Snapshot Storybook** | 15 из 49 |

## Назначение

Лента сообщений переписки: группировка по дням и отправителю, входящие и исходящие, вложения, время, статус доставки.

## Анатомия

```
a.mb-2.block.text-inherit.last:mb-0  [href="https://habrastorage.org/mock/report.pdf" target="_blank"]
  div.grid.items-center.gap-2.px-4.py-2.grid-cols-[40px_minmax(0,1fr)].!p-0
    div.uploading-animation.relative.h-10.w-10.overflow-hidden.rounded-lg.uploading-animation-finish.uploading-animation-just-present.bg-ui-red-second
      div.uploading-animation-conic.absolute.inset-0.m-auto.h-7.w-7.-scale-x-100.rounded-full
      div.absolute.left-1/2.top-1/2.max-w-[36px].-translate-x-1/2.-translate-y-1/2.transform.truncate.text-center.text-body-m.font-semibold.text-ui-white
        · «pdf»
    div.text-body-l
      div.grid.grid-cols-[minmax(0,min-content)_min-content]
        div.truncate
          · «report»
        div.whitespace-nowrap
          · «.pdf»
      div.flex.items-center.gap-1.text-body-m.text-ui-gray-2
        div.text-body-m
          · «2 MB»
span.block.text-body-m.text-font-gray
  · «Файл доступен 7 дней»
```

_Разметка story `conversations-messages-messageattachements--single-file`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `:first-child`, `:last-child`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `attachments` | FileUploadedByUser[] | — | — | — |
| `daysBeforeRemovalAttachments` | number | — | — | — |
| `didAttachmentsDelete` | boolean | — | — | — |
| `isMine` | boolean | — | — | — |
| `isLastMessageWithAttachments` | boolean | — | — | — |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-graph-cyan` | `#83d3fc` | из `:root` Career |
| `--color-ui-blue-accent` | `#0464d2` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |
| `--color-ui-red-second` | `var( --color-ui-red-light )` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#info` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<a href="https://habrastorage.org/mock/report.pdf" download="report.pdf" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg uploading-animation-finish uploading-animation-just-present bg-ui-red-second">
      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 0deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">pdf</div>
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">report</div>
        <div class="whitespace-nowrap">.pdf</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">2 MB</div>
      </div>
    </div>
  </div>
</a>
<span class="block text-body-m text-font-gray">Файл доступен 7 дней</span>
```

## CSS

```css
.conversation-messages .simplebar-content { padding:24px!important }
.message-body>p { margin:8px 0 }
.message-body>p:first-child { margin-top:0 }
.message-body>p:last-child { margin-bottom:0 }
```

## Ограничения

- Ядро ленты не снялось: `Messages` (25 story), `MessagesGroup` (3) и `ConversationMessages` (6) сломаны в самом Storybook Career — сборка не отдаёт чанки `-iqz-73v.js` и `-2YzXgxt.js` (оба 404).
- Снялись только периферийные части: вложения в сообщении, иконка статуса, время.
- CSS обеих сломанных секций сохранён, но он крошечный (66 и 114 байт): пузырь сообщения собран утилитами, из CSS не восстанавливается.
- ЧЕГО НЕ ХВАТАЕТ: разметки одного входящего и одного исходящего сообщения, разделителя дня и метки непрочитанных. Достаточно одного snapshot страницы `/conversations` production.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/messages/messages.stories.ts`, `./src/components/conversations/messages-group.stories.ts`, `./src/components/conversations/conversation-messages.stories.ts`, `./src/components/conversations/messages/message-attachements.stories.ts`, `./src/components/conversations/message-status-icon.stories.ts`, `./src/components/conversations/message-time.stories.ts`
- Storybook `career-web`: `conversations-messages-messages--user-incoming`, `conversations-messages-messages--user-outgoing`, `conversations-messages-messages--changed-subject`, `conversations-messages-messages--job-invite`, `conversations-messages-messages--question-with-buttons`, `conversations-messages-messages--question-answered`, `conversations-messages-messages--consultation-confirmation-with-buttons`, `conversations-messages-messages--consultation-confirmation-without-buttons`, `conversations-messages-messages--consultation-confirmed`, `conversations-messages-messages--consultation-rejected`, `conversations-messages-messages--consultation-cancelled`, `conversations-messages-messages--consultation-status-check-with-buttons`, `conversations-messages-messages--consultation-status-check-without-buttons`, `conversations-messages-messages--consultation-completed-with-rate-button`, `conversations-messages-messages--consultation-completed-already-rated`, `conversations-messages-messages--consultation-rated`, `conversations-messages-messages--test-requested-with-buttons`, `conversations-messages-messages--test-requested-without-buttons`, `conversations-messages-messages--test-rejected`, `conversations-messages-messages--test-passed`, `conversations-messages-messages--test-hidden`, `conversations-messages-messages--screening-recommendation`, `conversations-messages-messages--current-date`, `conversations-messages-messages--past-date`, `conversations-messages-messages--unread-label`, `conversations-messages-messagesgroup--with-user-messages`, `conversations-messages-messagesgroup--with-unread-label`, `conversations-messages-messagesgroup--yesterday-group`, `conversations-messages-conversationmessages--loading`, `conversations-messages-conversationmessages--empty`, `conversations-messages-conversationmessages--default`, `conversations-messages-conversationmessages--unread`, `conversations-messages-conversationmessages--load-more-pending`, `conversations-messages-conversationmessages--refresh-pending`, `conversations-messages-messageattachements--single-file`, `conversations-messages-messageattachements--multiple-files`, `conversations-messages-messageattachements--deleted-today`, `conversations-messages-messageattachements--storage-expired`, `conversations-messages-messageattachements--with-security-notice`, `conversations-messages-messageattachements--all-file-types`, `conversations-messages-messageattachements--my-files`, `conversations-messages-messagestatusicon--mine-read`, `conversations-messages-messagestatusicon--mine-unread`, `conversations-messages-messagestatusicon--not-mine`, `conversations-messages-messagetime--today`, `conversations-messages-messagetime--yesterday`, `conversations-messages-messagetime--this-year`, `conversations-messages-messagetime--last-year`, `conversations-messages-messagetime--time-only`
- CSS: секция `conversation-messages` в `ui/components/conversations.css`, секция `messages-group` в `ui/components/conversations.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
