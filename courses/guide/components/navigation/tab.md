# Tab

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `crs-tab` — введён пакетом |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | [`viewer/index.html#tab`](../../../viewer/index.html#tab) |
| **Источник** | Figma `02_Education-NEW`, узел `I15089:302657;15065:242802;4843:2736;15089:302655` «tab — фильтр-выпадашка «Школа»» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only. Компонент `tab` макета — общий набор с FilterChip (см. resolvedComponentKeyCollisions). Его вариант categories продукт рисует как FilterChip, поэтому figma-only в этой записи — только то, чего в продукте нет: фильтр-выпадашка с шевроном (elements/tab/filter/*), невыбранная и выбранная синяя. Помечать figma-only, не выдавать за паттерн продакшена.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R3-13 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
  <button type="button" class="crs-tab crs-tab--icon" aria-label="Сортировка"><svg class="svg-icon crs-tab__icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#sort"></use></svg></button>
  <button type="button" class="crs-tab"><span class="crs-tab__label">Школа</span><svg class="svg-icon crs-tab__icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
  <button type="button" class="crs-tab crs-tab--selected"><span class="crs-tab__label">Школа</span><svg class="svg-icon crs-tab__icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| высота | 36 — как у инстанса макета и у продуктового `FilterChip` |
| падинг | 12 слева, 8 справа (под шеврон) — `--fig-elements-tab-filter-padding-left-right`, `--fig-size-spacing-x2` |
| невыбранный | белый, рамка `#e9e9ea`, текст `#2c2e34`; при наведении рамка `#dededf` |
| выбранный | заливка `#eff5ff`, рамка `#94bdfc`, текст и шеврон `#346ef4` |
| промежуток в ряду | 4 — `elements/chips/filter/gap` |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-tab` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Подпись «Школа» — собственный текст инстанса макета. Три образца: иконочный невыбранный (узел …15089:302651), текстовый невыбранный и текстовый выбранный (узел …15089:302655). Текстовый невыбранный собран из переменных невыбранного состояния того же компонента — `elements/tab/fill`, `border`, `text`, — отдельного инстанса с этим сочетанием на прочитанных узлах не встретилось. Обёртка ряда — оформление витрины, а не часть компонента.
- **Ассеты.** Шеврон и значок сортировки — символы `arrow-small` и `sort` общего спрайта продукта, а не экспорт макета. Контуры сверены: у макета это `icon/arrow-down` и значок с двумя стрелками, те же глифы. Цвет берут через `currentColor`, поэтому у выбранного варианта шеврон синий вместе с текстом, как в макете.
- **Состояния.** Требуемые состояния записи (`default`, `hover`, `focus-visible`, `selected`, `disabled`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `I15089:302657;15065:242802;4843:2736;15089:302655`
«tab — фильтр-выпадашка «Школа»», прочитан `get_design_context` 10 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._


## Уточнение v0.2 · FilterChip Menu / Switch

Исторический id `tab` сохранён ради совместимости, но пользовательское имя компонента — `FilterChip · Menu / Switch`. Это расширенные варианты семейства FilterChip: `FilterChipMenu` получает ведущую иконку и шеврон раскрытия, `FilterChipSwitch` — компактный switch справа. В viewer показаны `default`, `hover`, `focus-visible`, `selected`, `disabled`, `loading`, а для Menu также `open` с dropdown. Источник: Courses Figma `education-lib`, node `904:1723`.
