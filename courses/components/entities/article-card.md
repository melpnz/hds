# ArticleCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `relative` · `box-border` · `h-full` · `overflow-hidden` · `rounded-3xl` · `border` · `border-ui-black-100` · `flex` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-article-card`](../../showcase/components.html#c-article-card) |
| **Snapshot** | 3 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **32 узлах**, страниц — **4 из 10**: education-center, education-centers-listing, promocodes, schools-for-children.

карточка блога «Журнал»: тип и дата («Статья • 28 августа») и заголовок. Встречается только внутри Carousel

> Правило применения призывом («используйте …, если …») здесь не выведено.
> Оно требует разбора контекстов по корпусу, а не пересказа числа вхождений,
> и относится к шагу R5-05. Всё, что стоит выше, — измерено.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="relative box-border h-full overflow-hidden rounded-3xl border border-ui-black-100"><div class="aspect-video w-full rounded-t-lg bg-cover bg-center" style="background-image: url(&quot;https://habrastorage.org/getpro/habr/upload_files/fd0/9e8/50f/fd09e850fb64cdaee473482facb34b89.png&quot;);"></div><div class="flex flex-col gap-2 p-6 pt-5 text-small"><div><span>Статья</span><span class="inline-separator inline-separator"> • </span><span class="text-ui-black-500">28 августа</span></div><div class="line-clamp-2 whitespace-normal break-words text-h4 font-semibold">Сколько зарабатывают разработчики в 2026&nbsp;году и куда пойти учиться</div></div><a href="https://habr.com/ru/companies/habr_career/articles/1075936/" rel="noopener noreferrer nofollow" target="_blank" class="z-2 absolute bottom-0 left-0 right-0 top-0"></a></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `education-center`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **8**
- классов в поддереве: **31**
- селектор переписи: `.swiper-slide > div.relative.box-border.h-full.overflow-hidden.rounded-3xl.border.border-ui-black-100:not(.flex):not(.cursor-pointer)`

Корень этой записи в снимке `computed.json` не сопоставлен — вычисленные значения
не приводятся. Сопоставление ведётся по совпадению тега и всех классов селектора
переписи; здесь оно не сошлось, и подставлять вместо него значения браузера
по умолчанию нельзя.

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-05 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-05 |

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `z-2`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Прозаические разделы не написаны.** «Когда не использовать», «Как работает», «Управление клавиатурой», «Анимация», «Правила» требуют вывода из корпуса, а не переизложения снятого, и bulk-проходом не делаются. Пока их нет, запись стоит в статусе `partial`: вёрстка и факты есть, статья — нет. Дописывает шаг R5-05 волны R5.

## Источники

**Production.** [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `education-center.css`).

**Figma.** `Статья` (02_Education-NEW, узел 10947:108334) — Статья 272×268

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
