# Career System Audit — v0.3

Сопоставление четырёх источников: **Production × Storybook × Figma Library × Figma Modules**.

Дата исследования: 2 сентября 2026. Дополняет `../../03-habr-career.md` (v0.2 — Production/Web Research), не заменяет его.

---

## 1. Executive summary

### Главный вывод: существуют две реализации Career, и они на разных стеках

```text
career.habr.com                     develop.career.habratest.net
(текущий production)                (staging, career-web)
├── Rails + Webpacker               ├── Nuxt + Vue 3 + Tailwind
├── Vue 3 островами                 ├── SFC-компоненты, Storybook
├── 0 CSS-переменных                ├── 120 CSS custom properties
└── значения — литералы SCSS        └── семантический token-слой
```

Вывод v0.2 «Career: token maturity **INFERRED**, формальной системы нет» был **верен для production и неверен для продукта в целом**. Токен-слой существует — в Figma и в новой реализации. В нынешний production он просто не доехал.

### Что подтвердилось с максимальной силой

**Кнопочная система совпадает во всех трёх источниках по точным значениям.** Это самое сильное свидетельство во всём исследовании:

| Размер | Figma (переменные) | Storybook (computed) | Production (computed) |
|---|---|---|---|
| **M** | pad `4 / 8`, radius `8`, focus `12` | 32px, pad `4px 8px`, radius `8px` | 32px, pad `4px 7px`, radius `8px` |
| **L** | pad `8 / 12`, radius `12`, focus `16` | 40px, pad `8px 12px`, radius `12px` | 40px, pad `8px 12px`, radius `12px` |
| подпись | `margin_text_left_right: 4` | `.base-button__content { padding: 0 4px }` | `.button-comp__label { padding: 0 4px }` |
| шрифт | `text small (bold)` = Inter 14/20 · 600 | 14px/20px · 600 | 14px/20px · 600 |

Расхождение M-паддинга 8 против 7 объясняется границей `1px` в production, которая в Storybook снята.

### Что расходится и требует решения

Шесть конкретных расхождений, перечисленных в §7 и §13. Самое заметное — **активный сегмент табов**: в production он белый, в Storybook — фиолетовый с белым текстом.

### Что по-прежнему неизвестно

**Композиция страниц.** Ни Figma Library, ни Figma Modules, ни Storybook не отвечают на вопросы «сколько карточек в колонке», «как строится sidebar», «какая плотность экрана». Эти данные есть только в production и в продуктовых макетах, которых мы не видели. См. §11 и §14.

---

## 2. Source map

| # | Источник | Что это | Доступ | Полнота |
|---|---|---|---|---|
| 1 | `../../03-habr-career.md` | Production research v0.2 | полный | 11 страниц, 5 viewport |
| 2 | Storybook | `develop.career.habratest.net/career-web/storybook-static/` | полный | **427 stories / 100 компонентов** |
| 3 | Figma Library | `new-career-lib` (`e3XSMS635aYngCzY7VQaXY`) | **частичный** | 2 страницы из неизвестного количества |
| 4 | Figma Modules | `new-career-modules` (`tlV2zBiLdc2HPkIwR5haGE`) | **частичный** | 1 страница; компоненты видны только через поиск |

### Ограничение доступа к Figma

`get_metadata` без `nodeId` вернул для библиотеки **две** страницы (`button`, `icons, avatars, images`), для модулей — **одну** (`informators`). При этом поиск по published library находит в тех же файлах компоненты, которых на этих страницах нет: `controls / checkbox`, `controls / radiobutton`, `controls / switch`, `control-list`, `color-picker`, `tab / button-segment`, `tab / button-segment group`.

**Вывод:** MCP отдаёт не все страницы файла. Значительная часть библиотеки исследована только по индексу published library, без доступа к геометрии. Это главный пробел исследования — см. §14.

### Storybook: как найден

Прямой URL из задания отдаёт Nuxt-страницу-обёртку. Реальный Storybook лежит в iframe:

```
https://develop.career.habratest.net/career-web/storybook-static/index.html
индекс историй: .../index.json   (v5, 427 entries)
рендер истории: .../iframe.html?id=<storyId>&viewMode=story
```

Хост использует внутренний TLS-сертификат — требуется обход проверки.

### Экосистема библиотек Figma (найдено попутно)

Career-компоненты живут минимум в трёх поколениях библиотек одновременно:

| Библиотека | Последнее обновление | Статус |
|---|---|---|
| `new-career-lib` | 2026-08-20 | **актуальная** |
| `career-lib` | 2026-03-24 | предыдущее поколение |
| `👨‍🏭 01_Career` | 2024-11-13 | legacy |

Плюс соседние: `habr-lib`, `geektimes-lib`, `education-lib`, `02_Habr UI`, `🧶habr`, `Brand_profile`.

Примечательно: `habr-lib` и `geektimes-lib` имеют **более детальную систему элементных токенов**, чем Career — например `elements/checkbox/checked/bg`, `elements/checkbox/checked/bg_hover`, `elements/checkbox/checked/bg_disable`, `elements/checkbox/radius`, `elements/checkbox/padding_in`. У Career аналогичного покрытия для контролов формы не найдено.

---

## 3. Component inventory

### 3.1. Storybook — 100 компонентов, 427 stories

| Группа | Компонентов | Состав |
|---|---:|---|
| **Conversations** | 37 | Files (7), Messages (7), List (6), Templates (5), Header (4), Layout (3), Modals (3), Form (1), Messages/Messages (25 stories в одном) |
| **Common** | 20 | Buttons (9), Chips (2), ContextMenu (2), Navigation (2), Notifications (2), Form (1), Layout (1) |
| **Tests** | 13 | Cards (6), Modals (3), VisibilitySettings (2), прочее |
| **Form** | 10 | TextInput, BaseTextarea, BaseCheckbox, BaseRadioButton, BaseSwitch, BaseSelect, BaseCustomSelect, MultiSelect, ButtonRange, StarRating |
| **Banners** | 9 | InnerProjectBanner, TrackBanner, PromotionCard, NewNotice, JournalBlockSidebar, SidebarAdCompany, ResumesGuideCard, HrNewsletterSubscription, HHImportProfileStatusBanner |
| **Companies** | 3 | CP/VacancyImports (Card, GroupsModal), CompanyRatingStepsSidebar |
| **Icons** | 2 | SpriteIcon, SocialIcon |
| Прочее | 6 | Assets/Images, Consultations, Resumes, Salary, Skills, Vacancies |

**Наблюдение о балансе.** Storybook сильно смещён в сторону доменных компонентов: 37 из 100 — это раздел «Диалоги». Базовых примитивов — около 30. Это Storybook продуктовой команды, а не библиотека дизайн-системы.

### 3.2. Storybook — примитивы (Common + Form)

| Компонент | Файл | Stories |
|---|---|---|
| `BaseButton` | `common/base-button/base-button.vue` | Primary, Affixes |
| `BaseIconButton` | `common/base-icon-button/` | Default |
| `BaseAvatarButton` | `common/base-avatar-button/` | Default, Default Image |
| `BasePaginationButton` | `common/base-pagination-button/` | Default |
| `FilterButton` | `common/filter-button/` | Default, Dot Badge |
| `GhostButton` | `common/ghost-button/` | Default, With Icon |
| `AIButton` | `common/ai-button/` | Default |
| `LinkStyledButton` | `common/link-styled-button/` | Default |
| `RoundedArrowButton` | `buttons/rounded-arrow-button/` | Default |
| `SalaryHeadButton` | `buttons/salary-head-button/` | Default |
| `BaseChip` | `common/base-chip.vue` | Playground, Variants, Interactive/disabled, Closable |
| `ClosableChip` | `common/closable-chip.vue` | Default |
| `BaseInputLabel` | `common/base-input-label.vue` | **8 stories**: Default, Required, With Subtitle, With Errors, Size Small, Size Large, Disabled, Appearance Textarea |
| `BaseSegmentedTabs` | `common/base-segmented-tabs.vue` | Default, With Counters, Disabled, Long Row |
| `BasePagination` | `common/base-pagination/` | Default, Middle, Short Range |
| `BaseNotification` | `common/base-notification.vue` | Default, Attention, Closable Info, Alert |
| `BaseSection` | `common/base-section/` | Default |
| `ContextMenu` / `IsomorphicContextMenu` | `common/context-menu/` | 4 |
| `TextInput` | `form/text-input.vue` | Default, Filled, Disabled, Error |
| `BaseTextarea` | `form/base-textarea.vue` | Default, Filled, Disabled, Error |
| `BaseCheckbox` | `form/base-checkbox.vue` | Default |
| `BaseRadioButton` | `form/base-radio-button.vue` | Default |
| `BaseSwitch` | `form/base-switch.vue` | Default |
| `BaseSelect` | `common/base-select.vue` | Default, Disabled |
| `BaseCustomSelect` | `form/base-custom-select/` | 3 |
| `MultiSelect` | `form/multi-select/` | 3 |
| `StarRating` | `form/star-rating.vue` | 4 |
| `ButtonRange` | `form/button-range.vue` | 3 |
| `SpriteIcon` / `SocialIcon` | `icons/` | + «все возможные варианты» |

### 3.3. Figma Library — что реально доступно

**Страница `button`** — 25 component sets:

* `button / {S,M,L,XL} / …` — комбинации размера и внешнего вида;
* внешние виды: `main`, `main-border`, `danger`, `danger-border`, `success`, `success-border`, `passive`, `ghost`, `ai`, `filter`;
* специальные: `button / L / icon` (типы `base`, `colored-bg`), `button / L / avatar`, `button / L / pagination`;
* `badge` (варианты `text=yes` 20×20, `text=no` 12×12).

Статусы у всех: `inactive · hover · focus · disable · loading`. У icon/avatar/pagination добавлен `selected`. У `success-border` есть свойство `select=yes/no`, у `XL / main-border` — `icon=yes`.

**Страница `icons, avatars, images`:**

* ~140 иконок 24×24, неймспейсы: `icon/`, `icon/informers/`, `icon/education/`, `icon/vacancy/`, `icon/device/`, `icon/future/` (флаг «будущее» — вероятно, ещё не в продукте);
* три иконки имеют вариант `small=yes/no`: `arrow-down`, `arrow-right`, `close`;
* **аватары: 6 типов × 10 размеров** — `avatar/user`, `avatar/company`, `avatar/university`, `avatar/education`, `avatar/image`, `avatar/anonymous`. Размеры: 140 · 96 · 72 · 56 · 48 · 40 · 36 · 32 · 24 · 20;
* `avatar/anonymous` дополнительно имеет **свойство score**: `–`, `1.00–2.99`, `3.00–3.99`, `4.00–5.00` — 40 вариантов;
* `no_content / 01…25` — 25 иллюстраций пустых состояний 96×96;
* `achievements / …` — 32 достижения 100×100;
* `medal / …` — 13 медалей 100×100;
* `status_page_illustration / …` — 404, 500, 502, tech_work_01…04 (480×170–180);
* `modal img / …` — star, heart, check, wait, danger, warning, custom (96×96);
* `voting-emoji` (7 эмоций × 3 состояния), `voting-stars`, `voting`;
* `loader` (x1 56, x2 112, x3 168);
* `icon+text` (варианты `small`, `old`);
* бейджи «Бустер», «РР топ-10» (`size=small/big`);
* `image-skills`, `image-booster`, `image-reputation` — **с вариантами `device=desktop/tablet/mobile`**;
* иконки редактора Хабра (14) и emoji-набор (8).

**Найдено только через индекс published library, без доступа к геометрии:**
`controls / checkbox`, `controls / radiobutton`, `controls / switch`, `control-list`, `color-picker`, `tab / button-segment`, `tab / button-segment group`.

### 3.4. Figma Modules — что найдено

Через индекс published library `new-career-modules`:

| Модуль | Тип | Обновлён |
|---|---|---|
| `Вакансия` | component_set | **2026-09-01** |
| `Вакансия / Быстрый отклик` | component_set | 2026-09-01 |
| `Карточка вакансии` | component_set | 2026-08-21 |
| `карточка специалиста / Обычная` | component_set | 2026-09-01 |
| `карточка специалиста / Отклик` | component_set | 2026-09-01 |
| `карточка специалиста / Отклик (на бесплатной вакансии)` | component_set | 2026-09-01 |
| `карточка специалиста / Отклик без регистрации` | component_set | 2026-08-21 |
| `карточка специалиста / Юзер Хабра` | component_set | 2026-08-21 |
| `карточка специалиста / Юзер QnA` | component_set | 2026-08-21 |
| `карточка эксперта` | component_set | 2026-08-20 |
| `Рейтинг компании в списках` | component_set | 2026-08-20 |
| `salary` | component_set | 2026-08-20 |
| `vacansy / dop` | component_set | 2026-08-20 |
| `hiding` | component | 2026-08-20 |
| `onboarding-tooltip` (страница `informators`) | инстансы | — |

Библиотека **активно поддерживается**: правки от 20–21 августа и 1 сентября 2026.

---

## 4. Figma Library findings

