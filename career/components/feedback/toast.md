# Toast · notify()

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | `min-h-[180px]`, `rounded-xl` |
| **CSS** | `ui/components/feedback.css` |
| **Живая реализация** | частичная |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Всплывающее сообщение в правом верхнем углу. Вызывается функцией `notify(...)`, а не ставится в разметку. Три типа: `notice`, `warning`, `error`.

## Анатомия

```
div.flex.min-h-[180px].flex-col.gap-3.rounded-xl
  p.m-0.text-body-m.text-font-black-60
    · «Тост рендерится через»
    code
      · «notify(...)»
    · «в правом верхнем углу страницы.»
  div
    button.base-button.inline-flex.appearance-main.size-l.is-sizeable  [type="button" target="_self"]
      span.base-button__inner
        span.base-button__content
          · «Показать тост»
```

_Разметка story `common-notifications-toastify--notice`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `type` | string | — | notice · warning · error | `select` |
| `message` | string | — | — | `text` |
| `escapeMarkup` | boolean | — | — | `boolean` |

## Токены

_Компонент не обращается к переменным напрямую._

## Responsive

Компонент реагирует на: `only screen and (max-width:360px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<div class="flex min-h-[180px] flex-col gap-3 rounded-xl">
  <p class="m-0 text-body-m text-font-black-60">
    Тост рендерится через
    <code>notify(...)</code>
    в правом верхнем углу страницы.
  </p>
  <div>
    <button type="button" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable">
      <span class="base-button__inner">
        <span class="base-button__content">Показать тост</span>
      </span>
    </button>
  </div>
</div>
```

## CSS

```css
.toastify { background:linear-gradient(135deg,#73a5ff,#5477f5);border-radius:2px;box-shadow:0 3px 6px -1px #0000001f,0 10px 36px -4px #4d60e84d;color:#fff;cursor:pointer;display:inline-block;max-width:calc(50% - 20px);opacity:0;padding:12px 20px;position:fixed;text-decoration:none;transition:all .4s cubic-bezier(.215,.61,.355,1);z-index:2147483647 }
.toastify.on { opacity:1 }
.toast-close { background:transparent;border:0;color:#fff;cursor:pointer;font-family:inherit;font-size:1em;opacity:.4;padding:0 5px }
.toastify-right { right:15px }
.toastify-left { left:15px }
.toastify-top { top:-150px }
.toastify-bottom { bottom:-150px }
.toastify-rounded { border-radius:25px }
.toastify-avatar { border-radius:2px;height:1.5em;margin:-7px 5px;width:1.5em }
.toastify-center { left:0;margin-left:auto;margin-right:auto;max-width:fit-content;max-width:-moz-fit-content;right:0 }
@media only screen and (max-width:360px) {
  .toastify-left,.toastify-right { left:0;margin-left:auto;margin-right:auto;max-width:-moz-fit-content;max-width:fit-content;right:0 }
}
```

## Ограничения

- В snapshot попал только триггер: сам тост рендерится в портал вне корня story и в момент снятия отсутствует.
- Оформление восстановимо из CSS (`ui/components/feedback.css`, секция `notify`), но не структура DOM.
- ЧЕГО НЕ ХВАТАЕТ: snapshot открытого тоста каждого из трёх типов.

## Источники

- Файлы в репозитории `career-web`: `./src/components/common/toastify.stories.ts`
- Storybook `career-web`: `common-notifications-toastify--notice`, `common-notifications-toastify--warning`, `common-notifications-toastify--error`, `common-notifications-toastify--with-auth-link`
- CSS: секция `notify` в `ui/components/feedback.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Канонические типы: `info` (`notice` — legacy alias), `success`, `warning`, `error`; `default` соответствует `info`. Для нового DOM используйте корень `toast` и модификаторы `toast--*`; `.toastify` остаётся adapter сторонней библиотеки.

Контейнер очереди имеет `aria-live="polite"`; срочная ошибка может использовать `role="alert"`. Не переносите фокус на toast автоматически. Автозакрытие ставится на паузу при hover/focus, длительность увеличивается для длинного текста, постоянный toast получает кнопку с `aria-label="Закрыть уведомление"`. Одновременно показывайте не более трёх сообщений; повторения объединяйте.
