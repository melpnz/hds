# Приложение: остальная разметка

В витрине и спецификациях показана разметка 199 story из 243.
Здесь — оставшиеся 44. Это не другие компоненты, а другие состояния
и наборы данных уже описанных: полные и неполные карточки, роли, исходы процессов.

Файл существует ровно для одного: чтобы после удаления `_sources/career/`
в пакете не потерялось ни одного снятого snapshot DOM.

Ссылки на иконки и изображения переписаны на локальные пути пакета.
Vue-скоуп `data-v-*` снят.

## Common/Buttons/BaseButton

### Обычная кнопка

`common-buttons-basebutton--primary-button` · `./src/components/common/base-button/base-button.stories.ts`

```html
<button href type="button" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable">
  <span class="base-button__inner">
    <span class="base-button__content">Button</span>
  </span>
</button>
```

## Common/Buttons/GhostButton

### С иконкой

`common-buttons-ghostbutton--with-icon` · `./src/components/common/ghost-button/ghost-button.stories.ts`

```html
<button class="ghost-button base-button inline-flex appearance-none size-m has-before is-sizeable ghost-button" type="button" target="_self">
  <span class="base-button__inner">
    <span class="base-button__before">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../ui/assets/icons/sprite.svg#question-circle"/>
      </svg>
    </span>
    <span class="base-button__content">Button</span>
  </span>
</button>
```

## Common/ContextMenu/Default

### Можно передать кастомный тогл в слот

`common-contextmenu-default--context-menu-custom-toggle` · `./src/components/common/context-menu/context-menu.stories.ts`

```html
<div class="flex h-40 w-full items-center justify-center">
  <div class="context-menu w-6">
    <div class="base-dropdown">
      <div class="base-dropdown__toggle">
        <button class="gap-2 base-button inline-flex appearance-menu size-m has-before is-sizeable gap-2" type="button" target="_self">
          <span class="base-button__inner">
            <span class="base-button__before">
              <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                <use xlink:href="../ui/assets/icons/sprite.svg#plus"/>
              </svg>
            </span>
            <span class="base-button__content">Add item</span>
          </span>
        </button>
      </div>
      <div class="base-dropdown__content base-dropdown__content--alignment-right" style="margin-top: 0px;">
        <div class="context-menu__content">
          <button class="w-full cursor-pointer overflow-hidden whitespace-nowrap text-left border-b border-solid border-ui-gray-bg bg-transparent px-4 py-[10px] text-font-black hover:bg-ui-blue hover:text-ui-white active:bg-ui-blue active:text-ui-white focus:outline-3 focus:outline focus:-outline-offset-1 focus:outline-[var(--color-ui-blue)]">Item 1</button>
          <button class="w-full cursor-pointer overflow-hidden whitespace-nowrap text-left border-b border-solid border-ui-gray-bg bg-transparent px-4 py-[10px] text-font-black hover:bg-ui-blue hover:text-ui-white active:bg-ui-blue active:text-ui-white focus:outline-3 focus:outline focus:-outline-offset-1 focus:outline-[var(--color-ui-blue)]">Item 2</button>
          <button class="w-full cursor-pointer overflow-hidden whitespace-nowrap text-left border-b border-solid border-ui-gray-bg bg-transparent px-4 py-[10px] text-font-black hover:bg-ui-blue hover:text-ui-white active:bg-ui-blue active:text-ui-white focus:outline-3 focus:outline focus:-outline-offset-1 focus:outline-[var(--color-ui-blue)]">Item 3</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Common/ContextMenu/Isomorphic

### Можем передать кастомный тогл для адаптивного контекстного меню

`common-contextmenu-isomorphic--isomorphic-context-custom-toggle` · `./src/components/common/context-menu/isomorphic-context-menu/isomorphic-context-menu.stories.ts`

```html
<div class="flex w-full items-center justify-center">
  <div class="v-popper v-popper--theme-dropdown">
    <button class="rounded-full !p-1 filter-button is-panel base-button inline-flex appearance-passive size-l has-before is-sizeable rounded-full !p-1 filter-button is-panel" type="button" target="_self">
      <span class="base-button__inner">
        <span class="base-button__before">
          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
            <use xlink:href="../ui/assets/icons/sprite.svg#settings"/>
          </svg>
        </span>
      </span>
    </button>
  </div>
</div>
```

## Conversations/Files/ConversationAttachedFilePresenter

### Ошибка загрузки

`conversations-files-conversationattachedfilepresenter--with-error` · `./src/components/conversations/files/conversation-attached-file-presenter.stories.ts`

```html
<div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)_24px]">
  <div class="flex h-10 w-10 items-center justify-center rounded border border-ui-red bg-transparent p-0">
    <svg class="svg-icon text-ui-red" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#minus-circle"/>
    </svg>
  </div>
  <div class="text-body-l">
    <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
      <div class="truncate">document</div>
      <div class="whitespace-nowrap">.docx</div>
    </div>
    <div class="text-ui-red">Файл не был загружен</div>
  </div>
  <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
    <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#cross"/>
    </svg>
  </button>
