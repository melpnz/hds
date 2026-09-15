# VacancyCard

| | |
|---|---|
| **Категория** | entities (`entities`) |
| **Корневой класс** | `crs-vacancy-card` — введён пакетом |
| **CSS** | `ui/components/entities.css` |
| **Живая реализация** | [`viewer/index.html#vacancy-card`](../../../viewer/index.html#vacancy-card) |
| **Источник** | Figma `02_Education-NEW`, узел `14394:193314` «вакансия» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: карточка вакансии — школа, должность, теги, зарплата, кнопка «Далее». Со страницы профессии; раздела в продукте нет. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R5-16 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-vacancy-card">
  <div class="crs-vacancy-card__main">
    <div class="crs-vacancy-card__school">
      <img class="crs-vacancy-card__logo" src="../ui/assets/images/content-placeholder.svg" alt="">
      <span class="crs-vacancy-card__school-name">Реактив</span>
    </div>
    <p class="crs-vacancy-card__position">Аналитик</p>
    <div class="crs-vacancy-card__tags">
      <span class="crs-specialization-tag crs-specialization-tag--easy">Middle</span>
      <div class="flex items-center rounded-full bg-ui-black-50 px-2 py-1 text-micro">Можно удалённо</div>
    </div>
  </div>
  <div class="crs-vacancy-card__salary">
    <p class="crs-vacancy-card__salary-value crs-vacancy-card__salary-value--empty">Зарплата не указана</p>
  </div>
  <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white">Далее</button>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| карточка | 207 × 354, белая, рамка `#e9e9ea`, радиус 24, падинг 24, промежуток 16 |
| школа | логотип 32 радиусом 8, название 14 / 20 600 в одну строку |
| должность | 16 / 22 |
| теги | `SpecializationTag --easy` и продуктовый `Chip` через 4 |
| зарплата | стилем `Header/H4`; «не указана» — `#909194` |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-vacancy-card` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Школа «Реактив», должность «Аналитик», теги и «Зарплата не указана» — дословно из узла. Кнопка «Далее» — продуктовый `Button` M main во всю ширину.
- **Ассеты.** Логотип школы — содержимое: на его месте заглушка витрины `ui/assets/images/content-placeholder.svg`. Продуктовая заглушка логотипа организации (`avatars/logo.svg` на CDN продукта) в пакет не локализована, а `ui/assets/images/logo.svg` — логотип самих Курсов, не заглушка.
- **Состояния.** Требуемые состояния записи (`default`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14394:193314`
«вакансия», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
