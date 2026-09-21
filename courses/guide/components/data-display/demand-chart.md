# DemandChart

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `crs-demand-chart` — введён пакетом |
| **CSS** | `ui/components/data-display.css` |
| **Живая реализация** | [`viewer/index.html#demand-chart`](../../../viewer/index.html#demand-chart) |
| **Источник** | Figma `02_Education-NEW`, узел `14469:196385` «slot-modal/simple «Спрос по областям»» |
| **Статус** | `complete` · нормативный Figma-контракт v0.2 |

## Когда использовать

Используйте для сравнения спроса по направлениям. Компонент принят как нормативный по Figma и адаптируется к ширине контейнера; на узком phone подпись и полоса складываются вертикально.

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

## Решение v0.2

Используйте для сравнения спроса по направлениям. Компонент принят как нормативный по Figma и адаптируется к ширине контейнера; на узком phone подпись и полоса складываются вертикально.

Корень с префиксом `crs-` остаётся именем пакета, а отсутствие production-разметки явно сохраняется в provenance. Это не мешает использовать принятый Figma-контракт как нормативный.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14469:196385`
«slot-modal/simple «Спрос по областям»», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
