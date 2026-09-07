# Notification · BaseNotification

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | `notification` |
| **CSS** | `ui/components/feedback.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Врезка с сообщением внутри страницы: подсказка, предупреждение, ошибка, новость. В отличие от тоста не исчезает сама и стоит в потоке содержимого.

## Анатомия

Корневой класс — `notification`, не `base-notification`. Это важное расхождение: имя компонента в Storybook и имя класса в разметке различаются.

```
div.notification.notification--info
  div.notification__wrapper
    svg.svg-icon.notification__icon
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#info"]
    div.notification__content
      div.notification__title
        · «Текст»
      div.notification__description
        · «Описание с возможностью закрытия»
    button.notification__close
      svg.svg-icon
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#cross"]
```

_Разметка story `common-notifications-basenotification--closable-info`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Варианты

Четыре вида. Вид задаёт три вещи разом: фон, цвет рамки и переменную
`--notification-accent-color`, от которой берут цвет значок, крестик и ссылки
внутри описания.

| Класс | Вид | Фон | Рамка и акцент | Типичный значок |
|---|---|---|---|---|
| `notification--info` | подсказка | `var(--color-ui-blue-10)` | `var(--color-ui-blue)` | `#info` |
| `notification--news` | новость, успех | `var(--color-ui-green-10)` | `var(--color-ui-green)` | `#check-circle-empty` |
| `notification--attention` | предупреждение | `var(--color-ui-orange-10)` | `var(--color-ui-orange)` | `#danger` |
| `notification--alert` | ошибка | `var(--color-ui-red-10)` | `var(--color-ui-red)` | `#minus-circle` |

Значок берётся из prop `icon` и жёстко к виду не привязан — сопоставление выше
взято из story и production, а не из кода.

### Рамка зависит от размещения

| Класс | Когда | Рамка |
|---|---|---|
| без модификатора | врезка стоит на странице, на сером фоне | `1px solid` цветом вида |
| `notification--borderless` | врезка встроена в блок на белом фоне | `border-width: 0`, остаётся только заливка |

Это единственное различие: `--borderless` не меняет ни фон, ни отступы, ни акцент.

### Отступы

| Класс | Padding |
|---|---|
| без модификатора | `12px 16px` |
| `notification--padding-medium` | `10px 16px` |
| `notification--padding-small` | `8px 12px` |

### Что необязательно

- **Заголовок.** `notification__title` рендерится только при непустом `title`.
  Без него описание остаётся единственной строкой, `min-height` содержимого 24px
  держит высоту.
- **Крестик.** `notification__close` появляется при `closable`. Он окрашен
  акцентом вида, а не серым.
- **Ссылки.** Блок `notification__links` — необязательный слот под описанием.

То есть матрица вариантов: **4 вида × заголовок есть/нет × крестик есть/нет ×
рамка есть/нет** — все шестнадцать сочетаний каждого вида законны, специальных
запретов в коде нет.

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Слоты

- `default`
- `links`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `appearance` | NotificationAppearance | `'info'` | info · attention · alert · news | `select` |
| `title` | string | `''` | — | `text` |
| `closable` | boolean | `false` | — | `boolean` |
| `borderless` | boolean | `false` | — | `boolean` |
| `padding` | NotificationPadding | `''` |  · small · medium | `select` |
| `fullWidth` | boolean | — | — | `boolean` |
| `icon` | NotificationIcon | — | — | `text` |
| `iconSize` | number | `24` | — | `number` |
| `description` | string | `''` | — | `text` |
| `close` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-blue` | `#1ba1ee` | из `:root` Career |
| `--color-ui-blue-10` | `color-mix(in srgb,var(--color-ui-blue) 10%,transparent)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-green-10` | `color-mix(in srgb,var(--color-ui-green) 10%,transparent)` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |
| `--color-ui-orange-10` | `color-mix(in srgb,var(--color-ui-orange) 10%,transparent)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-red-10` | `color-mix(in srgb,var(--color-ui-red) 10%,transparent)` | из `:root` Career |
| `--notification-accent-color` | — | задаётся компонентом или средой, значения в сборке нет |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#danger` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#info` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus-circle` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- `borderless` убирает рамку, оставляя заливку — так уведомление встраивается внутрь карточки.
- `padding` меняет плотность (`small` / `medium`), а не размер шрифта.
- Заголовок необязателен: у варианта без заголовка остаётся только `__description`.

## Разметка

```html
<div class="notification notification--info">
  <div class="notification__wrapper">
    <svg class="svg-icon notification__icon" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#info"/>
    </svg>
    <div class="notification__content">
      <div class="notification__title">Текст</div>
      <div class="notification__description">Описание с возможностью закрытия</div>
    </div>
    <button class="notification__close">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#cross"/>
      </svg>
    </button>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.notification { border-radius:.75rem;border-style:solid;border-width:1px;padding:.75rem 1rem }
.notification__wrapper { align-items:flex-start;-moz-column-gap:.25rem;column-gap:.25rem;display:flex }
.notification--info { background-color:var(--color-ui-blue-10);border-color:var(--color-ui-blue);--notification-accent-color:var(--color-ui-blue) }
.notification--alert { background-color:var(--color-ui-red-10);border-color:var(--color-ui-red);--notification-accent-color:var(--color-ui-red) }
.notification--attention { background-color:var(--color-ui-orange-10);border-color:var(--color-ui-orange);--notification-accent-color:var(--color-ui-orange) }
.notification--news { background-color:var(--color-ui-green-10);border-color:var(--color-ui-green);--notification-accent-color:var(--color-ui-green) }
.notification--padding-small { padding:.5rem .75rem }
.notification--padding-medium { padding:10px 1rem }
.notification--borderless { border-width:0 }
.notification__content { display:flex;flex:1 1 0%;flex-direction:column;justify-content:center;min-height:24px;min-width:0;padding-left:.25rem;padding-right:.25rem;row-gap:.25rem }
.notification__title { color:var(--color-font-black);font-size:16px;font-weight:600;line-height:24px }
.notification__description { color:var(--color-font-black);font-size:14px;line-height:20px }
.notification__links { align-items:center;display:flex;font-size:0;gap:.5rem;padding-bottom:.25rem;padding-top:.25rem }
.notification__description a { color:var(--notification-accent-color) }
.notification__icon { color:var(--notification-accent-color);flex-shrink:0 }
.notification__close { background-color:transparent;border-width:0;color:var(--notification-accent-color);cursor:pointer;line-height:0;padding:0 }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-notification.stories.ts`
- Storybook `career-web`: `common-notifications-basenotification--default`, `common-notifications-basenotification--invoice-creation-attention`, `common-notifications-basenotification--closable-info`, `common-notifications-basenotification--alert`
- CSS: секция `base-notification` в `ui/components/feedback.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Канонические варианты API: `info`, `warning`, `success`, `error`. Совместимость: `attention → warning`, `news → success`, `alert → error`. `default` означает `info`. Новые имена поддержаны в `ui/state-contract.css`.

Статическая подсказка не получает live-role. Динамическое некритичное сообщение использует `role="status"`; ошибка, требующая немедленного внимания, — `role="alert"`. Кнопка закрытия обязана иметь `aria-label`, `hover` и `focus-visible`; закрытие не должно неожиданно переносить фокус.
