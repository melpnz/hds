# Компоненты Habr — реестр

Единая точка входа в слой компонентов. **75+ спецификаций тут не будет** —
в отличие от Career, коэффициент компонент/CSS-файл у Habr другой: только
переиспользуемые primitives и composed modules получают спецификацию,
page-bound фрагменты остаются источником для Pattern Library. Полная
картина по всем 111 файлам сборки — `evidence/source-map.md`.

| Задача | Куда идти |
|---|---|
| Увидеть компонент вживую | [`../showcase/components.html`](../showcase/components.html) |
| Что покрыто, а что нет прямо сейчас | этот файл, раздел «Coverage checkpoint» ниже |
| Полный список из 111 файлов сборки | [`../evidence/source-map.md`](../evidence/source-map.md) |
| Runtime-контракт (что нужно для standalone-рендера) | [`../evidence/runtime-contract.md`](../evidence/runtime-contract.md) |
| Расхождения источников | [`../evidence/conflicts.md`](../evidence/conflicts.md) |
| Композиционные паттерны страниц | [`../evidence/pattern-taxonomy.md`](../evidence/pattern-taxonomy.md) + [`../showcase/pages.html`](../showcase/pages.html) |
| Полный инвентарь Figma-библиотеки habr-lib | [`../evidence/figma-inventory.md`](../evidence/figma-inventory.md) |
| Сравнение с Figma/production + план улучшений | [`../ROADMAP.md`](../ROADMAP.md) |
| Палитра: назначение каждого цвета, обе темы | [`../ui/themes/README.md`](../ui/themes/README.md) |
| Иконки и иллюстрации: два набора, расхождения | [`../ui/assets/README.md`](../ui/assets/README.md) |

---

## Реестр

| Компонент | Категория | Reuse | Storybook | CSS | Спецификация |
|---|---|---|---|---|---|
| Button | Действия | 15/16 | ButtonBase (7) + Button (8) | `button.css` | [actions/button.md](actions/button.md) |
| Icon | Данные | 15/16 | — | `icon.css` | [data/icon.md](data/icon.md) |
| Popover (BasePopover) | Оверлеи | 15/16 | BasePopover (10) | `popover.css` | [overlays/popover.md](overlays/popover.md) |
| Tabs | Навигация | 14/16 | — | `tabs.css` | [navigation/tabs.md](navigation/tabs.md) |
| Pagination + PaginationButton | Навигация | 11/16 | Pagination (10) + PaginationButton (7) | `pagination.css` | [navigation/pagination.md](navigation/pagination.md) |
| Title | Контент | 9/16 | — | `title.css` | [content/title.md](content/title.md) |
| DescriptionList | Контент | 4/16 | — | `primitives.css` | [content/primitives.md](content/primitives.md) |
| BorderedCard | Контент | 3/16 | — | `primitives.css` | [content/primitives.md](content/primitives.md) |
| Notice | Обратная связь | 2/16 | — | `notice.css` | [feedback/notice.md](feedback/notice.md) |
| InlineSeparator | Контент | 1/16 | — | `primitives.css` | [content/primitives.md](content/primitives.md) |
| Checkbox | Формы | 1/16 (+ Figma) | — | `checkbox.css` | [forms/checkbox.md](forms/checkbox.md) |
| Dialog | Оверлеи | Storybook-only | Dialog (10) | `dialog.css` | [overlays/dialog.md](overlays/dialog.md) |
| Dropdown | Оверлеи | Storybook-only | Dropdown (8) | `dropdown.css` | [overlays/dropdown.md](overlays/dropdown.md) |
| BaseHint / InformerHint / RestrictionHint | Оверлеи | Storybook-only | BaseHint (5) + InformerHint (4) + RestrictionHint (4) | `hint.css` | [overlays/hint.md](overlays/hint.md) |
| Block | Контент | Storybook-only | Block (5) | `block.css` | [content/block.md](content/block.md) |
| ArticleCard | Контент | 9/16 — флагманский модуль Pattern Library | — | `article-card.css` | [content/article-card.md](content/article-card.md) |
| Badges | Контент | 1/16, критично для Profile/Entity | — | `badges.css` | [content/badges.md](content/badges.md) |
| SectionName | Контент | 8/16 | — | `section-name.css` | [content/section-name.md](content/section-name.md) |
| ButtonFollow | Действия | 6/16 — закрывает найденный GAP (использовался без CSS) | — | `button-follow.css` | [actions/button-follow.md](actions/button-follow.md) |
| Votes (VotesMeter/VotesLever/VoteHintPopup) | Действия | votes-meter 7/16, votes-lever 5/16 | — | `votes.css` | [actions/votes.md](actions/votes.md) |
| Field (Input/Textarea) | Формы | Input 5/16 — **давний пробел, закрыт** | — | `input.css`, `textarea.css` | [forms/field.md](forms/field.md) |
| Radio | Формы | имя используется, стиль реконструирован | — | `radio.css` | [forms/radio.md](forms/radio.md) |
| Chip | Формы/выбор | Figma-only, admin-контекст | — | `chip.css` | [forms/chip.md](forms/chip.md) |
| Calendar | Формы/дата | Figma-only, admin-контекст | — | `calendar.css` | [forms/calendar.md](forms/calendar.md) |
| IconButton | Действия | Figma-only, условное имя | — | `icon-button.css` | [actions/icon-button.md](actions/icon-button.md) |

