# Правки по review-1 — R0-08 (STATES.md / state-contract.css)

| # находки | ID | Severity | Решение | Что сделано | Где |
|---|---|---|---|---|---|
| 1 | states | blocker | исправлено | Признан факт: `button.site-header-toggle[aria-expanded="false"]` — реальный носитель пары `expanded`/`collapsed`. В матрицу добавлена строка «Раскрывающийся контрол» с требованиями из `blocks/manifest.json` (`default`, `hover`, `focus-visible`, `expanded`). Ложное «элементов… в пакете нет ни одного» убрано из обоих файлов; вместо него — точное разделение «носитель есть, правила рисующего раскрытый вид меню нет», с явной ссылкой на `missingStates` записи `site-header` и на шаг закрытия R2-05. | `components/STATES.md` (матрица + «Чего в контракте нет»), `ui/state-contract.css:23-31,198-229` |
| 2 | states | major | исправлено | Пересчитано: 8 состояний из 20, а не 7 — добавлен `readOnly` (`.form-field-input:read-only:not(:disabled)`, реальное правило в CSS). Обновлены оба перечня-дубля (`ui/state-contract.css` заголовок, `components/STATES.md` «Что реализовано» + таблица), и добавлено упоминание `readOnly` в `blocks/form-field.md` (снапшот-строка, новый абзац, «Ограничения») — раньше состояние там не упоминалось вовсе. | `ui/state-contract.css:23-26`, `components/STATES.md:76-89`, `blocks/form-field.md` (шапка, «Управление клавиатурой», «Ограничения») |
| 3 | states | major | исправлено (перенос в state-contract.css) | Правило `.site-header-link:hover, .site-header-link:focus-visible` перенесено из `ui/blocks/core.css` в `ui/state-contract.css` (новый раздел 6, до раздела «Чего здесь нет»). В `core.css` оставлен комментарий-указатель, в `blocks/site-header.md` поправлена ссылка на файл. `components/STATES.md` «Что реализовано» дополнено строкой-носителем `.site-header-link` в колонках `hover`/`focus-visible`, чтобы словарь состояний знал об этом элементе. | `ui/state-contract.css:193-206`, `ui/blocks/core.css:154-157`, `blocks/site-header.md` («Управление клавиатурой»), `components/STATES.md:82-83` |
| 4 | states | major | отклонено (задокументирован как честный GAP, не изменён цвет) | Контраст 2.83:1 подтверждён живьём в браузере (см. «Живая проверка» ниже) — это тот же разрыв, что `tokens.css:453`/`GUIDE.md` §6 уже открыто называют для белой надписи на CTA-кнопке Хабра: оба цвета (заливка `--product-cta` и знак `--product-on-acid`) назначены владельцем порознь решениями Р-5/Р-6, а не выведены из контраста. Менять их здесь ради одного контрола значило бы пересмотреть решение владельца без его участия — вместо этого разрыв назван прямо в `components/STATES.md` («Порог держат не все контролы»), в комментарии `@normative` у `.form-field-box:checked` и в `blocks/form-field.md` («Ограничения»), с точными числами по всем трём продуктам. | `components/STATES.md` (раздел «Темы», после таблицы контраста ошибки), `ui/state-contract.css:162`, `blocks/form-field.md` («Ограничения») |
| 5 | states | major | исправлено | `showcase/showcase.css:53` (`.doc-page :focus-visible { outline: 2px solid …; outline-offset: 2px; }`) удалён целиком — специфичность 0,2,0 забивала пакетное голое `:focus-visible` (0,1,0) и рисовала 2px вместо заявленных 3px. Витрина больше не назначает кольцо фокуса самостоятельно; правило `components/STATES.md` «Кольцо фокуса» дополнено абзацем, фиксирующим находку и её закрытие. | `showcase/showcase.css:53-59`, `components/STATES.md` (раздел «Кольцо фокуса») |

Пропусков нет: все пять находок (1 blocker + 4 major) получили решение — четыре исправлены, одна (контраст CTA Хабра, находка 4) отклонена в смысле «цвет не тронут» и закрыта честной записью GAP, что и было одним из двух вариантов, предложенных самим отчётом ревью («либо поднять контраст… либо честно снизить заявленный порог с указанием причины»).

