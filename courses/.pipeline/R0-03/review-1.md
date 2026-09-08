# Ревью R0-03 — `ui/foundations.css`, `ui/fonts.css`, `docs/guide/typography.md` — итерация 1

Вердикт: **вернуть на доработку**
Находки: blocker 0 · major 3 · minor 7 · note 5

Проверено:

- `.pipeline/R0-03/capture.md`, `ui/foundations.css`, `ui/fonts.css`,
  `ui/courses.css`, `docs/guide/typography.md`, `docs/guide/tokens.md`
  (GAP-2/3/6), `README.md`, `ROADMAP.md`, `.pipeline/R0-02/review-2.md`
  и `fix-2.md`, `ui/layout.css`;
- Figma: `get_variable_defs` по `oNyNRRob2y0ZSgPHOdH65X` узлы `14613:211399`
  и `10983:72700`; `get_metadata` по `KG36iTkwvKDmrw8XQhk7d6`;
  `search_design_system` с `includeLibraryKeys` = `education-lib`
  (запросы `Header/H1`, `Header`, `text`, `Caps`, `H1 mobile`,
  `font/size/display-xl`);
- живой прод: `career.habr.com/courses`, `/education_centers` + 12 внешних
  `.css` сборки скачаны и разобраны;
- собственный пересчёт покрытий и фокуса по десяти `dom.html`;
- сверка девяти ступеней с `computed*.json` — 10 страниц × 7 ширин;
- собственная проверка копируемости в msedge: `ui/` скопирован в чужой
  корень, поднят свой сервер, страница с одним `<link href="/ui/courses.css">`,
  замер computed + фокус + сеть + скриншоты на 1440 и 375;
- гейты `validate-counts.mjs`, `validate-classes.mjs`, `node --check tools/*.mjs`
  прогнаны, вывод ниже дословно.

---

## Гейты — фактический вывод

```
$ node tools/validate-counts.mjs
Checked 21 documented counts against the package. All match.
  roadmapSteps: 76
  roadmapR0: 7
  elements: 55
  pages: 10
  unreachable: 8
  cssCategories: 10
  tokens: 51
  manifest: 55
  specs: 0
EXIT=0
```

```
$ node tools/validate-classes.mjs
Витрин ещё нет. Проверять пока нечего.
  showcase/components.html — заводит шаг R0-06
  showcase/pages.html — заводит шаг R6
EXIT=2
```

```
$ node --check tools/*.mjs
EXIT=0

$ for f in tools/*.mjs; do node --check "$f" && echo "OK $f"; done
OK tools/capture.mjs
OK tools/measure-selectors.mjs
OK tools/serve.mjs
OK tools/validate-classes.mjs
OK tools/validate-components.mjs
OK tools/validate-counts.mjs
```

Все три совпали с цитатами `capture.md` §8 до символа, включая код возврата 2.
`validate-components.mjs --strict` не прогонялся: реестр в этот момент правит
параллельная итерация R0-05, вывод сравнивать не с чем.

## Копируемость (METHOD §6.1) — собственный прогон

`ui/` целиком скопирован в постороннюю папку, поднят отдельный сервер на 4321,
страница — пустой документ с единственным `<link rel="stylesheet"
href="/ui/courses.css">`. msedge, 1440×900.