</div>
```

### Отображение без кнопки удаления

`conversations-files-conversationattachedfilepresenter--just-present` · `./src/components/conversations/files/conversation-attached-file-presenter.stories.ts`

```html
<div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)]">
  <div class="relative h-10 w-10 overflow-hidden rounded-lg">
    <img src="../ui/assets/images/c4fd6591ef556314de32989d486876ad.jpg" class="block h-full w-full object-contain" alt="Превью загруженного изображения screenshot.jpg">
  </div>
  <div class="text-body-l">
    <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
      <div class="truncate">screenshot</div>
      <div class="whitespace-nowrap">.jpg</div>
    </div>
    <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
      <div class="text-body-m">2 KB</div>
    </div>
  </div>
</div>
```

## Conversations/Files/ConversationAttachedFileUploader

### Ошибка загрузки

`conversations-files-conversationattachedfileuploader--with-error` · `./src/components/conversations/files/conversation-attached-file-uploader.stories.ts`

```html
<div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)_24px]" icon-special-state="uploadedWithErrors">
  <div class="flex h-10 w-10 items-center justify-center rounded border border-ui-red bg-transparent p-0">
    <svg class="svg-icon text-ui-red" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#minus-circle"/>
    </svg>
  </div>
  <div class="text-body-l">
    <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
      <div class="truncate">document</div>
      <div class="whitespace-nowrap">.docx</div>
    </div>
    <div class="text-ui-red">Файл не был загружен</div>
  </div>
  <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
    <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#cross"/>
    </svg>
  </button>
</div>
```

## Conversations/Files/ConversationFilesCatcher

### Неактивный (файлы не перетаскиваются)

`conversations-files-conversationfilescatcher--inactive` · `./src/components/conversations/files/conversation-files-catcher.stories.ts`

```html
<div class="h-[400px] relative">
  <div class="relative h-full">Область диалога</div>
</div>
```

### Активный (файлы над окном)

`conversations-files-conversationfilescatcher--active` · `./src/components/conversations/files/conversation-files-catcher.stories.ts`

```html
<div class="h-[400px] relative">
  <div class="relative h-full">
    <div class="absolute bottom-0 left-0 right-0 top-0 z-50 bg-ui-white p-6 tablet:p-4">
      <div class="flex h-full w-full flex-col items-center justify-center rounded-lg border text-center transition-all border-dashed border-icon-gray">
        <img src="../ui/assets/illustrations/no-photo.svg" alt="Изображение папки с файлами" width="96" height="96">
        <b class="mb-[2px] mt-4 block text-title font-semibold">Перенесите файлы&nbsp;сюда</b>
        <span class="text-body-m text-font-gray">Максимум 5 файлов (до&nbsp;20&nbsp;MB&nbsp;каждый)</span>
      </div>
    </div>
    Область диалога
  </div>
</div>
```

## Conversations/Header/ConversationContextMenu

### Mark As Unread

`conversations-header-conversationcontextmenu--mark-as-unread` · `./src/components/conversations/conversation-context-menu.stories.ts`

```html
<div class="flex h-48 items-start justify-end p-4">
  <div class="v-popper v-popper--theme-dropdown">
    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
      </svg>
    </button>
  </div>
</div>
```

### Mark As Read

`conversations-header-conversationcontextmenu--mark-as-read` · `./src/components/conversations/conversation-context-menu.stories.ts`

```html
<div class="flex h-48 items-start justify-end p-4">
  <div class="v-popper v-popper--theme-dropdown">
    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
      </svg>
    </button>
  </div>
</div>
```

### With Complaint

`conversations-header-conversationcontextmenu--with-complaint` · `./src/components/conversations/conversation-context-menu.stories.ts`

```html
<div class="flex h-48 items-start justify-end p-4">
  <div class="v-popper v-popper--theme-dropdown">
    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
      </svg>
    </button>
  </div>
</div>
```

## Conversations/List/NoConversations

### Компактный вид

`conversations-list-noconversations--narrow-view` · `./src/components/conversations/no-conversations.stories.ts`

```html
<div class="hidden phablet-only:block">
  <img src="../ui/assets/illustrations/no-conversations.svg" alt="Нет диалогов" width="48" height="48" class="ml-4 mt-3">
</div>
<div class="h-full pb-[44px] phablet-only:hidden">
  <div class="empty-placeholder empty-placeholder--fullWidth empty-placeholder--noBorder empty-placeholder--fullHeight">
    <img src="../ui/assets/illustrations/no-conversations.svg" alt width="96" height="96" class="empty-placeholder__image">
    <div class="empty-placeholder__title">Нет диалогов</div>
    <div class="empty-placeholder__description">Вы можете найти собеседников в списке специалистов.</div>
    <div class="empty-placeholder__actions">
      <a href="#" data-href="/resumes" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable">
        <span class="base-button__inner">
          <span class="base-button__content">В раздел специалистов</span>
        </span>
      </a>
    </div>
  </div>
</div>
```

## Conversations/List/NoConversationsFound

### Компактный вид

`conversations-list-noconversationsfound--narrow-view` · `./src/components/conversations/no-conversations-found.stories.ts`

```html
<div class="hidden phablet-only:block">
  <img src="../ui/assets/icons/no-results.svg" alt="Диалоги не найдены" width="48" height="48" class="ml-4 mt-3">
