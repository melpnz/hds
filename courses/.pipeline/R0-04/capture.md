# R0-04 · `ui/layout.css` и `ui/utilities.css`

Оболочка страницы, контейнер, сетка секций, брейкпоинт-инфраструктура —
и новый файл `ui/utilities.css` (решение R0-05, `conventions.markupUtilities`,
X-66). Последний шаг волны R0.

Дата работы: 8 сентября 2026.

---

## 1. Что снято

Ничего не переснималось с прода и Figma — весь evidence уже лежал на диске
(METHOD §3, «не переснимай»). Все числа этого шага пересчитаны заново по
уже сохранённым файлам, а не приняты на веру из `BRIEF.md`/`ROADMAP.md`
(долг X-73 — инвентаризация пакета уже несколько раз ошибалась).

| Источник | Что дал | Где лежит |
|---|---|---|
| `evidence/source/production/css/{inline,external}/*.css` (22 файла, снято 8 сентября на R0-03) | правила `.app-container`, `.app-content`, `.container`, связок контейнера, сетки секций; брейс-скан `@media` | не менялся, только читался |
| `evidence/source/production/pages/<id>/dom.html` (10 файлов) | покрытие классов в разметке — точное совпадение токена | не менялся |
| `evidence/source/production/pages/<id>/computed{,-320,-375,-479,-480,-744,-768}.json` (10 страниц × 7 файлов) | геометрия: `max-width`, `padding`, `grid-template-columns`, `gap` | не менялся |
| `ui/foundations.css`, `docs/guide/typography.md` | признак границы слоя (по объявленному свойству) и точные счётчики GAP-9, пересчитаны заново | не менялись |
| `ui/tokens.css` | подтверждение, что ни у одного числа этого шага нет переменной `:root` | не менялся |
| Живой браузер (`node tools/serve.mjs` + Playwright, `channel: 'msedge'`) | проверка копируемости METHOD §6.1 на 320/744/1024/1440 | `.pipeline/R0-04/copy-check.html` (новый), временные скрипты проверки удалены после прогона |

Figma не открывалась заново — решение о каноне брейкпоинтов (320/744/1024
против прода 480/768/1024) уже принято на более ранних шагах и записано
в `BRIEF.md` §9; отдельного узла Figma с layout-сеткой контейнера в этом
шаге не искали (GAP-4 в `docs/guide/layout.md`).

`tools/capture.mjs` в этом шаге не запускался и не адаптировался (строка
долга X-44 не закрыта этим шагом): вся нужная CSS уже лежала в корпусе,
живой прод не понадобился.

---

## 2. Брейкпоинты — независимый брейс-скан

### 2.1. Баг брейс-скана версии R0-03 и его починка

Первая попытка воспроизвести брейс-скан `@media` этим шагом (наивная
реализация: строка-до-`{` = либо `@media …`, либо обычное правило,
кавычка = начало CSS-строки) вернула **три** условия на весь корпус
вместо шести с сотнями правил каждое. Причина: Tailwind печатает классы
вида `.content-\[\'\'\]:after` — экранированную одиночную кавычку ВНЕ
CSS-строки, в имени селектора. Наивный сканер видел голый символ `'`
и запускал поиск «строки» до следующей кавычки — которая нашлась только
через ~1 МБ, в другом файле склейки. Всё, что между ними, для скана не
существовало.

Правка: backslash вне CSS-строки — неделимая пара с следующим символом,
не триггер строки. Скрипт (полностью) — `find-rules` часть протокола ниже,
сохранён в этом файле для воспроизводимости:

```js
function skipStringOrComment() {
  if (src[i] === '/' && src[i + 1] === '*') { /* … */ }
  if (src[i] === '\\') {                 // ЧИНИТ БАГ ВЕРСИИ 1
    buf += src[i]; if (i + 1 < n) buf += src[i + 1];
    i += 2; return true;
  }
  if (src[i] === '"' || src[i] === "'") { /* … */ }
  return false;
}
```

После правки — глубина `{}` в конце файла 0, незакрытых `@media` 0
(инвариант целостности скана), и результат воспроизводится дважды подряд.

### 2.2. Результат: шесть названных условий подтверждены, плюс три без имени