**27 компонентов в 24 спецификациях** (Hint и три мелких примитива
объединены — их CSS физически лежит в одном файле каждый). ArticleCard
и Badges добавлены на этапе Pattern Library — без них было невозможно
корректно воспроизвести семейства §2/§3/§6, см. `evidence/pattern-taxonomy.md`.
SectionName/ButtonFollow/Votes добавлены на этапе Visual
Foundations pass. Field/Radio/Chip/Calendar добавлены на этапе Figma
Library Extraction pass — см. `evidence/figma-inventory.md`. **IconButton
добавлен на Correction pass** после Visual UI Kit Completeness Review.

**Важно — отдельно от реестра specs:** до Correction pass ArticleCard,
Badges и UserInfo существовали только как CSS + spec + встроенная
композиция в `pages.html` — у них НЕ было собственной секции в
`showcase/components.html`, из-за чего самый переиспользуемый модуль
продукта физически не находился там, где его логично искать. Теперь у
ArticleCard/UserInfo/Badges/Avatar есть отдельные секции-специмены в
components.html (см. `showcase/components.html#article-card` и рядом) —
это тот же CSS/spec, что и раньше, просто наконец показан как reusable
module, не только как фрагмент page-pattern.

**Обратный случай — `Icon`.** Его секция в `showcase/components.html`
удалена: она состояла из пяти иконок и одной фразы и целиком дублировала
раздел Foundations → Icons, где теперь выведены все 109 символов набора,
все 138 файлов дизайн-библиотеки и 17 иллюстраций. Уникальное из неё
(паттерн разметки, правило про `<title>`, демонстрация наследования цвета,
GAP про `.tm-svg-icon`) перенесено туда же. **Компонент из реестра не
убран, спецификация не тронута** — удалён показ, не знание; тот же приём,
что с `BaseHint` и `RestrictionHint`.

---

## Coverage checkpoint

Снято перед переходом к Pattern Library. **Обновлено после Pattern Library**
(добавлены ArticleCard и Badges — см. ниже); исходный текст пунктов
про Button/Popover/Dialog и т.д. не менялся.

### Классификация source CSS

Полная таблица — `evidence/source-map.md`. Сводно, из **111 файлов** сборки
`2.346.1`:

| Категория | Файлов |
|---|---|
| Runtime (оболочка, не компонент) | 8 |
| Theme | 1 |
| **Primitive (переиспользуемый атом)** | **24** |
| **Composed module (переиспользуемый составной блок)** | **32** |
| Mixed (частично переиспользуемый) | 2 |
| Page presenter (вся страница целиком) | 5 |
| Page-bound fragment (одно размещение) | 22 |
| Micro (нет самостоятельной семантики) | 13 |
| Excluded (Storybook-обвязка/дубль) | 4 |