### 4.1. Button — полная система

Единственный компонент, восстановленный с полной точностью.

**Матрица:** `размер (4) × внешний вид (10) × статус (5)`, плюс три специальных типа.

**Размерная шкала (из переменных `elements/button/*`):**

| Size | padding v / h | radius | focus radius | gap | margin текста | text style | Высота (замер) |
|---|---|---:|---:|---:|---:|---|---:|
| **S** | `0 / 4` | 8 | 12 | — | 4 | `badge` — Inter 11/16 · 600 | 24 |
| **M** | `4 / 8` | 8 | 12 | 0 | 4 | `text small (bold)` — Inter 14/20 · 600 | 32 |
| **L** | `8 / 12` | 12 | 16 | 4 | 4 | `text small (bold)` — Inter 14/20 · 600 | 40 |
| **XL** | `12 / 16` | 12 | 16 | 4 | 4 | `text bold` — Inter 16/24 · 600 | 48 |

Есть также общий `elements/button/border_radius: 8`.

**Наблюдение о фокусе.** У каждого размера **два радиуса**: обычный и `focus_border-radius`, который на 4px больше (8→12, 12→16). Фокус-кольцо рисуется снаружи и имеет собственную геометрию. Это осознанное решение системы, а не побочный эффект.

**Специальные типы:**

```
button / L / icon        40×40, padding_all: 8, border_radius: 200 (круг)
                         типы: base | colored-bg
                         статусы: inactive hover focus selected disable loading
button / L / avatar      40×40, статусы те же
button / L / pagination  40×40, статусы те же
button / L / filter      148×40, использует токены L, + badge
badge                    text=yes 20×20 · text=no 12×12
                         border_radius: 200, padding_left_right: 4
```

**Цветовые токены, встреченные в кнопках:**
`color/ui/primary #8164f7` · `color/ui/white #ffffff` · `color/ui/gray-1 #1b272c` · `gray-2 #55798b` · `gray-3 #7996a5` · `gray-4 #a6bdc9` · `gray-5 #d4dee2` · `gray-6 #eaf2f5` · `color/ui/gray-shadow #182e391a` · `color/fill-new/inactive #8062f8`

### 4.2. Avatar — самая проработанная часть библиотеки

Шесть типов × десять размеров. Размерная шкала **не кратна 4 целиком**: 20 · 24 · 32 · 36 · 40 · 48 · 56 · 72 · 96 · 140.

`avatar/anonymous` уникален: его вид зависит от **рейтинга пользователя** (`score`), четыре диапазона. Это доменная логика, зашитая в примитив — редкий и характерный для Career приём.

> **Расхождение с нормативным правилом аватаров.** В `../../03-habr-career.md` §11 зафиксировано правило «человек — круг, компания — квадрат». Библиотека Figma этого разделения **не кодирует**: `avatar/user` и `avatar/company` различаются типом, но форма задаётся внутри компонента и по метаданным не читается. Требует визуальной проверки — см. §14.

### 4.3. Иконки

* Базовый размер **24×24** — единый для всей библиотеки (подтверждает production).
* Неймспейс `icon/future/*` (~20 иконок) — вероятно, зарезервированные под будущие функции. Отдельный сигнал: библиотека планирует вперёд.
* Три иконки имеют вариант `small` — то есть 16px-версия существует не как отдельный набор, а как свойство компонента.

### 4.4. Иллюстративный слой — неожиданно большой

25 иллюстраций пустых состояний, 32 достижения, 13 медалей, 7 иллюстраций статус-страниц, 7 модальных картинок, эмодзи-голосование.

Это прямо отвечает на открытый вопрос из `../../03-habr-career.md` §20 («существует ли иллюстративный язык?»): **да, существует и он обширный**. В production он почти не виден, потому что живёт на служебных экранах (404, пустые состояния, достижения профиля).

`image-skills` / `image-booster` / `image-reputation` имеют варианты `device=desktop/tablet/mobile` — **единственное место в библиотеке, где зафиксировано респонсивное поведение**.

---

## 5. Figma Modules findings

### 5.1. Что удалось установить

Библиотека модулей построена вокруг **доменных сущностей Career**, а не абстрактных блоков:

```
Вакансия  ·  Карточка вакансии  ·  Вакансия / Быстрый отклик  ·  vacansy / dop
карточка специалиста / {Обычная · Отклик · Отклик без регистрации ·
                        Отклик (на бесплатной вакансии) · Юзер Хабра · Юзер QnA}
карточка эксперта  ·  Рейтинг компании в списках  ·  salary  ·  hiding
onboarding-tooltip
```

**Паттерн именования:** `<Сущность> / <Контекст использования>`. Вариативность задаётся не визуальными свойствами, а **сценарием**: «карточка специалиста» существует в шести версиях под разные экраны и права доступа.

Это важное наблюдение о методе команды: модуль = сущность + контекст, а не сущность + стиль.

### 5.2. Единственный модуль, разобранный полностью

`onboarding-tooltip` (страница `informators`), 280×124:

```
elements/informators/tost/padding_left_right : 16
elements/informators/tost/padding_top_bottom : 12
elements/informators/tost/border_radius      : 12
elements/informators/tost/gap                : 4
elements/informators/informer/spacing_link           : 12
elements/informators/informer/margin_links_top_bottom: 4
elements/informators/informer/onboarding-hotspot/border_radius       : 12
elements/informators/informer/onboarding-hotspot/margin_buttons_top_bottom: 4
```

Использует `button / M` (padding 4/8, radius 8), `color/ui/primary`, `color/ui/gray-1`, `color/ui/gray-4`, `color/ui/white`, `color/ui/gray-shadow`, текстовые стили `text (bold)` 16/20·600, `text small` 14/20·400, `text small (bold)` 14/20·600.

**Ключевое:** файл модулей использует **ту же коллекцию переменных** `new-career-ui`, что и библиотека. Модули и примитивы разделяют один token-слой.

### 5.3. PRIMITIVE → COMPONENT → MODULE

Восстановленная зависимость — по одному полностью разобранному модулю и по составу библиотек:

```
FOUNDATIONS       color/ui/*   font/*   size/spacing/*   size/radius/*
                          │
PRIMITIVES        button/{S,M,L,XL}/*   badge   icon (24)   avatar (6×10)
                  controls/{checkbox,radiobutton,switch}   [геометрия недоступна]
                          │
COMPONENTS        button/L/{icon,avatar,pagination,filter}
                  tab/button-segment → tab/button-segment group
                  control-list   color-picker   icon+text   loader   voting
                          │
MODULES           onboarding-tooltip = tost(padding 12/16, r12) + button/M + текст
                  карточка специалиста / *   ·   Вакансия / *   ·   salary
                  карточка эксперта  ·  Рейтинг компании в списках
                          │
PAGE PATTERNS     ── отсутствует в обоих файлах ──
```

**Уровень PAGE PATTERNS в исследованных Figma-файлах не представлен.** Это ожидаемо: библиотека и модули не обязаны его содержать. Но это значит, что композицию страницы по ним восстановить нельзя.

---

## 6. Storybook findings

### 6.1. Стек новой реализации

| Слой | Технология | Свидетельство |
|---|---|---|
| Framework | **Nuxt + Vue 3** | `__NUXT__`, `data-capo`, `nuxt-app` в HTML |
| Компоненты | Vue 3 SFC | `.vue` в `componentPath` каждой story |
| Стили | **Tailwind CSS** | preflight `--tw-*`; утилиты `flex flex-wrap gap-3`, `max-w-[560px]`, `rounded-xl` |
| Брейкпоинты | кастомные `tablet:` / `phone:` | `tablet:ml-0`, `phone:*` в разметке карточек |
| Сборка | Vite | `assets.habr.com/staging-career-web/career-web/BNVPxz1w.js` |
| Storybook | v5-индекс, static build | `index.json` `{"v":5}` |

**Это тот же стек, что у Хабр Курсов** (Nuxt + Vue 3 SFC + Tailwind). Career переезжает на архитектуру Курсов.

### 6.2. Token-слой реализации — 120 CSS-переменных

Полный список — в §9. Структура:

```
--color-ui-*            базовая палитра (gray-1..7, primary, blue, green,
                        orange, red, turquoise, purple, pink, white, black)
--color-ui-*-NN         альфа-производные через color-mix()
--color-font-*          семантические алиасы текста
--color-icon-*          семантические алиасы иконок
--color-chip-*          состояния чипов
--color-graph-*         цвета графиков
--color-illustration-*  цвета иллюстраций
--color-rank-*          ранги
--color-booster-*       градиенты промо
--shadow-border-color*  цвета границ по состояниям
--header-height         112px
--shadow-dropdown       0 1px 20px 0 rgba(0,0,0,.2)
--fit-screen-height     calc(100dvh - var(--header-height) - 24px)
```

**Приём, которого нет в production:** альфа-варианты строятся через `color-mix(in srgb, var(--base) NN%, transparent)`, а не хардкодятся. Это делает палитру производной от одного набора базовых цветов.

### 6.3. Замеренные спецификации

**BaseButton** — анатомия:

```
button.base-button.appearance-{main|main-border|none|avatar}.size-{l|m}
└ span.base-button__inner
  ├ span.base-button__before   (24×24, слот иконки)
  ├ span.base-button__content  (padding: 0 4px)
  └ span.base-button__after    (слот, часто badge 20×20)
```

| Компонент | Размер | padding | radius | bg | color | шрифт |
|---|---:|---|---:|---|---|---|
| BaseButton `main` `size-l` | 40 | `8px 12px` | 12 | `#8164f7` | `#fff` | 14/20 · 600 |
| BaseButton `main-border` `size-l` | 40 | `8px 12px` | 12 | transparent | `#8164f7` | 14/20 · 600 |
| AIButton (`size-m`) | 32 | `4px 8px` | 8 | `#8164f7` | `#fff` | 14/20 · 600 |
| GhostButton (`size-m`) | 32 | `4px 8px` | 8 | transparent | `#55798b` | 14/20 · 600 |
| BaseIconButton | 40×40 | `8px` | **9999** | transparent | `#55798b` | — |
| BasePaginationButton | 40×40 | `8px` | **9999** | transparent | `#1b272c` | 16/24 · 600 |
| BaseAvatarButton | 40×40 | `0` | **9999** | transparent | — | — |
| FilterButton | 40 | `8px 12px` | 12 | `#fff` | `#1b272c` | 14/20 · 600 |
| LinkStyledButton | auto | `0` | 0 | none | `#0464d2` | 14/20 · **400** |
| Badge внутри кнопки | 20, min-w 20 | `0 4px` | **9999** | `#8164f7` | `#fff` | **11/16 · 600** |

**BaseChip:**
```
h32 · padding 4px · radius 8px · шрифт 14/20 · 400 · контент px-1 (0 4px)
варианты: default  bg #a6bdc9 @ 20%
          approved bg #3dc24a @ 10%
          ghost    bg transparent
closable: + кнопка 22×22, radius 9999, иконка 11px, цвет #55798b
```

**BaseSegmentedTabs:**
```
контейнер  h40 · padding 4 · radius 9999 · трек bg #7996a5 @ 10%
сегмент    h32 · padding 4px 8px · radius 9999 · шрифт 14/20 · 600
активный   заливка #8164f7, текст #ffffff
счётчик    20×20 · padding 2px 4px · radius 9999 · bg #8164f7 · 11/16 · 600
           + кольцо 2px #fff вокруг счётчика
обёртка    nav.overflow-x-auto  ← горизонтальный скролл встроен
```

**BaseNotification:**
```
padding 12px 16px · radius 12 · border 1px semantic · bg semantic @ 10%
иконка 24 · content padding 0 4px
заголовок  16/24 · 600
описание   14/20 · 400
варианты: info (#1ba1ee) · alert (#f8651b) · attention · success
```

**BaseSelect:**
```
h40 · padding 8px 44px 8px 16px · radius 12 · border 1px #d4dee2 · bg #fff · 16/24
```

**BaseInputLabel:**
```
title 16/24 · 600 · #1b272c
ошибка 14/20 · 400 · var(--color-ui-red) = #f8651b
свойства: required · subtitle · errors · size (small|large) · disabled · appearance=textarea
```

**BaseSection:**
```
padding 16 · radius 24 · bg #fff · border 1px rgba(24,46,57,.1)
заголовок h1.base-section__title--size-s : 20/24 · 600
```

**BasePagination:**
```
nav: padding 8 · radius 24 · border 1px rgba(24,46,57,.1) · bg #fff
кнопки 40×40 pill · номера страниц h40 min-w-40 · 16/24 · 600
```

**VacancyCardWithCompanyAndDate** (story «Full»):
```
обёртка  max-w-[560px] · padding 8 · radius 12 · bg #fff
внутри   padding 24 24 16 24 · radius 12 · bg #1ba1ee @ 10%   ← промо-состояние
логотип  48×48 · radius 8
gap      16 между блоками, 4 внутри группы
мета     14/20
```

---

## 7. Figma ↔ Storybook mapping

