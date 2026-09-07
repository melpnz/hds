# Field (Input / Textarea)

| | |
|---|---|
| **Категория** | Формы |
| **Корневые классы** | `.tm-input-text-decorated` (реальный), `.tm-textarea-reconstructed` (реконструкция) |
| **CSS** | `ui/components/input.css`, `ui/components/textarea.css` |
| **Production** | Input — 5/16 (`/search/`, навигационный поиск) |
| **Figma** | habr-lib → `textfileds` → Input, Textarea |
| **Добавлен** | Figma Library Extraction pass |

## Почему один spec на два компонента

Figma и production показывают идентичную структуру для однострочного и
многострочного поля — Title (метка сверху слева) + Counter (счётчик
сверху справа) + сам field + Hint снизу. Одна anatomy, один набор
состояний — не дублировать в двух spec-файлах.

## Главная находка прохода

`.tm-input-text-decorated` — **реальный production-класс**
(`input-text-decorated-CFeKi8Lh.css`, отрисован на `/search/` и в поиске
шапки), но он был найден и зафиксирован ещё в `evidence/conflicts.md`
(CFL-1) на этапе Pattern Library — и ни разу не перенесён в `ui/`. Это
не Figma-реконструкция, это давно найденный, но не закрытый пробел.

`get_variable_defs` на Figma-узле Input подтвердил `elements/txtfield/
radius=4` — **дословное совпадение** с `border-radius:4px` в production
CSS. CFL-1 закрыт: было "визуально крупнее на глаз, не измерено" (LOW
confidence) → теперь MATCH (HIGH confidence, инструментально подтверждено).

## Анатомия

```html
<div class="tm-input-text-decorated tm-input-text-decorated_has-label-before">
  <label class="tm-input-text-decorated__label tm-input-text-decorated__label_before">Название</label>
  <input class="tm-input-text-decorated__input" type="text" placeholder="Введите значение">
</div>
<div class="error">Текст ошибки</div>
```

Textarea — та же обёртка, `<textarea class="tm-textarea-reconstructed">`
вместо `<input>`, без label-before/after (Figma не показывает иконочные
слоты у Textarea, только Title/Counter/Hint).

## Состояния

| Состояние | Источник | Эффект |
|---|---|---|
| inactive | production | рамка `--icon-secondary`, фон `--background-primary` |
| focus | production | рамка `--accent-primary` |
| disabled | production | фон `--header-text`, текст `--other-disabled-elements`, `cursor:not-allowed` |
| invalid | production | рамка `#e47979` (буквальный hex источника, не токен — не переименовывать) |
| hover | **Figma-only, GAP** | Figma показывает отдельное hover-состояние поля; в production CSS `.tm-input-text-decorated__input` `:hover`-селектора нет — не реализовано, не выдумано |

## Слоты меток (реальные, production)

`__label_before` (`left:0`) / `__label_after` (`right:0`) — оба
`position:absolute;top:0;line-height:2.5rem`, что на глаз даёт
Title-слева/Counter-справа, показанные в Figma. `_has-label-before`
добавляет `padding-left:44px` полю, `_has-label-after` —
`padding-right:40px`.

## Hint / Error — расхождение источников, не усреднено

Класс `.error` (см. `search-7QaR2PSY.css`) — **page-scoped**, реальный,
но не входит в переиспользуемую `tm-input-text-decorated` BEM-семью
(отдельный Vue-компонент страницы `/search/`). Не включён в общий
`ui/`-слой как переиспользуемый класс — риск коллизии с чужим `.error`
где угодно ещё. Показан в `showcase/components.html` инлайн-стилем.

