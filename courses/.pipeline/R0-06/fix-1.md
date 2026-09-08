# Правки по review-1 — витрина `showcase/components.html` (R0-06)

Разбор по находкам `review-1.md` в порядке severity. Дословный вывод гейтов и
red-проб — в «Результат валидатора» ниже.

| # | Severity | Пункт | Решение | Что сделано | Где |
|---|---|---|---|---|---|
| 1 | major | B.8 | исправлено | Гейт §6.2 разбирает теперь не набор имён классов файла целиком, а каждое CSS-правило по отдельности (`forEachRule`/`splitSelectorList`, с рекурсией по `@media`/`@supports`/`@layer`) и требует, чтобы **каждый** селектор нёс класс `doc-*` (кроме `:root` — там только переменные). Разбираются и `showcase/*.css`, и инлайновый `<style>` внутри самих файлов витрины (`showcaseFiles`, независимо от `own`). Реальное нарушение `body{background:var(--doc-bg);margin:0}` в `showcase/components.css:62-65` переименовано в `.doc-body`, класс добавлен на `<body>` в `showcase/components.html`. Все три обхода ревью (инлайновый `<style>`, `button, input, a {...}`, `[class~="leaked-shell"]`) на исправленном коде дают `EXIT=1` — пробы ниже | `tools/validate-classes.mjs:89-178, 218-236`; `showcase/components.css:62-65`; `showcase/components.html:28` |
| 2 | major | B.10 | исправлено | Добавлено зеркальное правило `non-planned component must have showcaseAnchor` рядом со строкой существующего правила для `specPath` (то же исключение для `legacy-only`, что и у него). Запись `complete` + `showcaseAnchor: null` теперь даёт `EXIT=1`. Заодно закрыты обе «дыры вне границ шага» (см. отдельные строки ниже — это тот же гейт) | `tools/validate-components.mjs:776-786` |
| 3 | minor | B.8/B.6 | исправлено | Регулярка атрибута `class` переписана: `class="…"`, `class='…'` и `class=без-кавычек` разбираются одинаково. Проверено пробой: класс в одинарных кавычках и без кавычек теперь корректно виден проверке (раньше — «Checked 0 classes… All defined») | `tools/validate-classes.mjs:200-210` |
| 4 | minor | C.14 | исправлено | Живой пример: «Имя варианта» `h4→h3` (стоит прямо под `h2` «Форма секции компонента», без `h3` между ними — `h3` не пропускает уровень). Шаблон в `<pre>`: `CanonicalName` `h2→h4` (секция ставится внутрь `.doc-category`, чей заголовок `h3`, следующий уровень — `h4`), «Имя варианта» `h4→h5` (уровень ниже `h4` компонента). CSS-селекторы `.doc-section__head` и `.doc-specimen__head` расширены на новые теги, чтобы визуальный размер не изменился. Обходом `document.querySelectorAll('h1..h6')` по всей странице (вне `<pre>`) пропусков уровня больше нет | `showcase/components.html:187, 220, 226`; `showcase/components.css:203-204, 265-266` |
| 5 | minor | C.13 | исправлено | `--doc-ink-3` заменён с `#8b9298` на `#666d73`: расчёт WCAG даёт 5.25:1 на белом, 5.07:1 на панели `#fafbfc`, 4.73:1 на холсте `#f2f3f5` — везде выше порога 4.5:1 для мелкого текста. Соседние `--doc-ink-2` (6.19:1) и `--doc-ink` (16.37:1) не тронуты | `showcase/components.css:43` |
| 6 | minor | E.19 | исправлено (текст) | `capture.md` §9 дополнен: строки `README.md:12,105,112` названы отдельным пунктом долга (пункт 4); формулировка про `tools/README.md:173-174` исправлена — файл не «не описывает» проверку §6.2, а прямо утверждает то, что этим шагом стало неверным (обещает «не ловит», хотя теперь ловит). `README.md`/`tools/README.md` не редактировались — оба вне границ шага, правит приёмка | `.pipeline/R0-06/capture.md` §1, §9 пп. 3-4 |
| 7 | minor | E.19 | исправлено (текст) | Строка X-69 в `capture.md` переформулирована: снимается только половина (правила `specPath`/`showcaseAnchor` сработали на подложенном значении на копии), вторая половина («витрина и первая спецификация соблюдают на настоящем компоненте») остаётся открытой с зависимостью от R2-01. `ROADMAP.md` не редактировался (статус X-69 правит приёмка) | `.pipeline/R0-06/capture.md` §9 |
| дыра 1 | (вне границ, обязательно) | — | исправлено | Поиск якоря заменён с подстроки по всему файлу (`showcase.includes('id="…"')`) на поиск настоящего тега: разметка предварительно очищается от `<!-- -->`, `<pre>…</pre>`, `<code>…</code>`, затем ищется `<тег … id="якорь" …>`. Заполнитель `c-<id>`, оставленный только в `<pre>`, больше не проходит. Пробой на копии подтверждено: `EXIT=1` | `tools/validate-components.mjs:34-46, 847-857` |
| дыра 2 | (вне границ, обязательно) | — | исправлено | То же правило, что находка 2 — зеркальное `non-planned component must have showcaseAnchor` закрывает и её | `tools/validate-components.mjs:776-786` |
| 8 | note | — | отклонено | `.doc-stage` перечисляет пять объявлений вместо ссылки на правило продукта — согласен с риском, но правки в границах этой итерации не требует (ревью формулирует как риск на будущее, не как расхождение сегодня). Запись-кандидат добавлена в `capture.md` §9 п. 8 (не в `ROADMAP.md`) | `.pipeline/R0-06/capture.md` §9 п. 8 |
| 9 | note | — | исправлено | `capture.md` §2: «четыре объявления» → «пять объявлений», с перечислением | `.pipeline/R0-06/capture.md` §2 |
| 10 | note | B.8 | отклонено | Ложная тревога `--doc-fake` внутри `content:` признана самим ревью малозначительной (ошибка в безопасную сторону). Не чинил в этой итерации, чтобы не расширять правку сверх заявленного объёма мажорных находок; записано кандидатом в `capture.md` §9 п. 9 | `.pipeline/R0-06/capture.md` §9 п. 9 |
| 11 | note | B.8 | отклонено | Побуквенная проверка префикса (регистр, hex-экранирование) — экзотика, само ревью не считает это находкой первого порядка. Записано кандидатом в `capture.md` §9 п. 10 | `.pipeline/R0-06/capture.md` §9 п. 10 |
| 12 | note | — | исправлено | Шаблон в `<pre>` обёрнут в `.doc-src-group`, как и живой образец — расхождение снято, пока форму никто не скопировал | `showcase/components.html:229-231` |
| 13 | note | C.14 | исправлено | На бейджах `.doc-src--production` в шапке образца (живой пример и шаблон) добавлен `aria-label="production"` — скринридер получает слово, а не букву «П». В легенде не трогал: там рядом уже стоит расшифровка текстом | `showcase/components.html:191, 230` |
| 14 | note | — | отклонено | Ревью само пишет «претензий нет, зафиксировано числом» — действий не требует | — |