```
$ node brace-scan2.mjs corpus.css
(max-width:767px)                          rules=2211  blocks=70
(max-width:479px)                          rules=469   blocks=23
(max-width:1023px)                         rules=320   blocks=40
(min-width:768px) and (max-width:1023px)   rules=80    blocks=40
(min-width:1024px)                         rules=40    blocks=40
(min-width:480px)                          rules=20    blocks=20
(min-width:768px)                          rules=20    blocks=20
(min-width:480px) and (max-width:1023px)   rules=20    blocks=20
only screen and (max-width:360px)          rules=11    blocks=11
Остаточная глубина: 0 | незакрытых @media: 0
```

Шесть названных префиксов — те же условия, что в `ui/layout.css`
(построчно сверено): `small-phone: (max-width:479px)`,
`phone: (max-width:767px)`, `tablet: (max-width:1023px)`,
`tablet-only: (min-width:768px) and (max-width:1023px)`,
`phablet-and-tablet: (min-width:480px) and (max-width:1023px)`,
`desktop: (min-width:1024px)`.

Три условия без имени, найденные заново:

- `(min-width:480px)`, `(min-width:768px)` — по одному правилу
  `.container{max-width:…px}` на блок (стандартный плагин-контейнер
  Tailwind, брейкпоинты 480/768/1024). В разметке десяти страниц класс
  `.container` не встречается **0/10** раз (см. §3.2) — framework мёртв
  в разметке, но не мёртв в сборке.
- `only screen and (max-width:360px)` — `.toastify-left,.toastify-right`,
  сторонняя библиотека Toastify, не продукт.

### 2.3. Всего правил в условии vs правил с конкретным префиксом

Брейс-скан считает ВСЕ правила внутри условия, независимо от имени
селектора. Отдельно посчитаны правила, несущие конкретный префикс
(`.small-phone\:`, `.phone\:`, `.tablet\:`, не считая `tablet-only:`/
`phablet-and-tablet:` — они физически лежат в других условиях):

```
$ node media-block-selectors.mjs "(max-width:479px)" "small-phone\:"
Всего правил: 469 | С префиксом: 460 | без префикса: 9
  .base-modal__wrapper, .base-modal__footer, .base-modal__sausage

$ node media-block-selectors.mjs "(max-width:767px)" "phone\:"
Всего правил: 2211 | С префиксом: 2170 | без префикса: 41
  :root, .error-page, .error-page__top-text,
  .adfox-banner[data-v-…], .swiper-card[data-v-…]

$ node media-block-selectors.mjs "(max-width:1023px)" "tablet\:"
Всего правил: 320 | С префиксом: 300 | без префикса: 20
  .page-with-sidebar__content, .adfox-banner[data-v-…], .swiper-card[data-v-…]

$ node media-block-selectors.mjs "(min-width:480px) and (max-width:1023px)" "phablet-and-tablet\:"
Всего правил: 20 | С префиксом: 20 | без префикса: 0

$ node media-block-selectors.mjs "(min-width:768px) and (max-width:1023px)" "tablet-only\:"
Всего правил: 80 | С префиксом: 80 | без префикса: 0
```

(`min-width:1024px)` разбирать отдельным прогоном не потребовалось: там
физически ровно два разных селектора — `.container{max-width:1024px}`
framework (20 блоков) и `.desktop\:hidden{display:none}` продукта
(20 блоков, R0-03), 20+20=40 сходится без остатка.)

### 2.4. Метрика «с префиксом» воспроизводит исходные числа R0-03 точно

R0-03 (`.pipeline/R0-03/capture.md` §4) насчитал 460 / 2170 / 300 / 20
правил для small-phone: / phone: / tablet: / desktop:. Метрика «с конкретным
префиксом» этого шага (460 / 2170 / 300 / 20 — см. §2.3) **совпала до
единицы на всех четырёх**. Разница с «всего правил в условии» (469 / 2211 /
320 / 40) — не ошибка счёта ни одной из сторон, а другие компоненты
продукта (FilterModal, страница ошибки, `--header-height`, рекламный блок,
карусель, `page-with-sidebar`, framework-контейнер), публикующие свои
правила на той же самой границе `@media` без искомого префикса в имени.

