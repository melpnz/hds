# CompanyRatingStepsSidebar · Шаги оценки компании

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | `overflow-hidden`, `rounded-3xl`, `border` |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 3 из 3 |

## Назначение

Боковая колонка формы оценки компании: список критериев с отметкой пройденных.

## Анатомия

```
nav.overflow-hidden.rounded-3xl.border.border-ui-gray-shadow.bg-ui-white.p-1
  ul.m-0.flex.list-none.flex-col.p-1
    li
      a.company-rating-steps__link.relative.flex.min-h-[40px].w-full.items-center.overflow-hidden.rounded-xl.px-4.py-2.text-body-l.font-regular.text-ui-gray-1.no-underline.focus-visible:outline-none  [href="#company"]
        span.relative.z-[1].truncate
          · «Компания и роль»
    li
      a.company-rating-steps__link.relative.flex.min-h-[40px].w-full.items-center.overflow-hidden.rounded-xl.px-4.py-2.text-body-l.font-regular.text-ui-gray-1.no-underline.focus-visible:outline-none.company-rating-steps__link--active.bg-ui-primary-20  [aria-current="step" href="#common"]
        span.relative.z-[1].truncate
          · «Общая оценка»
    li
      a.company-rating-steps__link.relative.flex.min-h-[40px].w-full.items-center.overflow-hidden.rounded-xl.px-4.py-2.text-body-l.font-regular.text-ui-gray-1.no-underline.focus-visible:outline-none.company-rating-steps__link--disabled.cursor-default.text-ui-gray-4  [tabindex="-1" href="#recommendation"]
        span.relative.z-[1].truncate
          · «Рекомендация работодателя»
    li
      a.company-rating-steps__link.relative.flex.min-h-[40px].w-full.items-center.overflow-hidden.rounded-xl.px-4.py-2.text-body-l.font-regular.text-ui-gray-1.no-underline.focus-visible:outline-none.company-rating-steps__link--disabled.cursor-default.text-ui-gray-4  [tabindex="-1" href="#experience"]
        span.relative.z-[1].truncate
          · «Опыт и приватность»
```

_Разметка story `companies-companyratingstepssidebar--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.company-rating-steps__link--active`, `.company-rating-steps__link--disabled`, `:focus`, `:hover`.

```css
.company-rating-steps__link:hover { color:var(--color-ui-gray-1);text-decoration-line:none }
.company-rating-steps__link:focus-visible:before,.company-rating-steps__link:hover:before { opacity:.1 }
.company-rating-steps__link:focus-visible:after { opacity:.6 }
.company-rating-steps__link--active:focus-visible:before,.company-rating-steps__link--active:hover:before { opacity:0 }
.company-rating-steps__link--active:focus-visible:after { border-color:var(--color-ui-primary-60);opacity:1 }
.company-rating-steps__link--disabled:after,.company-rating-steps__link--disabled:before,.company-rating-steps__link--disabled:focus-visible:before,.company-rating-steps__link--disabled:hover:before { opacity:0 }
.company-rating-steps__link--disabled:hover { color:var(--color-ui-gray-4) }
```

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `steps` | TSTypeOperator | — | — | `object` |
| `activeStep` | string | — | — | `text` |
| `select` | CompanyRatingStep | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-primary-20` | `color-mix(in srgb,var(--color-ui-primary) 20%,transparent)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-current="step"`, `aria-disabled="true"`, `tabindex="-1"`.

## Разметка

```html
<nav class="overflow-hidden rounded-3xl border border-ui-gray-shadow bg-ui-white p-1">
  <ul class="m-0 flex list-none flex-col p-1">
    <li>
      <a href="#company" class="company-rating-steps__link relative flex min-h-[40px] w-full items-center overflow-hidden rounded-xl px-4 py-2 text-body-l font-regular text-ui-gray-1 no-underline focus-visible:outline-none">
        <span class="relative z-[1] truncate">Компания и роль</span>
      </a>
    </li>
    <li>
      <a href="#common" class="company-rating-steps__link relative flex min-h-[40px] w-full items-center overflow-hidden rounded-xl px-4 py-2 text-body-l font-regular text-ui-gray-1 no-underline focus-visible:outline-none company-rating-steps__link--active bg-ui-primary-20" aria-current="step">
        <span class="relative z-[1] truncate">Общая оценка</span>
      </a>
    </li>
    <li>
      <a href="#recommendation" class="company-rating-steps__link relative flex min-h-[40px] w-full items-center overflow-hidden rounded-xl px-4 py-2 text-body-l font-regular text-ui-gray-1 no-underline focus-visible:outline-none company-rating-steps__link--disabled cursor-default text-ui-gray-4" aria-disabled="true" tabindex="-1">
        <span class="relative z-[1] truncate">Рекомендация работодателя</span>
      </a>
    </li>
    <li>
      <a href="#experience" class="company-rating-steps__link relative flex min-h-[40px] w-full items-center overflow-hidden rounded-xl px-4 py-2 text-body-l font-regular text-ui-gray-1 no-underline focus-visible:outline-none company-rating-steps__link--disabled cursor-default text-ui-gray-4" aria-disabled="true" tabindex="-1">
        <span class="relative z-[1] truncate">Опыт и приватность</span>
      </a>
    </li>
  </ul>
</nav>
```

## CSS

```css
.company-rating-steps__link { transition:background-color .15s ease,color .15s ease }
.company-rating-steps__link:before { background-color:var(--color-ui-gray-3);z-index:0 }
.company-rating-steps__link:after,.company-rating-steps__link:before { border-radius:.75rem;content:"";top:0;right:0;bottom:0;left:0;opacity:0;pointer-events:none;position:absolute;transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1) }
.company-rating-steps__link:after { border-color:var(--color-ui-gray-2);border-width:2px;z-index:2 }
.company-rating-steps__link:hover { color:var(--color-ui-gray-1);text-decoration-line:none }
.company-rating-steps__link:focus-visible:before,.company-rating-steps__link:hover:before { opacity:.1 }
.company-rating-steps__link:focus-visible:after { opacity:.6 }
.company-rating-steps__link--active:after { border-color:var(--color-ui-primary-60) }
.company-rating-steps__link--active:focus-visible:before,.company-rating-steps__link--active:hover:before { opacity:0 }
.company-rating-steps__link--active:focus-visible:after { border-color:var(--color-ui-primary-60);opacity:1 }
.company-rating-steps__link--disabled:after,.company-rating-steps__link--disabled:before,.company-rating-steps__link--disabled:focus-visible:before,.company-rating-steps__link--disabled:hover:before { opacity:0 }
.company-rating-steps__link--disabled:hover { color:var(--color-ui-gray-4) }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/companies/company-rating/steps-sidebar.stories.ts`
- Storybook `career-web`: `companies-companyratingstepssidebar--default`, `companies-companyratingstepssidebar--first-step`, `companies-companyratingstepssidebar--disabled-states`
- CSS: секция `steps-sidebar` в `ui/components/navigation.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
