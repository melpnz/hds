# HHImportProfileStatusBanner · Статус импорта профиля

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `max-w-[760px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 3 из 3 |

## Назначение

Полоса состояния импорта профиля из внешнего сервиса: идёт, удался, не удался.

## Анатомия

```
div.max-w-[760px].p-4
  div.relative.overflow-hidden.rounded-3xl
    section.flex.gap-2.rounded-3xl.border.bg-ui-white.p-6.items-center.border-ui-blue
      svg.svg-icon.fill-ui-blue.text-ui-blue.h-6.w-6.shrink-0
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#postpone-circle"]
      div.relative.grow
        div.flex.flex-wrap.items-baseline
          h2.m-0.text-body-l  [id="hh-import-profile-title"]
            · «Заполнение резюме»
          span.inline-separator.inline-separator.ml-2
            · «•»
          button.ghost-button.base-button.inline-flex.appearance-none.size-m.is-sizeable.ghost-button  [type="button" target="_self"]
            span.base-button__inner
              …
        button.!absolute.right-0.top-0.ghost-button.base-button.inline-flex.appearance-none.size-m.is-sizeable.!absolute.right-0.top-0.ghost-button  [type="button" target="_self"]
          span.base-button__inner
            span.base-button__content
              · «Отменить»
```

_Разметка story `banners-hhimportprofilestatusbanner--in-progress`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-blue` | `#1ba1ee` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#check-circle-empty` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#postpone-circle` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-labelledby="hh-import-profile-title"`.

## Поведение

- Три story — три состояния процесса. Это готовый образец того, как Career показывает длительную фоновую операцию.

## Разметка

```html
<div class="max-w-[760px] p-4">
  <div class="relative overflow-hidden rounded-3xl">
    <section class="flex gap-2 rounded-3xl border bg-ui-white p-6 items-center border-ui-blue" aria-labelledby="hh-import-profile-title">
      <svg class="svg-icon fill-ui-blue text-ui-blue h-6 w-6 shrink-0" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#postpone-circle"/>
      </svg>
      <div class="relative grow">
        <div class="flex flex-wrap items-baseline">
          <h2 id="hh-import-profile-title" class="m-0 text-body-l">Заполнение резюме</h2>
          <span class="inline-separator inline-separator ml-2">•</span>
          <button class="ghost-button base-button inline-flex appearance-none size-m is-sizeable ghost-button" type="button" target="_self">
            <span class="base-button__inner">
              <span class="base-button__content">Обновить</span>
            </span>
          </button>
        </div>
        <button class="!absolute right-0 top-0 ghost-button base-button inline-flex appearance-none size-m is-sizeable !absolute right-0 top-0 ghost-button" type="button" target="_self">
          <span class="base-button__inner">
            <span class="base-button__content">Отменить</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/hh-import-profile/hh-import-profile-status-banner/hh-import-profile-status-banner.stories.ts`
- Storybook `career-web`: `banners-hhimportprofilestatusbanner--in-progress`, `banners-hhimportprofilestatusbanner--succeeded`, `banners-hhimportprofilestatusbanner--failed`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
