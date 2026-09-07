# Pagination

| | |
|---|---|
| **Категория** | Навигация |
| **Корневой класс** | `.tm-pagination` |
| **CSS** | `ui/components/pagination.css` |
| **Storybook** | `Pagination/Pagination` (10 story), `Pagination/PaginationButton` (7 story) |
| **Production** | 11/16 страниц |
| **Figma** | habr-lib → `pagination` — page / page-arrow / responsive (desktop/tablet/mobile) |

## Назначение

Постраничная навигация списков. Составной компонент: `PaginationButton`
(prev/next) встроен внутрь `Pagination`.

## Анатомия

```html
<div class="tm-pagination">
  <a class="tm-pagination__navigation-link tm-pagination__navigation-link_active"
     data-pagination-direction="prev" href="/" rel="prev">
    <svg class="tm-svg-img tm-pagination__arrow tm-pagination__arrow_prev" height="16" width="16">
      <title>Назад</title>
      <use xlink:href="ui/assets/icons/megazord.svg#arrow-back"></use>
    </svg>
    <span class="tm-pagination__navigation-link-title">Сюда</span>
  </a>

  <div class="tm-pagination__pages">
    <div class="tm-pagination__page-group">
      <a class="tm-pagination__page" href="/">1</a>
      <a class="tm-pagination__page" href="/">2</a>
      <span class="tm-pagination__page tm-pagination__page_skip"> ... </span>
    </div>
    <span class="tm-pagination__page tm-pagination__page_current">7</span>
    <!-- ещё одна .page-group после текущей страницы -->
  </div>

  <a class="tm-pagination__navigation-link" data-pagination-direction="next" href="/" rel="next">
    <span class="tm-pagination__navigation-link-title">Туда</span>
    <svg class="tm-svg-img tm-pagination__arrow tm-pagination__arrow_next" height="16" width="16">
      <title>Вперёд</title>
      <use xlink:href="ui/assets/icons/megazord.svg#arrow-back"></use>
    </svg>
  </a>
</div>
```

Стрелка «вперёд» — та же иконка `arrow-back`, отражённая по горизонтали
классом `.tm-pagination__arrow_next{transform:scaleX(-1)}`, отдельного
символа `arrow-forward-inline` не заведено (хотя в спрайте есть отдельный
`arrow-forward` — не тот, что использован здесь; не подставлять его).

Список страниц группируется в `.tm-pagination__page-group` — куски,
разделённые многоточием `.tm-pagination__page_skip`, а не один плоский
список ссылок. Именно эта группировка даёт визуальные «прогалы» вокруг
текущей страницы.

**Наблюдение из снятой разметки:** атрибут `rel="prev"`/`rel="next"` присутствует
на кнопках направления — SEO-сигнал пагинации, стоит сохранять при переносе.

**Подписи — «Сюда» и «Туда», а не «Назад»/«Далее».** Снято с живой
`habr.com/ru/articles/page7/`; Figma даёт ровно те же два слова. В более
ранней редакции пакета стояли «Назад»/«Далее» — они были домыслены, а не
скопированы.

**Многоточие — три точки с пробелами**, ` ... `, а не символ `…`.

## Блочная модель: content-box, а не border-box

`.tm-pagination__page` и `.tm-pagination__arrow` — **`content-box`**, и от
этого зависит вся геометрия компонента:

* страница: `min-width: 24` (контент) + `padding: 0 4` → **32×32, квадрат**;
* стрелка: иконка 16 + `padding: 8` → **32×32**.

Под навязанным `border-box` те же элементы схлопываются до 24×32 и 16×16 —
выбранная страница перестаёт быть квадратной, а у иконки на контент не
остаётся ничего, и она выглядит пропавшей. Именно это и происходило в
витрине, пока там стоял глобальный `* { box-sizing: border-box }`.

На habr.com глобального сброса **нет**: замерено на живой странице —
**2702 элемента из 2847 (95%) — `content-box`**, `border-box` расставлен
точечно самими компонентами (145 элементов, в том числе сам
`.tm-pagination` и `button`). Это относится не только к пагинации: любая
витрина или интеграция, накатывающая `*{box-sizing:border-box}` поверх
`ui/habr.css`, показывает продукт в чужой блочной модели.

## Мёртвое правило: `fill` у стрелки

`.tm-pagination__arrow { fill: var(--icon-primary) }` в
`pagination-I5St5IpN.css` **не срабатывает никогда**. У него та же
специфичность (0,1,0), что у `.tm-svg-img { fill: currentColor }` из
`svg-img-r1n9vzM8.css`, а второй файл грузится позже — побеждает он.
Проверено не чтением CSS, а `CSS.getMatchedStylesForNode` на живой
странице: вычисленный `fill` стрелки равен `#548eaa`, то есть цвету
ссылки, а не `--icon-primary` (`#929ca5`).

Практическое следствие: стрелка окрашивается **цветом ссылки** —
акцентным у доступного направления и `--other-disabled-elements` у
недоступного. Это и требуется: цвет состояния наследуется сам собой.

