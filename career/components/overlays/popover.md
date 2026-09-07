# Popover · Позиционируемый оверлей

| | |
|---|---|
| **Категория** | Оверлеи |
| **Корневой класс** | `popover`, `popover__surface` |
| **CSS** | `ui/components.css` |
| **Живая реализация** | `showcase/components.html#r3-popover` |
| **Источник** | BaseDropdown/v-popper production; Figma — evidence only |

## Назначение

Немодальный позиционируемый слой для Menu и короткого интерактивного контента. Tooltip использует более узкий контракт; Select/Listbox и dialog сохраняют собственную семантику.

## Состояния

| Состояние | Контракт |
|---|---|
| `closed` | trigger `aria-expanded="false"`; surface `hidden` или отсутствует |
| `open` | trigger `aria-expanded="true"`; `data-state="open"` |

## API

- `placement`: `top-start`, `top-end`, `bottom-start`, `bottom-end`.
- `open`, `onOpenChange`, `trigger`, `content`.
- Фактический placement после collision detection записывается в `data-placement`.

## Accessibility и поведение

Trigger — реальная кнопка с `aria-expanded` и `aria-controls`; `aria-haspopup` задаёт потребитель (`menu`, `listbox`, `dialog`). Сам Popover не назначает role содержимому.

Escape и клик снаружи закрывают слой. При открытии фокус остаётся trigger либо переносится внутрь только для интерактивного popover; при Escape возвращается trigger. Focus trap отсутствует. Popup портируется в overlay root, но логический DOM/API сохраняет связь trigger-content.

Позиционер обязан обрабатывать viewport collision, scroll/resize, RTL и ширину мобильного экрана. `z-index` берётся из overlay layer, а не задаётся потребителем.

## Поверхность и вложенные компоненты

`.popover__surface` рисует поверхность — фон, радиус 16 и тень — для произвольного
содержимого. Если внутрь кладётся компонент с собственной поверхностью, слой
её не дублирует: `.popover__surface:has(> .menu)` обнуляет фон, тень и padding,
и Popover остаётся чистым позиционером. Это касается Menu и всего, что на нём
построено, — TimePicker в том числе.

Career решает это так же: `.context-menu--select .base-dropdown__content`
обнуляет `background`, `border-radius` и `box-shadow`, когда внутри лежит
`.context-menu__content` со своей поверхностью (`ui/components/navigation.css`).