</div>
<div class="h-full pb-[44px] phablet-only:hidden">
  <div class="empty-placeholder empty-placeholder--fullWidth empty-placeholder--fullHeight">
    <img src="../ui/assets/icons/no-results.svg" alt width="96" height="96" class="empty-placeholder__image">
    <div class="empty-placeholder__title">Диалоги не найдены</div>
    <div class="empty-placeholder__description">Мы не нашли диалоги, которые бы соответствовали этому запросу. Попробуйте изменить условия поиска.</div>
  </div>
</div>
```

## Conversations/Messages/ConversationFloatButton

### Кнопка обновления (наверху)

`conversations-messages-conversationfloatbutton--refresh-top` · `./src/components/conversations/conversation-float-button.stories.ts`

```html
<button type="button" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ui-white p-0 shadow-float-element">
  <svg class="svg-icon text-ui-gray-2" width="24" height="24" style="width: 24px; height: 24px;">
    <use xlink:href="../ui/assets/icons/sprite.svg#update"/>
  </svg>
</button>
```

### Кнопка прокрутки вниз

`conversations-messages-conversationfloatbutton--scroll-down` · `./src/components/conversations/conversation-float-button.stories.ts`

```html
<button type="button" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ui-white p-0 shadow-float-element">
  <svg class="svg-icon text-ui-gray-2" width="24" height="24" style="width: 24px; height: 24px;">
    <use xlink:href="../ui/assets/icons/sprite.svg#arrow-down"/>
  </svg>
</button>
```

### Кнопка с непрочитанными

`conversations-messages-conversationfloatbutton--with-unread` · `./src/components/conversations/conversation-float-button.stories.ts`

```html
<button type="button" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ui-white p-0 shadow-float-element">
  <span class="unread-counter inline-flex h-5 min-w-[20px] items-center justify-center rounded-[22px] border-2 border-ui-white bg-ui-primary px-[5px] text-center text-unread font-semibold leading-unread text-ui-white min-w-5 absolute -top-[10px]">5</span>
  <svg class="svg-icon text-ui-gray-2" width="24" height="24" style="width: 24px; height: 24px;">
    <use xlink:href="../ui/assets/icons/sprite.svg#arrow-down"/>
  </svg>
</button>
```

### Загрузка

`conversations-messages-conversationfloatbutton--loading` · `./src/components/conversations/conversation-float-button.stories.ts`

```html
<button type="button" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ui-white p-0 shadow-float-element" disabled>
  <svg class="svg-icon text-ui-gray-2 animate-spin" width="24" height="24" style="width: 24px; height: 24px;">
    <use xlink:href="../ui/assets/icons/sprite.svg#arrow-down"/>
  </svg>
</button>
```

## Conversations/Messages/MessageAttachements

### Несколько файлов

`conversations-messages-messageattachements--multiple-files` · `./src/components/conversations/messages/message-attachements.stories.ts`

```html
<a href="https://habrastorage.org/webt/c4/fd/65/c4fd6591ef556314de32989d486876ad.jpg" download="screenshot.jpg" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="relative h-10 w-10 overflow-hidden rounded-lg">
      <img src="../ui/assets/images/c4fd6591ef556314de32989d486876ad.jpg" class="block h-full w-full object-contain" alt="Превью загруженного изображения screenshot.jpg">
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">screenshot</div>
        <div class="whitespace-nowrap">.jpg</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">2 KB</div>
      </div>
    </div>
  </div>
</a>
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
<a href="https://habrastorage.org/mock/document.docx" download="document.docx" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg uploading-animation-finish uploading-animation-just-present bg-graph-cyan">
      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 0deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">docx</div>
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">document</div>
        <div class="whitespace-nowrap">.docx</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">800 KB</div>
      </div>
    </div>
  </div>
</a>
<span class="block text-body-m text-font-gray">Файлы доступны 7 дней</span>
```

### Истёк срок хранения

`conversations-messages-messageattachements--storage-expired` · `./src/components/conversations/messages/message-attachements.stories.ts`

```html
<div class="flex items-center gap-1 text-body-m text-ui-gray-3">
  <svg class="h-6 w-6 flex-shrink-0 fill-font-gray" width="24" height="24" viewBox="0 0 24 24">
    <path d="M8 16H16V18H8V16ZM8 12H16V14H8V12ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
  </svg>
  <div>Истек срок хранения файлов</div>
</div>
```

### Все категории файлов

`conversations-messages-messageattachements--all-file-types` · `./src/components/conversations/messages/message-attachements.stories.ts`

```html
<a href="https://habrastorage.org/webt/c4/fd/65/c4fd6591ef556314de32989d486876ad.jpg" download="screenshot.jpg" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="relative h-10 w-10 overflow-hidden rounded-lg">
      <img src="../ui/assets/images/c4fd6591ef556314de32989d486876ad.jpg" class="block h-full w-full object-contain" alt="Превью загруженного изображения screenshot.jpg">
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">screenshot</div>
        <div class="whitespace-nowrap">.jpg</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">2 KB</div>
      </div>
    </div>
  </div>
