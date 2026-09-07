# ArticleCard

| | |
|---|---|
| **Категория** | Контент |
| **Корневой класс** | `.article-snippet` (+ соседний `.tm-articles-list__item-footer`) |
| **CSS** | `ui/components/article-card.css` |
| **Production** | 9/16 страниц — самый переиспользуемый составной модуль выборки |
| **Критичность** | Без этого модуля некорректно воспроизводимы §2 (feed/listing), §3 (directory, частично) и §6 (profile/entity — фид сущности) Pattern Library — см. `evidence/pattern-taxonomy.md` |

## Назначение

Карточка статьи в ленте. Появляется на `feed`, `articles-all`, `news`,
`hub`, `company`, `user-posts`, `sandbox` — везде с одинаковой структурой.

## Анатомия (реальная разметка, `page-feed.html`)

```html
<div class="tm-articles-list__item" data-navigatable tabindex="0">
  <div class="article-snippet">
    <div class="publication-type-label publication-type-label_type-news">
      <span class="publication-type-label__label publication-type-label__label_type-news">Новость</span>
    </div>

    <div class="meta-container">
      <div class="meta">
        <span class="tm-user-info author">
          <a href="/ru/users/…/" class="tm-user-info__userpic">
            <img class="tm-entity-image__pic" src="…" width="24" height="24" alt="">
          </a>
          <span class="tm-user-info__user tm-user-info__user_appearance-default">
            <a href="/ru/users/…/" class="tm-user-info__username">svetlana_dolmatova</a>
            <a href="/ru/…/" class="tm-article-datetime-published tm-article-datetime-published_link">
              <time datetime="2026-09-03T13:03:04.000Z">1 минуту назад</time>
            </a>
          </span>
        </span>
      </div>
    </div>

    <h2 class="tm-title tm-title_h2">
      <a href="/ru/…/" class="tm-title__link" data-article-link="true"><span>Заголовок статьи</span></a>
    </h2>

    <div class="stats">
      <div class="tm-article-reading-time">
        <span class="tm-svg-icon__wrapper tm-article-reading-time__icon">
          <svg class="tm-svg-img" height="24" width="24"><title>Время на прочтение</title>
            <use xlink:href="ui/assets/icons/megazord.svg#clock"></use></svg>
        </span>
        <span class="tm-article-reading-time__label">1 мин</span>
      </div>
      <span class="tm-icon-counter tm-data-icons__item reach-counter">
        <svg class="tm-svg-img tm-icon-counter__icon" height="24" width="24"><title>Охват и читатели</title>
          <use xlink:href="ui/assets/icons/megazord.svg#counter-views"></use></svg>
        <span class="tm-icon-counter__value">0</span>
      </span>
    </div>

    <div class="tm-publication-hubs__container">
      <div class="tm-publication-hubs">
        <span class="tm-publication-hub__link-container">
          <a href="/ru/hubs/…/" class="tm-publication-hub__link">
            <span>Информационная безопасность</span>
            <span class="tm-article-snippet__profiled-hub" title="Профильный хаб"> * </span>
          </a>
        </span>
        <!-- ещё span.tm-publication-hub__link-container -->
      </div>
    </div>

    <div class="lead">
      <div class="cover object-fit-cover"><img class="lead-image" src="…"></div>
      <div class="article-formatted-body article-formatted-body_version-2">…</div>
    </div>
    <a href="/ru/…/" class="readmore"><span>Посмотреть программу</span></a>
  </div>

  <!-- footer — СОСЕД .article-snippet, не потомок -->
  <div class="tm-articles-list__item-footer">
    <div class="tm-data-icons tm-data-icons_space-big">
      <div class="tm-votes-meter tm-data-icons__item">
        <svg class="tm-svg-img tm-votes-meter__icon tm-votes-meter__icon_appearance-article" height="24" width="24">
          <title>Рейтинг</title><use xlink:href="ui/assets/icons/megazord.svg#counter-rating"></use></svg>
        <span class="tm-votes-meter__value tm-votes-meter__value_appearance-article tm-votes-meter__value_rating">0</span>
      </div>
      <button class="bookmarks-button tm-data-icons__item" type="button" title="Добавить в закладки">
        <span class="tm-svg-icon__wrapper icon">
          <svg class="tm-svg-img tm-svg-icon" height="24" width="24"><title>Добавить в закладки</title>
            <use xlink:href="ui/assets/icons/megazord.svg#counter-favorite"></use></svg>
        </span>
        <span class="counter" title="Количество пользователей, добавивших публикацию в закладки">0</span>
      </button>
    </div>
  </div>
</div>
```

