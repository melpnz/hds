# Switch · BaseSwitch

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `group` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#switch`](../../../viewer/index.html#switch) |
| **Источник** | Storybook `BaseSwitch`, story `common-baseswitch--base-switch-story` |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

**Компонента нет в снятой разметке продукта.** Ни одного узла на десяти снятых
страницах: класс корня `group` в `evidence/source/production/pages/*/dom.html`
не встречается. Он существует как компонент реализации — story `common-baseswitch--base-switch-story`
снимка Storybook (`evidence/source/storybook/`) — и как правила в сборке.

**Правило.** Включение и выключение опции с подписью рядом. В продукте не встречается; снят в Storybook как `BaseSwitch` (story `common-baseswitch--base-switch-story`).

## Когда не использовать

- Для фильтрации выдачи на месте: на снятых страницах направление выбирают `FilterChip`, переключателей на них нет.

## Как работает

Скрытый `input type="checkbox"` и трек, которым управляют peer-классы: `peer-checked:bg-ui-black-850`, `peer-focus-visible:outline`.

## Управление клавиатурой

Нативный чекбокс под треком: фокус по Tab, переключение — Space.

## Анимация

Трек меняет фон переходом `transition-colors`, ручка (`::after`) сдвигается на 16px (`peer-checked:after:translate-x-4`) переходом `after:transition-all`; подпись перекрашивается тем же `transition-colors`. Оба перехода — 0,15 с с кривой `cubic-bezier(.4,0,.2,1)`, правила — в CSS Storybook (`evidence/source/storybook/css/`).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<label class="group max-w-full cursor-pointer items-start grid grid-cols-[40px_1fr] grid-rows-1 gap-2"><!----><span class="flex h-6 items-center justify-center w-10"><input type="checkbox" true-value="true" false-value="false" name="switch" class="visually-hidden peer"><span class="relative flex items-center justify-start rounded-full outline-2 outline-offset-1 transition-colors after:block after:rounded-full after:transition-all after:content-[''] enabled:group-hover:bg-ui-black-50 peer-checked:after:bg-ui-white enabled:group-hover:peer-checked:bg-ui-black-400 peer-focus-visible:outline h-[22px] w-[38px] px-[5px] peer-checked:bg-ui-black-850 after:h-3 after:w-3 peer-checked:after:translate-x-4 after:bg-ui-black-400 bg-ui-black-150"></span></span><span class="leading-md select-none pt-[2px] text-ui-black-850 transition-colors"> Лейбл до </span></label>
```

## Анатомия

Дерево из снятой story `common-baseswitch--base-switch-story`, фреймворк-скоуп (`data-v-*`) снят,
обёртка стенда Storybook (`p-8` и раскладка под несколько образцов) отброшена —
она принадлежит стенду, а не компоненту.

- корневой тег: `label`
- узлов внутри корня: **4**
- классов в поддереве: **42**

## Откуда правила

Из **41** классов поддерева правило нашлось в корпусе продакшена,
из **0** — только в CSS сборки Storybook, у **1**
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
| `hover` | снято | STATE-CAPTURE.md §3 говорит: «`common-baseswitch--base-switch-story.html`: `enabled:group-hover:bg-ui-black-50` на кастомном треке» |
| `focus-visible` | снято | STATE-CAPTURE.md §3 говорит: «тот же файл: `peer-focus-visible:outline` на треке (управляется скрытым нативным `<input type="checkbox">` через `peer`); цвет не переопределён — рисуется дефолтным `outline-color`, это не то же самое, что `outline-none` без замены, поэтому не норматив» |
| `checked` | снято | STATE-CAPTURE.md §3 говорит: «тот же файл: `peer-checked:bg-ui-black-850 peer-checked:after:bg-ui-white peer-checked:after:translate-x-4`, буквально в разметке обоих вариантов лейбла» |
| `disabled` | GAP | STATE-CAPTURE.md §3 говорит: «в отрендеренной story нет `disabled:*`/`peer-disabled:*` вовсе — GAP шага R3-11» |
| `default` | снято | STATE-CAPTURE.md §3 говорит: «разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра» |

## Responsive

Адаптивных классов в снятой story нет.

## Ограничения

- **Классы без правила.** `leading-md` — объявления нет ни в 22 файлах прод-корпуса, ни в 13 файлах CSS снимка Storybook. См. раздел «Находки» витрины.
- **Прод-адреса нет.** Пока компонент не найден в продукте, ни `occurrences`, ни `seenOn` у записи не заполняются: измерять нечего. Числа в реестре остаются нулями осознанно.
- **Проза выведена из story и CSS Storybook.** Записи нет в разметке снятых страниц, и в переписи корпуса её нет. Правило применения, «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по снятой story и CSS Storybook (`evidence/source/storybook/`); «Когда не использовать» — по тому, чем снятые страницы решают ту же задачу. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их нечем.

## Источники

**Storybook.** `BaseSwitch` → story `common-baseswitch--base-switch-story`, снимок в
`evidence/source/storybook/rendered/common-baseswitch--base-switch-story.html`; сборка Storybook 8.4.7,
снята 2 сентября 2026 (`evidence/source/storybook/inventory.md`).

**Production.** Разметки нет. Правила классов — корпус
`evidence/source/production/css`.

**Figma.** Узел для этой записи не сопоставлен.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-storybook-sections.mjs` из снятого
Storybook и корпуса прод-CSS. Ни одно значение здесь не написано от руки._


## Уточнение v0.2 · выравнивание подписи

Текстовая подпись получает `padding-top: 1px` относительно верхнего края слота контрола. Между визуальным контролом и подписью сохраняется `gap: 8px`.


## Дополнение v0.2 · полная матрица состояний

В viewer показаны `default`, `hover`, `focus-visible`, `disabled` и `loading`, каждое для выключенного и включённого значения. Строка имеет высоту 26 px, слот контрола — 24 px, gap до текста — 8 px; текст — 16/22 regular со смещением 2 px сверху. Геометрия и состояния взяты из Courses Figma `education-lib`, controls canvas node `698:1858`.
