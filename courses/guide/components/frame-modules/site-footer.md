# SiteFooter

| | |
|---|---|
| **Категория** | Модули оболочки (`frame-modules`) |
| **Корневой класс** | `bg-ui-black-50` |
| **CSS** | `ui/components/frame-modules.css` + утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#site-footer`](../../../viewer/index.html#site-footer) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **10 узлах**, страниц — **10 из 10**: author, authors, courses-listing, editors, education-center, education-centers-listing, promocodes, rating, reviews, schools-for-children.

bg #f1f1f1, padding 32/0/40 (phone 24/0), grid-cols-4 gap 16 → tablet-only 3 → phone 1. Ссылки text-small #2c2e34 hover:underline — §9.8 исследования утверждает 14/20 #909194, это неверно

**Правило.** Подвал каждой страницы, 10/10: колонки ссылок, сервисы Хабра, соцсети.

## Когда не использовать

- Для навигации внутри раздела — подвал общий для всех страниц.

## Как работает

`<footer>` `bg-ui-black-50`. Колонки перестраиваются: `tablet-only:grid-cols-3`, `phone:grid-cols-1`.

## Управление клавиатурой

Корень (`<footer>`) в фокус не попадает. На один экземпляр по Tab проходят: 17 ссылок — так у всех 10. По корпусу (230 узлов): `Link` — 170, `SocialIcon` — 60. 60 из 230 фокусируемых узлов на 1440 скрыты и в порядок табуляции не входят, пока их не покажут.

## Анимация

Переходов нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440): наведение сменяется мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<footer class="bg-ui-black-50 pb-10 pt-8 phone:py-6"><div class="mx-auto max-w-[1124px] px-6 py-0 tablet:px-6"><!--[--><div class="grid grid-cols-4 gap-4 phone:grid-cols-1 phone:gap-6 tablet-only:grid-cols-3"><ul class="m-0 flex list-none flex-col gap-2 p-0 phone:gap-3"><!--[--><li class="flex items-center gap-2"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#629FBC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><a href="https://habr.com/?utm_source=habr_career&amp;amp;utm_medium=habr_top_panel" rel="noopener noreferrer" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Хабр</a></li><li class="flex items-center gap-2"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#434B60;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><a href="https://qna.habr.com/?utm_source=habr_career&amp;amp;utm_medium=habr_top_panel" rel="noopener noreferrer" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Q&amp;A</a></li><li class="flex items-center gap-2"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#6274BC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><a href="https://career.habr.com/" rel="noopener noreferrer" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Карьера</a></li><li class="flex items-center gap-2"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#346EF4;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span><a href="https://career.habr.com/courses" rel="noopener noreferrer" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Курсы</a></li><!--]--></ul><ul class="m-0 flex list-none flex-col gap-2 p-0 phone:gap-3 tablet:hidden"><!--[--><li class="flex items-center gap-2"><!----><a href="/education_centers" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Список онлайн-школ</a></li><li class="flex items-center gap-2"><!----><a href="/education_centers/rating" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Рейтинг онлайн-школ</a></li><li class="flex items-center gap-2"><!----><a href="/education/promocodes" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Промокоды и скидки</a></li><li class="flex items-center gap-2"><!----><a href="/info/legal/agreement" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Соглашение с пользователем</a></li><!--]--></ul><ul class="m-0 flex list-none flex-col gap-2 p-0 phone:gap-3 tablet:hidden"><!--[--><li class="flex items-center gap-2"><!----><a href="/info/legal/tos" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Правила оказания услуг</a></li><li class="flex items-center gap-2"><!----><a href="/sitemap" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Карта сайта</a></li><!--]--></ul><ul class="m-0 flex list-none flex-col gap-2 p-0 phone:gap-3 tablet:flex desktop:hidden"><!--[--><li class="flex items-center gap-2"><!----><a href="/education_centers" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Список онлайн-школ</a></li><li class="flex items-center gap-2"><!----><a href="/education_centers/rating" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Рейтинг онлайн-школ</a></li><li class="flex items-center gap-2"><!----><a href="/education/promocodes" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Промокоды и скидки</a></li><li class="flex items-center gap-2"><!----><a href="/info/legal/agreement" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Соглашение с пользователем</a></li><li class="flex items-center gap-2"><!----><a href="/info/legal/tos" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Правила оказания услуг</a></li><li class="flex items-center gap-2"><!----><a href="/sitemap" class="py-0.5 text-small text-ui-black-850 hover:underline phone:py-0">Карта сайта</a></li><!--]--></ul><div class="flex flex-col items-end phone:items-start phone:gap-6"><ul class="m-0 flex list-none items-start gap-x-2 p-0 phone:gap-x-3"><!--[--><li><a class="block rounded-full hover:opacity-80" href="https://twitter.com/habr_career" title="Мы в Twitter"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#twitter"></use></svg></a></li><li><a class="block rounded-full hover:opacity-80" href="https://www.facebook.com/career.habr" title="Мы в Facebook"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#facebook"></use></svg></a></li><li><a class="block rounded-full hover:opacity-80" href="https://vk.com/habr_career" title="Мы во Вконтакте"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#vk"></use></svg></a></li><li><a class="instagram-gradient block rounded-full hover:opacity-80" href="https://www.instagram.com/habr_career/" title="Мы в Instagram"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#instagram"></use></svg></a></li><li><a class="block rounded-full hover:opacity-80" href="https://telegram.me/habr_career" title="Мы в Telegram"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#telegram"></use></svg></a></li><li><a class="block rounded-full hover:opacity-80" href="https://t.me/habrcareer_bot" title="Наш телеграм-бот"><svg class="svg-icon block rounded-full" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/social-v3.1.svg#telegram-bot"></use></svg></a></li><!--]--></ul><a class="mt-auto text-small text-ui-black-500" href="https://company.habr.com/">©&nbsp;Habr</a></div></div><!--]--></div></footer>
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **77**
- классов в поддереве: **48**
- селектор переписи: `footer.bg-ui-black-50`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > footer[1]`), коробка **1440×192**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `1440px` |
| `height` | `192px` |
| `background-color` | `rgb(241, 241, 241)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `0px solid rgb(255, 255, 255)` |
| `padding` | `32px 0px 40px` |
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

Классы с префиксом ширины в поддереве записи: `tablet:px-6`, `phone:grid-cols-1`, `phone:gap-6`, `tablet-only:grid-cols-3`, `phone:gap-3`, `phone:py-0`, `tablet:hidden`, `tablet:flex`, `desktop:hidden`, `phone:items-start` и другие. Условия префиксов: `phone:` — до 767, `tablet-only:` — 768–1023, `tablet:` — до 1023, `desktop:` — от 1024 (`docs/guide/layout.md`).

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `align-center`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin) · [authors](https://career.habr.com/courses/authors) · [courses-listing](https://career.habr.com/courses) · [editors](https://career.habr.com/courses/editors) · [education-center](https://career.habr.com/education_centers/35-yandeks-praktikum) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes) · [rating](https://career.habr.com/education_centers/rating) · [reviews](https://career.habr.com/education_centers/otzyvy) · [schools-for-children](https://career.habr.com/education_centers/shkoly-dlya-detej)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `10049:51115` (02_Education-NEW, узел 10049:51115)

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
