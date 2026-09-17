# Размерные токены HDS

Четыре системы используют отдельные шкалы размеров с общей базой `4px`. Осознанные общие исключения — `1px`, `2px` и `6px`:

- `habr/machine/dimension-tokens.json`
- `career/machine/dimension-tokens.json`
- `courses/machine/dimension-tokens.json`
- `landings/machine/dimension-tokens.json`

JSON — источник истины. Файл `ui/dimension-tokens.css` генерируется из него и подключается общей точкой входа системы. Компонентный CSS использует CSS custom properties и не должен повторно объявлять кратные сетке абсолютные размеры.

## Имена

Формат: `--<product>-<category>-<resolved-px-value>`.

```css
--courses-space-16: 16px;
--career-size-48: 48px;
--landings-radius-12: 12px;
--habr-font-size-24: 24px;
--habr-border-width-1: 1px;
--career-radius-6: 6px;
```

Категории: `space`, `size`, `radius`, `font-size`, `line-height`, `border-width`. Число в имени — итоговый размер в пикселях, а не номер ступени шкалы.

## Автоматическая миграция

Генератор заменяет абсолютные `px`, кратные четырём, а также утверждённые ступени `1px`, `2px` и `6px` в поддерживаемых CSS-свойствах. Селекторы, классы и DOM-контракты не меняются. Нормализации, явно одобренные дизайнером, зафиксированы в генераторе отдельно.

```powershell
node tools/tokenize-dimensions.mjs courses --write
node tools/tokenize-dimensions.mjs courses --check
```

Команды `npm run build:dimension-tokens` и `npm run validate:tokens` доступны внутри каждого пакета. Обычный `npm run validate` также проверяет токены.

## Исключения

Некратные значения не округляются. Относительные единицы, брейкпоинты, оптические поправки и геометрия составных эффектов сохраняются до отдельного решения. Полные списки находятся в:

```text
<product>/machine/reports/dimension-exceptions.md
<product>/machine/reports/dimension-exceptions.json
```

Это очередь дизайнерского разбора, а не автоматически признанные ошибки.