```
text-h1        44px / 48px / -0.5px / 600 / Inter, sans-serif
text-h1-mobile 30px / 34px / -0.5px / 600
text-h2        24px / 28px / -0.5px / 600
text-h3        20px / 24px / -0.5px / 600
text-h4        18px / 22px / -0.5px / 600
text-default   16px / 22px / normal / 400
text-small     14px / 20px / normal / 400
text-micro     12px / 16px / normal / 400
text-caps      10px / 14px / normal + text-transform: uppercase
body           16px / 20.8px / Inter, sans-serif / rgb(44,46,52) /
               bg rgb(255,255,255) / border-box
a              rgb(52,110,244) / text-decoration none
sr-only        1×1, clip rect(0,0,0,0)
fontsLoaded    4 of 14  (Inter/normal ×2, Inter/italic ×2)
document.fonts.check('16px Inter') = true;
  ширина контрольной строки Inter 237.05 против sans-serif 223.77 —
  подставляется настоящий Inter, а не запасной гротеск
focus (Tab)    BUTTON, :focus-visible = true,
               outline rgb(166,167,169) solid 2px, offset 2px
w=375  h1 30/34   overflowX false
w=744  h1 30/34   overflowX false
w=767  h1 30/34   overflowX false
w=768  h1 44/48   overflowX false
w=1024 h1 44/48   overflowX false
w=1440 h1 44/48   overflowX false
сеть           24 ответа, все 200; хосты — только 127.0.0.1:4321
               (плюс инъекция локального антивируса, к пакету не относится);
               обращений к assets.habr.com ноль; requestfailed пуст
```

Инвариант держится. Скриншоты 1440 и 375 сняты: кириллица, курсив
и все девять ступеней рисуются настоящим Inter.

## Способ читать Figma-библиотеку — воспроизведён

Обход работает и воспроизводится с первого раза. `get_variable_defs`
узла `14613:211399` (`FilterModal`) файла `oNyNRRob2y0ZSgPHOdH65X` вернул:

```
"font/size/display-m":"20", "font/line-height/display-m":"24",
"font/letter-spacing/Headers":"-0.5", "font/weight/Semibold":"600",
"font/font-family/Headers":"Inter",
"Header/H3":"Font(family: \"font/font-family/Headers\", style: Semi Bold,
  size: font/size/display-m, weight: font/weight/Semibold,
  lineHeight: font/line-height/display-m,
  letterSpacing: font/letter-spacing/Headers)"
```

Узел `10983:72700` (`EntityHeader`) независимо дал `Header/H2` (`display-l`
24 / 28), `Header/H4` (`display-s` 18 / 22), `Header/H1 mobile`
(`display-xl mobile` 30 / `display-xl-mobile` 34), `text`, `text (bold)`,
`text small`, `text small (bold)`, `text micro`, `text micro (bold)` —
все значения совпали с утилитами прода.

`get_metadata` по `KG36iTkwvKDmrw8XQhk7d6` по-прежнему отдаёт одну страницу
`33:15585 «colors»` — ограничение никуда не делось, обход настоящий.

**Значения верны, но у способа есть граница, которую шаг не назвал** — см.
находку 2. Ответ приёмке: заводить правилом для R2–R5 можно, но обязательно
в паре с `search_design_system` по `libraryKey` — сам по себе
`get_variable_defs` не говорит, из какой библиотеки пришло имя.

---

