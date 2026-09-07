# EmptySection · Пустая контентная секция

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `empty-section` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-content-section` |

## Назначение

Пустое состояние, занимающее место ContentSection. Композирует
EmptyPlaceholder, illustration и существующие Button; не используется для
ошибки или первоначальной загрузки.

## Состояния

- `empty`: данных нет после успешного ответа или у нового пользователя.
- Hover/focus-visible/pressed принадлежат optional action.
- Error и loading не являются вариантами EmptySection.

## API

- `title` обязателен; `description`, `illustration`, `primaryAction`,
  `secondaryAction` опциональны.
- Illustration имеет пустой `alt`, если повторяет текст; информативное
  изображение получает осмысленный `alt`.

## Responsive

На `≤479` уменьшаются внутренние поля и минимальная высота; содержимое и порядок
чтения остаются теми же.

## Доступность

Обычное пустое состояние не получает `role="alert"`. Если оно появилось после
действия пользователя, объявление делает внешний live region. Заголовок входит
в иерархию страницы.

## Источники

- [`feedback/empty-placeholder.md`](../feedback/empty-placeholder.md).
- [`evidence/README.md`](../../evidence/README.md): `state-empty-block-1440`.

