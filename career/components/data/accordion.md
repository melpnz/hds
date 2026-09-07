# Accordion · Раскрывающиеся секции

| | |
|---|---|
| **Корневой класс** | `accordion` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#r3-accordion` |
| **Evidence** | Figma `accordion`; semantics нормализована по disclosure pattern |

Accordion группирует несколько disclosure items. Для одного сворачиваемого текста используйте CollapsedContent; для навигации между панелями — Tabs.

## Иконка

Указатель раскрытия — `arrow` из `single/sprite`, 24x24, справа от заголовка.
Наследует `currentColor` и поворачивается на 180 градусов при
`aria-expanded="true"`; поворот снимается при `prefers-reduced-motion: reduce`.

## Состояния

`default`, `hover`, `focus-visible`, `collapsed`, `expanded`, `disabled`. Trigger — `button` внутри heading, использует `aria-expanded` и `aria-controls`; panel имеет `id`, а закрытая panel — `hidden`.

Enter/Space переключают нативно. Фокус не переносится в panel и остаётся на trigger. Стрелочная навигация между headings опциональна, но если добавлена — должна быть полной и документированной. Single/multiple expansion задаётся группе; компонент не меняет heading level ради визуального размера. Disabled trigger остаётся читаемым, но не переключает panel. Анимация высоты учитывает reduced motion и не задерживает accessibility state.
