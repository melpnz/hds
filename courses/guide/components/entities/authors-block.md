# AuthorsBlock

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `flex` · `flex-col` · `gap-6` · `text-small` · `text-ui-black-850` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#authors-block`](../../../viewer/index.html#authors-block) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узле**, страниц — **1 из 10**: courses-listing.

«Больше об авторах» на /courses: автор, редактор и аудитор подборки — Avatar 100 (у автора) и 48 (у редактора и аудитора), подпись роли, имя, должность, ссылка на профиль во внешней сети, Button «Больше об эксперте», биография Prose, регалии и экспертиза двумя списками, внизу Button «Посмотреть всех экспертов». Наблюдение на одной странице, не правило. Заведена 11 сентября 2026 при сборке страницы /courses (R6-01) решением владельца: модули страницы, которых нет в реестре, заводятся записями.

**Правило.** Используйте, чтобы показать, кто собрал и проверил подборку: автор — с фото 100, должностью, ссылкой на профиль и биографией, ниже строкой — редактор и аудитор с фото 48. В продукте 1 узел — на `/courses`, после выдачи; это наблюдение одной страницы, не правило.

## Когда не использовать

- Для списка экспертов раздела — `PersonCard` в `CardGrid` (`/courses/authors`).
- Для шапки профиля человека — `PersonHeader`.

## Как работает

`<section id="more-about">` с `h2` и колонкой через 24 (`gap-6`). Автор — ряд из `Avatar` 100 и колонки: подпись «Автор», имя `text-h3`, должность, ссылка на профиль во внешней сети (спрайт `external-profile.svg`) и ссылка-кнопка `Button` «Больше об эксперте»; на `phone:` ряд встаёт в колонку. Ниже — биография `Prose`, затем регалии и экспертиза двумя колонками `Prose`-списков (`grid-cols-2`, на `tablet:` — одна). Через разделитель `hr` — редактор и аудитор: ссылки `grid-cols-[48px_minmax(0,1fr)]` с `Avatar` 48, подписью роли `text-micro` и именем, тоже в две колонки. Последней — ссылка-кнопка `Button` «Посмотреть всех экспертов».

## Управление клавиатурой

Корень (`<section>`) в фокус не попадает. По Tab проходят: 5 ссылок. По корпусу (5 узлов): `Link` — 3, `Button` — 2.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<section id="more-about" class="flex flex-col gap-6 text-small text-ui-black-850"><h2 class="m-0 text-h2 font-semibold">Больше об авторах</h2><div class="flex flex-col gap-6"><!--[--><div class="flex gap-5 phone:flex-col"><div class="relative h-[100px] w-[100px]"><img src="https://habrastorage.org/getpro/courses/89e/133/8fe/89e1338feb8ab3bc4b1d655a12c88497.jpeg" alt="" style="--avatar-size:100px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain"></div><div class="flex flex-col"><div class="mb-1 text-small text-ui-black-500">Автор</div><div class="text-h3 font-semibold">Николай Ширинкин</div><div class="text-small text-ui-black-500">Менеджер продукта</div><div class="flex gap-2 mt-2"><!--[--><a href="https://www.linkedin.com/in/npshirinkin/" target="_blank" rel="noopener noreferrer" class="z-10 h-6 w-6 overflow-hidden rounded-full"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/external-profile.svg#linkedin.com"></use></svg></a><!--]--></div><a class="mt-5 w-max inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white mt-5 w-max" href="/courses/authors/11-nikolay-shirinkin" target="_self"><!--[--> Больше об эксперте <!--]--></a></div></div><div class="style-ugc text-small"><p>Менеджер продукта в Edtech/HR-tech. 
За более чем 7 лет работы создал и масштабировал цифровые продукты в Edtech (Яндекс Практикум, Сравни Образование, Хабр Карьера). Через карьерные и образовательные продукты обучил и трудоустроил более 30.000 специалистов, а также провел более 1000+ часов менторских консультаций для начинающих специалистов Product менеджеров, Разработчиков и Аналитиков</p></div><div class="grid grid-cols-2 gap-4 text-small tablet:grid-cols-1"><div class="flex flex-col gap-2"><div class="font-semibold">Регалии/Квалификации:</div><div class="style-ugc text-small"><ul>
<li>Product owner</li>
<li>Бакалавриат: Менеджмент, Управление персоналом</li>
</ul></div></div><div class="flex flex-col gap-2"><div class="font-semibold">Экспертиза:</div><div class="style-ugc text-small"><ul>
<li>Разработка и запуск продукта</li>
<li>Продуктовая аналитика</li>
<li>Стратегическое и операционное планирование</li>
<li>Финансовое планирование, бюджетирование, P&amp;L и расчет юнит-экономики</li>
<li>HR-менеджмент, обучение и развитие персонала</li>
<li>Управление персоналом, построение команды</li>
</ul></div></div></div><!--]--><hr class="m-0 h-[1px] w-full bg-ui-black-100"><!--[--><div class="grid grid-cols-2 gap-4 tablet:grid-cols-1"><!--[--><a href="/courses/authors/15-anastasiya-sichkarenko" class="grid grid-cols-[48px_minmax(0,1fr)] gap-3 hover:no-underline"><img src="https://habrastorage.org/getpro/courses/75f/1ef/209/75f1ef209ba8eceaf2e51b947b927f2f.png" alt="" style="--avatar-size:48px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain"><div><div class="text-micro text-ui-black-500">Редактор</div><div class="text-small font-semibold text-ui-black-850">Анастасия Сичкаренко</div><!----></div></a><a href="/courses/authors/9-elena-luchina" class="grid grid-cols-[48px_minmax(0,1fr)] gap-3 hover:no-underline"><img src="https://habrastorage.org/getpro/courses/61b/287/40f/61b28740f73ca6c791a4697fba3276f6.png" alt="" style="--avatar-size:48px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain"><div><div class="text-micro text-ui-black-500">Аудитор</div><div class="text-small font-semibold text-ui-black-850">Елена Лучина</div><div class="text-micro text-ui-black-500">Старший Аккаунт-менеджер Хабр Образования</div></div></a><!--]--></div><a href="/courses/authors" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300"><!--[--> Посмотреть всех экспертов <!--]--></a><!--]--></div></section>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **47**
- классов в поддереве: **67**
- селектор переписи: `section.flex.flex-col.gap-6.text-small.text-ui-black-850`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[2] > div[0] > section[0]`), коробка **1076×653**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `column` |
| `width` | `1076px` |
| `height` | `653px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `14px` |
| `font-weight` | `400` |
| `line-height` | `20px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `gap` | `24px` |
| `position` | `static` |
| `overflow` | `visible` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:flex-col`, `tablet:grid-cols-1`. Условия префиксов: `phone:` — до 767, `tablet:` — до 1023 (`docs/guide/layout.md`). Список редакторов и аудиторов остаётся в одну колонку до 1023; две колонки появляются только на desktop.

## Ограничения

- **Заглушки содержимого.** 3 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза не проходила ревью.** Запись заведена 11 сентября 2026 при сборке страницы `/courses` (R6-01), после двух кругов ревью прозы; её разделы написаны тем же генератором и тем же способом, но независимо не проверены — отсюда `partial` при снятом `default`.
- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses)

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
