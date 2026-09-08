# Ревью Button — итерация 2

Вердикт: **принять с замечаниями** в пределах P0.

Проверено: исправленная реализация после review-1; сохранённые Figma evidence, актуальные PNG Button.figma.320.png и Button.figma.1400.png; новый независимый прогон `reviewer-check.mjs` от корня http://127.0.0.1:4178/ (результат reviewer-runtime.json); `npm test -- --no-screenshots`; строгий валидатор. Implementation reviewer не изменял. Production и Figma повторно не запрашивались; PNG reviewer не переснимал.

| # | Severity | Пункт | Находка | Где | Как проверить |
|---|---|---|---|---|---|
| 1 | minor | A.1, E.19 | Точная версия Inter исходного Figma неизвестна. После отключения optical sizing ширины Button 128.656/91.719/69.25 px при исходных 130/93/71; остаточная разница 1.344/1.281/1.75 px. Это известное ограничение воспроизведения текста, не дефект размеров/padding или смены темы. Сохранить GAP в ROADMAP до получения исходного шрифта. | ui/foundations.css; components/actions/button.md, «Ограничения» | После document.fonts.ready измерить default big/medium/small; числа также в reviewer-runtime.json. |

## Что проверено и претензий нет

- Major review-1 закрыт: `/` перенаправляет в `/showcase/components.html`, JS/CSS получают правильные пути. Смена темы и динамическая кнопка работают и при входе с корня. Ошибок загрузки ассетов и JS нет.
- Актуальные PNG заменили неисправную съёмку без CSS оболочки. На 1400 видна матрица три размера × пять состояний для main/secondary; на 320 — одна колонка с целыми кнопками, видимыми контурами focus и spinner. Формы, заливки и состав сверены с сохранённым button-overview.png. Внешний focus-контур и стабилизация secondary big loading 60→64 явно названы проектными дополнениями.
- Все 30 вариантов проверены на 320/768/1024/1400. Высоты строго64/48/36; padding18×32/14×20/8×12; font-size20/16/14, line-height28/20/20. Горизонтального overflow нет. Смена темы сохраняет width/height/padding/font/line-height всех30 примеров.
- Реальные Tab, Enter и Space, focus-visible, сохранение фокуса и геометрии при loading, блокировка повторных запусков, disabled Tab skip и native activation проверены. Actual hover big rgb(25,33,44); opacity disabled label0.5 совпадает с button-opacity.json.
- Reduced motion выключает animation. Проверено копирование точного HTML-блока спецификации с одним CSS-входом, локальный spinner, длинный текст с альтернативным Arial и пустая подпись без разрушения геометрии.
- Manifest остаётся partial и описывает текстовый scope P0. Локальные ассеты, CSS-токены и отделение оболочки сходятся. Production DOM и полноценные Typography/Layout/Icon, клиентская тема, machine-слой и полный Button не заявлены готовыми.

Команда `node partner-specials/tools/validate-components.mjs --strict`:

```text
PASS: 1 component; registry, CSS, local dependencies and state examples agree.
```

Команда `npm test -- --no-screenshots`:

```text
> partner-specials-pilot@0.0.0 test
> node tools/test-button.mjs --no-screenshots

Playwright Chromium is not installed; testing with installed Chrome.
PASS: 30 variants × 4 widths; themes, keyboard, disabled/loading, reduced motion, copyability and overflow.
```

Использован установленный Chrome через Playwright fallback. Тестовый сервер использовал отдельный ephemeral port. Полного аудита доступности и production-сопоставления не было; эти границы описаны в спецификации и не расширяют объём пилота.
