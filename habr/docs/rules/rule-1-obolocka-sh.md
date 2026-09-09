## 1 · Оболочка · SH

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **SH-1** | Шапка `position: sticky`, высота 56px (48px на ≤767) — высота `.tm-header` самой по себе | `.tm-header{position:sticky;height:56px}` + `getComputedStyle` на живом `habr.com`, порог подтверждён на 767/768/769 | 14/14 страниц | HIGH |
| **SH-1a** | На ≤767 полный видимый блок шапки может быть до 80px — из-за рекламного слота `.tm-header__feature` (effect.habr.com, помечен «РЕКЛАМА»), добавляющего ~32px сверху. Слот существует и на десктопе (36px), но там не входит в высоту `.tm-header`. Инвентарь-зависим, **не canonical факт о шапке** | Visual Foundations pass, `getBoundingClientRect` на живом `habr.com/ru/feed/` | 1 наблюдение, оба вьюпорта | MEDIUM — реклама не гарантирована на каждой загрузке |
| **SH-2** | Контейнер `.tm-page-width`: `box-sizing: content-box`, `max-width: 1096px` — это ширина **контента**, без padding. Edge-to-edge на ≤767 (padding 0), 768px/padding 16 на 768–1023, растёт до потолка на ≥1024 | CSS + Visual Foundations измерение на 320/480/768/1024/1100/1440/1096/1120/1144/1160/1200 | 14/14 (страницы), 11 точек viewport | HIGH |
| **SH-2a** | Реальный потолок ВНЕШНЕЙ (видимой) ширины контейнера — **1144px** = 1096 (контент) + 24+24 (padding). Достигается не на 1024 и не на 1100 (контейнер там ещё растёт вместе с viewport), а начиная примерно с viewport 1160px | прямой замер `getBoundingClientRect` на 6 промежуточных viewport | 1 страница, 6 точек | HIGH |
| **SH-2b** | Переключение одна↔две колонки — ровно на границе **1023/1024**, не 767/768. На 768–1023 сайдбар уже в DOM, но лежит **под** главной колонкой (single column), не сбоку | замер ±1px на 1022/1023/1024/1025/1026, на живом `habr.com/ru/feed/` | 1 страница, 5 точек | HIGH |
| **SH-3** | Фон страницы — **серый** (`--background-gray`), не белый. Карточки/поверхности — белые плоскости поверх него | `html,body{background-color:var(--background-gray)}`, живой рендер | 14/14 | HIGH |
| **SH-4** | Сайдбар фиксирован 300px, `position: relative` — **не липкий** (в отличие от Career, где фильтры залипают) | `.tm-page__sidebar{width:var(--sidebar-width);position:relative}` | 14/14 | HIGH |
| **SH-5** | Сайдбар — зарезервированная колонка, не гарантированный контент: пуст для гостя на 6 из 14 страниц | DOM-срез: 23 символа (пустой Vue-фрагмент) на `feed`/`articles-all`/`news`/`hub`/`article`/`article-comments` | 6/14 пустых, 8/14 заполненных | HIGH |
| **SH-6** | Подвал — `tm-footer-menu` (колонки ссылок) + `tm-footer` (копирайт, соцсети) | разметка всех страниц | 14/14 | HIGH |
| **SH-7** | Сетка одинакова на всех шести проверенных page family (feed/article/hub/company/user/search) — ни одного per-family отличия в контейнере/колонках/gap не найдено | Visual Foundations grid-measure, 6 страниц × 6 viewport = 36 замеров | 6/6 page family | HIGH |

---
