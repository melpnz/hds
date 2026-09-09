# Ревью R0-08 · STATES.md, state-contract.css — итерация 3

Вердикт: **вернуть на доработку**
Режим: **инкрементальный** (есть `review-2.md` и `fix-2.md`; diff локален —
`README.md`, `ROADMAP.md`, `blocks/INDEX.md`, `blocks/form-field.md`,
`blocks/manifest.json`, `blocks/site-header.md`, `components/STATES.md`,
`showcase/primitives.html`, `ui/blocks/core.css`, `ui/landings.css`,
`ui/state-contract.css`; общий CSS entrypoint правлен только комментарием
оглавления, tokens и foundations не тронуты)

Проверено: `components/STATES.md` и `ui/state-contract.css` целиком;
`ui/blocks/core.css:140-180`; `ui/landings.css:1-40`; `blocks/manifest.json`
(записи `product-lockup`, `button`, `form-field`, `marquee`, `footer-social`,
`site-header`, все `statusReason`); `blocks/INDEX.md:65-80`; `README.md:125-135`;
`blocks/site-header.md:125-160`; `blocks/form-field.md:300-320`;
`showcase/core.html`, `showcase/primitives.html`, `showcase/*.css`;
`ui/tokens.css` (слой продукта целиком, области видимости);
`.claude/guide/naming-states.md`, `package-invariants.md`, `review-checklist.md`.
Живая витрина: `tools/serve.mjs` на 4180 (уже был поднят), браузер —
**headless Chrome 152.0.7977.83 через CDP** (`--remote-debugging-port=9335`,
собственный `user-data-dir`, без Playwright/Puppeteer; погашен по PID трёх
процессов, отобранных по командной строке, — чужие окна Chrome не тронуты).
Фокус меряется **парой** `(outlineStyle, outlineWidth)` плюс `outlineOffset`,
`outlineColor` и `matches(':focus-visible')`, обход — настоящими Tab через
`Input.dispatchKeyEvent`. `:hover` — `CSS.forcePseudoState` с замером
**набора** свойств до и после, а не одного.
Контрасты пересчитаны формулой WCAG relative luminance независимо (Node).
Все шесть валидаторов прогнаны заново, exit 0, логи —
`.pipeline/R0-08/review-3.validate-{blocks,classes,counts,normative,radius,tokens}.log`.

## Статус прежних находок

| # (review-2) | Severity | Статус | Чем подтверждено |
|---|---|---|---|
| 1 | major | **закрыта** | `ui/state-contract.css:210-216` включает `.site-header-toggle:hover` и `:focus-visible` в то же правило, что ссылку. Живьём (`CSS.forcePseudoState hover`): `textDecorationLine none → underline` **и** `textUnderlineOffset auto → 4px` — меняются две величины, не одна. На голой странице то же самое. Матрица (`STATES.md:58`), `manifest.json` (`site-header.statusReason`, `missingStates: ["expanded"]`) и `blocks/site-header.md:130-137` говорят одно и то же |
| 2 | major | **закрыта** | `grep -rn "емь состоян\|из двадцати"` по всему пакету: старых формулировок ноль. «Восемь состояний из двадцати» с полным перечнем из восьми имён (с `readOnly`) стоит в `blocks/INDEX.md:73`, `README.md:129`, `components/STATES.md:106`, `ui/state-contract.css:24`, `ROADMAP.md:144` — пять мест, все сходятся |
| 3 | minor | **закрыта** | Арифметика сходится до 20 в обоих файлах и пересчитана мной: 8 (hover, focus-visible, pressed, checked, indeterminate, disabled, readOnly, invalid) + 1 (`default`) + 2 (`expanded`/`collapsed`) + 1 (`success`) + 8 (`loading`, `selected`, `current`, `open`, `closed`, `empty`, `dragActive`, `error`) = 20, пересечений нет, объединение равно словарю. `error` назван явно и отличён от `invalid` осмысленно (состояние блока против состояния контрола) — источнику это не противоречит: `naming-states.md` семантики словам не даёт |
| 4 | minor | **закрыта** | Критерий (`STATES.md:106-110`) — «есть правило в `ui/state-contract.css`», контрпример `expanded` назван прямо. Критерий проверен на всех двадцати словах: правило есть ровно у восьми, у `default` и `success` его нет |
| 5 | minor | **закрыта** | Тема названа рядом с каждым числом в `STATES.md:184-190`, `state-contract.css:162`, `form-field.md:305-310`. Мой независимый пересчёт: `#4DA3CB` 2.831, `#3670F4` 4.393, `#7963E9` 4.398, `#7A3DF5` 5.507 — совпадает с заявленными 2.83 / 4.39 / 4.40 / 5.51. Токены на местах: `ui/tokens.css:378` (`#7963e9`) и `:470` (`#7a3df5`) |
| 6 | minor | **закрыта** | `STATES.md:196-197` теперь утверждает то, что имелось в виду |
| 7 | minor | **закрыта** | `showcase/primitives.html:524-527` говорит «Ни одного из восьми, реализованных пакетом (…), полю формы из них положено пять — 0 из 5 снятых» — сходится с `blocks/form-field.md` |
| 8 | minor | **закрыта частично** | Строка «Ссылка» в матрице появилась (`STATES.md:52`), `disabled` навигационной ссылки переведён в «неприменимо» и комментарий `ui/blocks/core.css:154-159` говорит то же. Но `.product-lockup`, который в пакете **тоже надет на `<a href>`**, из матрицы по-прежнему выпадает — находка 2 ниже. Обоснование самого перевода внутренне противоречиво — находка 4 |
| 9 | note | **перенесена** | `ROADMAP.md:465`, строка `X-20`, с перечнем и владельцами R1-02 / R2-04 |
| 10 | note | **закрыта** | `pressed` у раскрывающегося контрола — «необязательно», различение названо абзацем `STATES.md:76-82` и опирается на разметку (`<button>`, `background: none; border: 0`), а не на удобство |
| 11 | note | **закрыта** | `ui/landings.css:15-18` больше не относит фокус к foundations; `grep -rn ":focus" ui/foundations.css` — пусто |