Из 24 Primitive + 32 Module = **56 реально переиспользуемых сущностей**.

### Получили спецификацию

**23 из 56** production-based сущностей (Input наконец перенесён — был
давно найден, но не извлечён, см. `evidence/conflicts.md` CFL-1) + **3
сущности сверх 56**, не имеющие никакого production CSS-файла вовсе
(Textarea/Radio/Chip/Calendar — FIGMA-RECONSTRUCTED, не считаются в
знаменателе 56, потому что 56 — это счёт по РЕАЛЬНЫМ извлечённым файлам
сборки, а не по компонентам библиотеки Figma).

Всего специфицировано: Button, Icon, Popover, Tabs,
Pagination+PaginationButton, Title, DescriptionList, BorderedCard, Notice,
InlineSeparator, Checkbox, Dialog, Dropdown, BaseHint, InformerHint,
RestrictionHint, Block, ArticleCard, Badges, SectionName,
ButtonFollow, Votes (VotesMeter+VotesLever), **Field/Input (закрывает
CFL-1), Textarea, Radio, Chip, Calendar**.

Отбор — по reuse (количество страниц) и по композиционной/дизайнерской
ценности, а не механически «первые N по списку»: например Dialog/Dropdown/
Hint/Block имеют reuse 0/16 в статическом харвесте, но включены как
единственный интерактивный слой продукта (см. `evidence/source-map.md`,
пояснение про Storybook-only компоненты) — без них DESIGN-режим не смог бы
спроектировать ни одного модального сценария. ArticleCard и Badges
добавлены на этапе Pattern Library по тому же принципу — необходимая
инфраструктура, а не механическая выборка: без ArticleCard семейства
«Content feed/listing» (7 страниц), «Directory listing» (частично) и фид
сущности в «Profile/Entity» невозможно воспроизвести кодом, а не текстом.

**SectionName/Votes** добавлены на этапе Visual Foundations pass
как топ-5 по reuse среди 38 ранее непокрытых сущностей (см. таблицу ниже) —
цель была полнота визуального языка, а не рост счётчика спецификаций.
**ButtonFollow** — отдельный случай: не входил в топ по reuse-ранжированию
как «первоочередной», но был обнаружен как реальный пробел — класс
`.tm-button-follow` уже использовался в `showcase/pages.html` без backing
CSS (см. GAP-раздел ниже, пункт закрыт).

### Сознательно оставлены без спецификации — high-reuse, не пробел знания

Это не GAP: CSS реальный, извлечён, но простой и однозначный — заводить
отдельный файл сейчас означало бы плодить спецификации ради счёта, а не
ради пользы. Переносятся в `ui/`, ждут своей MODULE-спецификации при первом
реальном DESIGN-использовании:

| Сущность | Reuse | Почему отложена |
|---|---|---|
| `hub-card` / `tm-company-profile-card` / `user-card` (identity-карточка сущности) | видны на 3 страницах | **Три РАЗНЫХ модуля**, не один — наблюдались с разными наборами полей (`evidence/pattern-taxonomy.md` §6). Один представитель (`tm-hub-card`) перенесён в `ui/patterns.css` для воспроизведения паттерна, но полной спецификации нет ни у одного из трёх — не объединять в общий «EntityCard» без проверки |
| `publication-label` (длинная форма, редакционная таксономия) | 8/16 | **Специфицирован** — `components/forms/chip.md`, замер с habr.com: контурная плашка одного цвета на все форматы. Сама таксономия (~45 значений, `evidence/conflicts.md` CFL-3) остаётся к Product Copy. Не путать с `publication-type-label` (короткая форма Новость/Пост/Голос) — она вошла в `ArticleCard` |
| `new-sidebar` | 8/16 | MODULE-обёртка, 10 деклараций, преимущественно инфраструктура виртуального скролла (placeholder-высота), не несёт самостоятельной визуальной семантики — сознательно пропущена на этапе Visual Foundations re-ranking |

**Закрыто на этапе Visual Foundations pass** (были в этой таблице раньше —
`section-name`, `votes-lever`+`vote-hint-popup` — получили
полноценную спецификацию, см. таблицу реестра выше).

