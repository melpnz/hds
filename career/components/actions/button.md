# Button · BaseButton

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `base-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Основная кнопка Career. Через неё проходят почти все действия интерфейса: отправка форм, переходы, подтверждения, опасные операции. Один компонент покрывает и кнопку, и ссылку: при `href` или `to` рендерится `a`, иначе `button`.

Из BaseButton собраны и другие кнопки Career — FilterButton, GhostButton, SalaryHeadButton добавляют свои классы к `base-button` и наследуют всю его геометрию.

## Анатомия

Анатомия стабильна во всех вариантах: корень → `__inner` → необязательный `__before`, обязательный `__content`, необязательный `__after`. Слоты `before`/`after` отмечаются на корне классами `has-before` / `has-after` — по ним CSS понимает, что отступы делит не один элемент. Отдельным абсолютно позиционированным узлом `__loader` показывается загрузка.

```
button.base-button.inline-flex.appearance-main-border.size-l.has-before.has-after.is-sizeable  [type="button" href target="_self"]
  span.base-button__inner
    span.base-button__before
      svg.svg-icon
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#filter"]
    span.base-button__content
      · «Фильтры»
    span.base-button__after
      span.inline-flex.h-5.min-w-5.items-center.justify-center.rounded-full.bg-ui-primary.px-1.text-body-xs.font-semibold.leading-4.text-ui-white
        · «0»
