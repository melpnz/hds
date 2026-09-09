# Ревью R0-08 · STATES.md, state-contract.css — итерация 1

Вердикт: **вернуть на доработку**
Режим: **полный** (папка `.pipeline/R0-08/` до этого запуска не существовала)
Проверено: `landings/components/STATES.md`, `landings/ui/state-contract.css`,
`landings/BRIEF.md` §5 п.8, `landings/GUIDE.md`, `landings/blocks/manifest.json`,
`landings/blocks/form-field.md`, `landings/blocks/site-header.md`,
`landings/ui/blocks/core.css`, `landings/ui/tokens.css`, `landings/showcase/*.css`,
`landings/showcase/*.html`. Живая витрина поднята `node tools/serve.mjs`
(порт 4180, уже был запущен) и опрошена `curl` — интерактивной проверки
мышью/клавиатурой в реальном браузере в этой среде выполнить не удалось
(инструмента для рендеринга страниц/скриншотов витрины нет), поэтому фокус
и hover проверены детерминированно: через специфичность CSS-правил и через
подтверждение, что классы состояний реально стоят на реальной разметке
витрины (см. находку 5 и раздел «Не проверено»). Прогнаны все шесть
валидаторов (`validate-blocks`, `validate-classes`, `validate-counts`,
`validate-normative`, `validate-radius`, `validate-tokens`) — логи
в `.pipeline/R0-08/review-1.<tool>.log`, все exit 0. Числа контраста
пересчитаны программно (Node, формула WCAG relative luminance).

| # | ID | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|---|
| 1 | states | blocker | A.5, C.11 | Файл называет себя «целиком нормативным» и утверждает, что `expanded`/`collapsed`/`open`/`closed` и т.д. не реализованы, потому что «элементов, которым они принадлежат… в пакете пока нет ни одного». Это неверно: элемент уже есть — `button.site-header-toggle[aria-expanded="false"]`, — и он несёт состояние `expanded` по закрытому словарю. `blocks/manifest.json` (запись `site-header`) сам же требует `expanded` в `requiredStates`/`missingStates` и статус `partial` именно по этой причине, ссылаясь при этом на STATES.md как источник requiredStates (`statesNote`), хотя в матрице STATES.md строки для site-header/навигации/раскрывающихся контролов нет вовсе — состояние `expanded` в тексте STATES.md не упомянуто ни разу вне списка «чего нет». | `components/STATES.md:130-134`, `ui/state-contract.css:198-202` (ложное утверждение) vs `blocks/site-header.md:153`, `showcase/core.html:90`, `blocks/manifest.json` (site-header: `requiredStates`, `missingStates`, `statesNote`) | `grep -n "aria-expanded" landings/blocks/site-header.md landings/showcase/core.html` — элемент есть; `grep -n "site-header\|expanded" landings/components/STATES.md` — ни одного совпадения |
| 2 | states | major | E.19 | Заявление ROADMAP.md/STATES.md «реализовано семь состояний из двадцати» (перечень: hover, focus-visible, pressed, checked, indeterminate, disabled, invalid) недосчитывает: `.form-field-input:read-only:not(:disabled) { border-style: dashed; }` — реальное, визуально работающее правило на состояние `readOnly` из того же закрытого словаря, но оно не входит ни в один из двух идентичных перечней «семи» и не упомянуто вовсе в `blocks/form-field.md` (ни в «Токенах», ни в «Ограничениях», ни в «Как работает»). Фактически реализовано минимум 8 состояний, а не 7. | `ui/state-contract.css:24-26` (перечень) и `:134-137` (само правило, не входящее в перечень); `components/STATES.md:67-77` (таблица «Что реализовано», строки readOnly нет) | `grep -n "read-only" landings/ui/state-contract.css` — правило есть; `grep -n "семь\|readOnly" landings/components/STATES.md` — readOnly не в таблице реализованных |
| 3 | states | major | A.5, B.7-подобный (изоляция места объявления) | Собственный заголовок файла объясняет, зачем состояния вынесены отдельным файлом: «чтобы его нельзя было принять за снимок прода» — то есть архитектурное правило пакета: нормативные состояния живут только в `ui/state-contract.css`. Правило нарушено в том же пакете: `ui/blocks/core.css:154-159` содержит `@normative состояния ссылки: hover, focus-visible` прямо на `.site-header-link` внутри снимкового файла. STATES.md об этом правиле не знает: ни `.site-header-link`, ни «hover для навигационной ссылки» в матрице и в перечне «что реализовано» не фигурируют, то есть словарь состояний фактически не покрывает весь пакет, хотя претендует на это. | `ui/blocks/core.css:154-159`; `components/STATES.md` (нет упоминания site-header/site-header-link нигде в файле) | `grep -n "@normative" landings/ui/blocks/core.css \| grep -i hover` — правило состояния найдено вне state-contract.css |
| 4 | states | major | A.1/A.2-подобный (числовая проверка) | Отмеченный чекбокс красит галочку белым (`--product-on-acid: #ffffff`) на заливке `--product-cta`. Для Хабра `--product-cta` — `#4da3cb` в обеих темах (одно и то же значение, по комментарию в `tokens.css:453`). Контраст белого на `#4da3cb` — **2.83 : 1** (пересчитано формулой WCAG), что ниже порога **3 : 1**, который сам STATES.md называет применимым к контролам («Порог для границы контрола — 3 : 1, WCAG 1.4.11», `components/STATES.md:124`). Для двух других продуктов контраст в норме (4.39-5.51 : 1), для Хабра — нет, и это нигде не оговорено. | `ui/state-contract.css:157-165` (`.form-field-box:checked`, `--product-on-acid` на `--product-cta`); `ui/tokens.css:363` (`--product-cta: #4da3cb`, Хабр, обе темы) | Пересчёт: `contrast(#ffffff, #4da3cb)` по формуле relative luminance WCAG = 2.83 (лог в `.pipeline/R0-08/` доступен по запросу, команда приведена в отчёте выше) |
| 5 | states | major | C.12 (интерактив в браузере), narrative | STATES.md прямо утверждает, что до R0-08 кольцо фокуса давала оболочка витрины и «это и был отказ инварианта копируемости», а «теперь кольцо приходит из пакета» (components/STATES.md:94-99). На деле `showcase/showcase.css:53` до сих пор содержит `.doc-page :focus-visible { outline: 2px solid var(--product-accent); outline-offset: 2px; }`. `.doc-page` оборачивает `<body>` всех трёх страниц витрины (`blocks.html`, `core.html`, `primitives.html`). Специфичность `.doc-page :focus-visible` (0,2,0) выше специфичности пакетного `:focus-visible` (0,1,0) из `ui/state-contract.css:90-93`, поэтому по правилам каскада витрина показывает кольцо **2px/2px**, а не **3px/3px**, которое получит та же разметка, скопированная на пустую страницу с одним `ui/landings.css`. То есть ровно тот сценарий расхождения «стенд ≠ копия», который STATES.md заявляет закрытым, воспроизводится и сейчас — просто с другим селектором вместо прежних шести. | `showcase/showcase.css:53` vs `ui/state-contract.css:90-93`; `components/STATES.md:94-99` (заявление о том, что проблема решена) | Специфичность детерминирована CSS-каскадом и не зависит от браузера: `.doc-page :focus-visible` = класс+псевдокласс (0,2,0) > `:focus-visible` = псевдокласс (0,1,0). Живьём: открыть `http://127.0.0.1:4180/showcase/core.html`, Tab до кнопки, замерить outline — должно быть 2px, а не 3px |

