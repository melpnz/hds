# Ревью R0-08 · STATES.md, state-contract.css — итерация 2

Вердикт: **вернуть на доработку**
Режим: **инкрементальный** (есть `review-1.md` и `fix-1.md`; diff локален —
`ROADMAP.md`, `blocks/form-field.md`, `blocks/site-header.md`,
`components/STATES.md`, `showcase/showcase.css`, `ui/blocks/core.css`,
`ui/state-contract.css`; общий CSS entrypoint, tokens и foundations не тронуты)

Проверено: `git diff` всех семи изменённых файлов; `ui/state-contract.css`
целиком; `components/STATES.md` целиком; `blocks/manifest.json` (записи
`site-header`, `footer-social`, `button`, `form-field`); `ui/tokens.css`
(`--product-cta`, `--product-on-acid`); `GUIDE.md` §6; `showcase/*.css`,
`showcase/*.html`; `blocks/INDEX.md`; `README.md`.
Живая витрина: `node tools/serve.mjs` (порт 4180, уже был поднят), браузер —
**headless Chrome 152.0.7977.83 через CDP** (`--remote-debugging-port=9333`,
без Playwright/Puppeteer): Tab-обход `showcase/core.html` (14 шагов) и
`showcase/primitives.html` (26 шагов) с замером `getComputedStyle` на реально
сфокусированном элементе; повторный обход `primitives.html` на `data-theme="light"`;
`CSS.forcePseudoState` для проверки `:hover`;
отдельная **голая страница** (`Page.setDocumentContent`, один
`<link href="/ui/landings.css">`) для инварианта копируемости METHOD §6.1.
Контрасты пересчитаны формулой WCAG relative luminance независимо (Node) и
подтверждены в браузере над реальным `getComputedStyle().backgroundColor`.
Все шесть валидаторов прогнаны заново, exit 0, логи —
`.pipeline/R0-08/review-2.validate-{blocks,classes,counts,normative,radius,tokens}.log`.

## Статус прежних находок

| # (review-1) | Severity | Статус | Чем подтверждено |
|---|---|---|---|
| 1 | blocker | **закрыта** | строка «Раскрывающийся контрол» в матрице есть (`STATES.md:57`), ложное «элементов… нет ни одного» убрано из обоих файлов, GAP `expanded` назван и сведён с `manifest.json` (`missingStates: ["expanded"]`, `step: "R2-05"`). Но строка внесла новую дыру — находка 1 ниже |
| 2 | major | **закрыта частично** | число 8 пересчитано мной независимо и верно, синхронно в четырёх названных файлах; в двух других файлах пакета осталось старое «семь» — находка 2 ниже |
| 3 | major | **закрыта** | правило `.site-header-link:hover/:focus-visible` в `ui/state-contract.css:202-206`, в `ui/blocks/core.css` дубля нет; во всём `ui/` вне `state-contract.css` не осталось ни одного селектора состояния. Живьём: `CSS.forcePseudoState hover` даёт `text-decoration: none -> underline` |
| 4 | major | **закрыта как GAP** | 2.83 : 1 назван в трёх местах, привязан к Р-5/Р-6, источник (`GUIDE.md:537,550`, `tokens.css:453`) существует и число там то же. Остаточные неточности — находки 5, 6 |
| 5 | major | **закрыта** | `.doc-page :focus-visible` удалён; живой Tab-обход даёт `solid 3px / offset 3px rgb(6,208,239)` на всех 40 проверенных узлах обеих страниц и на голой странице |

## Находки итерации 2