| Figma | Storybook | Статус | Комментарий |
|---|---|---|---|
| `button / L / main` | `BaseButton` `appearance-main size-l` | **EXACT** | padding 8/12, radius 12, 14/20·600 — совпадает полностью |
| `button / M / main` | `BaseButton size-m` (через AIButton/GhostButton) | **EXACT** | padding 4/8, radius 8 |
| `button / L / main-border` | `BaseButton appearance-main-border` | **EXACT** | |
| `button / M / ghost` | `GhostButton` | **CLOSE** | геометрия совпадает; в Storybook цвет `#55798b` (gray-2), в Figma `ghost` использует те же токены |
| `button / M / ai`, `L / ai` | `AIButton` | **CLOSE** | геометрия M совпадает; градиент `--color-ai-gradient` есть только в реализации |
| `button / L / icon` | `BaseIconButton` | **EXACT** | 40×40, padding 8, radius 200 ↔ 9999 |
| `button / L / avatar` | `BaseAvatarButton` | **EXACT** | 40×40, radius 200 ↔ 9999 |
| `button / L / pagination` | `BasePaginationButton` | **EXACT** | 40×40, padding 8, radius pill |
| `button / L / filter` | `FilterButton` | **EXACT** | 148×40 ↔ h40 padding 8/12 radius 12 + badge |
| `badge` | badge внутри кнопок / `filter-button__badge` | **EXACT** | radius 200↔9999, padding 0 4, 11/16·600 |
| `button / S / *`, `button / XL / *` | — | **FIGMA ONLY** | В Storybook размеры S и XL не представлены отдельными stories |
| `button / {M,L} / {danger, danger-border, success, success-border, passive}` | — | **FIGMA ONLY** | Пяти внешних видов в Storybook нет |
| `tab / button-segment`, `tab / button-segment group` | `BaseSegmentedTabs` | **DIVERGED** | см. ниже |
| `controls / checkbox` | `BaseCheckbox` | **UNKNOWN** | геометрия Figma недоступна |
| `controls / radiobutton` | `BaseRadioButton` | **UNKNOWN** | то же |
| `controls / switch` | `BaseSwitch` | **UNKNOWN** | то же |
| `control-list` | — | **UNKNOWN** | |
| `color-picker` | — | **FIGMA ONLY** (вероятно) | |
| `avatar/*` (6 типов × 10 размеров) | `BaseAvatarButton` (только 40) | **DIVERGED по покрытию** | Figma описывает 60 вариантов, Storybook — один размер в контексте кнопки |
| `icon/*` (~140) | `SpriteIcon` | **CLOSE** | Реализация — спрайт; сопоставление имён не проверено |
| `no_content/*`, `achievements/*`, `medal/*`, `status_page_illustration/*` | — | **FIGMA ONLY** | Иллюстративный слой в Storybook не представлен |
| `loader` (x1/x2/x3) | — | **FIGMA ONLY** | |
| `voting-emoji`, `voting-stars` | `StarRating` (частично) | **UNKNOWN** | |
| `onboarding-tooltip` (modules) | — | **FIGMA ONLY** | |
| `Карточка вакансии`, `Вакансия` (modules) | `VacancyCardWithCompanyAndDate` | **DIVERGED** | см. ниже |
| `карточка специалиста / *` (6 вариантов) | `ResumeCard` (3 stories) | **UNKNOWN** | геометрия Figma недоступна, story падает |
| — | `TextInput`, `BaseTextarea`, `BaseCustomSelect`, `MultiSelect`, `ButtonRange`, `BaseInputLabel`, `BaseNotification`, `BaseSection`, `BasePagination`, `ContextMenu` | **STORYBOOK ONLY** | В доступных страницах Figma не найдены |
| — | Conversations (37), Tests (13), Banners (9), Companies (3), Consultations, Salary, Skills | **STORYBOOK ONLY** | Доменные компоненты |

### Разобранные расхождения

#### DIVERGED — Segmented Tabs

```
Figma:
  Компоненты tab / button-segment и tab / button-segment group существуют
  в published library; геометрия недоступна.

Storybook:
  контейнер h40, padding 4, radius 9999, трек #7996a5 @10%
  сегмент h32, padding 4/8, radius 9999
  АКТИВНЫЙ: заливка #8164f7 (primary), текст #ffffff

Production:
  контейнер h42, padding 4, radius 200px, трек rgba(121,150,165,.1)
  сегмент h34
  АКТИВНЫЙ: БЕЛАЯ заливка

Likely explanation:
  Смена визуального решения активного сегмента при переходе на новую
  реализацию. Белая «таблетка» на сером треке — распространённый паттерн
  2020–2023; фиолетовая заливка — более выраженное состояние.
  Разница высот 42→40 и 34→32 согласована и выглядит как выравнивание
  под общую сетку кнопок (L=40 / M=32).

Confidence: ВЫСОКАЯ по факту расхождения, НИЗКАЯ по причине.
```

#### DIVERGED — Chip

```
Figma:      геометрия недоступна
Storybook:  .base-chip  — h32, padding 4, radius 8, bg #a6bdc9 @20%, 14/20·400
Production: .basic-chip — h28, padding 4, radius 8, bg rgba(166,189,201,.2), 14/20

Likely explanation:
  Цвет и радиус идентичны (rgba(166,189,201,.2) == #a6bdc9 @20%).
  Отличаются только высота (28→32) и имя класса (basic- → base-).
  Похоже на выравнивание высоты чипа под 32 (= размер M кнопки)
  при переименовании префикса компонентов.

Confidence: ВЫСОКАЯ.
```

#### DIVERGED — Vacancy card

```
Figma:      Карточка вакансии / Вакансия — component_sets, геометрия недоступна
Storybook:  обёртка padding 8, radius 12, bg #fff
            внутренний блок padding 24/24/16/24, radius 12, bg #1ba1ee @10%
            логотип 48 radius 8
Production: .basic-section--appearance-vacancy-card
            padding 24, radius 24, фон прозрачный, без border и shadow
            логотип 48 radius 8

Likely explanation:
  Story «Full» показывает, вероятно, ПРОДВИГАЕМУЮ вакансию — голубая
  подложка и двойная обёртка характерны для промо-состояния.
  Тогда radius 12 относится к промо-обёртке, а не к базовой карточке.
  Проверить можно на story «Minimal» — она сохранена в референсах.

Confidence: СРЕДНЯЯ. Требует сравнения Minimal ↔ production.
```

#### CONFLICT — Danger colour

```
Figma:      красный в сэмплированных узлах не встретился
Storybook:  --color-ui-red: #f8651b  (оранжево-красный)
            текст ошибки BaseInputLabel использует именно его
Production: #e21212 замерен на границе (2 вхождения на 2 страницы)

Likely explanation:
  Либо смена токена, либо #e21212 в production — локальное значение
  стороннего виджета, а не системный danger.

Confidence: НИЗКАЯ. Нужен явный ответ дизайн-системы.
```

#### CONFLICT — Focus ring

```
Figma:      есть elements/button/*/focus_border-radius (12 и 16),
            но цвет фокуса в сэмплированных переменных отсутствует
Storybook:  не проверено (нужен интерактивный фокус)
Production: box-shadow 0 0 0 2px inset #fdb814 — жёлтое кольцо

Likely explanation:
  Жёлтый фокус может быть решением доступности, не отражённым
  в цветовых токенах, либо legacy-значением.

Confidence: НИЗКАЯ.
```

#### CLOSE — Button border

```
Figma:      border-как-токен не найден; у border-вариантов обводка есть по смыслу
Storybook:  border: 0px none  (у main), у main-border — визуальная обводка
Production: border: 1px solid <цвет заливки>  даже у primary

Likely explanation:
  В production 1px-граница того же цвета, что фон, нужна была,
  чтобы outline- и filled-варианты совпадали по высоте.
  В новой реализации от приёма отказались — высота задаётся напрямую.
  Это объясняет расхождение padding M: 8 (Figma/Storybook) против 7 (production).

Confidence: ВЫСОКАЯ.
```

---

## 8. Production ↔ Design System comparison

Перепроверка ключевых выводов `../../03-habr-career.md`.

| # | Вывод production (v0.2) | Figma | Storybook | Итоговый статус |
|---|---|---|---|---|
| 1 | Карточка `padding 24; radius 24`, без border и shadow | нет доступа | `BaseSection` radius 24, **padding 16**, border 1px | ~~CONFLICT~~ → **ЗАКРЫТО в v0.4.** Замер production новой реализации (`/salaries`) даёт padding **24** и границу **1px rgba(24,46,57,.1)**. Значение 16 относилось к обёртке story. Вывод v0.2 «без border» был ошибкой замера — граница есть. См. §19.6 `C-1` |
| 2 | Контейнер 1100 + padding 12; main 776 + sidebar 300 | нет | нет | **UNVERIFIED** — композиции нет ни в одном источнике |
| 3 | Фиолетовый `#8164f7` = действие, синий `#0464d2` = ссылка | `color/ui/primary #8164f7` | `--color-ui-primary #8164f7`, `--color-font-link → --color-ui-blue-accent #0464d2`, LinkStyledButton = `#0464d2` | **DESIGN SYSTEM SOURCE** ✅ подтверждено на всех трёх |
| 4 | Холодная сине-серая шкала `#1b272c → #55798b → #7996a5 → #d4dee2` | `color/ui/gray-1..5` — те же значения | `--color-ui-gray-1..7` — те же + `#eaf2f5`, `#f8fbfc` | **DESIGN SYSTEM SOURCE** ✅ шкала оказалась на **7 ступеней**, а не 4 |
| 5 | Радиусы по ролям 24/12/8/200/50% | `size/radius/{no,s,m,l,xl,full}`, `full=200`, `no=0`; `elements/button/*/border-radius` 8 и 12 | 12, 8, 24, 9999 | **DESIGN SYSTEM SOURCE** — шкала существует; конкретные значения s/m/l/xl не разрешены |
| 6 | Кнопки L=40/r12, M=32/r8, метка 14/20·600 | точные токены | точный рендер | **DESIGN SYSTEM SOURCE + IMPLEMENTATION SOURCE** ✅ **сильнейшее подтверждение** |
| 7 | Инпут 40/r12, border 1px `#d4dee2`, fs 16 | `color/ui/gray-5 #d4dee2` | `BaseSelect` h40, r12, 1px `#d4dee2`, 16/24 | **CONFIRMED** ✅ |
| 8 | Тинт `rgba(166,189,201,.2)` как основная поверхность | `color/ui/gray-4 #a6bdc9` | `--color-ui-gray-4-20` через `color-mix` | **DESIGN SYSTEM SOURCE** — тинт оказался производным от gray-4, а не самостоятельным цветом |
| 9 | H1 28/32·600, H2 20/24·600, `letter-spacing: normal` | текстовые стили покрывают 11/16, 14/20, 16/20, 16/24 — **заголовков нет** | `base-section__title--size-s` 20/24·600 | **ЧАСТИЧНО CONFIRMED** — 20/24·600 подтверждён; 28/32 не найден ни в Figma, ни в Storybook |
| 10 | Отступы 4 / 8 / 12 / 24 | `size/spacing/x0,x1,x1_5,x2,x3,x4,x5,x6,x8,x10`; x1=4, x1,5=6 | Tailwind-утилиты gap-1/3/4 | **DESIGN SYSTEM SOURCE** — шкала шире: базовый шаг 4, есть полушаг 6 |
| 11 | Header static, 112px = 48 + 64 | нет | **`--header-height: 112px`** — токен | **IMPLEMENTATION SOURCE** ✅ высота подтверждена токеном; `static` — не проверено |
| 12 | Фокус — жёлтое кольцо `0 0 0 2px inset #fdb814` | radius-токены фокуса есть, цвета нет | не проверено | **UNVERIFIED / CONFLICT** |
| 13 | Теней нет (кроме dropdown) | нет данных | `--shadow-dropdown: 0 1px 20px 0 rgba(0,0,0,.2)` — **единственная тень в токенах** | **CONFIRMED** ✅ отсутствие теней подтверждено на уровне токенов |
| 14 | На ≤1023 sidebar убирается; ≤767 header 144 | нет | классы `tablet:` / `phone:` есть, но композиции нет | **UNVERIFIED** |
| 15 | Чипы прямоугольные r8 | нет доступа | `BaseChip` r8 ✅, но h32 вместо 28 | **CONFIRMED по радиусу, CONFLICT по высоте** |
| 16 | Логотип компании 48 r8, аватар человека круг | `avatar/*` 6 типов × 10 размеров | логотип 48 r8 в VacancyCard ✅ | **CONFIRMED по логотипу**; форма аватара — **UNVERIFIED** |
| 17 | Career — Rails + Webpacker, токенов нет | — | **Nuxt + Vue 3 + Tailwind, 120 переменных** | **LEGACY** — production отражает уходящее поколение |

### Главная переоценка

> **`../../03-habr-career.md` §18.2 «Token maturity: INFERRED» относится только к текущему production.**
> Для продукта в целом статус — **NATIVE (Figma) + NATIVE (новая реализация) + INFERRED (текущий production)**.

