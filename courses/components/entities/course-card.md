# CourseCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `relative` · `box-border` · `flex` · `h-full` · `min-w-0` · `flex-col` · `overflow-hidden` · `rounded-3xl` · `border` · `border-ui-black-100` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-course-card`](../../showcase/components.html#c-course-card) |
| **Snapshot** | 3 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **96 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

центральный элемент продукта. Снятая анатомия: обложка img 148 + затемнение rgba(0,0,0,.12) → тело -mt-20 rounded-t-3xl bg #fff p24 → RatingBadge и MetaPill абсолютом на -34px → метастрока → title line-clamp-2 → чипы text-micro → цена → Button M mt-16 → сквозная ссылка-оверлей. Ширина 260 в 4-колоночной сетке. box-shadow: none — §10.1 исследования допускает тень, в проде её нет

**Правило.** Используйте для курса в выдаче и подборках: обложка с `MetaPill` и `RatingBadge`, `Badge` скидки, название, метки `Chip`, кнопка «Далее». В продукте 96 узлов на 7 страницах — в `CardGrid` (48), `Carousel` (40) и секциях.

## Когда не использовать

- Для школы — `SchoolCard`.
- Для пункта нумерованного ТОП-списка — `NumberedCourseItem`.

## Как работает

`div` со сквозной ссылкой-оверлеем на весь курс и кнопкой «Далее».

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. На один экземпляр по Tab проходят: 1 кнопка и 1 ссылка — так у всех 96. По корпусу (192 узла): `Button` — 96, `Link` — 96.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="relative box-border flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-ui-black-100" id="2060-1c-programmist-rasshirennyy-kurs"><img src="https://habrastorage.org/getpro/courses/7fa/402/3e3/7fa4023e33bea4d2474fb42228e626eb.png" alt="Обложка курса" class="z-0 h-[148px] w-full bg-ui-white object-cover object-center"><div class="absolute inset-0 bg-ui-black-transparent-120"></div><div class="relative -mt-5 flex flex-1 cursor-pointer flex-col rounded-t-3xl bg-ui-white p-6 text-ui-black-850"><div class="absolute -top-[34px] left-[10px] flex gap-1"><div class="flex gap-1.5 rounded-3xl bg-ui-white py-1 pl-1.5 pr-2"><div class="flex items-center gap-1"><svg class="svg-icon text-ui-yellow-500" style="width:16px;height:16px;" width="16" height="16"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded-small"></use></svg><span class="text-micro font-semibold">4.75</span></div><div class="flex items-center gap-0.5"><svg class="svg-icon fill-ui-black-400 text-ui-black-400" style="width:16px;height:16px;" width="16" height="16"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#comment"></use></svg><span class="text-micro">6</span></div></div><div class="rounded-3xl bg-ui-white px-2 py-1 text-micro">18 мес</div></div><div class="flex flex-col gap-3"><div class="flex items-center gap-2 whitespace-nowrap"><img src="https://habrastorage.org/getpro/courses/upload_files/d1a/027/83e/d1a02783eaff8df393eeba4aa9ac49b1.png" alt="Логотип Нетология" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover rounded-lg"><span class="max-w-full overflow-hidden text-ellipsis text-small font-semibold">Нетология</span></div><div class="line-clamp-2 whitespace-normal break-words">1C-программист: расширенный курс</div><div class="flex flex-wrap items-start gap-1 self-stretch text-micro"><!--[--><div class="flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1 max-w-[calc(100%_-48px)]"><div class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">1С разработка</div></div><div class="flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1 max-w-[calc(100%_-48px)]"><div class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">Git</div></div><!--]--><div class="flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1"> +9</div></div></div><div class="mt-auto flex flex-col gap-0.5 pt-5"><div class="flex flex-wrap items-center gap-x-2 gap-y-1"><span class="text-h4 font-semibold">от 4&nbsp;223 ₽/мес</span><div data-test-id="course-discount" class="text-semibold flex items-center rounded-full bg-ui-orange-500 px-1.5 py-0.5 text-micro text-ui-white"> -50% </div></div><span data-test-id="course-price" class="text-small text-ui-black-500">или сразу 129&nbsp;200 ₽</span></div><button class="mt-4 inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white mt-4" rel="nofollow noreferrer" target="_self"><!--[--> Далее <!--]--></button></div><a target="_blank" class="z-2 absolute bottom-0 left-0 right-0 top-0" rel="noopener noreferrer nofollow" href="https://fas.st/InUkT?erid=2bL9aMPo2e49hMef4pfysZW5NS&amp;page=courses"></a></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **32**
- классов в поддереве: **94**
- селектор переписи: `div.relative.box-border.flex.h-full.min-w-0.flex-col.overflow-hidden.rounded-3xl.border.border-ui-black-100`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > div[1] > div[0] > div[0]`), коробка **260×419.59**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `column` |
| `width` | `260px` |
| `height` | `419.594px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-01 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-01 |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `text-semibold`, `z-2`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 2 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `9785:45731` (02_Education-NEW, узел 9785:45731) — 793 инстанса, 284×420, вариант «Рассрочка»

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