**Покрыто внутри ArticleCard на этапе Pattern Library** (были в этом списке
раньше — сняты как отложенные, вошли в `ui/components/article-card.css`):
`article-datetime-published`, `bookmarks-button`, `icon-counter`, `user-info`,
`tm-votes-meter` (индикатор, не рычаг), `publication-type-label` (короткая форма).

### GAP — реальные пробелы знания, найденные в этом проходе

* **Button:** `:focus` неотличим от `:hover`/`:active` в CSS, хотя Figma
  показывает отдельную стадию focus для каждого варианта — не подтверждено,
  есть ли в реальности разница;
* **Button:** fill-варианты Danger/Minor не подтверждены (только line);
* **Button:** иконка внутри кнопки не подтверждена CSS;
* **`.tm-button-link_color-christi`:** не задаёт `color` — рендер-проверка
  показала дефолтный синий текст на зелёном фоне. **Зафиксирован как
  observed GAP, не исправлен** — нет отдельного evidence, что это баг,
  а не намеренное поведение в контексте, который не попал в срез;
* **Popover:** назначение `.variant-hub` не подтверждено конкретным местом
  использования;
* **Dialog:** брейкпоинт переключения modal-window ↔ bottom-drawer не найден
  в CSS — только косвенное следствие (тень шторки на 768–1023);
* **Dialog:** ширина по умолчанию — только значение story (320px), не
  продуктовый дефолт;
* **Dropdown:** состояния строки меню (hover/pressed/loading/not-found) —
  Figma-only, не подтверждены CSS; мобильная трансформация панели тоже
  Figma-only;
* **BaseHint:** разметка открытой панели восстановлена из структуры CSS-
  классов, а не скопирована из живого DOM — единственный не строго
  copy-safe случай в пакете;
* **InformerHint:** ширина по умолчанию не подтверждена ни в одном snapshot;
* **Icon:** второй класс-обёртка `.tm-svg-icon` существует в CSS, но ни разу
  не встретился в разметке — не считать эквивалентом `.tm-svg-img`;
* **Tabs:** три Figma-размера (Small/Medium/Large) не находят точного
  соответствия в production CSS (только один размер + модификатор `.slim`);
* **Checkbox:** `hover`-состояние не подтверждено CSS, только Figma.

**Добавлено на этапе Visual Foundations pass:**

* **ButtonFollow:** класс `.tm-button-follow` использовался в
  `showcase/pages.html` без backing CSS — найденный и закрытый GAP
  (теперь `ui/components/button-follow.css`);
* **Votes:** `.tm-minus-reason` (попап причины минуса) ссылается на
  `.tm-radio__option`/`.tm-radio__label`, которых нет ни в одной
  извлечённой спецификации — `.tm-radio` не встретился больше нигде в
  собранных 111 файлах в отдельном виде, GAP зафиксирован, не выдуман;
* **SectionName:** совпадение font-size (19.9px/700) с
  `.tm-hub-card__name` — не установлено, есть ли у этого уровня
  типографики отдельное системное имя, или это совпадение.

**Добавлено на этапе Figma Library Extraction pass** (полный разбор —
`evidence/figma-inventory.md`, 46 отслеженных Figma component sets):

* **Field/Input:** давний пробел закрыт — `.tm-input-text-decorated`
  был найден ещё на этапе Pattern Library (CFL-1) и ни разу не перенесён
  в `ui/`. `get_variable_defs` подтвердил geometry (`radius=4`) дословно —
  CFL-1 закрыт как MATCH, не расхождение;
* **CFL-5 (новый):** цвет текста ошибки поля расходится — production
  использует `--header-megapost-mona-lisa` (бледно-розовый), Figma задаёт
  `#d04e4e` ≈ `--accent-danger` (насыщенный красный). Взято PRODUCTION,
  не усреднено — см. `evidence/conflicts.md`;
* **Checkbox hover:** добавлен как явно помеченный FIGMA TARGET (не
  production) — раньше в `checkbox.md` стояла инструкция НЕ дорисовывать
  hover; пересмотрена по прямому запросу этого прохода;
