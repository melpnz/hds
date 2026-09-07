# VacancyImportCard · Карточка импорта вакансии

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | `min-h-10`, `rounded-xl`, `border` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 6 из 6 |

## Назначение

Карточка вакансии в кабинете компании при импорте из внешнего источника: статус разбора, найденные поля, действия.

## Анатомия

```
div.grid.min-h-10.grid-cols-[24px_minmax(0,1fr)_max-content_minmax(200px,max-content)_40px].items-center.gap-2.rounded-xl.border.border-solid.px-4.py-4.tablet:grid-cols-[24px_minmax(0,1fr)_40px].tablet:items-start.tablet:gap-x-2.tablet:gap-y-1.border-ui-blue.tablet:grid-rows-[repeat(3,min-content)]
  svg.svg-icon.text-ui-blue.tablet:col-start-1.tablet:row-span-2.tablet:row-start-1.desktop:col-start-1
    use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#postpone-circle"]
  div.min-w-0.text-body-l.font-semibold.text-ui-gray-1.tablet:col-start-2.tablet:row-start-1.desktop:col-start-2
    · «Загрузка вакансий»
  div.justify-self-end.tablet:col-span-full.tablet:row-start-3.tablet:mt-2.tablet:w-full.desktop:col-start-4
    button.tablet:w-full.base-button.inline-flex.appearance-main-border.size-m.is-sizeable.tablet:w-full  [type="button" target="_self"]
      span.base-button__inner
        span.base-button__content
          · «Отменить»
```

_Разметка story `companies-cp-vacancyimports-card--pending`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `companyAlias` | string | — | — | `text` |
| `importItem` | VacancyImportItem | — | — | `object` |
| `refresh` | other | — | — | `object` |
| `close` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-blue` | `#1ba1ee` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#check-circle-empty` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#danger` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#postpone-circle` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:1023px)`, `(min-width:1024px)`.

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-label="Скрыть импорт"`.

## Разметка

```html
<div class="grid min-h-10 grid-cols-[24px_minmax(0,1fr)_max-content_minmax(200px,max-content)_40px] items-center gap-2 rounded-xl border border-solid px-4 py-4 tablet:grid-cols-[24px_minmax(0,1fr)_40px] tablet:items-start tablet:gap-x-2 tablet:gap-y-1 border-ui-blue tablet:grid-rows-[repeat(3,min-content)]">
  <svg class="svg-icon text-ui-blue tablet:col-start-1 tablet:row-span-2 tablet:row-start-1 desktop:col-start-1" width="24" height="24" style="width: 24px; height: 24px;">
    <use xlink:href="../../ui/assets/icons/sprite.svg#postpone-circle"/>
  </svg>
  <div class="min-w-0 text-body-l font-semibold text-ui-gray-1 tablet:col-start-2 tablet:row-start-1 desktop:col-start-2">Загрузка вакансий</div>
  <div class="justify-self-end tablet:col-span-full tablet:row-start-3 tablet:mt-2 tablet:w-full desktop:col-start-4">
    <button class="tablet:w-full base-button inline-flex appearance-main-border size-m is-sizeable tablet:w-full" type="button" target="_self">
      <span class="base-button__inner">
        <span class="base-button__content">Отменить</span>
      </span>
    </button>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/companies/cp/vacancy-imports/cp-vacancy-import-card.stories.ts`
- Storybook `career-web`: `companies-cp-vacancyimports-card--pending`, `companies-cp-vacancyimports-card--pending-groups`, `companies-cp-vacancyimports-card--select-groups`, `companies-cp-vacancyimports-card--finished`, `companies-cp-vacancyimports-card--incomplete`, `companies-cp-vacancyimports-card--error`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
