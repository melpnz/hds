# TileFilter · BaseFilterWithImage

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `m-0` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-tile-filter`](../../showcase/components.html#c-tile-filter) |
| **Источник** | Storybook `BaseFilterWithImage`, story `common-basefilterwithimage--default` |
| **Snapshot** | 2 из 6 состояний снято |

## Когда использовать

**Компонента нет в снятой разметке продукта.** Ни одного узла на десяти снятых
страницах: класс корня `m-0` в `evidence/source/production/pages/*/dom.html`
не встречается. Он существует как компонент реализации — story `common-basefilterwithimage--default`
снимка Storybook (`evidence/source/storybook/`) — и как правила в сборке.

иллюстрированная плитка направления. В снятых страницах прода её нет: «Популярные направления» на /courses оказались текстовым LinkGrid — это опровергает §10.4 исследования

> Правило применения здесь не выведено: вывести его не из чего, пока компонент
> не найден в продукте. Шаг R3-12 решает, остаётся ли запись `storybook-only`
> или у неё находится прод-адрес.

**Правило.** Иллюстрированная плитка варианта фильтра. В продукте её нет — «Популярные направления» на `/courses` текстовые (`LinkGrid`); снята в Storybook как `BaseFilterWithImage`, в макете стоит в модалке фильтров.

## Когда не использовать

- Для текстового ряда фильтров — `FilterChip`.

## Как работает

`<button>` с картинкой 80 и подписью; выбранная плитка отличается рамкой и фоном (story `--active`).

## Управление клавиатурой

Нативная `<button>`: фокус по Tab, выбор — Enter или Space.

## Анимация

В снятых story классов перехода нет.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<button class="m-0 flex w-[122px] cursor-pointer flex-col items-center gap-2 bg-transparent p-0 phone:w-[84px]"><span class="flex w-full items-center justify-center rounded-2xl border border-solid p-5 text-small phone:p-3 bg-ui-white border-ui-black-100 text-ui-black-850"><img src="../ui/assets/images/star.png" alt="Звезда" class="h-20 w-20 phone:h-[60px] phone:w-[60px]"></span><span class="w-full whitespace-normal break-words text-center text-micro text-ui-black-850">Популярное</span></button>
```

## Анатомия

Дерево из снятой story `common-basefilterwithimage--default`, фреймворк-скоуп (`data-v-*`) снят,
обёртка стенда Storybook (`p-8` и раскладка под несколько образцов) отброшена —
она принадлежит стенду, а не компоненту.

- корневой тег: `button`
- узлов внутри корня: **3**
- классов в поддереве: **29**

## Откуда правила

Из **29** классов поддерева правило нашлось в корпусе продакшена,
из **0** — только в CSS сборки Storybook, у **0**
правила нет нигде.

Это и есть главный факт записи: компонент **не найден в разметке** продукта,
но его правила продуктовая сборка **уже несёт**. То есть `storybook-only`
здесь значит «нет в снятой разметке», а не «нет в продукте вовсе».

Файлы-источники: `production/author.css`, `production/authors.css`, `production/courses-listing.css`, `production/editors.css`, `production/education-center.css`, `production/education-centers-listing.css`, `production/promocodes.css`, `production/rating.css`, `production/reviews.css`, `production/schools-for-children.css` (10 из корпуса продакшена).

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
пар «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).

| состояние | снято? | чем именно |
|---|---|---|
| `pressed` | GAP | STATE-CAPTURE.md §3 говорит: «нет `active:*`; GAP, не норматив (§1)» |
| `selected` | снято | STATE-CAPTURE.md §3 говорит: «сравнение двух story: default `bg-ui-white border-ui-black-100 text-ui-black-850`, story `--active` (по словарю задания — `selected`, не `active`) `bg-ui-blue-50 border-ui-blue-300 text-ui-blue-500`» |
| `disabled` | GAP | STATE-CAPTURE.md §3 говорит: «ни в одной из двух story нет `disabled`-варианта; GAP шага R3-12» |
| `default` | снято | STATE-CAPTURE.md §3 говорит: «разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра» |
| `hover` | GAP | STATE-CAPTURE.md §3 говорит: «разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра» |
| `focus-visible` | GAP | STATE-CAPTURE.md §3 говорит: «разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра» |

## Responsive

На `phone:` плитка сужается до 84 и картинка до 60 (`phone:w-[84px]`, `phone:h-[60px]`).

## Ограничения

- **Прод-адреса нет.** Пока компонент не найден в продукте, ни `occurrences`, ни `seenOn` у записи не заполняются: измерять нечего. Числа в реестре остаются нулями осознанно.
- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Storybook.** `BaseFilterWithImage` → story `common-basefilterwithimage--default`, снимок в
`evidence/source/storybook/rendered/common-basefilterwithimage--default.html`; сборка Storybook 8.4.7,
снята 2 сентября 2026 (`evidence/source/storybook/inventory.md`).

**Production.** Разметки нет. Правила классов — корпус
`evidence/source/production/css`.

**Figma.** `10540:60335`, узел 10540:60335

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-storybook-sections.mjs` из снятого
Storybook и корпуса прод-CSS. Ни одно значение здесь не написано от руки._
