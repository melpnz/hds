# P0 Button — исправления первой проверки

Дата: 2026-09-08. Сборщик не ставит done; статус полного Button остаётся partial.

| Замечание | Исправление | Проверка |
|---|---|---|
| Root URL отдавал HTML без корректного пути относительных showcase.css/js | `serve.mjs`: redirect `/` → `/showcase/components.html` | `npm test` проходит тему и проверку отсутствия404; исходные непригодные PNG заменены |
| SVG MIME отсутствовал при `nosniff` | Добавлен `image/svg+xml` | Локальный spinner загружается без ошибок и виден в PNG |
| Disabled text fillwhite не отражал opacity слоя | Добавлены `button-opacity.json` в evidence и token opacity0.5 | Browser assertion opacity и визуальная сверка |
| Big focus и hover отличаются от других размеров | Stroke4 для big,2 для medium/small; hover big#19212c с black20% | CSS, реальный hover и source screenshot |
| Browser Inter отличается от версии Figma | Новый `font-optical-sizing:none`; документированный допуск2 px только к ширине текста, без фиктивных метрик | Report сохраняет реальные значения, heights/padding strict |
| Повторная съёмка на каждом review | `--no-screenshots`, сохранение только отсутствующих PNG по умолчанию; `--force-screenshots` для исправлений UI | CLI-контракт тестового скрипта |

Итог: `npm run validate` PASS; `npm test` PASS с installed Chrome fallback. Независимый ревьюер проверяет результат отдельно.
