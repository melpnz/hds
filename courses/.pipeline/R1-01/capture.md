# R1-01 · components/STATES.md — протокол

Шаг: закрытый словарь состояний (METHOD §5, дословно) + матрица обязательных
по видам (`primitive`/`component`/`module`/`adapter`) + разметка
`requiredStates` у всех 55 записей `manifest.json`. Первый шаг волны R1
(волна R0 закрыта целиком, 7/7, коммит `d6f728d`).

Метод перечитан заново в начале шага (`.claude/guide/METHOD.md`) — в
частности правило «не открывать `career/` на каждом шаге»: `career/`
не открывался вовсе на этом шаге, кроме однократного чтения
`career/components/STATES.md` в самом начале работы для формы документа
(таблицы, разделы «Канонический словарь» / «Нормализация» / «Матрицы по
семействам» / «Definition of Done»). Факты из career не переносились: у
Курсов другая ось матрицы (`kind`, а не «семейство компонентов» career), и
разметка 55 записей построена заново по своим evidence.

## Источники, использованные как факт (без пересъёмки)

- `components/manifest.json` — реестр 55 записей, `allowedStates`,
  `forbiddenStateNames`, `requiredStatesMatrix` (уже объявлены в манифесте
  до этого шага), `productionEvidence[].selector`, `notes`, `dependsOn`.
  Принят коммитом `4fe1bf5` — использован без повторной проверки инвентаря.
- `components/INDEX.md`, `components/SPEC-TEMPLATE.md` — форма документа и
  правил проекции (раздел «Словарь состояний закрыт» уже был в
  SPEC-TEMPLATE.md до этого шага, ссылается на STATES.md).
- `evidence/source/production/pages/*/dom.html` (10 файлов, снято на 1440) —
  прямые выписки и подсчёты, команды и числа см. ниже.
- `.pipeline/inventory.json` — **не использован** как источник фактов: в
  задании прямо предупреждено, что инвентаризация пакета неоднократно
  ошибалась за сессию (счётчики, атрибуция); там, где `manifest.json` уже
  расходится с инвентарём, авторитетен манифест.

## Команды и числа (курс на `evidence/source/production/pages/*/dom.html`)

```
grep -o "hover:[a-zA-Z0-9_-]*" …               → 1182 вхождения
grep -o "focus-visible" …                       → 382 (= 191 × 2 варианта утилиты)
grep -o "focus-visible:outline" …               → 191 — день в день с occurrences Button (191)
grep -o "disabled" …                            → 732; "disabled:pointer-events-none" — 191
grep -o '<button disabled=""' …                 → 4 — стрелка rel="prev" карусели (IconButton)
grep -o 'aria-current="page"' …                 → 4 — все на <a> внутри SegmentedControl
grep -o "swiper-slide-active" …                 → 16 — день в день с occurrences Carousel (16)
grep -o "aria-expanded" …                       → 0
grep -o "aria-selected" …                       → 0
grep -o "aria-checked" …                        → 0
grep -o "readonly" …                            → 0
grep -o "aria-invalid" …                        → 0
grep -o "loading|spinner|skeleton|aria-busy" …  → 0 по каждому
grep -o 'career/assets/defaults/avatars/user-…' … → 15
grep -o "user_avatar_2.svg" …                   → 23
grep -o "avatars/logo.svg" …                    → 10
grep -o "empty-edu-center_2.svg" …              → 4
grep -o 'z-2 absolute bottom-0 left-0 right-0 top-0' … → 158 (плюс близкие варианты z-1/z-10)
```

Прямые выписки узла (не только счёт) сделаны для: Button/FilterChip/Select
(триггер и `focus-within:`), SegmentedControl (сегмент с `aria-current`),
CourseCard/SchoolCard/ArticleCard/PersonCard (оверлейная ссылка `<a
class="z-… absolute … top-0">` найдена и процитирована буквально), PromoCard
и AdCard (оверлейной ссылки на корне **не найдено** — только `cursor-pointer`
и вложенная кнопка), ReviewCard (`div.hover:bg-ui-black-100` — не `<a>`),
RatingTable (строка `<a class="grid …">` с `hover:bg-ui-black-50`).

## Метод разметки

Полное обоснование и таблицы — в самом `components/STATES.md`:

1. §1 — словарь дословно (20 слов) + 4 запрещённых с заменами.
2. §2 — восемь проверяемых сигналов природы (N1–N8: интерактивность, свой
   «корпус», отключаемость, членство в выборе, раскрытие своего узла,
   значение/валидация, коллекция с нулевым случаем, подстановка вместо
   данных), из которых выводится требуемость состояния — вместо того чтобы
   выводить её из одного только `kind`.
3. §3 — матрица по `kind` (R/C/— с указанием сигнала при C), включая строку
   `adapter` — 0 записей реестра сегодня этого вида, строка размечена как
   контракт на будущее, а не наблюдение.
