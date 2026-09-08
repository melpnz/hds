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

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-page-footer`](../../showcase/components.html#r4-page-footer).
Работает на пустой странице с одним `ui/career.css`.

```html
<footer class="page-footer"><div class="page-width page-footer__inner">
  <nav class="page-footer__group" aria-labelledby="footer-career"><h3 class="page-footer__title" id="footer-career">Хабр Карьера</h3><ul class="page-footer__links"><li><a class="page-footer__link" href="#">О сервисе</a></li><li><a class="page-footer__link" href="#">Каталог вакансий</a></li><li><a class="page-footer__link" href="#">Карта сайта</a></li></ul></nav>
  <nav class="page-footer__group" aria-labelledby="footer-help"><h3 class="page-footer__title" id="footer-help">Помощь</h3><ul class="page-footer__links"><li><a class="page-footer__link" href="#">Для соискателя</a></li><li><a class="page-footer__link" href="#">Для работодателя</a></li><li><a class="page-footer__link" href="#">Поддержка</a></li></ul></nav>
  <nav class="page-footer__group" aria-labelledby="footer-social"><h3 class="page-footer__title" id="footer-social">Социальные сети</h3><div class="page-footer__social"><a class="page-footer__social-link" href="#" aria-label="Хабр Карьера в Telegram"><img class="svg-icon icon-image" width="24" height="24" aria-hidden="true" src="../../ui/assets/icons/single/social-v3.1/telegram.svg" alt=""></a><a class="page-footer__social-link" href="#" aria-label="Хабр Карьера во ВКонтакте"><img class="svg-icon icon-image" width="24" height="24" aria-hidden="true" src="../../ui/assets/icons/single/social-v3.1/vk.svg" alt=""></a></div></nav>
</div></footer>
```

## Источники

- [`ui/layout.css`](../../ui/layout.css): SH-6 / legacy `.app-footer`.
- [`evidence/README.md`](../../evidence/README.md): `state-404-1440`.

