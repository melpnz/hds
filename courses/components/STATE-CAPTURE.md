# Снятость состояний · Курсы

Вторая половина вопроса, который заводит `components/STATES.md`: тот файл
(R1-01) отвечает «какие состояния применимы к записи по её природе», этот
(R1-02) — «какие из применимых состояний **сняты** источником, а какие
**не сняты** и требуют разбора при вёрстке». Применимость и снятость —
разные оси, и путать их значит не отличать «у кнопки нет `loading`» от
«мы не проверяли, грузится ли кнопка» (см. эпиграф `STATES.md`).

Метод — `.claude/guide/METHOD.md` §4; матрица требуемости и обоснование
каждого `requiredStates` — принятый `components/STATES.md`; реестр —
`components/manifest.json`; шаг — R1-02, последний в волне R1.

---

## 1. Как читать «снято» здесь

Три исхода на пару (запись, состояние), не два — но exit criteria волны
(«снято или дописано») закрывается двумя способами, и о третьем сказано
отдельно в §5:

| Исход | Что значит | Как выглядит в этом файле |
|---|---|---|
| **снято — продуктовый стиль** | В DOM/CSS/Storybook найден явный класс/атрибут состояния | цитата класса, файл, число вхождений |
| **снято — факт браузерного дефолта** | Явного стиля нет, но нативное поведение элемента (`<a>`/`<button>`/`<input>`) само даёт состояние, и **ничего его не отменяет** | «нет `hover:`/`focus-visible:` класса, нет и сброса (`outline-none`/`focus:outline-none`) без замены» |
| **не снято** | Ни продуктового стиля, ни надёжного браузерного дефолта нет — либо дефолт **сломан** явным сбросом без замены | GAP, адрес (шаг, который его закрывает) |

Второй исход — не натяжка. METHOD §4 определяет факт как «снято из DOM,
computed styles, CSS сборки, argTypes или узла Figma»: то, что кнопка
`<button>` в продукте не переопределила фокус, — это **тоже** факт про
устройство продукта (сознательный или нет), с тем же источником (класс
отсутствует, замер по `dom.html`), что и факт про переопределённый цвет.
Задание этого шага прямо предупреждает не путать такой факт с нормативом:
«если фокус нигде явно не объявлен, а только браузерный дефолт — это
может остаться фактом, а не автоматически нормативом».

### Правило отличения факта-дефолта от норматива (`hover` и `focus-visible`)

Проверено по всему корпусу (`evidence/source/production/pages/*/dom.html`,
10 файлов) и по всем `_sources/courses/rendered/*.html` (27 story):

- **`hover` не ломается никогда.** У Tailwind-утилит нет парного «убрать
  дефолтный hover» — нативный hover на плоской кнопке и так ничего не
  меняет без своего класса. Поэтому `hover` либо снят продуктовым стилем
  (класс `hover:*` найден на узле), либо снят фактом дефолта (класса нет —
  и это устойчиво «ничего не показывает», а не «что-то сломано»). Норматива
  `hover` не требует нигде в этом реестре.
- **`focus-visible` может быть сломан.** Только там, где в классе узла есть
  `outline-none`/`focus:outline-none` **без** парной `focus-visible:*`-утилиты
  или другого компенсирующего механизма (`focus-within:border-*` на обёртке —
  так сделано у `Select`/`MultiSelect`/`SearchInput`, GAP не открывается).
  Замер:

  ```
  $ grep -hoE '<[a-zA-Z]+[^>]*class="[^"]*outline-none[^"]*"[^>]*>' \
      evidence/source/production/pages/*/dom.html | sort -u
  ```

  *(`-h` обязателен при нескольких файлах-аргументах: без него `grep`
  печатает перед каждым совпадением имя файла, `sort -u` перестаёт
  схлопывать одинаковый узел на разных страницах, и та же команда даёт
  64, а не 30 — воспроизводимость поправлена по minor-находке review-1.md;
  число 30 при этом не менялось, оно было верным и раньше)*

  30 уникальных узлов с `outline-none`/`focus:outline-none` в 10 страницах.
  У 20 из них рядом в том же классе стоит `focus-visible:outline
  focus-visible:outline-ui-black-400` (это `Button`/ссылки-кнопки —
  число вхождений `focus-visible:outline` 191, день в день с occurrences
  `Button`, потому что один и тот же узел встречается на разных страницах
  повторно) и у 9 — `focus-within:border-ui-black-850` на родительской
  обёртке (`Select`/`MultiSelect`/`SearchInput`: девять разных `<input>`
  с разными `placeholder`, все с одним и тем же приёмом). Ровно **один**
  узел из тридцати — исключение без какой-либо компенсации: триггер
  `HeaderDropdown` (см. §3.3 ниже). Это единственный кандидат в
  `ui/state-contract.css` из всего `focus-visible` в реестре.
- **`pressed` не входит в это правило.** У него нет браузерного дефолта
  (плоская кнопка без своей `:active`-стилизации визуально не «продавливается»
  ничем нативным), но нет и сломанного дефолта — компонент по-прежнему
  полностью работает без него (клик проходит, просто без обратной связи).
  Utility-класс `active:*` не встречен **ни разу** в 10 страницах (замер
  ниже, §2.1) ни у одной из 4 записей, которым `pressed` обязателен
  (`Button`, `IconButton`, `FilterChip`, `TileFilter`) — единообразный
  пробел, не частный случай одной записи. Это не «компонент не соберётся»
  (METHOD-калибровка задания), а нерешённый вопрос визуального фидбэка —
  GAP каждой записи на её собственном шаге вёрстки, не норматив здесь.

---

## 2. Числа, которыми проверена разметка

### 2.1 Корпус продакшена (10 страниц, 1440)

```
$ grep -o 'hover:[a-zA-Z0-9_-]*' evidence/source/production/pages/*/dom.html | wc -l
1182
$ grep -o 'focus-visible:outline' evidence/source/production/pages/*/dom.html | wc -l
191
$ grep -o 'active:[a-zA-Z0-9_/.\[\]-]*' evidence/source/production/pages/*/dom.html | wc -l
0
$ grep -o 'aria-pressed' evidence/source/production/pages/*/dom.html | wc -l
0
$ grep -o 'readonly' evidence/source/production/pages/*/dom.html | wc -l
0
$ grep -o 'aria-invalid' evidence/source/production/pages/*/dom.html | wc -l
0
$ grep -hoE '<[a-zA-Z]+[^>]*class="[^"]*outline-none[^"]*"[^>]*>' evidence/source/production/pages/*/dom.html | sort -u | wc -l
30
```

Числа `hover`/`focus-visible`/`disabled`/`aria-current`/`swiper-slide-active`
уже посчитаны и процитированы в `STATES.md` §4.1 (R1-01) — не пересчитывались
заново, использованы как принятый факт. Новые для этого шага: `active:` (0),
`aria-pressed` (0), `readonly` (0), `aria-invalid` (0, всё три уже были в
STATES.md, здесь подтверждены повторно тем же прогоном) и полная перепись
узлов с `outline-none` (30, из них 29 компенсированы — новое измерение
шага; пересчитано и исправлено по находке 3 review-1.md — при первом
проходе здесь и в §3.2 по ошибке стояло 32/31, хотя команда прямо над
этим абзацем печатает 30).

