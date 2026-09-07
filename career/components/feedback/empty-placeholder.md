# EmptyPlaceholder · Пустое состояние

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | `empty-placeholder` |
| **CSS** | `ui/components/feedback.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 6 из 6 |

## Назначение

Единый компонент пустого состояния Career: иллюстрация, заголовок, пояснение и необязательное действие. Через него сделаны все «ничего не найдено» в переписке, и он же годится для любого пустого списка.

## Анатомия

```
div.hidden
  img.ml-4.mt-3
div.h-full.pb-[44px]
  div.empty-placeholder.empty-placeholder--fullWidth.empty-placeholder--noBorder.empty-placeholder--fullHeight
    img.empty-placeholder__image
    div.empty-placeholder__title
      · «Нет диалогов»
    div.empty-placeholder__description
      · «Вы можете найти собеседников в списке сп…»
    div.empty-placeholder__actions
      a.base-button.inline-flex.appearance-main.size-l.is-sizeable  [href="/resumes" target="_self"]
        span.base-button__inner
          span.base-button__content
            · «В раздел специалистов»
```

_Разметка story `conversations-list-noconversations--full-view`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Семантическое состояние компонента — `empty`. Интерактивные состояния возможной CTA принадлежат Button/Link, а не контейнеру EmptyPlaceholder.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `narrowView` | boolean | — | — | `boolean` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

Компонент реагирует на: `(min-width:480px) and (max-width:767px)`, `(max-width:479px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Иллюстрация — отдельный `img`, а не фон. Реальные файлы Career сохранены в `ui/assets/illustrations/`.
- Блок действий (`__actions`) необязателен: у состояния «ничего не найдено» кнопки нет, у «нет диалогов» — есть.

## Разметка

```html
<div class="hidden">
  <img src="../../ui/assets/illustrations/no-conversations.svg" alt="Нет диалогов" width="48" height="48" class="ml-4 mt-3">
</div>
<div class="h-full pb-[44px]">
  <div class="empty-placeholder empty-placeholder--fullWidth empty-placeholder--noBorder empty-placeholder--fullHeight">
    <img src="../../ui/assets/illustrations/no-conversations.svg" alt width="96" height="96" class="empty-placeholder__image">
    <div class="empty-placeholder__title">Нет диалогов</div>
    <div class="empty-placeholder__description">Вы можете найти собеседников в списке специалистов.</div>
    <div class="empty-placeholder__actions">
      <a href="/resumes" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable">
        <span class="base-button__inner">
          <span class="base-button__content">В раздел специалистов</span>
        </span>
      </a>
    </div>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.empty-placeholder { background:var(--color-ui-white);border:1px solid rgba(24,46,57,.1);border-radius:24px;margin:0 auto;max-width:480px;padding:48px 24px 40px;text-align:center }
.empty-placeholder--noBorder { border:none }
.empty-placeholder--fullWidth { max-width:100%;width:100% }
.empty-placeholder--fullHeight { align-items:center;display:flex;flex-direction:column;height:100%;justify-content:center;max-height:100% }
.empty-placeholder--embed { border-radius:0;height:auto;padding:24px }
.empty-placeholder__image { display:block;margin:0 auto 24px }
.empty-placeholder__title { font-size:18px;font-weight:600;line-height:23px;margin-bottom:8px }
.empty-placeholder__description { color:var(--color-font-gray);font-size:14px;line-height:20px }
.empty-placeholder__actions { align-items:center;display:flex;gap:8px;justify-content:center;margin-top:16px }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/conversations/no-conversations.stories.ts`, `./src/components/conversations/no-conversations-found.stories.ts`, `./src/components/conversations/no-messages.stories.ts`, `./src/components/conversations/conversation-not-selected.stories.ts`
- Storybook `career-web`: `conversations-list-noconversations--full-view`, `conversations-list-noconversations--narrow-view`, `conversations-list-noconversationsfound--not-found`, `conversations-list-noconversationsfound--narrow-view`, `conversations-messages-nomessages--empty`, `conversations-layout-conversationnotselected--default`
- CSS: секция `empty-placeholder` в `ui/components/feedback.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

EmptyPlaceholder рендерится вместо пустой коллекции и содержит короткий заголовок, объяснение и не более одного основного действия. Иллюстрация обычно декоративна (`alt=""`), поскольку смысл уже выражен текстом.

Для изначально пустой страницы live-role не нужен. Если результат стал `empty` после действия пользователя, контейнер может получить `role="status"`; фокус при этом не переносится. «Нет данных», «ничего не найдено» и «ошибка загрузки» — разные состояния: ошибка использует Notification/ErrorState, не EmptyPlaceholder.
