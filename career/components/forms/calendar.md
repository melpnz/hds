# Calendar · Календарная сетка

| | |
|---|---|
| **Корневой класс** | `calendar` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#r3-calendar` |
| **Evidence** | Figma `calendar / date-elements`; API нормализован по HTML/ARIA patterns |

Calendar отображает один месяц и выбирает дату или диапазон. Это внутренний компонент DatePicker, но может использоваться отдельно.

## Состояния

`default`, `hover`, `focus-visible`, `selected` (`aria-selected="true"`), `current`/today (`aria-current="date"`), `disabled`; дополнительные data variants: `data-in-range` и `data-outside-month`.

## Семантика и keyboard

Заголовок месяца — live-регион `polite`; сетка имеет доступное имя. День — `button` с полным `aria-label`. В tab order находится одна дата (roving tabindex). Стрелки двигают по дням/неделям, Home/End — по неделе, PageUp/PageDown — по месяцам, Enter/Space выбирают. Disabled даты пропускаются или объявляются недоступными. Locale определяет первый день недели, подписи и формат; вычисления используют реальную calendar library, не строки.

Range selection не обозначается одним цветом: начало/конец имеют полные доступные подписи. Изменение месяца не переносит фокус в document body.
