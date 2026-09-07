# TransitionFade · Появление затуханием

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | — |
| **CSS** | `ui/components/feedback.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Стандартный переход появления и исчезновения. Применяется к выпадающим блокам, модальным окнам и уведомлениям.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

_Компонент не обращается к переменным напрямую._

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.transition-fade-enter-active,.transition-fade-leave-active { transition:.2s;transition-property:opacity }
.transition-fade-enter-from,.transition-fade-leave-to { opacity:0 }
```

## Ограничения

- Собственных story нет — данные из CSS.

## Источники

- Storybook `career-web`: 
- CSS: секция `transition-fade` в `ui/components/feedback.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

TransitionFade — motion primitive без собственных UI states и без семантики. Классы `enter-from`, `enter-active`, `leave-active`, `leave-to` описывают фазы перехода, а не публичные состояния компонента.

Не задерживайте удаление focusable content после закрытия. Accessibility state (`hidden`, mount/unmount, `aria-expanded`) меняется вместе с логическим состоянием, независимо от opacity. При `prefers-reduced-motion: reduce` длительность сокращается до практически мгновенной.
