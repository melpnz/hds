# Breadcrumbs

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `crs-breadcrumbs` — введён пакетом |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | [`showcase/components.html#c-breadcrumbs`](../../showcase/components.html#c-breadcrumbs) |
| **Источник** | Figma `02_Education-NEW`, узел `9902:39188` «Хлебные крошки» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> В снятой разметке десяти страниц крошек как списка ссылок нет. Проверено: селектор h1.absolute.bottom-20.text-small.text-ui-black-500 на /education_centers/35-yandeks-praktikum находит один узел, и это <h1> «Онлайн-школа Яндекс Практикум» — заголовок страницы, стилизованный как подпись 14/20 #909194 и вынесенный абсолютом над карточкой EntityHeader. Элемент описывается по макету (node 9902:39188); на R3-15 берётся оттуда.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R3-15 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<nav class="crs-breadcrumbs" aria-label="Хлебные крошки">
  <span class="crs-breadcrumbs__item">Text 1</span>
  <span class="crs-breadcrumbs__sep" aria-hidden="true"><svg class="svg-icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span>
  <span class="crs-breadcrumbs__item">Text 2</span>
  <span class="crs-breadcrumbs__sep" aria-hidden="true"><svg class="svg-icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span>
  <span class="crs-breadcrumbs__item">Text 3</span>
  <span class="crs-breadcrumbs__sep" aria-hidden="true"><svg class="svg-icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span>
  <span class="crs-breadcrumbs__item">Text 4</span>
</nav>
```

## Внешний вид

| что | значение |
|---|---|
| промежуток | 2px — `--fig-size-spacing-x0_5` |
| текст | 14 / 20, `#909194` — `--fig-color-style-font-secondary` |
| разделитель | коробка 20×20, символ `arrow-small` общего спрайта, поворот −90° |
| перенос | `flex-wrap` — в макете ряд переносится |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-breadcrumbs` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Подписи `Text 1`…`Text 4` — собственные значения узла макета (свойства `text1`…`text4`), а не придуманные примеры. Настоящих подписей у компонента нет: их даёт страница, а страниц с крошками в продукте не снято.
- **Ассеты.** Разделитель взят из общего спрайта продукта, а не из экспорта макета. В макете на его месте `icon/arrow-down` 20×20; глиф тот же шеврон — контуры сверены: у обоих это два отрезка, сходящиеся в точке, различается только `viewBox` (20 против 24). Своя копия иконки не заводится: у продукта символ уже есть, и вторая копия разошлась бы с первой при следующей правке спрайта.
- **Состояния.** Требуемые состояния записи (`default`, `hover`, `focus-visible`, `current`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `9902:39188`
«Хлебные крошки», прочитан `get_design_context` 10 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
