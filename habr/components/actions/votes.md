# Votes (VotesMeter / VotesLever / VoteHintPopup)

| | |
|---|---|
| **Категория** | Действия |
| **Классы** | `.tm-votes-meter`, `.tm-votes-lever`, `.vote-hint-popup` |
| **CSS** | `ui/components/votes.css` |
| **Production** | votes-meter 7/16, votes-lever 5/16 |
| **Добавлен** | Visual Foundations pass — по прямому запросу как визуально знаковый для Habr паттерн |

## Назначение

Голосование — один из самых узнаваемых визуальных паттернов Habr
(карма пользователя, рейтинг статьи, +/- под комментарием). Два
разных компонента, которые часто путают:

- **VotesMeter** — только отображение числа (в шапке профиля, под
  списком статей). Не интерактивен.
- **VotesLever** — интерактивный рычаг с кнопками ↑/↓ (на странице
  статьи/комментария у залогиненного пользователя).

## Анатомия

Разметка снята с живой страницы статьи и ленты, не собрана по классам.

```html
<!-- отображение: одна иконка counter-rating + значение -->
<div class="tm-votes-meter tm-data-icons__item">
  <svg class="tm-svg-img tm-votes-meter__icon tm-votes-meter__icon_appearance-article"
       height="24" width="24"><title>Всего голосов 69: ↑55 и ↓14</title>
    <use xlink:href="#counter-rating"></use></svg>
  <span class="tm-votes-meter__value tm-votes-meter__value_positive
               tm-votes-meter__value_appearance-article
               tm-votes-meter__value_rating">+55</span>
</div>

<!-- рычаг: две кнопки с ОДНИМ И ТЕМ ЖЕ глифом counter-vote -->
<div class="tm-votes-lever tm-votes-lever_appearance-article votes-switcher"
     title="Всего голосов 126: ↑126 и ↓0">
  <button class="tm-votes-lever__button" title="Нравится" type="button">
    <svg class="tm-svg-img tm-votes-lever__icon" height="24" width="24">
      <title>Нравится</title><use xlink:href="#counter-vote"></use></svg>
  </button>
  <div class="tm-votes-lever__score tm-votes-lever__score_appearance-article
              tm-votes-lever__score_no-margin">
    <span class="tm-votes-lever__score-counter
                 tm-votes-lever__score-counter_positive">+156</span>
  </div>
  <button class="tm-votes-lever__button" title="Не нравится" type="button">
    <svg class="tm-svg-img tm-votes-lever__icon tm-votes-lever__icon_arrow-down"
         height="24" width="24">
      <title>Не нравится</title><use xlink:href="#counter-vote"></use></svg>
  </button>
</div>
```

## Что легко сделать неправильно

| | Как на самом деле |
|---|---|
| Глиф стрелок рычага | **`counter-vote`, один и тот же на обе**; нижняя перевёрнута классом `_arrow-down` (`scaleY(-1)`). Не `arrow-down` и не две разные иконки |
| Глиф счётчика-отображения | **`counter-rating`**, другой глиф, не тот же, что у рычага |
| Размер | **24×24** обе, не 16 |
| Цвет стрелок до голосования | **`--icon-secondary`** обе. `_upvote`/`_downvote` (зелёный/красный) — состояние *после* голоса, не исходное |
| Цвет счётчика | знак значения: `--accent-positive` при плюсе, `--accent-danger` при минусе |

Где что стоит: **meter — в карточках ленты** (20 экземпляров на
`/ru/articles/`), **lever — на странице статьи** (2 экземпляра).
```

## Модификаторы appearance

Три конекста с разными отступами/размерами: `_appearance-article`,
`_appearance-comment`, `_appearance-karma` (крупнее — 1.0625–1.125rem,
используется в шапке профиля).

## Семантика цвета

`positive` → `--accent-positive`, `negative`/`downvote` →
`--accent-danger` — совпадает с семантикой статусов в остальной
системе (см. RULES.md, группа STATUS).

## VoteHintPopup

Попап при голосовании "против" — предложение указать причину.
Содержит `.tm-minus-reason` со списком radio/checkbox опций.

**GAP:** собственное объявление `.tm-radio` не найдено ни в одном из
111 извлечённых файлов — стили `.tm-radio__option`/`__label` внутри
`.tm-minus-reason` ссылаются на класс, чей чанк не попал в харвест. Имя
настоящее, оформление реконструировано в `ui/components/radio.css` по
Figma — см. `components/forms/radio.md`.

**GAP закрыт замером.** Раньше здесь стояло, что неизвестно, какая
кнопка несёт `_arrow-down`, и что production DOM недоступен без
авторизации. И то и другое неверно: рычаг виден гостю на странице
статьи. Замер показал, что `_arrow-down` стоит на **второй,
downvote-кнопке** (`title="Не нравится"`), а не на upvote — прежняя
догадка в витрине была ошибочной и исправлена.

## Источники

Production: `votes-meter-BFDy0ADQ.css`, `votes-lever-XAPVRp2k.css`;
разметка и вычисленные стили сняты с
`habr.com/ru/companies/selectel/articles/1076986/` и
`habr.com/ru/articles/`.
`vote-hint-popup-D6BJBETV.css` (Storybook) — байт-идентичный дубликат
votes-lever, не отдельный файл в продакшене.
