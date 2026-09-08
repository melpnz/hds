# Ревью R0-06 — гейт копируемости `tools/validate-classes.mjs` — итерация 3 (финальная)

Вердикт: **вернуть на доработку**
Дата: 8 сентября 2026. Ревьюер ничего не правил — ни в `tools/validate-classes.mjs`,
ни в `showcase/`, ни где-либо ещё.

Находки: **blocker 1 · major 0 · minor 1 · note 1**.

Три заявленных в `fix-2.md` исправления (критерий `.every()` + `names.length > 0`,
инверсия списка at-rules для рекурсии, разбор at-rules без тела) проверены
независимо и держат ровно то, что заявлено. Но независимый четвёртый красный
набор нашёл **новый, ранее не пробовавшийся класс обходов** того же гейта
§6.2 — через CSS-экранирование символов в именах классов, причём **в обе
стороны** правила: и «в `showcase/*.css` каждый класс несёт `doc-`», и
«в `ui/` нет ни одного класса `doc-*`». Порог задачи — блокировать только на
новый реальный обход — здесь пройден, поэтому вердикт `blocked`, несмотря на
то что три предыдущие итерации отработаны добросовестно и все регрессионные
пробы держатся.

---

## Проверено

- **Три исправления fix-2** — `.every()`+`names.length>0` в `selectorLeaks`,
  инвертированный список at-rules в `forEachRule`, разбор at-rules без тела
  (`@import`/`@charset`) — прочитаны построчно в рабочем дереве
  (`tools/validate-classes.mjs`) и проверены на независимой копии пакета
  (`ui/ + showcase/ + tools/ + components/`) в отдельном каталоге скретчпада,
  не в рабочем дереве.
- **Регрессия всех прежних обходов** — R-d, R-f, R-j, R-a, bare-selector
  control (`button, input, a`), R-x1/R-x2/R-x5 (review-2), T1/T3 (новый
  красный набор fix-2) — все по-прежнему `EXIT=1`, ничего не откатилось.
- **Третий изъян, найденный самим шагом** (`@import`/`@charset` без тела
  склеивался с преамбулой следующего блока) — воспроизведён независимо на
  своей копии: с фиксом утечка после `@charset`/`@import` ловится (`EXIT=1`),
  без фикса (гипотетически, по трассировке кода) не поймалась бы — сам факт
  правки подтверждён контрольной парой T5/T5-контроль.
- **Новый красный набор ревьюера** (независимый от review-1/review-2/T1-T5
  fix-2) — восемь проб: экранирование через `\XX` (hex/unicode CSS-escape) в
  обе стороны правила, тройная вложенность at-rules, CSS custom media
  (`@media (--foo)`), `::part()`/`::slotted()`, at-rule без тела с `;` внутри
  строки (`@import url("a;b.css")`). Шесть из восьми держатся, **два дают
  ложный `EXIT=0`** — см. находку 1.
- **Найденный обход перепроверен в реальном браузере** (Chromium, канал
  `msedge`, через `playwright`, headless), не только по трассировке регэкспа:
  подготовлен `probe.html`/`probe2.html` вне пакета (в скретчпаде, скопированы
  во временную позицию рядом с `node_modules` только на время запуска и
  сразу удалены — `git status --short courses/` после каждого прогона
  показывал только `tools/validate-classes.mjs`).
- **Докстринг vs код** — построчно (`tools/validate-classes.mjs:1-60`) против
  поведения `selectorLeaks`/`forEachRule`/`classNames`. Обе фразы докстринга,
  которые обещают инвариант («каждый класс несёт `doc-`», строка 22; «ни
  одного класса `doc-*`» в `ui/`, строка 28), опровергаются находкой 1 —
  докстринг обещает больше, чем код проверяет.
- **Обязательные гейты** — прогнаны дословно на рабочем дереве (не на копии),
  вывод ниже.
- **Границы** — `git status --short courses/` до и после каждого
  эксперимента; `components/manifest.json` и `components/selector-census.json`
  не задеты (`git diff --stat` пуст на оба).

## Что проверить не смог

