# Мелкие примитивы: InlineSeparator · BorderedCard · DescriptionList

| | |
|---|---|
| **Категория** | Контент |
| **CSS** | `ui/components/primitives.css` |
| **Storybook** | нет собственных story ни у одного |

Три маленьких переиспользуемых класса, объединённые в одну спецификацию —
каждый по отдельности 1–4 правила CSS.

---

## InlineSeparator

| | |
|---|---|
| **Корневой класс** | `.inline-separator` |
| **Production** | 1/16 страниц |

Разделитель фрагментов метаданных — аналог Career `inline-separator`, но
устроен проще: это обычный текстовый узел с цветом, а не декоративный
псевдоэлемент.

```html
<span>5 мая 2026</span>
<span class="inline-separator"> • </span>
<span>12 мин</span>
```

`.inline-separator--color-inherit` — убирает собственный приглушённый цвет
(`--text-secondary`), разделитель наследует цвет соседнего текста.

---

## BorderedCard

| | |
|---|---|
| **Корневой класс** | `.tm-bordered-card` |
| **Production** | 3/16 страниц, разметка подтверждена (`page-article.html`, блок похожих статей) |

Лёгкая обёртка-карточка с рамкой — без header/footer и без вариантов
padding, которые есть у Block. Использовать, когда нужна просто
рамка+padding вокруг произвольного контента, без структуры секции.

```html
<div class="tm-bordered-card">
  <div class="tm-bordered-card__type">Похожая статья</div>
  <!-- содержимое -->
</div>
```

---

## DescriptionList

| | |
|---|---|
| **Корневой класс** | `.tm-description-list` |
| **Production** | 4/16 страниц |

Список термин/значение, пять раскладок:

| Вариант | Устройство |
|---|---|
| `_variant-base` | блочная, заголовок жирным сверху |
| `_variant-columns` | заголовок и значение — по 50% в строку |
| `_variant-columns-nowrap` | то же, но крупнее line-height |
| `_variant-columns-numbers` | заголовок обычным весом слева (flex:2), значение жирным и **выровнено вправо** (flex:1) — таблица метрик с числом |
| `_variant-inline` | термин и значение в одной строке (`display:inline`) |
| `_variant-columns-info` | термин фиксированной ширины 150px слева; **схлопывается в блочную раскладку на ≤767** |

```html
<!-- columns-numbers: типичная строка статистики -->
<div class="tm-description-list_variant-columns-numbers">
  <div class="tm-description-list__title_variant-columns-numbers">Просмотры</div>
  <div class="tm-description-list__body_variant-columns-numbers">12 480</div>
</div>
```

`.tm-description-list_larger-font` — модификатор родителя, который делает
все `-columns*`-варианты внутри `flex-wrap` и растягивает их до `min-width:50%` —
применяется, когда общий кегль списка увеличен и двум колонкам тесно в ряд.

## Источники

Production: `inline-list-QYVxvp52.css`, `bordered-card-XBXkhzQo.css`,
`description-list-_JTaFT72.css`.
