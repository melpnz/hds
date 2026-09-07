# Переменные Career

Полный разбор CSS-переменных продукта. Значения взяты из сборки `career-web`
без изменений; сам файл — [`../ui/tokens.css`](../ui/tokens.css).

## Что где объявлено

Career держит переменные в трёх блоках `:root` одного файла, и это важно:

| Блок | Переменных | Что в нём |
|---|---|---|
| основной | 117 | вся палитра, рамки, тени, размеры оболочки |
| внутри `@media (max-width: 767px)` | 1 | `--header-height: 144px` вместо 112 |
| поздний | 3 | семантические алиасы `--color-gray-background`, `--color-text-main`, `--color-links-main` |

Итого **121 переменная**.

## Классификация

| Статус | Сколько | Что значит |
|---|---|---|
| **USED** | 80 | переменная реально нужна компонентам этого пакета |
| **AVAILABLE** | 40 | существует в Career, здесь пока не используется |
| **COMPONENT-LOCAL** | 7 | не токен: компонент задаёт значение сам, инлайновым стилем |
| **RUNTIME** | 4 | значение подставляет страница во время работы, в CSS его нет |
| **UNKNOWN** | 8 | имя известно, значение в сборке не объявлено |

Разделение важно, потому что три последние категории **не являются токенами Career**.
Компонентные переменные — это публичный API компонента, runtime-переменные —
точка расширения для брендированных страниц, а UNKNOWN — следы соседнего слоя
дизайн-системы Хабра, до которого career-web дотягивается, но который в его сборку не входит.

## Устройство палитры

Career не хранит полупрозрачные цвета отдельными значениями. Все производные
выводятся из базовых через `color-mix`:

```css
--color-ui-primary: #8164f7;
--color-ui-primary-10: color-mix(in srgb, var(--color-ui-primary) 10%, transparent);
--color-ui-primary-60: color-mix(in srgb, var(--color-ui-primary) 60%, transparent);
```

Суффикс — это процент непрозрачности. Приём принадлежит Career: смена базового
цвета автоматически меняет все его производные. При переносе значений
в другой формат эту связь нужно сохранять, а не разворачивать в плоские hex.

Второй приём — семантические алиасы поверх палитры:

```css
--color-font-black: var(--color-ui-gray-1);
--color-font-link:  var(--color-ui-blue-accent);
--shadow-border-color: var(--color-ui-gray-5);
```

Компоненты почти всегда обращаются к алиасу, а не к палитре напрямую.

## Полный список

### Ахроматика

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-white` | `#fff` | USED |
| `--color-ui-white-10` | `color-mix(in srgb,var(--color-ui-white) 10%,transparent)` | AVAILABLE |
| `--color-ui-white-24` | `color-mix(in srgb,var(--color-ui-white) 24%,transparent)` | AVAILABLE |
| `--color-ui-white-60` | `color-mix(in srgb,var(--color-ui-white) 60%,transparent)` | USED |
| `--color-ui-white-70` | `color-mix(in srgb,var(--color-ui-white) 70%,transparent)` | AVAILABLE |
| `--color-ui-white-80` | `color-mix(in srgb,var(--color-ui-white) 80%,transparent)` | AVAILABLE |
| `--color-ui-black` | `#000` | USED |
| `--color-ui-black-20` | `color-mix(in srgb,var(--color-ui-black) 20%,transparent)` | USED |

### Серая шкала

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-gray` | `#ccc` | USED |
| `--color-ui-gray-bg` | `#ededed` | USED |
| `--color-ui-gray-bg-60` | `color-mix(in srgb,var(--color-ui-gray-bg) 60%,transparent)` | USED |
| `--color-ui-checkbox` | `#666` | USED |
| `--color-ui-gray-light` | `#f7f7f7` | USED |
| `--color-ui-gray-dark` | `#303b44` | USED |
| `--color-header-gray-bg` | `#f3f3f3` | USED |
| `--color-ui-asphalt` | `#1f2225` | AVAILABLE |
| `--color-ui-gray-1` | `#1b272c` | USED |
| `--color-ui-gray-2` | `#55798b` | USED |
| `--color-ui-gray-2-60` | `color-mix(in srgb,var(--color-ui-gray-2) 60%,transparent)` | USED |
| `--color-ui-gray-3` | `#7996a5` | USED |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | USED |
| `--color-ui-gray-3-20` | `color-mix(in srgb,var(--color-ui-gray-3) 20%,transparent)` | USED |
| `--color-ui-gray-4` | `#a6bdc9` | USED |
| `--color-ui-gray-4-20` | `color-mix(in srgb,var(--color-ui-gray-4) 20%,transparent)` | USED |
| `--color-ui-gray-4-30` | `color-mix(in srgb,var(--color-ui-gray-4) 30%,transparent)` | USED |
| `--color-ui-gray-5` | `#d4dee2` | USED |
| `--color-ui-gray-6` | `#eaf2f5` | USED |
| `--color-ui-gray-7` | `#f8fbfc` | USED |
| `--color-ui-gray-overlay` | `rgba(213,222,226,.8)` | USED |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | USED |
| `--color-ui-chevron` | `#5a7887` | AVAILABLE |

