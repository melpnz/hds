# DatePicker · Выбор даты

| | |
|---|---|
| **Корневой класс** | `date-picker` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#r3-calendar` |

DatePicker объединяет TextInput/FormField, кнопку календаря, Popover и Calendar. Внешнее значение — дата/диапазон, а не локализованная строка поля.

## Состояния

`default`, `hover`, `focus-visible`, `open`, `closed`, `selected`, `disabled`, `invalid`. Open/closed отражаются в `aria-expanded`; ошибка — `aria-invalid` и связанный error text.

## Контракт

Поле допускает клавиатурный ввод только если парсер однозначен для locale; иначе используйте readOnly input с кнопкой. Кнопка имеет `aria-haspopup="dialog"`, `aria-controls` и доступное имя. Escape закрывает popover и возвращает фокус. Выбор даты обновляет поле; закрытие после выбора зависит от single/range mode. Min/max и недоступные даты одинаково применяются к вводу и Calendar. Не храните timezone в компоненте календарной даты без времени.