**Обёртка иконки — не украшение.** У закладки иконка лежит в паре
`.tm-svg-icon__wrapper` + `.tm-svg-icon` (`display:inline-block` снаружи,
`display:block` внутри). Без неё `<svg>` остаётся строчным, ловит
базовую линию и уезжает от числа по вертикали — замерено, расхождение
1.7px. У счётчика комментариев обёртки нет и быть не должно: там класс
`.icon` висит **на самом `<svg>`**. Три соседних элемента одного ряда
размечены по-разному, и это не случайность — копировать как есть.

**Ключевая структурная деталь: footer с голосованием/закладками — не
потомок `.article-snippet`, а его сосед** внутри общей обёртки
`.tm-articles-list__item`. Переносить оба блока вместе, не пытаться
вложить footer внутрь карточки.

**Внешний `data-navigatable tabindex="0"`** на всей карточке — задействует
глобальное accessibility-правило `[data-navigatable]:focus{outline:1px
solid var(--accent-primary)}` из `ui/foundations.css`: карточка целиком
получает контур фокуса при табуляции.

## Варианты

| Класс | Эффект |
|---|---|
| `.article-snippet.no-border` | без рамки (в извлечённом CSS `border` у `.article-snippet` не задан вообще — модификатор, вероятно, снимает границу, добавляемую точечно другим правилом; не полностью прослежено — GAP) |
| `.publication-type-label_type-news` / `_type-post` / `_type-voice` | цвет ярлыка типа публикации (зелёный/красный/серый) |
| `.tm-user-info__user_appearance-post` | автор переносится в колонку на ≤767 |
| `.article-snippet.full-article .tm-title_h1` | **заголовок детальной страницы статьи — 32px/40px**, а не базовые 24px `.tm-title_h1`. Найдено Visual Foundations pass'ом: правило существовало в исходнике, но выпало при первой выборке "публичных" частей файла. Подтверждено `getComputedStyle` на живом `habr.com/ru/articles/…` |

## Reading time vs Reach — не путать

`.tm-article-reading-time` (иконка часов + «N мин») и `.tm-icon-counter`
с классом `reach-counter` (иконка глаза + число) — два **разных**
компонента с похожей геометрией (`icon + value`), не один параметризуемый.
`.tm-icon-counter` — примитив общего назначения (переиспользуется как
основа и для reach, и потенциально для других счётчиков); reading-time —
специфичный для статьи расчёт, свой класс.

## Responsive

* Список хабов публикации (`tm-publication-hubs`) на ≤767 становится
  горизонтально прокручиваемым (`overflow-x: auto`), с градиентной маской
  справа — тот же приём, что у `Tabs`;
* автор (`.author .tm-user-info__user`) на ≤767 становится колонкой
  (аватар+имя сверху, дата снизу) вместо строки.

## Ограничения

* **Исключены модерационные элементы управления** (`.controls`, `.confirm`,
  `.cancel`, `.moderation-comment-*`) — видны только автору/редактору
  черновика, page-bound к авторизованному контексту, не входят в публичную
  карточку. Если понадобится экран модерации — разбирать отдельно;
* `no-border` — назначение не до конца прослежено (GAP);
* Совместное использование `article-formatted-body` (тело статьи целиком,
  с форматированием, изображениями и т.д.) — не специфицируется отдельно,
  это контент, а не компонент.

## Источники

Production, разметка и все перечисленные CSS-файлы — `page-feed.html`
+ `article-snippet-B1AKowH-.css` + `article-datetime-published-mCvYLFVV.css`
+ `icon-counter-BmPpUBhH.css` + `bookmarks-button-CJSOFWtd.css`
+ `user-info-DEXNWEJ2.css` + `votes-meter-BFDy0ADQ.css`
+ `publication-type-label-gEJ3nUjm.css`.
