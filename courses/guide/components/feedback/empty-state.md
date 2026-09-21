# EmptyState

| | |
|---|---|
| **Категория** | Обратная связь (`feedback`) |
| **Корневой класс** | `crs-empty-state` — введён пакетом |
| **CSS** | `ui/components/feedback.css` |
| **Живая реализация** | [`viewer/index.html#empty-state`](../../../viewer/index.html#empty-state) |
| **Источник** | Figma `02_Education-NEW`, узел `12135:122618` «Empty block» |
| **Статус** | `complete` · нормативный Figma-контракт v0.2 |

## Когда использовать

Используйте для нулевой выдачи и быстрого снятия применённых фильтров. Вариант Figma принят владельцем как нормативный компонент.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-empty-state">
  <div class="crs-empty-state__text">
    <p class="crs-empty-state__title">Нет точных совпадений</p>
    <p class="crs-empty-state__hint">Попробуйте изменить или убрать некоторые фильтры</p>
  </div>
  <div class="crs-empty-state__actions">
    <button type="button" class="crs-empty-state__chip">Убрать ценовой диапазон</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Вебинар»</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Санкт-Петербург»</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Х4»</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Х5»</button>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| колонка | gap 16 — `--fig-size-spacing-x4` |
| заголовок | 24 / 28, вес 600, трекинг −0.5 |
| подпись | 14 / 20, вес 400 |
| кнопка | падинг 8 / 16, радиус 12, фон `#f1f1f1`, при наведении `#e9e9ea` |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Решение v0.2

Используйте для нулевой выдачи и быстрого снятия применённых фильтров. Вариант Figma принят владельцем как нормативный компонент.

Корень с префиксом `crs-` остаётся именем пакета, а отсутствие production-разметки явно сохраняется в provenance. Это не мешает использовать принятый Figma-контракт как нормативный.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `12135:122618`
«Empty block», прочитан `get_design_context` 10 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
