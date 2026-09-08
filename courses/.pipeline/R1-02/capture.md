# R1-02 · снятость состояний — протокол

Шаг: для каждой пары (запись `manifest.json`, состояние из её
`requiredStates`) сказать явно — снято оно источником или дописано
нормативом в `ui/state-contract.css`. Второй и последний шаг волны R1
(первый — R1-01, `components/STATES.md`, принят, `4fe1bf5`→приёмка).

Метод перечитан заново (`.claude/guide/METHOD.md`) перед началом, в
частности §3 (иерархия источников), §4 (факт/норматив/GAP), §6.1
(копируемость), §8 (доказательность правил — частое против редкого).
`career/` не открывался. `_sources/courses` (собственные read-only
источники Курсов, не `career/`) открывался — это разрешено методом,
внутри ничего не правилось.

## Источники, использованные как факт (без пересъёмки)

- `components/STATES.md`, `components/manifest.json` — принятые R1-01,
  словарь, матрица требуемости, `requiredStates` всех 55 записей,
  `productionEvidence`/`figmaEvidence`/`storybookEvidence`/`notes`.
- `evidence/source/production/pages/*/dom.html` (10 файлов, 1440) —
  прямые выписки, не пересчёт R1-01 заново (числа `hover:`/`focus-visible:`/
  `disabled:`/`aria-current`/`swiper-slide-active` взяты из STATES.md §4.1
  как принятый факт), но **новое** измерение по каждой записи отдельно
  (§2 ниже) и полная перепись узлов с `outline-none` (нового не было в
  R1-01).
- `_sources/courses/rendered/*.html` (27 отрендеренных Storybook-story) —
  прочитаны полностью (250–1800 байт каждый), не пачкой. Три файла дали
  находки, которых не было в `STATES.md`: `common-baseswitch--base-switch-story.html`
  (checked/hover/focus-visible Switch — раньше не процитированы),
  `common-basefilterwithimage--active.html` (selected TileFilter — story
  называется «active», но по словарю задания это `selected`, не
  запрещённое слово в самом реестре: имя story — не наше слово состояния),
  `forms-basecustomselect--base-story.html` (disabled Select через
  `disabled:ring-*`, и `aria-expanded="false"` на триггере — комбобокс
  реализован иначе, чем в проде, см. «Конфликты источников»).
- `evidence/source/production/css/inline/*.css` — проверка, что в сборке
  нет глобального `*:focus-visible` (иначе точечный `outline-none` мог бы
  быть перекрыт извне и не быть проблемой).
- `ui/tokens.css` — только чтение существующего `--color-ui-black-400`
  для норматива; новых переменных не заведено.

## Метод разметки

1. **Матрица «снято/не снято»** построена не рассуждением, а прогоном
   `.pipeline/R1-02/measure-states.mjs` (разовый скрипт, не гейт, не в
   `tools/`) по всем записям `sourceScope: production` — тем же приёмом,
   что `tools/measure-selectors.mjs` (Playwright, `javaScriptEnabled:
   false`, тот же `dom.html`), но вместо счёта узлов вытаскивает их
   `outerHTML`. Команда и результат — `.pipeline/R1-02/dom-dump.json`.
2. **Отдельное правило различения факта-дефолта от норматива** для
   `hover`/`focus-visible` (`components/STATE-CAPTURE.md` §1): `hover`
   у плоской кнопки не имеет браузерного дефолта, который можно сломать,
   — значит у него не бывает норматива, только «стиль найден»/«стиля
   нет, и это нормально». `focus-visible` — наоборот, дефолт есть
   (видимый контур), и его можно явно снять (`outline-none`); норматив
   нужен только там, где снято и не заменено. Проверено по всему
   корпусу: 30 узлов с `outline-none`/`focus:outline-none`, у 29
   компенсация есть (20 — `focus-visible:*`, 9 — `focus-within:*` на
   обёртке полей выбора), не скомпенсирован ровно 1 — триггер
   `HeaderDropdown`.
