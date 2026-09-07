# RoundedArrowButton · Кнопка со стрелкой

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `rounded-arrow-button` |
| **CSS** | `ui/state-contract.css` + utility-классы production snapshot |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Кнопка-стрелка с подписью для перехода вперёд или назад: карусели, промо-блоки, брендированные страницы компаний. Направление и оформление задаются props.

## Анатомия

```
a.rounded-arrow-button.flex.h-10.w-10.items-center.justify-center.rounded-full.border  [aria-label="Example" href="https://google.com" target="_blank"]
  svg.svg-icon.shrink-0.fill-current.transition-all
    use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#arrow-left-rounded"]
```

_Разметка story `common-buttons-roundedarrowbutton--rounded-arrow-button-story`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Production snapshot подтверждает `default` и `hover`: подложка и рамка получают
branded primary, текст становится белым. UI kit дополняет контракт:

| Состояние | Контракт |
|---|---|
| `default` | ссылка с `href` и доступным именем |
| `hover` | `:hover`, branded background/border и белая иконка |
| `focus-visible` | `:focus-visible`, видимый focus ring |
| `pressed` | `:active`; `.is-pressed` только для story/визуальных тестов |
| `disabled` | без `href`, `aria-disabled="true"`; обработчик блокирует click |

`aria-disabled` сам по себе не блокирует событие. Реализация обязана удалить
`href` и не выполнять переход; disabled-ссылка не должна открывать новую вкладку.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `title` | string | — | — | `text` |
| `link` | string | — | — | `text` |
| `direction` | "right" \| "below" | — | left · right | `radio` |
| `appearance` | "branded-outline" \| "branded" \| "branded-white" \| "branded-white-secondary" | — | branded-outline · branded · branded-white | `radio` |
| `linkTarget` | "_blank" | — | _blank | `check` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-branded-profile-primary` | — | задаётся компонентом или средой, значения в сборке нет |
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-checkbox` | `#666` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#arrow-left-rounded` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

У icon-only ссылки обязательно доступное имя через `aria-label`. Для
`target="_blank"` задаётся `rel="noopener noreferrer"`. Disabled-вариант не
должен иметь `href` и получает `aria-disabled="true"`.

## Разметка

```html
<a href="https://google.com" title="Example" aria-label="Example" rel="noopener noreferrer" class="rounded-arrow-button flex h-10 w-10 transform items-center justify-center rounded-full border border-ui-gray-5 text-center transition-all border-icon-gray bg-transparent hover:bg-branded-profile-primary hover:border-branded-profile-primary hover:text-ui-white text-ui-checkbox rotate-180" target="_blank">
  <svg class="svg-icon shrink-0 fill-current transition-all" width="24" height="24" style="width: 24px; height: 24px;">
    <use xlink:href="../../ui/assets/icons/sprite.svg#arrow-left-rounded"/>
  </svg>
</a>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

Production snapshot собран utility-классами. Для новых реализаций стабильный
root и недостающие состояния определены в `ui/state-contract.css`.

## Ограничения

- В production snapshot вид собран утилитами; UI kit добавляет стабильный root и
  состояния в `ui/state-contract.css`. Варианты `branded*` по-прежнему зависят
  от цвета компании, который в сборке не определён.

## Источники

- Файлы в репозитории `career-web`: `./src/components/buttons/rounded-arrow-button/rounded-arrow-button.stories.ts`
- Storybook `career-web`: `common-buttons-roundedarrowbutton--rounded-arrow-button-story`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