### 2.5. Расхождение с X-78 — предупреждение, не правка

`ROADMAP.md` X-78 утверждает, что независимый брейс-скан **приёмки**
R0-03 дал **470 и 2220** (не 460/2170) для small-phone:/phone:, называет
460/2170 «арифметической опечаткой» и предписывает исправить на 470/2220
при следующем касании `docs/guide/typography.md`/`ui/foundations.css`.

Пересчёт этого шага **не подтверждает 470/2220** ни по одной из двух
метрик (469/2211 «всего», 460/2170 «с префиксом» — см. §2.3–2.4). Метрика
«с префиксом» методологически совпадает с тем, что измерял R0-03 (счёт
правил конкретного префикса, не всех правил условия), и воспроизводит его
исходные числа без остатка. Похоже, что ошиблась не запись R0-03, а тот
пересчёт, на который ссылается X-78 (сам метод пересчёта в тексте строки
не описан, только результат).

Этот шаг `ui/foundations.css` и `docs/guide/typography.md` не трогает —
файлы вне границ R0-04, статус и текст X-78 править не может и не правит.
**Предупреждение приёмке и следующему шагу, который коснётся этих двух
файлов: не применять правку X-78 «460→470, 2170→2220» не перепроверив её
ещё раз третьим независимым способом** — второй независимый пересчёт
(этот шаг) указывает на противоположный вывод. Полный разбор с таблицей —
`docs/guide/layout.md`, GAP-5.

---

## 3. Контейнер

### 3.1. Числа пересчитаны, не приняты на веру

`ROADMAP.md`/`BRIEF.md` называют «контейнер 1124 + 24». Проверено заново
по `computed.json`, не принято на слово (долг X-73):

```
$ node — узел с классом mx-auto max-w-[1124px] px-6 py-0 tablet:px-6,
  evidence/source/production/pages/courses-listing/computed.json (viewport 1440):
  width: 1124px, max-width: 1124px, padding: 0px 24px, margin: 0px 158px
```

На семи измеренных ширинах (320, 375, 479, 480, 744, 768, courses-listing)
padding и max-width не меняются ни разу:

```
320: width=320px  maxwidth=1124px padding=0px 24px
375: width=375px  maxwidth=1124px padding=0px 24px
479: width=479px  maxwidth=1124px padding=0px 24px
480: width=480px  maxwidth=1124px padding=0px 24px
744: width=744px  maxwidth=1124px padding=0px 24px
768: width=768px  maxwidth=1124px padding=0px 24px
```

«1124 + 24» — это `max-width` самой коробки (border-box, паддинг внутри),
а не «1124 плюс ещё 24»: зона содержимого — `1124 − 48 = 1076px`,
подтверждено `grid-template-columns:1076px` сетки секций внутри контейнера
на viewport 1440 (тот же узел, `evidence/source/production/pages/
courses-listing/computed.json`).

### 3.2. `.container` объявлен и не используется — отрицательное утверждение со счётом

```
$ по всем 10 dom.html, точное совпадение токена:
  app-container -> total=10, pages=10/10 (по 1 на страницу)
  app-content   -> total=10, pages=10/10 (по 1 на страницу)
  .container (Tailwind, отдельно от app-container/scrollbar-container) -> 0/10
```

Проверено явно, не по остаточному принципу: единственные совпадения токена
`container` в разметке — `app-container` (10 раз) и `scrollbar-container`
(5 раз, другой, самостоятельный класс), ни разу — голый `.container`.

### 3.3. Реальный контейнер — связка утилит, не один класс

```
$ по всем 10 dom.html, class="…max-w-[1124px]…":
  "mx-auto max-w-[1124px] px-6 py-0 tablet:px-6"                                 — 10/10
  "m-auto max-w-[1124px] px-6"                                                    — 8/10 (все, кроме author и education-center)
  "mx-auto max-w-[1124px] px-6 py-0 tablet:px-6 m-auto flex h-[64px] …" (шапка)   — 10/10
```

Других `max-w-[NNNpx]` в разметке достаточно (652, 658, 702, 160) — все
принадлежат отдельным компонентам (карточки, аватары), не оболочке
страницы, в этот файл не идут.

