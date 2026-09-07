# Tabs

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | `.tabs` |
| **CSS** | `ui/components/tabs.css` |
| **Production** | 14/16 страниц |
| **Storybook** | нет собственных story — есть только в production и Figma |
| **Figma** | habr-lib → `tabs` — 3 размера (Small/Medium/Large) × 6 состояний, tab-panel |

## Назначение

Переключатель представления. Не компонент Storybook — реконструирован из
production CSS и живой разметки (`page-article.html`).

## Анатомия

```html
<div class="tabs">
  <div class="tabs-scroll-area">
    <div class="tabs-padding-area">
      <span class="tab-item">
        <button class="active slim tab-link">Лучшие за сутки</button>
      </span>
      <span class="tab-item">
        <button class="slim tab-link">Похожие</button>
      </span>
    </div>
  </div>
</div>
```

Разметка выше — реальный DOM со страницы статьи (класс `.active` уже стоит
на первой кнопке). Обёртки `.tabs-scroll-area`/`.tabs-padding-area`
подтверждены CSS, но не встретились вместе с `.tab-item` в одном и том же
захваченном фрагменте — производитель разметки мог их пропустить в этом
конкретном месте использования (только 2 таба, скролл не нужен). Не считать
их опциональными без проверки в месте с большим числом вкладок.

## Варианты

| Класс | Эффект |
|---|---|
| `.tabs.borderless` | без нижней линии-подложки |
| `.tab-link.slim` | высота 38px вместо 44px |

## Состояния

| Класс | Эффект |
|---|---|
| `.tab-link.active` | акцентный цвет + подчёркивание 2px снизу |
| `.tab-link.disabled` | `opacity:.4`, `pointer-events:none` |
| `:hover` | акцентный цвет текста |

## Счётчики

`.tab-counter` (акцентный цвет) и `.tab-counter-new` (зелёный,
«новое») — маленькая цифра рядом с названием вкладки.

## Responsive

**Список вкладок горизонтально прокручивается, а не переносится** —
`overflow-x:auto` на `.tabs-scroll-area`, с градиентными масками по краям
(`.tabs:before`/`:after`), сигнализирующими, что список длиннее видимой
области. На ≥1024 маска расширяется с 16px до 20px и `.tabs{overflow-x:visible}`
— то есть на десктопе список умещается целиком и прокрутка выключается
на уровне контейнера, маска-градиент остаётся неактивной декорацией.

## Ограничения

* ~~Figma показывает `Small/Medium/Large`, соответствия реальным классам
  нет — GAP~~ — **GAP снят.** `.tab-link` это и есть **Large**: совпало по
  четырём независимым признакам — шрифт (`headers/Tab` = Fira Sans Medium 14),
  `uppercase`, цвет счётчика (`large/counter` #548eaa = `.tab-counter`) и цвет
  счётчика новых (`large/counter_new_publication` #7aa600 =
  `.tab-counter-new`). Сверх того совпали высоты `tab-panel`: Figma даёт
  22 / 42 / 44 px, отрисованные Small / Medium / Large дают ровно столько же.
  `Small` и `Medium` в production отсутствуют — добавлены в `tabs.css` как
  FIGMA-RECONSTRUCTED. `.slim` (38px) — не четвёртый размер, а отдельная
  production-ная высота того же Large;
* `.tabs-dropdown` (класс существует в CSS, `position:relative;bottom:1px`)
  — назначение и разметка не подтверждены отдельно, вероятно оборачивает
  overflow-меню «ещё», аналог `more=yes` в Figma.

## Источники

* Production: `tabs-NcEC6QlL.css`, разметка — `page-article.html`
* Figma: `habr-lib`, canvas `tabs` (901:10741)

## Размеры и состояния (после сверки с Figma)

| Размер | Шрифт | Высота | uppercase | Выбранное состояние | Источник |
|---|---|---|---|---|---|
| **Large** | Fira Sans Medium 14 | 44 | да | сплошная полоса снизу 2px | production (`.tab-link`) |
| Large `.slim` | то же | 38 | да | то же | production |
| **Medium** | системный 14/400 | 42 | нет | рамка **2px**, радиус 4 | FIGMA-RECONSTRUCTED (`.size-medium`) |
| **Small** | системный 14/**700** | 22 | нет | **пунктир 1px** снизу | FIGMA-RECONSTRUCTED (`.size-small`) |

**Выбранное состояние у трёх размеров оформляется по-разному** — это не
один приём с разной толщиной: Large подчёркивает сплошной полосой, Medium
обводит рамкой, Small подчёркивает пунктиром. Проверено по символам
901:10895 (Small) и 901:10905 (Medium), не на глаз по обзорному скриншоту.

Неактивный цвет у Small и Medium — `--text-secondary` (#909090), а не
`--text-inactive`, который стоит на `.tab-item` для Large.

Цвета состояний общие для всех размеров и совпали с боевыми токенами:
inactive `#909090` = `--text-secondary`, hover и select `#548eaa` =
`--accent-primary`, disable `#c0c0c0` = `--other-disabled-elements`.

### Состояния: 6 в Figma против 4 в production

| Состояние | Figma | Production |
|---|---|---|
| inactive / hover / select / disable | есть | есть (`:hover`, `.active`, `.disabled`) |
| **focus** | кольцо, радиус 6 | своего правила нет — добавлено как **FIGMA TARGET** |
| **loading** | спиннер вместо текста | нет; не реконструирован — нужна разметка, которой в production не наблюдалось (**GAP**) |

**Расхождение по disable, не усреднено:** Figma красит в сплошной серый
`#c0c0c0`, production ставит `opacity:.4` — это гасит текст, а не
перекрашивает его, результат отличается.

### Панель Medium

~~**GAP по Medium:** в Figma эти табы лежат в серой скруглённой подложке,
но её цвет не выведен отдельной переменной~~ — **GAP снят, он был
ошибочным.** Поставлен по обзорному скриншоту, где рамка на 40% альфы
читалась как заливка. В самом символе `tab-panel` `type=Medium`
(902:10981) это не фон, а обводка, и токен у неё есть:

| Свойство | Figma | Реализация |
|---|---|---|
| рамка | `elements/tab/border` = `rgba(146,156,165,.4)` | `1px solid hsl(from var(--icon-primary) h s l / 40%)` |
| радиус | `elements/tab/medium/radius` = 4 | `border-radius: 4px` |
| внутренний отступ | `elements/tab/nopadding` = 0 | `padding: 0` |
| зазор между табами | `elements/tab/medium/gap_tabs` = 0 | `margin-right: 0` |

`rgb(146,156,165)` = `#929ca5` = `--icon-primary`. Тот же приём уже есть
в production: нижняя линия `.tabs` нарисована буквально тем же выражением
`hsl(from var(--icon-primary) h s l / 40%)` — подтверждает, что 40%-альфа
от icon-primary это штатный «цвет обводки», а не совпадение.

Medium — **единственный размер с общей обводкой вокруг группы**: Large
подчёркнут снизу одной линией на всю ширину, Small не имеет подложки
вовсе, а Medium это сегмент-контрол, где табы стыкуются вплотную.
Класс — `.tabs.size-medium`.