3. **Каждая пара** (55 записей × её `requiredStates`, всего 147, из них
   92 сверх `default`) получила решение в
   `.pipeline/R1-02/decisions.json` — построчный протокол в
   `components/STATE-CAPTURE.md` §3, сведённый в машиночитаемый вид
   этим файлом. Проверка полноты:

   ```
   $ node -e '
   const m = require("./components/manifest.json");
   const dec = require("./.pipeline/R1-02/decisions.json");
   let total=0, buckets={};
   const missing=[];
   for (const c of m.components) {
     for (const s of c.requiredStates) {
       if (s==="default") continue;
       total++;
       const d = (dec[c.id]||{})[s];
       if (!d) missing.push(c.id+"."+s);
       buckets[d]=(buckets[d]||0)+1;
     }
   }
   console.log("total non-default pairs:", total);
   console.log(buckets);
   console.log("missing decisions:", missing);
   '
   total non-default pairs: 92
   {
     'captured-style': 26,
     'captured-default': 20,
     gap: 36,
     'captured-mechanism': 4,
     normative: 2,
     'captured-trivial': 1,
     'captured-weak': 3
   }
   missing decisions: []
   ```

   54 пары сняты (`captured-*` = 26 + 20 + 4 + 3 + 1, пересчитано
   `node -e "console.log(26+20+4+3+1)"` → 54; правка после находки 1
   review-1.md — `checkbox.checked`/`checkbox.disabled` переведены
   `gap`→`captured-style`, `checkbox.focus-visible` — `gap`→`captured-mechanism`,
   см. «Правка Checkbox» ниже), 2 дописаны нормативом, 36 остаются
   явно адресованным GAP (не «пропущено» — у каждой назван шаг, на
   котором она получит настоящее решение). `default` снят у всех 55
   записей без исключения (обязательное условие манифеста, проверено
   `validate-components.mjs`; отдельно не пересчитывался).
4. Машиночитаемая проекция: три новых поля на каждой записи
   `manifest.json` — `capturedStates`, `normativeStates`,
   `uncapturedStates` (партиция `requiredStates`, вставлены сразу после
   него), и top-level `stateCaptureMatrix` (по образцу
   `requiredStatesMatrix`: `status: "done"`, `step: "R1-02"`,
   `ref: "components/STATE-CAPTURE.md"`).

## Решения при конфликте источников

- **`Select` в проде и в Storybook — разные узлы.** Прод:
  `<input class="cursor-pointer" placeholder="…">` внутри
  `.v-popper--theme-dropdown`. Storybook
  (`forms-basecustomselect--base-story.html`): `<button role="combobox"
  aria-expanded="false">…</button>` — комбобокс, не текстовое поле.
  Разошлись API и семантика одного и того же компонента. Решение по
  METHOD §3 (production выше Storybook): для формы/семантики авторитетен
  прод (`<input>`, `focus-within:border-*`), уже так и записано в
  `STATES.md`/`manifest.json` — этот шаг это не пересматривает. Но
  Storybook-факт **не отброшен**: он даёт то, чего прод не даёт вовсе —
  `disabled:ring-1 disabled:ring-inset disabled:ring-ui-black-500`
  (использован как «снято» для `select.disabled`) и подтверждение, что
  `aria-expanded="false"` вообще существует в реализации хоть где-то
  (не помогает открытому состоянию — там нужно `="true"`, которого нет
  ни в одном источнике). Конфликт зафиксирован явно в
  `STATE-CAPTURE.md` §3.1, не сглажен молчаливым выбором одного узла.
- **`TileFilter` story называется `--active`, не `--selected`.** Имя
  story — данность Storybook, не наше слово состояния (METHOD §5
  запрещает `active` в словаре пакета, а не в именах чужих story).
  В `STATE-CAPTURE.md` состояние называется `selected` (по механике —
  членство в выборе фильтра, N4), имя story процитировано отдельно как
  источник, не как имя состояния.
- **Число `outline-none`-узлов (30) не совпадает с интуитивной оценкой
  «раз Button один компонент — должно быть меньше вхождений».** Дело в
  том, что один и тот же Button/ссылка встречается на разных страницах
  повторно (191 занятие focus-visible:outline — число вхождений, не
  число уникальных компонентов); 30 в §2 — уникальные по тексту класса
  узлы (`sort -u`), а не по факту размещения на странице. Число
  пересчитано; при первом проходе в двух местах `STATE-CAPTURE.md`
  (закрывающая фраза §2.1 и разбор `HeaderDropdown` в §3.2) по ошибке
  стояло 32 вместо 30 — ошибка найдена и исправлена по находке 3
  review-1.md (см. `fix-1.md`). Итоговое число везде — **30** (20
  inline-компенсация `focus-visible:*` + 9 `focus-within:*` + 1 без
  компенсации, `HeaderDropdown`), сведено по всем местам обоих
  документов.

## Не удалось снять / оставлено как явный GAP