---

## 9. Token analysis

### 9.1. EXPLICIT TOKEN — Figma, коллекция `new-career-ui`

**Цвет**

| Токен | Значение |
|---|---|
| `color/ui/white` | `#ffffff` |
| `color/ui/gray-1` | `#1b272c` |
| `color/ui/gray-2` | `#55798b` |
| `color/ui/gray-3` | `#7996a5` |
| `color/ui/gray-4` | `#a6bdc9` |
| `color/ui/gray-5` | `#d4dee2` |
| `color/ui/gray-6` | `#eaf2f5` |
| `color/ui/gray-shadow` | `#182e391a` |
| `color/ui/primary` | `#8164f7` |
| `color/fill-new/inactive` | `#8062f8` |
| `color/graph/violet-light` | `#e5b2ff` |

**Типографика**

| Токен | Значение |
|---|---|
| `font/font-family/Inter` | Inter |
| `font/size/body-xs` | 11 |
| `font/size/body-m` | 14 |
| `font/size/body-l` | 16 |
| `font/line-height/body-m` | 16 |
| `font/line-height/body-l` | 20 |
| `font/line-height/display-m` | 24 |
| `font/weight/regular` | 400 |
| `font/weight/semibold` | 600 |
| `font/letter-spacing/0` | 0 |
| `font/paragraph-spacing/0` · `/s` · `/l` | 0 · 8 · 12 |

**Текстовые стили (Figma styles)**

| Стиль | Состав |
|---|---|
| `badge` | Inter SemiBold 11/16, ls 0 |
| `text small` | Inter Regular 14/20 |
| `text small (bold)` | Inter SemiBold 14/20 |
| `text (bold)` | Inter SemiBold 16/20 |
| `text bold` | Inter SemiBold 16/24 |

**Размеры**

| Токен | Значение | Scope |
|---|---|---|
| `size/spacing/x0` | 0 | GAP |
| `size/spacing/x1` | 4 | GAP |
| `size/spacing/x1,5` | 6 | GAP |
| `size/spacing/x2 … x10` | не разрешены | GAP |
| `size/radius/no` | 0 | CORNER_RADIUS |
| `size/radius/full` | 200 | CORNER_RADIUS |
| `size/radius/s · m · l · xl` | не разрешены | CORNER_RADIUS |

**Элементные токены**

```
elements/button/border_radius                8
elements/button/S/{padding_top_bottom 0, padding_left_right 4,
                   border_radius 8, focus_border_radius 12, margin_text_left_right 4}
elements/button/M/{padding_top_bottom 4, padding_left_right 8, gap 0,
                   border-radius 8, focus_border-radius 12, margin_text_left_right 4}
elements/button/L/{padding_top_bottom 8, padding_left_right 12, gap 4,
                   border-radius 12, focus_border-radius 16, margin_text_left_right 4}
elements/button/XL/{padding_top_bottom 12, padding_left_right 16, gap 4,
                    border_radius 12, focus_border_radius 16, margin_text_left_right 4}
elements/button/icon-button/{padding_all 8, gap 0,
                             border_radius 200, focus_border_radius 200}
elements/badge/{border_radius 200, padding_left_right 4, spacing_0 0}
elements/informators/tost/{padding_left_right 16, padding_top_bottom 12,
                          border_radius 12, gap 4}
elements/informators/informer/{spacing_link 12, margin_links_top_bottom 4}
elements/informators/informer/onboarding-hotspot/{border_radius 12,
                                                  margin_buttons_top_bottom 4}
```

### 9.2. EXPLICIT TOKEN — реализация (career-web), 120 CSS-переменных

**Базовая палитра**

```css
--color-ui-white: #fff;          --color-ui-black: #000;
--color-ui-gray-1: #1b272c;      --color-ui-gray-2: #55798b;
--color-ui-gray-3: #7996a5;      --color-ui-gray-4: #a6bdc9;
--color-ui-gray-5: #d4dee2;      --color-ui-gray-6: #eaf2f5;
--color-ui-gray-7: #f8fbfc;      --color-ui-gray: #ccc;
--color-ui-gray-bg: #ededed;     --color-ui-gray-light: #f7f7f7;
--color-ui-gray-dark: #303b44;   --color-ui-asphalt: #1f2225;
--color-ui-gray-shadow: rgba(24,46,57,.1);
--color-ui-gray-overlay: rgba(213,222,226,.8);
--color-ui-checkbox: #666;       --color-ui-chevron: #5a7887;

--color-ui-primary: #8164f7;     --color-ui-primary-accent: #5014f5;
--color-ui-primary-light: #9787fd;
--color-ui-blue: #1ba1ee;        --color-ui-blue-accent: #0464d2;
--color-ui-blue-light: #80d5fa;  --color-ui-blue-overlay: #ebefff;
--color-ui-green: #3dc24a;       --color-ui-green-accent: #00ad3a;
--color-ui-green-dark: #0c8326;  --color-ui-green-light: #70d781;
--color-ui-green-overlay: #ecf8ef;
--color-ui-orange: #fdad0d;      --color-ui-orange-accent: #fd8f0d;
--color-ui-red: #f8651b;         --color-ui-red-light: #fc9069;
--color-ui-turquoise: #0db3d3;   --color-ui-purple: #b574e7;
--color-ui-pink: #da6cc4;        --color-ui-yellow-light: #fdf0bb;
--color-pale-canary: #ff9;       --color-rank-bronze: #d1a584;
```

**Семантические алиасы**

```css
--color-font-black: var(--color-ui-gray-1);
--color-font-gray:  var(--color-ui-gray-2);
--color-font-link:  var(--color-ui-blue-accent);
--color-text-main:  var(--color-font-black);
--color-links-main: var(--color-font-link);
--color-icon-gray:  var(--color-ui-gray-2);
--color-gray-background: var(--color-ui-gray-bg);
--shadow-border-color:          var(--color-ui-gray-5);
--shadow-border-color-hover:    var(--color-ui-gray-4);
--shadow-border-color-focus:    var(--color-ui-gray-4);
--shadow-border-color-disabled: var(--color-ui-gray-shadow);
```

**Альфа-производные через `color-mix()`** — 30+ переменных вида
`--color-ui-primary-10/20/60`, `--color-ui-gray-3-10/20`, `--color-ui-gray-4-20/30`,
`--color-ui-green-10/12/20/60`, `--color-ui-blue-08/10/30/60`, `--color-ui-white-10/24/60/70/80`.

**Прочее**

```css
--header-height: 112px;
--fit-screen-height: calc(100dvh - var(--header-height) - 24px);
--shadow-dropdown: 0 1px 20px 0 rgba(0,0,0,.2);
--color-chip-inactive: #ebf3ff;   --color-chip-press: #b8d5ff;
--color-chip-hover: var(--color-ui-gray-4);
--color-ai-gradient / --color-booster-gradient / --color-booster-badge /
--color-booster-banner-bg   — градиенты промо и AI
--color-graph-cyan/violet/violet-light  — цвета графиков
--color-illustration-gray/green/orange/red, --color-illustrations-purple-light
```

### 9.3. Пересечение с Хабр Курсами

Идентичны в обоих продуктах:

```css
--color-chip-inactive: #ebf3ff
--color-chip-press:    #b8d5ff
--shadow-dropdown:     0 1px 20px 0 rgba(0,0,0,.2)
```

Это либо общий предок кодовой базы, либо копирование при старте `career-web`. Полезный сигнал для будущей унификации — но **выводов о единой дизайн-системе из трёх совпадений делать нельзя**.

### 9.4. REPEATED VALUE — систематично, но токена не найдено

| Значение | Где повторяется | Комментарий |
|---|---|---|
| `24` как радиус карточки/секции | production `.basic-section`, Storybook `BaseSection`, `BasePagination` | вероятно `size/radius/xl`, но значение не разрешено |
| `16 / 24` для `.base-section` padding | Storybook 16, production 24 | конфликт, см. §7 |
| `40 / 32 / 24 / 48` высоты контролов | все источники | производные от padding + line-height, не отдельные токены |
| `20` как высота бейджа/счётчика | Figma badge `text=yes` 20×20, Storybook 20 | `elements/badge` не содержит height |
| `1px` толщина границы | везде | токена толщины нет |
| `28` vs `32` высота чипа | production vs Storybook | см. §7 |
| `112px` header | production замер + Storybook токен | токен есть в реализации, в Figma не найден |

### 9.5. CANDIDATE TOKEN — кандидаты на нормализацию

Перечень областей, **не предложение имён**:

1. **Высоты контролов** — `control-height-{s,m,l,xl}` (24/32/40/48). Сейчас выводятся из padding.
2. **Толщина границы** — единственное значение 1px, но не токенизировано ни в одном источнике.
3. **Заголовочная типографика** — стилей для H1/H2 нет ни в Figma (только body 11–16), ни в реализации. Production использует 28/32 и 20/24.
4. **Радиус карточки/секции** — 24 повторяется, но привязка к `size/radius/xl` не подтверждена.
5. **Цвет фокуса** — жёлтый `#fdb814` в production не имеет токена нигде.
6. **Ширины контейнера и колонок** — 1100 / 776 / 300 / 12 / 24 не токенизированы нигде.
7. **Брейкпоинты** — имена `tablet:` / `phone:` есть в Tailwind-конфиге, значения не проверены.

---

## 10. Component hierarchy

Восстановлено из реальных сущностей. Пустые уровни не заполнены искусственно.

```text
╔═ FOUNDATIONS ══════════════════════════════════════════════════════════╗
║ Figma (new-career-ui)          │ Реализация (career-web)               ║
║ color/ui/*                     │ --color-ui-* (30+)                    ║
║ font/{family,size,line-height, │ Tailwind theme + text-body-m и др.    ║
║      weight,letter-spacing}    │                                       ║
║ size/spacing/x0…x10            │ Tailwind spacing                      ║
║ size/radius/{no,s,m,l,xl,full} │ rounded-xl / rounded-3xl / rounded-full║
║ text styles (5)                │ --color-font-*, --color-icon-* алиасы  ║
╚════════════════════════════════════════════════════════════════════════╝
                                   │
╔═ PRIMITIVES ═══════════════════════════════════════════════════════════╗
║ button/{S,M,L,XL} × 10 видов × 5 статусов   ↔  BaseButton              ║
║ badge (2 варианта)                          ↔  badge-слот              ║
║ icon/* (~140 @ 24px)                        ↔  SpriteIcon              ║
║ avatar/* (6 типов × 10 размеров)            ↔  (частично)              ║
║ controls/{checkbox,radiobutton,switch}      ↔  BaseCheckbox /          ║
║   [геометрия Figma недоступна]                 BaseRadioButton /       ║
║                                                BaseSwitch             ║
║ —                                           ↔  TextInput, BaseTextarea ║
║ —                                           ↔  BaseInputLabel          ║
╚════════════════════════════════════════════════════════════════════════╝
                                   │
╔═ COMPONENTS ═══════════════════════════════════════════════════════════╗
║ button/L/{icon,avatar,pagination,filter}    ↔  BaseIconButton,         ║
║                                                BaseAvatarButton,       ║
║                                                BasePaginationButton,   ║
║                                                FilterButton            ║
║ tab/button-segment → tab/button-segment group ↔ BaseSegmentedTabs      ║
║ control-list                                ↔  (не найдено)            ║
║ color-picker                                ↔  (не найдено)            ║
║ icon+text · loader · voting-{emoji,stars}   ↔  StarRating (частично)   ║
║ —                                           ↔  BaseChip, ClosableChip  ║
║ —                                           ↔  BaseSelect,             ║
║                                                BaseCustomSelect,       ║
║                                                MultiSelect             ║
║ —                                           ↔  BaseNotification,       ║
║                                                BaseSection,            ║
║                                                BasePagination,         ║
║                                                ContextMenu             ║
╚════════════════════════════════════════════════════════════════════════╝
                                   │
╔═ MODULES ══════════════════════════════════════════════════════════════╗
║ onboarding-tooltip  = tost(p 12/16, r12) + button/M + текстовые стили  ║
║ Вакансия · Карточка вакансии · Вакансия/Быстрый отклик · vacansy/dop   ║
║ карточка специалиста × 6 контекстов                                    ║
║ карточка эксперта · Рейтинг компании в списках · salary · hiding       ║
║                                             ↔  VacancyCard…, ResumeCard║
║                                             ↔  Conversations (37),     ║
║                                                Tests (13), Banners (9) ║
╚════════════════════════════════════════════════════════════════════════╝
                                   │
╔═ PAGE PATTERNS ════════════════════════════════════════════════════════╗
║ ❌ Не представлен ни в Figma Library, ни в Figma Modules,              ║
║    ни в Storybook. Единственный источник — production                  ║
║    (../../03-habr-career.md §3, §12).                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## 11. Composition patterns

### COMPONENT RULES — что система действительно задаёт

Подтверждено минимум двумя источниками:

1. Кнопка имеет **4 размера** (24/32/40/48) с фиксированными padding и radius.
2. Радиус кнопки зависит от размера: S/M → 8, L/XL → 12.
3. Фокус имеет **собственный радиус**, на 4px больше базового.
4. Круглые контролы (icon/avatar/pagination) — radius `full` (200 ↔ 9999).
5. Метка кнопки всегда имеет горизонтальный отступ 4px.
6. Иконка в кнопке — 24×24; счётчик-бейдж — 20×20 pill, 11/16·600.
7. Инпут и select — h40, radius 12, border 1px `#d4dee2`, шрифт 16/24.
8. Чип — radius 8, padding 4, шрифт 14/20·400, заливка = базовый цвет с альфой.
9. Нотификация — padding 12/16, radius 12, border 1px + фон того же цвета с альфой 10%.
10. Секция — radius 24, border 1px `rgba(24,46,57,.1)`, заголовок 20/24·600.
11. Сегментированные табы — контейнер pill с padding 4, сегменты pill h32, встроенный горизонтальный скролл.
12. Основной шрифт — Inter; веса только 400 и 600.
13. Аватар — 10 фиксированных размеров; для анонимного вид зависит от рейтинга.

