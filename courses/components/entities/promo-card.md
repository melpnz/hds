# PromoCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `cursor-pointer` · `relative` · `flex` · `h-full` · `flex-col` · `overflow-hidden` · `rounded-3xl` · `border` · `border-ui-black-100` · `p-6` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-promo-card`](../../showcase/components.html#c-promo-card) |
| **Snapshot** | 2 из 2 состояний снято |

## Когда использовать

Компонент стоит в продукте на **20 узлах**, страниц — **1 из 10**: promocodes.

лого и название → плашка кода bg-ui-blue-50 text-ui-blue-500 rounded-xl px20 py16 text-h4 semibold по центру → условие text-small → Button M «Открыть код». Единственное место, где синяя подложка работает как крупная плоскость

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R5-03. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="cursor-pointer relative flex h-full flex-col overflow-hidden rounded-3xl border border-ui-black-100 p-6 text-ui-black-850"><div class="flex flex-col gap-4"><div class="flex items-center gap-2 whitespace-nowrap"><img src="https://habrastorage.org/getpro/courses/upload_files/443/494/b7b/443494b7b06e8ae85335cfdb3b2b6532.jpg" alt="Логотип НАДПО" style="--avatar-size:24px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover rounded-md"><span class="max-w-full overflow-hidden text-ellipsis text-small font-semibold">НАДПО</span></div><div class="bg-ui-blue-50 text-ui-blue-500 max-w-full truncate whitespace-nowrap rounded-xl px-5 py-4 text-center text-h4 font-semibold">Скидка 5%</div><div class="text-small">на любой курс</div></div><div class="mt-auto pt-7"><button class="relative inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white relative" target="_self"><!--[--><span>Открыть код</span><div class="absolute right-0 top-0 flex h-full w-[44px] items-center justify-start rounded-br-[0.70rem] rounded-tr-[0.70rem] bg-ui-white"><div class="absolute right-0 w-[44px] overflow-hidden pr-2 text-small font-semibold uppercase text-ui-black-850">ODE</div><img alt="" class="height-[40px] absolute left-[-1px] top-1/2 -translate-y-1/2" src="https://assets.habr.com/courses-web/courses-web/images/courses/code_2.svg"></div><!--]--></button></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `promocodes`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **12**
- классов в поддереве: **66**
- селектор переписи: `div.cursor-pointer.relative.flex.h-full.flex-col.overflow-hidden.rounded-3xl.border.border-ui-black-100.p-6`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/promocodes/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > div[1] > div[0] > div[0] > div[0]`), коробка **260×268**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `column` |
| `width` | `260px` |
| `height` | `268px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `padding` | `24px` |
| `position` | `relative` |
| `overflow` | `hidden` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-03 |

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `height-[40px]`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 1 ссылка на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R5-03 волны R5.

## Источники

**Production.** [promocodes](https://career.habr.com/education/promocodes)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `10991:111811` (02_Education-NEW, узел 10991:111811) — 4 варианта: промокод|акция × завершён

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