36 пар — полный список и адрес (шаг, куда передано решение) —
`components/STATE-CAPTURE.md` §3.1–3.2, сведены по причине в §4
(«Что не попало в норматив, хотя состояние не снято, — и почему»).
Коротко по группам:

- **`pressed`** у `Button`/`IconButton`/`FilterChip`/`TileFilter` (4
  пары) — 0 вхождений `active:*` во всём корпусе; GAP собственного шага
  вёрстки каждой записи (R2/R3), не норматив (нет сломанного дефолта).
- **Открытая раскладка** `Select`/`MultiSelect`/`FilterModal`/
  `CatalogMenu` (4 пары `open`) плюс их зависимые состояния внутри
  панели (`MultiSelect.checked`, `Select.invalid`, `MultiSelect.invalid`,
  `MultiSelect.disabled` — 4 пары) — содержимое панели ни разу не
  отрисовано ни в проде, ни в Storybook; манифест уже поручает эту
  раскладку Figma **на шаге вёрстки записи**, а не этому шагу (решение
  пользователя 5, BRIEF.md §9; долг X-14). Норматив не написан
  сознательно — писать его сейчас значило бы придумывать структуру.
- **`CardGrid.empty`** — вопрос состава (чем заменить сетку — `EmptyState`,
  который сам ещё figma-only, шаг R4-14), не CSS-механика; CSS-grid с
  нулём детей не ломается сам по себе.
- **`Tab`/`Pagination`/`Breadcrumbs`/`TextInput`** (figma-only, 4
  записи, 16 пар) — ни продуктового, ни устойчивого дефолта нет вовсе;
  собственные шаги R3-09…R3-15.
- **`TileFilter.hover/focus-visible/disabled`**, **`Switch.disabled`**,
  **`MultiSelect.disabled`**, **`Checkbox.hover/indeterminate`** —
  Storybook-рендер не показывает эти варианты (у `Checkbox` — только эти
  два состояния; `checked`/`disabled`/`focus-visible` переклассифицированы
  в «снято», см. правку находки 1 review-1.md ниже); собственные шаги
  R3-11/R3-12/R3-07/R3-10.

## Долг, обнаруженный этим шагом (не внесён в ROADMAP.md)

- `filter-chip.productionEvidence[0].selector` требует классы
  `.bg-ui-white.border-ui-black-100`, которые есть только у невыбранного
  чипа — 5 выбранных чипов (`bg-ui-black-850`, по одному на
  `education-center`, `education-centers-listing`, `promocodes`,
  `reviews`, `schools-for-children`) этим селектором не находятся, и
  заявленные `occurrences: 107/5` их не считают. Обнаружено при поиске
  evidence для `filter-chip.selected`, не входит в объём этого шага
  (правка `productionEvidence`/`occurrences` — предмет R1-01 или
  отдельной правки счёта).
- `.pipeline/R1-01/capture.md` называет адрес GAP `LinkGrid.expanded`
  как «шаг вёрстки LinkGrid (R5)», а `manifest.json` → `link-grid.step`
  — `R4-10` (R5 в ROADMAP.md вообще не про LinkGrid). Использован
  `manifest.json` как машиночитаемый и сверяемый `validate-components.mjs`
  источник; текст прошлого протокола не правился — не предмет этого шага.
