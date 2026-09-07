# ButtonRange · Диапазон кнопками

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `button-range` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html#a-range` |
| **Snapshot Storybook** | 0 из 3 |

## Назначение

Выбор диапазона рядом кнопок — например, стажа или зарплатной вилки. Альтернатива слайдеру там, где значений немного и они дискретны.

## Анатомия

```
div.button-range  [role="group" aria-label]
  button.button-range__button  [type="button" aria-pressed]
    span.button-range__name
```

Это каноническая разметка UI kit, восстановленная по production CSS. Она не
выдаётся за DOM snapshot недоступной Storybook story.

## Состояния

| Состояние | Канонический контракт | Совместимость |
|---|---|---|
| `default` | `aria-pressed="false"` | без modifier |
| `hover` | `:hover` | production CSS |
| `focus-visible` | `:focus-visible` | production CSS |
| `pressed` | `:active` | `.is-pressed` только для story |
| `selected` | `aria-pressed="true"` | `.button-range__button--active` |
| `disabled` | нативный `disabled` | `aria-disabled="true"` только если используется не-button element |

Для одиночного выбора допустима реализация как radio group. В этом случае
источник состояния — checked radio input, а `aria-pressed` на кнопках не нужен.
Название `--active` сохраняется только как существующий CSS alias; публичное
состояние называется `selected`.

Подтверждены CSS и разметкой: `.button-range__button--active`, `:focus`, `:hover`.

```css
.button-range__button:focus-visible,.button-range__button:hover { background-color:var(--color-ui-gray-3-20) }
.button-range__button--active,.button-range__button--active:focus-visible,.button-range__button--active:hover { background-color:var(--color-ui-primary);color:var(--color-ui-white) }
.button-range__button:focus-visible { box-shadow:0 0 0 2px var(--color-ui-primary-60);outline:none }
```

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-gray-3-20` | `color-mix(in srgb,var(--color-ui-gray-3) 20%,transparent)` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

У группы должно быть доступное имя. Для независимых toggle-значений каждая
кнопка использует `aria-pressed`; для одиночного выбора предпочтительна radio
group с нативными input. Управление с клавиатуры обеспечивает `<button>`.

## CSS

```css
.button-range { background-color:var(--color-ui-gray-3-10);border-radius:200px;display:grid;gap:0;grid-auto-columns:minmax(0,1fr);grid-auto-flow:column;padding:4px;width:100% }
.button-range--hasLabels { margin-bottom:36px }
.button-range__button { border-radius:200px;color:var(--color-ui-gray-1);cursor:pointer;min-height:28px;padding:4px 8px;position:relative;text-align:center;transition:background-color .2s ease,color .2s ease,box-shadow .2s ease }
.button-range--shrink { display:flex;max-width:-moz-max-content;max-width:max-content;width:auto }
.button-range__button--shrink { padding-left:8px;padding-right:8px }
.button-range__button:focus-visible,.button-range__button:hover { background-color:var(--color-ui-gray-3-20) }
.button-range__button--active,.button-range__button--active:focus-visible,.button-range__button--active:hover { background-color:var(--color-ui-primary);color:var(--color-ui-white) }
.button-range__button:focus-visible { box-shadow:0 0 0 2px var(--color-ui-primary-60);outline:none }
.button-range__button--labeled:after { background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.2),rgba(0,0,0,.2) 1px,transparent 0,transparent 3px);bottom:-16px;content:"";height:10px;left:50%;position:absolute;transform:translate(-50%);width:1px }
.button-range__name { font-size:14px;font-weight:600;line-height:20px;text-align:center }
.button-range__input { display:none }
.button-range__label { bottom:-36px;color:var(--color-ui-gray-3);font-size:13px;font-weight:400;left:50%;line-height:17px;pointer-events:none;position:absolute;transform:translate(-50%);white-space:nowrap }
@media (max-width:767px) {
  .button-range__button--shrink { padding-left:8px;padding-right:8px }
  .button-range--hasLabels { margin-bottom:48px }
  .button-range__label { bottom:-48px;white-space:normal;width:120px }
}
```

## Ограничения

- Все три story сломаны в самом Storybook Career: сборка не отдаёт два чанка (`-iqz-73v.js`, `-2YzXgxt.js`, оба 404). Разметка не снята.
- Показанная анатомия — новый канонический UI kit pattern, а не восстановленный
  DOM существующей Vue-реализации. Для сверки исторической структуры всё ещё
  нужна рабочая сборка Storybook или production page.
- Это ограничение source evidence, а не блокер использования нового контракта.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/button-range.stories.ts`
- Storybook `career-web`: `form-buttonrange--recommendation`, `form-buttonrange--empty-recommendation`, `form-buttonrange--compact`
- CSS: секция `button-range` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