### 2.2 Измерение по productionEvidence-селекторам

Разовый скрипт `.pipeline/R1-02/measure-states.mjs` (не гейт, не в `tools/`)
открывает те же 10 `dom.html` тем же браузером без JS, что и
`tools/measure-selectors.mjs`, и для каждой записи с `sourceScope: production`
достаёт `outerHTML` первых узлов, которые находит её собственный
`productionEvidence[].selector`. Он ничего не решает сам — решение по каждой
паре ниже принято глазами по вытащенному тексту, команда воспроизводима:

```
node .pipeline/R1-02/measure-states.mjs > .pipeline/R1-02/dom-dump.json
```

Полный дамп — `.pipeline/R1-02/dom-dump.json` (не документация, рабочий
файл конвейера). Прямые цитаты из него — в §3 построчно.

### 2.3 Storybook (27 отрендеренных story, `_sources/courses/rendered/*.html`)

Прочитаны полностью (файлы 250–1800 байт, не пачка) файлы, относящиеся к
записям со `sourceScope: storybook-only` и к дополнительным story записей
production/figma-only, которые встречаются в Storybook. Находки, которых
не было в `STATES.md`, — построчно в §3.

---

## 3. Разметка по записям (только состояния сверх `default`)

`default` снят у всех 55 записей без исключения — эту часть заново не
перепроверяли: у каждой записи обязан быть хотя бы один evidence
(`productionEvidence`/`storybookEvidence`/`figmaEvidence`), это уже
гарантирует `validate-components.mjs`, и сам факт присутствия узла в
снятом DOM/Storybook/Figma и есть «дефолт». Ниже — только состояния,
которые `STATES.md` объявил обязательными сверх `default`.

### 3.1 Примитивы

