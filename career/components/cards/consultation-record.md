# ConsultationRecord · Строка консультации

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | `max-w-[800px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 11 из 11 |

## Назначение

Строка списка консультаций: собеседник, комментарий, действия. Один компонент обслуживает две роли — эксперта и клиента — и все состояния заявки.

## Анатомия

```
div.max-w-[800px].px-6
  div.flex.justify-between.phone:flex-col.phone:gap-3.mt-3.pb-3.pt-4
    div.flex.w-[312px].justify-between.gap-2.overflow-hidden.phone:w-full
      a.flex.items-center.gap-2.overflow-hidden.hover:no-underline  [href="/litvinenkomary"]
        span.base-avatar
          img.base-avatar__img
        div.flex.flex-col.overflow-hidden
          span.truncate.text-body-l.font-semibold.text-font-black
            · «Мария-Екатерина Литвиненко ван Мелле»
          span.truncate.text-body-m.text-font-gray
            · «Булшит-детектор»
      a.h-10.w-10.p-2  [href="/conversations/litvinenkomary"]
        svg.svg-icon.text-icon-gray
          use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#message"]
    div.hidden.rounded-lg.rounded-tl-none.bg-header-gray-bg.px-4.py-2.phone:block
      · «фыьвар яьбмо»
    div.flex.flex-shrink-0.items-center
      div.flex.gap-2
        button.base-button.inline-flex.appearance-main.size-m.is-sizeable  [type="button" target="_self" name="apply"]
          span.base-button__inner
            span.base-button__content
              · «Подтвердить»
        button.base-button.inline-flex.appearance-main-border.size-m.is-sizeable  [type="button" target="_self" name="decline"]
          span.base-button__inner
            span.base-button__content
              · «Отклонить»
  div.mb-3.block.rounded-lg.rounded-tl-none.bg-header-gray-bg.px-4.py-2.phone:hidden
    · «фыьвар яьбмо»
```

_Разметка story `consultations-consultationrecord--expert-created`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `consultation` | UserConsultationItem | — | — | `object` |
| `status` | UserConsultationStatus | — | — | `object` |
| `index` | number | — | — | `number` |
| `isExpertView` | boolean | — | — | `boolean` |
| `refresh` | other | — | — | `object` |
| `updateItem` | UserConsultationItem | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-font-link` | `var(--color-ui-blue-accent)` | из `:root` Career |
| `--color-header-gray-bg` | `#f3f3f3` | из `:root` Career |
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-purple` | `#b574e7` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow-down` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#message` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#star-small` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Одиннадцать story перебирают связку «роль × статус»: заявка создана, подтверждена, завершена, отклонена, оценена. Это готовая карта состояний процесса.
- Комментарий на широком экране стоит под строкой, на `phone:` (≤767px) — внутри неё: два узла с `phone:block` / `phone:hidden`, а не один переставляемый.

## Разметка

```html
<div class="max-w-[800px] px-6">
  <div class="flex justify-between phone:flex-col phone:gap-3 mt-3 pb-3 pt-4">
    <div class="flex w-[312px] justify-between gap-2 overflow-hidden phone:w-full">
      <a href="/litvinenkomary" rel="noopener noreferrer" class="flex items-center gap-2 overflow-hidden hover:no-underline">
        <span class="base-avatar" style="--avatar-size: 36px; --avatar-radius: 9999px;">
          <img src="../../ui/assets/illustrations/avatar-default-user.svg" class="base-avatar__img">
        </span>
        <div class="flex flex-col overflow-hidden">
          <span class="truncate text-body-l font-semibold text-font-black">Мария-Екатерина Литвиненко ван Мелле</span>
          <span class="truncate text-body-m text-font-gray">Булшит-детектор</span>
        </div>
      </a>
      <a href="/conversations/litvinenkomary" class="h-10 w-10 p-2">
        <svg class="svg-icon text-icon-gray" width="24" height="24" style="width: 24px; height: 24px;">
          <use xlink:href="../../ui/assets/icons/sprite.svg#message"/>
        </svg>
      </a>
    </div>
    <div class="hidden rounded-lg rounded-tl-none bg-header-gray-bg px-4 py-2 phone:block">фыьвар яьбмо</div>
    <div class="flex flex-shrink-0 items-center">
      <div class="flex gap-2">
        <button name="apply" type="button" target="_self" class="base-button inline-flex appearance-main size-m is-sizeable">
          <span class="base-button__inner">
            <span class="base-button__content">Подтвердить</span>
          </span>
        </button>
        <button name="decline" type="button" target="_self" class="base-button inline-flex appearance-main-border size-m is-sizeable">
          <span class="base-button__inner">
            <span class="base-button__content">Отклонить</span>
          </span>
        </button>
      </div>
    </div>
  </div>
  <div class="mb-3 block rounded-lg rounded-tl-none bg-header-gray-bg px-4 py-2 phone:hidden">фыьвар яьбмо</div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/consultations/consultation-record.stories.ts`
- Storybook `career-web`: `consultations-consultationrecord--expert-created`, `consultations-consultationrecord--expert-not-completed`, `consultations-consultationrecord--expert-confirmed`, `consultations-consultationrecord--expert-completed-with-score`, `consultations-consultationrecord--expert-completed-without-score`, `consultations-consultationrecord--expert-cancelled`, `consultations-consultationrecord--client-created`, `consultations-consultationrecord--client-confirmed`, `consultations-consultationrecord--client-score-form`, `consultations-consultationrecord--client-completed-with-score`, `consultations-consultationrecord--client-cancelled`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