## Находки итерации 3

| # | ID | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|---|
| 1 | states | **blocker** | B.6, C.12, C.13, A.5 | **Кольцо фокуса исчезает при копировании — вместе с браузерным, то есть фокус пропадает совсем.** `--state-focus-ring: var(--product-accent)` (`ui/state-contract.css:55`) записан **без запасного значения**, а `--product-accent` объявлен только внутри `[data-product="habr"\|career\|courses"]` (`ui/tokens.css:359,374,389,456,468,482`) — в `:root` его нет. На странице без атрибута `data-product` подстановка пуста, весь шорткат `outline: var(--state-focus-width) solid var(--state-focus-ring)` (`:96`) становится недействительным на этапе вычисления и берёт `unset` → `outline-style: none`. Замерено: `outline-style=none width=3px offset=3px color=rgb(242,240,235) fv=true`, `--state-focus-ring=""`. Ширина 3px здесь ничего не значит — это `medium`, начальное значение, ровно та ловушка, о которой review-2 предупреждало. Хуже того: объявление выигрывает каскад у UA-правила, поэтому **и собственное кольцо браузера уничтожено** — клавиатурный обход становится невидимым, а не «менее красивым». Это ровно тот отказ инварианта копируемости, который статья объявляет закрытым: «разметку из любой статьи вставляют на пустую страницу с одним `ui/landings.css`, и в этой разметке есть ссылки, поля и кнопки без классов пакета. Кольцо, привязанное к `.button`, оставило бы их без фокуса» (`STATES.md:132-136`, то же в `state-contract.css:86-98`). Требование `data-product` на корне нигде в пакете не записано: `README.md`, `GUIDE.md`, `blocks/INDEX.md`, шапки `ui/landings.css` и `ui/tokens.css` о нём молчат (единственное упоминание — `GUIDE.md:376` и `blocks/hero.md:25`, и то про подсветку hero, а не про работоспособность пакета). Ядро при этом от атрибута не зависит: `--core-text-primary` на той же голой странице отдаёт `#f2f0eb`. **Второй симптом того же корня:** `.form-field-box:checked` (`:163-170`) теряет заливку (`background-color: rgba(0,0,0,0)` вместо `rgb(77,163,203)`), но белую галочку data-URI сохраняет — отмеченный чекбокс становится белым знаком на прозрачном, то есть состояние формально есть и практически невидимо. Утверждение review-2 «Ни одно состояние при копировании не теряется» опиралось на страницу, где `data-product` был выставлен, — то есть проверялось условие сильнее того, что заявляет инвариант | `ui/state-contract.css:55` (`--state-focus-ring` без fallback) и `:95-98`; `ui/state-contract.css:163-165`; ложные утверждения — `components/STATES.md:130-136`, `ui/state-contract.css:86-98`; область видимости токена — `ui/tokens.css:353,368,383,452,464,478` | На живой витрине, без единой правки файлов: открыть `http://127.0.0.1:4180/showcase/core.html`, выполнить `document.documentElement.removeAttribute('data-product')`, пройти Tab и снять `getComputedStyle(document.activeElement).outlineStyle`. До: `solid 3px offset 3px rgb(6,208,239)`, `--state-focus-ring="#06d0ef"`. После: **`none`**, `--state-focus-ring=""`. То же на голой странице (`Page.setDocumentContent`, один `<link href="/ui/landings.css">`, `document.styleSheets.length === 1`): без `data-product` — `style: none` на всех семи узлах обхода, включая голые `<a>` и `<button>`; с `data-product="habr"` — `solid 3px` на всех |
| 2 | states | **major** | C.11, A.5, E.19 | **`.product-lockup`, надетый на `<a href>`, из матрицы выпадает — тот же пробел, который fix-2 объявил закрытым строкой «Ссылка».** Матрица относит лок-ап к виду «Знак и лента» с «Обязательно: `default`», «Неприменимо: **все остальные**» (`STATES.md:57`), а проза добавляет «лок-ап и лента интерактивными не бывают» (`:99`); `blocks/manifest.json` (`product-lockup`) повторяет: `status: "complete"`, `requiredStates: ["default"]`, «лок-ап интерактивным не бывает». В пакете это неправда в двух местах сразу: `showcase/core.html:70` и `:84` — `<a class="product-lockup" href="#site-header">` (замерено `tabIndex=0`), и **разметка самой спецификации** `blocks/site-header.md:142` — `<a class="product-lockup" href="/">`. Живьём такой лок-ап получает фокус и кольцо (`A.product-lockup site-header-cobrand :: style=solid width=3px offset=3px color=rgb(6,208,239) fv=true`) — то есть `focus-visible`, объявленное «неприменимым», у него фактически есть; а по новой строке «Ссылка» ему был бы обязателен ещё и `hover`, которого нет ни одним правилом и который не записан в `missingStates` (у записи их вовсе нет). Матрица устроена «по видам элементов, единица здесь класс-носитель» (`fix-2.md`), и класс-носитель здесь стоит на ссылке. Приём «состояние принесёт ссылка внутри неё, а не карточка» (`STATES.md:101-102`) к этому случаю не применим: класс не внутри `<a>`, а на самом `<a>` | `components/STATES.md:57` и `:97-102` против `showcase/core.html:70,84` и `blocks/site-header.md:142`; `blocks/manifest.json:86-89` (`product-lockup`: `statusReason`, `requiredStates`) | `grep -n "product-lockup" landings/showcase/core.html` — два `<a href>`; в браузере `document.querySelector('a.product-lockup').tabIndex` → `0`, Tab-обход `core.html` даёт на нём `solid 3px / offset 3px rgb(6,208,239)`, `fv=true`; `CSS.forcePseudoState hover` на нём не меняет ничего |
| 3 | states | minor | E.19 | `statusReason` записи `footer-social` называет **не ту строку матрицы**: «по матрице `components/STATES.md` **ссылка-кнопка** обязана его нести», тогда как `STATES.md:51` закрепляет термин «ссылка-кнопка» за видом «Действие» (`.button` на `<a>`), а `.footer-social-tile` стоит в новом виде «Ссылка» (`:52`). Термин ввёл сам fix-2 и по реестру не пронёс. `blocks/INDEX.md:69` ту же мысль формулирует правильно («по матрице строка „Ссылка“ обязана его нести»), поэтому два описания одного пробела расходятся | `blocks/manifest.json:405` против `components/STATES.md:51-52` и `blocks/INDEX.md:69` | `grep -n "ссылка-кнопка" landings/blocks/manifest.json landings/components/STATES.md` |
| 4 | states | minor | I.37, E.19 | **Обоснование нового вида противоречит собственному CSS пакета через десять строк.** `STATES.md:60-62`: «Различает не внешний вид, а разметка: у `<a>` нет атрибута `disabled`, и выключенной ссылки в HTML не бывает… Поэтому `disabled` ссылке неприменим». `STATES.md:70-74`, тот же абзац: «Ссылка же, надетая на класс `.button` … остаётся в строке „Действие“ целиком, **включая `disabled` через `[aria-disabled="true"]`**», и `ui/state-contract.css:116-117` действительно выключает `<a class="button">` этим селектором. Один и тот же элемент `<a>` оказывается одновременно неспособным и способным нести `disabled`; различает их на деле класс, то есть ровно «внешний вид», который абзац отрицает. Настоящая причина у перевода другая и она в тексте не названа: выключенного пункта меню в 18 макетах не встретилось и механизм ему не нужен | `components/STATES.md:60-62` против `:70-74` и `ui/state-contract.css:115-121` | Прочесть абзац `STATES.md:60-74` целиком рядом с `state-contract.css:115-121` |
| 5 | states | note | E.19 | Группа «носителя нет» объясняет себя фразой «элементов, которым они принадлежат — кнопка в работе, вкладка, окно, пустой список, — в пакете нет ни одного» (`STATES.md:212-214`), и в ней же стоит `current`. Для `current` носитель (ссылка) в пакете есть — нет многостраничной навигации, что сам файл двадцатью строками выше и говорит (`:66-69`). Арифметика до 20 от этого не страдает, неточен только заголовок группы для одного слова из восьми | `components/STATES.md:212-218` против `:66-69` | Читается в одном файле |