| id | Состояние | Снято? | Источник |
|---|---|---|---|
| `social-icon` | `hover` | **снято — продуктовый стиль** | `footer a.block.rounded-full` → `class="block rounded-full hover:opacity-80"`, 10/10 страниц |
| `social-icon` | `focus-visible` | **снято — факт дефолта** | тот же узел: класса `focus-visible:*` нет, `outline-none`/`focus:outline-none` тоже нет — нативный `<a>` сохраняет дефолтный фокус браузера |
| `avatar` | `empty` | **снято** | fallback `career/assets/defaults/avatars/user-*.png` ×15 + `user_avatar_2.svg` ×23, 6/10 страниц (STATES.md §4.1, подтверждено повторно) |
| `entity-logo` | `empty` | **снято** | fallback `avatars/logo.svg` ×10 + `empty-edu-center_2.svg` ×4 (STATES.md §4.1) |
| `link` | `hover` | **снято — продуктовый стиль** | часть корпуса 1182 вхождений `hover:*` (`hover:underline`, `hover:text-*` в футере/каталоге/списках ссылок) |
| `link` | `focus-visible` | **снято — факт дефолта** | ни в одном из проверенных вхождений `<a>` без `.inline-flex.rounded-xl.font-semibold` (то есть не Button, отрисованный как `<a>`) нет ни `focus-visible:*`, ни `outline-none` |
| `button` | `hover` | **снято** | `hover:no-underline hover:opacity-90`, узел `.pipeline/R1-02/dom-dump.json` → `button` |
| `button` | `focus-visible` | **снято** | `focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400` — 191 вхождение, день в день с occurrences Button (STATES.md §4.1) |
| `button` | `pressed` | **не снято** | 0 вхождений `active:*` у Button во всём корпусе (§2.1); GAP собственного шага (R2), не норматив (см. §1) |
| `button` | `disabled` | **снято** | `disabled:pointer-events-none disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white`, 191/191 |
| `icon-button` | `hover` | **снято** | `hover:text-ui-black-850`, узел `button.swiper-button-shadow…` |
| `icon-button` | `focus-visible` | **снято — факт дефолта** | тот же узел без `focus-visible:*`/`outline-none` |
| `icon-button` | `pressed` | **не снято** | нет `active:*`; GAP собственного шага, не норматив |
| `icon-button` | `disabled` | **снято** | буквальный атрибут `disabled=""` ×4 (стрелка `rel="prev"` карусели) + `!text-ui-black-200 !hover:text-ui-black-200` |
| `filter-chip` | `hover` | **снято — факт дефолта** | `button.h-9.rounded-full…`: ни в снятом default- (`bg-ui-white`), ни в snятом selected- (`bg-ui-black-850`) варианте нет `hover:*`/`outline-none`, замерено `.pipeline/R1-02/dom-dump.json` |
| `filter-chip` | `focus-visible` | **снято — факт дефолта** | тот же аргумент |
| `filter-chip` | `pressed` | **не снято** | нет `active:*`; GAP, не норматив |
| `filter-chip` | `selected` | **снято** | прямая выписка: default `class="bg-ui-white border-ui-black-100 … text-ui-black-850"`, selected `class="bg-ui-black-850 text-ui-white border-ui-black-850 …"` — 5 узлов на 5 страницах (`education-center`, `education-centers-listing`, `promocodes`, `reviews`, `schools-for-children`); productionEvidence-селектор требует `.bg-ui-white`, поэтому эти 5 узлов **не входят** в заявленные `occurrences: 107` — расхождение не в объёме этого шага (см. «Долг», §6) |
| `segmented-control` | `hover` | **снято** | `hover:no-underline` на обоих `<a>` сегмента |
| `segmented-control` | `focus-visible` | **снято — факт дефолта** | нет `focus-visible:*`/`outline-none` на сегменте |
| `segmented-control` | `current` | **снято** | `aria-current="page"` + `class="router-link-active router-link-exact-active … bg-ui-black-850"` против default без `bg-*`, 4/4 вхождения (STATES.md §4.1) |
| `tab` | `hover`, `focus-visible`, `selected`, `disabled` | **не снято** | **figma-only**: в снятой публичной части табов нет вовсе (роль играет `FilterChip`); ни один вариант состояния не найден ни в проде, ни в Storybook. GAP собственного шага R3-13 |
| `select` | `hover` | **снято — факт дефолта** | триггер `<input class="cursor-pointer …">` без `hover:*`/`outline-none`, `.pipeline/R1-02/dom-dump.json` → `select` |
| `select` | `focus-visible` | **снято — иная механика** | `focus-within:border-ui-black-850 focus-within:bg-ui-white` на обёртке `<span>`, не `:focus-visible` на самом `<input>` (STATES.md уже фиксирует это как факт, не сглаживание); `<input>` несёт голый `focus:outline-none`, компенсированный этой обёрткой |
| `select` | `open` | **не снято** | открытая раскладка не в DOM ни разу (STATES.md §4.3, повторная проверка не проводилась — R1-01 уже её сделал); GAP адресован решением пользователя 5 (BRIEF §9) и долгом X-14 — интерактивная съёмка на шаге R3-06 |
| `select` | `closed` | **снято** | список нигде не рендерится (SSR и Storybook) — структурное отсутствие узла и есть закрытое состояние (N5) |
| `select` | `disabled` | **снято** | Storybook `forms-basecustomselect--base-story.html`: `disabled:ring-1 disabled:ring-inset disabled:ring-ui-black-500` на самом триггере (`role="combobox" aria-expanded="false"`) |
| `select` | `invalid` | **не снято** | 0 `aria-invalid` в корпусе (§2.1), в Storybook-рендере тоже нет класса невалидности; сама story прямо предупреждает: «В данном компоненте не реализован вывод ошибок, будет добавлено позднее» — GAP шага R3-06, не норматив (нет валидации — компонент всё равно работает как выбор значения) |
| `multi-select` | `hover` | **снято — факт дефолта** | `forms-multiselect--base-story.html`: `<input class="cursor-pointer … focus:outline-none …">` без `hover:*` |
| `multi-select` | `focus-visible` | **снято — иная механика** | тот же файл: `focus-within:border-ui-black-850 focus-within:bg-ui-white` на обёртке `<span>`, тот же приём, что у Select/SearchInput |
| `multi-select` | `checked` | **не снято** | story рендерит только строку поиска, список опций с чекбоксами не раскрыт ни разу — GAP шага R3-07 |
| `multi-select` | `open` | **не снято** | тот же аргумент, что у Select; GAP решения 5 / X-14, шаг R3-07 |
| `multi-select` | `closed` | **снято** | список не отрисован — структурное отсутствие (N5), тот же аргумент, что у Select |
| `multi-select` | `disabled` | **не снято** | в story нет `disabled`-варианта (в отличие от Select, где Storybook его показал) — асимметрия с Select зафиксирована явно, не додумана по аналогии; GAP шага R3-07 |
| `multi-select` | `invalid` | **не снято** | тот же аргумент, что у Select |
| `search-input` | `hover` | **снято — факт дефолта** | реальное поле `input[placeholder="Искать на Хабр Курсах"]`, класс без `hover:*` |
| `search-input` | `focus-visible` | **снято — иная механика** | тот же узел: обёртка `<span class="… focus-within:border-ui-black-850 focus-within:bg-ui-white border-ui-black-100 rounded-xl">` — идентичный приём Select/MultiSelect, прямая выписка `courses-listing/dom.html` |
| `search-input` | `disabled` | **снято — факт дефолта** | нативный `disabled` на `<input>` не встречен ни разу в 10 страницах, но при появлении сработает браузерный дефолт (нередактируемое, приглушённое поле) без необходимости кастомного правила — работоспособность не зависит от него |
| `text-input` | `hover`, `focus-visible`, `disabled`, `readOnly`, `invalid` | **не снято** | **figma-only**: форм в публичной части нет вовсе (`accessibilityPolicy`: 0 `label`/`form`/`select`/`textarea`). Ни продуктового CSS, ни Storybook — GAP шага R3-09, откуда и придёт первая настоящая реализация |
| `checkbox` | `hover` | **не снято** | **storybook-only**: `common-basecheckbox--base-checkbox-story.html` (437 байт) рендерит только `<span class="base-checkbox__button">` без единой utility-модификации, а CSS-чанк, найденный для остальных состояний ниже (`similar-courses.DqXT-MW0.css`), не содержит ни одного правила `.base-checkbox*:hover`. Досъёмка — предмет шага R3-10, не этого |
| `checkbox` | `focus-visible` | **снято — иная механика** | *(исправлено по находке 1 review-1.md; ранее ошибочно значилось «не снято, чанка нет в evidence»)* `evidence/source/production/css/external/similar-courses.DqXT-MW0.css` → `.base-checkbox__input:focus+.base-checkbox__button{border-color:var(--color-ui-black-400)}` — реальный `:focus` (не `:focus-visible`), но визуальное изменение есть (смена цвета рамки на тот же токен, что несёт норматив `HeaderDropdown`); тот же приём смягчения, что принят для `select`/`multi-select`/`search-input` через `focus-within` (§3.1 выше), только здесь компенсация через соседний `:focus` на скрытом `<input>`, а не через `focus-within` на обёртке |
| `checkbox` | `checked` | **снято — продуктовый стиль** | *(исправлено по находке 1 review-1.md)* тот же чанк → `.base-checkbox__input:checked+.base-checkbox__button{background-color:var(--color-ui-black-850);background-image:url(…svg-галочка…);border-color:var(--color-ui-black-850)}` — явный класс состояния с собственным фоном, иконкой и цветом рамки |
| `checkbox` | `indeterminate` | **не снято** | ни в этом чанке, ни в остальном корпусе `evidence/source/production/css/` нет правила для `:indeterminate`/`[aria-checked="mixed"]` у `.base-checkbox*`; Storybook-story тоже не рендерит этот вариант. Досъёмка — предмет шага R3-10 |
| `checkbox` | `disabled` | **снято — продуктовый стиль** | *(исправлено по находке 1 review-1.md)* тот же чанк → `.base-checkbox--disabled{opacity:.5}` и `.base-checkbox__wrapper--disabled{cursor:not-allowed}` — два явных модификатора состояния |
| `switch` | `hover` | **снято** | `common-baseswitch--base-switch-story.html`: `enabled:group-hover:bg-ui-black-50` на кастомном треке |
| `switch` | `focus-visible` | **снято** | тот же файл: `peer-focus-visible:outline` на треке (управляется скрытым нативным `<input type="checkbox">` через `peer`); цвет не переопределён — рисуется дефолтным `outline-color`, это не то же самое, что `outline-none` без замены, поэтому не норматив |
| `switch` | `checked` | **снято** | тот же файл: `peer-checked:bg-ui-black-850 peer-checked:after:bg-ui-white peer-checked:after:translate-x-4`, буквально в разметке обоих вариантов лейбла |
| `switch` | `disabled` | **не снято** | в отрендеренной story нет `disabled:*`/`peer-disabled:*` вовсе — GAP шага R3-11 |
| `tile-filter` | `hover`, `focus-visible` | **не снято** | ни в `common-basefilterwithimage--default.html`, ни в `--active.html` нет `hover:*`/`focus-visible:*`; узел — обычная `<button>` без сброса дефолтного фокуса, но требуемое `hover` тоже не находит продуктового стиля в этих двух story — GAP шага R3-12 |
| `tile-filter` | `pressed` | **не снято** | нет `active:*`; GAP, не норматив (§1) |
| `tile-filter` | `selected` | **снято** | сравнение двух story: default `bg-ui-white border-ui-black-100 text-ui-black-850`, story `--active` (по словарю задания — `selected`, не `active`) `bg-ui-blue-50 border-ui-blue-300 text-ui-blue-500` |
| `tile-filter` | `disabled` | **не снято** | ни в одной из двух story нет `disabled`-варианта; GAP шага R3-12 |
| `pagination` | `hover`, `focus-visible`, `current`, `disabled` | **не снято** | **figma-only**: в проде листания нет вовсе (вместо него `Button` «Показать ещё 20», уже зафиксировано в `STATES.md`/`notes`); ни один вариант состояния не подтверждён. GAP шага R3-14 |
| `breadcrumbs` | `hover`, `focus-visible`, `current` | **не снято** | **figma-only**, в снятой разметке крошек как списка ссылок нет (проверено на `/education_centers/35-yandeks-praktikum`, см. `manifest.json` → `notes`); GAP шага R3-15, там же по тексту записи и назван |

