# PrettyScroll · Оформленная прокрутка

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | — |
| **CSS** | `ui/components/primitives.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Обёртка с тонкой оформленной полосой прокрутки для списков внутри модальных окон и боковых панелей.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

Подтверждены CSS и разметкой: `:hover`.

```css
.simplebar-scrolling .simplebar-track,.simplebar-wrapper:hover~.simplebar-track { opacity:.3 }
```

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-gray` | `#ccc` | из `:root` Career |
| `--pretty-scroll-content-gap` | — | задаётся компонентом или средой, значения в сборке нет |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
[data-simplebar] { align-content:flex-start;align-items:flex-start;flex-direction:column;flex-wrap:wrap;justify-content:flex-start;position:relative }
.simplebar-wrapper { height:inherit;max-height:inherit;max-width:inherit;overflow:hidden;width:inherit }
.simplebar-mask { direction:inherit;height:auto!important;overflow:hidden;width:auto!important;z-index:0 }
.simplebar-mask,.simplebar-offset { bottom:0;left:0;margin:0;padding:0;position:absolute;right:0;top:0 }
.simplebar-offset { box-sizing:inherit!important;direction:inherit!important;resize:none!important;-webkit-overflow-scrolling:touch }
.simplebar-content-wrapper { box-sizing:border-box!important;direction:inherit;display:block;height:100%;max-height:100%;max-width:100%;overflow:auto;position:relative;scrollbar-width:none;width:auto;-ms-overflow-style:none }
.simplebar-content-wrapper::-webkit-scrollbar,.simplebar-hide-scrollbar::-webkit-scrollbar { display:none;height:0;width:0 }
.simplebar-content:after,.simplebar-content:before { content:" ";display:table }
.simplebar-placeholder { max-height:100%;max-width:100%;pointer-events:none;width:100% }
.simplebar-height-auto-observer-wrapper { box-sizing:inherit!important;flex-basis:0;flex-grow:inherit;flex-shrink:0;float:left;height:100%;margin:0;max-height:1px;max-width:1px;overflow:hidden;padding:0;pointer-events:none;position:relative;width:100%;z-index:-1 }
.simplebar-height-auto-observer { box-sizing:inherit;display:block;height:1000%;left:0;min-height:1px;min-width:1px;opacity:0;top:0;width:1000%;z-index:-1 }
.simplebar-height-auto-observer,.simplebar-track { overflow:hidden;pointer-events:none;position:absolute }
.simplebar-track { opacity:0;transition:opacity .3s ease-out }
[data-simplebar].simplebar-dragging,[data-simplebar].simplebar-dragging .simplebar-content { pointer-events:none;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;user-select:none }
[data-simplebar].simplebar-dragging .simplebar-track { pointer-events:all }
.simplebar-scrollbar { z-index:1 }
.simplebar-scrollbar:before { bottom:2px;left:2px;right:2px;top:2px }
.simplebar-scrollbar.simplebar-visible:before { opacity:.5;transition-delay:0s;transition-duration:0s }
.simplebar-track.simplebar-vertical { width:12px }
.simplebar-track.simplebar-horizontal { height:12px }
.simplebar-track.simplebar-horizontal .simplebar-scrollbar { bottom:0;left:0;min-height:0;min-width:10px;right:auto;top:0;width:auto }
[data-simplebar-direction=rtl] .simplebar-track.simplebar-vertical { left:0;right:auto }
.simplebar-dummy-scrollbar-size { direction:rtl;height:500px;opacity:0;overflow-x:scroll;overflow-y:hidden;position:fixed;visibility:hidden;width:500px;-ms-overflow-style:scrollbar!important }
.simplebar-dummy-scrollbar-size>div { height:200%;margin:10px 0;width:200% }
.simplebar-hide-scrollbar { left:0;overflow-y:scroll;position:fixed;scrollbar-width:none;visibility:hidden;-ms-overflow-style:none }
.pretty-scroll__content>*+*,.pretty-scroll__content>:only-child>*+* { margin-top:var(--pretty-scroll-content-gap) }
.simplebar-content { padding:4px!important }
.simplebar-scrolling .simplebar-track,.simplebar-wrapper:hover~.simplebar-track { opacity:.3 }
.simplebar-scrollbar.simplebar-scrollbar:before { background:var(--color-font-black);border-radius:8px;bottom:4px;left:4px;opacity:1;right:4px;top:4px;z-index:2 }
.simplebar-track:after { background:var(--color-ui-gray);border-radius:8px;bottom:4px;content:"";left:4px;position:absolute;right:4px;top:4px }
.simplebar-vertical.simplebar-hover .simplebar-scrollbar.simplebar-scrollbar:before,.simplebar-vertical.simplebar-hover:after { left:0 }
```

## Ограничения

- Собственных story нет — данные из CSS.

## Источники

- Storybook `career-web`: 
- CSS: секция `pretty-scroll` в `ui/components/primitives.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

PrettyScroll оформляет native scroll container и не вводит выбранные/нажатые состояния. `hover` в исходном CSS относится только к видимости scrollbar chrome.

Прокручиваемая область должна работать колесом, touch и клавиатурой. Когда она не получает нативный keyboard focus, используйте `tabindex="0"`, класс `pretty-scroll__viewport` и доступное имя через `aria-label`/`aria-labelledby`. Не скрывайте системную прокрутку, если custom scrollbar не инициализировался. Контент сохраняет DOM-порядок.