## Что проверено и претензий нет

Проверено в этой итерации заново:

- **`:hover` кнопки раскрытия — живьём, парой свойств.** `CSS.forcePseudoState`
  на `.site-header-toggle`: `{textDecorationLine: none, textUnderlineOffset: auto,
  backgroundImage: none, color: rgb(242,240,235)}` → `{underline, 4px, none,
  rgb(242,240,235)}` — изменились **две** величины из четырёх замеренных, обе
  от правила `ui/state-contract.css:210-216`. Для `.site-header-link` меняется
  одна (`textUnderlineOffset` у него `4px` уже в покое). У `.button` вуаль
  появляется: `backgroundImage: none → linear-gradient(rgba(255,255,255,0.12),
  rgba(255,255,255,0.12))`. Правило одно на два контрола, как и заявлено.
- **Синхронность числа 8 — по всему пакету, а не по названным файлам.**
  `grep -rn "емь состоян"` и `grep -rn "из двадцати"` по всем `*.md`, `*.html`,
  `*.css`, `*.json` вне `.pipeline`: старых формулировок **ноль**. Перечень из
  восьми имён с `readOnly` совпадает дословно в `INDEX.md:73`, `README.md:129`,
  `state-contract.css:24`, `ROADMAP.md:144`.
- **Восьмёрка пересчитана по CSS независимо.** В `ui/state-contract.css`
  различных имён словаря ровно восемь; правила `default` нет ни одного —
  значит объявленный критерий («есть правило в этом файле») точен и
  на границе, а не только на примере `expanded`.