</a>
<a href="https://habrastorage.org/mock/data.xlsx" download="data.xlsx" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg uploading-animation-finish uploading-animation-just-present bg-ui-green">
      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 0deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">xlsx</div>
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">data</div>
        <div class="whitespace-nowrap">.xlsx</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">1 MB</div>
      </div>
    </div>
  </div>
</a>
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
<a href="https://habrastorage.org/mock/document.docx" download="document.docx" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg uploading-animation-finish uploading-animation-just-present bg-graph-cyan">
      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 0deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">docx</div>
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">document</div>
        <div class="whitespace-nowrap">.docx</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">800 KB</div>
      </div>
    </div>
  </div>
</a>
<a href="https://habrastorage.org/mock/archive.zip" download="archive.zip" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg uploading-animation-finish uploading-animation-just-present bg-ui-orange">
      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 0deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">zip</div>
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">archive</div>
        <div class="whitespace-nowrap">.zip</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">5 MB</div>
      </div>
    </div>
  </div>
</a>
<span class="block text-body-m text-font-gray">Файлы доступны 7 дней</span>
```

### Мои файлы (без уведомления)

`conversations-messages-messageattachements--my-files` · `./src/components/conversations/messages/message-attachements.stories.ts`

```html
<a href="https://habrastorage.org/webt/c4/fd/65/c4fd6591ef556314de32989d486876ad.jpg" download="screenshot.jpg" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="relative h-10 w-10 overflow-hidden rounded-lg">
      <img src="../ui/assets/images/c4fd6591ef556314de32989d486876ad.jpg" class="block h-full w-full object-contain" alt="Превью загруженного изображения screenshot.jpg">
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">screenshot</div>
        <div class="whitespace-nowrap">.jpg</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">2 KB</div>
      </div>
    </div>
  </div>
</a>
<a href="https://habrastorage.org/mock/document.docx" download="document.docx" target="_blank" class="mb-2 block text-inherit last:mb-0">
  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)] !p-0">
    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg uploading-animation-finish uploading-animation-just-present bg-graph-cyan">
      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 0deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">docx</div>
    </div>
    <div class="text-body-l">
      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
        <div class="truncate">document</div>
        <div class="whitespace-nowrap">.docx</div>
      </div>
      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
        <div class="text-body-m">800 KB</div>
      </div>
    </div>
  </div>
</a>
<span class="block text-body-m text-font-gray">Файлы доступны 14 дней</span>
```

## Conversations/Messages/MessageStatusIcon

### Моё, прочитано (зелёная двойная галочка)

`conversations-messages-messagestatusicon--mine-read` · `./src/components/conversations/message-status-icon.stories.ts`

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M18.0002 6.99984L16.5902 5.58984L10.2502 11.9298L11.6602 13.3398L18.0002 6.99984ZM22.2402 5.58984L11.6602 16.1698L7.48016 11.9998L6.07016 13.4098L11.6602 18.9998L23.6602 6.99984L22.2402 5.58984ZM0.410156 13.4098L6.00016 18.9998L7.41016 17.5898L1.83016 11.9998L0.410156 13.4098Z" fill="#64C178"/>
</svg>
```

### Моё, не прочитано (серая одиночная галочка)

`conversations-messages-messagestatusicon--mine-unread` · `./src/components/conversations/message-status-icon.stories.ts`

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M9.00039 16.1996L4.80039 11.9996L3.40039 13.3996L9.00039 18.9996L21.0004 6.99961L19.6004 5.59961L9.00039 16.1996Z" fill="var(--color-ui-gray-4)"/>
</svg>
```

### Не моё (ничего не отображается)

`conversations-messages-messagestatusicon--not-mine` · `./src/components/conversations/message-status-icon.stories.ts`

```html
<div>
  <div id="context-menu-target"></div>
  <div id="modal-target"></div>