| # | ID | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|---|
| 1 | states | major | C.11, A.5 | Новая строка матрицы объявляет `hover` **обязательным** для `.site-header-toggle` («Строка „обязательно“ — это условие сдачи: элемент без такого состояния в работу не идёт», `STATES.md:46-47`). Правила `:hover` у `.site-header-toggle` в пакете нет ни одного, и этот пробел не записан нигде: `STATES.md:59-67` и `state-contract.css:28-31,223-229` называют единственным недостающим `expanded`, `manifest.json` (`site-header`) — тоже (`missingStates: ["expanded"]`). Причина ошибки видна в самом `fix-1.md`: `requiredStates` записи `site-header` относится к модулю целиком — её собственный `statusReason` говорит «Ссылки шапки несут `:hover` и `:focus-visible`», то есть `hover` там закрыт классом `.site-header-link`, — а fix перенёс этот список на один элемент `.site-header-toggle`, у которого носителем `hover` никто не является. Итого строка требует 4 состояния, реализованы 2 (`default`, `focus-visible`), записан 1 пробел из 2. | `components/STATES.md:57` (строка матрицы) против `ui/blocks/core.css:160-173` (весь блок правил `.site-header-toggle`, `:hover` нет) и `blocks/manifest.json` (`site-header.missingStates`) | `grep -rn ":hover" landings/ui/` — четыре правила: `.button`, `.form-field-input`, `.form-field-box`, `.site-header-link`; `.site-header-toggle` среди них нет. Живьём (CDP, `CSS.forcePseudoState` `hover` на `showcase/core.html`): `.site-header-link` → `textDecoration: none -> underline`, `.site-header-toggle` → **HOVER НИЧЕГО НЕ МЕНЯЕТ** |
| 2 | states | major | E.19 | Исправленное число синхронизировано только в четырёх файлах, названных заданием. В пакете осталось **два** места со старым «семь состояний из двадцати» и с тем же перечнем из семи имён без `readOnly` — то есть ровно то ложное утверждение, за которое review-1 выставило major 2, продолжает стоять в реестре блоков и в README пакета. `fix-1.md` пишет «Обновлены оба перечня-дубля», хотя дублей было четыре. | `blocks/INDEX.md:73` («Матрица и `ui/state-contract.css` закрыли семь состояний из двадцати — hover, focus-visible, pressed, checked, indeterminate, disabled, invalid»); `README.md:129` («Семь состояний из двадцати дописаны нормативом в `ui/state-contract.css`») | `grep -rn "семь состоян\|Семь состоян" landings/ --include=*.md` — два попадания, оба вне изменённых fix-1 файлов |
| 3 | states | minor | E.19 | Пересчёт по закрытому словарю не сходится до двадцати. `state-contract.css` §7 перечисляет отсутствующие: `loading, selected, current, open, closed, empty, dragActive` (7) + `expanded`/`collapsed` (2); плюс реализованные 8 = 17 из 20. Не назван ни `error`, ни `success`, ни `default`. В `STATES.md` `success` назван (`:187`) и `default` покрыт матрицей, но `error` не упомянут нигде, кроме самого словаря (`:31`), — 19 из 20. Слово `error` есть в `allowedStates` `manifest.json`, то есть это не описка словаря. | `ui/state-contract.css:218-229`; `components/STATES.md:166-188` | Разность множеств: словарь (20) минус реализованные (8) минус перечисленные как отсутствующие — остаток `error` (и `success`, `default` в CSS-файле) |
| 4 | states | minor | E.19 | Критерий, которым объясняется число, стал неверен после правки: «Восемь состояний из двадцати — **те, у которых в пакете есть элемент-носитель**» (`STATES.md:78`), а двадцатью строками выше тот же файл утверждает, что у `expanded`/`collapsed` носитель в пакете **есть** (`:59-61`, `:170-174`). По названному критерию их должно быть не 8, а 10 (плюс `default` — 11). Верный критерий — «у которых есть правило в `ui/state-contract.css`». | `components/STATES.md:78` против `:59-61` и `:170-174` | Читается в одном файле; противоречие внесено самим fix-1 |
| 5 | states | minor | A.2 | «У Карьеры и Курсов это 4.40 : 1 и 4.39 : 1» дано без темы, хотя у Карьеры `--product-cta` в темах **разный**: `#7963e9` (тёмная) → 4.40 : 1, `#7a3df5` (светлая) → **5.51 : 1**. У Хабра и Курсов значение одно на обе темы, и для Хабра это в тексте оговорено («в обеих темах»), для Карьеры — нет. Порог 3 : 1 берут оба значения, поэтому вывод не меняется; неточно названо само число. Повторено в трёх местах. | `components/STATES.md:152-153`; `ui/state-contract.css:162`; `blocks/form-field.md` («Ограничения», строка «У Карьеры и Курсов порог взят (4.40 и 4.39)»); значения — `ui/tokens.css:378` и `:470` | `node` по формуле WCAG: `#7963e9` → 4.40, `#7a3df5` → 5.51, `#4da3cb` → 2.83, `#3670f4` → 4.39 |
| 6 | states | minor | I.37 | Итоговая фраза раздела говорит противоположное задуманному: «контраст галочки на CTA Хабра ниже заявленного порога **на всех контролах пакета, кроме этого одного**». По смыслу абзаца порог не берёт ровно один случай, а не все, кроме одного. В нормативной статье, чья ценность — точность формулировки, это читается как факт о пакете. | `components/STATES.md:161-162` | Прочесть абзац целиком: `:150-162` |
| 7 | states | minor | E.19 | Витрина осталась с досчёткой, исправленной в статье: `blocks/form-field.md` теперь говорит «состояний снято 0 из 5 … все пять дописаны нормативом» (добавлен `readOnly`), а живая страница примитивов в разделе «Чего на этой странице нет» по-прежнему пишет «Ни одного из четырёх (hover, focus-visible, disabled, invalid)». `validate-counts` этого не ловит: утверждение прозой, а не в размеченной таблице. | `showcase/primitives.html:525` против `blocks/form-field.md:9,282` | `grep -n "четырёх (hover" landings/showcase/primitives.html` |
| 8 | states | minor | C.11 | Матрица претендует на полное покрытие («Вид элемента определяет обязательный набор»), но `.site-header-link` — элемент, который fix-1 внёс в «Что реализовано» как носителя `hover` и `focus-visible`, — не попадает ни в одну из семи строк: он не `.button` и не ссылка-кнопка. Вторичное следствие: `blocks/INDEX.md:69` трактует ссылки футера по строке «Действие» и требует от них `hover`, а ссылки шапки по той же логике должны нести ещё `pressed` и `disabled` — но `disabled` признан нереализованным только комментарием в CSS (`ui/blocks/core.css:155-157`, добавлен fix-1), а не строкой `missingStates` и не «Ограничениями» статьи. Это остаток вторичной части major 3 review-1 («словарь фактически не покрывает весь пакет»); основная часть — перенос правила — закрыта. | `components/STATES.md:49-57` (нет строки для навигационной ссылки); `ui/blocks/core.css:155-157`; `blocks/manifest.json` (`site-header.missingStates`) | Сопоставить список классов в «Что реализовано» (`STATES.md:82-83`) с колонкой «Вид» матрицы |
| 9 | states | note | C.11 | Живым примером на витрине показано ровно одно состояние — `checked` (`showcase/primitives.html:242`). `disabled`, `readOnly`, `indeterminate`, `invalid` разметкой нигде не демонстрируются; и в fix-1, и у меня они проверялись синтетически (атрибут/свойство назначались скриптом в браузере). Для R0-08 это допустимо — объём шага словарь и контракт, а не витрина, — но строка в roadmap этого стоит. | `showcase/primitives.html` | `grep -n "readonly\|disabled\|indeterminate\|aria-invalid" landings/showcase/*.html` — попаданий в разметке примеров нет |
| 10 | states | note | E.19 | `.site-header-toggle` — настоящий `<button>`, но строка матрицы объявляет ему `pressed` неприменимым, тогда как строка «Действие» делает `pressed` обязательным для кнопок. Либо это осознанное различение «кнопка-действие» и «кнопка-раскрытие», и тогда его стоит назвать одной фразой, либо описка. | `components/STATES.md:57` против `:51` | — |
| 11 | states | note | — | Шапка `ui/landings.css` относит фокус к слою foundations («2. foundations — база документа, типографическая шкала, **фокус**»), а правило фокуса живёт в `state-contract.css`; в `ui/foundations.css` нет ни одного `:focus`. Вне объёма R0-08 (файл принадлежит R0-03), но после переноса кольца строка описывает не то, что есть. | `ui/landings.css` (комментарий-оглавление) | `grep -rn ":focus" landings/ui/foundations.css` — пусто |

