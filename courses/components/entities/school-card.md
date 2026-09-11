# SchoolCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `relative` · `box-border` · `h-full` · `cursor-pointer` · `overflow-hidden` · `rounded-3xl` · `border` · `border-solid` · `border-ui-black-100` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-school-card`](../../showcase/components.html#c-school-card) |
| **Snapshot** | 3 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **48 узлах**, страниц — **3 из 10**: education-centers-listing, reviews, schools-for-children.

обложка 112 → тело p24 pt32 → логотип 48 rounded-xl абсолютом на -20px с белой рамкой 2px → рейтинг и число отзывов → title text-h4 line-clamp-3 → AvatarStack выпускников → Button M mt-auto → сквозная ссылка. Опровергает §10.2 исследования: это не grid [48px 1fr], а вертикальная карточка с обложкой

**Правило.** Используйте для школы в листингах организаций: обложка, `EntityLogo`, оценка, `AvatarStack` выпускников, кнопка «Подробнее». В продукте 48 узлов на 3 страницах.

## Когда не использовать

- Для курса — `CourseCard`.
- Для строки рейтинга — `RatingTable`.

## Как работает

`div.cursor-pointer` со сквозной ссылкой `a.absolute` на страницу школы. Ссылка — последний потомок и лежит поверх всего содержимого, кнопки тоже: при отрисовке на 1440 точка в центре кнопки «Подробнее» попадает в ссылку на всех видимых карточках. Класс `z-1` на ссылке правила в корпусе не имеет.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. На один экземпляр по Tab проходят: 1 кнопка и 1 ссылка — так у всех 48. По корпусу (96 узлов): `Button` — 48, `Link` — 48.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="relative box-border h-full cursor-pointer overflow-hidden rounded-3xl border border-solid border-ui-black-100"><div class="h-[112px] w-full bg-ui-white"><img src="https://habrastorage.org/getpro/courses/70b/05b/17a/70b05b17a393c94f2f5d674a2b59f3c3.png" alt="Обложка образовательной организации" class="h-[112px] w-full object-cover object-center"></div><div class="relative flex h-[calc(100%-112px)] flex-col items-start bg-ui-white p-6 pt-8"><img src="https://habrastorage.org/getpro/courses/upload_files/908/4c6/03d/9084c603d799f50ca46d9f9e19dd6815.png" alt="" style="--avatar-size:40px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover z-2 absolute -top-[20px] rounded-xl border-2 border-solid border-ui-white bg-ui-white"><div class="mb-1.5 flex items-center gap-2"><div class="flex items-center gap-1"><svg class="svg-icon text-ui-yellow-500" style="width:16px;height:16px;" width="16" height="16"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded-small"></use></svg><span class="text-small font-semibold">4.55</span></div><div class="flex items-center gap-1"><svg class="svg-icon text-ui-black-400" style="width:16px;height:16px;" width="16" height="16"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#comment"></use></svg><span class="text-small">1419</span></div></div><div class="mb-4 line-clamp-3 text-h4 font-semibold">Яндекс Практикум</div><div class="flex -space-x-1.5 mb-4"><!--[--><div class=""><img src="https://assets.habr.com/courses-web/courses-web/images/avatars/user_avatar_2.svg" class="block h-[24px] w-[24px] rounded-full border border-solid border-ui-white"></div><div class=""><img src="https://habrastorage.org/getpro/moikrug/uploads/user/100/097/340/2/avatar/medium_b51734be81ebe10c814e9f3ba4fd8c1b.jpeg" class="block h-[24px] w-[24px] rounded-full border border-solid border-ui-white"></div><div class=""><img src="https://assets.habr.com/courses-web/courses-web/images/avatars/user_avatar_2.svg" class="block h-[24px] w-[24px] rounded-full border border-solid border-ui-white"></div><!--]--><div class="flex h-[24px] items-center rounded-full border border-solid border-ui-white bg-ui-black-50 px-2 text-micro text-ui-black-500"> +18070</div></div><button class="mt-auto inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white mt-auto" rel="nofollow noreferrer" target="_self"><!--[--> Подробнее <!--]--></button></div><a href="/education_centers/35-yandeks-praktikum" class="z-1 absolute bottom-0 left-0 right-0 top-0"></a></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-centers-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **24**
- классов в поддереве: **73**
- селектор переписи: `div.relative.box-border.h-full.cursor-pointer.overflow-hidden.rounded-3xl.border.border-solid.border-ui-black-100`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-centers-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > div[1] > div[0] > div[0]`), коробка **260×314**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `260px` |
| `height` | `314px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-02 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-02 |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `z-2`, `z-1`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 3 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [education-centers-listing](https://career.habr.com/education_centers) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

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
