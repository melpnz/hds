# RatingTable

| | |
|---|---|
| **Категория** | Коллекции (`collections`) |
| **Корневой класс** | `overflow-hidden` · `rounded-3xl` · `border` · `border-ui-black-100` · `pb-1` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-rating-table`](../../showcase/components.html#c-rating-table) |
| **Snapshot** | 3 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **2 узлах**, страниц — **2 из 10**: courses-listing, rating.

не table, а grid: обёртка rounded-3xl border, шапка bg #f1f1f1 text-small semibold, строки a.grid grid-cols-[1fr_120px_120px_120px] gap12 py16, hover bg #f1f1f1. min-w 496 внутри overflow-x-auto; на phone колонки [minmax(232px,1fr) 112px 68px 68px], обёртка теряет радиус и уходит в -mx-6

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R5-08. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="overflow-hidden rounded-3xl border border-ui-black-100 pb-1 phone:-mx-6 phone:rounded-none"><div class="overflow-x-auto"><div class="w-full"><div class="w-full min-w-[496px] bg-ui-black-50 text-left text-small font-semibold"><div class="grid grid-cols-[1fr_120px_120px_120px] gap-3 pb-4 pt-5 phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px]"><div class="pl-6">Онлайн-школы</div><div>Рейтинг</div><div>Курсы</div><div class="pr-6">Отзывы</div></div></div><div><!--[--><a href="/education_centers/402-digital-skills-academy" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">1</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/upload_files/559/b9f/5d1/559b9f5d1bc4b6c33e06a6d8b8a4315a.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Digital Skills Academy</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">25</div><div>10</div></a><a href="/education_centers/543-abius" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">2</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/bfd/e70/c27/bfde70c272b07558422044d61257bcc6.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">АБИУС</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">278</div><div>36</div></a><a href="/education_centers/486-akademiya-edpro" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">3</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/d09/dc6/991/d09dc69912808b5314ff4ff35faa676f.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Академия EDPRO</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">17</div><div>57</div></a><a href="/education_centers/271-akademiya-edyuson" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">4</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/9e9/6f5/677/9e96f5677b1afb29a5943cf6daa0e7c3.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Академия Эдюсон</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">239</div><div>200</div></a><a href="/education_centers/487-korol-govorit" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">5</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/390/a20/887/390a2088793068f59103191320cf6309.webp" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Король Говорит</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">2</div><div>22</div></a><a href="/education_centers/591-mitu" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">6</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/680/85f/03a/68085f03af63b7a1f80932e2f90ba80d.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">МИТУ</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">150</div><div>47</div></a><a href="/education_centers/645-uchebnyy-centr-mgutu" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">7</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/d9e/e96/c62/d9ee96c625846e53da659fce90c570f1.jpeg" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Учебный центр МГУТУ</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>5.00</span></div><div class="flex items-center">54</div><div>31</div></a><a href="/education_centers/3-hekslet" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">8</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/upload_files/303/ec0/130/303ec0130582dcd0a00f8b4a4678e20c.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><!----></div><span class="phone:line-clamp-1">Хекслет</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>4.98</span></div><div class="flex items-center">24</div><div>55</div></a><a href="/education_centers/565-institut-professionalnyh-kvalifikaciy" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">9</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/d37/660/7ae/d376607ae55ccd4c55a9a48298b753f7.jpeg" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Институт профессиональных квалификаций</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>4.98</span></div><div class="flex items-center">172</div><div>67</div></a><a href="/education_centers/539-institut-biznes-analitiki" class="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 py-4 text-small text-ui-black-850 hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline phone:grid-cols-[minmax(232px,1fr)_112px_68px_68px] phone:hover:bg-none"><div class="grid grid-cols-[28px_32px_1fr] items-center gap-3 pl-6"><span class="block text-ui-black-500">10</span><div class="relative h-8 w-8"><img src="https://habrastorage.org/getpro/courses/fda/6b3/f1c/fda6b3f1cf2ef57b4440b3e3b206504b.png" alt="" style="--avatar-size:32px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover flex-shrink-0 rounded-lg object-contain"><img alt="Партнер Хабра" src="https://assets.habr.com/courses-web/courses-web/images/icons/green-partner-icon.svg" class="absolute bottom-[-6px] right-[-6px] z-10 v-popper--has-tooltip"></div><span class="phone:line-clamp-1">Институт бизнес-аналитики</span></div><div class="mr-2 flex items-center gap-1.5"><svg class="svg-icon text-ui-yellow-500" style="width:20px;height:20px;" width="20" height="20"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg><span>4.96</span></div><div class="flex items-center">19</div><div>34</div></a><!--]--></div></div></div><!--[--><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **135**
- классов в поддереве: **52**
- селектор переписи: `div.overflow-hidden.rounded-3xl.border.border-ui-black-100.pb-1`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[8] > div[1]`), коробка **1076×702**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `702px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `padding` | `0px 0px 4px` |
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
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-08 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-08 |

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `v-popper--has-tooltip`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 10 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R5-08 волны R5.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [rating](https://career.habr.com/education_centers/rating)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `Строка (рейтинг)` (02_Education-NEW, узел 9987:36309) — Строка (рейтинг), 6 вариантов hover × device

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
