# SidebarAdCompany · Реклама компании

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `max-w-[300px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Рекламный блок компании в боковой колонке листинга: логотип, название, короткий текст, ссылка.

## Анатомия

```
div.max-w-[300px]
  section.base-section.base-section--background-white.rounded-3xl
    h3.m-0.text-body-l.font-semibold
      · «Работодатель месяца»
    div.mt-3.grid.gap-3
      a.mx-auto.my-2.block.h-[140px].w-[140px]  [href="/company/habr-career"]
        img.block.h-full.w-full.rounded-3xl.object-cover
      div.grid.justify-items-center.gap-1.text-center
        a.inline-flex.max-w-full.items-center.justify-center.gap-1.text-body-l.font-semibold.text-inherit.no-underline.hover:no-underline  [href="/company/habr-career"]
          span.min-w-0.truncate
            · «Хабр Карьера»
          span.inline-flex.shrink-0.items-center.gap-1
            svg.svg-icon.relative.top-[1px].text-ui-primary
              …
            svg.svg-icon.relative.top-[1px]
              …
        a.inline-flex.items-center.text-body-m.font-semibold.text-ui-green.no-underline.hover:no-underline  [href="/company/habr-career/rating"]
          svg.svg-icon.shrink-0
            use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#star-small"]
          span
            · «4.9»
        div.text-body-m.text-ui-gray-1
          · «Платформа для найма и развития IT-специа…»
        a.text-body-m.font-semibold.text-ui-blue-accent.no-underline.hover:no-underline  [href="/company/habr-career"]
          · «О компании»
    a.mt-3.base-button.inline-flex.appearance-passive.size-l.is-sizeable.is-full-width.mt-3  [href="/company/habr-career/vacancies" target="_self"]
      span.base-button__inner
        span.base-button__content
          · «Активные вакансии (12)»
```

_Разметка story `banners-sidebaradcompany--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-full-width`, `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `adCompany` | SidebarAdCompany | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-blue-accent` | `#0464d2` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#accreditation` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#habr-icon-14` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#star-small` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<div class="max-w-[300px]">
  <section class="base-section base-section--background-white rounded-3xl">
    <h3 class="m-0 text-body-l font-semibold">Работодатель месяца</h3>
    <div class="mt-3 grid gap-3">
      <a class="mx-auto my-2 block h-[140px] w-[140px]" href="/company/habr-career">
        <img class="block h-full w-full rounded-3xl object-cover" alt="Логотип компании Хабр Карьера" src="../../ui/assets/illustrations/avatar-default-company.svg">
      </a>
      <div class="grid justify-items-center gap-1 text-center">
        <a class="inline-flex max-w-full items-center justify-center gap-1 text-body-l font-semibold text-inherit no-underline hover:no-underline" href="/company/habr-career">
          <span class="min-w-0 truncate">Хабр Карьера</span>
          <span class="inline-flex shrink-0 items-center gap-1">
            <svg class="svg-icon relative top-[1px] text-ui-primary" width="16" height="16" style="width: 16px; height: 16px;">
              <use xlink:href="../../ui/assets/icons/sprite.svg#accreditation"/>
            </svg>
            <svg class="svg-icon relative top-[1px]" width="14" height="14" style="width: 14px; height: 14px;">
              <use xlink:href="../../ui/assets/icons/sprite.svg#habr-icon-14"/>
            </svg>
          </span>
        </a>
        <a href="/company/habr-career/rating" title="Рейтинг" class="inline-flex items-center text-body-m font-semibold text-ui-green no-underline hover:no-underline">
          <svg class="svg-icon shrink-0" width="24" height="24" style="width: 24px; height: 24px;">
            <use xlink:href="../../ui/assets/icons/sprite.svg#star-small"/>
          </svg>
          <span>4.9</span>
        </a>
        <div class="text-body-m text-ui-gray-1">Платформа для найма и развития IT-специалистов.</div>
        <a class="text-body-m font-semibold text-ui-blue-accent no-underline hover:no-underline" href="/company/habr-career">О компании</a>
      </div>
    </div>
    <a class="mt-3 base-button inline-flex appearance-passive size-l is-sizeable is-full-width mt-3" href="/company/habr-career/vacancies" target="_self">
      <span class="base-button__inner">
        <span class="base-button__content">Активные вакансии (12)</span>
      </span>
    </a>
  </section>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/companies/sidebar-ad-company.stories.ts`
- Storybook `career-web`: `banners-sidebaradcompany--default`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
