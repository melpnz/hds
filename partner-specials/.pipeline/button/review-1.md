# Ревью Button — итерация 1

Вердикт: **вернуть на доработку**.
Проверено: guide-review, METHOD и review-checklist; P0 из PILOT/ROADMAP; спецификация, CSS, manifest, capture; сохранённые button-details.json, button-opacity.json и button-overview.png. Независимый Chromium/Chrome runtime через `reviewer-check.mjs`, без новой съёмки Figma или production. Ревью проведено во время завершения сборки, до финального прогона builder.

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | major | C.12, A.3 | Корень сервера возвращает HTML витрины без перенаправления; относительные showcase.js и showcase.css получают 404. Тема не переключается, динамическая загрузка не работает, статические hover/focus-preview не окрашены. Уже снятый Button.figma.320.png отражает эту ошибку. | tools/serve.mjs, обработка pathname `/` | Открыть http://127.0.0.1:4178/, выбрать demo: data-ps-theme остаётся figma. Network: /showcase.js и /showcase.css 404. Нужен redirect и пересъёмка неисправного QA после исправления. |
| 2 | minor | A.1, E.19 | При текущей локальной версии Inter ширина Button big/medium/small 127.672/91.469/69.25 вместо исходных 130/93/71 px. Расхождение 2.328/1.531/1.75 px. GAP версии шрифта уже честно записан; он не мешает использованию пилота, но текущая проверка с допуском 1.5 px не проходит. | ui/foundations.css; tools/test-button.mjs | Открыть прямую /showcase/components.html, дождаться document.fonts.ready, getBoundingClientRect для default. Сверить локальный шрифт; если точного исходного файла нет — зафиксировать измеренное ограничение и отдельный tolerance вместо утверждения точного совпадения. |

## Что проверено и претензий нет

- На прямом /showcase/components.html проходят 30 примеров × 320/768/1024/1400, без горизонтального overflow; смена темы сохраняет width/height/padding/font/line-height.
- Высоты 64/48/36, padding 18×32 / 14×20 / 8×12 и typography 20/28,16/20,14/20 совпадают с исходной геометрией. Исключение secondary loading 60→64 явно описано как новое решение.
- Actual hover big rgb(25,33,44), disabled opacity0.5, клавиатурный focus-visible, Enter/Space, guard повторной загрузки и сохранение фокуса, пропуск disabled при Tab работают.
- Reduced motion выключает spinner animation; копия точной разметки спецификации с единственным CSS имеет height64 и локальный spinner. Пустая подпись сохраняет геометрию, но не является рекомендуемым доступным содержимым.
- Ассеты локальные, UI не содержит showcase-классов. Runtime/ARIA/tokens явно названы новой реализацией. Manifest partial не заявляет полного Button или готовых R1 семейств.
- Production-сопоставление не выполнялось: по прямому заданию P0 источник геометрии Figma; отсутствие production DOM — заявленная граница, не требование придумать источник.

Команда `node partner-specials/tools/validate-components.mjs --strict`:

```text
PASS: 1 component; registry, CSS, local dependencies and state examples agree.
```

Окончательные PNG и успешный npm test нужно проверить после завершения builder. Полный аудит доступности, клиентская тема и остальные R0–R2 шаги в это ревью не входят.
