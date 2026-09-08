# SectionHeader · Заголовок контентного блока

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `section-header` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-section-header` |

## Назначение

Единая композиция title, optional eyebrow/description и группы действий для
listing, detail и profile. Уровень заголовка задаёт контекст страницы, а не
визуальный размер.

## Варианты

- default — заголовок секции `20/24·600`.
- `section-header--page` — заголовок уровня страницы `28/32·600`.
- Наличие eyebrow, description и actions — slots, не boolean variants.

## Состояния

У SectionHeader собственных states нет. Loading/error/empty принадлежат секции,
а interaction states — вложенным Button/links.

## API

- `as`: `div` или `header` по структуре документа.
- `headingLevel`: `h1`–`h3`, обязателен и не выводится из visual variant.
- slots: `eyebrow`, `title`, `description`, `actions`.

## Responsive

На `≤479` actions переходят под текст и могут занять всю ширину. Markup и
порядок чтения не меняются.

## Доступность

В каждом экземпляре ровно один heading. Кнопки сохраняют видимые подписи или
доступные имена; action group не перехватывает keyboard navigation.

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-section-header`](../../showcase/components.html#r4-section-header).
Работает на пустой странице с одним `ui/career.css`.

```html
<header class="section-header"><div class="section-header__content"><p class="section-header__eyebrow">Вакансии компании</p><h3 class="section-header__title">Открытые позиции</h3><p class="section-header__description">12 вакансий для разработчиков и аналитиков</p></div><div class="section-header__actions"><button type="button" class="base-button inline-flex appearance-passive size-m is-sizeable"><span class="base-button__inner"><span class="base-button__content">Подписаться</span></span></button></div></header>
```

## Источники

- Production listing/detail/profile в [`showcase/pages.html`](../../showcase/pages.html).
- Типографика и ритм: [`composition.md`](../../docs/guide/composition.md).

