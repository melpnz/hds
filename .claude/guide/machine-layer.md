# Машиночитаемый слой

Гайд читают двое: человек и модель. Человеку нужен текст с примерами, модели —
структура, по которой можно собрать интерфейс, не гадая. Это один и тот же пакет
в двух проекциях; расходятся они только по ошибке.

Всё лежит в `<product>/machine/`. Формат — JSON, UTF-8, ключи латиницей,
значения на языке пакета.

## index.json — точка входа

Первый файл, который читает потребитель. Отвечает: что за продукт, какой версии,
где что лежит, чем проверяется, где граница знаний.

```json
{
  "product": "career",
  "version": "1.2.0",
  "kind": "product-interface",
  "language": "ru",
  "css": "ui/career.css",
  "files": {
    "tokens": "machine/tokens.json",
    "components": "machine/components.json",
    "rules": "machine/rules.json",
    "patterns": "machine/patterns.json",
    "content": "machine/content.json"
  },
  "humanDocs": ["README.md", "docs/guide/composition.md", "docs/guide/decisions.md"],
  "checks": ["node tools/validate-components.mjs --strict", "node tools/validate-machine.mjs"],
  "coverage": {
    "pagesCaptured": 16,
    "componentsComplete": 72,
    "boundary": "публичная часть продукта, снятая гостем; личный кабинет не покрыт"
  },
  "generatedAt": "2026-09-07",
  "generatedBy": "tools/build-machine.mjs"
}
```

## tokens.json — переменные