## Что проверено и претензий нет

Проверено в этой итерации заново:

- **Число 8 пересчитано независимо по CSS.** В `ui/state-contract.css`
  четырнадцать правил состояний, различных имён словаря — восемь: `hover`
  (`.button`, `.form-field-input`, `.form-field-box`, `.site-header-link`),
  `focus-visible` (голый селектор + `.site-header-link`), `pressed`
  (`.button:active`), `disabled` (три носителя), `readOnly`
  (`.form-field-input:read-only:not(:disabled)`), `invalid`
  (`:user-invalid` + `[aria-invalid]`), `checked` (`.form-field-box`,
  `.form-field-box-round`), `indeterminate`. Словарь `naming-states.md`
  и `manifest.allowedStates` — ровно 20 слов. **8 из 20 — верно.**
- **Синхронность числа в четырёх названных файлах:** `ui/state-contract.css:24`,
  `components/STATES.md:78`, `ROADMAP.md:144`, `blocks/form-field.md:9,282` —
  сходятся (по `form-field` число другое и другое по смыслу: 0 снятых из 5
  требуемых полю, включая `readOnly`; это верно).
- **Перенос правила ссылки состоялся полностью.** `grep` по всему `ui/` на
  `:hover|:focus|:active|:disabled|:checked|:indeterminate|:read-only|:user-invalid|aria-expanded|aria-disabled|aria-invalid`
  вне `state-contract.css` — **ноль попаданий**. Дубля в `core.css` нет,
  на его месте комментарий-указатель.