## Находки

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | **major** | A.5 / E.19 | Утверждение «префикс `desktop:` в корпусе не встречается ни разу» ложно: `.desktop\:hidden{display:none}` объявлен в инлайновом `<style>` `/courses` внутри `@media (min-width:1024px)`, а `desktop:hidden` стоит в разметке **10/10** снятых страниц | `.pipeline/R0-03/capture.md:181` и `:507` | `grep -o 'desktop:[a-z0-9-]*' evidence/source/production/pages/*/dom.html` → 10 строк; в живом CSS `@media (min-width:1024px){.desktop\:hidden{display:none}}` |
| 2 | **major** | A.2 / A.5 / E.19 | «10 текстовых стилей из 12 [`education-lib`] совпали точно» не подтверждается источником. `search_design_system` с `includeLibraryKeys` = `education-lib` не возвращает ни `Header/H1`, ни `Header/H1 mobile`; библиотека содержит `Header/H1-hero` и `Header/H1-page` (**два** стиля H1). `get_variable_defs` библиотеку не атрибутирует вовсе, а R0-02 уже нашёл девять одноимённых `Header/H3` в разных библиотеках Хабра. Фактическое покрытие `education-lib` — **9 из 12**; GAP-1 назван по несуществующему имени | `ui/foundations.css:31–33`, `docs/guide/typography.md:14`, `:57` (колонка), `:160`, `:186`, `:404–412` (GAP-1), `:229` (таблица Storybook) | `search_design_system` fileKey `KG36iTkwvKDmrw8XQhk7d6`, query `Header`, `includeLibraryKeys:["lk-7740af72…c2"]` → H1-hero · H1-page · H2 · H3 · H4 и ничего больше; query `H1 mobile` в той же библиотеке → те же два |
| 3 | **major** | A.1 / E.19 | «девять ступеней покрывают всё, что встречается на десяти снятых страницах» ложно. `.leading-none{line-height:1}` — **40 вхождений на 10/10 страниц** — перебивает интерлиньяж ступени и не назван ни в слое, ни в статье. Туда же `.truncate` 196 (6/10), `.line-clamp-2` 150 (8/10), `.line-clamp-3` 48 (3/10), `.line-clamp-1` 21 (3/10), `.whitespace-nowrap` 471 (10/10), `.break-words` 158 (9/10), `.text-center` 29 (7/10), `.text-left` 12 (10/10), `.text-right` 20 (3/10). Ни одна не упомянута в «Ограничениях»; статья называет исключением только `.text-[8px]` | `docs/guide/typography.md:29–31` («Когда использовать»), раздел «Ограничения» | `grep -c 'leading-none' ui/foundations.css docs/guide/typography.md` → 0 и 0; пересчёт по `dom.html` — таблица ниже |
| 4 | minor | A.1 / E.19 | «`m-0` на 7 страницах из 7, где есть `<h1>`» и «пара стоит на всех семи `<h1>` из семи» — `<h1>` на снятых страницах **восемь**. У `/education_centers/35-…` `<h1 class="absolute bottom-20 left-0 m-0 translate-y-full text-small font-normal text-ui-black-500">`: `m-0` есть, `text-h1` нет. То есть `m-0` — 8/8, а пара `text-h1 phone:text-h1-mobile` — 7 из 8, и восьмой `<h1>` прямо опровергает «никогда не разъезжается» | `ui/foundations.css:71–73`, `docs/guide/typography.md:32–33`, `:283–285` | `grep -o '<h1[^>]*>' evidence/source/production/pages/*/dom.html` → 8 совпадений |
| 5 | minor | A.5 / METHOD §4 | Корпус, на котором стоит весь шаг (инлайновый `<style>` десяти страниц + 12 внешних `.css`), в `evidence/` не сохранён — `find evidence -name '*.css'` даёт 0 файлов; `capture.md` §1 сам пишет «скачано во временную папку, в пакет не клалось». Все формулировки «10/10 страниц», «12 внешних `.css`», «одиннадцать селекторов фокуса», «смещения 30273 → 30343 → 30401» из пакета не воспроизводятся. Я проверил их по живому проду — все верны сегодня, но завтра сборка сменит хеш | `docs/guide/typography.md` «Источники», `ui/foundations.css` шапки разделов | `find courses/evidence -name '*.css' \| wc -l` → 0 |
| 6 | minor | E.19 | Шапка `foundations.css` обещает «значения, порядок свойств и минификация сохранены такими, какими их печатает продукт», но 2 правила из 40 переписаны: `.text-h4` лишился `letter-spacing`, добавлено сводное `.text-h1,…,.text-h4{letter-spacing:-.5px}`. Раздел 4 это раскрывает — шапка ему противоречит | `ui/foundations.css:6–7` против `:170–172` и `:212` | побайтовая сверка 40 правил слоя с инлайновым CSS прода: 38 найдены дословно, эти 2 — нет |
| 7 | minor | METHOD §9 | Шесть найденных по ходу проблем (в т.ч. «13 `@import`» в `ROADMAP.md:72` и `CHANGELOG.md:66` при фактических 14) перечислены только в `capture.md` §10. METHOD §9 требует «записали в roadmap». Шаг `ROADMAP.md` правил (строка R0-03), то есть возможность была | `.pipeline/R0-03/capture.md:472–487` | `grep -c '^@import' ui/courses.css` → 14; `ROADMAP.md:72` и `CHANGELOG.md:66` говорят 13 |
| 8 | minor | E.19 | `.line-through` внесена в слой без покрытия и не упомянута в статье, хотя у каждой соседней утилиты покрытие указано. Факт: 4 вхождения на 1/10 страниц — по METHOD §8 это наблюдение | `ui/foundations.css:227` | пересчёт по `dom.html` |
| 9 | minor | E.19 | Внутреннее расхождение в `tokens.md`: GAP-3 называет для `Header/H2` три узла (`10983:72700`, `12093:116282`, `13246:159568`), «Источники» — два | `docs/guide/tokens.md:298–300` против `:385` | чтение файла |
| 10 | minor | A.2 | Имя стиля в `education-lib` — `caps` строчными; пакет пишет `Caps` в трёх таблицах и в GAP-2. Имя реализации каноническое (METHOD §3), но это цитата имени Figma | `docs/guide/typography.md:66`, `:229`, `:415` | `search_design_system` query `Caps`, `includeLibraryKeys` = education-lib → `"name":"caps"` |
| 11 | note | — | GAP-7 приводит `.style-ugc h3{font-size:20px}`, но в `similar-courses.DqXT-MW0.css` есть вторая, перебивающая: `.style-ugc h3{font-size:14px!important}`. Для R2-12 это важнее первой | `docs/guide/typography.md:440–443` | `grep -o '\.style-ugc h3{[^}]*}'` по 12 внешним `.css` |
| 12 | note | E.19 | «Ставьте `.text-caps` в тройке `text-caps uppercase font-semibold`» — повелительная рекомендация на одном ряду одной story; статья честно пишет, что в проде тройки нет ни разу. По METHOD §8 это наблюдение, и формулировка сильнее доказательства | `docs/guide/typography.md:34–36` | пересчёт: `text-caps` 0 вхождений |
| 13 | note | — | `.pipeline/R0-03/copy-check.html` оставлена вопреки `guide-build` §4. Отступление названо и обосновано; возражений нет, но приёмке стоит подтвердить | `.pipeline/R0-03/copy-check.html` | — |
| 14 | note | — | `ui/utilities.css` действительно назначен R0-04 — в `components/INDEX.md`, `manifest.json` (`conventions.markupUtilities`), `SPEC-TEMPLATE.md` и `validate-classes.mjs:122`. Но в строке R0-04 самого `ROADMAP.md` его нет, а `capture.md` называет источник «строкой долга», которой не существует | `ROADMAP.md:60`, `.pipeline/R0-03/capture.md:143` | `grep -rn utilities ROADMAP.md` → пусто |
| 15 | note | — | X-43 («решить до второй статьи — то есть до R0-03») и X-44 («сделать до R0-03») остались `planned`, а вторая статья уже вышла в `docs/guide/`. X-43 закрыт по факту, но строкой не закрыт | `ROADMAP.md:405–406` | чтение файла |