---

## 4. Сетка секций

### 4.1. Узел и правило

```
$ evidence/source/production/pages/rating/dom.html:
  <div class="mx-auto max-w-[1124px] px-6 py-0 tablet:px-6">
    <div class="pb-10 relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pt-10">
```

```
$ corpus.css:
  .relative{position:relative}
  .grid{display:grid}
  .grid-cols-\[minmax\(0,1fr\)\]{grid-template-columns:minmax(0,1fr)}
  .gap-12{gap:3rem}                    /* 48px */
  .px-0{padding-left:0;padding-right:0}
  .pt-10{padding-top:2.5rem}           /* 40px */
  .pb-10{padding-bottom:2.5rem}        /* 40px */
```

Подтверждено computed: `display:grid`, `gap:48px`, `row-gap:48px`,
`column-gap:48px`, `grid-template-columns:1076px` (courses-listing, 1440).

### 4.2. Покрытие: 7/7 страниц, два меньшинства с адресом

```
$ per-page, class="…grid…gap-12…":
  author:                     — (нет)
  authors:                    — (нет)
  courses-listing:             relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pb-6 pt-6
  editors:                     — (нет)
  education-center:            relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pb-28 pt-6 phone:pt-0
  education-centers-listing:   pb-10 relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pt-10
                                grid gap-12                              [другой узел, см. 4.3]
  promocodes:                  pb-10 relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pt-10
  rating:                      pb-10 relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pt-10
  reviews:                     pb-10 relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pt-10
  schools-for-children:        pb-10 relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0 pt-10
```

7 страниц несут полную связку (`relative grid grid-cols-[minmax(0,1fr)]
gap-12 px-0` + `pt`/`pb`). Вертикальный отступ:

| Значение | Страниц | Кто |
|---|---|---|
| `pt-10 pb-10` (40/40) | **5/7** | education-centers-listing, promocodes, rating, reviews, schools-for-children |
| `pt-6 pb-6` (24/24) | 1/7 | courses-listing |
| `pt-6 pb-28 phone:pt-0` | 1/7 | education-center |

Победитель `pt-10 pb-10` — в `ui/layout.css`. Два других — исключения
с адресом (METHOD §8), не сверстаны отдельно (не верстать редкое при
измеренном частом).

`author`, `authors` и `editors` — 3/10 страниц без этой сетки вовсе:
собственная структура `flex flex-col gap-10` (проверено точным совпадением
класса во всех трёх `dom.html`; `editors` пропущен в исходной версии этого
раздела, хотя уже стоял строкой выше в таблице покрытия — найдено и
исправлено на шаге правок review-1). Не входит в правило, GAP-1
`docs/guide/layout.md`.

### 4.3. Аномалия: восьмое вхождение `gap-12` — другой узел

`education-centers-listing` печатает `class="grid gap-12"` вторым разом,
без `grid-cols-[minmax(0,1fr)]`, `px-0`, `relative` — вложенный узел
(не сетка секций страницы, что именно — не разбиралось, вне компонента
этого шага). GAP-2 `docs/guide/layout.md`.

---

## 5. Оболочка страницы (X-61)

```
$ corpus.css:
  .app-container{display:flex;flex-direction:column;height:100%}
  .app-content{flex:1 0 auto}
```

```
$ по всем 10 dom.html, точное совпадение токена:
  app-container -> 10/10, ровно 1 на страницу, класс самостоятельный
                   (класс="app-container", других классов на узле нет)
  app-content   -> 10/10, ровно 1 на страницу, класс самостоятельный
```

Ни на одно из двух правил прод не вешает `@media`. Вместе с
`body,html{height:100%}` (`ui/foundations.css`, разд. 3) это классический
прижатый футер. **X-61 закрыт**: оболочка в `ui/layout.css` собрана именно
на `app-container`/`app-content`, не на придуманном имени.

---

## 6. `ui/utilities.css` (X-66)

### 6.1. Пересчёт GAP-9 — точное совпадение с `docs/guide/typography.md`

