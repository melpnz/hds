# EntityHeader

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `grid` · `overflow-hidden` · `rounded-3xl` · `border` · `border-ui-black-100` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#entity-header`](../../../viewer/index.html#entity-header) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узле**, страниц — **1 из 10**: education-center.

шапка страницы школы: обложка, логотип, название, рейтинг и выпускники, описание. На phone раскрывается на всю ширину: -mx-6, без радиуса и рамки

**Правило.** Шапка страницы школы: обложка, логотип, название, оценка, выпускники, описание. В продукте 1 узел — на странице школы.

## Когда не использовать

- Для профиля человека — `PersonHeader`.

## Как работает

`div` с обложкой; на `phone:` раскрывается на всю ширину (`-mx-6`), логотип уменьшается до точного production-размера 70 через `--courses-size-70`. Кнопка «Подробнее» использует 14/20.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. По Tab проходят: 1 кнопка. По корпусу (1 узел): вне записей реестра — `button.m-0.inline.cursor-pointer.bg-transparent` — 1.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="grid overflow-hidden rounded-3xl border border-ui-black-100 phone:-mx-6 phone:rounded-none phone:border-none"><img src="https://habrastorage.org/getpro/courses/70b/05b/17a/70b05b17a393c94f2f5d674a2b59f3c3.png" alt="Обложка образовательной организации" class="h-[208px] w-full bg-ui-white object-cover object-center phone:h-[150px]"><div class="relative flex items-center gap-5 bg-ui-white p-6 phone:pb-0 phone:pt-10"><img src="https://habrastorage.org/getpro/courses/upload_files/908/4c6/03d/9084c603d799f50ca46d9f9e19dd6815.png" alt="" style="--avatar-size:24px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover z-2 !h-[100px] !w-[100px] rounded-3xl bg-ui-white phone:absolute phone:-top-[46px] phone:!h-[70px] phone:!w-[70px] phone:rounded-2xl phone:border-2 phone:border-solid phone:border-ui-white"><div class="flex w-full flex-col gap-2"><div class="text-h1-mobile font-semibold">Яндекс Практикум</div><div class="flex items-center"><div class="mr-2 flex items-center gap-1"><svg class="svg-icon text-ui-yellow-500" style="width:16px;height:16px;" width="16" height="16"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span class="text-small font-semibold">4.55</span></div><!--[--><span><span class=""><!--[--><span class="text-small text-ui-black-500">1419 отзывов</span><!--]--></span><!--[--><span class="inline-separator inline-separator"> • </span><!--]--></span><span><span class=""><!--[--><span class="text-small text-ui-black-500">18073 выпускника</span><!--]--></span><!----></span><!--]--></div><div class="flex gap-2 text-small phone:flex-col"><div class="line-clamp-1 max-w-[calc(100%-80px)] break-all phone:line-clamp-4 phone:max-w-full [&amp;&gt;*:first-child]:!m-0">Яндекс Практикум — сервис онлайн-образования, где учат на практике цифровым профессиям и навыкам. Обучение проходит в интерактивном тренажёре, где студенты погружаются в реальную практику, отрабатывают новые навыки и сразу применяют их в рабочих ситуациях. На курсах студенты с первых уроков пишут код, работают с макетами в Figma, анализируют данные и настраивают рекламные кампании. А наставники и ревьюеры дают обратную связь, разбирают сложные моменты и помогают на протяжении всего образовательного процесса. Программы состоят из двух частей: бесплатного вводного курса и платного продолжения. Бесплатная часть поможет оценить формат, примерить на себя профессию и принять взвешенное решение.</div><button class="m-0 inline cursor-pointer bg-transparent p-0 text-start text-ui-blue-500 hover:text-ui-blue-600 hover:no-underline"> Подробнее </button></div></div></div><!--[--><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-center`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **20**
- классов в поддереве: **61**
- селектор переписи: `div.grid.overflow-hidden.rounded-3xl.border.border-ui-black-100`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/education-center/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[1]`), коробка **1076×358**:

| свойство | значение |
|---|---|
| `display` | `grid` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `358px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `position` | `static` |
| `overflow` | `hidden` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:h-[150px]`, `phone:pb-0`, `phone:pt-10`, `phone:absolute`, `phone:-top-[46px]`, `phone:!h-[70px]`, `phone:!w-[70px]`, `phone:rounded-2xl`, `phone:border-2`, `phone:border-solid` и другие. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `z-2`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 2 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `education-center.css`).

**Figma.** `10983:72700` (02_Education-NEW, узел 10983:72700)

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