- **Кольцо фокуса — 3 px живьём, а не по каскаду.** Tab-обход
  `showcase/core.html` (14 узлов) и `showcase/primitives.html` (26 узлов):
  у всех `outlineStyle: solid`, `outlineWidth: 3px`, `outlineOffset: 3px`,
  `outlineColor: rgb(6, 208, 239)`, `matches(':focus-visible') === true` —
  включая `.doc-btn` оболочки, `.product-lockup`, `.site-header-link`,
  все семь модификаторов `.button`, четыре `.form-field-input`, `textarea`,
  два чекбокса и радиокнопку. Важная оговорка к методу fix-1: замер
  `outlineWidth` без `outlineStyle` ничего не доказывает — начальное
  значение `outline-width` в Chrome (`medium`) тоже вычисляется как `3px`.
  Мой замер приводит `outlineStyle` и `focus-visible` явно.
- **Светлая тема проверена живьём тоже.** Тот же Tab-обход
  `showcase/primitives.html` при `data-theme="light"` (фон
  `rgb(253, 253, 252)`): на всех 26 узлах ровно одно значение кольца —
  `solid 3px / offset 3px rgb(11, 127, 150)` (`#0B7F96`, светлый акцент
  Хабра), то есть кольцо в светлой теме не теряется и не сливается с
  подложкой. `aria-invalid` в светлой теме даёт `rgb(197, 48, 37)`
  (`#C53025`) толщиной 2 px — как заявлено в статье. Ручная проверка,
  которую сама STATES.md называет обязательной («пройти витрину клавишей
  Tab на светлой и на тёмной теме»), выполнена целиком.
- **`.doc-page :focus-visible` действительно удалён** — и с диска, и из
  того, что отдаёт сервер (`curl /showcase/showcase.css` оставляет только
  комментарий). Оставшийся в оболочке `.ml-legacy a:focus-visible`
  (`showcase/lab.css:51`) кольца не назначает — только `opacity: 1`, — и
  подключён лишь к `showcase/index.html`.
- **Инвариант копируемости METHOD §6.1 проверен голой страницей.**
  Разметка шапки, кнопки, поля, поля `readonly`, чекбоксов и **ссылки без
  единого класса пакета** на пустом документе с одним
  `<link href="/ui/landings.css">` (`document.styleSheets.length === 1`):
  кольцо 3 px/3 px на всех семи узлах Tab-обхода, включая голую `<a>`;
  `border-radius` кнопки 999 px; `readonly` → `border-style: dashed`,
  обычное поле → `solid`; отмеченный чекбокс → `rgb(77, 163, 203)` с
  data-URI галочкой; `indeterminate` → белая черта; шрифт шапки
  `"ALS Hauss", Inter, sans-serif`. Ни одно состояние при копировании
  не теряется.
