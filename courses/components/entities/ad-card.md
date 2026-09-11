# AdCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `relative` · `block` · `h-full` · `w-full` · `cursor-pointer` · `overflow-hidden` · `rounded-3xl` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-ad-card`](../../showcase/components.html#c-ad-card) |
| **Snapshot** | 2 из 2 состояний снято |

## Когда использовать

Компонент стоит в продукте на **52 узлах**, страниц — **4 из 10**: courses-listing, education-centers-listing, promocodes, schools-for-children.

рекламный слайд: две картинки (desktop и mobile) + метка «РЕКЛАМА» rounded-[60px] text-[8px] opacity .7 + кнопка «ещё» 24×24 (символ more, открывает плашку маркировки) + раскрываемая плашка с ИНН и erid. Измерено: раскрываемую плашку несут 20 узлов из 52, остальные 32 — только пара <img> без подписи; сигнатура у всех 52 одна, это один элемент в двух составах, а не два элемента. Формально не часть дизайн-системы, но занимает верх каждой витрины

**Правило.** Рекламный слайд в `AdSlot`: картинки для десктопа и мобильного, метка «РЕКЛАМА», у 20 из 52 — кнопка «ещё» с плашкой маркировки. В продукте 52 узла на 4 страницах, все в `Carousel`.

## Когда не использовать

- Для собственных промо продукта — `PromoCard`.

## Как работает

`div.cursor-pointer` с двумя `<img>`; мобильная картинка включается на `phone:` (`phone:!block`), десктопная скрывается. У 20 узлов есть раскрываемая плашка с ИНН и erid.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. На один экземпляр по Tab проходят: ничего — у 31 из 52; 1 кнопка — у 17 из 52; 1 кнопка и 1 ссылка — у 3 из 52; 1 ссылка — у 1 из 52; у остальных 1 — другой состав. По корпусу (24 узла): `Link` — 4; вне записей реестра — `button.absolute.right-3.top-3.z-10` — 20.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="relative block h-full w-full cursor-pointer overflow-hidden rounded-3xl phone:aspect-[272/280] phone:w-full"><img src="https://assets.habr.com/courses-web/courses-web/images/banners/banner_carousel_discounts_courses_desktop_x2.webp" alt="" class="absolute inset-0 h-full w-full object-cover phone:hidden"><img src="https://assets.habr.com/courses-web/courses-web/images/banners/banner_carousel_discounts_courses_mobile_x3.webp" alt="" class="absolute inset-0 hidden h-full w-full object-cover phone:!block"><!----></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **15**
- селектор переписи: `div.relative.block.h-full.w-full.cursor-pointer.overflow-hidden.rounded-3xl`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[0] > div[0] > div[0] > div[0] > div[0] > div[0]`), коробка **494.16×201.84**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `568px` |
| `height` | `232px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `border-radius` | `24px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-13 |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:hidden`, `phone:!block`, `phone:aspect-[272/280]`, `phone:w-full`. Условия префиксов: `small-phone:` — до 479, `phone:` — до 767, `tablet-only:` — 768–1023, `tablet:` — до 1023 (`docs/guide/layout.md`).

## Ограничения

- **Заглушки содержимого.** 2 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

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