**Конфликт с Figma (не усреднён):** production красит текст ошибки в
`--header-megapost-mona-lisa` (бледно-розовый); Figma-переменная
`elements/txtfield/hint_error=#d04e4e` почти точно совпадает с
`--accent-danger` (насыщенный красный, HSL(0,58%,56%) ≈ #cb5252). Ниже —
**PRODUCTION**, взято как canonical по правилу иерархии источников; Figma-
значение зафиксировано как отдельный факт (см. `evidence/conflicts.md`
CFL-5), не как исправление.

## Textarea — статус: FIGMA-RECONSTRUCTED

Нет НИ ОДНОГО production/Storybook свидетельства `<textarea>` в 111
извлечённых файлах — вероятно, существует только в редакторе статьи
(admin-only). `.tm-textarea-reconstructed` использует ту же геометрию и
токены, что реальный Input (обоснованно — тот же дизайн-язык, тот же
`radius:4` подтверждён инструментально), но САМ класс не существует в
продакшене. Не путать со SOURCE-CONFIRMED `.tm-input-text-decorated`.

## Ограничения

* hover-состояние поля — Figma-only, не в production CSS;
* Textarea целиком — реконструкция, не найдена в production;
* `.error` — реальный, но page-scoped класс, не часть общей BEM-семьи;
* select-подобное поле (Figma `textfileds` → `select`, `datepicker`,
  `timepicker`) — та же 10-состояний геометрия, что Input, но НЕ
  реализовано отдельно в этом проходе (нет production-свидетельства,
  ниже приоритет, чем text/textarea/checkbox/radio) — см.
  `evidence/figma-inventory.md`, статус FIGMA-ONLY, DEFERRED.

## Исправлено в Figma Parity Audit

У `.tm-input-text-decorated__label` было **два выдуманных объявления** —
`color: var(--text-secondary)` и `font-size: .875rem`. Ни того, ни другого
в проде нет: `CSS.getMatchedStylesForNode` на живой `/search/` показывает
у этого класса ровно три свойства — `line-height`, `position`, `top`.
Подпись наследует 16px и цвет родителя. Удалено.

**Отдельно про 36px.** Замер живого поля даёт высоту 36 и правый отступ 36,
хотя базовое правило говорит `min-height: 40px` и `padding-right: 40px`.
Расхождения нет: страница поиска накрывает базовый компонент собственным
правилом `.input[data-v-51b6d69a] .tm-input-text-decorated__input`. Базовый
слой у нас совпадает с продом дословно. **Замер конкретного экземпляра —
не то же самое, что замер компонента**; это стоит помнить при любой
проверке по живой странице.

**Textarea:** фон заблокированного поля переведён с `--header-text` на
`--background-secondary` (Figma `bg_disable` = `#f7f7f7`). У Input
`--header-text` — реальное production-значение и известный дефект
(токен белый в обеих темах, поэтому в тёмной теме заблокированное поле
светится), его оставили. Но Textarea в production не существует вовсе —
тащить чужой дефект в реконструкцию незачем.

## Коробку иконки компонент не задаёт

Место под иконку резервирует **само поле**, отступом:

| Модификатор | Отступ поля | Прижатие подписи |
|---|---|---|
| `_has-label-before` | `padding-left: 44px` | `left: 0` |
| `_has-label-after` | `padding-right: 40px` | `right: 0` |

А у самой `.tm-input-text-decorated__label` — только три объявления:
`line-height: 2.5rem`, `position: absolute`, `top: 0`. **Ни ширины, ни
выравнивания.** Иконка поэтому прижимается вплотную к рамке, а поле всё
равно держит отступ 44px — пустая полоса слева и глиф на границе.

На habr.com размер и центрирование даёт **класс страницы**, а не компонент:
`.icon` с Vue-скоупом `data-v-51b6d69a`. Замерено на `/search/`: подпись
там 32×36 при иконке 16px, то есть коробку строит потребитель.

**Практическое следствие:** перенося поле с иконкой, ширину подписи и размер
обёртки иконки нужно задать самому — из компонента они не придут. В витрине
это сделано инлайном намеренно, чтобы было видно, что значения не
компонентные.

Структура подписи в production:

```html
<div class="tm-input-text-decorated tm-input-text-decorated_has-label-before">
  <input class="tm-input-text-decorated__input" placeholder="Поиск">
  <div class="tm-input-text-decorated__label tm-input-text-decorated__label_before">
    <span class="tm-svg-icon__wrapper icon">
      <svg class="tm-svg-img tm-svg-icon" height="16" width="16"><title>Поиск</title>
        <use xlink:href="ui/assets/icons/megazord.svg#search"></use></svg>
    </span>
  </div>
</div>
```

Подпись идёт **после** поля, а не до. Внутри — `.tm-svg-icon__wrapper`
и `svg.tm-svg-icon`: те самые классы, которые в `assets/README.md` числились
GAP’ом «существует в CSS, но в разметке не встречается». Встречается — здесь.

**Про иконку: в production здесь стоит `input-search`, у нас — `search`.**
Это один и тот же рисунок, пиксельно идентичный (Δ 0). Продукт держал два
имени для одной картинки и в поле ввода ставил `input-search`; в нашем
наборе второе имя удалено как дубль — решение владельца пакета, разбор
в `evidence/icon-dupes.json`.

**Практическое следствие:** копируя разметку поля прямо с habr.com, ссылку
`#input-search` нужно заменить на `#search` — иначе символ не резолвится.

## Источники

* Production: `input-text-decorated-CFeKi8Lh.css`,
  `navigation-search-BPZh-5Ba.css`, `search-7QaR2PSY.css`
* Figma: `habr-lib`, canvas `textfileds` (806:8085), фреймы `Input`
  (778:6858), `Textarea` (781:1868)
