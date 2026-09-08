# P0 — текстовая Button: сборка

Дата: 2026-09-08. Объём пользователя и отдельный P0 зафиксированы родителем в ROADMAP до UI-реализации. Новый пакет в разработке, без релиза. Полные Typography, Layout, Icon и Button не закрываются.

## Источники

- Figma `m2O8xRs2aEU8NfUpyNiAks`, Button `2026:322`; snapshot `evidence/source/figma/button-overview.png` и metadata `button.xml` уже имелись, не переснимались.
- Родитель снял недостающие точные свойства 30 текстовых узлов: `button-details.json` и дополнительные opacity `button-opacity.json`. Основные default `2026:323`, `2026:341`, `2129:96`, secondary `2136:338`, `2136:358`, `2136:362`; все состояния и node ID — в выписке.
- `button-design-context.txt` и `button-loading-context.txt` подтверждают Inter Bold и экспорт spinner.
- Spinner скопирован без изменения из `https://www.figma.com/api/mcp/asset/9fd9dbd7-e54b-4396-bde7-891b54a04566.svg` в `ui/assets/spinner.svg`.
- Латинский и кириллический Inter woff2 скопированы из готовых локальных бинарных ассетов `landings/ui/assets/fonts/` по разрешению родителя; CSS/спецификации чужого пакета не использовались. Лицензия получена из официального `https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt`, сохранена рядом.
- Production DOM/CSS/состояния не снимались: Figma определён прямым заданием как источник геометрии. Ссылки исследования не выдаются за runtime evidence.

## Реализация и решения

`ui/partner-specials.css` подключает tokens, локальный Inter, Button и явно новый state-contract. Текстовые main/secondary × big/medium/small со всеми пятью состояниями показаны в showcase. Статические hover/focus-visible добавляются только классами оболочки витрины; настоящие псевдоклассы работают на каждой доступной кнопке.

Имена `--ps-*`, HTML, клавиатурное поведение, сохранение фокуса при динамической загрузке, анимация 900 ms, reduced motion, внешний контур фокуса и обрезка длинной строки — новая реализация, а не API из Figma/production. Фиксированная высота 64/48/36 при загрузке — контракт пилота. Конфликт: secondary big loading `2136:342` в источнике 60 px; здесь 64 px, явно отмечено в спецификации и витрине.

В исходной теме воспроизведены разные big hover (дополнительный black20%) и big focus (внутренняя обводка4). Medium/small имеют однослойный hover и обводку2. Disabled label opacity0.5 подтверждена дополнительной выпиской. Демонстрационная тема заменяет палитру и радиусы, сохраняя геометрию; утверждённой клиентской темой не является.

## Проверки

Команды: `npm run validate`, `npm test`. Browser test сохраняет снимки двух тем на 320/768/1024/1400 и `evidence/verification/button/report.json`, проверяет 30 вариантов, размеры/отступы/типографику, отсутствие переполнения, неизменную геометрию тем, реальные Enter/Space/Tab, disabled, loading и reduced motion. Точный HTML-блок спецификации временно записывается в `.pipeline/button/copy-check.html`, открывается с одним CSS, снимается, затем файл удаляется в finally. Отдельно проверяется длинная строка с Arial на 320 px. Результат прогонов фиксируется ниже после завершения.

Первый запуск `npm test` до завершения установки Chromium: FAIL, отсутствовал `chromium_headless_shell-1208`. Причина окружения, не результат проверки компонента; браузер устанавливается `npx playwright install chromium`.

## Неподтверждённое

Нет production-корпуса, проверенного соответствия клиентским проектам, утверждённых клиентских материалов, полной icon/social реализации и полной основы Typography/Layout. Версия шрифта Figma неизвестна; browser-ширина текста проверяется с допуском2 px к округлённым слоям. Новый контракт `font-optical-sizing: none` уменьшил расхождение: browser128.65625/91.71875/69.25 против Figma130/93/71; точные метрики сохранены в report. Высоты и padding проверяются строго. Исходная secondary палитра недостаточно контрастна для обычного белого текста; она сохранена как пример источника, не пройденный аудит доступности.

Статус manifest: `partial`. Независимая приёмка и статус P0 принадлежат родительскому конвейеру.

## Итог сборщика

- `npm run validate`: `PASS: 1 component; registry, CSS, local dependencies and state examples agree.`
- `npm test`: `Playwright Chromium is not installed; testing with installed Chrome.` Затем `PASS: 30 variants × 4 widths; themes, keyboard, disabled/loading, reduced motion, copyability and overflow.`
- До исправления local server root второй test упал на неизменном цвете темы: из `/` относительный showcase.js получал404. После redirect на `/showcase/components.html` весь test прошёл, все первичные PNG пересняты поверх непригодных ранних. Browser errors/asset404 теперь также проверяются в прошедшем прогоне.
- Просмотрены готовые PNG320/1400 и исходный overview Figma. Подтверждены состояния/цвета, размерная иерархия, отсутствие обрезания контейнера; различия внешнего focus outline, высоты secondary loading и текстовых метрик явно описаны. 320px-витрина длинная из-за вертикального показа всех30 вариантов, это документационная композиция.
- Восемь PNG двух тем и отдельный copy-check находятся в `evidence/verification/button/`, runtime/geometry — в `report.json`. Временный copy-check HTML удалён после теста.
- Повторное ревью: `npm test -- --no-screenshots`. Обычный `npm test` сохраняет только отсутствующие PNG; после реальных UI-правок допустим `npm test -- --force-screenshots`.