```
$ node count-utility.mjs evidence/source/production/pages <10 классов>:
  whitespace-nowrap        -> total=471, pages=10/10
  truncate                 -> total=196, pages=6/10
  break-words              -> total=158, pages=9/10
  line-clamp-2             -> total=150, pages=8/10
  line-clamp-3             -> total=48,  pages=3/10
  line-clamp-1             -> total=21,  pages=3/10
  text-center              -> total=29,  pages=7/10
  text-right               -> total=20,  pages=3/10
  text-left                -> total=12,  pages=10/10
  small-phone:text-center  -> total=8,   pages=4/10
```

Все десять чисел сошлись с `docs/guide/typography.md` GAP-9 до вхождения —
независимый пересчёт этого шага подтверждает счёт R0-03 на этой таблице
полностью (в отличие от §2.5, где независимый пересчёт разошёлся).

### 6.2. Правила — литералом из корпуса

```css
.whitespace-nowrap{white-space:nowrap}
.truncate{overflow:hidden;white-space:nowrap}
.text-ellipsis,.truncate{text-overflow:ellipsis}
.break-words{overflow-wrap:break-word}
.line-clamp-1,.line-clamp-2{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical}
.line-clamp-1{-webkit-line-clamp:1}
.line-clamp-2{-webkit-line-clamp:2}
.line-clamp-3{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3}
.text-center{text-align:center}
.text-right{text-align:right}
.text-left{text-align:left}
/* внутри @media (max-width:479px) */
.small-phone\:text-center{text-align:center}
```

`.text-ellipsis` — сопутствующий селектор в общем правиле `.truncate`,
не отдельно посчитанная утилита GAP-9; включён в файл, потому что это
одно правило прода на двоих, а не два, само употребление `.text-ellipsis`
без `.truncate` не проверялось (GAP в `docs/guide/layout.md`).

### 6.3. `.leading-none` — исправление задания шага

Черновик задания на этот шаг называл `.leading-none` примером утилиты для
`ui/utilities.css`. Проверено по `ui/foundations.css` (раздел 4) и
`docs/guide/typography.md` («Отдельно от них — `.leading-none`: она
**входит** в слой, потому что меняет метрику ступени») — класс уже лежит
в `foundations.css` с R0-03 и туда не входит по признаку границы
(«утилита, объявляющая хотя бы одно из шести типографических свойств,
остаётся в foundations.css»; `.leading-none` объявляет `line-height`).
В `ui/utilities.css` не добавлен — дублировать правило в двух слоях
означало бы завести два источника истины на одно число.

---

## 7. Figma

Не открывалась заново этим шагом. Канон брейкпоинтов пакета (320/744/1024)
и его расхождение с реализацией прода (480/768/1024) уже зафиксированы
решением `BRIEF.md` §9 на более ранних шагах — переигрывать это решение
не входило в задачу. Отдельного узла Figma с layout grid (margins/gutters)
фрейма 1024/744/320 в этом шаге не искали и не читали — GAP-4
`docs/guide/layout.md`. Если такой узел найдётся, сверка возможна отдельным
шагом; источник чисел контейнера и сетки сейчас — только прод.

---

## 8. Проверки

### `node tools/validate-counts.mjs`

```
$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
  roadmapSteps: 76
  roadmapR0: 7
  elements: 55
  pages: 10
  unreachable: 8
  cssCategories: 10
  tokens: 51
  manifest: 55
  specs: 0
  scopeProduction: 44
  scopeStorybookOnly: 5
  scopeFigmaOnly: 6
EXIT=0
```

### `node --check tools/*.mjs`

```
$ node --check tools/*.mjs
EXIT=0
```

Пофайлово (шесть файлов `tools/` этого пакета):

```
OK tools/capture.mjs
OK tools/measure-selectors.mjs
OK tools/serve.mjs
OK tools/validate-classes.mjs
OK tools/validate-components.mjs
OK tools/validate-counts.mjs
```

### `node tools/validate-classes.mjs` (информационно, не квалифицирующий критерий — R0-06 в спорном состоянии)

```
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

Checked 47 classes in 1 file(s) against 17 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 16 ui stylesheet(s) free of doc-.
EXIT=0
```

`showcase/components.html` в рабочем дереве уже существует (параллельный
R0-06) и на момент этого прогона проходит проверку классов без ошибок —
наблюдение, не результат этого шага; `showcase/`, `validate-classes.mjs`
этим шагом не трогались.

