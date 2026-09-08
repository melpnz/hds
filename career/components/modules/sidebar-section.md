# SidebarSection · Секция боковой колонки

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `sidebar-section` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-sidebar` |

## Назначение

Карточка внутри Sidebar с компактным заголовком `16/24·600`, body и optional
footer. Композирует базовый Section и существующие controls/collections.

## Анатомия

```text
section.base-section.sidebar-section
  h2.sidebar-section__title
  p.sidebar-section__description
  .sidebar-section__body
  .sidebar-section__footer
```

## Состояния

Собственных states нет. Disclosure использует Accordion, выбор — Checkbox/Row,
а pending/error — соответствующие feedback components.

## API

- `headingLevel`: уровень по outline страницы, независимо от компактного вида.
- slots: `title`, `description`, `default`, `footer`.
- Padding и background берутся из Section, не дублируются локальными props.

## Responsive

Компонент следует ширине Sidebar. Он не скрывается самостоятельно и не содержит
device-specific markup.

## Доступность

Используйте `<section aria-labelledby>` при наличии heading. Список ссылок или
фильтров получает собственную семантику (`nav`, `fieldset`) внутри body.

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-sidebar`](../../showcase/components.html#r4-sidebar).
Работает на пустой странице с одним `ui/career.css`.

```html
<section class="base-section base-section--background-white rounded-3xl sidebar-section" aria-labelledby="sidebar-company"><h3 class="sidebar-section__title" id="sidebar-company">О компании</h3><p class="sidebar-section__description">Продуктовая IT-компания</p><div class="sidebar-section__body"><p style="margin:0">Москва · 500–1000 сотрудников</p></div><div class="sidebar-section__footer"><a class="link-styled-button" href="#">Перейти в профиль</a></div></section>
```

## Источники

- [`evidence/README.md`](../../evidence/README.md): `module-sidebar-box-1440`.
- [`ui/layout.css`](../../ui/layout.css): C-6.