### 3.2 Модули (только записи с состояниями сверх `default`)

| id | Состояние | Снято? | Источник |
|---|---|---|---|
| `header-dropdown` | `hover` | **снято — факт дефолта** | триггер `<button type="button" class="font-inherit … text-ui-white outline-none">` не несёт `hover:*`; отсутствие явного стиля здесь не ломает ничего (у hover нет дефолта, который можно сломать, см. §1) |
| `header-dropdown` | `focus-visible` | **не снято — норматив (`ui/state-contract.css`)** | тот же узел, буквально на 10/10 страниц: `outline-none` **без** `focus-visible:*` и без обёрточной `focus-within:*` — единственный такой узел во всём корпусе из 30 найденных `outline-none` (§2.1; пересчитано и исправлено по находке 3 review-1.md — здесь ошибочно стояло 32). Дефолт браузера явно снят и ничем не заменён — компонент в этой части не собрать без явного правила. См. §4 |
| `header-dropdown` | `open` | **не снято** | панель пуста и в SSR (`hidden`, пустые секции), и в Storybook story `header-headerdropdown--header-dropdown-story.html` (тот же пустой `<div>`); GAP решения 5 / X-14, интерактивная съёмка — шаг R4-02 |
| `header-dropdown` | `closed` | **снято** | класс `hidden` буквально на узле панели, 10/10 страниц (`manifest.json` → `notes` уже фиксирует это; здесь подтверждено прямой цитатой) |
| `card-grid` | `empty` | **не снято** | ни на одной из 10 страниц нулевой выдачи нет (STATES.md §4.4); пустая сетка из 0 карточек не ломает раскладку сама по себе (CSS grid с 0 детьми схлопывается корректно) — недостающее здесь не CSS-механика, а состав (чем заменить сетку, `EmptyState`), а `EmptyState` сам ещё не подтверждён в проде (figma-only, шаг R4-14). Норматив сейчас не пишется — не CSS-блокировка, а вопрос состава, решаемый на шаге R4-08 вместе с `EmptyState` |
| `carousel` | `current` | **снято** | `swiper-slide-active`, 16 вхождений — день в день с occurrences Carousel (STATES.md §4.1) |
| `link-grid` | `expanded` | **не снято — норматив (`ui/state-contract.css`)** | `aria-expanded` — 0 вхождений в корпусе (STATES.md §4.1); кнопка «Смотреть все» есть (5/5 вхождений `max-h-[94px]`), но раскрытый вид нигде не отрисован. В отличие от оверлеев (§ выше), здесь недостающее — чисто структурная механика (снять зажим высоты), без единого нового цвета или размера: без неё кнопка визуально ничего не делает при клике, то есть модуль не собрать даже в черновом виде. См. §4 |
| `link-grid` | `collapsed` | **снято** | `div.overflow-hidden.max-h-[94px]` — буквальный класс на обёртке, это и есть состояние по умолчанию (совпадает с `default`, зафиксировано в `STATES.md`) |
| `filter-modal` | `open` | **не снято** | обе story (`common-basefiltermodal--default.html`, `common-basefiltermodalnew--default.html`) рендерят только кнопку-триггер и пустой `<div id="modal-target">` — модалка не смонтирована ни разу; открытая разметка есть только в виде узла Figma (`14613:211399`/`6dc70fb1…`, без сохранённого снимка на диске). GAP решения 5 / X-14, шаг R4-12, откуда и берётся Figma-разметка (`manifest.json` → `notes`) |
| `filter-modal` | `closed` | **снято** | тот же рендер: `<div id="modal-target"></div>` пуст в обеих story — структурное отсутствие узла и есть закрытое состояние |
| `catalog-menu` | `open` | **не снято** | **figma-only** целиком — компонента нет ни в проде, ни в Storybook. GAP решения 5 / X-14, шаг R4-13 |
| `catalog-menu` | `closed` | **снято тривиально** | отсутствие узла в продакшене — вырожденный случай «закрыто» (компонента нет вовсе, а не «есть и скрыт», как у HeaderDropdown/FilterModal); качество факта ниже, чем у тех двух записей, отмечено явно, не уравнено с ними |
| `course-card` | `hover` | **снято — факт дефолта** | оверлейный `<a class="z-2 absolute bottom-0 left-0 right-0 top-0">` (STATES.md §4.4) не несёт `hover:*`; ничего не сброшено |
| `course-card` | `focus-visible` | **снято — факт дефолта** | тот же узел: нативный `<a>`, ни `focus-visible:*`, ни `outline-none` |
| `school-card` | `hover` | **снято — факт дефолта** | оверлейный `<a class="z-1 absolute bottom-0 left-0 right-0 top-0">` без `hover:*` |
| `school-card` | `focus-visible` | **снято — факт дефолта** | тот же узел без сброса дефолтного фокуса |
| `article-card` | `hover` | **снято — факт дефолта** | оверлейный `<a class="z-2 absolute bottom-0 left-0 right-0 top-0">` (селектор записи нарочно исключает `.cursor-pointer`-реализацию — см. STATES.md §4.4) без `hover:*` |
| `article-card` | `focus-visible` | **снято — факт дефолта** | тот же узел |
| `person-card` | `hover` | **снято — факт дефолта** | оверлейный `<a href="/courses/authors/…" class="z-2 absolute bottom-0 left-0 right-0 top-0">` без `hover:*` |
| `person-card` | `focus-visible` | **снято — факт дефолта** | тот же узел |
| `rating-table` | `hover` | **снято — продуктовый стиль** | строка `<a class="grid … hover:cursor-pointer hover:bg-ui-black-50 hover:no-underline …">` (STATES.md §4.4, здесь процитировано целиком) |
| `rating-table` | `focus-visible` | **снято — факт дефолта** | та же строка: нативный `<a>`, ни `focus-visible:*`, ни `outline-none` |
| `promo-card` | `hover` (ослаблено) | **снято — слабый факт** | на корне `div.cursor-pointer` нет ни `<a>`/`<button>`, ни `hover:*` — только курсор-аффорданс; видимого изменения при наведении на сам модуль нет (реальный `hover` несёт вложенная кнопка «Открыть код», это её собственное состояние, не PromoCard, см. правило «без задвоения» STATES.md §2). Названо явно как слабый факт, не приравнено к `course-card`/`school-card` |
| `review-card` | `hover` (ослаблено) | **снято — слабый факт** | на корне нет `<a>`/`<button>`; настоящий `hover:bg-ui-black-100` найден на вложенном `<div>`-плашке (STATES.md §4.4) — состояние вложенного узла, не корня ReviewCard |
| `ad-card` | `hover` (ослаблено) | **снято — слабый факт** | корень `div.cursor-pointer`, внутри только два `<img>` и вложенный `IconButton` закрытия — на корне нет ни `<a>`/`<button>`, ни `hover:*` |

