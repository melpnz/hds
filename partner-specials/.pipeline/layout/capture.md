# Layout — R1-02 build

8 сентября 2026 года. Прочитаны guide-build, METHOD, spec-template, inventory (dependsOn пустой). R0 принят родителем. Использованы уже сохранённые layout-details.json, layout-drawn-sample.json, layout-variables.json, layout-capture.md, layout-design-context.txt; layout-1440.png открыт через view_image. Figma и production повторно не снимались.

## Контракт

Источники содержат семь размеров 1920/1440/1280/1024/768/390/320. Исключение к четырём QA-ширинам касается числовых проверок семи исходных reference profiles, а не дополнительных PNG.

Default соответствует native layoutGrid и связанным переменным. Drawn выбирается явно; различия 56/100 на 1440/1920 и 40/36 на 768 сохранены в спецификации. Это выбор нового API, не разрешение авторского конфликта. CSS thresholds 768/1024/1280/1440 новые, колонка растягивается по равным долям. Чередование 84/85 на390 указано как округление источника, не гарантированное распределение CSS.

Собраны ui/layout-tokens.css (11 базовых ролей), ui/components/layout.css (3 вычисляемые роли), спецификация, отдельная живая витрина, тест. Product CSS не рисует демонстрационные цвета, не добавляет роли, min-height или контейнер max-width. Выбор темы витрины перекрашивает поясняющие полосы без изменения геометрии.

## Самопроверка

Root подключил оба CSS в единый entry; тест переноса использует только ui/partner-specials.css на пустой странице. Тест проверяет native/drawn по сохранённым frame settings для всех семи ширин, явные профили независимо от viewport, границы переключения и длинный текст, смену темы, текущие значения каталога и отсутствие overflow на320/768/1024/1400. Никаких временных дополнительных stylesheet для прохождения теста не подключалось.

```text
PASS: Layout 7 widths × 2 profiles; single CSS, explicit profiles, boundaries, themes, token catalog and 4 responsive widths.
```

Report и снимки: [evidence/verification/layout/](../../evidence/verification/layout/). Созданы и просмотрены Layout.320.png и Layout.1400.png: обрезки и горизонтального overflow не выявлено. Файлы перенесены из служебной папки без пересъёмки. На широком экране reference полосы меньшей ширины остаются в исходном размере; большие уменьшаются для сравнения. Это масштаб витрины, не адаптивная ширина примитива.

## Передача

integration.json содержит manifest и навигацию для root. Статус partial из-за перечисленных source GAP; шаг не помечен done. Общие manifest/INDEX/entry/ROADMAP builder не редактировал. Приёмка и независимое ревью — отдельные шаги.
