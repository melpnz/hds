# MultiSelect

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `wrapper` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#multi-select`](../../../viewer/index.html#multi-select) |
| **Источник** | Storybook `MultiSelect`, story `forms-multiselect--base-story` |
| **Snapshot** | 4 из 8 состояний снято |

## Когда использовать

**Компонента нет в снятой разметке продукта.** Ни одного узла на десяти снятых
страницах: класс корня `wrapper` в `evidence/source/production/pages/*/dom.html`
не встречается. Он существует как компонент реализации — story `forms-multiselect--base-story`
снимка Storybook (`evidence/source/storybook/`) — и как правила в сборке.

**Правило.** Выбор нескольких значений из списка с поиском. В продукте не встречается; снят как `MultiSelect` в Storybook.

## Когда не использовать

- Для одного значения — `Select`.

## Как работает

Строка поиска — `input` в обёртке с `focus-within:border-ui-black-850`; список с чекбоксами в story не отрисован.

## Управление клавиатурой

Строка поиска — нативный `input`: фокус по Tab. Управление открытым списком не снято — story его не рисует.

## Анимация

У лупы в поле (`svg.absolute.right-3`, символ `search`) — `transition-transform`, 0,15 с с кривой `cubic-bezier(.4,0,.2,1)`. Класса, который бы её сдвигал или поворачивал, в story нет, и что анимирует этот переход, не снято.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="wrapper"><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative wrapper--with-search"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white rounded-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[38px]" data-allow-mismatch="" placeholder="Поиск по школам"><!----></span><svg class="svg-icon absolute right-3 top-1/2 shrink-0 -translate-y-1/2 fill-ui-black-400 text-ui-black-400 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="../ui/assets/icons/sprite.svg#search"></use></svg><!----><!----></div></div></div></div></div>
```

## Анатомия

Дерево из снятой story `forms-multiselect--base-story`, фреймворк-скоуп (`data-v-*`) снят,
обёртка стенда Storybook (`p-8` и раскладка под несколько образцов) отброшена —
она принадлежит стенду, а не компоненту.

- корневой тег: `div`
- узлов внутри корня: **8**
- классов в поддереве: **36**

## Откуда правила

Из **35** классов поддерева правило нашлось в корпусе продакшена,
из **0** — только в CSS сборки Storybook, у **1**
правила нет нигде.

Это и есть главный факт записи: компонент **не найден в разметке** продукта,
но его правила продуктовая сборка **уже несёт**. То есть `storybook-only`
здесь значит «нет в снятой разметке», а не «нет в продукте вовсе».

Файлы-источники: `production/author.css`, `production/authors.css`, `production/base-custom-select-with-input-list.DYeSdhXo.css`, `production/courses-listing.css`, `production/editors.css`, `production/education-center.css`, `production/education-centers-listing.css`, `production/entry.Dcg7kqZY.css`, `production/promocodes.css`, `production/rating.css`, `production/reviews.css`, `production/schools-for-children.css`, `production/similar-courses.DqXT-MW0.css` (13 из корпуса продакшена).

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
пар «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).

| состояние | снято? | чем именно |
|---|---|---|
| `hover` | снято | STATE-CAPTURE.md §3 говорит: «`forms-multiselect--base-story.html`: `<input cursor-pointer … focus:outline-none …>` без `hover:*`» |
| `focus-visible` | снято | STATE-CAPTURE.md §3 говорит: «тот же файл: `focus-within:border-ui-black-850 focus-within:bg-ui-white` на обёртке `<span>`, тот же приём, что у Select/SearchInput» |
| `checked` | GAP | STATE-CAPTURE.md §3 говорит: «story рендерит только строку поиска, список опций с чекбоксами не раскрыт ни разу — GAP шага R3-07» |
| `open` | GAP | STATE-CAPTURE.md §3 говорит: «тот же аргумент, что у Select; GAP решения 5 / X-14, шаг R3-07» |
| `closed` | снято | STATE-CAPTURE.md §3 говорит: «список не отрисован — структурное отсутствие (N5), тот же аргумент, что у Select» |
| `disabled` | GAP | STATE-CAPTURE.md §3 говорит: «в story нет `disabled`-варианта (в отличие от Select, где Storybook его показал) — асимметрия с Select зафиксирована явно, не додумана по аналогии; GAP шага R3-07» |
| `invalid` | GAP | STATE-CAPTURE.md §3 говорит: «тот же аргумент, что у Select» |
| `default` | снято | STATE-CAPTURE.md §3 говорит: «разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра» |

## Responsive

Адаптивных классов в снятой story нет.

## Ограничения

- **Классы без правила.** `align-center` — объявления нет ни в 22 файлах прод-корпуса, ни в 13 файлах CSS снимка Storybook. См. раздел «Находки» витрины.
- **Прод-адреса нет.** Пока компонент не найден в продукте, ни `occurrences`, ни `seenOn` у записи не заполняются: измерять нечего. Числа в реестре остаются нулями осознанно.
- **Проза выведена из story и CSS Storybook.** Записи нет в разметке снятых страниц, и в переписи корпуса её нет. Правило применения, «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по снятой story и CSS Storybook (`evidence/source/storybook/`); «Когда не использовать» — по тому, чем снятые страницы решают ту же задачу. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их нечем.

## Источники

**Storybook.** `MultiSelect` → story `forms-multiselect--base-story`, снимок в
`evidence/source/storybook/rendered/forms-multiselect--base-story.html`; сборка Storybook 8.4.7,
снята 2 сентября 2026 (`evidence/source/storybook/inventory.md`).

**Production.** Разметки нет. Правила классов — корпус
`evidence/source/production/css`.

**Figma.** Узел для этой записи не сопоставлен.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-storybook-sections.mjs` из снятого
Storybook и корпуса прод-CSS. Ни одно значение здесь не написано от руки._


## Дополнение v0.2 · общее семейство полей

Компонент использует общую оболочку полей Courses: radius 12 px, gap 4 px, SVG-иконки 24×24, текст 16/22 regular и состояния `default`, `hover`, `focus-visible`, `disabled`, `invalid`. Подтверждены размеры `M` 40 px с горизонтальными отступами 12 px и `XL / SearchForm` 56 px с отступом 16 px слева и 12 px справа. Состояния взяты из `education-lib`, canvas node `670:8259`; XL — из живого SearchForm, node `15074:233173`.


## Дополнение v0.2 · открытый dropdown

В viewer показан открытый вариант `M`: между полем и панелью 4 px, панель высотой 216 px с border 1 px `#E9E9EA`, radius 12 px и двухслойной тенью; список имеет вертикальный отступ 8 px, строки высотой 40 px с отступами 16 px слева и 24 px справа, текст 14/20 regular. Select раскрывает стрелку вверх; MultiSelect сохраняет выбранное значение в чипе. Геометрия сверена с Courses Figma: `education-lib`, Select node `4850:2101`, MultiSelect dropdown node `4393:6213`.
