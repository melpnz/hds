# NewNotice · Всплывающая подсказка

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `min-h-[320px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 3 из 3 |

## Назначение

Подсказка о новой возможности, появляющаяся по условию: через время, после нескольких кликов, при переходе по ссылке. Показ и закрытие учитываются на сервере.

## Анатомия

```
div.min-h-[320px].bg-[linear-gradient(180deg,#f5f7fb_0%,#ffffff_100%)].p-6
  div.space-y-4
    div.flex.flex-wrap.gap-3
      div.rounded-md.bg-ui-white.px-3.py-2.text-body-s
        · «Отправленные действия:»
        span
          · «view»
      div.rounded-md.bg-ui-white.px-3.py-2.text-body-s
        · «Закрытий:»
        span
          · «0»
    div.fixed.bottom-4.left-1/2.z-50.w-[702px].-translate-x-1/2.animate-popUpNotice.text-body-l.tablet:w-full
      div.hidden
      div.mx-3.grid.grid-cols-[24px_auto_24px].items-start.gap-2.rounded-lg.border.border-solid.border-ui-green.bg-ui-green-overlay.py-3.pl-4.pr-3.text-font-black.shadow-float-notice
        div.text-center
          · «🎉»
        section
          h3.m-0.text-body-l.font-semibold
            · «Новая функция в профиле»
          div.my-2
            · «Открыли быстрый просмотр откликов.»
            a  [href="#guide"]
              · «Подробнее о сценарии»
            · «.»
        button.flex.cursor-pointer.items-center.justify-center.border-none.bg-transparent.p-0  [aria-label="Закрыть уведомление"]
          svg.svg-icon.h-6.w-6.text-ui-green
            use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#cross"]
```

_Разметка story `banners-newnotice--timed`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `notice` | BannerNew | — | — | — |
| `getNoticesApi` | NewNoticeApiFactory | — | — | — |
| `close` | other | — | — | — |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-green-overlay` | `#ecf8ef` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:1023px)`.

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-label="Закрыть уведомление"`.

## Поведение

- Три story — это три правила показа, а не три вида оформления.

## Разметка

```html
<div class="min-h-[320px] bg-[linear-gradient(180deg,#f5f7fb_0%,#ffffff_100%)] p-6">
  <div class="space-y-4">
    <div class="flex flex-wrap gap-3">
      <div class="rounded-md bg-ui-white px-3 py-2 text-body-s">
        Отправленные действия:
        <span data-testid="tracked-actions">view</span>
      </div>
      <div class="rounded-md bg-ui-white px-3 py-2 text-body-s">
        Закрытий:
        <span data-testid="close-count">0</span>
      </div>
    </div>
    <div class="fixed bottom-4 left-1/2 z-50 w-[702px] -translate-x-1/2 animate-popUpNotice text-body-l tablet:w-full">
      <div class="hidden"></div>
      <div class="mx-3 grid grid-cols-[24px_auto_24px] items-start gap-2 rounded-lg border border-solid border-ui-green bg-ui-green-overlay py-3 pl-4 pr-3 text-font-black shadow-float-notice">
        <div class="text-center">🎉</div>
        <section>
          <h3 class="m-0 text-body-l font-semibold">Новая функция в профиле</h3>
          <div class="my-2">
            Открыли быстрый просмотр откликов.
            <a href="#guide">Подробнее о сценарии</a>
            .
          </div>
        </section>
        <button aria-label="Закрыть уведомление" class="flex cursor-pointer items-center justify-center border-none bg-transparent p-0">
          <svg class="svg-icon h-6 w-6 text-ui-green" width="24" height="24" style="width: 24px; height: 24px;">
            <use xlink:href="../../ui/assets/icons/sprite.svg#cross"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/banners/new-notice/new-notice.stories.ts`
- Storybook `career-web`: `banners-newnotice--timed`, `banners-newnotice--click-trigger`, `banners-newnotice--link-and-close`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
