# Habr — Design System Knowledge

Пакет знаний о визуальном языке и композиции **Хабра** (`habr.com`).
Собран обратной разработкой: production release `2.346.1`, Storybook
(`@storybook/vue3-vite`), Figma-библиотека `habr-lib` и Figma-файл
company admin `m.habr-admin-company`.

Дата последнего обновления: **7 сентября 2026**.
Срез production: `2.346.1`. На `2.346.2` сверка `check/parity.js`
проходит без расхождений — значения не разъехались.
Статус: **v1.0 — MVP Product Design System**. Career был методологическим
образцом (архитектура пакета, дисциплина evidence, формат спецификаций) —
**не источником содержимого**. Ни один токен, компонент или правило не
перенесены из Career; Habr и Career не разделяют ни одного значения.

---

## Coverage / Known limits

Читать до всего остального. Habr исследован **гостем** (production) и
**дизайном company admin** (Figma) — это два принципиально разных типа
evidence, и граница между ними важнее, чем кажется.

**Хорошо покрыто (production-confirmed):**

* оболочка: шапка, контейнер, сайдбар, подвал — 14/14 страниц;
* публичный листинг контента (`ArticleCard`, `Tabs`, `Pagination`) —
  7 страниц;
* directory-листинги (хабы/компании/авторы) — 3 страницы;
* профиль/сущность (user/hub/company) — идентичность вверху главной
  колонки, не в сайдбаре — 3 страницы;
* 25 компонентов с реальным CSS и copy-safe разметкой, 23 из них
  со спецификацией (`components/INDEX.md`).

**Покрыто, но только Figma (не production):**

* весь слой **company admin** — навигация кабинета, wizard создания
  сущности, management list статей. Production для admin недоступен
  вообще: `/auth/` уводит на другую систему, авторизованный HTML не
  снимается. Каждое admin-правило в `RULES.md` помечено `Figma`, не
  `production`, и держится на **одном** полном экране на подпаттерн —
  не усредняйте это доверие с production-правилами;
* интерактивные оверлеи (Dialog/Dropdown/Hint) — реальный код из
  Storybook, но ни один не встретился в живой гостевой разметке
  (требуют клика/входа).

**Не покрыто / недостаточно evidence:**

* редактор контента — только иконки тулбара в Figma, не композиция
  экрана;
* полноценные формы настроек вне admin;
* модальные потоки как **паттерн страницы** (что именно их открывает) —
  компоненты покрыты, места вызова нет;
* состояния: пустой результат листинга, ошибка формы, загрузка,
  сообщение об успехе — не встретились ни разу;
* служебный экран 404 — production отдаёт пустой ответ без разметки.

### Главное правило

**Если задача лежит в непокрытой зоне, пакет гарантирует визуальный язык
и компоненты — и не гарантирует правильную структуру экрана.** Это
особенно верно для editor/settings/error: компоненты (Button, Block,
Input) будут стилистически верны, но состав экрана — реконструкция,
не факт. Для company admin ситуация мягче: паттерн есть, но подтверждён
только дизайном, не кодом — трактовать как сильную гипотезу, не как
готовый код.

Полный разбор — [`RULES.md`](RULES.md) §1–§12 (описание) и §13 (решения),
[`evidence/pattern-taxonomy.md`](evidence/pattern-taxonomy.md) (статус
каждого семейства страниц).

---

## Purpose

