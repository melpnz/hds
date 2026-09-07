# Menu · Меню команд

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | `menu` |
| **CSS** | `ui/components.css` |
| **Живая реализация** | `showcase/components.html#r3-menu` |
| **Источник** | ContextMenu/BaseDropdown production; Figma — evidence only |

## Назначение

Список команд, открываемый кнопкой. Menu не используется для обычной навигации, выбора одного значения формы или произвольного контента: для них нужны ссылки, Select/Listbox или Popover.

## Анатомия

```html
<div class="popover">
  <button type="button" aria-haspopup="menu" aria-expanded="true" aria-controls="actions-menu">Действия</button>
  <div class="popover__surface" data-state="open" data-placement="bottom-end">
    <div class="menu" id="actions-menu" role="menu" aria-label="Действия с вакансией">
      <button class="menu-item" type="button" role="menuitem" tabindex="0">Редактировать</button>
      <button class="menu-item" type="button" role="menuitem" tabindex="-1">Дублировать</button>
    </div>
  </div>
</div>
```

## Состояния

| Состояние | Контракт |
|---|---|
| `closed` | trigger `aria-expanded="false"`; popup `hidden`/не смонтирован |
| `open` | trigger `aria-expanded="true"`; menu видимо и доступно |

## Keyboard и focus

- Enter/Space/ArrowDown открывают и фокусируют первый доступный item; ArrowUp — последний.
- Up/Down перемещают фокус циклически; Home/End — к первому/последнему.
- Escape закрывает и возвращает фокус trigger; Tab закрывает без focus trap.
- Поиск по первой букве рекомендуется для длинного меню.

## Ограничения

Menu — поведенческий компонент поверх Popover и MenuItem. Позиционирование и collision handling принадлежат Popover.
