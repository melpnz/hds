# InnerProjectBanner · Баннер проекта Хабра

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `max-w-[300px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Баннер в боковой колонке, ведущий на внутренние проекты Хабра: телеграм-бот, сообщество, рассылка.

## Анатомия

```
div.max-w-[300px]
  section.base-section.base-section--background-white.rounded-3xl.inner-project-banner.flex.flex-col.gap-3.overflow-hidden.bg-no-repeat
    div.flex.flex-col.gap-2
      h3.m-0.text-display-s.font-semibold.text-ui-gray-1
        · «IT&nbsp;HR&nbsp;Тусовка от&nbsp;ХК»
      p.m-0.text-body-m.text-ui-gray-1
        · «События, статьи, советы, новости Хабр Ка…»
    img
    div.self-center
      a.base-button.inline-flex.appearance-main.size-l.is-sizeable  [href="https://t.me/ithr_tusovka" target="_self"]
        span.base-button__inner
          span.base-button__content
            · «Перейти»
```

_Разметка story `banners-innerprojectbanner--vibe`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `type` | "bot" \| "vibe" | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Построен на BaseSection: баннер — это карточка с фоном, а не отдельный примитив. Так он попадает в общий ритм колонки.
- Ширина ограничена 300px — это ширина боковой колонки Career.

## Разметка

```html
<div class="max-w-[300px]">
  <section class="base-section base-section--background-white rounded-3xl inner-project-banner flex flex-col gap-3 overflow-hidden bg-no-repeat">
    <div class="flex flex-col gap-2">
      <h3 class="m-0 text-display-s font-semibold text-ui-gray-1">IT&nbsp;HR&nbsp;Тусовка от&nbsp;ХК</h3>
      <p class="m-0 text-body-m text-ui-gray-1">События, статьи, советы, новости Хабр Карьеры</p>
    </div>
    <img width="252" height="150" src="../../ui/assets/images/inner_project_banner_vibe_bg.png" alt>
    <div class="self-center">
      <a href="https://t.me/ithr_tusovka" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable">
        <span class="base-button__inner">
          <span class="base-button__content">Перейти</span>
        </span>
      </a>
    </div>
  </section>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: фон и раскладка собраны утилитами, включая произвольный градиент в `bg-[…]`.

## Источники

- Файлы в репозитории `career-web`: `./src/components/banners/inner-project-banner.stories.ts`
- Storybook `career-web`: `banners-innerprojectbanner--vibe`, `banners-innerprojectbanner--bot`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