| Вопрос | Где ответ |
|---|---|
| Как выглядит Habr? | `RULES.md` §6 (Surfaces), §10 (Content Density & Typography) |
| Из чего строить? | [`showcase/components.html`](showcase/components.html) — живая витрина, 34 раздела |
| Как устроен конкретный компонент? | [`components/INDEX.md`](components/INDEX.md) |
| По каким правилам собирается страница? | [`RULES.md`](RULES.md) §1–§12 |
| Как решать то, чего в продукте ещё нет? | [`RULES.md`](RULES.md) §13 — 13 Decision Guides |
| Как из этого строить целую страницу? | [`showcase/pages.html`](showcase/pages.html) |
| Какие семейства страниц подтверждены | [`evidence/pattern-taxonomy.md`](evidence/pattern-taxonomy.md) |
| Откуда взят каждый факт | [`evidence/source-map.md`](evidence/source-map.md), [`evidence/conflicts.md`](evidence/conflicts.md) |
| Что нужно для standalone-рендера | [`evidence/runtime-contract.md`](evidence/runtime-contract.md) |
| Не разъехался ли пакет с продуктом | `python check/run.py` — см. [`check/README.md`](check/README.md) |

## When to use

* Новый публичный экран или фича Хабра;
* Новый экран внутри company admin — с поправкой на то, что admin-
  правила Figma-confirmed, не production-confirmed;
* Прототип, который должен выглядеть и вести себя как Habr;
* Проверка готового макета на соответствие продукту.

## Do not mix with

Хабр — три разные системы на одном домене. Этот пакет описывает
**обычный Хабр** (`habr.com/ru/...`). Не переносить эти правила на:

* **Хабр Карьеру** (`career.habr.com`) — отдельный пакет `../career/`,
  другой контейнер, другая нейтральная шкала, другой акцент;
* **Хабр Курсы** — ещё одна дизайн-система на career.habr.com/courses,
  не покрыта ни этим пакетом, ни `career/`;
* **Хабр Аккаунт** (`id.habr.com`, `/auth/`) — вход и регистрация уводят
  на отдельную систему; Habr не имеет собственных экранов входа.

---

## Структура пакета

```
habr/
  README.md          эта карта
  RULES.md           77 описательных правил + 13 Decision Guides
  ui/
    habr.css          единая точка входа
    normalize.css     normalize.css v8, встроен в сборку без изменений
    foundations.css   добавки Habr поверх normalize
    themes.css + themes/light-v2.css, dark-v2.css
    fonts.css         Fira Sans через Google Fonts
    layout.css        оболочка: контейнер, сайдбар, шапка
    patterns.css      page-bound CSS, нужный для воспроизведения паттернов
    components/       25 компонентов, каждый — свой CSS-файл
    assets/           109 иконки в собранном наборе (138 в production-каноне),
                      3 иллюстрации-аватара, 17 пустых состояний + README
  components/
    INDEX.md          реестр компонентов + coverage checkpoint
    actions/ content/ data/ feedback/ forms/ navigation/ overlays/
  showcase/
    components.html   живая витрина, 34 раздела
    pages.html        живое воспроизведение подтверждённых паттернов
  check/             проверки пакета: одна команда python check/run.py
  evidence/
    source-map.md         классификация всех 111 файлов сборки
    conflicts.md           4 расхождения источников, ничего не усреднено
    runtime-contract.md    что нужно для standalone-рендера + история поправки
    pattern-taxonomy.md    14 семейств страниц, каждое — CONFIRMED/PARTIAL/MISSING
```

## Runtime contract

Минимум для рендера вне Storybook:

```html
<link rel="stylesheet" href="ui/themes/light-v2.css">
<link rel="stylesheet" href="ui/habr.css">
```

`ui/habr.css` уже импортирует `normalize.css` и `foundations.css` — их
не нужно подключать отдельно. Полный разбор, включая found-after-copy-test
поправку про normalize.css, — [`evidence/runtime-contract.md`](evidence/runtime-contract.md).

## Method note

Career доказал метод (audit → runtime contract → Figma inventory →
conflict pass → extraction → UI kit → components → showcase →
pattern library → product grammar) на первом продукте. Habr прошёл тот
же метод во второй раз, без промежуточных шагов, которые в Career
были исследовательскими, — и это первое подтверждение, что метод
переносится. Что перенеслось, а что пришлось делать иначе — в финальном
отчёте по итогам Product Grammar (см. историю разработки пакета).
