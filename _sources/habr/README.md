# HABR Storybook — локальный snapshot

`https://mr-7288-f.habr.habratest.net/storybook/`

Снято 2 сентября 2026. Исследовательский корпус, не зеркало для запуска.

## Что это за Storybook

| | |
|---|---|
| Версия | 10.3.5 |
| Framework | @storybook/vue3-vite |
| Renderer | @storybook/vue3 |
| Builder | @storybook/builder-vite |
| Формат индекса | index.json v5 |
| Сборка Storybook | 2026-09-02 |

## Полнота

| | |
|---|---|
| Inventory coverage | 86 / 86  (100%) |
| Stories с разметкой | 73 / 73  (100%) |
| Docs captured | 13 / 13  (100%) |
| Stories с props | 72 / 73  (99%) |
| Stories с исходником | 73 / 73  (100%) |
| Пустой рендер | undefined |
| CSS-файлов | 19 |
| Ассетов | 1 |

## Структура

```text
habr/
  README.md          этот файл
  inventory.json     машиночитаемый индекс: entries, props, пути к локальным файлам
  inventory.md       тот же индекс таблицей
  catalog.md         иерархический searchable каталог — основной вход для поиска
  index.html         исходная оболочка manager
  metadata/
    index.json       оригинальный ответ Storybook
    project.json     оригинальный ответ Storybook
    iframe.html      оригинальная оболочка preview
    extract.json     нативный extract(): args/argTypes/parameters всех stories
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
| rendered | 86 KB |
| docs | 429 KB |
| metadata | 1136 KB |
| source/css | 28 KB |
| source/assets | 104 KB |
| **всего** | **2193 KB** |

## Особенности

* Storybook 10 на `@storybook/vue3-vite`, без Nuxt. Нативный `extract()` **работает** — полные args/argTypes/parameters по всем stories сохранены в `metadata/extract.json`.
* Подключает боевые темы Хабра `/css/theme/light-v2.css` и `dark-v2.css` — по 43 объявления переменных в каждой. Это первоисточник токенов Хабра, а не сборка Storybook.
* Отдельных файлов иконок нет: SVG инлайнятся в разметку. Они присутствуют в `rendered/*.html`.

## CSS с объявлениями переменных

| Файл | Объявлений | Размер |
|---|---:|---:|
| `dark-v2.css` | 43 | 1827 B |
| `light-v2.css` | 43 | 1841 B |
| `BaseDialog-CrJ9tGzP.css` | 3 | 6574 B |

## Как пользоваться

1. Поиск компонента — `catalog.md`: иерархия, props, варианты, id.
2. Разметка — `rendered/<id>.html`.
3. Props и значения по умолчанию — `inventory.json` → `entries[].argTypes`.
4. Исходник story — `inventory.json` → `entries[].parameters.source`.
5. Описание из docs — `docs/<id>.txt`.
6. Стили компонента — `metadata/css-map.json`, затем `source/css/`.
