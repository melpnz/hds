# FeedbackForm

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `crs-feedback-form` — введён пакетом |
| **CSS** | `ui/components/forms.css` |
| **Живая реализация** | [`viewer/index.html#feedback-form`](../../../viewer/index.html#feedback-form) |
| **Источник** | Figma `02_Education-NEW`, узел `I10123:48314;13496:153645` «обратная связь» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: форма «Не нашли, что хотели?» — выбор способа связи, поля, кнопка и согласие. В снятой разметке продукта нет ни одного <form>; прежняя граница BRIEF §4 «форм ввода не будет» пересмотрена владельцем для макетных форм. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R4-16 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-feedback-form">
  <div class="crs-feedback-form__intro">
    <p class="crs-feedback-form__title">Не нашли, что хотели?</p>
    <p class="crs-feedback-form__text">Укажите свои контакты — мы с вами свяжемся, ответим на все вопросы и поможем подобрать обучение, чтобы вы были уверены в своем решении.</p>
  </div>
  <div class="crs-feedback-form__form">
    <div class="crs-button-group">
      <button type="button" class="crs-button-group__item crs-button-group__item--selected" aria-pressed="true">Телеграм</button>
      <button type="button" class="crs-button-group__item" aria-pressed="false">Телефон</button>
    </div>
    <div class="crs-feedback-form__fields">
      <label class="crs-feedback-form__field"><img src="../ui/assets/icons/contact-telegram.svg" alt=""><input class="crs-feedback-form__input" type="text" placeholder="Username" aria-label="Username в Телеграме"></label>
      <label class="crs-feedback-form__field"><img src="../ui/assets/icons/contact-mail.svg" alt=""><input class="crs-feedback-form__input" type="email" placeholder="Почта" aria-label="Почта"></label>
    </div>
    <div class="crs-feedback-form__submit">
      <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white">Отправить</button>
      <p class="crs-feedback-form__consent">Нажимая на кнопку, вы соглашаетесь с <a href="#c-feedback-form">Условиями использования</a> и <a href="#c-feedback-form">Политикой конфиденциальности</a></p>
    </div>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| блок | рамка `#e9e9ea`, радиус 24, падинг 24; сетка в три колонки, промежуток 16 |
| текст слева | заголовок стилем `Header/H2` — 24 / 28, 600, −0.5; ниже 14 / 20, промежуток 24 |
| форма справа | две колонки: `ButtonGroup`, два поля 40 через 12, кнопка M main во всю ширину; промежутки 24 |
| поле | рамка `#e9e9ea`, радиус 12, падинг 8 / 12, иконка 24, плейсхолдер 16 / 22 `#909194` |
| согласие | 12 / 16 `#909194`, ссылки `#346ef4` |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-feedback-form` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Все тексты — дословно из инстанса на детской витрине. Сегмент «Телеграм» выбран, поэтому поля — Username и Почта; что показывается при «Телефоне», в узле не нарисовано. Ссылки согласия ведут на якорь витрины — адресов документов в макете нет.
- **Ассеты.** Иконки полей — экспорты макета `ui/assets/icons/contact-telegram.svg` и `contact-mail.svg`: в спрайте продукта их нет. Цвет `#A6A7A9` зашит в экспорт.
- **Состояния.** Требуемые состояния записи (`default`) в макете отдельными вариантами не нарисованы, а измерить их негде. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `I10123:48314;13496:153645`
«обратная связь», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
