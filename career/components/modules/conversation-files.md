# ConversationFiles · Вложения

| | |
|---|---|
| **Категория** | Модуль: переписка |
| **Корневой класс** | `border-b`, `border-b-ui-gray-bg` |
| **CSS** | `ui/components/conversations.css`, `ui/components/overlays.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 23 из 23 |

## Назначение

Полный механизм вложений: перетаскивание в область переписки, загрузка с анимацией прогресса, плитка файла с иконкой по типу, выбор из ранее загруженных, предупреждение о неотправленных.

## Анатомия

```
div.border-b.border-b-ui-gray-bg
  h4.m-0.px-6.pb-6.pt-4.text-body-m.font-regular.text-font-gray
    · «Файлы хранятся 30 дней»
  div.conversation-attached-files-scroll.max-h-[308px].phone:max-h-[178px]
    div.simplebar-wrapper
      div.simplebar-height-auto-observer-wrapper
        div.simplebar-height-auto-observer
      div.simplebar-mask
        div.simplebar-offset
          div.simplebar-content-wrapper  [role="region" aria-label="scrollable content" tabindex="0"]
            div.simplebar-content
              …
      div.simplebar-placeholder
    div.simplebar-track.simplebar-horizontal
      div.simplebar-scrollbar
    div.simplebar-track.simplebar-vertical
      div.simplebar-scrollbar
```

_Разметка story `conversations-files-conversationattachedfiles--uploading`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.conversation-files-selector-modal__file-presenter--disabled`, `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `file` | File \| FileUploadedByUser | — | — | `object` |
| `percentage` | number | — | — | `number` |
| `errorMessage` | string \| null | — | — | `object` |
| `justPresent` | boolean | — | — | `boolean` |
| `remove` | other | — | — | `object` |
| `retry` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-graph-cyan` | `#83d3fc` | из `:root` Career |
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-red-second` | `var( --color-ui-red-light )` | из `:root` Career |
| `--color-ui-turquoise` | `#0db3d3` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |
| `--color-ui-white-60` | `color-mix(in srgb,var(--color-ui-white) 60%,transparent)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus-circle` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:767px)`, `(max-width:1023px)`.

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-disabled="false"`, `aria-label="scrollable content"`, `role="region"`, `tabindex="0"`.

## Поведение

- Иконка файла выбирается по расширению — семь story перебирают типы.
- Анимация загрузки — отдельный компонент, а не состояние плитки.

## Разметка