### К находке 3 — пересчёт по десяти `dom.html`

```
leading-none         40  10/10      truncate           196   6/10
whitespace-nowrap   471  10/10      line-clamp-2       150   8/10
break-words         158   9/10      line-clamp-3        48   3/10
text-left            12  10/10      line-clamp-1        21   3/10
text-center          29   7/10      text-right          20   3/10
italic                0   0/10      leading-5            0   0/10
```

`.leading-none{line-height:1}` объявлен в инлайновом CSS прода и стоит,
например, на пункте меню:
`class="my-0 flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2
pl-4 pr-6 leading-none no-underline hover:bg-ui-black-50 hover:no-underline"`.

---

## Что проверено и претензий нет

**Пересчитано мной с нуля и сошлось до единицы.**

- Покрытия девяти ступеней по десяти `dom.html` (точное совпадение токена
  в атрибуте `class`, а не подстрокой): `text-h1` 7 · 7/10; `text-h1-mobile`
  2 · 2/10; `text-h2` 32 · 10/10; `text-h3` 1 · 1/10; `text-h4` 258 · 9/10;
  `text-default` 20 · 7/10; `text-small` 1237 · 10/10; `text-micro`
  505 · 10/10; `text-caps` 0 · 0/10. Сумма 2062 — сходится.