- `TileFilter`/`Switch.disabled` — эти записи не используются ни на
  одной из 10 captured-страниц и не отрисованы Storybook в нужном
  варианте; их собственных CSS-чанков (или utility-классов состояния)
  нет ни на одной странице, ни в `evidence/source/production/css/external/`.
  Первая настоящая досъёмка — R3-11/R3-12.
  **Уточнение по находке 1 review-1.md:** ранее в этом же пункте
  ошибочно стоял и `Checkbox` — заявление «CSS-чанка нет в evidence»
  было неверным. `evidence/source/production/css/external/similar-courses.DqXT-MW0.css`
  содержит рабочие правила `.base-checkbox--disabled{opacity:.5}`,
  `.base-checkbox__wrapper--disabled{cursor:not-allowed}`,
  `.base-checkbox__input:focus+.base-checkbox__button{border-color:var(--color-ui-black-400)}`
  и `.base-checkbox__input:checked+.base-checkbox__button{background-color:var(--color-ui-black-850);…;border-color:var(--color-ui-black-850)}`
  (полный текст — команда ниже). `checkbox.disabled`/`checkbox.checked`
  переклассифицированы в «снято — продуктовый стиль», `checkbox.focus-visible` —
  в «снято — иная механика» (реальный `:focus`, не `:focus-visible`, тот
  же приём, что принят для `select`/`multi-select`/`search-input` через
  `focus-within`, только здесь — соседний `:focus` через `+`-комбинатор).
  Проверка воспроизводима:
  ```
  grep -o '[^}{]*base-checkbox[^}{]*{[^}]*}' \
    evidence/source/production/css/external/similar-courses.DqXT-MW0.css
  ```
  `checkbox.hover` и `checkbox.indeterminate` остаются GAP — ни в этом
  чанке, ни в остальном корпусе `evidence/source/production/css/` (все
  10 `inline/*.css` + все 12 `external/*.css` проверены командой
  `grep -rl 'base-checkbox' evidence/source/production/css/` — совпадение
  только в `similar-courses.DqXT-MW0.css`) нет ни `:hover`, ни
  `:indeterminate`/`aria-checked="mixed"` правила для этого компонента.
  Проверено, не пропущен ли этот же чанк для других записей манифеста:
  `similar-courses.DqXT-MW0.css` — единственный файл во всём корпусе,
  где встречается `base-checkbox`; ни у одной другой storybook-only
  записи манифеста в `storybookEvidence[].note` нет упоминания BEM-классов
  (`grep`-проверка note-полей на `base-[a-z]+__`/«BEM» — совпадение только
  у `checkbox`, чья собственная заметка и называет его «единственным
  BEM-компонентом»). Пропуска по аналогии у других записей не найдено —
  находка ограничена одной записью.
- **Новый долг, обнаруженный при проверке находки 1.** Тот же чанк
  (`similar-courses.DqXT-MW0.css`) содержит классы `.header-catalog__icon`,
  `.header-catalog__icon-item--hidden` (поворот/масштаб иконки-гамбургера)
  и Vue-переходы `.header-catalog-menu-enter-active/-leave-active/-enter-from/…`
  — по имени это явно механика открытия/закрытия `CatalogMenu` (сейчас
  запись `sourceScope: figma-only`, `catalog-menu.open` — GAP с
  обоснованием «компонента нет ни в проде, ни в Storybook»). Наличие
  этих правил в продовой сборке — факт, который стоит проверить на шаге
  вёрстки `CatalogMenu` (R4-13): либо `sourceScope` придётся пересмотреть
  на «production» (CSS есть в сборке, даже если DOM-узел ни разу не
  пойман в раскрытом виде на 10 captured-страницах), либо явно
  зафиксировать, что это CSS без парного DOM-подтверждения. Не
  переклассифицировано этим шагом (не входит в объём находки 1 — там
  речь только о `Checkbox`, `CatalogMenu` не редактировался).
- **Невоспроизводимая команда, унаследованная из `STATES.md` (R1-01,
  принят `4fe1bf5`).** `grep -o 'focus-visible:outline' … | wc -l` →
  191 (`STATES.md:225`, процитировано этим шагом как факт в §2.1). Число
  верно (совпадает с `occurrences` Button день в день), но сама команда
  считает подстроку `focus-visible:outline` дважды на каждом узле, где
  она несёт продолжение `focus-visible:outline-ui-black-400` — без учёта
  границы токена буквальный повтор той же команды на этом корпусе даёт
  382. Найдено ревью (`review-1.md`, доп. находка, помечена minor), не
  входит в объём этого шага — файл `STATES.md` чужой и уже принят;
  правка команды (не числа — оно верно) — предмет отдельной правки
  R1-01 или её долга.

## Расхождение с буквальным текстом exit criteria — явно, не тихо

ROADMAP.md формулирует exit criteria волны R1 как «для каждого состояния
сказано, снято оно или дописано» — грамматически бинарно. Из 92 пар
сверх `default` дописаны нормативом только 2; оставшиеся 36 — явный GAP
с именем и адресом (шагом), а не норматив и не «снято». Решение не писать
для них CSS принято по прямому требованию задания «не раздувай
`state-contract.css` тем, что не является пробелом» и по METHOD §4
(«правдоподобная догадка, выданная за факт продукта, — провал шага»):
у всех 36 пар — либо нет ни одного источника для значения (открытые
раскладки, содержимое CardGrid), либо отсутствие визуального решения не
блокирует сборку компонента (`pressed`, disabled/invalid полей форм).
Формально это раскрытие критерия («дописано» = «дописано там, где
дописать — факт»), а не третий исход, но само расхождение с буквой текста
называется здесь прямо и выносится на подтверждение приёмки — решение
не должно быть принято тихо мной же на этом шаге.

