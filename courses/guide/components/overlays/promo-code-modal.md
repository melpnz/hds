# PromoCodeModal

| | |
|---|---|
| **Категория** | Оверлеи (`overlays`) |
| **Корневой класс** | `crs-promo-code-modal` — введён пакетом |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | [`viewer/index.html#promo-code-modal`](../../../viewer/index.html#promo-code-modal) |
| **Источник** | Figma `02_Education-NEW`, узел `11061:82849` «modal — «Модалка промокода» 1024» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: модалка промокода — открытое состояние PromoCard: условие, срок, плашка кода с кнопкой, «Закрыть». Кнопка «Открыть код» в продукте есть (16 узлов на странице промокодов), сама модалка гидрируется и не снята. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R5-17 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;background:var(--fig-color-style-effect-overlay);padding:24px">
  <div class="crs-promo-code-modal" role="dialog" aria-label="Skillbox">
    <p class="crs-promo-code-modal__title">Skillbox</p>
    <div class="crs-promo-code-modal__body">
      <div class="crs-promo-code-modal__offer">
        <p class="crs-promo-code-modal__offer-title">Скидка 35% на курсы по дизайну</p>
        <p class="crs-promo-code-modal__offer-text">Введите промокод на сайте школы или назовите менеджеру при покупке</p>
      </div>
      <div class="crs-promo-code-modal__meta"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#datepicker"></use></svg><span>Действует до 30 октября 2025</span></div>
      <div class="crs-promo-code-modal__code">
        <p class="crs-promo-code-modal__code-value">PROMOCODE</p>
        <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-12 min-h-12 px-4 py-2 text-default border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white">Скопировать и перейти</button>
      </div>
    </div>
    <div class="crs-promo-code-modal__footer">
      <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300">Закрыть</button>
    </div>
  </div>
  <div class="crs-promo-code-modal" role="dialog" aria-label="Skillbox">
    <p class="crs-promo-code-modal__title">Skillbox</p>
    <div class="crs-promo-code-modal__body">
      <div class="crs-promo-code-modal__offer">
        <p class="crs-promo-code-modal__offer-title">Скидка 35% на курсы по дизайну</p>
        <p class="crs-promo-code-modal__offer-text">Введите промокод на сайте школы или назовите менеджеру при покупке</p>
      </div>
      <div class="crs-promo-code-modal__meta"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#datepicker"></use></svg><span>Действует до 30 октября 2025</span></div>
      <div class="crs-promo-code-modal__code">
        <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-12 min-h-12 px-4 py-2 text-default border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white">Перейти на сайт</button>
      </div>
    </div>
    <div class="crs-promo-code-modal__footer">
      <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none h-10 px-4 py-2 text-small border border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300">Закрыть</button>
    </div>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| модалка | 320, белая, радиус 24, не выше 800 |
| шапка | название школы стилем `Header/H3` — 20 / 24; падинг 24 со всех сторон |
| тело | падинг 0 / 24, промежуток 16: условие (16 / 22 600 и 14 / 20 через 4), строка срока с календарём 24 `#a6a7a9` |
| плашка кода | `#eff5ff`, радиус 12; код 20 / 24 600 `#346ef4` по центру, падинг 16; под ним кнопка L во всю ширину |
| подвал | падинг 24, кнопка M secondary «Закрыть» |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-promo-code-modal` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Тексты — дословно из узла: «Skillbox», «Скидка 35% на курсы по дизайну», условие, «Действует до 30 октября 2025», «PROMOCODE». Две модалки — два вида плашки кода (компонент `10991:111878`): «промокод» и «акция»; во второй кнопка «Перейти на сайт» и кода нет. Обёртка ряда с затемнением `color style/effect/overlay` — оформление витрины: в макете модалка лежит на таком же слое, без него белые края модалки не видны.
- **Ассеты.** Календарь — символ `datepicker` спрайта: `icon/calendar` макета — тот же глиф (контур `M19 11H5v8…`). Кнопки — продуктовый `Button`: M secondary снят как есть, а L main в снятой разметке не встречается (есть L secondary и XL main) — собран из матрицы Button, размер L и тон main. У макета L падинг 12 / 20, у продуктового L — 8 / 16 при той же высоте 48.
- **Состояния.** Нарисована открытая модалка (`open`). Закрытая (`closed`) — это кнопка «Открыть код» на `PromoCard`, в продукте она есть (16 на странице промокодов). Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `11061:82849`
«modal — «Модалка промокода» 1024», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._


## Уточнение v0.2 · вариант Modal

`PromoCodeModal` — доменный вариант базового [`Modal`](modal.md), а не отдельная модальная оболочка. Он наследует геометрию, responsive-поведение, прокрутку тела, закрепление header/footer и правила закрытия от `Modal`; собственными остаются только два сценария содержимого: ввод промокода и сообщение об акции. Путь и id сохранены для обратной совместимости.
