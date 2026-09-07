# Dropdown

| | |
|---|---|
| **Категория** | Оверлеи |
| **Корневой класс** | `.dropdown` |
| **CSS** | `ui/components/dropdown.css` |
| **Storybook** | `Dropdowns/Dropdown`, 8 story |
| **Production** | не найден в 101 просканированном файле — монтируется по клику (`evidence/source-map.md`) |
| **Figma** | habr-lib → `dropdown` — Row (inactive/hover/pressed/not-found/loading, separator, title), dropdown-menu (mobile/desktop), scroll (native/custom) |

## Назначение

Обвязка выпадающей панели: триггер (`.head`) + панель (`.body`). Не задаёт
содержимое панели — это меню, список фильтров или что угодно ещё,
переданное в слот.

## Анатомия

```html
<div class="dropdown is-open">
  <div class="head">
    <button type="button">Открыть меню</button>
  </div>
  <div class="body align-left">
    <nav>
      <strong>Заголовок группы</strong>
      <a href="/publications">Публикации</a>
      <a href="/comments">Комментарии</a>
    </nav>
  </div>
</div>
```

## Варианты

| Класс | Эффект |
|---|---|
| `.is-open` | поднимает `z-index` до `var(--tm-dropdown-active-z-index, 993)` |
| `.body.align-left` / `.align-right` / `.align-center` | прижимает панель к краю триггера или центрирует (`transform:translate(-50%)`) |
| `.body.inline` | `min-width:auto`, без нижнего паддинга — панель встраивается в поток, не открывает отдельную площадку |
| `.body.no-padding` | убирает нижний паддинг, оставляя минимальную ширину |

Панель по умолчанию: `min-width: 300px`, `margin-top: 12px`,
`padding-bottom: 12px`, `border-radius: 4px`, тень
`0 0 12px hsl(…/16%)` — три числа заданы как CSS-переменные с фолбэками
прямо в `var()`, то есть потребитель может переопределить их точечно.

## Строка панели — один компонент с четырьмя свойствами

Figma `Row` (770:6182) — **один** компонент: `status`
(inactive / hover / pressed / not-found / loading), `type`
(dropdown / menu), `separator`, `title`. **GAP:** ни один класс строки не
найден в извлечённом `dropdown-B6xIm0Cp.css` — содержимое панели
собирается потребителем, готовых классов Dropdown не даёт. Реализовано
как FIGMA-RECONSTRUCTED в `ui/components/dropdown.css` на реальных
Habr-токенах, не на сырых Figma-хексах.

### Общее для обоих типов

| Токен Figma | Значение |
|---|---|
| `row/padding_top` / `_bottom` | 8 |
| `row/gap` | 8 |
| `row/gap_vertical` | 4 (между строкой и описанием) |
| `row/list/padding_txt` | 2 (вертикальный отступ текстового блока) |
| `row/padding_top_title` | 16 |
| `row/txt` #333333 | `--text-main` — строка и счётчик |
| `row/list/desc_txt` #909090 | `--text-secondary` — описание |
| `row/list/icon` #929ca5 | `--icon-primary`, глиф 24 |
| separator #929ca566 | `--icon-primary` с альфой 40% |
| `interface/text 14` | **14/18 у всего**: строки, описания и счётчика |

Описание набрано тем же кеглем, что и строка, — отличается только цветом.

### Чем различаются типы

| | `type=dropdown` (`.dropdown-row`) | `type=menu` (`.menu-row`) |
|---|---|---|
| Поля по горизонтали | 16 | 20 |
| Состав | иконка + текст + описание + счётчик | текст и счётчик |
| hover | заливка `--background-blue` (#eff6fa) | текст `--accent-primary` |
| pressed | заливка `--accent-primary`, текст белый, описание `--other-disabled-elements` (#c0c0c0) | текст `--accent-primary` + левая полоса 2px |

Заголовок группы (`title`) — 14/18 **w700**, цвет `--text-secondary`,
верхнее поле 16. «Не найдено» — тот же цвет, обычное начертание, по
центру. `loading` — спиннер по центру; вращение наше, макетом его не
выразить.

## Поведение

`.head{cursor:pointer}` — единственное CSS-подтверждение интерактивности.
Логика открытия/закрытия — вне CSS (Vue-компонент). Story `Opened`
показывает панель уже раскрытой добавлением класса `.is-open` на корень —
открытие переключает именно этот класс, не `display`.

## Responsive

`dropdown-menu` (770:9845) имеет ровно два варианта, оба вертикальные:
`mobile=no` (770:9846) и `mobile=yes` (770:10093). Горизонтального нет.

На телефоне панель не всплывает у триггера, а выезжает снизу на всю
ширину. Отличий от десктопной ровно три: скругление только сверху,
вертикальные поля `padding_list_mobile` = 12 вместо 4, и ручка 64×4 над
шторкой. Оверлей — `elements/dropdown/overlay`, чёрный с альфой 20%.
Реализовано как `.dropdown-sheet` / `.dropdown-sheet-overlay`.

**GAP:** брейкпоинт переключения не подтверждён CSS — в
`dropdown-B6xIm0Cp.css` медиазапросов нет, решает JS.

## Ограничения

* `.dropdown-row`/`.menu-row`/`.dropdown-sheet` — FIGMA-RECONSTRUCTED,
  не production; реальных классов пунктов меню по-прежнему не существует
  в извлечённом CSS;
* брейкпоинт мобильной трансформации панели не подтверждён CSS.

## Источники

* Storybook: `dropdowns-dropdown--*` (8 stories)
* CSS: `dropdown-B6xIm0Cp.css` (Storybook-only)
* Figma: `habr-lib`, canvas `dropdown` (848:10434) — `dropdown-menu`
  (770:9845), `Row` (770:6182)
