# Calendar

| | |
|---|---|
| **Категория** | Формы / дата-время |
| **Корневой класс** | `.tm-calendar` (FIGMA-RECONSTRUCTED) |
| **CSS** | `ui/components/calendar.css` |
| **Production** | не найден — планировщик даты публикации, редактор статьи |
| **Figma** | habr-lib → `calendar` (848:10432) |

## Статус: FIGMA-RECONSTRUCTED

Ни одного calendar/date-picker класса нет в 111 извлечённых файлах —
единственный вероятный usage (выбор даты отложенной публикации) живёт в
редакторе, недоступном гостевому краулу. Собрано по Figma; цвета сверены
по hex с боевыми токенами.

## Три готовых варианта в Figma

| Вариант | Node | Размер |
|---|---|---|
| `date` | 805:8145 | 236×264 |
| `time` | 805:8341 | 108×236 |
| `date + time` | 805:7929 | 320×292 |

## Геометрия — из `get_design_context`

| Токен Figma | Значение |
|---|---|
| `elements/calendar/radius` | 4 |
| `elements/calendar/bg` | `--background-primary` |
| `elements/calendar/padding_form` | 20 |
| `elements/calendar/padding` | 4 (зазор блоков) |
| `elements/calendar/padding_out` | 12 |
| `elements/calendar/border` | `--icon-primary` с альфой 40% |
| `elements/calendar/arrow/icon` | `--icon-primary`, глиф 24 |
| ячейка даты | 28×28, радиус 4 |
| ячейка времени | 45×28 |
| сетка | 7 колонок × 28 = **196**, без зазоров |
| `interface/text 13` | 13/16 w400 |
| тень | `0 2px 12px` чёрного с альфой 20% |

## Состояния ячейки

| Класс | Токен Figma | Наш токен |
|---|---|---|
| — | `date_time/txt` #333333 | `--text-main` |
| `:hover` | `date_time/txt_hover` #548eaa | `--accent-primary`, **только текст**, без заливки |
| `_selected` | `date_time/bg_pressed` #548eaa | `--accent-primary` + белый текст |
| `_another-month` | `txt_anothermonth` #909090 | `--text-secondary` |
| `_disabled` | `bg_disable` #f7f7f7 | `--background-secondary` |

## Отключённый диапазон — одна сплошная плашка

Скругляются только **первая и последняя ячейка непрерывного ряда в
порядке разметки**, а не края каждой строки: ряд, начавшийся в середине
одной недели и закончившийся в середине следующей, выглядит одной
фигурой. В Figma это свойства `first` / `middle` / `last` у ячейки; в
CSS то же делают соседний комбинатор и `:has()`, разметке ничего знать
не нужно.

## Анатомия

```html
<div class="tm-calendar">
  <div class="tm-calendar__header">
    <button class="tm-calendar-arrow" type="button">…</button>
    <div class="tm-calendar__title">Август 2023</div>
    <button class="tm-calendar-arrow tm-calendar-arrow_next" type="button">…</button>
  </div>
  <div class="tm-calendar__grid">
    <span class="tm-calendar-cell tm-calendar-cell_another-month">31</span>
    <span class="tm-calendar-cell tm-calendar-cell_disabled">1</span>
    …
    <span class="tm-calendar-cell tm-calendar-cell_selected">17</span>
  </div>
  <a class="tm-calendar__today" href="#">Сегодня</a>
</div>
```

`date + time` добавляет `.tm-calendar__fields` сверху (это компонент
Input, не часть календаря) и `.tm-calendar__panes` с колонкой
`.tm-calendar__time` справа от сетки.

## GAP: с какого дня начинается неделя

Строки заголовка с днями недели в макете **нет вовсе**, а числа в нём
расставлены условно (за 30 июля сразу идёт 1 августа), поэтому порядок
колонок по макету определить нельзя. В нашей разметке взят понедельник —
как принято в русской локали. Это разумный выбор, а не замеренное
значение.

## Источники

Figma `habr-lib`, canvas `calendar` (848:10432): `date` (805:8145),
`time` (805:8341), `date + time` (805:7929), `cell-date-time` (791:7309),
`cell-arrow` (793:7503).
