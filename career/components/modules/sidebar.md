# Sidebar · Боковая колонка

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `sidebar` |
| **CSS** | `ui/modules.css`, `ui/layout.css` |
| **Живая реализация** | `showcase/components.html#r4-sidebar` |

## Назначение

Контейнер боковой колонки шириной 300px, который группирует SidebarSection.
Положение слева/справа задаёт PageLayout; Sidebar не знает семейство страницы.

## Варианты

- default — обычная колонка.
- `sidebar--sticky` — залипает с отступом 12px.
- `data-responsive="hidden"` — продуктовый sidebar фильтров скрывается на
  `≤1023`; вместо него должен существовать доступный trigger FilterModal.

## Состояния

У контейнера нет interaction states. `sticky` и responsive visibility — layout
variants, не `selected/open`.

## API

- slot `default`: только SidebarSection или документированное promo.
- `sticky`: boolean layout variant.
- `responsive`: `stack | hidden`; значение `hidden` требует альтернативного
  способа доступа к содержимому.

## Responsive

Desktop width — 300px. На `≤1023` sidebar получает width 100% и перестаёт быть
sticky; вариант `hidden` удаляется из layout. Порядок колонки определяет parent.

## Доступность

`<aside>` получает `aria-label` или `aria-labelledby`, если это complementary
content. Для основной навигации используйте `<nav>`, а не generic aside.

## Источники

- [`evidence/README.md`](../../evidence/README.md): `module-sidebar-box-1440`.
- [`ui/layout.css`](../../ui/layout.css): L-2, L-6, R-3/R-5.