* **Radio:** реальное имя класса (`.tm-radio__option`, используется в
  `votes-lever`), но стиль полностью реконструирован — собственное
  объявление `.tm-radio` не найдено ни в одном из 111 файлов;
* **Chip:** ни имя, ни стиль не подтверждены production — admin-only
  контекст (редактор статьи). Figma-библиотека показала ТРИ версии
  компонента (не варианты); реализована только самая новая, две старые
  зафиксированы как STALE, не реализованы;
* **Dropdown:** добавлено содержимое панели (`.dropdown-row`/`.menu-row`)
  — FIGMA-RECONSTRUCTED, два разных стиля строки (list vs menu), ни одного
  не было в `dropdown-B6xIm0Cp.css`;
* **Calendar:** нет production вообще (планировщик публикации, admin-only)
  — полностью реконструирован;
* **Avatar (Figma-only находка):** страница `image` показала шкалу
  из 7 размеров (20–60px) для `avatar/user`,`/company`,`/hub` — production
  подтверждает только 24px (`.tm-user-info__userpic`). Шкала показана как
  specimen в `showcase/components.html#avatar` на Correction pass (24px
  помечен PRODUCTION, остальные 6 — FIGMA-CONFIRMED, не production), но
  сознательно НЕ превращена в отдельный компонент/API — размер у Habr
  всегда инлайновый, не токенизированный модификатором;
* **select/datepicker/timepicker (textfileds):** та же геометрия, что
  Input, но не реализованы — нет production-свидетельства, ниже
  приоритет, DEFERRED;
* **icon-button `near-textfield=yes`:** Figma показывает 40×40 вариант
  кнопки-иконки рядом с текстовым полем — не проверено, соответствует ли
  чему-то реальному в Field/Input; UNCERTAIN.

**Добавлено на этапе Correction pass** (после Visual UI Kit Completeness
Review — полный отчёт с оценкой и score в conversation, не отдельным
файлом):

* **Найден и исправлен реальный баг самой витрины**, не продукта: у
  `showcase/components.html` не было `<meta name="viewport">` — мобильные
  браузеры/эмуляция рендерили страницу с layout viewport 980px независимо
  от реального экрана (классический эффект отсутствия viewport-тега), из-за
  чего 320/480 были нечитаемы без ручного зума. Добавлен тег + `@media
  (max-width:640px)` в `showcase/components.css` (схлопывает `.doc-nav` в
  компактный блок сверху, оборачивает длинные подписи в `.doc-grid-label`/
  `.doc-type-row`, переключает диаграммы Grid на локальный `overflow-x:auto`
  вместо `overflow:hidden`, который иначе просто прятал бы контент без
  возможности прокрутки). Проверено: 0 page-level horizontal overflow на
  320/480/768/1100/1440 (реальный тест — `window.scrollX` после попытки
  прокрутки колесом, не только сравнение `scrollWidth`/`clientWidth`, у
  которого оказался безобидный артефакт агрегации вложенных
  scroll-контейнеров);
* **Dark theme, не проверявшаяся компонент-за-компонентом до этого
  прохода, вскрыла реальный production-эффект**: disabled `.tm-input-
  text-decorated__input` красится в `--header-text` (чистый белый в ОБЕИХ
  темах) — в тёмном интерфейсе disabled-поле выглядит светлым пятном. Не
  исправлено (это честное production-поведение, не баг витрины) — стоит
  учитывать при будущем дизайн-ревью форм в тёмной теме.

**Добавлено на этапе Pattern Library:**

* **ArticleCard:** `.article-snippet.no-border` — назначение модификатора
  не прослежено до конца (сам `.article-snippet` рамки не имеет ни в каком
  виде в извлечённом CSS — неясно, что именно снимает модификатор);
* **Badges:** состояния disabled/получено-не-получено не подтверждены —
  одно наблюдение, только «award» вид;
* **Identity-карточка сущности:** три модуля (`hub-card`/`company-profile-
  card`/`user-card`) наблюдались с разными полями — не установлено, есть ли
  общий контракт полей или это независимые компоненты, которые лишь решают
  одну и ту же композиционную задачу.
