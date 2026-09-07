# Skeleton · Каркас загрузки

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | `skeleton-pulse`, `phablet-only:w-[320px]` |
| **CSS** | `ui/components/feedback.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Заглушка на время загрузки: пульсирующие прямоугольники в форме будущего содержимого. Разложена на два компонента — `skeleton-pulse` даёт анимацию, `skeleton-shape` — форму.

## Анатомия

```
div.skeleton-pulse.phablet-only:w-[320px]
  div.flex.items-center.gap-3.px-4.py-3
    div.skeleton-shape.shrink-0
    div.grow
      div.mb-3.flex.items-end.justify-between.gap-6
        div.skeleton-shape.max-w-[200px].grow
        div.skeleton-shape
      div.skeleton-shape
  div.flex.items-center.gap-3.px-4.py-3
    div.skeleton-shape.shrink-0
    div.grow
      div.mb-3.flex.items-end.justify-between.gap-6
        div.skeleton-shape.max-w-[200px].grow
        div.skeleton-shape
      div.skeleton-shape
  div.flex.items-center.gap-3.px-4.py-3
    div.skeleton-shape.shrink-0
    div.grow
      div.mb-3.flex.items-end.justify-between.gap-6
        div.skeleton-shape.max-w-[200px].grow
        div.skeleton-shape
      div.skeleton-shape
  div.flex.items-center.gap-3.px-4.py-3
    div.skeleton-shape.shrink-0
    div.grow
      div.mb-3.flex.items-end.justify-between.gap-6
        div.skeleton-shape.max-w-[200px].grow
        div.skeleton-shape
      div.skeleton-shape
  div.flex.items-center.gap-3.px-4.py-3
    div.skeleton-shape.shrink-0
    div.grow
      div.mb-3.flex.items-end.justify-between.gap-6
        div.skeleton-shape.max-w-[200px].grow
        div.skeleton-shape
      div.skeleton-shape
```

_Разметка story `conversations-list-conversationslistskeleton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Skeleton сам представляет состояние `loading`; hover, focus и selected к нему неприменимы.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `amount` | number | `15` | — | `number` |
| `narrowView` | boolean | `false` | — | `boolean` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |

## Responsive

Компонент реагирует на: `(min-width:480px) and (max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Career показывает каркас, а не спиннер, там, где известна структура будущего содержимого.

## Разметка

```html
<div class="skeleton-pulse phablet-only:w-[320px]">
  <div class="flex items-center gap-3 px-4 py-3">
    <div class="skeleton-shape shrink-0" style="width: 48px; height: 48px; border-radius: 50%;"></div>
    <div class="grow">
      <div class="mb-3 flex items-end justify-between gap-6">
        <div class="skeleton-shape max-w-[200px] grow" style="width: auto; height: 16px;"></div>
        <div class="skeleton-shape" style="width: 48px; height: 12px;"></div>
      </div>
      <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
    </div>
  </div>
  <div class="flex items-center gap-3 px-4 py-3">
    <div class="skeleton-shape shrink-0" style="width: 48px; height: 48px; border-radius: 50%;"></div>
    <div class="grow">
      <div class="mb-3 flex items-end justify-between gap-6">
        <div class="skeleton-shape max-w-[200px] grow" style="width: auto; height: 16px;"></div>
        <div class="skeleton-shape" style="width: 48px; height: 12px;"></div>
      </div>
      <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
    </div>
  </div>
  <div class="flex items-center gap-3 px-4 py-3">
    <div class="skeleton-shape shrink-0" style="width: 48px; height: 48px; border-radius: 50%;"></div>
    <div class="grow">
      <div class="mb-3 flex items-end justify-between gap-6">
        <div class="skeleton-shape max-w-[200px] grow" style="width: auto; height: 16px;"></div>
        <div class="skeleton-shape" style="width: 48px; height: 12px;"></div>
      </div>
      <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
    </div>
  </div>
  <div class="flex items-center gap-3 px-4 py-3">
    <div class="skeleton-shape shrink-0" style="width: 48px; height: 48px; border-radius: 50%;"></div>
    <div class="grow">
      <div class="mb-3 flex items-end justify-between gap-6">
        <div class="skeleton-shape max-w-[200px] grow" style="width: auto; height: 16px;"></div>
        <div class="skeleton-shape" style="width: 48px; height: 12px;"></div>
      </div>
      <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
    </div>
  </div>
  <div class="flex items-center gap-3 px-4 py-3">
    <div class="skeleton-shape shrink-0" style="width: 48px; height: 48px; border-radius: 50%;"></div>
    <div class="grow">
      <div class="mb-3 flex items-end justify-between gap-6">
        <div class="skeleton-shape max-w-[200px] grow" style="width: auto; height: 16px;"></div>
        <div class="skeleton-shape" style="width: 48px; height: 12px;"></div>
      </div>
      <div class="skeleton-shape" style="width: 100%; height: 12px;"></div>
    </div>
  </div>
</div>
```

## CSS

```css
.skeleton-pulse { position:relative }
.skeleton-pulse:before { animation:pulse 1s linear infinite;background-image:linear-gradient(90deg,#fff0,#ffffff80,#fff0);background-repeat:repeat-y;background-size:35% 100%;bottom:0;content:"";left:0;position:absolute;right:0;top:0 }
.skeleton-shape { background:var(--color-ui-gray-bg);border-radius:3px;max-width:100% }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/conversations-list-skeleton.stories.ts`
- Storybook `career-web`: `conversations-list-conversationslistskeleton--default`, `conversations-list-conversationslistskeleton--narrow`
- CSS: секция `skeleton-pulse` в `ui/components/feedback.css`, секция `skeleton-shape` в `ui/components/feedback.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

Корень `skeleton-pulse` получает `aria-hidden="true"`; родитель будущего содержимого — `aria-busy="true"`. Каркас повторяет геометрию результата, не содержит доступных кнопок/ссылок и не попадает в tab order. При завершении загрузки skeleton целиком заменяется содержимым, а не прячется только визуально.

Состояние `loading` подтверждено классами `skeleton-pulse`/`skeleton-shape`. При reduced motion pulse замедляется.
