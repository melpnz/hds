# Pagination

| | |
|---|---|
| **Категория** | Навигация (`navigation`) |
| **Корневой класс** | `rounded-3xl` · `border` · `border-ui-black-100` · `bg-ui-white` · `p-3` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#pagination`](../../../viewer/index.html#pagination) |
| **Snapshot** | 5 из 5 состояний снято |

## Когда использовать

Компонент стоит в продукте на **4 узлах**, страниц — **4 из 10**: courses-listing, education-centers-listing, promocodes, schools-for-children.

**Правило.** Используйте для листания выдачи под сеткой карточек — курсов, организаций, промокодов. В продукте пагинация стоит под `CardGrid` на всех четырёх листингах с карточной выдачей, по одной на страницу. Рейтинг школ листается иначе: `RatingTable` на странице рейтинга догружает строки кнопкой «Показать еще 20».

## Когда не использовать

- Для листания ленты на месте — это `Carousel` со стрелками `IconButton`.
- Для перехода между двумя версиями раздела — `SegmentedControl`.
- Для догрузки строк таблицы: у `RatingTable` на странице рейтинга продукт ставит `Button` «Показать еще 20».

## Как работает

Контейнер-плашка во всю ширину колонки: стрелка «назад» — `<button rel="prev">`, на первой странице с атрибутом `disabled`; номера — ссылки `<a href="?page=N">` пилюлей 36×36; многоточие — статичный блок; стрелка «вперёд» — ссылка `<a rel="next">`. Стрелки — символ `arrow-small` спрайта, повёрнутый на ±90°. Текущая страница — рамка `border-ui-blue-300` и фон `bg-ui-blue-50`; синий цвет номера даёт базовое правило ссылки `a{color:var(--color-links-main)}`, а стоящий на узле класс `color-ui-blue-500` в сборке не объявлен (`tools/known-missing-classes.json`).

## Управление клавиатурой

Номера и стрелка «вперёд» — ссылки: фокус по Tab, переход — Enter. Стрелка «назад» — `<button>`: Enter или Space, а отключённая на первой странице выпадает из порядка табуляции. Своего кольца фокуса и сброса обводки нет — работает фокус браузера.

## Анимация

Классов перехода и анимации в разметке нет: наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1). Снят со страницы
`courses-listing`; адреса страниц заменены якорем, путь к спрайту — на
локальный.

```html
<div class="flex rounded-3xl border border-ui-black-100 bg-ui-white p-3"><button disabled="" rel="prev" class="flex h-9 w-9 rotate-90 appearance-none items-center justify-center border-none bg-ui-white p-0 text-ui-black-400 hover:text-ui-black-850 !hover:text-ui-black-200 !text-ui-black-200"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button><div class="m-auto flex gap-1.5 overflow-auto whitespace-nowrap"><a href="#c-pagination" class="color-ui-blue-500 border border-ui-blue-300 bg-ui-blue-50 flex h-9 w-9 items-center justify-center rounded-full hover:no-underline"><span>1</span></a><a href="#c-pagination" class="text-ui-black-850 hover:bg-ui-black-50 flex h-9 w-9 items-center justify-center rounded-full hover:no-underline"><span>2</span></a><a href="#c-pagination" class="text-ui-black-850 hover:bg-ui-black-50 flex h-9 w-9 items-center justify-center rounded-full hover:no-underline"><span>3</span></a><div class="flex h-9 w-9 items-start justify-center pt-1"> ... </div></div><a href="#c-pagination" rel="next" class="box-border flex h-9 w-9 -rotate-90 appearance-none items-center justify-center border-none bg-ui-white p-0 text-ui-black-400 hover:text-ui-black-850"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></a></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) и служебные комментарии Vue сняты.

- селектор переписи: `div.rounded-3xl.border.border-ui-black-100.bg-ui-white.p-3:has(> [rel="prev"])` — 4 узла на 4/10 страниц
- стрелка «назад» → ряд номеров (`m-auto flex gap-1.5 overflow-auto`) → стрелка «вперёд»

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > div[1] > div[1]`), коробка **1076×62**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `width` | `1076px` |
| `height` | `62px` |
| `background-color` | `rgb(255, 255, 255)` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `padding` | `12px` |

Номер страницы — 36×36; текущий: цвет `rgb(52, 110, 244)`, фон `rgb(239, 245, 255)`, рамка `1px solid rgb(148, 189, 252)`; остальные: цвет `rgb(44, 46, 52)`, фон прозрачный.

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md), снятость
каждой пары — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) §8
(пересмотр 11 сентября 2026: запись переклассифицирована в production).

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена | разметка выше |
| `hover` | снято с продакшена | `hover:bg-ui-black-50` у номеров, `hover:text-ui-black-850` у стрелок; живое на витрине |
| `focus-visible` | снято — факт браузерного дефолта | у ссылок и кнопки нет ни `outline-none`, ни своего кольца |
| `current` | снято с продакшена | `border-ui-blue-300 bg-ui-blue-50` у номера текущей страницы |
| `disabled` | снято с продакшена | `button[disabled][rel="prev"]` на первой странице, 4 узла на 4/10 страниц |

## Responsive

Адаптивных классов в разметке нет. Ряд номеров держит `overflow-auto` и `whitespace-nowrap`: на узкой ширине он прокручивается внутри плашки, а не переносится.

## Внешний вид

С макетом (`pagination`, переменные `elements/pagination/*` слоя `ui/tokens-figma.css`) совпадает: плашка белая с рамкой `#e9e9ea`, радиус 24, падинг 12; страница 36, пилюля; текущая — `#eff5ff`, рамка `#94bdfc`, номер `#346ef4`; наведение — `#f1f1f1`. Расхождение одно, в способе: у макета цвет номера текущей страницы задан самой страницей, у продукта — базовым правилом ссылки (класс на узле мёртвый).

## Ограничения

- **Переклассификация.** До 11 сентября 2026 запись стояла `figma-only` с формулировкой «в проде листания нет: вместо него кнопка «Показать еще 20»». Формулировка верна для одной страницы — рейтинга школ: там `RatingTable` догружает строки кнопкой «Показать еще 20». На четырёх листингах с карточной выдачей листание есть. Первая редакция этой пометки утверждала, что кнопки нет нигде, — поиск шёл по «ещё» через «ё»; поправлено по повторному ревью прозы. Ошибку нашла сборка страницы `/courses` из записей реестра (шаг R6-01). Вёрстка по макету (корень `crs-pagination`) убрана — её заменила продуктовая разметка.
- **Снята только первая страница.** На трёх листингах — номера 1–3 и многоточие, на детской витрине — номера 1–2 без многоточия; во всех четырёх текущая — первая, и стрелка «назад» отключена. Как выглядят середина выдачи и последняя страница, в снимке не видно.
- **Проза выведена из переписи корпуса.** Разделы написаны 11 сентября 2026 по снятой разметке и `computed.json`; «Название и текст», «Валидация», «Слоты · Props» не пишутся — подтвердить их нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej) — `evidence/source/production/pages/*/dom.html`, `computed.json`.

**Figma.** `education-lib`, компонент `pagination` (`componentKey` `bcc6d796…`); рабочий файл `02_Education-NEW`, узел `9909:29791`.
