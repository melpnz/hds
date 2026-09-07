# Popover (BasePopover)

| | |
|---|---|
| **Категория** | Оверлеи |
| **Корневой класс** | `.base-popover` |
| **CSS** | `ui/components/popover.css` |
| **Storybook** | `Popovers/BasePopover`, 10 story |
| **Production** | 15/16 страниц — самый переиспользуемый примитив выборки |
| **Используется в** | Dropdown, Hint (`.base-hint .base-popover`) |

## Назначение

Позиционирующая обвязка без содержательной семантики: сама по себе не
добавляет ни фона, ни рамки, ни отступов — «сырой slot-контракт»
(формулировка из docs самой story). Оформление приходит через `variant`.

## Анатомия

```html
<div class="base-popover" style="position:absolute; left:0; top:0; transform:translate(Xpx, Ypx)">
  <!-- содержимое слота -->
</div>
```

Позиционирование — не `top`/`left` напрямую, а `transform: translate()`
поверх `position:absolute; left:0; top:0` — паттерн Floating UI.

## Варианты

| Класс | Фон/рамка | Назначение |
|---|---|---|
| без класса | нет | «сырой» режим, потребитель оформляет сам |
| `.variant-common` | заливка + рамка `--background-gray` | базовая панель (пример story: фильтры) |
| `.variant-dropdown` | заливка + тень, без рамки | внутри Dropdown |
| `.variant-hub` | заливка + рамка `--icon-secondary` + тень, `text-align:left` | GAP: конкретное место использования не подтверждено |
| `.variant-tooltip` | тёмная инверсия (`--text-main` фон, `--background-primary` текст) | подсказка-однострочник |

Ни один вариант не задаёт padding, кроме `.variant-tooltip` (`4px 8px`) —
остальные оставляют отступы содержимому слота.

## Props (из Storybook `extract()`)

| Prop | Тип | Значения |
|---|---|---|
| `placement` | select | 12 позиций: `top-start\|top\|top-end\|right-start\|right\|right-end\|bottom-start\|bottom\|bottom-end\|left-start\|left\|left-end` |
| `offset` | object | `{ mainAxis?, crossAxis?, alignmentAxis? }` |
| `observeShift` | boolean | передаёт `layoutShift` в `autoUpdate` — отслеживает смещение якоря |
| `variant` | select | `common \| dropdown \| hub \| tooltip \| undefined` |

## Поведение

Построен на Floating UI: `placement` — 12 позиций, `autoUpdate` +
`observeShift` пересчитывают позицию при сдвиге якоря. **Закрывается по
клику вне popover и по Escape** — формулировка из собственного текста
story (`base-popover-story__note`), не домысел.

## Responsive

Не найдено медиазапросов в самом компоненте — адаптив, если есть,
на стороне потребителя (Dropdown/Hint).

## Доступность (наблюдаемое)

Не наблюдалось ARIA-атрибутов в snapshot.

## Ограничения

* `.variant-hub` — назначение не подтверждено конкретным местом в продукте;
* `z-index` варианта дважды объявлен по-разному (`80` на самом
  `.base-popover`, `992` внутри правил `.variant-*`) — вложенное правило
  побеждает по специфичности, но это стоит проверить при реальном
  наложении слоёв.

## Источники

* Storybook: `popovers-basepopover--*` (10 stories), `extract()` argTypes
* CSS: `base-popover-DIfjoqU2.css`
