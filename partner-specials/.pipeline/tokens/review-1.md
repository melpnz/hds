# Ревью Tokens — итерация 1

Вердикт: **принять**.

Независимое ревью P0-T01, 8 сентября 2026 года. Проверены METHOD.md, review-checklist.md, audit.md, capture.md, TOKENS.md, изменения partner-specials, tokens.js, test-tokens.mjs и CSS кнопки. Код реализации не изменялся.

Находок blocker, major и minor нет. Приёмка и изменение статуса шага выполняются отдельно.

## Что проверено и претензий нет

- Каталог содержит ровно 39 публичных имён из ui/tokens.css: 12 оформления, 25 базы, 2 поведения. Значения получаются из computed styles исходной матрицы и обновляются для обеих тем. Новые имена пакета не выдаются за Figma variables.
- Редактор меняет реальные кнопки; цвета и радиусы сохраняют их размеры и исходную матрицу. Нулевые радиус и opacity применяются. Arial проверен через computed fontFamily; Georgia и сохранение высот, отступов, кеглей и интерлиньяжа проверены test:tokens. Изменение ширины текста при смене шрифта явно описано как ограничение.
- Экспорт содержит отдельный hover-big и работает на пустой странице с одним ui/partner-specials.css. Сброс возвращает выбранную тему, включая demo. Обработчик копирования показывает асинхронный результат; проверка дождалась непустого status.
- Spinner использует неизменённый локальный SVG как mask; его currentColor следует --ps-on-button. Состояния и reduced motion пилота сохранились.
- Живой браузер Chrome открыт через Playwright/createServer. Развёрнуты все группы каталога: горизонтального overflow нет на 320, 768, 1024, 1400. Уже сохранённые Tokens.320.png и Tokens.1400.png просмотрены через view_image: элементы формы, примеры, CSS и каталог расположены без обрезки. Новые снимки не делались.
- Оболочка остаётся в showcase, продуктовый CSS не зависит от редактора. TOKENS.md объясняет слои базы, оформления и поведения, источники и отклонение secondary big loading; полного UI-kit или сверенного клиентского production не заявляет.

## Независимые гейты

`npm test -- --no-screenshots`:

```text
Playwright Chromium is not installed; testing with installed Chrome.
PASS: 30 variants × 4 widths; themes, keyboard, disabled/loading, reduced motion, copyability and overflow.
```

`npm run test:tokens -- --no-screenshots`:

```text
PASS: 39 tokens; theme catalog, live edits, isolated CSS export, spinner color and responsive layout.
```

`node tools/validate-components.mjs --strict` — дословный вывод:

```text
PASS: 1 component; registry, CSS, local dependencies and state examples agree.
```

Дополнительная ad hoc проверка сначала прочитала status копирования до завершения Promise и получила пустую строку. Повтор с waitForFunction до непустого status прошёл; дефект реализации не воспроизведён. Остальные дополнительные assertions (четыре ширины с открытым каталогом, нулевые значения, demo reset, Arial) прошли в первом запуске.

## Границы ревью

Проверено дополнение к принятому пилоту, а не новая независимая съёмка Figma/production. Изменения исходных измерений не заявлены; существующее ограничение метрик Inter и контраста исходной secondary остаётся. Машинный слой полного пакета и другие семейства элементов не входят в P0-T01.
