# PageHeader · Глобальная шапка

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `page-header` |
| **CSS** | `ui/modules.css`, `ui/layout.css` |
| **Живая реализация** | `showcase/components.html#r4-page-header` |
| **Источник** | Production header 1440/375; Figma — только evidence |

## Назначение

Глобальная навигация Career: верхняя панель экосистемы Хабра, основная строка
с навигацией и user/guest panel, а на узкой ширине — кнопка и раскрываемое меню.
Это shell module, не заголовок контентной секции.

## Анатомия

```text
header.page-header
  .tm-panel
  .page-header__bar
    button.page-header__menu-toggle
    logo
    nav.page-header__nav
    .page-header__user
```

## Состояния

- `closed`: menu trigger имеет `aria-expanded="false"`, menu — `data-state="closed"`.
- `open`: `aria-expanded="true"`; `aria-controls` указывает на видимое menu.
- Hover, focus-visible, pressed и disabled принадлежат вложенным Button/links.

## API

- `activeItem`: текущая ссылка через `aria-current="page"`.
- `user`: slot для AvatarButton/Menu или guest Button.
- `mobileMenuOpen`: управляет только раскрытием; desktop и mobile не являются states.
- `primaryNav`, `secondaryNav`: коллекции ссылок с устойчивыми id.

## Responsive

Один DOM и один набор ссылок. На `≤1023` nav становится раскрываемым блоком и
появляется доступная menu button; раскладка меняется только CSS.

## Доступность

- Header — `<header>`, каждая группа ссылок — именованный `<nav>`.
- Menu trigger — `<button>` с доступным именем, `aria-expanded` и `aria-controls`.
- Escape закрывает меню и возвращает фокус trigger; после перехода меню закрывается.
- Порядок Tab совпадает с визуальным; декоративные SVG имеют `aria-hidden="true"`.

## Источники

- [`evidence/README.md`](../../evidence/README.md): `responsive-header-1440/375`.
- [`ui/layout.css`](../../ui/layout.css): SH-1…SH-5 и R-1/R-8.
- [`RULES.md`](../../RULES.md): реальные границы responsive.