## Что проверено и претензий нет

- Закрытый словарь состояний (20 слов) в `components/STATES.md:29-32` совпадает
  дословно и по порядку со словарём `.claude/guide/naming-states.md`; новых слов
  не добавлено, `active`/`focus`/`select`/`inactive` использованы только как
  примеры запрещённых, не как имена состояний.
- `ui/state-contract.css` подключается действительно последней строкой
  `ui/landings.css` (`@import url("state-contract.css")` — последняя строка
  импортов), подтверждено и на диске, и через отданный витриной CSS.
- Классы, на которые навешаны состояния (`.button`, `.form-field-input`,
  `.form-field-box`, `.form-field-box-round`), реально стоят на разметке
  витрины (`showcase/primitives.html`, `showcase/core.html`) — правила не
  висят в пустоте.
- `manifest.json`: статусы `site-header` и `footer-social` действительно
  `partial`, не выданы за `complete`; у каждой записи есть `statusReason` и
  `missingStates` с конкретным недостающим состоянием (`expanded`, `hover`).
  Молчаливой подмены статуса нет.
- Матрица обязательных состояний не описывает виды, которых в пакете нет:
  все шесть строк матрицы (`Действие`, `Текстовое поле`, `Переключатель`,
  `Статичная метка`, `Плоскость`, `Знак и лента`) соответствуют реальным
  классам пакета.
- Числа контраста цвета ошибки (`#FF7A70`/`#C53025` против `#000000`,
  `#212930`, `#4B5558`, `#FDFDFC`, `#F3F5F7`, белой заливки поля) пересчитаны
  программно по формуле WCAG relative luminance — совпадают с заявленными
  до сотых на всех шести парах.
- `--product-on-acid` действительно белый у всех трёх продуктов в обеих
  темах (6 деклараций в `ui/tokens.css`), как заявлено.
- Все шесть валидаторов (`validate-blocks`, `validate-classes`,
  `validate-counts`, `validate-normative`, `validate-radius`,
  `validate-tokens`) — exit 0, логи сохранены в
  `.pipeline/R0-08/review-1.<tool>.log`.
- ARIA на нормативных состояниях не выдумана: `disabled`/`aria-disabled`,
  `:read-only`, `:user-invalid`/`aria-invalid` — стандартные механизмы,
  не изобретённые атрибуты.

## Не проверено

- **Живое поведение мышью/клавиатурой в браузере.** В этой среде нет
  инструмента, рендерящего страницы/делающего скриншоты витрины
  (Playwright/Puppeteer и т.п. не выданы). Проверка hover/focus-visible/
  disabled выполнена статически: через специфичность CSS и через
  подтверждение присутствия классов-целей в реальной разметке витрины.
  Находка 5 доказана математикой каскада, а не наблюдением, — это менее
  желательно, чем видео/скриншот, но эквивалентно по строгости, так как
  каскад детерминирован. Просьба к следующей итерации: если в среде
  появится браузер, подтвердить находку 5 скриншотом Tab-фокуса.
- **Соответствие карточки/чипа/лок-апа реальным макетам** (18 узлов без
  признака ссылки, чип не кликается ни в одном из четырёх экземпляров) —
  не переснимал Figma и не открывал `evidence/source/figma/`, положился на
  предыдущий аудит (`.audits/`, `evidence/section-map.md`), которые уже
  цитируются в STATES.md и не входят в объём этого шага (состояния, а не
  геометрия покоя).
- **Полнота state-carrier для site-header/footer-social как компонентов** —
  сами статьи `blocks/site-header.md` и `blocks/footer-social.md`
  принадлежат шагам R2-05/R2-03 и не входят в объём R0-08; проверялась
  только точка стыка с STATES.md (находка 1), а не остальное содержимое
  этих статей.
