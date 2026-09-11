# FilterModal

| | |
|---|---|
| **Категория** | Оверлеи (`overlays`) |
| **Корневой класс** | `crs-filter-modal` — введён пакетом |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | [`showcase/components.html#c-filter-modal`](../../showcase/components.html#c-filter-modal) |
| **Источник** | Figma `02_Education-NEW`, узел `14613:211399` «modal-filter» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only с 11 сентября 2026 (было storybook-only). Решение владельца: открытая модалка верстается по макету. Storybook снял обе реализации — BaseFilterModal и BaseFilterModalNew — закрытыми, одной кнопкой-триггером; открытого состояния нет ни в Storybook, ни в снятом продукте (гостем оно не видно). Источник вёрстки — макет, узел modal-filter 14613:211399, поэтому и sourceScope — по источнику вёрстки. Свёрстан каркас: шапка «Поиск обучения», группа «Тип обучения» с синими чипами Tab, подвал «Очистить всё / Показать N курсов»; остальные девять групп макета собраны из записей, которые уже стоят на витрине (BaseFilterWithImage, Tab). Какую из двух реализаций Storybook описывает макет — не установлено, это по-прежнему вопрос шага R4-12. Прежняя заметка: «две реализации в Storybook: BaseFilterModalNew актуальна, BaseFilterModal уходит в legacyAliases и отдельной спецификации не получает (BRIEF §9 п. 5 — разложено по строкам в implementations). Открытая разметка есть только в Figma: обе story сняты закрытыми»

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R4-12 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-filter-modal" role="dialog" aria-label="Поиск обучения">
  <div class="crs-filter-modal__header">
    <p class="crs-filter-modal__title">Поиск обучения</p>
    <button type="button" class="crs-filter-modal__close" aria-label="Закрыть"><img src="../ui/assets/icons/modal-close.svg" alt="" width="24" height="24"></button>
  </div>
  <div class="crs-filter-modal__body">
    <div class="crs-filter-modal__group">
      <p class="crs-filter-modal__group-title">Тип обучения</p>
      <div class="crs-filter-modal__options">
        <button type="button" class="crs-tab crs-tab--plain"><span class="crs-tab__label">Курс</span></button>
        <button type="button" class="crs-tab crs-tab--plain crs-tab--selected"><span class="crs-tab__label">Вебинар</span></button>
        <button type="button" class="crs-tab crs-tab--plain"><span class="crs-tab__label">Симулятор</span></button>
      </div>
    </div>
  </div>
  <div class="crs-filter-modal__footer">
    <button type="button" class="crs-filter-modal__button crs-filter-modal__button--secondary">Очистить всё</button>
    <button type="button" class="crs-filter-modal__button crs-filter-modal__button--main">Показать 30 560 курсов</button>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| модалка | до 568 в ширину, белая, рамка `#e9e9ea`, радиус 24 — `elements/modal/*` |
| шапка | падинг 24, заголовок стилем `Header/H3` (20 / 24, 600, −0.5), крестик 24 × 24 |
| тело | группы с отступом 24 от краёв, промежуток между группами 32 — по координатам выгрузки |
| группа | заголовок 16 / 22, 600; под ним чипы `Tab` в синем варианте, промежуток 4 |
| подвал | падинг 24, кнопки L высотой 48: вторичная `#f1f1f1`, основная `#2c2e34` |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-filter-modal` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Тексты — содержимое узла макета: заголовок «Поиск обучения», группа «Тип обучения» с вариантами «Курс», «Вебинар» (выбран), «Симулятор», кнопки «Очистить всё» и «Показать 30 560 курсов». Число курсов в кнопке — пример из макета, в продукте его подставляет выдача. Свёрстана одна группа из десяти: остальные собраны из записей, которые уже стоят на витрине, — плиток `BaseFilterWithImage` и тех же чипов `Tab`.
- **Ассеты.** Крестик — экспорт узла макета `ui/assets/icons/modal-close.svg`, а не символ общего спрайта: у символа `sprite.svg#cross-large` тот же глиф, но плечи короче на 1 px с каждой стороны, это не тот же символ. Цвет `#A6A7A9` зашит в экспорт. Затемнение фона под модалкой (слой `overlay` макета) не воспроизводится: на витрине модалка стоит на странице, а не поверх неё.
- **Состояния не сняты.** Требуемые состояния записи (`default`, `open`, `closed`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14613:211399`
«modal-filter», прочитан `get_design_context` 10 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
