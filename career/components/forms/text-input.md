# TextInput · Однострочное поле

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `text-input` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Однострочное текстовое поле: поиск, ссылки, имена, любые короткие значения. Может нести иконки слева и справа и режим ввода тегов.

## Анатомия

Обратите внимание: корень — `span.text-input`, а не сам `input`. Рамка, фон и состояния живут на обёртке, поэтому иконки внутри поля не ломают геометрию.

```
span.text-input.text-input
  input.text-input__input  [placeholder="Placeholder"]
```

_Разметка story `form-textinput--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Legacy alias |
|---|---|---|
| `default` | нативный input | — |
| `hover` | `input:hover` меняет border wrapper | `.text-input:hover` |
| `focus-visible` | `input:focus-visible`, ring на wrapper | `:focus-within` |
| `disabled` | нативный `disabled` | `.text-input--disabled` |
| `readOnly` | нативный `readonly`; поле остаётся focusable | UI kit contract |
| `invalid` | `aria-invalid="true"` + error id в `aria-describedby` | `.text-input--invalid` |

Filled/empty определяются значением input и не являются отдельными modifier
states. Placeholder не заменяет label.

Подтверждены CSS и разметкой: `.text-input--disabled`, `.text-input--invalid`, `:focus`, `:hover`, `:placeholder`.

```css
.text-input--with-tags,.text-input--with-tags.text-input:hover { border-color:transparent }
.text-input:hover { border-color:var(--color-ui-gray-4) }
.text-input--disabled:hover { border-color:var(--color-ui-gray-6) }
```

## Слоты

- `iconLeft`
- `iconRight`
- `icon`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | string | — | — | `text` |
| `placeholder` | string | — | — | `text` |
| `invalid` | boolean | — | — | `boolean` |
| `disabled` | boolean | — | — | `boolean` |
| `readOnly` | boolean | `false` | UI kit contract | `boolean` |
| `type` | string | — | — | `text` |
| `withTags` | boolean | — | — | `boolean` |
| `autocomplete` | string | — | — | `text` |
| `selectOnFocus` | boolean | — | — | `boolean` |
| `hasMask` | boolean | — | — | `boolean` |
| `focus` | FocusEvent | — | — | `object` |
| `blur` | other | — | — | `object` |
| `getInputEl` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-6` | `#eaf2f5` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |
| `--font-letter-spacing-0` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-line-height-display-m` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-size-body-l` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-weight-regular` | — | задаётся компонентом или средой, значения в сборке нет |
| `--shadow-border-color` | `var(--color-ui-gray-5)` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Поле получает доступное имя через InputLabel. Hint и error связываются через
`aria-describedby`; invalid — через `aria-invalid="true"`. Нативный `readonly`
не заменяется `disabled`: значение остаётся доступно фокусу и копированию.

## Поведение

- Состояния объявлены модификаторами на обёртке: `text-input--disabled`, `text-input--invalid`. Имени `--error` в реализации нет.

## Разметка

```html
<span class="text-input text-input">
  <input class="text-input__input" data-allow-mismatch placeholder="Placeholder">
</span>
```

## CSS

```css
.text-input { align-items:center;background-color:var(--color-ui-white);-moz-column-gap:4px;column-gap:4px;display:flex;--tw-shadow:inset 0 0 0 1px var(--shadow-border-color);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);border-radius:12px;box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);max-height:40px;padding:8px 12px }
.text-input--with-tags { background:transparent;flex-grow:1;min-width:200px;padding:0 6px }
.text-input--with-tags,.text-input--with-tags.text-input:hover { border-color:transparent }
.text-input:hover { border-color:var(--color-ui-gray-4) }
.text-input--disabled:hover { border-color:var(--color-ui-gray-6) }
.text-input:focus-within { border-color:var(--color-ui-gray-2) }
.text-input--with-tags:focus-within { background-color:transparent;border-color:transparent }
.text-input--disabled { border-color:var(--color-ui-gray-6) }
.text-input--with-tags .text-input__input { height:26px;min-height:26px }
.text-input__input { -webkit-appearance:none;-moz-appearance:none;appearance:none;background:none;border:none;color:var(--color-ui-gray-1);flex:1;font-size:var(--font-size-body-l,16px);font-weight:var(--font-weight-regular,400);letter-spacing:var(--font-letter-spacing-0,0);line-height:var(--font-line-height-display-m,24px);min-height:24px;min-width:24px;padding:0 4px;text-overflow:ellipsis;width:100% }
.text-input__input:focus { outline:none }
.text-input--disabled .text-input__input { color:var(--color-ui-gray-4) }
.text-input__input::-moz-placeholder { color:var(--color-ui-gray-3) }
.text-input__input::placeholder { color:var(--color-ui-gray-3) }
.text-input--disabled .text-input__input::-moz-placeholder { color:var(--color-ui-gray-4) }
.text-input--disabled .text-input__input::placeholder { color:var(--color-ui-gray-4) }
.text-input__icon { align-items:center;color:var(--color-ui-gray-2);display:flex;height:24px;justify-content:center;width:24px }
.text-input--disabled .text-input__icon { color:var(--color-ui-gray-4) }
```

## Ограничения

- `readOnly`, focus-visible ring и прямое отображение `aria-invalid` —
  нормативные дополнения UI kit поверх извлечённых wrapper modifiers.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/text-input.stories.ts`
- Storybook `career-web`: `form-textinput--default`, `form-textinput--filled`, `form-textinput--disabled`, `form-textinput--error`
- CSS: секция `text-input` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
