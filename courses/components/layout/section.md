# Section · BaseSection

| | |
|---|---|
| **Категория** | Раскладка (`layout`) |
| **Корневой класс** | `flex` · `flex-col` · `gap-4` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-section`](../../showcase/components.html#c-section) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **15 узлах**, страниц — **7 из 10**: courses-listing, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

section + h2 24/28 semibold ls −0.5 + слот; внутренний gap 16 у всех 15 узлов, попавших в счёт, — по построению селектора (gap-4 стоит в нём самом), а не наблюдение по всем секциям. Между секциями 48 на 6/10 страниц и 40 на страницах экспертов, редакции и профиля — межсекционный интервал не сквозной

**Правило.** Используйте для смыслового блока страницы с заголовком H2 — «Популярные курсы», «Журнал», «Отзывы». В продукте 15 узлов на 7 страницах.

## Когда не использовать

- Для оболочки страницы — контейнер `ui/layout.css`.
- Для подзаголовков внутри блока.

## Как работает

`<section>` с `h2` 24 / 28, 600, −0.5 и слотом, промежуток 16. Между соседними секциями 48 — так в 6 парах из 7; на странице школы одна пара разнесена на 96.

## Управление клавиатурой

Корень (`<section>`) в фокус не попадает. На один экземпляр по Tab проходят: 2 кнопки и 9 ссылок — у 4 из 15; 28 кнопок и 9 ссылок — у 3 из 15; 10 кнопок и 9 ссылок — у 2 из 15; у остальных 6 — другой состав. По корпусу (355 узлов): `Link` — 138, `FilterChip` — 107, `Button` — 70, `IconButton` — 24, внутри `ReviewCard` — 6, внутри `FilterBar` — 5; вне записей реестра — `button.scrollbar-button.right-0.text-ui-black-400.hover:text-ui-black-850` — 5.

## Анимация

Переходы вычислены по страницам, отрисованным с CSS корпуса на 1440:

- `transition-property: transform` без длительности: `div.swiper-wrapper`, `div.swiper-slide` — 108 узлов, у 12 экземпляров из 15.

Нулевая длительность у узлов Swiper — это CSS самой библиотеки: длительность перелистывания она ставит из скрипта, а снимок сделан без него, так что её значение в пакете не снято. Остальные узлы переходов не объявляют: наведение на них сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<section class="flex flex-col gap-4"><h2 class="m-0 text-h2 font-semibold"><!--[-->Рейтинг лучших школ 2026<!--]--></h2><!--[--><!--]--><!--[--><div class="overflow-hidden rounded-3xl border border-ui-black-100 pb-1 phone:-mx-6 phone:rounded-none"><div class="overflow-x-auto"><div class="w-full"><div class="w-full min-w-[496px] bg-ui-black-50 text-left text-small font-semibold"><div class="grid grid-cols-[1fr_120px_120px_120px] gap-3 pb-4 pt-5 phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px]"><div class="pl-6">Онлайн-школы</div><div>Рейтинг</div><div>Курсы</div><div class="pr-6">Отзывы</div></div></div><div><!--[--><a href="/education_centers/402-digital-skills-academy" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">1</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/upload_files/559/b9f/5d1/559b9f5d1bc4b6c33e06a6d8b8a4315a.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Digital Skills Academy</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">25</div><div>10</div></a><a href="/education_centers/543-abius" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">2</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/bfd/e70/c27/bfde70c272b07558422044d61257bcc6.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">АБИУС</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">278</div><div>36</div></a><a href="/education_centers/486-akademiya-edpro" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">3</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/d09/dc6/991/d09dc69912808b5314ff4ff35faa676f.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Академия EDPRO</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">17</div><div>57</div></a><a href="/education_centers/271-akademiya-edyuson" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">4</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/9e9/6f5/677/9e96f5677b1afb29a5943cf6daa0e7c3.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Академия Эдюсон</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">239</div><div>200</div></a><a href="/education_centers/487-korol-govorit" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">5</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/390/a20/887/390a2088793068f59103191320cf6309.webp" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Король Говорит</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">2</div><div>22</div></a><a href="/education_centers/591-mitu" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">6</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/680/85f/03a/68085f03af63b7a1f80932e2f90ba80d.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">МИТУ</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">150</div><div>47</div></a><a href="/education_centers/645-uchebnyy-centr-mgutu" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">7</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/d9e/e96/c62/d9ee96c625846e53da659fce90c570f1.jpeg" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Учебный центр МГУТУ</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">54</div><div>31</div></a><a href="/education_centers/3-hekslet" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">8</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/upload_files/303/ec0/130/303ec0130582dcd0a00f8b4a4678e20c.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Хекслет</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>4.98</span></div><div class="flex items-center">24</div><div>55</div></a><a href="/education_centers/565-institut-professionalnyh-kvalifikaciy" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">9</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/d37/660/7ae/d376607ae55ccd4c55a9a48298b753f7.jpeg" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Институт профессиональных квалификаций</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>4.98</span></div><div class="flex items-center">172</div><div>67</div></a><a href="/education_centers/539-institut-biznes-analitiki" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">10</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/fda/6b3/f1c/fda6b3f1cf2ef57b4440b3e3b206504b.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Институт бизнес-аналитики</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>4.96</span></div><div class="flex items-center">19</div><div>34</div></a><!--]--></div></div></div><!--[--><!--]--></div><!--]--></section>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **137**
- классов в поддереве: **56**
- селектор переписи: `section.flex.flex-col.gap-4`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[4]`), коробка **1076×569**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `column` |
| `width` | `1076px` |
| `height` | `569px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `gap` | `16px` |
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

Классы с префиксом ширины в поддереве записи: `phone:pl-0`, `phone:max-h-[326px]`, `phone:-mx-6`, `phone:rounded-none`, `phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px]`, `phone:hover:bg-none`, `phone:line-clamp-1`, `phone:grid-cols-1`, `tablet-only:grid-cols-3`, `phone:[&>*:nth-child(n+5)]:hidden` и другие. Условия префиксов: `phone:` — до 767, `tablet-only:` — 768–1023 (`docs/guide/layout.md`).

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `v-popper--has-tooltip`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 10 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** [{"story":"common-basesection--base-section-story","file":null,"renders":true,"note":null}]

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