### 3.3 HeaderDropdown.focus-visible — разбор единственного нормативного случая

Полная цепочка, чтобы решение не читалось как одна цитата вне контекста:

1. Триггер найден буквально на 10/10 страниц (`header div` перед узлом
   `.absolute.-right-10…`, тот же родитель, что у productionEvidence
   HeaderDropdown): `<button type="button" class="font-inherit inline-flex
   h-6 cursor-pointer items-center rounded-none border-0 bg-transparent p-0
   px-1 text-ui-white outline-none">`.
2. `outline-none` — Tailwind-утилита, эквивалент `outline: 2px solid
   transparent; outline-offset: 2px` (видимый контур убран).
3. Ни на этом узле, ни на родителях нет `focus-visible:*`-утилиты и нет
   `focus-within:*` (в отличие от Select/MultiSelect/SearchInput, где
   `focus:outline-none` на `<input>` каждый раз компенсирован
   `focus-within:border-*` на обёртке).
4. Из 30 узлов корпуса с `outline-none`/`focus:outline-none` (§2.1) это
   единственный без компенсации — 20 остальных это Button/ссылка-кнопка
   с парной `focus-visible:outline focus-visible:outline-ui-black-400`,
   ещё 9 — поля выбора с `focus-within:border-ui-black-850` на родителе.
5. Правило CSS не переопределяется извне: в captured
   `evidence/source/production/css/inline/*.css` нет ни одного глобального
   `*:focus-visible{...}` (проверено, §2.1), только точечные
   `.focus-visible\:outline:focus-visible{outline-style:solid}` и
   `.focus-visible\:outline-ui-black-400:focus-visible{outline-color:var(--color-ui-black-400)}`
   — то есть у этого узла в реальности **нет никакого** видимого
   индикатора фокуса ни в одном состоянии.

Это ровно случай, для которого задание просит писать норматив: дефолт не
просто отсутствует (как у `hover` везде или у `focus-visible` там, где
`outline-none` вовсе нет) — он **снят явно и не заменён**, и без замены
модуль не проходит даже базовое требование клавиатурной доступности,
уже объявленное обязательным в его собственном `requiredStates` (N1).
Решение — `ui/state-contract.css` переносит **ровно тот же приём**, что
уже используется для `Button` (`outline-style: solid` +
`outline-color: var(--color-ui-black-400)`), не изобретая новое значение.

---

## 4. Что записано в `ui/state-contract.css`

Только два случая прошли проверку «без явного правила компонент не
собрать вообще» (§1, §3.3), оба — чистая структурная механика без единого
изобретённого числа или цвета сверх уже снятых токенов/приёмов продукта:

1. **`HeaderDropdown` — видимый фокус триггера.** `outline-style: solid` +
   `outline-color: var(--color-ui-black-400)` — токен уже существует в
   `ui/tokens.css`, приём буквально скопирован с `Button` (§3.3).
2. **`LinkGrid` — снятие зажима высоты в раскрытом виде.** `max-height:
   none` при раскрытии — обратная сторона уже снятого `overflow-hidden
   max-h-[94px]` (default/`collapsed`), без единого нового значения.

Оба правила помечены в файле как **новая реализация** и не заменяют
предмет собственного шага вёрстки (`R4-02`, `R4-10`) — тот шаг вправе
уточнить селектор (класс компонента вместо временного `crs-*`-якоря) и
добавить то, что здесь сознательно не решается (переход/анимация,
контент раскрытой панели).

### Что не попало в норматив, хотя состояние не снято, — и почему

| Состояние | Почему не норматив |
|---|---|
| `pressed` у `Button`/`IconButton`/`FilterChip`/`TileFilter` | нет ни продуктового стиля, ни сломанного дефолта — компонент полностью работает без него (§1) |
| `open` у `Select`/`MultiSelect`/`FilterModal`/`CatalogMenu` | недостающее — не CSS-механика показать/скрыть (она тривиальна, снятие класса `hidden`), а **всё содержимое панели**, которого нет ни в одном источнике; проектное решение (`manifest.json` → `notes`) явно поручает эту раскладку Figma **на шаге вёрстки записи** (R3-06/R3-07/R4-12/R4-13), не этому шагу. Писать её сейчас — значит придумывать структуру, а не снимать факт (прямой запрет METHOD §4) |
| `open` у `HeaderDropdown` | в отличие от четырёх записей выше, собственная визуальная оболочка панели (рамка, радиус, тень, позиционирование) **уже снята** в проде на том же узле, что несёт `hidden` (см. §3.1 `closed`) — механика открытия исчерпывается снятием класса `hidden`, а это поведенческий/разметочный вопрос (ARIA-слой), который решение пользователя 3 в `BRIEF.md` §9 прямо выводит из `state-contract.css` («нормативный ARIA-слой не дописывается») |
| `empty` у `CardGrid` | вопрос состава (чем заменить сетку), не CSS-блокировка; решается вместе с `EmptyState` на R4-08 |
| `checked`/`disabled`/`invalid`/`indeterminate`/`readOnly` у полей форм (`Select.invalid`, `MultiSelect.checked/disabled/invalid`, `TextInput.*`, `Checkbox.indeterminate`, `Switch.disabled`, `TileFilter.*`, `Pagination.*`, `Breadcrumbs.*`, `Tab.*`) | компонент собирается и работает без визуального представления этих состояний — недостающее снижает качество обратной связи, но не блокирует сборку; собственный шаг вёрстки решает точным цветом/классом продукта (когда он появится) или Figma, а не этот шаг вслепую. (`Checkbox.checked`/`Checkbox.disabled`/`Checkbox.focus-visible` сюда больше не входят — переклассифицированы в «снято», см. §3.1 и находку 1 review-1.md) |

---

## 5. Как это соотносится с exit criteria волны R1

Формулировка ROADMAP.md — «для каждого состояния сказано, снято оно или
дописано» — закрыта для **всех 147 пар** (запись × `requiredStates`,
55 `default` + 92 прочих). Пересчитано машиной по `.pipeline/R1-02/decisions.json`
(решение по каждой из 92 пар, сверено с `manifest.json` → `requiredStates`,
без пропусков — скрипт ниже padает, если решение для пары не названо):

```
$ node -e '... см. .pipeline/R1-02/capture.md §7 ...'
total non-default pairs: 92
{ "captured-style": 26, "captured-default": 20, "captured-mechanism": 4,
  "captured-weak": 3, "captured-trivial": 1, "normative": 2, "gap": 36 }
missing decisions: []
```