```

_Разметка story `common-buttons-basebutton--affixes-button`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Варианты

Внешний вид задаётся классом `appearance-*`, размер — `size-*`. Оба обязательны: без `appearance-*` кнопка прозрачная и без рамки, без `is-sizeable` не применяется ни один размер. Реальная разметка Career всегда содержит `is-sizeable`, если prop `sizeable` не выключен явно.

| Класс | Фон | Текст | Рамка |
|---|---|---|---|
| `appearance-main` | var(--color-ui-primary) | var(--color-ui-white) | нет |
| `appearance-main-border` | transparent | var(--color-ui-primary) | inset 0 0 0 1px var(--shadow-border-color) |
| `appearance-avatar` | transparent | — | нет |
| `appearance-passive` | var(--color-ui-white) | var(--color-ui-gray-1) | inset 0 0 0 1px var(--shadow-border-color) |
| `appearance-danger` | var(--color-ui-red) | var(--color-ui-white) | нет |
| `appearance-danger-border` | transparent | var(--color-ui-red) | 1px var(--color-ui-red) |
| `appearance-branded` | var(--color-branded-profile-primary) | var(--color-branded-profile-text-primary) | 1px var(--color-branded-profile-primary) |
| `appearance-branded-outline` | var(--color-ui-white) | var(--color-branded-profile-primary) | 1px var(--color-branded-profile-primary) |
| `appearance-branded-secondary-outline` | transparent | var(--color-font-black) | 1px var(--color-ui-checkbox) |
| `appearance-menu` | var(--color-ui-gray-bg) | var(--color-font-black) | — |
| `appearance-success` | var(--color-ui-green) | var(--color-ui-white) | нет |
| `appearance-success-border` | transparent | var(--color-ui-green) | 1px var(--color-ui-green) |
| `appearance-ghost` | transparent | var(--color-ui-gray-2) | нет |

## Размеры

| Класс | Высота | Padding | Radius | Кегль |
|---|---|---|---|---|
| `size-sm` | 28px | 4px 8px | 8px | 12px / 16px |
| `size-m` | 32px | 4px 8px | 8px | 14px / 20px |
| `size-l` | 40px | 8px 12px | 12px | 14px / 20px |
| `size-xl` | 48px | 12px 16px | 12px | 16px / 24px |

## Состояния

Нормативный контракт UI kit:

| Состояние | Контракт | Реализация |
|---|---|---|
| `default` | без state-атрибутов | production CSS |
| `hover` | `:hover` | production CSS для каждого `appearance` |
| `focus-visible` | `:focus-visible` | production CSS; видимый outline/ring обязателен |
| `pressed` | `:active`; `.is-pressed` только для story/визуальных тестов | `ui/state-contract.css` |
| `disabled` | нативный `disabled`; для ссылки — `aria-disabled="true"` без `href` | production CSS + state contract |
| `loading` | `.is-loading` и `aria-busy="true"`; действие блокируется, ширина сохраняется | production CSS + state contract |

`focus` не является публичным состоянием: в новом коде используется только
`focus-visible`. Классы `is-link-disabled` и `is-hidden` остаются runtime-деталями
существующей реализации, но не заменяют семантические атрибуты.

Подтверждены CSS и разметкой: `.has-after`, `.has-before`, `.is-full-width`, `.is-hidden`, `.is-link-disabled`, `.is-loading`, `.is-sizeable`, `:disabled`, `:focus`, `:hover`, `:not`.

```css
.base-button:hover { text-decoration-line:none }
.base-button:disabled { pointer-events:none }
.base-button.appearance-main:focus,.base-button.appearance-main:hover { opacity:.8 }
.base-button.appearance-main:focus-visible { outline-color:var(--color-ui-primary-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-main:disabled { background-color:var(--color-ui-gray-5);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-main-border:focus,.base-button.appearance-main-border:hover { background-color:var(--color-ui-primary-10) }
.base-button.appearance-main-border:focus-visible { outline-color:var(--color-ui-primary-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-main-border:disabled { background-color:transparent;color:var(--color-ui-gray-4);--tw-shadow:inset 0 0 0 1px var(--shadow-border-color-disabled);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-passive:hover { --tw-shadow:inset 0 0 0 1px var(--shadow-border-color-hover);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color) }
.base-button.appearance-passive:focus,.base-button.appearance-passive:hover { background-color:var(--color-ui-gray-3-10);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-passive:focus-visible { outline-color:var(--color-ui-gray-2-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-passive:disabled { background-color:transparent;color:var(--color-ui-gray-4);--tw-shadow:inset 0 0 0 1px var(--shadow-border-color-disabled);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-danger:focus,.base-button.appearance-danger:hover { opacity:.8 }
.base-button.appearance-danger:focus-visible { outline-color:var(--color-ui-red-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-danger:disabled { background-color:var(--color-ui-gray-5);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-danger-border:focus,.base-button.appearance-danger-border:hover { background-color:var(--color-ui-red-10) }
.base-button.appearance-danger-border:focus-visible { outline-color:var(--color-ui-red-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-danger-border:disabled { background-color:transparent;border-color:var(--color-ui-gray-shadow);color:var(--color-ui-gray-4) }
.base-button.appearance-branded:focus,.base-button.appearance-branded:hover { opacity:.8 }
.base-button.appearance-branded:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-font-black);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-branded-outline:hover { background-color:var(--color-branded-profile-primary);color:var(--color-ui-white) }
.base-button.appearance-branded-outline:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-font-black);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-branded-secondary-outline:hover { background-color:var(--color-branded-profile-primary);border-color:var(--color-branded-profile-primary);color:var(--color-ui-white) }
.base-button.appearance-branded-secondary-outline:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-font-black);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
```

Заметьте разницу подходов: у сплошных вариантов (`main`, `danger`, `success`, `branded`) hover — это `opacity: .8`, а не другой цвет. У контурных и пассивных — смена фона. Фокус везде показывается через `:focus-visible`, то есть только при клавиатурной навигации.

## Слоты

- `before`
- `default`
- `after`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `appearance` | BaseButtonAppearance | `'main'` | main · main-border · none · passive · danger · danger-border · branded · menu · branded-outline · branded-secondary-outline · success · success-border | `radio` |
| `size` | BaseButtonSize | `'l'` | sm · m · l · xl | `radio` |
| `type` | ButtonType | `'button'` | button · submit · reset | `radio` |
| `fullWidth` | boolean | `false` | — | `boolean` |
| `target` | "_blank" \| "_self" | `'_self'` | _self · _blank | `radio` |
| `disabled` | boolean \| null | — | — | `boolean` |
| `sizeable` | boolean | `true` | — | `boolean` |
| `loading` | boolean | `false` | — | `boolean` |
| `href` | string | — | — | `text` |
| `to` | RouteLocationRaw | — | — | `text` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-branded-profile-primary` | — | задаётся компонентом или средой, значения в сборке нет |
| `--color-branded-profile-text-primary` | — | задаётся компонентом или средой, значения в сборке нет |
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-blue-60` | `color-mix(in srgb,var(--color-ui-blue) 60%,transparent)` | из `:root` Career |
| `--color-ui-checkbox` | `#666` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-2-60` | `color-mix(in srgb,var(--color-ui-gray-2) 60%,transparent)` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-gray-4` | `#a6bdc9` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-green-10` | `color-mix(in srgb,var(--color-ui-green) 10%,transparent)` | из `:root` Career |
| `--color-ui-green-60` | `color-mix(in srgb,var(--color-ui-green) 60%,transparent)` | из `:root` Career |
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-primary-10` | `color-mix(in srgb,var(--color-ui-primary) 10%,transparent)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-red-10` | `color-mix(in srgb,var(--color-ui-red) 10%,transparent)` | из `:root` Career |
| `--color-ui-red-60` | `color-mix(in srgb,var(--color-ui-red) 60%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |
| `--shadow-border-color` | `var(--color-ui-gray-5)` | из `:root` Career |
| `--shadow-border-color-disabled` | `var(--color-ui-gray-shadow)` | из `:root` Career |
| `--shadow-border-color-focus` | `var(--color-ui-gray-4)` | из `:root` Career |
| `--shadow-border-color-hover` | `var(--color-ui-gray-4)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#filter` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- `loading` не убирает содержимое, а гасит его `opacity: 0` (`is-loading` + `__inner.is-hidden`) и накладывает лоадер 24×24 по центру. Ширина кнопки при загрузке не прыгает.
- `disabled` и `is-loading` выключают `pointer-events`. У ссылки роль disabled играет `is-link-disabled`.
- `fullWidth` даёт `width: 100%` (`is-full-width`).
- На экранах ≤767px содержимое центрируется: `.base-button__content { justify-content: center; text-align: center }`.
- Иконка в слоте — `svg.svg-icon` 24×24; размер задан инлайн-стилем, а не классом.

## Разметка

```html
<button href type="button" target="_self" class="base-button inline-flex appearance-main-border size-l has-before has-after is-sizeable">
  <span class="base-button__inner">
    <span class="base-button__before">
      <svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#filter"/>
      </svg>
    </span>
    <span class="base-button__content">Фильтры</span>
    <span class="base-button__after">
      <span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ui-primary px-1 text-body-xs font-semibold leading-4 text-ui-white">0</span>
    </span>
  </span>
</button>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.base-button { align-items:center;cursor:pointer;font-size:14px;font-weight:600;justify-content:center;line-height:20px;position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none }
.base-button:hover { text-decoration-line:none }
.base-button:disabled { pointer-events:none }
.base-button.is-full-width { width:100% }
.base-button.is-link-disabled,.base-button.is-loading { pointer-events:none }
.base-button__inner { align-items:center;display:inline-flex;gap:.25rem }
.base-button__after,.base-button__before { align-items:center;display:inline-flex;flex-shrink:0;justify-content:center }
.base-button__content { align-items:center;display:inline-flex;padding-left:.25rem;padding-right:.25rem }
.base-button__content--appearance-avatar { padding:0 }
.base-button__content.is-hidden,.base-button__inner.is-hidden { opacity:0 }
.base-button__loader { align-items:center;display:inline-flex;height:1.5rem;top:0;right:0;bottom:0;left:0;justify-content:center;margin:auto;pointer-events:none;position:absolute;width:1.5rem }
.base-button.is-sizeable.size-sm { border-radius:.5rem;font-size:12px;line-height:16px;max-height:1.75rem;min-height:1.75rem;padding:.25rem .5rem }
.base-button.is-sizeable.size-m { border-radius:.5rem;font-size:14px;font-weight:600;line-height:20px;max-height:2rem;min-height:2rem;padding:.25rem .5rem }
.base-button.is-sizeable.size-l { border-radius:.75rem;font-size:14px;font-weight:600;line-height:20px;max-height:2.5rem;min-height:2.5rem;padding:.5rem .75rem }
.base-button.is-sizeable.size-xl { border-radius:.75rem;font-size:16px;font-weight:600;line-height:24px;max-height:3rem;min-height:3rem;padding:.75rem 1rem }
.base-button.appearance-main { background-color:var(--color-ui-primary);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-main:focus,.base-button.appearance-main:hover { opacity:.8 }
.base-button.appearance-main:focus-visible { outline-color:var(--color-ui-primary-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-main:disabled { background-color:var(--color-ui-gray-5);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-main-border { --shadow-border-color:var(--color-ui-primary);background-color:transparent;color:var(--color-ui-primary);--tw-shadow:inset 0 0 0 1px var(--shadow-border-color);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-main-border:focus,.base-button.appearance-main-border:hover { background-color:var(--color-ui-primary-10) }
.base-button.appearance-main-border:focus-visible { outline-color:var(--color-ui-primary-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-main-border:disabled { background-color:transparent;color:var(--color-ui-gray-4);--tw-shadow:inset 0 0 0 1px var(--shadow-border-color-disabled);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-avatar,.base-button.appearance-none { background-color:transparent;border-style:none }
.base-button.appearance-passive { background-color:var(--color-ui-white);color:var(--color-ui-gray-1);--tw-shadow:inset 0 0 0 1px var(--shadow-border-color);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-passive:hover { --tw-shadow:inset 0 0 0 1px var(--shadow-border-color-hover);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color) }
.base-button.appearance-passive:focus,.base-button.appearance-passive:hover { background-color:var(--color-ui-gray-3-10);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-passive:focus { --tw-shadow:inset 0 0 0 1px var(--shadow-border-color-focus);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color) }
.base-button.appearance-passive:focus-visible { outline-color:var(--color-ui-gray-2-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-passive:disabled { background-color:transparent;color:var(--color-ui-gray-4);--tw-shadow:inset 0 0 0 1px var(--shadow-border-color-disabled);--tw-shadow-colored:inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-danger { background-color:var(--color-ui-red);border-style:none;color:var(--color-ui-white);transition-duration:.2s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1) }
.base-button.appearance-danger:focus,.base-button.appearance-danger:hover { opacity:.8 }
.base-button.appearance-danger:focus-visible { outline-color:var(--color-ui-red-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-danger:disabled { background-color:var(--color-ui-gray-5);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-danger-border { background-color:transparent;border-color:var(--color-ui-red);border-width:1px;color:var(--color-ui-red) }
.base-button.appearance-danger-border:focus,.base-button.appearance-danger-border:hover { background-color:var(--color-ui-red-10) }
.base-button.appearance-danger-border:focus-visible { outline-color:var(--color-ui-red-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-danger-border:disabled { background-color:transparent;border-color:var(--color-ui-gray-shadow);color:var(--color-ui-gray-4) }
.base-button.appearance-branded { background-color:var(--color-branded-profile-primary);border-color:var(--color-branded-profile-primary);border-width:1px;color:var(--color-branded-profile-text-primary);transition-duration:.2s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1) }
.base-button.appearance-branded:focus,.base-button.appearance-branded:hover { opacity:.8 }
.base-button.appearance-branded:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-font-black);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-branded-outline { background-color:var(--color-ui-white);border-color:var(--color-branded-profile-primary);border-width:1px;color:var(--color-branded-profile-primary) }
.base-button.appearance-branded-outline:hover { background-color:var(--color-branded-profile-primary);color:var(--color-ui-white) }
.base-button.appearance-branded-outline:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-font-black);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-branded-secondary-outline { border-color:var(--color-ui-checkbox);border-width:1px;color:var(--color-font-black) }
.base-button.appearance-branded-secondary-outline:hover { background-color:var(--color-branded-profile-primary);border-color:var(--color-branded-profile-primary);color:var(--color-ui-white) }
.base-button.appearance-branded-secondary-outline:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-font-black);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-menu { background-color:var(--color-ui-gray-bg);color:var(--color-font-black) }
.base-button.appearance-menu:focus-visible { --tw-shadow:0 0 0 1px #fff,0 0 0 3px var(--color-ui-blue-60);--tw-shadow-colored:0 0 0 1px var(--tw-shadow-color),0 0 0 3px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
.base-button.appearance-success { background-color:var(--color-ui-green);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-success:focus,.base-button.appearance-success:hover { opacity:.8 }
.base-button.appearance-success:focus-visible { outline-color:var(--color-ui-green-60);outline-offset:2px;outline-style:solid;outline-width:2px }
.base-button.appearance-success:disabled { background-color:var(--color-ui-gray-5);border-style:none;color:var(--color-ui-white) }
.base-button.appearance-success-border { background-color:transparent;border-color:var(--color-ui-green);border-width:1px;color:var(--color-ui-green) }
.base-button.appearance-success-border:focus,.base-button.appearance-success-border:hover { background-color:var(--color-ui-green-10) }
.base-button.appearance-success-border:focus-visible { outline-color
/* … полный текст: ui/components/buttons.css */
```

## Ограничения

- Появление `appearance-avatar` и `appearance-ghost` в CSS не подтверждено ни одной story: они существуют в стилях, но в `argTypes` их нет. Использовать можно, но это не документированный публичный вариант.
- `--color-branded-profile-*` в сборке не определены: варианты `branded*` подставляют цвет компании во время выполнения. В витрине показаны с подставленным примерным цветом, помеченным как демонстрационный.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/base-button/base-button.stories.ts`
- Storybook `career-web`: `common-buttons-basebutton--primary-button`, `common-buttons-basebutton--affixes-button`
- CSS: секция `base-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
