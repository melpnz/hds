# FilterModal · Мобильные фильтры

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `filter-modal` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-filters` |

## Назначение

Modal adapter для того же FilterPanel, который на desktop находится в Sidebar.
FilterModal владеет только overlay, focus lifecycle, заголовком и нижней панелью
действий; поля и их model принадлежат FilterPanel.

## Состояния

- `closed`: overlay скрыт/размонтирован, trigger имеет `aria-expanded="false"`.
- `open`: `role="dialog"`, `aria-modal="true"`, доступное имя и focus trap;
  trigger имеет `aria-expanded="true"`.
- `loading`: dialog и вложенный FilterPanel получают `aria-busy="true"`, submit
  блокируется и показывает Loader.

## API

- `open`: controlled state; события `open`, `close`, `submit`, `reset`.
- `title`, `resultCount` и `triggerId`.
- slot `default`: ровно один FilterPanel с общей model value.
- Закрытие без submit сохраняет draft только если это явно решено продуктом;
  default — откат к последним применённым значениям.

## Responsive

На `≤479` dialog становится bottom sheet с радиусом только сверху и высотой не
больше viewport. На большей ширине — центрированное окно до 480px. Это варианты
раскладки одного dialog, не отдельные `mobile/tablet` компоненты.

## Доступность

- Trigger: FilterButton с `aria-haspopup="dialog"`, `aria-expanded` и
  `aria-controls`.
- Dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- При открытии фокус переходит на первый control; Tab остаётся внутри.
- Escape/close возвращают фокус trigger. Фоновый документ становится inert в
  приложении; showcase ограничивает trap самим примером.

## Источники

- [`overlays/modal.md`](../overlays/modal.md): modal lifecycle.
- [`actions/filter-button.md`](../actions/filter-button.md): trigger contract.
- [`ui/layout.css`](../../ui/layout.css): R-3/R-4, скрытие desktop sidebar.