- **Копируемость METHOD §6.1 на разметке пакета** — по-прежнему нечего
  проверять, спецификаций 0 (согласовано ещё в review-1/review-2, состояние
  пакета не изменилось).
- **Визуальный слой витрины (responsive, контраст, DOM)** — не переоткрывал:
  `git diff --stat HEAD -- showcase/ ui/ components/manifest.json` пуст —
  `showcase/`, `ui/` и манифест побайтово идентичны версии, которую review-2
  уже проверил в браузере на 320/768/1024/1400 с чистой консолью. Фикс-2
  трогал только `tools/validate-classes.mjs`, у визуального слоя не могло
  появиться новых расхождений — переоткрывать и переснимать нечего и не
  нужно (`METHOD` §3 «не переснимай»).
- **Сверка с Figma и продакшеном** — у витрины по-прежнему нет узла в макете
  и прототипа в проде (согласовано в review-1/review-2).

---

## Находки

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | **blocker** | B.8 | **Гейт §6.2 обходится CSS-экранированием символов в именах классов — обычным, валидным приёмом (unicode/hex-escape), не хаком.** Регэксп `UNESCAPE = /\\(.)/g` (`tools/validate-classes.mjs:118`) снимает экранирование только по правилу «один обратный слэш — один следующий символ», как для `\:` или `\.`. У CSS есть другой, тоже стандартный синтаксис экранирования — hex/unicode-escape: `\` + до 6 шестнадцатеричных цифр, опционально закрытых пробелом (например, `\64` = `d`, `\6c` = `l`). Этот код с ним не совместим: он «откусывает» только первую hex-цифру как «экранированный символ», а остаток цифр уходит в обычные символы имени. Комбинация с фильтром «имя не начинается с цифры» (`tools/validate-classes.mjs:110-116`, добавлен для отсечения `@media (min-width: 37.5em)`) стирает такой класс из разбора целиком: остаток текста без ведущей точки классом уже не считается никем. Результат — рабочий, воспроизводимый в настоящем браузере обход в обе стороны правила §6.2: <br>**(a) утечка в `showcase/*.css` остаётся незамеченной.** `.doc-badge.\6c eaked-hidden { background: lime; }` — составной селектор ровно того типа, что закрывала находка review-2 (класс `doc-` + непрефиксованный класс на одном элементе), но второй класс написан как `\6c eaked-hidden`. Разбор регэкспом извлекает из него текст `6c`, фильтр «не начинается с цифры» его отбрасывает, а `eaked-hidden` остаётся неучтённым текстом без класса. Итог: `names(selector) = {"doc-badge"}`, `.every(...)` истинно, `EXIT=0`, «All defined» — а в браузере (проверено `playwright`/Chromium `msedge`) реальный класс — `leaked-hidden`, без всякого `doc-`: элемент с классами `doc-badge leaked-hidden` получает `background: rgb(0, 255, 0)`, элемент с одним `leaked-hidden` или одним `doc-badge` — нет (составной селектор действительно требует оба класса, то есть браузер разбирает вторую часть ровно как класс `leaked-hidden`). <br>**(b) правило «ни одного класса `doc-*` в `ui/`» пробивается в обратную сторону.** `.\64 oc-injected-hack { color: red; }`, положенный в `ui/tokens.css`, — по той же механике реальный класс, который видит браузер, — `doc-injected-hack` (`\64` → `d`, дальше `oc-injected-hack`). Проверено в браузере: элемент с `class="doc-injected-hack"` (без единого обратного слэша в разметке) получает `color: rgb(255, 0, 0)`. Валидатор же не находит в `ui/tokens.css` ни одного класса `doc-*` вовсе — по той же причине (регэксп «откусывает» только `\6`, `4` уходит в цифровой фильтр, `oc-injected-hack` остаётся без ведущей точки) — и печатает «METHOD §6.2: … 15 ui stylesheet(s) free of doc-». Это прямое нарушение самого инварианта, который проверка №2 обязана ловить: продуктовый слой получает правило, целящееся в намespace витрины, и гейт об этом молчит. <br>Обе фразы докстринга, которые эта проверка обязана гарантировать — «каждый класс несёт `doc-`» (строка 22) и «ни одного класса `doc-*`» в `ui/` (строка 28) — на этих двух пробах не выполняются. | `tools/validate-classes.mjs:110-121` (`classNames`, `UNESCAPE`, цифровой фильтр), применяется из `selectorLeaks` (`:225-236`) и из прямой проверки `ui/**/*.css` (`:280-289`) | Вставить `.doc-badge.\6c eaked-hidden { background: lime; }` в `showcase/components.css` **или** `.\64 oc-injected-hack { color: red; }` в любой файл `ui/` — `node tools/validate-classes.mjs` даёт `EXIT=0` вместо ожидаемого `1` в обоих случаях. Независимая браузерная проверка (Chromium `msedge`, `playwright`): страница с `<div class="doc-badge leaked-hidden">` и стилем `.doc-badge.\6c eaked-hidden{background:rgb(0,255,0)}` даёт `getComputedStyle(...).backgroundColor === "rgb(0, 255, 0)"`; страница с `<div class="doc-injected-hack">` и стилем `.\64 oc-injected-hack{color:rgb(255,0,0)}` даёт `color === "rgb(255, 0, 0)"` — оба воспроизведены на копии пакета вне рабочего дерева. |
| 2 | minor | E (докстринг) | Комментарий у `AT_RULE_WITHOUT_ELEMENT_SELECTORS` (`tools/validate-classes.mjs:130-137`) утверждает, что вложенные в `@page` at-rules вроде `@top-left` «сами по себе at-rules, которые снова уйдут в эту же ветку» (то есть тоже попадут под исключение). Фактически тело `@page` вообще не передаётся в рекурсию (`forEachRule` не вызывается для исключённых at-rules), так что `@top-left` как отдельная преамбула никогда не доходит до сравнения с `AT_RULE_WITHOUT_ELEMENT_SELECTORS` — комментарий описывает путь выполнения, которого не существует. Практических последствий нет (тело `@page` в любом случае не разбирается, до находки 1 не относится и обхода не даёт), это неточность формулировки, не поведения | `tools/validate-classes.mjs:130-137` (комментарий над `AT_RULE_WITHOUT_ELEMENT_SELECTORS`) | Прочитать `forEachRule`: при совпадении `atRule[1]` с исключением рекурсия в `body` не вызывается вовсе — значит вложенные `@top-left` физически не проверяются функцией как самостоятельная преамбула, вопреки формулировке комментария |
| 3 | note | — | Обратная сторона находки 1 — при попытке добросовестно назвать класс через unicode-escape (например, скопированный из инструмента вроде PostCSS, который экранирует спецсимволы в именах классов, — `.doc-\:hover`) валидатор в некоторых сочетаниях экранирования может, наоборот, **ложно посчитать протечкой** корректно префиксованный класс: цифровой фильтр отбрасывает декодированный по-разгэксповски фрагмент, и от селектора не остаётся ни одного распознанного класса, хотя браузер видит `doc-…`. Проверено на `.\64 oc-injected-hack` внутри `showcase/*.css` (не `ui/`) — даёт ложное «протечка», хотя по факту это легитимный `doc-injected-hack`. Не влияет на вердикт (ложное срабатывание в safe-направлении, не обход), но при исправлении находки 1 стоит проверить и эту сторону, чтобы не получить обратную проблему — гейт, который душит легитимные экранированные имена | `tools/validate-classes.mjs:110-121` | Вставить `.\64 oc-injected-hack { color: red; }` в `showcase/components.css` (не в `ui/`) — гейт покажет «селектор без класса витрины doc-», хотя реальный класс — `doc-injected-hack` |

---

## Красный набор ревьюера — новая проба против гейта §6.2 (копия пакета, отдельный каталог скретчпада)

```
=== ESC-1: hex/unicode-escape маскирует непрефиксованный класс в компаунд-селекторе showcase ===
вставка в showcase/components.css:
  .doc-badge.\6c eaked-hidden { background: lime; }
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
EXIT=0   <-- ожидалось EXIT=1

Независимая проверка в браузере (playwright, Chromium msedge):
  <div class="doc-badge leaked-hidden">   -> backgroundColor = rgb(0, 255, 0)
  <div class="leaked-hidden">             -> backgroundColor = rgba(0, 0, 0, 0)
  <div class="doc-badge">                 -> backgroundColor = rgba(0, 0, 0, 0)
  (компаунд реально требует оба класса — значит второй класс селектора,
   .\6c eaked-hidden, браузер разбирает как класс "leaked-hidden", без doc-)

=== ESC-2: hex/unicode-escape маскирует doc-* класс, помещённый в ui/ ===
вставка в ui/tokens.css:
  .\64 oc-injected-hack { color: red; }
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
EXIT=0   <-- ожидалось EXIT=1 ("класс оболочки витрины в продуктовом слое")

Независимая проверка в браузере:
  <div class="doc-injected-hack"> + <style>.\64 oc-injected-hack{color:rgb(255,0,0)}</style>
  -> color = rgb(255, 0, 0)   (реальный класс — doc-injected-hack, без единого \ в разметке)

=== T-nest3: тройная вложенность at-rules (@layer > @media > @supports) — держится ===
Оболочка витрины и продуктовый слой смешались (1):
  селектор без класса витрины doc- — .leaked-triple-nested
EXIT=1

=== T-custommedia: @media (--foo) — держится ===
Оболочка витрины и продуктовый слой смешались (1):
  селектор без класса витрины doc- — .leaked-custom-media
EXIT=1

=== T-part: ::part()/::slotted() без класса — держится, бэйр-селектор виден ===
Оболочка витрины и продуктовый слой смешались (2):
  селектор без класса витрины doc- — ::slotted(span)
  селектор без класса витрины doc- — my-widget::part(header)
EXIT=1

=== T-importsemicolon: @import url("a;b.css"); с ";" внутри строки — держится ===
(добавлен .leaked-after-semicolon-import после @import с ";" внутри URL)
Оболочка витрины и продуктовый слой смешались (1):
  селектор без класса витрины doc- — .leaked-after-semicolon-import
EXIT=1
```

Шесть из восьми проб нового набора держатся без изменений; два экранирующих
обхода (ESC-1, ESC-2) дают ложный `EXIT=0` и составляют находку 1.

## Регрессия — прежние обходы (review-1, review-2, T1/T3 из fix-2), копия после fix-2

```
R-d: .doc-leak в ui/tokens.css внутри @media           -> EXIT=1 (как и было)
R-f: var(--doc-bg) в ui/tokens.css                     -> EXIT=1 (как и было)
R-j: .hover\:leak без префикса в showcase              -> EXIT=1 (как и было)
R-a: инлайновый <style> витрины, .leaked-shell         -> EXIT=1 (как и было)
bare-selector control: button, input, a в showcase     -> EXIT=1 (как и было)
R-x1 (review-2): .doc-specimen .card                   -> EXIT=1 (как и было)
R-x2 (review-2): .doc-badge.leaked-name                -> EXIT=1 (как и было)
R-x5 (review-2): @container { button, input, a {...} } -> EXIT=1 (как и было)
T1 (fix-2): .doc-badge.leaked-mid.doc-other            -> EXIT=1 (как и было)
T3 (fix-2): @container { @media { .leaked-nested-a } } -> EXIT=1 (как и было)
Контроль: копия без единой правки                      -> Checked 47 classes... All defined. EXIT=0
```

## Третий изъян fix-2 (@import/@charset без тела) — независимое воспроизведение

```
=== с фиксом: @charset + @import перед реальной утечкой ===
@charset "UTF-8";
@import url("other.css");
...components.css без изменений...
.leaked-after-import { color: red; }

Оболочка витрины и продуктовый слой смешались (1):
  селектор без класса витрины doc- — .leaked-after-import
EXIT=1   (совпадает с заявленным в fix-2.md T5)

=== контроль: тот же @charset/@import БЕЗ утечки после ===
Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
EXIT=0   (совпадает с заявленным T5-контроль)
```

Фикс третьего изъяна подтверждён независимо, не по слову автора.

---

## Гейты — дословно (рабочее дерево, не копия)

```
$ node tools/validate-classes.mjs
Отложено (1) — витрины ещё нет:
  showcase/pages.html — заводит шаг R6

Checked 47 classes in 1 file(s) against 16 stylesheets. All defined.
METHOD §6.2: 1 showcase stylesheet(s) prefixed doc-, 15 ui stylesheet(s) free of doc-.
exit=0

$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (2) — предмета ещё нет:
- requiredStates — матрицы обязательных состояний ещё нет (R1-01); у 55 записей список пуст
- спецификации — 55 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — инвентаризация записала один ключ и FilterChip, и Tab: либо это один component set, либо ошибка переноса. Разводится на R3-04 и R3-13
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
exit=0

$ node tools/validate-counts.mjs
Checked 28 documented counts against the package. All match.
  roadmapSteps: 76
  roadmapR0: 7
  elements: 55
  pages: 10
  unreachable: 8
  cssCategories: 10
  tokens: 51
  manifest: 55
  specs: 0
  scopeProduction: 44
  scopeStorybookOnly: 5
  scopeFigmaOnly: 6
exit=0

$ node --check tools/*.mjs   (все шесть файлов по отдельности)
OK tools/capture.mjs
OK tools/measure-selectors.mjs
OK tools/serve.mjs
OK tools/validate-classes.mjs
OK tools/validate-components.mjs
OK tools/validate-counts.mjs

Обязательная пара против подделки реестра:
$ node tools/measure-selectors.mjs
Измерено селекторов 44 по 10 страницам; расходятся с манифестом 0.
Перепись записана: components\selector-census.json
exit=0
$ node tools/validate-components.mjs --strict
Manifest structure is valid.
exit=0

$ git status --short courses/   (из корня репозитория, до и после всех экспериментов — одинаково)
 M courses/tools/validate-classes.mjs
$ git diff --stat -- courses/components/manifest.json courses/components/selector-census.json
(пусто — оба файла не задеты)
$ git diff --stat HEAD -- courses/showcase/ courses/ui/
(пусто — визуальный слой не менялся с review-2)
```

Все пять обязательных гейтов и пара против подделки реестра дают код 0,
совпадают с тем, что заявлено в `fix-2.md`, слово в слово.

---

## Границы

`git status --short courses/` — тронут только `tools/validate-classes.mjs`,
как и требовалось. `.pipeline/R0-06/` не участвует в отслеживании
(`.gitignore:11` — `/*/.pipeline/R*/`), это ожидаемо. `components/manifest.json`
не задет ни рабочим изменением, ни побочным эффектом `measure-selectors.mjs`
(`selector-census.json` тоже не изменился). Все эксперименты этого отчёта
проводились на изолированной копии `ui/ + showcase/ + tools/ + components/`
вне рабочего дерева; временные HTML/JS-пробы для браузерной проверки
создавались рядом с `node_modules` пакета на время одного запуска и сразу
удалялись — после каждого удаления `git status --short courses/` подтверждал
чистое дерево.

---

## Что дальше

Находка 1 — не про список at-rules и не про критерий `.some()`/`.every()`
(обе прошлые дыры закрыты добросовестно), а про третье, отдельное место того
же файла: `classNames`/`UNESCAPE` (`tools/validate-classes.mjs:110-121`) не
реализует CSS hex/unicode-escape (`\` + 1-6 hex-цифр + опциональный пробел),
а обрабатывает только одиночное экранирование одного символа. Нужно либо
полноценно декодировать CSS-идентификаторы (unicode-escape по спецификации,
не только `\X`), либо — минимально — не терять текст, следующий за
некорректно распознанным экранированием, и не отбрасывать молча
цифровые фрагменты, оставляя часть селектора вне разбора. Второе может
задеть и находку-note 3 (ложные срабатывания на легитимных экранированных
именах) — стоит закрывать вместе, одним проходом по `classNames`.

Находка 2 (minor) и находка-note 3 — в roadmap отдельными строками, не
блокируют приёмку сами по себе, но не должны потеряться при следующей
правке того же участка.