- Начертания: `font-normal` 1 · 1/10, `font-semibold` 909 · 10/10,
  `font-bold` 10 · 10/10. `uppercase` 16 · 1/10. `no-underline` 40 · 10/10,
  `hover:no-underline` 368 · 10/10, `hover:underline` 160 · 10/10,
  `underline` 0. `sr-only` 0, `visually-hidden` 0. `!text-small` 40 · 3/10,
  `text-[8px]` 20 · 3/10, `placeholder:text-small` 29 · 6/10.
  `phone:text-h1-mobile` 7 · 7/10, всегда на узле с `text-h1`;
  `phone:text-h2` 0.
- **Таблица фокуса сошлась построчно**, включая по-страничную разбивку:
  1264 фокусируемых узла, 191 свой ринг · 29 `focus-within` · 10 погашено
  без замены · 1034 браузерных. Десять «погашенных» — один и тот же узел
  на каждой странице.
- Одиннадцать селекторов фокуса во всём корпусе: 10 утилит в инлайновом CSS
  (перечислены поимённо, совпали со слоем) + `.base-checkbox__input:focus+
  .base-checkbox__button` в `similar-courses.DqXT-MW0.css`. Элементных
  правил продукта нет ни одного.
- Значения ступеней против `computed*.json`: **14 434 узла**, 10 страниц ×
  7 ширин. Расхождений 35, и все 35 — это `.text-h1` с `phone:text-h1-mobile`
  на 320/375/479/480/744, где он корректно даёт 30/34. То есть от ширины
  не зависит ни одна ступень, кроме `.text-h1`, — как и сказано.

**Сверено с живым продом; байты сходятся.**

- 38 правил слоя из 40 найдены в инлайновом CSS прода **дословно**
  (исключения — находка 6, они функционально эквивалентны, что подтверждено
  computed в браузере).
- Блок `--tw-*` — побайтовая копия первого правила сборки
  (`*,::backdrop,:after,:before`, смещение 0, 51 объявление). Второй,
  более поздний блок отличается только записью `--tw-ring-color` — тот же цвет.
- normalize.css v8.0.1 — 1767 байт, найден в проде дословно вместе
  с комментарием лицензии. Правил вида `h1,h2,h3…` (preflight) в корпусе нет,
  вывод про ручной `m-0` верен по существу.
- База документа: все четыре правила дословно. `#__nuxt` действительно
  отброшен и это названо.
- 14 `@font-face`: `font-family`, `font-style`, `font-weight: 100 900`,
  `font-display: swap` и все 14 `unicode-range` совпали с продом один в один;
  различие ровно одно — локальный путь. Пятнадцатый `@font-face` корпуса
  (`swiper-icons`) действительно только в `course-card-skeleton.DgMnfZhS.css`.
- 12 внешних `.css` — объединение по страницам ровно 12 (на `/courses` их 11,
  двенадцатый `journal-articles.BVzsV5L_.css` приходит с `/education_centers`).
- `.text-card-title` в сборке действительно нет. `.base-modal__title`
  20/24/600, `.error-page__top-text` 28/32,
  `.v-popper--theme-tooltip .v-popper__inner` 14/20 — все три подтверждены.

**Граница 767/768.** Снята независимо трижды: `@media (max-width:767px)`
в живом CSS, мой браузерный замер (744/767 → 30/34, 768/1024 → 44/48)
и `computed*.json`. **«≤ 744» не просочилось никуда** — все 20 упоминаний
числа 744 в `ui/` и `docs/` проверены поштучно, каждое стоит в правильной
рамке («канон пакета», «снятая ширина», «лежит внутри мобильного диапазона»);
в `typography.md:129` прямо написано, что так писать нельзя.

