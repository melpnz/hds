# ContextMenu · Контекстное меню

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | `context-menu` |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Меню действий по кнопке «три точки»: карточки, отклики, строки списков. Есть два варианта — обычный и изоморфный, который на узком экране превращается в модальное окно снизу.

## Анатомия

```
div.flex.w-full.items-center.justify-center
  div.context-menu.w-6
    div.base-dropdown
      div.base-dropdown__toggle
        button.m-0.flex.size-10.shrink-0.cursor-pointer.items-center.justify-center.rounded-full.border-none.bg-transparent.p-0.text-current.outline-2.outline-offset-2.outline-ui-primary-60.transition-colors.focus-visible:outline.disabled:cursor-default.text-ui-gray-2.hover:bg-ui-gray-3-10.hover:text-ui-gray-1.focus-visible:bg-ui-gray-3-10  [type="button"]
          svg.svg-icon
            use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#more"]
      div.base-dropdown__content.base-dropdown__content--alignment-right
        div.context-menu__content
          button.w-full.cursor-pointer.overflow-hidden.whitespace-nowrap.text-left.border-b.border-solid.border-ui-gray-bg.bg-transparent.px-4.py-[10px].text-font-black.hover:bg-ui-blue.hover:text-ui-white.active:bg-ui-blue.active:text-ui-white.focus:outline-3.focus:outline.focus:-outline-offset-1.focus:outline-[var(--color-ui-blue)]
            · «Item 1»
          button.w-full.cursor-pointer.overflow-hidden.whitespace-nowrap.text-left.border-b.border-solid.border-ui-gray-bg.bg-transparent.px-4.py-[10px].text-font-black.hover:bg-ui-blue.hover:text-ui-white.active:bg-ui-blue.active:text-ui-white.focus:outline-3.focus:outline.focus:-outline-offset-1.focus:outline-[var(--color-ui-blue)]
            · «Item 2»
          button.w-full.cursor-pointer.overflow-hidden.whitespace-nowrap.text-left.border-b.border-solid.border-ui-gray-bg.bg-transparent.px-4.py-[10px].text-font-black.hover:bg-ui-blue.hover:text-ui-white.active:bg-ui-blue.active:text-ui-white.focus:outline-3.focus:outline.focus:-outline-offset-1.focus:outline-[var(--color-ui-blue)]
            · «Item 3»
```

_Разметка story `common-contextmenu-default--simple-context-menu`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.has-before`, `.is-panel`, `.is-sizeable`.

## Слоты

- `trigger`
- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `placement` | "bottom-end" \| "top-start" | — | bottom-end · top-start | `radio` |
| `icon` | "additional-menu" \| "more" | — | more · additional-menu | `radio` |
| `triggerSize` | string | — | — | `text` |
| `isOnDark` | boolean | — | — | `boolean` |
| `show` | other | — | — | `object` |
| `hide` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-shadow-overlay-60` | `hsla(207,9%,81%,.6)` | из `:root` Career |
| `--color-ui-black-20` | `color-mix(in srgb,var(--color-ui-black) 20%,transparent)` | из `:root` Career |
| `--color-ui-blue` | `#1ba1ee` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#more` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#plus` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#settings` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Изоморфный вариант меняет не оформление, а способ показа: на десктопе — выпадающий блок, на телефоне — модальное окно.

## Разметка

