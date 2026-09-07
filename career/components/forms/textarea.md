# Textarea · BaseTextarea

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `base-textarea` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Многострочное поле с автоматическим ростом и счётчиком символов. Основное поле сопроводительных писем и шаблонов откликов.

## Анатомия

```
div.base-textarea
  textarea.base-textarea__textarea  [placeholder="Placeholder"]
  div.flex.justify-between.gap-2
    div
    div.text-length.whitespace-nowrap
      · «0 / 100»
```

_Разметка story `form-basetextarea--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Канонический контракт | Legacy alias |
|---|---|---|
| `default` | нативный textarea | — |
| `hover` | `:hover` | production CSS |
| `focus-visible` | `:focus-visible`, border + ring | legacy `:focus` задаёт только border |
| `disabled` | нативный `disabled` | `--disabled` modifiers |
| `readOnly` | нативный `readonly`; поле остаётся focusable | UI kit contract |
| `invalid` | `aria-invalid="true"` + `aria-describedby` | `--invalid` modifiers |

Автоматический рост и filled/empty не являются состояниями design-system API.

Подтверждены CSS и разметкой: `.base-textarea--disabled`, `.base-textarea--invalid`, `.base-textarea__textarea--disabled`, `.base-textarea__textarea--invalid`, `:focus`, `:hover`, `:placeholder`.

```css
.base-textarea__textarea:hover { border-color:var(--color-ui-gray-4) }
.base-textarea__textarea--disabled:hover { border-color:var(--color-ui-gray-6) }
```

## Слоты

- `error`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `modelValue` | string | — | — | `text` |
| `placeholder` | string | — | — | `text` |
| `rows` | string \| number | `1` | — | `number` |
| `maxRows` | string \| number | `5` | — | `number` |
| `disabled` | boolean | — | — | `boolean` |
| `invalid` | boolean | — | — | `boolean` |
| `readOnly` | boolean | `false` | UI kit contract | `boolean` |
| `maxLength` | number | — | — | `number` |
| `name` | string | — | — | `text` |
| `autofocus` | boolean | — | — | `boolean` |
| `appearance` | string | — | — | `text` |
| `update:modelValue` | other | — | — | `object` |
| `focus` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-6` | `#eaf2f5` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |
| `--font-letter-spacing-0` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-line-height-body-m` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-line-height-display-m` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-size-body-l` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-size-body-s` | — | задаётся компонентом или средой, значения в сборке нет |
| `--font-weight-regular` | — | задаётся компонентом или средой, значения в сборке нет |
| `--textarea--maxRows` | — | задаётся компонентом или средой, значения в сборке нет |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Textarea связывается с InputLabel через `for`/`id`. Error и TextLength имеют
стабильные id и перечисляются в `aria-describedby`; invalid дополнительно
ставит `aria-invalid="true"`. Счётчик не должен становиться частью label.

## Поведение

- Высота растёт до `maxRows`: количество строк передаётся в CSS инлайновой переменной `--textarea--maxRows`, высота выставляется в пикселях тем же инлайновым стилем.
- Счётчик символов — отдельный компонент `text-length` в подвале поля; при ошибке слева от него появляется её текст.

## Разметка

```html
<div class="base-textarea">
  <textarea class="base-textarea__textarea" rows="3" placeholder="Placeholder" maxlength="100" style="--textarea--maxRows: 5; overflow: hidden; overflow-wrap: break-word; height: 90px;"></textarea>
  <div class="flex justify-between gap-2">
    <div></div>
    <div class="text-length whitespace-nowrap">0 / 100</div>
  </div>
</div>
```

## CSS

```css
.base-textarea { display:flex;flex-direction:column;row-gap:4px }
.base-textarea--disabled { color:var(--color-ui-gray-4) }
.base-textarea__textarea { background-color:var(--color-ui-white);border:1px solid var(--color-ui-gray-5);border-radius:12px;color:var(--color-ui-gray-1);flex:1 1 auto;font-size:var(--font-size-body-l,16px);font-weight:var(--font-weight-regular,400);letter-spacing:var(--font-letter-spacing-0,0);line-height:var(--font-line-height-display-m,24px);max-height:max(88px,calc(18px + var(--textarea--maxRows)*24px));min-height:88px;min-width:0;overflow:auto!important;padding:8px 16px;resize:none }
.base-textarea__textarea:hover { border-color:var(--color-ui-gray-4) }
.base-textarea__textarea--disabled:hover { border-color:var(--color-ui-gray-6) }
.base-textarea__textarea:focus { border-color:var(--color-ui-gray-2);outline:0 }
.base-textarea__textarea--invalid { border-color:var(--color-ui-red) }
.base-textarea__textarea::-moz-placeholder { color:var(--color-ui-gray-3) }
.base-textarea__textarea::placeholder { color:var(--color-ui-gray-3) }
.base-textarea__textarea--disabled { border-color:var(--color-ui-gray-6);color:var(--color-ui-gray-4) }
.base-textarea__textarea--disabled::-moz-placeholder { color:var(--color-ui-gray-4) }
.base-textarea__textarea--disabled::placeholder { color:var(--color-ui-gray-4) }
.base-textarea>.flex { color:var(--color-ui-gray-3);font-size:var(--font-size-body-s,12px);line-height:var(--font-line-height-body-m,16px) }
.base-textarea>.flex :where(.text-length) { color:var(--color-ui-gray-3);font-size:var(--font-size-body-s,12px);line-height:var(--font-line-height-body-m,16px) }
.base-textarea--appearance-feedback .base-textarea__textarea { min-height:88px;padding:10px 12px }
.text-length { color:var(--color-ui-gray-3);font-size:12px;line-height:16px;text-align:right }
.text-length--exceeded { color:var(--color-ui-gray-3) }
```

## Ограничения

- `readOnly`, focus-visible ring и ARIA-связь error/counter добавлены нормативным
  контрактом; production snapshot показывал только визуальные modifiers.

## Источники

- Файлы в репозитории `career-web`: `./src/components/form/base-textarea.stories.ts`
- Storybook `career-web`: `form-basetextarea--default`, `form-basetextarea--filled`, `form-basetextarea--disabled`, `form-basetextarea--error`
- CSS: секция `base-textarea` в `ui/components/forms.css`, секция `text-length` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