### Фирменный фиолетовый

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-primary` | `#8164f7` | USED |
| `--color-ui-primary-light` | `#9787fd` | USED |
| `--color-ui-primary-10` | `color-mix(in srgb,var(--color-ui-primary) 10%,transparent)` | USED |
| `--color-ui-primary-20` | `color-mix(in srgb,var(--color-ui-primary) 20%,transparent)` | USED |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | USED |
| `--color-ui-primary-accent` | `#5014f5` | USED |

### Статусные цвета

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-blue` | `#1ba1ee` | USED |
| `--color-ui-blue-accent` | `#0464d2` | USED |
| `--color-ui-blue-30` | `color-mix(in srgb,var(--color-ui-blue) 30%,transparent)` | AVAILABLE |
| `--color-ui-blue-60` | `color-mix(in srgb,var(--color-ui-blue) 60%,transparent)` | USED |
| `--color-ui-blue-10` | `color-mix(in srgb,var(--color-ui-blue) 10%,transparent)` | USED |
| `--color-ui-blue-overlay` | `#ebefff` | USED |
| `--color-ui-blue-08` | `color-mix(in srgb,var(--color-ui-blue) 8%,transparent)` | AVAILABLE |
| `--color-ui-red` | `#f8651b` | USED |
| `--color-ui-red-10` | `color-mix(in srgb,var(--color-ui-red) 10%,transparent)` | USED |
| `--color-ui-red-overlay` | `color-mix(in srgb,var(--color-ui-red) 12%,transparent)` | USED |
| `--color-ui-red-20` | `color-mix(in srgb,var(--color-ui-red) 20%,transparent)` | AVAILABLE |
| `--color-ui-red-60` | `color-mix(in srgb,var(--color-ui-red) 60%,transparent)` | USED |
| `--color-ui-red-light` | `#fc9069` | USED |
| `--color-ui-red-second` | `var( --color-ui-red-light )` | USED |
| `--color-ui-green-10` | `color-mix(in srgb,var(--color-ui-green) 10%,transparent)` | USED |
| `--color-ui-green-60` | `color-mix(in srgb,var(--color-ui-green) 60%,transparent)` | USED |
| `--color-ui-green-20` | `color-mix(in srgb,var(--color-ui-green) 20%,transparent)` | USED |
| `--color-ui-green-12` | `color-mix(in srgb,var(--color-ui-green) 12%,transparent)` | USED |
| `--color-ui-green-overlay` | `#ecf8ef` | USED |
| `--color-ui-green-light` | `#70d781` | AVAILABLE |
| `--color-ui-orange` | `#fdad0d` | USED |
| `--color-ui-orange-10` | `color-mix(in srgb,var(--color-ui-orange) 10%,transparent)` | USED |
| `--color-ui-orange-12` | `color-mix(in srgb,var(--color-ui-orange) 12%,transparent)` | USED |
| `--color-ui-orange-20` | `color-mix(in srgb,var(--color-ui-orange) 20%,transparent)` | AVAILABLE |
| `--color-ui-green` | `#3dc24a` | USED |
| `--color-ui-green-accent` | `#00ad3a` | USED |
| `--color-ui-green-dark` | `#0c8326` | USED |
| `--color-ui-yellow-light` | `#fdf0bb` | AVAILABLE |
| `--color-ui-orange-accent` | `#fd8f0d` | USED |
| `--color-ui-orange-dirty` | `var(--color-ui-orange-accent)` | USED |
| `--color-ui-orange-dirty-12` | `color-mix(in srgb,var(--color-ui-orange-dirty) 12%,transparent)` | USED |
| `--color-ui-blue-light` | `#80d5fa` | AVAILABLE |
| `--color-ui-turquoise` | `#0db3d3` | USED |
| `--color-ui-turquoise-10` | `color-mix(in srgb,var(--color-ui-turquoise) 10%,transparent)` | USED |

### Дополнительные оттенки

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-purple` | `#b574e7` | USED |
| `--color-ui-pink` | `#da6cc4` | USED |
| `--color-ui-purple-20` | `color-mix(in srgb,var(--color-ui-purple) 20%,transparent)` | USED |
| `--color-ui-purple-70` | `color-mix(in srgb,var(--color-ui-purple) 70%,transparent)` | AVAILABLE |
| `--color-ui-purple-light-dirty` | `#d4dee2` | AVAILABLE |
| `--color-ui-purple-light` | `#fff` | AVAILABLE |
| `--color-pale-canary` | `#ff9` | AVAILABLE |

