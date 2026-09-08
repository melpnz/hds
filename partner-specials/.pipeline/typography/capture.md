# R1-01 Typography — подготовка к ревью

Дата: 2026-09-08. R0 принят до реализации. Scope: 28 semantic, 10 fixed, 64 текстовых сочетания, каталог всех 78 новых токенов и настройка цвета/шрифта. Point `2085:319` и List Vertical Item `2081:766` отложены до R2-01 Icon; полное семейство остаётся partial. Это граница объёма, не заявление о готовом полном Typography.

Источники — только уже сохранённые `evidence/source/figma/typography-*`: свойства `2045:229`, `2080:287`, `2049:285`, `2058:321`, `2077:427`; точные textStyleId и размеры дочерних текстов. [Протокол чтения](../../evidence/source/figma/typography-findings.md) и обзор Figma существовали до build. Повторной съёмки источников не было. Production не снимался: прямое задание определяет Figma-геометрию и клиентскую тему, HTML/CSS — новая реализация.

CSS-вход подключает отдельные typography-tokens.css и components/typography.css. Значения всех 78 токенов показаны в витрине с фактическими computed-значениями; точные исходные значения и назначение есть в спецификации. Витрина имеет отдельный префикс type-showcase. Работа не меняла shared tokens.css и button runtime.

Runtime-решения: `auto` переключается при 1024px (в источнике числового порога нет); явные desktop/mobile режимы; текст переносится в ширине контейнера; сброшены нативные margin. Исходная ширина400 использована только для source comparison, не как обязательная ширина текста. Клиентские font/color overrides ограничены контейнером.

## Проверки

`node partner-specials/tools/test-typography.mjs` сначала обнаружил особенность CSSOM: нулевой letter-spacing возвращается как `normal`. Исправлена интерпретация нулевого значения в тесте; CSS не менялся.

Финальный результат:

```text
PASS: Typography 28 semantic + 10 fixed + 64 pairs × 4 widths; 78 tokens, font/theme changes, source geometry and single-CSS copyability.
```

Проверено 320/768/1024/1400, точные кегль/line-height/weight и gap против сохранённых JSON, высоты 28 семантических образцов и 64 пар при исходной ширине400, default/demo, Georgia вместо локального Inter, отсутствие переполнения, длинное слово и пустой текст, отдельная страница из HTML спецификации с одним CSS без витрины. Пример временной страницы удалён тестом. Подробности — `evidence/verification/typography/test-report.json`. Тесты не заявляют совпадение глифовых ширин неизвестной версии Inter (P0-F01).

`node partner-specials/tools/validate-components.mjs --strict` после интеграции координатором:

```text
PASS: 3 component; registry, CSS, local dependencies and state examples agree.
```

`git diff --check` для файлов реализации — без ошибок. Скриншоты `evidence/verification/typography/Typography.320.png` и `Typography.1400.png` открыты: живой текст читаем, переполнений не замечено. Это именованные кропы `#c-typography`; прежние снимки viewport показывали преимущественно оболочку и были заменены из-за неверного охвата. Полное покрытие вариантов проверено браузерными измерениями.

## Не подтверждено

Точная версия Inter и глифовая ширина; production runtime; утверждённая тема реального клиента; полная реализация Point/List. Новых правил с coverage продакшена не заявлено. Ревью и приёмка ещё не выполнены, done не выставлен.
