# Checkbox · BaseCheckbox

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `base-checkbox` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-checkbox`](../../showcase/components.html#c-checkbox) |
| **Источник** | Storybook `BaseCheckbox`, story `common-basecheckbox--base-checkbox-story` |
| **Snapshot** | 4 из 6 состояний снято |

## Когда использовать

**Компонента нет в снятой разметке продукта.** Ни одного узла на десяти снятых
страницах: класс корня `base-checkbox` в `evidence/source/production/pages/*/dom.html`
не встречается. Он существует как компонент реализации — story `common-basecheckbox--base-checkbox-story`
снимка Storybook (`evidence/source/storybook/`) — и как правила в сборке.

storybook и figma; в проде узел не встречается, но его продуктовый CSS-чанк снят вместе с корпусом (R1-02, находка 1 review-1.md): evidence/source/production/css/external/similar-courses.DqXT-MW0.css несёт .base-checkbox__input:checked+.base-checkbox__button (checked), .base-checkbox--disabled/.base-checkbox__wrapper--disabled (disabled) и .base-checkbox__input:focus+.base-checkbox__button (focus-visible, реальный :focus). hover и indeterminate в этом чанке не описаны — остаются uncaptured, досъёмка R3-10

> Правило применения здесь не выведено: вывести его не из чего, пока компонент
> не найден в продукте. Шаг R3-10 решает, остаётся ли запись `storybook-only`
> или у неё находится прод-адрес.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<span class="base-checkbox base-checkbox"><label class="base-checkbox__wrapper base-checkbox__wrapper"><span class="base-checkbox__icon-wrapper"><input type="checkbox" class="base-checkbox__input visually-hidden" name="checkbox"><span class="base-checkbox__button"></span></span><span class="base-checkbox__content"> Лейбл чекбокса </span></label></span>
```

## Анатомия

Дерево из снятой story `common-basecheckbox--base-checkbox-story`, фреймворк-скоуп (`data-v-*`) снят,
обёртка стенда Storybook (`p-8` и раскладка под несколько образцов) отброшена —
она принадлежит стенду, а не компоненту.

- корневой тег: `span`
- узлов внутри корня: **5**
- классов в поддереве: **7**

## Откуда правила

Из **6** классов поддерева правило нашлось в корпусе продакшена,
из **0** — только в CSS сборки Storybook, у **1**
правила нет нигде.

Это и есть главный факт записи: компонент **не найден в разметке** продукта,
но его правила продуктовая сборка **уже несёт**. То есть `storybook-only`
здесь значит «нет в снятой разметке», а не «нет в продукте вовсе».

Файлы-источники: `production/author.css`, `production/authors.css`, `production/courses-listing.css`, `production/editors.css`, `production/education-center.css`, `production/education-centers-listing.css`, `production/promocodes.css`, `production/rating.css`, `production/reviews.css`, `production/schools-for-children.css`, `production/similar-courses.DqXT-MW0.css` (11 из корпуса продакшена).

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
пар «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).

| состояние | снято? | чем именно |
|---|---|---|
| `hover` | GAP | STATE-CAPTURE.md §3 говорит: «**storybook-only**: `common-basecheckbox--base-checkbox-story.html` (437 байт) рендерит только `<span base-checkbox__button>` без единой utility-модификации, а CSS-чанк, найденный для остальных состояний ниже (`similar-courses.DqXT-MW0.css`), не содержит ни одного правила `.base-checkbox*:hover`. Досъёмка — предмет шага R3-10, не этого» |
| `focus-visible` | снято | STATE-CAPTURE.md §3 говорит: «*(исправлено по находке 1 review-1.md; ранее ошибочно значилось «не снято, чанка нет в evidence»)* `evidence/source/production/css/external/similar-courses.DqXT-MW0.css` → `.base-checkbox__input:focus+.base-checkbox__button{border-color:var(--color-ui-black-400)}` — реальный `:focus` (не `:focus-visible`), но визуальное изменение есть (смена цвета рамки на тот же токен, что несёт норматив `HeaderDropdown`); тот же приём смягчения, что принят для `select`/`multi-select`/`search-input` через `focus-within` (§3.1 выше), только здесь компенсация через соседний `:focus` на скрытом `<input>`, а не через `focus-within` на обёртке» |
| `checked` | снято | STATE-CAPTURE.md §3 говорит: «*(исправлено по находке 1 review-1.md)* тот же чанк → `.base-checkbox__input:checked+.base-checkbox__button{background-color:var(--color-ui-black-850);background-image:url(…svg-галочка…);border-color:var(--color-ui-black-850)}` — явный класс состояния с собственным фоном, иконкой и цветом рамки» |
| `indeterminate` | GAP | STATE-CAPTURE.md §3 говорит: «ни в этом чанке, ни в остальном корпусе `evidence/source/production/css/` нет правила для `:indeterminate`/`[aria-checked="mixed"]` у `.base-checkbox*`; Storybook-story тоже не рендерит этот вариант. Досъёмка — предмет шага R3-10» |
| `disabled` | снято | STATE-CAPTURE.md §3 говорит: «*(исправлено по находке 1 review-1.md)* тот же чанк → `.base-checkbox--disabled{opacity:.5}` и `.base-checkbox__wrapper--disabled{cursor:not-allowed}` — два явных модификатора состояния» |
| `default` | снято | STATE-CAPTURE.md §3 говорит: «разметки по этой паре в STATE-CAPTURE.md §3 нет; исход взят из полей записи реестра» |

## Ограничения

- **Классы без правила.** `base-checkbox__content` — объявления нет ни в 22 файлах прод-корпуса, ни в 13 файлах CSS снимка Storybook. См. раздел «Находки» витрины.
- **Прод-адреса нет.** Пока компонент не найден в продукте, ни `occurrences`, ни `seenOn` у записи не заполняются: измерять нечего. Числа в реестре остаются нулями осознанно.
- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса. Запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-10.

## Источники

**Storybook.** `BaseCheckbox` → story `common-basecheckbox--base-checkbox-story`, снимок в
`evidence/source/storybook/rendered/common-basecheckbox--base-checkbox-story.html`; сборка Storybook 8.4.7,
снята 2 сентября 2026 (`evidence/source/storybook/inventory.md`).

**Production.** Разметки нет. Правила классов — корпус
`evidence/source/production/css`.

**Figma.** `elements/control`, componentKey b4c4a5af

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-storybook-sections.mjs` из снятого
Storybook и корпуса прод-CSS. Ни одно значение здесь не написано от руки._