- **Контрасты пересчитаны независимо** формулой WCAG relative luminance и
  подтверждены в браузере над реальным `getComputedStyle().backgroundColor`
  отмеченного чекбокса: белый на `#4da3cb` = **2.83 : 1** (Хабр, обе темы,
  `tokens.css:363` и `:458`), на `#3670f4` = 4.39 (Курсы, обе темы),
  на `#7963e9` = 4.40 (Карьера, тёмная), на `#7a3df5` = 5.51 (Карьера,
  светлая). Заявленный порог 3 : 1 (WCAG 1.4.11) и его источник в статье
  названы верно.
- **Источник GAP контраста существует и цитируется точно:** `GUIDE.md:537`
  («Надпись на акценте — белая. РЕШЕНИЕ Р-6»), `GUIDE.md:550` (`#4DA3CB`,
  CTA Хабра, **2.83 : 1**), `GUIDE.md:565-582`, `tokens.css:453`,
  `BRIEF.md:489`. Утверждения без источника в новых абзацах не нашёл.
- **GAP `expanded` сведён с реестром:** `manifest.json` `site-header` —
  `status: "partial"`, `missingStates: ["expanded"]`, `step: "R2-05"`,
  `requiredStates: ["default","hover","focus-visible","expanded"]`;
  `blocks/INDEX.md:68` описывает тот же пробел теми же словами; STATES.md
  и `state-contract.css` ссылаются на R2-05. Расхождения по самому
  `expanded` нет (претензия — только к `hover`, находка 1).
- **`footer-social`** остался честным: `missingStates: ["hover"]`, и живьём
  `CSS.forcePseudoState hover` на `.footer-social a` действительно ничего
  не меняет — запись реестра соответствует коду.
- **Шесть валидаторов** — exit 0 каждый, содержимое логов совпадает с
  `fix-1.*.log` построчно: blocks (12 записей, cssRoots и якоря сошлись),
  classes (201 класс в 4 файлах против 11 таблиц, протечек оболочки нет),
  counts (170 утверждений в 17 файлах), normative (775 объявлений в 8
  файлах), radius (8 пар, нарушений 0), tokens (564 ссылки, 69 значений).
- **Словарь состояний** по-прежнему дословно совпадает с
  `.claude/guide/naming-states.md` и с `manifest.allowedStates`; новых слов
  правки не внесли.

Перенесено из review-1 без перепроверки, **не затронуто изменениями**:
подключение `state-contract.css` последней строкой `ui/landings.css`;
наличие классов-целей состояний на разметке витрины; отсутствие молчаливой
подмены статусов в `manifest.json`; соответствие шести исходных строк
матрицы реальным классам пакета; числа контраста цвета ошибки
(`#FF7A70`/`#C53025`, шесть пар); белизна `--product-on-acid` у всех трёх
продуктов в обеих темах; невыдуманность ARIA-механизмов.

## Не проверено

- **Геометрия покоя против Figma и продакшена.** В объём R0-08 не входит
  (шаг о состояниях), `evidence/source/figma/` под эти находки не
  открывал — кроме `14871-1319.md`, попавшего в выдачу grep.
- **Содержимое статей `blocks/site-header.md` и `blocks/footer-social.md`
  за пределами точки стыка со STATES.md** — принадлежит R2-05/R2-03.
  Проверена только изменённая fix-1 фраза про файл нормативных состояний
  (верна: правило теперь действительно в `ui/state-contract.css`).
- **Responsive (320/768/1024/1400) и длинный текст.** Состояния раскладку
  не меняют, ни одно правило `state-contract.css` не трогает размеры
  и потоки; полноценная проверка ширин относится к шагам вёрстки блоков.
- **Наведение мышью как жест.** `:hover` проверялся через
  `CSS.forcePseudoState`, а не движением курсора: в headless-режиме
  реального указателя нет. Для CSS это эквивалентно (тот же пседокласс,
  тот же каскад), но событийная часть (например, поведение на тач-устройстве
  без hover) не проверялась ничем.
- **Печатная и уменьшенная анимация.** `prefers-reduced-motion`,
  `forced-colors` и печать состояний в объём шага не входят и в контракте
  не заявлены; отдельной находкой это не считаю.
