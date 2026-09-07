# StarRating · Оценка звёздами

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `star-rating`; production alias — `wrapper` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Оценка от одной до пяти звёзд. Используется в оценке консультаций и рейтинге компаний — и как поле ввода, и как индикатор.

## Анатомия

Каждая звезда — `label` с настоящим `input[type=radio]`, скрытым классом `sr-only`. Клавиатурная навигация работает штатно, без обработчиков.

```
div.wrapper.grid.w-min.shrink-0.grid-flow-col
  label.star-label.cursor-pointer.pl-1.pr-1.first:pl-0.last:pr-0
    input.star-input.sr-only  [type="radio" name="star-rating-story"]
    svg.svg-icon.star-icon.stroke-[1.3px].opacity-60
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#star-small"]
  label.star-label.cursor-pointer.pl-1.pr-1.first:pl-0.last:pr-0
    input.star-input.sr-only  [type="radio" name="star-rating-story"]
    svg.svg-icon.star-icon.stroke-[1.3px].opacity-60
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#star-small"]
  label.star-label.cursor-pointer.pl-1.pr-1.first:pl-0.last:pr-0
    input.star-input.sr-only  [type="radio" name="star-rating-story"]
    svg.svg-icon.star-icon.stroke-[1.3px].opacity-60
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#star-small"]
  label.star-label.cursor-pointer.pl-1.pr-1.first:pl-0.last:pr-0
    input.star-input.sr-only  [type="radio" name="star-rating-story"]
    svg.svg-icon.star-icon.stroke-[1.3px].opacity-60
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#star-small"]
  label.star-label.cursor-pointer.pl-1.pr-1.first:pl-0.last:pr-0
    input.star-input.sr-only  [type="radio" name="star-rating-story"]
    svg.svg-icon.star-icon.stroke-[1.3px].opacity-60
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#star-small"]
```

_Разметка story `form-starrating--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Совместимость |
|---|---|---|
| `default` | radio group без выбранного input | production CSS |
| `hover` | preview значения до наведённой звезды | `.wrapper:hover`, `.star-label:hover` |
| `focus-visible` | `input:focus-visible + .star-icon` | state contract |
| `checked` | один radio input получает `checked`; звёзды до value получают filled view | `.star-label-checked` |
| `disabled` | все radio inputs получают `disabled`, root — `.is-disabled` | existing disabled story |
| `readOnly` | без inputs; `.is-readonly`, `role="img"`, текстовый `aria-label` | UI kit contract |

В новом коде `.star-rating` обязателен. Общий класс `.wrapper` — технический
след production snapshot и не является публичным именем компонента.

Подтверждены CSS и разметкой: `:hover`.

```css
.star-label-checked .star-icon,.wrapper:hover .star-icon { color:var(--color-ui-orange);stroke:var(--color-ui-orange) }
.star-label:hover~.star-label .star-icon { color:var(--color-ui-white);stroke:var(--color-ui-gray-2) }
.star-label:hover~.star-label .star-icon--filled-empty { color:var(--color-ui-gray-5);stroke:var(--color-ui-gray-5) }
```

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | number | — | — | `range` |
| `name` | string | — | — | `text` |
| `disabled` | boolean | — | — | `boolean` |
| `size` | string \| number | `36` | — | `number` |
| `compact` | boolean | — | — | `boolean` |
| `emptyFilled` | boolean | — | — | `boolean` |
| `readOnly` | boolean | `false` | UI kit contract | `boolean` |
| `update:modelValue` | number | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#star-small` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Интерактивный вариант — группа нативных radio с общим `name`; каждому input
нужно доступное имя «1 звезда», «2 звезды» и т. д. через видимый текст или
`aria-label`. ReadOnly не должен состоять из disabled inputs: он рендерит
неинтерактивные звёзды с `role="img"` и `aria-label="Оценка 4 из 5"` на корне.

## Поведение

- `compact` уменьшает промежутки, `emptyFilled` показывает незаполненные звёзды залитыми серым, а не контуром.
- `disabled` оставляет поле формы видимым, но недоступным для изменения.
- `readOnly` — отдельный режим отображения уже сохранённой оценки; он не попадает
  в tab order и объявляет значение одной доступной фразой.

## Разметка

```html
<div class="star-rating wrapper grid w-min shrink-0 grid-flow-col" aria-label="Оценка">
  <label class="star-label cursor-pointer pl-1 pr-1 first:pl-0 last:pr-0">
    <input class="star-input sr-only" type="radio" name="star-rating-story" value="1" aria-label="1 звезда">
    <svg class="svg-icon star-icon stroke-[1.3px] opacity-60" width="36" height="36" style="width: 36px; height: 36px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#star-small"/>
    </svg>
  </label>
  <label class="star-label cursor-pointer pl-1 pr-1 first:pl-0 last:pr-0">
    <input class="star-input sr-only" type="radio" name="star-rating-story" value="2" aria-label="2 звезды">
    <svg class="svg-icon star-icon stroke-[1.3px] opacity-60" width="36" height="36" style="width: 36px; height: 36px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#star-small"/>
    </svg>
  </label>
  <label class="star-label cursor-pointer pl-1 pr-1 first:pl-0 last:pr-0">
    <input class="star-input sr-only" type="radio" name="star-rating-story" value="3" aria-label="3 звезды">
    <svg class="svg-icon star-icon stroke-[1.3px] opacity-60" width="36" height="36" style="width: 36px; height: 36px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#star-small"/>
    </svg>
  </label>
  <label class="star-label cursor-pointer pl-1 pr-1 first:pl-0 last:pr-0">
    <input class="star-input sr-only" type="radio" name="star-rating-story" value="4" aria-label="4 звезды">
    <svg class="svg-icon star-icon stroke-[1.3px] opacity-60" width="36" height="36" style="width: 36px; height: 36px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#star-small"/>
    </svg>
  </label>
  <label class="star-label cursor-pointer pl-1 pr-1 first:pl-0 last:pr-0">
    <input class="star-input sr-only" type="radio" name="star-rating-story" value="5" aria-label="5 звёзд">
    <svg class="svg-icon star-icon stroke-[1.3px] opacity-60" width="36" height="36" style="width: 36px; height: 36px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#star-small"/>
    </svg>
  </label>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.star-icon { stroke-linejoin:round;-webkit-tap-highlight-color:transparent;tap-highlight-color:transparent;color:var(--color-ui-white);stroke:var(--color-ui-gray-2) }
.star-icon--filled-empty { color:var(--color-ui-gray-5);stroke:var(--color-ui-gray-5);opacity:1 }
.star-icon--compact { height:32px;width:32px }
.star-label-checked .star-icon,.wrapper:hover .star-icon { color:var(--color-ui-orange);stroke:var(--color-ui-orange) }
.star-label:hover~.star-label .star-icon { color:var(--color-ui-white);stroke:var(--color-ui-gray-2) }
.star-label:hover~.star-label .star-icon--filled-empty { color:var(--color-ui-gray-5);stroke:var(--color-ui-gray-5) }
```

## Ограничения

- `readOnly` и стабильный root `star-rating` — нормативные дополнения UI kit, а
  не часть извлечённого Storybook API.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/star-rating.stories.ts`
- Storybook `career-web`: `form-starrating--default`, `form-starrating--selected`, `form-starrating--disabled`, `form-starrating--company-rating-criteria`
- CSS: секция `star-rating` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
