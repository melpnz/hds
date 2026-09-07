# VisibilitySettings · Переключатель видимости

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | — собственных классов нет, блок собран утилитами |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 6 из 6 |

## Назначение

Круглая кнопка «глаз», скрывающая или показывающая блок профиля другим пользователям, плюс уведомление, объясняющее текущий режим.

## Анатомия

```
div
  button.m-0.flex.size-10.shrink-0.cursor-pointer.items-center.justify-center.rounded-full.border-none.bg-transparent.p-0.text-current.outline-2.outline-offset-2.outline-ui-primary-60.transition-colors.focus-visible:outline.disabled:cursor-default.text-ui-gray-2.hover:bg-ui-gray-3-10.hover:text-ui-gray-1.focus-visible:bg-ui-gray-3-10.fill-icon-gray.text-icon-gray  [type="button"]
    svg.svg-icon
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#crossed-eye"]
```

_Разметка story `tests-visibilitysettings--hidden`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `isHidden` | boolean | — | — | `boolean` |
| `color` | string | — | — | `text` |
| `changeVisibility` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-blue` | `#1ba1ee` | из `:root` Career |
| `--color-ui-blue-overlay` | `#ebefff` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#crossed-eye` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#eye` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Иконка меняется между `#eye` и `#crossed-eye`; цвет можно переопределить props `color`.

## Разметка

```html
<div title="Видно только вам">
  <button type="button" class="m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-current outline-2 outline-offset-2 outline-ui-primary-60 transition-colors focus-visible:outline disabled:cursor-default text-ui-gray-2 hover:bg-ui-gray-3-10 hover:text-ui-gray-1 focus-visible:bg-ui-gray-3-10 fill-icon-gray text-icon-gray">
    <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#crossed-eye"/>
    </svg>
  </button>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/tests/visibility-settings.stories.ts`, `./src/components/tests/visibility-settings-notification.stories.ts`
- Storybook `career-web`: `tests-visibilitysettings--hidden`, `tests-visibilitysettings--visible`, `tests-visibilitysettings--with-custom-color`, `tests-visibilitysettingsnotification--hidden-by-default`, `tests-visibilitysettingsnotification--skills-test-in-profile`, `tests-visibilitysettingsnotification--specs-test-in-profile`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
