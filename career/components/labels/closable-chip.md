# ClosableChip · Чип с крестиком

| | |
|---|---|
| **Категория** | Метки и статусы |
| **Корневой класс** | `closable-chip__close` |
| **CSS** | `ui/components/chips.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Чип с кнопкой удаления. Тонкая надстройка над BaseChip: добавляет только `closable-chip__close`.

## Анатомия

```
span.base-chip.base-chip--default.base-chip--clickable.base-chip--interactive  [tabindex="0"]
  span.base-chip__content
    · «Python»
    button.closable-chip__close  [type="button" aria-label="Удалить"]
      svg.svg-icon
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#cross"]
```

_Разметка story `common-chips-closablechip--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `:focus`.

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `text` | string | — | — | `text` |
| `close` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#cross` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-label="Удалить"`, `tabindex="0"`.

## Разметка

```html
<span tabindex="0" class="base-chip base-chip--default base-chip--clickable base-chip--interactive">
  <span class="base-chip__content">
    Python
    <button type="button" class="closable-chip__close" aria-label="Удалить">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#cross"/>
      </svg>
    </button>
  </span>
</span>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.closable-chip__close { align-items:center;background-color:transparent;border-radius:9999px;border-style:none;color:var(--color-icon-gray);cursor:pointer;display:inline-flex;flex:none;height:22px;justify-content:center;padding:0;width:22px }
.closable-chip__close:focus { outline:2px solid transparent;outline-offset:2px }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/closable-chip.stories.ts`
- Storybook `career-web`: `common-chips-closablechip--default`
- CSS: секция `closable-chip` в `ui/components/chips.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Контейнер — нефокусируемый `span`; единственная интерактивная часть — `button.closable-chip__close`. Это исправляет старый snapshot с двумя точками фокуса.

| Состояние | Контракт |
|---|---|
| `default` | видимая кнопка закрытия с `aria-label="Удалить …"` |
| `hover` | фон и контраст меняются только у кнопки закрытия |
| `focus-visible` | двухпиксельное focus-кольцо |
| `disabled` | нативный `disabled`; обработчик удаления не вызывается |

Удаление по `Backspace`/`Delete` допустимо только если приложение явно фокусирует весь token как widget; базовый ClosableChip этого не делает.
