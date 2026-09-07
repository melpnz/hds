# TextLength · Счётчик символов

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `text-length` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html#fo-textarea` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Счётчик «введено / максимум» под многострочным полем. Отдельного набора story нет — компонент виден только внутри Textarea.

## Анатомия

```
span.text-length  [id]
  · «84 / 100»
```

## Состояния

| Состояние | Контракт |
|---|---|
| `default` | текущее количество не превышает limit |
| `invalid` | количество превышает limit; `.text-length--invalid` |

`.text-length--exceeded` сохранён как legacy alias invalid. В production он
ошибочно имеет тот же серый цвет; UI kit исправляет его на semantic red.

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Textarea связывается со счётчиком через `aria-describedby`. Если ввод жёстко
ограничен `maxlength`, достаточно обычного описания. При мягком лимите invalid
counter может получить `aria-live="polite"`, но обновление не должно озвучиваться
на каждом символе до приближения к лимиту.

## CSS

```css
.text-length { color:var(--color-ui-gray-3);font-size:12px;line-height:16px;text-align:right }
.text-length--exceeded { color:var(--color-ui-gray-3) }
```

## Ограничения

- Собственных story нет. Каноническая разметка и invalid-state оформлены как UI
  kit contract на основании использования внутри Textarea.

## Источники

- Storybook `career-web`: 
- CSS: секция `text-length` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
