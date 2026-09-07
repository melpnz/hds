# StatusChip · ConversationsChip

| | |
|---|---|
| **Категория** | Метки и статусы |
| **Корневой класс** | `min-h-8`, `whitespace-nowrap`, `rounded-lg` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 6 из 6 |

## Назначение

Цветная метка состояния отклика: «На связи», «Принято», «Отклонено», «Неактивно». Отличается от BaseChip тем, что не кликается и несёт только смысл статуса.

## Анатомия

```
div.relative.grid.min-h-8.w-min.grid-flow-col.items-center.whitespace-nowrap.rounded-lg.px-2.py-1.text-body-m.text-font-black.bg-ui-green-10.pl-[26px]
  div.absolute.left-1.top-1
    svg.svg-icon.text-ui-green
      use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#single-check"]
  span.px-[6px]
    · «Заявка подтверждена»
```

_Разметка story `conversations-list-conversationschip--green-with-icon`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Компонент имеет только состояние отображения `default`; цветовые исполнения — semantic variants, не интерактивные states.

## Слоты

- `icon`
- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `color` | SupportedColors | `'orange'` | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-green-10` | `color-mix(in srgb,var(--color-ui-green) 10%,transparent)` | из `:root` Career |
| `--color-ui-orange-10` | `color-mix(in srgb,var(--color-ui-orange) 10%,transparent)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-red-10` | `color-mix(in srgb,var(--color-ui-red) 10%,transparent)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#cross-large` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#single-check` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Цвет задаётся заливкой 10% от статусного цвета: `bg-ui-orange-10`, `bg-ui-green-10`, `bg-ui-red-10`, `bg-ui-gray-3-10`. Текст при этом всегда `--color-font-black`, а не цветной.
- Иконка ставится абсолютно в левый верхний угол, а контент сдвигается `pl-[26px]` — то есть под иконку не делается отдельная колонка.

## Разметка

```html
<div class="relative grid min-h-8 w-min grid-flow-col items-center whitespace-nowrap rounded-lg px-2 py-1 text-body-m text-font-black bg-ui-green-10 pl-[26px]">
  <div class="absolute left-1 top-1">
    <svg class="svg-icon text-ui-green" width="24" height="24" style="width: 24px; height: 24px;">
      <use xlink:href="../../ui/assets/icons/sprite.svg#single-check"/>
    </svg>
  </div>
  <span class="px-[6px]">Заявка подтверждена</span>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент целиком собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/conversations-chip.stories.ts`
- Storybook `career-web`: `conversations-list-conversationschip--orange`, `conversations-list-conversationschip--green`, `conversations-list-conversationschip--red`, `conversations-list-conversationschip--gray`, `conversations-list-conversationschip--green-with-icon`, `conversations-list-conversationschip--red-with-icon`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт base scope

Стабильный root — `status-chip`. Канонические варианты: `neutral`, `pending`, `success`, `error`; старый prop `color` маппится соответственно из gray/orange/green/red. StatusChip всегда неинтерактивен: для фильтра или действия используйте Chip/Button.

Root — `inline-flex` с `vertical-align: middle`. Без него базовая линия чипа
берётся от первого flex-элемента, и чип с ведущей иконкой встаёт выше соседей
с текстом: базовая линия SVG — его нижний край. То же делает `.checkbox`
в сборке. Учтите это, если добавляете иконку в начало другого инлайнового чипа.

Текст статуса обязателен, цвет и иконка только дублируют его. Для уже видимого статуса role не нужен; при асинхронном изменении контейнер может получить `role="status"`. Иконка декоративна и имеет `aria-hidden="true"`.
