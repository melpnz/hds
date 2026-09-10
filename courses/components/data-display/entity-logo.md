# EntityLogo

| | |
|---|---|
| **Категория** | Отображение данных (`data-display`) |
| **Корневой класс** | `rounded-xl` · `border-2` · `border-ui-white` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-entity-logo`](../../showcase/components.html#c-entity-logo) |
| **Snapshot** | 2 из 2 состояний снято |

## Когда использовать

Компонент стоит в продукте на **48 узлах**, страниц — **3 из 10**: education-centers-listing, reviews, schools-for-children.

логотип организации — скруглённый квадрат rounded-xl (12), не 8, как утверждает §10.9 исследования. В карточке школы вынесен на -20px над телом карточки с белой рамкой 2px; в профиле автора — h-12 w-12 rounded-xl

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R2-05. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<img src="https://habrastorage.org/getpro/courses/upload_files/908/4c6/03d/9084c603d799f50ca46d9f9e19dd6815.png" alt="" style="--avatar-size:40px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover z-2 absolute -top-[20px] rounded-xl border-2 border-solid border-ui-white bg-ui-white">
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **11**
- селектор переписи: `img.rounded-xl.border-2.border-ui-white`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-centers-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > div[1] > div[0] > div[0] > div[1] > img[0]`), коробка **40×40**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `40px` |
| `height` | `40px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `2px solid rgb(255, 255, 255)` |
| `border-radius` | `12px` |
| `position` | `absolute` |
| `overflow` | `clip` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `empty` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R2-05 |

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `z-2`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 1 ссылка на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R2-05 волны R2.

## Источники

**Production.** [education-centers-listing](https://career.habr.com/education_centers) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `avatar/school` (education-lib, componentKey 84414d2f) — avatar/school, 167 инстансов

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