### COMPOSITION RULES — что система НЕ задаёт

Ни Figma Library, ни Figma Modules, ни Storybook не отвечают на эти вопросы:

* сколько карточек помещается в колонку и какой между ними интервал;
* как строится sidebar и когда он исчезает;
* как распределяется whitespace на большом экране;
* насколько плотной должна быть страница;
* как строится иерархия заголовков на экране (заголовочных text styles в Figma нет вообще);
* какова ширина контейнера и колонок;
* каковы значения брейкпоинтов;
* как ведёт себя сетка при сужении.

**Единственный источник по всем этим вопросам — production**, то есть `../../03-habr-career.md` §3, §4, §12. И он описывает **уходящую реализацию** (Rails), а не ту, на которую продукт переезжает (Nuxt).

> Это ключевой пробел исследования. Компонентная библиотека не объясняет, как выглядит хороший экран Career. Для этого нужны **актуальные продуктовые макеты страниц**, которых в исследованных файлах нет.

Косвенные зацепки, найденные в Storybook:

* `--header-height: 112px` и `--fit-screen-height: calc(100dvh - var(--header-height) - 24px)` — то есть под шапкой резервируется ещё 24px;
* `VacancyCard` имеет `max-w-[560px]` — вероятная максимальная ширина карточки в списке;
* классы `tablet:` и `phone:` присутствуют в разметке карточек (`tablet:ml-0`) — адаптив реализуется на уровне компонента, а не только страницы;
* `ConversationsLayout` имеет stories «сайдбар свёрнут» / «диалог не выбран» — единственный компонент со stories уровня layout.

---

## 12. Reference examples

Сохранено **26 файлов**: `../evidence/source/storybook/` (20 PNG @2x) и `../evidence/source/figma/` (6 PNG).

### A. Foundations

| # | Файл | Source | Демонстрирует | Важные детали | Связанные правила |
|---|---|---|---|---|---|
| 1 | `fig-01-button-M-main.png` | Figma | Размер M во всех 5 статусах | inactive · hover · focus · disable · loading в одном кадре; видна геометрия фокус-кольца | §4.1, §9.1 |
| 2 | `fig-02-avatar-user-sizes.png` | Figma | Полная размерная шкала аватара | 140 · 96 · 72 · 56 · 48 · 40 · 36 · 32 · 24 · 20 | §4.2 |

### B. Primitives / controls

| # | Файл | Source | Демонстрирует | Важные детали | Связанные правила |
|---|---|---|---|---|---|
| 3 | `sb-01-base-button.png` | Storybook | BaseButton primary L | h40, padding 8/12, radius 12, `#8164f7` | §6.3, §7 EXACT |
| 4 | `sb-02-base-button-affixes.png` | Storybook | Слоты before/after | иконка 24 слева, badge 20 справа | §6.3 |
| 5 | `fig-03-button-L-icon.png` | Figma | Icon-button, типы base и colored-bg | 6 статусов × 2 типа; radius 200 | §4.1, §7 EXACT |
| 6 | `sb-03-icon-button.png` | Storybook | Реализация icon-button | 40×40, padding 8, radius 9999 | §7 EXACT |
| 7 | `fig-05-button-L-filter.png` | Figma | Filter-button, 5 статусов | 148×40, использует токены L | §4.1 |
| 8 | `sb-04-filter-button-badge.png` | Storybook | Filter-button со счётчиком | badge pill 20, `#8164f7` | §6.3 |
| 9 | `sb-05-ghost-button.png` | Storybook | Ghost с иконкой | h32, `#55798b`, без фона | §6.3 |
| 10 | `sb-06-ai-button.png` | Storybook | AI-кнопка | размер M, AI-градиент только в реализации | §7 CLOSE |
| 11 | `sb-07-chip-variants.png` | Storybook | Три варианта чипа | default / approved / ghost; h32 r8 | §7 DIVERGED (h28 в production) |
| 12 | `sb-08-chip-interactive.png` | Storybook | Чип: интерактив и disabled | состояния наведения и блокировки | §6.3 |
| 13 | `sb-09-input-label-errors.png` | Storybook | Label с ошибками | ошибка 14/20 цветом `--color-ui-red` `#f8651b` | §7 CONFLICT (danger) |
| 14 | `sb-10-select.png` | Storybook | BaseSelect | h40 r12 border `#d4dee2` — совпадает с production | §8 п.7 CONFIRMED |

### C. Components

| # | Файл | Source | Демонстрирует | Важные детали | Связанные правила |
|---|---|---|---|---|---|
| 15 | `sb-11-segmented-tabs.png` | Storybook | Табы со счётчиками | **активный сегмент фиолетовый** — расходится с production | §7 DIVERGED |
| 16 | `sb-12-segmented-long.png` | Storybook | Длинный ряд табов | горизонтальный скролл встроен в компонент | §6.3, §11 |
| 17 | `sb-13-pagination.png` | Storybook | Пагинация с многоточиями | nav radius 24, кнопки 40 pill | §6.3 |
| 18 | `sb-14-notification.png` | Storybook | Нотификация info | padding 12/16, r12, border + фон @10% | §6.3 |
| 19 | `sb-15-notification-alert.png` | Storybook | Нотификация alert | `#f8651b`; без заголовка | §7 CONFLICT (danger) |
| 20 | `sb-16-base-section.png` | Storybook | BaseSection | padding 16 против 24 — **конфликт закрыт в v0.4 в пользу 24**; файл перемещён в `source/archive/` | §8 п.1 |
| 21 | `fig-04-avatar-anonymous-score.png` | Figma | Аватар по рейтингу | 4 диапазона score × 10 размеров | §4.2 |

### D. Modules

| # | Файл | Source | Демонстрирует | Важные детали | Связанные правила |
|---|---|---|---|---|---|
| 22 | `fig-06-module-onboarding-tooltip.png` | Figma | Онбординг на трёх шагах | единственный полностью разобранный модуль | §5.2 |
| 23 | `sb-17-vacancy-card.png` | Storybook | Карточка вакансии «Full» | двойная обёртка, голубая подложка — вероятно промо | §7 DIVERGED |
| 24 | `sb-18-vacancy-card-min.png` | Storybook | Карточка вакансии «Minimal» | **для сравнения с production-карточкой** | §7 DIVERGED |
| 25 | `sb-19-conversation-card.png` | Storybook | Карточка диалога | самый крупный домен Storybook (37 компонентов) | §3.1 |

### E. Composition

| # | Файл | Source | Демонстрирует | Важные детали | Связанные правила |
|---|---|---|---|---|---|
| 26 | `sb-20-salary-bar.png` | Storybook | SalaryBar в диапазоне | сложный составной компонент из примитивов; 11 stories покрывают все состояния | §11 |

> Композиции уровня страницы среди референсов нет — потому что её нет в источниках. См. §14.

---

## 13. Conflicts / legacy / uncertainties

### Конфликты, требующие решения дизайн-команды

| # | Конфликт | Production | Storybook | Приоритет |
|---|---|---|---|---|
| 1 | Активный сегмент табов | белая заливка | фиолетовая заливка, белый текст | **высокий** — заметно визуально |
| 2 | Высота чипа | 28 | 32 | средний |
| 3 | Padding `BaseSection` | 24 | 16 | средний |
| 4 | Цвет danger | `#e21212` | `#f8651b` | **высокий** — семантика |
| 5 | Цвет фокуса | `#fdb814` жёлтый | не проверено, токена нет | **высокий** — доступность |
| 6 | Граница кнопки | `1px solid` цвета заливки | `0 none` | низкий — объясняется §7 |
| 7 | Структура карточки вакансии | одна обёртка r24 p24 | двойная обёртка r12 | средний — возможно, разные состояния |

### Legacy

| Что | Статус |
|---|---|
| **Текущий production Career (Rails + Webpacker)** | **LEGACY** — продукт переезжает на Nuxt. Все измерения `../../03-habr-career.md` описывают уходящую реализацию |
| Библиотека `career-lib` (2026-03) | предыдущее поколение относительно `new-career-lib` |
| Библиотека `👨‍🏭 01_Career` (2024-11) | legacy |
| Класс-префикс `basic-*` (`basic-chip`, `basic-section`, `basic-avatar`) | в новой реализации заменён на `base-*` |
| jQuery в бандле Career | остаток предыдущего поколения |

### Неопределённости

1. **Не установлено, какая доля новой реализации уже в проде.** Storybook на staging; production по-прежнему Rails. Возможен долгий период сосуществования.
2. **Не установлены значения `size/radius/{s,m,l,xl}` и `size/spacing/{x2…x10}`** — известны только `no=0`, `full=200`, `x0=0`, `x1=4`, `x1,5=6`.
3. **Не установлена форма аватаров** (круг/квадрат) — Figma-метаданные её не кодируют.
4. **Не установлено соответствие имён иконок** между Figma (`icon/*`, ~140) и реализацией (`SpriteIcon`).
5. **Не установлено, где живут `controls/*`** — компоненты есть в published library, страницы недоступны.
6. **Заголовочная типографика отсутствует в токенах обоих источников** — при этом production активно использует 28/32 и 20/24.

---

### Решения по составу Career UI Reference Page

> Добавлено при сборке `../showcase/` — живой reference page по итогам этого аудита.
> Здесь зафиксировано, какие расхождения **исключили элемент из reference set**, а какие
> удалось разрешить и на каком основании. Сам аудит эти конфликты не закрывает.

**Правило отбора.** Элемент попадает в reference set, если есть достаточные основания
считать его актуальным. Одновременное присутствие в трёх источниках не требуется.
Гибриды не создаются: если вариант выбран, он берётся целиком.

| Расхождение | Решение | Основание |
|---|---|---|
| **Segmented tabs** — активный сегмент белый (production) ↔ фиолетовый (реализация) | **исключён из reference set** | Расхождение смысловое, а не метрическое: меняется способ обозначения активности. Confidence по причине — НИЗКАЯ. Геометрия в Figma недоступна. В reference page вместо него — табы с подчёркиванием |
| **Focus ring** `#fdb814` | **исключён** | Цвета нет ни в переменных Figma, ни в 120 переменных реализации. Геометрия фокуса при этом токенизирована (`focus_border-radius`, +4px) — то есть система про фокус думала, а цвет остался вне токенов |
| **Danger — кнопка** | **исключена** | Внешние виды `danger` / `danger-border` объявлены в Figma, цвет не извлечён. `#e21212` в production — 2 вхождения, не токенизирован |
| **Danger — текст ошибки формы** | **включён**, значение `--color-ui-red` `#f8651b` | Это явный токен реализации, применённый в `BaseInputLabel`. Для текста ошибки основание достаточное; для заливки кнопки — нет |
| **Chip height** 28 (production) ↔ 32 (реализация) | **включён**, значение 32 | Confidence ВЫСОКАЯ (§7): цвет и радиус идентичны, различие только в высоте, и 32 выравнивает чип под размер M кнопки. Взят вариант новой реализации |
| **Section padding** 24 ↔ 16 | ~~отложено~~ → **ЗАКРЫТО в v0.4**, значение **24** | Замер production новой реализации даёт 24. Значение 16 в Storybook относилось к обёртке story, а не к компоненту. Оба имени класса (`basic-section`, `base-section`) описаны одним правилом в `../ui/components.css` |
| **Vacancy card** — одна обёртка r24 (production) ↔ двойная r12 с голубой подложкой (Storybook «Full») | **включена production-анатомия**, промо-вариант исключён | Гипотеза §7: story «Full» показывает продвигаемую вакансию. Confidence СРЕДНЯЯ — для базовой карточки достаточно, для промо-состояния нет |
| **Button border** `1px solid` цвета заливки (production) ↔ `0 none` (реализация) | **включён вариант реализации** | Confidence ВЫСОКАЯ (§7): приём в production существовал только ради выравнивания метрики filled и outline. Он же объясняет padding M 7 против 8 |
| **Hover заполненной кнопки** | **исключён** | В production измерено как «затемнение примерно на 8%». Точного значения или токена нет |
| **Статус `loading`** | **исключён** | Объявлен в Figma для всех кнопок, визуальное решение не извлечено |
| **BaseSwitch**, `ContextMenu`, `MultiSelect`, `BaseCustomSelect`, `ButtonRange`, `StarRating` | **исключены** | Известны по именам, геометрия не замерена ни в одном источнике |
| **`avatar/anonymous`** со свойством `score` | **исключён** | Известно, что вид зависит от рейтинга (4 диапазона); чем именно различаются — нет |
| **Таблицы** | **исключены** | В `../../03-habr-career.md` §10.8 это рекомендация «если таблица нужна», а не наблюдение. Компонента в Career нет |
| **Композиция страницы и responsive** | **исключены целиком** | См. §11 — ни один источник этот уровень не описывает |
| **Иконки и иллюстрации** | **показаны как заглушки с явной маркировкой** | Подтверждены размер (24×24, 16×16 у трёх) и цвет; начертания не извлекались. Место иллюстрации пустых состояний обозначено рамкой |

