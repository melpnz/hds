# AIButton · Кнопка AI

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `ai-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Отдельная кнопка для действий с участием AI. Отличается от обычной кнопки не цветом фона, а градиентной рамкой: у Career для этого есть специальный токен `--color-ai-gradient`.

## Анатомия

```
button.ai-button.base-button.inline-flex.appearance-main.size-m.has-before.is-sizeable.ai-button  [type="button" target="_self"]
  span.base-button__inner
    span.base-button__before
      svg.svg-icon  [aria-hidden="true"]
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#booster"]
    span.base-button__content
      · «AI кнопка»
```

_Разметка story `common-buttons-aibutton--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

AIButton наследует полный контракт Button: `default`, `hover`, `focus-visible`,
`pressed`, `disabled`, `loading`. Для loading одновременно задаются
`.is-loading` и `aria-busy="true"`; подпись остаётся в потоке с `opacity: 0`,
чтобы ширина не менялась. Собственный CSS AIButton меняет только градиент в
`disabled`, остальные состояния реализует `base-button` и
`ui/state-contract.css`.

Подтверждены CSS и разметкой: `.has-before`, `.is-sizeable`, `:disabled`.

```css
.ai-button:disabled { background-image:none }
```

## Слоты

- `before`
- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `size` | AIButtonSize | `'m'` | m · l | `radio` |
| `label` | string | `'Кнопка AI'` | — | `text` |
| `disabled` | boolean \| null | — | true · false | `radio` |
| `type` | ButtonType | `'button'` | — | `object` |
| `fullWidth` | boolean | `false` | — | `boolean` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ai-gradient` | `radial-gradient(110.74% 217.18% at -3.37% -17.02%,#64c178 0%,#74caba 10%,#83d3fc 20%,#8dabfc 50%,#9783fc 80%)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#booster` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-hidden="true"`.

## Поведение

- Размеров два — `m` и `l`, а не четыре, как у BaseButton.

## Разметка

```html
<button class="ai-button base-button inline-flex appearance-main size-m has-before is-sizeable ai-button" type="button" target="_self">
  <span class="base-button__inner">
    <span class="base-button__before">
      <svg class="svg-icon" width="24" height="24" aria-hidden="true" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#booster"/>
      </svg>
    </span>
    <span class="base-button__content">AI кнопка</span>
  </span>
</button>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.ai-button { background-image:var(--color-ai-gradient) }
.ai-button:disabled { background-image:none }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/ai-button/ai-button.stories.ts`
- Storybook `career-web`: `common-buttons-aibutton--default`
- CSS: секция `ai-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
