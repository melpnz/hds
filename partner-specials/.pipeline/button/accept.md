# Приёмка P0 — текстовая Button

Дата: 2026-09-08. Вердикт: **ПРИНЯТО в пределах P0, с отложенным minor P0-F01**.

Приёмщик самостоятельно прочитал METHOD, guide-accept, ROADMAP/PILOT, manifest/INDEX, capture и оба отчёта независимого ревью; запустил проверки, открыл сохранённые PNG 320/1400. Реализация на приёмке не менялась. Источники не переснимались.

| Гейт | Результат и доказательство |
|---|---|
| 1. Валидатор | PASS: `npm run validate` запускает strict; registry, CSS roots, пути спецификации и якорь согласованы |
| 2. Браузер | PASS: `npm test -- --no-screenshots`, установленный Chrome через Playwright fallback; 30 вариантов × 320/768/1024/1400 |
| 3. Независимое ревью | review-2: принять с замечаниями, открытых major/blocker нет. Major review-1 исправлен в fix-1 и повторно проверен тестом входа с корня. Единственный minor review-2 — точная версия Inter — явно отложен в ROADMAP P0-F01; ограничение и измерения сохранены, исправление не выдумано |
| 4. Реестр | Button в manifest и INDEX; `components/actions/button.md`, `.ps-button`, `#c-button` существуют, strict подтверждает ссылки |
| 5. Evidence | `figmaEvidence` указывает на сохранённые файлы; button-details.json содержит 30 node ID, включая default 2026:323 и secondary loading 2136:342. Источник геометрии — Figma по прямому заданию. Production DOM/computed не снимались и не заявлены. PNG проверки обеих тем четырёх ширин и report.json существуют |
| 6. Копируемость | PASS: тест извлёк точный HTML-блок спецификации, открыл пустую страницу с одним CSS, проверил высоту64, исходную заливку, локальный шрифт и отсутствие ошибок загрузки. Временный copy-check.html удалён тестом |
| 7. Exit criteria P0 | PASS: размеры и состояния связаны с узлами; tokens/runtime явно новые; темы сохраняют геометрию; Tab/Enter/Space, disabled/loading, сохранение фокуса и reduced motion проверены. На PNG320 одна колонка без обрезанных кнопок, на PNG1400 матрица состояний; focus и spinner видны |
| 8. Статусы | Только P0 и inventory pilot.status → done. Семейство Button остаётся partial; полные R0–R2 и R2-02 не приняты, остальные семейства figma-only |
| 9. Две проекции | N/A: machine-слой ещё не создан и не затронут; R6-01 planned. Фиктивная проекция не добавлена |
| 10. Принципы | N/A: шаг компонента, не вывод правил композиции |
| 11. Страница | N/A: витрина пилота, не шаг production-страницы или рецепта |

Самостоятельный вывод команд:

```text
> npm run validate
PASS: 1 component; registry, CSS, local dependencies and state examples agree.

> npm test -- --no-screenshots
Playwright Chromium is not installed; testing with installed Chrome.
PASS: 30 variants × 4 widths; themes, keyboard, disabled/loading, reduced motion, copyability and overflow.
```

Полные волны не закрыты. Иконковые/социальные кнопки, дополнительные слоты, готовые Typography/Layout/Icon, игровая механика и утверждённая клиентская тема остаются за рамками. Inter имеет допуск до2 px только по ширине текста; высоты и отступы проверены строго. Secondary big loading 60→64 и внешний focus-контур явно проектные. Приёмка не подтверждает соответствие production и не является релизом.
