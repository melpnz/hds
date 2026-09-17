# Размерные токены HDS

Четыре системы используют отдельные масштабируемые шкалы размеров с общей базой `0.25rem` (`4px` при эталонном root `16px`). Осознанные общие ступени — `0.0625rem`, `0.125rem` и `0.375rem`, соответствующие исходным `1px`, `2px` и `6px`:

- `habr/machine/dimension-tokens.json`
- `career/machine/dimension-tokens.json`
- `courses/machine/dimension-tokens.json`
- `landings/machine/dimension-tokens.json`

JSON — источник истины. Файл `ui/dimension-tokens.css` генерируется из него и подключается общей точкой входа системы. Компонентный CSS использует CSS custom properties и не должен повторно объявлять кратные сетке абсолютные размеры.

## Имена

Формат: `--<product>-<category>-<reference-px-value>`.

```css
--courses-space-16: 1rem;
--career-size-48: 3rem;
--landings-radius-12: 0.75rem;
--habr-font-size-24: 1.5rem;
--habr-border-width-1: 1px;
--career-radius-6: 0.375rem;
--career-radius-full: 999rem;
--career-line-height-20-on-14: 1.428571;
```

Число в совместимом имени — эталонный размер при root `16px`, а не гарантированное вычисленное число пикселей. Имена сохранены, чтобы не ломать существующих потребителей.

Политика единиц:

- `space`, `size`, `radius`, `font-size`, тени и оптические смещения — `rem`;
- line-height в известном текстовом контексте — безразмерный токен с явной парой исходной высоты и размера шрифта (`20-on-14`); совместимые абсолютные алиасы остаются в `rem`, если font-size нельзя определить однозначно;
- обычные круглые формы — `50%`, капсулы — `radius-full`;
- `border-width` и толщина focus ring — фиксированные `px`;
- offset focus ring масштабируется в `rem`.

## Автоматическая миграция

Генератор заменяет абсолютные `px`, кратные четырём, а также утверждённые ступени `1px`, `2px` и `6px` в поддерживаемых CSS-свойствах и выдаёт масштабируемые `rem`-токены. Line-height становится безразмерным, когда в том же контексте однозначно известен font-size. Селекторы, классы и DOM-контракты не меняются. Нормализации, явно одобренные дизайнером, зафиксированы в генераторе отдельно.

```powershell
node tools/tokenize-dimensions.mjs courses --write
node tools/tokenize-dimensions.mjs courses --check
```

Команды `npm run build:dimension-tokens` и `npm run validate:tokens` доступны внутри каждого пакета. Обычный `npm run validate` также проверяет токены.

## Исключения

Некратные значения не округляются. Брейкпоинты и неоднозначные контексты line-height сохраняются до отдельного решения. Полные списки находятся в:

```text
<product>/machine/reports/dimension-exceptions.md
<product>/machine/reports/dimension-exceptions.json
```

Это очередь дизайнерского разбора, а не автоматически признанные ошибки.
