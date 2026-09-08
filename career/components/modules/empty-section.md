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

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-content-section`](../../showcase/components.html#r4-content-section).
Работает на пустой странице с одним `ui/career.css`.

```html
<section class="base-section base-section--background-white rounded-3xl empty-section" aria-labelledby="empty-saved-title"><div><img class="empty-section__illustration" src="../../ui/assets/illustrations/no-content.svg" alt=""><h3 class="empty-section__title" id="empty-saved-title">Нет сохранённых вакансий</h3><p class="empty-section__description">Добавляйте интересные вакансии в избранное, чтобы вернуться к ним позже.</p><div class="empty-section__actions"><a class="base-button inline-flex appearance-main size-m is-sizeable" href="#"><span class="base-button__inner"><span class="base-button__content">Найти вакансии</span></span></a></div></div></section>
```

## Источники

- [`feedback/empty-placeholder.md`](../feedback/empty-placeholder.md).
- [`evidence/README.md`](../../evidence/README.md): `state-empty-block-1440`.

