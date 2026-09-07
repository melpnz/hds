# Block

| | |
|---|---|
| **Категория** | Контент |
| **Корневой класс** | `.tm-block` |
| **CSS** | `ui/components/block.css` |
| **Storybook** | `Block`, 5 story |
| **Production** | не найден в 101 просканированном файле — Storybook-only (`evidence/source-map.md`) |

## Назначение

Обёртка секции с заголовком, телом и подвалом — ближайший смысловой
аналог `base-section` в Career, но устроен иначе: варианты называют
**плотность** (`condensed`/`stucked`/`island`/`equal`), а не размер.

## Анатомия

```html
<!-- минимальная форма: только тело -->
<section class="tm-block tm-block_spacing-bottom">
  <div class="tm-block__body">…</div>
</section>

<!-- полная форма: заголовок + тело -->
<div class="tm-block tm-block_spacing-top tm-block_variant-border-bottom">
  <header class="tm-block__header tm-block__header_variant-borderless">
    <div class="tm-block__header-container">
      <h1 class="tm-block__title tm-block__title_variant-large">Заголовок</h1>
    </div>
  </header>
  <div class="tm-block__body tm-block__body_variant-balanced">…</div>
</div>
```

**Корневой тег не фиксирован** — снимки показывают и `<section>`, и `<div>`
для одного и того же компонента. Не считать `<section>` обязательным
условием; выбирать по семантике конкретного использования.

## Варианты заголовка

| Класс | Вид |
|---|---|
| `.tm-block__title` (без модификатора) | мелкий eyebrow: uppercase, разрядка `.0625rem`, приглушённый цвет `--text-inactive`, шрифт Fira Sans |
| `.tm-block__title_variant-large` | обычный регистр, `1.25rem/1.75rem`, основной цвет текста — используется с `<h1>` в примере «Full» |

## Варианты тела (плотность)

| Класс | Padding |
|---|---|
| `.tm-block__body` (по умолчанию) | `24px 20px` |
| `.tm-block__body_variant-balanced` | `20px` со всех сторон |
| `.tm-block__body_variant-condensed` | `16px 20px` (`16px` на ≤767) |
| `.tm-block__body_variant-condensed-slim` | `12px 20px 16px` |
| `.tm-block__body_variant-stucked` | `8px 20px 16px` |
| `.tm-block__body_variant-stucked-reversed` | `16px 20px 8px` |
| `.tm-block__body_variant-island` | `16px` (`16px 20px` на ≥1024) |
| `.tm-block__body_variant-equal` | `16px` (`20px` на ≥1024) |
| `.tm-block__body_variant-no-padding` | `0` |

Девять именованных плотностей — существенно детальнее, чем у Career
(padding 16/24 и всё). При выборе ориентироваться на смысл: `stucked` —
контент «прилипает» к одному краю (обычно к заголовку сверху), `island` —
контент как отдельный остров с равными отступами, `equal` — то же самое,
но отступ растёт на десктопе.

## Варианты отступа снаружи и границы

| Класс | Эффект |
|---|---|
| `.tm-block_spacing-top` / `-bottom` / `-around` / `-none` | внешний margin блока |
| `.tm-block_variant-border-bottom` | тонкая линия снизу всего блока (`inset box-shadow`, не `border` — не съедает layout) |

## Заголовок и подвал — отдельные варианты границы

`.tm-block__header_variant-borderless` / `-borderless-large` убирают линию
под заголовком (по умолчанию она есть). `.tm-block__footer` всегда с линией
сверху — модификатора «без линии» для футера не найдено.

## Responsive

Только у плотности `condensed`/`island`/`equal` — сжатие/расширение padding
на границе 767/1024, без изменения структуры.

## Ограничения

* не найден ни в одном production-файле — весь компонент подтверждён только
  Storybook;
* сочетаемость вариантов header/body/footer между собой (например, можно ли
  `borderless-large` вместе с `_variant-large` заголовка) не проверена
  на реальной странице.

## Источники

* Storybook: `block--minimal`, `block--full`, `block--condensed-h-3`,
  `block--large-article-header`
* CSS: `block-hX4sg17k.css` (Storybook-only)