- **Словарь — 20 слов, три источника совпадают дословно и по порядку:**
  `.claude/guide/naming-states.md:10-13`, `components/STATES.md:29-32`,
  `blocks/manifest.json` `allowedStates` (33-54). Новых слов правки не внесли.
- **Матрица — восемь строк**, ровно как заявляет `ROADMAP.md:144`
  («по восьми видам»).
- **Контрасты пересчитаны формулой WCAG независимо** (Node, relative
  luminance): `#4DA3CB`/белый = 2.831, `#3670F4` = 4.393, `#7963E9` = 4.398,
  `#7A3DF5` = 5.507 — заявленные 2.83 / 4.39 / 4.40 / 5.51 верны, тема
  названа рядом с каждым числом в трёх местах. Таблица цвета ошибки тоже
  сходится: `#FF7A70` 8.270 / 5.805 / 3.019, `#C53025` 5.396 / 5.025 / 5.492
  против заявленных 8.27 / 5.81 / 3.02 и 5.40 / 5.03 / 5.49.
- **`manifest.json` `site-header` сведён с CSS и с матрицей:** `status:
  "partial"`, `requiredStates: ["default","hover","focus-visible","expanded"]`,
  `missingStates: ["expanded"]`, `step: "R2-05"`; `statusReason` называет оба
  контрола и раздел 6. Матрица требует те же четыре, реализованы три
  (проверено живьём), не закрыт один — и это ровно то, что записано.
- **`footer-social` остался честным по существу:** `missingStates: ["hover"]`,
  и живьём `CSS.forcePseudoState hover` на `.footer-social-tile` не меняет
  ни одного из семи замеренных свойств. Претензия только к формулировке
  (находка 3).
- **Фокус на витрине — настоящим Tab, парой свойств, в обеих темах.**
  `core.html` тёмная: 30 узлов, отклонений 0, все `solid 3px / offset 3px
  rgb(6,208,239)`, `fv=true`. `primitives.html` тёмная: 33 узла, 0 отклонений,
  то же. `primitives.html` светлая (`data-theme="light"`, фон
  `rgb(253,253,252)`): 33 узла, 0 отклонений, `solid 3px / offset 3px
  rgb(11,127,150)`. Ручная проверка, которую сама статья называет
  обязательной, выполнена целиком — **но только при выставленном
  `data-product`** (см. находку 1).