</div>
```

## Conversations/Messages/MessageTime

### Сегодня (только время)

`conversations-messages-messagetime--today` · `./src/components/conversations/message-time.stories.ts`

```html
<span class="shrink-0 text-ui-gray-3">16:08</span>
```

### Вчера

`conversations-messages-messagetime--yesterday` · `./src/components/conversations/message-time.stories.ts`

```html
<span class="shrink-0 text-ui-gray-3">вчера</span>
```

### В этом году (дата и месяц)

`conversations-messages-messagetime--this-year` · `./src/components/conversations/message-time.stories.ts`

```html
<span class="shrink-0 text-ui-gray-3">15 фев</span>
```

### В прошлом году

`conversations-messages-messagetime--last-year` · `./src/components/conversations/message-time.stories.ts`

```html
<span class="shrink-0 text-ui-gray-3">ноя 2024</span>
```

### Только время (onlyTime)

`conversations-messages-messagetime--time-only` · `./src/components/conversations/message-time.stories.ts`

```html
<span class="shrink-0 text-ui-gray-3">15:00</span>
```

## Conversations/Templates/ConversationsTemplateForm

### Новый шаблон

`conversations-templates-conversationstemplateform--create-form` · `./src/components/conversations/templates/conversations-template-form.stories.ts`

```html
<div class="min-h-[500px]"></div>
```

### Редактирование шаблона

`conversations-templates-conversationstemplateform--edit-form` · `./src/components/conversations/templates/conversations-template-form.stories.ts`

```html
<div class="min-h-[500px]"></div>
```

## Conversations/Templates/ConversationsTemplatesList

### Список шаблонов

`conversations-templates-conversationstemplateslist--with-templates` · `./src/components/conversations/templates/conversations-templates-list.stories.ts`

```html
<div data-simplebar="init">
  <div class="simplebar-wrapper" style="margin: 0px;">
    <div class="simplebar-height-auto-observer-wrapper">
      <div class="simplebar-height-auto-observer"></div>
    </div>
    <div class="simplebar-mask">
      <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
        <div class="simplebar-content-wrapper" tabindex="0" role="region" aria-label="scrollable content" style="height: auto; overflow: hidden;">
          <div class="simplebar-content" style="padding: 0px;">
            <div class="pretty-scroll__content h-full" style="--pretty-scroll-content-gap: 0px;">
              <div class="grid gap-1 px-1 py-2">
                <div class="base-row grid grid-cols-[minmax(0,1fr),88px] grid-rows-1 items-center gap-3 rounded-xl px-4 py-2 phone:grid-cols-[minmax(0,1fr),40px] phone:items-start" tabindex="1" aria-disabled="false">
                  <div class="max-w-full">
                    <h4 class="m-0 mb-1 truncate text-body-l font-regular leading-display-m text-font-black">Приветственное сообщение</h4>
                    <p class="m-0 truncate text-body-m text-font-gray">Добрый день! Рад познакомиться. Хотел бы обсудить возможное сотрудничество.</p>
                  </div>
                  <div class="grid w-full grid-cols-2 grid-rows-1 items-center justify-items-end gap-2 phone:grid-cols-1 phone:gap-0">
                    <div class="hidden phone:block">
                      <div class="v-popper v-popper--theme-dropdown">
                        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
                          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                            <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
                      </svg>
                    </button>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#trash"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="base-row grid grid-cols-[minmax(0,1fr),88px] grid-rows-1 items-center gap-3 rounded-xl px-4 py-2 phone:grid-cols-[minmax(0,1fr),40px] phone:items-start" tabindex="1" aria-disabled="false">
                  <div class="max-w-full">
                    <h4 class="m-0 mb-1 truncate text-body-l font-regular leading-display-m text-font-black">Предложение о работе</h4>
                    <p class="m-0 truncate text-body-m text-font-gray">Здравствуйте! Мы ищем специалиста на позицию Senior Frontend Developer. Посмотрите, пожалуйста, наше предложение.</p>
                  </div>
                  <div class="grid w-full grid-cols-2 grid-rows-1 items-center justify-items-end gap-2 phone:grid-cols-1 phone:gap-0">
                    <div class="hidden phone:block">
                      <div class="v-popper v-popper--theme-dropdown">
                        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
                          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                            <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
                      </svg>
                    </button>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#trash"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="base-row grid grid-cols-[minmax(0,1fr),88px] grid-rows-1 items-center gap-3 rounded-xl px-4 py-2 phone:grid-cols-[minmax(0,1fr),40px] phone:items-start" tabindex="1" aria-disabled="false">
                  <div class="max-w-full">
                    <h4 class="m-0 mb-1 truncate text-body-l font-regular leading-display-m text-font-black">Уточнение деталей</h4>
                    <p class="m-0 truncate text-body-m text-font-gray">Добрый день! Хотел уточнить несколько деталей по вашему резюме.</p>
                  </div>
                  <div class="grid w-full grid-cols-2 grid-rows-1 items-center justify-items-end gap-2 phone:grid-cols-1 phone:gap-0">
                    <div class="hidden phone:block">
                      <div class="v-popper v-popper--theme-dropdown">
                        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
                          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                            <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
                      </svg>
                    </button>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
         
<!-- … -->
```

### Загрузка

`conversations-templates-conversationstemplateslist--loading` · `./src/components/conversations/templates/conversations-templates-list.stories.ts`

```html
<div class="py-2">
  <div class="skeleton-pulse">
    <div class="flex items-start gap-3 py-2 pl-4 pr-5">
      <div class="shrink-0 grow">
        <div class="skeleton-shape mb-2" style="width: 200px; height: 12px;"></div>
        <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
      </div>
      <div class="grid w-16 grow-0 grid-cols-2 grid-rows-1 gap-2 px-1">
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
      </div>
    </div>
    <div class="flex items-start gap-3 py-2 pl-4 pr-5">
      <div class="shrink-0 grow">
        <div class="skeleton-shape mb-2" style="width: 200px; height: 12px;"></div>
        <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
      </div>
      <div class="grid w-16 grow-0 grid-cols-2 grid-rows-1 gap-2 px-1">
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
      </div>
    </div>
    <div class="flex items-start gap-3 py-2 pl-4 pr-5">
      <div class="shrink-0 grow">
        <div class="skeleton-shape mb-2" style="width: 200px; height: 12px;"></div>
        <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
      </div>
      <div class="grid w-16 grow-0 grid-cols-2 grid-rows-1 gap-2 px-1">
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
      </div>
    </div>
    <div class="flex items-start gap-3 py-2 pl-4 pr-5">
      <div class="shrink-0 grow">
        <div class="skeleton-shape mb-2" style="width: 200px; height: 12px;"></div>
        <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
      </div>
      <div class="grid w-16 grow-0 grid-cols-2 grid-rows-1 gap-2 px-1">
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
        <div class="skeleton-shape" style="width: 20px; height: 20px; border-radius: 50%;"></div>
      </div>
    </div>
  </div>
