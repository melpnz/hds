# Header — подготовка источников R3

2026-09-08. Read-only, файл `m2O8xRs2aEU8NfUpyNiAks`, страница2096:8652, set2113:871. Реализация и реестр не изменялись.

`header-details.json` содержит свойства set, точные корневые/вложенные размеры, layout и отступы четырёх вариантов. Closed: desktop1440×99, tablet768×99, mobile390×99. Open подтверждён только mobile390×760. Наличие State=open в definitions не доказывает desktop/tablet open, которых среди children нет. `header-content.json` содержит текст, типографику и original component IDs вложенных instances. `header-visibility-paints.json` дополняет fill, alignment и visibility, `header-clipping.json` — clipsContent.

Обзор1800×369 просмотрен: светлая шапка с парной атрибуцией; desktop показывает три пункта, compact — только действие рядом с логотипами; mobile open раскрывает три пункта вертикально и широкую CTA. Обзор источника один; design context сохранён для desktop и mobile open.

Важно: пункты compact остаются в дереве с visible=true, но frame menu шириной44px обрезает их через clipsContent. `effectiveVisible` в файле paints учитывает только флаг родителя, а не clipping. При реализации скрытое меню нужно исключать из фокуса/доступного дерева новым HTML-контрактом, а не копировать Figma clipping как семантику.

Иконковая кнопка44×44 ссылается на Button2026:363; вложенный glyph — Copy20, main2099:18243. Это не hamburger и не close: наблюдаемый рисунок не заменяется догадкой. Точный glyph уже в `icon-assets/2099-18243.svg`; белую окраску экземпляра можно адаптировать как новый CSS-контракт. Навигация main2147:717; открытая CTA main2026:341,350×48. Logo main2148:817 уже снят отдельно в attribution-* и не дублировался; правила оригинальных логотипов Хабра задаёт assets/logos.

Фиксированные760px, числовые responsive thresholds, способ открытия/закрытия, фокус, Escape, scroll-lock и реальные href не подтверждены runtime. Это будущие явные решения или GAP. Надписи Пункт/Button — образцы UI-kit, не готовый клиентский контент.