*(Числа исправлены по находкам 1 и 2 review-1.md — итерация 1. Находка 2:
арифметическая ошибка, `24+20+3+3+1` было названо равным 71, реальная
сумма — 51, `node -e "console.log(24+20+3+3+1)"` → 51. Находка 1:
`checkbox.checked`/`checkbox.disabled` переклассифицированы `gap` →
`captured-style`, `checkbox.focus-visible` — `gap` → `captured-mechanism`
(§3.1), что само по себе меняет бакеты `captured-style` 24→26,
`captured-mechanism` 3→4, `gap` 39→36. Пересчитано заново после обеих
правок: `node -e "console.log(26+20+4+3+1)"` → **54**.)*

54 из 92 пар (26 + 20 + 4 + 3 + 1) снято в одной из форм §1 (продуктовый
стиль, факт дефолта, иная механика, ослабленный факт, тривиальный факт),
2 пары дописаны нормативом (§4). Оставшиеся **36 пар** (см. таблицы
§3.1–3.2, столбец «не снято») **не получили** строки в `state-contract.css`
— решение осознанное, а не пропуск: писать CSS без единого снятого или
хотя бы наблюдённого в Figma значения означало бы нарушить METHOD §4
(«правдоподобная догадка, выданная за факт продукта, — провал шага»)
и прямое требование задания не раздувать файл тем, что не является
пробелом. Каждая из 36 пар адресована поимённо — названы её запись,
состояние и шаг, на котором она получит настоящее решение (R2 —
`pressed` трёх компонентов; R3-06…R3-15; R4-02, R4-08, R4-12…R4-14), и
это совпадает с уже принятым решением пользователя 5 (BRIEF §9) и
долгом X-14, а не изобретено этим шагом заново. Формально это не третий
исход по тексту критерия, а раскрытие второго («дописано» здесь означает
«дописано там, где дописать — факт, а не догадка»); там, где дописать
было бы догадкой, состояние остаётся явно адресованным GAP с именем и
шагом, а не тихо пропущено. Это расхождение с буквальным прочтением
критерия — решение, принятое на этом шаге в рамках прямо данного
задания «не раздувать state-contract.css»; оно вынесено на подтверждение
приёмки (`guide-review`/`guide-accept`), а не тихо закрыто как факт.

---

## 6. Долг, обнаруженный этим шагом (не внесён в ROADMAP.md)

- **`filter-chip.productionEvidence[0].selector` занижает `occurrences`.**
  Селектор требует классы `.bg-ui-white.border-ui-black-100`, которые есть
  только у невыбранного чипа; 5 выбранных чипов (`bg-ui-black-850
  border-ui-black-850`, по одному на `education-center`,
  `education-centers-listing`, `promocodes`, `reviews`,
  `schools-for-children`) этим селектором не находятся. Заявлено
  `occurrences: 107/5`, фактическое число всех состояний чипа — не менее
  112. Не поправлено в этом шаге: `manifest.json` → `productionEvidence`
  и `occurrences` — предмет R1-01 (принят, `4fe1bf5`) или отдельной
  правки счёта, не разметки состояний.
- **Расхождение адреса GAP `LinkGrid.expanded` между `.pipeline/R1-01/capture.md`
  и `manifest.json`.** Протокол R1-01 указывал «перепроверить на шаге
  вёрстки LinkGrid (R5)», при этом `manifest.json` → `link-grid.step`
  всегда был `R4-10` (волна R4, не R5) — R5 в ROADMAP.md не про LinkGrid.
  В этом файле (§3.2, §4) используется `R4-10` как авторитетный источник
  (машиночитаемый реестр, сверяемый `validate-components.mjs` с
  ROADMAP.md); формулировка `.pipeline/R1-01/capture.md` не правилась —
  это чужой протокол прошлого шага, а не предмет этого.
- **`TileFilter`/`Switch.disabled` не имеют captured CSS-чанка в
  `evidence/`.** Их Storybook-рендер статичен (готовый HTML) и не
  показывает нужный вариант, а собственных utility-классов состояния или
  BEM-чанков для этих записей нет ни в `evidence/source/production/css/`
  (проверено по всему корпусу, `inline/` и `external/`), ни отдельным
  файлом в `_sources/courses`. Первая настоящая досъёмка — задача шагов
  R3-11/R3-12, не этого.
  **Поправка по находке 1 review-1.md:** `Checkbox` раньше стоял в этом
  же пункте — это было неверно. `evidence/source/production/css/external/similar-courses.DqXT-MW0.css`
  содержит рабочий BEM-чанк `base-checkbox__*` с правилами для `checked`,
  `disabled` и (соседним `:focus`) `focus-visible` — переклассифицировано
  в §3.1. Проверено, что этот чанк не пропущен для других записей
  манифеста тем же способом: `base-checkbox` встречается только в этом
  одном файле корпуса, а среди заметок `storybookEvidence[].note` всех
  55 записей манифеста BEM-классы (`base-[a-z]+__`) упомянуты только у
  `checkbox` — собственная заметка записи и называет его «единственным
  BEM-компонентом». Других пропущенных по аналогии записей не найдено.
  Для `checkbox` остаются `gap` только `hover` (в чанке нет ни одного
  `:hover`-правила для `.base-checkbox*`) и `indeterminate` (нет ни
  `:indeterminate`, ни `[aria-checked="mixed"]`).
- **Тот же чанк содержит классы, похожие на механику `CatalogMenu.open`
  — не проверено этим шагом.** `similar-courses.DqXT-MW0.css` (найден
  при проверке находки 1) несёт `.header-catalog__icon-item--hidden`
  (поворот/масштаб иконки-гамбургера) и Vue-переходы
  `.header-catalog-menu-enter-active/-leave-active/-enter-from/…` — по
  имени это открытие/закрытие каталога направлений. Запись `catalog-menu`
  сейчас числится `sourceScope: figma-only` с `open` как GAP
  («компонента нет ни в проде, ни в Storybook») — но CSS для неё в
  продовой сборке, похоже, есть, просто без пойманного в `dom.html`
  DOM-узла. Не переклассифицировано этим шагом (не входит в объём
  находки 1 — там только `Checkbox`); проверить на шаге вёрстки
  `CatalogMenu` (R4-13).
- **Невоспроизводимая команда, унаследованная из `STATES.md`.**
  `grep -o 'focus-visible:outline' … | wc -l` → 191 (`STATES.md:225`,
  R1-01, принят `4fe1bf5`; процитировано выше в §2.1 как принятый факт).
  Число верно (день в день с `occurrences` Button), но сама команда без
  учёта границы токена считает подстроку `focus-visible:outline` дважды
  на каждом узле, где следом идёт `-ui-black-400` — буквальный повтор
  команды на этом корпусе даёт 382. Найдено ревью (`review-1.md`, доп.
  находка, minor), не в объёме этого шага — `STATES.md` чужой файл,
  правка команды (не числа) — предмет R1-01 или её долга.

---

## 7. Дополнение 11 сентября 2026: шестнадцать figma-only записей