</div>
```

### Нет шаблонов

`conversations-templates-conversationstemplateslist--empty` · `./src/components/conversations/templates/conversations-templates-list.stories.ts`

```html
<div class="pb-3">
  <div class="empty-placeholder empty-placeholder--fullWidth empty-placeholder--noBorder empty-placeholder--fullHeight empty-placeholder--embed">
    <img src="../ui/assets/illustrations/no-conversations-templates.svg" alt width="96" height="96" class="empty-placeholder__image">
    <div class="empty-placeholder__title">Нет шаблонов</div>
    <div class="empty-placeholder__description">Создайте шаблоны для удобного общения.</div>
  </div>
</div>
```

### Дозагрузка

`conversations-templates-conversationstemplateslist--loading-more` · `./src/components/conversations/templates/conversations-templates-list.stories.ts`

```html
<div data-simplebar="init">
  <div class="simplebar-wrapper" style="margin: 0px;">
    <div class="simplebar-height-auto-observer-wrapper">
      <div class="simplebar-height-auto-observer"></div>
    </div>
    <div class="simplebar-mask">
      <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
        <div class="simplebar-content-wrapper" tabindex="0" role="region" aria-label="scrollable content" style="height: auto; overflow: hidden;">
          <div class="simplebar-content" style="padding: 0px;">
            <div class="pretty-scroll__content h-full" style="--pretty-scroll-content-gap: 0px;">
              <div class="grid gap-1 px-1 py-2">
                <div class="base-row grid grid-cols-[minmax(0,1fr),88px] grid-rows-1 items-center gap-3 rounded-xl px-4 py-2 phone:grid-cols-[minmax(0,1fr),40px] phone:items-start" tabindex="1" aria-disabled="false">
                  <div class="max-w-full">
                    <h4 class="m-0 mb-1 truncate text-body-l font-regular leading-display-m text-font-black">Приветственное сообщение</h4>
                    <p class="m-0 truncate text-body-m text-font-gray">Добрый день! Рад познакомиться. Хотел бы обсудить возможное сотрудничество.</p>
                  </div>
                  <div class="grid w-full grid-cols-2 grid-rows-1 items-center justify-items-end gap-2 phone:grid-cols-1 phone:gap-0">
                    <div class="hidden phone:block">
                      <div class="v-popper v-popper--theme-dropdown">
                        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
                          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                            <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
                      </svg>
                    </button>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#trash"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="base-row grid grid-cols-[minmax(0,1fr),88px] grid-rows-1 items-center gap-3 rounded-xl px-4 py-2 phone:grid-cols-[minmax(0,1fr),40px] phone:items-start" tabindex="1" aria-disabled="false">
                  <div class="max-w-full">
                    <h4 class="m-0 mb-1 truncate text-body-l font-regular leading-display-m text-font-black">Предложение о работе</h4>
                    <p class="m-0 truncate text-body-m text-font-gray">Здравствуйте! Мы ищем специалиста на позицию Senior Frontend Developer. Посмотрите, пожалуйста, наше предложение.</p>
                  </div>
                  <div class="grid w-full grid-cols-2 grid-rows-1 items-center justify-items-end gap-2 phone:grid-cols-1 phone:gap-0">
                    <div class="hidden phone:block">
                      <div class="v-popper v-popper--theme-dropdown">
                        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
                          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                            <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
                      </svg>
                    </button>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#trash"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="base-row grid grid-cols-[minmax(0,1fr),88px] grid-rows-1 items-center gap-3 rounded-xl px-4 py-2 phone:grid-cols-[minmax(0,1fr),40px] phone:items-start" tabindex="1" aria-disabled="false">
                  <div class="max-w-full">
                    <h4 class="m-0 mb-1 truncate text-body-l font-regular leading-display-m text-font-black">Уточнение деталей</h4>
                    <p class="m-0 truncate text-body-m text-font-gray">Добрый день! Хотел уточнить несколько деталей по вашему резюме.</p>
                  </div>
                  <div class="grid w-full grid-cols-2 grid-rows-1 items-center justify-items-end gap-2 phone:grid-cols-1 phone:gap-0">
                    <div class="hidden phone:block">
                      <div class="v-popper v-popper--theme-dropdown">
                        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 h-10 w-10">
                          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                            <use xlink:href="../ui/assets/icons/sprite.svg#more"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
                      </svg>
                    </button>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 phone:hidden">
         
