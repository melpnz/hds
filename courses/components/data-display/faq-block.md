# FaqBlock

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `crs-faq-block` — введён пакетом |
| **CSS** | `ui/components/data-display.css` |
| **Живая реализация** | [`showcase/components.html#c-faq-block`](../../showcase/components.html#c-faq-block) |
| **Источник** | Figma `02_Education-NEW`, узел `12193:79324` «СЕО-блок / FAQ, Мобилка=no» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: секция «Часто задаваемые вопросы» из SEO-блоков — заголовок H2 и список FaqItem. В снятой разметке продукта FAQ нет. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R4-21 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<section class="crs-faq-block">
  <p class="crs-faq-block__title">Часто задаваемые вопросы</p>
  <div class="crs-faq-block__list">
    <div class="crs-faq-item">
      <button type="button" class="crs-faq-item__question" aria-expanded="false">
        <span class="crs-faq-item__title">Текст вопроса</span>
        <span class="crs-faq-item__chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span>
      </button>
    </div>
    <div class="crs-faq-item">
      <button type="button" class="crs-faq-item__question" aria-expanded="false">
        <span class="crs-faq-item__title">Текст вопроса</span>
        <span class="crs-faq-item__chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span>
      </button>
    </div>
    <div class="crs-faq-item">
      <button type="button" class="crs-faq-item__question" aria-expanded="false">
        <span class="crs-faq-item__title">Текст вопроса</span>
        <span class="crs-faq-item__chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span>
      </button>
    </div>
  </div>
</section>
```

## Внешний вид

| что | значение |
|---|---|
| блок | до 1124 в ширину, падинг 24 по бокам, промежуток 16 |
| заголовок | стилем `Header/H2` — 24 / 28, 600, −0.5 |
| список | `FaqItem` в свёрнутом виде через 12 |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-faq-block` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** «Часто задаваемые вопросы» и «Текст вопроса» — дословно из компонента: в библиотечном варианте вопросы — заглушки. Вопросов в макете десять, здесь три. Живые вопросы с ответом — у записи `FaqItem` на странице профессии.
- **Ассеты.** Шевроны — символ `arrow-small` спрайта, как у `FaqItem`. У варианта Мобилка=yes (`12195:100236`, 320) раскладка та же, отличаются ширина и падинги — отдельно не свёрстан.
- **Состояния.** Требуемые состояния записи (`default`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `12193:79324`
«СЕО-блок / FAQ, Мобилка=no», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
