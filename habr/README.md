# Хабр — machine-first UI guide

Пакет знаний о визуальном языке и композиции `habr.com`. Данные перенесены из Habr guide v1 на адресную структуру showcase-template.

- Последняя подтверждённая production-версия: `2.346.1`.
- Сверка без расхождений выполнялась также на `2.346.2`.
- Последняя дата исходного исследования: 7 сентября 2026.
- Источники: production гостя, Storybook, Figma `habr-lib` и company admin.
- Архив исходного пакета: `archive/habr/v1` — только для сверки миграции, не для обычного чтения.

## Как читать ИИ

1. Открой только [`machine/index.json`](machine/index.json).
2. По задаче найди сущность в [`machine/catalog.json`](machine/catalog.json) по `id`, `kind`, группе или `tags`.
3. Открой только её поле `file`.
4. Загружай `markdown`, `implementation`, `rules` и `examples` только если они нужны для реализации.
5. Не читай весь каталог, все иконки, `viewer/` или архив заранее.

Канон — небольшие JSON-файлы в `machine/`. Viewer и Markdown — адресные человеческие представления и evidence, а не параллельные спецификации.

## Граница знаний

Хорошо подтверждены production:

- публичная оболочка и контейнер;
- content feed/listing;
- directory listing;
- profile/entity;
- 25 компонентных сущностей с реальным CSS и изолированными примерами.

Company admin подтверждён только Figma. Это сильная гипотеза о композиции, но не production-разметка.

Частично покрыты article detail, comments, search и overlay flows. Не покрыты полноценный editor, settings вне admin, service/error и авторизованный production. Для этих зон используй ближайший подтверждённый паттерн, явно раскрывай допущение и не придумывай DOM.

## Основные входы

| Задача | Файл |
|---|---|
| Маршрутизация для ИИ | [`machine/index.json`](machine/index.json) → [`machine/catalog.json`](machine/catalog.json) |
| Визуальная витрина | [`viewer/`](viewer/) |
| Токены тем | [`machine/tokens.json`](machine/tokens.json) |
| Ассеты | [`machine/assets.json`](machine/assets.json) |
| Полный реестр компонентов | [`components/INDEX.md`](components/INDEX.md) |
| Композиционные правила | [`RULES.md`](RULES.md) |
| Runtime CSS | [`evidence/runtime-contract.md`](evidence/runtime-contract.md) |
| Источники и конфликты | [`evidence/source-map.md`](evidence/source-map.md), [`evidence/conflicts.md`](evidence/conflicts.md) |
| Незакрытые области | [`ROADMAP.md`](ROADMAP.md) |
| Карта миграции | [`machine/migration-map.json`](machine/migration-map.json) |

Старые адреса `showcase/components.html` и `showcase/pages.html` сохранены как лёгкие переходы в новый viewer.

## Структура

```text
habr/
  machine/
    index.json              граница знаний и порядок чтения
    catalog.json            компактный маршрутизатор по 89 сущностям
    foundations/*.json      основы и ассеты
    components/*.json       компоненты
    patterns/*.json         14 семейств страниц, включая пробелы
    documents/*.json        адреса правил, решений и evidence
    tokens.json             значения light/dark тем
    assets.json             инвентарь ассетов
    migration-map.json      сверка старого и нового слоя
  examples/generated/       63 изолированных HTML-примера
  components/               подробные Markdown-спецификации
  docs/rules/               разрезанные правила и Decision Guides
  docs/patterns/            разрезанная таксономия страниц
  evidence/                 источники и границы достоверности
  ui/                       CSS и ассеты Habr
  viewer/                   человеческая оболочка
  tools/migrate-from-v1.py  локально воспроизводимая миграция из архива
```

## Preview-контракт

- Небольшие сущности используют `intrinsic`: без панели разрешений, варианты друг под другом, iframe по высоте содержимого.
- Страницы используют `viewport`: `320 / 480 / 768 / 1024 / Auto`.
- Контрольные брейкпоинты страницы — 320, 768 и 1024; 480 проверяет резину между ними.
- Пояснения находятся в `previewNotes` снаружи iframe.
- Точечный фон принадлежит viewer; белый фон внутри iframe принадлежит продукту.

## Запуск и проверка

```powershell
npm install
npm run validate
npm run serve
npm run validate:viewer -- http://127.0.0.1:4173
```

Viewer: `http://127.0.0.1:4173/viewer/`.

Статическая проверка сверяет пути, метрики и зафиксированный при миграции baseline: 23 исходные спецификации, 109 production-иконок, 137 editor-иконок и 20 иллюстраций. Браузерная проверка проходит все 89 страниц, проверяет поиск, preview-режимы, ширины, overflow и декодирование ассетов.

`npm run migrate` нужен только для локальной повторной сборки и требует игнорируемый Git архив `archive/habr/v1`. Обычное чтение, публикация и обе проверки от архива не зависят.

## Совместимость

Минимальное подключение CSS не изменилось:

```html
<link rel="stylesheet" href="ui/themes/light-v2.css">
<link rel="stylesheet" href="ui/habr.css">
```

`ui/habr.css` уже импортирует normalize и foundations. Пути `ui/`, `components/`, `evidence/`, `RULES.md` и `ROADMAP.md` сохранены.
