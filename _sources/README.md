# Storybook Sources

Локальные исследовательские snapshot трёх Storybook Хабра. Снято 2 сентября 2026.

Слой **первоисточников**. Ничего не анализируется и не интерпретируется: задача — превратить
три внешних сайта в локальный searchable корпус, чтобы следующему проходу не пришлось
открывать каждую story заново.

> Этот пакет не связан с `career/` и остальными исследованиями и ничего в них не меняет.

---

## Сводка

| | Career | Habr | Courses |
|---|---|---|---|
| Storybook version | 8.4.7 | 10.3.5 | 8.4.7 |
| Framework | @storybook-vue/nuxt / nuxt | @storybook/vue3-vite | @storybook-vue/nuxt / nuxt |
| Builder | @storybook/builder-vite | @storybook/builder-vite | @storybook/builder-vite |
| Entries | 427 | 86 | 45 |
| Components (titles) | 100 | 13 | 18 |
| Stories | 347 | 73 | 27 |
| Docs | 80 | 13 | 18 |
| Rendered snapshots | 243 / 347 | 73 / 73 | 23 / 27 |
| Docs snapshots | 72 / 80 | 13 / 13 | 16 / 18 |
| Stories с props | 233 / 347 | 72 / 73 | 21 / 27 |
| Stories с исходником | 243 / 347 | 73 / 73 | 23 / 27 |
| Не рендерятся в Storybook | 104 | 0 | 4 |
| CSS resources | 67 | 19 | 13 |
| Assets (файлов) | 126 | 1 | 20 |
| SVG-спрайтов / символов в них | 6 / 240 | 1 / 138 | 2 / 31 |
| Инлайновых SVG извлечено | 7 | 0 | 1 |
| Structured index available | index.json v5 + project.json | index.json v5 + project.json | index.json v5 + project.json |
| Native extract() | нет | да (73) | нет |
| Объём на диске | 11214 KB | 2193 KB | 1398 KB |
| Offline completeness | 70% stories, 90% docs | 100% stories, 100% docs | 85% stories, 89% docs |

---

## Что доступно офлайн

| Задача | Где |
|---|---|
| Какие компоненты существуют | `<sb>/catalog.md` |
| Какие stories существуют | `<sb>/catalog.md`, `<sb>/inventory.json` |
| Поиск компонента по имени | grep по `catalog.md` или `inventory.md` |
| Props / controls / варианты значений | `inventory.json → entries[].argTypes` |
| Значения по умолчанию | `entries[].initialArgs` и `argTypes[].defaultValue` |
| Исходник story | `entries[].parameters.source` |
| Описание компонента | `docs/<id>.txt` |
| Отрендеренная разметка | `rendered/<id>.html` |
| CSS и переменные | `source/css/`, карта — `metadata/css-map.json` |
| Иконки и изображения | `source/assets/`, инлайновые SVG — в `rendered/` |
| Прямая ссылка на живую story | `entries[].url` |

## Чего офлайн нет

* Работающего Storybook: JS-бандлы не скачивались намеренно — они не несут исследовательской ценности и весят мегабайты.
* Интерактивности: состояния hover, focus и открытые dropdown не снимались, snapshot статический.
* Компонентов, которые не рендерятся без внешних данных, — их snapshot пустой (см. README каждого Storybook).

## Различия между тремя Storybook

| | Career | Habr | Courses |
|---|---|---|---|
| Стек | Nuxt + Vue 3 | Vue 3 + Vite | Nuxt + Vue 3 |
| `extract()` | не работает | **работает** | не работает |
| CSS | по файлу на компонент | общий + по компоненту | по файлу на компонент |
| Темы | нет | **light-v2 / dark-v2** | нет |
| Домен | продуктовый, 37 компонентов «Диалогов» | базовые блоки и кнопки | обучение |

---

## Как это снималось

1. Проверка эндпоинтов: `index.json`, `stories.json`, `project.json`, `metadata.json` на каждом хосте.
2. Сохранение оригинальных structured-ответов там, где они есть.
3. Один раз загружается `iframe.html`, дальше stories переключаются через канал Storybook
   (`channel.emit('setCurrentStory')`) — без перезагрузки страницы. Полная перезагрузка
   используется как подстраховка, если канал не дал результата.
4. После каждого рендера снимается `innerHTML` корня preview и метаданные story
   из `__STORYBOOK_PREVIEW__.storyRenders[].story`.
5. Docs-страницы снимаются полной навигацией в `viewMode=docs`.
6. CSS и ассеты скачиваются по накопленным за проход URL, включая `url()` внутри CSS.

> Общие бандлы хранятся один раз. Snapshot одной story — это только разметка компонента,
> типичный размер — сотни байт.
