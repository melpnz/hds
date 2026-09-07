# MenuItem · Команда меню

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | `menu-item` |
| **CSS** | `ui/components.css` |
| **Живая реализация** | `showcase/components.html#r3-menu` |
| **Источник** | ContextMenu production; Figma `row / menu` — evidence only |

## Назначение

Одна команда внутри Menu. Корень — `button` для действия или `a` для реального перехода. Не используйте `div` с click-handler.

## Анатомия

```html
<button class="menu-item" type="button" role="menuitem">
  <svg class="svg-icon menu-item__icon" aria-hidden="true" focusable="false">…</svg>
  <span class="menu-item__label">Редактировать</span>
  <span class="menu-item__meta" aria-hidden="true">⌘E</span>
</button>
```

## Состояния

| Состояние | Контракт |
|---|---|
| `default` | доступная команда |
| `hover` | pointer hover; не заменяет keyboard active item |
| `focus-visible` | явное внутреннее кольцо |
| `pressed` | нативный `:active`; `.is-pressed` только для стенда |
| `selected` | только check/radio menuitem: `aria-checked="true"`; для текущего перехода допустим `aria-current` |
| `disabled` | `disabled` у button либо `aria-disabled="true"`; команда не активируется |

Menu управляет roving `tabindex`: только один доступный item имеет `tabindex="0"`. Иконка и shortcut не входят в tab order. Опасная команда может иметь danger appearance, но требует отдельного подтверждения по риску, а не по цвету.