Формат [DTCG](https://tr.designtokens.org/): `$value`, `$type`, `$description`.
Ссылки между токенами — фигурными скобками. Источник каждого токена обязателен.

```json
{
  "color": {
    "ui-primary": { "$type": "color", "$value": "#1f8fff",
      "$description": "Единственный акцент действия",
      "$extensions": { "guide": { "source": ":root career-web", "cssVar": "--color-ui-primary", "usage": "основное действие, ссылки, выбранное состояние" } } },
    "ui-primary-10": { "$type": "color", "$value": "{color.ui-primary}", "$extensions": { "guide": { "alpha": 0.1 } } }
  },
  "space": { "card-gap": { "$type": "dimension", "$value": "12px" } }
}
```

## components.json — каталог

По записи на компонент. Всё, что нужно, чтобы вставить компонент и не ошибиться:
когда он уместен, как называется его текст, как ведёт себя, и готовая разметка.

```json
{
  "id": "button",
  "name": "Button",
  "category": "actions",
  "kind": "component",
  "spec": "components/actions/button.md",
  "status": "complete",
  "usage": {
    "when": "Основное или второстепенное действие на экране",
    "whenNot": "Переход на другую страницу без побочного эффекта",
    "insteadUse": ["hyperlink"]
  },
  "content": {
    "naming": "инфинитив совершенного вида, отвечает на вопрос «что сделать?»",
    "case": "первая буква заглавная",
    "maxLines": 1,
    "examples": { "good": ["Откликнуться", "Сохранить"], "bad": ["Отклик", "Сохранение изменений в профиле"] }
  },
  "sizes": [{ "id": "m", "height": 40, "padding": "0 16px", "fontSize": 16, "radius": 8, "context": "форма, карточка" }],
  "variants": [{ "id": "primary", "background": "{color.ui-primary}", "color": "{color.font-white}" }],
  "states": ["default", "hover", "focus-visible", "pressed", "disabled", "loading"],
  "props": [{ "name": "size", "type": "'s'|'m'|'l'", "default": "m" }],
  "slots": ["default", "icon"],
  "a11y": { "role": "button", "keyboard": ["Enter", "Space"], "focusVisible": true, "ariaRequired": [] },
  "markup": { "html": "<button class=\"base-button base-button--primary\">Откликнуться</button>", "requires": ["ui/career.css"] },
  "anchor": "showcase/components.html#c-button",
  "cssRoots": ["base-button"],
  "rules": ["C-3", "DG-11"],
  "evidence": [{ "type": "production", "url": "https://…/vacancies", "selector": ".base-button" },
               { "type": "figma", "fileKey": "…", "nodeId": "12:340" }]
}
```

`markup` — не иллюстрация, а контракт: этот HTML обязан отрисовываться правильно
на пустой странице с одним `css` из `index.json`. Это проверяется автоматически.

## rules.json — правила композиции

```json
{
  "id": "L-4",
  "scope": "listing",
  "statement": "Шаг между карточками списка — 12, независимо от типа сущности и вьюпорта",
  "predicate": { "type": "spacing", "selector": ".card + .card", "property": "margin-top", "equals": "12px" },
  "evidence": { "pages": 6, "viewports": [320, 768, 1024, 1400], "coverage": "6/6 листингов" },
  "confidence": "HIGH",
  "appliesTo": ["patterns/listing"],
  "humanDoc": "docs/guide/composition.md#l-4"
}
```

`predicate` — то, чем правило проверяется. Типы: `spacing`, `size`, `color`,
`typography`, `presence`, `order`, `breakpoint`, `manual`. Правило без предиката
допустимо только с `"predicate": {"type": "manual", "check": "…"}` — и тогда
оно проверяется человеком, о чём честно сказано.

Decision Guides лежат там же, с `"kind": "decision-guide"` и полями
`observed`, `when`, `prefer`, `avoid`, `gap`, `confidence`.

## patterns.json — паттерны страниц и рецепты

```json
{
  "id": "listing",
  "name": "Листинг сущностей",
  "grid": { "container": 1100, "main": 752, "gap": 24, "aside": 300 },
  "areas": [
    { "area": "header", "use": ["page-header"] },
    { "area": "main", "sequence": ["section-header", "filter-chips", "entity-card*", "pagination"] },
    { "area": "aside", "use": ["promo", "filter-panel"] },
    { "area": "footer", "use": ["page-footer"] }
  ],
  "responsive": [
    { "maxWidth": 1024, "change": "главная колонка 685, сайдбар остаётся 300" },
    { "maxWidth": 768, "change": "сайдбар уходит, фильтры открываются модально" }
  ],
  "rules": ["SH-1", "L-1", "L-4", "C-1"],
  "example": { "page": "pages/vacancies.md", "url": "https://…/vacancies", "screenshot": "evidence/curated/listing/1400.png" }
}
```

Для лендинга то же поле `areas` описывает последовательность блоков сверху вниз,
а `id` рецепта — тип страницы: `product-landing`, `campaign`, `pricing`.

## content.json — правила текста

Тон, регистры, формы глаголов, длины, запрещённые слова, форматы чисел и дат.
Ссылается на компоненты по `id`, чтобы генератор знал, как назвать кнопку
в конкретном месте.

## Контракт для модели

В корне пакета лежит `AGENTS.md` — короткая инструкция потребителю-модели:

1. читать `machine/index.json`, дальше только перечисленные там файлы;
2. экран собирать так: паттерн → области → модули → компоненты → тексты;
3. разметку брать из `markup`, ничего в ней не переименовывать;
4. значения брать только из `tokens.json`; литералов не вводить;
5. проверять результат правилами из `rules.json` с исполнимым предикатом;
6. чего в пакете нет — не выдумывать: `coverage.boundary` говорит, где граница.

## Сборка и проверка

- `tools/build-machine.mjs` собирает `machine/*` из `manifest.json`, CSS, спецификаций
  и файлов `machine/*.overrides.json` (там живёт то, что скрипт снять не может:
  usage, тон, наименования).
- `tools/validate-machine.mjs` падает, если: id есть в JSON и нет в markdown или
  наоборот; `markup` не отрисовывается на пустой странице; токен не найден в CSS;
  правило ссылается на несуществующий паттерн; предикат правила не выполняется
  на витрине.

Ручная правка `machine/*.json` вместо правки источника — ошибка: следующая сборка
её сотрёт.