## Изменённые файлы

- `landings/components/STATES.md`
- `landings/ui/state-contract.css`
- `landings/ui/blocks/core.css`
- `landings/blocks/site-header.md`
- `landings/blocks/form-field.md`
- `landings/showcase/showcase.css`
- `landings/ROADMAP.md` (строка R0-08: то же устаревшее «семь состояний», что называла находка 2, повторялось и здесь)

## Результат валидатора

Все шесть валидаторов прогнаны после всех правок, exit 0 у каждого. Логи:
`.pipeline/R0-08/fix-1.validate-{blocks,classes,counts,normative,radius,tokens}.log`.

```
blocks:     exit 0 — записей 12, cssRoots и якоря сошлись; 7 узлов «к проверке руками» (не относятся к находкам этого ревью)
classes:    exit 0 — 201 класс в 4 файлах против 11 таблиц стилей; протечек оболочки нет
counts:     exit 0 — 170 утверждений в 17 файлах, все сходятся
normative:  exit 0 — 775 объявлений в 8 CSS-файлах, у каждого назван источник
radius:     exit 0 — правило Ф-3 (Р-8): 8 пар, нарушений 0
tokens:     exit 0 — 564 ссылки на токены в 11 CSS-файлах и 20 статьях, 69 значений в таблицах сверены
```

## Живая проверка (headless Chrome, CDP)

В этой сессии удалось поднять `chrome.exe --headless=new` и опросить его напрямую
через Chrome DevTools Protocol (без Playwright/Puppeteer, их в окружении нет) —
это сильнее анализа каскада на бумаге, как и просило review-1. Витрина поднята
`node tools/serve.mjs` на порту 4180 (уже была запущена).

**Находка 5 (фокус, `showcase/core.html`, реальный `getComputedStyle`, после правки):**

```json
{
  ".site-header-link": { "matches": true, "outlineWidth": "3px", "outlineOffset": "3px",
                          "outlineColor": "rgb(6, 208, 239)", "outlineStyle": "solid" },
  ".button":            { "matches": true, "outlineWidth": "3px", "outlineOffset": "3px",
                          "outlineColor": "rgb(6, 208, 239)", "outlineStyle": "solid" }
}
```

`.form-field-box` на `core.html` не найден (чекбокса на этой странице нет) —
проверен отдельно на `primitives.html`:

```json
{
  "checkbox_focus":   { "matches": true, "outlineWidth": "3px", "outlineOffset": "3px" },
  "checkbox_checked": { "backgroundColor": "rgb(77, 163, 203)" },
  "input_readonly":   { "borderStyle": "dashed", "matches": true }
}
```

Кольцо фокуса — реально 3px/3px на кнопке, ссылке меню и чекбоксе, оболочка
витрины больше не побеждает (было бы 2px до правки, по специфичности CSS).
`readOnly` — реально даёт пунктирную границу на живой странице.

**Находка 4 (контраст, вычислен в браузере формулой WCAG relative luminance
над реальным `getComputedStyle(box).backgroundColor` отмеченного чекбокса):**

```json
{ "product": "habr", "theme": "dark", "backgroundColor": "rgb(77, 163, 203)", "contrastWhiteOnBg": 2.83 }
```

Число сошлось с ревью день в день (2.83) — это подтверждает, что разрыв
реален и воспроизводится на живой отрисованной странице, а не только
в статическом расчёте. Решение по этой находке — не менять цвет (см. таблицу
выше), поэтому число осталось тем же после правки; изменилось то, что оно
теперь названо в статье, а не молчит.

## Что ушло в roadmap отдельными строками

Ничего — все находки этого отчёта закрыты внутри объёма R0-08 (STATES.md,
state-contract.css и минимальные ссылочные правки в core.css/site-header.md/
form-field.md/showcase.css, которые прямо вытекают из находок 1-5). Соседних
проблем, замеченных попутно и не входящих в отчёт review-1, в этой итерации
не обнаружено.