В `ui/components/pagination.css` написано `fill: currentColor` явно.
Результат совпадает с продом и больше не зависит от порядка `@import`
(у нас `icon.css` импортируется **раньше** `pagination.css`, то есть
каскад перевёрнут относительно production — при дословном переносе
объявления стрелка становилась серой).

## Состояния

| Класс | Эффект |
|---|---|
| `.tm-pagination__page_current` | акцентный цвет + `box-shadow: inset 0 0 0 1px` (рамка без прироста размера) |
| `.tm-pagination__navigation-link_active` | доступная кнопка направления — акцентный цвет |
| без `_active` | недоступное направление — `--other-disabled-elements` |

## Responsive

`.tm-pagination__navigation-link-title` (текст «Сюда»/«Туда») скрыт
до 1024px — на телефоне и планшете остаются только иконки-стрелки.
Маскирующий градиент по краям списка страниц (`:first-child:after`/
`:last-child:before` у `.tm-pagination__navigation-link`) сигнализирует,
что список страниц можно прокручивать горизонтально при переполнении.

Figma даёт **три фрейма, но две формы**: `device=desktop` (480px) — стрелки
с подписями; `device=tablet` (320px) и `device=mobile` (320px) — **между собой
идентичны**, отличие от десктопа ровно одно: подписи скрыты, остаются
стрелки. То есть Figma и CSS описывают одно и то же переключение, просто
Figma не называет px-порог, а CSS называет — 1024.

Состав списка страниц в двух формах тоже отличается и совпал с production
дословно: desktop `1 2 … 5 6 [7] 8 9 … 49 50`, компактная форма
`1 … 6 [7] 8 … 23`.

## Сверка с Figma: что совпало и что разошлось

| Свойство | Production | Figma | Решение |
|---|---|---|---|
| размер страницы | 32×32 | `min-width` 32, высота 32 | **совпало** |
| цвет стрелки | цвет ссылки (`currentColor`) | `arrow/icon` `#548eaa` | **совпало** |
| цвет текста страницы | `--text-main` `#333` | `page/txt` `#333333` | **совпало** |
| цвет многоточия | `--text-secondary` | `page/txt_more` `#909090` | **совпало** |
| выбранная | рамка 1px акцентом | `border_pressed` `#548eaa` | **совпало** |
| подписи | «Сюда» / «Туда» | «Сюда» / «Туда» | **совпало** |
| радиус страницы | 3px | `radius` 4px | расхождение |
| начертание | 500 | `weight/regular` 400 | расхождение |
| интерлиньяж | 18px (`1.125rem`) | `line_height/body_l` 20px | расхождение |
| высота контейнера | 49px | 48px | расхождение |
| поля контейнера | `0 2px` | `padding_between` 6px | расхождение |
| размер иконки | 16 (+8 отступа = 32) | `iconsize/x1` 24 | расхождение |

Шесть расхождений **не усреднены и не применены**: в `ui/` остаются
production-значения, потому что весь пакет описывает то, что действительно
отрисовано на habr.com. Все шесть — на 1–2px либо на один шаг начертания,
визуально пагинация в обеих версиях выглядит одинаково.

## Ограничения

* ~~точка переключения desktop/tablet/mobile раскладки самой пагинации
  не подтверждена CSS~~ — снято: форм всего две, и переключение между ними
  описано медиазапросом `min-width: 1024` в самом `pagination.css`;
  Figma просто не называет порог в px;
* иконка «вперёд» — переиспользование `arrow-back` через `scaleX(-1)`,
  не отдельный символ; переносить именно так, не заменять на `arrow-forward`.

## Дефект доступности в production

У **обеих** стрелок на habr.com `<title>` одинаковый — «Назад», в том числе
у стрелки «вперёд» (проверено на `page7`: `<svg class="… __arrow_next">
<title>Назад</title>`). Скринридер объявляет обе ссылки направления
одинаково, различить их можно только по `rel`.

В витрине и в разметке выше у второй стрелки стоит «Вперёд» — **единственное
намеренное отступление от живой разметки в этом компоненте**. Отмечено
здесь, чтобы отступление не выглядело ошибкой переноса.

## Исправлено в Figma Parity Audit

**Градиент-маска строилась через `transparent`.** Ключевое слово означает
*прозрачный чёрный*: при интерполяции с белым середина градиента уходит
в серую муть. Production уводит альфу у того же цвета —
`hsl(from var(--background-primary) h s l / 0%)`. Возвращено дословно.
Это не придирка к синтаксису: разница видна на белом фоне.

**Потеряно сглаживание шрифта.** У `.tm-pagination__page` и
`.tm-pagination__navigation-link` в проде стоят
`-webkit-font-smoothing: antialiased` и `-moz-osx-font-smoothing: grayscale`;
вендорные префиксы были отброшены при извлечении, и текст рендерился
жирнее продового. Возвращены.

## Источники

* Storybook: `pagination-pagination--*` (10), `pagination-paginationbutton--*` (7)
* Production: `pagination-I5St5IpN.css`, `pagination-button-DjQECuh-.css`,
  разметка — `page-articles-all.html`
* Figma: `habr-lib`, canvas `pagination` (848:10431)