- **Ширины.** `core.html` при 320 / 768 / 1024 / 1400:
  `scrollWidth === clientWidth` (305 / 753 / 1009 / 1385) — горизонтального
  overflow нет ни на одной. `primitives.html` 320 и 1400 — то же.
- **Состояния сохраняются при копировании (кроме находки 1).** На голой
  странице с одним `ui/landings.css` (`document.styleSheets.length === 1`):
  `readonly` → `border-style: dashed`, обычное поле → `solid`, отмеченный
  чекбокс несёт галочку data-URI, `indeterminate` — черту, `.button`
  и `.site-header-*` наведение дают. Теряются только те свойства, что
  идут через `--product-*`.
- **Состояния живут в одном файле.** `grep` по всему `ui/` на
  `:hover|:focus|:active|:disabled|:checked|:indeterminate|:read-only|:user-invalid|aria-expanded|aria-disabled|aria-invalid`
  вне `state-contract.css` — единственное попадание — слово `:focus` внутри
  комментария `ui/landings.css:17`.
- **Оболочка витрины кольца не назначает.** `grep -n focus showcase/*.css`:
  в `showcase.css` осталась только строка комментария (`:54`), в `lab.css` —
  `.ml-skip:focus` (позиционирование скип-ссылки) и `.ml-legacy a:focus-visible`
  (только `opacity`), подключён `lab.css` лишь к `showcase/index.html`.
- **`.form-field-textarea` покрыт**, хотя правила названы на
  `.form-field-input`: и в спецификации (`form-field.md:268`), и на витрине
  (`primitives.html:235`) класс всегда идёт парой
  `class="form-field-input form-field-textarea"`.
- **Карточки и чипы ссылками нигде не стали:** `grep` по витрине и статьям —
  `.card` только на `<article>`, `.glass-chip` и `.marquee` интерактивными
  не размечены, живьём `hover` на `.card` не меняет ни одного из пяти
  замеренных свойств. Строки матрицы «Плоскость», «Статичная метка»
  и `.marquee` из «Знак и лента» верны (претензия только к `.product-lockup`).
- **`ui/landings.css:15-18`** описывает слой foundations верно: фокуса там
  нет ни одного.
- **Шесть валидаторов** — exit 0 каждый: blocks (12 записей, cssRoots
  и якоря сошлись), classes (201 класс в 4 файлах против 11 таблиц,
  протечек оболочки нет), counts (170 утверждений в 17 файлах), normative
  (775 объявлений в 8 файлах, 3 нормативные области), radius (8 пар,
  нарушений 0), tokens (565 ссылок в 11 файлах CSS и 20 статьях, 69 значений).
  Совпадает с `fix-2.*.log` построчно.
  Логи: `.pipeline/R0-08/review-3.validate-{blocks,classes,counts,normative,radius,tokens}.log`.

Перенесено из review-1 и review-2 без перепроверки, **не затронуто
изменениями**: подключение `state-contract.css` последней строкой
`ui/landings.css`; наличие классов-целей состояний на разметке витрины;
отсутствие молчаливой подмены статусов в `manifest.json`; невыдуманность
ARIA-механизмов; источник GAP контраста (`GUIDE.md:537,550`, `tokens.css:453`,
`BRIEF.md:489`); белизна `--product-on-acid` у всех трёх продуктов в обеих
темах; поимённый список голых селекторов стенда в `tools/validate-classes.mjs`.

## Не проверено

- **Геометрия покоя против Figma и продакшена.** В объём R0-08 не входит —
  шаг о состояниях; `evidence/source/figma/` под находки этой итерации
  не открывал.
- **Содержимое `blocks/site-header.md`, `blocks/footer-social.md`
  и `blocks/product-lockup.md` за пределами точки стыка со STATES.md** —
  принадлежит R1-01/R2-03/R2-05. У `site-header.md` проверена только
  изменённая fix-2 фраза про два контрола (верна) и блок «Разметка»
  (он и дал находку 2).
- **Наведение мышью как жест.** `:hover` проверялся `CSS.forcePseudoState`,
  а не движением курсора: в headless реального указателя нет. Для каскада
  это эквивалентно, событийная часть (тач без hover) не проверялась ничем.
- **`prefers-reduced-motion`, `forced-colors`, печать.** В объём шага
  не входят и в контракте не заявлены; находкой не считаю. Отдельно
  отмечу, что при `forced-colors` поведение `outline` из находки 1 может
  оказаться другим — это не проверялось.
- **Длинный текст и пустое значение (D.16).** Ни одно правило
  `state-contract.css` не трогает размеры и потоки; полноценная проверка
  относится к шагам вёрстки блоков.
