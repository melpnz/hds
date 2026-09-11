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

**Правило.** Рекламная область вверху витрин: карусель баннеров `AdCard` и слот adfox. В продукте 5 узлов на 4 страницах.

## Когда не использовать

- Для собственных промо-блоков продукта — `PromoCard`.

## Как работает

`div` с `Carousel` из `AdCard` и кнопками закрытия `IconButton` 24×24.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. С клавиатуры доступны вложенные записи: `IconButton` ×8, `Link` ×4 — у каждой свой раздел.

## Анимация

В поддереве записи — `transition-transform` — переход по `transform` 0.15 с с кривой `cubic-bezier(.4,0,.2,1)`; `duration-300` — 0.3 с у слайдов Swiper. Других переходов нет: наведение сменяется мгновенно.

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

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:!h-auto`, `phone:!w-full`, `phone:aspect-[272/280]`, `phone:w-full`, `phone:hidden`, `phone:!block`. Условия префиксов: `small-phone:` — до 479, `phone:` — до 767, `tablet-only:` — 768–1023, `tablet:` — до 1023 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

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
