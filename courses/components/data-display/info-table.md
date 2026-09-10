# InfoTable

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `grid` · `grid-cols-2` · `gap-x-4` · `gap-y-3` · `text-small` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-info-table`](../../showcase/components.html#c-info-table) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узлах**, страниц — **1 из 10**: education-center.

«Общая информация»: пары «лейбл → значение» (лицензия, телефоны, офис). Наблюдение на одной странице

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R5-12. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-small phone:grid-cols-1"><div class="flex flex-col gap-1"><span class="font-semibold">Лицензия</span><span>№ Л035‑01298‑77/00185314</span></div><div class="flex flex-col gap-1"><span class="font-semibold">Телефоны</span><span>8 800 700-93-29</span></div><div class="flex flex-col gap-1"><span class="font-semibold">Головной офис</span><span>119021, Россия, г. Москва, ул. Тимура Фрунзе, д. 11, корпус 2</span></div><div class="flex flex-col gap-1"><span class="font-semibold">Официальный сайт</span><a class="text-ui-blue-500 hover:text-ui-blue-600 hover:no-underline" href="https://practicum.yandex.ru">https://practicum.yandex.ru</a></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-center`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **12**
- классов в поддереве: **14**
- селектор переписи: `div.grid.grid-cols-2.gap-x-4.gap-y-3.text-small`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-center/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > section[6] > div[1]`), коробка **1076×100**:

| свойство | значение |
|---|---|
| `display` | `grid` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `100px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `14px` |
| `font-weight` | `400` |
| `line-height` | `20px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `gap` | `12px 16px` |
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

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R5-12 волны R5.

## Источники

**Production.** [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum)

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
