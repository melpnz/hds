# Radio

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `.tm-radio` (реальное имя, реконструирован стиль) |
| **CSS** | `ui/components/radio.css` |
| **Production** | имя класса реально используется (см. ниже), собственное объявление стиля не найдено |
| **Figma** | habr-lib → `checkbox/radiobutton` → control/Radiobutton |
| **Добавлен** | Figma Library Extraction pass |

## Особый статус: реальное имя, реконструированный стиль

`.tm-radio__option`/`.tm-radio__label` **реально встречаются** в разметке
`votes-lever-XAPVRp2k.css` (`.tm-minus-reason .tm-radio__option + .tm-radio__option`
и т.д. — см. `components/actions/votes.md` GAP) — значит класс существует
в продакшене. Но собственное объявление стиля `.tm-radio` не попало ни в
один из 111 извлечённых файлов — его чанк не был найден. Имя класса — не
выдумано; оформление ниже — реконструкция.

`get_variable_defs` подтвердил: Radio в Figma использует **те же
переменные**, что и Checkbox (`elements/checkbox/checked/bg=#548eaa`
и т.д. — буквально то же пространство имён), поэтому реконструкция
опирается на уже подтверждённые (через реальный `checkbox-CJ1LCFDi.css`)
токены `--accent-primary`/`--accent-primary-hover`/`--other-disabled-elements`,
не на сырые Figma-хексы.

## Анатомия

```html
<label class="tm-radio__option">
  <input class="tm-radio__input visually-hidden" type="radio" name="reason">
  <span class="tm-radio__indicator"></span>
  Текст варианта
</label>
```

Построен по образцу реального Checkbox — `<input>` + соседний indicator,
не `<div>`. Утилита `visually-hidden` определена в `ui/foundations.css`
и подключается общей точкой входа `ui/habr.css`; без неё рядом с
декоративным кругом будет виден нативный radio-control.

## Состояния

Figma matrix: Checked × Status=Inactive/Hover/Disable — **без** Focus и
Error (в отличие от Input/Button). Меньше состояний, чем у Checkbox —
не достраивать indeterminate или error, которых Figma не показывает.

| Состояние | Эффект |
|---|---|
| checked | точка-заливка `--accent-primary` в центре |
| hover (unchecked) | рамка синеет `--accent-primary` |
| hover (checked) | точка темнеет `--accent-primary-hover` |
| disabled | серая заливка `--other-disabled-elements` |

## Ограничения

Вся визуальная реализация — FIGMA-RECONSTRUCTED, не production-код.
Единственное реальное свидетельство — имя класса в разметке
`.tm-minus-reason` (попап причины минуса при голосовании).

## Источники

Production (только имя класса): `votes-lever-XAPVRp2k.css`.
Figma: `habr-lib`, canvas `checkbox / radiobutton` (848:10433), фрейм
`control / Radiobutton` (849:10441).
