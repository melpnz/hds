# StepCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `flex` · `flex-col` · `gap-1` · `rounded-3xl` · `border` · `border-solid` · `border-ui-black-100` · `p-6` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-step-card`](../../showcase/components.html#c-step-card) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **8 узлах**, страниц — **2 из 10**: authors, editors.

простейшая карточка шага процесса: заголовок semibold и text-small. Встречается рядом из четырёх

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R5-07. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="flex flex-col gap-1 rounded-3xl border border-solid border-ui-black-100 p-6"><div class="font-semibold">Подготовка страницы</div><div class="text-small"> Редакция Хабра отправляет материалы на&nbsp;проверку экспертам, которые работают в&nbsp;нужной профессии. </div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `authors`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **10**
- селектор переписи: `div.flex.flex-col.gap-1.rounded-3xl.border.border-solid.border-ui-black-100.p-6`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/authors/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > section[0] > section[1] > div[1] > div[0]`), коробка **260×154.8**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `column` |
| `width` | `260px` |
| `height` | `154.797px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `padding` | `24px` |
| `gap` | `4px` |
| `position` | `static` |
| `overflow` | `visible` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Ограничения

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R5-07 волны R5.

## Источники

**Production.** [authors](https://career.habr.com/courses/authors) · [editors](https://career.habr.com/courses/editors)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
