# TrackBanner · Баннер трека

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `max-w-[760px]`, `max-w-[343px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Баннер обучающего трека. Есть отдельная story для мобильного вида.

## Анатомия

```
div.max-w-[760px]
  div.relative.flex.min-h-[176px].w-full.flex-col.items-center.gap-2.overflow-hidden.rounded-3xl.bg-[#CCC2FF].bg-cover.bg-center.bg-no-repeat.p-8.text-[#7e61bd]
    a.absolute.inset-0.cursor-pointer.hover:bg-[rgba(193,165,252,0.2)]  [href="https://track.habr.com/ipr" target="_blank"]
    div.text-body-l
      · «Создайте свой»
    div.text-center.text-hero.font-semibold.leading-[40px].phone:text-[32px].phone:leading-[32px]
      div
        · «Индивидуальный»
      div
        · «план развития»
    div.text-body-l
      · «на track.habr.com»
```

_Разметка story `banners-trackbanner--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

_Компонент не обращается к переменным напрямую._

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<div class="max-w-[760px]">
  <div class="relative flex min-h-[176px] w-full flex-col items-center gap-2 overflow-hidden rounded-3xl bg-[#CCC2FF] bg-cover bg-center bg-no-repeat p-8 text-[#7e61bd]" style="background-image: url(&quot;https://assets.habr.com/staging-career-web/career-web/images/banners/assessment-results-banner.png&quot;);">
    <a href="https://track.habr.com/ipr" target="_blank" class="absolute inset-0 cursor-pointer hover:bg-[rgba(193,165,252,0.2)]"></a>
    <div class="text-body-l">Создайте свой</div>
    <div class="text-center text-hero font-semibold leading-[40px] phone:text-[32px] phone:leading-[32px]">
      <div>Индивидуальный</div>
      <div>план развития</div>
    </div>
    <div class="text-body-l">на track.habr.com</div>
  </div>
</div>
```

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/banners/track-banner.stories.ts`
- Storybook `career-web`: `banners-trackbanner--default`, `banners-trackbanner--mobile`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
