# MobileMenu

| | |
|---|---|
| **Категория** | Оверлеи (`overlays`) |
| **Корневой класс** | `crs-mobile-menu` — введён пакетом |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | [`showcase/components.html#c-mobile-menu`](../../showcase/components.html#c-mobile-menu) |
| **Источник** | Figma `02_Education-NEW`, узел `9084:14961` «Меню — кадр 320 «Первый экран»» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: полноэкранное меню мобильной шапки — «Все курсы», «Школы и Вузы», «Все сервисы Хабра». В продукте мобильная шапка устроена иначе (снимок courses-listing на 320): бургера и такого меню нет. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R4-22 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-mobile-menu">
  <div class="crs-mobile-menu__header">
    <p class="crs-mobile-menu__title">Меню</p>
    <button type="button" class="crs-mobile-menu__icon-button" aria-label="Закрыть меню"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#menu-close"></use></svg></button>
  </div>
  <div class="crs-mobile-menu__group">
    <div class="crs-mobile-menu__group-head">
      <p class="crs-mobile-menu__group-title">Все курсы</p>
      <button type="button" class="crs-mobile-menu__icon-button" aria-expanded="true" aria-label="Свернуть"><svg class="svg-icon" width="24" height="24" style="transform:rotate(180deg);width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
    </div>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Популярные курсы</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Программирование и IT</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Аналитика и Data Science</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Дизайн и контент</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Маркетинг и продажи</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Финансы и бухгалтерия</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item crs-mobile-menu__item--more">Посмотреть все</a>
  </div>
  <div class="crs-mobile-menu__group">
    <div class="crs-mobile-menu__group-head">
      <p class="crs-mobile-menu__group-title">Школы и Вузы</p>
      <button type="button" class="crs-mobile-menu__icon-button" aria-expanded="true" aria-label="Свернуть"><svg class="svg-icon" width="24" height="24" style="transform:rotate(180deg);width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
    </div>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Все школы и вузы</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Рейтинг школ и вузов</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Отзывы о курсах и программах</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item">Промокоды и акции 2026</a>
  </div>
  <div class="crs-mobile-menu__group">
    <div class="crs-mobile-menu__group-head">
      <p class="crs-mobile-menu__group-title">Все сервисы Хабра</p>
    </div>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#629FBC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span>Хабр</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#434B60;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span>Q&amp;A</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#6274BC;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span>Карьера</a>
    <a href="#c-mobile-menu" class="crs-mobile-menu__item"><span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:#346EF4;"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg></span>Курсы</a>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| шапка | «Меню» стилем `Header/H3`, крестик 24 `#a6a7a9`; падинг 20 / 24, линия `#e9e9ea` снизу |
| группа | падинг 8 сверху и снизу, разделитель `#e9e9ea`; заголовок 16 / 22 600, строка 40 |
| пункт | 14 / 20, падинг 10 / 24; при наведении `#f1f1f1` — живое |
| «Посмотреть все» | `#346ef4` — `color style/primary/primary` |
| сервисы | продуктовый `ProjectIcon` 24 и подпись через 12 |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-mobile-menu` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Все пункты — дословно из кадра. В группе «Все сервисы Хабра» — те же четыре проекта и в том же порядке, что у продуктового `ProjectIcon` (Хабр, Q&amp;A, Карьера, Курсы), цвета подложек совпали с продуктом.
- **Ассеты.** Крестик — символ `menu-close` спрайта (глиф `icon/menu open=yes` макета, контур совпал точка в точку), шевроны — `arrow-small`, иконки сервисов — продуктовая разметка `ProjectIcon`. Своих ассетов у записи нет.
- **Состояния.** Нарисовано открытое меню (`open`) с обеими раскрываемыми группами развёрнутыми. Закрытое (`closed`) — кнопка меню в мобильной шапке; в продукте её нет — мобильная шапка устроена иначе. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `9084:14961`
«Меню — кадр 320 «Первый экран»», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