## Изменённые файлы

- `tools/validate-classes.mjs` — гейт §6.2 разбирает правила и все виды селекторов (не только классовые) во всех файлах оболочки, включая инлайновый `<style>`; разбор `class=` не зависит от вида кавычек.
- `tools/validate-components.mjs` — зеркальное правило `showcaseAnchor` для не-`planned` записей; поиск якоря по настоящему узлу разметки, а не подстрокой по файлу.
- `showcase/components.css` — `body` → `.doc-body`; заголовки `.doc-section__head`/`.doc-specimen__head` расширены на новые уровни; `--doc-ink-3` на контрастное значение.
- `showcase/components.html` — `<body class="doc-body">`; уровни заголовков живого примера и шаблона исправлены без пропуска; шаблон обёрнут `.doc-src-group`; `aria-label` на бейджах источника в шапке образца.
- `.pipeline/R0-06/capture.md` — счёт классов оболочки (46→47), уточнение про мирор-правило якоря (§3), число объявлений `.doc-stage` (§2), долг §9 (пп. 3-4 переформулированы и дополнены, пп. 8-10 добавлены), формулировка X-69 сужена.
- `.pipeline/R0-06/fix-1.md` — этот файл.

## Результат валидатора

Гейты на исправленном пакете, дословно:

```
$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
код возврата: 0

$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (2) — предмета ещё нет:
- requiredStates — матрицы обязательных состояний ещё нет (R1-01); у 55 записей список пуст
- спецификации — 55 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — …
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
код возврата: 0

$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
код возврата: 0

$ node --check tools/*.mjs   (все шесть файлов по отдельности)
код возврата: 0

Обязательная пара против подделки реестра:
$ node tools/measure-selectors.mjs
Измерено селекторов 44 по 10 страницам; расходятся с манифестом 0.
код возврата: 0
$ node tools/validate-components.mjs --strict
Manifest structure is valid.
код возврата: 0
$ git status --short components/
(пусто)
```