```html
<div class="border-b border-b-ui-gray-bg">
  <h4 class="m-0 px-6 pb-6 pt-4 text-body-m font-regular text-font-gray">Файлы хранятся 30 дней</h4>
  <div data-simplebar="init" class="conversation-attached-files-scroll max-h-[308px] phone:max-h-[178px]">
    <div class="simplebar-wrapper" style="margin: 0px;">
      <div class="simplebar-height-auto-observer-wrapper">
        <div class="simplebar-height-auto-observer"></div>
      </div>
      <div class="simplebar-mask">
        <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
          <div class="simplebar-content-wrapper" tabindex="0" role="region" aria-label="scrollable content" style="height: auto; overflow: hidden;">
            <div class="simplebar-content" style="padding: 0px;">
              <div class="pretty-scroll__content h-full" style="--pretty-scroll-content-gap: 0px;">
                <div class="pb-2">
                  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)_24px]">
                    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg bg-ui-turquoise">
                      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 282deg,
      rgba(255, 255, 255, 0) 0
    );"></div>
                      <div class="absolute left-1/2 top-1/2 max-w-[36px] -translate-x-1/2 -translate-y-1/2 transform truncate text-center text-body-m font-semibold text-ui-white">png</div>
                    </div>
                    <div class="text-body-l">
                      <div class="grid grid-cols-[minmax(0,min-content)_min-content]">
                        <div class="truncate">screenshot</div>
                        <div class="whitespace-nowrap">.png</div>
                      </div>
                      <div class="flex items-center gap-1 text-body-m text-ui-gray-2">
                        <div class="text-body-m">1 B</div>
                        <span>
                          <span>•</span>
                          <span>50%</span>
                        </span>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../../ui/assets/icons/sprite.svg#cross"/>
                      </svg>
                    </button>
                  </div>
                  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)_24px]">
                    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg bg-ui-red-second">
                      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 282deg,
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
                        <div class="text-body-m">1 B</div>
                        <span>
                          <span>•</span>
                          <span>50%</span>
                        </span>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../../ui/assets/icons/sprite.svg#cross"/>
                      </svg>
                    </button>
                  </div>
                  <div class="grid items-center gap-2 px-4 py-2 grid-cols-[40px_minmax(0,1fr)_24px]">
                    <div class="uploading-animation relative h-10 w-10 overflow-hidden rounded-lg bg-graph-cyan">
                      <div class="uploading-animation-conic absolute inset-0 m-auto h-7 w-7 -scale-x-100 rounded-full" style="background: conic-gradient(
      var(--color-ui-white-60) 0 282deg,
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
                        <div class="text-body-m">1 B</div>
                        <span>
                          <span>•</span>
                          <span>50%</span>
                        </span>
                      </div>
                    </div>
                    <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
                      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
                        <use xlink:href="../../ui/assets/icons/sprite.svg#cross"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="simplebar-placeholder" style="width: 1248px; height:
<!-- … фрагмент обрезан. Полная разметка: _sources/career/rendered/conversations-files-conversationattachedfiles--uploading.html -->
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.v-enter-active,.v-leave-active { transition:opacity .3s ease }
.v-enter-from,.v-leave-to { opacity:0 }
.conversation-attached-files-scroll .simplebar-content { padding:0 8px 8px!important }
.uploading-animation:after { background-color:var(--color-ui-white-60);border-radius:.25rem;content:"";top:0;right:0;bottom:0;left:0;-webkit-mask:radial-gradient(circle 20px at 50% 50%,transparent 95%,#000 0);mask:radial-gradient(circle 20px at 50% 50%,transparent 95%,#000 0);position:absolute }
.uploading-animation-finish:after { animation:burst-0cdf3753 .5s linear .3s forwards }
.uploading-animation-just-present:after { animation:none;opacity:0;transform:scale(2.4) }
.conversation-files-selector-modal__file-presenter--disabled, .conversation-files-selector-modal__file-presenter--disabled .text-ui-gray-2 { color:var(--color-ui-gray-4) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/files/conversation-attached-files.stories.ts`, `./src/components/conversations/files/conversation-attached-file-presenter.stories.ts`, `./src/components/conversations/files/conversation-attached-file-uploader.stories.ts`, `./src/components/conversations/files/conversation-file-icon.stories.ts`, `./src/components/conversations/files/conversation-file-uploading-animation.stories.ts`, `./src/components/conversations/files/conversation-files-catcher.stories.ts`, `./src/components/conversations/files/conversation-files-selector-modal.stories.ts`
- Storybook `career-web`: `conversations-files-conversationattachedfiles--uploading`, `conversations-files-conversationattachedfiles--uploaded`, `conversations-files-conversationattachedfiles--with-errors`, `conversations-files-conversationattachedfilepresenter--uploading`, `conversations-files-conversationattachedfilepresenter--uploaded`, `conversations-files-conversationattachedfilepresenter--with-error`, `conversations-files-conversationattachedfilepresenter--just-present`, `conversations-files-conversationattachedfileuploader--uploading`, `conversations-files-conversationattachedfileuploader--uploaded`, `conversations-files-conversationattachedfileuploader--with-error`, `conversations-files-conversationfileicon--image-file`, `conversations-files-conversationfileicon--pdf-file`, `conversations-files-conversationfileicon--docx-file`, `conversations-files-conversationfileicon--xlsx-file`, `conversations-files-conversationfileicon--zip-file`, `conversations-files-conversationfileicon--with-error`, `conversations-files-conversationfileicon--uploading`, `conversations-files-conversationfileuploadinganimation--in-progress`, `conversations-files-conversationfileuploadinganimation--completed`, `conversations-files-conversationfileuploadinganimation--just-present`, `conversations-files-conversationfilescatcher--inactive`, `conversations-files-conversationfilescatcher--active`, `conversations-files-conversationfilesselectormodal--default`
- CSS: секция `conversation-attached-file-presenter` в `ui/components/conversations.css`, секция `conversation-attached-files` в `ui/components/conversations.css`, секция `conversation-file-uploading-animation` в `ui/components/conversations.css`, секция `conversation-files-selector-modal` в `ui/components/overlays.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
