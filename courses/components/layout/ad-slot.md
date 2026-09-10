# AdSlot

| | |
|---|---|
| **Категория** | Раскладка (`layout`) |
| **Корневой класс** | `adfox-banner` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-ad-slot`](../../showcase/components.html#c-ad-slot) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **5 узлах**, страниц — **4 из 10**: courses-listing, education-centers-listing, promocodes, schools-for-children.

рекламный контур продукта: карусель баннеров и adfox-слот занимают верх каждой витрины. Описывать как область страницы и границу продукта, а не как оформление

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R5-14. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div id="adfox_17482673597189013" class="flex items-center justify-center overflow-hidden -mt-4 adfox-banner rounded-3xl"></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **0**
- классов в поддереве: **7**
- селектор переписи: `.banner-swiper, .adfox-banner`

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

## Ограничения

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R5-14 волны R5.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `courses-listing.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