**Что из этого следует для аудита.** Ни одно из решений выше не является ответом на
вопросы §13 — все семь конфликтов остаются открытыми и требуют решения дизайн-команды.
Reference page лишь фиксирует, что при недостатке оснований элемент **не показывается**,
а не показывается в усреднённом виде.

---

## 14. Missing evidence

Список того, что нужно получить, чтобы закрыть исследование.

### Критично для UI kit

| # | Что | Почему нужно | Как получить |
|---|---|---|---|
| 1 | **Доступ ко всем страницам `new-career-lib`** | Формы (checkbox, radio, switch, control-list, color-picker) и `tab/button-segment` недоступны | Прямые ссылки с `node-id` на эти страницы, или открыть их в Figma-приложении |
| 2 | **Доступ ко всем страницам `new-career-modules`** | Разобран 1 модуль из 15+ | То же |
| 3 | **Значения `size/radius/{s,m,l,xl}` и `size/spacing/{x2…x10}`** | Фундамент шкал | `get_variable_defs` на узле, использующем эти токены |
| 4 | **Заголовочные text styles** | В токенах их нет, а production использует 28/32 | Проверить, есть ли отдельная типографическая библиотека |
| 5 | **Актуальные продуктовые макеты страниц** | Композиция не восстанавливается ни из чего другого | Отдельный Figma-файл с экранами |

### Важно, но не блокирует

| # | Что | Почему |
|---|---|---|
| 6 | Storybook: состояния hover/focus/disabled в динамике | Замерен только покой |
| 7 | Storybook: props/argTypes компонентов | API не извлечён; нужен парсинг бандла или docs-режим |
| 8 | Storybook: адаптив (`tablet:` / `phone:` значения) | Брейкпоинты не подтверждены |
| 9 | Соответствие иконок Figma ↔ спрайт | 140 иконок без сопоставления |
| 10 | Story `ResumeCard` падает с ошибкой | Не удалось замерить карточку специалиста |
| 11 | Размеры S и XL кнопки в реализации | В Storybook отдельных stories нет |
| 12 | Виды `danger` / `success` / `passive` в реализации | В Figma есть, в Storybook stories нет |

### Вопросы к команде

1. Какая из трёх Career-библиотек Figma считается источником истины сегодня?
2. Планируется ли перенос token-слоя из `career-web` в текущий production, или production будет заменён целиком?
3. Активный сегмент табов — белый или фиолетовый? Какое решение актуально?
4. `#e21212` или `#f8651b` — системный danger?
5. Жёлтое фокус-кольцо `#fdb814` — актуальное решение доступности?
6. Почему заголовочная типографика не токенизирована — это пробел или заголовки считаются контекстными?
7. Существует ли Figma-файл со страничными макетами Career?

---

## 15. Recommendations for future UI kit

> Рекомендации, **не реализация**. Ничего из перечисленного на этом этапе не создаётся.

### 15.1. На чём строить

**Источником истины должен быть `new-career-lib` + `career-web`, а не текущий production.**

Обоснование: кнопочная система совпадает в Figma и в новой реализации до пикселя; текущий production — уходящее поколение без токенов. Строить kit по нему — значит зафиксировать legacy.

При этом **измерения production не выбрасываются**: они остаются единственным источником по композиции страницы и служат проверкой того, что новая реализация не потеряла характер продукта.

### 15.2. Порядок работ

```text
1. Закрыть §14 пп. 1–3   → полный доступ к Figma-страницам и значениям шкал
2. Зафиксировать foundations по Figma-переменным
   (color/ui/*, font/*, size/spacing/*, size/radius/*)
3. Перенести элементные токены elements/button/* как есть —
   они уже проверены на трёх источниках
4. Разрешить 7 конфликтов из §13 с дизайн-командой
5. Собрать примитивы: button (4 размера × виды), badge, chip, input,
   select, checkbox, radio, switch, avatar, icon
6. Собрать компоненты: segmented tabs, pagination, notification,
   section, context menu
7. Только после этого — модули и композиция
```

### 15.3. Что взять без изменений

Эти решения подтверждены тремя источниками и не требуют пересмотра:

* размерная шкала кнопки S/M/L/XL с её padding и radius;
* правило «фокус имеет собственный радиус +4px»;
* `margin_text_left_right: 4` на метке;
* палитра `color/ui/gray-1…7` и `primary` / `blue-accent`;
* разделение «фиолетовый = действие, синий = ссылка»;
* инпут h40 / r12 / border `#d4dee2`;
* приём альфа-производных через `color-mix()` вместо хардкода;
* отсутствие теней, кроме `--shadow-dropdown`.

### 15.4. Чего не делать

* **Не изобретать имена токенов.** Они уже есть в Figma (`elements/button/L/padding_left_right`) и в реализации (`--color-ui-gray-2`). Придумывать третий набор — создавать четвёртое поколение библиотеки.
* **Не нормализовать `28 → 32` и подобное самостоятельно.** Это решения дизайн-команды (§13).
* **Не переносить композицию из production механически.** Она описывает Rails-реализацию; новая может иметь другую сетку.
* **Не унифицировать с Хабром и Курсами.** Три совпавших переменных (§9.3) — не основание.
* **Не строить kit до закрытия §14 пп. 1–3.** Без форм и без значений шкал получится kit из одних кнопок.

---

## 16. Достаточно ли данных для независимого Career UI kit

> **Историческая запись этапа v0.3.** Оценки ниже относятся к состоянию до
> page composition audit. Актуальные оценки — в §22.


Оценка по состоянию на текущий этап.

### Foundations — 6/10

**Есть:** палитра полностью (Figma-переменные + 120 CSS-переменных, значения совпадают); семейство и веса шрифта; пять текстовых стилей; факт существования шкал spacing и radius; подтверждённое отсутствие теней.

**Чего не хватает:**
* значений `size/radius/{s,m,l,xl}` — известны только `no=0` и `full=200`;
* значений `size/spacing/{x2…x10}` — известны только `x0=0`, `x1=4`, `x1,5=6`;
* **заголовочной типографики** — в токенах нет ничего крупнее 16px, при том что production использует 28/32 и 20/24;
* токена толщины границы (везде 1px, но не оформлен).

### Tokens — 7/10

**Есть:** два независимых, взаимно согласованных token-слоя — Figma (`new-career-ui`) и реализация (`career-web`). Элементные токены кнопок разрешены полностью. Семантические алиасы в реализации выстроены грамотно (`--color-font-link → --color-ui-blue-accent`).

**Чего не хватает:**
* сопоставления имён Figma ↔ CSS: `color/ui/gray-2` и `--color-ui-gray-2` совпадают по значению, но формального маппинга нет;
* токенов для высот контролов, границ, контейнеров, брейкпоинтов;
* ответа, переедет ли token-слой в текущий production.

### Primitives — 7/10

**Есть:** кнопка разобрана исчерпывающе и подтверждена тремя источниками — это готовый к переносу компонент. Badge, icon-button, avatar-button, pagination-button, filter-button — то же. Иконки (140 @ 24px) и аватары (6 × 10) описаны в Figma. Chip, select, input-label замерены в Storybook.

**Чего не хватает:**
* **геометрии контролов формы** — checkbox, radio, switch есть в Storybook (замерены поверхностно) и в Figma (недоступны). Это самый большой пробел уровня примитивов;
* размеров S и XL в реализации;
* видов `danger` / `success` / `passive` в реализации;
* состояний hover/focus/disabled в динамике.

### Components — 6/10

**Есть:** Storybook даёт 100 компонентов и 427 stories — богатейший источник. Segmented tabs, pagination, notification, section замерены точно.

**Чего не хватает:**
* сопоставления с Figma: большинство компонентов — STORYBOOK ONLY, то есть неизвестно, спроектированы ли они или выросли в коде;
* props/API компонентов — не извлечены;
* понимания, какие из 100 актуальны, а какие переходные;
* `tab/button-segment` в Figma — единственный компонент с явным DIVERGED, и разрешить его нечем.

### Modules — 4/10

**Есть:** перечень 15 модулей с датами обновления; один (`onboarding-tooltip`) разобран полностью, включая элементные токены; понятен принцип именования «сущность / контекст»; в Storybook есть доменные аналоги.

**Чего не хватает:**
* **геометрии 14 из 15 модулей** — страницы Figma недоступны;
* состава модулей: из каких примитивов собраны «карточка специалиста» и «Вакансия»;
* сопоставления Figma-модулей со Storybook-компонентами;
* empty / error / loading состояний на уровне модулей (в Storybook они есть у Conversations, у карточек — нет).

### Page composition — 2/10

**Есть:** только косвенные зацепки — `--header-height: 112px`, `--fit-screen-height`, `max-w-[560px]` у карточки вакансии, наличие `ConversationsLayout` со stories уровня layout.

**Чего не хватает практически всего:**
* ширины контейнера и колонок в новой реализации;
* правил sidebar;
* плотности и распределения whitespace;
* иерархии заголовков на экране;
* сетки карточек;
* **страничных макетов как таковых** — их нет ни в одном из трёх новых источников.

Единственный источник — production, и он описывает уходящую реализацию. **Это самый слабый участок и главный риск: UI kit, собранный сейчас, даст правильные компоненты и неправильные экраны.**

### Responsive behaviour — 3/10

**Есть:** классы `tablet:` и `phone:` в разметке компонентов (`tablet:ml-0`, `phone:grid-cols-1`); варианты `device=desktop/tablet/mobile` у трёх иллюстраций в Figma; встроенный горизонтальный скролл у сегментированных табов; story «Mobile» у TrackBanner и SalaryBar.

**Чего не хватает:**
* значений брейкпоинтов `tablet` / `phone`;
* правил перестроения сетки;
* поведения sidebar;
* мобильных вариантов большинства компонентов;
* адаптивных вариантов модулей.

### Сводка

| Область | Оценка | Блокирует UI kit? |
|---|---:|---|
| Foundations | **6/10** | частично — нужны значения шкал |
| Tokens | **7/10** | нет |
| Primitives | **7/10** | частично — нужны формы |
| Components | **6/10** | нет |
| Modules | **4/10** | да, для модульного уровня |
| Page composition | **2/10** | **да, критично** |
| Responsive behaviour | **3/10** | да |

**Общий вывод:** данных достаточно, чтобы собрать **foundations + примитивы кнопочной группы** с высокой уверенностью. Недостаточно, чтобы собрать полный kit и — тем более — чтобы прототипировать на нём целые экраны.

---

## 17. Следующий минимальный шаг

**Один запрос, который разблокирует больше всего:**

> Прямые ссылки с `node-id` на страницы Figma, содержащие `controls / checkbox`, `controls / radiobutton`, `controls / switch`, `control-list`, `tab / button-segment`, а также на 2–3 модуля из `new-career-modules` — например `карточка специалиста / Обычная` и `Вакансия`.

Почему именно это:

* **закрывает главный пробел примитивов** — контролы формы, без которых kit неполон;
* **разрешает единственный DIVERGED-конфликт компонентов** — `tab/button-segment`, где сейчас нельзя сказать, права ли новая реализация;
* **даёт первый разбор доменных модулей**, а с ним — значения `size/radius/*` и `size/spacing/*`, которые наверняка используются в карточках;
* стоит одного сообщения и не требует новой работы от команды.

**Вторым шагом** — ответ на вопрос, существует ли Figma-файл со страничными макетами Career. Без него участок Page composition останется на 2/10, и любой собранный kit придётся проверять на production-скриншотах уходящей реализации.

**Третьим** — семь вопросов из §14 к дизайн-команде: они дешёвые, но снимают все конфликты §13.

---

# ЭТАП v0.4 — PAGE COMPOSITION AUDIT

Дата: 2 сентября 2026. Предмет — **не компоненты, а экраны**: как из уже
инвентаризованных блоков собираются реальные страницы Career.