## Гейты

```
$ node tools/validate-components.mjs --strict
Validated 55 component records.
Словари METHOD §5 сверены с ../.claude/guide/METHOD.md.
Status counts: {"complete":0,"partial":0,"planned":55,"legacy-only":0,"figma-only":0}
Source scope counts: {"production":44,"storybook-only":5,"figma-only":6}

Отложено (1) — предмета ещё нет:
- спецификации — 55 записей в статусе planned; сходимость реестра (METHOD §6.5) проверяется на них не полностью

Объявлено (3) — известно, названо в манифесте, не закрыто:
- componentKey 9668fb89eb4a58bc781b568ec83d9ce0e492e70e у записей filter-chip, tab — инвентаризация записала один ключ и FilterChip, и Tab: либо это один component set, либо ошибка переноса. Разводится на R3-04 и R3-13
- зависимость верстается позже: site-header (R4-01) → header-dropdown (R4-02)
- зависимость верстается позже: page-hero (R4-05) → search-form (R4-06)

Manifest structure is valid.
```

```
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
```

```
$ for f in tools/*.mjs; do node --check "$f" || echo "FAIL $f"; done
(без вывода — все семь файлов синтаксически валидны)
$ node --check .pipeline/R1-02/measure-states.mjs
(без вывода — валиден)
```

Блоки «Объявлено»/«Отложено» и число токенов/шагов не изменились этим
шагом (ожидаемо: этот шаг не трогал `ui/tokens.css`, `ROADMAP.md` и
инвентаризацию) — сверено построчно с выводом R1-01 (`.pipeline/R1-01/capture.md`).

### Копируемость METHOD §6.1

Временный `.pipeline/R1-02/copy-check.html` (пустая страница + один
`<link rel="stylesheet" href="../../ui/courses.css">`), открыт настоящим
браузером (Playwright, Edge) без сервера. Проверено: `document.styleSheets`
содержит ровно один файл (`ui/courses.css`), 0 `pageerror`/`console.error`,
и правило `.crs-header-dropdown__trigger:focus-visible` реально
применяется — `getComputedStyle` после `.focus()` вернул
`outlineStyle: "solid"`, `outlineColor: "rgb(166, 167, 169)"`, что равно
`--color-ui-black-400: #a6a7a9` (166/167/169 — та же тройка). Файл
удалён после проверки, посмотрено — не оставлено в пакете.

## Файлы

- `components/STATE-CAPTURE.md` — новый файл, протокол снятости всех
  147 пар (`default` + 92 прочих), правило различения факта-дефолта от
  норматива, разбор `HeaderDropdown.focus-visible`, список того, что
  попало в `ui/state-contract.css`, и явный список того, что не попало
  и почему.
- `components/manifest.json` — три новых поля на каждой из 55 записей
  (`capturedStates`, `normativeStates`, `uncapturedStates`), top-level
  `stateCaptureMatrix` (по образцу `requiredStatesMatrix`).
- `ui/state-contract.css` — новый файл, два правила («новая реализация»):
  видимый фокус триггера `HeaderDropdown`, снятие зажима высоты
  `LinkGrid.expanded`.
- `ui/courses.css` — добавлен `@import url("state-contract.css");` между
  `utilities.css` и `components/*.css` (место уже было зарезервировано
  комментарием точки входа с R0-04); комментарий обновлён с «появится
  позже» на факт подключения.
- `.pipeline/R1-02/measure-states.mjs` — разовый измерительный скрипт
  (не гейт, не в `tools/`), воспроизводимый.
- `.pipeline/R1-02/dom-dump.json` — его вывод, рабочий файл конвейера.
- `.pipeline/R1-02/decisions.json` — решение по каждой из 92 пар,
  машиночитаемый источник для полей `manifest.json` и для сверки
  полноты (см. «Метод разметки» п. 3).
- `components/INDEX.md` — шесть строк, документирующих новые поля
  манифеста (`capturedStates`/`normativeStates`/`uncapturedStates`) в
  разделе про `requiredStates`. Пропущен в этом списке в первой
  редакции — note-находка review-1.md, добавлен здесь.
- `.pipeline/R1-02/capture.md` — этот протокол.

Статус `done` этому шагу не присвоен — ставит его `guide-accept`.
`ROADMAP.md` не редактировался (обновление статуса и результатов шага —
на приёмке).