```html
<div class="flex w-full items-center justify-center">
  <div class="context-menu w-6">
    <div class="base-dropdown">
      <div class="base-dropdown__toggle">
        <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10">
          <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
            <use xlink:href="../../ui/assets/icons/sprite.svg#more"/>
          </svg>
        </button>
      </div>
      <div class="base-dropdown__content base-dropdown__content--alignment-right" style="margin-top: 0px;">
        <div class="context-menu__content">
          <button class="w-full cursor-pointer overflow-hidden whitespace-nowrap text-left border-b border-solid border-ui-gray-bg bg-transparent px-4 py-[10px] text-font-black hover:bg-ui-blue hover:text-ui-white active:bg-ui-blue active:text-ui-white focus:outline-3 focus:outline focus:-outline-offset-1 focus:outline-[var(--color-ui-blue)]" border="false">Item 1</button>
          <button class="w-full cursor-pointer overflow-hidden whitespace-nowrap text-left border-b border-solid border-ui-gray-bg bg-transparent px-4 py-[10px] text-font-black hover:bg-ui-blue hover:text-ui-white active:bg-ui-blue active:text-ui-white focus:outline-3 focus:outline focus:-outline-offset-1 focus:outline-[var(--color-ui-blue)]" border="false">Item 2</button>
          <button class="w-full cursor-pointer overflow-hidden whitespace-nowrap text-left border-b border-solid border-ui-gray-bg bg-transparent px-4 py-[10px] text-font-black hover:bg-ui-blue hover:text-ui-white active:bg-ui-blue active:text-ui-white focus:outline-3 focus:outline focus:-outline-offset-1 focus:outline-[var(--color-ui-blue)]" border="false">Item 3</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.context-menu__content { background-color:var(--color-ui-white);border-radius:.25rem;--tw-shadow:0 1px 20px var(--color-ui-black-20);--tw-shadow-colored:0 1px 20px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.context-menu__content--select { border-radius:16px;box-shadow:0 1px 2px 0 var(--color-shadow-overlay-60),0 2px 6px 2px var(--color-shadow-overlay-60) }
.context-menu--select .base-dropdown__content { background:transparent;border-radius:0;box-shadow:none }
.context-menu-popper.v-popper--theme-dropdown .v-popper__inner { background:transparent;border:0;border-radius:16px;box-shadow:0 2px 6px 2px #434b601f,0 1px 2px #434b603d;color:inherit }
.context-menu-popper.v-popper--theme-dropdown .v-popper__arrow-container { display:none }
.modal-overlay-enter-from .modal-overlay-slide-up,.modal-overlay-leave-to .modal-overlay-slide-up { opacity:0;transform:translateY(100%) }
.modal-overlay-enter-to .modal-overlay-slide-up,.modal-overlay-leave-from .modal-overlay-slide-up { opacity:1;transform:translateY(0) }
.modal-overlay-enter-active .modal-overlay-slide-up,.modal-overlay-leave-active .modal-overlay-slide-up { transition:opacity .25s,transform .25s }
```

## Ограничения

- Разметка, CSS и props извлечены полностью для варианта на `BaseDropdown`.
- Вариант на `v-popper` снят только триггером: его всплывающий слой рендерится
  в портале и в снимок Storybook не попал. В витрине этот триггер стоит рядом
  с первым и намеренно не раскрывается — подмена содержимого выдавала бы
  догадку за снятый факт. Нормативный интерактивный пример —
  `showcase/components.html#n-menu-contract`.
- У самого снимка поведения нет: в продукте раскрытием управляет компонент.
  В витрине к нему подключена reference-обвязка (класс
  `base-dropdown__content--open` и `aria-expanded`), чтобы стенд не выглядел
  сломанным; в `ui/` она не входит.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/context-menu/context-menu.stories.ts`, `./src/components/common/context-menu/isomorphic-context-menu/isomorphic-context-menu.stories.ts`
- Storybook `career-web`: `common-contextmenu-default--simple-context-menu`, `common-contextmenu-default--context-menu-custom-toggle`, `common-contextmenu-isomorphic--isomorphic-context-menu-story`, `common-contextmenu-isomorphic--isomorphic-context-custom-toggle`
- CSS: секция `context-menu-item` в `ui/components/navigation.css`, секция `isomorphic-context-menu` в `ui/components/navigation.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Триггер: `button.context-menu__trigger` с `aria-haspopup="menu"`, `aria-expanded` и `aria-controls`. Попап: `role="menu"`; команды: `button.context-menu__item` с `role="menuitem"`. Для выбора значения используйте Select/Listbox, не ContextMenu.

| Состояние | Контракт |
|---|---|
| `closed` | `aria-expanded="false"`, попап `hidden` |
| `open` | `aria-expanded="true"`, попап доступен и видим |
| `focus-visible` | видимое кольцо на trigger и активном menuitem |

Enter/Space/ArrowDown открывают меню; стрелки перемещают активный пункт; Escape закрывает и возвращает фокус; Tab закрывает меню без ловушки фокуса.