**Метод.** 16 страниц продукта сняты через CDP на четырёх вьюпортах
(1440 / 1024 / 768 / 375) с принудительной светлой темой. Для каждой снят
машиночитаемый снимок композиции: оболочка, контейнеры, колонки, поток главной
колонки с отступами, заголовки с размерами, повторяющиеся блоки с шагом,
sticky-элементы, навигация, плотность, медиазапросы. Дополнительно проведено
сканирование ширины в 30 точках от 1440 до 320 для поиска фактических
брейкпоинтов. Сырые данные — `../evidence/source/production/*.json`.

Правила ниже имеют идентификаторы (`SH-1`, `L-2`, …). На них ссылается
`../evidence/README.md` и комментарии в `../showcase/`.

---

## 18. Page families

### 18.1. Проверка прежней классификации

Гипотеза v0.2 — LISTING · DETAIL · PROFILE · RATING/DASHBOARD · JOURNAL — **в основном
подтвердилась, но потребовала двух правок**:

| Что | Итог |
|---|---|
| LISTING | подтверждено |
| DETAIL | подтверждено |
| PROFILE | подтверждено, **и сюда же относится обычная страница компании** — она собрана тем же способом, что страница человека |
| RATING / DASHBOARD | подтверждено, но это **два разных каркаса**: рейтинг использует каркас листинга, зарплаты — собственный |
| JOURNAL | **не является семейством продукта.** Это отдельная legacy-вёрстка блога вне сетки Career |
| — | **Добавлено: BRANDED COMPANY PROFILE.** Рекламное пространство компании внутри оболочки Career с собственной типографикой |
| — | **Добавлено: SERVICE / ERROR.** Служебные экраны отменяют сетку целиком |
| — | **Зафиксировано отсутствие: AUTH.** Своих экранов входа у Career нет |

### 18.2. Итоговая таксономия

Действующая версия — [`../RULES.md`](../RULES.md) §1. Ниже она приведена
в том виде, в каком была выведена на этом этапе.

```
PRODUCT SCREENS — общая сетка, общий язык
├── LISTING            /vacancies · /companies · /experts · /resumes
├── DETAIL             /vacancies/:id
├── PROFILE            /:user · /companies/:slug (небрендированная)
├── RATING             /companies/ratings          каркас листинга
├── DASHBOARD          /salaries                   собственный каркас
└── SERVICE            404 · 500 · пустые служебные экраны

ADJACENT — внутри оболочки, но не продуктовый язык
├── BRANDED PROFILE    /companies/:slug (брендированная)
└── JOURNAL            /journal                    legacy-вёрстка блога

OUTSIDE — другая система
└── AUTH               /users/sign_in → id.habr.com (Хабр Аккаунт)
```

---

## 19. Composition rules — вывод

> **Нормативные формулировки переехали в [`../RULES.md`](../RULES.md).**
> Здесь оставлены вывод, покрытие и история — то, чего в своде правил нет.
> Если значение в этом разделе расходится со сводом, верен свод: он обновляется,
> аудит — нет.

Правила выведены из измерений; покрытие каждого — в своде.
Ниже осталось то, ради чего этот раздел существует: **как** правило было получено
и почему сформулировано именно так.

### 19.1. Оболочка — SH

Выведено 5 правил: `SH-1`…`SH-5`.

> `SH-5` — самый устойчивый параметр Career. Контейнер 1100/12 не изменился
> при переезде на Nuxt.

### 19.2. Сетка и листинг — L

Выведено 7 правил: `L-1`…`L-7`.

> `L-7` уточняет прежний вывод «градиентов в Career нет». Градиенты есть,
> но только в промо-слое, и для них существуют токены
> `--color-booster-gradient`, `--color-ai-gradient`.

### 19.3. Страница сущности — D

Выведено 5 правил: `D-1`…`D-5`.

> `D-3` — одно из самых характерных правил Career. Микро-метка 12/16 gray-3
> встречается на страницах обеих реализаций и является основным способом
> группировки метаданных.

### 19.4. Профиль — P

Выведено 4 правила: `P-1`…`P-4`.

### 19.5. Дашборд — DB

Выведено 3 правила: `DB-1`…`DB-3`.

> Дашборд исследован на одной странице. Правила `DB-*` имеют **низкое покрытие**
> и должны применяться осторожно.

### 19.6. Карточки — C

Выведено 7 правил: `C-1`…`C-7`.

> **`C-1` исправляет вывод v0.2** «основная карточка границы не имеет». Текущий
> production показывает границу `1px rgba(24,46,57,.1)` — **то же значение, что
> в Storybook**. Конфликт «есть ли граница у секции» закрыт: границы есть.

### 19.7. Формы — F

Выведено 4 правила: `F-1`…`F-4`.

> Career **не имеет собственных экранов входа и регистрации**: `/users/sign_in`
> уводит на Хабр Аккаунт с другой дизайн-системой (кнопка `#558cb7`, radius 3px,
> высота 48, поле 376×68). Это граница продукта.

### 19.8. Модули — M

Выведено 3 правила: `M-1`…`M-3`.

### 19.9. Контент — CT

Выведено 6 правил: `CT-1`…`CT-6`.

### 19.10. Что композиция НЕ задаёт

Остаётся неизвестным даже после этого этапа:

* поведение при авторизации — все страницы сняты гостем;
* состояния загрузки и скелетоны — не пойманы;
* модальные окна — недоступны без учётной записи;
* раздел «Диалоги» (37 компонентов Storybook) — недоступен;
* существуют ли в Figma страничные макеты — не установлено.

---

## 20. Responsive

### 20.1. Фактические брейкпоинты

Сканирование ширины в 30 точках (1440 → 320) на четырёх страницах.

**Устаревающая реализация (Rails) — ровно один брейкпоинт: 1024px.**

```
≥ 1024 : шапка 112 · сайдбар 300 рядом с главной колонкой · бургера нет
≤ 1023 : шапка 144 · сайдбар уходит вниз или исчезает · появляется бургер
         фильтры сворачиваются в кнопку
< 1023 : раскладка больше НЕ меняется вплоть до 320 — только линейное сжатие
```

> **Проверено ещё раз в v0.5, запись подтверждена.** По дороге эта строка была
> ошибочно «исправлена» на 767 и возвращена обратно. Ошибка стоит того, чтобы
> её здесь зафиксировать: она показывает, как легко неверно прочитать замер.
>
> Дампы production дают две точки:
>
> | Окно | Ширина документа | Шапка | Колонки |
> |---|---|---|---|
> | 1024 | 1009 | 112 | две (685 + 300) |
> | 768 | 753 | 144 | одна |
>
> Рассуждение, приведшее к ошибке: «медиазапрос сравнивает ширину документа;
> 1009 меньше 1023, значит при границе 1023 раскладка на этой точке была бы
> мобильной — а она десктопная; следовательно граница ниже».
>
> Неверна посылка. **Медиазапросы в Chrome сравниваются с шириной окна,
> включая полосу прокрутки**, а не с шириной документа. Съёмка «1024» — это
> медиаширина 1024, съёмка «768» — 768. Тогда правило `max-width: 1023`
> объясняет обе точки, а `max-width: 767` — нет: при нём окно 768 было бы
> десктопным, а оно мобильное.
>
> Отдельно снимается и кажущееся противоречие с §24.3: переменная
> `--header-height` действительно переключается на 767, но она принадлежит
> **новой** реализации, а измерялись страницы устаревающей. Две шкалы
> сосуществуют — это не расхождение, а два разных стека внутри одного продукта.

### 20.2. Поведение на границе

> **Нормативные формулировки переехали в [`../RULES.md`](../RULES.md).**
> Здесь оставлены вывод, покрытие и история — то, чего в своде правил нет.
> Если значение в этом разделе расходится со сводом, верен свод: он обновляется,
> аудит — нет.

Вывод: восемь правил `R-1`…`R-8`, по одному на наблюдавшийся способ перестроения. Каждое привязано к семейству страниц.

### 20.3. Что НЕ меняется

Шесть параметров не зависят от ширины — перечислены в [`../RULES.md`](../RULES.md) §11.

> Отсутствие типографического масштабирования — сознательное решение, а не
> упущение: проверено на четырёх страницах и четырёх вьюпортах.

---

## 21. States — вывод

> **Нормативные формулировки переехали в [`../RULES.md`](../RULES.md).**
> Здесь оставлены вывод, покрытие и история — то, чего в своде правил нет.
> Если значение в этом разделе расходится со сводом, верен свод: он обновляется,
> аудит — нет.

Пять состояний `ST-1`…`ST-5`, снятых на живых страницах.

> **`ST-2` исправляет** запись v0.2 «заголовок пустого состояния 28/32 или 20/24,
> есть иллюстрация и кнопка». Измеренный блок пустого результата в списке —
> 18/24 без иллюстрации и без действия. В библиотеке Figma 25 иллюстраций
> пустых состояний 96×96 существуют, но живого примера их применения не найдено.

**Не наблюдались:** loading / skeleton, ошибка формы, модальные окна,
disabled-состояния страницы, archived-состояния. Отсутствие не означает, что их нет.

---

## 22. Повторная оценка достаточности

| Область | Было (v0.3) | Стало (v0.4) | Что улучшилось | Чего не хватает |
|---|---:|---:|---|---|
| **Foundations** | 6/10 | **7/10** | Подтверждён контейнер 1100/12, фон белый, шкала брейкпоинтов прочитана из CSS. Добавлена типографика 42/48, 18/22, 12/16 | Значения `size/radius/{s,m,l,xl}` и `spacing/{x2…x10}`; заголовочные стили по-прежнему вне токенов |
| **Tokens** | 7/10 | **7/10** | Не менялось: этап не касался токенов | Маппинг Figma ↔ CSS; токены высот, границ, контейнеров |
| **Primitives** | 7/10 | **7/10** | Не менялось | Геометрия checkbox / radio / switch из Figma; размеры S и XL в реализации |
| **Components** | 6/10 | **7/10** | Конфликт «граница секции» закрыт измерением production; конфликт padding закрыт в пользу 24; подтверждены два тона чипов | Props/API; какие из 100 компонентов актуальны; hover/focus |
| **Modules** | 4/10 | **6/10** | Четыре модуля измерены в реальном окружении: вакансия, компания, эксперт, рейтинг. Подтверждена сохранность геометрии при смене стека | Геометрия 14 из 15 модулей Figma; модули домена «Диалоги» |
| **Page composition** | **2/10** | **7/10** | Семь семейств страниц восстановлены и проверены; 40 правил композиции с указанием покрытия; сетка, шапка, карточки и группировка метаданных измерены на 16 страницах в двух реализациях | Композиция для авторизованного пользователя; дашборд исследован на одной странице; макетов страниц в Figma не найдено |
| **Responsive** | **3/10** | **7/10** | Брейкпоинты установлены точно: 1024 у legacy; 480/768/1024 прочитаны из CSS новой реализации. Восемь правил перестроения с различием по семействам | Поведение форм при сужении; порядок стека в дашборде; что происходит между 360 и 320 |
| **States** | — | **4/10** | Пять состояний измерены, включая исправление типографики пустого состояния | Loading, ошибки форм, модальные окна, всё авторизованное |
| **Visual references** | — | **7/10** | 34 curated-примера с манифестом: назначение, паттерны, связанные правила, границы применимости | Нет примеров авторизованных экранов и состояний загрузки |

---

## 23. Career vibe coding readiness — 6.5/10

**Мысленный тест.** Coding AI получает только `README.md`, `showcase/`,
`showcase/` и `evidence/curated/`, и задание: «сделай новый интерфейс
Career для функции, которой сейчас нет».

| Что | Вероятность попадания |
|---|---|
| Визуально будет Career | **высокая** — палитра, шрифт, радиусы, белый фон, отсутствие теней зафиксированы жёстко |
| Правильно использует компоненты | **высокая** — геометрия кнопок, полей и чипов проверена на трёх источниках |
| Правильно использует отступы | **высокая** — шаг 4 внутри, 12 между карточками, 24 внутри карточки |
| Правильно строит композицию страницы | **средняя** — сетка 752+24+300 и правило «заголовок внутри карточки» надёжны; но для дашборда и нестандартных экранов покрытие слабое |
| Правильно работает responsive | **средняя-высокая** — брейкпоинт 1024 и поведение сайдбара надёжны; поведение форм и сложных гридов — нет |
| Не превратится в generic SaaS | **средняя-высокая** — главные отличители (белый фон вместо серого, границы вместо теней, микро-метки 12/16, холодная сине-серая шкала, фиолетовый только на действиях) описаны явно |

### Главные ошибки, которые AI всё ещё может совершить

1. **Добавит тени.** Самый вероятный сбой: generic-привычка «карточка = тень».
   В Career тень существует ровно одна — у выпадающих меню.
2. **Возьмёт серый фон страницы.** Career белый; разделение делается границей 1px.
3. **Поставит заголовок страницы над карточкой.** В Career он **внутри** карточки
   вместе с поиском и сортировкой.
4. **Поставит основное действие в конец страницы.** В Career оно в шапке сущности.
5. **Сделает сайдбар справа на странице профиля.** Профиль — единственное
   семейство с сайдбаром слева.
