# PageFooter · Глобальный подвал

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `page-footer` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-page-footer` |

## Назначение

Глобальный подвал с группами продуктовых ссылок и отдельной группой социальных
ссылок. `PageFooter` завершает shell, но не владеет содержимым страницы.

## Анатомия

```text
footer.page-footer
  .page-width.page-footer__inner
    nav.page-footer__group × N
    nav.page-footer__group.page-footer__social
```

## Состояния

У контейнера нет собственных states. Hover, focus-visible и pressed реализуют
семантические `<a>`; текущая страница в footer не отмечается.

## API

- `groups`: группы `{ title, links[] }`.
- `socialLinks`: ссылки с доступными именами и SocialIcon.
- Состав и URL приходят из продукта; компонент не хардкодит маршруты.

## Responsive

На desktop группы распределяются по ширине; на `≤1023` складываются в одну
колонку. Это layout rule, не variant `mobile`.

## Доступность

Используется `<footer>`. Каждая группа ссылок получает `nav aria-labelledby`;
иконка без текста получает `aria-label` на ссылке. Внешние ссылки явно сообщают
новое окно, если используется `target="_blank"`.

## Источники

- [`ui/layout.css`](../../ui/layout.css): SH-6 / legacy `.app-footer`.
- [`evidence/README.md`](../../evidence/README.md): `state-404-1440`.

