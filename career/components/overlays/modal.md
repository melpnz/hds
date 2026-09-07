# Modal · BaseModal

| | |
|---|---|
| **Категория** | Оверлеи |
| **Корневой класс** | `base-modal` — в CSS есть, но в снятой story его нет: окно живёт в портале, снялась только кнопка-триггер |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 6 из 6 |

## Назначение

Модальное окно Career: подложка, панель с заголовком, телом и подвалом. Через него сделаны все диалоги — подтверждения, оценки, выбор из списка.

## Анатомия

```
div.min-h-[360px].bg-ui-gray-bg.p-6
  button.base-button.inline-flex.appearance-main.size-l.is-sizeable  [type="button" target="_self"]
    span.base-button__inner
      span.base-button__content
        · «Открыть модалку»
```

_Разметка story `companies-cp-vacancyimports-groupsmodal--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `groups` | VacancyImportGroup[] | — | — | `object` |
| `unpublishedVacanciesLink` | string | — | — | `text` |
| `loading` | boolean | — | — | `boolean` |
| `close` | other | — | — | `object` |
| `import-groups` | Array | — | — | `object` |
| `open` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--base-modal-header-border-color` | — | задаётся компонентом или средой, значения в сборке нет |
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3` | `#7996a5` | из `:root` Career |
| `--color-ui-gray-5` | `#d4dee2` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-gray-light` | `#f7f7f7` | из `:root` Career |
| `--color-ui-gray-overlay` | `rgba(213,222,226,.8)` | из `:root` Career |
| `--color-ui-gray-shadow` | `rgba(24,46,57,.1)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#button-loader` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#minus-circle` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#star-small` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:1023px)`, `(max-width:767px)`, `(max-width:479px)`.

## Доступность

Атрибуты, встречающиеся в реальной разметке: `aria-label="Загрузка"`.

## Поведение

- Цвет разделителя шапки — переменная компонента `--base-modal-header-border-color`: окно может убрать линию, не меняя классы.
- Подложка вынесена в отдельный компонент `modal-overlay`, поэтому одна и та же подложка используется и меню в мобильном виде.

## Разметка

```html
<div class="min-h-[360px] bg-ui-gray-bg p-6">
  <button type="button" target="_self" class="base-button inline-flex appearance-main size-l is-sizeable">
    <span class="base-button__inner">
      <span class="base-button__content">Открыть модалку</span>
    </span>
  </button>
</div>
```

## CSS

