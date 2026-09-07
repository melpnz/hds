# Button

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `.btn` |
| **CSS** | `ui/components/button.css` |
| **Storybook** | `Buttons/ButtonBase` (7 story), `Buttons/Button` (8 story) |
| **Production** | 15/16 просканированных страниц |
| **Figma** | habr-lib → `button` — 7 фреймов вариантов × 5 состояний |

## Назначение

Основное интерактивное действие продукта. Единственный класс формы (`.btn`)
и отдельный класс цвета (`.tm-button`) комбинируются в разметке — это два
независимых слоя, не один компонент с пропом.

## Анатомия

```html
<button class="btn btn_solid btn_small tm-button_color-christi" type="button">
  Текст
</button>
```

`<button>` или `<a>` — оба варианта встречаются в источнике без разницы
в классах (см. Разметку).

## Варианты

Два независимых измерения: **форма** (класс `.btn_*`) и **роль/цвет**
(класс `.tm-button_color-*`). Названия в CSS — по цвету, названия в Figma —
по роли; ниже сведены явно (см. `evidence/conflicts.md` → CFL-2).

| Роль (Figma) | Форма | Классы | Цвет |
|---|---|---|---|
| Primary | fill | `.btn_solid` | `--accent-primary` |
| Primary | line | `.btn_transparent` | `--accent-primary` |
| Success | fill | `.btn_solid.tm-button_color-christi` | `--accent-positive` |
| Success | line | `.btn_transparent.tm-button_color-christi` | `--accent-positive` |
| Danger | line | `.btn_transparent.tm-button_color-fuzzy-wuzzy-brown` | `--accent-danger` |
| Minor | line | `.btn_transparent.tm-button_color-desert-storm` | нейтральный серый |
| — | text | `.btn_text` / `.btn_text.tm-button_color-horizon` | без фона и рамки |

`.btn_solid` без цветового модификатора = Primary-fill. Danger и Minor
в извлечённом CSS существуют только в форме line — вариантов fill для них
не найдено (GAP, не выдумывать).

## Размеры

| Класс | Высота | Padding |
|---|---|---|
| `.btn_small` | 32px | `8px 14px` |
| `.btn_middle` | 36px | `10px 14px` |
| `.btn_large` | 40px | `12px 16px` |

## Состояния

| Класс/псевдокласс | Что меняется |
|---|---|
| `:hover` / `:focus` / `:active` | цвет становится hover-оттенком (`*-hover` токен) |
| `.btn_disabled` | серый фон/рамка `--other-disabled-elements`, `cursor: not-allowed` |
| `.btn_loading` | диагональная полоса-заливка, `animation: loader` (см. `ui/foundations.css`) |

**GAP — focus.** Figma-библиотека показывает отдельную стадию `focus` для
каждого варианта (в том числе `icon-button`), но в извлечённом CSS
`:focus` всегда объединён с `:hover`/`:active` — отдельного видимого контура
`:focus-visible` не найдено. Не подтверждено, есть ли в реальности разница
между hover и focus.

## Слоты

Один слот — текстовое содержимое. Иконка внутри кнопки не подтверждена
отдельным CSS-классом в извлечённом срезе (Figma показывает `icon-button`
отдельным компонентом, не модификатором `.btn`) — GAP.

## Поведение

`.btn_loading` не меняет размер кнопки и не отключает клики через CSS —
судя по `cursor: default`, блокировка клика ожидается на уровне разметки
(`disabled`/обработчик), не гарантируется одним классом.

## Responsive

Нет медиазапросов, размеры не зависят от вьюпорта.

## Доступность (наблюдаемое)

Оба реальных snapshot (`buttons-buttonbase--default`,
`buttons-buttonbase--as-link`) показывают `tabindex="0"`; `--as-link` вариант
добавляет `aria-disabled="false"` на `<a>`. Других ARIA-атрибутов не
наблюдалось.

## Разметка

```html
<!-- как кнопка -->
<button class="btn btn_solid btn_small" tabindex="0" type="button">Кнопка</button>

<!-- как ссылка, тот же набор классов формы/цвета -->
<a aria-disabled="false" class="btn btn_solid btn_small" tabindex="0" href="/">Ссылка</a>
```

## Соседний класс — TM-BUTTON-LINK

`.tm-button-link` — НЕ модификатор `.btn`, отдельный класс из
`my-feed-8t8yK4rG.css` (1/16 страниц). Своя геометрия (`min-height: 32px`,
`gap: 4px`), в извлечённом срезе — только цвет `christi` (успех). **GAP:**
ни один найденный модификатор не задаёт `color` на заливке — рендер-проверка
показала дефолтный синий цвет ссылки на зелёном фоне (`ui/components/button.css`,
комментарий GAP-2). Наблюдаемый дефект, не исправлен без дополнительного
evidence.

## Ограничения

* fill-вариантов Danger/Minor не подтверждено;
* иконка внутри кнопки не подтверждена CSS;
* `:focus` неотличим от `:hover`/`:active` в CSS, хотя Figma утверждает
  обратное;
* `.tm-button-link` — узкая, слабо покрытая ветка с наблюдаемым дефектом.

## Источники

* Storybook: `buttons-buttonbase--*` (7 stories), `buttons-button--*`
* CSS: `button-base-BdvEVC2k.css`, `button-Ccclp6vQ.css`,
  `my-feed-8t8yK4rG.css` (только `.tm-button-link`)
* Figma: `habr-lib` fileKey `XQ7dxSVvUt9mcx9ZZPqcxt`, canvas `button` (662:2177)