<!-- … -->
```

## Icons/SocialIcon

### Все возможные варианты

`icons-socialicon--all-variants` · `./src/components/icons/social-icon.stories.ts`

```html
<div class="flex flex-wrap gap-4">
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-facebook" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#facebook"/>
    </svg>
    <div class="mt-2">facebook</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-twitter" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#twitter"/>
    </svg>
    <div class="mt-2">twitter</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-instagram" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#instagram"/>
    </svg>
    <div class="mt-2">instagram</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-youtube" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#youtube"/>
    </svg>
    <div class="mt-2">youtube</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-vk" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#vk"/>
    </svg>
    <div class="mt-2">vk</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-dzen" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#dzen"/>
    </svg>
    <div class="mt-2">dzen</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-github" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#github"/>
    </svg>
    <div class="mt-2">github</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-telegram" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#telegram"/>
    </svg>
    <div class="mt-2">telegram</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon social-icon-telegram-bot" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/social-v3.1.svg#telegram-bot"/>
    </svg>
    <div class="mt-2">telegram-bot</div>
  </div>
</div>
```

## Icons/SpriteIcon

### Все возможные варианты

`icons-spriteicon--all-variants` · `./src/components/icons/sprite-icon.stories.ts`

```html
<div class="grid grid-cols-6 tablet:grid-cols-4 gap-x-4 gap-y-8">
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#spinner"/>
    </svg>
    <div class="mt-2">spinner</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#arrow"/>
    </svg>
    <div class="mt-2">arrow</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#arrow-bold"/>
    </svg>
    <div class="mt-2">arrow-bold</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#cross"/>
    </svg>
    <div class="mt-2">cross</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#cross-old"/>
    </svg>
    <div class="mt-2">cross-old</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#trash"/>
    </svg>
    <div class="mt-2">trash</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#star"/>
    </svg>
    <div class="mt-2">star</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#star-small"/>
    </svg>
    <div class="mt-2">star-small</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#sharp-star"/>
    </svg>
    <div class="mt-2">sharp-star</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#bell"/>
    </svg>
    <div class="mt-2">bell</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#ny-bell"/>
    </svg>
    <div class="mt-2">ny-bell</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#person"/>
    </svg>
    <div class="mt-2">person</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#mail"/>
    </svg>
    <div class="mt-2">mail</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#bookmark"/>
    </svg>
    <div class="mt-2">bookmark</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#bookmark-filled"/>
    </svg>
    <div class="mt-2">bookmark-filled</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#location"/>
    </svg>
    <div class="mt-2">location</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#location-legacy"/>
    </svg>
    <div class="mt-2">location-legacy</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#gear"/>
    </svg>
    <div class="mt-2">gear</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#plus"/>
    </svg>
    <div class="mt-2">plus</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#pen"/>
    </svg>
    <div class="mt-2">pen</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#info"/>
    </svg>
    <div class="mt-2">info</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#emoji-add"/>
    </svg>
    <div class="mt-2">emoji-add</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#dots"/>
    </svg>
    <div class="mt-2">dots</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#down"/>
    </svg>
    <div class="mt-2">down</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#readBy"/>
    </svg>
    <div class="mt-2">readBy</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#arrow-back"/>
    </svg>
    <div class="mt-2">arrow-back</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#arrow-big"/>
    </svg>
    <div class="mt-2">arrow-big</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#check"/>
    </svg>
    <div class="mt-2">check</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#arrow-forward"/>
    </svg>
    <div class="mt-2">arrow-forward</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#favorite"/>
    </svg>
    <div class="mt-2">favorite</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../ui/assets/icons/sprite.svg#edit_new"/>
    </svg>
    <div class="mt-2">edit_new</div>
  </div>
  <div class="flex flex-col items-center">
    <svg class="svg-icon fill-icon-gray text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href=
<!-- … -->
```

## Salary/SalaryBar

### Hidden User Salary

`salary-salarybar--hidden-user-salary` · `./src/components/salary/salary-bar.stories.ts`

```html
<div class="mx-auto w-[804px] max-w-full p-6 py-12">
  <div class="salary-bar">
    <div class="salary-bar__container">
      <div class="salary-bar__min v-popper--has-tooltip">12k</div>
      <div class="salary-bar__max v-popper--has-tooltip">479k</div>
      <div class="salary-bar__circle-container">
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
      </div>
      <div class="salary-bar__sub-bar" style="left: max(10px, 16.7024%); width: max(40px, 34.2612%);">
        <div class="salary-bar__sub-bar-values">
          <div class="salary-bar__sub-bar-min v-popper--has-tooltip">90k</div>
          <div class="salary-bar__sub-bar-max v-popper--has-tooltip">250k</div>
        </div>
      </div>
      <div class="salary-bar__median-divider" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-arrow" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-divider-value v-popper--has-tooltip" style="left: clamp(10px, 35.9743%, 100% - 10px);">180k</div>
    </div>
  </div>