**История `Header/H3` честна.** `.pipeline/R0-02/review-2.md:42` и `108–130`
сняли утверждение как бездоказательное, `fix-2.md:83–104` его убрал. R0-03
получил значение заново своей выдачей — я воспроизвёл ту же выдачу
на том же узле. Это новое подтверждение, а не возврат снятого.
GAP-2 и GAP-3 в `tokens.md` закрыты корректно, с воспроизводимым источником;
GAP-6 честно оставлен открытым со словами «покрытие у способа случайное».

**Самокритика шага честна.** `_sources/courses/rendered/common-typography--typography.html`
существует, 654 байта, ровно двенадцать строк в заявленном составе и порядке.
Первая редакция протокола ошиблась, ошибка снята до сдачи, источник
использован — запись соответствует файлу.
`index.CSGoIsqw.css` печатает девять ступеней и `body,html` теми же
значениями, что и прод.

**Шрифт (X-03).** Решение взять METHOD §6.3 вопреки образцу `career/`
правильное и обосновано в двух местах. Локальность проверена не по тексту,
а фактически: `ui/` вынесен в чужой корень, страница открыта — ни одного
обращения наружу, четыре `woff2` отданы локально, `document.fonts.check`
подтверждает подстановку настоящего Inter. 14 файлов, 725 КБ на месте.

**Фокус — решение соответствует контракту.** BRIEF §9 п. 4 («доступность
фиксируется как есть») и METHOD §4 (норматив нельзя выдавать за снимок)
покрывают отказ от глобального ринга: 1034 узла имеют браузерный контур,
и перекрасить их значило бы подменить продукт догадкой. `ui/state-contract.css`
по тому же решению отведён под визуальные состояния, которых в проде нет, —
здесь такого случая нет, файл заводить незачем. Дефект продукта (GAP-5)
зафиксирован, а не залатан. **Дыры для R2–R5 не остаётся при одном условии**:
статья даёт исполнимый контракт — тройка `focus:outline-none` +
`focus-visible:outline` + `focus-visible:outline-ui-black-400`, ширина
и отступ достаются от шорткота, убирать `focus:outline-none` нельзя. Этого
хватает, чтобы каждая спецификация R2–R5 записала `focus-visible` фактом.
Чего в пакете пока нет — указания, что писать в спецификации для узла
с браузерным фокусом; это объём R1-01 (`STATES.md`), а не этого шага.

**Разделение `--tw-*` в `foundations`, а не в `tokens`, — верное.** Это
внутренности Tailwind, не объявленная продуктом палитра; в `tokens.css`
их появление сломало бы счёт 51 и смысл файла. Пометка в файле снимает
риск прочитать их как палитру. То же про normalize против preflight:
различие реальное и практический вывод («ставьте `m-0` сами») верен.

**Гейты.** Все три прогона совпали с цитатами `capture.md` дословно,
включая код возврата 2 у `validate-classes.mjs` и его штатную ветку.
Строка долга X-41 в этой части закрыта по существу.

## Не проверено

- `node tools/validate-components.mjs --strict` — реестр правит параллельная
  итерация R0-05; вывод несопоставим, по условию задачи не ревьюируется.
- Экспорт узла Figma картинкой и попиксельное сравнение «прод ↔ Figma ↔
  пример». Для слоя типографики предмет сравнения — числа, и они сверены
  тройкой (прод CSS ↔ `get_variable_defs` ↔ computed нашего примера)
  на всех девяти ступенях. Скриншот добавил бы меньше, чем эти сверки.
- Значения `Header/H1-hero` и `Header/H1-page`, а также `caps` из Figma —
  узла макета, применяющего их, я тоже не нашёл. Ограничение подтверждаю,
  но имена в GAP-1 названы неверно (находка 2).
- Ширина 1024 в `computed*.json` — файлов нет (X-09). Оценку шага «риск
  для шкалы низкий» подтверждаю: я замерил 1024 живьём, 44/48, и это
  единственная зависимая от ширины ступень.
- Верхняя граница `desktop:` не устанавливалась: это `min-width`-префикс,
  верхней границы у него нет; нижняя — 1024 (находка 1).