### Семантические алиасы

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | USED |
| `--color-icon-gray-overlay` | `color-mix(in srgb,var(--color-ui-gray-2) 30%,transparent)` | USED |
| `--color-icon-gray-60` | `color-mix(in srgb,var(--color-ui-gray-2) 60%,transparent)` | AVAILABLE |
| `--color-font-link` | `var(--color-ui-blue-accent)` | USED |
| `--color-font-black` | `var(--color-ui-gray-1)` | USED |
| `--color-font-black-outline` | `rgba(70,70,70,.6)` | AVAILABLE |
| `--color-font-gray` | `var(--color-ui-gray-2)` | USED |
| `--color-font-gray-12` | `hsla(0,0%,60%,.12)` | AVAILABLE |
| `--color-font-gray-60` | `hsla(0,0%,60%,.6)` | AVAILABLE |
| `--color-text-main` | `var(--color-font-black)` | USED |
| `--color-links-main` | `var(--color-font-link)` | AVAILABLE |

### Графики и иллюстрации

| Переменная | Значение | Статус |
|---|---|---|
| `--color-illustration-green` | `#7fe1ca` | AVAILABLE |
| `--color-illustration-orange` | `#fccb83` | AVAILABLE |
| `--color-illustration-gray` | `#c4ccd4` | AVAILABLE |
| `--color-illustration-red` | `#ffa299` | AVAILABLE |
| `--color-graph-violet` | `#8164f7` | USED |
| `--color-graph-violet-60` | `rgba(151,135,253,.6)` | AVAILABLE |
| `--color-graph-violet-70` | `rgba(151,135,253,.7)` | USED |
| `--color-graph-violet-overlay` | `#8164f7` | AVAILABLE |
| `--color-graph-violet-light` | `#e5b2ff` | AVAILABLE |
| `--color-graph-cyan` | `#83d3fc` | USED |
| `--color-graph-cyan-12` | `color-mix(in srgb,var(--color-graph-cyan) 12%,transparent)` | AVAILABLE |
| `--color-illustrations-purple-light` | `#d9ccff` | AVAILABLE |

### Компонентные цвета

| Переменная | Значение | Статус |
|---|---|---|
| `--color-shadow-overlay-60` | `hsla(207,9%,81%,.6)` | USED |
| `--color-chip-press` | `#b8d5ff` | AVAILABLE |
| `--color-chip-inactive` | `#ebf3ff` | USED |
| `--color-chip-hover` | `var(--color-ui-gray-4)` | AVAILABLE |
| `--color-chip-expert-icon` | `#6161c2` | AVAILABLE |
| `--color-rank-bronze` | `#d1a584` | USED |
| `--color-base-shadow-60` | `hsla(207,9%,81%,.6)` | AVAILABLE |
| `--color-gray-background` | `var(--color-ui-gray-bg)` | AVAILABLE |