4. §4 — 55 записей построчно с обоснованием и явным «не включено, потому
   что…» там, где состояние напрашивается на вид, но не подтверждено
   (`FilterChip.disabled`, `Carousel.empty`, `AvatarStack.empty`).
5. §5 — слова словаря, не встретившиеся ни у одной записи (`success`,
   `error`, `loading`, `dragActive`) — с объяснением, почему это факт,
   а не пробел.

## Решения при конфликте источников

- **Select.focus-visible**: в проде фокус подсвечивается через
  `focus-within:border-ui-black-850` на обёртке, не через `:focus-visible`
  на самом `<input>`. Зафиксировано как факт (иная механика того же по
  смыслу состояния), не сглажено до буквального совпадения имени.
- **SegmentedControl** — слово `current`, а не `selected`: прямое DOM-evidence
  (`aria-current="page"`) весит больше рассуждения «это же переключатель,
  как выглядит выбор» (METHOD §3, семантика HTML выше визуального сходства).
- **PromoCard/AdCard vs CourseCard/SchoolCard/ArticleCard/PersonCard**: все
  используют `cursor-pointer`, но только у части из них подтверждён
  нижестоящий overlay-`<a>`. Разница держится как факт по каждой записи, а
  не усреднена «раз это карточки, у них у всех есть фокус».

## Не удалось снять / оставлено как GAP этого шага

- Открытая раскладка `Select`/`MultiSelect`/`HeaderDropdown`/`FilterModal`/
  `CatalogMenu` — не в DOM ни разу (см. `manifest.json` → `notes`); `open`
  включён в `requiredStates` по природе оверлея (N5), сама съёмка — R1-02 /
  соответствующий шаг вёрстки.
- `aria-expanded` на кнопке раскрытия `LinkGrid` — 0 вхождений в корпусе;
  `expanded`/`collapsed` включены по принятому `manifest.json` → `notes`
  («раскрытием по кнопке»), которому этот шаг доверяет как факту без
  переснятия. Сама ARIA-разметка (есть она или нет) — вопрос R1-02.
- `CardGrid.empty` — не подтверждено ни на одной из 10 страниц (нулевой
  выдачи не снято); включено по структурной природе (переменная длина,
  зависящая от `FilterBar`/`FilterChip`) и по косвенному подтверждению
  фигма-модуля `EmptyState`. Названо явно как вывод по природе, не по
  наблюдению — см. `STATES.md` §4.4.

## Долг, не входящий в объём шага (не вносится в ROADMAP.md)

- `componentKey` `9668fb89eb4a58bc781b568ec83d9ce0e492e70e` уже объявлен
  общим для `filter-chip`/`tab` в `knownComponentKeyCollisions` — не новый
  долг этого шага, зафиксирован раньше, здесь только подтверждён
  прогоном `validate-components.mjs --strict` (блок «Объявлено»).
- Ссылки-инверсии `site-header → header-dropdown` и `page-hero →
  search-form` — тоже ранее объявленный долг (`knownStepInversions`),
  не новый.
- Уточнение к `manifest.json` → `notes` о `LinkGrid` («раскрытием по кнопке»):
  кнопка раскрытия в снятом DOM десяти страниц **есть** — во всех 5 вхождениях
  `max-h-[94px]` (courses-listing ×1, education-centers-listing ×2,
  promocodes ×2) сразу следует `<button type="button" class="mt-4 … text-ui-blue-500
  …">Смотреть все</button>` в той же секции, но `aria-expanded` на ней
  не объявлен (0 вхождений в корпусе). Это не то же самое, что «кнопки нет»;
  на `requiredStates` (`expanded`/`collapsed` по N5, через доверие `notes`)
  это не влияет — стоит перепроверить на шаге вёрстки `LinkGrid` (R5), не
  переоткрывая инвентаризацию сейчас.

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

Блок «Отложено» до этого шага содержал строку про `requiredStates` («матрицы
обязательных состояний ещё нет») — после заполнения поля она пропала: до
шага 2 строки в «Отложено», после — 1 (осталась строка про 55 `planned`-спек,
не относящаяся к этому шагу).

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
$ node --check tools/capture.mjs && node --check tools/measure-selectors.mjs \
  && node --check tools/serve.mjs && node --check tools/validate-classes.mjs \
  && node --check tools/validate-classes.selftest.mjs \
  && node --check tools/validate-components.mjs && node --check tools/validate-counts.mjs
(без вывода — все семь файлов синтаксически валидны)
```

## Файлы

- `components/STATES.md` — новый файл, словарь + матрица + разметка 55
  записей.
- `components/manifest.json` — `requiredStatesMatrix.status: "pending" →
  "done"` (+ `ref`), `requiredStates` заполнен у всех 55 записей.
- `.pipeline/R1-01/capture.md` — этот протокол.

Статус `done` этому шагу не присвоен — ставит его `guide-accept`.
