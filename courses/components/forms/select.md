# Select · BaseCustomSelect

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `w-full` |
| **CSS** | `ui/components/forms.css` + утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-select`](../../showcase/components.html#c-select) |
| **Snapshot** | 5 из 7 состояний снято |

## Когда использовать

Компонент стоит в продукте на **28 узлах**, страниц — **5 из 10**: education-centers-listing, promocodes, rating, reviews, schools-for-children.

открытый список не снят нигде: ни в проде, ни в Storybook. Разметку списка брать из Figma и помечать figma-only

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R3-06. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="w-full"><!--[--><div class="v-popper v-popper--theme-dropdown"><div class="relative"><div><div class="wrapper relative"><span class="align-center flex gap-x-1 border bg-ui-white px-3 focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-l-xl"><input class="cursor-pointer min-h-[38px] w-full flex-1 appearance-none truncate border-0 bg-transparent text-ui-black-850 placeholder:text-small placeholder:text-ui-black-500 focus:outline-none h-[54px]" data-allow-mismatch="" placeholder="Организация"><!----></span><!----><!----><span class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-between bg-transparent pl-4 pr-2"><svg class="svg-icon mr-1 shrink-0 fill-ui-black-500 text-ui-black-500 transition-transform" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-small"></use></svg></span></div></div></div></div><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **9**
- классов в поддереве: **42**
- селектор переписи: `.gap-\[1px\] > div.w-full`

Корень этой записи в снимке `computed.json` не сопоставлен — вычисленные значения
не приводятся. Сопоставление ведётся по совпадению тега и всех классов селектора
переписи; здесь оно не сошлось, и подставлять вместо него значения браузера
по умолчанию нельзя.

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-06 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-06 |
| `open` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `closed` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-06 |
| `disabled` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-06 |
| `invalid` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Не снятые состояния.** `open`, `invalid` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R3-06 волны R3.

## Источники

**Production.** [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(4 файла: `author.css`, `base-custom-select-with-input-list.DYeSdhXo.css`, `education-centers-listing.css`, `similar-courses.DqXT-MW0.css`).

**Figma.** `dropdown/select` (education-lib, componentKey 8c0e7325) — dropdown/select + dropdown/list + dropdown/context-menu

**Storybook.** [{"story":"forms-basecustomselect--base-story","file":null,"renders":true,"note":"снято только закрытое состояние: button[role=combobox][aria-expanded=false], min-h 40, radius 12, border #e9e9ea"}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
