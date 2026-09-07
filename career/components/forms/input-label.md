# InputLabel · BaseInputLabel

| | |
|---|---|
| **Категория** | Формы |
| **Корневой класс** | `base-input-label` |
| **CSS** | `ui/components/forms.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 8 из 8 |

## Назначение

Обвязка поля: заголовок, отметка обязательности, подпись и текст ошибки. Career не встраивает подпись в само поле — метка всегда отдельный компонент, оборачивающий любой контрол.

## Анатомия

Ключевая особенность — ошибки могут стоять и над полем, и под ним: за это отвечает `--errorsPosition-above`. Модификатор `--appearance-textarea` меняет отступы под многострочное поле.

```
label.base-input-label
  span.base-input-label__title.base-input-label__title--errorsPosition-above.base-input-label__title--appearance-default
    · «Поле ввода»
  input  [type="text" placeholder="Введите значение"]
```

_Разметка story `common-form-baseinputlabel--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

| Состояние | Контракт |
|---|---|
| `default` | label и control связаны вложенностью или `for`/`id` |
| `disabled` | control получает нативный `disabled`, title — `--disabled` |
| `invalid` | control получает `aria-invalid="true"` и `aria-describedby`; root — `.base-input-label--invalid` |

### FormField contract

InputLabel является обвязкой любого form control. Порядок элементов:
`title → subtitle/hint → control → error`. У каждого hint/error стабильный `id`,
а control перечисляет их в `aria-describedby`. Визуальный `required` обязательно
дублируется нативным `required` или `aria-required="true"` на самом control.

Подтверждены CSS и разметкой: `.base-input-label__title--disabled`.

## Слоты

- `nextToTitle`
- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `title` | string | — | — | `text` |
| `subtitle` | string | — | — | `text` |
| `tag` | string | `'label'` | — | `text` |
| `required` | boolean | — | — | `boolean` |
| `size` | string | — | — | `text` |
| `errors` | string \| string[] \| null | — | — | `object` |
| `errorsPosition` | string | `'above'` | — | `text` |
| `errorsClass` | string | — | — | `text` |
| `labelFor` | string | — | — | `text` |
| `appearance` | string | `'default'` | — | `text` |
| `smallSubtitle` | boolean | — | — | `boolean` |
| `disabled` | boolean | `false` | — | `boolean` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

Предпочтительна явная связь `label[for]` → `control[id]`; вложенность также
допустима для простого поля. Ошибка не заменяет label и связывается с control
через `aria-describedby`. Для invalid задаётся `aria-invalid="true"`.

## Поведение

- Размер метки задаётся `--size-large` / `--size-small`, а не размером самого поля.
- Признак обязательности — модификатор `--required` на заголовке, а не отдельный узел со звёздочкой.

## Разметка

```html
<label class="base-input-label base-input-label--invalid" for="profile-name">
  <span class="base-input-label__title base-input-label__title--required">Имя</span>
  <span id="profile-name-hint" class="base-input-label__subtitle">Как в документах</span>
  <span class="text-input text-input--invalid">
    <input id="profile-name" class="text-input__input" required
           aria-invalid="true" aria-describedby="profile-name-hint profile-name-error">
  </span>
  <span id="profile-name-error" class="base-input-label__error">Заполните поле</span>
</label>
```

## CSS

```css
.base-input-label__title { color:var(--color-ui-gray-1);display:block;font-size:16px;font-weight:600;line-height:24px;margin-bottom:8px }
.base-input-label__title--appearance-textarea { margin-bottom:8px }
.base-input-label:has(.base-input-label__subtitle) .base-input-label__title { margin-bottom:0;white-space:nowrap }
.base-input-label__subtitle { color:var(--color-ui-gray-3);display:block;margin-bottom:8px;margin-top:4px;white-space:nowrap }
.base-input-label__subtitle--smallSubtitle { font-size:14px;line-height:20px;white-space:break-spaces }
.base-input-label__subtitle--hasErrors.base-input-label__subtitle--errorsPosition-above { margin-bottom:4px }
.base-input-label__title--size-small { font-size:14px;line-height:20px;margin-bottom:1rem }
.base-input-label__title--size-large { font-size:20px;line-height:24px;margin-bottom:1.5rem }
.base-input-label__title--disabled { color:var(--color-ui-gray-4);margin-bottom:0 }
.base-input-label__title--required:after { color:var(--color-ui-red);content:" *" }
.base-input-label__title--hasErrors.base-input-label__title--errorsPosition-above { margin-bottom:4px }
@media (max-width:767px) {
  .base-input-label__subtitle { white-space:break-spaces }
}
```

## Ограничения

- Связи `aria-describedby`/`aria-invalid` и стабильный error class не были
  оформлены в snapshot; они добавлены нормативным FormField contract.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-input-label.stories.ts`
- Storybook `career-web`: `common-form-baseinputlabel--default`, `common-form-baseinputlabel--required`, `common-form-baseinputlabel--with-subtitle`, `common-form-baseinputlabel--with-errors`, `common-form-baseinputlabel--size-small`, `common-form-baseinputlabel--size-large`, `common-form-baseinputlabel--disabled`, `common-form-baseinputlabel--appearance-textarea`
- CSS: секция `base-input-label` в `ui/components/forms.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
