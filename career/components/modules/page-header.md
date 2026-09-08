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

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-page-header`](../../showcase/components.html#r4-page-header).
Работает на пустой странице с одним `ui/career.css`.

```html
<header class="page-header">
  <div class="tm-panel"><div class="page-width tm-panel__inner"><a class="tm-panel__logo" href="#"><b>Хабр</b> Карьера</a><span class="tm-panel__divider" aria-hidden="true"></span><span class="tm-panel__promo">Работа для IT-специалистов</span></div></div>
  <div class="page-header__bar"><div class="page-width page-header__inner">
    <button class="page-header__menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="r4-mobile-menu" data-page-header-toggle><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <a class="page-header__logo" href="#"><b>Хабр</b> Карьера</a>
    <nav class="page-header__nav" id="r4-mobile-menu" data-state="closed" aria-label="Основная навигация"><a class="page-header__link" aria-current="page" href="#">Вакансии</a><a class="page-header__link" href="#">Специалисты</a><a class="page-header__link" href="#">Компании</a><a class="page-header__link" href="#">Зарплаты</a></nav>
    <div class="page-header__user"><button type="button" class="base-button inline-flex appearance-main size-m is-sizeable"><span class="base-button__inner"><span class="base-button__content">Войти</span></span></button></div>
  </div></div>
</header>
```

## Источники

- [`evidence/README.md`](../../evidence/README.md): `responsive-header-1440/375`.
- [`ui/layout.css`](../../ui/layout.css): SH-1…SH-5 и R-1/R-8.
- [`composition.md`](../../docs/guide/composition.md): реальные границы responsive.