Решением владельца в реестр заведены 16 компонентов макета, которых в
продукте нет — двенадцать первым заходом и четыре вторым (`components/STATES.md` §4, строки с пометкой «добавлена
11 сентября 2026»). Правило разметки то же, что у прежних figma-only
записей (`tab`, `pagination`, `breadcrumbs`): `default` — нарисованный
в макете вид — считается снятым источником; всё сверх него **не снято**,
даже если макет его рисует, потому что снятым здесь называется то, что
подтверждено продуктом или Storybook. Норматива в `ui/state-contract.css`
не добавлено.

Девять из шестнадцати записей имеют состояния сверх `default` — 23 пары
(разметка ниже частично пересмотрена в §8 — там, где макет состояние рисует):

| Запись | Состояния | Исход | Основание |
|---|---|---|---|
| `button-group` | `hover`, `focus-visible`, `selected` | **не снято** | **figma-only**: вариант onpage в продукте не встречается; в макете нарисован один выбранный сегмент, наведение и фокус не нарисованы. Шаг R3-16 |
| `tooltip` | `open`, `closed` | **не снято** | **figma-only**: плашка гидрируется по наведению и в снятой разметке отсутствует; в макете нарисована открытой. Шаг R3-18 |
| `sort-sheet` | `open`, `closed` | **не снято** | **figma-only**: открытая шторка нарисована в макете (свёрстана по нему), но не снята — в продукте оверлей гидрируется. Шаг R4-17 |
| `price-sheet` | `open`, `closed` | **не снято** | **figma-only**: то же, что у SortSheet. Шаг R4-18 |
| `faq-item` | `hover`, `focus-visible`, `expanded`, `collapsed` | **не снято** | **figma-only**: раздела профессий в продукте нет; в макете нарисован раскрытый вопрос, свёрнутого варианта и наведения нет. Шаг R4-19 |
| `learning-step` | `hover`, `focus-visible`, `expanded`, `collapsed` | **не снято** | **figma-only**: раздела профессий в продукте нет; в макете нарисован свёрнутый шаг, раскрытого варианта нет. Шаг R4-20 |
| `page-toc` | `hover`, `focus-visible` | **не снято** | **figma-only**: оглавлений в продукте нет; в макете наведение и фокус не нарисованы. Шаг R3-19 |
| `mobile-menu` | `open`, `closed` | **не снято** | **figma-only**: в продукте мобильная шапка устроена иначе, бургера и меню нет; открытое меню нарисовано в макете и свёрстано по нему. Шаг R4-22 |
| `promo-code-modal` | `open`, `closed` | **не снято** | **figma-only**: триггер «Открыть код» в продукте есть (16 на странице промокодов), модалка гидрируется и не снята. Шаг R5-17 |

У семи остальных (`specialization-tag`, `demand-chart`, `loader`,
`feedback-form`, `profession-card`, `vacancy-card`, `faq-block`)
`requiredStates` — один `default`.

Итог по реестру после дополнения — **186 пар** «запись × состояние»:
147 сняты источником, 2 дописаны нормативом, 37 не сняты и адресованы
поимённо. Числа §5 описывают 55 записей на момент R1-02 и не
переписываются: прибавка — ровно 39 пар, 16 из них `default`; пересмотр §8 перевёл часть остальных в снятые.

---

## 8. Пересмотр 11 сентября 2026: состояния, которые рисует макет

**Четвёртый исход — «снято — узел макета».** На R1-02 все состояния
figma-only записей ушли в «не снято»: узлы библиотеки `education-lib` не
читались, и сверять было не с чем. С тех пор записи свёрстаны по узлам
рабочего файла `02_Education-NEW`, и многие их состояния нарисованы там
прямо — выбранный сегмент, текущая страница, открытая шторка, свёрнутый
вопрос — или заданы переменной (`elements/tab/border_hover`). METHOD §4
называет узел Figma источником факта наравне с DOM и CSS сборки, поэтому
такие пары переходят в снятые с цитатой узла. Где макет состояния не рисует
и переменной нет, пара остаётся «не снято» — вёрстка по конвенции фактом не
считается.

Там же поправлена запись `text-input`: 11 сентября она переехала из
figma-only в production, а её пары остались размечены по-старому («форм в
публичной части нет»). По правилу §1 у продуктового поля `hover` снят
фактом дефолта, `focus-visible` — иной механикой, как у `Select`.

Строки ниже отменяют строки §3.1 и §7 по тем же парам: при сведении
разметки к записи (`gen-states.mjs`) действует последняя строка файла.