</div>
```

### Without User Salary

`salary-salarybar--without-user-salary` · `./src/components/salary/salary-bar.stories.ts`

```html
<div class="mx-auto w-[804px] max-w-full p-6 py-12">
  <div class="salary-bar">
    <div class="salary-bar__container">
      <div class="salary-bar__min v-popper--has-tooltip">12k</div>
      <div class="salary-bar__max v-popper--has-tooltip">479k</div>
      <div class="salary-bar__circle-container">
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
      </div>
      <div class="salary-bar__sub-bar" style="left: max(10px, 16.7024%); width: max(40px, 34.2612%);">
        <div class="salary-bar__sub-bar-values">
          <div class="salary-bar__sub-bar-min v-popper--has-tooltip">90k</div>
          <div class="salary-bar__sub-bar-max v-popper--has-tooltip">250k</div>
        </div>
      </div>
      <div class="salary-bar__median-divider" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-arrow" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-divider-value v-popper--has-tooltip" style="left: clamp(10px, 35.9743%, 100% - 10px);">180k</div>
    </div>
  </div>
</div>
```

### Update Salary Notice

`salary-salarybar--update-salary-notice` · `./src/components/salary/salary-bar.stories.ts`

```html
<div class="mx-auto w-[804px] max-w-full p-6 py-12">
  <div class="salary-bar salary-bar--with-notice">
    <div class="salary-notice">
      <svg class="svg-icon salary-notice__icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../ui/assets/icons/sprite.svg#info"/>
      </svg>
      <span class="salary-notice__text">
        <a href="#" data-href="salaries/new">Обновите свою зарплату</a>
        , чтобы посмотреть данные по другим специализациям
      </span>
    </div>
    <div class="salary-bar__container">
      <div class="salary-bar__min v-popper--has-tooltip">12k</div>
      <div class="salary-bar__max v-popper--has-tooltip">479k</div>
      <div class="salary-bar__circle-container">
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
      </div>
      <div class="salary-bar__sub-bar" style="left: max(10px, 16.7024%); width: max(40px, 34.2612%);">
        <div class="salary-bar__sub-bar-values">
          <div class="salary-bar__sub-bar-min v-popper--has-tooltip">90k</div>
          <div class="salary-bar__sub-bar-max v-popper--has-tooltip">250k</div>
        </div>
      </div>
      <div class="salary-bar__median-divider" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-arrow" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-divider-value v-popper--has-tooltip" style="left: clamp(10px, 35.9743%, 100% - 10px);">180k</div>
    </div>
  </div>
</div>
```

## Tests/Cards/TestItem

### Настройка видимости — виден всем

`tests-cards-testitem--visible-to-all` · `./src/components/tests/cards/test-item.stories.ts`

```html
<div class="grid gap-0.5 px-6">
  <div class="relative grid gap-2 rounded-t-xl p-4 bg-ui-green-12">
    <div title="Видно всем" class="absolute right-2 top-2">
      <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 fill-icon-gray text-icon-gray">
        <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
          <use xlink:href="../ui/assets/icons/sprite.svg#eye"/>
        </svg>
      </button>
    </div>
    <div class="text-body-m font-semibold uppercase text-ui-green">Пройден</div>
    <div class="flex items-center gap-2">
      <img src="../ui/assets/illustrations/avatar-default-company.svg" class="h-6 w-6 rounded" alt="Логотип компании Хантфлоу">
      <div class="text-body-m">Хантфлоу</div>
    </div>
    <div class="text-body-m">Тест от 15 января 2024</div>
  </div>
</div>
```

### Настройка видимости — скрыт

`tests-cards-testitem--hidden-from-others` · `./src/components/tests/cards/test-item.stories.ts`

```html
<div class="grid gap-0.5 px-6">
  <div class="relative grid gap-2 rounded-t-xl p-4 bg-ui-green-12">
    <div title="Видно только вам" class="absolute right-2 top-2">
      <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 fill-icon-gray text-icon-gray">
        <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
          <use xlink:href="../ui/assets/icons/sprite.svg#crossed-eye"/>
        </svg>
      </button>
    </div>
    <div class="text-body-m font-semibold uppercase text-ui-green">Пройден</div>
    <div class="flex items-center gap-2">
      <img src="../ui/assets/illustrations/avatar-default-company.svg" class="h-6 w-6 rounded" alt="Логотип компании Хантфлоу">
      <div class="text-body-m">Хантфлоу</div>
    </div>
    <div class="text-body-m">Тест от 15 января 2024</div>
  </div>
</div>
```

### Настройка видимости — чужой профиль (только просмотр)

`tests-cards-testitem--guest-visibility` · `./src/components/tests/cards/test-item.stories.ts`

```html
<div class="grid gap-0.5 px-6">
  <div class="relative grid gap-2 rounded-t-xl p-4 bg-ui-green-12">
    <div title="Видно всем" class="absolute right-2 top-2">
      <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 fill-ui-gray text-ui-gray">
        <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
          <use xlink:href="../ui/assets/icons/sprite.svg#eye"/>
        </svg>
      </button>
    </div>
    <div class="text-body-m font-semibold uppercase text-ui-green">Пройден</div>
    <div class="flex items-center gap-2">
      <img src="../ui/assets/illustrations/avatar-default-company.svg" class="h-6 w-6 rounded" alt="Логотип компании Хантфлоу">
      <div class="text-body-m">Хантфлоу</div>
    </div>
    <div class="text-body-m">Тест от 15 января 2024</div>
  </div>
</div>
```
