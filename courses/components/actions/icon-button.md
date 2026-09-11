# IconButton

| | |
|---|---|
| **Категория** | Действия (`actions`) |
| **Корневой класс** | `swiper-button-shadow` · `h-9` · `w-9` · `rounded-full` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-icon-button`](../../showcase/components.html#c-icon-button) |
| **Snapshot** | 4 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **32 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

три варианта: стрелка карусели 36×36 bg #fff border #e9e9ea; синяя 36×36 bg-ui-blue-50 border-ui-blue-300; кнопка «ещё» на рекламном слайде 24×24 bg #fff opacity .7 (инвентаризация называла её закрытием рекламы; символ more, открывает плашку маркировки) — селектором записи не считается. Наблюдение по макету, снятое инвентаризацией без адреса узла: elements/button/icon — fill #fff, border #e9e9ea, icon #a6a7a9, padding 6, border_radius 200. Строка figmaEvidence убрана (ни nodeId, ни componentKey — не evidence по METHOD §3); узел ищется на R2-05

**Правило.** Используйте для действия без подписи, когда иконка его однозначно называет: стрелки карусели — 24 в контентных секциях и 8 в баннерных каруселях `AdSlot`. В продукте 32 узла на 7 страницах, все — стрелки.

## Когда не использовать

- Когда действию нужно слово — `Button`.
- Для перехода между адресами: стрелки листают карусель на месте.

## Как работает

`<button>` с символом спрайта внутри. Стрелки карусели 36×36 заходят за край ленты на 16px (`-left-4`, `-right-4`). Отключённой стрелки в снятой разметке нет: Swiper отключает её рантайм-классом `swiper-button-disabled`, а у всех 32 стрелок его нет — снимок сделан без скрипта.

## Управление клавиатурой

Корень — `<button>`: фокус по Tab, действие — Enter или Space. Своего кольца фокуса нет, но нет и сброса: работает фокус браузера.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<button class="swiper-button-shadow z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-ui-black-100 bg-ui-white text-ui-black-400 hover:text-ui-black-850 absolute -left-4 top-[calc(50%_-_20px)]"><svg class="svg-icon rotate-90" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#arrow-large"></use></svg></button>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **2**
- классов в поддереве: **19**
- селектор переписи: `button.swiper-button-shadow.h-9.w-9.rounded-full`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[0] > div[0] > button[1]`), коробка **36×36**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `36px` |
| `height` | `36px` |
| `background-color` | `rgb(255, 255, 255)` |
| `color` | `rgb(166, 167, 169)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `18.4px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `9999px` |
| `padding` | `1px 6px` |
| `position` | `absolute` |
| `overflow` | `visible` |
| `text-align` | `center` |
| `box-shadow` | `rgba(0, 0, 0, 0.05) 0px 4px 6px -1px, rgba(0, 0, 0, 0.05) 2px 4px 2px 0px` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-02 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-02 |
| `pressed` | **не снято** | GAP: гостем не воспроизводится или требует JS; адрес — `STATE-CAPTURE.md` |
| `disabled` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R3-02 |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Не снятые состояния.** `pressed` — разбор в [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

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