### `node tools/validate-components.mjs --strict` (информационно)

```
Validated 55 component records.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}
Manifest structure is valid.
EXIT=0
```

Без изменений по сравнению с состоянием до этого шага — `manifest.json`
не трогался (граница задачи, R0-06 занят параллельно).

### Копируемость METHOD §6.1 — в браузере, программно и визуально

Фикстура `.pipeline/R0-04/copy-check.html`: пустая страница, один
`<link rel="stylesheet" href="/ui/courses.css">`, без витрины — оболочка
`app-container`/`app-content`, контейнер, сетка секций, все десять утилит
`ui/utilities.css`. Сервер — `node tools/serve.mjs` (порт 4179), браузер —
Playwright, `channel: 'msedge'` (собственный chromium headless-shell не
установлен в среде).

Проверено программно (`getComputedStyle`) на всех четырёх канонических
ширинах — 320, 744, 1024, 1440:

```
320:  max-width:1124px padding:0/24/0/24  grid-template-columns:272px   gap:48px  pt/pb:40/40
744:  max-width:1124px padding:0/24/0/24  grid-template-columns:696px   gap:48px  pt/pb:40/40
1024: max-width:1124px padding:0/24/0/24  grid-template-columns:976px   gap:48px  pt/pb:40/40
1440: max-width:1124px padding:0/24/0/24  grid-template-columns:1076px  gap:48px  pt/pb:40/40  (капс сработал: rect=1124)
```

Утилиты — все десять сработали на 320 и подтверждены на 1440:
`truncate` даёт `overflow:hidden; white-space:nowrap; text-overflow:ellipsis`;
`line-clamp-1/2/3` — верное число `-webkit-line-clamp`; `text-center/
right/left` — верный `text-align`; `small-phone:text-center` даёт
`text-align:center` на 320 (≤479) и `text-align:start` (не переопределено)
на 744/1024/1440 — граница `(max-width:479px)` подтверждена и здесь,
третий раз в пакете (после R0-00 и R0-03).

Проверено визуально скриншотами 320 и 1440 (сделаны, просмотрены, не
сохранены в пакет — временный проверочный артефакт, не evidence и не
пример пакета): секции складываются в колонку с видимым интервалом,
контейнер центрируется и не растягивается на всю ширину на 1440, обрезка
и перенос текста визуально соответствуют классам.

`.pipeline/R0-04/copy-check.html` оставлен в пакете как воспроизводимая
фикстура (то же решение, что принято приёмкой R0-03 для аналогичного
файла: дешевле держать готовую версию, чем восстанавливать при следующей
проверке инварианта).

---

## 9. Изменённые файлы

```
ui/layout.css                новый: оболочка, контейнер, сетка секций,
                              брейкпоинт-инфраструктура (был только протокол-
                              комментарий без CSS)
ui/utilities.css             новый: 10 утилит переноса/обрезки/выравнивания,
                              GAP-9 typography.md
ui/courses.css               @import url("utilities.css") пятым; обновлены
                              шапка (порядок слоёв, состояние на R0-04)
docs/guide/layout.md         новая статья слоя
README.md                    карта пакета: layout.css/utilities.css
                              наполнены, 15 @import, docs/guide/layout.md
ROADMAP.md                   строка R0-04: статус review, уточнены состав
                              и источники шага (шесть префиксов вместо трёх,
                              utilities.css)
.pipeline/R0-04/capture.md   этот файл
.pipeline/R0-04/copy-check.html  проверка METHOD §6.1, оставлена фикстурой
```

Не трогались: `components/` (включая `manifest.json`), `tools/`,
`package.json`, `CHANGELOG.md`, `BRIEF.md`, `showcase/`,
`ui/foundations.css`, `ui/fonts.css`, `ui/tokens.css`, `ui/components/*.css`,
`docs/guide/tokens.md`, `docs/guide/typography.md`,
`evidence/source/production/pages/`, `evidence/source/production/css/`,
`.pipeline/R0-00/…R0-03/`, `.pipeline/R0-05/`, `.pipeline/R0-06/`,
`career/`, `_sources/` — по границам задачи.

