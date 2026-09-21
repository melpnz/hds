# FeedbackForm

| | |
|---|---|
| **Категория** | Формы (`forms`) |
| **Корневой класс** | `crs-feedback-form` — введён пакетом |
| **CSS** | `ui/components/forms.css` |
| **Живая реализация** | [`viewer/index.html#feedback-form`](../../../viewer/index.html#feedback-form) |
| **Источник** | Figma `02_Education-NEW`, узел `I10123:48314;13496:153645` «обратная связь» |
| **Статус** | `complete` · нормативный Figma-контракт v0.2 |

## Когда использовать

Используйте для запроса контактов. Нормативны способы связи «Телеграм» и «Телефон», а также экран успешной отправки; все три состояния доступны в живом примере.

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

Живой пример дополнительно содержит переключение на поле «Телефон» и состояние `success` с локализованной иллюстрацией из Figma.

## Внешний вид

| что | значение |
|---|---|
| блок | рамка `#e9e9ea`, радиус 24, падинг 24; сетка в три колонки, промежуток 16 |
| текст слева | заголовок стилем `Header/H2` — 24 / 28, 600, −0.5; ниже 14 / 20, промежуток 24 |
| форма справа | две колонки: `ButtonGroup`, два поля 40 через 12, кнопка M main во всю ширину; промежутки 24 |
| поле | рамка `#e9e9ea`, радиус 12, падинг 8 / 12, иконка 24, плейсхолдер 16 / 22 `#909194` |
| согласие | 12 / 16 `#909194`, ссылки `#346ef4` |
| success на mobile | иллюстрация шире внутренней колонки и обрезается только внешним радиусом карточки, поэтому доходит до её левого, правого и нижнего края |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Решение v0.2

Используйте для запроса контактов. Нормативны способы связи «Телеграм» и «Телефон», а также экран успешной отправки; все три состояния доступны в живом примере.

Корень с префиксом `crs-` остаётся именем пакета, а отсутствие production-разметки явно сохраняется в provenance. Это не мешает использовать принятый Figma-контракт как нормативный.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `I10123:48314;13496:153645`
«обратная связь», а также узлы `13496:166340` («Телефон») и `13496:166748` (`success`), прочитанные `get_design_context` 21 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
