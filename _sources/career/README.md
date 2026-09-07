# CAREER Storybook — локальный snapshot

`https://develop.career.habratest.net/career-web/storybook-static/`

Снято 2 сентября 2026. Исследовательский корпус, не зеркало для запуска.

## Что это за Storybook

| | |
|---|---|
| Версия | 8.4.7 |
| Framework | @storybook-vue/nuxt (nuxt) |
| Renderer | @storybook/vue3 |
| Builder | @storybook/builder-vite |
| Формат индекса | index.json v5 |
| Сборка Storybook | 2026-08-29 |

## Полнота

| | |
|---|---|
| Inventory coverage | 427 / 427  (100%) |
| Stories с разметкой | 243 / 347  (70%) |
| Docs captured | 72 / 80  (90%) |
| Stories с props | 233 / 347  (67%) |
| Stories с исходником | 243 / 347  (70%) |
| Пустой рендер | undefined |
| CSS-файлов | 67 |
| Ассетов | 126 |

## Структура

```text
career/
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
| rendered | 649 KB |
| docs | 1368 KB |
| metadata | 4123 KB |
| source/css | 270 KB |
| source/assets | 3648 KB |
| **всего** | **11214 KB** |

## Особенности

* Nuxt-обёртка: нативный `extract()` **не работает** — падает на динамическом импорте. Метаданные собраны по одной story за раз из `__STORYBOOK_PREVIEW__.storyRenders[].story`; на полноте props это не сказалось.
* CSS разложен по компонентам: один файл на компонент с хешем в имени (`base-button.<hash>.css`). Это самый удобный из трёх Storybook для покомпонентного анализа стилей.
* **В самой сборке Storybook не хватает двух файлов.** 104 из 347 stories не рендерятся, потому что цепочка их модулей упирается в `-iqz-73v.js` и `-2YzXgxt.js` — оба отдают **404**. Проверено прямыми запросами: чанки-импортёры отдают 200 и содержат ссылку `"./-iqz-73v.js"`, сам файл отсутствует. Судя по тому, что оба имени начинаются с дефиса, при выкладке потерялись файлы, чьи имена начинаются с `-`. Это дефект сервера, а не снятия: ни один способ обхода тут не помогает. Затронуты целиком `Conversations/Messages`, `Conversations/Layout`, `Tests/Cards`, а также `ResumeCard`, `ButtonRange`, `PromotionCard`, `JournalBlockSidebar`.
* Те же два файла ломают и 8 docs-страниц — Storybook показывает на них «No Preview». Для таких страниц сохранён `.txt` с пояснением вместо содержимого.
* При длинной серии переключений stories через канал preview постепенно начинает отдавать пустой корень. Лечится перезагрузкой и пересозданием вкладки — во втором проходе так и сделано, поэтому «пустых» snapshot по техническим причинам не осталось.

## CSS с объявлениями переменных

| Файл | Объявлений | Размер |
|---|---:|---:|
| `index.CK-Too2S.css` | 304 | 104881 B |
| `preview.C4TNY2_K.css` | 132 | 88551 B |
| `base-button.CeGTylXy.css` | 21 | 10926 B |
| `base-chip.CrucBJhZ.css` | 15 | 2120 B |
| `base-avatar-button.C0pahq0v.css` | 11 | 2144 B |
| `base-icon-button.B5Hr0QoM.css` | 11 | 2287 B |
| `base-pagination-button.D5yqNAbx.css` | 11 | 2843 B |
| `base-modal.oVZoWAId.css` | 7 | 5341 B |

## Пропуски

```text
conversations-messages-conversationmessages--loading  — empty render
conversations-messages-conversationmessages--empty  — empty render
conversations-messages-conversationmessages--default  — empty render
conversations-messages-conversationmessages--unread  — empty render
conversations-messages-conversationmessages--load-more-pending  — empty render
conversations-messages-conversationmessages--refresh-pending  — empty render
conversations-layout-conversationslayout--full-layout-no-conversation  — empty render
conversations-layout-conversationslayout--full-layout-with-conversation  — empty render
conversations-layout-conversationslayout--full-layout-narrow-sidebar  — empty render
conversations-messages-messagesgroup--with-user-messages  — empty render
conversations-messages-messagesgroup--with-unread-label  — empty render
conversations-messages-messagesgroup--yesterday-group  — empty render
conversations-messages-messages--user-incoming  — empty render
conversations-messages-messages--user-outgoing  — empty render
conversations-messages-messages--changed-subject  — empty render
conversations-messages-messages--job-invite  — empty render
conversations-messages-messages--question-with-buttons  — empty render
conversations-messages-messages--question-answered  — empty render
conversations-messages-messages--consultation-confirmation-with-buttons  — empty render
conversations-messages-messages--consultation-confirmation-without-buttons  — empty render
conversations-messages-messages--consultation-confirmed  — empty render
conversations-messages-messages--consultation-rejected  — empty render
conversations-messages-messages--consultation-cancelled  — empty render
conversations-messages-messages--consultation-status-check-with-buttons  — empty render
conversations-messages-messages--consultation-status-check-without-buttons  — empty render
conversations-messages-messages--consultation-completed-with-rate-button  — empty render
conversations-messages-messages--consultation-completed-already-rated  — empty render
conversations-messages-messages--consultation-rated  — empty render
conversations-messages-messages--test-requested-with-buttons  — empty render
conversations-messages-messages--test-requested-without-buttons  — empty render
conversations-messages-messages--test-rejected  — empty render
conversations-messages-messages--test-passed  — empty render
conversations-messages-messages--test-hidden  — empty render
conversations-messages-messages--screening-recommendation  — empty render
conversations-messages-messages--current-date  — empty render
conversations-messages-messages--past-date  — empty render
conversations-messages-messages--unread-label  — empty render
form-buttonrange--recommendation  — empty render
form-buttonrange--empty-recommendation  — empty render
form-buttonrange--compact  — empty render
… ещё 72
```

## Как пользоваться

1. Поиск компонента — `catalog.md`: иерархия, props, варианты, id.
2. Разметка — `rendered/<id>.html`.
3. Props и значения по умолчанию — `inventory.json` → `entries[].argTypes`.
4. Исходник story — `inventory.json` → `entries[].parameters.source`.
5. Описание из docs — `docs/<id>.txt`.
6. Стили компонента — `metadata/css-map.json`, затем `source/css/`.
