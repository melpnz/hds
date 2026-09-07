# TimePicker · Выбор времени

| | |
|---|---|
| **Корневой класс** | `time-picker` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#r3-calendar` |

TimePicker объединяет FormField и Popover со списком допустимых времён. Для короткого фиксированного списка допустим нативный Select.

## Состояния

`default`, `hover`, `focus-visible`, `open`, `closed`, `selected`, `disabled`, `invalid`. Выбранная option использует `aria-selected="true"`; trigger синхронизирует `aria-expanded`.

## Контракт

Список следует listbox pattern: ArrowUp/Down, Home/End, Enter/Space, Escape; активная option использует `aria-activedescendant` или roving tabindex. Шаг (`step`) задаётся минутами, min/max проверяются одной функцией для ручного ввода и списка. Отображение 12/24 часа зависит от locale, внутреннее значение остаётся нормализованным. Timezone принадлежит форме/домену и явно передаётся, если влияет на результат.
