# ReviewCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `relative` · `box-border` · `h-full` · `whitespace-break-spaces` · `rounded-3xl` · `border` · `border-solid` · `border-ui-black-100` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#review-card`](../../../viewer/index.html#review-card) |
| **Snapshot** | 2 из 2 состояний снято |

## Когда использовать

Компонент стоит в продукте на **20 узлах**, страниц — **3 из 10**: courses-listing, education-center, reviews.

p24, шапка grid [50px 1fr 164px] (на phone [50px 1fr]) gap 12/16: аватар, автор и дата, оценка; тело с отступом pl 62 (на phone 0)

**Правило.** Используйте для отзыва: автор с `Avatar`, дата, оценка, текст, ссылка на курс. В продукте 20 узлов на 3 страницах — в `Carousel` (16) и секциях.

## Когда не использовать

- Для эксперта — `PersonCard`.

## Как работает

`div` с шапкой-сеткой: автор с `Avatar`, имя и дата, оценка. В карусели (16 карточек) шапка — `grid-cols-[50px_1fr]`; в секции на странице отзывов (4 карточки) — `[50px_1fr_164px]`, на `phone:` — `[50px_1fr]`. Ссылка на курс — плашка `hover:bg-ui-black-100`.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. На один экземпляр по Tab проходят: 2 ссылки — у 14 из 20; 1 кнопка и 2 ссылки — у 6 из 20. По корпусу (46 узлов): `Link` — 40; вне записей реестра — `button.absolute.bottom-0.left-0.m-0` — 6.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="relative box-border h-full whitespace-break-spaces rounded-3xl border border-solid border-ui-black-100"><div class="flex flex-col p-6 text-ui-black-850"><div class="flex flex-col gap-4"><div class="grid items-start gap-x-3 gap-y-4 grid-cols-[50px_1fr]"><img src="https://assets.habr.com/courses-web/courses-web/images/avatars/user_avatar_2.svg" alt="" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain" style="--avatar-size: 48px;"><div class="mt-[3px] flex flex-col gap-1"><div class="text-h4 font-semibold">Кристина Савельева</div><div class="text-small text-ui-black-500">Пользователь <span class="text-small inline-flex items-center gap-1">Хабра<svg class="svg-icon h-5 w-5 text-ui-green-500" width="20" height="20" style="width: 20px; height: 20px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#accreditation"></use></svg></span></div></div><div class="col-span-2 flex items-center gap-2"><div class="flex items-center justify-end"><svg class="svg-icon text-ui-yellow-500" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><svg class="svg-icon text-ui-yellow-500" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><svg class="svg-icon text-ui-yellow-500" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><svg class="svg-icon text-ui-yellow-500" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><svg class="svg-icon text-ui-yellow-500" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg></div><time datetime="2026-09-04T08:32:20Z" class="whitespace-nowrap text-right text-micro text-ui-black-500">4 сентября</time></div></div><div class="phone:pl-0 pl-0"><div class="mb-4 grid max-w-max grid-cols-[24px_1fr] items-center rounded-md bg-ui-black-50 p-1 text-small hover:bg-ui-black-100"><img src="https://habrastorage.org/getpro/courses/28b/7aa/499/28b7aa49961b670efb59bf1ad95ef0f4.png" alt="" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-md object-contain" style="--avatar-size: 24px;"><a class="z-10 mx-2 line-clamp-1 max-w-[658px] break-all text-small text-ui-black-850 hover:no-underline" href="https://avitology.pro/?utm_source=habr&amp;utm_medium=partner&amp;utm_campaign=habr_courses">Профессия авитолог: специалист по рекламе и продажам на Авито</a></div><div class="relative max-w-[702px] text-small"><div class="max-h-[258px] overflow-hidden phone:max-h-[326px] wrap-break-word grid gap-1.5 [overflow-wrap:anywhere]"><div><span class="font-semibold">Достоинства:</span> До курса я знала Авито только как обычный пользователь и вообще не понимала, чем конкретно занимается Авитолог. Хотелось освоить удаленную профессию, поэтому решила попробовать.Обучение понравилось тем, что здесь не просто показывают, куда нажимать в кабинете. Разбирают анализ ниши и конкурентов, объявления, фотографии, продвижение, статистику и работу с клиентами. В начале информации было много, некоторые моменты приходилось пересматривать, но постепенно все начало складываться в понятную систему.Отдельно понравилась практика и возможность задавать вопросы. Когда начинаешь разбирать реальные проекты, появляется очень много нюансов, которые самостоятельно не всегда получается понять.Еще для меня был важен блок про поиск клиентов, потому что до обучения больше всего переживала именно из-за </div></div><div class="absolute bottom-[20px] left-0 h-[60px] w-full shrink-0 bg-gradient-to-b from-transparent to-[var(--color-ui-white)]"></div><button class="absolute bottom-0 left-0 m-0 inline w-full cursor-pointer bg-ui-white p-0 pt-2 text-start text-ui-blue-500 hover:text-ui-blue-600 hover:no-underline">Читать полностью</button></div></div></div></div><a href="/education_centers/otzyvy/817-otchaynyy-avitolog/23373-professiya-avitolog-specialist-po-reklame-i-prodazham-na-avito/37441" class="z-1 absolute bottom-0 left-0 right-0 top-0 cursor-pointer"></a></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **34**
- классов в поддереве: **86**
- селектор переписи: `div.relative.box-border.h-full.whitespace-break-spaces.rounded-3xl.border.border-solid.border-ui-black-100`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[4] > div[1] > div[0] > div[0] > div[0] > div[0]`), коробка **350×461**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `350px` |
| `height` | `461px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `position` | `relative` |
| `overflow` | `visible` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-04 |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:pl-0`, `phone:max-h-[326px]`, `phone:grid-cols-[50px_1fr]`, `phone:col-span-2`, `phone:flex`, `phone:items-center`, `phone:gap-2`. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `wrap-break-word`, `z-1`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 1 ссылка на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [reviews](https://career.habr.com/education_centers/otzyvy)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `11065:78841` (02_Education-NEW, узел 11065:78841)

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
