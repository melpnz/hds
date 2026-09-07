# LinkStyledButton · Кнопка-ссылка

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `link-styled-button` |
| **CSS** | `ui/state-contract.css` + utility-классы production snapshot |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Кнопка, выглядящая как ссылка. Нужна для вторичного действия, которое выполняет
операцию на текущем экране, но визуально не должно конкурировать с основной
кнопкой. Для навигации всегда используется `<a>`.

## Анатомия

```
button.link-styled-button.inline-block.text-body-m  [type="button"]
  · «Кнопка выглядящая как ссылка»
```

_Разметка story `common-buttons-linkstyledbutton--link-styled-button-story`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Production snapshot подтверждает `default` и `hover`. UI kit закрывает
недостающие состояния отдельным стабильным root-классом:

| Состояние | Контракт |
|---|---|
| `default` | `<button type="button">` без state-атрибутов |
| `hover` | `:hover`, появляется подчёркивание |
| `focus-visible` | `:focus-visible`, видимый focus ring |
| `pressed` | `:active`; `.is-pressed` только для story/визуальных тестов |
| `disabled` | нативный `disabled`; событие не отправляется |

LinkStyledButton используется только для действий. Для перехода применяется
обычный `<a>` — визуально он может быть таким же, но это не этот компонент.

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `type` | "submit" \| "button" \| "reset" | `'button'` | button · submit · reset | `select` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-blue-accent` | `#0464d2` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

Нативный `<button>` сохраняет keyboard behavior без дополнительных role или
`tabindex`. Disabled задаётся атрибутом `disabled`, не только цветом.

## Разметка

```html
<button class="link-styled-button inline-block text-body-m" type="button">Кнопка выглядящая как ссылка</button>
```

## CSS

Production snapshot собран utility-классами. Для новых реализаций стабильный
контракт находится в `ui/state-contract.css`; `hover:*` utilities больше не
являются публичным API компонента.

## Ограничения

- В production snapshot собственного CSS не было: внешний вид был собран
  утилитами. UI kit добавляет стабильный root и состояния в
  `ui/state-contract.css`.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/link-styled-button/link-styled-button.stories.ts`
- Storybook `career-web`: `common-buttons-linkstyledbutton--link-styled-button-story`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