Прогнано дважды за сессию правок, оба раза чисто сразу после `measure-selectors.mjs`.
Между прогонами `components/manifest.json` и `components/SPEC-TEMPLATE.md`
получили правку о медиазапросах `tablet:`/`desktop:` — это параллельный шаг
R0-03 (не мой процесс, не эта правка), к перечням якорей/классов отношения
не имеет; `validate-components --strict` и `validate-classes` после неё
по-прежнему дают код 0.

Красные пробы (копия `ui/ + showcase/ + tools/` в скретчпаде, не в рабочем
дереве пакета) — все три обхода ревью и оба обязательных «дыры» теперь
ненулевые:

```
R-a: класс витрины объявлен инлайново в <style> витрины
  showcase/components.html <style>: селектор без класса витрины doc- — .leaked-shell
  EXIT=1

R-b: селектор не по классу — button, input, a {...} в showcase/components.css
  showcase\components.css: селектор без класса витрины doc- — a
  showcase\components.css: селектор без класса витрины doc- — button
  showcase\components.css: селектор без класса витрины doc- — input
  EXIT=1

R-c: класс витрины через атрибутный селектор — [class~="leaked-shell"]
  showcase\components.css: селектор без класса витрины doc- — [class~="leaked-shell"]
  EXIT=1

Контроли (не должны были сломаться и не сломались):
R-d: .doc-leak в ui/tokens.css внутри @media — EXIT=1 (как и было)
R-f: var(--doc-bg) в ui/tokens.css — EXIT=1 (как и было)
R-j: .hover\:leak без префикса в showcase/components.css — EXIT=1 (как и было)
Одинарные/без кавычек class= — класс виден проверке (раньше «Checked 0 classes»)
Площадка :not()/:is()/атрибуты/@supports/content:/url() — все 16 настоящих
  классов найдены, ложных не объявлено — регрессии нет

дыра 1: якорь c-badge оставлен только текстом внутри <pre>, живая секция снята
  - badge: showcase anchor not found: c-badge
  EXIT=1

дыра 2 / находка 2: badge → status complete, showcaseAnchor: null
  - badge: non-planned component must have showcaseAnchor
  EXIT=1
```

`node tools/serve.mjs` поднят и погашен для ручной проверки (порт 4179 был
свободен, никого не гасил): `/showcase/components.html` и
`/showcase/components.css` — `200`, сервер остановлен после проверки.

## Что ушло в capture.md кандидатами (не в ROADMAP.md)

- note 8 — `.doc-stage` перечислением, не ссылкой на правило продукта (риск на будущее, после R0-04).
- note 10 — ложная тревога `--doc-` внутри `content:` в `ui/`.
- note 11 — побуквенная проверка префикса `doc-` (регистр, hex-экранирование).

Долг уже описанный до этой итерации (пп. 1-2, 5-7 старой нумерации) не
дублируется; строки долга в `ROADMAP.md` не вносились — граница шага и без
того нарушена правкой `tools/validate-components.mjs`, расширять её дальше
(вносить долг в файл вне пяти путей шага) не стал.
