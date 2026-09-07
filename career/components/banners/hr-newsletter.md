# HrNewsletterSubscription · Подписка на рассылку

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `max-w-[300px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Блок подписки на рассылку для работодателей: заголовок, поле почты, кнопка.

## Анатомия

```
div.max-w-[300px]
  div.relative
    section.base-section.base-section--background-white.rounded-3xl
      div.grid.gap-3
        h3.m-0.text-body-l.font-semibold
          · «Рассылка для HR в IT»
        p.m-0.text-body-m.text-ui-gray-1
          · «Аналитика по зарплатам, тренды рынка, ка…»
        button.base-button.inline-flex.appearance-main.size-l.is-sizeable.is-full-width  [type="button" target="_self"]
          span.base-button__inner
            span.base-button__content
              · «Подписаться»
```

_Разметка story `banners-hrnewslettersubscription--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-full-width`, `.is-sizeable`.

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<div class="max-w-[300px]">
  <div class="relative">
    <section class="base-section base-section--background-white rounded-3xl">
      <div class="grid gap-3">
        <h3 class="m-0 text-body-l font-semibold">Рассылка для HR в IT</h3>
        <p class="m-0 text-body-m text-ui-gray-1">Аналитика по зарплатам, тренды рынка, карьерные треки и маркетинговые материалы. Пишем пару раз в месяц и только по делу.</p>
        <button type="button" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable is-full-width">
          <span class="base-button__inner">
            <span class="base-button__content">Подписаться</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</div>
```

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/subscriptions/hr-newsletter-subscription.stories.ts`
- Storybook `career-web`: `banners-hrnewslettersubscription--default`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
