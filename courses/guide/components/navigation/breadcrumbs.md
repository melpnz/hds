# Breadcrumbs

> Текущая реализация: [API UI Kit 1.3.1](../../../machine/providers/courses-nuxt-kit/breadcrumbs.json).
> DOM/CSS, снимки и дроби вхождений ниже — историческое evidence, не исходники кита.
> Для сборки страниц применяйте [принятые правила](../../../docs/guide/production-pages.md).

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `crs-breadcrumbs` — введён пакетом |
| **CSS** | `ui/components/navigation.css` |
| **Живая реализация** | [`viewer/index.html#breadcrumbs`](../../../viewer/index.html#breadcrumbs) |
| **Источник** | Figma `02_Education-NEW`, узел `9902:39188` «Хлебные крошки» |
| **Статус** | `complete` в machine-гайде v1.1; происхождение — production и Figma |

## Когда использовать

Использовать для пути внутри категории курсов, когда пользователь должен вернуться
к более широкому направлению. Production-вариант подтверждён на страницах категорий,
включая `/courses/nejronnye-seti/gpt` и `/courses/dizajn/3d-modelling`.

В UI Kit `tone="default"` предназначен для светлого фона, `tone="inverse"` —
для синего фона `SiteHeader`. Текущий пункт передаётся без ссылки и получает
`aria-current="page"`. В inverse-варианте текст белый, а разделители используют
нейтральный `black-200`, как на production. Длинный путь переносится и не расширяет viewport.
Стрелка следует непосредственно за текстом крошки, включая переносы на phone,
а не закрепляется у правого края всей строки.

## Разметка

Базовая разметка впервые описана по узлу макета и затем подтверждена production.
В UI Kit ту же структуру рендерит `Breadcrumbs`.

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

Длинная крошка остаётся однострочной и обрезается с `text-overflow: ellipsis`, поэтому не расширяет hero и не создаёт горизонтальный скролл.

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
- **Состояния.** `default`, `hover`, `focus-visible` и `current` показаны в живом примере. Production-вариант сверён на `/courses/dizajn/3d-modelling`: крошки лежат на синем hero-фоне, ссылки белые, текущий пункт — текст с `aria-current="page"`.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `9902:39188`
«Хлебные крошки», прочитан `get_design_context` 10 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