6. **Масштабирует типографику на мобильном.** Career этого не делает.
7. **Схлопнет трёхколоночный грид в две колонки.** Career схлопывает сразу в одну.
8. **Использует фиолетовый как фон блока.** Фиолетовый в Career — только действие.
9. **Изобретёт состояние загрузки или ошибку формы.** Их визуальное решение
   неизвестно — это ровно тот случай, когда правильнее спросить, а не додумать.
10. **Скопирует решения брендированного профиля компании** (типографика 40/40,
    полноширинные блоки, фирменный цвет) в продуктовый экран.

**Почему не выше 6.5.** Три области остаются пустыми: авторизованный интерфейс,
состояния загрузки и ошибок, композиция дашборда за пределами одной страницы.
Для функции, которая живёт внутри личного кабинета, пакет даст правильные
компоненты и неправильный экран.

---

## 24. Component knowledge extraction (v0.5)

Этап, на котором реконструкции компонентов заменены настоящим кодом Career.
Источник — локальный корпус `_sources/career/`, снятый на предыдущем
этапе: 427 записей Storybook, 243 snapshot DOM, 67 файлов CSS, 120 ассетов.

Задача формулировалась не как «собрать ещё одну витрину», а как перенос знания:
после извлечения пакет `career/` должен сохранять практически всё полезное
о reusable UI, даже если корпус Storybook удалить.

### 24.1 Что дало извлечение настоящего CSS

До этого этапа компоненты в пакете были **реконструкциями**: значения брались
из замеров production и Figma, а имена классов — из наблюдений. Реконструкция
оказалась близкой, но не точной, и разбор показал, где именно.

| Что считалось | Как на самом деле | Как выяснилось |
|---|---|---|
| `size-s` — 24px, кегль 11/16 | `size-sm` — **28px**, кегль 12/16 | `.base-button.is-sizeable.size-sm { min-height: 1.75rem }` |
| `appearance-neutral` | `appearance-passive` | в `argTypes` такого значения нет вовсе |
| 7 подтверждённых видов кнопки | **12 в props плюс `ghost` и `avatar` в CSS** | `argTypes.appearance.options` |
| `appearance-ai` — вариант кнопки | отдельный компонент `AIButton` | своя запись Storybook, свой CSS |
| Размер применяется классом `size-*` | нужен ещё `is-sizeable` | `.base-button.is-sizeable.size-l` — без первого класса ни один размер не действует |
| `base-notification--info` | `.notification--info` | имя компонента и имя класса различаются |
| `checkbox__wrapper`, `checkbox__box` | в новой реализации `checkbox-label`, `checkbox-button` | оба набора действующие: продукт переезжает по частям |
| `text-input--error` | `text-input--invalid` | имени `--error` в реализации нет |
| Заголовок карточки 20/24 | **24/28** по умолчанию; 20/24 — это `--size-s` | `.base-section__title` и его модификаторы |

Ни одно из этих расхождений не было бы обнаружено измерением скриншотов:
все они видны только в исходном CSS.

### 24.2 Закрытые расхождения

Четыре конфликта из §13 закрыты — не выбором «что выглядит логичнее»,
а прочтением кода.

**Padding секции 16 ↔ 24 — не конфликт.** Оба значения настоящие:

```css
:where(.base-section) { border: 1px solid #182e391a; padding: 1.5rem }
:where(.base-section--padding-medium) { padding: 1rem }
```

24 — значение по умолчанию, 16 — вариант `--padding-medium`. Прежний вывод
«Storybook показывал 16, значит расхождение» был ошибкой интерпретации:
в story просто использовался плотный вариант.

Заодно объяснилось, почему граница карточки так легко «пропадала» в замерах:
правило обёрнуто в `:where()` и имеет нулевую специфичность — любая утилита
в разметке перебивает его без борьбы.

**Активный сегмент табов — фиолетовый.** Разметка снята целиком: активная
вкладка получает `text-ui-white`, а под текстом лежит отдельный абсолютный слой
`span.absolute.inset-0.z-[1].rounded-full.bg-ui-primary`. Белого варианта
в реализации нет. Компонент возвращён в reusable-набор.

**Цвет кольца фокуса `#fdb814` — устаревшее значение.** Единого цвета фокуса
у Career нет. Фокус показывается только на `:focus-visible` и красится цветом
самого варианта при 60% непрозрачности:

```css
.base-button.appearance-main:focus-visible   { outline: 2px solid var(--color-ui-primary-60); outline-offset: 2px }
.base-button.appearance-danger:focus-visible { outline: 2px solid var(--color-ui-red-60);     outline-offset: 2px }
```

У брендированных вариантов вместо контура — двойная тень
`0 0 0 1px #fff, 0 0 0 3px var(--color-font-black)`.

**Системный красный для danger — `--color-ui-red` `#f8651b`.** У кнопки есть
`appearance-danger` и `appearance-danger-border`; `#e21212` в новой реализации
не встречается ни разу.

### 24.3 Брейкпоинты: окончательные значения

Раньше шкала выводилась из имён префиксов и наблюдений за поведением. Теперь
она прочитана из медиазапросов сборки — каждый префикс сопоставлен с блоком,
в котором объявлены его утилиты.

| Префикс | Медиазапрос | Утилит в сборке |
|---|---|---|
| `small-phone:` | `(max-width: 479px)` | 20 |
| `phablet-only:` | `(min-width: 480px) and (max-width: 767px)` | 21 |
| `phone:` | `(max-width: 767px)` | 180 |
| `tablet-only:` | `(min-width: 768px) and (max-width: 1023px)` | 17 |
| `tablet:` | `(max-width: 1023px)` | 165 |
| `desktop:` · `desktop-only:` | `(min-width: 1024px)` | 6 + 12 |

Шкала **max-width-first**: `tablet:hidden` означает «скрыт при ≤ 1023px».
Основная работа приходится на две ступени — 767 и 1023; остальные четыре
используются точечно.

Отдельно: `--header-height` переопределяется внутри `@media (max-width: 767px)`
со 112 на 144.

**Разъяснено в этом же этапе, позже.** Сначала это выглядело расхождением
с §20.1, где записана граница 1024, и я ошибочно «исправил» §20.1 на 767.
Расхождения нет: `--header-height` принадлежит **новой** реализации
(career-web), а §20.1 описывает **устаревающую** (Rails). Шкалы у них разные,
и обе действующие. Разбор ошибки — в §20.1.

### 24.4 Типографика и тени: то, чего не искали

**Шкала кеглей у Career именованная**, и она не совпадает с перечнем значений,
собранным замерами:

```
text-display-xl  28/32     text-body-l   16/24
text-display-l   24/28     text-body-m   14/20
text-display-m   20/24     text-body-s   12/16
text-display-s   18/24     text-body-xs  11/16
```

Прочие значения (15/24, 17/22, 42/48) принадлежат устаревающей реализации
и в новой не воспроизводятся.

**Теней не одна, а шесть**, и они объявлены классами, а не переменными.
Более того, переменная `--shadow-dropdown` в `:root` **не совпадает**
с одноимённым классом — это разные значения:

| Класс | Значение |
|---|---|
| `shadow-border` | `inset 0 0 0 1px var(--shadow-border-color)` |
| `shadow-gray-shadow` | `inset 0 0 1px var(--color-ui-gray-shadow)` |
| `shadow-dropdown` | `0 1px 4px 1px, 0 4px 8px 2px` от `--color-ui-gray-shadow` |
| `shadow-float-element` | то же значение |
| `shadow-float-notice` | `0 2px 8px 0 #434b6029` |
| `shadow-context-menu-dropdown` | `0 1px 20px var(--color-ui-black-20)` |

Вывод §9 о том, что Career разделяет плоскости рамкой, остаётся верным:
две из шести «теней» — это рамки, а настоящие подъёмы приберегаются
для всплывающего. Но утверждение «тень ровно одна» было неточным.

### 24.5 Что оказалось не токенами

120 переменных разобраны на четыре категории, и три из них — не токены:

| Категория | Сколько | Что это на самом деле |
|---|---|---|
| USED / AVAILABLE | 120 | собственно переменные Career |
| COMPONENT-LOCAL | 7 | публичный API компонента: `--avatar-size`, `--textarea--maxRows`, `--base-modal-header-border-color` и другие задаются инлайновым стилем |
| RUNTIME | 4 | `--color-branded-profile-*` подставляет страница компании; в CSS значений нет вовсе |
| UNKNOWN | 8 | `--font-size-body-l`, `--loblolly` и подобные — следы соседнего слоя дизайн-системы Хабра, используются с запасным значением |

Практический вывод: **у Career нет переменных отступов, радиусов и кеглей.**
Их роль играют утилиты. Попытка «дополнить систему» шкалой `size/spacing/*`
была бы созданием новой дизайн-системы, а не описанием этой.

### 24.6 Что мешало и мешает

104 story из 347 не отрисовались, и причина не в методе съёмки: статическая
сборка Storybook Career не отдаёт два файла — `-iqz-73v.js` и `-2YzXgxt.js`,
оба отвечают HTTP 404, притом что импортирующие их чанки отдаются нормально.
Оба имени начинаются с дефиса; похоже, при выкладке потерялись файлы,
чьи имена начинаются с `-`.

Затронуто ядро ленты сообщений (`Messages` — 25 story, `MessagesGroup`,
`ConversationMessages`), `ResumeCard`, `ButtonRange`, `PromotionCard`,
`JournalBlockSidebar` и большая часть группы `Tests`.

Смысловое покрытие пострадало меньше количественного: у `TestItem` снялись
все семь исходов, поэтому карточка теста известна полностью, хотя из 59 story
группы `Tests` снялось 13.

Второй класс пробелов — состояния, живущие в порталах: раскрытые списки
`CustomSelect` и `MultiSelect`, контекстное меню, тост `notify()`. Их CSS есть,
разметки нет. Достраивать её нельзя — это ровно тот случай, когда придуманная
структура выглядела бы правдоподобно и была бы неверной.

### 24.7 Повторная оценка

| Область | v0.4 | v0.5 | Что изменилось |
|---|---|---|---|
| Foundations | 8/10 | **9.5/10** | шкала кеглей именованная, брейкпоинты точные, шрифт локально |
| Tokens | 8/10 | **9.5/10** | 120 из 120, разобраны по категориям, отделены не-токены |
| Primitives | 7/10 | **9.5/10** | настоящий CSS вместо реконструкции, исправлено девять расхождений |
| Components | 6/10 | **9/10** | 100 компонентов описаны, 73 показаны настоящей вёрсткой |
| Modules | 5/10 | **7/10** | вложения, шаблоны, шапка переписки, импорт вакансий — с разметкой |
| Page composition | 7/10 | 7/10 | не менялось: это не предмет этапа |
| Responsive | 6/10 | **7.5/10** | шкала из шести ступеней прочитана из сборки; поведение компонентов известно, поведение страниц — по-прежнему по замерам |
| States | 4/10 | **8/10** | hover, focus-visible, disabled, loading, checked извлечены из CSS для всех компонентов |
| Visual references | 8/10 | 8/10 | не менялось |
| Icons / assets | 2/10 | **10/10** | было: заглушки. Стало: 146 настоящих символов, 47 иллюстраций, шрифт |

### 24.8 Career vibe coding readiness — 8/10

Было 6.5. Что подняло оценку:

* компоненты можно верстать по спецификации, не глядя на картинку;
* состояния больше не надо выдумывать — они прочитаны из CSS;
* иконки настоящие, а не «квадрат 24×24 на месте иконки»;
* имена классов совпадают с продуктом, то есть сгенерированную разметку
  можно переносить в Career как есть.

**Ошибки, которые AI всё ещё может совершить** — список из §23 сокращается,
но не исчезает. Остаются актуальными пункты 2–8 и 10: серый фон страницы,
положение заголовка и основного действия, сайдбар профиля, масштабирование
типографики на мобильном, схлопывание грида в две колонки, фиолетовый как фон,
перенос решений брендированного профиля в продуктовый экран.

Пункт 1 («добавит тени») смягчается: шкала теней теперь известна, и её можно
применять осознанно — но привычка вешать тень на карточку остаётся самым
вероятным сбоем, потому что у карточки Career тени нет.

Пункт 9 («изобретёт состояние загрузки или ошибку формы») закрыт:
и то и другое извлечено.

Добавляются три новые ошибки, специфичные для нового материала:

11. **Забудет `is-sizeable`.** Без этого класса ни один `size-*` не действует,
    и кнопка молча теряет высоту, радиус и отступы.
12. **Уберёт утилиты Tailwind из разметки, посчитав их мусором.** Часть
    компонентов — `StatusChip`, `SegmentedTabs`, `InnerProjectBanner` —
    собрана утилитами целиком и без них не существует.
13. **Смешает две системы имён.** `checkbox__box` и `checkbox-button` —
    это разные реализации одного контрола, а не опечатка. Внутри одного
    экрана нужно держаться одной.

**Почему не выше 8.** Композиция страниц не улучшилась — этап её не касался.
Авторизованный интерфейс по-прежнему не исследован. И лента сообщений,
самый плотный по данным экран продукта, остаётся без разметки.

---