| Запись | Состояние | Исход | Основание |
|---|---|---|---|
| `tab` | `hover` | **снято — переменная макета** | переменная `elements/tab/border_hover` = `#dededf` (узел …15089:302655) — рамка при наведении; на витрине живое |
| `tab` | `focus-visible` | **не снято** | макет фокус не рисует и переменной фокуса у вкладки нет. Шаг R3-13 |
| `tab` | `selected` | **снято — узел макета** | …15089:302655 — выбранный вариант-выпадашка: `#eff5ff`, рамка `#94bdfc`, текст `#346ef4`; свёрстан в блоке default выше |
| `tab` | `disabled` | **не снято** | отключённой вкладки в макете нет, переменной тоже. Шаг R3-13 |
| `pagination` | `hover` | **снято — узел макета** | 9909:29791 — страница «2» нарисована в наведении, `elements/pagination/fill_hover` = `#f1f1f1`; на витрине живое |
| `pagination` | `focus-visible` | **не снято** | макет фокус не рисует. Шаг R3-14 |
| `pagination` | `current` | **снято — узел макета** | 9909:29791 — страница «1» выделена: `#eff5ff`, рамка `#94bdfc`, текст `#346ef4`; свёрстана в блоке default выше |
| `pagination` | `disabled` | **снято — узел макета** | 9909:29791 — левая стрелка бледнее правой, `elements/button/icon_disable` = `#d3d3d4`; свёрстана в блоке default выше |
| `breadcrumbs` | `hover` | **не снято** | макет наведение не рисует. Шаг R3-15 |
| `breadcrumbs` | `focus-visible` | **не снято** | макет фокус не рисует. Шаг R3-15 |
| `breadcrumbs` | `current` | **не снято** | в узле 9902:39188 все четыре крошки одного цвета `#909194` — текущая не выделена ничем. Шаг R3-15 |
| `filter-modal` | `open` | **снято — узел макета** | 14613:211399 — открытая модалка; вся секция выше — это состояние |
| `catalog-menu` | `open` | **снято — узел макета** | 14644:221758, 14657:224732, 14657:224294 — раскрытый каталог для взрослых, для детей и кадр 320; вся секция выше — это состояние |
| `button-group` | `hover` | **не снято** | макет наведение не рисует. Шаг R3-16 |
| `button-group` | `focus-visible` | **не снято** | макет фокус не рисует. Шаг R3-16 |
| `button-group` | `selected` | **снято — узел макета** | 14644:221762 — выбранный сегмент белый с тенью `Dropdown`; свёрстан в блоке default выше |
| `tooltip` | `open` | **снято — узел макета** | 11025:93606 — открытая подсказка «Партнер Хабра»; свёрстана в блоке default выше |
| `tooltip` | `closed` | **снято — продуктовый стиль** | закрытая подсказка — это триггер без плашки: `img.v-popper--has-tooltip` «Партнер Хабра» стоит в снятой разметке, 6 узлов в листинге и 8 в рейтинге |
| `sort-sheet` | `open` | **снято — узел макета** | 9356:50311 — открытая шторка с затемнением; свёрстана в блоке default выше |
| `sort-sheet` | `closed` | **не снято** | кадр с закрытой шторкой не читался — кнопка сортировки на нём не сверена. Шаг R4-17 |
| `price-sheet` | `open` | **снято — узел макета** | 9356:52508 — открытая шторка; свёрстана в блоке default выше |
| `price-sheet` | `closed` | **не снято** | кадр с закрытой шторкой не читался. Шаг R4-18 |
| `faq-item` | `hover` | **не снято** | макет наведение не рисует. Шаг R4-19 |
| `faq-item` | `focus-visible` | **не снято** | макет фокус не рисует. Шаг R4-19 |
| `faq-item` | `expanded` | **снято — узел макета** | 14394:193667 — раскрытый вопрос с ответом, шеврон вверх; свёрстан в блоке default выше |
| `faq-item` | `collapsed` | **снято — узел макета** | 12194:79328 — свёрнутый вопрос в «СЕО-блок / FAQ», шеврон вниз; образец ниже |
| `learning-step` | `hover` | **не снято** | макет наведение не рисует. Шаг R4-20 |
| `learning-step` | `focus-visible` | **не снято** | макет фокус не рисует. Шаг R4-20 |
| `learning-step` | `expanded` | **не снято** | раскрытого шага в макете нет. Шаг R4-20 |
| `learning-step` | `collapsed` | **снято — узел макета** | 14475:194581 — свёрнутый шаг, шеврон вниз; свёрстан в блоке default выше |
| `page-toc` | `hover` | **снято — продуктовый стиль** | базовое правило `a:hover{text-decoration:underline}` слоя `ui/foundations.css` (R0-03) действует на ссылки оглавления — своего правила у записи нет |
| `page-toc` | `focus-visible` | **снято — факт браузерного дефолта** | ссылка без `outline-none`, базовый слой фокус не объявляет и не сбрасывает — работает фокус браузера |
| `mobile-menu` | `open` | **снято — узел макета** | 9084:14961 — открытое меню; свёрстано в блоке default выше |
| `mobile-menu` | `closed` | **не снято** | кнопки меню в мобильной шапке продукта нет, закрытого кадра в макете не найдено. Шаг R4-22 |
| `promo-code-modal` | `open` | **снято — узел макета** | 11061:82849 — открытая модалка; свёрстана в блоке default выше |
| `promo-code-modal` | `closed` | **снято — продуктовый стиль** | закрытая модалка — это кнопка «Открыть код» на `PromoCard`: 16 узлов на странице промокодов |
| `text-input` | `hover` | **снято — факт браузерного дефолта** | класса `hover:*` на поле нет — нативный hover ничего не меняет и ничем не сломан (правило §1) |
| `text-input` | `focus-visible` | **снято — иная механика** | `focus-within:border-ui-black-850` на обёртке при `focus:outline-none` на самом поле — тот же механизм, что у `Select` и `SearchInput` |
| `text-input` | `disabled` | **не снято** | ни одного отключённого поля в снятой разметке. Шаг R3-09 |
| `text-input` | `readOnly` | **не снято** | ни одного поля только для чтения в снятой разметке. Шаг R3-09 |
| `text-input` | `invalid` | **не снято** | ни одного невалидного поля в снятой разметке. Шаг R3-09 |

### 8.1. Pagination в production, IconButton без disabled (11 сентября 2026)

Сборка страницы `/courses` из записей реестра (R6-01) нашла пагинацию в
продукте: под сеткой выдачи на четырёх листингах. Запись переклассифицирована
из figma-only в production — строки ниже отменяют её строки §3.1 и §8 выше.

Там же вскрылась ошибка атрибуции. Состояние `disabled` у `IconButton`
было снято по четырём узлам `button[disabled][rel="prev"]` как «стрелке
карусели у левой границы». Это стрелка «назад» пагинации: селектор
`IconButton` — стрелки Swiper (`button.swiper-button-shadow`), атрибута
`rel` у них нет, а отключение Swiper ставит рантайм-классом
`swiper-button-disabled`, которого в SSR-разметке нет. Доказательство
перешло к `Pagination`, у `IconButton` пара `disabled` стала «не снято».

| Запись | Состояние | Исход | Основание |
|---|---|---|---|
| `pagination` | `hover` | **снято — продуктовый стиль** | `hover:bg-ui-black-50` у номеров и `hover:text-ui-black-850` у стрелок, 4 узла на 4/10 страниц |
| `pagination` | `focus-visible` | **снято — факт браузерного дефолта** | у ссылок-номеров и кнопки-стрелки нет ни `outline-none`, ни своего кольца — работает фокус браузера (правило §1) |
| `pagination` | `current` | **снято — продуктовый стиль** | `border-ui-blue-300 bg-ui-blue-50` у номера текущей страницы, 4 из 4; синий цвет номера даёт базовое правило ссылки, класс `color-ui-blue-500` на узле не объявлен |
| `pagination` | `disabled` | **снято — продуктовый стиль** | `button[disabled][rel="prev"]` с `!text-ui-black-200` на первой странице, 4 из 4 |
| `icon-button` | `disabled` | **не снято** | четыре узла, которыми пара была снята, — стрелки `Pagination`; у стрелок Swiper отключение — рантайм-класс `swiper-button-disabled`, в снятой разметке его нет. Шаг R3-02 |


## Источники

- `components/STATES.md` (R1-01, принят) — словарь, матрица требуемости,
  обоснование `requiredStates` каждой записи; не пересчитывалось заново,
  использовано как факт.
- `components/manifest.json` — `productionEvidence`, `figmaEvidence`,
  `storybookEvidence`, `notes`, `wave`/`step` каждой записи.
- `evidence/source/production/pages/*/dom.html` (10 файлов, 1440) —
  прямые выписки §3, числа §2.1.
- `evidence/source/production/css/inline/*.css` — проверка отсутствия
  глобального `*:focus-visible` (§3.3).
- `_sources/courses/rendered/*.html` (27 story) — Storybook-рендеры,
  прочитаны полностью для записей `storybook-only` и дополнительных
  story production/figma-only записей (§2.3, §3).
- `.pipeline/R1-02/measure-states.mjs` + `.pipeline/R1-02/dom-dump.json` —
  измерительный скрипт и его вывод этого шага (не гейт, не документация
  пакета).
- `BRIEF.md` §9, решения пользователя 3 и 5; `ROADMAP.md` → строка X-14 —
  уже принятые решения о разделении визуального норматива и ARIA-слоя и
  об интерактивной досъёмке гидрируемых узлов на шагах их записей.