---

## 10. Найдено по ходу — кандидаты в строки долга

Не внесены в `ROADMAP.md` самим шагом (по правилам задания — вносит
приёмка), перечислены здесь:

1. **Три условия `@media` без имени в корпусе, не входящие в шесть
   названных префиксов** — `(min-width:480px)`, `(min-width:768px)`
   (framework-контейнер Tailwind, неиспользуемый в разметке 0/10) и
   `only screen and (max-width:360px)` (вендорный Toastify). Ни разу не
   упомянуты в `.pipeline/R0-03/capture.md` при исходном заявлении «все
   шесть префиксов». Не меняет ни один вывод пакета, но следующий шаг,
   который заново будет считать условия `@media`, не должен удивляться
   девяти вместо шести. Зафиксировано в `docs/guide/layout.md`, GAP-3.
2. **Расхождение с X-78 (см. §2.5 выше)** — независимый пересчёт этого
   шага воспроизводит исходные числа R0-03 (460/2170), а не «исправленные»
   470/2220 из X-78. Рекомендация приёмке: не закрывать X-78 автоматически
   правкой «460→470», перепроверить.
3. **`education-centers-listing` — второй, анонимный узел `grid gap-12`**
   (§4.3), не разобранный этим шагом: не понятно, какой это модуль.
4. **`author`/`authors`/`editors` не используют сетку секций вовсе** (`flex
   flex-col gap-10`, §4.2) — 3/10 страниц, устойчивое меньшинство, а не шум;
   если у пакета появится собственный разбор персональных/редакционных
   страниц, это стоит унести туда явно.
5. **`.text-ellipsis` не проверен отдельным подсчётом** (§6.2) — включён
   в `ui/utilities.css` только как сосед `.truncate` по общему правилу
   прода, употребление самого класса без `.truncate` не измерялось.

---

## 11. Чего не удалось снять

- **Figma layout grid для контейнера/сетки** — не искали (GAP-4), решение
  о каноне брейкпоинтов уже принято раньше без этого узла; если понадобится
  сверка внешнего вида контейнера с Figma, узел ещё предстоит найти.
- **Источник расхождения `min480:false`-состояния X-78** — метод, которым
  «приёмка R0-03» получила 470/2220, не описан в самой строке X-78 и не
  восстановлен этим шагом; сопоставить смогла только выходные числа,
  не процесс.
- **Модуль за анонимным `grid gap-12`** на `education-centers-listing`
  (§4.3) — какой это компонент, не разбиралось: вне границ этого шага
  (не layout, не подтверждено ни как секция, ни как что-то ещё).

---

## Итог по строкам долга ROADMAP.md

| Строка | Статус после этого шага |
|---|---|
| **X-25** (четыре диапазона вместо трёх, 480≠767, `phablet-and-tablet`) | **Закрыта.** `ui/layout.css` и `docs/guide/layout.md` несут все шесть названных префиксов (не четыре и не три), явно разбирают пару границ 480/767-768 и `phablet-and-tablet:`, и оба слоя пакета (контейнер, сетка) явно отмечены нечувствительными к 480 |
| **X-44** (`tools/capture.mjs` не отличает `:root` продукта от библиотеки) | **Не закрыта.** Инструмент не понадобился этому шагу — вся CSS уже лежала в сохранённом корпусе, `:root` в этом шаге не извлекался (это делал R0-02) |
| **X-61** (`app-container`/`app-content` не названы) | **Закрыта.** Оболочка `ui/layout.css` собрана на этих двух классах, с покрытием 10/10 и точным правилом из корпуса |
| **X-66** (`ui/utilities.css` — блокер копируемости R2-01) | **Закрыта.** Файл заведён, десять утилит GAP-9 реализованы литералом, подключён из `ui/courses.css` до `components/*`; копируемость подтверждена в браузере |
| **X-78** (опечатка 460/2170 → 470/2220) | **Не в границах шага** (файлы `ui/foundations.css`/`docs/guide/typography.md` не трогались) — но независимый пересчёт этого шага **противоречит** предписанной правке, см. §2.5 и находку 2 в §10; приёмке стоит знать об этом до следующего касания тех файлов |
