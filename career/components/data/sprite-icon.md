# Icon · Отдельная иконка

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | `icon-inline` · `icon-image` |
| **CSS** | `ui/components/primitives.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Нормативный способ вывода иконок в UI kit — отдельный SVG-файл из
`ui/assets/icons/single/`. Монохромные symbols выводятся как inline SVG из
точного экспортированного файла и сохраняют `currentColor`; цветные
social/reactions — через `icon-image`.
`SpriteIcon` и внешний `<use>` остаются legacy evidence исходного Career.

Набор `single/sprite/` нормализован: у каждого значения интерфейса один значок,
14 дубликатов по смыслу убраны. Таблица «Иконки» ниже перечисляет символы
исходного `sprite.svg` — он не менялся, и убранные символы в нём на месте.
Соответствие «убрано → осталось» и разбор четырёх исправленных начертаний —
в [`ui/assets/README.md`](../../ui/assets/README.md).

## Анатомия

```
svg.svg-icon.icon-inline  [viewBox из `…/single/sprite/arrow.svg`]
img.svg-icon.icon-image  [src="…/single/social-v3.1/telegram.svg"]
```

_Разметка story `icons-spriteicon--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `name` | IconName | — | имя файла в выбранном наборе | `select` |
| `set` | IconSet | `'sprite'` | sprite · social-v3.1 · reactions · contacts · services | `select` |
| `size` | string\|number | `24` | — | `number` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |

## Исходные символы

Таблица ниже фиксирует provenance исходных sprite symbols. Runtime-путь для
каждой строки: `ui/assets/icons/single/<set>/<name>.svg`.

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#accreditation` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#additional-menu` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-back` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-big` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-bold` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-down` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-down-small` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-forward` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-left-rounded` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#arrow-right` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#banner` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#bar-arrow` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#bell` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#blue-loader` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#bookmark` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#bookmark-filled` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#booster` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#button-loader` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cert` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cert-blank` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#check` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#check-approved` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#check-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#check-circle-empty` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#close` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#copy` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cross-large` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cross-old` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#cross-separator` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#crossed-eye` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#danger` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#datepicker` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#decorated-modal-error` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#decorated-modal-loading` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#decorated-modal-success` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#decorated-modal-warning` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#direction` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#dots` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#down` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#download` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#edit_new` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#emoji-add` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#empty-star` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#expert-icon` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#eye` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#favorite` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#filter` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#gear` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#globe` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#habr-icon` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#hh` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#home` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#info` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#invite` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#location` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#location-legacy` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#mail` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#message` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#mobile-menu` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#more` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#ny-bell` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#pen` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#person` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#phone` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#place-mark` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#plus` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#postpone-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#question-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#readBy` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#recover` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#reviews` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#search` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#selection` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#settings` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#share` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#sharp-star` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#single-check` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#sort` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#spinner` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#star` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#star-small` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#trash` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#up` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#update` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#user` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:1023px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Размер задаётся атрибутами `width`/`height` и дублируется инлайновым стилем — класса размера нет.
- Цвет наследуется через `fill: currentColor`, поэтому иконку красят цветом текста родителя.

## Разметка

```html
<svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
  <use xlink:href="../../ui/assets/icons/sprite.svg#arrow"/>
</svg>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.svg-icon { fill:currentColor }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/icons/sprite-icon.stories.ts`
- Storybook `career-web`: `icons-spriteicon--default`, `icons-spriteicon--all-variants`
- CSS: секция `svg-icon` в `ui/components/primitives.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

SpriteIcon — неинтерактивный primitive без собственных состояний. Декоративная иконка получает `aria-hidden="true"` и `focusable="false"`. Если иконка — единственное содержимое кнопки, доступное имя задаётся кнопке через `aria-label`, не SVG. Самостоятельно значимая иконка использует `role="img"` и `aria-label` либо `<title>` с корректной связью.

Цвет наследуется через `currentColor`; интерактивные цвета и состояния задаёт родительский компонент.
