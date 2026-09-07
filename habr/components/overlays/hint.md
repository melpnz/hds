# Hint (три вида)

| | |
|---|---|
| **Категория** | Оверлеи |
| **CSS** | `ui/components/hint.css` |
| **Requires** | `ui/components/popover.css` (BaseHint использует `.base-popover` внутри) |
| **Production** | не найдены в 101 просканированном файле — монтируются по клику (`evidence/source-map.md`) |

Три отдельных компонента с разным назначением, объединены в один файл
CSS/спецификации, потому что каждый маленький и все — варианты одной идеи
«контекстная подсказка».

---

## BaseHint

| | |
|---|---|
| **Корневой класс** | `.base-hint` |
| **Storybook** | `Hints/BaseHint`, 5 story |

Подсказка со стрелкой-указателем на активатор. Самая декорированная из трёх:
двойная рамка (заливка фоном изнутри + акцентная обводка на 20% снаружи,
токен `--complexity-medium`) и `.arrow` на 4 стороны × 2 позиции (start/end)
+ центр по умолчанию — 12 положений всего, как у `placement` в BasePopover.

```html
<span class="activator-wrapper">
  <button type="button">Почему это важно?</button>
</span>
<!-- содержимое подсказки, появляется через BasePopover -->
<div class="base-popover base-hint">
  <div class="inner">Текст подсказки</div>
  <button class="close" type="button" aria-label="Закрыть">×</button>
  <span class="arrow arrow-top"></span>
</div>
```

**GAP на разметке:** снимок Storybook (`rendered/hints-basehint--default.html`)
показывает только состояние ДО открытия (`.activator-wrapper` + триггер) —
сама всплывающая панель телепортируется в DOM по клику и не попала
в статический snapshot. Markup внутренней панели восстановлен из структуры
классов CSS (`.inner`, `.close`, `.arrow-*`), а не скопирован из живого DOM —
это единственная спецификация в пакете, где разметка не copy-safe в строгом
смысле. Проверить при первом реальном использовании.

`.activator-wrapper{display:contents}` — обёртка не создаёт собственного
блока в layout, будто её нет вовсе.

---

## InformerHint

| | |
|---|---|
| **Корневой класс** | `.informer-hint` |
| **Storybook** | `Hints/InformerHint`, 4 story |
| **Figma** | habr-lib → **`informer`** (1292:45154) — 4 типа × 2 размера |

Крупный информер о новой возможности продукта — с заголовком, текстом
и кнопкой закрытия. Отдельно — точка-триггер (`.hint-trigger-button`)
с пульсирующей анимацией (`hot-point-pulsate`, 1s infinite), которая
привлекает внимание к месту, где стоит информер, ещё до открытия.

```html
<button class="hint-trigger-button" aria-label="Новая возможность"></button>
<div class="informer-hint" style="--informer-hint-width: 320px">
  <h3>Обновили меню</h3>
  <p>Теперь всё в одном месте.</p>
  <button class="close-informer-hint" type="button">
    <svg class="tm-svg-img" height="24" width="24"><title>Close</title>
      <use xlink:href="../ui/assets/icons/megazord.svg#close"></use></svg>
  </button>
</div>
```

Копи-безопасно: `rendered/hints-informerhint--default.html` содержит именно
эту структуру (`.informer-hint > h3 + p + .close-informer-hint > svg.tm-svg-img`).

**GAP — ширина.** `--informer-hint-width` — inline CSS var, задаётся
потребителем. Ни в одном найденном snapshot нет значения по умолчанию —
не подставлять число на глаз (см. комментарий в `ui/components/hint.css`).

### Типы и размеры — FIGMA-RECONSTRUCTED

В извлечённом CSS информер **один** — синий, без иконки и даты. Figma даёт
четыре типа и два размера; в `hint.css` добавлены модификаторы, помеченные
как реконструкция:

| Модификатор | Акцент | Токен |
|---|---|---|
| `_type-info` | синий | `--accent-primary` |
| `_type-success` | зелёный | `--accent-positive` |
| `_type-warning` | оранжевый | `--label-sorbus` |
| `_type-danger` | красный | `--accent-danger` |
| `_small` | — | без подложки, рамки и отступов, одна строка |

Механика цвета взята из production и не менялась: подложка — акцент с
альфой **12%**, рамка — он же с альфой **60%**. Чтобы типы могли
переопределять цвет, литерал вынесен в переменную
`--informer-accent`; её значение по умолчанию оставлено прежним, поэтому
информер без модификатора рендерится ровно как раньше.

Раскладка «иконка + заголовок + дата + крестик» (`__row`, `__icon`,
`__content`, `__date`) — тоже из Figma: в захваченной production-разметке
были только `h3`, `p` и кнопка закрытия. Иконки настоящие, из спрайта:
`user-notice-info` / `-success` / `-warning` / `-error`.

**Расхождение, не усреднено:** Figma красит `info` в `--accent-primary`,
а production-информер (без модификатора) — в `--label-dodger-blue`. Это
два разных синих. База оставлена как в production.

---

## RestrictionHint

| | |
|---|---|
| **Корневой класс** | `.restriction-hint` |
| **Storybook** | `Hints/RestrictionHint`, 4 story |

Самый простой вид: только текст в рамке `BasePopover`, без иконок и декора.
Название говорит о назначении — подсказка об ограничении доступа (например,
почему действие недоступно на текущем тарифе или без входа).

```html
<div class="base-popover restriction-hint">
  Доступно только авторизованным пользователям. <a href="/join">Войти</a>
</div>
```

## Responsive

Ни у одного из трёх видов не найдено медиазапросов.

## Доступность (наблюдаемое)

`.hint-trigger-button` и `.close`/`.close-informer-hint` — настоящие
`<button>`, не `<div>` с обработчиком клика (подтверждено рендером).
`:not(:focus-visible){outline:none}` встречается во всех трёх — то есть
видимый фокус **есть** по умолчанию и намеренно снимается только когда
фокус получен не с клавиатуры (`:focus-visible` логика, не общий `outline:none`).

## Ограничения

* внутренняя разметка BaseHint восстановлена из CSS, не скопирована
  из открытого состояния — единственный такой случай в пакете;
* ширина InformerHint не имеет подтверждённого дефолта;
* нет данных о времени показа/скрытия (`transition`/`animation` длительности
  открытия, кроме уже упомянутой пульсации триггера).

## Источники

* Storybook: `hints-basehint--*` (5), `hints-informerhint--*` (4),
  `hints-restrictionhint--*` (4)
* CSS: `base-hint-DHY34kLY.css`, `informer-hint-Bf4XvRzJ.css`,
  `restriction-hint-CHvNMITd.css` (все три — Storybook-only)

## Что убрано из витрины

`BaseHint` и `RestrictionHint` по решению владельца пакета сняты с
`showcase/components.html`. CSS и эта спецификация их сохраняют —
удалён только показ, не знание.
