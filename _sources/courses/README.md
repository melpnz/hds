# COURSES Storybook — локальный snapshot

`https://develop.career.habratest.net/courses-web/storybook-static/`

Снято 2 сентября 2026. Исследовательский корпус, не зеркало для запуска.

## Что это за Storybook

| | |
|---|---|
| Версия | 8.4.7 |
| Framework | @storybook-vue/nuxt (nuxt) |
| Renderer | @storybook/vue3 |
| Builder | @storybook/builder-vite |
| Формат индекса | index.json v5 |
| Сборка Storybook | 2026-09-02 |

## Полнота

| | |
|---|---|
| Inventory coverage | 45 / 45  (100%) |
| Stories с разметкой | 23 / 27  (85%) |
| Docs captured | 16 / 18  (89%) |
| Stories с props | 21 / 27  (78%) |
| Stories с исходником | 23 / 27  (85%) |
| Пустой рендер | undefined |
| CSS-файлов | 13 |
| Ассетов | 20 |

## Структура

```text
courses/
  README.md          этот файл
  inventory.json     машиночитаемый индекс: entries, props, пути к локальным файлам
  inventory.md       тот же индекс таблицей
  catalog.md         иерархический searchable каталог — основной вход для поиска
  index.html         исходная оболочка manager
  metadata/
    index.json       оригинальный ответ Storybook
    project.json     оригинальный ответ Storybook
    iframe.html      оригинальная оболочка preview
    stories/*.json   по одному файлу на story: argTypes, initialArgs, parameters, исходник
    css-map.json     story → какие CSS-файлы были подключены
    resources.json   что скачано в source/
    _failures.json   что не удалось снять
  docs/              <id>.html — отрендеренный DOM docs-страницы
                     <id>.txt  — очищенный текст (описания, таблицы props)
  rendered/          <id>.html — innerHTML #storybook-root после рендера story
  source/css/        CSS, реально подключённый preview
  source/assets/     ассеты, на которые ссылаются разметка и CSS
```

## Объём

| Каталог | Размер |
|---|---:|
| rendered | 32 KB |
| docs | 169 KB |
| metadata | 200 KB |
| source/css | 103 KB |
| source/assets | 762 KB |
| **всего** | **1398 KB** |

## Особенности

* Тот же Nuxt-стек и та же версия Storybook, что у Career, — `extract()` также недоступен, метаданные собраны по одной story.
* Самая маленькая библиотека из трёх: 18 компонентов.
* **Четыре story не рендерятся в самом Storybook** с ошибкой `[nuxt] instance unavailable`: `BaseButton` (обе story) и `CatalogIcon` (обе). Их docs-страницы показывают «No Preview». Ирония в том, что именно `common-basebutton--docs` был отправной ссылкой на этот Storybook.
* Шрифты PT Sans, объявленные в CSS, отдают 404 на этом хосте — сохранить их не удалось.

## CSS с объявлениями переменных

| Файл | Объявлений | Размер |
|---|---:|---:|
| `index.CSGoIsqw.css` | 199 | 48784 B |
| `preview.CoGQq0WZ.css` | 96 | 46599 B |

## Пропуски

```text
common-basebutton--primary-button  — empty render
common-basebutton--icon-button  — empty render
icons-catalogicon--default  — empty render
icons-catalogicon--all-variants  — empty render
common-basebutton--docs  — docs failed
icons-catalogicon--docs  — docs failed
```

## Как пользоваться

1. Поиск компонента — `catalog.md`: иерархия, props, варианты, id.
2. Разметка — `rendered/<id>.html`.
3. Props и значения по умолчанию — `inventory.json` → `entries[].argTypes`.
4. Исходник story — `inventory.json` → `entries[].parameters.source`.
5. Описание из docs — `docs/<id>.txt`.
6. Стили компонента — `metadata/css-map.json`, затем `source/css/`.
