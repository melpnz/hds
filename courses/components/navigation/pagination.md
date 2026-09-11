# Pagination

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `crs-pagination` — введён пакетом |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | [`showcase/components.html#c-pagination`](../../showcase/components.html#c-pagination) |
| **Источник** | Figma `02_Education-NEW`, узел `9909:29791` «pagination» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only. В проде листания нет: вместо него кнопка «Показать еще 20». §9.6 исследования описывает пагинацию как факт продакшена — не подтверждено

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R3-14 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<nav class="crs-pagination" aria-label="Страницы">
  <button type="button" class="crs-pagination__arrow crs-pagination__arrow--prev" disabled aria-label="Предыдущая"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
  <div class="crs-pagination__pages">
    <a href="#c-pagination" class="crs-pagination__page crs-pagination__page--current" aria-current="page">1</a>
    <a href="#c-pagination" class="crs-pagination__page">2</a>
    <a href="#c-pagination" class="crs-pagination__page">3</a>
    <span class="crs-pagination__page crs-pagination__page--gap" aria-hidden="true">…</span>
  </div>
  <button type="button" class="crs-pagination__arrow crs-pagination__arrow--next" aria-label="Следующая"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
</nav>
```

## Внешний вид

| что | значение |
|---|---|
| контейнер | белый, рамка `#e9e9ea`, радиус 24, падинг 12 — `elements/pagination/*_outer` |
| страница | 36 × не меньше 36, пилюля, текст 16 / 22 |
| текущая | заливка `#eff5ff`, рамка `#94bdfc`, текст `#346ef4` |
| наведение | заливка `#f1f1f1` — живое, наведите на страницу |
| отключённая стрелка | `#d3d3d4` — `elements/button/icon_disable` |
| промежуток между страницами | 6 |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-pagination` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Номера страниц и многоточие — содержимое инстанса макета. В макете страница «2» нарисована в состоянии наведения (серая заливка); на витрине наведение живое, поэтому в покое она белая, как «3». Левая стрелка отключена: это первая страница, листать назад некуда, — ровно так она бледнее правой на скриншоте узла.
- **Ассеты.** Шевроны — символ `arrow-small` общего спрайта продукта, повёрнутый на ±90°, а не экспорт макета: у макета это тот же `icon/arrow-down`, что у хлебных крошек, контуры сверены. Тень иконочной кнопки из макета (эффект `Dropdown`) не воспроизводится: это композитный эффект, в слой токенов он не разворачивается, и на прозрачной стрелке внутри контейнера его не видно.
- **Состояния не сняты.** Требуемые состояния записи (`default`, `hover`, `focus-visible`, `current`, `disabled`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `9909:29791`
«pagination», прочитан `get_design_context` 10 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
