# UnreadCounter · Счётчик непрочитанного

| | |
|---|---|
| **Категория** | Метки и статусы |
| **Корневой класс** | `unread-counter`, `min-w-[20px]`, `rounded-[22px]` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 5 из 5 |

## Назначение

Круглый счётчик непрочитанных сообщений на карточке отклика и в навигации.

## Анатомия

```
span.unread-counter.inline-flex.h-5.min-w-[20px].items-center.justify-center.rounded-[22px].border-2.border-ui-white.bg-ui-primary.px-[5px].text-center.text-unread.font-semibold.leading-unread.text-ui-white
  · «0»
```

_Разметка story `conversations-list-unreadcounter--zero`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Компонент имеет только визуальное состояние `default`; значение счётчика является данными, а не UI state.

## Слоты

- `default`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `counter` | number | — | — | `number` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-primary` | `#8164f7` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<span class="unread-counter inline-flex h-5 min-w-[20px] items-center justify-center rounded-[22px] border-2 border-ui-white bg-ui-primary px-[5px] text-center text-unread font-semibold leading-unread text-ui-white">0</span>
```

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Собственного CSS нет: компонент собран утилитами.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/unread-counter.stories.ts`
- Storybook `career-web`: `conversations-list-unreadcounter--zero`, `conversations-list-unreadcounter--one`, `conversations-list-unreadcounter--five`, `conversations-list-unreadcounter--ninety-nine`, `conversations-list-unreadcounter--large-number`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт base scope

Стабильный root — `unread-counter`. При `counter=0` компонент обычно не рендерится; если место нужно сохранить, он скрывается через `aria-hidden="true"`. Визуальное значение ограничивается `99+`, доступное имя сохраняет точное число и контекст, например `aria-label="124 непрочитанных сообщения"`.

Счётчик внутри ссылки/кнопки может быть `aria-hidden="true"`, если доступное имя родителя уже включает число. Не назначайте live-region каждому badge; объявления обновлений принадлежат контейнеру сообщений.