### Градиенты

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ai-gradient` | `radial-gradient(110.74% 217.18% at -3.37% -17.02%,#64c178 0%,#74caba 10%,#83d3fc 20%,#8dabfc 50%,#9783fc 80%)` | USED |
| `--color-booster-banner-bg` | `linear-gradient(91deg,var(--color-illustrations-purple-light) 1.26%,var(--color-graph-violet-light) 164.66%)` | AVAILABLE |
| `--color-booster-badge` | `radial-gradient(196.13% 100% at 0% 0%,var(--color-graph-violet-light) 20%,var(--color-graph-violet) 80%)` | AVAILABLE |
| `--color-booster-gradient` | `radial-gradient(circle at 0% 0%,var(--color-ui-orange) 10%,var(--color-ui-pink) 40%,var(--color-ui-primary-light) 80%)` | USED |

### Рамки и тени

| Переменная | Значение | Статус |
|---|---|---|
| `--shadow-border-color` | `var(--color-ui-gray-5)` | USED |
| `--shadow-border-color-hover` | `var(--color-ui-gray-4)` | USED |
| `--shadow-border-color-focus` | `var(--color-ui-gray-4)` | USED |
| `--shadow-border-color-disabled` | `var(--color-ui-gray-shadow)` | USED |
| `--shadow-dropdown` | `0 1px 20px 0 rgba(0,0,0,.2)` | USED |

### Размеры оболочки

| Переменная | Значение | Статус |
|---|---|---|
| `--header-height` | `144px` | AVAILABLE |
| `--fit-screen-height` | `calc(100dvh - var(--header-height) - 24px)` | AVAILABLE |

## Не токены

### COMPONENT-LOCAL — публичный API компонента

| Переменная | Компонент и назначение |
|---|---|
| `--avatar-size` | Avatar — размер, задаётся инлайновым стилем на элементе |
| `--avatar-radius` | Avatar — радиус, `9999px` для человека, малое значение для компании |
| `--textarea--maxRows` | Textarea — предел роста в строках |
| `--pretty-scroll-content-gap` | PrettyScroll — отступ содержимого от полосы |
| `--base-modal-header-border-color` | Modal — цвет разделителя шапки, позволяет убрать линию без смены классов |
| `--notification-accent-color` | Notification — акцентный цвет варианта |
| `--mask-image-url` | маска фонового изображения |

Задаются инлайновым стилем прямо в разметке, например:

```html
<span class="base-avatar" style="--avatar-size: 36px; --avatar-radius: 9999px;">
```

### RUNTIME — подставляются страницей

| Переменная | Что подставляется |
|---|---|
| `--color-branded-profile-primary` | цвет компании на брендированной странице |
| `--color-branded-profile-secondary` | дополнительный цвет компании |
| `--color-branded-profile-text-primary` | цвет текста на фирменном фоне |
| `--color-branded-profile-text-secondary` | дополнительный цвет текста |

На этих переменных построены варианты кнопки `appearance-branded*`. В сборке
значений нет: их выдаёт страница компании. В витрине они показаны с явно помеченным
демонстрационным цветом — это не цвет Career.

### UNKNOWN — имя есть, значения нет

| Переменная | Откуда, предположительно |
|---|---|
| `--loblolly` | имя из старой палитры Хабра |
| `--romance-rgb` | имя из старой палитры Хабра |
| `--font-size-body-l` | типографический токен слоя дизайн-системы Хабра |
| `--font-size-body-s` | типографический токен слоя дизайн-системы Хабра |
| `--font-line-height-body-m` | типографический токен слоя дизайн-системы Хабра |
| `--font-line-height-display-m` | типографический токен слоя дизайн-системы Хабра |
| `--font-weight-regular` | типографический токен слоя дизайн-системы Хабра |
| `--font-letter-spacing-0` | типографический токен слоя дизайн-системы Хабра |

Все они используются с запасным значением — `var(--font-letter-spacing-0, 0)`, —
поэтому их отсутствие ничего не ломает. Дозагружать их неоткуда: они принадлежат
слою дизайн-системы Хабра, а не Career.

Ещё два имени, `--32b2ffb0` и `--32b2ffee`, — не переменные, а сгенерированные
Tailwind хеши для фоновых изображений в произвольных значениях. В `tokens.css` не входят.

## Чего в Career нет

Обратите внимание на отсутствующие категории — это тоже факт о системе:

- **нет переменных отступов.** Отступы задаются утилитами Tailwind (`gap-2`, `p-6`), а не токенами;
- **нет переменных радиусов.** Тоже утилиты: `rounded-lg`, `rounded-3xl`;
- **нет переменных кеглей.** Типографика — классы `text-body-*` / `text-display-*`, см. `ui/foundations.css`;
- **нет переменных теней — есть именованная шкала.** Тени объявлены не в `:root`, а классами
  Tailwind, и переменная `--shadow-dropdown` в `:root` **не совпадает** с одноимённым классом:
  переменная — `0 1px 20px 0 rgba(0,0,0,.2)`, класс — двухслойная мягкая тень. Шкала целиком:

| Класс | Значение | Роль |
|---|---|---|
| `shadow-border` | `inset 0 0 0 1px var(--shadow-border-color)` | рамка, нарисованная тенью — не занимает места в раскладке |
| `shadow-gray-shadow` | `inset 0 0 1px var(--color-ui-gray-shadow)` | едва заметная внутренняя грань |
| `shadow-dropdown` | `0 1px 4px 1px, 0 4px 8px 2px` от `--color-ui-gray-shadow` | выпадающий блок |
| `shadow-float-element` | то же значение | плавающий элемент поверх содержимого |
| `shadow-float-notice` | `0 2px 8px 0 #434b6029` | всплывающее уведомление |
| `shadow-context-menu-dropdown` | `0 1px 20px var(--color-ui-black-20)` | контекстное меню, самая заметная |

  Ступеней всего три: рамка тенью, мягкий подъём, заметный подъём меню.
  Career разделяет плоскости прежде всего рамкой, а тень приберегает для всплывающего;
- **нет тёмной темы.** Ни одного переопределения под `prefers-color-scheme` или `data-theme`.

Придумывать недостающие шкалы не нужно: у Career их действительно нет,
и добавление своей было бы уже новой дизайн-системой, а не описанием этой.
