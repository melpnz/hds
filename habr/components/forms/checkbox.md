# Checkbox

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `.checkbox` |
| **CSS** | `ui/components/checkbox.css` |
| **Production** | найден на 1 странице (`/ru/feed/`, фильтр типов публикаций) |
| **Figma** | habr-lib → `checkbox/radiobutton` — Checked/Indeterminate × Inactive/Hover/Disable |

## Назначение

Флажок. Построен на настоящем `<input type="checkbox">`, не на `<div>` —
доступность встроена в разметку, не имитируется CSS.

## Анатомия (реальная разметка, `/ru/feed/`)

```html
<label class="checkbox">
  <input class="input visually-hidden" type="checkbox" name="types" value="articles" checked>
  <span class="indicator"></span>
</label>
```

`.input` дополнительно несёт утилитарный класс `visually-hidden` из
`ui/foundations.css` — он подключается общей точкой входа `ui/habr.css`.
Сам input визуально скрыт, но остаётся в потоке доступности; видимый
квадрат рисует `.indicator`, соседний элемент.

## Состояния

Все — через нативные псевдоклассы `input`, не через классы-модификаторы:

| Состояние | Селектор | Эффект |
|---|---|---|
| checked | `.input:checked + .indicator` | заливка `--accent-primary`, белая галочка (инлайновый SVG, см. CSS) |
| indeterminate | `.input:indeterminate + .indicator` | та же заливка, короткая горизонтальная черта вместо галочки |
| focus (клавиатура) | `.input:focus-visible + .indicator` | внешний контур `box-shadow: 0 0 0 2px` |
| disabled | `.input:disabled + .indicator` | серая заливка `--other-disabled-elements` |
| hover — **FIGMA TARGET, не production** | `.input:hover:not(:checked)... + .indicator` | синяя рамка `--accent-primary` |

`.checkbox.is-disabled` на обёртке дублирует смысл через `cursor:default` —
использовать оба (класс на label + атрибут `disabled` на input).

**Обновлено на этапе Figma Library Extraction pass.** Строка hover выше
добавлена в CSS — `get_variable_defs` на Figma-узле подтвердил точное
значение (`unchecked/border_hover=#548eaa` = `--accent-primary`, реальный
Habr-токен, не выдуманный хекс), но в `checkbox-CJ1LCFDi.css` НЕТ ни
одного `:hover`-селектора — это дизайн-намерение, не текущее поведение
продукта. Правило в CSS отдельно закомментировано как FIGMA TARGET —
раньше здесь стояла инструкция не дорисовывать hover вообще; текущий
проход прямо запросил code-first reference для таких случаев, с явной
пометкой, поэтому решение пересмотрено.

## Ограничения

Единственное production-подтверждение — один фильтр на одной странице.

## Источники

Production: `checkbox-CJ1LCFDi.css`, разметка — `page-feed.html`.
Figma: `habr-lib`, canvas `checkbox / radiobutton` (848:10433).
