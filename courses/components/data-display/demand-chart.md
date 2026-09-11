# DemandChart

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `crs-demand-chart` — введён пакетом |
| **CSS** | `ui/components/data-display.css` |
| **Живая реализация** | [`showcase/components.html#c-demand-chart`](../../showcase/components.html#c-demand-chart) |
| **Источник** | Figma `02_Education-NEW`, узел `14469:196385` «slot-modal/simple «Спрос по областям»» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: горизонтальная столбчатая диаграмма «подпись → полоса» со страницы профессии. Раздела профессий в продукте нет. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R3-17 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-demand-chart" style="max-width:315px">
  <p class="crs-demand-chart__title">Спрос по областям</p>
  <div class="crs-demand-chart__rows">
    <span class="crs-demand-chart__label">Финтех</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:1"></div></div>
    <span class="crs-demand-chart__label">E-commerce</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.88"></div></div>
    <span class="crs-demand-chart__label">AI/ML</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.65"></div></div>
    <span class="crs-demand-chart__label">EdTech</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.47"></div></div>
    <span class="crs-demand-chart__label">Госсектор</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.42"></div></div>
    <span class="crs-demand-chart__label">GameDev</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.38"></div></div>
    <span class="crs-demand-chart__label">Сфера 1</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.38"></div></div>
    <span class="crs-demand-chart__label">Сфера 2</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:0.38"></div></div>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| блок | рамка `#e9e9ea`, радиус 24, падинг 24, промежуток 12 |
| заголовок | 16 / 22, 600 |
| сетка | подписи по содержимому, полосы на остаток; промежутки 12 по горизонтали, 8 по вертикали |
| полоса | дорожка `#f1f1f1` пилюлей, заливка 12 `#6bacfd` радиусом 6 |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-demand-chart` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Подписи — дословно из узла, включая наполнитель «Сфера 1» и «Сфера 2». Длины полос в макете заданы правым падингом дорожки в пикселях (0, 20, 60, 90, 98, 105, 105, 105 при ширине 170); здесь переведены в доли той же ширины и округлены до сотых. Ширина 315 — узел макета.
- **Ассеты.** Ассетов нет.
- **Состояния.** Требуемые состояния записи (`default`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14469:196385`
«slot-modal/simple «Спрос по областям»», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
