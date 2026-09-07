# Chip / Article labels

| | |
|---|---|
| **Категория** | Формы / выбор |
| **Классы** | `.tm-chip` (FIGMA-RECONSTRUCTED), `.publication-label` (PRODUCTION), `.article-label` (FIGMA-TARGET) |
| **CSS** | `ui/components/chip.css` |
| **Figma** | habr-lib → `article-labels / v3`: hub `4591:5141`, tag `4591:5242`, formats `4573:8084` |

В файле три компонента с разным статусом. Это не варианты одного —
у чипа и у плашки формата разная типографика, разные поля и разный
источник.

## 1. `.tm-chip` — чип хаба и тега · FIGMA-RECONSTRUCTED

Production-класса нет: ни одного класса с «chip» в имени ни в одном из
111 извлечённых файлов. Реальный usage — выбор хабов и тегов при
публикации, он живёт в редакторе статьи, недоступном гостевому краулу
(`RULES.md` §9). Имя `.tm-chip` наше.

### Геометрия — из `get_design_context`, не на глаз

| Токен Figma | Значение |
|---|---|
| `elements/chips/radius` | 8 |
| `elements/chips/padding_top` / `_bottom` | 4 |
| `elements/chips/padding_left` / `_right` | 12 |
| `elements/chips/padding_left_icon` / `_right_icon` | 4 |
| `elements/chips/padding_txt_ver` | 2 |
| `iconsize/x1` | 24 |
| `interface/text 14` | 14/18 w400 |

Высота ровно 30 = 4 + 2 + 18 + 2 + 4. Поля зависят от состава: со
стороны иконки 4, со стороны аватара 3, иначе 12. В CSS это делают
`:has()`, разметке ничего знать не нужно.

### Один цвет в трёх ролях

Текст — цвет как есть, заливка — он же с альфой **12%**, рамка пустого
чипа — он же с альфой **40%**. В Figma это один слой `fill` с
`opacity: 12%`, то есть устройство компонента, а не совпадение.

| Модификатор | Токен | Figma hex |
|---|---|---|
| `.tm-chip_tag` | `--text-secondary` | `common/icon_txt_bg` #909090 |
| `.tm-chip_hub` | `--accent-primary` | `tag/icon_txt_bg` #548eaa |
| `.tm-chip_subscribed` | `--accent-positive` | `hub/txt_subscribe` #7aa600 |
| `.tm-chip_error` | `--accent-danger` | `txt_bg_error` #d04e4e |
| `.tm-chip_empty` | `--icon-primary` | `empty/icon_txt_border` #929ca5 |

### Анатомия

```html
<!-- пустой: плюс слева, поля 4 / 12 -->
<button class="tm-chip tm-chip_empty" type="button">
  <svg class="tm-chip__icon"><use xlink:href="#plus-small"></use></svg>
  <span class="tm-chip__text">Тег</span>
</button>

<!-- заполненный тег: крестик справа, поля 12 / 4 -->
<span class="tm-chip tm-chip_tag">
  <span class="tm-chip__text">Tag name</span>
  <svg class="tm-chip__icon"><use xlink:href="#close-small"></use></svg>
</span>

<!-- хаб: аватар 24×24 радиус 6, поля 3 / 4 -->
<span class="tm-chip tm-chip_hub">
  <span class="tm-chip__body">
    <img class="tm-chip__avatar" src="…" alt="">
    <span class="tm-chip__text">Hub name</span>
  </span>
  <svg class="tm-chip__icon"><use xlink:href="#close-small"></use></svg>
</span>
```

Только для чтения (`editor=no`) — тот же чип без иконки справа, поля
возвращаются к 12.

### Ограничения

Combobox-поведение (ввод текста → выпадающий список тегов, «Выберите от
1 до 10 тегов») не реализовано — только визуальный чип.

## 2. Плашки публикации — одна геометрия на две роли

`.article-label` и `.publication-label` рисуются одинаково и различаются
только цветом:

| Класс | Роль | Цвет |
|---|---|---|
| `.article-label` | **формат** публикации | кодирует формат, см. таблицу ниже |
| `.publication-label` | **статус** публикации (Из песочницы, Recovery Mode) | всегда `--label-deluge` |

Геометрия — из `article-labels / v3`:

| Токен Figma | Значение |
|---|---|
| `elements/article_labels/new/radius` | 8 |
| `.../padding_top` / `_bottom` | 6 |
| `.../padding_left` / `_right` | 12 |
| `.../padding_right_with_icon` | 4 |
| `interface/text 12 (bold) CAPS` | 12/14 w700 uppercase |

Заливка — тот же цвет с альфой 12%, как у `.tm-chip`.

### `.publication-label` в production выглядит иначе

Приведение к общему виду v3 — **решение по дизайну, а не замер**.
Отгружаемое сегодня оформление сохранено здесь дословно, чтобы факт не
потерялся. Замерено на `/ru/articles/` и `/ru/feed/` через
`CSS.getMatchedStylesForNode`; файл `publication-label-D1N8NdVO.css`,
8/16 страниц, в проде заскоуплен `data-v-db35b1ec`.

```css
/* production, НЕ то, что в пакете */
.publication-label {
  color: var(--label-deluge);
  border: 1px solid hsl(from var(--label-deluge) h s l / 40%);
  border-radius: 4px;
  margin: 8px 8px 0 0;
  padding: 0 8px;
  display: inline-block;
}
```

Контурная плашка без заливки и без uppercase; кегль не задаётся —
наследуется от карточки (16 в ленте, 14 в статье). Класс варианта
(`variant-analytics`, `variant-review`, `variant-tutorial`,
`variant-case`, `variant-sandbox`, `variant-opinion`, `variant-recovery`)
в разметке есть, но собственных объявлений цвета в загруженном CSS у
него нет — все семь рисуются одинаково.

### Цвета форматов — `.article-label`

| Класс | Токен | Форматы |
|---|---|---|
| `.article-label_none` | `--icon-primary` | Без формата |
| `.article-label_orange` | `--label-sorbus` | Роадмэп, FAQ, Туториал |
| `.article-label_blue` | `--label-dodger-blue` | Мнение, Дайджест, Кейс, Обзор |
| `.article-label_green` | `--label-apple` | Репортаж, Интервью |
| `.article-label_magenta` | `--label-mulberry` | Ретроспектива, Аналитика |

Два варианта Figma намеренно не перенесены: со стрелкой и списком
форматов (`4573:8118`, `editor=yes, dropdown=yes`) — это интерфейс
редактора статьи; и текст без плашки (`editor=no`).

## Источники

Figma `habr-lib`, canvas `chips`: `article-labels / v3 / hub`
(4591:5141), `/ tag` (4591:5242), `/ formats` (4573:8084, вариант с
дропдауном 4573:8118). Production: замер `.publication-label` на
habr.com.
