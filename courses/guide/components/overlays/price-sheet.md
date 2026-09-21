# PriceSheet

| | |
|---|---|
| **Категория** | Оверлеи (`overlays`) |
| **Корневой класс** | `crs-price-sheet` — введён пакетом |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | [`viewer/index.html#price-sheet`](../../../viewer/index.html#price-sheet) |
| **Источник** | Figma `02_Education-NEW`, узел `9356:52508` «modal «Цена»» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: мобильная шторка быстрого фильтра по цене — поля «От / До», валюта, «Сбросить / Готово». Открытые оверлеи в продукте гидрируются JS и не сняты. Заведена 11 сентября 2026 решением владельца: компоненты макета, которых нет в продукте, входят в пакет как figma-only.

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R4-18 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-price-sheet">
  <div class="crs-price-sheet__panel" role="dialog" aria-label="Цена">
    <span class="crs-price-sheet__handle" aria-hidden="true"></span>
    <p class="crs-price-sheet__title">Цена</p>
    <div class="crs-price-sheet__body">
      <label class="crs-price-sheet__field crs-price-sheet__field--grow"><input class="crs-price-sheet__input" type="text" inputmode="numeric" placeholder="От" aria-label="Цена от"></label>
      <label class="crs-price-sheet__field crs-price-sheet__field--grow"><input class="crs-price-sheet__input" type="text" inputmode="numeric" placeholder="До" aria-label="Цена до"></label>
      <div class="crs-price-sheet__field crs-price-sheet__field--currency"><span class="crs-price-sheet__currency">₽</span><span class="crs-price-sheet__chevron"><svg class="svg-icon " width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></div>
    </div>
    <div class="crs-price-sheet__footer">
      <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300">Сбросить</button>
      <button type="button" class="inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white">Готово</button>
    </div>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| затемнение | `#0000004d`; полоска 64 × 4, белая, радиус 2 — литерал |
| панель | скругление 24 сверху — `elements/modal/border_radius` |
| заголовок | стилем `Header/H3` — 20 / 24, 600, −0.5; падинг 24 / 24 / 16 |
| поля | «От», «До» поровну и валюта 66; промежуток 8; высота 40, плейсхолдер 16 / 22 |
| подвал | падинг 16 / 24, промежуток 8, две кнопки M поровну: secondary и main |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-price-sheet` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Тексты — дословно из узла: «Цена», «От», «До», «₽», «Сбросить», «Готово». Валюта — выбор (`select_level3` со стрелкой), здесь показан закрытым.
- **Ассеты.** Стрелка валюты — символ `arrow-small` общего спрайта (глиф `icon/arrow-down` макета). Кнопки — продуктовый `Button` M: main и secondary, классы дословно из снятой разметки.
- **Состояния.** Нарисована открытая шторка (`open`). Закрытая (`closed`) — чип «Цена» в ряду быстрых фильтров; отдельной вёрстки у записи для него нет. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `9356:52508`
«modal «Цена»», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._


## Уточнение v0.2 · responsive presentation

На desktop и tablet компактная панель не показывает заголовок «Цена» и использует внутренний отступ 16 px со всех сторон. На mobile заголовок показывается, внутренние отступы панели составляют 24 px сверху и по бокам и 16 px снизу.

Bottom sheet применяется только в мобильном ряду быстрых фильтров. Эталонный контекст — экран 320×568 из Education Figma, общий canvas `9094:48333`; открытая панель — node `9356:52508` размером `320×176`. На tablet и desktop цена открывается как modal/popover рядом с trigger. Живой пример автоматически выбирает представление по ширине viewer: 320 и 480 показывают mobile, 768 и 1024 — tablet/desktop; отдельного внутреннего переключателя нет.

Viewer показывает полный цикл `trigger → open → close`: sheet закреплён снизу поверх overlay, закрывается по клику на затемнение и Escape, затем возвращает фокус в trigger. «Сбросить» очищает поля без закрытия, «Готово» применяет значение и закрывает панель.