```css
.base-modal { --base-modal-header-border-color:var(--color-ui-gray-shadow) }
.base-modal__header { align-items:center;background-color:var(--color-ui-white);border-bottom:1px solid var(--base-modal-header-border-color);border-radius:24px 24px 0 0;color:var(--color-font-black);display:flex;position:relative }
.base-modal__header--has-before { border-top-left-radius:0;border-top-right-radius:0 }
.base-modal__header--appearance-new { background-color:var(--color-ui-white);border-bottom:0 }
.base-modal__header--alignment-right { border-radius:0 }
.base-modal__title { flex:1 1;font-size:20px;font-weight:600;line-height:24px;margin:0;padding:24px }
.base-modal__title--titleSize-small { font-size:16px }
.base-modal__title--appearance-new { font-size:20px;font-weight:600;line-height:24px;padding:24px }
.base-modal__close { align-items:center;background-color:transparent;border:none;border-radius:0;box-sizing:content-box;cursor:pointer;display:flex;font:inherit;height:72px;justify-content:center;outline:0;padding:0;right:0;text-align:inherit;width:72px }
.base-modal__close svg { color:var(--color-ui-gray-2) }
.base-modal__wrapper { align-items:flex-start;display:flex;justify-content:center;margin:100px auto }
.base-modal__wrapper--appearance-new { align-items:start;display:grid;grid-template-columns:minmax(0,590px);margin:auto }
.base-modal__wrapper--alignment-right { background:var(--color-ui-white);height:100dvh;margin:0 0 0 auto }
.base-modal__box { border-radius:24px;box-shadow:0 1px 15px #0003;min-width:600px;overflow:hidden;transform:translateZ(0) }
.base-modal__box--appearance-new { border-radius:24px;box-shadow:none }
.base-modal__box--size-medium { margin:0 auto;max-width:480px;min-width:480px }
.base-modal__wrapper--appearance-new:has(.base-modal__box--size-medium) { grid-template-columns:minmax(0,750px) }
.base-modal__wrapper--appearance-new:has(.base-modal__box--size-auto) { grid-template-columns:auto }
.base-modal__box--size-small { margin:0 auto;max-width:480px;min-width:400px }
.base-modal__box--size-tiny { margin:0 auto;max-width:320px;min-width:320px }
.base-modal__box--size-auto { margin:0 auto;max-width:100dvw;min-width:auto }
.base-modal__box--alignmeng-right { border-radius:0 }
.base-modal__content { background-color:var(--color-ui-white);display:flex;flex:1 1;flex-direction:column }
.base-modal__content--appearance-new { gap:24px }
.base-modal__footer { background-color:var(--color-ui-gray-light);padding:14px }
.base-modal__footer--appearance-new { background-color:var(--color-ui-white);border-top:0;padding:24px }
.base-modal__sausage { align-items:center;display:none;height:20px;justify-content:center;position:relative }
.base-modal__sausage:before { background-color:var(--color-ui-white);border-radius:4px;content:"";height:4px;width:64px }
.base-modal__sausage:after { bottom:-10px;content:"";left:0;position:absolute;right:0;top:-10px }
.base-modal:has(+.base-modal .base-modal__wrapper) .base-modal__wrapper { visibility:hidden }
.base-modal__content .simplebar-content { padding:8px!important }
.modal-overlay { background-color:var(--color-ui-gray-overlay);bottom:0;display:flex;left:0;overflow-y:auto;position:fixed;right:0;top:0;z-index:2147483646 }
.modal-overlay-enter-from,.modal-overlay-leave-to { opacity:0 }
.modal-overlay-enter-to,.modal-overlay-leave-from { opacity:1 }
.modal-overlay-enter-active,.modal-overlay-leave-active { transition:opacity .25s }
@media (max-width:1023px) {
  .base-modal__close { position:absolute;top:50%;transform:translateY(-50%) }
  .base-modal__header--appearance-default { background:var(--color-ui-white);border-radius:0;margin:0 }
  .base-modal__title--appearance-default { padding:24px;text-align:center }
  .base-modal__wrapper--appearance-default { margin:0;min-width:100% }
  .base-modal__box--appearance-default { background:var(--color-ui-white);border-radius:0;box-shadow:none;display:flex;flex-direction:column;max-height:100dvh;min-height:100%;min-width:100%;overflow:auto }
  .base-modal__content--appearance-default { background:var(--color-ui-white);display:flex;flex:1 1;flex-direction:column;gap:12px;padding:8px 8px 0 }
  .base-modal__header--appearance-default:has(.base-modal__title--titleSize-small) { background:var(--color-ui-white);border-bottom:1px solid var(--color-ui-gray-bg);margin:0;min-height:72px;padding:24px }
  .base-modal__title--appearance-default.base-modal__title--titleSize-small { font-size:20px;line-height:24px;padding:0 40px;text-align:center }
  .base-modal__header--appearance-default:has(.base-modal__title--titleSize-small) .base-modal__close { height:24px;padding:0;right:24px;width:24px }
  .base-modal__header--appearance-default:has(.base-modal__title--titleSize-small) .base-modal__close svg { fill:var(--color-ui-gray-2) }
}
@media (max-width:767px) {
  .base-modal__wrapper--alignment-right { grid-template-columns:minmax(0,100dvw);margin:0 }
}
@media (max-width:479px) {
  .base-modal__wrapper--appearance-new { align-items:end;grid-template-rows:1fr;margin:0;transition:transform .05s ease-in-out,opacity .15s ease-in-out }
  .base-modal__wrapper--appearance-new:has(.base-modal__box--size-auto) { margin:auto }
  .base-modal__box--appearance-new { border-radius:24px 24px 0 0;box-shadow:none;margin:0;max-height:calc(100dvh - 20px);max-width:100%;min-width:100%;overflow:auto }
  .base-modal__footer--appearance-new { border-top:1px solid transparent;bottom:0;left:0;padding:16px 24px;position:sticky;right:0 }
  .base-modal__footer--stuck { border-top-color:var(--color-ui-gray-5) }
  .base-modal__sausage { display:flex }
  .base-modal__wrapper--alignment-right .base-modal__sausage,.base-modal__wrapper--appearance-default .base-modal__sausage { display:none }
  .base-modal__box--alignment-right { border-radius:0;box-shadow:none;margin:0;max-height:100dvh;max-width:100dvw;min-width:100dvw;overflow:hidden }
}
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/companies/cp/vacancy-imports/cp-vacancy-import-groups-modal.stories.ts`, `./src/components/conversations/conversation-complete-consultation-modal.stories.ts`, `./src/components/conversations/conversation-report-failed-consultation-modal.stories.ts`, `./src/components/conversations/conversation-score-consultation-modal.stories.ts`, `./src/components/conversations/files/conversation-not-uploaded-files-modal.stories.ts`
- Storybook `career-web`: `companies-cp-vacancyimports-groupsmodal--default`, `companies-cp-vacancyimports-groupsmodal--loading`, `conversations-modals-conversationcompleteconsultationmodal--default`, `conversations-modals-conversationreportfailedconsultationmodal--default`, `conversations-modals-conversationscoreconsultationmodal--default`, `conversations-files-conversationnotuploadedfilesmodal--default`
- CSS: секция `base-modal` в `ui/components/overlays.css`, секция `modal-overlay` в `ui/components/overlays.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

Закрытый (`closed`) Modal отсутствует из accessibility tree (`hidden`/не смонтирован). Открытый (`open`) контейнер имеет `role="dialog"`, `aria-modal="true"` и `aria-labelledby` либо `aria-label`. При `loading` корень получает `aria-busy="true"`, а действия блокируются без удаления заголовка и статуса из accessibility tree.

При открытии фокус переходит на первый логичный элемент (не всегда на крестик), Tab остаётся внутри окна, Escape закрывает, после закрытия фокус возвращается триггеру. Фоновый документ становится inert. Клик по подложке закрывает только безопасные, недеструктивные диалоги. Для анимации соблюдайте `prefers-reduced-motion`.
